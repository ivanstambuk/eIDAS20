# RCA-VCQ Mapping Document

**Created:** 2026-01-26
**Purpose:** Map RCA Relying Party requirements to VCQ Intermediary requirements
**Status:** Complete

---

## 1. Executive Summary

The **RCA** (Regulatory Compliance Audit) and **VCQ** (Vendor Compliance Questionnaire) serve complementary purposes:

| Tool | Audience | Purpose |
|------|----------|---------|
| **RCA** | Relying Parties | All regulatory obligations for RPs using EUDI Wallets |
| **VCQ** | RPs evaluating vendors | Requirements for intermediary products/services |

**Scope difference:**
- RCA covers **102 requirements** across all RP obligations
- VCQ covers **61 requirements** specifically for intermediary vendors
- **~40 RCA requirements** are RP-only (not delegatable to intermediary)

---

## 2. Relationship Types

### Type A: Direct Coverage (RCA → VCQ)

RCA requirement has a corresponding VCQ requirement for intermediaries:

| RCA ID | VCQ ID | Article | Topic |
|--------|--------|---------|-------|
| RP-GOV-001 | VEND-CORE-001 | Art 5b(10) | No-storage mandate |
| RP-REG-001 | VEND-CORE-015 | Art 5b(1) | Registration requirement |
| RP-REG-003 | VEND-INT-002 | Art 5b(3) | Data minimization |
| RP-REG-005 | VEND-INT-001 | Art 5b(8) | Identify to user |
| RP-PRV-003 | VEND-INT-020 | Art 5a(16) | Unlinkability |
| RP-TEC-001 | VEND-INT-023 | Art 8 (2024/2979) | Credential formats |
| RP-TEC-002 | VEND-INT-005 | Art 5 (2024/2982) | Protocols |
| RP-TEC-003 | VEND-INT-024 | Art 5(4) (2024/2982) | Selective disclosure |
| RP-TEC-004 | VEND-INT-027 | Art 14 (2024/2979) | WebAuthn pseudonyms |
| RP-TEC-005 | VEND-INT-028 | Art 14(2) (2024/2979) | RP-specific pseudonyms |
| RP-TEC-007 | VEND-INT-029 | Art 3 (2024/2982) | Access certificate |
| RP-TEC-008 | VEND-INT-030 | Art 6 (2024/2982) | Data erasure |
| RP-PRV-010 | VEND-INT-026 | Art 10 (2024/2979) | Disclosure policies |
| RP-GOV-006 | VEND-INT-031 | Art 7 (2024/2982) | DPA reporting |

### Type B: RP-Only (Not Delegatable)

These RCA requirements are the RP's own obligation, cannot be fulfilled by intermediary:

| RCA ID | Article | Why RP-Only |
|--------|---------|-------------|
| RP-GOV-002 | Art 5f(1) | Public sector acceptance decision |
| RP-GOV-003 | Art 5f(2) | Private sector SUA mandate |
| RP-GOV-004 | Art 5f(3) | VLOP acceptance obligation |
| RP-GOV-005 | Art 5a(15) | Maintain alternative auth methods |
| RP-GOV-008 | Art 5 (2025/846) | Identity matching logs |
| RP-PRV-005 | Art 5 | Pseudonym policy |
| RP-PRV-006 | Art 2(4) | GDPR compliance |
| RP-PRV-007 | Recital 17 | DPIA obligation |
| RP-REG-002 | Art 5b(2) | RP registration info |
| RP-REG-004 | Art 5b(6) | RP change notification |
| RP-SEC-001 | Art 5 (2025/847) | Security breach notifications (received by RP) |

### Type C: Covered by ARF (No VCQ Duplication)

These are covered by ARF HLRs; VCQ includes the ARF reference:

| RCA Topic | ARF Coverage | VCQ ARF Reference |
|-----------|--------------|-------------------|
| Signature validation | RPA_05 | VEND-INT-010 |
| Revocation checking | VCR_13 | VEND-INT-011 |
| Device binding | RPA_07 | VEND-INT-012 |
| Trusted Lists | OIA_12, OIA_13 | VEND-INT-007, -008 |
| Forwarding | RPI_08 | VEND-INT-004, -006 |

### Type D: GDPR Processor (VCQ-Specific)

These VCQ requirements derive from GDPR Art 28 (processor obligations), not in RCA:

| VCQ ID | GDPR Article | Topic |
|--------|--------------|-------|
| VEND-CORE-002 | Art 28(3) | Process only on instructions |
| VEND-CORE-003 | Art 28(3)(h) | Audit rights |
| VEND-CORE-006 | Art 32(1) | Security measures |
| VEND-CORE-007 | Art 33(2) | Breach notification |
| VEND-CORE-008 | Art 28(3)(b) | Confidentiality |
| VEND-CORE-009 | Art 28(3)(a) | Documented instructions |
| VEND-CORE-010 | Art 28(3)(e) | DPO cooperation |
| VEND-CORE-013 | Art 28(2) | Sub-processor authorization |
| VEND-CORE-014 | Art 28(3)(g) | Data deletion at termination |

### Type E: DORA ICT (VCQ-Specific)

These VCQ requirements derive from DORA (2022/2554), specific to financial sector:

| VCQ ID | DORA Article | Topic |
|--------|--------------|-------|
| VEND-ICT-001 | Art 30(2) | Contractual requirements |
| VEND-ICT-002 | Art 30(2)(e) | Service level agreements |
| VEND-ICT-003 | Art 30(2)(j) | Exit strategies |
| VEND-ICT-004 | Art 28(1) | Risk assessment |
| VEND-ICT-005 | Art 28(3) | Due diligence |
| VEND-ICT-006 | Art 29(1) | Concentration risk |
| VEND-ICT-007 | Art 30(2)(f) | Data location |
| VEND-ICT-008 | Art 26(4) | ICT incident reporting |
| VEND-ICT-009 | Art 30(2)(g) | Audit access |
| VEND-ICT-010 | Art 30(2)(d) | Performance monitoring |
| VEND-ICT-011 | Art 28(4) | Proportionality |
| VEND-ICT-012 | Art 31 | Critical ICT designation |

---

## 3. Complete Cross-Reference Table

### RCA Requirements and VCQ Coverage

| RCA ID | RCA Requirement | VCQ ID | Coverage Type |
|--------|-----------------|--------|---------------|
| RP-GOV-001 | No-storage mandate | VEND-CORE-001 | A: Direct |
| RP-GOV-002 | Public sector acceptance | — | B: RP-Only |
| RP-GOV-003 | Private sector SUA | — | B: RP-Only |
| RP-GOV-004 | VLOP acceptance | — | B: RP-Only |
| RP-GOV-005 | Alternative auth | — | B: RP-Only |
| RP-GOV-006 | DPA reporting support | VEND-INT-031 | A: Direct |
| RP-GOV-007 | Selective disclosure | VEND-INT-024 | A: Direct |
| RP-GOV-008 | Identity matching logs | — | B: RP-Only |
| RP-PRV-001 | Data minimization | VEND-INT-002 | A: Direct |
| RP-PRV-002 | Selective disclosure | VEND-INT-024 | A: Direct |
| RP-PRV-003 | Unlinkability | VEND-INT-020 | A: Direct |
| RP-PRV-004 | Privacy-preserving | VEND-INT-024 | A: Direct |
| RP-PRV-005 | Pseudonyms | — | B: RP-Only |
| RP-PRV-006 | GDPR compliance | — | B: RP-Only |
| RP-PRV-007 | DPIA | — | B: RP-Only |
| RP-PRV-008 | Data minimization | VEND-INT-002 | A: Direct |
| RP-PRV-009 | Pseudonymous access | VEND-INT-027/028 | A: Direct |
| RP-PRV-010 | Disclosure policies | VEND-INT-026 | A: Direct |
| RP-REG-001 | Registration | VEND-CORE-015 | A: Direct |
| RP-REG-002 | Registration info | — | B: RP-Only |
| RP-REG-003 | Request only declared | VEND-INT-002/003 | A: Direct |
| RP-REG-004 | Change notification | — | B: RP-Only |
| RP-REG-005 | Identify to user | VEND-INT-001, VEND-CORE-011 | A: Direct |
| RP-REG-006 | Accept pseudonyms | VEND-CORE-018 | A: Direct |
| RP-REG-007 | Annex I info | VEND-CORE-016 | A: Direct |
| RP-REG-008 | Accuracy | — | B: RP-Only |
| RP-REG-009 | Update info | — | B: RP-Only |
| RP-REG-010 | Cease notification | — | B: RP-Only |
| RP-REG-011 | Entitlement type | — | B: RP-Only |
| RP-REG-012 | Machine-readable | VEND-INT-022 | A: Direct |
| RP-REG-013 | Privacy policy URL | — | B: RP-Only |
| RP-SEC-001 | Breach notifications | — | B: RP-Only |
| RP-SEC-002 | Re-establishment notices | — | B: RP-Only |
| RP-SEC-003 | Withdrawal notices | — | B: RP-Only |
| RP-TEC-001 | Credential formats | VEND-INT-023 | A: Direct |
| RP-TEC-002 | Presentation protocols | VEND-INT-005 | A: Direct |
| RP-TEC-003 | Selective disclosure | VEND-INT-024 | A: Direct |
| RP-TEC-004 | WebAuthn | VEND-INT-027 | A: Direct |
| RP-TEC-005 | RP-specific pseudonyms | VEND-INT-028 | A: Direct |
| RP-TEC-007 | Access certificate | VEND-INT-029 | A: Direct |
| RP-TEC-008 | Data erasure | VEND-INT-030 | A: Direct |

---

## 4. Coverage Statistics

### After Gap Analysis Update (2026-01-26)

| Metric | Value |
|--------|-------|
| RCA RP requirements | 102 |
| VCQ requirements | 61 |
| RCA with VCQ coverage | ~45 |
| RCA RP-only (no VCQ) | ~40 |
| VCQ GDPR-specific | 11 |
| VCQ DORA-specific | 12 |

### By Source

| Source | RCA Count | VCQ Count |
|--------|-----------|-----------|
| eIDAS 2014/910 | 55 | 21 |
| Implementing Acts | 41 | 18 |
| GDPR | 1 | 11 |
| DORA | 0 | 12 |

---

## 5. Usage Guidance

### For RPs Selecting VCQ

1. **Always start with RCA** to understand your own obligations
2. **Use VCQ** to evaluate vendors for delegatable obligations
3. **Profile matters**: Some VCQ requirements only apply if DORA-regulated

### For RPs Interpreting Results

| If VCQ Shows | It Means |
|--------------|----------|
| Requirement present | Intermediary should fulfill for RP |
| Linked to RCA | Same obligation applies to RP directly |
| No RCA link | Intermediary-specific (GDPR processor, DORA) |

### For Understanding Gaps

- RCA requirements without VCQ coverage are **RP-only obligations**
- The RP cannot outsource these to intermediary
- Examples: acceptance mandates, identity matching, security notifications

---

*Document created 2026-01-26 as part of VCQ Legal Primacy Audit (DEC-256)*
