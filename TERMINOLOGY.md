# eIDAS 2.0 Documentation Portal — Terminology

> Status: Living Document | Last updated: 2026-01-18

Common terms used across the documentation portal project to ensure consistent vocabulary. This is the authoritative source for terminology—any ambiguity in communication should be resolved by consulting this document.

---

## Document Structure (EU Legal)

### Document Hierarchy

| Term | Description |
|------|-------------|
| **Regulation** | A primary EU legislative act (e.g., eIDAS 2.0, Regulation 910/2014). Regulations are directly applicable in all EU Member States. |
| **Implementing Act** | A secondary act issued by the Commission to provide technical specifications for a Regulation (e.g., 2024/2977 on wallet attestations). |
| **Delegated Act** | A secondary act that supplements or amends certain non-essential elements of a Regulation. |
| **Recommendation** | A non-binding EU act providing guidance. While not legally binding, used to coordinate Member State cooperation (e.g., 2021/946 EUDIW Toolbox). |
| **Decision** | An EU act binding on those it addresses (specific Member States, companies, or individuals). May use GR.SEQ or ARTICLE structure. |
| **Referenced Document** | A document cited by the primary regulation that isn't part of the eIDAS ecosystem itself (e.g., Regulation 765/2008 on accreditation). |

### Document Parts

| Term | Description |
|------|-------------|
| **Preamble** | The introductory section of a legislative act before the articles. Contains the legal basis and recitals. |
| **Recital** | A numbered paragraph in the preamble explaining the reasoning behind the legislation. Format: `(1)`, `(2)`, etc. Recitals are **non-binding** but provide interpretive guidance. |
| **Enacting Terms** | The binding provisions of a regulation—the articles themselves. Everything after "HAS ADOPTED THIS REGULATION:". |
| **Article** | A numbered provision in the enacting terms. Format: `Article 1`, `Article 5a`. The fundamental unit of legal obligation. |
| **Paragraph** | A numbered subdivision within an article. Format: `Article 5(1)`, `Article 5(2)`. Parentheses distinguish from articles. |
| **Point** | A lettered subdivision within a paragraph. Format: `Article 5(1)(a)`, `Article 5(1)(b)`. Uses lowercase letters. |
| **Subpoint** | A roman-numeral subdivision within a point. Format: `Article 5(1)(a)(i)`, `Article 5(1)(a)(ii)`. Uses lowercase roman numerals. |
| **Annex** | Supplementary material at the end of a regulation, often containing technical specifications. **Annexes use "point" (not "paragraph")** for subdivisions. Format: `Annex I, point 3`, `Annex I, point 3(a)`. Note: Unlike articles where paragraphs use parentheses (e.g., `Article 5(1)`), annexes explicitly spell out "point" before the number. |
| **Chapter** | A grouping of related articles (e.g., `Chapter III — Electronic Identification`). |
| **Section** | A subdivision within a chapter. |

### Document Identifiers

| Term | Description |
|------|-------------|
| **CELEX** | The unique identifier for EU legal documents in EUR-Lex. Format examples: `32014R0910` (Regulation 910/2014), `32024R1183` (Regulation 2024/1183). The first digit indicates document type (3=Regulation). |
| **ELI** | European Legislation Identifier. A standardized URI for citing EU law. Base format: `http://data.europa.eu/eli/{type}/{year}/{number}/oj`. |
| **Slug** | The internal identifier used in the portal's URL routing. Format: `{year}-{number}` (e.g., `2014-910`, `2024-1183`, `2008-765`). Standardized in DEC-083 to always use year-first format, matching ELI URIs. |

### ELI Path Variants

Different legal act types use different ELI path segments:

| Legal Act Type | ELI Path | Example URI |
|----------------|----------|-------------|
| **Regulation** | `/eli/reg/` | `http://data.europa.eu/eli/reg/2014/910/oj` |
| **Implementing Regulation** | `/eli/reg_impl/` | `http://data.europa.eu/eli/reg_impl/2015/1501/oj` |
| **Delegated Regulation** | `/eli/reg_del/` | `http://data.europa.eu/eli/reg_del/2024/xxx/oj` |
| **Directive** | `/eli/dir/` | `http://data.europa.eu/eli/dir/2016/1148/oj` |
| **Decision** | `/eli/dec/` | `http://data.europa.eu/eli/dec/2015/2240/oj` |
| **Recommendation** | `/eli/reco/` | `http://data.europa.eu/eli/reco/2021/946/oj` |

**Why this matters:** The `eurlex_html_to_md.py` script auto-detects the regulation type from the HTML title and uses the correct ELI path. The CELEX type code (R for all regulations) doesn't distinguish between regular and implementing regulations—only the ELI does.

---

## UI Components

### Navigation Elements

| Term | Description |
|------|-------------|
| **Sidebar** | The left navigation panel containing document list and category sections. |
| **Table of Contents (ToC)** | The right sidebar panel showing structural navigation within the current document. |
| **Collapsible ToC** | The expandable/collapsible hierarchy in the ToC (chapters → articles). |
| **Document Switcher** | The section of the sidebar listing available regulations and implementing acts. |
| **Sticky Alphabet Nav** | The A-Z letter bar on the Terminology page that sticks below the header while scrolling. Clicking a letter jumps to that section. Uses glassmorphism effect. |

### Content Display

| Term | Description |
|------|-------------|
| **Regulation Viewer** | The main content area displaying the current document's text. Component: `RegulationViewer.jsx`. |
| **Article Text** | The content of articles in the enacting terms—the binding legal provisions. Contrast with **Recital Text** which is interpretive. |
| **Recital Text** | The content of recitals in the preamble—the explanatory context. Recitals explain *why*; articles specify *what*. |

### Interactive Elements

| Term | Description |
|------|-------------|
| **Gutter Icons** | The 🔗 📜 buttons that appear on hover to the left of articles, paragraphs, points, and recitals. Positioned in the "gutter" (left margin). |
| **Copy Reference Gutter** | The container holding the gutter icon buttons (`.copy-gutter` class). |
| **Copy Link Button** | The 🔗 button that copies a deep link URL to the clipboard. |
| **Copy EU Reference Button** | The 📜 button that copies the EU-formatted citation to the clipboard. |
| **Deep Link** | A URL that navigates directly to a specific provision. Format: `#/regulation/910-2014?section=article-5a-para-1`. |

### Popovers

| Term | Description |
|------|-------------|
| **Popover** | A floating UI element that appears on hover (desktop) or tap (mobile) to show additional information without navigating away. |
| **Citation Popover** | A popover triggered by hovering over a legislation citation link. Shows the document title, CELEX, and EUR-Lex link. |
| **Term Popover** | A popover triggered by hovering over a defined term (e.g., "electronic signature"). Shows the definition from the terminology database. |
| **Popover Trigger** | The element that activates a popover. For citations: `<span class="citation-ref">`. For terms: `<abbr class="defined-term">`. |
| **Hover Delay** | Brief delay before popover appears (prevents accidental triggers during cursor movement). |
| **Hover Persistence** | Popover stays visible when cursor moves from trigger to popover content, allowing interaction with popover links. |

---

## Citation & Reference System

### EU Citation Format

| Term | Description |
|------|-------------|
| **EU-Formatted Citation** | A human-readable legal citation following EU style. Examples: `Article 5a(1) of Regulation (EU) No 910/2014`, `Recital (42) of Regulation (EU) No 910/2014`. |
| **Short Title** | The human-friendly name for a document. Examples: "eIDAS 2.0 Regulation", "Digital Identity Wallet Attestation Regulation". Stored in `shortTitle` field. |
| **Citation Reference** | The text copied by the 📜 button—a complete EU-formatted citation suitable for legal documents. |

### Citation Types in Content

| Term | Description |
|------|-------------|
| **Internal Citation** | A reference to another provision within the same document (e.g., "as specified in Article 12"). |
| **Cross-Document Citation** | A reference to another document in the portal (e.g., "in accordance with Regulation (EU) 2024/1183"). Links within portal. |
| **External Citation** | A reference to a document not in the portal (e.g., "Decision No 768/2008/EC"). Links to EUR-Lex. |
| **Formal Citation** | A citation with an ELI URL in the source, extractable with high confidence. |
| **Informal Citation** | A citation detected by pattern matching (e.g., "Directive 2001/95/EC"). CELEX auto-constructed. |
| **Base Citation** | The parent document citation that a provision citation inherits metadata from. When a provision is cited (e.g., "Article 5 of NIS2"), the base citation is the document-level entry for NIS2. |
| **Metadata Registry** | The `LEGISLATION_METADATA` object in `legislation-metadata.js` containing enriched data (humanName, abbreviation, status, category) for known CELEX numbers. Used to enrich citation popovers. |
| **displayText** | The visible link text for a citation, preserved from the original source document. Shows the exact legislation reference as written (e.g., "Commission Recommendation (EU) 2021/946"), not an abbreviated version. See Rule 36 in AGENTS.md. |
| **Institutional Attribution** | The phrase "of the European Parliament and of the Council" (or similar) identifying which EU institutions adopted an act. **Excluded from citation link text** — appears as regular text after the link. |

### Citation Granularity

| Term | Description |
|------|-------------|
| **Document Citation** | A citation that links to the root of a document (e.g., "Regulation (EU) 910/2014" → `#/regulations/910-2014`). Currently implemented for Cross-Document and External citations. |
| **Provision Citation** | A citation that deep-links to a specific provision within a document — article, paragraph, point, recital, or annex. Uses `?section=` parameter for navigation (e.g., "Article 5a(1)" → `?section=article-5a-para-1`). Pattern examples: "Article 5a(1)", "recital (42)", "Annex I". |

---

## Terminology System

| Term | Description |
|------|-------------|
| **Defined Term** | A word or phrase that has a legal definition in one or more documents (e.g., "electronic signature", "relying party"). |
| **Definition** | The explanatory text defining a term, typically found in Article 2 or Article 3 of regulations. |
| **Multi-Source Term** | A term defined in multiple documents (e.g., "manufacturer" defined in both eIDAS and Reg 765/2008). Displayed as stacked definitions. |
| **Primary Definition** | The definition from the main eIDAS regulation (highest priority in display). |
| **Referenced Definition** | A definition from a referenced document (e.g., Reg 765/2008). Lower display priority. |
| **Source Badge** | The colored indicator showing which document a definition comes from (e.g., "Primary", "Referenced"). |
| **Terminology Page** | The `/terminology` view listing all defined terms alphabetically with their definitions. |

### Definition Numbering Formats

| Era | Format | Example |
|-----|--------|---------|
| **EC regulations (pre-2009)** | `N. 'term' means...` | `3. 'manufacturer' means...` |
| **EU regulations (post-2009)** | `(N) 'term' means...` | `(3) 'electronic signature' means...` |

**Why this matters:** Both formats must be preserved exactly as they appear in EUR-Lex. The portal handles both via regex patterns in `build-terminology.js` and uses raw HTML for 765/2008 to prevent markdown renumbering (see DEC-057).

---

## Data Model

### Content Files

| Term | Description |
|------|-------------|
| **Regulation JSON** | The processed document data in `/public/data/regulations/{slug}.json`. Contains title, HTML content, metadata. |
| **Citations JSON** | The citation data for a document in `/public/data/citations/{slug}.json`. Lists all legislation references found in content. |
| **Metadata JSON** | The portal-wide statistics in `/public/data/metadata.json`. Contains document count, word counts, build timestamp. |
| **Regulations Index** | The document listing in `/public/data/regulations-index.json`. Used by sidebar and search. |

### Source Files

| Term | Description |
|------|-------------|
| **Source Markdown** | The markdown file in `/01_regulation/` containing the original converted content. |
| **Formex XML** | The official EUR-Lex structured format for EU legislation. Primary source for conversion. |
| **EUR-Lex HTML** | The web format of EU legislation. Fallback source when Formex unavailable. |
| **ALINEA** | A Formex XML element representing the content block within an article paragraph. Contains the actual text, lists, and inline elements (e.g., `<DATE>`, `<QUOT.START>`). Plural: ALINEA (same). Processed by `process_alinea_nested()` in the converter. |

---

## Build Pipeline

| Term | Description |
|------|-------------|
| **Content Build** | The process of converting source markdown to JSON. Command: `npm run build:content`. |
| **rehype Plugin** | A unified.js plugin that processes HTML AST. Used for adding IDs, transforming citations. |
| **Paragraph ID Plugin** | The `rehype-paragraph-ids.js` plugin that assigns linkable IDs to articles, paragraphs, points, and recitals. |
| **Citation Extraction** | The process of finding and cataloging legislation references in document content. |
| **Citation Transformation** | Converting citation text to interactive `<span>` elements with popover triggers. |

---

## Linkable Elements

| Term | CSS Class | ID Format | Example |
|------|-----------|-----------|---------|
| **Linkable Heading** | `h2[id]`, `h3[id]` | `article-5a`, `chapter-iii` | `<h3 id="article-5a">Article 5a</h3>` |
| **Linkable Paragraph** | `linkable-paragraph` | `article-5a-para-1` | `<li id="article-5a-para-1" class="linkable-paragraph">` |
| **Linkable Point** | `linkable-point` | `article-5a-para-1-point-a` | `<li id="article-5a-para-1-point-a" class="linkable-point">` |
| **Linkable Subpoint** | `linkable-subpoint` | `article-5a-para-1-point-a-subpoint-i` | `<li id="..." class="linkable-subpoint">` |
| **Linkable Recital** | `linkable-recital` | `recital-42` | `<li id="recital-42" class="linkable-recital">` |

---

## Document Categories

The portal's data model uses **two orthogonal dimensions** to classify documents:

### Legal Type (legalType)

What the document IS under EU law:

| legalType | Binding? | Description |
|-----------|----------|-------------|
| **regulation** | ✅ Legally binding | Directly applicable in all Member States (e.g., eIDAS 910/2014) |
| **recommendation** | ❌ Non-binding | Guidance document (e.g., EUDIW Toolbox 2021/946) |
| **decision** | ✅ Binding on addressees | Binding only on those it addresses (e.g., Trusted Lists 2025/2164) |
| **directive** | ✅ Goals binding | Sets goals; Member States choose implementation |

### Category (category)

How the document relates to the eIDAS project:

| category | Description |
|----------|-------------|
| **primary** | Core eIDAS legislation (910/2014, 2024/1183) |
| **implementing_act** | Commission implementing regulations (technical specs) |
| **referenced** | External documents cited by eIDAS (765/2008, 2021/946) |

### CELEX Type Codes

| Code | Document Type | Example |
|------|---------------|---------|
| `R` | Regulation | 32024**R**1183 |
| `H` | Recommendation | 32021**H**0946 |
| `D` | Decision | 32025**D**2164 |
| `L` | Directive | 32006**L**0123 |

---

## Formex XML Structures

| Term | Description |
|------|-------------|
| **GR.SEQ** | Group Sequence element in Formex XML. Used by Recommendations (and some Decisions) to structure normative sections instead of `<ARTICLE>` tags. Contains numbered sections with `<TITLE>` and `<NP>` elements. |
| **ARTICLE** | Formex XML element for binding provisions. Standard in Regulations. Contains `<PARAG>` and `<ALINEA>`. |
| **NP** | Numbered Paragraph element in Formex. Contains `<NO.P>` (the number) and `<TXT>` (the text). |
| **NO.P** | Number element within NP. The actual number text like "(1)" or "1.". |



## File Locations

| Path | Contains |
|------|----------|
| `docs-portal/src/pages/` | Page-level React components (RegulationViewer, Terminology) |
| `docs-portal/src/components/` | Reusable UI components |
| `docs-portal/src/hooks/` | Custom React hooks (useCitations, useCopyReference, useSearch) |
| `docs-portal/scripts/` | Build-time scripts (build-content.js, rehype plugins) |
| `docs-portal/public/data/` | Generated JSON files (regulations, citations, terminology) |
| `01_regulation/` | Source markdown files organized by document |

---

## Interaction Patterns

### Hover-to-Preview Pattern
On desktop, hovering over citation links and defined terms shows a popover with additional information. The popover remains visible while the cursor is over either the trigger or the popover itself (hover persistence).

### Gutter Icon Pattern
On hover, linkable elements (articles, paragraphs, points, recitals) reveal copy icons in the left margin. Icons fade in on hover, fade out on mouse leave.

### Deep Link Scroll Pattern
Navigating to a URL with `?section=` parameter scrolls the viewport to that element and applies a brief highlight animation.

### Scroll Restoration Pattern
Preserves user's scroll position when navigating away and back via browser history. Implementation:
1. **Save on Exit**: When user clicks an internal link, current `window.scrollY` is saved to `sessionStorage`.
2. **Detect Back/Forward**: Uses React Router's `useNavigationType()` to detect `'POP'` (back/forward) vs `'PUSH'` (manual navigation).
3. **Height-Aware Polling**: Waits until `document.scrollHeight > targetY + viewportHeight` before restoring (fixes timing issue where content hasn't rendered yet).
4. **Deep Link Precedence**: If URL has `?section=` parameter, deep linking takes priority over scroll restoration.

Hook: `useScrollRestoration.js` — shared between Terminology.jsx and RegulationViewer.jsx.

---

## Provisions (Collective Term)

| Term | Description |
|------|-------------|
| **Provision** | A collective term for any addressable legal subdivision: article, paragraph, point, subpoint, or recital. Used when referring generically to "linkable elements within a legal document." |
| **Provision ID** | The stable identifier assigned to a provision for deep linking. Format: `article-5a-para-1-point-a`. |
| **Provision Citation** | A reference that targets a specific provision within a document, not just the document root. Contrasted with **Document Citation**. |
| **Provision Path** | The full hierarchical path to a provision: Article → Paragraph → Point → Subpoint. Used for generating EU-formatted citations. |

---

## Citation Relationships

| Term | Description |
|------|-------------|
| **Self-Reference** | A citation pointing to the current document's base regulation (e.g., consolidated eIDAS 910/2014 citing "Regulation 910/2014"). Handled specially with "CURRENT DOCUMENT" badge (DEC-060). |
| **Intra-Document Reference** | A reference to another provision within the same document (e.g., "see Article 12" within Regulation 910/2014). |
| **Cross-Document Reference** | A reference to a provision in a different document (e.g., "Article 5a(1) of Regulation 910/2014" cited from an implementing act). |
| **Amended Reference** | A citation to a regulation that has been modified by another act. Shows dual badges: "IN FORCE" + "AMENDED" (DEC-062). |

---

## Navigation State

| Term | Description |
|------|-------------|
| **Navigation Type** | React Router's classification of how the user arrived: `'POP'` (back/forward button), `'PUSH'` (link click), `'REPLACE'` (redirect). |
| **Back/Forward Navigation** | Browser history navigation (`navigationType === 'POP'`). Triggers scroll position restoration. |
| **Manual Navigation** | Explicit link click or URL entry (`navigationType === 'PUSH'`). Starts fresh at top of page or deep link target. |
| **DOM Height Timing** | The race condition where `window.scrollTo()` is called before the page content has fully rendered. Solved by height-aware polling. |

---

## Search System

| Term | Description |
|------|-------------|
| **Full-Text Search** | Keyword-based search using Orama index. Matches exact words in document content. |
| **Semantic Search** | AI-powered search using Transformers.js embeddings. Finds conceptually similar content even without exact word matches. |
| **Two-Tier Search** | The portal's search strategy: full-text for speed and precision, semantic for conceptual discovery. |
| **Orama** | The full-text search engine library used for client-side indexing. |
| **Embeddings** | Vector representations of text generated by Transformers.js. Used for semantic similarity matching. |
| **Quick Jump** | A search feature that detects document identifiers (CELEX, slug, ELI) in the search query and provides instant navigation to matching documents. Appears as a special section above regular search results. Examples: `32015R1501` → Quick Jump to Interoperability Framework, `eli/reg/2014/910` → Quick Jump to consolidated eIDAS. |
| **Definition Boost** | The 10x scoring multiplier applied to terminology definitions in search results. |

---

## AI Features

| Term | Description |
|------|-------------|
| **AI Chat** | The WebLLM-powered conversational interface for querying eIDAS content. |
| **WebLLM** | Browser-based LLM runtime that runs models entirely client-side. |
| **RAG** | Retrieval-Augmented Generation. The AI chat retrieves relevant document chunks before generating responses. |
| **Gemma 2B** | The recommended language model for AI Chat (balance of quality and browser performance). |

---

## Document States & Amendments

| Term | Description |
|------|-------------|
| **Consolidated Document** | A document that merges the original act with all its amendments into a single coherent text. Example: eIDAS 910/2014 consolidated with 2024/1183 amendments. |
| **Original Act** | The law as first published, before any amendments. |
| **Amending Act** | A regulation that modifies another regulation (e.g., 2024/1183 amends 910/2014). |
| **Preamble Injection** | Build-time process that copies recitals from an amending act into the consolidated document's preamble. |
| **Status Badge** | A colored indicator in citation popovers showing document status: `IN FORCE` (green), `REPEALED` (red), `PENDING` (yellow). |
| **Amended Badge** | An amber badge shown alongside `IN FORCE` when a regulation has been modified by another act. |
| **Category Badge** | A colored indicator of document type for non-regulation documents: `Directive` (blue), `Decision` (purple), `Recommendation` (cyan). Regulations don't show a badge (most common type). |

---

## Visual Patterns

| Term | Description |
|------|-------------|
| **Glassmorphism** | A visual design pattern using semi-transparent backgrounds with backdrop blur. Used on sticky headers and the alphabet nav. |
| **Fast Scroll** | The 150ms JavaScript-animated scroll used throughout the portal. Faster than native smooth scroll while remaining visually smooth. |
| **References Section** | A section at the bottom of each regulation listing all external citations. **Mobile-only** — hidden on desktop where popovers provide the same information inline. |
| **Abbreviation Badge** | A badge showing the common abbreviation for a regulation in citation popovers (e.g., "GDPR", "eIDAS 1.0"). |
| **Reading Time Estimate** | The estimated reading duration shown in document headers. Uses 150 WPM (slower than typical 265 WPM due to legal text density). |

---

## See Also

- [DECISIONS.md](DECISIONS.md) - Architectural and design decisions
- [AGENTS.md](AGENTS.md) - AI agent guidelines
- [TRACKER.md](TRACKER.md) - Implementation progress tracking
