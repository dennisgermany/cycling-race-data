import { Agent, CursorAgentError, type AgentOptions } from "@cursor/sdk";

const apiKey = process.env.CURSOR_API_KEY;
if (!apiKey) {
  console.error("CURSOR_API_KEY is required");
  process.exit(1);
}

const prompt =
  process.env.AGENT_PROMPT?.trim() ||
  "Summarize what this repository does based on the README and project structure.";

const runtime = process.env.AGENT_RUNTIME === "cloud" ? "cloud" : "local";

function buildAgentOptions(): AgentOptions {
  const options: AgentOptions = {
    apiKey,
    model: { id: "composer-2.5" },
  };

  if (runtime === "cloud") {
    const repository = process.env.GITHUB_REPOSITORY;
    if (!repository) {
      console.error("GITHUB_REPOSITORY is required for cloud runtime");
      process.exit(1);
    }

    const startingRef = process.env.GITHUB_REF_NAME ?? "main";
    options.cloud = {
      repos: [{ url: `https://github.com/${repository}`, startingRef }],
      skipReviewerRequest: true,
    };
  } else {
    options.local = {
      cwd: process.cwd(),
      settingSources: [],
    };
  }

  return options;
}

console.log(`Using ${runtime} runtime`);

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
      if (runtime === "cloud") {
        console.error(`
Cloud agents require Cursor storage to be enabled on your account.

Fix:
1. Open Cursor → Settings → Privacy (or Advanced)
2. Switch away from "Privacy Mode (Legacy)" / "Ghost Mode" / "No-Storage Mode"
3. Use regular Privacy Mode (temporary storage for agent runs is allowed)
4. Restart Cursor, then re-run this workflow

Or re-run with runtime=local to use the local SDK agent instead.

Docs: https://cursor.com/docs/cloud-agent
`);
      } else {
        console.error(`
Your account may block API agent usage globally. Try enabling regular Privacy Mode
(not Legacy/Ghost) in Cursor → Settings → Privacy, then re-run this workflow.

Docs: https://cursor.com/docs/sdk/typescript
`);
      }
    }
    process.exit(1);
  }
  throw err;
}
