/**
 * useArticleExcerpts Hook
 * 
 * Provides article text excerpts for Legal Basis popovers.
 * Loads pre-extracted article text from article-excerpts.json.
 * 
 * Usage:
 *   const { getExcerpt, isLoading } = useArticleExcerpts();
 *   const excerpt = getExcerpt('2014-910', 'article-5b-para-5');
 *   // Returns: { title: "Article 5b(5)", excerpt: "Member States shall..." }
 * 
 * The regulation slug format supports both:
 *   - Dash format: "2014-910" (from slugs)
 *   - Slash format: "2014/910" (from YAML refs)
 */

import { useState, useEffect, useCallback } from 'react';

// Module-level cache to share data across hook instances
let cachedExcerpts = null;
let loadingPromise = null;

export function useArticleExcerpts() {
    const [excerpts, setExcerpts] = useState(cachedExcerpts || {});
    const [isLoading, setIsLoading] = useState(!cachedExcerpts);

    useEffect(() => {
        // If already cached, use it
        if (cachedExcerpts) {
            setExcerpts(cachedExcerpts);
            setIsLoading(false);
            return;
        }

        // If already loading, wait for that promise
        if (loadingPromise) {
            loadingPromise.then(data => {
                setExcerpts(data);
                setIsLoading(false);
            });
            return;
        }

        // Start loading
        loadingPromise = fetch(`${import.meta.env.BASE_URL}data/article-excerpts.json`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load article excerpts');
                return res.json();
            })
            .then(data => {
                cachedExcerpts = data;
                setExcerpts(data);
                setIsLoading(false);
                return data;
            })
            .catch(err => {
                console.error('Error loading article excerpts:', err);
                setIsLoading(false);
                return {};
            });
    }, []);

    /**
     * Get excerpt for a specific regulation section.
     * 
     * @param {string} regId - Regulation ID (e.g., "2014-910" or "2014/910")
     * @param {string} sectionId - Section ID (e.g., "article-5b-para-5")
     * @returns {{ title: string, excerpt: string } | null}
     */
    const getExcerpt = useCallback((regId, sectionId) => {
        if (!regId || !sectionId || !excerpts) return null;

        // Normalize regulation ID: "2014/910" → "2014-910"
        const slug = regId.replace('/', '-');

        // Also handle leading zeros: "2025/848" → "2025-0848"
        const slugWithZeros = slug.replace(/-(\d{1,3})$/, (_, num) =>
            `-${num.padStart(4, '0')}`
        );

        // Try both formats
        const regExcerpts = excerpts[slug] || excerpts[slugWithZeros];
        if (!regExcerpts) return null;

        // Normalize section ID to lowercase
        const normalizedSectionId = sectionId.toLowerCase();

        return regExcerpts[normalizedSectionId] || null;
    }, [excerpts]);

    return { getExcerpt, isLoading, excerpts };
}

export default useArticleExcerpts;
