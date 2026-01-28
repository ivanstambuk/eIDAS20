# VCQ Technical Specification Coverage Audit

**Date:** 2026-01-28
**Status:** Gap Analysis

## Technical Specifications (TS1-TS14) vs VCQ Requirements

This audit maps each Technical Specification to its applicable roles/categories and identifies whether we have VCQ requirements covering them.

| TS | Title | Applicable Roles | Product Categories | VCQ Coverage | Gap |
|----|-------|-----------------|-------------------|--------------|-----|
| **TS1** | Open Standards | RP, Issuer | All | ❌ None | Add general standards compliance requirement |
| **TS2** | Provider Information | Issuer | Issuance Platform | ⚠️ Partial | issuer.yaml has registration, but not TS2 notification specifics |
| **TS3** | Wallet Unit Attestation | Issuer | Trust Services | ⚠️ Partial | trust_services.yaml has WTA references, needs explicit TS3 |
| **TS4** | ZKP Overview | RP, Issuer | Connector, Issuance | ❌ None | Future capability - may not need requirement yet |
| **TS5** | RP Registration | RP | Connector | ✅ Covered | core.yaml VEND-CORE-004, VEND-CORE-015 |
| **TS6** | Issuance Protocol (OpenID4VCI) | Issuer | Issuance Platform | ⚠️ Partial | issuer.yaml has issuance, needs explicit TS6/OpenID4VCI |
| **TS7** | Data Deletion | RP | Connector | ⚠️ Partial | GDPR deletion in core.yaml, but not TS7 interface specifically |
| **TS8** | Remote QES | Issuer | Trust Services | ⚠️ Partial | trust_services.yaml has QES, needs explicit TS8 protocol |
| **TS9** | Pseudonyms | RP, Issuer | Connector, Issuance | ❌ None | Add pseudonym attestation support requirement |
| **TS10** | Data Export | RP, Issuer | Connector, Issuance | ❌ None | Add data portability requirement |
| **TS11** | Catalogue | Issuer | Issuance Platform | ❌ None | Add attestation catalogue compliance |
| **TS12** | Payments SCA | RP, Issuer | Connector, Issuance | ✅ Added | VEND-CORE-019 (just added) |
| **TS13** | zkSNARKs | RP, Issuer | Connector, Issuance | ❌ None | Future capability - may not need requirement yet |
| **TS14** | MMS/BBS | RP, Issuer | Connector, Issuance | ❌ None | Future capability - may not need requirement yet |

## Summary

### Currently Covered (✅)
- **TS5** - RP Registration (via core.yaml registration requirements)
- **TS12** - Payments SCA (VEND-CORE-019)

### Partially Covered (⚠️)
- **TS2** - Provider Information (need explicit notification requirement)
- **TS3** - WUA (need explicit WTA binding requirement)
- **TS6** - Issuance Protocol (need explicit OpenID4VCI requirement)
- **TS7** - Data Deletion (need explicit TS7 interface requirement)
- **TS8** - Remote QES (need explicit protocol requirement)

### Not Covered (❌) - Action Required
- **TS1** - Open Standards (general compliance)
- **TS9** - Pseudonyms (privacy-preserving identifiers)
- **TS10** - Data Export (GDPR portability)
- **TS11** - Catalogue (attestation rulebooks)

### Not Covered (❌) - Future/Optional
- **TS4** - ZKP Overview (advanced privacy)
- **TS13** - zkSNARKs (advanced privacy)
- **TS14** - MMS/BBS (advanced privacy, still draft)

## Recommended Additions

### Priority 1 - Immediate
1. **TS6 Requirement** for Issuers: "Implement OpenID4VCI protocol per TS6 for attestation issuance"
2. **TS7 Requirement** for RPs: "Implement TS7 data deletion request interface"
3. **TS11 Requirement** for Issuers: "Register attestations in the catalogue per TS11"

### Priority 2 - Near-term
4. **TS2 Requirement** for Issuers: "Publish provider information per TS2"
5. **TS3 Requirement** for Trust Services: "Support Wallet Unit Attestation verification per TS3"
6. **TS9 Requirement** for RPs/Issuers: "Support pseudonym attestations per TS9 when applicable"
7. **TS10 Requirement** for RPs/Issuers: "Provide data export capability per TS10"

### Priority 3 - Future
8. **TS1 Requirement**: General open standards alignment (may be implicit)
9. **TS8 Requirement**: Remote QES protocol support
10. **TS4/13/14**: ZKP capabilities (when implementations mature)
