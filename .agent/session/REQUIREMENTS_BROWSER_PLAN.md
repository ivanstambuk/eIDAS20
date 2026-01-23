# Unified Requirements Browser - Implementation Plan

## Document Info
- **Created**: 2026-01-23
- **Status**: ✅ COMPLETE
- **Last Updated**: 2026-01-23 07:22
- **Feature**: `/requirements` route - centralized requirements exploration
- **Related**: VCQ Questionnaire, RCA Dashboard

---

## Implementation Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1: Data Pipeline | ✅ Complete | CSV import, JSON generation |
| Phase 2: Core Components | ✅ Complete | Page, table, filters, hook |
| Phase 3: Filtering & Search | ✅ Complete | Multi-dimensional, full-text |
| Phase 4: Detail View | ✅ Complete | Modal with cross-references |
| Phase 5: Polish | ✅ Complete | Export, dark mode, responsive |
| **Enhancement A** | ✅ Complete | ARF Topic filtering |
| **Enhancement B** | ✅ Complete | Multiple export formats (CSV, JSON, PDF) |
| **Enhancement C** | ✅ Complete | VCQ integration (URL-based filters) |
| **Enhancement D** | ✅ Complete | Shareable URLs (Copy Link) |

---

### 1.3 User Stories
1. **As a researcher**, I want to explore all ARF HLRs by topic so I can understand what's required for wallet providers
2. **As a compliance officer**, I want to filter requirements by role (e.g., "Intermediary") to see what applies to us
3. **As a developer**, I want to search for requirements mentioning "OpenID4VP" to understand implementation needs
4. **As a legal analyst**, I want to cross-reference ARF requirements with their regulation sources

---

## 2. Data Sources

### 2.1 ARF High-Level Requirements
- **Source**: `/home/ivan/dev/eIDAS20/03_arf/hltr/high-level-requirements.csv`
- **Records**: ~618 requirements
- **Schema**:
  ```
  Harmonized_ID;Part;Category;Topic;Topic_Number;Topic_Title;Subsection;Index;Requirement_specification;Notes
  ```
- **Example**:
  ```
  EW-PIO-01-001;Ecosystem-Wide Rules;Protocols & Interoperability;Topic 1;1;Accessing Online Services;...;OIA_01;A Wallet Unit SHALL support [OpenID4VP]...
  ```

### 2.2 Regulations (Already Parsed)
- **Source**: `/home/ivan/dev/eIDAS20/docs-portal/config/regulations/`
- **Format**: JSON (article-level parsed)
- **Available**: eIDAS 2.0, eIDAS 1.0, GDPR, ePrivacy, etc.

### 2.3 VCQ Requirements
- **Source**: `/home/ivan/dev/eIDAS20/docs-portal/config/vcq/requirements/`
- **Files**: `core.yaml`, `ict.yaml`, `pif.yaml`, `vif.yaml`
- **Records**: ~50 requirements
- **Schema**: See section 3.2

### 2.4 RCA Requirements
- **Source**: `/home/ivan/dev/eIDAS20/docs-portal/config/rca/requirements/`
- **Files**: To be created (similar structure to VCQ)
- **Records**: ~50 requirements (estimated)

### 2.5 Technical Specifications (Reference-Only)
- **Source**: `/home/ivan/dev/eIDAS20/04_technical_specs/docs/technical-specifications/`
- **Files**: 15 markdown documents (TS1-TS14 + README)
- **Usage**: Browse as documents, link from requirements via `conformsTo`

---

## 3. Unified Schema

### 3.1 Requirement Model
All requirements from all sources will be normalized to this schema:

```typescript
interface Requirement {
  // Identity
  id: string;                    // e.g., "OIA_01", "VEND-CORE-001", "RP-GOV-001"
  harmonizedId?: string;         // ARF: "EW-PIO-01-001"
  source: RequirementSource;
  
  // Content
  requirement: string;           // The requirement text
  explanation?: string;          // Additional context
  notes?: string;                // Implementation notes
  
  // Classification
  category: string;              // governance, security, privacy, etc.
  part?: string;                 // ARF: "Ecosystem-Wide Rules" vs "Actor-Specific"
  
  // ARF Organization (for HLRs)
  arfTopic?: {
    number: number;              // 1, 52, etc.
    title: string;               // "Accessing Online Services"
    subsection?: string;
  };
  
  // Legal Basis
  legalBasis?: {
    regulation: string;          // "2014/910", "2016/679"
    article: string;             // "Article 5b"
    paragraph?: string;          // "10"
  };
  legalText?: string;            // Verbatim regulation text
  
  // Technical References
  conformsTo?: TechnicalReference[];
  arfReference?: {
    topic: string;               // "Topic 52"
    hlr: string;                 // "RPI_09"
  };
  
  // Applicability
  roles: string[];               // ["wallet-provider", "relying-party", "pif"]
  useCases?: string[];           // ["identity-verification", "age-verification"]
  
  // Compliance
  complianceLevel: 'mandatory' | 'recommended' | 'optional';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  deadline?: string;             // "2027-11-21"
  
  // Cross-references
  linkedRequirements?: string[]; // IDs of related requirements
}

interface TechnicalReference {
  specification: string;         // "TS3", "TS12"
  title: string;                 // "Wallet Unit Attestation"
  scope?: string;                // "full" or "section 4.2"
}

type RequirementSource = 'arf-hlr' | 'regulation' | 'vcq' | 'rca';
```

### 3.2 Mapping ARF HLRs to Unified Schema

| ARF CSV Field | Unified Schema Field |
|---------------|---------------------|
| `Harmonized_ID` | `harmonizedId` |
| `Index` | `id` |
| `Part` | `part` |
| `Category` | `category` |
| `Topic` | `arfTopic.title` (parsed) |
| `Topic_Number` | `arfTopic.number` |
| `Topic_Title` | `arfTopic.title` |
| `Subsection` | `arfTopic.subsection` |
| `Requirement_specification` | `requirement` |
| `Notes` | `notes` |

**Derived fields:**
- `roles`: Parse from `Part` and requirement text
- `complianceLevel`: Parse SHALL/SHOULD/MAY from text
- `source`: Always `'arf-hlr'`

### 3.3 Role Mapping

Map ARF actors to our terminology (`term-roles.json`):

| ARF Actor | Our Role ID | Our Role Name |
|-----------|-------------|---------------|
| Wallet Provider | `wallet-provider` | Wallet Provider |
| Wallet Unit | `wallet-provider` | (same, it's their product) |
| Relying Party | `relying-party` | Relying Party |
| Relying Party Instance | `relying-party` | (same) |
| PID Provider | `pid-provider` | PID Provider |
| Attestation Provider | `attestation-provider` | Attestation Provider |
| QEAA Provider | `qeaa-provider` | QEAA Provider |
| Access Certificate Authority | `access-ca` | Access Certificate Authority |
| Intermediary | `intermediary` | Intermediary |
| (PIF context) | `pif` | Presentation Intermediary Forwarder |
| (VIF context) | `vif` | Verifiable Information Forwarder |

---

## 4. Architecture

### 4.1 Directory Structure
```
docs-portal/
├── config/
│   └── requirements/
│       ├── index.json           # Unified index (generated)
│       ├── arf-hlr.json         # Parsed ARF HLRs
│       └── sources.json         # Source metadata
├── scripts/
│   └── import-arf-hlr.js        # CSV → JSON converter
└── src/
    ├── pages/
    │   └── RequirementsBrowser.jsx
    └── components/
        └── requirements/
            ├── RequirementsTable.jsx
            ├── RequirementCard.jsx
            ├── RequirementsFilters.jsx
            ├── RequirementsSearch.jsx
            └── RequirementDetail.jsx
```

### 4.2 Data Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                     BUILD TIME                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  03_arf/hltr/high-level-requirements.csv                        │
│         │                                                        │
│         ▼  (scripts/import-arf-hlr.js)                          │
│  config/requirements/arf-hlr.json                                │
│                                                                  │
│  config/vcq/requirements/*.yaml ──────┐                         │
│  config/rca/requirements/*.yaml ──────┼──► config/requirements/ │
│  config/regulations/*.json ───────────┘       index.json        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RUNTIME                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  RequirementsBrowser.jsx                                         │
│         │                                                        │
│         ├── useRequirements() hook                               │
│         │      └── Loads index.json                              │
│         │      └── Client-side filtering                         │
│         │                                                        │
│         ├── RequirementsFilters.jsx                              │
│         │      └── Source, Role, Category, Compliance filters    │
│         │                                                        │
│         ├── RequirementsSearch.jsx                               │
│         │      └── Full-text search with highlighting            │
│         │                                                        │
│         └── RequirementsTable.jsx                                │
│                └── Paginated, sortable table                     │
│                └── Click → RequirementDetail modal               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. UI Design

### 5.1 Main View: Requirements Browser

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📋 REQUIREMENTS BROWSER                                                │
│  Explore compliance requirements across ARF, regulations, and more      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🔍 Search requirements...                          [Advanced ▾]       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ OpenID4VP                                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ FILTERS                                                         │   │
│  │                                                                  │   │
│  │  Source          Role              Category        Compliance   │   │
│  │  ┌──────────┐   ┌──────────────┐   ┌───────────┐   ┌──────────┐│   │
│  │  │ ☑ ARF    │   │ ☑ All        │   │ ☑ All     │   │ ☑ All    ││   │
│  │  │ ☑ VCQ    │   │ ☐ Wallet Prov│   │ ☐ Security│   │ ☐ Mand.  ││   │
│  │  │ ☑ RCA    │   │ ☐ Relying P. │   │ ☐ Privacy │   │ ☐ Recom. ││   │
│  │  │ ☑ Regs   │   │ ☐ Intermediar│   │ ☐ Governa.│   │ ☐ Opt.   ││   │
│  │  └──────────┘   │ ☐ PIF        │   │ ☐ Protocol│   └──────────┘│   │
│  │                  │ ☐ VIF        │   └───────────┘               │   │
│  │                  └──────────────┘                               │   │
│  │                                                                  │   │
│  │  [Clear Filters]                              Showing 342 of 718│   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ID         │ Source │ Requirement                 │ Roles      │   │
│  ├────────────┼────────┼─────────────────────────────┼────────────┤   │
│  │ OIA_01     │ 📐 ARF │ A Wallet Unit SHALL support │ 🏛️ Wallet  │   │
│  │            │        │ [OpenID4VP] for remote...   │            │   │
│  ├────────────┼────────┼─────────────────────────────┼────────────┤   │
│  │ RPI_09     │ 📐 ARF │ When a Wallet Unit presents │ 🔄 Interm. │   │
│  │            │        │ to an intermediary any...   │            │   │
│  ├────────────┼────────┼─────────────────────────────┼────────────┤   │
│  │ VEND-001   │ 📦 VCQ │ Intermediaries shall not    │ 🔄 PIF/VIF │   │
│  │            │        │ store data about...         │            │   │
│  ├────────────┼────────┼─────────────────────────────┼────────────┤   │
│  │ Art. 5b(10)│ ⚖️ Reg │ Intermediaries acting on    │ 🔄 Interm. │   │
│  │            │        │ behalf of relying parties...│            │   │
│  └────────────┴────────┴─────────────────────────────┴────────────┘   │
│                                                                         │
│  ◀ 1  2  3  4  5  ...  24 ▶                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Requirement Detail Modal

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ╳  OIA_01 - Accessing Online Services                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ 📐 ARF High-Level Requirement                                     │ │
│  │ Topic 1: Accessing Online Services with a Wallet Unit             │ │
│  │ Part: Ecosystem-Wide Rules • Category: Protocols & Interop.       │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  REQUIREMENT                                                            │
│  ─────────────────────────────────────────────────────────────────────  │
│  A Wallet Unit SHALL support [OpenID4VP] for remote presentation flows │
│  and [ISO/IEC 18013-5] for proximity presentation flows, to receive    │
│  and respond to presentation requests for person identification data   │
│  (PID) and attestations by Relying Parties.                            │
│                                                                         │
│  ┌─────────────────┐ ┌──────────────────┐ ┌─────────────────────────┐  │
│  │ ⚠️ MANDATORY    │ │ 🔴 CRITICAL      │ │ 📅 Deadline: 2027-11-21 │  │
│  └─────────────────┘ └──────────────────┘ └─────────────────────────┘  │
│                                                                         │
│  APPLIES TO                                                             │
│  ─────────────────────────────────────────────────────────────────────  │
│  🏛️ Wallet Provider   📱 Wallet Unit                                    │
│                                                                         │
│  TECHNICAL REFERENCES                                                   │
│  ─────────────────────────────────────────────────────────────────────  │
│  • OpenID4VP - OpenID for Verifiable Presentations                      │
│  • ISO/IEC 18013-5 - Mobile Driving License                             │
│                                                                         │
│  RELATED REQUIREMENTS                                                   │
│  ─────────────────────────────────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ OIA_02  Same WSCA/WSCD binding proof                      📐 ARF│  │
│  │ OIA_03a Support OpenID4VP protocol                        📐 ARF│  │
│  │ VEND-018 Verify attestations as agreed with RP            📦 VCQ│  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│              [View in ARF Document]  [Copy Link]  [Export]              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Phases

### Phase 1: Data Pipeline (Day 1)
- [ ] Create `scripts/import-arf-hlr.js` to parse CSV
- [ ] Generate `config/requirements/arf-hlr.json`
- [ ] Create `config/requirements/sources.json` metadata
- [ ] Add npm script: `npm run import:requirements`

### Phase 2: Core Components (Days 2-3)
- [ ] Create `RequirementsBrowser.jsx` page component
- [ ] Add `/requirements` route to router
- [ ] Create `useRequirements()` hook for data loading
- [ ] Create `RequirementsTable.jsx` with pagination
- [ ] Create `RequirementCard.jsx` for compact display

### Phase 3: Filtering & Search (Days 3-4)
- [ ] Create `RequirementsFilters.jsx` with multi-select
- [ ] Implement client-side filtering logic
- [ ] Create `RequirementsSearch.jsx` with debouncing
- [ ] Implement full-text search with highlighting

### Phase 4: Detail View & Cross-References (Day 4-5)
- [ ] Create `RequirementDetail.jsx` modal
- [ ] Implement cross-reference linking (ARF → VCQ)
- [ ] Add "View in document" links for regulations
- [ ] Add URL-based filter state (shareable links)

### Phase 5: Polish & Integration (Day 5-6)
- [ ] Add export functionality (CSV, JSON)
- [ ] Add keyboard navigation
- [ ] Dark theme styling (consistent with portal)
- [ ] Mobile responsive design
- [ ] Add to navigation sidebar

---

## 7. Technical Considerations

### 7.1 Performance
- **Client-side filtering**: ~700 requirements is manageable
- **Lazy loading**: Load source data on-demand
- **Memoization**: Cache filter results with useMemo

### 7.2 Search Strategy
- Full-text search using simple includes() for MVP
- Consider Fuse.js for fuzzy search later
- Index: id, requirement, notes, category

### 7.3 State Management
- URL query params for filter state (shareable)
- React state for UI interactions
- No global state needed (self-contained feature)

---

## 8. Schema Updates Needed

### 8.1 VCQ Requirements Enhancement
Add to existing YAML schema:

```yaml
# Add to each requirement in config/vcq/requirements/*.yaml
- id: VEND-CORE-001
  # ... existing fields ...
  
  # NEW FIELDS
  complianceLevel: mandatory    # mandatory | recommended | optional
  conformsTo:                   # Technical specification references
    - specification: "TS3"
      title: "Wallet Unit Attestation"
      scope: "full"
  useCases:                     # Use case applicability
    - identity-verification
    - credential-presentation
```

### 8.2 New: RCA Requirements
Create similar structure in `config/rca/requirements/`:

```yaml
# config/rca/requirements/governance.yaml
schemaVersion: 1

requirements:
  - id: RP-GOV-001
    category: governance
    requirement: "Register with Member State supervisory authority"
    complianceLevel: mandatory
    criticality: critical
    legalBasis:
      regulation: "2014/910"
      article: "Article 5b"
      paragraph: "5"
    roles:
      - relying-party
    arfReference:
      topic: "Topic 27"
      hlr: "Reg_23"
```

---

## 9. Success Criteria

1. ✅ Can browse all 618 ARF HLRs
2. ✅ Can filter by source (ARF, VCQ, RCA, Regulations)
3. ✅ Can filter by role using our terminology
4. ✅ Can filter by compliance level (mandatory/recommended/optional)
5. ✅ Can search across all requirements
6. ✅ Can view requirement details with cross-references
7. ✅ Can export filtered results
8. ✅ URL reflects filter state (shareable)

---

## 10. Future Enhancements

- **Phase 2**: Add use case filtering dimension
- **Phase 2**: Add deadline-based filtering (approaching deadlines)
- **Phase 2**: Add comparison view (side-by-side requirements)
- **Phase 3**: Add compliance status tracking per organization
- **Phase 3**: Integration with VCQ questionnaire (pre-populate filters)

---

## Appendix A: ARF Topic Reference

| Topic # | Title | HLR Count |
|---------|-------|-----------|
| 1 | Accessing Online Services | ~25 |
| 3 | PID Rulebook | ~21 |
| 6 | RP Authentication | ~16 |
| 7 | Revocation Checking | ~23 |
| 9 | Wallet Unit Attestation | ~25 |
| 10 | Issuing PID/Attestation | ~89 |
| 11 | Pseudonyms | ~22 |
| 12 | Attestation Rulebooks | ~36 |
| 16 | Signing Documents | ~26 |
| 18 | Combined Presentations | ~7 |
| 19 | Dashboard | ~16 |
| 20 | SCA for Payments | ~6 |
| 24 | Proximity Identification | ~6 |
| 27 | Registration | ~33 |
| 31 | Notification | ~20+ |
| ... | (and more) | ... |
| **52** | **Intermediaries** | ~13 |

---

## Appendix B: Role Distribution in ARF

| Role | Approx. HLR Count |
|------|-------------------|
| Wallet Provider | ~200 |
| Relying Party | ~100 |
| PID Provider | ~60 |
| Attestation Provider | ~80 |
| Commission | ~30 |
| Member State | ~40 |
| QTSP | ~20 |
| Intermediary | ~15 |
