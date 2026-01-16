# Session Context: EUR-Lex HTML Parser

## Current State

- **Focus**: Pipeline integration - Add HTML fallback when Formex unavailable
- **Next**: Update `eurlex_formex.py` to check `source: html` in documents.yaml
- **Status**: Ready
- **Phase**: Phase 3 of 5

## Key Files

- `scripts/eurlex_html_to_md.py` — **COMPLETE**: HTML→MD converter
- `scripts/documents.yaml` — **UPDATED**: 765/2008 added with `source: html`
- `scripts/eurlex_formex.py` — **NEXT**: Add fallback logic
- `~/.venvs/eurlex/` — Virtual env with beautifulsoup4, lxml, requests

## Context Notes

- EUR-Lex HTML uses separate `<p>` elements for numbers and content
- Converter handles: recitals, chapters, articles, annexes (oj-enumeration-spacing)
- Validation: 48 recitals, 6 chapters, 44 articles, 2 annexes, 11,674 words
- URL pattern: `https://eur-lex.europa.eu/eli/reg/{year}/{number}/oj/eng`

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Test converter:
~/.venvs/eurlex/bin/python3 scripts/eurlex_html_to_md.py 32008R0765 /tmp/test
```
