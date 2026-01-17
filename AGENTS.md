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
   
   **Example - Nested List Hierarchy (actual issue 2026-01-15):**
   ```
   # WRONG: Fix in JS only (workaround)
   → Sibling-tracking logic in rehype plugin
   → Converter still produces flat structure
   → Two places to maintain
   
   # CORRECT: Fix at source (systematic)
   → Fix converter to produce nested Markdown
   → Reconvert ALL documents
   → Simplify rehype plugin (just walk nested tree)
   → Remove sibling-tracking workaround
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

