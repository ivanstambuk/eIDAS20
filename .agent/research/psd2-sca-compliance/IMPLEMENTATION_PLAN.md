# PSD2 SCA Compliance Assessment for EUDI Wallet (TS12)

> **Objective**: Assess whether using the EUDI Wallet with TS12 for Strong Customer Authentication satisfies PSD2 RTS requirements from a Payment Service Provider (bank) perspective.
>
> **Context**: The user works at a financial institution and needs to evaluate if they can rely on EUDI Wallet for SCA while remaining PSD2-compliant.
>
> **Key Assumption**: TS12 is the target implementation path for SCA compliance.
>
> **Output**: Standalone markdown document with compliance matrix, gap analysis, and actionable follow-ups. Will be published on GitHub for sharing.

---

## Phase 1: Document Import & Repository Setup

### 1.1 Import EU Legislation (EUR-Lex → Markdown)

| # | Document | CELEX | Notes | Status |
|---|----------|-------|-------|--------|
| 1.1.1 | **PSD2 Directive (2015/2366)** | 32015L2366 | Full text including preamble, all recitals, all articles | ⏳ Pending |
| 1.1.2 | **PSD2 RTS (2018/389)** | 32018R0389 | Full text including preamble, all recitals, all 35 articles | ⏳ Pending |

**Import Method**: Use `eurlex_html_to_md.py` script. Store in `.agent/research/psd2-sca-compliance/sources/`.

**Note**: These are for analysis only, NOT for portal import.

### 1.2 Import Industry Analysis

| # | Document | Source | Notes | Status |
|---|----------|--------|-------|--------|
| 1.2.1 | "The EU Digital Identity Wallet in payments: Interpretation of legislators' intention and feasibility assessment" | Dutch Payments Association (Betaalvereniging) | SCA vs SUA equivalence analysis | ⏳ Pending |

**Import Method**: Download PDF, convert to markdown.

### 1.3 Clone Reference Implementations

| # | Repository | URL | Purpose | Status |
|---|------------|-----|---------|--------|
| 1.3.1 | iOS Reference | `https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui` | Implementation evidence | ⏳ Pending |
| 1.3.2 | Android Reference | `https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui` | Implementation evidence | ⏳ Pending |

**Clone Location**: `.agent/research/psd2-sca-compliance/reference-impl/`

**Commit Strategy**: Pin to specific commits for reproducibility. Document commit hash and date.

### 1.4 Reference Technical Specifications (Already Available)

| # | Document | Location | Status |
|---|----------|----------|--------|
| 1.4.1 | TS12 (SCA Implementation with Wallet) | `04_technical_specs/docs/technical-specifications/ts12-*.md` | ✅ Available (v1.0, Dec 2025) |
| 1.4.2 | ARF High-Level Requirements | `03_arf/docs/annexes/annex-2/` | ✅ Available |
| 1.4.3 | ARF Topic AA (SCA with Wallet) | `03_arf/docs/discussion-topics/aa-*.md` | ✅ Available |

### 1.5 Existing Industry Analysis (External — To Import/Reference)

These documents have already analyzed aspects of PSD2/SCA + EUDI Wallet. We will leverage them to avoid duplication.

| # | Document | Source | Date | Focus | Status |
|---|----------|--------|------|-------|--------|
| 1.5.1 | **"The EU Digital Identity Wallet in payments"** | Dutch Payments Association (Betaalvereniging) | May 2025 | SCA vs SUA equivalence, dynamic linking gap | ⏳ Download PDF |
| 1.5.2 | **"Digital Identity Wallet for Payments"** | SPA + SIA (Joint White Paper) | Oct 2025 | Why SCA is challenging, eIDAS 2/PSD2 mandates | ⏳ Email-gated PDF |
| 1.5.3 | **"What does it take to use the EUDI wallet for payment?"** | European Wallet Consortium (EWC) | Oct 2025 | PSP-controlled SCA attestation solution | ⏳ Download PDF |
| 1.5.4 | **EBA Q&A on Digital Wallets** | European Banking Authority | 2019-2024 | SCA for card enrollment, RTS interpretation | ⏳ Reference only |

**How we'll use these:**
- Dutch PA document → Primary reference for SCA/SUA gap analysis
- SPA/SIA paper → Context on why SCA is challenging
- EWC paper → Validates TS12 approach (SCA Attestation architecture)
- EBA Q&A → Authoritative interpretation of specific RTS articles

**What's MISSING from existing analysis (our value-add):**
1. ❌ Article-by-article PSD2 RTS mapping to TS12
2. ❌ Links to reference implementation code
3. ❌ PSP-actionable compliance matrix
4. ❌ Clear identification of non-delegable PSP obligations

---

## Phase 2: Requirements Extraction

### 2.1 PSD2 RTS Article-by-Article Analysis

Extract ALL normative requirements from PSD2 RTS, organized by chapter:

**CHAPTER I — GENERAL PROVISIONS (Articles 1-3)**
- Article 1: Subject matter and scope
- Article 2: General authentication requirements
- Article 3: Review of security measures

**CHAPTER II — SECURITY MEASURES FOR SCA (Articles 4-9)** ← **PRIMARY FOCUS**
- Article 4: Authentication code
- Article 5: Dynamic linking
- Article 6: Requirements for elements categorised as knowledge
- Article 7: Requirements for elements categorised as possession
- Article 8: Requirements for elements categorised as inherence
- Article 9: Independence of elements

**CHAPTER III — EXEMPTIONS FROM SCA (Articles 10-21)**
- Articles 10-21: Various exemption conditions

**CHAPTER IV — CONFIDENTIALITY AND INTEGRITY (Articles 22-23)**
- Article 22: PSP requirements for authentication
- Article 23: Management of authentication features

**CHAPTER V — COMMON AND SECURE COMMUNICATION (Articles 24-35)**
- Articles on TPP interface requirements

### 2.2 Requirement Categorization Schema

For each extracted requirement, document:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (e.g., `RTS-4-1-a`) |
| `article` | Article number and paragraph |
| `text` | Exact requirement text |
| `addressee` | PSP / Wallet Provider / User / Shared |
| `nature` | Technical / Procedural / Documentation |
| `modal_verb` | SHALL / SHOULD / MAY (RFC 2119) |

### 2.3 PSD2 Supporting Articles

Extract relevant definitions and context from PSD2 Directive:
- Article 4: Definitions (authentication, personalized security credentials, etc.)
- Article 97: Strong customer authentication requirements
- Article 98: Regulatory technical standards

---

## Phase 3: Compliance Mapping

### 3.1 Three-Tier Evidence Hierarchy

For each PSD2 RTS requirement, evidence is sought in this order:

```
Tier 1 (Normative):    PSD2 RTS Requirement
                             ↓
Tier 2 (Specification): TS12 Section / ARF HLR
                             ↓
Tier 3 (Implementation): Reference Implementation Code
```

**Critical Rule**: If a requirement is satisfied ONLY at Tier 3 (code) but NOT at Tier 2 (specification), it MUST be flagged as:

> ⚠️ **Implementation-Specific**: This requirement is addressed in the reference implementation but is NOT mandated by TS12 or ARF HLRs. Third-party wallets may implement differently.

### 3.2 Compliance Matrix Structure

| RTS Ref | Requirement | Addressee | TS12 | ARF HLR | iOS Impl | Android Impl | Status | Justification | PSP Action | Follow-up |
|---------|-------------|-----------|------|---------|----------|--------------|--------|---------------|------------|-----------|
| Art. 4(1) | Authentication code shall be specific to amount and payee | PSP | §3.6 | — | [link] | [link] | ✅ | KB-JWT `jti` is per-transaction | None | — |
| Art. 22(1)(a) | Document security measures | PSP | — | — | N/A | N/A | ⚠️ | PSP responsibility, cannot delegate | **PSP must document** | Contract req. |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

### 3.3 Gap Categories

| Category | Definition | Action Required |
|----------|------------|-----------------|
| ✅ COMPLIANT | Requirement fully addressed by TS12/HLRs | None |
| ⚠️ PARTIAL | Partially addressed, needs PSP action | Document specific gaps |
| ⚠️ IMPL-ONLY | Only in reference impl, not spec | Flag risk for third-party wallets |
| ⚠️ UNCLEAR | Ambiguous or awaiting clarification | Document uncertainty |
| ❌ GAP | Not addressed anywhere | Assess compliance risk |
| ➖ N/A | Not applicable to wallet use case | Justify exclusion |

---

## Phase 4: Special Analysis Areas

### 4.1 PSP-Specific Obligations

PSD2 RTS places certain obligations directly on PSPs that CANNOT be delegated to wallet providers:

| Article | Obligation | Why Not Delegable |
|---------|------------|-------------------|
| Art. 22(1)(a) | Document security measures | Regulatory accountability |
| Art. 22(1)(b) | Periodically test security measures | PSP audit scope |
| Art. 22(1)(c) | Evaluate and audit security measures | External audit requirement |
| Art. 3 | Review security measures | Ongoing PSP responsibility |

**Analysis**: For each, determine what contractual/technical arrangements can satisfy the spirit of the requirement when using a third-party wallet.

### 4.2 Failed Authentication Attempts (Article 8)

**Regulatory Requirement**: 
> "The number of failed authentication attempts that can take place consecutively [...] shall not exceed five within a given period of time."

**Analysis Tasks**:
1. Check if TS12 specifies this → Document section
2. Check ARF HLRs for lockout requirements → Document HLR ID
3. Search reference implementations for lockout logic → Link to code
4. If not in specs, flag as implementation-dependent gap

### 4.3 SCA vs SUA Distinction (Dutch PA Analysis)

**Key Question**: Is Strong User Authentication (SUA) under eIDAS 2.0 equivalent to Strong Customer Authentication (SCA) under PSD2?

**Dutch PA Position** (from search results):
- SUA and SCA share multi-factor basis (two of knowledge/possession/inherence)
- SCA has **additional** requirement: dynamic linking to amount and payee
- Using EUDIW as 2FA tool may NOT satisfy full SCA requirements

**Analysis**: Document this distinction and assess whether TS12 addresses the gap.

### 4.4 SCA Attestation Rulebooks

**Key Finding**: TS12 repeatedly defers to "SCA Attestation Rulebooks" for:
- Specific attestation types and formats
- Extended metadata specifications
- Provider and RP policies

**Problem**: These rulebooks don't exist yet (as of TS12 v1.0).

**Analysis**: Document which requirements are deferred and assess compliance implications.

---

## Phase 5: Final Deliverable

### 5.1 Create Compliance Assessment Document

**File**: `.agent/research/psd2-sca-compliance/EUDI_WALLET_PSD2_SCA_COMPLIANCE.md`

### 5.2 Document Structure

```markdown
# EUDI Wallet PSD2 SCA Compliance Assessment

## 1. Executive Summary
- Overall compliance assessment
- Key findings (compliant areas, gaps, uncertainties)
- Critical risks for PSPs

## 2. Background
### 2.1 PSD2 and SCA Requirements
### 2.2 EUDI Wallet and TS12 Architecture
### 2.3 SCA vs SUA: The Dutch PA Analysis

## 3. Methodology
### 3.1 Document Sources
### 3.2 Three-Tier Evidence Hierarchy
### 3.3 Compliance Status Definitions

## 4. Full Compliance Matrix
[Table with all PSD2 RTS requirements]

## 5. Gap Analysis
### 5.1 Gaps in TS12 Specification
### 5.2 PSP-Specific Obligations
### 5.3 Implementation-Dependent Items
### 5.4 Awaiting SCA Attestation Rulebooks

## 6. Reference Implementation Analysis
### 6.1 iOS Wallet
### 6.2 Android Wallet
### 6.3 Findings and Caveats

## 7. Risk Assessment
### 7.1 Non-Compliance Risks by Category
### 7.2 Mitigation Strategies

## 8. Recommendations
### 8.1 For PSP Internal Implementation
### 8.2 For Wallet Provider Contracts
### 8.3 For Regulatory Clarification

## Appendix A: PSD2 RTS Full Text (Reference)
## Appendix B: TS12 Section Index
## Appendix C: Reference Implementation Links
```

---

## Estimated Effort (Revised)

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1.1-1.2 | Import PSD2 + RTS + Dutch PA | ~45 min |
| Phase 1.3 | Clone reference implementations | ~10 min |
| Phase 2 | Extract all RTS requirements (~35 articles) | ~60 min |
| Phase 3 | Compliance mapping (all requirements) | ~90 min |
| Phase 4 | Special analysis areas | ~45 min |
| Phase 5 | Final document drafting | ~45 min |
| **Total** | | ~5-6 hours |

---

## Known Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| PSD2 RTS consolidated version unavailable | Use base CELEX, note any amendments |
| Reference implementations don't cover SCA flows | Document as gap, focus on specs |
| SCA Attestation Rulebooks don't exist yet | Explicitly document deferred requirements |
| Dynamic linking ambiguity | Cite Dutch PA analysis, document uncertainty |

---

## Pre-Flight Checklist

Before starting:
- [x] Confirmed documents: PSD2 (2015/2366), PSD2 RTS (2018/389)
- [x] Import method: `eurlex_html_to_md.py` script exists
- [x] TS12 available at: `04_technical_specs/docs/technical-specifications/`
- [x] Reference impl repos identified: iOS and Android
- [x] Output location: `.agent/research/psd2-sca-compliance/`
- [x] Three-tier evidence hierarchy defined
- [x] Gap categories defined
- [x] Deliverable structure defined

---

## Status

| Phase | Status | Last Updated |
|-------|--------|--------------|
| Phase 1.1 | ✅ Complete | 2026-01-27 |
| Phase 1.2 | ✅ Complete | 2026-01-27 |
| Phase 1.3 | ✅ Complete | 2026-01-27 |
| Phase 2 | ✅ Complete | 2026-01-27 |
| Phase 3 | ✅ Complete | 2026-01-27 |
| Phase 4 | ✅ Complete | 2026-01-27 |
| Phase 5 | ✅ Complete | 2026-01-27 |

---

## Deliverables

| Document | Location | Status |
|----------|----------|--------|
| **PSD2 SCA Compliance Assessment** | `PSD2_SCA_COMPLIANCE_ASSESSMENT.md` | ✅ Complete (v1.1) |
| PSD2 RTS Source | `sources/32018R0389.md` | ✅ Imported |
| Reference Implementations | `reference-impl/` | ✅ Cloned (iOS + Android) |
| Commit Baseline | `REFERENCE_IMPL_COMMITS.md` | ✅ Documented |

---

*Plan created: 2026-01-27*  
*Last updated: 2026-01-27 17:13 CET*
