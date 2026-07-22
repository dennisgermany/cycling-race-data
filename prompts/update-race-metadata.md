Verify and backfill static metadata for an existing cycling race in this repository.

## Parameters

- **Race name:** {{RACE_NAME}}
- **Year:** {{YEAR}}

## Resolved identifiers

Use these values exactly (from `scripts/race-ids.mjs`):

```json
{{IDS_JSON}}
```

Read and follow **`AGENTS-update-race-metadata.md`** for scope, schemas, and abort conditions. Use `AGENTS-create-race.md` for field shapes (`route-features.json`, `teams.json`, etc.).

## Steps

1. **Verify identifiers** — confirm `dataDir`, `dataPath`, `slug`, and `botMetaBranch` from the JSON above.

2. **Existence check** — if `{dataDir}/stages.json` is missing or `data/index.json` has no matching `year` + `slug`, stop without editing any files.

3. **Audit current data** under `{dataDir}/`:
   - `teams.json` — empty/`[]` or incomplete vs published start list?
   - `route-features.json` — missing climbs, intermediate sprints, or cobbles vs official/cyclingstage profiles?
   - `stages.json` — incorrect distance, elevation, locations, times, or `stageType`?
   - `classifications.json` — missing when the race awards jerseys?
   - `gpx/` — missing stage GPX files that are downloadable?

4. **Research gaps** from allowed sources (official site, BikeRaceInfo, cyclingstage.com). Never invent riders, features, or GPX.

5. **Apply updates** only where verified:
   - Backfill `teams.json` when a start list is now published; adjust `startlistNotes` on the index entry
   - Update `route-features.json` (climbs + sprints + cobbles); do not create `profile-climbs.json`
   - Correct `stages.json` metadata fields only — do **not** change stage `status` for race-day results
   - Add `classifications.json` if missing and verifiable
   - Download missing GPX into `{dataDir}/gpx/`

6. **Do not touch** `results.json`, `gc/`, `points/`, `kom/`, or `youth/` (daily results agent).

7. **Update `data/index.json`** if anything changed:
   - Refresh derived fields from `stages.json` when stages were corrected
   - Preserve `name`, `country`, `edition`, `raceCategory`, `gpxAttribution` unless fixing a verified error
   - Set `updatedAt` to today
   - Keep `races` sorted by year descending, then slug

8. **If nothing needs changing**, make no file edits and say so in the summary.

9. **Reply with a summary**
   - What was audited vs fixed
   - Start list status (filled / still missing)
   - Route-feature counts added (climbs / sprints / cobbles)
   - GPX downloaded vs still missing
   - Remaining gaps
   - Source URLs consulted

Do not modify other races. Do not guess data.
