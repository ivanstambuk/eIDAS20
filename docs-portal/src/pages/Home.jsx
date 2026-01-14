import { Link } from 'react-router-dom';

const Home = () => {
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
                    <Link to="/regulation/910-2014" className="btn btn-primary">
                        Read the Regulation
                    </Link>
                    <Link to="/terminology" className="btn btn-secondary">
                        Terminology
                    </Link>
                </div>
            </section>

            {/* Stats Cards */}
            <section style={{ marginBottom: 'var(--space-12)' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--space-4)'
                }}>
                    <StatCard
                        label="Regulations"
                        value="2"
                        description="Core + Amending"
                        accent="var(--accent-primary)"
                    />
                    <StatCard
                        label="Implementing Acts"
                        value="30"
                        description="Commission Acts"
                        accent="var(--accent-secondary)"
                    />
                    <StatCard
                        label="Definitions"
                        value="57"
                        description="Legal Terms"
                        accent="var(--accent-warning)"
                    />
                    <StatCard
                        label="Articles"
                        value="50+"
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
                        path="/regulation/910-2014#article-5a"
                        badge="Core"
                    />
                    <QuickLinkCard
                        title="Qualified Trust Services"
                        description="Chapter III - Requirements for QTSPs"
                        path="/regulation/910-2014#chapter-iii"
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
                        path="/regulation/910-2014#article-45d"
                        badge="Attestations"
                    />
                </div>
            </section>

            {/* Role-Based Navigation */}
            <section style={{ marginTop: 'var(--space-12)' }}>
                <h2 style={{ marginBottom: 'var(--space-4)' }}>Browse by Role</h2>
                <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
                    Find relevant provisions for your specific role in the eIDAS ecosystem.
                </p>
                <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
                    <RoleBadge role="Relying Party" count={12} />
                    <RoleBadge role="Wallet Provider" count={18} />
                    <RoleBadge role="QTSP" count={24} />
                    <RoleBadge role="Conformity Assessment Body" count={8} />
                    <RoleBadge role="Member State Authority" count={15} />
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

const RoleBadge = ({ role, count }) => (
    <Link
        to={`/by-role?role=${encodeURIComponent(role)}`}
        className="btn btn-secondary"
        style={{ gap: 'var(--space-2)' }}
    >
        <span>{role}</span>
        <span
            style={{
                background: 'var(--accent-primary-dim)',
                color: 'var(--accent-primary)',
                padding: '2px 8px',
                borderRadius: 'var(--border-radius-full)',
                fontSize: 'var(--text-xs)'
            }}
        >
            {count}
        </span>
    </Link>
);

export default Home;
