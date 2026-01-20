# Use Case Mapping Tracker: EAA Issuer

**Date completed:** 2026-01-20
**Decision record:** DEC-088
**Total requirements:** 42
**Schema version:** V3

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔄 | Reviewed — unchanged (already correct) |

---

## Analysis Summary

### Key Finding: All EAA Issuer Requirements Are Universal

**All 42 EAA Issuer requirements are correctly mapped to `useCases: all`.**

**Rationale:**

EAA Issuers (Qualified EAA providers, Public Sector Authentic Source issuers, Non-qualified issuers) are *credential providers*. They issue electronic attestations of attributes that *enable* various use cases (age verification, professional qualifications, health credentials, etc.), but the issuer obligations themselves don't depend on which use case the attestation will eventually serve.

---

## Requirements by Category

### Certification (4 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| EAA-CRT-001 | Use QC with authentic source indication | Public authentic source — universal credential requirements |
| EAA-CRT-002 | Meet QTSP-equivalent reliability | Universal trustworthiness baseline |
| EAA-CRT-003 | Be notified by MS with conformity assessment | Universal regulatory compliance |
| EAA-CRT-004 | Comply with ETSI EN 319 401 | Universal technical standards |

### Governance (9 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| EAA-GOV-001 | Functional separation from other services | QEAA operational isolation |
| EAA-GOV-002 | Notify supervisory body of changes | Universal compliance requirement |
| EAA-GOV-003 | Implement risk management framework | Universal governance |
| EAA-GOV-004 | Establish termination plan | Universal continuity assurance |
| EAA-GOV-005 | Notify before starting qualified service | Pre-service obligation |
| EAA-GOV-006 | Maintain qualified personnel | Universal staffing requirement |
| EAA-GOV-007 | Maintain financial resources/insurance | Universal liability coverage |
| EAA-GOV-008 | Take security measures | Universal protection |
| EAA-GOV-009 | Record and retain information | Universal evidence retention |

### Interoperability (3 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| EAA-IOP-001 | Provide interface with EUDI Wallets (PSB) | Wallet integration applies to all attestation types |
| EAA-IOP-002 | Allow users from any MS wallet to obtain EAA | Cross-border universal |
| EAA-IOP-003 | Provide interface with EUDI Wallets (QEAA) | Wallet integration applies to all attestation types |

### Issuance (9 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| EAA-ISS-001 | Meet Annex V content requirements | QEAA format — applies regardless of content |
| EAA-ISS-002 | Meet Annex VII content requirements | PSB format — applies regardless of content |
| EAA-ISS-003 | Issue in compliant format per Annex I | Universal format compliance |
| EAA-ISS-004 | Identify to wallet using WRPAC | Universal issuer authentication |
| EAA-ISS-005 | Include auth/validation info in EAA | Universal attestation integrity |
| EAA-ISS-006 | Issue in format per Annex II | Universal format compliance |
| EAA-ISS-007 | Authenticate to wallet before issuance | Universal issuance procedure |
| EAA-ISS-008 | Verify wallet not revoked/suspended | Universal wallet validation |
| EAA-ISS-009 | Comply with attestation scheme if applicable | Universal scheme compliance |

### Privacy (4 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| EAA-PRV-001 | Not combine EAA data with other services | Universal data isolation |
| EAA-PRV-002 | Keep EAA data logically separate | Universal data separation |
| EAA-PRV-003 | Process only minimum necessary attributes | Universal data minimization |
| EAA-PRV-004 | Ensure lawful processing per GDPR | Universal GDPR compliance |

### Revocation (10 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| EAA-REV-001 | Revoked QEAA loses validity immediately | Universal revocation effect |
| EAA-REV-002 | Revoked PSB attestation loses validity | Universal revocation effect |
| EAA-REV-003 | Maintain public revocation policies | Universal transparency |
| EAA-REV-004 | Only issuer can revoke | Universal authority |
| EAA-REV-005 | Revoke on user request | Universal user right |
| EAA-REV-006 | Revoke on security compromise | Universal security measure |
| EAA-REV-007 | Use privacy-preserving revocation | Universal privacy protection |
| EAA-REV-008 | Provide validity status to RPs | Universal status disclosure |
| EAA-REV-009 | Publish revocation within 24 hours | Universal timeliness |
| EAA-REV-010 | Provide free revocation status checking | Universal RP access |

### Verification (3 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| EAA-VER-001 | Verify requester's right to act on behalf | Universal authorization check |
| EAA-VER-002 | Verify identity of authentic source | Universal source verification |
| EAA-VER-003 | Verify identity of attestation recipients | Universal identity verification |

---

## Final Summary

| Metric | Count |
|--------|-------|
| Total requirements | 42 |
| Already correctly mapped (`all`) | 42 |
| **Changes needed** | **0** |

---

## Conclusion

The "Infrastructure Universalism" pattern applies: EAA Issuer requirements govern the *provider* obligations, not the *credential content* or *end use*. An issuer providing age verification attestations has the same certification, governance, issuance, and revocation obligations as one issuing professional qualification attestations.

**No changes required.**

---

## Audit Complete

**Date completed:** 2026-01-20 20:18 CET
**Requirements analyzed:** 42
**Changes applied:** 0
**Build verified:** ✅ N/A (no changes)
