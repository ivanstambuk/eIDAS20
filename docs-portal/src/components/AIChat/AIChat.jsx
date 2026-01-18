/**
 * AIChat - Floating AI Assistant widget
 * 
 * Features:
 * - Floating button with expand/collapse
 * - Model selection with download progress
 * - RAG-powered context retrieval
 * - Streaming responses
 * - Chat history
 * - WebGPU detection with fallback
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useWebLLM, getAvailableModels } from '../../hooks/useWebLLM';
import { useRAG } from '../../hooks/useRAG';
import './AIChat.css';

// Icons as SVG components
const ChatIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
);

const StopIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
);

const SparklesIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
);

const WarningIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const NewChatIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const ThinkingIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
        <path d="M9 22h6" />
        <path d="M12 17v5" />
    </svg>
);

const ClearIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
);

const MicrophoneIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <path d="M12 19v4M8 23h8" />
    </svg>
);

/**
 * Model Selector component
 */
function ModelSelector({ currentModel, onSelectModel, isLoading, loadProgress, loadingText }) {
    const [isOpen, setIsOpen] = useState(false);
    const models = getAvailableModels();

    const handleSelect = (modelId) => {
        onSelectModel(modelId);
        setIsOpen(false);
    };

    const selectedModel = models.find(m => m.id === currentModel);

    return (
        <div className="model-selector">
            <button
                className="model-selector-trigger"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
            >
                <SparklesIcon />
                <span className="model-name">
                    {selectedModel?.name || 'Select Model'}
                </span>
                <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isLoading && (
                <div className="loading-overlay">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(loadProgress * 100).toFixed(0)}%` }}
                        />
                    </div>
                    <span className="loading-text">{loadingText}</span>
                </div>
            )}

            {isOpen && !isLoading && (
                <div className="model-dropdown">
                    {models.map((model) => (
                        <button
                            key={model.id}
                            className={`model-option ${model.id === currentModel ? 'active' : ''}`}
                            onClick={() => handleSelect(model.id)}
                        >
                            <div className="model-option-header">
                                <span className="model-option-name">{model.name}</span>
                                <span className="model-option-size">{model.size}</span>
                            </div>
                            <span className="model-option-desc">{model.description}</span>
                            {model.recommended && (
                                <span className="model-recommended-badge">Recommended</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Chat Message component
 */
function ChatMessage({ message, isStreaming }) {
    return (
        <div className={`chat-message ${message.role}`}>
            {message.role === 'assistant' && (
                <div className="message-avatar">
                    <SparklesIcon />
                </div>
            )}
            <div className="message-content">
                <div className="message-text">
                    {message.content}
                    {isStreaming && <span className="cursor-blink">▊</span>}
                </div>
                {message.sources && message.sources.length > 0 && (
                    <div className="message-sources">
                        <span className="sources-label">Sources:</span>
                        {message.sources.map((source, i) => (
                            <span key={i} className="source-tag">
                                {source.title}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * WebGPU Not Supported Fallback
 */
function WebGPUFallback() {
    return (
        <div className="webgpu-fallback">
            <div className="fallback-icon">
                <WarningIcon />
            </div>
            <h3>WebGPU Not Available</h3>
            <p>
                Your browser doesn't support WebGPU, which is required for local AI inference.
            </p>
            <div className="fallback-suggestions">
                <p><strong>To enable AI chat:</strong></p>
                <ul>
                    <li>Use Chrome 113+ or Edge 113+</li>
                    <li>Enable WebGPU in chrome://flags</li>
                    <li>Ensure your GPU supports WebGPU</li>
                </ul>
            </div>
            <p className="fallback-note">
                You can still use all other features of the portal, including search and terminology lookup.
            </p>
        </div>
    );
}

/**
 * Welcome/Onboarding screen with model selector
 */
function WelcomeScreen({
    onLoadModel,
    selectedModelId,
    onSelectModel,
    cachedModels
}) {
    const models = getAvailableModels();
    const selectedModel = models.find(m => m.id === selectedModelId) || models[0];
    const isSelectedCached = cachedModels.includes(selectedModelId);

    return (
        <div className="welcome-screen">
            <div className="welcome-icon" aria-hidden="true">
                <SparklesIcon />
            </div>
            <h3>eIDAS AI Assistant</h3>

            <p className="welcome-subtitle">Select Model</p>

            <div className="model-list" role="listbox" aria-label="Available AI models">
                {models.map((model) => {
                    const isCached = cachedModels.includes(model.id);
                    const isSelected = model.id === selectedModelId;

                    return (
                        <button
                            key={model.id}
                            className={`model-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => onSelectModel(model.id)}
                            role="option"
                            aria-selected={isSelected}
                        >
                            <div className="model-card-info">
                                <div className="model-card-header">
                                    <span className="model-card-name">{model.name}</span>
                                    {model.recommended && (
                                        <span className="badge badge-recommended">RECOMMENDED</span>
                                    )}
                                </div>
                                <span className="model-card-size">{model.size}</span>
                            </div>
                            <div className="model-card-status">
                                {isCached ? (
                                    <span className="cache-indicator cached">
                                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                        CACHED
                                    </span>
                                ) : (
                                    <span className="cache-indicator download" aria-label="Requires download">
                                        <DownloadIcon />
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <button
                className="btn btn-primary welcome-cta"
                onClick={() => onLoadModel(selectedModelId)}
            >
                <span>Load {selectedModel?.name} ({selectedModel?.size})</span>
            </button>

            <p className="welcome-note">
                {isSelectedCached
                    ? 'This model is cached — loads instantly!'
                    : 'Cached models load instantly. New models require download.'}
            </p>
        </div>
    );
}

/**
 * Main AIChat Component
 */
export function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [streamingContent, setStreamingContent] = useState('');
    const [currentSources, setCurrentSources] = useState([]);
    const [thinkingEnabled, setThinkingEnabled] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const llm = useWebLLM();
    const rag = useRAG();

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen && llm.isReady) {
            inputRef.current?.focus();
        }
    }, [isOpen, llm.isReady]);

    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || !llm.isReady || llm.isGenerating) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        try {
            // Get RAG context
            const { messages: ragMessages, context } = await rag.prepareRAGQuery(userMessage, 4);
            setCurrentSources(context);

            // Start streaming response
            setStreamingContent('');

            const response = await llm.chat(
                ragMessages,
                { temperature: 0.7, maxTokens: 1024 },
                (token, fullText) => {
                    setStreamingContent(fullText);
                }
            );

            // Add assistant message with sources
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: response,
                    sources: context.map(c => ({
                        title: c.title,
                        document: c.documentTitle,
                    })),
                },
            ]);
            setStreamingContent('');
            setCurrentSources([]);
        } catch (err) {
            console.error('Error generating response:', err);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: `Sorry, I encountered an error: ${err.message}`,
                },
            ]);
            setStreamingContent('');
        }
    }, [input, llm, rag]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleStopGeneration = () => {
        llm.abort();
        if (streamingContent) {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: streamingContent + ' [stopped]' },
            ]);
            setStreamingContent('');
        }
    };

    const handleNewChat = useCallback(() => {
        setMessages([]);
        setStreamingContent('');
        setCurrentSources([]);
        setInput('');
        inputRef.current?.focus();
    }, []);

    const handleClearContext = useCallback(() => {
        setMessages([]);
        setStreamingContent('');
        setCurrentSources([]);
    }, []);

    const handleToggleThinking = useCallback(() => {
        setThinkingEnabled(prev => !prev);
    }, []);

    // Render chat panel content
    const renderPanelContent = () => {
        // WebGPU not supported
        if (llm.webGPUSupported === false) {
            return <WebGPUFallback />;
        }

        // No model loaded yet
        if (llm.status === 'idle' || llm.status === 'checking') {
            return (
                <WelcomeScreen
                    onLoadModel={llm.loadModel}
                    selectedModelId={llm.selectedModelId}
                    onSelectModel={llm.setSelectedModelId}
                    cachedModels={llm.cachedModels}
                />
            );
        }

        // Loading model
        if (llm.isLoading) {
            return (
                <div className="loading-screen">
                    <div className="loading-spinner" />
                    <div className="loading-progress">
                        <div
                            className="progress-fill"
                            style={{ width: `${(llm.loadProgress * 100).toFixed(0)}%` }}
                        />
                    </div>
                    <p className="loading-text">{llm.loadingText}</p>
                    <p className="loading-hint">
                        {llm.loadProgress < 0.1 && 'Initializing WebGPU...'}
                        {llm.loadProgress >= 0.1 && llm.loadProgress < 0.9 && 'Downloading model weights...'}
                        {llm.loadProgress >= 0.9 && 'Compiling model...'}
                    </p>
                </div>
            );
        }

        // Chat interface
        return (
            <>
                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div className="empty-chat">
                            <SparklesIcon />
                            <p>Ask me anything about eIDAS 2.0!</p>
                            <div className="suggested-questions">
                                {[
                                    'What is the European Digital Identity Wallet?',
                                    'What are the requirements for qualified trust services?',
                                    'How does eIDAS 2.0 handle electronic signatures?',
                                ].map((q, i) => (
                                    <button
                                        key={i}
                                        className="suggested-question"
                                        onClick={() => setInput(q)}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <ChatMessage key={i} message={msg} />
                    ))}

                    {streamingContent && (
                        <ChatMessage
                            message={{ role: 'assistant', content: streamingContent }}
                            isStreaming
                        />
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                    <button
                        className="btn-mic"
                        onClick={() => {/* TODO: Implement speech-to-text */ }}
                        aria-label="Voice input"
                        title="Voice input (coming soon)"
                    >
                        <MicrophoneIcon />
                    </button>
                    <label htmlFor="chat-input" className="sr-only">Type your question about eIDAS 2.0</label>
                    <textarea
                        ref={inputRef}
                        id="chat-input"
                        className="chat-input"
                        placeholder="Ask about eIDAS 2.0..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        disabled={llm.isGenerating}
                        aria-label="Type your question about eIDAS 2.0"
                    />

                    {llm.isGenerating ? (
                        <button
                            className="btn btn-stop"
                            onClick={handleStopGeneration}
                            aria-label="Stop generating response"
                        >
                            <StopIcon />
                        </button>
                    ) : (
                        <button
                            className="btn btn-send"
                            onClick={handleSendMessage}
                            disabled={!input.trim()}
                            aria-label="Send message"
                        >
                            <SendIcon />
                        </button>
                    )}
                </div>
            </>
        );
    };

    return (
        <div className="ai-chat-widget">
            {isOpen && (
                <div
                    className="chat-panel"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="chat-panel-title"
                >
                    <div className="chat-header">
                        <div className="header-left">
                            <span aria-hidden="true"><SparklesIcon /></span>
                            <span className="header-title" id="chat-panel-title">eIDAS AI Assistant</span>
                        </div>

                        {llm.isReady && (
                            <ModelSelector
                                currentModel={llm.currentModel}
                                onSelectModel={llm.loadModel}
                                isLoading={llm.isLoading}
                                loadProgress={llm.loadProgress}
                                loadingText={llm.loadingText}
                            />
                        )}

                        <button
                            className="btn-close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close AI chat"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    {/* Toolbar - only visible when model is ready */}
                    {llm.isReady && (
                        <div className="chat-toolbar">
                            <button
                                className="toolbar-btn"
                                onClick={handleNewChat}
                                aria-label="Start new chat"
                            >
                                <NewChatIcon />
                                <span>New</span>
                            </button>
                            <button
                                className={`toolbar-btn ${thinkingEnabled ? 'active' : ''}`}
                                onClick={handleToggleThinking}
                                aria-label={thinkingEnabled ? 'Disable thinking' : 'Enable thinking'}
                                aria-pressed={thinkingEnabled}
                            >
                                <ThinkingIcon />
                                <span>{thinkingEnabled ? 'Think ON' : 'Think'}</span>
                            </button>
                            <button
                                className="toolbar-btn"
                                onClick={handleClearContext}
                                aria-label="Clear chat context"
                                disabled={messages.length === 0}
                            >
                                <ClearIcon />
                                <span>Clear</span>
                            </button>
                        </div>
                    )}

                    <div className="chat-body">
                        {renderPanelContent()}
                    </div>
                </div>
            )}

            <button
                className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
                aria-expanded={isOpen}
                aria-controls="chat-panel"
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </button>
        </div>
    );
}

export default AIChat;
