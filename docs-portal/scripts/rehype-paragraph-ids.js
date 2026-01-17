/**
 * rehype-paragraph-ids
 * 
 * A rehype plugin that adds IDs to list items to enable deep linking to 
 * specific paragraphs in EU legal documents.
 * 
 * ⚠️ CRITICAL: LEGAL STRUCTURE PRESERVATION
 * This plugin processes BOTH <ol> and <ul> elements because EU regulations
 * use BOTH types for numbered paragraphs:
 * - Main eIDAS regulation (910/2014): Article 2 uses <ol> (ordered list)
 * - Implementing acts (e.g., 2024/2977): Article 2 uses <ul> (unordered list)
 * 
 * We MUST preserve the original list type (UL vs OL) as it appears in the
 * source XML. Changing list types would alter the legal document structure,
 * which is legally significant. We only ADD IDs for deep linking while
 * keeping the original structure intact.
 * 
 * EU Legal Document Structure (after v3.1 converter fix):
 * 
 *   1. Paragraph text...           ← <ol> or <ul> <li id="article-X-para-N">
 *      - (a) point text...         ←   <ul><li id="article-X-para-N-point-a">
 *         - (i) subpoint...        ←     <ul><li id="...point-a-subpoint-i">
 * 
 * The Markdown is now properly nested, so we walk the tree and inherit
 * context from parent elements. No sibling tracking needed.
 * 
 * v3.1 FIX: Simplified to rely on proper nesting from converter.
 * v3.2 FIX: Added UL support while preserving legal document structure.
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
 * Check if text starts with a roman numeral pattern like (i), (ii), (iii), (iv), etc.
 */
function matchRomanNumeral(text) {
    const match = text.match(/^\s*\((i{1,3}|iv|v|vi{1,3}|viii|ix|x|xi{1,3}|xiv|xv)\)/);
    return match ? match[1] : null;
}

/**
 * Check if text starts with a letter point pattern like (a), (b), (c), etc.
 */
function matchLetterPoint(text) {
    const match = text.match(/^\s*\(([a-z])\)/);
    return match ? match[1] : null;
}

/**
 * Find the nearest ancestor article context from the parent chain.
 */
function findArticleContext(ancestors) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
        const node = ancestors[i];
        if (node.type === 'element' && node.properties?.id?.startsWith('article-')) {
            return node.properties.id;
        }
    }
    return null;
}

/**
 * Find paragraph context (nearest ol > li ancestor with para ID)
 */
function findParagraphContext(ancestors) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
        const node = ancestors[i];
        if (node.type === 'element' &&
            node.tagName === 'li' &&
            node.properties?.id?.includes('-para-')) {
            return {
                id: node.properties.id,
                num: node.properties['data-para']
            };
        }
    }
    return null;
}

/**
 * Find point context (nearest ul > li ancestor with point ID)
 */
function findPointContext(ancestors) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
        const node = ancestors[i];
        if (node.type === 'element' &&
            node.tagName === 'li' &&
            node.properties?.id?.includes('-point-') &&
            !node.properties.id.includes('-subpoint-')) {
            return {
                id: node.properties.id,
                letter: node.properties['data-point']
            };
        }
    }
    return null;
}

function rehypeParagraphIds() {
    return (tree) => {
        let currentArticleId = null;
        let currentAnnexId = null;       // Track annex context separately
        let inRecitalsSection = false;   // Track if we're in the Recitals section
        let recitalCounter = 0;          // Counter for recital numbering

        // First pass: track article headings
        visitParents(tree, 'element', (node) => {
            if ((node.tagName === 'h3' || node.tagName === 'h2') &&
                node.properties?.id?.startsWith('article-')) {
                currentArticleId = node.properties.id;
            }
        });

        // Second pass: process with full ancestor context
        visitParents(tree, 'element', (node, ancestors) => {
            // Track current article from headings
            if ((node.tagName === 'h3' || node.tagName === 'h2') &&
                node.properties?.id?.startsWith('article-')) {
                currentArticleId = node.properties.id;
                currentAnnexId = null;    // Exit annex context
                inRecitalsSection = false;
                return;
            }

            // Track Annex section - annexes get similar treatment to articles
            if ((node.tagName === 'h2') && node.properties?.id?.startsWith('annex-')) {
                currentAnnexId = node.properties.id;
                currentArticleId = null;  // Exit article context
                inRecitalsSection = false;
                return;
            }

            // Track Recitals section
            if ((node.tagName === 'h2') && node.properties?.id === 'recitals') {
                inRecitalsSection = true;
                recitalCounter = 0;
                currentArticleId = null;
                currentAnnexId = null;
                return;
            }

            // Reset on other section headings (not article/annex/recitals)
            if ((node.tagName === 'h2' || node.tagName === 'h3') &&
                node.properties?.id &&
                !node.properties.id.startsWith('article-') &&
                !node.properties.id.startsWith('annex-') &&
                node.properties.id !== 'recitals') {
                currentArticleId = null;
                currentAnnexId = null;
                inRecitalsSection = false;
                return;
            }

            // Determine current context (article or annex)
            const currentContextId = currentArticleId || currentAnnexId;

            // =========================================================
            // RECITALS PROCESSING
            // =========================================================
            if (inRecitalsSection && node.tagName === 'ul') {
                for (const child of node.children) {
                    if (child.type === 'element' && child.tagName === 'li') {
                        recitalCounter++;
                        const recitalId = `recital-${recitalCounter}`;

                        child.properties = child.properties || {};
                        child.properties.id = recitalId;
                        child.properties['data-recital'] = recitalCounter;
                        child.properties.className = [
                            ...(child.properties.className || []),
                            'linkable-recital'
                        ];
                    }
                }
                return;
            }

            // Skip processing if not in article or annex context
            if (!currentContextId) return;

            // Process ordered list items (paragraphs)
            if (node.tagName === 'ol') {
                const startNum = node.properties?.start || 1;
                let liIndex = 0;

                for (const child of node.children) {
                    if (child.type === 'element' && child.tagName === 'li') {
                        // Extract ordinal from text content
                        // Pattern 1: eIDAS format "(18)" or "(23a)"
                        // Pattern 2: EU numbered format "10. 'term'" (used in 765/2008)
                        const textContent = getTextContent(child);
                        const parenMatch = textContent.match(/^\s*\((\d+\w?)\)/);
                        const numDotMatch = textContent.match(/^\s*(\d+)\.\s/);
                        const paragraphNum = parenMatch ? parenMatch[1] :
                            numDotMatch ? numDotMatch[1] :
                                (startNum + liIndex);
                        const paraId = `${currentContextId}-para-${paragraphNum}`;

                        child.properties = child.properties || {};
                        child.properties.id = paraId;
                        child.properties['data-para'] = paragraphNum;
                        child.properties['data-context'] = currentContextId;
                        child.properties.className = [
                            ...(child.properties.className || []),
                            'linkable-paragraph'
                        ];

                        liIndex++;
                    }
                }
                return;
            }

            // Process unordered list items (paragraphs) - treats them identically to ordered lists
            // This is necessary for Article 2 (Definitions) sections that use unordered lists
            // We preserve the original list type but still enable deep linking with paragraph IDs
            if (node.tagName === 'ul') {
                // Check if this is a top-level list (NOT nested inside another list)
                // A list is top-level if none of its ancestors are ul/ol/li elements.
                // This distinguishes between:
                //   - Top-level Article 2 definitions (ul after h3) → paragraphs
                //   - Nested points like (a), (b), (c) inside paragraphs → points
                //
                // ⚠️ CRITICAL: The `ancestors` array does NOT include the current node!
                // ancestors = [root, ..., directParent] — never includes `node` itself.
                // See AGENTS.md Rule 25 for the full explanation of this pitfall.
                const isTopLevelList = (() => {
                    // Check if any ancestor is a list or list item
                    for (const ancestor of ancestors) {
                        if (ancestor.type === 'element') {
                            // If we find a list or list item ancestor, this is nested
                            if (ancestor.tagName === 'ul' ||
                                ancestor.tagName === 'ol' ||
                                ancestor.tagName === 'li') {
                                return false;
                            }
                        }
                    }
                    // No list ancestors found - this is a top-level list
                    return true;
                })();

                if (isTopLevelList) {
                    let liIndex = 0;

                    for (const child of node.children) {
                        if (child.type === 'element' && child.tagName === 'li') {
                            // Extract ordinal from text content
                            // Pattern 1: eIDAS format "(18)" or "(23a)"
                            // Pattern 2: EU numbered format "10. 'term'" (used in 765/2008)
                            const textContent = getTextContent(child);
                            const parenMatch = textContent.match(/^\s*\((\d+\w?)\)/);
                            const numDotMatch = textContent.match(/^\s*(\d+)\.\s/);
                            const paragraphNum = parenMatch ? parenMatch[1] :
                                numDotMatch ? numDotMatch[1] :
                                    (liIndex + 1);
                            const paraId = `${currentContextId}-para-${paragraphNum}`;

                            child.properties = child.properties || {};
                            child.properties.id = paraId;
                            child.properties['data-para'] = paragraphNum;
                            child.properties['data-context'] = currentContextId;
                            child.properties.className = [
                                ...(child.properties.className || []),
                                'linkable-paragraph'
                            ];

                            liIndex++;
                        }
                    }
                    return;
                }
            }

            // Process unordered list items (points and subpoints)
            if (node.tagName === 'ul') {
                const paraContext = findParagraphContext(ancestors);
                const pointContext = findPointContext(ancestors);

                for (const child of node.children) {
                    if (child.type !== 'element' || child.tagName !== 'li') continue;

                    const textContent = getTextContent(child);
                    child.properties = child.properties || {};

                    // Check for roman numeral subpoints first (more specific)
                    const romanNumeral = matchRomanNumeral(textContent);
                    if (romanNumeral && pointContext) {
                        // Subpoint: inherits from point
                        const subpointId = `${pointContext.id}-subpoint-${romanNumeral}`;

                        child.properties.id = subpointId;
                        child.properties['data-subpoint'] = romanNumeral;
                        child.properties['data-context'] = currentContextId;
                        if (paraContext) {
                            child.properties['data-para'] = paraContext.num;
                        }
                        child.properties['data-point'] = pointContext.letter;
                        child.properties.className = [
                            ...(child.properties.className || []),
                            'linkable-subpoint'
                        ];
                        continue;
                    }

                    // Check for letter points
                    const pointLetter = matchLetterPoint(textContent);
                    if (pointLetter) {
                        // Point: inherits from paragraph
                        const baseId = paraContext?.id || currentContextId;
                        const pointId = `${baseId}-point-${pointLetter}`;

                        child.properties.id = pointId;
                        child.properties['data-point'] = pointLetter;
                        child.properties['data-context'] = currentContextId;
                        if (paraContext) {
                            child.properties['data-para'] = paraContext.num;
                        }
                        child.properties.className = [
                            ...(child.properties.className || []),
                            'linkable-point'
                        ];
                        continue;
                    }

                    // Fallback: roman numeral without point context
                    if (romanNumeral) {
                        const baseId = paraContext?.id || currentContextId;
                        const subpointId = `${baseId}-subpoint-${romanNumeral}`;

                        child.properties.id = subpointId;
                        child.properties['data-subpoint'] = romanNumeral;
                        child.properties['data-context'] = currentContextId;
                        if (paraContext) {
                            child.properties['data-para'] = paraContext.num;
                        }
                        child.properties.className = [
                            ...(child.properties.className || []),
                            'linkable-subpoint'
                        ];
                    }
                }
            }
        });
    };
}

export default rehypeParagraphIds;
