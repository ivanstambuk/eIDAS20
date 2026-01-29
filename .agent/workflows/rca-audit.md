---
description: Systematic audit of RCA requirements for cross-tool alignment
---

# RCA Audit Workflow

Use this workflow when:
- Auditing RCA requirements against VCQ or other compliance tools
- Verifying requirement coverage across tools
- Identifying gaps or missing requirements

---

## Overview

This workflow implements the **Disposition Classification Methodology** for auditing RCA requirements against other compliance tools (primarily VCQ).

---

## Step 1: Establish Scope

Define the audit scope before starting:

```markdown
## Audit Scope

**Role**: [Issuer | Relying Party | Wallet Provider | ...]
**Source Tool**: RCA
**Target Tool**: VCQ (or other)
**Scope Note**: [e.g., "Private sector commercial products only"]
```

---

## Step 2: Load Source Requirements

1. Read the RCA requirements file for the role:
   - `config/rca/requirements/{role}.yaml`

2. Count total requirements and categories

3. Document in tracker:

```markdown
| Category | Count |
|----------|-------|
| governance | X |
| privacy | X |
| ... | ... |
| **TOTAL** | **XX** |
```

---

## Step 3: Apply Disposition Classification

For each RCA requirement, assign a disposition code:

| Code | Meaning | Action |
|------|---------|--------|
| **V** | Vendor-Applicable | Must be in target tool |
| **O** | Organization-Only | Intentionally excluded (org action required) |
| **X** | Already in Target | Map to existing requirement |
| **P** | Public-Sector-Only | Excluded if target is private-sector |

### Classification Criteria

**Vendor-Applicable (V)**:
- Can be implemented in a product
- Can be verified through technical/functional testing
- Applies to the product, not the organization

**Organization-Only (O)**:
- Requires action with external authorities (registration, notification)
- Requires internal governance (HR, financial, personnel)
- Requires organizational decision-making (policy choices)

**Public-Sector-Only (P)**:
- Has `profileFilter: [public_sector]`
- Explicitly mentions "public sector body" or "government"
- Target tool is private-sector focused

---

## Step 4: Cross-Reference Target Tool

For each Vendor-Applicable requirement:

1. Search target tool for matching requirement
2. Use grep for key terms (article numbers, concepts)
3. Document mapping:

```markdown
| RCA ID | Requirement | Disp | Target Match | Notes |
|--------|-------------|------|--------------|-------|
| XXX-001 | [requirement] | X | VEND-XXX-001 | [notes] |
| XXX-002 | [requirement] | V | — | **GAP** |
| XXX-003 | [requirement] | O | N/A | Org-only |
```

---

## Step 5: Document Gaps

For any requirement marked as GAP:

1. Create detailed gap record:
   - RCA ID
   - Requirement text
   - Legal basis (article, paragraph)
   - Why it's vendor-applicable
   - Proposed target tool ID

2. Add to Gap Remediation Log

---

## Step 6: Document Exclusions

For Organization-Only and Public-Sector-Only exclusions:

```markdown
## Exclusion Registry

### Organization-Only (X exclusions)

| RCA ID | Requirement | Article | Reason |
|--------|-------------|---------|--------|
| XXX-001 | [requirement] | Art. X | [why it's org-only] |

### Public-Sector-Only (Y exclusions)

| RCA ID | Requirement | Article |
|--------|-------------|---------|
| XXX-001 | [requirement] | Art. X |
```

---

## Step 7: Create Audit Summary

```markdown
## Audit Summary

| Metric | Value |
|--------|-------|
| Total RCA Requirements | XX |
| Vendor-Applicable | XX |
| Already Covered | XX |
| Gaps Found | XX |
| Organization-Only Excluded | XX |
| Public-Sector-Only Excluded | XX |
| **Coverage** | XX% |
```

---

## Step 8: Remediate Gaps (if any)

For each gap:

1. Draft new requirement for target tool
2. Include:
   - ID following target tool convention
   - Category
   - Requirement text
   - Explanation
   - Legal basis with article/paragraph
   - Legal text quote
   - Roles/product categories
   - Deadline
   - Criticality
3. Add to target tool requirements file
4. Update gap log with remediation status

---

## Step 9: Update Tracker

```markdown
## Audit Sign-Off

| Phase | Status | By | Date |
|-------|--------|-----|------|
| Preparation | ✅ | [agent] | [date] |
| [Role] Audit | ✅ | [agent] | [date] |
| Remediation | ✅/N/A | [agent] | [date] |
| Documentation | ✅ | [agent] | [date] |
```

---

## Artifacts

Create the following files:

1. **Tracker**: `.agent/session/RCA_VCQ_AUDIT_TRACKER.md`
2. **Role Results**: `.agent/session/RCA_VCQ_AUDIT_{ROLE}_RESULTS.md`
3. **KB Scope Boundary**: Update `rca_vcq_scope_boundary.md` in KB

---

## Related Decisions

- **DEC-281**: RCA↔VCQ Systematic Alignment Audit (Jan 2026)
- Scope boundary documented in VCQ KI artifacts
