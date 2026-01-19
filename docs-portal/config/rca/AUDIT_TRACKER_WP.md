# RCA Systematic Audit Tracker - Wallet Provider

This document tracks the systematic review of all eIDAS 2.0 legal sources for Wallet Provider requirements.

**Last Updated:** 2026-01-20
**Current Requirements Count:** 132
**Schema Version:** 6
**Verification Status:** ✅ AUDIT COMPLETE

---

## Legend

| Status | Meaning |
|--------|---------|
| ⬜ | Not yet reviewed |
| 🔍 | Under review |
| ✅ | Reviewed - WP requirements extracted |
| ➖ | Reviewed - No WP requirements found |
| 🔄 | Needs re-review |

---

## 1. Regulation (EU) No 910/2014 (Consolidated)

Source: `01_regulation/2014_910_eIDAS_Consolidated/02014R0910-20241018.md`

### Chapter I - General Provisions (Articles 1-4)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter | ➖ | | Scope definition only |
| Art. 2 | Scope | ➖ | | Applicability - no WP-specific duties |
| Art. 3 | Definitions | ➖ | | Defines terms including 'wallet' - no duties |
| Art. 4 | Internal market principle | ➖ | | General principle - no WP-specific duties |

### Chapter II - Electronic Identification (Articles 5-12b)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 5 | Pseudonyms in electronic transactions | ➖ | | General pseudonym right - applies to users |
| Art. 5a | European Digital Identity Wallets | ✅ | WP-PROV-001/002, WP-FUNC-001-010, WP-INTER-001-011, WP-DP-001-006, WP-SEC-001-004, WP-OPS-001-010 | **PRIMARY SOURCE** - 40 requirements extracted |
| Art. 5b | Relying parties of EUDI Wallets | ➖ | | RP registration duties only |
| Art. 5c | Certification of EUDI Wallets | ✅ | WP-CERT-001, WP-CERT-002, WP-CERT-003 | Certification requirements |
| Art. 5d | Publication of certified EUDI Wallets | ➖ | | MS informs Commission - MS duties |
| Art. 5e | Security breach of EUDI Wallets | ➖ | | MS suspension/withdrawal - MS duties |
| Art. 5f | Cross-border reliance on EUDI Wallets | ➖ | | RP acceptance duties - not WP |
| Art. 6 | Mutual recognition | ➖ | | MS eID scheme recognition |
| Art. 6a | *(Does not exist in consolidated text)* | ➖ | | |
| Art. 7 | Eligibility for notification | ➖ | | eID scheme notification - MS duty |
| Art. 8 | Assurance levels | ➖ | | Defines levels - referenced in 5a |
| Art. 9 | Notification | ➖ | | MS notification procedures |
| Art. 10 | Security breach of eID schemes | ➖ | | eID breach - not wallet-specific |
| Art. 11 | Liability | ➖ | | General liability - applies mutatis mutandis via 5a(19) |
| Art. 11a | Cross-border identity matching | ➖ | | MS duties for identity matching |
| Art. 12 | Interoperability | ➖ | | eID interoperability framework |
| Art. 12a | Certification of eID schemes | ➖ | | eID certification - not wallet-specific |
| Art. 12b | Access to hardware and software | ➖ | | Truncated; references DMA platform access |

### Chapter III - Trust Services (Articles 13-24a)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 13 | Liability and burden of proof | ➖ | | TSP liability - not WP |
| Art. 14 | International aspects | ➖ | | Third country TSP recognition |
| Art. 15 | Accessibility | ➖ | | AccessibilityWP covered in Art.5a |
| Art. 16 | Penalties | ➖ | | Member State penalty rules |
| Art. 17 | Supervisory body | ➖ | | MS supervisory body setup |
| Art. 18 | Mutual assistance | ➖ | | Supervisory cooperation |
| Art. 19 | Security requirements for TSPs | ➖ | | TSP security - not WP |
| Art. 19a | Requirements for non-qualified TSPs | ➖ | | Non-QTSP duties |
| Art. 20 | Supervision of qualified TSPs | ➖ | | QTSP supervision |
| Art. 21 | Initiation of qualified trust service | ➖ | | QTSP startup |
| Art. 22 | Trusted lists | ➖ | | MS trusted list duties |
| Art. 23 | EU trust mark | ➖ | | Trust mark use |
| Art. 24 | Requirements for qualified TSPs | ➖ | | QTSP requirements - not WP |
| Art. 24a | Recognition of qualified trust services | ➖ | | Cross-border recognition |

### Chapter III, Section 2 - Electronic Signatures (Articles 25-34)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 25 | Legal effects of electronic signatures | ➖ | | Legal framework |
| Art. 26 | Requirements for advanced e-signatures | ➖ | | AES requirements |
| Art. 27 | Electronic signatures in public services | ➖ | | Public sector acceptance |
| Art. 28 | Qualified certificates for e-signatures | ➖ | | QC requirements |
| Art. 29 | Requirements for qualified e-sig creation devices | ➖ | | QSCD requirements |
| Art. 29a | Requirements for remote QSCD management | ➖ | | Remote QSCD TSP duties |
| Art. 30 | Certification of QSCDs | ➖ | | QSCD certification |
| Art. 31 | Publication of certified QSCDs | ➖ | | Commission publication |
| Art. 32 | Validation of qualified e-signatures | ➖ | | QES validation |
| Art. 32a | Validation of advanced e-signatures | ➖ | | AES validation |
| Art. 33 | Qualified validation service | ➖ | | Validation service requirements |
| Art. 34 | Qualified preservation service | ➖ | | Preservation service requirements |

### Chapter III, Section 3 - Electronic Seals (Articles 35-40a)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 35 | Legal effects of electronic seals | ➖ | | Legal framework |
| Art. 36 | Requirements for advanced e-seals | ➖ | | AES requirements |
| Art. 37 | Electronic seals in public services | ➖ | | Public sector acceptance |
| Art. 38 | Qualified certificates for e-seals | ➖ | | QC requirements |
| Art. 39 | Qualified e-seal creation devices | ➖ | | QSCD requirements |
| Art. 39a | Requirements for remote QSCD (seals) | ➖ | | Remote QSCD TSP duties |
| Art. 40 | Validation and preservation of e-seals | ➖ | | Validation service requirements |
| Art. 40a | Validation of advanced e-seals | ➖ | | AES validation |

### Chapter III, Section 4 - Electronic Time Stamps (Articles 41-42)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 41 | Legal effect of e-time stamps | ➖ | | Legal framework |
| Art. 42 | Requirements for qualified e-time stamps | ➖ | | QTSP requirements |

### Chapter III, Section 5 - Electronic Registered Delivery (Articles 43-44)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 43 | Legal effect of ERDS | ➖ | | Legal framework |
| Art. 44 | Requirements for qualified ERDS | ➖ | | QTSP requirements |

### Chapter III, Section 6 - Website Authentication (Article 45-45a)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 45 | Requirements for QWACs | ➖ | | QWAC provider duties |
| Art. 45a | Cybersecurity precautionary measures | ➖ | | Browser/OS duties |

### Chapter III, Section 7 - Electronic Attestation of Attributes (Articles 45b-45h)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 45b | Legal effects of EAA | ➖ | | Legal framework |
| Art. 45c | EAA in public services | ➖ | | Public sector acceptance |
| Art. 45d | Requirements for qualified EAA | ➖ | | QEAA provider duties |
| Art. 45e | Verification against authentic sources | ➖ | | Authentic source access |
| Art. 45f | Requirements for public sector EAA | ➖ | | Public sector EAA |
| Art. 45g | Issuing EAA to EUDI Wallets | ➖ | | EAA provider duties to wallet |
| Art. 45h | Additional rules for EAA services | ➖ | | EAA provider rules |

### Chapter III, Section 8 - Electronic Archiving (Articles 45i-45j)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 45i | Legal effect of e-archiving | ➖ | | Legal framework |
| Art. 45j | Requirements for qualified e-archiving | ➖ | | QTSP requirements |

### Chapter III, Section 9 - Electronic Ledgers (Articles 45k-45l)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 45k | Legal effects of e-ledgers | ➖ | | Legal framework |
| Art. 45l | Requirements for qualified e-ledgers | ➖ | | QTSP requirements |

### Chapter III, Section 10 - Electronic Documents (Article 46)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 46 | Legal effects of electronic documents | ➖ | | Legal framework |

### Chapter IV - Supervision (Articles 46a-46f)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 46a | Supervision of EUDI Wallet Framework | ➖ | | Supervisory body duties |
| Art. 46b | Supervision of trust services | ➖ | | TSP supervision |
| Art. 46c | Single points of contact | ➖ | | MS designation |
| Art. 46d | Mutual assistance (EUDI Wallet) | ➖ | | Supervisory cooperation |
| Art. 46e | European Digital Identity Cooperation Group | ➖ | | Group establishment |
| Art. 46f | ENISA reports | ➖ | | ENISA duties |

### Chapter V - Final Provisions (Articles 47-52)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 47 | Exercise of delegation | ➖ | | Commission powers |
| Art. 48 | Committee procedure | ➖ | | Comitology |
| Art. 48a | Reporting requirements | ➖ | | Commission reporting |
| Art. 49 | Review | ➖ | | Periodic review |
| Art. 50 | Repeal | ➖ | | Directive repeal |
| Art. 51 | Transitional measures | ➖ | | Transition periods |
| Art. 52 | Entry into force | ➖ | | Dates |

---

## 2. Annexes to Regulation 910/2014

| Annex | Title | Status | WP Requirements | Notes |
|-------|-------|--------|-----------------|-------|
| Annex I | Requirements for qualified certificates for e-signatures | ➖ | | Certificate content (TSP) |
| Annex II | Requirements for qualified e-signature creation devices | ➖ | | QSCD requirements (TSP) |
| Annex III | Requirements for qualified certificates for e-seals | ➖ | | Certificate content (TSP) |
| Annex IV | Requirements for qualified certificates for website auth | ➖ | | QWAC content (TSP) |
| Annex V | Requirements for qualified EAA | ➖ | | QEAA provider requirements |
| Annex VI | Minimum list of attributes for authentic sources | ➖ | | Authentic source definitions |
| Annex VII | Requirements for public sector EAA | ➖ | | Public sector EAA rules |

---

## 3. Implementing Acts - First Batch (December 2024)

### 2024/2977 - Person Identification Data and EAA

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ➖ | | PID/EAA issuance rules |
| Art. 2 | Definitions | ➖ | | Term definitions |
| Art. 3 | Issuance of PID to wallet units | ➖ | | **PID Provider duties**, not WP |
| Art. 4 | Issuance of EAA to wallet units | ➖ | | **EAA Provider duties**, not WP |
| Art. 5 | Revocation of PID | ➖ | | **PID Provider duties** |
| Art. 6 | Entry into force | ➖ | | Dates |
| Annex | PID attribute schemas | ➖ | | Data schema definitions |

### 2024/2979 - Integrity and Core Functionalities

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ➖ | | Scope definition only |
| Art. 2 | Definitions | ➖ | | Term definitions only |
| Art. 3 | Wallet unit integrity | ✅ | WP-INT-001, WP-INT-002 | User auth required, WUA signing |
| Art. 4 | Wallet instances | ✅ | WP-INT-003, WP-INT-004, WP-INT-005 | WSCD usage, secure comms |
| Art. 5 | Wallet secure cryptographic applications | ✅ | WP-WSCA-001 to WP-WSCA-009 | 9 WSCA requirements |
| Art. 6 | Wallet unit authenticity and validity | ✅ | WP-WUA-001 to WP-WUA-005 | 5 WUA requirements |
| Art. 7 | Revocation of wallet unit attestations | ✅ | WP-REV-001 to WP-REV-004 | 4 revocation requirements |
| Art. 8 | Formats for PID and EAA | ✅ | WP-FMT-001 | ISO/W3C format support |
| Art. 9 | Transaction logs | ✅ | WP-LOG-001 to WP-LOG-007 | 7 logging requirements |
| Art. 10 | Embedded disclosure | ✅ | WP-EDP-001 to WP-EDP-003 | 3 disclosure requirements |
| Art. 11 | Qualified e-signatures and seals | ✅ | WP-SIG-001 to WP-SIG-003 | 3 QES requirements |
| Art. 12 | Signature creation applications | ✅ | WP-SCA-001, WP-SCA-002 | 2 SCA requirements |
| Art. 13 | Data export and portability | ✅ | WP-PORT-001 | Migration support |
| Art. 14 | Pseudonyms | ✅ | WP-PSEU-001, WP-PSEU-002 | 2 pseudonym requirements |
| Annex I | Standards for WSCA | ✅ | Referenced in WP-WSCA-009 | GlobalPlatform, GSMA |
| Annex II | Data format standards | ✅ | Referenced in WP-FMT-001 | ISO 18013-5, W3C VC |
| Annex III | Embedded disclosure policies | ✅ | Referenced in WP-EDP-001 | Policy types |
| Annex IV | Signature formats | ✅ | Referenced in WP-SCA-001/002 | XAdES, JAdES, CAdES, CSC |
| Annex V | Pseudonym specifications | ✅ | Referenced in WP-PSEU-001 | WebAuthn |

### 2024/2980 - Notifications to the Commission

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ➖ | | MS notification obligations |
| Art. 2 | Definitions | ➖ | | Term definitions |
| Art. 3 | Notification system | ➖ | | Commission system |
| Art. 4 | Notifications by Member States | ➖ | | MS duties |
| Art. 5 | Publications by the Commission | ➖ | | Commission duties |
| Art. 6 | Entry into force | ➖ | | Dates |
| Annex I | Technical requirements | ➖ | | System infrastructure |
| Annex II | Notified information | ➖ | | MS provides info ABOUT WP, not WP duties |

### 2024/2981 - Certification of EUDI Wallets

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ➖ | | Scope definition |
| Art. 2 | Definitions | ➖ | | Term definitions |
| Art. 3 | Establishment of national certification schemes | ➖ | | MS/Scheme Owner duties |
| Art. 4 | General requirements | ➖ | | Scheme requirements |
| Art. 5 | Incident and vulnerability management | ✅ | WP-VULN-001 to WP-VULN-007 | 7 vulnerability mgmt requirements |
| Art. 6 | Maintenance of national certification schemes | ➖ | | Scheme Owner duties |
| Art. 7 | General requirements (scheme owners) | ➖ | | Scheme Owner duties |
| Art. 8 | General requirements (providers) | ✅ | WP-CSEC-001 to WP-CSEC-005 | 5 security criteria requirements |
| Art. 9 | General requirements (CABs) | ➖ | | CAB duties |
| Art. 10 | Subcontracting | ➖ | | CAB duties |
| Art. 11 | Notification to supervisory body | ➖ | | CAB duties |
| Art. 12 | Incident and vulnerability management (CABs) | ➖ | | CAB duties |
| Art. 13 | Evaluation activities | ➖ | | CAB duties |
| Art. 14 | Certification activities | ➖ | | CAB duties |
| Art. 15 | Complaints and appeals | ➖ | | Scheme procedures |
| Art. 16 | Surveillance activities | ➖ | | CAB duties |
| Art. 17 | Consequences of non-compliance | ➖ | | Scheme procedures |
| Art. 18 | Certification lifecycle | ➖ | | Scheme procedures |
| Art. 19 | Retention of records | ✅ | WP-REC-001, WP-REC-002 | 2 recordkeeping reqs |
| Art. 20 | Protection of information | ✅ | WP-CONF-001 | Confidentiality |
| Art. 21 | Transition to EU cybersecurity scheme | ➖ | | Future transition |
| Art. 22 | Entry into force | ➖ | | Dates |
| Annex I | Risk register | ➖ | | Threat taxonomy (ref only) |
| Annex II | Certification schemes | ➖ | | Scheme references |
| Annex III | Functional requirements | ✅ | Referenced by Art. 8 | Cross-refs 2024/2979, 2024/2982, 2024/2977 |
| Annex IV | Evaluation activities | ➖ | | CAB evaluation methods |
| Annex V | Public security info | ✅ | WP-PUB-001, WP-PUB-002 | 2 transparency requirements |
| Annex VI | Dependency analysis | ➖ | | Evaluation methodology |
| Annex VII | Certificate content | ➖ | | Certificate format |
| Annex VIII | Certification reports | ➖ | | Report format |
| Annex IX | Evaluation requirements | ➖ | | Evaluation lifecycle |

### 2024/2982 - Protocols and Interfaces

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ➖ | | Scope definition |
| Art. 2 | Definitions | ➖ | | Term definitions |
| Art. 3 | General provisions | ✅ | WP-PROT-001 to WP-PROT-010 | 10 authentication/validation requirements |
| Art. 4 | Issuance of PID and EAA | ✅ | WP-PROT-011 to WP-PROT-016 | 6 issuance protocol requirements |
| Art. 5 | Presentation of attributes | ✅ | WP-PROT-017 to WP-PROT-020 | 4 presentation requirements |
| Art. 6 | Data erasure requests | ✅ | WP-PROT-021 to WP-PROT-023 | 3 erasure protocol requirements |
| Art. 7 | Reporting to supervisory authorities | ✅ | WP-PROT-024 to WP-PROT-026 | 3 DPA reporting requirements |
| Art. 8 | Entry into force | ➖ | | Dates |
| Annex | Protocol standards | ✅ | Referenced by Art. 5 | ISO/IEC 18013-5:2021, ISO/IEC TS 18013-7:2024 |

---

## 4. Implementing Acts - Second Batch (May 2025)

### 2025/846 - Cross-Border Identity Matching

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter | ➖ | | Scope definition |
| Art. 2 | General requirements | ➖ | | MS/RP identity matching duties |
| Art. 3 | Successful matching obligations | ➖ | | RP duties |
| Art. 4 | Unsuccessful matching obligations | ➖ | | RP duties |
| Art. 5 | Post-matching obligations | ➖ | | RP logging duties |
| Art. 6 | Entry into force | ➖ | | Dates |

### 2025/847 - Security Breach Response

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter | ➖ | | Scope definition |
| Art. 2 | Definitions | ➖ | | Term definitions |
| Art. 3 | Establishing a security breach | ➖ | | **MS assessment duties** |
| Art. 4 | Suspension measures | ➖ | | **MS suspension duties** |
| Art. 5 | Information about suspensions | ➖ | | MS information duties |
| Art. 6 | Re-establishment | ➖ | | MS re-establishment duties |
| Art. 7 | Information about re-establishment | ➖ | | MS information duties |
| Art. 8 | Withdrawal of wallets | ➖ | | **MS withdrawal duties** |
| Art. 9 | Information about withdrawal | ➖ | | MS information duties |
| Art. 10 | Information system | ➖ | | CIRAS/ENISA |
| Art. 11 | Entry into force | ➖ | | Dates |
| Annex I | Assessment criteria | ➖ | | Breach severity criteria |

### 2025/848 - Relying Party Registration

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ➖ | | RP registration framework |
| Art. 2 | Definitions | ➖ | | Term definitions |
| Art. 3 | National registers | ➖ | | MS duties |
| Art. 4 | Registration policies | ➖ | | Registrar duties |
| Art. 5 | Information to be provided | ➖ | | RP duties |
| Art. 6 | Registration processes | ➖ | | Registrar duties |
| Art. 7 | Wallet-RP access certificates | ➖ | | Certificate provider duties |
| Art. 8 | Wallet-RP registration certificates | ➖ | | Certificate provider duties |
| Art. 9 | Suspension and cancellation | ➖ | | Registrar duties |
| Art. 10 | Record keeping | ➖ | | Registrar duties |
| Art. 11 | Entry into force | ➖ | | Dates |
| Annex I | Information requirements | ➖ | | RP registration info |
| Annex II | API requirements | ➖ | | Register API specs |
| Annex III | Entitlement verification | ➖ | | RP verification |
| Annex IV | Access certificate requirements | ➖ | | Certificate specs |
| Annex V | Registration certificate requirements | ➖ | | Certificate specs |

### 2025/849 - Certified Wallet List

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter | ➖ | | Commission list publication |
| Art. 2 | Definitions | ➖ | | Term definitions |
| Art. 3 | Format and procedure for submissions | ➖ | | **MS submits WP info** - not direct WP duty |
| Art. 4 | Entry into force | ➖ | | Dates |
| Annex | Information to be submitted | ➖ | | Info format (via MS) |

---

## 5. Implementing Acts - Third Batch (July/September 2025)

### 2025/1566 - Registered Delivery

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ➖ | | QERDS standards (TSP) |
| Art. 2 | Entry into force | ➖ | | Dates |

### 2025/1567 - Certificate Formats

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ➖ | | Certificate format standards (TSP) |
| Art. 2 | Entry into force and applicability | ➖ | | Dates |

### 2025/1568 - Remote Signing (Peer Review)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | General principles for peer review | ➖ | | CAB/supervisory peer review |
| Art. 2 | Initiation of peer review | ➖ | | Peer review procedures |
| Art. 3 | Preparation of peer review | ➖ | | Peer review procedures |

### 2025/1569 - EAA/Attributes (Sign Creation Devices)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ➖ | | QEAA/PUB-EAA issuance |
| Art. 2 | Definitions | ➖ | | Term definitions |
| Art. 3 | Issuance of QEAA/PUB-EAA | ➖ | | QEAA provider duties |
| Art. 4 | Revocation of QEAA/PUB-EAA | ➖ | | QEAA provider duties |

### 2025/1570 - Certified Creation Devices

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ➖ | | QSCD standards (TSP) |
| Art. 2 | Entry into force | ➖ | | Dates |

### 2025/1571 - Seal Standards (Annual Reports)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Format and procedures of annual reports | ➖ | | TSP annual report format |
| Art. 2 | Entry into force | ➖ | | Dates |

### 2025/1572 - E-Signature Standards (Supervision)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Verification methodology | ➖ | | Supervisory verification |
| Art. 2 | Transparency | ➖ | | TSP transparency |
| Art. 3 | Trust service provider notifications | ➖ | | TSP duties |
| Art. 4 | Verifications by supervisory bodies | ➖ | | Supervisory duties |
| Art. 5 | Entry into force and applicability | ➖ | | Dates |

### 2025/1929 - Electronic Timestamps

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ➖ | | Timestamp standards (TSP) |
| Art. 2 | Entry into force | ➖ | | Dates |

### 2025/1942 - Validation Services

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ➖ | | Validation service standards (TSP) |
| Art. 2 | Entry into force | ➖ | | Dates |
| Annex | List of reference standards | ➖ | | ETSI standards |

### 2025/1943 - Signature/Certificate Standards

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards for qualified certificates | ➖ | | QC standards (TSP) |
| Art. 2 | Entry into force | ➖ | | Dates |
| Annex | List of reference standards | ➖ | | ETSI standards |

### 2025/1944 - Preservation/QERDS Standards

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards for QERDS | ➖ | | QERDS standards (TSP) |
| Art. 2 | Reference standards for QERDS interoperability | ➖ | | Interoperability (TSP) |
| Art. 3 | Entry into force | ➖ | | Dates |

### 2025/1945 - Wallet Attributes (Signature Validation)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ➖ | | Signature validation standards |
| Art. 2 | Entry into force | ➖ | | Dates |

### 2025/1946 - Wallet Reference Issuer (Preservation)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ➖ | | Preservation standards (TSP) |
| Art. 2 | Entry into force | ➖ | | Dates |

---

## 6. Implementing Acts - Fourth Batch (October/November 2025)

### 2025/2160 - Supervisory Data (TSP Risk Management)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ➖ | | TSP risk standards |
| Art. 2 | Risk management policies | ➖ | | TSP risk policies |
| Art. 3 | Identification, documentation and evaluation of risks | ➖ | | TSP risk evaluation |
| Art. 4 | Risk treatment measures | ➖ | | TSP risk treatment |

### 2025/2162 - CAB Accreditation

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Definitions | ➖ | | Term definitions |
| Art. 2 | Accreditation of conformity assessment bodies | ➖ | | CAB accreditation |
| Art. 3 | Accreditation certificate | ➖ | | CAB certificates |

### 2025/2164 - Trusted Lists

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter | ➖ | | Trusted list management |
| Art. 2 | Technical specifications | ➖ | | List format specs |
| Annex | Technical specifications | ➖ | | Technical details |

### 2025/2527 - Website Auth Certs (QWAC)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ➖ | | QWAC standards (TSP) |
| Art. 2 | Entry into force | ➖ | | Dates |

### 2025/2530 - QTSP Requirements

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Notifications to supervisory body | ➖ | | QTSP duties |
| Art. 2 | Risk management framework | ➖ | | QTSP risk management |
| Art. 3 | Termination plan | ➖ | | QTSP termination |

### 2025/2531 - Electronic Ledgers

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ➖ | | E-ledger standards (TSP) |
| Art. 2 | Entry into force | ➖ | | Dates |

### 2025/2532 - Archiving Services

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Electronic archiving with qualified signatures/seals | ➖ | | QEAS standards (TSP) |
| Art. 2 | Reference standards for qualified archiving | ➖ | | QEAS standards (TSP) |
| Art. 3 | Entry into force | ➖ | | Dates |

---

## 7. Recitals (Informative Requirements)

Recitals provide context and interpretive guidance. While not directly binding, they inform the application of articles. **The binding requirements have been extracted from the articles themselves.**

### Recitals from Regulation (EU) 2024/1183 (Amending Regulation)

| Recital | Topic | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Recital 4 | Wallet objectives | ➖ | | Policy context - Art. 5a covers |
| Recital 5 | User control and privacy | ➖ | | Art. 5a data protection covered |
| Recital 6 | Voluntary use | ➖ | | User focus - no WP duty |
| Recital 9 | High assurance level | ➖ | | Art. 5a/5c certification |
| Recital 11 | Wallet features | ➖ | | Art. 5a features covered |
| Recital 12 | Legal person wallets | ➖ | | Art. 5a scope covered |
| Recital 13 | Free-of-charge provision | ➖ | | WP-PROV-001 covers |
| Recital 14 | Electronic signatures | ➖ | | WP-SIG-* covers |
| Recital 16 | Authentic sources | ➖ | | EAA issuer focus |
| Recital 17 | DPIA requirements | ➖ | | WP-DP-* covers |
| Recital 18 | User dashboard | ➖ | | WP-FUNC-* covers |
| Recital 19 | Transaction logs | ➖ | | WP-LOG-* covers |
| Recital 20 | Portability | ➖ | | WP-PORT-001 covers |
| Recital 21 | Suspension rights | ➖ | | WP-FUNC-* covers |
| Recital 22 | Reporting mechanism | ➖ | | WP-PROT-* covers |
| Recital 23 | Certification | ➖ | | WP-CERT-* covers |
| Recital 24 | Open source | ➖ | | WP-OPS-003 covers |
| Recital 25 | Interoperability | ➖ | | WP-INTER-* covers |
| Recital 26 | Security breach | ➖ | | WP-VULN-* covers |
| Recital 27 | Peer review | ➖ | | Member State duty |
| Recital 28 | Non-discrimination | ➖ | | General principle |
| Recital 29 | Accessibility | ➖ | | Art. 15 + Art. 5a |
| Recital 30 | Online services | ➖ | | Service scope context |
| Recital 31 | Offline authentication | ➖ | | WP-FUNC-* covers |
| Recital 32 | Age verification | ➖ | | WP-FUNC-007 covers |
| Recital 33 | Member State cooperation | ➖ | | Governance |
| Recital 34 | Public sector acceptance | ➖ | | RP duty |
| Recital 35 | Private sector acceptance | ➖ | | RP duty |
| Recital 36 | Microenterprises exemption | ➖ | | RP scope |
| Recital 37 | Very large platforms | ➖ | | RP duty |
| Recital 38 | Codes of conduct | ➖ | | Commission/industry |
| Recital 39 | Review clause | ➖ | | Commission duty |
| Recital 40 | Relying party registration | ➖ | | RP duty |
| Recital 41 | Registration transparency | ➖ | | RP focus |
| Recital 42 | Data protection compliance | ➖ | | WP-DP-* covers |
| Recital 43 | RP authentication | ➖ | | RP focus |
| Recital 44 | Data request limitation | ➖ | | RP focus |
| Recital 45 | Invalid data requests | ➖ | | WP-SEC-* covers |
| Recital 46 | RP liability | ➖ | | RP focus |
| Recital 47 | Unique identifier | ➖ | | PID focus |
| Recital 48 | Liability framework | ➖ | | General framework |
| Recital 49 | Trust services scope | ➖ | | TSP focus |
| Recital 50 | Non-qualified TSPs | ➖ | | TSP focus |
| Recital 51 | TSP requirements | ➖ | | TSP focus |
| Recital 52 | Supervisory bodies | ➖ | | MS focus |
| Recital 53 | NIS2 alignment | ➖ | | Cross-reference |
| Recital 54 | Qualified TSPs | ➖ | | TSP focus |
| Recital 55 | Remote identity proofing | ➖ | | TSP focus |
| Recital 56 | Data minimization | ➖ | | WP-DP-* covers |
| Recital 57 | VLOPs acceptance | ➖ | | RP duty |
| Recital 58 | No tracking/profiling | ➖ | | WP-DP-* covers |
| Recital 59 | Selective disclosure | ➖ | | WP-FUNC-007 covers |
| Recital 60 | Pseudonyms | ➖ | | WP-PSEU-* covers |
| Recital 61 | Zero-knowledge proofs | ➖ | | WP-FUNC-* covers |
| Recital 62 | E-signature legal effect | ➖ | | Legal framework |
| Recital 63 | Advanced signatures | ➖ | | Legal framework |
| Recital 64 | Website authentication | ➖ | | TSP focus |
| Recital 65 | Browser obligations | ➖ | | Browser/OS duty |
| Recital 66 | Electronic attestations | ➖ | | EAA issuer focus |
| Recital 67 | Public sector EAA | ➖ | | EAA issuer focus |
| Recital 68 | EAA interoperability | ➖ | | EAA issuer focus |
| Recital 69 | Electronic archiving | ➖ | | TSP focus |
| Recital 70 | Electronic ledgers | ➖ | | TSP focus |
| Recital 71 | GDPR compliance | ➖ | | WP-DP-* covers |
| Recital 72 | NIS2 consistency | ➖ | | Cross-reference |
| Recital 73 | Penalties | ➖ | | MS duty |
| Recital 74 | EDPS consultation | ➖ | | Procedural |
| Recital 75 | Regular review | ➖ | | Commission duty |

## Summary Statistics

### Main Regulation (910/2014) Coverage
- **Total Articles Reviewed:** 70+ (ALL reviewed)
- **Articles with WP Requirements:** 2 (Art. 5a, 5c)
- **Annexes Reviewed:** 7/7 (all TSP-focused, no WP obligations)

### Implementing Acts Coverage
- **Total Implementing Acts:** 29
- **Reviewed with WP Requirements:** 4 (2024/2979, 2024/2981, 2024/2982, 2024/2977)
- **Reviewed - No Direct WP Requirements:** 25 (MS/TSP/RP/CAB-focused)

### Current Requirements
- **Total in wallet-provider.yaml:** 132
- **Profile-filtered requirements:** 1 (WP-DP-003a)

---

## Profile Differentiation Analysis

### Legal Basis for Wallet Provider Profiles

Article 5a(2) of Regulation (EU) 910/2014 (consolidated) defines three distinct ways EUDI Wallets can be provided:

| Profile ID | Regulation Text | Description |
|------------|-----------------|-------------|
| `member_state` | "(a) directly by a Member State" | Government-operated wallet |
| `mandated` | "(b) under a mandate from a Member State" | Private entity operating under MS authority |
| `independent` | "(c) independently of a Member State but recognised by that Member State" | Private entity recognised but not mandated |

### Profile-Specific Requirements

**Only ONE requirement has differentiated obligations by provider type:**

| Requirement | Applies To | Legal Basis | Explanation |
|-------------|------------|-------------|-------------|
| **WP-DP-003a** | `mandated`, `independent` | Article 5a(14) → Article 45h(3) *mutatis mutandis* | Private wallet providers must implement wallet services **functionally separate** from other services they provide |

**Article 5a(14) excerpt:**
> "If the European Digital Identity Wallet is provided by **private parties** in accordance with paragraph 2, **points (b) and (c)**, of this Article, the provisions of **Article 45h(3)** shall apply *mutatis mutandis*."

**Article 45h(3):**
> "Providers of qualified electronic attestation of attributes' services shall implement the provision of such qualified trust services in a manner that is functionally separate from other services provided by them."

### Universal Requirements (All Profiles)

The remaining 131 requirements apply equally to all three wallet provider types. Key provisions:

- **Article 5a(20)** applies Article 24(2) points (b), (d)-(h) to **all** wallet providers
- All certification, security, functionality, and data protection requirements are uniform
- The ARF (Architecture Reference Framework) confirms no other differentiated obligations exist

### Research Verification

**Sources consulted (2026-01-20):**
1. Regulation (EU) 910/2014 (consolidated with 2024/1183) — Article 5a, 45h
2. EU Digital Identity Wallet GitHub ARF documentation
3. europa.eu official guidance
4. eudi.dev technical specifications

**Conclusion:** The wallet provider profiles are legally grounded and correctly implemented. Only the functional separation requirement (WP-DP-003a) requires profile filtering.

---

## Audit Completion Status

✅ **AUDIT COMPLETE** (2026-01-19)

All articles and annexes of Regulation (EU) No 910/2014 (Consolidated) and all 29 Implementing Acts have been systematically reviewed for Wallet Provider requirements.

**Note:** Original 2014 recitals (1-76) are excluded from this tracker as they predate the EUDI Wallet framework and are not imported in the application. The 2024/1183 amendment recitals provide the relevant interpretive context for wallet provisions.
