/**
 * CollapsibleTOC - Table of Contents with expandable chapters
 * 
 * For main regulations (eIDAS 910/2014): Groups articles into official chapters
 * For implementing acts: Shows flat list (they're typically short)
 * 
 * Uses fast 150ms scroll animation with header offset.
 */
import { useState, useCallback } from 'react';

// Official eIDAS 910/2014 chapter structure (consolidated version)
// Source: EUR-Lex CELEX:32014R0910
const EIDAS_CHAPTERS = {
    '910-2014': [
        {
            id: 'chapter-1',
            title: 'I. General Provisions',
            articles: ['article-1', 'article-2', 'article-3', 'article-4', 'article-5',
                'article-5a', 'article-5b', 'article-5c', 'article-5d', 'article-5e', 'article-5f']
        },
        {
            id: 'chapter-2',
            title: 'II. Electronic Identification',
            articles: ['article-6', 'article-7', 'article-8', 'article-9', 'article-10',
                'article-11', 'article-11a', 'article-12', 'article-12a', 'article-12b']
        },
        {
            id: 'chapter-3',
            title: 'III. Trust Services',
            // Section 1: General provisions
            // Section 2: Supervision
            // Section 3: Qualified trust services
            // Section 4: Electronic signatures
            // Section 5: Electronic seals
            // Section 6: Electronic time stamps
            // Section 7: Electronic registered delivery
            // Section 8: Website authentication
            articles: ['article-13', 'article-14', 'article-15', 'article-16', 'article-17', 'article-17a',
                'article-18', 'article-19', 'article-19a', 'article-20', 'article-20a', 'article-21',
                'article-22', 'article-23', 'article-24', 'article-24a', 'article-24b', 'article-24c',
                'article-25', 'article-26', 'article-27', 'article-28', 'article-29', 'article-29a',
                'article-30', 'article-31', 'article-32', 'article-33', 'article-34', 'article-35',
                'article-36', 'article-37', 'article-38', 'article-39', 'article-40', 'article-41',
                'article-42', 'article-43', 'article-44', 'article-45', 'article-45a', 'article-45b',
                'article-45c', 'article-45d', 'article-45e', 'article-45f', 'article-45g']
        },
        {
            id: 'chapter-4',
            title: 'IV. Electronic Documents',
            articles: ['article-46', 'article-46a', 'article-46b', 'article-46c', 'article-46d', 'article-46e']
        },
        {
            id: 'chapter-5',
            title: 'V. Delegation & Implementation',
            articles: ['article-47', 'article-48', 'article-48a', 'article-48b', 'article-49']
        },
        {
            id: 'chapter-6',
            title: 'VI. Final Provisions',
            articles: ['article-50', 'article-51', 'article-52', 'article-53', 'article-54', 'article-55']
        }
    ],
    // Regulation 765/2008 (Accreditation and Market Surveillance) - Consolidated
    // Note: Chapter III (Articles 15-29) was repealed by Regulation 2019/1020
    '765-2008': [
        {
            id: 'i-general-provisions',
            title: 'I. General Provisions',
            articles: ['article-1', 'article-2']
        },
        {
            id: 'ii-accreditation',
            title: 'II. Accreditation',
            articles: ['article-3', 'article-4', 'article-5', 'article-6', 'article-7',
                'article-8', 'article-9', 'article-10', 'article-11', 'article-12',
                'article-13', 'article-14']
        },
        // Chapter III (Articles 15-29) REPEALED - removed per DEC-045
        {
            id: 'iv-ce-marking',
            title: 'IV. CE Marking',
            articles: ['article-30']
        },
        {
            id: 'v-community-financing',
            title: 'V. Community Financing',
            articles: ['article-31', 'article-32', 'article-33', 'article-34', 'article-35',
                'article-36', 'article-37', 'article-38', 'article-39']
        },
        {
            id: 'vi-final-provisions',
            title: 'VI. Final Provisions',
            articles: ['article-40', 'article-41', 'article-42', 'article-43', 'article-44']
        }
    ]
};

/**
 * Fast smooth scroll with header offset (150ms)
 * Also updates URL with ?section= query param for deep linking
 */
function scrollToElement(elementId, updateUrl = true) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const headerOffset = 64 + 16; // header height + padding
    const targetPosition = element.getBoundingClientRect().top + window.scrollY - headerOffset;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 150;
    let startTime = null;

    const animation = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        window.scrollTo(0, startPosition + distance * easeOut);
        if (progress < 1) requestAnimationFrame(animation);
    };
    requestAnimationFrame(animation);

    // Update URL with section param for deep linking (without page reload)
    // For HashRouter: params must be INSIDE the hash, e.g., #/route?section=id
    if (updateUrl) {
        const hash = window.location.hash || '#/';
        // Parse the hash as if it were a URL path
        const hashPath = hash.slice(1); // Remove leading #
        const [pathPart, existingParams] = hashPath.split('?');
        const params = new URLSearchParams(existingParams || '');
        params.set('section', elementId);
        const newHash = `#${pathPart}?${params.toString()}`;
        window.history.replaceState(null, '', `${window.location.pathname}${newHash}`);
    }

    // Accessibility focus
    element.focus({ preventScroll: true });
}

/**
 * Single TOC item (article link)
 */
function TOCItem({ item, isNested = false }) {
    return (
        <li style={{ marginBottom: 'var(--space-1)' }}>
            <button
                className="toc-link"
                onClick={() => scrollToElement(item.id)}
                style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: 'var(--space-1) var(--space-2)',
                    paddingLeft: isNested ? 'var(--space-6)' : 'var(--space-2)',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                    borderRadius: 'var(--border-radius-sm)',
                    transition: 'all var(--transition-fast)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    cursor: 'pointer'
                }}
                title={item.title}
            >
                {item.title}
            </button>
        </li>
    );
}

/**
 * Collapsible chapter with nested articles
 */
function ChapterGroup({ chapter, articles, defaultExpanded = false }) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <li style={{ marginBottom: 'var(--space-2)' }}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: 'var(--space-2)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    borderRadius: 'var(--border-radius-sm)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                }}
                className="toc-chapter"
            >
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '16px',
                    height: '16px',
                    fontSize: '10px',
                    transition: 'transform var(--transition-fast)',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                }}>
                    ▶
                </span>
                <span style={{
                    flex: 1,
                    lineHeight: 1.3
                }}>
                    {chapter.title}
                </span>
                <span style={{
                    marginLeft: 'auto',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    flexShrink: 0
                }}>
                    {articles.length}
                </span>
            </button>

            {isExpanded && (
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    marginTop: 'var(--space-1)',
                    borderLeft: '2px solid var(--border-primary)',
                    marginLeft: 'var(--space-3)'
                }}>
                    {articles.map((item, idx) => (
                        <TOCItem key={`${item.id}-${idx}`} item={item} isNested />
                    ))}
                </ul>
            )}
        </li>
    );
}

/**
 * Main CollapsibleTOC component
 */
export default function CollapsibleTOC({ toc, slug, type }) {
    // Check if we have chapter definitions for this document
    const chapters = EIDAS_CHAPTERS[slug];

    // Create a map of article IDs to TOC items for quick lookup
    const tocMap = {};
    toc.forEach(item => {
        tocMap[item.id] = item;
    });

    // For documents with chapter structure
    if (chapters) {
        // Track which articles are in chapters
        const articlesInChapters = new Set();
        chapters.forEach(ch => ch.articles.forEach(a => articlesInChapters.add(a)));

        // Also track chapter titles to avoid duplicates
        // Chapter titles in TOC have IDs like "i-general-provisions" or match chapter titles
        const chapterTitleIds = new Set();
        chapters.forEach(ch => {
            chapterTitleIds.add(ch.id);
            // Also match by normalized title (e.g., "I. General Provisions" -> "i-general-provisions")
            const normalizedTitle = ch.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            chapterTitleIds.add(normalizedTitle);
        });

        // Separate orphan items into:
        // 1. Pre-content items (like "Preamble", "Recitals") - shown first
        // 2. Annex items (start with "annex") - shown in collapsible group
        // 3. Post-content items (like "Source Reference") - shown last
        const preContentItems = [];
        const annexItems = [];
        const postContentItems = [];

        // Items that belong at the end of the TOC (after chapters and annexes)
        const postContentPatterns = ['source-reference', 'references', 'bibliography'];

        toc.filter(item => !articlesInChapters.has(item.id) && item.level <= 2)
            .forEach(item => {
                const idLower = item.id.toLowerCase();

                // Skip chapter headings (they're rendered as collapsible groups)
                if (chapterTitleIds.has(idLower) || chapterTitleIds.has(item.id)) {
                    return;
                }

                if (idLower.includes('annex')) {
                    // Skip the "ANNEXES" header if it exists, we'll create our own group
                    if (idLower !== 'annexes') {
                        annexItems.push(item);
                    }
                } else if (postContentPatterns.some(p => idLower.includes(p))) {
                    postContentItems.push(item);
                } else {
                    preContentItems.push(item);
                }
            });

        // Create an Annexes chapter-like group if we have annexes
        const hasAnnexes = annexItems.length > 0;

        return (
            <nav>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {/* Pre-content items first (like "Preamble", "Recitals") */}
                    {preContentItems.map((item, idx) => (
                        <TOCItem key={`pre-${idx}`} item={item} />
                    ))}

                    {/* Chapters with nested articles */}
                    {chapters.map((chapter, idx) => {
                        // Get actual TOC items for this chapter's articles
                        const chapterArticles = chapter.articles
                            .map(articleId => tocMap[articleId])
                            .filter(Boolean);

                        if (chapterArticles.length === 0) return null;

                        return (
                            <ChapterGroup
                                key={chapter.id}
                                chapter={chapter}
                                articles={chapterArticles}
                                defaultExpanded={false}
                            />
                        );
                    })}

                    {/* Annexes in their own collapsible group */}
                    {hasAnnexes && (
                        <ChapterGroup
                            key="annexes-group"
                            chapter={{ title: 'Annexes', id: 'annexes-group' }}
                            articles={annexItems}
                            defaultExpanded={false}
                        />
                    )}

                    {/* Post-content items last (like "Source Reference") */}
                    {postContentItems.map((item, idx) => (
                        <TOCItem key={`post-${idx}`} item={item} />
                    ))}
                </ul>
            </nav>
        );
    }

    // For implementing acts and other documents: flat list (all items shown)
    // These are typically shorter (5-30 articles)
    return (
        <nav>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {toc.map((item, idx) => (
                    <TOCItem key={`${item.id}-${idx}`} item={item} />
                ))}
            </ul>
        </nav>
    );
}
