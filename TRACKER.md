# eIDAS 2.0 Knowledge Base - Work Tracker

> **Live document.** Update after each session.

---

## Current Status

| Field | Value |
|-------|-------|
| **Last Updated** | 2026-01-14 23:46 CET |
| **Session State** | ✅ Complete |
| **Portal Status** | ✅ All 6 phases complete + Phase 7 enhancements |
| **Next Action** | Desktop hover popovers + hide References on desktop (DEC-009 Phase 2) |

---

## Portal Features (Complete)

- **32 documents** (2 regulations + 30 implementing acts)
- **Full-text + semantic search** (Orama + Transformers.js embeddings)
- **Terminology system** (96 terms, hover popovers, cross-refs)
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

---

## Backlog (Future Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| GitHub header link | Update placeholder `https://github.com` to actual repo URL once published | High |
| Cross-doc references | Link from implementing acts to eIDAS regulation articles | Medium |
| Terminology highlighting | Auto-highlight defined terms in content with hover popovers | Medium |
| GitHub Pages deploy | Push to master to trigger workflow | High |
| eIDAS 2.0 (2024/1183) chapters | Add chapter structure for the amending regulation | Low |

---

## Recent Sessions

| Date | Summary |
|------|---------|
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


