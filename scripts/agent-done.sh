#!/bin/bash
# agent-done.sh — Combined context calculation + notification for Antigravity agent
#
# Usage: ~/dev/eIDAS20/scripts/agent-done.sh <ctx_remaining> "<message>"
# Example: ~/dev/eIDAS20/scripts/agent-done.sh 98635 "[Gemini] Fixed the Amendment History bug"
#
# Ported from Alfred project. Ensures context % is always calculated with bc (not mental math).

set -e

CTX_REMAINING=$1
MESSAGE=$2
CTX_TOTAL=200000

if [ -z "$CTX_REMAINING" ] || [ -z "$MESSAGE" ]; then
    echo "Usage: $0 <ctx_remaining> \"<message>\""
    echo "Example: $0 98635 \"[Gemini] Fixed the bug\""
    exit 1
fi

# Calculate context percentage with bc
PCT=$(echo "scale=0; ($CTX_TOTAL - $CTX_REMAINING) * 100 / $CTX_TOTAL" | bc)

# Run notification (codex-notify is globally available)
if command -v codex-notify &> /dev/null; then
    codex-notify "{\"type\": \"agent-turn-complete\", \"last-assistant-message\": \"$MESSAGE\"}"
fi

# Output for agent to include in response
echo ""
echo "📊 Context: ${PCT}% consumed"

if [ "$PCT" -ge 75 ]; then
    echo "⚠️ Context at ${PCT}% consumed — recommend /retro then /handover for clean session"
fi
