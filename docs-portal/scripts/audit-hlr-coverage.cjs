#!/usr/bin/env node
/**
 * ARF HLR Coverage Audit Script
 * 
 * Checks that all ARF High-Level Requirements in the imported topics
 * are either:
 * 1. Referenced in VCQ requirements (arfReference.hlr)
 * 2. Documented in hlr-exclusions.yaml with a reason
 * 
 * Usage: node scripts/audit-hlr-coverage.js [--topics 1,6,7,52]
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '..', 'config');
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

// Default RP-relevant topics
const DEFAULT_RP_TOPICS = [1, 6, 7, 11, 24, 48, 52];

function loadARFData() {
    const arfPath = path.join(DATA_DIR, 'arf-hlr-data.json');
    if (!fs.existsSync(arfPath)) {
        console.error('❌ ARF data not found. Run: npm run build:arf');
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(arfPath, 'utf8'));
}

function loadVCQContent() {
    const vcqDir = path.join(CONFIG_DIR, 'vcq', 'requirements');
    let allContent = '';

    const files = fs.readdirSync(vcqDir).filter(f => f.endsWith('.yaml'));
    files.forEach(f => {
        allContent += fs.readFileSync(path.join(vcqDir, f), 'utf8');
    });

    return allContent;
}

function loadExclusions() {
    const exclPath = path.join(CONFIG_DIR, 'vcq', 'hlr-exclusions.yaml');
    if (!fs.existsSync(exclPath)) {
        console.warn('⚠️  Exclusions file not found');
        return '';
    }
    return fs.readFileSync(exclPath, 'utf8');
}

function auditCoverage(topics = DEFAULT_RP_TOPICS) {
    console.log('🔍 ARF HLR Coverage Audit');
    console.log('='.repeat(50));
    console.log('Topics:', topics.join(', '));
    console.log('');

    const arfData = loadARFData();
    const vcqContent = loadVCQContent();
    const exclusionsContent = loadExclusions();

    // Filter to requested topics
    const targetHlrs = arfData.requirements.filter(r => topics.includes(r.topicNumber));
    console.log(`Total HLRs in target topics: ${targetHlrs.length}`);
    console.log('');

    // Check each HLR
    const results = {
        inVcq: [],
        inExclusions: [],
        missing: []
    };

    targetHlrs.forEach(hlr => {
        // Check if HLR ID appears in VCQ content (handles both single and array patterns)
        const inVcq = vcqContent.includes(hlr.hlrId);
        // Check if HLR ID appears in exclusions (with "- " prefix)
        const inExcl = exclusionsContent.includes(`- ${hlr.hlrId}`);

        if (inVcq) {
            results.inVcq.push(hlr);
        } else if (inExcl) {
            results.inExclusions.push(hlr);
        } else {
            results.missing.push(hlr);
        }
    });

    // Report by topic
    console.log('📊 Coverage by Topic:');
    console.log('-'.repeat(50));

    const byTopic = {};
    targetHlrs.forEach(h => {
        if (!byTopic[h.topicNumber]) {
            byTopic[h.topicNumber] = { total: 0, inVcq: 0, excluded: 0, missing: 0, title: h.topicTitle };
        }
        byTopic[h.topicNumber].total++;
    });

    results.inVcq.forEach(h => byTopic[h.topicNumber].inVcq++);
    results.inExclusions.forEach(h => byTopic[h.topicNumber].excluded++);
    results.missing.forEach(h => byTopic[h.topicNumber].missing++);

    Object.entries(byTopic).forEach(([topic, stats]) => {
        const pct = ((stats.inVcq + stats.excluded) / stats.total * 100).toFixed(0);
        const status = stats.missing === 0 ? '✅' : '⚠️';
        console.log(`${status} Topic ${topic}: ${stats.inVcq} VCQ + ${stats.excluded} excl / ${stats.total} (${pct}%)`);
        console.log(`   ${stats.title}`);
    });

    console.log('');
    console.log('📈 Summary:');
    console.log('-'.repeat(50));
    console.log(`   In VCQ:       ${results.inVcq.length}`);
    console.log(`   Excluded:     ${results.inExclusions.length}`);
    console.log(`   Missing:      ${results.missing.length}`);
    console.log(`   Coverage:     ${((results.inVcq.length + results.inExclusions.length) / targetHlrs.length * 100).toFixed(1)}%`);

    if (results.missing.length > 0) {
        console.log('');
        console.log('❌ Missing HLRs (not in VCQ or exclusions):');
        console.log('-'.repeat(50));
        results.missing.forEach(h => {
            const spec = h.specification.replace(/\n/g, ' ').substring(0, 60);
            console.log(`   ${h.hlrId}: ${spec}...`);
        });
        process.exit(1);
    } else {
        console.log('');
        console.log('✅ All HLRs accounted for!');
    }
}

// Parse command line args
const args = process.argv.slice(2);
let topics = DEFAULT_RP_TOPICS;

const topicsArg = args.find(a => a.startsWith('--topics='));
if (topicsArg) {
    topics = topicsArg.replace('--topics=', '').split(',').map(Number);
}

auditCoverage(topics);
