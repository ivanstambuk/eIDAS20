/**
 * Search Modal Component
 * 
 * Full-screen search overlay with instant results,
 * recent searches, popular suggestions, and semantic search.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import { useSemanticSearch } from '../../hooks/useSemanticSearch';
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions';
import { useQuickJump } from '../../hooks/useQuickJump';
import './Search.css';

/**
 * Highlight matching terms in text
 */
function highlightTerms(text, query) {
    if (!query || !text) return text;

    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    if (terms.length === 0) return text;

    // Create a regex pattern for all terms
    const pattern = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');

    const parts = text.split(regex);

    return parts.map((part, i) => {
        if (terms.some(term => part.toLowerCase() === term.toLowerCase())) {
            return <mark key={i}>{part}</mark>;
        }
        return part;
    });
}

/**
 * Extract a relevant snippet from content around matched terms
 */
function getSnippet(content, query, maxLength = 200) {
    if (!content || !query) return content?.substring(0, maxLength) + '...';

    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const lowerContent = content.toLowerCase();

    // Find the first occurrence of any term
    let firstMatchIndex = -1;
    for (const term of terms) {
        const index = lowerContent.indexOf(term);
        if (index !== -1 && (firstMatchIndex === -1 || index < firstMatchIndex)) {
            firstMatchIndex = index;
        }
    }

    if (firstMatchIndex === -1) {
        return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
    }

    // Extract snippet around the match
    const start = Math.max(0, firstMatchIndex - 60);
    const end = Math.min(content.length, firstMatchIndex + maxLength - 60);

    let snippet = content.substring(start, end);

    // Add ellipsis if truncated
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
}

/**
 * Search result item
 */
function SearchResult({ result, query, onClick, isSemanticMode }) {
    const getDocUrl = () => {
        // Handle terminology definitions specially
        if (result.type === 'definition') {
            // result.id is already "term-{id}", which matches the DOM element ID in Terminology.jsx
            // Use ?section= query param because HashRouter already uses # for routing
            const section = result.id ? `?section=${result.id}` : '';
            return `/terminology${section}`;
        }

        // Handle ARF HLRs - link to VCQ tool
        if (result.type === 'arf-hlr') {
            return `/vcq`;  // Navigate to VCQ where ARF HLRs are displayed
        }

        // Handle regulations and implementing acts
        const baseType = result.type === 'regulation' ? 'regulation' : 'implementing-acts';
        const hash = result.section ? `#${result.section.toLowerCase().replace(/\s+/g, '-')}` : '';
        return `/${baseType}/${result.slug}${hash}`;
    };

    const getIcon = () => {
        if (result.type === 'definition') return '📖';
        if (result.type === 'arf-hlr') return '📐';
        return result.type === 'regulation' ? '📜' : '📋';
    };

    const similarityPercent = isSemanticMode && result.score
        ? Math.round(result.score * 100)
        : null;

    return (
        <Link
            to={getDocUrl()}
            className={`search-result ${result.type === 'arf-hlr' ? 'search-result-arf' : ''}`}
            onClick={onClick}
        >
            <div className="search-result-header">
                <span className={`search-result-type ${result.type}`}>
                    {getIcon()} {result.docTitle}
                </span>
                <div className="search-result-meta">
                    {similarityPercent && (
                        <span className="search-result-similarity">
                            {similarityPercent}% match
                        </span>
                    )}
                    <span className="search-result-section">
                        {result.section}
                    </span>
                </div>
            </div>
            <div className="search-result-title">
                {isSemanticMode
                    ? result.sectionTitle
                    : highlightTerms(result.sectionTitle, query)}
            </div>
            <div className="search-result-snippet">
                {isSemanticMode
                    ? getSnippet(result.content, query)
                    : highlightTerms(getSnippet(result.content, query), query)}
            </div>
        </Link>
    );
}

/**
 * Suggestion item (recent or popular)
 */
function SuggestionItem({ suggestion, icon, onSelect, onRemove, isRecent }) {
    return (
        <div className="suggestion-item">
            <button
                className="suggestion-button"
                onClick={() => onSelect(suggestion)}
            >
                <span className="suggestion-icon">{icon}</span>
                <span className="suggestion-text">{suggestion}</span>
            </button>
            {isRecent && onRemove && (
                <button
                    className="suggestion-remove"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(suggestion);
                    }}
                    aria-label="Remove from history"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}

/**
 * Search mode toggle
 */
function SearchModeToggle({ mode, onModeChange, semanticReady, semanticStatus }) {
    return (
        <div className="search-mode-toggle" role="group" aria-label="Search mode">
            <button
                className={`search-mode-btn ${mode === 'keyword' ? 'active' : ''}`}
                onClick={() => onModeChange('keyword')}
                aria-pressed={mode === 'keyword'}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 6h16M4 12h16M4 18h12" />
                </svg>
                Keyword
            </button>
            <button
                className={`search-mode-btn ${mode === 'semantic' ? 'active' : ''}`}
                onClick={() => onModeChange('semantic')}
                disabled={!semanticReady}
                aria-pressed={mode === 'semantic'}
                title={!semanticReady ? `Loading AI model... (${semanticStatus})` : 'Semantic search uses AI to find related content'}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Semantic
                {!semanticReady && <span className="mode-loading-dot" aria-hidden="true" />}
            </button>
        </div>
    );
}

/**
 * Main Search Modal
 */
export function SearchModal({ isOpen, onClose }) {
    const inputRef = useRef(null);
    const [searchMode, setSearchMode] = useState('keyword');

    // Keyword search
    const keywordSearch = useSearch();

    // Semantic search
    const semanticSearch = useSemanticSearch();

    // Search suggestions
    const {
        recentSearches,
        popularSuggestions,
        addToHistory,
        removeFromHistory,
        clearHistory,
    } = useSearchSuggestions();

    // Get current search state based on mode
    const currentSearch = searchMode === 'semantic' ? semanticSearch : keywordSearch;
    const {
        isLoading,
        isSearching,
        error,
        query,
        results,
        search,
        clearSearch,
    } = currentSearch;

    // Quick jump: detect document references (CELEX, slugs, ELI)
    const quickJump = useQuickJump(query);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Clear search state when modal closes
    // ⚠️ WARNING: Unstable Dependency Anti-Pattern Prevention
    // 
    // We extract individual function references rather than using the entire hook objects
    // (keywordSearch, semanticSearch) in the useEffect dependency array because:
    // 
    // 1. useSearch() and useSemanticSearch() return NEW object literals on every render
    // 2. If we put these objects in the dependency array, React sees them as "changed" every render
    // 3. This triggers the useEffect → calls clearSearch() → updates state → re-render → infinite loop!
    // 
    // Solution: Only depend on the stable function references (wrapped in useCallback in the hooks)
    // This pattern applies ANYWHERE you use custom hook return values in dependency arrays.
    const clearKeywordSearch = keywordSearch.clearSearch;
    const clearSemanticSearch = semanticSearch.clearSearch;

    useEffect(() => {
        if (!isOpen) {
            // Clear both search modes when modal is closed
            clearKeywordSearch();
            clearSemanticSearch();
            // Also clear the input field value for next open
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    }, [isOpen, clearKeywordSearch, clearSemanticSearch]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Close on Escape
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Handle mode change - preserve query and re-search
    const handleModeChange = useCallback((mode) => {
        const currentQuery = inputRef.current?.value || '';
        setSearchMode(mode);

        // Clear previous mode's results
        clearKeywordSearch();
        clearSemanticSearch();

        // Re-run search with preserved query in new mode
        if (currentQuery.trim()) {
            // Use the appropriate search function for the new mode
            const newSearch = mode === 'semantic' ? semanticSearch.search : keywordSearch.search;
            newSearch(currentQuery);
        }

        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [clearKeywordSearch, clearSemanticSearch, keywordSearch.search, semanticSearch.search]);

    // Handle result click - save to history
    const handleResultClick = useCallback(() => {
        if (query.trim()) {
            addToHistory(query);
        }
        onClose();
        clearSearch();
    }, [query, addToHistory, onClose, clearSearch]);

    // Handle suggestion selection
    const handleSuggestionSelect = useCallback((suggestionQuery) => {
        search(suggestionQuery);
        if (inputRef.current) {
            inputRef.current.value = suggestionQuery;
            inputRef.current.focus();
        }
    }, [search]);

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const showSuggestions = !query && (recentSearches.length > 0 || popularSuggestions.length > 0);

    return (
        <div className="search-modal-backdrop" onClick={handleBackdropClick} role="presentation">
            <div
                className="search-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="search-modal-title"
            >
                {/* Search header with mode toggle */}
                <div className="search-modal-header">
                    <h2 id="search-modal-title" className="sr-only">Search eIDAS 2.0 Documentation</h2>
                    <div className="search-input-wrapper">
                        <svg
                            className="search-input-icon"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <label htmlFor="search-input" className="sr-only">
                            {searchMode === 'semantic'
                                ? "Ask a question or describe what you're looking for"
                                : "Search regulations, articles, terms"}
                        </label>
                        <input
                            ref={inputRef}
                            id="search-input"
                            type="text"
                            className="search-modal-input"
                            placeholder={searchMode === 'semantic'
                                ? "Ask a question or describe what you're looking for..."
                                : "Search regulations, articles, terms..."}
                            defaultValue={query}
                            onChange={(e) => search(e.target.value)}
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                        {query && (
                            <button
                                className="search-clear-btn"
                                onClick={() => {
                                    clearSearch();
                                    if (inputRef.current) {
                                        inputRef.current.value = '';
                                        inputRef.current.focus();
                                    }
                                }}
                                aria-label="Clear search"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <button
                        className="search-close-btn"
                        onClick={onClose}
                        aria-label="Close search"
                    >
                        <kbd>ESC</kbd>
                    </button>
                </div>

                {/* Search mode toggle */}
                <div className="search-modal-controls">
                    <SearchModeToggle
                        mode={searchMode}
                        onModeChange={handleModeChange}
                        semanticReady={semanticSearch.isReady}
                        semanticStatus={semanticSearch.modelStatus}
                    />
                    {searchMode === 'semantic' && (
                        <span className="search-mode-hint">
                            🧠 AI-powered semantic search finds related concepts
                        </span>
                    )}
                </div>

                {/* Search results / suggestions */}
                <div className="search-modal-body">
                    {isLoading && (
                        <div className="search-status">
                            <div className="search-spinner" />
                            <span>
                                {searchMode === 'semantic'
                                    ? 'Loading AI model...'
                                    : 'Loading search index...'}
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="search-status search-error">
                            <span>⚠️ {error}</span>
                        </div>
                    )}

                    {/* Quick Jump: Direct navigation to documents by ID/reference */}
                    {!isLoading && quickJump.hasMatches && (
                        <div className="quick-jump-section">
                            <div className="quick-jump-header">
                                <span className="quick-jump-icon">🚀</span>
                                <span className="quick-jump-title">Quick Jump</span>
                            </div>
                            <div className="quick-jump-results">
                                {quickJump.matches.map((doc) => (
                                    <Link
                                        key={doc.slug}
                                        to={`/regulation/${doc.slug}`}
                                        className="quick-jump-item"
                                        onClick={onClose}
                                    >
                                        <div className="quick-jump-item-header">
                                            <span className="quick-jump-item-title">{doc.shortTitle}</span>
                                            <span className="quick-jump-item-celex">{doc.celex}</span>
                                        </div>
                                        <div className="quick-jump-item-meta">
                                            <span className="quick-jump-item-type">
                                                {doc.legalType === 'recommendation' ? 'Recommendation' :
                                                    doc.legalType === 'decision' ? 'Decision' :
                                                        doc.type === 'regulation' ? 'Regulation' : 'Implementing Regulation'}
                                            </span>
                                            <span className="quick-jump-item-date">{doc.date}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions (when no query) */}
                    {!isLoading && !error && showSuggestions && (
                        <div className="search-suggestions">
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div className="suggestion-section">
                                    <div className="suggestion-section-header">
                                        <span className="suggestion-section-title">Recent Searches</span>
                                        <button
                                            className="suggestion-clear-all"
                                            onClick={clearHistory}
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                    <div className="suggestion-list">
                                        {recentSearches.map((item) => (
                                            <SuggestionItem
                                                key={item.query}
                                                suggestion={item.query}
                                                icon="🕒"
                                                onSelect={handleSuggestionSelect}
                                                onRemove={removeFromHistory}
                                                isRecent={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Popular Suggestions */}
                            <div className="suggestion-section">
                                <div className="suggestion-section-header">
                                    <span className="suggestion-section-title">
                                        {searchMode === 'semantic' ? 'Try asking about...' : 'Popular Topics'}
                                    </span>
                                </div>
                                <div className="suggestion-list">
                                    {popularSuggestions.map((item) => (
                                        <SuggestionItem
                                            key={item.query}
                                            suggestion={item.query}
                                            icon={item.icon}
                                            onSelect={handleSuggestionSelect}
                                            isRecent={false}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search hint (when no query and no suggestions) */}
                    {!isLoading && !error && !query && !showSuggestions && (
                        <div className="search-status search-hint">
                            <p>
                                {searchMode === 'semantic'
                                    ? 'Ask a question or describe what you\'re looking for. AI will find related content.'
                                    : 'Start typing to search across all eIDAS regulations and implementing acts.'}
                            </p>
                            <div className="search-tips">
                                <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
                                <span><kbd>Enter</kbd> Open</span>
                                <span><kbd>ESC</kbd> Close</span>
                            </div>
                        </div>
                    )}

                    {/* No results */}
                    {!isLoading && query && results.length === 0 && !isSearching && (
                        <div className="search-status">
                            <span>No results found for "{query}"</span>
                            {searchMode === 'keyword' && (
                                <p className="search-status-hint">
                                    Try switching to <strong>Semantic</strong> mode to find related concepts
                                </p>
                            )}
                        </div>
                    )}

                    {/* Search results */}
                    {results.length > 0 && (
                        <div className="search-results">
                            <div className="search-results-header">
                                <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
                                {isSearching && <div className="search-spinner small" />}
                            </div>
                            <div className="search-results-list">
                                {results.map((result) => (
                                    <SearchResult
                                        key={result.id}
                                        result={result}
                                        query={query}
                                        onClick={handleResultClick}
                                        isSemanticMode={searchMode === 'semantic'}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SearchModal;
