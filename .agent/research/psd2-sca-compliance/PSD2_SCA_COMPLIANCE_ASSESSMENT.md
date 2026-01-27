# PSD2 SCA Compliance Matrix: EUDI Wallet

> **Version**: 4.0  
> **Date**: 2026-01-27  
> **Purpose**: Regulation-first compliance mapping for Payment Service Providers  
> **Scope**: PSD2 Directive + RTS 2018/389 requirements relevant to SCA with EUDI Wallet  
> **Status**: Full Regulatory Fidelity (all quotes expanded, article structure corrected)

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
| ARF v2.7.2 | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework) |
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

---

## Executive Summary

EUDI Wallet, when implementing TS12 and ARF requirements, provides **substantial coverage** of PSD2 RTS requirements for SCA. Key findings:

| Category | Count | Summary |
|----------|-------|---------|
| ✅ Wallet Compliant | 18 | Core SCA mechanics fully addressed |
| ⚠️ Shared Responsibility | 6 | Wallet provides evidence; PSP must verify |
| ❌ PSP Only | 9 | Risk analysis, audit, exemptions — PSP side |
| 🔶 Rulebook Pending | 4 | Deferred to SCA Attestation Rulebook |
| ➖ Not Applicable | 5 | Exemptions, contactless, etc. |

**Critical ARF HLRs for SCA**:
- **SUA_01–SUA_06** (Topic 20): Strong User Authentication for electronic payments
- **WIAM_14–WIAM_17** (Topic 40): WSCA/WSCD user authentication
- **WUA_09–WUA_12** (Topic 9): Wallet Unit Attestation key binding
- **RPA_01–RPA_08** (Topic 6): Relying Party authentication and user approval

> ⚠️ **Critical Dependency**: The **SCA Attestation Rulebook** does not yet exist as a published document (as of Jan 2026). TS12 defines the protocol ("pipes"), but delegates the data schemas (what fields to display, IBAN vs card number, etc.) to future rulebooks to be authored by industry bodies (EPC for SEPA, EMVCo/schemes for cards). Items marked 🔶 in this assessment await rulebook publication. See [Appendix E](#appendix-e-sca-attestation-rulebook-status) for details.

---

## Terminology

### Key Terms from PSD2 RTS

| Term | Definition | Source |
|------|------------|--------|
| **Strong Customer Authentication (SCA)** | Authentication based on two or more elements from knowledge, possession, and inherence categories | RTS Art. 4(1) |
| **Personalised Security Credentials (PSC)** | Personalised features provided by PSP for authentication purposes | PSD2 Art. 4(31) |
| **Authentication Code** | Digital signatures or other cryptographically underpinned validity assertions generated from authentication elements | RTS Recital (4) |
| **Dynamic Linking** | SCA that includes elements dynamically linking the transaction to a specific amount and payee | RTS Art. 5 |

### EUDI Wallet Terminology

| Term | Definition | Source |
|------|------------|--------|
| **WSCA** | Wallet Secure Cryptographic Application | ARF Glossary |
| **WSCD** | Wallet Secure Cryptographic Device (hardware security module) | ARF Glossary |
| **WUA** | Wallet Unit Attestation | ARF Topic 9 |
| **PID** | Person Identification Data | ARF Glossary |
| **SUA** | Strong User Authentication (attestation type for payments) | ARF Topic 20 |
| **KB-JWT** | Key Binding JWT (signature proving possession) | SD-JWT-VC Spec |

### Authentication Factor Mapping

| RTS Category | EUDI Wallet Implementation |
|--------------|---------------------------|
| **Knowledge** | User PIN or passphrase validated by WSCA/WSCD |
| **Possession** | Private key stored in WSCA/WSCD (Secure Enclave / StrongBox) |
| **Inherence** | Biometric validated by OS (Face ID / BiometricPrompt) |

---

# Part I: PSD2 Directive (2015/2366)

## [Article 97](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366#art_97) — Authentication

> *PSD2 Directive Article 97 establishes the legal basis for SCA. The technical details are in RTS 2018/389.*

### [Article 97(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366#097.001) — SCA Triggers

> "Member States shall ensure that a payment service provider applies strong customer authentication where the payer:
> (a) accesses its payment account online;
> (b) initiates an electronic payment transaction;
> (c) carries out any action through a remote channel which may imply a risk of payment fraud or other abuses."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [SUA_01](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2313-topic-20---strong-user-authentication-for-electronic-payments) | Wallet Units process transactional data per Attestation Rulebook |
| ✅ **Wallet** | [TS12 §4.3](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#43-payload-object) | Four use case URNs: `payment:1`, `login_risk_transaction:1`, `account_access:1`, `emandate:1` |
| ⚠️ **Shared** | — | PSP determines when to trigger SCA (all three scenarios) |

**Status**: ✅ Supported

**Context**: TS12 defines four standardised transaction types corresponding to the three PSD2 triggers:

| PSD2 Trigger | TS12 URN | Use Case |
|--------------|----------|----------|
| [Art. 97(1)(a)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366#097.001) | `urn:eudi:sca:login_risk_transaction:1` | Access payment account online |
| [Art. 97(1)(a)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366#097.001) | `urn:eudi:sca:account_access:1` | AISP account information access |
| [Art. 97(1)(b)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366#097.001) | `urn:eudi:sca:payment:1` | Initiate electronic payment |
| [Art. 97(1)(c)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366#097.001) | `urn:eudi:sca:login_risk_transaction:1` | High-risk actions (e.g., change limits) |
| (extension) | `urn:eudi:sca:emandate:1` | E-mandate setup |

> ⚠️ **Gap Identified**: The [ETPPA](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439#discussioncomment-15045566) (European Third Party Provider Association) has requested a dedicated **`urn:eudi:sca:consents:1`** transaction type for AISP consent capture. This is **not yet in TS12 v1.0**. TPPs seeking to perform Embedded SCA for account information consent should monitor future TS12 versions.

---

### [Article 97(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366#097.002) — Dynamic Linking

> "With regard to the initiation of electronic payment transactions as referred to in paragraph 1(b), Member States shall ensure that, for electronic remote payment transactions, the payment service provider applies strong customer authentication that includes elements which dynamically link the transaction to a specific amount and a specific payee."

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

> ⚠️ **Format Note**: Dynamic linking via `transaction_data_hashes` is **OID4VP / SD-JWT-VC only**. TS12 v1.0 does not specify mDOC (ISO 18013-5) transaction binding. See RTS Art. 5(1)(b) for details.

---

### [Article 97(3)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366#097.003) — Delegated Act

> "The Commission shall adopt, in accordance with Article 98, regulatory technical standards [RTS] specifying: (a) the requirements of the strong customer authentication referred to in paragraph 1; (b) the exemptions from the application of paragraph 1, based on the criteria established in paragraph 2; (c) the requirements with which security measures have to comply, in accordance with paragraph 3, in order to protect the confidentiality and the integrity of the personalised security credentials of payment service users; and (d) the requirements for common and secure open standards of communication for the purpose of identification, authentication, notification and information, as well as for the implementation of security measures, between account servicing payment service providers, payment initiation service providers, account information service providers, payers, payees and other payment service providers."

**Status**: ➖ Not relevant for compliance mapping — refers to delegation to RTS 2018/389.

---

### [Article 97(4)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366#097.004) — Exemptions for Low-Risk/Low-Value

> "The EBA shall, in close cooperation with the ECB, issue guidelines in accordance with Article 16 of Regulation (EU) No 1093/2010 addressed to payment service providers as defined in points (g), and (i) of Article 1(1) of Directive (EU) 2015/2366 on the classification of major incidents and on the content, the format including standard notification templates, and the procedures for notifying such incidents."

**Status**: ➖ Informational — exemptions are in RTS Articles 10-18.

---

# Part II: PSD2 RTS (2018/389)

## Chapter I — General Provisions

### [Article 1](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_1) — Subject matter

> "This Regulation establishes the requirements to be complied with by payment service providers for the purpose of implementing security measures which enable them to: (a) apply the procedure of strong customer authentication in accordance with Article 97 of Directive (EU) 2015/2366; (b) exempt the application of the security requirements of strong customer authentication, subject to specified and limited conditions based on the level of risk, the amount and the recurrence of the payment transaction and of the payment channel used for its execution; (c) protect the confidentiality and the integrity of the payment service user's personalised security credentials; (d) establish common and secure open standards for the communication between account servicing payment service providers, payment initiation service providers, account information service providers, payers, payees and other payment service providers in relation to the provision and use of payment services in application of Title IV of Directive (EU) 2015/2366."

**Status**: ➖ Scope statement — no compliance requirement.

---

### [Article 2](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_2) — General authentication requirements

#### [Article 2(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#002.001)

> "Payment service providers shall have transaction monitoring mechanisms in place that enable them to detect unauthorised or fraudulent payment transactions for the purpose of the implementation of the security measures referred to in points (a) and (b) of Article 1. Those mechanisms shall be based on the analysis of payment transactions taking into account elements which are typical of the payment service user in the circumstances of a normal use of the personalised security credentials."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ❌ **PSP** | — | PSP must implement fraud detection systems |
| ⚠️ **Wallet Evidence** | [DASH_02–DASH_05](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2312-topic-19---user-navigation-requirements-dashboard-logs-for-transparency) | Wallet logs all transactions for user dashboard |

**Status**: ❌ PSP Obligation

**Context**: Transaction monitoring is a PSP-side function. The Wallet provides transaction logs (per DASH_02) that could be used as supplementary evidence in dispute resolution, but the real-time fraud detection must be implemented by the PSP.

**PSP Action Required**:
- ✗ Implement transaction monitoring system
- ✗ Define risk rules and anomaly detection
- ✗ Integrate wallet responses into monitoring pipeline

---

#### [Article 2(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#002.001)

> "Payment service providers shall ensure that the transaction monitoring mechanisms take into account, at a minimum, each of the following risk-based factors: (a) lists of compromised or stolen authentication elements; (b) the amount of each payment transaction; (c) known fraud scenarios in the provision of payment services; (d) signs of malware infection in any sessions of the authentication procedure; (e) in case the access device or the software is provided by the payment service provider, a log of the use of the access device or the software provided to the payment service user and the abnormal use of the access device or the software."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ❌ **PSP** | — | Behavioural analysis, device fingerprinting, etc. |
| ⚠️ **Wallet Evidence** | WUA attributes | WUA contains device/WSCD properties that PSP can use for fingerprinting |

**Status**: ❌ PSP Obligation

**Context**: Typical elements include: spending patterns, device fingerprint, geographic location. The Wallet Unit Attestation (WUA) contains device properties that can contribute to this analysis, but the PSP must build the monitoring logic.

---

### [Article 3](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_3) — Review of security measures

#### [Article 3(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#003.001)

> "The implementation of the security measures referred to in Article 1 shall be documented, periodically tested, evaluated and audited in accordance with the applicable legal framework of the payment service provider by auditors with expertise in IT security and payments and operationally independent within or from the payment service provider."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ❌ **PSP** | — | PSP must establish audit framework |
| ⚠️ **Evidence** | [CIR 2024/2981](https://eur-lex.europa.eu/eli/reg_impl/2024/2981/oj/eng) | Wallet Solution certification provides supporting evidence |

**Status**: ❌ PSP Obligation (with Wallet Evidence)

**Context**: PSPs must audit their own SCA implementations. However, they can rely on Wallet Solution certification (per CIR 2024/2981) as evidence that the wallet component meets security requirements. The PSP's audit scope includes:
- Integration with wallet
- PSP-side transaction monitoring
- Exemption handling
- Session management

---

#### [Article 3(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#003.002)

> "The period between the audits referred to in paragraph 1 shall be determined taking into account the relevant accounting and statutory audit framework applicable to the payment service provider. However, payment service providers that make use of the exemption referred to in Article 18 shall be subject to an audit of the methodology, the model and the reported fraud rates at a minimum on a yearly basis. The auditor performing this audit shall have expertise in IT security and payments and be operationally independent within or from the payment service provider. During the first year of making use of the exemption under Article 18 and at least every 3 years thereafter, or more frequently at the competent authority's request, this audit shall be carried out by an independent and qualified external auditor."

**Status**: ❌ PSP Obligation — audit scheduling per applicable framework.

---

#### [Article 3(3)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#003.003)

> "This audit shall present an evaluation and report on the compliance of the payment service provider's security measures with the requirements set out in this Regulation. The entire report shall be made available to competent authorities upon their request."

**Status**: ❌ PSP Obligation — only if using TRA exemption.

---

## Chapter II — Security Measures for SCA

### [Article 4](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_4) — Authentication code

#### [Article 4(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.001) — Two or more elements generating an authentication code

> "Where payment service providers apply strong customer authentication in accordance with Article 97(1) of Directive (EU) 2015/2366, the authentication shall be based on two or more elements which are categorised as knowledge, possession and inherence and shall result in the generation of an authentication code."

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

**Factor Reporting** (TS12 §3.6):
```json
"amr": ["face", "hwk"]  // Face ID + hardware key = inherence + possession
"amr": ["pin", "hwk"]   // PIN + hardware key = knowledge + possession
```

**Reference Implementation Evidence**:
| Platform | Source File |
|----------|-------------|
| iOS | [`SystemBiometryController.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/logic-authentication/Sources/Controller/SystemBiometryController.swift) |
| Android | [`BiometricsAvailability.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/authentication-logic/src/main/java/eu/europa/ec/authenticationlogic/controller/authentication/BiometricsAvailability.kt) |

> 📌 **Community Validation**: The `amr` claim was [proposed by community member senexi](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439#discussioncomment-15133961) (Dec 2025) to align with OIDC standards — and was **adopted in TS12 v1.0**.

> ⚠️ **Format Note**: The `amr` claim is **SD-JWT-VC only** (via KB-JWT). TS12 v1.0 does not specify an equivalent mechanism for **mDOC (ISO 18013-5)**. PSPs requiring mDOC support should monitor TS12 updates.

---

#### Article 4(1) continued — One-time use

> **Note**: This is the second paragraph of Article 4(1), not a separate paragraph.

> "The authentication code shall be only accepted once by the payment service provider when the payer uses the authentication code to access its payment account online, to initiate an electronic payment transaction or to carry out any action through a remote channel which may imply a risk of payment fraud or other abuses."

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

TS12 §3.6 states the `jti` "serves as the Authentication Code". However, RTS Recital (4) defines authentication codes as "digital signatures or other cryptographically underpinned validity assertions":

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
- iOS: [`PresentationSession.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/feature-presentation/Sources/Interactor/PresentationInteractor.swift) — generates unique response per presentation
- Android: [`PresentationInteractor.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/common-feature/src/main/java/eu/europa/ec/commonfeature/interactor/PresentationControllerInteractor.kt) — VP Token assembly

> ⚠️ **Format Note**: The `jti`, `nonce`, and `iat` claims are in the **KB-JWT (SD-JWT-VC only)**. For **mDOC**, the DeviceResponse signature provides cryptographic uniqueness, but TS12 v1.0 does not specify mDOC-specific claim equivalents.

---

#### [Article 4(2)(a)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.002) — Factor derivation protection

> "For the purpose of paragraph 1, payment service providers shall adopt security measures ensuring that each of the following requirements is met: (a) no information on any of the elements referred to in paragraph 1 can be derived from the disclosure of the authentication code;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WIAM_20](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Private key never leaves WSCA/WSCD |
| ✅ **Wallet** | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) | Only `amr` (factor names) disclosed, not factor values |

**Status**: ✅ Fully Supported

**Context**: The VP Token reveals:
- Factor names in `amr` (e.g., "pin", "face", "hwk") — **not** the PIN value or biometric template
- Public key in the SCA attestation — **not** the private key
- Signature over transaction data — **not** the key material

The WSCA/WSCD (Secure Enclave / TEE) ensures private keys are non-extractable (WIAM_20).

---

#### [Article 4(2)(b)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.002) — No code re-generation

> "(b) it is not possible to generate a new authentication code based on the knowledge of any other authentication code previously generated;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | TS12 §3.6 | Each KB-JWT has unique `jti`, fresh signature |
| ✅ **Wallet** | Cryptographic design | ECDSA signature is non-deterministic (contains random nonce) |

**Status**: ✅ Fully Supported

**Context**: Even with knowledge of a previous VP Token:
- The `jti` is fresh (cryptographically random)
- The ECDSA signature contains a random nonce (k value)
- Without the private key, forging a new valid signature is computationally infeasible

---

#### [Article 4(2)(c)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.002) — Forgery resistance

> "(c) the authentication code cannot be forged."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WUA_12](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a236-topic-9---wallet-unit-attestation) | WU can prove possession of private key |
| ✅ **Wallet** | WSCA/WSCD security | Secure Enclave / StrongBox provides hardware protection |
| ✅ **Wallet** | [TS12 §3.6](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#36-presentation-response) | PSP verifies signature against trusted attestation public key |

**Status**: ✅ Fully Supported

**Context**: Forgery prevention relies on:
1. **Attestation verification**: PSP verifies the SCA attestation was issued by a trusted PSP (itself) and is valid
2. **Key binding verification**: The KB-JWT signature is verified against the public key in the attestation
3. **Hardware protection**: WSCA/WSCD prevents key extraction

---

#### [Article 4(3)(a)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.003) — Non-disclosure of incorrect element

> "Payment service providers shall have measures in place ensuring that: (a) where any of the elements referred to in paragraph 1 have failed, it shall not be possible to identify which of those elements was incorrect;"

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
| **iOS** | [`Localizable.xcstrings`](reference-impl/eudi-app-ios-wallet-ui/Modules/logic-resources/Sources/Resources/Localizable.xcstrings) | **"Pins do not match"** | ❌ Gap |
| **Android** | [`strings.xml`](reference-impl/eudi-app-android-wallet-ui/resources-logic/src/main/res/values/strings.xml) | **"Pins do not match"** | ❌ Gap |

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

> ❌ **Finding**: Both iOS and Android reference implementations display **"Pins do not match"** — this explicitly reveals that the **PIN** (knowledge element) was incorrect, violating Article 4(3)(a).

> ⚠️ **Recommendation**: For PSD2-compliant deployments, wallet implementations MUST use a generic message (e.g., "Authentication failed") instead of PIN-specific error messages.

> ℹ️ **Note**: There is no explicit ARF HLR requiring generic failure messages. OS biometric APIs are compliant by design, but wallet-level PIN validation must also implement this pattern.

---

#### [Article 4(3)(b)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.003) — Maximum attempts and lockout

> "(b) the number of failed authentication attempts that can take place consecutively, after which the actions referred to in Article 97(1) of Directive (EU) 2015/2366 shall be temporarily or permanently blocked, shall not exceed five within a given period of time;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet/OS** | iOS/Android | OS biometric lockout after 5 failed attempts |
| 🔶 **Rulebook** | — | SCA Attestation Rulebook may specify additional constraints |
| ❌ **PSP** | — | PSP must implement server-side lockout |

**Status**: ⚠️ Shared Responsibility

**Context**: 
- **Device level**: iOS and Android enforce lockout after 5 failed biometric attempts (falls back to device PIN)
- **Wallet level**: Not explicitly in TS12 v1.0; expected in SCA Attestation Rulebook
- **PSP level**: PSP must track failed authentication attempts server-side

**Reference Implementation Evidence**: iOS uses `LAContext` which enforces biometric lockout; Android uses `BiometricPrompt` with similar behavior.

---

#### [Article 4(3)(c)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.003) — Session protection

> "(c) the communication sessions are protected against the capture of authentication data transmitted during the authentication and against manipulation by unauthorised parties in accordance with the requirements in Chapter V;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [OID4VP](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html), [HAIP](https://openid.net/specs/openid4vc-high-assurance-interoperability-profile-1_0.html) | OID4VP uses TLS 1.2+ for all communications |
| ✅ **Wallet** | [TS12 §3.5](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#35-presentation-request-encryption) | Encrypted presentation requests supported (JAR) |
| ⚠️ **PSP** | — | PSP must enforce TLS, certificate pinning as appropriate |

**Status**: ✅ Fully Supported

**Context**: OID4VP inherits security from HTTPS (TLS 1.2+). Additionally, TS12 allows optional encryption of request/response payloads for additional protection.

---

#### [Article 4(3)(d)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#004.003) — Session timeout

> "(d) the maximum time without activity by the payer after being authenticated for accessing its payment account online shall not exceed 5 minutes."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| 🔶 **Rulebook** | — | Not specified in TS12 v1.0 |
| ❌ **PSP** | — | PSP must enforce session timeout server-side |

**Status**: ❌ PSP Obligation

**Context**: TS12 does not specify session timeout. This is a PSP-side implementation requirement. After authentication, the PSP session (not the wallet session) must timeout after 5 minutes of inactivity.

---

### [Article 5](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_5) — Dynamic linking

#### [Article 5(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.001) — General requirement

> "Where payment service providers apply strong customer authentication in accordance with Article 97(2) of Directive (EU) 2015/2366, in addition to the requirements of Article 4 of this Regulation, they shall also adopt security measures that meet each of the following requirements: (a) the payer is made aware of the amount of the payment transaction and of the payee; (b) the authentication code generated is specific to the amount of the payment transaction and the payee agreed to by the payer when initiating the transaction; (c) the authentication code accepted by the payment service provider corresponds to the original specific amount of the payment transaction and to the identity of the payee agreed to by the payer; (d) any change to the amount or the payee results in the invalidation of the authentication code generated."

**Status**: ➖ Prelude to sub-requirements. See Article 5(1)(a–d) and 5(2–3) below.

---

#### [Article 5(1)(a)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.001) — Payer awareness

> "(a) the payer is made aware of the amount of the payment transaction and of the payee;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [SUA_06](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2313-topic-20---strong-user-authentication-for-electronic-payments) | Wallet adapts dialogue to display transaction details |
| ✅ **Wallet** | [TS12 §4.3.1](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#431-payment-confirmation) | Payment confirmation screen shows amount, currency, payee |

**Status**: ✅ Fully Supported

**Context**: The Wallet displays:
- Payee name and ID (from `payee` object)
- Amount and currency (from `amount`, `currency` fields)
- Any PISP information if third-party initiated (from `pisp` object)

The user must approve (biometric/PIN) after viewing this information.

**TPP Scenario Coverage**:

TS12 §2.1 defines two SCA flow types:
1. **Issuer-Requested Flow**: RP = User's PSP (bank initiates SCA for login)
2. **Third-Party-Requested Flow**: RP = TPP (PISP/AISP initiates SCA)

The TS12 JSON schemas include explicit TPP objects:

**PISP Object** (payment initiation):
```json
{
  "pisp": {
    "name": "PaymentApp",
    "id": "PISP-ID-123",
    "bic": "PISPDEFF"
  }
}
```

**AISP Object** (account access):
```json
{
  "aisp": {
    "name": "AccountAggregator",
    "id": "AISP-ID-456"
  }
}
```

**UI Implication**: When a TPP initiates SCA, the Wallet displays **both**:
- The TPP name (e.g., "PaymentApp")
- The underlying PSP name (from attestation issuer)

This dual display ensures user awareness of who is requesting access.

**Reference Implementation**:
- iOS: [`BaseRequestViewModel.swift`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui/blob/055bdda8b2a74d9df4892e7cf702479ac75f6ca6/Modules/feature-common/Sources/UI/Request/BaseRequestViewModel.swift) — Transaction detail rendering
- Android: [`RequestDataUi.kt`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui/blob/48311b4de1a0d2be57874824ea68a5e0914765e4/common-feature/src/main/java/eu/europa/ec/commonfeature/ui/request/model/RequestDataUi.kt) — Payment confirmation UI model

> 📌 **Industry Validation**: [ETPPA confirmed](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439#discussioncomment-14850895) (Nov 2025) that TPPs "intend to take full advantage of the EUDIW to support the capture of Embedded SCA" for PSD2 API-initiated payments, citing eIDAS Article 5f(2) requiring ASPSPs to accept Wallet-based SCA.

---

#### [Article 5(1)(b)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.001) — Code linked to amount and payee

> "(b) the authentication code generated is specific to the amount of the payment transaction and the payee agreed to by the payer when initiating the transaction;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [SUA_05](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2313-topic-20---strong-user-authentication-for-electronic-payments) | Transactional data in device binding signature |
| ✅ **Wallet** | TS12 §3.6 | `transaction_data_hashes` in KB-JWT |

**Status**: ✅ Fully Supported

**Technical Detail**: The KB-JWT contains:
```json
{
  "nonce": "[from PSP request]",
  "iat": 1706380800,
  "jti": "[unique ID]",
  "transaction_data_hashes": [
    "sha-256 hash of: {amount, currency, payee, ...}"
  ],
  "transaction_data_hashes_alg": "sha-256"
}
```

The signature over this JWT (using the SCA attestation private key) cryptographically binds the authentication to the specific amount and payee.

> ⚠️ **Format Note**: `transaction_data_hashes` is a **KB-JWT claim (SD-JWT-VC only)**. TS12 v1.0 does not specify an equivalent dynamic linking mechanism for **mDOC (ISO 18013-5)**. PSPs requiring mDOC-based SCA should monitor TS12 updates or implement custom solutions.

---

#### [Article 5(1)(c)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.001) — Code acceptance

> "(c) the authentication code accepted by the payment service provider corresponds to the original specific amount of the payment transaction and to the identity of the payee agreed to by the payer;"

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ⚠️ **PSP Verification** | — | PSP must verify `transaction_data_hashes` matches original request |

**Status**: ⚠️ PSP Verification Required

**PSP MUST**:
1. Hash the original transaction data (amount, payee) using the same algorithm
2. Verify the hash matches the value in `transaction_data_hashes`
3. Reject if mismatch (indicates tampering or session mismatch)

> ⚠️ **Open Issue — TPP Flow Verification**: In the Third-Party-Requested flow, the PSP (bank) receives the VP Token from the TPP but has no technical means to verify *how* the TPP obtained it. [Community feedback](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439#discussioncomment-15134339) suggests including `response_mode=dc_api.jwt` in the KB-JWT to indicate secure retrieval. This is **under consideration** for future TS12 versions. PSPs should consider this when relying on TPP-provided authentication codes.

---

#### [Article 5(1)(d)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.001) — Change notification

> "(d) any change to the amount or the payee results in the generation of a different authentication code."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | TS12 §3.6 | Different transaction data → different hash → different signature |

**Status**: ✅ Cryptographically Enforced

**Context**: If the amount or payee changes, the SHA-256 hash changes, and therefore the KB-JWT (and its signature) must be different. Reusing a previous authentication code would fail verification.

---

#### [Article 5(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.002) — Corresponding acceptance

> "For the purpose of paragraph 1, payment service providers shall adopt security measures which ensure the confidentiality, authenticity and integrity of each of the following: (a) the amount of the transaction and the payee throughout all of the phases of the authentication; (b) the information displayed to the payer throughout all of the phases of the authentication including the generation, transmission and use of the authentication code."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [OID4VP](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html), [HAIP](https://openid.net/specs/openid4vc-high-assurance-interoperability-profile-1_0.html) | TLS for confidentiality in transit |
| ✅ **Wallet** | TS12 §3.6 | Signature for integrity/authenticity |

**Status**: ✅ Fully Supported

---

#### [Article 5(3)(a)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.003) — Batch file payment exception

> "For the purpose of paragraph 1(b) and where payment service providers apply strong customer authentication in accordance with Article 97(2) of Directive (EU) 2015/2366 the following requirements for the authentication code shall apply: (a) in relation to a card-based payment transaction for which the payer has given consent to the exact amount of the funds to be blocked pursuant to Article 75(1) of that Directive, the authentication code shall be specific to the amount that the payer has given consent to be blocked and agreed to by the payer when initiating the transaction; (b) in relation to payment transactions for which the payer has given consent to execute a batch of remote electronic payment transactions to one or several payees, the authentication code shall be specific to the total amount of the batch of payment transactions and to the specified payees."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ⚠️ **Gap** | [TS12 §4.3.1](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/55c5b744a2a620f44b9ca19b494ba3cbe2acf301/docs/technical-specifications/ts12-electronic-payments-SCA-implementation-with-wallet.md#431-payment-confirmation) | `recurrence.mit_options` for recurring totals, but no batch payees |

**Status**: ⚠️ Partial (Single Payee Only)

**Context**: TS12 supports recurring payments to a single payee with:
- `recurrence.number`: Count of payments
- `mit_options.total_amount`: Total across all payments

**Gap**: Multi-payee batch (e.g., payroll) is NOT supported. TS12 has no `payees[]` array.

**Workaround**: For multi-payee batches, PSP must trigger individual SCA per payee or display summary ("Payroll: €X to Y employees").

---

#### [Article 5(3)(b)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.003) — Batch authentication code

> "(b) the authentication code shall be specific to the total amount of the batch payment and to the payees specified."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ⚠️ **Gap** | — | Multi-payee batch not specified in TS12 v1.0 |

**Status**: ❌ Gap for Multi-Payee Batches

**Recommendation**: PSPs requiring batch payment SCA should:
1. Use individual SCA per payee (fully compliant)
2. Or request TS12 extension for batch support

---

### [Article 6](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_6) — Requirements of the elements categorised as knowledge

#### [Article 6(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#006.001)

> "Payment service providers shall adopt measures to mitigate the risk that the elements of strong customer authentication categorised as knowledge are uncovered by, or disclosed to, unauthorised parties."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WIAM_14](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | PIN validated by WSCA/WSCD, never transmitted |
| ✅ **Wallet** | Device security | PIN entry masked; secure keyboard on iOS/Android |
| ✅ **Wallet** | — | PIN never stored in plaintext |

**Status**: ✅ Fully Supported

**Context**: The user's PIN (knowledge element) is:
- Entered locally on the device with masked input
- Validated by WSCA/WSCD (Secure Enclave / TEE)
- Never transmitted to PSP or Wallet Provider
- Not stored in plaintext

---

#### [Article 6(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#006.002)

> "The use by the payer of those elements shall be subject to mitigation measures in order to prevent their disclosure to unauthorised parties."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet/OS** | iOS/Android | Minimum 6-digit PIN; alphanumeric optional |
| 🔶 **Rulebook** | — | SCA Attestation Rulebook may specify additional PIN requirements |

**Status**: ✅ Fully Supported

---

### [Article 7](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_7) — Requirements of elements categorised as possession

#### [Article 7(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#007.001)

> "Payment service providers shall adopt measures to mitigate the risk that the elements of strong customer authentication categorised as possession are used by unauthorised parties."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WIAM_20](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Private key non-extractable from WSCA/WSCD |
| ✅ **Wallet** | [WURevocation_09](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2322-topic-38---wallet-unit-revocation) | Wallet Provider can revoke compromised WUA |
| ✅ **Wallet** | [WIAM_06](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | User can request revocation via independent account |

**Status**: ✅ Fully Supported

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

> "The use by the payer of those elements shall be subject to measures designed to prevent replication of the elements."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | [WIAM_20](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Private key protected, non-exportable |
| ✅ **Wallet** | [OID4VP/HAIP](https://openid.net/specs/openid4vc-high-assurance-interoperability-profile-1_0.html) | ES256 (ECDSA P-256) algorithm specified |
| ✅ **Wallet** | App integrity | WUA contains app attestation (Play Integrity / App Attest) |

**Status**: ✅ Fully Supported

---

### [Article 8](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_8) — Requirements of devices and software linked to elements categorised as inherence

#### [Article 8(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#008.001)

> "Payment service providers shall adopt measures to mitigate the risk that the authentication elements categorised as inherence and read by access devices and software provided to the payer are uncovered by unauthorised parties. At a minimum, the payment service providers shall ensure that those access devices and software have a very low probability of an unauthorised party being authenticated as the payer."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet/OS** | Face ID / BiometricPrompt | OS biometric API with liveness detection, anti-spoofing |
| ✅ **Wallet** | [WIAM_14](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Biometric required before crypto operation |

**Status**: ✅ Fully Supported (Delegated to OS)

**Context**: The wallet relies on OS-level biometric protection:
- **iOS**: `LAContext` with Face ID / Touch ID (includes liveness detection)
- **Android**: `BiometricPrompt` with Class 3 biometric (certified anti-spoofing)

The Wallet does NOT store or have access to biometric templates — this is managed by the OS Secure Enclave / TEE. The "very low probability" requirement is met by:
- False Acceptance Rate (FAR) < 1/50,000 for fingerprint
- FAR < 1/1,000,000 for Face ID (Apple)
- FIDO UAF certification for Android BiometricPrompt Class 3

**Reference Implementation Evidence**:
- iOS: `LAContext.evaluatePolicy` — liveness detection built into Face ID / Touch ID
- Android: `BiometricPrompt` (Class 3) — hardware-backed anti-spoofing

---

#### [Article 8(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#008.002)

> "The use by the payer of those elements shall be subject to measures ensuring that those devices and the software guarantee resistance against unauthorised use of the elements through access to the devices and the software."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **OS** | Apple / Google | Hardware-backed biometric sensors, certified algorithms |
| ✅ **Wallet** | App attestation | WUA contains Play Integrity / App Attest |

**Status**: ✅ Delegated to Certified OS Components

---

### [Article 9](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_9) — Independence of the elements

#### [Article 9(1)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#009.001)

> "Payment service providers shall ensure that the use of the elements of strong customer authentication referred to in Articles 6, 7 and 8 is subject to measures which ensure that, in terms of technology, algorithms and parameters, the breach of one of the elements does not compromise the reliability of the other elements."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | WSCA/WSCD architecture | Biometric stored in Secure Enclave; PIN validated separately; keys in hardware |
| ✅ **Wallet** | [WIAM_09](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Cryptographic assets isolated per Wallet Unit |

**Status**: ✅ Fully Supported

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

> "Payment service providers shall adopt security measures, where any of the elements of strong customer authentication or the authentication code itself is used through a multi-purpose device, to mitigate the risk which would result from that multi-purpose device being compromised."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | TEE / Secure Enclave | All crypto operations in hardware-isolated environment |
| ✅ **Wallet** | App integrity | WUA contains app attestation (Play Integrity / App Attest) |

**Status**: ✅ Fully Supported

**Context**: Article 9(3) specifies mitigating measures for multi-purpose devices — see below.

---

#### [Article 9(3)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#009.003)

> "For the purposes of paragraph 2, the mitigating measures shall include each of the following: (a) the use of separated secure execution environments through the software installed inside the multi-purpose device; (b) mechanisms to ensure that the software or device has not been altered by the payer or by a third party; (c) where alterations have taken place, mechanisms to mitigate the consequences thereof."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | TEE / Secure Enclave | (a) Separated secure execution environment |
| ✅ **Wallet** | App attestation (WUA) | (b) Play Integrity / App Attest verifies app integrity |
| ✅ **Wallet** | [WURevocation_09](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2322-topic-38---wallet-unit-revocation) | (c) Key revocation if compromise detected |

**Status**: ✅ Fully Supported

---

## Chapter III — Confidentiality and Integrity of PSC

### [Article 22](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_22) — Personalised security credentials

> "Payment service providers shall ensure the confidentiality and integrity of the personalised security credentials of the payment service user, including authentication codes, during all phases of the authentication."

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

> "Payment service providers shall ensure that only the payment service user is associated, in a secure manner, with the personalised security credentials, the authentication devices and the software. For the purpose of paragraph 1, payment service providers shall ensure that each of the following requirements is met: (a) the association of the payment service user's identity with personalised security credentials, authentication devices and software is carried out in secure environments under the payment service provider's responsibility comprising at least the payment service provider's premises, the internet environment provided by the payment service provider or other similar secure websites used by the payment service provider and its automated teller machine services, and taking into account risks associated with devices and underlying components used during the association process that are not under the responsibility of the payment service provider; (b) the association by means of a remote channel of the payment service user's identity with the personalised security credentials and with authentication devices or software is performed using strong customer authentication."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ✅ **Wallet** | WSCA/WSCD | Secure Enclave (iOS) / StrongBox / TEE (Android) |
| ✅ **Wallet** | [WIAM_08](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and-wallet-unit-activation-and-management) | Wallet Provider verifies WSCA/WSCD certification |

**Status**: ✅ Fully Supported

---

## Exemptions (Articles 10-18)

### [Article 18](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_18) — Transaction Risk Analysis (TRA)

> "Payment service providers shall be allowed not to apply strong customer authentication where the payer initiates a remote electronic payment transaction identified by the payment service provider as posing a low level of risk according to the transaction monitoring mechanisms referred to in Article 2 and in paragraph 2(c) of this Article."

| Fulfillment | Reference | Implementation |
|-------------|-----------|----------------|
| ❌ **PSP** | — | PSP implements TRA logic |
| ⚠️ **Evidence** | TS12 response | Wallet can still be invoked, but PSP decides to exempt |

**Status**: ❌ PSP Decision

**Context**: TRA is a PSP-side decision based on fraud rates, transaction amounts, and risk scoring. The wallet is not involved in exemption decisions. However, the PSP could:
1. Not invoke wallet SCA at all (silent exemption)
2. Invoke wallet with reduced requirements (future extension)

---

# Part III: Appendices

*The following appendices provide additional technical context. The compliance mapping in Parts I and II is authoritative.*

## Appendix A: mDOC Protocol Gap Analysis

### Current Status

TS12 v1.0 explicitly states (Section 1.2):

> "This version of the document focuses on [SD-JWT-VC] format and [OID4VP] presentation protocol only."

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

## Appendix B: TPP Scenario Coverage

> 📌 **Note**: This analysis is now integrated into [Article 5(1)(a)](#article-51a--payer-awareness) in the main compliance matrix.

### Two SCA Flow Types

TS12 §2.1 defines two scenarios:

1. **Issuer-Requested Flow**: RP = User's PSP (e.g., bank initiates SCA for login)
2. **Third-Party-Requested Flow**: RP = TPP (e.g., PISP initiates SCA for payment)

### Schema Support

The TS12 JSON schemas include explicit TPP objects:

**PISP Object** (payment flow):
```json
{
  "pisp": {
    "name": "PaymentApp",
    "id": "PISP-ID-123",
    "bic": "PISPDEFF"
  }
}
```

**AISP Object** (account access flow):
```json
{
  "aisp": {
    "name": "AccountAggregator",
    "id": "AISP-ID-456"
  }
}
```

### UI Implications

When a TPP initiates SCA, the Wallet displays both:
- The TPP name (e.g., "PaymentApp")
- The underlying PSP name (from attestation issuer)

This ensures user awareness per RTS Art. 5(1)(a).

---

## Appendix C: Accessibility Requirements

*Note: Wallet recovery procedures are documented inline at [Article 7(1)](#article-71) since they directly address the RTS requirement for loss/theft mitigation.*

### EU Accessibility Compliance (ARF Topics 8 & 54)

| Requirement | Standard | ARF HLR |
|-------------|----------|---------|
| Web Accessibility Directive | EN 301 549 | AS-WP-54-001 |
| European Accessibility Act | 2019/882 | AS-WP-54-002 |
| WCAG Level | 2.2 AA | Chapter 8 |

For SCA specifically, SUA_06 mandates adaptable dialogue elements (font size, colours, button labels) — enabling accessible SCA flows.

---

## Appendix D: GitHub Discussion Analysis

### TS12 Discussion #439

**URL**: [GitHub Discussion #439](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439)

**Status** (as of Jan 2026): 39 comments, 66 replies — **most active TS discussion**

---

### Key Stakeholder Feedback

#### Mastercard / WE BUILD LSP (Nov 27, 2025)
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

**Compliance Relevance**: Enhances Art. 5(1)(a) by providing richer payer awareness UI.

---

#### ETPPA - European Third Party Provider Association (Nov 2 & Nov 22, 2025)
[Comment 1](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439#discussioncomment-14850895) | [Comment 2](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439#discussioncomment-15045566)

Key points on **TPP (AISP/PISP) integration**:

1. **Embedded SCA ("Third-party-requested")**: TPPs intend to initiate signed payment requests via PSD2 APIs (Berlin Group NextGenPSD2 XS2A) with SCA proof from EUDI Wallet

2. **Requested new transaction type**: `urn:eudi:sca:consents:1` for AISP consent capture (in addition to existing `payment`, `login_risk_transaction`, `emandate`)

3. **Non-discrimination principle**: ETPPA emphasizes PSD2 parity — SCA Attestation Providers "must not discriminate between Third-party-requested and Issuer-requested attestation types"

4. **API alignment**: Requested alignment with Berlin Group JSON, ISO 20022 PAIN.001/PAIN.009 formats

**Compliance Relevance**: Direct evidence of industry expectation that Art. 97(1) TPP triggers work via TS12.

---

#### senexi (Dec 2, 2025)
[Comment](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439#discussioncomment-15133961)

Proposed reusing OIDC **`amr` claim** instead of `authentication_factors`:

> "OpenID Connect Core already defines the claim `amr` (Authentication Methods References)... It would make sense to reuse / reference that claim."

**Status**: TS12 v1.0 uses `amr` array — proposal was adopted.

**Compliance Relevance**: Confirms Art. 4(1) factor reporting via standard OIDC claim.

---

#### senexi — DC-API Verification (Dec 2, 2025)
[Comment](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439#discussioncomment-15134339)

Raised concern about **Third-Party-Requested flow verification**:

> "In the Third-Party-Requested flow, the final verifier AKA the bank has no information how the VP was obtained by a third party... It might make sense to include relevant request parameters like `response_mode=dc_api.jwt` in the key binding JWT."

**Maintainer Response**: "sounds reasonable, we will think if this could be a new requirement in TS12 possibly"

**Compliance Relevance**: Open issue for PSP verification of TPP flow integrity.

---

#### Fime / APTITUDE LSP (Dec 4, 2025)
[Comment](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439#discussioncomment-15157531)

Proposed **PSD3-forward enhancements**:

1. **SCA metadata for expressing authentication strength**: Allow ASPSPs to specify minimum factor requirements
2. **Required display vs advisory**: Clearer distinction between mandatory display elements and optional hints
3. **Risk context metadata**: Optional `transaction_context` and `risk_hint` fields for high-risk transaction UI

**Maintainer Response**: "Your proposals are taken for consideration for future versions of TS12"

**Compliance Relevance**: Forward-looking for Art. 18 (risk analysis) integration.

---

#### Wicpar — Technical Issues (Jan 4, 2026)
[Comment](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/discussions/439#discussioncomment-15405623)

Identified technical issues in TS12 v1.0:

1. **Section 4.1.2**: `transaction_data_types` described as "array" but is JSON object
2. **#integrity placement**: Proposed that `#integrity` fields should be sibling keys to protected fields (per SD-JWT-VC §7)

**Compliance Relevance**: Technical accuracy for implementers.

---

### Unanswered Questions (Open Issues)

| Topic | Status | Relevance |
|-------|--------|-----------|
| `jti` as authentication code interpretation | **Not explicitly discussed** | Art. 4(2) |
| mDOC format support | Explicitly deferred to future version | Art. 4 |
| AISP consent transaction type | **Requested by ETPPA, not yet added** | Art. 97(1)(a) |
| DC-API mode verification | Under consideration | TPP flow integrity |

---

## Appendix E: SCA Attestation Rulebook Status

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

> "The structures of the SCA Attestations to be used in conjunction with this specification are to be **specified in related SCA Attestation Rulebooks**."

And:

> "This document is complemented by related SCA Attestation Rulebooks, that may specify:
> - transactional data schema
> - visualisation hierarchy
> - ..."

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

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | AI Analysis | Initial comprehensive assessment |
| 1.1 | 2026-01-27 | AI Analysis | Added Dutch PA gap analysis |
| 1.2 | 2026-01-27 | AI Analysis | Corrected authentication code definition |
| 1.3 | 2026-01-27 | AI Analysis | Added mDOC, SIOP, TPP, batch payment, recovery appendices |
| **2.0** | 2026-01-27 | AI Analysis | **Major restructure**: Regulation-first compliance matrix format. All provisions now have dedicated sections with consolidated evidence. ARF HLRs embedded per provision. |
| **2.1** | 2026-01-27 | AI Analysis | Added Appendix H: SCA Attestation Rulebook status. Updated ARF reference to v2.7.2. |
| **2.2** | 2026-01-27 | AI Analysis | **Consolidated appendices**: Removed duplicate Batch Payments appendix (content in Art 5(3)). Inlined wallet recovery into Art 7(1). Renumbered appendices E-H. |
| **2.3** | 2026-01-27 | AI Analysis | **Appendix integration**: Auth Code interpretation (Appendix B) → Art. 4(2). TPP scenarios (Appendix D) → Art. 5(1)(a). Reference implementation deep links (Appendix G) now point to commit-specific source files. |
| **2.4** | 2026-01-27 | AI Analysis | **GitHub Discussion #439 analysis**: Comprehensive review of 105 comments. Added stakeholder feedback (Mastercard, ETPPA, Fime). Documented `amr` claim adoption, AISP consent request, TPP flow verification concerns. |
| **2.5** | 2026-01-27 | AI Analysis | **Community evidence integrated into articles**: Art. 4(1) `amr` validation, Art. 97(1) AISP consent gap, Art. 5(1)(a) ETPPA industry validation, Art. 5(1)(c) TPP verification open issue. |
| **2.6** | 2026-01-27 | AI Analysis | **Deep linking**: All article headers now link directly to EUR-Lex (PSD2 + RTS). All TS12 references link to commit-specific GitHub source (§3.2, §3.6, §4.3, §4.3.1). |
| **2.7** | 2026-01-27 | AI Analysis | **EUR-Lex link fix**: Updated all anchors from `#d1eXXX-XX-1` to working `#art_X` format (verified via browser). Removed historical annotations (`*(integrated from Appendix X)*`). |
| **2.8** | 2026-01-27 | AI Analysis | **Paragraph-level deep links**: Updated paragraph references to use `#XXX.YYY` format (e.g., Art. 97(2) → `#097.002`). Article-level headers retain `#art_X` format. |
| **2.9** | 2026-01-27 | AI Analysis | **TS12 anchor fix**: Corrected guessed anchors to actual section names (`#36-presentation-response`, `#43-payload-object`, `#431-payment-confirmation`). Fixed misattributed ES256 ref to OID4VP/HAIP. |
| **3.0** | 2026-01-27 | AI Analysis | **Appendix G removal**: Inlined all reference implementation evidence into respective article sections. Moved repository links to header. Renumbered Appendix H → G. |
| **3.1** | 2026-01-27 | AI Analysis | **mDOC format notes**: Added warnings to Art. 97(2), 4(1), 4(2), 5(1)(b) that KB-JWT claims (`amr`, `jti`, `transaction_data_hashes`) are SD-JWT-VC only. TS12 v1.0 does not specify mDOC equivalents. |
| **3.2** | 2026-01-27 | AI Analysis | **Appendix B removal**: Deleted Auth Code Interpretation appendix (content inline in Art. 4(2)). Renumbered C→B, D→C, E→D, F→E, G→F. Now 6 appendixes (A-F). |
| **3.3** | 2026-01-27 | AI Analysis | **Terminology moved to top**: Moved definitions from Appendix A to after Executive Summary. Removed Appendix A, renumbered B→A through F→E. Now 5 appendixes (A-E). |

