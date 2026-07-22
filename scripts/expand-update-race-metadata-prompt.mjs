#!/usr/bin/env node
/**
 * Expand prompts/update-race-metadata.md placeholders for a given race name and year.
 *
 * Usage:
 *   node scripts/expand-update-race-metadata-prompt.mjs "Tour de France" 2026
 *   node scripts/expand-update-race-metadata-prompt.mjs "Tour de France" 2026 -o /tmp/prompt.md
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const outIdx = args.indexOf("-o");
const outPath = outIdx >= 0 ? args[outIdx + 1] : null;
const positional =
  outIdx >= 0
    ? args.filter((_, i) => i !== outIdx && i !== outIdx + 1)
    : args;

if (positional.length < 2) {
  console.error(
    'Usage: node scripts/expand-update-race-metadata-prompt.mjs "Race Name" YEAR [-o output.md]',
  );
  process.exit(1);
}

const [raceName, year] = positional;
const idsJson = execFileSync(
  "node",
  ["scripts/race-ids.mjs", raceName, year, "--pretty"],
  { encoding: "utf8", cwd: process.cwd() },
);

const template = readFileSync(
  join(process.cwd(), "prompts", "update-race-metadata.md"),
  "utf8",
);

const expanded = template
  .replaceAll("{{RACE_NAME}}", raceName)
  .replaceAll("{{YEAR}}", year)
  .replaceAll("{{IDS_JSON}}", idsJson.trim());

if (outPath) {
  writeFileSync(outPath, expanded);
} else {
  process.stdout.write(expanded);
}
