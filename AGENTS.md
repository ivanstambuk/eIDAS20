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
| **ARF Data Model** | [.agent/docs/architecture/arf-data-model.md](.agent/docs/architecture/arf-data-model.md) |
| **VCQ Architecture** | [.agent/docs/architecture/vcq-architecture.md](.agent/docs/architecture/vcq-architecture.md) |
| **RCA Reference** | [.agent/docs/architecture/rca-reference.md](.agent/docs/architecture/rca-reference.md) |
| **Link Builder & Deep Links** | [.agent/docs/architecture/link-builder.md](.agent/docs/architecture/link-builder.md) |
| **Portal Gotchas** | [.agent/docs/pitfalls/portal-gotchas.md](.agent/docs/pitfalls/portal-gotchas.md) |
| **Conversion Guidelines** | [.agent/docs/conventions/conversion-guidelines.md](.agent/docs/conventions/conversion-guidelines.md) |
| **Browser Testing** | [.agent/docs/conventions/browser-testing.md](.agent/docs/conventions/browser-testing.md) |
| **Build & Script Reference** | [.agent/docs/conventions/build-reference.md](.agent/docs/conventions/build-reference.md) |
| **Terminology** | [TERMINOLOGY.md](TERMINOLOGY.md) |
| **Design Decisions** | [DECISIONS.md](DECISIONS.md) |
| **Work Tracker** | [TRACKER.md](TRACKER.md) |

---

## ⚠️ Critical Rules (1-24) — Always Enforce

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

### 2. Session Length Guard (MANDATORY — Step 250 Alert)

**When the current Step Id reaches or exceeds 250, you MUST alert the user immediately.**

At the END of your response (before the agent-done notification), include this warning:

```
⚠️ SESSION LENGTH WARNING: We have passed Step 250 (currently at Step {N}).
Context summarization/truncation is imminent. To preserve session learnings:
1. Run /retro workflow to capture decisions, learnings, and progress
2. Run /handover to generate a handover summary
3. Start a fresh session to continue work
```

**This takes priority over all other work.** Even if you are mid-task, include this warning. The user wants to avoid the automatic context truncation that discards earlier conversation history.

**Why this matters:** After ~280 steps the platform truncates earlier conversation turns into a lossy summary ("Checkpoint N"). This destroys detailed context about what was done and why. The /retro workflow captures this systematically before it's lost.

**Anti-patterns:**
- ❌ Continuing past step 250 without alerting the user
- ❌ Mentioning it casually instead of prominently
- ❌ Waiting until truncation has already occurred

---

### 3. Notification + Context Report (EXECUTE — Not Display)

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

### 4. Auto-commit Protocol (MANDATORY)

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

### 5. Clean Chrome Tabs Before browser_subagent (MANDATORY)

**BEFORE calling `browser_subagent`**, clean up accumulated tabs:
```bash
~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh
```

**Why:** Each `browser_subagent` call creates a new tab. After 6+ tabs with SSE connections, the browser's per-origin connection limit is exhausted, causing failures.

**Anti-pattern:** Call browser_subagent 5 times → 5 tabs accumulate → SSE issues
**Correct pattern:** Clean tabs → call browser_subagent → clean tabs → call again

---

### 6. UI/UX Proposals (MANDATORY — Visual Mockups FIRST)

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

### 7. Proactive Prevention Protocol (MANDATORY — After Any Bug Fix)

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

### 8. Route Path Verification (When Generating URLs)

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

### 9. Systematic Solutions Only (MANDATORY — No Workarounds)

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

### 10. AGENTS.md Requires Explicit Approval (MANDATORY)

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

### 11. Clarify Before Acting (MANDATORY — When User Asks Questions)

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

### 12. Recommendations Required (MANDATORY — When Asking Clarifying Questions)

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

### 13. Plans to Files, Not Chat (MANDATORY)

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

### 14. Confirm Feature UX Before Building (MANDATORY)

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

### 15. Verify Terminology Before Creating (MANDATORY — Before New Terms)

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

### 16. Terminology Source Citation (MANDATORY — When Adding to TERMINOLOGY.md)

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

### 17. Custom Dictionary Quality Checklist (MANDATORY — When Updating custom-dictionary.yaml)

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

### 18. WUA Source Authority (Reference)

**For Wallet Unit Attestation topics:**
- **TS3** (Technical Specification 3) is the definitive technical source
- TS3 v1.0 (Aug 2025) explicitly **removed references to presentation WUA** — WUAs are issuance-only
- The Discussion Paper (Topic C) HLRs (WUA_08b/08c) suggesting RP presentation were **superseded**
- The ARF main document §6.5.3.4 confirms: "the Wallet Unit presents the WUA only to PID Providers and Attestation Providers, but not to Relying Parties"

**Key facts:**
- WUAs are NOT presented to Relying Parties
- RPs verify the Wallet Unit through **transitive trust** (issuer signature + device key binding + cascaded revocation)
- AS-WP-09-030: data related to the User device must not be released to RPs

---

### 19. Terminal Hygiene (Awareness)

**When git commands return no output or hang indefinitely:**
1. Check for stale terminal sessions from previous operations
2. Clear git lock if needed: `rm -f .git/index.lock`
3. Kill stuck background terminals before retrying

**Root cause:** Stale terminal sessions from long-running or interrupted commands can block subsequent git operations.

---

### 20. Codebase-First Plan Review (MANDATORY — When Reviewing Plans)

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

### 21. Do It, Don't Suggest It (MANDATORY — Proactive Execution)

**NEVER tell the user to perform an operational task. Do it yourself.**

If a task requires an action to be complete (restart a server, run a build, fix lint errors), you MUST perform that action. The user hired you to do the work, not to generate a TODO list.

**Common violations:**
- ❌ "To see changes, restart the dev server with `npm run dev`"
- ❌ "You'll need to rebuild the search index"
- ❌ "Run `./scripts/lint-md-blockquotes.sh --fix` to fix the linting errors"
- ❌ "Remember to restart the Vite server to pick up new static files"

**Correct behavior:**
- ✅ Kill the old dev server, restart it, verify the new file is served
- ✅ Run the build command, verify it succeeds
- ✅ Run the lint fixer, re-stage the file, commit

**Dev server restart pattern (two separate commands, pinned to port 5173):**
```bash
# Step 1: Kill existing server + clear Tailscale port binding
timeout 5 pkill -f "[v]ite" 2>/dev/null; sleep 1
sudo tailscale serve --https=5173 off 2>/dev/null
sleep 1; echo "cleared"

# Step 2: Start new server (MUST use --strictPort to prevent port drift)
cd ~/dev/eIDAS20/docs-portal && nohup npx vite --host --port 5173 --strictPort > /tmp/vite-eidas.log 2>&1 &
sleep 3; grep -m1 "Local:" /tmp/vite-eidas.log

# Step 3: Re-enable Tailscale proxy
sudo tailscale serve --bg --https 5173 http://localhost:5173
```

**⚠️ Port drift root cause:** Tailscale `serve --https 5173` binds to port 5173 even after Vite exits. When Vite restarts, it sees 5173 occupied and auto-increments to 5174. Always clear Tailscale serve before restarting.

**Why this matters:** Telling the user to perform steps defeats the purpose of an AI agent. If the task isn't complete until a server is restarted, the task isn't complete until YOU restart the server.

**Preferred shortcut:** Use `./scripts/restart-dev-server.sh` instead of manual steps.

---

### 22. Command Safety (MANDATORY — Preventing Hangs)

**Every command that touches the network, processes, or external services MUST have a timeout.**

**Rules:**
1. **`timeout N`** — Wrap `pkill`, `curl`, `lsof`, and process-management commands in `timeout`
2. **`[v]ite` bracket trick** — When using `pkill -f`, use bracket syntax (e.g., `pkill -f "[v]ite"`) to prevent the command from matching its own shell process
3. **`jq` over `python3 -c`** — For JSON inspection, always use `jq` instead of inline Python. Inline Python with nested quotes creates unescapable shell issues. Large JSON files (e.g., `vcq-clarification-questions.json`) will hang indefinitely with `python3 -c`
4. **Split compound commands** — Never combine `pkill` + `start` in a single command. The kill may terminate the shell before the start executes
5. **`--max-time`** — All `curl` calls MUST include `--max-time N` (3s for health checks, 10s for data)
6. **Step completion verification** — Never mark a plan step as `[x]` complete if its sub-objectives are not ALL verified. If a step is partially done, break it into sub-steps with individual completion markers

**Anti-patterns:**
- ❌ `pkill -f "vite"; sleep 2; npx vite` — pkill kills itself
- ❌ `curl -s http://localhost:5173/...` — hangs forever if server is down
- ❌ `python3 -c "import json; ..."` — quote escaping nightmare
- ❌ `cleanup-chrome-tabs.sh` without Chrome running — hangs on CDP connection

**Correct patterns:**
- ✅ `timeout 5 pkill -f "[v]ite" 2>/dev/null || true`
- ✅ `timeout 5 curl -s --max-time 3 http://localhost:5173/...`
- ✅ `jq '.[] | .slug' regulations-index.json`

---

### 23. Root-Cause-First Debugging (MANDATORY — Before Fixing)

**Before applying any fix, diagnose the actual root cause.** Do not fix symptoms.

**Required diagnostic steps:**
1. **Reproduce** — Confirm the failure
2. **Diagnose** — Identify WHY it fails, not just WHAT fails
3. **Fix** — Address the root cause
4. **Verify** — Confirm the fix resolves the issue

**Anti-pattern (symptom chasing):**
```
Port 5174 instead of 5173 → Fix: add --port 5173
Still 5174 → Fix: add --strictPort  
Still 5174 → Fix: found Tailscale holding port (ROOT CAUSE)
Result: 3 commits for 1 fix
```

**Correct approach:**
```
Port 5174 instead of 5173 → Diagnose: sudo lsof -i:5173 → Tailscale holding port
Fix: clear Tailscale serve, then start with --strictPort
Result: 1 commit
```

---

### 24. Split-Objective Tracking (MANDATORY — Multi-Goal Steps)

**When a plan step has 2+ distinct objectives, each objective MUST have independent completion status.**

Do NOT mark a step as "done" when only one of its objectives is complete.

**Required behavior:**
1. When you complete one objective of a multi-objective step, **explicitly state which objective is done and which is not**
2. Create a **dedicated tracker file** for outstanding objectives (`.agent/session/<tracker-name>.md`)
3. Update the plan's status to **🟡 PARTIALLY COMPLETE** (not ✅ or ⬜)

**Why this matters:** Step 6.4 had two objectives (tagging + quality audit). Tagging was completed and the step was nearly marked as done, but the quality audit — the larger, harder objective — was never performed. Without split tracking, future sessions would have assumed the step was fully complete.

**Anti-patterns:**
- ❌ "Step 6.4 done" (when only tagging half completed)
- ❌ Marking a step complete because the tractable objective was finished
- ❌ Relying on the plan document alone without a separate tracker for outstanding work

**Correct pattern:**
- ✅ "Step 6.4: tagging ✅ DONE, quality audit ⬜ NOT STARTED — tracker created at `.agent/session/vcq-quality-audit-tracker.md`"

---

### `documents.yaml` — `sidebarOrder` Field

Documents in the sidebar are sorted by their position in `documents.yaml` (`configOrder`). To override the position of a specific document, add `sidebarOrder: N` (lower = higher in list):

```yaml
- id: ec-eudiw-faq
  sidebarOrder: 0  # Show first in supplementary section
```

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
│   │   ├── architecture/               # Technical architecture docs
│   │   ├── conventions/                # Build, browser testing, conversion
│   │   └── pitfalls/                   # Known gotchas and debugging reference
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

## Port Reference

| Port | Service |
|------|---------|
| **5173** | Vite dev server (docs-portal) |
| **9222** | Chrome CDP (remote debugging) |

---

*Last updated: 2026-02-20*
