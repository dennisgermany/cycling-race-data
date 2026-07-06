# Expected finish time

Compute `expectedFinishTime` for every stage in `stages.json` when creating or backfilling a race.

## When to use

- After `startTime`, `distanceKm`, and `currentStage` are set on each stage
- Required for **every** stage before committing `stages.json`

## Prerequisites

Each stage must have:

- `startTime` — ISO-8601 with offset (official local start from timetable)
- `distanceKm` — stage distance
- `currentStage` — includes stage type suffix: `flat`, `hilly`, `mountain`, `ITT`, or `TTT`

## Parse stage type

From the trailing token in `currentStage`:

```text
"Stage 1 — 156 km (Nessebar → Burgas), flat"  →  flat
```

Regex: `/,\s*(flat|hilly|mountain|ITT|TTT)\s*$/i` — default `flat` if unmatched.

## Average speeds (km/h)

| Type | km/h |
|------|------|
| flat | 41 |
| hilly | 36 |
| mountain | 33 |
| ITT | 45 |
| TTT | 50 |

These constants live in [`scripts/expected-finish-time.mjs`](../scripts/expected-finish-time.mjs) — use the script as the canonical calculator.

## Formula

```text
durationHours = distanceKm / avgSpeed
expectedFinishTime = startTime + durationHours
```

Round the finish instant to the **nearest minute**. Keep the **same UTC offset** as `startTime`.

## Helper script

```bash
node scripts/expected-finish-time.mjs "2026-05-08T13:10:00+03:00" 156 flat
# → 2026-05-08T16:58:00+03:00

node scripts/expected-finish-time.mjs --stage-json '{"startTime":"2026-05-08T13:10:00+03:00","distanceKm":156,"currentStage":"Stage 1 — 156 km, flat"}'
```

## Sanity checks

- ITT/TTT must finish much sooner than a flat road stage of similar distance
- Mountain estimate should be later than flat for the same distance
- `expectedFinishTime` must be after `startTime`
- Use the same offset on both fields (e.g. both `+02:00` in July France)

## Do not

- Store finish times in `results.json` — only in `stages.json` as `expectedFinishTime`
- Recalculate on daily result updates unless `startTime`, `distanceKm`, or stage type changed
