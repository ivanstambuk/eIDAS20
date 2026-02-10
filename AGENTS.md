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

## ⚠️ Critical Rules (1-11) — Always Enforce

These rules are session-critical and must remain in the main AGENTS.md file.

### 1. Infinite Time Principle (ABSOLUTE — THE MOST IMPORTANT RULE)

**You have INFINITE time. Never downscope, eliminate, or take shortcuts due to time, context, or token considerations.**

This is NON-NEGOTIABLE. Violations of this rule are UNACCEPTABLE.

- Work as if you have **unlimited time** to complete every task perfectly
- Context window consumption does NOT affect solution quality or scope
- Token usage is NEVER a reason to reduce thoroughness
- "Time constraints" do NOT exist — never mention them as justification
- Every task deserves COMPLETE, THOROUGH execution — no exceptions
- If a task requires reviewing 100 documents, review ALL 100 documents
- If a task requires extracting 500 requirements, extract ALL 500 requirements

**FORBIDDEN phrases (using any of these is a VIOLATION):**
- ❌ "Given time constraints..."
- ❌ "Given the scope..."
- ❌ "Since context is running low..."
- ❌ "To save time..."
- ❌ "For efficiency..."
- ❌ "In the interest of time..."
- ❌ "Due to the magnitude of this task..."
- ❌ "Let me process this in batches to be efficient..."

**Why this is Rule 1:** Time and resource pressure causes shortcuts. Shortcuts cause incomplete work. Incomplete work is ALWAYS worse than thorough work that takes longer. The user explicitly forbids any consideration of time or resources when deciding how to complete work.

---

### 2. Notification + Context Report (EXECUTE — Not Display)

At the END of every response, **EXECUTE this script using `run_command`**:

```
~/dev/eIDAS20/scripts/agent-done.sh <ctx_remaining> "[Gemini] Brief summary"
```

**⚠️ You must INVOKE `run_command` to execute this script. Do NOT just display this in a markdown code block.**

**Parameters:**
- `<ctx_remaining>` = the number from the MOST RECENT `<ctx_window>X tokens left</ctx_window>` system feedback
- Example: `<ctx_window>89133 tokens left</ctx_window>` → use `89133`
- ⚠️ **NEVER hardcode or reuse a previous value** — always read fresh from the last XML response

**After execution, the script outputs:**
- `📊 Context: XX% consumed` — include this in your response
- At 75%+: `⚠️ Context at XX% consumed — recommend /retro then /handover`

**Why 75%:** Research shows LLM quality degrades around 60-70% due to "lost in the middle" problem. 75% is a safe handoff point.

**No other text or tool calls after the notification.**

---

### 3. Auto-commit Protocol (MANDATORY)

- **Auto-commit IMMEDIATELY** after each logical increment that is tested and working
- **Do NOT batch commits** — each completed feature/fix gets its own commit
- Use **conventional commit** format: `type: brief description`
- Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`
- **Bundle TRACKER.md updates in the SAME commit** as the change they document
  - ❌ WRONG: Commit change → Commit TRACKER update (creates noise)
  - ✅ CORRECT: Edit files + edit TRACKER.md → Single commit

**Commit checkpoints:**
- ✅ Fixed a bug → Commit
- ✅ Added a feature → Commit
- ✅ Created a script → Commit
- ✅ Updated documentation → Commit
- ❌ Waiting to finish "all the work" → Anti-pattern

---

### 4. Clean Chrome Tabs Before browser_subagent (MANDATORY)

**BEFORE calling `browser_subagent`**, clean up accumulated tabs:
```bash
~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh
```

**Why:** Each `browser_subagent` call creates a new tab. After 6+ tabs with SSE connections, the browser's per-origin connection limit is exhausted, causing failures.

**Anti-pattern:** Call browser_subagent 5 times → 5 tabs accumulate → SSE issues
**Correct pattern:** Clean tabs → call browser_subagent → clean tabs → call again

---

### 5. UI/UX Proposals (MANDATORY — Visual Mockups FIRST)

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

**UX Design Checklist:** Before generating mockups, run through `.agent/workflows/ux-design.md` to avoid iteration.

**Component Architecture Rule:** Section headings belong in parent containers, NOT inside child components. If a heading describes content from multiple sibling components, it should render BEFORE those siblings in the parent.

---

### 6. Proactive Prevention Protocol (MANDATORY — After Any Bug Fix)

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

### 7. Route Path Verification (When Generating URLs)

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

### 8. Systematic Solutions Only (MANDATORY — No Workarounds)

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

**When removing a React component:**
1. Delete the component file/function
2. **Run `grep -r "ComponentName" src/`** to find all usages
3. Remove all imports, JSX usage, and related state/handlers
4. Verify build succeeds before committing

**Anti-patterns:**
- ❌ "Fixed the converter but keeping the JS workaround just in case"
- ❌ "Applied the fix to one document, will do others later"
- ❌ Deleting a component without grepping for orphan references

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

### 12. Plans to Files, Not Chat (MANDATORY)

**NEVER write detailed implementation plans directly in chat. Always write them to a file.**

**When asked to create a plan:**
1. Write the plan to `.agent/session/plan-{descriptive-name}.md`
2. In chat, provide ONLY:
   - Brief 1-2 sentence summary
   - Link/path to the plan file
   - Ask if user wants to proceed

**Why:** Detailed plans in chat waste context window, are hard to reference later, and cannot be versioned or updated. Plans in files can be reviewed, modified, and tracked.

**Anti-patterns:**
- ❌ Writing 50+ line plans directly in chat
- ❌ Dumping tables, phase breakdowns, and execution steps in messages
- ❌ "Here's my comprehensive plan: [wall of text]"

**Correct pattern:**
- ✅ Write plan to `.agent/session/plan-id-renumbering.md`
- ✅ Chat: "I've written a comprehensive plan to `.agent/session/plan-id-renumbering.md`. Ready to proceed?"

---

### 13. Confirm Feature UX Before Building (MANDATORY)

**Before implementing any significant new UI feature, confirm the desired behavior with the user.**

**Trigger:** When you're about to add a new user-visible feature (not fixing bugs or refactoring):
1. **Describe** the proposed behavior in 1-2 sentences
2. **Ask** if this is what the user wants
3. **Wait** for confirmation before writing code

**Why this matters:** Complex features can take 30+ minutes to build. If the UX isn't what the user wanted, that time is wasted (and reverting creates git noise).

**Examples requiring confirmation:**
- Adding visual effects (highlighting, animations)
- New keyboard shortcuts
- Changing navigation behavior
- Adding new UI sections or panels

**Examples NOT requiring confirmation:**
- Fixing bugs
- Refactoring existing code
- Following explicit user instructions

**Anti-patterns:**
- ❌ "I'll add search term highlighting to make it easier to find matches" → builds feature → user says "remove it"
- ❌ Assuming what the user wants based on partial context

**Correct pattern:**
- ✅ "Should I highlight the search term on the destination page when clicking search results? This would add yellow markers around matching text."
- ✅ [Wait for yes/no before implementing]

---

### 14. Verify Terminology Before Creating (MANDATORY — Before New Terms)

**Before creating ANY new role, entity type, or acronym for use in documentation or code, verify it exists in official sources.**

**This applies when:**
- Creating new YAML ID prefixes (e.g., `VEND-PIF-*`)
- Adding new role/entity terminology to TERMINOLOGY.md
- Designing features around specific actor types

**Required verification steps:**
1. **Web search** the proposed term + "eIDAS" or "ARF" or "EUDIW"
2. **Check ARF** Topic headings and HLR IDs
3. **Check implementing acts** for official role definitions

**If term doesn't exist officially:**
- ❌ DO NOT invent official-sounding acronyms
- ✅ Use descriptive names and mark as "portal convention" in TERMINOLOGY.md

**Why this matters:** DEC-254 required refactoring because "PIF" and "VIF" were invented terms that sounded official but weren't. The ARF uses "RP Intermediary" without the PIF/VIF split.

**Anti-patterns:**
- ❌ "I'll call this a Presentation Intermediary Function (PIF)" → creates ID prefix → later discovered term doesn't exist
- ❌ Assuming a logical decomposition exists in official sources

**Correct pattern:**
- ✅ Web search "presentation intermediary eIDAS" → no results → use official term "RP Intermediary"

---

### 15. Terminology Source Citation (MANDATORY — When Adding to TERMINOLOGY.md)

**Every term added to TERMINOLOGY.md MUST include its source OR be explicitly marked as a portal convention.**

**Format for official terms:**
```markdown
| **Term** | Description... Defined in **Article X** of Regulation Y. |
```

**Format for portal conventions:**
```markdown
| **Term** | ⚙️ *Portal convention*. Description... |
```

**Why this matters:** Terms without sources can spread as if they're official when they're not. DEC-254 revealed that PIF/VIF were portal inventions mistakenly treated as official terminology.

**Anti-patterns:**
- ❌ Adding a term without any source citation
- ❌ Implying a term is official when it's not

---

### 16. Custom Dictionary Quality Checklist (MANDATORY — When Updating custom-dictionary.yaml)

**Before committing any definition change, verify:**

1. **Source authority hierarchy** — Cross-check definition against sources in authority order:
   - **CIR (Implementing Acts)** → highest authority (legally binding)
   - **ARF main document** → architectural authority
   - **Technical Specifications (TS)** → technical authority (may supersede Discussion Papers)
   - **Discussion Papers (Topics A–G)** → advisory only (HLRs may be superseded by TS versions)

2. **Cascading impact scan** — After changing a definition, run:
   ```bash
   grep -n "<changed term>" docs-portal/scripts/custom-dictionary.yaml
   ```
   Fix any other definitions that reference the changed concept incorrectly.

3. **Vague term avoidance** — Avoid imprecise terms that have no formal ARF definition. Known offenders:
   - ❌ "transaction" → use "presentation", "issuance session", or "interaction"
   - ❌ "process" (when vague) → be specific about what process

4. **Cross-reference consistency** — If definition A refers to definition B, verify B exists and is consistent.

**Why this matters:** The WUA definition required 3 successive commits because the Discussion Paper (Topic C) was treated as ground truth, but TS3 v1.0 had superseded its presentation WUA references. A cascading scan then found 2 more definitions (wallet instance, validation) still referencing the old incorrect behaviour.

---

### 17. WUA Source Authority (Reference)

**For Wallet Unit Attestation topics:**
- **TS3** (Technical Specification 3) is the definitive technical source
- TS3 v1.0 (Aug 2025) explicitly **removed references to presentation WUA** — WUAs are issuance-only
- The Discussion Paper (Topic C) HLRs (WUA_08b/08c) suggesting RP presentation were **superseded**
- The ARF main document §6.5.3.4 confirms: "the Wallet Unit presents the WUA only to PID Providers and Attestation Providers, but not to Relying Parties"

**Key facts:**
- WUAs are NOT presented to Relying Parties
- RPs verify the Wallet Unit through **transitive trust** (issuer signature + device key binding + cascaded revocation)
- WUA_24: data related to the User device must not be released to RPs

---

### 18. Terminal Hygiene (Awareness)

**When git commands return no output or hang indefinitely:**
1. Check for stale terminal sessions from previous operations
2. Clear git lock if needed: `rm -f .git/index.lock`
3. Kill stuck background terminals before retrying

**Root cause:** Stale terminal sessions from long-running or interrupted commands can block subsequent git operations.

---

### 19. Codebase-First Plan Review (MANDATORY — When Reviewing Plans)

**When reviewing any plan that references scripts, configs, or data flows, you MUST inspect the actual source code BEFORE proposing changes.**

**Required steps:**
1. **`grep`/`view` every script** mentioned in the plan to understand what it actually does
2. **Cross-check data flows** — trace how data moves from YAML → build script → JSON → React component
3. **Search for parallel implementations** — `grep -r` for the same data/concept to find ALL consumers
4. **Verify config completeness** — check that config files include all referenced values (e.g., `relevantTopics` includes all topics referenced in YAML)

**Why this matters:** A plan review that only reads the plan text misses real issues. In the ARF v2.8.0 upgrade plan, text-only review found 2 issues; codebase-first review found 9 (including 3 critical bugs).

**Anti-patterns:**
- ❌ Reviewing a plan by reading only the plan document
- ❌ Proposing changes without checking if the affected scripts actually work the way the plan assumes
- ❌ Missing parallel implementations (e.g., two scripts that import the same data)

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
│   ├── eurlex_html_to_md.py            # EUR-Lex HTML → Markdown converter
│   ├── pipeline.py                     # Unified import pipeline
│   ├── test_formex_converter.py        # Unit tests for converter
│   ├── documents.yaml                  # Document registry (SSOT)
│   ├── restart-chrome.sh               # Start Chrome with CDP (WSL → Windows)
│   ├── cleanup-chrome-tabs.sh          # Clean stale browser tabs
│   └── agent-done.sh                   # End-of-response notification + context
├── .legacy/                            # ARCHIVED: Do not use for existing docs
│   └── formex_to_md_v3.py              # ⚠️ ARCHIVED Formex converter (see DEC-095)
├── .agent/                             # Agent configuration
│   ├── docs/                           # 📚 Extended documentation
│   │   ├── rules/                      # Development & content rules
│   │   └── architecture/               # Technical architecture docs
│   ├── workflows/                      # Human-invoked workflows
│   ├── snippets/                       # Reusable code patterns
│   ├── research/                       # Research materials (not imported to portal)
│   │   └── edps/                       # EDPS position papers & opinions
│   └── session/                        # Session state
├── AGENTS.md                           # This file (AI context)
├── TERMINOLOGY.md                      # Project vocabulary
├── DECISIONS.md                        # Design decisions log
├── TRACKER.md                          # Work session tracker
└── README.md                           # Project overview
```

**Research Folder Note:** `.agent/research/` contains reference materials (e.g., EDPS opinions, academic papers) that inform the project but are NOT directly imported. Use for terminology extraction and background understanding.

**RCA Extraction Rule:** RCA requirements come ONLY from binding legislation (eIDAS Regulation, Implementing Acts). Never extract RCA requirements from opinions, recommendations, or position papers (e.g., EDPS formal comments). These documents may inform understanding but do not create legal obligations.

### ARF Version Tracking

| Property | Value |
|----------|-------|
| **Current version** | v2.8.0 (DEC-290) |
| **Pinned to** | `refs/tags/v2.8.0` (released 2026-02-02) |
| **Location** | `03_arf/` (copy, not submodule) |
| **Upgrade plan** | `docs-portal/docs/plans/arf-280-upgrade-plan.md` |
| **Diff script** | `docs-portal/scripts/diff-arf-hlrs.py` |

### ARF Import Scripts (⚠️ Two Parallel Scripts)

There are **two separate ARF import scripts** with different purposes:

| Script | Input | Output | Used By |
|--------|-------|--------|---------|
| `scripts/import-arf.js` | GitHub CSV (remote fetch) | `public/data/arf-hlr-data.json` | VCQ UI (popovers, deep links, Excel export) |
| `scripts/import-arf-hlr.js` | Local `03_arf/hltr/high-level-requirements.csv` | `config/requirements/arf-hlr.json` | Requirements Browser |

**Only `import-arf.js` is in the `npm run build` pipeline.** After updating the local CSV (e.g., ARF version upgrade), you must **manually run** `import-arf-hlr.js` to update the Requirements Browser data.

### ARF Configuration (⚠️ Critical Config File)

**`config/arf/arf-config.yaml`** controls:
- **`relevantTopics`** — which ARF topics are imported (HLRs from unlisted topics are **silently dropped**)
- **`topicAnchors`** — anchor slugs for deep links to GitHub
- **`csvUrl`** — URL for fetching HLR data (must be pinned to a version tag, not `main`)
- **`baseUrl`** — base URL for deep links (must match `csvUrl` version)

**⚠️ If a VCQ YAML file references a topic not in `relevantTopics`, the HLR lookup will silently fail.** Always cross-check when adding new `arfReference` entries.

### ARF CSV Data Format (⚠️ Important for Parsing)

The HLR CSV at `03_arf/hltr/high-level-requirements.csv` has non-standard formatting:

- **Encoding:** UTF-8 with BOM — use `encoding='utf-8-sig'` in Python
- **Delimiter:** Semicolon (`;`), NOT comma
- **Columns:** `Harmonized_ID`, `Part`, `Category`, `Topic`, `Topic_Number`, `Topic_Title`, `Subsection`, `Index`, `Requirement_specification`, `Notes`
- **Key fields:**
  - `Harmonized_ID` = new-format ID (e.g., `AS-WP-09-026`)
  - `Index` = legacy/old ID (e.g., `WUA_20a`)
  - `Requirement_specification` = the actual requirement text
  - "Empty" text = requirement withdrawn, consolidated, or deferred

### ARF Data Indices (`byHlrId` / `byHarmonizedId`)

`arf-hlr-data.json` provides lookup indices for ARF requirements:

| Index | Key Format | Example | Used By |
|-------|------------|---------|---------|
| `byHlrId` | Old ID (Index column) | `ISSU_29` | Search index, backward compat |
| `byHarmonizedId` | EC Harmonized ID | `AS-AP-10-029` | VCQ references (after migration) |

**⚠️ `byHlrId` is keyed on Old ID (`row.Index`), NOT Harmonized ID.** This is the primary index used by all current VCQ lookups. Since every Old ID is unique in the CSV, no collisions occur.

**⚠️ `byHarmonizedId` has 8 duplicate keys in v2.8.0.** The EC CSV contains 656 rows but only 648 unique Harmonized IDs. Five are Topic 38 "empty tombstones" (retired requirement + content-bearing requirement share an ID), three are genuinely different requirements sharing an ID. When building `byHarmonizedId`, use a **content-wins guard** to prevent Empty tombstones from overwriting content entries:

```js
// Content-wins guard for byHarmonizedId:
if (!byHarmonizedId[harmonizedId] || !requirement.isEmpty) {
    byHarmonizedId[harmonizedId] = requirement;
}
```

**Key file locations for ARF data consumers:**

| File | Purpose |
|------|---------|
| `scripts/import-arf.js` | Builds `byHlrId` + `byHarmonizedId` from remote CSV |
| `scripts/import-arf-hlr.js` | Builds Requirements Browser data from local CSV |
| `src/utils/vcq/exportExcel.js` | Excel export — looks up specs via `byHlrId` |
| `src/pages/VendorQuestionnaire.jsx` | `ARFReferenceLink` renders deep links via `byHlrId` |
| `scripts/validate-vcq.js` | Validates `hlr:` references against `byHlrId` keys |

**After the Harmonized ID migration (Phase 2 of ARF v2.8.0 upgrade):**
- VCQ YAML `arfReference.hlr` will use Harmonized IDs
- `validate-vcq.js` and `validate-vcq-arf.js` will validate against `byHarmonizedId`
- `src/utils/vcq/exportExcel.js` will look up specs via `byHarmonizedId` with `byHlrId` fallback
- Search index will display both IDs for discoverability



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

### Build Workflow (After Terminology Changes)

**After modifying terminology data**, always run the combined build command:

```bash
npm run build:all-content
```

This runs `build:terminology` → `build:search` in sequence.

**Why this matters:** The search index depends on `terminology.json`. If you only run `build:terminology`, the search index becomes stale and terms won't appear in search results.

| Command | What It Does |
|---------|--------------|
| `npm run build:terminology` | Extracts terms → `terminology.json` |
| `npm run build:search` | Builds Orama index → `search-index.json` |
| `npm run build:all-content` | **Runs both in correct order** ✅ |

**CI Protection:** In CI environments (`CI=true`), the build will **fail** if the search index is stale. This prevents deploying outdated search data.

**Debugging tip:** If search results are wrong or missing terms, first check if the index is stale by running `npm run build:all-content`.

### Terminology Display Casing Convention

The build pipeline **preserves original source casing by default**. Terms extracted from legal definitions appear lowercase (e.g., "biometric data", "risk", "authentication") because that's how they appear in the regulation text.

**Overrides** are managed in `scripts/canonical-casing.yaml`, which maps `term-id: "Display Name"` for terms that need different casing:

| Category | Count | Casing | Examples |
|----------|-------|--------|----------|
| **Proper concepts** | ~158 | Title Case | Wallet Unit Attestation, Relying Party, Trusted List |
| **Generic terms** | ~174 | lowercase (default) | biometric data, risk, authentication, group |
| **Acronyms** | ~12 | Preserve as-is | AdES, CAdES, PAdES, XAdES |
| **Legal phrases** | ~15 | lowercase | without prejudice to, mutatis mutandis |
| **Acronym-prefixed** | ~15 | Mixed | ICT risk, ICT-related incident |

**When adding new terms:**
- If it's a named eIDAS concept/role → Add to `canonical-casing.yaml` with Title Case
- If it's a generic legal term → No action needed (default preserves lowercase)
- If it contains an acronym → Add to `canonical-casing.yaml` to preserve the acronym

**Anti-patterns:**
- ❌ Re-introducing a `toTitleCase()` function (was removed deliberately)
- ❌ Adding generic terms like "data", "risk", "consent" with Title Case

### Build Workflow (After Content/Terminology Changes for AI Chat)

**The AI Chat RAG system uses pre-computed embeddings.** After modifying:
- Terminology (`terminology.json`)
- Regulation content (markdown files)
- Implementing act content

Run:

```bash
npm run build:embeddings
```

**What it does:**
1. Computes vector embeddings for all regulation articles and terminology
2. Stores them in `public/data/embeddings.json` (~8MB)
3. Uses hash-based invalidation (skips if sources unchanged)

| Command | What It Does |
|---------|--------------|
| `npm run build:embeddings` | Generates embeddings → `embeddings.json` |
| `npm run build` | Full build (includes embeddings automatically) |

**When embeddings are stale:**
- AI Chat returns irrelevant or no context for user queries
- Terms you added won't appear in RAG retrieval
- Console shows no warning (embeddings are loaded successfully, just outdated)

**Debugging tip:** If AI Chat gives wrong answers about recent content, check:
1. Is `embeddings.json` older than `terminology.json`? → Run `build:embeddings`
2. Is the terminology correctly extracted? → Run `build:all-content` first

### Mobile Breakpoints Reference

The portal uses 4 standard breakpoints for responsive design:

| Breakpoint | Width | Usage |
|------------|-------|-------|
| **Tablet** | `≤1024px` | Sidebar collapses, single-column layout |
| **Mobile** | `≤640px` | Full mobile layout, typography scales down |
| **Small Mobile** | `≤480px` | Horizontal scroll tables, tighter padding |
| **Tiny** | `≤380px` | Minimum viable layout, reduced font sizes |

**Key CSS locations:**
- `src/styles/index.css` — Core responsive rules (Section 11)
- `src/components/AIChat/AIChat.css` — Fullscreen chat on mobile
- `src/components/requirements/RequirementsTable.css` — Table scroll

### 🔧 Portal Architecture Gotchas

#### CSS-First Debugging for JSX Spacing Issues

When fixing spacing/layout problems in JSX, **always inspect parent CSS properties first** before assuming JSX whitespace is the cause.

| CSS Property | Common Surprise |
|-------------|----------------|
| `display: inline-flex` + `gap` | Inserts space between text nodes and inline elements (flex children) |
| `display: flex` + `gap` | Same — each JSX child node becomes a flex item with gap |
| `white-space: pre` | Preserves all whitespace including JSX newlines |

**Example bug:** `— Internal , synthesized from...` — the space before comma was caused by `gap: var(--space-1)` on the parent `inline-flex` element, NOT JSX whitespace between `</span>` and `{', '}`.

**Fix pattern:** Wrap adjacent elements that should have no gap in a single `<span>` to make them one flex child.

#### Case-Insensitive Exact Search (termLower Pattern)

Orama's `exact: true` is **case-sensitive** against stored field values. To support case-insensitive abbreviation matching:

1. **Build time** (`build-search-index.js`): Store original case in `term` (for display), lowercase in `termLower` (for search)
2. **Runtime** (`useSearch.js`): Query `termLower` with `searchQuery.toLowerCase()`

**When to apply this pattern:** Any new searchable field that needs case-insensitive exact matching should follow the same `field` + `fieldLower` convention.

#### Dual Popover Implementations (Keep in Sync)

The portal has **TWO term popover implementations** that must stay synchronized:

| File | Used By | Type |
|------|---------|------|
| `src/components/TermPopover/TermPopover.jsx` | Terminology page | React component |
| `src/utils/termPopoverTemplate.js` | RegulationViewer.jsx | Template string generator |

**Why two implementations?** The Terminology page uses React components, but the RegulationViewer injects popovers into statically-rendered HTML content via template strings.

**When modifying popover features** (e.g., adding alias display), update BOTH files.

#### Regulation ID Format Variation (Leading Zeros)

Document slugs use format `YYYY-NNNN` with **leading zeros** for the number portion, but legal references often omit them:

| Source | Format | Example |
|--------|--------|---------|
| **Document slugs** | `YYYY-0NNN` | `2025-0848` |
| **Legal refs in RCA** | `YYYY/NNN` | `2025/848` |
| **CELEX numbers** | Full year format | `32025R0848` |

**The lookup normalizes these automatically** (see `useRegulationsIndex` hook), but be aware of this variation when debugging link issues.

#### Regulation ID Canonical Format (DEC-225)

**All YAML files MUST use YEAR/NUMBER format** for regulation IDs:

| ✅ CORRECT | ❌ WRONG |
|------------|----------|
| `regulation: "2014/910"` | `regulation: "910/2014"` |
| `regulation: 2024/2977` | `regulation: 2977/2024` |

**Why:** The NUMBER/YEAR format (e.g., `910/2014`) is a legacy EU convention that caused repeated lookup failures. All source files have been normalized to YEAR/NUMBER.

**Normalization tool:** If you encounter NUMBER/YEAR format in YAML:
```bash
npm run normalize:regulation-ids -- --dry-run  # Preview
npm run normalize:regulation-ids               # Apply
```

#### Deep Link Anchor ID Convention

When building deep links to legal content, use these ID patterns:

| Element | Anchor Format | Example |
|---------|---------------|---------|
| **Article** | `article-{num}` | `article-5a` |
| **Paragraph** | `...-para-{num}` | `article-5a-para-1` |
| **Point** | `...-point-{letter}` | `article-5a-para-1-point-a` |
| **Subpoint** | `...-subpoint-{roman}` | `article-5a-para-1-point-a-subpoint-i` |
| **Annex paragraph** | `annex-{id}-para-{num}` | `annex-v-para-3` |
| **Annex section header** | `annex-{id}-section-{num}` | `annex-para-section-1` |

**Key distinction:**
- `-para-` is for standard content references (used 99% of the time)
- `-section-` is ONLY for numbered section headers in annexes (e.g., "1. Set of data...")

**Alphanumeric Paragraphs (1a, 1b, 1c):**

EU legislation uses alphanumeric paragraphs when amendments insert content between existing paragraphs.

| Format | Works? | Why |
|--------|--------|-----|
| `- (1a) Text...` | ✅ | Recognized as list item with paragraph identifier |
| `1a. Text...` | ❌ | Rendered as plain paragraph, no deep-link anchor |

**The markdown source MUST use `- (1a)` list format** for `rehype-paragraph-ids.js` to generate anchors.

**If you see missing gutter icons on alphanumeric paragraphs:**
1. Check markdown source — is it `1a.` or `- (1a)`?
2. Fix the format in the markdown file
3. Rebuild with `npm run build:documents`

#### Centralized Link Builder (DEC-226 — MANDATORY)

**All portal URL generation MUST use the centralized link builder utility.**

Location: `docs-portal/src/utils/linkBuilder.js`

**Why this exists:** URL generation was scattered across 10+ files with inconsistent formats, causing recurring deep-link bugs.

**HashRouter URL Format:**

| Context | Format | Example |
|---------|--------|---------|
| **Internal** (`<Link to=...>`) | `/regulation/{slug}?section={id}` | `/regulation/2014-910?section=article-5a` |
| **External/Href** (templates) | `#/regulation/{slug}?section={id}` | `#/regulation/2014-910?section=article-5a` |
| **Full URL** (clipboard) | `{origin}/#/regulation/{slug}?section={id}` | `https://example.com/#/regulation/2014-910?section=article-5a` |

**⚠️ NEVER use HTML fragment anchors:**
- ❌ WRONG: `/regulation/2014-910#article-5a` (breaks with HashRouter)
- ✅ CORRECT: `/regulation/2014-910?section=article-5a`

**Available functions:**

| Function | Purpose | Returns |
|----------|---------|---------|
| `buildDocumentLink(slug, options)` | Regulation/IA links | `/regulation/{slug}?section=...` |
| `buildTerminologyLink(options)` | Terminology links | `/terminology?section=term-...` |
| `buildRCALink(options)` | RCA tool links | `/rca?role=...&profile=...` |
| `buildSectionId(article, paragraph)` | Build anchor ID | `article-5a-para-1-point-b` |
| `toHref(internalPath)` | For template strings | `#/regulation/...` |
| `toExternalUrl(internalPath)` | For clipboard | `https://.../#/regulation/...` |

**Anti-patterns:**
- ❌ Building URLs inline: `` `/${type}/${slug}#article-5a` ``
- ❌ Concatenating paths manually without the utility
- ❌ Using `#article-*` anchors instead of `?section=`

**Correct pattern:**
```javascript
import { buildDocumentLink, buildSectionId, toHref } from '../utils/linkBuilder';

// For React Router <Link>
<Link to={buildDocumentLink('2014-910', { section: 'article-5a' })} />

// For template strings (href in HTML)
const href = toHref(buildDocumentLink('2014-910', { section: 'article-5a' }));
```

#### EUR-Lex Deep Link Anchors

When linking to **external** EU documents on EUR-Lex, use these anchor patterns:

| Target | Anchor Format | Example |
|--------|---------------|---------|
| **Article** | `#art_{N}` | `#art_5` |
| **Article + Paragraph** | `#{NNN}.{MMM}` (zero-padded) | `#005.001` for Art 5(1) |
| **Recital** | `#rct_{N}` | `#rct_26` |
| **Chapter** | `#cpt_{N}` | `#cpt_II` |

**⚠️ LIMITATION:** Definition points `(a)`, `(b)` and numbered lists `(1)`, `(2)` within articles do NOT have individual anchors. You can only link to the article itself.

**URL format:**
```
https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:{CELEX}#{anchor}
```

**Example URLs:**
- Article 5 of Comitology: `...CELEX:32011R0182#art_5`
- Article 33(1) of DSA: `...CELEX:32022R2065#033.001`
- DMA Article 2: `...CELEX:32022R1925#art_2`

**Registry:** External documents are listed in `docs-portal/config/external-documents.yaml`.

#### Node.js Script Execution (ESM Project — Use .cjs Files)

The `docs-portal/` has `"type": "module"` in `package.json`, which means all `.js` files are treated as ES Modules. This has two consequences:

**1. Inline `node -e` with multiline code WILL FAIL:**

Multiline JavaScript passed via `node -e "..."` gets mangled by bash — quotes, parentheses, and special characters are interpreted as shell syntax. Symptoms: `bash: syntax error near unexpected token '('` and zombie processes.

**2. Ad-hoc `.js` scripts using `require()` WILL FAIL:**

`require()` is CommonJS and is not available in ESM mode.

**Correct patterns:**

| Need | Approach |
|------|----------|
| **Quick one-liner** | `node -p "require('fs').readFileSync('file.json','utf-8').length"` — BUT keep it genuinely one-line |
| **Multi-line analysis** | Write a `.cjs` file (e.g., `scripts/my-analysis.cjs`) with `require()` syntax, run `node scripts/my-analysis.cjs` |
| **Permanent script** | Write a proper `.js` file with `import` syntax (ESM) |

**Anti-patterns:**
- ❌ `node -e "const fs = require('fs');\nconst data = ..."` — multiline, will break
- ❌ Creating `scripts/analysis.js` with `require()` — will fail because ESM
- ❌ Retrying the same failing `node -e` multiple times

**Correct pattern:**
- ✅ Write `scripts/analysis.cjs` → run `node scripts/analysis.cjs` → delete when done

**⚠️ Large JSON files (>1MB) will hang interactive terminals:**
- ❌ `node -e "const d = require('./public/data/arf-hlr-data.json')"` — 4.7MB file, blocks forever
- ❌ `python3 -c "import json; json.load(open('large.json'))"` — same issue on large files
- ✅ Use dedicated lookup scripts: `node scripts/lookup-hlr.cjs <topic>` for ARF HLR queries
- ✅ Use `grep` or `jq` for quick JSON searches on large files

**⚠️ Filenames with parentheses require quoting:**
- ❌ `grep pattern ~/path/ts10-data-portability-and-download-(export).md` — shell interprets `(` as subshell
- ✅ `grep pattern "$HOME/path/ts10-data-portability-and-download-(export).md"` — double-quote the path
- Affected files: `04_technical_specs/docs/technical-specifications/ts10-data-portability-and-download-(export).md`

---

## 🖥️ WSL Browser Testing

For visual UI validation using `browser_subagent` from WSL.

### Port Reference

| Port | Service |
|------|---------|
| **5173** | Vite dev server (docs-portal) |
| **9222** | Chrome CDP (remote debugging) |

### Base URL (CRITICAL for browser_subagent)

**The portal requires the `/eIDAS20/` prefix in all URLs**:
- ✅ CORRECT: `http://localhost:5173/eIDAS20/vcq`
- ❌ WRONG: `http://localhost:5173/vcq`

Without the prefix, the Vite dev server redirects to the correct URL, but browser_subagent may fail to track the page correctly.

### Prerequisites

1. **WSL networking**: `.wslconfig` must have `networkingMode=mirrored`
2. **Chrome with CDP**: Must be running with remote debugging on port 9222

### Check for Running Dev Server (BEFORE Starting New One)

Always check if a dev server is already running before starting a new one:
```bash
lsof -i :5173 2>/dev/null | head -3
```

If output shows a running process, reuse it. If empty, start a new one:
```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
```

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

### Browser Subagent Screenshot Locations

Browser subagent saves screenshots in several locations:

| Type | Path | Description |
|------|------|-------------|
| **Click feedback** | `~/.gemini/antigravity/brain/{conv-id}/.system_generated/click_feedback/` | Screenshots taken after each pixel click |
| **Named screenshots** | `~/.gemini/antigravity/brain/{conv-id}/` | Screenshots captured via `capture_browser_screenshot` |
| **Recording** | `~/.gemini/antigravity/brain/{conv-id}/{recording_name}_{timestamp}.webp` | WebP video of entire session |

**Click feedback screenshots** are the most reliable for verification — they're automatically saved after every click action.

### Troubleshooting

| Issue | Solution |
|-------|-----------|
| Chrome not accessible | `~/dev/eIDAS20/scripts/restart-chrome.sh` |
| Too many tabs / SSE issues | `~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh` |
| Wrong port errors | Portal uses **5173**, Chrome uses **9222** |
| Page not found after navigation | Check URL includes `/eIDAS20/` prefix |

---

## 🌐 GitHub Pages Deployment

### CDN Caching Gotcha

After deploying to GitHub Pages, changes may not appear immediately due to CDN caching.

**Symptoms:**
- Build logs show correct data, but live site shows old UI/data
- "0 reqs" on VCQ despite successful `build-vcq.js` output

**Solutions:**
1. **Hard refresh**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Incognito window**: Test in private/incognito mode
3. **Cache-busting URL**: Add `?v=2` to the URL
4. **Wait**: CDN propagation can take 1-5 minutes

---

## 🔧 Validator Update Rule (MANDATORY)

**When changing data models, update validators in the SAME commit.**

| Data Change | Validator to Update |
|-------------|---------------------|
| VCQ requirement YAML structure | `scripts/validate-vcq.js` |
| RCA requirement YAML structure | `scripts/validate-rca.js` |
| New ID format prefix | Add to regex in validator |
| New applicability type | Add to `validIntermediaryTypes` |

**Why this matters:** DEC-254 changed the VCQ data model (VEND-INT-* IDs, `intermediary` type), but the validator wasn't updated in the same commit. Result: CI failures on subsequent push.

**Anti-patterns:**
- ❌ Change data model → Commit → Later update validator
- ❌ "The validator is for the old model, I'll fix it later"

**Correct pattern:**
- ✅ Change data model + update validator → Single commit

---

## Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `/init` | Start of session | Prime agent with project context |
| `/handover` | End of session | Generate handover summary |
| `/retro` | After milestones | Run structured retrospective |
| `/rca-audit` | RCA work | Audit legal docs for role-specific requirements |

| `/vcq-audit` | VCQ content work | Systematic quality audit of VCQ requirements |

See `.agent/workflows/` for detailed instructions.

---

## Conversion Guidelines

### 🚨 MANDATORY: Markdown-First Import Strategy (DEC-095)

**All imported documents are `source: manual`.** The markdown IS the source of truth.

**For EXISTING documents (the normal case):**
- Fix formatting issues **directly in the markdown file**
- Never re-run the converter on existing documents
- No need to debug converter for single-document fixes

**For NEW document imports only:**
1. Use converter (`eurlex_formex.py`) for initial import
2. Validate the output in the portal
3. Set `source: manual` in `documents.yaml` immediately
4. Fix any remaining issues in markdown

**Why this matters:**
- Converters are **import tools**, not regeneration pipelines
- Re-importing overwrites manual corrections
- Debugging converter bugs for existing documents wastes time

**Anti-patterns:**
- ❌ Re-running converter to "fix" an existing document
- ❌ Spending hours debugging converter for a one-document issue
- ❌ Assuming markdown can be regenerated (it can't without losing corrections)

**Correct patterns:**
- ✅ See issue in existing document → Fix markdown directly
- ✅ Importing NEW document → Use converter → Mark `source: manual`
- ✅ Widespread converter bug affecting future imports → Fix converter

**See:** DEC-095 in DECISIONS.md for full rationale.

### ⚠️ Formex Converter ARCHIVED (2026-01-21)

**The Formex XML → Markdown converter has been archived to `.legacy/formex_to_md_v3.py`.**

**DO NOT re-run the converter on existing regulations.** This has caused regressions twice:
- 2026-01-21: Commit `522e0bc` re-imported eIDAS via converter, scrambling article order (5a-45 appeared after Article 52)
- The same regression was fixed in `13a906c` but reintroduced when re-running converter

**The converter may be used in the future for importing NEW Formex-based documents, but existing markdown files are the authoritative source.**

### ⚠️ Known Pitfall: eIDAS Article Order Regression

**Symptom:** Articles 5a through 45 appear to be "missing" from the portal's Table of Contents.

**Actual cause:** Articles are present but out of order in the markdown file (5 → 46 → 47 → ... → 52 → 5a → 5b → ... → 45).

**Root cause:** Re-running the Formex converter produces articles in the wrong order for consolidated eIDAS.

**Fix:** Restore correct article order from a known-good git commit. Do NOT re-run the converter.

**Prevention:** The converter is now archived. Edit markdown directly for fixes.

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

### Consolidated Import Strategy

**When the consolidated Formex is unavailable but amendments exist:**

| Step | Action |
|------|--------|
| 1. Check consolidated Formex | Try consolidated CELEX (0YYYYRNNNN-DATE) on EUR-Lex |
| 2. If unavailable | Fall back to base CELEX (3YYYYRNNNN) |
| 3. Import via Formex | Use `eurlex_formex.py` with base CELEX |
| 4. Apply corrigenda | Manually apply any corrigenda (R01, R02, etc.) |
| 5. Update documents.yaml | Set `celex` to consolidated, `source: manual`, add comments |
| 6. Add note to markdown | Add **Note:** line about amendment status |

**Example (Cybersecurity Act):**
```yaml
# documents.yaml
- celex: 02019R0881-20250204              # Consolidated CELEX for EUR-Lex link
  source: manual                           # Protects from overwrite
  cellar_id: 35e93bb4-8905-11e9...        # Original Formex source
  # NOTE: Imported from base CELEX, M1 (2025/37) not applied
```

**Why this pattern:**
- EUR-Lex link shows users the **latest consolidated text**
- `source: manual` prevents accidental overwrites
- Comments document what amendments are/aren't applied
- Original `cellar_id` preserves provenance

**Applied to:** GDPR, NIS2, Cybersecurity Act

### CELEX Format Guide

| Prefix | Meaning | Example |
|--------|---------|---------|
| `3` | Base/original act | `32012R1025` (Standardisation Regulation) |
| `0` | Consolidated version | `02012R1025-20241213` (with amendments applied) |
| `C` | Corrigendum | `32014R0910R(01)` |

**Pattern:** `[Prefix][Year][Type][Number][-ConsolidationDate]`

**For consolidated imports:**
- EUR-Lex link should use `0xxxx` (consolidated CELEX) so users see latest version
- If consolidated version lacks preamble/recitals, merge from base version (see below)

### Preamble Merge Pattern (Consolidated Documents)

**EUR-Lex consolidated versions often omit preamble and recitals.** When this happens:

1. **Import consolidated version** (`0xxxx` CELEX) for enacting terms
2. **Import base version** (`3xxxx` CELEX) for preamble/recitals
3. **Merge:** Base preamble/recitals + Consolidated enacting terms
4. **Add note to metadata:** `> **Note:** Enacting terms from consolidated version (0xxxxx). Preamble merged from base version (3xxxxx).`

**Applied to:** Standardisation Regulation (1025/2012)

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

### RCA Profile Filter Pattern

**Profile filtering requires BOTH data AND UI:**

1. **Data annotation**: Requirements must have `profileFilter: [profile_id]` in YAML
2. **Working UI**: `ProfileSelector` component must allow individual profile selection

**Common pitfall:** If requirements don't appear/disappear when selecting profiles:
- Check `profileFilter` field exists on requirements (data layer)
- Check `ProfileSelector` allows individual selection (UI layer)

**Testing checklist:**
1. Select profile A → count requirements
2. Select profile B → count should differ if profile-specific reqs exist
3. View assessment → verify only matching requirements appear

**See:** `/rca-audit` workflow for `profileFilter` syntax and `mutatis mutandis` clause detection.

### RCA Category Taxonomy (12 Atomic Categories)

**Categories are globally defined** in `config/rca/categories.yaml` — the single source of truth.

| ID | Icon | Label | Single Concern |
|-----|------|-------|----------------|
| `registration` | 📋 | Registration | Notification, authorization |
| `certification` | ✅ | Certification | Audits, conformity assessment |
| `issuance` | 📤 | Issuance | Creating credentials |
| `revocation` | 🚫 | Revocation | Suspension, invalidation |
| `verification` | 🔍 | Verification | Identity proofing, auth |
| `technical` | ⚙️ | Technical | Formats, protocols, APIs |
| `interoperability` | 🌐 | Interoperability | Cross-border, standards |
| `security` | 🔒 | Security | Cybersecurity, crypto |
| `privacy` | 🛡️ | Privacy | GDPR, data protection |
| `transparency` | 👁️ | Transparency | Disclosure, policies |
| `governance` | 🏛️ | Governance | Staffing, procedures |
| `liability` | ⚖️ | Liability | Insurance, legal effects |

**Key principle:** Categories = obligation TYPE, Use cases = service CONTEXT

**Anti-pattern:**
- ❌ `category: esignature` (mixes service type with obligation type)

**Correct pattern:**
- ✅ `category: technical` + `useCases: [esignature]` (separated concerns)

### YAML Format Gotcha: `useCases: all` vs `useCases: [all]`

**These are NOT the same:**
- `useCases: all` → String "all" (VALID — means universal)
- `useCases: [all]` → Array with one item "all" (INVALID — validator rejects)

**The validator enforces:** If you use `all`, it must be scalar, not array.

### Use Case Mapping Guidance (DEC-088)

**When auditing requirements for use case mapping:**

| Role Type | Roles | Action |
|-----------|-------|--------|
| **Service-Facing** | Wallet Provider, Relying Party | Full semantic analysis required |
| **Infrastructure** | TSP, Issuer, PID, CAB, SB | Assume `useCases: all` unless legal text explicitly mentions use cases |

**Why Infrastructure Roles are Universal:**
- Their obligations govern HOW to operate (certification, auditing, oversight)
- Not WHAT services are provided
- A TSP's security requirements apply whether they issue signatures, seals, or timestamps

**Reference:** See DEC-088 Addendum in DECISIONS.md and `USE_CASE_MAPPING_SUMMARY.md` in `config/rca/`.

### ETSI Requirement Extraction Policy

**When implementing act annexes contain ETSI-style requirements (REQ-*, USE-*, VAL-*, etc.), these should be extracted as RCA requirements with profile filters.**

**Pattern:**
1. **Identify REQ-* patterns** in implementing act annexes
2. **Create new TSP profile** if requirements target a specific service type (e.g., `electronic_ledger`, `qwac_issuer`)
3. **Extract each REQ-* as an RCA requirement** with:
   - `profileFilter: [new_profile]`
   - `legalBasis.regulation: "YYYY/NNNN"`
   - `legalBasis.article: "Annex"`
   - `legalBasis.paragraph: "REQ-X.X-XX"`

**Examples applied:**
- **2025/2531** (Electronic Ledgers) → 15 requirements → `electronic_ledger` profile
- **2025/2527** (QWAC Standards) → 3 requirements → `qwac_issuer` profile

**Exclusions:**
- Notification/procedural annexes targeting Member States (e.g., 2025/1570 QSCD notification)
- Pure informational content without REQ-* patterns

### ARF Integration Notes (Phase 6)

**Topic Renumbering:** ARF v1.5 renumbered "Relying Party Intermediaries" from **Topic 45 → Topic 52**. All VCQ YAML files and `arf-config.yaml` use Topic 52.

**HLR Validation One-liner:**
```bash
# Compare VCQ HLR references against imported ARF data
grep -rh "hlr:" docs-portal/config/vcq/requirements/*.yaml | \
  sed 's/.*hlr: *//' | sed 's/"//g' | sort -u | \
  while read hlr; do grep -q "\"$hlr\"" docs-portal/public/data/arf-hlr-data.json && echo "✅ $hlr" || echo "❌ $hlr NOT FOUND"; done
```

**Build Pipeline:** ARF is integrated into the main build:
- `npm run build:arf` — Import ARF CSV → `arf-hlr-data.json` (143 HLRs)
- `npm run build:search` — Includes ARF HLRs in search index (129 non-empty)
- `npm run build` — Runs both automatically

**ARF Topics Imported:** 1 (OIA_*), 6 (RPA_*), 7 (VCR_*), 27 (Reg_*), 44 (RPRC_*), 52 (RPI_*)

**See:** [TERMINOLOGY.md](TERMINOLOGY.md) for full vocabulary.

### HLR CSV Delimiter (Gotcha)

The ARF High-Level Requirements CSV uses **semicolons (`;`)** as delimiter, NOT commas. When searching for exact HLR matches:

```bash
# ✅ Correct — semicolon delimiter, exact match
grep ";QTSPAS_03;" docs-portal/data/arf/high-level-requirements.csv

# ❌ Wrong — comma search finds nothing
grep ",QTSPAS_03," docs-portal/data/arf/high-level-requirements.csv
```

**Pre-compiled index:** See `.agent/session/hlr-index-by-track.md` for a quick-reference index grouped by VCQ track.

### Dual legalBasis YAML Schema

The `legalBasis` field in VCQ requirement YAML can be **either a single object or an array of objects**:

```yaml
# Single legal basis (object)
legalBasis:
  regulation: 2022/2554
  article: Article 30
  paragraph: "2"

# Multiple legal bases (array)
legalBasis:
  - regulation: 2022/2554
    article: Article 30
    paragraph: "2(e)"
  - regulation: 2016/679
    article: Article 28
    paragraph: "3(h)"
```

**Both formats are valid.** The build script and validators handle both. Common for ICT/DORA track where DORA and GDPR create parallel obligations.

### Full-File Overwrite Guidance

When enhancing VCQ requirements in bulk (>50% of content changing), **full-file overwrite via `write_to_file` is faster and less error-prone** than surgical edits via `multi_replace_file_content`.

| When | Approach |
|------|----------|
| Modifying >50% of file, file <500 lines | Full-file overwrite (`write_to_file`) |
| Modifying <20% of file | Surgical edits (`multi_replace_file_content`) |
| File >500 lines | Surgical edits to avoid context errors |

**Why:** VCQ requirement files are typically 200-500 lines. When enhancing every requirement's explanation and adding legalText, the diff is so large that re-writing the file is simpler.

---

## VCQ Architecture (Vendor Compliance Questionnaire)

### Source Group Counting Logic

**VCQ requirements are counted in source groups based on their `legalBasis.regulation` field.**

| Source Group | Regulations Included |
|--------------|---------------------|
| `eidas` | 2014/910, 2024/1183, 2015/1501, 2015/1502, etc. |
| `gdpr` | 2016/679 |
| `dora` | 2022/2554 |
| `arf` | **Cross-cutting** — any requirement with `arfReference` |

**⚠️ ARF is cross-cutting:** Requirements with `arfReference` are counted in BOTH their legal source AND in ARF. This means:
- A requirement with `legalBasis: 2014/910` AND `arfReference: {topic: "Topic 7", hlr: "VCR_01"}` appears in BOTH eIDAS (116) AND ARF (78)
- The tile counts (116 + 28 + 78) sum to more than total unique requirements (144) because of this overlap

**Relevant file:** `docs-portal/scripts/build-vcq.js`, function `determineSourceGroup()`

### Valid VCQ Categories (13 total)

Requirements must use one of these category IDs:

| Category ID | Description |
|-------------|-------------|
| `data_governance` | Data handling and storage |
| `identity_verification` | User identity proofing |
| `interoperability` | Cross-system compatibility |
| `operational_security` | Runtime security measures |
| `privacy` | GDPR, data protection |
| `cryptographic` | Cryptographic operations |
| `wallet_integration` | EUDIW integration |
| `credential_management` | Attestation lifecycle |
| `technical` | Formats, protocols, APIs |
| `compliance` | Regulatory alignment |
| `transparency` | Disclosure, policies |
| `governance` | Staffing, procedures |
| `liability` | Insurance, legal effects |

**⚠️ Common mistake:** Using `notification` instead of `transparency`. These are equivalent — use `transparency`.

**Validation:** `npm run validate:vcq` checks category validity.

### arfReference Schema

The `arfReference` field links a VCQ requirement to ARF HLRs:

```yaml
# Single HLR (string format)
arfReference:
  topic: "Topic 7"
  hlr: "VCR_01"

# Multiple HLRs (array format) — preferred for multi-HLR coverage
arfReference:
  topic: "Topic 7"
  hlr: ["VCR_01", "VCR_02", "VCR_03"]
```

**Both formats are valid.** The build script and validators handle both.

**⚠️ YAML Array Gotcha:** When appending to YAML files via shell `cat >>`, you create strings, NOT arrays:

```bash
# ❌ WRONG — creates: hlr: "VCR_01, VCR_02" (a single string)
cat >> file.yaml << EOF
  hlr: VCR_01, VCR_02
EOF

# ✅ CORRECT — creates proper array
cat >> file.yaml << EOF
  hlr:
    - VCR_01
    - VCR_02
EOF
```

### deploymentArchitectures Schema (DEC-289)

The `deploymentArchitectures` field tags a VCQ requirement to specific connector deployment models:

```yaml
# Agnostic (applies to all architectures) — omit field or leave empty
deploymentArchitectures: []

# Architecture-specific (applies only to listed models)
deploymentArchitectures:
  - intermediary
  - direct_saas
  - direct_onprem
```

| Value | Badge | Color | Description |
|-------|-------|-------|-------------|
| `intermediary` | INT | Blue (#3b82f6) | Vendor acts as RP on behalf of customer |
| `direct_saas` | SaaS | Purple (#8b5cf6) | Vendor provides hosted connector, customer is RP |
| `direct_onprem` | OnPrem | Emerald (#10b981) | Customer deploys vendor software on own infra |

**Filtering logic:** Union semantics. A requirement appears if ANY of its architectures match the selected filter. Agnostic requirements (empty/absent field) always appear.

**Visibility:** Step 2b only renders when Role=Relying Party AND Category=Connector. Schema defined in `config/vcq/vcq-config.yaml` under `deploymentArchitectures`.

### VCQ Export Formats

| Format | Button | File Type | Features |
|--------|--------|-----------|----------|
| **Markdown** | 📝 Export Markdown | `.md` | Human-readable, includes explanations |
| **Excel** | 📊 Export Excel | `.xlsx` | 3 sheets (Summary, Requirements, Legal References), styled columns, obligation colors |

**Excel export features:**
- Summary sheet with status counts and obligation breakdown
- Requirements sheet with ARF Reference column
- Legal References sheet with full legal text
- Color-coded status badges (Compliant/Non-Compliant/Pending)
- Obligation styling (MUST = red, SHOULD = yellow, MAY = green)

**Relevant files:**
- `docs-portal/src/utils/vcq/exportExcel.js` — Excel export utility
- `docs-portal/src/pages/VendorQuestionnaire.jsx` — ExportPanel component

---

## Git Workflow

Uses **conventional commits**:
- `feat:` - New document added
- `fix:` - Corrections to content/formatting
- `docs:` - Documentation updates
- `chore:` - Maintenance tasks

### ⚠️ MANDATORY: Push immediately after every commit

**Every `git commit` MUST be immediately followed by `git push`.**

```bash
# ✅ CORRECT — always commit + push together
git add -A && git commit -m "feat: description" && git push

# ❌ WRONG — NEVER accumulate local commits without pushing
git commit -m "feat: first change"
git commit -m "fix: second change"   # ← local-only, divergence risk
git commit -m "chore: third change"  # ← will cause rebase conflicts
git push                             # ← TOO LATE, remote may have diverged
```

**Why:** Accumulated local commits cause branch divergence when VS Code's git
sync, file watchers, or other agents push to the same remote. Generated files
(e.g., `vcq-data.json`, `metadata.json`) change on every build, causing
merge conflicts during rebase that are extremely painful to resolve manually.

**Rule:** One commit → one push. No exceptions.

---

*Last updated: 2026-02-10*
