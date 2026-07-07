Update cycling race data in this repository for every active race listed in `data/index.json`.

## Scope

Files listed in `AGENTS.md`: under `data/{year}/{race-slug}/` (`stages.json`, `results.json`, `gc/after-stage-{n}.json`, and — for classifications listed in `classifications.json` — `points/after-stage-{n}.json`, `kom/after-stage-{n}.json`, `youth/after-stage-{n}.json`) and `data/index.json`.

## Steps

1. Read `data/index.json` — current race catalog and each race's `status`.

2. For each race entry, sorted by `year` descending then `slug` alphabetically (same order as `index.json`):
   - **Skip** races with `status: "finished"`.
   - For all other races, use `data/{path}/` (from the index entry's `path` field).

3. For each race being processed, read the current repo state:
   - `data/{path}/stages.json` — which stages are `finished`, `live`, or `upcoming`
   - `data/{path}/results.json` — which stage IDs exist in `stageResults` and the current `provisionalGc`
   - `data/{path}/gc/` — highest `after-stage-{n}.json` present
   - `data/{path}/classifications.json` — which classifications the race awards (which of `points/`, `kom/`, `youth/` to maintain)
   - `data/{path}/teams.json` — for correct team labels and bibs

   If the race folder is missing, skip that race and note it in the summary (do not invent data).

4. Using allowed sources from `AGENTS.md`, determine whether any **new** stages have **finished** since the last update for that race (including any days you may have missed).

5. If no race has new finished stages: stop without editing stage/results/GC files. Still update `data/index.json` only if any race's derived `status` differs from the stored value.

6. Otherwise, for each race with newly finished stages, process stages in stage number order:
   - Set `"status": "finished"` in `stages.json` (and set any prior `live` stage appropriately)
   - Add top-25 stage results to `results.json` → `stageResults` under the stage id key
   - Write `gc/after-stage-{n}.json` with the GC after that stage
   - For each classification in `classifications.json` other than `gc`, write its `after-stage-{n}.json` (top 25): `youth/` uses the time-based GC row shape; `points/` and `kom/` use the points-based row shape `{ rank, bib, name, nationality, team, points }`
   - Refresh `results.json` → `provisionalGc` to reflect GC after the latest finished stage

7. Update `data/index.json` for each race that changed (or whose derived status or stage-derived catalog fields differ):
   - Derive race `status` from all stage statuses in that race's `stages.json` (see `AGENTS.md` rule 7)
   - Refresh `startDate`, `endDate`, `distanceKm`, `startLocation`, and `finishLocation` from `stages.json` when stages changed
   - Set top-level `updatedAt` to today's ISO date
   - Keep existing `name`, `country`, `edition`, `raceCategory`, `gpxAttribution`, `startlistNotes`, and index `startTime` unchanged; do not change `startTime` or `expectedFinishTime` on `stages.json` unless fixing verified errors
   - Keep `races` sorted by `year` descending, then `slug` alphabetically

8. Reply with a short summary per race: last stage updated, whether files changed, races skipped, and source URLs consulted.

Do not modify GPX, teams, profile climbs, or route features. Do not guess results.
