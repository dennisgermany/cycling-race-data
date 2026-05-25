Update Giro d'Italia 2026 cycling data in this repository.

## Scope

Only files under `data/2026/giro-d-italia/` listed in `AGENTS.md` (stages, results, gc-by-stage).

## Steps

1. Read the current repo state:
   - `data/2026/giro-d-italia/giro-d-italia-2026-stages.js` — which stages are `finished`, `live`, or `upcoming`
   - `data/2026/giro-d-italia/giro-d-italia-2026-results.js` — which stage IDs exist in `giroItalia2026StageRiderResultsByStageId` and the current `giroItalia2026ProvisionalGcRiderResults`
   - `data/2026/giro-d-italia/giro-d-italia-2026-gc-by-stage.js` — highest `giroItalia2026GcAfterStageN` present
   - `data/2026/giro-d-italia/giro-d-italia-2026-teams.js` — for correct team labels and bibs

2. Using allowed sources from `AGENTS.md`, determine whether any **new** stages have **finished** since the last update (including any days you may have missed).

3. If no new finished stages: **stop without editing any files**.

4. Otherwise, for each newly finished stage (in stage number order):
   - Set `status: 'finished'` in `giro-d-italia-2026-stages.js` (and set any prior `live` stage appropriately)
   - Add top-25 stage results to `giroItalia2026StageRiderResultsByStageId` in `giro-d-italia-2026-results.js`
   - Add `giroItalia2026GcAfterStageN` in `giro-d-italia-2026-gc-by-stage.js`
   - Refresh `giroItalia2026ProvisionalGcRiderResults` to reflect GC after the latest finished stage

5. Update file header comments with the stage range now covered and the sources you used.

6. Reply with a short summary: last stage updated, whether files changed, and source URLs consulted.

Do not modify GPX, teams, profile climbs, or route features. Do not guess results.
