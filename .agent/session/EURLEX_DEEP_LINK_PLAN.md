# EUR-Lex Deep Linking Implementation Plan

> **Goal**: Auto-detect references to external (non-imported) EU documents and generate clickable EUR-Lex deep links with provision anchors.

**Created**: 2026-01-25  
**Status**: IN PROGRESS  
**Test Document**: eIDAS 2.0 Consolidated (2014-910)  
**Implementation Pattern**: Follow `rehype-term-links.js` (DEC-085)

---

## Phase 1: External Documents Registry

### 1.1 Create Registry File

**File**: `docs-portal/config/external-documents.yaml`

```yaml
# External EU documents referenced but not imported
# Used for EUR-Lex deep linking

documents:
  # Digital/Platform Regulations
  - id: "2022/1925"
    celex: "32022R1925"
    title: "Digital Markets Act"
    short: "DMA"
    type: "regulation"
    
  - id: "2022/2065"
    celex: "32022R2065"
    title: "Digital Services Act"
    short: "DSA"
    type: "regulation"
    
  - id: "2015/2366"
    celex: "32015L2366"
    title: "Payment Services Directive"
    short: "PSD2"
    type: "directive"
    
  - id: "182/2011"
    celex: "32011R0182"
    title: "Comitology Regulation"
    short: "Comitology"
    type: "regulation"
    
  - id: "2019/882"
    celex: "32019L0882"
    title: "Accessibility Directive"
    short: "EAA"
    type: "directive"
    
  - id: "2022/2557"
    celex: "32022L2557"
    title: "Critical Entities Resilience Directive"
    short: "CER"
    type: "directive"
    
  - id: "2018/1972"
    celex: "32018L1972"
    title: "European Electronic Communications Code"
    short: "EECC"
    type: "directive"
    
  - id: "2018/1725"
    celex: "32018R1725"
    title: "EU Institutions Data Protection Regulation"
    short: "EUDPR"
    type: "regulation"

  # Add remaining ~30 documents from EXTERNAL_DOCS_INDEX.md
```

---

## Phase 2: Build-Time Processing

### 2.1 Modify Build Script

**File**: `docs-portal/scripts/build-documents.js` (or equivalent)

Add a post-processing step that:
1. Scans rendered HTML for regulation references
2. Matches against external-documents.yaml
3. Wraps matches in `<a>` tags with EUR-Lex URLs

### 2.2 Reference Detection Regex

```javascript
// Match patterns like:
// - "Regulation (EU) 2022/1925"
// - "Regulation (EU) No 182/2011"  
// - "Directive (EU) 2019/882"
// - "Article 5 of Regulation (EU) No 182/2011"
// - "Article 6(7) of Regulation (EU) 2022/1925"

const REGULATION_REF = /(?:Article\s+(\d+)(?:\((\d+)\))?\s+of\s+)?(Regulation|Directive)\s+\(E[CU]\)\s+(?:No\s+)?(\d+\/\d{4})/gi;
```

### 2.3 EUR-Lex URL Builder

```javascript
function buildEurLexUrl(celex, article = null, paragraph = null) {
  let url = `https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:${celex}`;
  
  if (article && paragraph) {
    // #NNN.MMM format (zero-padded)
    const artPad = String(article).padStart(3, '0');
    const paraPad = String(paragraph).padStart(3, '0');
    url += `#${artPad}.${paraPad}`;
  } else if (article) {
    url += `#art_${article}`;
  }
  
  return url;
}
```

---

## Phase 3: UI Component

### 3.1 External Link Styling

**File**: `docs-portal/src/index.css`

```css
/* External document links */
.external-law-link {
  color: var(--link-color);
  text-decoration: none;
  border-bottom: 1px dashed var(--link-color);
  cursor: pointer;
}

.external-law-link:hover {
  border-bottom-style: solid;
}

.external-law-link::after {
  content: " ↗";
  font-size: 0.75em;
  opacity: 0.7;
}

/* Optional: Badge for external docs */
.external-law-link[data-short]::before {
  content: attr(data-short);
  font-size: 0.7em;
  background: var(--accent-color);
  color: white;
  padding: 1px 4px;
  border-radius: 3px;
  margin-right: 4px;
}
```

---

## Phase 4: Implementation Steps

### Step 1: Test with Single Document ✅ START HERE

**Target**: eIDAS 2.0 Consolidated (`01_regulation/2014_910_eIDAS_Consolidated/`)

1. Find all external references in this document
2. Manually verify EUR-Lex anchors work for each
3. Implement link injection for this document only
4. Review rendered output in browser

### Step 2: Create External Docs Registry

1. Create `external-documents.yaml` with all ~40 documents
2. Add build script to parse registry at build time
3. Export as JavaScript module for runtime use

### Step 3: Implement Link Processor

**Option A: Build-time (Recommended)**
- Process markdown → HTML during build
- Inject `<a>` tags with EUR-Lex URLs
- Zero runtime cost

**Option B: Runtime**
- Post-process in React after render
- More flexible but slower
- Easier to debug

### Step 4: Add Popover Enhancement (Optional)

When hovering/clicking external link:
- Show document title
- Show "External document — opens EUR-Lex"
- Provide deep link to specific provision

### Step 5: Roll Out to All Documents

- Apply to all 43 imported documents
- Verify no false positives (internal refs shouldn't link externally)
- Test edge cases (repealed regulations, etc.)

---

## Test Cases for Phase 1

**Document**: eIDAS 2.0 Consolidated  
**Location**: Article 12b

| Reference Text | Should Link To |
|----------------|----------------|
| `Article 2, point (2), of Regulation (EU) 2022/1925` | `32022R1925#art_2` |
| `Article 6(7) of Regulation (EU) 2022/1925` | `32022R1925#006.007` |
| `Article 33 of Regulation (EU) 2022/2065` | `32022R2065#art_33` |
| `Directive (EU) 2019/882` | `32019L0882` (no anchor) |

---

## File Changes Summary

| File | Change |
|------|--------|
| `config/external-documents.yaml` | NEW — Registry of external docs |
| `scripts/build-documents.js` | MODIFY — Add link processor |
| `src/index.css` | MODIFY — Add external link styles |
| `src/utils/eurLexLinks.js` | NEW — URL builder utility |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| False positives (linking internal docs) | Check against imported docs list before linking |
| EUR-Lex anchor changes | Anchors are stable (based on document structure) |
| Performance (many regex matches) | Process at build time, not runtime |
| Repealed regulations | Still link — EUR-Lex shows repeal info |

---

## Next Action

**START**: Implement for Article 12b in eIDAS 2.0 as proof of concept.

1. Manually add link in markdown? OR
2. Implement build-time processor?

Recommend option 2 — implement the processor on a single document first.
