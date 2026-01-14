---
description: Visual validation using browser_subagent (WSL → Windows Chrome)
---
# Browser Testing Workflow

Visual validation of the docs-portal UI using the browser_subagent.

## ⚠️ IMPORTANT: Tab Cleanup Required

**ALWAYS clean up Chrome tabs BEFORE starting any browser_subagent session.**

Chrome has a 6-connection-per-origin limit for HTTP/1.1. Each browser_subagent call creates new tabs, and accumulated tabs will cause SSE/connection failures.

## Prerequisites

1. **WSL networking**: Ensure `.wslconfig` has `networkingMode=mirrored`
2. **Chrome with CDP**: Must be running with remote debugging on port 9222

## Step 1: Clean Up Tabs (REQUIRED)

// turbo
```bash
~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh
```

This closes all tabs except one blank tab, preventing connection limit issues.

## Step 2: Verify Chrome is Accessible

// turbo
```bash
curl -s http://localhost:9222/json/version | head -1
```

If not running, start Chrome with:
```bash
~/dev/eIDAS20/scripts/restart-chrome.sh
```

## Step 3: Ensure Dev Server is Running

// turbo
```bash
curl -s http://localhost:5173/eIDAS20/ > /dev/null && echo "✅ Dev server running" || echo "❌ Start with: cd ~/dev/eIDAS20/docs-portal && npm run dev"
```

If not running, start it:
```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
```

## Step 4: Run Browser Validation

Use `browser_subagent` to navigate to `http://localhost:5173/eIDAS20/` and validate:

1. **Homepage**: Dark theme, cyan accents, stats dashboard, quick links
2. **Terminology**: A-Z index, search, definition cards
3. **Implementing Acts**: Category filters, act cards with status badges
4. **Navigation**: All sidebar links work

## Port Reference

| Port | Service |
|------|---------|
| 5173 | Vite dev server (docs-portal) |
| 9222 | Chrome CDP (remote debugging) |

## Troubleshooting

### Chrome not accessible
```bash
# Restart Chrome
~/dev/eIDAS20/scripts/restart-chrome.sh
```

### Too many tabs / SSE issues
```bash
# Clean up tabs
~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh
```

### Wrong port errors
- **Portal**: Use port **5173** (NOT 5174 which is Alfred's port)
- **Chrome**: Use port **9222** for CDP
