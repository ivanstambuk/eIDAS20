/**
 * useCopyReference Hook
 * 
 * DEC-011: Copy Reference Gutter Icons
 * 
 * Provides functionality to copy:
 * 1. Deep link URL (portal link with ?section= param)
 * 2. EU-standard citation reference (e.g., "Article 5a(1) of Regulation (EU) No 910/2014")
 */

import { useCallback } from 'react';

/**
 * Extract regulation number from CELEX code or title.
 * 
 * Examples:
 * - "02014R0910-20241018" → "910/2014"
 * - "32024R1183" → "2024/1183"
 * - "Regulation (EU) No 910/2014..." → "910/2014"
 * 
 * @param {string} celex - CELEX code
 * @param {string} title - Full regulation title
 * @returns {string} - Formatted regulation number
 */
function extractRegulationNumber(celex, title) {
    // Try CELEX first: format is like "02014R0910" or "32024R1183"
    if (celex) {
        // Match consolidated format: 02014R0910
        const consolidatedMatch = celex.match(/^0(\d{4})R(\d{4})/);
        if (consolidatedMatch) {
            const year = consolidatedMatch[1];
            const num = parseInt(consolidatedMatch[2], 10).toString(); // Remove leading zeros
            return `${num}/${year}`;
        }

        // Match standard format: 32024R1183
        const standardMatch = celex.match(/^3(\d{4})R(\d+)/);
        if (standardMatch) {
            const year = standardMatch[1];
            const num = parseInt(standardMatch[2], 10).toString();
            return `${year}/${num}`;
        }
    }

    // Fallback: extract from title
    if (title) {
        const titleMatch = title.match(/(?:Regulation|Decision|Directive)\s*\(EU\)\s*(?:No\s*)?(\d+)\/(\d+)/i);
        if (titleMatch) {
            return `${titleMatch[1]}/${titleMatch[2]}`;
        }
    }

    return celex || 'Unknown';
}

/**
 * Determine document type string for EU citation.
 * 
 * @param {string} type - Document type from JSON
 * @param {string} title - Full title
 * @returns {string} - "Regulation", "Decision", "Directive", etc.
 */
function getDocumentType(type, title) {
    if (title) {
        if (title.toLowerCase().includes('implementing regulation')) {
            return 'Implementing Regulation';
        }
        if (title.toLowerCase().includes('delegated regulation')) {
            return 'Delegated Regulation';
        }
        if (title.toLowerCase().includes('regulation')) {
            return 'Regulation';
        }
        if (title.toLowerCase().includes('decision')) {
            return 'Decision';
        }
        if (title.toLowerCase().includes('directive')) {
            return 'Directive';
        }
    }

    return type === 'regulation' ? 'Regulation' : 'Implementing Act';
}

/**
 * Format a heading ID into EU-standard article reference.
 * 
 * Examples:
 * - "article-5a" → "Article 5a"
 * - "article-5a-para-1" → "Article 5a(1)"
 * - "article-5a-point-a" → "Article 5a, point (a)"
 * - "chapter-iii" → "Chapter III"
 * - "preamble" → "Preamble"
 * - "recitals" → "Recitals"
 * 
 * @param {string} headingId - The heading ID from HTML
 * @returns {string} - Formatted reference part
 */
function formatHeadingReference(headingId) {
    if (!headingId) return '';

    // Handle known structural sections
    if (headingId === 'preamble') return 'Preamble';
    if (headingId === 'recitals') return 'Recitals';
    if (headingId === 'enacting-terms') return 'Enacting Terms';

    // Phase 2: Handle paragraphs - article-5a-para-1 → Article 5a(1)
    const paraMatch = headingId.match(/^article-([^-]+(?:-[a-z])?)-para-(\d+)$/);
    if (paraMatch) {
        const articleNum = formatArticleNumber(paraMatch[1]);
        const paraNum = paraMatch[2];
        return `Article ${articleNum}(${paraNum})`;
    }

    // Phase 2: Handle points - article-5a-point-a → Article 5a, point (a)
    const pointMatch = headingId.match(/^article-([^-]+(?:-[a-z])?)-point-([a-z])$/);
    if (pointMatch) {
        const articleNum = formatArticleNumber(pointMatch[1]);
        const pointLetter = pointMatch[2];
        return `Article ${articleNum}, point (${pointLetter})`;
    }

    // Phase 3: Handle subpoints - article-5a-subpoint-ii → Article 5a, point (ii)
    const subpointMatch = headingId.match(/^article-([^-]+(?:-[a-z])?)-subpoint-([ivx]+)$/);
    if (subpointMatch) {
        const articleNum = formatArticleNumber(subpointMatch[1]);
        const romanNumeral = subpointMatch[2];
        return `Article ${articleNum}, point (${romanNumeral})`;
    }

    // Handle basic articles: article-5a → Article 5a
    const articleMatch = headingId.match(/^article-(.+)$/);
    if (articleMatch) {
        return `Article ${formatArticleNumber(articleMatch[1])}`;
    }

    // Handle chapters: chapter-iii → Chapter III
    const chapterMatch = headingId.match(/^chapter-(.+)$/);
    if (chapterMatch) {
        return `Chapter ${chapterMatch[1].toUpperCase()}`;
    }

    // Handle annexes: annex-i → Annex I
    const annexMatch = headingId.match(/^annex-(.+)$/);
    if (annexMatch) {
        return `Annex ${annexMatch[1].toUpperCase()}`;
    }

    // Fallback: capitalize and clean up
    return headingId
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Format article number: "5a" → "5a", "12b" → "12b"
 * Handles dashes from IDs: "5-a" → "5a"
 */
function formatArticleNumber(rawNum) {
    // Remove extra dashes and handle letter suffixes
    const cleaned = rawNum.replace(/-/g, '');
    // Ensure letter suffix is lowercase
    return cleaned.replace(/(\d+)([A-Z])?$/i, (_, num, letter) => {
        return letter ? `${num}${letter.toLowerCase()}` : num;
    });
}

/**
 * Generate the full EU-standard citation reference.
 * 
 * @param {string} headingId - The heading ID
 * @param {object} regulation - Regulation metadata (celex, title, type)
 * @returns {string} - Full EU citation
 */
export function generateEUReference(headingId, regulation) {
    const refPart = formatHeadingReference(headingId);
    const regNumber = extractRegulationNumber(regulation?.celex, regulation?.title);
    const docType = getDocumentType(regulation?.type, regulation?.title);

    // Format: "Article 5a of Regulation (EU) No 910/2014"
    return `${refPart} of ${docType} (EU) No ${regNumber}`;
}

/**
 * Generate the deep link URL for a section.
 * 
 * @param {string} headingId - The heading ID
 * @param {string} slug - Document slug
 * @returns {string} - Full URL
 */
export function generateDeepLink(headingId, slug) {
    // Get the base URL (works in browser)
    const baseUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : '';

    // HashRouter format: /#/regulation/slug?section=id
    return `${baseUrl}#/regulation/${slug}?section=${headingId}`;
}

/**
 * Hook for copy reference functionality.
 * 
 * @param {object} regulation - Current regulation data
 * @returns {object} - { copyLink, copyReference } functions
 */
export function useCopyReference(regulation) {
    const copyLink = useCallback(async (headingId) => {
        if (!regulation?.slug) return false;

        const url = generateDeepLink(headingId, regulation.slug);

        try {
            await navigator.clipboard.writeText(url);
            return true;
        } catch (err) {
            console.error('Failed to copy link:', err);
            return false;
        }
    }, [regulation]);

    const copyReference = useCallback(async (headingId) => {
        if (!regulation) return false;

        const reference = generateEUReference(headingId, regulation);

        try {
            await navigator.clipboard.writeText(reference);
            return true;
        } catch (err) {
            console.error('Failed to copy reference:', err);
            return false;
        }
    }, [regulation]);

    return { copyLink, copyReference };
}

export default useCopyReference;
