/**
 * Tests for Terminology Extraction
 * 
 * These tests ensure that the definition extraction regex patterns in
 * build-terminology.js correctly capture all EU legal definition formats.
 * 
 * Run with: node scripts/test-terminology-extraction.js
 * 
 * History:
 *   2026-01-18: Created after "offline mode" was missed due to "means," pattern
 */

// ============================================================================
// Import the regex patterns directly to test them
// ============================================================================

// Pattern 1: EU modern format - (N) 'term' means definition
// Handles both "means " (space) and "means," (comma) patterns
const defPatternParens = /^(?:-\s*)?\((\d+\w?)\)\s*'([^']+)'\s*means,?\s+([^;.\n]+)(?:[;.]|\n|$)/gm;

// Pattern 2: EC older format - N. 'term' means definition
const defPatternNumbered = /(?:^|>)(\d+)\.\s+'([^']+)'\s*means\s+([^;.<\n]+)(?:[;.]|<|\n|$)/gm;

// ============================================================================
// Test Data - Representative samples from actual regulations
// ============================================================================

const testCases = [
    // Standard pattern: 'term' means definition;
    {
        name: 'Standard pattern with semicolon',
        input: "- (1) 'electronic identification' means the process of using person identification data in electronic form;",
        expectedTerm: 'electronic identification',
        expectedOrdinal: '1',
        pattern: 'parens'
    },

    // Standard pattern: 'term' means definition.
    {
        name: 'Standard pattern with period',
        input: "- (42) 'European Digital Identity Wallet' means an electronic identification means which allows the user.",
        expectedTerm: 'European Digital Identity Wallet',
        expectedOrdinal: '42',
        pattern: 'parens'
    },

    // KEY TEST: "means," pattern (the bug that missed "offline mode")
    {
        name: 'Comma after means (offline mode pattern)',
        input: "- (57) 'offline mode' means, as regards the use of European Digital Identity Wallets, an interaction between a user;",
        expectedTerm: 'offline mode',
        expectedOrdinal: '57',
        pattern: 'parens'
    },

    // Letter suffix ordinal (5a)
    {
        name: 'Letter suffix ordinal',
        input: "- (5a) 'electronic attestation' means a cryptographic attestation;",
        expectedTerm: 'electronic attestation',
        expectedOrdinal: '5a',
        pattern: 'parens'
    },

    // Without leading dash (some documents)
    {
        name: 'Without leading dash',
        input: "(12) 'trust service' means an electronic service normally provided for remuneration;",
        expectedTerm: 'trust service',
        expectedOrdinal: '12',
        pattern: 'parens'
    },

    // EC older format: N. 'term' means
    {
        name: 'EC numbered format',
        input: "3. 'manufacturer' means any natural or legal person who manufactures a product;",
        expectedTerm: 'manufacturer',
        expectedOrdinal: '3',
        pattern: 'numbered'
    },

    // EC format with HTML tags (from raw legal fidelity mode)
    {
        name: 'EC format with HTML li tags',
        input: "<li>9. 'harmonised standard' means a standard adopted by one of the European standardisation bodies;</li>",
        expectedTerm: 'harmonised standard',
        expectedOrdinal: '9',
        pattern: 'numbered'
    },

    // Definition ending with period (not semicolon)
    {
        name: 'EC format ending with period',
        input: "21. 'CE marking' means a marking by which the manufacturer indicates conformity.",
        expectedTerm: 'CE marking',
        expectedOrdinal: '21',
        pattern: 'numbered'
    }
];

// ============================================================================
// Test Runner
// ============================================================================

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
    if (actual !== expected) {
        throw new Error(`${message}\n   Expected: "${expected}"\n   Actual:   "${actual}"`);
    }
}

function assertNotNull(actual, message = '') {
    if (actual === null || actual === undefined) {
        throw new Error(`${message}\n   Expected non-null value, got: ${actual}`);
    }
}

// ============================================================================
// Run Tests
// ============================================================================

console.log('\n📋 Terminology Extraction Pattern Tests\n');
console.log('Testing definition regex patterns from build-terminology.js\n');

for (const tc of testCases) {
    test(tc.name, () => {
        const pattern = tc.pattern === 'parens' ? defPatternParens : defPatternNumbered;

        // Reset regex state (global flag)
        pattern.lastIndex = 0;

        const match = pattern.exec(tc.input);

        assertNotNull(match, `Pattern should match: ${tc.input}`);
        assertEquals(match[1], tc.expectedOrdinal, 'Ordinal mismatch');
        assertEquals(match[2], tc.expectedTerm, 'Term mismatch');

        // Also verify definition is captured (match[3])
        if (!match[3] || match[3].length < 10) {
            throw new Error(`Definition too short or empty: "${match[3]}"`);
        }
    });
}

// ============================================================================
// Additional Edge Case Tests
// ============================================================================

console.log('\n📋 Edge Case Tests\n');

test('Definition with internal commas should be captured correctly', () => {
    defPatternParens.lastIndex = 0;
    const input = "- (55) 'identity matching' means a process where person identification data, or electronic identification means are matched with or linked to an existing account belonging to the same person;";
    const match = defPatternParens.exec(input);

    assertNotNull(match, 'Should match definition with internal commas');
    assertEquals(match[2], 'identity matching', 'Term mismatch');
});

test('Multi-word term with hyphens', () => {
    defPatternParens.lastIndex = 0;
    const input = "- (43) 'wallet-relying party' means a natural or legal person;";
    const match = defPatternParens.exec(input);

    assertNotNull(match, 'Should match hyphenated term');
    assertEquals(match[2], 'wallet-relying party', 'Term mismatch');
});

test('Term with apostrophe/possessive', () => {
    defPatternParens.lastIndex = 0;
    // Note: single quotes inside term are not typical in EU docs
    // but we test for robustness
    const input = "- (99) 'user\\'s data' means information;";

    // This pattern uses [^']+ so won't match escaped quotes - that's OK
    // EU legal documents don't use apostrophes inside term names
    const match = defPatternParens.exec(input);

    // Pattern won't match due to apostrophe - this is expected behavior
    // EU definitions don't have apostrophes in term names
    if (match !== null) {
        throw new Error('Should not match term with embedded apostrophe (not EU format)');
    }
});

test('Multiple definitions in sequence', () => {
    defPatternParens.lastIndex = 0;
    const input = `- (1) 'term one' means first definition;
- (2) 'term two' means second definition;`;

    const match1 = defPatternParens.exec(input);
    assertNotNull(match1, 'Should match first definition');
    assertEquals(match1[2], 'term one', 'First term mismatch');

    const match2 = defPatternParens.exec(input);
    assertNotNull(match2, 'Should match second definition');
    assertEquals(match2[2], 'term two', 'Second term mismatch');
});

// ============================================================================
// Negative Tests - These should NOT match
// ============================================================================

console.log('\n📋 Negative Tests (should not match)\n');

test('Regular text without definition structure', () => {
    defPatternParens.lastIndex = 0;
    const input = "This is a normal paragraph talking about the regulation.";
    const match = defPatternParens.exec(input);

    if (match !== null) {
        throw new Error('Should not match regular text');
    }
});

test('Incomplete definition (no "means")', () => {
    defPatternParens.lastIndex = 0;
    const input = "- (1) 'electronic identification' is defined elsewhere;";
    const match = defPatternParens.exec(input);

    if (match !== null) {
        throw new Error('Should not match definition without "means"');
    }
});

test('Very short definition (< 10 chars) is captured but filtered by build script', () => {
    defPatternParens.lastIndex = 0;
    const input = "- (1) 'x' means y;";
    const match = defPatternParens.exec(input);

    // The regex WILL match, but build-terminology.js filters out definitions < 10 chars
    // We test that the regex at least captures it (the filter happens later)
    assertNotNull(match, 'Regex should match even short definitions');
    // The build script's `if (definition.length < 10) continue;` handles filtering
});

// ============================================================================
// Summary
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log(`Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log('='.repeat(60));

if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the regex patterns in build-terminology.js');
    process.exit(1);
} else {
    console.log('\n✅ All terminology extraction patterns are working correctly');
}
