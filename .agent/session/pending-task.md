# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: Building eIDAS 2.0 Documentation Portal - Phase 2 Content & Navigation
- **Next**: Create a build-time Node.js script to process markdown files into JSON for the RegulationViewer
- **Status**: In Progress
- **Phase**: Phase 2, Task 2.1 (viewer component done, needs content loading)

## Key Files

- `docs-portal/src/pages/RegulationViewer.jsx` — Main viewer component (placeholder content)
- `docs-portal/src/styles/index.css` — Design system with all utilities
- `01_regulation/910_2014_eIDAS_Consolidated/02014R0910-20241018.md` — Source regulation to process
- `TRACKER.md` — Phase progress tracking (26% complete)

## Context Notes

- **WSL Migration**: Moved from Windows to WSL. Fixed CRLF→LF line endings with .gitattributes
- **Port Reference**: Portal = 5173, Chrome CDP = 9222 (NOT 5174 which is Alfred)
- **Viewer Architecture**: RegulationViewer has TOC sidebar, breadcrumb, actions panel - just needs real content
- **Next Step**: Create `docs-portal/scripts/build-content.js` to convert markdown→JSON at build time

## Session Accomplishments

1. ✅ Fixed line endings (CRLF→LF) for WSL
2. ✅ Copied browser testing scripts from Alfred
3. ✅ Created /init, /handover, /retro, /browser-testing workflows
4. ✅ Committed docs-portal (Phase 1 complete)
5. ✅ Created RegulationViewer component with layout/TOC
6. ✅ Updated AGENTS.md with portal docs and browser testing

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Portal runs at http://localhost:5173/eIDAS20/
# Test regulation viewer at http://localhost:5173/eIDAS20/#/regulation/910-2014
```
