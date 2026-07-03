#!/usr/bin/env node
/**
 * Derive race identifiers from a display name and year.
 *
 * Usage:
 *   node scripts/race-ids.mjs "Tour de France" 2026
 *   node scripts/race-ids.mjs "Giro d'Italia" 2026 --pretty
 */

export function toSlug(raceName) {
  return raceName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[''`]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function deriveRaceIds(raceName, year) {
  const yearNum = Number(year);
  if (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > 2100) {
    throw new Error(`Invalid year: ${year}`);
  }

  const slug = toSlug(raceName.trim());
  if (!slug) {
    throw new Error(`Cannot derive slug from race name: ${raceName}`);
  }

  const filePrefix = `${slug}-${yearNum}`;
  const dataPath = `${yearNum}/${slug}`;
  const dataDir = `data/${dataPath}`;
  const gpxWebPrefix = `/data/${dataPath}/gpx`;

  return {
    raceName: raceName.trim(),
    year: yearNum,
    slug,
    filePrefix,
    dataPath,
    dataDir,
    gpxWebPrefix,
    botBranch: `bot/create-${slug}-${yearNum}`,
    files: {
      stages: "stages.json",
      teams: "teams.json",
      results: "results.json",
      profileClimbs: "profile-climbs.json",
      routeFeatures: "route-features.json",
      gcDir: "gc",
      gcAfterStage: (n) => `gc/after-stage-${n}.json`,
    },
  };
}

const args = process.argv.slice(2);
const pretty = args.includes("--pretty");
const positional = args.filter((a) => a !== "--pretty");

if (positional.length < 2) {
  console.error('Usage: node scripts/race-ids.mjs "Race Name" YEAR [--pretty]');
  process.exit(1);
}

const [raceName, year] = positional;
const ids = deriveRaceIds(raceName, year);

console.log(pretty ? JSON.stringify(ids, null, 2) : JSON.stringify(ids));
