import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useSearchParams, useNavigationType } from 'react-router-dom';
import CollapsibleTOC from '../components/CollapsibleTOC';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useCitations, generateReferencesHtml } from '../hooks/useCitations';
import { useCopyReference, generateEUReference, generateDeepLink } from '../hooks/useCopyReference';
import { generatePopoverContent } from '../utils/citationPopoverTemplate';
import '../components/CitationPopover/CitationPopover.css';
import '../components/CopyReference/CopyReference.css';

/**
 * Calculate estimated reading time for legal/regulatory text.
 * Uses 150 WPM (slower than standard 265 WPM due to legal complexity).
 * @param {number} wordCount - Total word count
 * @returns {string} - Formatted time (e.g., "45 min read" or "~2h 45m read")
 */
function calculateReadingTime(wordCount) {
    if (!wordCount || wordCount <= 0) return null;

    const WPM = 150; // Legal text reading speed
    const totalMinutes = Math.ceil(wordCount / WPM);

    if (totalMinutes < 60) {
        return `${totalMinutes} min read`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes === 0) {
        return `~${hours}h read`;
    }

    return `~${hours}h ${minutes}m read`;
}

/**
 * Scroll to element with header offset (same logic as CollapsibleTOC)
 */
function scrollToSection(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const headerOffset = 64 + 16; // header height + padding
    const targetPosition = element.getBoundingClientRect().top + window.scrollY - headerOffset;

    // Use instant scroll for initial page load (no animation needed)
    window.scrollTo(0, targetPosition);
    element.focus({ preventScroll: true });
}

const RegulationViewer = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [regulation, setRegulation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Citation system
    const { citations } = useCitations(id);
    const isMobile = useIsMobile();

    // ⚠️ Navigation Type Detection Pattern (same as Terminology.jsx)
    // Uses React Router's useNavigationType() hook to distinguish between:
    //   - 'POP':     Back/forward button navigation → Restore scroll position
    //   - 'PUSH':    Link click navigation         → Start at top (or deep link)
    //   - 'REPLACE': Replace navigation            → Start at top
    const navigationType = useNavigationType();
    const isBackForward = navigationType === 'POP';

    // Generate sessionStorage key based on document ID to avoid cross-document conflicts
    const scrollStorageKey = `regulationScrollY_${id}`;

    // Scroll restoration: restore scroll position when returning via back/forward button
    // This effect runs AFTER the deep-linking effect, so deep links take precedence
    useEffect(() => {
        if (!loading && regulation) {
            const section = searchParams.get('section');
            // Only restore if no deep link AND navigating via back/forward
            if (!section && isBackForward) {
                const savedScrollY = sessionStorage.getItem(scrollStorageKey);
                if (savedScrollY) {
                    const scrollY = parseInt(savedScrollY, 10);
                    
                    // Wait for DOM to have enough height before scrolling
                    // This handles the timing issue where content isn't rendered yet
                    let attempts = 0;
                    const maxAttempts = 10;
                    const checkAndScroll = () => {
                        attempts++;
                        const canScroll = document.documentElement.scrollHeight > scrollY + window.innerHeight;
                        
                        if (canScroll) {
                            window.scrollTo(0, scrollY);
                            sessionStorage.removeItem(scrollStorageKey);
                        } else if (attempts < maxAttempts) {
                            // Content not tall enough yet, retry after a frame
                            requestAnimationFrame(checkAndScroll);
                        } else {
                            // Give up after max attempts, but still clean up storage
                            sessionStorage.removeItem(scrollStorageKey);
                        }
                    };
                    
                    // Start the polling after initial paint
                    requestAnimationFrame(() => {
                        requestAnimationFrame(checkAndScroll);
                    });
                }
            } else if (!isBackForward) {
                // Manual navigation (not back/forward), clear saved position
                sessionStorage.removeItem(scrollStorageKey);
            }
        }
    }, [loading, regulation, isBackForward, searchParams, scrollStorageKey]);

    // Save scroll position when clicking popover internal links
    // This is wired up in the popover click handler below (useCallback for stable reference)
    const saveScrollPosition = useCallback(() => {
        sessionStorage.setItem(scrollStorageKey, window.scrollY.toString());
    }, [scrollStorageKey]);

    // ⚠️ IMPORTANT: This is the ACTUAL citation popover implementation.
    // The CitationPopover.jsx React component exists but is NOT used here.
    // Popovers are created via imperative DOM manipulation because:
    // 1. Citation triggers are generated at build-time as static HTML spans
    // 2. We hydrate them with event listeners after React renders the content
    // 3. Popovers are appended to document.body for proper positioning
    //
    // To modify popover appearance: Edit the template string in showPopover() below
    // To modify popover styling: Edit CitationPopover.css
    // DEC-059: Enhanced with abbreviation badges, status indicators, temporal context
    useEffect(() => {
        // Skip on mobile - popovers don't work well with touch
        if (isMobile || !regulation) return;

        const contentEl = document.querySelector('.regulation-content');
        if (!contentEl) return;

        let activePopover = null;
        let hideTimeout = null;

        const showPopover = (triggerEl) => {
            // Parse data attributes from the span (format from build-time transformation)
            const idx = triggerEl.dataset.idx;

            // Find the full citation from loaded data (includes provision info from build-citations.js)
            const citation = citations.find(c => c.index === parseInt(idx, 10));
            if (!citation) return;

            // Generate popover content using extracted template utility
            // DEC-059: Hybrid B+C design, DEC-060: Smart Consolidation variant
            const { className, html } = generatePopoverContent(citation);

            const popover = document.createElement('div');
            popover.className = className;
            popover.innerHTML = html;

            // Position below trigger, centered
            const rect = triggerEl.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let top = rect.bottom + 8;
            let left = rect.left + (rect.width / 2);

            // Adjust for viewport edges
            if (left + 200 > viewportWidth) left = viewportWidth - 220;
            if (left < 20) left = 20;
            if (top + 200 > viewportHeight) top = rect.top - 8;

            popover.style.top = `${top}px`;
            popover.style.left = `${left}px`;

            document.body.appendChild(popover);
            activePopover = popover;

            // Keep popover alive when hovering over it
            popover.addEventListener('mouseenter', () => {
                if (hideTimeout) clearTimeout(hideTimeout);
            });
            popover.addEventListener('mouseleave', hidePopover);

            // Save scroll position when clicking internal popover links (provision deep links)
            // This enables scroll restoration when pressing browser back button
            popover.addEventListener('click', (e) => {
                const link = e.target.closest('a.citation-popover-link--primary');
                if (link && link.href.includes('#/')) {
                    // Internal portal link - save scroll position for back-navigation
                    saveScrollPosition();
                }
            });
        };

        const hidePopover = () => {
            hideTimeout = setTimeout(() => {
                if (activePopover) {
                    activePopover.remove();
                    activePopover = null;
                }
            }, 150);
        };

        const handleMouseEnter = (e) => {
            const trigger = e.target.closest('.citation-ref');
            if (!trigger) return;

            if (hideTimeout) clearTimeout(hideTimeout);

            // Remove any existing popover
            if (activePopover) {
                activePopover.remove();
                activePopover = null;
            }

            showPopover(trigger);
        };

        const handleMouseLeave = (e) => {
            const trigger = e.target.closest('.citation-ref');
            if (!trigger) return;
            hidePopover();
        };

        contentEl.addEventListener('mouseenter', handleMouseEnter, true);
        contentEl.addEventListener('mouseleave', handleMouseLeave, true);

        return () => {
            contentEl.removeEventListener('mouseenter', handleMouseEnter, true);
            contentEl.removeEventListener('mouseleave', handleMouseLeave, true);
            if (activePopover) activePopover.remove();
            if (hideTimeout) clearTimeout(hideTimeout);
        };
    }, [regulation, citations, isMobile, saveScrollPosition, scrollStorageKey]);

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

    // Deep linking: scroll to section when content loads or section param changes
    useEffect(() => {
        if (!loading && regulation) {
            const section = searchParams.get('section');
            if (section) {
                // Small delay to ensure DOM is fully rendered
                requestAnimationFrame(() => {
                    scrollToSection(section);
                });
            }
        }
    }, [loading, regulation, searchParams]);

    // Copy Reference Gutter Icons: Hydrate headings with copy buttons (DEC-011)
    useEffect(() => {
        if (!regulation || loading) return;

        const contentEl = document.querySelector('.regulation-content');
        if (!contentEl) return;

        // Find all elements with IDs that should have gutter icons:
        // - Headings (h2, h3): articles, chapters, sections
        // - Linkable paragraphs (li.linkable-paragraph): numbered paragraphs
        // - Linkable points (li.linkable-point): lettered points (a), (b), etc.
        const headings = contentEl.querySelectorAll('h2[id], h3[id]');
        const paragraphs = contentEl.querySelectorAll('li.linkable-paragraph[id]');
        const points = contentEl.querySelectorAll('li.linkable-point[id]');

        // Helper function to create gutter icons for an element
        const addGutter = (element, elementId, labelText) => {
            // Skip if already hydrated
            if (element.querySelector('.copy-gutter')) return;

            // Create gutter container
            const gutter = document.createElement('span');
            gutter.className = 'copy-gutter';
            gutter.innerHTML = `
                <button class="copy-gutter-btn" data-action="link" data-id="${elementId}" data-tooltip="Copy Link" aria-label="Copy link to ${labelText}">
                    🔗
                </button>
                <button class="copy-gutter-btn" data-action="ref" data-id="${elementId}" data-tooltip="Copy EU Reference" aria-label="Copy EU reference for ${labelText}">
                    📜
                </button>
            `;

            // Insert at the beginning of the element
            element.insertBefore(gutter, element.firstChild);
        };

        // Create gutter icons for each heading
        headings.forEach(heading => {
            addGutter(heading, heading.id, heading.textContent);
        });

        // Create gutter icons for paragraphs (Phase 2)
        paragraphs.forEach(para => {
            const paraNum = para.dataset.para || '';
            addGutter(para, para.id, `paragraph ${paraNum}`);
        });

        // Create gutter icons for points (Phase 2)
        points.forEach(point => {
            const pointLetter = point.dataset.point || '';
            addGutter(point, point.id, `point (${pointLetter})`);
        });

        // Create gutter icons for subpoints (Phase 3: roman numerals)
        const subpoints = contentEl.querySelectorAll('li.linkable-subpoint[id]');
        subpoints.forEach(subpoint => {
            const romanNumeral = subpoint.dataset.subpoint || '';
            addGutter(subpoint, subpoint.id, `point (${romanNumeral})`);
        });

        // Create gutter icons for recitals (Phase 4: preamble recitals)
        const recitals = contentEl.querySelectorAll('li.linkable-recital[id]');
        recitals.forEach(recital => {
            const recitalNum = recital.dataset.recital || '';
            addGutter(recital, recital.id, `recital (${recitalNum})`);
        });

        // Event delegation for gutter button clicks
        const handleClick = async (e) => {
            const btn = e.target.closest('.copy-gutter-btn');
            if (!btn) return;

            const action = btn.dataset.action;
            const headingId = btn.dataset.id;

            let textToCopy;
            if (action === 'link') {
                textToCopy = generateDeepLink(headingId, regulation.slug);
            } else if (action === 'ref') {
                textToCopy = generateEUReference(headingId, regulation);
            }

            if (textToCopy) {
                try {
                    await navigator.clipboard.writeText(textToCopy);

                    // Visual feedback
                    btn.classList.add('copied');
                    const originalText = btn.textContent;
                    btn.textContent = '✓';

                    setTimeout(() => {
                        btn.classList.remove('copied');
                        btn.textContent = originalText;
                    }, 1500);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            }
        };

        contentEl.addEventListener('click', handleClick);

        return () => {
            contentEl.removeEventListener('click', handleClick);
            // Clean up gutter elements on unmount
            contentEl.querySelectorAll('.copy-gutter').forEach(g => g.remove());
        };
    }, [regulation, loading]);

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
                    {regulation.wordCount && (
                        <span>⏱️ {calculateReadingTime(regulation.wordCount)}</span>
                    )}
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
                    >
                        {/* Main content - citations already in HTML from build-content.js (DEC-064: provision data comes from citations JSON) */}
                        <div dangerouslySetInnerHTML={{ __html: regulation.contentHtml }} />

                        {/* References section (shown on mobile, also for accessibility) */}
                        {citations.length > 0 && (
                            <div dangerouslySetInnerHTML={{ __html: generateReferencesHtml(citations) }} />
                        )}
                    </article>
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
