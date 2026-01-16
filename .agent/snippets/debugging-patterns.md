# Debugging Patterns - eIDAS Documentation Portal

This file documents proven debugging patterns and investigation techniques for the eIDAS 2.0 Documentation Portal project.

---

## Pattern 1: DOM-First Investigation for UI Issues

**When to use:** Deep linking not working, elements not scrolling, missing IDs/classes, routing issues

**Why this works:** The browser DOM is the source of truth. Code logic can have bugs or unexpected behavior that produces different HTML than expected.

### Step-by-Step Process

```bash
# 1. Clean browser tabs first (avoid connection limits)
~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh

# 2. Use browser_subagent to inspect runtime state
# Example task: "Navigate to [URL] and check if element ID [id] exists"
```

**Browser investigation script template:**
```javascript
// Check if expected element exists
const element = document.getElementById('article-2-para-1');
if (!element) {
    // Find what IDs DO exist in that section
    const allIds = Array.from(document.querySelectorAll('[id*="article-2"]'))
        .map(el => ({ id: el.id, tag: el.tagName }));
    return { found: false, similarIds: allIds };
}

// If found, check its properties
return {
    found: true,
    id: element.id,
    tagName: element.tagName,
    parentTag: element.parentElement.tagName,
    text: element.innerText.substring(0, 100)
};
```

### Real Example: Terminology Deep Linking (2026-01-16)

**Issue:** Clicking "View in Regulation" from terminology page doesn't scroll to definition

**Investigation Process:**
1. ✅ Used browser_subagent to navigate to regulation
2. ✅ Checked if `article-2-para-1` ID exists → **Not found**
3. ✅ Inspected Article 2 structure → Found it's a `<ul>`, not `<ol>`
4. ✅ Checked rehype-paragraph-ids.js → Only processes `<ol>`
5. ✅ Root cause identified: Plugin needs to support both list types

**Time saved:** ~10 minutes vs iterating on link format assumptions

**Fix:** Extended rehype plugin to process both `<ol>` and `<ul>` while preserving legal document structure

---

## Pattern 2: React Infinite Loop Diagnosis

**When to use:** "Maximum update depth exceeded" errors

**Why this works:** React's console errors include exact component stack traces, but you need browser access to see them.

### Step-by-Step Process

```bash
# 1. Clean tabs
~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh

# 2. Use browser_subagent to capture console errors
# Task: "Open [URL] and capture any console errors, especially React errors"
```

**Browser console inspection:**
```javascript
// Monkey-patch console to capture all errors
const errors = [];
const originalError = console.error;
console.error = (...args) => {
    errors.push(args.map(a => String(a)).join(' '));
    originalError(...args);
};

// Wait a bit for errors to accumulate
setTimeout(() => {
    return {
        errorCount: errors.length,
        errors: errors.slice(0, 5) // First 5 errors
    };
}, 2000);
```

### Real Example: SearchModal Infinite Loop (2026-01-16)

**Issue:** Infinite render loop breaking the app

**Investigation Process:**
1. ✅ Used browser_subagent to capture console errors
2. ✅ Found error mentions `SearchModal` component
3. ✅ Identified unstable object dependencies in useEffect
4. ✅ Root cause: useSearch hook returns new object every render

**Time saved:** ~60 minutes vs checking every component manually

**Fix:** Extracted stable function references and added useMemo to hook returns

---

## Pattern 3: Comparing Expected vs Actual HTML Structure

**When to use:** Feature works in some documents but not others

**Why this works:** Identifies structural differences between documents that code assumes are identical.

### Step-by-Step Process

```javascript
// Compare two similar sections
function compareStructure(selector1, selector2) {
    const el1 = document.querySelector(selector1);
    const el2 = document.querySelector(selector2);
    
    return {
        element1: {
            tag: el1?.tagName,
            children: el1?.children.length,
            ids: Array.from(el1?.querySelectorAll('[id]') || []).map(e => e.id)
        },
        element2: {
            tag: el2?.tagName,
            children: el2?.children.length,
            ids: Array.from(el2?.querySelectorAll('[id]') || []).map(e => e.id)
        }
    };
}

// Example: Compare Article 2 in different regulations
compareStructure('#article-2', '#article-3');
```

### Real Example: Article 2 Structure Variance (2026-01-16)

**Issue:** Deep linking works for eIDAS 910/2014 but not implementing acts

**Investigation Process:**
1. ✅ Inspected Article 2 in 910/2014 → Uses `<ol>`
2. ✅ Inspected Article 2 in 2024/2977 → Uses `<ul>`
3. ✅ Root cause: Different source documents use different list types

**Fix:** Extended functionality to handle both structures instead of changing documents

---

## Pattern 4: Build Pipeline Verification

**When to use:** Content changes don't appear in browser after rebuild

**Why this works:** Catches stale data, missing build steps, or script dependencies.

### Verification Checklist

```bash
# 1. Check if build scripts ran
ls -lht ~/dev/eIDAS20/docs-portal/public/data/regulations/*.json | head -5

# 2. Check file modification times
stat ~/dev/eIDAS20/docs-portal/public/data/regulations/2024-2977.json

# 3. Verify content was actually updated
cat ~/dev/eIDAS20/docs-portal/public/data/regulations/2024-2977.json | \
  grep -o '"id":"article-2-para-[0-9]*"' | head -5

# 4. Hard refresh browser (Ctrl+Shift+R) to bypass cache
```

### Real Example: Rehype Plugin Changes (2026-01-16)

**Issue:** Added UL support to rehype plugin but IDs still missing

**Investigation Process:**
1. ✅ Verified plugin code was correct
2. ✅ Checked if `npm run build:content` was run → Yes
3. ✅ Inspected generated JSON → IDs present
4. ✅ Hard refresh browser → Fixed

**Fix:** Build was correct; browser cache was stale

---

## Key Principles

1. **DOM is source of truth** - Don't assume, verify
2. **Browser errors are precise** - Console shows exact component/line
3. **Compare working vs broken** - Reveals structural differences
4. **Verify build pipeline** - Cache and stale data cause confusion
5. **Document patterns** - Save time for future debugging

---

## Anti-Patterns to Avoid

❌ **Assumption-driven debugging**
- "It should have ID X, let me update the link"
- Multiple iterations fixing symptoms

✅ **Evidence-driven debugging**
- browser_subagent → inspect DOM → identify root cause → fix once

❌ **Manual code review first**
- Reading through 500 lines of code looking for the bug
- Checking every component hoping to spot the issue

✅ **Runtime inspection first**
- Let the browser tell you what's wrong
- Stack traces point to exact problem location

❌ **Changing legal documents to fit features**
- "Let's change UL to OL so IDs work"

✅ **Adapting features to preserve documents**
- "Let's support both UL and OL in our feature"

---

*Last updated: 2026-01-16*
