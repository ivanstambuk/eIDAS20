# Feature: Regulatory Compliance Assessment (RCA) Generator

**Status**: Planned  
**Priority**: High  
**Epic**: Compliance Tooling  

---

## Summary

Generate role-specific and use-case-specific regulatory compliance assessment templates based on the eIDAS 2.0 legal framework. Users can select their role (Relying Party, Issuer) and specific use cases, then generate an assessment table with all applicable legal requirements.

---

## User Story

> As a **compliance officer at a financial institution**, I want to **generate a checklist of all eIDAS 2.0 requirements applicable to my specific use case**, so that I can **systematically assess and document our compliance status**.

---

## Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Select role (Relying Party, EAA Issuer) | Must |
| FR-02 | Select use cases (multi-select checkboxes) | Must |
| FR-03 | Generate assessment table with all applicable requirements | Must |
| FR-04 | Display human-readable requirement explanations | Must |
| FR-05 | Link requirements to source regulations (with citation popovers) | Must |
| FR-06 | Record compliance status per requirement (Compliant/Non-Compliant/Partial/N/A) | Must |
| FR-07 | Add notes/evidence per requirement | Should |
| FR-08 | Export to Excel (.xlsx) with professional formatting | Must |
| FR-09 | Export to Markdown | Should |
| FR-10 | Persist user assessments in browser localStorage | Should |
| FR-11 | Filter/sort requirements by category, status | Should |
| FR-12 | Show implementation deadlines | Should |

### Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | Page loads in < 500ms | Must |
| NFR-02 | Excel export completes in < 2s | Must |
| NFR-03 | Responsive design (tablet + desktop) | Should |
| NFR-04 | Accessible (WCAG 2.1 AA) | Should |

---

## Roles and Use Cases

### Roles

| Role ID | Name | Description |
|---------|------|-------------|
| `relying_party` | Relying Party | Entity accepting wallet credentials for authentication/verification |
| `issuer` | EAA Issuer | Entity issuing electronic attestations of attributes |
| `wallet_provider` | Wallet Provider | Entity providing the wallet application (future) |

### Official EC Use Cases

**Source**: [EC Use Case Manuals](https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/896827987/Use+case+manuals)

All use cases below are official EC-defined use cases and should be selectable in the RCA generator.

#### Core Functionality

| Use Case ID | Name | Description | Status |
|-------------|------|-------------|--------|
| `pid-online` | PID-based identification in online services | Secure identification to an online service using the PID stored in an EUDI Wallet | Coming soon |
| `pseudonym` | Use of a pseudonym in online services | Interact with digital platforms without revealing full identity, unless legally required | Coming soon |
| `esignature` | eSignature | Create advanced electronic signatures with the same legal validity as handwritten signature | Coming soon |

#### Identification

| Use Case ID | Name | Description | Status |
|-------------|------|-------------|--------|
| `proximity-id` | Identification in proximity scenarios | Secure in-person identification for services requiring strong assurance of identity | Coming soon |

#### Banking & Payment

| Use Case ID | Name | Description | Status |
|-------------|------|-------------|--------|
| `payment-auth` | Online payment authorisation | Enables online payments to be authorised via an EUDI Wallet (TS12/PSD2 SCA) | Coming soon |
| `open-bank-account` | Open bank account | Enables individuals to open a bank account online using their EUDI Wallet | Coming soon |

#### Consumer

| Use Case ID | Name | Description | Status |
|-------------|------|-------------|--------|
| `age-verification` | Age verification | Prove you are above a specific age threshold (e.g., over 16, 18, or 21) | Coming soon |
| `ticket-pass` | Ticket or pass | Store, manage, and present digital tickets and access passes | Coming soon |

#### Travel

| Use Case ID | Name | Description | Status |
|-------------|------|-------------|--------|
| `mdl` | Mobile Driving Licence (mDL) | Proof of an individual's right to drive a certain kind of vehicle | Published |
| `dtc` | Digital Travel Credential (DTC) | Digital representation of identity document (passport, ID card, travel doc) | Coming soon |
| `epc` | European Parking Card (EPC) | Issued to persons with disabilities, recognising parking rights | Coming soon |
| `vrc` | Vehicle Registration Certificate (VRC) | Proves registration and legal compliance of a vehicle | Coming soon |

#### Health & Social Security

| Use Case ID | Name | Description | Status |
|-------------|------|-------------|--------|
| `disability-card` | European Disability Card | Proof of recognised disability status/entitlement to services | Coming soon |
| `eprescription` | e-Prescription | Identify yourself to access e-prescriptions via EUDI Wallet | Coming soon |
| `ehic` | European Health Insurance Card (EHIC) | Grants access to necessary healthcare in another Member State | Coming soon |
| `public-warnings` | Public warnings | Enables authorities to issue real-time warnings/alerts (natural disasters, etc.) | Coming soon |

#### Education

| Use Case ID | Name | Description | Status |
|-------------|------|-------------|--------|
| `edu-credentials` | Educational credentials | Store, manage, and present digitally verifiable education credentials | Coming soon |
| `student-card` | European student card | Enables students to store and present their student status | Coming soon |

#### Legal Representation

| Use Case ID | Name | Description | Status |
|-------------|------|-------------|--------|
| `representation` | Natural or legal person representation | Act on behalf of another individual or organisation using verifiable credentials | Coming soon |

---

### Use Case Applicability Matrix

Which roles are applicable to which use cases:

| Use Case | Relying Party | Issuer | Notes |
|----------|:-------------:|:------:|-------|
| PID-based identification | ✅ | ❌ | RP accepts PID for authentication |
| Pseudonym | ✅ | ❌ | RP accepts pseudonymous credentials |
| eSignature | ✅ | ✅ | RP verifies signatures, Issuer provides signing certificates |
| Proximity identification | ✅ | ❌ | RP verifies in-person |
| Online payment auth | ✅ | ✅ | RP = PSP, Issuer = SCA Attestation provider |
| Open bank account | ✅ | ✅ | RP = Bank, Issuer = Bank (for account EAAs) |
| Age verification | ✅ | ❌ | RP verifies age attestation |
| Ticket/pass | ✅ | ✅ | RP = Venue, Issuer = Ticket provider |
| mDL | ✅ | ✅ | RP = Police/rental, Issuer = Driving authority |
| DTC | ✅ | ✅ | RP = Border control, Issuer = State |
| EPC | ✅ | ✅ | RP = Parking operator, Issuer = Authority |
| VRC | ✅ | ✅ | RP = Authorities, Issuer = Registry |
| Disability Card | ✅ | ✅ | RP = Service provider, Issuer = Authority |
| e-Prescription | ✅ | ✅ | RP = Pharmacy, Issuer = Healthcare |
| EHIC | ✅ | ✅ | RP = Healthcare abroad, Issuer = Health insurance |
| Public warnings | ✅ | ✅ | RP = App, Issuer = Government |
| Educational credentials | ✅ | ✅ | RP = Employer, Issuer = University |
| Student card | ✅ | ✅ | RP = Campus services, Issuer = University |
| Representation | ✅ | ✅ | RP = Service provider, Issuer = Registry/company |

---

## Legal Source Hierarchy

**Critical**: Only legally binding sources should be referenced in the RCA.

| Tier | Type | Binding | Examples |
|------|------|---------|----------|
| 1 | Primary Regulation | ✅ | Regulation (EU) 2024/1183 (eIDAS 2.0) |
| 2 | Implementing Regulations | ✅ | 2024/2977, 2024/2979, 2024/2981 |
| 3 | Technical Specifications | ✅ (when adopted) | TS01-TS14 (being developed) |
| 4 | ARF | ❌ (guidance) | ARF v1.5 — cite only as context |

---

## Data Model

### Requirement Schema (YAML)

```yaml
id: string              # Unique identifier (e.g., "RP-ID-001")
category: string        # Registration | Technical | Authentication | DataProtection | Security
requirement: string     # Human-readable explanation (1-2 sentences)
legal_basis:
  regulation: string    # Document reference (e.g., "2024/1183")
  article: string       # Article number (e.g., "Article 5b")
  paragraph: string     # Optional paragraph/point (e.g., "1(a)")
legal_text: string      # Relevant excerpt from the regulation
deadline: date          # Implementation deadline (ISO 8601)
notes: string           # Additional context
links_to: string[]      # Internal document slugs for citation links
```

### User Assessment Schema (localStorage)

```json
{
  "assessments": {
    "RP-ID-001": {
      "status": "compliant|non_compliant|partial|na",
      "notes": "User's documentation/evidence",
      "updated": "2026-01-19T12:00:00Z"
    }
  },
  "exportHistory": [
    { "date": "2026-01-19", "format": "xlsx", "useCases": ["RP-UC-01"] }
  ]
}
```

---

## UI Components

### Use Case Categories (Official EC)

Categories exactly as defined in [EC Use Case Manuals](https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/896827987/Use+case+manuals):

| Category ID | Label | Use Cases Count |
|-------------|-------|----------------|
| `core` | Core functionality | 3 |
| `banking` | Banking & payment | 2 |
| `health` | Health & social security | 4 |
| `travel` | Travel | 4 |
| `consumer` | Consumer | 2 |
| `education` | Education | 2 |
| `identification` | Identification | 1 |
| `legal` | Legal representation | 1 |

**Total: 19 use cases across 8 categories**

---

### Page Layout: Hierarchical Selector

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  📋 REGULATORY COMPLIANCE ASSESSMENT                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─ STEP 1: SELECT ROLE ─────────────────────────────────────────────────────┐
│  │  ○ Relying Party    ○ EAA Issuer    ○ Wallet Provider (future)           │
│  └───────────────────────────────────────────────────────────────────────────┘
│                                                                              │
│  ┌─ STEP 2: SELECT USE CASES ────────────────────────────────────────────────┐
│  │                                                                           │
│  │  ┌─ Filter by Category ───────────────────────────────────────────────┐   │
│  │  │ [All] [Core] [Banking] [Health] [Travel] [Consumer] [Edu] [ID] [Legal] │
│  │  └────────────────────────────────────────────────────────────────────┘   │
│  │                                                                           │
│  │  ╔═══════════════════════════════════════════════════════════════════════╗│
│  │  ║ ☑ CORE FUNCTIONALITY                               [Select All ▼]    ║│
│  │  ╠═══════════════════════════════════════════════════════════════════════╣│
│  │  ║ ☑ PID-based identification in online services                        ║│
│  │  ║   Secure identification to an online service using the PID...        ║│
│  │  ╟───────────────────────────────────────────────────────────────────────╢│
│  │  ║ ☐ Use of a pseudonym in online services                              ║│
│  │  ║   Interact without revealing full identity, unless legally required  ║│
│  │  ╟───────────────────────────────────────────────────────────────────────╢│
│  │  ║ ☐ eSignature                                                         ║│
│  │  ║   Create advanced electronic signatures with handwritten validity    ║│
│  │  ╚═══════════════════════════════════════════════════════════════════════╝│
│  │                                                                           │
│  │  ╔═══════════════════════════════════════════════════════════════════════╗│
│  │  ║ ☑ BANKING & PAYMENT                                [Select All ▼]    ║│
│  │  ╠═══════════════════════════════════════════════════════════════════════╣│
│  │  ║ ☑ Online payment authorisation                                       ║│
│  │  ║   Enables online payments to be authorised via an EUDI Wallet        ║│
│  │  ╟───────────────────────────────────────────────────────────────────────╢│
│  │  ║ ☑ Open bank account                                                  ║│
│  │  ║   Enables individuals to open a bank account online using EUDI Wallet║│
│  │  ╚═══════════════════════════════════════════════════════════════════════╝│
│  │                                                                           │
│  │  ... (more categories collapsed/expandable) ...                           │
│  │                                                                           │
│  │  Selected: 4 use cases across 2 categories                                │
│  └───────────────────────────────────────────────────────────────────────────┘
│                                                                              │
│  ┌─ ACTIONS ─────────────────────────────────────────────────────────────────┐
│  │  [📊 Generate Assessment]  [📥 Export Excel]  [📝 Export Markdown]        │
│  └───────────────────────────────────────────────────────────────────────────┘
│                                                                              │
│══════════════════════════════════════════════════════════════════════════════│
│                                                                              │
│  REQUIREMENTS (24 items)                                 Filter: [All ▼]     │
│  ┌─────┬────────────┬─────────────────────────────┬──────────┬─────────────┐ │
│  │ ID  │ Category   │ Requirement                 │ Legal    │ Status      │ │
│  ├─────┼────────────┼─────────────────────────────┼──────────┼─────────────┤ │
│  │RP-01│Registration│ Register with supervisory...│ Art 5b 📖│ ✅ Compliant │ │
│  │RP-02│Technical   │ Validate Wallet Unit Att... │ 2024/2979│ ⚠️ Partial   │ │
│  │RP-03│Auth        │ Implement OpenID4VP flow... │ Art 5c(3)│ ❌ Pending   │ │
│  └─────┴────────────┴─────────────────────────────┴──────────┴─────────────┘ │
│                                                                              │
│  Legend: ✅ Compliant │ ❌ Non-Compliant │ ⚠️ Partial │ ➖ N/A                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### Use Case Selector Behavior

| Action | Result |
|--------|--------|
| Click category header checkbox | Select/deselect all use cases in category |
| Click individual use case | Toggle that use case only |
| Click category filter button | Show only that category's use cases |
| Category is partially selected | Show indeterminate checkbox (━) |
| All use cases in category selected | Show checked checkbox (☑) |
| No use cases in category selected | Show unchecked checkbox (☐) |

### Filter Bar (above use case list)

Pill-style buttons for quick filtering:
- **[All]** — Show all 8 categories
- **[Core]** — Filter to Core functionality only
- **[Banking]** — Filter to Banking & payment only
- etc.

Multiple category filters can be active (OR logic).

---

### Components

| Component | Purpose |
|-----------|---------|
| `RoleSelector` | Radio buttons for role selection (Step 1) |
| `UseCaseCategoryFilter` | Pill buttons for category filtering |
| `UseCaseCategoryCard` | Collapsible card for each category with header checkbox |
| `UseCaseItem` | Individual use case row with checkbox, name, description |
| `UseCaseSelector` | Container managing category cards and selection state |
| `RequirementTable` | Main data table with sorting/filtering |
| `StatusDropdown` | Dropdown to set compliance status |
| `LegalBasisCell` | Shows regulation reference, opens popover with full text |
| `NotesEditor` | Inline textarea for notes/evidence |
| `ExportButtons` | Excel and Markdown export buttons |

---

## Export Specifications

### Excel Format

```
├── Sheet 1: "Assessment Summary"
│   - Title row with logo placeholder
│   - Metadata: Generated date, Role, Use Cases
│   - Summary statistics: X Compliant, Y Non-Compliant, Z Partial
│
├── Sheet 2: "Requirements"
│   - Full requirements table
│   - Colored row backgrounds by status
│   - Frozen header row
│   - Column widths optimized
│
└── Sheet 3: "Legal References"
    - Full legal text for each requirement
    - Hyperlinks to EUR-Lex
```

### Color Scheme (Excel)

| Status | Background | Text |
|--------|------------|------|
| Compliant | `#D4EDDA` (light green) | `#155724` |
| Non-Compliant | `#F8D7DA` (light red) | `#721C24` |
| Partial | `#FFF3CD` (light yellow) | `#856404` |
| N/A | `#E2E3E5` (light gray) | `#383D41` |
| Header | `#1E3A5F` (dark blue) | `#FFFFFF` |

---

## Technical Dependencies

```json
{
  "xlsx-js-style": "^1.2.0"   // Excel with styling (no native xlsx styling)
}
```

Alternative: `exceljs` (more features, larger bundle)

---

## Implementation Phases

### Phase 1: Foundation (Sprint 1)
- [ ] Create requirement YAML schema
- [ ] Build RP-Identification requirements (15-20 items)
- [ ] Create ComplianceAssessment page
- [ ] Add route and sidebar entry
- [ ] Basic table display

### Phase 2: Interactivity (Sprint 2)
- [ ] Status dropdown per requirement
- [ ] Notes/evidence editor
- [ ] localStorage persistence
- [ ] Filter by category/status

### Phase 3: Export (Sprint 3)
- [ ] Add xlsx-js-style dependency
- [ ] Excel export with full formatting
- [ ] Markdown export
- [ ] Export history tracking

### Phase 4: Content Expansion (Sprint 4)
- [ ] Build RP-PSD2-SCA requirements
- [ ] Build Issuer-EAA requirements
- [ ] Link to internal documents (citations integration)
- [ ] TS12 requirements (when published)

---

## References

### External Sources

| Source | URL | Purpose |
|--------|-----|---------|
| EC Use Case Manuals | https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/896827987 | Use case definitions |
| EUDIW Tech Specs GitHub | https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications | TS01-TS14 specifications |
| EUR-Lex 2024/1183 | https://eur-lex.europa.eu/eli/reg/2024/1183/oj | eIDAS 2.0 core regulation |
| EUR-Lex 2024/2977 | https://eur-lex.europa.eu/eli/reg_impl/2024/2977/oj | PID and EAA rules |
| EUR-Lex 2024/2979 | https://eur-lex.europa.eu/eli/reg_impl/2024/2979/oj | Integrity and core functionalities |
| EUR-Lex 2024/2981 | https://eur-lex.europa.eu/eli/reg_impl/2024/2981/oj | Certification |

### Internal Documents

The RCA should link to these internal portal documents for context:
- `2024-1183` — eIDAS 2.0 consolidated
- `2024-2977` — PID/EAA implementing regulation
- `2024-2979` — Integrity implementing regulation
- `2024-2981` — Certification implementing regulation

---

## Open Questions

1. **Wallet Provider role?** — Should we add Wallet Provider as a third role? Many requirements apply across roles.

2. **NL-specific requirements?** — Should we include Netherlands-specific obligations (RDI registration, BSN handling, Wwft)?

3. **Version tracking?** — As regulations are amended, how do we version the requirement sets?

4. **Assessment sharing?** — Should users be able to export/import assessments (for team collaboration)?

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-19 | Use YAML for requirements | Human-readable, supports multi-line legal text, easy to version control |
| 2026-01-19 | Phase 1 focuses on RP-Identification | Most common use case, well-documented requirements |
| 2026-01-19 | Use xlsx-js-style over exceljs | Smaller bundle, sufficient for our needs |
| 2026-01-19 | Store assessments in localStorage | No backend required, user data stays on device |
