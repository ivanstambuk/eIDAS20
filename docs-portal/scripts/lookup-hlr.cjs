#!/usr/bin/env node
/**
 * Lightweight ARF HLR lookup script.
 * 
 * Usage:
 *   node scripts/lookup-hlr.cjs <topic_number>       # List all HLRs for a topic
 *   node scripts/lookup-hlr.cjs <hlr_id>             # Look up a specific HLR
 *   node scripts/lookup-hlr.cjs --search <keyword>   # Search HLR text
 * 
 * Created: 2026-02-10 (retro improvement #1)
 * Why: The arf-hlr-data.json file is ~4.7MB. Loading it via `node -e require()`
 *      or `python3 json.load()` in interactive terminal commands hangs indefinitely.
 *      This dedicated script uses streaming and exits cleanly.
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'public', 'data', 'arf-hlr-data.json');

function loadData() {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
}

function lookupByTopic(data, topicNumber) {
    const byTopic = data.byTopic || {};
    const hlrs = byTopic[String(topicNumber)] || [];
    if (hlrs.length === 0) {
        console.log(`No HLRs found for Topic ${topicNumber}`);
        return;
    }
    console.log(`\n=== Topic ${topicNumber} (${hlrs.length} HLRs) ===\n`);
    for (const h of hlrs) {
        const text = (h.text || '').substring(0, 120).replace(/\n/g, ' ');
        console.log(`  ${h.hlrId}: ${text}`);
    }
}

function lookupByHlrId(data, hlrId) {
    const byId = data.byId || {};
    const hlr = byId[hlrId];
    if (!hlr) {
        console.log(`HLR "${hlrId}" not found`);
        return;
    }
    console.log(`\n=== ${hlr.hlrId} (Topic ${hlr.topicNumber || '?'}) ===\n`);
    console.log(`  Text: ${(hlr.text || '').replace(/\n/g, '\n        ')}`);
    if (hlr.category) console.log(`  Category: ${hlr.category}`);
    if (hlr.disposition) console.log(`  Disposition: ${hlr.disposition}`);
}

function searchHlrs(data, keyword) {
    const byId = data.byId || {};
    const lowerKw = keyword.toLowerCase();
    const matches = [];
    for (const [id, hlr] of Object.entries(byId)) {
        if ((hlr.text || '').toLowerCase().includes(lowerKw)) {
            matches.push(hlr);
        }
    }
    if (matches.length === 0) {
        console.log(`No HLRs matching "${keyword}"`);
        return;
    }
    console.log(`\n=== ${matches.length} HLRs matching "${keyword}" ===\n`);
    for (const h of matches.slice(0, 30)) {
        const text = (h.text || '').substring(0, 100).replace(/\n/g, ' ');
        console.log(`  ${h.hlrId} (Topic ${h.topicNumber || '?'}): ${text}`);
    }
    if (matches.length > 30) console.log(`  ... and ${matches.length - 30} more`);
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('Usage:');
    console.log('  node scripts/lookup-hlr.cjs <topic_number>');
    console.log('  node scripts/lookup-hlr.cjs <hlr_id>');
    console.log('  node scripts/lookup-hlr.cjs --search <keyword>');
    process.exit(0);
}

const data = loadData();

if (args[0] === '--search' && args[1]) {
    searchHlrs(data, args.slice(1).join(' '));
} else if (/^\d+$/.test(args[0])) {
    lookupByTopic(data, parseInt(args[0]));
} else {
    lookupByHlrId(data, args[0]);
}

process.exit(0);
