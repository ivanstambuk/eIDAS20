import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

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
    const [terminology, setTerminology] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedTerms, setExpandedTerms] = useState(new Set());

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

    // Filter terms based on search query
    const filteredTerms = useMemo(() => {
        if (!terminology) return [];
        if (!searchQuery.trim()) return terminology.terms;

        const query = searchQuery.toLowerCase();
        return terminology.terms.filter(term =>
            term.term.toLowerCase().includes(query) ||
            term.definitions.some(d => d.text.toLowerCase().includes(query))
        );
    }, [terminology, searchQuery]);

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

    const toggleExpanded = (termId) => {
        setExpandedTerms(prev => {
            const next = new Set(prev);
            if (next.has(termId)) {
                next.delete(termId);
            } else {
                next.add(termId);
            }
            return next;
        });
    };

    // Get document route path based on type
    const getDocumentPath = (source) => {
        const basePath = source.type === 'regulation' ? 'regulation' : 'implementing-acts';
        return `/${basePath}/${source.slug}#article-${source.article}`;
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
                    Legal definitions from eIDAS Regulation and Implementing Acts
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
                                        // Header (64px) + sticky nav (~52px) + padding
                                        const headerOffset = 64 + 56;
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


            {/* Search */}
            <div className="search-box" style={{ marginBottom: 'var(--space-8)', maxWidth: '500px' }}>
                <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    className="input"
                    placeholder="Search terms and definitions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="btn btn-ghost"
                        style={{
                            position: 'absolute',
                            right: 'var(--space-2)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            padding: 'var(--space-1)'
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Results count */}
            {searchQuery && (
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>
                    Found {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''} matching "{searchQuery}"
                </p>
            )}

            {/* Terms list grouped by letter */}
            {availableLetters.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <p className="text-muted">No terms found matching your search.</p>
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
                                const isExpanded = expandedTerms.has(term.id);
                                const hasMultipleDefs = term.definitions.length > 1;
                                const primaryDef = term.definitions[0];

                                return (
                                    <article
                                        key={term.id}
                                        id={`term-${term.id}`}
                                        className="card"
                                    >
                                        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                                            <h3 style={{ color: 'var(--accent-primary)', margin: 0 }}>
                                                {term.term}
                                            </h3>
                                            <div className="flex gap-2">
                                                <span className="badge badge-primary">
                                                    Art. {primaryDef.source.article}({primaryDef.source.ordinal})
                                                </span>
                                                {hasMultipleDefs && (
                                                    <span className="badge badge-secondary">
                                                        {term.definitions.length} sources
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p style={{ lineHeight: 1.7 }}>
                                            {primaryDef.text}
                                        </p>

                                        <div className="flex items-center gap-4 mt-4" style={{ flexWrap: 'wrap' }}>
                                            <Link
                                                to={getDocumentPath(primaryDef.source)}
                                                className="text-sm text-link"
                                            >
                                                View in {primaryDef.source.shortRef} →
                                            </Link>
                                            <button
                                                className="btn btn-ghost text-sm"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(primaryDef.text);
                                                }}
                                            >
                                                Copy definition
                                            </button>
                                            {hasMultipleDefs && (
                                                <button
                                                    className="btn btn-ghost text-sm"
                                                    onClick={() => toggleExpanded(term.id)}
                                                >
                                                    {isExpanded ? 'Hide sources ▲' : `Show all sources ▼`}
                                                </button>
                                            )}
                                        </div>

                                        {/* Expanded sources */}
                                        {isExpanded && hasMultipleDefs && (
                                            <div
                                                className="mt-4"
                                                style={{
                                                    borderTop: '1px solid var(--border-secondary)',
                                                    paddingTop: 'var(--space-4)'
                                                }}
                                            >
                                                <p className="text-sm text-muted mb-3">
                                                    This term is defined in {term.definitions.length} documents:
                                                </p>
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    {term.definitions.map((def, idx) => (
                                                        <li
                                                            key={idx}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 'var(--space-3)',
                                                                padding: 'var(--space-2) 0',
                                                                borderBottom: idx < term.definitions.length - 1 ? '1px solid var(--border-tertiary)' : 'none'
                                                            }}
                                                        >
                                                            <span className="badge" style={{ flexShrink: 0 }}>
                                                                Art. {def.source.article}({def.source.ordinal})
                                                            </span>
                                                            <Link
                                                                to={getDocumentPath(def.source)}
                                                                className="text-sm text-link"
                                                                style={{ flex: 1 }}
                                                            >
                                                                {def.source.shortRef}
                                                            </Link>
                                                            <span
                                                                className="text-xs"
                                                                style={{
                                                                    color: def.source.type === 'regulation' ? 'var(--accent-primary)' : 'var(--text-muted)'
                                                                }}
                                                            >
                                                                {def.source.type === 'regulation' ? '📜 Regulation' : '📋 IA'}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
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
