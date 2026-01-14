# Citation System Implementation Plan

## Overview

Implement DEC-009: Clean citation formatting with responsive behavior (popover desktop / footnotes mobile) and internal linking.

## Phase 1: Build-Time Citation Extraction

### 1.1 Create citation extraction script

**File:** `docs-portal/scripts/build-citations.js`

**Input:** Markdown files with inline citations like:
```
[Commission Recommendation (EU) 2021/946 of 3 June 2021... (OJ L 210, 14.6.2021, p. 51, ELI: http://data.europa.eu/eli/reco/2021/946/oj).]
```

**Output per document:** `citations.json`
```json
{
  "citations": [
    {
      "index": 1,
      "shortName": "Recommendation 2021/946",
      "fullTitle": "Commission Recommendation (EU) 2021/946 of 3 June 2021...",
      "ojRef": "OJ L 210, 14.6.2021, p. 51",
      "eli": "http://data.europa.eu/eli/reco/2021/946/oj",
      "celex": "32021H0946",
      "isInternal": false,
      "url": "https://eur-lex.europa.eu/eli/reco/2021/946/oj"
    }
  ]
}
```

### 1.2 Internal document registry

Build from existing documents:
- Map CELEX → { type, slug }
- Used to determine internal vs external links

### 1.3 Markdown transformation

Replace inline citations with markers:
```markdown
...Commission Recommendation (EU) 2021/946{{cite:1}}...
```

## Phase 2: React Components

### 2.1 CitationRef Component

```jsx
const CitationRef = ({ citation, index }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) {
    return <sup><a href={`#ref-${index}`}>{index}</a></sup>;
  }
  
  return (
    <CitationPopover citation={citation}>
      <span className="citation-inline">{citation.shortName}</span>
    </CitationPopover>
  );
};
```

### 2.2 CitationPopover Component

Reuse patterns from TermPopover:
- Floating UI positioning
- Dark theme styling
- "View on EUR-Lex" or internal portal link

### 2.3 ReferencesSection Component

Bottom section for mobile + accessibility:
```jsx
<section id="references">
  <h2>References</h2>
  <ol>
    {citations.map((c, i) => (
      <li key={i} id={`ref-${i+1}`}>
        <a href={c.url}>{c.fullTitle}</a>
        {!c.isInternal && ' 🔗'}
      </li>
    ))}
  </ol>
</section>
```

## Phase 3: Integration

### 3.1 RegulationViewer updates

- Load citations from JSON
- Pass to content renderer
- Render ReferencesSection at bottom

### 3.2 Content rendering

- Parse `{{cite:N}}` markers in contentHtml
- Replace with CitationRef components

## Risks & Mitigations

1. **Citation regex complexity** - Legal citations have many formats
   - Mitigation: Start with ELI-based extraction (most reliable)
   
2. **Performance** - Many citations per document
   - Mitigation: Lazy-load popovers, virtualize if needed

3. **Mobile detection** - SSR considerations
   - Mitigation: Use CSS media queries for initial render

## Success Criteria

- [ ] Citations extracted correctly from all 32 documents
- [ ] Desktop: Hover shows popover with full citation
- [ ] Mobile: Superscript links to References section
- [ ] Internal documents link to portal
- [ ] External documents link to EUR-Lex with 🔗 icon
- [ ] Accessibility: References section for screen readers
