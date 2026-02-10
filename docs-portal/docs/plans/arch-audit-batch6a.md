# Architecture Tag Audit — Batch 6a: VEND-CORE Agnostic Confirmation (Certificates & Verification)

> **Audit date:** 2026-02-10
> **Auditor:** Architecture tag audit (Phase 5)
> **Scope:** 7 requirements — VEND-CORE-005, 019, 021, 027, 028, 029, 030
> **Theme:** Confirm agnostic tagging; identify cross-references with intermediary.yaml duplicates

---

## Executive Summary

Batch 6a audits 7 core.yaml requirements that are currently tagged as **agnostic**
(either `[]` or no `deploymentArchitectures` field). The goal is to confirm they
are correctly agnostic and flag duplication with intermediary.yaml requirements.

### Tag assessment summary

| # | ID | Current | Verdict | Duplication flag |
|---|------|---------|---------|-----------------|
| 1 | CORE-005 | `[]` (agnostic) | ✅ Confirmed agnostic | ⚠️ Duplicated by INT-029 |
| 2 | CORE-019 | missing (agnostic) | ✅ Confirmed agnostic | None |
| 3 | CORE-021 | missing (agnostic) | ✅ Confirmed agnostic | ⚠️ Overlaps with INT-030 |
| 4 | CORE-027 | missing (agnostic) | ✅ Confirmed agnostic | ⚠️ Overlaps with INT-027/028 |
| 5 | CORE-028 | missing (agnostic) | ✅ Confirmed agnostic | None |
| 6 | CORE-029 | missing (agnostic) | ✅ Confirmed agnostic | None |
| 7 | CORE-030 | missing (agnostic) | ✅ Confirmed agnostic | ⚠️ High-level umbrella for INT-007–013 |

**Tag changes: 0 of 7** — all confirmed correctly agnostic.

**Text bias note:** CORE-005 uses "The intermediary must" in its explanation despite
being agnostic. This is the same text bias pattern from Batch 1 — the tag is correct
but the explanation text should use architecture-neutral language. Minor editorial fix.

---

## Per-Requirement Audit

### VEND-CORE-005: Maintain a valid Relying Party Access Certificate

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[]` (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | Every RP connector needs a valid access certificate (RPA_02a, RPA_03). This is architecture-independent. |

**Duplication:** INT-029 is a near-duplicate, adding intermediary-specific detail
about the access cert vs RPRC_19a relationship. INT-029 has been flagged for
agnostic re-tagging in Batch 5.

**Dedup recommendation:** Keep CORE-005 as the primary agnostic requirement. If
INT-029 is re-tagged agnostic, consider merging INT-029's intermediary-specific
notes (RPRC_19a relationship, dual-identity detection) as an intermediary subsection
within CORE-005. Alternatively, delete INT-029 and add a cross-reference in CORE-005.

**Text fix needed:** Replace "The intermediary must obtain" with "The RP/connector
must obtain" in the explanation.

---

### VEND-CORE-019: Implement TS12 for PSD2 Strong Customer Authentication

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | PSD2 SCA is a payment-specific capability requirement. Whether a PSP uses an intermediary, SaaS, or self-hosted connector, it must implement TS12 if processing payment transactions. |

**No duplication:** No equivalents in intermediary.yaml (payment-specific requirements
were correctly kept only in core.yaml).

**Action items:** None. Consider adding explicit `deploymentArchitectures: []` for
consistency with CORE-005's format.

---

### VEND-CORE-021: Implement TS7 data deletion request interface

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | TS7 data deletion is a software capability (DATA_DLT_07/08). Every connector should implement the TS7 API, regardless of architecture. |

**Duplication:** INT-030 overlaps. But INT-030 adds intermediary/SaaS-specific
data handler obligations (relay pattern, no-storage interaction). These are
correctly differentiated:

| Requirement | Scope | Tag |
|---|---|---|
| CORE-021 | Software capability: "implement TS7 interface" | Agnostic ✅ |
| INT-030 | Data handler obligation: "process/relay deletion requests as a legal entity" | `[int, saas]` ✅ |

**Dedup recommendation:** Keep both. They serve different purposes:
- CORE-021: Does the software have the TS7 API? (capability)
- INT-030: Does the vendor process deletion requests correctly? (governance)

---

### VEND-CORE-027: Support pseudonym attestations per TS9

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | Pseudonym support is a protocol capability (Art 5a(4)(b)). All connectors serving use cases that don't require full identification should support pseudonymous attestations. |

**Duplication:** INT-027 (WebAuthn implementation) and INT-028 (RP-specific
pseudonyms) overlap at different levels:

| Requirement | Level | Tag (after audit) |
|---|---|---|
| CORE-027 | High-level: "support pseudonym attestations" | Agnostic ✅ |
| INT-027 | Implementation: "support WebAuthn specificall" | Agnostic (changed in Batch 5) |
| INT-028 | Governance: "correctly scope pseudonyms per RP" | `[intermediary]` ✅ |

**Dedup recommendation:** Consider merging CORE-027 and INT-027 (both agnostic,
both about pseudonym capability). Keep INT-028 separate (intermediary-specific
scoping risk).

---

### VEND-CORE-028: Provide data export per TS10 for GDPR portability

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | GDPR Article 20 data portability is a legal right that applies regardless of architecture. The software must provide export capabilities. |

**No duplication:** No intermediary.yaml equivalent. Correctly unique to core.yaml.

**Action items:** None.

---

### VEND-CORE-029: Verify registration certificates presented by counterparties

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | Registration certificate verification (RPRC_03/05/10/11/12) is a protocol capability. All connectors verify certificates from PIDs, attestation providers, and other RPs. |

**No duplication:** INT-032 covers the intermediary's dual-certificate *inclusion*
(RPI_06), which is the sending side. CORE-029 covers *verification* of received
certificates, which is the receiving side. No overlap — complementary.

**Action items:** None.

---

### VEND-CORE-030: Verify attestation authenticity and validity before acceptance

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | Attestation verification (Art 5b(9), OIA_12-16) is the most fundamental RP obligation. Architecture-independent. |

**Duplication:** CORE-030 is the **high-level umbrella** for INT-007 through INT-013,
which break down verification into detailed sub-requirements:

| CORE-030 paragraph | INT equivalent | INT tag (after audit) |
|---|---|---|
| PID verification (OIA_12) | INT-007 (PID Trusted Lists) | Agnostic |
| QEAA verification (OIA_13) | INT-008 (Attestation Trusted Lists) | Agnostic |
| Trust source (OIA_14) | INT-009 (Official sources) | Agnostic |
| Signature validation | INT-010 (Signature validation) | Agnostic |
| Revocation checking | INT-011/034 (Revocation status) | Agnostic |
| Device binding | INT-012 (Device binding) | Agnostic |
| Unique element handling (OIA_16) | — (no INT equivalent) | — |

**Dedup recommendation:** This is a structural question. CORE-030 covers OIA_15
and OIA_16 (unique element handling) which INT-007–013 don't cover individually.
Consider:
- Keep CORE-030 as the umbrella requirement
- Move INT-007–013 to core.yaml as detailed sub-requirements
- Or: keep INT-007–013 as separate agnostic requirements with cross-references

---

## Aggregate Findings

### Tag changes needed: **0 of 7** ✅

All 7 requirements are confirmed correctly agnostic. This is expected — these
were already identified as architecture-neutral during the original authoring.

### Text fixes needed: **1 of 7** (CORE-005 intermediary-biased text)

### Duplication cross-reference map

| Core Agnostic | INT Equivalent | Relationship | Action |
|---|---|---|---|
| CORE-005 | INT-029 | Near-duplicate | Merge INT-029 into CORE-005 |
| CORE-021 | INT-030 | Complementary (capability vs governance) | Keep both |
| CORE-027 | INT-027 | Near-duplicate | Merge INT-027 into CORE-027 |
| CORE-027 | INT-028 | Complementary (capability vs scoping risk) | Keep both |
| CORE-030 | INT-007–013 | Umbrella vs detail breakdown | Structural decision needed |

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
| Batch 6a | 0 | **21** |
| **Total audited** | | **56 requirements** |
