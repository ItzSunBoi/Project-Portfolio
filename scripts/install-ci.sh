#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

command -v flock >/dev/null || {
  echo "install-ci.sh requires Linux flock." >&2
  exit 69
}
command -v timeout >/dev/null || {
  echo "install-ci.sh requires GNU timeout." >&2
  exit 69
}

runtime_root="${SITES_PROJECT_ROOT}/.sites-runtime"
expected_cache="${runtime_root}/npm-cache"
lock_file="${runtime_root}/install.lock"

exec 9>"${lock_file}"
if ! flock -n 9; then
  echo "Another dependency install is already running." >&2
  exit 75
fi

echo "[sites] running one bounded npm ci"
timeout \
  --signal=TERM \
  --kill-after="${SITES_INSTALL_KILL_AFTER:-15s}" \
  "${SITES_INSTALL_TIMEOUT:-8m}" \
  npm ci --cache "${expected_cache}"

astro="${SITES_PROJECT_ROOT}/node_modules/.bin/astro"
if [[ ! -x "${astro}" ]]; then
  echo "npm ci succeeded but Astro is unavailable." >&2
  exit 69
fi

echo "[sites] npm ci passed and Astro is available"
