#!/usr/bin/env node
/**
 * Derive race identifiers from a display name and year.
 *
 * Usage:
 *   node scripts/race-ids.mjs "Tour de France" 2026
 *   node scripts/race-ids.mjs "Giro d'Italia" 2026 --pretty
 */

function toSlug(raceName) {
  return raceName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[''`]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function toExportPrefix(slug, year) {
  const segments = slug.split("-").filter((s) => s.length > 1);
  if (segments.length === 0) {
    throw new Error(`Cannot derive export prefix from slug: ${slug}`);
  }
  const camel =
    segments[0] +
    segments
      .slice(1)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("");
  return `${camel}${year}`;
}

function deriveRaceIds(raceName, year) {
  const yearNum = Number(year);
  if (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > 2100) {
    throw new Error(`Invalid year: ${year}`);
  }

  const slug = toSlug(raceName.trim());
  if (!slug) {
    throw new Error(`Cannot derive slug from race name: ${raceName}`);
  }

  const exportPrefix = toExportPrefix(slug, yearNum);
  const filePrefix = `${slug}-${yearNum}`;
  const dataPath = `${yearNum}/${slug}`;
  const dataDir = `data/${dataPath}`;
  const gpxWebPrefix = `/gpx/${slug}-${yearNum}`;

  return {
    raceName: raceName.trim(),
    year: yearNum,
    slug,
    filePrefix,
    exportPrefix,
    dataPath,
    dataDir,
    gpxWebPrefix,
    botBranch: `bot/create-${slug}-${yearNum}`,
    files: {
      stages: `${filePrefix}-stages.js`,
      teams: `${filePrefix}-teams.js`,
      results: `${filePrefix}-results.js`,
      gcByStage: `${filePrefix}-gc-by-stage.js`,
      profileClimbs: `${filePrefix}-profile-climbs.js`,
      routeFeatures: `${filePrefix}-route-features.js`,
    },
    exports: {
      stages: `${exportPrefix}Stages`,
      teams: `${exportPrefix}Teams`,
      provisionalGc: `${exportPrefix}ProvisionalGcRiderResults`,
      stageResults: `${exportPrefix}StageRiderResultsByStageId`,
      profileClimbs: `${exportPrefix}ProfileClimbsByStageNum`,
      routeFeatures: `${exportPrefix}RouteFeaturesByStageId`,
      gcAfterStage: (n) => `${exportPrefix}GcAfterStage${n}`,
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
