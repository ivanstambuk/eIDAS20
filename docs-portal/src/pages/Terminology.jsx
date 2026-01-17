import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useNavigationType } from '../hooks/useNavigationType';

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
    // Uses the Performance Navigation API to distinguish between:
    //   - Back/forward button navigation (type: 'back_forward') → Restore scroll position
    //   - Manual navigation via menu/links (type: 'navigate')   → Start at top
    // This provides the optimal UX: users can pick up where they left off when using browser 
    // back button, but get a fresh start when explicitly clicking the Terminology menu item.
    // See: .agent/snippets/react-patterns.md for full scroll restoration pattern documentation
    const { isBackForward } = useNavigationType();

    // Scroll restoration: restore scroll position when returning via back/forward button
    useEffect(() => {
        if (!loading && terminology) {
            const savedScrollY = sessionStorage.getItem('terminologyScrollY');

            if (savedScrollY && isBackForward) {
                // Only restore scroll position if user came via back/forward button
                const scrollY = parseInt(savedScrollY, 10);
                setTimeout(() => {
                    window.scrollTo(0, scrollY);
                    sessionStorage.removeItem('terminologyScrollY');
                }, 0);
            } else if (savedScrollY && !isBackForward) {
                // User navigated manually (e.g., clicked menu link), clear saved position
                sessionStorage.removeItem('terminologyScrollY');
            }
        }
    }, [loading, terminology, isBackForward]);

    // Cleanup: clear saved scroll position on unmount
    useEffect(() => {
        return () => {
            sessionStorage.removeItem('terminologyScrollY');
        };
    }, []);

    // Save scroll position before navigating away
    const handleSaveScroll = () => {
        sessionStorage.setItem('terminologyScrollY', window.scrollY.toString());
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
                                const hasMultipleSources = term.sources.length > 1;

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
                                            {hasMultipleSources && (
                                                <span className="badge badge-secondary" title={`Defined in ${term.sources.length} documents`}>
                                                    {term.sources.length} sources
                                                </span>
                                            )}
                                        </div>

                                        {/* Stacked definitions from all sources */}
                                        <div className="definitions-stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                            {term.sources.map((source, idx) => (
                                                <div
                                                    key={idx}
                                                    className="definition-source"
                                                    style={{
                                                        borderLeft: '3px solid var(--accent-primary)',
                                                        paddingLeft: 'var(--space-3)'
                                                    }}
                                                >
                                                    {/* Merged source header + link: clickable header eliminates redundancy */}
                                                    <Link
                                                        to={getDocumentPath(source)}
                                                        className="source-header-link"
                                                        onClick={handleSaveScroll}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 'var(--space-2)',
                                                            marginBottom: 'var(--space-2)',
                                                            fontSize: 'var(--text-sm)',
                                                            color: 'var(--accent-primary)',
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        <span>
                                                            <strong>{source.documentTitle}</strong>, Article {source.articleNumber} →
                                                        </span>
                                                    </Link>
                                                    <p className="definition-text" style={{ fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
                                                        {source.definition}
                                                    </p>
                                                </div>
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
