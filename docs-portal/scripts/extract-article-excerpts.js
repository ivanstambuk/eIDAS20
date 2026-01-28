#!/usr/bin/env node
/**
 * Extract Article Excerpts for Legal Basis Popovers
 * 
 * This script parses regulation HTML content and extracts text excerpts
 * for each article, paragraph, recital, and annex section.
 * 
 * Output: public/data/article-excerpts.json
 * 
 * Usage: node scripts/extract-article-excerpts.js
 * 
 * The output enables Legal Basis popovers to show article text previews,
 * matching the ARF specification preview functionality.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const REGULATIONS_DIR = join(__dirname, '..', 'public', 'data', 'regulations');
const OUTPUT_PATH = join(__dirname, '..', 'public', 'data', 'article-excerpts.json');

// Configuration
const MAX_EXCERPT_LENGTH = 300;  // Characters
const MIN_EXCERPT_LENGTH = 50;   // Skip very short excerpts

/**
 * Strip HTML tags and normalize whitespace
 */
function stripHtml(html) {
    return html
        .replace(/<[^>]+>/g, ' ')  // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')      // Normalize whitespace
        .replace(/\s+([.,;:?!])/g, '$1')  // Remove spaces before punctuation
        .trim();
}

/**
 * Truncate text to max length at word boundary
 */
function truncateAtWord(text, maxLength) {
    if (text.length <= maxLength) return text;

    // Find last space before maxLength
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.7) {
        return truncated.substring(0, lastSpace) + '...';
    }
    return truncated + '...';
}

/**
 * Generate a human-readable title from section ID
 * e.g., "article-5b-para-3" → "Article 5b(3)"
 */
function formatSectionTitle(sectionId) {
    // Handle articles with paragraphs: article-5b-para-3 → Article 5b(3)
    const articleParaMatch = sectionId.match(/^article-(\d+[a-z]?)-para-(\d+)$/i);
    if (articleParaMatch) {
        return `Article ${articleParaMatch[1]}(${articleParaMatch[2]})`;
    }

    // Handle articles with points: article-5b-para-3-point-a → Article 5b(3)(a)
    const articlePointMatch = sectionId.match(/^article-(\d+[a-z]?)-para-(\d+)-point-([a-z])$/i);
    if (articlePointMatch) {
        return `Article ${articlePointMatch[1]}(${articlePointMatch[2]})(${articlePointMatch[3]})`;
    }

    // Handle plain articles: article-5b → Article 5b
    const articleMatch = sectionId.match(/^article-(\d+[a-z]?)$/i);
    if (articleMatch) {
        return `Article ${articleMatch[1]}`;
    }

    // Handle recitals: recital-42 → Recital 42
    const recitalMatch = sectionId.match(/^recital-(\d+)$/i);
    if (recitalMatch) {
        return `Recital ${recitalMatch[1]}`;
    }

    // Handle annexes: annex-i-para-5 → Annex I(5)
    const annexParaMatch = sectionId.match(/^annex-([ivxlc]+)-para-(\d+)$/i);
    if (annexParaMatch) {
        return `Annex ${annexParaMatch[1].toUpperCase()}(${annexParaMatch[2]})`;
    }

    // Handle plain annexes with Roman numerals: annex-i → Annex I
    const annexMatch = sectionId.match(/^annex-([ivxlc]+)$/i);
    if (annexMatch) {
        return `Annex ${annexMatch[1].toUpperCase()}`;
    }

    // Handle single annexes (no numeral): annex → Annex
    if (sectionId === 'annex') {
        return 'Annex';
    }

    // Fallback: capitalize and format
    return sectionId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Extract section content from HTML using ID attributes
 * 
 * The regulation HTML has sections marked with IDs like:
 * - <h3 id="article-5b">Article 5b</h3>
 * - <li id="article-5b-para-5" data-para="5">...</li>
 * - <li id="recital-42" data-recital="42">...</li>
 */
function extractSectionsFromHtml(html) {
    const sections = {};

    // Pattern 1: List items with ID (paragraphs, recitals, points)
    // <li id="article-5b-para-5" data-para="5" ...>content</li>
    const listItemPattern = /<li\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/li>/gi;
    let match;

    while ((match = listItemPattern.exec(html)) !== null) {
        const sectionId = match[1];
        const content = match[2];
        const text = stripHtml(content);

        if (text.length >= MIN_EXCERPT_LENGTH) {
            sections[sectionId] = {
                title: formatSectionTitle(sectionId),
                excerpt: truncateAtWord(text, MAX_EXCERPT_LENGTH)
            };
        }
    }

    // Pattern 2: Headings with ID (articles, annexes)
    // Extract the content following the heading until the next heading of same/higher level
    const headingPattern = /<h([23])\s+id="([^"]+)"[^>]*>([^<]+)<\/h\1>/gi;
    const headingPositions = [];

    while ((match = headingPattern.exec(html)) !== null) {
        headingPositions.push({
            level: parseInt(match[1]),
            id: match[2],
            title: stripHtml(match[3]),
            position: match.index,
            endPosition: match.index + match[0].length
        });
    }

    // For each heading, extract content until next same-level heading
    for (let i = 0; i < headingPositions.length; i++) {
        const heading = headingPositions[i];
        const nextHeading = headingPositions[i + 1];

        // Skip if we already have this section from list items
        if (sections[heading.id]) continue;

        // Get content between this heading and the next
        const contentStart = heading.endPosition;
        const contentEnd = nextHeading ? nextHeading.position : html.length;
        const content = html.substring(contentStart, contentEnd);

        // Extract text from paragraphs - try multiple if first is too short
        const paragraphs = [...content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
        const listItems = [...content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];

        let text = '';

        // Try paragraphs first
        for (const para of paragraphs) {
            const paraText = stripHtml(para[1]);
            if (paraText.length >= MIN_EXCERPT_LENGTH) {
                text = paraText;
                break;
            }
            // Accumulate short paragraphs
            text += (text ? ' ' : '') + paraText;
            if (text.length >= MIN_EXCERPT_LENGTH) break;
        }

        // If still no good text, try list items
        if (text.length < MIN_EXCERPT_LENGTH && listItems.length > 0) {
            const itemText = stripHtml(listItems[0][1]);
            if (itemText.length >= MIN_EXCERPT_LENGTH) {
                text = itemText;
            }
        }

        if (text.length >= MIN_EXCERPT_LENGTH) {
            sections[heading.id] = {
                title: formatSectionTitle(heading.id),
                excerpt: truncateAtWord(text, MAX_EXCERPT_LENGTH)
            };
        }
    }

    return sections;
}

/**
 * Process all regulation JSON files
 */
function processRegulations() {
    console.log('📚 Extracting article excerpts for Legal Basis popovers...\n');

    const excerpts = {};
    let totalSections = 0;
    let totalFiles = 0;

    // Get all regulation JSON files
    const files = readdirSync(REGULATIONS_DIR)
        .filter(f => f.endsWith('.json'));

    for (const file of files) {
        const filePath = join(REGULATIONS_DIR, file);
        const slug = file.replace('.json', '');

        try {
            const data = JSON.parse(readFileSync(filePath, 'utf-8'));

            // Skip if no HTML content
            if (!data.contentHtml) {
                console.log(`   ⏭️  ${slug}: No HTML content`);
                continue;
            }

            // Extract sections from HTML
            const sections = extractSectionsFromHtml(data.contentHtml);
            const sectionCount = Object.keys(sections).length;

            if (sectionCount > 0) {
                excerpts[slug] = sections;
                totalSections += sectionCount;
                totalFiles++;
                console.log(`   ✅ ${slug}: ${sectionCount} sections`);
            } else {
                console.log(`   ⚠️  ${slug}: No sections found`);
            }

        } catch (err) {
            console.error(`   ❌ ${slug}: ${err.message}`);
        }
    }

    // Write output
    writeFileSync(OUTPUT_PATH, JSON.stringify(excerpts, null, 2));

    console.log(`\n✅ Extracted ${totalSections} sections from ${totalFiles} regulations`);
    console.log(`   Output: ${OUTPUT_PATH}`);

    return excerpts;
}

// Run if called directly
processRegulations();
