# Vendor Compliance Questionnaire (VCQ) Tool - Implementation Plan

**Version:** 1.0  
**Created:** 2026-01-22  
**Status:** ✅ Implemented (Phase 1-3 Complete)  
**Decision ID:** DEC-222  
**Commit:** `c15ba5f`

---

## 1. Executive Summary

The **Vendor Compliance Questionnaire (VCQ) Tool** is a new feature for the eIDAS 2.0 Documentation Portal that generates role-specific, toggleable compliance questionnaires for Relying Parties evaluating third-party intermediaries in the EUDIW ecosystem.

### Primary Use Case
A Relying Party (e.g., a bank) considering outsourcing wallet interaction to a third-party vendor needs to:
1. Understand their regulatory obligations when using intermediaries
2. Generate a compliance questionnaire to send to potential vendors
3. Assess vendor responses against regulatory requirements
4. Link requirements back to authoritative legal sources

---

## 2. Terminology

| Term | Definition |
|------|------------|
| **VCQ** | Vendor Compliance Questionnaire - the assessment tool |
| **Presentation Intermediary (PIF)** | Entity that receives wallet presentations on behalf of an RP and forwards them |
| **Verification Intermediary (VIF)** | Entity that performs cryptographic verification of attestations on behalf of an RP |
| **ICT Third-Party** | Per DORA Art. 3(19), third-party service provider providing ICT services |
| **Critical ICT Third-Party** | Per DORA Art. 31, systematically important ICT provider under enhanced oversight |

---

## 3. Feature Architecture

### 3.1 UI Location
- **Sidebar:** New entry "VCQ Tool" (or "Vendor Questionnaire")
- **Route:** `/vcq`
- **Position:** After "RCA Tool", before other tools

### 3.2 User Flow (Simplified)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     VCQ Tool - Entry Screen                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ① Select Intermediary Type(s)                              │   │
│  │                                                              │   │
│  │  ☐ Presentation Intermediary (PIF)                          │   │
│  │     Receives and forwards wallet presentations               │   │
│  │                                                              │   │
│  │  ☐ Verification Intermediary (VIF)                          │   │
│  │     Performs cryptographic verification                      │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ② Source Selection                                         │   │
│  │     Selecting DORA includes ICT third-party provisions       │   │
│  │                                                              │   │
│  │  Primary (eIDAS 2.0)    Implementing Acts    Related Regs   │   │
│  │  ☑ eIDAS 2.0            ☐ Integrity Reg      ☐ GDPR         │   │
│  │  ☑ eIDAS Amendment      ☐ Protocols Reg      ☐ DORA (+12)   │   │
│  │                         ☐ Registration Reg                   │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                    [ Generate Questionnaire (N) ]                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 Output Views (Toggleable)

**View A: Summary/Overview**
- High-level compliance domains
- Requirement counts by category
- Critical obligations highlighted
- Visual cards/dashboard style

**View B: Requirements Table** (Default)
- Structured table with columns:
  - ID (e.g., `VEND-CORE-001`)
  - Requirement Statement
  - Legal Basis (deep-linked)
  - Category
  - Applicability (PIF/VIF/Both)
  - Linked RCA Requirements (if any)

**View C: Exportable Questionnaire**
- PDF/Markdown export
- Formatted for sending to vendors
- Includes response fields/checkboxes
- Legal references as appendix

---

## 4. Requirement Taxonomy

### 4.1 ID Prefix Structure

| Prefix | Scope | Description |
|--------|-------|-------------|
| `VEND-CORE-nnn` | All Vendors | Core requirements applicable to all intermediary types |
| `VEND-PIF-nnn` | Presentation Intermediary | Specific to presentation forwarding |
| `VEND-VIF-nnn` | Verification Intermediary | Specific to cryptographic verification |
| `VEND-ICT-nnn` | DORA Extended | ICT third-party specific provisions |

### 4.2 Category Taxonomy (Aligned with RCA)

| Category | Description |
|----------|-------------|
| `Security` | Technical security measures |
| `Privacy` | Data protection and minimization |
| `Governance` | Policies, contracts, oversight |
| `Certification` | Registration, audits, attestations |
| `Operational` | Service delivery, SLAs, resilience |
| `Technical` | Technical implementation specifics |
| `Transparency` | Disclosure, reporting, documentation |

---

## 5. Requirement Sources & Mapping

### 5.1 Primary Sources (Portal-Integrated)

| Source | Portal Path | Status |
|--------|-------------|--------|
| eIDAS 2.0 (2024/1183) | `/regulation/2024-1183` | ✓ Imported |
| eIDAS (2014/910 Consolidated) | `/regulation/2014-910` | ✓ Imported |
| GDPR (2016/679) | `/regulation/2016-679` | ✓ Imported |
| DORA (2022/2554) | `/regulation/2022-2554` | ✓ Imported |
| ARF v1.5 | `/arf/annexes/annex-2/...` | ✓ Imported |
| Technical Specifications | `/technical-specs/...` | ✓ Imported |

### 5.2 ARF Topic Mapping

| ARF Topic | Relevance | Key HLRs |
|-----------|-----------|----------|
| Topic 45: RP Intermediaries | **Critical** | `RPI_01` - `RPI_24` |
| Topic 6: RP Authentication | High | `RPA_01` - `RPA_12` |
| Topic 27: RP Registration | High | `Reg_23` - `Reg_30` |
| Topic 44: Registration Certificates | Medium | `RPRC_*` |
| Topic 1: Accessing Services | Medium | `OIA_12` - `OIA_16` |

### 5.3 Regulation Article Mapping

#### eIDAS 2.0 (2024/1183)
| Article | Topic | Intermediary Relevance |
|---------|-------|------------------------|
| Art. 5b(10) | No-Storage Mandate | **Critical** - Intermediaries shall not store data |
| Art. 5b(5) | RP Registration | RPs (including intermediaries) must register |
| Art. 5a(4)(c) | Wallet Security | Relevant for VIF crypto operations |

#### GDPR (2016/679)
| Article | Topic | Intermediary Relevance |
|---------|-------|------------------------|
| Art. 28 | Processor Obligations | Data Processing Agreement requirements |
| Art. 32 | Security of Processing | Technical measures for intermediaries |
| Art. 33-34 | Breach Notification | Incident response chain |
| Art. 35 | DPIA | Required for high-risk processing |

#### DORA (2022/2554) - Extended Scope
| Article | Topic | Intermediary Relevance |
|---------|-------|------------------------|
| Art. 28 | ICT Third-Party Risk Management | General framework |
| Art. 29 | Preliminary Assessment | Before contracting |
| Art. 30 | Key Contractual Provisions | Mandatory contract terms |
| Art. 31-44 | Oversight Framework | Critical ICT providers |

---

## 6. Core Requirements Extract

### 6.1 VEND-CORE: All Intermediaries

```yaml
VEND-CORE-001:
  statement: "The vendor shall not store personal data from wallet presentations beyond the time strictly necessary to complete the transaction."
  legalBasis:
    - regulation: "2024/1183"
      article: "5b"
      paragraph: "10"
  category: "Privacy"
  applicability: ["PIF", "VIF"]
  linkedRCA: ["RP-SEC-001", "RP-GOV-003"]

VEND-CORE-002:
  statement: "The vendor shall be registered as an intermediary in accordance with Member State registration requirements."
  legalBasis:
    - regulation: "2024/1183"
      article: "5b"
      paragraph: "5"
    - arf: "Reg_23"
  category: "Certification"
  applicability: ["PIF", "VIF"]

VEND-CORE-003:
  statement: "The vendor shall maintain a valid access certificate issued by a notified Access Certificate Authority."
  legalBasis:
    - arf: "Reg_10"
    - arf: "RPI_02"
  category: "Certification"
  applicability: ["PIF", "VIF"]

VEND-CORE-004:
  statement: "The vendor shall implement a Data Processing Agreement meeting GDPR Article 28 requirements."
  legalBasis:
    - regulation: "2016/679"
      article: "28"
  category: "Governance"
  applicability: ["PIF", "VIF"]

VEND-CORE-005:
  statement: "The vendor shall implement appropriate technical and organizational security measures for personal data processing."
  legalBasis:
    - regulation: "2016/679"
      article: "32"
  category: "Security"
  applicability: ["PIF", "VIF"]
```

### 6.2 VEND-PIF: Presentation Intermediary Specific

```yaml
VEND-PIF-001:
  statement: "The vendor shall display both its own identity and the identity of the intermediated Relying Party to the wallet user."
  legalBasis:
    - arf: "RPI_07"
  category: "Transparency"
  applicability: ["PIF"]

VEND-PIF-002:
  statement: "The vendor shall forward presentation requests without modification of the requested attributes."
  legalBasis:
    - arf: "RPI_11"
  category: "Technical"
  applicability: ["PIF"]

VEND-PIF-003:
  statement: "The vendor shall ensure secure transmission of wallet presentations to the Relying Party."
  legalBasis:
    - arf: "RPI_13"
  category: "Security"
  applicability: ["PIF"]
```

### 6.3 VEND-VIF: Verification Intermediary Specific

```yaml
VEND-VIF-001:
  statement: "The vendor shall maintain up-to-date Trusted Lists for PID Providers and Attestation Providers."
  legalBasis:
    - arf: "OIA_12"
    - arf: "OIA_13"
  category: "Technical"
  applicability: ["VIF"]

VEND-VIF-002:
  statement: "The vendor shall validate attestation signatures using trust anchors from official Trusted Lists."
  legalBasis:
    - regulation: "2014/910"
      article: "32"
    - arf: "OIA_14"
  category: "Security"
  applicability: ["VIF"]

VEND-VIF-003:
  statement: "The vendor shall verify attestation revocation status before accepting a presentation."
  legalBasis:
    - arf: "VCR_13"
  category: "Security"
  applicability: ["VIF"]

VEND-VIF-004:
  statement: "The vendor shall implement secure key management for verification operations in accordance with applicable standards."
  legalBasis:
    - regulation: "2019/881"
      article: "certification schemes"
  category: "Security"
  applicability: ["VIF"]
```

### 6.4 VEND-ICT: DORA Extended Scope

```yaml
VEND-ICT-001:
  statement: "The vendor contract shall include provisions for audit rights as required by DORA Article 30(2)(e)."
  legalBasis:
    - regulation: "2022/2554"
      article: "30"
      paragraph: "2(e)"
  category: "Governance"
  applicability: ["PIF", "VIF"]
  scope: "Extended"

VEND-ICT-002:
  statement: "The vendor shall provide exit strategies and transition planning support as required by DORA Article 30(2)(j)."
  legalBasis:
    - regulation: "2022/2554"
      article: "30"
      paragraph: "2(j)"
  category: "Operational"
  applicability: ["PIF", "VIF"]
  scope: "Extended"

VEND-ICT-003:
  statement: "The vendor shall maintain and make available an ICT risk management framework aligned with financial entity requirements."
  legalBasis:
    - regulation: "2022/2554"
      article: "28"
  category: "Governance"
  applicability: ["PIF", "VIF"]
  scope: "Extended"
```

---

## 7. RCA Linkage Strategy

Requirements in the VCQ that correspond to existing RCA requirements for the "Relying Party" role should link by ID rather than duplicate content:

| VCQ Requirement | Links to RCA |
|-----------------|--------------|
| `VEND-CORE-001` | `RP-SEC-001` (No-storage mandate) |
| `VEND-CORE-002` | `RP-REG-001` (Registration) |
| `VEND-PIF-001` | `RP-GOV-003` (Intermediary governance) |

The UI should show:
- VCQ requirement text
- "See also: RP-SEC-001" link that navigates to RCA filtered to that requirement

---

## 8. Data Model

### 8.1 Directory Structure

```
docs-portal/
├── data/
│   └── vcq/
│       ├── requirements/
│       │   ├── core.yaml       # VEND-CORE-* requirements
│       │   ├── pif.yaml        # VEND-PIF-* requirements
│       │   ├── vif.yaml        # VEND-VIF-* requirements
│       │   └── ict.yaml        # VEND-ICT-* requirements
│       ├── categories.yaml     # Category definitions (shared with RCA)
│       └── vcq-config.yaml     # Tool configuration
└── src/
    └── pages/
        └── vcq/
            └── index.tsx       # VCQ Tool page
```

### 8.2 Requirement Schema

```yaml
# Schema for individual requirement
id: string                    # e.g., "VEND-CORE-001"
statement: string             # The requirement statement
legalBasis:                   # Array of legal references
  - regulation: string        # Regulation ID (e.g., "2024/1183")
    article: string           # Article number
    paragraph?: string        # Optional paragraph/point
  - arf?: string              # ARF HLR ID (e.g., "RPI_07")
  - techSpec?: string         # Technical Specification reference
category: string              # Category from taxonomy
applicability: string[]       # ["PIF", "VIF"] or subset
scope?: string                # "Core" or "Extended"
linkedRCA?: string[]          # Array of RCA requirement IDs
notes?: string                # Optional implementation notes
```

---

## 9. Technical Implementation

### 9.1 Build Pipeline

1. **Validation Script:** `validate-vcq.js`
   - Schema validation for YAML files
   - Legal basis reference validation (regulation/article exists)
   - RCA link validation (linked IDs exist)
   - Category taxonomy enforcement

2. **Build Script:** `build-vcq.js`
   - Compile YAML to JSON
   - Generate deep-links to regulations
   - Resolve RCA linkages
   - Output: `public/data/vcq.json`

### 9.2 UI Components

| Component | Purpose |
|-----------|---------|
| `VCQSelector` | Intermediary type and scope selection |
| `VCQRequirementTable` | Filterable, sortable requirements table |
| `VCQSummaryView` | Dashboard/card view of compliance domains |
| `VCQExportDialog` | PDF/Markdown export configuration |
| `LegalBasisLink` | Deep-link component (reuse from RCA) |

### 9.3 Shared Infrastructure

- **Reuse from RCA:**
  - `useRegulationsIndex` hook for regulation deep-linking
  - `LegalBasisPopover` component for hover previews
  - Category filter chips
  - Export utilities

---

## 10. Implementation Phases

### Phase 1: Core Framework (MVP) ✅ COMPLETE
- [x] Create data directory structure (`config/vcq/`)
- [x] Define YAML schemas
- [x] Extract and document core requirements (VEND-CORE-*)
- [x] Build validation script (`scripts/validate-vcq.js`)
- [x] Create basic UI route `/vcq`
- [x] Implement selector component (IntermediaryTypeSelector)
- [x] Implement requirements table (RequirementsTable)

### Phase 2: Intermediary Specifics ✅ COMPLETE
- [x] Extract PIF-specific requirements (VEND-PIF-*) - 9 requirements
- [x] Extract VIF-specific requirements (VEND-VIF-*) - 13 requirements
- [x] Implement applicability filtering
- [x] Add RCA linkage display ("See also: RP-XXX" links in UI)

### Phase 3: Source Selection ✅ COMPLETE (Simplified from 3 to 2 steps)
- [x] Add DORA ICT requirements (VEND-ICT-*) - 12 requirements
- [x] ~~Implement scope toggle (ScopeExtensionSelector)~~ - Removed (consolidated into Source Selection)
- [x] Complete legal basis linking (LegalBasisLink component)
- [x] Implement Source Selection (Step 2) - filter by regulation source
- [x] DORA selection auto-includes ICT third-party requirements (+12)
- [x] Dynamic requirement counting based on source selection

### Phase 4: Output Views ✅ COMPLETE
- [x] Implement Summary View (View A) - Dashboard cards with criticality breakdown & category progress
- [x] Implement view toggle (Overview/Details buttons)
- [x] Implement Export functionality (View C)
- [x] PDF generation - browser print-to-PDF with custom styling
- [x] Markdown export - functional

### Phase 5: Polish ⏳ PARTIAL
- [ ] ARF requirement linking (with external URL fallback)
- [ ] Technical specification references
- [x] UI polish and responsive design
- [x] View persistence (localStorage saves Overview/Details preference)
- [x] Snippets extracted to `.agent/snippets/vcq-patterns.md`
- [x] Terminology updated (VCQ, PIF, VIF, ICT Third-Party)
- [x] PDF generation (browser print-to-PDF)

---

## 11. External References (To Link Later)

These sources are not imported but should be referenced:

| Source | Reference Pattern |
|--------|-------------------|
| ARF v1.5 (GitHub) | `https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/...` |
| Lissi Blogs | Industry analysis, non-normative |
| Technical Specifications | Link to GitHub if not imported |

---

## 12. Open Questions

1. **ARF Integration:** Should we import ARF high-level requirements into a searchable format, or link externally?

2. **Vendor Response Tracking:** Future feature - allow RPs to track vendor responses to questionnaire?

3. **Use Case Mapping:** Should VCQ requirements map to specific use cases like RCA does?

4. **Versioning:** How to handle requirement updates when regulations change?

---

## 13. Success Criteria

- [x] RP can select intermediary type(s) and generate relevant questionnaire
- [x] All requirements link to authoritative legal sources
- [x] Export produces professional, vendor-ready document (Markdown)
- [x] Requirements accurately reflect current regulatory landscape (48 total)
- [x] Tool integrates visually with existing portal design

---

## 14. Related Documentation

- **KI:** `eidas_vendor_compliance_framework` (Knowledge Item)
- **Research:** `docs-portal/docs/research/INTERMEDIARY_ROLE_ANALYSIS.md`
- **RCA Tool:** `/rca` - Existing compliance assessment tool

---

## 15. Implementation Summary

**Completed:** 2026-01-22

| Metric | Value |
|--------|-------|
| Total Requirements | 48 |
| Core (both PIF & VIF) | 14 |
| PIF-specific | 9 |
| VIF-specific | 13 |
| DORA ICT Extended | 12 |
| Critical Criticality | 24 |
| High Criticality | 18 |

**Files Created:**
- `config/vcq/vcq-config.yaml`
- `config/vcq/categories.yaml`
- `config/vcq/requirements/core.yaml`
- `config/vcq/requirements/pif.yaml`
- `config/vcq/requirements/vif.yaml`
- `config/vcq/requirements/ict.yaml`
- `scripts/validate-vcq.js`
- `scripts/build-vcq.js`
- `src/pages/VendorQuestionnaire.jsx`
- `src/pages/VendorQuestionnaire.css`
- `public/data/vcq-data.json`

**Commit:** `c15ba5f` - `feat(vcq): implement Vendor Compliance Questionnaire tool`

---

*Document updated 2026-01-22 after initial implementation.*

