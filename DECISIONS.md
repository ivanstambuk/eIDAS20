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

*Add new decisions at the bottom with incrementing DEC-XXX numbers.*

