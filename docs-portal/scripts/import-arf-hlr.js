#!/usr/bin/env node
/**
 * Import ARF High-Level Requirements from CSV
 * 
 * Parses the official ARF HLR CSV file and converts to structured JSON
 * with role mapping, compliance level extraction, and cross-references.
 * 
 * Usage: node scripts/import-arf-hlr.js
 * 
 * Input:  ../03_arf/hltr/high-level-requirements.csv
 * Output: config/requirements/arf-hlr.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_CSV = path.resolve(__dirname, '../../03_arf/hltr/high-level-requirements.csv');
const OUTPUT_JSON = path.resolve(__dirname, '../config/requirements/arf-hlr.json');

// Role mapping from ARF actors to our terminology
const ROLE_MAPPING = {
    // Direct mappings
    'wallet provider': 'wallet_provider',
    'wallet providers': 'wallet_provider',
    'wallet unit': 'wallet_provider',
    'wallet units': 'wallet_provider',
    'wallet instance': 'wallet_provider',
    'wallet solution': 'wallet_provider',
    'relying party': 'relying_party',
    'relying parties': 'relying_party',
    'relying party instance': 'relying_party',
    'pid provider': 'pid_provider',
    'pid providers': 'pid_provider',
    'attestation provider': 'eaa_provider',
    'attestation providers': 'eaa_provider',
    'qeaa provider': 'eaa_provider',
    'qeaa providers': 'eaa_provider',
    'pub-eaa provider': 'eaa_provider',
    'eaa provider': 'eaa_provider',
    'qtsp': 'qtsp',
    'qtsps': 'qtsp',
    'trust service provider': 'qtsp',
    'access certificate authority': 'trusted_list',
    'intermediary': 'intermediary',
    'intermediaries': 'intermediary',
    'member state': 'supervisory',
    'member states': 'supervisory',
    'commission': 'supervisory',
    'registrar': 'supervisory',
    'user': 'holder',
    'users': 'holder',
};

// Category normalization
const CATEGORY_MAPPING = {
    'protocols & interoperability': 'protocols',
    'data models & attestation rules': 'data-models',
    'wallet providers': 'wallet-provider',
    'relying parties': 'relying-party',
    'attestation & pid providers': 'attestation-provider',
};

/**
 * Parse CSV content (semicolon-delimited)
 */
function parseCSV(content) {
    const lines = content.split('\n');
    const headers = lines[0].split(';').map(h => h.trim().replace(/^\uFEFF/, '')); // Remove BOM

    const records = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle quoted fields with semicolons
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ';' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        const record = {};
        headers.forEach((header, idx) => {
            record[header] = values[idx] || '';
        });

        records.push(record);
    }

    return records;
}

/**
 * Extract roles from requirement text and part
 */
function extractRoles(text, part) {
    const roles = new Set();
    const lowerText = (text + ' ' + part).toLowerCase();

    // Check for role mentions
    for (const [pattern, role] of Object.entries(ROLE_MAPPING)) {
        if (lowerText.includes(pattern)) {
            roles.add(role);
        }
    }

    // Default based on Part
    if (roles.size === 0) {
        if (part.includes('Wallet Providers')) {
            roles.add('wallet_provider');
        } else if (part.includes('Relying Parties')) {
            roles.add('relying_party');
        } else if (part.includes('Attestation') || part.includes('PID')) {
            roles.add('eaa_provider');
            roles.add('pid_provider');
        }
    }

    return Array.from(roles);
}

/**
 * Extract compliance level from requirement text
 */
function extractComplianceLevel(text) {
    // Priority order: SHALL > SHOULD > MAY
    if (/\bSHALL\b/.test(text)) {
        return 'mandatory';
    } else if (/\bSHOULD\b/.test(text)) {
        return 'recommended';
    } else if (/\bMAY\b/.test(text)) {
        return 'optional';
    }
    return 'mandatory'; // Default for unclear cases
}

/**
 * Extract criticality based on keywords and topic
 */
function extractCriticality(text, topicTitle) {
    const criticalKeywords = ['security', 'authentic', 'verif', 'revoc', 'cryptograph', 'trust'];
    const lowerText = (text + ' ' + topicTitle).toLowerCase();

    for (const keyword of criticalKeywords) {
        if (lowerText.includes(keyword)) {
            return 'critical';
        }
    }

    if (/\bSHALL\b/.test(text)) {
        return 'high';
    } else if (/\bSHOULD\b/.test(text)) {
        return 'medium';
    }

    return 'medium';
}

/**
 * Normalize category name
 */
function normalizeCategory(category) {
    const lower = category.toLowerCase();
    return CATEGORY_MAPPING[lower] || lower.replace(/\s+/g, '-');
}

/**
 * Extract technical references from text
 */
function extractTechnicalReferences(text) {
    const refs = [];

    // Match [Technical Specification N] patterns
    const tsMatches = text.matchAll(/\[Technical Specification (\d+)\]/gi);
    for (const match of tsMatches) {
        refs.push({
            specification: `TS${match[1]}`,
            scope: 'full'
        });
    }

    // Match [ISO/IEC XXXX] patterns
    const isoMatches = text.matchAll(/\[ISO\/IEC\s+([\d-]+)\]/gi);
    for (const match of isoMatches) {
        refs.push({
            specification: `ISO/IEC ${match[1]}`,
            scope: 'full'
        });
    }

    // Match [OpenID4VP], [OpenID4VCI], [SD-JWT VC] patterns
    const oidMatches = text.matchAll(/\[(OpenID4VP|OpenID4VCI|SD-JWT VC|HAIP)\]/gi);
    for (const match of oidMatches) {
        refs.push({
            specification: match[1],
            scope: 'full'
        });
    }

    return refs;
}

/**
 * Check if requirement is empty or placeholder
 */
function isEmptyRequirement(text) {
    return !text || text.toLowerCase().trim() === 'empty' || text.trim() === '';
}

/**
 * Transform ARF record to unified schema
 */
function transformRecord(record) {
    const requirementText = record['Requirement_specification'] || '';

    // Skip empty requirements
    if (isEmptyRequirement(requirementText)) {
        return null;
    }

    const id = record['Index'] || '';
    const harmonizedId = record['Harmonized_ID'] || '';
    const part = record['Part'] || '';
    const category = record['Category'] || '';
    const topic = record['Topic'] || '';
    const topicNumber = parseInt(record['Topic_Number'], 10) || 0;
    const topicTitle = record['Topic_Title'] || '';
    const subsection = record['Subsection'] || '';
    const notes = record['Notes'] || '';

    return {
        id,
        harmonizedId,
        source: 'arf-hlr',
        requirement: requirementText,
        notes: notes || undefined,
        category: normalizeCategory(category),
        part,
        arfTopic: {
            number: topicNumber,
            title: topicTitle,
            subsection: subsection || undefined,
        },
        roles: extractRoles(requirementText, part),
        complianceLevel: extractComplianceLevel(requirementText),
        criticality: extractCriticality(requirementText, topicTitle),
        technicalReferences: extractTechnicalReferences(requirementText + ' ' + notes),
    };
}

/**
 * Main import function
 */
async function main() {
    console.log('📥 Importing ARF High-Level Requirements...');
    console.log(`   Source: ${INPUT_CSV}`);

    // Check if source file exists
    if (!fs.existsSync(INPUT_CSV)) {
        console.error(`❌ Source file not found: ${INPUT_CSV}`);
        process.exit(1);
    }

    // Read CSV
    const csvContent = fs.readFileSync(INPUT_CSV, 'utf-8');
    console.log(`   Read ${csvContent.length} bytes`);

    // Parse CSV
    const records = parseCSV(csvContent);
    console.log(`   Parsed ${records.length} records`);

    // Transform records
    const requirements = records
        .map(transformRecord)
        .filter(r => r !== null);

    console.log(`   Transformed ${requirements.length} valid requirements`);

    // Calculate statistics
    const stats = {
        total: requirements.length,
        bySource: { 'arf-hlr': requirements.length },
        byComplianceLevel: {},
        byCriticality: {},
        byCategory: {},
        byTopic: {},
        byRole: {},
    };

    for (const req of requirements) {
        // Compliance level
        stats.byComplianceLevel[req.complianceLevel] =
            (stats.byComplianceLevel[req.complianceLevel] || 0) + 1;

        // Criticality
        stats.byCriticality[req.criticality] =
            (stats.byCriticality[req.criticality] || 0) + 1;

        // Category
        stats.byCategory[req.category] =
            (stats.byCategory[req.category] || 0) + 1;

        // Topic
        const topicKey = `Topic ${req.arfTopic.number}`;
        stats.byTopic[topicKey] = (stats.byTopic[topicKey] || 0) + 1;

        // Roles
        for (const role of req.roles) {
            stats.byRole[role] = (stats.byRole[role] || 0) + 1;
        }
    }

    // Build output
    const output = {
        $schema: './arf-hlr.schema.json',
        $comment: 'Auto-generated from ARF HLR CSV. Do not edit manually.',
        generatedAt: new Date().toISOString(),
        sourceFile: '03_arf/hltr/high-level-requirements.csv',
        stats,
        requirements,
    };

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_JSON);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write output
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));
    console.log(`\n✅ Output written to: ${OUTPUT_JSON}`);

    // Print statistics
    console.log('\n📊 Statistics:');
    console.log(`   Total requirements: ${stats.total}`);
    console.log(`   By compliance level:`);
    for (const [level, count] of Object.entries(stats.byComplianceLevel)) {
        console.log(`     - ${level}: ${count}`);
    }
    console.log(`   By criticality:`);
    for (const [level, count] of Object.entries(stats.byCriticality)) {
        console.log(`     - ${level}: ${count}`);
    }
    console.log(`   Top 5 topics:`);
    const topTopics = Object.entries(stats.byTopic)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    for (const [topic, count] of topTopics) {
        console.log(`     - ${topic}: ${count}`);
    }
    console.log(`   By role:`);
    for (const [role, count] of Object.entries(stats.byRole).sort((a, b) => b[1] - a[1])) {
        console.log(`     - ${role}: ${count}`);
    }
}

main().catch(console.error);
