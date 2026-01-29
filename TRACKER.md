# eIDAS 2.0 Knowledge Base - Work Tracker

> **Session state only.** Feature inventory is in the codebase. Full history: `git log --oneline`.

---

## Current Status

| Field | Value |
|-------|-------|
| **Last Updated** | 2026-01-29 09:16 CET |
| **Version** | V4.0.3 |
| **Portal Stats** | 44 docs, 391K words, 359 terms, 2,384 article links, 487 RCA reqs, 138 VCQ reqs, 559 ARF HLRs |
| **Next Action** | VCQ complete — ready for next feature |


---

## Active Implementation Plan

| Plan | Status | Path |
|------|--------|------|
| VCQ-ARF Harmonization (DEC-257/263) | ✅ Complete | `.agent/plans/VCQ_ARF_HARMONIZATION_PLAN.md` |

---

## Import Queue

| Regulation | Citations | Status | Plan |
|------------|-----------|--------|------|
| *(Queue empty)* | — | ✅ | — |

---

## Recent Sessions

| Date | Summary |
|------|---------|
| 2026-01-29 09:16 | **Refactor: Remove linkedRCA + ARF Coverage Audit** — Removed unused `linkedRCA` field from VCQ codebase (25 requirements, 9 files). Created `audit-hlr-coverage.cjs` script for systematic ARF gap analysis. Confirmed 100% RP-topic coverage: 47 HLRs in VCQ + 70 excluded (wallet_provider, empty, member_state categories). All 6 "potential gaps" (OIA_15, OIA_16, RPA_02a, VCR_12, ProxId_01a, DATA_DLT_07) verified as already covered by existing VCQ requirements. Updated TERMINOLOGY.md with correct exclusion reason codes. VCQ and RCA now fully independent assessment tools. |
| 2026-01-29 08:15 | **Feat: VCQ Categorization Scheme Toggle** — Added flexible categorization system with UI dropdown to switch between \"Functional (6)\" and \"By Role (2)\" groupings. LocalStorage persistence for user preference. Scheme-aware rendering in Summary/Details views. Updated Markdown and Excel exports to reflect active scheme. Universal requirements show under appropriate category based on selected roles. Retro: AGENTS.md updates (base URL routing, dev server check, browser screenshots), TERMINOLOGY.md updates, react-patterns.md snippet. |\n| 2026-01-28 16:35 | **DEC-260: Ambiguous HLR Resolution** — Reviewed 32 multi-role HLRs flagged during VCQ-ARF harmonization. All reclassified to definitive categories: 11→rulebook_author (ARB_*), 11→wallet_provider (ISSU_*, QES_*, PA_12, VCR_14, RPA_12), 7→member_state (Reg_*, TLPub_*, RPRC_08), 3→informative (VCR_07a/b, QTSPAS_07a). multi_role_review now empty (0 HLRs). 100% disposition achieved. |
| 2026-01-28 15:51 | **VCQ-ARF Harmonization Complete (V4.0.0)** — Multi-role schema v2 with 144 requirements (64→144, +125%). 78 ARF references covering 134 unique HLRs. Fixed ARF source group counting (cross-cutting). Professional Excel export with xlsx-js-style (3 sheets, styled). Retro: VCQ Architecture docs in AGENTS.md, topic-HLR validation, 2 new terminology entries (Cross-cutting Reference, HLR Exclusion). 6 commits pushed. |
| 2026-01-28 04:23 | **Plan: VCQ Role/Category Expansion (DEC-257)** — Deep audit revealed UI Steps 1-2 (Role/Category selection) are cosmetic — `applicableRequirements` ignores `selectedRoles`/`selectedCategories`. New schema v2: `roles[]` and `productCategories[]` arrays replace deprecated `applicability` field. Plan: 4 phases, 11 files. Phase 1 = schema migration (build-vcq, validate-vcq, existing YAML files). Phase 2 = new requirements (issuer.yaml ~25, trust_services.yaml ~15, payments.yaml ~12). Phase 3 = UI filtering logic. Target: 64→116 requirements. |
| 2026-01-28 03:22 | **Refine: PSD2 SCA Assessment Cleanup** — Removed ~100 lines of process cruft: Document History section deleted (git = source of truth), stakeholder feedback cleaned (kept only substantive gaps). **Code Reference Audit**: Converted all 12 reference implementation links to commit-specific GitHub URLs with line ranges. **Appendix Consolidation**: Deleted Appendix B (Accessibility, too thin), slimmed Appendix C (GitHub Discussion, kept Mastercard proposal only, ETPPA integrated inline). Now 3 appendices (A-C). Total: 7,435 lines. |
| 2026-01-27 17:26 | **Research: PSD2 SCA Compliance Assessment (v1.2)** — Complete article-by-article assessment of EUDI Wallet TS12 vs PSD2 RTS 2018/389. Imported RTS full text, cloned iOS/Android reference implementations (pinned commits). Analyzed Dutch PA report. **CRITICAL FIX**: Corrected authentication code definition (VP Token, not `jti`). Deliverables: `PSD2_SCA_COMPLIANCE_ASSESSMENT.md` (734 lines), KI updated. 49 requirements mapped: 18 compliant, 6 partial, 9 PSP-required, 2 impl-specific. |
| 2026-01-26 20:52 | **Feat: VCQ Architecture Tile + Layout Fixes** — Redesigned Architecture source to 3 checkboxes (ARF, Tech Specs, Rulebooks) with TS1–TS14, PID & mDL, ARF hints. DORA now default-on. Removed "Your Selection" summary panel. Fixed regulation page sidebar overlap caused by `margin-left: -80px` in CopyReference.css gutter icon styling. |
| 2026-01-26 16:13 | **Feat: RFC 2119 Obligation Levels (VCQ)** — Replaced subjective "criticality" (Critical/High/Medium/Low) with RFC 2119 obligation levels (MUST/SHOULD/MAY) derived from modal verbs in requirement text. Added `deriveObligation()` to build-vcq.js, updated UI summary cards and table badges. Fixed ARF version (1.5→2.7.3). Recategorized VEND-CORE-015/016/017 from governance→registration. Retro: documented category semantics, added RFC 2119 terms to TERMINOLOGY.md. |
| 2026-01-26 10:28 | **Feat: VCQ Source Selection Simplification (DEC-255)** — Simplified VCQ UI from 5 toggle cards to 3-tile model: Primary (eIDAS + Implementing Acts bundled), Related Regulations (GDPR/DORA checkboxes), Architecture (ARF as checkbox item). Added "Implementation guidance" description, requirement count badges. Fixed validator for DEC-254 (VEND-INT-* format + legacy pif/vif acceptance). GitHub Pages CDN caching diagnosed as deployment issue. |
| 2026-01-26 09:17 | **Refactor: VCQ Intermediary Consolidation (DEC-254)** — Discovered PIF/VIF were invented terms, not official regulatory terminology. ARF RPI_09 includes verification in unified RP Intermediary role. Merged pif.yaml+vif.yaml→intermediary.yaml (25 reqs, VEND-INT-*). Removed type selection from VCQ UI. Updated TERMINOLOGY.md with deprecation notices. Added AGENTS.md Rules 14-15 (terminology verification + source citation). Research docs: INTERMEDIARY_ROLE_ANALYSIS.md, VCQ_INTERMEDIARY_CONSOLIDATION.md. |
| 2026-01-26 08:18 | **Feat: EDPS Document Analysis + Terminology** — Analyzed 5 EDPS documents (2021-2025), extracted terminology: enhanced unlinkability with 4 dimensions (w.r.t. RPs, IdPs, revocation managers, colluding parties); added 5 new terms (anonymous credentials, device binding, secure element, TEE, level of assurance). AGENTS.md: documented .agent/research/ folder, RCA = legislation only rule. Total terms: 354→359. |
| 2026-01-26 00:17 | **Fix: Alphanumeric Paragraph Deep Linking** — Fixed missing gutter icons for paragraphs 1a, 1b, 1c in eIDAS. Two-part fix: (1) markdown format `1a.` → `- (1a)` for 18 instances, (2) `rehype-paragraph-ids.js` now detects paragraph patterns in list items with nested sublists. Also fixed EU reference format (`Article 24para1a` → `Article 24(1a)`). Retro: added AGENTS.md rule + code warning. |
| 2026-01-25 23:50 | **Feat: Article Cross-Linking (DEC-N/A)** — Implemented `rehype-article-links.js` plugin for intra-document navigation. 2,341 links generated (Article N, Annex I, Recital N patterns). Fixed Article 218 TFEU false positive. Added TFEU/TEU to terminology. HashRouter-compatible click handler. Override system for compound refs. |
| 2026-01-24 17:00 | **UI: High-Density Layout + Status Column Removal (DEC-250, DEC-251)** — Simplified sidebar toggle to header-only hamburger. Reduced main-content padding (2rem→1.5rem). RCA: removed Status column + assessments state; now a pure generator tool. VCQ: similar column adjustments. |
| 2026-01-24 16:15 | **Feat: Hybrid Sidebar Toggle (DEC-227)** — Hamburger button now visible on desktop, collapses/expands sidebar with smooth animation. State persisted in localStorage. Mobile keeps overlay behavior. |
| 2026-01-24 15:30 | **Feat: Policy Document Imports** — Added 3 policy documents: Digital Future Communication (COM(2020)67, 4.9K words), 2030 Digital Compass (COM(2021)118, 3.7K words + Annex), Digital Decade Decision (2022/2481, 2.7K words). Completes policy context chain for EUDIW. |
| 2026-01-24 10:48 | **Revert: Removed Search Highlight Feature** — Removed the `?highlight=` search highlighting feature (added earlier this session) per user request. Reverted ~250 lines of JS, ~45 lines of CSS. Link builder now simpler. |
| 2026-01-24 10:20 | **Refactor: Centralized Link Builder (DEC-226)** — Created `linkBuilder.js` as single source of truth for URL generation. Refactored 8 files. Fixed Home page Quick Links using broken `#article-*` format. Added mandatory usage documentation to AGENTS.md. |
| 2026-01-24 03:52 | **Retro: Annex Fix Session** — Added `validate-annex-content.js` (empty annex detection), ETSI REQ-* extraction policy in AGENTS.md, ETSI Standard in TERMINOLOGY.md, updated /import-regulation workflow with Step 4.5 for ETSI check. |
| 2026-01-24 03:55 | **Feat: QWAC Issuer RCA Requirements** — Extracted 3 requirements from 2025/2527 annex (ETSI EN 319 411-2, TS 119 495, TS 119 411-5). New `qwac_issuer` profile for TSP. TSP reqs: 100→103. |
| 2026-01-24 03:50 | **Feat: Electronic Ledger RCA Requirements** — Extracted 15 REQ-* requirements from 2025/2531 annex into RCA tool. New `electronic_ledger` profile for TSP. Covers ETSI EN 319 401 adaptations for DLT trust services. TSP reqs: 85→100. |
| 2026-01-24 03:45 | **Fix: Missing Annex Content** — Audited all 29 implementing acts, fixed 3 with empty annexes (2025/2531 Electronic Ledgers, 2025/1570 QSCD Notification, 2025/2527 QWAC Standards). Rebuilt terminology (268→283 terms) + search. |
| 2026-01-24 03:20 | **Retro: Regulation ID Standardization** — DEC-225, normalized 114 YAML IDs (910/2014→2014/910), extracted LegalBasisLink + useRegulationsIndex to shared modules, AGENTS.md docs for anchor IDs + auto-commit protocol |
| 2026-01-24 01:30 | **Fix: RCA Legal Basis Display** — Human-friendly regulation names, wider column, auto-select use cases on domain toggle, annex deep link fix |
| 2026-01-23 13:25 | **Retro: Sidebar redesign** — DEC-224, TERMINOLOGY.md updates (Collapsible Section, Accordion), react-patterns.md snippet, squashed commits |
| 2026-01-23 12:25 | **Feat: Sidebar Tools-First Redesign** — Tools section promoted to top for discoverability, collapsible accordion sections, localStorage persistence, Supplementary Documents collapsed by default (DEC-224) |
| 2026-01-23 09:15 | **Retro: Rule 27 + 6 improvements** — Commit checkpoint requirement, YAML parser extraction, RegulationsIndex, terminology updates |
| 2026-01-23 08:32 | **Feat: Unified Requirements Browser** — 1084 total reqs (559 ARF + 470 RCA + 55 VCQ), Legal Basis filtering, CSV/JSON/PDF exports, URL state sync |
| 2026-01-23 05:09 | **Retro: Phase 6 polish** — validate-vcq.js ARF checking, ARF search styling, AGENTS.md + TERMINOLOGY.md updates |
| 2026-01-23 03:55 | **Feat: Phase 6 ARF Database Integration** — 143 HLRs imported, search index (129), 7 new VCQ reqs, deep linking with popovers |
| 2026-01-23 02:25 | Feat: VCQ ARF external links — GitHub links to ARF HLRs with styled badges |
| 2026-01-23 02:20 | Feat: VCQ PDF export — browser print-to-PDF with styled document template |
| 2026-01-22 20:00 | Feat: VCQ Summary View (View A) — Dashboard with criticality breakdown, category cards, view toggle |
| 2026-01-22 19:00 | Refactor: VCQ simplified to 2-step UI — removed Extended Scope step, DORA auto-includes ICT reqs |
| 2026-01-22 09:30 | Feat: VCQ Source Selection + RCA linkage display in requirements table |
| 2026-01-22 07:59 | Fix: RCA legal basis links — normalized regulation ID lookup (2025/848 → 2025-0848) |
| 2026-01-21 23:58 | UI: abbreviation display in Terminology page + popovers (e.g., "person identification data (PID)") |
| 2026-01-21 23:10 | Feat: abbreviation search indexing — WSCD/QEAA/TSP etc. now searchable |
| 2026-01-21 20:40 | DORA Import — 46K words, 64 articles, 65 terminology definitions (Financial RP profile) |
| 2026-01-21 17:50 | DEC-095: Markdown-First Import Strategy — all 39 docs now source:manual |
| 2026-01-21 17:45 | Fixed Article 7(f) blockquote bug — continuation P in non-amendment context |
| 2026-01-21 17:40 | Fixed Annexes I-VII in 2024/1183 — added missing replacement content |
| 2026-01-21 17:35 | Fixed inline QUOT.START blockquoting (Cooperation Group pattern) |
| 2026-01-21 14:25 | Terminology Title Fix — Cybersecurity Act/NIS2 human-friendly names in popovers |
| 2026-01-21 13:50 | Cybersecurity Act Import — 31K words, 69 articles, 22 terminology definitions |
| 2026-01-21 13:00 | NIS2 Directive Import — 40K words, 46 articles, 38 terminology definitions |
| 2026-01-21 12:41 | Intermediary Profile Implementation — uses_intermediary + acts_as_intermediary |

---

*Older sessions: `git log --oneline --since="2026-01-14"`*
