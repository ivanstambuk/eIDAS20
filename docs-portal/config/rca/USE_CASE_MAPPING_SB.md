# Use Case Mapping Tracker: Supervisory Body

**Date completed:** 2026-01-20
**Decision record:** DEC-088
**Total requirements:** 42
**Schema version:** V1

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔄 | Reviewed — unchanged (already correct) |

---

## Analysis Summary

### Key Finding: All Supervisory Body Requirements Are Universal

**All 42 Supervisory Body requirements are correctly mapped to `useCases: all`.**

**Rationale:**

Supervisory Bodies (SBs) are *government/regulatory oversight bodies*, not service providers. They supervise:
- Wallet Providers
- Trust Service Providers (Qualified and Non-Qualified)
- Relying Parties
- Conformity Assessment Bodies

SB requirements govern *how to supervise*, not *what services are being supervised*. A supervisory body overseeing QTSPs for qualified signatures has the same cooperation, reporting, and enforcement obligations as one overseeing QTSPs for qualified timestamps.

---

## Requirements by Category

### Governance (18 requirements) — All Universal 🔄

Governance requirements cover:
- **Designation** (SB-GOV-001, 002): MS must designate supervisory bodies
- **Wallet supervision** (SB-GOV-003 through 009): Ex ante/ex post supervision, inspections, enforcement
- **Trust service supervision** (SB-GOV-010 through 018): QTSP supervision, status granting, termination verification

All requirements are agnostic to which trust service type or wallet use case is being supervised.

### Interoperability (16 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| SB-IOP-001 | Cooperate with other SBs (wallet) | Universal cooperation |
| SB-IOP-002 | Cooperate with DPAs (wallet) | Universal DPA coordination |
| SB-IOP-003 | Cooperate with other SBs (TSP) | Universal cooperation |
| SB-IOP-004 | Cooperate with DPAs (TSP) | Universal DPA coordination |
| SB-IOP-005 | Single point of contact | Universal SPOC requirement |
| SB-IOP-006 | SPOC liaison function | Universal coordination |
| SB-IOP-007 | Mutual assistance | Universal assistance mechanism |
| SB-IOP-008 | Inform and consult other SBs | Universal communication |
| SB-IOP-009 | Request supervisory measures | Universal enforcement support |
| SB-IOP-010 | Joint investigations | Universal investigation power |
| SB-IOP-011 | Refusal of assistance grounds | Universal limitation |
| SB-IOP-012 | Cooperation Group participation | Universal participation |
| SB-IOP-013 | Exchange best practices | Universal knowledge sharing |
| SB-IOP-014 | Joint NIS Cooperation Group meetings | Universal cybersecurity coordination |
| SB-IOP-015 | Peer reviews of eID schemes | Universal peer review |
| SB-IOP-016 | Effective Cooperation Group participation | Universal commitment |

### Registration (3 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| SB-REG-001 | Notify Commission of SB designation | Universal notification |
| SB-REG-002 | Inform trusted list body of status decisions | Universal status communication |
| SB-REG-003 | Make SPOC details public | Universal transparency |

### Security (3 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| SB-SEC-001 | Inform NIS2 authorities (wallet) | Universal security coordination |
| SB-SEC-002 | Inform NIS2 authorities (TSP) | Universal security coordination |
| SB-SEC-003 | Annual breach summary to ENISA | Universal reporting |

### Transparency (2 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| SB-TRN-001 | Annual activity report (wallet) | Universal reporting |
| SB-TRN-002 | Annual activity report (TSP) | Universal reporting |

---

## Final Summary

| Metric | Count |
|--------|-------|
| Total requirements | 42 |
| Already correctly mapped (`all`) | 42 |
| **Changes needed** | **0** |

---

## Conclusion

Supervisory Bodies are the "regulators" of the eIDAS ecosystem. The "Infrastructure Universalism" pattern applies: SB requirements govern *regulatory oversight*, which is service-agnostic.

**No changes required.**

---

## Audit Complete

**Date completed:** 2026-01-20 20:25 CET
**Requirements analyzed:** 42
**Changes applied:** 0
**Build verified:** ✅ N/A (no changes)
