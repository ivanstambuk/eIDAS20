#!/usr/bin/env node
/**
 * Subtitle/Description Validation Test
 * 
 * Ensures all document JSON files have proper description fields that:
 * 1. Are not preamble text (detect "EUROPEAN COMMISSION", "Having regard")
 * 2. Are not too short (likely incomplete H1 titles)
 * 3. Start with proper legal document format (e.g., "Regulation", "Commission")
 * 
 * Run: node scripts/validate-subtitles.js
 * Part of: npm run validate (via build pipeline)
 */

import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REGULATIONS_DIR = join(__dirname, '../public/data/regulations');

// Patterns that indicate broken description extraction
const BROKEN_PATTERNS = [
    /^THE EUROPEAN/i,
    /^EUROPEAN PARLIAMENT/i,
    /^\*?Having regard/i,
    /^Whereas:/i,
    /^Acting in accordance/i,
];

// Minimum description length (full legal titles should be substantial)
const MIN_DESCRIPTION_LENGTH = 80;

// Valid title prefixes for EU legal documents
const VALID_PREFIXES = [
    /^Regulation \(EU\)/i,
    /^Regulation \(EC\)/i,
    /^Commission Implementing Regulation/i,
    /^Commission Delegated Regulation/i,
    /^Commission Recommendation/i,
    /^Directive \(EU\)/i,
    /^Decision \(EU\)/i,
    // Supplementary documents may have other formats
];

function validateSubtitles() {
    const files = readdirSync(REGULATIONS_DIR).filter(f => f.endsWith('.json'));
    const errors = [];
    const warnings = [];

    console.log('🔍 Validating document subtitles/descriptions...\n');

    for (const file of files) {
        const filePath = join(REGULATIONS_DIR, file);
        const data = JSON.parse(readFileSync(filePath, 'utf-8'));
        const { shortTitle, description, title } = data;

        // Check for broken preamble extraction
        for (const pattern of BROKEN_PATTERNS) {
            if (pattern.test(description)) {
                errors.push({
                    file,
                    shortTitle,
                    issue: 'Preamble text in description',
                    detail: `Description starts with preamble: "${description.slice(0, 50)}..."`,
                    fix: 'Check H1 heading in source markdown - must be complete legal title'
                });
                break;
            }
        }

        // Check minimum length
        if (description && description.length < MIN_DESCRIPTION_LENGTH) {
            warnings.push({
                file,
                shortTitle,
                issue: 'Description too short',
                detail: `Length: ${description.length} chars (min: ${MIN_DESCRIPTION_LENGTH})`,
                description: description
            });
        }

        // Check valid prefix (skip supplementary docs)
        if (data.legalType !== 'supplementary') {
            const hasValidPrefix = VALID_PREFIXES.some(p => p.test(description));
            if (!hasValidPrefix && description) {
                warnings.push({
                    file,
                    shortTitle,
                    issue: 'Non-standard title format',
                    detail: `Starts with: "${description.slice(0, 40)}..."`
                });
            }
        }
    }

    // Report results
    if (errors.length > 0) {
        console.log('❌ ERRORS (must fix):\n');
        for (const err of errors) {
            console.log(`   ${err.file} (${err.shortTitle})`);
            console.log(`   Issue: ${err.issue}`);
            console.log(`   ${err.detail}`);
            console.log(`   Fix: ${err.fix}\n`);
        }
    }

    if (warnings.length > 0) {
        console.log('⚠️  WARNINGS:\n');
        for (const warn of warnings) {
            console.log(`   ${warn.file} (${warn.shortTitle})`);
            console.log(`   Issue: ${warn.issue}`);
            console.log(`   ${warn.detail}\n`);
        }
    }

    if (errors.length === 0 && warnings.length === 0) {
        console.log('✅ All subtitles validated successfully!\n');
    }

    console.log(`📊 Summary: ${files.length} documents, ${errors.length} errors, ${warnings.length} warnings`);

    // Exit with error code if there are errors
    if (errors.length > 0) {
        process.exit(1);
    }
}

validateSubtitles();
