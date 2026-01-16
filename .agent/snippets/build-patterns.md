# Build Patterns

Reusable patterns for Node.js build scripts in the eIDAS portal.

---

## Config-Driven with Fail-Fast Validation

When a feature relies on configuration, implement fail-fast validation to catch missing config at build time.

### Pattern

```javascript
// 1. Load config from YAML/JSON (Single Source of Truth)
function loadConfig() {
    const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return yaml.load(content);
}

// 2. Lookup function with type awareness
function getConfigValue(identifier) {
    const config = loadConfig();
    const entry = config.entries.find(e => e.id === identifier);
    return entry?.requiredField || null;
}

// 3. Main function uses config with fail-fast
function processItem(item, type) {
    // Priority 1: Check config first
    const configValue = getConfigValue(item.id);
    if (configValue) {
        return configValue;
    }

    // Priority 2: Derive from convention (for some types)
    if (type === 'derived-type') {
        const derived = deriveFromConvention(item);
        if (derived) return derived;
    }

    // FAIL FAST: Required types MUST have config
    if (type === 'required-type') {
        throw new Error(
            `❌ BUILD FAILED: Missing config for "${item.id}"\n\n` +
            `   FIX: Add to config.yaml:\n\n` +
            `   - id: ${item.id}\n` +
            `     requiredField: "value"\n\n` +
            `   See DEC-XXX for rationale.`
        );
    }

    // Fallback for other types
    return defaultValue(item);
}
```

### Error Propagation

```javascript
// Catch blocks should re-throw critical errors
for (const item of items) {
    try {
        processItem(item);
    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        
        // Re-throw critical errors (fail-fast)
        if (err.message.includes('BUILD FAILED')) {
            throw err;
        }
        // Continue processing non-critical errors
    }
}
```

### Example: DEC-043 Short Title Validation

```javascript
// From build-content.js
function extractShortTitle(fullTitle, celex, type, dirName, subject) {
    // Priority 1: Markdown metadata
    if (subject) return subject;

    // Priority 2: YAML config (Single Source of Truth)
    const configShortTitle = getShortTitleFromConfig(dirName);
    if (configShortTitle) return configShortTitle;

    // Priority 3: Folder name pattern (implementing acts)
    if (type === 'implementing-act' && dirName) {
        const match = dirName.match(/^\d{4}_\d+_(.+)$/);
        if (match) return formatTitle(match[1]);
    }

    // FAIL FAST: Regulations must have explicit config
    if (type === 'regulation') {
        throw new Error(`❌ BUILD FAILED: No shortTitle for regulation "${dirName}"`);
    }

    return truncate(fullTitle, 60);
}
```

---

## JSON Schema Validation

Validate YAML/JSON config files against a schema before processing.

### Setup

1. Create schema file:
```json
// config.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["version", "entries"],
  "properties": {
    "entries": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "type"],
        "properties": {
          "id": { "type": "string" },
          "type": { "type": "string", "enum": ["type-a", "type-b"] }
        }
      }
    }
  }
}
```

2. Create validation script:
```javascript
import Ajv from 'ajv';
import yaml from 'js-yaml';

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

const config = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf-8'));
const valid = validate(config);

if (!valid) {
    console.error('❌ Validation errors:');
    for (const error of validate.errors) {
        console.error(`   ${error.instancePath}: ${error.message}`);
    }
    process.exit(1);
}
```

3. Add to package.json:
```json
{
  "scripts": {
    "validate:config": "node scripts/validate-config.js",
    "build": "npm run validate:config && node scripts/build.js"
  }
}
```

---

## Warning Suppression with Known Lists

For warnings that are expected (known issues awaiting fix), suppress individual messages but track the count.

### Pattern

```javascript
function validateItems(items) {
    const warnings = [];
    let knownCount = 0;

    // Known issues - suppress individual warnings but count them
    const KNOWN_ISSUES = new Set(['item-1', 'item-2', 'item-3']);

    for (const item of items) {
        if (hasIssue(item)) {
            if (KNOWN_ISSUES.has(item.id)) {
                knownCount++;  // Suppress but count
            } else {
                warnings.push({ id: item.id, issue: detectIssue(item) });
            }
        }
    }

    return { warnings, knownCount };
}

// Output
const { warnings, knownCount } = validateItems(items);

if (warnings.length > 0) {
    console.log('⚠️  NEW WARNINGS (action required):');
    for (const w of warnings) {
        console.log(`   - ${w.id}: ${w.issue}`);
    }
}

if (knownCount > 0) {
    console.log(`📋 ${knownCount} known issues (suppressed)`);
}
```

### Benefits

1. **Clean output** — Only actionable warnings shown
2. **Visibility** — Total count still visible for awareness
3. **Easy to fix** — Remove from KNOWN_ISSUES set once resolved
4. **Self-documenting** — TODO comment explains what needs fixing

---

*Last updated: 2026-01-16*
