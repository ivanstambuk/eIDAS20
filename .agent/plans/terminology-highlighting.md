# Implementation Plan: Terminology Cross-Linking

> **Status:** Planning  
> **Created:** 2026-01-18  
> **Decision:** DEC-085

---

## Overview

Add automatic cross-linking of defined terms in regulation content. When a user reads an article, recital, or annex, recognized terminology terms will be highlighted and show definition popovers on hover.

### Goals

1. **Auto-detect** defined terms in running text (articles, recitals, annexes, preamble)
2. **Exempt** definitions articles (they define the terms — linking back is circular)
3. **Highlight** terms visually (dotted underline + subtle color)
4. **Show popover** on hover (same TermPopover component used on /terminology page)

### Non-Goals

- Runtime text processing (build-time only)
- Editing source markdown (all processing in build pipeline)

---

## Architecture

### Processing Pipeline

```
Source (MD) → remark/rehype → rehype-term-links.js → contentHtml
                                      ↑
                              terminology.json
```

The new `rehype-term-links.js` plugin:
1. Loads terminology data at build time
2. Walks the HTML AST
3. Skips exempt sections (definitions articles)
4. Finds term matches in text nodes
5. Wraps matches with `<span class="term-link" data-term-id="...">term</span>`

### Runtime Hydration

Similar to citation popovers:
1. RegulationViewer attaches event listeners to `.term-link` elements
2. On hover, shows TermPopover with definition
3. Uses existing TermPopover component (already built)

---

## Phase 1: Build-Time Term Detection

### 1.1 Create `rehype-term-links.js`

**Location:** `docs-portal/scripts/rehype-term-links.js`

**Core Logic:**

```javascript
import { visitParents } from 'unist-util-visit-parents';

export default function rehypeTermLinks(options = {}) {
  const { terminology } = options;
  
  return (tree) => {
    // Build term matching structures
    const termMap = buildTermMap(terminology);
    const termPattern = buildTermPattern(terminology);
    
    // Track context for exemptions
    let inDefinitionsArticle = false;
    
    visitParents(tree, 'text', (node, ancestors) => {
      // Skip if in exempt section
      if (isExemptSection(ancestors)) return;
      
      // Find and replace term matches
      const matches = findTermMatches(node.value, termPattern, termMap);
      if (matches.length > 0) {
        replaceWithSpans(node, ancestors, matches);
      }
    });
  };
}
```

### 1.2 Term Matching Rules

| Rule | Implementation |
|------|----------------|
| **Case-insensitive** | Regex flag `i` |
| **Plural forms** | Append `s?` or `(?:es)?` to pattern |
| **Longest match first** | Sort terms by length descending |
| **Word boundaries** | Use `\b` in regex |
| **No partial matches** | Longer terms matched before shorter |

### 1.3 Exemption Detection

**Exempt sections:**
- Definitions articles (detected by `### Article N` followed by `**Definitions**`)

**Detection strategy:**
1. Track current article context via H2/H3 headings
2. If heading contains "Definitions" (literal word), set `inDefinitionsArticle = true`
3. Reset on next article heading

**Heuristics (from `build-terminology.js`):**
```javascript
function isDefinitionsHeading(node) {
  // Pattern 1: Bold **Definitions** after article heading
  // Pattern 2: "Article N - Definitions" in heading itself
  // Pattern 3: Text contains "following definitions apply"
  return (
    node.properties?.id?.includes('definitions') ||
    getTextContent(node).toLowerCase().includes('definitions')
  );
}
```

---

## Phase 2: HTML Span Generation

### 2.1 Span Structure

```html
<span class="term-link" 
      data-term-id="electronic-signature" 
      tabindex="0">electronic signature</span>
```

**Attributes:**
- `class="term-link"`: For CSS styling and event delegation
- `data-term-id`: Matches term ID in terminology.json
- `tabindex="0"`: Keyboard accessibility

### 2.2 Node Replacement

When a text node like `"must use an electronic signature for authentication"` is processed:

**Before:**
```
{ type: 'text', value: 'must use an electronic signature for authentication' }
```

**After:**
```
[
  { type: 'text', value: 'must use an ' },
  { type: 'element', tagName: 'span', properties: {...}, children: [
    { type: 'text', value: 'electronic signature' }
  ]},
  { type: 'text', value: ' for ' },
  { type: 'element', tagName: 'span', properties: {...}, children: [
    { type: 'text', value: 'authentication' }
  ]}
]
```

---

## Phase 3: CSS Styling

### 3.1 Term Link Styles

**Location:** `src/components/TermPopover/TermPopover.css` (extend existing)

```css
/* Term links in regulation content */
.term-link {
  text-decoration: underline;
  text-decoration-style: dotted;
  text-decoration-color: var(--color-accent-subtle);
  text-underline-offset: 2px;
  cursor: help;
  transition: color 0.15s ease;
}

.term-link:hover,
.term-link:focus {
  color: var(--color-accent);
  text-decoration-color: var(--color-accent);
}

/* Ensure no conflict with citation links */
.citation-ref.term-link {
  /* If a citation is also a term, citation styling wins */
  text-decoration-style: solid;
}
```

### 3.2 Visual Design Rationale

| Element | Choice | Justification |
|---------|--------|---------------|
| **Underline style** | Dotted | Web convention for glossary/definition links (MDN, Wikipedia) |
| **Underline color** | Subtle accent | Distinguishes from regular hyperlinks (solid blue) |
| **Cursor** | `help` | Indicates contextual information, not navigation |
| **Hover effect** | Color intensify | Clear feedback without being distracting |

---

## Phase 4: Runtime Hydration

### 4.1 Event Handlers in RegulationViewer

**Location:** `src/pages/RegulationViewer.jsx`

```javascript
// Add alongside existing citation popover logic
useEffect(() => {
  const container = containerRef.current;
  if (!container) return;
  
  // Load terminology for popover content
  const loadTerminology = async () => {
    const response = await fetch(`${import.meta.env.BASE_URL}data/terminology.json`);
    terminologyRef.current = await response.json();
  };
  
  const handleTermHover = (e) => {
    const termLink = e.target.closest('.term-link');
    if (!termLink) return;
    
    const termId = termLink.dataset.termId;
    const term = terminologyRef.current?.terms.find(t => t.id === termId);
    if (term) {
      showTermPopover(termLink, term);
    }
  };
  
  container.addEventListener('mouseenter', handleTermHover, true);
  return () => container.removeEventListener('mouseenter', handleTermHover, true);
}, [regulation]);
```

### 4.2 Popover Reuse

The existing `TermPopover` component can be reused with minor adaptation:
- Currently wraps children and shows popover on hover
- For hydration, we'll extract the popover positioning logic
- Create a shared utility: `showPopoverAtElement(element, content)`

---

## Phase 5: Integration & Testing

### 5.1 Build Pipeline Integration

**Location:** `docs-portal/scripts/build-content.js`

```javascript
import rehypeTermLinks from './rehype-term-links.js';
import terminology from '../public/data/terminology.json' assert { type: 'json' };

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypeParagraphIds)
  .use(rehypeTermLinks, { terminology })  // NEW
  .use(rehypeStringify, { allowDangerousHtml: true });
```

### 5.2 Validation

Add build-time validation:

```javascript
// In build-content.js after processing
const termLinkCount = (contentHtml.match(/class="term-link"/g) || []).length;
console.log(`  📚 ${termLinkCount} term links generated`);

// Sanity check: consolidated regulation should have many term links
if (slug === '2014-910' && termLinkCount < 100) {
  console.warn(`  ⚠️ Low term link count for main regulation`);
}
```

### 5.3 Browser Testing

Verify in browser:
1. Terms are highlighted with dotted underline
2. Hover shows definition popover
3. Definitions article (Article 3) has NO term links
4. Citation links still work correctly
5. No visual clutter or performance issues

---

## Implementation Order

| Phase | Task | Effort | Dependencies |
|-------|------|--------|--------------|
| **1.1** | Create `rehype-term-links.js` | 2h | terminology.json |
| **1.2** | Term matching logic | 1h | Phase 1.1 |
| **1.3** | Exemption detection | 1h | Phase 1.1 |
| **2** | HTML span generation | 1h | Phase 1 |
| **3** | CSS styling | 30m | - |
| **4** | Runtime hydration | 1h | Phase 2 |
| **5** | Integration & testing | 1h | All phases |

**Total estimated effort:** ~7 hours

---

## Edge Cases & Considerations

### Multi-Word Terms

Terms like "qualified trust service provider" must match as a unit.
- Sort terms by length (descending) before matching
- Longer matches consume the text, preventing shorter partial matches

### Overlapping Terms

If "trust service" and "qualified trust service provider" are both terms:
- "qualified trust service provider" matches first (longer)
- Remaining "trust service" occurrences still match

### HTML in Source

Some content uses inline HTML (e.g., 765/2008 for legal fidelity):
```html
<li>10. 'manufacturer' means...</li>
```
- The rehype plugin processes HAST (after HTML → AST conversion)
- Text nodes inside `<li>` are still visited correctly

### Performance

- 106 terms, ~172K words across 35 documents
- Build-time regex: O(words × terms) but optimized with combined pattern
- Estimated impact: +1-2 seconds to build (acceptable)

---

## Success Criteria

1. ✅ All defined terms in running text are highlighted
2. ✅ Definitions articles are exempt (no circular links)
3. ✅ Hover shows popover with definition
4. ✅ No visual interference with existing features (citations, gutter icons)
5. ✅ Build completes in reasonable time (<30s total)
6. ✅ Accessibility: keyboard-focusable term links

---

## Future Enhancements (Out of Scope)

- **First-occurrence-only mode**: Optional flag to highlight only first term per section
- **Term density warning**: Alert if too many terms in a paragraph (visual clutter)
- **Click to navigate**: Click term link to jump to /terminology#term-id
