# HTML Legal Definitions Template

Use this template for regulations that require **exact notation preservation** (non-consecutive numbering, `N.` format instead of `(N)`).

## When to Use

- Source document uses `N. 'term'` format (e.g., Regulation 765/2008)
- Paragraph numbers have gaps (repealed provisions)
- Standard markdown would renumber items incorrectly

## Template

```html
<!-- ⚠️ LEGAL FIDELITY WARNING (Rule 19, DEC-057):
     This section uses raw HTML to preserve the exact EUR-Lex notation.
     The "N. 'term'" format must NOT be changed to "(N)".
     Standard markdown would renumber the list items.
     IDs are explicit to enable deep linking from the Terminology page. -->
<ul class="legal-definitions">
<li id="article-2-para-3" class="linkable-paragraph" data-para="3" data-article="article-2">3. 'manufacturer' means any natural or legal person who manufactures a product or has a product designed or manufactured;</li>

<li id="article-2-para-4" class="linkable-paragraph" data-para="4" data-article="article-2">4. 'authorised representative' means any natural or legal person...</li>

<li id="article-2-para-8" class="linkable-paragraph" data-para="8" data-article="article-2">8. 'technical specification' means a document that prescribes...</li>
</ul>
```

## Required Attributes

| Attribute | Format | Example |
|-----------|--------|---------|
| `id` | `article-{N}-para-{P}` | `article-2-para-10` |
| `class` | `linkable-paragraph` | enables gutter icons |
| `data-para` | paragraph number | `10` |
| `data-article` | article ID | `article-2` |

## Terminology Extraction

The `build-terminology.js` pattern handles HTML format:
```javascript
const defPatternNumbered = /(?:^|>)(\d+)\.\s+'([^']+)'\s*means\s+([^;.<\n]+)/gm;
```

The `(?:^|>)` allows matching at line start OR after `>` (closing tag).

## Related

- **Rule 19** (AGENTS.md): Legal Document Visual Fidelity
- **Rule 20** (AGENTS.md): Markdown Numbered List Renumbering
- **DEC-057** (DECISIONS.md): HTML-based definitions for legal notation fidelity
