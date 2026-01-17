/**
 * useCitations - Hook to load citations for a regulation
 * 
 * Part of DEC-009: Citation formatting with responsive behavior and internal linking.
 */

import { useState, useEffect } from 'react';

/**
 * Load citations for a given regulation slug
 * @param {string} slug - The regulation slug (e.g., "2025-0846")
 * @returns {{ citations: Array, loading: boolean, error: string|null }}
 */
export function useCitations(slug) {
    const [citations, setCitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }

        const loadCitations = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${import.meta.env.BASE_URL}data/citations/${slug}.json`);

                if (!response.ok) {
                    // No citations file is okay - not all documents have citations
                    setCitations([]);
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                setCitations(data.citations || []);
                setLoading(false);
            } catch (err) {
                // Silently handle missing citations
                setCitations([]);
                setLoading(false);
            }
        };

        loadCitations();
    }, [slug]);

    return { citations, loading, error };
}

/**
 * Transform HTML content to replace inline citations with interactive markers.
 * 
 * Matches patterns like:
 * - \[Full citation text (OJ ref, ELI: url)\]
 * 
 * Replaces with span elements that can be hydrated with popovers.
 * 
 * @param {string} html - The raw HTML content
 * @param {Array} citations - Array of citation objects
 * @param {boolean} isMobile - Whether to render mobile (footnote) or desktop (popover) format
 * @returns {string} - Transformed HTML
 */
export function transformCitationsInHtml(html, citations, isMobile) {
    if (!citations || citations.length === 0) return html;

    let transformed = html;

    for (const citation of citations) {
        // Escape the original text for regex
        const escaped = citation.originalText
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\\s+/g, '\\s+');

        const pattern = new RegExp(escaped, 'g');

        if (isMobile) {
            // Mobile: short name + superscript footnote reference
            const replacement = `${citation.shortName}<sup class="citation-footnote-ref"><a href="#ref-${citation.index}" id="cite-${citation.index}">[${citation.index}]</a></sup>`;
            transformed = transformed.replace(pattern, replacement);
        } else {
            // Desktop: span with data attributes for popover hydration
            // DEC-059: Enhanced with humanName, abbreviation, entryIntoForce, status
            const replacement = `<span 
                class="citation-trigger" 
                tabindex="0"
                role="button"
                data-citation-index="${citation.index}"
                data-citation-short="${citation.shortName}"
                data-citation-full="${encodeURIComponent(citation.fullTitle)}"
                data-citation-oj="${citation.ojRef || ''}"
                data-citation-celex="${citation.celex || ''}"
                data-citation-internal="${citation.isInternal}"
                data-citation-url="${citation.url}"
                data-citation-human-name="${encodeURIComponent(citation.humanName || '')}"
                data-citation-abbreviation="${citation.abbreviation || ''}"
                data-citation-entry-into-force="${citation.entryIntoForceDisplay || ''}"
                data-citation-status="${citation.status || ''}"
                data-citation-status-label="${citation.statusDisplay?.label || ''}"
                data-citation-status-color="${citation.statusDisplay?.color || ''}"
            >${citation.shortName}</span>`;
            transformed = transformed.replace(pattern, replacement);
        }
    }

    return transformed;
}

/**
 * Generate the References section HTML for footnotes.
 * 
 * @param {Array} citations - Array of citation objects
 * @returns {string} - HTML for the references section
 */
export function generateReferencesHtml(citations) {
    if (!citations || citations.length === 0) return '';

    const items = citations.map(citation => {
        const icon = citation.isInternal ? '' : ' 🔗';
        const ojRef = citation.ojRef ? ` <span class="reference-oj">(${citation.ojRef})</span>` : '';
        const target = citation.isInternal ? '' : ' target="_blank" rel="noopener noreferrer"';

        return `<li id="ref-${citation.index}">
            <a href="${citation.url}"${target} class="reference-link">${citation.fullTitle}</a>${icon}${ojRef}
            <a href="#cite-${citation.index}" class="reference-backlink" title="Back to text">↩</a>
        </li>`;
    }).join('\n');

    return `
        <section class="references-section" aria-label="References">
            <h2 id="references">References</h2>
            <ol class="references-list">
                ${items}
            </ol>
        </section>
    `;
}

export default useCitations;
