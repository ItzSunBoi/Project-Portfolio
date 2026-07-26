#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

astro="${SITES_PROJECT_ROOT}/node_modules/.bin/astro"
if [[ ! -x "${astro}" ]]; then
  echo "Astro is unavailable. Run npm run install:ci before building." >&2
  exit 69
fi

echo "Running bounded Astro build..."
if command -v timeout >/dev/null; then
  timeout \
    --signal=TERM \
    --kill-after="${SITES_BUILD_KILL_AFTER:-10s}" \
    "${SITES_BUILD_TIMEOUT:-3m}" \
    "${astro}" build
else
  "${astro}" build
fi

mkdir -p \
  "${SITES_PROJECT_ROOT}/dist/server" \
  "${SITES_PROJECT_ROOT}/dist/.openai"

cp \
  "${SITES_PROJECT_ROOT}/worker/index.js" \
  "${SITES_PROJECT_ROOT}/dist/server/index.js"
cp \
  "${SITES_PROJECT_ROOT}/.openai/hosting.json" \
  "${SITES_PROJECT_ROOT}/dist/.openai/hosting.json"

"${script_dir}/validate-artifact.sh"
