#!/usr/bin/env node
/**
 * One-time migration: convert legacy .js data modules to JSON files.
 *
 * Usage:
 *   node scripts/migrate-js-to-json.mjs "Giro d'Italia" 2026
 *   node scripts/migrate-js-to-json.mjs "Giro d'Italia" 2026 --delete-js
 */

import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { deriveRaceIds } from "./race-ids.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function toExportPrefix(slug, year) {
  const segments = slug.split("-").filter((s) => s.length > 1);
  const camel =
    segments[0] +
    segments
      .slice(1)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("");
  return `${camel}${year}`;
}

function rewriteGpxUrl(url, dataPath) {
  const match = url.match(/stage-(\d+)-route\.gpx$/);
  if (!match) return url;
  return `/data/${dataPath}/gpx/stage-${match[1]}-route.gpx`;
}

async function migrate(raceName, year, deleteJs) {
  const ids = deriveRaceIds(raceName, year);
  const { dataDir, dataPath, filePrefix, slug } = ids;
  const exportPrefix = toExportPrefix(slug, year);
  const absDir = join(root, dataDir);

  const legacy = {
    stages: join(absDir, `${filePrefix}-stages.js`),
    teams: join(absDir, `${filePrefix}-teams.js`),
    results: join(absDir, `${filePrefix}-results.js`),
    gcByStage: join(absDir, `${filePrefix}-gc-by-stage.js`),
    profileClimbs: join(absDir, `${filePrefix}-profile-climbs.js`),
    routeFeatures: join(absDir, `${filePrefix}-route-features.js`),
  };

  for (const [key, path] of Object.entries(legacy)) {
    if (!existsSync(path)) {
      console.error(`Missing legacy file: ${path}`);
      process.exit(1);
    }
  }

  const stagesMod = await import(`file://${legacy.stages}`);
  const teamsMod = await import(`file://${legacy.teams}`);
  const resultsMod = await import(`file://${legacy.results}`);
  const gcMod = await import(`file://${legacy.gcByStage}`);
  const climbsMod = await import(`file://${legacy.profileClimbs}`);
  const featuresMod = await import(`file://${legacy.routeFeatures}`);

  const stages = stagesMod[`${exportPrefix}Stages`].map((s) => ({
    ...s,
    gpxUrl: rewriteGpxUrl(s.gpxUrl, dataPath),
  }));

  const teams = teamsMod[`${exportPrefix}Teams`];

  const results = {
    provisionalGc: resultsMod[`${exportPrefix}ProvisionalGcRiderResults`],
    stageResults: resultsMod[`${exportPrefix}StageRiderResultsByStageId`],
  };

  // Legacy profile-climbs.js is still required as an input artifact; course markers
  // are published only as route-features.json.
  void climbsMod[`${exportPrefix}ProfileClimbsByStageNum`];
  const routeFeatures = featuresMod[`${exportPrefix}RouteFeaturesByStageId`];

  const gcDir = join(absDir, "gc");
  mkdirSync(gcDir, { recursive: true });

  const gcPattern = new RegExp(`^${exportPrefix}GcAfterStage(\\d+)$`);
  let gcCount = 0;
  for (const [exportName, value] of Object.entries(gcMod)) {
    const match = exportName.match(gcPattern);
    if (match) {
      const n = match[1];
      writeFileSync(
        join(gcDir, `after-stage-${n}.json`),
        JSON.stringify(value, null, 2) + "\n",
      );
      gcCount++;
    }
  }

  writeFileSync(join(absDir, "stages.json"), JSON.stringify(stages, null, 2) + "\n");
  writeFileSync(join(absDir, "teams.json"), JSON.stringify(teams, null, 2) + "\n");
  writeFileSync(join(absDir, "results.json"), JSON.stringify(results, null, 2) + "\n");
  writeFileSync(
    join(absDir, "route-features.json"),
    JSON.stringify(routeFeatures, null, 2) + "\n",
  );

  console.log(`Wrote stages.json (${stages.length} stages)`);
  console.log(`Wrote teams.json (${teams.length} teams)`);
  console.log(`Wrote results.json (${Object.keys(results.stageResults).length} stage results)`);
  console.log(`Wrote gc/ (${gcCount} after-stage files)`);
  console.log(`Wrote route-features.json`);

  if (deleteJs) {
    for (const path of Object.values(legacy)) {
      unlinkSync(path);
      console.log(`Deleted ${path}`);
    }
  } else {
    console.log("Legacy .js files kept (pass --delete-js to remove)");
  }
}

const args = process.argv.slice(2);
const deleteJs = args.includes("--delete-js");
const positional = args.filter((a) => a !== "--delete-js");

if (positional.length < 2) {
  console.error(
    'Usage: node scripts/migrate-js-to-json.mjs "Race Name" YEAR [--delete-js]',
  );
  process.exit(1);
}

const [raceName, year] = positional;
await migrate(raceName, year, deleteJs);
