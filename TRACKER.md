# eIDAS 2.0 Knowledge Base - Work Tracker

> **Live document.** Update after each session.

---

## Current Status

| Field | Value |
|-------|---------|
| **Last Updated** | 2026-01-21 02:15 CET |
| **Session State** | V3.6.5 — RCA Stats Bar |
| **Portal Status** | ✅ Fully functional (190,860 words, **129 terms**, **458 RCA requirements**, **12 atomic categories**) |
| **Next Action** | Ready for next task |

---

## Portal Features (Complete)

- **35 documents** (6 regulations/supplementary: 910/2014, 2024/1183, 765/2008, 2021/946, 2015/1501, **eSignature FAQ** + 29 implementing acts)
- **eIDAS Interoperability Framework** (2015/1501 imported via HTML parser — establishes technical requirements for cross-border eID interoperability)
- **EUDIW Toolbox Recommendation** (32021H0946 imported via extended Formex converter — foundational document establishing Member State cooperation for European Digital Identity Framework)
- **Full-text + semantic search** (Orama + Transformers.js embeddings)
- **Terminology cross-linking** (DEC-085: Auto-highlight defined terms in running text with hover popovers — definitions articles exempted)
- **Terminology system** (**127 terms** from 4 sources, multi-source display, hover popovers, cross-refs)
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
| ~~GitHub header link~~ | ~~Update placeholder to actual repo URL~~ | ~~Done~~ |
| ~~GitHub Pages deploy~~ | ~~Push to master to trigger workflow~~ | ~~Done~~ |
| ~~Provision Citations~~ | ~~Deep-link references to specific provisions~~ | ~~Done (DEC-064)~~ |
| ~~Terminology highlighting~~ | ~~Auto-highlight defined terms in content with hover popovers~~ | ~~Done (DEC-085)~~ |
| **Additional referenced regulations** | **Import foundational EU regs: 768/2008 (product marketing), 1025/2012 (standardisation), GDPR (2016/679), Services Directive (2006/123/EC)** | **Medium** |
| ~~eIDAS 2.0 (2024/1183) chapters~~ | ~~Amending regulation has no chapters; consolidated 910/2014 already has chapter structure~~ | ~~N/A~~ |
| ~~Fix Formex annex nesting~~ | ~~Verified: Sub-points properly nested with indentation and different bullet styles~~ | ~~Done~~ |

---

## Recent Sessions

| Date | Summary |
|------|------------|
| 2026-01-21 02:15 | **RCA Stats Bar (V3.6.5)**: Added framework scope info bar to RCA page: "📊 458 requirements across 7 roles and 19 use cases" with "393 universal • 65 use-case specific" breakdown. Build-time computed stats (totalRoles, universalRequirements, useCaseSpecificRequirements). Glassmorphism styling with responsive layout. |
| 2026-01-21 02:10 | **Regression Prevention Validation (V3.6.4)**: Implemented P0 measures to prevent silent content corruption. (1) Created `config/protected-sources.yaml` manifest defining content invariants for critical documents (eIDAS 2014-910, 2024-1183, 765/2008), (2) Added `validateProtectedSources()` to build-content.js — checks required articles, min word counts, min TOC items, and required patterns, (3) Build now FAILS if any protected document is damaged. Root cause analysis: commit a7a8dbb scrambled eIDAS source but tests passed silently. Prevention: Fail fast at build time. |
| 2026-01-21 01:35 | **Critical Regression Fix (V3.6.3)**: Restored eIDAS consolidated regulation (2014-910) — Articles 5a through 45 were missing from rendered content. Root cause: Commit `a7a8dbb` (CONS.ANNEX fix) accidentally scrambled the markdown source file, jumping from Article 5 directly to Article 46. Fixed by restoring source from `a7a8dbb~1` and rebuilding. Browser-verified all articles now present in TOC and content. |
| 2026-01-21 01:30 | **Supplementary Content Pipeline + Term-Link Fixes (V3.6.2)**: (1) Created `03_supplementary/` directory with FAQ markdown source, (2) Updated `build-content.js` to process supplementary content type with YAML front matter parsing, (3) FAQ now goes through same pipeline as regulations (auto term-links, heading IDs, etc.), (4) Fixed term-link bug: `parts.length > 0` not `> 1` for single-term text nodes like `<li>Electronic signature</li>`, (5) Human-friendly document titles in terminology popovers ("eIDAS 2.0 Regulation (Consolidated)" not "Regulation 910/2014"), (6) Fixed FAQ source field — now proper URL instead of descriptive text, (7) Documented term-link fix in Rule 26 of development-rules.md. |
| 2026-01-20 23:49 | **Search Improvements + Build Workflow (V3.6.1)**: (1) Added 'simple electronic signature' and 'simple electronic seal' terms (129 terms now), (2) Fixed search ranking for 'digital signature' — was missing due to stale index, (3) Added `npm run build:all-content` combined command (runs terminology + search together), (4) CI now fails if search index is stale (`CI=true` environment detection), (5) Documented build workflow in AGENTS.md, (6) Retro: Identified staleness as root cause, implemented preventive measures. |
| 2026-01-20 22:50 | **FAQ Terminology Expansion (V3.6.0)**: (1) Imported EC eSignature FAQ (5,788 words) as new 'supplementary' document category, (2) Created `supplementary-terms.yaml` with 31 verbatim FAQ definitions (DEC-092), (3) Updated build-terminology.js with `loadSupplementaryTerms()` function, (4) 127 unique terms now (was 107) with 231 total definitions, (5) Core terms like "electronic signature" now have 2 sources (legal + plain-language), (6) Added role/domain mappings for all new terms, (7) Renamed sidebar section "Referenced Regulations" → "Supplementary Documents" (DEC-093), (8) Fixed FAQ section titles to show human-readable questions instead of URL slugs. |
| 2026-01-20 22:09 | **Hybrid Use Case Selector (V3.5.6)**: Redesigned RCA use case selection with hybrid pattern: (1) Domain chips (toggle multi-select) replace filter pills at top, (2) Flat grouped list shows use cases with always-visible descriptions (no accordion collapse), (3) Empty state prompt when no domains selected, (4) "Select all" checkbox per domain header, (5) Glossy cyan styling on selected chips/items. Retro: Added 4 terms to TERMINOLOGY.md (Domain, Requirement Category, Hybrid Selector Pattern, Domain Chip), updated /ux-design workflow with "tabs imply exclusivity" and "check existing UI first" rules. |
| 2026-01-20 21:11 | **Complete Role Labels Refresh (V3.5.5)**: Second pass over all 7 roles for clarity: (1) Relying Party: action-oriented "Verifies wallet credentials...", (2) Wallet Provider: "Develops and operates the EUDI Wallet solution", profile "Member State Direct" → "Government-Operated" with Art 5a refs, (3) PID Provider: emphasizes "foundational identity credential", (4) **CAB**: Fixed inaccurate scope — now includes "wallet providers, QTSPs, and QEAA issuers" (was only QTSPs), (5) Supervisory Body: shortened to "Authority overseeing...". Browser-verified all changes. |
| 2026-01-20 21:03 | **EAA/TSP Role Label Improvements (V3.5.4)**: Per DEC-091, improved role tile wording for legal clarity: (1) EAA Issuer profiles now "Qualified (QEAA)", "Non-Qualified EAA", "Public Authentic Source" — removed misleading "TSP" from QEAA label, (2) TSP profiles now "Non-Qualified TSP" for consistency, (3) Updated descriptions to reflect legal relationships (e.g., PAS are NOT TSPs), (4) Browser-verified UI changes. |
| 2026-01-20 20:27 | **Use Case Mapping Complete + Retro (V3.5.3)**: (1) Completed 7-phase use case mapping audit (458 requirements), (2) Found 15 use-case-specific requirements (3.3%), (3) Discovered "Infrastructure Universalism" pattern — TSP/Issuer/PID/CAB/SB are 100% universal, (4) Added DEC-088 Addendum documenting the pattern, (5) Added 3 terms to TERMINOLOGY.md (Service-Facing Role, Infrastructure Role, Infrastructure Universalism), (6) Created USE_CASE_MAPPING_SUMMARY.md consolidating all 7 tracker files, (7) Added use case mapping guidance to AGENTS.md. |
| 2026-01-20 19:45 | **Requirement ID Alignment (DEC-090)**: (1) Renamed all 458 requirement IDs to match atomic categories from DEC-089, (2) New format: `{ROLE}-{CATEGORY_PREFIX}-{NNN}` (e.g., RP-VER-001, WP-SEC-002), (3) Created transformation script `rename-requirement-ids.cjs`, (4) Requirements reordered by category within each file, (5) Added Rule 12 to AGENTS.md: Plans to Files, Not Chat, (6) Migration mapping saved to `id-migration-map.json`, (7) Updated DECISIONS.md examples with new IDs. |
| 2026-01-20 19:20 | **Atomic Category Taxonomy (DEC-089)**: (1) Implemented 12 atomic categories as global taxonomy — each represents exactly ONE type of legal obligation (registration, certification, issuance, revocation, verification, technical, interoperability, security, privacy, transparency, governance, liability), (2) Created `categories.yaml` as single source of truth, (3) Updated validator to enforce global categories, (4) Updated build-rca.js to load from global file, (5) Remapped 270 requirements across 7 files (accreditation→registration, reporting→transparency, operational→governance, data-protection→privacy, etc.), (6) Removed per-file category sections, (7) Key principle: Categories = obligation TYPE, Use cases = service CONTEXT. |
| 2026-01-20 17:10 | **RCA Configuration Validator (DEC-088)**: (1) Implemented `validate-rca.js` script that checks all requirements files at build time, (2) Validates useCases against 19 valid IDs from use-cases.yaml, (3) Validates roles against 7 valid IDs from roles.yaml, (4) Validates categories when defined in file, (5) Added to build pipeline (`npm run validate:rca`), (6) Fixed ~50 pre-existing data quality issues across RP/WP/Issuer files (invalid use case IDs like `pid-proximity`, `eseal`, `timestamp`, duplicate entries, category typos), (7) All 458 requirements now pass validation — prevents future invalid mappings. |
| 2026-01-20 16:55 | **Wallet Provider Use Case Mapping (Phase 1)**: Completed semantic analysis of 132 WP requirements per DEC-088. Results: 118 universal (`all`), 8 esignature-specific, 4 pseudonym-specific. User decision: WP-PROT-* (26 protocol requirements from 2024/2982) mapped to `all` as foundational infrastructure. Created USE_CASE_MAPPING_WP.md tracker. |
| 2026-01-20 16:45 | **Use Case Mapping Methodology (DEC-088)**: Created formal decision and workflow for semantic use-case analysis. Key rules: (1) NO keyword/grep matching — each requirement analyzed in legal context, (2) Escalation mandatory for ambiguous cases, (3) Phased execution by role (WP→RP→TSP→...). Created `/use-case-audit` workflow with decision flowchart, tracker template, and completion checklist. 19 use cases finalized. |
| 2026-01-20 14:40 | **Multi-Role RCA UI Complete (V3.3.0)**: (1) Implemented multi-role selection — organizations can now select multiple roles (e.g., Bank = RP + Issuer), (2) Design A pattern: big icon cards with checkboxes and inline profile expansion, (3) 4+3 grid layout for 7 role cards with responsive breakpoints, (4) Requirement aggregation with deduplication — shared requirements tracked via `sourceRoles` array, (5) Global use case filtering (not per-role), (6) Summary bar showing \"X roles · Y profiles\" with live requirement count, (7) Retro: Added UX design checklist workflow, component architecture rule to AGENTS.md, new RCA terms to TERMINOLOGY.md. |
| 2026-01-20 02:45 | **Supervisory Body Role Complete (V3.2.6)**: (1) Created supervisory-body.yaml with 42 requirements from Articles 17-19, 46a-46e, (2) Two profiles: wallet_supervision (26 reqs for Art 46a EUDIW oversight) and trust_service_supervision (30 reqs for Art 46b TSP oversight), (3) 14 shared requirements covering SPOC, mutual assistance, and Cooperation Group participation, (4) Categories: governance (2), supervision (6), enforcement (8), cooperation (10), incident-response (3), notification (3), reporting (2), (5) All 7 RCA roles now complete: RP, WP, Issuer, PID, TSP, CAB, Supervisory Body, (6) Build verified: 458 total requirements. |

| 2026-01-20 02:30 | **TSP Implementing Acts Audit Complete (V3.2.4)**: (1) Reviewed ALL 18 TSP-related implementing acts per Rule 1 (Infinite Time Principle) — no shortcuts, (2) Extracted 44 additional requirements (41→85 TSP requirements), (3) Key acts: 2025/2530 (QTSP requirements — 12 reqs), 2025/2160 (non-qualified risk — 7 reqs), 2025/1569 (QEAA — 6 reqs), 2025/1566 (identity verification — 4 reqs), 2025/1567 (remote QSCD — 4 reqs), 2025/2532 (archiving — 5 reqs), 2025/1572 (service initiation — 1 req), cross-cutting (4 reqs), (4) Added Rule 1 to AGENTS.md: Infinite Time Principle — never downscope due to time/context, (5) Updated AUDIT_TRACKER_TSP.md — 0 unreviewed items, (6) Build verified: 380 total RCA requirements. |

| 2026-01-20 01:38 | **Trust Service Provider Audit Complete (V3.2.3)**: (1) Created trust-service-provider.yaml with 41 requirements from Arts 13-24, 29a + Annexes I-V, (2) Two profiles: qualified (QTSP — higher assurance, EU Trusted Lists) and non_qualified (baseline requirements), (3) Categories: liability (2), accessibility (1), security (5), operational (7), certification (4), transparency (4), identity-verification (2), data-protection (2), data-retention (1), technical (6), (4) Created AUDIT_TRACKER_TSP.md with full provision-level review (0 unreviewed items), (5) Enabled TSP role in roles.yaml, (6) Build verified: 336 total requirements across 5 roles. |
| 2026-01-20 00:55 | **PID Provider Audit Complete (V3.2.2)**: (1) Enabled PID Provider role in roles.yaml (no profiles — requirements apply uniformly per Art 5a(5)), (2) Created pid-provider.yaml with 30 requirements from 2024/2977 Articles 3, 5, Annex + main regulation, (3) Categories: issuance (9), revocation (10), data-quality (5), regulatory (6), (4) Created AUDIT_TRACKER_PID.md with full provision-level review, (5) Build verified: 295 total requirements across 4 roles. |
| 2026-01-20 00:45 | **Profile Filtering Complete (V3.2.1)**: (1) Fixed ProfileSelector UI bug — individual profiles were disabled when "All" selected (`disabled={allSelected}` removed), (2) Added `profileFilter` annotations to 7 sector-specific RP requirements (public_sector/private_sector), (3) Researched WP provider profiles — confirmed Article 5a(2) legal basis for member_state/mandated/independent, (4) Found profile-specific WP requirement via Article 5a(14) → Article 45h(3) mutatis mutandis — added WP-DP-003a (functional separation) for mandated/independent only, (5) Added Profile Differentiation Analysis to AUDIT_TRACKER_WP.md, (6) Retro: Added mutatis mutandis audit step to /rca-audit workflow, documented profile filter pattern in AGENTS.md, added Mutatis Mutandis and Functional Separation to TERMINOLOGY.md. |
| 2026-01-19 23:50 | **EAA Issuer Audit Complete (V3.2.0)**: (1) Fixed Formex converter bug — CONS.ANNEX elements have LIST inside P (not direct children), missing Annex V content now extracted, (2) Completed systematic EAA Issuer audit — 42 requirements across 3 profiles (qualified/non_qualified/public_authentic), (3) Sources: Main regulation Art. 24, 45d-45h, Annexes V-VII + implementing acts 2024/2977, 2025/1569, 2025/2530, (4) Retro: Added test case for CONS.ANNEX, added "check source field" rule to AGENTS.md, reverted unneeded HTML converter changes. |
| 2026-01-19 23:00 | **WP Audit Complete + Role Profiles (V3.1.0)**: (1) Completed Wallet Provider reverse audit verification — all 131 requirements validated against 4 implementing acts (2024/2979, 2024/2981, 2024/2982, 2025/848), (2) Enabled Wallet Provider in RCA UI (`roles.yaml` enabled: true), (3) Implemented Role Profiles feature for fine-grained requirement filtering — RP has public/private sector, EAA Issuer has qualified/non-qualified/public-authentic, WP has member-state/mandated/independent, (4) Added ProfileSelector component + CSS, (5) Updated build-rca.js to process profiles and profileFilter fields, (6) Browser-verified profile selector UI working. Retro: Added Role Profile and Profile Filter to TERMINOLOGY.md, updated `/rca-audit` workflow with profile guidance, created issuer.yaml stub for next audit. |
| 2026-01-19 20:00 | **RCA Audit Workflow Overhaul (Schema V13)**: Major workflow improvements: (1) Zero tolerance for ⬜ items — mandatory verification before completion, (2) One row per provision rule — no collapsed ranges (Art. 1-22, Annexes I-IX, etc.), (3) Local regulation paths documented in AGENTS.md, (4) Verification grep command added to workflow. Added RP-REG-013 (privacy policy URL per 2025/848 Art 8(2)(g)). Expanded all collapsed ranges in AUDIT_TRACKER_RP.md. Added "Collapsed Range" and "One Row Per Provision" to TERMINOLOGY.md. |
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


