/**
 * useRAG - Retrieval Augmented Generation hook
 * 
 * Uses pre-computed embeddings to find relevant context
 * for LLM prompts from the eIDAS documentation.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

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

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * RAG Hook
 */
export function useRAG() {
    const [embeddings, setEmbeddings] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [model, setModel] = useState(null);

    const pipelineRef = useRef(null);

    /**
     * Load the pre-computed embeddings from the public folder
     */
    const loadEmbeddings = useCallback(async () => {
        if (embeddings) return embeddings;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/eIDAS20/data/embeddings.json');
            if (!response.ok) {
                throw new Error('Failed to load embeddings');
            }

            const data = await response.json();
            setEmbeddings(data);
            setIsLoading(false);
            return data;
        } catch (err) {
            console.error('Error loading embeddings:', err);
            setError(err.message);
            setIsLoading(false);
            return null;
        }
    }, [embeddings]);

    /**
     * Load the embedding model for query encoding
     * Uses dynamic import to only load Transformers.js when needed
     */
    const loadModel = useCallback(async () => {
        if (pipelineRef.current) return pipelineRef.current;

        setIsLoading(true);

        try {
            // Dynamic import of transformers.js
            const { pipeline } = await import('@xenova/transformers');

            // Create the embedding pipeline
            const extractor = await pipeline(
                'feature-extraction',
                'Xenova/all-MiniLM-L6-v2'
            );

            pipelineRef.current = extractor;
            setModel(extractor);
            setIsLoading(false);

            return extractor;
        } catch (err) {
            console.error('Error loading embedding model:', err);
            setError(err.message);
            setIsLoading(false);
            return null;
        }
    }, []);

    /**
     * Generate embedding for a query
     */
    const embedQuery = useCallback(async (query) => {
        const pipe = pipelineRef.current || await loadModel();
        if (!pipe) throw new Error('Embedding model not loaded');

        const output = await pipe(query, {
            pooling: 'mean',
            normalize: true,
        });

        return Array.from(output.data);
    }, [loadModel]);

    /**
     * Retrieve relevant context chunks for a query
     * 
     * @param {string} query - The user's question
     * @param {number} topK - Number of chunks to retrieve
     * @returns {Array} - Array of { chunk, similarity } objects
     */
    const retrieveContext = useCallback(async (query, topK = 5) => {
        // Load embeddings if needed
        const data = embeddings || await loadEmbeddings();
        if (!data || !data.embeddings) {
            throw new Error('Embeddings not loaded');
        }

        // Get query embedding
        const queryVector = await embedQuery(query);

        // Calculate similarities - use correct field names from embeddings.json
        const results = data.embeddings.map((item) => ({
            ...item,
            similarity: cosineSimilarity(queryVector, item.vector),
        }));

        // Sort by similarity and take top K
        results.sort((a, b) => b.similarity - a.similarity);

        // Map to expected format for RAG prompt
        return results.slice(0, topK).map(r => ({
            id: r.id,
            title: r.sectionTitle || r.section || 'Unknown Section',
            documentTitle: r.docTitle || 'Unknown Document',
            content: r.snippet || '',
            similarity: r.similarity,
            slug: r.slug,
            type: r.type,
        }));
    }, [embeddings, loadEmbeddings, embedQuery]);

    /**
     * Build a RAG prompt with retrieved context
     * 
     * @param {string} query - User's question
     * @param {Array} context - Retrieved context chunks
     * @returns {Array} - Messages array for LLM
     */
    const buildRAGPrompt = useCallback((query, context) => {
        const systemPrompt = `You are an expert on the EU eIDAS 2.0 regulation (European Digital Identity framework). 
Your role is to answer questions about the regulation based on the provided context.

Guidelines:
- Answer based ONLY on the provided context
- If the context doesn't contain enough information, say so
- Be precise and cite specific articles when relevant
- Use clear, professional language
- Keep answers concise but comprehensive

Context from eIDAS 2.0 documentation:
${context.map((c, i) => `
[Source ${i + 1}: ${c.documentTitle} - ${c.title}]
${c.content}
`).join('\n')}`;

        return [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
        ];
    }, []);

    /**
     * Convenience method: retrieve context and build prompt
     */
    const prepareRAGQuery = useCallback(async (query, topK = 5) => {
        const context = await retrieveContext(query, topK);
        const messages = buildRAGPrompt(query, context);
        return { messages, context };
    }, [retrieveContext, buildRAGPrompt]);

    // Preload embeddings on mount (they're just JSON)
    useEffect(() => {
        loadEmbeddings();
    }, [loadEmbeddings]);

    // Return a stable object reference to prevent infinite loops when used in dependency arrays
    return useMemo(() => ({
        // State
        embeddings,
        isLoading,
        error,
        hasEmbeddings: !!embeddings,
        hasModel: !!model,

        // Actions
        loadEmbeddings,
        loadModel,
        embedQuery,
        retrieveContext,
        buildRAGPrompt,
        prepareRAGQuery,
    }), [embeddings, isLoading, error, model, loadEmbeddings, loadModel, embedQuery, retrieveContext, buildRAGPrompt, prepareRAGQuery]);
}
