#!/bin/bash
# Use Hermes venv — system python3 on this Mac lacks playwright (and pip is broken on 3.14).
set -euo pipefail
PY="$HOME/.hermes/hermes-agent/.venv/bin/python"
SCRIPT="$(cd "$(dirname "$0")" && pwd)/fb_scraper_v2.py"
exec "$PY" "$SCRIPT" --login "$@"
