#!/usr/bin/env node
/**
 * Add `stageType` to each stage in stages.json (from currentStage suffix).
 *
 * Usage:
 *   node scripts/backfill-stage-type.mjs data/2026/tour-de-france/stages.json
 *   node scripts/backfill-stage-type.mjs --all
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  parseStageTypeFromCurrentStage,
  resolveStageType,
  syncCurrentStageSuffix,
} from "./stage-type.mjs";

/**
 * @param {string} path
 */
function backfillFile(path) {
  const raw = readFileSync(path, "utf8");
  const stages = JSON.parse(raw);
  if (!Array.isArray(stages)) {
    throw new Error(`Expected array in ${path}`);
  }

  let changed = 0;
  const out = stages.map((stage) => {
    const type = resolveStageType(stage);
    const next = { ...stage, stageType: type };
    if (stage.currentStage) {
      const synced = syncCurrentStageSuffix(stage.currentStage, type);
      if (synced !== stage.currentStage) {
        next.currentStage = synced;
      }
    }
    if (stage.stageType !== type) changed++;
    return next;
  });

  if (changed === 0) {
    console.log(`No changes: ${path}`);
    return;
  }

  writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(`Updated ${changed} stage(s): ${path}`);
}

function findAllStagesJson() {
  const root = join(process.cwd(), "data");
  /** @type {string[]} */
  const files = [];

  function walk(dir) {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        walk(path);
        continue;
      }
      if (name === "stages.json") files.push(path);
    }
  }

  walk(root);
  return files.sort();
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--all") {
    for (const path of findAllStagesJson()) backfillFile(path);
    return;
  }
  if (args.length !== 1) {
    console.error("Usage: node scripts/backfill-stage-type.mjs <stages.json> | --all");
    process.exit(1);
  }
  backfillFile(args[0]);
}

main();
