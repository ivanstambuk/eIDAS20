/**
 * Custom hook to detect the type of navigation that brought the user to the current page.
 * 
 * Uses the Performance Navigation API to distinguish between:
 * - Back/Forward button navigation
 * - Regular navigation (link clicks, URL changes)
 * - Page reload
 * 
 * @returns {Object} Navigation information
 * @returns {string} navigationType - One of: 'navigate', 'reload', 'back_forward', 'prerender'
 * @returns {boolean} isBackForward - True if user arrived via browser back/forward buttons
 * 
 * @example
 * const { isBackForward, navigationType } = useNavigationType();
 * 
 * if (isBackForward) {
 *   // Restore scroll position
 * } else {
 *   // Start at top
 * }
 */
export function useNavigationType() {
    const navigationEntries = performance.getEntriesByType('navigation');
    const navigationType = navigationEntries.length > 0
        ? navigationEntries[0].type
        : 'navigate';

    const isBackForward = navigationType === 'back_forward';

    return {
        navigationType,
        isBackForward
    };
}
