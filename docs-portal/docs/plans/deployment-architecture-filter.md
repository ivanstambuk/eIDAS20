# Deployment Architecture Filter — Implementation Plan

> **Created:** 2026-02-10  
> **Status:** Phase 2 in progress (Phase 1 complete, Phase 2: 5/6 tasks done)  
> **Decision:** DEC-TBD  
> **Scope:** VCQ requirements (core.yaml), clarification questions, build pipeline, UI  
> **Background:** [RP Deployment Architectures](./rp-deployment-architectures.md)

---

## 1. Context & Problem Statement

### 1.1 Background

The ARF defines two orthogonal dimensions for how a vendor's product integrates a
Relying Party with EUDI Wallet Units:

1. **Legal role** — Intermediary (vendor's own certificate, ARF RPI_01–RPI_10) vs.
   Direct RP Instance (RP's own certificate).
2. **Hosting model** — SaaS (vendor-hosted) vs. Self-hosted (RP-hosted). Only
   relevant for the Direct RP Instance model, because when a vendor operates as an
   intermediary, the hosting is the vendor's internal concern — not the RP's.

This produces three practical deployment architectures:

| Value | Label | Description |
|-------|-------|-------------|
| `intermediary` | **Intermediary** | Vendor registers as a separate RP with its own access certificate (RPI_01). Wallet shows dual-party display (RPI_07). Vendor forwards attributes after verification (RPI_09) and deletes data immediately (RPI_10). Hosting is the vendor's concern. |
| `direct_saas` | **Direct SaaS** | Vendor hosts managed wallet-connector infrastructure in its cloud. RP's own certificates are used. Wallet sees only the RP. VP Tokens transit vendor infrastructure (GDPR data processor role). |
| `direct_onprem` | **Direct Self-Hosted** | Vendor provides deployable software (Docker, Helm, etc.) that the RP operates on its own infrastructure. RP's certificates stay on RP's infrastructure. No personal data transits third-party infrastructure. |

### 1.2 Problem

1. **VEND-CORE-048** was created as a single monolithic requirement with 5 oversized
   clarification questions (each containing 3-4 sub-questions). The questions are
   too large for a flat web form.

2. **Many existing VCQ requirements are architecture-dependent** but are not tagged
   as such. For example, VEND-CORE-001 ("Intermediaries shall not store data…") is
   clearly intermediary-only, but it shows for all vendor selections.

3. **There is no filtering mechanism** in the VCQ UI for deployment architectures.
   The RCA page has secondary filtering (by role), but the VCQ page does not.

4. **Architecture-specific requirements and questions lack visual annotation** —
   a vendor reading a requirement cannot easily tell which deployment architecture
   it applies to.

### 1.3 Existing state of VEND-CORE-001 through VEND-CORE-018

These early requirements were created before role/productCategory tagging was
implemented. They are all `isUniversal=True` (empty `roles` and `productCategories`
arrays), meaning they appear for ALL filter selections. Several are intermediary-
specific but not scoped:

| ID | Requirement | Architecture tag |
|----|------------|------------------|
| VEND-CORE-001 | Intermediaries shall not store data about the content of transactions | `[intermediary]` |
| VEND-CORE-002 | Implement a Data Processing Agreement meeting GDPR Article 28 requirements | `[intermediary, direct_saas]` |
| VEND-CORE-003 | Provide audit rights to the Relying Party | `[intermediary, direct_saas]` |
| VEND-CORE-004 | Register as a Relying Party indicating intermediary status | `[intermediary]` |
| VEND-CORE-005 | Maintain a valid Relying Party Access Certificate | `[]` (agnostic) |
| VEND-CORE-006 | Implement appropriate technical and organizational security measures | `[]` (agnostic) |
| VEND-CORE-007 | Notify the RP of data breaches without undue delay | `[intermediary, direct_saas]` |
| VEND-CORE-008 | Ensure personnel are bound by confidentiality | `[intermediary, direct_saas]` |
| VEND-CORE-009 | Process personal data only on documented instructions | `[intermediary, direct_saas]` |
| VEND-CORE-010 | Support data subject rights requests | `[intermediary, direct_saas]` |
| VEND-CORE-011 | Display both intermediary and RP identity to wallet users | `[intermediary]` |
| VEND-CORE-012 | Inform the RP of legal requirements to process beyond instructions | `[intermediary, direct_saas]` |
| VEND-CORE-013 | Obtain RP authorization before engaging sub-processors | `[intermediary, direct_saas]` |
| VEND-CORE-014 | Delete or return personal data at end of contract | `[intermediary, direct_saas]` |
| VEND-CORE-016 | Register each intermediated RP at the appropriate Registrar | `[intermediary]` |
| VEND-CORE-017 | Provide legal evidence of RP relationship when registering | `[intermediary]` |
| VEND-CORE-018 | Perform verification of attestations as agreed with RP | `[intermediary]` |

> **Note:** VEND-CORE-001 through VEND-CORE-018 also need `roles` and
> `productCategories` to be set (they are currently universal). This is a
> separate but related cleanup task included in Phase 2.

---

## 2. Proposed Design

### 2.1 New YAML field: `deploymentArchitectures`

Add an optional array field to requirement YAML:

```yaml
- id: VEND-CORE-049
  category: usage
  deploymentArchitectures:
    - intermediary
  requirement: ...
```

**Values:** `intermediary`, `direct_saas`, `direct_onprem`

**Semantics:**
- **Empty array or omitted:** Architecture-agnostic — always shown.
- **One or more values:** Only shown when at least one matching architecture is
  selected in the UI filter.

### 2.2 Visual annotation of architecture-specific items

When a requirement or clarification question applies to a specific architecture,
it should be visually annotated in the UI:

**Proposed approach — architecture badge:**

```
📋 VEND-CORE-049  🔀 Intermediary           MUST
   Register each intermediated RP at the appropriate Registrar

📋 VEND-CORE-050  ☁️ Direct SaaS             SHOULD
   Explain SaaS connector data path, key custody, and GDPR role

📋 VEND-CORE-005  (no badge = agnostic)     MUST
   Maintain a valid Relying Party Access Certificate
```

Badge colors:
- **Intermediary** (🔀): purple — `#8b5cf6`
- **Direct SaaS** (☁️): blue — `#3b82f6`
- **Direct Self-Hosted** (🏗️): green — `#10b981`

Requirements with multiple architectures show multiple badges.
Architecture-agnostic requirements show no badge.

The badge appears in the UI, Markdown export, and Excel export.

### 2.3 VCQ UI filter addition

When the user selects **Relying Party** + **Connector**, add a secondary filter:

> **Step 3b: Deployment Architecture** *(shown only for Relying Party + Connector)*
>
> Select the deployment architecture(s) the vendor supports:
> - ☑ Intermediary — vendor acts as registered RP (ARF-defined)
> - ☑ Direct SaaS — vendor-hosted, RP's own certificate
> - ☑ Direct Self-Hosted — RP-hosted, RP's own infrastructure
>
> *Default: all three checked*

Filtering logic: same union logic as source groups — a requirement appears if
ANY of its `deploymentArchitectures` matches a selected filter. Architecture-
agnostic requirements (empty array) always appear.

### 2.4 Split VEND-CORE-048 into focused requirements

Replace the single monolithic VEND-CORE-048 with focused, manageable requirements:

| New ID | Architecture tag | Requirement | Questions |
|--------|-----------------|-------------|-----------|
| VEND-CORE-048 | `[]` (agnostic) | Declare which RP Deployment Architecture(s) the product supports | 1 gate Q |
| VEND-CORE-049 | `[intermediary]` | Register as intermediary and handle dual-party wallet display | 3-4 Qs |
| VEND-CORE-050 | `[direct_saas]` | Explain SaaS connector data path, key custody, and GDPR role | 3-4 Qs |
| VEND-CORE-051 | `[direct_onprem]` | Describe self-hosted connector deployment and runtime dependencies | 3 Qs |
| VEND-CORE-052 | `[]` (agnostic) | Support EU wallet coverage, trust-list updates, and proximity flows | 3 Qs |

Each question is a **single, focused question** — no (a)(b)(c)(d) sub-questions.

---

## 3. Phased Execution Plan

### Phase 1: Data model & requirement split
**Scope:** YAML schema, requirement content, build pipeline
**No UI changes**

| # | Task | Files affected | Status |
|---|------|---------------|--------|
| 1.1 | Add `deploymentArchitectures` field to `build-vcq.js` — pass through to output JSON, default to `[]` | `scripts/build-vcq.js` | ✅ DONE |
| 1.2 | Add `deploymentArchitectures` validation to `validate-vcq.js` — validate allowed values (`intermediary`, `direct_saas`, `direct_onprem`) | `scripts/validate-vcq.js` | ✅ DONE |
| 1.3 | Rewrite VEND-CORE-048 as gate-only requirement — trim explanation to overview of 3 architectures, set `deploymentArchitectures: []` | `config/vcq/requirements/core.yaml` | ✅ DONE |
| 1.4 | Create VEND-CORE-049 (`[intermediary]`) — intermediary registration, dual display, VP Token forwarding, data deletion | `config/vcq/requirements/core.yaml` | ✅ DONE |
| 1.5 | Create VEND-CORE-050 (`[direct_saas]`) — response_uri domain, reverse proxy, key custody, GDPR processor role | `config/vcq/requirements/core.yaml` | ✅ DONE |
| 1.6 | Create VEND-CORE-051 (`[direct_onprem]`) — deployment format, runtime cloud dependencies, patch/update delivery | `config/vcq/requirements/core.yaml` | ✅ DONE |
| 1.7 | Create VEND-CORE-052 (`[]` agnostic) — wallet coverage, trust-list updates, proximity flows | `config/vcq/requirements/core.yaml` | ✅ DONE |
| 1.8 | Rewrite clarification questions for VEND-CORE-048 (trim to 1 gate Q) | `config/vcq/clarification-questions/core.yaml` | ✅ DONE |
| 1.9 | Write focused clarification questions for VEND-CORE-049 through 052 | `config/vcq/clarification-questions/core.yaml` | ✅ DONE |
| 1.10 | Build and validate — `node scripts/build-vcq.js && node scripts/build-vcq-clarifications.js` | — | ✅ DONE |
| 1.11 | Verify new requirements appear in portal (manual check) | — | ✅ DONE |
| 1.12 | Git commit: `feat: split VEND-CORE-048 into architecture-specific requirements` | — | ✅ DONE — 205236db |

### Phase 2: Architecture tagging of existing requirements
**Scope:** Audit and tag existing core.yaml requirements
**No UI changes — data preparation only**

| # | Task | Files affected | Status |
|---|------|---------------|--------|
| 2.1 | Tag VEND-CORE-001 through VEND-CORE-018 with `deploymentArchitectures` per §1.3 table | `config/vcq/requirements/core.yaml` | ✅ DONE |
| 2.2 | Fix `roles` and `productCategories` on VEND-CORE-001–018 (currently universal) | `config/vcq/requirements/core.yaml` | ✅ DONE |
| 2.3 | Audit VEND-CORE-019 through VEND-CORE-047 for architecture tagging | `config/vcq/requirements/core.yaml` | ✅ DONE (all agnostic — no tags needed) |
| 2.4 | Audit `intermediary.yaml` — all 33 should get `[intermediary]` (confirm) | `config/vcq/requirements/intermediary.yaml` | ✅ DONE (33/33 tagged) |
| 2.5 | Build and validate | — | ✅ DONE |
| 2.6 | Git commit: `feat: tag existing VCQ requirements with deploymentArchitectures` | — | ✅ DONE — 205236db |

### Phase 3: UI — Architecture filter & badges
**Scope:** VCQ page component, CSS

| # | Task | Files affected | Status |
|---|------|---------------|--------|
| 3.1 | Add `selectedArchitectures` state (3 checkboxes, default all checked) | `VendorQuestionnaire.jsx` | ✅ DONE |
| 3.2 | Conditional rendering: show architecture filter only for `relying_party` + `connector` | `VendorQuestionnaire.jsx` | ✅ DONE |
| 3.3 | Integrate into `applicableRequirements` memo — filter by `deploymentArchitectures` union logic | `VendorQuestionnaire.jsx` | ✅ DONE |
| 3.4 | Render architecture badges next to requirement IDs in `RequirementsTable` | `VendorQuestionnaire.jsx` | ✅ DONE |
| 3.5 | Style architecture badges (CSS) — color-coded, compact | CSS file | ✅ DONE |
| 3.6 | Add architecture badges to clarification question items | `VendorQuestionnaire.jsx` | ⏭️ SKIPPED (badges on IDs sufficient) |
| 3.7 | Update Markdown export with architecture badges | `VendorQuestionnaire.jsx` | ✅ DONE |
| 3.8 | Update Excel export with architecture column | `exportExcel.js` | ✅ DONE |
| 3.9 | Update summary bar count for architecture-filtered count | `VendorQuestionnaire.jsx` | ✅ DONE (uses existing count) |
| 3.10 | Manual verification in portal | — | ✅ DONE |
| 3.11 | Git commit: `feat: add deployment architecture filter and badges to VCQ UI` | — | ✅ DONE |

### Phase 4: Documentation & cleanup
**Scope:** AGENTS.md, terminology, vcq-config.yaml

| # | Task | Files affected | Status |
|---|------|---------------|--------|
| 4.1 | Add deployment architecture definitions to terminology | `TERMINOLOGY.md` | ✅ DONE — 6 terms added |
| 4.2 | Update vcq-config.yaml with `deploymentArchitectures` schema docs | `vcq-config.yaml` | ✅ DONE — Step 2b schema + migration notes |
| 4.3 | Update AGENTS.md with new field convention | `AGENTS.md` | ✅ DONE — schema table + filtering docs |
| 4.4 | Record DEC-number for this architectural decision | `DECISIONS.md` | ✅ DONE — DEC-289 |
| 4.5 | Git commit: `docs: document deploymentArchitectures field and terminology` | — | ✅ DONE — 6cefd6d1 |

### Phase 5: Architecture tag audit — correctness review
**Scope:** Fix tagging bias discovered during manual testing
**Background:** Manual testing revealed a severe tagging imbalance:

| Selection | Requirement count | Expected? |
|-----------|-------------------|-----------|
| All 3 selected | 72 | ✅ Baseline |
| Intermediary only | 70 | ❌ Suspiciously high — only 2 filtered out |
| Direct SaaS only | 31 | ❌ 57% drop — many GDPR/DPA reqs should apply |
| Direct Self-Hosted only | 22 | ❌ 69% drop — trust-list, pseudonym reqs should apply |

**Current tagging distribution (72 RP+Connector reqs):**

| Tag | Count | Issue |
|-----|-------|-------|
| `[intermediary]` only | 40 (56%) | ⚠️ Many likely apply to SaaS/self-hosted too |
| `[]` (agnostic) | 21 (29%) | ✅ Probably correct |
| `[intermediary, direct_saas]` | 9 (13%) | ⚠️ Some may also apply to self-hosted |
| `[direct_saas]` only | 1 | ✅ Architecture-specific |
| `[direct_onprem]` only | 1 | ✅ Architecture-specific |

**Root cause:** Phase 2 tagging was done rapidly and biased toward intermediary
because the ARF's Topic 53 (RPI_01–RPI_10) explicitly references intermediaries.
Many requirements about **verification, trust-lists, GDPR, key management, and
data forwarding** are equally relevant in Direct SaaS and sometimes Self-Hosted
models, but were tagged `[intermediary]` because the ARF source text used the
word "intermediary".

**Audit methodology:**

For each requirement, the audit will:
1. **Read the requirement text** and its explanation/clarification questions
2. **Identify the underlying obligation** — what is actually being required?
3. **Apply the architecture decision framework** from [rp-deployment-architectures.md](./rp-deployment-architectures.md):
   - Does the obligation fundamentally change when there is no intermediary?
   - Does the obligation implicitly assume a vendor sees personal data (→ SaaS applies)?
   - Does the obligation implicitly assume a vendor operates infrastructure (→ SaaS applies)?
   - Is the obligation about the RP's software capabilities regardless of hosting (→ agnostic or on-prem too)?
4. **Propose corrected tag** with brief rationale
5. **Flag any requirement where the explanation or CQ needs updating** to reflect the new scope

**Audit batches:**

---

#### Batch 1: VEND-CORE GDPR & Data Processing (9 reqs)

These are the GDPR Article 28 requirements — currently tagged `[intermediary, direct_saas]`
but omitting `direct_onprem`. The audit question is: when a vendor provides self-hosted
software, does it still process personal data in any way (telemetry, key escrow, cloud
dependencies) that triggers GDPR processor obligations?

| # | ID | Current tag | Requirement summary | Audit question |
|---|------|-----------|---------------------|----------------|
| 1 | VEND-CORE-002 | `[int, saas]` | Implement DPA meeting GDPR Art 28 | Does a self-hosted vendor ever act as data processor? If software phones home, processes logs, or provides cloud key management → DPA needed. If truly air-gapped → probably not. **Should this be agnostic?** |
| 2 | VEND-CORE-003 | `[int, saas]` | Provide audit rights to RP | Same question as CORE-002. Audit rights only meaningful if vendor processes data. |
| 3 | VEND-CORE-007 | `[int, saas]` | Notify RP of data breaches | If vendor has no access to production data in self-hosted model, breach notification is N/A → `[int, saas]` correct. But if vendor maintains the software and a vulnerability is exploited → vendor should still notify. |
| 4 | VEND-CORE-008 | `[int, saas]` | Personnel bound by confidentiality | If vendor support/maintenance staff could access RP's data → applies. |
| 5 | VEND-CORE-009 | `[int, saas]` | Process data only on documented instructions | Classic processor obligation — only applies if vendor touches data. |
| 6 | VEND-CORE-010 | `[int, saas]` | Support data subject rights requests | If vendor has no data in self-hosted → N/A. But check if the *software* needs to support DSAR flows regardless of who hosts. |
| 7 | VEND-CORE-012 | `[int, saas]` | Inform RP of legal requirements to process beyond instructions | Only relevant if vendor is processor → same scope as CORE-002. |
| 8 | VEND-CORE-013 | `[int, saas]` | Obtain RP authorization before engaging sub-processors | Sub-processor obligation → only relevant if vendor is data processor. |
| 9 | VEND-CORE-014 | `[int, saas]` | Delete/return personal data at end of contract | Same scope as CORE-002 — data lifecycle. |

**Likely outcome:** These 9 requirements are correctly `[intermediary, direct_saas]` because
the self-hosted model means the vendor typically has no access to personal data. However,
the **explanations** may need updating to acknowledge that modern "self-hosted" often
includes cloud management planes, telemetry, and key management — vendors should confirm
no data leaves the RP's infrastructure.

| # | Task | Status |
|---|------|--------|
| 5.1.1 | Audit Batch 1 (9 GDPR/DPA reqs) — verify tags, update explanations/CQs if needed | ✅ DONE — tags correct, 9 explanation + ~15 CQ updates needed. See [audit report](./arch-audit-batch1.md) |

---

#### Batch 2: VEND-CORE Intermediary Registration & Identity (7 reqs)

These are the core intermediary-specific obligations directly derived from ARF Topic 53
(RPI_01–RPI_10). They should be `[intermediary]` because they fundamentally cannot apply
to direct models (no dual-party display, no intermediary registration, no intermediated RP).

| # | ID | Current tag | Requirement summary | Audit question |
|---|------|-----------|---------------------|----------------|
| 1 | VEND-CORE-001 | `[intermediary]` | Not store data about transaction content | Is this truly intermediary-only? Or should all vendors avoid storing transaction content? In SaaS model, VP Tokens transit vendor infrastructure — shouldn't this apply to SaaS too? |
| 2 | VEND-CORE-004 | `[intermediary]` | Register as RP indicating intermediary status | Pure intermediary obligation (RPI_01/02) → correct. |
| 3 | VEND-CORE-011 | `[intermediary]` | Display both intermediary and RP identity | Pure intermediary obligation (RPI_07) → correct. |
| 4 | VEND-CORE-016 | `[intermediary]` | Register each intermediated RP at Registrar | Pure intermediary obligation (RPI_03) → correct. |
| 5 | VEND-CORE-017 | `[intermediary]` | Provide legal evidence of RP relationship | Pure intermediary obligation (RPI_04) → correct. |
| 6 | VEND-CORE-018 | `[intermediary]` | Perform verification as agreed with RP | Is this intermediary-only? In SaaS, the vendor also performs verification on behalf of the RP. In self-hosted, the software performs verification — is that the RP performing it, or the vendor's software? |
| 7 | VEND-CORE-049 | `[intermediary]` | Describe intermediary registration, dual display, data forwarding | Architecture-specific gate question → correct. |

**Likely outcome:** CORE-004, 011, 016, 017, 049 are obviously `[intermediary]`-only.
CORE-001 (no data storage) and CORE-018 (verification agreement) need careful review —
they may need to become `[intermediary, direct_saas]` or even agnostic.

| # | Task | Status |
|---|------|--------|
| 5.2.1 | Audit Batch 2 (7 intermediary identity reqs) — verify tags, check CORE-001 and CORE-018 scope | ✅ DONE — all 7 correctly `[intermediary]`, no changes needed. See [audit report](./arch-audit-batch2.md) |

---

#### Batch 3a: VEND-INT Forwarding & Protocol (7 reqs)

These are the `intermediary.yaml` requirements covering the **forwarding semantics and
protocol-level behaviour** — dual-identity display, request relaying, and secure channel.
The key audit question: **are these truly about ARF intermediary forwarding, or are they
generic connector behaviour that applies to SaaS and self-hosted too?**

| # | ID | Current tag | Requirement summary | Audit question |
|---|------|-----------|---------------------|----------------|
| 1 | VEND-INT-001 | `[int]` | Display both intermediary and RP identity | Pure intermediary (RPI_07) → correct. |
| 2 | VEND-INT-002 | `[int]` | Ensure RP's data requests are accurately communicated | Check: in SaaS model, the vendor's software also communicates data requests to the wallet. Is this intermediary-specific behavior or connector behavior? |
| 3 | VEND-INT-003 | `[int]` | Forward presentation requests without modification | "Forwarding" implies intermediary relaying to RP. In SaaS the connector processes directly. → probably correct as `[int]`. |
| 4 | VEND-INT-004 | `[int]` | Forward wallet presentations to RP without modification | Same as INT-003 — forwarding concept is intermediary-specific. |
| 5 | VEND-INT-005 | `[int]` | Support both remote and proximity protocols | **This is a capability requirement, not an intermediary obligation.** All connectors should support both protocols. → candidate for **agnostic**. |
| 6 | VEND-INT-006 | `[int]` | Forward attributes only to requesting RP after verification | Intermediary forwarding semantics → correct. |
| 7 | VEND-INT-014 | `[int]` | Ensure secure channel for transmission to RP | Forwarding over secure channel — only applies if data is forwarded (intermediary and SaaS). → candidate for `[int, saas]`. |

**Likely outcome:** INT-001, 003, 004, 006 are correctly `[intermediary]` (forwarding
semantics). INT-005 likely becomes **agnostic**. INT-002 and INT-014 need careful review.

| # | Task | Status |
|---|------|--------|
| 5.3a.1 | Audit Batch 3a (7 forwarding/protocol reqs) | ✅ DONE — 6/7 correct; INT-005 → agnostic (protocol capability). See [audit report](./arch-audit-batch3a.md) |

---

#### Batch 3b: VEND-INT Trust-Lists & Verification (7 reqs)

These cover **trust-list maintenance, signature validation, revocation checking, device
binding, and replay prevention**. Currently all tagged `[intermediary]`. The key audit
question: **shouldn't all connectors perform these verification steps, regardless of
deployment architecture?**

| # | ID | Current tag | Requirement summary | Audit question |
|---|------|-----------|---------------------|----------------|
| 1 | VEND-INT-007 | `[int]` | Maintain up-to-date Trusted Lists for PID Providers | **Trust-list maintenance is required for ALL verification**, not just intermediary. → candidate for **agnostic**. |
| 2 | VEND-INT-008 | `[int]` | Maintain up-to-date Trusted Lists for Attestation Providers | Same as INT-007 → candidate for **agnostic**. |
| 3 | VEND-INT-009 | `[int]` | Obtain trust anchors only from official sources | Same as INT-007/008 → candidate for **agnostic**. |
| 4 | VEND-INT-010 | `[int]` | Validate attestation signatures using trust anchors | **Core verification — all connectors must do this.** → candidate for **agnostic**. |
| 5 | VEND-INT-011 | `[int]` | Verify attestation revocation status | Same as INT-010 → candidate for **agnostic**. |
| 6 | VEND-INT-012 | `[int]` | Verify wallet unit's device binding | Same as INT-010 → candidate for **agnostic**. |
| 7 | VEND-INT-013 | `[int]` | Verify presentation freshness / prevent replay | Same as INT-010 → candidate for **agnostic**. |

**Likely outcome:** This is the sub-batch with the **most corrections**. All 7 are
likely to become **agnostic** because trust-list verification, signature validation,
and replay prevention are core connector capabilities regardless of deployment architecture.

⚠️ **Important note on intermediary.yaml scope:** If all 7 become agnostic, they may
need to be **moved to core.yaml** or the file renamed. This is a structural question
to decide during the audit.

| # | Task | Status |
|---|------|--------|
| 5.3b.1 | Audit Batch 3b (7 trust/verification reqs) — major re-tagging expected | ✅ DONE — **all 7 → agnostic**. Verification capabilities are architecture-neutral. See [audit report](./arch-audit-batch3b.md) |

---

#### Batch 4a: VEND-INT Key Management, Privacy & Audit (6 reqs)

These cover **key management, verification result integrity, audit logging, privacy
protections, and immediate data deletion**. Some are genuinely intermediary-specific
(RPI_10 immediate deletion), others may be broadly applicable.

| # | ID | Current tag | Requirement summary | Audit question |
|---|------|-----------|---------------------|----------------|
| 1 | VEND-INT-016 | `[int]` | Implement secure key management for verification | All connectors manage cryptographic keys. → candidate for **agnostic**. |
| 2 | VEND-INT-017 | `[int]` | Protect verification results integrity | All connectors should protect verification results. → candidate for **agnostic** or `[int, saas]`. |
| 3 | VEND-INT-018 | `[int]` | Maintain audit logs of verification operations | All connectors should audit log. → candidate for **agnostic**. |
| 4 | VEND-INT-019 | `[int]` | Do not extract/log individual attribute values | Privacy obligation — applies to anyone who sees data. → candidate for `[int, saas]` or **agnostic** (even self-hosted software should not log PII). |
| 5 | VEND-INT-020 | `[int]` | Do not correlate/link user presentations across RPs | Privacy obligation — applies to anyone who sees multiple RPs. → candidate for `[int, saas]` at minimum. |
| 6 | VEND-INT-021 | `[int]` | Delete attestation data immediately after forwarding | Pure RPI_10 obligation → correct as `[intermediary]`. |

**Likely outcome:** INT-016, 018 likely become agnostic. INT-019, 020 likely become
`[int, saas]` or agnostic. INT-021 stays `[intermediary]`. INT-017 needs nuanced review.

| # | Task | Status |
|---|------|--------|
| 5.4a.1 | Audit Batch 4a (6 key-mgmt/privacy/audit reqs) | ✅ DONE — 4/6 changed: INT-016,018 → agnostic; INT-019,020 → `[int, saas]`; INT-017,021 stay `[int]`. See [audit report](./arch-audit-batch4a.md) |

---

#### Batch 4b: VEND-INT Formats, Certification & Disclosure (5 reqs)

These cover **credential format support, selective disclosure, cryptographic certification,
disclosure policies, and RP details in presentation requests**. These are predominantly
connector capabilities.

| # | ID | Current tag | Requirement summary | Audit question |
|---|------|-----------|---------------------|----------------|
| 1 | VEND-INT-022 | `[int]` | Specify RP details in each presentation request | All connectors include RP details in requests. In intermediary model this means *both* parties. → needs nuanced review. |
| 2 | VEND-INT-023 | `[int]` | Support mandatory credential formats (SD-JWT VC, mdoc) | **Capability requirement — all connectors.** → candidate for **agnostic**. |
| 3 | VEND-INT-024 | `[int]` | Support selective disclosure in both formats | Same as INT-023 → candidate for **agnostic**. |
| 4 | VEND-INT-025 | `[int]` | Consider certification for cryptographic components | All connectors use crypto → candidate for **agnostic**. |
| 5 | VEND-INT-026 | `[int]` | Comply with embedded disclosure policies | All connectors handle disclosure policies → candidate for **agnostic**. |

**Likely outcome:** INT-023, 024, 025, 026 are connector capabilities and should become
**agnostic**. INT-022 needs nuanced review (RP details in intermediary vs. direct model).

| # | Task | Status |
|---|------|--------|
| 5.4b.1 | Audit Batch 4b (5 format/cert/disclosure reqs) | ✅ DONE — 4/5 → agnostic (INT-023–026 capabilities); INT-022 stays `[int]` (RPRC_19a). See [audit report](./arch-audit-batch4b.md) |

---

#### Batch 5: VEND-INT Pseudonyms, Registration & GDPR Rights (8 reqs)

These cover pseudonym support, registration certificates, and GDPR data subject rights.

| # | ID | Current tag | Requirement summary | Audit question |
|---|------|-----------|---------------------|----------------|
| 1 | VEND-INT-027 | `[int]` | Support WebAuthn for pseudonym generation | Pseudonym generation is a connector capability. → candidate for **agnostic**. |
| 2 | VEND-INT-028 | `[int]` | Support RP-specific pseudonyms | Same → candidate for **agnostic**. |
| 3 | VEND-INT-029 | `[int]` | Use valid Wallet-RP Access Certificate | **All RPs need access certificates.** → candidate for **agnostic** (already covered by VEND-CORE-005/032?). Check for duplication. |
| 4 | VEND-INT-030 | `[int]` | Implement TS7 data deletion request interface | GDPR Art 17 → check if this is about vendor deleting its copy (int/saas) or software providing deletion capability (agnostic). Compare with VEND-CORE-021 for duplication. |
| 5 | VEND-INT-031 | `[int]` | Support user reporting to data protection authorities | Check: is this about the intermediary's obligation as a legal entity, or a software capability? |
| 6 | VEND-INT-032 | `[int]` | Include intermediary access cert + RP registration cert in requests | Pure intermediary protocol (RPI_06) → correct. |
| 7 | VEND-INT-033 | `[int]` | Ensure intermediary-RP contractual relationship is registered | Pure intermediary obligation → correct. |
| 8 | VEND-INT-034 | `[int]` | Support attestation status list verification | All connectors verify attestation status. → candidate for **agnostic**. Check duplication with INT-011. |

**Likely outcome:** INT-027, 028, 034 likely become agnostic. INT-032, 033 are correctly
intermediary-only. INT-029, 030 need duplication check against core.yaml equivalents.

| # | Task | Status |
|---|------|--------|
| 5.5.1 | Audit Batch 5 (8 pseudonym/registration/GDPR reqs) — check duplication with core.yaml | ✅ DONE — 5/8 changed: INT-027,029,034 → agnostic; INT-030,031 → `[int, saas]`; INT-028,032,033 stay `[int]`. 4 duplication flags. See [audit report](./arch-audit-batch5.md) |

---

#### Batch 6a: VEND-CORE Agnostic Confirmation — Certificates & Verification (7 reqs)

These are currently tagged as **agnostic** (no `deploymentArchitectures` tag). The audit
confirms they are correctly agnostic. This sub-batch covers certificates and core
verification requirements.

| # | ID | Current tag | Requirement summary | Quick check |
|---|------|-----------|---------------------|-------------|
| 1 | VEND-CORE-005 | agnostic | Maintain valid RP Access Certificate | ✅ All RPs need this. Check dup with INT-029. |
| 2 | VEND-CORE-019 | agnostic | Implement TS12 PSD2 SCA | ✅ Payment-specific, arch-independent. |
| 3 | VEND-CORE-021 | agnostic | Implement TS7 data deletion | ✅ Software capability. Check dup with INT-030. |
| 4 | VEND-CORE-027 | agnostic | Support pseudonym attestations per TS9 | ✅ Protocol capability. Check dup with INT-027/028. |
| 5 | VEND-CORE-028 | agnostic | GDPR data portability per TS10 | ✅ GDPR right, arch-independent. |
| 6 | VEND-CORE-029 | agnostic | Verify registration certificates | ✅ Protocol requirement. |
| 7 | VEND-CORE-030 | agnostic | Verify attestation authenticity/validity | ✅ Core verification. Check dup with INT-010. |

| # | Task | Status |
|---|------|--------|
| 5.6a.1 | Audit Batch 6a (7 agnostic reqs) — confirm agnostic; cross-ref duplicates | ✅ DONE — all 7 confirmed agnostic. 4 duplication cross-refs mapped. See [audit report](./arch-audit-batch6a.md) |

---

#### Batch 6b: VEND-CORE Agnostic Confirmation — Registration & Protocol (7 reqs)

Continuation of agnostic confirmation. Covers registration, trust infrastructure,
and protocol capabilities.

| # | ID | Current tag | Requirement summary | Quick check |
|---|------|-----------|---------------------|-------------|
| 1 | VEND-CORE-031 | agnostic | Register intended uses per access cert policies | ✅ Registration obligation. |
| 2 | VEND-CORE-032 | agnostic | Use valid RP Access Certificate | ✅ Protocol requirement. Check dup with INT-029. |
| 3 | VEND-CORE-033 | agnostic | Handle pseudonym-based presentations | ✅ Protocol capability. |
| 4 | VEND-CORE-034 | agnostic | Publish RP trust anchor information | ✅ Trust framework. |
| 5 | VEND-CORE-035 | agnostic | Process GDPR deletion requests | ✅ GDPR right. Check scope vs INT-030 and CORE-021. |
| 6 | VEND-CORE-038 | agnostic | Support W3C Digital Credentials API | ✅ Protocol capability. |
| 7 | VEND-CORE-039 | agnostic | Handle revocation unavailability gracefully | ✅ Protocol resilience. |

| # | Task | Status |
|---|------|--------|
| 5.6b.1 | Audit Batch 6b (7 agnostic reqs) — confirm agnostic; cross-ref duplicates | ✅ DONE — all 7 confirmed agnostic. 3 duplication clusters identified (access cert, data deletion, revocation). See [audit report](./arch-audit-batch6b.md) |

---

#### Batch 6c: VEND-CORE Agnostic Confirmation — Integration & Gate Questions (7 reqs)

Final agnostic confirmation sub-batch. Covers integration features, gate questions,
and proximity flows.

| # | ID | Current tag | Requirement summary | Quick check |
|---|------|-----------|---------------------|-------------|
| 1 | VEND-CORE-040 | agnostic | Support proximity identification (optional) | ✅ Protocol capability. Check dup with INT-005. |
| 2 | VEND-CORE-041 | agnostic | Handle registration cert updates/renewals | ✅ Operational capability. |
| 3 | VEND-CORE-045 | agnostic | Implement TS5 REST API for RP registration exchange | ✅ Protocol standard. |
| 4 | VEND-CORE-046 | agnostic | Support intended use selection in requests | ✅ Protocol capability. |
| 5 | VEND-CORE-047 | agnostic | Surface user rejection/consent denial events | ✅ Integration capability. |
| 6 | VEND-CORE-048 | agnostic | Declare supported deployment architectures | ✅ Gate question. |
| 7 | VEND-CORE-052 | agnostic | Confirm EU wallet coverage, trust-list, proximity | ✅ Breadth question. |

**Cross-reference checks to perform across Batch 6a+6b+6c:**

| Core agnostic req | Potential VEND-INT duplicate | Check |
|------|---------------------------|-------|
| VEND-CORE-005 / VEND-CORE-032 | VEND-INT-029 | Access certificate — is INT-029 redundant? |
| VEND-CORE-021 / VEND-CORE-035 | VEND-INT-030 | Data deletion — three reqs covering similar ground? |
| VEND-CORE-027 | VEND-INT-027 / VEND-INT-028 | Pseudonym support — redundancy? |
| VEND-CORE-030 | VEND-INT-010 | Attestation verification — redundancy? |
| VEND-CORE-040 | VEND-INT-005 | Proximity flows — redundancy? |

| # | Task | Status |
|---|------|--------|
| 5.6c.1 | Audit Batch 6c (7 agnostic reqs) — confirm agnostic; cross-ref duplicates | ✅ DONE — all 7 confirmed agnostic. Final cross-refs mapped. **COMPLETE AUDIT: 70 reqs, 21 corrections.** See [audit report](./arch-audit-batch6c.md) |

---

#### Post-audit wrap-up

| # | Task | Status |
|---|------|--------|
| 5.7.1 | Apply all tag corrections to YAML files | ✅ DONE — 21 corrections (17→agnostic, 4→[int,saas]) applied to intermediary.yaml |
| 5.7.2 | Resolve identified duplications (merge, remove, or differentiate) | ✅ DONE → **Phase 6** (C2+C4 merged, C1/C3/C5/C6 kept separate) |
| 5.7.3 | Update explanations/CQs affected by scope changes | ✅ DONE — 68 explanation text fixes + 16 CQ text fixes across both YAML files |
| 5.7.4 | Rebuild and validate: `node scripts/build-vcq.js && node scripts/validate-vcq.js` | ✅ DONE |
| 5.7.5 | Manual verification: re-test filter counts for each architecture | ✅ DONE |
| 5.7.6 | Git commit: `fix: correct deployment architecture tags after audit` | ✅ DONE — c421f18e + 43c23bfc |

---

### Phase 5.5: UI refactor — inline architecture in Connector card
**Scope:** Move architecture selector from standalone Step 2b into the Connector card
**Status:** ✅ DONE

| # | Task | Files affected | Status |
|---|------|---------------|--------|
| 5.5.a | Embed architecture checkboxes inside ProductCategorySelector's Connector card | `VendorQuestionnaire.jsx` | ✅ DONE |
| 5.5.b | Remove standalone ArchitectureSelector component | `VendorQuestionnaire.jsx` | ✅ DONE |
| 5.5.c | Add inline architecture CSS (mirrors RCA rca-role-profiles pattern) | `VendorQuestionnaire.css` | ✅ DONE |
| 5.5.d | Remove standalone Step 2b CSS (.vcq-arch-step, .vcq-arch-selector, .vcq-arch-option) | `VendorQuestionnaire.css` | ✅ DONE |
| 5.5.e | Verify: architecture checkboxes don't toggle card; card click doesn't toggle architectures | — | ✅ DONE (stopPropagation) |

---

### Phase 6: Requirement Consolidation

> **Goal:** Reduce duplication across core.yaml and intermediary.yaml by merging
> semantically overlapping requirements while preserving all unique information
> (explanations, CQs, HLRs, legal bases).
>
> **Principle:** Zero semantic information loss. Every explanation paragraph,
> every CQ, every HLR reference must survive — either in the merged requirement
> or as an architecture-specific subsection.

#### Deep Analysis of 6 Duplication Clusters

---

##### Cluster 1: Access Certificate (3 requirements → ❌ KEEP SEPARATE)

| Member | Requirement | Category | HLRs | Legal Basis |
|--------|-------------|----------|-------|-------------|
| VEND-CORE-005 | Maintain valid RP Access Certificate | **registration** | RPA_03, RPA_02a | **IR 2025/848** Art 7(1-2) |
| VEND-CORE-032 | Use valid RP Access Certificate for auth | **usage** | RPA_02a, RPA_06 | **eIDAS 2014/910** Art 5b(8) |
| VEND-INT-029 | Use valid Wallet-RP Access Certificate | **usage** | RPA_01, RPI_07 | **IR 2024/2982** Art 3(1) |

**Decision: ❌ KEEP ALL THREE SEPARATE**

Despite sharing the access certificate topic, deep metadata analysis revealed
these are genuinely distinct regulatory obligations:
- **Different categories:** CORE-005 is `registration` (obtaining the cert),
  CORE-032 and INT-029 are `usage` (using the cert)
- **Different legal bases:** three distinct EU regulations from different
  legislative layers (eIDAS Regulation, IR for certificates, IR for intermediaries)
- **Different HLRs:** only RPA_02a is shared; the other 4 HLRs are unique

Merging would conflate registration with usage in the category filter and
lose the distinct legal basis traceability. The initial overlap assessment
was a false positive based on topic similarity — the regulatory angles are different.

No tasks needed.

---

##### Cluster 2: Data Deletion (3 requirements → merge CORE pair, keep INT)

| Member | Requirement | HLRs | Tag | Lines | CQs |
|--------|-------------|-------|-----|-------|-----|
| VEND-CORE-021 | Implement TS7 data deletion interface | DATA_DLT_07/08 | agnostic | 36 | 9 |
| VEND-CORE-035 | Process deletion requests within timeframes | DATA_DLT_07/08 | agnostic | 39 | 9 |
| VEND-INT-030 | Implement TS7 data deletion interface | DATA_DLT_07/08 | `[int, saas]` | 43 | 9 |

**HLR analysis:** All three share the **exact same HLRs** (DATA_DLT_07, DATA_DLT_08).
This is the strongest duplication signal.

**Semantic inventory:**

| Facet | Source | Unique content |
|-------|--------|----------------|
| API implementation (TS7 endpoints) | CORE-021 | Technical interface spec, API format |
| GDPR timeframe compliance | CORE-035 | Art 17 "without undue delay", 1-month SLA |
| Relay pattern + no-storage interaction | INT-030 | Relay to intermediated RP, no-storage mandate, DPA obligations |

**Merge verdict: ✅ MERGE CORE-021 + CORE-035 → 1; KEEP INT-030 separate**

CORE-021 and CORE-035 cover the same TS7 deletion from two angles (API vs process)
with identical HLRs. They should be one requirement. INT-030 serves a different
purpose — it's the data handler's relay/governance obligation, correctly tagged
`[int, saas]`.

| # | Task | Status |
|---|------|--------|
| 6.2.1 | Semantic inventory: extract unique content from CORE-021 + CORE-035 | ✅ DONE |
| 6.2.2 | CQ deduplication: map 18 CQs → deduplicated set (→12) | ✅ DONE |
| 6.2.3 | Write merged VEND-CORE-021 (API + process + timeframes) | ✅ DONE |
| 6.2.4 | Delete VEND-CORE-035 from YAML | ✅ DONE |
| 6.2.5 | Update any cross-references pointing to VEND-CORE-035 | ✅ DONE — none found |

---

##### Cluster 3: Pseudonym (2 requirements → keep separate)

| Member | Requirement | HLRs | Lines | CQs |
|--------|-------------|-------|-------|-----|
| VEND-CORE-027 | Support pseudonym attestations per TS9 | none | 33 | 9 |
| VEND-INT-027 | Support WebAuthn for pseudonym generation | none | 30 | 9 |

**Semantic inventory:**

| Facet | Source | Unique content |
|-------|--------|----------------|
| High-level TS9 pseudonym support, legal basis (Art 5a(4)(b)) | CORE-027 | When full ID not required, pseudonyms must be available |
| WebAuthn implementation detail (ES256, authenticatorData, WSCD) | INT-027 | Specific protocol mechanics for pseudonym generation |

**Merge verdict: ❌ KEEP SEPARATE**

These operate at **different abstraction levels**. CORE-027 is a legal/policy
requirement ("support pseudonyms"). INT-027 is a technical implementation
requirement ("use WebAuthn ES256 for pseudonym generation"). Merging would
conflate policy with implementation detail.

**However:** Both have no ARF HLR references. If HLRs are found, the
analysis should be revisited.

No tasks needed.

---

##### Cluster 4: Revocation (3 requirements → merge INT pair, keep CORE)

| Member | Requirement | HLRs | Tag | Lines | CQs |
|--------|-------------|-------|-----|-------|-----|
| VEND-INT-011 | Verify revocation status (recommended) | VCR_12, VCR_13 | agnostic | 28 | 9 |
| VEND-INT-034 | Support status list mechanisms (recommended) | VCR_11, VCR_12, VCR_13 | agnostic | 41 | 9 |
| VEND-CORE-039 | Handle revocation unavailability gracefully | VCR_15 | agnostic | 39 | 9 |

**HLR analysis:**
- **Shared (INT-011 ∩ INT-034):** VCR_12, VCR_13 — near-complete overlap
- **Unique to INT-034:** VCR_11 (status list format specification)
- **Unique to CORE-039:** VCR_15 (unavailability handling) — completely different HLR

**Semantic inventory:**

| Facet | Source | Unique content |
|-------|--------|----------------|
| Conceptual revocation obligation | INT-011 | "Should verify revocation before acceptance" |
| Implementation mechanisms (Status Lists vs Revocation Lists) | INT-034 | VCR_01 short-lived exception, two mechanisms, cache strategy |
| Unavailability resilience | CORE-039 | VCR_15 fallback behaviour, retry backoff, cached-stale handling |

**Merge verdict: ✅ MERGE INT-011 + INT-034 → 1; KEEP CORE-039 separate**

INT-011 and INT-034 cover the same revocation checking capability with heavy HLR
overlap (VCR_12/13). INT-034 adds the VCR_11 mechanism detail and the VCR_01
short-lived exception. They're clearly one requirement split into two.

CORE-039 is genuinely distinct — it's about *what happens when revocation checking
fails*, not about the checking itself. Different HLR (VCR_15), different concern.

| # | Task | Status |
|---|------|--------|
| 6.4.1 | Semantic inventory: extract unique content from INT-011 + INT-034 | ✅ DONE |
| 6.4.2 | CQ deduplication: map 18 CQs → deduplicated set (→13) | ✅ DONE |
| 6.4.3 | Write merged VEND-INT-011 (obligation + mechanisms + short-lived exception) | ✅ DONE |
| 6.4.4 | Delete VEND-INT-034 from YAML (and its CQs) | ✅ DONE |
| 6.4.5 | Update any cross-references pointing to VEND-INT-034 | ✅ DONE — none found |

---

##### Cluster 5: Verification Umbrella (7 requirements → keep all)

| Member | Requirement | HLRs | Lines | CQs |
|--------|-------------|-------|-------|-----|
| VEND-CORE-030 | Verify attestation authenticity/validity | OIA_15, OIA_16 | 33 | 9 |
| VEND-INT-007 | Trusted Lists for PIDs | OIA_12 | 30 | 9 |
| VEND-INT-008 | Trusted Lists for Attestations | OIA_13, OIA_14, OIA_15 | 29 | 9 |
| VEND-INT-009 | Trust anchors from official sources | OIA_14 | 26 | 9 |
| VEND-INT-010 | Signature validation | OIA_12, OIA_13 | 28 | 9 |
| VEND-INT-012 | Device binding verification | RPI_09 | 27 | 9 |
| VEND-INT-013 | Replay attack prevention | RPI_09 | 32 | 9 |

**Merge verdict: ❌ KEEP ALL SEPARATE**

These are **not duplicates** — they're a **requirement tree**:
- CORE-030 is the **umbrella** that says "verify attestations" (OIA_15/16)
- INT-007 through INT-013 are **detailed sub-requirements** that each cover a
  specific verification step with its own HLR

The HLRs are **largely non-overlapping** (each sub-requirement targets a different
OIA or RPI HLR). The only overlap is minor:
- OIA_14 appears in both INT-008 and INT-009 (trust list vs source)
- OIA_12 appears in both INT-007 and INT-010 (PID trust vs PID signature)

These overlaps are legitimate — the same HLR can be relevant to multiple verification
steps. Merging would destroy the logical decomposition.

**Alternative consideration:** These currently live in intermediary.yaml but are
tagged agnostic. In a future file restructuring, consider moving INT-007–013 to
core.yaml to match their agnostic tag. But this is a file organization question,
not a semantic duplication question.

No tasks needed.

---

##### Cluster 6: Proximity/Protocol (2 requirements → keep separate)

| Member | Requirement | HLRs | Obligation | Lines | CQs |
|--------|-------------|-------|------------|-------|-----|
| VEND-CORE-040 | Support proximity flows (optional) | ProxId_01a | MAY | 33 | 9 |
| VEND-INT-005 | Support remote + proximity protocols | ProxId_01a | MUST | 30 | 9 |

**Merge verdict: ❌ KEEP SEPARATE**

Despite sharing the same HLR, these have **different obligations**:
- CORE-040: **MAY** (optional capability)
- INT-005: **MUST** (mandatory for connectors)

They also have different scopes:
- CORE-040: Just proximity flows
- INT-005: Both remote AND proximity protocols (OID4VP + ISO 18013-5)

Merging would conflate an optional capability question with a mandatory
protocol support requirement.

No tasks needed.

---

#### Consolidation Summary

| Cluster | Members | Verdict | Merge target | Items retired |
|---------|---------|---------|-------------|---------------|
| C1: Access Certificate | CORE-005, CORE-032, INT-029 | ❌ Keep separate | — | — |
| C2: Data Deletion | CORE-021, CORE-035, INT-030 | ✅ MERGE 2→1 | VEND-CORE-021 | CORE-035 |
| C3: Pseudonym | CORE-027, INT-027 | ❌ Keep separate | — | — |
| C4: Revocation | INT-011, INT-034, CORE-039 | ✅ MERGE 2→1 | VEND-INT-011 | INT-034 |
| C5: Verification Umbrella | CORE-030 + INT-007–013 | ❌ Keep all | — | — |
| C6: Proximity/Protocol | CORE-040, INT-005 | ❌ Keep separate | — | — |

**Net effect:** 2 merges, retiring 2 requirements (CORE-035, INT-034).
Total requirement count: 82 → 80.

#### Execution Batches

| Batch | Cluster | Merge | Files affected |
|-------|---------|-------|---------------|
| 6a | C2: Data Deletion | CORE-021 ← CORE-035 | core.yaml, core CQ file |
| 6b | C4: Revocation | INT-011 ← INT-034 | intermediary.yaml, intermediary CQ file |

| # | Task | Status |
|---|------|--------|
| 6.a | Execute Cluster 2 merge (Data Deletion) | ✅ DONE — CORE-021 ← CORE-035: merged explanation + CQs (18→12), deleted CORE-035 |
| 6.b | Execute Cluster 4 merge (Revocation) | ✅ DONE — INT-011 ← INT-034: merged explanation + CQs (18→13), added VCR_11, deleted INT-034 |
| 6.c | Rebuild and validate: `node scripts/build-vcq.js && node scripts/validate-vcq.js` | ✅ DONE — build OK, 2 pre-existing ISS-041 HLR errors (unrelated) |
| 6.d | Manual verification: check merged requirements render correctly | ✅ DONE — CORE-021 (12 CQs), INT-011 (13 CQs), retired IDs absent from JSON |
| 6.e | Git commit: `refactor: consolidate duplicate requirements (C2, C4)` | ✅ DONE — c421f18e |

---

## 4. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing exports | Users with previous exports have different IDs | Keep VEND-CORE-048 as gate — existing exports still parse |
| Over-filtering hides relevant requirements | Vendor misses a requirement | Default all architectures checked; agnostic items always show |
| ~~Misjudged architecture scope in Phase 2~~ | ~~Requirement tagged incorrectly~~ | ~~Each tagging decision documented in commit with rationale~~ |
| **Architecture tagging bias (REALIZED)** | **57-69% of reqs hidden for SaaS/self-hosted** | **Phase 5 audit — systematic review of all 72 reqs** |
| intermediary.yaml overlap with core.yaml | VEND-INT-* may duplicate VEND-CORE equivalents | Phase 5 Batch 6 cross-reference check |
| Re-tagging VEND-INT-* as agnostic makes intermediary.yaml misleading | File name suggests intermediary-only content | Consider renaming or restructuring YAML files post-audit |
| **Requirement consolidation loses information** | **CQs or explanation paragraphs dropped** | **Phase 6: semantic inventory before each merge; zero-loss principle** |

---

## 5. Dependencies

- No external dependencies
- Builds on existing VCQ infrastructure (build-vcq.js, validate-vcq.js, VendorQuestionnaire.jsx)
- Parallels the RCA secondary filtering pattern
- Background analysis: [RP Deployment Architectures](./rp-deployment-architectures.md)
