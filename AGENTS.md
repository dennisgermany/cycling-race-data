# Cycling data agent

This repository maintains **Giro d'Italia 2026** race data as static JSON files under `data/2026/giro-d-italia/`. Future races may use `data/{year}/{race-slug}/`; only Giro 2026 is in scope for automated updates today.

The same JSON files are served as a read-only REST API on GitHub Pages (see [`openapi.yaml`](openapi.yaml) and [`README.md`](README.md)).

## Files you may update

| File | Purpose |
|------|---------|
| `data/index.json` | Race catalog and aggregated race `status` |
| `stages.json` | Stage list and `status` per stage |
| `results.json` | Stage results (top 25) and provisional GC |
| `gc/after-stage-{n}.json` | GC snapshot after each finished stage (top 25) |

Paths above are relative to `data/{year}/{race-slug}/` (e.g. `data/2026/giro-d-italia/stages.json`).

## Do not update (unless explicitly asked)

- `teams.json` (start list)
- `profile-climbs.json`, `route-features.json`
- GPX files under `gpx/`

## Data rules

1. **Never invent results.** Use only information you can verify from allowed sources (see below). If a stage has not officially finished, do not add results or mark it `finished`.
2. **Team names and bibs** must match `teams.json` spelling (e.g. `Team Visma | Lease a Bike`, not variants).
3. **Stage results shape** (per rider in `results.json` → `stageResults`):

   `{ rank, bib, name, nationality, team, time }`

   - `time`: winner's clock time; others use `s.t.` or gaps like `+0:27` as in existing rows.
   - Top **25** riders per stage.

4. **Provisional GC** (`results.json` → `provisionalGc`): top 25 after the latest finished stage; same row shape as stage results.

5. **GC by stage** (`gc/after-stage-{n}.json`): one file per finished stage number; top 25; same row shape.

6. **Stage status** in `stages.json`:
   - `finished` — stage complete and results published
   - `live` — stage in progress (only if you have reliable live state)
   - `upcoming` — not yet started

   Update status only when justified by official or reputable results pages.

7. **Race index** (`data/index.json`): lists every race under `data/{year}/{race-slug}/` that has a `stages.json` file. Each entry:

   `{ year, slug, name, path, status }`

   - `path`: relative path under `data/` (e.g. `2026/giro-d-italia`)
   - `name`: display name (set when first adding a race; keep unchanged on later updates)
   - `status`: aggregated race status derived from stage statuses in that race's `stages.json`:
     - `finished` — all stages `finished`
     - `upcoming` — all stages `upcoming`
     - `live` — otherwise (any `live` stage, or a mix of `finished` and `upcoming`)

   Sort `races` by `year` descending, then `slug` alphabetically. Set top-level `updatedAt` to the ISO date of the update.

   Update `index.json` when stage data changes for a race. If a new `data/{year}/{slug}/` folder with `stages.json` exists but has no index entry, add one (`name` from slug or existing context — do not invent). If the repo is already up to date, do not touch `index.json` unless the derived race `status` differs from the stored value.

## Allowed sources

Prefer, in order:

1. [BikeRaceInfo](https://bikeraceinfo.com) — daily stage pages and "GC after stage N"
2. [Giro d'Italia official site](https://www.giroditalia.it/en/)
3. [cyclingstage.com](https://www.cyclingstage.com) — cross-check only

Do not use paywalled or user-generated wikis as primary sources for numeric results.

## Workflow

- Add stages **in order** (do not skip stage numbers in results/GC files).
- If the repo is already up to date, **make no file changes**.
- Keep edits minimal: no formatting-only churn, no unrelated refactors.
- Write valid JSON (2-space indent, trailing newline).

## Race creation

A separate **Create race** workflow scaffolds a new race for the current calendar year from a single `race_name` input. See [`AGENTS-create-race.md`](AGENTS-create-race.md), [`prompts/create-race.md`](prompts/create-race.md), and [`.github/workflows/create-race.yml`](.github/workflows/create-race.yml).

The create agent may write all files under `data/{year}/{race-slug}/` (stages, teams, results stubs, climbs, route features, GPX) plus `data/index.json`. It does not modify existing races.
