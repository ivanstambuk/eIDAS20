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
import {
    parseProvisionReference,
    findProvisionDocumentAssociations,
    generateDeepLinkUrl,
    containsProvisionReference,
} from './provision-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================================
// ROUTE PATH CONSTANTS
// =============================================================================
// ⚠️ IMPORTANT: These must match the router paths in App.jsx
// Using singular form: /regulation/ not /regulations/

const ROUTES = {
    REGULATION: '#/regulation',
    IMPLEMENTING_ACT: '#/implementing-acts',
};

// =============================================================================
// CACHE VERSION
// =============================================================================
// ⚠️ INCREMENT THIS when changing script logic that affects output format.
// The hash-based cache only detects content changes, not script changes.
// Bumping this version forces a full rebuild.
const CACHE_VERSION = '1.0.1';  // Bumped: fixed plural→singular route path

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
 * 
 * DEC-064: Also maps base CELEX for consolidated documents to enable
 * provision deep linking. E.g., 32014R0910 → 910-2014 route.
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

        const route = type === 'regulation'
            ? `${ROUTES.REGULATION}/${slug}`
            : `${ROUTES.IMPLEMENTING_ACT}/${slug}`;

        if (celex) {
            registry[celex] = { slug, type, route };

            // DEC-064: Also register base CELEX for consolidated documents
            // This enables provision deep links to work for references like
            // "Article 5 of Regulation 910/2014" which use base CELEX 32014R0910
            const baseCelex = extractBaseCelex(celex);
            if (baseCelex && baseCelex !== celex) {
                registry[baseCelex] = { slug, type, route };
            }
        }
    }

    console.log(`📚 Document registry: ${Object.keys(registry).length} documents`);
    return registry;
}

/**
 * Build an index of all anchor IDs present in document HTML.
 * Used for validating provision deep links at build time.
 * 
 * DEC-064: Build-time validation to catch broken provision links.
 * 
 * @returns {Map<string, Set<string>>} Map of slug → Set of anchor IDs
 */
function buildAnchorIndex() {
    const anchorIndex = new Map();
    const dataDir = path.join(__dirname, '..', 'public', 'data', 'regulations');

    if (!fs.existsSync(dataDir)) {
        return anchorIndex;
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
        const slug = content.slug;
        const html = content.contentHtml || '';

        // Extract all id="..." attributes from HTML
        const idPattern = /id="([^"]+)"/g;
        const anchors = new Set();
        let match;
        while ((match = idPattern.exec(html)) !== null) {
            anchors.add(match[1]);
        }

        anchorIndex.set(slug, anchors);
    }

    return anchorIndex;
}

/**
 * Validate provision citations against the anchor index.
 * Reports warnings for broken links but does not fail the build.
 * 
 * DEC-064: Build-time validation to catch broken provision links.
 * 
 * @param {Object[]} citations - Array of citation objects
 * @param {Map<string, Set<string>>} anchorIndex - Map of slug → Set of anchor IDs
 * @param {string} sourceSlug - Slug of the document being processed
 * @returns {{ valid: number, broken: Array<{ anchor: string, targetSlug: string, reference: string }> }}
 */
function validateProvisionLinks(citations, anchorIndex, sourceSlug) {
    const results = { valid: 0, broken: [] };

    for (const citation of citations) {
        // Only validate internal provision citations
        if (!citation.provision || !citation.isInternal) continue;

        const anchor = citation.provision.anchor;
        const url = citation.url || '';

        // Extract target slug from URL using ROUTES patterns
        // Example: #/regulation/910-2014?section=article-5
        const routePattern = new RegExp(`(?:${ROUTES.REGULATION}|${ROUTES.IMPLEMENTING_ACT})/([^?]+)`.replace('#', '#'));
        const slugMatch = url.match(routePattern);
        if (!slugMatch) continue;

        const targetSlug = slugMatch[1];
        const targetAnchors = anchorIndex.get(targetSlug);

        if (!targetAnchors) {
            // Target document not found in anchor index
            results.broken.push({
                anchor,
                targetSlug,
                reference: citation.provision.fullReference || citation.originalText,
                reason: 'Document not found',
            });
            continue;
        }

        if (targetAnchors.has(anchor)) {
            results.valid++;
        } else {
            results.broken.push({
                anchor,
                targetSlug,
                reference: citation.provision.fullReference || citation.originalText,
                reason: 'Anchor not found',
            });
        }
    }

    return results;
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
 * Part of DEC-062: Amendment-Aware Citation Popovers
 * 
 * Adds: humanName, abbreviation, entryIntoForce, status, statusDisplay
 * DEC-062: amendedBy, amendmentDate, consolidatedSlug, isAmended
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
        citation.subcategory = metadata.subcategory || null;  // DEC-064: e.g., 'implementing' for implementing regulations

        // DEC-062: Amendment-aware fields
        citation.amendedBy = metadata.amendedBy || null;
        citation.amendmentDate = metadata.amendmentDate || null;
        citation.consolidatedSlug = metadata.consolidatedSlug || null;
        citation.isAmended = !!(metadata.amendedBy?.length);

        // DEC-064: Provision info added during extraction, not enrichment
        if (!citation.provision) {
            citation.provision = null;
        }
    } else {
        // Fallback: use shortName as humanName, no abbreviation
        citation.humanName = citation.humanName || null;
        citation.abbreviation = null;
        citation.entryIntoForce = null;
        citation.entryIntoForceDisplay = null;
        citation.status = 'unknown';
        citation.statusDisplay = { label: 'Unknown', color: 'gray' };
        citation.category = null;
        citation.subcategory = null;

        // DEC-062: No amendment data for unknown citations
        citation.amendedBy = null;
        citation.amendmentDate = null;
        citation.consolidatedSlug = null;
        citation.isAmended = false;

        // DEC-064: No provision info by default
        citation.provision = null;
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

// =============================================================================
// DEC-064: PROVISION CITATION EXTRACTION
// =============================================================================

/**
 * Extract provision citations and enrich existing citations with provision data.
 * 
 * Scans content for patterns like:
 * - "Article 5(1) of Regulation (EU) No 910/2014"
 * - "recital 75 of Regulation (EU) 2024/1183"
 * - "Annex I to Regulation ..."
 * 
 * Creates new citation entries with provision data for deep linking.
 * 
 * @param {string} content - Markdown content to scan
 * @param {Object[]} existingCitations - Array of extracted citations
 * @param {Object} documentRegistry - Registry mapping CELEX to portal routes
 */
function extractProvisionCitations(content, existingCitations, documentRegistry) {
    // Build a CELEX-to-citation lookup for fast matching
    const celexToCitation = new Map();
    for (const citation of existingCitations) {
        if (citation.celex) {
            celexToCitation.set(citation.celex, citation);
        }
    }

    // Pattern for "Article X of [Document]" style references
    // Captures: Article/Recital/Annex + number + "of" + Document type + legal ID
    const provisionOfDocPattern = new RegExp(
        '(' +
        // Article patterns
        'Article\\s+\\d+[a-z]?(?:\\(\\d+\\))?(?:\\([a-z]\\))?(?:,?\\s*(?:point|points)\\s*\\(?[a-z]\\)?)?' +
        '|' +
        // Recital patterns
        '[Rr]ecital\\s*\\(?\\d+\\)?' +
        '|' +
        // Annex patterns
        'Annex\\s+[IVX]+' +
        ')' +
        '\\s+(?:of|to)\\s+' +
        '(?:Regulation|Directive|Decision)\\s+\\([A-Z,\\s]+\\)\\s*(?:No\\s*)?(\\d+)\\/(\\d{2,4})',
        'gi'
    );

    let match;
    const provisionCitations = [];
    const seen = new Map(); // Track unique provision+document combinations

    while ((match = provisionOfDocPattern.exec(content)) !== null) {
        const [fullMatch, provisionText, num1, num2] = match;

        // Parse provision
        const provision = parseProvisionReference(provisionText);
        if (!provision) continue;

        // Determine year and number based on format
        // Newer style (2014+): YYYY/NNN where year first
        // Older style: NNN/YYYY where number first
        let year, number;
        if (num1.length === 4 && parseInt(num1) >= 1990) {
            // Newer style: 2024/1183 → year=2024, number=1183
            year = num1;
            number = num2;
        } else if (num2.length === 4 || parseInt(num2) >= 1990) {
            // Older style: 910/2014 → number=910, year=2014
            number = num1;
            year = num2;
        } else {
            // 2-digit year
            number = num1;
            year = parseInt(num2) < 50 ? `20${num2.padStart(2, '0')}` : `19${num2}`;
        }

        // Determine CELEX type from match
        let celexType = 'R'; // Default to Regulation
        if (/directive/i.test(fullMatch)) {
            celexType = 'L';
        } else if (/decision/i.test(fullMatch)) {
            celexType = 'D';
        }

        const celex = `3${year}${celexType}${number.padStart(4, '0')}`;

        // Generate unique key for deduplication
        const uniqueKey = `${celex}:${provision.anchor}`;
        if (seen.has(uniqueKey)) continue;
        seen.set(uniqueKey, true);

        // Find the base citation for this document
        const baseCitation = celexToCitation.get(celex);
        const internalDoc = documentRegistry[celex];
        const isInternal = !!internalDoc;

        // DEC-063: Fallback to metadata registry if baseCitation is null
        // This handles provision citations for documents that weren't extracted
        // via the formal/informal patterns but ARE in our metadata registry.
        const metadata = baseCitation ? null : getLegislationMetadata(celex);

        // Build the provision citation
        const provisionCitation = {
            index: existingCitations.length + provisionCitations.length + 1,
            shortName: baseCitation?.shortName || `${celexType === 'R' ? 'Regulation' : celexType === 'L' ? 'Directive' : 'Decision'} ${number}/${year}`,
            fullTitle: baseCitation?.fullTitle || null,
            celex,
            isInternal,
            isSelfReference: baseCitation?.isSelfReference || false,
            consolidationInfo: baseCitation?.consolidationInfo || null,
            url: isInternal
                ? generateDeepLinkUrl(internalDoc.route, provision.anchor)
                : baseCitation?.url || `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${celex}`,
            originalText: fullMatch,
            // DEC-064: Provision data
            provision: {
                type: provision.type,
                display: provision.display,
                anchor: provision.anchor,
                fullReference: fullMatch.trim(),
            },
            // Inherit metadata from base citation, or fallback to registry lookup
            humanName: baseCitation?.humanName || metadata?.humanName || null,
            abbreviation: baseCitation?.abbreviation || metadata?.abbreviation || null,
            entryIntoForce: baseCitation?.entryIntoForce || metadata?.entryIntoForce || null,
            entryIntoForceDisplay: baseCitation?.entryIntoForceDisplay || (metadata?.entryIntoForce ? formatEntryIntoForce(metadata.entryIntoForce) : null),
            status: baseCitation?.status || metadata?.status || 'unknown',
            statusDisplay: baseCitation?.statusDisplay || getStatusDisplay(metadata?.status),
            category: baseCitation?.category || metadata?.category || null,
            amendedBy: baseCitation?.amendedBy || metadata?.amendedBy || null,
            amendmentDate: baseCitation?.amendmentDate || metadata?.amendmentDate || null,
            consolidatedSlug: baseCitation?.consolidatedSlug || metadata?.consolidatedSlug || null,
            isAmended: baseCitation?.isAmended || !!(metadata?.amendedBy?.length),
        };

        provisionCitations.push(provisionCitation);
    }

    // Add provision citations to the main array
    for (const provCitation of provisionCitations) {
        existingCitations.push(provCitation);
    }

    if (provisionCitations.length > 0) {
        console.log(`    📍 Found ${provisionCitations.length} provision citations`);
    }
}

/**
 * Extract all citations from markdown content.
 * 
 * Handles two patterns:
 * 1. Formal: [Full citation text (OJ ref, ELI: url).]
 * 2. Informal: Directive YYYY/NN/EC, Regulation (EU) No NNN/YYYY, etc.
 * 
 * DEC-060: Self-reference detection for consolidated documents.
 * DEC-064: Provision citation extraction for deep linking.
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

    // ==========================================================================
    // DEC-064: PROVISION CITATION EXTRACTION
    // Extract provision references (Article X, Recital Y, Annex Z) and associate
    // with document citations. Enriches citations with deep link anchors.
    // ==========================================================================

    extractProvisionCitations(content, citations, documentRegistry);

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

    // DEC-064: Build anchor index for provision link validation
    const anchorIndex = buildAnchorIndex();
    console.log(`🔗 Anchor index: ${anchorIndex.size} documents indexed`);

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

    // DEC-064: Track provision link validation results
    let totalValidLinks = 0;
    const allBrokenLinks = [];

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
                    // DEC-064: Validate provision links
                    const validation = validateProvisionLinks(citations, anchorIndex, slug);
                    totalValidLinks += validation.valid;
                    if (validation.broken.length > 0) {
                        for (const broken of validation.broken) {
                            allBrokenLinks.push({ sourceSlug: slug, ...broken });
                        }
                    }

                    // Compute hash for cache validation (content + config + script version)
                    // ⚠️ CACHE_VERSION must be bumped when script logic changes
                    const cacheKey = computeHash(
                        CACHE_VERSION + content + JSON.stringify(documentConfig.documents[slug] || {})
                    );
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

    // DEC-064: Report provision link validation results
    console.log();
    console.log('🔗 Provision Link Validation:');
    console.log(`   ✅ Valid links: ${totalValidLinks}`);
    if (allBrokenLinks.length > 0) {
        console.log(`   ❌ Broken links: ${allBrokenLinks.length}`);
        console.log();
        console.log('   Broken link details:');
        for (const broken of allBrokenLinks.slice(0, 10)) {
            console.log(`     - [${broken.sourceSlug}] "${broken.reference}" → ${broken.targetSlug}#${broken.anchor} (${broken.reason})`);
        }
        if (allBrokenLinks.length > 10) {
            console.log(`     ... and ${allBrokenLinks.length - 10} more`);
        }
        console.log();
        console.log('='.repeat(60));
        console.error('❌ BUILD FAILED: Broken provision links detected. Fix the source data or parser logic.');
        process.exit(1);
    } else {
        console.log(`   ✅ Broken links: 0`);
    }

    console.log('='.repeat(60));
}

main().catch(console.error);
