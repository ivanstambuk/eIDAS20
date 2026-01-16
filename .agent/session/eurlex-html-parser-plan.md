# Implementation Plan: EUR-Lex HTML to Markdown Parser

> **Goal**: Create a deterministic, scriptable HTML converter that produces Markdown **identical in structure** to the Formex XML converter, enabling unified enrichment and downstream processing.
> 
> **Estimated Time**: 3-4 hours
> **Priority**: High (blocks future referenced regulation ingestion)

---

## Context & Problem Statement

### Current State
- **Formex converter** (`formex_to_md_v3.py`): Handles ~95% of EUR-Lex documents
- **Manual HTML extraction** (one-time): Used for 765/2008 because no Formex XML exists
- **Problem**: The manual extraction is non-repeatable, can't receive enrichments, and doesn't scale

### Why This Matters
1. **Format drift**: If Formex converter adds features (paragraph IDs, citation linking), 765/2008 won't get them
2. **Scalability**: Adding more HTML-only regulations (768/2008, GDPR, etc.) requires manual work
3. **Enrichment gap**: Downstream build scripts expect consistent Markdown structure

### Evidence: Formex Unavailable for 765/2008
```python
# Tested 2026-01-16
from eurlex_formex import get_formex_url
result = get_formex_url('32008R0765')
# Returns: None (Formex not available for older regulations)
```

---

## Target Output Format

The HTML parser MUST produce Markdown matching the Formex converter's output. Reference: `01_regulation/910_2014_eIDAS_Consolidated/02014R0910-20241018.md`

### Required Structure

```markdown
> **CELEX:** 32008R0765 | **Document:** Regulation (EC) No 765/2008
> 
> **Source:** [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2008/765/oj/eng)
> **Official Journal:** OJ L 218, 13.8.2008, pp. 30–47
> **ELI:** http://data.europa.eu/eli/reg/2008/765/oj
> **In force:** Current consolidated version: 16/07/2021

# Regulation (EC) No 765/2008 of the European Parliament and of the Council

**of 9 July 2008**

**setting out the requirements for accreditation and market surveillance...**

*(Text with EEA relevance)*

---

THE EUROPEAN PARLIAMENT AND THE COUNCIL OF THE EUROPEAN UNION,

Having regard to the Treaty...

## Preamble

Whereas:

(1) It is necessary to ensure that products...

(2) ...

## Enacting Terms

## CHAPTER I — GENERAL PROVISIONS

### Article 1 — Subject matter and scope

1. This Regulation lays down rules...

- (a) first point...
- (b) second point...

### Article 2 — Definitions

For the purposes of this Regulation the following definitions shall apply:

- 1. 'making available on the market' means...
- 2. 'placing on the market' means...

## ANNEX I

### Requirements applicable to...

## ANNEX II

### CE marking

---

## Source Reference

- **CELEX Number:** 32008R0765
- **Source:** EUR-Lex (HTML)
...
```

### Critical Format Requirements

| Element | Format | Example |
|---------|--------|---------|
| **Chapters** | `## CHAPTER I — Title` | `## CHAPTER II — ACCREDITATION` |
| **Articles** | `### Article N — Title` | `### Article 2 — Definitions` |
| **Paragraphs** | `N. Text...` | `1. This Regulation lays down rules...` |
| **Points** | `- (a) text...` | `- (a) the conditions under which...` |
| **Subpoints** | `  - (i) text...` | `  - (i) list item nested` |
| **Definitions** | `- N. 'term' means...` | `- 1. 'making available on the market' means...` |
| **Recitals** | `(N) Text...` | `(1) It is necessary to ensure...` |
| **Annexes** | `## ANNEX I` | `## ANNEX II` |

---

## Technical Approach

### Phase 1: HTML Source Analysis (30 min)

**Objective**: Map EUR-Lex HTML structure to Markdown elements

**EUR-Lex HTML URL Pattern**:
```
https://eur-lex.europa.eu/eli/reg/2008/765/oj/eng
```

**Key HTML selectors to investigate**:
- Title: `<p class="title-doc-...">` or `<div id="title">`
- Preamble/Recitals: `<p class="oj-normal">` with `(N)` prefix
- Chapters: `<p class="sti-art">` or `<p class="ti-section-..."`
- Articles: `<p class="ti-art">` and `<p class="sti-art">`
- Paragraphs: `<p class="oj-normal">` with number prefix
- Points: `<p class="oj-ti-grseq-1">` or similar
- Annexes: `<div id="ANX_...">` or `<p class="ti-section-1" id="anx...">`

**Deliverable**: Document of HTML → Markdown mappings (can use existing 765/2008 HTML chunks from earlier in session)

### Phase 2: Create Parser Script (2-3 hours)

**File**: `scripts/eurlex_html_to_md.py`

**Architecture**:
```python
#!/usr/bin/env python3
"""
EUR-Lex HTML to Markdown Converter

For regulations without Formex XML (typically pre-2010).
Produces identical structure to formex_to_md_v3.py output.

Usage:
    python eurlex_html_to_md.py <CELEX_NUMBER> <OUTPUT_DIR>
    
Example:
    python eurlex_html_to_md.py 32008R0765 ./01_regulation/765_2008_Market_Surveillance
"""

import requests
from bs4 import BeautifulSoup
import re
from pathlib import Path

def download_html(celex: str) -> str:
    """Download regulation HTML from EUR-Lex ELI endpoint."""
    # Use the /eli/ URL format which gives clean HTML
    url = f"https://eur-lex.europa.eu/eli/reg/{celex_to_eli(celex)}/oj/eng"
    response = requests.get(url)
    return response.text

def celex_to_eli(celex: str) -> str:
    """Convert CELEX to ELI path segment (e.g., 32008R0765 → 2008/765)."""
    # Extract year and number from CELEX format
    # 32008R0765 → year=2008, num=765
    match = re.match(r'3(\d{4})R(\d+)', celex)
    if match:
        year, num = match.groups()
        return f"{year}/{int(num)}"
    raise ValueError(f"Invalid CELEX format: {celex}")

def extract_metadata(soup: BeautifulSoup, celex: str) -> dict:
    """Extract document metadata."""
    return {
        'celex': celex,
        'title': extract_title(soup),
        'date': extract_date(soup),
        'oj_reference': extract_oj_reference(soup),
        'eli': f"http://data.europa.eu/eli/reg/{celex_to_eli(celex)}/oj",
        'consolidated_version': extract_consolidated_date(soup)
    }

def extract_preamble(soup: BeautifulSoup) -> list[str]:
    """Extract recitals (1), (2), etc."""
    recitals = []
    # Find recital container (varies by document)
    # Look for paragraphs starting with (N) pattern
    # ...
    return recitals

def extract_enacting_formula(soup: BeautifulSoup) -> str:
    """Extract 'HAVE ADOPTED THIS REGULATION:' or similar."""
    pass

def extract_chapters(soup: BeautifulSoup) -> list[dict]:
    """Extract chapter structure with articles."""
    # Returns: [{'number': 'I', 'title': 'GENERAL PROVISIONS', 'articles': [...]}]
    pass

def extract_articles(soup: BeautifulSoup) -> list[dict]:
    """Extract all articles with their content."""
    # Returns: [{'number': 1, 'title': 'Subject matter and scope', 'paragraphs': [...]}]
    pass

def extract_annexes(soup: BeautifulSoup) -> list[dict]:
    """Extract annexes."""
    # Returns: [{'number': 'I', 'title': '...', 'content': [...]}]
    pass

def format_markdown(metadata: dict, preamble: list, chapters: list, annexes: list) -> str:
    """Assemble all parts into final Markdown."""
    lines = []
    
    # 1. Metadata header (blockquote format)
    lines.extend([
        f"> **CELEX:** {metadata['celex']} | **Document:** Regulation (EC) No ...",
        "> ",
        f"> **Source:** [EUR-Lex]({metadata['eli']})",
        f"> **Official Journal:** {metadata['oj_reference']}",
        f"> **ELI:** {metadata['eli']}",
        f"> **In force:** Current consolidated version: {metadata['consolidated_version']}",
        "",
    ])
    
    # 2. Title
    lines.append(f"# {metadata['title']}")
    lines.append("")
    
    # 3. Subtitle and EEA relevance note
    # ...
    
    # 4. Preamble (institutions, recitals)
    lines.append("## Preamble")
    lines.append("")
    lines.append("Whereas:")
    lines.append("")
    for recital in preamble:
        lines.append(recital)
        lines.append("")
    
    # 5. Enacting formula
    lines.append("HAVE ADOPTED THIS REGULATION:")
    lines.append("")
    
    # 6. Enacting Terms marker
    lines.append("## Enacting Terms")
    lines.append("")
    
    # 7. Chapters and Articles
    for chapter in chapters:
        lines.append(f"## CHAPTER {chapter['number']} — {chapter['title']}")
        lines.append("")
        for article in chapter['articles']:
            lines.append(f"### Article {article['number']} — {article['title']}")
            lines.append("")
            # Format paragraphs, points, etc.
            lines.extend(format_article_content(article['content']))
    
    # 8. Annexes
    for annex in annexes:
        lines.append(f"## ANNEX {annex['number']}")
        lines.append("")
        if annex.get('title'):
            lines.append(f"### {annex['title']}")
            lines.append("")
        lines.extend(annex['content'])
    
    # 9. Source Reference
    lines.extend([
        "",
        "---",
        "",
        "## Source Reference",
        "",
        f"- **CELEX Number:** {metadata['celex']}",
        "- **Source:** EUR-Lex (HTML)",
        f"- **URL:** https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:{metadata['celex']}",
        f"- **Conversion Date:** {datetime.now().strftime('%Y-%m-%d')}",
        "- **Format:** HTML → Markdown (eurlex_html_to_md.py)",
    ])
    
    return '\n'.join(lines)

# ... (full implementation)
```

**Key Functions to Implement**:

1. **`download_html(celex)`** - Fetch HTML from EUR-Lex using requests
2. **`extract_preamble(soup)`** - Parse Whereas clauses with regex `\((\d+)\)\s*(.+)`
3. **`extract_chapters(soup)`** - Find `CHAPTER` markers and group articles
4. **`extract_articles(soup)`** - Parse article titles, paragraphs, points
5. **`extract_annexes(soup)`** - Find `ANNEX` sections
6. **`format_paragraph(text, number)`** - Format with proper Markdown
7. **`format_points(items)`** - Format as `- (a)`, `- (b)` etc.
8. **`format_definitions(items)`** - Format as `- N. 'term' means...`

### Phase 3: Integration with Pipeline (30 min)

**Objective**: Make the HTML parser a fallback in the unified pipeline

**Modify**: `scripts/pipeline.py` or `scripts/eurlex_formex.py`

```python
def process_document(celex: str, output_dir: Path) -> Path:
    """Process a CELEX document, using Formex if available, HTML otherwise."""
    
    # Try Formex first
    formex_url = get_formex_url(celex)
    if formex_url:
        return process_formex(celex, formex_url, output_dir)
    
    # Fall back to HTML
    print(f"  ⚠️ Formex not available for {celex}, using HTML fallback")
    return process_html(celex, output_dir)
```

**Update**: `scripts/batch_fix_annexes.py` (if needed) to support HTML source

### Phase 4: Testing & Validation (30 min)

**Test Cases**:

1. **Structure validation** (automated):
   ```python
   def test_765_2008_structure():
       md = convert_from_html('32008R0765')
       
       # Must have metadata header
       assert '> **CELEX:**' in md
       
       # Must have preamble with 48 recitals
       assert '## Preamble' in md
       assert '(48)' in md
       
       # Must have all 6 chapters
       assert '## CHAPTER I' in md
       assert '## CHAPTER VI' in md
       
       # Must have 44 articles
       assert '### Article 44' in md
       
       # Must have 2 annexes
       assert '## ANNEX I' in md
       assert '## ANNEX II' in md
       
       # Must have definitions in correct format
       assert "- 1. 'making available on the market'" in md
   ```

2. **Comparison test** (manual):
   - Generate 765/2008 via HTML parser
   - Compare with current static version
   - Verify all content is present

3. **Build pipeline test**:
   ```bash
   # Run full build
   cd docs-portal && npm run build:all
   
   # Verify terminology extracted
   grep "conformity assessment body" public/data/terminology.json
   
   # Verify search indexed
   npm run build:search
   ```

4. **Portal verification**:
   - Navigate to http://localhost:5173/eIDAS20/#/regulation/765-2008
   - Verify TOC has all chapters
   - Verify definitions link correctly
   - Verify multi-source popover shows both 910/2014 and 765/2008 definitions

### Phase 5: Documentation & Cleanup (15 min)

1. **Add to DECISIONS.md**:
   ```markdown
   ## DEC-042: HTML Fallback Converter
   
   **Decision**: Create `eurlex_html_to_md.py` for regulations without Formex XML
   
   **Context**: Older EU regulations (pre-~2010) often lack Formex XML. 
   765/2008 was manually extracted, which is non-repeatable.
   
   **Solution**: Python script that parses EUR-Lex HTML and produces 
   identical Markdown structure to the Formex converter.
   
   **Benefits**:
   - Deterministic and repeatable
   - Scalable to other HTML-only regulations (768/2008, GDPR, etc.)
   - Receives same enrichments as Formex-sourced docs
   ```

2. **Update AGENTS.md** (Rule 70: Converter-First Debugging):
   - Add note about HTML fallback

3. **Update KI** (eidas_2_0_knowledge_base):
   - Add to `implementation/legal_content_pipeline.md`

---

## Dependencies & Requirements

### Python Dependencies
```bash
pip install requests beautifulsoup4 lxml
```

### Files to Create
- `scripts/eurlex_html_to_md.py` — Main converter
- `scripts/test_html_converter.py` — Unit tests

### Files to Modify
- `scripts/pipeline.py` — Add HTML fallback
- `scripts/eurlex_formex.py` — Add fallback logic
- `.agent/decisions/DECISIONS.md` — Document decision

---

## Edge Cases to Handle

1. **Consolidated vs Original versions**: Use consolidated URL when available
2. **Multiple language versions**: Always use English (`/eng`)
3. **Missing sections**: Some regulations may lack preamble or annexes
4. **Definition format variations**: 
   - `N. 'term' means...` (765/2008)
   - `- (N) 'term' means...` (910/2014)
5. **Nested lists**: Support up to 3 levels `(a) → (i) → (—)`
6. **Footnotes**: Preserve with escaped brackets `\[1\]`
7. **Cross-references**: Preserve verbatim (no linking yet)

---

## Success Criteria

1. ✅ `eurlex_html_to_md.py 32008R0765 ./output` produces valid Markdown
2. ✅ Output structure matches Formex converter output exactly
3. ✅ All 48 recitals, 44 articles, 2 annexes extracted
4. ✅ Terminology extraction works (`build-terminology.js`)
5. ✅ Portal displays correctly with TOC and deep links
6. ✅ Can regenerate 765/2008 deterministically
7. ✅ Pipeline falls back to HTML when Formex unavailable

---

## Quick Start for Next Session

```bash
# 1. Check existing converter structure
cat scripts/formex_to_md_v3.py | head -100

# 2. View current 765/2008 output format
head -100 01_regulation/765_2008_Market_Surveillance/02008R0765.md

# 3. Download sample HTML for analysis
curl -o test_765.html "https://eur-lex.europa.eu/eli/reg/2008/765/oj/eng"

# 4. Analyze HTML structure
python3 -c "from bs4 import BeautifulSoup; soup = BeautifulSoup(open('test_765.html').read(), 'lxml'); print([t.name for t in soup.find_all(['p', 'div'])[:50]])"

# 5. Start implementation
touch scripts/eurlex_html_to_md.py
```

---

## Appendix: EUR-Lex HTML Structure Reference

Based on earlier session analysis of `https://eur-lex.europa.eu/eli/reg/2008/765/oj/eng`:

### Recital Pattern (Preamble)
```html
<p class="oj-normal">
  (1) It is necessary to ensure that products...
</p>
```

### Article Pattern
```html
<p class="ti-art" id="art_1">Article 1</p>
<p class="sti-art">Subject matter and scope</p>
<p class="oj-normal">1.   This Regulation lays down rules...</p>
```

### Chapter Pattern
```html
<p class="ti-section-1">CHAPTER I</p>
<p class="sti-section-1">GENERAL PROVISIONS</p>
```

### Definition Pattern (765/2008 style)
```html
<p class="oj-normal">
  1. 'making available on the market' means...
</p>
```

### Annex Pattern
May be:
- `<div id="ANX_1">` with nested content
- `<p class="ti-section-1" id="anx_I">ANNEX I</p>` followed by paragraphs
