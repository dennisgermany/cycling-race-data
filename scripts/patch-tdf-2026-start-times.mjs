#!/usr/bin/env node
/**
 * Patch Tour de France 2026 stages.json with official race start and expected
 * finish times from ASO/TNT schedule (via ProCyclingUK TV guide, 3 Jul 2026).
 * Times converted from BST to CEST (+02:00).
 */

import { readFileSync, writeFileSync } from "node:fs";

/** @type {Record<number, { start: string, finish: string }>} */
const OFFICIAL_CEST = {
  1: { start: "17:05", finish: "19:16" },
  2: { start: "13:45", finish: "17:26" },
  3: { start: "12:10", finish: "16:54" },
  4: { start: "13:10", finish: "17:23" },
  5: { start: "14:05", finish: "17:37" },
  6: { start: "12:25", finish: "17:29" },
  7: { start: "13:15", finish: "17:13" },
  8: { start: "13:15", finish: "17:20" },
  9: { start: "13:35", finish: "17:47" },
  10: { start: "13:10", finish: "17:12" },
  11: { start: "13:50", finish: "17:31" },
  12: { start: "13:30", finish: "17:29" },
  13: { start: "13:00", finish: "17:46" },
  14: { start: "13:10", finish: "17:24" },
  15: { start: "13:10", finish: "17:41" },
  16: { start: "13:00", finish: "17:50" },
  17: { start: "13:20", finish: "17:18" },
  18: { start: "12:35", finish: "17:12" },
  19: { start: "14:00", finish: "17:24" },
  20: { start: "11:20", finish: "16:11" },
  21: { start: "16:15", finish: "19:30" },
};

const path = "data/2026/tour-de-france/stages.json";
/** @type {Array<{ number: number, date: string } & Record<string, unknown>>} */
const stages = JSON.parse(readFileSync(path, "utf8"));

for (const stage of stages) {
  const t = OFFICIAL_CEST[stage.number];
  if (!t) continue;
  stage.startTime = `${stage.date}T${t.start}:00+02:00`;
  stage.expectedFinishTime = `${stage.date}T${t.finish}:00+02:00`;
}

writeFileSync(path, `${JSON.stringify(stages, null, 2)}\n`);
console.log(`Patched ${stages.length} stages in ${path}`);
