Update Giro d'Italia 2026 cycling data in this repository.

## Scope

Files listed in `AGENTS.md`: under `data/2026/giro-d-italia/` (stages, results, gc-by-stage) and `data/index.json`.

## Steps

1. Read the current repo state:
   - `data/index.json` — current race catalog and race `status`
   - `data/2026/giro-d-italia/giro-d-italia-2026-stages.js` — which stages are `finished`, `live`, or `upcoming`
   - `data/2026/giro-d-italia/giro-d-italia-2026-results.js` — which stage IDs exist in `giroItalia2026StageRiderResultsByStageId` and the current `giroItalia2026ProvisionalGcRiderResults`
   - `data/2026/giro-d-italia/giro-d-italia-2026-gc-by-stage.js` — highest `giroItalia2026GcAfterStageN` present
   - `data/2026/giro-d-italia/giro-d-italia-2026-teams.js` — for correct team labels and bibs

2. Using allowed sources from `AGENTS.md`, determine whether any **new** stages have **finished** since the last update (including any days you may have missed).

3. If no new finished stages: stop without editing stage/results/GC files. Still update `data/index.json` only if the derived race `status` for `2026/giro-d-italia` differs from the stored value (see step 6).

4. Otherwise, for each newly finished stage (in stage number order):
   - Set `status: 'finished'` in `giro-d-italia-2026-stages.js` (and set any prior `live` stage appropriately)
   - Add top-25 stage results to `giroItalia2026StageRiderResultsByStageId` in `giro-d-italia-2026-results.js`
   - Add `giroItalia2026GcAfterStageN` in `giro-d-italia-2026-gc-by-stage.js`
   - Refresh `giroItalia2026ProvisionalGcRiderResults` to reflect GC after the latest finished stage

5. Update file header comments with the stage range now covered and the sources you used.

6. Update `data/index.json` for `2026/giro-d-italia`:
   - Derive race `status` from all stage statuses in `giro-d-italia-2026-stages.js` (see `AGENTS.md` rule 8)
   - Set `updatedAt` to today's ISO date
   - Keep existing `name` and other fields unchanged

7. Reply with a short summary: last stage updated, whether files changed, and source URLs consulted.

Do not modify GPX, teams, profile climbs, or route features. Do not guess results.
