import { Link } from 'react-router-dom';

const ImplementingActs = () => {
    // TODO: Load from pre-generated content.json
    const acts = [
        {
            id: '2024-2977',
            celex: '32024R2977',
            title: 'Person Identification Data and Electronic Attestations of Attributes',
            shortTitle: 'PID and EAA',
            date: '2024-12-04',
            category: 'wallet',
            status: 'in-force'
        },
        {
            id: '2024-2978',
            celex: '32024R2978',
            title: 'Trusted Service Provider List Publication',
            shortTitle: 'TSP List Publication',
            date: '2024-12-04',
            category: 'trust-services',
            status: 'in-force'
        },
        {
            id: '2024-2979',
            celex: '32024R2979',
            title: 'Integrity of Core Functions of European Digital Identity Wallets',
            shortTitle: 'Integrity Core Functions',
            date: '2024-12-04',
            category: 'wallet',
            status: 'in-force'
        },
        {
            id: '2024-2980',
            celex: '32024R2980',
            title: 'Notifications Regarding Electronic Identification Schemes',
            shortTitle: 'Notifications',
            date: '2024-12-04',
            category: 'eid',
            status: 'in-force'
        },
        {
            id: '2024-2981',
            celex: '32024R2981',
            title: 'Certification of European Digital Identity Wallets',
            shortTitle: 'Certification',
            date: '2024-12-04',
            category: 'wallet',
            status: 'in-force'
        },
        {
            id: '2024-2982',
            celex: '32024R2982',
            title: 'Protocols and Interfaces for European Digital Identity Wallets',
            shortTitle: 'Protocols Interfaces',
            date: '2024-12-04',
            category: 'wallet',
            status: 'in-force'
        },
        {
            id: '2025-0848',
            celex: '32025R0848',
            title: 'Relying Party Registration',
            shortTitle: 'RP Registration',
            date: '2025-01-15',
            category: 'wallet',
            status: 'in-force'
        },
    ];

    const categories = [
        { id: 'all', label: 'All', count: 30 },
        { id: 'wallet', label: 'Wallet', count: 12 },
        { id: 'trust-services', label: 'Trust Services', count: 10 },
        { id: 'eid', label: 'eID Schemes', count: 8 },
    ];

    return (
        <div className="animate-fadeIn">
            <header style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ marginBottom: 'var(--space-3)' }}>Implementing Acts</h1>
                <p className="text-lg text-muted">
                    Commission Implementing Regulations under eIDAS 2.0
                </p>
            </header>

            {/* Category filters */}
            <div className="flex gap-2" style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`btn ${cat.id === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        {cat.label}
                        <span style={{
                            opacity: 0.7,
                            marginLeft: 'var(--space-2)'
                        }}>
                            {cat.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Acts list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {acts.map(act => (
                    <Link
                        key={act.id}
                        to={`/implementing-acts/${act.id}`}
                        style={{ textDecoration: 'none' }}
                    >
                        <article className="card" style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            alignItems: 'center',
                            gap: 'var(--space-4)'
                        }}>
                            <div>
                                <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-2)' }}>
                                    <span
                                        className="badge"
                                        style={{
                                            background: act.category === 'wallet' ? 'var(--accent-primary-dim)' :
                                                act.category === 'trust-services' ? 'var(--accent-secondary-dim)' :
                                                    'var(--accent-warning-dim)',
                                            color: act.category === 'wallet' ? 'var(--accent-primary)' :
                                                act.category === 'trust-services' ? 'var(--accent-secondary)' :
                                                    'var(--accent-warning)',
                                            border: 'none'
                                        }}
                                    >
                                        {act.category.replace('-', ' ')}
                                    </span>
                                    <span className="text-sm text-muted">{act.celex}</span>
                                </div>
                                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                                    {act.shortTitle}
                                </h3>
                                <p className="text-sm text-muted" style={{ marginTop: 'var(--space-1)' }}>
                                    {act.title}
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
                            </div>
                        </article>
                    </Link>
                ))}
            </div>

            <p className="text-sm text-muted" style={{ marginTop: 'var(--space-8)' }}>
                Showing {acts.length} of 30 implementing acts.
            </p>
        </div>
    );
};

export default ImplementingActs;
