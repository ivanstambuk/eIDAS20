---
description: Visual validation using browser_subagent (WSL → Windows Chrome)
---
# Browser Testing Workflow

Visual validation of the docs-portal UI using the browser_subagent.

## Prerequisites

1. **WSL networking**: Ensure `.wslconfig` has `networkingMode=mirrored`
2. **Chrome with CDP**: Run `scripts/restart-chrome.sh` to start Chrome with remote debugging

## Step 1: Start Chrome with Remote Debugging

// turbo
```bash
~/dev/eIDAS20/scripts/restart-chrome.sh
```

This starts Chrome on Windows with:
- Remote debugging on port **9222**
- Isolated profile (`ag-cdp`) — doesn't affect your regular Chrome
- `about:blank` tab ready for testing

## Step 2: Verify Chrome is Accessible

// turbo
```bash
curl -s http://localhost:9222/json/version | head -1
```

Expected: JSON output with `"Browser":` field.

## Step 3: Clean Up Stale Tabs (Optional)

If you've run browser_subagent multiple times and are seeing issues:

// turbo
```bash
~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh
```

**Why:** Each browser_subagent call creates a new tab. After 6+ tabs, Chrome's per-origin connection limit can cause failures.

## Step 4: Start Dev Server

// turbo
```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
```

The dev server runs at: **http://localhost:5173/eIDAS20/**

## Step 5: Run Browser Validation

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
