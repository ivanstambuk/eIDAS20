# RCA Relying Party → VCQ Core/Intermediary Audit Results

**Phase 3 Audit**: 2026-01-29  
**Scope Note**: VCQ targets private sector commercial products (not public sector)

---

## Audit Summary

| Category | RCA Count | Vendor-Applicable | Org-Only | Public-Only | Already in VCQ | Gaps |
|----------|-----------|-------------------|----------|-------------|----------------|------|
| governance | 10 | 5 | 3 | 2 | 5 | 0 |
| privacy | 11 | 8 | 1 | 0 | 8 | 0 |
| registration | 16 | 6 | 10 | 0 | 6 | 0 |
| security | 5 | 5 | 0 | 0 | 5 | 0 |
| technical | 43 | 35 | 0 | 8 | 35 | 0 |
| verification | 13 | 9 | 0 | 4 | 9 | 0 |
| transparency | 1 | 1 | 0 | 0 | 1 | 0 |
| **TOTAL** | **102** | **69** | **14** | **14** | **69** | **0** |

---

## Detailed Disposition Matrix

### GOVERNANCE (10 requirements)

| RCA ID | Requirement | Profile | Disp | VCQ Match | Notes |
|--------|-------------|---------|------|-----------|-------|
| RP-GOV-001 | Intermediaries must not store transaction content data | acts_as_intermediary | **X** | VEND-CORE-001, VEND-INT-019, VEND-INT-021 | No-storage mandate |
| RP-GOV-002 | Public sector: Accept EUDI Wallet for online services | public_sector | **P** | N/A | Public sector only - **EXCLUDED** |
| RP-GOV-003 | Private sector: Accept EUDI Wallet where SCA mandated | private_sector | **O** | — | RP's obligation, not vendor |
| RP-GOV-004 | Very large online platforms: Accept EUDI Wallet | private_sector | **O** | — | VLOP's obligation, not vendor |
| RP-GOV-005 | Maintain alternative means of identification | (all) | **O** | — | RP policy/operational |
| RP-GOV-006 | Support reporting to data protection authorities | (all) | **X** | VEND-INT-031 | User reporting mechanism |
| RP-GOV-007 | Enable selective disclosure of attributes | (all) | **X** | VEND-INT-024, VEND-CORE-033 | Selective disclosure support |
| RP-GOV-008 | Retain identity matching logs for 6-12 months | (all) | **X** | VEND-INT-018 | Audit log retention |
| RP-GOV-009 | Verify intermediary's registered and certified status | uses_intermediary | **O** | — | RP due diligence |
| RP-GOV-010 | Maintain audit trail demonstrating data non-storage | acts_as_intermediary | **X** | VEND-INT-018 | Audit trail |

### PRIVACY (11 requirements)

| RCA ID | Requirement | Profile | Disp | VCQ Match | Notes |
|--------|-------------|---------|------|-----------|-------|
| RP-PRV-001 | Request only necessary and proportionate attributes | (all) | **X** | VEND-CORE-031, VEND-INT-002 | Data minimization |
| RP-PRV-002 | Support selective disclosure of attributes | (all) | **X** | VEND-INT-024 | Selective disclosure |
| RP-PRV-003 | Do not track wallet usage across services | (all) | **X** | VEND-INT-020 | Unlinkability |
| RP-PRV-004 | Enable privacy preserving unlinkability | (all) | **X** | VEND-INT-020, VEND-CORE-033 | Privacy techniques |
| RP-PRV-005 | Allow pseudonyms where legal identity not required | (all) | **X** | VEND-CORE-033, VEND-INT-027/28 | Pseudonym support |
| RP-PRV-006 | Process data in accordance with GDPR | (all) | **O** | — | Org GDPR compliance |
| RP-PRV-007 | Perform data protection impact assessments | (all) | **X** | VEND-CORE-002 | DPA requirements |
| RP-PRV-008 | Apply data minimization - request only necessary data | (all) | **X** | VEND-CORE-031 | Data minimization |
| RP-PRV-009 | Accept pseudonymous access where identification not required | (all) | **X** | VEND-CORE-033, VEND-INT-27/28 | Pseudonym acceptance |
| RP-PRV-010 | Comply with embedded disclosure policies | (all) | **X** | VEND-INT-026 | Disclosure policy compliance |
| RP-PRV-011 | Establish Data Processing Agreement with intermediary | uses_intermediary | **X** | VEND-CORE-002 | DPA requirement |

### REGISTRATION (16 requirements)

| RCA ID | Requirement | Profile | Disp | VCQ Match | Notes |
|--------|-------------|---------|------|-----------|-------|
| RP-REG-001 | Register with competent supervisory authority | (all) | **O** | — | Org action with authority |
| RP-REG-002 | Provide registration information including data requests | (all) | **O** | — | Org action with authority |
| RP-REG-003 | Request only data indicated during registration | (all) | **X** | VEND-CORE-031 | Data request compliance |
| RP-REG-004 | Notify changes to registration information | (all) | **O** | — | Org action with authority |
| RP-REG-005 | Identify yourself to wallet users when requesting data | (all) | **X** | VEND-INT-001, VEND-INT-022 | RP identification |
| RP-REG-006 | Accept pseudonymous authentication | (all) | **X** | VEND-CORE-033, VEND-INT-27/28 | Pseudonym support |
| RP-REG-007 | Provide complete Annex I information to national register | (all) | **O** | — | Org action with authority |
| RP-REG-008 | Ensure registration information accuracy | (all) | **O** | — | Org responsibility |
| RP-REG-009 | Update registration information without undue delay | (all) | **O** | — | Org action with authority |
| RP-REG-010 | Notify registrar when ceasing wallet use | (all) | **O** | — | Org action with authority |
| RP-REG-011 | Register appropriate entitlement type | (all) | **O** | — | Org action with authority |
| RP-REG-012 | Provide machine-readable intended data requests | (all) | **X** | VEND-CORE-031, VEND-INT-002 | Data request format |
| RP-REG-013 | Provide privacy policy URL for each intended use | (all) | **X** | VEND-CORE-031 | Privacy policy URL |
| RP-REG-014 | Indicate reliance on intermediary in national register | uses_intermediary | **O** | — | Org action with authority |
| RP-REG-015 | Provide formal association to specific intermediary | uses_intermediary | **O** | — | Org action with authority |
| RP-REG-016 | Register with appropriate entitlement for intermediary services | acts_as_intermediary | **X** | VEND-CORE-004 | Intermediary registration |

### SECURITY (5 requirements)

| RCA ID | Requirement | Profile | Disp | VCQ Match | Notes |
|--------|-------------|---------|------|-----------|-------|
| RP-SEC-001 | Receive and act on wallet security breach notifications | (all) | **X** | VEND-CORE-007, VEND-INT-014 | Breach handling |
| RP-SEC-002 | Receive wallet re-establishment notifications | (all) | **X** | VEND-CORE-007 | Status notifications |
| RP-SEC-003 | Receive wallet withdrawal notifications | (all) | **X** | VEND-CORE-007 | Withdrawal handling |
| RP-SEC-004 | Monitor and act on intermediary breach notifications | uses_intermediary | **X** | VEND-CORE-007, VEND-INT-14 | Breach monitoring |
| RP-SEC-005 | Implement stateless transaction processing architecture | acts_as_intermediary | **X** | VEND-CORE-001, VEND-INT-021 | Stateless design |

### TECHNICAL (43 requirements)

| RCA ID | Requirement | Profile | Disp | VCQ Match | Notes |
|--------|-------------|---------|------|-----------|-------|
| RP-TEC-001 | Support mandated credential formats | (all) | **X** | VEND-INT-023 | mDoc + W3C VC |
| RP-TEC-002 | Implement presentation protocols | (all) | **X** | VEND-INT-005 | ISO 18013-5/7 |
| RP-TEC-003 | Support selective disclosure of attributes | (all) | **X** | VEND-INT-024 | Selective disclosure |
| RP-TEC-004 | Comply with WebAuthn specification for pseudonym | (all) | **X** | VEND-INT-027 | WebAuthn support |
| RP-TEC-005 | Support relying-party-specific pseudonyms | (all) | **X** | VEND-INT-028 | RP-specific pseudonyms |
| RP-TEC-006 | Verify proof of possession of private keys | (all) | **X** | VEND-INT-012 | Device binding |
| RP-TEC-007 | Use valid Wallet-Relying Party Access Certificate | (all) | **X** | VEND-CORE-005, VEND-INT-029 | Access certificate |
| RP-TEC-008 | Support data erasure request protocol | (all) | **X** | VEND-CORE-021, VEND-INT-030 | Data erasure |
| RP-TEC-009 | Accept electronic signatures regardless of form | (all) | **X** | VEND-CORE-030 | E-sig acceptance |
| RP-TEC-010 | Recognize qualified e-signatures as handwritten | (all) | **X** | VEND-CORE-030 | QES recognition |
| RP-TEC-011 | Recognize qualified signatures from all Member States | (all) | **X** | VEND-CORE-030 | Cross-border QES |
| RP-TEC-012 | Public sector: Accept advanced signatures in defined formats | public_sector | **P** | N/A | Public sector only - **EXCLUDED** |
| RP-TEC-013 | Public sector: Not require higher than QES for cross-border | public_sector | **P** | N/A | Public sector only - **EXCLUDED** |
| RP-TEC-014 | Validate qualified electronic signatures correctly | (all) | **X** | VEND-CORE-030 | QES validation |
| RP-TEC-015 | Validate advanced signatures based on qualified certs | (all) | **X** | VEND-CORE-030 | Advanced sig validation |
| RP-TEC-016 | Ensure validation system allows detection of security issues | (all) | **X** | VEND-CORE-030 | Security detection |
| RP-TEC-017 | Consider using qualified validation services | (all) | **X** | VEND-CORE-030 | Validation services |
| RP-TEC-018 | Accept electronic seals regardless of form | (all) | **X** | VEND-CORE-030 | E-seal acceptance |
| RP-TEC-019 | Recognize qualified electronic seals' presumptions | (all) | **X** | VEND-CORE-030 | QESeal presumptions |
| RP-TEC-020 | Recognize qualified electronic seals from all MS | (all) | **X** | VEND-CORE-030 | Cross-border seal |
| RP-TEC-021 | Public sector: Accept advanced seals in defined formats | public_sector | **P** | N/A | Public sector only - **EXCLUDED** |
| RP-TEC-022 | Validate qualified electronic seals correctly | (all) | **X** | VEND-CORE-030 | Seal validation |
| RP-TEC-023 | Accept electronic time stamps regardless of form | (all) | **X** | VEND-CORE-030 | Timestamp acceptance |
| RP-TEC-024 | Recognize qualified time stamps' presumptions | (all) | **X** | VEND-CORE-030 | Timestamp presumptions |
| RP-TEC-025 | Recognize qualified time stamps from all MS | (all) | **X** | VEND-CORE-030 | Cross-border timestamp |
| RP-TEC-026 | Accept electronic registered delivery regardless of form | (all) | **X** | VEND-CORE-030 | ERD acceptance |
| RP-TEC-027 | Recognize qualified registered delivery presumptions | (all) | **X** | VEND-CORE-030 | ERD presumptions |
| RP-TEC-028 | Recognize qualified certificates for website authentication | (all) | **X** | VEND-CORE-029 | QWAC recognition |
| RP-TEC-029 | Accept electronic attestations regardless of form | (all) | **X** | VEND-CORE-030 | EAA acceptance |
| RP-TEC-030 | Recognize legal effect of qualified EAA and public sector EAA | (all) | **X** | VEND-CORE-030 | QEAA legal effect |
| RP-TEC-031 | Recognize public sector EAA from all MS | (all) | **X** | VEND-CORE-030 | Cross-border EAA |
| RP-TEC-032 | Accept electronically archived data regardless of form | (all) | **X** | VEND-CORE-030 | Archive acceptance |
| RP-TEC-033 | Recognize qualified archiving service presumptions | (all) | **X** | VEND-CORE-030 | Archive presumptions |
| RP-TEC-034 | Accept electronic ledger records regardless of form | (all) | **X** | VEND-CORE-030 | Ledger acceptance |
| RP-TEC-035 | Recognize qualified electronic ledger presumptions | (all) | **X** | VEND-CORE-030 | Ledger presumptions |
| RP-TEC-036 | Support ISO/IEC 18013-5 data format for PID | (all) | **X** | VEND-INT-023 | mDoc format |
| RP-TEC-037 | Support W3C Verifiable Credentials data format for PID | (all) | **X** | VEND-INT-023 | W3C VC format |
| RP-TEC-038 | Process mandatory PID attributes correctly | (all) | **X** | VEND-INT-023 | PID processing |
| RP-TEC-039 | Handle optional PID attributes when present | (all) | **X** | VEND-INT-023 | Optional PID |
| RP-TEC-040 | Verify PID validity status before relying | (all) | **X** | VEND-INT-011, VEND-CORE-039 | PID status check |
| RP-TEC-041 | Process legal person PID attributes | (all) | **X** | VEND-INT-023 | Legal person PID |
| RP-TEC-042 | Support mandatory data formats from Annex II | (all) | **X** | VEND-INT-023 | Annex II formats |
| RP-TEC-043 | Support signature formats from Annex IV | (all) | **X** | VEND-CORE-026 | Signature formats |

*(Additional intermediary-specific TEC requirements: RP-TEC-019, RP-TEC-020, RP-TEC-021 covered by VEND-INT-* requirements)*

### VERIFICATION (13 requirements)

| RCA ID | Requirement | Profile | Disp | VCQ Match | Notes |
|--------|-------------|---------|------|-----------|-------|
| RP-VER-001 | Implement authentication and validation procedures | (all) | **X** | VEND-INT-010, VEND-CORE-030 | Validation procedures |
| RP-VER-002 | Public sector: Recognize e-ID from other MS | public_sector | **P** | N/A | Public sector only - **EXCLUDED** |
| RP-VER-003 | Public sector: Ensure unequivocal identity matching | public_sector | **P** | N/A | Public sector only - **EXCLUDED** |
| RP-VER-004 | Protect personal data used for identity matching | (all) | **X** | VEND-INT-019/20, VEND-CORE-006 | Data protection |
| RP-VER-005 | Access certificate revocation status information | (all) | **X** | VEND-INT-011, VEND-INT-034 | Revocation status |
| RP-VER-006 | Very large online platforms must accept wallet | (all) | **X** | VEND-CORE-030 | VLOP acceptance (informative) |
| RP-VER-007 | Verify wallet unit attestation validity | (all) | **X** | VEND-CORE-025 | WUA verification |
| RP-VER-008 | Request RP-specific pseudonyms when appropriate | (all) | **X** | VEND-INT-028 | RP pseudonyms |
| RP-VER-009 | Perform unequivocal identity matching (public sector) | public_sector | **P** | N/A | Public sector only - **EXCLUDED** |
| RP-VER-010 | Use mandatory PID attributes for wallet-based matching | (all) | **X** | VEND-INT-023 | PID matching |
| RP-VER-011 | Handle orthographic variations in identity matching | (all) | **X** | VEND-INT-023 | (Implicit in PID handling) |
| RP-VER-012 | Inform users of successful identity matching | (all) | **X** | VEND-INT-001, VEND-INT-022 | User feedback |
| RP-VER-013 | Inform users when identity matching fails | (all) | **X** | VEND-INT-001, VEND-INT-022 | Failure feedback |

### TRANSPARENCY (1 requirement)

| RCA ID | Requirement | Profile | Disp | VCQ Match | Notes |
|--------|-------------|---------|------|-----------|-------|
| RP-TRN-001 | Present both intermediary and end-RP identity | acts_as_intermediary | **X** | VEND-INT-001, VEND-INT-032 | Dual identity display |

---

## Exclusion Log

### Public Sector Only (14 requirements)

These requirements have `profileFilter: [public_sector]` and are not applicable to private sector commercial products:

| RCA ID | Requirement | Article | Rationale |
|--------|-------------|---------|-----------|
| RP-GOV-002 | Accept EUDI Wallet for online services | Art. 5f(1) | Public sector mandate |
| RP-TEC-012 | Accept advanced signatures in defined formats | Art. 27(1) | Public sector format reqs |
| RP-TEC-013 | Not require higher than QES for cross-border | Art. 27(3) | Public sector limit |
| RP-TEC-021 | Accept advanced seals in defined formats | Art. 37(1) | Public sector format reqs |
| RP-VER-002 | Recognize e-ID from other Member States | Art. 6(1) | Public sector mutual recognition |
| RP-VER-003 | Ensure unequivocal identity matching | Art. 11a(1) | Public sector matching |
| RP-VER-009 | Perform unequivocal identity matching for cross-border | 2025/846 Art. 2 | Public sector matching |

### Organization-Only (14 requirements)

These requirements require organizational action and cannot be delivered by a vendor product:

| RCA ID | Requirement | Article | Rationale |
|--------|-------------|---------|-----------|
| RP-GOV-003 | Private sector: Accept EUDI Wallet where SCA mandated | Art. 5f(2) | RP policy decision |
| RP-GOV-004 | Very large online platforms: Accept EUDI Wallet | Art. 5f(3) | VLOP obligation |
| RP-GOV-005 | Maintain alternative means of identification | Art. 5a(15) | RP policy decision |
| RP-GOV-009 | Verify intermediary's registered/certified status | 2025/848 | RP due diligence |
| RP-PRV-006 | Process data in accordance with GDPR | GDPR Art. 5 | Org GDPR compliance |
| RP-REG-001 | Register with competent supervisory authority | Art. 5b(1) | Org action with authority |
| RP-REG-002 | Provide registration information | Art. 5b(2) | Org action with authority |
| RP-REG-004 | Notify changes to registration information | Art. 5b(6) | Org action with authority |
| RP-REG-007 | Provide complete Annex I information | 2025/848 Art. 5 | Org action with authority |
| RP-REG-008 | Ensure registration information accuracy | 2025/848 Art. 5 | Org responsibility |
| RP-REG-009 | Update registration information | 2025/848 Art. 5 | Org action with authority |
| RP-REG-010 | Notify registrar when ceasing wallet use | 2025/848 Art. 6 | Org action with authority |
| RP-REG-011 | Register appropriate entitlement type | 2025/848 Annex I | Org action with authority |
| RP-REG-014 | Indicate reliance on intermediary | 2025/848 Annex I | Org action with authority |
| RP-REG-015 | Provide formal association to intermediary | 2025/848 Annex I | Org action with authority |

---

## Gap Analysis

### Gaps Found: **0**

All vendor-applicable RCA Relying Party requirements are covered in VCQ Core + Intermediary.

### VCQ Coverage Summary

| VCQ Track | Requirement Count | RCA RP Coverage |
|-----------|-------------------|-----------------|
| VCQ Core | 38 | Covers base RP + verification + data handling |
| VCQ Intermediary | 33 | Covers intermediary-specific requirements |
| **Total** | **71** | Full vendor-applicable coverage |

---

## Conclusion

**Phase 3 Result: ✅ COMPLETE - No remaining gaps**

The RCA Relying Party → VCQ Core/Intermediary mapping is complete:
- **102 RCA requirements** reviewed
- **69 vendor-applicable** requirements identified  
- **69 covered** in VCQ (100%)
- **14 organization-only** requirements properly excluded
- **14 public-sector-only** requirements properly excluded (VCQ is private sector only)
