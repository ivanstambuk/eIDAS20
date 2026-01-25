/**
 * rehype-external-links
 * 
 * A rehype plugin that automatically links references to external EU documents
 * (Regulations/Directives not imported in the portal) to EUR-Lex.
 * 
 * This plugin:
 * 1. Loads external documents registry from external-documents.yaml
 * 2. Walks the HTML AST looking for text nodes matching EU document references
 * 3. Wraps matches with <a> tags pointing to EUR-Lex with appropriate anchors
 * 
 * EUR-Lex Anchor Patterns:
 * - Article N: #art_N
 * - Article N, paragraph M: #NNN.MMM (zero-padded)
 * - Recital N: #rct_N
 * 
 * DEC-XXX: EUR-Lex Deep Linking
 * 
 * @see .agent/session/EURLEX_DEEP_LINK_PLAN.md for implementation plan
 */

import { visitParents } from 'unist-util-visit-parents';

/**
 * Build a map of document IDs for quick lookup.
 * Key: document id (e.g., "2022/1925"), Value: document object
 * Also includes aliases for alternate formats.
 */
function buildDocumentMap(externalDocs) {
    const map = new Map();

    if (!externalDocs || !externalDocs.documents) {
        return map;
    }

    for (const doc of externalDocs.documents) {
        // Primary ID
        map.set(doc.id, doc);

        // Aliases (e.g., "1925/2022" for "2022/1925")
        if (doc.aliases) {
            for (const alias of doc.aliases) {
                map.set(alias, doc);
            }
        }
    }

    return map;
}

/**
 * Build EUR-Lex URL with optional article/paragraph anchor.
 * 
 * @param {string} celex - CELEX number (e.g., "32022R1925")
 * @param {number|null} article - Article number
 * @param {number|null} paragraph - Paragraph number
 * @returns {string} Full EUR-Lex URL
 */
function buildEurLexUrl(celex, article = null, paragraph = null) {
    let url = `https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:${celex}`;

    if (article && paragraph) {
        // #NNN.MMM format (zero-padded to 3 digits)
        const artPad = String(article).padStart(3, '0');
        const paraPad = String(paragraph).padStart(3, '0');
        url += `#${artPad}.${paraPad}`;
    } else if (article) {
        url += `#art_${article}`;
    }

    return url;
}

/**
 * Pattern to match EU document references.
 * 
 * Captures:
 * - Group 1: Article number (optional)
 * - Group 2: Paragraph number (optional)
 * - Group 3: Document type (Regulation/Directive)
 * - Group 4: Document number (e.g., "2022/1925" or "No 182/2011")
 * 
 * Examples matched:
 * - "Regulation (EU) 2022/1925"
 * - "Regulation (EU) No 182/2011"
 * - "Directive (EU) 2019/882"
 * - "Article 5 of Regulation (EU) No 182/2011"
 * - "Article 6(7) of Regulation (EU) 2022/1925"
 * - "Article 2, point (2), of Regulation (EU) 2022/1925"
 */
const DOCUMENT_REF_PATTERN = /(?:Article\s+(\d+)(?:\s*\(\s*(\d+)\s*\))?(?:\s*,\s*point\s*\([^)]+\))?(?:\s*,)?\s+of\s+)?(Regulation|Directive)\s+\(E[CU]\)\s+(?:No\s+)?(\d+\/\d{4})/gi;

/**
 * Check if we should skip this text node.
 * Skip: headings, existing links, code blocks
 */
function shouldSkipNode(ancestors) {
    for (const ancestor of ancestors) {
        if (ancestor.type !== 'element') continue;

        const tag = ancestor.tagName;
        const className = ancestor.properties?.className || [];

        // Skip headings
        if (/^h[1-6]$/.test(tag)) return true;

        // Skip code blocks
        if (tag === 'code' || tag === 'pre') return true;

        // Skip existing links (prevent nesting)
        if (tag === 'a') return true;

        // Skip already-processed external links
        if (className.includes('external-law-link')) return true;
    }

    return false;
}

/**
 * Process a text node and replace document references with links.
 * 
 * @param {Object} node - The text node
 * @param {Map} docMap - Map of document IDs to document objects
 * @param {Set} importedDocs - Set of imported document IDs to exclude
 * @returns {Array|null} Array of replacement nodes or null if no matches
 */
function processTextNode(node, docMap, importedDocs) {
    const text = node.value;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Reset regex state
    DOCUMENT_REF_PATTERN.lastIndex = 0;

    while ((match = DOCUMENT_REF_PATTERN.exec(text)) !== null) {
        const [fullMatch, articleNum, paragraphNum, docType, docId] = match;

        // Check if this is an external document (not imported)
        if (importedDocs.has(docId)) {
            continue; // Skip - this document is in the portal
        }

        // Look up in external documents registry
        const doc = docMap.get(docId);
        if (!doc) {
            continue; // Not in registry - skip
        }

        // Add text before the match
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                value: text.slice(lastIndex, match.index)
            });
        }

        // Build the EUR-Lex URL with appropriate anchor
        const url = buildEurLexUrl(
            doc.celex,
            articleNum ? parseInt(articleNum, 10) : null,
            paragraphNum ? parseInt(paragraphNum, 10) : null
        );

        // Create the link element
        parts.push({
            type: 'element',
            tagName: 'a',
            properties: {
                href: url,
                className: ['external-law-link'],
                'data-doc-id': doc.id,
                'data-doc-short': doc.short,
                target: '_blank',
                rel: 'noopener noreferrer',
                title: `${doc.title} — opens EUR-Lex in new tab`
            },
            children: [{
                type: 'text',
                value: fullMatch
            }]
        });

        lastIndex = DOCUMENT_REF_PATTERN.lastIndex;
    }

    // Add remaining text after last match
    if (lastIndex < text.length) {
        parts.push({
            type: 'text',
            value: text.slice(lastIndex)
        });
    }

    return parts.length > 0 && parts.some(p => p.type === 'element') ? parts : null;
}

/**
 * The main rehype plugin function.
 * 
 * @param {Object} options - Plugin options
 * @param {Object} options.externalDocs - The external-documents.yaml data
 * @param {Set} options.importedDocs - Set of document IDs that are imported (to exclude)
 */
export default function rehypeExternalLinks(options = {}) {
    const { externalDocs, importedDocs = new Set() } = options;

    // Build document lookup map
    const docMap = buildDocumentMap(externalDocs);

    // No external docs configured
    if (docMap.size === 0) {
        return () => { };
    }

    return (tree) => {
        // Track nodes to replace
        const replacements = [];

        // Find all text nodes with document references
        visitParents(tree, (node, ancestors) => {
            // Only process text nodes
            if (node.type !== 'text') return;

            // Skip exempt node types
            if (shouldSkipNode(ancestors)) return;

            // Process the text node
            const parts = processTextNode(node, docMap, importedDocs);
            if (parts) {
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
