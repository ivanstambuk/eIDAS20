# eIDAS 2.0 Knowledge Base - Work Tracker

> **This is a live document.** Update after each work session.

---

## Current Session Status

| Field | Value |
|-------|-------|
| **Last Updated** | 2026-01-13 21:54 CET |
| **Session State** | 🔧 Converter Bug Fixed |
| **Next Action** | Finalize and replace `32024R1183.md` with fixed version |

---

## 🔧 In Progress: Amending Regulation Date Fix

### Bug Identified & Fixed
**Issue**: The Formex v3 converter was extracting `ARTICLE` elements inside `QUOT.S` blocks **twice**:
1. ✅ Correctly as blockquoted replacement content (with dates like "21 May 2026")
2. ❌ Incorrectly as standalone article headers (losing the dates)

**Root Cause**: `extract_articles()` in `formex_to_md_v3.py` used `.findall('.//ARTICLE')` without filtering out articles nested inside `QUOT.S` blocks.

**Fix Applied**: Added logic to build a set of nested `ARTICLE` elements and skip them during extraction.

### Test Suite Created
New file: `scripts/test_formex_converter.py` with **21 unit tests** covering:
- Basic text extraction
- DATE element handling (including non-breaking spaces `\xa0`)
- Nested element processing (HT, NOTE, QUOT markers)
- Amendment list processing
- **Duplicate article extraction bug** (the new test)
- Real-world XML validation against actual Formex files

**All 21 tests pass ✅**

### Files Created/Modified This Session
| File | Action |
|------|--------|
| `scripts/formex_to_md_v3.py` | Fixed `extract_articles()` to skip QUOT.S-nested articles |
| `scripts/test_formex_converter.py` | Created comprehensive unit test suite |
| `AGENTS.md` | Added MANDATORY Test-Driven Conversion Rule |
| `01_regulation/2024_1183_eIDAS2_Amending/32024R1183_v3_fixed.md` | Generated with bug fix |

### Pending Next Session
1. ✅ Verify `32024R1183_v3_fixed.md` content is complete
2. 📋 Replace `32024R1183.md` with the fixed version
3. 🧹 Clean up temp files (`32024R1183_test.md`, etc.)
4. ✅ Run linter on final file
5. 📝 Git commit all changes

---

## ✅ V3 Migration Complete (Earlier)

### Results

| Category | Count | Status |
|----------|-------|--------|
| Core Regulations | 2 | ✅ Linter: 0 issues |
| Implementing Acts | 30 | ✅ Linter: 0 issues |
| **Total** | **32** | **✅ All Clean** |

---

## Document Inventory

| Directory | Files | Status |
|-----------|-------|--------|
| `01_regulation/` | 2 | ✅ Complete |
| `02_implementing_acts/` | 30 | ✅ Complete |
| `backup_v2_originals/` | 33 | 📦 Archived |

---

## Scripts Updated

| Script | Purpose |
|--------|---------|
| `formex_to_md_v3.py` | V3 converter with QUOT.S handling + duplicate fix |
| `test_formex_converter.py` | Unit tests for converter (21 tests) |
| `migrate_v3.py` | Batch migration with header preservation |
| `fix_format_issues.py` | FORMAT005/006 bulk fixer |

---

## Session History

| Date | Summary |
|------|---------|
| 2026-01-13 (Late Night) | **Bug Fix**: Fixed duplicate ARTICLE extraction in QUOT.S blocks, created unit test suite (21 tests), updated AGENTS.md with test-driven conversion rule |
| 2026-01-13 (Night) | **V3 Migration**: Fixed converter bug, downloaded missing Formex XML for 15 docs, converted all 32 documents, applied formatting fixes, linter validation: 0 issues |
| 2026-01-13 (PM) | Discovered 15 new implementing acts, downloaded via Formex v2 pipeline |
| 2026-01-13 (AM) | Initial setup, downloaded original 15 regulations, Formex v2 conversion |

---

*End of Tracker*

