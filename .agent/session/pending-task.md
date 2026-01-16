# Session Context: EUR-Lex HTML Parser

## Current State

- **Focus**: Create deterministic HTML→Markdown converter for EUR-Lex regulations lacking Formex XML
- **Next**: Implement `scripts/eurlex_html_to_md.py` following the plan
- **Status**: Ready to start (implementation plan complete)
- **Blocker**: None

## Key Files

- `.agent/session/eurlex-html-parser-plan.md` — **Full implementation plan (READ THIS FIRST)**
- `scripts/formex_to_md_v3.py` — Reference: Formex converter output format to match
- `scripts/eurlex_formex.py` — Fallback integration point
- `01_regulation/765_2008_Market_Surveillance/02008R0765.md` — Current output (manual extraction)
- `01_regulation/910_2014_eIDAS_Consolidated/02014R0910-20241018.md` — Reference: target format

## Context Notes

**Why this matters:**
- 765/2008 was manually extracted (one-time, non-repeatable)
- If Formex converter adds features (paragraph IDs, citations), 765/2008 won't get them
- Need unified pipeline: Formex first, HTML fallback

**Key insight from session:**
- Tested `get_formex_url('32008R0765')` → Returns `None`
- Formex XML genuinely unavailable for older regulations (pre-~2010)
- The 1.18MB XML from EUR-Lex is metadata only (NOTICE format), not content

**Output format requirements:**
- Metadata header: `> **CELEX:** ... | **Document:** ...`
- Chapters: `## CHAPTER I — TITLE`
- Articles: `### Article N — Title`
- Definitions: `- N. 'term' means...`
- Must match Formex output exactly for downstream compatibility

**EUR-Lex HTML endpoint:**
```
https://eur-lex.europa.eu/eli/reg/2008/765/oj/eng
```

## Quick Start

```bash
cd ~/dev/eIDAS20

# 1. Read the implementation plan (REQUIRED)
cat .agent/session/eurlex-html-parser-plan.md

# 2. Analyze HTML structure
curl -o /tmp/test_765.html "https://eur-lex.europa.eu/eli/reg/2008/765/oj/eng"
python3 -c "from bs4 import BeautifulSoup; print(BeautifulSoup(open('/tmp/test_765.html').read(), 'lxml').prettify()[:2000])"

# 3. Start implementation
touch scripts/eurlex_html_to_md.py

# 4. Compare with Formex output format
head -100 01_regulation/910_2014_eIDAS_Consolidated/02014R0910-20241018.md
```

**Dev server:**
```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# http://localhost:5173/eIDAS20/
```

## Success Criteria

1. ✅ `python eurlex_html_to_md.py 32008R0765 ./output` works
2. ✅ Output matches Formex converter structure exactly
3. ✅ All 48 recitals, 44 articles, 2 annexes extracted
4. ✅ `npm run build:terminology` works on output
5. ✅ Portal displays correctly

## Implementation Plan Location

**Full plan:** `.agent/session/eurlex-html-parser-plan.md`

5 phases:
1. HTML Source Analysis (30 min)
2. Create Parser Script (2-3 hours) ← **Main work**
3. Pipeline Integration (30 min)
4. Testing & Validation (30 min)
5. Documentation (15 min)

Total estimated: 3-4 hours
