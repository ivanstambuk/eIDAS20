/**
 * rehype-paragraph-ids
 * 
 * A rehype plugin that adds IDs to list items within ordered lists to enable
 * deep linking to specific paragraphs in EU legal documents.
 * 
 * EU Legal Structure:
 * - Paragraphs are numbered (1., 2., 3.) → <ol><li>
 * - Points are lettered ((a), (b), (c)) → <ul><li> with "(a)" prefix in text
 * 
 * This plugin adds IDs in the format:
 * - article-5a-para-1 (for paragraph 1 of Article 5a)
 * - article-5a-para-1-point-a (for point (a) of paragraph 1)
 * 
 * DEC-011 Phase 2: Paragraph-level deep linking
 */

import { visit } from 'unist-util-visit';

/**
 * Find the nearest article heading ancestor and return its ID.
 * Walks up the tree to find the containing article context.
 */
function findParentArticleId(ancestors) {
    // Walk ancestors in reverse (closest first)
    for (let i = ancestors.length - 1; i >= 0; i--) {
        const node = ancestors[i];
        // Check if this is an element with an article-like ID
        if (node.type === 'element' && node.properties?.id) {
            const id = node.properties.id;
            if (id.startsWith('article-') || id.startsWith('chapter-') || id.startsWith('annex-')) {
                return id;
            }
        }
    }
    return null;
}

/**
 * Track the current article context as we traverse.
 * Since headings are siblings (not parents) of the <ol> lists,
 * we need to track the last seen article heading.
 */
function rehypeParagraphIds() {
    return (tree) => {
        let currentArticleId = null;
        let currentParagraphNum = 0;

        visit(tree, 'element', (node, index, parent) => {
            // Track article headings (h3 with id starting with "article-")
            if (node.tagName === 'h3' && node.properties?.id?.startsWith('article-')) {
                currentArticleId = node.properties.id;
                currentParagraphNum = 0; // Reset paragraph counter for new article
                return;
            }

            // Handle h2 headings that might contain articles (for different document structures)
            if (node.tagName === 'h2' && node.properties?.id?.startsWith('article-')) {
                currentArticleId = node.properties.id;
                currentParagraphNum = 0;
                return;
            }

            // When we hit a new section (non-article heading), clear context
            if ((node.tagName === 'h2' || node.tagName === 'h3') &&
                node.properties?.id &&
                !node.properties.id.startsWith('article-')) {
                currentArticleId = null;
                currentParagraphNum = 0;
                return;
            }

            // Process ordered lists (paragraphs)
            if (node.tagName === 'ol' && currentArticleId) {
                // Get the start attribute to determine paragraph numbering
                const startNum = node.properties?.start || 1;

                // Process each <li> child
                let liIndex = 0;
                for (const child of node.children) {
                    if (child.type === 'element' && child.tagName === 'li') {
                        const paragraphNum = startNum + liIndex;

                        // Generate ID: article-5a-para-1
                        const paraId = `${currentArticleId}-para-${paragraphNum}`;

                        // Add ID and data attributes
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

            // Process unordered lists (points) within the current article context
            // Points are identified by text starting with (a), (b), etc.
            if (node.tagName === 'ul' && currentArticleId) {
                for (const child of node.children) {
                    if (child.type === 'element' && child.tagName === 'li') {
                        // Check if the li text starts with a point marker like "(a)"
                        const textContent = getTextContent(child);
                        const pointMatch = textContent.match(/^\s*\(([a-z])\)/);

                        if (pointMatch) {
                            const pointLetter = pointMatch[1];

                            // Generate ID: article-5a-point-a (simplified without para context)
                            const pointId = `${currentArticleId}-point-${pointLetter}`;

                            child.properties = child.properties || {};
                            child.properties.id = pointId;
                            child.properties['data-point'] = pointLetter;
                            child.properties['data-article'] = currentArticleId;
                            child.properties.className = [
                                ...(child.properties.className || []),
                                'linkable-point'
                            ];
                        }
                    }
                }
            }
        });
    };
}

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

export default rehypeParagraphIds;
