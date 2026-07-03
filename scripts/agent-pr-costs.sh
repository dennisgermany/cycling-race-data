#!/usr/bin/env bash
# Shared helpers for agent cost tracking in PR publish scripts.
# Source from publish-*-pr.sh; expects BOT_BRANCH to be set.

prepare_cumulative_metrics() {
  mkdir -p run-metrics

  local prev="run-metrics/prev-cumulative.json"
  rm -f "${prev}"

  git fetch origin "${BOT_BRANCH}" 2>/dev/null || true
  if git rev-parse "origin/${BOT_BRANCH}" >/dev/null 2>&1; then
    if git show "origin/${BOT_BRANCH}:run-metrics/cumulative.json" > "${prev}" 2>/dev/null; then
      echo "Loaded previous cumulative metrics from origin/${BOT_BRANCH}."
    else
      rm -f "${prev}"
    fi
  fi

  if [[ -f run-metrics/latest.json ]]; then
    if [[ -f "${prev}" ]]; then
      node scripts/update-cumulative-metrics.mjs \
        run-metrics/latest.json \
        "${prev}" \
        run-metrics/cumulative.json
    else
      node scripts/update-cumulative-metrics.mjs \
        run-metrics/latest.json \
        run-metrics/cumulative.json
    fi
  else
    echo "::warning::run-metrics/latest.json not found; skipping cumulative metrics." >&2
  fi
}

append_costs_to_pr_body() {
  local base_body="$1"
  local costs
  costs="$(node scripts/format-agent-costs.mjs)"
  printf '%s\n\n%s' "${base_body}" "${costs}"
}

update_open_pr_body() {
  local body="$1"
  local pr_number
  pr_number="$(gh pr view "${BOT_BRANCH}" --json number --jq .number 2>/dev/null)" || return 0
  gh pr edit "${pr_number}" --body "${body}"
  echo "Updated PR #${pr_number} body with agent costs."
}
