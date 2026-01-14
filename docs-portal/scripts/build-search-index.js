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
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const REGULATIONS_DIR = join(__dirname, '..', 'public', 'data', 'regulations');
const INDEX_PATH = join(__dirname, '..', 'public', 'data', 'regulations-index.json');
const OUTPUT_PATH = join(__dirname, '..', 'public', 'data', 'search-index.json');

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
 * Build the Orama search index
 */
async function buildIndex() {
    console.log('🔍 Building search index...\n');

    // Create Orama database
    const db = await create({
        schema: {
            id: 'string',
            slug: 'string',
            type: 'string',
            docTitle: 'string',
            section: 'string',
            sectionTitle: 'string',
            content: 'string',
        },
    });

    // Load and process regulations
    const sections = await loadRegulations();
    console.log(`\n📊 Total sections: ${sections.length}`);

    // Insert documents into Orama
    console.log('\n⚡ Inserting into Orama...');
    await insertMultiple(db, sections);

    // Serialize the database
    console.log('💾 Serializing index...');
    const serialized = await save(db);

    // Write to file
    writeFileSync(OUTPUT_PATH, JSON.stringify(serialized));
    const sizeKB = (readFileSync(OUTPUT_PATH).length / 1024).toFixed(1);
    console.log(`\n✅ Search index written: search-index.json (${sizeKB} KB)`);

    return db;
}

// Run the build
buildIndex().catch(console.error);
