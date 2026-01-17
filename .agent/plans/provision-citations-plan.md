# DEC-064: Provision Citations Implementation Plan

**Status**: Proposed  
**Created**: 2026-01-17  
**Decision**: Implement provision-level deep links for legal citations (Article, Paragraph, Point, Recital, Annex references)

---

## 1. Overview

### Problem Statement
Currently, citations link to the **root** of a document (e.g., `#/regulation/910-2014`). When legal text references a specific provision like "Article 5(1) of Regulation 910/2014", users must manually scroll to find Article 5, paragraph 1.

### Solution
Extend the build-time citation system to:
1. **Detect** provision references (Article, Paragraph, Point, Recital, Annex)
2. **Associate** provisions with their parent documents
3. **Generate** deep links with `?section=` query parameters
4. **Enhance** popovers to display provision-level context

### Scope (Confirmed with User)
| Aspect | Decision |
|--------|----------|
| **Reference Types** | Cross-document + intra-document |
| **Matching Strategy** | Explicit ("Article X of DocY") + same-sentence association |
| **External Documents** | Show provision info, link to EUR-Lex root (no deep link) |
| **Popover Display** | Provision reference + standard document info |
| **Architecture** | Build-time only (deterministic, testable) |

---

## 2. Provision Reference Patterns

### 2.1 Article References
```
Article 5                          → article-5
Article 5(1)                       → article-5-para-1
Article 5(1)(a)                    → article-5-para-1-point-a
Article 5(1), point (a)            → article-5-para-1-point-a
Article 24(2), points (e) and (f)  → [article-24-para-2-point-e, article-24-para-2-point-f]
Articles 4 and 5                   → [article-4, article-5]
Article 5a                         → article-5a (note: letter suffix, not paragraph)
```

### 2.2 Paragraph References (standalone)
```
paragraph 1                        → (needs article context)
paragraphs 1 and 2                 → (needs article context)
```

### 2.3 Recital References
```
recital 75                         → recital-75
Recital (42)                       → recital-42
recitals 10 and 11                 → [recital-10, recital-11]
```

### 2.4 Annex References
```
Annex I                            → annex-i
Annex II                           → annex-ii
Annex VII                          → annex-vii
point 1 of Annex I                 → annex-i (point anchoring TBD)
```

### 2.5 Association Patterns
```
// Explicit: provision + "of" + document
"Article 5(1) of Regulation (EU) No 910/2014"
→ { provision: "article-5-para-1", celex: "32014R0910" }

// Same-sentence: provision appears before/after document in same sentence
"The requirements in Article 24(2) of [Regulation 910/2014] apply."
→ { provision: "article-24-para-2", celex: "32014R0910" }

// Intra-document: provision without document reference
"See paragraph 3" (within 910-2014)
→ { provision: "...-para-3", context: "current-document" }
```

---

## 3. Data Model Extension

### 3.1 Current Citation Object
```javascript
{
  shortName: "Regulation 910/2014",
  celex: "32014R0910",
  isInternal: true,
  url: "#/regulation/910-2014",
  humanName: "Electronic Identification...",
  // ... existing fields
}
```

### 3.2 Extended Citation Object (Provision-Aware)
```javascript
{
  // Existing fields...
  shortName: "Regulation 910/2014",
  celex: "32014R0910",
  isInternal: true,
  
  // NEW: Provision-level fields
  provision: {
    type: "article",           // article | recital | annex | paragraph | point
    display: "Article 5(1)",   // Human-readable display
    anchor: "article-5-para-1", // ID for deep linking
    full: "Article 5(1) of Regulation (EU) No 910/2014" // Original text span
  },
  
  // Updated URL with deep link
  url: "#/regulation/910-2014?section=article-5-para-1",
}
```

### 3.3 Citation JSON Structure
Each document's citation JSON (`public/data/citations/910-2014.json`) will have:
```javascript
{
  citations: [
    // Document-level citation (no provision)
    { shortName: "Regulation 2024/1183", celex: "32024R1183", ... },
    
    // Provision-level citation (NEW)
    { 
      shortName: "Regulation 910/2014", 
      celex: "32014R0910",
      provision: { type: "article", display: "Article 5(1)", anchor: "article-5-para-1" },
      url: "#/regulation/910-2014?section=article-5-para-1",
      ...
    }
  ]
}
```

---

## 4. Implementation Phases

### Phase 1: Provision Pattern Extraction (build-citations.js)
**Goal**: Extract provision references and associate with documents

#### 4.1.1 Create Provision Parser Module
**File**: `docs-portal/scripts/provision-parser.js`

```javascript
// Export functions:
// - parseProvisionReference(text) → { type, display, anchor }
// - findProvisionDocumentAssociations(sentence, documentCitations) → associations[]
// - generateAnchor(provision) → string
```

**Patterns to implement**:
```javascript
const PATTERNS = {
  // Article with optional paragraph and point
  article: /Article\s+(\d+[a-z]?)(?:\((\d+)\))?(?:,?\s*(?:point|points)\s*\(([a-z])\))?/gi,
  
  // Recital
  recital: /[Rr]ecital(?:s)?\s*\(?(\d+)\)?/gi,
  
  // Annex with Roman numerals
  annex: /Annex\s+([IVX]+)/gi,
  
  // "of [Document]" association
  ofDocument: /of\s+(Regulation|Directive|Decision)\s+\([A-Z]+\)\s+(?:No\s+)?(\d+\/\d+)/i,
};
```

#### 4.1.2 Integrate with extractCitations()
Modify `build-citations.js` to:
1. Call provision parser for each detected citation
2. Generate deep link URLs for internal documents
3. Store provision metadata in citation object

**Deliverables**:
- [ ] `provision-parser.js` with exported functions
- [ ] Unit tests for pattern matching (`test_provision_parser.py` or inline Jest)
- [ ] Integration in `extractCitations()` and `extractInformalCitations()`

---

### Phase 2: Popover Enhancement (Frontend)
**Goal**: Update citation popovers to display provision info

#### 4.2.1 Update Popover Template
**File**: `src/utils/citationPopoverTemplate.js`

Add provision display section:
```html
<!-- If citation has provision -->
<div class="citation-popover-provision">
  <span class="provision-icon">📍</span>
  <span class="provision-text">Article 5(1)</span>
</div>
```

#### 4.2.2 CSS Styling
**File**: `src/components/CitationPopover/CitationPopover.css`

```css
.citation-popover-provision {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.citation-popover-provision .provision-text {
  font-weight: 600;
  color: var(--accent-info);
}
```

**Deliverables**:
- [ ] Updated `generatePopoverContent()` for provision display
- [ ] CSS styling for provision section
- [ ] Browser verification

---

### Phase 3: HTML Transformation (useCitations.js)
**Goal**: Transform provision citations in rendered content

#### 4.3.1 Update Citation Span Generation
**File**: `src/hooks/useCitations.js`

Add provision data attributes:
```javascript
// If citation has provision info
if (citation.provision) {
  span.setAttribute('data-citation-provision-type', citation.provision.type);
  span.setAttribute('data-citation-provision-display', citation.provision.display);
  span.setAttribute('data-citation-provision-anchor', citation.provision.anchor);
}
```

#### 4.3.2 Update Click Handler
When clicking a provision citation on an internal document, navigate with `?section=`:
```javascript
if (isInternal && provisionAnchor) {
  navigate(`${baseRoute}?section=${provisionAnchor}`);
}
```

**Deliverables**:
- [ ] Data attribute injection for provision citations
- [ ] Click-to-navigate with deep link
- [ ] Popover hydration reads provision attributes

---

### Phase 4: Intra-Document References
**Goal**: Handle "see paragraph 3" style references within the same document

#### 4.4.1 Context Tracking
During Markdown processing, track:
- Current article being processed
- Allow relative paragraph/point references

**Strategy**: 
- At build time, when processing a document, detect "paragraph X" or "point (a)" without explicit article
- If preceded by an Article citation in same paragraph, associate
- Otherwise, mark as "same-article" reference with partial anchor

**Deliverables**:
- [ ] Intra-document reference detection
- [ ] Contextual anchor generation
- [ ] Test with edge cases

---

### Phase 5: Validation & Testing
**Goal**: Ensure robustness and prevent regressions

#### 4.5.1 Build-Time Validation
Add to pipeline validation:
```javascript
// Validate provision anchors exist in target documents
for (const citation of citations) {
  if (citation.provision && citation.isInternal) {
    const targetAnchors = documentAnchors[citation.internalSlug];
    if (!targetAnchors.includes(citation.provision.anchor)) {
      console.warn(`⚠️ Broken provision link: ${citation.provision.anchor}`);
    }
  }
}
```

#### 4.5.2 Test Cases
- [ ] Explicit article references: "Article 5(1) of Regulation 910/2014"
- [ ] Multiple provisions: "Articles 4 and 5 of..."
- [ ] Nested points: "Article 5(1)(a)"
- [ ] Recitals: "recital 75 of Regulation 2024/1183"
- [ ] Annexes: "Annex I to Regulation..."
- [ ] External documents: provision shown but no deep link
- [ ] Intra-document: relative paragraph references

**Deliverables**:
- [ ] Validation script for broken provision links
- [ ] Manual browser testing checklist
- [ ] Edge case documentation

---

### Phase 6: Documentation & Decisions
**Goal**: Document the implementation

#### 4.6.1 Update DECISIONS.md
Add DEC-064 entry describing:
- Problem solved
- Technical approach
- Patterns supported
- Limitations (external docs, ambiguous references)

#### 4.6.2 Update AGENTS.md
Add any new rules or patterns discovered

#### 4.6.3 Update Knowledge Item
Update eIDAS KI with provision citation system documentation

**Deliverables**:
- [ ] DEC-064 in DECISIONS.md
- [ ] Any new rules in AGENTS.md
- [ ] KI updated

---

## 5. File Change Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `scripts/provision-parser.js` | **NEW** | Provision pattern parsing module |
| `scripts/build-citations.js` | Modify | Integrate provision parsing |
| `src/utils/citationPopoverTemplate.js` | Modify | Add provision display section |
| `src/components/CitationPopover/CitationPopover.css` | Modify | Provision styling |
| `src/hooks/useCitations.js` | Modify | Add provision data attributes |
| `DECISIONS.md` | Modify | Add DEC-064 |
| `TRACKER.md` | Modify | Update progress |

---

## 6. Estimated Effort

| Phase | Estimated Time |
|-------|---------------|
| Phase 1: Provision Extraction | ~2 hours |
| Phase 2: Popover Enhancement | ~1 hour |
| Phase 3: HTML Transformation | ~1 hour |
| Phase 4: Intra-Document | ~1.5 hours |
| Phase 5: Validation & Testing | ~1 hour |
| Phase 6: Documentation | ~30 min |
| **Total** | **~7 hours** |

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Regex complexity causes false positives | Start with explicit patterns only, expand cautiously |
| Broken deep links | Build-time validation, anchor existence check |
| Performance regression | Hash-based caching (already implemented) |
| Edge cases in EU legal drafting | Document known limitations, handle gracefully |

---

## 8. Success Criteria

1. ✅ "Article 5(1) of Regulation 910/2014" generates a clickable deep link
2. ✅ Clicking navigates to `?section=article-5-para-1` and scrolls to the provision
3. ✅ Popover shows "📍 Article 5(1)" + normal document info
4. ✅ External documents show provision info but link to EUR-Lex root
5. ✅ Build-time validation catches broken provision links
6. ✅ No regressions in existing citation functionality

---

## 9. Rollback Plan

If issues arise:
1. **Quick fix**: Set `ENABLE_PROVISION_CITATIONS=false` env var to disable
2. **Full rollback**: Revert `build-citations.js` changes, citations fall back to document-level

---

**Ready to implement?** Confirm and I'll start with Phase 1 (Provision Pattern Extraction).
