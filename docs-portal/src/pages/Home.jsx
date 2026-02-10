import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { buildDocumentLink } from '../utils/linkBuilder';

const Home = () => {
    const [stats, setStats] = useState(null);
    const [rcaStats, setRcaStats] = useState(null);
    const [vcqStats, setVcqStats] = useState(null);

    useEffect(() => {
        // Fetch build-time computed stats from metadata.json
        fetch(`${import.meta.env.BASE_URL}data/metadata.json`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Failed to load metadata:', err));

        // Fetch RCA stats for requirements count
        fetch(`${import.meta.env.BASE_URL}data/rca-data.json`)
            .then(res => res.json())
            .then(data => setRcaStats(data.stats))
            .catch(err => console.error('Failed to load RCA data:', err));

        // Fetch VCQ stats for requirements count
        fetch(`${import.meta.env.BASE_URL}data/vcq-data.json`)
            .then(res => res.json())
            .then(data => setVcqStats(data.stats))
            .catch(err => console.error('Failed to load VCQ data:', err));
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
                        path={buildDocumentLink('2014-910', { section: 'article-5a' })}
                        badge="Core"
                    />
                    <QuickLinkCard
                        title="Qualified Trust Services"
                        description="Chapter III - Requirements for QTSPs"
                        path={buildDocumentLink('2014-910', { section: 'chapter-iii' })}
                        badge="Trust Services"
                    />
                    <QuickLinkCard
                        title="Relying Party Registration"
                        description="2025/0848 - Registration requirements for RPs"
                        path={buildDocumentLink('2025-0848', { type: 'implementing-act' })}
                        badge="Implementing Act"
                    />
                    <QuickLinkCard
                        title="Electronic Attestations"
                        description="Articles 45d-45g - Attestation of Attributes"
                        path={buildDocumentLink('2014-910', { section: 'article-45d' })}
                        badge="Attestations"
                    />
                </div>
            </section>

            {/* Compliance Tools */}
            <section style={{ marginTop: 'var(--space-12)' }}>
                <h2 style={{ marginBottom: 'var(--space-4)' }}>Compliance Tools</h2>
                <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
                    Assess regulatory requirements for your specific role in the eIDAS ecosystem.
                </p>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 'var(--space-4)'
                }}>
                    <ToolCard
                        title="Regulatory Compliance Assessment"
                        description="Map requirements to your role — issuer, relying party, or trust service provider"
                        path="/rca"
                        count={rcaStats?.totalRequirements}
                        countLabel="requirements"
                        icon={
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="M9 12l2 2 4-4" />
                            </svg>
                        }
                        accent="var(--accent-primary)"
                    />
                    <ToolCard
                        title="Vendor Compliance Questionnaire"
                        description="Generate compliance checklists for wallet solution vendors and integrators"
                        path="/vcq"
                        count={vcqStats?.totalRequirements}
                        countLabel="requirements"
                        icon={
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="1.5">
                                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                                <rect x="9" y="3" width="6" height="4" rx="1" />
                                <path d="M9 12h6" />
                                <path d="M9 16h6" />
                            </svg>
                        }
                        accent="var(--accent-secondary)"
                    />
                </div>
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

const ToolCard = ({ title, description, path, count, countLabel, icon, accent }) => (
    <Link to={path} style={{ textDecoration: 'none' }}>
        <div
            className="card card-glow"
            style={{
                height: '100%',
                transition: 'all var(--transition-base)',
                borderLeft: `3px solid ${accent}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)'
            }}
        >
            <div className="flex items-center justify-between">
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--border-radius-lg)',
                    background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon}
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </div>
            <div>
                <h4 style={{ marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>{title}</h4>
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-3)' }}>{description}</p>
            </div>
            <div style={{ marginTop: 'auto' }}>
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-1)',
                        padding: '4px 12px',
                        borderRadius: 'var(--border-radius-full)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-semibold)',
                        background: `color-mix(in srgb, ${accent} 15%, transparent)`,
                        color: accent
                    }}
                >
                    {count ?? '—'} {countLabel}
                </span>
            </div>
        </div>
    </Link>
);

export default Home;
