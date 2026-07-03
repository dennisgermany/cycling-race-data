#!/usr/bin/env node
/**
 * Merge a single run's metrics into cumulative PR metrics.
 *
 * Usage:
 *   node scripts/update-cumulative-metrics.mjs run-metrics/latest.json [prev-cumulative.json] run-metrics/cumulative.json
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

function readJson(path) {
  if (!path || !existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function addUsage(a, b) {
  if (!b) return a ?? null;
  const base = a ?? {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    totalTokens: 0,
    reasoningTokens: 0,
  };
  return {
    inputTokens: base.inputTokens + (b.inputTokens ?? 0),
    outputTokens: base.outputTokens + (b.outputTokens ?? 0),
    cacheReadTokens: base.cacheReadTokens + (b.cacheReadTokens ?? 0),
    cacheWriteTokens: base.cacheWriteTokens + (b.cacheWriteTokens ?? 0),
    totalTokens: base.totalTokens + (b.totalTokens ?? 0),
    reasoningTokens:
      (base.reasoningTokens ?? 0) + (b.reasoningTokens ?? 0),
  };
}

function mergeCumulative(existing, latest) {
  const runEntry = {
    runId: latest.runId,
    finishedAt: latest.finishedAt,
    durationMs: latest.durationMs ?? 0,
    usage: latest.usage ?? null,
    status: latest.status,
    githubRunId: latest.githubRunId ?? null,
  };

  return {
    runCount: (existing?.runCount ?? 0) + 1,
    durationMs: (existing?.durationMs ?? 0) + (latest.durationMs ?? 0),
    usage: addUsage(existing?.usage, latest.usage),
    lastRun: latest,
    runs: [...(existing?.runs ?? []), runEntry],
  };
}

const args = process.argv.slice(2);
let latestPath;
let prevPath;
let outPath;

if (args.length === 2) {
  [latestPath, outPath] = args;
} else if (args.length === 3) {
  [latestPath, prevPath, outPath] = args;
} else {
  console.error(
    "Usage: node scripts/update-cumulative-metrics.mjs latest.json [prev.json] out.json",
  );
  process.exit(1);
}

const latest = readJson(latestPath);
if (!latest) {
  console.error(`Missing or invalid latest metrics: ${latestPath}`);
  process.exit(1);
}

const existing = readJson(prevPath);
const cumulative = mergeCumulative(existing, latest);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(cumulative, null, 2)}\n`);
console.log(`Wrote cumulative metrics to ${outPath}`);
