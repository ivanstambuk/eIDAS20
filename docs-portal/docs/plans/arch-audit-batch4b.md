# Architecture Tag Audit — Batch 4b: Formats, Certification & Disclosure

> **Audit date:** 2026-02-10
> **Auditor:** Architecture tag audit (Phase 5)
> **Scope:** 5 requirements — VEND-INT-022, 023, 024, 025, 026
> **Theme:** Presentation request construction, credential format support, selective disclosure, certification, disclosure policies

---

## Executive Summary

Batch 4b covers the **format and protocol capabilities** of the connector, plus
request construction and policy evaluation. The audit question for each: is this
about what a connector can *do* (capability → agnostic), or about the
intermediary's specific relationship to the RP (governance → intermediary)?

### Tag assessment summary

| # | ID | Current | Verdict | Rationale |
|---|------|---------|---------|-----------|
| 1 | INT-022 | `[int]` | ✅ **Correct** | RPRC_19a + RPI_05 dual-identity in request = intermediary delegation concept |
| 2 | INT-023 | `[int]` | ⚠️ **CHANGE → agnostic** | Credential format support is a universal connector capability |
| 3 | INT-024 | `[int]` | ⚠️ **CHANGE → agnostic** | Selective disclosure handling is a universal connector capability |
| 4 | INT-025 | `[int]` | ⚠️ **CHANGE → agnostic** | Cryptographic certification applies to all connectors |
| 5 | INT-026 | `[int]` | ⚠️ **CHANGE → agnostic** | Disclosure policy compliance is a connector capability |

**Tag changes: 4 of 5.**

---

## Per-Requirement Audit

### VEND-INT-022: Specify RP details in each presentation request to wallet

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | This is about the RPRC_19a extension and RPI_05 fields — the mechanism for embedding the *intermediated RP's* details into the intermediary's presentation request. This concept only exists in the intermediary model. |

**Why intermediary-only?**

| Architecture | How RP details appear in the request |
|---|---|
| **Intermediary** | Access cert identifies the intermediary; RPRC_19a extension carries the intermediated RP's details (RPI_05 fields a-e) |
| **SaaS** | Access cert identifies the RP directly (SaaS vendor holds the RP's cert); no RPRC_19a needed |
| **Self-hosted** | Access cert identifies the RP directly; no RPRC_19a needed |

The RPRC_19a extension is the *mechanism* by which the wallet knows it's dealing
with an intermediary rather than a direct RP. Only in the intermediary model does
the request contain two identities: the requester (intermediary) and the beneficiary
(intermediated RP).

**Relationship to INT-001 and CORE-011:**
- INT-001 / CORE-011: Wallet must *display* both identities (output side)
- INT-022: Intermediary must *include* both identities in the request (input side)
These are complementary, not duplicative.

**CQ quality:** ✅ Excellent — Q1 asks about RPRC_19a population, Q4 about multi-
use-case RP handling (dynamic d/e selection), Q5 about registration certificate
inclusion. All correctly scoped to the intermediary model.

**Action items:** None.

---

### VEND-INT-023: Support mandatory credential formats based on supported use cases

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | Credential format support (SD-JWT VC for remote, mDoc for proximity) is a fundamental connector capability mandated by IR 2024/2979 Art 8(1) and Annex II. Every connector must support the formats relevant to its use cases. |

**The explanation already acknowledges this:**
Line 1111: "Relying Party connectors and intermediaries must support the credential
formats relevant to their operational use cases." — The "and intermediaries" phrasing
shows the requirement applies to both.

**What's intermediary-specific?**
Lines 1119-1120: "The intermediary must verify SD-JWT VC signatures, validate
selective disclosures, and check key binding JWTs" — verification is covered
separately (INT-010, INT-012). The format support itself is agnostic.

**Duplication check:**
- VEND-INT-005 (already flagged → agnostic in Batch 3a) covers protocol support
- VEND-CORE-040 covers proximity identification
- VEND-CORE-052 asks about proximity flow support

INT-023 adds the specific format-level detail (SD-JWT VC mechanics, mDoc CBOR
structure) that the higher-level requirements don't cover. This is valuable
detail but architecture-neutral.

**CQ quality:** Q5 ("How does the intermediary route between SD-JWT-VC and mDoc
processing based on the incoming request format?") — should say "connector"
not "intermediary". All other CQs are architecture-neutral.

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Replace "intermediary" framing with "connector" in explanation
3. 📝 Generalize CQ Q5
4. 🔗 Cross-reference INT-005, CORE-040, CORE-052 for deduplication

---

### VEND-INT-024: Support selective disclosure in both credential formats

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | Selective disclosure verification (SD-JWT hash checking, mDoc MSO digest matching) is a protocol-level capability that any connector must implement. Art 5(4) IR 2024/2982 mandates this for all wallet-relying party interactions. |

**What's genuinely intermediary-specific?**
Lines 1214-1218: "The intermediary must forward exactly the disclosed subset to
the RP (per VEND-INT-004). It must not infer, reconstruct, or flag undisclosed
attributes."

This is a **forwarding constraint** (how the intermediary relays the selectively
disclosed subset), not a capability question (can the system handle selective
disclosure?). The capability is agnostic; the forwarding constraint is already
covered by INT-004 (correctly tagged as intermediary).

**Recommended restructure:**
- Frame the selective disclosure *verification* as agnostic
- Move the forwarding constraint paragraph to a cross-reference note pointing
  to INT-004

**CQ quality:** ✅ Already architecture-neutral. All CQs ask about format-level
technical implementation (hash verification, MSO checking, undisclosed claim
handling).

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Separate agnostic capability from intermediary forwarding constraint
3. 📝 Move forwarding paragraph to a cross-reference note

---

### VEND-INT-025: Consider certification for cryptographic components

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | Cryptographic certification (FIPS 140, Common Criteria, SOG-IS) applies to any connector that performs cryptographic operations. EU Cybersecurity Act (2019/881) applies to all ICT products, not specifically to intermediaries. |

**The explanation already acknowledges the conditional nature:**
Lines 1269-1273: "This is a risk-based requirement. Not all intermediaries will
require full certification, but the intermediary should be prepared to provide
certification evidence when requested."

Replace "intermediaries" with "connectors" and the statement is equally valid for
SaaS and self-hosted deployments. A high-assurance SaaS connector (e.g., for
banking/financial services) would face identical certification expectations.

**CQ quality:** ✅ Already architecture-neutral. All 9 CQs ask about certification
levels (Q1), libraries (Q2), roadmap (Q3), evidence (Q4), algorithm agility (Q5).
Only Q7 mentions "intermediary product" — minor framing fix.

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Replace "intermediary" with "connector" throughout
3. 📝 Fix CQ Q7 framing

---

### VEND-INT-026: Comply with embedded disclosure policies in attestations

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** — with a nuance |
| **Rationale** | Disclosure policy evaluation is a connector capability that any RP connector must support. IR 2024/2979 Art 10(3) requires wallet instances to verify RP compliance with disclosure policies — the connector's role is to enable this verification regardless of architecture. |

**The nuance: intermediary-specific policy evaluation**

In the intermediary model, the policy evaluation has an extra dimension:
- The connector evaluates the *intermediated RP's* registration against the policy
- This requires the intermediary to have the intermediated RP's registration data
  (category, purposes, jurisdiction) from a separate Registrar query

In the SaaS or self-hosted model, the connector evaluates the RP's own registration
against the policy — but the RP IS the entity in question, so its registration data
is locally available.

However, this architectural difference is an **implementation detail**, not a
fundamentally different capability. The core operation — "evaluate RP registration
against disclosure policy conditions" — is the same.

**Recommended restructure:**
- Frame as agnostic capability: evaluate RP compliance with disclosure policies
- Add intermediary note: "In the intermediary model, the intermediated RP's
  registration data must be obtained from the relevant Registrar."

**CQ quality:**
- Q2 ("What happens when the intermediated RP does not meet the disclosure policy
  conditions") — should say "the RP", not "intermediated RP"
- Q5 ("How do you obtain the intermediated RP's registration data...") —
  intermediary-specific framing but the question itself is about a legitimate
  intermediary concern. Could be generalized with an intermediary-specific variant.
- Q6 ("How does the disclosure policy check interact with the RPI_06 attribute
  scope check?") — the policy-attribute interaction is agnostic, but the RPI_06
  reference is intermediary-framed.

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Reframe as agnostic + intermediary note for Registrar query
3. 📝 Generalize CQs Q2, Q5


---

## Aggregate Findings

### Tag changes needed: **4 of 5**

| Requirement | Current | New | Reason |
|---|---|---|---|
| VEND-INT-023 | `[intermediary]` | `[]` (agnostic) | Credential format support is a capability |
| VEND-INT-024 | `[intermediary]` | `[]` (agnostic) | Selective disclosure is a capability |
| VEND-INT-025 | `[intermediary]` | `[]` (agnostic) | Cryptographic certification is universal |
| VEND-INT-026 | `[intermediary]` | `[]` (agnostic) | Disclosure policy evaluation is a capability |

### Tag confirmations: **1 of 5**

| Requirement | Tag | Why stays intermediary |
|---|---|---|
| VEND-INT-022 | `[intermediary]` | RPRC_19a dual-identity request construction |

### Explanation updates needed: **4 of 5**

### CQ updates needed: **~4 CQs** (across INT-023, 025, 026)

### Pattern confirmation: Capability vs. Governance

This batch reinforces the pattern from Batch 3b/4a:

- **INT-022** (request construction with dual identity) → **governance** → `[int]` ✅
- **INT-023–026** (format support, crypto, policies) → **capabilities** → agnostic ⚠️

### Running totals

| Batch | Tag corrections | Cumulative |
|---|---|---|
| Batch 1 | 0 | 0 |
| Batch 2 | 0 | 0 |
| Batch 3a | 1 | 1 |
| Batch 3b | 7 | 8 |
| Batch 4a | 4 | 12 |
| Batch 4b | 4 | **16** |
| **Total audited** | | **41 requirements** |

### Comparison across batches

| Metric | B1 | B2 | B3a | B3b | B4a | B4b |
|--------|----|----|-----|-----|-----|-----|
| Tag changes | 0/9 | 0/7 | 1/7 | 7/7 | 4/6 | 4/5 |
| → agnostic | — | — | 1 | 7 | 2 | 4 |
| → `[int, saas]` | — | — | — | — | 2 | — |
| Stays `[int]` | 9 | 7 | 6 | 0 | 2 | 1 |
| Key finding | Text bias | All clean | Forward test | Capability pattern | Data handler test | Format capabilities all agnostic |
