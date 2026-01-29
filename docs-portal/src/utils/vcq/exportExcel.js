/**
 * Excel Export Utility for VCQ
 * 
 * Uses xlsx-js-style for professional formatting with colors, borders, and styling.
 * Single comprehensive sheet with all requirement data including legal text.
 */

import XLSX from 'xlsx-js-style';

// ============================================================================
// Style Definitions
// ============================================================================

const COLORS = {
    headerBg: '1E3A5F',      // Dark blue
    headerText: 'FFFFFF',    // White
    compliant: 'D4EDDA',     // Light green
    compliantText: '155724', // Dark green
    nonCompliant: 'F8D7DA',  // Light red
    nonCompliantText: '721C24', // Dark red
    partial: 'FFF3CD',       // Light yellow
    partialText: '856404',   // Dark yellow
    na: 'E2E3E5',            // Light gray
    naText: '383D41',        // Dark gray
    pending: 'E3F2FD',       // Light blue
    pendingText: '0D47A1',   // Dark blue
    border: 'CCCCCC',        // Border color
    altRow: 'F8F9FA',        // Alternating row
    must: 'FADBD8',          // Light red for MUST
    mustText: 'A93226',
    should: 'FEF9E7',        // Light yellow for SHOULD
    shouldText: '9A7D0A',
    may: 'D5F5E3',           // Light green for MAY
    mayText: '1E8449',
    critical: 'FADBD8',      // Same as MUST
    criticalText: 'A93226',
    high: 'FEF9E7',
    highText: '9A7D0A',
    medium: 'D5F5E3',
    mediumText: '1E8449',
    low: 'E2E3E5',
    lowText: '383D41',
};

const createBorder = () => ({
    top: { style: 'thin', color: { rgb: COLORS.border } },
    bottom: { style: 'thin', color: { rgb: COLORS.border } },
    left: { style: 'thin', color: { rgb: COLORS.border } },
    right: { style: 'thin', color: { rgb: COLORS.border } },
});

const STYLES = {
    header: {
        font: { bold: true, color: { rgb: COLORS.headerText }, sz: 11 },
        fill: { fgColor: { rgb: COLORS.headerBg } },
        border: createBorder(),
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    },
    cell: {
        font: { sz: 10 },
        border: createBorder(),
        alignment: { vertical: 'top', wrapText: true },
    },
    cellAlt: {
        font: { sz: 10 },
        fill: { fgColor: { rgb: COLORS.altRow } },
        border: createBorder(),
        alignment: { vertical: 'top', wrapText: true },
    },
    statusCompliant: {
        font: { sz: 10, bold: true, color: { rgb: COLORS.compliantText } },
        fill: { fgColor: { rgb: COLORS.compliant } },
        border: createBorder(),
        alignment: { horizontal: 'center', vertical: 'center' },
    },
    statusNonCompliant: {
        font: { sz: 10, bold: true, color: { rgb: COLORS.nonCompliantText } },
        fill: { fgColor: { rgb: COLORS.nonCompliant } },
        border: createBorder(),
        alignment: { horizontal: 'center', vertical: 'center' },
    },
    statusPartial: {
        font: { sz: 10, bold: true, color: { rgb: COLORS.partialText } },
        fill: { fgColor: { rgb: COLORS.partial } },
        border: createBorder(),
        alignment: { horizontal: 'center', vertical: 'center' },
    },
    statusNA: {
        font: { sz: 10, color: { rgb: COLORS.naText } },
        fill: { fgColor: { rgb: COLORS.na } },
        border: createBorder(),
        alignment: { horizontal: 'center', vertical: 'center' },
    },
    statusPending: {
        font: { sz: 10, color: { rgb: COLORS.pendingText } },
        fill: { fgColor: { rgb: COLORS.pending } },
        border: createBorder(),
        alignment: { horizontal: 'center', vertical: 'center' },
    },
    criticalityHigh: {
        font: { sz: 10, bold: true, color: { rgb: COLORS.criticalText } },
        fill: { fgColor: { rgb: COLORS.critical } },
        border: createBorder(),
        alignment: { horizontal: 'center', vertical: 'center' },
    },
    criticalityMedium: {
        font: { sz: 10, bold: true, color: { rgb: COLORS.highText } },
        fill: { fgColor: { rgb: COLORS.high } },
        border: createBorder(),
        alignment: { horizontal: 'center', vertical: 'center' },
    },
    criticalityLow: {
        font: { sz: 10, color: { rgb: COLORS.lowText } },
        fill: { fgColor: { rgb: COLORS.low } },
        border: createBorder(),
        alignment: { horizontal: 'center', vertical: 'center' },
    },
};

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusStyle(status) {
    switch (status) {
        case 'compliant': return STYLES.statusCompliant;
        case 'non_compliant': return STYLES.statusNonCompliant;
        case 'partial': return STYLES.statusPartial;
        case 'na': return STYLES.statusNA;
        default: return STYLES.statusPending;
    }
}

function getStatusLabel(status) {
    switch (status) {
        case 'compliant': return 'Compliant';
        case 'non_compliant': return 'Non-Compliant';
        case 'partial': return 'Partial';
        case 'na': return 'N/A';
        default: return 'Pending';
    }
}

function getCriticalityStyle(criticality) {
    const crit = (criticality || '').toLowerCase();
    if (crit.includes('critical')) return STYLES.criticalityHigh;
    if (crit.includes('high')) return STYLES.criticalityHigh;
    if (crit.includes('medium')) return STYLES.criticalityMedium;
    return STYLES.criticalityLow;
}

function formatCriticality(criticality) {
    if (!criticality) return '';
    const crit = criticality.toLowerCase();
    if (crit.includes('critical')) return 'Critical';
    if (crit.includes('high')) return 'High';
    if (crit.includes('medium')) return 'Medium';
    if (crit.includes('low')) return 'Low';
    return criticality;
}

function formatLegalBasis(req) {
    if (!req.legalBasis) return '';
    const parts = [];
    if (req.legalBasis.regulation) parts.push(`Reg. ${req.legalBasis.regulation}`);
    if (req.legalBasis.article) parts.push(req.legalBasis.article);
    if (req.legalBasis.paragraph) parts.push(`(${req.legalBasis.paragraph})`);
    return parts.join(' ');
}

function formatArfReference(req) {
    if (!req.arfReference) return '';
    const hlrs = Array.isArray(req.arfReference.hlr)
        ? req.arfReference.hlr.join(', ')
        : req.arfReference.hlr || '';
    return hlrs ? `${req.arfReference.topic}: ${hlrs}` : req.arfReference.topic || '';
}

function formatRoles(req) {
    if (!req.roles || req.roles.length === 0) return 'Universal';
    return req.roles.map(r =>
        r === 'relying_party' ? 'RP' :
            r === 'issuer' ? 'Issuer' : r
    ).join(', ');
}

function formatProductCategories(req) {
    if (!req.productCategories || req.productCategories.length === 0) return 'All';
    return req.productCategories.map(c =>
        c === 'connector' ? 'Connector' :
            c === 'issuance_platform' ? 'Issuance Platform' :
                c === 'trust_services' ? 'Trust Services' : c
    ).join(', ');
}

function cleanText(text) {
    if (!text) return '';
    // Remove markdown bold/italic markers and clean up whitespace
    return text
        .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove **bold**
        .replace(/\*([^*]+)\*/g, '$1')      // Remove *italic*
        .replace(/\n\s*\n/g, '\n')          // Collapse multiple newlines
        .trim();
}

// ============================================================================
// Export Function
// ============================================================================

/**
 * Export VCQ data to Excel with professional formatting - Single Sheet
 * 
 * @param {Object} options
 * @param {Array} options.requirements - Filtered requirements to export
 * @param {Object} options.answers - User's answer status per requirement
 * @param {Array} options.selectedRoles - Selected role IDs
 * @param {Array} options.selectedCategories - Selected product category IDs
 * @param {Object} options.data - VCQ data object with categories
 * @param {string} [options.categorizationScheme] - Active scheme ('functional' or 'role')
 * @param {Array} [options.effectiveCategories] - Categories to use for grouping
 * @param {Function} [options.getReqCategory] - Function to get category for a requirement
 */
export function exportToExcel({ requirements, answers, selectedRoles, selectedCategories, data, categorizationScheme, effectiveCategories, getReqCategory }) {
    const wb = XLSX.utils.book_new();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // Map role/category IDs to labels for filename
    const roleLabels = selectedRoles.map(r =>
        r === 'relying_party' ? 'Relying Party' :
            r === 'issuer' ? 'Issuer' : r
    );

    // ========================================
    // Single Comprehensive Sheet
    // ========================================
    // Columns: ID, Category, Requirement, Criticality, Deadline, Roles, Products, 
    //          Legal Basis, ARF Reference, Explanation, Legal Text, Notes, Status

    const headers = [
        'ID',
        'Category',
        'Requirement',
        'Criticality',
        'Deadline',
        'Roles',
        'Product Categories',
        'Legal Basis',
        'ARF Reference',
        'Explanation',
        'Legal Text',
        'Notes',
        'Status'
    ];

    const sheetData = [
        headers.map(h => ({ v: h, s: STYLES.header })),
    ];

    // Group by category (scheme-aware if getReqCategory provided, DEC-279)
    const grouped = {};
    requirements.forEach(req => {
        const catId = getReqCategory ? getReqCategory(req) : req.category;
        if (!grouped[catId]) grouped[catId] = [];
        grouped[catId].push(req);
    });

    // Use effectiveCategories if provided, otherwise fall back to data.categories
    const categories = effectiveCategories || data?.categories || [];
    const sortedCategories = categories
        .filter(cat => grouped[cat.id])
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Add any categories not in the config
    const configCatIds = new Set(categories.map(c => c.id));
    Object.keys(grouped).forEach(catId => {
        if (!configCatIds.has(catId)) {
            sortedCategories.push({ id: catId, label: catId });
        }
    });

    let rowIndex = 0;
    sortedCategories.forEach(cat => {
        if (!grouped[cat.id]) return;
        grouped[cat.id].forEach(req => {
            const answer = answers[req.id]?.value || 'pending';
            const isAlt = rowIndex % 2 === 1;
            const cellStyle = isAlt ? STYLES.cellAlt : STYLES.cell;

            sheetData.push([
                { v: req.id, s: cellStyle },
                { v: cat.label || cat.id, s: cellStyle },
                { v: req.requirement, s: cellStyle },
                { v: formatCriticality(req.criticality), s: getCriticalityStyle(req.criticality) },
                { v: req.deadline || '', s: cellStyle },
                { v: formatRoles(req), s: cellStyle },
                { v: formatProductCategories(req), s: cellStyle },
                { v: formatLegalBasis(req), s: cellStyle },
                { v: formatArfReference(req), s: cellStyle },
                { v: cleanText(req.explanation), s: cellStyle },
                { v: cleanText(req.legalText), s: cellStyle },
                { v: cleanText(req.notes), s: cellStyle },
                { v: getStatusLabel(answer), s: getStatusStyle(answer) },
            ]);
            rowIndex++;
        });
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    ws['!cols'] = [
        { wch: 14 },  // ID
        { wch: 16 },  // Category
        { wch: 45 },  // Requirement
        { wch: 10 },  // Criticality
        { wch: 12 },  // Deadline
        { wch: 12 },  // Roles
        { wch: 18 },  // Product Categories
        { wch: 22 },  // Legal Basis
        { wch: 22 },  // ARF Reference
        { wch: 50 },  // Explanation
        { wch: 50 },  // Legal Text
        { wch: 40 },  // Notes
        { wch: 14 },  // Status
    ];

    // Freeze header row
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    XLSX.utils.book_append_sheet(wb, ws, 'VCQ Requirements');

    // ========================================
    // Generate and download
    // ========================================
    const roleSlug = roleLabels.length > 0 ? roleLabels.join('_').replace(/\s+/g, '') : 'All';
    const filename = `VCQ_${roleSlug}_${dateStr}.xlsx`;
    XLSX.writeFile(wb, filename);

    return { filename, date: now.toISOString() };
}

export default exportToExcel;
