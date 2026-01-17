/**
 * build-citations.js
 * 
 * Extracts legal citations from markdown content and generates structured data.
 * Part of DEC-009: Citation formatting with responsive behavior and internal linking.
 * Enhanced in DEC-059: Citation Popover Enhancement (Hybrid B+C design)
 * 
 * Run: node scripts/build-citations.js
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getLegislationMetadata, formatEntryIntoForce, getStatusDisplay } from './legislation-metadata.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Compute MD5 hash of content for cache validation.
 * @param {string} content - Content to hash
 * @returns {string} - MD5 hash hex string
 */
function computeHash(content) {
    return crypto.createHash('md5').update(content).digest('hex');
}

// =============================================================================
// DOCUMENT CONFIGURATION (for consolidation metadata)
// =============================================================================

/**
 * Load document configuration from document-config.json.
 * Contains consolidation metadata for self-reference detection.
 */
function loadDocumentConfig() {
    const configPath = path.join(__dirname, 'document-config.json');
    if (!fs.existsSync(configPath)) {
        console.warn('⚠️  document-config.json not found');
        return { documents: {} };
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * Extract base CELEX from a consolidated CELEX.
 * E.g., "02014R0910-20241018" → "32014R0910"
 *       "32014R0910" → "32014R0910" (already base)
 * 
 * Consolidated CELEX format: 0YYYYRNNN-YYYYMMDD (starts with 0)
 * Base CELEX format: 3YYYYRNNN (starts with 3 for regulations)
 */
function extractBaseCelex(celex) {
    if (!celex) return null;
    // If starts with 0, it's a consolidated version
    if (celex.startsWith('0')) {
        // 02014R0910-20241018 → 32014R0910
        const match = celex.match(/^0(\d{4}[A-Z]\d{4})/);
        if (match) {
            return '3' + match[1];
        }
    }
    return celex;
}

/**
 * Check if a citation CELEX matches the current document's base CELEX.
 * This detects self-references in consolidated documents.
 * 
 * @param {string} citationCelex - CELEX of the citation (e.g., "32014R0910")
 * @param {string} currentSlug - Current document slug (e.g., "910-2014")
 * @param {Object} documentConfig - Document configuration object
 * @returns {{ isSelfReference: boolean, consolidationInfo: Object|null }}
 */
function checkSelfReference(citationCelex, currentSlug, documentConfig) {
    if (!currentSlug || !documentConfig?.documents?.[currentSlug]) {
        return { isSelfReference: false, consolidationInfo: null };
    }

    const docInfo = documentConfig.documents[currentSlug];
    const consolidation = docInfo.consolidation;

    if (!consolidation) {
        return { isSelfReference: false, consolidationInfo: null };
    }

    // Check if citation matches the base CELEX of this consolidated document
    if (citationCelex === consolidation.baseCelex) {
        return {
            isSelfReference: true,
            consolidationInfo: {
                isConsolidated: true,
                baseCelex: consolidation.baseCelex,
                originalEurlexUrl: consolidation.originalEurlexUrl,
                amendments: consolidation.amendments || [],
            }
        };
    }

    return { isSelfReference: false, consolidationInfo: null };
}

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
 * Enrich a citation with metadata from the legislation registry.
 * Part of DEC-059: Citation Popover Enhancement
 * 
 * Adds: humanName, abbreviation, entryIntoForce, status, statusDisplay
 */
function enrichCitation(citation) {
    const metadata = getLegislationMetadata(citation.celex);

    if (metadata) {
        citation.humanName = metadata.humanName;
        citation.abbreviation = metadata.abbreviation;
        citation.entryIntoForce = metadata.entryIntoForce;
        citation.entryIntoForceDisplay = formatEntryIntoForce(metadata.entryIntoForce);
        citation.status = metadata.status;
        citation.statusDisplay = getStatusDisplay(metadata.status);
        citation.category = metadata.category;
    } else {
        // Fallback: use shortName as humanName, no abbreviation
        citation.humanName = citation.humanName || null;
        citation.abbreviation = null;
        citation.entryIntoForce = null;
        citation.entryIntoForceDisplay = null;
        citation.status = 'unknown';
        citation.statusDisplay = { label: 'Unknown', color: 'gray' };
        citation.category = null;
    }

    return citation;
}

// =============================================================================
// INFORMAL LEGISLATION PATTERN DETECTION
// =============================================================================

/**
 * Normalize 2-digit years to 4-digit.
 * 93 → 1993, 08 → 2008
 */
function normalizeYear(year) {
    if (year.length === 4) return year;
    const num = parseInt(year, 10);
    // Threshold: < 50 means 2000s, >= 50 means 1900s
    return num < 50 ? `20${year.padStart(2, '0')}` : `19${year}`;
}

/**
 * Extract informal legislation references (without ELI URLs).
 * Patterns detected:
 * - Directive YYYY/NN/EC, Directive YYYY/NN/EU, Directive YYYY/NN/EEC
 * - Regulation (EU|EC|EEC) No NNN/YYYY
 * - Regulation (EU|EC|EEC) YYYY/NNN
 * - Decision No NNN/YYYY/EC
 * - Council Regulation (EEC) No NNN/YY
 * 
 * DEC-060: Added currentSlug and documentConfig for self-reference detection.
 */
function extractInformalCitations(content, documentRegistry, existingCelex, currentSlug = null, documentConfig = null) {
    const citations = [];
    const seen = new Set(existingCelex); // Skip already-found citations

    // Pattern groups for different EU legislation formats
    const patterns = [
        // Directive YYYY/NN/EC (or EU, EEC)
        {
            regex: /Directive\s+(\d{2,4})\/(\d+)\/(EU|EC|EEC)/gi,
            type: 'L', // Directive
            extract: (m) => ({ year: m[1], number: m[2], jurisdiction: m[3] })
        },
        // Regulation (EU) YYYY/NNN format (newer style, 2014+) — CHECK FIRST
        // Year comes first (4 digits starting with 20), then number
        {
            regex: /Regulation\s+\(EU\)\s+(20\d{2})\/(\d+)/gi,
            type: 'R',
            extract: (m) => ({ year: m[1], number: m[2] })
        },
        // Regulation (EU|EC|EEC) No NNN/YYYY (older style with "No")
        // Number comes first, then year
        {
            regex: /Regulation\s+\((?:EU|EC|EEC)(?:,\s*Euratom)?\)\s+No\s+(\d+)\/(\d{2,4})/gi,
            type: 'R',
            extract: (m) => ({ number: m[1], year: m[2] })
        },
        // Regulation (EU|EC|EEC) NNN/YY (older style without "No", 2-digit year)
        // Number comes first, then 2-digit year
        {
            regex: /Regulation\s+\((?:EU|EC|EEC)(?:,\s*Euratom)?\)\s+(\d{1,4})\/(\d{2})(?!\d)/gi,
            type: 'R',
            extract: (m) => ({ number: m[1], year: m[2] })
        },
        // Council Regulation (EEC) No NNN/YY
        {
            regex: /Council\s+Regulation\s+\((?:EU|EC|EEC)\)\s+No\s+(\d+)\/(\d{2,4})/gi,
            type: 'R',
            extract: (m) => ({ number: m[1], year: m[2] })
        },
        // Decision No NNN/YYYY/EC or Decision (EU) YYYY/NNN
        {
            regex: /Decision\s+(?:No\s+)?(\d+)\/(\d{2,4})(?:\/(?:EU|EC|EEC))?/gi,
            type: 'D',
            extract: (m) => ({ number: m[1], year: m[2] })
        },
    ];

    for (const pattern of patterns) {
        let match;
        // Reset regex lastIndex
        pattern.regex.lastIndex = 0;

        while ((match = pattern.regex.exec(content)) !== null) {
            const extracted = pattern.extract(match);
            const year = normalizeYear(extracted.year);
            const number = extracted.number.padStart(4, '0');
            const celex = `3${year}${pattern.type}${number}`;

            // Skip if already seen
            if (seen.has(celex)) continue;
            seen.add(celex);

            // Check if internal document
            const internalDoc = documentRegistry[celex];
            const isInternal = !!internalDoc;

            // DEC-060: Check for self-reference
            const { isSelfReference, consolidationInfo } = checkSelfReference(
                celex, currentSlug, documentConfig
            );

            // Build citation
            const citation = enrichCitation({
                index: citations.length + 1,
                shortName: match[0].trim(),
                fullTitle: match[0].trim(),
                celex,
                isInternal,
                isSelfReference,
                consolidationInfo,
                url: isInternal
                    ? internalDoc.route
                    : `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${celex}`,
                originalText: match[0],
            });

            citations.push(citation);
        }
    }

    return citations;
}

/**
 * Extract all citations from markdown content.
 * 
 * Handles two patterns:
 * 1. Formal: [Full citation text (OJ ref, ELI: url).]
 * 2. Informal: Directive YYYY/NN/EC, Regulation (EU) No NNN/YYYY, etc.
 * 
 * DEC-060: Self-reference detection for consolidated documents.
 * @param {string} content - Markdown content
 * @param {Object} documentRegistry - Registry of internal documents
 * @param {string} currentSlug - Slug of the document being processed (e.g., "910-2014")
 * @param {Object} documentConfig - Document configuration with consolidation metadata
 */
function extractCitations(content, documentRegistry, currentSlug = null, documentConfig = null) {
    const citations = [];
    const seen = new Set();

    // ==========================================================================
    // PATTERN 1: Formal citations with ELI URLs
    // ==========================================================================

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

        // DEC-060: Check for self-reference
        const { isSelfReference, consolidationInfo } = checkSelfReference(
            eliInfo.celex, currentSlug, documentConfig
        );

        // Build citation object
        const citation = enrichCitation({
            index: citations.length + 1,
            shortName: extractShortName(titlePart),
            fullTitle: titlePart.trim(),
            ojRef: extractOjRef(fullText),
            eli: eliInfo.eli,
            celex: eliInfo.celex,
            isInternal,
            isSelfReference,
            consolidationInfo,
            url: isInternal
                ? internalDoc.route
                : `https://eur-lex.europa.eu/eli/${eliInfo.docType}/${eliInfo.year}/${eliInfo.number}/oj`,
            originalText: fullText,
        });

        citations.push(citation);
    }

    // ==========================================================================
    // PATTERN 2: Informal legislation references (no ELI)
    // ==========================================================================

    const informalCitations = extractInformalCitations(content, documentRegistry, seen, currentSlug, documentConfig);

    // Merge and re-index
    for (const informal of informalCitations) {
        informal.index = citations.length + 1;
        citations.push(informal);
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

    // DEC-060: Load document configuration for consolidation metadata
    const documentConfig = loadDocumentConfig();

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
    let skippedCount = 0;  // Hash-based cache hits

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

                // Generate slug from folder name FIRST (needed for self-reference detection)
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

                // Extract citations (DEC-060: pass slug and config for self-reference detection)
                const citations = extractCitations(content, registry, slug, documentConfig);

                if (citations.length > 0) {
                    // Compute hash for cache validation (content + config version)
                    const cacheKey = computeHash(content + JSON.stringify(documentConfig.documents[slug] || {}));
                    const citationFile = path.join(outputDir, `${slug}.json`);

                    // Check if output already exists and matches
                    let skipWrite = false;
                    if (fs.existsSync(citationFile)) {
                        try {
                            const existingData = JSON.parse(fs.readFileSync(citationFile, 'utf-8'));
                            if (existingData._cacheKey === cacheKey) {
                                skipWrite = true;
                                // Still count for stats
                                const internal = citations.filter(c => c.isInternal).length;
                                const external = citations.length - internal;
                                totalCitations += citations.length;
                                internalCount += internal;
                                externalCount += external;
                                docsWithCitations++;
                                skippedCount++;
                            }
                        } catch (e) {
                            // Invalid JSON, regenerate
                        }
                    }

                    if (!skipWrite) {
                        // Save citations file with cache key
                        fs.writeFileSync(citationFile, JSON.stringify({
                            _cacheKey: cacheKey,
                            citations
                        }, null, 2));

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
    }

    console.log();
    console.log('='.repeat(60));
    console.log(`📊 Total: ${totalCitations} citations across ${docsWithCitations} documents`);
    console.log(`   Internal (portal links): ${internalCount}`);
    console.log(`   External (EUR-Lex): ${externalCount}`);
    if (skippedCount > 0) {
        console.log(`   ⚡ Cache hits (unchanged): ${skippedCount}`);
    }
    console.log('='.repeat(60));
}

main().catch(console.error);
