# DEC-255: VCQ Source Selection Simplification

## Decision
Simplify the VCQ source selection UI from 4-tile × 9 checkboxes to 3-tile × 4 checkboxes.

## Status
**Accepted** — 2026-01-26

## Context

The original VCQ source selection UI had:
- **Primary** tile: 2 checkboxes (eIDAS 2.0, Amendment)
- **Implementing Acts** tile: 4 checkboxes (Integrity, Protocols, Suspension, Registration)
- **Related Regulations** tile: 2 checkboxes (GDPR, DORA)
- **Architecture** tile: 1 checkbox (ARF)

This created false optionality — users could technically deselect implementing acts from eIDAS, which makes no legal sense (implementing acts ARE the regulation).

## Problem Statement

1. **Legal inaccuracy**: Separating primary regulations from implementing acts suggests they're independent
2. **UX overload**: 9 checkboxes is overwhelming for a simple filter operation
3. **Wrong mental model**: The UI implied "opt-in/opt-out" instead of "filter by source"

## Decision Details

### New 3-Tile Model

| Tile | Toggle | Contents |
|------|--------|----------|
| **📜 Primary (eIDAS Framework)** | Single checkbox | eIDAS 2.0 + Amendment + all 4 Implementing Acts (bundled) |
| **🔗 Related Regulations** | 2 checkboxes | GDPR (+10 reqs), DORA (+12 reqs) |
| **🏗️ Architecture** | Single checkbox | ARF (+20 reqs) |

### Source Groups

Requirements are now tagged with a `sourceGroup` field:
- `eidas`: Core eIDAS + implementing acts (13 requirements)
- `gdpr`: GDPR processor requirements (10 requirements)
- `dora`: DORA ICT requirements (12 requirements)
- `arf`: ARF-sourced requirements (20 requirements)

### Default State
- eidas: ✓ (selected)
- gdpr: ✓ (selected)
- dora: ✗ (not selected by default — situational)
- arf: ✓ (selected)

Default shows 43 requirements. Selecting DORA adds 12 more for 55 total.

## Implementation

### Files Changed
- `config/vcq/vcq-config.yaml` — Restructured legalSources into 3 groups
- `scripts/build-vcq.js` — Added sourceGroup tagging logic
- `src/pages/VendorQuestionnaire.jsx` — New SourceSelector component
- `src/pages/VendorQuestionnaire.css` — New tile styles

### Mental Model Shift
The hint text was changed from:
> "Select which regulatory sources to include"

To:
> "Filter requirements by regulatory source. These are **filters**, not opt-outs — select sources to analyze their requirements."

## Consequences

### Positive
- Cleaner, more intuitive UI
- Legally accurate grouping
- Clear mental model (filtering, not compliance opt-out)
- Each tile shows requirement counts for transparency

### Negative
- None identified

## Related Decisions
- DEC-254: Consolidated PIF/VIF into single RP Intermediary
- DEC-222: Original VCQ tool design

## References
- Commit: `1f844a2`
