/**
 * Markdown Export Utility for RCA
 * 
 * Generates a clean Markdown document suitable for documentation and version control.
 */

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusEmoji(status) {
    switch (status) {
        case 'compliant': return '✅';
        case 'non_compliant': return '❌';
        case 'partial': return '⚠️';
        case 'na': return '➖';
        default: return '⏳';
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

function formatLegalBasis(req) {
    if (!req.legalBasis) return '—';
    const parts = [req.legalBasis.article];
    if (req.legalBasis.paragraph) parts.push(req.legalBasis.paragraph);
    parts.push(`(${req.legalBasis.regulation})`);
    return parts.join(' ');
}

function escapeMarkdown(text) {
    if (!text) return '';
    return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

// ============================================================================
// Export Function
// ============================================================================

/**
 * Export RCA data to Markdown format
 * 
 * @param {Object} options
 * @param {Array} options.requirements - Filtered requirements to export
 * @param {Object} options.assessments - User's assessment status per requirement
 * @param {string} options.role - Selected role label
 * @param {Array} options.useCases - Selected use case names
 * @param {Array} options.requirementCategories - Category metadata
 */
export function exportToMarkdown({ requirements, assessments, role, useCases, requirementCategories }) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // Calculate status counts
    const statusCounts = { compliant: 0, non_compliant: 0, partial: 0, na: 0, pending: 0 };
    requirements.forEach(req => {
        const status = assessments[req.id]?.status || 'pending';
        statusCounts[status]++;
    });

    // Build markdown content
    const lines = [];

    // Header
    lines.push('# Regulatory Compliance Assessment');
    lines.push('');
    lines.push(`**Generated:** ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`);
    lines.push(`**Role:** ${role}`);
    lines.push(`**Use Cases:** ${useCases.join(', ')}`);
    lines.push('');

    // Status Summary
    lines.push('## Status Summary');
    lines.push('');
    lines.push(`| Status | Count |`);
    lines.push(`|--------|-------|`);
    lines.push(`| ✅ Compliant | ${statusCounts.compliant} |`);
    lines.push(`| ❌ Non-Compliant | ${statusCounts.non_compliant} |`);
    lines.push(`| ⚠️ Partial | ${statusCounts.partial} |`);
    lines.push(`| ➖ N/A | ${statusCounts.na} |`);
    lines.push(`| ⏳ Pending | ${statusCounts.pending} |`);
    lines.push(`| **Total** | **${requirements.length}** |`);
    lines.push('');

    // Group requirements by category
    const grouped = {};
    requirements.forEach(req => {
        if (!grouped[req.category]) grouped[req.category] = [];
        grouped[req.category].push(req);
    });

    // Sort categories by order
    const sortedCategories = requirementCategories
        .filter(cat => grouped[cat.id])
        .sort((a, b) => a.order - b.order);

    // Requirements by category
    lines.push('## Requirements');
    lines.push('');

    sortedCategories.forEach(cat => {
        lines.push(`### ${cat.icon || ''} ${cat.label}`);
        lines.push('');
        lines.push('| ID | Requirement | Legal Basis | Status | Notes |');
        lines.push('|----|-------------|-------------|--------|-------|');

        grouped[cat.id].forEach(req => {
            const assessment = assessments[req.id] || { status: 'pending', notes: '' };
            const statusStr = `${getStatusEmoji(assessment.status)} ${getStatusLabel(assessment.status)}`;
            const notes = escapeMarkdown(assessment.notes || '—');

            lines.push(
                `| ${req.id} | ${escapeMarkdown(req.requirement)} | ${formatLegalBasis(req)} | ${statusStr} | ${notes} |`
            );
        });

        lines.push('');
    });

    // Legal References section
    lines.push('---');
    lines.push('');
    lines.push('## Legal References');
    lines.push('');

    sortedCategories.forEach(cat => {
        grouped[cat.id].forEach(req => {
            if (req.legalText) {
                lines.push(`### ${req.id}: ${req.requirement}`);
                lines.push('');
                lines.push(`**Legal Basis:** ${formatLegalBasis(req)}`);
                lines.push('');
                lines.push('> ' + req.legalText.trim().replace(/\n/g, '\n> '));
                lines.push('');
            }
        });
    });

    // Footer
    lines.push('---');
    lines.push('');
    lines.push('*Generated by eIDAS 2.0 Documentation Portal — Regulatory Compliance Assessment Tool*');

    const content = lines.join('\n');

    // Create and download file
    const filename = `RCA_${role.replace(/\s+/g, '_')}_${dateStr}.md`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { filename, date: now.toISOString() };
}

export default exportToMarkdown;
