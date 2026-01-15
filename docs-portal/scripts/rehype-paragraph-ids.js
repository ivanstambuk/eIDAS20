/**
 * rehype-paragraph-ids
 * 
 * A rehype plugin that adds IDs to list items within ordered lists to enable
 * deep linking to specific paragraphs in EU legal documents.
 * 
 * EU Legal Structure Challenge:
 * In the source Markdown, paragraphs and points are SIBLING lists, not nested:
 * 
 *   1. Paragraph text...      ← <ol><li>
 *   - (a) point text...       ← <ul><li> (sibling, not child!)
 *       - (i) subpoint...     ← nested <ul><li> (child of point)
 * 
 * Solution: Track the "current paragraph context" as we traverse siblings.
 * When we see an <ol><li>, remember the last paragraph ID.
 * When we see a <ul> immediately after, use that paragraph context.
 * 
 * DEC-011 Phase 2+3: Full paragraph/point/subpoint deep linking
 */

import { visit } from 'unist-util-visit';

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

function rehypeParagraphIds() {
    return (tree) => {
        let currentArticleId = null;
        let currentParaId = null;      // Track last seen paragraph ID
        let currentParaNum = null;     // Track last seen paragraph number
        let lastPointId = null;        // Track last seen point ID (for subpoints)
        let lastPointLetter = null;    // Track last seen point letter

        visit(tree, 'element', (node, index, parent) => {
            // Track article headings (h2 or h3 with id starting with "article-")
            if ((node.tagName === 'h3' || node.tagName === 'h2') &&
                node.properties?.id?.startsWith('article-')) {
                currentArticleId = node.properties.id;
                currentParaId = null;
                currentParaNum = null;
                lastPointId = null;
                lastPointLetter = null;
                return;
            }

            // When we hit a new section (non-article heading), clear all context
            if ((node.tagName === 'h2' || node.tagName === 'h3') &&
                node.properties?.id &&
                !node.properties.id.startsWith('article-')) {
                currentArticleId = null;
                currentParaId = null;
                currentParaNum = null;
                lastPointId = null;
                lastPointLetter = null;
                return;
            }

            // Process ordered lists (paragraphs)
            if (node.tagName === 'ol' && currentArticleId) {
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

                        // Update tracking - this paragraph is now "current" for following sibling ULs
                        currentParaId = paraId;
                        currentParaNum = paragraphNum;
                        lastPointId = null;  // Reset point context for new paragraph
                        lastPointLetter = null;

                        liIndex++;
                    }
                }
                return;
            }

            // Process unordered lists (points and subpoints)
            // Skip if this UL is nested inside a point LI (handled by processNestedSubpoints)
            if (node.tagName === 'ul' && currentArticleId) {
                // Check if parent is a point LI - if so, skip (already processed)
                if (parent?.tagName === 'li' &&
                    parent?.properties?.className?.includes('linkable-point')) {
                    return;
                }

                for (const child of node.children) {
                    if (child.type !== 'element' || child.tagName !== 'li') continue;

                    const textContent = getTextContent(child);
                    child.properties = child.properties || {};

                    // First check for roman numeral subpoints (i), (ii), etc.
                    // These appear as nested lists under a point LI
                    const romanNumeral = matchRomanNumeral(textContent);
                    if (romanNumeral && lastPointId) {
                        // Subpoint: article-5a-para-1-point-a-subpoint-i
                        const subpointId = `${lastPointId}-subpoint-${romanNumeral}`;

                        child.properties.id = subpointId;
                        child.properties['data-subpoint'] = romanNumeral;
                        child.properties['data-article'] = currentArticleId;
                        if (currentParaNum) {
                            child.properties['data-para'] = currentParaNum;
                        }
                        if (lastPointLetter) {
                            child.properties['data-point'] = lastPointLetter;
                        }
                        child.properties.className = [
                            ...(child.properties.className || []),
                            'linkable-subpoint'
                        ];
                        continue;
                    }

                    // Check for letter points (a), (b), (c), etc.
                    const pointLetter = matchLetterPoint(textContent);
                    if (pointLetter) {
                        // Build ID with paragraph context if available
                        const baseId = currentParaId || currentArticleId;
                        const pointId = `${baseId}-point-${pointLetter}`;

                        child.properties.id = pointId;
                        child.properties['data-point'] = pointLetter;
                        child.properties['data-article'] = currentArticleId;
                        if (currentParaNum) {
                            child.properties['data-para'] = currentParaNum;
                        }
                        child.properties.className = [
                            ...(child.properties.className || []),
                            'linkable-point'
                        ];

                        // Update point tracking for nested subpoints
                        lastPointId = pointId;
                        lastPointLetter = pointLetter;

                        // Process nested ULs inside this point LI for subpoints
                        processNestedSubpoints(child, pointId, currentArticleId, currentParaNum, pointLetter);

                        continue;
                    }

                    // Fallback: roman numeral without point context (edge case)
                    if (romanNumeral) {
                        const baseId = currentParaId || currentArticleId;
                        const subpointId = `${baseId}-subpoint-${romanNumeral}`;

                        child.properties.id = subpointId;
                        child.properties['data-subpoint'] = romanNumeral;
                        child.properties['data-article'] = currentArticleId;
                        if (currentParaNum) {
                            child.properties['data-para'] = currentParaNum;
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

/**
 * Process nested UL elements inside a point LI to find subpoints.
 * This handles the case where subpoints are properly nested in Markdown.
 */
function processNestedSubpoints(pointLi, pointId, articleId, paraNum, pointLetter) {
    for (const child of pointLi.children || []) {
        if (child.type === 'element' && child.tagName === 'ul') {
            for (const subChild of child.children || []) {
                if (subChild.type !== 'element' || subChild.tagName !== 'li') continue;

                const textContent = getTextContent(subChild);
                const romanNumeral = matchRomanNumeral(textContent);

                if (romanNumeral) {
                    const subpointId = `${pointId}-subpoint-${romanNumeral}`;

                    subChild.properties = subChild.properties || {};
                    subChild.properties.id = subpointId;
                    subChild.properties['data-subpoint'] = romanNumeral;
                    subChild.properties['data-article'] = articleId;
                    if (paraNum) {
                        subChild.properties['data-para'] = paraNum;
                    }
                    subChild.properties['data-point'] = pointLetter;
                    subChild.properties.className = [
                        ...(subChild.properties.className || []),
                        'linkable-subpoint'
                    ];
                }
            }
        }
    }
}

export default rehypeParagraphIds;
