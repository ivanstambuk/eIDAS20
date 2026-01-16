---
description: Generate session handover summary for next agent
---

# Session Handover Workflow

Use this workflow when:
- The user says `/handover`, `handoff`, or "end session"
- Context is getting exhausted and work needs to continue later
- Stopping for the day with pending work

---

## ⚠️ CRITICAL: NO COMMITS DURING HANDOVER

**DO NOT commit anything during handover.**

Rationale: The user typically runs `/init` immediately after in a new session. Committing during handover:
1. Creates unnecessary "handover" commits that clutter history
2. Splits logical changes across commits
3. The next session can commit when real work is complete

**If there are uncommitted changes:** Leave them. The next session will handle them.

---

## Step 1: Update TRACKER.md (IN MEMORY ONLY)

**Update TRACKER.md but DO NOT commit:**

Update these fields:
- Last Updated timestamp
- Session State
- Current Phase (if changed)
- Next Action
- Add session to Recent Sessions table

The TRACKER.md is the **source of truth** for project progress.

---

## Step 2: Create/Update Pending Task File (if incomplete work)

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

## Step 3: Confirm to User

Output ONLY:

```
✅ Handover complete.
- TRACKER.md updated (uncommitted)
- Pending task: `.agent/session/pending-task.md`

Next session: Run `/init` to resume.
```

**DO NOT output the file contents in chat.**
**DO NOT commit anything.**

---

## Important Rules

1. **🚨 NO COMMITS** — Never commit during handover
2. **TRACKER.md is source of truth** — Always update it (but don't commit)
3. **100 LINE HARD CAP** — Prune context notes if needed
4. **Context Notes > History** — Capture decisions/gotchas, not just what was done
5. **If task COMPLETE** — Don't create pending-task.md, just update TRACKER

---

## ⚠️ When Task is COMPLETE: Skip pending-task.md

**If the task you were working on is fully complete:**
- Update TRACKER.md with completion status (don't commit)
- Do NOT create pending-task.md
- The `/init` workflow will read TRACKER.md to find the next task
