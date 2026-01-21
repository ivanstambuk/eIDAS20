# GDPR (2016/679) Import Plan

## Executive Summary

**Status: ✅ FEASIBLE — Ready to implement**

The GDPR can be successfully imported using the existing `eurlex_html_to_md.py` converter. A test conversion produced high-quality Markdown with proper structure.

---

## Document Analysis

### Source Document
| Property | Value |
|----------|-------|
| CELEX | 32016R0679 |
| Title | General Data Protection Regulation |
| Date | 27 April 2016 |
| Type | Regulation (EU) |
| Official Journal | L 119, 04/05/2016, p. 1–88 |

### Structure
| Component | Count |
|-----------|-------|
| **Articles** | 99 |
| **Chapters** | 11 |
| **Recitals** | 173 |
| **Total Words** | ~55,000 |
| **Annexes** | 0 (GDPR has no annexes) |

### Chapters
1. I — General provisions (Art 1-4)
2. II — Principles (Art 5-11)
3. III — Rights of the data subject (Art 12-23)
4. IV — Controller and processor (Art 24-43)
5. V — Transfers to third countries (Art 44-50)
6. VI — Independent supervisory authorities (Art 51-59)
7. VII — Cooperation and consistency (Art 60-76)
8. VIII — Remedies, liability, penalties (Art 77-84)
9. IX — Specific processing situations (Art 85-91)
10. X — Delegated and implementing acts (Art 92-93)
11. XI — Final provisions (Art 94-99)

---

## Source Format Analysis

### Formex XML
- **Status**: ✅ **AVAILABLE** (was missed by initial check)
- **Cellar ID**: `3e485e15-11bd-11e6-ba9a-01aa75ed71a1`
- **URL**: `https://publications.europa.eu/resource/cellar/3e485e15-11bd-11e6-ba9a-01aa75ed71a1.0006.02/DOC_2`
- **Size**: 428 KB
- **Content**: Full Formex with all 99 articles, 11 chapters

### Note on Formex Discovery
Our `eurlex_formex.py` script only checks DOC_1 (which is a wrapper file). GDPR content is in DOC_2.
This is a minor script fix.

### HTML (Fallback)
- **Status**: ✅ Also available
- **URL**: `https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679`

---

## Test Conversion Results

### Command
```bash
python3 scripts/eurlex_html_to_md.py 32016R0679 /tmp/gdpr_output
```

### Output
| Metric | Value |
|--------|-------|
| Lines | 2,121 |
| Words | 55,109 |
| File Size | ~400 KB |

### Quality Assessment
- ✅ All 99 articles extracted
- ✅ All 11 chapters with correct titles
- ✅ Recitals properly formatted as bullet list
- ✅ Sections within chapters preserved
- ✅ Paragraph numbering maintained
- ✅ Cross-references intact

---

## Implementation Steps

### Phase 1: Configuration (5 min)
1. Add GDPR entry to `docs-portal/config/documents.yaml`:
```yaml
- id: "2016-679-gdpr"
  slug: "2016-679"
  title: "General Data Protection Regulation (GDPR)"
  shortTitle: "GDPR"
  celex: "32016R0679"
  type: "regulation"
  category: "referenced"
  source: "html"  # Use HTML fallback
  eurlex: "https://eur-lex.europa.eu/eli/reg/2016/679/oj"
```

### Phase 2: Conversion (2 min)
1. Run HTML converter:
```bash
python3 scripts/eurlex_html_to_md.py 32016R0679 docs-portal/content/02_referenced/2016_679_GDPR
mv docs-portal/content/02_referenced/2016_679_GDPR/32016R0679.md docs-portal/content/02_referenced/2016_679_GDPR/regulation.md
```

### Phase 3: Build & Verify (5 min)
1. Run content build:
```bash
cd docs-portal && npm run build:content
```
2. Verify in browser:
   - Check GDPR appears in document list
   - Verify chapter collapsing works
   - Confirm article deep-linking

### Phase 4: TOC Enhancement (Optional, 10 min)
- Add GDPR chapter structure to `EIDAS_CHAPTERS` fallback in `CollapsibleTOC.jsx` if dynamic detection fails
- Note: Dynamic chapter extraction should work since chapters use "I.", "II." pattern

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Chapter detection fails | Low | Add hardcoded GDPR_CHAPTERS mapping |
| Missing sections | Low | Sections detected in test output |
| Deep-link issues | Low | Standard article IDs detected |

---

## Estimated Effort

| Phase | Time |
|-------|------|
| Configuration | 5 min |
| Conversion | 2 min |
| Build & verify | 5 min |
| Total | **~15 min** |

---

## Decision Required

**Proceed with import?**
- [ ] Yes — Execute Phase 1-3
- [ ] Yes + TOC — Execute Phase 1-4
- [ ] No — Park for later
