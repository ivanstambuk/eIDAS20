# Architecture Tag Audit — Batch 1: GDPR & Data Processing

> **Audit date:** 2026-02-10
> **Auditor:** Architecture tag audit (Phase 5)
> **Scope:** 9 requirements — VEND-CORE-002, 003, 007, 008, 009, 010, 012, 013, 014
> **Theme:** GDPR Article 28 data processor obligations

---

## Executive Summary

All 9 requirements are GDPR Article 28 data processor obligations. They regulate the
relationship between a **data controller** (the RP) and a **data processor** (the vendor)
when the vendor processes personal data on behalf of the RP.

### The key architectural question

**When does a vendor become a GDPR data processor?**

| Architecture | Vendor is data processor? | Why? |
|---|---|---|
| **Intermediary** | ✅ Yes (always) | Vendor receives, verifies, and forwards VP Tokens containing PIDs and attestation attributes. Even with the no-storage mandate (Art 5b(10)), transient processing is still "processing" under GDPR Art 4(2). |
| **Direct SaaS** | ✅ Yes (always) | VP Tokens transit the vendor's cloud infrastructure. Even though the RP's certificate is used, the vendor's systems handle personal data in transit. The vendor is a data processor. |
| **Direct Self-Hosted** | ⚠️ **It depends** | If the vendor provides software only and has **zero access** to production data (no telemetry, no remote support, no cloud-based key management), the vendor is NOT a data processor — it's a software licensor. **But this is rare in practice.** |

### The "self-hosted but still a processor" scenarios

Modern "self-hosted" products often include:
1. **Cloud management planes** — vendor dashboard to monitor deployment health
2. **Telemetry/analytics** — product sends usage metrics to vendor
3. **Cloud-based key management** — vendor provides HSM-as-a-Service even for on-prem
4. **Remote support access** — vendor engineers SSH into RP's systems
5. **Automatic update mechanisms** — vendor pushes patches that could access data
6. **License validation** — product phones home with deployment metadata

If ANY of these exist, the vendor may be a data processor even in a self-hosted model.

### Verdict

**Current tag `[intermediary, direct_saas]` is fundamentally correct** for all 9 requirements.
The self-hosted model genuinely differs — if the vendor has no access to personal data,
these GDPR processor obligations don't apply to the vendor (they apply to the RP itself
as controller, but that's the RP's own obligation, not a vendor evaluation question).

**However:** The explanations and CQs are heavily biased toward intermediary language
and need updating to also address the SaaS scenario. Additionally, a **clarification
question should be added** to probe whether "self-hosted" really means no vendor data access.

---

## Per-Requirement Audit

### VEND-CORE-002: Implement DPA meeting GDPR Art 28

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary, direct_saas]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | A DPA is only needed when the vendor is a data processor. In intermediary and SaaS models, the vendor processes personal data → DPA required. In self-hosted, if the vendor has no data access → no DPA needed (it's a software license agreement, not a processing agreement). |

**Explanation issues:**
- ❌ Line 55: "When intermediaries process personal data on behalf of the RP" — should say "When **the vendor** processes personal data on behalf of the RP" since this applies to SaaS too
- ❌ Line 57: "contract (DPA) between the controller (RP) and processor (intermediary)" — should say "processor (**vendor**)" — the parenthetical incorrectly narrows to intermediary
- ❌ Lines 73-75: "DPA must also specifically address the no-storage mandate... since these constraints are unique to wallet intermediation" — the no-storage mandate is intermediary-specific (Art 5b(10)), but in a SaaS model the DPA should address data transit, transient processing, and data deletion obligations instead

**CQ issues:**
- Q4: "Does the DPA specifically address the eIDAS Article 5b(10) no-storage mandate and the forward-only nature of intermediary data handling" — this is intermediary-only language. In SaaS, the DPA should address data transit security, response_uri handling, and VP Token processing rather than "forward-only" semantics.
- **Missing CQ for SaaS**: No question asks about SaaS-specific DPA provisions (data transit encryption, VP Token handling, response_uri implications, private key custody terms)

**Action items:**
1. 📝 Update explanation to be architecture-neutral with arch-specific paragraphs
2. 📝 Update CQ Q4 to cover both intermediary and SaaS DPA provisions
3. ➕ Consider adding a SaaS-specific CQ about DPA provisions for data-in-transit

---

### VEND-CORE-003: Provide audit rights to the RP

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary, direct_saas]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | Audit rights (Art 28(3)(h)) only apply when there's a controller-processor relationship. If vendor has no data access in self-hosted → no audit rights needed for data processing (though audit for software quality is a different matter). |

**Explanation issues:**
- ❌ Line 114: "processor (intermediary vendor)" — should say "processor (**vendor**)"
- ❌ Lines 123-130: The audit scope list is entirely intermediary-focused ("no-storage mandate", "forward-only architecture (RPI_08)", "data isolation between intermediated RPs"). For SaaS, audit scope should cover: VP Token handling in vendor infrastructure, TLS termination practices, data transit security, response_uri configuration, private key custody.

**CQ issues:**
- Q6: "Can the organization audit your compliance with the eIDAS no-storage mandate specifically" — intermediary-only. In SaaS, the audit question is about data transit handling and VP Token processing controls.
- **Missing CQ for SaaS**: No question asks about auditing data transit security, VP Token handling in vendor cloud, or response_uri domain controls.

**Action items:**
1. 📝 Update explanation to cover both intermediary and SaaS audit scopes
2. 📝 Update CQ Q6 or add parallel SaaS audit CQ

---

### VEND-CORE-007: Notify RP of data breaches

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary, direct_saas]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | Breach notification (Art 33(2)) is a processor obligation. If vendor has no data access in self-hosted → no breach notification obligation for the vendor (though vulnerability disclosure is a separate obligation). |

**Explanation issues:**
- ❌ Line 325: "the processor (intermediary)" — should say "processor (**vendor**)"
- ⚠️ Line 346: "In the EUDI Wallet intermediary context, breaches may involve" — should also cover SaaS-specific breach scenarios: compromise of vendor's infrastructure hosting RP's connector, interception of VP Tokens in vendor's cloud, unauthorized access to RP's private keys if vendor provides key custody.
- Lines 347-350: Breach scenarios are mostly intermediary-focused. SaaS has distinct breach scenarios (infrastructure compromise, cloud access control failure, multi-tenant data leakage).

**CQ issues:**
- Q8: "In the EUDI Wallet intermediation context" — intermediary-only. Should also cover SaaS breach scenarios.
- CQs are otherwise well-structured and architecture-neutral (Q1-Q7 work for both int and SaaS).

**Action items:**
1. 📝 Update explanation to include SaaS-specific breach scenarios
2. 📝 Update CQ Q8 to cover both intermediary and SaaS breach types

---

### VEND-CORE-008: Personnel bound by confidentiality

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary, direct_saas]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | Confidentiality obligation (Art 28(3)(b)) only applies if personnel can access personal data. In self-hosted with no vendor data access → N/A. |

**Explanation issues:**
- ❌ Lines 393-394: "In the EUDI Wallet intermediary context, confidentiality is particularly critical because personnel may have transient access to" — should also address SaaS context where personnel may have access to cloud infrastructure hosting RP data.
- Lines 395-398: Access scenarios are intermediary-focused ("PID attributes during forwarding"). In SaaS, the access concerns are different (cloud admin access, infrastructure debug access, SRE access to production logs).

**CQ issues:**
- Q8: "In the EUDI Wallet intermediation context, can you confirm that no individual employee can access both PID attribute content in transit and access certificate private keys simultaneously" — intermediary-only. In SaaS, the separation of duties question is about cloud infrastructure admin access vs. key management access.
- Q4: "handling of PID attributes and attestation content during forwarding operations" — intermediary-only language.

**Action items:**
1. 📝 Update explanation to cover SaaS personnel access scenarios
2. 📝 Update CQ Q4 and Q8 to be architecture-neutral or add SaaS variants

---

### VEND-CORE-009: Process data only on documented instructions

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary, direct_saas]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | Instruction-only principle (Art 28(3)(a)) is core to any controller-processor relationship. Only applies when vendor processes data. |

**Explanation issues:**
- ❌ Line 430: "imposes a fundamental limitation on the processor" — good, architecture-neutral
- ❌ Lines 448-455: "In the EUDI Wallet intermediary context, this principle is reinforced by the eIDAS Article 5b(10) no-storage mandate" — should have parallel SaaS paragraph. In SaaS, the instruction-only principle covers: what data the vendor's systems may process, whether VP Tokens may be logged/cached, scope of cloud monitoring, response_uri configuration authority.
- Line 450: "The intermediary must:" — should say "The vendor must:" with arch-specific details

**CQ issues:**
- Q7: "In the EUDI Wallet intermediation context, how does the instruction-only principle interact with the ARF forward-only architecture (RPI_08)?" — intermediary-only. In SaaS, the question is about the line between platform operations (monitoring, scaling) and data processing.
- Q3: Architecture-neutral and excellent — works for both models.

**Action items:**
1. 📝 Update explanation to include SaaS-specific instruction scope
2. 📝 Update CQ Q7 to cover both architectures

---

### VEND-CORE-010: Support data subject rights requests

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary, direct_saas]` |
| **Verdict** | ✅ **CORRECT** — but consider a nuance |
| **Rationale** | DSAR assistance (Art 28(3)(e)) is a processor obligation. In self-hosted, the RP handles DSARs directly using the software — but the SOFTWARE should still support DSAR functionality. |

**Important nuance:** This requirement is about the **vendor assisting the RP with DSARs**
— a processor obligation. But in the self-hosted model, the RP might still need the
**software** to have DSAR functionality (search, export, erasure capabilities). That's
a product capability question, not a processor obligation question.

**Should this be split?**
- Processor obligation (DSAR assistance): `[intermediary, direct_saas]` ✅
- Product capability (software supports DSAR workflows): `[]` agnostic

**Decision:** Keep as-is for now. The requirement text says "Support data subject rights
requests" which implies the vendor actively supports the RP, which is a processor role.
The product capability aspect could be a separate requirement in future.

**Explanation issues:**
- ❌ Lines 498-501: "In the EUDI Wallet intermediary context, the no-storage mandate... fundamentally limits the scope" — correct for intermediary, but for SaaS the data holding may be different (VP Tokens in transit, session data, response_uri data).
- Lines 506-512: "The vendor must provide" list is good and architecture-neutral.

**CQ issues:**
- Q2: "Given the no-storage mandate" — intermediary-specific. For SaaS, the question is about what data the vendor holds in its cloud infrastructure.
- Q8: "intermediated EUDI Wallet context where the intermediary may not have direct user relationships" — intermediary-only.
- Other CQs are reasonably architecture-neutral.

**Action items:**
1. 📝 Update explanation to address SaaS data scope
2. 📝 Update CQ Q2 and Q8 to cover SaaS scenario
3. 🤔 Consider future requirement for DSAR product capability (agnostic)

---

### VEND-CORE-012: Inform RP of legal requirements to process beyond instructions

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary, direct_saas]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | This is the second limb of Art 28(3)(a). Only relevant when vendor is a data processor who might receive legal demands for data access. In self-hosted → vendor has no data to produce. |

**Explanation issues:**
- ❌ Line 611: "In the EUDI Wallet intermediary context, this obligation intersects with the no-storage mandate" — should also cover SaaS where the vendor hosts data/infrastructure.
- Lines 614-618: Data categories are good but should include SaaS-specific items (VP Tokens in transit, cloud access logs, response_uri session data).

**CQ issues:**
- Q7: "In the EUDI Wallet intermediation context, given the no-storage mandate" — intermediary-only. For SaaS, the question is about data in the vendor's cloud.
- Other CQs (Q1-Q6, Q8) are architecture-neutral and work well for both models.

**Action items:**
1. 📝 Update explanation to include SaaS data scope
2. 📝 Update CQ Q7 to be architecture-neutral

---

### VEND-CORE-013: Obtain RP authorization before engaging sub-processors

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary, direct_saas]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | Sub-processor obligations (Art 28(2)) are processor obligations. In self-hosted → vendor doesn't use sub-processors for data processing (cloud infra is the RP's, not the vendor's). |

**Explanation issues:**
- ❌ Lines 675-680: "In the EUDI Wallet intermediary context, sub-processors may include" — this list is equally valid for SaaS (and more relevant for SaaS, since the vendor chooses the cloud infrastructure). Should be framed as "In any hosted model (intermediary or SaaS)" or similar.
- Line 646: "prohibits the processor from engaging another processor" — architecture-neutral, good.

**CQ issues:**
- Q1: "your EUDI Wallet intermediary service" — should say "your EUDI Wallet connector service" to be architecture-neutral.
- Q7: "In the EUDI Wallet intermediation context, do any sub-processors have access to PID attributes, attestation content, or access certificate private keys" — the question is valid for both models but specifically references "intermediation".
- Other CQs are well-structured and largely architecture-neutral.

**Action items:**
1. 📝 Update explanation context paragraph to cover both hosted models
2. 📝 Update CQ Q1 and Q7 to use architecture-neutral language

---

### VEND-CORE-014: Delete or return personal data at end of contract

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary, direct_saas]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | Data deletion/return (Art 28(3)(g)) is a processor obligation at contract end. In self-hosted → the RP has all data on its own infrastructure; the vendor has nothing to delete (unless support logs, telemetry data, etc.). |

**Explanation issues:**
- ❌ Line 726: "In the EUDI Wallet intermediary context, the no-storage mandate" — should also address SaaS where the vendor may hold more data (cloud infrastructure data, operational logs, session data, backup media).
- Lines 730-734: The data inventory is intermediary-focused. For SaaS, add: cloud infrastructure metadata, response_uri session data, TLS session logs, container/VM images, CDN cache data.

**CQ issues:**
- Q1: "Given the no-storage mandate (Art 5b(10))" — intermediary-specific premise. For SaaS, the inventory question is broader since the no-storage mandate doesn't apply.
- Other CQs are architecture-neutral and well-structured (Q2-Q9 work for both models).

**Action items:**
1. 📝 Update explanation to include SaaS data inventory at termination
2. 📝 Update CQ Q1 to be architecture-neutral

---

## Aggregate Findings

### Tag changes needed: 0 (all tags correct)

### Explanation updates needed: 9 of 9

All explanations use "intermediary" as the exclusive context. They need updating to:
- Replace "intermediary" with "vendor" in generic sentences
- Add SaaS-specific context paragraphs alongside intermediary context
- Keep intermediary-specific details (no-storage mandate, RPI_08) where appropriate
  but also cover SaaS equivalents (data transit, VP Token handling, key custody)

### CQ updates needed: ~15 individual questions across 9 requirements

Common pattern: questions that say "In the EUDI Wallet intermediation context" or
reference the "no-storage mandate" need parallel SaaS versions or architecture-neutral
phrasing.

### Missing CQ coverage

| Requirement | Missing dimension |
|---|---|
| VEND-CORE-002 | SaaS-specific DPA provisions (data transit, VP Token handling) |
| VEND-CORE-003 | SaaS audit scope (cloud infrastructure, TLS, response_uri) |
| VEND-CORE-010 | Product capability for DSAR (agnostic, future consideration) |

### Structural question: Self-hosted edge cases

VEND-CORE-048 (the gate question) asks vendors to declare their supported architectures.
The audit results suggest a new requirement or CQ should be added for **self-hosted vendors**:

> "If your product is deployed on-premise, does it include any cloud-connected
> components (telemetry, license validation, cloud key management, management
> dashboards, automatic updates) that would cause you to process personal data
> or transfer data outside the RP's infrastructure?"

If the answer is YES → the Batch 1 GDPR requirements SHOULD apply even though the
product is "self-hosted". This could be handled via:
- A CQ on VEND-CORE-051 (the self-hosted gate question)
- A note in the explanations of all 9 Batch 1 requirements
- A new agnostic requirement about cloud-connected components

### Recommendation

**Phase 5.7.3 scope for Batch 1:**
1. Update explanation text in all 9 requirements (change "intermediary" → "vendor" in generic sentences, add SaaS context)
2. Update ~15 CQs with architecture-neutral language
3. Add CQ to VEND-CORE-051 about self-hosted cloud connectivity
4. No tag changes needed
