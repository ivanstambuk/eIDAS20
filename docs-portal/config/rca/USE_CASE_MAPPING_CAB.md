# Use Case Mapping Tracker: Conformity Assessment Body

**Date completed:** 2026-01-20
**Decision record:** DEC-088
**Total requirements:** 36
**Schema version:** V1

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔄 | Reviewed — unchanged (already correct) |

---

## Analysis Summary

### Key Finding: All CAB Requirements Are Universal

**All 36 CAB requirements are correctly mapped to `useCases: all`.**

**Rationale:**

Conformity Assessment Bodies (CABs) are *audit and certification bodies*, not end-user service providers. They assess and certify:
- Qualified Trust Service Providers
- Wallet Providers
- PID Providers
- Other ecosystem participants

CAB requirements govern *how to conduct assessments*, not *what services are being assessed*. A CAB auditing a QTSP for qualified signatures has the same accreditation, reporting, and governance obligations as one auditing a QTSP for qualified timestamps.

---

## Requirements by Category

### Governance (12 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| CAB-GOV-001 | Ensure subcontractor compliance | Universal subcontracting rule |
| CAB-GOV-002 | Enable QTSP report submission | Universal report handling |
| CAB-GOV-003 | Use ISO/IEC 17067 scheme type 6 | Universal scheme compliance |
| CAB-GOV-004 | Include Annex II standards in schemes | Universal standards reference |
| CAB-GOV-005 | Conduct yearly surveillance | Universal surveillance schedule |
| CAB-GOV-006 | Inform QTSPs of accreditation impacts | Universal communication |
| CAB-GOV-007 | Use ISO/IEC 17025 for testing | Universal testing standard |
| CAB-GOV-008 | Use ISO/IEC 17021-1 for audits | Universal audit standard |
| CAB-GOV-009 | Use ISO/IEC 17020 for inspections | Universal inspection standard |
| CAB-GOV-010 | Use ISO/IEC 17065 for assessments | Universal assessment standard |
| CAB-GOV-011 | Audit QTSPs every 24 months | Universal audit cycle |
| CAB-GOV-012 | Existing accreditation transition | Universal transition rule |

### Registration (3 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| CAB-REG-001 | Accreditation per ISO/IEC 17065 + ETSI EN 319403-1 | Universal accreditation |
| CAB-REG-002 | NAB accreditation per ISO/IEC 17011 | Universal accreditation structure |
| CAB-REG-003 | MS notification of CAB details | Universal transparency |

### Transparency (21 requirements) — All Universal 🔄

All CAB-TRN-* requirements (001-021) govern conformity assessment report content and publication. These are universal reporting obligations:

- **Report publication** (TRN-001)
- **Report format per Annex III** (TRN-002 through TRN-020)
- **Report issuance for QTSP initiation** (TRN-021)

These requirements are agnostic to which trust service type is being assessed — the report structure and publication requirements are the same whether auditing qualified signatures, seals, timestamps, or attestations.

---

## Final Summary

| Metric | Count |
|--------|-------|
| Total requirements | 36 |
| Already correctly mapped (`all`) | 36 |
| **Changes needed** | **0** |

---

## Conclusion

CABs are the "auditors of auditors" — they assess service providers, not end users. The "Infrastructure Universalism" pattern applies: CAB requirements govern *how to audit*, not *what services are audited*.

**No changes required.**

---

## Audit Complete

**Date completed:** 2026-01-20 20:22 CET
**Requirements analyzed:** 36
**Changes applied:** 0
**Build verified:** ✅ N/A (no changes)
