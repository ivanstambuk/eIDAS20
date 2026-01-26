import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing theme state (light/dark).
 * 
 * Features:
 * - Persists user preference to localStorage
 * - Respects system preference (prefers-color-scheme) on first visit
 * - Toggles .light class on document.documentElement
 * - Updates meta theme-color for mobile browsers
 * 
 * @returns {{ theme: 'light' | 'dark', toggleTheme: () => void, setTheme: (theme: 'light' | 'dark') => void }}
 */
export function useTheme() {
    const [theme, setThemeState] = useState(() => {
        // Check localStorage for explicitly saved user preference
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('eidas-theme');
            if (stored === 'light' || stored === 'dark') {
                return stored;
            }
        }
        // Always default to dark (ignore system preference)
        return 'dark';
    });

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'light') {
            root.classList.add('light');
        } else {
            root.classList.remove('light');
        }

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'light' ? '#ffffff' : '#0d1117');
        }

        // Persist to localStorage
        localStorage.setItem('eidas-theme', theme);
    }, [theme]);



    const toggleTheme = useCallback(() => {
        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    const setTheme = useCallback((newTheme) => {
        if (newTheme === 'light' || newTheme === 'dark') {
            setThemeState(newTheme);
        }
    }, []);

    return { theme, toggleTheme, setTheme };
}

export default useTheme;
