# Browser Testing Patterns

## Hover Testing

### ⚠️ Use Real Mouse Movement, Not JS Events

When testing hover popovers/tooltips with the browser subagent:

**DON'T** rely solely on JavaScript `dispatchEvent`:
```javascript
// This often fails to trigger event listeners properly
element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
```

**DO** use `browser_move_mouse` followed by `wait`:
```
1. browser_move_mouse to element coordinates
2. wait 500-1000ms for popover to appear
3. capture_browser_screenshot to verify
```

### Why JS Events Fail

Event listeners attached via `addEventListener('mouseenter', ...)` on parent elements
using event delegation may not receive programmatically dispatched events the same way
as real browser interactions. The event bubbling and target detection differs.

### Recommended Pattern

```markdown
Task for browser subagent:
1. Find element coordinates via JavaScript
2. Use browser_move_mouse to those coordinates  
3. Wait 500ms for hover effect
4. Capture screenshot to verify
```

### Getting Element Coordinates

```javascript
const el = document.querySelector('.my-element');
const rect = el.getBoundingClientRect();
// Return { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }
```

---

## Screenshot Verification

Always verify browser subagent claims by viewing actual screenshots:
1. Check the step output for `Saved screenshot to: /path/...`
2. Use `view_file` on the screenshot path
3. Confirm visual elements match expectations

The subagent's text claims may not reflect actual browser state.

---

## Tab Cleanup

Chrome tabs accumulate across sessions. Run cleanup before browser testing:
```bash
~/dev/eIDAS20/scripts/cleanup-chrome-tabs.sh
```
