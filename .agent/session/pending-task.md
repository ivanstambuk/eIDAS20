# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: RCA now has 6 roles implemented
- **Next**: Push to GitHub
- **Status**: Ready
- **Phase**: RCA Complete

## Key Files

- `docs-portal/config/rca/roles.yaml` — 6 roles enabled (RP, WP, Issuer, PID, TSP, CAB)
- `docs-portal/config/rca/requirements/conformity-assessment-body.yaml` — 36 CAB requirements
- `docs-portal/public/data/rca-data.json` — Built RCA data (416 requirements)

## Context Notes

Things git commits don't capture:

1. **CAB Role**: No profiles — requirements apply uniformly to all accredited CABs regardless of which trust services they assess.

2. **CAB Sources**:
   - 2025/2162 (CAB Accreditation) — primary implementing act
   - Main regulation Art 20 (Supervision of qualified TSPs)
   - Annex I: Subcontracting reference standards
   - Annex III: 22 detailed report specifications

3. **Requirement Categories**:
   | Category | Count |
   |----------|-------|
   | reporting (CAB-REPORT) | 19 |
   | operational (CAB-SCHEME, CAB-SUB) | 8 |
   | accreditation (CAB-ACC) | 2 |
   | transparency (CAB-CERT) | 1 |
   | transition (CAB-TRANS) | 1 |
   | notification (CAB-REG) | 5 |

4. **Total RCA Coverage Now**:
   | Role | Requirements | Version |
   |------|--------------|---------|
   | Relying Party | 91 | V14 |
   | Wallet Provider | 132 | V6 |
   | EAA Issuer | 42 | V3 |
   | PID Provider | 30 | V1 |
   | Trust Service Provider | 85 | V2 |
   | Conformity Assessment Body | 36 | V1 |
   | **Total** | **416** | |

5. **Remaining Potential Role**:
   - Supervisory Body — Arts 17, 46a-46e (oversight functions, less operational)

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# RCA page: http://localhost:5173/eIDAS20/#/rca

# Verify CAB in UI:
# 1. Navigate to RCA
# 2. Select "Conformity Assessment Body" role
# 3. Should see 36 requirements
# 4. No profile selector (no profiles defined)
```
