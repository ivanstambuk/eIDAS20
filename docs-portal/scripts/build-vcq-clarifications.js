/**
 * Build script: VCQ Clarification Questions processor
 * 
 * This script processes the clarification questions YAML files and generates
 * a static JSON file for use in the VCQ UI.
 * 
 * Input:
 *   - config/vcq/clarification-questions/*.yaml
 * 
 * Output:
 *   - public/data/vcq-clarification-questions.json
 * 
 * The output is a lookup object keyed by requirement ID (e.g., VEND-CORE-001)
 * containing an array of questions with id, text, dimension, and optional useCaseRef.
 * 
 * Use case scoping convention:
 *   - useCaseRef absent  → question applies to ALL use cases (implicit)
 *   - useCaseRef: ["esignature", "payment-auth"]  → question scoped to specific use cases
 *   - Input accepts both string ("esignature") and array (["esignature"]) — normalised to array in output
 *   - This mirrors the RCA requirement-level `useCases` field convention
 * 
 * Created: 2026-01-30 (Phase 7: UI Integration)
 * Updated: 2026-02-20 (Schema v2: useCaseRef array normalisation)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, '../config/vcq/clarification-questions');
const OUTPUT_FILE = path.join(__dirname, '../public/data/vcq-clarification-questions.json');

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🔧 Building VCQ Clarification Questions data...\n');

// ============================================================================
// Load and process YAML files
// ============================================================================

if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ Clarification questions directory not found: ${INPUT_DIR}`);
    process.exit(1);
}

const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.yaml'));
const clarificationsByReqId = {};
let totalQuestions = 0;
let totalRequirements = 0;

for (const file of files) {
    const filepath = path.join(INPUT_DIR, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    const data = yaml.load(content);

    if (!data.requirements) {
        console.log(`  ⚠️  No requirements found in ${file}`);
        continue;
    }

    let fileQuestionCount = 0;
    let fileReqCount = 0;

    // Process each requirement's questions
    for (const [reqId, reqData] of Object.entries(data.requirements)) {
        if (reqData.questions && Array.isArray(reqData.questions)) {
            clarificationsByReqId[reqId] = reqData.questions.map(q => {
                const question = {
                    id: q.id,
                    text: q.text,
                    dimension: q.dimension
                };
                // Normalise useCaseRef to array (accepts string or array input)
                // Absent useCaseRef = applies to all use cases (implicit)
                if (q.useCaseRef) {
                    question.useCaseRef = Array.isArray(q.useCaseRef)
                        ? q.useCaseRef
                        : [q.useCaseRef];
                }
                return question;
            });
            fileQuestionCount += reqData.questions.length;
            fileReqCount++;
        }
    }

    console.log(`  📄 Loaded ${file}: ${fileReqCount} requirements, ${fileQuestionCount} questions`);
    totalQuestions += fileQuestionCount;
    totalRequirements += fileReqCount;
}

// ============================================================================
// Build statistics
// ============================================================================

// Count questions by dimension
const dimensionCounts = {};
let useCaseTaggedCount = 0;
const useCaseRefCounts = {};
for (const questions of Object.values(clarificationsByReqId)) {
    for (const q of questions) {
        dimensionCounts[q.dimension] = (dimensionCounts[q.dimension] || 0) + 1;
        if (q.useCaseRef) {
            useCaseTaggedCount++;
            for (const uc of q.useCaseRef) {
                useCaseRefCounts[uc] = (useCaseRefCounts[uc] || 0) + 1;
            }
        }
    }
}

// ============================================================================
// Build final output
// ============================================================================

const output = {
    generatedAt: new Date().toISOString(),
    schemaVersion: 2,
    stats: {
        totalRequirements: totalRequirements,
        totalQuestions: totalQuestions,
        useCaseTaggedQuestions: useCaseTaggedCount,
        byDimension: dimensionCounts,
        byUseCaseRef: useCaseRefCounts
    },
    // Main data: reqId -> questions[]
    byRequirementId: clarificationsByReqId
};

// ============================================================================
// Write output
// ============================================================================

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

console.log(`\n✅ VCQ Clarification Questions built successfully!`);
console.log(`   📁 Output: ${OUTPUT_FILE}`);
console.log(`   📊 Stats:`);
console.log(`      - ${totalRequirements} requirements with questions`);
console.log(`      - ${totalQuestions} total questions`);
console.log(`      - ${useCaseTaggedCount} questions with useCaseRef (${totalQuestions - useCaseTaggedCount} use-case-agnostic)`);
console.log(`   📐 By Dimension:`);
const sortedDimensions = Object.entries(dimensionCounts).sort((a, b) => b[1] - a[1]);
for (const [dim, count] of sortedDimensions.slice(0, 8)) {
    console.log(`      - ${dim}: ${count}`);
}
if (sortedDimensions.length > 8) {
    console.log(`      - ... and ${sortedDimensions.length - 8} more dimensions`);
}
if (useCaseTaggedCount > 0) {
    console.log(`   🏷️  By Use Case:`);
    const sortedUseCases = Object.entries(useCaseRefCounts).sort((a, b) => b[1] - a[1]);
    for (const [uc, count] of sortedUseCases) {
        console.log(`      - ${uc}: ${count}`);
    }
}
console.log('');
