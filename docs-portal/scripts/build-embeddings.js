/**
 * Build-time Embedding Generator
 * 
 * Generates vector embeddings for all regulation sections using
 * a local transformer model (all-MiniLM-L6-v2).
 * 
 * This enables semantic search by comparing query embeddings
 * with pre-computed document embeddings.
 * 
 * Usage: node scripts/build-embeddings.js
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js for Node.js
env.cacheDir = './.cache/transformers';
env.allowLocalModels = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../public/data');
const REGULATIONS_DIR = path.join(DATA_DIR, 'regulations');
const OUTPUT_FILE = path.join(DATA_DIR, 'embeddings.json');
const INDEX_FILE = path.join(DATA_DIR, 'regulations-index.json');
const TERMINOLOGY_FILE = path.join(DATA_DIR, 'terminology.json');
const DOC_CONFIG_FILE = path.join(__dirname, 'document-config.json');

// Model configuration
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const EMBEDDING_DIM = 384;
const MAX_CHUNK_LENGTH = 512; // Max tokens for the model

/**
 * Compute a hash of all source files to detect changes
 * Returns a SHA256 hash of concatenated file contents
 */
function computeSourceHash() {
    const hash = crypto.createHash('sha256');

    // Hash the regulations index
    if (fs.existsSync(INDEX_FILE)) {
        hash.update(fs.readFileSync(INDEX_FILE));
    }

    // Hash terminology
    if (fs.existsSync(TERMINOLOGY_FILE)) {
        hash.update(fs.readFileSync(TERMINOLOGY_FILE));
    }

    // Hash document config
    if (fs.existsSync(DOC_CONFIG_FILE)) {
        hash.update(fs.readFileSync(DOC_CONFIG_FILE));
    }

    // Hash all regulation JSON files
    if (fs.existsSync(REGULATIONS_DIR)) {
        const files = fs.readdirSync(REGULATIONS_DIR)
            .filter(f => f.endsWith('.json'))
            .sort(); // Ensure consistent order

        for (const file of files) {
            hash.update(fs.readFileSync(path.join(REGULATIONS_DIR, file)));
        }
    }

    return hash.digest('hex');
}

/**
 * Check if embeddings need regeneration based on source hash
 * Returns true if regeneration is needed, false to skip
 */
function needsRegeneration() {
    const currentHash = computeSourceHash();

    if (!fs.existsSync(OUTPUT_FILE)) {
        console.log('📦 No embeddings.json found - generating...\n');
        return { needed: true, hash: currentHash };
    }

    try {
        const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));

        if (existing.sourceHash === currentHash) {
            console.log('✅ Embeddings are up-to-date (source hash matches)');
            console.log(`   Hash: ${currentHash.substring(0, 16)}...`);
            console.log('   Skipping regeneration.\n');
            return { needed: false, hash: currentHash };
        }

        console.log('🔄 Source files changed - regenerating embeddings...');
        console.log(`   Old hash: ${(existing.sourceHash || 'none').substring(0, 16)}...`);
        console.log(`   New hash: ${currentHash.substring(0, 16)}...\n`);
        return { needed: true, hash: currentHash };
    } catch (err) {
        console.log('⚠️  Could not read existing embeddings - regenerating...\n');
        return { needed: true, hash: currentHash };
    }
}

/**
 * Check if any input file is newer than the output file
 * Warns developer if output may be stale
 */
function checkStaleness() {
    if (!fs.existsSync(OUTPUT_FILE)) return; // First build, nothing to check

    const outputTime = fs.statSync(OUTPUT_FILE).mtime;
    const inputs = [TERMINOLOGY_FILE, INDEX_FILE];

    for (const input of inputs) {
        if (fs.existsSync(input) && fs.statSync(input).mtime > outputTime) {
            console.warn(`⚠️  WARNING: ${path.basename(input)} is newer than embeddings.json`);
            console.warn('   Embeddings may be stale. This build will update them.\n');
            return;
        }
    }
}

/**
 * Strip markdown formatting from text
 */
function stripMarkdown(text) {
    return text
        // Remove headers
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold/italic
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        // Remove links
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove inline code
        .replace(/`([^`]+)`/g, '$1')
        // Remove blockquotes
        .replace(/^>\s+/gm, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Split content into article-level sections
 */
function splitIntoSections(markdown, slug, type, docTitle) {
    const sections = [];

    // Split by Article headers
    const articlePattern = /^### (Article \d+[a-z]?)\s*[-–—]?\s*(.*)$/gm;
    const matches = [...markdown.matchAll(articlePattern)];

    if (matches.length === 0) {
        // No articles found - use entire document as one section
        const content = stripMarkdown(markdown);
        if (content.length > 50) {
            sections.push({
                id: `${slug}-full`,
                slug,
                type,
                docTitle,
                section: 'Full Document',
                sectionTitle: docTitle,
                content: content.substring(0, 2000), // Limit content length
            });
        }
        return sections;
    }

    // Extract each article section
    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const nextMatch = matches[i + 1];

        const section = match[1];
        const sectionTitle = match[2] || section;

        const startIndex = match.index + match[0].length;
        const endIndex = nextMatch ? nextMatch.index : markdown.length;

        const rawContent = markdown.substring(startIndex, endIndex);
        const content = stripMarkdown(rawContent);

        if (content.length > 30) {
            sections.push({
                id: `${slug}-${section.toLowerCase().replace(/\s+/g, '-')}`,
                slug,
                type,
                docTitle,
                section,
                sectionTitle: sectionTitle.trim() || section,
                content: content.substring(0, 2000), // Limit for embedding
            });
        }
    }

    return sections;
}

/**
 * Load terminology definitions as sections for embedding
 */
function loadTerminology() {
    console.log('\n📖 Loading terminology for embeddings...');

    try {
        const terminology = JSON.parse(fs.readFileSync(TERMINOLOGY_FILE, 'utf-8'));
        const termSections = [];

        for (const term of terminology.terms) {
            // New format uses 'sources' array instead of 'definitions'
            const primarySource = term.sources?.[0];
            if (!primarySource) continue;

            termSections.push({
                id: `term-${term.id}`,
                slug: 'terminology',
                type: 'definition',  // For two-tier ranking
                docTitle: 'Terminology',
                section: term.term,
                sectionTitle: term.term,
                content: `${term.term}: ${primarySource.definition}`.substring(0, 2000),
            });
        }

        console.log(`  📚 ${termSections.length} terms loaded`);
        return termSections;
    } catch (err) {
        console.warn('  ⚠️  Could not load terminology:', err.message);
        return [];
    }
}

/**
 * Main embedding generation function
 */
async function generateEmbeddings() {
    console.log('🧠 Embedding Generator');
    console.log('='.repeat(50));

    // Check if regeneration is needed (hash-based)
    const { needed, hash: sourceHash } = needsRegeneration();
    if (!needed) {
        process.exit(0); // Up-to-date, nothing to do
    }

    // Check for regulations index
    if (!fs.existsSync(INDEX_FILE)) {
        console.error('❌ regulations-index.json not found. Run build:documents first.');
        process.exit(1);
    }

    // Load regulations index
    const regulationsIndex = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
    console.log(`📚 Found ${regulationsIndex.length} documents`);

    // Load document configuration (DEC-005: exclude amending regulation from RAG)
    const docConfig = JSON.parse(fs.readFileSync(DOC_CONFIG_FILE, 'utf-8'));
    const getDocConfig = (slug) => docConfig.documents[slug] || docConfig.defaults;

    // Load the embedding model
    console.log(`\n🔄 Loading embedding model: ${MODEL_NAME}`);
    console.log('   (This may take a minute on first run to download the model...)\n');

    const extractor = await pipeline('feature-extraction', MODEL_NAME, {
        quantized: true, // Use quantized model for faster inference
    });

    console.log('✅ Model loaded successfully\n');

    // Collect all sections
    const allSections = [];

    let skippedCount = 0;
    for (const doc of regulationsIndex) {
        // Check if document should be included in RAG (DEC-005)
        const config = getDocConfig(doc.slug);
        if (!config.ragEnabled) {
            console.log(`⏭️  Skipping ${doc.slug} (ragEnabled: false)`);
            skippedCount++;
            continue;
        }

        const docPath = path.join(REGULATIONS_DIR, `${doc.slug}.json`);

        if (!fs.existsSync(docPath)) {
            console.warn(`⚠️ Missing: ${doc.slug}.json`);
            continue;
        }

        const docData = JSON.parse(fs.readFileSync(docPath, 'utf-8'));
        const sections = splitIntoSections(
            docData.contentMarkdown || '',
            doc.slug,
            doc.type,
            doc.shortTitle || doc.title
        );

        allSections.push(...sections);
    }

    // Load terminology definitions (for two-tier ranking in semantic search)
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

    allSections.push(...termSections);

    console.log(`📑 Total sections to embed: ${allSections.length} (${termSections.length} terms + articles, skipped ${skippedCount} documents)\n`);

    // Generate embeddings
    const embeddings = [];
    const batchSize = 10;
    let processed = 0;

    for (let i = 0; i < allSections.length; i += batchSize) {
        const batch = allSections.slice(i, i + batchSize);

        for (const section of batch) {
            try {
                // Combine title and content for embedding
                const textToEmbed = `${section.sectionTitle}: ${section.content}`.substring(0, 1500);

                // Generate embedding
                const output = await extractor(textToEmbed, {
                    pooling: 'mean',
                    normalize: true,
                });

                // Extract the embedding vector
                const vector = Array.from(output.data);

                embeddings.push({
                    id: section.id,
                    slug: section.slug,
                    type: section.type,
                    docTitle: section.docTitle,
                    section: section.section,
                    sectionTitle: section.sectionTitle,
                    // Store content snippet for display
                    snippet: section.content.substring(0, 300),
                    // Store the embedding vector
                    vector,
                });

                processed++;
            } catch (err) {
                console.error(`❌ Error embedding ${section.id}:`, err.message);
            }
        }

        // Progress update
        const progress = Math.round((processed / allSections.length) * 100);
        process.stdout.write(`\r⏳ Generating embeddings... ${progress}% (${processed}/${allSections.length})`);
    }

    console.log('\n');

    // Save embeddings with source hash for change detection
    const output = {
        model: MODEL_NAME,
        dimension: EMBEDDING_DIM,
        count: embeddings.length,
        sourceHash, // For hash-based invalidation
        generatedAt: new Date().toISOString(),
        embeddings,
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output));

    const fileSizeKB = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1);

    console.log('✅ Embeddings generated successfully!');
    console.log(`📁 Output: ${OUTPUT_FILE}`);
    console.log(`📊 Embeddings: ${embeddings.length}`);
    console.log(`💾 File size: ${fileSizeKB} KB`);
    console.log(`🔢 Embedding dimension: ${EMBEDDING_DIM}`);
}

// Run the generator
generateEmbeddings().catch(console.error);
