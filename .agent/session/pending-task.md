# Terminology Filtering System (DEC-086)

## Current State

- **Focus**: Multi-dimensional terminology filtering
- **Status**: 🔵 Implementation plan written
- **Phase**: Design approved, ready for implementation

## Overview

Add a 3-dimensional filtering system to the Terminology page:
1. **Document Type**: eIDAS, Implementing Acts, Recommendations, EU Law (extensible)
2. **Role**: Holder, PID Provider, Wallet Provider, QTSP, Issuers, CABs, etc.
3. **Semantic Domain**: Cryptography, Identity, Attestation, Governance, Wallet Ecosystem

## Design Decisions

- **UI Pattern**: Option C — Floating Filter Bar (sticky, below alphabet nav)
- **Filter Logic**: Multi-select (non-mutually exclusive), terms shown if they match ANY selected filter in each dimension
- **No badges on cards**: Filters are for filtering only, term definitions remain visually clean
- **Role tagging**: Exhaustive manual mapping file (Approach A)
- **Extensibility**: Config-based document types, not hardcoded

## Implementation Phases

### Phase 1: Configuration Files

Create extensible config files for filter dimensions:

1. **`docs-portal/config/terminology-filters.yaml`** — Document type definitions
   ```yaml
   documentTypes:
     eidas:
       label: "eIDAS"
       description: "Core eIDAS Regulation (910/2014)"
       color: "#22d3ee"  # cyan
       matchCategories: ["primary"]
     implementing_acts:
       label: "Implementing Acts"
       description: "Commission implementing regulations"
       matchCategories: ["implementing-act"]
     recommendations:
       label: "Recommendations"
       description: "EU Recommendations and guidance"
       matchCategories: ["recommendation"]
     eu_law:
       label: "EU Law"
       description: "Referenced foundational EU regulations"
       matchCategories: ["referenced"]
     # Future: faq, guidance, etc.
   ```

2. **`docs-portal/config/term-roles.json`** — Exhaustive role mappings
   ```json
   {
     "$comment": "Role assignments for all 107 terms. Each term can have multiple roles.",
     "roles": {
       "holder": { "label": "Holder / User", "icon": "👤" },
       "pid_provider": { "label": "PID Provider", "icon": "🏛️" },
       "eaa_provider": { "label": "(Q)EAA Provider", "icon": "📜" },
       "wallet_provider": { "label": "Wallet Provider", "icon": "📱" },
       "qtsp": { "label": "QTSP", "icon": "🔐" },
       "cabs": { "label": "CABs", "icon": "✅" },
       "supervisory": { "label": "Supervisory Bodies", "icon": "⚖️" },
       "trusted_list": { "label": "Trusted List Providers", "icon": "📋" },
       "relying_party": { "label": "Relying Party", "icon": "🏢" }
     },
     "mappings": {
       "electronic-signature": ["holder", "qtsp"],
       "wallet-provider": ["wallet_provider"],
       "relying-party": ["relying_party"],
       "conformity-assessment-body": ["cabs"],
       "accreditation": ["cabs", "supervisory"],
       "trust-service-provider": ["qtsp"],
       "person-identification-data": ["pid_provider", "holder"],
       // ... all 107 terms
     }
   }
   ```

3. **`docs-portal/config/term-domains.json`** — Exhaustive domain mappings
   ```json
   {
     "$comment": "Semantic domain assignments for all 107 terms.",
     "domains": {
       "cryptography": { "label": "Cryptography", "icon": "🔑" },
       "identity": { "label": "Identity", "icon": "🆔" },
       "attestation": { "label": "Attestation", "icon": "📄" },
       "governance": { "label": "Governance", "icon": "🏛️" },
       "wallet_ecosystem": { "label": "Wallet Ecosystem", "icon": "📱" }
     },
     "mappings": {
       "electronic-signature": ["cryptography"],
       "electronic-seal": ["cryptography"],
       "authentication": ["identity", "cryptography"],
       "european-digital-identity-wallet": ["wallet_ecosystem", "identity"],
       "conformity-assessment": ["governance"],
       // ... all 107 terms
     }
   }
   ```

### Phase 2: Build Pipeline Updates

Modify `build-terminology.js` to:
1. Load role and domain config files
2. Enrich each term with `roles[]` and `domains[]` arrays
3. Add filter metadata to `terminology.json` output:
   ```json
   {
     "filterMetadata": {
       "documentTypes": [...],
       "roles": [...],
       "domains": [...]
     },
     "terms": [
       {
         "id": "electronic-signature",
         "term": "electronic signature",
         "roles": ["holder", "qtsp"],
         "domains": ["cryptography"],
         "sources": [...],
         // ... existing fields
       }
     ]
   }
   ```

### Phase 3: UI Components

1. **FilterDropdown component** (`src/components/FilterDropdown.jsx`)
   - Multi-select dropdown with checkboxes
   - Shows "X Active" badge when filters selected
   - Glassmorphism styling matching existing theme

2. **Merge filter bar with alphabet nav** in `Terminology.jsx`
   - Left: Three FilterDropdown components (Document Type, Role, Domain)
   - Right: Alphabet letters (overflow to second row on mobile)
   - Both sticky below header

3. **Filter logic**
   ```javascript
   // A term matches if:
   // - ANY of its source documentCategories match selected document types
   // - AND (if role filters active) ANY of its roles match selected roles
   // - AND (if domain filters active) ANY of its domains match selected domains
   const matchesFilters = (term, filters) => {
     const matchesDocType = filters.documentTypes.length === 0 ||
       term.sources.some(s => filters.documentTypes.includes(mapCategoryToFilter(s.documentCategory)));
     const matchesRole = filters.roles.length === 0 ||
       term.roles?.some(r => filters.roles.includes(r));
     const matchesDomain = filters.domains.length === 0 ||
       term.domains?.some(d => filters.domains.includes(d));
     return matchesDocType && matchesRole && matchesDomain;
   };
   ```

### Phase 4: Manual Curation

I will curate all 107 terms with role and domain assignments. This is the bulk of the work.

**Role taxonomy (from user input):**
| Role ID | Label | Description |
|---------|-------|-------------|
| `holder` | Holder / User | Natural or legal person controlling the wallet |
| `pid_provider` | PID Provider | State entity issuing core identity |
| `eaa_provider` | (Q)EAA Provider | Issuers of electronic attestations |
| `wallet_provider` | Wallet Provider | Entity operating the wallet application |
| `qtsp` | QTSP | Qualified Trust Service Providers |
| `cabs` | CABs | Conformity Assessment Bodies |
| `supervisory` | Supervisory Bodies | National oversight agencies |
| `trusted_list` | Trusted List Providers | Entities maintaining trusted lists |
| `relying_party` | Relying Party | Entities accepting wallet credentials |

**Domain taxonomy:**
| Domain ID | Label | Example Terms |
|-----------|-------|---------------|
| `cryptography` | Cryptography | electronic signature, seal, creation data |
| `identity` | Identity | PID, authentication, identification scheme |
| `attestation` | Attestation | EAA, attributes, certificates |
| `governance` | Governance | accreditation, conformity, supervisory |
| `wallet_ecosystem` | Wallet Ecosystem | wallet provider, instance, unit, relying party |

### Phase 5: Validation & Polish

1. Add build-time validation: warn if a term has no role/domain assigned
2. Show filter counts in dropdown headers (e.g., "Document Type (3)")
3. URL query param persistence: `?docType=eidas,eu_law&role=holder`
4. Clear all filters button
5. Empty state when no terms match

## Key Files

| File | Purpose |
|------|---------|
| `config/terminology-filters.yaml` | Document type definitions (extensible) |
| `config/term-roles.json` | Role assignments for all terms |
| `config/term-domains.json` | Domain assignments for all terms |
| `scripts/build-terminology.js` | Enriches terms with filter data |
| `src/components/FilterDropdown.jsx` | New reusable component |
| `src/pages/Terminology.jsx` | Filter bar integration |

## Commits Plan

1. `feat: add terminology filter config schema (DEC-086)` — Config files
2. `feat: enrich terminology with roles and domains` — Build pipeline
3. `feat: add FilterDropdown component` — UI component
4. `feat: implement terminology filtering UI` — Integration
5. `docs: curate all 107 terms with roles and domains` — Manual curation

## Quick Start (After Implementation)

```bash
cd ~/dev/eIDAS20/docs-portal
npm run build:terminology  # Rebuilds with filter data
npm run dev
# Open http://localhost:5173/eIDAS20/#/terminology
# Use filter dropdowns to explore by role/domain
```
