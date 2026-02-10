# Architecture Tag Audit — Batch 5: Pseudonyms, Registration & GDPR Rights

> **Audit date:** 2026-02-10
> **Auditor:** Architecture tag audit (Phase 5)
> **Scope:** 8 requirements — VEND-INT-027, 028, 029, 030, 031, 032, 033, 034
> **Theme:** Pseudonym support, access certificates, data deletion, DPA reporting, contractual registration, status list verification

---

## Executive Summary

Batch 5 is the **final batch** of the intermediary.yaml audit. It covers a diverse
mix of connector capabilities (pseudonyms, status lists), intermediary-specific
obligations (dual certificates, contractual registration), and data handler
obligations (deletion relay, DPA preparedness).

### Tag assessment summary

| # | ID | Current | Verdict | Rationale |
|---|------|---------|---------|-----------|
| 1 | INT-027 | `[int]` | ⚠️ **CHANGE → agnostic** | WebAuthn pseudonym verification is a connector capability |
| 2 | INT-028 | `[int]` | ✅ **Correct** (with nuance) | RP-specific pseudonym scoping has intermediary-specific challenges |
| 3 | INT-029 | `[int]` | ⚠️ **CHANGE → agnostic** | Access certificate usage is a universal RP connector requirement |
| 4 | INT-030 | `[int]` | ⚠️ **CHANGE → `[intermediary, direct_saas]`** | TS7 deletion interface applies to all data handlers; relay is intermediary-specific |
| 5 | INT-031 | `[int]` | ⚠️ **CHANGE → `[intermediary, direct_saas]`** | DPA reporting preparedness applies to all data handlers |
| 6 | INT-032 | `[int]` | ✅ **Correct** | Dual-certificate inclusion is pure intermediary protocol |
| 7 | INT-033 | `[int]` | ✅ **Correct** | Contractual relationship registration is pure intermediary governance |
| 8 | INT-034 | `[int]` | ⚠️ **CHANGE → agnostic** | Attestation status list verification is a connector capability (duplicate of INT-011) |

**Tag changes: 5 of 8.**

---

## Per-Requirement Audit

### VEND-INT-027: Support WebAuthn specification for pseudonym generation

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | WebAuthn pseudonym verification is a protocol-level capability. IR 2024/2979 Art 14(1) and Annex V mandate WebAuthn support for all wallet-relying-party interactions, not specifically for intermediaries. |

**What's intermediary-specific?**
Lines 1379-1383: "The intermediary sees the pseudonym during verification but
must not store or correlate it across sessions (per the no-storage mandate). The
pseudonym should be treated with the same deletion requirements as attestation
data (per RPI_10)."

This is a **no-storage governance note**, not a capability difference. The
WebAuthn verification itself (ES256, authenticatorData, assertion signature)
is identical across architectures.

**Duplication check:** VEND-CORE-027 ("Support pseudonym attestations per TS9")
already covers pseudonym support as an agnostic requirement. INT-027 adds
WebAuthn implementation detail but the capability is the same.

**CQ quality:**
- Q6 ("How do you forward the verified pseudonym to the intermediated RP without
  associating it with any PID or attestation data?") — intermediary forwarding
  framing. Should be generalized.
- Q7 ("How do you handle WebAuthn challenge freshness — is the challenge generated
  by the intermediary, by the intermediated RP, or collaboratively?") — intermediary-
  specific question that IS legitimately interesting, but could be an intermediary
  note within an agnostic requirement.

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Separate capability from no-storage governance note
3. 📝 Generalize CQ Q6; keep Q7 as intermediary-specific variant
4. 🔗 Cross-reference VEND-CORE-027 for deduplication

---

### VEND-INT-028: Support relying-party-specific pseudonyms

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** — the intermediary creates a unique challenge here |
| **Rationale** | RP-specific pseudonym scoping has a genuinely intermediary-specific risk that doesn't exist in other architectures. |

**Why this is intermediary-specific:**

The key issue is on lines 1420-1432:
> "Because the intermediary operates on behalf of multiple RPs, it must ensure:
> - The RP ID used for pseudonym derivation is the **intermediated RP's** identifier,
>   not the intermediary's own identifier — otherwise all RPs behind the intermediary
>   would receive the same pseudonym, defeating unlinkability"

This is a **critical architectural risk** unique to intermediaries:

| Architecture | Risk of incorrect RP ID for pseudonym scoping |
|---|---|
| **Intermediary** | ⚠️ **HIGH** — if the intermediary ID is used instead of the intermediated RP ID, all RPs behind the intermediary share pseudonyms, breaking unlinkability |
| **SaaS** | ❌ N/A — the SaaS connector holds the RP's own certificate; the RP ID is always the RP's own ID |
| **Self-hosted** | ❌ N/A — the RP's own system uses its own ID |

The architecture creates a **misconfiguration risk** that only exists when an
intermediary serves multiple RPs. The no-storage and no-correlation obligations
(lines 1428-1432) reinforce this.

**CQ quality:** ✅ Excellent — Q1 directly probes the RP ID configuration, Q2 asks
about cross-RP correlation controls (intermediary sees multiple RP pseudonyms),
Q5 asks about the RP ID configuration during onboarding. All correctly scoped.

**Action items:** None — this is correctly intermediary-specific.

---

### VEND-INT-029: Use valid Wallet-Relying Party Access Certificate

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | Every RP connector needs a valid access certificate. RPA_01 applies to all Relying Party Instances, not just intermediaries. VEND-CORE-005 already covers this as an agnostic requirement. |

**What's intermediary-specific in the current explanation?**
Lines 1474-1480: "The intermediary's access certificate identifies the
**intermediary itself**, not the intermediated RP. The intermediated RP's identity
is conveyed via the RPRC_19a extension (per VEND-INT-022)."

This is an intermediary note about *how* the certificate is used alongside RPRC_19a,
not a different capability. The underlying requirement — "have a valid access
certificate and use it correctly" — is agnostic.

**Duplication:** This is essentially a duplicate of VEND-CORE-005 ("Maintain valid
RP Access Certificate") with intermediary-specific framing added. The CQs add
value (Q8 asks about the access cert vs RPRC_19a comparison), but the requirement
itself is a duplicate.

**Recommended action:** Mark as agnostic. In a future structural pass, consider
merging with VEND-CORE-005 and adding the intermediary-specific cert relationship
note.

**CQ quality:**
- Q8 ("How does the intermediary's access certificate identity relate to the
  RPRC_19a identity of the intermediated RP?") — good intermediary-specific question
  that should be preserved as a variant
- All other CQs are architecture-neutral (lifecycle, rotation, protocol presentation)

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Reframe as agnostic + intermediary note for RPRC_19a relationship
3. 🔗 Flag as duplicate of VEND-CORE-005 for future structural review

---

### VEND-INT-030: Implement TS7 data deletion request interface for GDPR Article 17

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO `[intermediary, direct_saas]`** |
| **Rationale** | The TS7 data deletion interface (DATA_DLT_07/08) applies to all RPs and data processors. However, the relay pattern is intermediary-specific. |

**Why `[intermediary, direct_saas]`?**

| Architecture | Deletion obligation |
|---|---|
| **Intermediary** | Must implement TS7 + relay deletion requests to the intermediated RP |
| **SaaS** | Must implement TS7 as a data processor under GDPR + execute deletions per DPA |
| **Self-hosted** | RP implements TS7 directly in its own system; vendor provides the software capability |

For self-hosted, the vendor provides the TS7 implementation as a software feature,
but the RP operates it — this is a software capability, not a vendor obligation.
For intermediary and SaaS, the vendor's infrastructure handles the deletion request
and is legally obligated to process it.

**Intermediary unique element:**
The relay pattern (lines 1542-1550) — where the intermediary receives a deletion
request from the wallet, authenticates the user, then *relays* to the intermediated
RP — is uniquely intermediary. SaaS vendors process deletion requests directly
under their DPA with the RP.

**Duplication:** VEND-CORE-021 already covers TS7 implementation as an agnostic
software capability. INT-030 adds the relay pattern specific to intermediary/SaaS.

**CQ quality:**
- Q5 ("How do you relay deletion requests to the intermediated RP?") — intermediary-
  specific relay question. Should generalize to cover SaaS vendor-to-RP
  communication too.
- Q3 ("Given the no-storage mandate, what data is actually subject to deletion?") —
  good question applicable to both intermediary and SaaS.

**Action items:**
1. 🏷️ Change tag to `[intermediary, direct_saas]`
2. 📝 Add SaaS framing (DPA-driven deletion, not relay)
3. 📝 Generalize CQ Q5
4. 🔗 Cross-reference VEND-CORE-021

---

### VEND-INT-031: Support user reporting to data protection authorities

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO `[intermediary, direct_saas]`** |
| **Rationale** | DPA reporting preparedness applies to any vendor that handles personal data. Both intermediaries and SaaS vendors may be named in user reports. |

**Why `[intermediary, direct_saas]`?**

| Architecture | Vendor visibility in DPA reports |
|---|---|
| **Intermediary** | ⚠️ Directly visible — intermediary identity shown in wallet consent flow |
| **SaaS** | ⚠️ Indirectly visible — SaaS vendor may be named as the data processor in complaints about the RP |
| **Self-hosted** | ❌ Vendor invisible — RP handles all DPA interactions; vendor is just a software provider |

Both intermediary and SaaS vendors need:
- Processes to respond to DPA inquiries
- Evidence of compliance (processing records)
- Contact information for regulatory purposes
- DPIA documentation

**Intermediary unique element:**
The dual-identity visibility (lines 1604-1612) — where the wallet shows both the
intermediary's and the RP's identity — is uniquely intermediary. Users may report
the intermediary specifically, creating a direct regulatory exposure.

For SaaS, the vendor is typically named in the RP's processing records (Art 30)
but not directly visible to the user. Still, DPA inquiries can reach the SaaS
vendor as a data processor.

**CQ quality:** ✅ Heavily intermediary-specific but substantively correct. CQs
Q5 ("distinguish between intermediary's and RP's responsibility") and Q6
("demonstrate compliance with no-storage mandate") are uniquely intermediary.
SaaS-specific CQs would need to be added if the tag widens.

**Action items:**
1. 🏷️ Change tag to `[intermediary, direct_saas]`
2. 📝 Add SaaS data processor framing alongside intermediary
3. 📝 Consider adding SaaS-specific CQ variants

---

### VEND-INT-032: Include intermediary access certificate and RP registration certificate

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | The dual-certificate structure (intermediary access cert + RP registration cert) is the **defining protocol mechanism** of the intermediary architecture. This concept doesn't exist in any other architecture. |

**This is the most structurally intermediary-specific requirement in the VCQ:**

| Architecture | Certificate structure in requests |
|---|---|
| **Intermediary** | Access cert (intermediary) + Registration cert (intermediated RP) |
| **SaaS** | Access cert (RP's cert held by the SaaS vendor) — single cert |
| **Self-hosted** | Access cert (RP's own cert) — single cert |

The RPI_06 dual-certificate assembly, the RPI_07/07a wallet verification flow,
and the RPRC_19a extension fields are all intermediary-specific protocol elements.

**Relationship to INT-022:** Complementary:
- INT-022: *What RP details* to include (RPI_05 fields)
- INT-032: *How to package* the certificates (RPI_06 protocol)

**CQ quality:** ✅ Excellent — all 9 CQs are deeply intermediary-specific (dual-cert
obtainment, missing cert handling, protocol-specific inclusion). Perfect scoping.

**Action items:** None — gold standard intermediary requirement.

---

### VEND-INT-033: Ensure intermediary-RP contractual relationship is registered

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ✅ **CORRECT** |
| **Rationale** | Contractual relationship registration (RPI_04, RPI_07a) is a pure intermediary governance obligation. Only intermediaries register relationships with RPs at Registrars. |

**Why not SaaS?**
In the SaaS model, the vendor has a commercial relationship with the RP (service
agreement, DPA), but this relationship is NOT registered at a Registrar. The SaaS
vendor doesn't register individual RPs — it holds the RP's access certificate
directly. There is no Registrar-mediated trust chain.

**Unique characteristics:**
- RPI_04: Legal evidence submission to Registrar
- RPI_07a: Wallet verification of registered relationship
- Onboarding lifecycle (contract → registration → certificate → operations)
- De-registration obligation when relationship ends

All of these are structurally impossible outside the intermediary model.

**CQ quality:** ✅ Excellent — Q1 asks about technical gates blocking unregistered
operations, Q4 about registration SLAs with Registrars, Q8 about detecting
revoked registrations. Deeply intermediary-specific.

**Action items:** None — gold standard intermediary requirement.

---

### VEND-INT-034: Support attestation status list verification mechanisms (recommended)

| Aspect | Assessment |
|--------|------------|
| **Current tag** | `[intermediary]` |
| **Verdict** | ⚠️ **CHANGE TO AGNOSTIC** |
| **Rationale** | Attestation status list verification (VCR_11/12/13) is a connector capability. This is a near-duplicate of VEND-INT-011 with more implementation detail. |

**Duplication analysis:**

| Aspect | INT-011 | INT-034 |
|---|---|---|
| **Focus** | Verify attestation revocation status (conceptual) | Support attestation status list mechanisms (implementation) |
| **HLRs** | VCR_12, VCR_13 | VCR_11, VCR_12, VCR_13 |
| **Obligation** | SHOULD | SHOULD |
| **Short-lived exception** | Not mentioned | VCR_01 exception (≤24h validity) |

INT-034 adds the VCR_01 short-lived attestation exception and more detail on the
two verification mechanisms (Status Lists vs. Revocation Lists). But the core
capability is the same as INT-011.

**Both should be agnostic** (INT-011 was already flagged in Batch 3b). Consider
merging in a future structural pass.

**CQ quality:** ✅ Already largely architecture-neutral. Q7 mentions "block
attribute forwarding to the RP per RPI_08" — intermediary forwarding framing.
All other CQs ask about mechanism support, caching, short-lived handling.

**Action items:**
1. 🏷️ Change tag to `deploymentArchitectures: []`
2. 📝 Replace "intermediary" framing with "connector"
3. 📝 Fix CQ Q7 forwarding framing
4. 🔗 Flag INT-011/INT-034 overlap for future merge

---

## Aggregate Findings

### Tag changes needed: **5 of 8**

| Requirement | Current | New | Reason |
|---|---|---|---|
| VEND-INT-027 | `[intermediary]` | `[]` (agnostic) | WebAuthn verification is a capability |
| VEND-INT-029 | `[intermediary]` | `[]` (agnostic) | Access certificate is universal (dup of CORE-005) |
| VEND-INT-030 | `[intermediary]` | `[int, saas]` | TS7 deletion for data handlers; relay is intermediary |
| VEND-INT-031 | `[intermediary]` | `[int, saas]` | DPA preparedness for data handlers |
| VEND-INT-034 | `[intermediary]` | `[]` (agnostic) | Status list verification is a capability (dup of INT-011) |

### Tag confirmations: **3 of 8**

| Requirement | Tag | Why stays intermediary |
|---|---|---|
| VEND-INT-028 | `[intermediary]` | RP-specific pseudonym scoping risk |
| VEND-INT-032 | `[intermediary]` | Dual-certificate protocol (RPI_06) |
| VEND-INT-033 | `[intermediary]` | Contractual relationship registration (RPI_04/07a) |

### Duplication flags

| INT requirement | CORE equivalent | Overlap |
|---|---|---|
| VEND-INT-027 | VEND-CORE-027 | Pseudonym support |
| VEND-INT-029 | VEND-CORE-005 | Access certificate |
| VEND-INT-030 | VEND-CORE-021 | TS7 data deletion |
| VEND-INT-034 | VEND-INT-011 | Revocation/status list verification |

### Explanation updates needed: **5 of 8**

### CQ updates needed: **~5 CQs**

---

## COMPLETE AUDIT SUMMARY

### Total requirements audited: **49**

| Source | Count |
|---|---|
| Batch 1 (core.yaml agnostic-tagged) | 9 |
| Batch 2 (core.yaml intermediary-tagged) | 7 |
| Batch 3a (intermediary.yaml forwarding) | 7 |
| Batch 3b (intermediary.yaml trust/verification) | 7 |
| Batch 4a (intermediary.yaml key-mgmt/privacy) | 6 |
| Batch 4b (intermediary.yaml formats/cert) | 5 |
| Batch 5 (intermediary.yaml pseudonym/reg/GDPR) | 8 |
| **Total** | **49** |

### Total tag corrections: **21 of 49** (43%)

| Change type | Count | Requirements |
|---|---|---|
| `[int]` → agnostic | 15 | INT-005, 007, 008, 009, 010, 011, 012, 013, 016, 018, 023, 024, 025, 026, 027, 029, 034 |
| `[int]` → `[int, saas]` | 4 | INT-019, 020, 030, 031 |
| Confirmed `[int]` | 13 | CORE-001, 004, 011, 016, 017, 018, 049; INT-001, 002, 003, 004, 006, 022, 028, 032, 033; INT-014, 017, 021 |
| Confirmed agnostic | 9 | Batch 1 (CORE-002, 003, 006, 007, 008, 009, 010, 012, 015) |

### Heuristics discovered

| Heuristic | Discovered in | Description |
|---|---|---|
| **Forwarding Test** | Batch 3a | Uses "forward" between two entities → intermediary; describes a capability any connector needs → agnostic |
| **Capability vs. Governance** | Batch 3b | Capability (can the system do X?) → agnostic; Governance (how is X managed?) → intermediary |
| **Data Handler Test** | Batch 4a | Governs vendor handling of RP data → `[int, saas]`; assumes RP owns its data → N/A for self-hosted |

### Structural recommendations for future pass

1. **Move agnostic INT requirements to core.yaml** — 15 requirements in
   intermediary.yaml are now tagged agnostic, creating a structural tension
2. **Merge duplicates** — INT-029/CORE-005, INT-027/CORE-027, INT-030/CORE-021,
   INT-034/INT-011, INT-001/CORE-011
3. **Add SaaS-specific CQs** — Where requirements widened to `[int, saas]`,
   add SaaS-specific clarification questions
