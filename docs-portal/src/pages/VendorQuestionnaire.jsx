/**
 * VendorQuestionnaire (VCQ) Page
 * 
 * Vendor Compliance Questionnaire generator for Relying Parties evaluating
 * third-party RP Intermediaries in the EUDIW ecosystem.
 * 
 * Updated: 2026-01-26 (DEC-254: Consolidated PIF/VIF into single RP Intermediary)
 * - Removed Intermediary Type selection step (was Step 1)
 * - Now auto-selects the single "intermediary" type
 * - Source Selection is now the only configuration step
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRegulationsIndex } from '../hooks/useRegulationsIndex';
import { LegalBasisLink } from '../components/LegalBasisLink';
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

// Load ARF HLR data for deep linking and popovers
function useARFData() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}data/arf-hlr-data.json`)
            .then(res => res.ok ? res.json() : null)
            .then(setData)
            .catch(() => setData(null)); // Graceful fallback if file doesn't exist
    }, []);

    return data;
}

// ============================================================================
// ARFReferenceLink Component
// Links to the official Architecture and Reference Framework on GitHub
// Now enhanced with deep linking via imported ARF data
// ============================================================================

function ARFReferenceLink({ arfReference, arfData }) {
    const [showPopover, setShowPopover] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const hideTimeoutRef = useRef(null);

    if (!arfReference) return null;

    const { topic, hlr } = arfReference;

    // Look up HLR in imported ARF data for deep link and metadata
    const arfReq = arfData?.byHlrId?.[hlr];

    // Use deep link from ARF data if available, otherwise fallback
    const arfUrl = arfReq?.deepLink ||
        'https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md';

    // Get display info
    const topicTitle = arfReq?.topicTitle || topic;
    const topicNumber = arfReq?.topicNumber || topic.replace('Topic ', '');
    const specification = arfReq?.specification;
    const notes = arfReq?.notes;
    const isEmpty = arfReq?.isEmpty;

    const handleMouseEnter = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }

        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const popoverHeight = 200; // Approximate height
            const spaceAbove = rect.top;
            const showBelow = spaceAbove < popoverHeight + 20;

            setPopoverPosition({
                top: showBelow ? rect.bottom + 8 : rect.top - popoverHeight - 8,
                left: Math.max(8, Math.min(rect.left, window.innerWidth - 420))
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

    return (
        <span className="vcq-arf-wrapper">
            <a
                ref={triggerRef}
                href={arfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`vcq-arf-link ${isEmpty ? 'vcq-arf-empty' : ''}`}
                title={specification ? specification.substring(0, 200) + '...' : `View ${topic} in ARF on GitHub`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <span className="vcq-arf-icon">📐</span>
                <span className="vcq-arf-ref">{hlr}</span>
                <span className="vcq-arf-topic">(Topic {topicNumber})</span>
            </a>

            {showPopover && arfReq && !isEmpty && (
                <div
                    className="vcq-arf-popover"
                    style={{
                        position: 'fixed',
                        top: `${popoverPosition.top}px`,
                        left: `${popoverPosition.left}px`,
                    }}
                    onMouseEnter={handlePopoverMouseEnter}
                    onMouseLeave={handlePopoverMouseLeave}
                >
                    <div className="vcq-arf-popover-header">
                        <span className="vcq-arf-popover-id">{hlr}</span>
                        <span className="vcq-arf-popover-topic">Topic {topicNumber}</span>
                    </div>
                    <div className="vcq-arf-popover-title">{topicTitle}</div>
                    <div className="vcq-arf-popover-spec">
                        {specification?.length > 300
                            ? specification.substring(0, 300) + '...'
                            : specification
                        }
                    </div>
                    {notes && (
                        <div className="vcq-arf-popover-notes">
                            <strong>Note:</strong> {notes.substring(0, 150)}...
                        </div>
                    )}
                    <div className="vcq-arf-popover-action">
                        View in ARF →
                    </div>
                </div>
            )}
        </span>
    );
}

// ============================================================================
// IntermediaryTypeSelector Component
// DEC-254: This component is deprecated. The VCQ now auto-selects the single
// RP Intermediary type. Kept for reference during transition.
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
// SourceSelector Component (DEC-255: Simplified to 3-tile model)
// Filter requirements by source group, not individual regulations
// ============================================================================

function SourceSelector({ legalSources, selectedSourceGroups, onToggleGroup, stats }) {
    // Get counts from stats if available
    const eidasCount = stats?.bySourceGroup?.eidas || 0;
    const gdprCount = stats?.bySourceGroup?.gdpr || 0;
    const doraCount = stats?.bySourceGroup?.dora || 0;
    const arfCount = stats?.bySourceGroup?.arf || 0;

    return (
        <div className="vcq-step">
            <h3>
                <span className="vcq-step-number">1</span>
                Source Selection
            </h3>
            <p className="vcq-step-hint">
                Filter requirements by regulatory source. These are <strong>filters</strong>, not opt-outs — select sources to analyze their requirements.
            </p>
            <div className="vcq-source-grid vcq-source-grid-3">
                {/* Primary Sources - eIDAS Framework (bundled) */}
                <div className={`vcq-source-tile ${selectedSourceGroups.eidas ? 'selected' : ''}`}>
                    <label className="vcq-tile-header">
                        <input
                            type="checkbox"
                            checked={selectedSourceGroups.eidas}
                            onChange={() => onToggleGroup('eidas')}
                        />
                        <span className="vcq-tile-icon">{legalSources?.eidas?.icon || '📜'}</span>
                        <span className="vcq-tile-title">Primary (eIDAS Framework)</span>
                        <span className="vcq-tile-count">{eidasCount} reqs</span>
                    </label>
                    <p className="vcq-tile-description">
                        {legalSources?.eidas?.description || 'Core eIDAS Regulation and all Implementing Acts'}
                    </p>
                    <div className="vcq-tile-includes">
                        <span className="vcq-tile-includes-label">Includes (RP-relevant acts):</span>
                        <ul className="vcq-tile-includes-list">
                            {legalSources?.eidas?.items?.map(item => (
                                <li key={item.id}>
                                    <span className="vcq-includes-name">{item.shortName}</span>
                                    {item.type === 'implementing_act' && (
                                        <span className="vcq-includes-type">IA</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Related Regulations (GDPR, DORA) */}
                <div className={`vcq-source-tile ${(selectedSourceGroups.gdpr || selectedSourceGroups.dora) ? 'selected' : ''}`}>
                    <div className="vcq-tile-header vcq-tile-header-multi">
                        <span className="vcq-tile-icon">{legalSources?.related?.icon || '🔗'}</span>
                        <span className="vcq-tile-title">Related Regulations</span>
                        <span className="vcq-tile-count">{gdprCount + doraCount} reqs</span>
                    </div>
                    <p className="vcq-tile-description">
                        {legalSources?.related?.description || 'Additional legal requirements based on your context'}
                    </p>
                    <div className="vcq-tile-options">
                        {legalSources?.related?.items?.map(item => {
                            // Map regulation IDs to source groups
                            const groupId = item.id === '2016/679' ? 'gdpr' : 'dora';
                            const isSelected = selectedSourceGroups[groupId];

                            return (
                                <label
                                    key={item.id}
                                    className={`vcq-tile-option ${isSelected ? 'selected' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => onToggleGroup(groupId)}
                                    />
                                    <span className="vcq-option-name">{item.shortName}</span>
                                    {item.hint && <span className="vcq-option-hint">{item.hint}</span>}
                                    {item.extraRequirements && (
                                        <span className="vcq-option-extra">+{item.extraRequirements} reqs</span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Architecture — technical specifications (category with items) */}
                <div className={`vcq-source-tile ${selectedSourceGroups.arf ? 'selected' : ''}`}>
                    <div className="vcq-tile-header vcq-tile-header-multi">
                        <span className="vcq-tile-icon">{legalSources?.architecture?.icon || '🏗️'}</span>
                        <span className="vcq-tile-title">Architecture</span>
                        <span className="vcq-tile-count">{arfCount} reqs</span>
                    </div>
                    <p className="vcq-tile-description">
                        Implementation guidance
                        <span className="vcq-tile-note-inline"> · Non-binding but practically essential</span>
                    </p>
                    <div className="vcq-tile-options">
                        {legalSources?.architecture?.items?.map(item => (
                            <label
                                key={item.id}
                                className={`vcq-tile-option ${selectedSourceGroups.arf ? 'selected' : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedSourceGroups.arf}
                                    onChange={() => onToggleGroup('arf')}
                                />
                                <span className="vcq-option-name">{item.shortName}</span>
                                {item.version && <span className="vcq-option-hint">v{item.version}</span>}
                                <span className="vcq-option-extra">+{arfCount} reqs</span>
                            </label>
                        ))}
                    </div>
                </div>
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

    // Overall RFC 2119 obligation breakdown
    const obligationBreakdown = useMemo(() => {
        const breakdown = { 'MUST': 0, 'MUST NOT': 0, 'SHOULD': 0, 'SHOULD NOT': 0, 'MAY': 0 };
        requirements.forEach(req => {
            if (req.obligation && breakdown[req.obligation] !== undefined) {
                breakdown[req.obligation]++;
            }
        });
        return breakdown;
    }, [requirements]);

    return (
        <div className="vcq-summary-view">
            <h3 className="vcq-summary-view-title">📊 Compliance Overview</h3>

            {/* RFC 2119 Obligation Breakdown */}
            <div className="vcq-obligation-summary">
                <div className="vcq-obl-card must">
                    <span className="vcq-obl-count">{obligationBreakdown['MUST']}</span>
                    <span className="vcq-obl-label">MUST</span>
                </div>
                <div className="vcq-obl-card should">
                    <span className="vcq-obl-count">{obligationBreakdown['SHOULD']}</span>
                    <span className="vcq-obl-label">SHOULD</span>
                </div>
                <div className="vcq-obl-card may">
                    <span className="vcq-obl-count">{obligationBreakdown['MAY']}</span>
                    <span className="vcq-obl-label">MAY</span>
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

function RequirementsTable({ requirements, categories, onAnswerChange, answers, regulationsIndex, arfData }) {
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterObligation, setFilterObligation] = useState('all');

    const filteredRequirements = useMemo(() => {
        return requirements.filter(req => {
            if (filterCategory !== 'all' && req.category !== filterCategory) return false;
            if (filterObligation !== 'all' && req.obligation !== filterObligation) return false;
            return true;
        });
    }, [requirements, filterCategory, filterObligation]);

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

    // RFC 2119 obligation class mapping
    const getObligationClass = (obligation) => {
        switch (obligation) {
            case 'MUST': return 'must';
            case 'MUST NOT': return 'must-not';
            case 'SHOULD': return 'should';
            case 'SHOULD NOT': return 'should-not';
            case 'MAY': return 'may';
            default: return 'should';
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
                        value={filterObligation}
                        onChange={e => setFilterObligation(e.target.value)}
                        className="vcq-filter-select"
                    >
                        <option value="all">All Obligations</option>
                        <option value="MUST">🔴 MUST</option>
                        <option value="SHOULD">🟠 SHOULD</option>
                        <option value="MAY">🟢 MAY</option>
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
                                        <th className="col-obligation">Obligation</th>
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
                                                <td className="col-obligation">
                                                    <span className={`vcq-obligation-badge ${getObligationClass(req.obligation)}`}>
                                                        {req.obligation}
                                                    </span>
                                                </td>
                                                <td className="col-legal">
                                                    {req.legalBasis && (
                                                        <LegalBasisLink
                                                            legalBasis={req.legalBasis}
                                                            regulationsIndex={regulationsIndex}
                                                        />
                                                    )}
                                                    {req.arfReference && (
                                                        <ARFReferenceLink
                                                            arfReference={req.arfReference}
                                                            arfData={arfData}
                                                        />
                                                    )}
                                                    {!req.legalBasis && !req.arfReference && (
                                                        <span className="vcq-no-basis">—</span>
                                                    )}
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

function ExportPanel({ requirements, answers, selectedTypes, selectedSourceGroups, data }) {
    const handleExportMarkdown = () => {
        const typeLabels = selectedTypes.map(id =>
            data.intermediaryTypes.find(t => t.id === id)?.label || id
        ).join(', ');

        // DEC-255: Format source groups for display
        const activeSources = Object.entries(selectedSourceGroups)
            .filter(([_, isSelected]) => isSelected)
            .map(([group]) => group.toUpperCase())
            .join(', ');

        let md = `# Vendor Compliance Questionnaire\n\n`;
        md += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
        md += `**Intermediary Type(s):** ${typeLabels}\n\n`;
        md += `**Source Groups:** ${activeSources || 'None'}\n\n`;
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
                md += `**Obligation:** ${req.obligation}\n\n`;
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
                .vcq-pdf-obligation {
                    font-size: 9pt;
                    font-weight: 600;
                    font-family: 'Consolas', 'Monaco', monospace;
                    padding: 2px 8px;
                    border-radius: 12px;
                }
                .vcq-pdf-obligation.must {
                    background: #fee2e2;
                    color: #dc2626;
                }
                .vcq-pdf-obligation.should {
                    background: #fef3c7;
                    color: #d97706;
                }
                .vcq-pdf-obligation.may {
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
                                        <span class="vcq-pdf-obligation ${req.obligation?.toLowerCase().replace(' ', '-') || 'should'}">${req.obligation}</span>
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
    const arfData = useARFData();

    // Selection state
    // DEC-254: Auto-select the single intermediary type when data loads
    const [selectedTypes, setSelectedTypes] = useState(['intermediary']);
    // DEC-255: Source groups instead of individual source IDs
    const [selectedSourceGroups, setSelectedSourceGroups] = useState({
        eidas: true,  // Primary eIDAS framework
        gdpr: true,   // GDPR requirements (separate toggle)
        dora: false,  // DORA ICT requirements
        arf: true     // ARF-sourced requirements
    });
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

    // DEC-254: Intermediary type is now auto-selected, no toggle needed
    // Kept for backwards compatibility if we ever need multiple types again
    const handleToggleType = useCallback((typeId) => {
        setSelectedTypes(prev =>
            prev.includes(typeId)
                ? prev.filter(id => id !== typeId)
                : [...prev, typeId]
        );
        setShowResults(false);
    }, []);

    // DEC-255: Toggle source group selection
    const handleToggleSourceGroup = useCallback((groupId) => {
        setSelectedSourceGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
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
    // DEC-254: Now always includes 'intermediary' type requirements
    // DEC-255: Filter by sourceGroup instead of individual regulation IDs
    const applicableRequirements = useMemo(() => {
        if (!data) return [];

        const reqIds = new Set();

        // Always include core requirements
        data.requirementsByType?.core?.forEach(id => reqIds.add(id));

        // Add type-specific requirements
        selectedTypes.forEach(typeId => {
            data.requirementsByType?.[typeId]?.forEach(id => reqIds.add(id));
        });

        // If DORA is selected, include DORA ICT (extended) requirements
        if (selectedSourceGroups.dora) {
            data.requirementsByType?.dora_ict?.forEach(id => reqIds.add(id));
        }

        // Filter by type first
        let filtered = data.requirements.filter(req => reqIds.has(req.id));

        // DEC-255: Filter by source group using the pre-computed sourceGroup field
        // Build array of active source groups
        const activeGroups = Object.entries(selectedSourceGroups)
            .filter(([_, isSelected]) => isSelected)
            .map(([group]) => group);

        // If at least one source group is selected, filter by it
        if (activeGroups.length > 0) {
            filtered = filtered.filter(req => {
                // Use the sourceGroup field computed by build-vcq.js
                // Note: GDPR requirements are tagged as 'eidas' since they're part of core compliance
                return activeGroups.includes(req.sourceGroup);
            });
        } else {
            // No source groups selected = show nothing (valid filter state)
            filtered = [];
        }

        return filtered;
    }, [data, selectedTypes, selectedSourceGroups]);

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
                    Generate compliance questionnaires for evaluating third-party RP Intermediary
                    vendors in the EUDIW ecosystem. Select the regulatory sources to include,
                    and generate a structured questionnaire with guidance on each requirement.
                </p>
            </div>

            {/* DEC-254: Removed Intermediary Type Selection step */}
            {/* The tool now auto-selects the single RP Intermediary type */}
            {/* Previously: <IntermediaryTypeSelector ... /> */}

            {/* Step 1: Source Selection (DEC-255: 3-tile model) */}
            {data.legalSources && (
                <SourceSelector
                    legalSources={data.legalSources}
                    selectedSourceGroups={selectedSourceGroups}
                    onToggleGroup={handleToggleSourceGroup}
                    stats={data.stats}
                />
            )}

            {/* Generate Button */}
            {!showResults && (
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
                            <a
                                href={`${import.meta.env.BASE_URL}#/requirements?sources=vcq&roles=${selectedTypes.join(',')}`}
                                className="btn btn-secondary"
                                style={{ textDecoration: 'none' }}
                            >
                                🔍 Browse All Requirements
                            </a>
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
                            arfData={arfData}
                        />
                    )}

                    {/* Export Panel */}
                    <ExportPanel
                        requirements={applicableRequirements}
                        answers={answers}
                        selectedTypes={selectedTypes}
                        selectedSourceGroups={selectedSourceGroups}
                        data={data}
                    />
                </>
            )}
        </div>
    );
}
