# Regulation 765/2008 Import - Detailed Implementation Plan

**Document:** Regulation (EC) No 765/2008 (Market Surveillance & Accreditation)  
**Status:** Planning → Implementation  
**Estimated Total:** 12-14 hours

---

## 🧠 Deep Architectural Analysis

### Core Challenges

**1. Multi-Source Terminology Reconciliation**
- **Problem:** Same term defined in multiple documents
- **Example:** "conformity assessment body" appears in:
  - eIDAS 910/2014, Art. 3(18b) → **references** 765/2008
  - Regulation 765/2008, Art. 2(13) → **canonical definition**
- **Solution:** Merge at build time, preserve all sources, display stacked

**2. Source Priority vs Display Priority**
- **Canonical Source:** 765/2008 (where definition originates)
- **Display Priority:** eIDAS 910/2014 (primary focus regulation)
- **Solution:** `primarySource` (for linking) ≠ `displayOrder` (for UI)

**3. Sidebar Taxonomy**
- **Current:** 2 categories (Regulations, Implementing Acts)
- **New:** 3 categories (Regulations, Referenced Regulations, Implementing Acts)
- **Visual Distinction:** Referenced regs need badge/icon to differentiate

**4. Search Ranking**
- **Current:** Flat ranking (all docs equal weight)
- **New:** Tiered ranking (primary > implementing > referenced)
- **Constraint:** Referenced docs should still be findable, just deprioritized

**5. Deep Linking Complexity**
- **Current:** Single source per term (`/terminology#term` → single article)
- **New:** Multi-source (`/terminology#term` → multiple articles)
- **Solution:** Default link to primary eIDAS article, show all sources in box

---

## 📋 Implementation Phases

### **Phase 1: Data Import & Conversion** (2 hours)

#### 1.1 Download Formex XML from EUR-Lex

**Steps:**
```bash
# Create directory structure
mkdir -p ~/dev/eIDAS20/raw-xml/regulations/765-2008

# Download from EUR-Lex API
# URL: https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32008R0765
```

**Deliverables:**
- `raw-xml/regulations/765-2008/*.xml` (Formex XML files)

**Validation:**
- ✅ XML files downloaded
- ✅ Contains Article 2 (Definitions)
- ✅ Includes all required structural elements

---

#### 1.2 Create Metadata File

**File:** `regulations/765-2008/metadata.json`

```json
{
  "celex": "32008R0765",
  "title": "Regulation (EC) No 765/2008 of the European Parliament and of the Council",
  "shortTitle": "Market Surveillance & Accreditation",
  "officialTitle": "Regulation (EC) No 765/2008 setting out the requirements for accreditation and market surveillance relating to the marketing of products",
  "year": 2008,
  "category": "referenced",
  "visibility": "visible",
  "description": "Foundational regulation defining conformity assessment, accreditation, and market surveillance frameworks",
  "eurlexUrl": "https://eur-lex.europa.eu/eli/reg/2008/765/oj/eng",
  "consolidatedDate": "2008-08-13",
  "adoptionDate": "2008-07-09",
  "applicationDate": "2010-01-01",
  "tags": ["conformity-assessment", "accreditation", "market-surveillance", "definitions"]
}
```

**Key Fields:**
- `category: "referenced"` → Triggers special sidebar treatment
- `visibility: "visible"` → Always shown (not toggleable)

**Deliverables:**
- `regulations/765-2008/metadata.json`

---

#### 1.3 Convert to Markdown

**Command:**
```bash
cd ~/dev/eIDAS20
python scripts/formex_to_md_v3.py regulations/765-2008/
```

**Expected Output:**
- `regulations/765-2008/765-2008.md` (main document)
- Proper article structure with IDs
- Definition lists in Article 2

**Validation:**
- ✅ Article 2 contains all 13 definitions
- ✅ Paragraph IDs generated correctly (`article-2-point-13`, etc.)
- ✅ Markdown formatting matches existing regulations

---

#### 1.4 Build Content Pipeline

**Command:**
```bash
cd ~/dev/eIDAS20/docs-portal
npm run build:content
```

**Expected Output:**
- `public/content/regulation-765-2008.json` (processed content)
- `public/content/search-index.json` (updated with 765/2008)

**Validation:**
- ✅ Document appears in `public/content/` directory
- ✅ Metadata propagated correctly
- ✅ Search index includes 765/2008 articles

---

### **Phase 2: Multi-Source Terminology System** (4-5 hours)

This is the **core architectural change**.

---

#### 2.1 Update Terminology Extraction Logic

**File:** `scripts/build-terminology.js`

**Current Data Model:**
```javascript
{
  term: "conformity assessment body",
  definition: "single definition text...",
  source: "regulation/910-2014",
  articleId: "article-3-18b"
}
```

**New Data Model:**
```javascript
{
  term: "conformity assessment body",
  sources: [
    {
      definition: "a conformity assessment body as defined in Article 2, point 13, of Regulation (EC) No 765/2008...",
      documentId: "regulation-910-2014",
      documentTitle: "eIDAS Regulation 910/2014",
      documentCategory: "primary",
      articleId: "article-3-18b",
      articleNumber: "3(18b)",
      displayOrder: 1  // eIDAS always first
    },
    {
      definition: "a body that performs conformity assessment activities including calibration, testing, certification and inspection",
      documentId: "regulation-765-2008",
      documentTitle: "Regulation 765/2008",
      documentCategory: "referenced",
      articleId: "article-2-point-13",
      articleNumber: "2(13)",
      displayOrder: 2  // Referenced regs below
    }
  ],
  primaryLinkTarget: "article-3-18b",  // Default deep link (eIDAS)
  hasMultipleSources: true
}
```

**Implementation:**

```javascript
// scripts/build-terminology.js

function extractTerminology(documents) {
  const termMap = new Map();

  for (const doc of documents) {
    const terms = extractTermsFromDocument(doc);
    
    for (const term of terms) {
      const normalizedTerm = term.term.toLowerCase().trim();
      
      if (!termMap.has(normalizedTerm)) {
        termMap.set(normalizedTerm, {
          term: term.term,  // Preserve original casing
          sources: [],
          hasMultipleSources: false
        });
      }
      
      const entry = termMap.get(normalizedTerm);
      
      // Determine display order based on category
      const displayOrder = getDisplayOrder(doc.metadata.category);
      
      entry.sources.push({
        definition: term.definition,
        documentId: doc.id,
        documentTitle: doc.metadata.shortTitle || doc.metadata.title,
        documentCategory: doc.metadata.category || 'primary',
        articleId: term.articleId,
        articleNumber: term.articleNumber,
        displayOrder: displayOrder
      });
    }
  }

  // Post-process: sort sources and set flags
  for (const [key, entry] of termMap.entries()) {
    // Sort sources by display order (eIDAS first)
    entry.sources.sort((a, b) => a.displayOrder - b.displayOrder);
    
    // Set flags
    entry.hasMultipleSources = entry.sources.length > 1;
    entry.primaryLinkTarget = entry.sources[0].articleId;  // First source (eIDAS)
  }

  return Array.from(termMap.values());
}

function getDisplayOrder(category) {
  const orderMap = {
    'primary': 1,           // eIDAS 910/2014, 2024/1183
    'implementing-act': 2,  // Implementing acts (unlikely to define terms)
    'referenced': 3         // 765/2008, others
  };
  return orderMap[category] || 99;
}
```

**Deliverables:**
- Updated `scripts/build-terminology.js`
- New data structure in `public/content/terminology.json`

**Validation:**
- ✅ Terms with multiple sources correctly merged
- ✅ eIDAS sources appear first
- ✅ All article IDs preserved
- ✅ Backwards compatible (single-source terms still work)

---

#### 2.2 Update Terminology Page UI

**File:** `docs-portal/src/pages/Terminology.jsx`

**Current UI (single source):**
```jsx
<div className="term-box">
  <h3>{term.term} <span className="article-ref">[ART. {term.articleNumber}]</span></h3>
  <p className="definition">{term.definition}</p>
  <a href={`#/regulation/910-2014?section=${term.articleId}`}>
    View in Regulation 910/2014 →
  </a>
</div>
```

**New UI (multi-source):**
```jsx
<div className="term-box">
  <h3>
    {term.term}
    <span className="article-ref">
      [ART. {term.sources[0].articleNumber}]
      {term.hasMultipleSources && (
        <span className="multi-source-indicator" title={`Defined in ${term.sources.length} documents`}>
          +{term.sources.length - 1}
        </span>
      )}
    </span>
  </h3>
  
  <div className="definitions-stack">
    {term.sources.map((source, index) => (
      <div key={index} className={`definition-source ${source.documentCategory}`}>
        <div className="source-header">
          <strong>{source.documentTitle}</strong>, Article {source.articleNumber}:
          {source.documentCategory === 'referenced' && (
            <span className="referenced-badge">Referenced</span>
          )}
        </div>
        <p className="definition-text">{source.definition}</p>
        <a 
          href={`#/${source.documentId}?section=${source.articleId}`}
          className="view-link"
        >
          View in {source.documentTitle} →
        </a>
      </div>
    ))}
  </div>
</div>
```

**CSS Styling:**
```css
/* Terminology.css */

.definitions-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

.definition-source {
  border-left: 3px solid var(--primary-color);
  padding-left: 1rem;
  position: relative;
}

.definition-source.referenced {
  border-left-color: var(--cyan-muted);
  opacity: 0.9;
}

.source-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.referenced-badge {
  background: var(--cyan-muted);
  color: var(--bg-primary);
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.definition-text {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.multi-source-indicator {
  background: var(--cyan);
  color: var(--bg-primary);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  margin-left: 0.25rem;
  font-weight: 700;
}

.view-link {
  font-size: 0.875rem;
  color: var(--primary-color);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: opacity 0.15s;
}

.view-link:hover {
  opacity: 0.8;
}
```

**Deliverables:**
- Updated `Terminology.jsx` (stacked display)
- Updated `Terminology.css` (multi-source styling)

**Validation:**
- ✅ Single-source terms display unchanged
- ✅ Multi-source terms show stacked definitions
- ✅ eIDAS definitions appear first
- ✅ Referenced badge visible for 765/2008 definitions
- ✅ All "View in..." links work correctly

---

#### 2.3 Update Terminology Popover

**File:** `docs-portal/src/components/TerminologyPopover.jsx`

**Current popover (hover on terms in content):**
```jsx
<div className="popover-content">
  <strong>{term.term}</strong>
  <p>{term.definition}</p>
</div>
```

**New popover (multi-source):**
```jsx
<div className="popover-content">
  <strong>{term.term}</strong>
  
  {/* Show only primary source in popover (eIDAS) */}
  <div className="primary-definition">
    <p>{term.sources[0].definition}</p>
    <span className="source-label">
      — {term.sources[0].documentTitle}, Art. {term.sources[0].articleNumber}
    </span>
  </div>
  
  {/* Indicate if other sources exist */}
  {term.hasMultipleSources && (
    <div className="additional-sources-hint">
      <small>
        + {term.sources.length - 1} more definition{term.sources.length > 2 ? 's' : ''}
        <a href="#/terminology" className="see-all-link">
          See all →
        </a>
      </small>
    </div>
  )}
</div>
```

**Deliverables:**
- Updated `TerminologyPopover.jsx`
- Updated `CitationPopover.css` (reuse same styling)

**Validation:**
- ✅ Hover popovers show primary definition (eIDAS)
- ✅ "+N more definitions" hint visible for multi-source terms
- ✅ "See all" link navigates to Terminology page
- ✅ Popover doesn't become too tall

---

### **Phase 3: Sidebar & Navigation** (2-3 hours)

---

#### 3.1 Update Sidebar Component

**File:** `docs-portal/src/components/Sidebar.jsx`

**Current structure:**
```jsx
<nav className="sidebar">
  <CollapsibleSection title="📖 Regulations">
    {regulations.map(doc => <DocumentLink doc={doc} />)}
  </CollapsibleSection>
  
  <CollapsibleSection title="📋 Implementing Acts">
    {implementingActs.map(doc => <DocumentLink doc={doc} />)}
  </CollapsibleSection>
</nav>
```

**New structure:**
```jsx
<nav className="sidebar">
  <CollapsibleSection title="📖 Regulations">
    {primaryRegulations.map(doc => <DocumentLink doc={doc} />)}
  </CollapsibleSection>
  
  {/* NEW SECTION */}
  <CollapsibleSection 
    title="🔗 Referenced Regulations" 
    defaultCollapsed={false}
    className="referenced-section"
  >
    {referencedRegulations.map(doc => (
      <DocumentLink 
        doc={doc} 
        badge="Referenced" 
        badgeColor="cyan"
      />
    ))}
  </CollapsibleSection>
  
  <CollapsibleSection title="📋 Implementing Acts">
    {implementingActs.map(doc => <DocumentLink doc={doc} />)}
  </CollapsibleSection>
</nav>
```

**Document categorization logic:**
```javascript
// Sidebar.jsx

const categorizeDocuments = (documents) => {
  const primary = [];
  const referenced = [];
  const implementingActs = [];
  
  for (const doc of documents) {
    const category = doc.metadata?.category || 'primary';
    
    if (category === 'referenced') {
      referenced.push(doc);
    } else if (category === 'implementing-act') {
      implementingActs.push(doc);
    } else {
      primary.push(doc);
    }
  }
  
  return { primary, referenced, implementingActs };
};
```

**Badge component:**
```jsx
// DocumentLink.jsx

function DocumentLink({ doc, badge, badgeColor = 'primary' }) {
  return (
    <a href={`#/${doc.id}`} className="document-link">
      <span className="doc-title">{doc.metadata.shortTitle || doc.metadata.title}</span>
      {badge && (
        <span className={`doc-badge badge-${badgeColor}`}>
          {badge}
        </span>
      )}
    </a>
  );
}
```

**CSS:**
```css
/* Sidebar.css */

.referenced-section {
  opacity: 0.95;
}

.referenced-section .document-link {
  opacity: 0.9;
}

.doc-badge {
  font-size: 0.65rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
  font-weight: 600;
  margin-left: 0.5rem;
}

.badge-cyan {
  background: var(--cyan-muted);
  color: var(--bg-primary);
}
```

**Deliverables:**
- Updated `Sidebar.jsx` (3 categories)
- Updated `Sidebar.css` (referenced styling)
- Updated `DocumentLink.jsx` (badge support)

**Validation:**
- ✅ Three sections visible in sidebar
- ✅ 765/2008 appears in "Referenced Regulations"
- ✅ "Referenced" badge visible
- ✅ Clicking 765/2008 navigates correctly
- ✅ All existing navigation still works

---

#### 3.2 Update Document Metadata Loading

**File:** `docs-portal/src/utils/content-loader.js`

Ensure `category` field propagates from metadata to frontend:

```javascript
// content-loader.js

export async function loadDocumentMetadata(documentId) {
  const response = await fetch(`/content/${documentId}.json`);
  const data = await response.json();
  
  return {
    id: documentId,
    title: data.metadata.title,
    shortTitle: data.metadata.shortTitle,
    category: data.metadata.category || 'primary',  // Propagate category
    celex: data.metadata.celex,
    eurlexUrl: data.metadata.eurlexUrl,
    // ... other fields
  };
}
```

**Deliverables:**
- Updated `content-loader.js`

**Validation:**
- ✅ `category` field available in React components
- ✅ No console errors
- ✅ Sidebar correctly categorizes documents

---

### **Phase 4: Search Integration** (2 hours)

---

#### 4.1 Update Search Configuration

**File:** `docs-portal/src/utils/search-config.js`

**Add category-based ranking boost:**

```javascript
// search-config.js

export const CATEGORY_BOOST = {
  primary: 1.0,           // eIDAS 910/2014, 2024/1183 (baseline)
  'implementing-act': 0.8, // Technical specifications
  referenced: 0.6         // 765/2008, others (lower priority)
};

export function applyDocumentBoost(result) {
  const category = result.document?.metadata?.category || 'primary';
  const categoryBoost = CATEGORY_BOOST[category];
  
  // Apply boost to score
  result.score *= categoryBoost;
  
  return result;
}
```

**Deliverables:**
- Updated `search-config.js`

---

#### 4.2 Update Search Index Building

**File:** `scripts/build-search-index.js`

**Include category in search index:**

```javascript
// build-search-index.js

const searchIndex = documents.map(doc => ({
  id: doc.id,
  title: doc.metadata.title,
  shortTitle: doc.metadata.shortTitle,
  category: doc.metadata.category || 'primary',  // Include category
  content: doc.content,
  // ... other fields
}));
```

**Deliverables:**
- Updated `build-search-index.js`
- Rebuilt `public/content/search-index.json`

**Validation:**
- ✅ Search index includes `category` field
- ✅ All documents indexed correctly

---

#### 4.3 Apply Ranking in Search Components

**Files:**
- `docs-portal/src/hooks/useFullTextSearch.js`
- `docs-portal/src/hooks/useSemanticSearch.js`

**Full-text search:**
```javascript
// useFullTextSearch.js

import { applyDocumentBoost } from '../utils/search-config';

const results = oramaSearch(query);

// Apply category boost
const boostedResults = results.map(result => applyDocumentBoost(result));

return boostedResults;
```

**Semantic search:**
```javascript
// useSemanticSearch.js

import { CATEGORY_BOOST } from '../utils/search-config';

const results = await semanticSearch(query);

// Apply category boost
results.forEach(result => {
  const category = result.metadata?.category || 'primary';
  result.similarity *= CATEGORY_BOOST[category];
});

return results.sort((a, b) => b.similarity - a.similarity);
```

**Deliverables:**
- Updated `useFullTextSearch.js`
- Updated `useSemanticSearch.js`

**Validation:**
- ✅ eIDAS results ranked higher than 765/2008
- ✅ 765/2008 results still appear (not filtered out)
- ✅ Implementing acts ranked between primary and referenced

---

#### 4.4 Add Visual Indicator in Search Results

**File:** `docs-portal/src/components/SearchModal.jsx`

**Add badge to referenced documents:**

```jsx
// SearchModal.jsx

<div className="search-result">
  <h4 className="result-title">
    {result.title}
    {result.document?.category === 'referenced' && (
      <span className="result-badge">Referenced</span>
    )}
  </h4>
  <p className="result-snippet">{result.snippet}</p>
</div>
```

**CSS:**
```css
/* SearchModal.css */

.result-badge {
  background: var(--cyan-muted);
  color: var(--bg-primary);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.65rem;
  margin-left: 0.5rem;
  text-transform: uppercase;
  font-weight: 600;
}
```

**Deliverables:**
- Updated `SearchModal.jsx`
- Updated `SearchModal.css`

**Validation:**
- ✅ Referenced docs show "Referenced" badge in search results
- ✅ Badge styling matches sidebar badge
- ✅ Badge doesn't break layout on mobile

---

### **Phase 5: Testing & Verification** (2 hours)

---

#### 5.1 Unit Tests

**File:** `scripts/__tests__/build-terminology.test.js` (new)

```javascript
// build-terminology.test.js

describe('Multi-source terminology merging', () => {
  test('merges duplicate terms from multiple documents', () => {
    const docs = [
      {
        id: 'regulation-910-2014',
        metadata: { category: 'primary' },
        terms: [{ term: 'conformity assessment body', definition: 'reference definition...' }]
      },
      {
        id: 'regulation-765-2008',
        metadata: { category: 'referenced' },
        terms: [{ term: 'conformity assessment body', definition: 'canonical definition...' }]
      }
    ];
    
    const result = extractTerminology(docs);
    
    expect(result).toHaveLength(1);
    expect(result[0].term).toBe('conformity assessment body');
    expect(result[0].hasMultipleSources).toBe(true);
    expect(result[0].sources).toHaveLength(2);
    expect(result[0].sources[0].documentId).toBe('regulation-910-2014'); // eIDAS first
  });
  
  test('single-source terms remain unchanged', () => {
    const docs = [
      {
        id: 'regulation-910-2014',
        metadata: { category: 'primary' },
        terms: [{ term: 'unique term', definition: 'definition...' }]
      }
    ];
    
    const result = extractTerminology(docs);
    
    expect(result[0].hasMultipleSources).toBe(false);
    expect(result[0].sources).toHaveLength(1);
  });
});
```

**Deliverables:**
- New test file `scripts/__tests__/build-terminology.test.js`
- Run with `npm test` in `docs-portal/`

**Validation:**
- ✅ All tests pass
- ✅ Multi-source merging works correctly
- ✅ Display order correct (eIDAS first)

---

#### 5.2 Browser Testing Workflow

**Use `/browser-testing` workflow**

**Test Cases:**

1. **Sidebar Navigation**
   - ✅ Three sections visible
   - ✅ 765/2008 in "Referenced Regulations"
   - ✅ Badge visible and styled correctly
   - ✅ Click 765/2008 → navigates to document

2. **Terminology Page**
   - ✅ Multi-source terms show stacked definitions
   - ✅ eIDAS definition appears first
   - ✅ 765/2008 definition appears below
   - ✅ Both "View in..." links work
   - ✅ "+N more" indicator visible in header

3. **Terminology Popovers**
   - ✅ Hover on term → shows primary (eIDAS) definition
   - ✅ "+1 more definition" hint visible
   - ✅ "See all" link works

4. **Search**
   - ✅ Search "conformity assessment" → both docs appear
   - ✅ eIDAS ranked higher than 765/2008
   - ✅ "Referenced" badge visible in results
   - ✅ Clicking result navigates correctly

5. **Deep Linking**
   - ✅ `/terminology#conformity-assessment-body` → shows multi-source box
   - ✅ `/regulation-765-2008?section=article-2-point-13` → scrolls to definition
   - ✅ All anchor links functional

**Deliverables:**
- Screenshot artifacts from browser testing
- Documented test results

---

#### 5.3 Visual Regression Check

**Compare before/after:**

- Existing terminology terms (should be unchanged)
- Sidebar layout (should add new section, not break existing)
- Search results (should still work for all existing docs)

**Deliverables:**
- Visual comparison screenshots
- Confirmation of no regressions

---

### **Phase 6: Documentation & Cleanup** (1 hour)

---

#### 6.1 Update DECISIONS.md

**Add new decision entry:**

```markdown
## DEC-012: Multi-Source Terminology System

**Date:** 2026-01-16  
**Status:** Implemented  
**Context:** Regulation 765/2008 defines foundational terms (e.g., "conformity assessment body") that eIDAS 910/2014 references. Need to support displaying both definitions.

**Decision:**
- Import 765/2008 as **complementary referenced regulation**
- Merge duplicate terms at build time (preserve all sources)
- Display both definitions in **single stacked box** on Terminology page
- **eIDAS definition always appears first** (display priority ≠ canonical source)
- Hover popovers show only primary (eIDAS) definition with "+N more" hint
- Three-tier sidebar taxonomy: Regulations / Referenced Regulations / Implementing Acts
- Category-based search ranking (primary 1.0, implementing 0.8, referenced 0.6)

**Alternatives Considered:**
1. ❌ **Separate definitions on different pages** → Requires navigation, poor UX
2. ❌ **Show only canonical definition** → Loses eIDAS context
3. ❌ **Tabs/accordions within definition box** → Extra clicks, hidden content
4. ✅ **Stacked display in single box** → All info visible, clear hierarchy

**Implementation:**
- Multi-source data model in `build-terminology.js`
- Stacked UI in `Terminology.jsx` and `TerminologyPopover.jsx`
- Category metadata system (`primary`, `referenced`, `implementing-act`)
- Three-section sidebar with badges

**Impact:**
- Future complementary regs can be added using same pattern
- Backwards compatible (single-source terms unchanged)
- Clear visual distinction between primary and referenced docs
```

**Deliverables:**
- Updated `DECISIONS.md`

---

#### 6.2 Update TRACKER.md

**Add to "Portal Features (Complete)" section:**

```markdown
- **Multi-source terminology** (REG-012: 765/2008 integrated, stacked definitions, eIDAS-first display)
```

**Add to "Backlog" section:**

```markdown
| Additional referenced regulations | Import foundational EU regs (768/2008, 1025/2012, GDPR) | Medium |
```

**Update "Recent Sessions" table:**

```markdown
| 2026-01-16 15:30 | Regulation 765/2008 import: Multi-source terminology, 3-tier sidebar, category ranking |
```

**Deliverables:**
- Updated `TRACKER.md`

---

#### 6.3 Update AGENTS.md (if needed)

**Add rule for future complementary document imports:**

```markdown
## Rule 6: Complementary Document Import Pattern

When importing **referenced regulations** (documents cited by eIDAS but not part of the core framework):

1. **Metadata:** Set `"category": "referenced"`, `"visibility": "visible"`
2. **Sidebar:** Document appears in "🔗 Referenced Regulations" section
3. **Terminology:** Merge duplicate terms, preserve all sources, eIDAS displayed first
4. **Search:** Apply category boost (0.6x vs primary 1.0x)
5. **Testing:** Verify multi-source display on Terminology page + popovers
6. **Documentation:** Update DECISIONS.md and TRACKER.md

**Examples:** Regulation 765/2008, 768/2008, 1025/2012
```

**Deliverables:**
- Updated `AGENTS.md` (if pattern is codified)

---

#### 6.4 Commit Strategy

**Auto-commit after each phase:**

```bash
# Phase 1
git add regulations/765-2008/
git commit -m "feat: import Regulation 765/2008 raw data and metadata"

# Phase 2
git add scripts/build-terminology.js public/content/terminology.json
git commit -m "feat: multi-source terminology system (DEC-012)"

# Phase 3
git add docs-portal/src/components/Sidebar.jsx docs-portal/src/components/DocumentLink.jsx
git commit -m "feat: three-tier sidebar with Referenced Regulations section"

# Phase 4
git add docs-portal/src/hooks/useFullTextSearch.js docs-portal/src/hooks/useSemanticSearch.js
git commit -m "feat: category-based search ranking"

# Phase 5
git add scripts/__tests__/
git commit -m "test: multi-source terminology unit tests"

# Phase 6
git add DECISIONS.md TRACKER.md
git commit -m "docs: DEC-012 multi-source terminology (765/2008 import complete)"
```

---

## 🎯 Success Criteria

**Functional:**
- ✅ 765/2008 appears in sidebar under "Referenced Regulations"
- ✅ Multi-source terms show both definitions (eIDAS first, 765/2008 below)
- ✅ All deep links work (`/terminology#term`, `/regulation-765-2008?section=...`)
- ✅ Search returns results from 765/2008 (ranked lower than eIDAS)
- ✅ Popovers show primary definition + "+N more" hint
- ✅ Existing single-source terms unchanged (backwards compatible)

**Non-Functional:**
- ✅ No performance degradation (build time < 5s increase)
- ✅ Mobile responsive (stacked definitions don't overflow)
- ✅ Accessible (screen readers can navigate stacked definitions)
- ✅ Visual polish (badges, spacing, colors consistent)

**Quality:**
- ✅ Unit tests pass (multi-source merging)
- ✅ Browser tests pass (all 5 test cases)
- ✅ No console errors or warnings
- ✅ Documentation complete (DECISIONS.md, TRACKER.md)

---

## 🔮 Future Backlog Items

**Additional Referenced Regulations (Medium Priority):**

1. **Regulation (EC) No 768/2008** - Common framework for marketing of products
   - Complements 765/2008 on accreditation and conformity assessment
   - Likely referenced in implementing acts

2. **Regulation (EU) No 1025/2012** - European standardisation
   - Defines harmonized standards, standardization bodies
   - Referenced in eIDAS context for technical specifications

3. **GDPR (Regulation 2016/679)** - Data protection
   - Directly relevant to eIDAS identity data processing
   - Many cross-references in implementing acts

4. **eSignature Directive 1999/93/EC** - Historical context
   - Original eSignature directive (repealed by eIDAS 1.0)
   - Useful for understanding evolution of framework

5. **Directive 2006/123/EC** - Services in the internal market
   - Context for cross-border service provision
   - Referenced in eIDAS recitals

**Estimated Effort (per additional regulation):**
- Phase 1-2: 2 hours (import + conversion)
- Phase 3-6: 1 hour (integration, no architectural changes)
- **Total per doc:** ~3 hours (infrastructure already built)

---

## 📊 Estimated Timeline

| Phase | Tasks | Hours | Dependencies |
|-------|-------|-------|--------------|
| **Phase 1** | Data import & conversion | 2h | EUR-Lex API access |
| **Phase 2** | Multi-source terminology | 4-5h | Phase 1 complete |
| **Phase 3** | Sidebar & navigation | 2-3h | Phase 2 complete |
| **Phase 4** | Search integration | 2h | Phase 3 complete |
| **Phase 5** | Testing & verification | 2h | Phases 1-4 complete |
| **Phase 6** | Documentation & cleanup | 1h | Phase 5 complete |
| **Total** | | **13-15h** | |

**Recommended Schedule:**
- **Day 1 (4 hours):** Phases 1-2 (foundation)
- **Day 2 (4 hours):** Phases 3-4 (UI/UX)
- **Day 3 (3 hours):** Phases 5-6 (testing & docs)

---

## 🚀 Ready to Begin

**First task:** Download Regulation 765/2008 Formex XML from EUR-Lex

Shall I proceed with Phase 1?
