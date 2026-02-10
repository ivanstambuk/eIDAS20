# Architecture Tag Audit — Batch 3a: VEND-INT Forwarding & Protocol

> **Audit date:** 2026-02-10
> **Auditor:** Architecture tag audit (Phase 5)
> **Scope:** 7 requirements — VEND-INT-001, 002, 003, 004, 005, 006, 014
> **Theme:** Intermediary forwarding semantics and protocol support

---

## Executive Summary

Batch 3a covers the **forwarding pipeline** — the request and response relay chain
between the RP, the intermediary, and the wallet. The central architectural question
is: **are these about intermediary-specific forwarding behaviour, or generic connector
capabilities?**

### The conceptual test

The key distinction rests on **"forwarding"** as a concept:

| Architecture | What happens to the presentation data? |
|---|---|
| **Intermediary** | Receives from wallet → verifies → **forwards** to a separate RP entity |
| **SaaS** | Receives from wallet → verifies → **delivers** to the RP (vendor IS the RP's infrastructure) |
| **Self-hosted** | RP's own software receives from wallet → verifies → **processes** locally |

"Forwarding" is a distinct operation that only makes sense when there are two separate
entities: the entity that receives data from the wallet (intermediary) and the entity
that ultimately uses it (RP). In SaaS, the vendor's service IS the RP's connector —
there's no "forwarding", just internal processing.

### Tag assessment summary

| # | ID | Current | Verdict | Rationale |
|---|------|---------|---------|-----------|
| 1 | INT-001 | `[int]` | ✅ Correct | Dual-identity display = two legal entities = intermediary-only |
| 2 | INT-002 | `[int]` | ✅ Correct | Request scope tied to intermediary's role as delegate |
| 3 | INT-003 | `[int]` | ✅ Correct | "Forwarding request without modification" = intermediary relay concept |
| 4 | INT-004 | `[int]` | ✅ Correct | "Forwarding response without modification" = intermediary relay concept |
| 5 | INT-005 | `[int]` | ⚠️ **CHANGE → agnostic** | Protocol support is a connector capability, not intermediary-specific |
| 6 | INT-006 | `[int]` | ✅ Correct | Conditional forwarding + routing isolation = intermediary obligation |
| 7 | INT-014 | `[int]` | ✅ Correct | Secure channel to a *separate* RP entity = intermediary topology |

**Tag changes: 1 of 7** — VEND-INT-005 should become agnostic (or `deploymentArchitectures: []`).

---

## Per-Requirement Audit

### VEND-INT-001: Display both intermediary and RP identity before requesting attestations

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | This is the VEND-INT mirror of VEND-CORE-011. Dual-identity display requires two legal entities (intermediary + intermediated RP). This concept doesn't exist in SaaS or self-hosted. |

**Duplication note:** This requirement overlaps significantly with VEND-CORE-011.
Both cover the same obligation (RPI_06/07 dual-identity display). The difference is:
- CORE-011 frames it as a contractual obligation ("display both identities")
- INT-001 frames it as a technical implementation ("how to populate RPRC_19a and access cert")

**Recommendation:** Flag for deduplication review in a later pass. Keep both for now,
as they serve different audiences (legal/compliance vs. technical implementation).

**CQ quality:** ✅ Excellent — 9 well-targeted CQs covering RPRC_19a population (Q1-Q2),
lifecycle (Q3), multi-RP handling (Q6), and wallet interoperability (Q9).

**Action items:** None for tags. Flag CORE-011/INT-001 overlap for future deduplication.

---

### VEND-INT-002: Ensure RP's intended data requests are accurately communicated to wallet

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | This is about the intermediary's obligation NOT to modify the RP's registered data request. The concept of "request scope guarantee" (RPI_06 + Art 5b(3)) is specifically about the intermediary acting as a faithful delegate. In SaaS, the RP controls its own request construction (the vendor's software builds the request per RP configuration, but it's the RP's own system). |

**Key distinction:**
- **Intermediary**: The RP tells the intermediary what to request → the intermediary
  must relay it faithfully without expansion or modification
- **SaaS/Self-hosted**: The RP configures its own connector → the software constructs
  requests per configuration, but there's no "relay" concept to protect

The "prohibited intermediary behaviours" (attribute expansion, suppression, modification)
are specific to the delegated authority model.

**CQ quality:** ✅ Excellent — Q2 probes the RPRC_21 wallet-side verification, Q6 asks
about role-based access controls preventing staff override, Q7 checks the architectural
allowlist design. All correctly scoped.

**Action items:** None.

---

### VEND-INT-003: Forward presentation requests without modification of requested attributes

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | "Forwarding" is the operative word. The requirement is about the technical relay mechanism preserving request integrity from the RP through the intermediary to the wallet. In SaaS, the connector IS the RP's system — it doesn't "forward" requests, it constructs and sends them directly. |

**Relationship to INT-002:** The explanation correctly distinguishes INT-002 (scope
constraint — only registered attributes) from INT-003 (forwarding integrity — exact
preservation of the technical payload). This is a good separation of concerns.

**CQ quality:** ✅ Excellent — Q5 specifically probes the RPI_06 three-component assembly
(access cert + registration cert + RPRC_19a), Q9 asks about end-to-end integrity
protection (JWS signing chain). All correctly scoped.

**Action items:** None.

---

### VEND-INT-004: Forward wallet presentations to RP without modification

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | The reverse direction of INT-003. "Forwarding presentations to RP" is an intermediary relay concept. In SaaS, the connector receives the presentation and processes it — there's no separate entity to forward to. The no-storage mandate (Art 5b(10)) and the conditional forwarding gate (RPI_08/09) are intermediary-specific. |

**Interesting CQ:** Q2 asks about a "sealed pipeline" design where the intermediary
cannot decode the payload. This is a genuinely intermediary-specific architectural
question — in SaaS, the connector NEEDS to decode the payload to deliver the
verification result to the RP.

**CQ quality:** ✅ Excellent — Q6 probes atomic all-or-nothing forwarding (RPI_08),
Q7 addresses the tension between verification (which requires decoding) and no-storage,
Q9 asks about the time window before RPI_10 deletion.

**Action items:** None.

---

### VEND-INT-005: Support both remote and proximity presentation protocols

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | See detailed analysis below. |

**This is the first tag correction in the audit.**

**Why it should be agnostic:**

Protocol support (OID4VP for remote, ISO 18013-5 for proximity) is a **connector
capability requirement** that applies regardless of deployment architecture:
- An intermediary connector must support OID4VP and/or ISO 18013-5
- A SaaS connector must support OID4VP and/or ISO 18013-5
- A self-hosted connector must support OID4VP and/or ISO 18013-5

The legal basis (IR 2024/2982 Art 5(1)) imposes the obligation on "wallet solutions"
and "wallet-relying parties" generically, not specifically on intermediaries.

**What about the intermediary-specific paragraph (lines 225-237)?**

The explanation contains intermediary-specific nuances:
- Proximity flows require hardware at the RP's physical locations
- The intermediary must perform RPI_09 verification on-site
- Remote flows require routing `response_uri` through the intermediary's infrastructure

These are implementation details that should be mentioned as **intermediary-specific
considerations** within a broader agnostic requirement, not as the sole framing.

**Duplication check:** VEND-CORE-040 (agnostic) already covers proximity identification
support. VEND-CORE-052 (agnostic) asks about proximity flow support as a gate question.
This makes INT-005 partially redundant with existing agnostic requirements.

**Recommendation:**
1. Change tag to `deploymentArchitectures: []` (agnostic)
2. Restructure explanation to be architecture-neutral with an intermediary-specific
   subsection noting the forwarding and hardware considerations
3. Cross-reference VEND-CORE-040 and VEND-CORE-052 for deduplication

**OR:** If we want to keep the intermediary.yaml focused, consider whether this
requirement should be **moved to core.yaml** as an agnostic requirement, with the
intermediary-specific considerations folded into the existing VEND-CORE-040/052.

**CQ impact:**
- Q4 ("What hardware is required for proximity presentation support at the RP's
  physical locations? Does the intermediary provide the hardware...") — intermediary-
  specific framing. Should be generalized.
- Q5 ("...response_uri callback routed through the intermediary's infrastructure") —
  intermediary-specific. In SaaS, the response_uri points to the vendor's infrastructure
  too.
- Q7 ("For proximity flows, how does the intermediary perform RPI_09 verification
  on-site...") — intermediary-specific framing.

**CQ action items:** 3 CQs need generalization if the tag changes.

**Action items:**
1. 🏷️ **Change tag** to `deploymentArchitectures: []` (agnostic)
2. 📝 Restructure explanation to be architecture-neutral
3. 📝 Generalize CQs Q4, Q5, Q7
4. 🔗 Cross-reference CORE-040 and CORE-052 for potential deduplication

---

### VEND-INT-006: Forward attributes only to the requesting RP after verification

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | This requirement combines three intermediary-specific obligations: (1) conditional forwarding gate (RPI_08/09), (2) routing isolation to the correct RP in a multi-tenant intermediary, and (3) immediate deletion after forwarding (RPI_10). All three are structurally tied to the intermediary model. |

**Why not SaaS?** In the SaaS model:
- There is no "forwarding" — the connector delivers the verification result directly
- There is no routing isolation concern — each SaaS deployment serves one RP
- There is no immediate deletion mandate — data retention is governed by the DPA

**CQ quality:** ✅ Excellent — Q1 asks about per-session RP binding, Q3 probes
multi-tenant isolation, Q7 addresses the forwarding failure + deletion interaction.
All correctly scoped.

**Action items:** None.

---

### VEND-INT-014: Ensure secure channel for transmission to RP

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** — but with a nuance worth noting |
| **Rationale** | The "secure channel for transmission to RP" describes the link between two separate entities: the intermediary and the RP backend. This link doesn't exist in self-hosted (RP processes locally). |

**Nuance — what about SaaS?**

In the SaaS model, the vendor's infrastructure does deliver data to the RP. Should
this requirement also apply to SaaS?

Analysis:
- In the **intermediary** model, the intermediary-to-RP link is a critical trust
  boundary. The intermediary is a separate legal entity forwarding sensitive data to
  the RP. TLS, mTLS, and application-layer protection are essential because this is
  an *inter-organisational* data transfer.
- In the **SaaS** model, the vendor's service and the RP's integration endpoint are
  typically connected via a standard API (webhook, REST callback). Security
  requirements exist but are covered by:
  - GDPR Article 32 (security of processing — VEND-CORE-008 area)
  - The DPA terms between vendor and RP
  - Standard cloud service security practices

The intermediary-specific character of INT-014 is:
1. The **RPI_08** framing — "forwarding" as a specific ARF concept
2. The **failure handling** — if channel fails, data must be deleted per RPI_10
3. The **inter-organisational trust** — two separate legal entities, not just vendor
   infrastructure delivering to its customer

**Verdict:** Keep as `[intermediary]`. The SaaS equivalent is covered by generic
security requirements (Article 32 GDPR). INT-014 adds the intermediary-specific
layer (RPI_08, RPI_10, inter-organisational trust).

**CQ quality:** ✅ Excellent — Q2 probes mTLS, Q4 addresses the channel failure +
RPI_10 deletion interaction, Q8 asks about multi-RP channel isolation. All correctly
scoped.

**Action items:** None for tags. Add a cross-reference note mentioning that SaaS
vendors have equivalent obligations under Article 32 GDPR.

---

## Aggregate Findings

### Tag changes needed: **1 of 7**

| Requirement | Current | New | Reason |
|---|---|---|---|
| VEND-INT-005 | `[intermediary]` | `[]` (agnostic) | Protocol support is a connector capability, not intermediary-specific |

### Explanation updates needed: **1 of 7** (INT-005)

INT-005's explanation needs restructuring from intermediary-specific to
architecture-neutral, with an intermediary-specific subsection.

### CQ updates needed: **3 CQs** (all in INT-005)

CQs Q4, Q5, Q7 in INT-005 need generalization from intermediary-specific framing.

### Duplication flags

| INT requirement | Potential CORE duplicate | Overlap |
|---|---|---|
| VEND-INT-001 | VEND-CORE-011 | Same obligation (RPI_06/07), different framing |
| VEND-INT-005 | VEND-CORE-040, VEND-CORE-052 | Protocol/proximity support covered by agnostic reqs |

### Key insight: The "forwarding" test

This batch confirms a useful architectural heuristic for the remainder of the audit:

> **The Forwarding Test:** If a requirement uses the word "forward" and describes
> the relay of data between two separate entities (intermediary → RP), it is
> likely intermediary-specific. If it describes a *capability* that any connector
> must have regardless of who receives the data, it is likely agnostic.

Applying this test:
- INT-001 (dual display) → intermediary ✅
- INT-002 (request scope) → intermediary (delegate authority) ✅
- INT-003 (forward requests) → intermediary (relay) ✅
- INT-004 (forward responses) → intermediary (relay) ✅
- INT-005 (protocol support) → **capability** → agnostic ⚠️
- INT-006 (conditional forwarding) → intermediary (relay + routing) ✅
- INT-014 (secure channel to RP) → intermediary (inter-org link) ✅

### Comparison across batches

| Metric | Batch 1 | Batch 2 | Batch 3a |
|--------|---------|---------|----------|
| Tag changes | 0/9 | 0/7 | **1/7** |
| Explanation updates | 9/9 | 0/7 | 1/7 |
| CQ updates | ~15 | 0 | 3 |
| Key finding | Text biased, tags correct | All clean | First tag correction; "forwarding test" heuristic |
