# AGENTS.md - eIDAS 2.0 Knowledge Base Project

## Project Context

This project is an **eIDAS 2.0 Knowledge Base** containing primary source documents for the European Digital Identity Framework. All regulatory documents are converted to Markdown for internal knowledge management and AI-assisted analysis.

## Project Structure

```
d:\aab\eIDAS20\
├── 01_regulation/                      # EU Regulations (parent laws)
│   ├── 910_2014_eIDAS_Consolidated/   # Consolidated eIDAS (as amended)
│   └── 2024_1183_eIDAS2_Amending/     # eIDAS 2.0 Amending Regulation
├── 02_implementing_acts/               # Commission Implementing Regulations (15 acts)
│   ├── 2024_2977_PID_and_EAA/         # Person identification data
│   ├── 2024_2978_TSP_List_Publication/# Trusted lists publication
│   ├── 2024_2979_Integrity_Core_Functions/
│   ├── 2024_2980_Notifications/
│   ├── 2024_2981_Certification/
│   ├── 2024_2982_Protocols_Interfaces/
│   ├── 2025_0847_Security_Breach_Response/
│   ├── 2025_0848_Relying_Party_Registration/
│   ├── 2025_0849_Certified_Wallet_List/
│   ├── 2025_1568_Peer_Reviews_eID/
│   ├── 2025_1944_Electronic_Delivery/
│   ├── 2025_1945_Signature_Validation/
│   ├── 2025_2160_Non_Qualified_TS_Risks/
│   ├── 2025_2162_CAB_Accreditation/
│   ├── 2025_2164_Trusted_Lists/       # Decision (not Regulation)
│   └── README.md                      # Implementing acts catalog
├── 03_arf/                            # Architecture Reference Framework (GitHub)
├── 04_technical_specs/                # Standards & Tech Specs (GitHub)
├── scripts/                           # Conversion & validation utilities
│   ├── eurlex_formex.py              # EUR-Lex Formex XML downloader
│   ├── formex_to_md_v3.py            # Formex XML → Markdown converter (v3)
│   ├── test_formex_converter.py      # Unit tests for converter
│   ├── md_linter.py                  # Markdown quality checker
│   └── add_headers.py                # Metadata header injection

├── AGENTS.md                          # This file (AI context)
├── README.md                          # Project overview
└── TRACKER.md                         # Work session tracker
```

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

