import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  Agent,
  CursorAgentError,
  type AgentOptions,
  type Run,
  type RunResult,
} from "@cursor/sdk";
import {
  flushStreamLogs,
  logConversationStep,
  logDebug,
  logError,
  logInfo,
  logInteractionDelta,
  logStreamMessage,
  logWarn,
  resetStreamLogs,
} from "./agent-logger.js";

const apiKey = process.env.CURSOR_API_KEY;
if (!apiKey) {
  console.error("CURSOR_API_KEY is required");
  process.exit(1);
}

const defaultPromptPath = join(
  process.cwd(),
  "prompts",
  "update-giro-2026.md",
);

function resolvePromptPath(): string {
  const fromFile = process.env.AGENT_PROMPT_FILE?.trim();
  if (fromFile) {
    return fromFile.startsWith("/") ? fromFile : join(process.cwd(), fromFile);
  }
  return defaultPromptPath;
}

function loadPrompt(): { text: string; source: string } {
  const fromEnv = process.env.AGENT_PROMPT?.trim();
  if (fromEnv) {
    return { text: fromEnv, source: "AGENT_PROMPT" };
  }

  const promptPath = resolvePromptPath();
  try {
    return {
      text: readFileSync(promptPath, "utf8").trim(),
      source: process.env.AGENT_PROMPT_FILE?.trim()
        ? `AGENT_PROMPT_FILE (${promptPath})`
        : promptPath,
    };
  } catch {
    console.error(`Failed to read prompt at ${promptPath}`);
    process.exit(1);
  }
}

const { text: prompt, source: promptSource } = loadPrompt();

function buildAgentOptions(): AgentOptions {
  return {
    apiKey,
    model: { id: "composer-2.5" },
    local: {
      cwd: process.cwd(),
      settingSources: ["project"],
    },
  };
}

const metricsPath =
  process.env.AGENT_METRICS_FILE?.trim() ||
  join(process.cwd(), "run-metrics", "latest.json");

function writeRunMetrics(result: RunResult, agentId: string): void {
  const metrics = {
    runId: result.id,
    agentId,
    durationMs: result.durationMs ?? null,
    usage: result.usage ?? null,
    model: result.model?.id ?? null,
    status: result.status,
    finishedAt: new Date().toISOString(),
    githubRunId: process.env.GITHUB_RUN_ID ?? null,
    githubWorkflow: process.env.GITHUB_WORKFLOW ?? null,
  };

  mkdirSync(join(metricsPath, ".."), { recursive: true });
  writeFileSync(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
  logInfo("run", "Wrote run metrics", { path: metricsPath });
  console.log(`AGENT_RUN_METRICS_JSON=${JSON.stringify(metrics)}`);
}

async function consumeStream(run: Run): Promise<void> {
  if (!run.supports("stream")) {
    logWarn(
      "stream",
      run.unsupportedReason("stream") ?? "Stream not supported for this run",
    );
    return;
  }

  try {
    for await (const message of run.stream()) {
      logStreamMessage(message);
    }
  } finally {
    flushStreamLogs("stream_closed");
  }
}

logInfo("agent", "Using local runtime");
logInfo("agent", `Prompt source: ${promptSource}`);
logDebug("agent", `Prompt length: ${prompt.length} characters`);

try {
  await using agent = await Agent.create(buildAgentOptions());
  logInfo("agent", `Agent created: ${agent.agentId}`);

  resetStreamLogs();

  const run = await agent.send(prompt, {
    onStep: ({ step }) => {
      logConversationStep(step);
    },
    onDelta: ({ update }) => {
      logInteractionDelta(update);
    },
  });

  logInfo("run", `Run started: ${run.id}`);

  const [result] = await Promise.all([run.wait(), consumeStream(run)]);
  flushStreamLogs("run_finished");

  logInfo("run", `Run finished: ${result.id}`, {
    status: result.status,
    durationMs: result.durationMs,
    usage: result.usage,
  });

  writeRunMetrics(result, agent.agentId);

  if (result.result) {
    console.log("\n--- Agent response ---\n");
    console.log(result.result);
  }

  if (result.status === "error") {
    logError("run", "Agent run ended with error status");
    process.exit(2);
  }
} catch (err) {
  if (err instanceof CursorAgentError) {
    logError("agent", `Startup failed: ${err.message}`, {
      retryable: err.isRetryable,
    });
    if (err.message.includes("Storage mode is disabled")) {
      console.error(`
Your account may block API agent usage. Try enabling regular Privacy Mode
(not Legacy/Ghost) in Cursor → Settings → Privacy, then re-run.

Docs: https://cursor.com/docs/sdk/typescript
`);
    }
    process.exit(1);
  }
  throw err;
}
