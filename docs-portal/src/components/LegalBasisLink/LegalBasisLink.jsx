/**
 * LegalBasisLink Component
 * 
 * Displays a legal citation with hover popover and deep-link navigation.
 * Used in both RCA (ComplianceAssessment) and VCQ (VendorQuestionnaire) pages.
 * 
 * Props:
 * - legalBasis: { regulation, article, paragraph }
 * - regulationsIndex: lookup object from useRegulationsIndex hook
 * 
 * ID Anchor Convention:
 * - Articles: article-5a-para-1-point-a-subpoint-i
 * - Annexes use same -para- format for standard references
 * - Only annex SECTION headers (e.g., "1. Set of data...") use -section-
 */

import { useState, useRef } from 'react';
import './LegalBasisLink.css';

// Parse compound paragraph formats like "1(b)", "1(a)(i)", "1-2", "2(g)"
// Returns { para, point, subpoint } for URL building
function parseParagraph(paragraph) {
    if (!paragraph) return { para: null, point: null, subpoint: null };
    const str = String(paragraph);

    // Match: optional number, optional letter point, optional roman subpoint
    // e.g., "1", "1(b)", "2(g)", "1(a)(ii)", "1-2"
    const match = str.match(/^(\d+[a-z]?(?:\s*[-–—]\s*\d+[a-z]?)?)(?:\s*\(\s*([a-z])\s*\))?(?:\s*\(\s*([ivxlcdm]+)\s*\))?$/i);
    if (match) {
        return {
            para: match[1] ? match[1].split(/[-–—]/)[0].trim() : null,
            point: match[2] ? match[2].toLowerCase() : null,
            subpoint: match[3] ? match[3].toLowerCase() : null
        };
    }
    // Fallback: treat whole string as paragraph
    return { para: str.split(/[-–—]/)[0].trim(), point: null, subpoint: null };
}

export function LegalBasisLink({ legalBasis, regulationsIndex }) {
    const [showPopover, setShowPopover] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const hideTimeoutRef = useRef(null);

    // Get regulation metadata
    const regId = legalBasis?.regulation;
    const regMeta = regulationsIndex[regId] || regulationsIndex[regId?.replace('/', '-')];

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

export default LegalBasisLink;
