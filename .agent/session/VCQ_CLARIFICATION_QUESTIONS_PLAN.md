# Implementation Plan: Vendor Clarification Questions (VCQ-CQ)

> **Created**: 2026-01-30  
> **Status**: ✅ Opus Pass Complete  
> **Objective**: Add detailed clarification questions to all VCQ requirements to enable rigorous vendor assessment

---

## Executive Summary

### Problem Statement
Vendors typically claim compliance with EUDI Wallet requirements but don't describe **how** or **to what extent** they support each requirement. This makes it difficult to:
1. Compare vendors objectively
2. Identify gaps in vendor capabilities  
3. Score vendor maturity for procurement decisions

### Solution
Add a **Vendor Clarification Questions** layer to the VCQ that breaks down each requirement into detailed sub-questions probing:
- Technical implementation specifics
- Lifecycle coverage (create/update/delete/renew)
- Automation levels
- Geographic scope (multi-Member-State)
- Auditability and compliance evidence
- Security controls
- Operational capabilities

### Delivery
- **Two-model sequential pass**: Opus (✅ complete), then Gemini Pro (review/extend)
- **Output**: New YAML files in `config/vcq/clarification-questions/`
- **Scope**: All 136 VCQ requirements across 5 files

---

## Progress Summary

| Phase | File | Requirements | Questions | Status |
|-------|------|--------------|-----------|--------|
| 1 | core.yaml | 35 | ~220 | ✅ Complete |
| 2 | issuer.yaml | 36 | ~210 | ✅ Complete |
| 3 | intermediary.yaml | 33 | ~170 | ✅ Complete |
| 4 | ict.yaml | 12 | ~65 | ✅ Complete |
| 5 | trust_services.yaml | 19 | ~95 | ✅ Complete |
| **Total** | **5 files** | **135** | **~760** | **✅ Opus Complete** |

---

## File Structure

```
docs-portal/config/vcq/clarification-questions/
├── core.yaml           # VEND-CORE-* (35 requirements) ✅ 1,011 lines
├── issuer.yaml         # VEND-ISS-* (36 requirements) ✅ 921 lines
├── intermediary.yaml   # VEND-INT-* (33 requirements) ✅ 702 lines
├── ict.yaml            # VEND-ICT-* (12 requirements) ✅ 303 lines
└── trust_services.yaml # VEND-TSP-* (19 requirements) ✅ 434 lines
                        # TOTAL: 3,371 lines
```

### YAML Schema

```yaml
schemaVersion: 1
sourceFile: requirements/core.yaml
modelPasses:
  opus: true       # Set to true after Opus pass complete
  gemini: false    # Set to true after Gemini pass complete

requirements:
  VEND-CORE-001:
    questions:
      - id: Q1
        text: "How does your platform..."
        dimension: technical_implementation  # Optional
      - id: Q2
        text: "Do you provide..."
        dimension: capability
```

### Question Dimension Taxonomy

Dimensions are derived dynamically per requirement. Common dimensions include:

| Dimension | Description |
|-----------|-------------|
| `capability` | Does the product offer this feature? |
| `lifecycle` | Full lifecycle support (create/update/delete/renew) |
| `geographic_scope` | Multi-Member-State coverage |
| `automation` | Manual vs. automated processes |
| `auditability` | Logging, traceability, audit reports |
| `security` | Protection mechanisms, key management |
| `compliance_evidence` | Certifications (SOC 2, ISO 27001) |
| `compliance_completeness` | Coverage of all regulatory sub-requirements |
| `technical_implementation` | How the feature works technically |
| `data_handling` | Data processing, retention, deletion |
| `supply_chain` | Sub-processor compliance |
| `operational` | Day-to-day processes, support |
| `sla` | Service level commitments |
| `interoperability` | Integration with ecosystem (ACAs, Trusted Lists) |
| `incident_response` | Emergency handling procedures |
| `flexibility` | Configuration options, customization |
| `contract_terms` | Contractual provisions and limitations |
| `commercial` | Pricing, cost structures |
| `regulatory_access` | Supervisory authority audit support |
| `limitations` | Scope restrictions, exclusions |
| `privacy` | Privacy-preserving controls |
| `user_experience` | UX considerations |
| `alerting` | Notification and alerting |
| `architecture` | System design principles |
| `documentation` | Documentation quality and availability |
| `experience` | Vendor track record |
| `roadmap` | Future capabilities |
| `compliance_history` | Past compliance issues |
| `regulatory_status` | Current regulatory standing |

---

## Phase Breakdown

### Phase 1: Core Requirements (core.yaml) ✅ COMPLETE
**Requirements**: 35 requirements processed (VEND-CORE-001 to 042, gaps: 015, 036, 037)  
**File**: `clarification-questions/core.yaml`  
**Questions generated**: ~220 questions

| Task | Requirement Range | Status |
|------|-------------------|--------|
| 1.1 | VEND-CORE-001 to VEND-CORE-005 | ✅ Complete |
| 1.2 | VEND-CORE-006 to VEND-CORE-010 | ✅ Complete |
| 1.3 | VEND-CORE-011 to VEND-CORE-017 | ✅ Complete |
| 1.4 | VEND-CORE-018 to VEND-CORE-028 | ✅ Complete |
| 1.5 | VEND-CORE-029 to VEND-CORE-042 | ✅ Complete |
| 1.6 | Set `opus: true` in modelPasses | ✅ Complete |

### Phase 2: Issuer Requirements (issuer.yaml) ✅ COMPLETE
**Requirements**: VEND-ISS-001 to VEND-ISS-040 (36 total, gap: 025)  
**File**: `clarification-questions/issuer.yaml`  
**Questions generated**: ~210 questions

| Task | Requirement Range | Status |
|------|-------------------|--------|
| 2.1 | VEND-ISS-001 to VEND-ISS-040 (all) | ✅ Complete |
| 2.2 | Set `opus: true` in modelPasses | ✅ Complete |

### Phase 3: Intermediary Requirements (intermediary.yaml) ✅ COMPLETE
**Requirements**: VEND-INT-001 to VEND-INT-034 (33 total, gap: 015)  
**File**: `clarification-questions/intermediary.yaml`  
**Questions generated**: ~170 questions

| Task | Requirement Range | Status |
|------|-------------------|--------|
| 3.1 | VEND-INT-001 to VEND-INT-034 (all) | ✅ Complete |
| 3.2 | Set `opus: true` in modelPasses | ✅ Complete |

### Phase 4: ICT/DORA Requirements (ict.yaml) ✅ COMPLETE
**Requirements**: VEND-ICT-001 to VEND-ICT-012 (12 total)  
**File**: `clarification-questions/ict.yaml`  
**Questions generated**: ~65 questions

| Task | Requirement Range | Status |
|------|-------------------|--------|
| 4.1 | VEND-ICT-001 to VEND-ICT-012 (all) | ✅ Complete |
| 4.2 | Set `opus: true` in modelPasses | ✅ Complete |

### Phase 5: Trust Services Requirements (trust_services.yaml) ✅ COMPLETE
**Requirements**: VEND-TSP-001 to VEND-TSP-019 (19 total)  
**File**: `clarification-questions/trust_services.yaml`  
**Questions generated**: ~95 questions

| Task | Requirement Range | Status |
|------|-------------------|--------|
| 5.1 | VEND-TSP-001 to VEND-TSP-019 (all) | ✅ Complete |
| 5.2 | Set `opus: true` in modelPasses | ✅ Complete |

### Phase 5.5: Market Research Enhancement (MIQE) ✅ COMPLETE
**Purpose**: Enhance questions based on market research into existing vendor capabilities  
**Approach**: Review each requirement against industry patterns, add/modify/delete questions  
**Scope**: All files, batches of ~5 requirements

#### Research Sources Applied
- SD-JWT/VC vendor capabilities (Ping Identity, Microsoft Entra, Gataca, SpruceID)
- Wallet connector patterns (OIDC4VP, SIOPv2, multi-wallet support)
- ISO 18013-5 mDL reader interoperability
- HSM/key management vendor questionnaires (FIPS, BYOK, quorum approval)
- Digital identity RFP criteria
- Batch credential issuance patterns
- EUDI ARF 1.4 authentic source requirements

#### Enhancement Principles
| DO | DON'T |
|----|-------|
| Capability existence ("Do you support...?") | Implementation details ("Which library...?") |
| High-level architecture ("Sync or async?") | Vendor-specific names |
| Interoperability ("Which wallets tested?") | Fine-grained metrics (TPS per algorithm) |
| Key custody options (BYOK) | UX analytics (we own UX) |
| Approval workflows (four-eye principle) | Anti-spoofing (built into protocols) |
| Future-proofing (PQC roadmap) | Internal queue/database choices |

#### Progress Tracker

| Sub-Phase | File | Requirements | Status |
|-----------|------|--------------|--------|
| 5.5.1 | issuer.yaml | VEND-ISS-001 to 010 | ✅ Complete |
| 5.5.2 | issuer.yaml | VEND-ISS-011 to 020 | ✅ Complete |
| 5.5.3 | issuer.yaml | VEND-ISS-021 to 030 | ✅ Complete (no changes needed) |
| 5.5.4 | issuer.yaml | VEND-ISS-031 to 040 | ✅ Complete (no changes needed) |
| 5.5.5 | core.yaml | VEND-CORE-001 to 010 | ✅ Complete (no changes needed) |
| 5.5.6 | core.yaml | VEND-CORE-011 to 020 | ✅ Complete |
| 5.5.7 | core.yaml | VEND-CORE-021 to 042 | ✅ Complete |
| 5.5.8 | intermediary.yaml | VEND-INT-001 to 017 | ✅ Complete |
| 5.5.9 | intermediary.yaml | VEND-INT-018 to 034 | ✅ Complete (no changes needed) |
| 5.5.10 | ict.yaml | VEND-ICT-001 to 012 | ✅ Complete |
| 5.5.11 | trust_services.yaml | VEND-TSP-001 to 019 | ✅ Complete |

#### Key Enhancements Applied

| Category | Theme | Examples |
|----------|-------|----------|
| **Interoperability** | Wallet testing | "Which wallet implementations have you tested compatibility with (EUDI reference, Apple, Google, third-party)?" |
| **Interoperability** | Plugfest participation | "Have you participated in EUDI Wallet plugfest or interoperability testing events?" |
| **Security** | BYOK support | "Do you support Bring Your Own Key (BYOK) for organizations that want to manage their own signing keys?" |
| **Security** | Quorum approval | "Do you require multi-person approval (quorum/four-eye principle) for sensitive key operations?" |
| **Roadmap** | PQC readiness | "Is Post-Quantum Cryptography (PQC) on your roadmap? Which algorithms are you evaluating?" |
| **Capability** | Batch processing | "Is batch issuance processed synchronously or asynchronously?" |
| **Capability** | Bulk upload | "Do you offer a bulk upload interface (CSV, JSON) for high-volume batch issuance?" |
| **Capability** | ZKP support | "Do you support Zero-Knowledge Proof (ZKP) verification for privacy-preserving claims?" |
| **Operational** | SIEM integration | "Do you support integration with the organization's SIEM or security monitoring tools?" |
| **Protocol** | SIOPv2 | "Do you support SIOPv2 (Self-Issued OpenID Provider) as an alternative presentation protocol?" |
| **Authentication** | FIDO2/WebAuthn | "Do you support FIDO2/WebAuthn for authentication during identity verification flows?" |


### Phase 6: Gemini Pro Review Pass ✅ COMPLETE
**Scope**: All files  
**Purpose**: Review and extend Opus questions with additional insights

| Task | File | Status |
|------|------|--------|
| 6.1 | Review & extend core.yaml | ✅ Complete |
| 6.2 | Review & extend issuer.yaml | ✅ Complete |
| 6.3 | Review & extend intermediary.yaml | ✅ Complete |
| 6.4 | Review & extend ict.yaml | ✅ Complete |
| 6.5 | Review & extend trust_services.yaml | ✅ Complete |
| 6.6 | Set `gemini: true` in all modelPasses | ✅ Complete |
| 6.7 | 🔒 COMMIT: "feat(vcq): complete Gemini review pass on clarification questions" | ✅ Complete |

### Phase 7: UI Integration ✅ PARTIAL COMPLETE
**Purpose**: Integrate clarification questions into portal UI and exports

| Task | Description | Status |
|------|-------------|--------|
| 7.0 | Build script to compile YAML to JSON (`build-vcq-clarifications.js`) | ✅ Complete |
| 7.1 | Add `useClarificationQuestions` data loader hook | ✅ Complete |
| 7.2 | Create side-by-side "Clarification Questions" toggle (Option A design) | ✅ Complete |
| 7.3 | Add CSS styling for question list with dimension badges | ✅ Complete |
| 7.4 | Add clarification questions to Excel and Markdown exports | ✅ Complete |
| 7.5 | Add scoring input fields for each question | ⬜ Future |
| 7.6 | Create vendor comparison matrix | ⬜ Future |

---

## Naming Conventions

### Question IDs
- Format: `Q1`, `Q2`, etc. (sequential within each requirement)
- No global unique ID required (requirement context provides uniqueness)

### Dimension Naming
- Use `snake_case` for all dimensions
- Prefer existing dimensions from taxonomy before creating new ones
- Document any new dimensions added

---

## Design Principles

1. **Probe Implementation Depth**: Questions should elicit *how* a vendor implements something, not just *whether* they do
2. **Enable Scoring**: Questions should have objectively assessable answers (yes/no, degree, quantity)
3. **Cover Full Lifecycle**: For operational features, probe create/read/update/delete/renew
4. **Geographic Awareness**: Probe multi-Member-State support where relevant
5. **Compliance Evidence**: Ask for certifications, audit reports, and test results
6. **Avoid Redundancy**: Don't repeat questions covered by parent requirement's explanation
7. **Open-Ended Where Appropriate**: Some questions benefit from free-text answers for vendor differentiation

---

## Key Files

| Path | Purpose |
|------|---------|
| `config/vcq/requirements/*.yaml` | Source requirements (input) |
| `config/vcq/clarification-questions/*.yaml` | Generated questions (output) |
| `.agent/session/VCQ_CLARIFICATION_QUESTIONS_PLAN.md` | This plan |

---

## Handover Notes

### Completed (Opus Pass - 2026-01-30)
- ✅ All 135 requirements processed across 5 files
- ✅ ~760 clarification questions generated
- ✅ All files have `opus: true` in modelPasses
- ✅ Consistent schema and dimension taxonomy applied
- ✅ Full lifecycle, security, operational, and compliance dimensions covered

### Next Steps
1. **Commit all changes**: Single commit for all 5 clarification question files
2. **Phase 6**: Gemini Pro review pass to extend/refine questions
3. **Phase 7**: UI integration (deferred, not in immediate scope)

### Notable Gaps in Source Requirements
- VEND-CORE-015, 036, 037 do not exist in source
- VEND-ISS-025 does not exist in source
- VEND-INT-015 does not exist in source
