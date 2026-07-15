#!/usr/bin/env node
/**
 * Compute elevation gain (meters climbed) from a GPX track.
 * Fallback only — prefer published values from official sources.
 *
 * Usage:
 *   node scripts/gpx-elevation-gain.mjs path/to/stage.gpx
 */

import { readFileSync } from "node:fs";

/** Minimum positive delta (m) to count — filters GPS noise. */
const MIN_DELTA_M = 1;

/**
 * @param {string} xml
 * @returns {number[]}
 */
export function parseGpxElevationsMeters(xml) {
  const elevations = [];
  const re = /<trkpt\b[^>]*>[\s\S]*?<ele>([^<]+)<\/ele>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const ele = parseFloat(String(m[1]).trim());
    if (Number.isFinite(ele)) elevations.push(ele);
  }
  return elevations;
}

/**
 * @param {number[]} elevations
 * @returns {number}
 */
export function computeElevationGainM(elevations) {
  if (elevations.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < elevations.length; i++) {
    const delta = elevations[i] - elevations[i - 1];
    if (delta > MIN_DELTA_M) total += delta;
  }
  return Math.round(total);
}

/**
 * @param {string} gpxPath
 * @returns {number}
 */
export function elevationGainFromGpxFile(gpxPath) {
  const xml = readFileSync(gpxPath, "utf8");
  return computeElevationGainM(parseGpxElevationsMeters(xml));
}

function main() {
  const path = process.argv[2];
  if (!path) {
    console.error("Usage: node scripts/gpx-elevation-gain.mjs <path.gpx>");
    process.exit(1);
  }
  const gain = elevationGainFromGpxFile(path);
  if (gain === 0 && parseGpxElevationsMeters(readFileSync(path, "utf8")).length < 2) {
    console.error(`No elevation data in ${path}`);
    process.exit(1);
  }
  console.log(gain);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  main();
}
