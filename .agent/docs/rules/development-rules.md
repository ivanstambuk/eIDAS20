# Development Rules (Rules 11-25)

React patterns, debugging strategies, CSS pitfalls, and development best practices.

---

## 11. React Development Best Practices (MANDATORY)

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

**See also:** `.agent/snippets/react-patterns.md` for scroll restoration pattern using this technique.

---

## 12. DOM-First Debugging (MANDATORY — UI/Navigation Issues)

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

---

## 13. Legal Structure Preservation (MANDATORY — Legal Documents)

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

---

## 14. Git Checkout Safety (MANDATORY — Testing with Temporary Changes)

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

---

## 15. Vocabulary Confirmation (MANDATORY — When User Uses UI/Domain Terms)

**When the user requests a feature using UI or domain terminology, CONFIRM your understanding before implementing.**

**Trigger phrases (UI terms that could be ambiguous):**
- "popover", "tooltip", "hover"
- "gutter", "sidebar", "panel"
- "link", "reference", "citation"
- "recital", "article", "provision"
- Any term defined in TERMINOLOGY.md

**Correct pattern:**
1. **FIRST:** State what you understand the request to mean
2. **REFERENCE:** TERMINOLOGY.md definitions if applicable
3. **CONFIRM:** Ask "Is this what you mean?" before implementing

**Example:**
```
User: "Add popovers for recitals"

❌ WRONG: Start implementing citation popovers in recital text

✅ CORRECT: "Do you mean:
   (A) Gutter icons (🔗 📜) on individual recitals for copying links/references, or
   (B) Citation popovers when hovering legislation references within recitals?
   (See TERMINOLOGY.md: 'Gutter Icons' vs 'Citation Popover')"
```

---

## 16. TERMINOLOGY.md Maintenance (MANDATORY — Living Document)

**Proactively update TERMINOLOGY.md when new concepts are introduced or existing ones change.**

**When to update:**
- Adding a new UI component → Add to "UI Components" section
- Adding a new data structure → Add to "Data Model" section
- Adding a new CSS class → Add to "Linkable Elements" table
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

---

## 17. CSS Flex Gap with Inline Text (PITFALL)

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

---

## 18. EU Regulation Numbering Formats (EC vs EU)

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

**CELEX Year/Number Position Variations:**

| Era | Citation Format | CELEX Construction |
|-----|-----------------|-------------------|
| Pre-2014 | Regulation No **NNN/YYYY** (number first) | `3{YYYY}R{NNNN}` |
| Post-2014 | Regulation **YYYY/NNN** (year first) | `3{YYYY}R{NNNN}` |

**Citation Cache Invalidation:**

When updating `legislation-metadata.js`, you must force-rebuild citations:
```bash
rm -f docs-portal/public/data/citations/*.json
cd docs-portal && node scripts/build-citations.js
```

---

## 19. ⛔ Legal Document Visual Fidelity (ABSOLUTE — No Exceptions)

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

**This rule supersedes:** Convenience, consistency, technical simplicity. The legal text is sacred.

---

## 20. Markdown Numbered List Renumbering (PITFALL)

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

**Solution:** For non-consecutive legal lists, use raw HTML with explicit IDs.

---

## 21. Client-Side Tracing (Debugging Long-Running Issues)

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

---

## 22. SPA API Pitfalls (Browser APIs That Don't Work in SPAs)

**Many browser APIs don't work as expected in Single Page Applications.** Always verify API behavior in SPA context.

| API | Expected Behavior | Actual SPA Behavior |
|-----|-------------------|---------------------|
| `performance.getEntriesByType('navigation')` | Updates on each navigation | Only reflects initial page load |
| `window.onbeforeunload` | Fires before leaving | Doesn't fire for SPA navigation |
| `document.referrer` | Previous page URL | Static from initial load |
| `history.length` | Navigation count | Includes SPA navigations (works) |

**Why this happens:** SPAs handle navigation client-side via the History API without loading a new document.

**Correct pattern:** Use framework-provided alternatives:
```javascript
// ❌ WRONG: Browser API (doesn't track SPA navigation)
const isBack = performance.getEntriesByType('navigation')[0]?.type === 'back_forward';

// ✅ CORRECT: React Router hook (tracks client-side navigation)
const navigationType = useNavigationType(); // 'POP' | 'PUSH' | 'REPLACE'
const isBack = navigationType === 'POP';
```

---

## 23. React Router Built-in Hooks (Use Before Custom)

**React Router provides hooks that replace many custom implementations.**

| Need | React Router Hook | Return Value |
|------|-------------------|--------------|
| Navigation type | `useNavigationType()` | `'POP'` \| `'PUSH'` \| `'REPLACE'` |
| Current location | `useLocation()` | `{ pathname, search, hash, state }` |
| URL params | `useParams()` | `{ paramName: value }` |
| Search params | `useSearchParams()` | `[searchParams, setSearchParams]` |
| Navigate function | `useNavigate()` | `navigate(to, options)` |
| Match info | `useMatch(pattern)` | Match object or null |

---

## 24. Scroll Restoration: Wait for DOM Height (SPA Pitfall)

**`window.scrollTo()` silently fails if the DOM doesn't have enough content height.**

**Why it fails:**
1. Component mounts, triggers scroll restoration effect
2. Effect calls `window.scrollTo(0, 1200)`
3. But DOM only has ~500px of content rendered so far
4. Browser silently clamps to max scrollable height (0)
5. Content finishes rendering at 2000px — but scroll already happened at 0

**Solution: Poll for sufficient height before scrolling:**
```javascript
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

**This project's solution:** Use the shared `useScrollRestoration` hook from `src/hooks/useScrollRestoration.js`.

📄 **Full documentation**: See [.agent/docs/scroll-restoration.md](../scroll-restoration.md) for complete navigation flows and implementation details.

---

## 25. CSS Debug Mode (Visual Element Debugging)

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

**See also:** `src/utils/debugCSS.js` for implementation details.

---

## 26. Rehype Term-Link Single-Term Text Nodes (PITFALL)

**Problem:** When wrapping matched terms with `<span>` elements in rehype plugins, the replacement condition must handle single-term text nodes.

**Example of the bug (from 2026-01-21):**
```javascript
// ❌ BUG: parts.length > 1 excludes single-term text nodes
const parts = processTextNode(node, termPattern, termMap);
if (parts && parts.length > 1) {  // ← Wrong condition!
    replacements.push({ node, parent, parts });
}

// Text node: "Electronic signature" (entire content is one term)
// After processing: parts = [<span>Electronic signature</span>]
// parts.length === 1, so condition fails → term not linked!
```

**Solution:**
```javascript
// ✅ CORRECT: parts.length > 0 includes single-term text nodes
const parts = processTextNode(node, termPattern, termMap);
if (parts && parts.length > 0) {  // ← Correct condition
    replacements.push({ node, parent, parts });
}
```

**When this occurs:**
- List items containing only a term: `<li>Electronic signature</li>`
- Definition terms in bold: `<strong>trust service</strong>`
- Any text node where the ENTIRE content matches a term

**Why it's subtle:** In most cases, terms appear within sentences, so splitting produces multiple parts (text + term + text). The bug only manifests when terms are standalone.
