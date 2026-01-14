/**
 * Search History and Suggestions Hook
 * 
 * Manages recent searches in localStorage and provides
 * popular search suggestions for the eIDAS documentation.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'eidas-search-history';
const MAX_RECENT_SEARCHES = 5;

/**
 * Popular search suggestions for eIDAS documentation
 * These are common topics users might search for
 */
const POPULAR_SUGGESTIONS = [
    { query: 'European Digital Identity Wallet', icon: '🪪' },
    { query: 'electronic signature', icon: '✍️' },
    { query: 'qualified trust service provider', icon: '🏛️' },
    { query: 'relying party', icon: '🤝' },
    { query: 'electronic attestation of attributes', icon: '📜' },
    { query: 'certification', icon: '✅' },
    { query: 'security breach', icon: '🔒' },
    { query: 'interoperability', icon: '🔗' },
];

/**
 * Load recent searches from localStorage
 */
function loadRecentSearches() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : [];
        }
    } catch (err) {
        console.warn('Failed to load search history:', err);
    }
    return [];
}

/**
 * Save recent searches to localStorage
 */
function saveRecentSearches(searches) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES)));
    } catch (err) {
        console.warn('Failed to save search history:', err);
    }
}

/**
 * Hook for managing search history and suggestions
 */
export function useSearchSuggestions() {
    const [recentSearches, setRecentSearches] = useState([]);

    // Load recent searches on mount
    useEffect(() => {
        setRecentSearches(loadRecentSearches());
    }, []);

    // Add a search to history
    const addToHistory = useCallback((query) => {
        if (!query || query.trim().length < 2) return;

        const trimmedQuery = query.trim();

        setRecentSearches((prev) => {
            // Remove if already exists (we'll add to front)
            const filtered = prev.filter(
                (item) => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
            );

            // Add to front with timestamp
            const updated = [
                { query: trimmedQuery, timestamp: Date.now() },
                ...filtered,
            ].slice(0, MAX_RECENT_SEARCHES);

            // Persist to localStorage
            saveRecentSearches(updated);

            return updated;
        });
    }, []);

    // Remove a search from history
    const removeFromHistory = useCallback((query) => {
        setRecentSearches((prev) => {
            const filtered = prev.filter(
                (item) => item.query.toLowerCase() !== query.toLowerCase()
            );
            saveRecentSearches(filtered);
            return filtered;
        });
    }, []);

    // Clear all history
    const clearHistory = useCallback(() => {
        setRecentSearches([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        recentSearches,
        popularSuggestions: POPULAR_SUGGESTIONS,
        addToHistory,
        removeFromHistory,
        clearHistory,
    };
}

export default useSearchSuggestions;
