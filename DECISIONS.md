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

*Add new decisions at the bottom with incrementing DEC-XXX numbers.*

