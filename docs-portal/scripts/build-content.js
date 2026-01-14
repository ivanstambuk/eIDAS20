/**
 * Build-time script: Convert Markdown regulations to JSON
 * 
 * This script processes all eIDAS regulation markdown files and converts them
 * to a structured JSON format for the documentation portal.
 * 
 * Uses the unified/remark/rehype ecosystem for proper AST-based processing:
 * - Automatic heading ID generation (for TOC navigation)
 * - GitHub-flavored markdown (tables, strikethrough, etc.)
 * - Extensible plugin architecture for future annotations
 * 
 * Usage: node scripts/build-content.js
 * 
 * Output: public/data/regulations/*.json + public/data/regulations-index.json
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

// Unified ecosystem for AST-based markdown processing
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';

// Use the same slugger as rehype-slug for consistent IDs
import GithubSlugger from 'github-slugger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths relative to docs-portal
const PROJECT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data', 'regulations');

// Source directories
const SOURCE_DIRS = [
    { path: join(PROJECT_ROOT, '01_regulation'), type: 'regulation' },
    { path: join(PROJECT_ROOT, '02_implementing_acts'), type: 'implementing-act' }
];

/**
 * Preamble Injection Configuration
 * 
 * The consolidated eIDAS regulation (910/2014) from EUR-Lex doesn't include a preamble.
 * However, the amending regulation (2024/1183) contains valuable recitals that explain
 * the legislative rationale for the 2024 amendments.
 * 
 * This configuration enables automatic injection of the amendment preamble into the
 * consolidated document at build time, allowing:
 * - Deep linking to recitals (e.g., ?section=recital-42)
 * - Avoiding links to the amending regulation (per project rules)
 * - Single-document experience for users
 * 
 * See DECISIONS.md for the design decision (DEC-XXX).
 */
const PREAMBLE_INJECTION = {
    // Target: Consolidated eIDAS regulation
    targetSlugPattern: /^910-2014$/,

    // Source: eIDAS 2.0 amending regulation
    sourceDir: join(PROJECT_ROOT, '01_regulation', '2024_1183_eIDAS2_Amending'),

    // Section markers in the source document
    preambleStartMarker: '## Preamble',
    recitalsStartMarker: '## Recitals',
    enactingTermsMarker: '## Enacting Terms',

    // Attribution notice (inserted before preamble)
    attributionNote: `
> **Note:** The following preamble and recitals are from the amending **Regulation (EU) 2024/1183**
> (eIDAS 2.0), which established the European Digital Identity Framework. These recitals explain
> the legislative rationale for the 2024 amendments to this consolidated regulation.
`
};

/**
 * Parse CELEX and metadata from the first line blockquote
 */
function parseMetadata(content) {
    const metadata = {
        celex: null,
        documentType: null,
        source: null,
        version: null,
        subject: null
    };

    // Match first blockquote line: > **CELEX:** 32024R2977 | **Document:** Commission Implementing Regulation
    const celexMatch = content.match(/>\s*\*\*CELEX:\*\*\s*(\S+)/);
    if (celexMatch) {
        metadata.celex = celexMatch[1];
    }

    // Match version info (for consolidated regulations)
    const versionMatch = content.match(/\*\*Version:\*\*\s*([^\n|]+)/);
    if (versionMatch) {
        metadata.version = versionMatch[1].trim();
    }

    // Match document type
    const docTypeMatch = content.match(/\*\*Document:\*\*\s*([^\n|]+)/);
    if (docTypeMatch) {
        metadata.documentType = docTypeMatch[1].trim();
    }

    // Match source URL
    const sourceMatch = content.match(/\*\*Source:\*\*\s*\[?([^\]\n]+)\]?\(?([^)\n]*)?\)?/);
    if (sourceMatch) {
        metadata.source = sourceMatch[2] || sourceMatch[1];
    }

    // Match subject field (if present): > **Subject:** Registration of relying parties
    const subjectMatch = content.match(/\*\*Subject:\*\*\s*([^\n|]+)/);
    if (subjectMatch) {
        metadata.subject = subjectMatch[1].trim();
    }

    return metadata;
}

/**
 * Strip front matter that is redundant in the portal UI.
 * 
 * This includes:
 * 1. Metadata blockquote: CELEX, Document type, Source URL (shown in header badges)
 * 2. Amendment History table: Only in consolidated regulations, renders as raw markdown
 * 3. Main H1 title: Already displayed in the header component
 * 
 * Decision: 2026-01-14 - Metadata stripped from rendered content.
 * The original markdown files retain this data for archival purposes.
 * See AGENTS.md for documentation of this decision.
 */
function stripFrontMatter(content) {
    let result = content;

    // 1. Strip metadata blockquote at start of document
    // Pattern: All consecutive lines starting with > at the beginning
    // Example:
    //   > **CELEX:** 32024R2977 | **Document:** Commission Implementing Regulation
    //   >
    //   > **Source:** https://eur-lex.europa.eu/...
    const metadataPattern = /^(>.*\n)+\n?/;
    result = result.replace(metadataPattern, '');

    // 2. Strip Amendment History section (only in consolidated regulations)
    // Pattern: ## Amendment History through the markdown table until next heading
    // Example:
    //   ## Amendment History
    //   
    //   | Code | Act | Official Journal |
    //   |------|-----|------------------|
    //   | ►B | [Regulation...] | OJ L 257... |
    //   ...
    //   
    //   # Regulation (EU) No 910/2014...
    const amendmentHistoryPattern = /^## Amendment History\s*\n(?:\s*\n|\|[^\n]*\n)*\n*/m;
    result = result.replace(amendmentHistoryPattern, '');

    // 3. Strip main H1 title (already shown in header)
    // Pattern: # Title text... followed by blank line
    // The header already displays the regulation title with badges and metadata,
    // so showing it again as a giant H1 is redundant and wastes screen space.
    const h1TitlePattern = /^# .+\n+/m;
    result = result.replace(h1TitlePattern, '');

    return result;
}

/**
 * Extract the main title (first H1 heading)
 */
function parseTitle(content) {
    const titleMatch = content.match(/^# (.+)$/m);
    return titleMatch ? titleMatch[1].trim() : 'Untitled Document';
}

/**
 * Extract a human-readable short title from metadata, folder name, or title.
 * 
 * Priority chain (Single Source of Truth principle):
 * 1. Explicit **Subject:** field in markdown metadata
 * 2. Descriptive part of folder name (e.g., "Relying_Party_Registration")
 * 3. Special casing for parent regulations
 * 4. Fallback to CELEX-based pattern
 * 
 * @param {string} fullTitle - The full document title
 * @param {string} celex - The CELEX number
 * @param {string} type - Document type ('regulation' or 'implementing-act')
 * @param {string} dirName - The directory name containing the document
 * @param {string|null} subject - Optional subject from markdown metadata
 */
function extractShortTitle(fullTitle, celex, type, dirName, subject) {
    // Priority 1: Use explicit subject from metadata if available
    if (subject) {
        return subject;
    }

    // Priority 2: For implementing acts, extract from folder name
    // Format: YYYY_NNNN_Human_Readable_Description
    if (type === 'implementing-act' && dirName) {
        const folderMatch = dirName.match(/^\d{4}_\d+_(.+)$/);
        if (folderMatch) {
            // Common eIDAS acronyms that should be preserved
            const acronyms = new Set(['PID', 'EAA', 'EID', 'TSP', 'TS', 'CAB', 'QTS', 'QC', 'QTSP', 'API', 'EU']);

            // Convert underscores to spaces for readability
            // e.g., "Relying_Party_Registration" → "Relying Party Registration"
            const description = folderMatch[1]
                .replace(/_/g, ' ')
                .replace(/\band\b/gi, '&'); // Restore "and" to "&"

            // Smart title casing: preserve acronyms, title-case other words
            const titleCase = description
                .split(' ')
                .map((word, index) => {
                    const upperWord = word.toUpperCase();
                    // Preserve acronyms (check uppercase version against acronym set)
                    if (acronyms.has(upperWord)) {
                        // Special case: eID stays as "eID" not "EID"
                        if (upperWord === 'EID') return 'eID';
                        return upperWord;
                    }
                    // Title case: capitalize first letter
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                })
                .join(' ');
            return titleCase;
        }
    }

    // Priority 3: Special handling for parent regulations
    if (type === 'regulation') {
        // eIDAS 2.0 Amendment (2024/1183)
        if (celex && celex.includes('2024') && celex.includes('1183')) {
            return 'eIDAS 2.0 Amendment';
        }
        // Consolidated eIDAS Regulation (910/2014)
        if (celex && (celex.includes('2014') || celex.includes('910'))) {
            return 'eIDAS Regulation (Consolidated)';
        }
        // Generic regulation fallback
        const regMatch = fullTitle.match(/Regulation \(EU\) (?:No )?(\\d+\/\\d+)/);
        if (regMatch) return `Regulation ${regMatch[1]}`;
    }

    // Priority 4: For implementing acts without folder description, use CELEX pattern
    if (type === 'implementing-act' && celex) {
        // CELEX format: 3YYYYRNNN or 3YYYYDNNNN (R=Regulation, D=Decision)
        const celexMatch = celex.match(/3(\d{4})[RD](\d+)/);
        if (celexMatch) {
            const docType = celex.includes('D') ? 'ID' : 'IR'; // ID = Implementing Decision
            return `${docType} ${celexMatch[1]}/${celexMatch[2]}`;
        }
    }

    // Fallback: first 60 chars of title
    return fullTitle.length > 60 ? fullTitle.substring(0, 57) + '...' : fullTitle;
}


/**
 * Generate URL-safe slug from directory name
 */
function generateSlug(dirName, type) {
    // Convert directory name to URL slug
    // e.g., "910_2014_eIDAS_Consolidated" -> "910-2014"
    // e.g., "2024_2977_PID_and_EAA" -> "2024-2977"

    // Special handling for regulations to match expected URL patterns
    // For "910_2014_*" -> "910-2014"
    const regMatch = dirName.match(/^(\d+)_(\d{4})/);
    if (regMatch && type === 'regulation') {
        // Swap to CELEX-like format: number-year for 910/2014 style
        // Check if first number looks like regulation number (smaller)
        const num1 = parseInt(regMatch[1]);
        const num2 = parseInt(regMatch[2]);
        if (num1 < 10000 && num2 >= 2000) {
            return `${num1}-${num2}`; // e.g., 910-2014
        }
    }

    // Standard format: year-number for implementing acts
    const match = dirName.match(/^(\d{4})_(\d+)/);
    if (match) {
        return `${match[1]}-${match[2]}`;
    }

    // Fallback: convert underscores to dashes and lowercase
    return dirName.toLowerCase().replace(/_/g, '-');
}

/**
 * Build Table of Contents from headings.
 * Uses github-slugger to generate IDs that match rehype-slug output exactly.
 */
function buildTableOfContents(content) {
    const toc = [];
    const headingRegex = /^(#{1,4})\s+(.+)$/gm;

    // Use the same slugger as rehype-slug for consistent ID generation
    const slugger = new GithubSlugger();

    let match;

    while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const title = match[2].trim();

        // Skip the main title (H1) - it's displayed in the header
        if (level === 1 && toc.length === 0) continue;

        // Clean the title (remove bold markers, etc.)
        const cleanTitle = title.replace(/\*\*/g, '');

        // Generate ID using github-slugger (same as rehype-slug)
        const id = slugger.slug(cleanTitle);

        toc.push({
            id,
            title: cleanTitle,
            level
        });
    }

    return toc;
}

/**
 * Parse a description from the title or preamble
 */
function parseDescription(content, title) {
    // Try to find description after the title in the same paragraph or preamble
    const preambleMatch = content.match(/## Preamble\s+([^#]+)/);
    if (preambleMatch) {
        // Extract first sentence after preamble heading
        const firstSentence = preambleMatch[1].match(/[A-Z][^.!?]*[.!?]/);
        if (firstSentence) return firstSentence[0].trim();
    }

    // Extract from title if it contains "on" or "laying down"
    const onMatch = title.match(/(?:on|laying down rules for)\s+(.+)/i);
    if (onMatch) {
        return onMatch[1].substring(0, 200);
    }

    return '';
}

/**
 * Extract date from content or directory name
 */
function extractDate(content, dirName, celex) {
    // Try to find date in content
    const dateMatch = content.match(/(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/);
    if (dateMatch) {
        return dateMatch[1];
    }

    // Extract year from directory name
    const yearMatch = dirName.match(/^(\d{4})/);
    if (yearMatch) {
        return yearMatch[1];
    }

    return null;
}

/**
 * Extract preamble and recitals from the eIDAS 2.0 amendment.
 * 
 * This reads the 2024/1183 markdown file and extracts:
 * - The formal preamble (legal citations)
 * - All 78 recitals explaining the amendments
 * 
 * Returns null if the source file cannot be found.
 */
function extractAmendmentPreamble() {
    const { sourceDir, preambleStartMarker, enactingTermsMarker, attributionNote } = PREAMBLE_INJECTION;

    // Find the markdown file in the source directory
    if (!existsSync(sourceDir)) {
        console.warn(`  ⚠️  Amendment source directory not found: ${sourceDir}`);
        return null;
    }

    const files = readdirSync(sourceDir).filter(f => f.endsWith('.md'));
    if (files.length === 0) {
        console.warn(`  ⚠️  No markdown files found in: ${sourceDir}`);
        return null;
    }

    const sourcePath = join(sourceDir, files[0]);
    const content = readFileSync(sourcePath, 'utf-8');

    // Find the start of the preamble section
    const preambleStart = content.indexOf(preambleStartMarker);
    if (preambleStart === -1) {
        console.warn(`  ⚠️  Preamble section not found in amendment`);
        return null;
    }

    // Find the end (Enacting Terms section)
    const enactingStart = content.indexOf(enactingTermsMarker, preambleStart);
    if (enactingStart === -1) {
        console.warn(`  ⚠️  Enacting Terms section not found in amendment`);
        return null;
    }

    // Extract the preamble section (including Preamble and Recitals)
    let preambleContent = content.substring(preambleStart, enactingStart).trim();

    // Add attribution notice at the beginning
    preambleContent = attributionNote.trim() + '\n\n' + preambleContent;

    return preambleContent;
}

/**
 * Inject the amendment preamble into the consolidated regulation content.
 * 
 * The preamble is inserted after the Amendment History table (if present)
 * or at the very beginning of the content, before the Enacting Terms.
 * 
 * @param {string} content - The stripped markdown content
 * @param {string} preamble - The preamble content to inject
 * @returns {string} - Content with preamble injected
 */
function injectPreamble(content, preamble) {
    // Look for "Enacting Terms" to insert preamble before it
    const enactingIndex = content.indexOf('## Enacting Terms');

    if (enactingIndex !== -1) {
        // Insert preamble before Enacting Terms
        const before = content.substring(0, enactingIndex).trimEnd();
        const after = content.substring(enactingIndex);
        return before + '\n\n' + preamble + '\n\n' + after;
    }

    // Fallback: prepend preamble to content
    return preamble + '\n\n' + content;
}

/**
 * Create the unified processor for markdown → HTML conversion.
 * 
 * Pipeline:
 * 1. remarkParse: Markdown string → MDAST (Markdown AST)
 * 2. remarkGfm: Enable GitHub-flavored markdown (tables, strikethrough, etc.)
 * 3. remarkRehype: MDAST → HAST (HTML AST)
 * 4. rehypeSlug: Auto-generate IDs for all headings (for TOC navigation)
 * 5. rehypeStringify: HAST → HTML string
 * 
 * This replaces the fragile regex-based approach with proper AST processing.
 */
const markdownProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeStringify, { allowDangerousHtml: true });

/**
 * Convert markdown content to HTML using the unified processor.
 * Generates proper heading IDs for TOC deep-linking.
 */
function markdownToHtml(markdown) {
    if (!markdown) return '';

    try {
        // Process synchronously (unified supports .processSync for build-time)
        const result = markdownProcessor.processSync(markdown);
        return String(result);
    } catch (err) {
        console.error('  ⚠️  Markdown processing error:', err.message);
        // Fallback: return escaped markdown
        return `<pre>${markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
    }
}

/**
 * Process a single markdown file
 */
function processMarkdownFile(filePath, dirName, type) {
    const rawContent = readFileSync(filePath, 'utf-8');

    // Parse metadata and title from raw content (before stripping)
    const metadata = parseMetadata(rawContent);
    const title = parseTitle(rawContent);  // Extract title BEFORE stripping H1

    // Strip front matter for all content-related processing
    let content = stripFrontMatter(rawContent);

    const slug = generateSlug(dirName, type);
    const shortTitle = extractShortTitle(title, metadata.celex, type, dirName, metadata.subject);

    // Check if this is the consolidated eIDAS regulation that needs preamble injection
    let preambleInjected = false;
    if (PREAMBLE_INJECTION.targetSlugPattern.test(slug)) {
        console.log(`  📜 Injecting amendment preamble into ${slug}...`);
        const preamble = extractAmendmentPreamble();
        if (preamble) {
            content = injectPreamble(content, preamble);
            preambleInjected = true;
            console.log(`     ✅ Preamble injected (78 recitals)`);
        }
    }

    // Build TOC after potential preamble injection so recitals appear in TOC
    const toc = buildTableOfContents(content);
    const description = parseDescription(rawContent, title);  // Use raw for preamble extraction
    const date = extractDate(rawContent, dirName, metadata.celex);

    // Prepare the regulation data object
    const regulationData = {
        slug,
        type,
        title,
        shortTitle,
        description,
        celex: metadata.celex,
        date,
        source: metadata.source,
        version: metadata.version,
        toc,
        // Content is already stripped of front matter (and preamble injected if applicable)
        contentMarkdown: content,
        // Also provide pre-rendered HTML for simple use cases
        contentHtml: markdownToHtml(content),
        // Metadata for search and filtering (use raw for accurate count)
        wordCount: content.split(/\s+/).length,  // Use processed content for accurate count
        lastProcessed: new Date().toISOString(),
        // Track preamble injection for debugging
        preambleInjected
    };

    return regulationData;
}

/**
 * Scan a source directory for markdown files
 */
function scanDirectory(sourceDir, type) {
    const regulations = [];

    if (!existsSync(sourceDir)) {
        console.warn(`⚠️  Source directory not found: ${sourceDir}`);
        return regulations;
    }

    const entries = readdirSync(sourceDir);

    for (const entry of entries) {
        const entryPath = join(sourceDir, entry);
        const stats = statSync(entryPath);

        if (stats.isDirectory()) {
            // Look for .md files in subdirectory
            const subEntries = readdirSync(entryPath);
            const mdFiles = subEntries.filter(f => f.endsWith('.md'));

            for (const mdFile of mdFiles) {
                // Skip README files
                if (mdFile.toLowerCase() === 'readme.md') continue;

                const mdPath = join(entryPath, mdFile);
                console.log(`  📄 Processing: ${entry}/${mdFile}`);

                try {
                    const data = processMarkdownFile(mdPath, entry, type);
                    regulations.push(data);
                } catch (err) {
                    console.error(`  ❌ Error processing ${mdPath}:`, err.message);
                }
            }
        } else if (entry.endsWith('.md') && entry.toLowerCase() !== 'readme.md') {
            // Top-level markdown file
            console.log(`  📄 Processing: ${entry}`);

            try {
                const data = processMarkdownFile(entryPath, basename(entry, '.md'), type);
                regulations.push(data);
            } catch (err) {
                console.error(`  ❌ Error processing ${entryPath}:`, err.message);
            }
        }
    }

    return regulations;
}

/**
 * Validate that documents referencing annexes actually have annex sections.
 * 
 * This prevents accidentally dropping annexes during conversion.
 * A document "references" an annex if it contains phrases like:
 * - "the Annex"
 * - "Annex I"
 * - "Annex II"
 * - "in the Annex"
 * - "set out in the Annex"
 * 
 * Returns an array of { slug, reference } for documents with potential missing annexes.
 */
function validateAnnexes(regulations) {
    const warnings = [];

    // Patterns that indicate annex content is expected (self-references, not external)
    // Note: Patterns like "Annex I of Regulation X" are EXTERNAL references, not missing content
    const annexReferencePatterns = [
        /\bset\s+out\s+in\s+the\s+Annex\b/i,          // "set out in the Annex" (implies own annex)
        /\bin\s+the\s+Annex\s+to\s+this\b/i,          // "in the Annex to this Regulation"
        /\bcomplies?\s+with\s+the\s+Annex\b/i,        // "comply with the Annex"
        /\bthe\s+Annex(?!\s+(?:to|of)\s+(?:Implementing\s+)?(?:Regulation|Directive|Decision))/i,  // "the Annex" not followed by external ref
    ];

    // Pattern for actual annex section headings
    const annexHeadingPattern = /^##\s+ANNEX/im;

    for (const reg of regulations) {
        const content = reg.contentMarkdown;

        // Check if document has an ANNEX section
        const hasAnnexSection = annexHeadingPattern.test(content);
        if (hasAnnexSection) continue;

        // Check if document references annexes
        for (const pattern of annexReferencePatterns) {
            const match = content.match(pattern);
            if (match) {
                warnings.push({
                    slug: reg.slug,
                    reference: match[0]
                });
                break; // Only report first match per document
            }
        }
    }

    return warnings;
}

/**
 * Main build function
 */
function build() {
    console.log('🔨 Building regulation content...\n');

    // Create output directory
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

    const allRegulations = [];

    // Process each source directory
    for (const source of SOURCE_DIRS) {
        console.log(`📂 Scanning ${source.type}s: ${source.path}`);
        const regulations = scanDirectory(source.path, source.type);
        allRegulations.push(...regulations);
        console.log(`   Found ${regulations.length} documents\n`);
    }

    // Write individual regulation files (without full content for smaller index)
    for (const reg of allRegulations) {
        const outputPath = join(OUTPUT_DIR, `${reg.slug}.json`);
        writeFileSync(outputPath, JSON.stringify(reg, null, 2));
        console.log(`  ✅ ${reg.slug}.json (${reg.wordCount} words)`);
    }

    // Create index file (without content, just metadata for listing)
    const index = allRegulations.map(reg => ({
        slug: reg.slug,
        type: reg.type,
        title: reg.title,
        shortTitle: reg.shortTitle,
        description: reg.description,
        celex: reg.celex,
        date: reg.date,
        wordCount: reg.wordCount,
        tocCount: reg.toc.length
    }));

    // Sort index: regulations first, then implementing acts by date
    index.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === 'regulation' ? -1 : 1;
        }
        // Sort by slug (which contains year-number)
        return a.slug.localeCompare(b.slug);
    });

    const indexPath = join(OUTPUT_DIR, '..', 'regulations-index.json');
    writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log(`\n📋 Index written: regulations-index.json (${index.length} documents)`);

    // Validate: Check for missing annexes
    const annexWarnings = validateAnnexes(allRegulations);
    if (annexWarnings.length > 0) {
        console.log('\n⚠️  ANNEX VALIDATION WARNINGS:');
        console.log('   The following documents reference annexes but have no ## ANNEX section:');
        for (const warning of annexWarnings) {
            console.log(`   - ${warning.slug}: "${warning.reference}"`);
        }
        console.log('   Run: python scripts/batch_fix_annexes.py to re-download with annexes.\n');
    }

    console.log('\n✨ Build complete!');
    console.log(`   Total documents: ${allRegulations.length}`);
    console.log(`   Total words: ${allRegulations.reduce((sum, r) => sum + r.wordCount, 0).toLocaleString()}`);
}

// Run the build
build();
