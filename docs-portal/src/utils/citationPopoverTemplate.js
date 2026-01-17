/**
 * citationPopoverTemplate.js
 * 
 * Generates HTML templates for citation popovers.
 * Extracted from RegulationViewer.jsx to improve maintainability.
 * 
 * Part of DEC-059 (Citation Enhancement) and DEC-060 (Smart Consolidation)
 */

/**
 * Generate the HTML content for a consolidated document self-reference popover.
 * Used when a document cites its own base regulation (e.g., 910/2014 citing itself).
 * 
 * @param {Object} citation - Citation object with humanName, shortName, consolidationInfo
 * @returns {string} HTML string for the popover content
 */
export function generateConsolidatedPopoverHtml(citation) {
    const info = citation.consolidationInfo;

    // Build amendment links
    const amendmentLinks = info.amendments.map(a =>
        `<a href="${a.eurlexUrl}" target="_blank" rel="noopener noreferrer" 
            class="citation-popover-link citation-popover-link--amendment">${a.label} ↗</a>`
    ).join('');

    return `
        <div class="citation-popover-header">
            <span class="citation-popover-badge citation-popover-badge--consolidated">📍 CURRENT DOCUMENT</span>
        </div>
        <h3 class="citation-popover-human-name">${citation.humanName || citation.fullTitle}</h3>
        <p class="citation-popover-formal">${citation.shortName}</p>
        <p class="citation-popover-amendment-info">
            As amended by: ${info.amendments.map(a => a.label).join(', ')}
        </p>
        <div class="citation-popover-eurlex-group">
            <span class="citation-popover-eurlex-label">View on EUR-Lex:</span>
            <div class="citation-popover-eurlex-links">
                <a href="${info.originalEurlexUrl}" target="_blank" rel="noopener noreferrer" 
                    class="citation-popover-link citation-popover-link--original">📄 Original (2014) ↗</a>
                ${amendmentLinks}
            </div>
        </div>
        <div class="citation-popover-footer citation-popover-footer--consolidated">
            <span class="citation-popover-merged-notice">✓ You're reading the merged version</span>
        </div>
    `;
}

/**
 * Generate the HTML content for a standard citation popover.
 * Used for external and internal citations that are not self-references.
 * 
 * @param {Object} citation - Citation object with metadata fields
 * @returns {string} HTML string for the popover content
 */
export function generateStandardPopoverHtml(citation) {
    // Header: Abbreviation + Status
    const headerParts = [];
    if (citation.abbreviation) {
        headerParts.push(`<span class="citation-popover-abbrev">${citation.abbreviation}</span>`);
    }
    if (citation.statusDisplay) {
        headerParts.push(`<span class="citation-popover-status citation-popover-status--${citation.statusDisplay.color}">${citation.statusDisplay.label}</span>`);
    }

    // Entry into force line
    const dateText = citation.entryIntoForceDisplay
        ? `<p class="citation-popover-date">📅 ${citation.status === 'in-force' ? 'In force since' : 'Entry into force:'} ${citation.entryIntoForceDisplay}</p>`
        : '';

    // Category badge (if internal)
    const categoryBadge = citation.isInternal
        ? '<span class="citation-popover-category">Available in Portal</span>'
        : '';

    // Action buttons
    let actionButtons;
    if (citation.isInternal) {
        actionButtons = `
            <a href="${citation.url}" class="citation-popover-link citation-popover-link--primary">View in Portal →</a>
            <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${citation.celex}" target="_blank" rel="noopener noreferrer" class="citation-popover-link citation-popover-link--secondary">EUR-Lex ↗</a>
        `;
    } else {
        actionButtons = `<a href="${citation.url}" target="_blank" rel="noopener noreferrer" class="citation-popover-link citation-popover-link--external">View on EUR-Lex ↗</a>`;
    }

    return `
        <div class="citation-popover-header">
            ${headerParts.join('')}
        </div>
        <h3 class="citation-popover-human-name">${citation.humanName || citation.fullTitle}</h3>
        <p class="citation-popover-formal">${citation.shortName}</p>
        ${dateText}
        ${categoryBadge}
        <div class="citation-popover-footer">
            ${actionButtons}
        </div>
    `;
}

/**
 * Generate complete popover HTML, selecting the appropriate template based on citation type.
 * 
 * @param {Object} citation - Citation object
 * @returns {{ className: string, html: string }} Object with CSS class and HTML content
 */
export function generatePopoverContent(citation) {
    if (citation.isSelfReference && citation.consolidationInfo) {
        return {
            className: 'citation-popover citation-popover--consolidated',
            html: generateConsolidatedPopoverHtml(citation)
        };
    }

    return {
        className: 'citation-popover',
        html: generateStandardPopoverHtml(citation)
    };
}
