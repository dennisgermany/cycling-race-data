#!/usr/bin/env node
/**
 * Format agent run + cumulative PR metrics as a Markdown block for PR bodies.
 *
 * Usage:
 *   node scripts/format-agent-costs.mjs [latest.json] [cumulative.json]
 *
 * Defaults: run-metrics/latest.json, run-metrics/cumulative.json
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const latestPath = process.argv[2] || join(cwd, "run-metrics", "latest.json");
const cumulativePath =
  process.argv[3] || join(cwd, "run-metrics", "cumulative.json");

function readJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function formatDuration(ms) {
  if (ms == null || Number.isNaN(ms)) return "—";
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec}s`;
  return `${min}m ${sec}s`;
}

function formatTokens(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-US");
}

function formatUsageCell(usage, field) {
  if (!usage) return "—";
  return formatTokens(usage[field]);
}

function estimateUsd(usage) {
  const inputRate = Number(process.env.CURSOR_COST_PER_MTOK_INPUT);
  const outputRate = Number(process.env.CURSOR_COST_PER_MTOK_OUTPUT);
  if (!usage || !inputRate || !outputRate) return null;

  const inputCost = ((usage.inputTokens ?? 0) / 1_000_000) * inputRate;
  const outputCost = ((usage.outputTokens ?? 0) / 1_000_000) * outputRate;
  return inputCost + outputCost;
}

const latest = readJson(latestPath);
const cumulative = readJson(cumulativePath);

if (!latest) {
  console.log("## Agent costs\n\n_No run metrics available._");
  process.exit(0);
}

const total = cumulative ?? {
  durationMs: latest.durationMs ?? 0,
  usage: latest.usage,
  runCount: 1,
};

const lines = [
  "## Agent costs",
  "",
  "| | This run | PR total |",
  "|---|--:|--:|",
  `| Duration | ${formatDuration(latest.durationMs)} | ${formatDuration(total.durationMs)} |`,
  `| Input tokens | ${formatUsageCell(latest.usage, "inputTokens")} | ${formatUsageCell(total.usage, "inputTokens")} |`,
  `| Output tokens | ${formatUsageCell(latest.usage, "outputTokens")} | ${formatUsageCell(total.usage, "outputTokens")} |`,
  `| Total tokens | ${formatUsageCell(latest.usage, "totalTokens")} | ${formatUsageCell(total.usage, "totalTokens")} |`,
  "",
];

const runEstimate = estimateUsd(latest.usage);
const totalEstimate = estimateUsd(total.usage);
if (runEstimate != null && totalEstimate != null) {
  lines.push(
    `| Est. cost (USD) | ~$${runEstimate.toFixed(2)} | ~$${totalEstimate.toFixed(2)} |`,
    "",
  );
}

const model = latest.model ?? "unknown";
const runId = latest.runId ?? "unknown";
const runCount = total.runCount ?? 1;

lines.push(
  `Run ID: \`${runId}\` · Model: \`${model}\` · Runs on this PR: ${runCount}`,
  "",
);

if (!latest.usage) {
  lines.push("_Token usage was not reported for this run._", "");
}

lines.push(
  "> Dollar costs are not exposed by the Cursor SDK API. See [Cursor usage dashboard](https://cursor.com/dashboard) (SDK tag).",
);

if (runEstimate != null) {
  lines.push(
    "> Estimated USD uses `CURSOR_COST_PER_MTOK_INPUT` / `CURSOR_COST_PER_MTOK_OUTPUT` env rates.",
  );
}

console.log(lines.join("\n"));
