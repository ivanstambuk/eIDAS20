#!/usr/bin/env node
/**
 * Normalize Regulation IDs in YAML Files
 * 
 * This script converts regulation IDs from various formats to a consistent
 * YEAR-NUMBER format that matches the regulations-index.json slugs.
 * 
 * Conversions:
 *   - "910/2014" (NUMBER/YEAR) → "2014/910" (YEAR/NUMBER)
 *   - "2014/910" → kept as-is (already correct)
 *   - "GDPR", "eIDAS" → kept as-is (shorthand aliases handled by lookup)
 * 
 * Usage:
 *   node scripts/normalize-regulation-ids.js [--dry-run]
 * 
 * Options:
 *   --dry-run   Show what would be changed without modifying files
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG_DIRS = [
    join(__dirname, '../config/rca/requirements'),
    join(__dirname, '../config/vcq/requirements'),
];

const DRY_RUN = process.argv.includes('--dry-run');

// Known regulation years (to help identify reversed IDs)
const REGULATION_YEARS = new Set([
    '2014', '2015', '2016', '2017', '2018', '2019',
    '2020', '2021', '2022', '2023', '2024', '2025', '2026'
]);

// Pattern to match reversed regulation IDs: NUMBER/YEAR (e.g., "910/2014")
// This captures cases where the number comes before the year
const REVERSED_ID_PATTERN = /regulation:\s*["']?(\d{1,4})\/(\d{4})["']?/g;

/**
 * Check if a regulation ID is in reversed format (NUMBER/YEAR)
 * e.g., "910/2014" should become "2014/910"
 */
function isReversedFormat(num, year) {
    // If the second part is a valid year and the first part is not
    return REGULATION_YEARS.has(year) && !REGULATION_YEARS.has(num);
}

/**
 * Process a single YAML file
 */
function processFile(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    let modified = content;
    const changes = [];

    // Find all regulation ID patterns
    let match;
    const pattern = /regulation:\s*["']?(\d{1,4})\/(\d{4})["']?/g;

    while ((match = pattern.exec(content)) !== null) {
        const [fullMatch, part1, part2] = match;

        // Check if this is reversed (NUMBER/YEAR instead of YEAR/NUMBER)
        if (isReversedFormat(part1, part2)) {
            const oldId = `${part1}/${part2}`;
            const newId = `${part2}/${part1}`;
            changes.push({ old: oldId, new: newId, line: getLineNumber(content, match.index) });
        }
    }

    // Apply changes
    if (changes.length > 0) {
        for (const change of changes) {
            // Use a specific pattern to avoid replacing in text content
            const searchPattern = new RegExp(`(regulation:\\s*)["']?${escapeRegex(change.old)}["']?`, 'g');
            modified = modified.replace(searchPattern, `$1"${change.new}"`);
        }
    }

    return { content, modified, changes };
}

/**
 * Get line number from string index
 */
function getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get all YAML files in a directory recursively
 */
function getYamlFiles(dir) {
    const files = [];

    try {
        const entries = readdirSync(dir);
        for (const entry of entries) {
            const fullPath = join(dir, entry);
            const stat = statSync(fullPath);

            if (stat.isDirectory()) {
                files.push(...getYamlFiles(fullPath));
            } else if (extname(entry) === '.yaml' || extname(entry) === '.yml') {
                files.push(fullPath);
            }
        }
    } catch (err) {
        console.warn(`⚠️  Could not read directory: ${dir}`);
    }

    return files;
}

/**
 * Main execution
 */
function main() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║       Regulation ID Normalizer                               ║');
    console.log('║  Converting NUMBER/YEAR → YEAR/NUMBER format                 ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log();

    if (DRY_RUN) {
        console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }

    let totalFiles = 0;
    let modifiedFiles = 0;
    let totalChanges = 0;

    for (const configDir of CONFIG_DIRS) {
        console.log(`\n📁 Scanning: ${configDir}`);
        const yamlFiles = getYamlFiles(configDir);

        for (const filePath of yamlFiles) {
            totalFiles++;
            const { content, modified, changes } = processFile(filePath);

            if (changes.length > 0) {
                modifiedFiles++;
                totalChanges += changes.length;

                const relativePath = filePath.replace(__dirname + '/../', '');
                console.log(`\n  📄 ${relativePath}`);

                for (const change of changes) {
                    console.log(`     Line ${change.line}: "${change.old}" → "${change.new}"`);
                }

                if (!DRY_RUN) {
                    writeFileSync(filePath, modified, 'utf-8');
                    console.log(`     ✅ Updated`);
                }
            }
        }
    }

    console.log('\n' + '═'.repeat(64));
    console.log(`\n📊 Summary:`);
    console.log(`   Files scanned:  ${totalFiles}`);
    console.log(`   Files modified: ${modifiedFiles}`);
    console.log(`   Total changes:  ${totalChanges}`);

    if (DRY_RUN && totalChanges > 0) {
        console.log(`\n💡 Run without --dry-run to apply changes`);
    } else if (totalChanges > 0) {
        console.log(`\n✅ All regulation IDs normalized successfully!`);
    } else {
        console.log(`\n✅ No changes needed - all IDs already in correct format`);
    }
}

main();
