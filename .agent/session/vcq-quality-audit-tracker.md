# VCQ Clarification Question Quality Audit Tracker

> **Parent step:** Step 6.4 in `USE_CASE_ANALYSIS.md`  
> **Created:** 2026-02-20  
> **Status:** ✅ COMPLETE (5/5 files audited)

## Context

Step 6.4 had two objectives:
1. ✅ **Use case tagging** — COMPLETE (51 questions tagged, commit `b987a2dd`)
2. 🔄 **Quality audit** — IN PROGRESS (this tracker)

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
| `config/vcq/clarification-questions/core.yaml` | 48 | 421 | ✅ Complete |
| `config/vcq/clarification-questions/issuer.yaml` | 40 | 360 | ✅ Complete |
| `config/vcq/clarification-questions/intermediary.yaml` | 32 | 290 | ✅ Complete |
| `config/vcq/clarification-questions/trust_services.yaml` | 19 | 171 | ✅ Complete |
| `config/vcq/clarification-questions/ict.yaml` | 12 | 108 | ✅ Complete |

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
| 2026-02-20 | `core.yaml` | Quality audit complete: 20 questions sharpened across 15 requirements. Critical fix: VEND-CORE-001 Q5 was duplicate of Q1 (rewrote as proper supply_chain question). Added specific article/ARF references (Art 5b(10), AS-RP-51-011, IR 2025/848 Arts 5–9). Enriched with EC manual terminology (TS12 issuer-requested/third-party-requested flows, TS8 wallet-driven/RP-driven paths, EMV 3-D Secure/SEPA rail names). Fixed British English consistency. No IDs/dimensions changed. | f676d176 |
| 2026-02-20 | `issuer.yaml` | Quality audit complete: 15 questions sharpened across 12 requirements. Fixed corrupted header text ('implementatioarchitecturen'). Resolved Q5/Q6 overlap in ISS-005 (specialised Q5 to compatibility matrix, Q6 to plugfest evidence). Fixed ISS-009 Q4 trailing whitespace. Added specific references: IETF draft-ietf-oauth-status-list, NIST FIPS 204/205, EN 419 221-5, BBS+ draft-irtf-cfrg-bbs-signatures, Article 45h paragraph numbers (1/2/3). Added EC PID-online manual context to ISS-026 PID Rulebook questions. No IDs/dimensions changed. | 65934ade |
| 2026-02-20 | `intermediary.yaml` | Quality audit complete: 6 questions sharpened across 5 requirements. Removed 2 redundant questions from VEND-INT-011 (Q12/Q13 duplicated Q4/Q6 — merged content into Q4 and Q6). Added EC manual terminology: 'supervised/unsupervised' proximity flows, BLE as mandatory baseline transport per ISO 18013-5:2021, TS12 pseudonym attestation use case, Wi-Fi Aware transport option, ISO 18013-7 reader authentication. Removed orphaned trailing section separator. 292→290 questions. | 3cf7b2e2 |
| 2026-02-20 | `trust_services.yaml` | Quality audit complete: 8 questions sharpened across 7 requirements. Differentiated TSP-008 Q5/Q6 overlap (Q5 now covers EUDI Wallet-initiated signing scope, Q6 focusses on sole control EN 419 241-2 detail). Sharpened TSP-012 Q8 partial verification handling with 'person-provided' quality designation. Added IR 2025/1567 Art 3 for QSCDs, EC eSignature manual 'wallet-driven/RP-driven' flows, NIST FIPS 204/205 PQC standards for timestamps and QEAAs. No IDs/dimensions changed, 171 questions retained. | 5f38b62c |
| 2026-02-20 | `ict.yaml` | Quality audit complete: 4 questions sharpened across 4 requirements. Added eIDAS Article 45h cross-reference for dual-regulation scenario (ICT-001 Q7). Added DORA RTS citation (Commission Delegated Regulation 2024/1772) for incident classification (ICT-007 Q1). Updated TIBER-EU reference to note DORA Art 26 supersession (ICT-008 Q8). Added specific CTPP designation criteria from Article 31(2) (ICT-011 Q7). No IDs/dimensions changed, 108 questions retained. | 2ee82258 |

## core.yaml Audit Summary

### Findings by Category

| Category | Count | Details |
|----------|-------|---------|
| **Redundancy** | 1 | VEND-CORE-001 Q5 was exact duplicate of Q1 text (rewrote Q5 as supply_chain question) |
| **Wording sharpened** | 15 | Added specific article numbers, ARF references, EC manual terminology |
| **Terminology** | 4 | "organization" → "organisation" (consistency), "pseudonyms" → "pseudonymous attestations", "forwarding" → "forward-only", generic → specific regulatory references |
| **Coverage gaps** | 0 | Existing question coverage is comprehensive for core.yaml |
| **Cross-reference** | 3 | Added explicit IR 2025/848 article numbers, VEND-CORE cross-refs |
