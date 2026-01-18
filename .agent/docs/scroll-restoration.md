# Scroll Restoration in the eIDAS Documentation Portal

> Status: Living Document | Last updated: 2026-01-18

This document describes the scroll restoration system used throughout the eIDAS 2.0 Documentation Portal. It explains how scroll positions are preserved when navigating between pages and returning via the browser's back button.

---

## Overview

The portal implements **stateful scroll restoration** to preserve the user's reading position when navigating away from and back to pages. This is critical for a long-document reading experience where users may:

1. Read a regulation article at a specific position
2. Click a citation or terminology link to see more information
3. Press the browser back button to return
4. **Expect to be back at the exact position they left**

---

## The Problem with SPAs

In Single Page Applications (SPAs), the browser's native scroll restoration often fails because:

1. **React re-renders the component** when navigating back
2. The `useEffect` fires **before content is fully rendered**
3. `window.scrollTo(0, 5000)` is called when document height is only 500px
4. Browser **silently clamps** the scroll to max scrollable height (0)

This means users are unexpectedly jumped to the top of the page, losing their place.

---

## The Solution: Height-Aware Polling

The portal uses a **polling approach** implemented in `useScrollRestoration.js`:

```javascript
// Wait until DOM is tall enough to scroll to saved position
const checkAndScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const canScroll = scrollHeight > targetY + window.innerHeight;
    
    if (canScroll) {
        window.scrollTo(0, targetY);
        sessionStorage.removeItem(storageKey);
    } else if (attempts < maxAttempts) {
        requestAnimationFrame(checkAndScroll);  // Retry
    }
};
```

---

## Navigation Flows with Scroll Restoration

### Flow 1: Terminology Page → Term Link → Back

| Step | Action | Scroll Behavior |
|------|--------|-----------------|
| 1 | User browses Terminology page at position Y | - |
| 2 | User clicks term to view its definition | Position Y saved to sessionStorage |
| 3 | Term card scrolls into view | Deep link scroll |
| 4 | User presses browser Back button | Position Y restored |

**Implementation**: `Terminology.jsx` uses `useScrollRestoration` with `storageKey: 'terminologyScrollY'`.

### Flow 2: Regulation Article → Citation Popover → External Link

| Step | Action | Scroll Behavior |
|------|--------|-----------------|
| 1 | User reads regulation at position Y | - |
| 2 | User hovers citation, clicks deep link in popover | Position Y saved |
| 3 | New page/section loads | Deep link scroll |
| 4 | User presses browser Back button | Position Y restored |

**Implementation**: `RegulationViewer.jsx` saves scroll on citation popover link clicks.

### Flow 3: Regulation Article → Term Popover → Terminology Page → Back

| Step | Action | Scroll Behavior |
|------|--------|-----------------|
| 1 | User reads regulation at position Y | - |
| 2 | User hovers term, clicks "View in Terminology →" | Position Y saved |
| 3 | Terminology page loads with `?term=X` | Deep link to term card |
| 4 | User presses browser Back button | Position Y restored |

**Implementation**: Term popover click handler calls `saveScrollPosition()` before navigation.

---

## Key Implementation Details

### Storage Keys

Each page uses a unique `sessionStorage` key:

| Page | Storage Key | Notes |
|------|-------------|-------|
| Terminology | `terminologyScrollY` | Single page, one key |
| Regulation Viewer | `regulationScrollY_{slug}` | Per-document key (e.g., `regulationScrollY_2014-910`) |

### Navigation Type Detection

Uses React Router's `useNavigationType()` hook:

| Type | Meaning | Scroll Behavior |
|------|---------|-----------------|
| `'POP'` | Back/forward button | Restore saved position |
| `'PUSH'` | Link click | Start at top or deep link |
| `'REPLACE'` | Redirect | Start at top |

### Deep Link Priority

When navigating forward with a `?section=` or `?term=` parameter:
- **Fresh navigation (`PUSH`)**: Deep link takes priority → scroll to section/term
- **Back navigation (`POP`)**: Saved position takes priority → restore scroll

This is handled by the `shouldRestoreScroll` flag:

```javascript
const isBackForward = navigationType === 'POP';
const hasSavedPosition = !!sessionStorage.getItem(storageKey);
const shouldRestoreScroll = isBackForward && hasSavedPosition;

// Skip deep link scrolling if restoring position
if (!shouldRestoreScroll && section) {
    scrollToSection(section);
}
```

---

## Components Using Scroll Restoration

| Component | Hook Usage | Trigger Points |
|-----------|------------|----------------|
| `Terminology.jsx` | `useScrollRestoration` | Term link clicks |
| `RegulationViewer.jsx` | `useScrollRestoration` | Citation popover links, term popover links |

---

## Debugging Scroll Issues

The hook includes tracing that can be enabled for debugging:

```javascript
// In browser console:
localStorage.setItem('trace:scroll', 'true');
// Now refresh and navigate - scroll events are logged
```

Look for these trace namespaces:
- `scroll:save` — When positions are saved
- `scroll:restore` — When restoration is attempted

---

## Edge Cases

### 1. Content Not Tall Enough
If the content is shorter than the saved scroll position (e.g., user navigates to a different regulation), the hook gives up after `maxAttempts` (default: 10) and clears the saved position.

### 2. Multiple Tabs
Each tab has its own `sessionStorage`, so scroll positions are isolated per tab.

### 3. Page Refresh
`sessionStorage` persists across refresh, so:
- If user refreshes while on a deep link, they get the deep link scroll
- If user refreshes without deep link, they start at top (saved position cleared on first render)

---

## See Also

- `docs-portal/src/hooks/useScrollRestoration.js` — The implementation
- `TERMINOLOGY.md` — Scroll Restoration Pattern definition
- `AGENTS.md` Rule 24 — Wait for DOM Height pattern

