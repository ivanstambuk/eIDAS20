/**
 * LegalBasesLinks Component (DEC-261)
 * 
 * Renders multiple legal bases as stacked badges with unified popover.
 * Supports both single legalBasis object and legalBases array.
 * 
 * Props:
 * - legalBases: Array of { regulation, article, paragraph, link }
 * - regulationsIndex: lookup object from useRegulationsIndex hook
 * - maxVisible: number of badges to show before "+N more" (default: 2)
 */

import { useState, useRef } from 'react';
import { LegalBasisLink } from './LegalBasisLink';
import './LegalBasesLinks.css';

export function LegalBasesLinks({ legalBases, regulationsIndex, maxVisible = 2 }) {
    const [showPopover, setShowPopover] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const hideTimeoutRef = useRef(null);

    // Handle empty/null input
    if (!legalBases || legalBases.length === 0) return null;

    // Single item - use original component
    if (legalBases.length === 1) {
        return <LegalBasisLink legalBasis={legalBases[0]} regulationsIndex={regulationsIndex} />;
    }

    // Multiple items - show stacked badges
    const visibleBases = legalBases.slice(0, maxVisible);
    const hiddenCount = legalBases.length - maxVisible;

    const handleMouseEnter = () => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const popoverHeight = 200;
            const showAbove = rect.top > popoverHeight + 20;
            setPopoverPosition({
                top: showAbove ? rect.top - popoverHeight - 8 : rect.bottom + 8,
                left: Math.max(8, Math.min(rect.left, window.innerWidth - 380))
            });
        }
        setShowPopover(true);
    };

    const handleMouseLeave = () => {
        hideTimeoutRef.current = setTimeout(() => setShowPopover(false), 150);
    };

    return (
        <div className="legal-bases-container">
            {/* Visible badges */}
            <div className="legal-bases-badges" ref={triggerRef}>
                {visibleBases.map((basis, idx) => (
                    <LegalBasisLink
                        key={idx}
                        legalBasis={basis}
                        regulationsIndex={regulationsIndex}
                    />
                ))}
                {hiddenCount > 0 && (
                    <span
                        className="legal-bases-more"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        +{hiddenCount}
                    </span>
                )}
            </div>

            {/* Popover showing all bases */}
            {showPopover && hiddenCount > 0 && (
                <div
                    className="legal-bases-popover"
                    style={{
                        position: 'fixed',
                        top: `${popoverPosition.top}px`,
                        left: `${popoverPosition.left}px`
                    }}
                    onMouseEnter={() => hideTimeoutRef.current && clearTimeout(hideTimeoutRef.current)}
                    onMouseLeave={() => setShowPopover(false)}
                >
                    <div className="legal-bases-popover-header">
                        📜 {legalBases.length} Legal Bases
                    </div>
                    <div className="legal-bases-popover-list">
                        {legalBases.map((basis, idx) => {
                            const regMeta = regulationsIndex[basis.regulation] ||
                                regulationsIndex[basis.regulation?.replace('/', '-')];
                            return (
                                <div key={idx} className="legal-bases-popover-item">
                                    <span className="legal-bases-article">
                                        {basis.article}{basis.paragraph ? `(${basis.paragraph})` : ''}
                                    </span>
                                    <span className="legal-bases-reg">
                                        {regMeta?.shortTitle || `Reg. ${basis.regulation}`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LegalBasesLinks;
