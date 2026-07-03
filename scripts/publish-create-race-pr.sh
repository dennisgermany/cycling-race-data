#!/usr/bin/env bash
set -euo pipefail

BOT_BRANCH="${BOT_BRANCH:?BOT_BRANCH is required}"
DATA_DIR="data"
PR_TITLE="${PR_TITLE:?PR_TITLE is required}"
COMMIT_MSG="${COMMIT_MSG:?COMMIT_MSG is required}"
PR_BODY="${PR_BODY:-}"

if git diff --quiet -- "${DATA_DIR}" && git diff --cached --quiet -- "${DATA_DIR}"; then
  echo "No changes under ${DATA_DIR}; skipping PR publish."
  exit 0
fi

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

git checkout -B "${BOT_BRANCH}"
git add -- "${DATA_DIR}"
git commit -m "${COMMIT_MSG}"

git push -u origin "${BOT_BRANCH}"
echo "Pushed ${BOT_BRANCH} to origin."

pr_url() {
  if [[ -n "${GITHUB_SERVER_URL:-}" && -n "${GITHUB_REPOSITORY:-}" ]]; then
    echo "${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/compare/${BOT_BRANCH}?expand=1"
    return
  fi
  local remote
  remote="$(git remote get-url origin 2>/dev/null || true)"
  if [[ "${remote}" =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
    echo "https://github.com/${BASH_REMATCH[1]}/${BASH_REMATCH[2]}/compare/${BOT_BRANCH}?expand=1"
  fi
}

open_pr_count() {
  gh pr list --head "${BOT_BRANCH}" --state open --json number --jq 'length'
}

create_pr() {
  if [[ -n "${PR_BODY}" ]]; then
    gh pr create --head "${BOT_BRANCH}" --title "${PR_TITLE}" --body "${PR_BODY}"
  else
    gh pr create --head "${BOT_BRANCH}" --title "${PR_TITLE}" --body "Automated race scaffold — please review before merging."
  fi
}

ensure_pr() {
  if [[ "$(open_pr_count)" != "0" ]]; then
    echo "Open pull request already exists for ${BOT_BRANCH}; push updated it."
    return 0
  fi

  set +e
  create_pr
  local create_err=$?
  set -e

  if [[ "${create_err}" -eq 0 ]]; then
    echo "Created new pull request for branch ${BOT_BRANCH}."
    return 0
  fi

  compare_link="$(pr_url || true)"
  echo "::warning::Could not create pull request automatically (exit ${create_err})." >&2
  echo "" >&2
  echo "GitHub often blocks PR creation from the default GITHUB_TOKEN unless the repo allows it." >&2
  echo "" >&2
  echo "Fix (pick one):" >&2
  echo "  1. Repo Settings → Actions → General → Workflow permissions" >&2
  echo "     → enable \"Allow GitHub Actions to create and approve pull requests\"" >&2
  echo "  2. Add secret GH_PR_TOKEN (repo + pull_requests) and re-run." >&2
  echo "" >&2
  if [[ -n "${compare_link}" ]]; then
    echo "Open a PR manually: ${compare_link}" >&2
  fi
  return 1
}

if ! ensure_pr; then
  exit 0
fi

echo "Pull request ready for manual review (auto-merge disabled for race creation)."
