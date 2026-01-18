#!/usr/bin/env node
/**
 * Validate documents.yaml against JSON Schema
 * 
 * Ensures all required fields are present, especially shortTitle for regulations.
 * See DEC-043 for rationale.
 * 
 * Usage: node scripts/validate-documents.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import Ajv from 'ajv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// documents.yaml and schema are in PROJECT_ROOT/scripts, not docs-portal/scripts
const PROJECT_ROOT = join(__dirname, '..', '..');
const YAML_PATH = join(PROJECT_ROOT, 'scripts', 'documents.yaml');
const SCHEMA_PATH = join(PROJECT_ROOT, 'scripts', 'documents.schema.json');

function validate() {
    console.log('🔍 Validating documents.yaml...\n');

    // Load YAML
    let config;
    try {
        const content = readFileSync(YAML_PATH, 'utf-8');
        config = yaml.load(content);
    } catch (err) {
        console.error(`❌ Failed to load documents.yaml: ${err.message}`);
        process.exit(1);
    }

    // Load Schema
    let schema;
    try {
        const schemaContent = readFileSync(SCHEMA_PATH, 'utf-8');
        schema = JSON.parse(schemaContent);
    } catch (err) {
        console.error(`❌ Failed to load schema: ${err.message}`);
        process.exit(1);
    }

    // Validate with AJV
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(schema);
    const valid = validate(config);

    if (!valid) {
        console.error('❌ Validation errors:\n');
        for (const error of validate.errors) {
            console.error(`   ${error.instancePath || '/'}: ${error.message}`);
        }
        process.exit(1);
    }

    // Additional DEC-043 validation: regulations must have shortTitle
    const regulations = config.documents.filter(d =>
        d.legalType === 'regulation' && d.category !== 'implementing_act'
    );

    const missingShortTitle = regulations.filter(r => !r.shortTitle);
    if (missingShortTitle.length > 0) {
        console.error('❌ DEC-043 violation: Regulations missing shortTitle:\n');
        for (const doc of missingShortTitle) {
            console.error(`   - ${doc.celex} (${doc.legalType}/${doc.category})`);
            console.error(`     Add: shortTitle: "Human Readable Name"\n`);
        }
        process.exit(1);
    }

    console.log(`✅ documents.yaml is valid!`);
    console.log(`   📄 ${config.documents.length} documents`);
    console.log(`   📜 ${regulations.length} core regulations (all have shortTitle)`);
    console.log(`   📋 ${config.documents.length - regulations.length} implementing acts/referenced docs`);
}

validate();
