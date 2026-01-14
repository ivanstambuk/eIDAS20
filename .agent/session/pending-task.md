# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: Fixing missing annexes in implementing acts - 8 documents still have annexes embedded in main XML that weren't extracted
- **Next**: Investigate how to extract embedded annexes from main Formex XML files (vs separate .000901 files)
- **Status**: In Progress
- **Phase**: Phase 7 (Enhancements) - Content Quality

## Key Files

- `scripts/formex_to_md_v3.py` — Converter with annex handling (lines 744-800)
- `scripts/batch_fix_annexes.py` — Batch download/convert script
- `docs-portal/scripts/build-content.js` — Build-time annex validation (validateAnnexes function)

## Context Notes

Things git commits don't capture:

1. **Two types of annex storage in Formex**:
   - Separate files (`.000901.fmx.xml`) - SOLVED by batch_fix_annexes.py
   - Embedded in main file (`<ANNEX>` element inside `.000101.fmx.xml`) - NOT YET HANDLED

2. **8 documents with embedded annexes still missing** (validated by build-content.js):
   - 2024-1183, 2024-2977, 2024-2982, 2025-0848
   - 2025-2160, 2025-2164, 2025-2527, 2025-2530

3. **Converter already has annex code** (lines 744-800) but it may not be extracting embedded annexes correctly - need to debug with one of these files

4. **New rules added to AGENTS.md**:
   - Rule 5: Proactive Prevention Protocol (after bug fix, implement automated guard)
   - Rule 2 updated: TRACKER.md updates must be in same commit as change

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Check warnings about missing annexes:
npm run build:content | grep -A20 "ANNEX VALIDATION"
```

## Investigation Commands

```bash
# Download fresh Formex for a problem document:
cd ~/dev/eIDAS20/scripts
python3 eurlex_formex.py 32024R2977 /tmp/test_2977

# Check if ANNEX exists in main XML:
grep -i "ANNEX" /tmp/test_2977/formex/*.xml

# Check EUR-Lex directly:
curl -s "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R2977" | grep -c "ANNEX"
```
