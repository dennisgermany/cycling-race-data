# Elevation gain (elevationGainM)

Set **`elevationGainM`** (integer metres climbed / D+) on every stage when creating or backfilling a race.

## When to use

- When writing or updating `stages.json` (together with `distanceKm`, `stageType`, route towns)
- Required before committing a new race; refresh when stage routes change

## Primary sources (in order)

1. **Official race website** — stage page “Altitude Gain” / “D+” (e.g. [letour.fr](https://www.letour.fr), [giroditalia.it](https://www.giroditalia.it))
2. [cyclingstage.com](https://www.cyclingstage.com) — route or favourites previews (“X metres of climbing / elevation gain”)
3. [BikeRaceInfo](https://bikeraceinfo.com) — stage pages

Use the **published integer** from the best source. Store as integer metres (no decimals).

## Typical labels

| Source | Label |
|--------|--------|
| Tour de France | `D+ 2500 m` |
| Giro d'Italia | `Altitude Gain 4600m` |
| cyclingstage | `2,500 metres of climbing` |

Convert feet to metres if needed: `m = round(ft × 0.3048)`.

## GPX fallback (last resort)

Only when no published value exists **and** a local GPX with `<ele>` is available:

```bash
node scripts/gpx-elevation-gain.mjs data/{year}/{slug}/gpx/stage-N-route.gpx
# or fill all missing fields:
node scripts/backfill-elevation-gain.mjs data/{year}/{slug}/stages.json --sync-index
```

`backfill-elevation-gain.mjs` **never overwrites** existing `elevationGainM`.

Note in the agent summary when a value came from GPX fallback.

## Race total (`index.json`)

- **`elevationGainM`**: sum of all stage `elevationGainM` values (required on new races, like `distanceKm`)
- Recompute when `stages.json` changes

## Plausibility checks

- Flat / sprint stages: often &lt; 1,500 m (exceptions: lumpy “flat” days)
- ITT / TTT: usually low (TTT team stage can still be a few hundred metres)
- Mountain stages: typically 3,000–5,500 m for long GT days
- Total race elevation should be in the same ballpark as organiser marketing copy (e.g. Giro ~48,000 m)

## Do not

- Prefer GPX over an official published D+ when both exist
- Invent elevation without a source or GPX fallback
- Store max altitude (summit height) — only **total climbing**
