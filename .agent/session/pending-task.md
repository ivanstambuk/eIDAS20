# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: VCQ clarification questions for new requirements VEND-CORE-043/044/045 — now complete and visible
- **Next**: Stakeholder feedback Items 4-7 (OID4VP purpose, RPI_07, intermediary naming, user rejection)
- **Status**: Ready
- **Phase**: VCQ Enhancement (stakeholder feedback processing)

## Key Files

- `docs-portal/config/vcq/requirements/core.yaml` — 42 reqs, VEND-CORE-043/044/045 at bottom
- `docs-portal/config/vcq/clarification-questions/core.yaml` — structured questions (separate from requirements!)
- `docs-portal/scripts/build-vcq-clarifications.js` — builds the clarification JSON from the questions YAML
- `.agent/session/stakeholder-feedback-2026-02-09.md` — Items 1-3 resolved, Items 4-7 open
- `AGENTS.md` — Git workflow section updated with push-after-commit rule

## Context Notes

Things git commits don't capture:

- **Two-file system for clarification questions**: Requirements live in `config/vcq/requirements/*.yaml`, but clarification questions for the UI live in a SEPARATE directory `config/vcq/clarification-questions/*.yaml`. Adding a requirement without adding to both files means the UI won't show the "Clarification Questions" button. This was the root bug.
- **Generated file conflicts**: `vcq-data.json` and other generated files in `public/data/` change on EVERY build. If you accumulate commits without pushing, these files WILL conflict during rebase. The new AGENTS.md rule (one commit → one push) prevents this.
- **Force push was safe**: The overwritten remote commit `475d5d6` was a subset of local commit `261a301` (same feature, fewer lines). Verified via `git diff`.
- **Stakeholder feedback Items 4-7**: These are documented in `.agent/session/stakeholder-feedback-2026-02-09.md` (Items 4-7 sections). They cover OID4VP purpose restriction, RP intermediary RPI_07 alignment, intermediary naming, and user rejection rights.

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Review: VCQ Core tab → VEND-CORE-044 → "Clarification Questions" button should now appear
# Next: Read stakeholder-feedback Items 4-7 and process them
```
