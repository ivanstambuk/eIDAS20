# Rules Index

Quick reference for all rules in the eIDAS Documentation Portal project.

## Critical Rules (1-10)

**Location:** Main `AGENTS.md` file (always visible)

| # | Rule | Summary |
|---|------|---------|
| 1 | Notification + Context Report | Run `agent-done.sh` at END of every response |
| 2 | Auto-commit Protocol | Commit IMMEDIATELY after each logical increment |
| 3 | Clean Chrome Tabs | Run `cleanup-chrome-tabs.sh` BEFORE browser_subagent |
| 4 | UI/UX Proposals | Generate visual mockups BEFORE proposing options |
| 5 | Proactive Prevention Protocol | Add tests/validation after EVERY bug fix |
| 6 | Route Path Verification | Check App.jsx for exact paths, verify singular vs plural |
| 7 | Systematic Solutions Only | Fix at SOURCE, not downstream workarounds |
| 8 | Infinite Time Principle | Never let context/time pressure affect quality |
| 9 | AGENTS.md Requires Approval | Never modify without explicit user consent |
| 10 | Clarify Before Acting | Answer questions before taking action |

---

## Development Rules (11-25)

**Location:** [development-rules.md](development-rules.md)

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

## Finding Rules

**By topic:**
- React/JavaScript → Rules 11, 22-24 (development-rules.md)
- CSS/Styling → Rules 17, 25, 42, 44 (development & content rules)
- Legal documents → Rules 13, 19, 36 (both files)
- Import/Conversion → Rules 27-28, 32-35, 37-40 (content-rules.md)
- Build pipeline → Rules 5, 30, 34 (AGENTS.md & content-rules.md)
- Git/Workflow → Rules 2, 14, 29 (AGENTS.md & development-rules.md)

**By severity:**
- ⛔ ABSOLUTE (no exceptions) → Rule 19
- MANDATORY → Rules 1-10, 12-16, 28-29, 33, 36
- PITFALL (gotchas) → Rules 17, 20, 22, 26, 30-31, 42
