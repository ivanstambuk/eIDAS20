# eIDAS 2.0 Documentation Portal — Terminology

> Status: Living Document | Last updated: 2026-01-28

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
| **Alphanumeric Paragraph** | A paragraph numbered with a letter suffix (1a, 1b, 2a). Common in EU legislation that has been amended to insert content between existing paragraphs. In markdown, must use `- (1a)` format for deep linking. |
| **Em-dash Bullet** | The `—` character (U+2014) used in EU legal documents for unnumbered sub-items within paragraphs. Not to be confused with hyphen `-` (U+002D). Appears as nested bullets under paragraphs. |


### Document Identifiers

| Term | Description |
|------|-------------|
| **CELEX** | The unique identifier for EU legal documents in EUR-Lex. Format examples: `32014R0910` (Regulation 910/2014), `32024R1183` (Regulation 2024/1183). The first digit indicates document type (3=Regulation). |
| **Base CELEX** | The original act CELEX starting with `3` (e.g., `32019R0881`). Used for Formex import when consolidated version unavailable. |
| **Consolidated CELEX** | A CELEX representing the consolidated version of a text including all amendments. Format: `0YYYYRNNNN-YYYYMMDD` (e.g., `02019R0881-20250204`). Used for EUR-Lex links even when importing from base. |
| **Corrigendum** | An official correction to typos or errors in published legislation. Identified by R(01), R(02), etc. suffix. Corrigenda should be applied manually if substantive. |
| **M1 Amendment** | A modification to a regulation made by subsequent legislation. Numbered M1, M2, etc. in EUR-Lex. May require manual surgery or waiting for consolidated Formex. |
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
| **Collapsible Section** | A sidebar section that can be expanded/collapsed by clicking its header. Uses chevron icon that rotates 180° when expanded. State persisted in localStorage under `sidebar-expanded-sections`. |
| **Accordion** | A UI pattern where multiple sections can be independently expanded/collapsed. Each section has a clickable header with visual indicator (chevron). Unlike tabs, multiple sections can be open simultaneously. |

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
| **Markdown Source of Truth** | The project decision (DEC-095) that markdown files in `/01_regulation/` are the authoritative editable source. Converters (Formex, HTML) are import-only tools; re-importing overwrites manual corrections. Fixes should be applied directly to markdown, never by re-running converters on existing documents. |

---

## Build Pipeline

| Term | Description |
|------|-------------|
| **Content Build** | The process of converting source markdown to JSON. Command: `npm run build:documents`. |
| **rehype Plugin** | A unified.js plugin that processes HTML AST. Used for adding IDs, transforming citations. |
| **HAST** | HTML Abstract Syntax Tree. The intermediate representation used by rehype plugins to process HTML structure before serialization. Plugins walk HAST nodes to transform content (add IDs, inject links). |
| **Paragraph ID Plugin** | The `rehype-paragraph-ids.js` plugin that assigns linkable IDs to articles, paragraphs, points, and recitals. |
| **External Links Plugin** | The `rehype-external-links.js` plugin that auto-links references to external EU documents (not imported) to EUR-Lex with provision anchors. |
| **External Document** | An EU regulation/directive referenced in imported documents but NOT in the portal itself. These are linked to EUR-Lex. Registry: `config/external-documents.yaml`. |
| **Citation Extraction** | The process of finding and cataloging legislation references in document content. |
| **Citation Transformation** | Converting citation text to interactive `<span>` elements with popover triggers. |
| **CSS Specificity Cascade** | The CSS rule priority mechanism where the LAST matching rule wins when specificity is equal. Critical for understanding why accessibility rules at the bottom of `index.css` override earlier styling. Solution: use higher specificity or place rules after accessibility declarations. |
| **Title Continuation Pattern** | The EU legal document pattern where formal title elements (`**of DATE**`, `**on SUBJECT**`, `*(Text with EEA relevance)*`) appear after the H1 title. These are stripped by the HTML parser since they're already displayed in the header component. See Rule 43 in AGENTS.md. |

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

### Referenced Standards

| Term | Description |
|------|-------------|
| **ETSI Standard** | European Telecommunications Standards Institute technical specification. Referenced by eIDAS implementing acts for trust service requirements. Common standards: ETSI EN 319 401 (general TSP requirements), ETSI EN 319 411-2 (certificate policies for web authentication), ETSI TS 119 461 (identity proofing). Standards with REQ-* identifiers in implementing act annexes should be extracted as RCA requirements. |

---

## Formex XML Structures

| Term | Description |
|------|-------------|
| **GR.SEQ** | Group Sequence element in Formex XML. Used by Recommendations (and some Decisions) to structure normative sections instead of `<ARTICLE>` tags. Contains numbered sections with `<TITLE>` and `<NP>` elements. |
| **ARTICLE** | Formex XML element for binding provisions. Standard in Regulations. Contains `<PARAG>` and `<ALINEA>`. |
| **NP** | Numbered Paragraph element in Formex. Contains `<NO.P>` (the number) and `<TXT>` (the text). |
| **NO.P** | Number element within NP. The actual number text like "(1)" or "1.". |



## Project Structure

### Agent Documentation

| Term | Description |
|------|-------------|
| **Hub and Spoke Documentation** | A modular documentation pattern where the main file (hub) contains essential content and links to specialized documents (spokes). AGENTS.md is the hub; `.agent/docs/` contains spokes. This pattern allows the main file to stay concise while preserving all information in modular, topic-specific files. |
| **Quick Reference Table** | A markdown table at the top of a hub document linking to related spoke documents. Enables fast navigation without scrolling through a monolithic file. Example: "Development Rules → `.agent/docs/rules/development-rules.md`". |
| **Critical Rules** | Rules 1-10 in AGENTS.md that must remain inline (not extracted) because they apply to every session: notifications, commits, browser cleanup, UI proposals, etc. |
| **Development Rules** | Rules 11-25 covering React patterns, CSS debugging, legal structure preservation, and development best practices. Located in `.agent/docs/rules/development-rules.md`. |
| **Content Rules** | Rules 26-44 covering Formex/HTML conversion, legal document handling, build pipeline patterns, and content-specific gotchas. Located in `.agent/docs/rules/content-rules.md`. |
| **Rules Index** | The `.agent/docs/rules/README.md` file providing a complete table of all 44 rules with navigation by topic and severity. |

---

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
1. **Save on Exit**: When user clicks an internal link (citation/term popover), current `window.scrollY` is saved to `sessionStorage`.
2. **Detect Back/Forward**: Uses React Router's `useNavigationType()` to detect `'POP'` (back/forward) vs `'PUSH'` (manual navigation).
3. **Height-Aware Polling**: Waits until `document.scrollHeight > targetY + viewportHeight` before restoring (fixes timing issue where content hasn't rendered yet).
4. **Deep Link Override**: On back navigation with a saved position, URL parameters like `?section=` are ignored—scroll restoration takes precedence.

**Supported Flows**:
- Terminology → Term → Back (restores Terminology position)
- Regulation → Citation Popover → Back (restores Regulation position)
- Regulation → Term Popover → Terminology → Back (restores Regulation position)

Hook: `useScrollRestoration.js` — shared between Terminology.jsx and RegulationViewer.jsx.

📄 **Full documentation**: [.agent/docs/scroll-restoration.md](.agent/docs/scroll-restoration.md)

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
| **Deep Link Override** | The behavior where a saved scroll position takes precedence over URL-based section scrolling on back navigation. When `navigationType === 'POP'` and a saved position exists, `?section=` parameters are ignored. |

---

## Search System

| Term | Description |
|------|-------------|
| **Search Modal** | The global search interface invoked via `Ctrl+K` (or `Cmd+K` on Mac). Searches the **search index**, which includes terminology, regulations, and ARF HLRs. Note: This is separate from the Terminology page's filter — adding terms to `terminology.json` also requires rebuilding the search index via `npm run build:search`. |
| **Search Index** | The pre-built JSON file (`search-index.json`) containing all searchable content: terminology definitions, regulation articles, and ARF HLRs. Built by `npm run build:search`. Separate from `terminology.json` — both must be rebuilt when adding new terms. Now auto-rebuilt when running `npm run build:terminology`. |
| **Full-Text Search** | Keyword-based search using Orama index. Matches exact words in document content. |
| **Semantic Search** | AI-powered search using Transformers.js embeddings. Finds conceptually similar content even without exact word matches. |
| **Two-Tier Search** | The portal's search strategy: full-text for speed and precision, semantic for conceptual discovery. |
| **Orama** | The full-text search engine library used for client-side indexing. |
| **Embeddings** | Vector representations of text generated by Transformers.js. Used for semantic similarity matching. |
| **Quick Jump** | A search feature that detects document identifiers in the search query and provides instant navigation to matching documents. Appears as a rocket (🚀) section above regular search results. Supports: (1) **Numeric patterns**: CELEX (`32015R1501`), slugs (`2014-910`), ELI URIs (`eli/reg/2014/910`), legal citations (`910/2014`). (2) **Abbreviations**: Maps common abbreviations (GDPR, DORA, NIS2, eIDAS, CSA, ePrivacy) to document slugs via `DOCUMENT_ALIASES` in `useQuickJump.js`. (3) **Title matching**: Prefix and partial matches against `sidebarTitle` and `shortTitle` fields. Priority scoring: alias (105) > exact sidebar (102) > CELEX (100) > title prefix (85) > partial (75). |
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
| **High-Density Layout** | A compact layout pattern for interactive compliance tools (RCA, VCQ) with reduced padding, narrower columns, and no max-width constraints. Optimized for expert users scanning 200+ requirements. Contrast with reading-focused regulation pages that use generous spacing. Formalized in DEC-251. |
| **Generator Tool** | A tool that creates output for external use (e.g., Excel export) rather than maintaining in-browser state. RCA and VCQ are generator tools — users configure options, generate checklists, and export. Status tracking happens externally in compliance management systems, not in the browser. |

---

## Regulatory Compliance Analyzer (RCA)

| Term | Description |
|------|-------------|
| **RCA** | Regulatory Compliance Analyzer. The portal feature that extracts, organizes, and tracks compliance requirements from eIDAS legal sources. |
| **Gap Analysis** | The process of cross-referencing legal articles against existing requirements to identify missing obligations. A mandatory step in the `/rca-audit` workflow. |
| **Binding Type** | Classification of requirement source: `mandatory` (from articles — legally binding) or `informative` (from recitals — interpretive guidance). |
| **Role-Specific Tracker** | An audit tracker file scoped to a single role. Naming convention: `AUDIT_TRACKER_{ROLE}.md` (e.g., `AUDIT_TRACKER_RP.md` for Relying Party). |
| **Requirement ID** | The unique identifier for a compliance requirement. Format: `{ROLE_PREFIX}-{CATEGORY}-{NUMBER}` (e.g., `RP-REG-001`, `WP-CERT-003`, `TSP-QUAL-002`). |
| **Use Case** | A specific scenario where a requirement applies (e.g., `age-verification`, `public_service`, `esignature`). Requirements tagged with `useCases: all` apply universally. |
| **Schema Version** | The version number of the requirements YAML structure. Incremented when requirements are added or modified. |
| **Collapsed Range** | ⚠️ **Anti-pattern**: Using ranges like "Art. 1-22" or "Annex I-IX" in audit trackers instead of individual rows. Hides unreviewed items and prevents systematic review. See `/rca-audit` workflow for correct format. |
| **One Row Per Provision** | The mandatory audit tracker rule requiring each article, annex, and recital to have its own row. Prevents accidentally skipping provisions during review. |
| **Role Profile** | A sub-selection within a role for more granular requirement filtering. Examples: "Public Sector" vs "Private Sector" for Relying Party, "Qualified TSP" vs "Non-Qualified Provider" for EAA Issuer. Profiles allow the same role to have context-specific requirements. Configured in `roles.yaml`. |
| **Profile Filter** | The `profileFilter` field on requirements that restricts them to specific role profiles. Requirements without `profileFilter` apply to all profiles of the role. Format: `profileFilter: [public_sector]` or `profileFilter: [qualified, non_qualified]`. If a requirement only applies to qualified EAA issuers, add `profileFilter: [qualified]`. |
| **Mutatis Mutandis** | Latin legal term meaning "with the necessary changes." In EU legislation, used to apply provisions from one article to another context. Example: Article 5a(14) applies Article 45h(3) *mutatis mutandis* to private wallet providers, creating profile-specific obligations. Always search for this phrase during audits — it creates hidden cross-references. |
| **Functional Separation** | An eIDAS requirement for private wallet providers (mandated/independent) to implement wallet services in a manner organizationally and technically separate from other services they provide. Derived from Article 45h(3) applied via Article 5a(14). Does NOT apply to Member States directly operating wallets. |
| **PID Provider** | Member State entity (or designee) responsible for issuing Person Identification Data (PID) to European Digital Identity Wallets. Legal basis: Article 5a(5)(f) and Implementing Regulation 2024/2977. Unlike EAA Issuers, PID Providers can only be Member States or their designated entities — not private companies acting independently. Requirements apply uniformly regardless of whether the MS issues directly or designates. |
| **Wallet Unit** | A unique configuration of a wallet solution for an individual user, including wallet instances, wallet secure cryptographic applications, and wallet secure cryptographic devices. Defined in 2024/2977 Article 2(2). Each wallet user has one wallet unit that cryptographically binds their PID and attestations. |
| **Wallet Unit Attestation** | A data object that describes the components of a wallet unit or allows authentication and validation of those components. Defined in 2024/2977 Article 2(5). PID Providers must validate the wallet unit attestation before issuing PID (Article 3(9)). |
| **QTSP** | Qualified Trust Service Provider. A TSP that has successfully undergone the qualification process: CAB audit, supervisory body verification, and listing on the national Trusted List. QTSPs are subject to stricter requirements (Articles 20-24) and benefit from the presumption of compliance. They may use the EU Trust Mark and have higher liability thresholds. Profile: `qualified` in `trust-service-provider.yaml`. |
| **Non-Qualified TSP** | A Trust Service Provider that provides trust services (e-signatures, timestamps, etc.) but has not undergone the qualification process. Subject to baseline requirements only (Articles 13, 15, 19, 19a). No Trusted List entry. Lower assurance level but also lower regulatory burden. New in eIDAS 2.0: explicit risk management obligations per Article 19a. Profile: `non_qualified` in `trust-service-provider.yaml`. |
| **Trusted List** | The national register maintained by each Member State listing all QTSPs and their qualified trust services. Published per Article 22 with technical format per ETSI TS 119 612. Users can verify a TSP's qualified status by checking the Trusted List. The EU compiles a central list of all national lists. QTSPs may only begin providing qualified services AFTER being listed (Article 21(3)). |
| **EU Trust Mark** | An optional visual indicator that QTSPs may display to signal their qualified status. Defined in Article 23. Usage requires linking to the relevant Trusted List entry. Technical format specified in Implementing Decision 2015/1505. The mark provides consumer confidence but its use is voluntary — qualified status comes from Trusted List entry, not the mark itself. |
| **Cross-Cutting Requirement** | A compliance requirement that appears identically across multiple implementing acts. Rather than creating duplicate requirements, these are consolidated into a single entry with multiple regulation references in the `legalBasis.regulation` field (comma-separated). Example: Quarterly vulnerability scans appear in 2025/1929, 2025/1942, 2025/1943, 2025/1944, 2025/2532, 2025/1567 — consolidated as `TSP-IA-SEC-001`. |
| **Role Configuration** | The state model for multi-role selection in the RCA tool. Stored as `Map<roleId, profileIds[]>` where an empty profile array means "all profiles selected." Allows organizations to select multiple roles (e.g., Bank = Relying Party + EAA Issuer) and configure profiles per role. |
| **Source Roles** | An array on each requirement tracking which roles contributed that requirement during multi-role aggregation. Used for deduplication — a requirement shared by multiple roles appears once with `sourceRoles: ['relying_party', 'issuer']`. Enables requirement badges showing applicability. |
| **Design A (Multi-Role UI)** | The approved UX pattern for multi-role selection: rich icon cards with checkboxes and inline profile expansion. When a role card is selected, profile options appear directly within the card. Chosen over Design B (config panel below) for its direct visual connection between role and configuration. |
| **Atomic Category** | A requirement category representing exactly ONE type of legal obligation (e.g., `security`, `privacy`, `technical`). Contrast with combined categories like "eSignature & Trust Services" which mix service types with obligation types. The 12 atomic categories are defined in `categories.yaml`. See DEC-089. |
| **Category Taxonomy** | The fixed set of 12 atomic categories used to classify all 458 RCA requirements. Categories answer "what TYPE of obligation?" while use cases answer "in what SERVICE CONTEXT?" Defined globally in `config/rca/categories.yaml` — the single source of truth. |
| **Service-Facing Role** | An RCA role with direct exposure to end-user use cases, resulting in ~15% use-case-specific requirements. Includes Wallet Provider and Relying Party. These roles require semantic analysis during use case mapping. See DEC-088 Addendum. |
| **Infrastructure Role** | An RCA role whose obligations are independent of the services being provided — always 100% universal. Includes TSP, EAA Issuer, PID Provider, CAB, and Supervisory Body. Future use case audits can assume these roles are universal unless legal text explicitly mentions use cases. |
| **Infrastructure Universalism** | The pattern explaining why Infrastructure Roles have no use-case-specific requirements. Their obligations govern HOW to operate (certification, auditing, oversight), not WHAT services are provided. Key insight from the 7-phase use case mapping audit. |
| **QEAA Issuer** | An entity that issues Qualified Electronic Attestations of Attributes. By legal definition (Article 3(16)(f), 3(19), 3(20)), a QEAA Issuer IS a QTSP — they are legally identical. QEAA issuers must appear on national Trusted Lists and comply with both generic QTSP requirements (Articles 20-24) and QEAA-specific requirements (Articles 45d-45h, Annex V). In the RCA tool, organizations can select either "EAA Issuer (qualified)" alone or "TSP (qualified) + EAA Issuer (qualified)". |
| **Non-Qualified EAA Issuer** | An entity that issues electronic attestations of attributes without qualified status. They ARE trust service providers (Article 3(16)(f)) but are not QTSPs. Subject to baseline TSP requirements (Articles 13, 15, 19, 19a) plus EAA-specific rules (Articles 45e, 45g, 45h). Not listed on Trusted Lists. Lower assurance level suitable for non-critical attribute credentials. Profile: `non_qualified` in `issuer.yaml`. |
| **Public Authentic Source (PAS)** | A government body (or its designee) that issues electronic attestations of attributes from an authentic source (e.g., driver's license from DMV, diploma from education ministry). Legally distinct from TSPs: Article 45f requires PAS to meet "QTSP-equivalent reliability" but they are NOT QTSPs. Different notification mechanism — appear on a Commission-published list, not Trusted Lists. Not subject to TSP supervision (Articles 17-21). Must comply with Annex VII requirements. Profile: `public_authentic` in `issuer.yaml`. |
| **EAA Issuer Role** | The RCA role covering entities that issue electronic attestations of attributes to EUDI Wallets. Three profiles: `qualified` (QEAA providers — legally QTSPs), `non_qualified` (non-qualified EAA issuers), `public_authentic` (government authentic sources — NOT TSPs). Kept separate from TSP role for user convenience: PAS don't fit in TSP, and service types are orthogonal to provider status. See DEC-091 for full rationale. |
| **TSP/EAA Relationship** | The architectural decision (DEC-091) to maintain separate TSP and EAA Issuer roles despite QEAA issuers being legally QTSPs. Rationale: (1) Service types are orthogonal — a QTSP providing only e-signatures shouldn't have QEAA requirements, (2) PAS don't fit in TSP category, (3) User mental model matches role separation. Organizations needing both select TSP + EAA Issuer; the UI deduplicates. ~17 duplicated requirements exist for user convenience. |
| **Domain (RCA)** | A high-level grouping of related use cases in the RCA tool (e.g., "Core functionality", "Banking & payment", "Travel", "Health & social security"). 8 domains defined in `config/rca/use-cases.yaml` → `categories` section. Domains answer "in what SERVICE CONTEXT?" at the top level. Users first select domains, then see use cases within those domains. Not to be confused with Requirement Categories which classify the TYPE of obligation. |
| **Requirement Category (RCA)** | One of 12 atomic types of legal obligation used to classify and filter generated requirements (e.g., `security`, `privacy`, `registration`, `certification`). Defined in `config/rca/categories.yaml`. Contrasted with **Use Case** (service context) and **Domain** (grouping of use cases). The 12 categories answer "what TYPE of obligation?" — used AFTER requirements are generated for filtering, not for initial selection. |
| **Hybrid Selector Pattern** | A two-section UI pattern combining toggle chips for category/domain selection at top, and a flat grouped list of selectable items below. The chips act as filters (multi-select), while the list shows filtered items with full descriptions visible (no accordion collapse). Benefits: compact domain selection + visible descriptions + no hidden content. Implemented in RCA use case selector. |
| **Domain Chip** | A toggle button with inline checkbox visual used for multi-select domain filtering in the RCA tool. Replaced filter pills. Selected chips glow cyan with a visible checkmark. Clicking toggles the chip on/off (multi-select, not exclusive like tabs). CSS class: `.rca-domain-chip`. |
| **Intermediary (eIDAS)** | An entity that acts on behalf of Relying Parties to interact with EUDI Wallets. Per Article 5b(10), intermediaries are **legally deemed to be Relying Parties** with one critical additional constraint: they must **not store data about the content of the transaction** (the "no-storage" mandate). Implemented as two RP profiles: `uses_intermediary` (for RPs delegating to intermediaries) and `acts_as_intermediary` (for entities providing intermediary services). See research document: `docs/research/INTERMEDIARY_ROLE_ANALYSIS.md`. |
| **Verification Intermediary** | A distinct type of intermediary recognized in **2025/1569 Article 9** for proxying verification requests to authentic sources. Unlike Wallet Presentation Intermediaries (Art 5b(10)) who act on behalf of RPs, Verification Intermediaries are designated at national level to help EAA Issuers (QTSPs) verify attributes against authentic sources. Different legal basis, different actors. |
| **No-Storage Mandate** | The core restriction imposed on intermediaries by Article 5b(10): "shall not store data about the content of the transaction." This prohibition applies to the actual credential/attribute data being presented — not to operational logs or metadata. Implemented as requirement `RP-GOV-001` with `profileFilter: [acts_as_intermediary]`. |
| **Strong User Authentication (SUA)** | Authentication based on the use of at least two authentication factors categorised as knowledge, possession, and inherence that are independent, in that the breach of one does not compromise the reliability of the others, and is designed in such a way as to protect the confidentiality of the authentication data. Defined in **eIDAS 2.0 Article 3(51)**. Used broadly across all sectors in eIDAS legislation. Contrasted with SCA which is PSD2-specific. |
| **Strong Customer Authentication (SCA)** | Authentication based on the use of two or more elements categorised as knowledge, possession, and inherence that are independent, in that the breach of one does not compromise the reliability of the others, and is designed in such a way as to protect the confidentiality of the authentication data. Defined in **PSD2 Article 4(30)** and elaborated in **Commission Delegated Regulation (EU) 2018/389** (the RTS on SCA). PSD2-specific term for payment services; functionally equivalent to SUA but used exclusively in payment context. |
| **Access Certificate (RP)** | A Wallet-Relying Party Access Certificate that identifies the intermediary to the wallet ecosystem. Answers: "Who is making the connection?" Only the intermediary holds this certificate. Defined in 2025/848 Article 7 and Annex IV. |
| **Registration Certificate (RP)** | A Wallet-Relying Party Registration Certificate that expresses the intended use of data being requested. Answers: "Why is data being requested?" One certificate per RP per use case. The end-RP's identity and purpose are visible to wallet users even when using an intermediary. Defined in 2025/848 Article 8 and Annex V. |


---

## Vendor Compliance Questionnaire (VCQ)

| Term | Description |
|------|-------------|
| **VCQ** | Vendor Compliance Questionnaire. A portal tool that generates due diligence checklists for organizations procuring RP Intermediary services from vendors. Based on regulatory scope selection, produces tailored compliance questions. |
| **RP Intermediary** | ⚠️ **Updated per DEC-254**: A unified intermediary type that acts on behalf of Relying Parties to interact with EUDI Wallets. Per ARF Topic 52 (RPI_01-10), RP Intermediaries perform BOTH forwarding AND verification functions as a single role. The previous PIF/VIF distinction has been retired — it was not official terminology. Requirements prefix: `VEND-INT-*`. Legal basis: Article 5b(10). |
| **~~PIF~~** | ❌ **DEPRECATED (DEC-254)**: Presentation Intermediary Function was an internal term, not official regulatory terminology. Merged into RP Intermediary. |
| **~~VIF~~** | ❌ **DEPRECATED (DEC-254)**: Verification Intermediary Function was an internal term that incorrectly implied a connection to 2025/1569 Art. 9. Merged into RP Intermediary. The 2025/1569 "designated intermediary" is a DIFFERENT concept (QTSPs verifying against authentic sources during issuance). |
| **ICT Third-Party** | Information and Communication Technology Third-Party Service Provider. Under DORA (2022/2554), ICT third-party providers supporting financial entities have additional oversight requirements. When a VCQ user selects DORA source, +12 ICT requirements are automatically included. Requirements prefix: `VEND-ICT-*`. |
| **Criticality (VCQ)** | Priority classification for VCQ requirements: `critical` (must address immediately), `high` (address soon), `medium` (standard timeline), `low` (address when possible). Displayed in Summary View with color-coded cards. |
| **Source Selection** | VCQ configuration step where users select which regulatory sources to include in the questionnaire. Grouped into Primary (eIDAS), Implementing Acts, Related Regulations (DORA/GDPR), and Architecture (ARF). Selecting DORA auto-includes ICT third-party provisions. |
| **Source Group** | ⚙️ *Portal convention (DEC-255)*. The four high-level categories for VCQ requirement filtering: `eidas` (core regulation + implementing acts), `gdpr` (privacy requirements), `dora` (ICT/financial sector), `arf` (architecture guidance). Each requirement has a `sourceGroup` field used for tile-based source selection in the UI. |
| **HLR** | High-Level Requirement. The technical requirements defined in the ARF (Architecture Reference Framework) that specify how EUDIW components should behave. Each HLR has a unique ID (e.g., `RPI_07`, `OIA_12`) and belongs to a numbered Topic (1-55). VCQ requirements reference HLRs via the `arfReference` field. The portal imports 143 HLRs from 6 relevant topics. |
| **ARF Deep Link** | A URL that navigates directly to a specific HLR within the ARF GitHub documentation. Format: `https://github.com/.../annex-2.02-high-level-requirements-by-topic.md#a2330-topic-52-relying-party-intermediaries`. Generated by `import-arf.js` using topic-specific anchors. |
| **Legal Primacy (VCQ)** | ⚙️ *Design principle (DEC-256)*. Every VCQ requirement that stems from EU legislation must have a `legalBasis` field with regulation, article, and paragraph. ARF references are supplementary technical specs, not substitutes for legal authority. After 2026-01-26 audit, 100% of VCQ requirements have legislative backing. |
| **Additive Filter (VCQ)** | ⚙️ *UI behavior (DEC-256)*. VCQ source filters (Legal, Architecture) use **union** semantics — enabling multiple filters shows requirements matching ANY selected source, not intersection. Example: Legal ON + Architecture ON = all requirements with either source. |
| **Source Separation (VCQ)** | ⚙️ *Design principle (DEC-256)*. Legal sources (Regulation, Implementing Acts) and Architecture sources (ARF, ISO, W3C, ETSI) are **orthogonal hierarchies** in the VCQ tool. They don't blend — filters show content from the selected source only. Architecture sources are independent, not derived from Legal in the UI. |
| **RP-Only Requirement** | An RCA Relying Party requirement that cannot be delegated to an intermediary vendor. Examples: wallet acceptance decisions (Art 5f), identity matching logs (2025/846), security breach notifications (2025/847). These are excluded from VCQ because the RP must fulfill them directly. See RCA-VCQ mapping document for full list. |
| **Obligation (RFC 2119)** | The normative strength of a requirement, derived from modal verbs in the source text per [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119). Levels: `MUST`/`SHALL` (absolute requirement), `MUST NOT`/`SHALL NOT` (absolute prohibition), `SHOULD`/`RECOMMENDED` (recommended but exceptions exist), `SHOULD NOT` (not recommended), `MAY`/`OPTIONAL` (truly optional). Replaces subjective \"criticality\" levels in VCQ UI. |
| **Modal Verb** | A keyword in legal/regulatory text indicating requirement strength. Common EU modal verbs: \"shall\" (→MUST), \"must\" (→MUST), \"should\" (→SHOULD), \"may\" (→MAY), \"can\" (→MAY). Used by `deriveObligation()` in `build-vcq.js` to auto-classify requirements. Note: EU legal text heavily uses \"shall\", resulting in ~87% MUST obligations. |
| **Cross-cutting Reference** | ⚙️ *Portal convention*. A reference type (like ARF) that overlaps with legal source groups. Requirements with `arfReference` are counted in BOTH their legal source (eIDAS/GDPR/DORA) AND the ARF group. This means source group counts (116 + 28 + 78) sum to more than total unique requirements (144) because of overlap. See `determineSourceGroup()` in `build-vcq.js`. |
| **HLR Exclusion** | An ARF HLR documented as not applicable to vendors in the VCQ context. Stored in `config/vcq/hlr-exclusions.yaml` with reason codes: `wallet_provider` (obligation is on Wallet Provider), `member_state` (government responsibility), `user_behavior` (end-user action), `informative` (non-normative), `empty` (placeholder HLR with no specification), `rulebook_author` (credential rulebook responsibility). 329 HLRs are excluded from vendor mapping. RP-topic coverage is 100% (47 in VCQ + 70 excluded). |
| **Categorization Scheme** | ⚙️ *Portal convention*. A configurable grouping strategy for VCQ requirements. Two schemes: `functional` (6 categories by capability area: Registration, Usage, Security, etc.) and `role` (2 categories by organizational role: Relying Party, Issuer). Users can toggle between schemes via a UI dropdown. Scheme preference is persisted in `localStorage` under `vcq-categorization-scheme`. |
| **Functional Categorization** | The default VCQ grouping scheme that organizes requirements by functional area (Registration, Usage, Security, Governance, Privacy, Sustainability). Displays 6 category cards in Summary View. |
| **Role-Based Categorization** | An alternative VCQ grouping scheme that organizes requirements by organizational role (Relying Party, Issuer). Displays 2 category cards in Summary View. More useful when users have selected both RP and Issuer roles and want to see requirements organized by who must implement them. |
| **Effective Categories** | ⚙️ *Portal convention*. The dynamically computed list of categories based on the active categorization scheme and selected roles. For `functional` scheme, returns all 6 functional categories. For `role` scheme, returns only categories matching the selected roles (e.g., if only Issuer is selected, shows only Issuer category). Computed by `effectiveCategories` useMemo in VendorQuestionnaire.jsx. |
| **Universal Requirements (VCQ)** | Requirements that apply to both Relying Party and Issuer roles. In role-based categorization, these appear under \"Relying Party\" when both roles are selected, but under \"Issuer\" when only the Issuer role is selected — ensuring they remain visible regardless of role selection. Logic is implemented in `CATEGORIZATION_SCHEMES.role.getCategory()`. |

---

## Requirements Browser

| Term | Description |
|------|-------------|
| **Requirements Browser** | The `/requirements` route that provides a unified, searchable view of all compliance requirements across ARF HLRs, RCA, and VCQ sources. Features multi-dimensional filtering, export options, and shareable URLs. |
| **Legal Basis** | A structured reference linking a requirement to its source legislation. Contains `regulation` (e.g., "2014/910"), `article` (e.g., "Article 5b"), and `paragraph`. Used for the Legal Basis filter dimension. |
| **ARF Topic** | A numbered grouping within the ARF High-Level Requirements (1-55). Each topic covers a specific area (e.g., Topic 52 = Relying Party Intermediaries). Topics are filterable in the Requirements Browser. |
| **Compliance Level** | Classification of how binding a requirement is: `mandatory` (SHALL — must implement), `recommended` (SHOULD — implement unless justified), `optional` (MAY — discretionary). Derived from legal verb analysis. |
| **Harmonized ID** | The portal's normalized identifier format for ARF HLRs. Format: `HLR-{TOPIC_CODE}-{NUMBER}` (e.g., `HLR-WTE-01.01` for Wallet Trust Evidence topic). Differs from source IDs like `WTE_01`. |
| **Source (Requirements)** | The origin system for a requirement: `arf-hlr` (EC Architecture Framework), `rca` (Role Compliance Assessment), `vcq` (Vendor Compliance Questionnaire). Each source has its own data format and loading mechanism. |
| **Filter State URL** | A URL encoding the current filter selections via query parameters. Format: `?sources=rca&roles=relying_party&regulations=2014%2F910`. Enables bookmarking and sharing specific filtered views. |
| **Copy Link** | A button that copies the current filtered URL to the clipboard, allowing users to share or bookmark the exact filter state. |

---

## See Also

- [DECISIONS.md](DECISIONS.md) - Architectural and design decisions
- [AGENTS.md](AGENTS.md) - AI agent guidelines
- [TRACKER.md](TRACKER.md) - Implementation progress tracking
| **Amendment Context Detection** | The pattern used by `process_list_with_quotes` to determine when P elements should be blockquoted. P content is blockquoted only when the instruction text (from TXT element) contains amendment keywords: 'replaced', 'inserted', 'added', 'deleted', 'amended as follows'. Otherwise P is rendered as regular continuation paragraph. This prevents consolidated regulation content (like Article 7(f) sub-paragraphs) from being incorrectly blockquoted. See DEC-095 and 2026-01-21 converter fixes. |
