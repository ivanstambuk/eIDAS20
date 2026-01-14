import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Static content mapping for regulations
const REGULATION_INDEX = {
    '910-2014': {
        title: 'Regulation (EU) No 910/2014',
        shortTitle: 'eIDAS Regulation (Consolidated)',
        description: 'Electronic identification and trust services for electronic transactions in the internal market',
        celex: '02014R0910-20241018',
        path: '01_regulation/910_2014_eIDAS_Consolidated/02014R0910-20241018.md',
        date: '2014-07-23',
        lastAmended: '2024-10-18'
    },
    '2024-1183': {
        title: 'Regulation (EU) 2024/1183',
        shortTitle: 'eIDAS 2.0 Amending Regulation',
        description: 'Amending Regulation laying down a framework for a European Digital Identity',
        celex: '32024R1183',
        path: '01_regulation/2024_1183_eIDAS2_Amending/32024R1183.md',
        date: '2024-04-11',
        lastAmended: null
    }
};

const RegulationViewer = () => {
    const { id } = useParams();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toc, setToc] = useState([]);

    const regulation = REGULATION_INDEX[id];

    useEffect(() => {
        if (!regulation) {
            setError('Regulation not found');
            setLoading(false);
            return;
        }

        const loadContent = async () => {
            try {
                // In production, this would fetch from a pre-processed JSON
                // For now, we'll simulate with placeholder content
                setLoading(true);

                // Simulated delay for realistic UX
                await new Promise(resolve => setTimeout(resolve, 300));

                // For demo, we show placeholder - in production, fetch from public/data/
                setContent(`
# ${regulation.title}

**CELEX:** ${regulation.celex} | **Date:** ${regulation.date}

${regulation.description}

---

## Loading Content...

The full regulation content will be loaded from pre-processed JSON files.

To complete this feature:
1. Create a build-time script to convert markdown to JSON
2. Store processed content in \`public/data/regulations/\`
3. Fetch and render at runtime

---

*This is a placeholder. Full content loading will be implemented in the next iteration.*
        `);

                // Generate TOC from regulation structure
                setToc([
                    { id: 'enacting-terms', title: 'Enacting Terms', level: 1 },
                    { id: 'article-1', title: 'Article 1 - Subject matter', level: 2 },
                    { id: 'article-2', title: 'Article 2 - Scope', level: 2 },
                    { id: 'article-3', title: 'Article 3 - Definitions', level: 2 },
                    { id: 'chapter-ii', title: 'Chapter II - Electronic Identification', level: 1 },
                    { id: 'chapter-iii', title: 'Chapter III - Trust Services', level: 1 },
                    { id: 'annexes', title: 'Annexes', level: 1 },
                ]);

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        loadContent();
    }, [id, regulation]);

    if (!regulation) {
        return (
            <div className="animate-fadeIn" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                <h1 style={{ color: 'var(--accent-warning)', marginBottom: 'var(--space-4)' }}>
                    Regulation Not Found
                </h1>
                <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
                    The regulation "{id}" doesn&apos;t exist in our database.
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
                    <span style={{ color: 'var(--text-secondary)' }}>Regulations</span>
                    <span>/</span>
                    <span style={{ color: 'var(--accent-primary)' }}>{regulation.shortTitle}</span>
                </div>
            </nav>

            {/* Header */}
            <header style={{ marginBottom: 'var(--space-8)' }}>
                <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-3)' }}>
                    <span className="badge badge-primary">Regulation</span>
                    <span className="badge badge-info">CELEX: {regulation.celex}</span>
                </div>
                <h1 style={{ marginBottom: 'var(--space-2)' }}>{regulation.title}</h1>
                <p className="text-lg text-muted">{regulation.description}</p>
                <div className="flex gap-4 text-sm text-muted" style={{ marginTop: 'var(--space-3)' }}>
                    <span>📅 Adopted: {regulation.date}</span>
                    {regulation.lastAmended && <span>🔄 Last amended: {regulation.lastAmended}</span>}
                </div>
            </header>

            {/* Main Content Area with TOC */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 250px',
                gap: 'var(--space-8)',
                alignItems: 'start'
            }}>
                {/* Article Content */}
                <main>
                    {loading ? (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto var(--space-4)' }}></div>
                            <p className="text-muted">Loading regulation content...</p>
                        </div>
                    ) : error ? (
                        <div className="card" style={{ background: 'var(--bg-error)', textAlign: 'center' }}>
                            <p style={{ color: 'var(--accent-error)' }}>Error: {error}</p>
                        </div>
                    ) : (
                        <article className="regulation-content card" style={{ padding: 'var(--space-8)' }}>
                            <div dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(content) }} />
                        </article>
                    )}
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
                        <nav>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {toc.map((item) => (
                                    <li key={item.id} style={{ marginBottom: 'var(--space-2)' }}>
                                        <a
                                            href={`#${item.id}`}
                                            className="toc-link"
                                            style={{
                                                display: 'block',
                                                padding: 'var(--space-1) var(--space-2)',
                                                paddingLeft: item.level === 2 ? 'var(--space-4)' : 'var(--space-2)',
                                                color: 'var(--text-secondary)',
                                                textDecoration: 'none',
                                                fontSize: item.level === 1 ? 'var(--text-sm)' : 'var(--text-xs)',
                                                fontWeight: item.level === 1 ? 'var(--font-semibold)' : 'var(--font-normal)',
                                                borderRadius: 'var(--border-radius-sm)',
                                                transition: 'all var(--transition-fast)'
                                            }}
                                        >
                                            {item.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* Quick Actions */}
                    <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                        <h4 style={{ marginBottom: 'var(--space-3)' }}>Actions</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                📄 Export PDF
                            </button>
                            <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                📋 Copy Link
                            </button>
                            <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                🔗 View on EUR-Lex
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

// Simple markdown to HTML converter (basic implementation)
const simpleMarkdownToHtml = (markdown) => {
    if (!markdown) return '';

    return markdown
        // Headers
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Code blocks
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr />')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        // Wrap in paragraphs
        .replace(/^(.+)$/gm, (match) => {
            if (match.startsWith('<')) return match;
            return match;
        });
};

export default RegulationViewer;
