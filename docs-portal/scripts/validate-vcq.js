#!/usr/bin/env node
/**
 * Validate VCQ Configuration Consistency
 * 
 * Ensures all VCQ configuration files are internally consistent:
 * - Every category value references valid IDs from categories.yaml
 * - Every applicability value is a valid intermediary type
 * - All required fields are present
 * - Legal basis references are syntactically correct
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

    // 2. Load valid intermediary types from vcq-config.yaml
    const vcqConfig = loadYaml(join(CONFIG_DIR, 'vcq-config.yaml'));
    const validIntermediaryTypes = new Set(Object.keys(vcqConfig.intermediaryTypes || {}));
    console.log(`   👥 Found ${validIntermediaryTypes.size} valid intermediary types`);

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
            const idPattern = /^VEND-(CORE|PIF|VIF|ICT|GDP)-\d{3}$/;
            if (!idPattern.test(reqId)) {
                errors.push({
                    file,
                    reqId,
                    field: 'id',
                    value: reqId,
                    message: `Invalid ID format. Expected: VEND-{CORE|PIF|VIF|ICT|GDP}-NNN`
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

            // Validate applicability (MANDATORY for VCQ)
            if (req.applicability) {
                if (!Array.isArray(req.applicability)) {
                    errors.push({
                        file,
                        reqId,
                        field: 'applicability',
                        value: req.applicability,
                        message: `'applicability' must be an array, e.g. [pif, vif]`
                    });
                } else {
                    for (const type of req.applicability) {
                        if (!validIntermediaryTypes.has(type)) {
                            errors.push({
                                file,
                                reqId,
                                field: 'applicability',
                                value: type,
                                message: `Invalid intermediary type: "${type}". Valid types: ${[...validIntermediaryTypes].join(', ')}`
                            });
                        }
                    }
                }
            } else {
                errors.push({
                    file,
                    reqId,
                    field: 'applicability',
                    value: 'MISSING',
                    message: `Requirement is missing 'applicability:' field. Specify which intermediary types this applies to.`
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
    console.log(`   📋 ${totalRequirements} total requirements`);
    console.log(`   🔗 All categories and applicability values are valid`);
    if (arfValidation.checked) {
        console.log(`   📐 ${arfValidation.valid} ARF HLR references validated\n`);
    } else {
        console.log('');
    }
}

validate();
