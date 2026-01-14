import { useMemo, useState, useEffect, createContext, useContext } from 'react';
import { TermPopover } from '../TermPopover';

// Context to provide terminology data to child components
const TerminologyContext = createContext(null);

/**
 * TerminologyProvider - Loads and provides terminology data
 */
export function TerminologyProvider({ children }) {
    const [terminology, setTerminology] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTerminology = async () => {
            try {
                const response = await fetch(`${import.meta.env.BASE_URL}data/terminology.json`);
                if (!response.ok) throw new Error('Failed to load terminology');
                const data = await response.json();
                setTerminology(data);
            } catch (err) {
                console.warn('Terminology not loaded:', err.message);
            } finally {
                setLoading(false);
            }
        };
        loadTerminology();
    }, []);

    return (
        <TerminologyContext.Provider value={{ terminology, loading }}>
            {children}
        </TerminologyContext.Provider>
    );
}

/**
 * useTerminology - Hook to access terminology data
 */
export function useTerminology() {
    return useContext(TerminologyContext);
}

/**
 * TermHighlighter - Highlights and adds popovers to recognized terms in text content
 * 
 * This component processes text content and wraps recognized terminology terms
 * with TermPopover components to show definitions on hover.
 * 
 * Props:
 * - content: String content to process (plain text, not HTML)
 * - enabled: Boolean to enable/disable highlighting (default: true)
 */
export function TermHighlighter({ content, enabled = true }) {
    const { terminology, loading } = useTerminology();

    // Build a map of terms for quick lookup (case-insensitive)
    const termMap = useMemo(() => {
        if (!terminology) return new Map();
        const map = new Map();
        for (const term of terminology.terms) {
            // Store by lowercase for case-insensitive matching
            map.set(term.term.toLowerCase(), term);
        }
        return map;
    }, [terminology]);

    // Build regex pattern matching all terms
    const termPattern = useMemo(() => {
        if (!terminology || termMap.size === 0) return null;
        // Sort by length descending to match longer terms first
        const sortedTerms = Array.from(termMap.keys()).sort((a, b) => b.length - a.length);
        // Escape special regex characters
        const escaped = sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        // Build pattern with word boundaries
        return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
    }, [terminology, termMap]);

    // Process content and return React elements
    const processed = useMemo(() => {
        if (!content || !enabled || loading || !termPattern) {
            return content;
        }

        const parts = [];
        let lastIndex = 0;
        let match;

        // Reset regex state
        termPattern.lastIndex = 0;

        while ((match = termPattern.exec(content)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                parts.push(content.slice(lastIndex, match.index));
            }

            // Get the term data
            const matchedText = match[0];
            const term = termMap.get(matchedText.toLowerCase());

            if (term) {
                parts.push(
                    <TermPopover key={`${term.id}-${match.index}`} term={term}>
                        {matchedText}
                    </TermPopover>
                );
            } else {
                parts.push(matchedText);
            }

            lastIndex = termPattern.lastIndex;
        }

        // Add remaining text
        if (lastIndex < content.length) {
            parts.push(content.slice(lastIndex));
        }

        return parts;
    }, [content, enabled, loading, termPattern, termMap]);

    return <>{processed}</>;
}

export default TermHighlighter;
