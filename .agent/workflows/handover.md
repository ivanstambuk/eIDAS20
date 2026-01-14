---
description: Generate session handover summary for next agent
---

# Session Handover Workflow

Use this workflow when:
- The user says `/handover`, `handoff`, or "end session"
- Context is getting exhausted and work needs to continue later
- Stopping for the day with pending work

---

## Step 1: Commit Pending Changes

```bash
cd ~/dev/eIDAS20 && git status
# If dirty, commit with appropriate message
git add -A && git commit -m "wip: [brief description of state]"
```

---

## Step 2: Update TRACKER.md

**ALWAYS update TRACKER.md before handover:**

```bash
# Update these fields:
# - Last Updated timestamp
# - Session State
# - Current Phase
# - Next Action
# - Any task status changes
```

The TRACKER.md is the **source of truth** for project progress.

---

## Step 3: Create/Update Pending Task File (if incomplete work)

**File**: `.agent/session/pending-task.md`

### ⚠️ HARD CAP: 100 LINES MAXIMUM

### Template:

```markdown
# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: [1-2 sentences: what we're working on]
- **Next**: [the ONE thing to do when resuming]
- **Status**: [In Progress / Blocked / Ready]
- **Phase**: [Phase N, Task N.X]

## Key Files

- `path/to/file1.jsx` — [why relevant]
- `path/to/file2.css` — [why relevant]
(max 7 files)

## Context Notes

Things git commits don't capture:
- [Decision made and why]
- [Gotcha discovered]
- [Thing tried that didn't work]

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Then: [what to test]
```
```

---

## Step 4: Confirm to User

Output ONLY:

```
✅ Handover complete.
- TRACKER.md updated
- Pending task: `.agent/session/pending-task.md`

Next session: Run `/init` to resume.
```

**DO NOT output the file contents in chat.**

---

## Step 5: Cleanup Check

Before ending:
- [ ] All changes committed (or WIP committed)
- [ ] TRACKER.md updated with current progress
- [ ] pending-task.md created (if work incomplete)
- [ ] Dev server status noted

---

## Important Rules

1. **TRACKER.md is source of truth** — Always update it
2. **100 LINE HARD CAP** — Prune context notes if needed
3. **Context Notes > History** — Capture decisions/gotchas, not just what was done
4. **If task COMPLETE** — Don't create pending-task.md, just update TRACKER

---

## ⚠️ When Task is COMPLETE: Skip pending-task.md

**If the task you were working on is fully complete:**
- Update TRACKER.md with completion status
- Do NOT create pending-task.md
- The `/init` workflow will read TRACKER.md to find the next task
