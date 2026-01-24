#!/usr/bin/env node

/**
 * Validate Annex Content
 * 
 * Detects implementing acts with empty ANNEX sections (## ANNEX heading
 * followed by no content). This catches Formex converter truncation issues.
 * 
 * Usage: node scripts/validate-annex-content.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const IMPLEMENTING_ACTS_DIR = path.join(ROOT_DIR, '02_implementing_acts');

function validateAnnexContent() {
    console.log('🔍 Validating annex content in implementing acts...\n');

    const issues = [];
    const valid = [];

    // Get all implementing act directories
    const dirs = fs.readdirSync(IMPLEMENTING_ACTS_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

    for (const dir of dirs) {
        const dirPath = path.join(IMPLEMENTING_ACTS_DIR, dir);
        const mdFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));

        for (const mdFile of mdFiles) {
            const filePath = path.join(dirPath, mdFile);
            const content = fs.readFileSync(filePath, 'utf-8');

            // Check for ANNEX heading
            const annexMatch = content.match(/^## ANNEX\s*$/m);

            if (annexMatch) {
                const annexIndex = content.indexOf(annexMatch[0]);
                const afterAnnex = content.slice(annexIndex + annexMatch[0].length).trim();

                // Check if there's substantial content after ANNEX
                // Allow for some whitespace but flag if < 50 chars of actual content
                const contentAfterAnnex = afterAnnex.replace(/^\s+/, '');

                if (contentAfterAnnex.length < 50) {
                    issues.push({
                        file: path.relative(ROOT_DIR, filePath),
                        issue: 'Empty or truncated ANNEX section',
                        contentLength: contentAfterAnnex.length
                    });
                } else {
                    valid.push({
                        file: path.relative(ROOT_DIR, filePath),
                        contentLength: contentAfterAnnex.length
                    });
                }
            }
        }
    }

    // Report results
    if (valid.length > 0) {
        console.log(`✅ ${valid.length} implementing acts with valid ANNEX content\n`);
    }

    if (issues.length > 0) {
        console.log('❌ Issues found:\n');
        for (const issue of issues) {
            console.log(`   📄 ${issue.file}`);
            console.log(`      ⚠️  ${issue.issue} (${issue.contentLength} chars after heading)\n`);
        }
        console.log(`\n💡 Fix: Retrieve annex content from EUR-Lex and update the Markdown files.\n`);
        process.exit(1);
    } else {
        console.log('✅ All ANNEX sections have content.\n');
    }
}

validateAnnexContent();
