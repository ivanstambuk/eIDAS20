/**
 * Orama Search Hook
 * 
 * Provides full-text search across all eIDAS regulations
 * using a pre-built Orama index loaded at runtime.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { create, load, search } from '@orama/orama';

// Singleton for the search database
let searchDb = null;
let loadingPromise = null;

/**
 * Load the search index from the pre-built JSON file
 */
async function loadSearchIndex() {
    if (searchDb) return searchDb;

    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
        try {
            const response = await fetch(`${import.meta.env.BASE_URL}data/search-index.json`);
            if (!response.ok) {
                throw new Error(`Failed to load search index: ${response.status}`);
            }

            const serialized = await response.json();

            // Create a new Orama instance and restore from serialized data
            searchDb = await create({
                schema: {
                    id: 'string',
                    slug: 'string',
                    type: 'string',
                    term: 'string',        // For terminology definitions
                    docTitle: 'string',
                    section: 'string',
                    sectionTitle: 'string',
                    content: 'string',
                    sourceCount: 'number', // Number of sources (for multi-source boost)
                },
            });

            await load(searchDb, serialized);
            console.log('🔍 Search index loaded');

            return searchDb;
        } catch (error) {
            console.error('Failed to load search index:', error);
            loadingPromise = null;
            throw error;
        }
    })();

    return loadingPromise;
}

/**
 * Custom hook for searching the eIDAS regulations
 */
export function useSearch() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const [query, setQuery] = useState('');
    const [isReady, setIsReady] = useState(false);

    const debounceRef = useRef(null);

    // Load the search index on mount
    useEffect(() => {
        loadSearchIndex()
            .then(() => {
                setIsReady(true);
                setIsLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setIsLoading(false);
            });
    }, []);

    // Perform a search
    const performSearch = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        if (!searchDb) {
            console.warn('Search index not loaded');
            return;
        }

        setIsSearching(true);

        try {
            const searchResults = await search(searchDb, {
                term: searchQuery,
                properties: ['term', 'content', 'sectionTitle', 'docTitle', 'section'],
                limit: 20,
                boost: {
                    term: 10,           // Terminology definitions: 10x boost
                    sectionTitle: 3,
                    section: 2,
                    docTitle: 1.5,
                    content: 1,
                },
            });

            // ════════════════════════════════════════════════════════════════════════════
            // CATEGORY-BASED RANKING: Boost multi-source terms
            // Terms with multiple sources (e.g., from both 910/2014 and 765/2008) are more
            // significant and should rank higher in search results.
            // ════════════════════════════════════════════════════════════════════════════
            const MULTI_SOURCE_BOOST = 1.5;

            // Transform results for display and apply multi-source boost
            const transformedResults = searchResults.hits.map((hit) => {
                const sourceCount = hit.document.sourceCount || 1;
                const isMultiSource = sourceCount > 1;
                const boostedScore = isMultiSource ? hit.score * MULTI_SOURCE_BOOST : hit.score;

                return {
                    id: hit.document.id,
                    slug: hit.document.slug,
                    type: hit.document.type,
                    docTitle: hit.document.docTitle,
                    section: hit.document.section,
                    sectionTitle: hit.document.sectionTitle,
                    content: hit.document.content,
                    score: boostedScore,
                    sourceCount: sourceCount,
                    isMultiSource: isMultiSource,
                };
            });

            // Re-sort by adjusted score (multi-source boost may have changed order)
            transformedResults.sort((a, b) => b.score - a.score);

            setResults(transformedResults);
        } catch (err) {
            console.error('Search error:', err);
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounced search
    const debouncedSearch = useCallback((searchQuery) => {
        setQuery(searchQuery);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            performSearch(searchQuery);
        }, 200);
    }, [performSearch]);

    // Clear search
    const clearSearch = useCallback(() => {
        setQuery('');
        setResults([]);
    }, []);

    // Return a stable object reference to prevent infinite loops when used in dependency arrays
    // Without useMemo, this object is recreated on every render, causing useEffect deps to always change
    return useMemo(() => ({
        isLoading,
        isSearching,
        isReady,
        error,
        query,
        results,
        search: debouncedSearch,
        clearSearch,
    }), [isLoading, isSearching, isReady, error, query, results, debouncedSearch, clearSearch]);
}

export default useSearch;
