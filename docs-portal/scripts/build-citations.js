/**
 * build-citations.js
 * 
 * Extracts legal citations from markdown content and generates structured data.
 * Part of DEC-009: Citation formatting with responsive behavior and internal linking.
 * 
 * Run: node scripts/build-citations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================================
// INTERNAL DOCUMENT REGISTRY
// =============================================================================

/**
 * Build registry of all documents we have in the portal.
 * Maps CELEX number to portal route.
 */
function buildDocumentRegistry() {
    const registry = {};
    const dataDir = path.join(__dirname, '..', 'public', 'data', 'regulations');

    if (!fs.existsSync(dataDir)) {
        console.warn('⚠️  Regulations data directory not found');
        return registry;
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
        const celex = content.celex;
        const slug = content.slug;
        const type = content.type;

        if (celex) {
            registry[celex] = {
                slug,
                type,
                route: type === 'regulation'
                    ? `#/regulations/${slug}`
                    : `#/implementing-acts/${slug}`
            };
        }
    }

    console.log(`📚 Document registry: ${Object.keys(registry).length} documents`);
    return registry;
}

// =============================================================================
// CITATION EXTRACTION
// =============================================================================

/**
 * Parse ELI URL to extract document info.
 * ELI format: http://data.europa.eu/eli/{type}/{year}/{number}/oj
 */
function parseEli(eli) {
    // Clean up the ELI
    eli = eli.replace(/[)\]\\.,]+$/, '').trim();

    const match = eli.match(/eli\/([^/]+)\/(\d{4})\/(\d+)/);
    if (!match) return null;

    const [, docType, year, number] = match;

    // Map ELI type to CELEX type code
    const typeMap = {
        'reg': 'R',
        'reg_impl': 'R',
        'dir': 'L',
        'dec': 'D',
        'dec_impl': 'D',
        'reco': 'H',
    };

    const celexType = typeMap[docType] || 'X';
    const celex = `3${year}${celexType}${number.padStart(4, '0')}`;

    return {
        eli: eli.replace(/[)\]\\.,]+$/, ''),
        celex,
        year,
        number,
        docType,
    };
}

/**
 * Extract short name from full citation title.
 * "Commission Recommendation (EU) 2021/946 of 3 June 2021..." → "Recommendation 2021/946"
 */
function extractShortName(fullTitle) {
    // Try to match common patterns
    const patterns = [
        /(?:Commission\s+)?(?:Implementing\s+)?(\w+)\s+\((?:EU|EC)\)\s+(?:No\s+)?(\d+\/\d+)/i,
        /(\w+)\s+\((?:EU|EC)\)\s+(\d{4}\/\d+)/i,
        /(\w+)\s+(?:No\s+)?(\d+\/\d+)/i,
    ];

    for (const pattern of patterns) {
        const match = fullTitle.match(pattern);
        if (match) {
            return `${match[1]} ${match[2]}`;
        }
    }

    // Fallback: first 50 chars
    return fullTitle.substring(0, 50) + '...';
}

/**
 * Extract OJ reference from citation.
 * "(OJ L 210, 14.6.2021, p. 51, ELI: ...)" → "OJ L 210, 14.6.2021, p. 51"
 */
function extractOjRef(citationText) {
    const match = citationText.match(/\(OJ\s+([^,]+),\s*([^,]+),\s*p\.\s*(\d+)/);
    if (match) {
        return `OJ ${match[1]}, ${match[2]}, p. ${match[3]}`;
    }
    return null;
}

/**
 * Extract all citations from markdown content.
 * 
 * Pattern: [Full citation text (OJ ref, ELI: url).]
 */
function extractCitations(content, documentRegistry) {
    const citations = [];
    const seen = new Set();

    // Pattern to match citations with ELI
    // Markdown uses \[ and \] for escaped brackets
    // Pattern: \[Full text (OJ ref, ELI: url)\] or [Full text (OJ ref, ELI: url)]
    const citationPattern = /\\?\[([^\]]+?)\s*\(OJ\s+[^)]+,\s*ELI:\s*(http:\/\/data\.europa\.eu\/eli\/[^\s\])\\]+)[^\]]*\\?\]/g;

    let match;
    while ((match = citationPattern.exec(content)) !== null) {
        const fullText = match[0];
        const titlePart = match[1];
        const eliUrl = match[2];

        // Parse the ELI to get CELEX
        const eliInfo = parseEli(eliUrl);
        if (!eliInfo) continue;

        // Skip duplicates
        if (seen.has(eliInfo.celex)) continue;
        seen.add(eliInfo.celex);

        // Check if internal
        const internalDoc = documentRegistry[eliInfo.celex];
        const isInternal = !!internalDoc;

        // Build citation object
        const citation = {
            index: citations.length + 1,
            shortName: extractShortName(titlePart),
            fullTitle: titlePart.trim(),
            ojRef: extractOjRef(fullText),
            eli: eliInfo.eli,
            celex: eliInfo.celex,
            isInternal,
            url: isInternal
                ? internalDoc.route
                : `https://eur-lex.europa.eu/eli/${eliInfo.docType}/${eliInfo.year}/${eliInfo.number}/oj`,
            originalText: fullText,
        };

        citations.push(citation);
    }

    return citations;
}

/**
 * Transform markdown content by replacing inline citations with markers.
 * Returns { transformedContent, citations }
 */
function transformCitations(content, documentRegistry) {
    const citations = extractCitations(content, documentRegistry);
    let transformed = content;

    // Replace each citation with a marker
    for (const citation of citations) {
        // Escape special regex characters in the original text
        const escaped = citation.originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(escaped.replace(/\\\s+/g, '\\s+'), 'g');

        // Replace with short name + marker
        const replacement = `${citation.shortName}{{cite:${citation.index}}}`;
        transformed = transformed.replace(pattern, replacement);
    }

    return { transformedContent: transformed, citations };
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    console.log('='.repeat(60));
    console.log('📖 Citation Extraction');
    console.log('='.repeat(60));

    // Build document registry from existing JSON files
    const registry = buildDocumentRegistry();

    // Source markdown directories
    const sourceDirs = [
        path.join(__dirname, '..', '..', '01_regulation'),
        path.join(__dirname, '..', '..', '02_implementing_acts'),
    ];

    // Output directory
    const outputDir = path.join(__dirname, '..', 'public', 'data', 'citations');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    let totalCitations = 0;
    let internalCount = 0;
    let externalCount = 0;
    let docsWithCitations = 0;

    for (const sourceDir of sourceDirs) {
        if (!fs.existsSync(sourceDir)) continue;

        // Find all markdown files
        const folders = fs.readdirSync(sourceDir).filter(f => {
            const fullPath = path.join(sourceDir, f);
            return fs.statSync(fullPath).isDirectory();
        });

        for (const folder of folders) {
            const folderPath = path.join(sourceDir, folder);
            const mdFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.md') && !f.startsWith('README'));

            for (const mdFile of mdFiles) {
                const mdPath = path.join(folderPath, mdFile);
                const content = fs.readFileSync(mdPath, 'utf-8');

                // Extract citations
                const citations = extractCitations(content, registry);

                if (citations.length > 0) {
                    // Generate slug from folder name
                    // 2025_0846_Cross_Border_Identity → 2025-0846
                    // 910_2014_eIDAS_Consolidated → 910-2014
                    const slugMatch = folder.match(/^(\d{4})_(\d{4})|^(\d{3})_(\d{4})/);
                    let slug;
                    if (slugMatch) {
                        if (slugMatch[1] && slugMatch[2]) {
                            slug = `${slugMatch[1]}-${slugMatch[2]}`;
                        } else if (slugMatch[3] && slugMatch[4]) {
                            slug = `${slugMatch[3]}-${slugMatch[4]}`;
                        }
                    } else {
                        slug = folder.replace(/_/g, '-').toLowerCase();
                    }

                    // Save citations file
                    const citationFile = path.join(outputDir, `${slug}.json`);
                    fs.writeFileSync(citationFile, JSON.stringify({ citations }, null, 2));

                    const internal = citations.filter(c => c.isInternal).length;
                    const external = citations.length - internal;

                    console.log(`  ✅ ${slug}: ${citations.length} citations (${internal} internal, ${external} external)`);

                    totalCitations += citations.length;
                    internalCount += internal;
                    externalCount += external;
                    docsWithCitations++;
                }
            }
        }
    }

    console.log();
    console.log('='.repeat(60));
    console.log(`📊 Total: ${totalCitations} citations across ${docsWithCitations} documents`);
    console.log(`   Internal (portal links): ${internalCount}`);
    console.log(`   External (EUR-Lex): ${externalCount}`);
    console.log('='.repeat(60));
}

main().catch(console.error);
