# Text Processing Snippets

## YAML Block Scalar Normalization

When exporting text from YAML files that use block scalars (`|`), literal line breaks are preserved. This causes awkward mid-sentence breaks in Excel cells and other export formats.

### Problem

YAML source:
```yaml
explanation: |
  Any entity acting as an intermediary must register as a Relying Party with 
  Member State authorities according to Topic 27 requirements, while explicitly 
  indicating its intent to act as an intermediary.
```

Without normalization, Excel shows:
```
Any entity acting as an intermediary must register as a Relying Party with
Member State authorities according to Topic 27 requirements, while explicitly
indicating its intent to act as an intermediary.
```

### Solution

JavaScript function to normalize YAML text for export:

```javascript
/**
 * Normalize YAML block scalar text for export (Excel, Markdown, etc.)
 * 
 * ⚠️ YAML block scalars (|) preserve literal line breaks from the source file.
 * This causes awkward mid-sentence breaks in exports. This function:
 * 1. Preserves intentional paragraph breaks (double newlines)
 * 2. Converts single newlines to spaces (prose continuation)
 * 3. Cleans up any resulting double spaces
 * 
 * @param {string} text - Raw text from YAML
 * @returns {string} - Normalized text suitable for export
 */
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove **bold** markdown
        .replace(/\*([^*]+)\*/g, '$1')      // Remove *italic* markdown
        .replace(/\n\s*\n/g, '\n\n')        // Preserve paragraph breaks (double newline)
        .replace(/(?<!\n)\n(?!\n)/g, ' ')   // Convert single newlines to spaces
        .replace(/  +/g, ' ')               // Collapse multiple spaces
        .trim();
}
```

### Usage

Used in:
- `src/utils/vcq/exportExcel.js` - VCQ Excel export
- `src/utils/rca/exportExcel.js` - RCA Excel export (if applicable)

### Regex Explanation

| Pattern | Purpose |
|---------|---------|
| `/\n\s*\n/g` → `'\n\n'` | Normalize paragraph breaks (2+ newlines with optional whitespace) |
| `/(?<!\n)\n(?!\n)/g` → `' '` | Match single `\n` NOT preceded/followed by another `\n` (uses lookbehind/lookahead) |
| `/  +/g` → `' '` | Collapse any resulting double spaces |
