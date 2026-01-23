/**
 * RequirementDetail Component
 * 
 * Modal view for full requirement details
 */

import React, { useEffect } from 'react';
import './RequirementDetail.css';

function RequirementDetail({ requirement: req, sourcesConfig, onClose }) {
    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const getSourceInfo = (sourceId) => {
        return sourcesConfig.sources?.[sourceId] || { name: sourceId, icon: '📄', color: '#666' };
    };

    const getRoleInfo = (roleId) => {
        return sourcesConfig.roles?.[roleId] || { label: roleId, icon: '👤' };
    };

    const getComplianceInfo = (level) => {
        return sourcesConfig.complianceLevels?.[level] || { label: level, color: '#666' };
    };

    const getCriticalityInfo = (level) => {
        return sourcesConfig.criticalities?.[level] || { label: level, color: '#666' };
    };

    const sourceInfo = getSourceInfo(req.source);
    const complianceInfo = getComplianceInfo(req.complianceLevel);
    const criticalityInfo = getCriticalityInfo(req.criticality);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const copyLink = () => {
        const url = `${window.location.origin}/requirements?id=${req.id}`;
        navigator.clipboard.writeText(url);
        // Could add toast notification here
    };

    return (
        <div className="requirement-detail-backdrop" onClick={handleBackdropClick}>
            <div className="requirement-detail-modal">
                {/* Header */}
                <header className="detail-header">
                    <div className="detail-title">
                        <code className="detail-id">{req.id}</code>
                        {req.harmonizedId && (
                            <span className="detail-harmonized-id">({req.harmonizedId})</span>
                        )}
                    </div>
                    <button className="detail-close" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </header>

                {/* Source Badge */}
                <div className="detail-source">
                    <span
                        className="source-badge large"
                        style={{ '--source-color': sourceInfo.color }}
                    >
                        {sourceInfo.icon} {sourceInfo.name}
                    </span>
                    {req.arfTopic && (
                        <span className="topic-badge">
                            Topic {req.arfTopic.number}: {req.arfTopic.title}
                        </span>
                    )}
                </div>

                {/* Badges Row */}
                <div className="detail-badges">
                    <span
                        className={`compliance-badge large ${req.complianceLevel}`}
                        style={{ '--compliance-color': complianceInfo.color }}
                    >
                        {complianceInfo.icon} {complianceInfo.label}
                    </span>
                    <span
                        className="criticality-badge large"
                        style={{ backgroundColor: criticalityInfo.color }}
                    >
                        {criticalityInfo.label}
                    </span>
                    {req.category && (
                        <span className="category-badge">
                            {req.category}
                        </span>
                    )}
                </div>

                {/* Requirement Text */}
                <section className="detail-section">
                    <h3>Requirement</h3>
                    <p className="requirement-text">{req.requirement}</p>
                </section>

                {/* Explanation */}
                {req.explanation && (
                    <section className="detail-section">
                        <h3>Explanation</h3>
                        <p className="explanation-text">{req.explanation}</p>
                    </section>
                )}

                {/* Notes */}
                {req.notes && (
                    <section className="detail-section">
                        <h3>Notes</h3>
                        <p className="notes-text">{req.notes}</p>
                    </section>
                )}

                {/* Applicable Roles */}
                {req.roles && req.roles.length > 0 && (
                    <section className="detail-section">
                        <h3>Applies To</h3>
                        <div className="role-list">
                            {req.roles.map(role => {
                                const roleInfo = getRoleInfo(role);
                                return (
                                    <span key={role} className="role-tag">
                                        {roleInfo.icon} {roleInfo.label}
                                    </span>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Legal Basis */}
                {req.legalBasis && (
                    <section className="detail-section">
                        <h3>Legal Basis</h3>
                        <div className="legal-basis">
                            <span className="regulation-ref">
                                Regulation {req.legalBasis.regulation}
                            </span>
                            <span className="article-ref">
                                {req.legalBasis.article}
                                {req.legalBasis.paragraph && ` (${req.legalBasis.paragraph})`}
                            </span>
                        </div>
                        {req.legalText && (
                            <blockquote className="legal-text">{req.legalText}</blockquote>
                        )}
                    </section>
                )}

                {/* Technical References */}
                {req.technicalReferences && req.technicalReferences.length > 0 && (
                    <section className="detail-section">
                        <h3>Technical References</h3>
                        <ul className="tech-refs">
                            {req.technicalReferences.map((ref, idx) => (
                                <li key={idx}>
                                    <strong>{ref.specification}</strong>
                                    {ref.title && ` - ${ref.title}`}
                                    {ref.scope && ref.scope !== 'full' && ` (${ref.scope})`}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* ARF Reference */}
                {req.arfReference && (
                    <section className="detail-section">
                        <h3>ARF Reference</h3>
                        <p>
                            {req.arfReference.topic} → <code>{req.arfReference.hlr}</code>
                        </p>
                    </section>
                )}

                {/* Linked Requirements */}
                {req.linkedRequirements && req.linkedRequirements.length > 0 && (
                    <section className="detail-section">
                        <h3>Related Requirements</h3>
                        <div className="linked-reqs">
                            {req.linkedRequirements.map(linkedId => (
                                <button key={linkedId} className="linked-req-btn">
                                    {linkedId}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Actions */}
                <footer className="detail-footer">
                    <button className="action-btn" onClick={copyLink}>
                        🔗 Copy Link
                    </button>
                    {req.source === 'arf-hlr' && req.arfTopic && (
                        <button className="action-btn">
                            📄 View in ARF Document
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
}

export default RequirementDetail;
