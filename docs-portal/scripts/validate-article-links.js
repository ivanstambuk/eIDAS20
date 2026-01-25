#!/usr/bin/env node
/**
 * Validate Article Links
 * 
 * Checks that all article-link targets (href="#article-X") actually exist
 * as IDs in the document HTML. Reports broken links.
 * 
 * Usage: node scripts/validate-article-links.js
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DATA_DIR = join(__dirname, '..', 'public', 'data', 'regulations');

console.log('🔍 Validating article link targets...\n');

const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
let totalLinks = 0;
let brokenLinks = 0;
const brokenByDoc = {};

for (const file of files) {
    const data = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf-8'));
    const html = data.contentHtml || '';

    // Extract all article-link hrefs
    const linkMatches = html.matchAll(/class="article-link"[^>]*href="#([^"]+)"/g);
    const links = [...linkMatches].map(m => m[1]);

    // Also check data-section attributes (alternative format)
    const sectionMatches = html.matchAll(/class="article-link"[^>]*data-section="([^"]+)"/g);
    const sections = [...sectionMatches].map(m => m[1]);

    const allTargets = [...new Set([...links, ...sections])];

    // Extract all IDs in the document
    const idMatches = html.matchAll(/id="([^"]+)"/g);
    const ids = new Set([...idMatches].map(m => m[1]));

    // Check each target
    const docBroken = [];
    for (const target of allTargets) {
        totalLinks++;
        if (!ids.has(target)) {
            brokenLinks++;
            docBroken.push(target);
        }
    }

    if (docBroken.length > 0) {
        brokenByDoc[data.slug || file] = docBroken;
    }
}

// Report results
if (brokenLinks === 0) {
    console.log(`✅ All ${totalLinks} article link targets are valid\n`);
} else {
    console.log(`❌ Found ${brokenLinks} broken links out of ${totalLinks} total\n`);

    for (const [doc, broken] of Object.entries(brokenByDoc)) {
        console.log(`📄 ${doc}:`);
        for (const target of broken.slice(0, 10)) {
            console.log(`   ⚠️  #${target} (target not found)`);
        }
        if (broken.length > 10) {
            console.log(`   ... and ${broken.length - 10} more`);
        }
        console.log();
    }

    process.exit(1);
}
