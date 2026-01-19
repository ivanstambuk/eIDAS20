# eIDAS 2.0 Knowledge Base - Work Tracker

> **Live document.** Update after each session.

---

## Current Status

| Field | Value |
|-------|---------|
| **Last Updated** | 2026-01-19 19:45 CET |
| **Session State** | V2.7.1 — Second-Pass RP Verification Complete (Schema V12) |
| **Portal Status** | ✅ Fully functional (172,232 words, 107 terms, 90 RP requirements) |
| **Next Action** | RCA Role Expansion: Add wallet_provider + trust_service_provider requirements |

---

## Portal Features (Complete)

- **35 documents** (5 regulations: 910/2014, 2024/1183, 765/2008, 2021/946 Recommendation, **2015/1501 Interoperability Framework** + 30 implementing acts)
- **eIDAS Interoperability Framework** (2015/1501 imported via HTML parser — establishes technical requirements for cross-border eID interoperability)
- **EUDIW Toolbox Recommendation** (32021H0946 imported via extended Formex converter — foundational document establishing Member State cooperation for European Digital Identity Framework)
- **Full-text + semantic search** (Orama + Transformers.js embeddings)
- **Terminology cross-linking** (DEC-085: Auto-highlight defined terms in running text with hover popovers — definitions articles exempted)
- **Terminology system** (107 terms from 3 sources, multi-source display, hover popovers, cross-refs)
- **Terminology filtering** (DEC-086: 3-dimensional filtering by Document Type, Role, and Semantic Domain — exhaustive manual curation of all 107 terms)
- **Multi-source terminology** (DEC-039: Stacked definitions from primary + referenced regulations, e.g., 'conformity assessment body' from both 910/2014 and 765/2008)
- **Complete Reg 765/2008** (Full HTML extraction: 48 recitals, 44 articles, 2 annexes, 11,566 words — replaces partial version)
- **AI Chat** (WebLLM, RAG-powered, **AI Selection Matrix** — model selector with cache detection, persistence, and polish animations)
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
- **Enhanced citation popovers** (DEC-059: Hybrid B+C design — abbreviation badges, status indicators, human-friendly names, entry-into-force dates, dual action buttons)
- **Smart Consolidation popovers** (DEC-060: Self-reference detection for consolidated documents — "CURRENT DOCUMENT" badge, dual EUR-Lex links to Original/Amendment)
- **Amendment-Aware Citation Popovers** (DEC-062: Dual badges IN FORCE + AMENDED, amendment notice with date, "View Consolidated" button for amended regulations)
- **Provision Deep Links** (DEC-064: Cross-document citations to specific articles/recitals generate ?section= deep links — e.g., "Article 5a(23) of Regulation 910/2014" → clickable with popover badge + direct navigation)
- **Informal citation detection** (Directive/Regulation/Decision patterns without ELI, auto-CELEX construction)
- **Clean TOC** (DEC-010: "Enacting Terms" removed from navigation, cleaner sidebar)
- **Copy Reference** (DEC-011: Full EU citation hierarchy — articles + 316 paras + 258 points + 30 subpoints + recitals + **annex points**)
- **Recital gutter icons** (Phase 4: individual recitals now have 🔗 📜 copy buttons)
- **Annex gutter icons** (Annexes now have 🔗 📜 copy buttons for paragraphs and points — `Annex I, point 3(a)` citation format)
- **"eIDAS 2.0 Regulation"** (Consolidated regulation renamed for clarity across sidebar, header, breadcrumbs)
- **TOC all-collapsed default** (Progressive disclosure: all chapters start collapsed for cleaner initial view)
- **Terminology deep linking** (Click "View in Regulation" → jumps to exact paragraph, preserves legal structure UL/OL)
- **Scroll restoration** (Back button restores position for Article→Terminology→Back and Terminology→Term→Back flows; shared `useScrollRestoration` hook with height-aware polling)
- **Short Title YAML config** (DEC-043: Single source of truth with fail-fast build validation)
- **YAML schema validation** (`npm run validate:config` before build)
- **Clean annex warnings** (Known missing annexes suppressed, only new warnings shown)
- **Multi-source visual separation** (DEC-056: Single cyan color, merged clickable source headers)
- **Legal notation fidelity** (DEC-057: Reg 765/2008 uses HTML for exact `N.` format preservation)
- **Quick Jump search** (DEC-083: Detect document identifiers — CELEX, slugs, ELI URIs — in search query for instant navigation)
- **Slug format standardization** (DEC-083: All slugs now use `{year}-{number}` format, matching ELI URIs)
- **Hash-based citation caching** (MD5 cache key + CACHE_VERSION for script logic changes)

---

## Backlog (Future Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| GitHub header link | Update placeholder `https://github.com` to actual repo URL once published | High |
| GitHub Pages deploy | Push to master to trigger workflow | High |
| ~~Provision Citations~~ | ~~Deep-link references to specific provisions~~ | ~~Done (DEC-064)~~ |
| ~~Terminology highlighting~~ | ~~Auto-highlight defined terms in content with hover popovers~~ | ~~Done (DEC-085)~~ |
| **Additional referenced regulations** | **Import foundational EU regs: 768/2008 (product marketing), 1025/2012 (standardisation), GDPR (2016/679), Services Directive (2006/123/EC)** | **Medium** |
| eIDAS 2.0 (2024/1183) chapters | Add chapter structure for the amending regulation | Low |
| Fix Formex annex nesting | Converter produces sibling structure — ideal fix is nested Markdown | Low |

---

## Recent Sessions

| Date | Summary |
|------|------------|
| 2026-01-19 19:45 | **Second-Pass RP Deep Audit (Schema V12)**: Comprehensive verification of all 90 RP requirements against actual legal text. CRITICAL FIX: Duplicate ID 'RP-AUTH-001' found — Art 6(1) mutual recognition renamed to RP-AUTH-005. Fixed AUDIT_TRACKER_RP.md mapping errors (Art 24 → RP-AUTH-004, Art 32 includes 007a). Created DEEP_AUDIT_RP_PASS2.md with paragraph-level verification. All requirements validated — no gaps. |
| 2026-01-19 18:50 | **RCA Gap Analysis + Recitals Review**: Cross-referenced articles against existing relying-party.yaml. Found 3 missing requirements: RP-AUTH-001 (Art 5b(9) auth responsibility), RP-OPS-004 (Art 5b(10) intermediary data prohibition), RP-ESIG-007a (Art 32(2) validation security). Reviewed all 75 recitals from 2024/1183 (18 RP-relevant, 57 non-RP). Schema v11, 90 total requirements. Renamed AUDIT_TRACKER.md → AUDIT_TRACKER_RP.md for role-specific tracking. |
| 2026-01-19 18:30 | **RCA Systematic Audit Complete**: Comprehensive review of all 29 implementing acts + consolidated regulation. Added 20 new RP requirements (67→87), schema version 10. Key acts: 2024/2977 (PID/EAA — 6 reqs), 2024/2979 (Integrity — 5 reqs), 2025/846 (Cross-Border Identity — 6 reqs), 2025/847 (Security — 3 reqs). 21 acts confirmed N/A (TSP/infrastructure). Created AUDIT_TRACKER.md with article-level mapping. Next: Expand to wallet_provider + trust_service_provider roles. |
| 2026-01-19 00:25 | **Terminology Filtering (DEC-086)**: 3-dimensional filtering system for 107 terms. Dimensions: Document Type (eIDAS, Implementing Acts, Recommendations, EU Law), Role (Holder, PID Provider, Wallet Provider, QTSP, CABs, etc.), Domain (Cryptography, Identity, Attestation, Governance, Wallet Ecosystem). Config-based extensibility (terminology-filters.yaml). Exhaustive manual curation of all 107 terms with roles (term-roles.json) and domains (term-domains.json). FilterDropdown component with glassmorphism styling. Multi-select logic with clear all. No badges on term cards (filtering only). Commit: `0b82505`. |
| 2026-01-18 22:20 | **AI Selection Matrix Complete (DEC-070)**: All 4 phases implemented. Phase 1: Cache detection via `hasModelInCache`. Phase 2: localStorage persistence. Phase 3: Model selector UI (cards, badges, dynamic button). Phase 4: Polish (staggered fade-in, glow effects, hover states). 4 commits: `c6cc4a4`, `4a6a070`, `48febe3`, `66bf780`. |
| 2026-01-18 19:45 | **Bug Fixes + AI Model Selector Plan**: (1) Fixed Quick Jump to recognize EU legal citation format (`910/2014` → `2014-910`), (2) Fixed TOC chapters missing after DEC-083 slug standardization (EIDAS_CHAPTERS keys updated), (3) Designed AI chat model selector for welcome screen — user can now choose model BEFORE loading, with cache detection and localStorage persistence. Plan saved to pending-task.md. |
| 2026-01-18 16:50 | **Term Extraction Fix + Scroll Restoration**: (1) Fixed regex to capture definitions with "means," pattern — "offline mode" was missed, (2) Added unit tests for terminology extraction (`test-terminology-extraction.js` — 15 tests), (3) Implemented full scroll restoration for Article→Terminology→Back flow, (4) Created centralized scroll restoration docs (`.agent/docs/scroll-restoration.md`), (5) Added "Deep Link Override" to TERMINOLOGY.md. |
| 2026-01-18 14:50 | **Terminology Cross-Linking (DEC-085 Phase 1-3)**: Implemented build-time term detection and CSS styling. Created `rehype-term-links.js` plugin that: (1) matches 106 terms + plural variants, (2) exempts definitions articles (Article 2/3) from linking, (3) wraps matches with `<span class="term-link">`. Added CSS for dotted underline styling. 1,589 term links in eIDAS consolidated. Rule 11 added to AGENTS.md (recommendations required). |
| 2026-01-18 13:35 | **Modular AGENTS.md Refactor**: Split 1,888-line AGENTS.md into hub + modules following sdd-bundle-editor pattern. Critical Rules 1-10 remain inline (416 lines). Extracted: development-rules.md (Rules 11-25, 553 lines), content-rules.md (Rules 26-44, 498 lines), rules/README.md (index), build-pipeline.md (architecture). Total preserved: 1,728 lines across 5 files. Quick Reference table links to all docs. |
| 2026-01-18 13:20 | **2015/1501 Interoperability Framework Header Fixes + Retro**: (1) Badge now shows "Impl. Regulation" for implementing_regulation legalType, (2) Date extraction prioritizes signature block "Done at" date over cited dates, (3) HTML parser fixed to italicize all "Having regard" clauses regardless of HTML order, (4) Rules 42-44 added to AGENTS.md (CSS specificity, HTML parser gold standard, blockquote spacing), (5) Terminology added: CSS Specificity Cascade, Title Continuation Pattern. |
| 2026-01-18 12:15 | **Quick Jump + Slug Standardization**: (1) Added `useQuickJump` hook for CELEX/slug/ELI detection in search, (2) Standardized ALL slugs to `{year}-{number}` format (DEC-083), (3) Renamed directories 910_2014→2014_910, 765_2008→2008_765, (4) Updated schema for legalType/category model, (5) Rule 41 added to AGENTS.md. Full pipeline verified. |
| 2026-01-18 10:59 | **EUR-Lex HTML Parser Fixes**: (1) Removed banned "Source Reference" footer, (2) Article titles now separate from headings (clean ToC), (3) Annex points combined with content, (4) Complete annex extraction with titles/sections/tables, (5) Gutter icons for annex points. Added Rules 37-40 to AGENTS.md. 35 docs, 173,385 words. |
| 2026-01-18 01:33 | Citation display text preservation: original legal reference (e.g., "Commission Recommendation (EU) 2021/946") is now preserved as link text instead of shortened version. Regex refined to exclude institutional attribution ("of the European Parliament..."). Added Rule 36 to AGENTS.md. 171,117 words. |
| 2026-01-17 22:58 | Annex gutter icons: paragraphs + points now have 🔗 📜 buttons. EU citation format `Annex I, point 3(a)` per Interinstitutional Style Guide. Fixed: duplicate icons (wrapper skip), sibling context (lastParagraphInContext). Documented in TERMINOLOGY.md + useCopyReference.js. |
| 2026-01-17 19:43 | Fix: Inline QUOT.START/END rendered as blockquotes — abbreviation ('API') now inline. Added ALINEA to TERMINOLOGY.md. Retro: Rules 31-32 (directory naming, QUOT.* detection), installed python3-markdown (3 fewer skipped tests). |
| 2026-01-17 19:09 | Fix: RegulationViewer scroll restoration (same DOM height timing bug as Terminology). Retro: extracted shared `useScrollRestoration` hook (eliminates ~60 lines duplicate code), documented "Wait for DOM Height" pattern (AGENTS.md rule 24) |
| 2026-01-17 15:25 | Retro: CSS class validation script (`validate-css-classes.js`) — catches template/CSS class mismatches at build time. Fixed stale class reference in consolidated popover. |
| 2026-01-17 14:50 | DEC-062: Amendment-Aware Citation Popovers — eIDAS 1.0 citations now show dual badges (IN FORCE + AMENDED), amendment notice with date, "View Consolidated →" button. Data model + build-time + popover template + CSS. Browser-verified. |
| 2026-01-17 14:18 | Terminology consolidation: Added "Provision Citation" term, merged Cross-doc refs + Recital refs backlog items. Fixed eIDAS → eIDAS 1.0 abbreviation. Planned Amendment-Aware Citation Popovers (Option E). |
| 2026-01-17 13:50 | Retro: Added Rules 26-28 (Formex structure, fix cause not symptom, script deletion checklist), DEC-061. Pipeline validation prevents annex extraction regression. |
| 2026-01-17 13:20 | Pipeline fix: Annex extraction now processes all supplementary XML files in Formex archives — 27 implementing acts now have proper annexes extracted (+30,820 words, total 168,956). Removed stale batch_fix_annexes.py task. |
| 2026-01-17 12:21 | DEC-060: Smart Consolidation self-reference detection — consolidated documents now detect citations to their own base regulation and display "CURRENT DOCUMENT" badge with dual EUR-Lex links (Original 2014 + Amendment 2024). Retro: extracted popover template utility, hash-based citation caching |
| 2026-01-17 10:37 | DEC-059: Enhanced citation popovers (Hybrid B+C) — abbreviation badges ("GDPR", "eIDAS"), status pills ("IN FORCE"/"REPEALED"), human-friendly names, entry-into-force dates, EUR-Lex registry enrichment |
| 2026-01-17 10:10 | Retro: Trace utility (`src/utils/trace.js`) for debugging — enable via `?debug=scroll`, Rules 21-23 (tracing, SPA pitfalls, React Router hooks) |
| 2026-01-17 09:58 | Fix: Scroll restoration bug — Performance API doesn't work for SPAs! Switched to React Router's `useNavigationType()` which returns `POP` for back/forward |
| 2026-01-17 01:40 | DEC-057: Deep linking fix with legal notation preservation (Rule 19 added, HTML for 765/2008 definitions), retro → 6 improvements |
| 2026-01-17 00:53 | DEC-056: Multi-source visual separation (colored borders cyan/purple, merged clickable source headers, removed redundant links) |
| 2026-01-17 00:10 | Recital gutter icons (Phase 4), informal citation detection, TERMINOLOGY.md created, retro improvements (Rule 15+16, init workflow, snippets) |
| 2026-01-16 21:30 | DEC-043 Short Title SSOT: YAML shortTitle field, fail-fast build validation, schema validation (`npm run validate:config`), annex warning cleanup, retro workflow updates |
| 2026-01-16 18:35 | DEC-042 complete: EUR-Lex HTML parser pipeline integration, portal validation, documentation (5 phases done) |
| 2026-01-16 17:50 | Regulation 765/2008: Full HTML extraction (48 recitals, 44 articles, 2 annexes, 11,566 words replacing 1,400 word partial) |
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


