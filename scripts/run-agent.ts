import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Agent, CursorAgentError, type AgentOptions } from "@cursor/sdk";

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

function loadPrompt(): string {
  const fromEnv = process.env.AGENT_PROMPT?.trim();
  if (fromEnv) return fromEnv;

  try {
    return readFileSync(defaultPromptPath, "utf8").trim();
  } catch {
    console.error(`Failed to read default prompt at ${defaultPromptPath}`);
    process.exit(1);
  }
}

const prompt = loadPrompt();

function buildAgentOptions(): AgentOptions {
  return {
    apiKey,
    model: { id: "composer-2.5" },
    local: {
      cwd: process.cwd(),
      settingSources: ["agents"],
    },
  };
}

console.log("Using local runtime");

try {
  const result = await Agent.prompt(prompt, buildAgentOptions());

  console.log(`Agent status: ${result.status}`);
  if (result.result) {
    console.log("\n--- Agent response ---\n");
    console.log(result.result);
  }

  if (result.status === "error") {
    process.exit(2);
  }
} catch (err) {
  if (err instanceof CursorAgentError) {
    console.error(`Agent startup failed: ${err.message}`);
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
