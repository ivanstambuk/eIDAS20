# Design Decisions

Architectural and UX decisions for the eIDAS 2.0 Documentation Portal.

> **Format**: Each decision follows a lightweight ADR (Architecture Decision Record) structure.

---

## DEC-001: Single-page terminology glossary

**Date:** 2026-01-14  
**Status:** Accepted  

**Context:**  
The Terminology page displays 96 legal terms (expected to grow to 200+). Options considered:
- Single page with letter navigation (A-Z)
- Multiple pages, one per letter

**Decision:** Keep single page with letter navigation.

**Rationale:**
1. **Search** — Cmd+F works across ALL terms instantly
2. **Cross-referencing** — Legal workflows require comparing related terms
3. **Industry standard** — MDN (500+ terms), AWS (300+ terms), GDPR.eu all use single-page glossaries
4. **Performance** — Text-only content; 200-300 terms = ~100KB, trivial load
5. **Deep linking** — `#term-name` anchors work immediately

**When to reconsider:** If term count exceeds 500 AND scroll/load performance degrades noticeably.

---

## DEC-002: Strip front matter from rendered content

**Date:** 2026-01-14  
**Status:** Accepted  

**Context:**  
Markdown source files contain metadata that would be redundant in the portal UI:

1. **Metadata blockquote** (all documents):
```markdown
> **CELEX:** 32024R2977 | **Document:** Commission Implementing Regulation
>
> **Source:** https://eur-lex.europa.eu/...
```

2. **Amendment History table** (consolidated regulations only)

3. **Main H1 title** (all documents)

**Decision:** Strip all three from rendered portal content.

**Rationale:**
1. **Redundant** — Header already displays title, CELEX badge, date, "View on EUR-Lex" link
2. **Visual clutter** — Giant H1 takes ~20% of visible content area
3. **Reading flow** — Legal readers want to jump straight to Article 1
4. **Preserved at source** — Original markdown files retain all data for archival/traceability

**Implementation:** `docs-portal/scripts/build-content.js` → `stripFrontMatter()` function

---

## DEC-003: Blockquote formatting for amendments

**Date:** 2026-01-14  
**Status:** Accepted  

**Context:**  
Amending regulations have a specific structure: instruction text followed by replacement content. Need consistent visual distinction.

**Decision:** Use blockquotes ONLY for replacement content, not instruction text.

**Rules:**
- **Instruction text** (e.g., "(a) paragraph 1 is replaced by the following:") → Normal text
- **Replacement content** (e.g., "'1. This Regulation applies to...") → Blockquote (`>`)
- **Nested content** → Double blockquote (`>>`)

**Example:**
```markdown
**(1)** Article 1 is replaced by the following:

(a) paragraph 1 is replaced by the following:
> '1. This Regulation applies to electronic identification schemes...';

(b) paragraph 3 is replaced by the following:
> '3. This Regulation does not affect Union or national law...';
```

**Rationale:** Visual hierarchy clearly separates "what's being done" from "what the new text is."

---

## DEC-004: Hide hamburger menu on desktop

**Date:** 2026-01-14  
**Status:** Accepted  

**Context:**  
The hamburger (☰) menu button toggles sidebar visibility. On desktop (>1024px), the sidebar is always visible.

**Decision:** Hide the hamburger button on desktop viewports.

**Rationale:**
1. **No function** — Button does nothing since sidebar is always visible
2. **User confusion** — Clicking a non-functional button is frustrating
3. **Industry standard** — React Docs, Vue Docs, MDN, Stripe all hide hamburger on desktop
4. **Still available** — Button appears on mobile/tablet (≤1024px) where it's needed

**Implementation:** CSS media query with `display: none !important` to override `.btn` accessibility rules.

---

## DEC-005: Exclude amending regulation from RAG and terminology

**Date:** 2026-01-14  
**Status:** Accepted  

**Context:**  
The amending regulation (2024/1183) contains "patch" instructions like "Article X is replaced by the following:..." — not standalone legal text. The consolidated regulation (910/2014) contains the complete, applicable law.

**Decision:**  
- **RAG (AI context):** Exclude 2024/1183 from embedding generation
- **Terminology:** Only extract/link definitions from consolidated 910/2014
- **Full-text search:** Keep both searchable (for "what changed" queries)
- **Display:** Keep amending reg in portal, clearly labeled

**Rationale:**
1. **Legal correctness** — Consolidated is "the law"; amending is "the diff"
2. **User expectation** — Queries about definitions should return applicable law
3. **Avoiding confusion** — Replacement instructions are not standalone text
4. **Analogy** — An amending reg is like a git diff; you don't search diffs to understand current code

**Implementation:** 
- `docs-portal/scripts/document-config.json` — Metadata flags per document
- Build scripts check `ragEnabled` and `terminologySource` flags

---

## DEC-006: Terminology prioritized in search results

**Date:** 2026-01-14  
**Status:** Accepted  

**Context:**  
When searching for "wallet unit", users expect the **definition** to appear first, not articles that merely *contain* the term.

**Decision:**  
- **Full-text search (Orama):** Add `term` field with 10x boost factor
- **Semantic search:** Two-tier ranking — definitions always appear before articles

**Implementation:**
- `build-search-index.js` — Adds terminology with dedicated `term` field
- `build-embeddings.js` — Adds terminology with `type: 'definition'`
- `useSearch.js` — Boosts `term` field 10x
- `useSemanticSearch.js` — Separates definitions/articles, concatenates in order

**Rationale:**
1. **User expectation** — "What is X?" queries should return definitions first
2. **Different score systems** — Full-text uses unbounded scores (10x works); semantic uses 0-1 similarity (requires tiered approach)
3. **Legal context** — Precise definitions matter more than casual mentions

---

## DEC-007: Combined ranking for partial word queries

**Date:** 2026-01-14  
**Status:** Accepted  

**Context:**  
When typing "wallet solutio" (incomplete word), semantic search ranked "wallet unit" first because:
- Transformers tokenize "solutio" differently than "solution" (WordPiece fragmentation)
- The embedding for the incomplete word isn't similar to the complete word
- Full-text search handles this with prefix matching; semantic search does not

**Decision:**  
Implement **Combined Ranking** that blends:
- **Semantic similarity (70%)** — Embedding-based vector distance
- **Title similarity (30%)** — Prefix-aware word matching against term/section titles

**Algorithm:**
```javascript
combinedScore = (semanticSim * 0.7) + (titleSim * 0.3)
```

**Title similarity scoring:**
- Exact match: 1.0
- Title starts with query: 0.95
- Word-by-word prefix matching for partial words
- Minimum 3 characters for partial word matching

**Result:**
- Query "wallet solutio" → "wallet solution" now ranks **#1** (was #3)
- Related concepts still surface (semantic meaning preserved)
- Handles typos and incomplete input gracefully

**Alternatives considered:**
1. **Query completion** — Detect incomplete words, complete from dictionary. Rejected: requires maintaining term dictionary, may miss novel words.
2. **Post-processing boost** — Fixed boost for title matches. Rejected: less nuanced than weighted combination.

**Implementation:** `useSemanticSearch.js` → `titleSimilarity()` function + combined scoring

---

## DEC-008: Preamble injection from amending to consolidated regulation

**Date:** 2026-01-14  
**Status:** Accepted  

**Context:**  
The consolidated eIDAS regulation (910/2014) from EUR-Lex does not include a preamble or recitals. However, the amending regulation (2024/1183) contains 78 recitals explaining the legislative rationale for the 2024 amendments. User requirements:
1. Want to link to recitals from the consolidated document
2. Avoid linking to the amending regulation separately (per project rules)
3. Need interpretive context available alongside the applicable law

**Decision:**  
Implement a **build-time preamble injection** that automatically copies the preamble and recitals from 2024/1183 into the consolidated 910/2014 during the content build process.

**Implementation:**
- `docs-portal/scripts/build-content.js` — Added `PREAMBLE_INJECTION` config
- `extractAmendmentPreamble()` — Reads preamble from amending regulation markdown
- `injectPreamble()` — Inserts preamble before "Enacting Terms" in consolidated document
- Attribution notice clearly marks the source

**Output structure in consolidated:**
```markdown
> **Note:** The following preamble and recitals are from the amending 
> **Regulation (EU) 2024/1183**...

## Preamble
THE EUROPEAN PARLIAMENT AND THE COUNCIL...

## Recitals
- (1) The Commission Communication...
- ...
- (78) Regulation (EU) No 910/2014 should therefore be amended accordingly,

## Enacting Terms
### Article 1
...
```

**Rationale:**
1. **Single document** — Users get complete law + legislative intent in one place
2. **Deep linking** — `?section=recitals` works within consolidated document
3. **Reproducible** — Runs automatically on every build, not manual copy/paste
4. **Legal accuracy** — Clear attribution preserves provenance
5. **TOC integration** — Recitals appear in table of contents for navigation

**Alternatives considered:**
1. **Manual copy** — Rejected: not reproducible, error-prone
2. **Linked section** — Rejected: violates "no links to amending regulation" rule
3. **Two-part preamble (original + amendment)** — Deferred: would require fetching original 910/2014 recitals from EUR-Lex

---

## DEC-009: Citation formatting with responsive behavior and internal linking

**Date:** 2026-01-14  
**Status:** Accepted  

**Context:**  
Legal documents contain inline citations in verbose format:
```
[Commission Recommendation (EU) 2021/946 of 3 June 2021 on a common Union 
Toolbox... (OJ L 210, 14.6.2021, p. 51, ELI: http://data.europa.eu/eli/reco/2021/946/oj).]
```

Problems:
1. Breaks reading flow (4-5 lines per citation)
2. Raw URLs visible inline
3. Redundant information (citation name repeated)
4. No distinction between internal documents (we have them) and external references

**Decision:**  

**Part 1: Responsive rendering (Hybrid B+A)**
- **Desktop (≥768px):** Hover popovers — dotted underline, tooltip with full citation on hover
- **Mobile (<768px):** Footnotes — superscript numbers with References section at bottom

**Part 2: Internal vs External linking**
- **Internal documents** (in our portal): Link to portal route (`/#/regulations/910-2014`)
- **External documents** (not in portal): Link to EUR-Lex with 🔗 icon

**Implementation:**

1. **Build-time extraction:** Parse citations from markdown, extract CELEX/ELI, generate structured data
2. **Document registry:** Maintain list of all CELEX numbers in our database
3. **Link resolution:** Check if citation target is internal (portal link) or external (EUR-Lex)
4. **React components:**
   - `CitationRef` — Inline reference with media query switch
   - `CitationPopover` — Hover card (reuses TermPopover patterns)
   - `ReferencesSection` — Bottom section for mobile + accessibility

**Example output:**

*Desktop:*
> ...rely on the work carried out under <u>Commission Recommendation (EU) 2021/946</u>...
> [Popover on hover: Title, Date, OJ ref, "View on EUR-Lex →"]

*Mobile:*
> ...rely on the work carried out under Recommendation 2021/946<sup>1</sup>...
> 
> ---
> **References**
> 1. [Commission Recommendation (EU) 2021/946](https://eur-lex.europa.eu/...) 🔗

*Internal link (we have the document):*
> ...as amended by [Regulation (EU) 2024/1183](#/regulations/2024-1183)...

**Rationale:**
1. **Platform-appropriate UX** — Hover works on desktop; footnotes work everywhere
2. **Reading flow** — Main text stays clean and scannable
3. **Portal ecosystem** — Internal links keep users in the app, load instantly
4. **Accessibility** — Footnotes + References section work for screen readers
5. **Legal standards** — Matches academic/legal publishing conventions

**Alternatives considered:**
1. **Footnotes only** — Simpler, but loses instant-context benefit on desktop
2. **Popovers only** — Breaks on mobile (no hover on touch devices)
3. **All external links** — Misses opportunity to keep users in portal

---

## DEC-010: Remove "Enacting Terms" from Table of Contents

**Date:** 2026-01-15  
**Status:** Accepted  

**Context:**  
The Formex XML format uses `<ENACTING.TERMS>` as a structural container element that wraps all articles. The converter outputs this as a `## Enacting Terms` heading in markdown. This creates a TOC entry that:

1. Appears between Preamble/Recitals and Chapter I
2. Does NOT contain the chapters/articles as nested children
3. Is not a useful navigation target (users want Article 3, not "Enacting Terms")

**Options evaluated:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A: Remove from TOC** | Filter out from TOC generation | Clean, space-efficient | Loses XML structure visibility |
| **B: Keep as divider** | Non-clickable label (current) | Shows structure | Misleading — children not indented |
| **C: Collapsible parent** | Chapters nested under it | Accurate to XML | Text overflow, extra click depth |
| **D: Conditional** | Different behavior per doc type | Context-aware | Inconsistent UX |

**Decision:** Option A — Remove "Enacting Terms" from the TOC entirely.

**Rationale:**
1. **Not a navigation target** — No user says "take me to enacting terms"; they want specific articles
2. **Original purpose served** — The heading exists for preamble injection anchor (DEC-008), not navigation
3. **No information loss** — The heading remains in rendered content for readers scrolling through
4. **Space efficiency** — TOC sidebar is 280px; every line matters
5. **EUR-Lex precedent** — EUR-Lex HTML doesn't show "Enacting Terms" as navigable either

**Implementation:**
- `build-content.js` → `buildTableOfContents()` filters out heading via `excludedHeadings` Set
- Heading still renders in article content (visible when scrolling)

---

## DEC-011: Copy Reference gutter icons (EU-standard citations)

**Date:** 2026-01-15  
**Status:** ✅ Complete (all phases)  

**Context:**  
Legal professionals need to cite specific articles, paragraphs, and points from EU regulations. Concise parenthetical format preferred.

**Citation Format (user preference):**

| Level | ID | Citation |
|-------|-----|----------|
| Article | `article-5a` | `Article 5a` |
| Paragraph | `article-5a-para-1` | `Article 5a(1)` |
| Point | `article-5a-point-a` | `Article 5a(a)` |
| Subpoint | `article-5a-subpoint-ii` | `Article 5a(ii)` |

> **Note:** Concise `Article 1(1)(a)(i)` format used instead of verbose `Article 1, point (a)`.

**Decision:**  
Implement **gutter icons** that appear on hover next to legal structure elements:

1. **🔗 Copy Link** — Deep link URL with `?section=` parameter
2. **📜 Copy Reference** — Concise citation format

**Implementation (complete):**

| Phase | Level | Count |
|-------|-------|-------|
| Phase 1 | Article headings | ~50 |
| Phase 2 | Paragraphs + Points | 316 + 258 |
| Phase 3 | Subpoints (i), (ii) | 30 |

**Technical approach:**
- `rehype-paragraph-ids.js` — Build-time AST plugin for ID generation
- `useCopyReference.js` — Citation formatting hook
- DOM hydration via useEffect (event delegation)
- Visual feedback: ✓ checkmark + green color on copy

**Example outputs:**
- Link: `https://example.com/eIDAS20/#/regulation/910-2014?section=article-5a-para-1`
- Reference: `Article 5a(1)`

**Rationale:**
1. **Discoverability** — Gutter icons visible on hover
2. **Concise format** — Professional legal citations without verbosity
3. **654+ deep links** — Full coverage of legal hierarchy

---

## DEC-012: Build-Time Metadata Generation (Prevent hardcoded counts)

**Date:** 2026-01-16  
**Status:** Accepted  

**Context:**  
The Sidebar displayed "32 Documents Loaded" as a hardcoded value, which became stale when Regulation 765/2008 was added (bringing the total to 33). This violated the principle of single source of truth and would recur with every new document.

**Root Cause:**  
UI components lacked access to computed statistics at build time, forcing developers to either:
1. Hardcode values (error-prone)
2. Fetch large index files at runtime (30KB `regulations-index.json` just to count items)
3. Compute on every render (inefficient)

**Decision:**  
Implement **build-time metadata generation** that computes and validates statistics during the content build process.

**Architecture:**

```
Source Files (33 docs)
    ↓
build-content.js
    ├─→ regulations-index.json (29KB, full metadata)
    └─→ metadata.json (510B, computed stats) ← NEW
            ↓
        Sidebar.jsx fetches metadata.json
            ↓
        "33 Documents Loaded" (dynamic)
```

**Generated Metadata (`public/data/metadata.json`):**
```json
{
  "documentCount": 33,
  "regulationCount": 3,
  "implementingActCount": 30,
  "totalWordCount": 126727,
  "buildDate": "Jan 16, 2026",
  "lastBuildTime": "2026-01-16T15:31:14.740Z",
  "categories": { "regulations": {...}, "implementingActs": {...} }
}
```

**Build-Time Validation (Defense in Depth):**
1. **Type consistency:** `regulationCount + implementingActCount === documentCount`
2. **Expected count:** Warn if regulation count ≠ 3 (we should always have 910/2014, 2024/1183, 765/2008)
3. **Sanity check:** Fail if `totalWordCount < 10,000` (indicates extraction failure)

**Benefits:**
1. **Single source of truth** — Counts computed from actual documents, never hardcoded
2. **Build fails fast** — Data integrity errors caught at build time, not production
3. **150x smaller payload** — 510 bytes vs 30KB (regulations-index.json)
4. **Future-proof** — Adding documents automatically updates all stats
5. **Extensible** — Can add more metadata fields without changing UI code

**Implementation:**
- `docs-portal/scripts/build-content.js` — `generateMetadata()` function
- `docs-portal/src/components/Layout/Sidebar.jsx` — Fetches `metadata.json` instead of computing from index
- Build process now outputs TWO index files:
  - `regulations-index.json` — Full document metadata (for listings, search)
  - `metadata.json` — Lightweight aggregated stats (for UI indicators)

**Prevention Mechanism:**  
Following **AGENTS.md Rule 5 (Proactive Prevention Protocol)**, this pattern prevents ALL hardcoded values in UI components that should derive from source data. Future stats (category counts, word counts, etc.) must be added to `metadata.json`, not hardcoded.

**Alternatives considered:**
1. **Static import of regulations-index.json** — Simpler but bundles 30KB into JS
2. **Generate constants.js file** — Less flexible than JSON metadata
3. **Keep runtime fetch** — Works but wastes bandwidth and lacks build-time validation

**When to reconsider:**  
If metadata grows beyond ~2KB, consider splitting into specialized metadata files (e.g., `stats.json`, `build-info.json`).

---

## DEC-042: EUR-Lex HTML Fallback Converter

**Date:** 2026-01-16  
**Status:** Accepted  

**Context:**  
Older EU regulations (typically pre-2010) lack Formex XML manifestations on EUR-Lex. Regulation 765/2008 was initially manually extracted from HTML, which is:
1. Non-reproducible (one-time manual effort)
2. Cannot receive automated enrichments (paragraph IDs, citations, etc.)
3. Doesn't scale to additional HTML-only regulations (768/2008, GDPR, etc.)

**Discovery Process:**  
During ingestion of 765/2008:
1. Formex probe failed: `get_formex_url('32008R0765')` returned `None`
2. TXT probe failed: No TXT manifestation available
3. Only HTML available at `https://eur-lex.europa.eu/eli/reg/2008/765/oj/eng`

**Decision:**  
Create `eurlex_html_to_md.py` — a deterministic HTML parser that produces Markdown **structurally identical** to the Formex XML converter output.

**Architecture:**

```
documents.yaml
    │
    ├── source: formex (default) ──→ eurlex_formex.py
    │                                   ├── Download Formex ZIP
    │                                   └── Convert via formex_to_md_v3.py
    │
    └── source: html ──────────────→ eurlex_html_to_md.py
                                        ├── Download HTML from ELI endpoint
                                        ├── Parse with BeautifulSoup
                                        └── Generate identical Markdown structure
```

**Key Design Decisions:**

1. **Configuration-driven:** `source: html` in `documents.yaml` triggers HTML path
2. **Structural parity:** Output matches Formex converter exactly:
   - Same metadata blockquote format
   - Same heading hierarchy (`## CHAPTER`, `### Article`)
   - Same list formatting (`- (a)`, `- 1.`)
3. **Separate element parsing:** EUR-Lex HTML uses separate `<p>` elements for numbers and content (e.g., `<p>1.</p><p>Content...</p>`), requiring stateful lookahead parsing
4. **Pipeline integration:** `eurlex_formex.py` checks `uses_html_source()` before attempting Formex download

**HTML CSS Class Reference:**

| Class | Content Type |
|-------|--------------|
| `oj-ti-section-1` | Chapter numbers (`CHAPTER I`) |
| `oj-ti-section-2` | Chapter titles |
| `oj-ti-art` | Article numbers (`Article 1`) |
| `oj-sti-art` | Article titles |
| `oj-normal` | Paragraph text, recitals, definitions |
| `oj-doc-ti` | Document title, annex titles |

**Validation (Regulation 765/2008):**

| Metric | Expected | Actual |
|--------|----------|--------|
| Chapters | 6 | ✅ 6 |
| Articles | 44 | ✅ 44 |
| Annexes | 2 | ✅ 2 |
| Recitals | 48 | ✅ 48 |
| Words | ~11,500 | ✅ 11,674 |

**Benefits:**
1. **Deterministic and repeatable** — Same input always produces same output
2. **Receives all enrichments** — Paragraph IDs, citations, terminology extraction work automatically
3. **Scalable** — Adding more HTML-only regulations requires only YAML configuration
4. **Single processing pipeline** — Downstream scripts (terminology, search, TOC) unchanged

**Files Created/Modified:**

| File | Change |
|------|--------|
| `scripts/eurlex_html_to_md.py` | New: 760-line HTML→MD converter |
| `scripts/eurlex_formex.py` | Modified: HTML fallback routing |
| `scripts/documents.yaml` | Modified: `source: html` for 765/2008 |

**Future Work:**
- Add more HTML-only regulations (768/2008, GDPR 2016/679, Services Directive)
- Consider consolidated version detection for HTML documents
- Add unit tests for edge case HTML patterns

**Alternatives considered:**
1. **Manual extraction** — Rejected: non-reproducible, doesn't receive enrichments
2. **AI-assisted extraction** — Rejected: non-deterministic, harder to validate
3. **Request Formex from EU** — Rejected: no guarantee of availability for older regs

---

## DEC-043: Short Title Single Source of Truth

**Date:** 2026-01-16  
**Status:** Implemented  
**Category:** Architecture / Build Pipeline

**Context:**

When adding Regulation 765/2008, we discovered the `extractShortTitle()` function in `build-content.js` had hardcoded CELEX pattern matching for regulation titles. This violated the Single Source of Truth principle — titles were defined in two places (YAML config and JS code), making it easy to forget updating one when adding new regulations.

**Problem:**

```javascript
// Previous hardcoded approach (DRY violation)
if (celex.includes('2024') && celex.includes('1183')) return 'eIDAS 2.0 Amendment';
if (celex.includes('2014') || celex.includes('910')) return 'eIDAS 2.0 Regulation (Consolidated)';
if (celex.includes('2008') && celex.includes('765')) return 'Market Surveillance Regulation';
// Forgot to add new regulation? Silent truncation to "Regulation (EU) No..."
```

**Decision:**

Make `documents.yaml` the Single Source of Truth for regulation short titles with fail-fast build validation.

**Architecture:**

```
documents.yaml (authoritative)         build-content.js
┌─────────────────────────────────┐    ┌──────────────────────────────┐
│ - celex: 32008R0765             │    │ Priority chain:              │
│   shortTitle: "Market Surveil." │───▶│  1. Markdown Subject: field  │
│   title: "Regulation 765/2008"  │    │  2. YAML shortTitle (←NEW)   │
│   output_dir: 01_regulation/... │    │  3. Folder name pattern (IA) │
└─────────────────────────────────┘    │  4. CELEX pattern (IA)       │
                                       │  5. FAIL BUILD (regulations) │
                                       └──────────────────────────────┘
```

**Fail-Fast Validation:**

If a regulation has no `shortTitle` in documents.yaml, the build fails immediately with actionable instructions:

```
❌ BUILD FAILED: No shortTitle for regulation "new_regulation" (CELEX: 39999R9999)

   Regulations must have explicit shortTitle in documents.yaml.
   
   FIX: Add to scripts/documents.yaml:
   
   - celex: 39999R9999
     shortTitle: "Human Readable Name"  # ← Add this line
```

**Benefits:**

1. **Single Source of Truth** — All regulation metadata in one place
2. **Fail Fast** — Missing titles caught at build time, not in production
3. **Self-Documenting** — YAML config shows all regulation titles at a glance
4. **No Hardcoding** — No more CELEX pattern matching in JS code

**Files Changed:**

| File | Change |
|------|--------|
| `scripts/documents.yaml` | Added `shortTitle` field to all 3 regulations |
| `docs-portal/scripts/build-content.js` | Added YAML loader, refactored `extractShortTitle()` |

---

## DEC-044: Regulation Document Style Guide

**Date:** 2026-01-16  
**Status:** Accepted  
**Category:** Content Format / Document Structure

**Context:**

When importing Regulation 765/2008, visual inconsistencies emerged compared to the eIDAS regulation (which was converted from authoritative Formex XML). These inconsistencies affected:
1. Navigation (Preamble header placement)
2. Visual styling (italics for formal introduction)
3. Redundant elements (horizontal rules)

**Decision:**

Establish a **mandatory style guide** for all regulation Markdown files. The eIDAS Formex-converted output serves as the canonical reference.

**Required Document Structure:**

```markdown
> **CELEX:** [...]
> **Source:** [...]
> **Official Journal:** [...]
> **ELI:** [...]
> **Consolidated version:** [...] (if applicable)
> **Amended by:** [...] (if applicable)
> **EEA Relevance:** Yes (if applicable)

# [Full regulation title]

> **Note/Consolidation Note:** [...] (if applicable)

## Preamble

THE EUROPEAN PARLIAMENT AND THE COUNCIL OF THE EUROPEAN UNION,

*Having regard to the Treaty...,*

*Having regard to the proposal from the Commission,*

*Having regard to the opinion of...,*

*After consulting...,*

*Acting in accordance with...,*

Whereas:

## Recitals

- (1) [First recital]
- (2) [Second recital]
...

HAVE ADOPTED THIS REGULATION:

## Enacting Terms

### Article 1

**Subject matter and scope**

1. This Regulation...
```

**Style Rules:**

| Element | Correct Format | Incorrect Format |
|---------|----------------|------------------|
| Formal introduction | *Italicized* | Plain text |
| "Having regard to..." | *Having regard to...* | Having regard to... |
| Horizontal rule after notes | ❌ No `---` | ✅ Has `---` |
| Preamble header position | Before "THE EUROPEAN PARLIAMENT..." | After formal introduction |
| Recitals header | `## Recitals` after "Whereas:" | No header |
| Recitals format | Bullet list: `- (1) ...` | Plain paragraphs: `(1) ...` |
| Chapter headings | `## I. General Provisions` | `## CHAPTER I — GENERAL PROVISIONS` |
| Article headings | `### Article N` (number only) | `### Article N — Title` (combined) |
| Article titles | Bold subtitle: `**Title**` | In heading with em-dash |
| EEA relevance | In metadata header: `> **EEA Relevance:** Yes` | Inline: `*(Text with EEA relevance)*` |

**Why This Matters:**

1. **TOC Navigation** — `## Preamble` header enables direct navigation to preamble section
2. **Visual Distinction** — Italicized formal introduction matches official EU document styling
3. **Consistency** — All regulations look identical, reducing cognitive load
4. **Pipeline Compatibility** — Consistent structure enables reliable parsing by build scripts

**Checklist for New Regulations:**

When importing a new regulation, verify:

- [ ] Metadata blockquote at top (CELEX, Source, OJ, ELI)
- [ ] EEA relevance in metadata (not inline)
- [ ] `## Preamble` header before formal introduction
- [ ] "Having regard to..." lines are *italicized*
- [ ] "Whereas:" on its own line before recitals
- [ ] `## Recitals` header after "Whereas:"
- [ ] Recitals as bullet list: `- (1) ...`, `- (2) ...`
- [ ] `HAVE ADOPTED THIS REGULATION:` before enacting terms
- [ ] `## Enacting Terms` header before Article 1
- [ ] Chapter headings: `## I. Title` (Roman numeral, Title Case)
- [ ] Article headings: `### Article N` (number only, no title)
- [ ] Article titles: bold subtitle on separate line: `**Title**`
- [ ] No horizontal rules (`---`) in document body
- [ ] No "Source Reference" section (metadata is in header blockquote only)

**Implementation:**

Apply to existing regulations and all future imports. The Formex XML converter already follows this guide; HTML imports must be manually harmonized.

**Files affected by harmonization (2026-01-16):**

| File | Changes Applied |
|------|-----------------|
| `01_regulation/765_2008_Market_Surveillance/02008R0765.md` | Preamble, italics, recitals bullet list, chapter format, article headings |

---

## DEC-045: Consolidated Regulations Contain Only In-Force Content

**Date:** 2026-01-16  
**Status:** Accepted  
**Category:** Content Policy / Legal Accuracy

**Context:**

When importing the consolidated version of Regulation 765/2008, the initial approach was to mark repealed sections with strikethrough text and `[REPEALED]` tags:

```markdown
#### ~~Article 15 — Scope~~ [REPEALED]
#### ~~Article 16 — General requirements~~ [REPEALED]
...
```

This resulted in:
1. **Visual clutter** — 15+ lines of strikethrough text in TOC and content
2. **No legal value** — Repealed content has no legal effect
3. **User confusion** — Readers might not understand why obsolete content is shown

**Decision:**

**Consolidated regulations shall contain ONLY in-force content.** Repealed articles, chapters, and definitions are removed entirely, with **NO TRACE** in the document body.

**Implementation:**

| Element | Treatment |
|---------|-----------|
| Repealed chapters | Remove entirely |
| Repealed articles | Remove entirely |
| Repealed definitions | Remove entirely |
| Repealed paragraphs | Remove entirely |
| Repealed points (a), (b), etc. | Remove entirely |
| Reference to repealing act | Keep in consolidation note **at top ONLY** |

**🚫 Prohibited Patterns (NEVER include these inline):**

```markdown
# ❌ WRONG — strikethrough with tag
#### ~~Article 15 — Scope~~ [REPEALED]

# ❌ WRONG — deletion note inline
> **[As amended by Regulation (EU) 2019/1020]** — Point (d) deleted

# ❌ WRONG — placeholder for deleted content
(d) [deleted]

# ❌ WRONG — any reference to what was removed
<!-- Point (d) was here but repealed -->
```

**✅ Correct Pattern:**

Simply omit the deleted content. Points skip from (c) to (e) with no explanation inline:

```markdown
   (c) the drawing up and updating of guidelines...

   (e) the performance of preliminary work...
```

**Required Consolidation Note:**

When content has been removed, include a note at the document top:

```markdown
> **⚠️ Consolidation Note:** This is the consolidated version as of [DATE]. 
> [Chapter/Article X] was **repealed** by [Regulation (EU) XXXX/XXX](link) 
> and has been removed from this document.
```

**Rationale:**

1. **Legal accuracy** — Consolidated acts show current law, not historical artifacts
2. **EUR-Lex precedent** — EUR-Lex consolidated versions don't include repealed content
3. **User focus** — Readers want applicable law, not legislative history
4. **Cleaner TOC** — Navigation shows only relevant sections
5. **Reduced maintenance** — No need to format/style obsolete content

**Exception:**

If a regulation needs to show legislative evolution (e.g., for educational purposes), create a separate "Legislative History" document rather than cluttering the consolidated version.

**Applied to:**

| Regulation | Repealed Content Removed |
|------------|-------------------------|
| Regulation 765/2008 | Chapter III (Articles 15-29), Definitions 1-2, 5-7, 14-15, 17-18 |
| Regulation 910/2014 | N/A (EUR-Lex consolidated version already clean) |

---

## DEC-051: Human-Friendly Sidebar Navigation Names

**Date:** 2026-01-16  
**Status:** Accepted  
**Category:** UX / Navigation

**Context:**

The sidebar navigation showed "Regulation 765/2008" for the Referenced Regulations section. This technical CELEX-style identifier:
1. Requires users to memorize regulation numbers
2. Provides no context about regulation subject matter
3. Violates UX best practices for navigation labels

**Decision:**

**Sidebar navigation items MUST use human-friendly names, never technical identifiers.**

Examples:

| ❌ Technical (Prohibited) | ✅ Human-Friendly (Required) |
|--------------------------|------------------------------|
| Regulation 765/2008 | Accreditation Regulation |
| Regulation 910/2014 | eIDAS 2.0 Regulation |
| Regulation 2024/1183 | Amending Regulation |
| 32024R2977 | PID & EAA |

**Implementation:**

- Sidebar.jsx: All `name` properties must be human-readable labels
- Comment format: Include technical reference as JSDoc comment if needed
  ```javascript
  // Human-friendly name per DEC-051; technical ref: Regulation (EC) No 765/2008
  { name: 'Accreditation Regulation', path: '/regulation/765-2008', icon: 'external-link' },
  ```

**Naming Guidelines:**

1. **Subject over number** — Describe what the regulation regulates, not its publication ID
2. **Short and scannable** — Target 2-4 words maximum
3. **Commonly used names** — Use industry-standard short names when available
4. **Consistency** — Similar documents should have similar naming patterns

**Rationale:**

1. **Cognitive load** — Users shouldn't need to memorize regulation numbers
2. **Discoverability** — Subject-based names help users find relevant content
3. **Professional UX** — Matches patterns from legal databases (Westlaw, LexisNexis)
4. **Accessibility** — Screen readers benefit from descriptive names

**Files affected:**

| File | Change |
|------|--------|
| `Sidebar.jsx` | "Regulation 765/2008" → "Accreditation Regulation" |

---

*Add new decisions at the bottom with incrementing DEC-XXX numbers.*


## DEC-055: Definition Extraction Termination Rules

**Date:** 2026-01-17

**Context:**

The terminology extraction in `build-terminology.js` uses regex patterns to extract legal definitions from regulation markdown files. Two patterns exist:

1. **Pattern 1 (parenthesized):** `(N) 'term' means definition;`
2. **Pattern 2 (numbered list):** `N. 'term' means definition;`

**Problem:**

Regulation 765/2008 Article 2 uses the numbered list format. Definition 21 ("Community harmonisation legislation") ends with a **period**, not a semicolon:

```markdown
21. 'Community harmonisation legislation' means any Community legislation harmonising the conditions for the marketing of products.
```

The original Pattern 2 regex only terminated at semicolons:
```javascript
const defPatternNumbered = /^(\d+)\.\s+'([^']+)'\s*means\s+([^;]+);/gm;
```

This caused greedy capture: `[^;]+` matched everything until the next semicolon, which was pages later in the document, resulting in a definition containing the entire rest of the regulation.

**Decision:**

**Both definition extraction patterns MUST terminate at semicolon (;), period (.), OR newline (\\n).**

```javascript
// Correct termination pattern
const defPatternNumbered = /^(\d+)\.\s+'([^']+)'\s*means\s+([^;.\n]+)(?:[;.]|\n|$)/gm;
```

**Implementation:**

| Component | Change |
|-----------|--------|
| Pattern 1 | Already correct (stops at `;.\\n`) |
| Pattern 2 | Fixed: `[^;]+;` → `[^;.\\n]+(?:[;.]\|\\n\|$)` |

**Validation:**

Added Invariant 4 to build-time validation:
- Required 765/2008 terms: `accreditation`, `manufacturer`, `CE marking`
- Build fails if these terms are missing (indicates pattern regression)

**Rationale:**

1. **EU legal drafting convention:** Some regulations end definitions with periods, others with semicolons
2. **Defense in depth:** Terminate at multiple characters to prevent greedy capture
3. **Build-time validation:** Add invariants to catch extraction regressions

**Files affected:**

| File | Change |
|------|--------|
| `build-terminology.js` | Fix Pattern 2 regex termination |
| `build-terminology.js` | Add Invariant 4 (765/2008 terms) |

---

## DEC-056: Multi-Source Terminology Visual Separation

**Date:** 2026-01-17  
**Status:** Accepted  
**Category:** UI/UX / Visual Design

**Context:**

Multi-source terminology (terms defined in multiple documents, e.g., "accreditation" defined in both Regulation 2025/2162 and Regulation 765/2008) was visually confusing on the Terminology page:

1. **No visual boundary** between definitions from different sources
2. **Redundant information** — Source name appeared twice:
   - Header: "Regulation 765/2008, Article 2(10):"
   - Link: "View in Regulation 765/2008 →"
3. **No category distinction** — Primary and referenced documents looked identical

**User Feedback:**  
> "Is there a way to visually separate them? Make some suggestions."

**Options Considered:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A: Divider Line | Thin horizontal line between definitions | Minimal, easy | Subtle, may not be distinct |
| B: Cards | Each definition in bordered card | Clear separation | Heavy, "boxy" feel |
| **C: Colored Left Border** | Vertical accent bar per source | Leverages color system, category-aware | Requires color legend |
| D: Numbered Badges | Circle badges (1, 2) | Shows count | Conflicts with "N sources" badge |

**Decision:**

Implement **Option C (Colored Left Border)** combined with **Merged Source Headers**:

1. **Colored Left Borders:**
   - Primary documents (eIDAS, etc.): `--accent-primary` (cyan)
   - Referenced documents (765/2008): `--purple-accent` (#a855f7)

2. **Merged Clickable Headers:**
   - Combine source name + link into single clickable header
   - Arrow (→) indicates clickability
   - Removes redundant "View in Regulation" link

**Before:**
```
┌─────────────────────────────────────────────────────┐
│ Regulation 765/2008, Article 2(10):                 │  ← Plain text header
│ an attestation by a national accreditation body... │
│ View in Regulation 765/2008 →                       │  ← Redundant link
└─────────────────────────────────────────────────────┘
```

**After (final):**
```
┌┃────────────────────────────────────────────────────┐
│┃ Regulation 765/2008, Article 2(10) →               │  ← Clickable cyan header
│┃ an attestation by a national accreditation body... │
└┃────────────────────────────────────────────────────┘
 ↑ Cyan left border (same color for all sources)
```

**Design Evolution:**

Initially implemented with multi-color scheme (cyan for primary, purple for referenced documents). User feedback:
> "Multiple colors make it too cluttered. Use a single color everywhere."

**Final Design:**
- **Single color:** All left borders and header links use `--accent-primary` (cyan)
- **No badges:** Removed "REFERENCED" badge to reduce visual noise
- **Gap separation:** Visual gap between definitions indicates separate sources
- **Consistency:** Matches term title color for cohesive appearance

**Implementation:**

| Component | Change |
|-----------|--------|
| `Terminology.jsx` | Merged `<Link>` as header, removed separate link |
| `Terminology.jsx` | Single cyan color for all borders and links |
| `index.css` | Added hover styles for `.source-header-link` |

**Benefits:**

1. **Clean, uncluttered** — Single color reduces visual noise
2. **Less redundancy** — Source name appears once, not twice
3. **Consistent design** — Cyan matches term title color
4. **Gap separation** — Vertical gap between definitions provides structure

---

## DEC-057: HTML-based definitions for legal notation fidelity

**Date:** 2026-01-17  
**Status:** Accepted  

**Context:**  
Regulation 765/2008 uses `N. 'term' means...` format (e.g., `3. 'manufacturer'`), while eIDAS uses `(N) 'term' means...` format. Both formats must be preserved exactly.

**Problem:**  
Standard markdown interpretation caused issues:
1. Lines like `3. 'manufacturer'` were parsed as ordered list items
2. Non-consecutive numbering (3, 4, 8, 9...) was renumbered (3, 4, 5, 6...)
3. This broke deep linking: terminology page referenced `article-2-para-10` but rendered HTML had different IDs

**Decision:** Use raw HTML for 765/2008 Article 2 definitions with explicit IDs.

**Implementation:**

```html
<ul class="legal-definitions">
<li id="article-2-para-3" class="linkable-paragraph" data-para="3" data-article="article-2">
  3. 'manufacturer' means any natural or legal person...
</li>
<li id="article-2-para-10" class="linkable-paragraph" data-para="10" data-article="article-2">
  10. 'accreditation' means an attestation by a national...
</li>
</ul>
```

**Benefits:**

1. **Legal fidelity** — Displays exact `N. 'term'` notation from EUR-Lex
2. **Deep linking** — Explicit IDs enable accurate scroll-to behavior
3. **No markdown interference** — HTML bypasses all list parsing
4. **Terminology extraction** — Updated regex matches content inside `<li>` tags

**Files modified:**

| File | Change |
|------|--------|
| `02008R0765.md` | Article 2 uses raw HTML `<ul><li id="...">` |
| `build-terminology.js` | Regex pattern `(?:^|>)(\d+)\.` handles HTML |
| `AGENTS.md` | Rule 19 prevents future notation changes |

**Related:** Rule 19 in AGENTS.md (Legal Document Visual Fidelity - ABSOLUTE)

## DEC-058: Terminology Accordion Collapse UI (2026-01-17)

**Problem:** Terms with identical definitions across multiple regulations (e.g., "wallet provider" in 9 implementing acts) created visual noise by repeating the same definition 9 times.

**Solution:** Accordion Collapse UI - Option B (Definition First)
- Single source: Definition + source link displayed inline
- Multiple identical: Definition displayed once, "▶ View N sources" accordion below
- Variant definitions: Separate block with purple border + "Variant definition" label

**Implementation:**
- Build script (`build-terminology.js`):
  - Added `normalizeDefinition()` to normalize text for comparison
  - Added `groupByDefinition()` to group sources with identical text
  - Each term now has `definitionGroups[]` array
- Frontend (`Terminology.jsx`):
  - Added `DefinitionGroup` component with accordion state
  - Handles three scenarios: single source, multiple identical, mixed definitions
  - Purple border (#a855f7) distinguishes variant definitions from primary

**Files Modified:**
- `scripts/build-terminology.js` — Added grouping logic
- `src/pages/Terminology.jsx` — Added DefinitionGroup component with accordion UI

---

## DEC-059: Citation Popover Enhancement (2026-01-17)

**Status:** Accepted

**Context:**
The existing citation popovers displayed minimal information—just the formal citation text and a link. Users needed more context to understand what legislation they were hovering over.

**Decision:**
Implement **Hybrid B+C design** that combines rich metadata with clear action buttons.

**Popover Content:**
- **Header:** Abbreviation badge (e.g., "GDPR", "eIDAS") + Status indicator (In Force/Repealed)
- **Title:** Human-friendly name (e.g., "General Data Protection Regulation")
- **Subtitle:** Formal citation (e.g., "Regulation (EU) 2016/679")
- **Date:** Entry into force date
- **Category:** "Available in Portal" badge for internal documents
- **Actions:** 
  - Internal: "View in Portal →" + "EUR-Lex ↗"
  - External: "View on EUR-Lex ↗"

**Implementation:**
- `scripts/legislation-metadata.js` — Registry of legislation metadata (humanName, abbreviation, entryIntoForce, status)
- `scripts/build-citations.js` — `enrichCitation()` function adds metadata during build
- `src/pages/RegulationViewer.jsx` — Popover template updated with rich content
- `src/components/CitationPopover/CitationPopover.css` — Styling for badges, status indicators

**Files Modified:**
| File | Change |
|------|--------|
| `scripts/legislation-metadata.js` | New: 220+ line metadata registry |
| `scripts/build-citations.js` | Added enrichCitation() with metadata lookup |
| `src/pages/RegulationViewer.jsx` | Updated popover HTML template |
| `src/components/CitationPopover/CitationPopover.css` | Added badge/status styles |

---

## DEC-060: Smart Consolidation Self-Reference Detection (2026-01-17)

**Status:** ✅ Complete

**Context:**
When reading the consolidated eIDAS Regulation (910-2014), a citation to "Regulation (EU) No 910/2014" triggered a popover suggesting users view the document on EUR-Lex—despite already reading the consolidated version of that exact regulation. This was semantically misleading.

**Problem:**
1. User is reading `02014R0910-20241018` (consolidated eIDAS)
2. Citation references `32014R0910` (original eIDAS)
3. Popover treats it as external document
4. User is confused: "Shouldn't I already be reading this?"

**Decision:**
Implement **Smart Consolidation** pattern that detects self-referential citations and renders a special popover variant.

**Self-Reference Detection (Build-Time):**
```
document-config.json                   build-citations.js
┌─────────────────────────────┐       ┌───────────────────────────────────┐
│ "910-2014": {               │       │ checkSelfReference(citationCelex, │
│   "consolidation": {        │───▶   │   currentSlug, documentConfig)    │
│     "baseCelex": "32014R0910"       │                                   │
│     "amendments": [...]     │       │ Returns: {                        │
│   }                         │       │   isSelfReference: true,          │
│ }                           │       │   consolidationInfo: {...}        │
└─────────────────────────────┘       │ }                                 │
                                      └───────────────────────────────────┘
```

**Consolidated Popover UI:**
```
┌───────────────────────────────────────────────┐
│  📍 CURRENT DOCUMENT                          │
├───────────────────────────────────────────────┤
│  Electronic Identification and Trust Services │
│  Regulation                                    │
│                                               │
│  Regulation (EU) No 910/2014                  │
│                                               │
│  As amended by: eIDAS 2.0 Amendment           │
│                                               │
│  ┌───────────────────────────────────────────┐│
│  │ View on EUR-Lex:                          ││
│  │  📄 Original (2014) ↗   📝 Amendment ↗   ││
│  └───────────────────────────────────────────┘│
│                                               │
│  ✓ You're reading the merged version          │
└───────────────────────────────────────────────┘
```

**Key Features:**
1. **Cyan "CURRENT DOCUMENT" badge** — Immediately signals self-reference
2. **"As amended by" list** — Shows which amendments are folded in
3. **Dual EUR-Lex links** — Separate buttons for Original and Amendment documents
4. **"Merged version" notice** — Confirms user is reading the consolidated text

**Implementation (Files Modified):**

| File | Change |
|------|--------|
| `scripts/document-config.json` | Added `consolidation` block with baseCelex/amendments |
| `scripts/build-citations.js` | Added `checkSelfReference()`, `extractBaseCelex()` |
| `src/hooks/useCitations.js` | Added `data-citation-self-reference` and `data-citation-consolidation` attributes |
| `src/pages/RegulationViewer.jsx` | Conditional rendering for consolidated variant popover |
| `src/components/CitationPopover/CitationPopover.css` | `.citation-popover--consolidated` and related styles |

**Benefits:**
1. **Legal accuracy** — Acknowledges consolidation relationship
2. **Transparency** — Clearly shows amendment provenance
3. **Educational** — Teaches users about EU law consolidation
4. **Traceability** — Provides links to both original and amending acts

**Future Work:**
- Extend pattern to other consolidated documents as they're added
- Consider same treatment for citations to 2024/1183 (the amendment itself)

---

## DEC-061: Pipeline Annex Extraction with Validation (2026-01-17)

**Status:** ✅ Complete

**Context:**
Investigation revealed that 27 implementing acts were missing their annexes. The annexes were present in the Formex ZIP archives (as separate `.000XYZ.fmx.xml` files) but the pipeline only extracted the main document (`.000101.fmx.xml`).

A previous one-time fix script (`batch_fix_annexes.py`) had been run and deleted, but it only fixed the symptoms—not the root cause in the pipeline. This led to:
1. Stale TRACKER.md entry saying "run batch_fix_annexes.py"
2. 27 documents missing annexes after any pipeline re-run
3. ~30,820 words of legal content missing from the portal

**Problem:**
```python
# OLD: extract_formex() only returned main XML
def extract_formex(zip_path, output_dir) -> Path:
    # ... find .000101. file only
    return main_xml  # Annexes ignored!
```

**Solution:**
```python
# NEW: extract_formex() returns main + all annex XMLs
def extract_formex(zip_path, output_dir) -> tuple:
    # ... find .000101. AND all .000XYZ. files
    return (main_xml, annex_xmls)  # List of annex paths

# process_document() now:
# 1. Converts main XML
# 2. Appends each annex XML content
# 3. Validates annex extraction (fail-fast)
```

**Validation (Regression Prevention):**
```python
def validate_annex_extraction(md_path, annex_xmls) -> tuple:
    """
    If annex XML files were found in archive,
    output markdown MUST contain '## Annex' headings.
    """
    if not annex_xmls:
        return (True, None)
    
    content = md_path.read_text()
    annex_headings = re.findall(r'^## (?:Annex|ANNEX)', content, re.MULTILINE)
    
    if len(annex_headings) == 0:
        return (False, f"Found {len(annex_xmls)} annex XMLs but 0 headings")
    
    return (True, None)
```

**Results:**
| Metric | Before | After |
|--------|--------|-------|
| Implementing acts with annexes | 0 | 27 |
| Total word count | 138,136 | 168,956 |
| New content | — | +30,820 words |

**Documentation Added:**
- AGENTS.md Rule 26: Formex archive structure
- AGENTS.md Rule 27: Fix cause, not symptom
- AGENTS.md Rule 28: Script deletion checklist

**Why This Matters:**
One-time fix scripts that address symptoms—not causes—create recurring issues and stale documentation. This decision codifies the principle: always fix the pipeline, not just the data.

---

## DEC-062: Amendment-Aware Citation Popovers

**Date:** 2026-01-17  
**Status:** ✅ Implemented  
**Category:** UX / Citation Enrichment

**Context:**

When hovering over a citation to eIDAS 1.0 (Regulation 910/2014), the popover showed:
- Green **IN FORCE** badge
- Human-readable name and entry into force date
- Links to EUR-Lex

However, this was misleading because 910/2014 has been **substantially amended** by Regulation 2024/1183 (eIDAS 2.0). The current applicable law is the consolidated version, not the original 2014 text. Showing only "IN FORCE" implies the original is still the authoritative source.

**User Impact:**

A legal professional clicking "View on EUR-Lex" for 910/2014 would see the **original 2014 text**, not the current consolidated version. They might miss critical amendments from 2024.

**Decision:**

Implement **Amendment-Aware Citation Popovers** that detect amended regulations and provide enhanced context:

1. **Dual status badges:** `IN FORCE` + `AMENDED` (amber)
2. **Amendment notice:** "⚠️ Amended on [date] by Regulation [CELEX]"
3. **Consolidated link:** "View Consolidated →" (points to portal document)
4. **EUR-Lex link:** Preserved for reference to original

**Data Model Extension (`legislation-metadata.js`):**

```javascript
'32014R0910': {
    humanName: 'Electronic Identification and Trust Services Regulation',
    abbreviation: 'eIDAS 1.0',
    entryIntoForce: '2014-09-17',
    status: 'in-force',
    category: 'regulation',
    // NEW: Amendment-aware fields
    amendedBy: ['32024R1183'],           // CELEX of amending regulation(s)
    amendmentDate: '2024-05-20',          // When amendment entered into force
    consolidatedSlug: '910-2014',         // Portal slug for consolidated version
},
```

**Build-Time Enrichment (`build-citations.js`):**

The `enrichCitation()` function now adds:
```javascript
citation.amendedBy = metadata.amendedBy || null;
citation.amendmentDate = metadata.amendmentDate || null;
citation.consolidatedSlug = metadata.consolidatedSlug || null;
citation.isAmended = !!(metadata.amendedBy?.length);
```

**Popover Template (`citationPopoverTemplate.js`):**

Updated `generateStandardPopoverHtml()` to:
1. Add AMENDED badge if `citation.isAmended`
2. Render amendment notice with formatted date and **linked regulation reference**
3. Change primary button from "View in Portal" to "View Consolidated" when `consolidatedSlug` exists

**Visual Design:**

| Element | Style |
|---------|-------|
| AMENDED badge | Amber background (`rgba(245, 158, 11, 0.15)`), gold text (`#fbbf24`) |
| Amendment notice | ⚠️ prefix, normal text, secondary color, linked regulation reference |
| View Consolidated button | Primary blue button (same as existing) |

**Relationship to DEC-060 (Smart Consolidation):**

- DEC-060 handles **self-references** within consolidated documents (showing "CURRENT DOCUMENT" badge)
- DEC-062 handles **external references** to amended regulations from other documents
- Both share the goal of preventing users from accidentally reading outdated legal text

**Files Changed:**

| File | Change |
|------|--------|
| `scripts/legislation-metadata.js` | Added `amendedBy`, `amendmentDate`, `consolidatedSlug` fields |
| `scripts/build-citations.js` | Extended `enrichCitation()` with amendment fields |
| `src/utils/citationPopoverTemplate.js` | Added dual badges, amendment notice with linked regulation, consolidated link |
| `src/components/CitationPopover/CitationPopover.css` | Added `.citation-popover-status--amended` and `.citation-popover-amendment-link` styles |

**Implementation Notes (Retro):**

1. **Route naming**: Use `#/regulation/` (singular), not `#/regulations/` (plural). The app's router uses singular form.
2. **CSS class naming**: The template class must exactly match the CSS selector. A mismatch (`-info` vs `-notice`) caused silent styling failure. Added `npm run validate:css` to catch this at build time.
3. **Linked regulation**: The amending regulation reference is now clickable, linking to the portal document.

**Benefits:**

1. **Legal accuracy** — Users know the regulation has been amended before clicking
2. **Correct navigation** — "View Consolidated" leads to applicable law
3. **Context preservation** — EUR-Lex link to original still available for historical reference
4. **Visual hierarchy** — Amber "AMENDED" badge draws attention to important context

**Future Enhancements:**

- Extend to other amended regulations (GDPR is not amended, but older directives might be)
- Show human-readable name of amending regulation in notice
- Support multiple amendments in sequence (show most recent with "…and N others")



---

## DEC-065: Terminology Distinction for Implementing Regulations

**Date:** 2025-01-17
**Status:** Implemented
**Context:** Citation popovers displayed "Regulation 2024/2980" for implementing acts, which is technically imprecise. These are Commission Implementing Regulations, not base regulations like GDPR or eIDAS.

**Decision:**

1. **Popovers use precise terminology**: Display "Implementing Regulation YYYY/NNNN" for implementing regulations, distinguishing them from base regulations.

2. **Sidebar uses shorter term for UX**: Keep "Implementing Acts" in the navigation sidebar because "Implementing Regulations" wraps to two lines due to sidebar width constraints.

**Rationale:**

| Location | Term | Reasoning |
|----------|------|-----------|
| **Sidebar navigation** | "Implementing Acts" | Fits on one line; acceptable as the broader category name |
| **Citation popovers** | "Implementing Regulation X/Y" | Precise legal terminology where users are examining specific documents |

Both terms are technically correct:
- "Implementing Acts" = umbrella category (includes regulations, decisions, etc.)
- "Implementing Regulation" = specific legal form (all eIDAS implementing acts happen to be regulations)

**Implementation:**

1. Added `subcategory: 'implementing'` to all 9 implementing regulations in `legislation-metadata.js`
2. Added `formatFormalName()` helper in `citationPopoverTemplate.js` that prepends "Implementing" when `subcategory === 'implementing'`
3. Updated `build-citations.js` to pass `subcategory` through to citation objects

**Files Changed:**

| File | Change |
|------|--------|
| `scripts/legislation-metadata.js` | Added `subcategory: 'implementing'` to 9 implementing regulations |
| `scripts/build-citations.js` | Extended `enrichCitation()` with `subcategory` field |
| `src/utils/citationPopoverTemplate.js` | Added `formatFormalName()` helper to transform "Regulation X/Y" → "Implementing Regulation X/Y" |

---

## DEC-083: Slug Format Standardization (2026-01-18)

**Date:** 2026-01-18  
**Status:** Implemented  
**Context:** An internal inconsistency was discovered in document slug formats:

| Document | Old Slug | Issue |
|----------|----------|-------|
| eIDAS Regulation 910/2014 | `910-2014` | Year-last format |
| Accreditation Regulation 765/2008 | `765-2008` | Year-last format |
| All other documents | `2024-1183`, `2025-0847`, etc. | Year-first format |

This caused problems when:
1. Quick Jump feature parsed ELI URIs like `eli/reg/2014/910` which use `year/number` order
2. The matching logic needed special-case handling to check both `2014-910` and `910-2014`

**Decision:**

Standardize ALL slugs to `{year}-{number}` format, matching ELI URI structure.

**Implementation:**

1. **Renamed source directories:**
   - `765_2008_Market_Surveillance` → `2008_765_Market_Surveillance`
   - `910_2014_eIDAS_Consolidated` → `2014_910_eIDAS_Consolidated`

2. **Updated configuration files:**
   - `documents.yaml` — Output directory paths
   - `document-config.json` — Slug keys
   - `legislation-metadata.js` — `consolidatedSlug` field

3. **Simplified code:**
   - Removed special-case regex in `build-content.js generateSlug()`
   - Quick Jump now matches ELI directly without reversal logic

**Breaking Change:**

| Old URL | New URL |
|---------|---------|
| `/regulation/910-2014` | `/regulation/2014-910` |
| `/regulation/765-2008` | `/regulation/2008-765` |

**Rationale:**

1. **Consistency** — All documents now use identical format
2. **ELI compatibility** — Slugs match European Legislation Identifier structure
3. **Simpler code** — No special cases needed in slug generation or matching
4. **Future-proof** — Any new regulations automatically get correct format

**Files Changed:**

| File | Change |
|------|--------|
| `01_regulation/` | Renamed 2 directories |
| `scripts/documents.yaml` | Updated output_dir paths |
| `docs-portal/scripts/document-config.json` | Updated slug keys |
| `docs-portal/scripts/legislation-metadata.js` | Updated consolidatedSlug |
| `docs-portal/scripts/build-content.js` | Simplified generateSlug() |
| `docs-portal/src/components/Layout/Sidebar.jsx` | Updated nav link |
| `docs-portal/src/pages/Home.jsx` | Updated quick links |



---

## DEC-087: Exclude Original 2014 eIDAS Recitals from RCA Audits

**Date:** 2026-01-19  
**Status:** Accepted  

**Context:**  
The consolidated eIDAS Regulation (910/2014 as amended by 2024/1183) contains two sets of recitals:
1. **Original 2014 recitals (1-76)** — From the initial eIDAS Regulation
2. **2024/1183 amendment recitals (1-75)** — From the amending regulation introducing EUDI Wallets

The 2014 recitals predate the EUDI Wallet framework entirely. They provide context for the original eID schemes and trust services framework but contain no content relevant to wallet providers, relying parties, or other wallet-related roles.

**Decision:** Exclude original 2014 recitals from RCA audit trackers.

**Rationale:**

1. **Pre-wallet framework** — The 2014 recitals were written before EUDI Wallets were conceived
2. **Not imported** — These recitals are not imported into the documentation portal
3. **Non-binding** — Recitals are interpretive guidance, not binding obligations
4. **Amendment recitals suffice** — The 2024/1183 recitals provide all necessary context for wallet provisions

**Affected Files:**

| File | Change |
|------|--------|
| `AUDIT_TRACKER_WP.md` | 2014 recitals section removed |
| `AUDIT_TRACKER_RP.md` | 2014 recitals section removed |

**Note:** Both trackers now include an explicit note explaining this exclusion.

---

## DEC-088: Use Case Semantic Mapping Methodology

**Date:** 2026-01-20  
**Status:** Accepted  
**Category:** RCA / Methodology

**Context:**

During RCA audits, requirements were assigned `useCases: all` by default without analyzing whether they truly apply to all use cases or only to specific ones. The 19 use cases in `use-cases.yaml` (e.g., `esignature`, `pseudonym`, `mdl`, `payment-auth`) exist specifically for filtering, but ~95% of requirements are currently marked universal.

**Problem:**

| Current State | Issue |
|---------------|-------|
| `useCases: all` everywhere | Use case filtering provides no value |
| No semantic analysis performed | We don't know if requirements are truly universal |
| Keyword-based assignment considered | Would be inaccurate and superficial |

**Decision:**

Implement a **requirement-by-requirement semantic analysis** for use case mapping with the following rules:

### Mapping Rules

1. **NO keyword/grep-based assignment** — Each requirement must be analyzed in the context of its legal provision (article, paragraph, point).

2. **Semantic question for each requirement:**
   > "Does this requirement ONLY make sense when implementing a specific use case, or is it a universal obligation regardless of what the wallet/RP/TSP is used for?"

3. **Decision categories:**

| Decision | Meaning | Action |
|----------|---------|--------|
| `all` | Truly universal | Keep `useCases: all` |
| `[specific-list]` | Use-case-specific | Update to `useCases: [id1, id2, ...]` |
| `escalate` | Ambiguous — agent unsure | Present to user for decision |

4. **Escalation is mandatory for ambiguity** — Never guess. If the mapping is not clear, escalate to the user.

5. **Each mapping decision is recorded** — In the Use Case Mapping Tracker with requirement ID, decision, and rationale.

### Use Case Reference (19 use cases, final)

| ID | Name | Category |
|----|------|----------|
| `pid-online` | PID-based identification in online services | core |
| `pseudonym` | Use of a pseudonym in online services | core |
| `esignature` | eSignature | core |
| `payment-auth` | Online payment authorisation | banking |
| `open-bank-account` | Open bank account | banking |
| `mdl` | Mobile Driving Licence (mDL) | travel |
| `dtc` | Digital Travel Credential (DTC) | travel |
| `epc` | European Parking Card (EPC) | travel |
| `vrc` | Vehicle Registration Certificate (VRC) | travel |
| `disability-card` | European Disability Card | health |
| `eprescription` | e-Prescription | health |
| `ehic` | European Health Insurance Card (EHIC) | health |
| `public-warnings` | Public warnings | health |
| `age-verification` | Age verification | consumer |
| `ticket-pass` | Ticket or pass | consumer |
| `edu-credentials` | Educational credentials | education |
| `student-card` | European student card | education |
| `proximity-id` | Identification in proximity scenarios | identification |
| `representation` | Natural or legal person representation | legal |

### Examples of Semantic Analysis

**Example 1: Universal requirement**
```yaml
- id: WP-SEC-002  # Stayed the same after DEC-090 ID alignment
  requirement: "Ensure security-by-design"
```
- **Analysis:** Security-by-design applies regardless of whether the user is signing documents, opening a bank account, or proving age. It's a fundamental architectural principle.
- **Decision:** `useCases: all` ✓

**Example 2: Use-case-specific requirement**
```yaml
- id: WP-TEC-008  # Was WP-FUNC-008 before DEC-090 ID alignment
  requirement: "Support qualified electronic signatures and seals"
```
- **Analysis:** QES/QESeal creation is ONLY needed when the user performs a signing operation. A wallet used purely for age verification would not need QES support.
- **Decision:** `useCases: [esignature]` ✓

**Example 3: Escalation required**
```yaml
- id: WP-TEC-003  # Was WP-FUNC-003 before DEC-090 ID alignment
  requirement: "Support pseudonym generation and encrypted local storage"
```
- **Analysis:** Pseudonyms are clearly relevant to the `pseudonym` use case. But are they also relevant to `age-verification` (proving you're over 18 without revealing identity)? Unclear.
- **Decision:** `escalate` — Ask user if `age-verification` should be included.

### Phased Execution

The audit can be performed in phases:
- Phase 1: Role X (e.g., Wallet Provider — 132 requirements)
- Phase 2: Role Y (e.g., Relying Party — 91 requirements)
- ...etc.

Each phase produces:
1. Updated YAML with refined `useCases` fields
2. Escalation list for ambiguous cases
3. Mapping Tracker with decisions and rationale

**Why This Matters:**

1. **Use case filtering becomes useful** — Users selecting "eSignature" see relevant requirements, not everything
2. **Audit trail** — Each mapping has documented rationale
3. **No guessing** — Ambiguity escalated to human judgment
4. **Legal precision** — Mapping based on legal text context, not keywords

**Implementation:**

See `/use-case-audit` workflow in `.agent/workflows/use-case-audit.md`.

---

### DEC-088 Addendum: Infrastructure Universalism Pattern

**Date:** 2026-01-20  
**Status:** Accepted  
**Context:** Discovery from complete 7-phase use case mapping audit

**Key Finding:**

During the comprehensive audit of all 458 requirements across 7 roles, a fundamental pattern emerged:

| Role Type | Roles | Use Case Specificity |
|-----------|-------|----------------------|
| **Service-Facing** | Wallet Provider, Relying Party | ~15% requirements are use-case-specific |
| **Infrastructure** | TSP, Issuer, PID, CAB, SB | 100% universal — obligations don't depend on services |

**Why Infrastructure Roles Are Always Universal:**

1. **Trust Service Providers (TSP):** Obligations govern HOW to operate (certification, security, governance), not WHAT services are provided. A TSP's requirement to maintain qualified staff applies whether they issue e-signatures, timestamps, or seals.

2. **EAA Issuers:** Obligations cover credential issuance mechanics (format, revocation, privacy). Whether the attestation is for age, education, or driving license doesn't change the issuance requirements.

3. **PID Providers:** PID is the foundational identity layer. It's a PREREQUISITE for virtually all use cases, not specific to any single one.

4. **Conformity Assessment Bodies (CAB):** CABs audit service providers, not end-user services. Their requirements define HOW to conduct audits, which is service-agnostic.

5. **Supervisory Bodies (SB):** Regulatory oversight requirements define HOW to supervise, not WHAT is being supervised.

**Practical Implication:**

Future audits only need deep semantic analysis for **Wallet Provider** and **Relying Party** roles. For infrastructure roles, requirements can be assumed universal unless the legal text explicitly mentions specific use cases.

**Audit Results Summary (458 total requirements):**

| Phase | Role | Requirements | Use-Case-Specific | Changes Made |
|-------|------|--------------|-------------------|--------------|
| 1 | Wallet Provider | 132 | 14 (10.6%) | 14 → specific |
| 2 | Relying Party | 91 | 1 (1.1%) | 1 → `pseudonym` |
| 3 | Trust Service Provider | 85 | 0 | ✅ All correct |
| 4 | EAA Issuer | 42 | 0 | ✅ All correct |
| 5 | PID Provider | 30 | 0 | ✅ All correct |
| 6 | CAB | 36 | 0 | ✅ All correct |
| 7 | Supervisory Body | 42 | 0 | ✅ All correct |
| **Total** | | **458** | **15 (3.3%)** | |

**Tracker Documents:** See `USE_CASE_MAPPING_*.md` files in `docs-portal/config/rca/`.

---

## DEC-089: Atomic Category Taxonomy

**Date:** 2026-01-20  
**Status:** Accepted  
**Category:** RCA / Data Model

**Context:**

The original RCA category system had problems:
1. **Combined concerns** — Categories like "eSignature & Trust Services" mixed service types with obligation types
2. **Scattered definitions** — Each requirements file defined its own categories
3. **No validation** — Invalid categories could be committed without error
4. **Role-specific** — Some categories only applied to 1-2 roles

**Problem:**

```yaml
# OLD: Combined concerns
categories:
  esignature:
    label: "eSignature & Trust Services"  # ← Service type + trust + legal effect

  operational:
    label: "Operational & Business"  # ← Operations + business + insurance + liability
```

**Decision:**

Implement **12 atomic categories**, where each represents exactly ONE type of legal obligation:

| # | ID | Icon | Label | Single Concern |
|---|-----|------|-------|----------------|
| 1 | `registration` | 📋 | Registration | Notification, authorization to operate |
| 2 | `certification` | ✅ | Certification | Conformity assessment, audits |
| 3 | `issuance` | 📤 | Issuance | Creating and provisioning credentials |
| 4 | `revocation` | 🚫 | Revocation | Suspension and invalidation |
| 5 | `verification` | 🔍 | Verification | Identity proofing, authentication |
| 6 | `technical` | ⚙️ | Technical | Formats, protocols, APIs |
| 7 | `interoperability` | 🌐 | Interoperability | Cross-border, standards |
| 8 | `security` | 🔒 | Security | Cybersecurity, cryptography |
| 9 | `privacy` | 🛡️ | Privacy | Data protection, GDPR |
| 10 | `transparency` | 👁️ | Transparency | Public disclosure, policies |
| 11 | `governance` | 🏛️ | Governance | Staffing, procedures |
| 12 | `liability` | ⚖️ | Liability | Insurance, legal effects |

**Architecture:**

```
config/rca/categories.yaml     ← SINGLE SOURCE OF TRUTH
        │
        ├── validate-rca.js    (loads global categories)
        └── build-rca.js       (loads global categories)
        
requirements/*.yaml            ← NO per-file categories
```

**Key Design Principle:**

Categories represent **OBLIGATION TYPE** (what kind of requirement), not **SERVICE CONTEXT** (what service it relates to). Service context is handled by the `useCases` field:

| Field | Question It Answers | Examples |
|-------|---------------------|----------|
| `category` | What TYPE of obligation? | technical, privacy, security |
| `useCases` | In what SERVICE CONTEXT? | esignature, pseudonym, mdl |

**Example Mapping:**

A requirement about "signature validation format requirements":
- **OLD:** `category: esignature` ← Mixed service + technical
- **NEW:** `category: technical` + `useCases: [esignature]` ← Separated concerns

**Remapping Statistics:**

| Old Category | → New Category | Count |
|--------------|----------------|-------|
| `accreditation` | → `registration` | 2 |
| `notification` | → `registration` | 15 |
| `reporting` | → `transparency` | 35 |
| `operational` | → `governance` | 60+ |
| `data-protection` | → `privacy` | 40+ |
| `authentication` | → `verification` | 25+ |
| `functionality` | → `technical` | 50+ |
| `esignature` | → `technical` | 25+ |

**Total:** 270 requirements remapped across 7 files.

**Benefits:**

1. **Single source of truth** — All categories in one file
2. **Build-time validation** — Invalid categories fail the build
3. **Role-agnostic** — Same 12 categories work for all 7 roles
4. **Clear semantics** — Each category has one meaning
5. **UI consistency** — Same category icons/labels everywhere

**Files Changed:**

| File | Change |
|------|--------|
| `config/rca/categories.yaml` | NEW: Global category definitions |
| `scripts/validate-rca.js` | Loads categories from global file |
| `scripts/build-rca.js` | Loads categories from global file |
| `requirements/*.yaml` | Removed per-file categories, remapped all requirements |

---

## DEC-090: Requirement ID Alignment with Atomic Categories

**Date:** 2026-01-20  
**Status:** Implemented  
**Category:** RCA / Data Model

**Context:**

After DEC-089 established 12 atomic categories, a mismatch existed between requirement IDs and their categories:

```yaml
# Example mismatch
- id: RP-TECH-015     # ← Prefix suggests "Technical"
  category: verification  # ← But actual category is "Verification"
```

The original ID scheme `{ROLE}-{CATEGORY}-{NNN}` encoded the category in the prefix. After reclassifying ~270 requirements to the new taxonomy, the prefixes no longer matched the categories.

**Decision:**

Rename all 458 requirement IDs to align prefixes with their atomic categories.

**New ID Format:** `{ROLE}-{CATEGORY_PREFIX}-{NNN}`

**Category Prefix Mapping:**

| Category | Prefix | Mnemonic |
|----------|--------|----------|
| registration | REG | Standard |
| certification | CRT | Cert- |
| issuance | ISS | Issue |
| revocation | REV | Revoke |
| verification | VER | Verify |
| technical | TEC | Tech |
| interoperability | IOP | I/O Protocol |
| security | SEC | Secure |
| privacy | PRV | Private |
| transparency | TRN | Trans- |
| governance | GOV | Govern |
| liability | LIA | Liable |

**Role Prefixes:**

| Role | Prefix |
|------|--------|
| Relying Party | RP |
| Wallet Provider | WP |
| EAA Issuer | EAA |
| PID Provider | PID |
| Trust Service Provider | TSP |
| Conformity Assessment Body | CAB |
| Supervisory Body | SB |

**Note:** EAA Issuer uses `EAA-` prefix (not `ISS-`) to avoid collision with the issuance category prefix `ISS`.

**Example Transformations:**

| Old ID | Category | New ID |
|--------|----------|--------|
| RP-TECH-015 | verification | RP-VER-003 |
| WP-FUNC-008 | technical | WP-TEC-008 |
| CAB-REPORT-001 | transparency | CAB-TRN-001 |

**Implementation:**

1. Created `scripts/rename-requirement-ids.cjs` transformation script
2. Groups requirements by category within each role file
3. Assigns sequential IDs per category: `{ROLE}-{CAT_PREFIX}-{001, 002, ...}`
4. Requirements reordered by category alphabetically
5. Mapping saved to `.agent/session/id-migration-map.json`

**Statistics:**

| Role | Requirements |
|------|--------------|
| Relying Party | 91 |
| Wallet Provider | 132 |
| EAA Issuer | 42 |
| PID Provider | 30 |
| Trust Service Provider | 85 |
| Conformity Assessment Body | 36 |
| Supervisory Body | 42 |
| **Total** | **458** |

**Benefits:**

1. **Semantic clarity** — ID prefix immediately indicates category
2. **Discoverability** — `grep RP-VER-*` finds all RP verification requirements
3. **Consistency** — All IDs follow same pattern
4. **Logical grouping** — Requirements ordered by category in files

**Migration Reference:**

Historical mapping of old→new IDs preserved in:
`.agent/session/id-migration-map.json`

**Files Changed:**

| File | Change |
|------|--------|
| `requirements/*.yaml` | All 458 IDs renamed, reordered by category |
| `scripts/rename-requirement-ids.cjs` | NEW: Transformation script |
| `.agent/session/id-migration-map.json` | NEW: Old→new ID mapping |
| `DECISIONS.md` | Updated examples to use new IDs |

---

## DEC-091: TSP vs EAA Issuer Role Separation

**Date:** 2026-01-20  
**Status:** Accepted  
**Category:** RCA Architecture / Legal Analysis

**Context:**

During the RCA implementation, a question arose: Should EAA Issuer be merged into Trust Service Provider, given that QEAA issuers are legally QTSPs by definition?

Analysis of Article 3(16)(f), 3(19), and 3(20) confirms:
- Issuing QEAA = providing a qualified trust service = being a QTSP
- QEAA issuers are **legally identical** to QTSPs

However, web research and legal text analysis revealed a more nuanced picture.

**Key Finding: Three Categories of Attribute Issuers**

| Type | Is a TSP? | Is a QTSP? | Legal Basis |
|------|-----------|------------|-------------|
| **QEAA Issuer** | ✅ Yes | ✅ Yes | Article 45d — must appear on Trusted Lists |
| **Non-qualified EAA Issuer** | ✅ Yes | ❌ No | Article 45e — TSP but not qualified |
| **Public Authentic Source (PAS)** | ❌ **No** | ❌ No | Article 45f — government bodies, separate notification mechanism |

**Critical Insight — Article 45f(2):**

> "The Member State where public sector bodies... are established shall ensure that the public sector bodies that issue electronic attestations of attributes meet a level of reliability and trustworthiness **equivalent to** qualified trust service providers in accordance with Article 24."

PAS must meet QTSP-equivalent standards but are **NOT QTSPs**:
- Different notification mechanism (Commission list, not Trusted Lists)
- Not subject to TSP supervision under Articles 17-21
- Government entities, not commercial providers

**Decision:**

**Keep TSP and EAA Issuer as separate roles** with the following structure:

| Role | What It Covers | Who Selects It |
|------|----------------|----------------|
| **Trust Service Provider** | Base TSP/QTSP obligations (Articles 13-24) | Any trust service provider |
| **EAA Issuer** | QEAA-specific + PAS obligations (Articles 45d-45h) | Entities issuing attributes to wallets |

**Rationale:**

1. **Service types are orthogonal** — A QTSP providing only e-signatures shouldn't have QEAA requirements (Articles 45d-45h). A QTSP providing QEAA should.

2. **PAS doesn't fit in TSP** — Government authentic sources (Article 45f) are not TSPs. They need a separate role category.

3. **User mental model** — Organizations self-identify as "attribute issuer" or "certificate authority", not by the legal definition of TSP.

4. **Multi-role aggregation handles overlap** — QEAA providers can select TSP (qualified) + EAA Issuer (qualified); the UI deduplicates.

**Acceptable Duplication:**

`issuer.yaml` contains ~17 requirements that duplicate `trust-service-provider.yaml` (Article 24 obligations, 2025/2530 requirements). This is intentional:
- A QEAA provider selecting only "EAA Issuer (qualified)" gets complete requirements
- They don't need to understand they're "really" a QTSP
- User simplicity over data purity

**Role Selection Examples:**

| Organization | Roles to Select | Profiles |
|--------------|-----------------|----------|
| Government DMV | EAA Issuer | `public_authentic` |
| Certificate Authority (signatures only) | TSP | `qualified` |
| Certificate Authority + QEAA | TSP + EAA Issuer | Both: `qualified` |
| University issuing diplomas | EAA Issuer | `qualified` or `non_qualified` |
| Startup issuing gym memberships | EAA Issuer | `non_qualified` |

**Files:**

| File | Purpose |
|------|---------|
| `.agent/docs/architecture/rca-role-architecture.md` | Full rationale document |
| `TERMINOLOGY.md` | New terms: QEAA Issuer, Public Authentic Source |

**External Sources Consulted:**

- europa.eu, european-digital-identity-regulation.com — Article 45f interpretation
- bundesdruckerei.de, talao.io, luxtrust.com — QEAA/QTSP relationship confirmation
- eIDAS consolidated text Articles 3, 45d-45h — Primary legal source

---

## DEC-092: Terminology Verbatim Preservation

**Date:** 2026-01-20  
**Status:** Accepted  
**Category:** Content Policy / Terminology System

**Context:**

When importing definitions from multiple sources (regulations, implementing acts, external documents like EC FAQ), there's a temptation to:
1. "Improve" definitions by making them clearer
2. Merge similar definitions into unified explanations
3. Paraphrase legal language into plain English

This would corrupt the legal accuracy of the knowledge base.

**Decision:**

**All terminology definitions MUST be preserved verbatim from their source documents.**

**Rules:**

| Principle | Requirement |
|-----------|-------------|
| **No adaptation** | Definitions copied exactly as they appear in source documents |
| **No merging** | Same term defined differently in multiple sources → display ALL definitions separately |
| **No paraphrasing** | Legal language preserved even if "awkward" to read |
| **Source attribution** | Every definition shows its source document clearly |
| **Duplicate allowed** | If 3 regulations define "electronic signature" differently, show all 3 |

**Rationale:**

1. **Legal accuracy** — Definitions are legal instruments; changing them changes their meaning
2. **Auditability** — Users can verify our definitions against EUR-Lex
3. **Context matters** — Same term may have different scope in different regulations
4. **No interpretation** — The portal presents law, not our interpretation of law

**Multi-Source Display:**

When a term has multiple definitions from different sources, display them stacked with clear source badges:

```
┌─────────────────────────────────────────────────┐
│ electronic signature                            │
├─────────────────────────────────────────────────┤
│ [Primary] eIDAS Regulation 910/2014             │
│ "'electronic signature' means data in           │
│ electronic form which is attached to or..."     │
├─────────────────────────────────────────────────┤
│ [Supplementary] EC eSignature FAQ               │
│ "An electronic signature is a data in           │
│ electronic form which is attached to or..."     │
└─────────────────────────────────────────────────┘
```

**Future Extension:**

If custom (portal-authored) definitions are needed, they will:
1. Be clearly marked as `[Portal Definition]`
2. Never replace or override legal definitions
3. Be displayed separately from legal definitions

**Files Affected:**

| File | Implication |
|------|-------------|
| `scripts/build-terminology.js` | No merging logic; preserve source separation |
| `TermPopover.jsx` | Multi-source stacked display (already implemented) |
| `TERMINOLOGY.md` | Document this policy for future contributors |

---

## DEC-093: Sidebar Section Rename — "Supplementary Documents"

**Date:** 2026-01-20  
**Status:** Accepted  
**Category:** UI / Navigation

**Context:**

The portal sidebar has a section called "Referenced Regulations" containing:
- Regulation 765/2008 (Accreditation) — a binding regulation
- Recommendation 2021/946 (EUDIW Toolbox) — non-binding
- Regulation 2015/1501 (Interoperability) — an implementing regulation

We want to add the EC eSignature FAQ, which is:
- Not a regulation
- Not referenced by eIDAS
- Valuable guidance content

**Problems with "Referenced Regulations":**

1. **Too narrow** — FAQ isn't a regulation
2. **Inaccurate** — 2021/946 is a Recommendation, not a Regulation
3. **Misleading scope** — implies only documents cited in eIDAS

**Options Evaluated:**

| Option | Verdict |
|--------|---------|
| "External Documents" | ❌ Everything is imported, nothing is truly "external" |
| "Guidance Documents" | ❌ 765/2008 is a binding regulation, not guidance |
| "Reference Documents" | ⚠️ Vague |
| "Resources" | ⚠️ Too informal |
| **"Supplementary Documents"** | ✅ Accurate — all documents supplement the core eIDAS framework |

**Decision:**

Rename sidebar section from **"Referenced Regulations"** to **"Supplementary Documents"**.

**What "Supplementary" captures:**

- ✅ Binding legislation cited by eIDAS (765/2008, 2015/1501)
- ✅ Non-binding recommendations (2021/946)
- ✅ Non-legal guidance (EC FAQ)
- ✅ Any future contextual documents

**Implementation:**

| File | Change |
|------|--------|
| `Sidebar.jsx` | Update `sections` array title |
| `documents.yaml` | Keep `category: referenced`; UI display name is separate |
| New FAQ import | Use `category: supplementary` or keep `referenced` |

**Category Values:**

| Category | Description | Examples |
|----------|-------------|----------|
| `primary` | Core eIDAS legislation | 910/2014, 2024/1183 |
| `implementing_act` | Commission implementing regulations | 2024/2977, 2025/0846 |
| `referenced` | Legal acts cited by eIDAS | 765/2008, 2015/1501 |
| `supplementary` | NEW: Non-legal guidance resources | EC FAQ |

**Note:** The sidebar groups `referenced` + `supplementary` under "Supplementary Documents" header.


---

## DEC-095: Markdown-First Import Strategy

**Date:** 2026-01-21  
**Status:** Adopted  
**Context:** Converter bugs

**Problem:**

We've been treating the Formex/HTML converters as a "regenerable pipeline" — fixing converter bugs then re-importing documents. This causes:
- Significant time debugging XML edge cases (QUOT handling, P blockquotes)
- Lost manual corrections on re-import
- Maintenance burden for two converters (Formex + HTML)
- Thrash between "fix converter" vs "fix markdown directly"

**Analysis:**

The converters are actually **import tools**, not continuous pipelines. Once a document is imported:
- The markdown becomes the source of truth
- Re-importing would overwrite any manual corrections
- EUR-Lex rarely updates existing documents

**Decision:**

1. **Converters = one-way import ramp** — Use for initial import of NEW documents only
2. **Markdown = source of truth** — All documents set to `source: manual` immediately after import
3. **Fix issues in markdown** — Don't try to fix converter bugs for existing documents
4. **Keep converters** — Still needed for importing new implementing acts

**Implementation:**

All 39 documents in `documents.yaml` now have `source: manual`.

**Future bug fixes:**
- **New documents:** Can fix converter if the bug affects new imports
- **Existing documents:** Fix directly in markdown (faster, no re-validation needed)

**Anti-patterns after this decision:**
- ❌ Re-running converter to "regenerate" an existing document
- ❌ Spending hours debugging converter for a one-document fix
- ❌ Losing manual corrections via re-import

**This replaces:** The "Converter-First Rule" in AGENTS.md (now applies only to NEW imports)

---

## DEC-224: Sidebar Section Order and Collapsible Accordion

**Date:** 2026-01-23  
**Status:** Implemented  
**Category:** UX / Navigation  

**Context:**

The sidebar had two usability issues:
1. **Tools buried** — The Tools section (RCA, VCQ, Requirements Browser) was at the bottom, requiring scrolling past 11 supplementary documents
2. **Long list** — Supplementary Documents (10+ items) pushed everything below it off-screen

**Options Evaluated:**

| Option | Description | Verdict |
|--------|-------------|---------|
| A: Collapse middle | All collapsible, Supplementary collapsed by default | Partial fix — still requires scrolling |
| B: Tools first | Reorder + collapsible, Tools at top | ✅ Chosen — matches workflow |
| C: Sticky toolbar | Icon bar for tools, always visible | Overhead — requires icon recognition |

**Decision:**

Implement **Option B with refinement** — after user feedback, final order became:

1. **Overview** (Home, Quick Start, Terminology)
2. **Tools** (RCA, VCQ, All Requirements, AI Assistant)
3. **Regulations** (Primary legal texts)
4. **Supplementary Documents** (Collapsed by default)

**Key Implementation Details:**

1. **Collapsible sections** — All sections have clickable headers with chevron icons
2. **LocalStorage persistence** — Expand/collapse state saved across sessions
3. **Count badges** — Collapsed sections show `(N)` item count
4. **Merged Reference section** — Single-item section (Terminology) merged into Overview

**Rationale:**

1. **Workflow alignment** — Users typically: orient (Overview) → analyze (Tools) → reference (Regulations) → deep dive (Supplementary)
2. **Discoverability** — Tools are now visible without scrolling
3. **Reduced clutter** — 10+ supplementary docs hidden by default
4. **User control** — Preferences remembered via localStorage

**Files Changed:**

| File | Changes |
|------|---------|
| `Sidebar.jsx` | Section reorder, collapsible state, chevron icons |
| `index.css` | `.sidebar-section-header`, `.sidebar-chevron`, rotation animation |

**Pattern Extracted:** Collapsible Section with localStorage — see `.agent/snippets/react-patterns.md`

---

## DEC-246: Data File Caching Strategy

**Date:** 2026-01-24  
**Status:** Accepted  
**Category:** Infrastructure / Performance

**Context:**

JSON data files in `public/data/` (terminology.json, search-index.json, etc.) are fetched at runtime. During development and on GitHub Pages, browser caching was causing stale data issues:
- After rebuilding terminology, users had to hard refresh (Ctrl+Shift+R) to see new terms
- The issue occurred both locally and on production (GitHub Pages)

**Options Evaluated:**

| Option | Description | Verdict |
|--------|-------------|---------|
| A: No-cache dev plugin | Vite plugin disables cache for dev server | ✅ Chosen for dev |
| B: Cache-busting query params | Append `?v=<buildTimestamp>` to all data URLs | Deferred — requires updating 10+ files |
| C: Move JSON to src/ | Import JSON as modules; Vite hashes them | Breaks lazy loading pattern |
| D: Accept GitHub 10-min cache | GitHub Pages default ~10 minute cache | ✅ Chosen for prod |

**Decision:**

Implement a **two-tier caching strategy**:

| Environment | Strategy | Implementation |
|-------------|----------|----------------|
| **Local development** | No caching | `noCacheJsonPlugin()` in `vite.config.js` sets `Cache-Control: no-store` headers |
| **GitHub Pages (production)** | Accept 10-minute cache | No change — GitHub's default cache is acceptable |

**Rationale for accepting 10-minute cache:**

1. **Documentation site** — Users don't need real-time updates; 10 minutes is acceptable
2. **Rare updates** — Terminology/search index changes are infrequent (typically during development)
3. **Implementation cost** — Cache-busting would require modifying 10+ files that fetch data
4. **Tradeoff** — Simplicity over perfect freshness

**Future Option (if needed):**

A `fetchData.js` utility was created but not integrated:
- Located at `src/utils/fetchData.js`
- Appends `?v=<buildTimestamp>` to data URLs
- Can be integrated if real-time freshness becomes critical

**Files Changed:**

| File | Change |
|------|--------|
| `vite.config.js` | Added `noCacheJsonPlugin()` for development server |
| `src/utils/fetchData.js` | NEW: Cache-busting utility (not yet integrated) |

**Testing:**

After this change, during local development:
1. Run `npm run build:terminology`
2. Normal refresh (F5) shows new terms — no hard refresh needed



---

## DEC-247: Fixed Legal Formulas as Compound Dictionary Entries

**Date:** 2026-01-24  
**Status:** Accepted  

**Context:**  
EU legislation uses fixed compound phrases like "natural or legal person" and "Union or national law" extensively. These phrases:
- Appear frequently (131 and 50 occurrences respectively)
- Have distinct legal meaning beyond their components
- Cannot be matched by adding base terms separately (e.g., "natural person" doesn't match "natural" in "natural or legal persons")

Options considered:
1. **Partial/fuzzy matching** - Make "natural" link to "natural person" when in context
2. **Compound phrase entries** - Add the full phrase as its own dictionary entry

**Decision:** Add common compound phrases as separate dictionary entries.

**Rationale:**
1. **Semantic fidelity** - Compound phrases have distinct meaning (e.g., "applies to both humans and entities")
2. **Clean UX** - Single hover explains the complete phrase vs. multiple adjacent links
3. **No false positives** - Avoids "natural resources" → "natural person" mismatches
4. **Low maintenance** - These are fixed legal formulae that don't change

**Compound phrases added:**
- `natural or legal person` (131 occurrences)
- `Union or national law` (50 occurrences)
- `public or private` (19 occurrences)
- `directly or indirectly` (12 occurrences)

**When to reconsider:** If new common compound patterns emerge, add them manually to the custom dictionary.

---

## DEC-250: Hybrid Sidebar Pattern (Unified Toggle)

**Date:** 2026-01-24  
**Status:** Accepted  

**Context:**  
The sidebar required a collapse/expand mechanism for desktop users who want more horizontal space. Initial implementation included:
1. A hamburger button in the global header
2. A chevron button inside the sidebar header
3. A floating "expand" tab on the left edge when collapsed

User feedback: Too complex. Three controls for one action is confusing.

**Decision:** Use **header-only unified toggle** — the hamburger button (☰) in the global header is the sole mechanism for sidebar visibility on all viewports.

**Architecture:**

| Viewport | Sidebar Default | Toggle Mechanism | Behavior |
|----------|-----------------|------------------|----------|
| Desktop (≥1025px) | Expanded | ☰ Header button | Collapse/expand with animation |
| Mobile (<1025px) | Hidden | ☰ Header button | Overlay with backdrop |

**Rationale:**
1. **One control, one action** — Eliminates confusion about which button to use
2. **Familiar pattern** — Users expect hamburger = navigation toggle
3. **Persistent state** — Desktop collapse state saved to localStorage
4. **Clean sidebar** — No in-sidebar chrome; all space for navigation
5. **Accessibility** — `aria-expanded` + `aria-label` update dynamically

**Supersedes:** DEC-004 (which said hamburger hidden on desktop). The new desktop behavior is collapse/expand, not hide.

**Files modified:**
- `Layout.jsx` — Added `sidebarCollapsed` state with localStorage persistence
- `Header.jsx` — Hamburger always visible, dynamic aria attributes
- `Sidebar.jsx` — Accepts `isCollapsed` prop, applies CSS class
- `index.css` — Added `.sidebar-collapsed` media query rules

---

## DEC-251: High-Density Layout Pattern

**Date:** 2026-01-24  
**Status:** Accepted  

**Context:**  
The RCA tool displayed compliance requirements in a table with generous padding suitable for reading-focused regulation pages. User feedback: too much horizontal padding, status column unused, inefficient vertical space usage.

**Decision:** Implement **high-density layout** for interactive compliance tools (RCA, VCQ) that differs from reading-focused regulation pages.

**Key Changes:**

| Element | Before | After |
|---------|--------|-------|
| Main content padding | 2rem (32px) | 1.5rem (24px) |
| RCA page padding | 2rem sides | 1rem sides |
| RCA max-width | 1400px | None |
| ID column | 100px | 75px |
| Legal column | 220px | 180px |
| Requirement column | min-width: 300px | Expands to fill |
| Status column | Interactive dropdown | **Removed** |

**Generator vs Tracker Philosophy:**
- RCA is a **generator** — users configure options, generate checklist, export
- Status tracking happens in external systems (Excel, compliance platforms)
- Removing in-browser status tracking saves ~60 lines of CSS, simplifies state

**Exports unchanged:**
- Excel/Markdown exports still include Status column
- All items export as "⏳ Pending" for users to fill in externally

**Rationale:**
1. **Information density** — Compliance analysts scan 200+ requirements; vertical space matters
2. **Focus on content** — Requirement text is what matters; less chrome around it
3. **Export-first workflow** — Real work happens in spreadsheets, not browser
4. **Consistency** — VCQ table columns adjusted similarly

**Files modified:**
- `ComplianceAssessment.css` — Reduced padding, removed status CSS
- `ComplianceAssessment.jsx` — Removed status column, assessments state
- `VendorQuestionnaire.css` — Similar column adjustments
- `index.css` — Reduced global `--space-8` to `--space-6` for main-content

