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

### Phase 5: Polish ✅ COMPLETE
- [x] ARF requirement linking (external GitHub URLs)
- [ ] Technical specification references (optional - deferred)
- [x] UI polish and responsive design
- [x] View persistence (localStorage saves Overview/Details preference)
- [x] Snippets extracted to `.agent/snippets/vcq-patterns.md`
- [x] Terminology updated (VCQ, PIF, VIF, ICT Third-Party)
- [x] PDF generation (browser print-to-PDF)

### Phase 6: ARF Database Integration ✅ COMPLETE
- [x] Import ARF CSV (143 HLRs from 6 relevant topics)
- [x] Validate VCQ arfReference fields against official ARF
- [x] Fix invalid HLR references (RPI_11→RPI_06, RPI_13→RPI_08, RPI_14→RPI_09, RPI_15→RPI_08)
- [x] Enhanced deep linking with topic anchors
- [x] HLR popovers with official specification text
- [x] Add missing Topic 52 requirements (7 new requirements: VEND-CORE-015-018, VEND-PIF-010-012)
- [x] Search integration for ARF HLRs (129 HLRs searchable)
- [ ] Weekly sync mechanism (deferred)

**See Section 16 for detailed Phase 6 design.**

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

1. ~~**ARF Integration:** Should we import ARF high-level requirements into a searchable format, or link externally?~~ ✅ **ANSWERED (Phase 6):** Imported 143 HLRs, added to search, deep linking implemented.

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

**Completed:** 2026-01-22 (Initial), 2026-01-23 (Phase 6 ARF)

| Metric | Value |
|--------|-------|
| Total Requirements | 55 |
| Core (both PIF & VIF) | 18 |
| PIF-specific | 12 |
| VIF-specific | 13 |
| DORA ICT Extended | 12 |
| Critical Criticality | 29 |
| High Criticality | 20 |
| ARF HLRs Indexed | 129 |

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

---

## 16. Phase 6: ARF Database Integration (Detailed Design)

**Status:** 📋 PLANNED  
**Priority:** High  
**Created:** 2026-01-23  
**Decision:** DEC-223  

### 16.1 Executive Summary

The Architecture and Reference Framework (ARF) provides the technical specifications for the EUDIW ecosystem via **617 High-Level Requirements (HLRs)** across 55 topics. This phase integrates the ARF as a first-class data source in our portal, enabling:

1. **Authoritative HLR references** — Replace manual VCQ ARF references with official data
2. **Deep linking** — Click-through to specific HLRs with anchor fragments
3. **Full-text search** — Search requirement text across all 617 HLRs
4. **Validation** — Auto-detect stale/invalid HLR references
5. **Popovers** — Show official requirement text on hover

### 16.2 Data Source

#### Primary Source (Machine-readable)
```
https://raw.githubusercontent.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/refs/heads/main/hltr/high-level-requirements.csv
```

#### Human-readable Links (for UI deep linking)
| Document | Purpose |
|----------|---------|
| `annex-2.01-high-level-requirements.md` | Canonical list with all HLRs |
| `annex-2.02-high-level-requirements-by-topic.md` | Organized by topic (preferred for Topic 52 links) |
| `annex-2.03-high-level-requirements-by-category.md` | Organized by category |

#### CSV Schema
```
Delimiter: Semicolon (;)
Encoding: UTF-8 with BOM

Columns:
1. Harmonized_ID    - Unique ID (e.g., "AS-RP-51-001")
2. Part             - "Ecosystem-Wide Rules" | "Actor-Specific Requirements"
3. Category         - "Relying Parties", "Wallet Providers", etc.
4. Topic            - Full topic string with number
5. Topic_Number     - Numeric (1-55)
6. Topic_Title      - Human-readable title
7. Subsection       - Optional grouping within topic
8. Index            - HLR ID (e.g., "RPI_07") — KEY FIELD
9. Requirement_specification - Full requirement text
10. Notes           - Implementation notes/guidance
```

### 16.3 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ARF Integration Architecture                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐     ┌────────────────┐     ┌─────────────────────┐   │
│  │ GitHub CSV       │────▶│ import-arf.js  │────▶│ arf-hlr-data.json   │   │
│  │ (Source of Truth)│     │ (Parse/Process)│     │ (Build Artifact)    │   │
│  └──────────────────┘     └────────────────┘     └─────────────────────┘   │
│                                  │                          │               │
│                                  ▼                          ▼               │
│                           ┌────────────────┐     ┌─────────────────────┐   │
│                           │ validate-vcq.js│     │ VCQ/RCA/Portal      │   │
│                           │ (Check refs)   │     │ (Consume data)      │   │
│                           └────────────────┘     └─────────────────────┘   │
│                                                                              │
│  New Components:                                                             │
│  ├── scripts/import-arf.js          # Download + parse CSV                  │
│  ├── config/arf/arf-config.yaml     # Topics to import, URL, refresh        │
│  ├── public/data/arf-hlr-data.json  # Processed HLR database                │
│  └── src/components/HLRPopover.jsx  # Reusable HLR display component        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 16.4 Data Model

#### 16.4.1 ARF Config (`config/arf/arf-config.yaml`)
```yaml
schemaVersion: 1
source:
  csvUrl: "https://raw.githubusercontent.com/.../hltr/high-level-requirements.csv"
  baseUrl: "https://github.com/.../blob/main/docs/annexes/annex-2"
  byTopicDoc: "annex-2.02-high-level-requirements-by-topic.md"
  
# Topics relevant to VCQ/RCA tools
relevantTopics:
  - 1   # Accessing Online Services
  - 6   # Relying Party Authentication
  - 14  # Validity and Revocation
  - 27  # Registration
  - 44  # Registration Certificates
  - 45  # (Legacy - now 52)
  - 52  # Relying Party Intermediaries
  
# Actor categories to filter
relevantActors:
  - "Relying Parties"
  - "Member States & Registrars"
  
# Mapping from our arfReference.topic to Topic_Number
topicMapping:
  "Topic 45": 52  # ARF renamed Topic 45 to Topic 52
```

#### 16.4.2 Processed HLR Record
```typescript
interface ARFRequirement {
  // Identity
  harmonizedId: string;     // "AS-RP-51-001"
  hlrId: string;            // "RPI_07" (Index column)
  
  // Classification
  part: "ecosystem" | "actor-specific";
  category: string;         // "Relying Parties"
  topicNumber: number;      // 52
  topicTitle: string;       // "Relying Party intermediaries"
  subsection?: string;
  
  // Content
  specification: string;    // Full requirement text
  notes?: string;           // Implementation notes
  
  // Generated
  isEmpty: boolean;         // True if specification === "Empty"
  deepLink: string;         // Full GitHub URL with anchor
  searchText: string;       // Normalized lowercase for search
}
```

#### 16.4.3 Output JSON Structure (`public/data/arf-hlr-data.json`)
```json
{
  "generatedAt": "2026-01-23T02:40:00Z",
  "sourceCommit": "abc123",
  "stats": {
    "totalHLRs": 617,
    "nonEmptyHLRs": 580,
    "topics": 55,
    "importedTopics": 7
  },
  "requirements": [ /* ARFRequirement[] */ ],
  "byHlrId": {
    "RPI_07": { /* ARFRequirement */ },
    "OIA_12": { /* ARFRequirement */ }
  },
  "byTopic": {
    "52": [ /* ARFRequirement[] */ ]
  },
  "topicMetadata": {
    "52": {
      "number": 52,
      "title": "Relying Party intermediaries",
      "anchor": "a2330-topic-52-relying-party-intermediaries",
      "hlrCount": 13
    }
  }
}
```

### 16.5 Implementation Tasks

#### Phase 6.1: Data Import Pipeline (Day 1) ✅ COMPLETE

- [x] **6.1.1** Create `config/arf/arf-config.yaml` with source URLs and topic filters
- [x] **6.1.2** Create `scripts/import-arf.js`:
  - Fetch CSV from GitHub raw URL
  - Parse CSV with semicolon delimiter, handle BOM
  - Filter to relevant topics/actors
  - Generate deep links with topic anchors
  - Output `public/data/arf-hlr-data.json`
- [x] **6.1.3** Add npm script: `"build:arf": "node scripts/import-arf.js"`
- [ ] **6.1.4** Integrate into `build:all-content` pipeline
- [ ] **6.1.5** Add to CI validation (check JSON exists and is valid)

#### Phase 6.2: VCQ Reference Validation (Day 1-2) ✅ COMPLETE

- [x] **6.2.1** Audit all `arfReference.hlr` values in VCQ YAML files
- [ ] **6.2.2** Update `validate-vcq.js` to:
  - Load `arf-hlr-data.json`
  - Check each `arfReference.hlr` exists in ARF data
  - Report invalid/missing HLR references
  - Suggest corrections for renamed HLRs
- [x] **6.2.3** Fix invalid references:
  - `RPI_11` → RPI_06
  - `RPI_13` → RPI_08
  - `RPI_14` → RPI_09
  - `RPI_15` → RPI_08
- [x] **6.2.4** Update `arfReference.topic` from "Topic 45" → "Topic 52"

#### Phase 6.3: Deep Linking Enhancement (Day 2) ✅ COMPLETE

- [x] **6.3.1** Update `ARFReferenceLink` component:
  - Load ARF data via hook `useARFData()`
  - Look up HLR by ID
  - Generate deep link with topic anchor fragment
  - Handle missing HLRs gracefully
- [x] **6.3.2** URL pattern:
  ```
  https://github.com/.../annex-2.02-high-level-requirements-by-topic.md#a2330-topic-52-relying-party-intermediaries
  ```
- [x] **6.3.3** Add fallback for HLRs without anchors (link to topic section)

#### Phase 6.4: HLR Popover Component (Day 2-3) ✅ COMPLETE

- [x] **6.4.1** Integrated popover directly into `ARFReferenceLink` component (no separate file)
- [x] **6.4.2** Popover content:
  - HLR ID with badge
  - Topic title
  - Requirement specification (truncated if long)
  - Notes (if available)
  - "View in ARF →" link
- [x] **6.4.3** Reuse popover pattern from `LegalBasisLink`
- [x] **6.4.4** Add CSS styles in `VendorQuestionnaire.css`

#### Phase 6.5: Add Missing VCQ Requirements (Day 3-4)

Based on ARF Topic 52 analysis, add missing intermediary requirements:

| HLR | Priority | VCQ Requirement to Add |
|-----|----------|------------------------|
| RPI_01 | High | Intermediary registration |
| RPI_03 | High | Register each intermediated RP |
| RPI_04 | Medium | Legal evidence of relationship |
| RPI_05 | Medium | RP details in requests |
| RPI_08 | High | Forward only to specified RP |
| RPI_09 | High | Verification obligations |
| RPI_10 | Critical | Delete data after forwarding |

- [x] **6.5.1** Add new requirements to `requirements/core.yaml` (RPI_01, RPI_03, RPI_04, RPI_09) and `requirements/pif.yaml` (RPI_05, RPI_08, RPI_10)
- [x] **6.5.2** Map to appropriate categories (governance, verification, privacy)
- [x] **6.5.3** Set criticality based on ARF language (SHALL = Critical/High)
- [x] **6.5.4** Run validation, rebuild — **55 total requirements** (up from 48)

#### Phase 6.6: Search Integration (Day 4) ✅ COMPLETE

- [x] **6.6.1** Extend Orama search index to include ARF HLRs
- [x] **6.6.2** Index fields: `hlrId`, `specification`, `topicTitle`, `notes`
- [x] **6.6.3** Add search result type "arf-hlr"
- [x] **6.6.4** Link search results to deep-linked ARF pages — **129 ARF HLRs now searchable**

#### Phase 6.7: Sync & Maintenance (Day 5) ✅ COMPLETE

- [x] **6.7.1** ARF integrated into main build pipeline (`npm run build`)
- [ ] **6.7.2** Add GitHub Actions workflow to check for ARF updates weekly (deferred)
- [ ] **6.7.3** Create script to diff local vs remote ARF (deferred)
- [ ] **6.7.4** Add ARF version/commit hash to portal footer or about page (deferred)

### 16.6 UI/UX Design

#### ARF Reference Link (Enhanced)
```
┌─────────────────────────────────────────────┐
│ 📐 RPI_07 (Topic 52)                        │ ← Orange badge, clickable
└─────────────────────────────────────────────┘
                    │
                    ▼ (hover)
┌─────────────────────────────────────────────┐
│ ┌───────────────────────────────────────┐   │
│ │ 📐 RPI_07                             │   │ ← HLR ID
│ │ Topic 52: Relying Party intermediaries│   │ ← Topic
│ └───────────────────────────────────────┘   │
│                                             │
│ In case a Wallet Unit receives a            │
│ presentation request from an intermediary   │ ← Spec text
│ on behalf of an intermediated Relying       │
│ Party, it SHALL display the names and       │
│ identifiers of both...                      │
│                                             │
│ ─────────────────────────────────────────   │
│ Note: In this case, the name and            │ ← Notes (if any)
│ identifier of the intermediary are...       │
│                                             │
│ View in ARF →                               │ ← Deep link
└─────────────────────────────────────────────┘
```

#### Search Result Card
```
┌─────────────────────────────────────────────┐
│ 📐 ARF High-Level Requirement               │
│ RPI_07 - Relying Party intermediaries       │
│                                             │
│ "...it SHALL display the names and          │
│ identifiers of both the intermediary..."    │
│                                             │
│ Topic 52 • Relying Parties                  │
└─────────────────────────────────────────────┘
```

### 16.7 Validation Rules

Add to `scripts/validate-vcq.js`:

```javascript
// ARF Reference Validation
function validateARFReferences(requirements, arfData) {
  const errors = [];
  const warnings = [];
  
  for (const req of requirements) {
    if (req.arfReference?.hlr) {
      const hlrId = req.arfReference.hlr;
      const arfReq = arfData.byHlrId[hlrId];
      
      if (!arfReq) {
        errors.push(`${req.id}: Invalid HLR reference '${hlrId}' - not found in ARF`);
      } else if (arfReq.isEmpty) {
        warnings.push(`${req.id}: HLR '${hlrId}' is marked as Empty in ARF`);
      }
      
      // Check topic consistency
      if (req.arfReference.topic) {
        const expectedTopic = `Topic ${arfReq.topicNumber}`;
        if (req.arfReference.topic !== expectedTopic) {
          warnings.push(`${req.id}: Topic mismatch - expected '${expectedTopic}', got '${req.arfReference.topic}'`);
        }
      }
    }
  }
  
  return { errors, warnings };
}
```

### 16.8 Success Criteria

- [ ] All 617 ARF HLRs are imported and searchable
- [ ] All VCQ `arfReference.hlr` values validated against official ARF
- [ ] Zero invalid HLR references
- [ ] Deep links work (no 404s, correct anchors)
- [ ] HLR popovers show official specification text
- [ ] ARF search results appear alongside regulation search
- [ ] Sync mechanism documented and automated

### 16.9 Dependencies

- Orama search index (existing)
- CSV parser (`csv-parse` or manual split on `;`)
- GitHub raw content access (no auth needed for public repo)

### 16.10 Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| ARF structure changes | Compare hash on import, alert on schema changes |
| HLR IDs renamed | Map old→new in config, validate on build |
| Large JSON size | Filter to relevant topics only, lazy-load full data |
| GitHub rate limits | Cache locally, refresh weekly not per-build |
| Anchor fragments change | Test links in CI with headless browser |

### 16.11 Estimated Effort

| Phase | Tasks | Effort |
|-------|-------|--------|
| 6.1 Data Import | 5 | 3h |
| 6.2 Validation | 4 | 2h |
| 6.3 Deep Linking | 3 | 1h |
| 6.4 HLR Popover | 4 | 2h |
| 6.5 Missing Requirements | 4 | 3h |
| 6.6 Search Integration | 4 | 2h |
| 6.7 Sync & Maintenance | 4 | 2h |
| **Total** | **28** | **15h** |

---

## 17. Phase 6 Backlog (Deferred Items)

**Created:** 2026-01-23

The following items were identified during Phase 6 implementation but deferred:

### 17.1 Validation Enhancements ✅ COMPLETE

| Task | Status | Notes |
|------|--------|-------|
| ~~ARF reference validation~~ | ✅ Done | Already implemented in validate-vcq.js lines 256-315. Checks HLR existence. |
| ~~Empty HLR warning~~ | ✅ Done | Already implemented. Currently warns on Reg_23, RPI_02. |
| ~~CI validation~~ | ✅ Done | Added 2026-01-23. `npm run validate:vcq` runs before build in deploy.yml. |


### 17.2 Maintenance & Sync

| Task | Priority | Description |
|------|----------|-------------|
| **Weekly ARF sync GitHub Action** | Low | Workflow that checks for ARF CSV updates and creates PR if changes detected |
| **ARF diff script** | Low | Compare local vs remote ARF, output changes report |
| **ARF version in footer** | Low | Display ARF commit hash or version in portal footer |

### 17.3 UI/UX Polish

| Task | Priority | Description |
|------|----------|-------------|
| ~~ARF popover testing~~ | ✅ Done | Verified 2026-01-23. Popovers render correctly: HLR ID, Topic badge, specification text, notes, "View in ARF →" link. |
| **Search result styling for ARF HLRs** | Low | Different card style for ARF search results vs regulations/terminology |

### 17.4 Coverage Extensions

| Task | Priority | Description |
|------|----------|-------------|
| **Topic 14 (VAL_*) VCQ requirements** | Low | Currently imported but no VCQ requirements use VAL_* HLRs yet |
| **RPI_06 integration** | Low | "Include access cert + registration cert" - may warrant a VCQ requirement |
| **RPI_07a integration** | Low | "Wallet verify contractual relationship" - may warrant a VCQ requirement |

---

## 18. Appendix: ARF Topic Reference

| Topic # | Title | VCQ Relevance |
|---------|-------|---------------|
| 1 | Accessing Online Services with a Wallet Unit | OIA_* requirements |
| 6 | Relying Party Authentication and User Approval | RPA_* requirements |
| 7 | Attestation revocation and revocation checking | VCR_* requirements |
| 14 | Validity, Authenticity and Revocation Checks | VAL_* (imported, not used) |
| 27 | Registration of Providers and Relying Parties | Reg_* requirements |
| 44 | Registration Certificates | RPRC_* requirements |
| **52** | **Relying Party Intermediaries** | **RPI_* requirements (PRIMARY)** |
| 53 | Zero-Knowledge Proofs | ZKP_* (future) |

---

## 19. Phase 7: RCA Integration (DRAFT)

**Status:** 📋 SCOPE DRAFT — Not yet approved  
**Created:** 2026-01-23  
**Last Reviewed:** 2026-01-23

### 19.1 Current State

| Feature | Status | Implementation |
|---------|--------|----------------|
| `linkedRCA` field in VCQ YAML | ✅ Done | 17 VCQ requirements have linkedRCA references |
| "See also" links in VCQ UI | ✅ Done | VendorQuestionnaire.jsx lines 767-781 |
| Link target format | ✅ Done | Links to `#/rca?req=RP-XXX-NNN` |

**Current linked requirements:**
- `core.yaml`: 10 requirements with linkedRCA
- `pif.yaml`: 4 requirements with linkedRCA
- `vif.yaml`: 3 requirements with linkedRCA
- `ict.yaml`: 0 (no RCA links yet)

### 19.2 Potential Scope Options

#### Option A: Enhance Outbound Links (VCQ → RCA) — LOW EFFORT

| Task | Description | Effort |
|------|-------------|--------|
| **RCA link popovers** | Hover to preview RCA requirement text (like ARF popovers) | 2h |
| **RCA ?req= handling** | RCA tool highlights/scrolls to specific requirement when linked | 1h |
| **Increase linkedRCA coverage** | Audit VCQ reqs missing links, add more mappings | 2h |

**Total: ~5h**

#### Option B: Add Reverse Links (RCA → VCQ) — MEDIUM EFFORT

| Task | Description | Effort |
|------|-------------|--------|
| **VCQ mentions in RCA** | When viewing RP-SEC-001 in RCA, show "Related VCQ: VEND-CORE-001" | 3h |
| **RCA profile awareness** | VCQ auto-selects requirements based on saved RCA profile | 4h |

**Total: ~7h**

#### Option C: Cross-Tool Dashboard — HIGHER EFFORT

| Task | Description | Effort |
|------|-------------|--------|
| **Unified compliance view** | Dashboard showing RCA + VCQ status together | 6h |
| **Profile-based VCQ generation** | If RCA profile = "uses_intermediary", auto-include PIF | 4h |

**Total: ~10h**

### 19.3 Recommended MVP (Option A)

Start with Option A to validate usefulness before deeper integration:

1. **Fix RCA ?req= handling** — Make deep links work (highlight requirement)
2. **Add RCA popovers** — Like ARF, show requirement text on hover
3. **Audit linkedRCA coverage** — Add missing links to ICT requirements

### 19.4 Open Questions

1. Should RCA profiles automatically influence VCQ generation?
2. Is a unified dashboard needed, or are separate tools sufficient?
3. How to handle RCA requirements that have no VCQ equivalent?

### 19.5 Dependencies

- RCA tool must support `?req=` URL parameter
- RCA data must be accessible from VCQ component
- Shared popover component pattern (reuse from ARF)

---

*Phase 6 completed 2026-01-23. Backlog updated same date.*
*Phase 7 scope drafted 2026-01-23 — awaiting decision.*

