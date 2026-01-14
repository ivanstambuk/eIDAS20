# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: Portal ready - all known bugs fixed
- **Next**: Deploy to GitHub Pages OR investigate 8 embedded annexes
- **Status**: Ready for decision
- **Phase**: Phase 7 (Enhancements) - Content Quality

## Completed This Session

1. **Fixed metadata loss bug**: Restored CELEX/EUR-Lex links in 29 implementing acts
2. **Added prevention guard**: Updated `batch_fix_annexes.py` to preserve metadata headers
3. **Verified visually**: Browser screenshot confirms badges are back

## Key Files

- `scripts/restore_metadata.py` — Recovery script (can rerun if needed)
- `scripts/batch_fix_annexes.py` — Now preserves metadata (lines 146-197)

## Remaining Optional Work

8 documents still have annexes embedded in main XML (not separate files):
- 2024-1183, 2024-2977, 2024-2982, 2025-0848
- 2025-2160, 2025-2164, 2025-2527, 2025-2530

These require converter changes to extract `<ANNEX>` from inside the main `.000101.fmx.xml`.

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Check portal at http://localhost:5173/eIDAS20/
```
