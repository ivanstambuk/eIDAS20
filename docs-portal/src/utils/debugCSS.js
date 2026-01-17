/**
 * CSS Debug Mode - Visual debugging for element boundaries and structure.
 * 
 * ## Enabling CSS Debug Mode
 * 
 * 1. **URL parameter** (shareable):
 *    - All CSS debug: `?debug=css`
 *    - Specific modes: `?debug=css:linkables` or `?debug=css:gutters`
 *    - Multiple: `?debug=css:linkables,css:gutters`
 *    - Combined with trace: `?debug=scroll,css:linkables`
 * 
 * 2. **Console commands** (runtime toggle):
 *    - Enable: `window.enableCSSDebug()` or `window.enableCSSDebug('linkables')`
 *    - Disable: `window.disableCSSDebug()`
 *    - Toggle specific: `window.toggleCSSDebug('gutters')`
 *    - Check status: `window.cssDebugStatus()`
 * 
 * ## Available Modes
 * 
 * | Mode       | What It Shows |
 * |------------|---------------|
 * | `linkables`| Paragraph (red), point (blue), subpoint (green), recital (orange) |
 * | `gutters`  | Gutter icon containers (yellow) |
 * | `citations`| Citation reference links (cyan) |
 * | `structure`| Articles (purple), chapters (pink) |
 * | `hover`    | Currently hovered element (thick outline) |
 * | `all`      | Enable all of the above |
 * 
 * ## Visual Legend
 * 
 * When enabled, a legend appears in the bottom-right corner showing:
 * - Color codes for each element type
 * - ID/class labels on elements
 * 
 * ## Why This Exists
 * 
 * The duplicate gutter icon bug was caused by incorrect class assignment
 * (all elements had `linkable-paragraph`, none had `linkable-point`).
 * Visual CSS debugging would have instantly revealed this - all elements
 * would have been red (paragraph) when some should have been blue (point).
 * 
 * @module utils/debugCSS
 */

// ============================================================================
// CSS Rules for each debug mode
// ============================================================================

const DEBUG_STYLES = {
    // Linkable elements - document structure
    linkables: `
        /* Paragraphs - red dashed outline */
        body.debug-css-linkables .linkable-paragraph {
            outline: 2px dashed #ef4444 !important;
            outline-offset: -2px;
        }
        body.debug-css-linkables .linkable-paragraph::after {
            content: "P:" attr(id);
            position: absolute;
            top: 0;
            right: 0;
            background: #ef4444;
            color: white;
            font-size: 9px;
            padding: 1px 4px;
            border-radius: 0 0 0 4px;
            font-family: monospace;
            z-index: 1000;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* Points - blue dashed outline */
        body.debug-css-linkables .linkable-point {
            outline: 2px dashed #3b82f6 !important;
            outline-offset: -2px;
        }
        body.debug-css-linkables .linkable-point::after {
            content: "PT:" attr(id);
            position: absolute;
            top: 0;
            right: 0;
            background: #3b82f6;
            color: white;
            font-size: 9px;
            padding: 1px 4px;
            border-radius: 0 0 0 4px;
            font-family: monospace;
            z-index: 1001;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* Subpoints - green dashed outline */
        body.debug-css-linkables .linkable-subpoint {
            outline: 2px dashed #22c55e !important;
            outline-offset: -2px;
        }
        body.debug-css-linkables .linkable-subpoint::after {
            content: "SP:" attr(id);
            position: absolute;
            top: 0;
            right: 0;
            background: #22c55e;
            color: white;
            font-size: 9px;
            padding: 1px 4px;
            border-radius: 0 0 0 4px;
            font-family: monospace;
            z-index: 1002;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* Recitals - orange dashed outline */
        body.debug-css-linkables .linkable-recital {
            outline: 2px dashed #f97316 !important;
            outline-offset: -2px;
        }
        body.debug-css-linkables .linkable-recital::after {
            content: "R:" attr(id);
            position: absolute;
            top: 0;
            right: 0;
            background: #f97316;
            color: white;
            font-size: 9px;
            padding: 1px 4px;
            border-radius: 0 0 0 4px;
            font-family: monospace;
            z-index: 1000;
        }
    `,

    // Gutter icons - shows where copy buttons are positioned
    gutters: `
        body.debug-css-gutters .copy-gutter {
            background: rgba(234, 179, 8, 0.3) !important;
            outline: 2px solid #eab308 !important;
            opacity: 1 !important;
        }
        body.debug-css-gutters .copy-gutter::before {
            content: "GUTTER";
            position: absolute;
            top: -14px;
            left: 0;
            background: #eab308;
            color: black;
            font-size: 8px;
            padding: 1px 3px;
            border-radius: 2px;
            font-family: monospace;
        }
    `,

    // Citation links
    citations: `
        body.debug-css-citations .citation-ref {
            outline: 2px solid #06b6d4 !important;
            background: rgba(6, 182, 212, 0.1) !important;
        }
        body.debug-css-citations .citation-ref::after {
            content: "CITE:" attr(data-celex);
            position: absolute;
            bottom: 100%;
            left: 0;
            background: #06b6d4;
            color: white;
            font-size: 8px;
            padding: 1px 3px;
            border-radius: 2px;
            font-family: monospace;
            white-space: nowrap;
        }
    `,

    // Document structure (articles, chapters)
    structure: `
        body.debug-css-structure h2[id^="article-"],
        body.debug-css-structure h3[id^="article-"] {
            outline: 3px solid #a855f7 !important;
            outline-offset: 2px;
        }
        body.debug-css-structure h2[id^="article-"]::before,
        body.debug-css-structure h3[id^="article-"]::before {
            content: "ART:" attr(id);
            display: block;
            background: #a855f7;
            color: white;
            font-size: 9px;
            padding: 2px 6px;
            margin-bottom: 4px;
            border-radius: 2px;
            font-family: monospace;
            width: fit-content;
        }
        body.debug-css-structure h2[id^="chapter-"] {
            outline: 3px solid #ec4899 !important;
            outline-offset: 2px;
        }
    `,

    // Hover state visualization
    hover: `
        body.debug-css-hover .linkable-paragraph:hover,
        body.debug-css-hover .linkable-point:hover,
        body.debug-css-hover .linkable-subpoint:hover,
        body.debug-css-hover .linkable-recital:hover {
            outline-width: 4px !important;
            outline-style: solid !important;
        }
        body.debug-css-hover .linkable-paragraph:hover {
            outline-color: #ef4444 !important;
        }
        body.debug-css-hover .linkable-point:hover {
            outline-color: #3b82f6 !important;
        }
        body.debug-css-hover .linkable-subpoint:hover {
            outline-color: #22c55e !important;
        }
        body.debug-css-hover .linkable-recital:hover {
            outline-color: #f97316 !important;
        }
    `,

    // Legend overlay
    legend: `
        body.debug-css-legend::after {
            content: "DEBUG CSS MODE";
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 11px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            line-height: 1.6;
        }
        body.debug-css-linkables.debug-css-legend::after {
            content: "🔍 CSS DEBUG\\A━━━━━━━━━━━━━━\\A🔴 Paragraph\\A🔵 Point\\A🟢 Subpoint\\A🟠 Recital\\A\\ADisable: disableCSSDebug()";
            white-space: pre;
        }
        body.debug-css-gutters.debug-css-legend::after {
            content: "🔍 CSS DEBUG\\A━━━━━━━━━━━━━━\\A🟡 Gutter icons\\A\\ADisable: disableCSSDebug()";
            white-space: pre;
        }
    `
};

// ============================================================================
// State
// ============================================================================

let styleElement = null;
let enabledModes = new Set();
let initialized = false;

// All available modes
const ALL_MODES = ['linkables', 'gutters', 'citations', 'structure', 'hover', 'legend'];

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize CSS debug mode by reading from URL and localStorage.
 */
function initialize() {
    if (initialized) return;
    initialized = true;

    // Create style element for injecting debug CSS
    styleElement = document.createElement('style');
    styleElement.id = 'debug-css-styles';
    document.head.appendChild(styleElement);

    // Check URL for debug params
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug');

    if (debugParam) {
        // Parse debug param: could be "css", "css:linkables", "css:linkables,css:gutters", etc.
        const parts = debugParam.split(',').map(s => s.trim());

        for (const part of parts) {
            if (part === 'css') {
                // Enable default modes (linkables + hover + legend)
                enableMode('linkables');
                enableMode('hover');
                enableMode('legend');
            } else if (part.startsWith('css:')) {
                const mode = part.slice(4); // Remove 'css:' prefix
                if (mode === 'all') {
                    ALL_MODES.forEach(m => enableMode(m));
                } else if (ALL_MODES.includes(mode)) {
                    enableMode(mode);
                    enableMode('legend'); // Always show legend
                }
            }
        }
    }

    // Check localStorage for persistent debug state
    const lsDebugCSS = localStorage.getItem('debug-css');
    if (lsDebugCSS && enabledModes.size === 0) {
        lsDebugCSS.split(',').forEach(mode => {
            if (ALL_MODES.includes(mode)) {
                enableMode(mode);
            }
        });
    }

    if (enabledModes.size > 0) {
        showBanner();
        updateStyles();
    }
}

/**
 * Show a console banner when CSS debug is enabled.
 */
function showBanner() {
    const modes = Array.from(enabledModes).join(', ');
    console.log(
        '%c🎨 CSS Debug Mode Enabled',
        'background: #1a1a2e; color: #3b82f6; padding: 4px 8px; border-radius: 4px; font-weight: bold',
        `\nModes: ${modes}`,
        '\nCommands: window.disableCSSDebug(), window.cssDebugStatus(), window.toggleCSSDebug("gutters")'
    );
}

// ============================================================================
// Mode Management
// ============================================================================

/**
 * Enable a debug mode.
 */
function enableMode(mode) {
    if (!ALL_MODES.includes(mode)) {
        console.warn(`Unknown CSS debug mode: ${mode}. Available: ${ALL_MODES.join(', ')}`);
        return;
    }
    enabledModes.add(mode);
    document.body.classList.add(`debug-css-${mode}`);
}

/**
 * Disable a debug mode.
 */
function disableMode(mode) {
    enabledModes.delete(mode);
    document.body.classList.remove(`debug-css-${mode}`);
}

/**
 * Update the injected style element with current modes.
 */
function updateStyles() {
    if (!styleElement) return;

    let css = '/* CSS Debug Mode Styles */\n';
    for (const mode of enabledModes) {
        if (DEBUG_STYLES[mode]) {
            css += `\n/* Mode: ${mode} */\n${DEBUG_STYLES[mode]}\n`;
        }
    }
    styleElement.textContent = css;

    // Persist to localStorage
    if (enabledModes.size > 0) {
        localStorage.setItem('debug-css', Array.from(enabledModes).join(','));
    } else {
        localStorage.removeItem('debug-css');
    }
}

// ============================================================================
// Runtime Controls (exposed on window for console access)
// ============================================================================

/**
 * Enable CSS debug mode.
 * @param {string} [modes] - Comma-separated modes or 'all'. Default: 'linkables,hover,legend'
 */
window.enableCSSDebug = (modes = 'linkables,hover,legend') => {
    if (!initialized) initialize();

    const modeList = modes === 'all' ? ALL_MODES : modes.split(',').map(s => s.trim());
    modeList.forEach(mode => enableMode(mode));
    updateStyles();

    console.log(
        `%c🎨 CSS Debug: ${Array.from(enabledModes).join(', ')}`,
        'color: #3b82f6; font-weight: bold'
    );
};

/**
 * Disable all CSS debug modes.
 */
window.disableCSSDebug = () => {
    ALL_MODES.forEach(mode => disableMode(mode));
    if (styleElement) {
        styleElement.textContent = '';
    }
    localStorage.removeItem('debug-css');
    console.log('%c🎨 CSS Debug Mode Disabled', 'color: #888');
};

/**
 * Toggle a specific debug mode.
 */
window.toggleCSSDebug = (mode) => {
    if (!initialized) initialize();

    if (enabledModes.has(mode)) {
        disableMode(mode);
        console.log(`%c🎨 CSS Debug: ${mode} disabled`, 'color: #888');
    } else {
        enableMode(mode);
        console.log(`%c🎨 CSS Debug: ${mode} enabled`, 'color: #3b82f6');
    }
    updateStyles();
};

/**
 * Show current CSS debug status.
 */
window.cssDebugStatus = () => {
    if (enabledModes.size === 0) {
        console.log('%c🎨 CSS Debug is disabled', 'color: #888');
        console.log(`Available modes: ${ALL_MODES.join(', ')}`);
        console.log('Enable with: window.enableCSSDebug() or window.enableCSSDebug("gutters")');
    } else {
        console.log(
            `%c🎨 CSS Debug active: ${Array.from(enabledModes).join(', ')}`,
            'color: #3b82f6'
        );
    }
};

// ============================================================================
// Auto-initialization
// ============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Export for explicit import in components
export function initCSSDebug() {
    initialize();
}

export default { initCSSDebug };
