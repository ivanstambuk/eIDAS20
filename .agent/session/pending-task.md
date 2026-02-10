# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: ARF v2.8.0 upgrade — assessment complete, execution pending
- **Next**: Execute Phase 1 of the upgrade plan (import v2.8.0 files)
- **Status**: Ready
- **Phase**: ARF Upgrade (see `docs-portal/docs/plans/arf-280-upgrade-plan.md`)

## Key Files

- `docs-portal/docs/plans/arf-280-upgrade-plan.md` — Comprehensive 5-phase upgrade plan (START HERE)
- `docs-portal/docs/research/arf-280-impact-assessment.md` — Raw auto-generated diff report
- `docs-portal/scripts/diff-arf-hlrs.py` — Reusable HLR diff script for future upgrades
- `03_arf/hltr/high-level-requirements.csv` — Current HLR data (v2.7.3)
- `docs-portal/config/vcq/requirements/core.yaml` — 3 impacted VCQ references
- `docs-portal/config/vcq/requirements/issuer.yaml` — 8 impacted VCQ references
- `docs-portal/config/vcq/requirements/trust_services.yaml` — 1 impacted VCQ reference

## Context Notes

Things git commits don't capture:

- v2.8.0 shallow clone was at `/tmp/arf_v280/` — may need re-cloning (`git clone --depth=1 --branch v2.8.0 https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework.git /tmp/arf_v280`)
- Topic 38 (Wallet Unit Revocation) was restructured: `AS-WP` → `EW-DM` category prefix — this is renumbering, not content removal
- Topic 28 (Legal Person PID) entirely deferred — all HLRs emptied
- 33 "emptied" HLRs may have content moved to new IDs — need tracing
- The 247 "text changed" HLRs include many editorial/minor changes, not all are substantive
- Our `docs/discussion-topics/` and `docs/technical-specifications/` have local annotations that must NOT be overwritten blindly
- Also pending: Stakeholder feedback Items 4-7 (OID4VP purpose, RPI_07, intermediary naming, user rejection)

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && cat docs/plans/arf-280-upgrade-plan.md | head -50
# Then follow Phase 1 instructions in that file
```
