/**
 * VendorQuestionnaire (VCQ) Page
 * 
 * Vendor Compliance Questionnaire generator for organizations evaluating
 * third-party products to integrate with the EUDIW ecosystem.
 * 
 * Updated: 2026-02-10 (DEC-TBD: Deployment Architecture filtering)
 * - Step 1: Organisation Role Selection (Relying Party, Issuer)
 * - Step 2: Product Category Selection (Connector, Issuance Platform, Trust Services)
 * - Step 2b: Deployment Architecture Filter (Intermediary, Direct SaaS, Direct Self-Hosted)
 * - Step 3: Source Selection (eIDAS, Related Regulations, Tech Specs)
 * 
 * Note: Role/Category selection now filters requirements using schema v2
 * requirementsByRole and requirementsByProductCategory indexes.
 * Architecture filtering applies union logic: show if ANY tag matches selected,
 * or if deploymentArchitectures is empty (agnostic).
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

// Deployment Architecture definitions (DEC-TBD)
const DEPLOYMENT_ARCHITECTURES = {
    intermediary: {
        id: 'intermediary',
        label: 'Intermediary',
        shortLabel: 'INT',
        icon: '🔗',
        color: '#3b82f6',       // Blue
        bgColor: 'rgba(59, 130, 246, 0.12)',
        description: 'Third-party acts as RP on behalf of the integrating organisation',
    },
    direct_saas: {
        id: 'direct_saas',
        label: 'Direct SaaS',
        shortLabel: 'SaaS',
        icon: '☁️',
        color: '#8b5cf6',       // Purple
        bgColor: 'rgba(139, 92, 246, 0.12)',
        description: 'Organisation is the RP; vendor provides hosted connector service',
    },
    direct_onprem: {
        id: 'direct_onprem',
        label: 'Direct Self-Hosted',
        shortLabel: 'OnPrem',
        icon: '🏠',
        color: '#10b981',       // Emerald
        bgColor: 'rgba(16, 185, 129, 0.12)',
        description: 'Organisation is the RP; deploys vendor software on own infrastructure',
    },
};

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
// Categorization Schemes (DEC-279)
// ============================================================================

/**
 * Categorization schemes allow grouping requirements by different dimensions.
 * - 'functional': 6 categories based on compliance domain (default)
 * - 'role': 2 categories based on actor type (RP / Issuer)
 */
const CATEGORIZATION_SCHEMES = {
    functional: {
        id: 'functional',
        label: 'Functional (6)',
        description: 'Group by compliance domain',
        // Uses data.categories from vcq-data.json
        getCategory: (req) => req.category,
        getCategoryLabel: (req, categories) => {
            const cat = categories.find(c => c.id === req.category);
            return cat?.label || req.category;
        },
        getCategoryIcon: (req, categories) => {
            const cat = categories.find(c => c.id === req.category);
            return cat?.icon || '📋';
        }
    },
    role: {
        id: 'role',
        label: 'By Role (3)',
        description: 'Group by actor type',
        // Categories for role-based scheme (DEC-288: Added explicit Universal category)
        categories: [
            { id: 'universal', label: 'Universal', icon: '🌐', order: 0 },
            { id: 'relying_party', label: 'Relying Party Only', icon: '🏢', order: 1 },
            { id: 'issuer', label: 'Issuer Only', icon: '📝', order: 2 }
        ],
        /**
         * Determine which role category a requirement belongs to.
         * DEC-288: Universal requirements (roles: []) are now explicitly categorized.
         */
        getCategory: (req, selectedRoles) => {
            const roles = req.roles || [];

            // Empty roles array = Universal (applies to all)
            if (roles.length === 0) {
                return 'universal';
            }

            // Single role = that specific role
            if (roles.length === 1) {
                return roles[0];
            }

            // Multi-role (rare) = universal
            return 'universal';
        },
        getCategoryLabel: (req, categories, selectedRoles) => {
            const catId = CATEGORIZATION_SCHEMES.role.getCategory(req, selectedRoles);
            const cat = CATEGORIZATION_SCHEMES.role.categories.find(c => c.id === catId);
            return cat?.label || catId;
        },
        getCategoryIcon: (req, categories, selectedRoles) => {
            const catId = CATEGORIZATION_SCHEMES.role.getCategory(req, selectedRoles);
            const cat = CATEGORIZATION_SCHEMES.role.categories.find(c => c.id === catId);
            return cat?.icon || '📋';
        }
    }
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

/**
 * Hook to load VCQ Clarification Questions data
 * Returns a lookup object keyed by requirement ID
 */
function useClarificationQuestions() {
    const [data, setData] = useState({});

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}data/vcq-clarification-questions.json`)
            .then(res => res.ok ? res.json() : null)
            .then(json => setData(json?.byRequirementId || {}))
            .catch(() => setData({}));
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
// Step 2b: Deployment Architecture Selector (DEC-TBD)
// ============================================================================

function ArchitectureSelector({ selectedArchitectures, onToggle }) {
    const allArchitectures = Object.values(DEPLOYMENT_ARCHITECTURES);

    return (
        <div className="vcq-step vcq-arch-step">
            <div className="vcq-step-header">
                <span className="vcq-step-number">2b</span>
                <h3>Deployment Architecture</h3>
            </div>
            <p className="vcq-step-hint">
                Filter requirements by how the vendor product integrates with your RP infrastructure.
                Agnostic requirements always show regardless of selection.
            </p>
            <div className="vcq-arch-selector">
                {allArchitectures.map(arch => {
                    const isSelected = selectedArchitectures.includes(arch.id);
                    return (
                        <label
                            key={arch.id}
                            className={`vcq-arch-option ${isSelected ? 'selected' : ''}`}
                            style={{
                                '--arch-color': arch.color,
                                '--arch-bg': arch.bgColor,
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggle(arch.id)}
                                className="vcq-arch-checkbox"
                            />
                            <span className="vcq-arch-icon">{arch.icon}</span>
                            <div className="vcq-arch-text">
                                <span className="vcq-arch-label">{arch.label}</span>
                                <span className="vcq-arch-desc">{arch.description}</span>
                            </div>
                        </label>
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

function SummaryView({ requirements, categories, answers, categorizationScheme, selectedRoles, getReqCategory }) {
    const categoryStats = useMemo(() => {
        const stats = {};
        categories.forEach(cat => {
            stats[cat.id] = { ...cat, total: 0, must: 0, answered: 0, compliant: 0, nonCompliant: 0 };
        });
        requirements.forEach(req => {
            // Use getReqCategory for scheme-aware categorization (DEC-279)
            const catId = getReqCategory ? getReqCategory(req) : req.category;
            const cat = stats[catId];
            if (!cat) return;
            cat.total++;
            if (req.obligation === 'MUST' || req.obligation === 'MUST NOT') cat.must++;
            const answer = answers[req.id]?.value;
            if (answer && answer !== 'pending') {
                cat.answered++;
                if (answer === 'yes') cat.compliant++;
                if (answer === 'no') cat.nonCompliant++;
            }
        });
        return Object.values(stats).filter(s => s.total > 0);
    }, [requirements, categories, answers, getReqCategory]);

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
                                {cat.must > 0 && (
                                    <div className="vcq-category-stat-row must">
                                        <span>🔴 MUST</span>
                                        <span className="vcq-stat-value">{cat.must}</span>
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

function RequirementsTable({ requirements, categories, onAnswerChange, answers, regulationsIndex, arfData, getExcerpt, categorizationScheme, selectedRoles, getReqCategory, clarificationQuestions }) {
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterObligation, setFilterObligation] = useState('all');

    const filteredRequirements = useMemo(() => {
        return requirements.filter(req => {
            // Use getReqCategory for scheme-aware filtering (DEC-279)
            const catId = getReqCategory ? getReqCategory(req) : req.category;
            if (filterCategory !== 'all' && catId !== filterCategory) return false;
            if (filterObligation !== 'all' && req.obligation !== filterObligation) return false;
            return true;
        });
    }, [requirements, filterCategory, filterObligation, getReqCategory]);

    const groupedRequirements = useMemo(() => {
        const groups = {};
        for (const req of filteredRequirements) {
            // Use getReqCategory for scheme-aware grouping (DEC-279)
            const catId = getReqCategory ? getReqCategory(req) : req.category;
            if (!groups[catId]) groups[catId] = [];
            groups[catId].push(req);
        }
        return groups;
    }, [filteredRequirements, getReqCategory]);

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
                            <h4 className="vcq-req-category-title">
                                {cat.icon} {cat.label}
                                <span className="vcq-category-count-badge">{groupedRequirements[cat.id].length}</span>
                            </h4>
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
                                                <td className="col-id">
                                                    {req.id}
                                                    {req.deploymentArchitectures && req.deploymentArchitectures.length > 0 && (
                                                        <div className="vcq-arch-badges">
                                                            {req.deploymentArchitectures.map(archId => {
                                                                const arch = DEPLOYMENT_ARCHITECTURES[archId];
                                                                if (!arch) return null;
                                                                return (
                                                                    <span
                                                                        key={archId}
                                                                        className={`vcq-arch-badge arch-${archId}`}
                                                                        title={arch.description}
                                                                    >
                                                                        {arch.shortLabel}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="col-requirement">
                                                    <div className="vcq-req-text">{req.requirement}</div>
                                                    <div className="vcq-req-toggles">
                                                        {req.explanation && (
                                                            <details className="vcq-req-details">
                                                                <summary>Details</summary>
                                                                <div className="vcq-explanation-md"><ReactMarkdown>{req.explanation}</ReactMarkdown></div>
                                                            </details>
                                                        )}
                                                        {clarificationQuestions[req.id] && clarificationQuestions[req.id].length > 0 && (
                                                            <details className="vcq-req-clarifications">
                                                                <summary>Clarification Questions ({clarificationQuestions[req.id].length})</summary>
                                                                <ul className="vcq-cq-list">
                                                                    {clarificationQuestions[req.id].map(q => (
                                                                        <li key={q.id} className="vcq-cq-item">
                                                                            <span className="vcq-cq-id">{q.id}</span>
                                                                            <span className="vcq-cq-text">{q.text}</span>
                                                                            <span className="vcq-cq-dimension">{q.dimension.replace(/_/g, ' ')}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </details>
                                                        )}
                                                    </div>
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
    const clarificationQuestions = useClarificationQuestions();
    const { getExcerpt } = useArticleExcerpts();

    // Step 1: Organisation Roles
    const [selectedRoles, setSelectedRoles] = useState([]);

    // Step 2: Product Categories
    const [selectedCategories, setSelectedCategories] = useState([]);

    // Step 2b: Deployment Architectures (DEC-TBD)
    // Default all checked — agnostic requirements always show regardless
    const [selectedArchitectures, setSelectedArchitectures] = useState(
        () => Object.keys(DEPLOYMENT_ARCHITECTURES)
    );

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

    // Categorization scheme (DEC-279): 'functional' (6 cats) or 'role' (2 cats)
    const [categorizationScheme, setCategorizationScheme] = useState(() => {
        const saved = localStorage.getItem('vcq-categorization-scheme');
        return saved === 'role' ? 'role' : 'functional';
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

    useEffect(() => {
        localStorage.setItem('vcq-categorization-scheme', categorizationScheme);
    }, [categorizationScheme]);

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

    const handleToggleArchitecture = useCallback((archId) => {
        setSelectedArchitectures(prev =>
            prev.includes(archId)
                ? prev.filter(id => id !== archId)
                : [...prev, archId]
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

        // DEC-TBD: Filter by deployment architectures (union logic)
        // A requirement shows if:
        //   - deploymentArchitectures is empty (agnostic — always shows)
        //   - OR any of its architectures matches a selected architecture
        // Only applies when architecture selector is visible (RP + Connector)
        const showArchFilter = selectedRoles.includes('relying_party') &&
            selectedCategories.includes('connector');

        if (showArchFilter && selectedArchitectures.length < Object.keys(DEPLOYMENT_ARCHITECTURES).length) {
            filtered = filtered.filter(req => {
                const reqArchs = req.deploymentArchitectures || [];
                if (reqArchs.length === 0) return true; // Agnostic — always show
                return reqArchs.some(arch => selectedArchitectures.includes(arch));
            });
        }

        // DEC-286: Filter by source groups using union logic
        // A requirement appears if ANY of its sourceGroups is selected
        const activeGroups = Object.entries(selectedSourceGroups)
            .filter(([_, isSelected]) => isSelected)
            .map(([group]) => group);

        if (activeGroups.length > 0) {
            filtered = filtered.filter(req => {
                // sourceGroups is now an array; show if ANY matches
                const reqGroups = req.sourceGroups || [req.sourceGroup]; // Fallback for old data
                return reqGroups.some(group => activeGroups.includes(group));
            });
        } else {
            filtered = [];
        }

        return filtered;
    }, [data, selectedRoles, selectedCategories, selectedSourceGroups, selectedArchitectures]);

    // Compute effective categories based on active categorization scheme (DEC-279)
    const effectiveCategories = useMemo(() => {
        const scheme = CATEGORIZATION_SCHEMES[categorizationScheme];
        if (categorizationScheme === 'functional') {
            // Use the 6 functional categories from data
            return data?.categories || [];
        } else {
            // Use role-based categories, filtered to selected roles
            return scheme.categories.filter(cat =>
                selectedRoles.length === 0 || selectedRoles.includes(cat.id)
            );
        }
    }, [categorizationScheme, data?.categories, selectedRoles]);

    // Get category for a requirement based on active scheme
    const getReqCategory = useCallback((req) => {
        const scheme = CATEGORIZATION_SCHEMES[categorizationScheme];
        if (categorizationScheme === 'functional') {
            return req.category;
        } else {
            return scheme.getCategory(req, selectedRoles);
        }
    }, [categorizationScheme, selectedRoles]);

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
        if (selectedRoles.includes('relying_party') && selectedCategories.includes('connector')) {
            const archLabels = selectedArchitectures.map(id => DEPLOYMENT_ARCHITECTURES[id]?.label || id).join(', ');
            md += `**Deployment Architecture(s):** ${archLabels || 'None'}\n\n`;
        }
        md += `**Source Groups:** ${activeSources || 'None'}\n\n`;
        md += `**Grouping:** ${CATEGORIZATION_SCHEMES[categorizationScheme].label}\n\n`;
        md += `**Total Requirements:** ${applicableRequirements.length}\n\n`;
        md += `---\n\n`;

        // Group by current categorization scheme (DEC-279)
        const grouped = {};
        applicableRequirements.forEach(req => {
            const catId = getReqCategory(req);
            if (!grouped[catId]) grouped[catId] = [];
            grouped[catId].push(req);
        });

        effectiveCategories.forEach(cat => {
            const reqs = grouped[cat.id];
            if (!reqs || reqs.length === 0) return;

            md += `## ${cat.icon} ${cat.label}\n\n`;
            reqs.forEach(req => {
                const answer = answers[req.id]?.value || 'pending';
                const answerIcon = answer === 'yes' ? '✅' : answer === 'no' ? '❌' :
                    answer === 'partial' ? '⚠️' : answer === 'na' ? '➖' : '⏳';

                md += `### ${req.id}`;
                // Add architecture badges
                if (req.deploymentArchitectures && req.deploymentArchitectures.length > 0) {
                    const archTags = req.deploymentArchitectures
                        .map(id => DEPLOYMENT_ARCHITECTURES[id]?.shortLabel || id)
                        .join(', ');
                    md += ` \`[${archTags}]\``;
                }
                md += `\n\n`;
                md += `**Requirement:** ${req.requirement}\n\n`;
                if (req.explanation) {
                    md += `**Explanation:** ${req.explanation}\n\n`;
                }

                // Clarification questions (immediately after explanation)
                const reqQuestions = clarificationQuestions?.[req.id] || [];
                if (reqQuestions.length > 0) {
                    md += `**Clarification Questions:**\n\n`;
                    reqQuestions.forEach((q, i) => {
                        md += `${i + 1}. ${q.text}\n`;
                    });
                    md += `\n`;
                }

                md += `**Obligation:** ${req.obligation}\n\n`;

                // Legal basis with legal text immediately after
                if (req.legalBasis) {
                    md += `**Legal Basis:** ${req.legalBasis.article} (Reg. ${req.legalBasis.regulation})\n\n`;
                }
                if (req.legalText) {
                    md += `**Legal Text:** ${req.legalText}\n\n`;
                }

                // ARF reference with specification and notes immediately after
                if (req.arfReference) {
                    const hlrIds = Array.isArray(req.arfReference.hlr)
                        ? req.arfReference.hlr.join(', ')
                        : req.arfReference.hlr || '';
                    if (hlrIds) {
                        md += `**ARF Reference:** ${req.arfReference.topic}: ${hlrIds}\n\n`;

                        // Look up ARF specification and notes
                        const hlrIdList = Array.isArray(req.arfReference.hlr)
                            ? req.arfReference.hlr
                            : [req.arfReference.hlr];

                        const arfSpecs = hlrIdList
                            .map(id => arfData?.byHlrId?.[id]?.specification)
                            .filter(Boolean);
                        if (arfSpecs.length > 0) {
                            md += `**ARF Specification:** ${arfSpecs.join(' | ')}\n\n`;
                        }

                        const arfNotes = hlrIdList
                            .map(id => arfData?.byHlrId?.[id]?.notes)
                            .filter(Boolean);
                        if (arfNotes.length > 0) {
                            md += `**ARF Notes:** ${arfNotes.join(' | ')}\n\n`;
                        }
                    }
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
    }, [selectedRoles, selectedCategories, selectedSourceGroups, applicableRequirements, answers, categorizationScheme, effectiveCategories, getReqCategory, arfData, clarificationQuestions]);

    const handleExportExcel = useCallback(() => {
        exportToExcel({
            requirements: applicableRequirements,
            answers,
            selectedRoles,
            selectedCategories,
            data,
            categorizationScheme,
            effectiveCategories,
            getReqCategory,
            arfData,
            clarificationQuestions
        });
    }, [applicableRequirements, answers, selectedRoles, selectedCategories, data, categorizationScheme, effectiveCategories, getReqCategory, arfData, clarificationQuestions]);

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

            {/* Step 2b: Deployment Architecture Filter (DEC-TBD) */}
            {/* Only visible when RP + Connector selected */}
            {selectedRoles.includes('relying_party') && selectedCategories.includes('connector') && (
                <ArchitectureSelector
                    selectedArchitectures={selectedArchitectures}
                    onToggle={handleToggleArchitecture}
                />
            )}

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
                            <button
                                className="tool-btn secondary"
                                onClick={handleExportExcel}
                                disabled={applicableRequirements.length === 0}
                            >
                                📥 Export Excel
                            </button>
                            <button
                                className="tool-btn secondary"
                                onClick={handleExportMarkdown}
                                disabled={applicableRequirements.length === 0}
                            >
                                📝 Export Markdown
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

                        {/* Categorization Scheme Selector (DEC-279) */}
                        <div className="vcq-scheme-selector">
                            <label>Group by:</label>
                            <select
                                value={categorizationScheme}
                                onChange={(e) => setCategorizationScheme(e.target.value)}
                            >
                                <option value="functional">Functional (6)</option>
                                <option value="role">By Role (2)</option>
                            </select>
                        </div>
                    </div>

                    {/* View Content */}
                    {activeView === 'summary' ? (
                        <SummaryView
                            requirements={applicableRequirements}
                            categories={effectiveCategories}
                            answers={answers}
                            categorizationScheme={categorizationScheme}
                            selectedRoles={selectedRoles}
                            getReqCategory={getReqCategory}
                        />
                    ) : (
                        <RequirementsTable
                            requirements={applicableRequirements}
                            categories={effectiveCategories}
                            onAnswerChange={handleAnswerChange}
                            answers={answers}
                            regulationsIndex={regulationsIndex}
                            arfData={arfData}
                            getExcerpt={getExcerpt}
                            categorizationScheme={categorizationScheme}
                            selectedRoles={selectedRoles}
                            getReqCategory={getReqCategory}
                            clarificationQuestions={clarificationQuestions}
                        />
                    )}
                </>
            )}
        </div>
    );
}
