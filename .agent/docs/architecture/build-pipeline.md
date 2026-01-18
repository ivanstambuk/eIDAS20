# Build Pipeline Architecture

The documentation portal uses a multi-stage build pipeline with validation at each step.

## Pipeline Overview

```
Formex XML / HTML
        ↓
   Conversion Scripts
        ↓
   Markdown Files (01_regulation/, 02_implementing_acts/)
        ↓
build-content.js → JSON + regulations-index.json
        ↓
build-terminology.js → terminology.json
        ↓
build-citations.js → citations/*.json
        ↓
build-search-index.js → search-index.json
        ↓
build-embeddings.js → embeddings.json
```

## Script Dependencies

| Script | Inputs | Outputs | Validates |
|--------|--------|---------|-----------|
| `build-content.js` | Markdown files | `regulations/*.json`, `regulations-index.json` | ≥4 regulations loaded |
| `build-terminology.js` | Markdown Article 2 sections | `terminology.json` | ≥50 terms extracted |
| `build-citations.js` | Markdown files | `citations/*.json` | Internal link resolution |
| `build-search-index.js` | `terminology.json` | `search-index.json` | Terms loaded, staleness |
| `build-embeddings.js` | `terminology.json` | `embeddings.json` | Terms loaded, staleness |

## Validation Patterns

### Invariant Validation

Each script validates critical invariants before proceeding:

```javascript
// Example from build-terminology.js
if (terms.length < 50) {
    throw new Error(`Expected ≥50 terms, found ${terms.length}`);
}

const coreTerms = ['electronic identification', 'trust service', 'electronic signature'];
for (const term of coreTerms) {
    if (!terms.some(t => t.term.toLowerCase() === term)) {
        throw new Error(`Core term missing: ${term}`);
    }
}
```

### Staleness Detection

Scripts detect when inputs are newer than outputs:

```javascript
function checkStaleness(inputFile, outputFile) {
    const inputMtime = fs.statSync(inputFile).mtimeMs;
    const outputMtime = fs.statSync(outputFile).mtimeMs;
    
    if (inputMtime > outputMtime) {
        console.warn(`⚠️ WARNING: ${inputFile} is newer than ${outputFile}`);
    }
}
```

### Cache Invalidation

Build scripts with caching need explicit cache busting:

```javascript
// In build-citations.js
const CACHE_VERSION = '1.0.2';  // Bump when changing script logic

function computeCacheKey(content, registry) {
    const registryHash = hashObject(Object.keys(registry).sort());
    return crypto.createHash('md5')
        .update(CACHE_VERSION)
        .update(content)
        .update(registryHash)
        .digest('hex');
}
```

## Running the Build

### Full Build

```bash
cd docs-portal
npm run build
```

This runs (in order):
1. `build:content` - Markdown → JSON
2. `build:terminology` - Extract terms
3. `build:citations` - Process legal references
4. `build:search` - Build search index
5. `build:embeddings` - Generate semantic embeddings

### Partial Rebuilds

```bash
# After adding a new document
npm run build:content
npm run build:citations
npm run build:content  # Picks up updated citations

# After modifying terminology extraction
npm run build:terminology
npm run build:search
npm run build:embeddings

# Force full citation rebuild (cache clear)
rm public/data/citations/*.json
npm run build:citations
```

## Debugging Build Issues

### Common Symptoms

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Old citations showing | Cache not invalidated | Bump CACHE_VERSION or rm citations/*.json |
| Missing document in portal | Not in documents.yaml | Add entry to scripts/documents.yaml |
| Stale search results | Terminology not rebuilt | npm run build:terminology |
| ≥50 terms validation failed | Source document changed | Check Article 2 definitions in source |

### Build Output Locations

```
docs-portal/public/data/
├── regulations/           # Per-document JSON
│   ├── 2014-910.json
│   └── ...
├── regulations-index.json # Document metadata index
├── terminology.json       # Extracted terms
├── citations/             # Per-document citation data
│   ├── 2014-910-citations.json
│   └── ...
├── search-index.json      # Orama search index
└── embeddings.json        # Semantic embeddings
```

## Defense in Depth

For critical data (like terminology), validation happens at multiple points:

```
   Source (build-terminology.js)
   ✅ Validates ≥50 terms extracted
   ✅ Validates core terms present
        ↓
   Consumers (build-search-index.js, build-embeddings.js)
   ✅ Validates terminology.json exists
   ✅ Validates ≥50 terms in JSON
   ✅ Warns if terminology.json older than markdown sources
        ↓
   Build Chain (npm run build)
   ✅ Runs all scripts in correct order
   ✅ Fails fast if any validation fails
```

This prevents:
- Silent failures (empty search index)
- Stale data (cached old embeddings)
- Missing dependencies (terminology not rebuilt)
