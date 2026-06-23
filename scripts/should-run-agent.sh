#!/usr/bin/env bash
# Exit 0 and print "true" if data/index.json lists any race with status != finished.
# Otherwise print "false". Used by the scheduled GitHub Actions workflow.
set -euo pipefail

INDEX="${1:-data/index.json}"

if [[ ! -f "${INDEX}" ]]; then
  echo "false"
  exit 0
fi

count="$(jq '[.races[]? | select(.status != "finished")] | length' "${INDEX}")"

if [[ "${count}" -gt 0 ]]; then
  echo "true"
else
  echo "false"
fi
