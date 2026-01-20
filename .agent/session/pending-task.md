# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: RCA Role Labels Complete — all 7 roles have polished descriptions
- **Next**: Push to GitHub (ready to deploy)
- **Status**: Ready
- **Phase**: RCA V3.5.5 Complete

## Key Files

- `docs-portal/config/rca/roles.yaml` — All 7 role definitions with descriptions and profiles
- `docs-portal/public/data/rca-data.json` — Built RCA data (458 requirements)
- `TRACKER.md` — Session progress tracker

## Context Notes

Things git commits don't capture:

1. **Role Description Pattern Established**:
   - Service-providing roles (RP, EAA, WP, PID, TSP): Verb-first ("Issues...", "Verifies...")
   - Oversight roles (CAB, SB): Noun + verb ("Accredited body that...", "Authority overseeing...")

2. **DEC-091 Implementation**: TSP and EAA Issuer kept separate despite QEAA = QTSP legally because:
   - PAS (Public Authentic Sources) don't fit in TSP category
   - Service types are orthogonal to provider status
   - User mental model matches role separation

3. **CAB Scope Fixed**: Updated from "audits QTSPs" to "audits wallet providers, QTSPs, and QEAA issuers"

4. **All Commits Done**:
   - `5c897b3` — EAA/TSP profile label improvements
   - `d12a6f3` — Complete role labels refresh (amended)

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# RCA page: http://localhost:5173/eIDAS20/#/rca

# To push:
cd ~/dev/eIDAS20 && git push origin master
```
