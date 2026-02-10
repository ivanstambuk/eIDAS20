# Architecture Tag Audit — Batch 3b: Trust-Lists & Verification

> **Audit date:** 2026-02-10
> **Auditor:** Architecture tag audit (Phase 5)
> **Scope:** 7 requirements — VEND-INT-007, 008, 009, 010, 011, 012, 013
> **Theme:** Trust anchor management, signature validation, revocation, device binding, replay prevention

---

## Executive Summary

Batch 3b is the **verification capability stack** — the seven building blocks that
any RP connector needs to accept and validate wallet presentations. The central
question is: **are these intermediary-specific, or generic connector capabilities?**

### The capability test

| Capability | Does an intermediary need this? | Does a SaaS connector need this? | Does a self-hosted connector need this? |
|---|---|---|---|
| Maintain Trusted Lists for PID Providers | ✅ | ✅ | ✅ |
| Maintain Trusted Lists for Attestation Providers | ✅ | ✅ | ✅ |
| Use only official trust sources | ✅ | ✅ | ✅ |
| Validate attestation signatures | ✅ | ✅ | ✅ |
| Check revocation status | ✅ | ✅ | ✅ |
| Verify device binding | ✅ | ✅ | ✅ |
| Prevent replay attacks | ✅ | ✅ | ✅ |

**Every single capability is architecture-agnostic.** A SaaS connector running on
Sproof's infrastructure needs Trusted Lists just as much as an intermediary connector.
A self-hosted Lissi Docker deployment needs signature validation just as much.

### Tag assessment summary

| # | ID | Current | Verdict | Rationale |
|---|------|---------|---------|-----------|
| 1 | INT-007 | `[int]` | ⚠️ **CHANGE → agnostic** | Trusted List maintenance is a connector capability |
| 2 | INT-008 | `[int]` | ⚠️ **CHANGE → agnostic** | Trusted List maintenance is a connector capability |
| 3 | INT-009 | `[int]` | ⚠️ **CHANGE → agnostic** | Trust source integrity is a connector capability |
| 4 | INT-010 | `[int]` | ⚠️ **CHANGE → agnostic** | Signature validation is a connector capability |
| 5 | INT-011 | `[int]` | ⚠️ **CHANGE → agnostic** | Revocation checking is a connector capability |
| 6 | INT-012 | `[int]` | ⚠️ **CHANGE → agnostic** | Device binding verification is a connector capability |
| 7 | INT-013 | `[int]` | ⚠️ **CHANGE → agnostic** | Replay prevention is a connector capability |

**Tag changes: 7 of 7** — ALL should become agnostic.

### Cross-reference with VEND-CORE-030

VEND-CORE-030 ("Verify attestation authenticity and validity before acceptance")
already exists as an agnostic requirement (no `deploymentArchitectures` field)
covering the same OIA_12-16 obligations at a high level. The 7 INT requirements
in this batch are **detailed breakdowns** of what CORE-030 aggregates.

This creates two options:
1. **Make all 7 agnostic** (in intermediary.yaml) — accept that intermediary.yaml
   contains some agnostic requirements that provide more detail than core.yaml
2. **Merge into core.yaml** and delete from intermediary.yaml — but this is a
   larger structural change beyond the tag audit scope

**Recommendation:** Change tags to agnostic now, flag for structural review later.

---

## Per-Requirement Audit

### VEND-INT-007: Maintain up-to-date Trusted Lists for PID Providers

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | Trusted List maintenance is a fundamental RP connector capability mandated by Art 22 eIDAS and OIA_12. Every connector — intermediary, SaaS, or self-hosted — must maintain PID Provider trust anchors to validate PID signatures. |

**What's intermediary-specific in the current explanation?**
Lines 345-349: "Because intermediaries serve multiple RPs potentially operating
across different Member States, they may need to maintain Trusted Lists from all
27 Member States simultaneously, rather than only the subset relevant to a single
RP's market."

This is a valid intermediary nuance, but:
- A SaaS connector serving pan-European customers has the same multi-Member-State need
- A self-hosted connector deployed in a multinational could need the same
- The **capability** (maintain Trusted Lists) is agnostic; the **scale** (how many) varies

**Explanation update needed:**
- Remove "The intermediary must" framing → "The connector must"
- Keep the multi-Member-State note but frame it as a scale consideration for
  any multi-market deployment, not intermediary-specific

**CQ impact:**
- Q5 ("Which Member States' Trusted Lists do you currently support? Since
  intermediaries may serve RPs across multiple Member States...") — replace
  "intermediaries" with architecture-neutral framing
- All other CQs are already capability-focused and need no change

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Reframe explanation from intermediary to architecture-neutral
3. 📝 Generalize CQ Q5

---

### VEND-INT-008: Maintain up-to-date Trusted Lists for Attestation Providers

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | Same reasoning as INT-007. Attestation Provider Trusted Lists (QEAA, PuB-EAA, EAA) must be maintained by any connector that accepts attestations, regardless of deployment architecture. OIA_13/14/15 apply to all RPs. |

**Explanation already architecture-neutral in substance:** The explanation covers
the three attestation types (QEAA/PuB-EAA/EAA) and their respective validation
requirements. The framing uses "the intermediary" but the content is generic.

**CQ quality:** ✅ Already largely architecture-neutral. Minor framing fix needed
(replace "intermediary" with "connector" or "product").

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Replace "intermediary" framing with "connector" in explanation
3. 📝 Minor CQ framing updates (cosmetic)

---

### VEND-INT-009: Obtain trust anchors only from official Trusted List sources

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | Trust source integrity is a fundamental security requirement for any connector. Art 22 eIDAS and OIA_14 require trust anchors from official sources, regardless of who operates the connector. A SaaS vendor that used unofficial trust sources would be equally non-compliant. |

**Explanation already architecture-neutral in substance:** The prohibited practices
(third-party aggregators, manual imports, hardcoded anchors) apply equally to all
architectures. The chain of trust (LOTL → Member State TL → Provider → Attestation)
is the same for everyone.

**CQ quality:** ✅ Already architecture-neutral. All 9 CQs ask about supply chain
security, verification mechanisms, and operational controls — none are
intermediary-specific.

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Replace "intermediary" framing with "connector" in explanation (minor)

---

### VEND-INT-010: Validate attestation signatures using official trust anchors

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | Signature validation is the most fundamental verification operation. OIA_12/13 mandate it for all RPs. A SaaS connector or self-hosted connector that couldn't validate signatures would be useless. |

**Intermediary-specific content in current explanation:**
Lines 481-484: "Attestation authenticity verification is the first check in the
RPI_09 verification gate. Without a valid signature, no attributes may be
forwarded to the RP (per RPI_08)."

The RPI_08/09 forwarding framing is intermediary-specific (the "verification gate"
that controls forwarding). But the **capability** (validate signatures) is agnostic.

**Recommended restructure:**
- Frame as a generic RP verification obligation (Art 5b(9))
- Add an intermediary note: "For intermediaries, signature validation is also a
  prerequisite for the RPI_08/09 forwarding gate — see VEND-CORE-018."

Lines 498-504 ("Rejection handling") mention "the intermediary must... immediately
delete all received attestation data (per RPI_10)" — the RPI_10 deletion is
intermediary-specific. In agnostic framing, rejection handling should be
architecture-neutral (reject the presentation, return error to the consumer),
with an intermediary note for the deletion obligation.

**CQ quality:** Q9 ("When signature verification fails, what information is logged...
without logging any attestation content (per no-storage mandate)") — the no-storage
mandate is intermediary-specific. Should be reframed as a general data minimisation
question with an intermediary note.

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Separate capability (signature validation) from governance (RPI_08/09 gate)
3. 📝 Reframe rejection handling as architecture-neutral + intermediary note
4. 📝 Reframe CQ Q9

---

### VEND-INT-011: Verify attestation revocation status before acceptance (recommended)

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | Revocation checking (VCR_12/13) applies to all RPs that accept attestations. The mechanisms (Status Lists, Revocation Lists) are protocol-level features, not architecture-specific. |

**Intermediary-specific content:**
- "Revocation checking must not log individual attestation identifiers, as this
  could create a tracking vector (no-storage mandate applies)" — The no-storage
  mandate is intermediary-specific, but the privacy concern (don't create tracking
  vectors) applies broadly under GDPR.
- "If the intermediary and RP agree that revocation checking is required (per RPI_09
  agreement scope)" — The RPI_09 agreement scope is intermediary-specific, but the
  SHOULD/MUST configuration flexibility is generic.

**CQ quality:** Q7 ("How does revocation checking interact with the no-storage
mandate?") — should be reframed as a general data minimisation question.

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Reframe from intermediary to architecture-neutral
3. 📝 Replace no-storage mandate references with GDPR data minimisation + intermediary note
4. 📝 Reframe CQ Q7

---

### VEND-INT-012: Verify the wallet unit's device binding

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | Device binding verification (mDoc deviceAuth, SD-JWT KB-JWT) is a protocol-level verification that any connector must perform. A SaaS connector or self-hosted connector needs to verify device binding identically. |

**Intermediary-specific content:**
Lines 604-607: "If device binding verification fails, the intermediary SHALL NOT
forward any attributes (per RPI_08)."

The failure handling follows the same pattern as INT-010: the **capability** (verify
device binding) is agnostic; the **governance** (conditional forwarding gate) is
intermediary-specific and already covered by VEND-CORE-018.

**CQ quality:** ✅ Already largely architecture-neutral — Q1-Q3 ask about technical
implementation, Q5-Q6 about format-specific verification. No intermediary-specific
framing in CQs.

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Separate capability from intermediary governance in explanation
3. 📝 CQs are already clean

---

### VEND-INT-013: Verify presentation freshness and prevent replay attacks

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | Replay prevention is a fundamental security requirement for any presentation protocol implementation. Art 5b(9) mandates it for all RPs. Nonce management, timestamp validation, and session binding are protocol-level mechanisms that apply regardless of deployment architecture. |

**Intermediary-specific content:**
- "Combined with device binding (RPI_09):" — The RPI_09 framing is intermediary-
  specific, but the combination of freshness + device binding is a universal security
  property.

**CQ quality:**
- Q7 ("How does the nonce store interact with the no-storage mandate?") —
  intermediary-specific framing. Should be reframed as a general data minimisation
  question.
- All other CQs are architecture-neutral (nonce generation, timestamp validation,
  session binding, distributed nonce stores).

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Separate capability from RPI_09 governance framing
3. 📝 Reframe CQ Q7

---

## Aggregate Findings

### Tag changes needed: **7 of 7** ⚠️

This is the highest-impact batch so far. All 7 requirements are **verification
capabilities** that apply to any RP connector regardless of deployment architecture.

| Requirement | Current | New | Reason |
|---|---|---|---|
| VEND-INT-007 | `[intermediary]` | `[]` | Trusted List maintenance is a capability |
| VEND-INT-008 | `[intermediary]` | `[]` | Trusted List maintenance is a capability |
| VEND-INT-009 | `[intermediary]` | `[]` | Trust source integrity is a capability |
| VEND-INT-010 | `[intermediary]` | `[]` | Signature validation is a capability |
| VEND-INT-011 | `[intermediary]` | `[]` | Revocation checking is a capability |
| VEND-INT-012 | `[intermediary]` | `[]` | Device binding verification is a capability |
| VEND-INT-013 | `[intermediary]` | `[]` | Replay prevention is a capability |

### Explanation updates needed: **7 of 7**

All explanations use "the intermediary" framing and need to be reframed as
architecture-neutral, with intermediary-specific notes where governance
(RPI_08/09/10) is mentioned.

### CQ updates needed: **~5 CQs** across 5 requirements

Most CQs are already capability-focused. Only CQs that reference intermediary-
specific concepts (no-storage mandate, RPI_09 agreement scope, forwarding) need
reframing.

### The capability vs. governance pattern (confirmed)

This batch confirms the pattern discovered in Batch 2 (VEND-CORE-018) and Batch 3a:

| Layer | What it covers | Tag | Examples |
|---|---|---|---|
| **Capability** | Can the system do X? | Agnostic | Validate signatures, check revocation, verify device binding |
| **Governance** | How is X managed/gated in the intermediary model? | `[intermediary]` | RPI_08 forwarding gate, RPI_09 agreed verification, RPI_10 deletion |

The 7 requirements in this batch are all **capability-layer** — they describe
what any connector must be able to do. The intermediary-specific **governance
layer** (how these capabilities are orchestrated within the RPI_08/09/10
framework) is already covered by VEND-CORE-018 and VEND-INT-006.

### Structural question: Should these stay in intermediary.yaml?

With all 7 becoming agnostic, these requirements are now in a file called
`intermediary.yaml` but tagged as architecture-agnostic. This creates a structural
tension:

**Option A: Leave in intermediary.yaml with agnostic tags**
- ✅ Minimal change, preserves file structure
- ❌ Confusing: agnostic requirements in an "intermediary" file

**Option B: Move to core.yaml and merge with VEND-CORE-030**
- ✅ Structurally clean: capabilities in core, intermediary-specific in intermediary
- ❌ Larger change beyond tag audit scope; could break cross-references

**Recommendation:** Option A for now (change tags only). Flag Option B as a
structural improvement for a dedicated refactoring pass.

### Comparison across batches

| Metric | Batch 1 | Batch 2 | Batch 3a | Batch 3b |
|--------|---------|---------|----------|----------|
| Tag changes | 0/9 | 0/7 | 1/7 | **7/7** |
| Explanation updates | 9/9 | 0/7 | 1/7 | 7/7 |
| CQ updates | ~15 | 0 | 3 | ~5 |
| Key finding | Text biased | All clean | Forwarding test | **All agnostic — capability vs. governance confirmed** |

### Running total of tag corrections

| Batch | Corrections |
|---|---|
| Batch 1 | 0 |
| Batch 2 | 0 |
| Batch 3a | 1 (INT-005 → agnostic) |
| Batch 3b | 7 (INT-007–013 → agnostic) |
| **Total** | **8 corrections out of 30 requirements audited** |
