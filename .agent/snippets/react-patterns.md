# React Patterns & Best Practices

This file contains reusable React patterns discovered and refined during development of the eIDAS 2.0 Documentation Portal.

---

## Scroll Restoration Pattern

**Problem**: Single Page Applications (SPAs) need to remember scroll position when users navigate away and return via the browser back button, but should start at the top when users manually click navigation links.

**Solution**: Use React Router's built-in `useNavigationType` hook to distinguish between back/forward navigation (`POP`) and link clicks (`PUSH`).

### ⚠️ Critical Insight: Performance API Does NOT Work for SPAs

The Performance Navigation API (`performance.getEntriesByType('navigation')`) only tracks how the **initial HTML document** was loaded. It does NOT update for SPA client-side navigations!

```javascript
// ❌ WRONG: This only detects how the page was FIRST loaded, not SPA navigation
const navigationEntries = performance.getEntriesByType('navigation');
const isBackForward = navigationEntries[0]?.type === 'back_forward';
// ^ This will ALWAYS reflect the initial page load, not in-app navigation!
```

React Router handles navigation entirely client-side via the History API without loading a new document. The Performance API never updates because no new document is loaded.

### ✅ Correct Solution: React Router's useNavigationType

React Router v7+ provides a built-in `useNavigationType` hook that properly tracks SPA navigation:

```javascript
import { useNavigationType } from 'react-router-dom';

function MyComponent() {
    const navigationType = useNavigationType();
    // Returns: 'POP' | 'PUSH' | 'REPLACE'
    
    const isBackForward = navigationType === 'POP';
    // ^ This correctly detects back/forward button clicks!
}
```

| Type | Meaning |
|------|---------|
| `POP` | User clicked browser Back/Forward buttons |
| `PUSH` | User clicked a `<Link>` (new history entry) |
| `REPLACE` | Navigation replaced current history entry |

### Implementation

#### Step 1: Save Scroll Position Before Navigation

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

#### Step 2: Restore Scroll Position Conditionally

```javascript
import { useNavigationType } from 'react-router-dom';

function MyPage() {
    const navigationType = useNavigationType();
    const isBackForward = navigationType === 'POP';
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore scroll only if user arrived via back/forward button
    useEffect(() => {
        if (!loading && content) {
            const savedScrollY = sessionStorage.getItem('myPageScrollY');
            
            if (savedScrollY && isBackForward) {
                // Only restore scroll position if user came via back/forward button
                const scrollY = parseInt(savedScrollY, 10);
                // Double-RAF pattern: ensures DOM has fully painted before scrolling
                // Critical for long lists (500+ items) that need layout time
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        window.scrollTo(0, scrollY);
                        sessionStorage.removeItem('myPageScrollY');
                    });
                });
            } else if (savedScrollY && !isBackForward) {
                // User navigated manually, clear saved position and start at top
                sessionStorage.removeItem('myPageScrollY');
            }
        }
    }, [loading, content, isBackForward]);

    return <div>...</div>;
}
```

### Key Points

- **Use React Router's `useNavigationType`**, NOT the Performance Navigation API
- **Use `onClick` on `<Link>` components**, not `addEventListener` on DOM elements
- **Check `navigationType === 'POP'`** to detect back/forward navigation
- **Use double-RAF pattern** to ensure DOM is fully painted before scrolling (critical for long lists)
- **Clean up `sessionStorage`** after restoring or when navigation type indicates manual nav
- **Wait for content to load** (`!loading`) before attempting restoration

### Debugging Scroll Restoration

If scroll restoration isn't working, enable tracing to see the exact state:

```
URL: http://localhost:5173/eIDAS20/?debug=scroll
Console: window.enableTrace('scroll')
```

This will show:
```
[10:02:15.123] scroll:restore { navigationType: 'POP', isBackForward: true, savedScrollY: '1234', scrollHeight: 24500 }
[10:02:15.125] scroll:restore Restoring to 1234
[10:02:15.180] scroll:restore Scroll applied, final scrollY: 1234
```

If `isBackForward` is always `false`, you're using the wrong API (see "SPA API Pitfalls" in AGENTS.md).

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

## Performance Navigation API (Page Load Only — NOT for SPAs!)

⚠️ **WARNING**: This API does NOT work for detecting navigation within a Single Page Application. For SPA navigation detection, use React Router's `useNavigationType()` instead.

The Performance Navigation API provides information about how the **initial HTML document** was loaded — not subsequent in-app navigations.

### Navigation Types (Initial Page Load Only)

```javascript
const navigationEntries = performance.getEntriesByType('navigation');
const navType = navigationEntries[0]?.type;

// Possible values (these reflect HOW THE PAGE WAS FIRST LOADED, not SPA navigation):
// - 'navigate'      : User typed URL, clicked external link, or form submission
// - 'reload'        : User refreshed the page (F5, Cmd+R, etc.)
// - 'back_forward'  : User used back/forward to return FROM ANOTHER SITE
// - 'prerender'     : Page was prerendered
```

### When This DOES Work

1. **Multi-page applications** (traditional server-rendered apps)
2. **Cross-origin navigation** (user leaves your site and returns)
3. **Analytics for initial page load** (how did the user first arrive?)

### When This DOES NOT Work

1. **Single Page Applications** — React Router navigates entirely client-side
2. **In-app back/forward detection** — the History API doesn't trigger new navigation entries
3. **Any client-side routing framework** (Next.js, Vue Router, Angular Router, etc.)

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

When using `useNavigationType()` from React Router in effects:

```javascript
import { useNavigationType } from 'react-router-dom';

const navigationType = useNavigationType();
const isBackForward = navigationType === 'POP';

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

Including all used values in the dependencies array:
- Prevents React warnings
- Makes code more maintainable
- Follows React's rules of hooks
- Avoids potential bugs if implementation changes

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

---

## Collapsible Section with LocalStorage Pattern

**Problem:** Need collapsible/expandable UI sections that remember their state across page refreshes and sessions.

**Solution:** Combine React state with localStorage for persistence, using lazy initialization and a useEffect sync.

### Implementation

```jsx
import { useState, useEffect } from 'react';

// Configuration with default expand states
const sections = [
    { id: 'overview', title: 'Overview', defaultExpanded: true },
    { id: 'tools', title: 'Tools', defaultExpanded: true },
    { id: 'supplementary', title: 'Supplementary', defaultExpanded: false },
];

function CollapsibleNav() {
    // Lazy initialization: load from localStorage or use defaults
    const [expandedSections, setExpandedSections] = useState(() => {
        const saved = localStorage.getItem('nav-expanded-sections');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // Invalid JSON, fall through to defaults
            }
        }
        // Initialize from config defaults
        return sections.reduce((acc, section) => {
            acc[section.id] = section.defaultExpanded ?? true;
            return acc;
        }, {});
    });

    // Persist to localStorage on every change
    useEffect(() => {
        localStorage.setItem('nav-expanded-sections', JSON.stringify(expandedSections));
    }, [expandedSections]);

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    return (
        <nav>
            {sections.map(section => {
                const isExpanded = expandedSections[section.id] ?? true;
                return (
                    <div key={section.id}>
                        <button
                            onClick={() => toggleSection(section.id)}
                            aria-expanded={isExpanded}
                            aria-controls={`section-${section.id}`}
                        >
                            <span>{section.title}</span>
                            <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>
                                ▼
                            </span>
                        </button>
                        {isExpanded && (
                            <ul id={`section-${section.id}`}>
                                {/* Section items */}
                            </ul>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
```

### CSS for Chevron Rotation

```css
.chevron {
    display: inline-flex;
    transition: transform 0.15s ease;
}

.chevron.expanded {
    transform: rotate(180deg);
}
```

### Key Points

1. **Lazy initialization** — useState callback only runs on first render, avoiding localStorage read on every render
2. **Try/catch JSON parse** — Handles corrupted localStorage gracefully
3. **Default fallback** — Uses config defaults if localStorage is empty or invalid
4. **Nullish coalescing** — `?? true` ensures undefined values default to expanded
5. **Aria attributes** — `aria-expanded` and `aria-controls` for accessibility
6. **Conditional rendering** — Only renders content when expanded (better performance than CSS hide)

**Real example:** `Sidebar.jsx` (DEC-224, 2026-01-23)

---

## LocalStorage-Backed Preference Pattern

**Problem:** Need to persist a simple user preference (toggle, dropdown selection) across page refreshes and sessions.

**Solution:** Use useState with lazy initializer from localStorage plus a useEffect to sync changes.

### Simple Implementation (Single Value)

```jsx
import { useState, useEffect } from 'react';

function MyComponent() {
    // Lazy initialization: read from localStorage only on first render
    const [preference, setPreference] = useState(() => {
        const saved = localStorage.getItem('my-preference-key');
        // Validate and return, with fallback to default
        return saved === 'option1' || saved === 'option2' ? saved : 'option1';
    });

    // Persist to localStorage whenever value changes
    useEffect(() => {
        localStorage.setItem('my-preference-key', preference);
    }, [preference]);

    return (
        <select 
            value={preference} 
            onChange={(e) => setPreference(e.target.value)}
        >
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
        </select>
    );
}
```

### Key Points

1. **Lazy initialization** — The `useState(() => {...})` function only runs once on mount
2. **Validate saved value** — Always validate localStorage values before using (could be stale/invalid)
3. **Keep it simple** — Don't JSON.parse for single string values
4. **Sync on change** — useEffect with the value in deps array ensures persistence
5. **Choose descriptive keys** — Use namespaced keys like `vcq-categorization-scheme`

### When to Use This vs. Collapsible Section Pattern

| Use Case | Pattern |
|----------|---------|
| Single toggle/dropdown | LocalStorage-Backed Preference (this pattern) |
| Multiple expand/collapse states | Collapsible Section (previous pattern) |
| Complex object state | Collapsible Section with JSON.parse/stringify |

**Real examples:**
- `vcq-categorization-scheme` toggle (VendorQuestionnaire.jsx, 2026-01-29)
- `rca-view-mode` preference (RCA.jsx)
