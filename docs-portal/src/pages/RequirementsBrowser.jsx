/**
 * Requirements Browser Page
 * 
 * Centralized view for exploring compliance requirements across all sources:
 * - ARF High-Level Requirements
 * - VCQ Requirements  
 * - RCA Requirements
 * - Regulatory Requirements
 * 
 * Features:
 * - Multi-dimensional filtering (source, role, category, topic, compliance, criticality)
 * - URL-based filter state (shareable, VCQ integration)
 * - Multiple export formats (CSV, JSON, PDF)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRequirements } from '../hooks/useRequirements';
import RequirementsFilters from '../components/requirements/RequirementsFilters';
import RequirementsTable from '../components/requirements/RequirementsTable';
import RequirementDetail from '../components/requirements/RequirementDetail';
import './RequirementsBrowser.css';

const ITEMS_PER_PAGE = 25;

/**
 * Parse URL search params into filter object
 */
function parseFiltersFromUrl(searchParams) {
    const filters = {
        sources: [],
        roles: [],
        categories: [],
        topics: [],
        regulations: [],
        complianceLevels: [],
        criticalities: [],
        search: '',
    };

    // Parse array params
    ['sources', 'roles', 'categories', 'topics', 'regulations', 'complianceLevels', 'criticalities'].forEach(key => {
        const value = searchParams.get(key);
        if (value) {
            filters[key] = value.split(',').filter(Boolean);
        }
    });

    // Parse search
    filters.search = searchParams.get('q') || '';

    return filters;
}

/**
 * Serialize filters to URL search params
 */
function serializeFiltersToUrl(filters) {
    const params = new URLSearchParams();

    ['sources', 'roles', 'categories', 'topics', 'regulations', 'complianceLevels', 'criticalities'].forEach(key => {
        if (filters[key] && filters[key].length > 0) {
            params.set(key, filters[key].join(','));
        }
    });

    if (filters.search) {
        params.set('q', filters.search);
    }

    return params;
}

function RequirementsBrowser() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialFiltersFromUrl = parseFiltersFromUrl(searchParams);

    const {
        requirements,
        loading,
        error,
        filters,
        updateFilter,
        clearFilters,
        setFilters,
        filterOptions,
        stats,
        sourcesConfig,
    } = useRequirements(initialFiltersFromUrl);

    const [selectedRequirement, setSelectedRequirement] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef(null);

    // Sync filters to URL
    useEffect(() => {
        const newParams = serializeFiltersToUrl(filters);
        setSearchParams(newParams, { replace: true });
    }, [filters, setSearchParams]);

    // Load requirement by ID from URL
    useEffect(() => {
        const reqId = searchParams.get('id');
        if (reqId && requirements.length > 0) {
            const found = requirements.find(r => r.id === reqId);
            if (found) {
                setSelectedRequirement(found);
            }
        }
    }, [searchParams, requirements]);

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // Sort requirements
    const sortedRequirements = React.useMemo(() => {
        return [...requirements].sort((a, b) => {
            let aVal = a[sortField] || '';
            let bVal = b[sortField] || '';

            // Handle arrays (roles)
            if (Array.isArray(aVal)) aVal = aVal.join(', ');
            if (Array.isArray(bVal)) bVal = bVal.join(', ');

            // Handle nested (arfTopic.number)
            if (sortField === 'topic') {
                aVal = a.arfTopic?.number || 999;
                bVal = b.arfTopic?.number || 999;
            }

            const comparison = typeof aVal === 'number'
                ? aVal - bVal
                : String(aVal).localeCompare(String(bVal));

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [requirements, sortField, sortDirection]);

    // Paginate
    const totalPages = Math.ceil(sortedRequirements.length / ITEMS_PER_PAGE);
    const paginatedRequirements = sortedRequirements.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Handle sort
    const handleSort = useCallback((field) => {
        if (sortField === field) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    }, [sortField]);

    // Handle requirement click
    const handleRequirementClick = useCallback((requirement) => {
        setSelectedRequirement(requirement);
        // Update URL with requirement ID
        const newParams = new URLSearchParams(searchParams);
        newParams.set('id', requirement.id);
        setSearchParams(newParams, { replace: true });
    }, [searchParams, setSearchParams]);

    // Close detail modal
    const handleCloseDetail = useCallback(() => {
        setSelectedRequirement(null);
        // Remove ID from URL
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('id');
        setSearchParams(newParams, { replace: true });
    }, [searchParams, setSearchParams]);

    // Export data preparation
    const prepareExportData = useCallback(() => {
        return sortedRequirements.map(r => ({
            id: r.id,
            harmonizedId: r.harmonizedId || '',
            source: r.source,
            requirement: r.requirement,
            explanation: r.explanation || '',
            notes: r.notes || '',
            category: r.category,
            roles: r.roles || [],
            complianceLevel: r.complianceLevel,
            criticality: r.criticality,
            arfTopic: r.arfTopic ? {
                number: r.arfTopic.number,
                title: r.arfTopic.title,
                subsection: r.arfTopic.subsection,
            } : null,
            legalBasis: r.legalBasis || null,
            technicalReferences: r.technicalReferences || [],
        }));
    }, [sortedRequirements]);

    // Export as CSV
    const handleExportCSV = useCallback(() => {
        const exportData = sortedRequirements.map(r => ({
            id: r.id,
            harmonizedId: r.harmonizedId || '',
            source: r.source,
            requirement: r.requirement,
            category: r.category,
            roles: (r.roles || []).join('; '),
            complianceLevel: r.complianceLevel,
            criticality: r.criticality,
            arfTopic: r.arfTopic ? `Topic ${r.arfTopic.number}: ${r.arfTopic.title}` : '',
            legalBasis: r.legalBasis ? `${r.legalBasis.regulation} ${r.legalBasis.article}` : '',
        }));

        const headers = Object.keys(exportData[0] || {});
        const csv = [
            headers.join(','),
            ...exportData.map(row =>
                headers.map(h => `"${(row[h] || '').replace(/"/g, '""')}"`).join(',')
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `requirements-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    }, [sortedRequirements]);

    // Export as JSON
    const handleExportJSON = useCallback(() => {
        const exportData = {
            exportDate: new Date().toISOString(),
            filterState: filters,
            totalCount: sortedRequirements.length,
            requirements: prepareExportData(),
        };

        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `requirements-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    }, [sortedRequirements, filters, prepareExportData]);

    // Export as PDF (via print)
    const handleExportPDF = useCallback(() => {
        const printWindow = window.open('', '_blank');
        const exportData = prepareExportData();

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Requirements Export - ${new Date().toLocaleDateString()}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        .meta { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
        .requirement { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
        .req-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .req-id { font-family: monospace; font-weight: bold; color: #3b82f6; font-size: 14px; }
        .req-badges { display: flex; gap: 8px; }
        .badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
        .badge-mandatory { background: #fee2e2; color: #dc2626; }
        .badge-recommended { background: #fef3c7; color: #d97706; }
        .badge-optional { background: #f3f4f6; color: #6b7280; }
        .badge-critical { background: #dc2626; color: white; }
        .badge-high { background: #f97316; color: white; }
        .badge-medium { background: #eab308; color: white; }
        .req-text { font-size: 14px; line-height: 1.6; margin-bottom: 12px; }
        .req-meta { font-size: 12px; color: #6b7280; }
        .req-meta span { margin-right: 16px; }
        @media print { .requirement { break-inside: avoid; } }
    </style>
</head>
<body>
    <h1>📋 Requirements Export</h1>
    <div class="meta">
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Total Requirements: ${exportData.length}</p>
        <p>Filters: ${JSON.stringify(filters).replace(/"/g, '').replace(/\[/g, '').replace(/\]/g, '').replace(/{/g, '').replace(/}/g, '')}</p>
    </div>
    ${exportData.map(r => `
    <div class="requirement">
        <div class="req-header">
            <span class="req-id">${r.id}${r.harmonizedId ? ` (${r.harmonizedId})` : ''}</span>
            <div class="req-badges">
                <span class="badge badge-${r.complianceLevel}">${r.complianceLevel}</span>
                <span class="badge badge-${r.criticality}">${r.criticality}</span>
            </div>
        </div>
        <div class="req-text">${r.requirement}</div>
        <div class="req-meta">
            <span>📂 ${r.source}</span>
            <span>🏷️ ${r.category}</span>
            ${r.arfTopic ? `<span>📑 Topic ${r.arfTopic.number}</span>` : ''}
            <span>👥 ${(r.roles || []).join(', ')}</span>
        </div>
    </div>
    `).join('')}
</body>
</html>`;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
        setShowExportMenu(false);
    }, [prepareExportData, filters]);

    // Copy shareable link
    const handleCopyLink = useCallback(() => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        // Could add toast notification
        setShowExportMenu(false);
    }, []);

    if (loading) {
        return (
            <div className="requirements-browser">
                <div className="requirements-loading">
                    <div className="loading-spinner" />
                    <p>Loading requirements...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="requirements-browser">
                <div className="requirements-error">
                    <h2>Error Loading Requirements</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="requirements-browser">
            {/* Header */}
            <header className="requirements-header">
                <div className="header-content">
                    <h1>📋 Requirements Browser</h1>
                    <p>Explore compliance requirements across ARF, regulations, and internal standards</p>
                </div>
                <div className="header-stats">
                    <div className="stat">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{stats.filtered}</span>
                        <span className="stat-label">Filtered</span>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <RequirementsFilters
                filters={filters}
                filterOptions={filterOptions}
                sourcesConfig={sourcesConfig}
                onFilterChange={updateFilter}
                onClearFilters={clearFilters}
                resultCount={requirements.length}
            />

            {/* Actions */}
            <div className="requirements-actions">
                <span className="result-count">
                    Showing {paginatedRequirements.length} of {sortedRequirements.length} requirements
                </span>
                <div className="action-buttons">
                    <button className="action-btn secondary" onClick={handleCopyLink}>
                        🔗 Copy Link
                    </button>
                    <div className="export-dropdown" ref={exportMenuRef}>
                        <button
                            className="action-btn primary"
                            onClick={() => setShowExportMenu(!showExportMenu)}
                        >
                            📥 Export ▾
                        </button>
                        {showExportMenu && (
                            <div className="export-menu">
                                <button onClick={handleExportCSV}>
                                    📄 Export as CSV
                                </button>
                                <button onClick={handleExportJSON}>
                                    📋 Export as JSON
                                </button>
                                <button onClick={handleExportPDF}>
                                    📑 Export as PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <RequirementsTable
                requirements={paginatedRequirements}
                sourcesConfig={sourcesConfig}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onRowClick={handleRequirementClick}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="requirements-pagination">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        ← Previous
                    </button>
                    <div className="pagination-pages">
                        {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                            let page;
                            if (totalPages <= 7) {
                                page = i + 1;
                            } else if (currentPage <= 4) {
                                page = i + 1;
                            } else if (currentPage >= totalPages - 3) {
                                page = totalPages - 6 + i;
                            } else {
                                page = currentPage - 3 + i;
                            }

                            return (
                                <button
                                    key={page}
                                    className={currentPage === page ? 'active' : ''}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            {selectedRequirement && (
                <RequirementDetail
                    requirement={selectedRequirement}
                    sourcesConfig={sourcesConfig}
                    onClose={handleCloseDetail}
                />
            )}
        </div>
    );
}

export default RequirementsBrowser;
