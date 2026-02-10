# Architecture Tag Audit — Batch 6b: VEND-CORE Agnostic Confirmation (Registration & Protocol)

> **Audit date:** 2026-02-10
> **Auditor:** Architecture tag audit (Phase 5)
> **Scope:** 7 requirements — VEND-CORE-031, 032, 033, 034, 035, 038, 039
> **Theme:** Confirm agnostic tagging; identify cross-references with intermediary.yaml duplicates

---

## Executive Summary

Batch 6b audits 7 more core.yaml requirements tagged as **agnostic** (all `MISSING`
= implicit agnostic). All are confirmed correctly agnostic — they cover registration,
protocol, trust infrastructure, and GDPR capabilities that every connector needs.

### Tag assessment summary

| # | ID | Current | Verdict | Duplication flag |
|---|------|---------|---------|-----------------|
| 1 | CORE-031 | missing (agnostic) | ✅ Confirmed agnostic | None |
| 2 | CORE-032 | missing (agnostic) | ✅ Confirmed agnostic | ⚠️ Near-dup of CORE-005 + INT-029 |
| 3 | CORE-033 | missing (agnostic) | ✅ Confirmed agnostic | Complements INT-028 |
| 4 | CORE-034 | missing (agnostic) | ✅ Confirmed agnostic | None |
| 5 | CORE-035 | missing (agnostic) | ✅ Confirmed agnostic | ⚠️ Near-dup of CORE-021 + INT-030 |
| 6 | CORE-038 | missing (agnostic) | ✅ Confirmed agnostic | None |
| 7 | CORE-039 | missing (agnostic) | ✅ Confirmed agnostic | Complements INT-034 |

**Tag changes: 0 of 7** — all confirmed correctly agnostic.

---

## Per-Requirement Audit

### VEND-CORE-031: Register intended uses and comply with access certificate policies

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | Registration of intended uses (Reg_15, Reg_31, Reg_32) is an obligation for ALL RPs, regardless of architecture. The registration happens between the RP and the Registrar, not involving the deployment architecture. |

**No duplication.** INT-033 covers the *intermediary-specific* registration of the
intermediary-RP relationship (RPI_04), which is a separate registration step.
CORE-031 covers the RP's own intended use registration. These are complementary.

---

### VEND-CORE-032: Use valid RP Access Certificate for Wallet Unit authentication

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | Using a valid access certificate in presentation requests (RPA_02a, RPA_06) is a universal protocol requirement. |

**Duplication:** This is a near-duplicate of CORE-005, which also covers access
certificate management. The distinction:

| Requirement | Focus |
|---|---|
| CORE-005 | **Lifecycle**: obtain, maintain, renew access certificates (RPA_03) |
| CORE-032 | **Usage**: present the certificate correctly in requests (RPA_06) |

These could potentially be merged. Additionally, INT-029 (now flagged agnostic)
covers the same ground with intermediary-specific framing.

**Dedup recommendation:** Three requirements (CORE-005, CORE-032, INT-029) cover
access certificate lifecycle and usage. Consider consolidating into a single
comprehensive requirement covering both lifecycle and protocol usage, with an
intermediary subsection for the RPRC_19a relationship.

---

### VEND-CORE-033: Support and correctly handle pseudonym-based presentations

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | Pseudonym-based presentation handling (PA_10, PA_11, PA_13, PA_15, PA_17) is a protocol capability. All connectors must process pseudonymous presentations without attempting de-pseudonymisation (Art 5a(16)). |

**Relationship to INT-028:** Complementary, not duplicative:
- CORE-033: "Process pseudonymous presentations correctly" (capability)
- INT-028: "Ensure RP-specific pseudonym scoping uses the right RP ID" (intermediary risk)

Both are necessary — CORE-033 for the general capability, INT-028 for the
intermediary-specific misconfiguration risk.

---

### VEND-CORE-034: Publish RP trust anchor information for Wallet verification

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | Trust anchor publication (RPACANot_03/03a) is an obligation for ALL RPs using EUDI Wallets. The RP's certificates must be verifiable against notified ACA trust anchors, regardless of deployment architecture. |

**No duplication.** This is the trust publication side; INT requirements cover
trust consumption (INT-007/008 cover trusted list lookups).

---

### VEND-CORE-035: Process data deletion requests from Users within required timeframes

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | Processing data deletion requests (GDPR Art 17, DATA_DLT_07/08) is a universal obligation. |

**Duplication:** Three requirements now cover data deletion:

| Requirement | Scope | Tag |
|---|---|---|
| CORE-021 | Software capability: implement TS7 API interface | Agnostic |
| CORE-035 | Operational process: process requests within GDPR timeframes | Agnostic |
| INT-030 | Data handler obligation: relay + no-storage interaction | `[int, saas]` |

CORE-021 and CORE-035 are near-duplicates with slightly different emphasis
(interface implementation vs. process compliance). They share the same HLRs
(DATA_DLT_07/08).

**Dedup recommendation:** Merge CORE-021 and CORE-035 into a single comprehensive
data deletion requirement covering both the API interface (TS7) and the
operational process (GDPR timeframes). Keep INT-030 separate for the
intermediary/SaaS relay obligations.

---

### VEND-CORE-038: Support W3C Digital Credentials API for presentation requests

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | W3C Digital Credentials API support (OIA_08c) is a browser-level protocol capability. Any connector supporting browser-based wallet interactions needs this, regardless of architecture. |

**No duplication.** No intermediary.yaml equivalent. Correctly unique to core.yaml.

---

### VEND-CORE-039: Handle revocation status unavailability gracefully

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | Graceful revocation unavailability handling (VCR_15) is a resilience capability. All connectors should implement intelligent fallback when status endpoints are down. |

**Relationship to INT-034:** Complementary:
- INT-034: "Support attestation status list mechanisms" (capability to check status)
- CORE-039: "Handle unavailability gracefully" (resilience when status is inaccessible)

Both are now agnostic (INT-034 was flagged in Batch 5). They address different
aspects of the same subsystem.

---

## Aggregate Findings

### Tag changes needed: **0 of 7** ✅

All 7 requirements confirmed correctly agnostic.

### New duplication findings

| Duplication cluster | Requirements | Recommendation |
|---|---|---|
| Access certificate cluster | CORE-005, CORE-032, INT-029 | Consolidate 3 → 1 + intermediary note |
| Data deletion cluster | CORE-021, CORE-035, INT-030 | Merge CORE-021 + CORE-035; keep INT-030 |
| Revocation cluster | INT-011, INT-034, CORE-039 | 3 requirements covering overlapping ground |

### Running totals

| Batch | Tag corrections | Cumulative |
|---|---|---|
| Batch 1 | 0 | 0 |
| Batch 2 | 0 | 0 |
| Batch 3a | 1 | 1 |
| Batch 3b | 7 | 8 |
| Batch 4a | 4 | 12 |
| Batch 4b | 4 | 16 |
| Batch 5 | 5 | 21 |
| Batch 6a | 0 | 21 |
| Batch 6b | 0 | **21** |
| **Total audited** | | **63 requirements** |
