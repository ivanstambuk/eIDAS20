/**
 * rehype-term-links
 * 
 * A rehype plugin that automatically links defined terminology terms in 
 * regulation content to enable hover popovers showing definitions.
 * 
 * This plugin:
 * 1. Loads terminology data (terms and their IDs)
 * 2. Walks the HTML AST looking for text nodes
 * 3. Skips exempt sections (definitions articles - they define the terms)
 * 4. Wraps matched terms with <span class="term-link" data-term-id="...">
 * 
 * The span elements are hydrated at runtime by RegulationViewer.jsx to show
 * TermPopover on hover.
 * 
 * DEC-085: Terminology Cross-Linking
 * 
 * @see .agent/plans/terminology-highlighting.md for full implementation plan
 */

import { visitParents } from 'unist-util-visit-parents';

/**
 * Extract text content from a HAST node recursively.
 */
function getTextContent(node) {
    if (node.type === 'text') {
        return node.value;
    }
    if (node.children) {
        return node.children.map(getTextContent).join('');
    }
    return '';
}

/**
 * Build a map of terms for quick lookup.
 * Key: normalized term (lowercase), Value: term object with id
 * 
 * Also generates:
 * - Plural variants for each term
 * - Hyphen↔space variants (EU legal uses both "wallet-relying party" and "wallet relying party")
 */
function buildTermMap(terminology) {
    const map = new Map();

    if (!terminology || !terminology.terms) {
        return map;
    }

    /**
     * Helper: Add a term variant to the map if not already present.
     * @param {string} variant - The normalized variant string
     * @param {object} data - The term data to associate
     */
    function addVariant(variant, data) {
        if (!map.has(variant)) {
            map.set(variant, data);
        }
    }

    /**
     * Helper: Generate hyphen↔space variant.
     * EU legal documents use both forms interchangeably:
     * - "wallet-relying party" (compound modifier, hyphenated)
     * - "wallet relying party" (prose context, spaced)
     */
    function getHyphenSpaceVariant(term) {
        if (term.includes('-')) {
            return term.replace(/-/g, ' ');
        }
        return null; // No variant needed for non-hyphenated terms
    }

    for (const term of terminology.terms) {
        const normalizedTerm = term.term.toLowerCase();
        const termData = {
            id: term.id,
            originalTerm: term.term
        };

        // Store the base term
        map.set(normalizedTerm, termData);

        // Add hyphen→space variant for base term
        const spaceVariant = getHyphenSpaceVariant(normalizedTerm);
        if (spaceVariant) {
            addVariant(spaceVariant, { ...termData, isHyphenVariant: true });
        }

        // Generate plural variant
        // Simple English pluralization: add 's' or 'es'
        let plural;
        if (normalizedTerm.endsWith('s') || normalizedTerm.endsWith('x') ||
            normalizedTerm.endsWith('ch') || normalizedTerm.endsWith('sh')) {
            plural = normalizedTerm + 'es';
        } else if (normalizedTerm.endsWith('y') &&
            !['a', 'e', 'i', 'o', 'u'].includes(normalizedTerm.charAt(normalizedTerm.length - 2))) {
            // consonant + y → ies (e.g., "body" → "bodies")
            plural = normalizedTerm.slice(0, -1) + 'ies';
        } else {
            plural = normalizedTerm + 's';
        }

        // Add plural if different and not already a term
        if (plural !== normalizedTerm) {
            addVariant(plural, {
                id: term.id,
                originalTerm: term.term,
                isPlural: true
            });

            // Also add hyphen→space variant for plural
            const pluralSpaceVariant = getHyphenSpaceVariant(plural);
            if (pluralSpaceVariant) {
                addVariant(pluralSpaceVariant, {
                    id: term.id,
                    originalTerm: term.term,
                    isPlural: true,
                    isHyphenVariant: true
                });
            }
        }

        // Add abbreviation aliases (QEAA, TSP, etc.)
        // These are loaded from abbreviations.yaml and attached to terms by build-terminology.js
        if (term.aliases && Array.isArray(term.aliases)) {
            for (const alias of term.aliases) {
                const normalizedAlias = alias.toLowerCase();
                addVariant(normalizedAlias, {
                    id: term.id,
                    originalTerm: term.term,
                    isAlias: true,
                    aliasFrom: alias
                });
            }
        }
    }

    return map;
}

/**
 * Build a regex pattern that matches all terms.
 * Terms are sorted by length (descending) so longer terms match first.
 * This prevents "trust service" from matching inside "qualified trust service provider".
 */
function buildTermPattern(termMap) {
    if (termMap.size === 0) {
        return null;
    }

    // Get all terms and sort by length descending
    const terms = Array.from(termMap.keys()).sort((a, b) => b.length - a.length);

    // Escape special regex characters in each term
    const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    // Build pattern with word boundaries, case-insensitive
    // Use non-capturing group for efficiency
    return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
}

/**
 * Check if the current context is within a definitions article.
 * Definitions articles should be exempt from term linking (circular references).
 * 
 * Detection heuristics (from build-terminology.js):
 * 1. H3 with id containing "definitions" 
 * 2. Bold **Definitions** subheading after article
 * 3. Text "following definitions apply"
 */
function isInDefinitionsSection(ancestors, definitionsContext) {
    return definitionsContext.inDefinitions;
}

/**
 * Check if a heading indicates a definitions section.
 */
function isDefinitionsHeading(node) {
    if (node.type !== 'element') return false;

    // Check heading elements
    if (['h2', 'h3', 'h4'].includes(node.tagName)) {
        const text = getTextContent(node).toLowerCase();
        const id = node.properties?.id || '';

        // Pattern 1: ID contains "definitions"
        if (id.includes('definitions')) return true;

        // Pattern 2: Text IS "Definitions" (exact match for bold subheading)
        if (text.trim() === 'definitions') return true;

        // Pattern 3: Article heading with "Definitions" suffix
        // e.g., "Article 2 - Definitions" or "Article 3 — Definitions"
        if (/article\s+\d+\w?\s*[-—]\s*definitions/i.test(text)) return true;
    }

    // Check for bold <strong> containing just "Definitions"
    if (node.tagName === 'strong' || node.tagName === 'b') {
        const text = getTextContent(node).toLowerCase().trim();
        if (text === 'definitions') return true;
    }

    return false;
}

/**
 * Check if we should skip this text node entirely.
 * Skip: headings, citations, already-linked terms, code blocks
 */
function shouldSkipNode(ancestors) {
    for (const ancestor of ancestors) {
        if (ancestor.type !== 'element') continue;

        const tag = ancestor.tagName;
        const className = ancestor.properties?.className || [];

        // Skip headings (h1-h6)
        if (/^h[1-6]$/.test(tag)) return true;

        // Skip code blocks and inline code
        if (tag === 'code' || tag === 'pre') return true;

        // Skip existing term links (prevent double-processing)
        if (className.includes('term-link')) return true;

        // Skip citation references (they have their own styling)
        if (className.includes('citation-ref')) return true;

        // Skip links (don't nest interactive elements)
        if (tag === 'a') return true;
    }

    return false;
}

/**
 * Replace text node with a mix of text and span elements for matched terms.
 * 
 * @param {Object} node - The text node to process
 * @param {Object} parent - The parent element
 * @param {RegExp} pattern - The term matching regex
 * @param {Map} termMap - Map of normalized terms to term data
 * @returns {Array} Array of replacement nodes (text and element nodes)
 */
function processTextNode(node, pattern, termMap) {
    const text = node.value;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Reset regex state
    pattern.lastIndex = 0;

    while ((match = pattern.exec(text)) !== null) {
        const matchedText = match[0];
        const normalizedMatch = matchedText.toLowerCase();
        const termData = termMap.get(normalizedMatch);

        if (!termData) continue;

        // Add text before the match
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                value: text.slice(lastIndex, match.index)
            });
        }

        // Add the term link span
        parts.push({
            type: 'element',
            tagName: 'span',
            properties: {
                className: ['term-link'],
                'data-term-id': termData.id,
                tabIndex: 0
            },
            children: [{
                type: 'text',
                value: matchedText  // Preserve original case from document
            }]
        });

        lastIndex = pattern.lastIndex;
    }

    // Add remaining text after last match
    if (lastIndex < text.length) {
        parts.push({
            type: 'text',
            value: text.slice(lastIndex)
        });
    }

    return parts.length > 0 ? parts : null;
}

/**
 * The main rehype plugin function.
 * 
 * @param {Object} options - Plugin options
 * @param {Object} options.terminology - The terminology.json data
 */
export default function rehypeTermLinks(options = {}) {
    const { terminology } = options;

    // Build term matching structures
    const termMap = buildTermMap(terminology);
    const termPattern = buildTermPattern(termMap);

    // No terms to match
    if (!termPattern) {
        return () => { };
    }

    return (tree) => {
        // First pass: collect all sections and mark which are definitions
        // A definitions section is Article 2 or Article 3 followed by **Definitions**
        const sectionInfo = new Map(); // heading id -> { isDefinitions: boolean }
        let lastArticleId = null;
        let pendingDefinitionsCheck = false;

        visitParents(tree, 'element', (node) => {
            if (node.tagName === 'h3' && node.properties?.id?.startsWith('article-')) {
                lastArticleId = node.properties.id;
                pendingDefinitionsCheck = true;
                sectionInfo.set(lastArticleId, { isDefinitions: false });
            } else if (pendingDefinitionsCheck && lastArticleId) {
                // Check for **Definitions** - could be <strong> directly or inside <p>
                if (node.tagName === 'strong' || node.tagName === 'b') {
                    const text = getTextContent(node).toLowerCase().trim();
                    if (text === 'definitions') {
                        sectionInfo.set(lastArticleId, { isDefinitions: true });
                        pendingDefinitionsCheck = false;
                    }
                } else if (node.tagName === 'p') {
                    // Check if the p contains <strong>Definitions</strong>
                    const text = getTextContent(node).toLowerCase().trim();
                    if (text === 'definitions') {
                        sectionInfo.set(lastArticleId, { isDefinitions: true });
                        pendingDefinitionsCheck = false;
                    } else if (!text.includes('definitions')) {
                        // This p doesn't contain Definitions, stop looking
                        pendingDefinitionsCheck = false;
                    }
                } else if (node.tagName === 'ul' || node.tagName === 'ol') {
                    // Once we hit list content, stop looking for Definitions heading
                    pendingDefinitionsCheck = false;
                }
            }
        });

        // Track nodes to replace (can't modify during traversal)
        const replacements = [];

        // Second pass: find and mark term matches
        visitParents(tree, (node, ancestors) => {
            // Only process text nodes
            if (node.type !== 'text') return;

            // Skip if in exempt node types (headings, code, etc.)
            if (shouldSkipNode(ancestors)) return;

            // Process the text node
            const parts = processTextNode(node, termPattern, termMap);
            // parts.length > 0 means we found matches
            // parts.length === 1 means the entire text is a single term
            // parts.length > 1 means we have mixed text and terms
            if (parts && parts.length > 0) {
                // Mark for replacement
                const parent = ancestors[ancestors.length - 1];
                replacements.push({ node, parent, parts });
            }
        });

        // Apply replacements
        for (const { node, parent, parts } of replacements) {
            if (!parent || !parent.children) continue;

            const index = parent.children.indexOf(node);
            if (index === -1) continue;

            // Replace the single text node with multiple nodes
            parent.children.splice(index, 1, ...parts);
        }
    };
}
