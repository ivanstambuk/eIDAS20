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

                    // Also add normalized version without leading zeros
                    // e.g., "2025/0848" -> "2025/848" for lookups like "2025/848"
                    const normalizedId = idFromSlug.replace(/\/0+(\d)/, '/$1');
                    if (normalizedId !== idFromSlug) {
                        lookup[normalizedId] = reg;
                    }

                    // Add reversed format (NUMBER/YEAR like "910/2014" instead of "2014/910")
                    // Many YAML files use this legacy EU regulation numbering format
                    const parts = reg.slug.split('-');
                    if (parts.length === 2) {
                        const reversedId = `${parts[1]}/${parts[0]}`; // "910/2014"
                        lookup[reversedId] = reg;
                        // Also without leading zeros
                        const reversedNormalized = reversedId.replace(/^0+(\d)/, '$1');
                        if (reversedNormalized !== reversedId) {
                            lookup[reversedNormalized] = reg;
                        }
                    }

                    // Also add by celex
                    if (reg.celex) lookup[reg.celex] = reg;
                });

                // Add common shorthand aliases for regulations
                // These map human-readable names to their actual regulation entries
                const aliases = {
                    'GDPR': '2016-679',           // General Data Protection Regulation
                    'PSD2': '2015-2366',          // Payment Services Directive 2
                    'DORA': '2022-2554',          // Digital Operational Resilience Act
                    'NIS2': '2022-2555',          // Network and Information Security Directive
                    'eIDAS': '2014-910',          // eIDAS Regulation
                    'DSA': '2022-2065',           // Digital Services Act
                    'DMA': '2022-1925',           // Digital Markets Act
                    'AI Act': '2024-1689',        // AI Act
                };
                for (const [alias, slug] of Object.entries(aliases)) {
                    if (lookup[slug]) {
                        lookup[alias] = lookup[slug];
                    }
                }

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

    // Parse compound paragraph formats like "1(b)", "1(a)(i)", "1-2", "2(g)"
    // Returns { para, point, subpoint } for URL building
    const parseParagraph = (paragraph) => {
        if (!paragraph) return { para: null, point: null, subpoint: null };
        const str = String(paragraph);

        // Match: optional number, optional letter point, optional roman subpoint
        // e.g., "1", "1(b)", "2(g)", "1(a)(ii)", "1-2"
        const match = str.match(/^(\d+[a-z]?(?:\s*[-–—]\s*\d+[a-z]?)?)(?:\s*\(\s*([a-z])\s*\))?(?:\s*\(\s*([ivxlcdm]+)\s*\))?$/i);
        if (match) {
            return {
                para: match[1] ? match[1].split(/[-–—]/)[0].trim() : null, // First number for ranges
                point: match[2] ? match[2].toLowerCase() : null,
                subpoint: match[3] ? match[3].toLowerCase() : null
            };
        }
        // Fallback: treat whole string as paragraph
        return { para: str.split(/[-–—]/)[0].trim(), point: null, subpoint: null };
    };

    const parsedParagraph = parseParagraph(legalBasis?.paragraph);

    // Build URL to article
    const buildUrl = () => {
        if (!regMeta) return null;
        const baseUrl = `${import.meta.env.BASE_URL}#`;
        const docPath = regMeta.type === 'implementing-act'
            ? `/implementing-acts/${regMeta.slug}`
            : `/regulation/${regMeta.slug}`;

        // Build section anchor from article + parsed paragraph components
        let section = '';
        if (legalBasis?.article) {
            // Convert "Article 5b" -> "article-5b", "Annex I" -> "annex-i"
            let sectionId = legalBasis.article.toLowerCase().replace(/\s+/g, '-');

            // Build anchor - use -para- for paragraph references (including annexes)
            // Note: -section- is only used for annex numbered section headers like "1. Set of data..."
            // Standard annex paragraph/point references use -para- like articles
            if (parsedParagraph.para) {
                sectionId += `-para-${parsedParagraph.para}`;
            }
            if (parsedParagraph.point) {
                sectionId += `-point-${parsedParagraph.point}`;
            }
            if (parsedParagraph.subpoint) {
                sectionId += `-subpoint-${parsedParagraph.subpoint}`;
            }

            section = `?section=${sectionId}`;
        }

        return `${baseUrl}${docPath}${section}`;
    };

    // Format paragraph for display: "1(b)" -> "(1)(b)", "1" -> "(1)"
    const formatParagraphDisplay = () => {
        if (!legalBasis?.paragraph) return '';
        const { para, point, subpoint } = parsedParagraph;
        let display = '';
        if (para) display += `(${para})`;
        if (point) display += `(${point})`;
        if (subpoint) display += `(${subpoint})`;
        return display;
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
                    {formatParagraphDisplay()}
                </span>
                <span className="rca-legal-reg">
                    {regMeta?.sidebarTitle || regMeta?.shortTitle || `Reg. ${legalBasis?.regulation}`}
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

/**
 * MultiRoleSelector - Multi-select role cards with inline profile expansion
 * Design A: Rich cards with big icons, descriptions, and profile checkboxes
 */
function MultiRoleSelector({ roles, roleConfigurations, onToggleRole, onToggleProfile }) {
    return (
        <div className="rca-role-selector">
            <h3>Select Your Role(s)</h3>
            <p className="rca-selector-hint">
                Select all roles that apply to your organization. Configure profiles for each selected role.
            </p>
            <div className="rca-role-grid">
                {roles.map(role => {
                    const isSelected = roleConfigurations.has(role.id);
                    const selectedProfiles = roleConfigurations.get(role.id) || [];
                    const hasProfiles = role.profiles && role.profiles.length > 0;

                    return (
                        <div
                            key={role.id}
                            className={`rca-role-card ${isSelected ? 'selected' : ''}`}
                        >
                            <label className="rca-role-header">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggleRole(role.id)}
                                    className="rca-role-checkbox"
                                />
                                <span className="rca-role-icon">{role.icon}</span>
                                <span className="rca-role-label">{role.label}</span>
                            </label>
                            <p className="rca-role-desc">{role.description}</p>

                            {/* Profile selection - shown when role is selected and has profiles */}
                            {isSelected && hasProfiles && (
                                <div className="rca-role-profiles">
                                    <span className="rca-profiles-label">Profiles:</span>
                                    {role.profiles.map(profile => (
                                        <label key={profile.id} className="rca-profile-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedProfiles.length === 0 || selectedProfiles.includes(profile.id)}
                                                onChange={() => onToggleProfile(role.id, profile.id)}
                                            />
                                            <span className="rca-profile-label-text">{profile.label}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Requirement count badge */}
                            {isSelected && role.requirementCount && (
                                <span className="rca-role-req-count">{role.requirementCount} requirements</span>
                            )}
                        </div>
                    );
                })}
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

/**
 * DomainChips - Toggle chips for multi-select domain filtering
 * Selected domains glow cyan; unselected are muted
 * Clicking a chip toggles it on/off (multi-select, not exclusive)
 */
function DomainChips({ categories, activeCategories, onToggle }) {
    return (
        <div className="rca-domain-chips">
            {categories.map(cat => {
                const isActive = activeCategories.includes(cat.id);
                return (
                    <button
                        key={cat.id}
                        className={`rca-domain-chip ${isActive ? 'active' : ''}`}
                        onClick={() => onToggle(cat.id)}
                    >
                        <span className="rca-domain-chip-checkbox">
                            {isActive && <span className="rca-domain-chip-check">✓</span>}
                        </span>
                        {cat.label}
                    </button>
                );
            })}
        </div>
    );
}

/**
 * UseCaseSelector - Hybrid design: flat list with domain headers
 * Shows all use cases from selected domains, grouped by domain header
 * No accordion collapse - all items visible with descriptions
 * "Select all" link per domain header
 */
function UseCaseSelector({
    categories,
    useCases,
    selectedUseCases,
    onToggleUseCase,
    onToggleCategory,
    categoryFilter
}) {
    // If no domains selected, show prompt
    if (categoryFilter.length === 0) {
        return (
            <div className="rca-usecase-selector">
                <div className="rca-usecase-empty">
                    <span className="rca-usecase-empty-icon">🎯</span>
                    <p>Select one or more domains above to see available use cases</p>
                </div>
            </div>
        );
    }

    // Filter categories to show based on selected domains
    const visibleCategories = categories.filter(c => categoryFilter.includes(c.id));
    const useCaseArray = Object.values(useCases);

    return (
        <div className="rca-usecase-selector">
            <div className="rca-usecase-groups">
                {visibleCategories.map(cat => {
                    const categoryUseCases = useCaseArray.filter(uc => uc.category === cat.id);
                    const selectedCount = categoryUseCases.filter(uc => selectedUseCases.includes(uc.id)).length;
                    const isAllSelected = selectedCount === categoryUseCases.length && categoryUseCases.length > 0;

                    return (
                        <div key={cat.id} className="rca-usecase-group">
                            {/* Domain header with "Select all" */}
                            <div className="rca-usecase-group-header">
                                <label className="rca-usecase-group-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={el => {
                                            if (el) el.indeterminate = selectedCount > 0 && selectedCount < categoryUseCases.length;
                                        }}
                                        onChange={() => onToggleCategory(cat.id, !isAllSelected)}
                                    />
                                    <span className="rca-usecase-group-title">{cat.label}</span>
                                </label>
                                <span className="rca-usecase-group-count">
                                    {selectedCount}/{categoryUseCases.length}
                                </span>
                            </div>

                            {/* Use cases flat list */}
                            <div className="rca-usecase-list-flat">
                                {categoryUseCases.map(uc => (
                                    <label
                                        key={uc.id}
                                        className={`rca-usecase-item-flat ${selectedUseCases.includes(uc.id) ? 'selected' : ''}`}
                                    >
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
                        </div>
                    );
                })}
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

    // Selection state - Multi-role support
    // roleConfigurations: Map<roleId, profileIds[]> where empty array = all profiles
    const [roleConfigurations, setRoleConfigurations] = useState(new Map());
    const [selectedUseCases, setSelectedUseCases] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState([]);
    const [assessments, setAssessments] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [exportHistory, setExportHistory] = useState([]);

    // Get array of selected role objects
    const selectedRoleObjs = useMemo(() => {
        if (!data) return [];
        return data.roles.filter(r => roleConfigurations.has(r.id));
    }, [data, roleConfigurations]);

    // Toggle role selection (add/remove from configurations)
    const handleToggleRole = useCallback((roleId) => {
        setRoleConfigurations(prev => {
            const next = new Map(prev);
            if (next.has(roleId)) {
                next.delete(roleId);
            } else {
                next.set(roleId, []); // Empty array = all profiles selected
            }
            return next;
        });
        setShowResults(false);
    }, []);

    // Toggle profile for a specific role
    const handleToggleProfile = useCallback((roleId, profileId) => {
        setRoleConfigurations(prev => {
            const next = new Map(prev);
            const currentProfiles = next.get(roleId) || [];

            if (currentProfiles.length === 0) {
                // Currently "all profiles" - switch to only this one unselected
                // Get the role to know all profile IDs
                const role = data?.roles?.find(r => r.id === roleId);
                if (role?.profiles) {
                    // Toggle off means all except this one
                    const allExceptThis = role.profiles
                        .filter(p => p.id !== profileId)
                        .map(p => p.id);
                    next.set(roleId, allExceptThis);
                }
            } else {
                // Some profiles selected - toggle this one
                if (currentProfiles.includes(profileId)) {
                    next.set(roleId, currentProfiles.filter(id => id !== profileId));
                } else {
                    next.set(roleId, [...currentProfiles, profileId]);
                }
            }
            return next;
        });
    }, [data]);

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

    // Toggle domain filter - also auto-selects/deselects use cases in that domain
    const handleToggleCategoryFilter = useCallback((categoryId) => {
        if (!data) return;

        const categoryUseCases = Object.values(data.useCases)
            .filter(uc => uc.category === categoryId)
            .map(uc => uc.id);

        setCategoryFilter(prev => {
            const isRemoving = prev.includes(categoryId);
            if (isRemoving) {
                // Removing domain - also deselect its use cases
                setSelectedUseCases(prevUc => prevUc.filter(id => !categoryUseCases.includes(id)));
                return prev.filter(id => id !== categoryId);
            } else {
                // Adding domain - auto-select all its use cases
                setSelectedUseCases(prevUc => [...new Set([...prevUc, ...categoryUseCases])]);
                return [...prev, categoryId];
            }
        });
    }, [data]);

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

    // Get applicable requirements based on selection (multi-role, profiles, use cases)
    // Aggregates across all selected roles with deduplication
    const applicableRequirements = useMemo(() => {
        if (!data || roleConfigurations.size === 0) return [];

        const reqMap = new Map(); // reqId -> { ...req, sourceRoles: [roleId, ...] }

        // Get use case IDs to filter by (empty = all use cases)
        const useCaseFilter = selectedUseCases.length > 0
            ? selectedUseCases
            : Object.keys(data.useCases);

        // For each selected role and its profiles
        for (const [roleId, selectedProfiles] of roleConfigurations) {
            const index = data.requirementIndex[roleId];
            if (!index) continue;

            // Collect requirement IDs for selected use cases
            const reqIds = new Set();
            for (const ucId of useCaseFilter) {
                const reqs = index[ucId];
                if (reqs) reqs.forEach(id => reqIds.add(id));
            }

            // Filter requirements by role and profiles
            for (const req of data.requirements) {
                if (!reqIds.has(req.id)) continue;

                // Profile filtering
                if (selectedProfiles.length > 0 && req.profileFilter && !req.appliesToAllProfiles) {
                    if (!req.profileFilter.some(pf => selectedProfiles.includes(pf))) {
                        continue;
                    }
                }

                // Add or update in map
                if (reqMap.has(req.id)) {
                    // Requirement already added - add this role to sourceRoles
                    const existing = reqMap.get(req.id);
                    if (!existing.sourceRoles.includes(roleId)) {
                        existing.sourceRoles.push(roleId);
                    }
                } else {
                    // New requirement
                    reqMap.set(req.id, {
                        ...req,
                        sourceRoles: [roleId]
                    });
                }
            }
        }

        return Array.from(reqMap.values());
    }, [data, roleConfigurations, selectedUseCases]);

    // Get role labels (multi-role support)
    const getRoleLabels = useCallback(() => {
        if (!data || roleConfigurations.size === 0) return '';
        const labels = [];
        for (const roleId of roleConfigurations.keys()) {
            const role = data.roles.find(r => r.id === roleId);
            if (role) labels.push(role.label);
        }
        return labels.join(', ');
    }, [data, roleConfigurations]);

    // Get selected use case names
    const getUseCaseNames = useCallback(() => {
        if (!data) return [];
        return selectedUseCases.map(id => data.useCases[id]?.name || id);
    }, [data, selectedUseCases]);

    // Generate assessment
    const handleGenerate = useCallback(() => {
        if (roleConfigurations.size === 0) {
            alert('Please select at least one role.');
            return;
        }
        setShowResults(true);
    }, [roleConfigurations]);

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
                role: getRoleLabels(),
                useCases: getUseCaseNames(),
                requirementCategories: data.requirementCategories
            });

            // Add to export history
            setExportHistory(prev => [
                {
                    filename: result.filename,
                    format: 'xlsx',
                    date: result.date,
                    role: getRoleLabels(),
                    useCaseCount: selectedUseCases.length,
                    requirementCount: applicableRequirements.length
                },
                ...prev.slice(0, 9) // Keep last 10 exports
            ]);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Export failed. Please try again.');
        }
    }, [applicableRequirements, assessments, data, getRoleLabels, getUseCaseNames, selectedUseCases, roleConfigurations]);

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
                role: getRoleLabels(),
                useCases: getUseCaseNames(),
                requirementCategories: data.requirementCategories
            });

            // Add to export history
            setExportHistory(prev => [
                {
                    filename: result.filename,
                    format: 'md',
                    date: result.date,
                    role: getRoleLabels(),
                    useCaseCount: selectedUseCases.length,
                    requirementCount: applicableRequirements.length
                },
                ...prev.slice(0, 9) // Keep last 10 exports
            ]);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Export failed. Please try again.');
        }
    }, [applicableRequirements, assessments, data, getRoleLabels, getUseCaseNames, selectedUseCases, roleConfigurations]);

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
                    Generate a compliance checklist based on your roles and selected EUDI Wallet use cases.
                </p>
            </header>

            {/* Stats - Inline parenthetical notation with icons */}
            <div className="rca-stats-row">
                <span className="rca-stat-primary">
                    📋 {data.stats.totalRequirements} requirements
                    <span className="rca-stat-breakdown">
                        (✅ {data.stats.universalRequirements} universal · 🔀 {data.stats.useCaseSpecificRequirements} use-case specific)
                    </span>
                </span>
                <span className="rca-stat-scope">
                    👤 {data.stats.totalRoles} roles
                </span>
                <span className="rca-stat-scope">
                    🎯 {data.stats.totalUseCases} use cases
                </span>
            </div>

            <div className="rca-content">
                <section className="rca-configuration">
                    {/* Step 1: Multi-role selection with inline profile configuration */}
                    <MultiRoleSelector
                        roles={data.roles}
                        roleConfigurations={roleConfigurations}
                        onToggleRole={handleToggleRole}
                        onToggleProfile={handleToggleProfile}
                    />

                    {/* Step 2: Use case selection - Hybrid design */}
                    <div className="rca-usecase-section">
                        <h3>Select Use Case(s)</h3>
                        <p className="rca-selector-hint">
                            Select one or more domains, then choose the specific use cases within each.
                        </p>

                        <DomainChips
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

                    {/* Summary bar */}
                    {roleConfigurations.size > 0 && (
                        <div className="rca-selection-summary-bar">
                            <span className="rca-summary-stats">
                                {roleConfigurations.size} role{roleConfigurations.size !== 1 ? 's' : ''} selected
                                {selectedUseCases.length > 0 && ` · ${selectedUseCases.length} use case${selectedUseCases.length !== 1 ? 's' : ''}`}
                            </span>
                            <span className="rca-summary-req-count">
                                {applicableRequirements.length} requirements
                            </span>
                        </div>
                    )}

                    <div className="rca-actions">
                        <button
                            className="rca-btn primary"
                            onClick={handleGenerate}
                            disabled={roleConfigurations.size === 0}
                        >
                            📊 View Requirements ({applicableRequirements.length})
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
