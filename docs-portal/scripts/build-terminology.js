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
 * Returns the article number (usually "3" for main definition articles)
 */
function findDefinitionArticle(content) {
    // Look for "### Article 3" followed by "Definitions" or similar
    const articlePattern = /^### Article (\d+\w?)\s*\n\*\*Definitions?\*\*/gm;
    const match = articlePattern.exec(content);
    if (match) return match[1];

    // Also check for definitions article by content pattern
    const altPattern = /^### Article (\d+\w?)\s*\n.*\n.*following definitions apply/gmi;
    const altMatch = altPattern.exec(content);
    if (altMatch) return altMatch[1];

    return null;
}

/**
 * Extract definitions from document content
 * Returns array of { term, definition, number } objects
 */
function extractDefinitions(content) {
    const definitions = [];

    // Pattern: (N) 'term' means definition
    // Also handles: (Na) 'term' for numbered variants like (5a)
    // Captures: ordinal, term, definition
    const defPattern = /^\(?(\d+\w?)\)?\s*'([^']+)'\s*means\s+([^;]+(?:;|$))/gm;

    let match;
    while ((match = defPattern.exec(content)) !== null) {
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

    return definitions;
}

/**
 * Process a single markdown file for terminology
 */
function processFile(filePath, dirName, type) {
    const content = readFileSync(filePath, 'utf-8');
    const terms = [];

    const celex = extractCelex(content);
    const title = extractTitle(content);
    const shortRef = extractShortRef(title, celex);
    const slug = generateSlug(dirName, type);
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
                article: definitionArticle || 'N/A',
                ordinal: def.ordinal
            }
        });
    }

    return terms;
}

/**
 * Scan a source directory for markdown files
 */
function scanDirectory(sourceDir, type) {
    const terms = [];

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
                const fileTerms = processFile(mdPath, entry, type);
                if (fileTerms.length > 0) {
                    console.log(`  📄 ${entry}/${mdFile}: ${fileTerms.length} definitions`);
                    terms.push(...fileTerms);
                }
            }
        } else if (entry.endsWith('.md') && entry.toLowerCase() !== 'readme.md') {
            const fileTerms = processFile(entryPath, entry.replace('.md', ''), type);
            if (fileTerms.length > 0) {
                console.log(`  📄 ${entry}: ${fileTerms.length} definitions`);
                terms.push(...fileTerms);
            }
        }
    }

    return terms;
}

/**
 * Merge duplicate terms from different sources
 * Groups terms by normalized term name
 */
function mergeTerms(allTerms) {
    const termMap = new Map();

    for (const term of allTerms) {
        // Normalize term for grouping (lowercase, remove extra spaces)
        const normalizedTerm = term.term.toLowerCase().replace(/\s+/g, ' ').trim();

        if (!termMap.has(normalizedTerm)) {
            termMap.set(normalizedTerm, {
                id: normalizedTerm.replace(/[^a-z0-9]+/g, '-'),
                term: term.term,
                definitions: []
            });
        }

        // Add this definition with its source
        termMap.get(normalizedTerm).definitions.push({
            text: term.definition,
            source: term.source
        });
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

    const allTerms = [];

    // Process each source directory
    for (const source of SOURCE_DIRS) {
        console.log(`📂 Scanning ${source.type}s: ${source.path}`);
        const terms = scanDirectory(source.path, source.type);
        allTerms.push(...terms);
        console.log(`   Found ${terms.length} definitions\n`);
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
        console.log(`   • ${term.term} (${term.definitions.length} definition${term.definitions.length > 1 ? 's' : ''})`);
    }
}

// Run the build
build();
