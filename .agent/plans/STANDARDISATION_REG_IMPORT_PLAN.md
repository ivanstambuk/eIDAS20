# EU Standardisation Regulation (1025/2012) Import Plan

## Executive Summary

**Status: ✅ FEASIBLE — Ready to implement**

The EU Standardisation Regulation can be imported immediately using the existing HTML converter. Test conversion was successful.

---

## Document Analysis

### Source Document
| Property | Value |
|----------|-------|
| CELEX | 32012R1025 |
| Title | European Standardisation Regulation |
| Date | 25 October 2012 |
| Type | Regulation (EU) |
| Official Journal | L 316, 14/11/2012, p. 12–33 |
| Citations in eIDAS | **2** (minimal) |

### Structure (From Test Conversion)
| Component | Count |
|-----------|-------|
| **Articles** | 30 |
| **Chapters** | ~14 sections |
| **Annexes** | 3 |
| **Total Words** | 13,516 |

### Role Relevance
- **General** — Framework for adopting European standards (EN)
- **CAB** — Standards for conformity assessment
- Limited direct applicability to wallet ecosystem roles

---

## Source Format Analysis

### Formex XML
- **Status**: ❌ Not available (pre-2015 regulation)
- **Cellar check**: DOC_1, DOC_2 both return 404
- **Reason**: Older regulations may not have structured Formex in EU Publications Cellar

### HTML
- **Status**: ✅ Available and tested
- **Converter**: ✅ Works perfectly
- **Test conversion**: 13,516 words, 30 articles

### Recommendation
Use HTML fallback — this is the correct approach for pre-2015 regulations.
```yaml
- id: "2012-1025-standardisation"
  slug: "2012-1025"
  title: "European Standardisation Regulation"
  shortTitle: "Standardisation Reg"
  celex: "32012R1025"
  type: "regulation"
  category: "referenced"
  source: "html"
```

### Phase 2: Conversion (2 min)
```bash
python3 scripts/eurlex_html_to_md.py 32012R1025 docs-portal/content/02_referenced/2012_1025_Standardisation
```

### Phase 3: Build & Verify (5 min)
Standard build and browser verification.

---

## Estimated Effort

| Phase | Time |
|-------|------|
| Configuration | 5 min |
| Conversion | 2 min |
| Build & verify | 5 min |
| **Total** | **~12 min** |

---

## Priority: P5 Low (only 2 citations)

### Recommendation
This regulation is low priority due to minimal citations (only 2) in eIDAS documents. It provides general framework for European standards but is not directly applicable to most wallet ecosystem roles. Consider deferring until higher-priority items are complete, or skip entirely if backlog needs trimming.
