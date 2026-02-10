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

            // Validate legal basis structure if present (DEC-261: supports both single object and array)
            if (req.legalBasis) {
                // Normalize to array for validation
                const legalBases = Array.isArray(req.legalBasis) ? req.legalBasis : [req.legalBasis];

                for (let i = 0; i < legalBases.length; i++) {
                    const basis = legalBases[i];
                    const baseName = legalBases.length > 1 ? `legalBasis[${i}]` : 'legalBasis';

                    if (!basis.regulation) {
                        warnings.push({
                            file,
                            reqId,
                            field: baseName,
                            message: `${baseName} is present but missing 'regulation' field`
                        });
                    }
                    if (!basis.article) {
                        warnings.push({
                            file,
                            reqId,
                            field: baseName,
                            message: `${baseName} is present but missing 'article' field`
                        });
                    }
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

            // Validate obligation field (RFC 2119, replaces criticality)
            const validObligations = ['MUST', 'MUST NOT', 'SHOULD', 'SHOULD NOT', 'MAY'];
            if (req.obligation) {
                if (!validObligations.includes(req.obligation)) {
                    errors.push({
                        file,
                        reqId,
                        field: 'obligation',
                        value: req.obligation,
                        message: `Invalid obligation: "${req.obligation}". Valid: ${validObligations.join(', ')}`
                    });
                }
            } else {
                warnings.push({
                    file,
                    reqId,
                    field: 'obligation',
                    message: `Missing 'obligation' field. Recommended: ${validObligations.join(', ')}`
                });
            }

            // Validate deploymentArchitectures field (DEC-TBD)
            const validArchitectures = ['intermediary', 'direct_saas', 'direct_onprem'];
            if (req.deploymentArchitectures !== undefined) {
                if (!Array.isArray(req.deploymentArchitectures)) {
                    errors.push({
                        file,
                        reqId,
                        field: 'deploymentArchitectures',
                        value: req.deploymentArchitectures,
                        message: `'deploymentArchitectures' must be an array (empty for agnostic, or [${validArchitectures.join(', ')}])`
                    });
                } else {
                    for (const arch of req.deploymentArchitectures) {
                        if (!validArchitectures.includes(arch)) {
                            errors.push({
                                file,
                                reqId,
                                field: 'deploymentArchitectures',
                                value: arch,
                                message: `Invalid deployment architecture: "${arch}". Valid: ${validArchitectures.join(', ')}`
                            });
                        }
                    }
                }
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
            const validHarmonizedIds = new Set(Object.keys(arfData.byHarmonizedId || {}));
            arfValidation.checked = true;

            console.log(`   📐 Validating ARF references against ${validHlrIds.size} HLRs (+ ${validHarmonizedIds.size} Harmonized IDs)`);

            // Re-scan all requirements for arfReference
            for (const file of requirementFiles) {
                const filePath = join(REQUIREMENTS_DIR, file);
                const config = loadYaml(filePath);

                if (!config.requirements) continue;

                for (const req of config.requirements) {
                    if (req.arfReference?.hlr) {
                        // Support both string and array format for hlr
                        const hlrIds = Array.isArray(req.arfReference.hlr)
                            ? req.arfReference.hlr
                            : [req.arfReference.hlr];

                        for (const hlrId of hlrIds) {
                            // Check both Old IDs and Harmonized IDs
                            const isValidOldId = validHlrIds.has(hlrId);
                            const isValidHarmonizedId = validHarmonizedIds.has(hlrId);
                            if (!isValidOldId && !isValidHarmonizedId) {
                                arfValidation.invalid.push({ file, reqId: req.id, hlr: hlrId });
                                errors.push({
                                    file,
                                    reqId: req.id,
                                    field: 'arfReference.hlr',
                                    value: hlrId,
                                    message: `HLR "${hlrId}" not found in ARF data (checked both Old IDs and Harmonized IDs). Run: npm run build:arf`
                                });
                            } else {
                                arfValidation.valid++;
                                // Check if HLR is marked as empty
                                const hlrData = arfData.byHlrId[hlrId] || arfData.byHarmonizedId?.[hlrId];
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
            }

            console.log(`   ✓ ARF validation: ${arfValidation.valid} valid, ${arfValidation.invalid.length} invalid, ${arfValidation.empty.length} empty`);
        } catch (e) {
            console.warn(`   ⚠️  Could not validate ARF references: ${e.message}`);
        }
    } else {
        console.log('\n   ⚠️  Skipping ARF validation (arf-hlr-data.json not found). Run: npm run build:arf');
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
