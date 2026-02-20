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

---

## Extract Clean Text from Single-Line XML/HTML

EUR-Lex XHTML files from the Cellar API are often a **single giant line**, making `grep` output unreadable. Use Python to strip tags and extract readable text.

### Find All Occurrences of a Pattern

```bash
python3 -c "
import re
with open('/tmp/eurlex_CELEX.xhtml', 'r') as f:
    content = f.read()
for m in re.finditer(r'ANNEX', content, re.IGNORECASE):
    pos = m.start()
    start = max(0, pos - 50)
    end = min(len(content), pos + 300)
    snippet = content[start:end]
    clean = re.sub(r'<[^>]+>', ' ', snippet)
    clean = re.sub(r'\s+', ' ', clean).strip()
    print(f'Position {pos}: {clean[:200]}')
    print()
"
```

### Extract a Section to Clean Text

```bash
python3 -c "
import re
with open('/tmp/eurlex_CELEX.xhtml', 'r') as f:
    content = f.read()
idx = content.upper().find('ANNEX')
section = content[idx:]
clean = re.sub(r'<[^>]+>', '\n', section)
lines = [l.strip() for l in clean.split('\n') if l.strip()]
print('\n'.join(lines))
"
```
