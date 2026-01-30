# Gemini Pro Review Pass: VCQ Clarification Questions

> **Purpose**: You are reviewing the VCQ clarification questions created by Opus.
> **Your Role**: Extend, refine, and validate questions - NOT replace them.
> **Date**: 2026-01-30

---

## Context

The eIDAS 2.0 Documentation Portal includes a **Vendor Compliance Questionnaire (VCQ)** tool. Each VCQ requirement now has **clarification questions** that probe vendor capabilities in depth.

**Opus completed Phases 1-5**: ~760 questions across 135 requirements
**Opus completed Phase 5.5 (MIQE)**: Market research enhancements (BYOK, PQC, wallet testing, ZKP, plugfest, etc.)

---

## Your Task: Phase 6 (Gemini Pro Review)

For each clarification questions file, review and suggest:

1. **Missing dimensions**: Are there question dimensions we haven't covered?
2. **Clarity improvements**: Are any questions ambiguous or unclear?
3. **Redundancy**: Are any questions duplicative and can be consolidated?
4. **Order optimization**: Could questions be reordered for better flow?
5. **New questions**: Are there obvious gaps based on the requirement text?

### Files to Review

| File | Path | Requirements |
|------|------|--------------|
| Core | `docs-portal/config/vcq/clarification-questions/core.yaml` | VEND-CORE-001 to 042 |
| Issuer | `docs-portal/config/vcq/clarification-questions/issuer.yaml` | VEND-ISS-001 to 040 |
| Intermediary | `docs-portal/config/vcq/clarification-questions/intermediary.yaml` | VEND-INT-001 to 034 |
| ICT/DORA | `docs-portal/config/vcq/clarification-questions/ict.yaml` | VEND-ICT-001 to 012 |
| Trust Services | `docs-portal/config/vcq/clarification-questions/trust_services.yaml` | VEND-TSP-001 to 019 |

### Implementation Plan

The full implementation plan is at:
```
.agent/session/VCQ_CLARIFICATION_QUESTIONS_PLAN.md
```

---

## Enhancement Principles (from Phase 5.5)

| ✅ DO | ❌ DON'T |
|-------|----------|
| High-level capability ("Do you support...?") | Low-level implementation ("Which library...?") |
| Interoperability testing ("Which wallets tested?") | Fine-grained metrics ("TPS per algorithm") |
| Key custody options (BYOK) | UX analytics (we own UX) |
| Future-proofing (PQC roadmap) | Anti-spoofing (built into protocols) |
| Approval workflows (quorum, four-eyes) | Internal database/queue choices |

---

## Suggested Workflow

1. **Run `/init`** to understand the project context
2. **Read the implementation plan** at `.agent/session/VCQ_CLARIFICATION_QUESTIONS_PLAN.md`
3. **Review each file** one at a time (start with `core.yaml`)
4. **Propose changes** - discuss with user before applying
5. **Apply changes** - edit files with enhancements
6. **Set `gemini: true`** in `modelPasses` for each file after review
7. **Commit** when complete

---

## Quick Start Commands

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
```

Portal URL: http://localhost:5173

---

## Key Artifacts

- VCQ Requirements: `docs-portal/config/vcq/requirements/*.yaml`
- Clarification Questions: `docs-portal/config/vcq/clarification-questions/*.yaml`
- Implementation Plan: `.agent/session/VCQ_CLARIFICATION_QUESTIONS_PLAN.md`
- ARF HLR Data: `docs-portal/config/arf/hlr-data.yaml`

---

## Notes from Opus

1. **BYOK questions** were added for key management (ISS-006, ISS-017, TSP-004)
2. **PQC roadmap** questions were added for future-proofing (ISS-018, TSP-013)
3. **Wallet compatibility testing** questions were added throughout (ISS-005, Core-018, Core-023, INT-005, INT-023)
4. **Plugfest participation** questions were added for interoperability evidence
5. **ZKP support** questions were added for privacy-preserving verification (Core-018, Core-027)
6. **SIEM integration** was added for ICT incident detection (ICT-007)
7. **SIOPv2 protocol** was added as alternative presentation protocol (INT-005)

These are the key themes from market research. You may find additional gaps or refinements.
