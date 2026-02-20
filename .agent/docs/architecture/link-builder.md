# Link Builder & Deep Link Reference

> Extracted from AGENTS.md — reference for URL generation and deep linking.

---

## Centralized Link Builder (DEC-226 — MANDATORY)

**All portal URL generation MUST use the centralized link builder utility.**

Location: `docs-portal/src/utils/linkBuilder.js`

**Why this exists:** URL generation was scattered across 10+ files with inconsistent formats, causing recurring deep-link bugs.

### HashRouter URL Format

| Context | Format | Example |
|---------|--------|---------|
| **Internal** (`<Link to=...>`) | `/regulation/{slug}?section={id}` | `/regulation/2014-910?section=article-5a` |
| **External/Href** (templates) | `#/regulation/{slug}?section={id}` | `#/regulation/2014-910?section=article-5a` |
| **Full URL** (clipboard) | `{origin}/#/regulation/{slug}?section={id}` | `https://example.com/#/regulation/2014-910?section=article-5a` |

**⚠️ NEVER use HTML fragment anchors:**
- ❌ WRONG: `/regulation/2014-910#article-5a` (breaks with HashRouter)
- ✅ CORRECT: `/regulation/2014-910?section=article-5a`

### Available Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `buildDocumentLink(slug, options)` | Regulation/IA links | `/regulation/{slug}?section=...` |
| `buildTerminologyLink(options)` | Terminology links | `/terminology?section=term-...` |
| `buildRCALink(options)` | RCA tool links | `/rca?role=...&profile=...` |
| `buildSectionId(article, paragraph)` | Build anchor ID | `article-5a-para-1-point-b` |
| `toHref(internalPath)` | For template strings | `#/regulation/...` |
| `toExternalUrl(internalPath)` | For clipboard | `https://.../#/regulation/...` |

**Anti-patterns:**
- ❌ Building URLs inline: `` `/${type}/${slug}#article-5a` ``
- ❌ Concatenating paths manually without the utility
- ❌ Using `#article-*` anchors instead of `?section=`

**Correct pattern:**
```javascript
import { buildDocumentLink, buildSectionId, toHref } from '../utils/linkBuilder';

// For React Router <Link>
<Link to={buildDocumentLink('2014-910', { section: 'article-5a' })} />

// For template strings (href in HTML)
const href = toHref(buildDocumentLink('2014-910', { section: 'article-5a' }));
```

---

## Deep Link Anchor ID Convention

When building deep links to legal content, use these ID patterns:

| Element | Anchor Format | Example |
|---------|---------------|---------|
| **Article** | `article-{num}` | `article-5a` |
| **Paragraph** | `...-para-{num}` | `article-5a-para-1` |
| **Point** | `...-point-{letter}` | `article-5a-para-1-point-a` |
| **Subpoint** | `...-subpoint-{roman}` | `article-5a-para-1-point-a-subpoint-i` |
| **Annex paragraph** | `annex-{id}-para-{num}` | `annex-v-para-3` |
| **Annex section header** | `annex-{id}-section-{num}` | `annex-para-section-1` |

**Key distinction:**
- `-para-` is for standard content references (used 99% of the time)
- `-section-` is ONLY for numbered section headers in annexes (e.g., "1. Set of data...")

### Alphanumeric Paragraphs (1a, 1b, 1c)

EU legislation uses alphanumeric paragraphs when amendments insert content between existing paragraphs.

| Format | Works? | Why |
|--------|--------|-----|
| `- (1a) Text...` | ✅ | Recognized as list item with paragraph identifier |
| `1a. Text...` | ❌ | Rendered as plain paragraph, no deep-link anchor |

**The markdown source MUST use `- (1a)` list format** for `rehype-paragraph-ids.js` to generate anchors.

**If you see missing gutter icons on alphanumeric paragraphs:**
1. Check markdown source — is it `1a.` or `- (1a)`?
2. Fix the format in the markdown file
3. Rebuild with `npm run build:documents`

---

## EUR-Lex Deep Link Anchors

When linking to **external** EU documents on EUR-Lex, use these anchor patterns:

| Target | Anchor Format | Example |
|--------|---------------|---------|
| **Article** | `#art_{N}` | `#art_5` |
| **Article + Paragraph** | `#{NNN}.{MMM}` (zero-padded) | `#005.001` for Art 5(1) |
| **Recital** | `#rct_{N}` | `#rct_26` |
| **Chapter** | `#cpt_{N}` | `#cpt_II` |

**⚠️ LIMITATION:** Definition points `(a)`, `(b)` and numbered lists `(1)`, `(2)` within articles do NOT have individual anchors. You can only link to the article itself.

**URL format:**
```
https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:{CELEX}#{anchor}
```

**Example URLs:**
- Article 5 of Comitology: `...CELEX:32011R0182#art_5`
- Article 33(1) of DSA: `...CELEX:32022R2065#033.001`
- DMA Article 2: `...CELEX:32022R1925#art_2`

**Registry:** External documents are listed in `docs-portal/config/external-documents.yaml`.
