# Conversion Guidelines

> Extracted from AGENTS.md — reference for document import processes.

---

## 🚨 MANDATORY: Markdown-First Import Strategy (DEC-095)

**All imported documents are `source: manual`.** The markdown IS the source of truth.

**For EXISTING documents (the normal case):**
- Fix formatting issues **directly in the markdown file**
- Never re-run the converter on existing documents
- No need to debug converter for single-document fixes

**For NEW document imports only:**
1. Use converter (`eurlex_formex.py`) for initial import
2. Validate the output in the portal
3. Set `source: manual` in `documents.yaml` immediately
4. Fix any remaining issues in markdown

**Why this matters:**
- Converters are **import tools**, not regeneration pipelines
- Re-importing overwrites manual corrections
- Debugging converter bugs for existing documents wastes time

**Anti-patterns:**
- ❌ Re-running converter to "fix" an existing document
- ❌ Spending hours debugging converter for a one-document issue
- ❌ Assuming markdown can be regenerated (it can't without losing corrections)

**Correct patterns:**
- ✅ See issue in existing document → Fix markdown directly
- ✅ Importing NEW document → Use converter → Mark `source: manual`
- ✅ Widespread converter bug affecting future imports → Fix converter

**See:** DEC-095 in DECISIONS.md for full rationale.

---

## ⚠️ Formex Converter ARCHIVED (2026-01-21)

**The Formex XML → Markdown converter has been archived to `.legacy/formex_to_md_v3.py`.**

**DO NOT re-run the converter on existing regulations.** This has caused regressions twice:
- 2026-01-21: Commit `522e0bc` re-imported eIDAS via converter, scrambling article order (5a-45 appeared after Article 52)
- The same regression was fixed in `13a906c` but reintroduced when re-running converter

**The converter may be used in the future for importing NEW Formex-based documents, but existing markdown files are the authoritative source.**

---

## ⚠️ Known Pitfall: eIDAS Article Order Regression

**Symptom:** Articles 5a through 45 appear to be "missing" from the portal's Table of Contents.

**Actual cause:** Articles are present but out of order in the markdown file (5 → 46 → 47 → ... → 52 → 5a → 5b → ... → 45).

**Root cause:** Re-running the Formex converter produces articles in the wrong order for consolidated eIDAS.

**Fix:** Restore correct article order from a known-good git commit. Do NOT re-run the converter.

**Prevention:** The converter is now archived. Edit markdown directly for fixes.

---

## Formex Multi-Part Document Handling

When importing EUR-Lex documents via `eurlex_formex.py`, the script handles multi-part Formex ZIP archives:

**File Naming Convention:**
| Pattern | Description |
|---------|-------------|
| `L_XXXXXXEN.000101.fmx.xml` | Main document (preamble, recitals, articles) |
| `L_XXXXXXEN.000[2-9]XX.fmx.xml` | Annexes (tables, appendices) |

**Processing Logic:**
1. **Main document detection:** The script explicitly identifies `.000101.fmx.xml` as the main body
2. **Annex merging:** Files matching `.000[2-9]\d{2}\.` are merged into the main document's Markdown
3. **Metadata injection:** CELEX header is auto-generated for proper portal badge display

**Anti-patterns:**
- ❌ Manually running `formex_to_md_v3.py` on individual annex files
- ❌ Assuming the last `.000` file is the main document

**Correct pattern:**
- ✅ Use `eurlex_formex.py` which handles multi-part merging automatically
- ✅ Let the script select `.000101` as main and merge higher-numbered files as annexes

---

## Consolidated Import Strategy

**When the consolidated Formex is unavailable but amendments exist:**

| Step | Action |
|------|--------|
| 1. Check consolidated Formex | Try consolidated CELEX (0YYYYRNNNN-DATE) on EUR-Lex |
| 2. If unavailable | Fall back to base CELEX (3YYYYRNNNN) |
| 3. Import via Formex | Use `eurlex_formex.py` with base CELEX |
| 4. Apply corrigenda | Manually apply any corrigenda (R01, R02, etc.) |
| 5. Update documents.yaml | Set `celex` to consolidated, `source: manual`, add comments |
| 6. Add note to markdown | Add **Note:** line about amendment status |

**Example (Cybersecurity Act):**
```yaml
# documents.yaml
- celex: 02019R0881-20250204              # Consolidated CELEX for EUR-Lex link
  source: manual                           # Protects from overwrite
  cellar_id: 35e93bb4-8905-11e9...        # Original Formex source
  # NOTE: Imported from base CELEX, M1 (2025/37) not applied
```

**Why this pattern:**
- EUR-Lex link shows users the **latest consolidated text**
- `source: manual` prevents accidental overwrites
- Comments document what amendments are/aren't applied
- Original `cellar_id` preserves provenance

**Applied to:** GDPR, NIS2, Cybersecurity Act

---

## CELEX Format Guide

| Prefix | Meaning | Example |
|--------|---------|---------|
| `3` | Base/original act | `32012R1025` (Standardisation Regulation) |
| `0` | Consolidated version | `02012R1025-20241213` (with amendments applied) |
| `C` | Corrigendum | `32014R0910R(01)` |

**Pattern:** `[Prefix][Year][Type][Number][-ConsolidationDate]`

**For consolidated imports:**
- EUR-Lex link should use `0xxxx` (consolidated CELEX) so users see latest version
- If consolidated version lacks preamble/recitals, merge from base version (see below)

---

## Preamble Merge Pattern (Consolidated Documents)

**EUR-Lex consolidated versions often omit preamble and recitals.** When this happens:

1. **Import consolidated version** (`0xxxx` CELEX) for enacting terms
2. **Import base version** (`3xxxx` CELEX) for preamble/recitals
3. **Merge:** Base preamble/recitals + Consolidated enacting terms
4. **Add note to metadata:** `> **Note:** Enacting terms from consolidated version (0xxxxx). Preamble merged from base version (3xxxxx).`

**Applied to:** Standardisation Regulation (1025/2012)
