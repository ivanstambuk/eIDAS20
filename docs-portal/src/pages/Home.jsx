import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Home = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // Fetch build-time computed stats from metadata.json
        fetch(`${import.meta.env.BASE_URL}data/metadata.json`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Failed to load metadata:', err));
    }, []);

    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
            <section style={{ marginBottom: 'var(--space-12)' }}>
                <h1 style={{ marginBottom: 'var(--space-4)' }}>
                    <span style={{ color: 'var(--accent-primary)' }}>eIDAS 2.0</span> Documentation
                </h1>
                <p className="text-lg text-muted" style={{ maxWidth: '700px', marginBottom: 'var(--space-6)' }}>
                    Comprehensive reference for the European Digital Identity framework.
                    Navigate regulations, implementing acts, and terminology with ease.
                </p>
                <div className="flex gap-3">
                    <Link to="/regulation/2014-910" className="btn btn-primary">
                        Read the Regulation
                    </Link>
                    <Link to="/terminology" className="btn btn-secondary">
                        Terminology
                    </Link>
                </div>
            </section>

            {/* Stats Cards - Now Dynamic! */}
            <section style={{ marginBottom: 'var(--space-12)' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--space-4)'
                }}>
                    <StatCard
                        label="Regulations"
                        value={stats?.regulationCount ?? '—'}
                        description="Core + Referenced"
                        accent="var(--accent-primary)"
                    />
                    <StatCard
                        label="Implementing Acts"
                        value={stats?.implementingActCount ?? '—'}
                        description="Commission Acts"
                        accent="var(--accent-secondary)"
                    />
                    <StatCard
                        label="Definitions"
                        value={stats?.terminologyCount ?? '—'}
                        description="Legal Terms"
                        accent="var(--accent-warning)"
                    />
                    <StatCard
                        label="Articles"
                        value={stats?.totalArticles ?? '—'}
                        description="Regulatory Provisions"
                        accent="var(--accent-info)"
                    />
                </div>
            </section>

            {/* Quick Links */}
            <section>
                <h2 style={{ marginBottom: 'var(--space-6)' }}>Quick Links</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 'var(--space-4)'
                }}>
                    <QuickLinkCard
                        title="European Digital Identity Wallet"
                        description="Article 5a - Core requirements for EUDI Wallets"
                        path="/regulation/2014-910#article-5a"
                        badge="Core"
                    />
                    <QuickLinkCard
                        title="Qualified Trust Services"
                        description="Chapter III - Requirements for QTSPs"
                        path="/regulation/2014-910#chapter-iii"
                        badge="Trust Services"
                    />
                    <QuickLinkCard
                        title="Relying Party Registration"
                        description="2025/0848 - Registration requirements for RPs"
                        path="/implementing-acts/2025-0848"
                        badge="Implementing Act"
                    />
                    <QuickLinkCard
                        title="Electronic Attestations"
                        description="Articles 45d-45g - Attestation of Attributes"
                        path="/regulation/2014-910#article-45d"
                        badge="Attestations"
                    />
                </div>
            </section>

            {/* Compliance Assessment - Links to real RCA tool */}
            <section style={{ marginTop: 'var(--space-12)' }}>
                <h2 style={{ marginBottom: 'var(--space-4)' }}>Compliance Assessment</h2>
                <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
                    Check requirements for your specific role in the eIDAS ecosystem.
                </p>
                <Link to="/compliance" className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    <span>Open RCA Tool</span>
                    <span
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '2px 8px',
                            borderRadius: 'var(--border-radius-full)',
                            fontSize: 'var(--text-xs)'
                        }}
                    >
                        458 requirements
                    </span>
                </Link>
            </section>
        </div>
    );
};

const StatCard = ({ label, value, description, accent }) => (
    <div
        className="card card-glow"
        style={{
            borderTop: `3px solid ${accent}`,
            background: 'var(--bg-secondary)'
        }}
    >
        <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-1)' }}>{label}</p>
        <p style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--font-bold)',
            color: accent,
            marginBottom: 'var(--space-1)'
        }}>
            {value}
        </p>
        <p className="text-sm text-muted">{description}</p>
    </div>
);

const QuickLinkCard = ({ title, description, path, badge }) => (
    <Link to={path} style={{ textDecoration: 'none' }}>
        <div className="card" style={{ height: '100%', transition: 'all var(--transition-base)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                <span className="badge badge-primary">{badge}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </div>
            <h4 style={{ marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>{title}</h4>
            <p className="text-sm text-muted">{description}</p>
        </div>
    </Link>
);

export default Home;
