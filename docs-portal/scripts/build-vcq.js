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
 * ⚠️ Schema v2 (DEC-257): Requirements use roles[] and productCategories[] arrays
 *   - Empty array = universal (applies to all)
 *   - Array with values = filter by intersection with user selection
 * 
 * ⚠️ Field Mapping (must match React components in VendorQuestionnaire.jsx):
 *   - `requirement` (NOT `question`) - the requirement statement text
 *   - `explanation` (NOT `guidance`) - the explanatory details
 * 
 * Updated: 2026-01-28 (DEC-257: Role/Category filtering)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_DIR = path.join(__dirname, '../config/vcq');
const OUTPUT_FILE = path.join(__dirname, '../public/data/vcq-data.json');
const REGULATIONS_INDEX = path.join(__dirname, '../public/data/regulations-index.json');

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Load regulations index for document type lookup
let regulationsIndex = {};
if (fs.existsSync(REGULATIONS_INDEX)) {
    const regIndexData = JSON.parse(fs.readFileSync(REGULATIONS_INDEX, 'utf-8'));
    regIndexData.forEach(reg => {
        // Index by both slug format and regulation format
        regulationsIndex[reg.slug] = reg;
        regulationsIndex[reg.slug.replace('-', '/')] = reg;
    });
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

// DEC-257: Schema v2 - Role and Product Category indexes
const requirementsByRole = {
    relying_party: [],
    issuer: [],
    universal: []  // Empty roles array = applies to all
};

const requirementsByProductCategory = {
    connector: [],
    issuance_platform: [],
    trust_services: [],
    universal: []  // Empty productCategories array = applies to all
};

// DEC-255: Build source group index for 3-tile filtering
const requirementsBySourceGroup = {
    eidas: [],    // Core eIDAS + all implementing acts
    gdpr: [],     // GDPR requirements
    dora: [],     // DORA ICT requirements
    arf: []       // ARF-sourced requirements
};

// Build lookup for which regulation IDs map to which source group
const eidasRegulationIds = new Set([
    '2014/910', '2024/1183',  // Primary regulations
    '2024/2979', '2024/2982', '2025/847', '2025/848'  // Implementing acts
]);
const gdprRegulationIds = new Set(['2016/679']);
const doraRegulationIds = new Set(['2022/2554']);

/**
 * Normalize legalBasis to legalBases array.
 * Supports both single object and array formats for backwards compatibility.
 * 
 * @param {Object|Array} legalBasis - Single object or array of legal bases
 * @returns {Array} Array of legal basis objects
 */
function normalizeLegalBases(legalBasis) {
    if (!legalBasis) return [];
    if (Array.isArray(legalBasis)) return legalBasis;
    return [legalBasis]; // Wrap single object in array
}

/**
 * DEC-286: Determine ALL applicable source groups for a requirement.
 * Returns an array of source groups, enabling union-based filtering.
 * 
 * A requirement appears if ANY of its sourceGroups is selected.
 * This ensures requirements with multiple regulatory sources (e.g., eIDAS + GDPR)
 * are visible when either source is selected.
 * 
 * @param {Object} req - The requirement object
 * @param {Array} legalBases - Normalized array of legal basis objects
 * @returns {string[]} Array of source group identifiers
 */
function determineSourceGroups(req, legalBases) {
    const sources = new Set();

    // Check ALL legal bases, not just the first one
    for (const basis of legalBases) {
        if (basis.regulation) {
            if (eidasRegulationIds.has(basis.regulation)) sources.add('eidas');
            if (gdprRegulationIds.has(basis.regulation)) sources.add('gdpr');
            if (doraRegulationIds.has(basis.regulation)) sources.add('dora');
        }
    }

    // ARF reference implies eIDAS ecosystem (ARF implements eIDAS)
    if (req.arfReference) {
        sources.add('arf');
        // ARF requirements are part of eIDAS ecosystem
        if (sources.size === 0) {
            sources.add('eidas');
        }
    }

    // Extended scope requirements include DORA
    if (req.scope === 'extended') {
        sources.add('dora');
    }

    // DEC-286: Core VCQ requirements are always part of eIDAS ecosystem.
    // These define what vendors must do to operate as eIDAS wallet intermediaries.
    // Even if a core req cites GDPR (e.g., Article 28 DPA), it's mandated by
    // eIDAS Article 5b(10) which references data protection requirements.
    if (req._sourceFile === 'core.yaml') {
        sources.add('eidas');
    }

    // Default to eidas if no sources identified
    if (sources.size === 0) {
        sources.add('eidas');
    }

    return Array.from(sources);
}

for (const req of allRequirements) {
    // DEC-257: Schema v2 - roles and productCategories arrays
    const roles = req.roles || [];
    const productCategories = req.productCategories || [];
    const isExtended = req.scope === 'extended';

    // DEC-261: Normalize legalBasis to legalBases array for multi-article support
    const legalBases = normalizeLegalBases(req.legalBasis);

    // Build deep links for each legal basis
    const legalBasesWithLinks = legalBases.map(basis => {
        let link = null;
        if (basis.regulation && basis.article) {
            const regId = basis.regulation.replace('/', '-');
            // Build section ID from article reference
            const sectionId = basis.article.toLowerCase().replace(/\s+/g, '-');

            // Determine URL path based on document type (DEC-226)
            const regMeta = regulationsIndex[regId] || regulationsIndex[basis.regulation];
            // Check type, category, and legalType fields for implementing act indicator
            const docType = regMeta?.type || regMeta?.category || regMeta?.legalType || '';
            const isImplementingAct = docType.toLowerCase().includes('implementing');
            const basePath = isImplementingAct ? 'implementing-acts' : 'regulation';

            // Use ?section= format for HashRouter compatibility
            link = `/${basePath}/${regId}?section=${sectionId}`;
        }
        return { ...basis, link };
    });

    // DEC-286: Determine ALL source groups for union-based filtering
    const sourceGroups = determineSourceGroups(req, legalBases);

    // Create processed requirement
    const processed = {
        id: req.id,
        category: req.category,
        categoryLabel: categoriesConfig.categories[req.category]?.label || req.category,
        categoryIcon: categoriesConfig.categories[req.category]?.icon || '📋',
        requirement: req.requirement,
        explanation: req.explanation?.trim(),
        // DEC-261: Multi-article support - legalBases is always an array
        legalBases: legalBasesWithLinks,
        // Backwards compatibility: keep first legal basis as primary
        legalBasis: legalBases[0] || null,
        legalBasisLink: legalBasesWithLinks[0]?.link || null,
        legalText: req.legalText?.trim(),
        arfReference: req.arfReference,
        annexReference: req.annexReference?.trim(),
        // DEC-257: Schema v2 fields
        roles,
        productCategories,
        isUniversal: roles.length === 0 && productCategories.length === 0,
        isExtended,
        scope: req.scope || 'core',
        sourceGroups,  // DEC-286: Array for union-based filtering (was sourceGroup)
        deadline: req.deadline,
        obligation: req.obligation || 'SHOULD',  // RFC 2119: MUST, SHOULD, MAY, etc. (stored in YAML)
        notes: req.notes?.trim(),
        _sourceFile: req._sourceFile
    };

    processedRequirements.push(processed);

    // DEC-286: Build source group index for all applicable sources
    for (const group of sourceGroups) {
        if (requirementsBySourceGroup[group]) {
            requirementsBySourceGroup[group].push(req.id);
        }
    }

    // DEC-257: Build role index
    if (roles.length === 0) {
        requirementsByRole.universal.push(req.id);
    } else {
        roles.forEach(role => {
            if (requirementsByRole[role]) {
                requirementsByRole[role].push(req.id);
            }
        });
    }

    // DEC-257: Build product category index
    if (productCategories.length === 0) {
        requirementsByProductCategory.universal.push(req.id);
    } else {
        productCategories.forEach(cat => {
            if (requirementsByProductCategory[cat]) {
                requirementsByProductCategory[cat].push(req.id);
            }
        });
    }
}

// ============================================================================
// Build statistics
// ============================================================================

const stats = {
    totalRequirements: processedRequirements.length,
    // DEC-257: Stats by role
    byRole: {
        relying_party: requirementsByRole.relying_party.length,
        issuer: requirementsByRole.issuer.length,
        universal: requirementsByRole.universal.length
    },
    // DEC-257: Stats by product category
    byProductCategory: {
        connector: requirementsByProductCategory.connector.length,
        issuance_platform: requirementsByProductCategory.issuance_platform.length,
        trust_services: requirementsByProductCategory.trust_services.length,
        universal: requirementsByProductCategory.universal.length
    },
    // DEC-255: Stats by source group for 3-tile model
    bySourceGroup: {
        eidas: requirementsBySourceGroup.eidas.length,
        gdpr: requirementsBySourceGroup.gdpr.length,
        dora: requirementsBySourceGroup.dora.length,
        arf: requirementsBySourceGroup.arf.length
    },
    byCategory: {},
    // RFC 2119 obligation counts
    byObligation: {
        'MUST': 0,
        'MUST NOT': 0,
        'SHOULD': 0,
        'SHOULD NOT': 0,
        'MAY': 0
    }
};

// Count by category and obligation
for (const req of processedRequirements) {
    stats.byCategory[req.category] = (stats.byCategory[req.category] || 0) + 1;
    if (stats.byObligation[req.obligation] !== undefined) {
        stats.byObligation[req.obligation]++;
    }
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

    // Legal sources for reference (DEC-255: restructured for 3-tile model)
    legalSources: vcqConfig.legalSources,

    // Output configuration
    output: vcqConfig.output,

    // All requirements (flat list with resolved metadata)
    requirements: processedRequirements,

    // DEC-257: Indexes for role/category filtering
    requirementsByRole,
    requirementsByProductCategory,

    // DEC-255: Index by source group for 3-tile filtering
    requirementsBySourceGroup,

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
console.log(`   👤 By Role (DEC-257):`);
console.log(`      - Relying Party: ${stats.byRole.relying_party}`);
console.log(`      - Issuer: ${stats.byRole.issuer}`);
console.log(`      - Universal: ${stats.byRole.universal}`);
console.log(`   📦 By Product Category (DEC-257):`);
console.log(`      - Connector: ${stats.byProductCategory.connector}`);
console.log(`      - Issuance Platform: ${stats.byProductCategory.issuance_platform}`);
console.log(`      - Trust Services: ${stats.byProductCategory.trust_services}`);
console.log(`      - Universal: ${stats.byProductCategory.universal}`);
console.log(`   🏛️ By Source Group:`);
console.log(`      - eIDAS: ${stats.bySourceGroup.eidas}`);
console.log(`      - GDPR: ${stats.bySourceGroup.gdpr}`);
console.log(`      - DORA: ${stats.bySourceGroup.dora}`);
console.log(`      - ARF: ${stats.bySourceGroup.arf}`);
console.log(`   📋 RFC 2119 Obligations:`);
console.log(`      - MUST: ${stats.byObligation['MUST']}, SHOULD: ${stats.byObligation['SHOULD']}, MAY: ${stats.byObligation['MAY']}`);
console.log('');
