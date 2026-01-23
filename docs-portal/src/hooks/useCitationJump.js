/**
 * Citation Jump Hook
 * 
 * Detects EU legal citations in search queries (Article X(Y)(z)) and provides
 * direct navigation to specific articles, paragraphs, points, and subpoints.
 * 
 * Supports standard EU citation formats:
 * - "Article 5" → Jump to Article 5
 * - "Article 5(1)" → Jump to Article 5, paragraph 1
 * - "Article 5(1)(a)" → Jump to Article 5, paragraph 1, point a
 * - "Article 5(1)(a)(i)" → Jump to Article 5, paragraph 1, point a, subpoint i
 * - "Art. 5(1)" → Short form
 * - "art 5 1 a" → Flexible spacing
 * - "2014-910 Article 5" → Document-specific citation
 * - "eIDAS Article 5" → Document alias + citation
 */

import { useState, useEffect, useMemo } from 'react';

// Document aliases for common references
const DOCUMENT_ALIASES = {
    // Primary regulation
    'eidas': '2014-910',
    'eidas2': '2014-910',
    'eidas 2': '2014-910',
    'eidas 2.0': '2014-910',
    '910/2014': '2014-910',
    '2024/1183': '2014-910', // Amendment CELEX

    // EUDIW / Wallet
    'eudiw': '2014-910',
    'wallet': '2014-910',

    // PID & EAA Attestations
    'pid': '2024-2977',
    'eaa': '2024-2977',
    'pid & eaa': '2024-2977',
    'pid and eaa': '2024-2977',
    'attestation': '2024-2977',
    'attestations': '2024-2977',
    '2024/2977': '2024-2977',

    // Wallet certification
    'certification': '2024-2979',
    'wallet certification': '2024-2979',
    '2024/2979': '2024-2979',

    // Trust framework
    'trust framework': '2024-2980',
    '2024/2980': '2024-2980',

    // RP Registration
    'rp': '2024-2978',
    'relying party': '2024-2978',
    'rp registration': '2024-2978',
    '2024/2978': '2024-2978',

    // Interoperability
    'interoperability': '2015-1501',
    '2015/1501': '2015-1501',

    // DORA
    'dora': '2022-2554',
    '2022/2554': '2022-2554',

    // NIS2
    'nis2': '2022-2555',
    'nis 2': '2022-2555',
    '2022/2555': '2022-2555',

    // Cybersecurity Act
    'cybersecurity': '2019-881',
    'csa': '2019-881',
    '2019/881': '2019-881',
};

// Singleton for regulations index (shared with useQuickJump)
let regulationsIndex = null;
let loadingPromise = null;

/**
 * Load the regulations index
 */
async function loadRegulationsIndex() {
    if (regulationsIndex) return regulationsIndex;
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
        try {
            const response = await fetch(`${import.meta.env.BASE_URL}data/regulations-index.json`);
            if (!response.ok) {
                throw new Error(`Failed to load regulations index: ${response.status}`);
            }
            regulationsIndex = await response.json();
            return regulationsIndex;
        } catch (error) {
            console.error('Failed to load regulations index:', error);
            loadingPromise = null;
            throw error;
        }
    })();

    return loadingPromise;
}

/**
 * Parse a citation query into structured components
 * 
 * Examples:
 * - "Article 5" → { article: "5" }
 * - "Article 5(1)" → { article: "5", paragraph: "1" }
 * - "Article 5a(1)(b)" → { article: "5a", paragraph: "1", point: "b" }
 * - "Article 19a(1)(a)(ii)" → { article: "19a", paragraph: "1", point: "a", subpoint: "ii" }
 * - "eIDAS Article 5(1)" → { document: "eidas", article: "5", paragraph: "1" }
 * - "2014-910 Article 5" → { document: "2014-910", article: "5" }
 */
function parseCitation(query) {
    const normalized = query.trim().toLowerCase();

    // Try to extract document reference first
    let documentSlug = null;
    let citationPart = normalized;

    // Check for document aliases at the start
    // Sort aliases by length (longest first) to ensure compound aliases match before substrings
    const sortedAliases = Object.entries(DOCUMENT_ALIASES).sort((a, b) => b[0].length - a[0].length);

    for (const [alias, slug] of sortedAliases) {
        // Escape special regex characters in alias
        const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Match alias followed by comma, space, or article keyword
        const aliasPattern = new RegExp(`^${escapedAlias}[,\\s]+`, 'i');
        if (aliasPattern.test(normalized)) {
            documentSlug = slug;
            citationPart = normalized.replace(aliasPattern, '').trim();
            break;
        }
        // Also match "alias, Article X" format
        const aliasWithComma = new RegExp(`^${escapedAlias},\\s*`, 'i');
        if (aliasWithComma.test(normalized)) {
            documentSlug = slug;
            citationPart = normalized.replace(aliasWithComma, '').trim();
            break;
        }
    }

    // Check for slug format at start (YYYY-NNNN)
    const slugMatch = normalized.match(/^(\d{4}-\d{3,4})[,\s]+/);
    if (slugMatch) {
        documentSlug = slugMatch[1];
        citationPart = normalized.slice(slugMatch[0].length).trim();
    }

    // Now parse the article citation
    // Patterns to match (case-insensitive):
    // "article 5", "art. 5", "art 5"
    // "article 5(1)", "art. 5(1)"
    // "article 5(1)(a)", "art 5 1 a"
    // "article 5(1)(a)(i)"

    // Standard format: Article X(Y)(z)(roman)
    const standardPattern = /^(?:article|art\.?)\s*(\d+[a-z]?)(?:\s*\(\s*(\d+[a-z]?)\s*\))?(?:\s*\(\s*([a-z])\s*\))?(?:\s*\(\s*([ivxlcdm]+)\s*\))?$/i;
    const standardMatch = citationPart.match(standardPattern);

    if (standardMatch) {
        const [, article, paragraph, point, subpoint] = standardMatch;
        return {
            document: documentSlug,
            article: article.toLowerCase(),
            paragraph: paragraph || null,
            point: point ? point.toLowerCase() : null,
            subpoint: subpoint ? subpoint.toLowerCase() : null,
        };
    }

    // Flexible format: "article 5 1 a" or "art 5 1 a i"
    const flexiblePattern = /^(?:article|art\.?)\s*(\d+[a-z]?)(?:\s+(\d+[a-z]?))?(?:\s+([a-z]))?(?:\s+([ivxlcdm]+))?$/i;
    const flexibleMatch = citationPart.match(flexiblePattern);

    if (flexibleMatch) {
        const [, article, paragraph, point, subpoint] = flexibleMatch;
        return {
            document: documentSlug,
            article: article.toLowerCase(),
            paragraph: paragraph || null,
            point: point ? point.toLowerCase() : null,
            subpoint: subpoint ? subpoint.toLowerCase() : null,
        };
    }

    return null;
}

/**
 * Convert parsed citation to a URL hash anchor
 * 
 * Examples:
 * - { article: "5" } → "article-5"
 * - { article: "5", paragraph: "1" } → "article-5-para-1"
 * - { article: "5a", paragraph: "1", point: "b" } → "article-5a-para-1-point-b"
 */
function citationToHash(citation) {
    let hash = `article-${citation.article}`;

    if (citation.paragraph) {
        hash += `-para-${citation.paragraph}`;
    }

    if (citation.point) {
        hash += `-point-${citation.point}`;
    }

    if (citation.subpoint) {
        hash += `-subpoint-${citation.subpoint}`;
    }

    return hash;
}

/**
 * Format citation for display
 * 
 * Examples:
 * - { article: "5" } → "Article 5"
 * - { article: "5a", paragraph: "1", point: "b" } → "Article 5a(1)(b)"
 */
function formatCitation(citation) {
    let formatted = `Article ${citation.article}`;

    if (citation.paragraph) {
        formatted += `(${citation.paragraph})`;
    }

    if (citation.point) {
        formatted += `(${citation.point})`;
    }

    if (citation.subpoint) {
        formatted += `(${citation.subpoint})`;
    }

    return formatted;
}

/**
 * Hook for citation-based quick navigation
 */
export function useCitationJump(query) {
    const [index, setIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load index on mount
    useEffect(() => {
        loadRegulationsIndex()
            .then(setIndex)
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);

    // Parse query and find matching documents
    const result = useMemo(() => {
        if (!query || query.trim().length < 4) {
            return { citation: null, matches: [] };
        }

        const citation = parseCitation(query);
        if (!citation) {
            return { citation: null, matches: [] };
        }

        const hash = citationToHash(citation);
        const formattedCitation = formatCitation(citation);

        // If document is specified, only return that document
        if (citation.document && index) {
            const doc = index.find(d => d.slug === citation.document);
            if (doc) {
                return {
                    citation: formattedCitation,
                    hash,
                    matches: [{
                        ...doc,
                        targetHash: hash,
                        displayCitation: formattedCitation,
                    }]
                };
            }
        }

        // Otherwise, return top 3 likely documents (primary regulations first)
        if (index) {
            // Prioritize primary eIDAS regulation and common implementing acts
            const priorityOrder = [
                '2014-910',     // eIDAS 2.0 (primary)
                '2024-2977',    // PID & EAA Attestations
                '2024-2979',    // Wallet Certification
                '2024-2978',    // RP Registration
                '2024-2980',    // Trust Framework
                '2015-1501',    // Interoperability
            ];

            const sortedDocs = [...index].sort((a, b) => {
                const aIndex = priorityOrder.indexOf(a.slug);
                const bIndex = priorityOrder.indexOf(b.slug);
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                return 0;
            });

            const matches = sortedDocs.slice(0, 3).map(doc => ({
                ...doc,
                targetHash: hash,
                displayCitation: formattedCitation,
            }));

            return {
                citation: formattedCitation,
                hash,
                matches
            };
        }

        return { citation: formattedCitation, hash, matches: [] };
    }, [query, index]);

    return {
        isLoading,
        citation: result.citation,
        hash: result.hash,
        matches: result.matches,
        hasCitation: result.citation !== null && result.matches.length > 0
    };
}

export default useCitationJump;
