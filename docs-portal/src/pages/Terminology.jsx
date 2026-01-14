const Terminology = () => {
    // TODO: Load from pre-generated terminology.json
    const terms = [
        {
            id: 'electronic-identification',
            term: 'electronic identification',
            definition: 'the process of using person identification data in electronic form uniquely representing either a natural or legal person, or a natural person representing another natural person or a legal person',
            source: 'Article 3(1)',
            regulation: '910/2014'
        },
        {
            id: 'electronic-identification-means',
            term: 'electronic identification means',
            definition: 'a material and/or immaterial unit containing person identification data and which is used for authentication for an online service or, where appropriate, for an offline service',
            source: 'Article 3(2)',
            regulation: '910/2014'
        },
        {
            id: 'european-digital-identity-wallet',
            term: 'European Digital Identity Wallet',
            definition: 'an electronic identification means which allows the user to securely store, manage and validate person identification data and electronic attestations of attributes for the purpose of providing them to relying parties and other users of European Digital Identity Wallets, and to sign by means of qualified electronic signatures or to seal by means of qualified electronic seals',
            source: 'Article 3(42)',
            regulation: '910/2014'
        },
        {
            id: 'relying-party',
            term: 'relying party',
            definition: 'a natural or legal person that relies upon electronic identification, European Digital Identity Wallets or other electronic identification means, or upon a trust service',
            source: 'Article 3(6)',
            regulation: '910/2014'
        },
        {
            id: 'trust-service',
            term: 'trust service',
            definition: 'an electronic service normally provided for remuneration which consists of any of the following: the issuance of certificates, validation of certificates, creation of electronic signatures or seals, validation of electronic signatures or seals, preservation, management of remote devices, issuance of electronic attestations of attributes, validation of attestations, creation/validation of timestamps, provision of registered delivery services, electronic archiving, recording in electronic ledgers',
            source: 'Article 3(16)',
            regulation: '910/2014'
        },
        {
            id: 'qualified-trust-service',
            term: 'qualified trust service',
            definition: 'a trust service that meets the applicable requirements laid down in this Regulation',
            source: 'Article 3(17)',
            regulation: '910/2014'
        },
        {
            id: 'qualified-trust-service-provider',
            term: 'qualified trust service provider',
            definition: 'a trust service provider who provides one or more qualified trust services and is granted the qualified status by the supervisory body',
            source: 'Article 3(20)',
            regulation: '910/2014'
        },
        {
            id: 'electronic-attestation-of-attributes',
            term: 'electronic attestation of attributes',
            definition: 'an attestation in electronic form that allows attributes to be authenticated',
            source: 'Article 3(44)',
            regulation: '910/2014'
        },
    ];

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    return (
        <div className="animate-fadeIn">
            <header style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ marginBottom: 'var(--space-3)' }}>Terminology</h1>
                <p className="text-lg text-muted">
                    Legal definitions from Article 3 of Regulation (EU) No 910/2014
                </p>
            </header>

            {/* Alphabet quick nav */}
            <nav
                style={{
                    marginBottom: 'var(--space-6)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-1)'
                }}
            >
                {alphabet.map(letter => (
                    <a
                        key={letter}
                        href={`#letter-${letter}`}
                        className="btn btn-ghost"
                        style={{
                            padding: 'var(--space-1) var(--space-2)',
                            fontSize: 'var(--text-sm)',
                            minWidth: '32px'
                        }}
                    >
                        {letter}
                    </a>
                ))}
            </nav>

            {/* Search */}
            <div className="search-box" style={{ marginBottom: 'var(--space-8)', maxWidth: '400px' }}>
                <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    className="input"
                    placeholder="Search definitions..."
                />
            </div>

            {/* Terms list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {terms.map(term => (
                    <article
                        key={term.id}
                        id={`term-${term.id}`}
                        className="card"
                    >
                        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                            <h3 style={{ color: 'var(--accent-primary)', margin: 0 }}>
                                {term.term}
                            </h3>
                            <span className="badge badge-primary">{term.source}</span>
                        </div>
                        <p style={{ lineHeight: 1.7 }}>
                            {term.definition}
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                            <a
                                href={`/regulation/910-2014#article-3`}
                                className="text-sm text-link"
                            >
                                View in context →
                            </a>
                            <button
                                className="btn btn-ghost text-sm"
                                onClick={() => navigator.clipboard.writeText(term.definition)}
                            >
                                Copy definition
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            <p className="text-sm text-muted" style={{ marginTop: 'var(--space-8)' }}>
                Showing {terms.length} of 57 definitions.
                Full terminology will be loaded from pre-generated data.
            </p>
        </div>
    );
};

export default Terminology;
