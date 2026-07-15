#!/usr/bin/env node
/**
 * Fill missing elevationGainM on stages from local GPX (fallback only).
 * Never overwrites existing researched values.
 *
 * Usage:
 *   node scripts/backfill-elevation-gain.mjs data/2026/tour-de-france/stages.json
 *   node scripts/backfill-elevation-gain.mjs data/2026/tour-de-france/stages.json --sync-index
 *   node scripts/backfill-elevation-gain.mjs --all [--sync-index]
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { elevationGainFromGpxFile } from "./gpx-elevation-gain.mjs";

/**
 * @param {unknown[]} stages
 */
export function sumElevationGainM(stages) {
  return stages.reduce((sum, s) => {
    const v = typeof s.elevationGainM === "number" ? s.elevationGainM : Number(s.elevationGainM);
    return sum + (Number.isFinite(v) && v > 0 ? v : 0);
  }, 0);
}

/**
 * Resolve local GPX path from stage.gpxUrl relative to repo data root.
 * @param {string} stagesPath
 * @param {string} gpxUrl
 */
function localGpxPath(stagesPath, gpxUrl) {
  const raceDir = dirname(stagesPath);
  const rel = String(gpxUrl).replace(/^\/data\//, "");
  const dataRoot = join(process.cwd(), "data");
  const fromUrl = join(dataRoot, rel.replace(/^[^/]+\/[^/]+\//, ""));
  if (existsSync(fromUrl)) return fromUrl;
  const fileName = rel.split("/").pop();
  if (fileName) {
    const inRaceGpx = join(raceDir, "gpx", fileName);
    if (existsSync(inRaceGpx)) return inRaceGpx;
  }
  return null;
}

/**
 * @param {string} stagesPath
 * @param {{ syncIndex?: boolean }} opts
 */
function backfillFile(stagesPath, opts = {}) {
  const raw = readFileSync(stagesPath, "utf8");
  const stages = JSON.parse(raw);
  if (!Array.isArray(stages)) throw new Error(`Expected array in ${stagesPath}`);

  let filled = 0;
  let skipped = 0;
  const out = stages.map((stage) => {
    if (stage.elevationGainM != null && stage.elevationGainM !== "") {
      skipped++;
      return stage;
    }
    if (!stage.gpxUrl) return stage;
    const gpxPath = localGpxPath(stagesPath, stage.gpxUrl);
    if (!gpxPath) return stage;
    try {
      const gain = elevationGainFromGpxFile(gpxPath);
      if (gain > 0) {
        filled++;
        return { ...stage, elevationGainM: gain };
      }
    } catch {
      /* leave unset */
    }
    return stage;
  });

  if (filled > 0) {
    writeFileSync(stagesPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");
    console.log(`Filled ${filled} stage(s) from GPX (skipped ${skipped} with existing values): ${stagesPath}`);
  } else {
    console.log(`No GPX fallback needed: ${stagesPath}`);
  }

  if (opts.syncIndex) {
    syncIndexElevation(stagesPath, out);
  }

  return { filled, stages: out };
}

/**
 * @param {string} stagesPath
 * @param {unknown[]} stages
 */
function syncIndexElevation(stagesPath, stages) {
  const match = stagesPath.match(/data\/(\d+)\/([^/]+)\/stages\.json$/);
  if (!match) {
    console.warn("Could not derive year/slug for index sync");
    return;
  }
  const year = Number(match[1]);
  const slug = match[2];
  const indexPath = join(process.cwd(), "data", "index.json");
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  const total = sumElevationGainM(stages);
  const races = index.races.map((r) =>
    r.year === year && r.slug === slug ? { ...r, elevationGainM: total } : r,
  );
  writeFileSync(indexPath, `${JSON.stringify({ ...index, races }, null, 2)}\n`, "utf8");
  console.log(`Updated index.json elevationGainM=${total} for ${slug} ${year}`);
}

function findAllStagesJson() {
  const root = join(process.cwd(), "data");
  /** @type {string[]} */
  const files = [];
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name === "stages.json") files.push(path);
    }
  }
  walk(root);
  return files.sort();
}

function main() {
  const args = process.argv.slice(2);
  const syncIndex = args.includes("--sync-index");
  const paths = args.filter((a) => !a.startsWith("--"));

  if (args.includes("--all")) {
    for (const p of findAllStagesJson()) backfillFile(p, { syncIndex });
    return;
  }

  if (paths.length !== 1) {
    console.error(
      "Usage: node scripts/backfill-elevation-gain.mjs <stages.json> [--sync-index] | --all [--sync-index]",
    );
    process.exit(1);
  }

  backfillFile(resolve(paths[0]), { syncIndex });
}

main();
