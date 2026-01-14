import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CollapsibleTOC from '../components/CollapsibleTOC';

const RegulationViewer = () => {
    const { id } = useParams();
    const [regulation, setRegulation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRegulation = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch the regulation JSON
                const response = await fetch(`${import.meta.env.BASE_URL}data/regulations/${id}.json`);

                if (!response.ok) {
                    throw new Error(`Regulation "${id}" not found`);
                }

                const data = await response.json();
                setRegulation(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (id) {
            loadRegulation();
        }
    }, [id]);

    // Loading state
    if (loading) {
        return (
            <div className="animate-fadeIn" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                <div className="loading-spinner" style={{ margin: '0 auto var(--space-4)' }}></div>
                <p className="text-muted">Loading regulation...</p>
            </div>
        );
    }

    // Error state
    if (error || !regulation) {
        return (
            <div className="animate-fadeIn" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                <h1 style={{ color: 'var(--accent-warning)', marginBottom: 'var(--space-4)' }}>
                    Regulation Not Found
                </h1>
                <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
                    {error || `The regulation "${id}" doesn't exist in our database.`}
                </p>
                <Link to="/" className="btn btn-primary">Go Home</Link>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Breadcrumb */}
            <nav style={{ marginBottom: 'var(--space-4)' }}>
                <div className="flex items-center gap-2 text-sm text-muted">
                    <Link to="/" style={{ color: 'var(--text-tertiary)' }}>Home</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                        {regulation.type === 'regulation' ? 'Regulations' : 'Implementing Acts'}
                    </span>
                    <span>/</span>
                    <span style={{ color: 'var(--accent-primary)' }}>{regulation.shortTitle}</span>
                </div>
            </nav>

            {/* Header */}
            <header style={{ marginBottom: 'var(--space-8)' }}>
                <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-3)' }}>
                    <span className={`badge ${regulation.type === 'regulation' ? 'badge-primary' : 'badge-info'}`}>
                        {regulation.type === 'regulation' ? 'Regulation' : 'Implementing Act'}
                    </span>
                    <span className="badge badge-info">CELEX: {regulation.celex}</span>
                </div>
                <h1 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-2xl)' }}>
                    {regulation.shortTitle}
                </h1>
                <p className="text-lg text-muted" style={{ lineHeight: '1.5' }}>
                    {regulation.title}
                </p>
                <div className="flex gap-4 text-sm text-muted" style={{ marginTop: 'var(--space-3)' }}>
                    <span>📅 {regulation.date}</span>
                    <span>📖 {regulation.wordCount?.toLocaleString()} words</span>
                    {regulation.source && (
                        <a
                            href={regulation.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--accent-primary)' }}
                        >
                            🔗 View on EUR-Lex
                        </a>
                    )}
                </div>
            </header>

            {/* Main Content Area with TOC */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 280px',
                gap: 'var(--space-8)',
                alignItems: 'start'
            }}>
                {/* Article Content */}
                <main>
                    <article
                        className="regulation-content card"
                        style={{ padding: 'var(--space-8)' }}
                        dangerouslySetInnerHTML={{ __html: regulation.contentHtml }}
                    />
                </main>

                {/* Table of Contents Sidebar */}
                <aside style={{
                    position: 'sticky',
                    top: 'var(--space-4)',
                    maxHeight: 'calc(100vh - var(--space-8))',
                    overflowY: 'auto'
                }}>
                    <div className="card" style={{ padding: 'var(--space-4)' }}>
                        <h4 style={{
                            marginBottom: 'var(--space-4)',
                            paddingBottom: 'var(--space-2)',
                            borderBottom: '1px solid var(--border-color)'
                        }}>
                            Table of Contents
                        </h4>
                        <CollapsibleTOC
                            toc={regulation.toc || []}
                            slug={regulation.slug}
                            type={regulation.type}
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                        <h4 style={{ marginBottom: 'var(--space-3)' }}>Export</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                style={{ width: '100%', justifyContent: 'flex-start' }}
                                onClick={() => {
                                    // Open print dialog for PDF export
                                    window.print();
                                }}
                                title="Use browser print-to-PDF"
                            >
                                📄 Save as PDF
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                style={{ width: '100%', justifyContent: 'flex-start' }}
                                onClick={() => {
                                    // Download as Markdown
                                    if (regulation.contentMarkdown) {
                                        const blob = new Blob([regulation.contentMarkdown], { type: 'text/markdown' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${regulation.slug || 'regulation'}.md`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                    }
                                }}
                            >
                                📝 Download Markdown
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                style={{ width: '100%', justifyContent: 'flex-start' }}
                                onClick={() => {
                                    // Download as JSON
                                    const blob = new Blob([JSON.stringify(regulation, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${regulation.slug || 'regulation'}.json`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                }}
                            >
                                📋 Download JSON
                            </button>
                        </div>

                        <h4 style={{ marginBottom: 'var(--space-3)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-color)' }}>Share</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                style={{ width: '100%', justifyContent: 'flex-start' }}
                                onClick={(e) => {
                                    navigator.clipboard.writeText(window.location.href);
                                    const btn = e.currentTarget;
                                    const originalText = btn.innerHTML;
                                    btn.innerHTML = '✅ Copied!';
                                    btn.style.color = 'var(--accent-success)';
                                    setTimeout(() => {
                                        btn.innerHTML = originalText;
                                        btn.style.color = '';
                                    }, 2000);
                                }}
                            >
                                🔗 Copy Link
                            </button>
                            {regulation.source && (
                                <a
                                    href={regulation.source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary btn-sm"
                                    style={{ width: '100%', justifyContent: 'flex-start', textDecoration: 'none' }}
                                >
                                    🌐 View on EUR-Lex
                                </a>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default RegulationViewer;
