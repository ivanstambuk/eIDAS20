# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: Amendment-Aware Citation Popovers (Option E)
- **Next**: Implement data model changes in legislation-metadata.js
- **Status**: Planned (not started)
- **Phase**: Backlog Enhancement

## Implementation Plan: Amendment-Aware Citation Popovers

### Goal
When hovering over a citation to an amended regulation (e.g., 910/2014), show:
1. Dual status badges: `IN FORCE` + `AMENDED`
2. Amendment notice: "⚠️ Amended by Regulation 2024/1183"
3. Dual action buttons: "View Consolidated →" + "EUR-Lex ↗"

### Phase 1: Data Model (legislation-metadata.js)

Add amendment relationships to existing entries:

```javascript
'32014R0910': {
    humanName: 'Electronic Identification and Trust Services Regulation',
    abbreviation: 'eIDAS 1.0',
    entryIntoForce: '2014-09-17',
    status: 'in-force',
    category: 'regulation',
    // NEW FIELDS:
    amendedBy: ['32024R1183'],           // CELEX of amending regulation
    amendmentDate: '2024-05-20',          // When amendment entered into force
    consolidatedSlug: '910-2014',         // Portal slug for consolidated version
},
```

### Phase 2: Build-Time Enrichment (build-citations.js)

In `enrichCitation()` function, add:
```javascript
citation.amendedBy = metadata.amendedBy || null;
citation.amendmentDate = metadata.amendmentDate || null;
citation.consolidatedSlug = metadata.consolidatedSlug || null;
citation.isAmended = !!(metadata.amendedBy?.length);
```

### Phase 3: Popover Template (citationPopoverTemplate.js)

Update `generatePopoverContent()` to handle amended regulations:
- Check `citation.isAmended`
- Render dual badges if amended
- Add amendment notice line
- Add consolidated button if `consolidatedSlug` exists

### Phase 4: CSS Updates (CitationPopover.css)

```css
.citation-badge-amended {
    background: var(--accent-warning);  /* Yellow/orange */
    color: var(--bg-primary);
}
.citation-amendment-notice {
    color: var(--text-secondary);
    font-size: 0.85em;
    margin-top: var(--space-2);
}
```

## Key Files

- `docs-portal/scripts/legislation-metadata.js` — Add amendedBy, consolidatedSlug
- `docs-portal/scripts/build-citations.js` — Enrich with amendment data
- `docs-portal/src/utils/citationPopoverTemplate.js` — Render amendment UI
- `docs-portal/src/components/CitationPopover/CitationPopover.css` — Badge styles

## Context Notes

- eIDAS 1.0 (910/2014) is "in force" but amended by 2024/1183
- Consolidated version is the current applicable law
- Showing just "IN FORCE" is technically correct but misleading
- User approved Option E: dual badges + amendment notice + consolidated link
- Similar pattern already exists in DEC-060 (Smart Consolidation popovers)

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Edit legislation-metadata.js first, then rebuild citations
node scripts/build-citations.js
```

## Session Summary (2026-01-17)

1. Ran /init workflow
2. Removed stale "Cross-link portal citations" backlog item (already implemented DEC-009)
3. Consolidated terminology: added "Provision Citation" term, merged 2 backlog items
4. Fixed eIDAS abbreviation: "eIDAS" → "eIDAS 1.0" to distinguish from eIDAS 2.0
5. Planned Amendment-Aware Citation Popovers (Option E) for next session
