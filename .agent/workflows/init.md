---
description: Prime the agent for working with the eIDAS 2.0 Documentation Portal project
---

# /init - Session Initialization

// turbo-all

Prime the AI agent with eIDAS project context at session start.

---

## 1. Read Core Documentation

// turbo
```bash
cat ~/dev/eIDAS20/AGENTS.md | head -120
```

// turbo
```bash
cat ~/dev/eIDAS20/TERMINOLOGY.md | head -80
```

Pay special attention to:
- Project Structure (docs-portal/, scripts/, regulations)
- Documentation Portal section
- WSL Browser Testing section
- **TERMINOLOGY.md** — shared vocabulary to prevent misunderstandings

---

## 2. Check Project Status (TRACKER.md)

// turbo
```bash
cat ~/dev/eIDAS20/TRACKER.md
```

This is the **source of truth** for:
- Current session state
- Phase progress (which tasks are done/pending)
- Next action to take

---

## 3. Check for Uncommitted Changes

// turbo
```bash
cd ~/dev/eIDAS20 && git status --short
```

If there's WIP from a previous session, note it and ask user if they want to continue.

---

## 4. Check for Pending Tasks

// turbo
```bash
cat ~/dev/eIDAS20/.agent/session/pending-task.md 2>/dev/null || echo "No pending task"
```

**If a pending task file exists:**
1. Read it carefully — contains context from previous session
2. Display: Focus, Status, Next step, Key files
3. Ask: "Continue with this task?"

**If NO pending task:**
- Use TRACKER.md to identify the next task in the current phase
- Make a recommendation based on the implementation plan

---

## 5. Check Available Workflows

// turbo
```bash
ls -la ~/dev/eIDAS20/.agent/workflows/
```

Note available workflows: `/init`, `/handover`, `/browser-testing`, `/formex-converter`.

---

## 6. Check Dev Server Status (if working on portal)

// turbo
```bash
curl -s http://localhost:5173/eIDAS20/ > /dev/null && echo "✅ Portal dev server running" || echo "❌ Portal not running"
```

**If portal is NOT running:**
```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
```

---

## 7. Check Chrome CDP (for browser_subagent)

// turbo
```bash
curl -s http://localhost:9222/json/version | head -1 || echo "❌ Chrome CDP not running"
```

**If Chrome is NOT running:**
```bash
~/dev/eIDAS20/scripts/restart-chrome.sh
```

---

## 7.1. Clean Antigravity Browser Recordings

// turbo
```bash
rm -rf ~/.gemini/antigravity/browser_recordings/* 2>/dev/null && echo "🧹 Cleaned browser recordings" || echo "No recordings to clean"
```

Browser recordings are debug videos from `browser_subagent` sessions. They can grow to **30GB+** over time. Safe to delete — not needed for Antigravity functionality.

---

## After Initialization

Provide a brief summary:

```markdown
## Context Loaded ✓

- **AGENTS.md**: Read (project structure understood)
- **TRACKER.md**: [Current phase and progress %]
- **Git status**: [clean / uncommitted changes]
- **Pending task**: [task from previous session / none]
- **Portal server**: [running on :5173 / not running]
- **Chrome CDP**: [running on :9222 / not running]

## Current Phase: [Phase N]
- **Progress**: X/Y tasks complete
- **Next Task**: [Task N.X: Description]

Ready to continue?
```

Then wait for the user's instructions.

---

## Key Rules Summary

- **Auto-commit:** Commit IMMEDIATELY after each working increment
- **Update TRACKER.md:** Keep progress summary current
- **Browser testing:** Use /browser-testing workflow for visual validation
- **Formex converter:** Use /formex-converter workflow for XML→MD changes

---

## Port Reference

| Port | Service |
|------|---------|
| **5173** | Vite dev server (docs-portal) |
| **9222** | Chrome CDP (remote debugging) |
