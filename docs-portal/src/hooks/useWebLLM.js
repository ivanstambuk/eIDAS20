/**
 * useWebLLM - React hook for WebLLM integration
 * 
 * Provides:
 * - Model loading with progress tracking
 * - Streaming chat completion
 * - WebGPU availability detection
 * - Graceful error handling
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { CreateWebWorkerMLCEngine, prebuiltAppConfig } from '@mlc-ai/web-llm';

// Available models - curated list of small, fast models suitable for browser
// Models are sorted by size (smallest first) for quick loading
export const AVAILABLE_MODELS = [
    {
        id: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
        name: 'SmolLM2 360M',
        size: '~200MB',
        description: 'Ultra-fast, lightweight model. Best for quick responses.',
        recommended: true,
    },
    {
        id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
        name: 'SmolLM2 1.7B',
        size: '~900MB',
        description: 'Balanced performance and quality.',
    },
    {
        id: 'Qwen3-0.6B-q4f16_1-MLC',
        name: 'Qwen3 0.6B',
        size: '~400MB',
        description: 'Fast multilingual model from Alibaba (Qwen3).',
    },
    {
        id: 'Qwen3-1.7B-q4f16_1-MLC',
        name: 'Qwen3 1.7B',
        size: '~1GB',
        description: 'Larger Qwen3 model for better quality.',
    },
    {
        id: 'gemma-2-2b-it-q4f16_1-MLC',
        name: 'Gemma 2 2B',
        size: '~1.2GB',
        description: 'Google Gemma model. High quality but slower.',
    },
    {
        id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
        name: 'Phi-3.5 Mini',
        size: '~2.2GB',
        description: 'Microsoft Phi model. Best quality, slowest loading.',
    },
];

// Check if a model exists in prebuilt config
const isModelAvailable = (modelId) => {
    return prebuiltAppConfig.model_list.some(m => m.model_id === modelId);
};

// Filter to only available models
export const getAvailableModels = () => {
    return AVAILABLE_MODELS.filter(m => isModelAvailable(m.id));
};

/**
 * Check WebGPU availability
 */
export const checkWebGPUSupport = async () => {
    if (!navigator.gpu) {
        return { supported: false, reason: 'WebGPU is not supported in this browser' };
    }

    try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            return { supported: false, reason: 'No WebGPU adapter found' };
        }

        const device = await adapter.requestDevice();
        if (!device) {
            return { supported: false, reason: 'Could not create WebGPU device' };
        }

        return { supported: true, adapter, device };
    } catch (error) {
        return { supported: false, reason: error.message };
    }
};

/**
 * Main WebLLM hook
 */
export function useWebLLM() {
    const [status, setStatus] = useState('idle'); // idle, checking, loading, ready, error, generating
    const [loadProgress, setLoadProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('');
    const [error, setError] = useState(null);
    const [currentModel, setCurrentModel] = useState(null);
    const [webGPUSupported, setWebGPUSupported] = useState(null);

    const engineRef = useRef(null);
    const workerRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Check WebGPU support on mount
    useEffect(() => {
        checkWebGPUSupport().then(result => {
            setWebGPUSupported(result.supported);
            if (!result.supported) {
                setError(result.reason);
                setStatus('error');
            }
        });
    }, []);

    /**
     * Initialize the engine with a specific model
     */
    const loadModel = useCallback(async (modelId) => {
        if (!webGPUSupported) {
            setError('WebGPU is not supported in this browser');
            setStatus('error');
            return false;
        }

        // Clean up existing engine
        if (engineRef.current) {
            try {
                await engineRef.current.unload();
            } catch (e) {
                console.warn('Error unloading previous model:', e);
            }
        }

        // Terminate existing worker
        if (workerRef.current) {
            workerRef.current.terminate();
        }

        setStatus('loading');
        setLoadProgress(0);
        setLoadingText('Initializing...');
        setError(null);

        try {
            // Create a new worker
            const worker = new Worker(
                new URL('../workers/llm-worker.js', import.meta.url),
                { type: 'module' }
            );
            workerRef.current = worker;

            // Progress callback
            const initProgressCallback = (progress) => {
                setLoadProgress(progress.progress || 0);
                setLoadingText(progress.text || 'Loading...');
            };

            // Create engine with worker
            const engine = await CreateWebWorkerMLCEngine(
                worker,
                modelId,
                { initProgressCallback }
            );

            engineRef.current = engine;
            setCurrentModel(modelId);
            setStatus('ready');
            setLoadProgress(1);
            setLoadingText('Ready');

            return true;
        } catch (err) {
            console.error('Error loading model:', err);
            setError(err.message || 'Failed to load model');
            setStatus('error');
            return false;
        }
    }, [webGPUSupported]);

    /**
     * Unload the current model
     */
    const unloadModel = useCallback(async () => {
        if (engineRef.current) {
            try {
                await engineRef.current.unload();
            } catch (e) {
                console.warn('Error unloading model:', e);
            }
            engineRef.current = null;
        }

        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
        }

        setCurrentModel(null);
        setStatus('idle');
        setLoadProgress(0);
        setLoadingText('');
    }, []);

    /**
     * Generate a streaming chat response
     * 
     * @param {Array} messages - Array of { role, content } objects
     * @param {Object} options - Generation options
     * @param {Function} onToken - Callback for each token (streaming)
     * @returns {Promise<string>} - Full response text
     */
    const chat = useCallback(async (messages, options = {}, onToken) => {
        if (!engineRef.current) {
            throw new Error('Model not loaded');
        }

        setStatus('generating');
        abortControllerRef.current = new AbortController();

        try {
            const chunks = await engineRef.current.chat.completions.create({
                messages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens ?? 1024,
                stream: true,
                stream_options: { include_usage: true },
            });

            let fullResponse = '';

            for await (const chunk of chunks) {
                if (abortControllerRef.current?.signal.aborted) {
                    break;
                }

                const delta = chunk.choices[0]?.delta?.content || '';
                fullResponse += delta;

                if (onToken) {
                    onToken(delta, fullResponse);
                }
            }

            setStatus('ready');
            return fullResponse;
        } catch (err) {
            if (err.name === 'AbortError') {
                setStatus('ready');
                return '';
            }
            console.error('Chat error:', err);
            setError(err.message);
            setStatus('error');
            throw err;
        }
    }, []);

    /**
     * Abort the current generation
     */
    const abort = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (engineRef.current) {
            engineRef.current.interruptGenerate();
        }
        setStatus('ready');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    return {
        // State
        status,
        loadProgress,
        loadingText,
        error,
        currentModel,
        webGPUSupported,
        isLoading: status === 'loading',
        isReady: status === 'ready',
        isGenerating: status === 'generating',

        // Actions
        loadModel,
        unloadModel,
        chat,
        abort,
    };
}
