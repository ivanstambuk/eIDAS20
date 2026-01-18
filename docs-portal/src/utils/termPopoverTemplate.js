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
 * Get document route path for linking
 */
function getDocumentPath(source) {
    const basePath = source.documentType === 'regulation' ? 'regulation' : 'implementing-acts';
    return `#/${basePath}/${source.documentId}?section=${source.articleId}`;
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

    // Limit sources shown to prevent overflow (show first 3)
    const displaySources = sources.slice(0, 3);
    const hasMore = sources.length > 3;

    const sourcesHtml = displaySources.map(source => `
        <div class="term-popover-source ${getCategoryClass(source.documentCategory)}">
            <div class="term-popover-source-header">
                <a href="${getDocumentPath(source)}" class="term-popover-source-title">
                    ${source.documentTitle}
                </a>
                <span class="term-popover-article">Art. ${source.articleNumber}</span>
                ${source.documentCategory === 'referenced' ?
            '<span class="term-popover-badge-referenced">Referenced</span>' : ''}
            </div>
            <p class="term-popover-definition">${source.definition}</p>
        </div>
    `).join('');

    const html = `
        <div class="term-popover-header">
            <span class="term-popover-title">${term.term}</span>
            ${hasMultipleSources ? `
                <span class="term-popover-count">
                    ${sources.length} source${sources.length > 1 ? 's' : ''}
                </span>
            ` : ''}
        </div>
        <div class="term-popover-sources">
            ${sourcesHtml}
            ${hasMore ? `
                <div class="term-popover-more">
                    +${sources.length - 3} more source${sources.length - 3 > 1 ? 's' : ''}
                </div>
            ` : ''}
        </div>
        <div class="term-popover-footer">
            <a href="#/terminology?term=${term.id}" class="term-popover-link">
                View in Terminology →
            </a>
        </div>
    `;

    return {
        className: 'term-popover',
        html
    };
}
