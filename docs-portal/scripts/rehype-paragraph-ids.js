/**
 * rehype-paragraph-ids
 * 
 * A rehype plugin that adds IDs to list items within ordered lists to enable
 * deep linking to specific paragraphs in EU legal documents.
 * 
 * EU Legal Document Structure (after v3.1 converter fix):
 * 
 *   1. Paragraph text...           ← <ol><li id="article-X-para-N">
 *      - (a) point text...         ←   <ul><li id="article-X-para-N-point-a">
 *         - (i) subpoint...        ←     <ul><li id="...point-a-subpoint-i">
 * 
 * The Markdown is now properly nested, so we walk the tree and inherit
 * context from parent elements. No sibling tracking needed.
 * 
 * v3.1 FIX: Simplified to rely on proper nesting from converter.
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
                return;
            }

            // Reset article context on new section
            if ((node.tagName === 'h2' || node.tagName === 'h3') &&
                node.properties?.id &&
                !node.properties.id.startsWith('article-')) {
                currentArticleId = null;
                return;
            }

            if (!currentArticleId) return;

            // Process ordered list items (paragraphs)
            if (node.tagName === 'ol') {
                const startNum = node.properties?.start || 1;
                let liIndex = 0;

                for (const child of node.children) {
                    if (child.type === 'element' && child.tagName === 'li') {
                        const paragraphNum = startNum + liIndex;
                        const paraId = `${currentArticleId}-para-${paragraphNum}`;

                        child.properties = child.properties || {};
                        child.properties.id = paraId;
                        child.properties['data-para'] = paragraphNum;
                        child.properties['data-article'] = currentArticleId;
                        child.properties.className = [
                            ...(child.properties.className || []),
                            'linkable-paragraph'
                        ];

                        liIndex++;
                    }
                }
                return;
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
                        child.properties['data-article'] = currentArticleId;
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
                        const baseId = paraContext?.id || currentArticleId;
                        const pointId = `${baseId}-point-${pointLetter}`;

                        child.properties.id = pointId;
                        child.properties['data-point'] = pointLetter;
                        child.properties['data-article'] = currentArticleId;
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
                        const baseId = paraContext?.id || currentArticleId;
                        const subpointId = `${baseId}-subpoint-${romanNumeral}`;

                        child.properties.id = subpointId;
                        child.properties['data-subpoint'] = romanNumeral;
                        child.properties['data-article'] = currentArticleId;
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
