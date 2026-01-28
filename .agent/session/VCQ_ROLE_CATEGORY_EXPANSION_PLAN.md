# VCQ Role & Category Expansion Plan

**Created:** 2026-01-28
**Status:** 🟡 In Progress
**Decision:** DEC-257 (VCQ Multi-Role Architecture)

---

## Executive Summary

Expand the VCQ (Vendor Compliance Questionnaire) from its current RP-Intermediary-only focus to support the full v3.0 architecture with:
- **Organisation Roles**: Relying Party, Attestation Issuer
- **Product Categories**: Connector, Issuance Platform, Trust Services
- **Role-aware requirements** with proper filtering

This aligns the requirements data model with the existing UI that already renders Steps 1-3.

---

## Schema v2: Data Model

### New Fields

| Field | Type | Semantics |
|-------|------|-----------|
| `roles` | `string[]` | Empty = universal. Values: `relying_party`, `issuer` |
| `productCategories` | `string[]` | Empty = universal. Values: `connector`, `issuance_platform`, `trust_services` |

### Removed Fields

| Field | Reason |
|-------|--------|
| `applicability` | Legacy. Replaced by `roles` + `productCategories` |

### Filtering Logic

```
Requirement matches if:
  (roles is empty OR roles ∩ selectedRoles ≠ ∅)
  AND
  (productCategories is empty OR productCategories ∩ selectedCategories ≠ ∅)
  AND
  (sourceGroup matches active source filters)
```

### Examples

```yaml
# Universal (applies to all roles and categories)
- id: VEND-CORE-001
  roles: []
  productCategories: []

# RP + Connector only
- id: VEND-INT-001
  roles: [relying_party]
  productCategories: [connector]

# Issuer + Issuance Platform
- id: VEND-ISS-001
  roles: [issuer]
  productCategories: [issuance_platform]

# Trust Services for both roles
- id: VEND-TSP-001
  roles: [relying_party, issuer]
  productCategories: [trust_services]

# SCA (banks: both roles, specific categories)
- id: VEND-SCA-001
  roles: [relying_party, issuer]
  productCategories: [connector, issuance_platform]
```

---

## Phase 1: Schema & Build Script Migration

### Task 1.1: Update `build-vcq.js`

**File:** `docs-portal/scripts/build-vcq.js`

Changes:
- [ ] Add `requirementsByRole` index structure
- [ ] Add `requirementsByProductCategory` index structure
- [ ] Update requirement processing to use `roles` and `productCategories`
- [ ] Remove all references to legacy `applicability` field
- [ ] Update stats generation to include role/category counts

Index structures:
```javascript
const requirementsByRole = {
    relying_party: [],
    issuer: [],
    universal: []  // Empty roles array
};

const requirementsByProductCategory = {
    connector: [],
    issuance_platform: [],
    trust_services: [],
    universal: []  // Empty productCategories array
};
```

**🔒 COMMIT after 1.1:** `feat(vcq): add role/category indexes to build script`

---

### Task 1.2: Update `validate-vcq.js`

**File:** `docs-portal/scripts/validate-vcq.js`

Changes:
- [ ] Add validation for `roles` field (must be array, valid values)
- [ ] Add validation for `productCategories` field (must be array, valid values)
- [ ] Remove validation for deprecated `applicability` field
- [ ] Add stats output for roles/categories distribution

Valid values:
- `roles`: `relying_party`, `issuer`, or empty array
- `productCategories`: `connector`, `issuance_platform`, `trust_services`, or empty array

**🔒 COMMIT after 1.2:** `feat(vcq): add role/category validation`

---

### Task 1.3: Update `core.yaml`

**File:** `docs-portal/config/vcq/requirements/core.yaml`

Changes for all 18 requirements:
- [ ] Remove `applicability` field
- [ ] Add `roles: []` (universal - applies to all roles)
- [ ] Add `productCategories: []` (universal - applies to all categories)

These are GDPR Art 28 and general governance requirements that apply regardless of role.

**🔒 COMMIT after 1.3:** `refactor(vcq): migrate core.yaml to schema v2`

---

### Task 1.4: Update `intermediary.yaml`

**File:** `docs-portal/config/vcq/requirements/intermediary.yaml`

Changes for all 34 requirements:
- [ ] Remove `applicability` field
- [ ] Add `roles: [relying_party]` (RP Intermediary specific)
- [ ] Add `productCategories: [connector]` (Connector product type)

These are Article 5b(10) and Topic 52 requirements for RP Intermediaries.

**🔒 COMMIT after 1.4:** `refactor(vcq): migrate intermediary.yaml to schema v2`

---

### Task 1.5: Update `ict.yaml`

**File:** `docs-portal/config/vcq/requirements/ict.yaml`

Changes for all 12 requirements:
- [ ] Remove `applicability` field (if present)
- [ ] Add `roles: [relying_party, issuer]` (DORA covers both financial RPs and issuers)
- [ ] Add `productCategories: []` (applies to all categories in financial context)

DORA ICT third-party requirements apply when financial entities use any EUDIW product.

**🔒 COMMIT after 1.5:** `refactor(vcq): migrate ict.yaml to schema v2`

---

### Task 1.6: Update `categories.yaml`

**File:** `docs-portal/config/vcq/categories.yaml`

Changes:
- [ ] Add `payments` category for SCA requirements
- [ ] Update schema version comment

```yaml
payments:
  label: "Payments & SCA"
  description: "Strong Customer Authentication for electronic payments"
  icon: "💳"
  order: 13
```

**🔒 COMMIT after 1.6:** `feat(vcq): add payments category`

---

## Phase 2: Create New Requirements Files

### Task 2.1: Create `issuer.yaml`

**File:** `docs-portal/config/vcq/requirements/issuer.yaml`

Target: ~25-30 requirements for Attestation Issuers

Source documents:
- eIDAS Art. 45d-45g (EAA issuance)
- 2024/2981 (Provider Information Regulation)
- 2024/2979 Art. 3-5 (Attestation binding, revocation)
- ARF Topics 10 (Issuing), 7 (Validity Status), 31 (Provider Publication)
- TS2, TS6, TS11

Requirement categories:
| Category | Count | Topics |
|----------|-------|--------|
| registration | 4 | Provider registration, notification to MS |
| issuance | 8 | Attestation creation, wallet binding, format support |
| revocation | 4 | Status lists, revocation mechanisms |
| technical | 6 | OpenID4VCI (TS6), protocol compliance |
| transparency | 3 | Provider info publication (TS2) |
| security | 3 | Signing key protection, WSCA/WSCD |
| interoperability | 2 | mDoc and W3C VC format support |

All requirements will have:
```yaml
roles: [issuer]
productCategories: [issuance_platform]
```

**🔒 COMMIT after 2.1:** `feat(vcq): add issuer requirements (VEND-ISS-*)`

---

### Task 2.2: Create `trust_services.yaml`

**File:** `docs-portal/config/vcq/requirements/trust_services.yaml`

Target: ~15-20 requirements for Trust Service Providers (QTSP focus)

Source documents:
- eIDAS Art. 20-30 (Trust Services chapter)
- Art. 45f (QEAA issuance by QTSP)
- TS3 (Wallet Unit Attestation)
- TS8 (Remote QES Protocol)
- ARF Topics 23, 32

Requirement categories:
| Category | Count | Topics |
|----------|-------|--------|
| certification | 4 | Qualified status, CAB audits, EU Trusted Lists |
| security | 5 | QSCD, HSM, key generation/storage |
| technical | 4 | Remote signing (TS8), WUA issuance (TS3) |
| liability | 2 | TSP liability provisions (Art. 13) |
| governance | 3 | Trust service policies, incident handling |
| transparency | 2 | EU Trust Mark, publication |

All requirements will have:
```yaml
roles: [relying_party, issuer]  # QTSP serves both
productCategories: [trust_services]
```

**🔒 COMMIT after 2.2:** `feat(vcq): add trust services requirements (VEND-TSP-*)`

---

### Task 2.3: Create `payments.yaml`

**File:** `docs-portal/config/vcq/requirements/payments.yaml`

Target: ~12-15 requirements for PSD2 SCA in EUDI Wallet context

Source documents:
- PSD2 RTS 2018/389 (SCA technical standards)
- TS12 (Electronic Payments SCA)
- ARF Topics 47 (Payment Authentication)
- PSD2_SCA_COMPLIANCE_ASSESSMENT.md (our own research!)

Requirement categories:
| Category | Count | Topics |
|----------|-------|--------|
| verification | 4 | SCA verification, dynamic linking validation |
| technical | 4 | Authentication code verification, KB-JWT |
| issuance | 3 | SCA attestation issuance (PSP-side) |
| security | 2 | Independence, tamper-resistance |
| payments | 2 | Transaction amount/payee binding |

Split by role:
- `roles: [relying_party], productCategories: [connector]` — PSP verifying SCA
- `roles: [issuer], productCategories: [issuance_platform]` — PSP issuing SCA attestations

**🔒 COMMIT after 2.3:** `feat(vcq): add payments SCA requirements (VEND-SCA-*)`

---

## Phase 3: UI Update

### Task 3.1: Update `VendorQuestionnaire.jsx` filtering logic

**File:** `docs-portal/src/pages/VendorQuestionnaire.jsx`

Changes to `applicableRequirements` useMemo (around line 978):

```javascript
const applicableRequirements = useMemo(() => {
    if (!data) return [];
    if (selectedRoles.length === 0 || selectedCategories.length === 0) return [];

    return data.requirements.filter(req => {
        // Role filter: empty roles = universal, otherwise intersection
        const reqRoles = req.roles || [];
        const roleMatch = reqRoles.length === 0 || 
            reqRoles.some(role => selectedRoles.includes(role));
        
        // Category filter: same logic
        const reqCategories = req.productCategories || [];
        const categoryMatch = reqCategories.length === 0 || 
            reqCategories.some(cat => selectedCategories.includes(cat));
        
        // Source group filter (existing logic)
        const activeGroups = Object.entries(selectedSourceGroups)
            .filter(([_, isSelected]) => isSelected)
            .map(([group]) => group);
        const sourceMatch = activeGroups.length === 0 || 
            activeGroups.includes(req.sourceGroup);
        
        return roleMatch && categoryMatch && sourceMatch;
    });
}, [data, selectedRoles, selectedCategories, selectedSourceGroups]);
```

Also remove:
- [ ] All references to `requirementsByType.core`
- [ ] All references to `requirementsByType.intermediary`
- [ ] The legacy `// Include intermediary requirements (legacy compatibility)` logic

**🔒 COMMIT after 3.1:** `feat(vcq): implement role/category filtering in UI`

---

### Task 3.2: Update summary stats display

**File:** `docs-portal/src/pages/VendorQuestionnaire.jsx`

In `SummaryView` component, update stats to show:
- Requirements by role (if multiple roles selected)
- Requirements by product category

**🔒 COMMIT after 3.2:** `feat(vcq): update summary stats for role/category`

---

## Phase 4: Testing & Documentation

### Task 4.1: Run full validation

```bash
cd docs-portal && node scripts/validate-vcq.js
```

Expected output:
- All requirements have valid `roles` field
- All requirements have valid `productCategories` field
- No deprecated `applicability` field warnings
- Stats show distribution across roles/categories

**🔒 COMMIT after 4.1 (if fixes needed):** `fix(vcq): validation fixes`

---

### Task 4.2: Build and test in browser

```bash
npm run build:vcq
```

Test matrix:

| Test | Role(s) | Category | Expected |
|------|---------|----------|----------|
| T1 | RP | Connector | Core + INT + ICT (if DORA on) |
| T2 | RP | Trust Services | Core + TSP |
| T3 | Issuer | Issuance Platform | Core + ISS + ICT (if DORA on) |
| T4 | Issuer | Trust Services | Core + TSP |
| T5 | RP + Issuer | Connector | Core + INT + ICT |
| T6 | RP + Issuer | All 3 | Full set |
| T7 | RP | Connector + Trust Services | Core + INT + TSP |

**🔒 COMMIT after 4.2 (if fixes needed):** `fix(vcq): browser testing fixes`

---

### Task 4.3: Update TRACKER.md

Add entry documenting:
- VCQ v3.0 Role/Category expansion
- Total requirement counts by type
- Schema v2 migration

**🔒 COMMIT after 4.3:** `docs: update TRACKER.md with VCQ expansion`

---

## Requirement ID Prefixes

| Prefix | Meaning | Count (target) |
|--------|---------|----------------|
| `VEND-CORE-*` | Universal (all roles/categories) | 18 |
| `VEND-INT-*` | RP Intermediary (Connector) | 34 |
| `VEND-ICT-*` | DORA ICT scope | 12 |
| `VEND-ISS-*` | Attestation Issuer | ~25 |
| `VEND-TSP-*` | Trust Services (QTSP) | ~15 |
| `VEND-SCA-*` | Payments SCA | ~12 |
| **Total** | | **~116** |

---

## File Checklist

| File | Phase | Status |
|------|-------|--------|
| `scripts/build-vcq.js` | 1.1 | ✅ |
| `scripts/validate-vcq.js` | 1.2 | ✅ |
| `config/vcq/requirements/core.yaml` | 1.3 | ✅ |
| `config/vcq/requirements/intermediary.yaml` | 1.4 | ✅ |
| `config/vcq/requirements/ict.yaml` | 1.5 | ✅ |
| `config/vcq/categories.yaml` | 1.6 | ✅ |
| `config/vcq/requirements/issuer.yaml` | 2.1 | ⬜ |
| `config/vcq/requirements/trust_services.yaml` | 2.2 | ⬜ |
| `config/vcq/requirements/payments.yaml` | 2.3 | ⬜ |
| `src/pages/VendorQuestionnaire.jsx` | 3.1-3.2 | ⬜ |
| `TRACKER.md` | 4.3 | ⬜ |


---

## Execution Commands

```bash
# Phase 1: After each YAML migration
cd ~/dev/eIDAS20/docs-portal && node scripts/validate-vcq.js

# Phase 2-3: After new files
npm run build:vcq

# Testing
npm run dev
# Then browser test at http://localhost:5173/eIDAS20/

# Commits
git add -A && git commit -m "message"
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing VCQ users | Schema v2 is additive; old data structure preserved in JSON |
| Missing requirements | Cross-reference with RCA tool which has comprehensive coverage |
| Duplicate requirements | Validator will check for ID uniqueness |
| Performance with 116+ reqs | Filtering is O(n) in memory, negligible |

---

*Document created 2026-01-28 for VCQ Role/Category Expansion implementation.*
