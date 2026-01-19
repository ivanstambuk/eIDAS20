# AGENTS.md - eIDAS 2.0 Knowledge Base Project

## Project Context

This project is an **eIDAS 2.0 Knowledge Base** containing primary source documents for the European Digital Identity Framework. All regulatory documents are converted to Markdown for internal knowledge management and AI-assisted analysis.

---

## Quick Reference

| Topic | Documentation |
|-------|---------------|
| **Development Rules (11-25)** | [.agent/docs/rules/development-rules.md](.agent/docs/rules/development-rules.md) |
| **Content Rules (26-44)** | [.agent/docs/rules/content-rules.md](.agent/docs/rules/content-rules.md) |
| **Rules Index** | [.agent/docs/rules/README.md](.agent/docs/rules/README.md) |
| **Build Pipeline** | [.agent/docs/architecture/build-pipeline.md](.agent/docs/architecture/build-pipeline.md) |
| **Terminology** | [TERMINOLOGY.md](TERMINOLOGY.md) |
| **Design Decisions** | [DECISIONS.md](DECISIONS.md) |
| **Work Tracker** | [TRACKER.md](TRACKER.md) |

---

## ⚠️ Critical Rules (1-10) — Always Enforce

These rules are session-critical and must remain in the main AGENTS.md file.

### 1. Notification + Context Report

At the END of every response:

**Use the helper script** (combines context calculation + notification):
```bash
~/dev/eIDAS20/scripts/agent-done.sh <ctx_remaining> "[Gemini] Brief summary"
```

- `<ctx_remaining>` = the `<ctx_window>` value from your MOST RECENT system feedback
- Example: `<ctx_window>89133 tokens left</ctx_window>` → use `89133`
- ⚠️ **NEVER hardcode or reuse a previous value** — always read fresh from the last XML response

**After running, include the script output:**
```
📊 Context: XX% consumed
```

**At 75%+**, the script also outputs:
```
⚠️ Context at XX% consumed — recommend /retro then /handover for clean session
```

**Why 75%:** Research shows LLM quality degrades around 60-70% due to "lost in the middle" problem. 75% is a safe handoff point.

**No other text or tool calls after the notification.**

---

### 2. Auto-commit Protocol (MANDATORY)

- **Auto-commit IMMEDIATELY** after each logical increment that is tested and working
- Use **conventional commit** format: `type: brief description`
- Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`
- **Bundle TRACKER.md updates in the SAME commit** as the change they document
  - ❌ WRONG: Commit change → Commit TRACKER update (creates noise)
  - ✅ CORRECT: Edit files + edit TRACKER.md → Single commit

---

### 3. Clean Chrome Tabs Before browser_subagent (MANDATORY)

**BEFORE calling `browser_subagent`**, clean up accumulated tabs:
```bash
~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh
```

**Why:** Each `browser_subagent` call creates a new tab. After 6+ tabs with SSE connections, the browser's per-origin connection limit is exhausted, causing failures.

**Anti-pattern:** Call browser_subagent 5 times → 5 tabs accumulate → SSE issues
**Correct pattern:** Clean tabs → call browser_subagent → clean tabs → call again

---

### 4. UI/UX Proposals (MANDATORY — Visual Mockups FIRST)

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

**Why:** Text descriptions of UI are ambiguous. Users MUST see visual mockups to make informed decisions.

---

### 5. Proactive Prevention Protocol (MANDATORY — After Any Bug Fix)

After fixing ANY bug or issue, you MUST:

**Step 1: Root Cause Analysis**
- What allowed this bug to exist?
- What validation was missing?

**Step 2: Implement Automated Prevention**

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

**Step 4: Defense in Depth (for Build Pipelines)**

When the bug involves a **build pipeline**:
1. Validate at the source
2. Validate at consumers
3. Add staleness detection
4. Verify build chain

**See:** [Build Pipeline Architecture](.agent/docs/architecture/build-pipeline.md) for full details.

**Anti-patterns:**
- ❌ "Fixed the bug" → close without prevention
- ❌ "Added a TODO to check this later"
- ❌ Manual verification only

---

### 6. Route Path Verification (When Generating URLs)

Before generating any portal URL (deep links, navigation, etc.):

1. **Check `App.jsx`** or router config for exact route paths
2. **Verify singular vs plural** — e.g., `/regulation/` not `/regulations/`
3. **Test the generated URL** in browser

**Example:**
```
❌ WRONG: /#/regulations/910-2014?section=article-5a
✅ CORRECT: /#/regulation/910-2014?section=article-5a (singular)
```

---

### 7. Systematic Solutions Only (MANDATORY — No Workarounds)

When fixing any issue, follow this hierarchy:

**Fix at the SOURCE, not downstream:**

| Problem Location | Fix Location |
|------------------|--------------|
| **Data generation** (converter, build script) | Fix the generator |
| **Data structure** (Formex → MD → HTML) | Fix earliest stage possible |
| **UI rendering** (React component) | Fix the component, not CSS hacks |
| **Multiple layers affected** | Fix the root cause, then simplify downstream |

**After applying a systematic fix:**
1. Reconvert/rebuild ALL affected data
2. Remove ALL workarounds that the systematic fix replaces
3. Simplify downstream code that was compensating

**Anti-patterns:**
- ❌ "Fixed the converter but keeping the JS workaround just in case"
- ❌ "Applied the fix to one document, will do others later"

---

### 8. Infinite Time Principle (MANDATORY)

**Never consider time constraints, context limits, or tokens when making technical decisions.**

- Work as if you have **infinite time** to complete tasks
- Do NOT let context window consumption affect solution quality
- Do NOT take shortcuts due to perceived time pressure
- Do NOT mention "given time constraints" as justification

**Anti-patterns:**
- ❌ "Given the time constraints, let me take a pragmatic approach..."
- ❌ "Since context is running low, I'll simplify..."
- ❌ "To save time, let's skip the full validation..."

---

### 9. AGENTS.md Requires Explicit Approval (MANDATORY)

**Never modify AGENTS.md without the user's explicit consent.**

- If you believe a rule should be added or changed, **propose it first**
- Wait for explicit approval before making any changes
- This applies to ALL modifications: additions, deletions, and edits

**Correct pattern:**
```
"I recommend adding a rule about X. Would you like me to add this to AGENTS.md?"
[Wait for user approval]
[Only then make the change]
```

---

### 10. Clarify Before Acting (MANDATORY — When User Asks Questions)

**When the user asks for your OPINION or asks a QUESTION about something, ANSWER first before taking any action.**

**Trigger phrases:**
- "Does X look OK to you?"
- "Is this a UX pattern?"
- "What do you think about...?"
- "Should we...?"
- Any question-form request

**Correct pattern:**
1. **FIRST:** Answer the question directly
2. **THEN:** Ask if they want you to make changes
3. **WAIT:** Only proceed after explicit confirmation

**Anti-patterns:**
- ❌ User asks "Does the header look OK?" → Immediately edit CSS
- ❌ User asks "Is this a pattern?" → Start implementing changes
- ❌ Interpreting a question as an implicit request to fix

---

### 11. Recommendations Required (MANDATORY — When Asking Clarifying Questions)

**When asking the user clarifying questions, you MUST include your recommended answer with justification.**

The user should never need to ask "why?" as a follow-up. Provide complete reasoning upfront.

**Correct pattern:**
```
**Question 3a:** Should we match plural forms?
- **Recommendation:** Yes
- **Justification:** Legal documents naturally use both "electronic signature" and 
  "electronic signatures". Users expect both to link to the same definition. 
  Implementing plural matching is straightforward (add 's'/'es' variants to regex).
```

**Anti-patterns:**
- ❌ "Should we match plurals?" (no recommendation)
- ❌ "I recommend yes." (no justification)
- ❌ Deferring entirely: "What do you think?" without stating your position

**Why this matters:** The user hired you for expertise. Forcing them to make decisions without your input wastes their time and produces worse outcomes.

---

## Project Structure

```
~/dev/eIDAS20/
├── 01_regulation/                      # EU Regulations (parent laws)
│   ├── 2014_910_eIDAS_Consolidated/    # Consolidated eIDAS (as amended)
│   └── 2024_1183_eIDAS2_Amending/      # eIDAS 2.0 Amending Regulation
├── 02_implementing_acts/               # Commission Implementing Regulations (30 acts)
├── 03_arf/                             # Architecture Reference Framework (GitHub)
├── 04_technical_specs/                 # Standards & Tech Specs (GitHub)
├── docs-portal/                        # 🌐 Documentation Portal (Vite + React)
│   ├── src/                            # React components and pages
│   ├── public/                         # Static assets
│   ├── scripts/                        # Build-time Node.js scripts
│   └── package.json
├── scripts/                            # Conversion & validation utilities
│   ├── eurlex_formex.py                # EUR-Lex Formex XML downloader
│   ├── formex_to_md_v3.py              # Formex XML → Markdown converter (v3)
│   ├── eurlex_html_to_md.py            # EUR-Lex HTML → Markdown converter
│   ├── pipeline.py                     # Unified import pipeline
│   ├── test_formex_converter.py        # Unit tests for converter
│   ├── documents.yaml                  # Document registry (SSOT)
│   ├── restart-chrome.sh               # Start Chrome with CDP (WSL → Windows)
│   ├── cleanup-chrome-tabs.sh          # Clean stale browser tabs
│   └── agent-done.sh                   # End-of-response notification + context
├── .agent/                             # Agent configuration
│   ├── docs/                           # 📚 Extended documentation
│   │   ├── rules/                      # Development & content rules
│   │   └── architecture/               # Technical architecture docs
│   ├── workflows/                      # Human-invoked workflows
│   ├── snippets/                       # Reusable code patterns
│   └── session/                        # Session state
├── AGENTS.md                           # This file (AI context)
├── TERMINOLOGY.md                      # Project vocabulary
├── DECISIONS.md                        # Design decisions log
├── TRACKER.md                          # Work session tracker
└── README.md                           # Project overview
```

---

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

---

## 🖥️ WSL Browser Testing

For visual UI validation using `browser_subagent` from WSL.

### Port Reference

| Port | Service |
|------|---------|
| **5173** | Vite dev server (docs-portal) |
| **9222** | Chrome CDP (remote debugging) |

### Prerequisites

1. **WSL networking**: `.wslconfig` must have `networkingMode=mirrored`
2. **Chrome with CDP**: Must be running with remote debugging on port 9222

### Browser Testing Checklist (MANDATORY before browser_subagent)

**Step 1: Clean Up Tabs (REQUIRED)**
```bash
~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh
```

**Step 2: Verify Chrome is Accessible**
```bash
curl -s http://localhost:9222/json/version | head -1
```
If not running: `~/dev/eIDAS20/scripts/restart-chrome.sh`

**Step 3: Ensure Dev Server is Running**
```bash
curl -s http://localhost:5173/eIDAS20/ > /dev/null && echo "✅ Dev server running" || echo "❌ Start with: cd ~/dev/eIDAS20/docs-portal && npm run dev"
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Chrome not accessible | `~/dev/eIDAS20/scripts/restart-chrome.sh` |
| Too many tabs / SSE issues | `~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh` |
| Wrong port errors | Portal uses **5173**, Chrome uses **9222** |

---

## Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `/init` | Start of session | Prime agent with project context |
| `/handover` | End of session | Generate handover summary |
| `/retro` | After milestones | Run structured retrospective |
| `/rca-audit` | RCA work | Audit legal docs for role-specific requirements |

See `.agent/workflows/` for detailed instructions.

---

## Conversion Guidelines

### 🚨 MANDATORY: Converter-First Rule + TDD Workflow

**When a formatting issue is detected in generated Markdown:**

1. **NEVER edit the `.md` file directly** — it will be overwritten when regenerated
2. **ALWAYS fix the root cause in the converter** (`formex_to_md_v3.py` or `eurlex_html_to_md.py`)
3. **ALWAYS add or improve a test case** in `test_formex_converter.py`

**Why this matters:**
- Generated markdown files are **outputs**, not sources
- Running the converter again will **overwrite any manual fixes**
- Test cases prevent **regression** when the converter is modified

**See:** [Content Rules 33-38](.agent/docs/rules/content-rules.md) for full import protocols.

### ⚠️ Check Source Field Before Debugging Converters

**BEFORE touching any converter code**, check which converter is actually used:

```bash
grep -A2 "celex: <CELEX_NUMBER>" scripts/documents.yaml
```

The `source:` field tells you which converter generates the document:
- `source: formex` → `formex_to_md_v3.py` (most documents)
- `source: html` → `eurlex_html_to_md.py` (older documents without Formex)
- `source: manual` → No converter, manually maintained

**Anti-pattern:**
- ❌ See issue in Markdown → Check EUR-Lex HTML → Modify HTML converter → Discover document uses Formex

**Correct pattern:**
- ✅ Check `documents.yaml` source field FIRST → Modify correct converter

### Formex Multi-Part Document Handling

When importing EUR-Lex documents via `eurlex_formex.py`, the script handles multi-part Formex ZIP archives:

**File Naming Convention:**
| Pattern | Description |
|---------|-------------|
| `L_XXXXXXEN.000101.fmx.xml` | Main document (preamble, recitals, articles) |
| `L_XXXXXXEN.000[2-9]XX.fmx.xml` | Annexes (tables, appendices) |

**Processing Logic:**
1. **Main document detection:** The script explicitly identifies `.000101.fmx.xml` as the main body
2. **Annex merging:** Files matching `.000[2-9]\d{2}\.` are merged into the main document's Markdown
3. **Metadata injection:** CELEX header is auto-generated for proper portal badge display

**Anti-patterns:**
- ❌ Manually running `formex_to_md_v3.py` on individual annex files
- ❌ Assuming the last `.000` file is the main document

**Correct pattern:**
- ✅ Use `eurlex_formex.py` which handles multi-part merging automatically
- ✅ Let the script select `.000101` as main and merge higher-numbered files as annexes

---

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
| **Role Profile** | Sub-selection within an RCA role (e.g., Public/Private Sector for RP) |

**See:** [TERMINOLOGY.md](TERMINOLOGY.md) for full vocabulary.

---

## Git Workflow

Uses **conventional commits**:
- `feat:` - New document added
- `fix:` - Corrections to content/formatting
- `docs:` - Documentation updates
- `chore:` - Maintenance tasks

---

*Last updated: 2026-01-19*
