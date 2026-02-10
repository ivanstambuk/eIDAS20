# Architecture Tag Audit — Batch 2: Intermediary Registration & Identity

> **Audit date:** 2026-02-10
> **Auditor:** Architecture tag audit (Phase 5)
> **Scope:** 7 requirements — VEND-CORE-001, 004, 011, 016, 017, 018, 049
> **Theme:** Intermediary-specific registration, identity, and data handling obligations

---

## Executive Summary

Batch 2 covers requirements that are **structurally tied to the ARF Intermediary
architecture** — the legal concept of one Relying Party acting on behalf of another.
These involve:
- The no-storage mandate (Art 5b(10))
- Self-registration as an intermediary RP (RPI_01)
- Dual-identity wallet display (RPI_06/07)
- Per-RP registration at Registrars (RPI_03)
- Legal evidence of the intermediary-RP relationship (RPI_04)
- Delegated verification with conditional forwarding (RPI_08/09)
- Gate question describing intermediary procedures

### The key architectural question

**Do any of these obligations apply to SaaS or self-hosted vendors?**

| Requirement | Intermediary? | SaaS? | Self-hosted? | Rationale |
|---|---|---|---|---|
| No-storage mandate (CORE-001) | ✅ | ❌ | ❌ | Art 5b(10) explicitly targets "intermediaries acting on behalf of relying parties" |
| Register as intermediary RP (CORE-004) | ✅ | ❌ | ❌ | Only intermediaries register as a separate RP |
| Dual-identity display (CORE-011) | ✅ | ❌ | ❌ | Only relevant when two legal entities are involved |
| Register intermediated RPs (CORE-016) | ✅ | ❌ | ❌ | Only intermediaries register other RPs at Registrars |
| Legal evidence of RP relationship (CORE-017) | ✅ | ❌ | ❌ | Only intermediaries prove relationships with intermediated RPs |
| Verification as agreed with RP (CORE-018) | ✅ | ⚠️ **Nuanced** | ❌ | See detailed analysis below |
| Describe intermediary procedures (CORE-049) | ✅ | ❌ | ❌ | Gate question explicitly scoped to intermediary architecture |

### Verdict

**6 of 7 requirements are correctly tagged `[intermediary]` only.** These are
pure intermediary obligations rooted in the ARF Topic 52 "Relying Party
Intermediation" framework — they have no equivalent in SaaS or self-hosted models.

**CORE-018 (verification as agreed with RP) is the interesting one** — see detailed
analysis below.

---

## Per-Requirement Audit

### VEND-CORE-001: No-storage mandate

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | Article 5b(10) eIDAS explicitly addresses "intermediaries acting on behalf of relying parties" — this is the defining legal obligation of the intermediary architecture. The no-storage mandate has no equivalent in SaaS (where data retention is governed by the DPA) or self-hosted (where the RP controls its own data). |

**Explanation quality:** ✅ Excellent — clearly explains the absolute prohibition,
the ARF reinforcing HLRs (RPI_08, RPI_09, RPI_10), and the architectural controls
required. Well-scoped to the intermediary model.

**CQ quality:** ✅ Good — CQs are correctly scoped to intermediary (Q1 asks about
architectural enforcement of no-storage, Q7 about forwarding failures, Q8 about
data isolation across RPs per RPI_09). All 8 questions are relevant and well-phrased.

**Action items:** None — this requirement is correctly tagged, explained, and questioned.

---

### VEND-CORE-004: Register as RP indicating intermediary status

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | Only intermediaries register as a separate RP with intermediary-specific Annex I fields (point 14: indication of intermediary reliance, point 15: association to intermediated RPs). In SaaS and self-hosted models, the RP registers itself using its own legal identity — no intermediary indication needed. |

**Explanation quality:** ✅ Excellent — clearly distinguishes the legal framework
(eIDAS + IR 2025/848) from the ARF requirements (RPI_01, Topic 27). Covers
registration lifecycle, certificate issuance, and Annex I data fields. Well-scoped.

**CQ quality:** ✅ Good — Q5 specifically probes intermediary-specific Annex I fields
(points 14-15), Q8 covers cross-border scenarios. All 8 CQs are correctly scoped.

**Minor observation:** The explanation at line 190-192 mentions "the product should
support the full registration lifecycle via the TS5 REST API (see VEND-CORE-045)"
— this cross-reference is good. However, VEND-CORE-045 is an agnostic requirement
(all RPs register). The intermediary-specific aspect is the *content* of the
registration (Annex I pts 14-15), not the API itself.

**Action items:** None.

---

### VEND-CORE-011: Display both intermediary and RP identity to wallet users

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | Dual-identity display is the defining UX characteristic of the intermediary model. It requires two legal entities (intermediary + intermediated RP) to be identified to the wallet user. In SaaS and self-hosted, there is only one RP identity — no dual display needed. The mechanism (RPI_05/06/07, RPRC_19a extension) is entirely intermediary-specific. |

**Explanation quality:** ✅ Excellent — comprehensively covers the three RPI HLRs,
the RPRC_19a extension fields, and the wallet-side verification mechanism (RPI_07a).
Clear and well-scoped.

**CQ quality:** ✅ Excellent — Q1 asks about RPI_06/07 implementation, Q2 about
RPRC_19a fields, Q4 about RPI_05 input handling, Q6 about optional wallet-side
verification (RPI_07a). All 9 CQs are correctly intermediary-scoped.

**Action items:** None.

---

### VEND-CORE-016: Register each intermediated RP at the appropriate Registrar

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | This is a pure intermediary obligation (RPI_03). Only the intermediary registers other entities — in SaaS and self-hosted, the RP registers itself. The per-Member-State multi-Registrar obligation and the Annex I intermediary-specific fields (pts 14-15) are structurally tied to the intermediary model. |

**Explanation quality:** ✅ Excellent — clearly explains the per-RP, per-Member-State
obligation, the two registration elements (Registrar registration + optional
registration certificate), and the Annex I intermediary fields. Good cross-reference
to VEND-CORE-011 and RPI_07a for the trust chain dependency.

**CQ quality:** ✅ Excellent — Q1 probes geographic scope (which Registrars), Q2
handles Annex I data mapping, Q6 addresses the time gap between onboarding and
registration, Q7 covers cross-border coordination. All 9 CQs are correctly scoped.

**Action items:** None.

---

### VEND-CORE-017: Provide legal evidence of RP relationship when registering

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | RPI_04 requires the intermediary to provide legally valid evidence that the intermediated RP will use the intermediary's services. This concept doesn't exist in SaaS or self-hosted — there is no "intermediated RP" to provide evidence about. The two-party verification chain (intermediary provides evidence → Registrar verifies) is structurally intermediary-only. |

**Explanation quality:** ✅ Excellent — clearly explains the two-step chain (evidence
provision + Registrar verification), covers IR 2025/848 Art 6(3-4) verification
checks, and links to the wallet-side trust chain (RPI_07a).

**CQ quality:** ✅ Excellent — Q1 probes the forms of evidence by Member State, Q2
maps to the four Art 6(3) checks, Q5 tests end-to-end confidence in the trust
chain, Q7 covers multi-jurisdictional requirements. All 9 CQs are well-scoped.

**Action items:** None.

---

### VEND-CORE-018: Perform verification of attestations as agreed with RP

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **NEEDS DEEPER ANALYSIS** — current tag is defensible but the boundary is fuzzy |
| **Rationale** | See detailed analysis below. |

**This is the most nuanced requirement in Batch 2.** Let me break it down:

**What the requirement says:**
ARF HLR RPI_09 mandates that the intermediary SHALL verify attributes presented
by wallet units before forwarding them to the intermediated RP. The verification
has five dimensions: authenticity, revocation, device binding, user binding, and
wallet unit authenticity. The "as agreed" qualification means the intermediary and
each RP agree on which verifications the intermediary performs.

**Why it's currently `[intermediary]`:**
The requirement is framed around the intermediary's **delegated verification role** —
the intermediary verifies ON BEHALF OF the RP, before forwarding. The conditional
forwarding logic (if verification fails → don't forward) is intermediary-specific.

**But wait — doesn't SaaS also verify?**
Yes! A SaaS connector also verifies attestations. But there are key differences:

| Aspect | Intermediary verification | SaaS verification |
|--------|--------------------------|-------------------|
| **Legal framing** | RPI_09 delegated verification | Art 5b(9) RP responsibility |
| **Result** | Verified attributes forwarded to RP | Verification result delivered directly to RP |
| **Failure handling** | SHALL NOT forward (RPI_08) | RP decides (it sees the verification result) |
| **Configuration** | "As agreed" per-RP | RP controls its own configuration |
| **Trust model** | RP trusts intermediary's verification | RP's own system performs verification |

**Verdict justification:**
The intermediary verification requirement has a **distinct legal and architectural
character** from the generic verification requirements (which will be covered in
Batch 3b: VEND-INT-007 through 013 and Batch 6a: VEND-CORE-030). The key
differences are:
1. **Delegated authority** — the intermediary verifies as a delegate, not as the RP itself
2. **Conditional forwarding** — verification failure blocks forwarding (RPI_08 gate)
3. **Per-RP configuration** — the "as agreed" model creates a multi-tenant verification matrix
4. **Legal liability** — Art 5b(9) retains RP responsibility, creating an interesting liability question

The generic connector verification capabilities (signature validation, trust-list
checking, revocation status) are covered by agnostic requirements. This requirement
adds the **intermediary-specific governance layer** on top.

**Conclusion:** `[intermediary]` is correct. The verification **capability** is agnostic
(covered by CORE-030, INT-007 through 013). This requirement is about the
**intermediary-specific governance** of that verification (delegated, conditional,
per-RP configured).

**Explanation quality:** ✅ Excellent — clearly covers all five verification dimensions,
the "as agreed" qualification, and the conditional forwarding gate (RPI_08 interaction).

**CQ quality:** ✅ Good — Q1 maps to the five verification dimensions and per-RP
configurability, Q5 probes the conditional forwarding implementation. Only 6 CQs
(fewer than other requirements) but all well-targeted.

**Flag for cross-reference:** When we audit Batch 3b (trust-lists & verification,
INT-007 through 013), we need to clearly distinguish:
- **Capability** (can your system verify signatures, check revocation, etc.) → agnostic
- **Governance** (how is verification delegated, configured per-RP, gated on forwarding) → intermediary

**Action items:**
1. ✅ Tag is correct — no change
2. 📝 Add a note in the explanation cross-referencing the agnostic verification
   capabilities (CORE-030 and friends) to avoid confusion about scope
3. 🔗 Flag for Batch 3b audit: ensure INT-007 through 013 are correctly
   distinguished as capability (agnostic) vs. this requirement's governance (intermediary)

---

### VEND-CORE-049: Describe intermediary registration, dual-party display, and data forwarding procedures

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | This is a gate question explicitly scoped to the intermediary architecture. It's the intermediary companion to VEND-CORE-048 (agnostic gate) and VEND-CORE-050 (SaaS gate). The four areas it probes (registration, dual-party display, VP Token verification, immediate data deletion) are all intermediary-specific ARF Topic 52/53 obligations. |

**Explanation quality:** ✅ Good — covers the four key intermediary obligations with
ARF HLR references. The note about reference wallet implementation status (line
2635-2637) is a useful practical observation.

**CQ quality:** ✅ Good — 4 focused CQs mapping directly to the four areas in the
requirement. Appropriately concise for a gate question (CORE-048 also has 4 CQs).

**Structural note:** VEND-CORE-049 is a companion to:
- VEND-CORE-048 (agnostic gate — "declare supported architectures")
- VEND-CORE-050 (SaaS gate — "describe SaaS data path, response_uri, key custody")
- VEND-CORE-051 (self-hosted gate — "describe on-premise deployment")

This trio+gate pattern is well-designed. Each architecture-specific gate question
probes the distinctive characteristics of that architecture.

**Action items:** None.

---

## Aggregate Findings

### Tag changes needed: **0** (all 7 tags correct)

This batch is correctly tagged — all 7 requirements are genuinely intermediary-only
obligations with no equivalent in SaaS or self-hosted architectures.

### Explanation updates needed: **0 of 7**

Unlike Batch 1 (where explanations were intermediary-biased despite `[int, saas]`
tags), Batch 2 explanations are correctly scoped to the intermediary architecture.
Since the tags ARE `[intermediary]` only, the intermediary-specific language is
appropriate and expected.

### CQ updates needed: **0**

All CQs are correctly scoped to intermediary obligations.

### Key insight: CORE-018 cross-reference flag

The most important finding is the **distinction between verification capability
(agnostic) and verification governance (intermediary)**:

| Concern | Requirement(s) | Tag |
|---------|---------------|-----|
| **Can** the system verify signatures? | CORE-030, INT-007–013 | Agnostic (expected) |
| **How** is verification delegated and governed per-RP? | CORE-018 | `[intermediary]` ✅ |

This distinction must be preserved when we audit Batch 3b. If INT-007 through 013
become agnostic (as expected), CORE-018 should NOT be pulled along — its governance
layer is genuinely intermediary-specific.

### Comparison with Batch 1

| Metric | Batch 1 | Batch 2 |
|--------|---------|---------|
| Tag changes | 0 | 0 |
| Explanation updates | 9/9 | 0/7 |
| CQ updates | ~15 | 0 |
| Overall quality | Tags correct, text biased | Tags and text both correct |

**Batch 2 is in much better shape** because the requirements ARE intermediary-only
(matching their tags), so the intermediary-specific language is appropriate.
