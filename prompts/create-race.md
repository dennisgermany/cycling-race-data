Create a new cycling race dataset in this repository.

## Parameters

- **Race name:** {{RACE_NAME}}
- **Year:** {{YEAR}}

## Resolved identifiers

Use these values exactly (from `scripts/race-ids.mjs`):

```json
{{IDS_JSON}}
```

Read and follow **`AGENTS-create-race.md`** for full schema rules, allowed sources, and abort conditions. Use `data/2026/giro-d-italia/` as the formatting reference.

## Steps

1. **Verify identifiers** — confirm `dataDir`, `dataPath`, `filePrefix`, `gpxWebPrefix`, and `slug` from the JSON above.

2. **Existence check** — if `{dataDir}/` exists or `data/index.json` already has this `year` + `slug`, stop without editing any files.

3. **Research the route**
   - Official race site and cyclingstage.com for stage list: dates, start/finish towns, distances, stage type (flat/hilly/mountain/ITT/TTT)
   - Multi-stage: one entry per race day (skip rest days)
   - One-day race: single `stage-1`
   - Set `status` to `upcoming` unless a stage has officially finished

4. **Write `{dataDir}/stages.json`**
   - JSON array of stage objects
   - Set `stageType` on each stage (`flat`, `hilly`, `mountain`, `ITT`, or `TTT`) from official stage profiles / cyclingstage.com
   - Keep `currentStage` suffix in sync (e.g. `", flat"`) via [`scripts/stage-type.mjs`](scripts/stage-type.mjs)
   - Set `gpxUrl` to `{gpxWebPrefix}/stage-N-route.gpx` for each stage
   - Set `startTime` per stage from official timetables (ISO-8601 with offset)

4b. **Set `expectedFinishTime`** on each stage
   - Read [`skills/expected-finish-time.md`](skills/expected-finish-time.md)
   - Compute with `node scripts/expected-finish-time.mjs` or `--stage-json` for each stage

5. **Research the start list**
   - Official list, BikeRaceInfo, or cyclingstage.com
   - If no start list is published: **stop** and explain in your summary (do not invent riders)

6. **Write `{dataDir}/teams.json`**
   - JSON array of team objects
   - Bib blocks of 10 per team; exact team name spelling

7. **Research stage profiles** (cyclingstage.com profile pages or official PDFs)
   - Write `{dataDir}/profile-climbs.json`
   - Write `{dataDir}/route-features.json` derived from profile-climbs

8. **Download GPX files**
   - Save to `{dataDir}/gpx/stage-N-route.gpx` (cyclingstage.com GPX CDN or official source)
   - If unavailable for a stage, omit the file and note it in your summary

9. **Write results stubs**
   - `{dataDir}/results.json`:
     - `{ "provisionalGc": [], "stageResults": {} }`
   - If any stages are already `finished`, add verified top-25 results and provisional GC
   - Write `{dataDir}/gc/after-stage-N.json` for each finished stage (array of top 25)

10. **Update `data/index.json`**
    - Add entry with `name: "{{RACE_NAME}}"`, **all required catalog fields** (see `AGENTS-create-race.md`), derived `status`, sorted races list, `updatedAt` = today

11. **Reply with a summary**
    - Stage count and date range
    - Team and rider count
    - GPX files downloaded vs missing
    - Whether results were included (race already started)
    - All source URLs consulted

Do not modify existing races (e.g. Giro d'Italia 2026). Do not guess results, riders, or GPX data.
