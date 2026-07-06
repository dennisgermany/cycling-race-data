#!/usr/bin/env node
/**
 * Backfill startTime + expectedFinishTime on stages.json using race defaults.
 * Official start times should replace defaults when timetables are available.
 *
 * Usage: node scripts/backfill-stage-times.mjs data/2026/giro-d-italia/stages.json
 */

import { readFileSync, writeFileSync } from "node:fs";
import { computeForStage } from "./expected-finish-time.mjs";

/**
 * @param {{ number: number, date: string, currentStage: string }} stage
 * @param {"giro" | "tdf"} race
 */
function defaultStartTime(stage, race) {
  const n = stage.number;
  const isTtt = /,\s*TTT\s*$/i.test(stage.currentStage);
  const isItt = /,\s*ITT\s*$/i.test(stage.currentStage);

  if (race === "giro") {
    const offset = n <= 3 ? "+03:00" : "+02:00";
    const hour = isItt ? 16 : 12;
    const minute = isItt ? 30 : 15;
    return `${stage.date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00${offset}`;
  }

  // Tour de France
  const offset = "+02:00";
  if (isTtt) {
    return `${stage.date}T16:00:00${offset}`;
  }
  if (isItt) {
    return `${stage.date}T16:30:00${offset}`;
  }
  return `${stage.date}T12:15:00${offset}`;
}

function detectRace(path) {
  if (path.includes("giro-d-italia")) return "giro";
  if (path.includes("tour-de-france")) return "tdf";
  return "giro";
}

const path = process.argv[2];
if (!path) {
  console.error("Usage: node scripts/backfill-stage-times.mjs <stages.json>");
  process.exit(1);
}

const race = detectRace(path);
/** @type {Array<Record<string, unknown>>} */
const stages = JSON.parse(readFileSync(path, "utf8"));

for (const stage of stages) {
  if (!stage.startTime) {
    stage.startTime = defaultStartTime(
      /** @type {{ number: number, date: string, currentStage: string }} */ (stage),
      race,
    );
  }
  stage.expectedFinishTime = computeForStage(
    /** @type {{ startTime: string, distanceKm: number, currentStage: string }} */ ({
      startTime: stage.startTime,
      distanceKm: stage.distanceKm,
      currentStage: stage.currentStage,
    }),
  );
}

writeFileSync(path, `${JSON.stringify(stages, null, 2)}\n`);
console.log(`Updated ${stages.length} stages in ${path}`);
