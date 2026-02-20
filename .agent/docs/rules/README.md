# Rules & Documentation Index

Quick reference for all rules and extracted reference documentation in the eIDAS Documentation Portal project.

## Critical Rules (1-23)

**Location:** Main `AGENTS.md` file (always visible)

| # | Rule | Summary |
|---|------|---------|
| 1 | Infinite Time Principle | ABSOLUTE — never downscope due to time/token/context |
| 2 | Session Length Guard | Alert user when Step Id ≥ 250 |
| 4 | Auto-commit Protocol | Commit IMMEDIATELY after each logical increment |
| 5 | Clean Chrome Tabs | Run `cleanup-chrome-tabs.sh` BEFORE browser_subagent |
| 6 | UI/UX Proposals | Generate visual mockups BEFORE proposing options |
| 7 | Proactive Prevention Protocol | Add tests/validation after EVERY bug fix |
| 8 | Route Path Verification | Check App.jsx for exact paths, verify singular vs plural |
| 9 | Systematic Solutions Only | Fix at SOURCE, not downstream workarounds |
| 10 | AGENTS.md Requires Approval | Never modify without explicit user consent |
| 11 | Clarify Before Acting | Answer questions before taking action |
| 12 | Recommendations Required | Always include recommendation + justification |
| 13 | Plans to Files | Write plans to `.agent/session/`, not chat |
| 14 | Confirm Feature UX | Describe behavior + ask before building new UI |
| 15 | Verify Terminology | Web search before creating new terms/acronyms |
| 16 | Terminology Source Citation | Every term needs source or ⚙️ portal convention |
| 17 | Custom Dictionary Quality | Authority hierarchy + cascading impact scan |
| 18 | WUA Source Authority | TS3 is definitive; WUAs are issuance-only |
| 19 | Terminal Hygiene | Clear git locks, kill stuck terminals |
| 20 | Codebase-First Plan Review | Inspect actual source before proposing changes |
| 21 | Do It, Don't Suggest It | Execute tasks yourself, don't give TODOs |
| 22 | Command Safety | Timeouts on all network/process commands |
| 23 | Root-Cause-First Debugging | Diagnose before fixing |

---

## Development Rules (11-25)

**Location:** [development-rules.md](development-rules.md)

*Note: These are the extended development rules, numbered independently from the AGENTS.md critical rules.*

| # | Rule | Summary |
|---|------|---------|
| 11 | React Development Best Practices | Unstable deps, infinite loops, Link onClick |
| 12 | DOM-First Debugging | Inspect actual DOM before proposing solutions |
| 13 | Legal Structure Preservation | Never change ul/ol or numbering schemes |
| 14 | Git Checkout Safety | Never checkout files with uncommitted intended work |
| 15 | Vocabulary Confirmation | Confirm understanding of UI terms before implementing |
| 16 | TERMINOLOGY.md Maintenance | Update when new concepts introduced |
| 17 | CSS Flex Gap with Inline Text | Wrap adjacent inline content in single element |
| 18 | EU Regulation Numbering Formats | Handle EC vs EU, year/number positions |
| 19 | ⛔ Legal Document Visual Fidelity | ABSOLUTE: Never modify legal notation |
| 20 | Markdown Numbered List Renumbering | Non-consecutive lists get renumbered |
| 21 | Client-Side Tracing | Use ?debug=scroll for debugging |
| 22 | SPA API Pitfalls | Many browser APIs don't work in SPAs |
| 23 | React Router Built-in Hooks | Use before writing custom |
| 24 | Scroll Restoration: Wait for DOM Height | Poll for height before scrollTo |
| 25 | CSS Debug Mode | ?debug=css for visual element debugging |

---

## Content Rules (26-44)

**Location:** [content-rules.md](content-rules.md)

| # | Rule | Summary |
|---|------|---------|
| 26 | AST Traversal Pitfall | Ancestors don't include current node |
| 27 | Formex Archive Structure | Multiple XML files in ZIP |
| 28 | Fix Cause, Not Symptom | Fix pipeline, not one-time scripts |
| 29 | Script Deletion Checklist | Verify root cause fixed before deleting |
| 30 | Build Script Cache Invalidation | Bump CACHE_VERSION when changing logic |
| 31 | Directory Naming Gotcha | Folder names don't always match CELEX |
| 32 | Inline vs Standalone QUOT.* | Detection for Formex converter |
| 33 | Legal Document Import Protocol | NEVER manually create markdown |
| 34 | Citations Auto-Update | Registry hash invalidates caches |
| 34a | EUR-Lex HTML Import Workflow | For documents without Formex |
| 35 | Formex Document Structure Patterns | R/H/D type codes |
| 36 | Citation Display Text Preservation | Preserve exact legal text |
| 37 | EUR-Lex HTML CSS Class Reference | Parser development guide |
| 38 | HTML vs Formex Parser Selection | When to use which |
| 39 | Article Heading Format | Number only in heading, title as bold |
| 40 | Annex Point Format | List format required for gutter icons |
| 41 | Slug Format Convention | {year}-{number} format (DEC-083) |
| 42 | CSS Specificity Cascade | Check for accessibility overrides |
| 43 | EUR-Lex HTML Parser Gold Standard | 765/2008 as reference |
| 44 | Blockquote Spacing | Remove last paragraph margin |

---

## Reference Documentation

Extracted from AGENTS.md for subsystem-specific deep dives. Consult when working on the relevant feature area.

### Architecture

| Document | When to Read |
|----------|--------------|
| [Build Pipeline](../architecture/build-pipeline.md) | Build system changes, staleness bugs |
| [ARF Data Model](../architecture/arf-data-model.md) | ARF imports, version upgrades, HLR data |
| [VCQ Architecture](../architecture/vcq-architecture.md) | VCQ categories, schemas, export formats |
| [RCA Reference](../architecture/rca-reference.md) | RCA taxonomy, profiles, ETSI extraction |
| [Link Builder](../architecture/link-builder.md) | URL generation, deep links, EUR-Lex anchors |
| [RCA Role Architecture](../architecture/rca-role-architecture.md) | RCA role-based access patterns |

### Conventions

| Document | When to Read |
|----------|--------------|
| [Conversion Guidelines](../conventions/conversion-guidelines.md) | Document imports, Formex, CELEX formats |
| [Browser Testing](../conventions/browser-testing.md) | WSL browser_subagent, Chrome CDP, screenshots |
| [Build & Script Reference](../conventions/build-reference.md) | Terminology casing, embeddings, ESM/CJS scripts |

### Pitfalls

| Document | When to Read |
|----------|--------------|
| [Portal Gotchas](../pitfalls/portal-gotchas.md) | CSS debugging, search, popovers, regulation IDs |
| [Amendment Gaps](../pitfalls/amendment-gaps.md) | Missing amendments in consolidated texts |

---

## Finding Rules

**By topic:**
- React/JavaScript → Rules 11, 22-24 (development-rules.md)
- CSS/Styling → Rules 17, 25, 42, 44 (development & content rules)
- Legal documents → Rules 13, 19, 36 (both files)
- Import/Conversion → Rules 27-28, 32-35, 37-40 (content-rules.md)
- Build pipeline → Rules 5, 30, 34 (AGENTS.md & content-rules.md)
- Git/Workflow → Rules 4, 14, 29 (AGENTS.md & development-rules.md)

**By severity:**
- ⛔ ABSOLUTE (no exceptions) → Rule 1, Rule 19
- MANDATORY → Rules 2-14, 16-17, 20-23, 28-29, 33, 36
- REFERENCE → Rules 15, 18-19
- PITFALL (gotchas) → Rules 17, 20, 22, 26, 30-31, 42
