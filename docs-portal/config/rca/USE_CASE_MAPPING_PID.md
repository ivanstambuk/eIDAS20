# Use Case Mapping Tracker: PID Provider

**Date completed:** 2026-01-20
**Decision record:** DEC-088
**Total requirements:** 30
**Schema version:** V1

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔄 | Reviewed — unchanged (already correct) |

---

## Analysis Summary

### Key Finding: All PID Provider Requirements Are Universal

**All 30 PID Provider requirements are correctly mapped to `useCases: all`.**

**Rationale:**

PID Providers are the foundational identity layer of the EUDI Wallet ecosystem. They issue Person Identification Data (PID) that is a **prerequisite for all use cases**:

- **pid-online** — requires PID
- **age-verification** — derives from PID (birth_date)
- **payment-auth** — requires identity (PID)
- **esignature** — requires identified signer (PID)
- **pseudonym** — derived from PID via WebAuthn

Since PID is infrastructure for ALL use cases, the PID Provider's obligations don't depend on which use case the credential will eventually serve.

---

## Requirements by Category

### Governance (9 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| PID-GOV-001 | Maintain public revocation policies | Universal policy requirement |
| PID-GOV-002 | Exclusive revocation authority | Universal authority principle |
| PID-GOV-003 | Notify user within 24 hours | Universal user notification |
| PID-GOV-004 | Revoke upon user request | Universal user right |
| PID-GOV-005 | Revoke when wallet attestation revoked | Universal revocation cascade |
| PID-GOV-006 | Revoke per policy conditions | Universal policy compliance |
| PID-GOV-007 | Retain revoked PID as required | Universal retention requirement |
| PID-GOV-008 | Associate PID with wallet uniquely | Universal identity binding |
| PID-GOV-009 | Make services accessible | Universal accessibility |

### Issuance (2 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| PID-ISS-001 | Issue PID according to eID scheme | Universal issuance procedure |
| PID-ISS-002 | Include authentication/validation info | Universal credential integrity |

### Liability (1 requirement) — Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| PID-LIA-001 | Accept liability per Article 11 | Universal liability principle |

### Privacy (2 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| PID-PRV-001 | Enable privacy-preserving unlinkability | Universal privacy protection |
| PID-PRV-002 | Comply with GDPR | Universal GDPR compliance |

### Security (2 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| PID-SEC-001 | Cryptographically bind PID to wallet | Universal cryptographic binding |
| PID-SEC-002 | Ensure revocations are irreversible | Universal revocation security |

### Technical (3 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| PID-TEC-001 | Comply with Annex specifications | Universal format compliance |
| PID-TEC-002 | Include mandatory metadata | Universal metadata requirements |
| PID-TEC-003 | Issue PID in required formats | Universal format compliance |

### Transparency (4 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| PID-TRN-001 | Publish list of supported wallets | Universal transparency |
| PID-TRN-002 | Publish validity status (privacy-preserving) | Universal status disclosure |
| PID-TRN-003 | Notify Commission of association bodies | Universal regulatory reporting |
| PID-TRN-004 | Notify Commission of validation mechanism | Universal regulatory reporting |

### Verification (7 requirements) — All Universal 🔄

| ID | Requirement | Justification |
|----|-------------|---------------|
| PID-VER-001 | Ensure PID uniqueness within MS | Universal uniqueness |
| PID-VER-002 | Enroll users at assurance level high | Universal identity proofing |
| PID-VER-003 | Identify self to wallet during issuance | Universal provider authentication |
| PID-VER-004 | Validate wallet unit before issuance | Universal wallet validation |
| PID-VER-005 | Include mandatory natural person attributes | Universal attribute requirements |
| PID-VER-006 | Include mandatory legal person attributes | Universal attribute requirements |
| PID-VER-007 | Handle unknown attribute values | Universal error handling |

---

## Final Summary

| Metric | Count |
|--------|-------|
| Total requirements | 30 |
| Already correctly mapped (`all`) | 30 |
| **Changes needed** | **0** |

---

## Conclusion

PID is the **foundational identity layer** — all wallet use cases require valid PID. The "Infrastructure Universalism" pattern applies most strongly here: PID Provider obligations are the same regardless of whether the user will use their wallet for age verification, payments, signatures, or pseudonymous access.

**No changes required.**

---

## Audit Complete

**Date completed:** 2026-01-20 20:20 CET
**Requirements analyzed:** 30
**Changes applied:** 0
**Build verified:** ✅ N/A (no changes)
