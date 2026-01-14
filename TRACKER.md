# eIDAS 2.0 Knowledge Base - Work Tracker

> **This is a live document.** Update after each work session.

---

## Current Session Status

| Field | Value |
|-------|-------|
| **Last Updated** | 2026-01-14 01:47 CET |
| **Session State** | ✅ Handover - Ready for next session |
| **Current Phase** | Phase 2: Content & Navigation |
| **Next Action** | Create build-time markdown→JSON processor |

---

## 🎯 Active Project: eIDAS 2.0 Documentation Portal

### Project Overview

A **100% client-side static site** for eIDAS 2.0 regulatory documentation, hosted on GitHub Pages.

| Attribute | Value |
|-----------|-------|
| **Location** | `docs-portal/` subdirectory |
| **Framework** | Vite + React |
| **Dev URL** | http://localhost:5173/eIDAS20/ |
| **Hosting** | GitHub Pages (default URL) |
| **Content Source** | 32 markdown files (~0.8 MB) |

### Key Features

1. **Regulation Filter** - Multi-select by regulation/implementing act
2. **Role Selector** - RP, Wallet Provider, QTSP, Evaluator views
3. **Export to File** - PDF, Markdown, JSON export
4. **Embedded AI Chat** - Gemma 2B via WebGPU (with fallback)
5. **Terminology Page** - Pre-generated with hover popups + cross-refs
6. **Light/Dark Theme** - System detection + manual toggle

---

## 📋 Implementation Plan

### Phase 1: Foundation ✅ COMPLETE

| Task | Status | Notes |
|------|--------|-------|
| 1.1 Initialize Vite + React project | ✅ DONE | `docs-portal/` created |
| 1.2 Configure for GitHub Pages | ✅ DONE | `base: '/eIDAS20/'` in vite.config.js |
| 1.3 Create design system (CSS) | ✅ DONE | Dark theme, cyan accents, typography |
| 1.4 Build content processor script | ✅ DONE | Reads markdown files at build time |
| 1.5 Create basic layout components | ✅ DONE | Header, Sidebar, MainContent |
| 1.6 Set up routing structure | ✅ DONE | HashRouter with all routes |

**Validation:** Browser subagent confirmed UI is modern, premium, fully functional.

### Phase 2: Content & Navigation ⏳ IN PROGRESS

| Task | Status | Notes |
|------|--------|-------|
| 2.1 Build regulation viewer component | ✅ DONE | Layout, TOC, actions panel complete |
| 2.2 Implement regulation filter | ⬜ TODO | Multi-select chips/tags |
| 2.3 Build table of contents sidebar | ✅ DONE | Part of RegulationViewer |
| 2.4 Add role-based filtering | ⬜ TODO | Highlight relevant sections |
| 2.5 Implement export functionality | ⬜ TODO | Browser print → PDF, download |

**Next step:** Create build-time markdown→JSON processor to load actual regulation content.

### Phase 3: Terminology System ⬜ NOT STARTED

| Task | Status | Notes |
|------|--------|-------|
| 3.1 Write terminology extractor | ⬜ TODO | **BUILD TIME Node.js script** |
| 3.2 Generate terminology.json | ⬜ TODO | Pre-generated static JSON |
| 3.3 Build terminology page | ⬜ TODO | Alphabetical list with deep links |
| 3.4 Implement hover popover | ⬜ TODO | Shows definition on term hover |
| 3.5 Add cross-reference links | ⬜ TODO | Links to source regulation/article |

### Phase 4: Search ⬜ NOT STARTED

| Task | Status | Notes |
|------|--------|-------|
| 4.1 Integrate Orama search | ⬜ TODO | Full-text search index |
| 4.2 Write embedding generator | ⬜ TODO | **BUILD TIME Node.js script** |
| 4.3 Pre-compute embeddings | ⬜ TODO | Output: `embeddings.json` |
| 4.4 Implement semantic search UI | ⬜ TODO | Ranked results with snippets |
| 4.5 Add search suggestions | ⬜ TODO | Recent searches, popular queries |

### Phase 5: AI Chat ⬜ NOT STARTED

| Task | Status | Notes |
|------|--------|-------|
| 5.1 Integrate WebLLM | ⬜ TODO | Load Gemma 2B on demand |
| 5.2 Build chat UI component | ⬜ TODO | Floating widget, expandable |
| 5.3 Implement RAG pipeline | ⬜ TODO | Retrieve → Augment → Generate |
| 5.4 Add context window management | ⬜ TODO | Include relevant chunks in prompt |
| 5.5 Implement WebGPU detection | ⬜ TODO | Graceful fallback for unsupported browsers |

### Phase 6: Polish & Deploy ⬜ NOT STARTED

| Task | Status | Notes |
|------|--------|-------|
| 6.1 Accessibility audit | ⬜ TODO | WCAG 2.1 AA compliance |
| 6.2 Performance optimization | ⬜ TODO | Lazy loading, code splitting |
| 6.3 Light theme implementation | ⬜ TODO | CSS variables swap |
| 6.4 GitHub Actions workflow | ⬜ TODO | Auto-deploy on push |
| 6.5 Final testing & launch | ⬜ TODO | Cross-browser testing |

---

## 📊 Progress Summary

| Phase | Tasks | Done | Progress |
|-------|-------|------|----------|
| Phase 1: Foundation | 6 | 6 | ✅ 100% |
| Phase 2: Content & Navigation | 5 | 2 | ⏳ 40% |
| Phase 3: Terminology | 5 | 0 | ⬜ 0% |
| Phase 4: Search | 5 | 0 | ⬜ 0% |
| Phase 5: AI Chat | 5 | 0 | ⬜ 0% |
| Phase 6: Polish & Deploy | 5 | 0 | ⬜ 0% |
| **Total** | **31** | **8** | **26%** |

---

## 📁 Document Inventory

| Directory | Files | Status |
|-----------|-------|--------|
| `01_regulation/` | 2 | ✅ Complete |
| `02_implementing_acts/` | 30 | ✅ Complete |
| `docs-portal/` | - | 🚀 Phase 1 Complete |

---

## Session History

| Date | Summary |
|------|---------|
| 2026-01-14 01:30 | **Phase 1 Complete**: Browser validation confirms UI is functional. Added WSL browser testing scripts. |
| 2026-01-14 00:40 | **Environment Fix**: Migrated to WSL, fixed CRLF→LF line endings, reinstalled node_modules |
| 2026-01-13 (Night) | **Portal Started**: Created docs-portal with Vite + React, implemented all Phase 1 tasks |
| 2026-01-13 (Earlier) | **V3 Migration**: All 32 documents converted and validated, linter: 0 issues |

---

*End of Tracker*
