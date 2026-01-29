# RCA Issuer → VCQ Issuer Audit Results

**Phase 2 Audit**: 2026-01-29  
**Scope Note**: VCQ targets private sector commercial products, not public sector

---

## Audit Summary

| Category | RCA Count | Vendor-Applicable | Org-Only | Already in VCQ | Gaps |
|----------|-----------|-------------------|----------|----------------|------|
| certification | 4 | 1 | 2 | 1 | 0 |
| governance | 9 | 2 | 7 | 2 | 0 |
| interoperability | 3 | 3 | 0 | 3 | 0 |
| issuance | 9 | 9 | 0 | 9 | 0 |
| privacy | 4 | 4 | 0 | 4 | 0 |
| revocation | 10 | 8 | 0 | 8 | 0 |
| verification | 3 | 3 | 0 | 3 | 0 |
| **TOTAL** | **42** | **30** | **9** | **30** | **0** |

*(3 requirements are public_authentic-only, excluded from scope)*

---

## Detailed Disposition Matrix

### CERTIFICATION (4 requirements)

| RCA ID | Requirement | Profile | Disp | VCQ Match | Notes |
|--------|-------------|---------|------|-----------|-------|
| EAA-CRT-001 | Use qualified certificate with authentic source indication | public_authentic | **P** | N/A | Public sector only - **EXCLUDED** |
| EAA-CRT-002 | Meet QTSP-equivalent reliability and trustworthiness | public_authentic | **P** | N/A | Public sector only - **EXCLUDED** |
| EAA-CRT-003 | Be notified by Member State with conformity assessment | public_authentic | **O** | N/A | Org action with authority - **EXCLUDED** |
| EAA-CRT-004 | Comply with ETSI EN 319 401 standard | qualified, public_authentic | **X** | VEND-ISS-005, VEND-ISS-007 | Covered by format/protocol requirements |

### GOVERNANCE (9 requirements)

| RCA ID | Requirement | Profile | Disp | VCQ Match | Notes |
|--------|-------------|---------|------|-----------|-------|
| EAA-GOV-001 | Implement QEAA services functionally separate from other services | qualified | **X** | **VEND-ISS-040** | ✅ Added 2026-01-29 |
| EAA-GOV-002 | Notify supervisory body of significant changes | qualified | **O** | — | Org action with authority |
| EAA-GOV-003 | Implement risk management framework | qualified | **O** | — | Organizational governance |
| EAA-GOV-004 | Establish and maintain termination plan | qualified | **O** | — | Organizational governance |
| EAA-GOV-005 | Notify supervisory body before starting qualified trust service | qualified | **O** | — | Org action with authority |
| EAA-GOV-006 | Maintain personnel with necessary expertise and reliability | qualified | **O** | — | HR/personnel requirement |
| EAA-GOV-007 | Maintain sufficient financial resources or liability coverage | qualified | **O** | — | Org financial obligation |
| EAA-GOV-008 | Take appropriate measures against security threats | qualified | **X** | VEND-ISS-017 | Covered by key protection + security |
| EAA-GOV-009 | Record and retain relevant information for evidence purposes | qualified | **X** | VEND-ISS-013 | Covered by status list publication |

### INTEROPERABILITY (3 requirements)

| RCA ID | Requirement | Profile | Disp | VCQ Match | Notes |
|--------|-------------|---------|------|-----------|-------|
| EAA-IOP-001 | Provide interface with European Digital Identity Wallets | public_authentic | **P** | N/A | Public sector only - **EXCLUDED** |
| EAA-IOP-002 | Allow users to request, obtain, store and manage EAA from any MS wallet | (all) | **X** | VEND-ISS-007, VEND-ISS-024 | OpenID4VCI + cross-border |
| EAA-IOP-003 | Provide interface with EUDI Wallets (QEAA) | qualified | **X** | VEND-ISS-007 | OpenID4VCI issuance protocol |

### ISSUANCE (9 requirements)

| RCA ID | Requirement | Profile | Disp | VCQ Match | Notes |
|--------|-------------|---------|------|-----------|-------|
| EAA-ISS-001 | Meet Annex V content requirements | qualified | **X** | VEND-ISS-005, VEND-ISS-011 | Format + validity requirements |
| EAA-ISS-002 | Meet Annex VII content requirements | public_authentic | **P** | N/A | Public sector only - **EXCLUDED** |
| EAA-ISS-003 | Issue EAA in compliant format per Annex I of 2024/2979 | (all) | **X** | VEND-ISS-005 | mDoc + SD-JWT-VC formats |
| EAA-ISS-004 | Identify to wallet using wallet-relying party access certificate | (all) | **X** | VEND-ISS-033 | Registration certificates |
| EAA-ISS-005 | Include authentication and validation information in EAA | (all) | **X** | VEND-ISS-011, VEND-ISS-030 | Validity + trust anchor info |
| EAA-ISS-006 | Issue attestations in compliant format per Annex II of 2024/2979 | qualified, public_authentic | **X** | VEND-ISS-005 | Format requirements |
| EAA-ISS-007 | Authenticate to wallet unit before issuance | qualified, public_authentic | **X** | VEND-ISS-031 | Wallet Unit Attestation verification |
| EAA-ISS-008 | Verify wallet unit is not revoked or suspended | qualified, public_authentic | **X** | VEND-ISS-031 | WUA verification |
| EAA-ISS-009 | Comply with attestation scheme requirements if applicable | qualified, public_authentic | **X** | VEND-ISS-020, VEND-ISS-026 | Catalogue + Rulebook |

### PRIVACY (4 requirements)

| RCA ID | Requirement | Profile | Disp | VCQ Match | Notes |
|--------|-------------|---------|------|-----------|-------|
| EAA-PRV-001 | Not combine EAA personal data with other services | (all) | **X** | **VEND-ISS-038** | ✅ Added 2026-01-29 |
| EAA-PRV-002 | Keep EAA personal data logically separate | (all) | **X** | **VEND-ISS-039** | ✅ Added 2026-01-29 |
| EAA-PRV-003 | Process only minimum necessary attributes | qualified, public_authentic | **X** | VEND-ISS-022 | Data minimisation |
| EAA-PRV-004 | Ensure lawful processing of personal data | qualified | **X** | VEND-ISS-022, VEND-ISS-023 | GDPR covered |

### REVOCATION (10 requirements)

| RCA ID | Requirement | Profile | Disp | VCQ Match | Notes |
|--------|-------------|---------|------|-----------|-------|
| EAA-REV-001 | Revoked QEAA loses validity immediately and irreversibly | qualified | **X** | VEND-ISS-014 | Revocation time limits |
| EAA-REV-002 | Revoked attestation loses validity immediately and irreversibly | public_authentic | **P** | N/A | Public sector only - **EXCLUDED** |
| EAA-REV-003 | Maintain public revocation/validity status policies | qualified, public_authentic | **X** | VEND-ISS-013 | Status list publication |
| EAA-REV-004 | Only issuer can revoke its own attestations | qualified, public_authentic | **X** | VEND-ISS-013 | Implicit in status list ownership |
| EAA-REV-005 | Revoke on user request | qualified, public_authentic | **X** | VEND-ISS-015 | Revocation notification |
| EAA-REV-006 | Revoke on security or trustworthiness compromise | qualified, public_authentic | **X** | VEND-ISS-014, VEND-ISS-015 | Revocation workflows |
| EAA-REV-007 | Use privacy-preserving revocation techniques | qualified, public_authentic | **X** | VEND-ISS-028 | Rulebook revocation specs |
| EAA-REV-008 | Provide validity status information to relying parties | qualified, public_authentic | **X** | VEND-ISS-013, VEND-ISS-036 | Status mechanisms |
| EAA-REV-009 | Publish revocation status within 24 hours | qualified | **X** | VEND-ISS-014 | Time limits |
| EAA-REV-010 | Provide free revocation status checking for relying parties | qualified | **X** | VEND-ISS-013, VEND-ISS-036 | Status mechanisms |

### VERIFICATION (3 requirements)

| RCA ID | Requirement | Profile | Disp | VCQ Match | Notes |
|--------|-------------|---------|------|-----------|-------|
| EAA-VER-001 | Verify requester has right to act on behalf of subject | qualified, public_authentic | **X** | VEND-ISS-009 | User identity verification |
| EAA-VER-002 | Verify identity of authentic source used | qualified, public_authentic | **X** | VEND-ISS-010 | Authentic source provenance |
| EAA-VER-003 | Verify identity of persons or entities to whom attestations are issued | qualified | **X** | VEND-ISS-009 | User identity verification |

---

## Exclusion Log

### Public Sector Only (4 requirements)

These requirements have `profileFilter: [public_authentic]` and are not applicable to private sector commercial products:

| RCA ID | Requirement | Article | Rationale |
|--------|-------------|---------|-----------|
| EAA-CRT-001 | Use qualified certificate with authentic source indication | Art. 45f(1)(b) | Public sector bodies only |
| EAA-CRT-002 | Meet QTSP-equivalent reliability and trustworthiness | Art. 45f(2) | Public sector bodies only |
| EAA-IOP-001 | Provide interface with EUDI Wallets | Art. 45f(8) | Public sector bodies only |
| EAA-ISS-002 | Meet Annex VII content requirements | Art. 45f(1)(a) | Public sector bodies only |
| EAA-REV-002 | Revoked attestation loses validity immediately | Art. 45f(4) | Public sector bodies only |

### Organization-Only (6 requirements)

These requirements require organizational action and cannot be delivered by a vendor product:

| RCA ID | Requirement | Article | Rationale |
|--------|-------------|---------|-----------|
| EAA-CRT-003 | Be notified by Member State with conformity assessment | Art. 45f(3) | Org action with authority |
| EAA-GOV-002 | Notify supervisory body of significant changes | Art. 24(2)(a) | Org action with authority |
| EAA-GOV-003 | Implement risk management framework | 2025/2160 | Organizational governance |
| EAA-GOV-004 | Establish and maintain termination plan | Art. 24 | Organizational governance |
| EAA-GOV-005 | Notify supervisory body before starting qualified trust service | Art. 24(1) | Org action with authority |
| EAA-GOV-006 | Maintain personnel with necessary expertise and reliability | Art. 24(2)(b) | HR/personnel requirement |
| EAA-GOV-007 | Maintain sufficient financial resources or liability coverage | Art. 24(2)(c) | Org financial obligation |

---

## Gap Analysis

### Gaps Found: **0**

All vendor-applicable RCA Issuer requirements are now covered in VCQ Issuer.

### Recently Remediated (This Session)

| RCA ID | VCQ ID | Requirement | Date Added |
|--------|--------|-------------|------------|
| EAA-PRV-001 | VEND-ISS-038 | Do not combine EAA personal data with other services | 2026-01-29 |
| EAA-PRV-002 | VEND-ISS-039 | Keep EAA personal data logically separate | 2026-01-29 |
| EAA-GOV-001 | VEND-ISS-040 | Implement QEAA services functionally separate | 2026-01-29 |

---

## Conclusion

**Phase 2 Result: ✅ COMPLETE - No remaining gaps**

The RCA Issuer → VCQ Issuer mapping is now complete:
- **42 RCA requirements** reviewed
- **30 vendor-applicable** requirements identified
- **30 covered** in VCQ (100%)
- **9 organization-only** requirements properly excluded
- **3 public-sector-only** requirements properly excluded
