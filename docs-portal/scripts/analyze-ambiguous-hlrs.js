#!/usr/bin/env node
/**
 * Analyze 32 ambiguous HLRs from VCQ-ARF harmonization
 * These are multi-role requirements needing human judgment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const json = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../public/data/arf-hlr-data.json'),
    'utf-8'
));

const data = json.requirements;

// 32 ambiguous HLRs from hlr-exclusions.yaml
const ambiguous = [
    'RPA_12', 'VCR_07a', 'VCR_07b', 'VCR_14',
    'ISSU_04', 'ISSU_10', 'ISSU_12c', 'ISSU_56', 'ISSU_62', 'ISSU_66',
    'PA_12',
    'ARB_07', 'ARB_08', 'ARB_15', 'ARB_17', 'ARB_19', 'ARB_21',
    'ARB_26', 'ARB_27', 'ARB_29', 'ARB_31', 'ARB_32',
    'QES_17a', 'QES_24a',
    'Reg_16', 'Reg_18',
    'RPACANot_05',
    'TLPub_03', 'TLPub_04', 'TLPub_05',
    'QTSPAS_07a',
    'RPRC_08'
];

// Group by category
const grouped = {};
const notFound = [];

ambiguous.forEach(id => {
    const hlr = data.find(h => h.hlrId === id);
    if (hlr) {
        const key = hlr.category;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({
            id: hlr.hlrId,
            topic: hlr.topicNumber,
            topicTitle: hlr.topicTitle,
            text: hlr.specification
        });
    } else {
        notFound.push(id);
    }
});

console.log('# Ambiguous HLR Analysis');
console.log('');
console.log(`Total: ${ambiguous.length} HLRs flagged for manual review`);
console.log(`Found: ${ambiguous.length - notFound.length} | Not in import: ${notFound.length}`);
console.log('');

Object.keys(grouped).sort().forEach(cat => {
    console.log(`\n## ${cat} (${grouped[cat].length})\n`);
    grouped[cat].forEach((h, i) => {
        console.log(`### ${i + 1}. ${h.id} [Topic ${h.topic}]`);
        console.log(`**Topic:** ${h.topicTitle}`);
        console.log(`\n**Spec:** ${h.text}\n`);
        console.log('---');
    });
});

if (notFound.length > 0) {
    console.log('\n## Not Found in Imported Data\n');
    console.log(notFound.join(', '));
}
