/**
 * Build-time script: Convert Markdown regulations to JSON
 * 
 * This script processes all eIDAS regulation markdown files and converts them
 * to a structured JSON format for the documentation portal.
 * 
 * Usage: node scripts/build-content.js
 * 
 * Output: public/data/regulations/*.json + public/data/regulations-index.json
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

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
 * Parse CELEX and metadata from the first line blockquote
 */
function parseMetadata(content) {
    const metadata = {
        celex: null,
        documentType: null,
        source: null,
        version: null
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

    return metadata;
}

/**
 * Strip front matter that is redundant in the portal UI.
 * 
 * This includes:
 * 1. Metadata blockquote: CELEX, Document type, Source URL (shown in header badges)
 * 2. Amendment History table: Only in consolidated regulations, renders as raw markdown
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
 * Extract a short title from the full title
 */
function extractShortTitle(fullTitle, celex, type) {
    // Try to extract regulation number from title
    if (type === 'regulation') {
        const regMatch = fullTitle.match(/Regulation \(EU\) (?:No )?(\d+\/\d+)/);
        if (regMatch) return `Regulation ${regMatch[1]}`;
    }

    // For implementing acts, extract from CELEX (e.g., "32024R2977" -> "IR 2024/2977")
    if (type === 'implementing-act' && celex) {
        // CELEX format: 3YYYYRNNN or 3YYYYDNNNN (R=Regulation, D=Decision)
        const celexMatch = celex.match(/3(\d{4})[RD](\d+)/);
        if (celexMatch) {
            const docType = celex.includes('D') ? 'ID' : 'IR'; // ID = Implementing Decision
            return `${docType} ${celexMatch[1]}/${celexMatch[2]}`;
        }
    }

    // Fallback: first 60 chars
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
 * Build Table of Contents from headings
 */
function buildTableOfContents(content) {
    const toc = [];
    const headingRegex = /^(#{1,4})\s+(.+)$/gm;

    let match;
    let articleCount = 0;

    while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const title = match[2].trim();

        // Skip the main title (H1) and metadata sections
        if (level === 1 && toc.length === 0) continue;

        // Generate ID from title
        let id = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);

        // For articles, use article-N format
        const articleMatch = title.match(/^Article\s+(\d+\w?)/i);
        if (articleMatch) {
            id = `article-${articleMatch[1].toLowerCase()}`;
            articleCount++;
        }

        toc.push({
            id,
            title: title.replace(/\*\*/g, ''), // Remove bold markers
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
 * Convert markdown content to HTML (basic conversion)
 * This is a simplified converter - the React app may use a full markdown library
 */
function markdownToHtml(markdown) {
    if (!markdown) return '';

    return markdown
        // Escape HTML entities first
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Then apply markdown transformations
        // Headers (process from h4 down to h1 to avoid conflicts)
        .replace(/^#### (.+)$/gm, '<h4 id="$1">$1</h4>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Blockquotes
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr />')
        // Lists (basic)
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        // Paragraphs (simple line break handling)
        .replace(/\n\n/g, '</p><p>')
        // Wrap in paragraph if not starting with HTML tag
        .replace(/^([^<])/, '<p>$1')
        .replace(/([^>])$/, '$1</p>');
}

/**
 * Process a single markdown file
 */
function processMarkdownFile(filePath, dirName, type) {
    const rawContent = readFileSync(filePath, 'utf-8');

    // Parse metadata from raw content (before stripping)
    const metadata = parseMetadata(rawContent);

    // Strip front matter for all content-related processing
    const content = stripFrontMatter(rawContent);

    const title = parseTitle(content);
    const slug = generateSlug(dirName, type);
    const shortTitle = extractShortTitle(title, metadata.celex, type);
    const toc = buildTableOfContents(content);
    const description = parseDescription(content, title);
    const date = extractDate(content, dirName, metadata.celex);

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
        // Content is already stripped of front matter
        contentMarkdown: content,
        // Also provide pre-rendered HTML for simple use cases
        contentHtml: markdownToHtml(content),
        // Metadata for search and filtering (use raw for accurate count)
        wordCount: rawContent.split(/\s+/).length,
        lastProcessed: new Date().toISOString()
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

    console.log('\n✨ Build complete!');
    console.log(`   Total documents: ${allRegulations.length}`);
    console.log(`   Total words: ${allRegulations.reduce((sum, r) => sum + r.wordCount, 0).toLocaleString()}`);
}

// Run the build
build();
