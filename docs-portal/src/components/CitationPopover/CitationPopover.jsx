import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CitationPopover.css';

/**
 * CitationPopover - Shows citation details on hover (desktop) or renders footnote (mobile)
 * 
 * Part of DEC-009: Citation formatting with responsive behavior and internal linking.
 * 
 * Props:
 * - citation: { index, shortName, fullTitle, ojRef, eli, celex, isInternal, url }
 * - children: The trigger text to display
 */
export function CitationPopover({ citation, children }) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const timeoutRef = useRef(null);

    const showPopover = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            updatePosition();
        }, 200); // Slightly faster than term popover
    };

    const hidePopover = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 150);
    };

    const updatePosition = () => {
        if (!triggerRef.current) return;
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Default: position below and centered
        let top = triggerRect.bottom + 8;
        let left = triggerRect.left + (triggerRect.width / 2);

        // Adjust if would overflow right edge
        if (left + 200 > viewportWidth) {
            left = viewportWidth - 220;
        }
        // Adjust if would overflow left edge
        if (left < 20) {
            left = 20;
        }
        // If would overflow bottom, show above
        if (top + 200 > viewportHeight) {
            top = triggerRect.top - 8;
        }

        setPosition({ top, left });
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Determine if internal or external link
    const linkElement = citation.isInternal ? (
        <Link to={citation.url.replace('#', '')} className="citation-popover-link">
            View in Portal →
        </Link>
    ) : (
        <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="citation-popover-link citation-popover-link--external"
        >
            View on EUR-Lex 🔗
        </a>
    );

    return (
        <>
            <span
                ref={triggerRef}
                className="citation-trigger"
                onMouseEnter={showPopover}
                onMouseLeave={hidePopover}
                onFocus={showPopover}
                onBlur={hidePopover}
                tabIndex={0}
                role="button"
                aria-describedby={isVisible ? `citation-popover-${citation.index}` : undefined}
            >
                {children}
            </span>

            {isVisible && (
                <div
                    ref={popoverRef}
                    id={`citation-popover-${citation.index}`}
                    className="citation-popover"
                    style={{
                        top: `${position.top}px`,
                        left: `${position.left}px`
                    }}
                    onMouseEnter={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    }}
                    onMouseLeave={hidePopover}
                    role="tooltip"
                >
                    <div className="citation-popover-header">
                        <span className="citation-popover-title">{citation.shortName}</span>
                        {citation.celex && (
                            <span className="citation-popover-badge">
                                {citation.isInternal ? '📄' : '🔗'} {citation.celex}
                            </span>
                        )}
                    </div>

                    <p className="citation-popover-fulltext">
                        {citation.fullTitle}
                    </p>

                    {citation.ojRef && (
                        <p className="citation-popover-ojref">
                            {citation.ojRef}
                        </p>
                    )}

                    <div className="citation-popover-footer">
                        {linkElement}
                    </div>
                </div>
            )}
        </>
    );
}

/**
 * CitationRef - Renders citation inline with responsive behavior
 * 
 * Desktop (≥768px): Shows CitationPopover on hover
 * Mobile (<768px): Shows superscript footnote reference
 */
export function CitationRef({ citation, isMobile = false }) {
    if (isMobile) {
        // Mobile: superscript reference to footnotes section
        return (
            <sup className="citation-footnote-ref">
                <a href={`#ref-${citation.index}`} id={`cite-${citation.index}`}>
                    [{citation.index}]
                </a>
            </sup>
        );
    }

    // Desktop: popover
    return (
        <CitationPopover citation={citation}>
            {citation.shortName}
        </CitationPopover>
    );
}

/**
 * ReferencesSection - Renders the footnotes section for mobile/accessibility
 * 
 * Props:
 * - citations: Array of citation objects
 */
export function ReferencesSection({ citations }) {
    if (!citations || citations.length === 0) return null;

    return (
        <section className="references-section" aria-label="References">
            <h2 id="references">References</h2>
            <ol className="references-list">
                {citations.map((citation) => (
                    <li key={citation.index} id={`ref-${citation.index}`}>
                        <a
                            href={citation.url}
                            target={citation.isInternal ? undefined : "_blank"}
                            rel={citation.isInternal ? undefined : "noopener noreferrer"}
                            className="reference-link"
                        >
                            {citation.fullTitle}
                        </a>
                        {!citation.isInternal && ' 🔗'}
                        {citation.ojRef && (
                            <span className="reference-oj"> ({citation.ojRef})</span>
                        )}
                        <a href={`#cite-${citation.index}`} className="reference-backlink" title="Back to text">
                            ↩
                        </a>
                    </li>
                ))}
            </ol>
        </section>
    );
}

export default CitationPopover;
