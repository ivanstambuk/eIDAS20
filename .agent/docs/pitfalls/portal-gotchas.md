# Portal Architecture Gotchas

> Extracted from AGENTS.md — debugging reference for portal-specific issues.

---

## CSS-First Debugging for JSX Spacing Issues

When fixing spacing/layout problems in JSX, **always inspect parent CSS properties first** before assuming JSX whitespace is the cause.

| CSS Property | Common Surprise |
|-------------|----------------|
| `display: inline-flex` + `gap` | Inserts space between text nodes and inline elements (flex children) |
| `display: flex` + `gap` | Same — each JSX child node becomes a flex item with gap |
| `white-space: pre` | Preserves all whitespace including JSX newlines |

**Example bug:** `— Internal , synthesized from...` — the space before comma was caused by `gap: var(--space-1)` on the parent `inline-flex` element, NOT JSX whitespace between `</span>` and `{', '}`.

**Fix pattern:** Wrap adjacent elements that should have no gap in a single `<span>` to make them one flex child.

---

## Case-Insensitive Exact Search (termLower Pattern)

Orama's `exact: true` is **case-sensitive** against stored field values. To support case-insensitive abbreviation matching:

1. **Build time** (`build-search-index.js`): Store original case in `term` (for display), lowercase in `termLower` (for search)
2. **Runtime** (`useSearch.js`): Query `termLower` with `searchQuery.toLowerCase()`

**When to apply this pattern:** Any new searchable field that needs case-insensitive exact matching should follow the same `field` + `fieldLower` convention.

---

## Dual Popover Implementations (Keep in Sync)

The portal has **TWO term popover implementations** that must stay synchronized:

| File | Used By | Type |
|------|---------|------|
| `src/components/TermPopover/TermPopover.jsx` | Terminology page | React component |
| `src/utils/termPopoverTemplate.js` | RegulationViewer.jsx | Template string generator |

**Why two implementations?** The Terminology page uses React components, but the RegulationViewer injects popovers into statically-rendered HTML content via template strings.

**When modifying popover features** (e.g., adding alias display), update BOTH files.

---

## Regulation ID Format Variation (Leading Zeros)

Document slugs use format `YYYY-NNNN` with **leading zeros** for the number portion, but legal references often omit them:

| Source | Format | Example |
|--------|--------|---------|
| **Document slugs** | `YYYY-0NNN` | `2025-0848` |
| **Legal refs in RCA** | `YYYY/NNN` | `2025/848` |
| **CELEX numbers** | Full year format | `32025R0848` |

**The lookup normalizes these automatically** (see `useRegulationsIndex` hook), but be aware of this variation when debugging link issues.

---

## Regulation ID Canonical Format (DEC-225)

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

---

## Mobile Breakpoints Reference

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

---

## GitHub Pages CDN Caching Gotcha

After deploying to GitHub Pages, changes may not appear immediately due to CDN caching.

**Symptoms:**
- Build logs show correct data, but live site shows old UI/data
- "0 reqs" on VCQ despite successful `build-vcq.js` output

**Solutions:**
1. **Hard refresh**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Incognito window**: Test in private/incognito mode
3. **Cache-busting URL**: Add `?v=2` to the URL
4. **Wait**: CDN propagation can take 1-5 minutes
