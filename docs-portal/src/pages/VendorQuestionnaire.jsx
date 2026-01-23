/**
 * VendorQuestionnaire (VCQ) Page
 * 
 * Vendor Compliance Questionnaire generator for Relying Parties evaluating
 * third-party intermediaries in the EUDIW ecosystem.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './VendorQuestionnaire.css';

// ============================================================================
// Data Loading
// ============================================================================

function useVCQData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}data/vcq-data.json`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load VCQ data');
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
                    const idFromSlug = reg.slug.replace('-', '/');
                    lookup[idFromSlug] = reg;
                    lookup[reg.slug] = reg;

                    // Normalized version without leading zeros
                    const normalizedId = idFromSlug.replace(/\/0+(\d)/, '/$1');
                    if (normalizedId !== idFromSlug) {
                        lookup[normalizedId] = reg;
                    }

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
// ============================================================================

function LegalBasisLink({ legalBasis, regulationsIndex }) {
    const [showPopover, setShowPopover] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const hideTimeoutRef = useRef(null);

    const regId = legalBasis?.regulation;
    const regMeta = regulationsIndex[regId] || regulationsIndex[regId?.replace('/', '-')];

    const buildUrl = () => {
        if (!regMeta) return null;
        const baseUrl = `${import.meta.env.BASE_URL}#`;
        const docPath = regMeta.type === 'implementing-act'
            ? `/implementing-acts/${regMeta.slug}`
            : `/regulation/${regMeta.slug}`;

        let section = '';
        if (legalBasis?.article) {
            let sectionId = legalBasis.article.toLowerCase().replace(/\s+/g, '-');
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

        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const popoverHeight = 150;
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

    const getStatusBadge = () => {
        if (!regMeta) return null;
        const legalType = regMeta.legalType || regMeta.type;

        switch (legalType) {
            case 'regulation':
            case 'implementing_regulation':
                return <span className="vcq-popover-badge in-force">In Force</span>;
            default:
                return <span className="vcq-popover-badge">{legalType}</span>;
        }
    };

    return (
        <>
            <a
                ref={triggerRef}
                href={url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="vcq-legal-link"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={e => {
                    if (!url) e.preventDefault();
                }}
            >
                <span className="vcq-legal-ref">
                    {legalBasis?.article}
                    {legalBasis?.paragraph && `(${legalBasis.paragraph})`}
                </span>
                <span className="vcq-legal-reg">
                    Reg. {legalBasis?.regulation}
                </span>
            </a>

            {showPopover && regMeta && (
                <div
                    className="vcq-legal-popover"
                    style={{
                        position: 'fixed',
                        top: `${popoverPosition.top}px`,
                        left: `${popoverPosition.left}px`,
                    }}
                    onMouseEnter={handlePopoverMouseEnter}
                    onMouseLeave={handlePopoverMouseLeave}
                >
                    <div className="vcq-popover-header">
                        {getStatusBadge()}
                        <span className="vcq-popover-type">
                            {regMeta.legalType === 'implementing_regulation' ? 'Implementing Regulation' :
                                regMeta.legalType === 'regulation' ? 'Regulation' :
                                    regMeta.legalType}
                        </span>
                    </div>
                    <div className="vcq-popover-title">
                        {regMeta.shortTitle || regMeta.title}
                    </div>
                    <div className="vcq-popover-meta">
                        <span>📅 {regMeta.date}</span>
                        <span>📄 CELEX: {regMeta.celex}</span>
                    </div>
                    {url && (
                        <div className="vcq-popover-action">
                            Opens in new tab →
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

// ============================================================================
// IntermediaryTypeSelector Component
// ============================================================================

function IntermediaryTypeSelector({ types, selectedTypes, onToggle, requirementsByType }) {
    return (
        <div className="vcq-step">
            <h3>
                <span className="vcq-step-number">1</span>
                Select Intermediary Type(s)
            </h3>
            <p className="vcq-step-hint">
                Choose the type(s) of intermediary you are evaluating. Each type has specific compliance requirements.
            </p>
            <div className="vcq-type-grid">
                {types.map(type => {
                    const isSelected = selectedTypes.includes(type.id);
                    const reqCount = (requirementsByType?.core?.length || 0) +
                        (requirementsByType?.[type.id]?.length || 0);

                    return (
                        <div
                            key={type.id}
                            className={`vcq-type-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => onToggle(type.id)}
                        >
                            <label className="vcq-type-header">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggle(type.id)}
                                    className="vcq-type-checkbox"
                                />
                                <span className="vcq-type-icon">{type.icon}</span>
                                <div>
                                    <span className="vcq-type-label">{type.label}</span>
                                    <span className="vcq-type-short">{type.shortLabel}</span>
                                </div>
                            </label>
                            <p className="vcq-type-desc">{type.description}</p>
                            {type.keyCharacteristics && (
                                <div className="vcq-type-characteristics">
                                    <ul>
                                        {type.keyCharacteristics.slice(0, 4).map((char, idx) => (
                                            <li key={idx}>{char}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {isSelected && (
                                <span className="vcq-type-req-count">
                                    {reqCount} requirements
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================================
// SourceSelector Component (Step 3)
// Filter requirements by legal source
// ============================================================================

function SourceSelector({ legalSources, selectedSources, onToggle }) {
    // Flatten all sources into a single list with categories
    const allSources = useMemo(() => {
        const sources = [];

        // Primary eIDAS sources - always show first
        if (legalSources?.primary) {
            legalSources.primary.forEach(src => {
                sources.push({ ...src, category: 'primary', icon: '📜' });
            });
        }

        // Implementing acts
        if (legalSources?.implementing) {
            legalSources.implementing.forEach(src => {
                sources.push({ ...src, category: 'implementing', icon: '📋' });
            });
        }

        // Related regulations (GDPR, DORA)
        if (legalSources?.related) {
            legalSources.related.forEach(src => {
                sources.push({ ...src, category: 'related', icon: '🔗' });
            });
        }

        // Architecture (ARF)
        if (legalSources?.architecture) {
            legalSources.architecture.forEach(src => {
                sources.push({ ...src, category: 'architecture', icon: '🏗️' });
            });
        }

        return sources;
    }, [legalSources]);

    return (
        <div className="vcq-step">
            <h3>
                <span className="vcq-step-number">2</span>
                Source Selection
            </h3>
            <p className="vcq-step-hint">
                Select which regulatory sources to include. Selecting DORA includes ICT third-party provisions (+12 requirements).
            </p>
            <div className="vcq-source-grid">
                {/* Primary Sources - eIDAS */}
                <div className="vcq-source-group">
                    <h4 className="vcq-source-group-title">📜 Primary (eIDAS 2.0)</h4>
                    <div className="vcq-source-options">
                        {allSources.filter(s => s.category === 'primary').map(src => (
                            <label key={src.id} className={`vcq-source-option ${selectedSources.includes(src.id) ? 'selected' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedSources.includes(src.id)}
                                    onChange={() => onToggle(src.id)}
                                />
                                <span className="vcq-source-name">{src.shortName}</span>
                                <span className="vcq-source-id">({src.id})</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Implementing Acts */}
                <div className="vcq-source-group">
                    <h4 className="vcq-source-group-title">📋 Implementing Acts</h4>
                    <div className="vcq-source-options">
                        {allSources.filter(s => s.category === 'implementing').map(src => (
                            <label key={src.id} className={`vcq-source-option ${selectedSources.includes(src.id) ? 'selected' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedSources.includes(src.id)}
                                    onChange={() => onToggle(src.id)}
                                />
                                <span className="vcq-source-name">{src.shortName}</span>
                                <span className="vcq-source-id">({src.id})</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Related Regulations */}
                <div className="vcq-source-group">
                    <h4 className="vcq-source-group-title">🔗 Related Regulations</h4>
                    <div className="vcq-source-options">
                        {allSources.filter(s => s.category === 'related').map(src => (
                            <label key={src.id} className={`vcq-source-option ${selectedSources.includes(src.id) ? 'selected' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedSources.includes(src.id)}
                                    onChange={() => onToggle(src.id)}
                                />
                                <span className="vcq-source-name">{src.shortName}</span>
                                <span className="vcq-source-id">({src.id})</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Architecture Reference */}
                {allSources.filter(s => s.category === 'architecture').length > 0 && (
                    <div className="vcq-source-group">
                        <h4 className="vcq-source-group-title">🏗️ Architecture</h4>
                        <div className="vcq-source-options">
                            {allSources.filter(s => s.category === 'architecture').map(src => (
                                <label key={src.id} className={`vcq-source-option ${selectedSources.includes(src.id) ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedSources.includes(src.id)}
                                        onChange={() => onToggle(src.id)}
                                    />
                                    <span className="vcq-source-name">{src.shortName}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// SummaryView Component (View A: Dashboard)
// ============================================================================

function SummaryView({ requirements, categories, answers }) {
    // Calculate stats per category
    const categoryStats = useMemo(() => {
        const stats = {};

        categories.forEach(cat => {
            stats[cat.id] = {
                ...cat,
                total: 0,
                critical: 0,
                high: 0,
                answered: 0,
                compliant: 0,
                nonCompliant: 0
            };
        });

        requirements.forEach(req => {
            const cat = stats[req.category];
            if (!cat) return;

            cat.total++;
            if (req.criticality === 'critical') cat.critical++;
            if (req.criticality === 'high') cat.high++;

            const answer = answers[req.id]?.value;
            if (answer && answer !== 'pending') {
                cat.answered++;
                if (answer === 'yes') cat.compliant++;
                if (answer === 'no') cat.nonCompliant++;
            }
        });

        return Object.values(stats).filter(s => s.total > 0);
    }, [requirements, categories, answers]);

    // Overall criticality breakdown
    const criticalityBreakdown = useMemo(() => {
        const breakdown = { critical: 0, high: 0, medium: 0, low: 0 };
        requirements.forEach(req => {
            if (breakdown[req.criticality] !== undefined) {
                breakdown[req.criticality]++;
            }
        });
        return breakdown;
    }, [requirements]);

    return (
        <div className="vcq-summary-view">
            <h3 className="vcq-summary-view-title">📊 Compliance Overview</h3>

            {/* Criticality Breakdown */}
            <div className="vcq-criticality-summary">
                <div className="vcq-crit-card critical">
                    <span className="vcq-crit-count">{criticalityBreakdown.critical}</span>
                    <span className="vcq-crit-label">Critical</span>
                </div>
                <div className="vcq-crit-card high">
                    <span className="vcq-crit-count">{criticalityBreakdown.high}</span>
                    <span className="vcq-crit-label">High</span>
                </div>
                <div className="vcq-crit-card medium">
                    <span className="vcq-crit-count">{criticalityBreakdown.medium}</span>
                    <span className="vcq-crit-label">Medium</span>
                </div>
                <div className="vcq-crit-card low">
                    <span className="vcq-crit-count">{criticalityBreakdown.low}</span>
                    <span className="vcq-crit-label">Low</span>
                </div>
            </div>

            {/* Category Cards */}
            <div className="vcq-category-cards">
                {categoryStats.map(cat => {
                    const progressPercent = cat.total > 0
                        ? Math.round((cat.answered / cat.total) * 100)
                        : 0;

                    return (
                        <div key={cat.id} className="vcq-category-card">
                            <div className="vcq-category-card-header">
                                <span className="vcq-category-icon">{cat.icon}</span>
                                <span className="vcq-category-name">{cat.label}</span>
                            </div>
                            <div className="vcq-category-card-body">
                                <div className="vcq-category-stat-row">
                                    <span>Total Requirements</span>
                                    <span className="vcq-stat-value">{cat.total}</span>
                                </div>
                                {cat.critical > 0 && (
                                    <div className="vcq-category-stat-row critical">
                                        <span>🔴 Critical</span>
                                        <span className="vcq-stat-value">{cat.critical}</span>
                                    </div>
                                )}
                                {cat.high > 0 && (
                                    <div className="vcq-category-stat-row high">
                                        <span>🟠 High Priority</span>
                                        <span className="vcq-stat-value">{cat.high}</span>
                                    </div>
                                )}
                                <div className="vcq-category-progress">
                                    <div className="vcq-progress-bar">
                                        <div
                                            className="vcq-progress-fill"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <span className="vcq-progress-text">
                                        {cat.answered}/{cat.total} answered ({progressPercent}%)
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================================
// RequirementsTable Component (View B: Detailed Table)
// ============================================================================

function RequirementsTable({ requirements, categories, onAnswerChange, answers, regulationsIndex }) {
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterCriticality, setFilterCriticality] = useState('all');

    const filteredRequirements = useMemo(() => {
        return requirements.filter(req => {
            if (filterCategory !== 'all' && req.category !== filterCategory) return false;
            if (filterCriticality !== 'all' && req.criticality !== filterCriticality) return false;
            return true;
        });
    }, [requirements, filterCategory, filterCriticality]);

    // Group by category
    const groupedRequirements = useMemo(() => {
        const groups = {};
        for (const req of filteredRequirements) {
            if (!groups[req.category]) groups[req.category] = [];
            groups[req.category].push(req);
        }
        return groups;
    }, [filteredRequirements]);

    const answerOptions = [
        { value: 'pending', label: 'Select...', icon: '⏳' },
        { value: 'yes', label: 'Yes', icon: '✅' },
        { value: 'no', label: 'No', icon: '❌' },
        { value: 'partial', label: 'Partial', icon: '⚠️' },
        { value: 'na', label: 'N/A', icon: '➖' }
    ];

    const getCriticalityLabel = (criticality) => {
        switch (criticality) {
            case 'critical': return 'Critical';
            case 'high': return 'High';
            case 'medium': return 'Medium';
            case 'low': return 'Low';
            default: return criticality;
        }
    };

    return (
        <div className="vcq-requirements">
            <div className="vcq-requirements-header">
                <h3>Questionnaire Requirements ({filteredRequirements.length})</h3>
                <div className="vcq-requirements-filters">
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="vcq-filter-select"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                        ))}
                    </select>
                    <select
                        value={filterCriticality}
                        onChange={e => setFilterCriticality(e.target.value)}
                        className="vcq-filter-select"
                    >
                        <option value="all">All Criticality</option>
                        <option value="critical">🔴 Critical</option>
                        <option value="high">🟠 High</option>
                        <option value="medium">🔵 Medium</option>
                        <option value="low">🟢 Low</option>
                    </select>
                </div>
            </div>

            <div className="vcq-requirements-table">
                {categories
                    .filter(cat => groupedRequirements[cat.id]?.length > 0)
                    .map(cat => (
                        <div key={cat.id} className="vcq-req-category-group">
                            <h4 className="vcq-req-category-title">
                                {cat.icon} {cat.label}
                            </h4>
                            <table className="vcq-req-table">
                                <thead>
                                    <tr>
                                        <th className="col-id">ID</th>
                                        <th className="col-requirement">Requirement</th>
                                        <th className="col-criticality">Criticality</th>
                                        <th className="col-legal">Legal Basis</th>
                                        <th className="col-answer">Response</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedRequirements[cat.id].map(req => {
                                        const answer = answers[req.id]?.value || 'pending';
                                        return (
                                            <tr key={req.id}>
                                                <td className="col-id">{req.id}</td>
                                                <td className="col-requirement">
                                                    <div className="vcq-req-text">{req.requirement}</div>
                                                    {req.explanation && (
                                                        <details className="vcq-req-details">
                                                            <summary>Details</summary>
                                                            <p>{req.explanation}</p>
                                                            {req.legalText && (
                                                                <blockquote className="vcq-legal-text">
                                                                    {req.legalText}
                                                                </blockquote>
                                                            )}
                                                        </details>
                                                    )}
                                                    {/* RCA Linkage - show linked RP requirements */}
                                                    {req.linkedRCA && req.linkedRCA.length > 0 && (
                                                        <div className="vcq-rca-link">
                                                            <span className="vcq-rca-label">See also:</span>
                                                            {req.linkedRCA.map((rcaId, idx) => (
                                                                <a
                                                                    key={rcaId}
                                                                    href={`${import.meta.env.BASE_URL}#/rca?req=${rcaId}`}
                                                                    className="vcq-rca-ref"
                                                                    title={`View ${rcaId} in RCA Tool`}
                                                                >
                                                                    {rcaId}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="col-criticality">
                                                    <span className={`vcq-criticality-badge ${req.criticality}`}>
                                                        {getCriticalityLabel(req.criticality)}
                                                    </span>
                                                </td>
                                                <td className="col-legal">
                                                    <LegalBasisLink
                                                        legalBasis={req.legalBasis}
                                                        regulationsIndex={regulationsIndex}
                                                    />
                                                </td>
                                                <td className="col-answer">
                                                    <select
                                                        value={answer}
                                                        onChange={e => onAnswerChange(req.id, e.target.value)}
                                                        className={`vcq-answer-select status-${answer}`}
                                                    >
                                                        {answerOptions.map(opt => (
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
// ExportPanel Component
// ============================================================================

function ExportPanel({ requirements, answers, selectedTypes, selectedSources, data }) {
    const handleExportMarkdown = () => {
        const typeLabels = selectedTypes.map(id =>
            data.intermediaryTypes.find(t => t.id === id)?.label || id
        ).join(', ');

        let md = `# Vendor Compliance Questionnaire\n\n`;
        md += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
        md += `**Intermediary Type(s):** ${typeLabels}\n\n`;
        md += `**Regulatory Sources:** ${selectedSources.join(', ')}\n\n`;
        md += `**Total Requirements:** ${requirements.length}\n\n`;
        md += `---\n\n`;

        // Group by category
        const grouped = {};
        requirements.forEach(req => {
            if (!grouped[req.category]) grouped[req.category] = [];
            grouped[req.category].push(req);
        });

        const categories = data.categories;
        categories.forEach(cat => {
            const reqs = grouped[cat.id];
            if (!reqs || reqs.length === 0) return;

            md += `## ${cat.icon} ${cat.label}\n\n`;
            reqs.forEach(req => {
                const answer = answers[req.id]?.value || 'pending';
                const answerIcon = answer === 'yes' ? '✅' : answer === 'no' ? '❌' :
                    answer === 'partial' ? '⚠️' : answer === 'na' ? '➖' : '⏳';

                md += `### ${req.id}\n\n`;
                md += `**Requirement:** ${req.requirement}\n\n`;
                md += `**Criticality:** ${req.criticality}\n\n`;
                md += `**Legal Basis:** ${req.legalBasis?.article} (Reg. ${req.legalBasis?.regulation})\n\n`;
                md += `**Response:** ${answerIcon} ${answer}\n\n`;
                if (req.explanation) {
                    md += `**Details:** ${req.explanation}\n\n`;
                }
                md += `---\n\n`;
            });
        });

        // Download
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vcq-questionnaire-${new Date().toISOString().split('T')[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        const typeLabels = selectedTypes.map(id =>
            data.intermediaryTypes.find(t => t.id === id)?.label || id
        ).join(', ');

        // Group requirements by category
        const grouped = {};
        requirements.forEach(req => {
            if (!grouped[req.category]) grouped[req.category] = [];
            grouped[req.category].push(req);
        });

        // Create print content
        const printContent = document.createElement('div');
        printContent.id = 'vcq-print-container';
        printContent.innerHTML = `
            <style>
                @media print {
                    body * { visibility: hidden; }
                    #vcq-print-container, #vcq-print-container * { visibility: visible; }
                    #vcq-print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        font-size: 11pt;
                        line-height: 1.4;
                        color: #1a1a1a;
                    }
                }
                #vcq-print-container {
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .vcq-pdf-header {
                    text-align: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #00c8c8;
                }
                .vcq-pdf-title {
                    font-size: 24pt;
                    font-weight: 700;
                    color: #0a2a3a;
                    margin: 0 0 8px 0;
                }
                .vcq-pdf-subtitle {
                    font-size: 10pt;
                    color: #666;
                }
                .vcq-pdf-meta {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    margin-bottom: 24px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                }
                .vcq-pdf-meta-item {
                    font-size: 10pt;
                }
                .vcq-pdf-meta-label {
                    font-weight: 600;
                    color: #374151;
                }
                .vcq-pdf-meta-value {
                    color: #1f2937;
                }
                .vcq-pdf-category {
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                }
                .vcq-pdf-category-title {
                    font-size: 14pt;
                    font-weight: 600;
                    color: #0a2a3a;
                    margin: 0 0 12px 0;
                    padding: 8px 12px;
                    background: linear-gradient(90deg, #e0f7fa, #ffffff);
                    border-left: 4px solid #00c8c8;
                }
                .vcq-pdf-req {
                    margin-bottom: 16px;
                    padding: 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    page-break-inside: avoid;
                }
                .vcq-pdf-req-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .vcq-pdf-req-id {
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 10pt;
                    color: #00a8a8;
                    font-weight: 600;
                }
                .vcq-pdf-criticality {
                    font-size: 9pt;
                    font-weight: 500;
                    padding: 2px 8px;
                    border-radius: 12px;
                }
                .vcq-pdf-criticality.critical {
                    background: #fee2e2;
                    color: #dc2626;
                }
                .vcq-pdf-criticality.high {
                    background: #fef3c7;
                    color: #d97706;
                }
                .vcq-pdf-criticality.medium {
                    background: #dbeafe;
                    color: #2563eb;
                }
                .vcq-pdf-criticality.low {
                    background: #dcfce7;
                    color: #16a34a;
                }
                .vcq-pdf-req-text {
                    font-size: 11pt;
                    color: #1f2937;
                    margin-bottom: 8px;
                }
                .vcq-pdf-req-details {
                    font-size: 9pt;
                    color: #6b7280;
                }
                .vcq-pdf-legal {
                    font-size: 9pt;
                    color: #4b5563;
                    font-style: italic;
                }
                .vcq-pdf-response {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px dashed #e5e7eb;
                }
                .vcq-pdf-response-label {
                    font-size: 9pt;
                    font-weight: 600;
                    color: #374151;
                }
                .vcq-pdf-response-value {
                    font-size: 10pt;
                    font-weight: 500;
                }
                .vcq-pdf-response-value.yes { color: #16a34a; }
                .vcq-pdf-response-value.no { color: #dc2626; }
                .vcq-pdf-response-value.partial { color: #d97706; }
                .vcq-pdf-response-value.na { color: #6b7280; }
                .vcq-pdf-response-value.pending { color: #9ca3af; }
                .vcq-pdf-footer {
                    margin-top: 24px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                    font-size: 9pt;
                    color: #9ca3af;
                    text-align: center;
                }
            </style>
            <div class="vcq-pdf-header">
                <h1 class="vcq-pdf-title">📋 Vendor Compliance Questionnaire</h1>
                <p class="vcq-pdf-subtitle">EUDIW Intermediary Assessment</p>
            </div>
            <div class="vcq-pdf-meta">
                <div class="vcq-pdf-meta-item">
                    <span class="vcq-pdf-meta-label">Generated:</span>
                    <span class="vcq-pdf-meta-value">${new Date().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        })}</span>
                </div>
                <div class="vcq-pdf-meta-item">
                    <span class="vcq-pdf-meta-label">Total Requirements:</span>
                    <span class="vcq-pdf-meta-value">${requirements.length}</span>
                </div>
                <div class="vcq-pdf-meta-item">
                    <span class="vcq-pdf-meta-label">Intermediary Type(s):</span>
                    <span class="vcq-pdf-meta-value">${typeLabels}</span>
                </div>
                <div class="vcq-pdf-meta-item">
                    <span class="vcq-pdf-meta-label">Regulatory Sources:</span>
                    <span class="vcq-pdf-meta-value">${selectedSources.join(', ')}</span>
                </div>
            </div>
            ${data.categories.map(cat => {
            const reqs = grouped[cat.id];
            if (!reqs || reqs.length === 0) return '';
            return `
                    <div class="vcq-pdf-category">
                        <h2 class="vcq-pdf-category-title">${cat.icon} ${cat.label} (${reqs.length})</h2>
                        ${reqs.map(req => {
                const answer = answers[req.id]?.value || 'pending';
                const answerDisplay = {
                    yes: '✅ Yes',
                    no: '❌ No',
                    partial: '⚠️ Partial',
                    na: '➖ N/A',
                    pending: '⏳ Pending'
                }[answer] || answer;
                return `
                                <div class="vcq-pdf-req">
                                    <div class="vcq-pdf-req-header">
                                        <span class="vcq-pdf-req-id">${req.id}</span>
                                        <span class="vcq-pdf-criticality ${req.criticality}">${req.criticality.charAt(0).toUpperCase() + req.criticality.slice(1)}</span>
                                    </div>
                                    <p class="vcq-pdf-req-text">${req.requirement}</p>
                                    ${req.explanation ? `<p class="vcq-pdf-req-details">${req.explanation}</p>` : ''}
                                    <p class="vcq-pdf-legal">Legal Basis: ${req.legalBasis?.article || 'N/A'} (${req.legalBasis?.regulation || 'N/A'})</p>
                                    <div class="vcq-pdf-response">
                                        <span class="vcq-pdf-response-label">Response:</span>
                                        <span class="vcq-pdf-response-value ${answer}">${answerDisplay}</span>
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                `;
        }).join('')}
            <div class="vcq-pdf-footer">
                Generated by eIDAS 2.0 Documentation Portal — Vendor Compliance Questionnaire Tool
            </div>
        `;

        // Add to document and print
        document.body.appendChild(printContent);

        // Small delay to ensure styles are applied
        setTimeout(() => {
            window.print();
            // Clean up after print dialog closes
            setTimeout(() => {
                document.body.removeChild(printContent);
            }, 1000);
        }, 100);
    };

    return (
        <div className="vcq-export-panel">
            <h3>📥 Export Questionnaire</h3>
            <div className="vcq-export-options">
                <button className="vcq-export-btn" onClick={handleExportMarkdown}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                    </svg>
                    Export as Markdown
                </button>
                <button className="vcq-export-btn" onClick={handleExportPDF}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                    </svg>
                    Export as PDF
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function VendorQuestionnaire() {
    const { data, loading, error } = useVCQData();
    const regulationsIndex = useRegulationsIndex();

    // Selection state
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedSources, setSelectedSources] = useState(['2014/910', '2024/1183']); // Default: eIDAS sources
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [activeView, setActiveView] = useState(() => {
        // Load saved view preference
        const saved = localStorage.getItem('vcq-active-view');
        return saved === 'table' ? 'table' : 'summary';
    });

    // Load saved answers from localStorage
    useEffect(() => {
        const savedAnswers = localStorage.getItem('vcq-answers');
        if (savedAnswers) {
            try {
                setAnswers(JSON.parse(savedAnswers));
            } catch (e) {
                console.error('Failed to load saved answers:', e);
            }
        }
    }, []);

    // Save answers to localStorage
    useEffect(() => {
        if (Object.keys(answers).length > 0) {
            localStorage.setItem('vcq-answers', JSON.stringify(answers));
        }
    }, [answers]);

    // Save view preference to localStorage
    useEffect(() => {
        localStorage.setItem('vcq-active-view', activeView);
    }, [activeView]);

    // Toggle intermediary type selection
    const handleToggleType = useCallback((typeId) => {
        setSelectedTypes(prev =>
            prev.includes(typeId)
                ? prev.filter(id => id !== typeId)
                : [...prev, typeId]
        );
        setShowResults(false);
    }, []);

    // Toggle source selection
    const handleToggleSource = useCallback((sourceId) => {
        setSelectedSources(prev =>
            prev.includes(sourceId)
                ? prev.filter(id => id !== sourceId)
                : [...prev, sourceId]
        );
        setShowResults(false);
    }, []);

    // Update answer
    const handleAnswerChange = useCallback((reqId, value) => {
        setAnswers(prev => ({
            ...prev,
            [reqId]: {
                value,
                updated: new Date().toISOString()
            }
        }));
    }, []);

    // Get applicable requirements based on selection
    const applicableRequirements = useMemo(() => {
        if (!data || selectedTypes.length === 0) return [];

        const reqIds = new Set();

        // Always include core requirements
        data.requirementsByType?.core?.forEach(id => reqIds.add(id));

        // Add type-specific requirements
        selectedTypes.forEach(typeId => {
            data.requirementsByType?.[typeId]?.forEach(id => reqIds.add(id));
        });

        // If DORA is selected in sources, include DORA ICT (extended) requirements
        if (selectedSources.includes('2022/2554')) {
            data.requirementsByType?.dora_ict?.forEach(id => reqIds.add(id));
        }

        // Filter by type first
        let filtered = data.requirements.filter(req => reqIds.has(req.id));

        // Then filter by selected sources (if any sources are selected)
        if (selectedSources.length > 0) {
            filtered = filtered.filter(req => {
                // Check if the requirement's legal basis matches any selected source
                const regId = req.legalBasis?.regulation;
                if (!regId) return true; // Include requirements without explicit source
                return selectedSources.includes(regId);
            });
        }

        return filtered;
    }, [data, selectedTypes, selectedSources]);

    // Calculate summary stats
    const summaryStats = useMemo(() => {
        const total = applicableRequirements.length;
        let answered = 0;
        let compliant = 0;
        let nonCompliant = 0;

        applicableRequirements.forEach(req => {
            const answer = answers[req.id]?.value;
            if (answer && answer !== 'pending') {
                answered++;
                if (answer === 'yes') compliant++;
                if (answer === 'no') nonCompliant++;
            }
        });

        return { total, answered, compliant, nonCompliant };
    }, [applicableRequirements, answers]);

    // Loading/error states
    if (loading) {
        return (
            <div className="animate-fadeIn" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                <div className="loading-spinner" />
                <p className="text-muted" style={{ marginTop: 'var(--space-4)' }}>Loading VCQ data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-fadeIn" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                <p className="text-lg" style={{ color: 'var(--status-error)' }}>
                    Failed to load VCQ data
                </p>
                <p className="text-muted">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="vcq-header">
                <h1>📋 Vendor Compliance Questionnaire</h1>
                <p className="vcq-header-subtitle">
                    Generate role-specific compliance questionnaires for evaluating third-party
                    intermediaries in the EUDIW ecosystem. Select the intermediary type(s) you are
                    assessing, configure any extended regulatory scope, and generate a structured
                    questionnaire with guidance on each requirement.
                </p>
            </div>

            {/* Step 1: Intermediary Type Selection */}
            <IntermediaryTypeSelector
                types={data.intermediaryTypes}
                selectedTypes={selectedTypes}
                onToggle={handleToggleType}
                requirementsByType={data.requirementsByType}
            />

            {/* Step 2: Source Selection (only show if types selected) */}
            {selectedTypes.length > 0 && data.legalSources && (
                <SourceSelector
                    legalSources={data.legalSources}
                    selectedSources={selectedSources}
                    onToggle={handleToggleSource}
                />
            )}

            {/* Generate Button */}
            {selectedTypes.length > 0 && !showResults && (
                <div className="vcq-generate-section">
                    <button
                        className="vcq-generate-btn"
                        onClick={() => setShowResults(true)}
                    >
                        Generate Questionnaire
                        <span style={{ fontSize: 'var(--text-sm)', opacity: 0.8 }}>
                            ({applicableRequirements.length} requirements)
                        </span>
                    </button>
                </div>
            )}

            {/* Results Section */}
            {showResults && (
                <>
                    {/* Summary Panel */}
                    <div className="vcq-summary">
                        <div className="vcq-summary-stats">
                            <div className="vcq-summary-stat">
                                <div className="vcq-summary-stat-value">{summaryStats.total}</div>
                                <div className="vcq-summary-stat-label">Total</div>
                            </div>
                            <div className="vcq-summary-stat">
                                <div className="vcq-summary-stat-value">{summaryStats.answered}</div>
                                <div className="vcq-summary-stat-label">Answered</div>
                            </div>
                            <div className="vcq-summary-stat">
                                <div className="vcq-summary-stat-value" style={{ color: '#22c55e' }}>
                                    {summaryStats.compliant}
                                </div>
                                <div className="vcq-summary-stat-label">Compliant</div>
                            </div>
                            <div className="vcq-summary-stat">
                                <div className="vcq-summary-stat-value" style={{ color: '#ef4444' }}>
                                    {summaryStats.nonCompliant}
                                </div>
                                <div className="vcq-summary-stat-label">Non-Compliant</div>
                            </div>
                        </div>
                        <div className="vcq-summary-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowResults(false)}
                            >
                                ← Modify Selection
                            </button>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="vcq-view-toggle">
                        <button
                            className={`vcq-view-btn ${activeView === 'summary' ? 'active' : ''}`}
                            onClick={() => setActiveView('summary')}
                        >
                            📊 Overview
                        </button>
                        <button
                            className={`vcq-view-btn ${activeView === 'table' ? 'active' : ''}`}
                            onClick={() => setActiveView('table')}
                        >
                            📋 Details
                        </button>
                    </div>

                    {/* View Content */}
                    {activeView === 'summary' ? (
                        <SummaryView
                            requirements={applicableRequirements}
                            categories={data.categories}
                            answers={answers}
                        />
                    ) : (
                        <RequirementsTable
                            requirements={applicableRequirements}
                            categories={data.categories}
                            onAnswerChange={handleAnswerChange}
                            answers={answers}
                            regulationsIndex={regulationsIndex}
                        />
                    )}

                    {/* Export Panel */}
                    <ExportPanel
                        requirements={applicableRequirements}
                        answers={answers}
                        selectedTypes={selectedTypes}
                        selectedSources={selectedSources}
                        data={data}
                    />
                </>
            )}
        </div>
    );
}
