# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: Fix navigation bug - sidebar links change URL but don't update content
- **Next**: Binary search Sidebar component for infinite loop cause
- **Status**: Blocked (infinite render loop)
- **Phase**: Bug Fix / Unplanned

## Key Files

- `docs-portal/src/components/Layout/Sidebar.jsx` — Most likely culprit (active route highlighting)
- `docs-portal/src/components/Layout/Layout.jsx` — Parent component, renders Sidebar
- `docs-portal/src/components/ScrollToTop.jsx` — Uses useLocation, could be involved
- `docs-portal/src/components/Layout/Header.jsx` — Uses useTheme hook
- `.gemini/NAVIGATION_BUG_REPORT.md` — Full investigation write-up

## Context Notes

**Critical Discovery**: Bug exists in ORIGINAL codebase (commit 154e202), NOT introduced by this session.

**Root Cause**: "Maximum update depth exceeded" error
- Component calls setState inside useEffect with problematic dependencies
- Infinite loop blocks React Router from processing route changes
- Observed error count: 1246+ and increasing

**What We Confirmed**:
1. React Router itself works (tested with minimal app - no errors)
2. Layout component (or children) causes the loop
3. AIChat is NOT the culprit (removed it, loop persisted)

**Likely Suspects** (priority order):
1. **Sidebar.jsx** - Uses useLocation for active route highlighting, most complex
2. ScrollToTop.jsx - Listens to pathname changes
3. Header.jsx - Uses useTheme hook

**Pattern to Look For**:
```jsx
useEffect(() => {
  setState(something); // This triggers re-render
}, [dependency]); // If dependency changes every render → infinite loop
```

Common bugs:
- Missing dependency array
- Dependency that's a new object/array every render
- setState call that changes a dependency

**What Didn't Work**:
- Removing Home component import (made it worse)
- Using Navigate component (blank screen)
- Custom HomeRedirect component (blank screen)

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Already running

# Start debugging:
# 1. Comment out Sidebar in Layout.jsx, test
# 2. If fixed → problem is in Sidebar
# 3. If not → try ScrollToTop next
```

**Test Method**:
1. Open http://localhost:5173/eIDAS20/
2. Open browser console
3. Look for "Maximum update depth exceeded" errors
4. Try clicking "Terminology" in sidebar
5. Check if content updates (should work if bug fixed)
