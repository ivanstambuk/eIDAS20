# Intermediary Role Analysis: eIDAS 2.0 Regulatory Compliance Assessment

**Date:** January 21, 2026  
**Context:** Relying Party evaluation of third-party vendor solutions (e.g., Lissi Connector) for EUDI Wallet integration  
**Status:** ✅ Analysis Complete — Implemented as RP Profiles

---

## Executive Summary

This document captures the comprehensive analysis of the "Intermediary" role within the eIDAS 2.0 framework. The analysis was conducted to determine whether intermediaries warrant a distinct role in the Regulatory Compliance Assessment (RCA) tool, or whether their requirements should be mapped to existing roles.

**Key Finding:** The Intermediary is **NOT** a new distinct role. Per Article 5b(10), intermediaries are **legally deemed to be Relying Parties** with one critical additional constraint: the **"no-storage" mandate**. This is implemented as **profile-based filtering** within the existing Relying Party role.

---

## 1. Background and Research Context

### 1.1 The Use Case

For organizations evaluating 3rd-party vendors: solutions that act as intermediaries for EUDI Wallet integration. The evaluation requires understanding:

1. What legal obligations apply to intermediaries?
2. Does deployment model (SaaS vs. self-hosted) have regulatory implications?
3. Should the RCA tool have a dedicated "Intermediary" role?
4. What specific requirements apply to organizations using or acting as intermediaries?

### 1.2 Source Materials Analyzed

- **Blog Post:** "The EUDI Wallet Intermediary: A Guide to the eIDAS 2.0 Ecosystem's Most Critical Role" (Lissi)
- **Blog Post:** "The EUDI Wallet Interoperability Challenge: Why One Standard Isn't the Whole Story" (Lissi)
- **Visual Diagrams:** Architecture diagrams showing intermediary positioning, certificate management, and "build vs. buy" decision matrices
- **Legal Documents:** Regulation 910/2014 (consolidated), Implementing Regulations 2025/848, 2025/847, 2025/1569, 2024/2982, 2024/2979

---

## 2. Legal Foundation

### 2.1 The Core Provision: Article 5b(10)

The primary legal basis for intermediaries is found in **Article 5b(10) of Regulation 910/2014** (as amended by Regulation 2024/1183):

> "Intermediaries acting on behalf of relying parties shall be **deemed to be relying parties** and shall **not store data about the content of the transaction**."

This single paragraph establishes two critical principles:

1. **Legal Equivalence:** Intermediaries inherit ALL obligations of Relying Parties
2. **Enhanced Restriction:** The absolute prohibition on storing transaction content data

### 2.2 Registration Requirements: 2025/848 Annex I (Points 14-15)

Implementing Regulation 2025/848 (Registration of Wallet-Relying Parties) explicitly addresses intermediary relationships:

**Annex I, Point 14:**
> "Where applicable, an indication that the wallet-relying party relies upon an intermediary acting on behalf of the relying party who intends to rely upon the wallet."

**Annex I, Point 15:**
> "Where applicable, an association to the intermediary that the wallet-relying party is relying upon that is acting on behalf of the relying party who intends to rely upon the wallet."

**Implications:**
- National registers track which RPs use intermediaries
- Creates a formal dependency chain in the trust infrastructure
- Supervisory bodies can trace issues through the intermediary relationship

### 2.3 A Second Type of Intermediary: Verification Intermediaries (2025/1569)

Article 9 of Implementing Regulation 2025/1569 introduces a distinct concept:

> "The verification mechanism shall provide an access point where qualified trust service providers issuing qualified electronic attestations of attributes can electronically request the verification against authentic sources **or designated intermediaries recognised at national level**..."

This creates two distinct "intermediary" concepts:

| Type | Context | Legal Basis | Primary Actor |
|------|---------|-------------|---------------|
| **Wallet Presentation Intermediary** | Acting on behalf of RPs to interact with wallets | Art. 5b(10) | Relying Parties |
| **Verification Intermediary** | Proxying verification requests to authentic sources | 2025/1569 Art. 9 | EAA Issuers (QTSPs) |

For this analysis, we focus on **Wallet Presentation Intermediaries** (Art. 5b(10)).

---

## 3. Technical Architecture: The "Trust Bridge" Pattern

### 3.1 What an Intermediary Does

The Intermediary serves as a specialized infrastructure layer that abstracts the complexity of the EUDI Wallet ecosystem:

| Capability | Description |
|------------|-------------|
| **Single Trust Bridge** | Connects organizations to all 30+ national EUDI Wallets via one integration |
| **Certificate Management** | Manages the complex lifecycle of Access Certificates and Registration Certificates |
| **Protocol Handling** | Implements OpenID4VP, OpenID4VCI, SD-JWT, ISO 18013-5/7 |
| **Trust List Monitoring** | Continuously monitors national PKI Trusted Lists for revocations |
| **Semantic Normalization** | Handles attribute format variations across different wallet implementations |
| **DCQL Query Orchestration** | Executes complex boolean credential requests |

### 3.2 The "Pyramid of Complexity"

Based on industry analysis (Lissi) and the ARF, the technical burden is structured across five layers:

1. **Security & Protocol Abstraction (Layer 1):** HAIP profile enforcement, evolving standards
2. **Semantic Normalization (Layer 2):** Date format translation, attribute mapping
3. **Complex Query Logic (Layer 3):** DCQL (Digital Credential Query Language)
4. **Trust Framework Orchestration (Layer 4):** National Trust List lookups, PKI management
5. **Certificate Orchestration (Dual Duality):**
   - Access Certificate: Intermediary's identity to the wallet ecosystem
   - Registration Certificate: End-RP's intended use (one per client per use case)

### 3.3 The Two Certificate Types

| Certificate | Purpose | Who Holds It | Implication |
|-------------|---------|--------------|-------------|
| **Access Certificate** | "Who is making the connection?" | Only the Intermediary | Identifies the intermediary to wallets |
| **Registration Certificate** | "Why is data being requested?" | One per RP per use case | The RP's identity + use case is visible to users |

**Critical Point:** Even when using an intermediary, the **end-RP's identity is visible to the wallet user**. The wallet displays BOTH the intermediary's identity AND the end-RP's identity with the specific use case.

---

## 4. Deployment Model Analysis: SaaS vs. Self-Hosted

### 4.1 Regulatory Impact Matrix

The choice between SaaS Intermediary Service and Self-Hosted Connector has significant regulatory implications:

| Regulatory Dimension | SaaS Intermediary Service | Self-Hosted Connector |
|---------------------|---------------------------|------------------------|
| **GDPR Role Division** | Vendor = Data Processor (Art. 28) → **DPA Required** | RP = sole Controller, no third-party processor |
| **Data Processing Agreement** | **Mandatory**. Must specify purposes, categories, deletion, audit rights | **Not required** for wallet data flow |
| **Article 5b(10) Burden** | **Vendor carries the legal obligation**. You must audit their compliance | **You carry the obligation directly** with full visibility |
| **DORA (2022/2554) Risk** | **High ICT Third-Party Risk**. Must manage under DORA Art. 28-30 | **Lower DORA exposure**. Software license ≠ operational dependency |
| **Audit & Supervisory Access** | Dependent on vendor SOC2/ISO27001 reports | Direct access. Full internal audit capability |
| **Data Sovereignty** | Data transits vendor infrastructure (even if not stored) | Full sovereignty within your perimeter |
| **Certificate Key Control** | Vendor may hold/manage keys on your behalf | You maintain HSM control of all keys |

### 4.2 Strategic Recommendation for Large/Regulated RPs

Due to **DORA** (for financial entities) and **Data Sovereignty** requirements, large or heavily regulated organizations should consider the **Self-Hosted Connector** model:

- **Buy the software/connector** (e.g., Lissi Connector)
- **Run it within your own secure perimeter**
- Maintain full control of cryptographic keys and audit logs

This approach:
- Minimizes DORA third-party ICT risk exposure
- Eliminates the need for Data Processing Agreements
- Provides full auditability of the "no-storage" mandate
- Maintains data sovereignty

### 4.3 Key Legal Provisions Affecting Deployment Choice

1. **GDPR Article 28** — If vendor processes personal data on your behalf (even transiently), they are a Data Processor
2. **DORA Articles 28-30** — Third-party ICT risk management requirements for financial entities
3. **Article 5b(10)** — The "no-storage" mandate applies to whoever acts as the intermediary

---

## 5. RCA Tool Implementation Decision

### 5.1 Options Evaluated

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| **A: New Role** | Create `intermediary.yaml` as an 8th role | Precise mapping; clearer for vendors | Redundancy with RP requirements; violates legal deeming |
| **B: Role Profile** | Add profiles under `relying-party` role | Preserves legal deeming; minimal duplication | Requires profile-aware filtering |
| **C: Infrastructure Mapping** | Classify as specialized TSP/Infrastructure | Reflects operational reality | Violates Article 5b(10) wording |

### 5.2 Decision: Option B — Role Profiles

**Rationale:**
1. **Legally Sound:** Article 5b(10) explicitly states intermediaries "shall be deemed to be relying parties"
2. **Minimal Redundancy:** All 91+ existing RP requirements apply; only adds profile-specific requirements
3. **Operational Clarity:** Organizations can select profiles based on their specific operational model
4. **Existing Pattern:** The RCA tool already uses profiles (public_sector, private_sector)

### 5.3 Profiles Implemented

Two new profiles added to the Relying Party role:

| Profile ID | Name | Description | For Organizations That... |
|------------|------|-------------|---------------------------|
| `uses_intermediary` | Uses Intermediary Service | Delegates wallet interaction to a third-party intermediary | Use SaaS or external connector services |
| `acts_as_intermediary` | Acts as Intermediary | Provides intermediary services to other relying parties | Want to become an intermediary for other RPs |

---

## 6. Requirements by Profile

### 6.1 Profile: `uses_intermediary`

For RPs that delegate wallet interaction to a third-party intermediary:

| ID | Category | Requirement | Legal Source |
|----|----------|-------------|--------------|
| RP-REG-014 | registration | Indicate reliance on intermediary in national register | 2025/848 Annex I(14) |
| RP-REG-015 | registration | Provide formal association to specific intermediary | 2025/848 Annex I(15) |
| RP-GOV-009 | governance | Verify intermediary's registered and certified status | 2025/848 Art. 5 |
| RP-PRV-011 | privacy | Establish Data Processing Agreement with intermediary | GDPR Art. 28 |
| RP-SEC-004 | security | Monitor and act on intermediary breach notifications | 2025/847 Art. 5 |

### 6.2 Profile: `acts_as_intermediary`

For organizations providing intermediary services to other RPs:

| ID | Category | Requirement | Legal Source |
|----|----------|-------------|--------------|
| RP-GOV-001 | governance | Do not store transaction content data (No-Storage Mandate) | 910/2014 Art. 5b(10) |
| RP-REG-016 | registration | Register as RP with appropriate entitlement for intermediary services | 2025/848 Annex I(12) |
| RP-TEC-019 | technical | Obtain and manage Wallet-Relying Party Access Certificates | 2025/848 Art. 7 + Annex IV |
| RP-TEC-020 | technical | Orchestrate Registration Certificates for downstream RPs | 2025/848 Art. 8 + Annex V |
| RP-TRN-001 | transparency | Present both intermediary and end-RP identity to wallet users | 2025/848 Annex V(3)(j) |
| RP-SEC-005 | security | Implement stateless transaction processing architecture | Best Practice (Art. 5b(10)) |
| RP-GOV-010 | governance | Maintain audit trail demonstrating data non-storage | Best Practice |
| RP-TEC-021 | technical | Support multi-wallet interoperability (informative) | 2024/2982 Art. 5 |

---

## 7. Potential Candidates for Becoming Intermediaries

From industry research (Lissi), organizations well-positioned to become intermediaries include:

| Entity Type | Why Well-Positioned |
|-------------|---------------------|
| **Qualified Trust Service Providers (QTSPs)** | Already operate trust infrastructure; familiar with PKI and certification |
| **Identity Verification (IDV) Platforms** | Existing customer onboarding flows; KYC expertise |
| **Payment Providers & Hubs** | High transaction volumes; established relationships |
| **Public Sector Service Providers** | National-level trust; strategic positioning |
| **Telecommunications Providers** | Identity infrastructure (SIM-based); large customer bases |

---

## 8. Vendor Evaluation Considerations

When evaluating third-party intermediary vendors (for future checklist development):

### 8.1 Regulatory Compliance Questions
- How do they demonstrate "no-storage" mandate compliance?
- What audit/SOC2 reports are available?
- What does their Data Processing Agreement cover?
- How do they handle DORA third-party risk reporting?

### 8.2 Technical Capability Questions
- How many national wallets have they tested against?
- Which standards do they support (OpenID4VP, SD-JWT, ISO 18013-5/7)?
- How do they handle semantic normalization across wallets?
- What is their certificate lifecycle management approach?

### 8.3 Deployment Model Questions
- Do they offer self-hosted/on-premise deployment?
- Who controls cryptographic keys?
- What is their interoperability guarantee?
- How do they handle trust list updates?

---

## 9. References

### 9.1 Legal Sources
- Regulation (EU) No 910/2014 (eIDAS) — Consolidated version
- Regulation (EU) 2024/1183 — eIDAS 2.0 Amendment
- Implementing Regulation (EU) 2025/848 — Registration of Wallet-Relying Parties
- Implementing Regulation (EU) 2025/847 — Security Breach Response
- Implementing Regulation (EU) 2025/1569 — EAA/QEAA Issuance and Verification
- Implementing Regulation (EU) 2024/2982 — Wallet Protocols and Interfaces
- Implementing Regulation (EU) 2024/2979 — Wallet Integrity and Core Functionality

### 9.2 Industry Sources
- Lissi Blog: "The EUDI Wallet Intermediary: A Guide to the eIDAS 2.0 Ecosystem's Most Critical Role"
- Lissi Blog: "The EUDI Wallet Interoperability Challenge: Why One Standard Isn't the Whole Story"
- Architecture and Reference Framework (ARF) v1.5

---

## 10. Implementation Summary

**Action Taken:** Added two profiles (`uses_intermediary`, `acts_as_intermediary`) to the Relying Party role with profile-specific requirements.

**Files Modified:**
- `config/rca/roles.yaml` — Added new profiles
- `config/rca/requirements/relying-party.yaml` — Added profile-specific requirements

**Validation:** Run `npm run validate:rca && npm run build:rca` to verify.

---

*Document created: January 21, 2026*  
*Analysis conducted as part of eIDAS 2.0 Documentation Portal development*
