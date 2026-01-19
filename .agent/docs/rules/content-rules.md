# Content Rules (Rules 26-44)

Formex/HTML conversion, legal document handling, build pipeline, and content-specific rules.

---

## 26. AST Traversal Pitfall: Ancestors Don't Include Current Node

**When using `visitParents` or similar AST visitors, the `ancestors` array does NOT include the current node.**

```javascript
// ❌ WRONG: Node is never in its own ancestors!
visitParents(tree, 'element', (node, ancestors) => {
    const index = ancestors.findIndex(a => a === node);
    // index is ALWAYS -1! The node is not its own ancestor.
});

// ✅ CORRECT: Ancestors are the PARENTS of the node
visitParents(tree, 'element', (node, ancestors) => {
    // ancestors[0] = root, ancestors[last] = direct parent of node
    const hasListAncestor = ancestors.some(a => 
        a.type === 'element' && ['ul', 'ol', 'li'].includes(a.tagName)
    );
});
```

---

## 27. Formex Archive Structure (EUR-Lex XML Downloads)

**Formex ZIP archives contain multiple XML files with specific naming patterns:**

| Pattern | Description | Example |
|---------|-------------|---------|
| `.000101.fmx.xml` | **Main document** (regulation body) | `L_202402982EN.000101.fmx.xml` |
| `.000XYZ.fmx.xml` | **Supplementary content** (annexes) | `L_202402982EN.000701.fmx.xml` |
| `.doc.fmx.xml` | Document metadata (skip) | `L_202402982EN.doc.fmx.xml` |
| `.toc.fmx.xml` | Table of contents (skip) | `L_202402982EN.toc.fmx.xml` |
| `.0001.xml` | Alternative main pattern (consolidated) | `CL2014R0910EN0020030.0001.xml` |

**Important:** Annexes are stored in **separate XML files**, not embedded in the main document. A regulation with 5 annexes will have 6+ XML files in the archive.

**Pipeline validation:** The pipeline validates that if annex XML files are found, the output markdown contains `## Annex` headings. See `validate_annex_extraction()` in `pipeline.py`.

---

## 28. Fix Cause, Not Symptom (MANDATORY — After Any Bug Fix)

**When fixing issues, always address the ROOT CAUSE in the permanent codebase, not just the symptoms.**

**Anti-pattern: One-Time Fix Script**
```bash
# ❌ WRONG: One-time script fixes current data but doesn't fix the pipeline
python batch_fix_annexes.py  # Fixes 20 documents
rm batch_fix_annexes.py      # Script deleted
# Next pipeline run: Same 20 documents are broken again!
```

**Correct pattern: Systemic Fix**
```bash
# ✅ CORRECT: Fix the pipeline itself
# 1. Identify root cause (pipeline only extracts main XML, ignores annexes)
# 2. Fix the pipeline (extract_formex returns all XML files)
# 3. Add validation (prevent regression)
# 4. Re-run pipeline (all documents now correct)
```

**Decision framework:**

| Question | If Yes → | If No → |
|----------|----------|---------|
| Will the issue recur if the pipeline runs again? | Fix the pipeline | One-time script OK |
| Does the fix need to apply to future documents? | Fix the pipeline | One-time script OK |
| Does the fix involve data transformation logic? | Fix the converter | One-time script OK |

---

## 29. Script Deletion Checklist (MANDATORY — Before Removing Fix Scripts)

**Before deleting any one-time fix script, verify the root cause was addressed:**

| Check | Question |
|-------|----------|
| ✅ Pipeline fixed? | Did we modify the build/conversion pipeline to prevent recurrence? |
| ✅ Validation added? | Is there automated validation that would catch this issue? |
| ✅ All documents rebuilt? | Did we re-run the pipeline on ALL affected documents? |
| ✅ TRACKER updated? | Did we remove any backlog items that reference this script? |

**If ANY check fails:** The root cause was NOT fixed.

---

## 30. Build Script Cache Invalidation (GOTCHA)

**Build scripts with hash-based caching (like `build-citations.js`) only detect SOURCE CONTENT changes, not SCRIPT LOGIC changes.**

**Problem:**
```bash
# You fix a bug in build-citations.js (e.g., route path typo)
# You run: node scripts/build-citations.js
# Output: "⚡ Cache hits: 33" — all files skipped!
# The fix wasn't applied because source markdown didn't change
```

**Solution in this project:**

1. **Bump CACHE_VERSION** in the build script when changing output-affecting logic:
   ```javascript
   // In build-citations.js (and similar scripts with caching)
   const CACHE_VERSION = '1.0.2';  // Bump this when you change script logic
   ```

2. **Manual cache clear** if you forget to bump version:
   ```bash
   rm public/data/citations/*.json && node scripts/build-citations.js
   ```

**Route Path Convention:**
This project uses **singular** route paths:
- ✅ `/regulation/` (not `/regulations/`)
- ✅ `/implementing-acts/` (already correct)

---

## 31. Directory Naming Gotcha (02_implementing_acts/)

**Folder names in `02_implementing_acts/` don't always match the CELEX number or document title exactly.**

**Example:**
```
CELEX: 32025R0848
Document: "Wallet-Relying Party Registration"
Folder: 2025_0848_Notified_Wallet_List/  ← Name doesn't match!
```

**Why this matters:** When searching for a document by CELEX, use `find` or `grep` with partial match:
```bash
find 02_implementing_acts -name "*0848*" -type d
```

---

## 32. Inline vs Standalone QUOT.* Detection (Formex Converter)

**QUOT.START/QUOT.END elements can appear in two contexts with different rendering:**

| Context | Example XML | Rendered As |
|---------|-------------|-------------|
| **Inline** (abbreviation) | `...interface (<QUOT.START/>API<QUOT.END/>)` | `...interface ('API')...` |
| **Standalone** (amendment) | `<ALINEA><QUOT.S><P>Replacement text</P></QUOT.S></ALINEA>` | `> Replacement text` (blockquote) |

**Detection rule in `process_alinea_nested()`:**
```python
# If ALINEA has text BEFORE the QUOT.START element → inline quote
if alinea_elem.text and alinea_elem.text.strip():
    has_inline_quotes = True  # Render via get_element_text()
else:
    has_standalone_quotes = True  # Render as blockquote
```

---

## 33. Legal Document Import Protocol (MANDATORY — No Manual Markdown Creation)

**NEVER manually create or type legal document Markdown files. ALL legal documents must be imported via the conversion pipelines.**

**Available pipelines:**
| Source Format | Tool | Usage |
|---------------|------|-------|
| **Formex XML** (preferred) | `scripts/pipeline.py` | Documents with `cellar_id` in `documents.yaml` |
| **EUR-Lex HTML** | `scripts/eurlex_html_to_md.py` | Older documents or those without Formex XML |

**Import protocol:**
1. **Check for Formex XML first** — most 2020+ documents have it via cellar
2. **Find the cellar_id** — look in EUR-Lex page source for `cellar:UUID` or use `discover_cellar_ids.py`
3. **Add to `documents.yaml`** — register the document with `cellar_id` for reproducible builds
4. **Run `pipeline.py --only CELEX`** — import via the proper pipeline
5. **Run `npm run build:content`** — verify the import works in portal

**Anti-patterns:**
- ❌ Transcribing legal text by hand from EUR-Lex webpage
- ❌ Copy-pasting content into a new `.md` file
- ❌ Creating markdown "from scratch" even if carefully copied
- ❌ Using `read_url_content` and reformatting as markdown

**Why this is MANDATORY:**
- **Reproducibility** — imports can be re-run when pipelines are improved
- **Accuracy** — parsers preserve structure; humans make transcription errors  
- **Auditability** — `cellar_id` in `documents.yaml` documents exact source version
- **Automation** — batch re-imports are possible when formats change

---

## 34. Citations Auto-Update When New Documents Are Added

The citation system now **automatically invalidates caches** when new documents are added to the portal.

**How it works:**
- `build-citations.js` includes a hash of the document registry in its cache key
- When a new document is added, the registry hash changes
- This invalidates all citation caches, forcing a full rebuild
- Citations that previously showed "View on EUR-Lex" will now show "View in Portal"

**Standard import workflow:**
```bash
# 1. Import the document (via pipeline or HTML parser)
python scripts/pipeline.py --only 32015R1501
# OR
python3 scripts/eurlex_html_to_md.py 32015R1501 01_regulation/2015_1501_eIDAS_Interoperability

# 2. Add to documents.yaml (if not already)
# Edit scripts/documents.yaml

# 3. Rebuild content (creates new JSON file)
cd docs-portal && npm run build:content

# 4. Rebuild citations (auto-invalidated by registry hash)
npm run build:citations

# 5. Rebuild content again (picks up updated citations)
npm run build:content
```

---

## 34a. EUR-Lex HTML Import Workflow (for older documents)

Some older documents don't have Formex XML available (no `cellar_id`). Use the HTML converter:

**Step 1: Identify the document**
- Find the CELEX number (e.g., `32015R1501`)
- Determine the legal type (regulation, implementing_regulation, delegated_regulation)
- The script auto-detects type from the HTML title

**Step 2: Run the HTML converter**
```bash
python3 scripts/eurlex_html_to_md.py 32015R1501 01_regulation/2015_1501_eIDAS_Interoperability
```

**Step 3: Add to documents.yaml**
```yaml
- celex: 32015R1501
  title: Commission Implementing Regulation on the interoperability framework
  shortTitle: eIDAS Interoperability Framework
  legalType: implementing_regulation
  category: referenced
  source: html  # Indicates HTML source, not Formex
  output_dir: 01_regulation/2015_1501_eIDAS_Interoperability
```

**Step 4: Build content and citations**
```bash
cd docs-portal
npm run build:content
npm run build:citations
npm run build:content  # Again to pick up updated citations
```

**Supported regulation types:**
| Type | ELI Path | Example |
|------|----------|---------|
| Regulation | `/eli/reg/YYYY/NNN/oj` | 32014R0910 |
| Implementing Regulation | `/eli/reg_impl/YYYY/NNN/oj` | 32015R1501 |
| Delegated Regulation | `/eli/reg_del/YYYY/NNN/oj` | (future) |

---

## 35. Formex Document Structure Patterns

Different EU document types use different Formex XML structures:

| Document Type | CELEX Pattern | Main Content | Example |
|---------------|---------------|--------------|---------|
| **Regulation** | `3YYYYR...` | `<ARTICLE>` tags | 32024R1183 |
| **Implementing Regulation** | `3YYYYR...` | `<ARTICLE>` tags | 32024R2977 |
| **Recommendation** | `3YYYYH...` | `<GR.SEQ>` tags | 32021H0946 |
| **Decision** | `3YYYYD...` | `<ARTICLE>` or `<GR.SEQ>` | 32025D2164 |

**CELEX type codes:**
- `R` = Regulation (legally binding)
- `H` = Recommendation (non-binding)
- `D` = Decision (binding on addressees)
- `L` = Directive (goals binding, implementation left to MS)

---

## 36. Citation Display Text Preservation (MANDATORY — No Paraphrasing Legal References)

**When creating citation links, the displayed link text must preserve the EXACT original legal text as it appears in the source document.**

**Example:**
```
Source text: "...carried out under Commission Recommendation (EU) 2021/946 [full citation...]"

❌ WRONG: Replace with shortened text
   <span>Recommendation 2021/946</span>

✅ CORRECT: Preserve original inline text  
   <span>Commission Recommendation (EU) 2021/946</span>
```

**What to capture vs exclude:**

| Include in Link | Exclude from Link |
|-----------------|-------------------|
| `Commission Recommendation (EU) 2021/946` | ❌ `of the European Parliament and of the Council` |
| `Regulation (EU) No 910/2014` | ❌ `amending Directive...` |
| `Commission Implementing Regulation (EU) 2024/2977` | ❌ Any text after the number/year |

---

## 37. EUR-Lex HTML CSS Class Reference (Parser Development)

**When developing or debugging the EUR-Lex HTML parser (`eurlex_html_to_md.py`), reference these CSS classes:**

| Class | Element Type | Location |
|-------|-------------|----------|
| `oj-doc-ti` | Document title, ANNEX header | Top of document, annex divs |
| `oj-ti-art` | Article number | `<p>Article 1</p>` |
| `oj-sti-art` | Article title/subtitle | `<p>Subject matter</p>` |
| `oj-ti-grseq-1` | Annex title OR numbered section heading | Annexes: *italic title* or **1. Section heading** |
| `oj-normal` | Regular paragraph content | Body text, definitions |
| `oj-enumeration-spacing` | Enumerated content container | `<div>` wrapping inline `<p>` elements |
| `oj-note` | Footnotes | Bottom of articles |
| `oj-bold` | Bold text (inside `<span>`) | Emphasis in titles |

---

## 38. HTML vs Formex Parser Selection

**Choose the appropriate parser based on the EUR-Lex source format:**

| Criterion | Use Formex Parser | Use HTML Parser |
|-----------|-------------------|-----------------|
| **Source availability** | Formex XML available (`DOC_1` package) | Only HTML available |
| **Document complexity** | Complex structure (nested annexes, tables) | Simple articles only |
| **Metadata extraction** | Full metadata in XML | Extract from HTML elements |
| **Preferred for** | Implementing Acts (newer) | Older regulations, fallback |

**Formex is preferred when available** because:
- Structured XML is unambiguous
- Metadata is machine-readable
- Annex structure is explicit

---

## 39. Article Heading Format (ToC Clarity)

**Article headings must NOT include the article title in the same line.**

❌ **WRONG (clutters ToC):**
```markdown
### Article 1 — Subject matter
```

✅ **CORRECT (clean ToC, title as bold subtitle):**
```markdown
### Article 1

**Subject matter**
```

**Why this matters:**
- The Table of Contents shows H2/H3 headings
- "Article 1 — Subject matter — Definition of..." is too long for TOC
- Formex parser uses this format; HTML parser must match

---

## 40. Annex Point Format (Gutter Icons Requirement)

**Annex points must use Markdown list format for gutter icons to appear.**

❌ **WRONG (no gutter icons):**
```markdown
(a) current family name(s);

(b) current first name(s);
```

✅ **CORRECT (gutter icons work):**
```markdown
- (a) current family name(s);
- (b) current first name(s);
```

**Why this matters:**
- The `rehype-paragraph-ids.js` plugin assigns IDs to `<li>` elements
- Gutter icons (🔗 📜) require linkable IDs
- Plain paragraphs don't get IDs assigned

---

## 41. Slug Format Convention (DEC-083)

**All document slugs must use `{year}-{number}` format.**

| Component | Format | Example |
|-----------|--------|---------|
| **Directory name** | `{year}_{number}_{Description}` | `2014_910_eIDAS_Consolidated` |
| **URL slug** | `{year}-{number}` | `2014-910` |
| **CELEX → slug** | Year extracted first | `32014R0910` → `2014-910` |

**Why year-first:**
- Matches ELI URI structure (`eli/reg/2014/910`)
- Enables direct Quick Jump matching from ELI references
- Consistent sort order (chronological)

**Anti-patterns:**
- ❌ `910-2014` (number-first — legacy format)
- ❌ `910_2014_...` (legacy directory naming)

---

## 42. CSS Specificity Cascade (Accessibility Rules Override)

**When adding CSS rules, check the end of `index.css` for accessibility-related combined rules that may override your changes.**

**Problem:**
```css
/* Line 770: You add this */
.sidebar-nav-link {
    align-items: flex-start; /* Icon at top of text */
}

/* Line 1375: Accessibility rule at bottom of file */
.sidebar-nav-link,
.btn,
.some-other-element {
    align-items: center; /* WCAG touch targets - overrides! */
}
```

**Why this happens:** CSS specificity is equal for identical selectors, so the LAST rule wins. Accessibility rules at the bottom of stylesheets have the final word.

**Solution:** Either:
1. Add your rule AFTER the accessibility rule
2. Use a more specific selector (e.g., `.sidebar .sidebar-nav-link`)
3. Update the accessibility rule to exclude your element

---

## 43. EUR-Lex HTML Parser Gold Standard (765/2008 Pattern)

**When the HTML parser outputs documents, they should match the structure of successfully converted documents like Accreditation Regulation (765/2008).**

**Gold standard structure:**
```markdown
> **CELEX:** ... | **Document:** ...
> **Source:** [EUR-Lex](...)
> **EEA Relevance:** Yes  ← If applicable

# TITLE

## Preamble

THE EUROPEAN COMMISSION,

*Having regard to...*

Whereas:

## Recitals

- (1) First recital...

## Enacting Terms

### Article 1

**Subject matter**
```

**Key patterns:**
- EEA relevance in metadata blockquote (not body text)
- Date/subject NOT repeated after H1 title
- Preamble heading FIRST, then institutional body
- "Having regard" clauses in italics
- Recitals as list items (for gutter icons)

**See:** `01_regulation/2008_765_Market_Surveillance/02008R0765.md` as reference.

---

## 44. Blockquote Spacing (Last Paragraph Margin)

**All blockquotes need the last paragraph's margin removed to prevent asymmetric spacing.**

```css
/* Always include this rule for blockquotes in rich text */
.regulation-content blockquote p:last-child {
    margin-bottom: 0;
}
```

**Why:** Blockquotes have `padding: 16px`. The last `<p>` inside also has `margin-bottom: 16px`. This creates 32px at the bottom vs 16px at the top — visually unbalanced.

**Applies to:** Consolidation notices, amendment blockquotes, any block-level quoted content.

---

## 45. Chapter Extraction from Formex DIVISION Elements (ToC Grouping)

**Some Formex documents contain `DIVISION` elements that represent chapters. These must be extracted with a specific heading format for the portal's collapsible Table of Contents.**

### When This Applies

| Document Type | Has Chapters? | Extraction Required? |
|---------------|---------------|---------------------|
| Most implementing acts | No (flat structure) | No |
| Complex regulations (e.g., 2024/2981 Certification) | Yes (`DIVISION` elements) | **Yes** |
| Main regulations (eIDAS 910/2014) | Yes (hardcoded in `CollapsibleTOC.jsx`) | N/A |

### Required Markdown Format

The `CollapsibleTOC.jsx` component dynamically extracts chapters using this regex pattern:

```javascript
const chapterPattern = /^([IVXLCDM]+)\.\s+(.+)$/;  // Matches "I. General Provisions"
```

**Therefore, the Formex converter must output chapters as:**

```markdown
## I. GENERAL PROVISIONS       ← h2 with "RomanNumeral. Title"

### Article 1                  ← h3 for articles inside chapters
**Subject matter and scope**
```

**NOT this (incorrect — won't trigger ToC grouping):**
```markdown
### CHAPTER I                  ← h3 doesn't match pattern
**GENERAL PROVISIONS**         ← subtitle as bold, not in header

### Article 1                  ← Same level as chapter = no nesting
```

### How the Formex Converter Handles This

The `extract_divisions_with_articles()` function in `formex_to_md_v3.py`:

1. Finds `DIVISION` elements within `ENACTING.TERMS`
2. Extracts `TITLE/TI` (e.g., "CHAPTER I") and `TITLE/STI` (e.g., "GENERAL PROVISIONS")
3. Parses Roman numeral from "CHAPTER X" using regex
4. Outputs as `## {numeral}. {subtitle}` (e.g., `## I. GENERAL PROVISIONS`)
5. Articles within divisions use `### ` (h3) level

### Prevention of Recurrence

**This is now handled generically** — any Formex document with `DIVISION` elements will automatically get proper chapter headings. No per-document configuration needed.

**To verify chapter extraction after import:**
```bash
grep -E "^## [IVXLCDM]+\." path/to/document.md | head -10
```

If chapters exist in source but this returns nothing, the converter needs debugging.
