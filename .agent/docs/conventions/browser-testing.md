# Browser Testing Reference

> Extracted from AGENTS.md — reference for WSL browser testing with `browser_subagent`.

---

## Port Reference

| Port | Service |
|------|---------|
| **5173** | Vite dev server (docs-portal) |
| **9222** | Chrome CDP (remote debugging) |

## Base URL (CRITICAL for browser_subagent)

**The portal requires the `/eIDAS20/` prefix in all URLs**:
- ✅ CORRECT: `http://localhost:5173/eIDAS20/vcq`
- ❌ WRONG: `http://localhost:5173/vcq`

Without the prefix, the Vite dev server redirects to the correct URL, but browser_subagent may fail to track the page correctly.

---

## Prerequisites

1. **WSL networking**: `.wslconfig` must have `networkingMode=mirrored`
2. **Chrome with CDP**: Must be running with remote debugging on port 9222

---

## Check for Running Dev Server (BEFORE Starting New One)

Always check if a dev server is already running before starting a new one:
```bash
lsof -i :5173 2>/dev/null | head -3
```

If output shows a running process, reuse it. If empty, start a new one:
```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
```

---

## Browser Testing Checklist (MANDATORY before browser_subagent)

**Step 1: Clean Up Tabs (REQUIRED)**
```bash
~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh
```

**Step 2: Verify Chrome is Accessible**
```bash
curl -s http://localhost:9222/json/version | head -1
```
If not running: `~/dev/eIDAS20/scripts/restart-chrome.sh`

**Step 3: Ensure Dev Server is Running**
```bash
curl -s http://localhost:5173/eIDAS20/ > /dev/null && echo "✅ Dev server running" || echo "❌ Start with: cd ~/dev/eIDAS20/docs-portal && npm run dev"
```

---

## Browser Subagent Screenshot Locations

Browser subagent saves screenshots in several locations:

| Type | Path | Description |
|------|------|-------------|
| **Click feedback** | `~/.gemini/antigravity/brain/{conv-id}/.system_generated/click_feedback/` | Screenshots taken after each pixel click |
| **Named screenshots** | `~/.gemini/antigravity/brain/{conv-id}/` | Screenshots captured via `capture_browser_screenshot` |
| **Recording** | `~/.gemini/antigravity/brain/{conv-id}/{recording_name}_{timestamp}.webp` | WebP video of entire session |

**Click feedback screenshots** are the most reliable for verification — they're automatically saved after every click action.

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| Chrome not accessible | `~/dev/eIDAS20/scripts/restart-chrome.sh` |
| Too many tabs / SSE issues | `~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh` |
| Wrong port errors | Portal uses **5173**, Chrome uses **9222** |
| Page not found after navigation | Check URL includes `/eIDAS20/` prefix |
