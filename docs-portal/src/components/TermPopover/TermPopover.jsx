import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TermPopover.css';

/**
 * TermPopover - Shows definition when hovering over a term
 * 
 * Props:
 * - term: { id, term, definitions: [{ text, source }] }
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

    const primaryDef = term.definitions[0];
    const hasMultipleDefs = term.definitions.length > 1;

    // Get document route path
    const getDocumentPath = (source) => {
        const basePath = source.type === 'regulation' ? 'regulation' : 'implementing-acts';
        return `/${basePath}/${source.slug}#article-${source.article}`;
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
                        <span className="term-popover-badge">
                            Art. {primaryDef.source.article}({primaryDef.source.ordinal})
                        </span>
                    </div>

                    <p className="term-popover-definition">
                        {primaryDef.text}
                    </p>

                    <div className="term-popover-footer">
                        <Link
                            to={`/terminology#term-${term.id}`}
                            className="term-popover-link"
                        >
                            View in Terminology
                        </Link>
                        {hasMultipleDefs && (
                            <span className="term-popover-sources">
                                {term.definitions.length} sources
                            </span>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default TermPopover;
