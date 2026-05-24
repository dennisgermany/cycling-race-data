import { Agent, CursorAgentError } from "@cursor/sdk";

const apiKey = process.env.CURSOR_API_KEY;
if (!apiKey) {
  console.error("CURSOR_API_KEY is required");
  process.exit(1);
}

const repository = process.env.GITHUB_REPOSITORY;
if (!repository) {
  console.error("GITHUB_REPOSITORY is required");
  process.exit(1);
}

const prompt =
  process.env.AGENT_PROMPT?.trim() ||
  "Summarize what this repository does based on the README and project structure.";

const startingRef = process.env.GITHUB_REF_NAME ?? "main";
const repoUrl = `https://github.com/${repository}`;

try {
  const result = await Agent.prompt(prompt, {
    apiKey,
    model: { id: "composer-2.5" },
    cloud: {
      repos: [{ url: repoUrl, startingRef }],
      skipReviewerRequest: true,
    },
  });

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
    process.exit(1);
  }
  throw err;
}
