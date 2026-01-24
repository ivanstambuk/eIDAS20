/**
 * Term Popover Template Generator
 * 
 * Generates HTML for term popover content at runtime.
 * Used by RegulationViewer.jsx to hydrate term links.
 * 
 * DEC-085: Terminology Cross-Linking
 * 
 * @param {Object} term - Term object from terminology.json
 * @param {string} term.id - Unique term identifier
 * @param {string} term.term - Display term
 * @param {Array} term.sources - Array of source definitions
 */

import { buildDocumentLink, buildTerminologyLink, toHref } from './linkBuilder';

/**
 * Get CSS class for source category coloring
 */
function getCategoryClass(category) {
    switch (category) {
        case 'primary': return 'term-source-primary';
        case 'implementing-act': return 'term-source-implementing';
        case 'referenced': return 'term-source-referenced';
        default: return '';
    }
}

/**
 * Get document route path for linking (using centralized link builder)
 */
function getDocumentPath(source) {
    const internalPath = buildDocumentLink(source.documentId, {
        section: source.articleId,
        type: source.documentType
    });
    return toHref(internalPath);
}

/**
 * Generate popover HTML for a term
 * 
 * @param {Object} term - Term object from terminology.json
 * @returns {{ className: string, html: string }}
 */
export function generateTermPopoverContent(term) {
    const sources = term.sources || [];
    const hasMultipleSources = sources.length > 1;

    // Deduplicate sources by definition text (normalized for comparison)
    // Group sources with identical definitions
    const definitionGroups = new Map();
    for (const source of sources) {
        // Normalize definition for comparison (trim, lowercase, collapse whitespace)
        const normalizedDef = source.definition.trim().toLowerCase().replace(/\s+/g, ' ');

        if (!definitionGroups.has(normalizedDef)) {
            definitionGroups.set(normalizedDef, {
                definition: source.definition, // Keep original formatting
                sources: []
            });
        }
        definitionGroups.get(normalizedDef).sources.push(source);
    }

    // Convert to array of unique definitions
    const uniqueDefinitions = Array.from(definitionGroups.values());

    // Limit unique definitions shown to prevent overflow (show first 3)
    const displayDefinitions = uniqueDefinitions.slice(0, 3);
    const hasMoreDefinitions = uniqueDefinitions.length > 3;

    const sourcesHtml = displayDefinitions.map(group => {
        // Use first source as representative
        const source = group.sources[0];
        const sourceCount = group.sources.length;

        // Build source titles for tooltip (first 3 sources)
        const sourceTitles = group.sources.slice(0, 3).map(s => s.documentTitle).join(', ');
        const moreSourcesText = group.sources.length > 3
            ? ` +${group.sources.length - 3} more`
            : '';

        return `
        <div class="term-popover-source ${getCategoryClass(source.documentCategory)}">
            <div class="term-popover-source-header">
                <a href="${getDocumentPath(source)}" class="term-popover-source-title">
                    ${source.documentTitle}
                </a>
                <span class="term-popover-article">Art. ${source.articleNumber}</span>
                ${sourceCount > 1 ? `
                    <span class="term-popover-source-count" title="${sourceTitles}${moreSourcesText}">
                        +${sourceCount - 1} identical
                    </span>
                ` : ''}
                ${source.documentCategory === 'referenced' ?
                '<span class="term-popover-badge-referenced">Referenced</span>' : ''}
            </div>
            <p class="term-popover-definition">${group.definition}</p>
        </div>
    `;
    }).join('');

    // Generate aliases display if present
    const aliasesHtml = term.aliases?.length > 0
        ? `<span class="term-popover-aliases"> (${term.aliases.join(', ')})</span>`
        : '';

    const html = `
        <div class="term-popover-header">
            <span class="term-popover-title">${term.term}${aliasesHtml}</span>
            ${hasMultipleSources ? `
                <span class="term-popover-count">
                    ${sources.length} source${sources.length > 1 ? 's' : ''}
                </span>
            ` : ''}
        </div>
        <div class="term-popover-sources">
            ${sourcesHtml}
            ${hasMoreDefinitions ? `
                <div class="term-popover-more">
                    +${uniqueDefinitions.length - 3} more definition${uniqueDefinitions.length - 3 > 1 ? 's' : ''}
                </div>
            ` : ''}
        </div>
        <div class="term-popover-footer">
            <a href="${toHref(buildTerminologyLink({ termId: term.id }))}" class="term-popover-link">
                View in Terminology →
            </a>
        </div>
    `;

    return {
        className: 'term-popover',
        html
    };
}
