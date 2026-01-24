/**
 * useCopyReference Hook
 * 
 * DEC-011: Copy Reference Gutter Icons
 * 
 * Provides functionality to copy:
 * 1. Deep link URL (portal link with ?section= param)
 * 2. EU-standard citation reference
 * 
 * EU Citation Format (per Interinstitutional Style Guide):
 * - Articles:  Article 5(1)(a) of Regulation (EU) No 910/2014
 * - Annexes:   Annex I, point 3(a) of Regulation (EU) No 910/2014
 * 
 * Key difference: Annexes use "point N" (spelled out) instead of parenthetical
 * notation. Parentheses are reserved for sub-points in annexes.
 */

import { useCallback } from 'react';
import { generateDeepLink as generateDeepLinkFromBuilder } from '../utils/linkBuilder';

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
 * - "article-5a-para-1-point-a" → "Article 5a(1)(a)"
 * - "article-19a-para-1-point-a-subpoint-i" → "Article 19a(1)(a)(i)"
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

    // Handle individual recitals: recital-42 → Recital (42)
    const recitalMatch = headingId.match(/^recital-(\d+)$/);
    if (recitalMatch) {
        return `Recital (${recitalMatch[1]})`;
    }

    // Phase 3: Handle full hierarchy - article-19a-para-1-point-a-subpoint-i
    // Matches: article-{num}-para-{n}-point-{letter}-subpoint-{roman}
    const fullHierarchyMatch = headingId.match(
        /^article-([^-]+(?:-[a-z])?)-para-(\d+)-point-([a-z])-subpoint-([ivx]+)$/
    );
    if (fullHierarchyMatch) {
        const articleNum = formatArticleNumber(fullHierarchyMatch[1]);
        const paraNum = fullHierarchyMatch[2];
        const pointLetter = fullHierarchyMatch[3];
        const romanNumeral = fullHierarchyMatch[4];
        return `Article ${articleNum}(${paraNum})(${pointLetter})(${romanNumeral})`;
    }

    // Phase 2+: Handle point with paragraph context - article-5a-para-1-point-a
    const pointWithParaMatch = headingId.match(
        /^article-([^-]+(?:-[a-z])?)-para-(\d+)-point-([a-z])$/
    );
    if (pointWithParaMatch) {
        const articleNum = formatArticleNumber(pointWithParaMatch[1]);
        const paraNum = pointWithParaMatch[2];
        const pointLetter = pointWithParaMatch[3];
        return `Article ${articleNum}(${paraNum})(${pointLetter})`;
    }

    // Phase 2: Handle paragraphs - article-5a-para-1 → Article 5a(1)
    const paraMatch = headingId.match(/^article-([^-]+(?:-[a-z])?)-para-(\d+)$/);
    if (paraMatch) {
        const articleNum = formatArticleNumber(paraMatch[1]);
        const paraNum = paraMatch[2];
        return `Article ${articleNum}(${paraNum})`;
    }

    // Legacy: Handle points without paragraph context - article-5a-point-a
    // (kept for backward compatibility)
    const pointMatch = headingId.match(/^article-([^-]+(?:-[a-z])?)-point-([a-z])$/);
    if (pointMatch) {
        const articleNum = formatArticleNumber(pointMatch[1]);
        const pointLetter = pointMatch[2];
        return `Article ${articleNum}(${pointLetter})`;
    }

    // Legacy: Handle subpoints without full context - article-5a-subpoint-ii
    // (kept for backward compatibility)
    const subpointMatch = headingId.match(/^article-([^-]+(?:-[a-z])?)-subpoint-([ivx]+)$/);
    if (subpointMatch) {
        const articleNum = formatArticleNumber(subpointMatch[1]);
        const romanNumeral = subpointMatch[2];
        return `Article ${articleNum}(${romanNumeral})`;
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

    // Handle annex hierarchies: annex-i-para-3-point-a-subpoint-ii → Annex I, point 3(a)(ii)
    // EU Citation style for annexes uses "point" instead of "paragraph"
    const annexFullHierarchyMatch = headingId.match(
        /^annex-([ivx]+)-para-(\d+)-point-([a-z])-subpoint-([ivx]+)$/
    );
    if (annexFullHierarchyMatch) {
        const annexNum = annexFullHierarchyMatch[1].toUpperCase();
        const pointNum = annexFullHierarchyMatch[2];
        const subLetter = annexFullHierarchyMatch[3];
        const roman = annexFullHierarchyMatch[4];
        return `Annex ${annexNum}, point ${pointNum}(${subLetter})(${roman})`;
    }

    // Handle annex with point: annex-i-para-3-point-a → Annex I, point 3(a)
    const annexPointMatch = headingId.match(
        /^annex-([ivx]+)-para-(\d+)-point-([a-z])$/
    );
    if (annexPointMatch) {
        const annexNum = annexPointMatch[1].toUpperCase();
        const pointNum = annexPointMatch[2];
        const subLetter = annexPointMatch[3];
        return `Annex ${annexNum}, point ${pointNum}(${subLetter})`;
    }

    // Handle annex paragraph: annex-i-para-3 → Annex I, point 3
    const annexParaMatch = headingId.match(/^annex-([ivx]+)-para-(\d+)$/);
    if (annexParaMatch) {
        const annexNum = annexParaMatch[1].toUpperCase();
        const pointNum = annexParaMatch[2];
        return `Annex ${annexNum}, point ${pointNum}`;
    }

    // Handle basic annexes: annex-i → Annex I
    const annexMatch = headingId.match(/^annex-([ivx]+)$/);
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
 * Uses centralized linkBuilder utility.
 * 
 * @param {string} headingId - The heading ID
 * @param {string} slug - Document slug
 * @returns {string} - Full URL
 */
export function generateDeepLink(headingId, slug) {
    return generateDeepLinkFromBuilder(headingId, slug);
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
