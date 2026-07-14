#!/usr/bin/env node
/**
 * Compute expectedFinishTime from startTime, distanceKm, and stage type.
 *
 * Usage:
 *   node scripts/expected-finish-time.mjs "2026-05-08T13:10:00+03:00" 156 flat
 *   node scripts/expected-finish-time.mjs --stage-json '{"startTime":"...","distanceKm":156,"currentStage":"..., flat"}'
 */

import {
  parseStageTypeFromCurrentStage,
  resolveStageType,
  stageTypeSpeedKey,
} from "./stage-type.mjs";

/** @type {Record<string, number>} */
export const AVG_SPEED_KMH = {
  flat: 41,
  hilly: 36,
  mountain: 33,
  itt: 45,
  ttt: 50,
};

/**
 * @param {string} currentStage
 * @returns {keyof typeof AVG_SPEED_KMH}
 */
export function parseStageType(currentStage) {
  return stageTypeSpeedKey(parseStageTypeFromCurrentStage(currentStage));
}

/**
 * @param {string} startTime ISO-8601
 * @param {number} distanceKm
 * @param {string} stageTypeOrCurrentStage flat|hilly|... or full currentStage string
 */
export function computeExpectedFinishTime(startTime, distanceKm, stageTypeOrCurrentStage) {
  const start = new Date(startTime);
  if (Number.isNaN(start.getTime())) {
    throw new Error(`Invalid startTime: ${startTime}`);
  }
  const km = Number(distanceKm);
  if (!Number.isFinite(km) || km <= 0) {
    throw new Error(`Invalid distanceKm: ${distanceKm}`);
  }
  const typeKey =
    stageTypeOrCurrentStage.includes(",") || stageTypeOrCurrentStage.includes("—")
      ? parseStageType(stageTypeOrCurrentStage)
      : stageTypeSpeedKey(
          /** @type {import("./stage-type.mjs").STAGE_TYPES[number]} */ (
            stageTypeOrCurrentStage.toUpperCase() === "ITT"
              ? "ITT"
              : stageTypeOrCurrentStage.toUpperCase() === "TTT"
                ? "TTT"
                : stageTypeOrCurrentStage.toLowerCase()
          ),
        );
  const avgSpeed = AVG_SPEED_KMH[typeKey] ?? AVG_SPEED_KMH.flat;
  const durationMs = (km / avgSpeed) * 3600 * 1000;
  const finish = new Date(start.getTime() + durationMs);
  // Round to nearest minute
  finish.setSeconds(0, 0);
  const roundMs = finish.getTime() % 60_000 >= 30_000 ? 60_000 : 0;
  finish.setTime(finish.getTime() - (finish.getTime() % 60_000) + roundMs);

  return formatWithSameOffset(startTime, finish);
}

/**
 * Preserve numeric offset from startTime on the finish instant.
 * @param {string} startTimeIso
 * @param {Date} finishUtc
 */
function formatWithSameOffset(startTimeIso, finishUtc) {
  const offsetMatch = startTimeIso.match(/(Z|[+-]\d{2}:\d{2})$/);
  if (!offsetMatch) {
    return finishUtc.toISOString();
  }
  const offset = offsetMatch[1];
  if (offset === "Z") {
    return finishUtc.toISOString().replace(/\.\d{3}Z$/, "Z");
  }
  const sign = offset[0] === "-" ? -1 : 1;
  const [oh, om] = offset.slice(1).split(":").map(Number);
  const offsetMinutes = sign * (oh * 60 + om);
  const localMs = finishUtc.getTime() + offsetMinutes * 60_000;
  const d = new Date(localMs);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00${offset}`;
}

/**
 * @param {{ startTime: string, distanceKm: number, currentStage?: string, stageType?: string }} stage
 */
export function computeForStage(stage) {
  const type = resolveStageType(stage);
  return computeExpectedFinishTime(stage.startTime, stage.distanceKm, type);
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--stage-json") {
    const stage = JSON.parse(args[1]);
    console.log(computeForStage(stage));
    return;
  }
  if (args.length < 3) {
    console.error(
      'Usage: node scripts/expected-finish-time.mjs "ISO_START" DISTANCE_KM TYPE|currentStage',
    );
    process.exit(1);
  }
  const [startTime, distanceKm, stageType] = args;
  console.log(computeExpectedFinishTime(startTime, Number(distanceKm), stageType));
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  main();
}
