/**
 * Lightweight client-side tracing utility for debugging.
 * 
 * ## Enabling Traces
 * 
 * 1. **URL parameter** (one-time, shareable):
 *    - All traces: `?debug=true`
 *    - Specific: `?debug=scroll` or `?debug=scroll,nav,search`
 * 
 * 2. **Console commands** (runtime toggle):
 *    - Enable all: `window.enableTrace('*')`
 *    - Enable specific: `window.enableTrace('scroll')`
 *    - Disable: `window.disableTrace()`
 *    - Check status: `window.traceStatus()`
 * 
 * 3. **localStorage** (persistent):
 *    - `localStorage.setItem('debug', 'scroll,nav')`
 * 
 * ## Usage in Code
 * 
 * ```javascript
 * import { trace } from '../utils/trace';
 * 
 * // Simple trace
 * trace('scroll:restore', 'isBackForward:', isBackForward);
 * 
 * // Object trace (pretty-printed)
 * trace('scroll:restore', { isBackForward, savedScrollY, scrollHeight });
 * 
 * // Conditional trace (only logs if condition is met)
 * trace('scroll:restore', 'Restoring to', scrollY);
 * ```
 * 
 * ## Available Namespaces
 * 
 * | Namespace | Feature |
 * |-----------|---------|
 * | `scroll` | Scroll position save/restore |
 * | `scroll:restore` | Scroll restoration specifically |
 * | `scroll:save` | Scroll position saving |
 * | `nav` | Navigation and routing |
 * | `nav:type` | Navigation type detection |
 * | `search` | Search functionality |
 * | `search:fts` | Full-text search |
 * | `search:semantic` | Semantic search |
 * 
 * ## Why This Exists
 * 
 * Debugging "ghost conditionals" (conditions that look like they should be true
 * but are always false due to environmental factors). The scroll restoration
 * bug was caused by `isBackForward` always being false because the Performance
 * Navigation API doesn't track SPA navigations. Traces would have shown this
 * immediately: `{ isBackForward: false }`.
 * 
 * @module utils/trace
 */

// ============================================================================
// Configuration
// ============================================================================

// Color map for namespaces (makes console output scannable)
const NAMESPACE_COLORS = {
    scroll: '#4CAF50',    // Green
    nav: '#2196F3',       // Blue
    search: '#FF9800',    // Orange
    route: '#9C27B0',     // Purple
    render: '#E91E63',    // Pink
    api: '#00BCD4',       // Cyan
    default: '#607D8B',   // Gray
};

// ============================================================================
// State
// ============================================================================

let enabledNamespaces = [];
let initialized = false;

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize trace system by reading from URL and localStorage.
 * Called automatically on first trace() call.
 */
function initialize() {
    if (initialized) return;
    initialized = true;

    // Priority 1: URL parameter (highest priority, allows sharing debug links)
    const urlParams = new URLSearchParams(window.location.search);
    const urlDebug = urlParams.get('debug');

    if (urlDebug) {
        enabledNamespaces = urlDebug === 'true' ? ['*'] : urlDebug.split(',').map(s => s.trim());
        // Also persist to localStorage for page refreshes
        localStorage.setItem('debug', urlDebug);
        showBanner();
        return;
    }

    // Priority 2: localStorage (persistent across sessions)
    const lsDebug = localStorage.getItem('debug');
    if (lsDebug) {
        enabledNamespaces = lsDebug === 'true' ? ['*'] : lsDebug.split(',').map(s => s.trim());
        showBanner();
    }
}

/**
 * Show a console banner when tracing is enabled.
 */
function showBanner() {
    const namespaces = enabledNamespaces.includes('*') ? 'ALL' : enabledNamespaces.join(', ');
    console.log(
        '%c🔍 Trace Mode Enabled',
        'background: #1a1a2e; color: #4CAF50; padding: 4px 8px; border-radius: 4px; font-weight: bold',
        `\nNamespaces: ${namespaces}`,
        '\nCommands: window.disableTrace(), window.traceStatus()'
    );
}

// ============================================================================
// Runtime Controls (exposed on window for console access)
// ============================================================================

/**
 * Enable tracing for specified namespaces.
 * @param {string} namespaces - Comma-separated list or '*' for all
 */
window.enableTrace = (namespaces = '*') => {
    enabledNamespaces = namespaces === '*' ? ['*'] : namespaces.split(',').map(s => s.trim());
    localStorage.setItem('debug', namespaces);
    initialized = true;
    showBanner();
};

/**
 * Disable all tracing.
 */
window.disableTrace = () => {
    enabledNamespaces = [];
    localStorage.removeItem('debug');
    console.log('%c🔍 Trace Mode Disabled', 'color: #888');
};

/**
 * Show current trace status.
 */
window.traceStatus = () => {
    if (enabledNamespaces.length === 0) {
        console.log('%c🔍 Tracing is disabled', 'color: #888');
        console.log('Enable with: window.enableTrace("scroll") or window.enableTrace("*")');
    } else {
        const namespaces = enabledNamespaces.includes('*') ? 'ALL' : enabledNamespaces.join(', ');
        console.log(`%c🔍 Tracing enabled for: ${namespaces}`, 'color: #4CAF50');
    }
};

// ============================================================================
// Core Trace Function
// ============================================================================

/**
 * Check if a namespace is enabled.
 * @param {string} namespace - e.g., 'scroll:restore'
 * @returns {boolean}
 */
function isEnabled(namespace) {
    if (enabledNamespaces.length === 0) return false;
    if (enabledNamespaces.includes('*')) return true;

    // Check if namespace or any prefix matches
    // e.g., if 'scroll' is enabled, 'scroll:restore' should match
    return enabledNamespaces.some(enabled =>
        namespace === enabled || namespace.startsWith(enabled + ':')
    );
}

/**
 * Get color for a namespace (uses first segment).
 * @param {string} namespace 
 * @returns {string} CSS color
 */
function getColor(namespace) {
    const prefix = namespace.split(':')[0];
    return NAMESPACE_COLORS[prefix] || NAMESPACE_COLORS.default;
}

/**
 * Log a trace message if the namespace is enabled.
 * 
 * @param {string} namespace - Hierarchical namespace (e.g., 'scroll:restore')
 * @param {...any} args - Values to log (objects are pretty-printed)
 * 
 * @example
 * trace('scroll:restore', 'isBackForward:', isBackForward);
 * trace('scroll:restore', { isBackForward, savedScrollY, scrollHeight });
 */
export function trace(namespace, ...args) {
    // Lazy initialize
    if (!initialized) initialize();

    // Early exit if not enabled (zero cost)
    if (!isEnabled(namespace)) return;

    const color = getColor(namespace);
    const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm

    // Format: [HH:MM:SS.mmm] namespace: args
    console.log(
        `%c[${timestamp}]%c ${namespace}`,
        'color: #888; font-size: 0.9em',
        `color: ${color}; font-weight: bold`,
        ...args
    );
}

/**
 * Create a namespaced trace function for a module.
 * Useful to avoid repeating the namespace.
 * 
 * @param {string} namespace - Base namespace
 * @returns {Function} Bound trace function
 * 
 * @example
 * const log = createTrace('scroll:restore');
 * log('isBackForward:', isBackForward);
 * log({ savedScrollY, scrollHeight });
 */
export function createTrace(namespace) {
    return (...args) => trace(namespace, ...args);
}

/**
 * Trace a value and return it (useful for inline debugging).
 * 
 * @param {string} namespace 
 * @param {string} label 
 * @param {T} value 
 * @returns {T} The value (unchanged)
 * 
 * @example
 * const type = tap('nav:type', 'navigationType', useNavigationType());
 */
export function tap(namespace, label, value) {
    trace(namespace, label + ':', value);
    return value;
}

// ============================================================================
// Development Mode Helpers
// ============================================================================

/**
 * Assert a condition and trace if it fails.
 * Only active when tracing is enabled.
 * 
 * @param {string} namespace 
 * @param {boolean} condition 
 * @param {string} message 
 * 
 * @example
 * traceAssert('scroll:restore', isBackForward, 'Expected back/forward navigation');
 */
export function traceAssert(namespace, condition, message) {
    if (!initialized) initialize();
    if (!isEnabled(namespace)) return;

    if (!condition) {
        console.warn(
            `%c[ASSERT FAILED]%c ${namespace}: ${message}`,
            'background: #ff5722; color: white; padding: 2px 4px; border-radius: 2px',
            'color: #ff5722'
        );
    }
}
