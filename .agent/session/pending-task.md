# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: Expand RCA to include `wallet_provider` and `trust_service_provider` requirements
- **Next**: Create `wallet-provider.yaml` config file following `relying-party.yaml` structure
- **Status**: Ready
- **Phase**: RCA Enhancement - Role Expansion

## Completed RCA Work (RP Requirements)

- **90 RP requirements** extracted (schema v11)
- **AUDIT_TRACKER_RP.md** fully updated - ALL articles + recitals reviewed
- Gap analysis found 3 new requirements:
  - RP-AUTH-001: Art 5b(9) authentication responsibility
  - RP-OPS-004: Art 5b(10) intermediary data storage prohibition
  - RP-ESIG-007a: Art 32(2) validation security detection
- Recitals: 75 reviewed, 18 RP-relevant, 57 non-RP

## Key Files

- `docs-portal/config/rca/requirements/relying-party.yaml` — Template (90 reqs)
- `docs-portal/config/rca/AUDIT_TRACKER_RP.md` — Complete RP audit (renamed)
- `docs-portal/scripts/build-rca.js` — Build script (multi-role support)
- `docs-portal/src/pages/ComplianceAssessment.jsx` — UI (role selector exists)

## Wallet Provider Requirements Sources

Priority for wallet_provider role:
1. **Art 5a** - Core EUDIW requirements (paras 1-24)
2. **2024/2979** (Integrity) - Art 3-14 wallet-focused
3. **2024/2981** (Certification) - Wallet certification
4. **2024/2977** (PID/EAA) - Art 3-4 issuance
5. **2024/2982** (Protocols) - Art 4 issuance protocols

## TSP Requirements Sources

Priority for trust_service_provider role:
1. **Art 19-24a** - TSP/QTSP obligations
2. **2025/2530** (QTSP Requirements) - Detailed standards
3. **Trust service acts** (2025/1566-1572, 2025/1929-1946)

## Implementation Pattern

Follow `relying-party.yaml` structure:
- id: WP-REG-001 / TSP-REG-001
- category, requirement, explanation, legalBasis, legalText, deadline, roles, useCases
- Create AUDIT_TRACKER_WP.md / AUDIT_TRACKER_TSP.md

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Visit http://localhost:5177/#/compliance
npm run build:rca  # Rebuild after adding requirements
```
