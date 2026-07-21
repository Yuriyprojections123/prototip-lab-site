#!/bin/bash
set -euo pipefail

SITE_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=4173

while lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

URL="http://localhost:$PORT"
echo "ПРОТОТИП LAB"
echo "Opening $URL"
(sleep 1; open "$URL") &

cd "$SITE_DIR"

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT"
elif command -v ruby >/dev/null 2>&1; then
  exec ruby -run -e httpd . -p "$PORT"
else
  echo "Python 3 or Ruby is required. Install Python with: brew install python"
  read -r -p "Press Enter to close..."
  exit 1
fi
