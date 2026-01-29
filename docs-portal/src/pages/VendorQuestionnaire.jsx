/**
 * VendorQuestionnaire (VCQ) Page
 * 
 * Vendor Compliance Questionnaire generator for organizations evaluating
 * third-party products to integrate with the EUDIW ecosystem.
 * 
 * Updated: 2026-01-28 (DEC-257: Role/Category filtering now functional)
 * - Step 1: Organisation Role Selection (Relying Party, Issuer)
 * - Step 2: Product Category Selection (Connector, Issuance Platform, Trust Services)
 * - Step 3: Source Selection (eIDAS, Related Regulations, Tech Specs)
 * 
 * Note: Role/Category selection now filters requirements using schema v2
 * requirementsByRole and requirementsByProductCategory indexes.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRegulationsIndex } from '../hooks/useRegulationsIndex';
import { useArticleExcerpts } from '../hooks/useArticleExcerpts';
import { LegalBasisLink, LegalBasesLinks } from '../components/LegalBasisLink';
import { exportToExcel } from '../utils/vcq/exportExcel';
import './VendorQuestionnaire.css';

// ============================================================================
// Constants
// ============================================================================

const ORGANISATION_ROLES = {
    relying_party: {
        id: 'relying_party',
        label: 'Relying Party',
        shortLabel: 'RP',
        description: 'Accept and verify credentials from EUDI Wallets. Banks, e-commerce platforms, and public services must accept EUDI Wallets for authentication by Dec 2027.',
        icon: '🏢',
        keyCapabilities: [
            'Accept user authentication via EUDI Wallet',
            'Verify PID and attestations from wallets',
            'Strong Customer Authentication (SCA) for payments',
            'KYC/AML identity verification'
        ],
        technicalSpecs: ['TS5', 'TS7', 'TS12'],
        applicableCategories: ['connector', 'trust_services']
    },
    issuer: {
        id: 'issuer',
        label: 'Attestation Issuer',
        shortLabel: 'Issuer',
        description: 'Issue attestations into EUDI Wallets. Any entity that is an "authentic source" for data can issue attestations — banks (account ownership, SCA), universities (diplomas), employers (employment proof), etc.',
        icon: '📝',
        keyCapabilities: [
            'Issue Electronic Attestations of Attributes (EAAs)',
            'Issue SCA Attestations for payment authentication (TS12)',
            'Credential lifecycle management (issuance, revocation)',
            'Integration with organisational authentic data sources'
        ],
        technicalSpecs: ['TS2', 'TS6', 'TS11', 'TS12'],
        applicableCategories: ['issuance_platform', 'trust_services']
    }
};

const PRODUCT_CATEGORIES = {
    connector: {
        id: 'connector',
        label: 'Connector',
        shortLabel: 'Connector',
        description: 'Integration API/middleware for EUDI Wallet interactions. Handles credential verification, identity verification, and RP authentication.',
        icon: '🔌',
        applicableRoles: ['relying_party'],
        keyCapabilities: [
            'Single API to interact with multiple EUDI Wallets',
            'Credential verification and signature validation',
            'Identity verification',
            'RP authentication against wallet',
            'Trusted List integration'
        ],
        technicalSpecs: ['TS5', 'TS7', 'TS12']
    },
    issuance_platform: {
        id: 'issuance_platform',
        label: 'Issuance Platform',
        shortLabel: 'Issuance',
        description: 'Platform for creating and issuing attestations into EUDI Wallets. Provides credential management, signing infrastructure, and data source integration.',
        icon: '📤',
        applicableRoles: ['issuer'],
        keyCapabilities: [
            'Attestation creation and signing',
            'OpenID4VCI protocol implementation',
            'Credential lifecycle management',
            'Revocation management',
            'Integration with authentic data sources'
        ],
        technicalSpecs: ['TS2', 'TS6', 'TS11', 'TS12']
    },
    trust_services: {
        id: 'trust_services',
        label: 'Trust Services (QTSP)',
        shortLabel: 'Trust/QTSP',
        description: 'Qualified Trust Service Provider capabilities including qualified signatures (QES), qualified certificates, and qualified electronic attestations (QEAAs).',
        icon: '🔐',
        applicableRoles: ['relying_party', 'issuer'],
        keyCapabilities: [
            'Qualified Electronic Signatures (QES)',
            'Qualified Certificates for electronic signatures',
            'Qualified Electronic Attestations of Attributes (QEAAs)',
            'Secure Cryptographic Device (QSCD)',
            'Remote signing services'
        ],
        technicalSpecs: ['TS3', 'TS8']
    }
};

const TECHNICAL_SPECIFICATIONS = {
    TS1: { id: 'TS1', title: 'Open Standards', roles: ['relying_party', 'issuer'], categories: ['connector', 'issuance_platform', 'trust_services'] },
    TS2: { id: 'TS2', title: 'Provider Information', roles: ['issuer'], categories: ['issuance_platform'] },
    TS3: { id: 'TS3', title: 'Wallet Unit Attestation', roles: ['issuer'], categories: ['trust_services'] },
    TS4: { id: 'TS4', title: 'ZKP Overview', roles: ['relying_party', 'issuer'], categories: ['connector', 'issuance_platform'] },
    TS5: { id: 'TS5', title: 'RP Registration', roles: ['relying_party'], categories: ['connector'] },
    TS6: { id: 'TS6', title: 'Issuance Protocol', roles: ['issuer'], categories: ['issuance_platform'] },
    TS7: { id: 'TS7', title: 'Data Deletion', roles: ['relying_party'], categories: ['connector'] },
    TS8: { id: 'TS8', title: 'Remote QES', roles: ['issuer'], categories: ['trust_services'] },
    TS9: { id: 'TS9', title: 'Pseudonyms', roles: ['relying_party', 'issuer'], categories: ['connector', 'issuance_platform'] },
    TS10: { id: 'TS10', title: 'Data Export', roles: ['relying_party', 'issuer'], categories: ['connector', 'issuance_platform'] },
    TS11: { id: 'TS11', title: 'Catalogue', roles: ['issuer'], categories: ['issuance_platform'] },
    TS12: { id: 'TS12', title: 'Payments SCA', roles: ['relying_party', 'issuer'], categories: ['connector', 'issuance_platform'] },
    TS13: { id: 'TS13', title: 'zkSNARKs', roles: ['relying_party', 'issuer'], categories: ['connector', 'issuance_platform'] },
    TS14: { id: 'TS14', title: 'MMS/BBS', roles: ['relying_party', 'issuer'], categories: ['connector', 'issuance_platform'] }
};

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

function useARFData() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}data/arf-hlr-data.json`)
            .then(res => res.ok ? res.json() : null)
            .then(setData)
            .catch(() => setData(null));
    }, []);

    return data;
}

// ============================================================================
// Step 1: Organisation Role Selector
// ============================================================================

function OrganisationRoleSelector({ selectedRoles, onToggle }) {
    return (
        <div className="vcq-step">
            <h3>
                <span className="vcq-step-number">1</span>
                Select Organisation Role(s)
            </h3>
            <p className="vcq-step-hint">
                What role(s) does your organisation play in the EUDIW ecosystem?
                Select all that apply – many organisations (e.g., banks) act as both.
            </p>
            <div className="vcq-role-grid">
                {Object.values(ORGANISATION_ROLES).map(role => {
                    const isSelected = selectedRoles.includes(role.id);
                    return (
                        <div
                            key={role.id}
                            className={`vcq-role-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => onToggle(role.id)}
                        >
                            <label className="vcq-role-header">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggle(role.id)}
                                    className="vcq-role-checkbox"
                                />
                                <span className="vcq-role-icon">{role.icon}</span>
                                <div>
                                    <span className="vcq-role-label">{role.label}</span>
                                    <span className="vcq-role-short">{role.shortLabel}</span>
                                </div>
                            </label>
                            <p className="vcq-role-desc">{role.description}</p>
                            <div className="vcq-role-capabilities">
                                <ul>
                                    {role.keyCapabilities.slice(0, 4).map((cap, idx) => (
                                        <li key={idx}>{cap}</li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================================
// Step 2: Product Category Selector
// ============================================================================

function ProductCategorySelector({ selectedRoles, selectedCategories, onToggle }) {
    // Filter categories based on selected roles
    const availableCategories = useMemo(() => {
        if (selectedRoles.length === 0) return [];

        return Object.values(PRODUCT_CATEGORIES).filter(cat =>
            cat.applicableRoles.some(role => selectedRoles.includes(role))
        );
    }, [selectedRoles]);

    if (selectedRoles.length === 0) {
        return (
            <div className="vcq-step vcq-step-disabled">
                <h3>
                    <span className="vcq-step-number">2</span>
                    Select Product Category
                </h3>
                <p className="vcq-step-hint vcq-step-hint-disabled">
                    ⬆️ First, select your organisation role(s) above.
                </p>
            </div>
        );
    }

    return (
        <div className="vcq-step">
            <h3>
                <span className="vcq-step-number">2</span>
                Select Product Category
            </h3>
            <p className="vcq-step-hint">
                What type of third-party product are you evaluating?
                Categories are filtered based on your selected role(s).
            </p>
            <div className="vcq-category-grid">
                {availableCategories.map(cat => {
                    const isSelected = selectedCategories.includes(cat.id);

                    return (
                        <div
                            key={cat.id}
                            className={`vcq-category-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => onToggle(cat.id)}
                        >
                            <label className="vcq-category-header">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggle(cat.id)}
                                    className="vcq-category-checkbox"
                                />
                                <span className="vcq-category-icon">{cat.icon}</span>
                                <div>
                                    <span className="vcq-category-label">{cat.label}</span>
                                </div>
                            </label>
                            <p className="vcq-category-desc">{cat.description}</p>
                            <div className="vcq-category-capabilities">
                                <ul>
                                    {cat.keyCapabilities.slice(0, 4).map((cap, idx) => (
                                        <li key={idx}>{cap}</li>
                                    ))}
                                </ul>
                            </div>


                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================================
// Step 3: Source Selector
// ============================================================================

function SourceSelector({
    selectedRoles,
    selectedCategories,
    selectedSourceGroups,
    onToggleGroup,
    legalSources,
    stats
}) {
    // Get applicable Technical Specifications based on role + category
    const applicableTechSpecs = useMemo(() => {
        if (selectedRoles.length === 0 || selectedCategories.length === 0) return [];

        return Object.values(TECHNICAL_SPECIFICATIONS).filter(ts =>
            ts.roles.some(role => selectedRoles.includes(role)) &&
            ts.categories.some(cat => selectedCategories.includes(cat))
        );
    }, [selectedRoles, selectedCategories]);

    const isDisabled = selectedRoles.length === 0 || selectedCategories.length === 0;

    if (isDisabled) {
        return (
            <div className="vcq-step vcq-step-disabled">
                <h3>
                    <span className="vcq-step-number">3</span>
                    Source Selection
                </h3>
                <p className="vcq-step-hint vcq-step-hint-disabled">
                    ⬆️ First, select your organisation role(s) and product category above.
                </p>
            </div>
        );
    }

    const eidasCount = stats?.bySourceGroup?.eidas || 0;
    const gdprCount = stats?.bySourceGroup?.gdpr || 0;
    const doraCount = stats?.bySourceGroup?.dora || 0;
    const arfCount = stats?.bySourceGroup?.arf || 0;

    return (
        <div className="vcq-step">
            <h3>
                <span className="vcq-step-number">3</span>
                Source Selection
            </h3>
            <p className="vcq-step-hint">
                Filter requirements by regulatory source. These are <strong>filters</strong>,
                not opt-outs — select sources to analyze their requirements.
            </p>
            <div className="vcq-source-grid vcq-source-grid-3">
                {/* Primary Sources - eIDAS Framework */}
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
                        <ul className="vcq-tile-includes-list">
                            {legalSources?.eidas?.items?.map(item => (
                                <li key={item.id}>
                                    {item.type === 'implementing_act' && (
                                        <span className="vcq-includes-type">IA</span>
                                    )}
                                    <span className="vcq-includes-name">{item.shortName}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Related Regulations */}
                <div className={`vcq-source-tile ${(selectedSourceGroups.gdpr || selectedSourceGroups.dora) ? 'selected' : ''}`}>
                    <div className="vcq-tile-header vcq-tile-header-multi">
                        <span className="vcq-tile-icon">{legalSources?.related?.icon || '🔗'}</span>
                        <span className="vcq-tile-title">Related Regulations</span>
                        <span className="vcq-tile-count">{gdprCount + doraCount} reqs</span>
                    </div>
                    <p className="vcq-tile-description">
                        {legalSources?.related?.description || 'Additional requirements based on context'}
                    </p>
                    <div className="vcq-tile-options">
                        {legalSources?.related?.items?.map(item => {
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
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Architecture - Non-binding sources */}
                <div className={`vcq-source-tile ${(selectedSourceGroups.arf || selectedSourceGroups.techSpecs || selectedSourceGroups.ruleBooks) ? 'selected' : ''}`}>
                    <div className="vcq-tile-header vcq-tile-header-multi">
                        <span className="vcq-tile-icon">🏗️</span>
                        <span className="vcq-tile-title">Architecture</span>
                        <span className="vcq-tile-count">{arfCount} reqs</span>
                    </div>
                    <p className="vcq-tile-description">
                        Non-binding implementation guidance, essential for interoperability
                    </p>
                    <div className="vcq-tile-options">
                        <label className={`vcq-tile-option ${selectedSourceGroups.arf ? 'selected' : ''}`}>
                            <input
                                type="checkbox"
                                checked={selectedSourceGroups.arf}
                                onChange={() => onToggleGroup('arf')}
                            />
                            <span className="vcq-option-name">ARF</span>
                            <span className="vcq-option-hint">Architecture Reference Framework</span>
                        </label>
                        <label className={`vcq-tile-option ${selectedSourceGroups.techSpecs ? 'selected' : ''}`}>
                            <input
                                type="checkbox"
                                checked={selectedSourceGroups.techSpecs}
                                onChange={() => onToggleGroup('techSpecs')}
                            />
                            <span className="vcq-option-name">Technical Specifications</span>
                            <span className="vcq-option-hint">TS1–TS14</span>
                        </label>
                        <label className={`vcq-tile-option ${selectedSourceGroups.ruleBooks ? 'selected' : ''}`}>
                            <input
                                type="checkbox"
                                checked={selectedSourceGroups.ruleBooks}
                                onChange={() => onToggleGroup('ruleBooks')}
                            />
                            <span className="vcq-option-name">Rulebooks</span>
                            <span className="vcq-option-hint">PID & mDL</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Selection Summary Component
// ============================================================================

function SelectionSummary({ selectedRoles, selectedCategories, applicableTechSpecs }) {
    if (selectedRoles.length === 0) return null;

    return (
        <div className="vcq-selection-summary">
            <h4>📋 Your Selection</h4>
            <div className="vcq-summary-grid">
                <div className="vcq-summary-item">
                    <span className="vcq-summary-label">Organisation Role(s):</span>
                    <div className="vcq-summary-badges">
                        {selectedRoles.map(roleId => {
                            const role = ORGANISATION_ROLES[roleId];
                            return (
                                <span key={roleId} className="vcq-summary-badge role">
                                    {role.icon} {role.label}
                                </span>
                            );
                        })}
                    </div>
                </div>
                {selectedCategories.length > 0 && (
                    <div className="vcq-summary-item">
                        <span className="vcq-summary-label">Product Category:</span>
                        <div className="vcq-summary-badges">
                            {selectedCategories.map(catId => {
                                const cat = PRODUCT_CATEGORIES[catId];
                                return (
                                    <span key={catId} className="vcq-summary-badge category">
                                        {cat.icon} {cat.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// ARF Reference Link Component (DEC-261: Multi-HLR Support)
// ============================================================================

function ARFReferenceLink({ arfReference, arfData, maxVisible = 2 }) {
    const [showPopover, setShowPopover] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0, showAbove: false });
    const triggerRef = useRef(null);
    const hideTimeoutRef = useRef(null);

    if (!arfReference) return null;

    const { topic } = arfReference;
    // Normalize hlr to array (supports both string and array)
    const hlrIds = Array.isArray(arfReference.hlr) ? arfReference.hlr : [arfReference.hlr];

    // Get data for all HLRs
    const hlrDataList = hlrIds.map(hlrId => ({
        id: hlrId,
        data: arfData?.byHlrId?.[hlrId] || null
    }));

    const visibleHlrs = hlrDataList.slice(0, maxVisible);
    const hiddenCount = hlrDataList.length - maxVisible;
    const isSingleHlr = hlrDataList.length === 1;

    const handleMouseEnter = () => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const estimatedHeight = isSingleHlr ? 200 : 250;
            const spaceBelow = viewportHeight - rect.bottom;
            const showAbove = spaceBelow < estimatedHeight + 20;
            setPopoverPosition({
                top: showAbove ? null : rect.bottom + 8,
                bottom: showAbove ? viewportHeight - rect.top + 8 : null,
                left: Math.max(8, Math.min(rect.left, window.innerWidth - 420)),
                showAbove
            });
        }
        setShowPopover(true);
    };

    const handleMouseLeave = () => {
        hideTimeoutRef.current = setTimeout(() => setShowPopover(false), 150);
    };

    // Get first HLR data for single-item popover
    const firstHlr = hlrDataList[0];
    const firstHlrData = firstHlr?.data;
    const topicTitle = firstHlrData?.topicTitle || topic;
    const topicNumber = firstHlrData?.topicNumber || topic?.replace('Topic ', '') || '';

    // Render a single HLR badge
    const renderHlrBadge = (hlrId, hlrData, isInteractive = false) => {
        const arfUrl = hlrData?.deepLink ||
            'https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md';
        const isEmpty = hlrData?.isEmpty;

        return (
            <a
                key={hlrId}
                href={arfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`vcq-arf-link ${isEmpty ? 'vcq-arf-empty' : ''}`}
                onMouseEnter={isInteractive ? handleMouseEnter : undefined}
                onMouseLeave={isInteractive ? handleMouseLeave : undefined}
            >
                <span className="vcq-arf-icon">📐</span>
                <span className="vcq-arf-ref">{hlrId}</span>
            </a>
        );
    };

    return (
        <span className="vcq-arf-wrapper" ref={triggerRef}>
            {/* Visible badges */}
            <span className="vcq-arf-badges">
                {visibleHlrs.map(({ id, data }) => renderHlrBadge(id, data, isSingleHlr))}
                {hiddenCount > 0 && (
                    <span
                        className="vcq-arf-more"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        +{hiddenCount}
                    </span>
                )}
            </span>

            {/* Single-HLR Popover (detailed) */}
            {showPopover && isSingleHlr && firstHlrData && (
                <div
                    className="vcq-arf-popover"
                    style={{
                        position: 'fixed',
                        ...(popoverPosition.showAbove
                            ? { bottom: `${popoverPosition.bottom}px` }
                            : { top: `${popoverPosition.top}px` }),
                        left: `${popoverPosition.left}px`
                    }}
                    onMouseEnter={() => hideTimeoutRef.current && clearTimeout(hideTimeoutRef.current)}
                    onMouseLeave={() => setShowPopover(false)}
                >
                    <div className="vcq-arf-popover-header">
                        <span className="vcq-arf-popover-id">{firstHlr.id}</span>
                        <span className="vcq-arf-popover-topic">Topic {topicNumber}</span>
                    </div>
                    <div className="vcq-arf-popover-title">{topicTitle}</div>
                    {firstHlrData.isEmpty ? (
                        <div className="vcq-arf-popover-empty">
                            This HLR slot is reserved but not yet populated in ARF.
                        </div>
                    ) : (
                        <>
                            <div className="vcq-arf-popover-spec">
                                <ReactMarkdown
                                    components={{
                                        a: ({ href, children }) => (
                                            <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                                        )
                                    }}
                                >
                                    {firstHlrData.specification}
                                </ReactMarkdown>
                            </div>
                            {firstHlrData.notes && (
                                <div className="vcq-arf-popover-notes">
                                    <span className="vcq-arf-popover-note-icon">ℹ️</span>
                                    <ReactMarkdown
                                        components={{
                                            a: ({ href, children }) => (
                                                <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                                            ),
                                            p: ({ children }) => <span>{children}</span>
                                        }}
                                    >
                                        {firstHlrData.notes}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </>
                    )}
                    <a
                        href={firstHlrData.deepLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="vcq-arf-popover-action"
                    >View in ARF →</a>
                </div>
            )}

            {/* Multi-HLR Popover (list) */}
            {showPopover && hiddenCount > 0 && (
                <div
                    className="vcq-arf-popover vcq-arf-popover-multi"
                    style={{
                        position: 'fixed',
                        ...(popoverPosition.showAbove
                            ? { bottom: `${popoverPosition.bottom}px` }
                            : { top: `${popoverPosition.top}px` }),
                        left: `${popoverPosition.left}px`
                    }}
                    onMouseEnter={() => hideTimeoutRef.current && clearTimeout(hideTimeoutRef.current)}
                    onMouseLeave={() => setShowPopover(false)}
                >
                    <div className="vcq-arf-popover-header">
                        <span className="vcq-arf-popover-id">📐 {hlrDataList.length} ARF References</span>
                        {topic && <span className="vcq-arf-popover-topic">{topic}</span>}
                    </div>
                    <div className="vcq-arf-popover-list">
                        {hlrDataList.map(({ id, data }) => {
                            const arfUrl = data?.deepLink || '#';
                            return (
                                <a
                                    key={id}
                                    href={arfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="vcq-arf-popover-item"
                                >
                                    <span className="vcq-arf-popover-item-id">{id}</span>
                                    <span className="vcq-arf-popover-item-spec">
                                        {data?.specification?.substring(0, 80) || 'No specification'}
                                        {data?.specification?.length > 80 ? '...' : ''}
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}
        </span>
    );
}


// ============================================================================
// Summary View Component
// ============================================================================

function SummaryView({ requirements, categories, answers }) {
    const categoryStats = useMemo(() => {
        const stats = {};
        categories.forEach(cat => {
            stats[cat.id] = { ...cat, total: 0, critical: 0, high: 0, answered: 0, compliant: 0, nonCompliant: 0 };
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
            <div className="vcq-category-cards">
                {categoryStats.map(cat => {
                    const progressPercent = cat.total > 0 ? Math.round((cat.answered / cat.total) * 100) : 0;
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
                                <div className="vcq-category-progress">
                                    <div className="vcq-progress-bar">
                                        <div className="vcq-progress-fill" style={{ width: `${progressPercent}%` }} />
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
// Requirements Table Component
// ============================================================================

function RequirementsTable({ requirements, categories, onAnswerChange, answers, regulationsIndex, arfData, getExcerpt }) {
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterObligation, setFilterObligation] = useState('all');

    const filteredRequirements = useMemo(() => {
        return requirements.filter(req => {
            if (filterCategory !== 'all' && req.category !== filterCategory) return false;
            if (filterObligation !== 'all' && req.obligation !== filterObligation) return false;
            return true;
        });
    }, [requirements, filterCategory, filterObligation]);

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
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="vcq-filter-select">
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                        ))}
                    </select>
                    <select value={filterObligation} onChange={e => setFilterObligation(e.target.value)} className="vcq-filter-select">
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
                            <h4 className="vcq-req-category-title">{cat.icon} {cat.label}</h4>
                            <table className="vcq-req-table">
                                <thead>
                                    <tr>
                                        <th className="col-id">ID</th>
                                        <th className="col-requirement">Requirement</th>
                                        <th className="col-legal">Legal Basis</th>
                                        <th className="col-obligation">Obligation</th>
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
                                                        </details>
                                                    )}
                                                </td>
                                                <td className="col-legal">
                                                    {/* DEC-261: Multi-article support via legalBases array */}
                                                    {req.legalBases && req.legalBases.length > 0 && (
                                                        <LegalBasesLinks legalBases={req.legalBases} regulationsIndex={regulationsIndex} getExcerpt={getExcerpt} />
                                                    )}
                                                    {req.arfReference && (
                                                        <ARFReferenceLink arfReference={req.arfReference} arfData={arfData} />
                                                    )}
                                                    {(!req.legalBases || req.legalBases.length === 0) && !req.arfReference && (
                                                        <span className="vcq-no-basis">—</span>
                                                    )}
                                                </td>
                                                <td className="col-obligation">
                                                    <span className={`vcq-obligation-badge ${getObligationClass(req.obligation)}`}>
                                                        {req.obligation}
                                                    </span>
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
// Main Component
// ============================================================================

export default function VendorQuestionnaire() {
    const { data, loading, error } = useVCQData();
    const regulationsIndex = useRegulationsIndex();
    const arfData = useARFData();
    const { getExcerpt } = useArticleExcerpts();

    // Step 1: Organisation Roles
    const [selectedRoles, setSelectedRoles] = useState([]);

    // Step 2: Product Categories
    const [selectedCategories, setSelectedCategories] = useState([]);

    // Step 3: Source Groups
    const [selectedSourceGroups, setSelectedSourceGroups] = useState({
        eidas: true,
        gdpr: false,
        dora: false,
        arf: true,
        techSpecs: true,
        ruleBooks: true
    });

    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [activeView, setActiveView] = useState(() => {
        const saved = localStorage.getItem('vcq-active-view');
        return saved === 'table' ? 'table' : 'summary';
    });

    // Load/save answers
    useEffect(() => {
        const savedAnswers = localStorage.getItem('vcq-answers');
        if (savedAnswers) {
            try { setAnswers(JSON.parse(savedAnswers)); } catch { }
        }
    }, []);

    useEffect(() => {
        if (Object.keys(answers).length > 0) {
            localStorage.setItem('vcq-answers', JSON.stringify(answers));
        }
    }, [answers]);

    useEffect(() => {
        localStorage.setItem('vcq-active-view', activeView);
    }, [activeView]);

    // Handlers
    const handleToggleRole = useCallback((roleId) => {
        setSelectedRoles(prev => {
            const newRoles = prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId];

            // Clear categories that are no longer applicable
            if (!newRoles.includes(roleId)) {
                setSelectedCategories(prev => prev.filter(catId => {
                    const cat = PRODUCT_CATEGORIES[catId];
                    return cat.applicableRoles.some(r => newRoles.includes(r));
                }));
            }

            return newRoles;
        });
        setShowResults(false);
    }, []);

    const handleToggleCategory = useCallback((catId) => {
        setSelectedCategories(prev =>
            prev.includes(catId)
                ? prev.filter(id => id !== catId)
                : [...prev, catId]
        );
        setShowResults(false);
    }, []);

    const handleToggleSourceGroup = useCallback((groupId) => {
        setSelectedSourceGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
        setShowResults(false);
    }, []);

    const handleAnswerChange = useCallback((reqId, value) => {
        setAnswers(prev => ({
            ...prev,
            [reqId]: { value, updated: new Date().toISOString() }
        }));
    }, []);

    // Compute applicable tech specs
    const applicableTechSpecs = useMemo(() => {
        if (selectedRoles.length === 0 || selectedCategories.length === 0) return [];
        return Object.values(TECHNICAL_SPECIFICATIONS).filter(ts =>
            ts.roles.some(role => selectedRoles.includes(role)) &&
            ts.categories.some(cat => selectedCategories.includes(cat))
        );
    }, [selectedRoles, selectedCategories]);

    // Get applicable requirements
    // DEC-257: Now properly filters by selectedRoles and selectedCategories
    const applicableRequirements = useMemo(() => {
        if (!data) return [];
        if (selectedRoles.length === 0 || selectedCategories.length === 0) return [];

        const reqIds = new Set();

        // DEC-257 Schema v2: Build requirement set from role and category indexes
        // Universal requirements (empty roles/productCategories) apply to all selections

        // Add requirements that match selected roles (or are universal)
        const roleMatchIds = new Set();
        data.requirementsByRole?.universal?.forEach(id => roleMatchIds.add(id));
        selectedRoles.forEach(role => {
            data.requirementsByRole?.[role]?.forEach(id => roleMatchIds.add(id));
        });

        // Add requirements that match selected categories (or are universal)
        const categoryMatchIds = new Set();
        data.requirementsByProductCategory?.universal?.forEach(id => categoryMatchIds.add(id));
        selectedCategories.forEach(cat => {
            data.requirementsByProductCategory?.[cat]?.forEach(id => categoryMatchIds.add(id));
        });

        // Requirement must match BOTH role AND category filters
        // (intersection of role-applicable and category-applicable)
        roleMatchIds.forEach(id => {
            if (categoryMatchIds.has(id)) {
                reqIds.add(id);
            }
        });

        let filtered = data.requirements.filter(req => reqIds.has(req.id));

        // Filter by source group (eIDAS, GDPR, DORA, ARF)
        const activeGroups = Object.entries(selectedSourceGroups)
            .filter(([_, isSelected]) => isSelected)
            .map(([group]) => group);

        if (activeGroups.length > 0) {
            filtered = filtered.filter(req => activeGroups.includes(req.sourceGroup));
        } else {
            filtered = [];
        }

        return filtered;
    }, [data, selectedRoles, selectedCategories, selectedSourceGroups]);

    // Export handlers (inline like RCA)
    const handleExportMarkdown = useCallback(() => {
        const roleLabels = selectedRoles.map(id => ORGANISATION_ROLES[id]?.label || id).join(', ');
        const categoryLabels = selectedCategories.map(id => PRODUCT_CATEGORIES[id]?.label || id).join(', ');
        const activeSources = Object.entries(selectedSourceGroups)
            .filter(([_, isSelected]) => isSelected)
            .map(([group]) => group.toUpperCase())
            .join(', ');

        let md = `# Vendor Compliance Questionnaire\n\n`;
        md += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
        md += `**Organisation Role(s):** ${roleLabels}\n\n`;
        md += `**Product Category:** ${categoryLabels}\n\n`;
        md += `**Source Groups:** ${activeSources || 'None'}\n\n`;
        md += `**Total Requirements:** ${applicableRequirements.length}\n\n`;
        md += `---\n\n`;

        const grouped = {};
        applicableRequirements.forEach(req => {
            if (!grouped[req.category]) grouped[req.category] = [];
            grouped[req.category].push(req);
        });

        data.categories.forEach(cat => {
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
                if (req.legalBasis) {
                    md += `**Legal Basis:** ${req.legalBasis.article} (Reg. ${req.legalBasis.regulation})\n\n`;
                }
                md += `**Response:** ${answerIcon} ${answer}\n\n`;
                md += `---\n\n`;
            });
        });

        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vcq-questionnaire-${new Date().toISOString().split('T')[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }, [selectedRoles, selectedCategories, selectedSourceGroups, applicableRequirements, answers, data]);

    const handleExportExcel = useCallback(() => {
        exportToExcel({
            requirements: applicableRequirements,
            answers,
            selectedRoles,
            selectedCategories,
            data
        });
    }, [applicableRequirements, answers, selectedRoles, selectedCategories, data]);

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
                <p className="text-lg" style={{ color: 'var(--status-error)' }}>Failed to load VCQ data</p>
                <p className="text-muted">{error.message}</p>
            </div>
        );
    }

    const canGenerate = selectedRoles.length > 0 && selectedCategories.length > 0;

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="vcq-header">
                <h1>📋 Vendor Compliance Questionnaire</h1>
                <p className="vcq-header-subtitle">
                    Generate compliance questionnaires for evaluating third-party products
                    to integrate your organisation with the EUDIW ecosystem. Select your role,
                    product category, and regulatory sources.
                </p>
            </div>

            {/* Step 1: Organisation Role Selection */}
            <OrganisationRoleSelector
                selectedRoles={selectedRoles}
                onToggle={handleToggleRole}
            />

            {/* Step 2: Product Category Selection */}
            <ProductCategorySelector
                selectedRoles={selectedRoles}
                selectedCategories={selectedCategories}
                onToggle={handleToggleCategory}
            />

            {/* Step 3: Source Selection */}
            <SourceSelector
                selectedRoles={selectedRoles}
                selectedCategories={selectedCategories}
                selectedSourceGroups={selectedSourceGroups}
                onToggleGroup={handleToggleSourceGroup}
                legalSources={data.legalSources}
                stats={data.stats}
            />

            {/* Summary Bar + Action Buttons (matching RCA pattern) */}
            {!showResults && (
                <>
                    {/* Summary bar - shows when selections are made */}
                    {canGenerate && (
                        <div className="tool-selection-summary-bar">
                            <span className="tool-summary-stats">
                                {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
                                {' · '}
                                {selectedCategories.length} categor{selectedCategories.length !== 1 ? 'ies' : 'y'}
                            </span>
                            <span className="tool-summary-req-count">
                                {applicableRequirements.length} requirements
                            </span>
                        </div>
                    )}

                    {/* Action buttons - inline like RCA */}
                    <div className="tool-actions">
                        <button
                            className={`tool-btn primary ${!canGenerate ? 'disabled' : ''}`}
                            onClick={() => canGenerate && setShowResults(true)}
                            disabled={!canGenerate}
                        >
                            📊 View Requirements ({applicableRequirements.length})
                        </button>
                        <button
                            className="tool-btn secondary"
                            onClick={handleExportExcel}
                            disabled={!canGenerate || applicableRequirements.length === 0}
                        >
                            📥 Export Excel
                        </button>
                        <button
                            className="tool-btn secondary"
                            onClick={handleExportMarkdown}
                            disabled={!canGenerate || applicableRequirements.length === 0}
                        >
                            📝 Export Markdown
                        </button>
                    </div>

                    {!canGenerate && (
                        <p className="vcq-generate-hint">
                            Select at least one organisation role and product category to generate.
                        </p>
                    )}
                </>
            )}

            {/* Results Section */}
            {showResults && (
                <>
                    {/* Summary Panel - minimal after DEC-250 removed status tracking */}
                    <div className="vcq-summary">
                        <div className="vcq-summary-actions">
                            <button className="btn btn-secondary" onClick={() => setShowResults(false)}>
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
                            arfData={arfData}
                            getExcerpt={getExcerpt}
                        />
                    )}
                </>
            )}
        </div>
    );
}
