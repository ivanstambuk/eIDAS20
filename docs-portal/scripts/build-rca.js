/**
 * Build script: RCA (Regulatory Compliance Assessment) data processor
 * 
 * This script processes YAML configuration files and generates a static JSON
 * file containing all RCA data. NO runtime logic - everything is pre-computed.
 * 
 * Input:
 *   - config/rca/use-cases.yaml
 *   - config/rca/roles.yaml
 *   - config/rca/legal-sources.yaml
 *   - config/rca/requirements/*.yaml
 * 
 * Output:
 *   - public/data/rca-data.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_DIR = path.join(__dirname, '../config/rca');
const OUTPUT_FILE = path.join(__dirname, '../public/data/rca-data.json');

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🔧 Building RCA data...\n');

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

    for (const file of files) {
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

    return allRequirements;
}

// Load all configuration
const useCasesConfig = loadYaml('use-cases.yaml');
const rolesConfig = loadYaml('roles.yaml');
const legalSourcesConfig = loadYaml('legal-sources.yaml');
const allRequirements = loadRequirementsDir();

console.log(`\n📊 Total requirements loaded: ${allRequirements.length}`);

// ============================================================================
// Process and structure data
// ============================================================================

// Build use cases with category info
const categories = useCasesConfig.categories;
const useCases = {};

for (const [id, useCase] of Object.entries(useCasesConfig.useCases)) {
    useCases[id] = {
        id,
        ...useCase,
        categoryLabel: categories[useCase.category]?.label || useCase.category,
        categoryOrder: categories[useCase.category]?.order || 999
    };
}

// Build category list with use case counts
const categoryList = Object.entries(categories).map(([id, cat]) => {
    const useCaseCount = Object.values(useCases).filter(uc => uc.category === id).length;
    return {
        id,
        label: cat.label,
        order: cat.order,
        useCaseCount
    };
}).sort((a, b) => a.order - b.order);

// Build roles list (only enabled) with profiles
const roles = Object.entries(rolesConfig.roles)
    .filter(([_, role]) => role.enabled)
    .map(([id, role]) => ({
        id,
        label: role.label,
        shortLabel: role.shortLabel,
        description: role.description,
        icon: role.icon,
        enabled: role.enabled,
        profiles: role.profiles || []
    }));

// Build legal sources lookup
const legalSources = {
    primary: legalSourcesConfig.primaryRegulation,
    implementing: legalSourcesConfig.implementingRegulations.reduce((acc, reg) => {
        acc[reg.id] = reg;
        return acc;
    }, {}),
    technicalSpecs: legalSourcesConfig.technicalSpecifications.reduce((acc, ts) => {
        acc[ts.id] = ts;
        return acc;
    }, {}),
    related: legalSourcesConfig.relatedRegulations.reduce((acc, reg) => {
        acc[reg.id] = reg;
        return acc;
    }, {})
};

// ============================================================================
// Build requirement index
// ============================================================================

// Create a map: role -> useCase -> [requirements]
const requirementsByRoleAndUseCase = {};

// Also create a flat list with all metadata resolved
const processedRequirements = [];

for (const req of allRequirements) {
    // Determine applicable roles
    const applicableRoles = Array.isArray(req.roles) ? req.roles : [req.roles];

    // Determine applicable use cases
    let applicableUseCases;
    if (req.useCases === 'all') {
        applicableUseCases = Object.keys(useCases);
    } else if (Array.isArray(req.useCases)) {
        applicableUseCases = req.useCases;
    } else {
        applicableUseCases = [req.useCases];
    }

    // Resolve legal source info
    let legalSourceInfo = null;
    if (req.legalBasis?.regulation) {
        const regId = req.legalBasis.regulation;
        if (regId === legalSources.primary.id) {
            legalSourceInfo = {
                type: 'primary',
                ...legalSources.primary,
                article: req.legalBasis.article,
                paragraph: req.legalBasis.paragraph
            };
        } else if (legalSources.implementing[regId]) {
            legalSourceInfo = {
                type: 'implementing',
                ...legalSources.implementing[regId],
                article: req.legalBasis.article,
                paragraph: req.legalBasis.paragraph
            };
        }
    }

    // Process profile filters (if requirement specifies profileFilter, it only applies to those profiles)
    // If no profileFilter, requirement applies to ALL profiles of the role
    const profileFilter = req.profileFilter || null;

    // Create processed requirement
    const processed = {
        id: req.id,
        category: req.category,
        requirement: req.requirement,
        explanation: req.explanation?.trim(),
        legalBasis: req.legalBasis,
        legalText: req.legalText?.trim(),
        legalSourceInfo,
        deadline: req.deadline,
        technicalSpec: req.technicalSpec,
        relatedRegulation: req.relatedRegulation,
        applicableRoles,
        applicableUseCases,
        appliesToAllUseCases: req.useCases === 'all',
        profileFilter,  // null = applies to all profiles, array = specific profiles only
        appliesToAllProfiles: profileFilter === null
    };

    processedRequirements.push(processed);

    // Build index for quick lookup
    for (const role of applicableRoles) {
        if (!requirementsByRoleAndUseCase[role]) {
            requirementsByRoleAndUseCase[role] = {};
        }

        for (const useCase of applicableUseCases) {
            if (!requirementsByRoleAndUseCase[role][useCase]) {
                requirementsByRoleAndUseCase[role][useCase] = [];
            }
            requirementsByRoleAndUseCase[role][useCase].push(req.id);
        }
    }
}

// Get unique requirement categories from the first requirements file
const requirementCategories = [];
const seenCategories = new Set();

for (const req of processedRequirements) {
    if (!seenCategories.has(req.category)) {
        seenCategories.add(req.category);
        // Find category metadata from any requirements file
        const reqFile = loadYaml('requirements/relying-party.yaml');
        const catInfo = reqFile.categories?.[req.category];
        requirementCategories.push({
            id: req.category,
            label: catInfo?.label || req.category,
            order: catInfo?.order || 999,
            icon: catInfo?.icon
        });
    }
}
requirementCategories.sort((a, b) => a.order - b.order);

// ============================================================================
// Build final output
// ============================================================================

const output = {
    // Metadata
    generatedAt: new Date().toISOString(),
    schemaVersion: 1,

    // Use cases organized by category
    categories: categoryList,
    useCases,

    // Roles
    roles,

    // Legal sources for reference
    legalSources,

    // Requirement categories
    requirementCategories,

    // All requirements (flat list with resolved metadata)
    requirements: processedRequirements,

    // Index for quick lookup: role -> useCase -> [requirement IDs]
    requirementIndex: requirementsByRoleAndUseCase,

    // Statistics
    stats: {
        totalRequirements: processedRequirements.length,
        totalUseCases: Object.keys(useCases).length,
        totalCategories: categoryList.length,
        requirementsByRole: Object.fromEntries(
            Object.entries(requirementsByRoleAndUseCase).map(([role, useCases]) => {
                const uniqueReqs = new Set();
                Object.values(useCases).forEach(reqs => reqs.forEach(r => uniqueReqs.add(r)));
                return [role, uniqueReqs.size];
            })
        )
    }
};

// ============================================================================
// Write output
// ============================================================================

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

console.log(`\n✅ RCA data built successfully!`);
console.log(`   📁 Output: ${OUTPUT_FILE}`);
console.log(`   📊 Stats:`);
console.log(`      - ${output.stats.totalRequirements} requirements`);
console.log(`      - ${output.stats.totalUseCases} use cases`);
console.log(`      - ${output.stats.totalCategories} categories`);
console.log(`      - Requirements by role:`);
Object.entries(output.stats.requirementsByRole).forEach(([role, count]) => {
    console.log(`        • ${role}: ${count}`);
});
console.log('');
