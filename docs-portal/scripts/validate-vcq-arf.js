/**
 * Validation script: VCQ-ARF Reference Integrity
 * 
 * Validates that all arfReference fields in VCQ requirements point to
 * valid HLR IDs that exist in the ARF data.
 * 
 * Checks:
 * 1. All arfReference.hlr values (string or array) exist in ARF data
 * 2. All arfReference.topic values exist in ARF data
 * 3. All referenced topics are in arf-config.yaml relevantTopics (prevents silent drops)
 * 4. Reports coverage statistics
 * 
 * Usage: node scripts/validate-vcq-arf.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VCQ_DATA = path.join(__dirname, '../public/data/vcq-data.json');
const ARF_DATA = path.join(__dirname, '../public/data/arf-hlr-data.json');
const ARF_CONFIG = path.join(__dirname, '../config/arf/arf-config.yaml');

console.log('🔍 Validating VCQ-ARF Reference Integrity...\n');

// Load data
if (!fs.existsSync(VCQ_DATA)) {
    console.error('❌ VCQ data not found. Run: npm run build:vcq');
    process.exit(1);
}

if (!fs.existsSync(ARF_DATA)) {
    console.error('❌ ARF data not found. Run: npm run build:arf');
    process.exit(1);
}

const vcq = JSON.parse(fs.readFileSync(VCQ_DATA, 'utf-8'));
const arf = JSON.parse(fs.readFileSync(ARF_DATA, 'utf-8'));

// Load ARF config for relevantTopics cross-check
let relevantTopics = null;
if (fs.existsSync(ARF_CONFIG)) {
    try {
        const arfConfig = yaml.load(fs.readFileSync(ARF_CONFIG, 'utf-8'));
        if (arfConfig.relevantTopics && Array.isArray(arfConfig.relevantTopics)) {
            relevantTopics = new Set(arfConfig.relevantTopics);
        }
    } catch (e) {
        console.warn(`⚠️  Could not load ARF config: ${e.message}`);
    }
}

// Build ARF lookup sets
const validHlrIds = new Set(arf.requirements.map(r => r.hlrId));
const validTopics = new Set(arf.requirements.map(r => `Topic ${r.topicNumber}`));

// Build HLR to topic mapping for consistency checks
const hlrToTopic = new Map();
for (const r of arf.requirements) {
    hlrToTopic.set(r.hlrId, r.topicNumber);
}

// ========================================================================
// Cross-check: VCQ-referenced topics vs arf-config.yaml relevantTopics
// Catches the bug where a topic is referenced in VCQ YAML but not in the
// import filter, causing HLR lookups to silently fail.
// ========================================================================
if (relevantTopics) {
    const vcqReferencedTopics = new Set();
    for (const req of vcq.requirements) {
        if (!req.arfReference?.topic) continue;
        const topicNum = parseInt(req.arfReference.topic.replace('Topic ', ''), 10);
        if (!isNaN(topicNum)) {
            vcqReferencedTopics.add(topicNum);
        }
    }

    const missingFromConfig = [...vcqReferencedTopics].filter(t => !relevantTopics.has(t)).sort((a, b) => a - b);
    if (missingFromConfig.length > 0) {
        console.log(`\n🚨 CRITICAL: Topics referenced in VCQ but MISSING from arf-config.yaml relevantTopics:\n`);
        for (const topic of missingFromConfig) {
            console.log(`   Topic ${topic} — HLRs from this topic are NOT being imported!`);
            console.log(`   → Add ${topic} to relevantTopics in config/arf/arf-config.yaml`);
        }
        console.log('');
        // This is a critical config error — treat as validation failure
        process.exit(1);
    } else {
        console.log(`✅ All ${vcqReferencedTopics.size} VCQ-referenced topics are in arf-config.yaml relevantTopics`);
    }
}

// Validation results
const errors = [];
const warnings = [];
let totalWithArfRef = 0;
const coveredHlrs = new Set();

// Validate each requirement
for (const req of vcq.requirements) {
    if (!req.arfReference) continue;

    totalWithArfRef++;

    const statedTopic = req.arfReference.topic;
    const statedTopicNum = statedTopic ? parseInt(statedTopic.replace('Topic ', ''), 10) : null;

    // Validate topic exists
    if (statedTopic && !validTopics.has(statedTopic)) {
        errors.push({
            id: req.id,
            type: 'INVALID_TOPIC',
            value: statedTopic,
            message: `Topic "${statedTopic}" not found in ARF data`
        });
    }

    // Validate HLR(s)
    const hlrs = req.arfReference.hlr;
    if (!hlrs) {
        warnings.push({
            id: req.id,
            type: 'MISSING_HLR',
            message: 'arfReference has topic but no hlr field'
        });
        continue;
    }

    // Support both string and array formats
    const hlrArray = Array.isArray(hlrs) ? hlrs : [hlrs];

    for (const hlrId of hlrArray) {
        if (!validHlrIds.has(hlrId)) {
            errors.push({
                id: req.id,
                type: 'INVALID_HLR',
                value: hlrId,
                message: `HLR "${hlrId}" not found in ARF data`
            });
        } else {
            coveredHlrs.add(hlrId);

            // Check topic-HLR consistency
            const actualTopic = hlrToTopic.get(hlrId);
            if (statedTopicNum && actualTopic && actualTopic !== statedTopicNum) {
                warnings.push({
                    id: req.id,
                    type: 'TOPIC_MISMATCH',
                    value: hlrId,
                    message: `HLR "${hlrId}" belongs to Topic ${actualTopic}, but arfReference states Topic ${statedTopicNum}`
                });
            }
        }
    }
}

// Output results
console.log('📊 Validation Results\n');
console.log('─'.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All arfReference fields are valid!\n');
} else {
    if (errors.length > 0) {
        console.log(`\n❌ ERRORS (${errors.length}):\n`);
        for (const err of errors) {
            console.log(`   ${err.id}: ${err.message}`);
        }
    }

    if (warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS (${warnings.length}):\n`);
        for (const warn of warnings) {
            console.log(`   ${warn.id}: ${warn.message}`);
        }
    }
}

// Coverage stats
const totalArfHlrs = arf.requirements.filter(r => !r.isEmpty).length;
const coveragePercent = ((coveredHlrs.size / totalArfHlrs) * 100).toFixed(1);

console.log('\n📈 Coverage Statistics\n');
console.log('─'.repeat(50));
console.log(`   VCQ Requirements:        ${vcq.requirements.length}`);
console.log(`   With arfReference:       ${totalWithArfRef}`);
console.log(`   Unique HLRs covered:     ${coveredHlrs.size}`);
console.log(`   Total ARF HLRs:          ${totalArfHlrs}`);
console.log(`   Coverage rate:           ${coveragePercent}%`);
console.log('');

// Exit with error code if validation failed
if (errors.length > 0) {
    process.exit(1);
}
