# Cycling data agent

This repository maintains **Giro d'Italia 2026** race data as static JavaScript modules under `data/2026/giro-d-italia/`. Future races may use `data/{year}/{race-slug}/`; only Giro 2026 is in scope for automated updates today.

## Files you may update

| File | Purpose |
|------|---------|
| `giro-d-italia-2026-stages.js` | Stage list and `status` per stage |
| `giro-d-italia-2026-results.js` | Stage results (top 25) and provisional GC |
| `giro-d-italia-2026-gc-by-stage.js` | GC snapshot after each finished stage (top 25) |

## Do not update (unless explicitly asked)

- `giro-d-italia-2026-teams.js` (start list)
- `giro-d-italia-2026-profile-climbs.js`, `giro-d-italia-2026-route-features.js`
- GPX files under `gpx/` or `giro-d-italia-2026/`

## Data rules

1. **Never invent results.** Use only information you can verify from allowed sources (see below). If a stage has not officially finished, do not add results or mark it `finished`.
2. **Team names and bibs** must match `giro-d-italia-2026-teams.js` spelling (e.g. `Team Visma | Lease a Bike`, not variants).
3. **Stage results shape** (per rider in `giroItalia2026StageRiderResultsByStageId`):

   `{ rank, bib, name, nationality, team, time }`

   - `time`: winner's clock time; others use `s.t.` or gaps like `+0:27` as in existing rows.
   - Top **25** riders per stage.

4. **Provisional GC** (`giroItalia2026ProvisionalGcRiderResults`): top 25 after the latest finished stage; same row shape as stage results.

5. **GC by stage** (`giroItalia2026GcAfterStageN`): one export per finished stage number; top 25; same row shape.

6. **Stage status** in `giro-d-italia-2026-stages.js`:
   - `finished` — stage complete and results published
   - `live` — stage in progress (only if you have reliable live state)
   - `upcoming` — not yet started

   Update status only when justified by official or reputable results pages.

7. **Header comments** at the top of edited files: update the stage range covered (e.g. "stages 1–11") and list sources used for that run.

## Allowed sources

Prefer, in order:

1. [BikeRaceInfo](https://bikeraceinfo.com) — daily stage pages and "GC after stage N"
2. [Giro d'Italia official site](https://www.giroditalia.it/en/)
3. [cyclingstage.com](https://www.cyclingstage.com) — cross-check only

Do not use paywalled or user-generated wikis as primary sources for numeric results.

## Workflow

- Add stages **in order** (do not skip stage numbers in results/GC exports).
- If the repo is already up to date, **make no file changes**.
- Keep edits minimal: no formatting-only churn, no unrelated refactors.
