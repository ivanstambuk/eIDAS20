import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TermPopover.css';

/**
 * TermPopover - Shows definition when hovering over a term
 * 
 * Props:
 * - term: { id, term, sources: [{ definition, documentId, documentTitle, documentCategory, articleId, articleNumber }] }
 * - children: The term text to display
 */
export function TermPopover({ term, children }) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, flipped: false });
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const timeoutRef = useRef(null);

    const showPopover = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            // Initial position, will be refined after render
            updatePosition();
        }, 300); // Small delay before showing
    };

    const hidePopover = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 150); // Small delay before hiding
    };

    // Re-calculate position after popover renders (to get actual height)
    useEffect(() => {
        if (isVisible && popoverRef.current) {
            updatePosition();
        }
    }, [isVisible]);

    const updatePosition = () => {
        if (!triggerRef.current) return;
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Get actual popover height if rendered, otherwise estimate
        const popoverHeight = popoverRef.current?.offsetHeight || 250;
        const popoverWidth = 380; // matches CSS width

        // Default: position below and centered
        let top = triggerRect.bottom + 8;
        let left = triggerRect.left + (triggerRect.width / 2);
        let flipped = false;

        // Adjust if would overflow right edge
        if (left + (popoverWidth / 2) > viewportWidth - 20) {
            left = viewportWidth - (popoverWidth / 2) - 20;
        }
        // Adjust if would overflow left edge
        if (left - (popoverWidth / 2) < 20) {
            left = (popoverWidth / 2) + 20;
        }

        // If would overflow bottom, show above the trigger
        if (top + popoverHeight > viewportHeight - 20) {
            top = triggerRect.top - 8; // Position at trigger top
            flipped = true; // CSS will apply translateY(-100%) to flip upward
        }

        setPosition({ top, left, flipped });
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Multi-source support: sources are already sorted by displayOrder
    const sources = term.sources || [];
    const hasMultipleSources = sources.length > 1;

    // Get category badge color class
    const getCategoryClass = (category) => {
        switch (category) {
            case 'primary': return 'term-source-primary';
            case 'implementing-act': return 'term-source-implementing';
            case 'referenced': return 'term-source-referenced';
            default: return '';
        }
    };

    // Get document route path
    const getDocumentPath = (source) => {
        const basePath = source.documentType === 'regulation' ? 'regulation' : 'implementing-acts';
        return `/${basePath}/${source.documentId}#${source.articleId}`;
    };

    return (
        <>
            <span
                ref={triggerRef}
                className="term-trigger"
                onMouseEnter={showPopover}
                onMouseLeave={hidePopover}
                onFocus={showPopover}
                onBlur={hidePopover}
                tabIndex={0}
                role="button"
                aria-describedby={isVisible ? `term-popover-${term.id}` : undefined}
            >
                {children}
            </span>

            {isVisible && (
                <div
                    ref={popoverRef}
                    id={`term-popover-${term.id}`}
                    className={`term-popover${position.flipped ? ' term-popover-flipped' : ''}`}
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
                    <div className="term-popover-header">
                        <span className="term-popover-title">
                            {term.term}
                            {term.aliases?.length > 0 && (
                                <span className="term-popover-aliases"> ({term.aliases.join(', ')})</span>
                            )}
                        </span>
                        {hasMultipleSources && (
                            <span className="term-popover-count">
                                {sources.length} sources
                            </span>
                        )}
                    </div>

                    {/* Display all sources in stacked layout */}
                    <div className="term-popover-sources">
                        {sources.map((source, index) => (
                            <div
                                key={`${source.documentId}-${source.articleId}`}
                                className={`term-popover-source ${getCategoryClass(source.documentCategory)}`}
                            >
                                <div className="term-popover-source-header">
                                    <Link
                                        to={getDocumentPath(source)}
                                        className="term-popover-source-title"
                                    >
                                        {source.documentTitle}
                                    </Link>
                                    <span className="term-popover-article">
                                        Art. {source.articleNumber}
                                    </span>
                                    {source.documentCategory === 'referenced' && (
                                        <span className="term-popover-badge-referenced">
                                            Referenced
                                        </span>
                                    )}
                                </div>
                                <p className="term-popover-definition">
                                    {source.definition}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="term-popover-footer">
                        <Link
                            to={`/terminology#term-${term.id}`}
                            className="term-popover-link"
                        >
                            View in Terminology →
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}

export default TermPopover;
