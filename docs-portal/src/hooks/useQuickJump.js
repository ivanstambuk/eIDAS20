/**
 * Quick Jump Hook
 * 
 * Detects document identifiers in search queries (CELEX numbers, slugs)
 * and provides direct navigation to matching documents.
 * 
 * Supports:
 * - CELEX numbers (e.g., "32015R1501", "02014R0910-20241018")
 * - Document slugs (e.g., "2015-1501", "910-2014")
 * - EU legal citation format (e.g., "910/2014", "1501/2015")
 * - ELI URIs (e.g., "eli/reg/2014/910", "http://data.europa.eu/eli/reg_impl/2015/1501/oj")
 * - Partial CELEX (e.g., "1501", "2977")
 */

import { useState, useEffect, useMemo } from 'react';

// Singleton for the regulations index
let regulationsIndex = null;
let loadingPromise = null;

/**
 * Load the regulations index for quick jump lookups
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
            console.log('🚀 Quick jump index loaded');
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
 * Normalize a query string for matching
 * - Remove spaces, dashes, underscores
 * - Lowercase
 */
function normalizeForMatch(str) {
    return str.toLowerCase().replace(/[\s\-_]/g, '');
}

/**
 * Check if a query looks like a document reference
 */
function looksLikeDocRef(query) {
    const trimmed = query.trim();

    // CELEX format: NYYYYXNNNN (e.g., 32015R1501, 32024R2977)
    if (/^\d{5}[A-Z]\d{4}$/i.test(trimmed)) return true;

    // Consolidated CELEX: NYYYYXNNNN-YYYYMMDD (e.g., 02014R0910-20241018)
    if (/^\d{5}[A-Z]\d{4}-\d{8}$/i.test(trimmed)) return true;

    // Slug format: YYYY-NNNN (e.g., 2015-1501, 910-2014)
    if (/^\d{3,4}-\d{3,4}$/i.test(trimmed)) return true;

    // EU legal citation format: NNN/YYYY or NNNN/YYYY (e.g., 910/2014, 1501/2015)
    if (/^\d{3,4}\/\d{4}$/i.test(trimmed)) return true;

    // Just the number part: 4 digits (e.g., 1501, 2977)
    if (/^\d{4}$/.test(trimmed)) return true;

    // Year/number combo without dash: YYYYNNNN (e.g., 20152977)
    if (/^\d{8}$/.test(trimmed)) return true;

    // ELI format: contains eli/reg or eli/reg_impl followed by year/number
    // Full: http://data.europa.eu/eli/reg/2014/910/oj
    // Partial: eli/reg/2014/910 or eli/reg_impl/2015/1501
    if (/eli\/(reg|reg_impl|dec|reco?)\/\d{4}\/\d+/i.test(trimmed)) return true;

    return false;
}

/**
 * Extract year/number from ELI URI for matching
 * e.g., "http://data.europa.eu/eli/reg/2014/910/oj" -> "910-2014"
 * e.g., "eli/reg_impl/2015/1501" -> "2015-1501"
 */
function extractFromELI(query) {
    // Match eli/TYPE/YEAR/NUMBER patterns
    const match = query.match(/eli\/(?:reg|reg_impl|dec|reco?)\/(\d{4})\/(\d+)/i);
    if (match) {
        const [, year, number] = match;
        return `${year}-${number}`;
    }
    return null;
}

/**
 * Convert EU legal citation format (910/2014) to slug (2014-910)
 * e.g., "910/2014" -> "2014-910"
 */
function convertLegalCitation(query) {
    const match = query.match(/^(\d{3,4})\/(\d{4})$/);
    if (match) {
        const [, number, year] = match;
        return `${year}-${number}`;
    }
    return null;
}

/**
 * Find matching documents for a query
 */
function findMatches(query, index) {
    if (!query || !index || query.length < 3) return [];

    // Check if this is an ELI URI and extract the slug
    const eliSlug = extractFromELI(query);

    // Check if this is EU legal citation format (910/2014)
    const legalCitationSlug = convertLegalCitation(query);

    const normalizedQuery = eliSlug || legalCitationSlug || query;

    // For ELI, also try reversed format (2014-910 vs 910-2014)
    let reversedEliSlug = null;
    if (eliSlug && eliSlug.includes('-')) {
        const parts = eliSlug.split('-');
        reversedEliSlug = `${parts[1]}-${parts[0]}`;
    }

    const normalized = normalizeForMatch(normalizedQuery);
    const normalizedReversed = reversedEliSlug ? normalizeForMatch(reversedEliSlug) : null;
    const matches = [];

    for (const doc of index) {
        const celexNorm = normalizeForMatch(doc.celex || '');
        const slugNorm = normalizeForMatch(doc.slug || '');

        // Exact CELEX match (highest priority)
        if (celexNorm === normalized) {
            matches.push({ ...doc, matchType: 'celex', matchScore: 100 });
            continue;
        }

        // Exact slug match
        if (slugNorm === normalized) {
            matches.push({ ...doc, matchType: 'slug', matchScore: 90 });
            continue;
        }

        // Reversed ELI slug match (handles 910-2014 vs 2014-910 format)
        if (normalizedReversed && slugNorm === normalizedReversed) {
            matches.push({ ...doc, matchType: 'eli', matchScore: 95 });
            continue;
        }

        // CELEX contains the query (e.g., searching "1501" finds "32015R1501")
        if (celexNorm.includes(normalized)) {
            matches.push({ ...doc, matchType: 'celex-partial', matchScore: 70 });
            continue;
        }

        // Slug contains the query
        if (slugNorm.includes(normalized)) {
            matches.push({ ...doc, matchType: 'slug-partial', matchScore: 60 });
            continue;
        }
    }

    // Sort by score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Return top 3 matches
    return matches.slice(0, 3);
}

/**
 * Hook for quick jump functionality
 */
export function useQuickJump(query) {
    const [index, setIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load index on mount
    useEffect(() => {
        loadRegulationsIndex()
            .then(setIndex)
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);

    // Find matches whenever query changes
    const matches = useMemo(() => {
        if (!index || !query) return [];

        // Only look for matches if query looks like a doc reference
        // OR if it's at least 4 characters (could be partial match)
        const trimmed = query.trim();
        if (trimmed.length < 3) return [];

        // Check if it looks like a document reference
        if (looksLikeDocRef(trimmed)) {
            return findMatches(trimmed, index);
        }

        // For longer queries, still check for matches but with lower threshold
        if (trimmed.length >= 4 && /\d{3,}/.test(trimmed)) {
            return findMatches(trimmed, index);
        }

        return [];
    }, [query, index]);

    return {
        isLoading,
        matches,
        hasMatches: matches.length > 0
    };
}

export default useQuickJump;
