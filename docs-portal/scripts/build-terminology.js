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

// Source directories
const SOURCE_DIRS = [
    { path: join(PROJECT_ROOT, '01_regulation'), type: 'regulation' },
    { path: join(PROJECT_ROOT, '02_implementing_acts'), type: 'implementing-act' }
];

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
    // Try regulation format
    const regMatch = title.match(/Regulation \(EU\) (?:No )?([\d/]+)/);
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
    // Pattern 1: eIDAS format - "### Article 3" followed by "**Definitions**"
    const pattern1 = /^### Article (\d+\w?)\s*\n\*\*Definitions?\*\*/gm;
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
    // Handles markdown list format: "- (N) 'term' means..."
    // Captures: ordinal, term, definition
    // Stops at: semicolon, period, or double newline (article boundary)
    const defPatternParens = /^(?:-\s*)?\((\d+\w?)\)\s*'([^']+)'\s*means\s+([^;.\n]+)(?:[;.]|\n|$)/gm;

    // Pattern 2: EU numbered list format - N. 'term' means definition
    // Used in older regulations like 765/2008
    const defPatternNumbered = /^(\d+)\.\s+'([^']+)'\s*means\s+([^;]+);/gm;

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
 */
function mergeTerms(allTerms) {
    const termMap = new Map();

    // Display order mapping
    const DISPLAY_ORDER = {
        'primary': 1,
        'implementing-act': 2,
        'referenced': 3
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
        const sourceEntry = {
            definition: term.definition,
            documentId: term.source.slug,
            documentTitle: term.source.shortRef,
            documentCategory: term.source.category,
            documentType: term.source.type,
            celex: term.source.celex,
            articleId: `article-${term.source.article}${term.source.ordinal ? `-${term.source.ordinal}` : ''}`,
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

    // Merge terms from multiple sources
    const mergedTerms = mergeTerms(allTerms);

    // Build output structure
    const terminology = {
        version: '1.0',
        generated: new Date().toISOString(),
        statistics: {
            totalTerms: mergedTerms.length,
            totalDefinitions: allTerms.length,
            sources: {
                regulations: allTerms.filter(t => t.source.type === 'regulation').length,
                implementingActs: allTerms.filter(t => t.source.type === 'implementing-act').length
            }
        },
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
}

// Run the build
build();

