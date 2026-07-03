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

1. **Verify identifiers** — confirm `dataDir`, `filePrefix`, `exportPrefix`, and `slug` from the JSON above.

2. **Existence check** — if `{dataDir}/` exists or `data/index.json` already has this `year` + `slug`, stop without editing any files.

3. **Research the route**
   - Official race site and cyclingstage.com for stage list: dates, start/finish towns, distances, stage type (flat/hilly/mountain/ITT/TTT)
   - Multi-stage: one entry per race day (skip rest days)
   - One-day race: single `stage-1`
   - Set `status` to `upcoming` unless a stage has officially finished

4. **Write `{dataDir}/{filePrefix}-stages.js`**
   - Export `{exportPrefix}Stages`
   - Set `gpxUrl` to `{gpxWebPrefix}/stage-N-route.gpx` for each stage
   - Header comment: sources and stage count

5. **Research the start list**
   - Official list, BikeRaceInfo, or cyclingstage.com
   - If no start list is published: **stop** and explain in your summary (do not invent riders)

6. **Write `{dataDir}/{filePrefix}-teams.js`**
   - Export `{exportPrefix}Teams`
   - Bib blocks of 10 per team; exact team name spelling

7. **Research stage profiles** (cyclingstage.com profile pages or official PDFs)
   - Write `{dataDir}/{filePrefix}-profile-climbs.js` (`{exportPrefix}ProfileClimbsByStageNum`)
   - Write `{dataDir}/{filePrefix}-route-features.js` (`{exportPrefix}RouteFeaturesByStageId`) derived from profile-climbs

8. **Download GPX files**
   - Save to `{dataDir}/gpx/stage-N-route.gpx` (cyclingstage.com GPX CDN or official source)
   - If unavailable for a stage, omit the file and note it in the stages header

9. **Write results stubs**
   - `{dataDir}/{filePrefix}-results.js`:
     - `{exportPrefix}ProvisionalGcRiderResults = []`
     - `{exportPrefix}StageRiderResultsByStageId = {}`
   - If any stages are already `finished`, add verified top-25 results and provisional GC
   - `{dataDir}/{filePrefix}-gc-by-stage.js`: header only, or `{exportPrefix}GcAfterStageN` for each finished stage

10. **Update `data/index.json`**
    - Add entry with `name: "{{RACE_NAME}}"`, derived `status`, sorted races list, `updatedAt` = today

11. **Reply with a summary**
    - Stage count and date range
    - Team and rider count
    - GPX files downloaded vs missing
    - Whether results were included (race already started)
    - All source URLs consulted

Do not modify existing races (e.g. Giro d'Italia 2026). Do not guess results, riders, or GPX data.
