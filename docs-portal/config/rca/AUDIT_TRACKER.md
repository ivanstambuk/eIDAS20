# RCA Systematic Audit Tracker

This document tracks the systematic review of all eIDAS 2.0 legal sources for Relying Party requirements.

**Last Updated:** 2026-01-19
**Current Requirements Count:** 87
**Schema Version:** 10

---

## Legend

| Status | Meaning |
|--------|---------|
| ⬜ | Not yet reviewed |
| 🔍 | Under review |
| ✅ | Reviewed - RP requirements extracted |
| ➖ | Reviewed - No RP requirements found |
| 🔄 | Needs re-review |

---

## 1. Regulation (EU) No 910/2014 (Consolidated)

Source: `01_regulation/2014_910_eIDAS_Consolidated/02014R0910-20241018.md`

### Chapter I - General Provisions (Articles 1-4)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter | ➖ | | Scope definition - no RP obligations |
| Art. 2 | Scope | ➖ | | Applicability rules - no RP obligations |
| Art. 3 | Definitions | ➖ | | Key terms including "relying party" definition |
| Art. 4 | Internal market principle | ➖ | | Free circulation - no RP obligations |

### Chapter II - Electronic Identification (Articles 5-12b)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 5 | Pseudonyms in electronic transactions | ➖ | | Users may use pseudonyms - no RP obligation |
| Art. 5a | European Digital Identity Wallets | ✅ | RP-REG-001 to RP-REG-006 | Para 5(c): RPs must authenticate; Para 8: validation mechanisms |
| Art. 5b | Relying parties of EUDI Wallets | ✅ | RP-REG-001 to RP-REG-012 | Core RP registration, authentication, data request obligations |
| Art. 5c | Certification of EUDI Wallets | ➖ | | Wallet provider/CAB duties - no RP obligations |
| Art. 5d | Publication of certified EUDI Wallets | ➖ | | Member State/Commission duties |
| Art. 5e | Security breach of EUDI Wallets | ✅ | RP-SEC-001 to RP-SEC-003 | Para 1,3: RPs must be informed of suspensions/breaches |
| Art. 5f | Cross-border reliance on EUDI Wallets | ✅ | RP-ACCEPT-001 to RP-ACCEPT-003 | Mandatory acceptance for public sector + specified private RPs |
| Art. 6 | Mutual recognition | ➖ | | Member State recognition duties |
| Art. 7 | Eligibility for notification | ➖ | | Member State notification criteria |
| Art. 8 | Assurance levels | ➖ | | Defines assurance levels - no RP obligations |
| Art. 9 | Notification | ➖ | | Member State notification procedures |
| Art. 10 | Security breach of eID schemes | ➖ | | Member State duties for eID breaches |
| Art. 11 | Liability | ➖ | | Liability of MS/issuers - no direct RP obligations |
| Art. 11a | Cross-border identity matching | ✅ | RP-AUTH-009 to RP-AUTH-013 | RPs acting for cross-border services - identity matching |
| Art. 12 | Interoperability | ➖ | | Interoperability framework - MS duties |
| Art. 12a | Certification of eID schemes | ➖ | | Certification by CABs - no RP obligations |
| Art. 12b | Access to hardware and software features | ➖ | | Platform access - wallet provider/issuer focus |

### Chapter III - Trust Services (Articles 13-24a)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 13 | Liability and burden of proof | ➖ | | TSP liability framework - no RP obligations |
| Art. 14 | International aspects | ➖ | | Third country recognition - Commission duties |
| Art. 15 | Accessibility | ➖ | | Accessibility requirements for TSPs |
| Art. 16 | Penalties | ➖ | | Member State penalty rules |
| Art. 17 | Supervisory body | ➖ | | Supervisory body designation - MS duties |
| Art. 18 | Mutual assistance | ➖ | | Supervisory body cooperation |
| Art. 19 | Security requirements for TSPs | ➖ | | TSP security measures |
| Art. 19a | Requirements for non-qualified TSPs | ➖ | | Non-qualified TSP obligations |
| Art. 20 | Supervision of qualified TSPs | ➖ | | QTSP audit/supervision |
| Art. 21 | Initiation of qualified trust service | ➖ | | QTSP initiation procedures |
| Art. 22 | Trusted lists | ➖ | | Member State trusted list duties |
| Art. 23 | EU trust mark | ➖ | | Trust mark usage by QTSPs |
| Art. 24 | Requirements for qualified TSPs | ✅ | RP-ESIG-016 | Para 4: QTSPs must provide RPs with certificate status info |
| Art. 24a | Recognition of qualified trust services | ➖ | | Cross-border recognition rules |

### Chapter III, Section 2 - Electronic Signatures (Articles 25-34)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 25 | Legal effects of electronic signatures | ✅ | RP-ESIG-001 to RP-ESIG-003 | RPs must not deny legal effect |
| Art. 26 | Requirements for advanced e-signatures | ➖ | | Definition of advanced e-sig requirements |
| Art. 27 | Electronic signatures in public services | ✅ | RP-ESIG-004 to RP-ESIG-006 | Public sector RPs must accept specified formats |
| Art. 28 | Qualified certificates for e-signatures | ➖ | | Certificate content requirements - TSP focus |
| Art. 29 | Requirements for qualified e-sig creation devices | ➖ | | QSCD requirements - device manufacturers |
| Art. 29a | Requirements for remote QSCD management | ➖ | | QTSP remote management duties |
| Art. 30 | Certification of QSCDs | ➖ | | CAB/MS certification duties |
| Art. 31 | Publication of certified QSCDs | ➖ | | MS/Commission publication duties |
| Art. 32 | Validation of qualified e-signatures | ✅ | RP-ESIG-007 to RP-ESIG-009 | Validation requirements with RP focus (data to RP) |
| Art. 32a | Validation of advanced e-signatures | ✅ | RP-ESIG-007 (related) | Similar validation requirements for advanced sigs |
| Art. 33 | Qualified validation service | ➖ | | QVSP requirements - TSP focus |
| Art. 34 | Qualified preservation service | ➖ | | Preservation service requirements - TSP focus |

### Chapter III, Section 3 - Electronic Seals (Articles 35-40a)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 35 | Legal effects of electronic seals | ✅ | RP-ESIG-010 to RP-ESIG-012 | RPs must not deny legal effect |
| Art. 36 | Requirements for advanced e-seals | ➖ | | Definition of advanced e-seal requirements |
| Art. 37 | Electronic seals in public services | ✅ | RP-ESIG-013 to RP-ESIG-015 | Public sector RPs must accept specified formats |
| Art. 38 | Qualified certificates for e-seals | ➖ | | Certificate content requirements - TSP focus |
| Art. 39 | Qualified e-seal creation devices | ➖ | | QSCD requirements - refers to Art 29/30/31 |
| Art. 39a | Requirements for remote QSCD (seals) | ➖ | | Refers to Art 29a - QTSP duties |
| Art. 40 | Validation and preservation of e-seals | ➖ | | Refers to Arts 32-34 - validation/preservation TSP focus |
| Art. 40a | Validation of advanced e-seals | ➖ | | Refers to Art 32a |

### Chapter III, Section 4 - Electronic Time Stamps (Articles 41-42)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 41 | Legal effect of e-time stamps | ✅ | RP-ESIG-017, RP-ESIG-018 | RPs must not deny legal effect |
| Art. 42 | Requirements for qualified e-time stamps | ➖ | | QTSP requirements for timestamp creation |

### Chapter III, Section 5 - Electronic Registered Delivery (Articles 43-44)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 43 | Legal effect of ERDS | ✅ | RP-ESIG-019, RP-ESIG-020 | RPs must not deny legal effect |
| Art. 44 | Requirements for qualified ERDS | ➖ | | QTSP service requirements |

### Chapter III, Section 6 - Website Authentication (Article 45-45a)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 45 | Requirements for QWACs | ✅ | RP-ESIG-021, RP-ESIG-022 | Browser providers must recognize QWACs |
| Art. 45a | Cybersecurity precautionary measures | ➖ | | Browser provider duties for precautionary measures |

### Chapter III, Section 7 - Electronic Attestation of Attributes (Articles 45b-45h)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 45b | Legal effects of EAA | ✅ | RP-ESIG-023, RP-ESIG-024 | RPs must not deny legal effect |
| Art. 45c | EAA in public services | ➖ | | Member State rules for PID substitution |
| Art. 45d | Requirements for qualified EAA | ➖ | | QTSP requirements for QEAA issuance |
| Art. 45e | Verification against authentic sources | ➖ | | Member State/TSP duties for authentic source access |
| Art. 45f | Requirements for public sector EAA | ➖ | | Public sector body issuer duties |
| Art. 45g | Issuing EAA to EUDI Wallets | ➖ | | EAA provider interface duties |
| Art. 45h | Additional rules for EAA services | ➖ | | EAA provider data separation duties |

### Chapter III, Section 8 - Electronic Archiving (Articles 45i-45j)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 45i | Legal effect of e-archiving | ✅ | RP-ESIG-025 | RPs must not deny legal effect |
| Art. 45j | Requirements for qualified e-archiving | ➖ | | QTSP archiving service requirements |

### Chapter III, Section 9 - Electronic Ledgers (Articles 45k-45l)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 45k | Legal effects of e-ledgers | ✅ | RP-ESIG-026 | RPs must not deny legal effect |
| Art. 45l | Requirements for qualified e-ledgers | ➖ | | QTSP ledger service requirements |

### Chapter III, Section 10 - Electronic Documents (Article 46)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 46 | Legal effects of electronic documents | ➖ | | General principle - no specific RP obligations |

### Chapter IV - Supervision (Articles 46a-46f)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 46a | Supervision of EUDI Wallet Framework | ➖ | | Supervisory body duties for wallet providers |
| Art. 46b | Supervision of trust services | ➖ | | Supervisory body duties for TSPs |
| Art. 46c | Single points of contact | ➖ | | Member State designation duties |
| Art. 46d | Mutual assistance (EUDI Wallet) | ➖ | | Supervisory body cooperation |
| Art. 46e | European Digital Identity Cooperation Group | ➖ | | Commission/MS cooperation framework |
| Art. 46f | ENISA reports | ➖ | | ENISA reporting duties |

### Chapter V - Final Provisions (Articles 47-52)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 47 | Exercise of delegation | ➖ | | Commission delegated act procedures |
| Art. 48 | Committee procedure | ➖ | | Committee procedures |
| Art. 48a | Reporting requirements | ➖ | | Member State statistics collection |
| Art. 49 | Review | ➖ | | Commission review duties |
| Art. 50 | Repeal | ➖ | | Directive 1999/93/EC repeal |
| Art. 51 | Transitional measures | ➖ | | Transitional provisions |
| Art. 52 | Entry into force | ➖ | | Entry into force dates |

---

## 2. Annexes to Regulation 910/2014

| Annex | Title | Status | RP Requirements | Notes |
|-------|-------|--------|-----------------|-------|
| Annex I | Requirements for qualified certificates for e-signatures | ➖ | | Certificate content requirements - TSP issuers |
| Annex II | Requirements for qualified e-signature creation devices | ➖ | | QSCD technical requirements - device makers |
| Annex III | Requirements for qualified certificates for e-seals | ➖ | | Certificate content requirements - TSP issuers |
| Annex IV | Requirements for qualified certificates for website auth | ➖ | | QWAC content requirements - TSP issuers |
| Annex V | Requirements for qualified EAA | ➖ | | QEAA content requirements - TSP issuers |
| Annex VI | Minimum list of attributes for authentic sources | ➖ | | Attribute catalog - Member State duties |
| Annex VII | Requirements for public sector EAA | ➖ | | Public sector body issuer requirements |

---

## 3. Implementing Acts - First Batch (December 2024)

### 2024/2977 - Person Identification Data and EAA

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ✅ | | |
| Art. 2 | Definitions | ✅ | | Key terms |
| Art. 3 | Issuance of PID to wallet units | ✅ | | PID provider duties |
| Art. 4 | Issuance of EAA to wallet units | ✅ | | EAA provider duties |
| Art. 5 | Revocation of PID | ✅ | RP-TECH-013 | Validity status check |
| Annex | PID attribute schemas | ✅ | RP-TECH-009 to RP-TECH-014 | Data format requirements |

### 2024/2979 - Integrity and Core Functionalities

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ✅ | | |
| Art. 2 | Definitions | ✅ | | Key definitions for RPs |
| Art. 3 | Wallet unit integrity | ✅ | | Wallet provider duties |
| Art. 4 | Wallet instances | ✅ | | Wallet provider duties |
| Art. 5 | Wallet secure cryptographic applications | ✅ | | Wallet provider duties |
| Art. 6 | Wallet unit authenticity and validity | ✅ | | |
| Art. 7 | Revocation of wallet unit attestations | ✅ | RP-TECH-015 | RPs can check validity |
| Art. 8 | Formats for PID and EAA | ✅ | RP-TECH-018 | Format support |
| Art. 9 | Transaction logs | ✅ | | Wallet provider duties |
| Art. 10 | Embedded disclosure | ✅ | RP-TECH-016 | RP policy compliance |
| Art. 11 | Qualified e-signatures and seals | ✅ | | |
| Art. 12 | Signature creation applications | ✅ | RP-ESIG-027 | Signature formats |
| Art. 13 | Data export and portability | ✅ | | |
| Art. 14 | Pseudonyms | ✅ | RP-TECH-017 | RP-specific pseudonyms |
| Annex I | Standards for WSCA | ✅ | | |
| Annex II | Data format standards | ✅ | | ISO 18013-5, W3C VC |
| Annex III | Embedded disclosure policies | ✅ | | |
| Annex IV | Signature formats | ✅ | | |
| Annex V | Pseudonym specifications | ✅ | | WebAuthn |

### 2024/2980 - Notifications to the Commission

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1-5 | All articles | ⬜ | | Commission notification |

### 2024/2981 - Certification of EUDI Wallets

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1-10 | All articles | ⬜ | | Certification framework |
| Annexes I-IX | All annexes | ⬜ | | Technical requirements |

### 2024/2982 - Protocols and Interfaces

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ✅ | | |
| Art. 2 | Definitions | ✅ | | wallet-relying party defined |
| Art. 3 | General provisions | ✅ | RP-TECH-001 to RP-TECH-008 | Authentication requirements |
| Art. 4 | Issuance of PID and EAA | ✅ | | Issuer duties |
| Art. 5 | Presentation of attributes | ✅ | RP-TECH-002, RP-TECH-003 | Protocol requirements |
| Art. 6 | Data erasure requests | ✅ | RP-DP-005 | GDPR Art 17 |
| Art. 7 | Reporting to supervisory authorities | ✅ | | User reporting mechanism |
| Annex | Protocol standards | ✅ | | ISO 18013-5, 18013-7 |

---

## 4. Implementing Acts - Second Batch (May 2025)

### 2025/846 - Cross-Border Identity Matching

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter | ✅ | | |
| Art. 2 | General requirements | ✅ | RP-AUTH-009 to RP-AUTH-011 | Identity matching process |
| Art. 3 | Successful matching obligations | ✅ | RP-AUTH-012 | User notification |
| Art. 4 | Unsuccessful matching obligations | ✅ | RP-AUTH-013 | User notification |
| Art. 5 | Post-matching obligations | ✅ | RP-OPS-003 | Log retention |
| Art. 6 | Entry into force | ✅ | | |

### 2025/847 - Security Breach Response

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter | ✅ | | |
| Art. 2 | Definitions | ✅ | | |
| Art. 3 | Establishing a security breach | ✅ | | Member State duties |
| Art. 4 | Suspension measures | ✅ | | Member State duties |
| Art. 5 | Information about suspensions | ✅ | RP-SEC-001 | RPs receive notifications |
| Art. 6 | Re-establishment | ✅ | | Member State duties |
| Art. 7 | Information about re-establishment | ✅ | RP-SEC-002 | RPs receive notifications |
| Art. 8 | Withdrawal of wallets | ✅ | | Member State duties |
| Art. 9 | Information about withdrawal | ✅ | RP-SEC-003 | RPs receive notifications |
| Art. 10 | Information system | ✅ | | CIRAS system |
| Annex I | Assessment criteria | ✅ | | |

### 2025/848 - Relying Party Registration

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ✅ | | |
| Art. 2 | Definitions | ✅ | | wallet-relying party defined |
| Art. 3 | National registers | ⬜ | | Member State duties |
| Art. 4 | Registration policies | ⬜ | | Member State duties |
| Art. 5 | Information to be provided | ✅ | RP-REG-007 to RP-REG-009 | RP obligations |
| Art. 6 | Registration processes | ✅ | RP-REG-010 | Cessation notification |
| Art. 7 | Wallet-RP access certificates | ⬜ | | Certificate issuance |
| Art. 8 | Wallet-RP registration certificates | ⬜ | | Optional certificates |
| Art. 9 | Suspension and cancellation | ⬜ | | Registrar duties |
| Art. 10 | Record keeping | ⬜ | | Registrar duties |
| Annex I | Information requirements | ✅ | RP-REG-011, RP-REG-012 | Data to provide |
| Annex II | API requirements | ⬜ | | Technical specs |
| Annex III | Entitlement verification | ⬜ | | |
| Annex IV | Access certificate requirements | ⬜ | | |
| Annex V | Registration certificate requirements | ⬜ | | |

### 2025/849 - Certified Wallet List

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| All | Full regulation | ➖ | | Member State notification duties |

---

## 5. Implementing Acts - Third Batch (July/September 2025)

### Trust Services Implementing Acts

| Regulation | Title | Status | RP Requirements | Notes |
|------------|-------|--------|-----------------|-------|
| 2025/1566 | Registered Delivery | ➖ | | QERDSP standards |
| 2025/1567 | Certificate Formats | ➖ | | QTSP standards |
| 2025/1568 | Remote Signing | ➖ | | QSCD management |
| 2025/1569 | EAA/Attributes | ➖ | | EAA issuance (Art 4.5 has RP-adjacent provision) |
| 2025/1570 | Certified Creation Devices | ➖ | | QSCD certification |
| 2025/1571 | Seal Standards | ➖ | | Seal formats |
| 2025/1572 | E-Signature Standards | ➖ | | Signature formats |
| 2025/1929 | Electronic Timestamps | ➖ | | Timestamp standards |
| 2025/1942 | Validation Services | ➖ | | QVSP standards |
| 2025/1943 | Signature Standards | ➖ | | Certificate formats |
| 2025/1944 | Preservation Standards | ➖ | | QERDS/preservation |
| 2025/1945 | Wallet Attributes | ➖ | | Sig validation standards |
| 2025/1946 | Wallet Reference Issuer | ➖ | | Preservation services |

---

## 6. Implementing Acts - Fourth Batch (October/November 2025)

| Regulation | Title | Status | RP Requirements | Notes |
|------------|-------|--------|-----------------|-------|
| 2025/2160 | Supervisory Data | ➖ | | TSP risk management |
| 2025/2162 | CAB Accreditation | ➖ | | Accreditation standards |
| 2025/2164 | Trusted Lists | ➖ | | Trusted list format |
| 2025/2527 | Website Auth Certs | ➖ | | QWAC standards |
| 2025/2530 | QTSP Requirements | ➖ | | QTSP standards |
| 2025/2531 | Electronic Ledgers | ➖ | | Ledger standards |
| 2025/2532 | Archiving Services | ➖ | | Archive standards |

---

## 7. Recitals (Informative Requirements)

Recitals provide context and interpretive guidance. While not directly binding, they inform the application of articles.

### Recitals from Regulation (EU) 2024/1183 (Amending Regulation)

| Recital | Topic | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Recital 4 | Wallet objectives | ⬜ | | Cross-border access goals |
| Recital 5 | User control and privacy | ⬜ | | Privacy principles |
| Recital 6 | Voluntary use | ⬜ | | No mandatory use for users |
| Recital 9 | High assurance level | ⬜ | | Security expectations |
| Recital 11 | Wallet features | ⬜ | | Core functionality |
| Recital 12 | Legal person wallets | ⬜ | | Business use |
| Recital 13 | Free-of-charge provision | ⬜ | | Cost to natural persons |
| Recital 14 | Electronic signatures | ⬜ | | Signature capabilities |
| Recital 16 | Authentic sources | ⬜ | | EAA verification |
| Recital 17 | DPIA requirements | ✅ | RP-INFO-001 | High-risk processing |
| Recital 18 | User dashboard | ⬜ | | Transparency features |
| Recital 19 | Transaction logs | ⬜ | | User visibility |
| Recital 20 | Portability | ⬜ | | Data export rights |
| Recital 21 | Suspension rights | ⬜ | | User control |
| Recital 22 | Reporting mechanism | ⬜ | | User complaints |
| Recital 23 | Certification | ⬜ | | Security certification |
| Recital 24 | Open source | ⬜ | | Transparency |
| Recital 25 | Interoperability | ⬜ | | Cross-border use |
| Recital 26 | Security breach | ⬜ | | Incident handling |
| Recital 27 | Peer review | ⬜ | | Scheme evaluation |
| Recital 28 | Non-discrimination | ⬜ | | Alternative access |
| Recital 29 | Accessibility | ⬜ | | Disability access |
| Recital 30 | Online services | ⬜ | | Service scope |
| Recital 31 | Offline authentication | ⬜ | | Proximity use |
| Recital 32 | Age verification | ⬜ | | Derivation without disclosure |
| Recital 33 | Member State cooperation | ⬜ | | Governance |
| Recital 34 | Public sector acceptance | ⬜ | | Mandatory acceptance |
| Recital 35 | Private sector acceptance | ⬜ | | Sectoral obligations |
| Recital 36 | Microenterprises exemption | ⬜ | | SME exclusions |
| Recital 37 | Very large platforms | ⬜ | | DSA obligations |
| Recital 38 | Codes of conduct | ⬜ | | Voluntary adoption |
| Recital 39 | Review clause | ⬜ | | Future assessment |
| Recital 40 | Relying party registration | ⬜ | | Registration purpose |
| Recital 41 | Registration transparency | ⬜ | | Public information |
| Recital 42 | Data protection compliance | ⬜ | | GDPR alignment |
| Recital 43 | RP authentication | ⬜ | | RP identification to users |
| Recital 44 | Data request limitation | ⬜ | | No over-requesting |
| Recital 45 | Invalid data requests | ⬜ | | Wallet protection |
| Recital 46 | RP liability | ⬜ | | Damage responsibility |
| Recital 47 | Unique identifier | ⬜ | | Cross-border matching |
| Recital 48 | Liability framework | ⬜ | | Damage compensation |
| Recital 49 | Trust services scope | ⬜ | | Service expansion |
| Recital 50 | Non-qualified TSPs | ⬜ | | Lower tier services |
| Recital 51 | TSP requirements | ⬜ | | Provider duties |
| Recital 52 | Supervisory bodies | ⬜ | | Oversight |
| Recital 53 | NIS2 alignment | ⬜ | | Cybersecurity |
| Recital 54 | Qualified TSPs | ⬜ | | Higher tier |
| Recital 55 | Remote identity proofing | ⬜ | | Verification methods |
| Recital 56 | Data minimization | ✅ | RP-INFO-002 | Proportionate requests |
| Recital 57 | VLOPs acceptance | ✅ | RP-INFO-005 | Platform obligations |
| Recital 58 | No tracking/profiling | ⬜ | | Privacy protection |
| Recital 59 | Selective disclosure | ✅ | RP-INFO-004 | Privacy feature |
| Recital 60 | Pseudonyms | ✅ | RP-INFO-003 | Unless legally required |
| Recital 61 | Zero-knowledge proofs | ⬜ | | Privacy-enhancing tech |
| Recital 62 | E-signature legal effect | ⬜ | | Recognition |
| Recital 63 | Advanced signatures | ⬜ | | Format recognition |
| Recital 64 | Website authentication | ⬜ | | QWAC recognition |
| Recital 65 | Browser obligations | ⬜ | | Certificate display |
| Recital 66 | Electronic attestations | ⬜ | | EAA framework |
| Recital 67 | Public sector EAA | ⬜ | | Authentic sources |
| Recital 68 | EAA interoperability | ⬜ | | Cross-border use |
| Recital 69 | Electronic archiving | ⬜ | | Preservation |
| Recital 70 | Electronic ledgers | ⬜ | | DLT recognition |
| Recital 71 | GDPR compliance | ⬜ | | Data protection |
| Recital 72 | NIS2 consistency | ⬜ | | Security framework |
| Recital 73 | Penalties | ⬜ | | Enforcement |
| Recital 74 | EDPS consultation | ⬜ | | Privacy review |
| Recital 75 | Regular review | ⬜ | | Commission updates |

### Recitals from Consolidated 910/2014 (Original Recitals 1-76)

| Recital | Topic | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Recital 1-76 | Original eIDAS recitals | ⬜ | | Review alongside amending |

---

## Summary Statistics

### Main Regulation (910/2014) Coverage
- **Total Articles Reviewed:** 70+ (ALL reviewed)
- **Articles with RP Requirements:** 18 (spanning registration, acceptance, authentication, trust services)
- **Articles with No Direct RP Requirements:** 52+ (Member State, Commission, TSP, or Wallet Provider duties)
- **Annexes Reviewed:** 7/7 (all TSP/issuer-focused, no RP obligations)

### Implementing Acts Coverage
- **Total Implementing Acts:** 29
- **Reviewed with RP Requirements:** 6 (2024/2977, 2024/2979, 2024/2982, 2025/846, 2025/847, 2025/848)
- **Reviewed - No Direct RP Requirements:** 21 (TSP/infrastructure-focused)
- **Pending Deeper Review:** 2 (2024/2980, 2024/2981 - may have indirect relevance)

### Current Requirements
- **Total in relying-party.yaml:** 87
- **Binding (Article-based):** 82
- **Informative (Recital-based):** 5

---

## Audit Completion Status

✅ **MAIN REGULATION AUDIT COMPLETE** (2026-01-19)

All articles and annexes of Regulation (EU) No 910/2014 (Consolidated) have been systematically reviewed article-by-article for Relying Party requirements.

### Next Steps (RCA Enhancement)

1. **Expand to Other Roles**: Create `wallet-provider.yaml` and `trust-service-provider.yaml` requirement files
2. **Add Deadline Dashboard**: Visual timeline for compliance deadlines
3. **Compliance Status Tracker**: Allow marking requirements as Done/In Progress
4. **Implementation Guidance**: Add practical how-to notes for each requirement

