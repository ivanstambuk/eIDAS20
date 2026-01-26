# VCQ Legal Primacy Audit

**Created:** 2026-01-26
**Updated:** 2026-01-26
**Decision:** DEC-256 (Filter Source Separation)
**Purpose:** Map all VCQ requirements to primary legislative sources
**Status:** ✅ COMPLETED

## 1. Executive Summary

The VCQ tool has **55 requirements** across 3 YAML files:
- `core.yaml`: 18 requirements (shared across all intermediary types)
- `intermediary.yaml`: 25 requirements (unified RP Intermediary role per DEC-254)
- `ict.yaml`: 12 requirements (DORA ICT third-party scope)
- Plus any PIF/VIF legacy files

**Problem:** Many requirements cite ARF HLRs but lack legislative backing (`legalBasis` field).

**Goal:** Every requirement should have a `legalBasis` pointing to actual legislation. ARF references are supplementary technical specifications only.

---

## 2. Legislative Hierarchy

### Primary Law (Regulation)
| ID | Name | Key Articles |
|----|------|--------------|
| **2024/1183** | eIDAS 2.0 Amending Regulation | Art. 5b (Relying Parties, Intermediaries) |
| **2014/910** | eIDAS Consolidated (as amended) | Art. 5b(10) - No-storage mandate |
| **2016/679** | GDPR | Art. 28 (Data Processing), Art. 32 (Security) |
| **2022/2554** | DORA | Art. 28-30 (ICT Third-Party) |

### Implementing Acts
| ID | Name | Key Provisions |
|----|------|----------------|
| **2025/848** | Wallet-Relying Party Registration | Annex I (14, 15) - Intermediary-specific |
| **2024/2982** | Protocols & Interfaces | Art. 5 - Presentation protocols |
| **2024/2979** | Integrity & Core Functions | Art. 3, 8 - Credential formats |

### Technical Specifications (Supplementary)
| Source | Role |
|--------|------|
| ARF Topic 52 | RPI_* HLRs - Technical requirements for intermediaries |
| ARF Topic 1 | OIA_* HLRs - Online identification |
| ARF Topic 6 | RPA_* HLRs - RP authentication |
| ARF Topic 7 | VCR_* HLRs - Revocation checking |

---

## 3. Article 5b(10) - The Core Intermediary Mandate

**Full text (from 2024/1183, Art 5b(10)):**
> "Intermediaries acting on behalf of relying parties shall be deemed to be relying parties and shall not store data about the content of the transaction."

**This single sentence establishes:**
1. Intermediaries ARE relying parties (legal status)
2. No-storage mandate (central privacy protection)
3. Applicability of ALL RP obligations to intermediaries

**Implications:**
- ALL requirements for RPs automatically apply to intermediaries
- Article 5b(1-9) registration requirements apply
- Article 5b(10) adds the specific storage prohibition

---

## 4. Registration Obligations - Implementing Act 2025/848

**Annex I, Points 14-15:**
> 14. Where applicable, an indication that the wallet-relying party relies upon an intermediary acting on behalf of the relying party who intends to rely upon the wallet.
> 15. Where applicable, an association to the intermediary that the wallet-relying party is relying upon that is acting on behalf of the relying party who intends to rely upon the wallet.

This implementing act establishes:
- Intermediaries must register in national registers
- Registration must indicate intermediary status
- Association between intermediary and intermediated RPs must be recorded

---

## 5. ARF → Legislation Mapping

### Topic 52 (Relying Party Intermediaries)

| ARF HLR | Specification (summary) | Primary Legal Basis |
|---------|------------------------|---------------------|
| **RPI_01** | Register as RP, indicate intermediary intent | **2014/910 Art. 5b(1-2)** via 2025/848 Annex I |
| **RPI_02** | Empty | N/A |
| **RPI_03** | Register each intermediated RP | **2025/848 Art. 5-6**, Annex I(14-15) |
| **RPI_04** | Provide legal evidence of RP relationship | **2025/848 Art. 6(3)(b)** |
| **RPI_05** | Include RP details in requests | **2025/848 Annex I(9)** |
| **RPI_06** | Request only registered attributes | **2014/910 Art. 5b(3)** (data minimization) |
| **RPI_07** | Display both intermediary and RP identity | **2014/910 Art. 5b(8)** (RP identification to user) |
| **RPI_07a** | Wallet verify contractual relationship | **2025/848 Art. 8** (registration certs) |
| **RPI_07b** | Empty | N/A |
| **RPI_08** | Forward only to specified RP | **2014/910 Art. 5b(10)** + **2016/679 Art. 28(3)(a)** |
| **RPI_09** | Perform agreed verifications | **2014/910 Art. 5b(9)** (RP responsibility) |
| **RPI_10** | Delete data after forwarding | **2014/910 Art. 5b(10)** (no-storage mandate) |

### Topic 1 (Online Identification & Authentication)

| ARF HLR | Specification (summary) | Primary Legal Basis |
|---------|------------------------|---------------------|
| **OIA_12** | Maintain Trusted Lists for PID Providers | **2014/910 Art. 22** (Trusted Lists) |
| **OIA_13** | Maintain Trusted Lists for Attestation Providers | **2014/910 Art. 22** |
| **OIA_14** | Obtain trust anchors from official sources | **2014/910 Art. 32** (Trust Services) |

### Topic 6 (Relying Party Authentication)

| ARF HLR | Specification (summary) | Primary Legal Basis |
|---------|------------------------|---------------------|
| **RPA_05** | Validate attestation signatures | **2024/2979 Art. 8** (credential verification) |
| **RPA_07** | Verify device binding | **2024/2979 Art. 3** (integrity) |
| **RPA_08** | Verify presentation freshness | **2024/2979** (anti-replay) |

### Topic 7 (Revocation Checking)

| ARF HLR | Specification (summary) | Primary Legal Basis |
|---------|------------------------|---------------------|
| **VCR_13** | Check attestation revocation status | **2024/2979** |

---

## 6. Requirements Update Plan

### Phase 1: Add Missing legalBasis to ARF-Only Requirements

#### core.yaml Updates

| Req ID | Current ARF | Add legalBasis |
|--------|-------------|----------------|
| VEND-CORE-011 | RPI_07 | `regulation: "2014/910", article: "Article 5b", paragraph: "8"` |
| VEND-CORE-015 | RPI_01 | `regulation: "2014/910", article: "Article 5b", paragraph: "1"` |
| VEND-CORE-016 | RPI_03 | `regulation: "2025/848", article: "Article 5-6"` |
| VEND-CORE-017 | RPI_04 | `regulation: "2025/848", article: "Article 6", paragraph: "3(b)"` |
| VEND-CORE-018 | RPI_09 | `regulation: "2014/910", article: "Article 5b", paragraph: "9"` |

#### intermediary.yaml Updates

| Req ID | Current ARF | Add legalBasis |
|--------|-------------|----------------|
| VEND-INT-001 | RPI_07 | `regulation: "2014/910", article: "Article 5b", paragraph: "8"` |
| VEND-INT-002 | RPI_06 | `regulation: "2014/910", article: "Article 5b", paragraph: "3"` |
| VEND-INT-003 | RPI_06 | `regulation: "2014/910", article: "Article 5b", paragraph: "3"` |
| VEND-INT-004 | RPI_08 | `regulation: "2014/910", article: "Article 5b", paragraph: "10"` |
| VEND-INT-006 | RPI_08 | `regulation: "2014/910", article: "Article 5b", paragraph: "10"` |
| VEND-INT-007 | OIA_12 | `regulation: "2014/910", article: "Article 22"` |
| VEND-INT-008 | OIA_13 | `regulation: "2014/910", article: "Article 22"` |
| VEND-INT-010 | RPA_05 | `regulation: "2024/2979", article: "Article 8"` |
| VEND-INT-011 | VCR_13 | `regulation: "2024/2979"` |
| VEND-INT-012 | RPA_07 | `regulation: "2024/2979", article: "Article 3"` |
| VEND-INT-013 | RPA_08 | `regulation: "2024/2979"` |
| VEND-INT-014 | RPI_08 | `regulation: "2014/910", article: "Article 5b", paragraph: "10"` |
| VEND-INT-015 | RPI_09 | `regulation: "2014/910", article: "Article 5b", paragraph: "9"` |
| VEND-INT-017 | RPI_08 | `regulation: "2014/910", article: "Article 5b", paragraph: "10"` |
| VEND-INT-022 | RPI_05 | `regulation: "2025/848", article: "Annex I(9)"` |

### Phase 2: Validation Script Enhancement

Add warnings for:
- Requirements with `arfReference` but no `legalBasis` → **WARNING**
- Requirements with neither `arfReference` nor `legalBasis` → **ERROR**

### Phase 3: UI Enhancement

In the VCQ tool, ensure the legal basis is displayed prominently with links to EUR-Lex, while ARF references are shown as "Technical Specification" with links to GitHub.

---

## 7. Coverage Analysis

### Before Audit

| File | Total Reqs | Has legalBasis | Has arfReference | Has Both | ARF-Only Gap |
|------|------------|----------------|------------------|----------|--------------|
| core.yaml | 18 | 14 | 8 | 4 | 4 |
| intermediary.yaml | 25 | 13 | 19 | 7 | 12 |
| ict.yaml | 12 | 12 | 0 | 0 | 0 |
| **Total** | **55** | **39 (71%)** | **27 (49%)** | **11 (20%)** | **16 (29%)** |

### After Audit ✅

| File | Total Reqs | Has legalBasis | Has arfReference | Has Both |
|------|------------|----------------|------------------|----------|
| core.yaml | 18 | **18** | 8 | **8** |
| intermediary.yaml | 25 | **25** | 19 | **19** |
| ict.yaml | 12 | 12 | 0 | 0 |
| **Total** | **55** | **55 (100%)** | **24 (44%)** | **24 (44%)** |

**Result:** All 55 requirements now have `legalBasis`. Gap closed.

---

## 8. Implementation Checklist

- [x] Update core.yaml with missing legalBasis fields ✅
- [x] Update intermediary.yaml with missing legalBasis fields ✅
- [x] Run full validation ✅
- [x] Existing VCQ UI already supports filter behavior ✅ (no changes needed)
- [x] Update VCQ_TOOL_PLAN.md with this work ✅

---

## 9. Key Takeaways

1. **eIDAS Art. 5b(10)** is the master provision — intermediaries are RPs + no-storage
2. **2025/848** is the implementing act for registration — explicitly mentions intermediaries
3. **ARF is NOT law** — it's technical specification derived from law
4. **Every requirement needs legislation** — ARF supplements but doesn't substitute
5. **Gap closed** — 100% of requirements now have legislative backing

---

## 10. Filter Behavior (Design Decision)

### Source Separation Principle

The VCQ tool maintains **two orthogonal source hierarchies** that don't blend:

| Source Hierarchy | Content Sources | Display Content |
|------------------|-----------------|-----------------|
| **Legal** | Regulation (2014/910, 2024/1183) + Implementing Acts | Legal text, Article/Paragraph citations |
| **Architecture** | ARF HLRs, ISO standards, W3C specs, ETSI | Technical specification text |

When a filter is active:
- **Legal filter ON**: Show legal content ONLY (no ARF text, even if requirement has ARF ref)
- **Architecture filter ON**: Show technical spec content ONLY (no legal text, even if requirement has legalBasis)

### Filter Logic: Additive (Union)

Filters are **additive** — both active means union, not intersection:

| Legal | Arch | Result |
|-------|------|--------|
| OFF | OFF | Show nothing (or show all — UX decision) |
| ON | OFF | Show requirements WITH `legalBasis` → display legal content |
| OFF | ON | Show requirements WITH `arfReference` → display technical content |
| **ON** | **ON** | **UNION**: Show all requirements with either source |

When both filters are ON:
- Requirements with `legalBasis` only → display legal content
- Requirements with `arfReference` only → display technical content  
- Requirements with **both** → display BOTH content sections (or primary source — UX decision)

### No Semantic Dependency

The Architecture sources are **independent** of Legal sources:
- ARF specifications exist in their own right as technical guidance
- They don't "derive from" or "depend on" legal provisions in the UI
- Even if the underlying compliance topic is the same, the source and display are separate

This enables users to explore compliance from either:
1. **Legal dimension**: "What does the law require?"
2. **Technical dimension**: "What do the technical specifications say?"

---

*Document created 2026-01-26 for VCQ Legal Primacy Audit.*
*Completed 2026-01-26 — All 55 requirements now have legislative backing.*

