# VCQ Intermediary Type Consolidation

**Date:** 2026-01-26  
**Decision:** DEC-254  
**Status:** Implementing  
**Author:** Ivan + AI Assistant (Antigravity)

---

## Executive Summary

This document provides the comprehensive rationale for **collapsing the VCQ tool's PIF (Presentation Intermediary Function) and VIF (Verification Intermediary Function) into a single "RP Intermediary" category**.

**Key Finding:** The PIF/VIF distinction was an **internal invention** not anchored in any official eIDAS 2.0, ARF, or implementing act terminology. The official regulatory framework recognizes only:

1. **"RP Intermediary"** (Art. 5b(10)) — Acting on behalf of RPs to interact with wallets
2. **"Designated Intermediary"** (2025/1569 Art. 9) — National-level gateway for QTSPs to verify attributes against authentic sources during issuance

These are **completely different concepts** serving different actors in different workflows.

---

## 1. Problem Statement

### 1.1 Original VCQ Design (DEC-222)

The VCQ tool was designed with two intermediary types:

| Type | Abbreviation | Requirements | Purpose |
|------|--------------|--------------|---------|
| Presentation Intermediary | PIF | 12 | Receive and forward wallet presentations |
| Verification Intermediary | VIF | 13 | Perform cryptographic verification |

The idea was that a vendor might offer:
- **Forwarding-only** products (PIF) — Relay presentations without parsing
- **Full verification** products (VIF) — Validate signatures, check revocation, etc.

### 1.2 The Problem

Upon deeper analysis, we discovered:

1. **PIF/VIF are not official terms** — Neither the eIDAS regulation, ARF, nor any implementing act uses these terms
2. **The ARF Topic 52 treats verification as part of the RP Intermediary role** — RPI_09 explicitly requires intermediaries to "verify the authenticity of the PID or attestation, its revocation status, device binding, and User binding"
3. **Our "VIF" conflicted with official terminology** — 2025/1569 Article 9 defines "designated intermediary" but it refers to **issuance-time verification against authentic sources**, not RP-side wallet presentation verification
4. **The split was artificial** — There's no regulatory basis for distinguishing "forwarding-only" from "verification" intermediaries

---

## 2. Regulatory Analysis

### 2.1 Article 5b(10) — The RP Intermediary

> "Intermediaries acting on behalf of relying parties shall be **deemed to be relying parties** and shall **not store data about the content of the transaction**."

This is the **sole legal basis** for wallet presentation intermediaries. It establishes:
- Legal equivalence to Relying Parties
- The no-storage mandate
- No distinction between "presentation" and "verification" functions

### 2.2 ARF Topic 52 — Relying Party Intermediaries

The official ARF HLRs (RPI_01 through RPI_10) define intermediary requirements:

| HLR | Requirement | Function |
|-----|-------------|----------|
| RPI_01 | Register as a Relying Party | Registration |
| RPI_03 | Register each intermediated RP | Registration |
| RPI_04 | Provide legal evidence of relationship | Governance |
| RPI_05 | Specify RP details in requests | Transparency |
| RPI_06 | Include certificates in requests | Technical |
| RPI_07 | Display both identities to user | Transparency |
| RPI_08 | Forward attributes only to requesting RP | Technical |
| **RPI_09** | **Verify authenticity, revocation, device binding** | **VERIFICATION** |
| RPI_10 | Delete data immediately after forwarding | Privacy |

**Critical observation:** RPI_09 explicitly includes verification as part of the RP Intermediary role. There is no separate "verification intermediary" in the ARF.

### 2.3 2025/1569 Article 9 — The OTHER "Intermediary"

Article 9 of Implementing Regulation 2025/1569 introduces "designated intermediaries":

> "The verification mechanism shall provide an access point where qualified trust service providers issuing qualified electronic attestations of attributes can electronically request the verification against authentic sources or **designated intermediaries recognised at national level**..."

This is a **completely different concept**:

| Aspect | RP Intermediary (Art. 5b(10)) | Designated Intermediary (2025/1569 Art. 9) |
|--------|-------------------------------|-------------------------------------------|
| **Purpose** | Interact with wallets on behalf of RPs | Verify attributes against authentic sources |
| **Who uses it** | Relying Parties | QTSPs (issuers) |
| **When** | At presentation time (consumption) | At issuance time |
| **Who provides it** | Commercial vendors | Government/national infrastructure |
| **Legal basis** | Art. 5b(10) | Art. 45e(1) |

**Our VCQ's "VIF" was not the same as 2025/1569's "designated intermediary".**

---

## 3. Web Research Confirmation

### 3.1 Search Results

Web searches for "Presentation Intermediary" and "Verification Intermediary" in the EUDIW context confirmed:

> "The terms 'Presentation Intermediary' and 'Verification Intermediary' are **not formally defined as distinct roles**. Instead, the ARF defines a general role called an 'Intermediary'"

> "Specific acronyms 'PIF' and 'VIF' are **not explicitly defined or commonly used** in the main public documentation and Architecture and Reference Framework (ARF)"

### 3.2 Official Sources

| Source | Terminology Used |
|--------|------------------|
| eIDAS Regulation Art. 5b(10) | "Intermediaries acting on behalf of relying parties" |
| ARF Topic 52 | "Relying Party intermediaries" |
| 2025/1569 Art. 9 | "designated intermediaries" (different concept) |
| Lissi Blog | "Intermediary" (generic) |
| eudi.dev | "Intermediary" (generic) |

No official source uses PIF, VIF, "Presentation Intermediary Function", or "Verification Intermediary Function".

---

## 4. Impact on VCQ Tool

### 4.1 Current State

| File | Requirements | Description |
|------|--------------|-------------|
| `pif.yaml` | 12 | Forwarding, transparency, privacy |
| `vif.yaml` | 13 | Trust lists, signature validation, key management |
| UI Step 1 | 2 checkboxes | Select PIF and/or VIF |

### 4.2 Target State

| File | Requirements | Description |
|------|--------------|-------------|
| `intermediary.yaml` | 25 (merged) | All RP Intermediary requirements |
| UI Step 1 | Removed | No intermediary type selection needed |

### 4.3 Requirement ID Changes

| Old ID Pattern | New ID Pattern |
|----------------|----------------|
| `VEND-PIF-*` | `VEND-INT-*` |
| `VEND-VIF-*` | `VEND-INT-*` |
| `VEND-CORE-*` | `VEND-CORE-*` (unchanged) |
| `VEND-ICT-*` | `VEND-ICT-*` (unchanged) |

---

## 5. Use Case Validation

### 5.1 Bank Scenario

A bank evaluating an intermediary product (e.g., Lissi Connector) for EUDIW integration needs:

| Capability | Previously | Now |
|------------|------------|-----|
| Generate presentation requests | PIF | RP Intermediary |
| Receive wallet presentations | PIF | RP Intermediary |
| Validate cryptographic signatures | VIF | RP Intermediary |
| Check revocation status | VIF | RP Intermediary |
| Manage trust lists | VIF | RP Intermediary |
| Forward to backend | PIF | RP Intermediary |

**All capabilities are part of a single RP Intermediary role per ARF RPI_09.**

### 5.2 Bank as Issuer

If the bank also wants to issue EAAs (e.g., IBAN attestation):

- **Bank owns the data** → No need for 2025/1569 Art. 9 verification
- **Bank is the authentic source** → Direct issuance without external verification
- **Separate from VCQ scope** → VCQ focuses on RP-side consumption, not issuance

---

## 6. Decision

**DEC-254: Collapse PIF and VIF into Single RP Intermediary Category**

### 6.1 Changes

1. **Merge `pif.yaml` + `vif.yaml`** → `intermediary.yaml`
2. **Remove VCQ Step 1** (Intermediary Type selection)
3. **Rename requirement IDs** from `VEND-PIF-*` / `VEND-VIF-*` to `VEND-INT-*`
4. **Update TERMINOLOGY.md** — Remove PIF/VIF, add unified "RP Intermediary" definition
5. **Update INTERMEDIARY_ROLE_ANALYSIS.md** — Reflect corrected understanding
6. **Update VCQ_TOOL_PLAN.md** — Document this decision

### 6.2 Rationale

1. **Regulatory accuracy** — Aligns with official eIDAS/ARF terminology
2. **Removes confusion** — Eliminates conflict with 2025/1569 "designated intermediary"
3. **Simplifies UX** — One less decision point for users
4. **Reduces maintenance** — Single requirements file instead of two

### 6.3 Not Affected

- **VEND-CORE-*** requirements (apply to all intermediaries)
- **VEND-ICT-*** requirements (DORA extended scope)
- **Source Selection step** (still useful for filtering by regulation)

---

## 7. Implementation Checklist

- [ ] Create `intermediary.yaml` by merging `pif.yaml` + `vif.yaml`
- [ ] Update requirement IDs to `VEND-INT-*` pattern
- [ ] Remove PIF/VIF checkboxes from `VendorQuestionnaire.jsx`
- [ ] Update `vcq-config.yaml` to remove intermediary type configuration
- [ ] Update `validate-vcq.js` to handle new structure
- [ ] Update `build-vcq.js` to process merged file
- [ ] Update TERMINOLOGY.md
- [ ] Update INTERMEDIARY_ROLE_ANALYSIS.md
- [ ] Update VCQ_TOOL_PLAN.md
- [ ] Add DEC-254 to DECISIONS.md
- [ ] Run full validation and build
- [ ] Test VCQ tool end-to-end
- [ ] Commit with conventional commit format

---

## 8. References

- **Regulation (EU) No 910/2014** — Article 5b(10)
- **Implementing Regulation (EU) 2025/1569** — Article 9
- **ARF v1.5** — Topic 52: Relying Party Intermediaries
- **DEC-222** — Original VCQ Tool Implementation
- **VCQ_TOOL_PLAN.md** — Section 2 (Terminology), Section 17 (Backlog)

---

*Document created: 2026-01-26*  
*Decision: DEC-254*
