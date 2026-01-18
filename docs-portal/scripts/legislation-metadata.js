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
        consolidatedSlug: '2014-910',         // Portal slug for consolidated version
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

    // =========================================================================
    // REPEALED REGULATIONS (historical references)
    // =========================================================================

    // Community Customs Code (repealed by Union Customs Code)
    '31992R2913': {
        humanName: 'Community Customs Code',
        abbreviation: null,
        entryIntoForce: '1992-10-22',
        status: 'repealed',
        category: 'regulation',
        repealedBy: '32013R0952',
    },

    // Product Safety Checks (repealed by Accreditation Regulation)
    '31993R0339': {
        humanName: 'Product Safety Checks for Imports',
        abbreviation: null,
        entryIntoForce: '1993-02-18',
        status: 'repealed',
        category: 'regulation',
        repealedBy: '32008R0765',
    },

    // Protection of EU Financial Interests
    '31995R2988': {
        humanName: 'Protection of EU Financial Interests',
        abbreviation: 'PIF Regulation',
        entryIntoForce: '1995-12-22',
        status: 'in-force',
        category: 'regulation',
    },

    // OLAF Investigations (repealed)
    '31999R1073': {
        humanName: 'OLAF Investigations Regulation',
        abbreviation: null,
        entryIntoForce: '1999-06-01',
        status: 'repealed',
        category: 'regulation',
        repealedBy: '32013R0883',
    },

    // Data Protection for EU Institutions (repealed by 2018/1725)
    '32001R0045': {
        humanName: 'Data Protection for EU Institutions',
        abbreviation: null,
        entryIntoForce: '2001-02-01',
        status: 'repealed',
        category: 'regulation',
        repealedBy: '32018R1725',
    },

    // EDPS Duties (repealed by 2018/1725)
    '32002D1247': {
        humanName: 'European Data Protection Supervisor Duties',
        abbreviation: null,
        entryIntoForce: '2002-07-11',
        status: 'repealed',
        category: 'decision',
        repealedBy: '32018R1725',
    },

    // Financial Regulation (repealed)
    '32002R1605': {
        humanName: 'Financial Regulation',
        abbreviation: null,
        entryIntoForce: '2002-08-01',
        status: 'repealed',
        category: 'regulation',
        repealedBy: '32012R0966',
    },

    // Financial Regulation Implementing Rules (repealed)
    '32002R2342': {
        humanName: 'Financial Regulation Implementing Rules',
        abbreviation: null,
        entryIntoForce: '2003-01-01',
        status: 'repealed',
        category: 'regulation',
        repealedBy: '32012R1268',
    },

    // Excise Duties Administrative Cooperation (repealed)
    '32004R2073': {
        humanName: 'Excise Duties Administrative Cooperation',
        abbreviation: null,
        entryIntoForce: '2004-12-01',
        status: 'repealed',
        category: 'regulation',
        repealedBy: '32012R0389',
    },

    // European Standardisation Financing (repealed)
    '32006D1673': {
        humanName: 'European Standardisation Financing',
        abbreviation: null,
        entryIntoForce: '2006-11-24',
        status: 'repealed',
        category: 'decision',
        repealedBy: '32012R1025',
    },

    // ENISA Regulation (repealed by Cybersecurity Act)
    '32013R0526': {
        humanName: 'ENISA Regulation',
        abbreviation: null,
        entryIntoForce: '2013-06-19',
        status: 'repealed',
        category: 'regulation',
        repealedBy: '32019R0881',
    },

    // eIDAS Cooperation Procedures (repealed)
    '32015D0296': {
        humanName: 'eIDAS Cooperation Procedures',
        abbreviation: null,
        entryIntoForce: '2015-03-06',
        status: 'repealed',
        category: 'decision',
        repealedBy: '32025R1568',
    },

    // Business Registers Interconnection (repealed)
    '32020R2244': {
        humanName: 'Business Registers Interconnection System',
        abbreviation: 'BRIS',
        entryIntoForce: '2021-01-01',
        status: 'repealed',
        category: 'regulation',
        repealedBy: '32021R1042',
    },

    // =========================================================================
    // REPEALED DIRECTIVES
    // =========================================================================

    // Technical Standards Notification (repealed)
    '31998L0034': {
        humanName: 'Technical Standards Notification Directive',
        abbreviation: null,
        entryIntoForce: '1998-08-10',
        status: 'repealed',
        category: 'directive',
        repealedBy: '32015L1535',
    },

    // General Product Safety (repealed by GPSR)
    '32001L0095': {
        humanName: 'General Product Safety Directive',
        abbreviation: 'GPSD',
        entryIntoForce: '2002-01-15',
        status: 'repealed',
        category: 'directive',
        repealedBy: '32023R0988',
    },

    // Old Public Procurement Directive (repealed)
    '32004L0018': {
        humanName: 'Public Procurement Directive (2004)',
        abbreviation: null,
        entryIntoForce: '2004-04-30',
        status: 'repealed',
        category: 'directive',
        repealedBy: '32014L0024',
    },

    // Payment Services Directive 1 (repealed by PSD2)
    '32007L0064': {
        humanName: 'Payment Services Directive',
        abbreviation: 'PSD1',
        entryIntoForce: '2007-12-25',
        status: 'repealed',
        category: 'directive',
        repealedBy: '32015L2366',
    },

    // =========================================================================
    // ACTIVE DIRECTIVES
    // =========================================================================

    // e-Commerce Directive
    '32000L0031': {
        humanName: 'e-Commerce Directive',
        abbreviation: null,
        entryIntoForce: '2000-07-17',
        status: 'in-force',
        category: 'directive',
    },

    // e-Privacy Directive
    '32002L0058': {
        humanName: 'e-Privacy Directive',
        abbreviation: 'ePD',
        entryIntoForce: '2002-07-31',
        status: 'in-force',
        category: 'directive',
    },

    // Payment Services Directive 2
    '32015L2366': {
        humanName: 'Payment Services Directive 2',
        abbreviation: 'PSD2',
        entryIntoForce: '2016-01-12',
        status: 'in-force',
        category: 'directive',
    },

    // =========================================================================
    // DIGITAL & TECH REGULATIONS (2022+)
    // =========================================================================

    // Digital Markets Act
    '32022R1925': {
        humanName: 'Digital Markets Act',
        abbreviation: 'DMA',
        entryIntoForce: '2022-11-01',
        status: 'in-force',
        category: 'regulation',
    },

    // Digital Services Act
    '32022R2065': {
        humanName: 'Digital Services Act',
        abbreviation: 'DSA',
        entryIntoForce: '2022-11-16',
        status: 'in-force',
        category: 'regulation',
    },

    // Market Surveillance Regulation
    '32019R1020': {
        humanName: 'Market Surveillance Regulation',
        abbreviation: null,
        entryIntoForce: '2021-07-16',
        status: 'in-force',
        category: 'regulation',
    },

    // ID Cards and Residence Documents (invalidated, replaced by 2025/1208)
    '32019R1157': {
        humanName: 'ID Cards and Residence Documents Security',
        abbreviation: null,
        entryIntoForce: '2019-08-02',
        status: 'repealed',
        category: 'regulation',
        repealedBy: '32025R1208',
    },

    // =========================================================================
    // FINANCIAL REGULATIONS
    // =========================================================================

    // European Banking Authority
    '32010R1093': {
        humanName: 'European Banking Authority Regulation',
        abbreviation: 'EBA Regulation',
        entryIntoForce: '2011-01-01',
        status: 'in-force',
        category: 'regulation',
    },

    // Comitology Regulation
    '32011R0182': {
        humanName: 'Comitology Regulation',
        abbreviation: null,
        entryIntoForce: '2011-03-01',
        status: 'in-force',
        category: 'regulation',
    },

    // Excise Duties Administrative Cooperation (current)
    '32012R0389': {
        humanName: 'Excise Duties Administrative Cooperation',
        abbreviation: 'EMCS Regulation',
        entryIntoForce: '2012-07-01',
        status: 'in-force',
        category: 'regulation',
    },

    // EMIR - Derivatives and CCPs
    '32012R0648': {
        humanName: 'European Market Infrastructure Regulation',
        abbreviation: 'EMIR',
        entryIntoForce: '2012-08-16',
        status: 'in-force',
        category: 'regulation',
    },

    // EMIR Reporting Standards
    '32022R1860': {
        humanName: 'EMIR Reporting Technical Standards',
        abbreviation: null,
        entryIntoForce: '2024-04-29',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    // =========================================================================
    // INTERNAL MARKET & ADMINISTRATIVE COOPERATION
    // =========================================================================

    // Public Access to Documents
    '32001R1049': {
        humanName: 'Public Access to Documents Regulation',
        abbreviation: null,
        entryIntoForce: '2001-12-03',
        status: 'in-force',
        category: 'regulation',
    },

    // Product Marketing Framework (NLF)
    '32008D0768': {
        humanName: 'Common Framework for Marketing of Products',
        abbreviation: 'NLF Decision',
        entryIntoForce: '2008-08-13',
        status: 'in-force',
        category: 'decision',
    },

    // Internal Market Information System
    '32012R1024': {
        humanName: 'Internal Market Information System',
        abbreviation: 'IMI Regulation',
        entryIntoForce: '2012-11-04',
        status: 'in-force',
        category: 'regulation',
    },

    // European Standardisation
    '32012R1025': {
        humanName: 'European Standardisation Regulation',
        abbreviation: null,
        entryIntoForce: '2013-01-01',
        status: 'in-force',
        category: 'regulation',
    },

    // Quality Schemes (PDO/PGI)
    '32012R1151': {
        humanName: 'Quality Schemes for Agricultural Products',
        abbreviation: 'PDO/PGI Regulation',
        entryIntoForce: '2013-01-03',
        status: 'in-force',
        category: 'regulation',
    },

    // Customs Enforcement of IPR
    '32013R0608': {
        humanName: 'Customs Enforcement of Intellectual Property Rights',
        abbreviation: null,
        entryIntoForce: '2014-01-01',
        status: 'in-force',
        category: 'regulation',
    },

    // Customs IPR Forms
    '32013R1352': {
        humanName: 'Customs Enforcement IPR Application Forms',
        abbreviation: null,
        entryIntoForce: '2014-01-07',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    // Data Protection for EU Institutions (current)
    '32018R1725': {
        humanName: 'Data Protection for EU Institutions',
        abbreviation: 'EUDPR',
        entryIntoForce: '2018-12-11',
        status: 'in-force',
        category: 'regulation',
    },

    // Business Registers Interconnection (current)
    '32021R1042': {
        humanName: 'Business Registers Interconnection System',
        abbreviation: 'BRIS',
        entryIntoForce: '2021-07-14',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    // =========================================================================
    // eIDAS RELATED DECISIONS (Historical/Active)
    // =========================================================================

    // Trusted Lists Technical Specifications
    '32015D1505': {
        humanName: 'Trusted Lists Technical Specifications',
        abbreviation: null,
        entryIntoForce: '2015-09-28',
        status: 'in-force',
        category: 'decision',
        subcategory: 'implementing',
    },

    // eIDAS Notification Procedures
    '32015D1984': {
        humanName: 'eIDAS Notification Procedures',
        abbreviation: null,
        entryIntoForce: '2015-11-23',
        status: 'in-force',
        category: 'decision',
        subcategory: 'implementing',
    },

    // eIDAS Interoperability Framework
    '32015R1501': {
        humanName: 'eIDAS Interoperability Framework',
        abbreviation: null,
        entryIntoForce: '2015-09-28',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    // eIDAS Assurance Levels
    '32015R1502': {
        humanName: 'eIDAS Assurance Levels',
        abbreviation: null,
        entryIntoForce: '2015-09-28',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    // =========================================================================
    // RECOMMENDATIONS (Non-binding)
    // =========================================================================

    // EU Digital Identity Toolbox
    '32021H0946': {
        humanName: 'EU Digital Identity Toolbox Recommendation',
        abbreviation: 'EUDIW Toolbox',
        entryIntoForce: '2021-06-03',
        status: 'in-force',
        category: 'recommendation',
    },

    // =========================================================================
    // 2022-2024 CYBERSECURITY & DIGITAL REGULATIONS
    // =========================================================================

    // European Common Criteria Cybersecurity Certification (EUCC)
    '32024R0482': {
        humanName: 'European Cybersecurity Certification Scheme',
        abbreviation: 'EUCC',
        entryIntoForce: '2024-02-07',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    // Interoperable Europe Act
    '32024R0903': {
        humanName: 'Interoperable Europe Act',
        abbreviation: 'IEA',
        entryIntoForce: '2024-04-11',
        status: 'in-force',
        category: 'regulation',
    },

    // Geographical Indications Regulation
    '32024R1143': {
        humanName: 'Geographical Indications Regulation',
        abbreviation: 'GI Regulation',
        entryIntoForce: '2024-05-13',
        status: 'in-force',
        category: 'regulation',
    },

    // NIS2 Implementing Regulation
    '32024R2690': {
        humanName: 'NIS2 Implementing Regulation',
        abbreviation: null,
        entryIntoForce: '2024-11-07',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    // Cyber Resilience Act
    '32024R2847': {
        humanName: 'Cyber Resilience Act',
        abbreviation: 'CRA',
        entryIntoForce: '2024-12-10',
        status: 'not-yet-applicable',
        category: 'regulation',
    },

    // EUCC Amendment
    '32024R3144': {
        humanName: 'EUCC Amendment',
        abbreviation: null,
        entryIntoForce: '2024-12-19',
        status: 'in-force',
        category: 'regulation',
        subcategory: 'implementing',
    },

    // =========================================================================
    // HISTORIC/OBSCURE (Low priority - minimal information available)
    // =========================================================================

    // Butter Buying-In Suspension (1995) - agricultural decision
    '31995D0087': {
        humanName: 'Butter Buying-In Suspension',
        abbreviation: null,
        entryIntoForce: '1995-03-22',
        status: 'repealed',
        category: 'decision',
    },

    // =========================================================================
    // MALFORMED CELEX (typos in source documents or extraction errors)
    // =========================================================================

    // Typo in EUR-Lex 2024/3144 - should be 2024/482 (EUCC)
    '32024R4822': {
        humanName: 'EUCC (typo: should be 2024/482)',
        abbreviation: null,
        entryIntoForce: null,
        status: 'unknown',
        category: 'regulation',
    },

    // Malformed extraction - should be 31995R2988 (Protection of EU Financial Interests)
    '32988R0095': {
        humanName: 'PIF Regulation (malformed CELEX)',
        abbreviation: null,
        entryIntoForce: null,
        status: 'unknown',
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
 * 
 * Available statuses:
 * - 'in-force'             → Green badge
 * - 'repealed'             → Red badge
 * - 'not-yet-applicable'   → Yellow badge
 * - 'partially-applicable' → Orange badge
 * - (unknown/null)         → Gray badge
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

/**
 * Get category display info for external citations.
 * Shows document type badge for non-regulation documents.
 * 
 * @param {string} category - Category code
 * @returns {{ label: string, color: string, show: boolean }}
 * 
 * Available categories:
 * - 'regulation'     → No badge (default, most common)
 * - 'directive'      → Blue badge (requires transposition)
 * - 'decision'       → Purple badge (binding on addressees)
 * - 'recommendation' → Cyan badge (non-binding soft law)
 */
export function getCategoryDisplay(category) {
    const categoryMap = {
        'regulation': { label: 'Regulation', color: 'green', show: false },
        'directive': { label: 'Directive', color: 'blue', show: true },
        'decision': { label: 'Decision', color: 'purple', show: true },
        'recommendation': { label: 'Recommendation', color: 'cyan', show: true },
    };

    return categoryMap[category] || { label: category, color: 'gray', show: false };
}

export default LEGISLATION_METADATA;

