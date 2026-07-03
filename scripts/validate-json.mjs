#!/usr/bin/env node
/**
 * Validate that all JSON files under data/ parse correctly.
 *
 * Usage: node scripts/validate-json.mjs
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "data");
let errors = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (!name.endsWith(".json")) continue;
    try {
      JSON.parse(readFileSync(path, "utf8"));
    } catch (err) {
      console.error(`Invalid JSON: ${path}`);
      console.error(err.message);
      errors++;
    }
  }
}

walk(root);

if (errors > 0) {
  process.exit(1);
}

console.log("All data/**/*.json files are valid JSON.");
