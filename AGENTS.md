# AGENTS.md - eIDAS 2.0 Knowledge Base Project

## Project Context

This project is an **eIDAS 2.0 Knowledge Base** containing primary source documents for the European Digital Identity Framework. All regulatory documents are converted to Markdown for internal knowledge management and AI-assisted analysis.

## ⚠️ Critical Rules (always enforce)

1. **Notification + Context Report:** At the END of every response:
   
   **Use the helper script** (combines context calculation + notification):
   ```bash
   ~/dev/eIDAS20/scripts/agent-done.sh <ctx_remaining> "[Gemini] Brief summary"
   ```
   
   - `<ctx_remaining>` = the `<ctx_window>` value from your MOST RECENT system feedback
   - Example: `<ctx_window>89133 tokens left</ctx_window>` → use `89133`
   
   **Example:**
   ```bash
   ~/dev/eIDAS20/scripts/agent-done.sh 89133 "[Gemini] Fixed the Amendment History bug"
   ```
   
   The script will:
   - Calculate context % using `bc` (LLMs make arithmetic errors with mental math)
   - Run `codex-notify` (Windows toast notification)
   - Output the context report (copy this to your response)
   
   **After running, include the script output:**
   ```
   📊 Context: XX% consumed
   ```
   
   **At 75%+**, the script also outputs:
   ```
   ⚠️ Context at XX% consumed — recommend /retro then /handover for clean session
   ```
   
   **Why 75%:** Research shows Claude quality degrades around 60-70% due to "lost in the middle" problem. 75% is a safe handoff point.
   
   **No other text or tool calls after the notification.**

2. **Auto-commit Protocol (MANDATORY):**
   - **Auto-commit IMMEDIATELY** after each logical increment that is tested and working
   - Use **conventional commit** format: `type: brief description`
   - Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`
   - **Bundle TRACKER.md updates in the SAME commit** as the change they document
     - ❌ WRONG: Commit change → Commit TRACKER update (creates noise)
     - ✅ CORRECT: Edit files + edit TRACKER.md → Single commit

3. **Clean Chrome Tabs Before browser_subagent (MANDATORY):**
   - **BEFORE calling `browser_subagent`**, clean up accumulated tabs:
     ```bash
     ~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh
     ```
   - **Why:** Each `browser_subagent` call creates a new tab. After 6+ tabs with SSE connections, the browser's per-origin connection limit is exhausted, causing failures.
   - **Anti-pattern:** Call browser_subagent 5 times → 5 tabs accumulate → SSE issues
   - **Correct pattern:** Clean tabs → call browser_subagent → clean tabs → call again

4. **UI/UX Proposals (MANDATORY — Visual Mockups FIRST):**
   
   **🚨 TRIGGER CONDITION: Whenever you present 2+ options for ANY visual/UI change, you MUST generate a mockup BEFORE the text explanation.**
   
   **Applies to:**
   - Layout changes (sidebar, header, footer)
   - Component designs (buttons, cards, popovers)
   - Content formatting (citations, lists, tables)
   - Navigation patterns
   - ANY change the user will SEE
   
   **Execution order:**
   1. **FIRST:** Call `generate_image` with ALL options in a SINGLE image
   2. **THEN:** Present the comparison table with pros/cons
   3. **THEN:** Give your recommendation
   4. **WAIT** for user selection before writing any code
   
   **Image requirements:**
   - ALL options in ONE image (A, B, C, D labeled clearly)
   - Dark theme to match portal aesthetic
   - Show realistic content, not lorem ipsum
   - Do NOT make multiple `generate_image` calls (rate limits ~60s)
   
   **Anti-patterns:**
   - ❌ "Here are 3 options..." (text-only table without image)
   - ❌ "I recommend Option A, let me implement it"
   - ❌ Generating mockup AFTER explaining options in text
   
   **Correct pattern:**
   - ✅ `generate_image` → Table with pros/cons → "Which option do you prefer?"
   
   **Why:** Text descriptions of UI are ambiguous. Users MUST see visual mockups to make informed decisions. A picture is worth a thousand words.

5. **Proactive Prevention Protocol (MANDATORY — After Any Bug Fix):**
   
   After fixing ANY bug or issue, you MUST:
   
   **Step 1: Root Cause Analysis**
   - What allowed this bug to exist?
   - What validation was missing?
   
   **Step 2: Implement Automated Prevention**
   Choose the appropriate prevention mechanism:
   
   | Issue Type | Prevention Mechanism |
   |------------|---------------------|
   | **Code logic bugs** | Unit test in `test_*.py` |
   | **Data/content issues** | Build-time validation in `build-*.js` |
   | **Format/structure issues** | Converter test case |
   | **Process issues** | Rule in AGENTS.md |
   | **Design decisions** | Document in DECISIONS.md |
   
   **Step 3: Verify Prevention Works**
   - Run the prevention mechanism
   - Confirm it would catch the original bug
   - Commit the prevention with the fix
   
   **Examples:**
   ```
   ✅ Missing annexes in documents
      → Added validateAnnexes() in build-content.js
      → Now warns during every build if annexes are missing
   
   ✅ Missing bullet prefixes in lists
      → Added TestListBulletPrefixes in test_formex_converter.py
      → Now fails tests if converter regresses
   
   ✅ Duplicate ANNEX headings
      → Fixed converter logic + added to DECISIONS.md
      → Root cause documented for future reference
   ```
   
   **Anti-patterns:**
   - ❌ "Fixed the bug" → close without prevention
   - ❌ "Added a TODO to check this later"
   - ❌ Manual verification only ("I checked and it works")
   
   **Why this matters:** Bugs that can happen once can happen again. Automated prevention catches issues before they reach users, reduces debugging time, and builds institutional knowledge into the codebase.

6. **Route Path Verification (When Generating URLs):**
   
   Before generating any portal URL (deep links, navigation, etc.):
   
   1. **Check `App.jsx`** or router config for exact route paths
   2. **Verify singular vs plural** — e.g., `/regulation/` not `/regulations/`
   3. **Test the generated URL** in browser
   
   **Example from DEC-011:**
   ```
   ❌ WRONG: /#/regulations/910-2014?section=article-5a
   ✅ CORRECT: /#/regulation/910-2014?section=article-5a (singular)
   ```
   
   **Why:** Route typos cause 404s and are easy to miss in code review.

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
│   ├── cleanup-chrome-tabs.sh        # Clean stale browser tabs
│   └── agent-done.sh                 # End-of-response notification + context
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

### 🚨 MANDATORY: Converter-First Rule (Rule 70)

**When a formatting issue is detected in generated Markdown:**

1. **NEVER edit the `.md` file directly** — it will be overwritten when regenerated
2. **ALWAYS fix the root cause in the converter** (`formex_to_md_v3.py`)
3. **ALWAYS add or improve a test case** in `test_formex_converter.py`

**Why this matters:**
- Generated markdown files (`01_regulation/`, `02_implementing_acts/`) are **outputs**, not sources
- Running the converter again will **overwrite any manual fixes**
- Test cases prevent **regression** when the converter is modified

**This applies to:**
- ✅ Bug fixes (e.g., missing bullet prefixes, date extraction)
- ✅ New features (e.g., FORMAT008 rule for HRs before headers)
- ✅ Behavioral changes (e.g., removing `---` before headers)
- ✅ Edge cases discovered during conversion or portal rendering

**Rationale**: Post-processing scripts are fragile, document-specific workarounds. Fixing issues at the source ensures:
- All documents benefit from the fix
- Regressions are caught by tests
- The conversion pipeline remains maintainable

**Example - Missing Bullet Prefix (actual bug fixed 2026-01-14):**
```
# WRONG: Edit the markdown file
sed -i 's/^(b) /- (b) /' 01_regulation/910_2014.../02014R0910.md

# CORRECT: Fix the converter AND add test
# 1. Fix formex_to_md_v3.py process_list_simple() to add '- ' prefix
# 2. Add TestListBulletPrefixes in test_formex_converter.py
# 3. Regenerate the markdown with npm run build:content
```

**Running tests:**
```bash
python3 scripts/test_formex_converter.py
```

**Current test count**: 42 tests (as of 2026-01-14)

## 📋 Design Decisions

See **[DECISIONS.md](DECISIONS.md)** for architectural and UX decisions, including:
- DEC-001: Single-page terminology glossary
- DEC-002: Strip front matter from rendered content
- DEC-003: Blockquote formatting for amendments
- DEC-004: Hide hamburger menu on desktop

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

