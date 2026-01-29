/**
 * Excel Export Utility for VCQ
 * 
 * Uses xlsx-js-style for professional formatting with colors, borders, and styling.
 * Mirrors the RCA export format for consistency.
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
    title: {
        font: { bold: true, sz: 16, color: { rgb: COLORS.headerBg } },
        alignment: { horizontal: 'left' },
    },
    subtitle: {
        font: { sz: 11, color: { rgb: '666666' } },
        alignment: { horizontal: 'left' },
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
    obligationMust: {
        font: { sz: 10, bold: true, color: { rgb: COLORS.mustText } },
        fill: { fgColor: { rgb: COLORS.must } },
        border: createBorder(),
        alignment: { horizontal: 'center', vertical: 'center' },
    },
    obligationShould: {
        font: { sz: 10, bold: true, color: { rgb: COLORS.shouldText } },
        fill: { fgColor: { rgb: COLORS.should } },
        border: createBorder(),
        alignment: { horizontal: 'center', vertical: 'center' },
    },
    obligationMay: {
        font: { sz: 10, bold: true, color: { rgb: COLORS.mayText } },
        fill: { fgColor: { rgb: COLORS.may } },
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
        case 'compliant': return '✅ Compliant';
        case 'non_compliant': return '❌ Non-Compliant';
        case 'partial': return '⚠️ Partial';
        case 'na': return '➖ N/A';
        default: return '⏳ Pending';
    }
}

function getObligationStyle(obligation) {
    switch (obligation) {
        case 'MUST':
        case 'MUST NOT':
            return STYLES.obligationMust;
        case 'SHOULD':
        case 'SHOULD NOT':
            return STYLES.obligationShould;
        case 'MAY':
            return STYLES.obligationMay;
        default:
            return STYLES.cell;
    }
}

function formatLegalBasis(req) {
    if (!req.legalBasis) return '';
    const parts = [req.legalBasis.article];
    if (req.legalBasis.paragraph) parts.push(req.legalBasis.paragraph);
    parts.push(`(Reg. ${req.legalBasis.regulation})`);
    return parts.join(' ');
}

function formatArfReference(req) {
    if (!req.arfReference) return '';
    const hlrs = Array.isArray(req.arfReference.hlr)
        ? req.arfReference.hlr.join(', ')
        : req.arfReference.hlr || '';
    return `${req.arfReference.topic}: ${hlrs}`;
}

// ============================================================================
// Export Function
// ============================================================================

/**
 * Export VCQ data to Excel with professional formatting
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

    // Map role/category IDs to labels
    const roleLabels = selectedRoles.map(r =>
        r === 'relying_party' ? 'Relying Party' :
            r === 'issuer' ? 'Issuer' : r
    );
    const categoryLabels = selectedCategories.map(c =>
        c === 'connector' ? 'Connector' :
            c === 'issuance_platform' ? 'Issuance Platform' :
                c === 'trust_services' ? 'Trust Services' : c
    );

    // ========================================
    // Sheet 1: Summary
    // ========================================
    const summaryData = [
        [{ v: 'Vendor Compliance Questionnaire', s: STYLES.title }],
        [{ v: `Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, s: STYLES.subtitle }],
        [],
        [{ v: 'Roles:', s: { font: { bold: true } } }, { v: roleLabels.join(', ') || 'All' }],
        [{ v: 'Product Categories:', s: { font: { bold: true } } }, { v: categoryLabels.join(', ') || 'All' }],
        [{ v: 'Total Requirements:', s: { font: { bold: true } } }, { v: requirements.length }],
        [],
        [{ v: 'Status Summary', s: { font: { bold: true, sz: 12 } } }],
    ];

    // Calculate status counts
    const statusCounts = { compliant: 0, non_compliant: 0, partial: 0, na: 0, pending: 0 };
    requirements.forEach(req => {
        const status = answers[req.id]?.value || 'pending';
        statusCounts[status]++;
    });

    summaryData.push(
        [{ v: '✅ Compliant:', s: STYLES.statusCompliant }, { v: statusCounts.compliant }],
        [{ v: '❌ Non-Compliant:', s: STYLES.statusNonCompliant }, { v: statusCounts.non_compliant }],
        [{ v: '⚠️ Partial:', s: STYLES.statusPartial }, { v: statusCounts.partial }],
        [{ v: '➖ N/A:', s: STYLES.statusNA }, { v: statusCounts.na }],
        [{ v: '⏳ Pending:', s: STYLES.statusPending }, { v: statusCounts.pending }],
    );

    // Add obligation breakdown
    summaryData.push(
        [],
        [{ v: 'Obligation Breakdown', s: { font: { bold: true, sz: 12 } } }],
    );
    const obligationCounts = { MUST: 0, 'MUST NOT': 0, SHOULD: 0, 'SHOULD NOT': 0, MAY: 0 };
    requirements.forEach(req => {
        if (obligationCounts[req.obligation] !== undefined) {
            obligationCounts[req.obligation]++;
        }
    });
    summaryData.push(
        [{ v: 'MUST:', s: STYLES.obligationMust }, { v: obligationCounts.MUST }],
        [{ v: 'SHOULD:', s: STYLES.obligationShould }, { v: obligationCounts.SHOULD }],
        [{ v: 'MAY:', s: STYLES.obligationMay }, { v: obligationCounts.MAY }],
    );

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // ========================================
    // Sheet 2: Requirements
    // ========================================
    const reqHeaders = ['ID', 'Category', 'Requirement', 'Obligation', 'Legal Basis', 'ARF Reference', 'Status'];
    const reqData = [
        reqHeaders.map(h => ({ v: h, s: STYLES.header })),
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

            reqData.push([
                { v: req.id, s: cellStyle },
                { v: cat.label || cat.id, s: cellStyle },
                { v: req.requirement, s: cellStyle },
                { v: req.obligation || 'SHOULD', s: getObligationStyle(req.obligation) },
                { v: formatLegalBasis(req), s: cellStyle },
                { v: formatArfReference(req), s: cellStyle },
                { v: getStatusLabel(answer), s: getStatusStyle(answer) },
            ]);
            rowIndex++;
        });
    });

    const wsRequirements = XLSX.utils.aoa_to_sheet(reqData);
    wsRequirements['!cols'] = [
        { wch: 14 },  // ID
        { wch: 18 },  // Category
        { wch: 50 },  // Requirement
        { wch: 12 },  // Obligation
        { wch: 22 },  // Legal Basis
        { wch: 25 },  // ARF Reference
        { wch: 15 },  // Status
    ];
    wsRequirements['!freeze'] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(wb, wsRequirements, 'Requirements');

    // ========================================
    // Sheet 3: Legal References
    // ========================================
    const legalHeaders = ['ID', 'Requirement', 'Legal Text', 'Explanation'];
    const legalData = [
        legalHeaders.map(h => ({ v: h, s: STYLES.header })),
    ];

    requirements.forEach((req, idx) => {
        const isAlt = idx % 2 === 1;
        const cellStyle = isAlt ? STYLES.cellAlt : STYLES.cell;

        legalData.push([
            { v: req.id, s: cellStyle },
            { v: req.requirement, s: cellStyle },
            { v: req.legalText || '', s: cellStyle },
            { v: req.explanation || '', s: cellStyle },
        ]);
    });

    const wsLegal = XLSX.utils.aoa_to_sheet(legalData);
    wsLegal['!cols'] = [
        { wch: 14 },  // ID
        { wch: 40 },  // Requirement
        { wch: 60 },  // Legal Text
        { wch: 50 },  // Explanation
    ];
    XLSX.utils.book_append_sheet(wb, wsLegal, 'Legal References');

    // ========================================
    // Generate and download
    // ========================================
    const roleSlug = roleLabels.length > 0 ? roleLabels.join('_').replace(/\s+/g, '') : 'All';
    const filename = `VCQ_${roleSlug}_${dateStr}.xlsx`;
    XLSX.writeFile(wb, filename);

    return { filename, date: now.toISOString() };
}

export default exportToExcel;
