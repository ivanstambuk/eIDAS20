# DEC-258: VCQ ZKP Technical Specifications Exclusion

## Decision
ZKP-related Technical Specifications (TS4, TS13, TS14) are **intentionally excluded** from VCQ requirements. They are enabled by eIDAS 2.0 but not mandated, and represent advanced privacy-enhancing features beyond baseline compliance.

## Status
**Accepted** — 2026-01-28

## Context

During the TS coverage audit for VCQ, we identified that 3 of 14 Technical Specifications were not represented:

| TS | Title | Status | Content |
|----|-------|--------|---------|
| **TS4** | Zero-Knowledge Proofs Overview | Published v1.0 | High-level ZKP requirements framework |
| **TS13** | ZKPs from Arithmetic Circuits | Published v1.0 | zkSNARK circuit-based proofs |
| **TS14** | ZKPs from Multi-Message Signatures | **Draft v0.1** | BBS+ signature schemes |

The question was raised whether these should be included in the VCQ alongside the other 11 TSs.

## Analysis

### Legal Basis: Article 5a(4)(b)

The primary regulatory driver for ZKPs is the selective disclosure requirement:

> *"European Digital Identity Wallets shall enable the user to **selectively disclose** to relying parties person identification data, electronic attestation of attributes, or specific data elements of such data or attestations..."*

However, the regulation does not mandate *how* selective disclosure is achieved. It requires the capability, not a specific cryptographic mechanism.

### ZKP Use Cases vs. Alternatives

| Use Case | ZKP Solution | Alternative (Already Covered) |
|----------|--------------|-------------------------------|
| Age verification ("over 18") | Range proofs (TS13) | SD-JWT selective claim disclosure (TS1) |
| Income thresholds | Range proofs (TS13) | SD-JWT with derived claims |
| Nationality set membership | Set membership proofs | SD-JWT with claim selection |
| Credential unlinkability | BBS+ (TS14) | User pseudonyms (TS9) |
| Revocation privacy | Accumulator proofs | Status list with k-anonymity |

**Key finding**: SD-JWT (covered in TS1) and pseudonyms (TS9, included in VCQ) satisfy the baseline legal requirement. ZKPs provide *enhanced* privacy but are not *required*.

### Technical Maturity

1. **TS14 is still in draft** — BBS+ signatures are being standardized at IETF. Including requirements for a draft spec would be premature.

2. **No production implementations** — EU reference wallets use SD-JWT and mdoc, not ZKP-based credentials.

3. **Computational overhead** — zkSNARK proving times are significant on mobile devices, impacting UX.

4. **Vendor readiness** — Including ZKP requirements would likely yield "N/A" responses, reducing questionnaire utility.

## Decision Details

### 1. Exclude from VCQ Requirements

TS4, TS13, and TS14 are **not included** as VCQ requirements because:
- They are optional privacy-enhancing features, not compliance mandates
- Baseline selective disclosure is satisfied by SD-JWT/TS1 and pseudonyms/TS9
- TS14 is still draft, making requirements premature

### 2. Document in vcq-config.yaml

The Technical Specifications remain documented in `vcq-config.yaml` for reference:
```yaml
TS4:
  status: "published"
  # Note: Framework document - no VCQ requirement
  
TS13:
  status: "published"
  # Note: Optional advanced feature - no VCQ requirement
  
TS14:
  status: "draft"
  # Note: Still in draft - requirements deferred until v1.0
```

### 3. Future Inclusion Triggers

ZKP requirements SHOULD be added to VCQ when:
- A sector-specific implementing act mandates unlinkable presentations
- TS14 reaches v1.0 published status
- Large-Scale Pilots identify use cases where SD-JWT is insufficient
- EU reference implementations adopt ZKP-based credentials

## VCQ TS Coverage Summary

| Category | Technical Specifications | VCQ Coverage |
|----------|-------------------------|--------------|
| **Included** | TS1, TS2, TS3, TS5, TS6, TS7, TS8, TS9, TS10, TS11, TS12 | 11/14 (79%) |
| **Excluded** | TS4, TS13, TS14 (ZKP) | 3/14 (21%) |

## Consequences

### Positive
- VCQ focuses on actionable, mandatory requirements
- Avoids "N/A" responses for immature specifications
- Aligns with SD-JWT/mdoc-centric reference implementations
- Can be revisited when ZKP maturity improves

### Negative
- Forward-looking vendors seeking ZKP guidance won't find it in VCQ
- May need update when TS14 is finalized

### Mitigation
- ZKP use cases remain documented in the eIDAS portal's TS4/TS13/TS14 pages
- This decision can be revisited at TS14 v1.0 release

## Related Decisions
- DEC-257: VCQ Role/Category Filtering (multi-role schema)
- DEC-256: Legal Primacy Principle (legalBasis requirement)
- DEC-255: Source Selection Simplification (3-tile model)

## References
- eIDAS 2.0 Article 5a(4)(b): Selective disclosure requirement
- ARF 2.0 Technical Specifications: https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework
- IETF BBS Signatures: draft-irtf-cfrg-bbs-signatures (work in progress)
