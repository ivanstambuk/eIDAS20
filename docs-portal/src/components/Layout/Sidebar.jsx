import { NavLink } from 'react-router-dom';

const navigation = [
    {
        title: 'Overview',
        items: [
            { name: 'Home', path: '/', icon: 'home' },
            { name: 'Quick Start', path: '/quickstart', icon: 'zap' },
        ]
    },
    {
        title: 'Regulations',
        items: [
            { name: 'eIDAS Regulation', path: '/regulation/910-2014', icon: 'file-text' },
            { name: 'Amending Regulation', path: '/regulation/2024-1183', icon: 'file-plus' },
            { name: 'Implementing Acts', path: '/implementing-acts', icon: 'layers' },
        ]
    },
    {
        title: 'Reference',
        items: [
            { name: 'Terminology', path: '/terminology', icon: 'book' },
            { name: 'By Role', path: '/by-role', icon: 'users' },
            { name: 'Cross-References', path: '/cross-references', icon: 'link' },
        ]
    },
    {
        title: 'Tools',
        items: [
            { name: 'AI Assistant', path: '/ai-chat', icon: 'message-circle' },
            { name: 'Export', path: '/export', icon: 'download' },
        ]
    }
];

const icons = {
    home: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
    ),
    zap: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
        </svg>
    ),
    'file-text': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    ),
    'file-plus': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
    ),
    layers: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polygon points="12,2 2,7 12,12 22,7" />
            <polyline points="2,17 12,22 22,17" />
            <polyline points="2,12 12,17 22,12" />
        </svg>
    ),
    book: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    ),
    users: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    link: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    ),
    'message-circle': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
    ),
    download: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    ),
};

const Sidebar = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={onClose}
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 199,
                        display: 'none', // Will be shown via media query
                    }}
                />
            )}

            <aside
                className={`sidebar ${isOpen ? 'open' : ''}`}
                role="navigation"
                aria-label="Main navigation"
            >
                {navigation.map((section) => (
                    <div key={section.title} className="sidebar-section" role="group" aria-labelledby={`nav-${section.title.toLowerCase()}`}>
                        <span id={`nav-${section.title.toLowerCase()}`} className="sidebar-section-title">{section.title}</span>
                        <ul className="sidebar-nav" role="list">
                            {section.items.map((item) => (
                                <li key={item.path} className="sidebar-nav-item">
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `sidebar-nav-link ${isActive ? 'active' : ''}`
                                        }
                                        onClick={onClose}
                                        aria-current={({ isActive }) => isActive ? 'page' : undefined}
                                    >
                                        {icons[item.icon]}
                                        <span>{item.name}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Status indicator */}
                <div className="sidebar-section" style={{ marginTop: 'auto' }}>
                    <div
                        className="card"
                        style={{
                            padding: 'var(--space-3)',
                            fontSize: 'var(--text-xs)',
                            background: 'var(--bg-tertiary)'
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: 'var(--accent-secondary)'
                                }}
                            />
                            <span className="font-medium">32 Documents Loaded</span>
                        </div>
                        <p className="text-muted">
                            Last updated: Jan 2026
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
