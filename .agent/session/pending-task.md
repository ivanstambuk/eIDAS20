# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: DEC-009 Phase 2 - Desktop hover popovers for citations
- **Next**: Hydrate `.citation-ref` spans with popover behavior on hover
- **Status**: Ready
- **Phase**: Phase 7 Enhancement

## What's Done (DEC-009 Phase 1)

- ✅ `build-citations.js` extracts 160 citations (42 internal, 118 external)
- ✅ `build-content.js` transforms verbose citations → short names at build time
- ✅ References section at bottom (works on all devices)
- ✅ CSS styling for `.citation-ref` (dotted underline, hover color)

## What's Pending (DEC-009 Phase 2)

1. **Desktop hover popovers**:
   - The HTML already has data attributes: `data-idx`, `data-short`, `data-celex`, `data-internal`, `data-url`
   - Need: useEffect to attach hover listeners to `.citation-ref` elements
   - Reuse `CitationPopover` component patterns (already created)

2. **Responsive References section**:
   - Desktop (≥768px): HIDE References section (popovers provide the info)
   - Mobile (<768px): SHOW References section (no hover on touch)
   - Use CSS media query or `useIsMobile` hook

## Key Files

- `docs-portal/src/pages/RegulationViewer.jsx` — Add useEffect for popover hydration
- `docs-portal/src/components/CitationPopover/CitationPopover.jsx` — Popover component (already built)
- `docs-portal/src/components/CitationPopover/CitationPopover.css` — Add `.references-section` media query
- `docs-portal/src/hooks/useMediaQuery.js` — `useIsMobile()` hook (already built)

## Context Notes

- The build-time approach was chosen over runtime parsing because ELI URLs were getting converted to `<a>` tags before we could replace them
- Simple string `split().join()` replacement works; regex over-escaping failed
- CitationPopover.jsx exists but isn't used yet - it's designed for React component rendering, not DOM hydration
- For hydration, consider: creating a floating popover via DOM, or using event delegation

## Implementation Approach (Suggestion)

```jsx
// In RegulationViewer.jsx, after content renders:
useEffect(() => {
  if (isMobile) return; // No popovers on mobile
  
  const handleHover = (e) => {
    const el = e.target.closest('.citation-ref');
    if (!el) return;
    // Show popover with data from el.dataset
  };
  
  const content = document.querySelector('.regulation-content');
  content?.addEventListener('mouseenter', handleHover, true);
  return () => content?.removeEventListener('mouseenter', handleHover, true);
}, [regulation, isMobile]);
```

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Test: http://localhost:5173/eIDAS20/#/implementing-acts/2025-0846
# Look for: .citation-ref elements with short names like "Recommendation 2021/946"
```
