# Pending Task: Regulatory Compliance Assessment (RCA) Generator

**Created**: 2026-01-19  
**Status**: ✅ Phase 1, 2 & 3 Complete — Feature ready for use  
**Focus**: Relying Party role, 30 requirements across 6 categories

---

## Overview

Implement an RCA (Regulatory Compliance Assessment) generator that allows users to:
1. Select a **role** (e.g., Relying Party, EAA Issuer)
2. Select **use cases** (e.g., User Identification, PSD2 SCA, Credential Issuance)
3. Generate a compliance assessment table with:
   - Human-readable requirement explanations
   - References to legally binding regulations
   - Compliance status (Compliant / Non-Compliant / Partial)
   - Explanation/notes column
4. Export to **Excel (.xlsx)** with professional formatting (colors, borders)
5. Export to **Markdown** for documentation

---

## Regulatory Hierarchy (Important Distinction)

The user explicitly noted that **ARF is NOT legally binding**. The hierarchy is:

| Level | Document Type | Legally Binding? | Example |
|-------|--------------|------------------|---------|
| **1. Regulation** | Primary EU law | ✅ Yes | Regulation (EU) 2024/1183 |
| **2. Implementing Regulation** | Secondary law | ✅ Yes | 2024/2977 (PID/EAA), 2024/2979 (Integrity), 2024/2981 (Certification) |
| **3. Technical Specifications** | Detailed specs | ✅ Yes (when adopted) | TS01-TS14 (GitHub repo) |
| **4. ARF** | Reference framework | ❌ No (guidance only) | ARF v1.5 |

**Key Insight**: Technical Specifications (TS01-TS14) will become legally binding when formally adopted as Implementing Acts. Currently in development phase (March-August 2025).

---

## Official EC Use Cases (19 total, 8 categories)

**Source**: [EC Use Case Manuals](https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/896827987/Use+case+manuals)

### Core functionality (3)
| ID | Name | Description |
|----|------|-------------|
| `pid-online` | PID-based identification in online services | Secure identification to an online service using the PID stored in an EUDI Wallet |
| `pseudonym` | Use of a pseudonym in online services | Interact with digital platforms without revealing your full identity, unless legally or functionally required to |
| `esignature` | eSignature | Create advanced electronic signatures with the same legal validity as a handwritten signature |

### Banking & payment (2)
| ID | Name | Description |
|----|------|-------------|
| `payment-auth` | Online payment authorisation | Enables online payments to be authorised via an EUDI Wallet |
| `open-bank-account` | Open bank account | Enables individuals to open a bank account online using their EUDI Wallet |

### Travel (4)
| ID | Name | Description |
|----|------|-------------|
| `mdl` | Mobile Driving Licence (mDL) | Proof of an individual's right to drive a certain kind of vehicle |
| `dtc` | Digital Travel Credential (DTC) | A digital representation of the user's identity document such as an identity card, passport or another travel document |
| `epc` | European Parking Card (EPC) | Issued to persons with disabilities, recognising the right to certain reserved parking conditions and facilities |
| `vrc` | Vehicle Registration Certificate (VRC) | Proves the registration and legal compliance of a vehicle with national and European road transport regulations |

### Health & social security (4)
| ID | Name | Description |
|----|------|-------------|
| `disability-card` | European Disability Card | Serves as proof of recognised disability status/entitlement to disability services |
| `eprescription` | e-Prescription | Identify yourself in order to access e-prescriptions stored and presented via an EUDI Wallet |
| `ehic` | European Health Insurance Card (EHIC) | Grants access to necessary healthcare when in another Member State |
| `public-warnings` | Public warnings | Enables trusted public authorities to issue real-time or scheduled warnings and alerts, like for natural disasters |

### Consumer (2)
| ID | Name | Description |
|----|------|-------------|
| `age-verification` | Age verification | Prove you are above a specific age threshold (e.g., over 16, 18, or 21) using a verifiable digital credential |
| `ticket-pass` | Ticket or pass | Store, manage, and present digital tickets and access passes, like boarding passes or event tickets |

### Education (2)
| ID | Name | Description |
|----|------|-------------|
| `edu-credentials` | Educational credentials | Store, manage, and present digitally verifiable education-related credentials, like diplomas and certificates |
| `student-card` | European student card | Enables students to store and present their student status |

### Identification (1)
| ID | Name | Description |
|----|------|-------------|
| `proximity-id` | Identification in proximity scenarios | Secure in-person identification for services where the transaction requires strong assurance of identity |

### Legal representation (1)
| ID | Name | Description |
|----|------|-------------|
| `representation` | Natural or legal person representation | Enables users to act on behalf of another individual or an organisation using digitally verifiable credentials |

---

## Phase 1 Focus

- **Role**: Relying Party
- **Priority Use Cases**: 
  - `pid-online` — PID-based identification in online services
  - `payment-auth` — Online payment authorisation (TS12/PSD2 SCA)
  - `open-bank-account` — Open bank account

---

## Template Structure

### RCA Table Columns

| Column | Description |
|--------|-------------|
| **ID** | Requirement identifier (e.g., RP-ID-001) |
| **Category** | Grouping (Registration, Onboarding, Authentication, Data Protection) |
| **Requirement** | Human-readable explanation (short) |
| **Legal Basis** | Reference to regulation + article |
| **Legal Text** | Relevant excerpt (collapsible) |
| **Compliance Status** | Compliant ✅ / Non-Compliant ❌ / Partial ⚠️ / N/A |
| **Your Status** | Editable field for organization's assessment |
| **Evidence/Notes** | Editable field for documentation |
| **Deadline** | Implementation deadline if applicable |

### Requirement Categories (RP - User Identification)

1. **Registration Requirements**
   - RP registration with supervisory authority
   - Data minimization declaration
   - Use case specification

2. **Technical Requirements**
   - Wallet Unit Attestation validation
   - Credential format support (SD-JWT VC, mDoc)
   - Cryptographic requirements (ES256, ECDH-ES)

3. **Authentication Flow**
   - OpenID4VP implementation
   - PID verification
   - Holder binding validation

4. **Data Protection**
   - Selective disclosure support
   - GDPR compliance
   - Data retention limits

5. **Security Requirements**
   - Replay attack prevention
   - Secure transport (TLS 1.3)
   - Key management

---

## UI Design

### New Tab: "Compliance" (or "RCA")

Location: Sidebar, after "AI Chat" tab

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  REGULATORY COMPLIANCE ASSESSMENT                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │ Role        │  │ Use Case         │  │ [Generate RCA] │  │
│  │ ▼ Relying   │  │ ☑ Identification │  │                │  │
│  │   Party     │  │ ☑ PSD2 SCA       │  │ [Export XLSX]  │  │
│  │             │  │ ☐ Issuance       │  │ [Export MD]    │  │
│  └─────────────┘  └──────────────────┘  └────────────────┘  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Generated Assessment Table (filterable, sortable)         │
│  ┌────┬──────────┬─────────────────┬──────────┬──────────┐ │
│  │ ID │ Category │ Requirement     │ Legal    │ Status   │ │
│  ├────┼──────────┼─────────────────┼──────────┼──────────┤ │
│  │RP01│ Reg.     │ Register with...│ Art 5b   │ ▼ Select │ │
│  │RP02│ Tech.    │ Validate WUA... │ 2024/2979│ ▼ Select │ │
│  └────┴──────────┴─────────────────┴──────────┴──────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### New Dependencies

```json
{
  "xlsx-js-style": "^1.2.0"  // Excel export with styling
}
```

### File Structure

```
docs-portal/
├── config/
│   └── rca/
│       ├── roles.yaml                    # Role definitions
│       ├── use-cases.yaml                # Use case definitions
│       └── requirements/
│           ├── rp-identification.yaml    # RP user identification requirements
│           ├── rp-psd2-sca.yaml         # RP PSD2 SCA requirements
│           └── issuer-eaa.yaml          # Issuer EAA requirements
├── src/
│   ├── pages/
│   │   └── ComplianceAssessment.jsx      # Main RCA page
│   ├── components/
│   │   └── RCA/
│   │       ├── RoleSelector.jsx          # Role dropdown
│   │       ├── UseCaseSelector.jsx       # Use case checkboxes
│   │       ├── RequirementTable.jsx      # Main table component
│   │       ├── StatusDropdown.jsx        # Compliance status selector
│   │       ├── LegalBasisPopover.jsx     # Shows legal text on hover
│   │       └── ExportButtons.jsx         # XLSX + MD export
│   └── utils/
│       └── rca/
│           ├── exportExcel.js            # xlsx-js-style wrapper
│           └── exportMarkdown.js         # MD export utility
└── scripts/
    └── build-rca-data.js                 # Build-time data processing
```

### YAML Schema for Requirements

```yaml
# config/rca/requirements/rp-identification.yaml
id: rp-identification
name: "Relying Party - User Identification"
description: "Requirements for accepting EUDI Wallet for user onboarding and identification"
role: relying_party
category: identification

requirements:
  - id: RP-ID-001
    category: Registration
    requirement: "Register with national supervisory authority before accepting EUDI Wallet"
    legal_basis:
      regulation: "2024/1183"
      article: "Article 5b"
      paragraph: "1"
    legal_text: |
      Relying parties intending to rely on European Digital Identity Wallets 
      shall register with the relevant Member State authority.
    deadline: "2027-11-21"
    notes: "In NL: Rijksinspectie Digitale Infrastructuur (RDI)"

  - id: RP-ID-002
    category: Registration
    requirement: "Specify requested attributes in registration (data minimization)"
    legal_basis:
      regulation: "2024/1183"
      article: "Article 5c"
      paragraph: "2(a)"
    legal_text: |
      Relying parties shall request from users only those attributes that are 
      necessary and proportionate for the intended service.
    deadline: "2027-11-21"
    
  - id: RP-ID-003
    category: Technical
    requirement: "Validate Wallet Unit Attestation before accepting credentials"
    legal_basis:
      regulation: "2024/2979"
      article: "Article 4"
      paragraph: "1"
    legal_text: |
      Before accepting person identification data from a wallet unit, 
      relying parties shall validate the wallet unit attestation.
    deadline: "2027-11-21"
```

---

## Export Formats

### Excel Export (.xlsx)

Using `xlsx-js-style` for rich formatting:

```javascript
// Example styling
const headerStyle = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "1E3A5F" } },  // Dark blue
  border: { /* ... */ }
};

const compliantStyle = {
  fill: { fgColor: { rgb: "D4EDDA" } }  // Light green
};

const nonCompliantStyle = {
  fill: { fgColor: { rgb: "F8D7DA" } }  // Light red
};

const partialStyle = {
  fill: { fgColor: { rgb: "FFF3CD" } }  // Light yellow
};
```

### Markdown Export

```markdown
# Regulatory Compliance Assessment
## Role: Relying Party
## Use Cases: User Identification, PSD2 SCA

Generated: 2026-01-19

| ID | Category | Requirement | Legal Basis | Status | Notes |
|----|----------|-------------|-------------|--------|-------|
| RP-ID-001 | Registration | Register with supervisory authority | Art 5b, Reg 2024/1183 | ✅ Compliant | Registered with RDI |
| RP-ID-002 | Registration | Specify requested attributes | Art 5c(2)(a), Reg 2024/1183 | ⚠️ Partial | Under review |
```

---

## Implementation Phases

### Phase 1: Core Infrastructure ✅ COMPLETE
1. ✅ Create YAML schema for requirements
2. ✅ Build RP requirements file (30 requirements)
3. ✅ Create build-rca.js script (build-time processing)
4. ✅ Create ComplianceAssessment.jsx page
5. ✅ Create ComplianceAssessment.css (dark theme styling)
6. ✅ Add route and sidebar entry ("RCA" under Tools)
7. ✅ Implement hierarchical use case selector (8 categories, 19 use cases)
8. ✅ Implement requirements table with filtering

### Phase 2: Interactivity ✅ COMPLETE
1. ✅ Add compliance status selector (Pending/Compliant/Non-Compliant/Partial/N/A)
2. ✅ Implement localStorage for user assessments
3. ✅ Add filtering by category/status

### Phase 3: Export ✅ COMPLETE
1. ✅ Add xlsx-js-style dependency
2. ✅ Implement Excel export with professional styling (3 sheets: Summary, Requirements, Legal References)
3. ✅ Implement Markdown export
4. ✅ Add export history tracking (stored in localStorage)

### Phase 4: Expand Use Cases & Content (Future)
1. ☐ Add Issuer-EAA requirements
2. ☐ Add remaining RP use case requirements
3. ☐ Link to internal documents (citations integration)

---

## Key Files

| File | Purpose |
|------|---------|
| `.agent/session/pending-task.md` | This planning document |
| `config/rca/requirements/*.yaml` | Requirement definitions |
| `src/pages/ComplianceAssessment.jsx` | Main page component |
| `src/utils/rca/exportExcel.js` | Excel export utility |

---

## Next Step

Create the YAML schema and first requirements file (RP-Identification), then implement the basic page component.
