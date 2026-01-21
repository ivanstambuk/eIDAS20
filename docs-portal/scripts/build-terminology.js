/**
 * Build-time script: Extract terminology from eIDAS regulations
 * 
 * This script scans all regulation markdown files for legal definitions
 * and generates a terminology.json file for the documentation portal.
 * 
 * Definition patterns recognized:
 *   - (N) 'term' means definition;
 *   - (Na) 'term' means definition;
 * 
 * Usage: node scripts/build-terminology.js
 * 
 * Output: public/data/terminology.json
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths relative to docs-portal
const PROJECT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'terminology.json');
const DOC_CONFIG_FILE = join(__dirname, 'document-config.json');
const CONFIG_DIR = join(__dirname, '..', 'config');
const TERM_ROLES_FILE = join(CONFIG_DIR, 'term-roles.json');
const TERM_DOMAINS_FILE = join(CONFIG_DIR, 'term-domains.json');
const FILTERS_CONFIG_FILE = join(CONFIG_DIR, 'terminology-filters.yaml');
const REGULATIONS_INDEX_FILE = join(OUTPUT_DIR, 'regulations-index.json');

// Source directories
const SOURCE_DIRS = [
    { path: join(PROJECT_ROOT, '01_regulation'), type: 'regulation' },
    { path: join(PROJECT_ROOT, '02_implementing_acts'), type: 'implementing-act' }
];

// Supplementary terminology file (DEC-092: verbatim definitions from non-legal sources)
// This YAML file contains manually curated definitions from sources like EC FAQ
const SUPPLEMENTARY_TERMS_FILE = join(__dirname, 'supplementary-terms.yaml');

/**
 * Load human-friendly document titles from regulations-index.json
 * This provides shortTitle (e.g., "eIDAS 2.0 Regulation (Consolidated)") 
 * instead of formal references (e.g., "Regulation 910/2014")
 */
function loadDocumentTitles() {
    try {
        const data = JSON.parse(readFileSync(REGULATIONS_INDEX_FILE, 'utf-8'));
        const titleMap = {};
        for (const doc of data) {
            titleMap[doc.slug] = doc.shortTitle || doc.title;
        }
        return titleMap;
    } catch (err) {
        console.warn('⚠️  Could not load regulations-index.json:', err.message);
        console.warn('   This is normal on first build. Using fallback titles.');
        return {};
    }
}

/**
 * Load role mappings from config file
 */
function loadRoleMappings() {
    try {
        const data = JSON.parse(readFileSync(TERM_ROLES_FILE, 'utf-8'));
        return {
            roles: data.roles || {},
            mappings: data.mappings || {}
        };
    } catch (err) {
        console.warn('⚠️  Could not load term-roles.json:', err.message);
        return { roles: {}, mappings: {} };
    }
}

/**
 * Load domain mappings from config file
 */
function loadDomainMappings() {
    try {
        const data = JSON.parse(readFileSync(TERM_DOMAINS_FILE, 'utf-8'));
        return {
            domains: data.domains || {},
            mappings: data.mappings || {}
        };
    } catch (err) {
        console.warn('⚠️  Could not load term-domains.json:', err.message);
        return { domains: {}, mappings: {} };
    }
}

/**
 * Load filter configuration (YAML)
 * Simple YAML parser for our specific format
 */
function loadFilterConfig() {
    try {
        const content = readFileSync(FILTERS_CONFIG_FILE, 'utf-8');
        // Simple YAML parsing for our specific structure
        const documentTypes = {};
        let currentType = null;
        let inDocTypes = false;

        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (trimmed.startsWith('#') || !trimmed) continue;

            if (trimmed === 'documentTypes:') {
                inDocTypes = true;
                continue;
            }

            if (!inDocTypes) continue;

            // Type definition (e.g., "eidas:")
            const typeMatch = line.match(/^  (\w+):$/);
            if (typeMatch) {
                currentType = typeMatch[1];
                documentTypes[currentType] = { matchCategories: [] };
                continue;
            }

            if (currentType && line.startsWith('    ')) {
                // Property line
                const labelMatch = line.match(/label:\s*["']?([^"']+)["']?/);
                const descMatch = line.match(/description:\s*["']?([^"']+)["']?/);
                const colorMatch = line.match(/color:\s*["']?([^"'#]+|#[A-Fa-f0-9]+)["']?/);
                const catMatch = line.match(/- ["']?([^"']+)["']?/);

                if (labelMatch) documentTypes[currentType].label = labelMatch[1].trim();
                if (descMatch) documentTypes[currentType].description = descMatch[1].trim();
                if (colorMatch) documentTypes[currentType].color = colorMatch[1].trim();
                if (catMatch) documentTypes[currentType].matchCategories.push(catMatch[1].trim());
            }
        }

        return { documentTypes };
    } catch (err) {
        console.warn('⚠️  Could not load terminology-filters.yaml:', err.message);
        return { documentTypes: {} };
    }
}

/**
 * Load supplementary terminology from YAML file
 * Per DEC-092: These definitions are preserved verbatim from non-legal sources
 * 
 * Returns array of term objects compatible with the main extraction pipeline
 */
function loadSupplementaryTerms() {
    if (!existsSync(SUPPLEMENTARY_TERMS_FILE)) {
        return [];
    }

    try {
        const content = readFileSync(SUPPLEMENTARY_TERMS_FILE, 'utf-8');
        const terms = [];
        let source = {};
        let currentTerm = null;
        let inTerms = false;
        let inDefinition = false;
        let definitionLines = [];

        for (const line of content.split('\n')) {
            const trimmed = line.trim();

            // Skip comments and empty lines (unless we're in a multi-line definition)
            if (trimmed.startsWith('#')) continue;
            if (!trimmed && !inDefinition) continue;

            // Parse source metadata
            if (line.startsWith('  id:') && !inTerms) {
                source.id = trimmed.split(':')[1].trim();
                continue;
            }
            if (line.startsWith('  slug:') && !inTerms) {
                source.slug = trimmed.split(':')[1].trim();
                continue;
            }
            if (line.startsWith('  shortRef:') && !inTerms) {
                source.shortRef = trimmed.split(':')[1].trim();
                continue;
            }
            if (line.startsWith('  category:') && !inTerms) {
                source.category = trimmed.split(':')[1].trim();
                continue;
            }
            if (line.startsWith('  type:') && !inTerms) {
                source.type = trimmed.split(':')[1].trim();
                continue;
            }

            // Start of terms section
            if (trimmed === 'terms:') {
                inTerms = true;
                continue;
            }

            if (!inTerms) continue;

            // New term entry (starts with "- term:")
            if (trimmed.startsWith('- term:')) {
                // Save previous term if exists
                if (currentTerm && currentTerm.definition) {
                    terms.push({
                        term: currentTerm.term,
                        definition: currentTerm.definition.trim(),
                        source: {
                            celex: null,
                            title: source.shortRef || 'Supplementary Source',
                            shortRef: source.shortRef || 'Supplementary',
                            slug: source.slug || source.id,
                            type: source.type || 'faq',
                            category: source.category || 'supplementary',
                            article: currentTerm.sectionTitle || currentTerm.section || 'N/A',
                            // sectionId: The actual HTML element ID for deep linking (slug form)
                            // article: Human-readable display text for the article number
                            sectionId: currentTerm.section || null,
                            ordinal: null
                        }
                    });
                }

                // Start new term
                currentTerm = {
                    term: trimmed.replace('- term:', '').trim(),
                    definition: '',
                    section: null,
                    sectionTitle: null  // Human-readable title for display
                };
                inDefinition = false;
                definitionLines = [];
                continue;
            }

            // Multi-line definition (starts with "definition: >-" or continues with indented text)
            if (trimmed.startsWith('definition:')) {
                const defStart = trimmed.replace('definition:', '').trim();
                if (defStart === '>-') {
                    inDefinition = true;
                    definitionLines = [];
                } else {
                    // Single-line definition
                    currentTerm.definition = defStart.replace(/^["']|["']$/g, '').trim();
                }
                continue;
            }

            // Continuation of multi-line definition
            if (inDefinition && line.startsWith('      ')) {
                definitionLines.push(trimmed);
                currentTerm.definition = definitionLines.join(' ').replace(/\s+/g, ' ').trim();
                continue;
            }

            // End of multi-line definition (found a new field)
            if (inDefinition && (trimmed.startsWith('section:') || trimmed.startsWith('note:') || trimmed.startsWith('- term:'))) {
                inDefinition = false;
            }

            // Section ID
            if (trimmed.startsWith('section:') && currentTerm) {
                currentTerm.section = trimmed.split(':')[1].trim();
                continue;
            }

            // Note field (informational, not stored in terminology.json)
            if (trimmed.startsWith('note:')) {
                continue;
            }

            // sectionTitle field (human-readable title for display)
            if (trimmed.startsWith('sectionTitle:') && currentTerm) {
                // Handle quoted strings
                const titlePart = trimmed.replace('sectionTitle:', '').trim();
                currentTerm.sectionTitle = titlePart.replace(/^["']|["']$/g, '');
                continue;
            }
        }

        // Don't forget the last term!
        if (currentTerm && currentTerm.definition) {
            terms.push({
                term: currentTerm.term,
                definition: currentTerm.definition.trim(),
                source: {
                    celex: null,
                    title: source.shortRef || 'Supplementary Source',
                    shortRef: source.shortRef || 'Supplementary',
                    slug: source.slug || source.id,
                    type: source.type || 'faq',
                    category: source.category || 'supplementary',
                    article: currentTerm.sectionTitle || currentTerm.section || 'N/A',
                    // sectionId: The actual HTML element ID for deep linking (slug form)
                    sectionId: currentTerm.section || null,
                    ordinal: null
                }
            });
        }

        return terms;
    } catch (err) {
        console.warn('⚠️  Could not load supplementary-terms.yaml:', err.message);
        return [];
    }
}

/**
 * Extract CELEX identifier from document content
 */
function extractCelex(content) {
    const match = content.match(/>\s*\*\*CELEX:\*\*\s*(\S+)/);
    return match ? match[1] : null;
}

/**
 * Extract document title from content
 */
function extractTitle(content) {
    const match = content.match(/^# (.+)$/m);
    return match ? match[1].trim() : 'Unknown Document';
}

/**
 * Generate a short reference from the document title
 */
function extractShortRef(title, celex) {
    // Try regulation format (EU or EC)
    const regMatch = title.match(/Regulation \((?:EU|EC)\) (?:No )?([\d/]+)/);
    if (regMatch) return `Regulation ${regMatch[1]}`;

    // Try implementing regulation format
    const implMatch = title.match(/Implementing Regulation \(EU\) ([\d/]+)/);
    if (implMatch) return `IR ${implMatch[1]}`;

    // Fallback to CELEX-based reference
    if (celex) {
        const celexMatch = celex.match(/3(\d{4})R?(\d+)/);
        if (celexMatch) return `${celexMatch[1]}/${celexMatch[2]}`;
    }

    return title.substring(0, 40);
}

/**
 * Generate URL slug from directory name
 */
function generateSlug(dirName, type) {
    // For regulations like "910_2014_eIDAS_Consolidated" -> "910-2014"
    if (type === 'regulation') {
        const regMatch = dirName.match(/^(\d+)_(\d{4})/);
        if (regMatch) {
            const num1 = parseInt(regMatch[1]);
            const num2 = parseInt(regMatch[2]);
            if (num1 < 10000 && num2 >= 2000) {
                return `${num1}-${num2}`;
            }
        }
    }

    // For implementing acts like "2024_2977_PID_and_EAA" -> "2024-2977"
    const match = dirName.match(/^(\d{4})_(\d+)/);
    if (match) return `${match[1]}-${match[2]}`;

    return dirName.toLowerCase().replace(/_/g, '-');
}

/**
 * Find the Article containing definitions in a document
 * Returns the article number (usually "2" or "3" for main definition articles)
 */
function findDefinitionArticle(content) {
    // Pattern 1: eIDAS format - "### Article 3" followed by "**Definitions**" (may have blank lines between)
    const pattern1 = /^### Article (\d+\w?)\s*\n+\*\*Definitions?\*\*/gm;
    const match1 = pattern1.exec(content);
    if (match1) return match1[1];

    // Pattern 2: EU format - "### Article 2 - Definitions"
    const pattern2 = /^### Article (\d+\w?)\s*-\s*Definitions/gm;
    const match2 = pattern2.exec(content);
    if (match2) return match2[1];

    // Pattern 3: Content-based - "following definitions apply"
    const pattern3 = /^### Article (\d+\w?)\s*\n.*\n.*following definitions (?:shall )?apply/gmi;
    const match3 = pattern3.exec(content);
    if (match3) return match3[1];

    return null;
}

/**
 * Extract definitions from document content
 * Returns array of { term, definition, number } objects
 */
function extractDefinitions(content) {
    const definitions = [];

    // Pattern 1: eIDAS format - (N) 'term' means definition
    // Also handles: (Na) 'term' for numbered variants like (5a)
    // Also handles: (a), (b), (c) for letter-based ordinals (used in ePrivacy Directive 2002/58)
    // Handles markdown list format: "- (N) 'term' means..."
    // Captures: ordinal, term, definition
    //
    // TERMINATION (critical for correctness):
    //   - Stops at: semicolon (;), period (.), or newline (\n)
    //   - This prevents greedy capture of subsequent articles
    //   - See DEC-055 for rationale
    // NOTE: Supports both ASCII quotes (') and Unicode curly quotes (U+2018, U+2019) - EUR-Lex uses curly quotes
    const defPatternParens = /^(?:-\s*)?\((\d+\w?|[a-z])\)\s*[\u0027\u2018\u2019]([^\u0027\u2018\u2019]+)[\u0027\u2018\u2019]\s*means,?\s+([^;.\n]+)(?:[;.]|\n|$)/gm;

    // Pattern 2: EU numbered list format - N. 'term' means definition
    // Used in older regulations like 765/2008 (Article 2: Definitions)
    // 
    // Supports both:
    // - Plain markdown: "3. 'manufacturer' means..."
    // - HTML li tags: "<li...>3. 'manufacturer' means...</li>" (for legal fidelity)
    //
    // TERMINATION (critical for correctness):
    //   - Must stop at semicolon (;), period (.), OR newline (\n) OR closing tag
    //   - Definition 21 in 765/2008 ends with period, not semicolon
    //   - Without period termination, regex captures entire rest of document
    //   - See DEC-055 for the greedy regex bug this fixes
    // NOTE: Supports both ASCII quotes (') and Unicode curly quotes (U+2018, U+2019) - EUR-Lex uses curly quotes
    const defPatternNumbered = /(?:^|>)(\d+)\.\s+[\u0027\u2018\u2019]([^\u0027\u2018\u2019]+)[\u0027\u2018\u2019]\s*means\s+([^;.<\n]+)(?:[;.]|<|\n|$)/gm;

    // Try pattern 1 (parenthesized)
    let match;
    while ((match = defPatternParens.exec(content)) !== null) {
        const ordinal = match[1];
        const term = match[2].trim();
        // Clean up definition: remove trailing semicolon/period, normalize whitespace
        let definition = match[3]
            .replace(/[;.]?\s*$/, '')
            .replace(/\s+/g, ' ')
            .trim();

        // Skip very short or malformed definitions
        if (definition.length < 10) continue;

        definitions.push({
            ordinal,
            term,
            definition
        });
    }

    // Try pattern 2 (numbered list) if we didn't find many definitions
    if (definitions.length < 5) {
        while ((match = defPatternNumbered.exec(content)) !== null) {
            const ordinal = match[1];
            const term = match[2].trim();
            // Clean up definition: remove trailing semicolon, normalize whitespace
            let definition = match[3]
                .replace(/;\s*$/, '')
                .replace(/\s+/g, ' ')
                .trim();

            // Skip very short or malformed definitions
            if (definition.length < 10) continue;

            definitions.push({
                ordinal,
                term,
                definition
            });
        }
    }

    return definitions;
}

/**
 * Process a single markdown file for terminology
 * @param {Object} docConfig - Document configuration with terminologySource flag
 */
function processFile(filePath, dirName, type, docConfig) {
    const content = readFileSync(filePath, 'utf-8');
    const terms = [];

    const celex = extractCelex(content);
    const title = extractTitle(content);
    const shortRef = extractShortRef(title, celex);
    const slug = generateSlug(dirName, type);

    // Check if this document should be a terminology source (DEC-005)
    const config = docConfig.documents[slug] || docConfig.defaults;
    if (!config.terminologySource) {
        return { terms: [], skipped: true, slug };
    }

    // Get category for display ordering (DEC-039)
    // ⚠️ IMPORTANT: If document is not in document-config.json, this falls back to 'primary'
    // which is WRONG for referenced regulations (2019-881, 2022-2555, etc.)
    // Without explicit category, mergeTerms() will use shortRef ("Regulation 2019/881")
    // instead of the human-friendly shortTitle ("Cybersecurity Act (Consolidated)")
    // See: /import-regulation workflow Step 4.5 for the required config update
    const category = config.category || (type === 'implementing-act' ? 'implementing-act' : 'primary');

    const definitionArticle = findDefinitionArticle(content);

    const definitions = extractDefinitions(content);

    for (const def of definitions) {
        terms.push({
            term: def.term,
            definition: def.definition,
            source: {
                celex,
                title,
                shortRef,
                slug,
                type,
                category,  // Add category for display ordering
                article: definitionArticle || 'N/A',
                ordinal: def.ordinal
            }
        });
    }

    return { terms, skipped: false, slug };
}

/**
 * Scan a source directory for markdown files
 * @param {Object} docConfig - Document configuration
 */
function scanDirectory(sourceDir, type, docConfig) {
    const terms = [];
    let skippedDocs = [];

    if (!existsSync(sourceDir)) {
        console.warn(`⚠️  Source directory not found: ${sourceDir}`);
        return terms;
    }

    const entries = readdirSync(sourceDir);

    for (const entry of entries) {
        const entryPath = join(sourceDir, entry);
        const stats = statSync(entryPath);

        if (stats.isDirectory()) {
            // Look for .md files in subdirectory
            const subEntries = readdirSync(entryPath);
            const mdFiles = subEntries.filter(f => f.endsWith('.md') && f.toLowerCase() !== 'readme.md');

            for (const mdFile of mdFiles) {
                const mdPath = join(entryPath, mdFile);
                const result = processFile(mdPath, entry, type, docConfig);
                if (result.skipped) {
                    console.log(`  ⏭️  ${entry}/${mdFile}: skipped (terminologySource: false)`);
                    skippedDocs.push(result.slug);
                } else if (result.terms.length > 0) {
                    console.log(`  📄 ${entry}/${mdFile}: ${result.terms.length} definitions`);
                    terms.push(...result.terms);
                }
            }
        } else if (entry.endsWith('.md') && entry.toLowerCase() !== 'readme.md') {
            const result = processFile(entryPath, entry.replace('.md', ''), type, docConfig);
            if (result.skipped) {
                console.log(`  ⏭️  ${entry}: skipped (terminologySource: false)`);
                skippedDocs.push(result.slug);
            } else if (result.terms.length > 0) {
                console.log(`  📄 ${entry}: ${result.terms.length} definitions`);
                terms.push(...result.terms);
            }
        }
    }

    return { terms, skippedDocs };
}

/**
 * Merge duplicate terms from different sources
 * Groups terms by normalized term name and creates multi-source entries
 * 
 * Display ordering (DEC-039):
 *   1. primary (eIDAS 910/2014, 2024/1183)
 *   2. implementing-act (technical specifications)
 *   3. referenced (765/2008, foundational regulations)
 * 
 * @param {Array} allTerms - All extracted terms
 * @param {Object} documentTitles - Map of slug -> human-friendly shortTitle
 */
function mergeTerms(allTerms, documentTitles = {}) {
    const termMap = new Map();

    // Display order mapping (lower = higher priority)
    // DEC-092: supplementary (FAQ definitions) display after legal definitions
    const DISPLAY_ORDER = {
        'primary': 1,
        'implementing-act': 2,
        'referenced': 3,
        'supplementary': 4
    };

    // Helper function to get display order
    const getDisplayOrder = (category) => DISPLAY_ORDER[category] || 99;

    for (const term of allTerms) {
        // Normalize term for grouping (lowercase, remove extra spaces)
        const normalizedTerm = term.term.toLowerCase().replace(/\s+/g, ' ').trim();

        if (!termMap.has(normalizedTerm)) {
            termMap.set(normalizedTerm, {
                id: normalizedTerm.replace(/[^a-z0-9]+/g, '-'),
                term: term.term,  // Preserve original casing from first occurrence
                sources: [],
                hasMultipleSources: false
            });
        }

        const entry = termMap.get(normalizedTerm);

        // Build source entry with display order
        // For supplementary sources (FAQ), use sectionId for deep linking if available
        // sectionId is the slug-form ID (e.g., "what-is-an-electronic-signature")
        // article is for display (e.g., "What is an electronic signature?")
        const linkTarget = term.source.sectionId || term.source.article;

        // Use human-friendly title from regulations-index.json if available,
        // otherwise fall back to shortRef (for supplementary sources or first build)
        const humanTitle = documentTitles[term.source.slug] || term.source.shortRef;

        const sourceEntry = {
            definition: term.definition,
            documentId: term.source.slug,
            documentTitle: humanTitle,
            documentCategory: term.source.category,
            documentType: term.source.type,
            celex: term.source.celex,
            articleId: term.source.sectionId
                ? linkTarget  // Use section ID directly (already slug form)
                : `article-${linkTarget}${term.source.ordinal ? `-para-${term.source.ordinal}` : ''}`,
            articleNumber: term.source.ordinal ? `${term.source.article}(${term.source.ordinal})` : term.source.article,
            displayOrder: getDisplayOrder(term.source.category)
        };

        entry.sources.push(sourceEntry);
    }

    // Post-process: sort sources by display order and set flags
    for (const [key, entry] of termMap.entries()) {
        // Sort sources by display order (primary first, then implementing-act, then referenced)
        entry.sources.sort((a, b) => a.displayOrder - b.displayOrder);

        // Set multi-source flag
        entry.hasMultipleSources = entry.sources.length > 1;

        // Set primary link target (first source after sorting = highest priority)
        entry.primaryLinkTarget = entry.sources[0].articleId;
    }

    // Convert to array and sort alphabetically
    return Array.from(termMap.values()).sort((a, b) =>
        a.term.toLowerCase().localeCompare(b.term.toLowerCase())
    );
}

/**
 * Normalize definition text for comparison
 * Strips whitespace variations and punctuation differences
 */
function normalizeDefinition(text) {
    return text
        .toLowerCase()
        .replace(/\s+/g, ' ')       // Normalize whitespace
        .replace(/[;,.]$/g, '')     // Strip trailing punctuation
        .trim();
}

/**
 * Group sources by identical definition text
 * This enables the accordion collapse UI (DEC-058)
 * 
 * Takes a term with multiple sources and returns:
 * - definitionGroups[]: Array of { definition, sources[], isVariant }
 * 
 * Example: "wallet provider" with 9 identical sources becomes:
 *   definitionGroups: [{ definition: "a natural...", sources: [src1, src2, ...], isVariant: false }]
 * 
 * Example: "provider of wallet-relying party access certificates" with 4 identical + 1 different:
 *   definitionGroups: [
 *     { definition: "a natural...relying party...", sources: [src1-4], isVariant: false },
 *     { definition: "a natural...wallet-relying party...", sources: [src5], isVariant: true }
 *   ]
 */
function groupByDefinition(term) {
    const groups = new Map(); // normalized definition -> { definition, sources[] }

    for (const source of term.sources) {
        const normalizedDef = normalizeDefinition(source.definition);

        if (!groups.has(normalizedDef)) {
            groups.set(normalizedDef, {
                definition: source.definition, // Preserve original formatting
                sources: [],
                normalizedDef
            });
        }

        groups.get(normalizedDef).sources.push(source);
    }

    // Convert to array and sort by number of sources (descending)
    // The most common definition is the "primary", others are "variants"
    const groupsArray = Array.from(groups.values())
        .sort((a, b) => b.sources.length - a.sources.length);

    // Mark variants (all groups after the first are variants)
    return groupsArray.map((group, idx) => ({
        definition: group.definition,
        sources: group.sources,
        isVariant: idx > 0
    }));
}

/**
 * Build the terminology index
 */
function build() {
    console.log('📚 Extracting terminology from eIDAS documents...\n');

    // Ensure output directory exists
    mkdirSync(OUTPUT_DIR, { recursive: true });

    // Load document configuration (DEC-005: exclude amending regulation from terminology)
    const docConfig = JSON.parse(readFileSync(DOC_CONFIG_FILE, 'utf-8'));

    const allTerms = [];
    const allSkipped = [];

    // Process each source directory
    for (const source of SOURCE_DIRS) {
        console.log(`📂 Scanning ${source.type}s: ${source.path}`);
        const { terms, skippedDocs } = scanDirectory(source.path, source.type, docConfig);
        allTerms.push(...terms);
        allSkipped.push(...skippedDocs);
        console.log(`   Found ${terms.length} definitions\n`);
    }

    if (allSkipped.length > 0) {
        console.log(`ℹ️  Skipped ${allSkipped.length} document(s): ${allSkipped.join(', ')}\n`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Load supplementary terms from YAML (DEC-092)
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('📎 Loading supplementary terminology (FAQ definitions)...');
    const supplementaryTerms = loadSupplementaryTerms();
    if (supplementaryTerms.length > 0) {
        console.log(`   Found ${supplementaryTerms.length} supplementary definitions\n`);
        allTerms.push(...supplementaryTerms);
    } else {
        console.log('   No supplementary terms found\n');
    }

    // Load human-friendly document titles for display
    // This uses shortTitle from regulations-index.json (e.g., "eIDAS 2.0 Regulation (Consolidated)")
    // instead of formal refs like "Regulation 910/2014"
    const documentTitles = loadDocumentTitles();
    if (Object.keys(documentTitles).length > 0) {
        console.log(`📋 Loaded ${Object.keys(documentTitles).length} document titles for display\n`);
    }

    // Merge terms from multiple sources
    const mergedTerms = mergeTerms(allTerms, documentTitles);

    // Group sources by identical definition (DEC-058: Accordion Collapse UI)
    for (const term of mergedTerms) {
        term.definitionGroups = groupByDefinition(term);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DEC-086: Enrich terms with roles and domains from config files
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n🏷️  Enriching terms with roles and domains...');
    const { roles: roleDefinitions, mappings: roleMappings } = loadRoleMappings();
    const { domains: domainDefinitions, mappings: domainMappings } = loadDomainMappings();
    const { documentTypes } = loadFilterConfig();

    let termsWithRoles = 0;
    let termsWithDomains = 0;
    const unmappedTerms = [];

    for (const term of mergedTerms) {
        // Assign roles
        term.roles = roleMappings[term.id] || [];
        if (term.roles.length > 0) termsWithRoles++;

        // Assign domains
        term.domains = domainMappings[term.id] || [];
        if (term.domains.length > 0) termsWithDomains++;

        // Track unmapped terms for validation
        if (term.roles.length === 0 && term.domains.length === 0) {
            unmappedTerms.push(term.id);
        }
    }

    console.log(`   🎭 Terms with roles: ${termsWithRoles}/${mergedTerms.length}`);
    console.log(`   🏷️  Terms with domains: ${termsWithDomains}/${mergedTerms.length}`);

    if (unmappedTerms.length > 0) {
        console.warn(`   ⚠️  Terms without role OR domain mapping: ${unmappedTerms.length}`);
        console.warn(`      ${unmappedTerms.slice(0, 5).join(', ')}${unmappedTerms.length > 5 ? '...' : ''}`);
    }

    // Build filter metadata for UI dropdowns
    const filterMetadata = {
        documentTypes: Object.entries(documentTypes).map(([id, config]) => ({
            id,
            label: config.label,
            description: config.description,
            color: config.color,
            matchCategories: config.matchCategories
        })),
        roles: Object.entries(roleDefinitions).map(([id, config]) => ({
            id,
            label: config.label,
            description: config.description,
            icon: config.icon
        })),
        domains: Object.entries(domainDefinitions).map(([id, config]) => ({
            id,
            label: config.label,
            description: config.description,
            icon: config.icon
        }))
    };

    // Build output structure
    const terminology = {
        version: '2.0',  // Bumped for DEC-086 filter support
        generated: new Date().toISOString(),
        statistics: {
            totalTerms: mergedTerms.length,
            totalDefinitions: allTerms.length,
            sources: {
                regulations: allTerms.filter(t => t.source.type === 'regulation').length,
                implementingActs: allTerms.filter(t => t.source.type === 'implementing-act').length,
                supplementary: allTerms.filter(t => t.source.category === 'supplementary').length
            },
            termsWithRoles,
            termsWithDomains
        },
        filterMetadata,
        // Alphabetically indexed for quick lookup
        index: mergedTerms.reduce((acc, term) => {
            const firstLetter = term.term[0].toUpperCase();
            if (!acc[firstLetter]) acc[firstLetter] = [];
            acc[firstLetter].push(term.id);
            return acc;
        }, {}),
        terms: mergedTerms
    };

    // Write output
    writeFileSync(OUTPUT_FILE, JSON.stringify(terminology, null, 2));

    console.log('✨ Terminology extraction complete!');
    console.log(`   📖 Unique terms: ${mergedTerms.length}`);
    console.log(`   📝 Total definitions: ${allTerms.length}`);
    console.log(`   💾 Output: ${OUTPUT_FILE}`);

    // Show first few terms as preview
    console.log('\n📋 Preview (first 5 terms):');
    for (const term of mergedTerms.slice(0, 5)) {
        console.log(`   • ${term.term} (${term.sources.length} source${term.sources.length > 1 ? 's' : ''})`);
    }

    // ════════════════════════════════════════════════════════════════════════════
    // VALIDATION: Fail the build if terminology extraction is broken
    // This prevents silent failures like the regex mismatch bug (2026-01-15)
    // ════════════════════════════════════════════════════════════════════════════
    console.log('\n🔍 Validating terminology extraction...');
    const validationErrors = [];

    // Invariant 1: Minimum total terms (we have 96 unique terms across all docs)
    const MIN_TOTAL_TERMS = 50;
    if (mergedTerms.length < MIN_TOTAL_TERMS) {
        validationErrors.push(
            `Total terms (${mergedTerms.length}) below minimum threshold (${MIN_TOTAL_TERMS}). ` +
            `Extraction may be broken.`
        );
    }

    // Invariant 2: Core terms that MUST exist (from Article 3 of 910/2014)
    const REQUIRED_TERMS = [
        'electronic identification',
        'electronic signature',
        'trust service',
        'qualified trust service provider',
        'electronic seal'
    ];
    const termNames = new Set(mergedTerms.map(t => t.term.toLowerCase()));
    const missingTerms = REQUIRED_TERMS.filter(t => !termNames.has(t));
    if (missingTerms.length > 0) {
        validationErrors.push(
            `Missing required core terms: ${missingTerms.join(', ')}. ` +
            `These fundamental eIDAS definitions should always be extracted.`
        );
    }

    // Invariant 3: Minimum definitions from the consolidated regulation
    // Article 3 of 910/2014 contains exactly 58 legal definitions
    const MIN_REGULATION_DEFS = 50;
    const regulationDefs = terminology.statistics.sources.regulations;
    if (regulationDefs < MIN_REGULATION_DEFS) {
        validationErrors.push(
            `Regulation definitions (${regulationDefs}) below minimum (${MIN_REGULATION_DEFS}). ` +
            `Article 3 of 910/2014 alone contains 58 definitions.`
        );
    }

    // Invariant 4: Regulation 765/2008 definitions (referenced document)
    // Article 2 of 765/2008 contains 12 definitions (3-21, with gaps)
    // This validates the numbered list pattern (defPatternNumbered) works correctly
    // NOTE: Use lowercase - termNames set uses .toLowerCase()
    const REQUIRED_765_TERMS = ['accreditation', 'manufacturer', 'ce marking'];
    const missing765Terms = REQUIRED_765_TERMS.filter(t => !termNames.has(t));
    if (missing765Terms.length > 0) {
        validationErrors.push(
            `Missing Regulation 765/2008 terms: ${missing765Terms.join(', ')}. ` +
            `These terms validate the numbered list extraction pattern works.`
        );
    }

    // Report validation results
    if (validationErrors.length > 0) {
        console.error('\n❌ VALIDATION FAILED:');
        for (const error of validationErrors) {
            console.error(`   ⚠️  ${error}`);
        }
        console.error('\n💡 This likely indicates a bug in the extraction regex or markdown format change.');
        console.error('   Check the definition pattern in extractDefinitions() matches the source files.\n');
        process.exit(1);
    }

    console.log('   ✅ All invariants satisfied');
    console.log(`      • Total terms: ${mergedTerms.length} >= ${MIN_TOTAL_TERMS}`);
    console.log(`      • Core terms: ${REQUIRED_TERMS.length}/${REQUIRED_TERMS.length} present`);
    console.log(`      • Regulation definitions: ${regulationDefs} >= ${MIN_REGULATION_DEFS}`);
    console.log(`      • 765/2008 terms: ${REQUIRED_765_TERMS.length}/${REQUIRED_765_TERMS.length} present`);
}

// Run the build
build();

