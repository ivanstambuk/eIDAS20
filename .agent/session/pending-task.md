# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: ARF v2.8.0 upgrade — plan is fully refined (7 phases, 13 risks), ready for execution
- **Next**: Execute Phase 0 (create feature branch `feature/arf-280-upgrade`, tag `pre-arf-280`, verify build)
- **Status**: Ready
- **Phase**: ARF Upgrade, Phase 0

## Key Files

- `docs-portal/docs/plans/arf-280-upgrade-plan.md` — the master plan (452 lines, 7 phases)
- `docs-portal/config/arf/arf-config.yaml` — ARF import config (relevantTopics, csvUrl, baseUrl, topicAnchors)
- `docs-portal/scripts/import-arf.js` — primary ARF import (remote CSV → arf-hlr-data.json)
- `docs-portal/scripts/import-arf-hlr.js` — secondary ARF import (local CSV → arf-hlr.json for Requirements Browser)
- `docs-portal/scripts/validate-vcq-arf.js` — ARF reference validator (now with relevantTopics cross-check)
- `docs-portal/docs/plans/arf-280-impact-assessment.md` — raw diff report (from prior session)

## Context Notes

Things git commits don't capture:

- **validate-vcq-arf.js currently fails** — Topics 38/53 are referenced in VCQ YAML but missing from `relevantTopics`. This is the known pre-existing bug that Phase 1 Step 7 fixes.
- **Two ARF scripts** — `import-arf.js` fetches from GitHub CSV (in npm build); `import-arf-hlr.js` reads local CSV (must be run manually). Both must be updated during upgrade.
- **Phase 2 merges old 2+2.5** — single-pass YAML editing to avoid double-editing. Triage emptied HLRs AND migrate to Harmonized IDs in one pass.
- **csvUrl must be pinned** — Phase 3.5 pins both `csvUrl` AND `baseUrl` to v2.8.0 tag (not just baseUrl).
- **Retro produced Rule 19** — "Codebase-first plan review" — always grep/view actual scripts before reviewing plans.
- **AGENTS.md now has full ARF section** — dual-script table, arf-config.yaml docs, byHlrId/byHarmonizedId index pattern.

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Review plan: docs/plans/arf-280-upgrade-plan.md
# Phase 0: git checkout -b feature/arf-280-upgrade && git tag pre-arf-280
```
