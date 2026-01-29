import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

// Category definitions with keyword matching
const CATEGORIES = {
    wallet: {
        label: 'Wallet',
        keywords: ['wallet', 'digital identity', 'person identification', 'pid', 'eaa', 'attestation'],
        color: 'var(--accent-primary)',
        bgColor: 'var(--accent-primary-dim)'
    },
    'trust-services': {
        label: 'Trust Services',
        keywords: ['trust service', 'qtsp', 'qualified', 'certificate', 'signature', 'seal', 'timestamp', 'preservation', 'validation', 'archiving', 'ledger', 'delivery'],
        color: 'var(--accent-secondary)',
        bgColor: 'var(--accent-secondary-dim)'
    },
    eid: {
        label: 'eID Schemes',
        keywords: ['electronic identification', 'notification', 'peer review', 'identity matching', 'cross-border'],
        color: 'var(--accent-warning)',
        bgColor: 'var(--accent-warning-dim)'
    }
    // Security category removed (DEC-286): All potential matches (security breach, certification,
    // conformity assessment, accreditation, risk) are already claimed by Wallet or Trust Services
    // due to first-match-wins logic, resulting in 0 displayed acts.
};

// Determine category from title
function categorizeByTitle(title) {
    const lowerTitle = title.toLowerCase();

    for (const [catId, cat] of Object.entries(CATEGORIES)) {
        for (const keyword of cat.keywords) {
            if (lowerTitle.includes(keyword)) {
                return catId;
            }
        }
    }
    return 'other';
}

// Extract a friendlier short title from the full title
function extractFriendlyTitle(fullTitle, shortTitle) {
    // Use shortTitle if it's already friendly (not just IR number)
    if (shortTitle && !shortTitle.startsWith('IR ') && !shortTitle.startsWith('ID ')) {
        return shortTitle;
    }

    // Extract the "as regards X" or "laying down rules for X" part
    const asRegardsMatch = fullTitle.match(/as regards\s+(.+?)(?:\s+issued|\s+of|\s+pursuant|\s*$)/i);
    if (asRegardsMatch) {
        let title = asRegardsMatch[1];
        // Capitalize first letter and limit length
        title = title.charAt(0).toUpperCase() + title.slice(1);
        return title.length > 60 ? title.substring(0, 57) + '...' : title;
    }

    // Fallback: use shortTitle
    return shortTitle;
}

const ImplementingActs = () => {
    const [acts, setActs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState(new Set(['all']));
    const [sortBy, setSortBy] = useState('date-desc');

    // Load data from JSON index
    useEffect(() => {
        const loadActs = async () => {
            try {
                const response = await fetch(`${import.meta.env.BASE_URL}data/regulations-index.json`);
                if (!response.ok) throw new Error('Failed to load index');

                const data = await response.json();

                // Filter to implementing acts only and enrich with category
                const implementingActs = data
                    .filter(item => item.type === 'implementing-act')
                    .map(item => ({
                        ...item,
                        category: categorizeByTitle(item.title),
                        friendlyTitle: extractFriendlyTitle(item.title, item.shortTitle)
                    }));

                setActs(implementingActs);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        loadActs();
    }, []);

    // Calculate category counts
    const categoryCounts = useMemo(() => {
        const counts = { all: acts.length };
        for (const catId of Object.keys(CATEGORIES)) {
            counts[catId] = acts.filter(a => a.category === catId).length;
        }
        counts.other = acts.filter(a => a.category === 'other').length;
        return counts;
    }, [acts]);

    // Filter and sort acts
    const filteredActs = useMemo(() => {
        let filtered = acts;

        // Apply category filter (multi-select)
        if (!selectedCategories.has('all')) {
            filtered = filtered.filter(act => selectedCategories.has(act.category));
        }

        // Apply sorting
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return (b.date || '').localeCompare(a.date || '');
                case 'date-asc':
                    return (a.date || '').localeCompare(b.date || '');
                case 'title':
                    return a.friendlyTitle.localeCompare(b.friendlyTitle);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [acts, selectedCategories, sortBy]);

    // Handle category toggle
    const toggleCategory = (catId) => {
        setSelectedCategories(prev => {
            const next = new Set(prev);

            if (catId === 'all') {
                // Reset to all
                return new Set(['all']);
            }

            // Remove 'all' when selecting specific categories
            next.delete('all');

            if (next.has(catId)) {
                next.delete(catId);
                // If nothing selected, go back to all
                if (next.size === 0) {
                    return new Set(['all']);
                }
            } else {
                next.add(catId);
            }

            return next;
        });
    };

    if (loading) {
        return (
            <div className="animate-fadeIn" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                <div className="loading-spinner" style={{ margin: '0 auto var(--space-4)' }}></div>
                <p className="text-muted">Loading implementing acts...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-fadeIn" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                <p style={{ color: 'var(--accent-error)' }}>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <header style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ marginBottom: 'var(--space-3)' }}>Implementing Acts</h1>
                <p className="text-lg text-muted">
                    Commission Implementing Regulations under eIDAS 2.0
                </p>
            </header>

            {/* Filter controls */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)'
            }}>
                {/* Category filters */}
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    {/* All button */}
                    <button
                        className={`btn ${selectedCategories.has('all') ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => toggleCategory('all')}
                        style={{ transition: 'all var(--transition-fast)' }}
                    >
                        All
                        <span style={{ opacity: 0.7, marginLeft: 'var(--space-2)' }}>
                            {categoryCounts.all}
                        </span>
                    </button>

                    {/* Category buttons */}
                    {Object.entries(CATEGORIES).map(([catId, cat]) => (
                        <button
                            key={catId}
                            className={`btn ${selectedCategories.has(catId) ? '' : 'btn-secondary'}`}
                            onClick={() => toggleCategory(catId)}
                            style={{
                                transition: 'all var(--transition-fast)',
                                ...(selectedCategories.has(catId) ? {
                                    background: cat.bgColor,
                                    color: cat.color,
                                    borderColor: cat.color
                                } : {})
                            }}
                        >
                            {cat.label}
                            <span style={{ opacity: 0.7, marginLeft: 'var(--space-2)' }}>
                                {categoryCounts[catId] || 0}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Sort dropdown */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: 'var(--space-2) var(--space-3)',
                        fontSize: 'var(--text-sm)',
                        cursor: 'pointer'
                    }}
                >
                    <option value="date-desc">Newest first</option>
                    <option value="date-asc">Oldest first</option>
                    <option value="title">By title</option>
                </select>
            </div>

            {/* Active filters indicator */}
            {!selectedCategories.has('all') && (
                <div
                    style={{
                        marginBottom: 'var(--space-4)',
                        padding: 'var(--space-2) var(--space-3)',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--border-radius-md)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        fontSize: 'var(--text-sm)'
                    }}
                >
                    <span className="text-muted">Filtering:</span>
                    {[...selectedCategories].map(catId => (
                        <span
                            key={catId}
                            style={{
                                background: CATEGORIES[catId]?.bgColor || 'var(--bg-secondary)',
                                color: CATEGORIES[catId]?.color || 'var(--text-primary)',
                                padding: '2px 8px',
                                borderRadius: 'var(--border-radius-sm)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            {CATEGORIES[catId]?.label || catId}
                            <button
                                onClick={() => toggleCategory(catId)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    padding: '0 2px',
                                    fontSize: '14px',
                                    lineHeight: 1
                                }}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <button
                        onClick={() => setSelectedCategories(new Set(['all']))}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-primary)',
                            cursor: 'pointer',
                            fontSize: 'var(--text-sm)',
                            marginLeft: 'var(--space-2)'
                        }}
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* Acts list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {filteredActs.map(act => {
                    const cat = CATEGORIES[act.category] || {
                        label: 'Other',
                        color: 'var(--text-secondary)',
                        bgColor: 'var(--bg-tertiary)'
                    };

                    return (
                        <Link
                            key={act.slug}
                            to={`/implementing-acts/${act.slug}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <article className="card" style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto',
                                alignItems: 'center',
                                gap: 'var(--space-4)',
                                transition: 'all var(--transition-fast)'
                            }}>
                                <div>
                                    <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-2)' }}>
                                        <span
                                            className="badge"
                                            style={{
                                                background: cat.bgColor,
                                                color: cat.color,
                                                border: 'none',
                                                textTransform: 'uppercase',
                                                fontSize: 'var(--text-xs)'
                                            }}
                                        >
                                            {cat.label}
                                        </span>
                                        <span className="text-sm text-muted">{act.celex}</span>
                                    </div>
                                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                                        {act.friendlyTitle}
                                    </h3>
                                    <p
                                        className="text-sm text-muted"
                                        style={{
                                            marginTop: 'var(--space-1)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '600px'
                                        }}
                                    >
                                        {act.title.replace(/^Commission Implementing Regulation \(EU\) \d{4}\/\d+ of \d+ \w+ \d{4} laying down rules for the application of Regulation \(EU\) No 910\/2014 of the European Parliament and of the Council as regards /, '')}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p className="text-sm text-muted">{act.date}</p>
                                    <span
                                        className="badge badge-success"
                                        style={{ marginTop: 'var(--space-2)' }}
                                    >
                                        ● In Force
                                    </span>
                                    <p className="text-xs text-muted" style={{ marginTop: 'var(--space-1)' }}>
                                        {act.wordCount?.toLocaleString()} words
                                    </p>
                                </div>
                            </article>
                        </Link>
                    );
                })}
            </div>

            {/* Results summary */}
            <p className="text-sm text-muted" style={{ marginTop: 'var(--space-8)' }}>
                Showing {filteredActs.length} of {acts.length} implementing acts.
            </p>
        </div>
    );
};

export default ImplementingActs;
