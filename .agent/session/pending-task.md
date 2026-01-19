# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: Expand RCA to include `wallet_provider` and `trust_service_provider` requirements
- **Next**: Create `wallet-provider.yaml` config file following `relying-party.yaml` structure
- **Status**: Ready
- **Phase**: RCA Enhancement - Role Expansion

## Completed RCA Work (RP Requirements)

- **87 RP requirements** extracted from 6 implementing acts + consolidated regulation
- **Schema version 10** with 8 categories
- **AUDIT_TRACKER.md** fully updated - ALL articles reviewed article-by-article
- Main regulation: 70+ articles reviewed, 18 with RP requirements, 52+ with no RP obligations
- Annexes I-VII: All reviewed, TSP/issuer focus, no RP obligations

## Key Files

- `docs-portal/config/rca/requirements/relying-party.yaml` — Template structure (87 reqs)
- `docs-portal/config/rca/AUDIT_TRACKER.md` — Complete article-by-article audit status
- `docs-portal/scripts/build-rca.js` — Build script (supports multi-file)
- `docs-portal/src/pages/ComplianceAssessment.jsx` — UI (role selector already exists)
- `02_implementing_acts/` — Source documents (29 acts)
- `01_regulation/2014_910_eIDAS_Consolidated/` — Main regulation

## Wallet Provider Requirements Sources

Priority implementing acts for wallet_provider role:
1. **2024/2979** (Integrity & Core Functionalities) - Art 3-14 are wallet-focused
2. **2024/2981** (Certification) - Entire act about wallet certification
3. **2024/2977** (PID/EAA) - Art 3-4 issuance requirements
4. **2024/2982** (Protocols) - Art 4 issuance protocols
5. **Main Regulation Art 5a-5e** - Core EUDIW requirements

## Trust Service Provider Requirements Sources

Priority sources for trust_service_provider role:
1. **Main Regulation Art 19-24a** - TSP/QTSP obligations
2. **2025/2530** (QTSP Requirements) - Detailed TSP standards
3. **2025/1569** (EAA/Attributes) - EAA issuance requirements
4. **2025/1942** (Validation Services) - QVSP standards
5. **Trust service implementing acts** (2025/1566-1572, 2025/1929-1946)

## Implementation Steps

1. Create `wallet-provider.yaml` following relying-party.yaml structure
2. Audit 2024/2979 articles for wallet_provider obligations
3. Audit 2024/2981 for certification requirements
4. Update `build-rca.js` to load multiple role files (already supports this)
5. Test role filtering in UI

## Context Notes

- `build-rca.js` already loads all .yaml files from requirements/ dir
- UI role selector supports multiple roles
- Use same category structure where applicable
- `bindingType: mandatory` for articles, `informative` for recitals
- Each requirement needs: id, category, requirement, explanation, legalBasis, legalText, deadline, roles, useCases

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Visit http://localhost:5177/#/compliance
# Then: Check role selector dropdown for new roles
```
