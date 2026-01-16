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
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const timeoutRef = useRef(null);

    const showPopover = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            updatePosition();
        }, 300); // Small delay before showing
    };

    const hidePopover = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 150); // Small delay before hiding
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
                    className="term-popover"
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
                        <span className="term-popover-title">{term.term}</span>
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
