# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: Building eIDAS 2.0 Documentation Portal - Phase 2 Content & Navigation
- **Next**: Implement regulation filter with multi-select chips/tags
- **Status**: In Progress
- **Phase**: Phase 2, Task 2.2 (content loading complete, filter next)

## Key Files

- `docs-portal/src/pages/RegulationViewer.jsx` — Main viewer component (loads from JSON)
- `docs-portal/scripts/build-content.js` — Build-time markdown→JSON processor
- `docs-portal/public/data/regulations/` — 32 generated JSON files
- `docs-portal/public/data/regulations-index.json` — Index for listing pages
- `TRACKER.md` — Phase progress tracking (29% complete)

## Context Notes

- **Build Script**: Run `npm run build:content` to regenerate JSON from markdown
- **Port Reference**: Portal = 5173, Chrome CDP = 9222
- **Content Stats**: 32 documents, 121k words total
- **JSON Structure**: Each regulation has slug, title, shortTitle, toc[], contentHtml, contentMarkdown

## Session Accomplishments

1. ✅ Created `scripts/build-content.js` - markdown→JSON converter
2. ✅ Generated 32 regulation JSON files + index
3. ✅ Rewrote RegulationViewer to fetch from JSON
4. ✅ Both /regulation/:id and /implementing-acts/:id work
5. ✅ Browser verified - content loads correctly with TOC
6. ✅ Committed: feat(portal): implement build-time markdown→JSON processor

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Portal runs at http://localhost:5173/eIDAS20/
# Test regulation viewer at http://localhost:5173/eIDAS20/#/regulation/910-2014
# Test implementing act at http://localhost:5173/eIDAS20/#/implementing-acts/2024-2977
```

## Next Tasks (Phase 2 Remaining)

1. **2.2 Regulation Filter** - Multi-select chips for filtering document list
2. **2.4 Role-Based Filtering** - Highlight sections relevant to RP/QTSP/etc.
3. **2.5 Export Functionality** - PDF export via print, markdown download
