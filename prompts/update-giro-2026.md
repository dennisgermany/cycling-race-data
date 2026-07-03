Update Giro d'Italia 2026 cycling data in this repository.

## Scope

Files listed in `AGENTS.md`: under `data/2026/giro-d-italia/` (`stages.json`, `results.json`, `gc/after-stage-{n}.json`) and `data/index.json`.

## Steps

1. Read the current repo state:
   - `data/index.json` — current race catalog and race `status`
   - `data/2026/giro-d-italia/stages.json` — which stages are `finished`, `live`, or `upcoming`
   - `data/2026/giro-d-italia/results.json` — which stage IDs exist in `stageResults` and the current `provisionalGc`
   - `data/2026/giro-d-italia/gc/` — highest `after-stage-{n}.json` present
   - `data/2026/giro-d-italia/teams.json` — for correct team labels and bibs

2. Using allowed sources from `AGENTS.md`, determine whether any **new** stages have **finished** since the last update (including any days you may have missed).

3. If no new finished stages: stop without editing stage/results/GC files. Still update `data/index.json` only if the derived race `status` for `2026/giro-d-italia` differs from the stored value (see step 6).

4. Otherwise, for each newly finished stage (in stage number order):
   - Set `"status": "finished"` in `stages.json` (and set any prior `live` stage appropriately)
   - Add top-25 stage results to `results.json` → `stageResults` under the stage id key
   - Write `gc/after-stage-{n}.json` with the GC after that stage
   - Refresh `results.json` → `provisionalGc` to reflect GC after the latest finished stage

5. Update `data/index.json` for `2026/giro-d-italia`:
   - Derive race `status` from all stage statuses in `stages.json` (see `AGENTS.md` rule 7)
   - Set `updatedAt` to today's ISO date
   - Keep existing `name` and other fields unchanged

6. Reply with a short summary: last stage updated, whether files changed, and source URLs consulted.

Do not modify GPX, teams, profile climbs, or route features. Do not guess results.
