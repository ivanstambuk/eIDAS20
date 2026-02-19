#!/bin/bash
# Resilient Vite dev server wrapper
# Auto-restarts on crash with backoff. Ctrl+C to stop.

PORT="${1:-5175}"
BACKOFF=1
MAX_BACKOFF=10

cd "$(dirname "$0")/.." || exit 1

while true; do
    echo "🚀 Starting Vite dev server on port $PORT..."
    npx vite --port "$PORT" --host 2>&1
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ] || [ $EXIT_CODE -eq 130 ]; then
        # Clean exit or Ctrl+C — don't restart
        echo "🛑 Server stopped cleanly (exit $EXIT_CODE)"
        break
    fi
    
    echo "⚠️  Server crashed (exit $EXIT_CODE). Restarting in ${BACKOFF}s..."
    sleep "$BACKOFF"
    BACKOFF=$((BACKOFF < MAX_BACKOFF ? BACKOFF + 1 : MAX_BACKOFF))
done
