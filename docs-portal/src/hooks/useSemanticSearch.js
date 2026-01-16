/**
 * Semantic Search Hook
 * 
 * Provides vector-based semantic search using pre-computed embeddings.
 * Uses a local transformer model to embed queries and find similar content
 * via cosine similarity.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js for browser
env.allowLocalModels = false;

// Singleton for the embedding model
let embedderInstance = null;
let embedderLoadingPromise = null;

// Cache for embeddings data
let embeddingsData = null;
let embeddingsLoadingPromise = null;

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculate title similarity with prefix-aware matching.
 * Handles partial word queries like "wallet solutio" matching "wallet solution".
 * 
 * @param {string} title - The document/term title
 * @param {string} query - The search query (may contain partial words)
 * @returns {number} Similarity score between 0 and 1
 */
function titleSimilarity(title, query) {
    if (!title || !query) return 0;

    const normalizedTitle = title.toLowerCase().trim();
    const normalizedQuery = query.toLowerCase().trim();

    // Exact match
    if (normalizedTitle === normalizedQuery) return 1.0;

    // Title starts with query (perfect prefix)
    if (normalizedTitle.startsWith(normalizedQuery)) return 0.95;

    // Word-by-word prefix matching for partial words
    // "wallet solutio" → ["wallet", "solutio"]
    // "wallet solution" → ["wallet", "solution"]
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
    const titleWords = normalizedTitle.split(/\s+/).filter(w => w.length > 0);

    if (queryWords.length === 0) return 0;

    let matchedWords = 0;
    let partialMatchBonus = 0;

    for (let i = 0; i < queryWords.length; i++) {
        const qWord = queryWords[i];

        // Check if this query word matches any title word (as prefix)
        for (let j = 0; j < titleWords.length; j++) {
            const tWord = titleWords[j];

            if (tWord === qWord) {
                // Exact word match
                matchedWords += 1;
                break;
            } else if (tWord.startsWith(qWord) && qWord.length >= 3) {
                // Partial word match (prefix of at least 3 chars)
                // Score based on how much of the word is typed
                const coverage = qWord.length / tWord.length;
                matchedWords += coverage;
                partialMatchBonus += 0.1 * coverage; // Small bonus for partial
                break;
            }
        }
    }

    // Score: proportion of query words that matched
    const matchScore = matchedWords / queryWords.length;

    // Bonus if query word count matches title word count (likely exact term)
    const lengthBonus = queryWords.length === titleWords.length ? 0.1 : 0;

    return Math.min(1.0, matchScore + partialMatchBonus + lengthBonus);
}

/**
 * Load the embeddings data from the pre-computed JSON file
 */
async function loadEmbeddings() {
    if (embeddingsData) return embeddingsData;
    if (embeddingsLoadingPromise) return embeddingsLoadingPromise;

    embeddingsLoadingPromise = (async () => {
        try {
            const response = await fetch(`${import.meta.env.BASE_URL}data/embeddings.json`);
            if (!response.ok) {
                throw new Error(`Failed to load embeddings: ${response.status}`);
            }

            embeddingsData = await response.json();
            console.log(`🧠 Loaded ${embeddingsData.count} embeddings`);
            return embeddingsData;
        } catch (error) {
            console.error('Failed to load embeddings:', error);
            embeddingsLoadingPromise = null;
            throw error;
        }
    })();

    return embeddingsLoadingPromise;
}

/**
 * Load the embedding model
 */
async function loadEmbedder() {
    if (embedderInstance) return embedderInstance;
    if (embedderLoadingPromise) return embedderLoadingPromise;

    embedderLoadingPromise = (async () => {
        try {
            console.log('🔄 Loading embedding model...');
            embedderInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
                quantized: true,
            });
            console.log('✅ Embedding model ready');
            return embedderInstance;
        } catch (error) {
            console.error('Failed to load embedding model:', error);
            embedderLoadingPromise = null;
            throw error;
        }
    })();

    return embedderLoadingPromise;
}

/**
 * Custom hook for semantic search
 */
export function useSemanticSearch() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const [query, setQuery] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [modelStatus, setModelStatus] = useState('loading');

    const debounceRef = useRef(null);

    // Load embeddings and model on mount
    useEffect(() => {
        let cancelled = false;

        async function init() {
            try {
                // Load embeddings first (fast)
                setModelStatus('loading-embeddings');
                await loadEmbeddings();

                if (cancelled) return;

                // Then load the model (slower, loads on demand)
                setModelStatus('loading-model');
                await loadEmbedder();

                if (cancelled) return;

                setIsReady(true);
                setIsLoading(false);
                setModelStatus('ready');
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                    setIsLoading(false);
                    setModelStatus('error');
                }
            }
        }

        init();

        return () => {
            cancelled = true;
        };
    }, []);

    // Perform semantic search
    const performSearch = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        if (!embeddingsData || !embedderInstance) {
            console.warn('Semantic search not ready');
            return;
        }

        setIsSearching(true);

        try {
            // Generate embedding for the query
            const output = await embedderInstance(searchQuery, {
                pooling: 'mean',
                normalize: true,
            });

            const queryVector = Array.from(output.data);

            // Calculate similarity with all document embeddings
            // Combined ranking: semantic similarity (70%) + title similarity (30%)
            // Title similarity handles partial word queries like "wallet solutio"
            const similarities = embeddingsData.embeddings.map((doc) => {
                const semanticSim = cosineSimilarity(queryVector, doc.vector);

                // For definitions, use sectionTitle (the term name) for title matching
                // For articles, use sectionTitle (article heading)
                const titleForMatching = doc.sectionTitle || doc.section || '';
                const titleSim = titleSimilarity(titleForMatching, searchQuery);

                // Combined score: 70% semantic + 30% title similarity
                // Title similarity helps with partial word matches
                const combinedScore = (semanticSim * 0.7) + (titleSim * 0.3);

                return {
                    ...doc,
                    similarity: semanticSim,
                    titleSimilarity: titleSim,
                    combinedScore: combinedScore,
                };
            });

            // Two-tier ranking: definitions first, then articles
            // Within each tier, sort by COMBINED score (not just semantic)
            const relevantResults = similarities.filter((r) => r.combinedScore > 0.25);

            // Separate definitions and articles, sort by combined score
            const definitions = relevantResults
                .filter((r) => r.type === 'definition')
                .sort((a, b) => b.combinedScore - a.combinedScore);

            const articles = relevantResults
                .filter((r) => r.type !== 'definition')
                .sort((a, b) => b.combinedScore - a.combinedScore);

            // Concatenate: definitions first, then articles
            const topResults = [...definitions, ...articles]
                .slice(0, 20)
                .map((r) => ({
                    id: r.id,
                    slug: r.slug,
                    type: r.type,
                    docTitle: r.docTitle,
                    section: r.section,
                    sectionTitle: r.sectionTitle,
                    content: r.snippet,
                    score: r.combinedScore, // Use combined score for display
                }));

            setResults(topResults);
        } catch (err) {
            console.error('Semantic search error:', err);
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

        // Longer debounce for semantic search since it's more expensive
        debounceRef.current = setTimeout(() => {
            performSearch(searchQuery);
        }, 400);
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
        modelStatus,
        search: debouncedSearch,
        clearSearch,
    }), [isLoading, isSearching, isReady, error, query, results, modelStatus, debouncedSearch, clearSearch]);
}

export default useSemanticSearch;
