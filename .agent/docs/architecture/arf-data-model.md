# ARF Data Model Reference

> Extracted from AGENTS.md — reference for ARF-specific development work.

---

## ARF Version Tracking

| Property | Value |
|----------|-------|
| **Current version** | v2.8.0 (DEC-290) |
| **Pinned to** | `refs/tags/v2.8.0` (released 2026-02-02) |
| **Location** | `03_arf/` (copy, not submodule) |
| **Diff script** | `docs-portal/scripts/diff-arf-hlrs.py` |

---

## ARF Import Scripts (⚠️ Two Parallel Scripts)

There are **two separate ARF import scripts** with different purposes:

| Script | Input | Output | Used By |
|--------|-------|--------|---------|
| `scripts/import-arf.js` | GitHub CSV (remote fetch) | `public/data/arf-hlr-data.json` | VCQ UI (popovers, deep links, Excel export) |
| `scripts/import-arf-hlr.js` | Local `03_arf/hltr/high-level-requirements.csv` | `config/requirements/arf-hlr.json` | Requirements Browser |

**Only `import-arf.js` is in the `npm run build` pipeline.** After updating the local CSV (e.g., ARF version upgrade), you must **manually run** `import-arf-hlr.js` to update the Requirements Browser data.

---

## ARF Configuration (⚠️ Critical Config File)

**`config/arf/arf-config.yaml`** controls:
- **`relevantTopics`** — which ARF topics are imported (HLRs from unlisted topics are **silently dropped**)
- **`topicAnchors`** — anchor slugs for deep links to GitHub
- **`csvUrl`** — URL for fetching HLR data (must be pinned to a version tag, not `main`)
- **`baseUrl`** — base URL for deep links (must match `csvUrl` version)

**⚠️ If a VCQ YAML file references a topic not in `relevantTopics`, the HLR lookup will silently fail.** Always cross-check when adding new `arfReference` entries.

---

## ARF CSV Data Format (⚠️ Important for Parsing)

The HLR CSV at `03_arf/hltr/high-level-requirements.csv` has non-standard formatting:

- **Encoding:** UTF-8 with BOM — use `encoding='utf-8-sig'` in Python
- **Delimiter:** Semicolon (`;`), NOT comma
- **Columns:** `Harmonized_ID`, `Part`, `Category`, `Topic`, `Topic_Number`, `Topic_Title`, `Subsection`, `Index`, `Requirement_specification`, `Notes`
- **Key fields:**
  - `Harmonized_ID` = new-format ID (e.g., `AS-WP-09-026`)
  - `Index` = legacy/old ID (e.g., `AS-WP-09-026`)
  - `Requirement_specification` = the actual requirement text
  - "Empty" text = requirement withdrawn, consolidated, or deferred

---

## ARF Data Indices (`byHlrId` / `byHarmonizedId`)

`arf-hlr-data.json` provides lookup indices for ARF requirements:

| Index | Key Format | Example | Used By |
|-------|------------|---------|---------|
| `byHlrId` | Old ID (Index column) | `AS-AP-10-044` | Search index, backward compat |
| `byHarmonizedId` | EC Harmonized ID | `AS-AP-10-029` | VCQ references (after migration) |

**⚠️ `byHlrId` is keyed on Old ID (`row.Index`), NOT Harmonized ID.** This is the primary index used by all current VCQ lookups. Since every Old ID is unique in the CSV, no collisions occur.

**⚠️ `byHarmonizedId` has 8 duplicate keys in v2.8.0.** The EC CSV contains 656 rows but only 648 unique Harmonized IDs. Five are Topic 38 "empty tombstones" (retired requirement + content-bearing requirement share an ID), three are genuinely different requirements sharing an ID. When building `byHarmonizedId`, use a **content-wins guard** to prevent Empty tombstones from overwriting content entries:

```js
// Content-wins guard for byHarmonizedId:
if (!byHarmonizedId[harmonizedId] || !requirement.isEmpty) {
    byHarmonizedId[harmonizedId] = requirement;
}
```

---

## Key File Locations for ARF Data Consumers

| File | Purpose |
|------|---------|
| `scripts/import-arf.js` | Builds `byHlrId` + `byHarmonizedId` from remote CSV |
| `scripts/import-arf-hlr.js` | Builds Requirements Browser data from local CSV |
| `src/utils/vcq/exportExcel.js` | Excel export — looks up specs via `byHlrId` |
| `src/pages/VendorQuestionnaire.jsx` | `ARFReferenceLink` renders deep links via `byHlrId` |
| `scripts/validate-vcq.js` | Validates `hlr:` references against `byHlrId` keys |

**After the Harmonized ID migration (Phase 2 of ARF v2.8.0 upgrade):**
- VCQ YAML `arfReference.hlr` will use Harmonized IDs
- `validate-vcq.js` and `validate-vcq-arf.js` will validate against `byHarmonizedId`
- `src/utils/vcq/exportExcel.js` will look up specs via `byHarmonizedId` with `byHlrId` fallback
- Search index will display both IDs for discoverability

---

## External Reference Repositories

| Repository | Purpose | Canonical URL |
|------------|---------|---------------|
| **STS repo** | Canonical source for Technical Specifications (TS01–TS14) | `eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications` |
| **ARF repo** | Architecture Reference Framework (TS dir contains stub redirects only) | `eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework` |

**⚠️ The ARF repo's `docs/technical-specifications/` directory contains stub redirect files, NOT actual spec content.** Always link to the STS repo for TS content.

---

## Legal Source Data Pipeline Map

The portal has **multiple overlapping data sources** for regulations and standards. Before suggesting "we should add X", trace how the data flows:

| Config/Source | Build Script | Output | Scope |
|---------------|-------------|--------|-------|
| `config/rca/legal-sources.yaml` | `scripts/build-rca.js` | `rca-data.json` | **Curated RCA-only subset** — does NOT list all portal regulations |
| `config/requirements/arf-hlr.json` | Direct load (no build) | Requirements Browser | ARF HLRs for browsing |
| `01_regulation/` + `02_implementing_acts/` | `scripts/build-documents.js` | `public/data/regulations/*.json` | Full regulation content |
| `scripts/documents.yaml` | `scripts/pipeline.py` | Source markdown | Document import registry |
| `public/data/regulations-index.json` | `scripts/build-documents.js` | Sidebar + search | **Complete list of all imported regulations** |

**⚠️ `legal-sources.yaml` ≠ full regulations catalogue.** A regulation may be fully imported (in `regulations-index.json`) but absent from `legal-sources.yaml` because it isn't consumed by the RCA build pipeline.

---

## ARF Integration Notes (Phase 6)

**Topic Renumbering:** ARF v1.5 renumbered "Relying Party Intermediaries" from **Topic 45 → Topic 52**. All VCQ YAML files and `arf-config.yaml` use Topic 52.

**HLR Validation One-liner:**
```bash
# Compare VCQ HLR references against imported ARF data
grep -rh "hlr:" docs-portal/config/vcq/requirements/*.yaml | \
  sed 's/.*hlr: *//' | sed 's/"//g' | sort -u | \
  while read hlr; do grep -q "\"$hlr\"" docs-portal/public/data/arf-hlr-data.json && echo "✅ $hlr" || echo "❌ $hlr NOT FOUND"; done
```

**Build Pipeline:** ARF is integrated into the main build:
- `npm run build:arf` — Import ARF CSV → `arf-hlr-data.json` (143 HLRs)
- `npm run build:search` — Includes ARF HLRs in search index (129 non-empty)
- `npm run build` — Runs both automatically

**ARF Topics Imported:** 1 (OIA_*), 6 (RPA_*), 7 (VCR_*), 27 (Reg_*), 44 (RPRC_*), 52 (RPI_*)

---

## HLR CSV Delimiter (Gotcha)

The ARF High-Level Requirements CSV uses **semicolons (`;`)** as delimiter, NOT commas. When searching for exact HLR matches:

```bash
# ✅ Correct — semicolon delimiter, exact match
grep ";AS-AP-42-003;" docs-portal/data/arf/high-level-requirements.csv

# ❌ Wrong — comma search finds nothing
grep ",AS-AP-42-003," docs-portal/data/arf/high-level-requirements.csv
```

**Pre-compiled index:** See `.agent/session/hlr-index-by-track.md` for a quick-reference index grouped by VCQ track.
