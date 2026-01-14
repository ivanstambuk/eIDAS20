# AGENTS.md - eIDAS 2.0 Knowledge Base Project

## Project Context

This project is an **eIDAS 2.0 Knowledge Base** containing primary source documents for the European Digital Identity Framework. All regulatory documents are converted to Markdown for internal knowledge management and AI-assisted analysis.

## Project Structure

```
~/dev/eIDAS20/
├── 01_regulation/                      # EU Regulations (parent laws)
│   ├── 910_2014_eIDAS_Consolidated/   # Consolidated eIDAS (as amended)
│   └── 2024_1183_eIDAS2_Amending/     # eIDAS 2.0 Amending Regulation
├── 02_implementing_acts/               # Commission Implementing Regulations (30 acts)
│   └── ...                            # See TRACKER.md for full list
├── 03_arf/                            # Architecture Reference Framework (GitHub)
├── 04_technical_specs/                # Standards & Tech Specs (GitHub)
├── docs-portal/                       # 🌐 Documentation Portal (Vite + React)
│   ├── src/                           # React components and pages
│   ├── public/                        # Static assets
│   ├── scripts/                       # Build-time Node.js scripts
│   └── package.json
├── scripts/                           # Conversion & validation utilities
│   ├── eurlex_formex.py              # EUR-Lex Formex XML downloader
│   ├── formex_to_md_v3.py            # Formex XML → Markdown converter (v3)
│   ├── test_formex_converter.py      # Unit tests for converter
│   ├── md_linter.py                  # Markdown quality checker
│   ├── restart-chrome.sh             # Start Chrome with CDP (WSL → Windows)
│   └── cleanup-chrome-tabs.sh        # Clean stale browser tabs
├── .agent/workflows/                  # Agent workflows
│   └── browser-testing.md            # Visual UI validation workflow
├── AGENTS.md                          # This file (AI context)
├── README.md                          # Project overview
└── TRACKER.md                         # Work session tracker
```

## 🌐 Documentation Portal

The `docs-portal/` is a **100% client-side static site** for eIDAS 2.0 documentation.

| Attribute | Value |
|-----------|-------|
| **Framework** | Vite + React |
| **Dev URL** | http://localhost:5173/eIDAS20/ |
| **Hosting** | GitHub Pages (planned) |

### Running the Portal

```bash
cd ~/dev/eIDAS20/docs-portal
npm run dev
# Opens at http://localhost:5173/eIDAS20/
```

## 🖥️ WSL Browser Testing

For visual UI validation using `browser_subagent` from WSL:

### Port Reference

| Port | Service |
|------|---------|
| **5173** | Vite dev server (docs-portal) |
| **9222** | Chrome CDP (remote debugging) |

### Start Chrome with Remote Debugging

```bash
~/dev/eIDAS20/scripts/restart-chrome.sh
```

This starts Chrome on Windows with:
- Remote debugging on port 9222
- Isolated profile (`ag-cdp`) — doesn't affect regular Chrome
- `about:blank` tab ready for testing

### Verify Chrome is Accessible

```bash
curl -s http://localhost:9222/json/version | head -1
```

### Clean Up Stale Tabs

After multiple `browser_subagent` calls, clean accumulated tabs:

```bash
~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh
```

**Why:** Each browser_subagent call creates a new tab. After 6+ tabs, Chrome's per-origin connection limit can cause failures.

### Prerequisites

1. **WSL networking**: `.wslconfig` must have `networkingMode=mirrored`
2. **Workflow**: See `.agent/workflows/browser-testing.md` for full workflow

## Current Status (2026-01-13)

### ✅ Completed
- **17 regulatory documents** downloaded, converted to Markdown, and validated
- **Formex XML v2 pipeline** - highest quality conversion preserving legal structure
- **Linter validation** - all documents pass with 0 errors/warnings
- **Git repository** initialized with conventional commits

### Document Inventory

| Category | Count | Status |
|----------|-------|--------|
| Core Regulations | 2 | ✅ Complete |
| Implementing Acts (Dec 2024) | 6 | ✅ Complete |
| Implementing Acts (May 2025) | 3 | ✅ Complete |
| Implementing Acts (Jul-Sep 2025) | 3 | ✅ Complete |
| Implementing Acts (Oct 2025) | 3 | ✅ Complete |

## Document Sources

| Source | URL Pattern | Format |
|--------|-------------|--------|
| EUR-Lex Formex (preferred) | `https://eur-lex.europa.eu/legal-content/EN/TXT/XML/?uri=CELEX:{CELEX}` | XML |
| EUR-Lex HTML (fallback) | `https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:{CELEX}` | HTML |
| GitHub ARF | `eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework` | Markdown |
| GitHub STS | `eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications` | Markdown |

## Conversion Guidelines

### Preferred: Formex XML Pipeline
```bash
python scripts/eurlex_formex.py {CELEX} {output_dir}
```
- Uses structured XML for highest fidelity
- Preserves recitals, articles, numbered paragraphs, nested lists
- Inline footnotes and cross-references

### Fallback: HTML via Pandoc
```bash
curl -s -o file.html "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:{CELEX}"
pandoc -f html -t markdown --wrap=none -o file.md file.html
```

### Validation
```bash
python scripts/md_linter.py --dir 01_regulation
python scripts/md_linter.py --dir 02_implementing_acts
```

### 🚨 MANDATORY: Test-Driven Development Rule (Rule 70)

**Every change to the conversion script (`formex_to_md_v3.py`) or linter (`md_linter.py`) MUST be:**
1. **Fixed in the source script** - NOT via post-processing workarounds
2. **Accompanied by a unit test** in `test_formex_converter.py` that reproduces and verifies the change

This applies to:
- ✅ Bug fixes (e.g., date extraction, duplicate content)
- ✅ New features (e.g., FORMAT008 rule for HRs before headers)
- ✅ Behavioral changes (e.g., removing `---` before headers)
- ✅ Edge cases discovered during conversion

**Rationale**: Post-processing scripts are fragile, document-specific workarounds. Fixing issues at the source ensures:
- All documents benefit from the fix
- Regressions are caught by tests
- The conversion pipeline remains maintainable

**Example - Bug Fix**:
If a date like "21 May 2026" is being truncated:
- ✅ DO: Find the bug in `formex_to_md_v3.py`, fix it, add a test
- ❌ DON'T: Write a post-processing script to patch the output

**Example - New Rule**:
If adding a new linter rule (e.g., FORMAT008):
- ✅ DO: Add the rule to `md_linter.py`, add tests for detection and edge cases
- ✅ DO: Update the converter if it generates the flagged pattern, add tests

**Running tests**:
```bash
python scripts/test_formex_converter.py
```

**Current test count**: 28 tests (as of 2026-01-13)

## 📋 Portal Content Processing Decisions

### Decision: Strip Metadata Blockquotes (2026-01-14)

**Context**: All markdown source files contain a metadata blockquote at the top:
```markdown
> **CELEX:** 32024R2977 | **Document:** Commission Implementing Regulation
>
> **Source:** https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2977
```

**Decision**: Strip this blockquote from rendered portal content.

**Rationale**:
1. **Redundant** — The UI already displays CELEX badge, date, and "View on EUR-Lex" link in the header
2. **Visual clutter** — Raw technical metadata breaks the premium design aesthetic
3. **Preserved at source** — Original markdown files retain the metadata for archival/traceability

**Implementation**: `docs-portal/scripts/build-content.js` → `stripMetadataBlockquote()` function

**Applies to**: All 32 regulatory documents (2 regulations + 30 implementing acts)

## Markdown Formatting Rules

For amending regulations and legal documents with hierarchical amendments:

1. **Blockquote Rule for Amendments**: 
   - **Instruction text** (e.g., "(a) paragraph 1 is replaced by the following:") → **NO blockquote** (normal text)
   - **Actual replacement content** (e.g., "'1. This Regulation applies to...") → **IS blockquote** (indented with `>`)
   
   Example:
   ```markdown
   **(1)** Article 1 is replaced by the following:
   
   (a) paragraph 1 is replaced by the following:
   > '1. This Regulation applies to electronic identification schemes...';
   
   (b) paragraph 3 is replaced by the following:
   > '3. This Regulation does not affect Union or national law...';
   ```

2. **Nested Content**: Use double blockquotes (`>>`) for content nested within blockquoted sections (e.g., sub-points within a replaced article).

## Key Terminology

| Term | Meaning |
|------|---------|
| **eIDAS** | electronic IDentification, Authentication and trust Services |
| **EUDI Wallet** | European Digital Identity Wallet |
| **CIR** | Commission Implementing Regulation |
| **ARF** | Architecture and Reference Framework |
| **PID** | Person Identification Data |
| **EAA** | Electronic Attestation of Attributes |
| **QEAA** | Qualified Electronic Attestation of Attributes |
| **TSP/QTSP** | (Qualified) Trust Service Provider |
| **WSCA/WSCD** | Wallet Secure Cryptographic Application/Device |

## Git Workflow

Uses **conventional commits**:
- `feat:` - New document added
- `fix:` - Corrections to content/formatting
- `docs:` - Documentation updates
- `chore:` - Maintenance tasks

---

*Last updated: 2026-01-13 18:57 CET*

