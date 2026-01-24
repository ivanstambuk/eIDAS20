/**
 * Data fetching utility with cache-busting for production deployments.
 * 
 * During development, the Vite no-cache plugin handles this.
 * For production (GitHub Pages), we append a version query parameter
 * derived from the build timestamp to ensure browsers fetch fresh data
 * after deployments.
 */

// Cache the version to avoid refetching metadata for every data request
let cachedVersion = null;
let versionPromise = null;

/**
 * Get the build version from metadata.json
 * This is used as a cache-buster query parameter
 */
async function getBuildVersion() {
    if (cachedVersion) return cachedVersion;

    if (versionPromise) return versionPromise;

    versionPromise = (async () => {
        try {
            const response = await fetch(`${import.meta.env.BASE_URL}data/metadata.json`);
            if (response.ok) {
                const metadata = await response.json();
                // Use build timestamp as version, fallback to current time
                cachedVersion = metadata.lastBuildTime
                    ? new Date(metadata.lastBuildTime).getTime().toString(36)
                    : Date.now().toString(36);
            } else {
                cachedVersion = Date.now().toString(36);
            }
        } catch {
            cachedVersion = Date.now().toString(36);
        }
        return cachedVersion;
    })();

    return versionPromise;
}

/**
 * Fetch a data file with cache-busting version parameter.
 * 
 * @param {string} filename - The filename in public/data/ (e.g., 'terminology.json')
 * @returns {Promise<Response>} The fetch response
 * 
 * @example
 * const response = await fetchData('terminology.json');
 * const data = await response.json();
 */
export async function fetchData(filename) {
    const version = await getBuildVersion();
    const url = `${import.meta.env.BASE_URL}data/${filename}?v=${version}`;
    return fetch(url);
}

/**
 * Build a data URL with cache-busting version parameter.
 * Use this when you need the URL string rather than fetching directly.
 * 
 * @param {string} filename - The filename in public/data/
 * @returns {Promise<string>} The URL with version parameter
 */
export async function getDataUrl(filename) {
    const version = await getBuildVersion();
    return `${import.meta.env.BASE_URL}data/${filename}?v=${version}`;
}

/**
 * Synchronous version that uses cached version (returns base URL if not yet loaded).
 * Useful for initial render when async isn't possible.
 * 
 * @param {string} filename - The filename in public/data/
 * @returns {string} The URL (with version if available, without if not yet cached)
 */
export function getDataUrlSync(filename) {
    const base = `${import.meta.env.BASE_URL}data/${filename}`;
    return cachedVersion ? `${base}?v=${cachedVersion}` : base;
}
