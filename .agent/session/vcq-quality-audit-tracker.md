# VCQ Clarification Question Quality Audit Tracker

> **Parent step:** Step 6.4 in `USE_CASE_ANALYSIS.md`  
> **Created:** 2026-02-20  
> **Status:** ⬜ NOT STARTED

## Context

Step 6.4 had two objectives:
1. ✅ **Use case tagging** — COMPLETE (51 questions tagged, commit `b987a2dd`)
2. ❌ **Quality audit** — NOT DONE (this tracker)

The tagging pass read every question for semantic scope but did NOT evaluate:
- Question wording quality (sharpness, specificity)
- Redundancy across questions within a requirement
- Enrichment opportunities from EC use case manuals
- Terminology consistency (outdated terms)
- Missing coverage gaps revealed by manual analysis

## Scope

Audit ALL 1,352 questions across 5 files for quality improvements.

## Files to Audit

| File | Reqs | Qs | Quality Audit Status |
|------|------|----|---------------------|
| `config/vcq/clarification-questions/core.yaml` | 48 | 421 | ⬜ Not started |
| `config/vcq/clarification-questions/issuer.yaml` | 40 | 360 | ⬜ Not started |
| `config/vcq/clarification-questions/intermediary.yaml` | 32 | 292 | ⬜ Not started |
| `config/vcq/clarification-questions/trust_services.yaml` | 19 | 171 | ⬜ Not started |
| `config/vcq/clarification-questions/ict.yaml` | 12 | 108 | ⬜ Not started |

## What to Evaluate (per question)

1. **Wording quality** — Can it be sharpened with EC manual context? Vague → specific.
2. **Redundancy** — Does this question overlap with another Q in the same requirement?
3. **Terminology** — Uses outdated/incorrect terms? (e.g. "advanced" → "qualified")
4. **Completeness** — EC manuals reveal a scenario not covered by existing questions?
5. **Cross-reference** — Does the question correctly reference related VEND-* requirements?

## Constraints (from USE_CASE_ANALYSIS.md)

- Do NOT rewrite questions from scratch — sharpen existing wording with specific details
- Do NOT remove questions — only merge if truly duplicative
- All changes must be backward-compatible (no ID changes)
- Preserve the existing `dimension` classification
- ⛔ NO automated keyword/pattern-matching scripts — manual semantic analysis ONLY

## Change Log

| Date | File | Changes | Commit |
|------|------|---------|--------|
| — | — | — | — |
