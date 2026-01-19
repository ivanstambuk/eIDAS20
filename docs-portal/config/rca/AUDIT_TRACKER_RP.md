# RCA Systematic Audit Tracker

This document tracks the systematic review of all eIDAS 2.0 legal sources for Relying Party requirements.

**Last Updated:** 2026-01-19 (Third Pass)
**Current Requirements Count:** 91
**Schema Version:** 13 (Added RP-REG-013 for Art 8(2)(g) privacy policy URL)
**Verification Status:** ✅ THIRD-PASS DEEP AUDIT COMPLETE

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
| Art. 24 | Requirements for qualified TSPs | ✅ | RP-AUTH-004 | Para 4: QTSPs must provide RPs with certificate status info |
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
| Art. 32 | Validation of qualified e-signatures | ✅ | RP-ESIG-006, 007, 007a, 008 | Para 1: validation process; Para 2: security detection |
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
| Art. 1 | Subject matter and scope | ➖ | | Commission notification scope |
| Art. 2 | Definitions | ➖ | | wallet-relying party defined |
| Art. 3 | Notification system | ➖ | | Commission shall establish system |
| Art. 4 | Notifications by Member States | ➖ | | MS notification duties |
| Art. 5 | Publications by the Commission | ➖ | | Commission publication duties |
| Art. 6 | Entry into force | ➖ | | |

### 2024/2981 - Certification of EUDI Wallets

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ➖ | | Certification framework scope |
| Art. 2 | Definitions | ➖ | | wallet-relying party defined |
| Art. 3 | Establishment of national certification schemes | ➖ | | MS scheme establishment |
| Art. 4 | General requirements | ➖ | | Scheme requirements |
| Art. 5 | Incident and vulnerability management | ➖ | | Wallet provider duties |
| Art. 6 | Maintenance of national certification schemes | ➖ | | Scheme owner duties |
| Art. 7 | General requirements (scheme owners) | ➖ | | Scheme owner duties |
| Art. 8 | General requirements (providers) | ➖ | | Wallet provider duties |
| Art. 9 | General requirements (CABs) | ➖ | | CAB accreditation |
| Art. 10 | Subcontracting | ➖ | | CAB subcontracting rules |
| Art. 11 | Notification to supervisory body | ➖ | | CAB notification duties |
| Art. 12 | Incident and vulnerability management (CABs) | ➖ | | CAB duties |
| Art. 13 | Evaluation activities | ➖ | | CAB evaluation procedures |
| Art. 14 | Certification activities | ➖ | | CAB certification procedures |
| Art. 15 | Complaints and appeals | ➖ | | Scheme complaint handling |
| Art. 16 | Surveillance activities | ➖ | | CAB surveillance duties |
| Art. 17 | Consequences of non-compliance | ➖ | | Non-compliance procedures |
| Art. 18 | Certification lifecycle | ➖ | | Certificate validity |
| Art. 19 | Retention of records | ➖ | | CAB recordkeeping |
| Art. 20 | Protection of information | ➖ | | Confidentiality requirements |
| Art. 21 | Transition to EU cybersecurity scheme | ➖ | | Scheme transition |
| Art. 22 | Entry into force | ➖ | | Effective date |
| Annex I | Risk register | ➖ | | Threat descriptions (RPs as threat actors, not duties) |
| Annex II | Certification schemes | ➖ | | Certification body requirements |
| Annex III | Functional requirements | ➖ | | Wallet solution requirements |
| Annex IV | Evaluation activities | ➖ | | CAB evaluation procedures |
| Annex V | Public security info | ➖ | | Wallet provider transparency |
| Annex VI | Dependency analysis | ➖ | | Assurance documentation |
| Annex VII | Certificate content | ➖ | | Certificate requirements |
| Annex VIII | Certification reports | ➖ | | Report content requirements |
| Annex IX | Evaluation requirements | ➖ | | Evaluation schedule |

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
| Art. 3 | National registers | ➖ | | MS/registrar duties (establishing registers) |
| Art. 4 | Registration policies | ➖ | | MS policy requirements |
| Art. 5 | Information to be provided | ✅ | RP-REG-007 to RP-REG-009 | RP obligations |
| Art. 6 | Registration processes | ✅ | RP-REG-010 | Cessation notification (Art 6(7)) |
| Art. 7 | Wallet-RP access certificates | ➖ | | MS/certificate provider duties; RP use covered by RP-REG-005 |
| Art. 8 | Wallet-RP registration certificates | ✅ | RP-REG-013 | Art 8(2)(g): Privacy policy URL requirement |
| Art. 9 | Suspension and cancellation | ➖ | | Registrar enforcement powers |
| Art. 10 | Record keeping | ➖ | | Registrar record-keeping duties |
| Art. 11 | Entry into force | ➖ | | Applies from 24 Dec 2026 |
| Annex I | Information requirements | ✅ | RP-REG-011, RP-REG-012 | Data to provide |
| Annex II | API requirements | ➖ | | Register API technical specs |
| Annex III | Entitlement verification | ➖ | | Registrar verification procedures |
| Annex IV | Access certificate requirements | ➖ | | Certificate provider requirements |
| Annex V | Registration certificate requirements | ➖ | | Certificate provider requirements |

### 2025/849 - Certified Wallet List

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter | ➖ | | Scope of notification requirements |
| Art. 2 | Definitions | ➖ | | Wallet solution defined |
| Art. 3 | Format and procedure for submissions | ➖ | | MS submission duties |
| Art. 4 | Entry into force | ➖ | | Effective date |
| Annex | Information to be submitted | ➖ | | MS submission content |

---

## 5. Implementing Acts - Third Batch (July/September 2025)

### 2025/1566 - Registered Delivery

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ➖ | | QERDSP standards |
| Art. 2 | Entry into force | ➖ | | Effective date |

### 2025/1567 - Certificate Formats

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ➖ | | QTSP certificate standards |
| Art. 2 | Entry into force and applicability | ➖ | | Effective date |

### 2025/1568 - Remote Signing (Peer Review)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | General principles for peer review | ➖ | | Peer review procedures |
| Art. 2 | Initiation of peer review | ➖ | | MS notification duties |
| Art. 3 | Preparation of peer review | ➖ | | CAB preparation |

### 2025/1569 - EAA/Attributes (Sign Creation Devices)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ➖ | | QEAA issuance scope |
| Art. 2 | Definitions | ➖ | | QEAA definitions |
| Art. 3 | Issuance of QEAA/PUB-EAA | ➖ | | Issuer duties |
| Art. 4 | Revocation of QEAA/PUB-EAA | ➖ | | Issuer revocation duties |

### 2025/1570 - Certified Creation Devices

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ➖ | | QSCD certification |
| Art. 2 | Entry into force | ➖ | | Effective date |

### 2025/1571 - Seal Standards (Annual Reports)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Format and procedures of annual reports | ➖ | | TSP reporting |
| Art. 2 | Entry into force | ➖ | | Effective date |

### 2025/1572 - E-Signature Standards (Supervision)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Verification methodology | ➖ | | Supervisory verification |
| Art. 2 | Transparency | ➖ | | Supervisory transparency |
| Art. 3 | Trust service provider notifications | ➖ | | TSP notification duties |
| Art. 4 | Verifications by supervisory bodies | ➖ | | Supervisory duties |
| Art. 5 | Entry into force and applicability | ➖ | | Effective date |

### 2025/1929 - Electronic Timestamps

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ➖ | | Timestamp standards |
| Art. 2 | Entry into force | ➖ | | Effective date |

### 2025/1942 - Validation Services

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ➖ | | QVSP standards |
| Art. 2 | Entry into force | ➖ | | Effective date |
| Annex | List of reference standards | ➖ | | Standards list |

### 2025/1943 - Signature/Certificate Standards

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards for qualified certificates | ➖ | | Certificate standards |
| Art. 2 | Entry into force | ➖ | | Effective date |
| Annex | List of reference standards | ➖ | | Standards list |

### 2025/1944 - Preservation/QERDS Standards

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards for QERDS | ➖ | | Registered delivery standards |
| Art. 2 | Reference standards for QERDS interoperability | ➖ | | Interoperability standards |
| Art. 3 | Entry into force | ➖ | | Effective date |

### 2025/1945 - Wallet Attributes (Signature Validation)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ➖ | | Signature validation standards |
| Art. 2 | Entry into force | ➖ | | Effective date |

### 2025/1946 - Wallet Reference Issuer (Preservation)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ➖ | | Preservation standards |
| Art. 2 | Entry into force | ➖ | | Effective date |

---

## 6. Implementing Acts - Fourth Batch (October/November 2025)

### 2025/2160 - Supervisory Data (TSP Risk Management)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ➖ | | Risk management standards |
| Art. 2 | Risk management policies | ➖ | | TSP policy requirements |
| Art. 3 | Identification, documentation and evaluation of risks | ➖ | | Risk assessment |
| Art. 4 | Risk treatment measures | ➖ | | Risk treatment |

### 2025/2162 - CAB Accreditation

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Definitions | ➖ | | CAB definitions |
| Art. 2 | Accreditation of conformity assessment bodies | ➖ | | CAB accreditation |
| Art. 3 | Accreditation certificate | ➖ | | Certificate requirements |

### 2025/2164 - Trusted Lists

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter | ➖ | | Trusted list scope |
| Art. 2 | Technical specifications | ➖ | | List format |
| Annex | Technical specifications | ➖ | | Detailed format |

### 2025/2527 - Website Auth Certs (QWAC)

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ➖ | | QWAC standards |
| Art. 2 | Entry into force | ➖ | | Effective date |

### 2025/2530 - QTSP Requirements

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Notifications to supervisory body | ➖ | | TSP notification duties |
| Art. 2 | Risk management framework | ➖ | | TSP risk management |
| Art. 3 | Termination plan | ➖ | | TSP termination requirements |

### 2025/2531 - Electronic Ledgers

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ➖ | | QERL standards |
| Art. 2 | Entry into force | ➖ | | Effective date |

### 2025/2532 - Archiving Services

| Article | Title | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Electronic archiving with qualified signatures/seals | ➖ | | Archive requirements |
| Art. 2 | Reference standards for qualified archiving | ➖ | | Archive standards |
| Art. 3 | Entry into force | ➖ | | Effective date |

---

## 7. Recitals (Informative Requirements)

Recitals provide context and interpretive guidance. While not directly binding, they inform the application of articles.

### Recitals from Regulation (EU) 2024/1183 (Amending Regulation)

| Recital | Topic | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Recital 4 | Wallet objectives | ➖ | | Policy context - no RP obligations |
| Recital 5 | User control and privacy | ➖ | | User-focused - no direct RP obligations |
| Recital 6 | Voluntary use | ➖ | | User choice - no RP obligations |
| Recital 9 | High assurance level | ➖ | | Wallet provider focus |
| Recital 11 | Wallet features | ➖ | | Wallet provider focus |
| Recital 12 | Legal person wallets | ➖ | | Legal person user context |
| Recital 13 | Free-of-charge provision | ➖ | | Member State duty |
| Recital 14 | Electronic signatures | ➖ | | Wallet feature |
| Recital 16 | Authentic sources | ➖ | | EAA issuer focus |
| Recital 17 | DPIA requirements | ✅ | RP-INFO-001 | High-risk processing guidance |
| Recital 18 | User dashboard | ➖ | | Wallet provider feature |
| Recital 19 | Transaction logs | ➖ | | RP visibility to users - indirect |
| Recital 20 | Portability | ➖ | | User right |
| Recital 21 | Suspension rights | ➖ | | User control |
| Recital 22 | Reporting mechanism | ➖ | | User complaints about RPs |
| Recital 23 | Certification | ➖ | | Wallet certification |
| Recital 24 | Open source | ➖ | | Wallet provider duty |
| Recital 25 | Interoperability | ➖ | | Framework context |
| Recital 26 | Security breach | ➖ | | Member State duty |
| Recital 27 | Peer review | ➖ | | Member State duty |
| Recital 28 | Non-discrimination | ✅ | RP-ACCEPT-* (related) | Alternative access must remain |
| Recital 29 | Accessibility | ➖ | | Service providers generally |
| Recital 30 | Online services | ➖ | | Service scope context |
| Recital 31 | Offline authentication | ➖ | | Use case context |
| Recital 32 | Age verification | ➖ | | Privacy feature - wallet focus |
| Recital 33 | Member State cooperation | ➖ | | Governance |
| Recital 34 | Public sector acceptance | ✅ | RP-ACCEPT-001 (related) | Mandatory acceptance context |
| Recital 35 | Private sector acceptance | ✅ | RP-ACCEPT-002 (related) | Sectoral obligations context |
| Recital 36 | Microenterprises exemption | ✅ | RP-ACCEPT-002 (related) | SME exclusions defined |
| Recital 37 | Very large platforms | ✅ | RP-INFO-005 | DSA VLOP obligations |
| Recital 38 | Codes of conduct | ➖ | | Voluntary adoption |
| Recital 39 | Review clause | ➖ | | Commission duty |
| Recital 40 | Relying party registration | ✅ | RP-REG-* (context) | Registration purpose explained |
| Recital 41 | Registration transparency | ✅ | RP-REG-002 (context) | Public information about RPs |
| Recital 42 | Data protection compliance | ✅ | RP-DATA-* (context) | GDPR alignment |
| Recital 43 | RP authentication | ✅ | RP-REG-005 (context) | RP must identify to users |
| Recital 44 | Data request limitation | ✅ | RP-REG-003, RP-DATA-001 (context) | No over-requesting |
| Recital 45 | Invalid data requests | ➖ | | Wallet protection |
| Recital 46 | RP liability | ➖ | | Liability context - MS law |
| Recital 47 | Unique identifier | ➖ | | Cross-border matching context |
| Recital 48 | Liability framework | ➖ | | General liability framework |
| Recital 49 | Trust services scope | ➖ | | TSP context |
| Recital 50 | Non-qualified TSPs | ➖ | | TSP context |
| Recital 51 | TSP requirements | ➖ | | TSP duties |
| Recital 52 | Supervisory bodies | ➖ | | Supervision context |
| Recital 53 | NIS2 alignment | ➖ | | Cybersecurity alignment |
| Recital 54 | Qualified TSPs | ➖ | | QTSP context |
| Recital 55 | Remote identity proofing | ➖ | | TSP verification methods |
| Recital 56 | Data minimization | ✅ | RP-INFO-002 | Proportionate requests |
| Recital 57 | VLOPs acceptance | ✅ | RP-INFO-005 | Platform obligations |
| Recital 58 | No tracking/profiling | ➖ | | Wallet provider duty |
| Recital 59 | Selective disclosure | ✅ | RP-INFO-004 | Privacy feature - RP must support |
| Recital 60 | Pseudonyms | ✅ | RP-INFO-003 | Unless legally required |
| Recital 61 | Zero-knowledge proofs | ➖ | | Technology context |
| Recital 62 | E-signature legal effect | ➖ | | Legal effect - not RP-specific duty |
| Recital 63 | Advanced signatures | ➖ | | Format recognition context |
| Recital 64 | Website authentication | ➖ | | QWAC browser context |
| Recital 65 | Browser obligations | ➖ | | Browser provider duty |
| Recital 66 | Electronic attestations | ➖ | | EAA framework context |
| Recital 67 | Public sector EAA | ➖ | | EAA issuer context |
| Recital 68 | EAA interoperability | ➖ | | Framework context |
| Recital 69 | Electronic archiving | ➖ | | TSP archiving context |
| Recital 70 | Electronic ledgers | ➖ | | DLT context |
| Recital 71 | GDPR compliance | ➖ | | General compliance context |
| Recital 72 | NIS2 consistency | ➖ | | Security framework context |
| Recital 73 | Penalties | ➖ | | Enforcement - MS focus |
| Recital 74 | EDPS consultation | ➖ | | Procedure |
| Recital 75 | Regular review | ➖ | | Commission duty |

### Recitals from Consolidated 910/2014 (Original Recitals 1-76)

These are the original 2014 eIDAS recitals. They provide historical context for the regulation but predate the EUDI Wallet framework and contain no direct RP obligations.

| Recital | Topic | Status | RP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Recital 1 | Digital single market | ➖ | | Policy context |
| Recital 2 | Cross-border e-ID | ➖ | | Policy context |
| Recital 3 | Public service access | ➖ | | MS context |
| Recital 4 | Trust services framework | ➖ | | TSP context |
| Recital 5 | Legal certainty | ➖ | | Legal framework |
| Recital 6 | Mutual recognition principles | ➖ | | MS duties |
| Recital 7 | Assurance levels | ➖ | | Framework context |
| Recital 8 | Interoperability framework | ➖ | | MS duties |
| Recital 9 | Private sector use | ➖ | | Voluntary use context |
| Recital 10 | Notified e-ID schemes | ➖ | | MS notification duties |
| Recital 11 | Scheme requirements | ➖ | | MS requirements |
| Recital 12 | Security requirements | ➖ | | Security context |
| Recital 13 | Notification prerequisites | ➖ | | MS duties |
| Recital 14 | Cooperation principles | ➖ | | MS cooperation |
| Recital 15 | TSP liability | ➖ | | TSP context |
| Recital 16 | Security assessment | ➖ | | MS assessment duties |
| Recital 17 | Peer review | ➖ | | MS peer review |
| Recital 18 | Technical specifications | ➖ | | Commission powers |
| Recital 19 | Internal market | ➖ | | Market context |
| Recital 20 | Trust service establishment | ➖ | | TSP context |
| Recital 21 | TSP supervision | ➖ | | Supervisory context |
| Recital 22 | Supervisory bodies | ➖ | | MS duties |
| Recital 23 | Mutual assistance | ➖ | | Supervisory cooperation |
| Recital 24 | TSP security | ➖ | | TSP duties |
| Recital 25 | Breach notification | ➖ | | TSP duties |
| Recital 26 | Risk assessment | ➖ | | TSP duties |
| Recital 27 | Qualified status | ➖ | | QTSP context |
| Recital 28 | Third country TSPs | ➖ | | International context |
| Recital 29 | TSP accessibility | ➖ | | Accessibility context |
| Recital 30 | Trusted lists | ➖ | | MS duties |
| Recital 31 | EU mark | ➖ | | Trust mark context |
| Recital 32 | Electronic signatures | ➖ | | Signature context |
| Recital 33 | Signature legal effect | ➖ | | Legal effect |
| Recital 34 | Advanced signatures | ➖ | | Advanced sig context |
| Recital 35 | Qualified signatures | ➖ | | QES context |
| Recital 36 | Cross-border signatures | ➖ | | MS recognition |
| Recital 37 | Creation devices | ➖ | | QSCD context |
| Recital 38 | QSCD assessment | ➖ | | CAB context |
| Recital 39 | QSCD standards | ➖ | | Technical standards |
| Recital 40 | Signature validation | ➖ | | Validation context |
| Recital 41 | Electronic seals | ➖ | | Seal context |
| Recital 42 | Seal legal effect | ➖ | | Legal effect |
| Recital 43 | Qualified seals | ➖ | | QESeal context |
| Recital 44 | Timestamps | ➖ | | Timestamp context |
| Recital 45 | Qualified timestamps | ➖ | | QTSA context |
| Recital 46 | Electronic documents | ➖ | | Document context |
| Recital 47 | Registered delivery | ➖ | | ERDSP context |
| Recital 48 | QERDS | ➖ | | Qualified delivery context |
| Recital 49 | Website authentication | ➖ | | Certificate context |
| Recital 50 | QWAC | ➖ | | QWA certificate context |
| Recital 51 | Browser recognition | ➖ | | Browser context |
| Recital 52 | Personal data | ➖ | | Data protection |
| Recital 53 | GDPR alignment | ➖ | | Privacy framework |
| Recital 54 | Data processing | ➖ | | Data controller context |
| Recital 55 | Accessibility | ➖ | | Disability access |
| Recital 56 | SME impact | ➖ | | Business context |
| Recital 57 | Consumer protection | ➖ | | Consumer context |
| Recital 58 | Delegated acts | ➖ | | Commission powers |
| Recital 59 | Implementing acts | ➖ | | Commission powers |
| Recital 60 | Committee procedure | ➖ | | Procedure context |
| Recital 61 | Standards references | ➖ | | Technical standards |
| Recital 62 | ENISA role | ➖ | | Agency context |
| Recital 63 | Directive repeal | ➖ | | Transitional |
| Recital 64 | Transition period | ➖ | | Transitional |
| Recital 65 | QC certificates | ➖ | | Transitional |
| Recital 66 | SSCD transition | ➖ | | Transitional |
| Recital 67 | Device certification | ➖ | | Transitional |
| Recital 68 | Implementation timeline | ➖ | | Timeline |
| Recital 69 | Standards timeline | ➖ | | Timeline |
| Recital 70 | Review clause | ➖ | | Commission review |
| Recital 71 | Proportionality | ➖ | | Legal basis |
| Recital 72 | Subsidiarity | ➖ | | Legal basis |
| Recital 73 | Treaty basis | ➖ | | Legal basis |
| Recital 74 | EDPS consultation | ➖ | | Procedure |
| Recital 75 | Committee opinions | ➖ | | Procedure |
| Recital 76 | Entry into force | ➖ | | Effective date |

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
- **Total in relying-party.yaml:** 91
- **Binding (Article-based):** 86
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

