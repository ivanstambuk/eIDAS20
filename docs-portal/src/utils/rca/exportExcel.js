/**
 * Excel Export Utility for RCA
 * 
 * Uses xlsx-js-style for professional formatting with colors, borders, and styling.
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

function formatLegalBasis(req) {
    if (!req.legalBasis) return '';
    const parts = [req.legalBasis.article];
    if (req.legalBasis.paragraph) parts.push(req.legalBasis.paragraph);
    parts.push(`(Reg. ${req.legalBasis.regulation})`);
    return parts.join(' ');
}

// ============================================================================
// Export Function
// ============================================================================

/**
 * Export RCA data to Excel with professional formatting
 * 
 * @param {Object} options
 * @param {Array} options.requirements - Filtered requirements to export
 * @param {Object} options.assessments - User's assessment status per requirement
 * @param {string} options.role - Selected role label
 * @param {Array} options.useCases - Selected use case names
 * @param {Array} options.requirementCategories - Category metadata
 */
export function exportToExcel({ requirements, assessments, role, useCases, requirementCategories }) {
    const wb = XLSX.utils.book_new();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // ========================================
    // Sheet 1: Summary
    // ========================================
    const summaryData = [
        [{ v: 'Regulatory Compliance Assessment', s: STYLES.title }],
        [{ v: `Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, s: STYLES.subtitle }],
        [],
        [{ v: 'Role:', s: { font: { bold: true } } }, { v: role }],
        [{ v: 'Use Cases:', s: { font: { bold: true } } }, { v: useCases.join(', ') }],
        [{ v: 'Total Requirements:', s: { font: { bold: true } } }, { v: requirements.length }],
        [],
        [{ v: 'Status Summary', s: { font: { bold: true, sz: 12 } } }],
    ];

    // Calculate status counts
    const statusCounts = { compliant: 0, non_compliant: 0, partial: 0, na: 0, pending: 0 };
    requirements.forEach(req => {
        const status = assessments[req.id]?.status || 'pending';
        statusCounts[status]++;
    });

    summaryData.push(
        [{ v: '✅ Compliant:', s: STYLES.statusCompliant }, { v: statusCounts.compliant }],
        [{ v: '❌ Non-Compliant:', s: STYLES.statusNonCompliant }, { v: statusCounts.non_compliant }],
        [{ v: '⚠️ Partial:', s: STYLES.statusPartial }, { v: statusCounts.partial }],
        [{ v: '➖ N/A:', s: STYLES.statusNA }, { v: statusCounts.na }],
        [{ v: '⏳ Pending:', s: STYLES.statusPending }, { v: statusCounts.pending }],
    );

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // ========================================
    // Sheet 2: Requirements
    // ========================================
    const reqHeaders = ['ID', 'Category', 'Requirement', 'Legal Basis', 'Status', 'Notes'];
    const reqData = [
        reqHeaders.map(h => ({ v: h, s: STYLES.header })),
    ];

    // Group by category
    const grouped = {};
    requirements.forEach(req => {
        if (!grouped[req.category]) grouped[req.category] = [];
        grouped[req.category].push(req);
    });

    // Sort categories by order
    const sortedCategories = requirementCategories
        .filter(cat => grouped[cat.id])
        .sort((a, b) => a.order - b.order);

    let rowIndex = 0;
    sortedCategories.forEach(cat => {
        grouped[cat.id].forEach(req => {
            const assessment = assessments[req.id] || { status: 'pending', notes: '' };
            const isAlt = rowIndex % 2 === 1;
            const cellStyle = isAlt ? STYLES.cellAlt : STYLES.cell;

            reqData.push([
                { v: req.id, s: cellStyle },
                { v: cat.label, s: cellStyle },
                { v: req.requirement, s: cellStyle },
                { v: formatLegalBasis(req), s: cellStyle },
                { v: getStatusLabel(assessment.status), s: getStatusStyle(assessment.status) },
                { v: assessment.notes || '', s: cellStyle },
            ]);
            rowIndex++;
        });
    });

    const wsRequirements = XLSX.utils.aoa_to_sheet(reqData);
    wsRequirements['!cols'] = [
        { wch: 12 },  // ID
        { wch: 20 },  // Category
        { wch: 50 },  // Requirement
        { wch: 25 },  // Legal Basis
        { wch: 15 },  // Status
        { wch: 40 },  // Notes
    ];
    // Freeze header row
    wsRequirements['!freeze'] = { xSplit: 0, ySplit: 1 };
    XLSX.utils.book_append_sheet(wb, wsRequirements, 'Requirements');

    // ========================================
    // Sheet 3: Legal References
    // ========================================
    const legalHeaders = ['ID', 'Requirement', 'Legal Text'];
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
        ]);
    });

    const wsLegal = XLSX.utils.aoa_to_sheet(legalData);
    wsLegal['!cols'] = [
        { wch: 12 },  // ID
        { wch: 40 },  // Requirement
        { wch: 80 },  // Legal Text
    ];
    XLSX.utils.book_append_sheet(wb, wsLegal, 'Legal References');

    // ========================================
    // Generate and download
    // ========================================
    const filename = `RCA_${role.replace(/\s+/g, '_')}_${dateStr}.xlsx`;
    XLSX.writeFile(wb, filename);

    return { filename, date: now.toISOString() };
}

export default exportToExcel;
