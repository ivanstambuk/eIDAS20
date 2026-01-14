import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component - resets scroll position on route navigation.
 * 
 * This fixes a common SPA issue where navigating between routes preserves
 * the scroll position from the previous page. This is especially noticeable
 * when scrolling down a list page (e.g., Implementing Acts) and then clicking
 * a sidebar link to a different page.
 * 
 * The component:
 * 1. Listens to pathname changes (ignores hash changes for anchor links)
 * 2. Scrolls the main content area to top when pathname changes
 * 3. Also scrolls window to top as fallback
 * 
 * Note: We use pathname only (not hash) because hash changes should scroll
 * to the anchor element, not reset to top.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll main content container to top
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTo(0, 0);
        }

        // Also scroll window to top (fallback for different layouts)
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
