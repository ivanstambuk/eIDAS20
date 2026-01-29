import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Section order: Overview → Tools → Regulations → Supplementary (DEC-224 revised)
// Supplementary Documents collapsed by default to reduce scroll
const navigation = [
    {
        title: 'Overview',
        id: 'overview',
        defaultExpanded: true,
        items: [
            { name: 'Home', path: '/', icon: 'home' },
            { name: 'Quick Start', path: '/quickstart', icon: 'zap' },
            { name: 'Terminology', path: '/terminology', icon: 'book' },
        ]
    },
    {
        title: 'Tools',
        id: 'tools',
        defaultExpanded: true,
        items: [
            { name: 'RCA', path: '/rca', icon: 'clipboard-check' },
            { name: 'VCQ', path: '/vcq', icon: 'clipboard-list' },
            { name: 'All Requirements', path: '/requirements', icon: 'layers' },
            // AI Assistant removed — accessible via floating chat button (DEC-287)
        ]
    },
    {
        title: 'Regulations',
        id: 'regulations',
        defaultExpanded: true,
        items: [
            { name: 'eIDAS 2.0 Regulation', path: '/regulation/2014-910', icon: 'file-text' },
            { name: 'Amending Regulation', path: '/regulation/2024-1183', icon: 'file-plus' },
            { name: 'Implementing Acts', path: '/implementing-acts', icon: 'layers' },
        ]
    },
    {
        title: 'Supplementary Documents',
        id: 'supplementary',
        // Dynamically populated from regulations-index.json
        // Includes 'referenced' (legal acts cited by eIDAS) and 'supplementary' (guidance resources)
        // See DEC-093 in DECISIONS.md for rationale
        isDynamic: true,
        defaultExpanded: false, // Collapsed by default to improve discoverability
        items: []
    },
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
    'external-link': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15,3 21,3 21,9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    ),
    'message-circle': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
    ),
    'clipboard-check': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="m9 14 2 2 4-4" />
        </svg>
    ),
    'clipboard-list': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="8" y1="16" x2="16" y2="16" />
        </svg>
    ),
    'chevron-down': (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="6,9 12,15 18,9" />
        </svg>
    ),
};

/**
 * ⚠️ CRITICAL: Do NOT hardcode document counts, dates, or statistics
 * 
 * Always fetch from build-time generated metadata.json. This ensures:
 * - Single source of truth (counts computed from actual documents)
 * - Build-time validation (3-tier checks prevent data corruption)
 * - Future-proof (new documents automatically update all stats)
 * 
 * See DEC-012 in DECISIONS.md for full rationale and architecture.
 */

const Sidebar = ({ isOpen, isCollapsed, onClose }) => {
    const [metadata, setMetadata] = useState(null);
    const [supplementaryDocs, setSupplementaryDocs] = useState([]);

    // Collapsible section state with localStorage persistence
    const [expandedSections, setExpandedSections] = useState(() => {
        // Try to load from localStorage first
        const saved = localStorage.getItem('sidebar-expanded-sections');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // Fall through to defaults
            }
        }
        // Initialize from navigation defaults
        return navigation.reduce((acc, section) => {
            acc[section.id] = section.defaultExpanded ?? true;
            return acc;
        }, {});
    });

    // Persist expanded state to localStorage
    useEffect(() => {
        localStorage.setItem('sidebar-expanded-sections', JSON.stringify(expandedSections));
    }, [expandedSections]);

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await fetch(`${import.meta.env.BASE_URL}data/metadata.json`);
                if (response.ok) {
                    const data = await response.json();
                    setMetadata(data);
                }
            } catch (error) {
                console.error('Failed to fetch metadata:', error);
            }
        };

        // Fetch supplementary documents dynamically from the index
        // Includes 'referenced' (legal acts) and 'supplementary' (guidance resources like EC FAQ)
        const fetchSupplementaryDocs = async () => {
            try {
                const response = await fetch(`${import.meta.env.BASE_URL}data/regulations-index.json`);
                if (response.ok) {
                    const data = await response.json();
                    // Filter for supplementary categories (DEC-093)
                    const supplementary = data
                        .filter(doc => doc.category === 'referenced' || doc.category === 'supplementary')
                        .map(doc => ({
                            name: doc.sidebarTitle || doc.shortTitle,  // Prefer sidebarTitle for cleaner nav
                            path: `/regulation/${doc.slug}`,
                            icon: 'external-link'
                        }));
                    setSupplementaryDocs(supplementary);
                }
            } catch (error) {
                console.error('Failed to fetch regulations index:', error);
            }
        };

        fetchMetadata();
        fetchSupplementaryDocs();
    }, []);

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
                className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                role="navigation"
                aria-label="Main navigation"
            >
                {navigation.map((section) => {
                    // Use dynamically fetched items for Supplementary Documents section
                    const items = section.isDynamic ? supplementaryDocs : section.items;
                    const isExpanded = expandedSections[section.id] ?? true;

                    // Don't render dynamic section until data is loaded
                    if (section.isDynamic && items.length === 0) {
                        return null;
                    }

                    return (
                        <div key={section.id} className="sidebar-section" role="group" aria-labelledby={`nav-${section.id}`}>
                            <button
                                id={`nav-${section.id}`}
                                className="sidebar-section-header"
                                onClick={() => toggleSection(section.id)}
                                aria-expanded={isExpanded}
                                aria-controls={`nav-items-${section.id}`}
                            >
                                <span className="sidebar-section-title">{section.title}</span>
                                <span className="sidebar-section-meta">
                                    {!isExpanded && <span className="sidebar-section-count">({items.length})</span>}
                                    <span className={`sidebar-chevron ${isExpanded ? 'expanded' : ''}`}>
                                        {icons['chevron-down']}
                                    </span>
                                </span>
                            </button>
                            {isExpanded && (
                                <ul id={`nav-items-${section.id}`} className="sidebar-nav" role="list">
                                    {items.map((item) => (
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
                            )}
                        </div>
                    );
                })}

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
                            <span className="font-medium">
                                {metadata ? `${metadata.documentCount} Documents Loaded` : 'Loading...'}
                            </span>
                        </div>
                        <p className="text-muted">
                            Last updated: {metadata ? metadata.buildDate : 'Loading...'}
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
