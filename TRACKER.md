# eIDAS 2.0 Knowledge Base - Work Tracker

> **Live document.** Update after each session.

---

## Current Status

| Field | Value |
|-------|-------|
| **Last Updated** | 2026-01-16 17:36 CET |
| **Session State** | ✅ Complete: Build-Time Metadata Generation (DEC-012) + Retro improvements |
| **Portal Status** | ✅ Fully functional |
| **Next Action** | Phase 5: Comprehensive testing & verification (Multi-Source Terminology) |

---

## Portal Features (Complete)

- **33 documents** (3 regulations: 910/2014, 2024/1183, 765/2008 + 30 implementing acts)
- **Full-text + semantic search** (Orama + Transformers.js embeddings)
- **Terminology system** (113 terms from 3 sources, multi-source display, hover popovers, cross-refs)
- **Multi-source terminology** (DEC-039: Stacked definitions from primary + referenced regulations, e.g., 'conformity assessment body' from both 910/2014 and 765/2008)
- **AI Chat** (WebLLM, RAG-powered, Gemma 2B recommended)
- **Export** (PDF, Markdown, JSON)
- **Themes** (light/dark, system detection)
- **Accessibility** (WCAG 2.1 AA)
- **CI/CD** (GitHub Actions auto-deploy)
- **Collapsible TOC** (official chapter structure for eIDAS 910/2014, Annexes at bottom)
- **Human-friendly document names** (short titles from folder names/metadata)
- **Scroll-to-top on navigation** (fixes SPA scroll persistence bug)
- **Search prioritizes definitions** (10x boost full-text, two-tier semantic)
- **Deep linking** (direct URLs to articles/annexes via `?section=` param)
- **Sticky alphabet nav** (Terminology page, glassmorphism effect)
- **Fast 150ms scroll** (consistent across all pages)
- **List indentation** (definitions, recitals, and numbered items properly indented)
- **Preamble injection** (78 recitals from 2024/1183 amendment injected into consolidated 910/2014)
- **Reading time estimate** (150 WPM for legal text, smart formatting)
- **Citation popovers** (160 citations with desktop hover popovers, responsive References section)
- **Clean TOC** (DEC-010: "Enacting Terms" removed from navigation, cleaner sidebar)
- **Copy Reference** (DEC-011: Full EU citation hierarchy — articles + 316 paras + 258 points + 30 subpoints)
- **"eIDAS 2.0 Regulation"** (Consolidated regulation renamed for clarity across sidebar, header, breadcrumbs)
- **TOC all-collapsed default** (Progressive disclosure: all chapters start collapsed for cleaner initial view)
- **Terminology deep linking** (Click "View in Regulation" → jumps to exact paragraph, preserves legal structure UL/OL)
- **Scroll restoration** (Back button restores position, manual navigation starts at top; Performance API detection)

---

## Backlog (Future Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| GitHub header link | Update placeholder `https://github.com` to actual repo URL once published | High |
| Cross-doc references | Link from implementing acts to eIDAS regulation articles | Medium |
| Terminology highlighting | Auto-highlight defined terms in content with hover popovers | Medium |
| GitHub Pages deploy | Push to master to trigger workflow | High |
| eIDAS 2.0 (2024/1183) chapters | Add chapter structure for the amending regulation | Low |
| **Additional referenced regulations** | **Import foundational EU regs: 768/2008 (product marketing), 1025/2012 (standardisation), GDPR (2016/679), Services Directive (2006/123/EC)** | **Medium** |

---

## Recent Sessions

| Date | Summary |
|------|------------|
| 2026-01-16 17:36 | Retro: Added ⚠️ code comments, JSDoc types, build-time metadata pattern to AGENTS.md Rule 5 |
| 2026-01-16 17:31 | DEC-012: Build-time metadata generation (prevents hardcoded counts, 3-tier validation, 150x smaller payload) |
| 2026-01-16 17:23 | Fixed hardcoded document count: Sidebar now dynamically fetches from regulations-index.json (32 → 33 documents) |
| 2026-01-16 15:42 | Multi-source search Phase 4: Category-based ranking (1.5x boost for sourceCount > 1), 21 multi-source terms prioritized, browser-verified |
| 2026-01-16 15:24 | Multi-source popovers Phase 3: TermPopover stacked display (Cyan/Purple/Gray), Referenced Regulations sidebar section, Regulation 765/2008 always visible |
| 2026-01-16 15:35 | Multi-source terminology Phase 2: Build-time merging (113 terms, 207 defs), stacked UI display, document categories (primary/referenced), 20 defs from 765/2008 |
| 2026-01-16 14:31 | Regulation 765/2008 import (Phase 1/6): Complete regulation added (7 chapters, 44 articles, 1,394 words), portal now 33 docs, Phase 2 next |
| 2026-01-16 14:07 | Scroll restoration + retro: Performance API navigation detection (back button vs manual), useNavigationType hook, react-patterns.md, updated Rule 11 |
| 2026-01-16 12:22 | Retro improvements: Rule 12 (DOM-First Debugging), Rule 13 (Legal Preservation), debugging-patterns.md, rehype warning comment |
| 2026-01-16 12:10 | Terminology deep linking: Extended rehype to process UL+OL (preserves legal structure), rebuilt all content, end-to-end verified |
| 2026-01-16 12:02 | TOC all-collapsed + terminology scroll fixes: alphabet nav offset 135px, deep linking with ?section= param |
| 2026-01-16 11:45 | Retro: Stabilized all custom hooks (useMemo), added React best practices (Rule 11) to AGENTS.md, 100% test pass |
| 2026-01-16 11:50 | Fixed SearchModal infinite loop bug: Unstable objects in useEffect deps caused "Maximum update depth exceeded" |
| 2026-01-16 11:13 | Navigation bug investigation (70min): Identified infinite loop in Layout/Sidebar; reverted all changes, documented findings |
| 2026-01-15 23:28 | Defense in Depth: downstream validation, staleness checks, fixed build chain; search UX improvements (clear on close, no hover underline) |
| 2026-01-15 22:55 | Removed redundant Terminology search box; added build-time validation (invariants) to prevent extraction failures |
| 2026-01-15 22:43 | Retro: Added Rule 10 (Clarify Before Acting), cleaned stale directories, renamed to "eIDAS 2.0 Regulation" |
| 2026-01-15 22:24 | Cleaned 13 stale legacy directories (fixed duplicate document count 43→30 IAs) |
| 2026-01-15 22:21 | Annex processing complete: CONS.ANNEX support, intro paragraphs, nested lists, NP in GR.SEQ |
| 2026-01-15 19:56 | DEC-011 Phase 3: Roman numeral subpoints (i), (ii), (iii) - 30 additional IDs |
| 2026-01-15 19:48 | DEC-011 Phase 2: Paragraph/point-level copy reference (316 para + 258 point IDs) |
| 2026-01-15 19:30 | DEC-011: Copy Reference gutter icons (Phase 1: article-level, EU citations + deep links) |
| 2026-01-15 00:05 | DEC-010: Remove "Enacting Terms" from TOC (structural marker, not navigation target) |
| 2026-01-14 23:52 | DEC-009 Phase 2: Desktop hover popovers, responsive References section (hidden on desktop) |
| 2026-01-14 23:45 | Citation system complete: build-time transformation (160 citations), References section, internal/external linking |
| 2026-01-14 23:25 | Citation system (WIP): DEC-009, build-citations.js extracting 160 citations (42 internal, 118 external) |
| 2026-01-14 23:05 | Fixed metadata loss: restored CELEX/EUR-Lex links in 29 docs; added prevention guard to batch script |
| 2026-01-14 22:48 | Codified Rule 5: Proactive Prevention Protocol (automated guards after every bug fix) |
| 2026-01-14 22:42 | Batch fixed all annexes: 14 documents now have proper annexes, +5,353 words total |
| 2026-01-14 22:30 | Fixed missing annex in 2025-0847 (Security Breach Response); converter now handles standalone ANNEX files |
| 2026-01-14 22:12 | Reading time estimate: 150 WPM, smart formatting (minutes vs hours+minutes) |
| 2026-01-14 22:05 | Preamble injection: 78 recitals from amendment copied into consolidated, DEC-008, TOC updated |
| 2026-01-14 21:56 | List indentation: definitions (60), recitals (78), implementing acts (496), CSS padding for ul/ol |
| 2026-01-14 21:17 | Sticky alphabet nav on Terminology page, fast 150ms scroll everywhere |
| 2026-01-14 20:47 | Deep linking: ?section= param for direct article/annex URLs, HashRouter-compatible |
| 2026-01-14 20:31 | Converter bug: missing bullet prefix in process_list_simple, strengthened Rule 70 (Converter-First), TOC annexes at bottom |
| 2026-01-14 20:02 | Search: terminology prioritized (10x boost + two-tier ranking), DEC-005/006, DECISIONS.md created |
| 2026-01-14 18:55 | Human-friendly short titles (PID & EAA, etc.), scroll-to-top fix |
| 2026-01-14 18:25 | Collapsible TOC: Official chapters, short Roman numerals (I., II.), text wrap |
| 2026-01-14 17:50 | CSS scroll fix: Removed scroll-behavior:smooth conflicting with 150ms JS animation |
| 2026-01-14 17:35 | AST-based Markdown Pipeline: unified/remark/rehype, TOC deep-linking works |

---

*Full history available in git. See `git log --oneline` for commits.*


