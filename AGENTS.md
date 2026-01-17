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
   - ⚠️ **NEVER hardcode or reuse a previous value** — always read fresh from the last XML response
   
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
   
   **Step 4: Defense in Depth (for Build Pipelines)**
   
   When the bug involves a **build pipeline** (data flows through multiple scripts):
   
   1. **Validate at the source** — the script that generates the data
   2. **Validate at consumers** — scripts that depend on that data  
   3. **Add staleness detection** — warn if inputs are newer than outputs
   4. **Verify build chain** — ensure `npm run build` includes ALL steps in correct order
   
   ```
   Example - Terminology Pipeline (actual bug fixed 2026-01-15):
   
   build-terminology.js → terminology.json (validates ≥50 terms)
           ↓
   build-search-index.js → search-index.json (validates terms loaded, staleness check)
           ↓
   build-embeddings.js → embeddings.json (validates terms loaded, staleness check)
   
   ✅ Each script validates: ≥50 terms loaded
   ✅ Each script warns: if inputs newer than output  
   ✅ npm run build: runs ALL scripts in dependency order
   ```
   
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
   
   ✅ Terminology extraction broke (2026-01-15)
      → Added invariant validation (≥50 terms, core terms exist)
      → Added downstream validation in search + embeddings scripts
      → Added staleness detection
      → Fixed npm run build to include all scripts
   
   ✅ Hardcoded document count in UI (2026-01-16)
      → Added generateMetadata() with build-time computation + 3-tier validation
      → Generated metadata.json (510B) with documentCount, buildDate, etc.
      → UI fetches computed stats instead of hardcoding
      → Build fails fast on data integrity issues (DEC-012)
   ```
   
   **Anti-patterns:**
   - ❌ "Fixed the bug" → close without prevention
   - ❌ "Added a TODO to check this later"
   - ❌ Manual verification only ("I checked and it works")
   - ❌ Validate only at source (consumers silently fail with bad data)
   - ❌ Individual scripts work but not chained in `npm run build`
   
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

7. **Systematic Solutions Only (MANDATORY — No Workarounds):**
   
   When fixing any issue, follow this hierarchy:
   
   **Fix at the SOURCE, not downstream:**
   
   | Problem Location | Fix Location |
   |------------------|--------------|
   | **Data generation** (converter, build script) | Fix the generator |
   | **Data structure** (Formex → MD → HTML) | Fix earliest stage possible |
   | **UI rendering** (React component) | Fix the component, not CSS hacks |
   | **Multiple layers affected** | Fix the root cause, then simplify downstream |
   
   **After applying a systematic fix:**
   
   1. **Reconvert/rebuild ALL affected data** — not just the one file you're testing
   2. **Remove ALL workarounds** that the systematic fix replaces
   3. **Simplify downstream code** that was compensating for the upstream issue
   
   **Anti-patterns:**
   - ❌ "Fixed the converter but keeping the JS workaround just in case"
   - ❌ "Applied the fix to one document, will do others later"
   - ❌ "Added a layer to handle this edge case" (when the edge case is a bug upstream)
   
   **Correct pattern:**
   - ✅ Fix converter → Reconvert ALL documents → Remove JS workaround → Verify
   
   **Example - Annex Sibling List Structure (2026-01-17):**
   ```
   # ISSUE: Formex converter produces sibling structure for annexes
   Markdown: "- 1. text\n   - (a) point"
   HTML: <ul><li><ol><li id="para-3">...</ol><ul><li id="point-a">...
   
   The point <ul> is a SIBLING of the paragraph <ol>, not a child.
   This breaks ancestor-based context lookup (findParagraphContext).
   
   # CURRENT STATE: Workaround in rehype plugin
   → lastParagraphInContext tracking handles sibling case
   → Works but is technical debt
   
   # IDEAL FIX: Fix at source (systematic)
   → Fix converter to produce nested Markdown: "1. text\n   (a) point"
   → Reconvert ALL documents
   → Simplify rehype plugin (remove sibling-tracking)
   ```
   
   **Why this matters:**
   - Workarounds accumulate technical debt
   - Multiple fixes for the same issue = maintenance nightmare
   - Systematic fixes benefit ALL documents, not just the one being tested

8. **Infinite Time Principle (MANDATORY):**
   
   **Never consider time constraints, context limits, or tokens when making technical decisions.**
   
   - Work as if you have **infinite time** to complete tasks
   - Do NOT let context window consumption affect solution quality
   - Do NOT take shortcuts due to perceived time pressure
   - Do NOT mention "given time constraints" or similar as justification
   
   **Anti-patterns:**
   - ❌ "Given the time constraints, let me take a pragmatic approach..."
   - ❌ "Since context is running low, I'll simplify..."
   - ❌ "To save time, let's skip the full validation..."
   
   **Why:** Technical debt from rushed solutions costs more than the time "saved." Always implement the correct solution.

9. **AGENTS.md Requires Explicit Approval (MANDATORY):**
   
   **Never modify AGENTS.md without the user's explicit consent.**
   
   - If you believe a rule should be added or changed, **propose it to the user first**
   - Wait for explicit approval before making any changes
   - This applies to ALL modifications: additions, deletions, and edits
   
   **Correct pattern:**
   ```
   "I recommend adding a rule about X. Would you like me to add this to AGENTS.md?"
   [Wait for user approval]
   [Only then make the change]
   ```
   
   **Why:** AGENTS.md defines agent behavior. Changes should be intentional and user-approved, not autonomous.

10. **Clarify Before Acting (MANDATORY — When User Asks Questions):**
    
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
    
    **Correct pattern:**
    - ✅ User asks "Does the header look OK?" → "Looking at it, I notice X and Y. This is/isn't a standard pattern because... Would you like me to adjust it?"
    
    **Why:** Questions are not requests. Acting without clarification wastes time if the user just wanted information, and creates unnecessary work to revert unwanted changes.

11. **React Development Best Practices (MANDATORY):**
    
    ### Unstable Dependency Anti-Pattern
    
    **Problem:** Custom hooks that return new object literals on every render cause infinite loops when used in `useEffect`/`useCallback` dependency arrays.
    
    **Example of the problem:**
    ```javascript
    // ❌ BAD: Hook returns new object every render
    export function useSearch() {
        const [results, setResults] = useState([]);
        
        return {
            results,
            search: (q) => { /* ... */ },
        }; // ← New object reference every render!
    }
    
    // ❌ BAD: Using unstable object in deps
    const searchHook = useSearch();
    useEffect(() => {
        searchHook.search('query');
    }, [searchHook]); // ← Infinite loop! Object changes every render
    ```
    
    **Solution 1: Extract stable function references**
    ```javascript
    // ✅ GOOD: Extract only what you need
    const searchHook = useSearch();
    const searchFn = searchHook.search; // Extract stable function ref
    
    useEffect(() => {
        searchFn('query');
    }, [searchFn]); // ← Only depends on stable function
    ```
    
    **Solution 2: Make hooks return stable objects**
    ```javascript
    // ✅ BETTER: Hook returns stable object
    export function useSearch() {
        const [results, setResults] = useState([]);
        const search = useCallback((q) => { /* ... */ }, []);
        
        // Wrap return in useMemo to ensure stable reference
        return useMemo(() => ({
            results,
            search,
        }), [results, search]);
    }
    ```
    
    **When to apply:**
    - ✅ ALL custom hooks that return objects/arrays
    - ✅ Especially hooks used in other components' dependency arrays
    - ✅ When you see "Maximum update depth exceeded" errors
    
    ### Debugging React Infinite Loops
    
    **When you see: "Maximum update depth exceeded"**
    
    **Step 1: Use browser_subagent to inspect runtime (MANDATORY FIRST STEP)**
    - DO NOT start with manual code inspection
    - The browser console shows the EXACT component and line causing the loop
    - React's error messages include component stack traces
    
    ```bash
    # Clean tabs first
    ~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh
    
    # Then use browser_subagent to capture console errors
    # Look for: component stack trace, which useEffect is triggering
    ```
    
    **Step 2: Identify the pattern**
    - Look for `useEffect` hooks with objects/arrays in dependency arrays
    - Check if those dependencies are created new on every render
    - Common culprits: custom hook return values, inline objects, inline arrays
    
    **Step 3: Fix at the source**
    - If the issue is in a custom hook → add `useMemo` to the hook's return
    - If the issue is in a component → extract stable references
    - NEVER work around it with empty dependency arrays or eslint-disable
    
    **Anti-patterns:**
    - ❌ Starting with manual code review instead of runtime inspection
    - ❌ Checking Layout/Sidebar/Header when error could be in SearchModal
    - ❌ Trusting previous session's diagnosis without verification
    - ❌ Using `// eslint-disable-next-line` to silence warnings
    - ❌ Removing dependencies to "fix" the warning
    
    **Correct pattern:**
    - ✅ browser_subagent → console errors → exact component → fix root cause
    - ✅ Add useMemo/useCallback to make dependencies stable
    - ✅ Add warning comments explaining the pattern
    
    **Real example from 2026-01-16:**
    ```
    Issue: "Maximum update depth exceeded" 
    Previous session: Checked Layout, Sidebar, Header (70 min, wrong components)
    Correct approach: browser_subagent → found SearchModal → unstable hook objects in deps
    Fix: Extract stable function refs + add useMemo to hooks
    Time saved: ~60 minutes by using browser_subagent first
    ```
    
    ### React Router Link Event Handlers
    
    **Problem:** Need to execute code before React Router navigates to a new page (e.g., save state, analytics).
    
    **❌ WRONG: DOM event listeners don't work with React Router `<Link>`**
    ```javascript
    // This DOES NOT WORK - event listener won't fire!
    useEffect(() => {
        const links = document.querySelectorAll('a[href^="/"]');
        links.forEach(link => {
            link.addEventListener('click', handleClick);  // Never fires!
        });
        
        return () => {
            links.forEach(link => {
                link.removeEventListener('click', handleClick);
            });
        };
    }, []);
    ```
    
    **✅ CORRECT: Use onClick prop on Link component**
    ```javascript
    import { Link } from 'react-router-dom';
    
    function MyComponent() {
        const handleLinkClick = () => {
            // This runs BEFORE navigation
            sessionStorage.setItem('scrollPosition', window.scrollY);
        };
    
        return (
            <Link to="/other-page" onClick={handleLinkClick}>
                Navigate
            </Link>
        );
    }
    ```
    
    **Why this matters:**
    - React Router's `<Link>` intercepts clicks programmatically
    - It prevents default browser navigation and uses History API
    - DOM event listeners added via `addEventListener` won't receive the events
    - You **must** use the `onClick` prop on the `<Link>` component itself
    
    **Real example from 2026-01-16:**
    ```
    Issue: Need to save scroll position before navigating from Terminology page
    Wrong approach: Add click event listeners to all links in useEffect (~15 min wasted)
    Correct approach: Add onClick={handleSaveScroll} to Link components  
    Result: Works immediately, cleaner code
    ```
    
    **See also:** `.agent/snippets/react-patterns.md` for scroll restoration pattern using this technique.

12. **DOM-First Debugging (MANDATORY — UI/Navigation Issues):**
    
    **When debugging UI rendering or navigation issues, ALWAYS verify the actual browser DOM state BEFORE proposing solutions.**
    
    **Trigger conditions:**
    - Deep linking not working
    - Elements not scrolling into view
    - Missing IDs or classes
    - Routing issues
    - Any "it should work but doesn't" scenario
    
    **Correct pattern:**
    1. **FIRST:** Use `browser_subagent` to inspect actual DOM
    2. **VERIFY:** Check what HTML is actually rendered (not what you expect)
    3. **IDENTIFY:** Find the root cause from runtime state
    4. **THEN:** Propose solution based on evidence
    
    **Anti-patterns:**
    - ❌ "The ID should be article-2-para-1, let me update the link"
    - ❌ Assuming code logic produces expected HTML
    - ❌ Multiple iterations fixing symptoms instead of root cause
    
    **Correct pattern:**
    - ✅ browser_subagent → inspect DOM → find article-2 has no IDs → investigate why → fix rehype plugin
    
    **Real example from 2026-01-16:**
    ```
    Issue: Terminology links don't scroll to definitions
    Assumption: Link format is wrong (used # instead of ?)
    Reality (from DOM): Article 2 definitions have NO paragraph IDs at all
    Root cause: rehype plugin only processes <ol>, but Article 2 uses <ul>
    Fix: Extend rehype plugin to process both <ol> and <ul>
    Time saved: ~10 min by checking DOM first instead of 3 iterations on link format
    ```
    
    **Why this matters:** The DOM is the source of truth. Assumptions about what "should" be rendered waste time when the actual HTML is different.

13. **Legal Structure Preservation (MANDATORY — Legal Documents):**
    
    **NEVER modify the structure of legal documents. List types, numbering, and formatting have legal significance.**
    
    **Rules:**
    - ❌ NEVER change `<ul>` to `<ol>` or vice versa
    - ❌ NEVER change numbering schemes (1,2,3 vs a,b,c vs i,ii,iii)
    - ❌ NEVER reorder paragraphs or sections
    - ✅ ONLY add IDs, classes, or attributes for functionality
    - ✅ ALWAYS preserve the original document structure from EUR-Lex XML
    
    **Why this matters:**
    - Legal references cite specific paragraph numbers (e.g., "Article 2(1)")
    - Changing list types could alter legal interpretation
    - We must faithfully represent the official legal text
    
    **If a feature requires a specific structure:**
    - ✅ Adapt the feature to work with both structures
    - ❌ Never change the legal document to fit the feature
    
    **Real example from 2026-01-16:**
    ```
    Issue: Deep linking needs paragraph IDs, but Article 2 uses <ul> 
    Wrong approach: "Change converter to output <ol> for Article 2"
    Correct approach: "Extend rehype plugin to also process <ul> while preserving list type"
    ```
    
    **Why this matters:** We're building a reference tool, not editing the law. Accuracy and fidelity to source documents is paramount.

14. **Git Checkout Safety (MANDATORY — Testing with Temporary Changes):**
    
    **NEVER use `git checkout <file>` to revert test changes if you have uncommitted work in that file.**
    
    **Problem scenario:**
    ```bash
    # You edit documents.yaml (intended changes)
    # Then temporarily break it to test validation
    # Then run: git checkout scripts/documents.yaml  
    # ❌ OOPS! All your intended changes are gone!
    ```
    
    **Safe patterns for testing:**
    
    1. **Copy before testing:**
       ```bash
       cp scripts/documents.yaml /tmp/backup.yaml
       # Make test changes
       # Run test
       mv /tmp/backup.yaml scripts/documents.yaml
       ```
    
    2. **Use git stash (if already committed once):**
       ```bash
       git stash
       # Make test changes
       # Run test
       git stash pop
       ```
    
    3. **Create test in temporary location:**
       ```bash
       mkdir /tmp/test_regulation
       # Run test with temp files
       rm -rf /tmp/test_regulation
       ```
    
    **Anti-patterns:**
    - ❌ `git checkout <file>` when file has uncommitted intended changes
    - ❌ Assuming `git checkout` only reverts last edit (it reverts ALL uncommitted changes)
    
    **Why this matters:** Lost work costs significant time to recreate and risks missing details.

15. **Vocabulary Confirmation (MANDATORY — When User Uses UI/Domain Terms):**
    
    **When the user requests a feature using UI or domain terminology, CONFIRM your understanding before implementing.**
    
    **Trigger phrases (UI terms that could be ambiguous):**
    - \"popover\", \"tooltip\", \"hover\"
    - \"gutter\", \"sidebar\", \"panel\"
    - \"link\", \"reference\", \"citation\"
    - \"recital\", \"article\", \"provision\"
    - Any term defined in TERMINOLOGY.md
    
    **Correct pattern:**
    1. **FIRST:** State what you understand the request to mean
    2. **REFERENCE:** TERMINOLOGY.md definitions if applicable
    3. **CONFIRM:** Ask \"Is this what you mean?\" before implementing
    
    **Example:**
    ```
    User: \"Add popovers for recitals\"
    
    ❌ WRONG: Start implementing citation popovers in recital text
    
    ✅ CORRECT: \"Do you mean:
       (A) Gutter icons (🔗 📜) on individual recitals for copying links/references, or
       (B) Citation popovers when hovering legislation references within recitals?
       (See TERMINOLOGY.md: 'Gutter Icons' vs 'Citation Popover')\"
    ```
    
    **Why this matters:** Ambiguous vocabulary causes wasted implementation time. The TERMINOLOGY.md exists specifically to resolve these ambiguities.

16. **TERMINOLOGY.md Maintenance (MANDATORY — Living Document):**
    
    **Proactively update TERMINOLOGY.md when new concepts are introduced or existing ones change.**
    
    **When to update:**
    - Adding a new UI component → Add to \"UI Components\" section
    - Adding a new data structure → Add to \"Data Model\" section
    - Adding a new CSS class → Add to \"Linkable Elements\" table
    - Discovering term ambiguity → Add clarification or both meanings
    - User corrects a misunderstanding → Document the distinction
    
    **Update protocol:**
    1. After implementing a new feature, check if new terms were introduced
    2. Add definitions for any new terms to appropriate section
    3. Include the TERMINOLOGY.md update in the same commit
    
    **Anti-patterns:**
    - ❌ Implementing without updating terminology
    - ❌ Creating internal-only naming that isn't documented
    - ❌ Using different terms for the same concept across files
    
    **Why this matters:** TERMINOLOGY.md is the project's vocabulary source of truth. Keeping it current prevents future miscommunication.

17. **CSS Flex Gap with Inline Text (PITFALL):**
    
    **Problem:** When using `display: flex` with `gap`, the gap is applied between ALL child nodes, including text nodes.
    
    **Example of the bug:**
    ```jsx
    // ❌ BAD: gap adds space before comma
    <div style={{ display: 'flex', gap: '0.5rem' }}>
        <strong>Title</strong>, subtitle
    </div>
    // Renders: "Title   , subtitle" (unwanted space before comma)
    ```
    
    **Solution:** Wrap adjacent inline content in a single element:
    ```jsx
    // ✅ GOOD: wrap in single span
    <div style={{ display: 'flex', gap: '0.5rem' }}>
        <span><strong>Title</strong>, subtitle</span>
    </div>
    // Renders: "Title, subtitle" (correct)
    ```
    
    **Why:** Flex treats `<strong>Title</strong>` and `, subtitle` as two flex items, applying `gap` between them. Wrapping in `<span>` creates a single flex item.
    
    **Real example from 2026-01-17:**
    ```
    Issue: Terminology source headers showed "Regulation 765/2008   , Article 2:"
    Root cause: flex gap between <strong> and text node
    Fix: Wrap in <span><strong>...</strong>, Article...</span>
    ```

18. **EU Regulation Numbering Formats (EC vs EU):**
    
    **Older regulations (pre-2009) use `(EC)`, newer use `(EU)`:**
    
    | Era | Format | Example |
    |-----|--------|---------|
    | Pre-2009 | Regulation (EC) No X/YYYY | Regulation (EC) No 765/2008 |
    | Post-2009 | Regulation (EU) X/YYYY | Regulation (EU) 910/2014 |
    
    **When writing regex patterns for regulation references:**
    ```javascript
    // ❌ BAD: Only matches EU regulations
    /Regulation \(EU\) (?:No )?(\d+\/\d+)/
    
    // ✅ GOOD: Matches both EC and EU
    /Regulation \((?:EU|EC)\) (?:No )?(\d+\/\d+)/
    ```
    
    **Why this matters:** The eIDAS ecosystem references older EC regulations (like 765/2008 for accreditation). Patterns that only handle `(EU)` will miss these references.
    
    **CELEX Year/Number Position Variations:**
    
    | Era | Citation Format | CELEX Construction |
    |-----|-----------------|-------------------|
    | Pre-2014 | Regulation No **NNN/YYYY** (number first) | `3{YYYY}R{NNNN}` |
    | Post-2014 | Regulation **YYYY/NNN** (year first) | `3{YYYY}R{NNNN}` |
    
    **Example:**
    ```
    "Regulation (EC) No 910/2014" → number=910, year=2014 → CELEX: 32014R0910
    "Regulation (EU) 2024/1183" → year=2024, number=1183 → CELEX: 32024R1183
    ```
    
    **Why this matters:** Citation parsers must handle BOTH formats. The 4-digit block ≥1990 is typically the year, but position varies by era.
    
    **Citation Cache Invalidation:**
    
    When updating `legislation-metadata.js`, you must force-rebuild citations:
    ```bash
    rm -f docs-portal/public/data/citations/*.json
    cd docs-portal && node scripts/build-citations.js
    ```
    
    **Why:** The citation cache uses content hash but doesn't track metadata registry changes. Cached citations won't reflect new metadata until manually purged.

19. **⛔ Legal Document Visual Fidelity (ABSOLUTE — No Exceptions):**
    
    **NEVER modify the visual notation or formatting of legal text without EXPLICIT USER APPROVAL.**
    
    This rule has **no exceptions** and applies to:
    
    | Element | Example | Prohibition |
    |---------|---------|-------------|
    | **Paragraph numbering format** | `3.` vs `(3)` vs `3)` | ❌ NEVER convert between formats |
    | **Term quoting style** | `'term'` vs `"term"` | ❌ NEVER change quote style |
    | **Definition syntax** | `means` vs `shall mean` | ❌ NEVER modernize language |
    | **Numbering gaps** | 3, 4, 8, 9... | ❌ NEVER renumber to fill gaps |
    | **Letter casing** | ANNEX vs Annex | ❌ NEVER change casing |
    
    **Why this is ABSOLUTE:**
    - Legal citations reference exact text ("...as defined in Article 2(3)...")
    - Different regulations use different notation (EC era vs EU era)
    - We are a **mirror** of official legislation, not an editor
    
    **Correct pattern when format causes technical issues:**
    1. **STOP** — Do not modify the legal text
    2. **EXPLAIN** — "The `N.` format causes [technical issue]"
    3. **PROPOSE** — "I can solve this by [modifying the build pipeline / using HTML / etc.]"
    4. **WAIT** — Get explicit approval before ANY change to legal content
    
    **Anti-patterns:**
    - ❌ Converting `3. 'manufacturer'` to `(3) 'manufacturer'` for consistency
    - ❌ Escaping characters (`3\.`) to work around markdown parsing
    - ❌ Any "normalization" of legal text for technical convenience
    
    **This rule supersedes:** Convenience, consistency, technical simplicity. The legal text is sacred.
    
    **Real example from 2026-01-17:**
    ```
    Issue: Deep linking needed IDs, but markdown renumbered "3, 4, 8, 9..." to "3, 4, 5, 6..."
    WRONG approach: Convert "3." to "(3)" to match eIDAS format
    WRONG approach: Escape period "3\." to prevent markdown parsing
    CORRECT approach: Use raw HTML to preserve exact notation while enabling deep linking
    ```

20. **Markdown Numbered List Renumbering (PITFALL):**
    
    **Problem:** Markdown renumbers non-consecutive numbered lists.
    
    **Example:**
    ```markdown
    3. First item
    4. Second item
    8. Third item (gap!)
    9. Fourth item
    ```
    
    **Rendered HTML becomes:**
    ```html
    <ol start="3">
      <li>First item</li>   <!-- Actually 3 -->
      <li>Second item</li>  <!-- Actually 4 -->
      <li>Third item</li>   <!-- Becomes 5, NOT 8! -->
      <li>Fourth item</li>  <!-- Becomes 6, NOT 9! -->
    </ol>
    ```
    
    **Why this matters:** Legal documents have non-consecutive paragraph numbers (provisions are repealed, leaving gaps). If you rely on markdown list numbering, the rendered IDs won't match the source numbers.
    
    **Solution:** For non-consecutive legal lists, use raw HTML with explicit IDs:
    ```html
    <ul class="legal-definitions">
    <li id="article-2-para-8">8. 'technical specification' means...</li>
    </ul>
    ```
    
    **Real example:** Regulation 765/2008 Article 2 has definitions 3, 4, 8, 9, 10... (gaps due to repealed provisions). See DEC-057.

21. **Client-Side Tracing (Debugging Long-Running Issues):**
    
    **The portal includes a built-in tracing system for debugging.** Use it when issues persist across sessions or involve complex state.
    
    **Enable tracing:**
    - URL: `?debug=scroll` or `?debug=true` (all namespaces)
    - Console: `window.enableTrace('scroll')` or `window.enableTrace('*')`
    - Persistent: `localStorage.setItem('debug', 'scroll')`
    
    **Add traces to code:**
    ```javascript
    import { trace } from '../utils/trace';
    
    // Log state for debugging (zero-cost when disabled)
    trace('scroll:restore', { isBackForward, savedScrollY, scrollHeight });
    ```
    
    **Available namespaces:**
    | Namespace | Feature |
    |-----------|---------|
    | `scroll` | Scroll position save/restore |
    | `nav` | Navigation and routing |
    | `search` | Search functionality |
    
    **When to add traces:**
    - Complex conditional logic (especially boolean conditions)
    - State that changes across navigations
    - Async operations with timing dependencies
    - Any feature that has broken unexpectedly
    
    **Real example from 2026-01-17:**
    ```
    Bug: Scroll restoration not working
    Without traces: Spent 2+ hours trying timing fixes (setTimeout, RAF)
    With traces: Would have immediately shown isBackForward: false
    Root cause: Performance API doesn't track SPA navigation
    ```

22. **SPA API Pitfalls (Browser APIs That Don't Work in SPAs):**
    
    **Many browser APIs don't work as expected in Single Page Applications.** Always verify API behavior in SPA context.
    
    | API | Expected Behavior | Actual SPA Behavior |
    |-----|-------------------|---------------------|
    | `performance.getEntriesByType('navigation')` | Updates on each navigation | Only reflects initial page load |
    | `window.onbeforeunload` | Fires before leaving | Doesn't fire for SPA navigation |
    | `document.referrer` | Previous page URL | Static from initial load |
    | `history.length` | Navigation count | Includes SPA navigations (works) |
    
    **Why this happens:** SPAs handle navigation client-side via the History API without loading a new document. APIs that rely on "document load" events only fire on the initial page load.
    
    **Correct pattern:** Use framework-provided alternatives:
    ```javascript
    // ❌ WRONG: Browser API (doesn't track SPA navigation)
    const isBack = performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
    
    // ✅ CORRECT: React Router hook (tracks client-side navigation)
    const navigationType = useNavigationType(); // 'POP' | 'PUSH' | 'REPLACE'
    const isBack = navigationType === 'POP';
    ```
    
    **Before using any browser API for navigation/history:**
    1. Ask: "Does this API rely on document load events?"
    2. If yes: Look for a framework alternative
    3. Test: Verify with traces to ensure it works in SPA context

23. **React Router Built-in Hooks (Use Before Custom):**
    
    **React Router provides hooks that replace many custom implementations.** Check if a built-in hook exists before writing custom code.
    
    | Need | React Router Hook | Return Value |
    |------|-------------------|--------------|
    | Navigation type | `useNavigationType()` | `'POP'` \| `'PUSH'` \| `'REPLACE'` |
    | Current location | `useLocation()` | `{ pathname, search, hash, state }` |
    | URL params | `useParams()` | `{ paramName: value }` |
    | Search params | `useSearchParams()` | `[searchParams, setSearchParams]` |
    | Navigate function | `useNavigate()` | `navigate(to, options)` |
    | Match info | `useMatch(pattern)` | Match object or null |
    
    **Anti-pattern:**
    ```javascript
    // ❌ WRONG: Custom hook using Performance API
    function useNavigationType() {
        const entries = performance.getEntriesByType('navigation');
        return entries[0]?.type; // Doesn't work for SPA!
    }
    
    // ✅ CORRECT: Use React Router's built-in hook
    import { useNavigationType } from 'react-router-dom';
    ```
    
    **Real example from 2026-01-17:**
    ```
    Bug: Custom useNavigationType hook always returned initial load type
    Root cause: Used browser's Performance API instead of React Router
    Fix: Replace custom hook with react-router-dom's useNavigationType
    Time saved: Would have avoided 2+ hours debugging across sessions
    ```

24. **Scroll Restoration: Wait for DOM Height (SPA Pitfall):**
    
    **`window.scrollTo()` silently fails if the DOM doesn't have enough content height.** This is a common SPA issue when restoring scroll position after back navigation.
    
    **Why it fails:**
    1. Component mounts, triggers scroll restoration effect
    2. Effect calls `window.scrollTo(0, 1200)`
    3. But DOM only has ~500px of content rendered so far
    4. Browser silently clamps to max scrollable height (0)
    5. Content finishes rendering at 2000px — but scroll already happened at 0
    
    **Solution: Poll for sufficient height before scrolling:**
    ```javascript
    // ❌ WRONG: Double-RAF alone is not enough for long content
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            window.scrollTo(0, scrollY);  // Often fails!
        });
    });
    
    // ✅ CORRECT: Wait for document to be tall enough
    const checkAndScroll = () => {
        const canScroll = document.documentElement.scrollHeight > scrollY + window.innerHeight;
        if (canScroll) {
            window.scrollTo(0, scrollY);
        } else {
            requestAnimationFrame(checkAndScroll);  // Retry
        }
    };
    requestAnimationFrame(() => requestAnimationFrame(checkAndScroll));
    ```
    
    **This project's solution:** Use the shared `useScrollRestoration` hook from `src/hooks/useScrollRestoration.js`, which implements this pattern with automatic retries and tracing.
    
    **Real example from 2026-01-17:**
    ```
    Bug: RegulationViewer scroll restoration failing on back navigation
    Debug showed: window.scrollTo(0, 1200) was called, but window.scrollY stayed 0
    Root cause: DOM height was ~500px when scrollTo fired
    Fix: Polling approach that waits for scrollHeight > targetY + viewportHeight
    Time wasted: ~20 min (same bug was fixed in Terminology.jsx in prior session)
    Prevention: Extracted to shared useScrollRestoration hook
    ```

25. **CSS Debug Mode (Visual Element Debugging):**
    
    **The portal includes visual CSS debugging to inspect element boundaries and class assignments.**
    
    **Enable CSS debug mode:**
    - URL: `?debug=css` (default modes) or `?debug=css:linkables,css:gutters`
    - Console: `window.enableCSSDebug()` or `window.enableCSSDebug('gutters')`
    - Toggle: `window.toggleCSSDebug('linkables')`, `window.cssDebugStatus()`
    
    **Available modes:**
    | Mode | What It Shows |
    |------|---------------|
    | `linkables` | Paragraph (red), point (blue), subpoint (green), recital (orange) outlines |
    | `gutters` | Gutter icon containers (yellow background) |
    | `citations` | Citation reference links (cyan) |
    | `structure` | Article and chapter headings (purple/pink) |
    | `hover` | Thicker outline on currently hovered element |
    | `legend` | Color legend in bottom-right corner |
    | `all` | Enable all modes |
    
    **When to use:**
    - Verifying correct class assignment after build
    - Debugging hover/interaction issues
    - Understanding element nesting hierarchy
    - Checking gutter icon positioning
    
    **Real example from 2026-01-17:**
    ```
    Bug: Duplicate gutter icons appearing on nested points
    Without CSS debug: Hard to see which elements had which classes
    With CSS debug: Would have immediately shown all elements were RED 
                    (linkable-paragraph) when points should be BLUE
    Root cause: rehype plugin assigned wrong class to nested lists
    ```
    
    **See also:** `src/utils/debugCSS.js` for implementation details.

26. **AST Traversal Pitfall: Ancestors Don't Include Current Node:**
    
    **When using `visitParents` or similar AST visitors, the `ancestors` array does NOT include the current node.**
    
    ```javascript
    // ❌ WRONG: Node is never in its own ancestors!
    visitParents(tree, 'element', (node, ancestors) => {
        const index = ancestors.findIndex(a => a === node);
        // index is ALWAYS -1! The node is not its own ancestor.
    });
    
    // ✅ CORRECT: Ancestors are the PARENTS of the node
    visitParents(tree, 'element', (node, ancestors) => {
        // ancestors[0] = root, ancestors[last] = direct parent of node
        const hasListAncestor = ancestors.some(a => 
            a.type === 'element' && ['ul', 'ol', 'li'].includes(a.tagName)
        );
    });
    ```
    
    **Why this matters:** This caused a subtle bug in `rehype-paragraph-ids.js` where `isTopLevelList()` always returned `true` because the check for the node in ancestors always failed.
    
    **Real example from 2026-01-17:**
    ```
    Bug: All <ul> elements treated as top-level paragraphs
    Wrong code: ancestors.findIndex(a => a === node) → always -1 → return true
    Fix: Check if ANY ancestor is ul/ol/li (don't look for current node)
    Result: Nested lists now correctly get linkable-point class
    ```

27. **Formex Archive Structure (EUR-Lex XML Downloads):**
    
    **Formex ZIP archives contain multiple XML files with specific naming patterns:**
    
    | Pattern | Description | Example |
    |---------|-------------|---------|
    | `.000101.fmx.xml` | **Main document** (regulation body) | `L_202402982EN.000101.fmx.xml` |
    | `.000XYZ.fmx.xml` | **Supplementary content** (annexes) | `L_202402982EN.000701.fmx.xml` |
    | `.doc.fmx.xml` | Document metadata (skip) | `L_202402982EN.doc.fmx.xml` |
    | `.toc.fmx.xml` | Table of contents (skip) | `L_202402982EN.toc.fmx.xml` |
    | `.0001.xml` | Alternative main pattern (consolidated) | `CL2014R0910EN0020030.0001.xml` |
    
    **Important:** Annexes are stored in **separate XML files**, not embedded in the main document. A regulation with 5 annexes will have 6+ XML files in the archive.
    
    **Example: 2024/2981 (Certification)**
    ```
    32024R2981.fmx4.zip contains:
    - L_202402981EN.000101.fmx.xml  ← Main document
    - L_202402981EN.001801.fmx.xml  ← ANNEX I
    - L_202402981EN.003101.fmx.xml  ← ANNEX II
    - L_202402981EN.003301.fmx.xml  ← ANNEX III
    ... (9 annexes total)
    ```
    
    **Pipeline validation:** The pipeline validates that if annex XML files are found, the output markdown contains `## Annex` headings. See `validate_annex_extraction()` in `pipeline.py`.

28. **Fix Cause, Not Symptom (MANDATORY — After Any Bug Fix):**
    
    **When fixing issues, always address the ROOT CAUSE in the permanent codebase, not just the symptoms.**
    
    **Anti-pattern: One-Time Fix Script**
    ```bash
    # ❌ WRONG: One-time script fixes current data but doesn't fix the pipeline
    python batch_fix_annexes.py  # Fixes 20 documents
    rm batch_fix_annexes.py      # Script deleted
    # Next pipeline run: Same 20 documents are broken again!
    ```
    
    **Correct pattern: Systemic Fix**
    ```bash
    # ✅ CORRECT: Fix the pipeline itself
    # 1. Identify root cause (pipeline only extracts main XML, ignores annexes)
    # 2. Fix the pipeline (extract_formex returns all XML files)
    # 3. Add validation (prevent regression)
    # 4. Re-run pipeline (all documents now correct)
    ```
    
    **Decision framework:**
    
    | Question | If Yes → | If No → |
    |----------|----------|---------|
    | Will the issue recur if the pipeline runs again? | Fix the pipeline | One-time script OK |
    | Does the fix need to apply to future documents? | Fix the pipeline | One-time script OK |
    | Does the fix involve data transformation logic? | Fix the converter | One-time script OK |
    
    **Real example from 2026-01-17:**
    ```
    Issue: 27 implementing acts missing annexes
    One-time fix (Jan 14): batch_fix_annexes.py — fixed symptoms, deleted script
    Systemic fix (Jan 17): Fixed pipeline.py extract_formex() + added validation
    Result: All documents correct on every pipeline run, permanently
    ```
    
    **Why this matters:** One-time fixes create technical debt and confusion. Future sessions see stale TRACKER entries referencing deleted scripts, wasting investigation time.

29. **Script Deletion Checklist (MANDATORY — Before Removing Fix Scripts):**
    
    **Before deleting any one-time fix script, verify the root cause was addressed:**
    
    | Check | Question |
    |-------|----------|
    | ✅ Pipeline fixed? | Did we modify the build/conversion pipeline to prevent recurrence? |
    | ✅ Validation added? | Is there automated validation that would catch this issue? |
    | ✅ All documents rebuilt? | Did we re-run the pipeline on ALL affected documents? |
    | ✅ TRACKER updated? | Did we remove any backlog items that reference this script? |
    
    **If ANY check fails:** The root cause was NOT fixed. Either:
    1. Keep the script (document why in comments), OR
    2. Fix the root cause first, THEN delete the script
    
    **Anti-pattern:**
    ```bash
    # ❌ WRONG: Delete script without fixing root cause
    git commit -m "chore: remove obsolete one-time fix scripts"
    # Weeks later: "Why are annexes missing? TRACKER says run batch_fix_annexes.py..."
    ```
    
    **Why this matters:** Deleting symptom-fix scripts without addressing root causes creates orphaned documentation, wasted investigation time, and recurring bugs.

30. **Build Script Cache Invalidation (GOTCHA):**
    
    **Build scripts with hash-based caching (like `build-citations.js`) only detect SOURCE CONTENT changes, not SCRIPT LOGIC changes.**
    
    **Problem:**
    ```bash
    # You fix a bug in build-citations.js (e.g., route path typo)
    # You run: node scripts/build-citations.js
    # Output: "⚡ Cache hits: 33" — all files skipped!
    # The fix wasn't applied because source markdown didn't change
    ```
    
    **Solution in this project:**
    
    1. **Bump CACHE_VERSION** in the build script when changing output-affecting logic:
       ```javascript
       // In build-citations.js (and similar scripts with caching)
       const CACHE_VERSION = '1.0.2';  // Bump this when you change script logic
       ```
    
    2. **Manual cache clear** if you forget to bump version:
       ```bash
       rm public/data/citations/*.json && node scripts/build-citations.js
       ```
    
    **Scripts with this pattern:**
    - `build-citations.js` — uses `CACHE_VERSION` in hash computation
    
    **Real example from 2026-01-17:**
    ```
    Bug: Fixed /regulations/ → /regulation/ in build-citations.js
    Problem: Ran build, but cached JSON still had old URLs
    Root cause: Hash only checked source markdown, not script logic
    Fix: Added CACHE_VERSION to hash + cleared cache manually
    Time lost: ~10 min debugging why fix wasn't applied
    ```
    
    **Route Path Convention:**
    This project uses **singular** route paths:
    - ✅ `/regulation/` (not `/regulations/`)
    - ✅ `/implementing-acts/` (already correct)
    
    Routes are defined via `ROUTES` constants in `build-citations.js`.

31. **Directory Naming Gotcha (02_implementing_acts/):**
    
    **Folder names in `02_implementing_acts/` don't always match the CELEX number or document title exactly.**
    
    **Example:**
    ```
    CELEX: 32025R0848
    Document: "Wallet-Relying Party Registration"
    Folder: 2025_0848_Notified_Wallet_List/  ← Name doesn't match!
    ```
    
    **Why this matters:** When searching for a document by CELEX, use `find` or `grep` with partial match:
    ```bash
    find 02_implementing_acts -name "*0848*" -type d
    ```
    
    **Don't assume:** Folder name = document title. The folder names were set during initial project setup and may use short names or earlier draft titles.

32. **Inline vs Standalone QUOT.* Detection (Formex Converter):**
    
    **QUOT.START/QUOT.END elements can appear in two contexts with different rendering:**
    
    | Context | Example XML | Rendered As |
    |---------|-------------|-------------|
    | **Inline** (abbreviation) | `...interface (<QUOT.START/>API<QUOT.END/>)` | `...interface ('API')...` |
    | **Standalone** (amendment) | `<ALINEA><QUOT.S><P>Replacement text</P></QUOT.S></ALINEA>` | `> Replacement text` (blockquote) |
    
    **Detection rule in `process_alinea_nested()`:**
    ```python
    # If ALINEA has text BEFORE the QUOT.START element → inline quote
    if alinea_elem.text and alinea_elem.text.strip():
        has_inline_quotes = True  # Render via get_element_text()
    else:
        has_standalone_quotes = True  # Render as blockquote
    ```
    
    **Real bug fixed (2026-01-17):**
    ```
    Document: 32025R0848, Article 3(5)
    Bug: "...interface (" followed by blockquote "> API"
    Fix: Detect preceding text → treat as inline
    Result: "...interface ('API')..."
    ```

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
├── .agent/workflows/                  # Human-invoked workflows (/init, /handover, /retro)
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
Closes all tabs except one blank tab, preventing connection limit issues.

**Step 2: Verify Chrome is Accessible**
```bash
curl -s http://localhost:9222/json/version | head -1
```
If not running, start Chrome:
```bash
~/dev/eIDAS20/scripts/restart-chrome.sh
```
This starts Chrome on Windows with:
- Remote debugging on port 9222
- Isolated profile (`ag-cdp`) — doesn't affect regular Chrome
- `about:blank` tab ready for testing

**Step 3: Ensure Dev Server is Running**
```bash
curl -s http://localhost:5173/eIDAS20/ > /dev/null && echo "✅ Dev server running" || echo "❌ Start with: cd ~/dev/eIDAS20/docs-portal && npm run dev"
```

**Step 4: Run Browser Validation**

Use `browser_subagent` to navigate to `http://localhost:5173/eIDAS20/` and validate:
1. **Homepage**: Dark theme, cyan accents, stats dashboard, quick links
2. **Terminology**: A-Z index, search, definition cards
3. **Implementing Acts**: Category filters, act cards with status badges
4. **Navigation**: All sidebar links work

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Chrome not accessible | `~/dev/eIDAS20/scripts/restart-chrome.sh` |
| Too many tabs / SSE issues | `~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh` |
| Wrong port errors | Portal uses **5173** (not 5174), Chrome uses **9222** |

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

### Manual Harmonization (Non-Formex Regulations)

For regulations imported from HTML that don't match eIDAS format:

1. Set `source: "manual"` in `scripts/documents.yaml` (prevents auto-regeneration)
2. Follow checklist in `.agent/snippets/regulation-harmonization.md`
3. Add chapter structure to `CollapsibleTOC.jsx`

Key steps: Recitals header, article heading split, chapter format conversion.

### Validation
```bash
python scripts/md_linter.py --dir 01_regulation
python scripts/md_linter.py --dir 02_implementing_acts
```

### 🚨 MANDATORY: Converter-First Rule + TDD Workflow

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

#### Formex Converter Modification Workflow (TDD)

**Step 1: Understand the Issue**
- Identify the XML pattern that's being converted incorrectly
- View examples in source XML files (e.g., `temp_formex/formex/*.fmx.xml`)
- Check the current Markdown output to understand what's wrong

**Step 2: Write the Test FIRST**
```bash
# Add a new test class/method to scripts/test_formex_converter.py
# Test naming: TestFeatureName class with test_specific_behavior methods
```

**Step 3: Run the Test (Expect Failure)**
```bash
python -m unittest scripts.test_formex_converter.TestNewTestClass -v
```

**Step 4: Implement the Fix**
- Modify the converter function in `formex_to_md_v3.py`
- Keep changes minimal and focused

**Step 5: Run Tests Again (Expect Pass)**
```bash
python -m unittest scripts.test_formex_converter -v
```
All 42+ tests must pass.

**Step 6: Re-convert the Document**
```bash
python scripts/formex_to_md_v3.py temp_formex/formex/L_*.fmx.xml output.md
```

**Step 7: Commit with Both Files**
```bash
git add scripts/formex_to_md_v3.py scripts/test_formex_converter.py *.md
git commit -m "fix: description

- What was wrong
- What the fix does
- Added test: TestClassName.test_method"
```

#### Testing Patterns

**Testing list processing:**
```python
xml = '''<LIST><ITEM><NP>...</NP></ITEM></LIST>'''
elem = ET.fromstring(xml)
lines = process_list_with_quotes(elem, parent, indent_level=0)
self.assertIn("expected text", '\n'.join(lines))
```

**Testing element text extraction:**
```python
xml = '''<ELEMENT>text content</ELEMENT>'''
elem = ET.fromstring(xml)
result = get_element_text(elem)
self.assertEqual(result, "expected text")
```

⚠️ **CRITICAL: Never commit converter changes without corresponding unit tests!**

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

