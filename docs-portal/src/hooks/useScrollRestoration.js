/**
 * Shared scroll position save/restore hook for SPA navigation.
 * 
 * ## The Problem
 * 
 * In SPAs, `window.scrollTo()` can silently fail if called before the DOM
 * has enough content height. This happens because:
 * 1. React re-renders the component when navigating back
 * 2. The useEffect fires before content is fully rendered
 * 3. `scrollTo(0, 1200)` is called when document height is only 500px
 * 4. Browser silently clamps to max scrollable height (0)
 * 
 * ## The Solution
 * 
 * This hook uses a **polling approach**: wait until `scrollHeight > targetY + innerHeight`
 * before scrolling, retrying via requestAnimationFrame.
 * 
 * ## Usage
 * 
 * ```javascript
 * import { useScrollRestoration } from '../hooks/useScrollRestoration';
 * 
 * const MyPage = () => {
 *     const [loading, setLoading] = useState(true);
 *     const [data, setData] = useState(null);
 *     
 *     const { saveScrollPosition } = useScrollRestoration({
 *         storageKey: 'myPage_scrollY',
 *         ready: !loading && data !== null,  // When content is ready
 *         hasDeepLink: !!searchParams.get('section')  // Skip if deep linking
 *     });
 *     
 *     // Wire up save to link clicks
 *     return <Link onClick={saveScrollPosition}>...</Link>;
 * };
 * ```
 * 
 * @module hooks/useScrollRestoration
 */

import { useEffect, useCallback } from 'react';
import { useNavigationType } from 'react-router-dom';
import { trace } from '../utils/trace';

/**
 * @typedef {Object} ScrollRestorationOptions
 * @property {string} storageKey - sessionStorage key for this page's scroll position
 * @property {boolean} ready - Whether the page content is loaded and ready for scrolling
 * @property {boolean} [hasDeepLink=false] - If true, skip restoration (deep link takes precedence)
 * @property {number} [maxAttempts=10] - Max polling attempts before giving up
 */

/**
 * @typedef {Object} ScrollRestorationResult
 * @property {() => void} saveScrollPosition - Call this before navigating away
 * @property {boolean} isBackForward - Whether this is a back/forward navigation
 */

/**
 * Hook for saving and restoring scroll position across SPA navigations.
 * 
 * ⚠️ DOM Height Timing Issue
 * ---------------------------
 * This hook solves the "DOM height timing" problem where `window.scrollTo()` fails
 * because content hasn't rendered yet. It polls `document.documentElement.scrollHeight`
 * until it's tall enough to scroll to the saved position.
 * 
 * @param {ScrollRestorationOptions} options
 * @returns {ScrollRestorationResult}
 */
export function useScrollRestoration({ storageKey, ready, hasDeepLink = false, maxAttempts = 10 }) {
    // Navigation Type Detection Pattern
    // Uses React Router's useNavigationType() hook to distinguish between:
    //   - 'POP':     Back/forward button navigation → Restore scroll position
    //   - 'PUSH':    Link click navigation         → Start at top (or deep link)
    //   - 'REPLACE': Replace navigation            → Start at top
    const navigationType = useNavigationType();
    const isBackForward = navigationType === 'POP';

    // Restore scroll position when content is ready
    useEffect(() => {
        if (!ready) return;

        const savedScrollY = sessionStorage.getItem(storageKey);

        // Trace for debugging (zero-cost when disabled)
        trace('scroll:restore', {
            storageKey,
            navigationType,
            isBackForward,
            hasDeepLink,
            savedScrollY,
            scrollHeight: document.documentElement.scrollHeight
        });

        // Only restore if: no deep link AND navigating via back/forward AND has saved position
        if (!hasDeepLink && isBackForward && savedScrollY) {
            const scrollY = parseInt(savedScrollY, 10);
            trace('scroll:restore', 'Attempting to restore to', scrollY);

            // Polling approach: wait for DOM to have enough height before scrolling
            // This handles the timing issue where content isn't rendered yet
            let attempts = 0;
            const checkAndScroll = () => {
                attempts++;
                const scrollHeight = document.documentElement.scrollHeight;
                const viewportHeight = window.innerHeight;
                const canScroll = scrollHeight > scrollY + viewportHeight;

                trace('scroll:restore', `Attempt ${attempts}/${maxAttempts}`, {
                    scrollHeight,
                    targetY: scrollY,
                    viewportHeight,
                    canScroll
                });

                if (canScroll) {
                    window.scrollTo(0, scrollY);
                    sessionStorage.removeItem(storageKey);
                    trace('scroll:restore', 'SUCCESS - scrolled to', scrollY, 'actual:', window.scrollY);
                } else if (attempts < maxAttempts) {
                    // Content not tall enough yet, retry after a frame
                    requestAnimationFrame(checkAndScroll);
                } else {
                    // Give up after max attempts, still clean up storage
                    trace('scroll:restore', 'GAVE UP after', maxAttempts, 'attempts');
                    sessionStorage.removeItem(storageKey);
                }
            };

            // Start the polling after initial paint (double-RAF pattern)
            requestAnimationFrame(() => {
                requestAnimationFrame(checkAndScroll);
            });
        } else if (!isBackForward && savedScrollY) {
            // Manual navigation (not back/forward), clear saved position
            trace('scroll:restore', 'Manual navigation, clearing saved position');
            sessionStorage.removeItem(storageKey);
        }
    }, [ready, hasDeepLink, isBackForward, navigationType, storageKey, maxAttempts]);

    // Save scroll position before navigating away
    const saveScrollPosition = useCallback(() => {
        const scrollY = window.scrollY;
        trace('scroll:save', `Saving position to ${storageKey}:`, scrollY);
        sessionStorage.setItem(storageKey, scrollY.toString());
    }, [storageKey]);

    return {
        saveScrollPosition,
        isBackForward
    };
}
