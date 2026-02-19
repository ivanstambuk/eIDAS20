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
    border: 'CCCCCC',        // Border color
    altRow: 'F8F9FA',        // Alternating row
    // RFC 2119 Obligation colors
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
    // RFC 2119 Obligation styles
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
        font: { sz: 10, color: { rgb: COLORS.mayText } },
        fill: { fgColor: { rgb: COLORS.may } },
        border: createBorder(),
        alignment: { horizontal: 'center', vertical: 'center' },
    },
};

// ============================================================================
// Helper Functions
// ============================================================================



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

/**
 * Get ARF HLR specification text from arfData
 */
function getArfSpecification(req, arfData) {
    if (!req.arfReference?.hlr || !arfData) return '';
    const hlrIds = Array.isArray(req.arfReference.hlr)
        ? req.arfReference.hlr
        : [req.arfReference.hlr];

    const specs = hlrIds
        .map(id => (arfData.byHarmonizedId?.[id] || arfData.byHlrId?.[id])?.specification || '')
        .filter(s => s)
        .join('\n\n');
    return specs;
}

/**
 * Get ARF HLR notes from arfData
 */
function getArfNotes(req, arfData) {
    if (!req.arfReference?.hlr || !arfData) return '';
    const hlrIds = Array.isArray(req.arfReference.hlr)
        ? req.arfReference.hlr
        : [req.arfReference.hlr];

    const notes = hlrIds
        .map(id => (arfData.byHarmonizedId?.[id] || arfData.byHlrId?.[id])?.notes || '')
        .filter(n => n)
        .join('\n\n');
    return notes;
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

function formatDeploymentArchitectures(req) {
    if (!req.deploymentArchitectures || req.deploymentArchitectures.length === 0) return 'All';
    return req.deploymentArchitectures.map(a =>
        a === 'intermediary' ? 'Intermediary' :
            a === 'direct_saas' ? 'Direct SaaS' :
                a === 'direct_onprem' ? 'Direct Self-Hosted' : a
    ).join(', ');
}

/**
 * Normalize YAML block scalar text for Excel export.
 * 
 * ⚠️ YAML block scalars (|) preserve literal line breaks from the source file.
 * Without normalization, multi-line YAML strings appear with awkward mid-sentence
 * breaks in Excel cells (e.g., "...must register as a Relying Party with\n
 * Member State authorities...").
 * 
 * This function:
 * 1. Removes markdown formatting (**bold**, *italic*)
 * 2. Preserves intentional paragraph breaks (double newlines)
 * 3. Converts single newlines to spaces (prose continuation)
 * 4. Cleans up any resulting double spaces
 * 
 * @see .agent/snippets/text-processing.md for reusable pattern
 */
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove **bold**
        .replace(/\*([^*]+)\*/g, '$1')      // Remove *italic*
        .replace(/\n\s*\n/g, '\n\n')        // Preserve paragraph breaks (double newline)
        .replace(/(?<!\n)\n(?!\n)/g, ' ')   // Convert single newlines to spaces
        .replace(/  +/g, ' ')               // Collapse multiple spaces
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
 * @param {Array} options.selectedRoles - Selected role IDs
 * @param {Array} options.selectedCategories - Selected product category IDs
 * @param {Object} options.data - VCQ data object with categories
 * @param {string} [options.categorizationScheme] - Active scheme ('functional' or 'role')
 * @param {Array} [options.effectiveCategories] - Categories to use for grouping
 * @param {Function} [options.getReqCategory] - Function to get category for a requirement
 * @param {Object} [options.arfData] - ARF HLR data for specification/notes lookup
 * @param {Object} [options.clarificationQuestions] - Clarification questions keyed by requirement ID
 */
export function exportToExcel({ requirements, selectedRoles, selectedCategories, data, categorizationScheme, effectiveCategories, getReqCategory, arfData, clarificationQuestions, dataMeta }) {
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
    // Columns grouped logically:
    //   Core: ID, Category, Requirement, Explanation, Obligation
    //   Context: Deadline, Roles, Product Categories
    //   Legal: Legal Basis, Legal Text
    //   ARF: ARF Reference, ARF Specification, ARF Notes

    const headers = [
        'ID',
        'Category',
        'Requirement',
        'Explanation',
        'Clarification Questions',
        'Obligation',
        'Vendor Compliance',
        'Evidence',
        'Deadline',
        'Roles',
        'Product Categories',
        'Deployment Architecture',
        'Legal Basis',
        'Legal Text',
        'ARF Reference',
        'ARF Specification',
        'ARF Notes',
    ];

    const sheetData = [];

    // Add data version subtitle row if available
    if (dataMeta?.contentHash) {
        const versionRow = Array(headers.length).fill({ v: '', s: {} });
        versionRow[0] = { v: `Dataset fingerprint: ${dataMeta.contentHash} · Built ${dataMeta.buildDate || ''}`, s: { font: { sz: 9, italic: true, color: { rgb: '888888' } } } };
        sheetData.push(versionRow);
    }

    sheetData.push(headers.map(h => ({ v: h, s: STYLES.header })));

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
            const isAlt = rowIndex % 2 === 1;
            const cellStyle = isAlt ? STYLES.cellAlt : STYLES.cell;

            // Format clarification questions: one per line, just the text (no dimension)
            const reqQuestions = clarificationQuestions?.[req.id] || [];
            const questionsText = reqQuestions
                .map((q, i) => `${i + 1}. ${q.text}`)
                .join('\n');

            sheetData.push([
                { v: req.id, s: cellStyle },
                { v: cat.label || cat.id, s: cellStyle },
                { v: req.requirement, s: cellStyle },
                { v: cleanText(req.explanation), s: cellStyle },
                { v: questionsText, s: cellStyle },
                { v: req.obligation || 'SHOULD', s: getObligationStyle(req.obligation) },
                { v: '', s: cellStyle },  // Vendor Compliance (empty — to be filled by vendor)
                { v: '', s: cellStyle },  // Evidence (empty — to be filled by vendor)
                { v: req.deadline || '', s: cellStyle },
                { v: formatRoles(req), s: cellStyle },
                { v: formatProductCategories(req), s: cellStyle },
                { v: formatDeploymentArchitectures(req), s: cellStyle },
                { v: formatLegalBasis(req), s: cellStyle },
                { v: cleanText(req.legalText), s: cellStyle },
                { v: formatArfReference(req), s: cellStyle },
                { v: cleanText(getArfSpecification(req, arfData)), s: cellStyle },
                { v: cleanText(getArfNotes(req, arfData)), s: cellStyle },
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
        { wch: 50 },  // Explanation
        { wch: 60 },  // Clarification Questions
        { wch: 12 },  // Obligation
        { wch: 20 },  // Vendor Compliance
        { wch: 30 },  // Evidence
        { wch: 12 },  // Deadline
        { wch: 12 },  // Roles
        { wch: 18 },  // Product Categories
        { wch: 20 },  // Deployment Architecture
        { wch: 22 },  // Legal Basis
        { wch: 50 },  // Legal Text
        { wch: 22 },  // ARF Reference
        { wch: 50 },  // ARF Specification
        { wch: 40 },  // ARF Notes
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
