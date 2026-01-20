# Use Case Mapping Tracker: Relying Party

**Date started:** 2026-01-20
**Decision record:** DEC-088
**Total requirements:** 91
**Schema version:** V14

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Mapped — decision recorded |
| 🔄 | Reviewed — unchanged (already correct) |

---

## Analysis Summary

### Current State Analysis

Before formal mapping, let me analyze what's already mapped:

| Current Mapping | Count | Notes |
|-----------------|-------|-------|
| `useCases: all` | 39 | Need to verify if truly universal |
| `useCases: [esignature]` | ~20 | eSignature-specific |
| `useCases: [pseudonym]` | 4 | Pseudonym-specific |
| `useCases: [pid-online]` | ~8 | PID identification |
| `useCases: [age-verification]` | 2 | Age verification |
| `useCases: [payment-auth]` | 2 | Payment auth |
| Other specific | Various | Mixed |

### Key Semantic Question for Each Requirement

> "Does this requirement ONLY make sense when implementing a specific use case, or is it a universal obligation regardless of what service the RP provides?"

---

## Mapping Decisions by Category

### Governance (8 requirements)

| ID | Requirement | Current | Analysis | Decision |
|----|-------------|---------|----------|----------|
| RP-GOV-001 | Intermediaries must not store transaction data | `all` ✅ | Universal — applies to any RP using intermediaries | Keep `all` 🔄 |
| RP-GOV-002 | Public sector: Accept wallet for e-ID | `[pid-online, esignature]` | Public sector accepting wallet could be for any use case, but Article 5f(1) specifically mentions "electronic identification and authentication" — this is for PID-based ID, not signing. eSignature added because public services often need document signing. | Keep current 🔄 |
| RP-GOV-003 | Private sector: Accept wallet for strong auth | `[payment-auth, open-bank-account, pid-online]` | Article 5f(2) lists specific sectors (banking, financial services) requiring SCA. These are the applicable use cases. | Keep current 🔄 |
| RP-GOV-004 | VLOPs: Accept wallet for auth | `[pid-online]` | Very large online platforms — authentication = identity. | Keep current 🔄 |
| RP-GOV-005 | Maintain alternative means of ID | `all` ✅ | Universal principle of non-discrimination | Keep `all` 🔄 |
| RP-GOV-006 | Support DPA reporting mechanism | `all` ✅ | Universal — any RP can be reported | Keep `all` 🔄 |
| RP-GOV-007 | Enable selective disclosure | `all` ✅ | Universal — selective disclosure is a core wallet feature for all use cases | Keep `all` 🔄 |
| RP-GOV-008 | Retain identity matching logs | `[pid-online]` | Article is about identity matching, which is PID-specific | Keep current 🔄 |

**Governance total:** 8 requirements, 0 changes needed

---

### Privacy (10 requirements)

| ID | Requirement | Current | Analysis | Decision |
|----|-------------|---------|----------|----------|
| RP-PRV-001 | Request only necessary attributes | `all` ✅ | Universal data minimization principle | Keep `all` 🔄 |
| RP-PRV-002 | Support selective disclosure | `all` ✅ | Universal — applies to all attribute presentations | Keep `all` 🔄 |
| RP-PRV-003 | Do not track across services | `all` ✅ | Universal privacy requirement | Keep `all` 🔄 |
| RP-PRV-004 | Enable unlinkability for non-ID attestations | `[age-verification, pseudonym]` | Specifically about attestations that "do not require identification" — these are age-verification and pseudonym use cases | Keep current 🔄 |
| RP-PRV-005 | Allow pseudonyms where legal ID not required | `[pseudonym, age-verification]` | Specifically about pseudonymous access | Keep current 🔄 |
| RP-PRV-006 | Process data per GDPR | `all` ✅ | Universal GDPR compliance | Keep `all` 🔄 |
| RP-PRV-007 | Perform DPIAs | `all` ✅ | Universal GDPR requirement | Keep `all` 🔄 |
| RP-PRV-008 | Apply data minimization | `all` ✅ | Universal principle | Keep `all` 🔄 |
| RP-PRV-009 | Accept pseudonymous access | `all` ✅ | Universal — applies wherever ID not legally required | **Change to `[pseudonym]`** — this is specifically about pseudonymous access |
| RP-PRV-010 | Comply with embedded disclosure policies | `all` ✅ | Universal — any attestation can have disclosure policies | Keep `all` 🔄 |

**Privacy total:** 10 requirements, 1 change needed (RP-PRV-009)

---

### Registration (13 requirements)

| ID | Requirement | Current | Analysis | Decision |
|----|-------------|---------|----------|----------|
| RP-REG-001 | Register before accepting wallet | `all` ✅ | Universal — all RPs must register | Keep `all` 🔄 |
| RP-REG-002 | Provide registration info | `all` ✅ | Universal registration requirement | Keep `all` 🔄 |
| RP-REG-003 | Request only registered data | `all` ✅ | Universal registration compliance | Keep `all` 🔄 |
| RP-REG-004 | Notify registration changes | `all` ✅ | Universal registration maintenance | Keep `all` 🔄 |
| RP-REG-005 | Identify yourself to wallet users | `all` ✅ | Universal trust requirement | Keep `all` 🔄 |
| RP-REG-006 | Accept pseudonymous auth | `[pseudonym, age-verification]` | Specifically about pseudonyms | Keep current 🔄 |
| RP-REG-007 | Provide Annex I info to register | `all` ✅ | Universal registration requirement | Keep `all` 🔄 |
| RP-REG-008 | Ensure registration accuracy | `all` ✅ | Universal registration requirement | Keep `all` 🔄 |
| RP-REG-009 | Update registration without delay | `all` ✅ | Universal registration maintenance | Keep `all` 🔄 |
| RP-REG-010 | Notify when ceasing wallet use | `all` ✅ | Universal deregistration | Keep `all` 🔄 |
| RP-REG-011 | Register appropriate entitlement type | `all` ✅ | Universal registration requirement | Keep `all` 🔄 |
| RP-REG-012 | Provide machine-readable data requests | `all` ✅ | Universal registration format | Keep `all` 🔄 |
| RP-REG-013 | Provide privacy policy URL | `all` ✅ | Universal registration requirement | Keep `all` 🔄 |

**Registration total:** 13 requirements, 0 changes needed

---

### Security (3 requirements)

| ID | Requirement | Current | Analysis | Decision |
|----|-------------|---------|----------|----------|
| RP-SEC-001 | Receive breach notifications | `all` ✅ | Universal — any RP needs to know about breaches | Keep `all` 🔄 |
| RP-SEC-002 | Receive re-establishment notifications | `all` ✅ | Universal — follows from SEC-001 | Keep `all` 🔄 |
| RP-SEC-003 | Receive withdrawal notifications | `all` ✅ | Universal — any RP needs to know about withdrawals | Keep `all` 🔄 |

**Security total:** 3 requirements, 0 changes needed

---

### Technical (43 requirements)

| ID | Requirement | Current | Analysis | Decision |
|----|-------------|---------|----------|----------|
| RP-TEC-001 | Support ISO 18013-5 and W3C VC formats | `all` ✅ | Universal credential format support | Keep `all` 🔄 |
| RP-TEC-002 | Implement presentation protocols | `all` ✅ | Universal protocol support | Keep `all` 🔄 |
| RP-TEC-003 | Support selective disclosure | `all` ✅ | Universal selective disclosure | Keep `all` 🔄 |
| RP-TEC-004 | Comply with WebAuthn for pseudonyms | `[pseudonym]` ✅ | Pseudonym-specific | Keep current 🔄 |
| RP-TEC-005 | Support RP-specific pseudonyms | `[pseudonym, pid-online]` | Pseudonym generation + persistent identity | Keep current 🔄 |
| RP-TEC-006 | Verify proof of possession | `all` ✅ | Universal cryptographic verification | Keep `all` 🔄 |
| RP-TEC-007 | Use valid RP access certificate | `all` ✅ | Universal RP authentication | Keep `all` 🔄 |
| RP-TEC-008 | Support data erasure protocol | `all` ✅ | Universal GDPR mechanism | Keep `all` 🔄 |
| RP-TEC-009 | Accept e-signatures regardless of form | `[esignature]` ✅ | eSignature-specific | Keep current 🔄 |
| RP-TEC-010 | Recognize QES as handwritten | `[esignature]` ✅ | eSignature-specific | Keep current 🔄 |
| RP-TEC-011 | Recognize QES from all Member States | `[esignature]` ✅ | eSignature-specific | Keep current 🔄 |
| RP-TEC-012 | Public sector: Accept advanced sigs | `[esignature, pid-online]` | eSignature + public sector services | Keep current 🔄 |
| RP-TEC-013 | Public sector: Not require higher than QES | `[esignature]` ✅ | eSignature-specific | Keep current 🔄 |
| RP-TEC-014 | Validate QES correctly | `[esignature]` ✅ | eSignature-specific | Keep current 🔄 |
| RP-TEC-015 | Validate advanced sigs on QC | `[esignature]` ✅ | eSignature-specific | Keep current 🔄 |
| RP-TEC-016 | Validation system security detection | `[esignature]` ✅ | eSignature-specific | Keep current 🔄 |
| RP-TEC-017 | Consider qualified validation services | `[esignature]` ✅ | eSignature-specific | Keep current 🔄 |
| RP-TEC-018 | Accept e-seals regardless of form | `[esignature]` ✅ | eSignature/eSeal-specific | Keep current 🔄 |
| RP-TEC-019 | Recognize QESeal presumptions | `[esignature]` ✅ | eSeal integrity presumption | Keep current 🔄 |
| RP-TEC-020 | Recognize QESeal from all MS | `[esignature]` ✅ | eSeal cross-border | Keep current 🔄 |
| RP-TEC-021 | Public sector: Accept advanced seals | `[esignature, pid-online]` | eSeal + public sector | Keep current 🔄 |
| RP-TEC-022 | Validate QESeal correctly | `[esignature]` ✅ | eSeal validation | Keep current 🔄 |
| RP-TEC-023 | Accept e-timestamps regardless of form | `[esignature]` ✅ | Timestamp for signatures | Keep current 🔄 |
| RP-TEC-024 | Recognize qualified timestamp presumptions | `[esignature]` ✅ | Timestamp integrity | Keep current 🔄 |
| RP-TEC-025 | Recognize QTS from all MS | `[esignature]` ✅ | Timestamp cross-border | Keep current 🔄 |
| RP-TEC-026 | Accept e-delivery data | `[esignature]` ✅ | eDelivery for signed docs | Keep current 🔄 |
| RP-TEC-027 | Recognize qualified delivery presumptions | `[esignature]` ✅ | eDelivery presumption | Keep current 🔄 |
| RP-TEC-028 | Recognize QC for website auth | `[esignature, pid-online]` | QWAC — relevant for both | Keep current 🔄 |
| RP-TEC-029 | Accept EAA regardless of form | `all` ✅ | Universal EAA acceptance | Keep `all` 🔄 |
| RP-TEC-030 | Recognize QEAA/PSB EAA legal effect | `all` ✅ | Universal EAA legal effect | Keep `all` 🔄 |
| RP-TEC-031 | Recognize PSB EAA from all MS | `all` ✅ | Universal cross-border | Keep `all` 🔄 |
| RP-TEC-032 | Accept archived data | `[esignature]` ✅ | Archiving for signatures | Keep current 🔄 |
| RP-TEC-033 | Recognize qualified archiving | `[esignature]` ✅ | Archiving presumption | Keep current 🔄 |
| RP-TEC-034 | Accept e-ledger records | `[esignature]` ✅ | Ledger for signing | Keep current 🔄 |
| RP-TEC-035 | Recognize qualified ledger | `[esignature]` ✅ | Ledger presumption | Keep current 🔄 |
| RP-TEC-036 | Support ISO 18013-5 for PID | `[pid-online, proximity-id]` ✅ | PID format-specific | Keep current 🔄 |
| RP-TEC-037 | Support W3C VC for PID | `[pid-online]` ✅ | PID format-specific | Keep current 🔄 |
| RP-TEC-038 | Process mandatory PID attributes | `[pid-online, proximity-id]` ✅ | PID-specific | Keep current 🔄 |
| RP-TEC-039 | Handle optional PID attributes | `[pid-online, proximity-id]` ✅ | PID-specific | Keep current 🔄 |
| RP-TEC-040 | Verify PID validity status | `[pid-online, proximity-id]` ✅ | PID-specific | Keep current 🔄 |
| RP-TEC-041 | Process legal person PID | `[open-bank-account]` ✅ | Legal person = business, banking | Keep current 🔄 |
| RP-TEC-042 | Support Annex II formats | `all` ✅ | Universal format support | Keep `all` 🔄 |
| RP-TEC-043 | Support Annex IV signature formats | `[esignature]` ✅ | eSignature-specific | Keep current 🔄 |

**Technical total:** 43 requirements, 0 changes needed

---

### Verification (14 requirements)

| ID | Requirement | Current | Analysis | Decision |
|----|-------------|---------|----------|----------|
| RP-VER-001 | Perform auth and validation | `all` ✅ | Universal verification | Keep `all` 🔄 |
| RP-VER-002 | Support wallet-based SCA | `[payment-auth, open-bank-account]` ✅ | Banking SCA-specific | Keep current 🔄 |
| RP-VER-003 | Public sector: Recognize cross-border eID | `[pid-online]` ✅ | PID-specific | Keep current 🔄 |
| RP-VER-004 | Public sector: Unequivocal identity matching | `[pid-online]` ✅ | PID-specific | Keep current 🔄 |
| RP-VER-005 | Protect identity matching data | `[pid-online]` ✅ | PID-specific | Keep current 🔄 |
| RP-VER-006 | Access certificate revocation status | `[esignature]` ✅ | Certificate = signature | Keep current 🔄 |
| RP-VER-007 | VLOPs accept wallet auth (informative) | `all` ✅ | Universal informative | Keep `all` 🔄 |
| RP-VER-008 | Verify WUA validity | `[pid-online, proximity-id]` ✅ | Wallet unit = PID/proximity | Keep current 🔄 |
| RP-VER-009 | Request RP-specific pseudonyms | `[pseudonym, age-verification]` ✅ | Pseudonym-specific | Keep current 🔄 |
| RP-VER-010 | Identity matching for cross-border | `[pid-online]` ✅ | PID-specific | Keep current 🔄 |
| RP-VER-011 | Use mandatory PID for matching | `[pid-online]` ✅ | PID-specific | Keep current 🔄 |
| RP-VER-012 | Handle orthographic variations | `[pid-online]` ✅ | PID matching | Keep current 🔄 |
| RP-VER-013 | Inform users of successful match | `[pid-online]` ✅ | PID-specific | Keep current 🔄 |
| RP-VER-014 | Inform users of failed match | `[pid-online]` ✅ | PID-specific | Keep current 🔄 |

**Verification total:** 14 requirements, 0 changes needed

---

## Final Summary

| Metric | Count |
|--------|-------|
| Total requirements | 91 |
| Already correctly mapped | 90 |
| **Changes needed** | **1** |

### Changes Required

| Req ID | Old Mapping | New Mapping | Rationale |
|--------|-------------|-------------|-----------|
| RP-PRV-009 | `all` | `[pseudonym]` | Recital 60 is specifically about pseudonymous access, not universal |

---

## Audit Complete

**Date completed:** 2026-01-20 20:08 CET
**Requirements analyzed:** 91
**Changes applied:** 1
**Build verified:** ✅ Pass
