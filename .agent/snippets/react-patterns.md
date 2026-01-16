# React Patterns & Best Practices

This file contains reusable React patterns discovered and refined during development of the eIDAS 2.0 Documentation Portal.

---

## Scroll Restoration Pattern

**Problem**: Single Page Applications (SPAs) need to remember scroll position when users navigate away and return via the browser back button, but should start at the top when users manually click navigation links.

**Solution**: Use the Performance Navigation API to distinguish between back/forward navigation and manual navigation.

### Implementation

#### Step 1: Create a Navigation Type Detection Hook

```javascript
/**
 * Custom hook to detect the type of navigation that brought the user to the current page.
 * Uses the Performance Navigation API.
 */
export function useNavigationType() {
    const navigationEntries = performance.getEntriesByType('navigation');
    const navigationType = navigationEntries.length > 0 
        ? navigationEntries[0].type 
        : 'navigate';
    
    const isBackForward = navigationType === 'back_forward';
    
    return {
        navigationType,  // 'navigate', 'reload', 'back_forward', or 'prerender'
        isBackForward    // true if user arrived via browser back/forward buttons
    };
}
```

#### Step 2: Save Scroll Position Before Navigation

When using React Router's `<Link>` component, add an `onClick` handler:

```javascript
const handleSaveScroll = () => {
    sessionStorage.setItem('myPageScrollY', window.scrollY.toString());
};

// In your JSX:
<Link to="/other-page" onClick={handleSaveScroll}>
    Go to other page
</Link>
```

⚠️ **Important**: React Router's `<Link>` components intercept clicks programmatically. You **cannot** use `addEventListener` on the DOM element. You **must** use the `onClick` prop.

#### Step 3: Restore Scroll Position Conditionally

```javascript
import { useNavigationType } from '../hooks/useNavigationType';

function MyPage() {
    const { isBackForward } = useNavigationType();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore scroll only if user arrived via back/forward button
    useEffect(() => {
        if (!loading && content) {
            const savedScrollY = sessionStorage.getItem('myPageScrollY');
            
            if (savedScrollY && isBackForward) {
                // Only restore scroll position if user came via back/forward button
                const scrollY = parseInt(savedScrollY, 10);
                setTimeout(() => {
                    window.scrollTo(0, scrollY);
                    sessionStorage.removeItem('myPageScrollY');
                }, 0);
            } else if (savedScrollY && !isBackForward) {
                // User navigated manually, clear saved position and start at top
                sessionStorage.removeItem('myPageScrollY');
            }
        }
    }, [loading, content, isBackForward]);

    // Cleanup: clear saved scroll position on unmount
    useEffect(() => {
        return () => {
            sessionStorage.removeItem('myPageScrollY');
        };
    }, []);

    return <div>...</div>;
}
```

### Key Points

- **Use `onClick` on `<Link>` components**, not `addEventListener` on DOM elements
- **Check `isBackForward`** to distinguish navigation types
- **Use `setTimeout()`** to ensure DOM is fully rendered before scrolling
- **Clean up `sessionStorage`** after restoring or when component unmounts
- **Wait for content to load** (`!loading`) before attempting restoration

---

## React Router Link Event Handlers

**Problem**: Need to execute code before React Router navigates to a new page.

**Solution**: Use the `onClick` prop on `<Link>` components.

### ❌ Wrong Approach (Doesn't Work)

```javascript
// This DOES NOT WORK with React Router <Link> components
useEffect(() => {
    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach(link => {
        link.addEventListener('click', handleClick);  // ❌ Won't fire!
    });
    
    return () => {
        links.forEach(link => {
            link.removeEventListener('click', handleClick);
        });
    };
}, []);
```

### ✅ Correct Approach

```javascript
import { Link } from 'react-router-dom';

function MyComponent() {
    const handleLinkClick = () => {
        // This code runs BEFORE navigation
        console.log('Navigating...');
        saveState();
    };

    return (
        <Link to="/other-page" onClick={handleLinkClick}>
            Go to other page
        </Link>
    );
}
```

### Why This Matters

React Router's `<Link>` component doesn't use traditional browser navigation. It:
1. Intercepts the click event
2. Prevents the default browser navigation
3. Updates the URL using the History API
4. Renders the new component

Because of this, DOM event listeners added via `addEventListener` won't receive the click events.

---

## Performance Navigation API

The Performance Navigation API provides information about how the user navigated to the current page.

### Navigation Types

```javascript
const navigationEntries = performance.getEntriesByType('navigation');
const navType = navigationEntries[0]?.type;

// Possible values:
// - 'navigate'      : User clicked a link, entered URL, or form submission
// - 'reload'        : User refreshed the page (F5, Cmd+R, etc.)
// - 'back_forward'  : User clicked back/forward button
// - 'prerender'     : Page was prerendered
```

### Use Cases

1. **Scroll Restoration**: Restore scroll position only on back/forward navigation
2. **Analytics**: Track how users arrive at pages
3. **State Management**: Decide whether to restore cached state or fetch fresh data
4. **User Experience**: Show different content based on navigation type

### Browser Support

- ✅ Chrome 79+
- ✅ Firefox 77+
- ✅ Safari 14.1+
- ✅ Edge 79+

The fallback is always `'navigate'`, which is safe for most use cases.

---

## Smooth Scrolling Helper

Fast, custom smooth scroll implementation for better UX.

```javascript
/**
 * Fast smooth scroll (150ms) - consistent timing across all scrolls
 */
function fastScrollTo(targetY) {
    const startPosition = window.scrollY;
    const distance = targetY - startPosition;
    const duration = 150;  // Fast scroll for better UX
    let startTime = null;

    const animation = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);  // Cubic ease-out
        window.scrollTo(0, startPosition + distance * easeOut);
        if (progress < 1) requestAnimationFrame(animation);
    };
    requestAnimationFrame(animation);
}

// Usage:
fastScrollTo(500);  // Scroll to Y position 500
```

**Why not `scrollTo({ behavior: 'smooth' })`?**
- Browser's smooth scroll duration varies (can be 1-2 seconds)
- Custom implementation gives consistent, fast experience (150ms)
- Better control over easing function

---

## React Hook Dependencies Best Practices

When using `useNavigationType()` or similar hooks in effects:

```javascript
const { isBackForward } = useNavigationType();

// ✅ CORRECT: Include isBackForward in dependencies
useEffect(() => {
    if (isBackForward) {
        // Do something
    }
}, [isBackForward]);  // Include in deps array

// ❌ WRONG: Missing dependency
useEffect(() => {
    if (isBackForward) {
        // Do something
    }
}, []);  // Missing isBackForward - may cause stale closure bugs
```

Even though `isBackForward` is computed from the Performance API and won't change during component lifecycle, including it in the dependencies array:
- Prevents React warnings
- Makes code more maintainable
- Follows React's rules of hooks
- Avoids potential bugs if implementation changes

---

## File: `src/hooks/useNavigationType.js`

Location for the navigation type detection hook:
```
src/
  hooks/
    useNavigationType.js    ← Create here
    useSemanticSearch.js    (existing)
```

---

## Linkable Element CSS Pattern

**Problem:** When adding a new linkable element type (e.g., `linkable-recital`), you must update **4 files** with consistent selectors.

**Files to update (in order):**

### 1. `scripts/rehype-paragraph-ids.js` — Add ID generation
```javascript
// Track new section type
let inRecitalsSection = false;

// Detect section heading
if ((node.tagName === 'h2') && node.properties?.id === 'recitals') {
    inRecitalsSection = true;
    return;
}

// Assign IDs to list items
if (inRecitalsSection && node.tagName === 'ul') {
    child.properties.id = `recital-${counter}`;
    child.properties['data-recital'] = counter;
    child.properties.className = [...existing, 'linkable-recital'];
}
```

### 2. `src/pages/RegulationViewer.jsx` — Hydrate gutter icons
```javascript
// Add to the useEffect that hydrates gutter icons
const recitals = contentEl.querySelectorAll('li.linkable-recital[id]');
recitals.forEach(recital => {
    const recitalNum = recital.dataset.recital || '';
    addGutter(recital, recital.id, `recital (${recitalNum})`);
});
```

### 3. `src/hooks/useCopyReference.js` — Format EU reference
```javascript
// Add pattern matching in formatHeadingReference()
const recitalMatch = headingId.match(/^recital-(\d+)$/);
if (recitalMatch) {
    return `Recital (${recitalMatch[1]})`;
}
```

### 4. `src/components/CopyReference/CopyReference.css` — Update **3 selectors**
```css
/* Selector 1: Position relative (for absolute gutter positioning) */
.regulation-content h2[id],
.regulation-content h3[id],
.regulation-content li.linkable-paragraph,
.regulation-content li.linkable-point,
.regulation-content li.linkable-subpoint,
.regulation-content li.linkable-recital {  /* ← ADD */
    position: relative;
}

/* Selector 2: Gutter positioning (adjust left offset) */
li.linkable-paragraph>.copy-gutter,
li.linkable-point>.copy-gutter,
li.linkable-subpoint>.copy-gutter,
li.linkable-recital>.copy-gutter {  /* ← ADD */
    left: -56px;
    top: 12px;
    transform: none;
}

/* Selector 3: Hover visibility */
.regulation-content li.linkable-paragraph:hover>.copy-gutter,
.regulation-content li.linkable-point:hover>.copy-gutter,
.regulation-content li.linkable-subpoint:hover>.copy-gutter,
.regulation-content li.linkable-recital:hover>.copy-gutter,  /* ← ADD */
.copy-gutter:hover {
    opacity: 1;
}
```

### Checklist
- [ ] `rehype-paragraph-ids.js` — ID + class assignment
- [ ] `RegulationViewer.jsx` — gutter icon hydration
- [ ] `useCopyReference.js` — EU citation format
- [ ] `CopyReference.css` — 3 CSS selectors (position, gutter, hover)
- [ ] Rebuild content: `npm run build:content`
- [ ] Test in browser: hover over new element type

**Real example:** `linkable-recital` (Phase 4, 2026-01-17)
