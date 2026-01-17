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



