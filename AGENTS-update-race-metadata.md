# Update-race-metadata agent

This agent **verifies and backfills** static race metadata for an existing race under `data/{year}/{race-slug}/`. It is invoked only by the *Update race metadata* GitHub Actions workflow (`workflow_dispatch`) or locally with `prompts/update-race-metadata.md`.

It does **not** update race results or stage finish status — that remains the daily update agent (`AGENTS.md` / `prompts/update-cycling-data.md`).

Read `AGENTS.md` for shared index.json rules. For schemas, mirror [`AGENTS-create-race.md`](AGENTS-create-race.md).

## Preconditions — abort without changes

Stop immediately (no file edits) if any of the following is true:

1. `data/{year}/{slug}/` does not exist (no `stages.json`)
2. `data/index.json` has no entry for this `year` + `slug`
3. You cannot resolve identifiers from `{{RACE_NAME}}` / `{{IDS_JSON}}`

Report why you stopped in your final summary.

If the race is already complete and correct for every scoped file, **make no file changes**.

## Identifiers

Use the `{{IDS_JSON}}` block (from `scripts/race-ids.mjs`) consistently. Prefer `botMetaBranch` for the PR branch name when publishing via CI.

## Scope — files you may update

All paths under `{dataDir}/` unless noted:

| File | What to do |
|------|------------|
| `teams.json` | Backfill when empty/`[]` or clearly outdated once an official start list is published |
| `route-features.json` | Add missing climbs, intermediate sprints, and cobbles; fix verified errors; ensure every stage id is present |
| `stages.json` | Correct verified route metadata only: distance, elevation, locations, `stageType`, `startTime`, `expectedFinishTime`, `currentStage`, `gpxUrl`, `tvLink`. Do **not** change `status` based on race day results |
| `classifications.json` | Create or fix only when missing/empty and jersey metadata is verifiable |
| `gpx/stage-{N}-route.gpx` | Download missing GPX when available from allowed sources |
| `data/index.json` | Refresh derived catalog fields when stages change; update/clear `startlistNotes` when the start list is filled; preserve `name`, `country`, `edition`, `raceCategory`, `gpxAttribution` unless correcting a verified error |

## Do not update

- `results.json`
- `gc/`, `points/`, `kom/`, `youth/`
- Stage `status` driven by live/finished results (daily agent)

Do not create `profile-climbs.json`.

## Route features

Same schema as create-race — author directly in `route-features.json`:

| `kind` | Required | Notes |
|--------|----------|-------|
| `climb` | `id`, `name`, `kind`, `distanceKm`, `category` | UCI 1–4 |
| `sprint` | `id`, `name`, `kind`, `distanceKm` | Intermediate sprint |
| `cobble` | `id`, `name`, `kind`, `distanceKm` | When on the official profile |

- IDs: `stage-{n}-climb-{i}`, `stage-{n}-sprint-{i}`, `stage-{n}-cobble-{i}`
- Sort by `distanceKm` ascending within each stage
- Prefer filling **gaps** (missing sprints/climbs) over rewriting entire stages when existing data is correct

## Teams / start list

- Never invent riders or bibs
- When backfilling from a newly published list, match spelling to the official source and use bib blocks of 10
- After filling a previously empty list, remove or rewrite `startlistNotes` so it no longer says the list is unpublished (keep other caveats if still true)

## Stages

- Preserve existing `status` values unless you are fixing an obvious data error unrelated to results (e.g. a typo). Prefer leaving status alone.
- Recompute `expectedFinishTime` only when distance, stage type, or `startTime` changes — see [`skills/expected-finish-time.md`](skills/expected-finish-time.md)
- Elevation: [`skills/elevation-gain.md`](skills/elevation-gain.md)

## Allowed sources

Prefer, in order:

1. **Official race website** (route, start list, profiles)
2. [BikeRaceInfo](https://bikeraceinfo.com)
3. [cyclingstage.com](https://www.cyclingstage.com) — GPX, profiles, climbs, sprints, start lists
4. Wikipedia — **route overview only**

Do not use paywalled or user-generated wikis as primary sources for bibs or numeric course data.

## Rules

1. **Never invent** riders, bibs, route features, or GPX.
2. Keep edits minimal: no formatting-only churn.
3. Valid JSON (2-space indent, trailing newline).
4. Match style of existing race folders (e.g. `data/2026/giro-d-italia/`).

## Workflow summary

1. Resolve IDs via `{{IDS_JSON}}` / `race-ids.mjs`
2. Confirm race exists under `{dataDir}/` and in `index.json`
3. Audit current `teams.json`, `route-features.json`, `stages.json`, `classifications.json`, GPX coverage
4. Research gaps from allowed sources
5. Write only the files that need updates
6. Refresh `index.json` derived fields / `startlistNotes` as needed; set `updatedAt` to today if anything changed
7. Summarize: what was missing, what was added/fixed, remaining gaps, source URLs
