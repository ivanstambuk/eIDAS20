# ePrivacy Directive (2002/58) Import Plan

## Executive Summary

**Status: ✅ IMPORTED & FORMATTED**

The ePrivacy Directive has been successfully imported via HTML fallback and manually formatted to match EUR-Lex styling. Key formatting fixes applied:
- Alphanumeric paragraphs (1a, 1b) converted to `- (1a)` format for deep linking
- Article 4(1a) restructured with nested em-dash bullets
- All articles have proper numbered paragraph spacing
- Recitals formatted as `- (N)` for gutter icons

---


## Document Analysis

### Source Document
| Property | Value |
|----------|-------|
| CELEX (Original) | 32002L0058 |
| CELEX (Consolidated) | 02002L0058-20091219 |
| Title | ePrivacy Directive — Privacy in Electronic Communications |
| Date | 12 July 2002 (amended 2009) |
| Type | Directive (EC) |
| Official Journal | L 201, 31/07/2002, p. 37–47 |
| Citations in eIDAS | **30** |

### Structure (Estimated)
| Component | Count |
|-----------|-------|
| **Articles** | ~19 |
| **Chapters** | None (simple structure) |
| **Total Size** | ~70 KB HTML (consolidated) |

### Role Relevance
- **Relying Party** — Consent for electronic communications
- **Wallet Provider** — Cookie/tracking rules for wallet UIs

---

## Source Format Analysis

### Formex XML
- **Status**: ❌ Not available (2002 regulation)
- **Cellar check**: Returns PDF only, no Formex XML
- **Reason**: Pre-2010 regulations typically lack structured Formex

### HTML
- **Status**: ✅ Available
- **Consolidated URL**: `https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02002L0058-20091219`
- **Size**: 70 KB
- **Note**: Should use consolidated version (amended 2009)

### Converter Status
- **Issue**: `eurlex_html_to_md.py` needs to support:
  1. Directive CELEX type "L"
  2. Consolidated CELEX format `0YYYYLNNNN-YYYYMMDD`

### Recommendation
Use HTML fallback with converter update for Directive support.

### Phase 1: Configuration (5 min)
```yaml
- id: "2002-58-eprivacy"
  slug: "2002-58"
  title: "ePrivacy Directive (Privacy in Electronic Communications)"
  shortTitle: "ePrivacy"
  celex: "02002L0058-20091219"
  type: "directive"
  category: "referenced"
  source: "html"
  consolidated: true
```

### Phase 2: Conversion & Build (7 min)
Standard process.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Old HTML structure differs | Medium | Medium | Manual testing |
| Consolidated URL issues | Medium | Low | Verify URL patterns |

---

## Estimated Effort

| Phase | Time |
|-------|------|
| Converter update | 15 min |
| Configuration | 5 min |
| Conversion & build | 7 min |
| **Total** | **~27 min** |

---

## Priority: P4 Low (30 citations, but less directly applicable to wallet ecosystem)

### Note on ePrivacy
While highly cited, ePrivacy is less directly relevant to the EUDI Wallet roles than GDPR or NIS2. It primarily concerns electronic communications privacy (cookies, traffic data) rather than identity management infrastructure. Consider implementing after higher-priority items.
