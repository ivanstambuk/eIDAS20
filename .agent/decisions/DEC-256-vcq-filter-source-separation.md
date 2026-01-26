# DEC-256: VCQ Filter Source Separation and Legal Primacy

## Decision
VCQ filters operate on two orthogonal, additive source hierarchies: **Legal** (binding legislation) and **Architecture** (technical specifications). All requirements must have proper legislative backing (`legalBasis`) where applicable, independent of ARF references.

## Status
**Accepted** — 2026-01-26

## Context

The VCQ tool uses a 3-tile filter model (per DEC-255):
1. **Primary (eIDAS Framework)** — Regulation + Implementing Acts
2. **Related Regulations** — GDPR, DORA
3. **Architecture** — ARF, ISO, W3C, ETSI

A concern was raised that 20 requirements had ARF references (`arfReference`) but no legislative backing (`legalBasis`). This created a data gap where:
- Legal filter might exclude requirements that actually stem from legislation
- ARF-only requirements appeared orphaned from their true legal source

## Problem Statement

1. **Data completeness**: 16 requirements (29%) had ARF references without `legalBasis`
2. **Filter accuracy**: Legal filter must reliably show all legally-sourced requirements
3. **Source independence**: Architecture sources should not "depend on" Legal sources in the UI, even if topically related

## Decision Details

### 1. Legal Primacy Principle

Every requirement that stems from EU legislation must have a `legalBasis` field with:
- `regulation`: The CELEX number (e.g., "2014/910", "2025/848")
- `article`: The specific article
- `paragraph`: The paragraph/point (where applicable)

ARF references are **supplementary** — they provide technical implementation guidance but don't replace legal authority.

### 2. Orthogonal Filter Dimensions

| Filter | Sources | Field Used | Display Content |
|--------|---------|------------|-----------------|
| **Legal** | Regulation + Implementing Acts | `legalBasis` | Legal text, Article citations |
| **Architecture** | ARF, ISO, W3C, ETSI specs | `arfReference` | Technical specification text |

### 3. Additive Filter Logic (Union)

| Legal | Arch | Result |
|-------|------|--------|
| OFF | OFF | Show nothing / all (UX decision) |
| ON | OFF | Show requirements WITH `legalBasis` |
| OFF | ON | Show requirements WITH `arfReference` |
| **ON** | **ON** | **UNION**: All requirements with either source |

### 4. No Semantic Merging

- Semantic equivalence between ARF and legislation is **irrelevant** to filtering
- Filtering is based purely on **source field presence**
- A requirement can have both sources and will appear in both filter views
- The UI displays content appropriate to the active filter source

## Implementation

### Data Model Updates
- Added `legalBasis` to 20 ARF-only requirements
- Coverage increased: 71% → **100%** have `legalBasis`
- Requirements with both sources: 20% → **44%**

### Files Changed
- `config/vcq/requirements/core.yaml` — 5 requirements updated
- `config/vcq/requirements/intermediary.yaml` — 15 requirements updated

### No UI Changes Required
The existing VCQ filter tiles already support this behavior correctly. The data model update was sufficient.

## ARF → Legislation Mapping (Summary)

| ARF Topic | HLRs | Legislative Source |
|-----------|------|-------------------|
| Topic 52 (Intermediaries) | RPI_01-10 | eIDAS Art. 5b, 2025/848 |
| Topic 1 (Online ID) | OIA_12-14 | eIDAS Art. 22, 32 |
| Topic 6 (RP Auth) | RPA_05-08 | 2024/2979 Art. 3, 8 |
| Topic 7 (Revocation) | VCR_13 | 2024/2979 |

Full mapping in: `.agent/session/VCQ_LEGAL_PRIMACY_AUDIT.md`

## Consequences

### Positive
- Legal filter now includes all legislatively-sourced requirements
- Data model accurately reflects source hierarchy
- Architecture sources remain independent for filtering purposes
- No UI changes needed — existing design already correct

### Negative
- None identified

## Related Decisions
- DEC-255: Source Selection Simplification (3-tile model)
- DEC-254: Consolidated PIF/VIF into single RP Intermediary
- DEC-222: Original VCQ tool design

## References
- Article 5b(10): "Intermediaries acting on behalf of relying parties shall be deemed to be relying parties and shall not store data about the content of the transaction."
- 2025/848 Annex I (14-15): Intermediary registration requirements
- Audit document: `.agent/session/VCQ_LEGAL_PRIMACY_AUDIT.md`
