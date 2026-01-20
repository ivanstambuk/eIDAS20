#!/usr/bin/env node

/**
 * rename-requirement-ids.js
 * 
 * Renames all RCA requirement IDs to match their atomic categories.
 * Format: {ROLE}-{CATEGORY_PREFIX}-{NNN}
 * 
 * Usage:
 *   node scripts/rename-requirement-ids.js --dry-run   # Preview changes
 *   node scripts/rename-requirement-ids.js             # Apply changes
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration - paths relative to docs-portal/scripts
const REQUIREMENTS_DIR = path.join(__dirname, '../config/rca/requirements');
const MAPPING_OUTPUT = path.join(__dirname, '../../.agent/session/id-migration-map.json');

// Category → 3-letter prefix mapping
const CATEGORY_PREFIXES = {
    registration: 'REG',
    certification: 'CRT',
    issuance: 'ISS',
    revocation: 'REV',
    verification: 'VER',
    technical: 'TEC',
    interoperability: 'IOP',
    security: 'SEC',
    privacy: 'PRV',
    transparency: 'TRN',
    governance: 'GOV',
    liability: 'LIA'
};

// Role file → role prefix mapping
const ROLE_PREFIXES = {
    'relying-party.yaml': 'RP',
    'wallet-provider.yaml': 'WP',
    'issuer.yaml': 'EAA',
    'pid-provider.yaml': 'PID',
    'trust-service-provider.yaml': 'TSP',
    'conformity-assessment-body.yaml': 'CAB',
    'supervisory-body.yaml': 'SB'
};

// Parse command line
const isDryRun = process.argv.includes('--dry-run');

console.log(`\n🔄 Requirement ID Renumbering Script`);
console.log(`   Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'APPLY CHANGES'}\n`);

// Global mapping for all old→new IDs
const idMapping = {};
let totalBefore = 0;
let totalAfter = 0;

// Process each role file
const roleFiles = fs.readdirSync(REQUIREMENTS_DIR).filter(f => f.endsWith('.yaml'));

for (const roleFile of roleFiles) {
    const filePath = path.join(REQUIREMENTS_DIR, roleFile);
    const rolePrefix = ROLE_PREFIXES[roleFile];

    if (!rolePrefix) {
        console.log(`⚠️  Skipping unknown file: ${roleFile}`);
        continue;
    }

    console.log(`\n📁 Processing ${roleFile} (${rolePrefix}-*)`);

    // Read and parse YAML
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);

    if (!data.requirements || !Array.isArray(data.requirements)) {
        console.log(`   ⚠️  No requirements array found`);
        continue;
    }

    const requirements = data.requirements;
    totalBefore += requirements.length;

    // Group by category
    const byCategory = {};
    for (const req of requirements) {
        const cat = req.category;
        if (!byCategory[cat]) {
            byCategory[cat] = [];
        }
        byCategory[cat].push(req);
    }

    // Sort categories alphabetically
    const sortedCategories = Object.keys(byCategory).sort();

    // Validate all categories have prefixes
    for (const cat of sortedCategories) {
        if (!CATEGORY_PREFIXES[cat]) {
            console.error(`   ❌ ERROR: Unknown category "${cat}" in ${roleFile}`);
            console.error(`      Valid categories: ${Object.keys(CATEGORY_PREFIXES).join(', ')}`);
            process.exit(1);
        }
    }

    // Build new requirements array with new IDs
    const newRequirements = [];
    const categoryStats = {};

    for (const cat of sortedCategories) {
        const catPrefix = CATEGORY_PREFIXES[cat];
        const reqs = byCategory[cat];
        let counter = 1;

        categoryStats[cat] = reqs.length;

        for (const req of reqs) {
            const oldId = req.id;
            const newId = `${rolePrefix}-${catPrefix}-${String(counter).padStart(3, '0')}`;

            // Store mapping
            idMapping[oldId] = newId;

            // Update requirement
            const newReq = { ...req, id: newId };
            newRequirements.push(newReq);

            counter++;
        }
    }

    totalAfter += newRequirements.length;

    // Print category stats
    console.log(`   Categories:`);
    for (const cat of sortedCategories) {
        const prefix = CATEGORY_PREFIXES[cat];
        console.log(`     ${cat} (${prefix}): ${categoryStats[cat]} requirements`);
    }
    console.log(`   Total: ${requirements.length} → ${newRequirements.length}`);

    // Update data
    data.requirements = newRequirements;

    // Write back if not dry run
    if (!isDryRun) {
        // Preserve YAML formatting with custom dump options
        const newContent = yaml.dump(data, {
            lineWidth: -1,  // Don't wrap lines
            noRefs: true,   // Don't use anchors/aliases
            quotingType: '"',
            forceQuotes: false,
            styles: {
                '!!str': 'literal'  // Use | for multiline strings
            }
        });
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`   ✅ Written to ${roleFile}`);
    }
}

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`📊 Summary`);
console.log(`   Total requirements: ${totalBefore} → ${totalAfter}`);
console.log(`   IDs renamed: ${Object.keys(idMapping).length}`);

if (totalBefore !== totalAfter) {
    console.error(`\n❌ ERROR: Requirement count mismatch!`);
    process.exit(1);
}

// Check for duplicate new IDs
const newIds = Object.values(idMapping);
const duplicates = newIds.filter((id, i) => newIds.indexOf(id) !== i);
if (duplicates.length > 0) {
    console.error(`\n❌ ERROR: Duplicate new IDs detected:`);
    duplicates.forEach(d => console.error(`   ${d}`));
    process.exit(1);
}

console.log(`   ✅ No duplicate IDs`);

// Write mapping file
if (!isDryRun) {
    fs.writeFileSync(MAPPING_OUTPUT, JSON.stringify(idMapping, null, 2), 'utf8');
    console.log(`\n📝 Mapping saved to: ${MAPPING_OUTPUT}`);
}

// Print sample mappings
console.log(`\n📋 Sample mappings:`);
const samples = Object.entries(idMapping).slice(0, 10);
for (const [old, newId] of samples) {
    console.log(`   ${old} → ${newId}`);
}
console.log(`   ... (${Object.keys(idMapping).length - 10} more)`);

if (isDryRun) {
    console.log(`\n✨ Dry run complete. Run without --dry-run to apply changes.`);
} else {
    console.log(`\n✨ ID renumbering complete!`);
}
