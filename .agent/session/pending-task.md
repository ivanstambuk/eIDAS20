# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: RCA now has all 4 roles implemented
- **Next**: Browser-test the PID Provider in RCA, then push to GitHub
- **Status**: Ready
- **Phase**: RCA Complete

## Key Files

- `docs-portal/config/rca/roles.yaml` — 4 roles enabled (RP, WP, Issuer, PID)
- `docs-portal/config/rca/requirements/pid-provider.yaml` — 30 PID Provider requirements
- `docs-portal/config/rca/AUDIT_TRACKER_PID.md` — Provision-level audit log
- `docs-portal/public/data/rca-data.json` — Built RCA data (295 requirements)

## Context Notes

Things git commits don't capture:

1. **PID Provider Role**: No profiles — requirements apply uniformly regardless of whether the Member State issues directly or designates someone. Legal basis: Art 5a(5).

2. **PID Provider Sources**:
   - 2024/2977 (PID and EAA) — primary implementing act
   - Main regulation Art 5a (European Digital Identity Wallets)
   - NOT Annex I of consolidated reg (that's for e-signature certificates!)

3. **Requirement Categories**:
   | Category | Count |
   |----------|-------|
   | issuance (PID-ISS) | 9 |
   | revocation (PID-REV) | 10 |
   | data-quality/technical (PID-DATA) | 5 |
   | regulatory (PID-REG) | 6 |

4. **Total RCA Coverage Now**:
   | Role | Requirements | Version |
   |------|--------------|---------|
   | Relying Party | 91 | V14 |
   | Wallet Provider | 132 | V6 |
   | EAA Issuer | 42 | V3 |
   | PID Provider | 30 | V1 |
   | **Total** | **295** | |

5. **Potential Future Roles**:
   - Trust Service Provider (QTSP) — Arts 19-24, Annex I
   - Conformity Assessment Body (CAB) — Art 5a(11), Annex IV
   - Supervisory Body — Arts 17, 46a

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# RCA page: http://localhost:5173/eIDAS20/#/rca

# Verify PID Provider in UI:
# 1. Navigate to RCA
# 2. Select "PID Provider" role
# 3. Should see 30 requirements
# 4. No profile selector (no profiles defined)
```
