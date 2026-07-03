# Create-race agent

This agent scaffolds a **new** race for the current calendar year under `data/{year}/{race-slug}/`. It is invoked by the *Create race* GitHub Actions workflow or locally with `prompts/create-race.md`.

Read `AGENTS.md` for shared index.json rules and result shapes. This file covers **initial race creation only**.

## Preconditions — abort without changes

Stop immediately (no file edits) if any of the following is true:

1. `data/{year}/{slug}/` already exists (any file inside)
2. `data/index.json` already lists an entry with the same `year` + `slug`
3. You cannot verify at least the **stage route** (dates, start/finish, distance) from allowed sources

Report why you stopped in your final summary.

## Identifiers

Run `node scripts/race-ids.mjs "{{RACE_NAME}}" {{YEAR}}` (or use the `{{IDS_JSON}}` block injected by the workflow) and use the returned values consistently:

| Field | Example (Tour de France 2026) |
|-------|-------------------------------|
| `slug` | `tour-de-france` |
| `filePrefix` | `tour-de-france-2026` |
| `dataDir` | `data/2026/tour-de-france` |
| `dataPath` | `2026/tour-de-france` |
| `gpxWebPrefix` | `/data/2026/tour-de-france/gpx` |

Do not invent alternate slug or file names.

## Files to create

All paths are under `{dataDir}/`:

| File | Purpose |
|------|---------|
| `stages.json` | Array of stage objects with per-stage `status` |
| `teams.json` | Array of teams and riders (start list) |
| `results.json` | `{ provisionalGc, stageResults }` — stage results and provisional GC |
| `gc/after-stage-{N}.json` | GC snapshot after each finished stage (one file per stage) |
| `profile-climbs.json` | Categorised climbs per stage number |
| `route-features.json` | Climbs keyed by stage id (derived from profile-climbs) |
| `gpx/stage-{N}-route.gpx` | GPX route per stage (when available) |

Also update `data/index.json` with a new race entry.

Reference implementation: `data/2026/giro-d-italia/` (Giro d'Italia 2026).

## Data schemas

### Stage object (`stages.json` — array element)

```json
{
  "id": "stage-1",
  "number": 1,
  "name": "Start — Finish",
  "date": "2026-07-05",
  "distanceKm": 185,
  "startLocation": "Lille",
  "finishLocation": "Roubaix",
  "currentStage": "Stage 1 — 185 km (Lille → Roubaix), flat",
  "status": "upcoming",
  "gpxUrl": "/data/{dataPath}/gpx/stage-1-route.gpx"
}
```

- `id`: string `stage-{number}`
- `currentStage` type: flat | hilly | mountain | ITT | TTT
- `status`: `upcoming` | `live` | `finished`
- **Multi-stage races:** one stage per race day (skip rest days; numbering continues)
- **One-day races:** exactly one stage (`stage-1`)
- On creation before the race: all stages `upcoming` unless already officially finished
- If the race is in progress: mark finished stages `finished`, add verified results (see below)

### Team object (`teams.json` — array element)

```json
{
  "name": "Team Visma | Lease a Bike",
  "uciCategory": "WT",
  "riders": [
    { "bib": 1, "name": "Jonas Vingegaard", "nationality": "Denmark" }
  ]
}
```

- `uciCategory`: `WT` | `PRT` | `CT`
- Bib blocks of 10 per team: 1–8, 11–18, 21–28, …
- Nationality: full English country name (`Denmark`, not `DEN`)
- If no official start list is published yet: **stop** and report; do not invent riders

### Rider result row (results + GC)

```json
{ "rank": 1, "bib": 1, "name": "...", "nationality": "...", "team": "...", "time": "3:21:08" }
```

- Top **25** per stage and per GC snapshot
- `time`: winner clock time (`"3:21:08"`); same time `"s.t."`; gap `"+0:27"`, `"+5:22"`, `"+1:02:10"`
- `team` and `bib` must match `teams.json` exactly

### Results file (before race start)

```json
{
  "provisionalGc": [],
  "stageResults": {}
}
```

Add entries only for stages with verified official results.

### GC-by-stage files (before race start)

No `gc/` files until stages finish. When stages have finished, write `gc/after-stage-{N}.json` (array of top 25 rider result rows) for each finished stage.

### Profile climb (`profile-climbs.json`)

Keyed by **stage number** (string keys in JSON):

```json
{
  "1": [{ "name": "COL NAME", "distanceKm": 61.4, "category": 4 }],
  "10": []
}
```

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | UPPERCASE as on profile graphic |
| `distanceKm` | number | km from stage start to summit |
| `category` | number | UCI 1 (hardest) – 4 |

### Route feature (`route-features.json`)

Derived from profile-climbs; keyed by **stage id** string:

```json
{
  "stage-1": [
    { "id": "stage-1-climb-1", "name": "COL NAME", "kind": "climb", "distanceKm": 61.4, "category": 4 }
  ]
}
```

Every stage id from `stages.json` must appear (empty array if no climbs).

### GPX files

- Path: `{dataDir}/gpx/stage-{N}-route.gpx`
- Format: GPX 1.0 with `<bounds>`, `<trk>` → `<trkseg>` → `<trkpt lat lon><ele>`
- Download from cyclingstage.com or official race GPX when available
- If GPX is unavailable for a stage: keep `gpxUrl` in `stages.json`, omit the file, note missing GPX in your summary

### `data/index.json`

Add:

```json
{
  "year": 2026,
  "slug": "tour-de-france",
  "name": "Tour de France",
  "path": "2026/tour-de-france",
  "status": "upcoming"
}
```

- `name`: use the user-supplied display name (`{{RACE_NAME}}`)
- `status`: derive from stage statuses (see `AGENTS.md` rule 7)
- Sort `races` by `year` descending, then `slug` alphabetically
- Set top-level `updatedAt` to today's ISO date

## Allowed sources

Prefer, in order:

1. **Official race website** (route, start list, results)
2. [BikeRaceInfo](https://bikeraceinfo.com) — start lists, stage pages, GC tables
3. [cyclingstage.com](https://www.cyclingstage.com) — GPX downloads, stage profiles, climbs, start lists
4. Wikipedia — **route overview only** (not numeric results)

Do not use paywalled or user-generated wikis as primary sources for results, bibs, or times.

## Rules

1. **Never invent results, bibs, or rider names.** Use only verified data.
2. **Never invent GPX** — download real files or omit and document.
3. Match formatting and style of `data/2026/giro-d-italia/` (2-space JSON indent, trailing newline).
4. Process many stages in order; write files incrementally to avoid losing work on long races.
5. If a start list is not yet published, stop without creating partial data.

## Workflow summary

1. Resolve IDs via `race-ids.mjs` / `{{IDS_JSON}}`
2. Check race does not already exist
3. Research route → write `stages.json`
4. Research start list → write `teams.json`
5. Research stage profiles → write `profile-climbs.json` → `route-features.json`
6. Download GPX files → `gpx/`
7. Write empty `results.json` and no `gc/` files (or fill for finished stages)
8. Update `index.json`
9. Summarize: stage count, sources, missing GPX or start-list gaps
