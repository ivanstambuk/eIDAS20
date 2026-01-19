/**
 * ComplianceAssessment (RCA) Page
 * 
 * Regulatory Compliance Assessment generator for EUDI Wallet ecosystem.
 * Users select role + use cases, then view/export applicable requirements.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { exportToExcel, exportToMarkdown } from '../utils/rca';
import './ComplianceAssessment.css';

// ============================================================================
// Data Loading
// ============================================================================

function useRCAData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}data/rca-data.json`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load RCA data');
                return res.json();
            })
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    return { data, loading, error };
}

// ============================================================================
// Components
// ============================================================================

function RoleSelector({ roles, selectedRole, onSelect }) {
    return (
        <div className="rca-role-selector">
            <h3>Step 1: Select Your Role</h3>
            <div className="rca-role-options">
                {roles.map(role => (
                    <label key={role.id} className="rca-role-option">
                        <input
                            type="radio"
                            name="role"
                            value={role.id}
                            checked={selectedRole === role.id}
                            onChange={() => onSelect(role.id)}
                        />
                        <span className="rca-role-icon">{role.icon}</span>
                        <span className="rca-role-label">{role.label}</span>
                        <span className="rca-role-desc">{role.description}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

function CategoryFilter({ categories, activeCategories, onToggle }) {
    return (
        <div className="rca-category-filter">
            <button
                className={`rca-filter-pill ${activeCategories.length === 0 ? 'active' : ''}`}
                onClick={() => onToggle(null)}
            >
                All
            </button>
            {categories.map(cat => (
                <button
                    key={cat.id}
                    className={`rca-filter-pill ${activeCategories.includes(cat.id) ? 'active' : ''}`}
                    onClick={() => onToggle(cat.id)}
                >
                    {cat.label} ({cat.useCaseCount})
                </button>
            ))}
        </div>
    );
}

function UseCaseCategoryCard({
    category,
    useCases,
    selectedUseCases,
    onToggleUseCase,
    onToggleCategory
}) {
    const categoryUseCases = useCases.filter(uc => uc.category === category.id);
    const selectedCount = categoryUseCases.filter(uc => selectedUseCases.includes(uc.id)).length;
    const isAllSelected = selectedCount === categoryUseCases.length;
    const isPartiallySelected = selectedCount > 0 && selectedCount < categoryUseCases.length;
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="rca-category-card">
            <div className="rca-category-header">
                <label className="rca-category-checkbox">
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={el => {
                            if (el) el.indeterminate = isPartiallySelected;
                        }}
                        onChange={() => onToggleCategory(category.id, !isAllSelected)}
                    />
                    <span className="rca-category-title">{category.label}</span>
                    <span className="rca-category-count">
                        {selectedCount}/{categoryUseCases.length}
                    </span>
                </label>
                <button
                    className="rca-expand-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                    {isExpanded ? '▼' : '▶'}
                </button>
            </div>

            {isExpanded && (
                <div className="rca-usecase-list">
                    {categoryUseCases.map(uc => (
                        <label key={uc.id} className="rca-usecase-item">
                            <input
                                type="checkbox"
                                checked={selectedUseCases.includes(uc.id)}
                                onChange={() => onToggleUseCase(uc.id)}
                            />
                            <div className="rca-usecase-content">
                                <span className="rca-usecase-name">{uc.name}</span>
                                <span className="rca-usecase-desc">{uc.description}</span>
                            </div>
                            {uc.status === 'published' && (
                                <span className="rca-usecase-badge published">Published</span>
                            )}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

function UseCaseSelector({
    categories,
    useCases,
    selectedUseCases,
    onToggleUseCase,
    onToggleCategory,
    categoryFilter
}) {
    // Filter categories to show
    const visibleCategories = categoryFilter.length > 0
        ? categories.filter(c => categoryFilter.includes(c.id))
        : categories;

    const useCaseArray = Object.values(useCases);

    return (
        <div className="rca-usecase-selector">
            <h3>Step 2: Select Use Cases</h3>
            <p className="rca-selector-hint">
                Select the use cases relevant to your implementation. Requirements will be filtered accordingly.
            </p>

            <div className="rca-category-cards">
                {visibleCategories.map(cat => (
                    <UseCaseCategoryCard
                        key={cat.id}
                        category={cat}
                        useCases={useCaseArray}
                        selectedUseCases={selectedUseCases}
                        onToggleUseCase={onToggleUseCase}
                        onToggleCategory={onToggleCategory}
                    />
                ))}
            </div>

            <div className="rca-selection-summary">
                Selected: {selectedUseCases.length} use case{selectedUseCases.length !== 1 ? 's' : ''}
            </div>
        </div>
    );
}

function RequirementTable({ requirements, requirementCategories, onStatusChange, assessments }) {
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredRequirements = useMemo(() => {
        return requirements.filter(req => {
            if (filterCategory !== 'all' && req.category !== filterCategory) return false;
            if (filterStatus !== 'all') {
                const status = assessments[req.id]?.status || 'pending';
                if (filterStatus !== status) return false;
            }
            return true;
        });
    }, [requirements, filterCategory, filterStatus, assessments]);

    // Group by category
    const groupedRequirements = useMemo(() => {
        const groups = {};
        for (const req of filteredRequirements) {
            if (!groups[req.category]) groups[req.category] = [];
            groups[req.category].push(req);
        }
        return groups;
    }, [filteredRequirements]);

    const statusOptions = [
        { value: 'pending', label: 'Pending', icon: '⏳' },
        { value: 'compliant', label: 'Compliant', icon: '✅' },
        { value: 'non_compliant', label: 'Non-Compliant', icon: '❌' },
        { value: 'partial', label: 'Partial', icon: '⚠️' },
        { value: 'na', label: 'N/A', icon: '➖' }
    ];

    return (
        <div className="rca-requirements">
            <div className="rca-requirements-header">
                <h3>Requirements ({filteredRequirements.length})</h3>
                <div className="rca-requirements-filters">
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="rca-filter-select"
                    >
                        <option value="all">All Categories</option>
                        {requirementCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="rca-filter-select"
                    >
                        <option value="all">All Statuses</option>
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="rca-requirements-table">
                {requirementCategories
                    .filter(cat => groupedRequirements[cat.id]?.length > 0)
                    .map(cat => (
                        <div key={cat.id} className="rca-req-category-group">
                            <h4 className="rca-req-category-title">
                                {cat.icon} {cat.label}
                            </h4>
                            <table className="rca-req-table">
                                <thead>
                                    <tr>
                                        <th className="col-id">ID</th>
                                        <th className="col-requirement">Requirement</th>
                                        <th className="col-legal">Legal Basis</th>
                                        <th className="col-status">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedRequirements[cat.id].map(req => {
                                        const assessment = assessments[req.id] || { status: 'pending' };
                                        return (
                                            <tr key={req.id} className={`status-${assessment.status}`}>
                                                <td className="col-id">{req.id}</td>
                                                <td className="col-requirement">
                                                    <div className="rca-req-text">{req.requirement}</div>
                                                    {req.explanation && (
                                                        <details className="rca-req-details">
                                                            <summary>Details</summary>
                                                            <p>{req.explanation}</p>
                                                            {req.legalText && (
                                                                <blockquote className="rca-legal-text">
                                                                    {req.legalText}
                                                                </blockquote>
                                                            )}
                                                        </details>
                                                    )}
                                                </td>
                                                <td className="col-legal">
                                                    <span className="rca-legal-ref">
                                                        {req.legalBasis?.article}
                                                        {req.legalBasis?.paragraph && `, ${req.legalBasis.paragraph}`}
                                                    </span>
                                                    <span className="rca-legal-reg">
                                                        Reg. {req.legalBasis?.regulation}
                                                    </span>
                                                </td>
                                                <td className="col-status">
                                                    <select
                                                        value={assessment.status}
                                                        onChange={e => onStatusChange(req.id, e.target.value)}
                                                        className={`rca-status-select status-${assessment.status}`}
                                                    >
                                                        {statusOptions.map(opt => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.icon} {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ))}
            </div>
        </div>
    );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function ComplianceAssessment() {
    const { data, loading, error } = useRCAData();

    // Selection state
    const [selectedRole, setSelectedRole] = useState('relying_party');
    const [selectedUseCases, setSelectedUseCases] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState([]);
    const [assessments, setAssessments] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [exportHistory, setExportHistory] = useState([]);

    // Load saved assessments and export history from localStorage
    useEffect(() => {
        const savedAssessments = localStorage.getItem('rca-assessments');
        if (savedAssessments) {
            try {
                setAssessments(JSON.parse(savedAssessments));
            } catch (e) {
                console.error('Failed to load saved assessments:', e);
            }
        }

        const savedHistory = localStorage.getItem('rca-export-history');
        if (savedHistory) {
            try {
                setExportHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Failed to load export history:', e);
            }
        }
    }, []);

    // Save assessments to localStorage
    useEffect(() => {
        if (Object.keys(assessments).length > 0) {
            localStorage.setItem('rca-assessments', JSON.stringify(assessments));
        }
    }, [assessments]);

    // Save export history to localStorage
    useEffect(() => {
        if (exportHistory.length > 0) {
            localStorage.setItem('rca-export-history', JSON.stringify(exportHistory));
        }
    }, [exportHistory]);

    // Toggle use case selection
    const handleToggleUseCase = useCallback((useCaseId) => {
        setSelectedUseCases(prev =>
            prev.includes(useCaseId)
                ? prev.filter(id => id !== useCaseId)
                : [...prev, useCaseId]
        );
    }, []);

    // Toggle entire category
    const handleToggleCategory = useCallback((categoryId, selectAll) => {
        if (!data) return;
        const categoryUseCases = Object.values(data.useCases)
            .filter(uc => uc.category === categoryId)
            .map(uc => uc.id);

        setSelectedUseCases(prev => {
            if (selectAll) {
                // Add all from category
                return [...new Set([...prev, ...categoryUseCases])];
            } else {
                // Remove all from category
                return prev.filter(id => !categoryUseCases.includes(id));
            }
        });
    }, [data]);

    // Toggle category filter
    const handleToggleCategoryFilter = useCallback((categoryId) => {
        if (categoryId === null) {
            setCategoryFilter([]);
        } else {
            setCategoryFilter(prev =>
                prev.includes(categoryId)
                    ? prev.filter(id => id !== categoryId)
                    : [...prev, categoryId]
            );
        }
    }, []);

    // Update assessment status
    const handleStatusChange = useCallback((reqId, status) => {
        setAssessments(prev => ({
            ...prev,
            [reqId]: {
                status,
                updated: new Date().toISOString()
            }
        }));
    }, []);

    // Get applicable requirements based on selection
    const applicableRequirements = useMemo(() => {
        if (!data || !selectedRole || selectedUseCases.length === 0) return [];

        const reqIds = new Set();
        const index = data.requirementIndex[selectedRole];
        if (!index) return [];

        // Collect requirement IDs for selected use cases
        for (const ucId of selectedUseCases) {
            const reqs = index[ucId];
            if (reqs) reqs.forEach(id => reqIds.add(id));
        }

        // Return full requirement objects
        return data.requirements.filter(r => reqIds.has(r.id));
    }, [data, selectedRole, selectedUseCases]);

    // Get role label
    const getRoleLabel = useCallback(() => {
        if (!data) return '';
        const role = data.roles.find(r => r.id === selectedRole);
        return role?.label || selectedRole;
    }, [data, selectedRole]);

    // Get selected use case names
    const getUseCaseNames = useCallback(() => {
        if (!data) return [];
        return selectedUseCases.map(id => data.useCases[id]?.name || id);
    }, [data, selectedUseCases]);

    // Generate assessment
    const handleGenerate = useCallback(() => {
        if (selectedUseCases.length === 0) {
            alert('Please select at least one use case.');
            return;
        }
        setShowResults(true);
    }, [selectedUseCases]);

    // Export to Excel
    const handleExportExcel = useCallback(() => {
        if (applicableRequirements.length === 0) {
            alert('No requirements to export. Please generate an assessment first.');
            return;
        }

        try {
            const result = exportToExcel({
                requirements: applicableRequirements,
                assessments,
                role: getRoleLabel(),
                useCases: getUseCaseNames(),
                requirementCategories: data.requirementCategories
            });

            // Add to export history
            setExportHistory(prev => [
                {
                    filename: result.filename,
                    format: 'xlsx',
                    date: result.date,
                    role: getRoleLabel(),
                    useCaseCount: selectedUseCases.length,
                    requirementCount: applicableRequirements.length
                },
                ...prev.slice(0, 9) // Keep last 10 exports
            ]);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Export failed. Please try again.');
        }
    }, [applicableRequirements, assessments, data, getRoleLabel, getUseCaseNames, selectedUseCases]);

    // Export to Markdown
    const handleExportMarkdown = useCallback(() => {
        if (applicableRequirements.length === 0) {
            alert('No requirements to export. Please generate an assessment first.');
            return;
        }

        try {
            const result = exportToMarkdown({
                requirements: applicableRequirements,
                assessments,
                role: getRoleLabel(),
                useCases: getUseCaseNames(),
                requirementCategories: data.requirementCategories
            });

            // Add to export history
            setExportHistory(prev => [
                {
                    filename: result.filename,
                    format: 'md',
                    date: result.date,
                    role: getRoleLabel(),
                    useCaseCount: selectedUseCases.length,
                    requirementCount: applicableRequirements.length
                },
                ...prev.slice(0, 9) // Keep last 10 exports
            ]);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Export failed. Please try again.');
        }
    }, [applicableRequirements, assessments, data, getRoleLabel, getUseCaseNames, selectedUseCases]);

    // Loading state
    if (loading) {
        return (
            <div className="rca-page">
                <div className="rca-loading">Loading RCA data...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="rca-page">
                <div className="rca-error">
                    Failed to load RCA data: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="rca-page">
            <header className="rca-header">
                <h1>Regulatory Compliance Assessment</h1>
                <p className="rca-subtitle">
                    Generate a compliance checklist based on your role and selected EUDI Wallet use cases.
                </p>
            </header>

            <div className="rca-content">
                <section className="rca-configuration">
                    <RoleSelector
                        roles={data.roles}
                        selectedRole={selectedRole}
                        onSelect={setSelectedRole}
                    />

                    <div className="rca-usecase-section">
                        <CategoryFilter
                            categories={data.categories}
                            activeCategories={categoryFilter}
                            onToggle={handleToggleCategoryFilter}
                        />

                        <UseCaseSelector
                            categories={data.categories}
                            useCases={data.useCases}
                            selectedUseCases={selectedUseCases}
                            onToggleUseCase={handleToggleUseCase}
                            onToggleCategory={handleToggleCategory}
                            categoryFilter={categoryFilter}
                        />
                    </div>

                    <div className="rca-actions">
                        <button
                            className="rca-btn primary"
                            onClick={handleGenerate}
                            disabled={selectedUseCases.length === 0}
                        >
                            📊 Generate Assessment ({applicableRequirements.length} requirements)
                        </button>
                        <button
                            className="rca-btn secondary"
                            onClick={handleExportExcel}
                            disabled={!showResults || applicableRequirements.length === 0}
                        >
                            📥 Export Excel
                        </button>
                        <button
                            className="rca-btn secondary"
                            onClick={handleExportMarkdown}
                            disabled={!showResults || applicableRequirements.length === 0}
                        >
                            📝 Export Markdown
                        </button>
                    </div>
                </section>

                {showResults && applicableRequirements.length > 0 && (
                    <section className="rca-results">
                        <RequirementTable
                            requirements={applicableRequirements}
                            requirementCategories={data.requirementCategories}
                            onStatusChange={handleStatusChange}
                            assessments={assessments}
                        />
                    </section>
                )}
            </div>
        </div>
    );
}
