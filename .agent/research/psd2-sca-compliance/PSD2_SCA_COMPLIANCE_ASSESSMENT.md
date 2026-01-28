# PSD2 SCA Compliance Matrix: EUDI Wallet

► **Purpose**: Topic-first compliance mapping for Payment Service Providers  
► **Scope**: PSD2 Directive Article 97 + RTS 2018/389 Articles 1-9, 22-27

---

## How to Use This Document

This document is designed for **legal counsel, compliance officers, and regulators** evaluating EUDI Wallet for PSD2 Strong Customer Authentication (SCA).

**Navigation**:
- Each regulatory provision has its own heading (deep-linkable)
- For each provision: regulatory text → fulfillment evidence → gaps/actions
- Ctrl+F for any Article number (e.g., "Article 5(1)(b)")

**Legend**:

| Symbol | Meaning |
|--------|---------|
| ✅ **Wallet** | Built into EUDI Wallet per ARF HLRs / TS12 |
| ⚠️ **Partial** | Wallet provides support, but PSP must also act |
| ❌ **PSP** | Not in Wallet — PSP must implement |
| 🔶 **Rulebook** | Deferred to SCA Attestation Rulebook (future) |
| ➖ **N/A** | Not relevant for wallet-based SCA |

**Reference Documents**:

| Document | Link |
|----------|------|
| PSD2 Directive | [EUR-Lex 2015/2366](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32015L2366) |
| PSD2 RTS | [EUR-Lex 2018/389](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389) |
| ARF v2.7.3 | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework) |
| TS12 v1.0 | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md) |
| ARF Topic 20 | [HLRs for SCA](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2313-topic-20---strong-user-authentication-for-electronic-payments) |

**Reference Implementations** (commit-pinned):

| Platform | Repository | Commit |
|----------|-----------|--------|
| iOS | [`eudi-app-ios-wallet-ui`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui) | [`055bdda8`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/tree/055bdda8b2a74d9df4892e7cf702479ac75f6ca6) |
| Android | [`eudi-app-android-wallet-ui`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui) | [`48311b4d`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/tree/48311b4de1a0d2be57874824ea68a5e0914765e4) |

**Local Clones** (for source code verification):

| Platform | Local Path |
|----------|------------|
| iOS | `.agent/research/psd2-sca-compliance/reference-impl/eudi-app-ios-wallet-ui` |
| Android | `.agent/research/psd2-sca-compliance/reference-impl/eudi-app-android-wallet-ui` |

**Local Regulatory Sources** (full markdown — DO NOT look up EUR-Lex):

| Document | Local Path |
|----------|------------|
| PSD2 Directive (2015/2366) | `.agent/research/psd2-sca-compliance/sources/32015L2366.md` |
| PSD2 RTS (2018/389) | `.agent/research/psd2-sca-compliance/sources/32018R0389.md` |

---

# 1. Executive Summary

EUDI Wallet, when implementing TS12 and ARF requirements, provides **substantial coverage** of PSD2 RTS requirements for SCA. Key findings:

| Category | Count | Summary |
|----------|-------|---------|
| ✅ Wallet Compliant | 25 | Core SCA mechanics + credential lifecycle |
| ⚠️ Shared Responsibility | 9 | Wallet provides evidence; PSP must verify |
| ❌ **Gap Identified** | **1** | **PIN lockout NOT implemented** (Art. 4(3)(b)) |
| ❌ PSP Only | 11 | Risk analysis, audit, key management docs |
| 🔶 Rulebook Pending | 4 | Deferred to SCA Attestation Rulebook |

| ➖ Not Applicable | 6 | Exemptions, contactless, reusable devices |

**Critical ARF HLRs for SCA**:
- **SUA_01–SUA_06** (Topic 20): Strong User Authentication for electronic payments
- **WIAM_14–WIAM_17** (Topic 40): WSCA/WSCD user authentication
- **WUA_09–WUA_12** (Topic 9): Wallet Unit Attestation key binding
- **RPA_01–RPA_08** (Topic 6): Relying Party authentication and user approval

► ⚠️ **Critical Dependency**: The **SCA Attestation Rulebook** does not yet exist as a published document (as of Jan 2026). TS12 defines the protocol ("pipes"), but delegates the data schemas (what fields to display, IBAN vs card number, etc.) to future rulebooks to be authored by industry bodies (EPC for SEPA, EMVCo/schemes for cards). Items marked 🔶 in this assessment await rulebook publication. See [Appendix C](#appendix-c-sca-attestation-rulebook-status) for details.

**Use Case Coverage**:

| Use Case | RTS Articles | Document Part |
|----------|--------------|---------------|
| **Issuance/Binding** | 22, 23, 24, 25, 26, 27 | Part III |
| **Usage/Authentication** | 1, 2, 3, 4, 5, 6, 7, 8, 9 | Part II |

---

# 2. Terminology & Definitions

### Key Terms from PSD2 RTS

| Term | Definition | Source |
|------|------------|--------|
| **Strong Customer Authentication (SCA)** | Authentication based on two or more elements from knowledge, possession, and inherence categories | [RTS Art. 4(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_4) |
| **Personalised Security Credentials (PSC)** | Personalised features provided by PSP for authentication purposes | [PSD2 Art. 4(31)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366#004.031) |
| **Authentication Code** | Digital signatures or other cryptographically underpinned validity assertions generated from authentication elements | [RTS Recital (4)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#rct_4) |
| **Dynamic Linking** | SCA that includes elements dynamically linking the transaction to a specific amount and payee | [RTS Art. 5](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_5) |

### EUDI Wallet Terminology

| Term | Definition | Source |
|------|------------|--------|
| **WSCA** | Wallet Secure Cryptographic Application | [ARF Glossary](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-1/annex-1-definitions.md) |
| **WSCD** | Wallet Secure Cryptographic Device (hardware security module) | [ARF Glossary](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-1/annex-1-definitions.md) |
| **WUA** | Wallet Unit Attestation | [ARF Topic 9](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#topic-9---wallet-unit-attestation-wua) |
| **PID** | Person Identification Data | [ARF Glossary](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-1/annex-1-definitions.md) |
| **SUA** | Strong User Authentication (attestation type for payments) | [ARF Topic 20](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#topic-20---strong-user-authentication-sua) |
| **KB-JWT** | Key Binding JWT (signature proving possession) | [SD-JWT-VC Spec](https://www.ietf.org/archive/id/draft-ietf-oauth-sd-jwt-vc-08.html#name-key-binding-jwt) |

### Authentication Factor Mapping

| RTS Category | EUDI Wallet Implementation |
|--------------|---------------------------|
| **Knowledge** | User PIN or passphrase validated by WSCA/WSCD |
| **Possession** | Private key stored in WSCA/WSCD (Secure Enclave / StrongBox) |
| **Inherence** | Biometric validated by OS (Face ID / BiometricPrompt) |

### PSD2 → EUDI Wallet Terminology Cross-Reference

This table maps PSD2/RTS terminology to their EUDI Wallet equivalents:

| PSD2/RTS Term | EUDI Wallet Equivalent | Explanation |
|---------------|------------------------|-------------|
| **Personalised Security Credentials (PSC)** | All SCA Elements | Per PSD2 Art. 4(31), PSCs are "personalised features provided by the PSP for authentication." In EUDIW, this encompasses **all three SCA element types**: (1) **PIN/Passphrase** (knowledge), (2) **Biometric template** (inherence), and (3) **SCA Attestation + Private Key** (possession). The PIN/biometric unlocks access to the private key, and together they enable generation of the authentication code. |
| **Authentication Code** | VP Token (KB-JWT signature) | RTS Recital 4 defines this as "digital signatures or other cryptographically underpinned validity assertions." In EUDIW, this is the signed VP Token containing the KB-JWT with `transaction_data_hashes` |
| **Authentication Device** | Wallet Unit (WSCA/WSCD) | The user's device running the Wallet Instance with its associated Wallet Unit Attestation and secure hardware |
| **PIN** | User PIN / Passphrase | **PSC (Knowledge element)** — validated locally by WSCA/WSCD (never transmitted). Protected per RTS Art. 6 & Art. 22. |
| **Biometric** | OS Biometric (Face ID / BiometricPrompt) | **PSC (Inherence element)** — validated by OS secure biometric API with liveness detection. Protected per RTS Art. 8 & Art. 22. |
| **Dynamic Linking** | `transaction_data_hashes` in KB-JWT | The cryptographic binding of amount + payee to the authentication code via hashing and signing |
| **One-time use** | `jti` + `nonce` claims | Each VP Token has unique `jti` (JWT ID) and must respond to a fresh `nonce` from the verifier |
| **Secure Channel** | TLS 1.2+ (OID4VP) | Mutually authenticated encrypted channel between wallet and PSP |
| **Authentication elements** | SCA Factors | Knowledge (PIN), Possession (private key), Inherence (biometric) |
| **Payment Service Provider (PSP)** | Relying Party (Verifier) + Attestation Provider (Issuer) | PSP has dual role: issues SCA attestation (OID4VCI) and verifies authentication (OID4VP) |
| **Payer** | User / Wallet Holder | The natural person using the EUDI Wallet |

### Key Insight: Authentication Code = VP Token

The most important mapping is understanding that the **authentication code** (RTS Art. 4) is the **VP Token**:

```
┌-----------------------------------------------------------------┐
│                    AUTHENTICATION CODE (RTS Art. 4)             │
├-----------------------------------------------------------------┤
│   VP Token                                                      │
│   ├-- SD-JWT-VC (the SCA attestation)                           │
│   └-- KB-JWT (Key Binding JWT)                                  │
│       ├-- aud: PSP's client_id                                  │
│       ├-- nonce: from PSP's request (one-time use)              │
│       ├-- iat: timestamp                                        │
│       ├-- jti: unique token ID (additional one-time protection) │
│       ├-- amr: ["pin", "hwk"] (factor evidence)                 │
│       └-- transaction_data_hashes: SHA-256 of amount+payee      │
│           (DYNAMIC LINKING per Art. 5)                          │
└-----------------------------------------------------------------┘
```


---

# 3. Scope: Two SCA Lifecycle Phases

This assessment covers **two distinct phases** in the SCA attestation lifecycle:

| Phase | Use Case | Protocol | RTS Chapter | Wallet Role |
|-------|----------|----------|-------------|-------------|
| **A. Issuance/Binding** | PSP issues SCA attestation to wallet | OID4VCI | Chapter IV (Art. 22-27) | Key generation, secure storage, user auth for binding |
| **B. Authentication/Usage** | User authenticates during payment | OID4VP | Chapter II (Art. 4-9) | SCA execution, factor validation, auth code generation |

### Use Case 1: Issuance/Binding

The PSP (as **Issuer**) creates an SCA attestation and binds it to the user:

1. User requests SCA attestation from PSP (e.g., during onboarding)
2. Wallet generates key pair in WSCA/WSCD (Secure Enclave / StrongBox)
3. User authenticates to prove identity (SCA required for remote binding per Art. 24(2)(b))
4. PSP issues attestation bound to wallet's public key
5. Wallet stores attestation securely in WSCD

**Relevant RTS Articles**: 22, 23, 24, 25, 26, 27  
**Covered in**: [Part III: SCA Attestation Lifecycle](#part-iii-sca-attestation-lifecycle-issuancebinding)

### Use Case 2: Usage/Authentication

The PSP (as **Relying Party/Verifier**) requests SCA during a payment:

1. PSP sends OID4VP authorization request with transaction data
2. Wallet displays transaction details to user (amount, payee)
3. User authenticates (PIN/biometric) via WSCA/WSCD
4. Wallet generates KB-JWT with `transaction_data_hashes` (dynamic linking)
5. Wallet returns VP Token (the "authentication code")
6. PSP verifies signature and processes payment

**Relevant RTS Articles**: 4, 5, 6, 7, 8, 9  
**Covered in**: [Part II: SCA Authentication (Usage)](#part-ii-sca-authentication-usage)


---

===============================================================================
# PART A: SCA CREDENTIAL ISSUANCE (Binding Phase)
===============================================================================

► *This part covers the **issuance phase** of SCA attestations — when the PSP creates credentials and binds them to the user's wallet.*
►
► **RTS Chapter IV** (Articles 22-27): Confidentiality and integrity of personalised security credentials

---

# 4. PSC Creation & Protection


## 4.1 General Requirements

► **Regulatory Basis**:
► - [RTS Art. 22](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_22): Confidentiality and integrity of personalised security credentials

#### [Article 22(1)](sources/32018R0389.md#article-22) — PSC confidentiality and integrity

► "Payment service providers shall ensure the confidentiality and integrity of the personalised security credentials of the payment service user, including authentication codes, during all phases of the authentication."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WIAM_14](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | WSCA/WSCD authenticates User before crypto ops |
| ✅ **Wallet** | [WIAM_20](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Private key never leaves WSCA/WSCD |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: PSC Confidentiality and Integrity Across All Phases</strong></summary>

##### What are Personalised Security Credentials (PSCs)?

The RTS defines PSCs as "personalised features provided by the PSP for authentication purposes." In the EUDI Wallet context:

| PSC Type | SCA Element | Storage Location | Protection Mechanism |
|----------|-------------|------------------|---------------------|
| **PIN/Passphrase** | Knowledge | WSCD (encrypted) | AES-256-GCM, hardware key |
| **Biometric Template** | Inherence | OS Secure Enclave/TEE | OS-managed, never exported |
| **Private Key** | Possession | WSCD (Secure Enclave/StrongBox) | Non-extractable, hardware-bound |
| **SCA Attestation** | N/A (proof) | WUA certificate | Cryptographically signed by Wallet Provider |
| **Authentication Code** | N/A (dynamic) | RAM only | One-time use, time-bound |

##### "All Phases" — PSC Lifecycle Coverage

Article 22(1) requires protection during **all phases**. The full lifecycle includes:

```
┌-----------------------------------------------------------------------------┐
│                    PSC Lifecycle Phases (Art. 22-27)                        │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  1. CREATION         2. DELIVERY        3. ASSOCIATION      4. USE          │
│  (Art. 23)           (Art. 24)          (Art. 25)           (Art. 4-9)      │
│  ┌---------┐        ┌---------┐        ┌---------┐        ┌---------┐       │
│  │ Generate│   --►  │ Transmit│   --►  │ Bind to │   --►  │Authenti-│       │
│  │ PSC     │        │ Securely│        │ User    │        │  cate   │       │
│  └---------┘        └---------┘        └---------┘        └---------┘       │
│       │                  │                  │                  │            │
│       ▼                  ▼                  ▼                  ▼            │
│  ┌---------┐        ┌---------┐        ┌---------┐        ┌---------┐       │
│  │ Entropy │        │ TLS 1.3 │        │Identity │        │ SCA per │       │
│  │ ≥ 256   │        │ / E2E   │        │ Proofing│        │ Art. 4  │       │
│  └---------┘        └---------┘        └---------┘        └---------┘       │
│                                                                             │
│  5. RENEWAL          6. REVOCATION                                          │
│  (Art. 26)           (Art. 27)                                              │
│  ┌---------┐        ┌---------┐                                             │
│  │ Replace │   --►  │Invalidate│                                            │
│  │ PSC     │        │ PSC      │                                            │
│  └---------┘        └---------┘                                             │
│       │                  │                                                  │
│       ▼                  ▼                                                  │
│  ┌---------┐        ┌---------┐                                             │
│  │ SCA for │        │ Immediate│                                            │
│  │ renewal │        │ effect   │                                            │
│  └---------┘        └---------┘                                             │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Security Controls Per Lifecycle Phase

| Phase | RTS Article | Security Control | EUDI Wallet Implementation |
|-------|-------------|------------------|---------------------------|
| **Creation** | Art. 23 | Cryptographic key generation in secure environment | Keys generated in WSCD (Secure Enclave/StrongBox) |
| **Delivery** | Art. 24 | Secure channel, one-time use | TLS 1.3, mTLS for attestation delivery |
| **Association** | Art. 25 | SCA required for binding | User completes identity proofing + SCA before credential binding |
| **Use** | Art. 4-22 | SCA with independence of elements | PIN/biometric unlocks WSCD key for KB-JWT signing |
| **Renewal** | Art. 26 | SCA required for renewal | Re-issuance requires full SCA |
| **Revocation** | Art. 27 | Immediate invalidation | WUA revocation propagates via Wallet Provider |

##### NIST SP 800-63 Alignment

NIST SP 800-63-4 (2025) provides complementary guidance:

| NIST Requirement | RTS Equivalent | EUDI Wallet Status |
|------------------|----------------|-------------------|
| **AAL2+**: Possession of authenticator + second factor | Art. 4: Two-factor SCA | ✅ Key + PIN/biometric |
| **Phishing-resistant MFA**: FIDO2/passkeys recommended | Art. 5: Dynamic linking | ✅ KB-JWT binds transaction |
| **Verifier impersonation resistance** | Art. 22: PSC confidentiality | ✅ mTLS, app attestation |
| **No email OTP for high assurance** | Art. 6-8: Element requirements | ✅ Hardware-bound elements |

##### ENISA Digital Identity Security Goals

ENISA's Digital Identity Standards report defines four primary security goals:

| ENISA Goal | Description | EUDI Wallet Implementation |
|------------|-------------|---------------------------|
| **Protection against forgery** | PSC cannot be fabricated | Private keys non-extractable; WUA signed by Wallet Provider |
| **Protection against cloning** | PSC cannot be duplicated | Keys generated in WSCD, never leave hardware |
| **Protection against eavesdropping** | PSC not exposed in transit | TLS 1.3 + app attestation; KB-JWT contains no PSC |
| **Protection against unauthorized access** | PSC requires user authentication | WIAM_14: Biometric/PIN before any key operation |

##### Threat Model: PSC Confidentiality and Integrity

| Threat | Lifecycle Phase | Attack Vector | Mitigation | EUDI Wallet Status |
|--------|----------------|---------------|------------|-------------------|
| **Creation compromise** | Creation | Weak RNG, predictable keys | WSCD uses hardware TRNG | ✅ Secure Enclave/StrongBox |
| **Interception in transit** | Delivery | MITM during attestation | mTLS, certificate pinning | ✅ WUA delivery over mTLS |
| **Credential replay** | Use | Reuse of authentication code | One-time nonce in KB-JWT | ✅ `nonce` binding |
| **PIN brute force** | Use | Offline guessing | Attempt limits, entropy requirements | ⚠️ See K-1, K-2 |
| **Key extraction** | All phases | Malware reads key material | Non-extractable keys in WSCD | ✅ WIAM_20 |
| **Unauthorized revocation** | Revocation | DoS via false revocation | User authentication for revocation | ✅ WIAM_06 |
| **Stale revocation** | Revocation | Revoked key still accepted | Real-time status check | ⚠️ Depends on RP implementation |

##### Reference Implementation Evidence

| Platform | Component | Source | Security Property |
|----------|-----------|--------|-------------------|
| **iOS** | PIN storage | [`KeychainPinStorageProvider.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-authentication/Sources/Storage/KeychainPinStorageProvider.swift#L30-L31) (L30-31) | Keychain with device-only accessibility |
| **iOS** | Key protection | [`KeyChainController.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-business/Sources/Controller/KeyChainController.swift#L75-L80) (L75-80) | `.whenPasscodeSetThisDeviceOnly` + biometric policy |
| **Android** | PIN storage | [`PrefsPinStorageProvider.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/authentication-logic/src/main/java/eu/europa/ec/authenticationlogic/storage/PrefsPinStorageProvider.kt#L57-L72) (L57-72) | AES-GCM encryption with hardware-backed key |
| **Android** | Key generation | [`KeystoreController.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/business-logic/src/main/java/eu/europa/ec/businesslogic/controller/crypto/KeystoreController.kt#L90-L118) (L90-118) | `setUserAuthenticationRequired(true)`, `AUTH_BIOMETRIC_STRONG` |


##### Gap Analysis: PSC Confidentiality

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **PSC-1** | Revocation propagation delay not specified | Medium | Define SLA for WUA revocation propagation (e.g., < 1 hour) |
| **PSC-2** | Renewal SCA requirements not detailed | Low | Clarify: full SCA required for renewal, or can existing session suffice? |
| **PSC-3** | PIN entropy covered separately (K-1) | See K-1 | Cross-reference: PIN entropy requirements in SCA Attestation Rulebook |
| **PSC-4** | Authentication code lifetime not specified | Low | Define max validity for KB-JWT (e.g., 5 minutes) |

##### Recommendations for SCA Attestation Rulebook

1. **PSC Inventory**: Document all PSC types in SCA Attestation context (PIN, biometric template reference, private key, WUA)
2. **Phase-by-Phase Compliance**: Map each lifecycle phase (Art. 22-27) to EUDI Wallet controls
3. **ENISA Alignment**: Reference ENISA's four security goals as compliance targets
4. **Revocation SLA**: Mandate maximum propagation delay for WUA revocation
5. **Authentication Code TTL**: Specify maximum validity for KB-JWT signatures (e.g., 5 minutes)

</details>

**Context**: Art. 22(1) applies to **all personalised security credentials**, which in the EUDIW context includes:
- **PIN/Passphrase** (knowledge): Encrypted at rest, never transmitted
- **Biometric template** (inherence): OS-managed, never exported
- **Private key + SCA Attestation** (possession): Non-extractable from WSCA/WSCD

---

#### [Article 22(2)(a)](sources/32018R0389.md#article-22) — Masked credential input

► "(a) personalised security credentials are masked when displayed and are not readable in their full extent when input by the payment service user during the authentication;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet/OS** | iOS/Android | PIN entry uses secure masked input field |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: Credential Masking During Input</strong></summary>

##### Core Requirement: Masked Display and Input

Article 22(2)(a) mandates that PSCs must be **masked when displayed** and **not readable in full** during input. This protects against visual observation ("shoulder surfing") and screen recording.

```
┌-----------------------------------------------------------------------------┐
│                      Credential Masking Architecture                        │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │                     USER INPUT FLOW                                 │    │
│  │                                                                     │    │
│  │    User types:        1  2  3  4  5  6                             │     │
│  │                       ▼  ▼  ▼  ▼  ▼  ▼                             │     │
│  │                                                                     │    │
│  │    Display shows:     •  •  •  •  •  6   (brief character reveal)  │     │
│  │                       ▼  ▼  ▼  ▼  ▼  ▼                             │     │
│  │                                                                     │    │
│  │    After ~300ms:      •  •  •  •  •  •   (fully masked)            │     │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │                     MASKING PROPERTIES                              │    │
│  │                                                                     │    │
│  │   • Each digit replaced with mask character (•, *, ○)              │     │
│  │   • Brief reveal on input (optional, for usability)                 │    │
│  │   • No clipboard access for masked fields                           │    │
│  │   • FLAG_SECURE prevents screenshots                                │    │
│  │   • Accessibility services restricted                               │    │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Masking Requirements

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| **Masked display** | Characters replaced with mask (•) | Native SecureTextField |
| **Not readable in full** | Full PIN never visible at once | Immediate or delayed masking |
| **Protected from capture** | Screenshots/recordings blocked | FLAG_SECURE (Android) |
| **Protected from observation** | Physical viewing mitigated | Mask + optional blur |

##### Platform Implementation

| Platform | Component | Masking Behavior |
|----------|-----------|------------------|
| **iOS** | `UITextField.isSecureTextEntry = true` | Immediate masking (no brief reveal) |
| **iOS** | `SecureField` (SwiftUI) | System-managed secure input |
| **Android** | `android:inputType="textPassword"` | Brief character reveal, then mask |
| **Android** | `android:textPassword` + FLAG_SECURE | No screenshots during input |

##### Reference Implementation Evidence

**iOS** — [`PinTextFieldView.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-ui/Sources/DesignSystem/Component/Input/PinTextFieldView.swift#L172-L175) (lines 172-175):
```swift
.accentColor(.clear)
.foregroundColor(.clear)
.keyboardType(.numberPad)
.textContentType(.oneTimeCode)
```

**Android** — [`PinScreen.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/common-feature/src/main/java/eu/europa/ec/commonfeature/ui/pin/PinScreen.kt#L282-L292) (lines 282-292):
```kotlin
WrapPinTextField(
    modifier = modifier,
    onPinUpdate = onPinInput,
    length = state.quickPinSize,
    hasError = !state.quickPinError.isNullOrEmpty(),
    errorMessage = state.quickPinError,
    visualTransformation = PasswordVisualTransformation(),
    pinWidth = 42.dp,
    clearCode = state.resetPin,
    focusOnCreate = true
)
```

##### Additional Protections

| Protection | Platform | Purpose |
|------------|----------|---------|
| **FLAG_SECURE** | Android | Prevents window capture |
| **Secure keyboard mode** | Both | Disables autocomplete/suggestions |
| **No clipboard** | Both | Copy disabled for secure fields |
| **Accessibility restrictions** | Both | Screen readers don't announce characters |

##### NIST Alignment

| NIST SP 800-63B | PSD2 Art. 22(2)(a) | EUDI Wallet |
|-----------------|-------------------|-------------|
| "Hide characters as they are typed" | "Masked when displayed" | ✅ Native secure fields |
| "Allow paste into password field" | Not specified | ⚠️ Typically disabled for PINs |
| "Allow show/hide toggle" | "Not readable in full" | ❌ Not applicable for 6-digit PIN |

##### Threat Model: Credential Observation

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|--------|
| **Shoulder surfing** | Watch user type PIN | Masked characters | ✅ Mitigated |
| **Screen recording** | Capture screen during input | FLAG_SECURE | ✅ Mitigated |
| **Screenshot** | Take screenshot of PIN screen | FLAG_SECURE | ✅ Mitigated |
| **Accessibility abuse** | Screen reader announces chars | Restricted for secure fields | ✅ Mitigated |
| **Clipboard theft** | Copy PIN to clipboard | Copy disabled | ✅ Mitigated |

##### Gap Analysis: Masked Input

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **MI-1** | Brief character reveal on some Android keyboards | Low | Document as acceptable (300ms) |
| **MI-2** | No explicit requirement for FLAG_SECURE | Medium | Mandate FLAG_SECURE for PIN entry |
| **MI-3** | Accessibility screen readers vary by device | Low | Document accessibility behavior |

##### Recommendations for SCA Attestation Rulebook

1. **Native Secure Input**: Mandate use of platform secure input components
2. **FLAG_SECURE**: Require screenshot/recording protection during PIN entry
3. **Mask Character**: Specify standard mask character (• or *)
4. **No Clipboard**: Confirm PIN fields must disable copy/paste
5. **Brief Reveal**: Document acceptable brief character reveal duration

</details>

---

#### [Article 22(2)(b)](sources/32018R0389.md#article-22) — No plaintext storage

► "(b) personalised security credentials in data format, as well as cryptographic materials related to the encryption of the personalised security credentials are not stored in plain text;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WIAM_20](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Keys in Secure Enclave/StrongBox (hardware) |
| ✅ **Wallet** | iOS Keychain / Android Keystore | Encrypted storage for credentials |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: PIN Storage Implementation Evidence</strong></summary>

#### Android: AES-GCM Encryption with Android Keystore

The Android reference implementation encrypts the PIN using **AES/GCM/NoPadding** with a 256-bit key stored in Android Keystore:

**Android** — [`PrefsPinStorageProvider.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/authentication-logic/src/main/java/eu/europa/ec/authenticationlogic/storage/PrefsPinStorageProvider.kt#L57-L72) (lines 57-72):

```kotlin
// Lines 57-72: PIN encryption before storage
private fun encryptAndStore(pin: String) {
    val cipher = cryptoController.getCipher(
        encrypt = true,
        userAuthenticationRequired = false
    )
    val encryptedBytes = cryptoController.encryptDecrypt(
        cipher = cipher,
        byteArray = pin.toByteArray(Charsets.UTF_8)
    )
    val ivBytes = cipher?.iv ?: return
    prefsController.setString("PinEnc", encryptedBytes.encodeToBase64String())
    prefsController.setString("PinIv", ivBytes.encodeToBase64String())
}
```

**Key generation** — [`KeystoreController.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/business-logic/src/main/java/eu/europa/ec/businesslogic/controller/crypto/KeystoreController.kt#L90-L118) (lines 90-118):

```kotlin
// Lines 90-118: Key generation in Android Keystore
private fun generateSecretKey(alias: String, userAuthenticationRequired: Boolean) {
    val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
    val builder = KeyGenParameterSpec.Builder(
        alias,
        KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
    ).apply {
        setKeySize(256)
        setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        // ...
    }
    keyGenerator.init(builder.build())
    keyGenerator.generateKey()
}
```

#### iOS: Keychain with Hardware Encryption

The iOS reference implementation stores the PIN in the **iOS Keychain**, which provides hardware-backed encryption via the Secure Enclave on modern devices:

**iOS** — [`KeychainPinStorageProvider.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-authentication/Sources/Storage/KeychainPinStorageProvider.swift#L30-L31) (lines 30-31):

```swift
// Lines 30-31: PIN stored directly in Keychain (encrypted by iOS)
func setPin(with pin: String) {
    keyChainController.storeValue(key: KeyIdentifier.devicePin, value: pin)
}
```

**Keychain configuration** — [`KeyChainController.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-business/Sources/Controller/KeyChainController.swift#L75-L80) (lines 75-80):

```swift
// Lines 75-80: Biometry-protected items use device-only accessibility
try self.keyChain
    .accessibility(
        .whenPasscodeSetThisDeviceOnly,
        authenticationPolicy: [.touchIDAny]
    )
    .set(UUID().uuidString, key: self.biometryKey)
```

#### Summary

| Platform | Storage Method | Encryption | Key Location |
|----------|---------------|------------|--------------|
| **Android** | SharedPreferences (encrypted) | AES-256-GCM | Android Keystore (hardware-backed) |
| **iOS** | Keychain | System-managed | Secure Enclave (hardware) |

</details>

---

#### [Article 22(2)(c)](sources/32018R0389.md#article-22) — Protected cryptographic material

► "(c) secret cryptographic material is protected from unauthorised disclosure."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WUA_09](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a236-topic-9---wallet-unit-attestation) | Private key non-extractable from WSCA/WSCD |
| ✅ **Wallet** | [WIAM_20](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | WSCA/WSCD prevents key extraction |
| ✅ **Wallet** | Hardware attestation | Secure Enclave / StrongBox certification |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: Private Key Non-Extractability</strong></summary>

#### ARF High-Level Requirement: WIAM_20

► "A WSCA/WSCD **SHALL protect a private key** it generated during the entire lifetime of the key. This protection SHALL at least imply that the WSCA/WSCD **prevents the private key from being extracted in the clear**. If a WSCA/WSCD is able to export a private key in encrypted format, the resulting level of protection SHALL be equivalent to the protection level of the private key when stored in the WSCA."

#### ARF High-Level Requirement: WUA_09

► "A WUA SHALL contain a public key, and the corresponding **private key SHALL be generated by the WSCA/WSCD** described in the WUA."

#### Platform Implementation

| Platform | Secure Hardware | Non-Extractability Guarantee |
|----------|-----------------|----------------------------|
| **Android** | StrongBox (FIPS 140-2 L3) or TEE | `KeyProperties.KEY_FLAG_NON_EXTRACTABLE` (system-enforced) |
| **iOS** | Secure Enclave (CC certified) | Keys never leave the SE; operations occur inside hardware |

**Certification Standards**:
- Apple Secure Enclave: Common Criteria EAL4+ certified
- Android StrongBox: FIPS 140-2 Level 3 certified hardware security module

**Key Lifecycle**:
1. Key pair generated **inside** WSCA/WSCD (never exposed to application layer)
2. Public key exported to create WUA / attestation
3. Private key **never leaves** the secure hardware
4. All signing operations occur within the WSCA/WSCD

</details>

---

#### [Article 22(3)](sources/32018R0389.md#article-22) — Documented key management

► "Payment service providers shall fully document the process related to the management of cryptographic material used to encrypt or otherwise render unreadable the personalised security credentials."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ❌ **PSP** | — | PSP must document their key management processes |
| ⚠️ **Evidence** | [CIR 2024/2981](https://eur-lex.europa.eu/eli/reg_impl/2024/2981/oj/eng) | Wallet Solution certification includes key management review |

**Status**: ❌ PSP Obligation (with Wallet Certification Evidence)

<details>
<summary><strong>🔍 Deep-Dive: Key Management Documentation Requirements</strong></summary>

##### Core Requirement: Full Documentation

Article 22(3) requires PSPs to **fully document** the cryptographic material management process. This creates an audit trail and enables security reviews. For EUDI Wallet SCA, this involves both PSP-side and Wallet-side key management.

```
┌-----------------------------------------------------------------------------┐
│                    Key Management Documentation Scope                       │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │                   KEY LIFECYCLE PHASES                              │    │
│  │                                                                     │    │
│  │   GENERATION        STORAGE           USAGE            DESTRUCTION │     │
│  │   ---------        --------          -----            ------------│      │
│  │   • Algorithm      • Location        • Permitted ops  • Revocation│      │
│  │   • Key size       • Access control  • Auth required  • Archival  │      │
│  │   • Entropy source • Backup/recovery • Rate limits    • Sanitization│    │
│  │   • Hardware/SW    • Encryption      • Audit logging  • Completeness│    │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                              ▼                                              │
│  ┌---------------------------------------------------------------------┐    │
│  │                  DOCUMENTATION REQUIREMENTS                         │    │
│  │                                                                     │    │
│  │   • Policy documents (who, what, when)                              │    │
│  │   • Procedural guides (step-by-step processes)                      │    │
│  │   • Inventory (all keys, attributes, locations)                     │    │
│  │   • Audit logs (all operations, timestamps)                         │    │
│  │   • Incident response (breach procedures)                           │    │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Key Lifecycle Phases (NIST SP 800-57)

NIST SP 800-57 defines the gold standard for key management documentation:

| Phase | Documentation Required | EUDI Wallet Scope |
|-------|----------------------|-------------------|
| **Generation** | Algorithm, size, entropy, hardware | WSCA/WSCD generates in SE |
| **Registration** | Key binding to identity | WUA links key to device |
| **Distribution** | How key material is transported | Public key in attestation |
| **Storage** | Location, protection, backup | SE non-extractable |
| **Use** | Permitted operations, auth | Signing after user verification |
| **Rotation** | Renewal triggers, process | PSP-initiated re-attestation |
| **Archival** | Long-term storage policy | N/A (keys not archived) |
| **Destruction** | Revocation, sanitization | Wallet reset, revocation |

##### EUDI Wallet Key Management Responsibilities

| Component | Owner | Documentation Source |
|-----------|-------|---------------------|
| **Wallet private keys** | Wallet Provider | Wallet Solution certification (CIR 2024/2981) |
| **SCA Attestation signing key** | PSP | PSP internal documentation |
| **WUA signing key** | Wallet Provider | Wallet certification |
| **TLS certificates** | PSP | Certificate management policy |

##### Documentation Content Requirements

| Document Type | Content | Owner |
|---------------|---------|-------|
| **Key Management Policy** | Roles, responsibilities, approvals | PSP |
| **Key Inventory** | All keys, algorithms, expiry, location | Both |
| **Operational Procedures** | Generation, rotation, revocation steps | Both |
| **Incident Response** | Breach detection, response, notification | PSP |
| **Audit Log Specification** | What events logged, retention period | Both |

##### NIST SP 800-57 Alignment

| NIST Requirement | PSD2 Art. 22(3) | EUDI Wallet |
|------------------|-----------------|-------------|
| **Document key types and algorithms** | Implied | P-256 (ECDSA) documented in HAIP |
| **Define key lifetime** | Implied | SCA Attestation has `exp` claim |
| **Specify access controls** | Implied | User verification required |
| **Audit key operations** | "Fully document process" | PSP logs attestation issuance |
| **Training and awareness** | EBA best practice | PSP staff training |

##### Wallet Provider Certification Evidence

Wallet Solution certification under CIR 2024/2981 provides evidence for wallet-side key management:

| Certification Aspect | Coverage |
|---------------------|----------|
| **WSCD evaluation** | Hardware security, key non-extractability |
| **Key generation audit** | Entropy, algorithm compliance |
| **Access control** | User verification enforcement |
| **API security** | WSCA interface protection |

► **PSP Evidence**: PSPs can reference Wallet Solution certification as evidence for wallet-side key management documentation, supplementing their own server-side documentation.

##### Common Audit Findings

| Finding | Recommendation |
|---------|----------------|
| **No key inventory** | Create complete list with attributes |
| **Missing rotation procedure** | Document when and how keys rotate |
| **Inadequate access logs** | Log all key operations with timestamps |
| **No incident response** | Create breach response procedure |
| **Undocumented algorithms** | Specify all cryptographic choices |

##### Documentation Requirements (Non-Code)

► **Note**: Article 22(3) requires documentation, not implementation. These are compliance artifacts, not reference implementation code.

| Actor | Required Documentation |
|-------|----------------------|
| **PSP** | SCA Attestation issuance procedure |
| **PSP** | Key ceremony records (if PSP-issued) |
| **PSP** | Certificate management policy |
| **Wallet Provider** | WSCD security evaluation report (referenced via certification) |
| **OS Vendor** | SE/StrongBox security certification (CC, FIPS) |


##### Gap Analysis: Key Management Documentation

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **KM-1** | No template for PSP key management documentation | Medium | SCA Attestation Rulebook should provide template |
| **KM-2** | Wallet-side documentation not directly accessible to PSP | Low | Reference Wallet Solution certification |
| **KM-3** | Key rotation procedures not specified | Medium | Define rotation triggers and process |
| **KM-4** | Incident response for key compromise not standardized | Medium | Include in SCA Attestation Rulebook |

##### Recommendations for SCA Attestation Rulebook

1. **Documentation Template**: Provide key management documentation template for PSPs
2. **NIST Reference**: Reference NIST SP 800-57 for key management best practices
3. **Certification Cross-Reference**: Document how to reference Wallet Solution certification
4. **Audit Requirements**: Specify minimum audit log retention (e.g., 5 years)
5. **Incident Response**: Define breach notification and key revocation procedures
6. **Key Inventory**: Require PSPs to maintain key inventory with attributes

</details>

---

#### [Article 22(4)](sources/32018R0389.md#article-22) — Secure processing environment

► "Payment service providers shall ensure that the processing and routing of personalised security credentials and of the authentication codes generated in accordance with Chapter II take place in secure environments in accordance with strong and widely recognised industry standards."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | WSCD certification | Secure Enclave (CC EAL4+) / StrongBox (FIPS 140-2) |
| ✅ **Wallet** | [CIR 2024/2981](https://eur-lex.europa.eu/eli/reg_impl/2024/2981/oj/eng) | Wallet Solution certification requirements |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: Secure Processing Environment Standards</strong></summary>

##### Core Requirement: Industry-Standard Secure Environments

Article 22(4) mandates that PSC processing and auth code routing occur in environments meeting **"strong and widely recognised industry standards"**. This is a technology-neutral, outcomes-based requirement.

```
┌-----------------------------------------------------------------------------┐
│                   Secure Processing Environment Hierarchy                   │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │                    SECURITY LEVEL HIERARCHY                         │    │
│  │                                                                     │    │
│  │   HIGHEST SECURITY                                                  │    │
│  │   ================                                                  │    │
│  │                                                                     │    │
│  │   ┌---------------------------------------------------------------┐ │    │
│  │   │  SECURE ELEMENT (SE)  │  Separate chip, CC EAL5+/6           │ │     │
│  │   │  HSM (server-side)    │  FIPS 140-2 Level 3/4                │ │     │
│  │   └---------------------------------------------------------------┘ │    │
│  │                              ▼                                      │    │
│  │   ┌---------------------------------------------------------------┐ │    │
│  │   │  STRONGBOX (Android)  │  Integrated SE, FIPS 140-2 Level 3   │ │     │
│  │   │  SECURE ENCLAVE (iOS) │  Integrated SE, CC EAL4+             │ │     │
│  │   └---------------------------------------------------------------┘ │    │
│  │                              ▼                                      │    │
│  │   ┌---------------------------------------------------------------┐ │    │
│  │   │  TEE (ARM TrustZone)  │  Hardware isolation, moderate trust  │ │     │
│  │   └---------------------------------------------------------------┘ │    │
│  │                              ▼                                      │    │
│  │   ┌---------------------------------------------------------------┐ │    │
│  │   │  SOFTWARE KEYSTORE    │  OS-protected, software isolation    │ │     │
│  │   └---------------------------------------------------------------┘ │    │
│  │                                                                     │    │
│  │   LOWEST SECURITY                                                   │    │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Industry Standards Reference

| Standard | Description | Relevance |
|----------|-------------|-----------|
| **Common Criteria (ISO 15408)** | International security evaluation standard | SE/HSM certification |
| **FIPS 140-2/140-3** | US Federal cryptographic module standard | StrongBox, HSM |
| **GlobalPlatform TEE** | TEE specification and certification | ARM TrustZone |
| **PCI DSS** | Payment card industry security | PSP server infrastructure |
| **SOC 2 Type II** | Service organization controls | Cloud infrastructure |

##### Common Criteria Evaluation Assurance Levels

| EAL | Name | Use Case |
|-----|------|----------|
| **EAL4+** | Methodically Designed, Tested, Reviewed | Secure Enclave (Apple) |
| **EAL5** | Semi-formally Designed and Tested | Smartcard SEs |
| **EAL5+** | Higher semi-formal | High-value payment cards |
| **EAL6/EAL7** | Semi-formally/Formally Verified | Government HSMs |

##### FIPS 140-2 Security Levels

| Level | Physical Security | Use Case |
|-------|-------------------|----------|
| **Level 1** | Basic | Software crypto |
| **Level 2** | Tamper-evidence | Smartcards |
| **Level 3** | Tamper-resistance, identity-based auth | StrongBox, HSMs |
| **Level 4** | Environmental failure protection | High-security HSMs |

##### EUDI Wallet Secure Environment Mapping

| Component | Environment | Certification | Operations |
|-----------|-------------|---------------|------------|
| **Private key storage** | Secure Enclave / StrongBox | CC EAL4+ / FIPS 140-2 L3 | Key protection at rest |
| **Key generation** | SE/StrongBox | Hardware TRNG | ECDSA P-256 keypair |
| **Signing operations** | SE/StrongBox | Hardware crypto | SCA Attestation signing |
| **PIN validation** | WSCA | Platform-dependent | User verification |
| **Biometric match** | Secure Enclave | OS-certified | Template comparison |

##### PSP Server-Side Requirements

| Component | Requirement | Standard |
|-----------|-------------|----------|
| **HSM** | SCA Attestation signing key protection | FIPS 140-2 Level 3+ |
| **TLS termination** | Certificate management | PCI DSS |
| **Key ceremony** | Initial key generation | Audited process |
| **Logging infrastructure** | Tamper-evident logs | SOC 2 Type II |

##### Routing Security

```
┌-----------------------------------------------------------------------------┐
│                    PSC and Auth Code Routing Security                       │
├-----------------------------------------------------------------------------┤
│                                                                             │
│   WALLET                    NETWORK                   PSP                   │
│   ------                    -------                   ---                   │
│                                                                             │
│   ┌----------┐           ┌----------┐           ┌----------┐                │
│   │ Secure   │   TLS 1.3 │ Internet │   TLS 1.3 │ HSM+     │                │
│   │ Enclave  │----------►│ (public) │----------►│ Infra    │                │
│   └----------┘           └----------┘           └----------┘                │
│                                                                             │
│   ┌----------------------------------------------------------------------┐  │
│   │                    ROUTING SECURITY CONTROLS                         │  │
│   │                                                                      │  │
│   │   • End-to-end TLS 1.3 (no plaintext PSC in transit)                │   │
│   │   • Certificate pinning optional                                     │  │
│   │   • PSC never leaves secure boundary (PIN validated locally)         │  │
│   │   • Auth code (signature) generated in SE, sent over TLS             │  │
│   │                                                                      │  │
│   └----------------------------------------------------------------------┘  │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Platform Certification Evidence

| Platform | Component | Certification |
|----------|-----------|---------------|
| **Apple** | Secure Enclave | CC EAL4+ (per Apple Platform Security Guide) |
| **Android** | StrongBox | FIPS 140-2 Level 3 (per manufacturer attestation) |
| **Android** | TEE (TrustZone) | GlobalPlatform TEE certification |
| **Google** | Titan M2 chip | CC EAL4+ certified |
| **Samsung** | Knox Vault SE | CC EAL5+ certified |

##### CIR 2024/2981 Alignment

The Wallet Solution certification under CIR 2024/2981 provides:

| Certification Aspect | Industry Standard Coverage |
|---------------------|---------------------------|
| **WSCD evaluation** | CC/CEM methodology |
| **WSCA certification** | Security functional requirements |
| **Cryptographic algorithms** | SOG-IS approved list |
| **Protection profiles** | EN 419211 (smartcards) or equivalent |

##### Gap Analysis: Secure Processing Environment

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **SPE-1** | "Widely recognised" not enumerated | Low | Reference CC, FIPS 140-2, GlobalPlatform |
| **SPE-2** | Minimum EAL not specified | Medium | Recommend EAL4+ for mobile SE |
| **SPE-3** | TEE-only security level unclear | Medium | Clarify TEE vs. SE acceptability |
| **SPE-4** | PSP server-side standards not specified | Low | Reference PCI DSS, SOC 2 |

##### Recommendations for SCA Attestation Rulebook

1. **Standards Enumeration**: List acceptable standards (CC, FIPS 140-2, GlobalPlatform)
2. **Minimum Security Level**: Specify EAL4+/FIPS 140-2 Level 3 as minimum
3. **SE vs. TEE**: Clarify when TEE-only is acceptable (if ever)
4. **PSP Requirements**: Reference PCI DSS for PSP server infrastructure
5. **Attestation Verification**: Document how PSP verifies wallet security level
6. **Routing Protection**: Mandate TLS 1.2+ for all PSC/auth code transmission

</details>

---

## 4.2 Creation & Transmission of Credentials

► **Regulatory Basis**:
► - [RTS Art. 23](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_23): Creation and transmission of credentials

► "Payment service providers shall ensure that the creation of personalised security credentials is performed in a secure environment. They shall mitigate the risks of unauthorised use of the personalised security credentials and of the authentication devices and software following their loss, theft or copying before their delivery to the payer."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WUA_09](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a236-topic-9---wallet-unit-attestation) | Key pair generated within WSCA/WSCD |
| ✅ **Wallet** | [WIAM_20](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Private key never exported |
| ✅ **Wallet** | OID4VCI | Attestation issuance over TLS |

**Status**: ✅ Fully Supported

**Context**: Art. 23 governs the creation of **all PSC types** in the EUDI Wallet:

| PSC Type | Creation Mechanism | Secure Environment |
|----------|-------------------|-------------------|
| **PIN/Passphrase** | User sets during wallet activation | On-device (encrypted storage) |
| **Biometric** | OS enrollment (pre-existing) | Secure Enclave / TEE |
| **Private Key** | Generated within WSCA/WSCD | Secure Enclave / TEE |
| **SCA Attestation** | PSP signs over OID4VCI | PSP backend + TLS |

This is a stronger model than traditional PSP-generated credentials because the PSP never sees the private key or the user's PIN/biometric.

<details>
<summary><strong>🔍 Deep-Dive: Secure PSC Creation Architecture</strong></summary>

##### Core Requirement: Secure Environment

Article 23 mandates **two distinct protections**:

| Requirement | Description | EUDI Wallet Implementation |
|-------------|-------------|----------------------------|
| **Secure creation** | PSC created in protected environment | WSCD (Secure Enclave/StrongBox) |
| **Pre-delivery risk mitigation** | Protection before credential reaches user | N/A (credentials never leave device) |

```
┌-----------------------------------------------------------------------------┐
│                      PSC Creation Flow in EUDI Wallet                       │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  1. WALLET ACTIVATION                                                       │
│     ┌---------------------------------------------------------------------┐ │
│     │  User installs Wallet App → Wallet Provider verifies app integrity  │ │
│     │  Wallet Instance Attestation (WIA) issued                           │ │
│     └---------------------------------------------------------------------┘ │
│                              ▼                                              │
│  2. KEY PAIR GENERATION                                                     │
│     ┌---------------------------------------------------------------------┐ │
│     │  ┌---------------------------------------------------------------┐  │ │
│     │  │               SECURE ELEMENT (WSCD)                          │  │  │
│     │  │   ┌---------------------------------------------------------┐│  │  │
│     │  │   │  KeyPairGenerator.generateKeyPair()                    ││  │   │
│     │  │   │  • ECDSA P-256 (ES256) or P-384 (ES384)                ││  │   │
│     │  │   │  • Private key NEVER EXPORTED                          ││  │   │
│     │  │   │  • Public key available for attestation                ││  │   │
│     │  │   └---------------------------------------------------------┘│  │  │
│     │  └---------------------------------------------------------------┘  │ │
│     └---------------------------------------------------------------------┘ │
│                              ▼                                              │
│  3. PIN/BIOMETRIC ENROLLMENT                                                │
│     ┌---------------------------------------------------------------------┐ │
│     │  PIN: User creates → stored encrypted, never transmitted           │  │
│     │  Biometric: Enrolled via OS → reference stored in TEE              │  │
│     └---------------------------------------------------------------------┘ │
│                              ▼                                              │
│  4. SCA ATTESTATION ISSUANCE                                                │
│     ┌---------------------------------------------------------------------┐ │
│     │  Wallet → PSP: OID4VCI request (including public key, WUA)         │  │
│     │  PSP verifies: User identity (KYC), WUA, device binding            │  │
│     │  PSP → Wallet: Signed SCA Attestation (SD-JWT-VC)                  │  │
│     └---------------------------------------------------------------------┘ │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Hardware Security Levels

| Level | Environment | Private Key Protection | Certification |
|-------|-------------|------------------------|---------------|
| **L1** | Software-only | OS protection, encrypted storage | None |
| **L2** | TEE (Trusted Execution Environment) | Isolated execution | GlobalPlatform |
| **L3** | Secure Element (SE) | Dedicated hardware, tamper-resistant | CC EAL4+/5+ |

##### PSC Type Creation Details

| PSC Type | Creation Source | Entropy Source | Storage Location |
|----------|-----------------|----------------|------------------|
| **Cryptographic Key** | WSCD hardware RNG | Hardware TRNG | Secure Element |
| **PIN** | User input | User-chosen (entropy varies) | Encrypted in WSCD |
| **Biometric** | OS enrollment | Physical characteristic | TEE / Secure Enclave |
| **SCA Attestation** | PSP-issued | PSP signing key | Wallet encrypted storage |

##### Pre-Delivery Risk Mitigation

Traditional PSP model vs. EUDI Wallet model:

| Risk | Traditional PSP | EUDI Wallet | Advantage |
|------|-----------------|-------------|-----------|
| **Key theft in transit** | Key generated at PSP, transmitted | Key never leaves device | ✅ EUDI eliminates |
| **Credential interception** | PIN mailed, SMS OTP intercepted | PIN never transmitted | ✅ EUDI eliminates |
| **Insider threat** | PSP staff can access keys | PSP never sees private key | ✅ EUDI eliminates |
| **Batch compromise** | Centralized key storage | Distributed per-device keys | ✅ EUDI mitigates |

##### Threat Model: Creation Phase

| Threat | Vector | Mitigation |
|--------|--------|------------|
| **Weak RNG** | Predictable key generation | Hardware TRNG in WSCD |
| **Side-channel attack** | Key extraction during generation | Secure Element isolation |
| **Malicious wallet app** | Rogue app captures credentials | Wallet Provider certification, WIA |
| **Rooted device** | OS-level key extraction | StrongBox/Secure Enclave attestation |
| **Enrollment fraud** | Impersonation at issuance | PSP KYC, SCA during enrollment |

##### Platform Implementation

| Platform | Secure Element | Key Generation API | Certification |
|----------|----------------|---------------------|---------------|
| **iOS** | Secure Enclave | SecKeyGeneratePair | Apple security certification |
| **Android** | StrongBox / TEE | Android Keystore | FIDO, GlobalPlatform |
| **Desktop** | TPM 2.0 or smartcard | PKCS#11 | CC EAL4+ |

##### Gap Analysis: Secure PSC Creation

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **SC-1** | PIN entropy guidance not specified | Medium | Recommend 6+ digits, complexity score |
| **SC-2** | Key algorithm flexibility not documented | Low | Document supported curves (P-256, P-384) |
| **SC-3** | Fallback for devices without SE undefined | Medium | Define minimum security level requirements |
| **SC-4** | Biometric re-enrollment impact not addressed | Low | Require key rotation on biometric change |

##### Recommendations for SCA Attestation Rulebook

1. **Minimum Security Level**: Mandate L2 (TEE) minimum for production wallets
2. **Key Algorithm**: Specify P-256 or P-384 with ES256/ES384 signature
3. **PIN Guidance**: Recommend 6+ digit, no sequential (1234), no repeated (1111)
4. **Key Attestation**: Require hardware key attestation for production
5. **Certification Mapping**: Map WSCD certification to CC/FIPS equivalents
6. **Biometric Binding**: Document behavior when biometric re-enrolled

</details>

---

## 4.3 Association with Payment Service User

► **Regulatory Basis**:
► - [RTS Art. 24](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_24): Association with the payment service user

#### [Article 24(1)](sources/32018R0389.md#article-24) — Secure association

► "Payment service providers shall ensure that only the payment service user is associated, in a secure manner, with the personalised security credentials, the authentication devices and the software."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WIAM_09](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Cryptographic assets isolated per Wallet Unit |
| ✅ **Wallet** | Device binding | Attestation bound to specific device's WSCD |
| ⚠️ **PSP** | — | PSP must verify user identity before issuing attestation |

**Status**: ⚠️ Shared Responsibility

**Context**: 
- **Wallet provides**: Device binding, key isolation, per-user Wallet Unit
- **PSP must**: Verify user identity (KYC) before issuing SCA attestation

---

#### [Article 24(2)(a)](sources/32018R0389.md#article-24) — Secure binding environment

► "(a) the association of the payment service user's identity with personalised security credentials, authentication devices and software is carried out in secure environments under the payment service provider's responsibility..."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | OID4VCI | Issuance over TLS 1.2+ |
| ✅ **Wallet** | [WIA_*](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md) | Wallet Instance Attestation validates app integrity |
| ⚠️ **PSP** | — | PSP backend security is PSP's responsibility |

**Status**: ⚠️ Shared Responsibility

<details>
<summary><strong>🔍 Deep-Dive: Secure User Association Architecture</strong></summary>

##### Core Requirement: Exclusive User-PSC Binding

Article 24 ensures that PSCs are **bound only to the legitimate user**, covering three aspects:

| Aspect | Requirement | EUDI Wallet Implementation |
|--------|-------------|----------------------------|
| **User identity** | Only legitimate user associated | PSP KYC before attestation issuance |
| **Secure binding** | Protected association process | OID4VCI over TLS + WSCD key binding |
| **Remote channel SCA** | SCA required for remote binding | Wallet SCA before attestation issuance |

```
┌-----------------------------------------------------------------------------┐
│                   User-PSC Association Flow (Art. 24)                       │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  1. IDENTITY VERIFICATION (PSP Responsibility)                              │
│     ┌---------------------------------------------------------------------┐ │
│     │  Option A: Existing Customer                                        │ │
│     │     • User logs into PSP portal (existing credentials)              │ │
│     │     • PSP performs SCA with existing method                         │ │
│     │                                                                     │ │
│     │  Option B: New Customer                                             │ │
│     │     • User completes KYC (ID document, video ident)                 │ │
│     │     • PSP verifies identity against AML requirements                │ │
│     │                                                                     │ │
│     │  Option C: eIDAS-based                                              │ │
│     │     • User presents PID from EUDI Wallet                            │ │
│     │     • PSP verifies PID against trust framework                      │ │
│     └---------------------------------------------------------------------┘ │
│                              ▼                                              │
│  2. DEVICE BINDING (Wallet Responsibility)                                  │
│     ┌---------------------------------------------------------------------┐ │
│     │  ┌-----------------------------┐    ┌-----------------------------┐ │ │
│     │  │   WALLET UNIT (User-bound)  │    │   WSCD (Device-bound)       │ │ │
│     │  │   └- Wallet Unit ID         │←---│   └- Private Key            │ │ │
│     │  │   └- User partition         │    │   └- Hardware attestation   │ │ │
│     │  └-----------------------------┘    └-----------------------------┘ │ │
│     └---------------------------------------------------------------------┘ │
│                              ▼                                              │
│  3. SCA ATTESTATION ISSUANCE (Shared)                                       │
│     ┌---------------------------------------------------------------------┐ │
│     │  Wallet → PSP: OID4VCI Request                                      │ │
│     │     • Public key (cnf claim)                                        │ │
│     │     • Wallet Unit Attestation (WUA)                                 │ │
│     │     • Device binding proof                                          │ │
│     │                                                                     │ │
│     │  PSP → Wallet: SCA Attestation (SD-JWT-VC)                          │ │
│     │     • Bound to user identity (sub claim)                            │ │
│     │     • Bound to device key (cnf claim)                               │ │
│     │     • Contains PSP-specific payment scopes                          │ │
│     └---------------------------------------------------------------------┘ │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### User Identification Methods

| Method | PSD2 Compliance | EUDI Wallet Support | Notes |
|--------|-----------------|---------------------|-------|
| **Existing PSP SCA** | ✅ Compliant | ✅ Supported | Bootstraps new SCA attestation |
| **PID presentation** | ✅ Compliant | ✅ Native | eIDAS 2.0 identity assurance |
| **Video identification** | ✅ Compliant | ⚠️ External | PSP chooses provider |
| **Physical ID + in-person** | ✅ Compliant | N/A | Branch-based enrollment |
| **SMS OTP alone** | ❌ Insufficient | N/A | Not SCA-compliant for binding |

##### Device Binding Layers

| Layer | Binding Element | Purpose |
|-------|-----------------|---------|
| **Hardware** | WSCD key pair | Non-exportable device anchor |
| **Software** | Wallet Instance Attestation | App integrity verification |
| **User** | Wallet Unit | Per-user isolation |
| **Session** | TLS client cert / DPoP | Transport protection |

##### Binding Verification by PSP

| Evidence | Source | PSP Verification |
|----------|--------|------------------|
| **Public key** | Wallet WSCD | Verify hardware attestation |
| **WUA** | Wallet Provider | Verify signature chain |
| **User identity** | KYC or PID | Match against customer record |
| **Device integrity** | Android/iOS attestation | Verify device not compromised |

##### Threat Model: Association Phase

| Threat | Vector | Mitigation |
|--------|--------|------------|
| **Identity theft** | Fraudster uses stolen ID | PSP KYC, liveness detection |
| **Account takeover** | Attacker binds to victim's account | Require existing SCA for existing customers |
| **Device cloning** | Attacker copies device | Hardware key attestation, device ID binding |
| **Man-in-the-middle** | Intercept binding process | TLS pinning, OID4VCI token binding |
| **Insider attack** | PSP employee creates fake binding | Audit trails, separation of duties |

##### Secure Environment Requirements

| Component | PSP Responsibility | Wallet Responsibility |
|-----------|-------------------|----------------------|
| **Backend security** | HSM for signing, network segmentation | N/A |
| **API security** | Rate limiting, input validation | N/A |
| **Transport** | TLS 1.2+ | TLS 1.2+ |
| **Key storage** | N/A | WSCD (Secure Element) |
| **Audit logging** | All binding events | Wallet-side consent records |

##### Gap Analysis: User Association

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **UA-1** | KYC method selection not specified for wallet enrollment | Medium | Document acceptable KYC methods |
| **UA-2** | PID-based enrollment flow not fully specified | Medium | Define OID4VP + OID4VCI combined flow |
| **UA-3** | Device binding attestation format varies by platform | Low | Abstract via WUA standard |
| **UA-4** | Existing SCA bootstrapping requirements unclear | Medium | Define minimum SCA strength for bootstrap |

##### Recommendations for SCA Attestation Rulebook

1. **KYC Integration**: Document acceptable KYC methods for wallet-based enrollment
2. **PID Enrollment**: Specify PID presentation flow for new customer enrollment
3. **Bootstrap SCA**: Define minimum authentication strength for bootstrapping
4. **Device Attestation**: Require hardware attestation for production deployments
5. **Binding Evidence**: Specify required evidence in OID4VCI request
6. **Audit Requirements**: Define minimum logging for binding events

</details>

---

#### [Article 24(2)(b)](sources/32018R0389.md#article-24) — SCA for remote binding

► "(b) the association by means of a remote channel of the payment service user's identity with the personalised security credentials and with authentication devices or software is performed using strong customer authentication."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WIAM_14](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | User must authenticate (PIN/biometric) to wallet before attestation issuance |
| ⚠️ **PSP** | — | PSP must trigger SCA during onboarding |

**Status**: ✅ Fully Supported

**Context**: For remote SCA attestation issuance:
1. User authenticates to wallet (meets SCA requirement)
2. Wallet generates proof of user authentication
3. PSP verifies and issues attestation

This is the "bootstrap" SCA — using existing wallet authentication to issue new SCA attestations.


---

## 4.4 Secure Delivery of Credentials

► **Regulatory Basis**:
► - [RTS Art. 25](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_25): Delivery of credentials and authentication tools

► "Payment service providers shall ensure that the delivery of personalised security credentials, authentication devices and software to the payment service user is carried out in a secure manner designed to address the risks related to their unauthorised use due to their loss, theft or copying."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | OID4VCI | Attestation delivered over TLS |
| ✅ **Wallet** | Credential activation | Attestations require user confirmation before use |

**Status**: ✅ Fully Supported

**Context**: In the EUDI Wallet model:
- OID4VCI delivers the signed attestation over TLS
- The attestation is useless without the private key (non-extractable)
- Interception doesn't enable impersonation

<details>
<summary><strong>🔍 Deep-Dive: Secure Credential Delivery Architecture</strong></summary>

##### Core Requirement: Secure Delivery Against Loss, Theft, Copying

Article 25 mandates protection against **three distinct risks**:

| Risk | Traditional Mitigation | EUDI Wallet Mitigation |
|------|------------------------|------------------------|
| **Loss** | Activation codes, separate channels | Credential unusable without device key |
| **Theft** | PIN envelope, secure mail | TLS transport, WUA verification |
| **Copying** | Physical tamper-evident packaging | Non-exportable private key in WSCD |

```
┌-----------------------------------------------------------------------------┐
│                  Credential Delivery Flow (Art. 25)                         │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  TRADITIONAL MODEL (PSP-generated credentials)                              │
│  ==============================================                             │
│  ┌-------------┐    ┌-------------┐    ┌-------------┐    ┌-------------┐   │
│  │   PSP       │---►│   Mail      │---►│   User      │---►│   Device    │   │
│  │   generates │    │   service   │    │   receives  │    │   enters    │   │
│  │   PIN       │    │             │    │   PIN       │    │   PIN       │   │
│  └-------------┘    └-------------┘    └-------------┘    └-------------┘   │
│                                                                             │
│  ⚠️ RISKS: Interception, postal loss, shoulder surfing                      │
│                                                                             │
│  =======================================================================    │
│                                                                             │
│  EUDI WALLET MODEL (User-generated key + PSP-issued attestation)            │
│  =================================================================          │
│  ┌----------------------------------------------------------------------┐   │
│  │                                                                      │   │
│  │  ┌---------------┐                      ┌-----------------------┐   │    │
│  │  │   WALLET      │◄----- TLS 1.2+ -----►│   PSP ISSUER          │   │    │
│  │  │   ┌---------┐ │  OID4VCI Protocol    │   ┌-----------------┐ │   │    │
│  │  │   │ WSCD    │ │                      │   │ HSM signs       │ │   │    │
│  │  │   │ Private │ │  Attestation         │   │ attestation     │ │   │    │
│  │  │   │ Key     │ │  (SD-JWT-VC)         │   │                 │ │   │    │
│  │  │   └---------┘ │  ←------------------ │   └-----------------┘ │   │    │
│  │  └---------------┘                      └-----------------------┘   │    │
│  │                                                                      │   │
│  │  ✅ ADVANTAGES: Key never transmitted, attestation bound to device   │    │
│  │                                                                      │   │
│  └----------------------------------------------------------------------┘   │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Transport Security Requirements

| Layer | Requirement | EUDI Implementation |
|-------|-------------|---------------------|
| **TLS Version** | 1.2+ minimum | OID4VCI over HTTPS |
| **Cipher Suites** | AEAD (AES-GCM, ChaCha20) | Per IETF best practices |
| **Certificate** | Valid, trusted CA | PSP certificate chain |
| **HSTS** | Recommended | Enforced |
| **Certificate Pinning** | Optional | Wallet may implement |

##### OID4VCI Delivery Security

| Security Feature | OID4VCI Mechanism |
|------------------|-------------------|
| **Authorization** | Authorization code or pre-authorized code |
| **Token binding** | DPoP (Demonstrating Proof-of-Possession) |
| **Credential binding** | `cnf` claim with device public key |
| **Replay prevention** | Single-use authorization codes |
| **Integrity** | PSP signature on attestation |

##### Credential Types and Delivery Methods

| PSC Type | Delivery Method | Transport Security |
|----------|-----------------|---------------------|
| **SCA Attestation** | OID4VCI | TLS + signed SD-JWT-VC |
| **PIN** | User-generated locally | N/A (never transmitted) |
| **Biometric** | OS enrollment | N/A (never transmitted) |
| **Private Key** | Generated in WSCD | N/A (never transmitted) |

##### Comparison: Traditional vs. EUDI Wallet Delivery

| Aspect | Traditional | EUDI Wallet | Security Benefit |
|--------|-------------|-------------|------------------|
| **Private key** | Transmitted (encrypted) | Never leaves device | ✅ Eliminates key theft |
| **PIN** | Mailed separately | User-created locally | ✅ Eliminates interception |
| **Activation code** | SMS or email | N/A (key binding) | ✅ No code to intercept |
| **Credential usability** | Standalone | Bound to device key | ✅ Theft is useless |

##### Threat Model: Delivery Phase

| Threat | Vector | Mitigation |
|--------|--------|------------|
| **Network interception** | MITM on delivery channel | TLS 1.2+ with AEAD |
| **DNS spoofing** | Redirect to fake PSP | Certificate pinning, DNSSEC |
| **Replay attack** | Reuse authorization code | Single-use codes, nonce |
| **Credential theft** | Steal delivered attestation | Bound to non-exportable key |
| **Fake issuer** | PSP impersonation | Trust framework, WUA verification |

##### Activation Requirements

| Activation Step | Purpose | Implementation |
|-----------------|---------|----------------|
| **User confirmation** | Consent to receive | Wallet UI prompt |
| **Credential storage** | Secure persistence | Encrypted wallet storage |
| **First use SCA** | Verify binding works | PSP may require test transaction |

##### Gap Analysis: Secure Delivery

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **SD-1** | TLS cipher suite requirements not specified | Low | Reference IETF BCP 195 |
| **SD-2** | Certificate pinning guidance not provided | Low | Document as optional enhancement |
| **SD-3** | Delivery confirmation mechanism not specified | Medium | Define acknowledgment flow |
| **SD-4** | Offline delivery fallback not addressed | Low | Document as out-of-scope |

##### Recommendations for SCA Attestation Rulebook

1. **TLS Requirements**: Reference BSI TR-02102-2 or IETF BCP 195 for cipher suites
2. **Certificate Pinning**: Document as recommended for high-security deployments
3. **Delivery Confirmation**: Define OID4VCI acknowledgment mechanism
4. **Retry Logic**: Specify retry behavior for failed deliveries
5. **Audit Trail**: Log successful deliveries for compliance evidence
6. **Revocation Check**: Verify PSP certificate status using OCSP/CRL

</details>

---

## 4.5 Renewal of Credentials

► **Regulatory Basis**:
► - [RTS Art. 26](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_26): Renewal of personalised security credentials

► "Payment service providers shall ensure that the renewal or re-activation of personalised security credentials adhere to the procedures for the creation, association and delivery of the credentials and of the authentication devices in accordance with Articles 23, 24 and 25."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | OID4VCI refresh | Same issuance flow for renewal |
| ⚠️ **PSP** | — | PSP must implement renewal policy |

**Status**: ✅ Fully Supported

**Context**: Art. 26 applies to renewal of **all PSC types**:

| PSC Type | Renewal Mechanism |
|----------|------------------|
| **PIN/Passphrase** | User-initiated PIN change (wallet provides UI) |
| **Biometric** | OS-level re-enrollment (Face ID reconfiguration, etc.) |
| **Private Key + Attestation** | OID4VCI refresh flow (same as initial issuance) |

The wallet may generate a new key pair or reuse the existing one (PSP policy decision).

<details>
<summary><strong>🔍 Deep-Dive: Credential Renewal Architecture</strong></summary>

##### Core Requirement: Renewal = Same Security as Creation

Article 26 mandates that renewal/re-activation follows **the same procedures as original issuance**:

| Phase | Required Security (per Art. 26) |
|-------|--------------------------------|
| **Creation** | Art. 23 — Secure environment |
| **Association** | Art. 24 — User identity verification |
| **Delivery** | Art. 25 — Secure transport |

```
┌-----------------------------------------------------------------------------┐
│                    Credential Renewal Flow (Art. 26)                        │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  RENEWAL TRIGGERS                                                           │
│  ================                                                           │
│  ┌------------------------------------------------------------------------┐ │
│  │  1. Expiry-based:     Attestation exp claim reached                    │ │
│  │  2. User-initiated:   User requests new credentials                    │ │
│  │  3. Security event:   Suspected compromise, key rotation policy        │ │
│  │  4. PSP policy:       Periodic forced renewal                          │ │
│  │  5. Device change:    New device, OS upgrade with SE migration         │ │
│  └------------------------------------------------------------------------┘ │
│                              ▼                                              │
│  KEY ROTATION DECISION                                                      │
│  =====================                                                      │
│  ┌------------------------------------------------------------------------┐ │
│  │                                                                        │ │
│  │           ┌---------------------┐                                      │ │
│  │           │   PSP Policy        │                                      │ │
│  │           │   Decision          │                                      │ │
│  │           └----------┬----------┘                                      │ │
│  │                      │                                                 │ │
│  │         ┌------------┴------------┐                                    │ │
│  │         ▼                         ▼                                    │ │
│  │  ┌-----------------┐    ┌-----------------┐                           │  │
│  │  │ SAME KEY        │    │ NEW KEY         │                           │  │
│  │  │ • exp refresh   │    │ • Full rotation │                           │  │
│  │  │ • Faster        │    │ • New key pair  │                           │  │
│  │  │ • Same cnf      │    │ • New cnf claim │                           │  │
│  │  └-----------------┘    └-----------------┘                           │  │
│  │                                                                        │ │
│  └------------------------------------------------------------------------┘ │
│                              ▼                                              │
│  OID4VCI RENEWAL FLOW                                                       │
│  =====================                                                      │
│  ┌------------------------------------------------------------------------┐ │
│  │  1. User authenticates to wallet (SCA — Art. 24(2)(b))                 │ │
│  │  2. Wallet initiates OID4VCI refresh (same as Art. 23)                 │ │
│  │  3. PSP verifies user identity, device binding (Art. 24)               │ │
│  │  4. PSP issues new attestation over TLS (Art. 25)                      │ │
│  │  5. Wallet stores new attestation, old one invalidated                 │ │
│  └------------------------------------------------------------------------┘ │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Renewal Triggers

| Trigger | Initiation | SCA Required? |
|---------|------------|---------------|
| **Expiry-based** | Automatic (wallet or PSP) | ✅ Yes |
| **User-initiated** | User request | ✅ Yes |
| **Security event** | PSP or wallet provider | ✅ Yes |
| **PSP policy** | Scheduled (e.g., annual) | ✅ Yes |
| **Device change** | User action | ✅ Yes (full re-enrollment) |

##### Key Rotation Strategies

| Strategy | When to Use | Impact |
|----------|-------------|--------|
| **Attestation-only refresh** | Expiry, policy refresh | Same key, new `exp` claim |
| **Full key rotation** | Security concern, device change | New key pair, new attestation |
| **Forced rotation** | Suspected compromise | Revoke old + new key pair |

##### PSC Type Renewal Details

| PSC Type | Renewal Mechanism | SCA Trigger |
|----------|-------------------|-------------|
| **PIN** | User changes via wallet UI | Prior SCA (old PIN) |
| **Biometric** | OS enrollment change | OS verifies identity |
| **Private Key** | New key in WSCD | Wallet SCA before generation |
| **SCA Attestation** | OID4VCI refresh | Wallet SCA + PSP verification |

##### Validity and Expiry Management

| Element | Validity Period | Renewal Grace |
|---------|-----------------|---------------|
| **SCA Attestation** | PSP-defined (e.g., 1 year) | 30 days before expiry |
| **Private Key** | Tied to attestation | Rotated if desired |
| **PIN** | Unlimited (PSP policy may require change) | N/A |
| **Biometric** | Unlimited (OS-managed) | N/A |

##### Token Renewal vs. SCA Renewal

Per EBA guidance, **technical token replacements** (background updates) differ from **credential renewal**:

| Scenario | SCA Required? | Reason |
|----------|---------------|--------|
| **Initial attestation** | ✅ Yes | Art. 24(2)(b) — remote binding |
| **Attestation renewal (same key)** | ✅ Yes | Art. 26 — follows Art. 23-25 |
| **Attestation renewal (new key)** | ✅ Yes | Art. 26 — full re-issuance |
| **Background token refresh** | ❌ No | Technical, no user action |

##### Threat Model: Renewal Phase

| Threat | Vector | Mitigation |
|--------|--------|------------|
| **Attacker renews stolen credential** | Compromise old SCA | Require SCA with old credentials |
| **Expired attestation exploitation** | Use after expiry | PSP rejects expired `exp` |
| **Key exhaustion** | Overuse of same key | Rotation policy (e.g., 1 year) |
| **Renewal phishing** | Fake renewal request | OID4VCI via trusted wallet |

##### Gap Analysis: Credential Renewal

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **RN-1** | Attestation validity period not specified | Medium | Define recommended validity (1 year) |
| **RN-2** | Key rotation policy not defined | Medium | Document rotation triggers |
| **RN-3** | Renewal grace period not standardized | Low | Define pre-expiry renewal window |
| **RN-4** | Device migration flow not specified | Medium | Document SE key migration |

##### Recommendations for SCA Attestation Rulebook

1. **Validity Period**: Recommend 1-year attestation validity with 30-day renewal grace
2. **Key Rotation**: Define when key rotation is mandatory vs. optional
3. **Renewal SCA**: Clarify SCA is always required for renewal
4. **Grace Period**: Define behavior when attestation expires mid-session
5. **Device Migration**: Document key migration for device upgrades
6. **Audit Trail**: Log all renewal events for compliance

</details>

---

## 4.6 Destruction, Deactivation & Revocation

► **Regulatory Basis**:
► - [RTS Art. 27](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_27): Destruction, deactivation and revocation

#### [Article 27(a)](sources/32018R0389.md#article-27) — Secure destruction/deactivation/revocation

► "(a) the secure destruction, deactivation or revocation of the personalised security credentials, authentication devices and software;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WURevocation_09](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2322-topic-38---wallet-unit-revocation) | Wallet Provider can revoke Wallet Unit |
| ✅ **Wallet** | [WIAM_06](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | User can request revocation |
| ⚠️ **PSP** | — | PSP must revoke SCA attestation on their side |

**Status**: ⚠️ Shared Responsibility

**Context**: Art. 27(a) applies to destruction/deactivation of **all PSC types**:

| PSC Type | Destruction/Deactivation Mechanism |
|----------|-----------------------------------|
| **PIN/Passphrase** | Deleted from encrypted storage on wallet reset |
| **Biometric** | OS-level removal (user removes Face ID, etc.) |
| **Private Key** | Deleted from WSCA/WSCD on wallet uninstall/reset |
| **SCA Attestation** | PSP revokes status in backend; wallet deletes local copy |

Shared responsibility:
- **Wallet Provider**: Can revoke WUA, invalidating the device binding
- **PSP**: Must revoke the SCA attestation status in their backend
- **User**: Can request revocation via independent account (WIAM_06)

<details>
<summary><strong>🔍 Deep-Dive: Credential Destruction & Revocation Architecture</strong></summary>

##### Core Requirement: Three Distinct Operations

Article 27(a) covers three operations, each with different implications:

| Operation | Definition | Reversibility |
|-----------|------------|---------------|
| **Destruction** | Complete erasure of credential | ❌ Irreversible |
| **Deactivation** | Temporary suspension | ✅ Reversible |
| **Revocation** | Permanent invalidation with audit trail | ❌ Irreversible |

```
┌-----------------------------------------------------------------------------┐
│               Credential Revocation Architecture (Art. 27)                  │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  REVOCATION TRIGGERS                                                        │
│  ===================                                                        │
│  ┌------------------------------------------------------------------------┐ │
│  │  1. User-initiated:    User requests revocation (lost device, etc.)   │  │
│  │  2. PSP-initiated:     Fraud detection, account closure               │  │
│  │  3. WP-initiated:      Wallet Provider detects compromise             │  │
│  │  4. Automatic:         Attestation max lifetime reached               │  │
│  │  5. Regulatory:        Competent authority order                      │  │
│  └------------------------------------------------------------------------┘ │
│                              ▼                                              │
│  MULTI-PARTY REVOCATION                                                     │
│  ======================                                                     │
│  ┌------------------------------------------------------------------------┐ │
│  │                                                                        │ │
│  │  ┌-----------------┐  ┌-----------------┐  ┌---------------------┐    │  │
│  │  │  USER DEVICE    │  │  WALLET PROVIDER│  │  PSP BACKEND        │    │  │
│  │  ├-----------------┤  ├-----------------┤  ├---------------------┤    │  │
│  │  │ • Delete local  │  │ • Revoke WUA    │  │ • Mark attestation  │    │  │
│  │  │   attestation   │  │ • Notify wallet │  │   as revoked        │    │  │
│  │  │ • Secure wipe   │  │ • Update status │  │ • Update status     │    │  │
│  │  │   of keys       │  │   endpoint      │  │   list/OCSP         │    │  │
│  │  │ • Clear PIN     │  │                 │  │ • Reject future VPs │    │  │
│  │  └-----------------┘  └-----------------┘  └---------------------┘    │  │
│  │                                                                        │ │
│  │           All three MUST be synchronized for complete revocation       │ │
│  │                                                                        │ │
│  └------------------------------------------------------------------------┘ │
│                              ▼                                              │
│  STATUS PUBLICATION                                                         │
│  ==================                                                         │
│  ┌------------------------------------------------------------------------┐ │
│  │  Option A: Status List 2021 (W3C)                                      │ │
│  │     • Bit array at URL, updated periodically                           │ │
│  │     • Wallet checks status before accepting VP                         │ │
│  │                                                                        │ │
│  │  Option B: OCSP (Online Certificate Status Protocol)                   │ │
│  │     • Real-time status check                                           │ │
│  │     • Higher latency, always current                                   │ │
│  └------------------------------------------------------------------------┘ │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Revocation Triggers

| Trigger | Initiator | Urgency | Example |
|---------|-----------|---------|---------|
| **Device loss/theft** | User | 🔴 Critical | Phone stolen |
| **Fraud detected** | PSP | 🔴 Critical | Unauthorized transactions |
| **Account closure** | PSP/User | 🟡 Normal | User leaves bank |
| **Compromise suspected** | WP | 🔴 Critical | Wallet integrity failure |
| **Regulatory order** | Authority | 🔴 Critical | Court order, sanctions |
| **User request** | User | 🟡 Normal | Cleanup, new device |

##### Secure Wipe Procedures

| Component | Wipe Method | Standard |
|-----------|-------------|----------|
| **Private Key** | WSCD secure erase | Hardware-enforced |
| **PIN hash** | Zero-fill + delete | NIST SP 800-88 |
| **Attestation** | File deletion | Platform secure delete |
| **Biometric template** | OS API removal | Platform-specific |
| **Session tokens** | Memory clear | Process termination |

##### PSC Type Revocation Details

| PSC Type | Local Action | Remote Action |
|----------|--------------|---------------|
| **Private Key** | Delete from WSCD | N/A (key never transmitted) |
| **SCA Attestation** | Delete from wallet storage | Update status list |
| **PIN** | Clear from encrypted storage | N/A (never stored remotely) |
| **Biometric** | Request OS to unenroll | N/A (never stored remotely) |
| **WUA** | Invalidated by WP | WP updates validity endpoint |

##### Status Publication Methods

| Method | Latency | Bandwidth | Use Case |
|--------|---------|-----------|----------|
| **Status List 2021** | Minutes (batch) | Low | Standard deployments |
| **OCSP** | Real-time | Higher | High-security transactions |
| **CRL** | Hours/Days | Low | Legacy compatibility |
| **PSP direct check** | Real-time | Per-txn | Custom implementations |

##### Revocation Flow: User-Initiated

```
┌-------┐     ┌-----------┐     ┌-------┐          ┌-----------┐
│ USER  │     │  WALLET   │     │  WP   │          │    PSP    │
└---┬---┘     └-----┬-----┘     └---┬---┘          └-----┬-----┘
    │               │               │                    │
    │ Request       │               │                    │
    │ Revocation    │               │                    │
    │--------------►│               │                    │
    │               │               │                    │
    │               │ Notify        │                    │
    │               │ Revocation    │                    │
    │               │--------------►│                    │
    │               │               │                    │
    │               │               │ Update Status      │
    │               │               │-------------------►│
    │               │               │                    │
    │               │ Local Wipe    │      Mark Revoked  │
    │               │◄--------------│◄-------------------│
    │               │               │                    │
    │ Confirmation  │               │                    │
    │◄--------------│               │                    │
    │               │               │                    │
```

##### Threat Model: Revocation Phase

| Threat | Vector | Mitigation |
|--------|--------|------------|
| **Delayed revocation** | User delay in reporting | Promote immediate reporting |
| **Status list stale** | Batch update delay | Real-time OCSP for high-value |
| **Local copy persists** | Device offline | Backend always rejects |
| **Race condition** | VP during revocation | Transaction monitoring |
| **Revocation denial** | Attacker blocks request | Multiple revocation channels |

##### Gap Analysis: Destruction/Revocation

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **DR-1** | Revocation propagation latency not specified | Medium | Define max latency (e.g., 5 min) |
| **DR-2** | Status publication method not mandated | Medium | Recommend Status List 2021 |
| **DR-3** | Secure wipe verification not documented | Low | Define attestation of wipe |
| **DR-4** | Multi-party revocation coordination undefined | High | Define revocation protocol |

##### Recommendations for SCA Attestation Rulebook

1. **Revocation Protocol**: Define multi-party revocation coordination
2. **Status Publication**: Mandate Status List 2021 or equivalent
3. **Propagation Latency**: Define maximum revocation propagation time
4. **Secure Wipe**: Reference NIST SP 800-88 for key destruction
5. **User Channels**: Require minimum 2 revocation channels (app + portal)
6. **Audit Trail**: Log all revocation events with timestamps

</details>

---

#### [Article 27(b)](sources/32018R0389.md#article-27) — Secure re-use

► "(b) where the payment service provider distributes reusable authentication devices and software, the secure re-use of a device or software is established, documented and implemented before making it available to another payment services user;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ➖ **N/A** | — | EUDI Wallet attestations are per-user; no re-use |

**Status**: ➖ Not Applicable

**Context**: The EUDI Wallet model issues per-user attestations bound to device-specific keys. There is no "re-use" scenario.

---

#### [Article 27(c)](sources/32018R0389.md#article-27) — Deactivation in systems

► "(c) the deactivation or revocation of information related to personalised security credentials stored in the payment service provider's systems and databases and, where relevant, in public repositories."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ❌ **PSP** | — | PSP must implement revocation in their backend |
| ⚠️ **Evidence** | Status list / OCSP | Wallet ecosystem provides revocation mechanisms |

**Status**: ❌ PSP Obligation

**Context**: The PSP must:
1. Mark revoked SCA attestations in their database
2. Reject VPs using revoked attestations
3. Optionally publish revocation status (status list / OCSP)

<details>
<summary><strong>🔍 Deep-Dive: PSP Backend Deactivation & Status Management</strong></summary>

##### Core Requirement: Complete Backend Invalidation

Article 27(b-c) ensures credentials are fully invalidated across all systems:

| Article | Scope | EUDI Wallet Applicability |
|---------|-------|---------------------------|
| **27(b)** | Reusable devices | ➖ N/A (per-user binding) |
| **27(c)** | PSP systems & databases | ❌ PSP Obligation |

```
┌-----------------------------------------------------------------------------┐
│                PSP Backend Deactivation Architecture (Art. 27c)             │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  PSP BACKEND SYSTEMS                                                        │
│  ====================                                                       │
│  ┌------------------------------------------------------------------------┐ │
│  │                                                                        │ │
│  │  ┌-----------------------------------------------------------------┐  │  │
│  │  │  ATTESTATION REGISTRY                                           │  │  │
│  │  │  ┌----------------------------------------------------------┐   │  │  │
│  │  │  │  Attestation ID  │  User  │  Status  │  Revoked At       │   │  │  │
│  │  │  ├------------------┼--------┼----------┼-------------------┤   │  │  │
│  │  │  │  att_abc123...   │  U001  │  ACTIVE  │  —                │   │  │  │
│  │  │  │  att_def456...   │  U001  │  REVOKED │  2026-01-28T02:00 │   │  │  │
│  │  │  │  att_ghi789...   │  U002  │  ACTIVE  │  —                │   │  │  │
│  │  │  └------------------┴--------┴----------┴-------------------┘   │  │  │
│  │  └-----------------------------------------------------------------┘  │  │
│  │                                                                        │ │
│  │  ┌-----------------------------------------------------------------┐  │  │
│  │  │  VERIFICATION SERVICE                                          │  │   │
│  │  │  ┌----------------------------------------------------------┐   │  │  │
│  │  │  │  1. Receive VP with attestation                          │   │  │  │
│  │  │  │  2. Check attestation status in registry                 │   │  │  │
│  │  │  │  3. If REVOKED → Reject transaction                      │   │  │  │
│  │  │  │  4. If ACTIVE → Proceed with verification                │   │  │  │
│  │  │  └----------------------------------------------------------┘   │  │  │
│  │  └-----------------------------------------------------------------┘  │  │
│  │                                                                        │ │
│  └------------------------------------------------------------------------┘ │
│                              ▼                                              │
│  PUBLIC REPOSITORIES (Optional)                                             │
│  ===============================                                            │
│  ┌------------------------------------------------------------------------┐ │
│  │  Status List 2021 URL: https://psp.example/status/sca-attestations     │ │
│  │  ┌------------------------------------------------------------------┐  │ │
│  │  │  Bit array: 0 0 1 0 0 0 1 0 0 1 ...                              │  │ │
│  │  │  (1 = revoked, 0 = valid)                                        │  │ │
│  │  └------------------------------------------------------------------┘  │ │
│  └------------------------------------------------------------------------┘ │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Why Art. 27(b) is Not Applicable

| Traditional Model | EUDI Wallet Model |
|-------------------|-------------------|
| PSP may issue reusable hardware tokens | Attestations bound to device key |
| Token can be wiped and re-provisioned | Key pair is per-user, non-transferable |
| Re-use requires secure reset procedure | No re-use scenario exists |

##### PSP Backend Obligations (Art. 27c)

| Obligation | Implementation | Evidence |
|------------|----------------|----------|
| **Mark attestation revoked** | Database status field | Audit log entry |
| **Reject revoked attestations** | Verification service check | Transaction rejection log |
| **Publish status (optional)** | Status List 2021 endpoint | Public URL |
| **Retain records** | Compliance database | Retention per AML requirements |

##### Status Management Patterns

| Pattern | Description | Use Case |
|---------|-------------|----------|
| **Internal registry** | PSP-only database | Minimum requirement |
| **Status List 2021** | W3C standard, public URL | Ecosystem interoperability |
| **OCSP responder** | Real-time status check | High-security transactions |
| **Credential blacklist** | Deny list of revoked IDs | Legacy integration |

##### Data Retention Requirements

| Data Element | Retention Period | Basis |
|--------------|------------------|-------|
| **Attestation ID** | 5+ years | AML Directive |
| **Revocation timestamp** | 5+ years | PSD2 audit requirements |
| **Revocation reason** | 5+ years | Fraud investigation |
| **User identity link** | 5+ years | KYC/AML |
| **Transaction attempts post-revocation** | 5+ years | Fraud evidence |

##### Verification Flow: Revoked Attestation

```
┌-----------┐     ┌---------------┐     ┌---------------┐
│  WALLET   │     │  PSP VERIFIER │     │  REGISTRY     │
└-----┬-----┘     └-------┬-------┘     └-------┬-------┘
      │                   │                             │
      │ VP with           │                             │
      │ attestation       │                             │
      │------------------►│                             │
      │                   │                             │
      │                   │ Check status                │
      │                   │--------------------►        │
      │                   │                             │
      │                   │ Status: REVOKED             │
      │                   │◄--------------------        │
      │                   │                             │
      │ Reject:           │                             │
      │ "Attestation      │                             │
      │  revoked"         │                             │
      │◄------------------│                             │
      │                   │                             │
      │                   │ Log: rejected               │
      │                   │ attempt                     │
      │                   │--------------------►        │
      │                   │                             │
```

##### Public Repository Considerations

| Repository | Content | Privacy |
|------------|---------|---------|
| **Status List 2021** | Bit array (no user data) | ✅ Privacy-preserving |
| **OCSP** | Attestation ID only | ✅ Privacy-preserving |
| **CRL** | List of revoked IDs | ⚠️ May reveal patterns |
| **Public ledger** | NOT recommended | ❌ Privacy concern |

##### Gap Analysis: PSP System Deactivation

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **PS-1** | Backend verification check not mandated | High | Require real-time status check |
| **PS-2** | Retention period not standardized | Medium | Align with AML (5 years) |
| **PS-3** | Public repository format not specified | Low | Recommend Status List 2021 |
| **PS-4** | Cross-PSP revocation notification undefined | Medium | Define ecosystem protocol |

##### Recommendations for SCA Attestation Rulebook

1. **Verification Mandate**: Require PSPs to check attestation status before accepting
2. **Registry Requirement**: Define minimum attestation registry fields
3. **Status Publication**: Recommend Status List 2021 for interoperability
4. **Retention Alignment**: Reference AML Directive for retention periods
5. **Audit Logging**: Require logging of all revocation events and rejection attempts
6. **Cross-PSP Protocol**: Define notification mechanism for ecosystem-wide revocation

##### Article 27 Complete Summary

| Sub-article | Requirement | EUDI Wallet Status |
|-------------|-------------|-------------------|
| **27(a)** | Secure destruction/deactivation/revocation | ✅ Covered (shared responsibility) |
| **27(b)** | Secure re-use of devices | ➖ N/A (per-user binding) |
| **27(c)** | Deactivation in PSP systems | ❌ PSP Obligation |

</details>

---

===============================================================================
# PART B: TRANSACTION AUTHENTICATION (Usage Phase)
===============================================================================

► *This part covers the **usage phase** of SCA attestations — when the user authenticates for payment transactions.*
►
► **PSD2 Article 97** + **RTS Chapter II** (Articles 1-9): Strong customer authentication requirements

---

# 5. SCA Triggers & Exemptions


## 5.1 When SCA is Required

► **Regulatory Basis**:
► - [PSD2 Directive Art. 97(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366#097.001): "Member States shall ensure that a payment service provider applies strong customer authentication where the payer: (a) accesses its payment account online; (b) initiates an electronic payment transaction; (c) carries out any action through a remote channel which may imply a risk of payment fraud or other abuses."
► - [RTS Art. 1](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_1): Subject matter  
► "Member States shall ensure that a payment service provider applies strong customer authentication where the payer:
► (a) accesses its payment account online;
► (b) initiates an electronic payment transaction;
► (c) carries out any action through a remote channel which may imply a risk of payment fraud or other abuses."

**Core Requirement**: Article 97(1) defines the **three mandatory triggers** for SCA. When any of these scenarios occurs, the PSP **must** apply SCA unless a specific exemption applies.

| SCA Trigger | Description | Primary Use Case |
|-------------|-------------|------------------|
| **Art. 97(1)(a)** | Access payment account online | Login to mobile/online banking |
| **Art. 97(1)(b)** | Initiate electronic payment | SEPA transfer, card payment, standing order |
| **Art. 97(1)(c)** | High-risk action via remote channel | Change PIN, add trusted beneficiary, modify limits |

**Status**: ✅ **Supported** — TS12 provides transaction types for all three triggers

---

**Deep Dive: Trigger-to-URN Mapping**

TS12 defines four standardized transaction types corresponding to the three PSD2 triggers:

| PSD2 Trigger | TS12 Transaction Type | JSON URN | Wallet Display |
|--------------|----------------------|----------|----------------|
| **Art. 97(1)(a)** | Login & Risk-based | `urn:eudi:sca:login_risk_transaction:1` | "Log in to Online Banking" |
| **Art. 97(1)(a)** | Account Information Access | `urn:eudi:sca:account_access:1` | "View account balances" |
| **Art. 97(1)(b)** | Payment Confirmation | `urn:eudi:sca:payment:1` | "Pay €150 to ACME Corp" |
| **Art. 97(1)(c)** | Login & Risk-based | `urn:eudi:sca:login_risk_transaction:1` | "Change daily limit to €5,000" |
| **(extension)** | E-mandate Setup | `urn:eudi:sca:emandate:1` | "Set up Direct Debit" |

```
┌-----------------------------------------------------------------------┐
│                    PSD2 SCA Trigger Decision Tree                     │
├-----------------------------------------------------------------------┤
│                                                                       │
│                        User Action                                    │
│                            │                                          │
│              ┌-------------┼-------------┐                            │
│              ▼             ▼             ▼                            │
│         Access         Payment        High-Risk                       │
│         Account          Init          Action                         │
│         Online                                                        │
│              │             │             │                            │
│              ▼             ▼             ▼                            │
│       Art. 97(1)(a)  Art. 97(1)(b)  Art. 97(1)(c)                     │
│              │             │             │                            │
│       ┌------┴------┐      │             │                            │
│       ▼             ▼      ▼             ▼                            │
│  login_risk    account_   payment:1   login_risk                      │
│  _transaction  access:1              _transaction                     │
│       :1                              :1                              │
│                                                                       │
│       ╔====================================================╗          │
│       ║  Check: Does an SCA Exemption Apply? (RTS Ch. III) ║          │
│       ╚====================================================╝          │
│                            │                                          │
│              ┌-------------┴-------------┐                            │
│              ▼                           ▼                            │
│          Yes: Skip SCA               No: Require SCA                  │
│          (PSP decision)              → Wallet SCA flow                │
│                                                                       │
└-----------------------------------------------------------------------┘
```

---

**Art. 97(1)(c) High-Risk Action Examples**

UK Finance and EBA guidance identify specific actions that trigger SCA under Article 97(1)(c):

| High-Risk Action | Description | TS12 Type |
|------------------|-------------|-----------|
| **Trusted beneficiary management** | Adding/modifying payees on whitelist | `login_risk_transaction:1` |
| **Standing order setup** | Creating recurring payment instructions | `emandate:1` |
| **E-mandate/Direct Debit** | Authorizing creditor to initiate debits | `emandate:1` |
| **PIN/password change** | Modifying PSC via remote channel | `login_risk_transaction:1` |
| **Transaction limit modification** | Changing daily/monthly spending limits | `login_risk_transaction:1` |
| **Address/contact change** | Updating personal details | `login_risk_transaction:1` |
| **Digital token provisioning** | Adding card to mobile wallet | `login_risk_transaction:1` |

---

**Responsibility Matrix: Who Does What**

| Responsibility | Party | Notes |
|---------------|-------|-------|
| **Determine when SCA is required** | PSP | Based on Art. 97(1) triggers |
| **Apply exemption (if eligible)** | PSP | Based on RTS Ch. III (Arts. 10-18) |
| **Send SCA request** | PSP/RP | Via OpenID4VP with `transaction_data` |
| **Display transaction details** | Wallet | Per TS12 §3.3.1 visualization levels |
| **Perform SCA elements (PIN/biometric)** | Wallet | Knowledge + Possession/Inherence |
| **Sign transaction hash** | Wallet | WSCA-protected key signs KB-JWT |
| **Verify authentication code** | PSP | Validate VP Token + transaction_data_hashes |
| **Authorize transaction** | PSP | Based on successful verification |
| **Liability for unauthorized tx** | PSP | Per PSD2 Arts. 73-74 |

► **Key Insight**: While the **Wallet executes SCA**, the **PSP retains liability** and decides whether to require it. TS12 enables "Embedded SCA" where authentication happens in the Wallet, but liability cannot be delegated.

---

**SCA Exemptions Overview (RTS Chapter III)**

The PSP may choose **not** to trigger Wallet-based SCA if an exemption applies:

| RTS Article | Exemption Type | Threshold/Condition | Applies to TS12? |
|-------------|----------------|---------------------|------------------|
| **Art. 10** | Account info access | Balance/90-day history, every 90 days | ✅ `account_access:1` |
| **Art. 11** | Contactless payments | ≤ €50, max €150 or 5 tx cumulative | ❌ In-person only |
| **Art. 12** | Unattended terminals | Transport/parking | ❌ In-person only |
| **Art. 13** | Trusted beneficiaries | Payee on PSP-maintained whitelist | ✅ Skips `payment:1` |
| **Art. 14** | Recurring transactions | Same amount + same payee (after 1st) | ✅ MIT after `emandate:1` |
| **Art. 15** | Same-person transfers | Own accounts at same PSP | ✅ Skips `payment:1` |
| **Art. 16** | Low-value remote | ≤ €30, max €100 or 5 tx cumulative | ✅ PSP discretion |
| **Art. 17** | Secure corporate | Dedicated B2B protocols | ✅ Not consumer |
| **Art. 18** | Transaction Risk Analysis | Fraud rate thresholds (0.13%/0.06%/0.01%) | ✅ PSP discretion |

► **Note**: Even when an exemption is available, the **PSP may still choose to require SCA**. The issuer always has final authority.

---

**TRA Fraud Rate Thresholds (Art. 18)**

| Transaction Amount | Maximum Fraud Rate |
|--------------------|--------------------|
| ≤ €100 | 0.13% |
| ≤ €250 | 0.06% |
| ≤ €500 | 0.01% |

If the PSP's fraud rate exceeds these thresholds, TRA exemption cannot be applied.

---

**EUDI Wallet Flow: Who Triggers SCA**

```
┌------------------------------------------------------------------------┐
│                                                                        │
│  ┌----------┐         ┌----------┐         ┌----------┐                │
│  │  User    │         │  PSP/RP  │         │  Wallet  │                │
│  │          │         │ (Bank/   │         │ (EUDI)   │                │
│  │          │         │  TPP)    │         │          │                │
│  └----┬-----┘         └----┬-----┘         └----┬-----┘                │
│       │                    │                    │                      │
│       │ 1. Initiate action │                    │                      │
│       │ (login/payment)    │                    │                      │
│       │ -----------------► │                    │                      │
│       │                    │                    │                      │
│       │                    │ 2. PSP evaluates:  │                      │
│       │                    │    - Art. 97(1)    │                      │
│       │                    │      trigger?      │                      │
│       │                    │    - Exemption     │                      │
│       │                    │      applies?      │                      │
│       │                    │                    │                      │
│       │                    │ 3. If SCA needed:  │                      │
│       │                    │    OID4VP request  │                      │
│       │                    │ -----------------► │                      │
│       │                    │                    │                      │
│       │                    │                    │ 4. Wallet displays   │
│       │◄------------------------------------------  transaction        │
│       │                    │                    │                      │
│       │ 5. User confirms   │                    │                      │
│       │    (PIN/biometric) │                    │                      │
│       │ --------------------------------------► │                      │
│       │                    │                    │                      │
│       │                    │ 6. Wallet returns  │                      │
│       │                    │    VP Token +      │                      │
│       │                    │◄-------------------│ KB-JWT with          │
│       │                    │                    │ transaction_data     │
│       │                    │                    │ _hashes              │
│       │                    │                    │                      │
│       │                    │ 7. PSP verifies &  │                      │
│       │                    │    authorizes      │                      │
│       │                    │                    │                      │
└------------------------------------------------------------------------┘
```

---

**Gap Analysis: Missing Transaction Types**

| Gap | Description | Impact | Status |
|-----|-------------|--------|--------|
| **`urn:eudi:sca:consents:1`** | AISP consent capture | TPPs cannot perform Embedded SCA for PSD2 consent | ⚠️ Requested by ETPPA |
| **Card payment specifics** | EMV/3DS integration | Card-based flows may need additional schemas | 🔄 Monitored |
| **Bulk payments** | Batch authorization | Corporate use case not fully addressed | 🔄 Art. 17 exemption |

► ⚠️ **Gap Identified**: The [ETPPA](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439#discussioncomment-15045566) (European Third Party Provider Association) has requested a dedicated **`urn:eudi:sca:consents:1`** transaction type for AISP consent capture. This is **not yet in TS12 v1.0**. TPPs seeking to perform Embedded SCA for account information consent should monitor future TS12 versions.

---

**Reference Implementation Coverage**

| Trigger | TS12 Support | Reference |
|---------|--------------|-----------|
| **Art. 97(1)(a)** Access | ✅ | [SUA_01](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2313-topic-20---strong-user-authentication-for-electronic-payments) |
| **Art. 97(1)(b)** Payment | ✅ | [TS12 §4.3.1](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#431-payment-confirmation) |
| **Art. 97(1)(c)** High-risk | ✅ | [TS12 §4.3.2](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#432-login-and-risk-based-authentication) |


---

# 6. SCA Elements & Independence


## 6.1 Authentication Code Requirements

► **Regulatory Basis**:
► - [RTS Art. 4](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_4): Authentication code

#### [Article 4(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.001) — Two or more elements generating an authentication code

► "Where payment service providers apply strong customer authentication in accordance with Article 97(1) of Directive (EU) 2015/2366, the authentication shall be based on two or more elements which are categorised as knowledge, possession and inherence and shall result in the generation of an authentication code."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WIAM_14](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | WSCA/WSCD authenticates User (knowledge/inherence) before crypto ops |
| ✅ **Wallet** | [WUA_09](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a236-topic-9---wallet-unit-attestation) | Private key in WSCA/WSCD = possession element |
| ✅ **Wallet** | [SUA_05](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2313-topic-20---strong-user-authentication-for-electronic-payments) | Device binding signature = **authentication code** |
| ✅ **Wallet** | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) | `amr` array reports authentication factors used |

**Status**: ✅ Fully Supported

**Context**: 

**Authentication Elements**:
- **Knowledge**: User PIN or passphrase (validated by WSCA/WSCD before crypto operation)
- **Possession**: Private key stored in WSCA/WSCD (Secure Enclave / StrongBox)
- **Inherence**: Biometric (Face ID / fingerprint), delegated to OS biometric API

**Authentication Code**:
Per RTS Recital (4), authentication codes should be based on "digital signatures or other cryptographically underpinned validity assertions". The **complete VP Token** (SD-JWT with KB-JWT signature) or **mDOC DeviceResponse** constitutes the authentication code. The KB-JWT signature is generated using the SCA attestation private key in the WSCA/WSCD.

**Factor Reporting** ([TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response)):
```json
"amr": ["face", "hwk"]  // Face ID + hardware key = inherence + possession
"amr": ["pin", "hwk"]   // PIN + hardware key = knowledge + possession
```

**Reference Implementation Evidence**:
| Platform | Source File |
|----------|-------------|
| iOS | [`SystemBiometryController.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-authentication/Sources/Controller/SystemBiometryController.swift#L97-L126) (lines 97-126) |
| Android | [`BiometricsAvailability.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/authentication-logic/src/main/java/eu/europa/ec/authenticationlogic/controller/authentication/BiometricsAvailability.kt#L36-L58) (lines 36-58) |

► ⚠️ **Format Note**: The `amr` claim is **SD-JWT-VC only** (via KB-JWT). TS12 v1.0 does not specify an equivalent mechanism for **mDOC (ISO 18013-5)**. PSPs requiring mDOC support should monitor TS12 updates.

---

#### Article 4(1) continued — One-time use

► **Note**: This is the second paragraph of Article 4(1), not a separate paragraph.

► "The authentication code shall be only accepted once by the payment service provider when the payer uses the authentication code to access its payment account online, to initiate an electronic payment transaction or to carry out any action through a remote channel which may imply a risk of payment fraud or other abuses."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) | Fresh `nonce` + `jti` + `iat` in each response |
| ⚠️ **PSP** | — | PSP must track accepted codes and reject replays |

**Status**: ⚠️ Shared Responsibility

**Context**: The Wallet generates a cryptographically unique response for each presentation:
- `nonce`: Echoed from PSP's request (binds to session)
- `jti`: Unique JWT ID per response
- `iat`: Issuance timestamp

**Authentication Code Interpretation**:

[TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) states the `jti` "serves as the Authentication Code". However, RTS Recital (4) defines authentication codes as "digital signatures or other cryptographically underpinned validity assertions":

| Interpretation | What Constitutes Auth Code | Recommended Use |
|---------------|---------------------------|-----------------|
| **Narrow (TS12)** | `jti` claim alone | Replay prevention tracking |
| **Broad (RTS-aligned)** | Complete VP Token (SD-JWT + KB-JWT signature) | Regulatory compliance evidence |

**Conclusion**: For compliance purposes, the **complete signed VP Token** satisfies the RTS "digital signature" definition. The `jti` provides the unique tracking ID within that signature.

**PSP MUST**:
1. Verify `nonce` matches the original request
2. Track accepted `jti` values (or response hashes) to prevent replay
3. Validate `iat` is within acceptable time window

**Reference Implementation**:
- iOS: [`PresentationInteractor.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/feature-presentation/Sources/Interactor/PresentationInteractor.swift#L135-L150) (lines 135-150) — onSendResponse VP Token assembly
- Android: [`PresentationControllerInteractor.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/common-feature/src/main/java/eu/europa/ec/commonfeature/interactor/PresentationControllerInteractor.kt#L98-L126) (lines 98-126) — sendResponse VP Token generation

► ⚠️ **Format Note**: The `jti`, `nonce`, and `iat` claims are in the **KB-JWT (SD-JWT-VC only)**. For **mDOC**, the DeviceResponse signature provides cryptographic uniqueness, but TS12 v1.0 does not specify mDOC-specific claim equivalents.

---

#### [Article 4(2)(a)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.002) — Factor derivation protection

► "For the purpose of paragraph 1, payment service providers shall adopt security measures ensuring that each of the following requirements is met: (a) no information on any of the elements referred to in paragraph 1 can be derived from the disclosure of the authentication code;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WIAM_20](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Private key never leaves WSCA/WSCD |
| ✅ **Wallet** | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) | Only `amr` (factor names) disclosed, not factor values |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: Factor Derivation Protection</strong></summary>

##### Core Requirement: Zero Information Leakage

Article 4(2)(a) mandates that an attacker who obtains the authentication code must NOT be able to derive ANY information about the authentication elements (PIN, biometric, private key).

```
┌-----------------------------------------------------------------------------┐
│                    Factor Derivation Protection Architecture                │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  SCA ELEMENTS (NEVER DISCLOSED)                AUTHENTICATION CODE          │
│  ---------------------------------            -----------------------       │
│                                                                             │
│  ┌-------------┐                              ┌---------------------┐       │
│  │   PIN       │   =======╲                   │   VP Token          │       │
│  │  "1234"     │           ╲                  │   ┌---------------┐ │       │
│  └-------------┘            ╲                 │   │ SD-JWT-VC     │ │       │
│                              ╲                │   │ (credentials) │ │       │
│  ┌-------------┐              ==►  WSCD  ==►  │   ├---------------┤ │       │
│  │  BIOMETRIC  │              ==► SIGNS  ==►  │   │ KB-JWT        │ │       │
│  │  Template   │             ╱                │   │ (auth proof)  │ │       │
│  └-------------┘            ╱                 │   │ - amr: [...]  │ │       │
│                            ╱                  │   │ - signature   │ │       │
│  ┌-------------┐         ╱                    │   └---------------┘ │       │
│  │ PRIVATE KEY │=========                     └---------------------┘       │
│  │  (in WSCD)  │                                                            │
│  └-------------┘                                                            │
│                                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                             │
│  ❌ PIN value: NEVER in auth code                                            │
│  ❌ Biometric template: NEVER in auth code                                   │
│  ❌ Private key: NEVER in auth code (only public key in attestation)         │
│  ✅ Only: Factor NAMES (amr), signatures, hashes                             │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### What is Disclosed vs. Protected

| Information Type | Disclosed in Auth Code? | Protection Mechanism |
|------------------|------------------------|---------------------|
| **PIN value** | ❌ Never | Not included in any claim; validated locally by WSCD |
| **PIN hash** | ❌ Never | Not included; WSCD compares internally |
| **Biometric template** | ❌ Never | Stored in OS Secure Enclave; wallet has no access |
| **Biometric match score** | ❌ Never | OS returns boolean only |
| **Private key** | ❌ Never | Non-extractable from WSCD (WIAM_20) |
| **Public key** | ✅ Yes (in SCA Attestation) | Intended for signature verification |
| **Factor names (`amr`)** | ✅ Yes (e.g., "pin", "face") | Names only; reveals which method, not the secret |
| **Signature** | ✅ Yes (KB-JWT signature) | Proves possession, doesn't reveal key |
| **Transaction hash** | ✅ Yes (`transaction_data_hashes`) | Hash of what user authorized |

##### SD-JWT Selective Disclosure Alignment

SD-JWT-VC (Selective Disclosure JWT) ensures **minimum disclosure**:

| SD-JWT Feature | PSD2 Art. 4(2)(a) Relevance |
|----------------|---------------------------|
| **Holder-controlled disclosure** | Only consented attributes included |
| **Hash-based placeholders** | Undisclosed claims replaced with hashes |
| **Issuer signature integrity** | Signature covers all (including non-disclosed) |
| **KB-JWT binding** | Proves holder controls the key, doesn't reveal key |

The authentication code (VP Token) contains:
1. **SD-JWT-VC**: The SCA Attestation with disclosed claims (SCA Level, user binding)
2. **KB-JWT**: Proof of key possession + authentication method (`amr`) + transaction binding

Neither contains the actual authentication element values.

##### Cryptographic Analysis: Why No Derivation is Possible

| Attack Vector | Why It Fails |
|---------------|-------------|
| **Derive PIN from signature** | ECDSA signatures don't encode input; only prove key possession |
| **Derive biometric from amr** | `amr: ["face"]` is a label, not the biometric template |
| **Derive private key from public key** | Elliptic curve discrete logarithm problem (computationally infeasible) |
| **Derive PIN from multiple signatures** | Each signature uses random nonce; no correlation possible |
| **Brute-force PIN from locked device** | Device lockout after 5 attempts (Art. 4(3)(b)) |

##### The `amr` Claim: What It Reveals

The `amr` (Authentication Methods References) claim in KB-JWT is the **only element-related information** disclosed:

| Disclosed `amr` Value | What It Reveals | What It Does NOT Reveal |
|----------------------|-----------------|------------------------|
| `"pin"` | User entered a PIN | The PIN value |
| `"face"` | User used face recognition | The face template |
| `"fpt"` | User used fingerprint | The fingerprint minutiae |
| `"hwk"` | Hardware key was used | The private key material |

► **Privacy Consideration**: The `amr` claim reveals which authentication method was used. This is intentional — PSPs need to know that valid SCA elements were used. However, it could be considered a minor privacy leakage (e.g., revealing that user has Face ID capability).

##### Threat Model: Derivation Attacks

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|--------|
| **PIN inference from timing** | Side-channel on PIN entry | OS secure keyboard, constant-time comparison in WSCD | ✅ Mitigated |
| **Biometric inference from failure rate** | Multiple attempts reveal FAR | Generic failure message, lockout | ✅ Mitigated |
| **Key inference from signatures** | Collect many signatures, cryptanalyze | ECDSA with random k; hardware RNG | ✅ Mitigated |
| **Correlation attack** | Link different sessions via amr | `amr` is categorical; no unique identifier | ✅ Mitigated |
| **Template reconstruction** | Infer biometric from accept/reject | OS returns boolean only; no detailed feedback | ✅ Mitigated |

##### Reference Implementation Evidence

| Platform | Protection Mechanism | Source |
|----------|---------------------|--------|
| **iOS** | PIN validation | [`KeychainPinStorageProvider.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-authentication/Sources/Storage/KeychainPinStorageProvider.swift) — Keychain-backed comparison |
| **iOS** | Key operations | Secure Enclave (via wallet-core SDK) — key never exported |
| **Android** | PIN validation | [`CryptoController.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/business-logic/src/main/java/eu/europa/ec/businesslogic/controller/crypto/CryptoController.kt#L99-L121) (L99-121) — AES-GCM with Keystore key |
| **Android** | Key operations | StrongBox/TEE (via wallet-core SDK) — key never in app memory |
| **Both** | `amr` claim | Contains method names only (no factor values) — [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) |


##### Gap Analysis: Factor Derivation Protection

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **FD-1** | `amr` reveals authentication method type | Low | By design; PSP needs this. Document as acceptable disclosure |
| **FD-2** | WUA device properties could fingerprint user | Low | Minimize device-specific claims; use categorical values |
| **FD-3** | No formal proof of zero-knowledge property | Low | Consider ZKP-based authentication for future versions |

##### Recommendations for SCA Attestation Rulebook

1. **Document Non-Derivation**: Explicitly state that PIN, biometric templates, and private keys are NEVER included in any claim
2. **amr Vocabulary**: Define allowed `amr` values and confirm they reveal method type only
3. **WSCD Isolation**: Reference WIAM_20 as the mechanism ensuring private key non-extractability
4. **Audit Evidence**: PSPs can cite VP Token structure as evidence that no element values are disclosed

</details>

**Context**: The VP Token reveals:
- Factor names in `amr` (e.g., "pin", "face", "hwk") — **not** the PIN value or biometric template
- Public key in the SCA attestation — **not** the private key
- Signature over transaction data — **not** the key material

The WSCA/WSCD (Secure Enclave / TEE) ensures private keys are non-extractable (WIAM_20).

---

#### [Article 4(2)(b)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.002) — No code re-generation

► "(b) it is not possible to generate a new authentication code based on the knowledge of any other authentication code previously generated;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) | Each KB-JWT has unique `jti`, fresh signature |
| ✅ **Wallet** | Cryptographic design | ECDSA signature is non-deterministic (contains random nonce) |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: Code Re-generation Prevention</strong></summary>

##### Core Requirement: Cryptographic Unpredictability

Article 4(2)(b) mandates that knowing previous authentication codes provides **zero advantage** for generating new ones. This is achieved through multiple layers of cryptographic unpredictability:

```
┌-----------------------------------------------------------------------------┐
│                    Authentication Code Unpredictability                     │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │                     VP Token (Auth Code)                             │   │
│  ├---------------------------------------------------------------------┤    │
│  │                                                                     │    │
│  │   ┌---------------------┐   ┌---------------------┐                │     │
│  │   │   KB-JWT Header     │   │   KB-JWT Payload    │                │     │
│  │   └---------------------┘   │                     │                │     │
│  │                             │  jti: "a7f2c9..."   │◄-- UNIQUE      │     │
│  │                             │  iat: 1706xxx       │◄-- TIMESTAMPED │     │
│  │                             │  nonce: "xyz..."    │◄-- RP-PROVIDED │     │
│  │                             └---------------------┘                │     │
│  │                                                                     │    │
│  │   ┌-------------------------------------------------------------┐  │     │
│  │   │                    ECDSA Signature                          │  │     │
│  │   │   (r, s) = Sign(privateKey, message, randomNonce_k)        │  │      │
│  │   │                                                             │  │     │
│  │   │   k = cryptographically random ◄-- DIFFERENT EVERY TIME    │  │      │
│  │   │   Even same message → different (r, s) each signature      │  │      │
│  │   └-------------------------------------------------------------┘  │     │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                             │
│  Knowing previous (jti, nonce, iat, signature) reveals NOTHING about:       │
│  • Next jti (random UUID)                                                   │
│  • Next signature (random k in ECDSA)                                       │
│  • Private key (ECDLP hard problem)                                         │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Unpredictability Mechanisms

| Mechanism | Location | Entropy Source | Uniqueness Guarantee |
|-----------|----------|----------------|---------------------|
| **`jti` claim** | KB-JWT payload | UUID v4 (122 bits entropy) | Cryptographically random |
| **`nonce`** | KB-JWT payload | RP-provided challenge | Fresh per request |
| **`iat`** | KB-JWT payload | System clock | Monotonically increasing |
| **ECDSA k-value** | Signature | Hardware RNG (SE/StrongBox) | Random per signature |
| **Transaction hash** | `transaction_data_hashes` | SHA-256 of transaction | Unique per transaction |

##### ECDSA Non-Deterministic Signature Analysis

ECDSA signatures include a random nonce `k`:

```
Signature(m) = (r, s) where:
  - k ← random from [1, n-1]
  - r = (k × G).x mod n
  - s = k⁻¹ × (H(m) + r × privateKey) mod n
```

| Property | Implication for Art. 4(2)(b) |
|----------|------------------------------|
| **Different k each time** | Same message, same key → different signature |
| **k is secret** | Even with (r, s), cannot determine k without breaking ECDLP |
| **k from hardware RNG** | iOS/Android SE uses certified TRNG |
| **k never reused** | Reuse would leak private key — hardware prevents this |

► **Critical Security Note**: If `k` is ever reused or predictable, the private key can be extracted (Sony PlayStation 3 hack, 2010). iOS Secure Enclave and Android StrongBox hardware ensure k is always freshly random.

##### JWT ID (`jti`) Uniqueness

The `jti` claim provides **token-level uniqueness**:

| `jti` Property | Value | Security Implication |
|----------------|-------|---------------------|
| **Format** | UUID v4 | 122 bits of randomness |
| **Collision probability** | 2⁻¹²² | Negligible (heat death of universe) |
| **Generated by** | Wallet (WSCA) | Not predictable by RP |
| **Used for** | Replay detection | PSP can reject same `jti` twice |

##### Replay Prevention Architecture

```
┌-----------------------------------------------------------------------------┐
│                       Replay Attack Prevention                              │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  Attacker captures:     VP Token₁ (jti="abc123", nonce="xyz", sig₁)         │
│                                                                             │
│  Replay attempt 1: Use same VP Token₁ again                                 │
│  ----------------------------------------                                   │
│  → PSP checks: Is jti="abc123" in used-jti database?                        │
│  → YES → REJECT (jti already used)                                          │
│                                                                             │
│  Replay attempt 2: Use VP Token₁ for different transaction                  │
│  ----------------------------------------------------                       │
│  → PSP checks: Does transaction_data_hash match current transaction?        │
│  → NO → REJECT (hash mismatch)                                              │
│                                                                             │
│  Replay attempt 3: Modify jti/nonce and re-sign                             │
│  ------------------------------------------------                           │
│  → Attacker needs private key to create valid signature                     │
│  → Private key is non-extractable from WSCD                                 │
│  → IMPOSSIBLE                                                               │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Why Prior Codes Don't Help

| What Attacker Learns from Previous Code | Why It Doesn't Help |
|----------------------------------------|---------------------|
| Previous `jti` values | Next `jti` is random UUID — no sequence |
| Previous signatures (r, s) | Next k is random — no pattern |
| Public key | Cannot derive private key (ECDLP) |
| Message structure | Structure is known anyway; signature is the barrier |
| Timing patterns | `iat` is clock-based; doesn't reveal signing secrets |

##### Deterministic Nonces (RFC 6979) Consideration

Some implementations use **deterministic nonces** (RFC 6979) to avoid RNG failures:

| Approach | Pros | Cons | EUDI Wallet Status |
|----------|------|------|-------------------|
| **Random k** | Standard, simple | Requires good RNG | ✅ Used (hardware RNG) |
| **Deterministic k (RFC 6979)** | No RNG dependency | Same message → same sig (linkability) | ❌ Not used |

EUDI Wallet uses **random k** from hardware RNG (SE/StrongBox), which is the preferred approach for privacy (each signature is unique even for same message).

##### Threat Model: Re-generation Attacks

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|--------|
| **Signature pattern analysis** | Collect many signatures, find pattern | Random k from hardware RNG | ✅ Mitigated |
| **jti prediction** | Guess next jti | UUID v4 has 122 bits entropy | ✅ Mitigated |
| **Nonce replay** | Reuse RP-provided nonce | PSP provides fresh nonce per request | ✅ Mitigated |
| **Time-based prediction** | Predict iat to forge timestamp | iat alone is not sufficient for validity | ✅ Mitigated |
| **Private key extraction** | Side-channel on SE/StrongBox | Certified hardware, constant-time operations | ✅ Mitigated |

##### Reference Implementation Evidence

| Platform | Mechanism | Source |
|----------|-----------|--------|
| **iOS** | UUID generation | System `UUID()` — crypto-secure |
| **iOS** | Secure random | Secure Enclave hardware RNG (via wallet-core SDK) |
| **Android** | Code verifier | [`CryptoController.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/business-logic/src/main/java/eu/europa/ec/businesslogic/controller/crypto/CryptoController.kt#L91-L97) (L91-97) — `SecureRandom.nextBytes()` |
| **Android** | Signature nonce | Hardware Keystore RNG (via wallet-core SDK) |
| **Both** | RP nonce | `nonce` claim bound from authorization request |


##### Gap Analysis: Code Re-generation Prevention

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **CR-1** | No explicit jti registry requirement in TS12 | Medium | PSPs should maintain jti cache with TTL equal to token validity |
| **CR-2** | RFC 6979 not mandated (good, but worth documenting) | Low | Document that random k is preferred for privacy |
| **CR-3** | mDOC equivalent of jti not specified | Low | mDOC DeviceResponse has session-bound nonce; document equivalence |

##### Recommendations for SCA Attestation Rulebook

1. **jti Registry**: Mandate PSPs maintain a short-lived cache of used `jti` values to detect replay
2. **Hardware RNG**: Require hardware-backed random nonce generation for ECDSA signatures
3. **Nonce Freshness**: Specify that RP-provided `nonce` must be cryptographically random and single-use
4. **mDOC Equivalence**: Document that mDOC DeviceResponse provides equivalent replay protection

</details>

**Context**: Even with knowledge of a previous VP Token:
- The `jti` is fresh (cryptographically random)
- The ECDSA signature contains a random nonce (k value)
- Without the private key, forging a new valid signature is computationally infeasible

---

#### [Article 4(2)(c)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.002) — Forgery resistance

► "(c) the authentication code cannot be forged."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WUA_12](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a236-topic-9---wallet-unit-attestation) | WU can prove possession of private key |
| ✅ **Wallet** | WSCA/WSCD security | Secure Enclave / StrongBox provides hardware protection |
| ✅ **Wallet** | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) | PSP verifies signature against trusted attestation public key |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: Forgery Resistance</strong></summary>

##### Core Requirement: Computational Infeasibility of Forgery

Article 4(2)(c) requires that authentication codes **cannot be forged**. In cryptographic terms, this means creating a valid authentication code without the private key must be computationally infeasible.

```
┌-----------------------------------------------------------------------------┐
│                         Forgery Resistance Architecture                     │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌-----------------------------------------------------------------------┐  │
│  │                         TRUST CHAIN                                   │  │
│  │                                                                       │  │
│  │   ┌--------------┐     ┌--------------┐     ┌--------------┐          │  │
│  │   │ Trust Anchor │     │     PSP      │     │ SCA          │          │  │
│  │   │ (Root CA)    │ --► │ Issuer Key   │ --► │ Attestation  │          │  │
│  │   │ (EUTL/PSP)   │     │              │     │ (SD-JWT-VC)  │          │  │
│  │   └--------------┘     └--------------┘     └------┬-------┘          │  │
│  │                                                    │                  │  │
│  │                                                    ▼                  │  │
│  │                                            ┌--------------┐           │  │
│  │                                            │ Public Key   │           │  │
│  │                                            │ (in cnf/jwk) │           │  │
│  │                                            └------┬-------┘           │  │
│  │                                                   │                   │  │
│  └---------------------------------------------------┼-------------------┘  │
│                                                      │                      │
│                                                      ▼                      │
│  ┌-----------------------------------------------------------------------┐  │
│  │                      SIGNATURE VERIFICATION                           │  │
│  │                                                                       │  │
│  │   KB-JWT Signature ◄-- Created by private key in WSCD                 │  │
│  │         │                                                             │  │
│  │         ▼                                                             │  │
│  │   PSP Verifies: signature matches public key in trusted attestation   │  │
│  │         │                                                             │  │
│  │         ▼                                                             │  │
│  │   FORGERY ATTEMPT: Create valid signature without private key         │  │
│  │         │                                                             │  │
│  │         ▼                                                             │  │
│  │   ❌ IMPOSSIBLE: ECDLP is computationally infeasible                  │  │
│  │                                                                       │  │
│  └-----------------------------------------------------------------------┘  │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Trust Chain Components

| Component | Role | Trust Verification |
|-----------|------|-------------------|
| **Trust Anchor** | Root of trust | EUTL (EU Trust List) or PSP-specific CA |
| **PSP Issuer Key** | Signs SCA Attestations | Certificate chain verified to trust anchor |
| **SCA Attestation** | Binds public key to user | Signed by PSP, contains `cnf` with public key |
| **KB-JWT** | Proves key possession | Signed by user's private key |

##### Why Forgery is Computationally Infeasible

The security rests on the **Elliptic Curve Discrete Logarithm Problem (ECDLP)**:

| Mathematical Basis | Explanation |
|-------------------|-------------|
| **Public key** | Q = d × G (where d is private key, G is generator point) |
| **ECDLP hardness** | Given Q and G, finding d is computationally infeasible |
| **Signature creation** | Requires knowledge of d |
| **Best known algorithm** | Pollard's rho: O(√n) operations |
| **P-256 security level** | ~2¹²⁸ operations (128-bit security) |

► **Practical Interpretation**: Breaking P-256 ECDSA would require more energy than exists in the solar system. This is not a future concern.

##### Multi-Layer Verification Flow

```
┌-----------------------------------------------------------------------------┐
│                     PSP Verification of VP Token                            │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  Step 1: Verify SCA Attestation                                             │
│  ---------------------------------                                          │
│  • Check issuer signature (PSP's own key)                                   │
│  • Verify certificate chain to trust anchor                                 │
│  • Check attestation not expired/revoked                                    │
│                                                                             │
│  Step 2: Extract Public Key                                                 │
│  ----------------------------                                               │
│  • From SCA Attestation `cnf.jwk` claim                                     │
│  • This is the key the user claims to possess                               │
│                                                                             │
│  Step 3: Verify KB-JWT Signature                                            │
│  -------------------------------                                            │
│  • Verify KB-JWT signature against extracted public key                     │
│  • If valid: User possesses the corresponding private key                   │
│  • If invalid: REJECT (forgery attempt or corruption)                       │
│                                                                             │
│  Step 4: Verify Dynamic Linking                                             │
│  -------------------------------                                            │
│  • Check `transaction_data_hashes` matches current transaction              │
│  • If mismatch: REJECT (replay or tampering)                                │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Hardware Security Protection

The private key is protected by hardware security modules:

| Platform | Hardware Component | Protection Level | Certification |
|----------|-------------------|------------------|---------------|
| **iOS** | Secure Enclave | Key never leaves SE | FIPS 140-2/3 |
| **Android** | StrongBox | Tamper-resistant | CC EAL4+ |
| **Android** | TEE (fallback) | OS isolation | GlobalPlatform |

These hardware components ensure:
- **Non-extractability**: Private key cannot be read, only used for signing
- **Tamper resistance**: Physical attacks are detected and mitigated
- **Side-channel protection**: Power analysis, timing attacks mitigated

##### Forgery Attack Scenarios

| Attack Vector | Why It Fails | Protection |
|---------------|-------------|------------|
| **Guess signature** | 2²⁵⁶ possible signatures | Cryptographic impossibility |
| **Brute-force private key** | 2¹²⁸ operations for P-256 | Computational infeasibility |
| **Extract key from WSCD** | Hardware tamper protection | Secure Enclave/StrongBox |
| **Side-channel attack** | Constant-time operations | Certified hardware |
| **Forge SCA Attestation** | Need PSP issuer key | HSM-protected at PSP |
| **Replay old signature** | jti uniqueness, nonce binding | Replay detection |
| **Man-in-the-middle** | TLS + certificate pinning | Transport security |

##### Key Binding Verification

The `cnf` (confirmation) claim in the SCA Attestation binds the key:

```json
{
  "cnf": {
    "jwk": {
      "kty": "EC",
      "crv": "P-256",
      "x": "base64url-encoded-x-coordinate",
      "y": "base64url-encoded-y-coordinate"
    }
  }
}
```

This public key is trusted because:
1. It's inside an attestation signed by the PSP
2. The PSP issued it after wallet activation (identity-linked)
3. The corresponding private key is in the user's WSCD

##### PSP Verification Procedure (RP-side)

► **Note**: These are PSP/RP-side operations, not wallet reference implementation code. The wallet produces the signed VP Token; the PSP verifies it.

| Verification Step | Platform APIs | Purpose |
|-------------------|---------------|---------|
| **Attestation verification** | iOS: `SecTrustEvaluateWithError`, Android: `TrustManagerFactory` | Validate SCA Attestation from PSP |
| **Signature verification** | iOS: `SecKeyVerifySignature`, Android: `Signature.verify()` | Verify KB-JWT signature |
| **Key extraction** | JSON parsing of `cnf.jwk` | Extract public key for verification |
| **Certificate chain** | Standard X.509 chain validation | Verify attestation issuer trust |


##### Threat Model: Forgery Attacks

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|--------|
| **Quantum computing** | Shor's algorithm breaks ECDLP | Post-quantum migration path needed | ⚠️ Future risk |
| **Weak RNG** | Predictable k in ECDSA | Hardware RNG (certified) | ✅ Mitigated |
| **Implementation bugs** | Faulty verification logic | Standard libraries, audits | ✅ Mitigated |
| **PSP key compromise** | Attacker can issue fake attestations | HSM protection, key rotation | ✅ Mitigated |
| **Device compromise** | Rooted device exposes key | Key in SE survives; WUA fails | ⚠️ Partial |

##### Gap Analysis: Forgery Resistance

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **FR-1** | Post-quantum transition not specified | Medium | Document migration path to PQC algorithms (ML-DSA) |
| **FR-2** | HSM requirement for PSP issuer key not explicit | Low | TS12 should mandate HSM for SCA Attestation signing |
| **FR-3** | Certificate revocation checking not specified | Medium | Mandate OCSP or CRL checking for SCA Attestation issuer |

##### Recommendations for SCA Attestation Rulebook

1. **Algorithm Mandate**: Require P-256 or P-384 ECDSA minimum; document PQC transition timeline
2. **HSM for Issuers**: Mandate PSP use HSM (FIPS 140-2 Level 3+) for SCA Attestation signing keys
3. **Revocation Checking**: Require OCSP stapling or CRL for SCA Attestation chains
4. **Key Rotation Policy**: Specify maximum lifetime for PSP issuer keys
5. **Verification Guidance**: Provide reference code for PSP signature verification

</details>

**Context**: Forgery prevention relies on:
1. **Attestation verification**: PSP verifies the SCA attestation was issued by a trusted PSP (itself) and is valid
2. **Key binding verification**: The KB-JWT signature is verified against the public key in the attestation
3. **Hardware protection**: WSCA/WSCD prevents key extraction

---

#### [Article 4(3)(a)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.003) — Non-disclosure of incorrect element

► "Payment service providers shall have measures in place ensuring that: (a) where any of the elements referred to in paragraph 1 have failed, it shall not be possible to identify which of those elements was incorrect;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **OS (Biometric)** | iOS/Android APIs | OS biometric APIs return generic "failed" — not which factor failed |
| ⚠️ **Wallet (PIN)** | See below | iOS reference implementation reveals PIN-specific errors |
| ⚠️ **PSP** | — | PSP must also not disclose element in error responses |

**Status**: ❌ **Compliance Gap** (Both Platforms)

**Context**: 
- **Biometric (compliant)**: OS APIs (`LAContext`, `BiometricPrompt`) return generic failure — cannot distinguish "wrong finger" from "sensor error"
- **PIN (GAP)**: Both reference implementations reveal PIN-specific error messages
- **PSP side**: If signature verification fails, PSP should return generic error — not specify which check failed

**Reference Implementation Evidence**:

| Platform | Source File | User-Visible Message | Compliance |
|----------|-------------|---------------------|------------|
| **iOS** | [`Localizable.xcstrings`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-resources/Sources/Resources/Localizable.xcstrings) | **"Pins do not match"** | ❌ Gap |
| **Android** | [`strings.xml`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/resources-logic/src/main/res/values/strings.xml) | **"Pins do not match"** | ❌ Gap |

**Localization Keys**:
- iOS: `quick_pin_dont_match` → `"Pins do not match"`
- Android: `quick_pin_non_match` → `"Pins do not match"`

**iOS Code Evidence** (commit `055bdda8`):
```swift
// When PINs don't match during confirmation:
guard previousPin == uiPinInputField else {
  setState {
    $0.copy(pinError: .quickPinDoNotMatch)  // → "Pins do not match"
  }
  return
}
```

► ❌ **Finding**: Both iOS and Android reference implementations display **"Pins do not match"** — this explicitly reveals that the **PIN** (knowledge element) was incorrect, violating Article 4(3)(a).

---

**Remediation Guidance**

For PSD2-compliant wallet deployments, implementations MUST NOT reveal which authentication element failed. The following changes are required:

| Platform | Current (Non-Compliant) | Required (Compliant) |
|----------|-------------------------|---------------------|
| **iOS** | `"Pins do not match"` | `"Authentication failed"` |
| **Android** | `"Pins do not match"` | `"Authentication failed"` |
| **Biometric** | (OS handles — already compliant) | — |

**Compliant Error Messages** (examples):
- ✅ `"Authentication failed"`
- ✅ `"Unable to verify your identity"`
- ✅ `"Please try again"`
- ❌ ~~`"Incorrect PIN"`~~
- ❌ ~~`"Pins do not match"`~~
- ❌ ~~`"Biometric not recognized"`~~ (if wallet-level)

**Code Changes Required**:

| Platform | File | Key | Change |
|----------|------|-----|--------|
| iOS | `Localizable.xcstrings` | `quick_pin_dont_match` | Replace with generic message |
| Android | `strings.xml` | `quick_pin_non_match` | Replace with generic message |

**Rationale**: Article 4(3)(a) exists to prevent attackers from learning which authentication factor they need to compromise. If a system reveals "PIN incorrect", an attacker who has already cloned the device (possession) now knows they only need to brute-force the PIN. Generic messages provide no such guidance.

► ℹ️ **Note**: There is no explicit ARF HLR requiring generic failure messages. OS biometric APIs are compliant by design, but wallet-level PIN validation must also implement this pattern. This gap should be addressed in wallet implementations intended for PSD2-regulated payment use cases.

---

#### [Article 4(3)(b)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.003) — Maximum attempts and lockout

► "(b) the number of failed authentication attempts that can take place consecutively, after which the actions referred to in Article 97(1) of Directive (EU) 2015/2366 shall be temporarily or permanently blocked, shall not exceed five within a given period of time;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet/OS** | iOS/Android | OS biometric lockout after 5 failed attempts |
| ❌ **Wallet** | — | **PIN lockout NOT implemented** (see evidence below) |
| 🔶 **Rulebook** | — | SCA Attestation Rulebook may specify constraints |
| ❌ **PSP** | — | PSP must implement server-side lockout |

**Status**: ❌ **Gap Identified** — PIN lockout not implemented in reference implementation

**Context**: Art. 4(3)(b) applies to **all PSC types** (PIN, biometric, private key). Current status:

| PSC Type | Max Attempts | Lockout Behavior | Compliance |
|----------|-------------|------------------|------------|
| **Biometric** | 5 | OS-enforced (falls back to device PIN) | ✅ Compliant |
| **Wallet PIN** | **Unlimited** | **None** | ❌ **Non-compliant** |
| **Device PIN** | Varies by OEM (typically 5-10) | Device wipe after max | ✅ Compliant |

**Reference Implementation Evidence**:

**Android** — `QuickPinInteractor.kt` (lines 92-109):
```kotlin
override fun isCurrentPinValid(pin: String): Flow<QuickPinInteractorPinValidPartialState> =
    flow {
        if (pinStorageController.isPinValid(pin)) {
            emit(QuickPinInteractorPinValidPartialState.Success)
        } else {
            emit(
                QuickPinInteractorPinValidPartialState.Failed(
                    resourceProvider.getString(R.string.quick_pin_invalid_error)
                )
            )
        }
    }
// ⚠️ NO attempt counting, NO lockout state, NO time-based blocking
```

**iOS** — `QuickPinInteractor.swift` (lines 42-47):
```swift
public func isPinValid(pin: String) -► QuickPinPartialState {
    if self.isCurrentPinValid(pin: pin) {
        return .success
    } else {
        return .failure(AuthenticationError.quickPinInvalid)
    }
}
// ⚠️ NO attempt counting, NO lockout mechanism
```

**ARF HLR Gap**: No explicit ARF HLR mandates PIN lockout. However:
- **WIAM_17** references CIR 2015/1502 section 2.2.1 for LoA High compliance
- **CIR 2015/1502 §2.3.1** requires protection against "guessing" attacks with "high attack potential"
- **ARF Annex 5.02** Design Guide mentions "e.g., 3 failed attempts" as example lockout behavior

**Remediation Required**:

```kotlin
// Required implementation pattern:
class PinLockoutController {
    companion object {
        const val MAX_FAILED_ATTEMPTS = 5
        const val LOCKOUT_DURATION_MS = 120_000L  // 2 minutes
    }
    
    private var failedAttempts = 0
    private var lockoutUntil: Long = 0
    
    fun validatePin(pin: String): PinValidationResult {
        if (System.currentTimeMillis() < lockoutUntil) {
            return PinValidationResult.Locked(
                remainingMs = lockoutUntil - System.currentTimeMillis()
            )
        }
        
        if (!pinStorageController.isPinValid(pin)) {
            failedAttempts++
            if (failedAttempts ►= MAX_FAILED_ATTEMPTS) {
                lockoutUntil = System.currentTimeMillis() + LOCKOUT_DURATION_MS
                failedAttempts = 0
                return PinValidationResult.Locked(remainingMs = LOCKOUT_DURATION_MS)
            }
            return PinValidationResult.Failed(attemptsRemaining = MAX_FAILED_ATTEMPTS - failedAttempts)
        }
        
        failedAttempts = 0
        return PinValidationResult.Success
    }
}
```

► ⚠️ **Critical**: This gap affects **both** SCA (payment authentication) **and** PID (identification) use cases. The wallet PIN is a PSC under PSD2 Art. 4(31) and must be protected against brute-force attacks per Art. 4(3)(b) and CIR 2015/1502.



---

#### [Article 4(3)(c)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.003) — Session protection

► "(c) the communication sessions are protected against the capture of authentication data transmitted during the authentication and against manipulation by unauthorised parties in accordance with the requirements in Chapter V;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [OID4VP](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html), [HAIP](https://openid.net/specs/openid4vc-high-assurance-interoperability-profile-1_0.html) | OID4VP uses TLS 1.2+ for all communications |
| ✅ **Wallet** | [TS12 §3.5](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#35-presentation-request-encryption) | Encrypted presentation requests supported (JAR) |
| ⚠️ **PSP** | — | PSP must enforce TLS, certificate pinning as appropriate |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: Session Protection</strong></summary>

##### Core Requirement: End-to-End Session Security

Article 4(3)(c) mandates protection against **capture** (eavesdropping) and **manipulation** (tampering) of authentication data during the communication session. This covers both transport-layer and application-layer security.

```
┌-----------------------------------------------------------------------------┐
│                       Session Protection Architecture                       │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------┐        OID4VP Request/Response         ┌--------------┐  │
│  │    WALLET     │ ◄======================================► │     PSP     │ │
│  │  (Verifier)   │                                         │  (Relying   │  │
│  └---------------┘                                         │   Party)    │  │
│         │                                                   └--------------┘│
│         │                                                                   │
│  ┌------┴------------------------------------------------------------------┐│
│  │                      PROTECTION LAYERS                                  ││
│  ├-------------------------------------------------------------------------┤│
│  │                                                                         ││
│  │  Layer 1: TRANSPORT (TLS 1.2+/1.3)                                      ││
│  │  ---------------------------------                                     │ │
│  │  • Encryption: AES-GCM-256 / ChaCha20-Poly1305                          ││
│  │  • Integrity: HMAC / AEAD                                               ││
│  │  • Authentication: X.509 certificates                                   ││
│  │                                                                         ││
│  │  Layer 2: APPLICATION (JAR/JWE)                                         ││
│  │  -------------------------------                                       │ │
│  │  • Request encryption: JWT Secured Authorization Request (JAR)          ││
│  │  • Response signing: KB-JWT signature                                   ││
│  │  • Nonce binding: Prevents replay                                       ││
│  │                                                                         ││
│  │  Layer 3: SESSION BINDING                                               ││
│  │  ----------------------------                                          │ │
│  │  • Nonce: Fresh per request                                             ││
│  │  • Audience: Binds to specific verifier                                 ││
│  │  • Transaction hash: Binds to specific transaction                      ││
│  │                                                                         ││
│  └-------------------------------------------------------------------------┘│
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Protection Against Capture (Eavesdropping)

| Protection Mechanism | Layer | Implementation |
|---------------------|-------|----------------|
| **TLS 1.2+ encryption** | Transport | All OID4VP communications over HTTPS |
| **Forward secrecy** | Transport | ECDHE key exchange (ephemeral keys) |
| **JAR encryption** | Application | Authorization Request can be JWE-encrypted |
| **Credential encryption** | Application | SD-JWT-VC with selective disclosure |

##### Protection Against Manipulation (Tampering)

| Protection Mechanism | Layer | What It Protects |
|---------------------|-------|-----------------|
| **TLS AEAD** | Transport | Tamper detection at transport layer |
| **KB-JWT signature** | Application | Response integrity |
| **Nonce binding** | Application | Request-response correlation |
| **Transaction hash** | Application | Dynamic linking integrity |
| **Audience restriction** | Application | Prevents redirect to wrong verifier |

##### OID4VP Session Binding Mechanisms

```
┌-----------------------------------------------------------------------------┐
│                       OID4VP Session Binding                                │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  AUTHORIZATION REQUEST (PSP → Wallet)                                       │
│  -------------------------------------                                      │
│  {                                                                          │
│    "nonce": "abc123...",        ◄-- Fresh per request                       │
│    "client_id": "psp.example",  ◄-- PSP identifier                          │
│    "response_uri": "https://...",◄-- Where to send response                 │
│    "presentation_definition": {...}                                         │
│  }                                                                          │
│                                                                             │
│  VP TOKEN RESPONSE (Wallet → PSP)                                           │
│  ---------------------------------                                          │
│  KB-JWT contains:                                                           │
│  {                                                                          │
│    "nonce": "abc123...",        ◄-- MUST match request nonce                │
│    "aud": "psp.example",        ◄-- MUST match client_id                    │
│    "iat": 1706...,              ◄-- Timestamp for freshness                 │
│    "transaction_data_hashes": [...]  ◄-- Dynamic linking                    │
│  }                                                                          │
│                                                                             │
│  VERIFICATION:                                                              │
│  • nonce mismatch → REJECT (replay/confusion attack)                        │
│  • aud mismatch → REJECT (redirect attack)                                  │
│  • iat ► 5 min → REJECT (stale presentation)                                │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### TLS Requirements Analysis

| Requirement | PSD2 RTS Ref | Implementation |
|-------------|-------------|----------------|
| **TLS version** | Chapter V | TLS 1.2+ (TLS 1.3 preferred) |
| **Cipher suites** | Best practice | AEAD ciphers (AES-GCM, ChaCha20) |
| **Certificate validation** | Art. 29 | PSP certificate verified by wallet |
| **Forward secrecy** | Best practice | ECDHE key exchange |
| **HSTS** | Best practice | Enforced on PSP endpoints |
| **Certificate pinning** | Optional | Recommended for high-value transactions |

##### Session Hijacking Prevention

| Attack Vector | OID4VP Countermeasure | Status |
|---------------|----------------------|--------|
| **Man-in-the-middle** | TLS + certificate validation | ✅ Mitigated |
| **Session fixation** | Nonce generated by PSP | ✅ Mitigated |
| **Replay attack** | Unique nonce per request | ✅ Mitigated |
| **Response redirect** | Audience (`aud`) claim | ✅ Mitigated |
| **Cross-device attack** | Device binding + nonce | ✅ Mitigated |
| **Downgrade attack** | TLS 1.2+ only | ✅ Mitigated |

##### Same-Device vs Cross-Device Flows

| Flow Type | Session Protection | Additional Considerations |
|-----------|-------------------|--------------------------|
| **Same-device** | Direct app-to-app communication | Intent/Universal Link security |
| **Cross-device (QR)** | Encrypted channel establishment | Device proximity not verified |
| **Cross-device (BLE)** | Encrypted BLE channel | Requires BLE security mode 1 level 4 |

► **Note**: Cross-device flows (e.g., QR code scanned from desktop) have additional attack surface. The session binding via nonce/aud helps, but device proximity is not cryptographically verified.

##### Encrypted Authorization Request (JAR)

TS12 §3.5 supports encrypted requests for additional protection:

| JAR Property | Security Benefit |
|--------------|-----------------|
| **JWE encryption** | Request contents hidden from intermediaries |
| **Signed + encrypted** | Integrity + confidentiality |
| **Ephemeral keys** | Forward secrecy for request content |

##### Reference Implementation Evidence

| Platform | Session Protection | Source |
|----------|-------------------|--------|
| **iOS** | TLS enforcement | iOS App Transport Security (ATS) default — cleartext blocked |
| **iOS** | Session handling | [`RemoteSessionCoordinator.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-core/Sources/Coordinator/RemoteSessionCoordinator.swift) — presentation session management |
| **Android** | TLS enforcement | [`network_security_config.xml`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/network-logic/src/main/res/xml/network_security_config.xml#L17-L19) — `cleartextTrafficPermitted="false"` |
| **Both** | Nonce/aud binding | OID4VP library validates authorization request |


##### Threat Model: Session Attacks

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|--------|
| **Packet sniffing** | Unencrypted traffic | TLS 1.2+ mandatory | ✅ Mitigated |
| **MITM (network)** | Rogue access point | Certificate validation | ✅ Mitigated |
| **MITM (DNS)** | DNS spoofing | DNSSEC, cert validation | ⚠️ Partial (DNSSEC optional) |
| **Request interception** | Capture authorization request | JAR encryption (optional) | ⚠️ Partial |
| **Response tampering** | Modify VP Token | KB-JWT signature | ✅ Mitigated |
| **Session token theft** | Steal auth code | Audience binding, short validity | ✅ Mitigated |

##### Gap Analysis: Session Protection

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **SP-1** | JAR encryption not mandatory | Medium | Consider mandatory JAR encryption for high-value transactions |
| **SP-2** | TLS 1.3 not mandated | Low | TS12 should encourage TLS 1.3 for improved performance and security |
| **SP-3** | Cross-device proximity not verified | Medium | Explore Bluetooth/NFC proximity verification for cross-device flows |
| **SP-4** | Certificate pinning not required | Low | Consider mandatory pinning for PSP certificate in wallet |

##### Recommendations for SCA Attestation Rulebook

1. **TLS Version**: Mandate TLS 1.2 minimum, recommend TLS 1.3
2. **JAR for Sensitive Requests**: Require encrypted JAR for transactions above TRA threshold
3. **Nonce Requirements**: Specify minimum entropy (128 bits) and single-use enforcement
4. **Session Validity**: Specify maximum session lifetime (e.g., 5 minutes from nonce generation)
5. **Cross-Device Security**: Document additional risks and mitigations for QR-initiated flows

</details>

**Context**: OID4VP inherits security from HTTPS (TLS 1.2+). Additionally, TS12 allows optional encryption of request/response payloads for additional protection.

---

#### [Article 4(3)(d)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.003) — Session timeout

► "(d) the maximum time without activity by the payer after being authenticated for accessing its payment account online shall not exceed 5 minutes."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| 🔶 **Rulebook** | — | Not specified in TS12 v1.0 |
| ❌ **PSP** | — | PSP must enforce session timeout server-side |

**Status**: ❌ PSP Obligation

<details>
<summary><strong>🔍 Deep-Dive: Session Timeout (5 Minutes)</strong></summary>

##### Core Requirement: Inactivity-Based Session Termination

Article 4(3)(d) mandates that after SCA, the PSP session must timeout after **5 minutes of inactivity**. This limits the attack window for session hijacking and unattended device scenarios.

```
┌-----------------------------------------------------------------------------┐
│                     Session Timeout Responsibility Model                    │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │                         SCA FLOW                                    │    │
│  │                                                                     │    │
│  │   User --► Wallet (SCA) --► VP Token --► PSP --► Session Created   │     │
│  │                                           │                         │    │
│  │                                           ▼                         │    │
│  │                                    ┌------------┐                   │    │
│  │                                    │ PSP Server │                   │    │
│  │                                    │  Session   │                   │    │
│  │                                    │  Timer     │                   │    │
│  │                                    └-----┬------┘                   │    │
│  │                                          │                          │    │
│  │           Activity? ---► Reset Timer ◄---┘                          │    │
│  │              │                                                      │    │
│  │              ▼                                                      │    │
│  │        5 min inactivity --► SESSION TERMINATED                      │    │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                             │
│  WALLET RESPONSIBILITY: None (wallet doesn't manage PSP session)            │
│  PSP RESPONSIBILITY: Enforce 5-minute idle timeout server-side              │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Who is Responsible?

| Component | Session Timeout Responsibility | Reason |
|-----------|-------------------------------|--------|
| **Wallet** | ❌ Not responsible | Wallet performs SCA, doesn't manage PSP session |
| **PSP Backend** | ✅ Primary responsibility | Controls session lifecycle |
| **PSP Frontend** | ⚠️ Partial (UX) | Can warn user, but timeout must be server-enforced |

##### EBA Exemptions to 5-Minute Rule

The EBA has clarified exemptions where the 5-minute timeout may not apply:

| Exemption | Condition | Reference |
|-----------|-----------|-----------|
| **Article 10 (AIS 90-day)** | AISP access with SCA within 90 days | RTS Art. 10 |
| **180-day extension** | AISP with enhanced security | EBA Q&A 2022/6381 |
| **Legal persons** | Dedicated corporate payment processes | RTS Art. 17 |
| **Read-only display** | Balance/transaction viewing (Art. 10 exempt) | EBA Q&A 2018/4039 |

► **Important**: The 5-minute rule applies when **accessing a payment account online** after SCA. If the user is in the middle of a transaction (actively inputting data), activity resets the timer.

##### OWASP Session Management Alignment

| OWASP Recommendation | PSD2 Art. 4(3)(d) | Alignment |
|---------------------|-------------------|-----------|
| **Idle timeout 2-5 min** (high-value) | 5 minutes | ✅ Aligned |
| **Absolute timeout** (e.g., 4-8 hours) | Not specified | ⚠️ Not covered |
| **Server-side enforcement** | Required | ✅ Aligned |
| **Session ID regeneration** | Not specified | ⚠️ PSP best practice |
| **Secure cookie flags** | Not specified | ⚠️ PSP best practice |

##### What Constitutes "Activity"?

| Activity Type | Resets Timer? | Notes |
|---------------|---------------|-------|
| **Mouse movement** | ⚠️ Depends on PSP | Some PSPs count as activity |
| **Key press** | ✅ Yes | Typing in form fields |
| **API request** | ✅ Yes | Any authenticated request to PSP |
| **Page navigation** | ✅ Yes | Moving between account pages |
| **Background refresh** | ❌ No (should not) | Auto-refresh doesn't indicate user presence |

##### Wallet vs PSP Session Clarification

```
┌-----------------------------------------------------------------------------┐
│                     Session Types in EUDI Wallet + PSD2                     │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌----------------------------------┐  ┌--------------------------------┐   │
│  │   WALLET SESSION                 │  │   PSP SESSION                  │   │
│  │   (NOT governed by Art. 4(3)(d)) │  │   (GOVERNED by Art. 4(3)(d))   │   │
│  │                                  │  │                                │   │
│  │   • Wallet PIN unlock            │  │   • Created after SCA          │   │
│  │   • Device-local timeout         │  │   • Server-side tracking       │   │
│  │   • Biometric re-auth            │  │   • 5-minute idle timeout      │   │
│  │   • Wallet's own policy          │  │   • PSP's responsibility       │   │
│  │                                  │  │                                │   │
│  │   Timeout: Wallet-defined        │  │   Timeout: MAX 5 minutes       │   │
│  │   (e.g., 2 min, 5 min, etc.)     │  │   (regulatory mandate)         │   │
│  │                                  │  │                                │   │
│  └----------------------------------┘  └--------------------------------┘   │
│                                                                             │
│  After wallet performs SCA → PSP receives VP Token → PSP creates session    │
│  → Art. 4(3)(d) applies to PSP session ONLY                                 │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Implementation Patterns for PSPs

| Pattern | Description | Security Level |
|---------|-------------|----------------|
| **Server-side timer** | Session expires on server after 5 min idle | ✅ High |
| **Token expiry** | Access token expires; refresh requires activity | ✅ High |
| **Heartbeat with server** | Client sends heartbeat; server tracks last activity | ⚠️ Medium |
| **Client-side only** | JavaScript timer with logout | ❌ Low (bypassable) |

► **Best Practice**: Combine server-side enforcement with client-side warning (e.g., "Session expiring in 1 minute").

##### Threat Model: Session Timeout Attacks

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|--------|
| **Unattended device** | Attacker uses open session | 5-min timeout | ✅ Mitigated |
| **Session extension attack** | Attacker sends fake heartbeats | Server validates activity type | ⚠️ Depends on impl |
| **Token theft** | Stolen token used after timeout | Token invalidation on timeout | ✅ Mitigated |
| **Timeout bypass** | Client-side only enforcement | Server-side mandatory | ✅ Mitigated |

##### Implementation Responsibility

► **Note**: Session timeout is a **PSP-side obligation** (Art. 4(3)(d)). The wallet's role is limited to local unlock timeout.

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| **Wallet** | Local unlock timeout | PIN/biometric re-prompt after inactivity |
| **PSP Backend** | Session timeout (5 min inactivity) | Server-side session management |
| **TS12** | Silent on timeout specifics | Gap — should reference PSP obligation |


##### Gap Analysis: Session Timeout

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **ST-1** | TS12 does not mention 5-minute timeout | Medium | TS12 should remind PSPs of Art. 4(3)(d) obligation |
| **ST-2** | No guidance on activity definition | Low | Clarify what constitutes "activity" (API calls, not heartbeats) |
| **ST-3** | Wallet session timeout not aligned | Low | Consider aligning wallet unlock timeout with PSP session |
| **ST-4** | Absolute timeout not specified | Medium | Consider recommending max absolute session (e.g., 4 hours) |

##### Recommendations for SCA Attestation Rulebook

1. **PSP Reminder**: Explicitly reference Art. 4(3)(d) obligation for PSPs
2. **Activity Definition**: Clarify that automatic refreshes don't count as user activity
3. **Wallet Alignment**: Recommend wallet PIN timeout ≤ 5 minutes for UX consistency
4. **Absolute Timeout**: Recommend PSPs implement absolute timeout (e.g., 4 hours regardless of activity)
5. **Exemption Awareness**: Document Art. 10 / Art. 17 exemptions for PSP implementers

</details>

**Context**: TS12 does not specify session timeout. This is a PSP-side implementation requirement. After authentication, the PSP session (not the wallet session) must timeout after 5 minutes of inactivity.---

## 6.2 Knowledge Element

► **Regulatory Basis**:
► - [RTS Art. 6](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_6): Requirements of the elements categorised as knowledge

#### [Article 6(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#006.001)

► "Payment service providers shall adopt measures to mitigate the risk that the elements of strong customer authentication categorised as knowledge are uncovered by, or disclosed to, unauthorised parties."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WIAM_14](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | PIN validated by WSCA/WSCD, never transmitted |
| ✅ **Wallet** | Device security | PIN entry masked; secure keyboard on iOS/Android |
| ✅ **Wallet** | — | PIN never stored in plaintext |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: Knowledge Element Protection</strong></summary>

##### What Qualifies as a Knowledge Element (EBA Opinion 2019)

The [EBA Opinion on SCA Elements](https://www.eba.europa.eu/publications-and-media/press-releases/eba-publishes-opinion-elements-strong-customer) (June 2019) clarifies what constitutes a valid knowledge element:

| ✅ Compliant | ❌ Non-Compliant |
|-------------|-----------------|
| PIN (Personal Identification Number) | Email address |
| Password | Username |
| Passphrase | Card CVV/CVC printed on card |
| Knowledge-based challenge answer | OTP (is possession, not knowledge) |
| Memorized swipe pattern | Card number |

► **Key Insight**: The EBA emphasizes that card details (PAN, expiry, CVV) are **NOT** valid SCA elements — they can be easily copied and do not prove "something only the user knows."

##### Threat Model: Knowledge Element Attacks

| Threat | Attack Vector | Mitigation | EUDI Wallet Status |
|--------|---------------|------------|-------------------|
| **Shoulder surfing** | Attacker observes PIN entry | Masked input, short character display | ✅ iOS/Android built-in |
| **Brute force** | Repeated guessing attempts | Lockout after max attempts (Art. 4(3)(b)) | ✅ WSCA enforced |
| **Social engineering** | User persuaded to disclose PIN | User education, phishing warnings | ⚠️ PSP responsibility |
| **Malware / keylogger** | Capture keystrokes via malicious app | Secure keyboard, TEE validation, WUA | ✅ App Attest / Play Integrity |
| **Phishing** | Fake PIN entry UI overlay | WUA attestation, app integrity checks | ✅ WUA revocation |
| **Memory dump** | Extract PIN from RAM | WSCA validation, no plaintext in memory | ✅ Secure Enclave / TEE |
| **Weak PIN selection** | User chooses 123456, 000000 | PIN strength check, blocklist | ⚠️ Not enforced by TS12 |

##### PIN/Password Security: Standards Comparison

| Standard | Min Length | Complexity Rules | Lockout | Entropy Guidance |
|----------|-----------|------------------|---------|------------------|
| **PSD2 RTS** | Not specified | Not specified | Required (Art. 4(3)(b)) | None |
| **NIST 800-63B** | 6 digits (PIN) / 8 chars (MFA) | **No** — length ► complexity | Recommended | Blocklist common PINs |
| **EUDI Wallet ARF** | 6 digits | Alphanumeric optional | Required | None |
| **Apple iOS** | 6 digits (default) | Alphanumeric available | Device-level | Sequential detection |
| **Android** | 4 digits (min) | Pattern/alphanumeric | Device-level | Pattern complexity score |

► **NIST 800-63B Key Insight**: "Longer passwords contribute more to security than complex ones." NIST explicitly advises **against** composition rules (requiring uppercase, numbers, symbols) as they lead to predictable patterns. Instead, recommend length and blocklist common choices.

##### PIN Validation Flow (EUDI Wallet)

```
┌-----------------------------------------------------------------┐
│                    PIN Entry & Validation Flow                  │
├-----------------------------------------------------------------┤
│                                                                 │
│  User        Wallet App         WSCA/WSCD          Verifier     │
│   │              │                  │               │           │
│   │ Enter PIN    │                  │               │           │
│   │--[masked]---►│                  │               │           │
│   │              │ Validate PIN     │               │           │
│   │              │-----------------►│               │           │
│   │              │                  │               │           │
│   │              │                  ├--------------┐│           │
│   │              │                  │ Compare hash ││           │
│   │              │                  │ in Secure    ││           │
│   │              │                  │ Enclave/TEE  ││           │
│   │              │                  │◄-------------┘│           │
│   │              │                  │               │           │
│   │              │ Success/Lockout  │               │           │
│   │              │◄-----------------│               │           │
│   │              │                  │               │           │
│   │              │ [If success]     │               │           │
│   │              │ Sign KB-JWT with │               │           │
│   │              │ private key      │               │           │
│   │              │-----------------►│               │           │
│   │              │                  │               │           │
│   │              │ KB-JWT (signed)  │               │           │
│   │              │◄-----------------│               │           │
│   │              │                  │               │           │
│   │              │ VP Token with KB-JWT             │           │
│   │              │----------------------------------►           │
│   │              │                  │               │           │
│   │              │                  │    ⚠️ PIN NEVER LEAVES    │
│   │              │                  │       THE DEVICE          │
│                                                                 │
└-----------------------------------------------------------------┘

Legend:
  --►  Data flow (PIN never transmitted)
  WSCA = Wallet Secure Cryptographic Application
  WSCD = Wallet Secure Cryptographic Device (SE/TEE)
```

##### Reference Implementation Evidence

| Platform | Component | Source | Security Property |
|----------|-----------|--------|-------------------|
| **iOS** | PIN entry UI | [`PinTextFieldView.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-ui/Sources/DesignSystem/Component/Input/PinTextFieldView.swift#L172-L175) (L172-175) | `.keyboardType(.numberPad)`, `.textContentType(.oneTimeCode)` |
| **iOS** | PIN storage | [`KeychainPinStorageProvider.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-authentication/Sources/Storage/KeychainPinStorageProvider.swift#L30-L31) (L30-31) | Keychain storage with device-only accessibility |
| **Android** | PIN entry UI | [`PinScreen.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/common-feature/src/main/java/eu/europa/ec/commonfeature/ui/pin/PinScreen.kt#L282-L292) (L282-292) | `PasswordVisualTransformation()` masked input |
| **Android** | PIN storage | [`PrefsPinStorageProvider.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/authentication-logic/src/main/java/eu/europa/ec/authenticationlogic/storage/PrefsPinStorageProvider.kt#L57-L72) (L57-72) | AES-GCM encryption before storage |


##### Gap Analysis: Knowledge Element

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **K-1** | PIN entropy not specified in TS12 | Medium | SCA Attestation Rulebook should require 6+ digits, blocklist common PINs (123456, 000000, 111111) |
| **K-2** | PIN complexity rules undefined | Low | Align with NIST 800-63B: prefer length over complexity, no composition rules |
| **K-3** | PIN recovery procedure not specified | Medium | Document secure PIN reset flow requiring WSCD re-initialization or issuer-verified recovery |
| **K-4** | Biometric fallback to PIN not time-limited | Low | Consider requiring PIN re-entry after N biometric failures or 24h timeout |

##### Recommendations for SCA Attestation Rulebook

1. **PIN Length**: Mandate minimum 6-digit PIN (NIST 800-63B alignment)
2. **PIN Blocklist**: Require rejection of common/sequential PINs
3. **No Complexity Rules**: Explicitly permit alphanumeric but do not require mixed case/symbols (NIST guidance)
4. **Attempt Counter**: Require WSCA to track failed attempts across app reinstalls (tied to WSCD, not app storage)
5. **Recovery Flow**: Document secure PIN reset requiring:
   - Device possession + issuer verification, OR
   - WSCD re-initialization with full re-issuance

</details>

**Context**: The user's PIN (knowledge element) is:
- Entered locally on the device with masked input
- Validated by WSCA/WSCD (Secure Enclave / TEE)
- Never transmitted to PSP or Wallet Provider
- Not stored in plaintext

---

#### [Article 6(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#006.002)

► "The use by the payer of those elements shall be subject to mitigation measures in order to prevent their disclosure to unauthorised parties."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet/OS** | iOS/Android | Minimum 6-digit PIN; alphanumeric optional |
| 🔶 **Rulebook** | — | SCA Attestation Rulebook may specify additional PIN requirements |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: Knowledge Element Disclosure Prevention</strong></summary>

##### Core Requirement: Mitigation Measures Against Disclosure

Article 6(2) mandates that PSPs implement **mitigation measures** to prevent knowledge elements (PINs, passwords) from being disclosed to unauthorized parties. This covers both technical and procedural protections.

```
┌-----------------------------------------------------------------------------┐
│             Knowledge Element Disclosure Prevention Architecture            │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │                      DISCLOSURE THREATS                             │    │
│  │                                                                     │    │
│  │   OBSERVATION          INTERCEPTION           DECEPTION            │     │
│  │   ------------         ------------           ---------            │     │
│  │   • Shoulder surfing   • Keylogger            • Phishing           │     │
│  │   • Screen recording   • Screen capture       • Fake app overlay   │     │
│  │   • Camera recording   • Accessibility abuse  • Social engineering │     │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                              ▼                                              │
│  ┌---------------------------------------------------------------------┐    │
│  │                    MITIGATION MEASURES                              │    │
│  │                                                                     │    │
│  │   TECHNICAL                PROCEDURAL              ARCHITECTURAL   │     │
│  │   ---------               -----------              -------------   │     │
│  │   • Masked input          • User education         • Local-only    │     │
│  │   • Secure keyboard       • Phishing warnings      • TEE/SE hash   │     │
│  │   • FLAG_SECURE           • Lockout policies       • Never transmit│     │
│  │   • Overlay detection     • No verbal disclosure   • Attempt limits│     │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Categories of Disclosure Threats

| Threat Category | Examples | Mitigation Strategy |
|-----------------|----------|---------------------|
| **Physical observation** | Shoulder surfing, camera | Masked input, privacy screens |
| **Technical interception** | Keylogger, screen capture | Secure keyboard, FLAG_SECURE |
| **Social engineering** | Phishing, pretexting | User education, never transmit PIN |
| **Malware** | Accessibility abuse, overlay | OS protections, TEE validation |
| **Brute force** | Guessing, credential stuffing | Attempt limits, lockout |

##### EUDI Wallet Mitigation Architecture

| Mitigation Measure | Implementation | Platform |
|--------------------|----------------|----------|
| **Masked input** | PIN digits replaced with `•` | iOS/Android native |
| **Secure keyboard** | System keyboard with FLAG_SECURE | Android |
| **Local validation only** | PIN validated in WSCA/WSCD | Both |
| **Never transmitted** | PIN/biometric never sent to server | Both |
| **Hash storage** | PIN hash only, with salt | TEE/SE |
| **Attempt limiting** | Lockout after failed attempts | WSCA/OS |
| **Overlay protection** | OS-level overlay detection | Android 10+ |

##### Secure Keyboard Protections

| Protection | Description | Threat Mitigated |
|------------|-------------|------------------|
| **FLAG_SECURE** | Prevents screenshots/recordings | Screen capture malware |
| **Randomized layout** | PIN pad positions shuffled | Keylogger position inference |
| **No accessibility** | Blocks accessibility services | Automation abuse |
| **System keyboard** | Uses OS-provided secure input | Third-party keyboard malware |
| **No clipboard** | Disables copy/paste for secrets | Clipboard monitoring |

```
┌-----------------------------------------------------------------------------┐
│                    Secure PIN Entry Flow (EUDI Wallet)                      │
├-----------------------------------------------------------------------------┤
│                                                                             │
│   ┌-------------------------------------------------------------------┐     │
│   │                 PIN ENTRY SCREEN (FLAG_SECURE)                    │     │
│   │                                                                   │     │
│   │     Enter your 6-digit PIN                                        │     │
│   │                                                                   │     │
│   │        ┌-----------------------------┐                            │     │
│   │        │    • • • • • •              │  ← Masked display          │     │
│   │        └-----------------------------┘                            │     │
│   │                                                                   │     │
│   │        ┌---┬---┬---┐                                              │     │
│   │        │ 3 │ 7 │ 2 │  ← Randomized (optional)                     │     │
│   │        ├---┼---┼---┤                                              │     │
│   │        │ 9 │ 0 │ 5 │                                              │     │
│   │        ├---┼---┼---┤                                              │     │
│   │        │ 1 │ 6 │ 8 │                                              │     │
│   │        ├---┼---┼---┤                                              │     │
│   │        │ ⌫ │ 4 │ ✓ │                                            │     │
│   │        └---┴---┴---┘                                              │     │
│   │                                                                   │     │
│   │  🔒 3 attempts remaining                                          │    │
│   │                                                                   │     │
│   └-------------------------------------------------------------------┘     │
│                                                                             │
│   PIN Flow: Input → WSCA hash → WSCD compare → Auth result                  │
│             (PIN value never leaves secure environment)                     │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### NIST 800-63B Alignment

NIST guidelines inform best practices for knowledge element protection:

| NIST Recommendation | PSD2 Art. 6(2) Alignment | EUDI Wallet |
|---------------------|-------------------------|-------------|
| **Minimum 8 chars (passwords)** | PIN: min 6 digits | ✅ 6-digit PIN (low entropy, but combined with possession) |
| **No complexity mandates** | Not specified | ✅ Simple numeric PIN allowed |
| **No forced rotation** | Not specified | ✅ No mandatory PIN change |
| **Blocklist for common** | Recommended | ⚠️ Implementation-dependent |
| **Secure hashing (Argon2id)** | Implied | ✅ TEE/SE uses hardware-backed hash |
| **Rate limiting** | Required | ✅ Lockout after N failures |

► **NIST Insight**: NIST discourages overly complex password rules as they lead to predictable patterns. For PINs combined with other SCA factors, simplicity is acceptable because possession provides additional security.

##### EBA Guidance on Disclosure Prevention

The EBA has clarified Article 6(2) requirements:

| EBA Guidance | Implementation Approach |
|--------------|------------------------|
| "Integrity during authentication" | PIN validated locally, never transmitted |
| "Phishing addressed by fraud monitoring" | Art. 2 TRA covers phishing-induced disclosure |
| "Mitigate risk of disclosure" | Masked input, secure keyboard, attempt limits |
| "Not about voluntary disclosure" | User education complementary |

► **EBA Q&A 4039**: "The focus of Article 6(2) is on the integrity of the knowledge element during the authentication process itself." Broader risks like phishing-induced disclosure are addressed by transaction monitoring (Art. 2).

##### Phishing Countermeasures

While phishing is primarily a PSP/TRA concern, the wallet can provide supporting measures:

| Countermeasure | Responsibility | Wallet Contribution |
|----------------|---------------|---------------------|
| **Phishing-resistant auth** | Wallet | Origin-bound keys (FIDO-like) |
| **Visual confirmation** | Wallet | Display PSP identity before PIN entry |
| **No remote PIN entry** | Architecture | PIN entered only on device, never on web |
| **User education** | PSP/Wallet | Security hints in UI |
| **Credential monitoring** | PSP | Transaction monitoring (Art. 2) |

##### Reference Implementation Evidence

| Platform | Component | Source | Security Property |
|----------|-----------|--------|-------------------|
| **iOS** | Biometric check | [`SystemBiometryController.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-authentication/Sources/Controller/SystemBiometryController.swift#L97-L126) (L97-126) | `canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics)` |
| **iOS** | Keychain biometry | [`KeyChainController.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-business/Sources/Controller/KeyChainController.swift#L75-L80) (L75-80) | `.whenPasscodeSetThisDeviceOnly` + touchID policy |
| **Android** | Biometric availability | [`BiometricsAvailability.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/authentication-logic/src/main/java/eu/europa/ec/authenticationlogic/controller/authentication/BiometricsAvailability.kt#L36-L58) (L36-58) | Class 3 (BIOMETRIC_STRONG) requirement |
| **Android** | User auth keys | [`KeystoreController.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/business-logic/src/main/java/eu/europa/ec/businesslogic/controller/crypto/KeystoreController.kt#L100-L110) (L100-110) | `setUserAuthenticationRequired(true)` |


##### Threat Model: Knowledge Disclosure

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|--------|
| **Shoulder surfing** | Watch user enter PIN | Masked input, privacy screens | ✅ Mitigated |
| **Keylogger** | Capture keystrokes | System keyboard, TEE validation | ✅ Mitigated |
| **Screen capture** | Malware screenshots | FLAG_SECURE | ✅ Mitigated |
| **Phishing** | Fake site solicits PIN | PIN never requested remotely | ✅ Mitigated |
| **Brute force** | Guess PIN | Attempt limits, lockout | ✅ Mitigated |
| **Social engineering** | Convince user to share | User education | ⚠️ Partial |
| **Overlay attack** | Fake UI over real app | OS overlay detection | ⚠️ Platform-dependent |

##### Gap Analysis: Disclosure Prevention

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **DP-1** | No minimum PIN length mandated in TS12 | Low | Reference 6-digit minimum in rulebook |
| **DP-2** | Randomized PIN pad not required | Low | Consider recommendation for high-value transactions |
| **DP-3** | Blocklist for common PINs not specified | Medium | Recommend blocklist (0000, 1234, etc.) |
| **DP-4** | Overlay protection varies by Android version | Medium | Document minimum Android version requirements |

##### Recommendations for SCA Attestation Rulebook

1. **PIN Length**: Mandate minimum 6-digit PIN (or equivalent entropy)
2. **Masked Input**: Require masked display of all knowledge elements
3. **Local Validation**: Confirm PIN must be validated locally (never transmitted)
4. **Attempt Limits**: Specify lockout thresholds (e.g., 5 failed attempts → temporary lockout)
5. **Common PIN Blocklist**: Recommend blocking trivially guessable PINs
6. **FLAG_SECURE**: Mandate screenshot/recording protection during PIN entry

</details>


---


## 6.3 Possession Element

► **Regulatory Basis**:
► - [RTS Art. 7](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_7): Requirements of elements categorised as possession

#### [Article 7(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#007.001)

► "Payment service providers shall adopt measures to mitigate the risk that the elements of strong customer authentication categorised as possession are used by unauthorised parties."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WIAM_20](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Private key non-extractable from WSCA/WSCD |
| ✅ **Wallet** | [WURevocation_09](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2322-topic-38---wallet-unit-revocation) | Wallet Provider can revoke compromised WUA |
| ✅ **Wallet** | [WIAM_06](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | User can request revocation via independent account |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: Possession Element (Cryptographic Key) Protection</strong></summary>

##### What Qualifies as a Possession Element (EBA Opinion 2019)

The EBA clarifies that "possession" means "something only the user possesses." A device qualifies if it reliably confirms possession through:

| ✅ Compliant Possession | ❌ NOT Compliant |
|------------------------|------------------|
| Device with hardware-protected key | Card number (PAN) |
| OTP generator (hardware or software) | CVV/CVC printed on card |
| Smart card / SIM | Static card data |
| Mobile app with protected key in TEE/SE | App without hardware key protection |
| FIDO authenticator | Email-based OTP (possession of email, not device) |

► **EBA Key Insight**: Mobile apps can serve as possession elements **only if** authentication data is encrypted with a key held in a hardware secure element (TEE/SE), preventing malware from copying the credential.

##### EUDI Wallet Secure Architecture: WSCD & WSCA

The EUDI Wallet uses a layered security architecture:

```
┌-----------------------------------------------------------------┐
│                    EUDI Wallet Security Architecture            │
├-----------------------------------------------------------------┤
│                                                                 │
│  ┌---------------------------------------------------------┐    │
│  │              Wallet Instance (User App)                  │   │
│  │  ┌-----------------------------------------------------┐│    │
│  │  │                    WSCA                              ││   │
│  │  │     Wallet Secure Cryptographic Application         ││    │
│  │  │  ┌-----------------------------------------------┐  ││    │
│  │  │  │           WSCD (Hardware)                     │  ││    │
│  │  │  │  ┌-----------------------------------------┐  │  ││    │
│  │  │  │  │         Private Keys                    │  │  ││    │
│  │  │  │  │  • SCA Attestation Key                  │  │  ││    │
│  │  │  │  │  • Device Binding Key                   │  │  ││    │
│  │  │  │  │  • Credential Private Keys              │  │  ││    │
│  │  │  │  │                                         │  │  ││    │
│  │  │  │  │  🔒 NON-EXTRACTABLE                     │  │  ││     │
│  │  │  │  │  🔒 Hardware-Protected                  │  │  ││     │
│  │  │  │  │  🔒 User-Auth Required                  │  │  ││     │
│  │  │  │  └-----------------------------------------┘  │  ││    │
│  │  │  │                                               │  ││    │
│  │  │  │  iOS: Secure Enclave  │  Android: StrongBox   │  ││    │
│  │  │  │                       │  or TEE Keymaster     │  ││    │
│  │  │  └-----------------------------------------------┘  ││    │
│  │  └-----------------------------------------------------┘│    │
│  └---------------------------------------------------------┘    │
│                                                                 │
└-----------------------------------------------------------------┘

WSCD = Wallet Secure Cryptographic Device (tamper-resistant hardware)
WSCA = Wallet Secure Cryptographic Application (manages key operations)
```

##### WSCD Implementation Options

| WSCD Type | Example | Security Level | Pros | Cons |
|-----------|---------|----------------|------|------|
| **Remote HSM** | Cloud HSM service | Highest | Tamper-proof, certified | Requires network, latency |
| **Local Secure Element** | eSE, SIM-based SE | Very High | Dedicated chip, certified | Device-specific support |
| **Local StrongBox** | Android StrongBox | High | Dedicated secure processor | Not all devices support |
| **Local TEE** | ARM TrustZone | Medium-High | Wide device support | Software isolation, not dedicated chip |
| **Software-only** | Encrypted keystore | Low | Universal support | Vulnerable to OS compromise |

► **EUDI Wallet ARF Requirement (WIAM_20)**: Private keys MUST be non-extractable and protected by WSCD. Software-only WSCD is permitted only as fallback with reduced LoA.

##### Hardware Security Comparison: iOS vs Android

| Feature | iOS Secure Enclave | Android StrongBox | Android TEE |
|---------|-------------------|-------------------|-------------|
| **Hardware** | Dedicated SEP chip | Dedicated SE chip | ARM TrustZone (shared CPU) |
| **Key Non-Extractability** | ✅ Hardware-enforced | ✅ Hardware-enforced | ✅ Software-enforced |
| **Certification** | FIPS 140-2/3 | Varies by vendor | Varies by vendor |
| **Common Criteria** | PP_MD certified | Some devices | Some devices |
| **Tamper Resistance** | Physical | Physical | Logical (software isolation) |
| **Key Attestation** | ✅ DeviceCheck, App Attest | ✅ Key Attestation API | ✅ Key Attestation API |
| **Availability** | All iOS devices (A7+) | High-end Android (API 28+) | All Android (API 23+) |

##### Key Attestation: Proving Possession

Key attestation cryptographically proves that a key is:
1. Generated in secure hardware (not importable)
2. Non-extractable
3. Protected by user authentication (PIN/biometric)
4. On an uncompromised device

| Platform | Attestation Method | Verifiable Properties |
|----------|-------------------|----------------------|
| **iOS** | App Attest + DeviceCheck | App integrity, device validity |
| **Android** | Key Attestation (Keymaster) | Key properties, device state, boot chain |
| **FIDO** | Attestation Certificate | Authenticator model, certification level |

**Android Key Attestation Chain**:
```
Google Root CA
    └-- Intermediate CA
        └-- Attestation Key (in device TEE/SE)
            └-- App Key Attestation Certificate
                ├-- Key properties (non-exportable)
                ├-- Security level (StrongBox/TEE)
                ├-- Boot state (verified/unverified)
                └-- OS version, patch level
```

##### Threat Model: Possession Element Attacks

| Threat | Attack Vector | Mitigation | EUDI Wallet Status |
|--------|---------------|------------|-------------------|
| **Device theft** | Physical access to device | Device lock + biometric/PIN required for key use | ✅ WIAM_14 |
| **Device loss** | Uncontrolled key access | Remote revocation via WUA invalidation | ✅ WURevocation_09 |
| **Key extraction** | Malware attempts to export key | Non-extractable keys in WSCD | ✅ WIAM_20 |
| **Key cloning** | Copy key to another device | Keys generated in WSCD, never leave | ✅ WIAM_20 |
| **OS compromise** | Root/jailbreak exposes keys | WUA attestation detects compromise | ✅ App Attest / Play Integrity |
| **App compromise** | Malicious app impersonates wallet | App attestation, code signing | ✅ WUA |
| **Relay attack** | Forward signing requests remotely | User presence required (biometric/PIN) | ✅ WIAM_14 |
| **Backup extraction** | Restore key from device backup | Keys excluded from backup (SE/TEE) | ✅ OS-level |

##### Gap Analysis: Possession Element

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **P-1** | Not all Android devices have StrongBox | Medium | TS12 should define minimum WSCD requirements; TEE acceptable, software-only not for SCA |
| **P-2** | Key attestation verification not mandated for PSPs | Medium | Recommend PSPs optionally verify key attestation in VP Token |
| **P-3** | Remote HSM WSCD latency concerns | Low | Document acceptable latency thresholds for user experience |
| **P-4** | Device migration doesn't transfer keys | N/A (by design) | Clarify in documentation: migration = re-issuance, not key transfer |
| **P-5** | `amr` claim doesn't indicate hardware security level | Low | Consider `hwk` (hardware key) in `amr` array for transparency |

##### Recommendations for SCA Attestation Rulebook

1. **Minimum WSCD Level**: Mandate TEE or higher for SCA; define fallback for legacy devices
2. **Key Non-Extractability**: Require hardware-enforced non-extractability (not just software flag)
3. **Key Attestation**: Recommend (not require) PSPs verify key attestation for high-value transactions
4. **Revocation SLA**: Define maximum time for WUA revocation to propagate (e.g., < 1 hour)
5. **Recovery Documentation**: Explicitly state that wallet recovery does NOT transfer private keys
6. **`hwk` AMR Claim**: Adopt OIDC `hwk` (hardware key) AMR value when possession is StrongBox/SE-backed

</details>

**Context**:
- **Loss**: User contacts Wallet Provider (or PSP) to revoke SCA attestation → key becomes invalid
- **Theft**: Device lock + biometric required; remote wipe available
- **Copying**: Private keys are non-extractable (hardware protection)

**Wallet Recovery Procedure** (ARF Topic N):

After device loss/theft, wallet recovery does NOT transfer private keys. Instead:

1. **Migration Object**: Encrypted blob containing attestation metadata (NOT private keys)
2. **Key Non-Exportability**: WIAM_20 mandates private keys never leave WSCA/WSCD
3. **Recovery = Re-issuance**: User must request **new** SCA attestation from PSP on new device
4. **LoA Maintained**: Migration preserves Level of Assurance High

This means the old possession element (lost device's key) is permanently invalidated, and a fresh key is generated on the new device.

---

#### [Article 7(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#007.002)

► "The use by the payer of those elements shall be subject to measures designed to prevent replication of the elements."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WIAM_20](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Private key protected, non-exportable |
| ✅ **Wallet** | [OID4VP/HAIP](https://openid.net/specs/openid4vc-high-assurance-interoperability-profile-1_0.html) | ES256 (ECDSA P-256) algorithm specified |
| ✅ **Wallet** | App integrity | WUA contains app attestation (Play Integrity / App Attest) |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: Possession Element Anti-Cloning Protection</strong></summary>

##### Core Requirement: Prevent Replication

Article 7(2) mandates that possession elements must be protected against **replication** — unauthorized copying of the cryptographic key or token that proves device possession. This is critical because a cloned possession element would defeat SCA entirely.

```
┌-----------------------------------------------------------------------------┐
│                    Anti-Cloning Protection Architecture                     │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │                     CLONING THREAT MODEL                            │    │
│  │                                                                     │    │
│  │   EXTRACTION            INTERCEPTION          PHYSICAL             │     │
│  │   ------------          ------------          --------             │     │
│  │   • Malware reads key   • Key during transit  • SIM cloning        │     │
│  │   • App decompilation   • Memory dumping      • Device theft       │     │
│  │   • Rooted device       • Debug interface     • Hardware attack    │     │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                              ▼                                              │
│  ┌---------------------------------------------------------------------┐    │
│  │                  ANTI-CLONING MEASURES                              │    │
│  │                                                                     │    │
│  │   HARDWARE                                                          │    │
│  │   • Secure Element (SE) — tamper-resistant chip                    │     │
│  │   • TEE/StrongBox — hardware-isolated key storage                  │     │
│  │   • Non-extractable key flag — OS enforced                         │     │
│  │                                                                     │    │
│  │   CRYPTOGRAPHIC                                                     │    │
│  │   • Key generated inside SE — never leaves hardware                │     │
│  │   • Sign operations happen in SE — key never in app memory         │     │
│  │   • Key attestation — proves key is hardware-bound                 │     │
│  │                                                                     │    │
│  │   OPERATIONAL                                                       │    │
│  │   • Device binding — key tied to specific device                   │     │
│  │   • Counter verification — detect cloned authenticators            │     │
│  │   • Revocation — invalidate compromised keys                       │     │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Hardware Security Levels

| Level | Technology | Non-Extractable? | Cloning Resistance |
|-------|------------|------------------|-------------------|
| **SE (Secure Element)** | Dedicated chip (CC EAL5+) | ✅ Yes | Very High |
| **StrongBox (Android)** | SE-backed Keymaster | ✅ Yes | Very High |
| **TEE (TrustZone)** | ARM TrustZone | ✅ Yes | High |
| **Software Keystore** | OS-protected file | ⚠️ Partial | Medium |
| **Plaintext storage** | Unprotected file | ❌ No | None |

► **EBA Guidance**: "Data used as a possession element can be copied unless held within a secure element." The RTS requires hardware protection for high assurance.

##### EUDI Wallet Anti-Cloning Implementation

| Protection | Implementation | WSCD Type |
|------------|----------------|-----------|
| **Non-extractable key** | `kSecAttrTokenIDSecureEnclave` (iOS) / `setIsStrongBoxBacked(true)` (Android) | SE/StrongBox |
| **Key generated in hardware** | ECDSA P-256 keypair created inside SE | All |
| **Signing in hardware** | Private key never leaves WSCD for signing | All |
| **Key attestation** | Hardware-signed proof that key is SE-bound | SE/StrongBox |
| **Device binding** | Key tied to device hardware ID | All |

##### Key Non-Extractability Verification

```
┌-----------------------------------------------------------------------------┐
│                      Key Lifecycle: Non-Extractable                         │
├-----------------------------------------------------------------------------┤
│                                                                             │
│   GENERATION                                                                │
│   ----------                                                                │
│   ┌---------------------┐           ┌---------------------------------┐     │
│   │   Wallet App        │  request  │        WSCD (Secure Element)    │     │
│   │                     │ --------► │                                 │     │
│   │   "Generate key"    │           │   1. RNG → private key Kp      │      │
│   │                     │           │   2. Compute public key Kpub    │     │
│   │                     │ ◄-------- │   3. Return Kpub ONLY           │     │
│   │   Receives: Kpub    │  pubkey   │   4. Kp NEVER leaves SE         │     │
│   └---------------------┘           └---------------------------------┘     │
│                                                                             │
│   SIGNING                                                                   │
│   -------                                                                   │
│   ┌---------------------┐           ┌---------------------------------┐     │
│   │   Wallet App        │   hash    │        WSCD (Secure Element)    │     │
│   │                     │ --------► │                                 │     │
│   │   "Sign this hash"  │           │   1. User auth (PIN/bio)        │     │
│   │                     │           │   2. Sign with Kp               │     │
│   │                     │ ◄-------- │   3. Return signature           │     │
│   │   Receives: sig     │  signature│   4. Kp STAYS in SE             │     │
│   └---------------------┘           └---------------------------------┘     │
│                                                                             │
│   EXPORT ATTEMPT                                                            │
│   -------------                                                             │
│   ┌---------------------┐           ┌---------------------------------┐     │
│   │   Malware           │  "export" │        WSCD (Secure Element)    │     │
│   │                     │ --------► │                                 │     │
│   │   "Give me Kp"      │           │   ❌ DENIED                     │      │
│   │                     │ ◄-------- │   (non-extractable policy)      │     │
│   │   Receives: ERROR   │   error   │                                 │     │
│   └---------------------┘           └---------------------------------┘     │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### FIDO Credential Protection Alignment

FIDO standards provide proven anti-cloning mechanisms:

| FIDO Feature | PSD2 Art. 7(2) Alignment | EUDI Wallet |
|--------------|-------------------------|-------------|
| **Private key in authenticator** | Key never leaves device | WSCD non-extractable |
| **Origin-bound credentials** | Key tied to specific RP | SCA Attestation bound to PSP |
| **Signature counter** | Detects cloned authenticators | KB-JWT `iat` freshness |
| **Attestation** | Proves hardware security level | WUA contains key attestation |
| **Cloning detection** | Counter mismatch = cloned | PSP can track signature patterns |

► **FIDO Insight**: FIDO authenticators prevent cloning by generating keys internally and never exposing them. The counter mechanism allows relying parties to detect if an authenticator has been cloned (counter value divergence).

##### EBA Guidance on Possession Element Protection

| EBA Requirement | Implementation |
|-----------------|----------------|
| "Reliable method to confirm possession" | Hardware-bound key + user verification |
| "Dynamic validation element" | Freshly signed KB-JWT for each transaction |
| "Secret keys adequately protected" | SE/TEE storage, non-extractable |
| "Robust enrollment process" | PSP-supervised SCA Attestation issuance |

##### Cloning Detection Mechanisms

| Mechanism | How It Works | Implementation |
|-----------|--------------|----------------|
| **Signature counter** | Counter increments on each use; clone would have stale counter | FIDO2 authenticators |
| **Timestamp freshness** | `iat` claim must be recent; old JWT = suspicious | KB-JWT validation |
| **Device attestation** | WUA proves device identity; clone would have different WUA | WUA verification |
| **Behavior analysis** | Same key used from different locations/devices = alert | PSP transaction monitoring |

##### Reference Implementation Evidence

| Platform | Component | Source | Anti-Cloning Property |
|----------|-----------|--------|----------------------|
| **iOS** | Key protection | [`KeyChainController.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-business/Sources/Controller/KeyChainController.swift#L75-L80) (L75-80) | `.whenPasscodeSetThisDeviceOnly` — device-bound, non-extractable |
| **iOS** | Biometry binding | [`SystemBiometryController.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-authentication/Sources/Controller/SystemBiometryController.swift#L76-L86) (L76-86) | Keychain biometry validation |
| **Android** | Key generation | [`KeystoreController.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/business-logic/src/main/java/eu/europa/ec/businesslogic/controller/crypto/KeystoreController.kt#L90-L118) (L90-118) | Android Keystore with `setUserAuthenticationRequired(true)` |
| **Android** | StrongBox config | [`WalletCoreConfigImpl.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/core-logic/src/demo/java/eu/europa/ec/corelogic/config/WalletCoreConfigImpl.kt#L41) (L41) | `useStrongBoxForKeys = true` |


##### Threat Model: Replication Attacks

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|--------|
| **Key extraction** | Malware reads private key | Non-extractable SE key | ✅ Mitigated |
| **Memory dumping** | Debug interface exposes key | Key never in app memory | ✅ Mitigated |
| **App repackaging** | Clone app with key inside | Key bound to device, not app | ✅ Mitigated |
| **SIM cloning** | Copy SIM to new device | SCA key not on SIM | ✅ Mitigated |
| **Device theft** | Steal device with key | User verification required | ✅ Mitigated |
| **Rooted device** | Bypass OS protections | SE isolation + WUA integrity check | ✅ Mitigated |
| **Hardware attack** | Physical chip probing | SE tamper resistance (CC EAL5+) | ⚠️ Very difficult |

##### Gap Analysis: Replication Prevention

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **RP-1** | No minimum hardware security level mandated | Medium | Require SE or StrongBox for SCA keys |
| **RP-2** | Software TEE (some Android) may be extractable | Medium | WUA should attest to SE vs TEE |
| **RP-3** | No signature counter mechanism in KB-JWT | Low | Consider counter claim for clone detection |
| **RP-4** | Key attestation format not standardized | Low | Align with W3C WebAuthn attestation |

##### Recommendations for SCA Attestation Rulebook

1. **Hardware Requirement**: Mandate SE or hardware-backed TEE for SCA keys
2. **Key Attestation**: Require hardware-signed attestation proving key non-extractability
3. **WUA Content**: Include WSCD type (SE/TEE/software) for PSP risk assessment
4. **Counter Mechanism**: Consider adding signature counter for clone detection
5. **Recovery Protocol**: Document that recovery requires key regeneration (not transfer)
6. **Minimum Certification**: Reference CC EAL4+ for SE components

</details>

---

## 6.4 Inherence Element

► **Regulatory Basis**:
► - [RTS Art. 8](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_8): Requirements of devices and software linked to elements categorised as inherence

#### [Article 8(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#008.001)

► "Payment service providers shall adopt measures to mitigate the risk that the authentication elements categorised as inherence and read by access devices and software provided to the payer are uncovered by unauthorised parties. At a minimum, the payment service providers shall ensure that those access devices and software have a very low probability of an unauthorised party being authenticated as the payer."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet/OS** | Face ID / BiometricPrompt | OS biometric API with liveness detection, anti-spoofing |
| ✅ **Wallet** | [WIAM_14](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Biometric required before crypto operation |

**Status**: ✅ Fully Supported (Delegated to OS)

<details>
<summary><strong>🔍 Deep-Dive: Inherence Element (Biometric) Security</strong></summary>

##### What Qualifies as an Inherence Element (EBA Opinion 2019)

The EBA clarifies that "inherence" means "something the user is" and includes both **biological** and **behavioral** biometrics:

| ✅ Compliant Inherence | ❌ NOT Compliant |
|----------------------|------------------|
| Fingerprint scanning | Device unlock PIN (is knowledge) |
| Face recognition | Password/passphrase (is knowledge) |
| Iris/retina scanning | OTP (is possession) |
| Voice recognition | 3-D Secure protocol alone |
| Vein recognition | Device location data |
| Keystroke dynamics | Known answers to questions |
| Heart rate pattern | Card CVV |

► **EBA Key Concern**: If a device allows multiple users to enroll biometrics (e.g., spouse's fingerprint), and the biometric is not linked to the user's official identity established during onboarding, it may **NOT** qualify as a valid inherence factor under Article 8.

##### "Very Low Probability" — FAR Thresholds

Article 8(1) requires a **"very low probability"** of unauthorized authentication. Industry standards define this through False Acceptance Rate (FAR):

| Platform / Standard | Biometric Type | FAR Threshold | Source |
|--------------------|--------------|--------------| ------|
| **Apple Face ID** | Face | 1 in 1,000,000 | [Apple Platform Security](https://support.apple.com/guide/security) |
| **Apple Touch ID** | Fingerprint | 1 in 50,000 | Apple Platform Security |
| **Android Class 3** | Any | ≤ 1 in 50,000 (0.002%) | [Android CDD](https://source.android.com/docs/compatibility/cdd) |
| **FIDO Biometric Cert** | Any | ◄ 1 in 10,000 | [FIDO Alliance](https://fidoalliance.org/certification/biometric-component-certification/) |
| **FIDO (self-attested)** | Any | 1:25K to 1:100K optional | FIDO Certification Requirements |

##### Key Biometric Metrics

| Metric | Definition | PSD2 Relevance |
|--------|------------|----------------|
| **FAR** (False Accept Rate) | Probability of accepting an impostor | Must be "very low" (Art. 8(1)) |
| **FRR** (False Reject Rate) | Probability of rejecting legitimate user | Affects UX, not security |
| **APCER** | Attack Presentation Classification Error Rate (ISO 30107-3) | Measures PAD effectiveness |
| **BPCER** | Bona Fide Presentation Classification Error Rate | Measures PAD false alarms |

##### Presentation Attack Detection (PAD) — ISO 30107-3

**Liveness detection** is critical to prevent spoofing attacks. ISO/IEC 30107-3 defines the testing methodology:

| Attack Type | Description | Mitigation |
|-------------|-------------|------------|
| **2D Photo Attack** | Printed photo held to camera | Depth sensing (Face ID TrueDepth) |
| **Video Replay** | Video of user played on screen | Motion analysis, liveness prompts |
| **3D Mask Attack** | Silicone or resin mask | IR dot projection, texture analysis |
| **Deepfake Injection** | AI-generated face injected into stream | Camera attestation, WUA integrity |
| **Lifted Fingerprint** | Gelatin/silicone mold of fingerprint | Capacitive sensing, pulse detection |
| **Voice Recording** | Playback of recorded voice | Voice liveness, challenge-response |

**FIDO & ISO Certification**:
- **FIDO Biometric Certification**: Requires ISO 30107-3 PAD testing by NIST-accredited lab (e.g., iBeta)
- **Android Class 3**: Requires hardware-backed anti-spoofing in TEE
- **Apple Face ID**: Neural network trained against known attack types

##### Threat Model: Inherence Element Attacks

| Threat | Attack Vector | Mitigation | EUDI Wallet Status |
|--------|---------------|------------|-------------------|
| **Photo spoofing** | 2D printed photo | Face ID depth sensing, BiometricPrompt Class 3 | ✅ OS-level |
| **Video replay** | Screen with recorded video | Liveness detection, 3D mapping | ✅ OS-level |
| **3D mask attack** | Silicone mask | IR texture analysis, Face ID neural network | ✅ Face ID; ⚠️ Android varies |
| **Deepfake injection** | Synthetic face into camera feed | WUA attestation, camera integrity | ✅ App Attest / Play Integrity |
| **Lifted fingerprint** | Molded fingerprint replica | Capacitive sensing, spoof-resistant sensors | ✅ Class 3 biometric |
| **Coerced authentication** | User forced to authenticate | Duress gestures, time delays | ⚠️ Not wallet-specific |
| **Twin/sibling attack** | Biologically similar person | Higher FAR accepted; fallback to PIN | ⚠️ Known limitation |

##### Android Biometric Classes

| Class | Security Level | FAR | TEE Required | PAD Required | SCA Suitable? |
|-------|---------------|-----|--------------|--------------|---------------|
| **Class 3 (Strong)** | Highest | ≤ 1:50,000 | Yes | Yes | ✅ Yes |
| **Class 2 (Weak)** | Medium | ► 1:50,000 | Optional | No | ❌ No |
| **Class 1 (Convenience)** | Low | Any | No | No | ❌ No |

► **Critical**: EUDI Wallet MUST use `BiometricManager.Authenticators.BIOMETRIC_STRONG` (Class 3) for SCA compliance.

##### Biometric Validation Flow (EUDI Wallet)

```
┌-----------------------------------------------------------------┐
│               Biometric Authentication Flow                     │
├-----------------------------------------------------------------┤
│                                                                 │
│  User        Wallet App         OS Biometric        WSCA/WSCD   │
│   │              │                  │                   │       │
│   │ Present face │                  │                   │       │
│   │--------------►                  │                   │       │
│   │              │ LAContext /      │                   │       │
│   │              │ BiometricPrompt  │                   │       │
│   │              │-----------------►│                   │       │
│   │              │                  │                   │       │
│   │              │                  ├------------------┐│       │
│   │              │                  │ 1. Liveness check││       │
│   │              │                  │ 2. Template match││       │
│   │              │                  │ 3. In Secure     ││       │
│   │              │                  │    Enclave/TEE   ││       │
│   │              │                  │◄-----------------┘│       │
│   │              │                  │                   │       │
│   │              │ Success (no template exposed)        │       │
│   │              │◄-----------------│                   │       │
│   │              │                  │                   │       │
│   │              │ Unlock private key for signing       │       │
│   │              │------------------------------------►│        │
│   │              │                  │                   │       │
│   │              │ Sign KB-JWT                          │       │
│   │              │◄------------------------------------│        │
│   │              │                  │                   │       │
│   │              │    ⚠️ BIOMETRIC TEMPLATE NEVER       │       │
│   │              │       LEAVES SECURE ENCLAVE          │       │
│                                                                 │
└-----------------------------------------------------------------┘

Legend:
  --►  Data flow
  Biometric data: Processed only in Secure Enclave / TEE
  Wallet app: Never receives biometric template, only success/fail
```

##### Reference Implementation Evidence

| Platform | Component | Source | Security Property |
|----------|-----------|--------|-------------------|
| **iOS** | Biometric evaluation | [`SystemBiometryController.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-authentication/Sources/Controller/SystemBiometryController.swift#L97-L126) (L97-126) | `LAContext.canEvaluate(.deviceOwnerAuthenticationWithBiometrics)` |
| **iOS** | Biometry UI flow | [`BiometryView.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/feature-common/Sources/UI/Biometry/BiometryView.swift) | User-facing biometric prompt |
| **Android** | Class 3 check | [`BiometricsAvailability.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/authentication-logic/src/main/java/eu/europa/ec/authenticationlogic/controller/authentication/BiometricsAvailability.kt#L36-L58) (L36-58) | `BIOMETRIC_STRONG` requirement |
| **Android** | User auth binding | [`KeystoreController.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/business-logic/src/main/java/eu/europa/ec/businesslogic/controller/crypto/KeystoreController.kt#L100-L110) (L100-110) | `AUTH_BIOMETRIC_STRONG` for key operations |


##### Gap Analysis: Inherence Element

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **I-1** | EBA concern: Device biometrics not linked to user's official identity | High | SCA Attestation Rulebook should clarify that biometric enrollment during wallet activation (after identity proofing) satisfies identity linkage |
| **I-2** | Multi-user device risk: Spouse/family biometrics could enroll | Medium | Document that SCA attestation is per-user; additional enrolled biometrics do not receive SCA-linked keys |
| **I-3** | Android Class 2 biometrics could be used if misconfigured | High | TS12 should mandate `BIOMETRIC_STRONG` (Class 3) only |
| **I-4** | Deepfake injection attacks on camera feed | Medium | WUA attestation + camera integrity checks mitigate; monitor emerging ISO 30107-4 injection attack standards |
| **I-5** | No `amr` claim for biometric type | Low | Consider adding biometric modality to `amr` (e.g., `face`, `fpt`, `iris`) for relying party transparency |

##### Recommendations for SCA Attestation Rulebook

1. **Mandate Class 3 Biometrics**: Android wallets MUST use `BIOMETRIC_STRONG`; reject Class 2/1
2. **Identity Linkage**: Clarify that biometric enrolled during wallet activation (post-KYC) satisfies EBA identity linkage requirement
3. **Single-User Binding**: Document that SCA attestation cryptographic keys are bound to the user who completed identity proofing, not to other device users
4. **PAD Certification Reference**: Reference ISO 30107-3 and FIDO Biometric Certification as evidence of "very low probability" compliance
5. **Fallback Policy**: Define maximum biometric failures before PIN fallback (Apple: 5; recommend standardizing)

</details>

**Context**: The wallet relies on OS-level biometric protection:
- **iOS**: `LAContext` with Face ID / Touch ID (includes liveness detection)
- **Android**: `BiometricPrompt` with Class 3 biometric (certified anti-spoofing)

The Wallet does NOT store or have access to biometric templates — this is managed by the OS Secure Enclave / TEE. The "very low probability" requirement is met by:
- False Acceptance Rate (FAR) ◄ 1/50,000 for fingerprint
- FAR ◄ 1/1,000,000 for Face ID (Apple)
- FIDO UAF certification for Android BiometricPrompt Class 3

**Reference Implementation Evidence**:
- iOS: `LAContext.evaluatePolicy` — liveness detection built into Face ID / Touch ID
- Android: `BiometricPrompt` (Class 3) — hardware-backed anti-spoofing

---

#### [Article 8(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#008.002)

► "The use by the payer of those elements shall be subject to measures ensuring that those devices and the software guarantee resistance against unauthorised use of the elements through access to the devices and the software."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **OS** | Apple / Google | Hardware-backed biometric sensors, certified algorithms |
| ✅ **Wallet** | App attestation | WUA contains Play Integrity / App Attest |

**Status**: ✅ Delegated to Certified OS Components

<details>
<summary><strong>🔍 Deep-Dive: Biometric Resistance Against Unauthorized Use</strong></summary>

##### Core Requirement: Device and Software Resistance

Article 8(2) focuses on protecting biometric systems from unauthorized access at the **device and software level**. Even if an attacker gains physical access to a device, the biometric system must resist spoofing and unauthorized authentication.

```
┌-----------------------------------------------------------------------------┐
│              Biometric Resistance Against Unauthorized Use                  │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │                     ATTACK SURFACE                                  │    │
│  │                                                                     │    │
│  │   PRESENTATION         SOFTWARE             HARDWARE               │     │
│  │   ------------         --------             --------               │     │
│  │   • Fake fingerprint   • Inject auth result • Sensor bypass        │     │
│  │   • Photo/video face   • Tampered app       • Debug interface      │     │
│  │   • 3D mask            • Rooted device      • Template extraction  │     │
│  │   • Voice recording    • API hooking        • Sensor spoofing      │     │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                              ▼                                              │
│  ┌---------------------------------------------------------------------┐    │
│  │                  RESISTANCE MEASURES                                │    │
│  │                                                                     │    │
│  │   PRESENTATION ATTACK DETECTION (PAD)                              │     │
│  │   • Liveness detection — verify live human                         │     │
│  │   • Depth sensing — 3D face scan, IR                               │     │
│  │   • Texture analysis — skin vs. silicone                           │     │
│  │                                                                     │    │
│  │   SOFTWARE INTEGRITY                                                │    │
│  │   • App attestation — verify app not tampered                      │     │
│  │   • OS integrity check — detect rooting/jailbreak                  │     │
│  │   • Secure path — sensor → Secure Enclave (no app access)          │     │
│  │                                                                     │    │
│  │   HARDWARE SECURITY                                                 │    │
│  │   • Secure Enclave — biometric match in isolated hardware          │     │
│  │   • Certified sensors — manufacturer attestation                   │     │
│  │   • Template encryption — biometric data encrypted at rest         │     │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Presentation Attack Detection (PAD) — ISO 30107 Framework

ISO/IEC 30107 defines the standard for biometric Presentation Attack Detection:

| ISO 30107 Component | Purpose | EUDI Wallet Alignment |
|--------------------|---------|-----------------------|
| **Part 1: Framework** | Defines PAD terminology | Terminology alignment |
| **Part 3: Testing** | Test methodology for PAD | OS vendors obtain certification |
| **Part 4: Profile** | Application profiles | Mobile device profiles |

##### PAD Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| **APCER** | Attack Presentation Classification Error Rate | ◄ 1% (Level 1), ◄ 0.1% (Level 2) |
| **BPCER** | Bona Fide Presentation Classification Error Rate | ◄ 3% (usability balance) |
| **PAD Decision** | Binary: genuine or attack | Per-transaction decision |

► **ISO 30107-3 Testing**: Leading OS vendors (Apple, Google) submit their biometric sensors for ISO 30107-3 certification, ensuring standardized resistance to presentation attacks.

##### Anti-Spoofing Layers

| Layer | Technology | Attack Mitigated |
|-------|------------|------------------|
| **Sensor** | IR/depth camera, ultrasonic fingerprint | Photo, flat fingerprint |
| **Algorithm** | Liveness detection, motion analysis | Static images, masks |
| **Processing** | Secure Enclave match | Result injection |
| **OS** | BiometricPrompt / LocalAuthentication | App-level bypass |

##### Platform Anti-Spoofing Implementation

| Platform | Component | Anti-Spoofing Feature |
|----------|-----------|----------------------|
| **iOS Face ID** | TrueDepth camera | 30,000 IR dots + flood illuminator + liveness |
| **iOS Touch ID** | Capacitive sensor | Sub-dermal ridge detection + liveness |
| **Android Class 3** | Certified sensors | Hardware-backed anti-spoofing required |
| **Android Strong** | Biometric HAL | `setAttestationChallengeIfNeeded()` for HW attestation |

##### Secure Architecture: Result Integrity

```
┌-----------------------------------------------------------------------------┐
│                  Biometric Authentication Secure Path                       │
├-----------------------------------------------------------------------------┤
│                                                                             │
│   ┌-------------┐                      ┌---------------------------------┐  │
│   │   SENSOR    │  -------------------►│        SECURE ENCLAVE           │  │
│   │  (Hardware) │     Raw biometric    │                                 │  │
│   └-------------┘     (encrypted path) │   1. Decrypt sample             │  │
│                                        │   2. Extract features           │  │
│                                        │   3. Match against template     │  │
│                                        │   4. Liveness check             │  │
│                                        │   5. Return: auth success/fail  │  │
│                                        │                                 │  │
│   ┌-------------┐                      │   ❌ Template NEVER leaves SE   │   │
│   │  WALLET APP │  ◄-------------------│   ❌ App gets ONLY result       │   │
│   │             │     Boolean result   │                                 │  │
│   └-------------┘                      └---------------------------------┘  │
│                                                                             │
│   GUARANTEE: Even if app is compromised, biometric template is safe         │
│              App cannot inject fake "success" — OS enforces path            │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### EBA Guidance on Inherence Resistance

| EBA Requirement | Implementation |
|-----------------|----------------|
| "Devices and software guarantee resistance" | OS hardware-backed biometric subsystem |
| "Unauthorized access to devices" | Device unlock required before biometric prompt |
| "Unauthorized use of elements" | Liveness detection prevents replays |
| "Quality of implementation" | Rely on certified OS, not custom implementation |

► **EBA Key Insight**: "The quality of the implementation, rather than the biometric feature itself, determines its suitability for SCA." This is why EUDI Wallet delegates to OS-certified biometric APIs.

##### Template Protection

| Protection | Mechanism | Status |
|------------|-----------|--------|
| **Encryption at rest** | Templates encrypted with device-unique key | ✅ iOS/Android |
| **Hardware isolation** | Templates stored in Secure Enclave | ✅ iOS/Android |
| **No export** | Templates cannot be extracted via any API | ✅ iOS/Android |
| **Match in SE** | Comparison happens inside secure hardware | ✅ iOS/Android |

##### OS-Level Biometric Protection

► **Note**: Biometric template storage and matching is handled entirely by the OS (iOS LocalAuthentication, Android BiometricManager). The wallet invokes system APIs; it never accesses templates directly.

| Platform | Component | Protection |
|----------|-----------|------------|
| **iOS** | LocalAuthentication | `LAPolicy.deviceOwnerAuthenticationWithBiometrics` — Secure Enclave matching |
| **iOS** | Face ID / Touch ID | Hardware anti-spoofing (depth sensing, attention detection) |
| **Android** | BiometricPrompt | `BIOMETRIC_STRONG` — hardware-backed matching only |
| **Android** | Biometric HAL 2.0+ | Hardware-attestable anti-spoofing |


##### Threat Model: Unauthorized Biometric Use

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|--------|
| **Photo attack** | Print or display victim's photo | Liveness + depth sensing | ✅ Mitigated |
| **Video attack** | Play video of victim | Motion analysis + randomized challenge | ✅ Mitigated |
| **3D mask** | Silicone face mask | Texture analysis + IR sensing | ✅ Mitigated |
| **Lifted fingerprint** | Reconstruct from latent print | Liveness detection (pulse, sweat) | ✅ Mitigated |
| **Voice replay** | Play recorded voice | Challenge-response, anti-replay | ✅ Mitigated |
| **Software bypass** | Inject auth result | OS secure path, SE-only match | ✅ Mitigated |
| **Template theft** | Extract biometric template | Non-extractable in SE | ✅ Mitigated |
| **Rooted device** | Bypass OS protections | WUA integrity check | ⚠️ OS-dependent |

##### Gap Analysis: Biometric Resistance

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **BR-1** | No minimum PAD certification level mandated | Medium | Reference ISO 30107-3 Level 2 as minimum |
| **BR-2** | Behavioral biometrics (keystroke dynamics) not standardized | Low | Clarify acceptable behavioral modalities |
| **BR-3** | No requirement for attention detection (face) | Low | Recommend attention detection for face auth |
| **BR-4** | Hybrid attacks (social + technical) not addressed | Medium | Document multi-factor requirement as defense |

##### Recommendations for SCA Attestation Rulebook

1. **PAD Certification**: Reference ISO 30107-3 as the standard for PAD testing
2. **Hardware Requirement**: Mandate Class 3 (Android) or equivalent for biometrics
3. **Template Protection**: Confirm templates must be hardware-protected
4. **OS Delegation**: Document that wallet MUST use OS biometric APIs (not custom)
5. **Fallback Policy**: Define behavior when biometric fails (PIN fallback)
6. **Attention Detection**: Recommend for face authentication

</details>

---

## 6.5 Independence of Elements

► **Regulatory Basis**:
► - [RTS Art. 9](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_9): Independence of the elements

#### [Article 9(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#009.001)

► "Payment service providers shall ensure that the use of the elements of strong customer authentication referred to in Articles 6, 7 and 8 is subject to measures which ensure that, in terms of technology, algorithms and parameters, the breach of one of the elements does not compromise the reliability of the other elements."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | WSCA/WSCD architecture | Biometric stored in Secure Enclave; PIN validated separately; keys in hardware |
| ✅ **Wallet** | [WIAM_09](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Cryptographic assets isolated per Wallet Unit |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: Independence of SCA Elements</strong></summary>

##### Core Requirement: Breach Isolation

Article 9(1) mandates that the compromise of one SCA element must NOT compromise the others. This is the **defense-in-depth** principle applied to multi-factor authentication:

```
┌-----------------------------------------------------------------------------┐
│                    Independence of SCA Elements                             │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌-------------┐    ┌-------------┐    ┌-------------┐                      │
│  │  KNOWLEDGE  │    │ POSSESSION  │    │  INHERENCE  │                      │
│  │   (PIN)     │    │   (Key)     │    │ (Biometric) │                      │
│  └------┬------┘    └------┬------┘    └------┬------┘                      │
│         │                  │                  │                             │
│         ▼                  ▼                  ▼                             │
│  ┌-------------┐    ┌-------------┐    ┌-------------┐                      │
│  │ Validated by│    │ Protected in│    │ Managed by  │                      │
│  │ WSCA/WSCD   │    │ WSCD HW     │    │ OS Enclave  │                      │
│  │ (not stored)│    │ (non-export)│    │ (no access) │                      │
│  └------┬------┘    └------┬------┘    └------┬------┘                      │
│         │                  │                  │                             │
│         └------------┬-----┴------------------┘                             │
│                      │                                                      │
│                      ▼                                                      │
│           ┌---------------------┐                                           │
│           │   INDEPENDENCE      │                                           │
│           │   GUARANTEE         │                                           │
│           │                     │                                           │
│           │  Breach of ONE  ==╱╲==  Does NOT expose OTHERS                  │
│           └---------------------┘                                           │
│                                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                             │
│  SEPARATION MECHANISMS:                                                     │
│  • Knowledge:   Hashed/encrypted, never stored plaintext                    │
│  • Possession:  Hardware-isolated, non-extractable keys                     │
│  • Inherence:   OS-managed, wallet has no template access                   │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### EBA Interpretation: "Technology, Algorithms, and Parameters"

The EBA clarifies that independence requires separation across:

| Dimension | Requirement | EUDI Wallet Implementation |
|-----------|-------------|---------------------------|
| **Technology** | Different hardware/software paths | PIN → encrypted in Keystore; Key → in SE; Biometric → in TEE |
| **Algorithms** | No shared cryptographic key material | PIN encryption key ≠ signing key ≠ biometric comparison |
| **Parameters** | Breach of one doesn't reveal clues about others | PIN failure doesn't change biometric threshold |

##### Breach Scenario Analysis

| Breach Scenario | What Attacker Gains | What Attacker Still Needs | Independence Preserved? |
|-----------------|--------------------|--------------------------|-----------------------|
| **Device stolen** (Possession breach) | Physical access to hardware | PIN + biometric | ✅ Yes |
| **PIN shoulder-surfed** (Knowledge breach) | PIN value | Device + biometric | ✅ Yes |
| **Fingerprint lifted** (Inherence breach) | Biometric replica | Device + PIN (5 fails → PIN required) | ✅ Yes |
| **Device rooted/jailbroken** | OS access | Keys still in SE (hardware-protected) | ⚠️ Partial |
| **PIN + Device stolen** | Both | Biometric (or fallback lockout) | ✅ Yes |
| **All three compromised** | Full access | — | ❌ Game over |

► **Key Insight**: The architecture ensures that an attacker must compromise **all** elements simultaneously, not sequentially exploit one to reach another.

##### Architectural Separation in EUDI Wallet

| SCA Element | Storage Location | Access Control | Shares Data With Others? |
|-------------|------------------|----------------|-------------------------|
| **Knowledge (PIN)** | WSCD (encrypted) | User entry required | ❌ No |
| **Possession (Key)** | WSCD (Secure Enclave/StrongBox) | PIN or biometric unlock | ❌ No (uses, doesn't share) |
| **Inherence (Biometric)** | OS TEE/Secure Enclave | Sensor + neural network | ❌ No |

##### Why Independence is Preserved

1. **PIN is not stored plaintext**: Even if device memory is dumped, attacker gets encrypted/hashed data
2. **Private key never leaves hardware**: WSCD performs signing internally; key material is non-extractable
3. **Biometric template not accessible**: OS Secure Enclave/TEE compares biometric internally; wallet app only sees success/failure boolean
4. **No shared secrets**: Knowledge, possession, and inherence use completely separate cryptographic material

##### Threat Model: Independence Violations

| Threat | Attack Vector | Mitigation | EUDI Wallet Status |
|--------|---------------|------------|-------------------|
| **PIN derived from key** | Side-channel attack on signing | Keys in SE; constant-time algorithms | ✅ Hardware-protected |
| **Biometric derived from PIN** | Correlation attack | PIN and biometric in separate hardware | ✅ Architecturally separate |
| **Key derived from biometric** | Template extraction | Templates never leave OS enclave | ✅ OS-enforced |
| **Rooted device exposes all** | OS compromise | WUA attestation detects root; key in SE survives | ⚠️ SE survives; WUA revoked |
| **Shared memory attack** | RAM dump | PIN wiped after use; key in SE not in RAM | ✅ PIN volatile; key hardware |

##### Multi-Purpose Device Context (Art. 9(2) link)

Article 9(2-3) extends this to **multi-purpose devices** (smartphones). The independence requirement is especially critical here because:

| Multi-Purpose Device Risk | Why It Matters | Mitigation |
|--------------------------|----------------|------------|
| Malware can observe PIN entry | Shoulder-surfing via screen capture | Secure keyboard (OS-level), `FLAG_SECURE` |
| Malware can access keystore | Key extraction | Hardware-backed keystore (SE/StrongBox) |
| Malware can intercept biometric | Fake biometric injection | BiometricPrompt + system UI, attestation |
| User installs malicious app | Privilege escalation | WUA attestation, Play Integrity |

##### Reference Implementation Evidence

| Factor | iOS Component | Android Component | Separation Property |
|--------|--------------|-------------------|-------------------|
| **Knowledge (PIN)** | [`KeychainPinStorageProvider.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-authentication/Sources/Storage/KeychainPinStorageProvider.swift) | [`PrefsPinStorageProvider.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/authentication-logic/src/main/java/eu/europa/ec/authenticationlogic/storage/PrefsPinStorageProvider.kt) | Separate storage controller |
| **Inherence (Biometric)** | [`SystemBiometryController.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-authentication/Sources/Controller/SystemBiometryController.swift) | [`BiometricsAvailability.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/authentication-logic/src/main/java/eu/europa/ec/authenticationlogic/controller/authentication/BiometricsAvailability.kt) | Separate biometry controller |
| **Possession (Keys)** | [`KeyChainController.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-business/Sources/Controller/KeyChainController.swift) | [`KeystoreController.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/business-logic/src/main/java/eu/europa/ec/businesslogic/controller/crypto/KeystoreController.kt) | Separate crypto controller |

► **Note**: Each SCA factor is managed by an independent controller with dedicated key material, satisfying Article 9 independence requirements.


##### Gap Analysis: Independence of Elements

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **IND-1** | PIN and key both protected by WSCD | Low | Clarify: PIN encryption key is distinct from signing key (different key purposes) |
| **IND-2** | Biometric fallback to PIN after 5 failures | Low | By design: Creates alternative path, but still requires knowledge |
| **IND-3** | Rooted/jailbroken device risk | Medium | WUA attestation should fail on compromised devices; clarify behavior |
| **IND-4** | Software WSCD mode (fallback) may have weaker isolation | Medium | TS12 should mandate hardware WSCD for SCA; document fallback limitations |

##### Recommendations for SCA Attestation Rulebook

1. **Document Separation**: Explicitly state that PIN encryption, signing keys, and biometric templates use separate key material
2. **Hardware Requirement**: Mandate hardware-backed WSCD for SCA compliance; software-only as fallback with reduced LoA
3. **Attestation on Compromise**: Specify that WUA attestation should fail on rooted/jailbroken devices
4. **Independence Testing**: Recommend PSPs verify that compromise of one element in testing doesn't reveal others

</details>

**Context**: Independence is ensured by architectural separation:
- **Knowledge** (PIN): Never stored in plaintext; validated by WSCA/WSCD
- **Inherence** (biometric): Managed by OS (Face ID / BiometricPrompt), not accessible to wallet app
- **Possession** (key): In WSCA/WSCD, protected by biometric/PIN check before use

Breach of one does not expose the others:
- Stolen device (possession breach) → Still need biometric/PIN
- Shoulder-surfed PIN (knowledge breach) → Still need device + biometric
- Lifted fingerprint (inherence breach) → Still need device + PIN fallback

---

#### [Article 9(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#009.002)

► "Payment service providers shall adopt security measures, where any of the elements of strong customer authentication or the authentication code itself is used through a multi-purpose device, to mitigate the risk which would result from that multi-purpose device being compromised."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | TEE / Secure Enclave | All crypto operations in hardware-isolated environment |
| ✅ **Wallet** | App integrity | WUA contains app attestation (Play Integrity / App Attest) |

**Status**: ✅ Fully Supported

<details>
<summary><strong>🔍 Deep-Dive: Multi-Purpose Device Risk Mitigation</strong></summary>

##### Core Requirement: Smartphone Security for SCA

Article 9(2) acknowledges that smartphones are "multi-purpose devices" that can be used for both transaction initiation AND authentication. This creates unique risks that must be mitigated through security measures.

```
┌-----------------------------------------------------------------------------┐
│                  Multi-Purpose Device Security Architecture                 │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │                     SMARTPHONE (Multi-Purpose)                      │    │
│  │                                                                     │    │
│  │   ┌-------------------------------------------------------------┐   │    │
│  │   │               APPLICATION LAYER (Rich OS)                   │   │    │
│  │   │   • Banking apps, browsers, third-party apps                │   │    │
│  │   │   • Malware risk: HIGH                                      │   │    │
│  │   │   • Data isolation: Process-level only                      │   │    │
│  │   └-------------------------------------------------------------┘   │    │
│  │                              ▼                                      │    │
│  │   ┌-------------------------------------------------------------┐   │    │
│  │   │        TRUSTED EXECUTION ENVIRONMENT (TEE/SE)               │   │    │
│  │   │   • Secure Enclave (iOS) / StrongBox/TEE (Android)          │   │    │
│  │   │   • Malware risk: VERY LOW                                  │   │    │
│  │   │   • Hardware isolation from Rich OS                         │   │    │
│  │   │                                                             │   │    │
│  │   │   Stores: Private keys, PIN hash, biometric templates       │   │    │
│  │   │   Operations: Signing, key derivation, biometric match      │   │    │
│  │   └-------------------------------------------------------------┘   │    │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
│  RISK: Compromise of Rich OS should NOT compromise SCA elements in TEE      │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Why Multi-Purpose Devices Are Risky

| Risk Factor | Description | Mitigation Strategy |
|-------------|-------------|---------------------|
| **Malware** | Apps can install malicious code | TEE isolation, app attestation |
| **Shared memory** | Other apps may access unprotected data | Process isolation, encryption |
| **Same-device attack** | Transaction initiation + authentication on one device | Channel separation, TEE signatures |
| **Screen overlay** | Fake UI can mislead user | OS-level overlay detection, trusted display |
| **Keylogger** | Capture PIN/password input | Secure keyboard, biometric fallback |
| **Rooting/Jailbreaking** | Bypasses OS security | WUA integrity check, device attestation |

##### EUDI Wallet Mitigation Architecture

| SCA Element | Where Stored | Protection Mechanism |
|-------------|-------------|---------------------|
| **Knowledge (PIN)** | TEE/SE (hash only) | Never in app memory; validated in hardware |
| **Possession (Key)** | WSCD (SE/StrongBox) | Non-extractable; signs in hardware |
| **Inherence (Biometric)** | OS Secure Enclave | Never exported; match happens in hardware |

##### Isolation Layers on Smartphones

```
┌-----------------------------------------------------------------------------┐
│                       SCA Element Isolation on Smartphone                   │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  Layer 5: APPLICATION (Wallet App)                                          │
│           └-- Requests signatures, receives results                         │
│           └-- CANNOT access: Keys, PIN, biometric templates                 │
│                                                                             │
│  Layer 4: ANDROID KEYSTORE / iOS KEYCHAIN                                   │
│           └-- OS-mediated access to cryptographic operations                │
│           └-- Enforces user authentication before key use                   │
│                                                                             │
│  Layer 3: TRUSTED EXECUTION ENVIRONMENT (TEE)                               │
│           └-- Runs Trusted Applications (TAs) in isolated memory            │
│           └-- Hardware-separated from Rich OS                               │
│                                                                             │
│  Layer 2: SECURE ELEMENT (SE) / StrongBox                                   │
│           └-- Dedicated security chip (tamper-resistant)                    │
│           └-- CC EAL5+ / FIPS 140-2/3 certified                             │
│                                                                             │
│  Layer 1: HARDWARE ROOT OF TRUST                                            │
│           └-- Secure boot, hardware attestation key                         │
│           └-- Unmodifiable by software                                      │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### FIDO Alignment for SCA

FIDO standards provide a proven framework for multi-purpose device security:

| FIDO Principle | PSD2 Art. 9(2) Alignment | EUDI Wallet Implementation |
|----------------|-------------------------|---------------------------|
| **Local verification** | Factor never sent over network | PIN validated locally in WSCA |
| **Proof of possession** | Device key stays on device | WSCD key signs KB-JWT |
| **Attestation** | Device integrity verified | WUA contains FIDO-style attestation |
| **Phishing resistance** | Origin-bound keys | Client ID binding in OID4VP |

##### EBA Guidance on Multi-Purpose Devices

The EBA has clarified multi-purpose device requirements:

| EBA Guidance | Implementation |
|--------------|----------------|
| "Separate secure execution environment" | TEE/SE mandatory for key storage |
| "Mechanisms to detect alteration" | Play Integrity / App Attest |
| "Mitigate consequences of compromise" | Revocation mechanisms per Art. 9(3)(c) |
| "Independence of elements" | Factor isolation in separate hardware |

► **EBA Q&A 2018/4039**: "The RTS allows transactions and authentication to occur on the same device if all authenticating factors are adequately separated."

##### Platform Hardware Isolation

► **Note**: Multi-purpose device security relies on OS-level hardware isolation (Secure Enclave, StrongBox/TEE). The wallet leverages these via platform APIs and attestation services.

| Platform | Component | Isolation Mechanism |
|----------|-----------|---------------------|
| **iOS** | Secure Enclave | Hardware-isolated crypto processor, separate from main CPU |
| **iOS** | App Attest | Apple-signed attestation of app integrity |
| **Android** | StrongBox | Dedicated secure element (discrete chip when available) |
| **Android** | TEE | TrustZone-based isolation for devices without StrongBox |
| **Android** | Play Integrity | Google-signed device/app attestation |


##### Threat Model: Multi-Purpose Device Attacks

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|--------|
| **Malware on device** | Steal keys from app memory | Keys only in TEE/SE | ✅ Mitigated |
| **App repackaging** | Modified wallet app | App attestation in WUA | ✅ Mitigated |
| **Rooted/jailbroken device** | Bypass OS protections | WUA integrity check | ✅ Mitigated |
| **Screen overlay attack** | Fake UI hides real transaction | OS overlay detection + trusted display | ⚠️ Partial |
| **Accessibility abuse** | Automation attacks | Limit accessibility access | ⚠️ Platform-dependent |
| **Same-device phishing** | Malicious app mimics wallet | User education + app store policies | ⚠️ Partial |

##### Gap Analysis: Multi-Purpose Device Security

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **MPD-1** | No minimum TEE/SE requirement specified | Medium | Define minimum hardware security level (e.g., StrongBox for Android) |
| **MPD-2** | Screen overlay protection varies by OS | Medium | Document platform-specific overlay countermeasures |
| **MPD-3** | Software-only TEE (some Android devices) | Low | WUA should indicate hardware vs software TEE |
| **MPD-4** | Accessibility service abuse not addressed | Medium | Guidance on limiting accessibility access during SCA |

##### Recommendations for SCA Attestation Rulebook

1. **Minimum Hardware Requirement**: Mandate SE or hardware-backed TEE (not software-only)
2. **Attestation Content**: WUA should include TEE type (SE vs TEE vs software)
3. **Overlay Protection**: Document platform-specific requirements for overlay detection
4. **FIDO Alignment**: Reference FIDO UAF/FIDO2 as implementation guidance
5. **Fallback Scenarios**: Define behavior when hardware security is unavailable

</details>

**Context**: Article 9(3) specifies mitigating measures for multi-purpose devices — see below.

---

#### [Article 9(3)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#009.003)

► "For the purposes of paragraph 2, the mitigating measures shall include each of the following: (a) the use of separated secure execution environments through the software installed inside the multi-purpose device; (b) mechanisms to ensure that the software or device has not been altered by the payer or by a third party; (c) where alterations have taken place, mechanisms to mitigate the consequences thereof."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | TEE / Secure Enclave | (a) Separated secure execution environment |
| ✅ **Wallet** | App attestation (WUA) | (b) Play Integrity / App Attest verifies app integrity |
| ✅ **Wallet** | [WURevocation_09](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2322-topic-38---wallet-unit-revocation) | (c) Key revocation if compromise detected |

**Status**: ✅ Fully Supported

---

## Chapter III — Confidentiality and Integrity of PSC

### [Article 22](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_22) — Personalised security credentials

► "Payment service providers shall ensure the confidentiality and integrity of the personalised security credentials of the payment service user, including authentication codes, during all phases of the authentication."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WIAM_20](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Private keys never leave WSCA/WSCD |
| ✅ **Wallet** | [OID4VP](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html), [HAIP](https://openid.net/specs/openid4vc-high-assurance-interoperability-profile-1_0.html) | TLS for transit protection |
| ✅ **Wallet** | Device encryption | At-rest encryption by iOS/Android |

**Status**: ✅ Fully Supported

**Context**: PSC in wallet context:
- **Knowledge** (PIN): Validated locally, never transmitted
- **Possession** (key): Non-extractable, used only for signing
- **Inherence** (biometric): Managed by OS, never exported

---

### [Article 24](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_24) — Secure execution environment

► "Payment service providers shall ensure that only the payment service user is associated, in a secure manner, with the personalised security credentials, the authentication devices and the software. For the purpose of paragraph 1, payment service providers shall ensure that each of the following requirements is met: (a) the association of the payment service user's identity with personalised security credentials, authentication devices and software is carried out in secure environments under the payment service provider's responsibility comprising at least the payment service provider's premises, the internet environment provided by the payment service provider or other similar secure websites used by the payment service provider and its automated teller machine services, and taking into account risks associated with devices and underlying components used during the association process that are not under the responsibility of the payment service provider; (b) the association by means of a remote channel of the payment service user's identity with the personalised security credentials and with authentication devices or software is performed using strong customer authentication."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | WSCA/WSCD | Secure Enclave (iOS) / StrongBox / TEE (Android) |
| ✅ **Wallet** | [WIAM_08](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Wallet Provider verifies WSCA/WSCD certification |

**Status**: ✅ Fully Supported

---

## Exemptions (Articles 10-18)

### [Article 18](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_18) — Transaction Risk Analysis (TRA)

► "Payment service providers shall be allowed not to apply strong customer authentication where the payer initiates a remote electronic payment transaction identified by the payment service provider as posing a low level of risk according to the transaction monitoring mechanisms referred to in Article 2 and in paragraph 2(c) of this Article."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ❌ **PSP** | — | PSP implements TRA logic |
| ⚠️ **Evidence** | TS12 response | Wallet can still be invoked, but PSP decides to exempt |

**Status**: ❌ PSP Decision

**Context**: TRA is a PSP-side decision based on fraud rates, transaction amounts, and risk scoring. The wallet is not involved in exemption decisions. However, the PSP could:
1. Not invoke wallet SCA at all (silent exemption)
2. Invoke wallet with reduced requirements (future extension)

---

# 7. Dynamic Linking

► **Regulatory Basis**:
► - [PSD2 Directive Art. 97(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366#097.002): "...the payment service provider applies strong customer authentication that includes elements which dynamically link the transaction to a specific amount and a specific payee."
► - [RTS Art. 5](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_5): Dynamic linking

► "With regard to the initiation of electronic payment transactions as referred to in paragraph 1(b), Member States shall ensure that, for electronic remote payment transactions, the payment service provider applies strong customer authentication that includes elements which dynamically link the transaction to a specific amount and a specific payee."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [SUA_04](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2313-topic-20---strong-user-authentication-for-electronic-payments) | Wallet includes transactional data representation in response |
| ✅ **Wallet** | [SUA_05](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2313-topic-20---strong-user-authentication-for-electronic-payments) | Transactional data included in device binding signature (KB-JWT) |
| ✅ **Wallet** | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) | `transaction_data_hashes` in KB-JWT cryptographically binds amount + payee |

**Status**: ✅ Fully Supported

**Context**: The OID4VP `transaction_data` parameter allows the PSP to pass payment details (amount, payee, IBAN). These are hashed and included in the KB-JWT's `transaction_data_hashes` array. The user sees the transaction on-screen before approving with biometric/PIN. The signature over this hash constitutes the dynamic link.

**Technical Detail** ([TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response)):
```
KB-JWT contains:
  "transaction_data_hashes": ["sha-256 hash of transaction details"],
  "transaction_data_hashes_alg": "sha-256"
```

► ⚠️ **Format Note**: Dynamic linking via `transaction_data_hashes` is **OID4VP / SD-JWT-VC only**. TS12 v1.0 does not specify mDOC (ISO 18013-5) transaction binding. See RTS Art. 5(1)(b) for details.


---

#### [Article 5(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.001) — General requirement

► "Where payment service providers apply strong customer authentication in accordance with Article 97(2) of Directive (EU) 2015/2366, in addition to the requirements of Article 4 of this Regulation, they shall also adopt security measures that meet each of the following requirements: (a) the payer is made aware of the amount of the payment transaction and of the payee; (b) the authentication code generated is specific to the amount of the payment transaction and the payee agreed to by the payer when initiating the transaction; (c) the authentication code accepted by the payment service provider corresponds to the original specific amount of the payment transaction and to the identity of the payee agreed to by the payer; (d) any change to the amount or the payee results in the invalidation of the authentication code generated."

**Status**: ➖ Prelude to sub-requirements. See Article 5(1)(a–d) and 5(2–3) below.

<details>
<summary><strong>🔍 Deep-Dive: Dynamic Linking — The Four Pillars</strong></summary>

##### Core Concept: Transaction-Bound Authentication

Dynamic linking is the **cornerstone** of PSD2 SCA for payment transactions. It ensures that the authentication code (digital signature) is **cryptographically bound** to the specific transaction details, making it impossible for attackers to reuse authentication for different transactions.

```
┌-----------------------------------------------------------------------------┐
│                    Dynamic Linking: The Four Pillars                        │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │                     PILLAR 1: AWARENESS (5(1)(a))                   │    │
│  │                                                                     │    │
│  │   "Payer is made aware of the amount and payee"                    │     │
│  │                                                                     │    │
│  │   IMPLEMENTATION: Secure display of transaction details            │     │
│  │   • Amount: €100.00                                                 │    │
│  │   • Payee: "ACME Corporation"                                       │    │
│  │   • IBAN: DE89370400440532013000                                    │    │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                              ▼                                              │
│  ┌---------------------------------------------------------------------┐    │
│  │                     PILLAR 2: BINDING (5(1)(b))                     │    │
│  │                                                                     │    │
│  │   "Auth code is SPECIFIC to amount and payee"                      │     │
│  │                                                                     │    │
│  │   IMPLEMENTATION: Cryptographic hash inclusion                      │    │
│  │   • transaction_data_hashes: [hash(amount, payee)]                 │     │
│  │   • Signed by user's private key in Secure Enclave                  │    │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                              ▼                                              │
│  ┌---------------------------------------------------------------------┐    │
│  │                     PILLAR 3: VERIFICATION (5(1)(c))                │    │
│  │                                                                     │    │
│  │   "PSP verifies code CORRESPONDS to original amount/payee"         │     │
│  │                                                                     │    │
│  │   IMPLEMENTATION: Server-side comparison                            │    │
│  │   • PSP recomputes hash from original request                       │    │
│  │   • Compares with hash in signed attestation                        │    │
│  │   • Reject if mismatch                                              │    │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                              ▼                                              │
│  ┌---------------------------------------------------------------------┐    │
│  │                     PILLAR 4: INVALIDATION (5(1)(d))                │    │
│  │                                                                     │    │
│  │   "Any CHANGE to amount or payee INVALIDATES the code"             │     │
│  │                                                                     │    │
│  │   IMPLEMENTATION: Automatic by cryptographic design                 │    │
│  │   • Hash changes if amount/payee changes                            │    │
│  │   • Signature verification fails                                    │    │
│  │   • Transaction rejected                                            │    │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### The WYSIWYS Principle

**"What You See Is What You Sign"** — Dynamic linking enforces this principle:

| Principle Aspect | Requirement | EUDI Wallet Implementation |
|------------------|-------------|---------------------------|
| **Display fidelity** | User sees exact transaction details | TS12 Level 1 display |
| **Signing scope** | Signature covers displayed data | `transaction_data_hashes` |
| **Tampering detection** | Any modification detected | Hash comparison |
| **User confirmation** | Explicit consent before signing | Biometric/PIN gate |

##### Why Dynamic Linking Matters

| Attack | Without Dynamic Linking | With Dynamic Linking |
|--------|------------------------|---------------------|
| **Man-in-the-Middle** | Attacker changes amount/payee after auth | ❌ Hash mismatch detected |
| **Replay Attack** | Reuse auth code for different transaction | ❌ Different hash = invalid |
| **Session Hijacking** | Use session token for unauthorized tx | ❌ Signature tied to specific tx |
| **Malware injection** | Modify transaction on compromised device | ⚠️ Mitigated by secure display |

##### EUDI Wallet Dynamic Linking Flow

```
┌-----------------------------------------------------------------------------┐
│                    Dynamic Linking End-to-End Flow                          │
├-----------------------------------------------------------------------------┤
│                                                                             │
│   1. PSP REQUEST                                                            │
│   --------------                                                            │
│   PSP → Wallet:                                                             │
│   {                                                                         │
│     "transaction_data": {                                                   │
│       "amount": "100.00",                                                   │
│       "currency": "EUR",                                                    │
│       "payee": "ACME Corp",                                                 │
│       "iban": "DE89370400440532013000"                                      │
│     },                                                                      │
│     "transaction_data_hashes": ["sha256:abc123..."]                         │
│   }                                                                         │
│                                                                             │
│   2. USER AWARENESS (5(1)(a))                                               │
│   ---------------------------                                               │
│   Wallet displays: "Pay €100.00 to ACME Corp?"                              │
│   User reviews amount + payee before authenticating                         │
│                                                                             │
│   3. CRYPTOGRAPHIC BINDING (5(1)(b))                                        │
│   ----------------------------------                                        │
│   User authenticates (biometric/PIN)                                        │
│   Secure Enclave signs:                                                     │
│   • SCA Attestation includes transaction_data_hashes                        │
│   • Signature: ECDSA(nonce || transaction_data_hashes)                      │
│                                                                             │
│   4. PSP VERIFICATION (5(1)(c))                                             │
│   -----------------------------                                             │
│   PSP receives signed attestation                                           │
│   PSP computes: hash(original_request.transaction_data)                     │
│   PSP compares: computed_hash == attestation.transaction_data_hashes        │
│   If match: ✅ Accept transaction                                            │
│   If mismatch: ❌ Reject transaction                                         │
│                                                                             │
│   5. INVALIDATION (5(1)(d))                                                 │
│   -------------------------                                                 │
│   If attacker modifies amount/payee in transit:                             │
│   • hash(modified_data) ≠ attestation.transaction_data_hashes               │
│   • Signature verification fails at PSP                                     │
│   • Transaction rejected                                                    │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Relationship to Article 4 (Authentication Code)

Article 5 **builds upon** Article 4:

| Article 4 | Article 5 |
|-----------|-----------|
| Auth code from 2+ SCA factors | Same auth code, now **bound** to transaction |
| One-time use | One-time use **for this specific transaction** |
| Forgery-resistant | ALSO tamper-evident for transaction data |
| Elements independent | Transaction data included in signed payload |

##### EBA Guidance on Dynamic Linking

| EBA Statement | EUDI Wallet Alignment |
|---------------|----------------------|
| "Information integrity must be protected" | ECDSA signature over transaction hash |
| "User must be informed of what they authorize" | TS12 Level 1 display |
| "Code must be linked to specific transaction" | `transaction_data_hashes` in VP |
| "Change to amount/payee must invalidate" | Hash-based detection |

##### Gap Analysis: Dynamic Linking Overview

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **DL-1** | mDOC format not specified for dynamic linking | Medium | TS12 should define mDOC transaction binding |
| **DL-2** | Secure display on compromised devices | High | Clarify TEE display requirements |
| **DL-3** | Hash algorithm not specified in RTS | Low | Document SHA-256 as default |
| **DL-4** | Multi-transaction (batch) linking complexity | Medium | See Art. 5(3) for batch handling |

##### Recommendations for SCA Attestation Rulebook

1. **Hash Algorithm**: Specify SHA-256 for `transaction_data_hashes`
2. **Display Security**: Mandate TEE-protected display where available
3. **mDOC Binding**: Define how ISO 18013-5 mDOC binds to transaction data
4. **Timeout Integration**: Link Art. 5 to Art. 4(3)(d) session timeout
5. **Error Handling**: Define PSP behavior on hash mismatch (reject + log)
6. **Batch Payments**: Reference Art. 5(3) for bulk payment handling

</details>

---

#### [Article 5(1)(a)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.001) — Payer awareness of transaction details

► "(a) the payer is made aware of the amount of the payment transaction and of the payee;"

**Core Requirement**: Before authenticating, the payer must be **explicitly shown** the exact transaction details (amount + payee) they are about to authorize. This is the **first pillar** of PSD2 dynamic linking and embodies the **"What You See Is What You Sign" (WYSIWYS)** principle.

| Awareness Element | Fulfillment | Reference | Implementation |
|-------------------|-------------|-----------|----------------|
| **Amount displayed** | ✅ Wallet | TS12 §3.3.1 | Level 1 (prominent) display |
| **Currency displayed** | ✅ Wallet | TS12 §4.3.1 | ISO 4217 code + symbol |
| **Payee name displayed** | ✅ Wallet | TS12 §3.3.1 | Level 1 (prominent) display |
| **Payee identifier** | ✅ Wallet | [SUA_06](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2313-topic-20---strong-user-authentication-for-electronic-payments) | IBAN at Level 2 |
| **TPP identity (if applicable)** | ✅ Wallet | TS12 §4.3.1 | PISP/AISP details |
| **Localized labels** | ✅ Wallet | TS12 §3.3.3 | Multi-language UI catalog |

**Status**: ✅ **Fully Supported** via mandatory display requirements

---

**Deep Dive: The WYSIWYS Principle**

"What You See Is What You Sign" (WYSIWYS) is a foundational security principle ensuring:

```
┌---------------------------------------------------------------------┐
│   WYSIWYS Guarantee                                                 │
│   ---------------------------------------------------------------   │
│                                                                     │
│   Displayed Content  ======================  Signed Content         │
│         ↓                                          ↓                │
│   ┌-------------┐                          ┌-------------┐          │
│   │ €150.00     │       MUST               │ €150.00     │          │
│   │ ACME Corp   │  ======================  │ ACME Corp   │          │
│   │ DE89...     │       MATCH              │ DE89...     │          │
│   └-------------┘                          └-------------┘          │
│                                                                     │
│   If User sees €150.00 to ACME, the signed hash MUST be for         │
│   exactly €150.00 to ACME — nothing else.                           │
└---------------------------------------------------------------------┘
```

**EBA Position**: The EBA emphasizes that even with phishing-resistant authenticators, the display of transaction details in a **PSP-controlled environment** is crucial. A compromised application could mislead users about transaction details even if the authenticator signs correctly.

---

**Threat Model: What Payer Awareness Prevents**

| Attack Vector | Description | How Art. 5(1)(a) Mitigates |
|---------------|-------------|---------------------------|
| **Social Engineering** | Attacker convinces user to authorize "refund" that's actually a payment | User sees real amount/payee |
| **Man-in-the-Middle** | Attacker intercepts and modifies transaction between merchant and bank | Wallet displays actual data from PSP request |
| **Malware Overlay** | Fake screen overlays real app to hide true transaction | TS12 hierarchy levels + trusted display (see Art. 5(2)) |
| **Authorized Push Payment (APP) Fraud** | User tricked into authorizing legitimate-looking payment | Explicit payee identity + IBAN visibility |
| **Transaction Substitution** | TPP shows one amount, sends different to PSP | Hash mismatch detection + separate PISP disclosure |

**Critical Dependency**: Payer awareness only works if the **display itself is trustworthy**. See Article 5(2) for display integrity requirements.

---

**TS12 Display Rendering Requirements (§3.3.1)**

TS12 mandates a structured approach to displaying transaction data:

**UI Mockup** (conformant Wallet display):

```
┌-----------------------------------------------------------------┐
│  EUDI Wallet                                          ☰ Menu    │
├-----------------------------------------------------------------┤
│                                                                 │
│  ╔===========================================================╗  │
│  ║                   PAYMENT CONFIRMATION                    ║  │
│  ║                                                           ║  │
│  ║   Amount:     €150.00                    [Level 1]       ║   │
│  ║   Payee:      ACME Corporation           [Level 1]       ║   │
│  ║                                                           ║  │
│  ║   -----------------------------------------------------  ║   │
│  ║                                                           ║  │
│  ║   IBAN:       DE89 3704 0044 0532 0130 00  [Level 2]    ║    │
│  ║   Date:       2025-01-28                   [Level 2]    ║    │
│  ║                                                           ║  │
│  ║   -----------------------------------------------------  ║   │
│  ║                                                           ║  │
│  ║   ⓘ Initiated by: PaymentApp (PISP)      [Level 2]      ║    │
│  ║     Domain: paymentapp.example.com                       ║   │
│  ║                                                           ║  │
│  ╚===========================================================╝  │
│                                                                 │
│   ┌---------------------┐    ┌---------------------┐            │
│   │   Cancel Payment    │    │  [🔐 Confirm Payment │            │
│   │                     │    │      Use Face ID]    │           │
│   └---------------------┘    └---------------------┘            │
│                                                                 │
│   🔒 SCA Attestation: Your Bank AG (Issuer)                      │
└-----------------------------------------------------------------┘
```

**Visualization Hierarchy** (TS12 §3.3.1):

| Level | Requirement | Typical Fields | Rationale |
|-------|-------------|----------------|-----------|
| **1** | MUST be _prominently_ displayed | Amount, Payee name | User must see immediately |
| **2** | MUST be displayed on main screen | IBAN, Execution date, PISP | Important but secondary |
| **3** | MAY be on supplementary screen | Transaction ID, Timestamp | Detail for verification |
| **4** | MAY be omitted from display | Internal reference, Schema URI | Technical metadata only |

► **Default Behavior**: If no `visualisation` level is specified, Wallet applies Level 3 (must display on request).

---

**Localization Requirements (TS12 §3.3.3)**

TS12 mandates multi-language support to ensure all users understand transaction details:

```json
{
  "affirmative_action_label": [
    { "lang": "de", "value": "Zahlung bestätigen" },
    { "lang": "en", "value": "Confirm Payment" },
    { "lang": "fr", "value": "Confirmer le paiement" }
  ],
  "denial_action_label": [
    { "lang": "de", "value": "Zahlung abbrechen" },
    { "lang": "en", "value": "Cancel Payment" }
  ],
  "security_hint": [
    { "lang": "en", "value": "Review payment details carefully before confirming." }
  ]
}
```

**String Length Limits**:
- `affirmative_action_label`: 30 characters max
- `denial_action_label`: 30 characters max
- `transaction_title`: 50 characters max
- `security_hint`: 250 characters max

**Failure Behavior**: If localized labels are unavailable, Wallet **SHALL cease processing** and inform the user.

---

**TPP Scenario: Dual Identity Disclosure**

When a Third-Party Provider (PISP/AISP) initiates SCA, the Wallet displays **both**:

| Party | Displayed Element | Source | Purpose |
|-------|------------------|--------|---------|
| **TPP (PISP)** | Legal name, Brand name, Domain | `pisp` object in transaction_data | User knows who initiated |
| **PSP (Issuer)** | Attestation issuer name | SCA Attestation metadata | User knows whose credential is used |

**PISP Object Schema** (TS12 §4.3.1):
```json
{
  "pisp": {
    "legal_name": "PaymentApp GmbH",
    "brand_name": "PaymentApp",
    "domain_name": "paymentapp.example.com"
  }
}
```

**Security Note**: The `domain_name` is **verified by eIDAS QWAC certificate**, providing cryptographic assurance of the TPP's identity.

---

**Accessibility Considerations**

For inclusive design, compliant Wallet implementations should support:

| Requirement | Industry Best Practice | WCAG Reference |
|-------------|----------------------|----------------|
| **Screen reader compatibility** | All amounts/payees read aloud | WCAG 2.1 Level AA |
| **Sufficient color contrast** | Min 4.5:1 for text | WCAG 1.4.3 |
| **Non-color-dependent status** | Icons + text for errors | WCAG 1.4.1 |
| **Accessible number readout** | Currency symbols spoken correctly | Custom |
| **Simple language** | Avoid financial jargon | Plain language |

► **Note**: TS12 does not explicitly mandate accessibility standards, but [ARF Topic 53 (Accessibility)](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2353-topic-53---accessibility) references EU accessibility requirements (European Accessibility Act).

---

**Reference Implementation**

| Platform | Component | Function |
|----------|-----------|----------|
| **iOS** | [`BaseRequestViewModel.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/feature-common/Sources/UI/Request/BaseRequestViewModel.swift#L148-L165) (lines 148-165) | Transaction detail rendering via `onReceivedItems` |
| **Android** | [`RequestDataUi.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/common-feature/src/main/java/eu/europa/ec/commonfeature/ui/request/model/RequestDataUi.kt#L29-L52) (lines 29-52) | Payment confirmation UI model |

---

**Gap Analysis: Trust Assumptions**

► ⚠️ **Assumption Gap**: Payer awareness relies on the user **actually reading** the displayed information before confirming. No technical mechanism enforces this.

| Gap | Risk | Mitigation |
|-----|------|------------|
| **User fatigue** | Habitual approval without reading | Security hints, unusual amount warnings |
| **Screen size constraints** | Critical info may require scrolling | TS12 Level 1 ensures prominence |
| **Cognitive accessibility** | Complex transactions may confuse | Simple language, plain currency formats |
| **Voice/gesture auth bypass** | Quick biometric may skip review | Mandatory display duration (not specified) |

**Recommendation**: SCA Attestation Rulebooks should consider requiring **minimum display duration** before enabling the confirmation button (similar to consent screens in other regulatory contexts).

---

► 📌 **Industry Validation**: [ETPPA confirmed](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439#discussioncomment-14850895) (Nov 2025) that TPPs "intend to take full advantage of the EUDIW to support the capture of Embedded SCA" for PSD2 API-initiated payments, citing eIDAS Article 5f(2) requiring ASPSPs to accept Wallet-based SCA.

---



#### [Article 5(1)(b)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.001) — Authentication code linked to amount and payee

► "(b) the authentication code generated is specific to the amount of the payment transaction and the payee agreed to by the payer when initiating the transaction;"

**Core Requirement**: This is the heart of **dynamic linking**—the authentication code must be cryptographically bound to the exact transaction details (amount + payee) that the user agreed to. This prevents an attacker from taking a valid authentication code and applying it to a different transaction.

| Binding Mechanism | Fulfillment | Reference | Implementation |
|-------------------|-------------|-----------|----------------|
| **Transaction Hash in Signature** | ✅ Wallet | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications) | `transaction_data_hashes` in KB-JWT |
| **Payload Schema Validation** | ✅ Wallet | TS12 §4.3 | JSON Schema validation of amount/payee |
| **User Consent Display** | ✅ Wallet | TS12 §3.3.1 | Amount/payee shown before signature |
| **Device Binding Signature** | ✅ Wallet | [SUA_05](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2313-topic-20---strong-user-authentication-for-electronic-payments) | WSCA-protected key signs KB-JWT |

**Status**: ✅ **Fully Supported** via cryptographic hash binding

---

**Deep Dive: Cryptographic Binding Architecture**

The binding between authentication code and transaction is achieved through a **hash-then-sign** mechanism:

```
┌-----------------------------------------------------------------┐
│  PSP/RP Request                                                 │
│  ┌---------------------------------------------------------┐    │
│  │ transaction_data: {                                      │   │
│  │   type: "urn:eudi:sca:payment:1",                        │   │
│  │   payload: {                                             │   │
│  │     transaction_id: "TX-2025-001234",                    │   │
│  │     payee: {                                             │   │
│  │       name: "ACME Corporation",                          │   │
│  │       id: "DE89370400440532013000"   ← IBAN              │   │
│  │     },                                                   │   │
│  │     currency: "EUR",                                     │   │
│  │     amount: 150.00                                       │   │
│  │   }                                                      │   │
│  │ }                                                        │   │
│  └---------------------------------------------------------┘    │
│                           │                                     │
│            Base64url encode + SHA-256                           │
│                           ▼                                     │
│  hash = "OJcnQQByvV1iTYxiQQQx4dact-TNnSG-Ku_cs_6g55Q"           │
└-----------------------------------------------------------------┘
                            ▼
┌-----------------------------------------------------------------┐
│  Wallet Unit                                                    │
│  ┌---------------------------------------------------------┐    │
│  │ 1. Display to User:                                      │   │
│  │    ┌---------------------------------------------------┐ │   │
│  │    │  Payment Confirmation                             │ │   │
│  │    │  -------------------------------------------------│ │   │
│  │    │  Amount:  €150.00                     [Level 1]   │ │   │
│  │    │  Payee:   ACME Corporation            [Level 1]   │ │   │
│  │    │  IBAN:    DE89 3704 0044 0532 0130 00 [Level 2]   │ │   │
│  │    │                                                   │ │   │
│  │    │  [Confirm Payment]      [Cancel Payment]          │ │   │
│  │    └---------------------------------------------------┘ │   │
│  │                                                          │   │
│  │ 2. User confirms → SCA (PIN/biometric)                   │   │
│  │                                                          │   │
│  │ 3. Generate KB-JWT with transaction hash:                │   │
│  │    {                                                     │   │
│  │      "aud": "x509_san_dns:psp.example.com",              │   │
│  │      "iat": 1741269093,                                  │   │
│  │      "jti": "deeec2b0-3bea-4477-...",   ← Auth Code      │   │
│  │      "nonce": "bUtJdjJESWdm...",                         │   │
│  │      "transaction_data_hashes": [                        │   │
│  │        "OJcnQQByvV1i..."    ← BINDS to €150/ACME         │   │
│  │      ],                                                  │   │
│  │      "transaction_data_hashes_alg": "sha-256",           │   │
│  │      "amr": [                                            │   │
│  │        {"knowledge": "pin_6_or_more_digits"},            │   │
│  │        {"inherence": "fingerprint_device"}               │   │
│  │      ]                                                   │   │
│  │    }                                                     │   │
│  │                                                          │   │
│  │ 4. Sign KB-JWT with WSCA-protected private key           │   │
│  └---------------------------------------------------------┘    │
└-----------------------------------------------------------------┘
                            ▼
              ECDSA Signature = Authentication Code
              Cryptographically bound to €150.00 + ACME Corp
```

---

**TS12 Transaction Data Schema (Payment Confirmation)**

TS12 §4.3.1 defines the complete `urn:eudi:sca:payment:1` payload schema:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **`transaction_id`** | string | ✅ | Unique identifier of RP's interaction |
| **`date_time`** | string (ISO8601) | ❌ | Timestamp of interaction |
| **`payee.name`** | string | ✅ | Name of payee/merchant |
| **`payee.id`** | string | ✅ | IBAN or other payment identifier |
| **`payee.logo`** | string (URL) | ❌ | Payee logo for display |
| **`payee.website`** | string (URL) | ❌ | Payee website |
| **`currency`** | string (ISO4217) | ✅ | `"EUR"`, `"USD"`, etc. |
| **`amount`** | number | ✅ | Major.minor format (e.g., `150.00`) |
| **`amount_estimated`** | boolean | ❌ | For MITs where amount may vary |
| **`execution_date`** | string (ISO8601) | ❌ | When payment executes |
| **`sct_inst`** | boolean | ❌ | Request SEPA Instant Transfer |
| **`pisp.*`** | object | ❌ | TPP details if PISP-facilitated |
| **`recurrence.*`** | object | ❌ | For recurring payments |

**Complete JSON Example** (SEPA Credit Transfer):

```json
{
  "type": "urn:eudi:sca:payment:1",
  "credential_ids": ["SCA_ATT_ACME_BANK_001"],
  "transaction_data_hashes_alg": "sha-256",
  "payload": {
    "transaction_id": "TX-2025-001234",
    "date_time": "2025-01-27T15:30:00Z",
    "payee": {
      "name": "ACME Corporation",
      "id": "DE89370400440532013000",
      "logo": "https://acme.com/logo.png",
      "website": "https://acme.com"
    },
    "currency": "EUR",
    "amount": 150.00,
    "execution_date": "2025-01-28",
    "sct_inst": true
  }
}
```

---

**Supported Transaction Types**

TS12 defines four built-in transaction data types:

| Type URN | Use Case | Key Fields |
|----------|----------|------------|
| `urn:eudi:sca:payment:1` | Payment confirmation (SEPA, cards) | amount, payee, currency |
| `urn:eudi:sca:login_risk_transaction:1` | Login + risk-based auth | action, service |
| `urn:eudi:sca:account_access:1` | AIS consent | aisp, description |
| `urn:eudi:sca:emandate:1` | E-mandate creation | creditor, amount bounds |

SCA Attestation Rulebooks may define additional transaction types with custom schemas.

---

**Visualization Hierarchy (TS12 §3.3.1)**

TS12 mandates that amount and payee are **prominently displayed**:

| Level | Requirement | Typical Fields |
|-------|-------------|----------------|
| **1** | MUST be _prominently_ displayed on main screen | Amount, Payee name |
| **2** | MUST be displayed on main screen | IBAN, Execution date |
| **3** | MAY be on supplementary screen | Transaction ID, Timestamp |
| **4** | MAY be omitted from display | Internal reference |

► **EBA Technology Neutrality**: PSD2 RTS Article 5 does not prescribe specific cryptographic methods. The EBA clarified: "Payment service providers shall have flexibility to decide on the technology used for implementing strong customer authentication, including dynamic linking" ([EBA Q&A 2018_4039](https://www.eba.europa.eu/single-rule-book-qa/qna/view/publicId/2018_4039)). TS12's hash-then-sign approach is one compliant implementation.

---

**Gap Analysis: mDOC (ISO 18013-5) Format**

► ⚠️ **Critical Format Gap**: TS12 v1.0 only specifies `transaction_data_hashes` for **SD-JWT-VC** (Selective Disclosure JSON Web Token). There is **no equivalent mechanism for mDOC (ISO 18013-5)** credential format.

| Aspect | SD-JWT-VC | mDOC (ISO 18013-5) |
|--------|-----------|-------------------|
| Transaction binding claim | `transaction_data_hashes` in KB-JWT | ❌ Not specified |
| Hash algorithm indicator | `transaction_data_hashes_alg` | ❌ N/A |
| Signature mechanism | KB-JWT signature (ECDSA/EdDSA) | Mobile Security Object (MSO) |
| TS12 support | ✅ Full | ❌ None |

**Why This Matters**:
- EUDI Wallet supports both SD-JWT-VC and mDOC formats
- Some PSPs may prefer mDOC for consistency with mDL use cases
- Without dynamic linking, mDOC-based SCA cannot comply with Art. 5(1)(b)

**Mitigation Options**:
1. **Use SD-JWT-VC only for SCA**: Current TS12 approach
2. **Custom mDOC extension**: Define `transactionDataDigests` in MSO
3. **Wait for TS12 v2.0**: May include mDOC dynamic linking

**Recommendation**: PSPs requiring mDOC-based SCA should engage with the EUDI standardization process or implement custom solutions aligned with ISO 18013-5 `DeviceSignedDocument` extensions.

---



#### [Article 5(1)(c)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.001) — Code acceptance verification

► "(c) the authentication code accepted by the payment service provider corresponds to the original specific amount of the payment transaction and to the identity of the payee agreed to by the payer;"

**Core Requirement**: Unlike Art. 5(1)(a-b) which are wallet-enforced, this requirement places **verification responsibility on the PSP**. The PSP must actively validate that the authentication code (KB-JWT) matches the original transaction request before executing the payment.

| Verification Step | Responsibility | Reference | Status |
|-------------------|----------------|-----------|--------|
| **KB-JWT Signature** | PSP | [OID4VP §6](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html) | ✅ Cryptographic |
| **SCA Attestation Validity** | PSP | [TS12 §3.1](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#31-prerequisites) | ✅ Certificate chain |
| **`transaction_data_hashes` Match** | PSP | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) | ⚠️ PSP Implementation |
| **`nonce` Freshness** | PSP | OID4VP | ⚠️ PSP Implementation |
| **`aud` Binding** | PSP | OID4VP | ⚠️ PSP Implementation |
| **`iat` Timestamp Validity** | PSP | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) | ⚠️ Optional |

**Status**: ⚠️ **PSP Verification Required** — Wallet generates compliant code; PSP must verify

---

**Deep Dive: PSP Verification Algorithm**

The PSP receiving a VP Token with KB-JWT MUST perform the following verification steps:

```
┌-----------------------------------------------------------------┐
│  PSP Backend Verification                                       │
│                                                                 │
│  INPUT: VP Token (SD-JWT-VC + KB-JWT)                           │
│         Original Transaction Request                            │
│                                                                 │
│  ┌---------------------------------------------------------┐    │
│  │ Step 1: Verify KB-JWT Signature                          │   │
│  │ ------------------------------------------------------- │    │
│  │ • Extract public key from SCA Attestation                │   │
│  │ • Verify ECDSA/EdDSA signature over KB-JWT               │   │
│  │ • ❌ REJECT if signature invalid                         │    │
│  └---------------------------------------------------------┘    │
│                           ▼                                     │
│  ┌---------------------------------------------------------┐    │
│  │ Step 2: Verify SCA Attestation Trust Chain               │   │
│  │ ------------------------------------------------------- │    │
│  │ • Validate issuer signature (PSP's own key for own user) │   │
│  │ • OR validate against trusted WSCA Provider registry     │   │
│  │ • Check attestation not revoked                          │   │
│  │ • ❌ REJECT if issuer untrusted or revoked               │    │
│  └---------------------------------------------------------┘    │
│                           ▼                                     │
│  ┌---------------------------------------------------------┐    │
│  │ Step 3: Verify Transaction Data Hash                     │   │
│  │ ------------------------------------------------------- │    │
│  │ original_hash = SHA256(base64url(transaction_data))     │    │
│  │ received_hash = KB-JWT.transaction_data_hashes[0]        │   │
│  │                                                          │   │
│  │ IF original_hash ≠ received_hash:                        │   │
│  │   ❌ REJECT — Amount/payee mismatch (Art. 5(1)(c) fail)  │    │
│  └---------------------------------------------------------┘    │
│                           ▼                                     │
│  ┌---------------------------------------------------------┐    │
│  │ Step 4: Verify Nonce and Audience                        │   │
│  │ ------------------------------------------------------- │    │
│  │ • KB-JWT.nonce == original_request.nonce                 │   │
│  │ • KB-JWT.aud matches PSP's identifier                    │   │
│  │ • ❌ REJECT if session mismatch (replay attempt)         │    │
│  └---------------------------------------------------------┘    │
│                           ▼                                     │
│  ┌---------------------------------------------------------┐    │
│  │ Step 5: (Optional) Verify Timestamp                      │   │
│  │ ------------------------------------------------------- │    │
│  │ • KB-JWT.iat within acceptable window (e.g., 5 minutes)  │   │
│  │ • ⚠️ WARN if stale; REJECT if clearly expired            │   │
│  └---------------------------------------------------------┘    │
│                           ▼                                     │
│  ✅ ACCEPT — Execute payment                                     │
└-----------------------------------------------------------------┘
```

**Pseudocode Implementation**:

```python
def verify_sca_authentication(vp_token, original_request):
    """
    PSP server-side verification per PSD2 Article 5(1)(c)
    """
    kb_jwt = extract_kb_jwt(vp_token)
    sca_attestation = extract_sca_attestation(vp_token)
    
    # Step 1: Signature verification
    if not verify_signature(kb_jwt, sca_attestation.public_key):
        raise AuthCodeRejected("Invalid KB-JWT signature")
    
    # Step 2: Trust chain (varies by flow)
    if not verify_issuer_trust(sca_attestation):
        raise AuthCodeRejected("Untrusted SCA Attestation issuer")
    
    # Step 3: Transaction data hash — THE CORE Art. 5(1)(c) CHECK
    expected_hash = sha256(original_request.transaction_data_b64)
    actual_hash = kb_jwt.claims["transaction_data_hashes"][0]
    
    if expected_hash != actual_hash:
        raise AuthCodeRejected("Transaction data mismatch - Art. 5(1)(c) violation")
    
    # Step 4: Session binding
    if kb_jwt.claims["nonce"] != original_request.nonce:
        raise AuthCodeRejected("Nonce mismatch - possible replay")
    
    if kb_jwt.claims["aud"] != PSP_IDENTIFIER:
        raise AuthCodeRejected("Audience mismatch")
    
    # Step 5: Timestamp (optional but recommended)
    if time.now() - kb_jwt.claims["iat"] ► MAX_AUTH_CODE_AGE:
        raise AuthCodeRejected("Authentication code expired")
    
    return AuthCodeAccepted()
```

---

**Issuer-Requested vs. Third-Party-Requested Flow**

The verification complexity differs significantly between the two TS12-defined flows:

| Aspect | Issuer-Requested Flow | Third-Party-Requested Flow |
|--------|----------------------|---------------------------|
| **Verifier** | PSP = Attestation Issuer | PSP ≠ RP (TPP is RP) |
| **Trust Model** | PSP trusts its own attestation | PSP must trust TPP + Wallet |
| **Transaction Origin** | PSP generated `transaction_data` | TPP generated `transaction_data` |
| **Hash Verification** | PSP compares against own data | PSP must receive TPP's original data |
| **Liability** | PSP fully responsible | PISP bears proof burden ([PSD2 Art. 73](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366#d1e5274-35-1)) |

**Issuer-Requested Flow** (simpler):
```
┌----------┐      ┌------------┐      ┌--------------┐
│   User   │ ---- │   Wallet   │ ---- │     PSP      │
│          │      │            │      │  (RP=Issuer) │
└----------┘      └------------┘      └--------------┘
                        │                            │
                     VP Token ------------►  │
                                    PSP verifies against
                                    its OWN original request
```

**Third-Party-Requested Flow** (complex):
```
┌----------┐      ┌------------┐      ┌--------------┐      ┌----------┐
│   User   │ ---- │   Wallet   │ ---- │  TPP (PISP)  │ ---- │   PSP    │
│          │      │            │      │     (RP)     │      │  (Bank)  │
└----------┘      └------------┘      └--------------┘      └----------┘
                        │                    │                         │
                     VP Token ------------►  │                    │
                                             │                         │
                                      VP Token + -------------►   │
                                      transaction_data            │
                                                         PSP verifies but
                                                         cannot verify TPP's
                                                         retrieval method
```

---

**Gap Analysis: TPP Flow Verification**

► ⚠️ **Critical Open Issue**: In the Third-Party-Requested flow, the PSP receives the VP Token from the TPP but has **no technical means** to verify:
► 1. How the TPP obtained the VP Token (secure retrieval?)
► 2. Whether the TPP correctly displayed transaction data to the user
► 3. Whether the TPP used secure response modes (e.g., `dc_api.jwt`)

**Community Feedback** ([Discussion #439](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439#discussioncomment-15134339)):

► "The ARF describes several challenges that come with remote presentation flows (chapter 4.4.3.1) and how they might be mitigated by the use of the DC-API. However, in the Third-Party-Requested flow, the final verifier AKA the bank has no information how the VP was obtained by a third party [...] it might make sense to include relevant request parameters like `response_mode=dc_api.jwt` in the key binding JWT."
► — @senexi, Dec 2025

**TS12 Team Response**: "@senexi thank you for this proposal, sounds reasonable, we will think if this could be a new requirement in TS12 possibly." — @tmielnicki

**Proposed Mitigation** (not yet in spec):

```json
// KB-JWT with response_mode claim (proposed)
{
  "aud": "x509_san_dns:psp.example.com",
  "iat": 1741269093,
  "jti": "deeec2b0-3bea-4477-bd5d-e3462a709481",
  "nonce": "bUtJdjJESWdmTWNjb011YQ",
  "transaction_data_hashes": ["OJcnQQ..."],
  "response_mode": "dc_api.jwt",  // ← NEW: Indicates secure retrieval
  "amr": [{"knowledge": "pin_6_or_more_digits"}, {"inherence": "fingerprint_device"}]
}
```

---

**Liability Framework (PSD2 Art. 73-74)**

For unauthorized transactions in the TPP flow:

| Scenario | Liable Party | Evidence Burden |
|----------|--------------|-----------------|
| Unauthorized by user | ASPSP (bank) | Immediate refund |
| PISP caused the issue | PISP → compensates ASPSP | PISP bears proof burden |
| Authentication code valid but user denies | PISP must prove authorization | Transaction logs, consent records |

**PSP Risk Mitigation Recommendations**:

1. **Log Everything**: Store original `transaction_data`, received VP Token, verification results
2. **Require Signed Requests**: Only accept TPP transactions via JAR (JWT-secured requests)
3. **Verify TPP Registration**: Check EBA TPP Register before accepting
4. **Monitor Anomalies**: Flag mismatches between TPP-declared and hash-verified amounts
5. **Await TS12 Updates**: Implement `response_mode` verification when standardized

---



#### [Article 5(1)(d)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.001) — Authentication code invalidation on change

► "(d) any change to the amount or the payee results in the invalidation of the authentication code generated."

**Core Requirement**: This is the final pillar of dynamic linking—ensuring that authentication codes cannot be reused, replayed, or applied to modified transactions. Unlike Art. 5(1)(c) which is PSP-verified, this requirement is **cryptographically enforced** by the wallet's signature mechanism.

| Protection Type | Fulfillment | Reference | Implementation |
|-----------------|-------------|-----------|----------------|
| **Change Invalidation** | ✅ Wallet | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications) | SHA-256 hash of transaction data in KB-JWT |
| **Replay Protection** | ✅ Wallet | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) | Unique `jti` claim per presentation |
| **Time-Bound Validity** | ⚠️ PSP | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) | PSP MAY reject stale `iat` timestamps |
| **Nonce Binding** | ✅ Wallet | OID4VP | `nonce` from request echoed in KB-JWT |

**Status**: ✅ **Cryptographically Enforced** with multiple defense layers

---

**Deep Dive: How Change Invalidation Works**

The guarantee is achieved through **cryptographic hash binding**:

```
┌-----------------------------------------------------------------┐
│  Original Transaction                                           │
│  ┌---------------------------------------------------------┐    │
│  │ payload: { amount: "€150.00", payee: "ACME Corp" }       │   │
│  └---------------------------------------------------------┘    │
│                           │                                     │
│           SHA-256(canonical_json(payload))                      │
│                           ▼                                     │
│  hash = "OJcnQQByvV1iTYxiQQQx4dact-TNnSG-Ku_cs_6g55Q"           │
│                           │                                     │
│                 Signed in KB-JWT                                │
│  ┌---------------------------------------------------------┐    │
│  │ { "transaction_data_hashes": ["OJcnQQ..."], ... }        │   │
│  │  ← ECDSA signature with WSCA private key                 │   │
│  └---------------------------------------------------------┘    │
└-----------------------------------------------------------------┘

┌-----------------------------------------------------------------┐
│  Modified Transaction (attacker changes €150 → €1500)           │
│  ┌---------------------------------------------------------┐    │
│  │ payload: { amount: "€1500.00", payee: "ACME Corp" }      │   │
│  └---------------------------------------------------------┘    │
│                           │                                     │
│           SHA-256(canonical_json(payload))                      │
│                           ▼                                     │
│  hash = "7xK2mNp4ZQwL3vRtYhBn9dFgJsE...completely different"    │
│                           │                                     │
│  ❌ Does NOT match "OJcnQQ..." in signed KB-JWT                  │
│  ❌ PSP verification FAILS → Transaction REJECTED                │
└-----------------------------------------------------------------┘
```

**Cryptographic Security Properties**:

| Property | Requirement | SHA-256 Status | Impact |
|----------|-------------|----------------|--------|
| **Collision Resistance** | Attacker cannot find two different payloads with same hash | ✅ 128-bit security | Cannot forge matching transaction |
| **Pre-image Resistance** | Attacker cannot reverse hash to find payload | ✅ 256-bit security | Cannot deduce transaction from leaked hash |
| **Second Pre-image Resistance** | Given one payload, cannot find another with same hash | ✅ 128-bit security | Cannot substitute transactions |

---

**Multi-Layer Replay Protection**

Art. 5(1)(d) implicitly requires that old authentication codes cannot be replayed. TS12 provides **four independent mechanisms**:

| Layer | Claim | Protection |
|-------|-------|------------|
| **1. Transaction Hash** | `transaction_data_hashes` | Different transaction → different hash → different signature |
| **2. Unique ID** | `jti` | Fresh cryptographically random value per presentation |
| **3. Timestamp** | `iat` | PSP MAY reject presentations older than threshold (e.g., 5 min) |
| **4. Nonce** | `nonce` | RP-provided value echoed in KB-JWT; prevents cross-session replay |

**[TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) Specification**:
► "**`jti`**: **REQUIRED** A fresh, cryptographically random value with sufficient entropy, as defined in [RFC7519]. This value **SHALL** be unique for each presentation. Once verified, it serves as the Authentication Code required by [PSD2]."

**Industry Comparison** (EMV ARQC):
EMV chip cards use a similar approach—the Authorization Request Cryptogram (ARQC) is computed by hashing transaction data (amount, currency, merchant ID) and signing with the card's private key. Any modification invalidates the cryptogram.

---

**Edge Case: JSON Canonicalization**

**Potential Issue**: The `transaction_data_hashes` is computed over the JSON payload. If wallet and PSP serialize JSON differently (key order, whitespace), hash verification could fail even for legitimate transactions.

**TS12 Approach**: The hash is computed over the **base64url-encoded** `transaction_data` string as received in the request. This means:
- The wallet hashes the *exact bytes* received from the PSP
- No canonicalization is applied (like JCS)
- PSP must preserve the exact byte sequence when verifying

**Risk**: If a TPP or intermediary re-serializes the JSON differently, the hash will not match.

**Recommendation**: PSPs should:
1. Store the original base64url-encoded `transaction_data` string
2. Compare hash against that exact string, not re-serialized JSON

---

**Time-Bound Validity Gap**

While `iat` (issued-at) is included in the KB-JWT, **TS12 does not mandate a maximum validity period**. Industry practice suggests 5 minutes for payment authentication codes.

**Current [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response)**:
► "The `iat` (issued at) claim of the KB-JWT **MAY** be used by a Relying Party to restrict the timeframe."

| Aspect | Specification | Industry Practice |
|--------|--------------|-------------------|
| Maximum validity | ❌ Not specified | 5 minutes typical |
| Clock skew tolerance | ❌ Not specified | ±30 seconds typical |
| Expiry (`exp`) claim | ❌ Not required | Some PSPs use this |

**Recommendation**: SCA Attestation Rulebooks SHOULD specify:
- Maximum `iat` age (e.g., 300 seconds)
- Clock skew tolerance (e.g., 60 seconds)

---



#### [Article 5(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.002) — Security measures for dynamic linking (CIA triad)

► "For the purpose of paragraph 1, payment service providers shall adopt security measures which ensure the confidentiality, authenticity and integrity of each of the following: (a) the amount of the transaction and the payee throughout all of the phases of the authentication; (b) the information displayed to the payer throughout all of the phases of the authentication including the generation, transmission and use of the authentication code."

**Core Requirement**: This article mandates the **CIA triad** (Confidentiality, Authenticity, Integrity) across **all phases** of SCA:

| Phase | Description | Key Security Concern |
|-------|-------------|---------------------|
| **Generation** | Transaction data created by PSP/RP | Data origin authenticity |
| **Transmission** | Data sent to wallet via network | Man-in-the-middle attacks |
| **Display** | User reviews amount/payee on screen | Overlay attacks, display manipulation |
| **Use** | User confirms and signs transaction | Transaction tampering |

**Compliance Matrix**:

| Security Property | Phase | Fulfillment | Reference | Implementation |
|-------------------|-------|-------------|-----------|----------------|
| **Confidentiality** | Transmission | ✅ Wallet | [OID4VP](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html), [HAIP](https://openid.net/specs/openid4vc-high-assurance-interoperability-profile-1_0.html) | TLS 1.2+ for all communications |
| **Confidentiality** | Transmission | ✅ Wallet | [TS12 §3.5](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications) | Encrypted presentation requests (JAR) RECOMMENDED |
| **Confidentiality** | At-rest | ⚠️ Gap | — | Transaction data in memory; no explicit secure storage requirement |
| **Authenticity** | Generation | ✅ Wallet | [OID4VP §6](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html) | RP must sign request (JAR); wallet verifies signature |
| **Authenticity** | Response | ✅ Wallet | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications) | KB-JWT signed by WSCA-protected key |
| **Integrity** | Transmission | ✅ Wallet | TLS | HMAC/AEAD integrity via TLS record layer |
| **Integrity** | Display→Sign | ✅ Wallet | [TS12 §3.3](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications) | `transaction_data_hashes` binds displayed data to signature |
| **Integrity** | Display | ⚠️ Device | — | **Overlay attack protection** delegated to OS/device security |

**Status**: ⚠️ **Mostly Supported** — Display integrity (WYSIWYS) depends on device security

---

**Deep Dive: "What You See Is What You Sign" (WYSIWYS)**

The EBA introduced dynamic linking specifically to prevent **social engineering attacks** where attackers manipulate what users see vs. what they sign. Art. 5(2)(b) requires that "the information displayed to the payer" maintains CIA **throughout all phases**.

**TS12 Implementation of WYSIWYS**:

```
┌-----------------------------------------------------------------┐
│  PSP/RP (Backend)                                               │
│  ┌---------------------------------------------------------┐    │
│  │ transaction_data: {                                      │   │
│  │   type: "payment_confirmation",                          │   │
│  │   payload: { amount: "€150.00", payee: "ACME Corp" }     │   │
│  │ }                                                        │   │
│  └---------------------------------------------------------┘    │
│                           │                                     │
│                    (1) Generation                               │
│                    ✅ Signed JAR                                 │
└---------------------------┼-------------------------------------┘
                            ▼
┌-----------------------------------------------------------------┐
│  Network (TLS 1.2+)                                             │
│                    (2) Transmission                             │
│                    ✅ Encrypted + Integrity                      │
└---------------------------┼-------------------------------------┘
                            ▼
┌-----------------------------------------------------------------┐
│  Wallet Unit                                                    │
│  ┌---------------------------------------------------------┐    │
│  │ (3) Display Phase                                        │   │
│  │ ┌-----------------------------------------------------┐ │    │
│  │ │  ┌-----------------------------------------------┐  │ │    │
│  │ │  │  Amount: €150.00  │  Payee: ACME Corp         │  │ │    │
│  │ │  │  [Confirm Payment]   [Cancel]                 │  │ │    │
│  │ │  └-----------------------------------------------┘  │ │    │
│  │ │  ⚠️ Vulnerable to overlay attacks?                  │ │    │
│  │ └-----------------------------------------------------┘ │    │
│  └---------------------------------------------------------┘    │
│                           │                                     │
│                    (4) Use Phase                                │
│  ┌---------------------------------------------------------┐    │
│  │ KB-JWT: { transaction_data_hashes: [SHA256(payload)] }   │   │
│  │ ✅ Cryptographically binds displayed data to signature   │    │
│  └---------------------------------------------------------┘    │
└---------------------------┼-------------------------------------┘
                            ▼
       PSP verifies: SHA256(received_payload) == hash_in_signature
```

**TS12 §3.3.1 Display Rendering Requirements**:
- Wallet MUST display transactional data in "clear, understandable and accurate manner"
- Hierarchy levels (1-4) control prominence of amount/payee display
- Level 1 = "MUST be _prominently_ displayed on the main transaction confirmation screen"
- `affirmative_action_label` and `denial_action_label` controlled by Attestation Provider

**ARF HLR Coverage**:
- **SUA_02**: Rulebook specifies "displaying the data to the User when obtaining consent for signing"
- **SUA_06**: Wallet can customize dialogue messages (font, color, position) per Rulebook

---

**Gap Analysis: Overlay Attack Protection**

**The Problem**: Android overlay attacks (e.g., banking trojans like GM Bot, Godfather) can draw fake UI elements over the wallet's transaction screen, showing "€15.00" while the actual transaction is "€1,500.00".

**Industry Best Practices** (from security vendors):

| Mitigation | Description | EUDI Wallet Status |
|------------|-------------|-------------------|
| **RASP (Runtime Application Self-Protection)** | Detects if app window is obscured | ❌ Not in reference implementation |
| **Overlay detection API** | Android `FLAG_WINDOW_IS_PARTIALLY_OBSCURED` | ❌ Not explicitly required |
| **Secure display mode** | TEE-rendered transaction confirmation | ❌ Not in ARF/TS12 |
| **Certificate pinning** | Prevents MitM on transmission | ✅ Implicit via TLS best practices |
| **Device integrity checks** | Detect rooted/jailbroken devices | ⚠️ Wallet attestation covers this |

**EBA Guidance**: The EBA has clarified that SMS-based dynamic linking is insufficient because "confidentiality and integrity of payment information cannot be adequately protected through this channel." The same principle applies to device displays vulnerable to overlay attacks.

**Recommendation**: Wallet implementations for PSD2-regulated payments SHOULD:
1. Detect screen overlay conditions and refuse to process transactions
2. Consider TEE-based secure display for high-value transactions
3. Implement app shielding/RASP for production deployments

---

**At-Rest Confidentiality Gap**

Art. 5(2)(a) requires confidentiality "throughout all phases." However:

- Transaction data received in presentation request is processed in memory
- No explicit requirement for encrypted storage of pending transaction data
- If device is compromised, transaction details could be extracted before user approval

**Mitigation**: This is partially addressed by:
- Short transaction lifecycle (data only exists during approval flow)
- Device-level encryption (FDE/FBE on iOS/Android)
- WSCA/WSCD isolation protects signing keys, not transaction display data

---



#### [Article 5(3)(a)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.003) — Batch file payment exception

► "For the purpose of paragraph 1(b) and where payment service providers apply strong customer authentication in accordance with Article 97(2) of Directive (EU) 2015/2366 the following requirements for the authentication code shall apply: (a) in relation to a card-based payment transaction for which the payer has given consent to the exact amount of the funds to be blocked pursuant to Article 75(1) of that Directive, the authentication code shall be specific to the amount that the payer has given consent to be blocked and agreed to by the payer when initiating the transaction; (b) in relation to payment transactions for which the payer has given consent to execute a batch of remote electronic payment transactions to one or several payees, the authentication code shall be specific to the total amount of the batch of payment transactions and to the specified payees."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ⚠️ **Gap** | [TS12 §4.3.1](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#431-payment-confirmation) | `recurrence.mit_options` for recurring totals, but no batch payees |

**Status**: ⚠️ Partial (Single Payee Only)

<details>
<summary><strong>🔍 Deep-Dive: Batch Payment Dynamic Linking</strong></summary>

##### Core Concept: Aggregate Authentication

Article 5(3) addresses **two special cases** of dynamic linking:

| Clause | Scenario | Authentication Requirement |
|--------|----------|---------------------------|
| **5(3)(a)** | Card pre-authorization (unknown final amount) | Auth code specific to **blocked amount** |
| **5(3)(b)** | Batch/bulk payments (multiple payees) | Auth code specific to **total amount + all payees** |

```
┌-----------------------------------------------------------------------------┐
│                     Batch Payment Dynamic Linking                           │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │                    BATCH PAYMENT STRUCTURE                          │    │
│  │                                                                     │    │
│  │   BATCH FILE                                                        │    │
│  │   ==========                                                        │    │
│  │   ┌---------------------------------------------------------------┐ │    │
│  │   │ Payment 1: €1,000 → Employee A (IBAN: DE89...)               │ │     │
│  │   │ Payment 2: €1,500 → Employee B (IBAN: FR76...)               │ │     │
│  │   │ Payment 3: €2,000 → Employee C (IBAN: ES91...)               │ │     │
│  │   │ ...                                                           │ │    │
│  │   │ Payment N: €X → Employee N (IBAN: XXnn...)                   │ │     │
│  │   └---------------------------------------------------------------┘ │    │
│  │                              ▼                                      │    │
│  │   ┌---------------------------------------------------------------┐ │    │
│  │   │                  AGGREGATE AUTH CODE                          │ │    │
│  │   │                                                               │ │    │
│  │   │   Hash = SHA256(                                              │ │    │
│  │   │     total_amount: €100,000                                    │ │    │
│  │   │     payee_count: 50                                           │ │    │
│  │   │     payee_ids: [IBAN1, IBAN2, ..., IBAN50]                   │ │     │
│  │   │   )                                                           │ │    │
│  │   │                                                               │ │    │
│  │   │   Signature = ECDSA(Hash, PrivateKey)                         │ │    │
│  │   │                                                               │ │    │
│  │   └---------------------------------------------------------------┘ │    │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Corporate Use Cases

| Use Case | Description | Batch Size |
|----------|-------------|------------|
| **Payroll** | Monthly salary payments to employees | 10-10,000+ |
| **Supplier payments** | B2B invoice settlements | 10-500 |
| **Pension disbursements** | Recurring pension to retirees | 100-100,000+ |
| **Dividend payments** | Shareholder distributions | 100-1,000,000+ |
| **Tax refunds** | Government-to-citizen | 1,000-10,000,000+ |

##### The UX Challenge

Displaying all payees for large batches is **impractical**:

| Batch Size | Display Approach | User Experience |
|------------|------------------|-----------------|
| 1-10 payees | Individual list | ✅ Manageable |
| 10-50 payees | Scrollable list | ⚠️ Tedious |
| 50-500 payees | Summary + sample | ⚠️ Abstracted |
| 500+ payees | Aggregate only | ⚠️ Trust-based |

##### EBA Guidance on Batch Payments

| Requirement | EBA Position |
|-------------|--------------|
| All payees must be included | Yes, in hash calculation |
| All payees must be displayed | **No**, aggregate display acceptable |
| Total amount must be shown | Yes, always visible |
| User must explicitly consent | Yes, before signing |

##### EUDI Wallet Current Support

| Feature | TS12 v1.0 Support | Gap |
|---------|-------------------|-----|
| Single payee | ✅ Full | — |
| Recurring payments (single payee) | ✅ `recurrence.*` | — |
| Recurring with MIT | ✅ `mit_options` | — |
| **Multi-payee batch** | ❌ None | **GAP** |
| **Batch with aggregate hash** | ❌ None | **GAP** |

##### Proposed Extension: Batch Payment Schema

```json
{
  "transaction_data": {
    "type": "batch_payment",
    "batch_metadata": {
      "total_amount": "100000.00",
      "currency": "EUR",
      "payee_count": 50,
      "batch_reference": "PAYROLL-2026-01"
    },
    "payees_hash": "sha256:abc123...",
    "display_summary": "Payroll: €100,000.00 to 50 employees"
  },
  "transaction_data_hashes": [
    "sha256:def456..."
  ]
}
```

##### Integration with SCA Exemptions

| Exemption (RTS) | Batch Applicability |
|-----------------|---------------------|
| **Art. 13 — Trusted Beneficiaries** | Batch payees on whitelist exempted from individual display |
| **Art. 14 — Recurring Transactions** | Repeat batches to same payees exempted after first SCA |
| **Art. 16 — Low-Value (Remote)** | Individual payments ◄€30 exempted (total ◄€100) |
| **Art. 17 — Low-Value (Contactless)** | N/A for batch file payments |

##### Security Considerations

| Risk | Mitigation |
|------|------------|
| **Payee injection** | Hash includes all IBANs, any change invalidates |
| **Amount manipulation** | Total in hash, signed by user |
| **Truncated display** | User consents to aggregate, not individual |
| **File tampering post-SCA** | Hash computed before display, verified at PSP |

##### Gap Analysis: Batch Payment Support

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **BP-1** | TS12 lacks `payees[]` array for multi-payee batches | High | Extend TS12 with batch_payment type |
| **BP-2** | No aggregate display guidance for wallets | Medium | Define UX for batch summary |
| **BP-3** | Hash computation for large batches not specified | Medium | Merkle tree or flat hash guidance |
| **BP-4** | Exemption integration (Art. 13/14) not documented | Medium | Cross-reference exemption applicability |

##### Recommendations for SCA Attestation Rulebook

1. **Batch Type Extension**: Define `batch_payment` transaction type in TS12
2. **Payees Hash**: Specify how to compute hash over multiple payees (sorted IBANs)
3. **Display Guidance**: Document aggregate display requirements ("N payees, €X total")
4. **Exemption Cross-Reference**: Link to Art. 13/14 for trusted beneficiary batches
5. **Merkle Tree Option**: For very large batches, allow Merkle root for efficiency
6. **Corporate Channel**: Define separate flow for corporate batch processing

</details>

---

#### [Article 5(3)(b)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.003) — Batch authentication code

► "(b) the authentication code shall be specific to the total amount of the batch payment and to the payees specified."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ⚠️ **Gap** | — | Multi-payee batch not specified in TS12 v1.0 |

**Status**: ❌ Gap for Multi-Payee Batches

<details>
<summary><strong>🔍 Deep-Dive: Batch Authentication Code Computation</strong></summary>

##### Core Requirement: Total + All Payees

Article 5(3)(b) specifies the **exact scope** of what the batch authentication code must cover:

| Component | Requirement | Implementation |
|-----------|-------------|----------------|
| **Total amount** | Sum of all payments in batch | Single aggregate value |
| **Payees specified** | All beneficiary identifiers | All IBANs/account numbers |

```
┌-----------------------------------------------------------------------------┐
│                    Batch Authentication Code Computation                    │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  INPUT DATA                                                                 │
│  ==========                                                                 │
│                                                                             │
│  ┌-----------------------------------------------------------------------┐  │
│  │  total_amount = €100,000.00                                           │  │
│  │  currency = "EUR"                                                     │  │
│  │  payees = [                                                           │  │
│  │    { iban: "DE89370400440532013000", amount: €1,000 },               │   │
│  │    { iban: "FR7630006000011234567890189", amount: €1,500 },          │   │
│  │    { iban: "ES9121000418450200051332", amount: €2,000 },             │   │
│  │    ... (50 payees)                                                    │  │
│  │  ]                                                                    │  │
│  └-----------------------------------------------------------------------┘  │
│                              ▼                                              │
│  HASH COMPUTATION                                                           │
│  =================                                                          │
│                                                                             │
│  Option A: FLAT HASH                                                        │
│  ┌-----------------------------------------------------------------------┐  │
│  │  canonical_string = total_amount || currency || sorted(IBANs)         │  │
│  │  batch_hash = SHA256(canonical_string)                                │  │
│  └-----------------------------------------------------------------------┘  │
│                                                                             │
│  Option B: MERKLE TREE (for very large batches)                             │
│  ┌-----------------------------------------------------------------------┐  │
│  │  leaf[i] = SHA256(IBAN[i] || amount[i])                               │  │
│  │  merkle_root = MerkleTree(leaves)                                     │  │
│  │  batch_hash = SHA256(total_amount || merkle_root)                     │  │
│  └-----------------------------------------------------------------------┘  │
│                              ▼                                              │
│  SIGNATURE                                                                  │
│  =========                                                                  │
│  ┌-----------------------------------------------------------------------┐  │
│  │  auth_code = ECDSA.sign(batch_hash, user_private_key)                 │  │
│  └-----------------------------------------------------------------------┘  │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Hash Computation Methods

| Method | Description | Use Case | Pros | Cons |
|--------|-------------|----------|------|------|
| **Flat Hash** | Concatenate all data, single SHA-256 | ◄ 1,000 payees | Simple, fast | Large input string |
| **Merkle Tree** | Hierarchical hash tree | ► 1,000 payees | Efficient verification | Complex implementation |
| **Sorted IBANs** | Canonical ordering | Any size | Deterministic | Requires sorting |

##### Canonical Data Format (Proposed)

```json
{
  "batch_canonical": {
    "total_amount_cents": 10000000,
    "currency": "EUR",
    "payee_count": 50,
    "payees_sorted": [
      "DE89370400440532013000",
      "ES9121000418450200051332",
      "FR7630006000011234567890189"
    ]
  }
}
```

► **Critical**: IBANs must be sorted lexicographically to ensure deterministic hash computation on both wallet and PSP sides.

##### PSP Verification Flow

```
┌-----------------------------------------------------------------------------┐
│                         PSP Batch Verification                              │
├-----------------------------------------------------------------------------┤
│                                                                             │
│   1. PSP receives signed batch_hash from wallet                             │
│   2. PSP has original batch file (all IBANs + amounts)                      │
│   3. PSP computes: expected_hash = SHA256(batch_canonical)                  │
│   4. PSP verifies: ECDSA.verify(batch_hash, signature, wallet_public_key)   │
│   5. PSP compares: expected_hash == batch_hash                              │
│                                                                             │
│   If match → ✅ Execute all payments in batch                                │
│   If mismatch → ❌ Reject entire batch                                       │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Host-to-Host (H2H) Exception

EBA recognizes a special case for **corporate machine-to-machine** payments:

| Scenario | SCA Requirement | Reference |
|----------|-----------------|-----------|
| **H2H communication** | Security mechanisms "as effective as SCA" | RTS Art. 97(2) exemption |
| **Dedicated interface** | Corporate treasury direct connection | EBA Q&A |
| **TLS mutual auth** | Certificate-based authentication | May substitute for SCA |

##### Implementation Workarounds (Current)

| Approach | Compliance | UX Impact |
|----------|------------|-----------|
| **Individual SCA per payee** | ✅ Full | Very poor for large batches |
| **Aggregate display + single SCA** | ⚠️ Partial | Acceptable |
| **H2H exemption** | ✅ If architecture qualifies | Corporate only |
| **Trusted beneficiaries** | ✅ Art. 13 | Pre-whitelisting required |

##### Invalidation Requirement

Any change to the batch **must invalidate** the authentication code:

| Change Type | Effect | Hash Behavior |
|-------------|--------|---------------|
| Add payee | Invalidates | Hash changes |
| Remove payee | Invalidates | Hash changes |
| Modify amount | Invalidates | Hash changes |
| Modify IBAN | Invalidates | Hash changes |
| Reorder payees | No effect (if sorted) | Hash unchanged |

##### Gap Analysis: Batch Authentication Code

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **BAC-1** | TS12 lacks batch hash computation specification | High | Define canonical format |
| **BAC-2** | Merkle tree option not documented | Medium | Provide for large batch efficiency |
| **BAC-3** | H2H exemption not referenced in wallet specs | Low | Cross-reference EBA guidance |
| **BAC-4** | Sorting/canonicalization not specified | Medium | Mandate sorted IBANs |

##### Recommendations for SCA Attestation Rulebook

1. **Canonical Format**: Define JSON schema for batch hash input
2. **Hash Algorithm**: Specify SHA-256 with sorted IBAN list
3. **Merkle Option**: Allow Merkle root for batches ► 1,000 payees
4. **H2H Reference**: Document corporate H2H exemption applicability
5. **Verification Spec**: Define PSP-side hash verification procedure
6. **Error Handling**: Specify rejection behavior for hash mismatch

</details>

---

# 8. General Security Requirements

## 8.1 Security Measures

► **Regulatory Basis**:
► - [RTS Art. 2](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_2): General authentication requirements

#### [Article 2(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#002.001)

► "Payment service providers shall have transaction monitoring mechanisms in place that enable them to detect unauthorised or fraudulent payment transactions for the purpose of the implementation of the security measures referred to in points (a) and (b) of Article 1. Those mechanisms shall be based on the analysis of payment transactions taking into account elements which are typical of the payment service user in the circumstances of a normal use of the personalised security credentials."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ❌ **PSP** | — | PSP must implement fraud detection systems |
| ⚠️ **Wallet Evidence** | [DASH_02–DASH_05](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2312-topic-19---user-navigation-requirements-dashboard-logs-for-transparency) | Wallet logs all transactions for user dashboard |

**Status**: ❌ PSP Obligation

<details>
<summary><strong>🔍 Deep-Dive: Transaction Monitoring Mechanisms</strong></summary>

##### Core Requirement: Fraud Detection Infrastructure

Article 2(1) mandates that PSPs build and maintain fraud detection systems. This is a **PSP-side obligation**, but the EUDI Wallet contributes valuable signals:

```
┌-----------------------------------------------------------------------------┐
│                    Transaction Monitoring Architecture                      │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------┐         ┌---------------┐         ┌---------------┐      │
│  │   WALLET      │         │     PSP       │         │   REPORTING   │      │
│  │   SIGNALS     │   --►   │   MONITORING  │   --►   │   & ACTION    │      │
│  │               │         │   SYSTEM      │         │               │      │
│  └-------┬-------┘         └-------┬-------┘         └---------------┘      │
│          │                         │                                        │
│          ▼                         ▼                                        │
│  ┌---------------┐         ┌---------------┐                                │
│  │ WUA metadata  │         │ Real-time     │                                │
│  │ Device ID     │         │ Risk Engine   │                                │
│  │ WSCD type     │         │               │                                │
│  │ amr claims    │         │ ┌-----------┐ │                                │
│  │ Transaction   │         │ │ ML/AI     │ │                                │
│  │ hash (KB-JWT) │         │ │ Model     │ │                                │
│  └---------------┘         │ └-----------┘ │                                │
│                            │               │                                │
│                            │ ┌-----------┐ │                                │
│                            │ │ Rules     │ │                                │
│                            │ │ Engine    │ │                                │
│                            │ └-----------┘ │                                │
│                            │               │                                │
│                            │ ┌-----------┐ │                                │
│                            │ │ Behavioral│ │                                │
│                            │ │ Analytics │ │                                │
│                            │ └-----------┘ │                                │
│                            └---------------┘                                │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Art. 2(2) — Minimum Risk Factors

Article 2(2) specifies the **minimum** risk factors that monitoring systems must incorporate:

| Risk Factor (Art. 2(2)) | Description | Wallet Contribution |
|------------------------|-------------|---------------------|
| **(a) Compromised/stolen elements** | Blacklists of known compromised credentials | WUA revocation status (Wallet Provider → PSP) |
| **(b) Transaction amount** | Deviation from normal spending patterns | Transaction amount in `transaction_data` |
| **(c) Known fraud scenarios** | Pattern matching against fraud typologies | — (PSP knowledge base) |
| **(d) Malware infection signs** | Device integrity assessment | WUA attestation (Play Integrity / App Attest) |
| **(e) Device/software usage logs** | Abnormal access patterns | WUA device properties, `amr` claims |

##### Wallet Contributions to PSP Monitoring

The EUDI Wallet provides several signals that PSPs can incorporate into their monitoring:

| Wallet Signal | Source | Use in Monitoring |
|---------------|--------|-------------------|
| **WUA attestation** | VP Token | Device integrity, app authenticity |
| **Device properties** | WUA claims | Device fingerprinting, model identification |
| **WSCD type** | WUA | Hardware security level (SE/StrongBox/TEE/software) |
| **`amr` claim** | KB-JWT | Authentication method used (pin, face, fpt, hwk) |
| **`iat` timestamp** | KB-JWT | Transaction timing anomalies |
| **`transaction_data_hashes`** | KB-JWT | Proof of what user saw and signed |
| **Dashboard logs** | DASH_02 | User-side audit trail for dispute resolution |

##### Transaction Risk Analysis (TRA) Link — Art. 18

Article 2's monitoring is **prerequisite** for TRA exemptions under Art. 18:

```
┌-----------------------------------------------------------------------------┐
│              Art. 2 Monitoring --► Art. 18 TRA Exemption                    │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  1. PSP has Art. 2-compliant monitoring in place                            │
│  2. PSP calculates fraud rate per Art. 18 thresholds                        │
│  3. For each transaction, PSP performs real-time risk analysis              │
│  4. If low-risk + fraud rate below threshold → SCA exemption eligible       │
│                                                                             │
│  ┌--------------------------------------------------------------------┐     │
│  │  TRA Fraud Rate Thresholds (Art. 18)                               │     │
│  │  -------------------------------------------------------------     │     │
│  │  Transaction Amount    Max Fraud Rate                              │     │
│  │  ≤ €100                0.13%                                       │     │
│  │  ≤ €250                0.06%                                       │     │
│  │  ≤ €500                0.01%                                       │     │
│  └--------------------------------------------------------------------┘     │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Real-Time vs. Batch Monitoring

| Monitoring Type | When Required | Application |
|-----------------|---------------|-------------|
| **Real-time** | Art. 18 TRA exemption | Run risk analysis before each transaction approval |
| **Batch/Post-hoc** | Art. 2(1) general | Fraud detection for reporting, pattern learning |
| **Continuous** | Art. 2(2)(d) malware | Device integrity signals via WUA attestation |

##### Industry Best Practices: AI/ML Fraud Detection

Modern PSP fraud detection incorporates:

| Technology | Application | PSD2 Relevance |
|------------|-------------|----------------|
| **Machine Learning** | Pattern detection, anomaly scoring | Improves fraud detection beyond static rules |
| **Behavioral Analytics** | User profiling, spending patterns | Art. 2(1): "typical of the payment service user" |
| **Device Fingerprinting** | Device identification, session linking | Art. 2(2)(e): device/software usage logs |
| **Velocity Checking** | Transaction frequency limits | Art. 2(2)(b): amount analysis |
| **Graph Analytics** | Link analysis for organized fraud | Art. 2(2)(c): known fraud scenarios |
| **Real-time Scoring** | Sub-second risk decisions | Art. 18 TRA exemption requirement |

##### Wallet Dashboard Integration (DASH_02–05)

While monitoring is PSP-side, the Wallet provides user transparency:

| HLR | Requirement | Implementation |
|-----|-------------|----------------|
| **DASH_02** | Transaction history accessible | User can view all VP Token presentations |
| **DASH_03** | Relying party identification | RP name and purpose displayed |
| **DASH_04** | Timestamp logging | All transactions timestamped |
| **DASH_05** | Attribute disclosure logging | Which attributes were shared |

This creates an audit trail that can support PSP investigations and user dispute resolution.

##### Threat Model: Monitoring Evasion

| Threat | Attack Vector | Mitigation |
|--------|---------------|------------|
| **Low-and-slow** | Many small transactions below detection | Velocity checks, cumulative monitoring |
| **Account takeover** | Legitimate credentials, fraudulent intent | Behavioral deviation detection |
| **Device spoofing** | Fake device fingerprint | WUA attestation (hardware-backed) |
| **WUA replay** | Reusing valid attestation | `iat` freshness check, nonce binding |
| **Distributed fraud** | Multiple devices, same fraud pattern | Graph analytics, cross-account linking |
| **Synthetic identity** | Fabricated identity passes KYC | Not directly RTS scope; handled at onboarding |

##### PSP Implementation Requirements

For a PSP to comply with Art. 2(1):

| Requirement | Implementation | Evidence |
|-------------|----------------|----------|
| **Monitoring system** | Real-time fraud engine | System documentation, vendor contracts |
| **Risk rules** | Rule engine with Art. 2(2) factors | Rule repository, version control |
| **ML models** | Trained on historical fraud data | Model documentation, accuracy metrics |
| **Integration** | Consume wallet signals (WUA, amr, etc.) | API documentation, integration tests |
| **Audit trail** | Log all decisions for Art. 3 audits | Log retention policy, SIEM integration |
| **Reporting** | Semi-annual fraud statistics | EBA reporting templates |

##### Gap Analysis: Transaction Monitoring

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **TM-1** | Wallet doesn't actively push device risk signals | Low | WUA attestation is pull-based (on request); consider periodic heartbeat option |
| **TM-2** | No standard API for PSP to query WUA revocation status | Medium | Define revocation status endpoint in TS12 or Wallet Provider API spec |
| **TM-3** | `amr` claim doesn't indicate biometric modality (face vs. fingerprint) | Low | Extend `amr` vocabulary: `face`, `fpt`, `iris` (as suggested in I-5) |
| **TM-4** | No standardized risk score exchange format | Low | Consider STIX/TAXII or custom format for threat intelligence sharing |

##### Recommendations for SCA Attestation Rulebook

1. **Define Wallet Signals**: Specify which WUA claims PSPs should use for risk assessment
2. **Attestation Freshness**: Recommend maximum age for WUA (e.g., 24 hours, refreshed on each SCA)
3. **Revocation Propagation**: Mandate Wallet Provider publish revocation status endpoint for PSP queries
4. **Fraud Reporting Taxonomy**: Align wallet-related fraud categories with EBA reporting guidelines
5. **TRA Eligibility**: Document that wallet-based SCA is compatible with Art. 18 TRA exemption

</details>

**Context**: Transaction monitoring is a PSP-side function. The Wallet provides transaction logs (per DASH_02) that could be used as supplementary evidence in dispute resolution, but the real-time fraud detection must be implemented by the PSP.

**PSP Action Required**:
- ✗ Implement transaction monitoring system
- ✗ Define risk rules and anomaly detection
- ✗ Integrate wallet responses into monitoring pipeline

---

#### [Article 2(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#002.002)

► "Payment service providers shall ensure that the transaction monitoring mechanisms take into account, at a minimum, each of the following risk-based factors: (a) lists of compromised or stolen authentication elements; (b) the amount of each payment transaction; (c) known fraud scenarios in the provision of payment services; (d) signs of malware infection in any sessions of the authentication procedure; (e) in case the access device or the software is provided by the payment service provider, a log of the use of the access device or the software provided to the payment service user and the abnormal use of the access device or the software."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ❌ **PSP** | — | Behavioural analysis, device fingerprinting, etc. |
| ⚠️ **Wallet Evidence** | WUA attributes | WUA contains device/WSCD properties that PSP can use for fingerprinting |

**Status**: ❌ PSP Obligation

<details>
<summary><strong>🔍 Deep-Dive: Mandated Risk Factors</strong></summary>

##### Core Requirement: Minimum Risk Factor Set

Article 2(2) specifies **five mandatory risk factors** that every PSP's transaction monitoring system must incorporate. These are the minimum — PSPs can add more.

```
┌-----------------------------------------------------------------------------┐
│                    Article 2(2) Mandatory Risk Factors                      │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │                    PSP TRANSACTION MONITORING                       │    │
│  │                                                                     │    │
│  │   (a) Compromised/Stolen Elements                                   │    │
│  │       └-- Black lists, credential breach databases                  │    │
│  │                                                                     │    │
│  │   (b) Transaction Amount                                            │    │
│  │       └-- Threshold monitoring, TRA exemption tiers                 │    │
│  │                                                                     │    │
│  │   (c) Known Fraud Scenarios                                         │    │
│  │       └-- SIM swap, account takeover, social engineering            │    │
│  │                                                                     │    │
│  │   (d) Malware Infection Signs                                       │    │
│  │       └-- Device integrity, WUA attestation status                  │    │
│  │                                                                     │    │
│  │   (e) Access Device/Software Logging (if PSP-provided)              │    │
│  │       └-- App version, usage patterns, abnormal behavior            │    │
│  │                                                                     │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
│  + Additional factors (not mandatory but recommended):                      │
│    • Abnormal location of the payer                                         │
│    • Abnormal spending/behavioral pattern                                   │
│    • Device fingerprint consistency                                         │
│    • Time-of-day patterns                                                   │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Mandated Factor Analysis

| Factor | RTS Art. 2(2) | What PSP Must Monitor | Data Sources |
|--------|---------------|----------------------|--------------|
| **(a) Compromised lists** | Mandatory | Blacklisted cards, leaked credentials | HaveIBeenPwned, card scheme lists |
| **(b) Transaction amount** | Mandatory | Amount thresholds, TRA tiers | Transaction data |
| **(c) Known fraud scenarios** | Mandatory | Account takeover, SIM swap, phishing | Threat intelligence feeds |
| **(d) Malware signs** | Mandatory | Device integrity, suspicious behavior | WUA, device signals |
| **(e) Device/software logs** | If PSP-provided | App usage, version, abnormal patterns | PSP app telemetry |

##### Wallet Data Contributions Per Factor

The EUDI Wallet can provide evidence supporting several of these factors:

| RTS Factor | Wallet Contribution | Claim/Attestation |
|------------|--------------------|--------------------|
| **(a) Compromised lists** | ❌ None | PSP must check externally |
| **(b) Transaction amount** | ❌ None | Transaction is PSP-side |
| **(c) Fraud scenarios** | ⚠️ Partial | WUA reveals device type; SCA Attestation shows auth method |
| **(d) Malware signs** | ✅ **Key contribution** | WUA attests to device integrity, WS attestation confirms wallet validity |
| **(e) Device/software logs** | ⚠️ Partial | WUA contains device properties; logging is PSP responsibility |

##### Factor (d) Deep-Dive: Malware Detection

The wallet provides critical evidence for malware detection:

| WUA Claim | Malware Indicator | PSP Action |
|-----------|------------------|------------|
| `device_integrity` | Device rooted/jailbroken | Flag as high-risk |
| `os_version` | Outdated, vulnerable OS | Elevated scrutiny |
| `app_attestation` | Wallet app tampered | Block transaction |
| `wscd_type` | SE vs TEE vs none | Risk score adjustment |

```
┌-----------------------------------------------------------------------------┐
│                     Wallet Evidence for Malware Detection                   │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  WALLET PROVIDES:                                                           │
│  -----------------                                                          │
│  • WUA (Wallet Unit Attestation) — device and wallet integrity signals      │
│  • WS Attestation — wallet solution is valid and not revoked                │
│  • Play Integrity / Device Check — platform attestation                     │
│                                                                             │
│  PSP MUST:                                                                  │
│  ---------                                                                  │
│  • Consume and evaluate these signals                                       │
│  • Integrate into transaction risk scoring                                  │
│  • Decide on transaction outcome (approve/decline/step-up)                  │
│                                                                             │
│  WALLET CANNOT DETECT:                                                      │
│  ---------------------                                                      │
│  • Network-level attacks (MITM without cert pinning)                        │
│  • Server-side fraud                                                        │
│  • User coercion / social engineering                                       │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Machine Learning Enhancement (EBA Permitted)

The EBA explicitly permits machine learning to enhance TRA:

| ML Application | Use Case | EBA Reference |
|---------------|----------|---------------|
| **Behavioral biometrics** | Typing patterns, swipe behavior | EBA Q&A 2018/4039 |
| **Anomaly detection** | Unusual transaction patterns | EBA Opinion 2019 |
| **Device fingerprinting** | Consistent device identification | Implicitly allowed |
| **Location analysis** | Abnormal geolocation | Art. 2(2) factor |

► **EBA Clarification**: "PSD2 and the Delegated Regulation do not restrict PSPs from utilizing additional security measures, including solutions that rely on innovative technologies (such as machine learning)."

##### Additional Risk Factors (Beyond Art. 2(2) Minimum)

| Additional Factor | Source | Wallet Contribution |
|------------------|--------|---------------------|
| **Payer location** | IP, GPS | WUA may contain region; PSP network data |
| **Behavioral pattern** | Historical data | PSP transaction history |
| **Device consistency** | Device ID | WUA device properties |
| **Time-of-day** | Transaction timestamp | PSP-side analysis |
| **Payee reputation** | Merchant databases | PSP / scheme data |
| **Velocity checks** | Transaction frequency | PSP-side analysis |

##### PSP-Side Risk Monitoring

► **Note**: Transaction risk monitoring (Art. 2) is a **PSP obligation**. The wallet provides device context via WUA claims; risk decisions are made server-side.

| Factor | PSP Responsibility | Wallet Data Used |
|--------|-------------------|------------------|
| **Compromised credential lists** | Query breach databases | None (PSP data) |
| **Amount monitoring** | Rule engine thresholds | None (transaction context) |
| **Fraud scenario detection** | Threat intelligence + ML | WUA `device_integrity` claim |
| **Malware detection** | Consume WUA attestation | `os_version`, `app_attestation` |
| **Behavioral analysis** | Transaction patterns | None (PSP data) |


##### Threat Model: Risk Factor Bypass

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|--------|
| **Compromised list evasion** | New stolen credentials | Behavioral analysis | ⚠️ Partial |
| **Amount splitting** | Multiple small transactions | Velocity checks | ✅ Mitigated |
| **Unknown fraud scenario** | Novel attack vector | ML anomaly detection | ⚠️ Partial |
| **Malware hiding** | Advanced rootkit | Hardware attestation (SE) | ✅ Mitigated |
| **Device spoofing** | Fake WUA claims | WUA signature verification | ✅ Mitigated |

##### Gap Analysis: Risk Factors

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **RF-1** | TS12 doesn't specify which WUA claims PSPs should consume | Medium | Define recommended WUA claim set for TRA |
| **RF-2** | No standard format for wallet-to-PSP risk signals | Medium | Consider standardized risk indicator vocabulary |
| **RF-3** | Malware detection relies on platform attestation quality | Low | Document SE/TEE attestation verification guidance |
| **RF-4** | No guidance on ML model validation for TRA | Low | Consider EBA guidance alignment for ML-based TRA |

##### Recommendations for SCA Attestation Rulebook

1. **WUA Claim Usage**: Document which WUA claims PSPs should evaluate for each Art. 2(2) factor
2. **Risk Signal Vocabulary**: Define standardized risk indicator terms for wallet-PSP communication
3. **Attestation Verification**: Provide guidance on verifying WUA signatures and revocation status
4. **ML Transparency**: Reference EBA's permission of ML while noting validation requirements
5. **Factor (d) Emphasis**: Highlight wallet's key contribution to malware detection via attestation

</details>

**Context**: Typical elements include: spending patterns, device fingerprint, geographic location. The Wallet Unit Attestation (WUA) contains device properties that can contribute to this analysis, but the PSP must build the monitoring logic.
---

## 8.2 Periodic Review

► **Regulatory Basis**:
► - [RTS Art. 3](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_3): Review of the security measures

#### [Article 3(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#003.001)

► "The implementation of the security measures referred to in Article 1 shall be documented, periodically tested, evaluated and audited in accordance with the applicable legal framework of the payment service provider by auditors with expertise in IT security and payments and operationally independent within or from the payment service provider."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ❌ **PSP** | — | PSP must establish audit framework |
| ⚠️ **Evidence** | [CIR 2024/2981](https://eur-lex.europa.eu/eli/reg_impl/2024/2981/oj/eng) | Wallet Solution certification provides supporting evidence |

**Status**: ❌ PSP Obligation (with Wallet Evidence)

<details>
<summary><strong>🔍 Deep-Dive: Security Measures Review Framework</strong></summary>

##### Core Requirement: Four-Pillar Assurance

Article 3(1) mandates a **comprehensive assurance lifecycle** for SCA security measures:

| Pillar | Requirement | Frequency |
|--------|-------------|-----------|
| **Documentation** | Security measures formally documented | Continuous |
| **Testing** | Periodic testing of controls | At least annually |
| **Evaluation** | Assessment of effectiveness | Ongoing |
| **Audit** | Independent audit by qualified auditors | Per applicable framework |

```
┌-----------------------------------------------------------------------------┐
│                    Security Measures Review Lifecycle                       │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌-------------┐     ┌-------------┐     ┌-------------┐     ┌----------┐   │
│  │ DOCUMENT    │----►│   TEST      │----►│  EVALUATE   │----►│  AUDIT   │   │
│  │             │     │             │     │             │     │          │   │
│  │ - Policies  │     │ - Pen tests │     │ - KPIs/KRIs │     │ - IT sec │   │
│  │ - Procedures│     │ - Vuln scans│     │ - Fraud     │     │ - Payment│   │
│  │ - Controls  │     │ - Red team  │     │   rates     │     │   expert │   │
│  │ - Configs   │     │ - Tabletop  │     │ - Incidents │     │ - Indep. │   │
│  └-------------┘     └-------------┘     └-------------┘     └----------┘   │
│         │                                                          │        │
│         └------------------ FEEDBACK LOOP -------------------------┘        │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Auditor Requirements

| Attribute | Requirement | Example |
|-----------|-------------|---------|
| **IT Security expertise** | Knowledge of security controls, cryptography, threats | CISM, CISSP, CEH |
| **Payments expertise** | Knowledge of payment ecosystem, PSD2, SCA | Payment industry experience |
| **Operational independence** | No conflicts of interest | Internal audit, external firm |

##### PSP Audit Scope for EUDI Wallet Integration

| Area | Scope | Evidence |
|------|-------|----------|
| **Wallet integration** | API implementation, token handling | Code review, config audit |
| **Transaction monitoring** | Fraud detection, TRA implementation | System logs, rule documentation |
| **Exemption handling** | Criteria application, tracking | Decision logs, threshold configs |
| **Session management** | Timeout implementation, binding | Technical configs |
| **Incident response** | Breach procedures, notification | Incident playbooks |

##### Certification Reliance Model

PSPs can rely on **Wallet Solution certifications** (per CIR 2024/2981) to satisfy part of their audit obligations:

```
┌-----------------------------------------------------------------------------┐
│                         Certification Reliance Model                        │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  WALLET PROVIDER SCOPE (Covered by CIR 2024/2981 Certification)             │
│  ===============================================================            │
│  ✅ WSCD/WSCA security                                                       │
│  ✅ Key generation and storage                                               │
│  ✅ Biometric implementation                                                 │
│  ✅ Secure Enclave/StrongBox usage                                           │
│  ✅ Attestation generation                                                   │
│  ✅ Presentation attack detection                                            │
│                                                                             │
│  PSP SCOPE (Must audit independently)                                       │
│  ======================================                                     │
│  ❌ Integration with wallet APIs                                             │
│  ❌ Attestation verification logic                                           │
│  ❌ Transaction monitoring systems                                           │
│  ❌ Fraud detection rules                                                    │
│  ❌ Exemption criteria (Art. 10-18)                                          │
│  ❌ Session management on PSP side                                           │
│  ❌ Dynamic linking verification                                             │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Testing Activities

| Test Type | Description | Frequency |
|-----------|-------------|-----------|
| **Penetration testing** | External attack simulation | Annually |
| **Vulnerability scanning** | Automated weakness detection | Quarterly |
| **Red team exercises** | Adversarial simulation | Annually |
| **Tabletop exercises** | Incident response rehearsal | Semi-annually |
| **Control testing** | Verify control effectiveness | Continuous |

##### Documentation Requirements

| Document | Content | Owner |
|----------|---------|-------|
| **Security Policy** | High-level security objectives | CISO |
| **SCA Procedures** | Step-by-step SCA implementation | IT Security |
| **Control Matrix** | Mapping of controls to requirements | Compliance |
| **Test Results** | Pen test, vuln scan reports | Security Team |
| **Audit Trail** | Transaction logs, access logs | Operations |

##### Evaluation Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Fraud rate** | Fraudulent transactions / total | ◄ 0.01% (TRA threshold) |
| **SCA success rate** | Successful SCA / attempts | ► 95% |
| **Incident count** | Security incidents per period | Decreasing trend |
| **Exemption rate** | Exempted transactions / total | Monitored |
| **Response time** | Time to detect/respond to threats | ◄ 15 min detection |

##### Gap Analysis: Security Measures Review

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **SMR-1** | PSP audit scope for wallet integration not standardized | Medium | EBA guidance on shared audit responsibility |
| **SMR-2** | Certification reliance boundaries not explicit | Medium | Document reliance model in SCA Rulebook |
| **SMR-3** | Testing frequency not specified in RTS | Low | Recommend annual minimum in guidance |
| **SMR-4** | Auditor qualification criteria vague | Low | Reference ISO 27001 auditor standards |

##### Recommendations for SCA Attestation Rulebook

1. **Audit Scope Template**: Provide PSP audit scope template for wallet integration
2. **Certification Reliance**: Document which wallet aspects PSP can rely on
3. **Testing Cadence**: Recommend annual pen test, quarterly vuln scan
4. **Auditor Standards**: Reference ISACA, ISO 27001 auditor qualifications
5. **Evidence Sharing**: Define how wallet certification evidence transfers to PSP
6. **Incident Coordination**: Document PSP-Wallet Provider incident response

</details>

---

#### [Article 3(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#003.002)

► "The period between the audits referred to in paragraph 1 shall be determined taking into account the relevant accounting and statutory audit framework applicable to the payment service provider. However, payment service providers that make use of the exemption referred to in Article 18 shall be subject to an audit of the methodology, the model and the reported fraud rates at a minimum on a yearly basis. The auditor performing this audit shall have expertise in IT security and payments and be operationally independent within or from the payment service provider. During the first year of making use of the exemption under Article 18 and at least every 3 years thereafter, or more frequently at the competent authority's request, this audit shall be carried out by an independent and qualified external auditor."

**Status**: ❌ PSP Obligation — audit scheduling per applicable framework.

<details>
<summary><strong>🔍 Deep-Dive: Audit Frequency and TRA Exemption Requirements</strong></summary>

##### Core Requirement: Two-Tier Audit System

Article 3(2) establishes a **two-tier audit framework**:

| Tier | Applicability | Frequency | Auditor Type |
|------|---------------|-----------|--------------|
| **General Audit** | All PSPs | Per statutory framework | Internal or external |
| **TRA Exemption Audit** | PSPs using Art. 18 exemption | **Yearly minimum** | Special requirements |

```
┌-----------------------------------------------------------------------------┐
│                        TRA Exemption Audit Cadence                          │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  YEAR 1 (First use of Art. 18 exemption)                                    │
│  =======================================                                    │
│  ┌-----------------------------------------------------------------------┐  │
│  │  🔴 MANDATORY EXTERNAL AUDITOR                                        │   │
│  │     • Independent and qualified                                       │  │
│  │     • IT security + payments expertise                                │  │
│  │     • Scope: methodology, model, fraud rates                          │  │
│  └-----------------------------------------------------------------------┘  │
│                              ▼                                              │
│  YEARS 2-3 (Internal audit acceptable)                                      │
│  ======================================                                     │
│  ┌-----------------------------------------------------------------------┐  │
│  │  🟡 ANNUAL AUDIT (Internal or External)                               │   │
│  │     • Operationally independent                                       │  │
│  │     • IT security + payments expertise                                │  │
│  │     • Same scope                                                       │ │
│  └-----------------------------------------------------------------------┘  │
│                              ▼                                              │
│  YEAR 4 (and every 3 years thereafter)                                      │
│  ======================================                                     │
│  ┌-----------------------------------------------------------------------┐  │
│  │  🔴 MANDATORY EXTERNAL AUDITOR (again)                                │   │
│  │     • Cycle repeats                                                    │ │
│  └-----------------------------------------------------------------------┘  │
│                                                                             │
│  ⚠️ COMPETENT AUTHORITY may require more frequent external audits           │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### TRA Exemption Thresholds (Article 18)

The TRA exemption links transaction limits to fraud rate performance:

| Fraud Rate | Max Transaction Amount | SCA Required? |
|------------|------------------------|---------------|
| **◄ 0.13%** | Up to €100 | ❌ Exempt |
| **◄ 0.06%** | Up to €250 | ❌ Exempt |
| **◄ 0.01%** | Up to €500 | ❌ Exempt |
| **Any rate** | ► €500 | ✅ Always required |

##### TRA Audit Scope

| Audit Area | Description | Evidence |
|------------|-------------|----------|
| **Methodology** | TRA algorithm logic, risk scoring | Technical documentation |
| **Model** | Statistical model for fraud prediction | Model validation reports |
| **Reported fraud rates** | Accuracy of submitted rates | Transaction logs, fraud database |

##### Fraud Rate Reporting Schedule

| Reporting Type | Frequency | Recipient |
|----------------|-----------|-----------|
| **Fraud statistics** | Semi-annually | Competent authority |
| **TRA exemption fraud rates** | Quarterly (90 days) | Competent authority |
| **Incident reports** | As they occur | Competent authority |

##### External Auditor Qualifications

| Requirement | Description |
|-------------|-------------|
| **Independent** | No financial/operational ties to PSP |
| **Qualified** | Recognized audit credentials (e.g., Big 4, ISACA) |
| **IT security expertise** | CISSP, CISM, ISO 27001 Lead Auditor |
| **Payments expertise** | PCI-DSS QSA, payment industry experience |

##### EUDI Wallet Integration Impact

| Aspect | PSP Responsibility | Wallet Evidence |
|--------|-------------------|-----------------|
| **TRA algorithm** | PSP designs and operates | Wallet provides device risk signals |
| **Fraud rate calculation** | PSP calculates and reports | Transaction logs accessible |
| **Model validation** | PSP validates model accuracy | Wallet attestations as data point |
| **Exemption decisions** | PSP makes final decision | N/A |

##### Implementation Timeline

| Year | Audit Type | Auditor | Scope |
|------|------------|---------|-------|
| **Y1** (start of TRA) | Full TRA audit | External | Methodology, model, rates |
| **Y2** | Annual TRA audit | Internal/External | Same |
| **Y3** | Annual TRA audit | Internal/External | Same |
| **Y4** | Full TRA audit | External | Methodology, model, rates |
| **Y5-Y6** | Annual TRA audit | Internal/External | Same |
| **Y7** | Full TRA audit | External | Cycle repeats |

##### Gap Analysis: Audit Frequency

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **AF-1** | TRA audit scope for wallet-integrated PSPs not defined | Medium | Clarify wallet data role in TRA |
| **AF-2** | Fraud rate computation methodology varies | Medium | Standardize denominator/numerator |
| **AF-3** | Competent authority request frequency undefined | Low | Document escalation criteria |
| **AF-4** | Internal auditor "operational independence" criteria vague | Low | Reference IIA standards |

##### Recommendations for SCA Attestation Rulebook

1. **Wallet Data in TRA**: Document how wallet signals contribute to TRA decisions
2. **Fraud Rate Denominator**: Standardize calculation methodology
3. **Auditor Registry**: Recommend qualified external auditors for TRA
4. **Reporting Templates**: Provide standard fraud rate reporting format
5. **Internal Independence**: Reference Institute of Internal Auditors (IIA) standards
6. **Threshold Monitoring**: Define alert thresholds before breach

</details>

---

#### [Article 3(3)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#003.003)

► "This audit shall present an evaluation and report on the compliance of the payment service provider's security measures with the requirements set out in this Regulation. The entire report shall be made available to competent authorities upon their request."

**Status**: ❌ PSP Obligation — only if using TRA exemption.

<details>
<summary><strong>🔍 Deep-Dive: Audit Report and Regulatory Access</strong></summary>

##### Core Requirement: Compliance Evaluation Report

Article 3(3) mandates that the audit produce a **comprehensive evaluation** covering:

| Requirement | Description |
|-------------|-------------|
| **Evaluation** | Assessment of PSP's security measures |
| **Full Report** | Complete audit documentation |
| **Availability** | Must be provided to competent authorities on request |

```
┌-----------------------------------------------------------------------------┐
│                         Audit Report Structure                              │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  1. EXECUTIVE SUMMARY                                                       │
│     ├-- Overall compliance assessment                                       │
│     ├-- Key findings                                                        │
│     └-- Recommendations                                                     │
│                                                                             │
│  2. SCOPE AND METHODOLOGY                                                   │
│     ├-- RTS requirements covered                                            │
│     ├-- Audit procedures performed                                          │
│     └-- Sampling approach                                                   │
│                                                                             │
│  3. SECURITY MEASURES EVALUATION                                            │
│     ├-- Art. 4: Authentication code requirements                            │
│     ├-- Art. 5: Dynamic linking compliance                                  │
│     ├-- Art. 6-8: SCA factor implementation                                 │
│     ├-- Art. 9: Independence of elements                                    │
│     ├-- Art. 22: PSC lifecycle management                                   │
│     └-- Art. 23-27: Credential management                                   │
│                                                                             │
│  4. TRA EXEMPTION ASSESSMENT (if applicable)                                │
│     ├-- Methodology validation                                              │
│     ├-- Model effectiveness                                                 │
│     └-- Fraud rate accuracy                                                 │
│                                                                             │
│  5. FINDINGS AND OBSERVATIONS                                               │
│     ├-- Compliance gaps                                                     │
│     ├-- Control weaknesses                                                  │
│     └-- Remediation recommendations                                         │
│                                                                             │
│  6. APPENDICES                                                              │
│     ├-- Technical testing results                                           │
│     ├-- Evidence inventory                                                  │
│     └-- Auditor credentials                                                 │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

##### Regulatory Authority Access

| Authority | Jurisdiction | Access Rights |
|-----------|--------------|---------------|
| **National Competent Authority** | Member State | Full report on request |
| **EBA** | EU-wide | Coordination, guidance |
| **ECB** | Eurozone banks | Banking supervision |
| **FCA** | UK (post-Brexit) | Full report on request |

##### Report Availability Requirements

| Aspect | Requirement |
|--------|-------------|
| **Timing** | Upon request (no fixed deadline) |
| **Format** | Complete document (not summary) |
| **Retention** | Per applicable record-keeping laws |
| **Language** | Member State official language |

##### EUDI Wallet Integration Considerations

| Audit Area | Wallet Evidence | PSP Audit Responsibility |
|------------|-----------------|---------------------------|
| **SCA factors** | Wallet certification (CIR 2024/2981) | Integration verification |
| **Dynamic linking** | Attestation generation | Verification logic |
| **PSC lifecycle** | Key management certification | API integration |
| **Fraud monitoring** | Device risk signals | TRA model effectiveness |

##### Report Content Mapping to RTS

| RTS Article | Report Section | Evaluation Criteria |
|-------------|----------------|---------------------|
| Art. 2 | Transaction Monitoring | Fraud detection effectiveness |
| Art. 3 | Audit Framework | Audit process documentation |
| Art. 4 | Authentication Code | Cryptographic strength, uniqueness |
| Art. 5 | Dynamic Linking | Amount/payee binding verification |
| Art. 6-8 | SCA Factors | Implementation of K/P/I elements |
| Art. 9 | Independence | Breach isolation verification |
| Art. 10-18 | Exemptions | Criteria application, fraud rates |
| Art. 22-27 | PSC Management | Lifecycle security controls |

##### Competent Authority Request Scenarios

| Scenario | Trigger | Timeline |
|----------|---------|----------|
| **Routine supervision** | Scheduled review | Standard response |
| **Incident investigation** | Security breach reported | Expedited response |
| **Threshold breach** | Fraud rate exceeds limit | Immediate |
| **Complaint** | Consumer or TPP complaint | Case-dependent |

##### Gap Analysis: Audit Report

| Gap ID | Description | Severity | Recommendation |
|--------|-------------|----------|----------------|
| **AR-1** | Report template not standardized | Medium | EBA template publication |
| **AR-2** | Wallet certification reliance not explicit | Medium | Document in report scope |
| **AR-3** | Response timeline to CA requests undefined | Low | Define SLA in guidance |
| **AR-4** | Cross-border cooperation not addressed | Low | Reference EBA cooperation framework |

##### Recommendations for SCA Attestation Rulebook

1. **Report Template**: Provide standard audit report template for wallet-integrated PSPs
2. **Certification Reliance**: Document how wallet certification satisfies audit evidence
3. **Response SLA**: Define reasonable response time to competent authority requests
4. **Evidence Mapping**: Map wallet attestation evidence to RTS requirements
5. **Cross-border**: Reference EBA cross-border cooperation procedures
6. **Retention**: Define minimum retention period for audit reports

</details>

---


---

===============================================================================
# PART C: GAP ANALYSIS & RECOMMENDATIONS
===============================================================================

# 9. Consolidated Gap Analysis

The following gaps have been identified across the assessment. Items are categorized by severity and linked to their source sections.

## 9.1 Critical Gaps (Action Required)

| Gap ID | Article | Description | Impact | Recommendation |
|--------|---------|-------------|--------|----------------|
| **GAP-01** | RTS Art. 4(3)(b) | **PIN lockout NOT implemented** — Reference implementation allows unlimited PIN retries | Regulatory non-compliance | Implement 5-attempt lockout with exponential backoff |

## 9.2 Moderate Gaps (Monitor)

| Gap ID | Article | Description | Impact | Recommendation |
|--------|---------|-------------|--------|----------------|
| **GAP-02** | RTS Art. 5(2) | Overlay attack protection limited to OS-level | Sophisticated attacks may bypass | Consider RASP, secure display SDK |
| **GAP-03** | RTS Art. 5(1)(b) | mDOC format lacks `transaction_data_hashes` | ISO 18013-5 cannot do dynamic linking | Use SD-JWT-VC for payments, or await mDOC extensions |
| **GAP-04** | RTS Art. 5(1)(c) | TPP verification flow not fully specified | PSP cannot verify TPP identity in current TS12 | Monitor GitHub Discussion #439 |
| **GAP-05** | PSD2 Art. 97(1) | Missing `urn:eudi:sca:consents:1` transaction type | AISP consent capture not supported | Requested by ETPPA, await TS12 v1.1 |

## 9.3 Low-Risk Gaps (Acceptable)

| Gap ID | Article | Description | Impact | Recommendation |
|--------|---------|-------------|--------|----------------|
| **GAP-06** | RTS Art. 5(1)(a) | Display duration not mandated | User may confirm too quickly | Recommend 3s minimum in SCA Attestation Rulebook |

---

## 9.4 Gap Controllability Analysis

► **Purpose**: This section categorizes gaps by **who can address them**, helping PSPs understand:
► - What they **must implement** themselves
► - What they **depend on the wallet** for (and cannot fix)
► - What requires **ecosystem-level changes** (neither party alone can fix)

### 9.4.1 Wallet-Controlled Gaps (PSP Cannot Fix)

These gaps reside within the **Wallet/OS/Device layer**. PSPs must **rely on wallet certification** and cannot directly implement solutions.

| Gap ID | Article | Description | Why PSP Cannot Fix | PSP Mitigation |
|--------|---------|-------------|-------------------|----------------|
| **K-1** | Art. 6(1) | PIN entropy guidance not specified | Wallet controls PIN UI/validation | Request via SCA Attestation Rulebook |
| **K-2** | Art. 6(1) | PIN complexity rules vary by wallet | OS/Wallet enforces PIN policy | Rely on wallet certification |
| **K-3** | Art. 6(2) | Secure keyboard implementation | OS-level secure input | Require certified wallet |
| **K-4** | Art. 6(2) | Screen capture prevention | OS API (FLAG_SECURE) | Mandate in attestation requirements |
| **I-1** | Art. 8(1) | FAR threshold not in attestation | Biometric is OS-controlled | Rely on FIDO/OS certification |
| **I-2** | Art. 8(1) | Multi-modal fusion rules not defined | Wallet/OS decides fusion | Accept wallet's biometric choice |
| **I-3** | Art. 8(2) | PAD level not disclosed | OS biometric implementation | Require FIDO L2+ certification |
| **I-4** | Art. 8(2) | Biometric re-enrollment behavior | OS-level enrollment | Document in onboarding flow |
| **P-1** | Art. 7(1) | Hardware security level varies | Device capability | Define minimum in attestation |
| **P-2** | Art. 7(1) | Key attestation format differs | Android vs iOS APIs | Abstract via WUA |
| **P-3** | Art. 7(2) | SE fallback for devices without SE | Device hardware limitation | Reject devices without SE (policy) |
| **SC-1** | Art. 23 | PIN entropy during creation | Wallet enrollment UI | Specify in SCA Attestation Rulebook |
| **SC-2** | Art. 23 | Key algorithm flexibility | Wallet/WSCD implementation | Mandate specific algorithms |
| **SC-3** | Art. 23 | Fallback for devices without SE | Hardware limitation | Policy: require SE-capable devices |
| **DP-1** | Art. 6(2) | Secure display implementation | Wallet controls display | Require wallet certification |
| **DP-2** | Art. 6(2) | Overlay attack detection | OS/Wallet security feature | Mandate RASP in wallet requirements |
| **BR-1** | Art. 8(2) | PAD implementation details | OS biometric system | Rely on FIDO certification |
| **BR-2** | Art. 8(2) | Liveness detection quality | Device sensors/algorithms | Require FAR ◄ 1:50,000 in policy |
| **RP-1** | Art. 7(2) | Key export prevention | WSCD/SE hardware | Verify hardware attestation |
| **RP-2** | Art. 7(2) | Cloning detection mechanism | Wallet/device integrity | Check WUA validity |
| **MI-1** | Art. 22(2)(a) | PIN masking implementation | Wallet UI layer | Included in wallet certification |
| **MI-2** | Art. 22(2)(a) | Secure entry keyboard | OS-level feature | Require certified secure keyboard |
| **SPE-1** | Art. 22(4) | Secure processing environment | Device hardware (SE/TEE) | Mandate hardware security level |
| **SPE-2** | Art. 22(4) | Certification level required | Wallet Provider certification | Require L2+ in attestation policy |

**PSP Action**: For wallet-controlled gaps, PSPs should:
1. **Specify requirements** in their SCA Attestation acceptance policy
2. **Require certification** (FIDO L2+, Common Criteria, etc.)
3. **Verify attestations** contain required security claims
4. **Document reliance** on wallet certification for audit purposes

---

### 9.4.2 PSP-Addressable Gaps (PSP Must Implement)

These gaps are **within PSP control** and must be addressed through PSP implementation.

| Gap ID | Article | Description | PSP Implementation Required | Priority |
|--------|---------|-------------|----------------------------|----------|
| **TM-1** | Art. 2(1) | Transaction monitoring scope | Implement monitoring for wallet transactions | 🔴 Critical |
| **TM-2** | Art. 2(1) | Real-time vs batch analysis | Define monitoring architecture | 🟡 High |
| **TM-3** | Art. 2(2) | Risk factor weighting | Implement ML/rule-based risk scoring | 🟡 High |
| **TM-4** | Art. 2(2) | Wallet-specific risk signals | Define which wallet signals to consume | 🟡 High |
| **RF-1** | Art. 2(2) | Risk factor (a-e) implementation | Map PSD2 factors to monitoring rules | 🟡 High |
| **RF-2** | Art. 2(2) | Historical pattern analysis | Build transaction history analytics | 🟡 High |
| **ST-1** | Art. 4(3)(d) | Session timeout implementation | Enforce timeout in PSP backend | 🟡 High |
| **ST-2** | Art. 4(3)(d) | Inactivity detection | Monitor session activity | 🟡 High |
| **AF-1** | Art. 3(2) | TRA audit scope for wallet PSPs | Define audit scope for wallet integration | 🟡 High |
| **AF-2** | Art. 3(2) | Fraud rate computation | Implement fraud rate calculation | 🟡 High |
| **AR-1** | Art. 3(3) | Audit report template | Create standardized report format | 🟡 High |
| **AR-2** | Art. 3(3) | Wallet certification reliance | Document in audit reports | 🟡 High |
| **DR-1** | Art. 27(a) | Revocation propagation | Implement status update mechanism | 🔴 Critical |
| **DR-2** | Art. 27(a) | Status publication | Deploy Status List 2021 endpoint | 🟡 High |
| **PS-1** | Art. 27(c) | Backend verification check | Implement attestation status check | 🔴 Critical |
| **PS-2** | Art. 27(c) | Retention period | Define 5+ year retention policy | 🟡 High |
| **UA-1** | Art. 24 | KYC method selection | Define acceptable KYC for wallet enrollment | 🟡 High |
| **UA-4** | Art. 24 | Bootstrap SCA requirements | Define minimum SCA for bootstrapping | 🟡 High |
| **RN-1** | Art. 26 | Attestation validity period | Define renewal policy | 🟡 High |
| **RN-2** | Art. 26 | Key rotation policy | Define rotation triggers | 🟢 Medium |
| **SD-3** | Art. 25 | Delivery confirmation | Implement acknowledgment flow | 🟢 Medium |
| **SMR-1** | Art. 3(1) | Security audit framework | Establish audit procedures | 🔴 Critical |
| **SMR-2** | Art. 3(1) | Wallet certification reliance | Document certification as evidence | 🟡 High |

**PSP Action**: These gaps require direct PSP implementation:
1. **Backend systems**: Monitoring, revocation, status publication
2. **Policies**: KYC, timeout, renewal, retention
3. **Documentation**: Audit reports, certification reliance
4. **Integration**: Consume wallet signals, verify attestations

---

### 9.4.3 Ecosystem/Specification Gaps (Neither Party Alone Can Fix)

These gaps require **industry-level changes** to specifications, standards, or regulatory guidance.

| Gap ID | Article | Description | Blocked By | Resolution Path |
|--------|---------|-------------|------------|-----------------|
| **GAP-03** | Art. 5(1)(b) | mDOC lacks `transaction_data_hashes` | TS12 specification | Await TS12 v1.1 or mDOC extension |
| **GAP-04** | Art. 5(1)(c) | TPP verification flow incomplete | TS12 specification | GitHub Discussion #439 |
| **GAP-05** | Art. 97(1) | Missing `urn:eudi:sca:consents:1` | TS12 specification | Requested by ETPPA |
| **BP-1** | Art. 5(3)(a) | Batch payment schema not defined | TS12 specification | Request TS12 extension |
| **BP-2** | Art. 5(3)(a) | Corporate payment use cases | PSD2/PSR scope | Await regulatory guidance |
| **BAC-1** | Art. 5(3)(b) | Batch authentication code method | TS12 specification | Propose Merkle tree approach |
| **BAC-2** | Art. 5(3)(b) | H2H exemption not formalized | EBA guidance needed | Monitor EBA Q&A |
| **DL-1** | Art. 5(1) | Display duration not mandated | SCA Attestation Rulebook | Propose 3s minimum |
| **DL-2** | Art. 5(1) | WYSIWYS enforcement mechanism | Wallet certification scope | Include in CC profile |
| **FD-2** | Art. 4(2)(a) | `amr` values not standardized | IANA/OIDF coordination | Participate in standards |
| **CR-2** | Art. 4(2)(b) | `jti` uniqueness verification guidance | TS12/EBA guidance | Document best practices |
| **FR-2** | Art. 4(2)(c) | Trust framework discovery | EUDI ecosystem rollout | Await trust registry |
| **SP-2** | Art. 4(3)(c) | Cross-device session binding | OID4VP specification | Await HAIP profile |
| **IND-3** | Art. 9(1) | Factor independence verification | Certification scope | Define in CC profile |
| **MPD-2** | Art. 9(2) | App isolation requirements | OS/Platform standards | Reference Android/iOS docs |
| **KM-2** | Art. 22(3) | Key lifecycle documentation format | Industry standard needed | Reference NIST 800-57 |
| **UA-2** | Art. 24 | PID-based enrollment flow | EUDI ecosystem rollout | Await OID4VCI+OID4VP combined spec |
| **UA-3** | Art. 24 | Device attestation format variance | Android vs iOS divergence | Abstract via WUA standard |
| **DR-4** | Art. 27(a) | Multi-party revocation protocol | Ecosystem coordination | Define in EUDI governance |
| **PS-4** | Art. 27(c) | Cross-PSP revocation notification | Ecosystem protocol needed | Propose federated status |
| **AR-4** | Art. 3(3) | Cross-border audit cooperation | Regulatory harmonization | EBA/ECB coordination |
| **AF-3** | Art. 3(2) | CA request frequency undefined | Regulatory discretion | Accept national variation |

**PSP Action**: For ecosystem gaps, PSPs should:
1. **Monitor specifications** (TS12, OID4VP, etc.) for updates
2. **Participate in industry bodies** (EUDI working groups, OIDF)
3. **Document workarounds** for current limitations
4. **Accept residual risk** where no solution exists

---

### 9.4.4 Summary: Gap Controllability Matrix

```
┌-----------------------------------------------------------------------------┐
│                        GAP CONTROLLABILITY MATRIX                           │
├-----------------------------------------------------------------------------┤
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │  WALLET-CONTROLLED (PSP Cannot Fix)                                 │    │
│  │  ====================================                                │   │
│  │  • PIN/Biometric UI and validation                                  │    │
│  │  • Secure keyboard/display                                          │    │
│  │  • Hardware security (SE/TEE)                                       │    │
│  │  • Key generation and storage                                       │    │
│  │  • PAD/Liveness detection                                           │    │
│  │                                                                     │    │
│  │  PSP STRATEGY: Require certification, verify attestations           │    │
│  │  COUNT: ~24 gaps                                                    │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │  PSP-ADDRESSABLE (PSP Must Implement)                               │    │
│  │  ====================================                                │   │
│  │  • Transaction monitoring                                           │    │
│  │  • Risk scoring and TRA                                             │    │
│  │  • Session management                                               │    │
│  │  • Revocation and status publication                                │    │
│  │  • Audit framework and documentation                                │    │
│  │  • KYC and enrollment policies                                      │    │
│  │                                                                     │    │
│  │  PSP STRATEGY: Build systems, define policies, implement controls   │    │
│  │  COUNT: ~23 gaps                                                    │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
│  ┌---------------------------------------------------------------------┐    │
│  │  ECOSYSTEM GAPS (Neither Party Alone)                               │    │
│  │  ====================================                                │   │
│  │  • TS12 specification extensions                                    │    │
│  │  • mDOC dynamic linking                                             │    │
│  │  • Cross-PSP revocation                                             │    │
│  │  • Trust framework discovery                                        │    │
│  │  • Regulatory harmonization                                         │    │
│  │                                                                     │    │
│  │  PSP STRATEGY: Monitor, participate in standards, accept residual   │    │
│  │  COUNT: ~22 gaps                                                    │    │
│  └---------------------------------------------------------------------┘    │
│                                                                             │
└-----------------------------------------------------------------------------┘
```

### 9.4.5 Compliance Implications for PSPs

| Category | PSP Liability | Audit Evidence | Risk Acceptance |
|----------|---------------|----------------|-----------------|
| **Wallet-Controlled** | Limited (if certified wallet used) | Wallet certification + PSP acceptance policy | Residual risk documented |
| **PSP-Addressable** | Full | Implementation evidence | Must remediate |
| **Ecosystem** | Shared/Limited | Industry participation + workarounds | Documented limitation |

**Key Insight**: For **Wallet-Controlled gaps**, PSPs are **not non-compliant** if they:
1. Use a **certified wallet** (FIDO L2+, Common Criteria, etc.)
2. **Document their reliance** on wallet certification
3. **Verify attestations** contain required security claims
4. **Include this in audit reports** as evidence of due diligence



# 10. Recommendations for SCA Attestation Rulebook

The following recommendations should be incorporated into future SCA Attestation Rulebooks:

| Recommendation | Priority | Rationale |
|----------------|----------|-----------|
| **Minimum display duration** (3s) | High | Prevents accidental confirmation |
| **PIN lockout policy** (5 attempts) | Critical | RTS Art. 4(3)(b) compliance |
| **mDOC transaction binding** | Medium | Enables mDOC for payments |
| **TPP identity verification** | High | Closes PISP/AISP verification gap |
| **Overlay detection requirement** | Medium | Mitigates display manipulation attacks |


---

===============================================================================
# PART D: APPENDICES
===============================================================================

*The following appendices provide additional technical context. The compliance mapping in Parts I, II, and III is authoritative.*

## Appendix A: mDOC Protocol Gap Analysis

### Current Status

TS12 v1.0 explicitly states (Section 1.2):

► "This version of the document focuses on [SD-JWT-VC] format and [OID4VP] presentation protocol only."

### Implications

| Aspect | SD-JWT-VC (TS12 v1.0) | mDOC (Future) |
|--------|----------------------|---------------|
| Format | SD-JWT | ISO 18013-5 CBOR |
| Protocol | OID4VP | ISO 18013-5 / OID4VP |
| Authentication Code | KB-JWT with `jti` | `DeviceResponse` with `DeviceSignature` |
| Transaction Data | `transaction_data_hashes` | `IntentToRetain` / custom elements |

### Roadmap

A future TS12 version is expected to add mDOC support. The compliance mapping in this document applies to mDOC flows mutatis mutandis — the `DeviceSignature` over session data serves the same function as the KB-JWT signature.

---

## Appendix B: GitHub Discussion Analysis

### TS12 Discussion #439

**URL**: [GitHub Discussion #439](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439)

**Status** (as of Jan 2026): 39 comments, 66 replies — **most active TS discussion**

---

### Mastercard / WE BUILD LSP Payee Enhancement Proposal (Nov 27, 2025)

[Comment link](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439#discussioncomment-15096762)

Proposed **payee structure enhancements** relevant to Art. 5(1)(a) (payer awareness):

| Field | Type | Purpose |
|-------|------|---------|
| `payee_id` | REQUIRED | Identifier understood by payment system |
| `payee_name` | REQUIRED | Name displayed to payer |
| `payee_website_url` | OPTIONAL | E-commerce site URL |
| `payee_logo_url` | OPTIONAL | Visual identification |
| `estimated_amount` | OPTIONAL | Indicates if amount is estimated vs final |
| `payment_type` | OPTIONAL | `ONE_OFF` or `RECURRING` |
| `payment_summary` | OPTIONAL | Human-readable order summary |

**Compliance Relevance**: Enhances Art. 5(1)(a) by providing richer payer awareness UI. Not yet in TS12 v1.0.

► **Note**: ETPPA feedback on TPP integration and `consents:1` transaction type is documented inline at [Article 97(1)](#article-971--sca-triggers) and [Gap Analysis](#gap-05).

---

## Appendix C: SCA Attestation Rulebook Status

### Current Status (January 2026)

| Document | Status | Owner |
|----------|--------|-------|
| **TS12** (Technical Specification) | ✅ Published v1.0 | EU Commission / eIDAS Expert Group |
| **SCA Attestation Rulebook** | ❌ Not yet published | Industry (EPC, EMVCo, Payment Schemes) |

### What TS12 Does vs What the Rulebook Will Do

| Aspect | TS12 | SCA Attestation Rulebook |
|--------|------|--------------------------|
| **Scope** | Protocol and transport ("pipes") | Data schemas and semantics ("content") |
| **Defines** | OID4VP flow, KB-JWT structure, `transaction_data` parameter | Field definitions (IBAN, amount format, payee structure) |
| **Author** | EU Commission / Member States | Industry (EPC for SEPA, EMVCo for cards) |
| **Status** | Published | Drafting/Consultation phase |

### TS12 Explicit Delegation

TS12 v1.0 explicitly states:

► "The structures of the SCA Attestations to be used in conjunction with this specification are to be **specified in related SCA Attestation Rulebooks**."

And:

► "This document is complemented by related SCA Attestation Rulebooks, that may specify:
► - transactional data schema
► - visualisation hierarchy
► - ..."

### Expected Rulebook Authors

| Payment Type | Expected Authority | Scope |
|--------------|-------------------|-------|
| **SEPA Payments** | European Payments Council (EPC) | SCT, SCT Inst, SDD — defines IBAN, BIC, amount, remittance info fields |
| **Card Payments** | EMVCo / Visa / Mastercard / National Schemes | Card number, CVV handling, 3DS integration |
| **Other** | TBD | Crypto, CBDC, etc. |

### Timeline

- **TS12**: Available now (v1.0/v1.1)
- **SCA Rulebook(s)**: No official publication date announced
- **Expected**: Must be published before EUDI Wallet go-live (target: late 2026)
- **Current phase**: Likely in drafting/consultation within EPC working groups

### Implications for This Assessment

Items marked **🔶 Rulebook** in this assessment cannot be fully evaluated until the rulebook is published. These include:

| Provision | What Rulebook Will Clarify |
|-----------|---------------------------|
| Art. 4(4)(b) Lockout | Wallet-level lockout requirements beyond OS defaults |
| Art. 4(4)(d) Session timeout | Wallet-side timeout requirements (if any) |
| Art. 8(2) Knowledge complexity | PIN length/complexity requirements for SCA attestations |
| Batch payments | Multi-payee schema definition (if supported) |

### How to Track Progress

1. Monitor [TS12 GitHub Discussions](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions)
2. Watch EPC publications for SEPA SCA rulebook drafts
3. Check EMVCo specifications for card-based SCA schemas

---

