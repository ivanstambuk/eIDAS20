#!/usr/bin/env node
/**
 * validate-css-classes.js
 * 
 * Build-time validation to ensure CSS class names used in JSX/JS templates
 * have corresponding definitions in CSS files.
 * 
 * Created after DEC-062 retro: A class name mismatch (amendment-info vs amendment-notice)
 * caused styling to silently fail.
 * 
 * Usage:
 *   node scripts/validate-css-classes.js
 *   npm run validate:css
 * 
 * Exit codes:
 *   0 - All classes validated (or only warnings)
 *   1 - Orphaned classes found in templates (ERROR)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recursively find files matching extensions.
 */
function findFiles(dir, extensions, results = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules') {
            findFiles(fullPath, extensions, results);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
            results.push(fullPath);
        }
    }
    return results;
}

const CONFIG = {
    // Directories to scan for JSX/JS templates
    templateDirs: [
        path.join(__dirname, '..', 'src'),
    ],

    // Directories to scan for CSS files
    cssDirs: [
        path.join(__dirname, '..', 'src'),
    ],

    // Class name prefixes to validate (others are ignored)
    // This focuses validation on our custom component classes
    prefixesToValidate: [
        'citation-popover-',
        'term-popover-',
        'regulation-',
        'terminology-',
        'sidebar-',
        'toc-',
        'search-',
        'copy-',
    ],

    // Known global/utility classes to ignore (from frameworks, CSS vars, etc.)
    ignoreClasses: new Set([
        // Common utility classes
        'active',
        'disabled',
        'hidden',
        'visible',
        'loading',
        'error',
        'success',
        // External libraries
        'hljs',
        // Uses inline styles, class is for semantics only
        'sidebar-backdrop',
    ]),

    // Patterns to ignore (contains template expressions like ${...})
    ignorePatterns: [
        /\$\{.*\}/,  // Template literals with expressions
    ],
};

// =============================================================================
// EXTRACTION FUNCTIONS
// =============================================================================

/**
 * Extract CSS class selectors from a CSS file.
 * @param {string} content - CSS file content
 * @returns {Set<string>} - Set of class names (without the dot)
 */
function extractCssClasses(content) {
    const classes = new Set();

    // Match .class-name patterns (handles pseudo-classes, combinators)
    // Regex: dot, followed by valid class chars, stopped by space/comma/brace/colon/etc
    const regex = /\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g;

    let match;
    while ((match = regex.exec(content)) !== null) {
        classes.add(match[1]);
    }

    return classes;
}

/**
 * Extract class names used in JSX/JS template strings.
 * Handles: class="...", className="...", className={`...`}, class="..." in template literals
 * @param {string} content - JS/JSX file content
 * @returns {Set<string>} - Set of class names used
 */
function extractTemplateClasses(content) {
    const classes = new Set();

    // Pattern 1: class="class1 class2" or className="class1 class2"
    const staticPattern = /class(?:Name)?=["']([^"']+)["']/g;
    let match;
    while ((match = staticPattern.exec(content)) !== null) {
        match[1].split(/\s+/).forEach(cls => {
            if (cls.trim()) classes.add(cls.trim());
        });
    }

    // Pattern 2: class="..." inside template literals (backtick strings)
    // e.g., `<div class="citation-popover-notice">...</div>`
    const templateLiteralPattern = /class=\\"([^"\\]+)\\"/g;
    while ((match = templateLiteralPattern.exec(content)) !== null) {
        match[1].split(/\s+/).forEach(cls => {
            if (cls.trim()) classes.add(cls.trim());
        });
    }

    // Pattern 3: class="${...}" template string with direct class in content
    // We also catch class="something-${var}" but only extract the static part
    const mixedPattern = /class=(?:\\)?["']([a-zA-Z_-][a-zA-Z0-9_-]*)/g;
    while ((match = mixedPattern.exec(content)) !== null) {
        if (match[1].trim()) classes.add(match[1].trim());
    }

    return classes;
}

// =============================================================================
// MAIN VALIDATION
// =============================================================================

async function main() {
    console.log('='.repeat(60));
    console.log('🎨 CSS Class Validation');
    console.log('='.repeat(60));

    // Step 1: Collect all CSS class definitions
    const cssFiles = findFiles(CONFIG.cssDirs[0], ['.css']);

    const definedClasses = new Set();
    for (const file of cssFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const classes = extractCssClasses(content);
        classes.forEach(cls => definedClasses.add(cls));
    }
    console.log(`📁 Scanned ${cssFiles.length} CSS files → ${definedClasses.size} class definitions`);

    // Step 2: Collect all class usages in templates
    const templateFiles = findFiles(CONFIG.templateDirs[0], ['.js', '.jsx', '.ts', '.tsx']);

    const usedClasses = new Map(); // class -> [files where used]
    for (const file of templateFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const classes = extractTemplateClasses(content);
        classes.forEach(cls => {
            if (!usedClasses.has(cls)) {
                usedClasses.set(cls, []);
            }
            usedClasses.get(cls).push(path.relative(CONFIG.templateDirs[0], file));
        });
    }
    console.log(`📁 Scanned ${templateFiles.length} template files → ${usedClasses.size} class usages`);

    // Step 3: Find orphaned classes (used but not defined)
    const orphanedClasses = [];

    for (const [cls, files] of usedClasses) {
        // Skip ignored classes
        if (CONFIG.ignoreClasses.has(cls)) continue;

        // Skip classes matching ignore patterns (e.g., dynamic ${...} classes)
        if (CONFIG.ignorePatterns.some(pattern => pattern.test(cls))) continue;

        // Only validate classes with our prefixes
        const shouldValidate = CONFIG.prefixesToValidate.some(prefix => cls.startsWith(prefix));
        if (!shouldValidate) continue;

        // Check if defined
        if (!definedClasses.has(cls)) {
            orphanedClasses.push({ class: cls, files });
        }
    }

    // Step 4: Report results
    console.log();

    if (orphanedClasses.length === 0) {
        console.log('✅ All template classes have CSS definitions');
        console.log('='.repeat(60));
        process.exit(0);
    } else {
        console.log(`❌ Found ${orphanedClasses.length} orphaned class(es):`);
        console.log();

        for (const { class: cls, files } of orphanedClasses) {
            console.log(`   ⚠️  .${cls}`);
            files.forEach(f => console.log(`       └── ${f}`));
        }

        console.log();
        console.log('These classes are used in templates but have no CSS definition.');
        console.log('Either add the CSS rule or fix the class name typo.');
        console.log('='.repeat(60));
        process.exit(1);
    }
}

main().catch(err => {
    console.error('❌ Validation failed:', err);
    process.exit(1);
});
