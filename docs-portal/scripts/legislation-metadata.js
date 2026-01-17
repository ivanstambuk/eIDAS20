/**
 * legislation-metadata.js
 * 
 * Enhanced metadata for EU legislation citations.
 * Part of DEC-059: Citation Popover Enhancement (Hybrid B+C design)
 * 
 * This registry provides human-friendly names, abbreviations, and temporal
 * context for legislation referenced in the documentation portal.
 * 
 * Data sources:
 * - EUR-Lex (https://eur-lex.europa.eu)
 * - Official Journal of the European Union
 */

/**
 * Legislation metadata indexed by CELEX number.
 * 
 * Fields:
 * - humanName: Full human-readable title
 * - abbreviation: Common abbreviation (if widely known)
 * - entryIntoForce: Date when legislation became applicable (ISO format)
 * - status: 'in-force' | 'repealed' | 'not-yet-applicable' | 'partially-applicable'
 * - category: 'regulation' | 'directive' | 'decision' | 'recommendation'
 * 
 * Amendment-aware fields (DEC-062):
 * - amendedBy: Array of CELEX numbers of amending regulations (e.g., ['32024R1183'])
 * - amendmentDate: Date when the amendment entered into force (ISO format)
 * - consolidatedSlug: Portal slug for the consolidated version (e.g., '910-2014')
 */
export const LEGISLATION_METADATA = {
    // =========================================================================
    // FOUNDATIONAL REGULATIONS (widely known, have abbreviations)
    // =========================================================================

    // GDPR - General Data Protection Regulation
    '32016R0679': {
        humanName: 'General Data Protection Regulation',
        abbreviation: 'GDPR',
        entryIntoForce: '2018-05-25',
        status: 'in-force',
        category: 'regulation',
    },

    // eIDAS 1.0 - Electronic Identification and Trust Services (original)
    // Note: This is the original regulation, now amended by eIDAS 2.0 (2024/1183)
    '32014R0910': {
        humanName: 'Electronic Identification and Trust Services Regulation',
        abbreviation: 'eIDAS 1.0',
        entryIntoForce: '2014-09-17', // Entry into force (full application: 2016-07-01)
        status: 'in-force',
        category: 'regulation',
        // Amendment relationship (for amendment-aware popovers)
        amendedBy: ['32024R1183'],           // CELEX of amending regulation(s)
        amendmentDate: '2024-05-20',          // When amendment entered into force
        consolidatedSlug: '910-2014',         // Portal slug for consolidated version
    },

    // eIDAS 2.0 - Amending Regulation
    '32024R1183': {
        humanName: 'European Digital Identity Framework',
        abbreviation: 'eIDAS 2.0',
        entryIntoForce: '2024-05-20',
        status: 'in-force',
        category: 'regulation',
    },

    // Accreditation and Market Surveillance
    '32008R0765': {
        humanName: 'Accreditation and Market Surveillance Regulation',
        abbreviation: null, // No common abbreviation
        entryIntoForce: '2010-01-01',
        status: 'in-force',
        category: 'regulation',
    },

    // NIS2 Directive - Network and Information Security
    '32022L2555': {
        humanName: 'Network and Information Security Directive',
        abbreviation: 'NIS2',
        entryIntoForce: '2023-01-16',
        status: 'in-force',
        category: 'directive',
    },

    // DORA - Digital Operational Resilience Act
    '32022R2554': {
        humanName: 'Digital Operational Resilience Act',
        abbreviation: 'DORA',
        entryIntoForce: '2025-01-17', // Full application
        status: 'in-force',
        category: 'regulation',
    },

    // =========================================================================
    // eIDAS IMPLEMENTING ACTS (2024/2025)
    // =========================================================================

    '32024R2977': {
        humanName: 'Wallet Trust Evidence and Wallet Attestations',
        abbreviation: null,
        entryIntoForce: '2024-12-25',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',  // DEC-064: Distinguishes from regular regulations
    },

    '32024R2978': {
        humanName: 'Identity Matching Requirements',
        abbreviation: null,
        entryIntoForce: '2024-12-25',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    '32024R2979': {
        humanName: 'Person Identification Data and Electronic Attestations',
        abbreviation: null,
        entryIntoForce: '2024-12-25',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    '32024R2980': {
        humanName: 'Protocols and Interfaces for Relying Parties',
        abbreviation: null,
        entryIntoForce: '2024-12-25',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    '32024R2981': {
        humanName: 'Integrity and Core Functionality Certification',
        abbreviation: null,
        entryIntoForce: '2024-12-25',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    '32024R2982': {
        humanName: 'Notifications to the Commission',
        abbreviation: null,
        entryIntoForce: '2024-12-25',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    '32025R0846': {
        humanName: 'Cross-Border Identity Verification',
        abbreviation: null,
        entryIntoForce: '2025-01-14',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    '32025R0847': {
        humanName: 'Security Breach Notification',
        abbreviation: null,
        entryIntoForce: '2025-01-14',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    '32025R0848': {
        humanName: 'Supervision of Trust Service Providers',
        abbreviation: null,
        entryIntoForce: '2025-01-14',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    // =========================================================================
    // FREQUENTLY CITED DIRECTIVES
    // =========================================================================

    // E-Signature Directive (repealed by eIDAS)
    '31999L0093': {
        humanName: 'Electronic Signature Directive',
        abbreviation: null,
        entryIntoForce: '2000-01-19',
        status: 'repealed',
        category: 'directive',
        repealedBy: '32014R0910',
    },

    // Data Protection Directive (repealed by GDPR)
    '31995L0046': {
        humanName: 'Data Protection Directive',
        abbreviation: null,
        entryIntoForce: '1995-10-24',
        status: 'repealed',
        category: 'directive',
        repealedBy: '32016R0679',
    },

    // Public Procurement Directive
    '32014L0024': {
        humanName: 'Public Procurement Directive',
        abbreviation: null,
        entryIntoForce: '2014-04-17',
        status: 'in-force',
        category: 'directive',
    },

    // Services Directive
    '32006L0123': {
        humanName: 'Services Directive',
        abbreviation: null,
        entryIntoForce: '2006-12-28',
        status: 'in-force',
        category: 'directive',
    },

    // Anti-Money Laundering Directive (5th)
    '32018L0843': {
        humanName: 'Anti-Money Laundering Directive',
        abbreviation: 'AMLD5',
        entryIntoForce: '2018-07-09',
        status: 'in-force',
        category: 'directive',
    },

    // =========================================================================
    // OTHER REGULATIONS
    // =========================================================================

    // Single Digital Gateway
    '32018R1724': {
        humanName: 'Single Digital Gateway Regulation',
        abbreviation: 'SDG',
        entryIntoForce: '2018-11-11',
        status: 'in-force',
        category: 'regulation',
    },

    // Cybersecurity Act
    '32019R0881': {
        humanName: 'Cybersecurity Act',
        abbreviation: 'CSA',
        entryIntoForce: '2019-06-27',
        status: 'in-force',
        category: 'regulation',
    },
};

/**
 * Look up metadata for a CELEX number.
 * Returns enhanced data or null if not in registry.
 * 
 * @param {string} celex - CELEX number (e.g., '32016R0679')
 * @returns {Object|null} Metadata object or null
 */
export function getLegislationMetadata(celex) {
    return LEGISLATION_METADATA[celex] || null;
}

/**
 * Format entry into force date for display.
 * @param {string} isoDate - ISO date string (e.g., '2018-05-25')
 * @returns {string} Formatted date (e.g., '25 May 2018')
 */
export function formatEntryIntoForce(isoDate) {
    if (!isoDate) return null;

    const date = new Date(isoDate);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}

/**
 * Get status display info.
 * @param {string} status - Status code
 * @returns {{ label: string, color: string }}
 */
export function getStatusDisplay(status) {
    const statusMap = {
        'in-force': { label: 'In Force', color: 'green' },
        'repealed': { label: 'Repealed', color: 'red' },
        'not-yet-applicable': { label: 'Not Yet Applicable', color: 'yellow' },
        'partially-applicable': { label: 'Partially Applicable', color: 'orange' },
    };

    return statusMap[status] || { label: 'Unknown', color: 'gray' };
}

export default LEGISLATION_METADATA;
