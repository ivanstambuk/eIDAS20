# RCA Reference

> Extracted from AGENTS.md — reference for RCA-specific development work.

---

## RCA Extraction Rule

RCA requirements come ONLY from binding legislation (eIDAS Regulation, Implementing Acts). Never extract RCA requirements from opinions, recommendations, or position papers (e.g., EDPS formal comments). These documents may inform understanding but do not create legal obligations.

---

## RCA Profile Filter Pattern

**Profile filtering requires BOTH data AND UI:**

1. **Data annotation**: Requirements must have `profileFilter: [profile_id]` in YAML
2. **Working UI**: `ProfileSelector` component must allow individual profile selection

**Common pitfall:** If requirements don't appear/disappear when selecting profiles:
- Check `profileFilter` field exists on requirements (data layer)
- Check `ProfileSelector` allows individual selection (UI layer)

**Testing checklist:**
1. Select profile A → count requirements
2. Select profile B → count should differ if profile-specific reqs exist
3. View assessment → verify only matching requirements appear

**See:** `/rca-audit` workflow for `profileFilter` syntax and `mutatis mutandis` clause detection.

---

## RCA Category Taxonomy (12 Atomic Categories)

**Categories are globally defined** in `config/rca/categories.yaml` — the single source of truth.

| ID | Icon | Label | Single Concern |
|-----|------|-------|----------------|
| `registration` | 📋 | Registration | Notification, authorization |
| `certification` | ✅ | Certification | Audits, conformity assessment |
| `issuance` | 📤 | Issuance | Creating credentials |
| `revocation` | 🚫 | Revocation | Suspension, invalidation |
| `verification` | 🔍 | Verification | Identity proofing, auth |
| `technical` | ⚙️ | Technical | Formats, protocols, APIs |
| `interoperability` | 🌐 | Interoperability | Cross-border, standards |
| `security` | 🔒 | Security | Cybersecurity, crypto |
| `privacy` | 🛡️ | Privacy | GDPR, data protection |
| `transparency` | 👁️ | Transparency | Disclosure, policies |
| `governance` | 🏛️ | Governance | Staffing, procedures |
| `liability` | ⚖️ | Liability | Insurance, legal effects |

**Key principle:** Categories = obligation TYPE, Use cases = service CONTEXT

**Anti-pattern:**
- ❌ `category: esignature` (mixes service type with obligation type)

**Correct pattern:**
- ✅ `category: technical` + `useCases: [esignature]` (separated concerns)

---

## YAML Format Gotcha: `useCases: all` vs `useCases: [all]`

**These are NOT the same:**
- `useCases: all` → String "all" (VALID — means universal)
- `useCases: [all]` → Array with one item "all" (INVALID — validator rejects)

**The validator enforces:** If you use `all`, it must be scalar, not array.

---

## Use Case Mapping Guidance (DEC-088)

**When auditing requirements for use case mapping:**

| Role Type | Roles | Action |
|-----------|-------|--------|
| **Service-Facing** | Wallet Provider, Relying Party | Full semantic analysis required |
| **Infrastructure** | TSP, Issuer, PID, CAB, SB | Assume `useCases: all` unless legal text explicitly mentions use cases |

**Why Infrastructure Roles are Universal:**
- Their obligations govern HOW to operate (certification, auditing, oversight)
- Not WHAT services are provided
- A TSP's security requirements apply whether they issue signatures, seals, or timestamps

**Reference:** See DEC-088 Addendum in DECISIONS.md and `USE_CASE_MAPPING_SUMMARY.md` in `config/rca/`.

---

## ETSI Requirement Extraction Policy

**When implementing act annexes contain ETSI-style requirements (REQ-*, USE-*, VAL-*, etc.), these should be extracted as RCA requirements with profile filters.**

**Pattern:**
1. **Identify REQ-* patterns** in implementing act annexes
2. **Create new TSP profile** if requirements target a specific service type (e.g., `electronic_ledger`, `qwac_issuer`)
3. **Extract each REQ-* as an RCA requirement** with:
   - `profileFilter: [new_profile]`
   - `legalBasis.regulation: "YYYY/NNNN"`
   - `legalBasis.article: "Annex"`
   - `legalBasis.paragraph: "REQ-X.X-XX"`

**Examples applied:**
- **2025/2531** (Electronic Ledgers) → 15 requirements → `electronic_ledger` profile
- **2025/2527** (QWAC Standards) → 3 requirements → `qwac_issuer` profile

**Exclusions:**
- Notification/procedural annexes targeting Member States (e.g., 2025/1570 QSCD notification)
- Pure informational content without REQ-* patterns

---

## See Also

- [RCA Generator Feature](.agent/docs/features/rca-generator.md)
- [RCA Role Architecture](.agent/docs/architecture/rca-role-architecture.md)
- `/rca-audit` workflow for systematic audit procedures
