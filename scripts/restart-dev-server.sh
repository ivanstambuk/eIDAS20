#!/bin/bash
#
# Restart the Vite dev server on a fixed port (default: 5173).
#
# Handles the full lifecycle:
# 1. Kill existing Vite process (using [v]ite trick to avoid self-kill)
# 2. Clear Tailscale serve binding that holds the port
# 3. Start Vite with --strictPort to fail fast if port is still occupied
# 4. Re-enable Tailscale proxy for remote access
#
# Usage: ./scripts/restart-dev-server.sh [port]
#
# Why this script exists:
# - pkill -f "vite" kills itself when used in compound commands
# - Tailscale serve holds the port even after Vite exits
# - Vite auto-increments ports silently, breaking bookmarked URLs
#

set -euo pipefail

PORT="${1:-5173}"
DOCS_DIR="$(cd "$(dirname "$0")/../docs-portal" && pwd)"
LOG="/tmp/vite-eidas.log"

echo "🔄 Restarting dev server on port $PORT..."

# Step 1: Kill existing Vite (bracket trick prevents self-kill)
timeout 5 pkill -f "[v]ite" 2>/dev/null || true
sleep 1

# Step 2: Clear Tailscale serve binding (holds port after Vite exits)
sudo tailscale serve --https="$PORT" off 2>/dev/null || true
sleep 1

# Step 3: Verify port is free
if lsof -ti:"$PORT" >/dev/null 2>&1 || sudo lsof -ti:"$PORT" >/dev/null 2>&1; then
    echo "⚠️  Port $PORT still occupied, force-killing..."
    sudo lsof -ti:"$PORT" 2>/dev/null | xargs -r sudo kill -9
    sleep 1
fi

# Step 4: Start Vite with strict port (fail fast, don't auto-increment)
cd "$DOCS_DIR"
nohup npx vite --host --port "$PORT" --strictPort > "$LOG" 2>&1 &
VITE_PID=$!

# Step 5: Wait for server to be ready
for i in $(seq 1 10); do
    if grep -q "Local:" "$LOG" 2>/dev/null; then
        break
    fi
    sleep 1
done

if grep -q "Local:" "$LOG" 2>/dev/null; then
    LOCAL_URL=$(grep -m1 "Local:" "$LOG" | sed 's/.*Local: *//')
    echo "✅ Dev server running: $LOCAL_URL (PID: $VITE_PID)"
else
    echo "❌ Dev server failed to start. Log:"
    cat "$LOG"
    exit 1
fi

# Step 6: Re-enable Tailscale proxy for remote access
sudo tailscale serve --bg --https "$PORT" "http://localhost:$PORT" 2>/dev/null && \
    echo "🔗 Tailscale: https://alfred-server.taild8e5b6.ts.net:$PORT/" || \
    echo "⚠️  Tailscale serve not configured (optional)"
