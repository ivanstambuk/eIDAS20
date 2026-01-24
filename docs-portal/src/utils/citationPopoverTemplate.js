/**
 * citationPopoverTemplate.js
 * 
 * Generates HTML templates for citation popovers.
 * Extracted from RegulationViewer.jsx to improve maintainability.
 * 
 * Part of DEC-059 (Citation Enhancement) and DEC-060 (Smart Consolidation)
 */

import { buildDocumentLink, toHref } from './linkBuilder';

/**
 * Format the formal name for display in the popover.
 * DEC-064: Prepends "Implementing" for implementing regulations to distinguish
 * them from base regulations like GDPR or eIDAS.
 * 
 * @param {Object} citation - Citation object with shortName, category, subcategory
 * @returns {string} Formatted name (e.g., "Implementing Regulation 2024/2980")
 */
function formatFormalName(citation) {
    // Check if this is an implementing regulation
    if (citation.subcategory === 'implementing' && citation.category === 'regulation') {
        // If shortName already starts with "Regulation", replace it with "Implementing Regulation"
        if (citation.shortName?.startsWith('Regulation ')) {
            return citation.shortName.replace('Regulation ', 'Implementing Regulation ');
        }
        // Otherwise, just prepend "Implementing"
        return `Implementing ${citation.shortName}`;
    }
    return citation.shortName;
}

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
        <p class="citation-popover-amendment-notice">
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
 * DEC-062: Amendment-aware popovers show dual badges and consolidated links.
 * 
 * @param {Object} citation - Citation object with metadata fields
 * @returns {string} HTML string for the popover content
 */
export function generateStandardPopoverHtml(citation) {
    // DEC-064: Provision header (displayed prominently if citation targets a specific provision)
    let provisionSection = '';
    if (citation.provision) {
        provisionSection = `
            <div class="citation-popover-provision">
                <span class="citation-popover-provision-icon">📍</span>
                <span class="citation-popover-provision-text">${citation.provision.display}</span>
            </div>
        `;
    }

    // Header: Abbreviation + Status + (optionally) AMENDED badge
    const headerParts = [];
    if (citation.abbreviation) {
        headerParts.push(`<span class="citation-popover-abbrev">${citation.abbreviation}</span>`);
    }
    if (citation.statusDisplay) {
        headerParts.push(`<span class="citation-popover-status citation-popover-status--${citation.statusDisplay.color}">${citation.statusDisplay.label}</span>`);
    }
    // DEC-062: Add AMENDED badge if this regulation has been amended
    if (citation.isAmended) {
        headerParts.push(`<span class="citation-popover-status citation-popover-status--amended">Amended</span>`);
    }

    // Entry into force line
    const dateText = citation.entryIntoForceDisplay
        ? `<p class="citation-popover-date">📅 ${citation.status === 'in-force' ? 'In force since' : 'Entry into force:'} ${citation.entryIntoForceDisplay}</p>`
        : '';

    // DEC-062: Amendment notice (appears below the date)
    let amendmentNotice = '';
    if (citation.isAmended && citation.amendedBy?.length) {
        const amendingCelex = citation.amendedBy[0]; // Primary amending act
        const amendmentDateFormatted = citation.amendmentDate
            ? new Date(citation.amendmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : null;

        // Convert CELEX to slug: 32024R1183 -> 2024-1183
        const amendingSlug = amendingCelex.replace(/^3(\d{4})[A-Z](\d{4})$/, '$1-$2');
        // Convert CELEX to display: 32024R1183 -> 2024/1183
        const amendingDisplay = amendingCelex.replace(/^3/, '').replace(/R/, '/');

        // Build notice with linked regulation using centralized link builder
        const amendingLink = toHref(buildDocumentLink(amendingSlug));
        let noticeText = '⚠️ Amended';
        if (amendmentDateFormatted) {
            noticeText += ` on ${amendmentDateFormatted}`;
        }
        noticeText += ` by <a href="${amendingLink}" class="citation-popover-amendment-link">Regulation ${amendingDisplay}</a>`;

        amendmentNotice = `<p class="citation-popover-amendment-notice">${noticeText}</p>`;
    }

    // Category badge (if internal)
    const categoryBadge = citation.isInternal
        ? '<span class="citation-popover-category">Available in Portal</span>'
        : '';

    // Action buttons
    // DEC-062: For amended regulations with consolidatedSlug, show "View Consolidated" as primary
    // DEC-064: For provision citations, action text indicates provision target
    const actionLabel = citation.provision && citation.isInternal
        ? `View ${citation.provision.display} →`
        : 'View in Portal →';

    let actionButtons;
    if (citation.isAmended && citation.consolidatedSlug) {
        // Consolidated document available in portal - use centralized link builder
        const consolidatedLink = toHref(buildDocumentLink(citation.consolidatedSlug));
        actionButtons = `
            <a href="${consolidatedLink}" class="citation-popover-link citation-popover-link--primary">View Consolidated →</a>
            <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${citation.celex}" target="_blank" rel="noopener noreferrer" class="citation-popover-link citation-popover-link--secondary">EUR-Lex ↗</a>
        `;
    } else if (citation.isInternal) {
        actionButtons = `
            <a href="${citation.url}" class="citation-popover-link citation-popover-link--primary">${actionLabel}</a>
            <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${citation.celex}" target="_blank" rel="noopener noreferrer" class="citation-popover-link citation-popover-link--secondary">EUR-Lex ↗</a>
        `;
    } else {
        actionButtons = `<a href="${citation.url}" target="_blank" rel="noopener noreferrer" class="citation-popover-link citation-popover-link--external">View on EUR-Lex ↗</a>`;
    }

    return `
        ${provisionSection}
        <div class="citation-popover-header">
            ${headerParts.join('')}
        </div>
        <h3 class="citation-popover-human-name">${citation.humanName || citation.fullTitle}</h3>
        <p class="citation-popover-formal">${formatFormalName(citation)}</p>
        ${dateText}
        ${amendmentNotice}
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
