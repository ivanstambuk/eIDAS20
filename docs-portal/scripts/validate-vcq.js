#!/usr/bin/env node
/**
 * Validate VCQ Configuration Consistency
 * 
 * Ensures all VCQ configuration files are internally consistent:
 * - Every category value references valid IDs from categories.yaml
 * - roles[] field contains valid role IDs (relying_party, issuer) or empty array
 * - productCategories[] field contains valid category IDs or empty array
 * - All required fields are present
 * - Legal basis references are syntactically correct
 * 
 * Schema v2 (DEC-257): Uses roles[] and productCategories[] instead of applicability
 * 
 * Usage: node scripts/validate-vcq.js
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_DIR = join(__dirname, '..', 'config', 'vcq');
const REQUIREMENTS_DIR = join(CONFIG_DIR, 'requirements');

function loadYaml(path) {
    if (!existsSync(path)) {
        console.error(`❌ File not found: ${path}`);
        process.exit(1);
    }
    return yaml.load(readFileSync(path, 'utf-8'));
}

function validate() {
    console.log('🔍 Validating VCQ configuration consistency...\n');

    let errors = [];
    let warnings = [];

    // ====================
    // Load reference data
    // ====================

    // 1. Load valid categories from categories.yaml
    const categoriesConfig = loadYaml(join(CONFIG_DIR, 'categories.yaml'));
    const validCategories = new Set(Object.keys(categoriesConfig.categories || {}));
    console.log(`   🏷️  Found ${validCategories.size} valid category IDs`);

    // 2. Load valid organisation roles and product categories from vcq-config.yaml
    const vcqConfig = loadYaml(join(CONFIG_DIR, 'vcq-config.yaml'));

    // DEC-257: Schema v2 - roles and productCategories
    const validRoles = new Set(Object.keys(vcqConfig.organisationRoles || {}));
    const validProductCategories = new Set(Object.keys(vcqConfig.productCategories || {}));
    console.log(`   👤 Found ${validRoles.size} valid organisation roles: ${[...validRoles].join(', ')}`);
    console.log(`   📦 Found ${validProductCategories.size} valid product categories: ${[...validProductCategories].join(', ')}`);

    // 3. Valid scopes
    const validScopes = new Set(['core', 'extended']);

    // ====================
    // Validate each requirements file
    // ====================

    if (!existsSync(REQUIREMENTS_DIR)) {
        console.error(`❌ Requirements directory not found: ${REQUIREMENTS_DIR}`);
        process.exit(1);
    }

    const requirementFiles = readdirSync(REQUIREMENTS_DIR)
        .filter(f => f.endsWith('.yaml'));

    const allRequirementIds = new Set();
    let totalRequirements = 0;

    for (const file of requirementFiles) {
        const filePath = join(REQUIREMENTS_DIR, file);
        const config = loadYaml(filePath);

        if (!config.requirements) {
            warnings.push({
                file,
                message: 'No requirements array found in file'
            });
            continue;
        }

        for (const req of config.requirements) {
            totalRequirements++;
            const reqId = req.id;

            // Check for duplicate IDs
            if (allRequirementIds.has(reqId)) {
                errors.push({
                    file,
                    reqId,
                    field: 'id',
                    value: reqId,
                    message: `Duplicate requirement ID: "${reqId}"`
                });
            } else {
                allRequirementIds.add(reqId);
            }

            // Validate ID format (VEND-TYPE-NNN)
            // DEC-257: Added ISS, TSP, SCA for issuer, trust services, payments
            const idPattern = /^VEND-(CORE|INT|ICT|GDP|ISS|TSP|SCA|PIF|VIF)-\d{3}$/;
            if (!idPattern.test(reqId)) {
                errors.push({
                    file,
                    reqId,
                    field: 'id',
                    value: reqId,
                    message: `Invalid ID format. Expected: VEND-{CORE|INT|ICT|ISS|TSP|SCA}-NNN`
                });
            }

            // Validate category (MANDATORY)
            if (req.category) {
                if (!validCategories.has(req.category)) {
                    errors.push({
                        file,
                        reqId,
                        field: 'category',
                        value: req.category,
                        message: `Invalid category: "${req.category}". Valid categories: ${[...validCategories].sort().join(', ')}`
                    });
                }
            } else {
                errors.push({
                    file,
                    reqId,
                    field: 'category',
                    value: 'MISSING',
                    message: `Requirement is missing 'category:' field. Valid categories: ${[...validCategories].sort().join(', ')}`
                });
            }

            // Validate requirement text (MANDATORY)
            if (!req.requirement || req.requirement.trim() === '') {
                errors.push({
                    file,
                    reqId,
                    field: 'requirement',
                    value: 'MISSING',
                    message: `Requirement is missing 'requirement:' field (the actual requirement text)`
                });
            }

            // DEC-257: Validate roles field (schema v2)
            if (req.roles !== undefined) {
                if (!Array.isArray(req.roles)) {
                    errors.push({
                        file,
                        reqId,
                        field: 'roles',
                        value: req.roles,
                        message: `'roles' must be an array (empty for universal, or [relying_party, issuer])`
                    });
                } else {
                    for (const role of req.roles) {
                        if (!validRoles.has(role)) {
                            errors.push({
                                file,
                                reqId,
                                field: 'roles',
                                value: role,
                                message: `Invalid role: "${role}". Valid roles: ${[...validRoles].join(', ')}`
                            });
                        }
                    }
                }
            } else {
                errors.push({
                    file,
                    reqId,
                    field: 'roles',
                    value: 'MISSING',
                    message: `Requirement is missing 'roles:' field. Use [] for universal, or [relying_party] / [issuer]`
                });
            }

            // DEC-257: Validate productCategories field (schema v2)
            if (req.productCategories !== undefined) {
                if (!Array.isArray(req.productCategories)) {
                    errors.push({
                        file,
                        reqId,
                        field: 'productCategories',
                        value: req.productCategories,
                        message: `'productCategories' must be an array (empty for universal)`
                    });
                } else {
                    for (const cat of req.productCategories) {
                        if (!validProductCategories.has(cat)) {
                            errors.push({
                                file,
                                reqId,
                                field: 'productCategories',
                                value: cat,
                                message: `Invalid product category: "${cat}". Valid: ${[...validProductCategories].join(', ')}`
                            });
                        }
                    }
                }
            } else {
                errors.push({
                    file,
                    reqId,
                    field: 'productCategories',
                    value: 'MISSING',
                    message: `Requirement is missing 'productCategories:' field. Use [] for universal.`
                });
            }

            // Validate scope if present
            if (req.scope && !validScopes.has(req.scope)) {
                errors.push({
                    file,
                    reqId,
                    field: 'scope',
                    value: req.scope,
                    message: `Invalid scope: "${req.scope}". Valid scopes: ${[...validScopes].join(', ')}`
                });
            }

            // Validate legal basis structure if present
            if (req.legalBasis) {
                if (!req.legalBasis.regulation) {
                    warnings.push({
                        file,
                        reqId,
                        field: 'legalBasis',
                        message: `legalBasis is present but missing 'regulation' field`
                    });
                }
                if (!req.legalBasis.article) {
                    warnings.push({
                        file,
                        reqId,
                        field: 'legalBasis',
                        message: `legalBasis is present but missing 'article' field`
                    });
                }
            }

            // Validate linkedRCA references format if present
            if (req.linkedRCA) {
                if (!Array.isArray(req.linkedRCA)) {
                    errors.push({
                        file,
                        reqId,
                        field: 'linkedRCA',
                        value: req.linkedRCA,
                        message: `'linkedRCA' must be an array of RCA requirement IDs`
                    });
                }
            }

            // Validate ARF reference if present
            if (req.arfReference) {
                if (!req.arfReference.hlr) {
                    warnings.push({
                        file,
                        reqId,
                        field: 'arfReference',
                        message: `arfReference is present but missing 'hlr' field`
                    });
                }
                if (!req.arfReference.topic) {
                    warnings.push({
                        file,
                        reqId,
                        field: 'arfReference',
                        message: `arfReference is present but missing 'topic' field`
                    });
                }
            }

            // Validate criticality if present
            const validCriticalities = ['critical', 'high', 'medium', 'low'];
            if (req.criticality && !validCriticalities.includes(req.criticality)) {
                warnings.push({
                    file,
                    reqId,
                    field: 'criticality',
                    message: `Non-standard criticality: "${req.criticality}". Recommended: ${validCriticalities.join(', ')}`
                });
            }
        }

        console.log(`   ✓ Validated ${file}: ${config.requirements.length} requirements`);
    }

    // ====================
    // Validate ARF references against arf-hlr-data.json
    // ====================

    const arfDataPath = join(__dirname, '..', 'public', 'data', 'arf-hlr-data.json');
    let arfValidation = { checked: false, valid: 0, invalid: [], empty: [] };

    if (existsSync(arfDataPath)) {
        try {
            const arfData = JSON.parse(readFileSync(arfDataPath, 'utf-8'));
            const validHlrIds = new Set(Object.keys(arfData.byHlrId || {}));
            arfValidation.checked = true;

            console.log(`\n   📐 Validating ARF references against ${validHlrIds.size} HLRs`);

            // Re-scan all requirements for arfReference
            for (const file of requirementFiles) {
                const filePath = join(REQUIREMENTS_DIR, file);
                const config = loadYaml(filePath);

                if (!config.requirements) continue;

                for (const req of config.requirements) {
                    if (req.arfReference?.hlr) {
                        const hlrId = req.arfReference.hlr;

                        if (!validHlrIds.has(hlrId)) {
                            arfValidation.invalid.push({ file, reqId: req.id, hlr: hlrId });
                            errors.push({
                                file,
                                reqId: req.id,
                                field: 'arfReference.hlr',
                                value: hlrId,
                                message: `HLR "${hlrId}" not found in ARF data. Run: npm run build:arf`
                            });
                        } else {
                            arfValidation.valid++;
                            // Check if HLR is marked as empty
                            const hlrData = arfData.byHlrId[hlrId];
                            if (hlrData?.isEmpty) {
                                arfValidation.empty.push({ file, reqId: req.id, hlr: hlrId });
                                warnings.push({
                                    file,
                                    reqId: req.id,
                                    field: 'arfReference.hlr',
                                    message: `HLR "${hlrId}" exists but has no specification text in ARF (marked as Empty)`
                                });
                            }
                        }
                    }
                }
            }

            console.log(`   ✓ ARF validation: ${arfValidation.valid} valid, ${arfValidation.invalid.length} invalid, ${arfValidation.empty.length} empty`);
        } catch (e) {
            console.warn(`   ⚠️  Could not validate ARF references: ${e.message}`);
        }
    } else {
        console.log('\n   ⚠️  Skipping ARF validation (arf-hlr-data.json not found). Run: npm run build:arf');
    }

    // ====================
    // Validate linkedRCA references against RCA requirements
    // ====================

    const rcaDir = join(__dirname, '..', 'config', 'rca', 'requirements');
    let rcaValidation = { checked: false, valid: 0, invalid: [] };

    if (existsSync(rcaDir)) {
        try {
            // Load all RCA requirement IDs
            const rcaFiles = readdirSync(rcaDir).filter(f => f.endsWith('.yaml'));
            const validRcaIds = new Set();

            for (const file of rcaFiles) {
                const rcaConfig = loadYaml(join(rcaDir, file));
                if (rcaConfig.requirements) {
                    for (const req of rcaConfig.requirements) {
                        validRcaIds.add(req.id);
                    }
                }
            }

            rcaValidation.checked = true;
            console.log(`\n   🔗 Validating linkedRCA references against ${validRcaIds.size} RCA IDs`);

            // Check all VCQ linkedRCA references
            for (const file of requirementFiles) {
                const filePath = join(REQUIREMENTS_DIR, file);
                const config = loadYaml(filePath);

                if (!config.requirements) continue;

                for (const req of config.requirements) {
                    if (req.linkedRCA && Array.isArray(req.linkedRCA)) {
                        for (const rcaId of req.linkedRCA) {
                            if (!validRcaIds.has(rcaId)) {
                                rcaValidation.invalid.push({ file, reqId: req.id, rcaId });
                                warnings.push({
                                    file,
                                    reqId: req.id,
                                    field: 'linkedRCA',
                                    message: `RCA ID "${rcaId}" not found in RCA requirements`
                                });
                            } else {
                                rcaValidation.valid++;
                            }
                        }
                    }
                }
            }

            console.log(`   ✓ linkedRCA validation: ${rcaValidation.valid} valid, ${rcaValidation.invalid.length} invalid`);
        } catch (e) {
            console.warn(`   ⚠️  Could not validate linkedRCA references: ${e.message}`);
        }
    } else {
        console.log('\n   ⚠️  Skipping linkedRCA validation (RCA directory not found)');
    }

    // ====================
    // Report results
    // ====================

    if (warnings.length > 0) {
        console.log('\n⚠️  Warnings:\n');
        for (const w of warnings) {
            console.log(`   ${w.file} → ${w.reqId || 'file'}: ${w.message}`);
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

    console.log('\n✅ VCQ configuration is valid and consistent!');
    console.log(`   📄 ${requirementFiles.length} requirement files validated`);
    console.log(`   📝 ${totalRequirements} total requirements`);
    console.log(`   ✅ All categories, roles, and productCategories are valid`);
    if (arfValidation.checked) {
        console.log(`   📐 ${arfValidation.valid} ARF HLR references validated\n`);
    } else {
        console.log('');
    }
}

validate();
