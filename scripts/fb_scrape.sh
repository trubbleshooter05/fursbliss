#!/bin/bash
set -euo pipefail
PY="$HOME/.hermes/hermes-agent/.venv/bin/python"
SCRIPT="$(cd "$(dirname "$0")" && pwd)/fb_scraper_v2.py"
exec "$PY" "$SCRIPT" "$@"
