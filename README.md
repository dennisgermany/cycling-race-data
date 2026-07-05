# Cycling race data agent

Daily [Cursor SDK](https://cursor.com/docs/sdk/typescript) agent (local runtime on GitHub Actions) that updates results for every active race listed in [`data/index.json`](data/index.json) when stages finish. Changes land on `main` via an automated pull request that the workflow merges when GitHub allows it.

Race data is stored as **JSON files** under `data/`. The same files are served as a read-only REST API on GitHub Pages.

## REST API

After enabling GitHub Pages (Settings → Pages → branch `main`, folder `/ (root)`):

| Resource | URL |
|----------|-----|
| API docs (Swagger UI) | `https://<owner>.github.io/cycling-race-data/docs/` |
| OpenAPI spec | `https://<owner>.github.io/cycling-race-data/openapi.yaml` |
| Race catalog | `https://<owner>.github.io/cycling-race-data/data/index.json` |
| Giro stages | `https://<owner>.github.io/cycling-race-data/data/2026/giro-d-italia/stages.json` |
| Results + GC | `https://<owner>.github.io/cycling-race-data/data/2026/giro-d-italia/results.json` |

Example:

```bash
curl https://<owner>.github.io/cycling-race-data/data/index.json
curl https://<owner>.github.io/cycling-race-data/data/2026/giro-d-italia/stages.json
```

See [`openapi.yaml`](openapi.yaml) for the full endpoint list and JSON schemas.

Validate JSON locally:

```bash
npm run validate:json
```

## Create a new race

Actions → **Create race** → *Run workflow* → enter the display name (e.g. `Tour de France`). The workflow:

1. Derives `year` (current UTC calendar year), `slug`, and file names via [`scripts/race-ids.mjs`](scripts/race-ids.mjs)
2. Runs the Cursor agent with [`prompts/create-race.md`](prompts/create-race.md) and [`AGENTS-create-race.md`](AGENTS-create-race.md)
3. Opens a pull request on `bot/create-{slug}-{year}` for **manual review** (no auto-merge)

Scaffolded files match the Giro layout: `stages.json`, `teams.json`, `profile-climbs.json`, `route-features.json`, GPX (when available), empty `results.json` / GC stubs, and an `index.json` entry.

Local run:

```bash
export CURSOR_API_KEY=...
npm ci
node scripts/expand-create-race-prompt.mjs "Tour de France" 2026 -o /tmp/create-race-prompt.md
AGENT_PROMPT_FILE=/tmp/create-race-prompt.md npm run agent
```

## Schedule (results update)

- **Automatic:** once daily at **18:00 UTC** (= 20:00 CEST in summer; 19:00 CET in winter), **only when** [`data/index.json`](data/index.json) lists at least one race with `status` other than `finished` (`upcoming` or `live`)
- **Manual:** Actions → *Update cycling data* → *Run workflow* (optional prompt override; always runs, even if all races are `finished`)

The agent processes each race in the index whose `status` is not `finished`, skipping races that are already complete.

## Setup

1. Add repository secret **`CURSOR_API_KEY`** ([Cursor dashboard](https://cursor.com/dashboard)).
2. Allow the workflow to **create, approve, and merge pull requests**:
   - **Recommended:** GitHub repo → **Settings** → **Actions** → **General** → **Workflow permissions** → enable **Allow GitHub Actions to create and approve pull requests**, then save.
   - **Alternative:** Add secret **`GH_PR_TOKEN`** — a PAT with `contents` and `pull_requests` on this repo (used for `gh` instead of `GITHUB_TOKEN`).

   If branch protection requires reviews or checks, allow the `github-actions[bot]` to bypass or merge when checks pass; otherwise the workflow pushes the branch and logs a manual merge link.

3. **GitHub Pages:** Settings → Pages → deploy from branch `main`, folder **`/ (root)`**. Add `.nojekyll` at the repo root (already present) so Jekyll does not interfere.

## What gets updated

| File | Content |
|------|---------|
| `data/index.json` | Race catalog and aggregated race `status` |
| `stages.json` | Stage `status` |
| `results.json` | Per-stage top 25, provisional GC |
| `gc/after-stage-{n}.json` | GC snapshot after each stage |

Paths above are relative to `data/{year}/{race-slug}/`. Static assets (`teams.json`, `profile-climbs.json`, `route-features.json`, GPX) are not updated by the daily bot. See [`AGENTS.md`](AGENTS.md) and [`prompts/update-cycling-data.md`](prompts/update-cycling-data.md).

## Pull requests

Each run commits to `bot/cycling-data-update`, opens a PR if needed, then **merges** it into the default branch and deletes the bot branch (`gh pr merge --merge --admin --delete-branch`). The next run creates a fresh branch from `main`.

Pull request bodies include an **Agent costs** section (token usage, duration, cumulative totals across re-runs on the same bot branch). Dollar amounts are not provided by the Cursor SDK; optional estimates use `CURSOR_COST_PER_MTOK_INPUT` / `CURSOR_COST_PER_MTOK_OUTPUT` env vars.

## Local run

```bash
export CURSOR_API_KEY=...
npm ci
npm run agent
```

Optional environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `AGENT_PROMPT` | (file) | Override prompt text entirely |
| `AGENT_PROMPT_FILE` | `prompts/update-cycling-data.md` | Read prompt from file (`AGENT_PROMPT` takes precedence) |
| `AGENT_METRICS_FILE` | `run-metrics/latest.json` | Where run-agent writes token/duration metrics |
| `CURSOR_COST_PER_MTOK_INPUT` | (unset) | Optional USD estimate in PR (per million input tokens) |
| `CURSOR_COST_PER_MTOK_OUTPUT` | (unset) | Optional USD estimate in PR (per million output tokens) |
| `AGENT_LOG_LEVEL` | `info` | `error` · `warn` · `info` · `debug` |
| `AGENT_LOG_FORMAT` | text | Set to `json` for JSON lines on stderr |

Logs (thinking, tools, status, steps) go to **stderr**. Streaming text is **buffered** and printed as whole paragraphs (not one line per token). Token-level detail is available with `AGENT_LOG_LEVEL=debug`. The final agent summary is printed to **stdout** after the run completes.

## Data layout

Data lives under `data/{year}/{race-slug}/`. [`data/index.json`](data/index.json) is the entry point for consumers that need a list of available races and each race's `status` (`upcoming`, `live`, or `finished`). Use the **Create race** workflow to scaffold new events; the daily update agent picks them up automatically once they appear in the index.

```
data/
├── index.json
└── {year}/{race-slug}/
    ├── stages.json
    ├── teams.json
    ├── results.json
    ├── profile-climbs.json
    ├── route-features.json
    ├── gc/
    │   └── after-stage-{n}.json
    └── gpx/
        └── stage-{n}-route.gpx
```
