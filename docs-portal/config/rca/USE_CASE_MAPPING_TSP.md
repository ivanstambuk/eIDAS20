# Use Case Mapping Tracker: Trust Service Provider

**Date completed:** 2026-01-20
**Decision record:** DEC-088
**Total requirements:** 85
**Schema version:** V2

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔄 | Reviewed — unchanged (already correct) |

---

## Analysis Summary

### Key Finding: All TSP Requirements Are Universal

**All 85 TSP requirements are correctly mapped to `useCases: all`.**

**Rationale:**

Trust Service Providers are *infrastructure providers*, not end-user service consumers. They provide trust services (signatures, seals, timestamps, attestations, archiving, certificates, QSCD management) that *enable* various use cases, but the TSP obligations themselves don't depend on which use case their customers pursue.

---

## Requirements by Category

### Certification (5 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| TSP-CRT-001 | Submit to conformity assessment every 24 months | Applies to all QTSPs regardless of service type |
| TSP-CRT-002 | Submit CAR within 3 working days | Compliance reporting is universal |
| TSP-CRT-003 | Submit CAR before starting qualified services | Pre-service requirement |
| TSP-CRT-004 | Use accredited CABs for biometric verification | Identity proofing applies to all certificate types |
| TSP-CRT-005 | Test identity document validation every 2 years | Document validation is universal |

### Governance (30 requirements) — All Universal 🔄

Governance requirements cover:
- Risk management (TSP-GOV-002, 006, 012, 021-026)
- Staff qualifications (TSP-GOV-005)
- Termination planning (TSP-GOV-008, 013-020)
- Data retention and continuity (TSP-GOV-007, 009-010, 019)
- Accessibility (TSP-GOV-001)
- Revocation policies (TSP-GOV-027)
- Identity verification standards (TSP-GOV-028-029)
- Security training (TSP-GOV-030)

All apply universally to TSP operations regardless of end-user use case.

### Liability (4 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| TSP-LIA-001 | Accept liability for non-compliance damages | Universal liability principle |
| TSP-LIA-002 | Limit liability through advance notification | Universal business practice |
| TSP-LIA-003 | Maintain financial resources/insurance | QTSP-wide requirement |
| TSP-LIA-004 | Maintain resources for termination costs | QTSP-wide requirement |

### Privacy (3 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| TSP-PRV-001 | Use secure data storage with access controls | Universal data protection |
| TSP-PRV-002 | Ensure lawful processing per GDPR | Universal GDPR compliance |
| TSP-PRV-003 | Use privacy-preserving revocation | Universal privacy requirement |

### Registration (1 requirement) — Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| TSP-REG-001 | Provide 8 mandatory info items when notifying | Universal registration requirement |

### Security (9 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| TSP-SEC-001 | Implement security measures | Universal security baseline |
| TSP-SEC-002 | Notify security breaches within 24 hours | All TSPs |
| TSP-SEC-003 | Notify breaches (non-qualified) | Non-qualified TSP specific |
| TSP-SEC-004 | Notify breaches (qualified) | QTSP specific |
| TSP-SEC-005 | Protect against forgery/theft | Universal data protection |
| TSP-SEC-006 | Limit data duplication for backup | QTSP backup procedures |
| TSP-SEC-007 | Perform quarterly vulnerability scans | QTSP security testing |
| TSP-SEC-008 | Perform annual penetration tests | QTSP security testing |
| TSP-SEC-009 | Configure firewalls appropriately | Universal network security |

### Technical (17 requirements) — All Universal 🔄

Technical requirements cover certificate content (TEC-003, 006, 007, 008), QSCD security (TEC-004, 005), cryptographic techniques (TEC-001, 013), ETSI standards compliance (TEC-009-012, 015), and archiving (TEC-014, 016, 017).

All are infrastructure requirements that apply regardless of customer use case.

### Transparency (14 requirements) — All Universal 🔄

Transparency requirements cover notification obligations, publication of terms, certificate status information, and public documentation. All apply universally to TSP operations.

### Verification (2 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| TSP-VER-001 | Verify identity when issuing certificates | Universal identity verification |
| TSP-VER-002 | Use approved verification methods | Universal verification methods |

---

## Final Summary

| Metric | Count |
|--------|-------|
| Total requirements | 85 |
| Already correctly mapped (`all`) | 85 |
| **Changes needed** | **0** |

---

## Conclusion

The "Infrastructure Universalism" pattern applies: TSP requirements govern the *provider* obligations, not the *customer* use cases. A QTSP issuing qualified certificates for eSignatures has the same certification, governance, security, and transparency obligations as one issuing certificates for website authentication.

**No changes required.**

---

## Audit Complete

**Date completed:** 2026-01-20 20:15 CET
**Requirements analyzed:** 85
**Changes applied:** 0
**Build verified:** ✅ N/A (no changes)
