# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: RCA Role Profiles feature complete; EAA Issuer audit next
- **Next**: Run `/rca-audit` for `issuer` role using issuer.yaml stub
- **Status**: Ready
- **Phase**: RCA Expansion

## Key Files

- `docs-portal/config/rca/roles.yaml` — Role definitions with profiles array
- `docs-portal/config/rca/requirements/issuer.yaml` — Empty stub for EAA Issuer audit
- `docs-portal/scripts/build-rca.js` — Processes profiles and profileFilter
- `docs-portal/src/pages/ComplianceAssessment.jsx` — ProfileSelector component
- `.agent/workflows/rca-audit.md` — Audit workflow with Profile Filtering section

## Context Notes

Things git commits don't capture:

1. **Profile Filtering Logic**: Requirements without `profileFilter` apply to ALL profiles. Requirements with `profileFilter: [id]` only show when that profile is selected in UI.

2. **EAA Issuer Profiles**:
   - `qualified` — Qualified TSP issuing QEAAs (Annex V compliance)
   - `non_qualified` — Non-qualified provider issuing EAAs
   - `public_authentic` — Public sector body issuing from authentic sources (Art 45f, Annex VII)

3. **How to Add Profile-Specific Requirements**:
   ```yaml
   - id: EAA-QUAL-001
     requirement: "Meet Annex V requirements"
     profileFilter: [qualified]  # Only for Qualified TSP
   ```

4. **WP Audit Source Files**: 
   - 2024/2979 (Integrity & Core Functions)
   - 2024/2981 (Certification)
   - 2024/2982 (Protocols & Interfaces)
   - 2025/848 (Notified Wallet List)

5. **Profile IDs Lookup**:
   | Role | Profile IDs |
   |------|-------------|
   | relying_party | `public_sector`, `private_sector` |
   | issuer | `qualified`, `non_qualified`, `public_authentic` |
   | wallet_provider | `member_state`, `mandated`, `independent` |

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# RCA page: http://localhost:5173/eIDAS20/#/rca

# For EAA Issuer audit:
# 1. Read /rca-audit workflow
# 2. Source files in ~/dev/eIDAS20/02_implementing_acts/
# 3. Output to docs-portal/config/rca/requirements/issuer.yaml
```
