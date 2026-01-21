# NIS2 Directive (2022/2555) Import Plan

## Executive Summary

**Status: ✅ FEASIBLE — Formex XML available**

The NIS2 Directive has Formex XML available as a ZIP package. Requires minor script update to handle ZIP extraction and Directive CELEX type.

---

## Document Analysis

### Source Document
| Property | Value |
|----------|-------|
| CELEX | 32022L2555 |
| Title | NIS2 Directive — Network and Information Security |
| Date | 14 December 2022 |
| Type | Directive (EU) |
| Official Journal | L 333, 27/12/2022, p. 80–152 |
| Citations in eIDAS | **30** |

### Structure (Estimated from HTML)
| Component | Count |
|-----------|-------|
| **Articles** | 46 |
| **Chapters** | ~8 |
| **Annexes** | 3 |
| **Total Size** | ~700 KB HTML |

### Role Relevance
- **Wallet Provider** — Security incident reporting
- **TSP** — Cybersecurity obligations for essential entities
- **PID Provider** — May be classified as essential entity

---

## Source Format Analysis

### Formex XML
- **Status**: ✅ **AVAILABLE** as ZIP package
- **Cellar ID**: `9b84d482-85bd-11ed-9887-01aa75ed71a1`
- **URL**: `https://publications.europa.eu/resource/cellar/9b84d482-85bd-11ed-9887-01aa75ed71a1.0006.02/DOC_1`
- **Format**: ZIP containing:
  - `L_2022333EN.01008001.xml` (310 KB - main content)
  - `L_2022333EN.01014301.xml` (Annex I)
  - `L_2022333EN.01014801.xml` (Annex II)
  - `L_2022333EN.01015001.xml` (Annex III)

### Note on Formex Discovery
NIS2 returns a ZIP file, not raw XML. Our script needs to handle ZIP extraction.

### HTML (Fallback)
- **Status**: ✅ Also available
- **Size**: 704 KB

---

## Implementation Steps

### Phase 0: Converter Update
**NOT NEEDED** — The Formex pipeline (`eurlex_formex.py` + `formex_to_md_v3.py`) already:
- Handles ZIP packages with multiple XML files
- Works with any CELEX format (no validation regex)
- Merges annex files automatically

### Phase 1: Configuration (5 min)
1. Add NIS2 entry to `documents.yaml`:
```yaml
- id: "2022-2555-nis2"
  slug: "2022-2555"
  title: "NIS2 Directive (Network and Information Security)"
  shortTitle: "NIS2"
  celex: "32022L2555"
  type: "directive"
  category: "referenced"
  source: "html"
```

### Phase 2: Conversion & Build (7 min)
1. Run converter
2. Build and verify

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Directive parsing differences | Low | Use same article extraction logic |
| Annex structure issues | Medium | Test annex extraction |

---

## Estimated Effort

| Phase | Time |
|-------|------|
| Configuration | 5 min |
| Conversion & build | 7 min |
| **Total** | **~12 min** |

---

## Priority: P2 High (30 citations)
