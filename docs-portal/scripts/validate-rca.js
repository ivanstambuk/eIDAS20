#!/usr/bin/env node
/**
 * Validate RCA Configuration Consistency
 * 
 * Ensures all RCA configuration files are internally consistent:
 * - Every useCases value references valid IDs from use-cases.yaml
 * - Every category value references valid IDs defined in the requirements file
 * - Every role value references valid IDs from roles.yaml
 * 
 * See DEC-088 for rationale.
 * 
 * Usage: node scripts/validate-rca.js
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_DIR = join(__dirname, '..', 'config', 'rca');
const REQUIREMENTS_DIR = join(CONFIG_DIR, 'requirements');

function loadYaml(path) {
    return yaml.load(readFileSync(path, 'utf-8'));
}

function validate() {
    console.log('🔍 Validating RCA configuration consistency...\n');

    let errors = [];
    let warnings = [];

    // ====================
    // Load reference data
    // ====================

    // 1. Load valid use case IDs from use-cases.yaml
    const useCasesConfig = loadYaml(join(CONFIG_DIR, 'use-cases.yaml'));
    const validUseCaseIds = new Set();

    // Use cases are at top level under 'useCases' key
    if (useCasesConfig.useCases) {
        for (const ucId of Object.keys(useCasesConfig.useCases)) {
            validUseCaseIds.add(ucId);
        }
    }
    console.log(`   📋 Found ${validUseCaseIds.size} valid use case IDs`);

    // 2. Load valid role IDs from roles.yaml
    const rolesConfig = loadYaml(join(CONFIG_DIR, 'roles.yaml'));
    const validRoleIds = new Set(Object.keys(rolesConfig.roles));
    console.log(`   👥 Found ${validRoleIds.size} valid role IDs`);

    // ====================
    // Validate each requirements file
    // ====================

    const requirementFiles = readdirSync(REQUIREMENTS_DIR)
        .filter(f => f.endsWith('.yaml'));

    for (const file of requirementFiles) {
        const filePath = join(REQUIREMENTS_DIR, file);
        const config = loadYaml(filePath);

        if (!config.requirements) continue;

        // Get valid categories from this file
        const validCategories = new Set(Object.keys(config.categories || {}));

        for (const req of config.requirements) {
            const reqId = req.id;

            // Validate useCases (MANDATORY - every requirement must have useCases)
            if (req.useCases) {
                if (req.useCases !== 'all') {
                    // It's an array of use case IDs
                    const useCases = Array.isArray(req.useCases) ? req.useCases : [req.useCases];
                    for (const ucId of useCases) {
                        if (!validUseCaseIds.has(ucId)) {
                            errors.push({
                                file,
                                reqId,
                                field: 'useCases',
                                value: ucId,
                                message: `Invalid use case ID: "${ucId}". Valid IDs: ${[...validUseCaseIds].sort().join(', ')}`
                            });
                        }
                    }
                }
            } else {
                errors.push({
                    file,
                    reqId,
                    field: 'useCases',
                    value: 'MISSING',
                    message: `Requirement is missing 'useCases:' field. Use 'useCases: all' for universal requirements or list specific IDs.`
                });
            }

            // Validate category (MANDATORY - file must define categories)
            if (validCategories.size === 0) {
                errors.push({
                    file,
                    reqId,
                    field: 'categories',
                    value: 'MISSING',
                    message: `File is missing 'categories:' section. Every requirements file must define its valid categories.`
                });
            } else if (req.category) {
                if (!validCategories.has(req.category)) {
                    errors.push({
                        file,
                        reqId,
                        field: 'category',
                        value: req.category,
                        message: `Invalid category: "${req.category}". Valid categories in this file: ${[...validCategories].join(', ')}`
                    });
                }
            } else {
                errors.push({
                    file,
                    reqId,
                    field: 'category',
                    value: 'MISSING',
                    message: `Requirement is missing 'category:' field. Every requirement must have a category.`
                });
            }

            // Validate roles
            if (req.roles) {
                for (const roleId of req.roles) {
                    if (!validRoleIds.has(roleId)) {
                        errors.push({
                            file,
                            reqId,
                            field: 'roles',
                            value: roleId,
                            message: `Invalid role ID: "${roleId}". Valid IDs: ${[...validRoleIds].join(', ')}`
                        });
                    }
                }
            }
        }

        console.log(`   ✓ Validated ${file}: ${config.requirements.length} requirements`);
    }

    // ====================
    // Report results
    // ====================

    if (warnings.length > 0) {
        console.log('\n⚠️  Warnings:\n');
        for (const w of warnings) {
            console.log(`   ${w.file} → ${w.reqId}: ${w.message}`);
        }
    }

    if (errors.length > 0) {
        console.error('\n❌ Validation errors:\n');
        for (const e of errors) {
            console.error(`   ${e.file} → ${e.reqId}.${e.field}`);
            console.error(`      Value: "${e.value}"`);
            console.error(`      ${e.message}\n`);
        }
        console.error(`\n❌ Found ${errors.length} error(s). Fix before building.\n`);
        process.exit(1);
    }

    console.log('\n✅ RCA configuration is valid and consistent!');
    console.log(`   📄 ${requirementFiles.length} requirement files validated`);
    console.log(`   🔗 All useCases, categories, and roles reference valid IDs\n`);
}

validate();
