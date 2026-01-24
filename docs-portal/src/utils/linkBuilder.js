/**
 * Centralized Link Builder for eIDAS 2.0 Portal
 * 
 * This is the SINGLE SOURCE OF TRUTH for generating portal URLs.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ CRITICAL: HashRouter URL Format
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This portal uses React Router's HashRouter, which means:
 * 
 * 1. Browser URLs look like: https://example.com/#/regulation/2014-910
 *    The # is the "hash" separator, and /regulation/... is the "route"
 * 
 * 2. For INTERNAL navigation (<Link to={...}>):
 *    Use: /regulation/2014-910?section=article-5a
 *    React Router handles adding the # automatically
 * 
 * 3. For EXTERNAL sharing (clipboard, raw href in templates):
 *    Use: #/regulation/2014-910?section=article-5a
 *    OR full: https://example.com/#/regulation/2014-910?section=article-5a
 * 
 * 4. NEVER use HTML fragment anchors like /regulation/2014-910#article-5a
 *    This BREAKS with HashRouter because # has special meaning!
 *    Use ?section=article-5a instead.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * DEC-226: Centralized Link Builder
 * Consolidates scattered link generation from 10+ files into one utility.
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Map document types to URL path segments
 */
const DOC_TYPE_TO_PATH = {
    'regulation': 'regulation',
    'implementing-act': 'implementing-acts',
    'implementing_regulation': 'implementing-acts',
    'implementing_act': 'implementing-acts',
    'directive': 'regulation',       // Directives use regulation route
    'decision': 'regulation',        // Decisions use regulation route
    'recommendation': 'regulation',  // Recommendations use regulation route
};

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL LINKS (for React Router <Link to={...}>)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build a link to a regulation or implementing act.
 * 
 * @param {string} slug - Document slug (e.g., '2014-910', '2024-1183')
 * @param {Object} [options] - Link options
 * @param {string} [options.section] - Section ID to scroll to (e.g., 'article-5a')
 * @param {string} [options.type='regulation'] - Document type for correct path
 * @returns {string} Relative URL for React Router <Link to={...}>
 * 
 * @example
 * buildDocumentLink('2014-910')
 * // => '/regulation/2014-910'
 * 
 * buildDocumentLink('2014-910', { section: 'article-5a' })
 * // => '/regulation/2014-910?section=article-5a'
 * 
 * buildDocumentLink('2024-1183', { type: 'implementing-act' })
 * // => '/implementing-acts/2024-1183'
 */
export function buildDocumentLink(slug, options = {}) {
    const { section, type = 'regulation' } = options;
    const basePath = DOC_TYPE_TO_PATH[type] || 'regulation';

    const params = new URLSearchParams();
    if (section) params.set('section', section);

    const queryString = params.toString();
    return `/${basePath}/${slug}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Build a link to the Terminology page.
 * 
 * @param {Object} [options] - Link options
 * @param {string} [options.termId] - Term ID to scroll to (adds ?section=term-{id})
 * @param {string} [options.section] - Raw section ID (alternative to termId)
 * @param {string} [options.scrollTo] - Letter to scroll to (e.g., 'A')
 * @returns {string} Relative URL for React Router <Link to={...}>
 * 
 * @example
 * buildTerminologyLink()
 * // => '/terminology'
 * 
 * buildTerminologyLink({ termId: 'electronic-signature' })
 * // => '/terminology?section=term-electronic-signature'
 */
export function buildTerminologyLink(options = {}) {
    const { termId, section, scrollTo } = options;

    const params = new URLSearchParams();
    if (termId) params.set('section', `term-${termId}`);
    else if (section) params.set('section', section);
    if (scrollTo) params.set('scrollTo', scrollTo);

    const queryString = params.toString();
    return `/terminology${queryString ? `?${queryString}` : ''}`;
}

/**
 * Build a link to the RCA (Compliance Assessment) tool.
 * 
 * @param {Object} [options] - Filter options
 * @param {string} [options.role] - Role filter
 * @param {string} [options.profile] - Profile filter
 * @param {string} [options.useCase] - Use case filter
 * @param {string} [options.req] - Specific requirement ID to highlight
 * @returns {string} Relative URL for React Router <Link to={...}>
 */
export function buildRCALink(options = {}) {
    const { role, profile, useCase, req } = options;

    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (profile) params.set('profile', profile);
    if (useCase) params.set('useCase', useCase);
    if (req) params.set('req', req);

    const queryString = params.toString();
    return `/rca${queryString ? `?${queryString}` : ''}`;
}

/**
 * Build a link to the VCQ (Vendor Questionnaire) tool.
 * 
 * @returns {string} Relative URL
 */
export function buildVCQLink() {
    return '/vcq';
}

/**
 * Build a link to the Requirements Browser.
 * 
 * @param {Object} [options] - Filter options
 * @param {string} [options.sources] - Comma-separated sources (e.g., 'rca,vcq,arf')
 * @param {string} [options.roles] - Comma-separated roles
 * @param {string} [options.id] - Specific requirement ID
 * @returns {string} Relative URL
 */
export function buildRequirementsLink(options = {}) {
    const { sources, roles, id, q } = options;

    const params = new URLSearchParams();
    if (sources) params.set('sources', sources);
    if (roles) params.set('roles', roles);
    if (id) params.set('id', id);
    if (q) params.set('q', q);

    const queryString = params.toString();
    return `/requirements${queryString ? `?${queryString}` : ''}`;
}

/**
 * Build a link to the Ecosystem Guide.
 * 
 * @param {Object} [options] - Options
 * @param {string} [options.section] - Section anchor
 * @returns {string} Relative URL
 */
export function buildEcosystemGuideLink(options = {}) {
    const { section } = options;
    const params = new URLSearchParams();
    if (section) params.set('section', section);
    const queryString = params.toString();
    return `/ecosystem-guide${queryString ? `?${queryString}` : ''}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTERNAL LINKS (for clipboard, raw href, templates)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert an internal link to a raw href suitable for HTML templates.
 * 
 * Use this when building href strings for template literals (e.g., in 
 * popover templates). The returned string starts with # for HashRouter.
 * 
 * @param {string} internalPath - Path from buildDocumentLink() etc.
 * @returns {string} Href string starting with #
 * 
 * @example
 * toHref(buildDocumentLink('2014-910', { section: 'article-5a' }))
 * // => '#/regulation/2014-910?section=article-5a'
 */
export function toHref(internalPath) {
    // Ensure path starts with /
    const cleanPath = internalPath.startsWith('/') ? internalPath : `/${internalPath}`;
    return `#${cleanPath}`;
}

/**
 * Build a full absolute URL for external sharing (clipboard, emails).
 * 
 * @param {string} internalPath - Path from buildDocumentLink() etc.
 * @returns {string} Full absolute URL with origin and hash
 * 
 * @example
 * toExternalUrl(buildDocumentLink('2014-910', { section: 'article-5a' }))
 * // => 'https://example.com/eIDAS20/#/regulation/2014-910?section=article-5a'
 */
export function toExternalUrl(internalPath) {
    if (typeof window === 'undefined') {
        // Build-time fallback - just return the href format
        return toHref(internalPath);
    }

    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return `${baseUrl}${toHref(internalPath)}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION ID BUILDERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse compound paragraph formats like "1(b)", "1(a)(ii)", "1-2".
 * 
 * @param {string|number} paragraph - Paragraph string or number
 * @returns {{ para: string|null, point: string|null, subpoint: string|null }}
 */
export function parseParagraph(paragraph) {
    if (!paragraph) return { para: null, point: null, subpoint: null };
    const str = String(paragraph);

    // Match: number (with optional letter suffix), optional point, optional subpoint
    // Examples: "1", "1a", "1(b)", "2(g)", "1(a)(ii)", "1-2"
    const match = str.match(
        /^(\d+[a-z]?(?:\s*[-–—]\s*\d+[a-z]?)?)(?:\s*\(\s*([a-z])\s*\))?(?:\s*\(\s*([ivxlcdm]+)\s*\))?$/i
    );

    if (match) {
        return {
            para: match[1] ? match[1].split(/[-–—]/)[0].trim() : null,
            point: match[2] ? match[2].toLowerCase() : null,
            subpoint: match[3] ? match[3].toLowerCase() : null
        };
    }

    // Fallback: treat whole string as paragraph number
    return { para: str.split(/[-–—]/)[0].trim(), point: null, subpoint: null };
}

/**
 * Build a section ID anchor from article/paragraph components.
 * 
 * This generates the ID format used by rehype-paragraph-ids.js in the
 * HTML content, matching the convention documented in AGENTS.md.
 * 
 * @param {string} article - Article reference (e.g., 'Article 5a', 'Annex I')
 * @param {string|Object} [paragraph] - Paragraph number or parsed object
 * @returns {string} Section ID for use in ?section= parameter
 * 
 * @example
 * buildSectionId('Article 5a')
 * // => 'article-5a'
 * 
 * buildSectionId('Article 5a', '1')
 * // => 'article-5a-para-1'
 * 
 * buildSectionId('Article 5a', '1(b)')
 * // => 'article-5a-para-1-point-b'
 * 
 * buildSectionId('Article 5a', '1(a)(ii)')
 * // => 'article-5a-para-1-point-a-subpoint-ii'
 * 
 * buildSectionId('Annex I', '3')
 * // => 'annex-i-para-3'
 */
export function buildSectionId(article, paragraph = null) {
    // Convert article to ID format: "Article 5a" -> "article-5a"
    let id = article.toLowerCase().replace(/\s+/g, '-');

    if (paragraph) {
        // Parse if string, otherwise assume already parsed
        const parsed = typeof paragraph === 'string'
            ? parseParagraph(paragraph)
            : paragraph;

        if (parsed.para) id += `-para-${parsed.para}`;
        if (parsed.point) id += `-point-${parsed.point}`;
        if (parsed.subpoint) id += `-subpoint-${parsed.subpoint}`;
    }

    return id;
}

/**
 * Build a complete document link with section from article/paragraph.
 * 
 * Convenience function combining buildSectionId + buildDocumentLink.
 * 
 * @param {string} slug - Document slug
 * @param {string} article - Article reference
 * @param {string} [paragraph] - Paragraph number
 * @param {Object} [options] - Additional options (type)
 * @returns {string} Complete relative URL
 * 
 * @example
 * buildArticleLink('2014-910', 'Article 5a', '1(b)')
 * // => '/regulation/2014-910?section=article-5a-para-1-point-b'
 */
export function buildArticleLink(slug, article, paragraph = null, options = {}) {
    const section = buildSectionId(article, paragraph);
    return buildDocumentLink(slug, { section, ...options });
}

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY COMPATIBILITY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate deep link URL for external sharing.
 * 
 * @deprecated Use toExternalUrl(buildDocumentLink(...)) instead.
 * Kept for backward compatibility with useCopyReference.js
 * 
 * @param {string} headingId - Section ID
 * @param {string} slug - Document slug
 * @returns {string} Full external URL
 */
export function generateDeepLink(headingId, slug) {
    return toExternalUrl(buildDocumentLink(slug, { section: headingId }));
}
