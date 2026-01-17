import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigationType } from 'react-router-dom';
import { trace } from '../utils/trace';

/**
 * Fast smooth scroll (150ms) - matches RegulationViewer behavior
 */
function fastScrollTo(targetY) {
    const startPosition = window.scrollY;
    const distance = targetY - startPosition;
    const duration = 150;
    let startTime = null;

    const animation = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        window.scrollTo(0, startPosition + distance * easeOut);
        if (progress < 1) requestAnimationFrame(animation);
    };
    requestAnimationFrame(animation);
}

/**
 * DefinitionGroup component - DEC-058 Accordion Collapse UI
 * 
 * Handles three scenarios:
 * 1. Single source: Direct display (no accordion)
 * 2. Multiple identical: Definition first, accordion for sources
 * 3. Variant: Purple border + "Variant definition" label
 */
const DefinitionGroup = ({ group, getDocumentPath, handleSaveScroll }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { definition, sources, isVariant } = group;
    const isSingleSource = sources.length === 1;

    // Border color: cyan for primary, purple for variants (DEC-058)
    const borderColor = isVariant ? '#a855f7' : 'var(--accent-primary)';
    const labelColor = isVariant ? '#a855f7' : 'var(--text-secondary)';

    return (
        <div
            className="definition-group"
            style={{
                borderLeft: `3px solid ${borderColor}`,
                paddingLeft: 'var(--space-3)'
            }}
        >
            {/* Variant label */}
            {isVariant && (
                <div style={{
                    fontSize: 'var(--text-xs)',
                    color: labelColor,
                    marginBottom: 'var(--space-1)',
                    fontWeight: 500
                }}>
                    Variant definition ({sources.length} {sources.length === 1 ? 'source' : 'sources'})
                </div>
            )}

            {/* Definition text (always shown first) */}
            <p className="definition-text" style={{ fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
                {definition}
            </p>

            {/* Source(s) - shown below definition */}
            {isSingleSource ? (
                /* Single source: direct display */
                <Link
                    to={getDocumentPath(sources[0])}
                    className="source-link"
                    onClick={handleSaveScroll}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-1)',
                        marginTop: 'var(--space-2)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none'
                    }}
                >
                    <span style={{ color: 'var(--accent-primary)' }}>
                        — {sources[0].documentTitle}
                    </span>
                    <span>, Article {sources[0].articleNumber} →</span>
                </Link>
            ) : (
                /* Multiple sources: accordion */
                <div style={{ marginTop: 'var(--space-2)' }}>
                    <button
                        className="btn btn-ghost"
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            padding: 'var(--space-1) 0',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-1)'
                        }}
                    >
                        <span style={{
                            display: 'inline-block',
                            transition: 'transform 0.2s',
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                        }}>
                            ▶
                        </span>
                        {isExpanded ? 'Hide' : 'View'} {sources.length} sources
                    </button>

                    {/* Expanded source list */}
                    {isExpanded && (
                        <div style={{
                            marginTop: 'var(--space-2)',
                            paddingLeft: 'var(--space-2)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-1)'
                        }}>
                            {sources.map((source, idx) => (
                                <Link
                                    key={idx}
                                    to={getDocumentPath(source)}
                                    onClick={handleSaveScroll}
                                    style={{
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--accent-primary)',
                                        textDecoration: 'none'
                                    }}
                                >
                                    {source.documentTitle}, Article {source.articleNumber} →
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const Terminology = () => {
    const [searchParams] = useSearchParams();
    const [terminology, setTerminology] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load terminology data
    useEffect(() => {
        const loadTerminology = async () => {
            try {
                const response = await fetch(`${import.meta.env.BASE_URL}data/terminology.json`);
                if (!response.ok) throw new Error('Failed to load terminology');
                const data = await response.json();
                setTerminology(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadTerminology();
    }, []);

    // ⚠️ Navigation Type Detection Pattern
    // Uses React Router's useNavigationType() hook to distinguish between:
    //   - 'POP':     Back/forward button navigation → Restore scroll position
    //   - 'PUSH':    Link click navigation         → Start at top
    //   - 'REPLACE': Replace navigation            → Start at top
    // This provides the optimal UX: users can pick up where they left off when using browser 
    // back button, but get a fresh start when explicitly clicking the Terminology menu item.
    // 
    // NOTE: The Performance Navigation API does NOT work for SPA navigation because
    // React Router handles navigation client-side without loading a new document.
    // React Router's hook properly tracks in-app navigation via the History API.
    const navigationType = useNavigationType();
    const isBackForward = navigationType === 'POP';

    // Scroll restoration: restore scroll position when returning via back/forward button
    // [TRACE] Enable with: ?debug=scroll or window.enableTrace('scroll')
    useEffect(() => {
        if (!loading && terminology) {
            const savedScrollY = sessionStorage.getItem('terminologyScrollY');

            // Trace the state for debugging (zero-cost when disabled)
            trace('scroll:restore', {
                navigationType,
                isBackForward,
                savedScrollY,
                scrollHeight: document.documentElement.scrollHeight
            });

            if (savedScrollY && isBackForward) {
                // Only restore scroll position if user came via back/forward button
                const scrollY = parseInt(savedScrollY, 10);
                trace('scroll:restore', 'Restoring to', scrollY);

                // Double-RAF pattern: ensures DOM has fully painted before scrolling
                // - First RAF: queued after current frame
                // - Second RAF: runs after browser has completed layout/paint
                // This is critical for long lists (500+ terminology items)
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        window.scrollTo(0, scrollY);
                        sessionStorage.removeItem('terminologyScrollY');
                        trace('scroll:restore', 'Scroll applied, final scrollY:', window.scrollY);
                    });
                });
            } else if (savedScrollY && !isBackForward) {
                // User navigated manually (e.g., clicked menu link), clear saved position
                trace('scroll:restore', 'Manual navigation, clearing saved position');
                sessionStorage.removeItem('terminologyScrollY');
            } else {
                trace('scroll:restore', 'No saved position or not applicable');
            }
        }
    }, [loading, terminology, isBackForward, navigationType]);

    // NOTE: We intentionally do NOT clear the scroll position on unmount.
    // The save-restore cycle works like this:
    //   1. User clicks source link → handleSaveScroll saves position
    //   2. Component unmounts (navigation to regulation)
    //   3. User clicks back → component remounts, isBackForward=true
    //   4. Scroll is restored, then position is cleared
    // Clearing on unmount (step 2) would break this cycle.

    // Save scroll position before navigating away
    // [TRACE] Enable with: ?debug=scroll or window.enableTrace('scroll')
    const handleSaveScroll = () => {
        const scrollY = window.scrollY;
        trace('scroll:save', 'Saving position:', scrollY);
        sessionStorage.setItem('terminologyScrollY', scrollY.toString());
    };

    // Deep linking: scroll to term when content loads or section param changes
    // This takes precedence over scroll restoration
    useEffect(() => {
        if (!loading && terminology) {
            const section = searchParams.get('section');
            if (section) {
                // Clear saved scroll position if we have a section param (deep link)
                sessionStorage.removeItem('terminologyScrollY');
                // Small delay to ensure DOM is fully rendered
                requestAnimationFrame(() => {
                    const element = document.getElementById(section);
                    if (element) {
                        // Header (64px) + sticky nav (~56px) + extra padding for visibility
                        const headerOffset = 135;
                        const targetY = element.getBoundingClientRect().top + window.scrollY - headerOffset;
                        fastScrollTo(targetY);
                        element.focus({ preventScroll: true });
                    }
                });
            }
        }
    }, [loading, terminology, searchParams]);

    // All terms (filtering removed - use global search instead)
    const filteredTerms = useMemo(() => {
        if (!terminology) return [];
        return terminology.terms;
    }, [terminology]);

    // Group filtered terms by first letter
    const groupedTerms = useMemo(() => {
        const groups = {};
        for (const term of filteredTerms) {
            const letter = term.term[0].toUpperCase();
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(term);
        }
        return groups;
    }, [filteredTerms]);

    // Available letters (only those with terms after filtering)
    const availableLetters = useMemo(() => {
        return Object.keys(groupedTerms).sort();
    }, [groupedTerms]);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    // Get document route path using the new source format
    const getDocumentPath = (source) => {
        const basePath = source.documentType === 'regulation' ? 'regulation' : 'implementing-acts';
        return `/${basePath}/${source.documentId}?section=${source.articleId}`;
    };

    if (loading) {
        return (
            <div className="animate-fadeIn" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto var(--space-4)' }} />
                <p className="text-muted">Loading terminology...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-fadeIn">
                <div className="card" style={{ background: 'var(--bg-tertiary)', textAlign: 'center' }}>
                    <p className="text-error">❌ {error}</p>
                    <p className="text-sm text-muted" style={{ marginTop: 'var(--space-2)' }}>
                        Run <code>npm run build:terminology</code> to generate terminology data.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <header style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ marginBottom: 'var(--space-3)' }}>Terminology</h1>
                <p className="text-lg text-muted">
                    Legal definitions from eIDAS 2.0 Regulation and Implementing Acts
                </p>
                <div className="flex gap-4 mt-4" style={{ flexWrap: 'wrap' }}>
                    <span className="badge badge-secondary">
                        {terminology.statistics.totalTerms} terms
                    </span>
                    <span className="badge badge-secondary">
                        {terminology.statistics.totalDefinitions} definitions
                    </span>
                    <span className="badge badge-primary">
                        {terminology.statistics.sources.regulations} from Regulations
                    </span>
                    <span className="badge">
                        {terminology.statistics.sources.implementingActs} from Implementing Acts
                    </span>
                </div>
            </header>

            {/* Alphabet quick nav - sticky below header */}
            <nav
                className="alphabet-nav-sticky"
                style={{
                    position: 'sticky',
                    top: '64px', /* Below header */
                    zIndex: 90,
                    margin: '0 calc(-1 * var(--space-6))', /* Full-width bleed */
                    padding: 'var(--space-3) var(--space-6)',
                    marginBottom: 'var(--space-6)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 'var(--space-1)',
                    background: 'rgba(var(--bg-primary-rgb), 0.85)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--border-secondary)'
                }}
            >
                {alphabet.map(letter => {
                    const isAvailable = availableLetters.includes(letter);
                    return (
                        <button
                            key={letter}
                            className={`btn ${isAvailable ? 'btn-ghost' : 'btn-ghost'}`}
                            style={{
                                padding: 'var(--space-1) var(--space-2)',
                                fontSize: 'var(--text-sm)',
                                minWidth: '32px',
                                opacity: isAvailable ? 1 : 0.3,
                                cursor: isAvailable ? 'pointer' : 'default'
                            }}
                            disabled={!isAvailable}
                            onClick={() => {
                                if (isAvailable) {
                                    const el = document.getElementById(`letter-${letter}`);
                                    if (el) {
                                        // Header (64px) + sticky nav (~56px) + extra padding for visibility
                                        const headerOffset = 135;
                                        const targetY = el.getBoundingClientRect().top + window.scrollY - headerOffset;
                                        fastScrollTo(targetY);
                                    }
                                }
                            }}
                        >
                            {letter}
                        </button>
                    );
                })}
            </nav>



            {/* Terms list grouped by letter */}
            {availableLetters.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <p className="text-muted">No terms available. Run <code>npm run build:terminology</code> to generate terminology data.</p>
                </div>
            ) : (
                availableLetters.map(letter => (
                    <section key={letter} id={`letter-${letter}`} style={{ marginBottom: 'var(--space-8)' }}>
                        <h2
                            style={{
                                fontSize: 'var(--text-2xl)',
                                color: 'var(--accent-primary)',
                                marginBottom: 'var(--space-4)',
                                paddingBottom: 'var(--space-2)',
                                borderBottom: '2px solid var(--border-primary)'
                            }}
                        >
                            {letter}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {groupedTerms[letter].map(term => {
                                const sourceCount = term.sources.length;
                                const groups = term.definitionGroups || [{ definition: term.sources[0]?.definition, sources: term.sources, isVariant: false }];

                                return (
                                    <article
                                        key={term.id}
                                        id={`term-${term.id}`}
                                        className="card"
                                    >
                                        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
                                            <h3 style={{ color: 'var(--accent-primary)', margin: 0 }}>
                                                {term.term}
                                            </h3>
                                            <span
                                                className={`badge ${sourceCount > 1 ? 'badge-secondary' : ''}`}
                                                style={sourceCount === 1 ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' } : {}}
                                                title={`Defined in ${sourceCount} document${sourceCount > 1 ? 's' : ''}`}
                                            >
                                                {sourceCount} {sourceCount === 1 ? 'source' : 'sources'}
                                            </span>
                                        </div>

                                        {/* Definition groups - DEC-058 Accordion Collapse */}
                                        <div className="definitions-stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                            {groups.map((group, groupIdx) => (
                                                <DefinitionGroup
                                                    key={groupIdx}
                                                    group={group}
                                                    getDocumentPath={getDocumentPath}
                                                    handleSaveScroll={handleSaveScroll}
                                                />
                                            ))}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                ))
            )}

            {/* Back to top */}
            <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
                <button
                    className="btn btn-ghost text-sm"
                    onClick={() => fastScrollTo(0)}
                >
                    ↑ Back to top
                </button>
            </div>
        </div>
    );
};

export default Terminology;
