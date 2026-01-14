/**
 * Semantic Search Hook
 * 
 * Provides vector-based semantic search using pre-computed embeddings.
 * Uses a local transformer model to embed queries and find similar content
 * via cosine similarity.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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
            const similarities = embeddingsData.embeddings.map((doc) => ({
                ...doc,
                similarity: cosineSimilarity(queryVector, doc.vector),
            }));

            // Sort by similarity and take top results
            const topResults = similarities
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 20)
                .filter((r) => r.similarity > 0.3) // Threshold for relevance
                .map((r) => ({
                    id: r.id,
                    slug: r.slug,
                    type: r.type,
                    docTitle: r.docTitle,
                    section: r.section,
                    sectionTitle: r.sectionTitle,
                    content: r.snippet,
                    score: r.similarity,
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

    return {
        isLoading,
        isSearching,
        isReady,
        error,
        query,
        results,
        modelStatus,
        search: debouncedSearch,
        clearSearch,
    };
}

export default useSemanticSearch;
