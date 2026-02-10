#!/bin/bash
# agent-done.sh — Combined context calculation + notification for Antigravity agent
#
# Usage: ~/dev/eIDAS20/scripts/agent-done.sh <ctx_remaining> "<message>"
# Example: ~/dev/eIDAS20/scripts/agent-done.sh 98635 "[Gemini] Fixed the Amendment History bug"
#
# If ctx_remaining is 0 or omitted, context % is skipped (platform doesn't provide it).

set -e

CTX_REMAINING=${1:-0}
MESSAGE=$2
CTX_TOTAL=200000

if [ -z "$MESSAGE" ]; then
    echo "Usage: $0 <ctx_remaining> \"<message>\""
    echo "  ctx_remaining: tokens left (0 = unknown/skip)"
    echo "Example: $0 98635 \"[Gemini] Fixed the bug\""
    exit 1
fi

# Run notification (codex-notify is globally available)
if command -v codex-notify &> /dev/null; then
    codex-notify "{\"type\": \"agent-turn-complete\", \"last-assistant-message\": \"$MESSAGE\"}"
fi

# Only show context % if we have a real value (not 0)
if [ "$CTX_REMAINING" -gt 0 ] 2>/dev/null; then
    PCT=$(echo "scale=0; ($CTX_TOTAL - $CTX_REMAINING) * 100 / $CTX_TOTAL" | bc)
    echo ""
    echo "📊 Context: ${PCT}% consumed"
    if [ "$PCT" -ge 75 ]; then
        echo "⚠️ Context at ${PCT}% consumed — recommend /retro then /handover for clean session"
    fi
fi
