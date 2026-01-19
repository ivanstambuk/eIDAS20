/**
 * ComplianceAssessment (RCA) Page
 * 
 * Regulatory Compliance Assessment generator for EUDI Wallet ecosystem.
 * Users select role + use cases, then view/export applicable requirements.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

// Load regulations index for metadata (name, status, date)
function useRegulationsIndex() {
    const [index, setIndex] = useState({});

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}data/regulations-index.json`)
            .then(res => res.json())
            .then(data => {
                // Create lookup by regulation ID (e.g., "2024/1183" -> metadata)
                const lookup = {};
                data.forEach(reg => {
                    // Match format like "2024/1183" to slug "2024-1183"
                    const idFromSlug = reg.slug.replace('-', '/');
                    lookup[idFromSlug] = reg;
                    lookup[reg.slug] = reg;
                    // Also add by celex
                    if (reg.celex) lookup[reg.celex] = reg;
                });
                setIndex(lookup);
            })
            .catch(console.error);
    }, []);

    return index;
}

// ============================================================================
// LegalBasisLink Component
// Shows popover on hover, opens in new tab on click
// ============================================================================

function LegalBasisLink({ legalBasis, regulationsIndex }) {
    const [showPopover, setShowPopover] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const hideTimeoutRef = useRef(null);

    // Get regulation metadata
    const regId = legalBasis?.regulation;
    const regMeta = regulationsIndex[regId] || regulationsIndex[regId?.replace('/', '-')];

    // Build URL to article
    const buildUrl = () => {
        if (!regMeta) return null;
        const baseUrl = `${import.meta.env.BASE_URL}#`;
        const docPath = regMeta.type === 'implementing-act'
            ? `/implementing-acts/${regMeta.slug}`
            : `/regulation/${regMeta.slug}`;

        // Try to build section anchor from article + paragraph
        let section = '';
        if (legalBasis?.article) {
            // Convert "Article 5b" -> "article-5b"
            let sectionId = legalBasis.article.toLowerCase().replace(/\s+/g, '-');

            // Append paragraph if present: "9" -> "-para-9", "1-2" -> "-para-1-2"
            if (legalBasis?.paragraph) {
                sectionId += `-para-${legalBasis.paragraph}`;
            }

            section = `?section=${sectionId}`;
        }

        return `${baseUrl}${docPath}${section}`;
    };

    const url = buildUrl();

    const handleMouseEnter = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }

        // Calculate position using viewport coordinates (for position: fixed)
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const popoverHeight = 150; // Approximate height

            // Check if popover would go off bottom of viewport
            const spaceBelow = viewportHeight - rect.bottom;
            const showAbove = spaceBelow < popoverHeight + 20;

            setPopoverPosition({
                top: showAbove ? rect.top - popoverHeight - 8 : rect.bottom + 8,
                left: Math.max(8, Math.min(rect.left, window.innerWidth - 320))
            });
        }
        setShowPopover(true);
    };

    const handleMouseLeave = () => {
        hideTimeoutRef.current = setTimeout(() => {
            setShowPopover(false);
        }, 150);
    };

    const handlePopoverMouseEnter = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }
    };

    const handlePopoverMouseLeave = () => {
        setShowPopover(false);
    };

    // Determine status display
    const getStatusBadge = () => {
        if (!regMeta) return null;
        const legalType = regMeta.legalType || regMeta.type;

        switch (legalType) {
            case 'regulation':
                return <span className="rca-popover-badge in-force">In Force</span>;
            case 'implementing_regulation':
                return <span className="rca-popover-badge in-force">In Force</span>;
            case 'recommendation':
                return <span className="rca-popover-badge guidance">Guidance</span>;
            case 'decision':
                return <span className="rca-popover-badge decision">Decision</span>;
            default:
                return <span className="rca-popover-badge">{legalType}</span>;
        }
    };

    return (
        <>
            <a
                ref={triggerRef}
                href={url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="rca-legal-link"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={e => {
                    if (!url) e.preventDefault();
                }}
            >
                <span className="rca-legal-ref">
                    {legalBasis?.article}
                    {legalBasis?.paragraph && `(${legalBasis.paragraph})`}
                </span>
                <span className="rca-legal-reg">
                    Reg. {legalBasis?.regulation}
                </span>
            </a>

            {showPopover && regMeta && (
                <div
                    ref={popoverRef}
                    className="rca-legal-popover"
                    style={{
                        position: 'fixed',
                        top: `${popoverPosition.top}px`,
                        left: `${popoverPosition.left}px`,
                    }}
                    onMouseEnter={handlePopoverMouseEnter}
                    onMouseLeave={handlePopoverMouseLeave}
                >
                    <div className="rca-popover-header">
                        {getStatusBadge()}
                        <span className="rca-popover-type">
                            {regMeta.legalType === 'implementing_regulation' ? 'Implementing Regulation' :
                                regMeta.legalType === 'regulation' ? 'Regulation' :
                                    regMeta.legalType}
                        </span>
                    </div>
                    <div className="rca-popover-title">
                        {regMeta.shortTitle || regMeta.title}
                    </div>
                    <div className="rca-popover-meta">
                        <span>📅 {regMeta.date}</span>
                        <span>📄 CELEX: {regMeta.celex}</span>
                    </div>
                    {url && (
                        <div className="rca-popover-action">
                            Opens in new tab →
                        </div>
                    )}
                </div>
            )}
        </>
    );
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

function ProfileSelector({ role, selectedProfiles, onToggleProfile }) {
    // If role has no profiles, don't render anything
    if (!role?.profiles || role.profiles.length === 0) {
        return null;
    }

    const allSelected = selectedProfiles.length === 0 || selectedProfiles.length === role.profiles.length;

    return (
        <div className="rca-profile-selector">
            <h3>Step 1b: Select Your Profile(s) <span className="rca-optional">(optional)</span></h3>
            <p className="rca-selector-hint">
                Filter requirements based on your organization's specific context. Select all that apply.
            </p>
            <div className="rca-profile-options">
                <label className="rca-profile-option all-profiles">
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => onToggleProfile('all')}
                    />
                    <span className="rca-profile-icon">📋</span>
                    <span className="rca-profile-label">All Profiles</span>
                    <span className="rca-profile-desc">Show requirements for all profile types</span>
                </label>
                {role.profiles.map(profile => (
                    <label key={profile.id} className="rca-profile-option">
                        <input
                            type="checkbox"
                            checked={selectedProfiles.includes(profile.id) || allSelected}
                            onChange={() => onToggleProfile(profile.id)}
                        />
                        <span className="rca-profile-icon">{profile.icon}</span>
                        <span className="rca-profile-label">{profile.label}</span>
                        <span className="rca-profile-desc">{profile.description}</span>
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

function RequirementTable({ requirements, requirementCategories, onStatusChange, assessments, regulationsIndex }) {
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
                                                    <LegalBasisLink
                                                        legalBasis={req.legalBasis}
                                                        regulationsIndex={regulationsIndex}
                                                    />
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
    const regulationsIndex = useRegulationsIndex();

    // Selection state
    const [selectedRole, setSelectedRole] = useState('relying_party');
    const [selectedProfiles, setSelectedProfiles] = useState([]); // Empty = all profiles
    const [selectedUseCases, setSelectedUseCases] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState([]);
    const [assessments, setAssessments] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [exportHistory, setExportHistory] = useState([]);

    // Get the currently selected role object
    const selectedRoleObj = useMemo(() => {
        return data?.roles?.find(r => r.id === selectedRole) || null;
    }, [data, selectedRole]);

    // Reset profiles when role changes
    const handleRoleChange = useCallback((roleId) => {
        setSelectedRole(roleId);
        setSelectedProfiles([]); // Reset to "all profiles" when role changes
        setShowResults(false);
    }, []);

    // Toggle profile selection
    const handleToggleProfile = useCallback((profileId) => {
        if (profileId === 'all') {
            setSelectedProfiles([]);
        } else {
            setSelectedProfiles(prev => {
                if (prev.includes(profileId)) {
                    return prev.filter(id => id !== profileId);
                } else {
                    return [...prev, profileId];
                }
            });
        }
    }, []);

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

    // Get applicable requirements based on selection (role, profiles, use cases)
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

        // Get requirements and filter by profiles
        return data.requirements.filter(r => {
            // Must be in the use case set
            if (!reqIds.has(r.id)) return false;

            // Profile filtering:
            // - If selectedProfiles is empty, show ALL requirements (all profiles)
            // - If requirement has no profileFilter (appliesToAllProfiles), always show
            // - If requirement has profileFilter, only show if at least one selected profile matches
            if (selectedProfiles.length === 0) {
                // All profiles selected - show everything
                return true;
            }

            if (r.appliesToAllProfiles || !r.profileFilter) {
                // Requirement applies to all profiles - always show
                return true;
            }

            // Check if any selected profile matches
            return r.profileFilter.some(pf => selectedProfiles.includes(pf));
        });
    }, [data, selectedRole, selectedProfiles, selectedUseCases]);

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
                        onSelect={handleRoleChange}
                    />

                    <ProfileSelector
                        role={selectedRoleObj}
                        selectedProfiles={selectedProfiles}
                        onToggleProfile={handleToggleProfile}
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
                            regulationsIndex={regulationsIndex}
                        />
                    </section>
                )}
            </div>
        </div>
    );
}
