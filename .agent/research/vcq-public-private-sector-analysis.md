# VCQ Public vs Private Sector Requirements Analysis

**Date**: 2026-01-28  
**Author**: Agent (DEC-277 Analysis)  
**Status**: Complete  
**Decision**: No public/private sector toggle required

---

## Executive Summary

This analysis examines whether the Vendor Compliance Questionnaire (VCQ) should distinguish between public and private sector customers. After systematic review of eIDAS 2.0, GDPR, and DORA requirements, the conclusion is that **no public/private sector toggle is needed** because the technical software requirements are identical regardless of customer sector.

---

## Methodology

Analyzed the following regulatory sources for public/private sector distinctions:

1. **eIDAS 2.0** (Regulation 2024/1183 amending 910/2014)
2. **GDPR** (Regulation 2016/679)
3. **DORA** (Regulation 2022/2554)
4. **ARF HLRs** (Architecture Reference Framework v1.9)

Focus: Identifying requirements where **vendor software capabilities** (not operator procedures) differ based on public vs private sector deployment.

---

## Findings by Regulation

### 1. eIDAS 2.0 Public Sector Provisions

| Provision | Description | Affects Vendor Software? |
|-----------|-------------|-------------------------|
| **Art. 6a(1)** | Public sector bodies MUST accept EUDI Wallets | ❌ No - Operator obligation, not software capability |
| **Art. 45e** | Public sector authentic sources MUST provide electronic verification interfaces | ⚠️ Indirect - Issuer software may integrate with these APIs |
| **Art. 45f** | PuB-EAAs (public body attestations) have specific issuance requirements | ❌ No - Same technical standards as QEAAs |
| **Art. 45f(2)** | Public sector attestation providers must meet QTSP-equivalent reliability | ❌ No - Organizational, not technical |
| **ACC_01 (ARF)** | Wallet Units must comply with Directive 2016/2102 (accessibility) | ⚠️ Only for Wallet software |

**Key Insight**: eIDAS 2.0 mandates that public sector bodies *accept* wallets and have certain *organizational* requirements, but the **technical specifications** for software are identical.

### 2. GDPR Public Authority Provisions

| Provision | Description | Affects Vendor Software? |
|-----------|-------------|-------------------------|
| **Art. 6(1)(f)** | Legitimate interest CANNOT be used by public authorities | ❌ No - Legal basis choice, not software |
| **Recital 47** | "...that legal basis should not apply to the processing by public authorities in the performance of their tasks" | ❌ No - Customer's legal analysis |
| **Art. 37(1)(a)** | Public authorities MUST appoint a DPO | ❌ No - Organizational requirement |
| **Recital 97** | "Where processing is carried out by a public authority..." (DPO context) | ❌ No - Same as above |
| **Art. 79(2)** | Different court jurisdiction if controller is public authority | ❌ No - Contract/liability, not software |
| **Recital 43** | Consent may be invalid due to power imbalance with public authorities | ❌ No - Customer's consent design |
| **Recital 128** | One-stop-shop mechanism does not apply to public authorities | ❌ No - Supervisory authority process |

**Key Insight**: GDPR public authority distinctions affect the **customer's legal position** (legal basis, DPO, jurisdiction), not the technical capabilities required of vendor software. A processor (vendor) has the same Article 28 obligations regardless of whether the controller is public or private.

### 3. DORA Sector Distinction

DORA applies based on **entity type** (financial entities as defined in Art. 2), not public/private sector status. Examples:

- A **public central bank** = Subject to DORA
- A **private commercial bank** = Subject to DORA  
- A **public healthcare provider** = NOT subject to DORA
- A **private non-financial company** = NOT subject to DORA

**Key Insight**: The relevant question is "Is the customer a financial entity?" not "Is the customer public or private?" The VCQ already has DORA-related requirements that filter appropriately.

### 4. ARF HLR Provisions

| HLR ID | Description | Public/Private Distinction? |
|--------|-------------|---------------------------|
| **QTSPAS_02** | Authentic Sources in public sector must implement verification interface | ⚠️ Applies to issuer integration with public authentic sources |
| **QTSPAS_07** | Commission publishes specs for public sector authentic source access | ⚠️ Same - integration specification |
| **ACC_01** | Wallet accessibility per Directive 2016/2102 | ✅ Directive specifically targets "public sector bodies" |

**Key Insight**: The only ARF HLR with clear public sector impact is ACC_01 (accessibility), which applies **only to Wallet software** — not to Connectors, Issuance Platforms, or Trust Services.

---

## Analysis: Why No Toggle Is Needed

### Technical Requirements Are Identical

The software capabilities required for:
- Credential issuance and verification
- Cryptographic operations (signing, encryption)
- Revocation checking
- Trust list validation
- OpenID4VP/mDL presentation protocols
- Secure key management

...are **exactly the same** whether the deployment target is a public sector body or private enterprise.

### Distinctions Are Organizational, Not Technical

The differences between public and private sector in the regulations concern:

1. **Legal basis for processing** → Customer's responsibility, not software
2. **DPO requirements** → Customer's organizational structure
3. **Consent validity** → Customer's legal design decisions
4. **Supervisory authority jurisdiction** → Customer's compliance team
5. **Mandatory wallet acceptance** → Customer's service obligation

None of these change what the **vendor's software must technically support**.

### Contrast with DORA

DORA requirements DO affect vendor software technically:
- ICT risk management frameworks
- Incident reporting capabilities
- Third-party risk management documentation
- Resilience testing support

This is why the VCQ correctly considers DORA requirements — they translate to **actual software capabilities**.

---

## Exceptions and Edge Cases

### 1. Accessibility (ACC_01)

Directive 2016/2102 applies to "websites and mobile applications of **public sector bodies**". If a vendor builds Wallet software specifically for a public sector Wallet Provider, accessibility compliance may be legally required.

**Recommendation**: This is already covered by ACC_01 in the ARF HLRs. No additional toggle needed — it should be included in Wallet-related questionnaires universally since accessibility is best practice regardless.

### 2. Authentic Source Integration

If a vendor builds issuance software that integrates with public sector authentic sources (per Art. 45e), they must implement specific APIs defined in QTSPAS_07.

**Recommendation**: This is an **issuer integration feature**, not a deployment sector question. The correct approach is: "Does your software integrate with authentic sources?" — already implied in issuer requirements.

---

## Recommendation

**Do NOT add a public/private sector toggle to the VCQ.**

The current architecture is correct:
- **Product type filters** (Connector, Issuance Platform, Trust Services) → Determines relevant feature requirements
- **Role filters** (Relying Party, Issuer, Wallet Provider) → Determines applicable HLRs
- **DORA toggle** → Adds financial sector requirements when applicable

A public/private sector toggle would:
1. Add complexity without changing technical requirements
2. Confuse users about what the toggle affects
3. Duplicate organizational considerations that are the customer's responsibility

---

## References

- eIDAS 2.0: Regulation (EU) 2024/1183
- GDPR: Regulation (EU) 2016/679, particularly Recital 47, Art. 6(1)(f), Art. 37, Art. 79
- DORA: Regulation (EU) 2022/2554
- ARF: Architecture Reference Framework v1.9, Annex 2 HLRs
- Accessibility Directive: Directive (EU) 2016/2102

---

*This analysis was conducted on 2026-01-28 and informs Decision DEC-277.*
