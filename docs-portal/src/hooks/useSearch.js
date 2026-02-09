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
            const DISPLAY_LIMIT = 20;

            // ════════════════════════════════════════════════════════════════
            // DUAL-SEARCH STRATEGY
            //
            // 1. FUZZY SEARCH: Standard Orama prefix/stemmed search across
            //    all fields → general results (may miss terminology aliases)
            // 2. EXACT SEARCH: Deterministic exact-token search on the `term`
            //    field only → guarantees terminology entries with matching
            //    aliases (e.g. "RP" in "relying party RP") are found
            //
            // This avoids the probabilistic "fetch more and hope" pattern.
            // Orama's `exact: true` disables prefix expansion, so "RP" will
            // match the exact token "rp" but NOT "rpi" (from "RPI_06").
            // ════════════════════════════════════════════════════════════════

            // Search 1: Normal fuzzy search (prefix + stemming enabled)
            const fuzzyResults = await search(searchDb, {
                term: searchQuery,
                properties: ['term', 'content', 'sectionTitle', 'docTitle', 'section'],
                limit: DISPLAY_LIMIT,
                boost: {
                    term: 10,
                    sectionTitle: 3,
                    section: 2,
                    docTitle: 1.5,
                    content: 1,
                },
            });

            // Search 2: Exact-match search on terminology aliases
            // Only searches the `term` field (which contains aliases like "RP")
            // with exact: true to disable prefix expansion
            const exactResults = await search(searchDb, {
                term: searchQuery,
                properties: ['term'],
                exact: true,
                limit: 5,
            });

            // Merge: start with exact hits, then add fuzzy hits (deduplicating)
            const seenIds = new Set();
            const mergedHits = [];

            // Exact hits first (these are the deterministic alias matches)
            for (const hit of exactResults.hits) {
                if (!seenIds.has(hit.document.id)) {
                    seenIds.add(hit.document.id);
                    mergedHits.push({ ...hit, isExactAliasMatch: true });
                }
            }

            // Then fuzzy hits
            for (const hit of fuzzyResults.hits) {
                if (!seenIds.has(hit.document.id)) {
                    seenIds.add(hit.document.id);
                    mergedHits.push({ ...hit, isExactAliasMatch: false });
                }
            }

            // ════════════════════════════════════════════════════════════════
            // POST-ORAMA RANKING: Apply exact match and multi-source boosts
            // 
            // 1. EXACT MATCH BOOST: query matches term name or alias → 100x
            // 2. PREFIX MATCH BOOST: query is a prefix of term name → 10x
            // 3. MULTI-SOURCE BOOST: Terms from multiple sources → 1.5x
            // ════════════════════════════════════════════════════════════════
            const EXACT_MATCH_BOOST = 100;
            const PREFIX_MATCH_BOOST = 10;
            const MULTI_SOURCE_BOOST = 1.5;

            const normalizedQuery = searchQuery.toLowerCase().trim();

            // Transform results for display and apply boosts
            const transformedResults = mergedHits.map((hit) => {
                const sourceCount = hit.document.sourceCount || 1;
                const isMultiSource = sourceCount > 1;
                let boostedScore = hit.score;

                // Apply exact/prefix match boost for terminology entries
                if (hit.document.type === 'definition' && hit.document.sectionTitle) {
                    const termName = hit.document.sectionTitle.toLowerCase();

                    if (termName === normalizedQuery) {
                        // Exact match: "digital signature" query matches "digital signature" term
                        boostedScore *= EXACT_MATCH_BOOST;
                    } else if (termName.startsWith(normalizedQuery)) {
                        // Prefix match: "digital" query matches "digital signature" term
                        boostedScore *= PREFIX_MATCH_BOOST;
                    } else if (hit.isExactAliasMatch && hit.document.type === 'definition') {
                        // Deterministic alias match via exact search
                        // e.g., "RP" query → exact match in term field "relying party RP"
                        boostedScore *= EXACT_MATCH_BOOST;
                    } else if (hit.document.term) {
                        // Fallback: check aliases in term field for fuzzy results
                        const termField = hit.document.term.toLowerCase();
                        const aliasTokens = termField
                            .replace(termName, '')
                            .trim()
                            .split(/\s+/)
                            .filter(Boolean);

                        if (aliasTokens.some(alias => alias === normalizedQuery)) {
                            boostedScore *= EXACT_MATCH_BOOST;
                        }
                    }
                }

                // Apply multi-source boost
                if (isMultiSource) {
                    boostedScore *= MULTI_SOURCE_BOOST;
                }

                return {
                    id: hit.document.id,
                    slug: hit.document.slug,
                    type: hit.document.type,
                    term: hit.document.term,
                    docTitle: hit.document.docTitle,
                    section: hit.document.section,
                    sectionTitle: hit.document.sectionTitle,
                    content: hit.document.content,
                    score: boostedScore,
                    sourceCount: sourceCount,
                    isMultiSource: isMultiSource,
                };
            });

            // Re-sort by adjusted score (boosts may have changed order)
            // then trim to display limit
            transformedResults.sort((a, b) => b.score - a.score);

            setResults(transformedResults.slice(0, DISPLAY_LIMIT));
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
