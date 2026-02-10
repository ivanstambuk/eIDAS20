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
| 1.11 | Verify new requirements appear in portal (manual check) | — | ⬜ TODO |
| 1.12 | Git commit: `feat: split VEND-CORE-048 into architecture-specific requirements` | — | ⬜ TODO |

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
| 2.6 | Git commit: `feat: tag existing VCQ requirements with deploymentArchitectures` | — | ⬜ TODO |

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
| 3.11 | Git commit: `feat: add deployment architecture filter and badges to VCQ UI` | — | ⬜ TODO |

### Phase 4: Documentation & cleanup
**Scope:** AGENTS.md, terminology, vcq-config.yaml

| # | Task | Files affected | Status |
|---|------|---------------|--------|
| 4.1 | Add deployment architecture definitions to terminology | terminology files | ⬜ TODO |
| 4.2 | Update vcq-config.yaml with `deploymentArchitectures` schema docs | `vcq-config.yaml` | ⬜ TODO |
| 4.3 | Update AGENTS.md with new field convention | `AGENTS.md` | ⬜ TODO |
| 4.4 | Record DEC-number for this architectural decision | Decision log | ⬜ TODO |
| 4.5 | Git commit: `docs: document deploymentArchitectures field and terminology` | — | ⬜ TODO |

---

## 4. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing exports | Users with previous exports have different IDs | Keep VEND-CORE-048 as gate — existing exports still parse |
| Over-filtering hides relevant requirements | Vendor misses a requirement | Default all architectures checked; agnostic items always show |
| Misjudged architecture scope in Phase 2 | Requirement tagged incorrectly | Each tagging decision documented in commit with rationale |
| intermediary.yaml overlap with core.yaml | VEND-INT-* may duplicate VEND-CORE-049 | Verify no semantic overlap; VEND-CORE-049 is architecture-level, VEND-INT-* is operational |

---

## 5. Dependencies

- No external dependencies
- Builds on existing VCQ infrastructure (build-vcq.js, validate-vcq.js, VendorQuestionnaire.jsx)
- Parallels the RCA secondary filtering pattern
- Background analysis: [RP Deployment Architectures](./rp-deployment-architectures.md)
