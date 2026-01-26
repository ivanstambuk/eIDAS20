/**
 * Build script: VCQ (Vendor Compliance Questionnaire) data processor
 * 
 * This script processes YAML configuration files and generates a static JSON
 * file containing all VCQ data. NO runtime logic - everything is pre-computed.
 * 
 * Input:
 *   - config/vcq/vcq-config.yaml
 *   - config/vcq/categories.yaml
 *   - config/vcq/requirements/*.yaml
 * 
 * Output:
 *   - public/data/vcq-data.json
 * 
 * ⚠️ Field Mapping (must match React components in VendorQuestionnaire.jsx):
 *   - `requirement` (NOT `question`) - the requirement statement text
 *   - `explanation` (NOT `guidance`) - the explanatory details
 *   - `requirementsByType.dora_ict` - key must match scopeExtensions.id in config
 * 
 * Updated: 2026-01-26 (DEC-254: Consolidated PIF/VIF into single RP Intermediary)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_DIR = path.join(__dirname, '../config/vcq');
const OUTPUT_FILE = path.join(__dirname, '../public/data/vcq-data.json');

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🔧 Building VCQ data...\n');

// ============================================================================
// Load YAML files
// ============================================================================

function loadYaml(filename) {
    const filepath = path.join(CONFIG_DIR, filename);
    if (!fs.existsSync(filepath)) {
        console.error(`❌ File not found: ${filepath}`);
        process.exit(1);
    }
    const content = fs.readFileSync(filepath, 'utf-8');
    return yaml.load(content);
}

function loadRequirementsDir() {
    const reqDir = path.join(CONFIG_DIR, 'requirements');
    if (!fs.existsSync(reqDir)) {
        console.error(`❌ Requirements directory not found: ${reqDir}`);
        process.exit(1);
    }

    const files = fs.readdirSync(reqDir).filter(f => f.endsWith('.yaml'));
    const allRequirements = [];

    // DEC-254: Skip deprecated pif.yaml and vif.yaml files
    const deprecatedFiles = ['pif.yaml', 'vif.yaml'];
    const activeFiles = files.filter(f => !deprecatedFiles.includes(f));

    for (const file of activeFiles) {
        const filepath = path.join(reqDir, file);
        const content = fs.readFileSync(filepath, 'utf-8');
        const data = yaml.load(content);

        if (data.requirements && Array.isArray(data.requirements)) {
            // Add source file info for debugging
            data.requirements.forEach(req => {
                req._sourceFile = file;
            });
            allRequirements.push(...data.requirements);
        }

        console.log(`  📄 Loaded ${file}: ${data.requirements?.length || 0} requirements`);
    }

    // Warn about deprecated files
    for (const f of deprecatedFiles) {
        if (files.includes(f)) {
            console.log(`  ⚠️  Skipped ${f} (deprecated per DEC-254)`);
        }
    }

    return allRequirements;
}

// Load all configuration
const vcqConfig = loadYaml('vcq-config.yaml');
const categoriesConfig = loadYaml('categories.yaml');
const allRequirements = loadRequirementsDir();

console.log(`\n📊 Total requirements loaded: ${allRequirements.length}`);

// ============================================================================
// Process and structure data
// ============================================================================

// Build categories list
const categories = Object.entries(categoriesConfig.categories).map(([id, cat]) => ({
    id,
    label: cat.label,
    description: cat.description,
    icon: cat.icon,
    order: cat.order
})).sort((a, b) => a.order - b.order);

// Build intermediary types list
// DEC-254: Now contains a single RP Intermediary type instead of PIF/VIF
const intermediaryTypes = Object.entries(vcqConfig.intermediaryTypes).map(([id, type]) => ({
    id,
    label: type.label,
    shortLabel: type.shortLabel,
    description: type.description,
    icon: type.icon,
    prefix: type.prefix,
    keyCharacteristics: type.keyCharacteristics || [],
    legalBasis: type.legalBasis || null
}));

// Build scope extensions list
const scopeExtensions = Object.entries(vcqConfig.scopeExtensions || {}).map(([id, ext]) => ({
    id,
    label: ext.label,
    shortLabel: ext.shortLabel,
    description: ext.description,
    icon: ext.icon,
    prefix: ext.prefix,
    enabled: ext.enabled !== false // default to true if not specified
})).filter(ext => ext.enabled);

// ============================================================================
// Process requirements
// ============================================================================

const processedRequirements = [];

// Indexes for quick lookup
// DEC-254: Simplified structure - single 'intermediary' type instead of pif/vif
const requirementsByType = {
    intermediary: [],  // All RP Intermediary requirements
    core: [],          // Requirements from core.yaml (apply to all)
    dora_ict: []       // DORA ICT extended scope (matches scopeExtensions.id)
};

for (const req of allRequirements) {
    // Determine applicability
    const applicability = req.applicability || [];
    const isExtended = req.scope === 'extended';

    // Build deep link for legal basis
    let legalBasisLink = null;
    if (req.legalBasis?.regulation && req.legalBasis?.article) {
        const regId = req.legalBasis.regulation.replace('/', '-');
        const articleNum = req.legalBasis.article.replace('Article ', '').toLowerCase();
        legalBasisLink = `/regulation/${regId}#article-${articleNum}`;
    }

    // Create processed requirement
    const processed = {
        id: req.id,
        category: req.category,
        categoryLabel: categoriesConfig.categories[req.category]?.label || req.category,
        categoryIcon: categoriesConfig.categories[req.category]?.icon || '📋',
        requirement: req.requirement,
        explanation: req.explanation?.trim(),
        legalBasis: req.legalBasis,
        legalBasisLink,
        legalText: req.legalText?.trim(),
        arfReference: req.arfReference,
        annexReference: req.annexReference?.trim(),
        applicability: applicability,
        isCore: applicability.length === 0 || req._sourceFile === 'core.yaml',
        isExtended,
        scope: req.scope || 'core',
        linkedRCA: req.linkedRCA || [],
        deadline: req.deadline,
        criticality: req.criticality || 'medium',
        notes: req.notes?.trim(),
        _sourceFile: req._sourceFile
    };

    processedRequirements.push(processed);

    // Build indexes (DEC-254: simplified)
    if (isExtended) {
        requirementsByType.dora_ict.push(req.id);
    } else if (req._sourceFile === 'core.yaml') {
        requirementsByType.core.push(req.id);
    } else if (applicability.includes('intermediary') || req._sourceFile === 'intermediary.yaml') {
        requirementsByType.intermediary.push(req.id);
    } else {
        // Default to intermediary for any unspecified requirements
        requirementsByType.intermediary.push(req.id);
    }
}

// ============================================================================
// Build statistics
// ============================================================================

const stats = {
    totalRequirements: processedRequirements.length,
    byType: {
        core: requirementsByType.core.length,
        intermediary: requirementsByType.intermediary.length,
        dora_ict: requirementsByType.dora_ict.length
    },
    byCategory: {},
    byCriticality: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    }
};

// Count by category
for (const req of processedRequirements) {
    stats.byCategory[req.category] = (stats.byCategory[req.category] || 0) + 1;
    stats.byCriticality[req.criticality] = (stats.byCriticality[req.criticality] || 0) + 1;
}

// ============================================================================
// Build final output
// ============================================================================

const output = {
    // Metadata
    generatedAt: new Date().toISOString(),
    schemaVersion: vcqConfig.schemaVersion || 1,

    // Tool configuration
    tool: vcqConfig.tool,

    // Intermediary types (DEC-254: single RP Intermediary)
    intermediaryTypes,

    // Extended scope options (DORA, etc.)
    scopeExtensions,

    // Categories for filtering
    categories,

    // Legal sources for reference
    legalSources: vcqConfig.legalSources,

    // Output configuration
    output: vcqConfig.output,

    // All requirements (flat list with resolved metadata)
    requirements: processedRequirements,

    // Indexes for quick lookup
    requirementsByType,

    // Statistics
    stats
};

// ============================================================================
// Write output
// ============================================================================

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

console.log(`\n✅ VCQ data built successfully!`);
console.log(`   📁 Output: ${OUTPUT_FILE}`);
console.log(`   📊 Stats:`);
console.log(`      - ${stats.totalRequirements} total requirements`);
console.log(`      - ${stats.byType.core} core requirements`);
console.log(`      - ${stats.byType.intermediary} RP Intermediary requirements`);
console.log(`      - ${stats.byType.dora_ict} extended scope (DORA ICT)`);
console.log(`      - Criticality: ${stats.byCriticality.critical} critical, ${stats.byCriticality.high} high`);
console.log('');
