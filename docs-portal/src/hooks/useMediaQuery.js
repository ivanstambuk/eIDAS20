import { useState, useEffect } from 'react';

/**
 * useMediaQuery - React hook for responsive design
 * 
 * @param {string} query - Media query string, e.g. '(max-width: 768px)'
 * @returns {boolean} - Whether the media query matches
 * 
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        // Check if window exists (SSR safety)
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);

        // Update state if query changes
        setMatches(mediaQuery.matches);

        // Handler for media query changes
        const handler = (event) => setMatches(event.matches);

        // Modern API
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handler);
            return () => mediaQuery.removeListener(handler);
        }
    }, [query]);

    return matches;
}

/**
 * useIsMobile - Convenience hook for mobile detection
 * @returns {boolean}
 */
export function useIsMobile() {
    return useMediaQuery('(max-width: 768px)');
}

export default useMediaQuery;
