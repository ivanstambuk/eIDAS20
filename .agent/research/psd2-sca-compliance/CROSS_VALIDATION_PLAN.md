# PSD2 SCA Compliance Assessment — Cross-Validation Plan

> **Created**: 2026-01-27  
> **Purpose**: Systematic validation of all ARF HLR and TS12 references in `PSD2_SCA_COMPLIANCE_ASSESSMENT.md`  
> **Status**: Ready for execution

---

## Objective

Verify that **every external reference** (ARF HLRs and TS12 paragraphs) in the PSD2 SCA Compliance Assessment document:

1. **Exists** in the source document
2. **Actually says** what is claimed
3. **Is the correct reference** for the regulatory requirement being addressed

This prevents hallucinated or misattributed references that could undermine the credibility of the compliance assessment.

---

## Source Documents (Local)

| Document | Local Path | Description |
|----------|------------|-------------|
| **ARF HLRs** | `03_arf/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md` | 1,071 lines of HLR tables by topic |
| **TS12** | `04_technical_specs/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md` | 693 lines, v1.0 spec |
| **PSD2 Directive** | `.agent/research/psd2-sca-compliance/sources/32015L2366.md` | 308KB, local markdown |
| **PSD2 RTS** | `.agent/research/psd2-sca-compliance/sources/32018R0389.md` | 74KB, local markdown |

---

## Reference Inventory

### ARF High-Level Requirements (HLRs) Referenced

| HLR ID | Topic | Count | Lines |
|--------|-------|-------|-------|
| **SUA_01** | Topic 20 (Strong User Auth) | 2 | 62, 118 |
| **SUA_04** | Topic 20 | 1 | 144 |
| **SUA_05** | Topic 20 | 3 | 145, 285, 563 |
| **SUA_06** | Topic 20 | 2 | 502, 953 |
| **WIAM_06** | Topic 40 (Wallet Instance) | 1 | 702 |
| **WIAM_08** | Topic 40 | 1 | 843 |
| **WIAM_09** | Topic 40 | 1 | 676 |
| **WIAM_14** | Topic 40 | 3 | 283, 746, 787 |
| **WIAM_20** | Topic 40 | 5 | 364, 374, 700, 716, 730, 823 |
| **WUA_09** | Topic 9 (Wallet Unit Attestation) | 1 | 284 |
| **WUA_12** | Topic 9 | 1 | 402 |
| **WURevocation_09** | Topic 38 | 1 | 701 |
| **DASH_02–DASH_05** | Topic 19 | 1 | 200 |
| **RPA_01–RPA_08** | Topic 6 | 1 | 65 (summary only) |

**Total: 14 unique HLR IDs across 4 Topics**

### TS12 Section References

| Section | Claims | Lines |
|---------|--------|-------|
| **§2.1** | Flow types (Issuer/Third-party) | 516, 901 |
| **§2.3** | TLS 1.2+ | 461, 626, 824 |
| **§3.4** | Request/response encryption | 462 |
| **§3.6** | Presentation Response (KB-JWT, jti, amr, transaction_data_hashes) | 146, 152, 286, 300, 324, 336, 365, 384, 404, 564, 612, 627 |
| **§4.3** | Payload Object (URNs) | 119 |
| **§4.3.1** | Payment confirmation UI | 503 |
| **§4.3.2** | Recurrence/MIT options | 639 |

**Total: 7 unique TS12 sections, ~20 citations**

---

## Validation Methodology

For each reference, we will **read the source document** and verify:

### 1. Existence Check
- Does the HLR ID / section exist?
- Is the anchor/link correct?

### 2. Content Verification
- Extract the actual text from the source
- Compare with the claim in the assessment

### 3. Relevance Assessment
- Is this the **right** reference for the RTS article?
- Could a different HLR be more appropriate?

### 4. Correction Protocol
If a discrepancy is found:
1. Flag the issue
2. Find the correct reference (if any)
3. Update the assessment document
4. Document the correction

---

## Execution Status

Validation completed 2026-01-27.

### Phase 1: Article 97 (PSD2 Directive) ✅
- [x] Art. 97(1) — Verified SUA_01, TS12 §4.3 ✅
- [x] Art. 97(2) — Verified SUA_04, SUA_05, TS12 §3.6 ✅
- **Corrections**: None needed

### Phase 2: Article 2 (Transaction Monitoring) ✅
- [x] Art. 2(1) — Verified DASH_02–DASH_05 claim ✅
- **Corrections**: None needed (framing is acceptable with ⚠️ indicator)

### Phase 3: Article 4 (Authentication Code) ✅
- [x] Art. 4(1) — Verified WIAM_14, WUA_09, SUA_05, TS12 §3.6 ✅
- [x] Art. 4(2) — Verified TS12 §3.6 (jti claim) ✅
- [x] Art. 4(3)(a) — Verified WIAM_20, TS12 §3.6 ✅
- [x] Art. 4(3)(b) — Verified TS12 §3.6 ✅
- [x] Art. 4(3)(c) — Verified WUA_12, TS12 §3.6 ✅
- [x] Art. 4(4)(a) — No HLR cited (OS-level) — OK ✅
- [x] Art. 4(4)(b) — No HLR cited — OK ✅
- [x] Art. 4(4)(c) — **TS12 §2.3, §3.4 INCORRECT** ⚠️
- [x] Art. 4(4)(d) — No HLR cited — OK ✅
- **Corrections Applied**:
  - Line 461: TS12 §2.3 → OID4VP/HAIP (§2.3 is metadata, not TLS)
  - Line 462: TS12 §3.4 → TS12 §3.5 (§3.4 is Combined Presentation, §3.5 is Encryption)

### Phase 4: Article 5 (Dynamic Linking) ✅
- [x] Art. 5(1)(a) — Verified SUA_06, TS12 §4.3.1 ✅
- [x] Art. 5(1)(b) — Verified SUA_05, TS12 §3.6 ✅
- [x] Art. 5(1)(c) — No HLR cited (PSP verification) — OK ✅
- [x] Art. 5(1)(d) — Verified TS12 §3.6 ✅
- [x] Art. 5(2) — **TS12 §2.3 INCORRECT** ⚠️
- [x] Art. 5(3)(a-b) — **TS12 §4.3.2 INCORRECT** (should be §4.3.1) ⚠️
- **Corrections Applied**:
  - Line 626: TS12 §2.3 → OID4VP/HAIP
  - Line 639: TS12 §4.3.2 → TS12 §4.3.1 (mit_options is in Payment Confirmation)

### Phase 5: Article 6 (Independence of Elements) ✅
- [x] Art. 6 — Verified WIAM_09 ✅
- **Corrections**: None needed

### Phase 6: Articles 7-9 (Factor Requirements) ✅
- [x] Art. 7(1) — Verified WIAM_20, WURevocation_09, WIAM_06 ✅
- [x] Art. 7(2) — Verified WIAM_20 ✅
- [x] Art. 8(1) — Verified WIAM_14 ✅
- [x] Art. 8(2) — No HLR cited — OK ✅
- [x] Art. 9(1) — Verified WIAM_14 ✅
- [x] Art. 9(2) — No HLR cited (OS-level) — OK ✅
- **Corrections**: None needed

### Phase 7: Articles 22-24 (Confidentiality) ✅
- [x] Art. 22 — **TS12 §2.3 INCORRECT** ⚠️
- [x] Art. 24 — Verified WIAM_08 ✅
- **Corrections Applied**:
  - Line 824: TS12 §2.3 → OID4VP/HAIP

### Phase 8: Executive Summary ✅
- [x] SUA_01–SUA_06 range exists (Topic 20 has 6 HLRs) ✅
- [x] WIAM_14–WIAM_17 range exists ✅
- [x] WUA_09–WUA_12 range exists (WUA_10 is empty/moved) ✅
- [x] RPA_01–RPA_08 range exists ✅
- **Corrections**: None needed

---

## Summary of Corrections

| Line | Original | Corrected | Reason |
|------|----------|-----------|--------|
| 461 | TS12 §2.3 | OID4VP/HAIP | §2.3 is Attestation Metadata, not TLS |
| 462 | TS12 §3.4 | TS12 §3.5 | §3.4 is Combined Presentation, not Encryption |
| 626 | TS12 §2.3 | OID4VP/HAIP | Same as above |
| 639 | TS12 §4.3.2 | TS12 §4.3.1 | mit_options is in Payment Confirmation, not Login |
| 824 | TS12 §2.3 | OID4VP/HAIP | Same as above |

**Total: 5 corrections applied**

---

## Acceptance Criteria — COMPLETE ✅

1. [x] Every HLR reference has been verified against source (14 HLRs)
2. [x] Every TS12 reference has been verified against source (7 sections)
3. [x] All discrepancies documented and corrected (5 corrections)
4. [ ] Assessment document version updated (TODO)
5. [ ] Changes committed with descriptive messages (TODO)

---

## Pattern Identified

**TS12 §2.3 was consistently misattributed** for TLS/transport security. 
- **Actual**: §2.3 "SCA Attestation Metadata" defines `transaction_data_types` parameter
- **Expected**: TLS comes from underlying OID4VP and HAIP specifications

This error occurred 3 times (lines 461, 626, 824) suggesting copy-paste from an erroneous template.

