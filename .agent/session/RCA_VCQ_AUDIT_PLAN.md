# RCA↔VCQ Systematic Audit Plan

**Document Version**: 1.0  
**Created**: 2026-01-29  
**Status**: AWAITING GREEN LIGHT  
**Decision Reference**: DEC-281 (proposed)

---

## Executive Summary

This document outlines a comprehensive audit plan to identify and remediate gaps between:
- **RCA (Requirements Compliance Assessment)**: Organizational compliance checklists
- **VCQ (Vendor Compliance Questionnaire)**: Third-party product evaluation questionnaires

The audit was triggered by the discovery of **Article 45h** requirements missing from VCQ Issuer track (now remediated). This systematic audit will ensure complete coverage across both Issuer and Relying Party roles.

---

## 1. Problem Statement

### 1.1 Root Cause Analysis

The Article 45h gap reveals a **systemic alignment issue**:

```
┌─────────────────────────────────────────────────────────────────────┐
│  RCA Development Path           VCQ Development Path                │
│  ─────────────────────          ─────────────────────               │
│                                                                     │
│  Regulation → Role → Requirements    Role → Product → Requirements │
│       ↓                                    ↓                        │
│  [Full regulatory coverage]          [Vendor-focused subset]       │
│       ↓                                    ↓                        │
│  42 Issuer reqs                      39 Issuer reqs                │
│  102 RP reqs                         71 RP reqs (core+intermediary)│
│                                                                     │
│  ╔═══════════════════════════════════════════════════════════════╗ │
│  ║ NO SYSTEMATIC CROSS-VALIDATION BETWEEN RCA AND VCQ           ║ │
│  ╚═══════════════════════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Known Gap (Remediated)

| Gap | Article | RCA ID | VCQ ID (Added) |
|-----|---------|--------|----------------|
| EAA data combination prohibition | 45h(1) | EAA-PRV-001 | VEND-ISS-038 |
| EAA data logical separation | 45h(2) | EAA-PRV-002 | VEND-ISS-039 |
| QEAA functional separation | 45h(3) | EAA-DP-003 | VEND-ISS-040 |

### 1.3 Suspected Additional Gaps

Based on article coverage analysis:

| Article | RCA Count | VCQ Count | Gap Risk |
|---------|-----------|-----------|----------|
| Article 5a (Wallet obligations) | 66 | 6 | 🔴 HIGH |
| Article 24 (QTSP requirements) | 35 | 7 | 🔴 HIGH |
| Article 21 (Supervision) | 15 | 0 | 🟡 MEDIUM |
| Article 9 (Security breaches) | 9 | 0 | 🟡 MEDIUM |
| Article 45f (QEAA requirements) | 7 | 4 | 🟢 LOW |

---

## 2. Scope Boundary Definition

### 2.1 Fundamental Distinction

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SCOPE BOUNDARY                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   RCA (Organizational Compliance)      VCQ (Vendor Product Eval)   │
│   ────────────────────────────────     ────────────────────────    │
│                                                                     │
│   ┌─────────────────────────────┐      ┌───────────────────────┐   │
│   │ Organization-Only           │      │ Vendor-Applicable     │   │
│   │ Requirements                │      │ Requirements          │   │
│   │                             │      │                       │   │
│   │ • Governance policies       │      │ • Technical protocols │   │
│   │ • Board oversight           │  →   │ • Security controls   │   │
│   │ • Liability/insurance       │ ──── │ • Data handling       │   │
│   │ • Registration with auth.   │  ↑   │ • Cryptographic ops   │   │
│   │ • Supervision cooperation   │  │   │ • Interface specs     │   │
│   │ • Workforce training        │  │   │ • Format compliance   │   │
│   └─────────────────────────────┘  │   └───────────────────────┘   │
│                                    │                               │
│                             SCOPE BOUNDARY                         │
│                             (This audit defines)                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Classification Criteria

**VENDOR-APPLICABLE** (Include in VCQ):
- [ ] Can be technically implemented by a software product
- [ ] Is verifiable during vendor evaluation
- [ ] Applies to product functionality, not organizational operation
- [ ] Does not require organizational structural changes

**ORGANIZATION-ONLY** (Exclude from VCQ):
- [ ] Requires governance/policy decisions
- [ ] Involves registration/notification to authorities
- [ ] Relates to liability, insurance, or legal personality
- [ ] Requires supervision or audit cooperation
- [ ] Involves workforce structure, training, or HR

### 2.3 Edge Cases

| Scenario | Classification | Rationale |
|----------|---------------|-----------|
| "Implement security-by-design" | **VENDOR** | Product architecture |
| "Notify users of security breaches" | **VENDOR** | Product capability (notification system) |
| "Maintain liability insurance" | **ORG** | Organizational obligation |
| "Register with supervisory body" | **ORG** | Organizational action |
| "Keep data logically separate" | **VENDOR** | Product architecture |
| "Implement functionally separate" | **BOTH** | Product + Organization |
| "Comply with GDPR Art. 28" | **VENDOR** | Vendor contract terms |
| "Establish internal audit function" | **ORG** | Organizational structure |

---

## 3. Audit Methodology

### 3.1 Per-Requirement Disposition

For each RCA requirement, assign one of:

| Code | Disposition | Action |
|------|-------------|--------|
| **V** | Vendor-Applicable | Check if in VCQ → Add if missing |
| **O** | Organization-Only | Document as intentional exclusion |
| **P** | Partial | Split into vendor/org components |
| **X** | Already Covered | Map to existing VCQ requirement |

### 3.2 Audit Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AUDIT WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │
│   │ 1. EXTRACT   │───▶│ 2. CLASSIFY  │───▶│ 3. CROSS-REF │        │
│   │ RCA Reqs     │    │ V/O/P        │    │ to VCQ       │        │
│   └──────────────┘    └──────────────┘    └──────────────┘        │
│                                                  │                  │
│                              ┌───────────────────┼───────────────┐ │
│                              ▼                   ▼               ▼ │
│                       ┌──────────┐        ┌──────────┐    ┌──────┐│
│                       │ MATCHED  │        │ GAP      │    │ ORG  ││
│                       │ (Code X) │        │ (Code V) │    │ ONLY ││
│                       └──────────┘        └──────────┘    └──────┘│
│                              │                   │               │ │
│                              ▼                   ▼               ▼ │
│                       ┌──────────┐        ┌──────────┐    ┌──────┐│
│                       │ Verify   │        │ ADD TO   │    │Document│
│                       │ Coverage │        │ VCQ      │    │Exclus.││
│                       └──────────┘        └──────────┘    └──────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 Deliverables Per Role

| Deliverable | Content |
|-------------|---------|
| **Mapping Matrix** | RCA ID → Disposition → VCQ ID (if applicable) |
| **Gap List** | RCA requirements to add to VCQ |
| **Exclusion Log** | RCA requirements intentionally excluded with rationale |
| **Implementation Diff** | YAML additions to VCQ files |

---

## 4. Implementation Plan

### Phase 1: Preparation (30 min)

| Step | Task | Output |
|------|------|--------|
| 1.1 | Create audit tracking structure in session | `RCA_VCQ_AUDIT_TRACKER.md` |
| 1.2 | Document scope boundary in knowledge base | KI artifact update |
| 1.3 | Extract all RCA Issuer requirements to table | Raw input for audit |
| 1.4 | Extract all RCA RP requirements to table | Raw input for audit |

### Phase 2: RCA Issuer Audit (60-90 min)

| Step | Task | Input | Output |
|------|------|-------|--------|
| 2.1 | Extract RCA Issuer reqs (42) | `rca/requirements/issuer.yaml` | Requirements table |
| 2.2 | Classify each as V/O/P | Requirements table | Classified table |
| 2.3 | Cross-reference V reqs to VCQ | VCQ Issuer (39 reqs) | Mapping matrix |
| 2.4 | Identify gaps | Mapping matrix | Gap list |
| 2.5 | Draft VCQ additions | Gap list | YAML additions |
| 2.6 | Document exclusions | O-classified reqs | Exclusion log |

**Expected Outcome**:
- RCA Issuer: 42 requirements
- Estimated Organization-Only: ~15-20
- Estimated Vendor-Applicable: ~22-27
- Current VCQ Issuer: 39 (may include non-RCA reqs)
- Estimated Gaps: 5-10 requirements

### Phase 3: RCA Relying Party Audit (90-120 min)

| Step | Task | Input | Output |
|------|------|-------|--------|
| 3.1 | Extract RCA RP reqs (102) | `rca/requirements/relying-party.yaml` | Requirements table |
| 3.2 | Classify each as V/O/P | Requirements table | Classified table |
| 3.3 | Cross-reference V reqs to VCQ | VCQ Core (38) + Intermediary (33) | Mapping matrix |
| 3.4 | Identify gaps | Mapping matrix | Gap list |
| 3.5 | Draft VCQ additions | Gap list | YAML additions |
| 3.6 | Document exclusions | O-classified reqs | Exclusion log |

**Expected Outcome**:
- RCA RP: 102 requirements
- Estimated Organization-Only: ~40-50
- Estimated Vendor-Applicable: ~52-62
- Current VCQ RP: 71 (core + intermediary)
- Estimated Gaps: 10-20 requirements

### Phase 4: Gap Remediation (30-60 min per role)

| Step | Task | Input | Output |
|------|------|-------|--------|
| 4.1 | Add Issuer gaps to VCQ | Gap list | Updated `vcq/requirements/issuer.yaml` |
| 4.2 | Add RP gaps to VCQ | Gap list | Updated `vcq/requirements/core.yaml` or `intermediary.yaml` |
| 4.3 | Validate build | All VCQ files | Build success |
| 4.4 | Verify requirement counts | Build output | Statistics |

### Phase 5: Documentation (30 min)

| Step | Task | Output |
|------|------|--------|
| 5.1 | Update eIDAS KB knowledge item | Decision DEC-281 |
| 5.2 | Update VCQ knowledge item | Audit methodology documentation |
| 5.3 | Create scope boundary artifact | `rca_vcq_scope_boundary.md` |
| 5.4 | Archive audit tracker | Session artifact |

---

## 5. Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Preparation | 30 min | 0:30 |
| Phase 2: Issuer Audit | 90 min | 2:00 |
| Phase 3: RP Audit | 120 min | 4:00 |
| Phase 4: Remediation | 60 min | 5:00 |
| Phase 5: Documentation | 30 min | 5:30 |
| **Total** | **~5.5 hours** | |

**Recommended Approach**: Execute in 2-3 sessions:
1. Session 1: Phases 1-2 (Issuer) - ~2 hours
2. Session 2: Phase 3 (RP) - ~2 hours
3. Session 3: Phases 4-5 - ~1.5 hours

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scope creep to other roles | Medium | High | Strict role focus (Issuer, RP only) |
| Ambiguous V/O classification | High | Medium | Clear classification criteria, document edge cases |
| VCQ schema changes needed | Low | High | Use existing categories, add only if necessary |
| Missing RCA requirements | Low | High | Cross-reference with regulation text |
| Build failures after additions | Medium | Medium | Incremental commits, validation after each phase |

---

## 7. Success Criteria

### 7.1 Quantitative

| Metric | Target |
|--------|--------|
| RCA Issuer requirements audited | 100% (42/42) |
| RCA RP requirements audited | 100% (102/102) |
| Gaps identified and remediated | 100% |
| Build success | ✅ |
| VCQ requirement count increase | Documented |

### 7.2 Qualitative

| Criterion | Evidence |
|-----------|----------|
| Scope boundary clearly defined | Knowledge item artifact |
| All exclusions documented with rationale | Exclusion log |
| Audit methodology repeatable | Tracker template preserved |
| No regulatory gaps in VCQ for vendor-applicable requirements | Audit sign-off |

---

## 8. Approval

### 8.1 Pre-Conditions

- [ ] User reviewed and understands implementation plan
- [ ] User confirms scope: Issuer + Relying Party roles only
- [ ] User confirms approach: Manual audit with documentation
- [ ] User provides green light to proceed

### 8.2 Decision Record

**Decision ID**: DEC-281 (proposed)  
**Title**: RCA↔VCQ Systematic Gap Audit  
**Date**: 2026-01-29  
**Status**: PENDING USER APPROVAL

---

## Appendix A: File References

### RCA Files (Input)

| File | Role | Req Count |
|------|------|-----------|
| `config/rca/requirements/issuer.yaml` | Issuer | 42 |
| `config/rca/requirements/relying-party.yaml` | Relying Party | 102 |

### VCQ Files (Output)

| File | Scope | Req Count |
|------|-------|-----------|
| `config/vcq/requirements/issuer.yaml` | Issuer products | 39 → TBD |
| `config/vcq/requirements/core.yaml` | RP core | 38 → TBD |
| `config/vcq/requirements/intermediary.yaml` | RP intermediaries | 33 → TBD |
| `config/vcq/requirements/trust_services.yaml` | QTSP products | 19 → TBD |

---

## Appendix B: Knowledge Base Updates

### Artifacts to Create/Update

1. **New**: `/artifacts/architecture/rca_vcq_scope_boundary.md`
   - Scope boundary definition
   - Classification criteria
   - Edge case decisions

2. **Update**: `overview.md` in eIDAS 2.0 Knowledge Base
   - Reference DEC-281
   - Link to scope boundary artifact

3. **Update**: VCQ Knowledge Item
   - Document audit methodology
   - Add audit results summary

---

**END OF PLAN**

---

## USER ACTION REQUIRED

Please review this plan and confirm:

1. ✅ Scope is correct (Issuer + Relying Party roles)
2. ✅ Approach is acceptable (manual audit with full documentation)
3. ✅ Timeline is feasible (~5.5 hours across 2-3 sessions)
4. ✅ Deliverables meet your needs

**Reply with your green light to proceed with Phase 1.**
