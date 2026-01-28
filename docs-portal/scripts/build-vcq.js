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

function determineSourceGroup(req, legalBases) {
    // Check if it's an ARF-sourced requirement with no legal basis
    if (req.arfReference && legalBases.length === 0) {
        return 'arf';
    }

    // Check first legal basis regulation (primary source)
    if (legalBases.length > 0 && legalBases[0].regulation) {
        const regId = legalBases[0].regulation;
        if (eidasRegulationIds.has(regId)) return 'eidas';
        if (gdprRegulationIds.has(regId)) return 'gdpr';
        if (doraRegulationIds.has(regId)) return 'dora';
    }

    // Extended scope requirements are DORA
    if (req.scope === 'extended') {
        return 'dora';
    }

    // Default to eidas for core requirements
    return 'eidas';
}

/**
 * Derive RFC 2119 obligation level from requirement text.
 * 
 * Scans the requirement text and legalText for modal verbs per RFC 2119:
 * - MUST/SHALL/REQUIRED → "MUST" (absolute requirement)
 * - MUST NOT/SHALL NOT → "MUST NOT" (absolute prohibition)
 * - SHOULD/RECOMMENDED → "SHOULD" (recommended but exceptions exist)
 * - SHOULD NOT/NOT RECOMMENDED → "SHOULD NOT" (not recommended)
 * - MAY/OPTIONAL/CAN → "MAY" (truly optional)
 * 
 * Priority: MUST > MUST NOT > SHOULD > SHOULD NOT > MAY
 * If no modal verb found, defaults to SHOULD (recommendation without explicit mandate)
 * 
 * ⚠️ EXPECTED DISTRIBUTION: EU regulatory text overwhelmingly uses "shall" language,
 * resulting in ~87% of requirements being classified as MUST. This is correct behavior —
 * EU legislation is intentionally prescriptive. Low SHOULD/MAY counts are normal.
 * 
 * @param {Object} req - The requirement object
 * @returns {string} RFC 2119 obligation level
 */
function deriveObligation(req) {
    // Combine all text sources for scanning
    const textSources = [
        req.requirement || '',
        req.legalText || '',
        req.explanation || ''
    ].join(' ').toLowerCase();

    // Check for prohibitions first (MUST NOT / SHALL NOT)
    if (/\b(must not|shall not)\b/.test(textSources)) {
        return 'MUST NOT';
    }

    // Check for absolute requirements (MUST / SHALL / REQUIRED)
    if (/\b(must|shall|required)\b/.test(textSources)) {
        return 'MUST';
    }

    // Check for negative recommendations (SHOULD NOT / NOT RECOMMENDED)
    if (/\b(should not|not recommended)\b/.test(textSources)) {
        return 'SHOULD NOT';
    }

    // Check for recommendations (SHOULD / RECOMMENDED)
    if (/\b(should|recommended)\b/.test(textSources)) {
        return 'SHOULD';
    }

    // Check for optional (MAY / OPTIONAL / CAN)
    if (/\b(may|optional|can)\b/.test(textSources)) {
        return 'MAY';
    }

    // Default: if criticality is critical/high, assume MUST; otherwise SHOULD
    if (req.criticality === 'critical') {
        return 'MUST';
    } else if (req.criticality === 'high') {
        return 'SHOULD';
    }

    // Fallback default
    return 'SHOULD';
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
            const articleNum = basis.article.replace('Article ', '').toLowerCase();
            link = `/regulation/${regId}#article-${articleNum}`;
        }
        return { ...basis, link };
    });

    // DEC-255: Determine source group for 3-tile filtering
    const sourceGroup = determineSourceGroup(req, legalBases);

    // RFC 2119: Derive obligation level from requirement text
    const obligation = deriveObligation(req);

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
        sourceGroup,  // DEC-255: For 3-tile filtering
        linkedRCA: req.linkedRCA || [],
        deadline: req.deadline,
        criticality: req.criticality || 'medium',
        obligation,  // RFC 2119: MUST, SHOULD, MAY, etc.
        notes: req.notes?.trim(),
        _sourceFile: req._sourceFile
    };

    processedRequirements.push(processed);

    // Build source group index (DEC-255)
    requirementsBySourceGroup[sourceGroup].push(req.id);

    // ARF is a cross-cutting reference - count separately if arfReference exists
    // This ensures requirements appear in BOTH their legal source AND ARF
    if (req.arfReference) {
        requirementsBySourceGroup.arf.push(req.id);
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
    byCriticality: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    },
    // RFC 2119 obligation counts
    byObligation: {
        'MUST': 0,
        'MUST NOT': 0,
        'SHOULD': 0,
        'SHOULD NOT': 0,
        'MAY': 0
    }
};

// Count by category, criticality, and obligation
for (const req of processedRequirements) {
    stats.byCategory[req.category] = (stats.byCategory[req.category] || 0) + 1;
    stats.byCriticality[req.criticality] = (stats.byCriticality[req.criticality] || 0) + 1;
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
