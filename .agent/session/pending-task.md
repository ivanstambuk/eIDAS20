# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: ARF v2.8.0 upgrade — plan is fully refined (7 phases, 13 risks), ready for execution
- **Next**: Execute Phase 0 (create feature branch `feature/arf-280-upgrade`, tag `pre-arf-280`, verify build)
- **Status**: Ready
- **Phase**: ARF Upgrade, Phase 0

## Key Files

- `docs-portal/docs/plans/arf-280-upgrade-plan.md` — the master plan (7 phases, ~460 lines)
- `docs-portal/config/arf/arf-config.yaml` — ARF import config (relevantTopics, csvUrl, baseUrl, topicAnchors)
- `docs-portal/scripts/import-arf.js` — primary ARF import (remote CSV → arf-hlr-data.json)
- `docs-portal/scripts/import-arf-hlr.js` — secondary ARF import (local CSV → arf-hlr.json for Requirements Browser)
- `docs-portal/scripts/validate-vcq-arf.js` — ARF reference validator (now with relevantTopics cross-check)
- `docs-portal/docs/research/arf-280-impact-assessment.md` — raw diff report (from prior session)
- `.agent/snippets/arf-anchor-verification.py` — GitHub anchor slug generator (new this session)

## Context Notes

Things git commits don't capture:

- **validate-vcq-arf.js currently fails** — Topics 38/53 are referenced in VCQ YAML but missing from `relevantTopics`. This is the known pre-existing bug that Phase 1 Step 7 fixes.
- **Two ARF scripts** — `import-arf.js` fetches from GitHub CSV (in npm build); `import-arf-hlr.js` reads local CSV (must be run manually). Both must be updated during upgrade.
- **Phase 2 merges old 2+2.5** — single-pass YAML editing to avoid double-editing. Triage emptied HLRs AND migrate to Harmonized IDs in one pass.
- **csvUrl must be pinned** — Phase 3.5 pins both `csvUrl` AND `baseUrl` to v2.8.0 tag (not `main`).
- **8 duplicate Harmonized IDs** — 5 are Topic 38 empty tombstones (Pattern A), 3 are genuinely different reqs sharing ID (Pattern B: Topics 44, 31, 12). No impact on `byHlrId` (Old IDs are unique). Content-wins guard needed for `byHarmonizedId` — now documented in plan Phase 2 step 5 and AGENTS.md.
- **19 topic label mismatches** — VCQ `arfReference.topic` is semantic (area label), not strict CSV topic. Cosmetic only; deep links work correctly. Only Topic 53↔52 has functional impact.
- **Retro improvements all committed** — `6c8bba9c`: anchor slug snippet, AGENTS.md index docs, TERMINOLOGY.md +3 terms, plan content-wins guard.

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Review plan: docs/plans/arf-280-upgrade-plan.md
# Phase 0: git checkout -b feature/arf-280-upgrade && git tag pre-arf-280
```
