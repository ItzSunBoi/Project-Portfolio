#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dist="${project_root}/dist"

[[ -f "${dist}/index.html" ]] || {
  echo "Missing static entry point: dist/index.html" >&2
  exit 66
}
[[ -f "${dist}/404.html" ]] || {
  echo "Missing static error page: dist/404.html" >&2
  exit 66
}

[[ ! -e "${dist}/credentials/index.html" ]] || {
  echo "Privacy check failed: credentials route was generated." >&2
  exit 65
}
[[ ! -e "${dist}/api/contact" ]] || {
  echo "Privacy check failed: contact API was generated." >&2
  exit 65
}

echo "Validated static artifact and privacy-sensitive route exclusions."
