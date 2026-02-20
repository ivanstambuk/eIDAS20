# VCQ Architecture (Vendor Compliance Questionnaire)

> Extracted from AGENTS.md — reference for VCQ-specific development work.

---

## Source Group Counting Logic

**VCQ requirements are counted in source groups based on their `legalBasis.regulation` field.**

| Source Group | Regulations Included |
|--------------|---------------------|
| `eidas` | 2014/910, 2024/1183, 2015/1501, 2015/1502, etc. |
| `gdpr` | 2016/679 |
| `dora` | 2022/2554 |
| `arf` | **Cross-cutting** — any requirement with `arfReference` |

**⚠️ ARF is cross-cutting:** Requirements with `arfReference` are counted in BOTH their legal source AND in ARF. This means:
- A requirement with `legalBasis: 2014/910` AND `arfReference: {topic: "Topic 7", hlr: "AS-AP-07-001"}` appears in BOTH eIDAS (116) AND ARF (78)
- The tile counts (116 + 28 + 78) sum to more than total unique requirements (144) because of this overlap

**Relevant file:** `docs-portal/scripts/build-vcq.js`, function `determineSourceGroup()`

---

## Valid VCQ Categories (13 total)

Requirements must use one of these category IDs:

| Category ID | Description |
|-------------|-------------|
| `data_governance` | Data handling and storage |
| `identity_verification` | User identity proofing |
| `interoperability` | Cross-system compatibility |
| `operational_security` | Runtime security measures |
| `privacy` | GDPR, data protection |
| `cryptographic` | Cryptographic operations |
| `wallet_integration` | EUDIW integration |
| `credential_management` | Attestation lifecycle |
| `technical` | Formats, protocols, APIs |
| `compliance` | Regulatory alignment |
| `transparency` | Disclosure, policies |
| `governance` | Staffing, procedures |
| `liability` | Insurance, legal effects |

**⚠️ Common mistake:** Using `notification` instead of `transparency`. These are equivalent — use `transparency`.

**Validation:** `npm run validate:vcq` checks category validity.

---

## arfReference Schema

The `arfReference` field links a VCQ requirement to ARF HLRs:

```yaml
# Single HLR (string format)
arfReference:
  topic: "Topic 7"
  hlr: "AS-AP-07-001"

# Multiple HLRs (array format) — preferred for multi-HLR coverage
arfReference:
  topic: "Topic 7"
  hlr: ["AS-AP-07-001", "AS-AP-07-003", "AS-AP-07-004"]
```

**Both formats are valid.** The build script and validators handle both.

**⚠️ YAML Array Gotcha:** When appending to YAML files via shell `cat >>`, you create strings, NOT arrays:

```bash
# ❌ WRONG — creates: hlr: "AS-AP-07-001, AS-AP-07-003" (a single string)
cat >> file.yaml << EOF
  hlr: AS-AP-07-001, AS-AP-07-003
EOF

# ✅ CORRECT — creates proper array
cat >> file.yaml << EOF
  hlr:
    - AS-AP-07-001
    - AS-AP-07-003
EOF
```

---

## deploymentArchitectures Schema (DEC-289)

The `deploymentArchitectures` field tags a VCQ requirement to specific connector deployment models:

```yaml
# Agnostic (applies to all architectures) — omit field or leave empty
deploymentArchitectures: []

# Architecture-specific (applies only to listed models)
deploymentArchitectures:
  - intermediary
  - direct_saas
  - direct_onprem
```

| Value | Badge | Color | Description |
|-------|-------|-------|-------------|
| `intermediary` | INT | Blue (#3b82f6) | Vendor acts as RP on behalf of customer |
| `direct_saas` | SaaS | Purple (#8b5cf6) | Vendor provides hosted connector, customer is RP |
| `direct_onprem` | OnPrem | Emerald (#10b981) | Customer deploys vendor software on own infra |

**Filtering logic:** Union semantics. A requirement appears if ANY of its architectures match the selected filter. Agnostic requirements (empty/absent field) always appear.

**Visibility:** Step 2b only renders when Role=Relying Party AND Category=Connector. Schema defined in `config/vcq/vcq-config.yaml` under `deploymentArchitectures`.

---

## Dual legalBasis YAML Schema

The `legalBasis` field in VCQ requirement YAML can be **either a single object or an array of objects**:

```yaml
# Single legal basis (object)
legalBasis:
  regulation: 2022/2554
  article: Article 30
  paragraph: "2"

# Multiple legal bases (array)
legalBasis:
  - regulation: 2022/2554
    article: Article 30
    paragraph: "2(e)"
  - regulation: 2016/679
    article: Article 28
    paragraph: "3(h)"
```

**Both formats are valid.** The build script and validators handle both. Common for ICT/DORA track where DORA and GDPR create parallel obligations.

---

## Full-File Overwrite Guidance

When enhancing VCQ requirements in bulk (>50% of content changing), **full-file overwrite via `write_to_file` is faster and less error-prone** than surgical edits via `multi_replace_file_content`.

| When | Approach |
|------|----------|
| Modifying >50% of file, file <500 lines | Full-file overwrite (`write_to_file`) |
| Modifying <20% of file | Surgical edits (`multi_replace_file_content`) |
| File >500 lines | Surgical edits to avoid context errors |

**Why:** VCQ requirement files are typically 200-500 lines. When enhancing every requirement's explanation and adding legalText, the diff is so large that re-writing the file is simpler.

---

## VCQ Export Formats

| Format | Button | File Type | Features |
|--------|--------|-----------|----------|
| **Markdown** | 📝 Export Markdown | `.md` | Human-readable, includes explanations |
| **Excel** | 📊 Export Excel | `.xlsx` | 3 sheets (Summary, Requirements, Legal References), styled columns, obligation colors |

**Excel export features:**
- Summary sheet with status counts and obligation breakdown
- Requirements sheet with ARF Reference column
- Legal References sheet with full legal text
- Color-coded status badges (Compliant/Non-Compliant/Pending)
- Obligation styling (MUST = red, SHOULD = yellow, MAY = green)

**Relevant files:**
- `docs-portal/src/utils/vcq/exportExcel.js` — Excel export utility
- `docs-portal/src/pages/VendorQuestionnaire.jsx` — ExportPanel component
