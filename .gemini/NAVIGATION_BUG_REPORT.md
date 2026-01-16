# Navigation Bug Report & Learnings
**Date**: 2026-01-16  
**Session Duration**: ~70 minutes  
**Status**: UNRESOLVED - Reverted all changes

## Original Problem

**USER Report**: "When I click on links in the menu, the URL changes but I have to explicitly refresh for the actual content to load."

**Observed Behavior**:
- Clicking sidebar navigation links (e.g., "Terminology", "By Role") updates the browser URL hash
- The main content area does NOT re-render to show the new page
- Manual page refresh is required to see the correct content for the URL

## Root Cause Identified

**"Maximum update depth exceeded" infinite loop error**

- This error appears in the browser console immediately upon page load
- Error count increases continuously (observed at 1246+ and counting)
- The infinite render loop **blocks React Router from processing route changes**
- This bug exists in the ORIGINAL codebase (confirmed via `git reset --hard HEAD~1`)

## What We Learned

### ✅ Confirmed Facts

1. **React Router itself works correctly**
   - Created minimal test app with HashRouter → navigation worked perfectly
   - No "Maximum update depth exceeded" errors in minimal app

2. **The Layout component (or its children) causes the infinite loop**
   - Test with simplified App.jsx + Layout still showed the infinite loop
   - Narrowed down to one of: `Layout`, `Header`, `Sidebar`, `ScrollToTop`, or `AIChat`

3. **The bug was pre-existing**
   - Present in commit `154e202` (before any changes in this session)
   - NOT introduced by this debugging session

4. **AIChat is NOT the culprit**
   - Removed AIChat from Layout → infinite loop persisted

### ❌ What Didn't Work

1. **Attempted fix #1**: Remove non-existent `Home` component import
   - Made the situation worse (blank screen)
   - This was a red herring - `Home.jsx` actually exists

2. **Attempted fix #2**: Use `<Navigate>` component for index route
   - Caused even worse infinite loop
   - Prevented ANY content from rendering (blank black screen)

3. **Attempted fix #3**: Create `HomeRedirect` custom component
   - Still caused infinite loop
   - Same blank screen issue

### 🔍 Next Steps for Fresh Session

1. **Binary search through Layout children**:
   - Comment out `ScrollToTop` → test
   - Comment out `Sidebar` → test
   - Comment out `Header` → test
   - One of these MUST be causing the loop

2. **Check for problematic useEffect patterns**:
   ```bash
   grep -r "useEffect" docs-portal/src/components/Layout/ -A 5
   grep -r "useState.*set.*State" docs-portal/src/components/ -A 3
   ```

3. **Look for setState calls that trigger themselves**:
   - Common pattern: `useEffect` with missing/incorrect dependencies
   - State updates that trigger re-renders which trigger more state updates

4. **Examine the Sidebar component carefully**:
   - It likely uses `useLocation` to highlight active routes
   - Might have a bug where location changes trigger state updates incorrectly

## Technical Details

**Environment**:
- React Router: HashRouter
- Build tool: Vite
- React: StrictMode enabled (but not the cause - minimal app also uses StrictMode)

**Error Message**:
```
Maximum update depth exceeded. This can happen when a component calls setState 
inside useEffect, but useEffect either doesn't have a dependency array, or one 
of the dependencies changes on every render.
```

## Session Artifacts

- Browser recordings saved in `.system_generated/` directory
- Test files created (now removed): `App-test.jsx`, `App.jsx.backup`
- All changes reverted via `git reset --hard HEAD && git clean -fd`

---

**Recommendation**: Start fresh session with focused approach on `Sidebar` component first, as it's the most likely culprit due to active route highlighting logic.
