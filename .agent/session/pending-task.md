# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: RCA Wallet Provider Audit — Systematic review for WP requirements
- **Next**: Run `/rca-audit` workflow targeting wallet-provider role  
- **Status**: Audit scaffolding complete
- **Phase**: RCA Expansion

## Key Files

- `docs-portal/config/rca/requirements/wallet-provider.yaml` — WP requirements file (0 reqs, schema v1)
- `docs-portal/config/rca/AUDIT_TRACKER_WP.md` — WP audit tracker (all ⬜ not reviewed)
- `.agent/workflows/rca-audit.md` — Workflow for systematic audits (enforces one-row-per-provision)
- `01_regulation/2014_910_eIDAS_Consolidated/32014R0910.md` — Primary source
- `02_implementing_acts/` — Implementing acts directory

## Context Notes

Things git commits don't capture:
- **Collapsed ranges are forbidden**: Never use "Art. 1-22" or "Annexes I-IX" — one row per provision
- **Zero tolerance for ⬜ items**: Run grep verification before claiming completion
- **WP Priority Focus Areas** (from AUDIT_TRACKER_WP.md):
  - Article 5a (wallet provider duties)
  - Article 6a (wallet provision)
  - Articles 5c, 5d, 5e (certification, publication, breach)
  - 2024/2979 (Integrity - most articles apply to WP)
  - 2024/2981 (Certification implementing act)
  - 2024/2982 (Protocols and Interfaces)
- **Expected scope**: 60-100+ requirements (more than RP)
- **Schema versioning**: Increment schemaVersion each time requirements are added

## Quick Start

```bash
# Review audit workflow
cat ~/dev/eIDAS20/.agent/workflows/rca-audit.md
# Start audit with Article 5a (primary WP article)
```
