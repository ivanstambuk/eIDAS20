/**
 * LegalBasisLink Component
 * 
 * Displays a legal citation with hover popover and deep-link navigation.
 * Used in both RCA (ComplianceAssessment) and VCQ (VendorQuestionnaire) pages.
 * 
 * Props:
 * - legalBasis: { regulation, article, paragraph }
 * - regulationsIndex: lookup object from useRegulationsIndex hook
 * - compact: boolean - if true, shows shorter regulation name as pill badge
 * 
 * ID Anchor Convention:
 * - Articles: article-5a-para-1-point-a-subpoint-i
 * - Annexes use same -para- format for standard references
 * - Only annex SECTION headers (e.g., "1. Set of data...") use -section-
 */

import { useState, useRef } from 'react';
import { buildDocumentLink, buildSectionId, parseParagraph, toHref } from '../../utils/linkBuilder';
import './LegalBasisLink.css';

export function LegalBasisLink({ legalBasis, regulationsIndex, compact = false }) {
    const [showPopover, setShowPopover] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const hideTimeoutRef = useRef(null);

    // Get regulation metadata
    const regId = legalBasis?.regulation;
    const regMeta = regulationsIndex[regId] || regulationsIndex[regId?.replace('/', '-')];

    const parsedParagraph = parseParagraph(legalBasis?.paragraph);

    // Build URL to article using centralized link builder
    const buildUrl = () => {
        if (!regMeta) return null;

        // Build section ID from article + paragraph
        const section = legalBasis?.article
            ? buildSectionId(legalBasis.article, parsedParagraph)
            : undefined;

        // Get internal path then convert to external href (with # prefix for HashRouter)
        const internalPath = buildDocumentLink(regMeta.slug, {
            section,
            type: regMeta.type
        });

        // Use toHref to add the # prefix and BASE_URL for external links
        return `${import.meta.env.BASE_URL}${toHref(internalPath)}`;
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

    // Get short regulation name for compact mode (e.g., "eIDAS", "GDPR", "DORA")
    const getShortRegName = () => {
        // First try regulationName field (most authoritative)
        if (regMeta?.regulationName) return regMeta.regulationName;
        // Fallback to sidebarTitle or derive from shortTitle
        const title = regMeta?.sidebarTitle || regMeta?.shortTitle || '';
        // Extract first word if it's a known short name
        const match = title.match(/^(eIDAS|GDPR|DORA|NIS2|PSD2|MiCA)/i);
        if (match) return match[1].toUpperCase();
        // Last fallback: regulation ID
        return legalBasis?.regulation || '';
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
                    {compact ? 'Art. ' : ''}{legalBasis?.article?.replace('Article ', '')}
                    {formatParagraphDisplay()}
                </span>
                {compact ? (
                    <span className="rca-legal-reg-compact">{getShortRegName()}</span>
                ) : (
                    <span className="rca-legal-reg">
                        {regMeta?.sidebarTitle || regMeta?.shortTitle || `Reg. ${legalBasis?.regulation}`}
                    </span>
                )}
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
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rca-popover-action"
                        >
                            View in EUR-Lex →
                        </a>
                    )}
                </div>
            )}
        </>
    );
}

export default LegalBasisLink;
