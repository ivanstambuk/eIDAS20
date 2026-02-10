# Architecture Tag Audit — Batch 4a: Key Management, Privacy & Audit

> **Audit date:** 2026-02-10
> **Auditor:** Architecture tag audit (Phase 5)
> **Scope:** 6 requirements — VEND-INT-016, 017, 018, 019, 020, 021
> **Theme:** Key management, verification result integrity, audit logging, privacy, data deletion

---

## Executive Summary

Batch 4a covers the **operational and privacy controls** around the verification
pipeline. The requirements range from clearly agnostic capabilities (key management)
to genuinely intermediary-specific obligations (immediate data deletion per RPI_10).

### Tag assessment summary

| # | ID | Current | Verdict | Rationale |
|---|------|---------|---------|-----------|
| 1 | INT-016 | `[int]` | ⚠️ **CHANGE → agnostic** | Key management is a universal connector security requirement |
| 2 | INT-017 | `[int]` | ✅ **Correct** (with nuance) | Verification result integrity is intermediary-specific — the concept of a signed verification result for a *separate entity* is unique to delegation |
| 3 | INT-018 | `[int]` | ⚠️ **CHANGE → agnostic** | Audit logging is a universal connector requirement |
| 4 | INT-019 | `[int]` | ⚠️ **CHANGE → `[intermediary, direct_saas]`** | No-extraction applies to entities that see data but don't own the RP relationship |
| 5 | INT-020 | `[int]` | ⚠️ **CHANGE → `[intermediary, direct_saas]`** | Cross-RP correlation risk exists for multi-tenant services |
| 6 | INT-021 | `[int]` | ✅ **Correct** | Immediate deletion per RPI_10 is a pure intermediary obligation |

**Tag changes: 4 of 6.**

---

## Per-Requirement Audit

### VEND-INT-016: Implement secure key management for verification operations

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | Every connector manages cryptographic keys — TLS keys, session keys, trust anchor integrity. Key management security is a universal requirement under GDPR Article 32 and eIDAS Art 5b(9). |

**Key types listed in the explanation:**
- TLS private keys → every connector has these
- Ephemeral session keys (OID4VP, ISO 18013-5) → every connector generates these
- Signing keys for verification results → relevant for intermediary and SaaS
- Trust anchor certificates → every connector manages these

None of these are intermediary-specific. A SaaS connector needs HSM-stored TLS keys
and proper key lifecycle just as much as an intermediary.

**CQ quality:** ✅ Already architecture-neutral. All 9 CQs ask about HSM
certification (Q2), access controls (Q3), key rotation (Q5), ephemeral key handling
(Q6). No intermediary-specific framing.

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Replace "intermediary" framing with "connector" in explanation (minor)
3. CQs are clean — no changes needed

---

### VEND-INT-017: Protect verification results integrity

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** — with an important nuance |
| **Rationale** | The concept of a *signed verification result delivered to a separate entity* is unique to the intermediary model. |

**The nuance:**

| Architecture | Verification result handling |
|---|---|
| **Intermediary** | Intermediary verifies → creates a signed result → **delivers to a separate RP entity** |
| **SaaS** | SaaS connector verifies → delivers result via API → the RP **trusts the SaaS API** (no need for JWS-signed results because the trust is in the API contract, not in a signed artifact) |
| **Self-hosted** | RP's own software verifies → result stays **within the RP's own system** |

The verification result integrity requirement is about **non-repudiation across an
organisational boundary**. In the intermediary model, the RP needs proof that the
intermediary actually performed verification (because the RP retains legal
responsibility per Art 5b(9)). This creates a need for:
- JWS-signed verification outcomes
- Non-repudiable evidence for dispute resolution
- Result binding to the original request nonce

In SaaS, this trust is established through the API contract and DPA — the RP
trusts the SaaS vendor's infrastructure, not individual signed artifacts. In
self-hosted, the RP's own system produces the result internally.

**Why not `[intermediary, direct_saas]`?**
While a SaaS vendor COULD provide signed verification results for added
transparency, it's not an architectural necessity the way it is for intermediaries.
The intermediary model fundamentally requires this because of the **legal liability
gap** — the RP is legally responsible for verification (Art 5b(9)) but delegates
the actual verification to the intermediary. The signed result bridges this gap.

**CQ quality:** ✅ Excellent — Q3 asks about RP-side independent verification of
the result, Q4 about non-repudiable evidence, Q8 about the interaction between
result retention and no-storage mandate. All correctly scoped to the intermediary
delegation model.

**Action items:** None.

---

### VEND-INT-018: Maintain audit logs of verification operations

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | Audit logging is a universal security and compliance requirement under GDPR Article 32. Every connector — intermediary, SaaS, or self-hosted — should maintain audit logs of verification operations for dispute resolution and compliance. |

**What's intermediary-specific in the current explanation?**
- "What must NOT be logged (no-storage mandate)" — The no-storage mandate is
  intermediary-specific (Art 5b(10)), but the *principle* of not logging PII
  is a GDPR obligation for all data processors/controllers.
- "Logs must not contain attestation content (due to no-storage mandate)" — Same
  framing issue.

**Recommended restructure:**
- Frame the logging obligation as GDPR Article 32 (all architectures)
- Frame the "do not log PII" constraint as GDPR data minimisation (all architectures)
- Add an intermediary note: "For intermediaries, the no-storage mandate (Art 5b(10))
  creates an absolute prohibition beyond GDPR minimisation."

**CQ quality:**
- Q2 ("How do you ensure logs do not contain attestation content (per the
  no-storage mandate)?") — should be reframed as GDPR data minimisation +
  intermediary note
- Q6 ("Do verification logs contain wallet unit identifiers... how is this
  consistent with the unlinkability requirement (VEND-INT-020)?") — intermediary-
  specific cross-reference, but the privacy concern is universal
- All other CQs are architecture-neutral

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Reframe from no-storage mandate to GDPR data minimisation + intermediary note
3. 📝 Reframe CQ Q2

---

### VEND-INT-019: Do not extract or log individual attribute values from presentations

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO `[intermediary, direct_saas]`** |
| **Rationale** | The no-extraction obligation applies to entities that handle attestation data but don't own the RP relationship. This includes both intermediaries AND SaaS vendors. |

**Why `[intermediary, direct_saas]` and not agnostic?**

| Architecture | Does the vendor see attestation content? | No-extraction obligation? |
|---|---|---|
| **Intermediary** | Yes — receives and forwards presentations | ✅ MUST NOT extract (Art 5b(10)) |
| **SaaS** | Yes — processes presentations on RP's behalf | ✅ SHOULD NOT extract (data processor under DPA) |
| **Self-hosted** | No — the RP's own system processes locally | ❌ RP decides what to do with its own data |

In the self-hosted model, the RP runs the vendor's software on its own
infrastructure. The RP controls what happens to attestation data — it might
legitimately need to extract attributes for its business logic. The vendor's
software is a tool, not a data handler.

In the intermediary and SaaS models, the vendor's infrastructure touches
attestation data. The vendor MUST NOT extract attributes for its own purposes —
it processes data on behalf of the RP under specific legal frameworks.

**Legal basis distinction:**
- For intermediaries: Art 5b(10) absolute prohibition
- For SaaS: GDPR data processor obligation (only process per instructions)
- For self-hosted: N/A — RP's prerogative

**CQ impact:**
- Q2 ("Are presentations treated as opaque payloads that cannot be decoded by the
  intermediary?") — should be "by the vendor"
- Q8 ("If the product offers value-added services (e.g., age verification) that
  require specific attribute inspection") — this is a relevant SaaS question too
  (some SaaS vendors offer age verification as a service)

**Action items:**
1. 🏷️ Change tag to `[intermediary, direct_saas]`
2. 📝 Add SaaS framing: data processor obligation, not just no-storage mandate
3. 📝 Generalize CQs from "intermediary" to "vendor"

---

### VEND-INT-020: Do not correlate or link user presentations across different RPs

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO `[intermediary, direct_saas]`** |
| **Rationale** | Cross-RP correlation risk exists for any multi-tenant service. Both intermediaries and SaaS vendors can serve multiple RPs and have a unique vantage point for cross-RP tracking. |

**Why `[intermediary, direct_saas]` and not agnostic?**

| Architecture | Serves multiple RPs? | Cross-RP correlation risk? |
|---|---|---|
| **Intermediary** | Yes — acts on behalf of multiple RPs | ✅ High risk — multi-tenant + data access |
| **SaaS** | Yes — serves multiple RP customers | ✅ High risk — multi-tenant + data access |
| **Self-hosted** | No — each deployment serves one RP | ❌ No cross-RP data exists in the system |

In the self-hosted model, each RP deploys its own instance. There is no shared
infrastructure where cross-RP correlation could occur. The vendor never sees
presentation data from multiple RPs in the same system.

**Explanation is substantively correct** but needs SaaS framing added. The
architectural isolation requirements (session, data, log, staff access) apply
equally to SaaS multi-tenant systems.

**CQ quality:** ✅ Already largely applicable to SaaS too:
- Q1 ("What technical and architectural controls prevent correlation...") — universal
- Q2 ("Are RP relationships logically isolated...") — applies to SaaS multi-tenancy
- Q8 ("What staff access controls prevent... querying across RP tenant boundaries") —
  key SaaS concern

**Action items:**
1. 🏷️ Change tag to `[intermediary, direct_saas]`
2. 📝 Add SaaS framing alongside intermediary in explanation
3. 📝 Minor CQ framing updates (replace "intermediary" with "vendor")

---

### VEND-INT-021: Delete attestation data immediately after forwarding to RP

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | This is the **purest intermediary obligation** in the entire VCQ. RPI_10 mandates immediate deletion after forwarding. This concept doesn't exist in SaaS or self-hosted. |

**Why not SaaS?**
In the SaaS model, data retention is governed by the Data Processing Agreement
between the vendor and the RP. The SaaS vendor processes data per the RP's
instructions, which may include short-term retention for:
- Session state management
- Audit trail creation
- Retry handling
- Transaction completion

The intermediary model is fundamentally different: Art 5b(10) creates an
**absolute prohibition on storage**, not a configurable retention policy.

**Why not self-hosted?**
The RP's own system controls data lifecycle. The RP decides when to delete data
based on its own data retention policies, GDPR obligations, and business needs.

**Unique characteristics of INT-021:**
1. "Immediately" — not "within a reasonable time" but **immediately**
2. "Completely" — secure erasure, not just logical deletion
3. "Even if forwarding fails" — no retry mechanisms that retain data
4. Applies to memory, swap, temp files, caches, logs — everything

**CQ quality:** ✅ Excellent — Q2 defines "immediately" (maximum time window), Q3
asks about secure memory APIs, Q4 addresses the forwarding failure scenario, Q5
covers volatile memory and swap prevention, Q8 addresses crash scenarios and core
dumps. All deeply intermediary-specific.

**Action items:** None — this is the gold standard for an intermediary-only requirement.

---

## Aggregate Findings

### Tag changes needed: **4 of 6**

| Requirement | Current | New | Reason |
|---|---|---|---|
| VEND-INT-016 | `[intermediary]` | `[]` (agnostic) | Key management is universal |
| VEND-INT-018 | `[intermediary]` | `[]` (agnostic) | Audit logging is universal |
| VEND-INT-019 | `[intermediary]` | `[intermediary, direct_saas]` | No-extraction applies to data handlers |
| VEND-INT-020 | `[intermediary]` | `[intermediary, direct_saas]` | Cross-RP correlation risk is multi-tenant |

### Tag confirmations: **2 of 6**

| Requirement | Tag | Why stays intermediary |
|---|---|---|
| VEND-INT-017 | `[intermediary]` | Signed verification results for cross-org non-repudiation |
| VEND-INT-021 | `[intermediary]` | RPI_10 immediate deletion — purest intermediary obligation |

### Explanation updates needed: **4 of 6** (INT-016, 018, 019, 020)

### CQ updates needed: **~4 CQs** (across INT-018, 019, 020)

### New architectural finding: The "data handler" test

This batch introduces a new heuristic alongside the "forwarding test" from Batch 3a:

> **The Data Handler Test:** If a requirement governs how a vendor handles
> attestation data it doesn't own, it applies to intermediary AND SaaS (both
> are data handlers for the RP). If the requirement assumes the RP controls
> its own data, it's NOT relevant to self-hosted.

Applied:
- INT-019 (no extraction) → data handler obligation → `[int, saas]` ✅
- INT-020 (no correlation) → data handler obligation → `[int, saas]` ✅
- INT-021 (immediate deletion) → **stronger than data handler** — legislative
  prohibition → `[intermediary]` only ✅

### Running totals

| Batch | Tag corrections | Cumulative |
|---|---|---|
| Batch 1 | 0 | 0 |
| Batch 2 | 0 | 0 |
| Batch 3a | 1 | 1 |
| Batch 3b | 7 | 8 |
| Batch 4a | 4 | **12** |
| **Total audited** | | **36 requirements** |

### Comparison across batches

| Metric | B1 | B2 | B3a | B3b | B4a |
|--------|----|----|-----|-----|-----|
| Tag changes | 0/9 | 0/7 | 1/7 | 7/7 | 4/6 |
| → agnostic | — | — | 1 | 7 | 2 |
| → `[int, saas]` | — | — | — | — | 2 |
| Explanation updates | 9 | 0 | 1 | 7 | 4 |
| Key finding | Text bias | All clean | Forwarding test | Capability pattern | **Data handler test** |
