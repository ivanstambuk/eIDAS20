/**
 * Build-time script: Generate Orama search index
 * 
 * This script processes all regulation JSON files and creates a serialized
 * Orama search index that can be loaded at runtime for instant search.
 * 
 * Usage: node scripts/build-search-index.js
 * 
 * Output: public/data/search-index.json
 */

import { create, insertMultiple, save } from '@orama/orama';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const REGULATIONS_DIR = join(__dirname, '..', 'public', 'data', 'regulations');
const INDEX_PATH = join(__dirname, '..', 'public', 'data', 'regulations-index.json');
const TERMINOLOGY_PATH = join(__dirname, '..', 'public', 'data', 'terminology.json');
const OUTPUT_PATH = join(__dirname, '..', 'public', 'data', 'search-index.json');

/**
 * Check if any input file is newer than the output file
 * Warns developer if output may be stale
 */
function checkStaleness() {
    if (!existsSync(OUTPUT_PATH)) return; // First build, nothing to check

    const outputTime = statSync(OUTPUT_PATH).mtime;
    const inputs = [TERMINOLOGY_PATH, INDEX_PATH];

    for (const input of inputs) {
        if (existsSync(input) && statSync(input).mtime > outputTime) {
            console.warn(`⚠️  WARNING: ${input.split('/').pop()} is newer than search-index.json`);
            console.warn('   The search index may be stale. This build will update it.\n');
            return;
        }
    }
}

/**
 * Extract text from markdown content, stripping formatting
 */
function stripMarkdown(markdown) {
    if (!markdown) return '';

    return markdown
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')
        // Remove inline code
        .replace(/`[^`]+`/g, '')
        // Remove links, keep text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove images
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
        // Remove headers markers
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold/italic
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        // Remove blockquotes
        .replace(/^>\s*/gm, '')
        // Remove horizontal rules
        .replace(/^---+$/gm, '')
        // Remove list markers
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        // Remove table formatting
        .replace(/\|/g, ' ')
        // Collapse whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Split content into searchable sections by Article
 */
function splitIntoSections(regulation) {
    const sections = [];
    const content = regulation.contentMarkdown || '';

    // Split by articles using regex
    const articleRegex = /^### (Article \d+\w?)\s*\n\*\*([^*]+)\*\*\s*\n([\s\S]*?)(?=^### Article|\n## |$)/gm;

    let match;
    while ((match = articleRegex.exec(content)) !== null) {
        const articleRef = match[1]; // "Article 1"
        const articleTitle = match[2].trim(); // The bold title after article heading
        const articleContent = match[3].trim();

        sections.push({
            id: `${regulation.slug}#${articleRef.toLowerCase().replace(/\s+/g, '-')}`,
            slug: regulation.slug,
            type: regulation.type,
            docTitle: regulation.shortTitle,
            section: articleRef,
            sectionTitle: articleTitle,
            content: stripMarkdown(articleContent).substring(0, 2000), // Limit content size
        });
    }

    // If no articles found, create a single section for the whole document
    if (sections.length === 0) {
        const plainContent = stripMarkdown(content);
        sections.push({
            id: regulation.slug,
            slug: regulation.slug,
            type: regulation.type,
            docTitle: regulation.shortTitle,
            section: regulation.shortTitle,
            sectionTitle: regulation.title,
            content: plainContent.substring(0, 5000), // Limit content size
        });
    }

    return sections;
}

/**
 * Load all regulations and create search documents
 */
async function loadRegulations() {
    console.log('📂 Loading regulations from:', REGULATIONS_DIR);

    const index = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
    const allSections = [];

    for (const reg of index) {
        const filePath = join(REGULATIONS_DIR, `${reg.slug}.json`);
        try {
            const regulation = JSON.parse(readFileSync(filePath, 'utf-8'));
            const sections = splitIntoSections(regulation);
            allSections.push(...sections);
            console.log(`  📄 ${reg.slug}: ${sections.length} sections`);
        } catch (err) {
            console.error(`  ❌ Error loading ${reg.slug}:`, err.message);
        }
    }

    return allSections;
}

/**
 * Load terminology and create search documents for definitions
 */
function loadTerminology() {
    console.log('\n📖 Loading terminology...');

    try {
        const terminology = JSON.parse(readFileSync(TERMINOLOGY_PATH, 'utf-8'));
        const termSections = [];

        for (const term of terminology.terms) {
            // Multi-source terminology model: each term has sources[] array
            // Use the first source (primary/implementing-act/referenced, ordered by displayOrder)
            const primarySource = term.sources[0];

            // Concatenate all definitions for searchability
            const allDefinitions = term.sources
                .map(src => src.definition)
                .join(' | ');

            termSections.push({
                id: `term-${term.id}`,
                slug: 'terminology',
                type: 'definition',  // Special type for boosting
                term: term.term,     // Dedicated field for 10x boost
                docTitle: 'Terminology',
                section: `Art. ${primarySource.articleNumber}`,
                sectionTitle: term.term,
                content: allDefinitions,  // Include all sources for better matching
                sourceCount: term.sources.length,  // Number of sources (for multi-source boost)
            });
        }

        console.log(`  📚 ${termSections.length} terms loaded`);
        const multiSourceTerms = termSections.filter(t => t.sourceCount > 1).length;
        console.log(`  🔗 ${multiSourceTerms} multi-source terms (will be boosted in search)`);
        return termSections;
    } catch (err) {
        console.warn('  ⚠️  Could not load terminology:', err.message);
        return [];
    }
}

/**
 * Build the Orama search index
 */
async function buildIndex() {
    console.log('🔍 Building search index...\n');

    // Check for stale inputs
    checkStaleness();

    // Create Orama database with 'term' field for definitions
    const db = await create({
        schema: {
            id: 'string',
            slug: 'string',
            type: 'string',
            term: 'string',        // For terminology - boosted 10x in search
            docTitle: 'string',
            section: 'string',
            sectionTitle: 'string',
            content: 'string',
            sourceCount: 'number', // Number of sources for multi-source boost
        },
    });

    // Load and process regulations
    const regulationSections = await loadRegulations();

    // Load terminology
    const termSections = loadTerminology();

    // ════════════════════════════════════════════════════════════════════════════
    // VALIDATION: Fail if terminology is missing or empty
    // This catches cases where terminology.json exists but has 0 terms
    // ════════════════════════════════════════════════════════════════════════════
    const MIN_TERMS = 50;
    if (termSections.length < MIN_TERMS) {
        console.error(`\n❌ VALIDATION FAILED: Only ${termSections.length} terminology entries found (minimum: ${MIN_TERMS})`);
        console.error('   This means terminology extraction is likely broken.');
        console.error('   Run: npm run build:terminology');
        console.error('   Then re-run this script.\n');
        process.exit(1);
    }

    // Combine all sections
    const allSections = [...termSections, ...regulationSections];
    console.log(`\n📊 Total sections: ${allSections.length} (${termSections.length} terms + ${regulationSections.length} articles}`);

    // Insert documents into Orama
    console.log('\n⚡ Inserting into Orama...');
    await insertMultiple(db, allSections);

    // Serialize the database
    console.log('💾 Serializing index...');
    const serialized = await save(db);

    // Write to file
    writeFileSync(OUTPUT_PATH, JSON.stringify(serialized));
    const sizeKB = (readFileSync(OUTPUT_PATH).length / 1024).toFixed(1);
    console.log(`\n✅ Search index written: search-index.json (${sizeKB} KB)`);
    console.log(`   ✓ Includes ${termSections.length} terminology definitions (boosted 10x)`);

    return db;
}

// Run the build
buildIndex().catch(console.error);
