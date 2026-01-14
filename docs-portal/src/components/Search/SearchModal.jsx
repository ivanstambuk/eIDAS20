/**
 * Search Modal Component
 * 
 * Full-screen search overlay with instant results
 */

import { useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
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
function SearchResult({ result, query, onClick }) {
    const getDocUrl = () => {
        const baseType = result.type === 'regulation' ? 'regulation' : 'implementing-acts';
        const hash = result.section ? `#${result.section.toLowerCase().replace(/\s+/g, '-')}` : '';
        return `/${baseType}/${result.slug}${hash}`;
    };

    return (
        <Link
            to={getDocUrl()}
            className="search-result"
            onClick={onClick}
        >
            <div className="search-result-header">
                <span className={`search-result-type ${result.type}`}>
                    {result.type === 'regulation' ? '📜' : '📋'} {result.docTitle}
                </span>
                <span className="search-result-section">
                    {result.section}
                </span>
            </div>
            <div className="search-result-title">
                {highlightTerms(result.sectionTitle, query)}
            </div>
            <div className="search-result-snippet">
                {highlightTerms(getSnippet(result.content, query), query)}
            </div>
        </Link>
    );
}

/**
 * Main Search Modal
 */
export function SearchModal({ isOpen, onClose }) {
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const {
        isLoading,
        isSearching,
        isReady,
        error,
        query,
        results,
        search,
        clearSearch
    } = useSearch();

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Close on Escape
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }

            // Open search on Cmd/Ctrl + K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (!isOpen) {
                    // Parent component should handle this
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Handle result click
    const handleResultClick = useCallback(() => {
        onClose();
        clearSearch();
    }, [onClose, clearSearch]);

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="search-modal-backdrop" onClick={handleBackdropClick}>
            <div className="search-modal">
                {/* Search input */}
                <div className="search-modal-header">
                    <div className="search-input-wrapper">
                        <svg
                            className="search-input-icon"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            className="search-modal-input"
                            placeholder="Search regulations, articles, terms..."
                            value={query}
                            onChange={(e) => search(e.target.value)}
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                        {query && (
                            <button
                                className="search-clear-btn"
                                onClick={clearSearch}
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

                {/* Search results */}
                <div className="search-modal-body">
                    {isLoading && (
                        <div className="search-status">
                            <div className="search-spinner" />
                            <span>Loading search index...</span>
                        </div>
                    )}

                    {error && (
                        <div className="search-status search-error">
                            <span>⚠️ {error}</span>
                        </div>
                    )}

                    {!isLoading && !error && !query && (
                        <div className="search-status search-hint">
                            <p>Start typing to search across all eIDAS regulations and implementing acts.</p>
                            <div className="search-tips">
                                <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
                                <span><kbd>Enter</kbd> Open</span>
                                <span><kbd>ESC</kbd> Close</span>
                            </div>
                        </div>
                    )}

                    {!isLoading && query && results.length === 0 && !isSearching && (
                        <div className="search-status">
                            <span>No results found for "{query}"</span>
                        </div>
                    )}

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
