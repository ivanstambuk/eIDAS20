# Architecture Tag Audit — Batch 6c: VEND-CORE Agnostic Confirmation (Integration & Gate Questions)

> **Audit date:** 2026-02-10
> **Auditor:** Architecture tag audit (Phase 5)
> **Scope:** 7 requirements — VEND-CORE-040, 041, 045, 046, 047, 048, 052
> **Theme:** Confirm agnostic tagging; final cross-reference checks

---

## Executive Summary

Batch 6c is the **final sub-batch** of the entire architecture tag audit. It covers
integration features (proximity flows, user events), registration protocol (TS5 API,
certificate lifecycle), and gate questions (architecture declaration, coverage
confirmation).

### Tag assessment summary

| # | ID | Current | Verdict | Duplication flag |
|---|------|---------|---------|-----------------|
| 1 | CORE-040 | missing (agnostic) | ✅ Confirmed agnostic | Complements INT-005 |
| 2 | CORE-041 | missing (agnostic) | ✅ Confirmed agnostic | None |
| 3 | CORE-045 | missing (agnostic) | ✅ Confirmed agnostic | None |
| 4 | CORE-046 | missing (agnostic) | ✅ Confirmed agnostic | Complements INT-022 |
| 5 | CORE-047 | missing (agnostic) | ✅ Confirmed agnostic | None |
| 6 | CORE-048 | `[]` (agnostic) | ✅ Confirmed agnostic | None — meta-requirement |
| 7 | CORE-052 | `[]` (agnostic) | ✅ Confirmed agnostic | None — breadth gate |

**Tag changes: 0 of 7** — all confirmed correctly agnostic.

---

## Per-Requirement Audit

### VEND-CORE-040: Support proximity identification flows (optional)

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | Proximity identification (ProxId_01a) is a protocol capability available to any connector. Whether the RP uses an intermediary, SaaS, or self-hosted connector, proximity flows work the same way at the protocol level. |

**Relationship to INT-005:** Complementary:
- CORE-040: "Support proximity flows" (high-level capability)
- INT-005: "Support OID4VP and ISO 18013-5 protocols" (detailed protocol support)

INT-005 was flagged as agnostic in Batch 3a. Together with CORE-040, they cover
the same area at different levels of detail. Consider merging in a future pass.

---

### VEND-CORE-041: Handle registration certificate updates and renewals

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | Registration certificate lifecycle management (RPRC_19/19a) is an operational capability needed by all connectors. Certificate renewal monitoring and automated rotation are architecture-independent. |

**Note:** RPRC_19a is referenced here in the context of certificate updates. The
same HLR appears in INT-022 (RPRC_19a for intermediary request construction).
Different aspects of the same HLR — no duplication.

---

### VEND-CORE-045: Implement TS5 REST API for RP registration information exchange

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | The TS5 REST API for RP-Registry communication (RPA_01) is a registration protocol standard. All RPs must interact with Member State registries, regardless of deployment architecture. |

**No duplication.** INT-033 covers the intermediary-specific contractual registration
(RPI_04), which is a relationship registration. CORE-045 covers the API standard
for RP-Registry information exchange. Complementary.

---

### VEND-CORE-046: Support intended use selection and management in presentation requests

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | Intended use selection (RPRC_19a, RPRC_20a, RPRC_21, RPA_10) is a request construction capability needed by all connectors. When an RP has multiple registered uses, the connector must select the correct one per request. |

**Relationship to INT-022:** Complementary:
- CORE-046: "Select the correct intended use per request" (agnostic capability)
- INT-022: "Include the intermediated RP's details via RPRC_19a" (intermediary-specific
  request construction with dual identity)

CORE-046 covers the `what` (selecting intended uses); INT-022 covers the `how`
(embedding the intermediated RP's identity alongside the intended use).

---

### VEND-CORE-047: Surface user rejection, consent denial, and session timeout events

| Aspect | Assessment |
|--------|------------|
| **Current tag** | missing (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | User rejection event surfacing (RPA_09, RPA_12) is an integration capability. The connector must inform the integrating application when a wallet user declines, regardless of architecture. |

**No duplication.** No intermediary.yaml equivalent. Correctly unique to core.yaml.

---

### VEND-CORE-048: Declare which RP Deployment Architecture(s) the product supports

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[]` (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | This is a **meta-requirement** (RPI_01) — it asks vendors to declare which architectures they support. By definition this applies to ALL products. |

**Special status:** This is the requirement that CREATES the deployment architecture
filter. It's the "gating question" that determines which subsequent requirements
apply to a given vendor. Correctly agnostic — every vendor must answer it.

---

### VEND-CORE-052: Confirm EU wallet coverage, trust-list integration, and proximity flow support

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[]` (agnostic) |
| **Verdict** | ✅ **Confirmed agnostic** |
| **Rationale** | This is a **breadth gate question** (ProxId_01a). It confirms the product covers essential cross-cutting concerns: EU wallet support, trust list integration, and proximity flow support. Architecture-independent by design. |

**No duplication.** This is a broad confirmation question, not a detailed technical
requirement.

---

## Aggregate Findings

### Tag changes needed: **0 of 7** ✅

All 7 confirmed correctly agnostic. The agnostic core.yaml requirements across
Batches 6a–6c are well-tagged.

### Cross-reference summary (Batch 6c)

| Core Agnostic | INT Complement | Relationship |
|---|---|---|
| CORE-040 (proximity capability) | INT-005 (protocol support) | Same area, different detail → merge candidate |
| CORE-046 (intended use selection) | INT-022 (intermediary request construction) | Complementary: what vs how |
| CORE-045 (TS5 API) | INT-033 (contractual registration) | Complementary: API vs governance |

---

## 🏁 COMPLETE AUDIT — FINAL SUMMARY

### All batches complete

| Batch | Scope | Tag Corrections | Cumulative |
|---|---|---|---|
| Batch 1 | 9 CORE agnostic-framed reqs | 0 | 0 |
| Batch 2 | 7 CORE intermediary-tagged reqs | 0 | 0 |
| Batch 3a | 7 INT forwarding/protocol reqs | 1 | 1 |
| Batch 3b | 7 INT trust/verification reqs | 7 | 8 |
| Batch 4a | 6 INT key-mgmt/privacy reqs | 4 | 12 |
| Batch 4b | 5 INT format/cert/disclosure reqs | 4 | 16 |
| Batch 5 | 8 INT pseudonym/reg/GDPR reqs | 5 | 21 |
| Batch 6a | 7 CORE agnostic cert/verification | 0 | 21 |
| Batch 6b | 7 CORE agnostic reg/protocol | 0 | 21 |
| Batch 6c | 7 CORE agnostic integration/gates | 0 | 21 |
| **TOTAL** | **70 requirements** | **21 corrections** | |

### Correction breakdown

| Change Type | Count | Percentage |
|---|---|---|
| `[intermediary]` → agnostic `[]` | 15 | 71% of corrections |
| `[intermediary]` → `[intermediary, direct_saas]` | 6 | 29% of corrections |
| Confirmed correct (all tags) | 49 | 70% of total |
| **Total audited** | **70** | |

### Duplication clusters identified

| Cluster | Requirements | Recommendation |
|---|---|---|
| **Access certificate** | CORE-005, CORE-032, INT-029 | Consolidate 3 → 1 |
| **Data deletion** | CORE-021, CORE-035, INT-030 | Merge CORE pair; keep INT-030 |
| **Pseudonym** | CORE-027, CORE-033, INT-027, INT-028 | Merge CORE-027 + INT-027; keep rest |
| **Revocation** | INT-011, INT-034, CORE-039 | Consolidate overlapping ground |
| **Verification umbrella** | CORE-030 vs INT-007–013 | Structural decision needed |
| **Protocol/proximity** | CORE-040, INT-005 | Merge candidate |

### Architectural heuristics codified

1. **Forwarding Test** — data relay between entities → intermediary
2. **Capability vs. Governance** — can it do X → agnostic; how X is managed → intermediary
3. **Data Handler Test** — vendor handles RP data → `[int, saas]`; RP owns data → N/A
