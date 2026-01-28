/**
 * Import ARF High-Level Requirements from GitHub CSV
 * 
 * This script downloads the official ARF CSV from GitHub, parses it,
 * and generates a JSON file for use in the VCQ tool and portal search.
 * 
 * Input:
 *   - config/arf/arf-config.yaml (configuration)
 *   - GitHub CSV (fetched at runtime)
 * 
 * Output:
 *   - public/data/arf-hlr-data.json
 * 
 * Usage:
 *   npm run build:arf
 * 
 * Created: 2026-01-23
 * Decision: DEC-223
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_FILE = path.join(__dirname, '../config/arf/arf-config.yaml');
const OUTPUT_DIR = path.join(__dirname, '../public/data');

console.log('📐 Importing ARF High-Level Requirements...\n');

// ============================================================================
// Load Configuration
// ============================================================================

function loadConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        console.error(`❌ Config file not found: ${CONFIG_FILE}`);
        process.exit(1);
    }
    const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return yaml.load(content);
}

const config = loadConfig();
console.log(`📄 Loaded config from ${path.basename(CONFIG_FILE)}`);

// ============================================================================
// Fetch CSV from GitHub
// ============================================================================

async function fetchCSV(url) {
    console.log(`🌐 Fetching CSV from GitHub...`);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }

    let text = await response.text();

    // Remove BOM if present
    if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
    }

    return text;
}

// ============================================================================
// Parse CSV
// ============================================================================

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(';').map(h => h.trim());

    console.log(`   Headers: ${headers.join(', ')}`);

    const requirements = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;

        const record = {};
        headers.forEach((header, idx) => {
            record[header] = values[idx]?.trim() || '';
        });

        requirements.push(record);
    }

    console.log(`   Parsed ${requirements.length} raw records`);
    return requirements;
}

// Handle quoted fields with semicolons inside
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ';' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);

    return result;
}

// ============================================================================
// Process Requirements
// ============================================================================

function processRequirements(rawRequirements, config) {
    const { relevantTopics, topicAnchors, settings } = config;
    const baseUrl = `${config.source.baseUrl}/${config.source.byTopicDoc}`;

    const processed = [];
    const byHlrId = {};
    const byTopic = {};
    const topicMetadata = {};

    for (const raw of rawRequirements) {
        const topicNumber = parseInt(raw.Topic_Number, 10);
        const hlrId = raw.Index;
        const specification = raw.Requirement_specification;

        // Skip if no HLR ID
        if (!hlrId) continue;

        // Skip "Empty" specifications unless configured to include
        const isEmpty = specification === 'Empty' || !specification;
        if (isEmpty && !settings.includeEmpty) continue;

        // Filter by relevant topics if configured
        if (relevantTopics && relevantTopics.length > 0) {
            if (!relevantTopics.includes(topicNumber)) continue;
        }

        // Build deep link with subsection precision if available
        const subsection = raw.Subsection || null;
        let anchor = topicAnchors?.[topicNumber] || '';

        // If we have a subsection, generate a more precise anchor
        // GitHub anchor format: lowercase, spaces→hyphens, remove special chars
        // Example: "D. Requirements on the presentation..." → "d-requirements-on-the-presentation-..."
        if (subsection) {
            const subsectionAnchor = subsection
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')  // Remove special chars except hyphens
                .replace(/\s+/g, '-')       // Spaces to hyphens
                .replace(/-+/g, '-')        // Collapse multiple hyphens
                .trim();
            if (subsectionAnchor) {
                anchor = subsectionAnchor;
            }
        }

        const deepLink = anchor ? `${baseUrl}#${anchor}` : baseUrl;

        // Process the requirement
        const requirement = {
            // Identity
            harmonizedId: raw.Harmonized_ID,
            hlrId: hlrId,

            // Classification
            part: raw.Part?.includes('Ecosystem') ? 'ecosystem' : 'actor-specific',
            category: raw.Category,
            topicNumber: topicNumber,
            topicTitle: raw.Topic_Title,
            subsection: subsection,

            // Content
            specification: specification,
            notes: raw.Notes || null,

            // Generated
            isEmpty: isEmpty,
            deepLink: deepLink,
        };

        // Add search text if configured
        if (settings.generateSearchText) {
            requirement.searchText = [
                hlrId,
                raw.Topic_Title,
                specification,
                raw.Notes
            ].filter(Boolean).join(' ').toLowerCase();
        }

        processed.push(requirement);

        // Index by HLR ID
        byHlrId[hlrId] = requirement;

        // Index by topic
        if (!byTopic[topicNumber]) {
            byTopic[topicNumber] = [];
        }
        byTopic[topicNumber].push(requirement);

        // Track topic metadata
        if (!topicMetadata[topicNumber]) {
            topicMetadata[topicNumber] = {
                number: topicNumber,
                title: raw.Topic_Title,
                anchor: anchor,
                hlrCount: 0
            };
        }
        topicMetadata[topicNumber].hlrCount++;
    }

    return { processed, byHlrId, byTopic, topicMetadata };
}

// ============================================================================
// Generate Statistics
// ============================================================================

function generateStats(processed, byTopic, topicMetadata) {
    const nonEmpty = processed.filter(r => !r.isEmpty).length;

    return {
        totalHLRs: processed.length,
        nonEmptyHLRs: nonEmpty,
        topics: Object.keys(topicMetadata).length,
        byCategory: processed.reduce((acc, r) => {
            acc[r.category] = (acc[r.category] || 0) + 1;
            return acc;
        }, {}),
        byTopic: Object.entries(byTopic).reduce((acc, [topic, reqs]) => {
            acc[topic] = reqs.length;
            return acc;
        }, {})
    };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
    try {
        // Fetch CSV
        const csvText = await fetchCSV(config.source.csvUrl);

        // Parse CSV
        const rawRequirements = parseCSV(csvText);

        // Process requirements
        const { processed, byHlrId, byTopic, topicMetadata } =
            processRequirements(rawRequirements, config);

        // Generate stats
        const stats = generateStats(processed, byTopic, topicMetadata);

        // Build output
        const output = {
            generatedAt: new Date().toISOString(),
            sourceUrl: config.source.csvUrl,
            stats,
            requirements: processed,
            byHlrId,
            byTopic,
            topicMetadata
        };

        // Ensure output directory exists
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        // Write output
        const outputPath = path.join(__dirname, '..', config.output.file);
        fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

        // Report
        console.log(`\n✅ ARF import complete!`);
        console.log(`   📁 Output: ${config.output.file}`);
        console.log(`   📊 Stats:`);
        console.log(`      - ${stats.totalHLRs} HLRs imported`);
        console.log(`      - ${stats.topics} topics`);
        console.log(`      - Topics: ${Object.keys(byTopic).join(', ')}`);
        console.log(`   📐 By topic:`);
        for (const [topic, count] of Object.entries(stats.byTopic)) {
            const meta = topicMetadata[topic];
            console.log(`      - Topic ${topic}: ${count} HLRs (${meta?.title || 'Unknown'})`);
        }
        console.log('');

    } catch (error) {
        console.error(`\n❌ ARF import failed:`, error.message);
        process.exit(1);
    }
}

main();
