#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
astro="${project_root}/node_modules/.bin/astro"

if [[ ! -x "${astro}" ]]; then
  echo "Astro is unavailable. Run npm ci before building." >&2
  exit 69
fi

echo "Building static portfolio..."
if command -v timeout >/dev/null; then
  timeout \
    --signal=TERM \
    --kill-after="${BUILD_KILL_AFTER:-10s}" \
    "${BUILD_TIMEOUT:-3m}" \
    "${astro}" build
else
  "${astro}" build
fi

"${project_root}/scripts/validate-artifact.sh"
