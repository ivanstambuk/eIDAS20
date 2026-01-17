/**
 * Tests for Provision Parser Module
 * 
 * Run with: node scripts/test-provision-parser.js
 */

import {
    parseProvisionReference,
    parseMultipleProvisions,
    generateArticleAnchor,
    extractDocumentAssociation,
    findProvisionDocumentAssociations,
    generateDeepLinkUrl,
    containsProvisionReference,
    extractAllProvisions,
} from './provision-parser.js';

// Simple test runner
let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   ${error.message}`);
        failed++;
    }
}

function assertEquals(actual, expected, message = '') {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
        throw new Error(`${message}\n   Expected: ${expectedStr}\n   Actual:   ${actualStr}`);
    }
}

function assertNotNull(actual, message = '') {
    if (actual === null || actual === undefined) {
        throw new Error(`${message}\n   Expected non-null value, got: ${actual}`);
    }
}

// ============================================================================
// parseProvisionReference tests
// ============================================================================
console.log('\n📋 parseProvisionReference tests\n');

test('Article number only', () => {
    const result = parseProvisionReference('Article 5');
    assertEquals(result.type, 'article');
    assertEquals(result.display, 'Article 5');
    assertEquals(result.anchor, 'article-5');
});

test('Article with paragraph', () => {
    const result = parseProvisionReference('Article 5(1)');
    assertEquals(result.type, 'article');
    assertEquals(result.display, 'Article 5(1)');
    assertEquals(result.anchor, 'article-5-para-1');
});

test('Article with paragraph and point', () => {
    const result = parseProvisionReference('Article 5(1)(a)');
    assertEquals(result.type, 'article');
    assertEquals(result.display, 'Article 5(1)(a)');
    assertEquals(result.anchor, 'article-5-para-1-point-a');
});

test('Article with letter suffix (e.g., 5a)', () => {
    const result = parseProvisionReference('Article 5a');
    assertEquals(result.type, 'article');
    assertEquals(result.display, 'Article 5a');
    assertEquals(result.anchor, 'article-5a');
});

test('Article with letter suffix and paragraph', () => {
    const result = parseProvisionReference('Article 5a(23)');
    assertEquals(result.type, 'article');
    assertEquals(result.display, 'Article 5a(23)');
    assertEquals(result.anchor, 'article-5a-para-23');
});

test('Article with "point" keyword', () => {
    const result = parseProvisionReference('Article 24(2), point (g)');
    assertEquals(result.type, 'article');
    assertEquals(result.anchor, 'article-24-para-2-point-g');
});

test('Recital', () => {
    const result = parseProvisionReference('recital 75');
    assertEquals(result.type, 'recital');
    assertEquals(result.display, 'Recital 75');
    assertEquals(result.anchor, 'recital-75');
});

test('Recital with parentheses', () => {
    const result = parseProvisionReference('Recital (42)');
    assertEquals(result.type, 'recital');
    assertEquals(result.display, 'Recital 42');
    assertEquals(result.anchor, 'recital-42');
});

test('Annex I', () => {
    const result = parseProvisionReference('Annex I');
    assertEquals(result.type, 'annex');
    assertEquals(result.display, 'Annex I');
    assertEquals(result.anchor, 'annex-i');
});

test('Annex VII', () => {
    const result = parseProvisionReference('Annex VII');
    assertEquals(result.type, 'annex');
    assertEquals(result.display, 'Annex VII');
    assertEquals(result.anchor, 'annex-vii');
});

test('Annex IV', () => {
    const result = parseProvisionReference('Annex IV');
    assertEquals(result.type, 'annex');
    assertEquals(result.display, 'Annex IV');
    assertEquals(result.anchor, 'annex-iv');
});

test('Non-provision text returns null', () => {
    const result = parseProvisionReference('This is regular text');
    assertEquals(result, null);
});

// ============================================================================
// parseMultipleProvisions tests
// ============================================================================
console.log('\n📋 parseMultipleProvisions tests\n');

test('Multiple articles', () => {
    const results = parseMultipleProvisions('Articles 4 and 5');
    assertEquals(results.length, 2);
    assertEquals(results[0].anchor, 'article-4');
    assertEquals(results[1].anchor, 'article-5');
});

test('Multiple articles with letter suffix', () => {
    const results = parseMultipleProvisions('Articles 46c and 46d');
    assertEquals(results.length, 2);
    assertEquals(results[0].anchor, 'article-46c');
    assertEquals(results[1].anchor, 'article-46d');
});

test('Multiple recitals', () => {
    const results = parseMultipleProvisions('recitals 10 and 11');
    assertEquals(results.length, 2);
    assertEquals(results[0].anchor, 'recital-10');
    assertEquals(results[1].anchor, 'recital-11');
});

test('Single provision falls back correctly', () => {
    const results = parseMultipleProvisions('Article 5(1)');
    assertEquals(results.length, 1);
    assertEquals(results[0].anchor, 'article-5-para-1');
});

// ============================================================================
// generateArticleAnchor tests
// ============================================================================
console.log('\n📋 generateArticleAnchor tests\n');

test('Article only', () => {
    assertEquals(generateArticleAnchor('5'), 'article-5');
});

test('Article with paragraph', () => {
    assertEquals(generateArticleAnchor('5', '1'), 'article-5-para-1');
});

test('Article with paragraph and point', () => {
    assertEquals(generateArticleAnchor('5', '1', 'a'), 'article-5-para-1-point-a');
});

test('Article with letter suffix', () => {
    assertEquals(generateArticleAnchor('5a'), 'article-5a');
});

test('Article with letter suffix and paragraph', () => {
    assertEquals(generateArticleAnchor('5a', '23'), 'article-5a-para-23');
});

// ============================================================================
// extractDocumentAssociation tests
// ============================================================================
console.log('\n📋 extractDocumentAssociation tests\n');

test('Regulation with (EU) No format', () => {
    const result = extractDocumentAssociation('of Regulation (EU) No 910/2014');
    assertNotNull(result);
    assertEquals(result.type, 'regulation');
    assertEquals(result.year, '910');
    assertEquals(result.number, '2014');
});

test('Directive format', () => {
    const result = extractDocumentAssociation('of Directive (EU) 2022/2555');
    assertNotNull(result);
    assertEquals(result.type, 'directive');
    assertEquals(result.year, '2022');
    assertEquals(result.number, '2555');
});

test('Regulation without No', () => {
    const result = extractDocumentAssociation('of Regulation (EU) 2024/1183');
    assertNotNull(result);
    assertEquals(result.type, 'regulation');
});

test('No document reference returns null', () => {
    const result = extractDocumentAssociation('just some text');
    assertEquals(result, null);
});

// ============================================================================
// findProvisionDocumentAssociations tests
// ============================================================================
console.log('\n📋 findProvisionDocumentAssociations tests\n');

test('Explicit association: Article X of Regulation Y', () => {
    const sentence = 'as required by Article 5(1) of Regulation (EU) No 910/2014';
    const results = findProvisionDocumentAssociations(sentence, []);
    assertEquals(results.length, 1);
    assertEquals(results[0].provision.anchor, 'article-5-para-1');
    assertEquals(results[0].matchType, 'explicit');
});

test('Same-sentence association with document citations', () => {
    const sentence = 'The Article 24(2) requirements apply.';
    const docCitations = [{ celex: '32014R0910', shortName: 'Regulation 910/2014' }];
    const results = findProvisionDocumentAssociations(sentence, docCitations);
    assertEquals(results.length, 1);
    assertEquals(results[0].provision.anchor, 'article-24-para-2');
    assertEquals(results[0].documentCelex, '32014R0910');
    assertEquals(results[0].matchType, 'same-sentence');
});

test('No associations when no provisions or documents', () => {
    const sentence = 'This is a simple sentence.';
    const results = findProvisionDocumentAssociations(sentence, []);
    assertEquals(results.length, 0);
});

// ============================================================================
// generateDeepLinkUrl tests
// ============================================================================
console.log('\n📋 generateDeepLinkUrl tests\n');

test('Add section parameter to simple URL', () => {
    const result = generateDeepLinkUrl('#/regulation/910-2014', 'article-5-para-1');
    assertEquals(result, '#/regulation/910-2014?section=article-5-para-1');
});

test('No anchor returns base URL', () => {
    const result = generateDeepLinkUrl('#/regulation/910-2014', '');
    assertEquals(result, '#/regulation/910-2014');
});

test('URL with existing params uses &', () => {
    const result = generateDeepLinkUrl('#/regulation/910-2014?foo=bar', 'article-5');
    assertEquals(result, '#/regulation/910-2014?foo=bar&section=article-5');
});

// ============================================================================
// containsProvisionReference tests
// ============================================================================
console.log('\n📋 containsProvisionReference tests\n');

test('Contains Article reference', () => {
    assertEquals(containsProvisionReference('See Article 5'), true);
});

test('Contains Recital reference', () => {
    assertEquals(containsProvisionReference('In recital 75'), true);
});

test('Contains Annex reference', () => {
    assertEquals(containsProvisionReference('Annex VII applies'), true);
});

test('No provision reference', () => {
    assertEquals(containsProvisionReference('Regular text'), false);
});

// ============================================================================
// extractAllProvisions tests
// ============================================================================
console.log('\n📋 extractAllProvisions tests\n');

test('Extract multiple provisions from text', () => {
    const text = 'Article 5(1) and Article 24(2), as well as recital 75 and Annex I';
    const results = extractAllProvisions(text);
    assertEquals(results.length, 4);

    const anchors = results.map(r => r.anchor);
    assertEquals(anchors.includes('article-5-para-1'), true);
    assertEquals(anchors.includes('article-24-para-2'), true);
    assertEquals(anchors.includes('recital-75'), true);
    assertEquals(anchors.includes('annex-i'), true);
});

test('Deduplicates provisions', () => {
    const text = 'Article 5(1) is mentioned twice: Article 5(1)';
    const results = extractAllProvisions(text);
    assertEquals(results.length, 1);
});

// ============================================================================
// Summary
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log(`Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log('='.repeat(60));

if (failed > 0) {
    process.exit(1);
}
