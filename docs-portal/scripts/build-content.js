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
import rehypeParagraphIds from './rehype-paragraph-ids.js';
import rehypeTermLinks from './rehype-term-links.js';
import rehypeExternalLinks from './rehype-external-links.js';
import rehypeArticleLinks from './rehype-article-links.js';
import rehypeStringify from 'rehype-stringify';

// Use the same slugger as rehype-slug for consistent IDs
import GithubSlugger from 'github-slugger';

// YAML parser for loading documents.yaml (Single Source of Truth for titles)
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths relative to docs-portal
const PROJECT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data', 'regulations');
const TERMINOLOGY_PATH = join(__dirname, '..', 'public', 'data', 'terminology.json');

// Source directories
const SOURCE_DIRS = [
    { path: join(PROJECT_ROOT, '01_regulation'), type: 'regulation' },
    { path: join(PROJECT_ROOT, '02_implementing_acts'), type: 'implementing-act' },
    { path: join(PROJECT_ROOT, '03_supplementary'), type: 'supplementary' }
];

// Protected Sources Configuration
// Loaded from config/protected-sources.yaml
// See: TRACKER.md V3.6.3 — Critical Regression Prevention
const PROTECTED_SOURCES_PATH = join(__dirname, '..', 'config', 'protected-sources.yaml');
let protectedSourcesConfig = null;

/**
 * Load protected sources configuration.
 * 
 * This defines content invariants for critical documents to prevent
 * silent data corruption (e.g., Articles 5a-45 going missing).
 * 
 * @returns {Object} Protected sources configuration
 */
function loadProtectedSourcesConfig() {
    if (protectedSourcesConfig) return protectedSourcesConfig;

    if (!existsSync(PROTECTED_SOURCES_PATH)) {
        console.warn('  ⚠️  Protected sources config not found — validation skipped');
        return null;
    }

    try {
        const content = readFileSync(PROTECTED_SOURCES_PATH, 'utf-8');
        protectedSourcesConfig = yaml.load(content);
        return protectedSourcesConfig;
    } catch (err) {
        console.error('  ❌ Error loading protected sources config:', err.message);
        return null;
    }
}

/**
 * Validate content integrity for protected documents.
 * 
 * CRITICAL: This function catches regressions like commit a7a8dbb
 * where Articles 5a-45 silently vanished from the eIDAS regulation.
 * 
 * Checks:
 * 1. Required articles exist in TOC
 * 2. Word count meets minimum threshold
 * 3. TOC has minimum number of items
 * 4. Required patterns exist in content
 * 
 * @param {Array} regulations - All processed regulation objects
 * @throws {Error} If any critical validation fails
 */
function validateProtectedSources(regulations) {
    const config = loadProtectedSourcesConfig();
    if (!config) return;

    console.log('\n🛡️  Validating protected sources...');

    // Check total word count threshold
    const totalWords = regulations.reduce((sum, r) => sum + r.wordCount, 0);
    if (totalWords < config.minimumTotalWords) {
        throw new Error(
            `❌ BUILD FAILED: Total word count (${totalWords.toLocaleString()}) is below minimum threshold!\n` +
            `\n` +
            `   Minimum required: ${config.minimumTotalWords.toLocaleString()} words\n` +
            `   This indicates significant content loss.\n` +
            `\n` +
            `   Check git diff to identify what content was removed.\n`
        );
    }

    // Validate each protected document
    for (const doc of config.documents || []) {
        const regulation = regulations.find(r => r.slug === doc.slug);

        if (!regulation) {
            throw new Error(
                `❌ BUILD FAILED: Protected document "${doc.name}" (${doc.slug}) not found!\n` +
                `\n` +
                `   This document is listed in protected-sources.yaml but wasn't built.\n` +
                `   Check if the source file exists and is being processed.\n`
            );
        }

        console.log(`   📄 Checking ${doc.name} (${doc.slug})...`);

        // Check word count
        if (doc.minWords && regulation.wordCount < doc.minWords) {
            throw new Error(
                `❌ BUILD FAILED: "${doc.name}" word count (${regulation.wordCount.toLocaleString()}) is below minimum!\n` +
                `\n` +
                `   Minimum required: ${doc.minWords.toLocaleString()} words\n` +
                `   This indicates content was truncated or corrupted.\n` +
                `\n` +
                `   Check git diff to identify what content was removed.\n`
            );
        }

        // Check TOC item count
        if (doc.minTocItems && regulation.toc.length < doc.minTocItems) {
            throw new Error(
                `❌ BUILD FAILED: "${doc.name}" TOC has only ${regulation.toc.length} items!\n` +
                `\n` +
                `   Minimum required: ${doc.minTocItems} items\n` +
                `   This indicates document structure was corrupted.\n` +
                `\n` +
                `   Check git diff to identify what content was removed.\n`
            );
        }

        // Check required articles
        if (doc.requiredArticles && doc.requiredArticles.length > 0) {
            // Extract article numbers from TOC
            // TOC titles are like "Article 5a", "Article 46b", etc.
            const tocArticles = regulation.toc
                .filter(item => item.title.startsWith('Article '))
                .map(item => {
                    const match = item.title.match(/^Article\s+(.+)$/);
                    return match ? match[1] : null;
                })
                .filter(Boolean);

            const missingArticles = doc.requiredArticles.filter(
                required => !tocArticles.includes(required)
            );

            if (missingArticles.length > 0) {
                throw new Error(
                    `❌ BUILD FAILED: "${doc.name}" is missing required articles!\n` +
                    `\n` +
                    `   Missing: ${missingArticles.join(', ')}\n` +
                    `   Found: ${tocArticles.length} articles in TOC\n` +
                    `\n` +
                    `   This is a CRITICAL regression — content structure is corrupted.\n` +
                    `   The source markdown file may have been damaged.\n` +
                    `\n` +
                    `   To fix: Restore from git history:\n` +
                    `   git log -10 -- 01_regulation/2014_910_eIDAS_Consolidated/\n` +
                    `   git checkout <commit>~1 -- <file>\n`
                );
            }
        }

        // Check required patterns
        if (doc.requiredPatterns && doc.requiredPatterns.length > 0) {
            const content = regulation.contentMarkdown;
            const missingPatterns = doc.requiredPatterns.filter(
                pattern => !content.includes(pattern)
            );

            if (missingPatterns.length > 0) {
                throw new Error(
                    `❌ BUILD FAILED: "${doc.name}" is missing required content patterns!\n` +
                    `\n` +
                    `   Missing patterns:\n` +
                    missingPatterns.map(p => `     - "${p}"`).join('\n') + '\n' +
                    `\n` +
                    `   This indicates key terminology is missing from the document.\n`
                );
            }
        }

        // Check article order (prevents regression like 522e0bc where 5→46→5a happened)
        if (doc.articleOrderCheck && doc.articleOrderCheck.length > 0) {
            // Extract article numbers from TOC in order
            const tocArticles = regulation.toc
                .filter(item => item.title.startsWith('Article '))
                .map(item => {
                    const match = item.title.match(/^Article\s+(.+)$/);
                    return match ? match[1] : null;
                })
                .filter(Boolean);

            for (const [preceding, following] of doc.articleOrderCheck) {
                const precedingIdx = tocArticles.indexOf(preceding);
                const followingIdx = tocArticles.indexOf(following);

                if (precedingIdx === -1 || followingIdx === -1) {
                    // One of the articles is missing - already caught by requiredArticles
                    continue;
                }

                if (followingIdx !== precedingIdx + 1) {
                    // Articles are out of order!
                    const actualNext = tocArticles[precedingIdx + 1];
                    throw new Error(
                        `❌ BUILD FAILED: "${doc.name}" has SCRAMBLED article order!\n` +
                        `\n` +
                        `   Expected: Article ${preceding} → Article ${following}\n` +
                        `   Actual:   Article ${preceding} → Article ${actualNext}\n` +
                        `\n` +
                        `   This is the 522e0bc regression pattern!\n` +
                        `   The Formex converter was likely re-run, scrambling article order.\n` +
                        `\n` +
                        `   FIX: DO NOT re-run the converter. Instead:\n` +
                        `   1. Find a commit with correct article order:\n` +
                        `      git log -10 -- 01_regulation/2014_910_eIDAS_Consolidated/\n` +
                        `   2. Restore from that commit:\n` +
                        `      git show <commit>:01_regulation/.../02014R0910-20241018.md > 01_regulation/.../02014R0910-20241018.md\n`
                    );
                }
            }
        }

        console.log(`      ✅ ${regulation.toc.length} TOC items, ${regulation.wordCount.toLocaleString()} words`);
    }

    console.log('   ✅ All protected sources validated');
}

/**
 * Load terminology data for term linking.
 * DEC-085: Terminology Cross-Linking
 */
let terminologyData = null;

/**
 * Load external documents registry for EUR-Lex deep linking.
 * DEC-XXX: EUR-Lex Deep Linking
 */
const EXTERNAL_DOCS_PATH = join(__dirname, '..', 'config', 'external-documents.yaml');
let externalDocsData = null;

/**
 * Load external documents configuration.
 */
function loadExternalDocs() {
    if (externalDocsData) return externalDocsData;

    try {
        if (existsSync(EXTERNAL_DOCS_PATH)) {
            const content = readFileSync(EXTERNAL_DOCS_PATH, 'utf-8');
            externalDocsData = yaml.load(content);
            console.log(`   📚 Loaded ${externalDocsData?.documents?.length || 0} external documents for EUR-Lex linking`);
        }
    } catch (err) {
        console.warn(`   ⚠️  Could not load external documents: ${err.message}`);
        externalDocsData = { documents: [] };
    }

    return externalDocsData || { documents: [] };
}

/**
 * Build set of imported document IDs to exclude from external linking.
 * Loaded from documents.yaml - the Single Source of Truth.
 * 
 * These are documents in the portal that should use internal links,
 * not EUR-Lex external links.
 */
function getImportedDocIds() {
    const ids = new Set();

    // Load from documents.yaml (SSOT)
    const docsConfig = loadDocumentsConfig();
    if (docsConfig && docsConfig.documents) {
        for (const doc of docsConfig.documents) {
            // Extract year/number from CELEX
            // CELEX formats: 32014R0910, 02014R0910-20241018, 32024R1183
            const celexMatch = doc.celex?.match(/[03](\d{4})[RDHL](\d+)/);
            if (celexMatch) {
                const year = celexMatch[1];
                const number = celexMatch[2];
                // Add both formats for matching
                ids.add(`${year}/${number}`);
                ids.add(`${number}/${year}`);
            }
        }
    }

    console.log(`   📋 Loaded ${ids.size / 2} imported documents to exclude from external linking`);
    return ids;
}

function loadTerminology() {
    if (terminologyData) return terminologyData;

    if (!existsSync(TERMINOLOGY_PATH)) {
        console.warn('  ⚠️  terminology.json not found - run npm run build:terminology first');
        return null;
    }

    try {
        terminologyData = JSON.parse(readFileSync(TERMINOLOGY_PATH, 'utf-8'));
        console.log(`📚 Loaded terminology: ${terminologyData.terms?.length || 0} terms`);
        return terminologyData;
    } catch (err) {
        console.warn('  ⚠️  Error loading terminology:', err.message);
        return null;
    }
}

/**
 * Load documents.yaml - Single Source of Truth for document metadata.
 * 
 * This file defines shortTitle for regulations, preventing hardcoded
 * title logic in this script. DEC-043 (2026-01-16).
 */
const DOCUMENTS_YAML_PATH = join(PROJECT_ROOT, 'scripts', 'documents.yaml');
let documentsConfig = null;

function loadDocumentsConfig() {
    if (documentsConfig) return documentsConfig;

    try {
        const content = readFileSync(DOCUMENTS_YAML_PATH, 'utf-8');
        documentsConfig = yaml.load(content);
        return documentsConfig;
    } catch (err) {
        console.warn(`⚠️  Could not load documents.yaml: ${err.message}`);
        return { documents: [] };
    }
}

/**
 * Get title for a document from documents.yaml.
 * 
 * Matches by output_dir (folder name) since CELEX format varies.
 * Returns null if not found or no title defined.
 * 
 * @param {string} dirName - Directory name (e.g., "2015_1501_eIDAS_Interoperability")
 * @returns {string|null} - The title from documents.yaml or null
 */
function getTitleFromConfig(dirName) {
    const config = loadDocumentsConfig();
    if (!config?.documents) return null;

    const doc = config.documents.find(d =>
        d.output_dir && d.output_dir.endsWith(dirName)
    );

    return doc?.title || null;
}

/**
 * Get shortTitle for a document from documents.yaml.
 * 
 * Matches by output_dir (folder name) since CELEX format varies.
 * Returns null if not found or no shortTitle defined.
 * 
 * @param {string} dirName - Directory name (e.g., "765_2008_Market_Surveillance")
 * @returns {string|null} - The shortTitle from documents.yaml or null
 */
function getShortTitleFromConfig(dirName) {
    const config = loadDocumentsConfig();
    if (!config?.documents) return null;

    const doc = config.documents.find(d =>
        d.output_dir && d.output_dir.endsWith(dirName)
    );

    return doc?.shortTitle || null;
}

/**
 * Get sidebarTitle for a document from documents.yaml.
 * 
 * The sidebarTitle is used for display in the navigation sidebar,
 * allowing a shorter/cleaner title than shortTitle (which may include
 * suffixes like "(Consolidated)" for document headers).
 * 
 * Falls back to shortTitle if sidebarTitle is not defined.
 * 
 * @param {string} dirName - Directory name (e.g., "765_2008_Market_Surveillance")
 * @returns {string|null} - The sidebarTitle from documents.yaml, or shortTitle, or null
 */
function getSidebarTitleFromConfig(dirName) {
    const config = loadDocumentsConfig();
    if (!config?.documents) return null;

    const doc = config.documents.find(d =>
        d.output_dir && d.output_dir.endsWith(dirName)
    );

    // Return sidebarTitle if defined, otherwise fall back to shortTitle
    return doc?.sidebarTitle || doc?.shortTitle || null;
}

/**
 * Get document typing (legalType and category) from documents.yaml.
 * 
 * These two fields separate:
 * - legalType: What the document IS under EU law (regulation, recommendation, decision)
 * - category: How it relates to the eIDAS project (primary, implementing_act, referenced)
 * 
 * @param {string} dirName - Directory name (e.g., "765_2008_Market_Surveillance")
 * @returns {{legalType: string|null, category: string|null}}
 */
function getDocumentTypingFromConfig(dirName) {
    const config = loadDocumentsConfig();
    if (!config?.documents) return { legalType: null, category: null };

    // Match by output_dir or by id (for supplementary documents like FAQ)
    const doc = config.documents.find(d =>
        (d.output_dir && d.output_dir.endsWith(dirName)) ||
        (d.id && (d.id === dirName || dirName.includes(d.id.replace(/-/g, '_'))))
    );

    return {
        legalType: doc?.legalType || null,
        category: doc?.category || null
    };
}

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
    // Target: Consolidated eIDAS regulation (new standardized slug format)
    targetSlugPattern: /^2014-910$/,

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
 * Citation Transformation Configuration
 * 
 * Part of DEC-009: Replace verbose inline citations with clean short names.
 * 
 * Input: \[Full title of Act (OJ L xxx, date, p. xx, ELI: http://...)\]
 * Output: <span class="citation-ref" data-index="N">Short Name</span>
 * 
 * Citations are extracted at build time by build-citations.js which creates
 * citation JSON files. This function reads those files and transforms the
 * markdown content before HTML conversion.
 */
const CITATIONS_DIR = join(__dirname, '..', 'public', 'data', 'citations');

/**
 * Load citations for a given slug if they exist.
 * @param {string} slug - Document slug (e.g., "2025-0846")
 * @returns {Array|null} - Array of citation objects or null if not found
 */
function loadCitations(slug) {
    const citationPath = join(CITATIONS_DIR, `${slug}.json`);
    if (!existsSync(citationPath)) {
        return null;
    }
    try {
        const data = JSON.parse(readFileSync(citationPath, 'utf-8'));
        return data.citations || null;
    } catch (err) {
        console.warn(`  ⚠️  Error loading citations for ${slug}:`, err.message);
        return null;
    }
}

/**
 * Transform citations in markdown content.
 * 
 * Replaces verbose inline citations with clean span elements containing
 * the short name and data attributes for frontend hydration.
 * 
 * @param {string} content - Markdown content
 * @param {Array} citations - Array of citation objects from build-citations.js
 * @returns {string} - Transformed markdown
 */
function transformCitationsInMarkdown(content, citations) {
    if (!citations || citations.length === 0) return content;

    let transformed = content;
    let replacements = 0;

    for (const citation of citations) {
        // The originalText is exactly as it appears in the markdown
        const originalText = citation.originalText;

        // DEC-064: For provision citations, show the full reference (e.g., "Article 5a(23) of Regulation 910/2014")
        // For base citations, use displayText (original inline text like "Commission Recommendation (EU) 2021/946")
        // or fall back to shortName
        const displayText = citation.provision
            ? citation.provision.fullReference
            : (citation.displayText || citation.shortName);

        // Replace with HTML span (will pass through markdown processor)
        // Using data attributes for frontend popover hydration
        const replacement = `<span class="citation-ref" tabindex="0" role="button" data-idx="${citation.index}" data-short="${citation.shortName.replace(/"/g, '&quot;')}" data-celex="${citation.celex || ''}" data-internal="${citation.isInternal}" data-url="${citation.url}">${displayText}</span>`;

        // Use simple string includes/replace - more reliable than regex for complex text
        if (transformed.includes(originalText)) {
            transformed = transformed.split(originalText).join(replacement);
            replacements++;
        }
    }

    if (replacements > 0) {
        console.log(`     ✅ Transformed ${replacements} citations`);
    }

    return transformed;
}

/**
 * Parse CELEX and metadata from the first line blockquote OR YAML front matter
 * 
 * Supports two formats:
 * 1. Blockquote format (regulations): > **CELEX:** xxx | **Document:** yyy
 * 2. YAML front matter (supplementary): ---\ntitle: xxx\nshortTitle: yyy\n---
 */
function parseMetadata(content) {
    const metadata = {
        celex: null,
        documentType: null,
        source: null,
        version: null,
        subject: null,
        // New fields from YAML front matter
        title: null,
        shortTitle: null,
        description: null,
        category: null,
        type: null
    };

    // Check for YAML front matter first (supplementary content)
    const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (yamlMatch) {
        const yaml = yamlMatch[1];

        // Simple YAML parsing for our known fields
        const parseYamlField = (field) => {
            const match = yaml.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
            return match ? match[1].trim() : null;
        };

        metadata.title = parseYamlField('title');
        metadata.shortTitle = parseYamlField('shortTitle');
        metadata.description = parseYamlField('description');
        metadata.source = parseYamlField('source');
        metadata.type = parseYamlField('type');
        metadata.category = parseYamlField('category');

        // If we found YAML front matter, return early
        if (metadata.title || metadata.shortTitle) {
            return metadata;
        }
    }

    // Fallback to blockquote format (regulations)
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
 * 1. YAML front matter (supplementary): ---\ntitle: xxx\n---
 * 2. Metadata blockquote: CELEX, Document type, Source URL (shown in header badges)
 * 3. Amendment History table: Only in consolidated regulations, renders as raw markdown
 * 4. Main H1 title: Already displayed in the header component
 * 
 * Decision: 2026-01-14 - Metadata stripped from rendered content.
 * The original markdown files retain this data for archival purposes.
 * See AGENTS.md for documentation of this decision.
 */
function stripFrontMatter(content) {
    let result = content;

    // 0. Strip YAML front matter (supplementary content)
    // Pattern: ---\n...yaml content...\n---
    const yamlFrontMatterPattern = /^---\n[\s\S]*?\n---\n*/;
    result = result.replace(yamlFrontMatterPattern, '');

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
 * Extract a human-readable short title from metadata, folder name, or config.
 * 
 * Priority chain (Single Source of Truth principle - DEC-043):
 * 1. Explicit **Subject:** field in markdown metadata
 * 2. Explicit shortTitle from documents.yaml (AUTHORITATIVE for regulations)
 * 3. Folder name pattern (YYYY_NNNN_Human_Readable) for implementing acts
 * 4. CELEX-based pattern fallback for implementing acts
 * 5. FAIL BUILD for regulations without shortTitle (fail-fast validation)
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

    // Priority 2: Check documents.yaml for explicit shortTitle
    // This is the Single Source of Truth for regulation titles (DEC-043)
    const configShortTitle = getShortTitleFromConfig(dirName);
    if (configShortTitle) {
        return configShortTitle;
    }

    // Priority 3: For implementing acts, extract from folder name
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

    // Priority 4: For implementing acts without folder description, use CELEX pattern
    if (type === 'implementing-act' && celex) {
        // CELEX format: 3YYYYRNNN or 3YYYYDNNNN (R=Regulation, D=Decision)
        const celexMatch = celex.match(/3(\d{4})[RD](\d+)/);
        if (celexMatch) {
            const docType = celex.includes('D') ? 'ID' : 'IR'; // ID = Implementing Decision
            return `${docType} ${celexMatch[1]}/${celexMatch[2]}`;
        }
    }

    // FAIL FAST: Regulations MUST have explicit shortTitle in documents.yaml
    // This prevents forgetting to update config when adding new regulations
    if (type === 'regulation') {
        throw new Error(
            `❌ BUILD FAILED: No shortTitle for regulation "${dirName}" (CELEX: ${celex})\n` +
            `\n` +
            `   Regulations must have explicit shortTitle in documents.yaml.\n` +
            `   This prevents hardcoded title logic in build-content.js.\n` +
            `\n` +
            `   FIX: Add to scripts/documents.yaml:\n` +
            `\n` +
            `   - celex: ${celex}\n` +
            `     shortTitle: "Human Readable Name"  # ← Add this line\n` +
            `     type: ...\n` +
            `     output_dir: 01_regulation/${dirName}\n` +
            `\n` +
            `   See DEC-043 for rationale.`
        );
    }

    // Fallback for other types: first 60 chars of title
    return fullTitle.length > 60 ? fullTitle.substring(0, 57) + '...' : fullTitle;
}


/**
 * Generate URL-safe slug from directory name
 * 
 * All directories now use {year}_{number}_{description} format (DEC-083).
 * Examples:
 *   - 2014_910_eIDAS_Consolidated -> 2014-910
 *   - 2024_2977_PID_and_EAA -> 2024-2977
 */
function generateSlug(dirName, type) {
    // Standard format: year-number for all documents
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
 * 
 * Note: "Enacting Terms" is filtered out per DEC-010 — it's not a useful
 * navigation target (users want articles/chapters, not structural markers).
 */
function buildTableOfContents(content) {
    const toc = [];
    const headingRegex = /^(#{1,4})\s+(.+)$/gm;

    // Use the same slugger as rehype-slug for consistent ID generation
    const slugger = new GithubSlugger();

    // Headings to exclude from TOC (still present in rendered content)
    const excludedHeadings = new Set(['Enacting Terms']);

    let match;

    while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const title = match[2].trim();

        // Skip the main title (H1) - it's displayed in the header
        if (level === 1 && toc.length === 0) continue;

        // Clean the title (remove bold markers, etc.)
        const cleanTitle = title.replace(/\*\*/g, '');

        // Skip excluded headings (DEC-010: Enacting Terms not navigation target)
        if (excludedHeadings.has(cleanTitle)) continue;

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
 * 
 * For regulations: Use the full title as description (displayed as subtitle)
 * For supplementary content: Extract from preamble if available
 */
function parseDescription(content, title) {
    // For regulation titles: use the full title as description
    // This displays properly as the subtitle in the portal header
    // Always prioritize title over preamble extraction
    if (title) {
        return title;
    }

    // Fallback: Try to find description from preamble (for supplementary content without proper titles)
    const preambleMatch = content.match(/## Preamble\s+([^#]+)/);
    if (preambleMatch) {
        // Extract first sentence after preamble heading
        const firstSentence = preambleMatch[1].match(/[A-Z][^.!?]*[.!?]/);
        if (firstSentence) return firstSentence[0].trim();
    }

    return '';
}

/**
 * Extract date from content or directory name.
 * 
 * Priority order:
 * 1. Metadata blockquote (first 10 lines) - most reliable
 * 2. Title continuation "of DATE" pattern (e.g., "**of 8 September 2015**")
 * 3. Signature block "Done at LOCATION, DATE" pattern - official adoption date
 * 4. Fallback: first date in content (may be from citations - less reliable)
 * 5. Year from directory name
 */
function extractDate(content, dirName, celex) {
    const datePattern = /(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/g;

    // Split into lines for priority searching
    const lines = content.split('\n');
    const firstTenLines = lines.slice(0, 10).join('\n');

    // Priority 1: Look for date in metadata blockquote (first 10 lines)
    const metadataMatch = firstTenLines.match(datePattern);
    if (metadataMatch) {
        return metadataMatch[0];
    }

    // Priority 2: Look for "Done at LOCATION, DATE" pattern (signature block)
    // This is the official adoption date in EU documents - most reliable
    const doneAtPattern = /Done at [^,]+,\s*(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/;
    const doneAtMatch = content.match(doneAtPattern);
    if (doneAtMatch) {
        return doneAtMatch[1];
    }

    // Priority 3: Look for "of DATE" pattern (title continuation)
    // This captures dates like "**of 8 September 2015**"
    // Note: Can match dates from citations, so check after Done at
    const ofDatePattern = /\bof\s+(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/;
    const first50Lines = lines.slice(0, 50).join('\n');
    const ofDateMatch = first50Lines.match(ofDatePattern);
    if (ofDateMatch) {
        return ofDateMatch[1];
    }

    // Priority 4: First date found anywhere (fallback - may be from citations)
    const fallbackMatch = content.match(datePattern);
    if (fallbackMatch) {
        return fallbackMatch[0];
    }

    // Priority 5: Extract year from directory name
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
 * 5. rehypeParagraphIds: Add IDs to paragraphs/points for deep linking
 * 6. rehypeTermLinks: Link defined terms to terminology (DEC-085)
 * 7. rehypeStringify: HAST → HTML string
 * 
 * This replaces the fragile regex-based approach with proper AST processing.
 */
function createMarkdownProcessor() {
    const terminology = loadTerminology();

    return unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeSlug)
        .use(rehypeParagraphIds)  // DEC-011 Phase 2: Add IDs to paragraphs/points
        .use(rehypeTermLinks, { terminology })  // DEC-085: Link defined terms
        .use(rehypeArticleLinks, {              // Intra-document article cross-links
            overridesPath: join(__dirname, '..', 'config', 'article-link-overrides.yaml')
        })
        .use(rehypeExternalLinks, {  // EUR-Lex Deep Linking
            externalDocs: loadExternalDocs(),
            importedDocs: getImportedDocIds()
        })
        .use(rehypeStringify, { allowDangerousHtml: true });
}

// Lazily initialized processor
let markdownProcessor = null;

/**
 * Convert markdown content to HTML using the unified processor.
 * Generates proper heading IDs for TOC deep-linking.
 */
function markdownToHtml(markdown) {
    if (!markdown) return '';

    // Initialize processor on first use
    if (!markdownProcessor) {
        markdownProcessor = createMarkdownProcessor();
    }

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

    // Title priority: YAML front matter (supplementary) > H1 heading (regulations)
    // The H1 heading in markdown IS the authoritative full legal title
    // documents.yaml 'title' is for display/navigation purposes only
    const title = metadata.title || parseTitle(rawContent);

    // Strip front matter for all content-related processing
    let content = stripFrontMatter(rawContent);

    const slug = generateSlug(dirName, type);

    // For supplementary content with YAML front matter, use metadata.shortTitle
    // For regulations, use extractShortTitle with its priority chain
    const shortTitle = metadata.shortTitle || extractShortTitle(title, metadata.celex, type, dirName, metadata.subject);
    const sidebarTitle = getSidebarTitleFromConfig(dirName);  // May be null (uses shortTitle fallback)

    // Get document typing from documents.yaml (legalType + category)
    const docTyping = getDocumentTypingFromConfig(dirName);

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
    // For supplementary content, use metadata.description from YAML
    // For regulations, extract from preamble
    const description = metadata.description || parseDescription(rawContent, title);
    const date = extractDate(rawContent, dirName, metadata.celex);

    // Transform citations BEFORE markdown → HTML conversion
    const citations = loadCitations(slug);
    if (citations && citations.length > 0) {
        console.log(`  📚 Transforming ${citations.length} citations for ${slug}...`);
        content = transformCitationsInMarkdown(content, citations);
    }

    // Prepare the regulation data object
    const regulationData = {
        slug,
        type,  // Legacy: 'regulation' or 'implementing-act' from source directory
        // New two-field model from documents.yaml:
        legalType: docTyping.legalType,    // What it IS (regulation, recommendation, decision)
        category: docTyping.category,       // Project role (primary, implementing_act, referenced)
        title,
        shortTitle,
        sidebarTitle,  // May be null; consumers should fall back to shortTitle
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
                    // Re-throw critical build errors (fail-fast validation)
                    if (err.message.includes('BUILD FAILED')) {
                        throw err;
                    }
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
                // Re-throw critical build errors (fail-fast validation)
                if (err.message.includes('BUILD FAILED')) {
                    throw err;
                }
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

    // Known documents with missing annexes - suppress individual warnings but count them
    // TODO: Run batch_fix_annexes.py to download complete versions with annexes  
    // Once fixed, remove slugs from this list
    const KNOWN_MISSING_ANNEXES = new Set([
        '2022-2481', // Annex embedded in main text (multi-country project areas)
        '2024-1183', '2024-2977', '2024-2982', '2025-0847', '2025-0848', '2025-0849',
        '2025-1566', '2025-1567', '2025-1570', '2025-1929', '2025-1942', '2025-1943',
        '2025-1944', '2025-1946', '2025-2160', '2025-2164', '2025-2527', '2025-2530',
        '2025-2531', '2025-2532'
    ]);

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

    let knownCount = 0;

    for (const reg of regulations) {
        const content = reg.contentMarkdown;

        // Check if document has an ANNEX section
        const hasAnnexSection = annexHeadingPattern.test(content);
        if (hasAnnexSection) continue;

        // Check if document references annexes
        for (const pattern of annexReferencePatterns) {
            const match = content.match(pattern);
            if (match) {
                if (KNOWN_MISSING_ANNEXES.has(reg.slug)) {
                    // Suppress known warnings but count them
                    knownCount++;
                } else {
                    // NEW warning - document with missing annex not in known list
                    warnings.push({
                        slug: reg.slug,
                        reference: match[0]
                    });
                }
                break; // Only report first match per document
            }
        }
    }

    return { warnings, knownCount };
}

/**
 * Generate metadata.json with computed statistics.
 * 
 * ⚠️ VALIDATION CRITICAL: This function includes 3-tier validation that prevents
 * data integrity issues. Do not remove or weaken validation checks without careful
 * consideration. Build should FAIL FAST on data corruption.
 * 
 * This metadata file provides build-time computed stats that prevent
 * hardcoding values in UI components. The metadata includes:
 * - Document counts (total, by category)
 * - Word counts (total, by category)
 * - Build timestamp
 * 
 * Build-time validation ensures data integrity (Defense in Depth, AGENTS.md Rule 5).
 * 
 * @param {Array<{type: string, wordCount: number, slug: string, toc: Array}>} regulations - Array of all processed regulation objects
 * @returns {{
 *   documentCount: number,
 *   regulationCount: number,
 *   implementingActCount: number,
 *   totalWordCount: number,
 *   regulationWordCount: number,
 *   implementingActWordCount: number,
 *   terminologyCount: number,
 *   totalArticles: number,
 *   lastBuildTime: string,
 *   buildDate: string,
 *   categories: {
 *     regulations: {count: number, wordCount: number, slugs: string[]},
 *     implementingActs: {count: number, wordCount: number}
 *   }
 * }} Metadata object to be written to metadata.json
 * 
 * @see DECISIONS.md - DEC-012 for architecture and rationale
 */
function generateMetadata(regulations) {
    // Count documents by type
    const regulationDocs = regulations.filter(r => r.type === 'regulation');
    const implementingActDocs = regulations.filter(r => r.type === 'implementing-act');
    const supplementaryDocs = regulations.filter(r => r.type === 'supplementary');

    // Calculate word counts
    const totalWordCount = regulations.reduce((sum, r) => sum + r.wordCount, 0);
    const regulationWordCount = regulationDocs.reduce((sum, r) => sum + r.wordCount, 0);
    const implementingActWordCount = implementingActDocs.reduce((sum, r) => sum + r.wordCount, 0);
    const supplementaryWordCount = supplementaryDocs.reduce((sum, r) => sum + r.wordCount, 0);

    // Build-time validation (Defense in Depth)
    const documentCount = regulations.length;
    const regulationCount = regulationDocs.length;
    const implementingActCount = implementingActDocs.length;
    const supplementaryCount = supplementaryDocs.length;

    // Validation 1: Sum of categories must equal total
    if (regulationCount + implementingActCount + supplementaryCount !== documentCount) {
        throw new Error(
            `Data integrity error: Document type mismatch!\n` +
            `  Total documents: ${documentCount}\n` +
            `  Regulations: ${regulationCount}\n` +
            `  Implementing acts: ${implementingActCount}\n` +
            `  Supplementary: ${supplementaryCount}\n` +
            `  Sum: ${regulationCount + implementingActCount + supplementaryCount}\n` +
            `  Expected: Total = Regulations + Implementing Acts + Supplementary`
        );
    }

    // Note: Regulation count is no longer hardcoded—it's derived from documents.yaml
    // Log for reference (not an error or warning)
    console.log(`   Regulations (type=regulation): ${regulationDocs.map(r => r.slug).join(', ')}`);
    if (supplementaryCount > 0) {
        console.log(`   Supplementary (type=supplementary): ${supplementaryDocs.map(r => r.slug).join(', ')}`);
    }

    // Validation 3: Word count sanity check (total should be reasonable)
    if (totalWordCount < 10000) {
        throw new Error(
            `Data integrity error: Total word count (${totalWordCount}) is suspiciously low!\n` +
            `  This suggests content was not properly extracted.`
        );
    }

    // Load terminology count from terminology.json
    let terminologyCount = 0;
    try {
        if (existsSync(TERMINOLOGY_PATH)) {
            const terminologyData = JSON.parse(readFileSync(TERMINOLOGY_PATH, 'utf-8'));
            terminologyCount = terminologyData.terms?.length || 0;
        }
    } catch (err) {
        console.warn(`   ⚠️  Could not load terminology count: ${err.message}`);
    }

    // Calculate total articles/sections (sum of all TOC items)
    const totalArticles = regulations.reduce((sum, r) => sum + (r.toc?.length || 0), 0);

    const metadata = {
        // Document counts
        documentCount,
        regulationCount,
        implementingActCount,
        supplementaryCount,

        // Word counts
        totalWordCount,
        regulationWordCount,
        implementingActWordCount,
        supplementaryWordCount,

        // Homepage stats
        terminologyCount,
        totalArticles,

        // Build info
        lastBuildTime: new Date().toISOString(),
        buildDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }),

        // Category details (for potential future use)
        categories: {
            regulations: {
                count: regulationCount,
                wordCount: regulationWordCount,
                slugs: regulationDocs.map(r => r.slug)
            },
            implementingActs: {
                count: implementingActCount,
                wordCount: implementingActWordCount
            },
            supplementary: {
                count: supplementaryCount,
                wordCount: supplementaryWordCount,
                slugs: supplementaryDocs.map(r => r.slug)
            }
        }
    };

    return metadata;
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
    let totalArticleLinks = 0;
    for (const reg of allRegulations) {
        const outputPath = join(OUTPUT_DIR, `${reg.slug}.json`);
        writeFileSync(outputPath, JSON.stringify(reg, null, 2));
        // Count article links in this document
        const articleLinkCount = (reg.contentHtml?.match(/class="article-link"/g) || []).length;
        totalArticleLinks += articleLinkCount;
        const linkSuffix = articleLinkCount > 0 ? `, ${articleLinkCount} article links` : '';
        console.log(`  ✅ ${reg.slug}.json (${reg.wordCount} words${linkSuffix})`);
    }

    // Create index file (without content, just metadata for listing)
    const index = allRegulations.map(reg => ({
        slug: reg.slug,
        type: reg.type,  // Legacy field
        legalType: reg.legalType,  // New: What it IS (regulation, recommendation, decision)
        category: reg.category,     // New: Project role (primary, implementing_act, referenced)
        title: reg.title,
        shortTitle: reg.shortTitle,
        sidebarTitle: reg.sidebarTitle,  // New: Cleaner title for sidebar navigation
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

    // Generate metadata with build-time validation
    console.log('\n📊 Generating metadata...');
    const metadata = generateMetadata(allRegulations);
    const metadataPath = join(OUTPUT_DIR, '..', 'metadata.json');
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`   ✅ Metadata written: metadata.json`);
    console.log(`   📈 Stats: ${metadata.documentCount} docs, ${metadata.totalWordCount.toLocaleString()} words`);

    // CRITICAL: Validate protected sources BEFORE completing build
    // This catches regressions like missing Articles 5a-45 (V3.6.3 fix)
    validateProtectedSources(allRegulations);

    // Validate: Check for missing annexes
    const { warnings: annexWarnings, knownCount } = validateAnnexes(allRegulations);

    // Only show detailed warnings for NEW documents (not in known list)
    if (annexWarnings.length > 0) {
        console.log('\n⚠️  NEW ANNEX WARNINGS (action required):');
        for (const warning of annexWarnings) {
            console.log(`   - ${warning.slug}: "${warning.reference}"`);
        }
        console.log('   Add to KNOWN_MISSING_ANNEXES in build-content.js or fix with batch_fix_annexes.py\n');
    }

    // Show summary of known suppressed warnings (quieter output)
    if (knownCount > 0) {
        console.log(`\n📋 Annex status: ${knownCount} documents with known missing annexes (suppressed)`);
        console.log('   Run: python scripts/batch_fix_annexes.py to download complete versions');
    }

    // Validate: Check that linkable classes are being generated correctly
    // This prevents regressions like the isTopLevelList bug (2026-01-17)
    console.log('\n🔍 Validating linkable element classes...');
    let hasParagraphs = false;
    let hasPoints = false;
    let hasRecitals = false;

    for (const reg of allRegulations) {
        const html = reg.contentHtml;
        if (html.includes('linkable-paragraph')) hasParagraphs = true;
        if (html.includes('linkable-point')) hasPoints = true;
        if (html.includes('linkable-recital')) hasRecitals = true;
    }

    // Validate: All expected classes should be present across the corpus
    const missingClasses = [];
    if (!hasParagraphs) missingClasses.push('linkable-paragraph');
    if (!hasPoints) missingClasses.push('linkable-point');
    if (!hasRecitals) missingClasses.push('linkable-recital');

    if (missingClasses.length > 0) {
        throw new Error(
            `❌ BUILD FAILED: Missing linkable classes in output!\n` +
            `\n` +
            `   Missing: ${missingClasses.join(', ')}\n` +
            `\n` +
            `   This usually indicates a bug in rehype-paragraph-ids.js.\n` +
            `   The isTopLevelList() function may be incorrectly classifying nested lists.\n` +
            `\n` +
            `   Run: node scripts/test-rehype-paragraph-ids.js\n` +
            `   See: AGENTS.md Rule 25 (AST traversal pitfall)\n`
        );
    }
    console.log('   ✅ All linkable classes present (paragraph, point, recital)');

    console.log('\n✨ Build complete!');
    console.log(`   📄 Documents: ${metadata.documentCount} (${metadata.regulationCount} regulations + ${metadata.implementingActCount} implementing acts)`);
    console.log(`   📝 Total words: ${metadata.totalWordCount.toLocaleString()}`);
    console.log(`   🔗 Article links: ${totalArticleLinks.toLocaleString()}`);
    console.log(`   🕒 Built: ${metadata.buildDate}`);
}

// Run the build
build();
