/**
 * Provision Parser Module
 * 
 * Parses provision references (Article, Recital, Annex, Paragraph, Point)
 * from legal text and generates deep link anchors.
 * 
 * Part of DEC-064: Provision Citations Implementation
 * Created: 2026-01-17
 */

/**
 * Roman numeral to lowercase string mapping (for Annexes)
 */
const ROMAN_TO_LOWER = {
    'I': 'i', 'II': 'ii', 'III': 'iii', 'IV': 'iv', 'V': 'v',
    'VI': 'vi', 'VII': 'vii', 'VIII': 'viii', 'IX': 'ix', 'X': 'x',
    'XI': 'xi', 'XII': 'xii', 'XIII': 'xiii', 'XIV': 'xiv', 'XV': 'xv'
};

/**
 * Pattern definitions for provision types
 */
const PROVISION_PATTERNS = {
    // Article with optional paragraph and point(s)
    // Matches: Article 5, Article 5(1), Article 5(1)(a), Article 5(1), point (a), Article 5a
    // Groups: 1=articleNum (e.g. "5a"), 2=paragraph (e.g. "1"), 3=point (e.g. "a")
    articleFull: /Article\s+(\d+[a-z]?)(?:\((\d+)\))?(?:\(([a-z])\))?/gi,

    // Article with "point/points" keyword
    // Matches: Article 5(1), point (a), Article 5(1), points (a) and (b)
    articleWithPoint: /Article\s+(\d+[a-z]?)(?:\((\d+)\))?,?\s*(?:point|points)\s*\(?([a-z])\)?/gi,

    // Multiple articles: Articles 4 and 5, Articles 46c and 46d
    multipleArticles: /Articles\s+(\d+[a-z]?)\s+and\s+(\d+[a-z]?)/gi,

    // Recital references
    // Matches: recital 75, Recital (42), recitals 10 and 11
    recital: /[Rr]ecital\s*\(?(\d+)\)?/gi,

    // Multiple recitals
    multipleRecitals: /[Rr]ecitals\s+(\d+)\s+and\s+(\d+)/gi,

    // Annex with Roman numerals
    // Matches: Annex I, Annex II, Annex VII
    annex: /Annex\s+([IVX]+)/gi,

    // Paragraph reference (standalone, needs article context)
    // Matches: paragraph 1, paragraphs 1 and 2
    paragraph: /paragraph\s+(\d+)/gi,

    // Point reference (standalone, needs context)
    // Matches: point (a), points (a) to (f)
    point: /point\s*\(?([a-z])\)?/gi,
};

/**
 * Pattern to detect "of [Document]" association
 * Matches: of Regulation (EU) No 910/2014, of Directive (EU) 2022/2555
 */
const OF_DOCUMENT_PATTERN = /of\s+(?:Regulation|Directive|Decision)\s+\([A-Z,\s]+\)\s*(?:No\s*)?(\d+)\/(\d+)/i;

/**
 * Parse a provision reference from text and generate anchor info
 * 
 * @param {string} text - Text containing the provision reference
 * @returns {Object|null} Provision info or null if not a provision reference
 */
function parseProvisionReference(text) {
    // Try each pattern in priority order

    // 1. Article with point keyword (most specific)
    const articlePointMatch = text.match(PROVISION_PATTERNS.articleWithPoint);
    if (articlePointMatch) {
        // Re-match to get groups
        const re = /Article\s+(\d+[a-z]?)(?:\((\d+)\))?,?\s*(?:point|points)\s*\(?([a-z])\)?/i;
        const groups = text.match(re);
        if (groups) {
            const [, articleNum, para, point] = groups;
            return {
                type: 'article',
                display: `Article ${articleNum}${para ? `(${para})` : ''}${point ? `, point (${point})` : ''}`,
                anchor: generateArticleAnchor(articleNum, para, point),
                articleNum,
                paragraph: para || null,
                point: point || null,
            };
        }
    }

    // 2. Full article pattern (Article 5, Article 5(1), Article 5(1)(a))
    const articleMatch = text.match(/Article\s+(\d+[a-z]?)(?:\((\d+)\))?(?:\(([a-z])\))?/i);
    if (articleMatch) {
        const [, articleNum, para, point] = articleMatch;
        return {
            type: 'article',
            display: `Article ${articleNum}${para ? `(${para})` : ''}${point ? `(${point})` : ''}`,
            anchor: generateArticleAnchor(articleNum, para, point),
            articleNum,
            paragraph: para || null,
            point: point || null,
        };
    }

    // 3. Recital pattern
    const recitalMatch = text.match(/[Rr]ecital\s*\(?(\d+)\)?/i);
    if (recitalMatch) {
        const [, recitalNum] = recitalMatch;
        return {
            type: 'recital',
            display: `Recital ${recitalNum}`,
            anchor: `recital-${recitalNum}`,
            recitalNum,
        };
    }

    // 4. Annex pattern
    const annexMatch = text.match(/Annex\s+([IVX]+)/i);
    if (annexMatch) {
        const [, romanNum] = annexMatch;
        const lowerNum = ROMAN_TO_LOWER[romanNum.toUpperCase()] || romanNum.toLowerCase();
        return {
            type: 'annex',
            display: `Annex ${romanNum.toUpperCase()}`,
            anchor: `annex-${lowerNum}`,
            annexNum: romanNum.toUpperCase(),
        };
    }

    return null;
}

/**
 * Parse multiple provisions from a single reference
 * Handles: "Articles 4 and 5", "recitals 10 and 11"
 * 
 * @param {string} text - Text containing provision references
 * @returns {Object[]} Array of provision info objects
 */
function parseMultipleProvisions(text) {
    const provisions = [];

    // Multiple articles: "Articles 4 and 5"
    const multiArticleMatch = text.match(/Articles\s+(\d+[a-z]?)\s+and\s+(\d+[a-z]?)/i);
    if (multiArticleMatch) {
        const [, art1, art2] = multiArticleMatch;
        provisions.push({
            type: 'article',
            display: `Article ${art1}`,
            anchor: generateArticleAnchor(art1),
            articleNum: art1,
        });
        provisions.push({
            type: 'article',
            display: `Article ${art2}`,
            anchor: generateArticleAnchor(art2),
            articleNum: art2,
        });
        return provisions;
    }

    // Multiple recitals: "recitals 10 and 11"
    const multiRecitalMatch = text.match(/[Rr]ecitals\s+(\d+)\s+and\s+(\d+)/i);
    if (multiRecitalMatch) {
        const [, rec1, rec2] = multiRecitalMatch;
        provisions.push({
            type: 'recital',
            display: `Recital ${rec1}`,
            anchor: `recital-${rec1}`,
            recitalNum: rec1,
        });
        provisions.push({
            type: 'recital',
            display: `Recital ${rec2}`,
            anchor: `recital-${rec2}`,
            recitalNum: rec2,
        });
        return provisions;
    }

    // Fall back to single provision parsing
    const single = parseProvisionReference(text);
    if (single) {
        provisions.push(single);
    }

    return provisions;
}

/**
 * Generate an article anchor from components
 * 
 * @param {string} articleNum - Article number (e.g., "5", "5a")
 * @param {string|null} para - Paragraph number (e.g., "1")
 * @param {string|null} point - Point letter (e.g., "a")
 * @returns {string} Anchor ID (e.g., "article-5-para-1-point-a")
 */
function generateArticleAnchor(articleNum, para = null, point = null) {
    let anchor = `article-${articleNum.toLowerCase()}`;

    if (para) {
        anchor += `-para-${para}`;
        // Point within a paragraph
        if (point) {
            anchor += `-point-${point.toLowerCase()}`;
        }
    } else if (point) {
        // DEC-064 FIX: Point at article level without explicit paragraph
        // In legal documents, article-level points (a, b, c...) are often
        // encoded as paragraphs in HTML. Convert letter to number: a=1, b=2, etc.
        const pointNumber = point.toLowerCase().charCodeAt(0) - 96; // 'a' = 97 - 96 = 1
        anchor += `-para-${pointNumber}`;
    }

    return anchor;
}

/**
 * Extract document reference from text (e.g., "of Regulation 910/2014")
 * 
 * @param {string} text - Text potentially containing "of [Document]"
 * @returns {Object|null} Document reference info or null
 */
function extractDocumentAssociation(text) {
    const match = text.match(OF_DOCUMENT_PATTERN);
    if (match) {
        const [fullMatch, year, number] = match;
        // Determine document type
        let docType = 'regulation';
        if (/directive/i.test(text)) {
            docType = 'directive';
        } else if (/decision/i.test(text)) {
            docType = 'decision';
        }

        return {
            type: docType,
            year,
            number,
            fullMatch,
        };
    }
    return null;
}

/**
 * Find provision-document associations in a sentence
 * 
 * @param {string} sentence - A sentence from the legal text
 * @param {Object[]} documentCitations - Array of document citations found in the same sentence
 * @returns {Object[]} Array of { provision, documentCelex } associations
 */
function findProvisionDocumentAssociations(sentence, documentCitations = []) {
    const associations = [];

    // Strategy 1: Explicit "of [Document]" pattern
    // Look for "Article X(Y) of Regulation ..."
    const explicitPattern = /(Article\s+\d+[a-z]?(?:\(\d+\))?(?:\([a-z]\))?(?:,?\s*(?:point|points)\s*\(?[a-z]\)?)?)\s+of\s+(?:Regulation|Directive|Decision)\s+\([A-Z,\s]+\)\s*(?:No\s*)?\d+\/\d+/gi;

    let match;
    while ((match = explicitPattern.exec(sentence)) !== null) {
        const provisionText = match[1];
        const fullMatch = match[0];

        const provision = parseProvisionReference(provisionText);
        const docRef = extractDocumentAssociation(fullMatch);

        if (provision && docRef) {
            associations.push({
                provision,
                documentRef: docRef,
                matchType: 'explicit',
                originalText: fullMatch,
            });
        }
    }

    // Strategy 2: Same-sentence association
    // If provision not already matched explicitly, associate with document citations in sentence
    if (associations.length === 0 && documentCitations.length > 0) {
        // Find all provisions in sentence
        const provisionMatches = [];

        // Articles
        const articlePattern = /Article\s+(\d+[a-z]?)(?:\((\d+)\))?(?:\(([a-z])\))?/gi;
        while ((match = articlePattern.exec(sentence)) !== null) {
            const provision = parseProvisionReference(match[0]);
            if (provision) {
                provisionMatches.push({ provision, position: match.index, text: match[0] });
            }
        }

        // Recitals
        const recitalPattern = /[Rr]ecital\s*\(?(\d+)\)?/gi;
        while ((match = recitalPattern.exec(sentence)) !== null) {
            const provision = parseProvisionReference(match[0]);
            if (provision) {
                provisionMatches.push({ provision, position: match.index, text: match[0] });
            }
        }

        // Annexes
        const annexPattern = /Annex\s+([IVX]+)/gi;
        while ((match = annexPattern.exec(sentence)) !== null) {
            const provision = parseProvisionReference(match[0]);
            if (provision) {
                provisionMatches.push({ provision, position: match.index, text: match[0] });
            }
        }

        // Associate each provision with the nearest document citation
        for (const provMatch of provisionMatches) {
            // For now, associate with the first document citation in the sentence
            // More sophisticated logic could use positional proximity
            if (documentCitations.length > 0) {
                associations.push({
                    provision: provMatch.provision,
                    documentCelex: documentCitations[0].celex,
                    matchType: 'same-sentence',
                    originalText: provMatch.text,
                });
            }
        }
    }

    return associations;
}

/**
 * Generate a deep link URL for a provision
 * 
 * @param {string} baseUrl - Base document URL (e.g., "#/regulation/910-2014")
 * @param {string} anchor - Provision anchor (e.g., "article-5-para-1")
 * @returns {string} Deep link URL with section parameter
 */
function generateDeepLinkUrl(baseUrl, anchor) {
    if (!anchor) return baseUrl;

    // Check if URL already has query params
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}section=${anchor}`;
}

/**
 * Check if text contains a provision reference
 * 
 * @param {string} text - Text to check
 * @returns {boolean} True if contains provision reference
 */
function containsProvisionReference(text) {
    return /(?:Article|Recital|Annex)\s+\d+/i.test(text) ||
        /Annex\s+[IVX]+/i.test(text);
}

/**
 * Extract all provisions from a block of text
 * Returns provisions without document associations (for intra-document references)
 * 
 * @param {string} text - Text block to scan
 * @returns {Object[]} Array of provision objects
 */
function extractAllProvisions(text) {
    const provisions = [];
    const seen = new Set();

    // Articles
    const articlePattern = /Article\s+(\d+[a-z]?)(?:\((\d+)\))?(?:\(([a-z])\))?(?:,?\s*(?:point|points)\s*\(?([a-z])\)?)?/gi;
    let match;
    while ((match = articlePattern.exec(text)) !== null) {
        const provision = parseProvisionReference(match[0]);
        if (provision && !seen.has(provision.anchor)) {
            seen.add(provision.anchor);
            provisions.push({ ...provision, originalText: match[0], position: match.index });
        }
    }

    // Recitals
    const recitalPattern = /[Rr]ecital\s*\(?(\d+)\)?/gi;
    while ((match = recitalPattern.exec(text)) !== null) {
        const provision = parseProvisionReference(match[0]);
        if (provision && !seen.has(provision.anchor)) {
            seen.add(provision.anchor);
            provisions.push({ ...provision, originalText: match[0], position: match.index });
        }
    }

    // Annexes
    const annexPattern = /Annex\s+([IVX]+)/gi;
    while ((match = annexPattern.exec(text)) !== null) {
        const provision = parseProvisionReference(match[0]);
        if (provision && !seen.has(provision.anchor)) {
            seen.add(provision.anchor);
            provisions.push({ ...provision, originalText: match[0], position: match.index });
        }
    }

    return provisions;
}

export {
    parseProvisionReference,
    parseMultipleProvisions,
    generateArticleAnchor,
    extractDocumentAssociation,
    findProvisionDocumentAssociations,
    generateDeepLinkUrl,
    containsProvisionReference,
    extractAllProvisions,
    PROVISION_PATTERNS,
    ROMAN_TO_LOWER,
};
