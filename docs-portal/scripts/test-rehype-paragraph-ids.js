/**
 * Tests for rehype-paragraph-ids.js
 * 
 * Run with: node scripts/test-rehype-paragraph-ids.js
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeParagraphIds from './rehype-paragraph-ids.js';

// Test utilities
let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (err) {
        console.log(`  ❌ ${name}`);
        console.log(`     ${err.message}`);
        failed++;
    }
}

function assertEqual(actual, expected, msg = '') {
    if (actual !== expected) {
        throw new Error(`Expected "${expected}", got "${actual}"${msg ? ` (${msg})` : ''}`);
    }
}

function assertIncludes(html, substring, msg = '') {
    if (!html.includes(substring)) {
        throw new Error(`Expected HTML to include "${substring}"${msg ? ` (${msg})` : ''}`);
    }
}

function assertNotIncludes(html, substring, msg = '') {
    if (html.includes(substring)) {
        throw new Error(`Expected HTML to NOT include "${substring}"${msg ? ` (${msg})` : ''}`);
    }
}

// Process markdown through the rehype pipeline
async function processMarkdown(markdown) {
    const result = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeParagraphIds)
        .use(rehypeStringify)
        .process(markdown);
    return String(result);
}

// ============================================================================
// Test Cases
// ============================================================================

console.log('\n🧪 Testing rehype-paragraph-ids.js\n');

console.log('## Nested List Class Assignment');

test('Top-level OL items get linkable-paragraph class', async () => {
    const markdown = `
### Article 1

1. First paragraph
2. Second paragraph
`;
    const html = await processMarkdown(markdown);
    assertIncludes(html, 'class="linkable-paragraph"');
    assertIncludes(html, 'id="article-1-para-1"');
});

test('Top-level UL items get linkable-paragraph class', async () => {
    const markdown = `
### Article 2

- (1) First definition
- (2) Second definition
`;
    const html = await processMarkdown(markdown);
    assertIncludes(html, 'class="linkable-paragraph"');
});

test('Nested UL items with (a) pattern get linkable-point class', async () => {
    const markdown = `
### Article 5

1. Main paragraph text:
   - (a) First point
   - (b) Second point
`;
    const html = await processMarkdown(markdown);
    assertIncludes(html, 'linkable-paragraph', 'Main paragraph should have linkable-paragraph');
    assertIncludes(html, 'linkable-point', 'Nested points should have linkable-point');
    assertIncludes(html, 'id="article-5-para-1-point-a"', 'Point (a) should have correct ID');
    assertIncludes(html, 'id="article-5-para-1-point-b"', 'Point (b) should have correct ID');
});

test('Deeply nested subpoints get linkable-subpoint class', async () => {
    const markdown = `
### Article 3

1. Paragraph:
   - (a) Point:
      - (i) First subpoint
      - (ii) Second subpoint
`;
    const html = await processMarkdown(markdown);
    assertIncludes(html, 'linkable-subpoint', 'Subpoints should have linkable-subpoint');
});

test('Nested lists do NOT get linkable-paragraph class', async () => {
    const markdown = `
### Article 4

1. Main paragraph:
   - (a) Nested point
`;
    const html = await processMarkdown(markdown);
    // Count occurrences of linkable-paragraph
    const paragraphCount = (html.match(/linkable-paragraph/g) || []).length;
    assertEqual(paragraphCount, 1, 'Should only have 1 linkable-paragraph (the main para, not nested)');
});

console.log('\n## Recitals');

test('Recitals get linkable-recital class', async () => {
    const markdown = `
## Recitals

- First recital text
- Second recital text
`;
    const html = await processMarkdown(markdown);
    assertIncludes(html, 'linkable-recital');
    assertIncludes(html, 'id="recital-1"');
    assertIncludes(html, 'id="recital-2"');
});

// ============================================================================
// Summary
// ============================================================================

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
