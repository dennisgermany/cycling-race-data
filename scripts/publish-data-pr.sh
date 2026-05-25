#!/usr/bin/env bash
set -euo pipefail

BOT_BRANCH="${BOT_BRANCH:-bot/giro-d-italia-2026}"
DATA_DIR="data"

if git diff --quiet -- "${DATA_DIR}" && git diff --cached --quiet -- "${DATA_DIR}"; then
  echo "No changes under ${DATA_DIR}; skipping PR publish."
  exit 0
fi

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

# Infer highest finished stage from stages file for commit message (best-effort).
STAGE_NOTE=""
if [[ -f data/2026/giro-d-italia/giro-d-italia-2026-stages.js ]]; then
  LAST=$(grep -c "status: 'finished'" data/2026/giro-d-italia/giro-d-italia-2026-stages.js || true)
  if [[ -n "${LAST}" && "${LAST}" != "0" ]]; then
    STAGE_NOTE=" through stage ${LAST}"
  fi
fi

COMMIT_MSG="chore(data): giro 2026 results${STAGE_NOTE}"

git checkout -B "${BOT_BRANCH}"
git add -- "${DATA_DIR}"
git commit -m "${COMMIT_MSG}"

git push -u origin "${BOT_BRANCH}"

if gh pr list --head "${BOT_BRANCH}" --state open --json number --jq 'length' | grep -q '^0$'; then
  gh pr create \
    --head "${BOT_BRANCH}" \
    --title "Giro d'Italia 2026 — data update" \
    --body "$(cat <<'EOF'
## Summary

Automated update of Giro d'Italia 2026 data under `data/2026/giro-d-italia/` (stages, stage results, provisional GC, GC-by-stage snapshots).

## Test plan

- [ ] Review diff for newly finished stages only
- [ ] Confirm team names match `giro-d-italia-2026-teams.js`
- [ ] Spot-check stage results and GC against [BikeRaceInfo](https://bikeraceinfo.com) or official Giro results

EOF
)"
  echo "Created new pull request for branch ${BOT_BRANCH}."
else
  echo "Open pull request already exists for ${BOT_BRANCH}; push updated the PR."
fi
