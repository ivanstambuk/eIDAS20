# Cybersecurity Act (2019/881) Import Plan

## Executive Summary

**Status: ✅ COMPLETE — Imported 2026-01-21**

- **31,287 words**, 69 articles, 110 recitals, 3 annexes
- Imported from base Formex (cellar_id: 35e93bb4-8905-11e9)
- EUR-Lex link points to consolidated version (02019R0881-20250204)
- M1 amendment (Regulation 2025/37 - managed security services) NOT applied
- Source set to `manual` to protect from overwrite

---

## Document Analysis

### Source Document
| Property | Value |
|----------|-------|
| CELEX | 32019R0881 |
| Title | Cybersecurity Act — ENISA and ICT Certification |
| Date | 17 April 2019 |
| Type | Regulation (EU) |
| Official Journal | L 151, 07/06/2019, p. 15–69 |
| Citations in eIDAS | **13** |

### Structure (From Test Conversion)
| Component | Count |
|-----------|-------|
| **Articles** | 69 |
| **Chapters/Titles** | ~10 |
| **Annexes** | 3 |
| **Total Words** | 31,659 |

### Role Relevance
- **CAB (Conformity Assessment Body)** — Certification schemes, ENISA coordination
- **TSP** — ICT product/service certification
- **Wallet Provider** — Wallet security certification framework

---

## Source Format Analysis

### Formex XML
- **Status**: ✅ **AVAILABLE** at DOC_2
- **Cellar ID**: `35e93bb4-8905-11e9-9369-01aa75ed71a1`
- **URL**: `https://publications.europa.eu/resource/cellar/35e93bb4-8905-11e9-9369-01aa75ed71a1.0006.02/DOC_2`
- **Size**: 259 KB
- **Content**: Full Formex with 69 articles + annexes

### Note
Our `eurlex_formex.py` script needs to check DOC_2 (not just DOC_1).

### HTML (Fallback)
- **Status**: ✅ Also tested and working
- **Test conversion**: 31,659 words

---

## Implementation Steps

### Phase 1: Configuration (5 min)
```yaml
- id: "2019-881-cybersecurity"
  slug: "2019-881"
  title: "Cybersecurity Act (ENISA and ICT Certification)"
  shortTitle: "Cybersecurity Act"
  celex: "32019R0881"
  type: "regulation"
  category: "referenced"
  source: "html"
```

### Phase 2: Conversion (2 min)
```bash
python3 scripts/eurlex_html_to_md.py 32019R0881 docs-portal/content/02_referenced/2019_881_Cybersecurity
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

## Priority: P3 Medium (13 citations)
