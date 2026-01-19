# RCA Systematic Audit Tracker - Wallet Provider

This document tracks the systematic review of all eIDAS 2.0 legal sources for Wallet Provider requirements.

**Last Updated:** 2026-01-19
**Current Requirements Count:** 105
**Schema Version:** 4
**Verification Status:** 🔍 AUDIT IN PROGRESS

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
| Art. 5d | Publication of certified EUDI Wallets | ⬜ | | **PENDING** - publication duties |
| Art. 5e | Security breach of EUDI Wallets | ⬜ | | **PENDING** - breach response |
| Art. 5f | Cross-border reliance on EUDI Wallets | ➖ | | RP acceptance duties - not WP |
| Art. 6 | Mutual recognition | ➖ | | MS eID scheme recognition |
| Art. 6a | Provision of EUDI Wallets | ⬜ | | **PENDING** - may contain issuance requirements |
| Art. 7 | Eligibility for notification | ➖ | | eID scheme notification - MS duty |
| Art. 8 | Assurance levels | ➖ | | Defines levels - referenced in 5a |
| Art. 9 | Notification | ➖ | | MS notification procedures |
| Art. 10 | Security breach of eID schemes | ➖ | | eID breach - not wallet-specific |
| Art. 11 | Liability | ➖ | | General liability - applies mutatis mutandis via 5a(19) |
| Art. 11a | Cross-border identity matching | ➖ | | MS duties for identity matching |
| Art. 12 | Interoperability | ➖ | | eID interoperability framework |
| Art. 12a | Certification of eID schemes | ➖ | | eID certification - not wallet-specific |
| Art. 12b | Access to hardware and software features | ⬜ | | **PENDING** - platform access for wallets |

### Chapter III - Trust Services (Articles 13-24a)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 13 | Liability and burden of proof | ⬜ | | |
| Art. 14 | International aspects | ⬜ | | |
| Art. 15 | Accessibility | ⬜ | | |
| Art. 16 | Penalties | ⬜ | | |
| Art. 17 | Supervisory body | ⬜ | | |
| Art. 18 | Mutual assistance | ⬜ | | |
| Art. 19 | Security requirements for TSPs | ⬜ | | |
| Art. 19a | Requirements for non-qualified TSPs | ⬜ | | |
| Art. 20 | Supervision of qualified TSPs | ⬜ | | |
| Art. 21 | Initiation of qualified trust service | ⬜ | | |
| Art. 22 | Trusted lists | ⬜ | | |
| Art. 23 | EU trust mark | ⬜ | | |
| Art. 24 | Requirements for qualified TSPs | ⬜ | | |
| Art. 24a | Recognition of qualified trust services | ⬜ | | |

### Chapter III, Section 2 - Electronic Signatures (Articles 25-34)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 25 | Legal effects of electronic signatures | ⬜ | | |
| Art. 26 | Requirements for advanced e-signatures | ⬜ | | |
| Art. 27 | Electronic signatures in public services | ⬜ | | |
| Art. 28 | Qualified certificates for e-signatures | ⬜ | | |
| Art. 29 | Requirements for qualified e-sig creation devices | ⬜ | | |
| Art. 29a | Requirements for remote QSCD management | ⬜ | | |
| Art. 30 | Certification of QSCDs | ⬜ | | |
| Art. 31 | Publication of certified QSCDs | ⬜ | | |
| Art. 32 | Validation of qualified e-signatures | ⬜ | | |
| Art. 32a | Validation of advanced e-signatures | ⬜ | | |
| Art. 33 | Qualified validation service | ⬜ | | |
| Art. 34 | Qualified preservation service | ⬜ | | |

### Chapter III, Section 3 - Electronic Seals (Articles 35-40a)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 35 | Legal effects of electronic seals | ⬜ | | |
| Art. 36 | Requirements for advanced e-seals | ⬜ | | |
| Art. 37 | Electronic seals in public services | ⬜ | | |
| Art. 38 | Qualified certificates for e-seals | ⬜ | | |
| Art. 39 | Qualified e-seal creation devices | ⬜ | | |
| Art. 39a | Requirements for remote QSCD (seals) | ⬜ | | |
| Art. 40 | Validation and preservation of e-seals | ⬜ | | |
| Art. 40a | Validation of advanced e-seals | ⬜ | | |

### Chapter III, Section 4 - Electronic Time Stamps (Articles 41-42)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 41 | Legal effect of e-time stamps | ⬜ | | |
| Art. 42 | Requirements for qualified e-time stamps | ⬜ | | |

### Chapter III, Section 5 - Electronic Registered Delivery (Articles 43-44)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 43 | Legal effect of ERDS | ⬜ | | |
| Art. 44 | Requirements for qualified ERDS | ⬜ | | |

### Chapter III, Section 6 - Website Authentication (Article 45-45a)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 45 | Requirements for QWACs | ⬜ | | |
| Art. 45a | Cybersecurity precautionary measures | ⬜ | | |

### Chapter III, Section 7 - Electronic Attestation of Attributes (Articles 45b-45h)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 45b | Legal effects of EAA | ⬜ | | |
| Art. 45c | EAA in public services | ⬜ | | |
| Art. 45d | Requirements for qualified EAA | ⬜ | | |
| Art. 45e | Verification against authentic sources | ⬜ | | |
| Art. 45f | Requirements for public sector EAA | ⬜ | | |
| Art. 45g | Issuing EAA to EUDI Wallets | ⬜ | | |
| Art. 45h | Additional rules for EAA services | ⬜ | | |

### Chapter III, Section 8 - Electronic Archiving (Articles 45i-45j)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 45i | Legal effect of e-archiving | ⬜ | | |
| Art. 45j | Requirements for qualified e-archiving | ⬜ | | |

### Chapter III, Section 9 - Electronic Ledgers (Articles 45k-45l)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 45k | Legal effects of e-ledgers | ⬜ | | |
| Art. 45l | Requirements for qualified e-ledgers | ⬜ | | |

### Chapter III, Section 10 - Electronic Documents (Article 46)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 46 | Legal effects of electronic documents | ⬜ | | |

### Chapter IV - Supervision (Articles 46a-46f)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 46a | Supervision of EUDI Wallet Framework | ⬜ | | **PRIMARY SOURCE** - supervisory duties |
| Art. 46b | Supervision of trust services | ⬜ | | |
| Art. 46c | Single points of contact | ⬜ | | |
| Art. 46d | Mutual assistance (EUDI Wallet) | ⬜ | | |
| Art. 46e | European Digital Identity Cooperation Group | ⬜ | | |
| Art. 46f | ENISA reports | ⬜ | | |

### Chapter V - Final Provisions (Articles 47-52)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 47 | Exercise of delegation | ⬜ | | |
| Art. 48 | Committee procedure | ⬜ | | |
| Art. 48a | Reporting requirements | ⬜ | | |
| Art. 49 | Review | ⬜ | | |
| Art. 50 | Repeal | ⬜ | | |
| Art. 51 | Transitional measures | ⬜ | | |
| Art. 52 | Entry into force | ⬜ | | |

---

## 2. Annexes to Regulation 910/2014

| Annex | Title | Status | WP Requirements | Notes |
|-------|-------|--------|-----------------|-------|
| Annex I | Requirements for qualified certificates for e-signatures | ⬜ | | |
| Annex II | Requirements for qualified e-signature creation devices | ⬜ | | |
| Annex III | Requirements for qualified certificates for e-seals | ⬜ | | |
| Annex IV | Requirements for qualified certificates for website auth | ⬜ | | |
| Annex V | Requirements for qualified EAA | ⬜ | | **May contain wallet functional requirements** |
| Annex VI | Minimum list of attributes for authentic sources | ⬜ | | |
| Annex VII | Requirements for public sector EAA | ⬜ | | |

---

## 3. Implementing Acts - First Batch (December 2024)

### 2024/2977 - Person Identification Data and EAA

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ⬜ | | |
| Art. 2 | Definitions | ⬜ | | |
| Art. 3 | Issuance of PID to wallet units | ⬜ | | **Wallet must accept PID** |
| Art. 4 | Issuance of EAA to wallet units | ⬜ | | **Wallet must accept EAA** |
| Art. 5 | Revocation of PID | ⬜ | | |
| Annex | PID attribute schemas | ⬜ | | |

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
| Art. 1 | Subject matter and scope | ⬜ | | |
| Art. 2 | Definitions | ⬜ | | |
| Art. 3 | Notification system | ⬜ | | |
| Art. 4 | Notifications by Member States | ⬜ | | |
| Art. 5 | Publications by the Commission | ⬜ | | |
| Art. 6 | Entry into force | ⬜ | | |

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
| Art. 1 | Subject matter and scope | ⬜ | | |
| Art. 2 | Definitions | ⬜ | | |
| Art. 3 | General provisions | ⬜ | | **PRIMARY SOURCE** - wallet authentication |
| Art. 4 | Issuance of PID and EAA | ⬜ | | **PRIMARY SOURCE** - wallet interface |
| Art. 5 | Presentation of attributes | ⬜ | | **PRIMARY SOURCE** - wallet presentation |
| Art. 6 | Data erasure requests | ⬜ | | **PRIMARY SOURCE** - wallet data rights |
| Art. 7 | Reporting to supervisory authorities | ⬜ | | **PRIMARY SOURCE** - user reporting |
| Annex | Protocol standards | ⬜ | | **PRIMARY SOURCE** |

---

## 4. Implementing Acts - Second Batch (May 2025)

### 2025/846 - Cross-Border Identity Matching

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter | ⬜ | | |
| Art. 2 | General requirements | ⬜ | | |
| Art. 3 | Successful matching obligations | ⬜ | | |
| Art. 4 | Unsuccessful matching obligations | ⬜ | | |
| Art. 5 | Post-matching obligations | ⬜ | | |
| Art. 6 | Entry into force | ⬜ | | |

### 2025/847 - Security Breach Response

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter | ⬜ | | |
| Art. 2 | Definitions | ⬜ | | |
| Art. 3 | Establishing a security breach | ⬜ | | **Wallet provider duties** |
| Art. 4 | Suspension measures | ⬜ | | **Wallet provider duties** |
| Art. 5 | Information about suspensions | ⬜ | | |
| Art. 6 | Re-establishment | ⬜ | | **Wallet provider duties** |
| Art. 7 | Information about re-establishment | ⬜ | | |
| Art. 8 | Withdrawal of wallets | ⬜ | | **Wallet provider duties** |
| Art. 9 | Information about withdrawal | ⬜ | | |
| Art. 10 | Information system | ⬜ | | |
| Annex I | Assessment criteria | ⬜ | | |

### 2025/848 - Relying Party Registration

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ⬜ | | |
| Art. 2 | Definitions | ⬜ | | |
| Art. 3 | National registers | ⬜ | | |
| Art. 4 | Registration policies | ⬜ | | |
| Art. 5 | Information to be provided | ⬜ | | |
| Art. 6 | Registration processes | ⬜ | | |
| Art. 7 | Wallet-RP access certificates | ⬜ | | |
| Art. 8 | Wallet-RP registration certificates | ⬜ | | |
| Art. 9 | Suspension and cancellation | ⬜ | | |
| Art. 10 | Record keeping | ⬜ | | |
| Art. 11 | Entry into force | ⬜ | | |
| Annex I | Information requirements | ⬜ | | |
| Annex II | API requirements | ⬜ | | |
| Annex III | Entitlement verification | ⬜ | | |
| Annex IV | Access certificate requirements | ⬜ | | |
| Annex V | Registration certificate requirements | ⬜ | | |

### 2025/849 - Certified Wallet List

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter | ⬜ | | |
| Art. 2 | Definitions | ⬜ | | |
| Art. 3 | Format and procedure for submissions | ⬜ | | **Wallet submission duties** |
| Art. 4 | Entry into force | ⬜ | | |
| Annex | Information to be submitted | ⬜ | | **Wallet submission info** |

---

## 5. Implementing Acts - Third Batch (July/September 2025)

### 2025/1566 - Registered Delivery

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ⬜ | | |
| Art. 2 | Entry into force | ⬜ | | |

### 2025/1567 - Certificate Formats

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ⬜ | | |
| Art. 2 | Entry into force and applicability | ⬜ | | |

### 2025/1568 - Remote Signing (Peer Review)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | General principles for peer review | ⬜ | | |
| Art. 2 | Initiation of peer review | ⬜ | | |
| Art. 3 | Preparation of peer review | ⬜ | | |

### 2025/1569 - EAA/Attributes (Sign Creation Devices)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter and scope | ⬜ | | |
| Art. 2 | Definitions | ⬜ | | |
| Art. 3 | Issuance of QEAA/PUB-EAA | ⬜ | | |
| Art. 4 | Revocation of QEAA/PUB-EAA | ⬜ | | |

### 2025/1570 - Certified Creation Devices

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ⬜ | | |
| Art. 2 | Entry into force | ⬜ | | |

### 2025/1571 - Seal Standards (Annual Reports)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Format and procedures of annual reports | ⬜ | | |
| Art. 2 | Entry into force | ⬜ | | |

### 2025/1572 - E-Signature Standards (Supervision)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Verification methodology | ⬜ | | |
| Art. 2 | Transparency | ⬜ | | |
| Art. 3 | Trust service provider notifications | ⬜ | | |
| Art. 4 | Verifications by supervisory bodies | ⬜ | | |
| Art. 5 | Entry into force and applicability | ⬜ | | |

### 2025/1929 - Electronic Timestamps

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ⬜ | | |
| Art. 2 | Entry into force | ⬜ | | |

### 2025/1942 - Validation Services

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ⬜ | | |
| Art. 2 | Entry into force | ⬜ | | |
| Annex | List of reference standards | ⬜ | | |

### 2025/1943 - Signature/Certificate Standards

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards for qualified certificates | ⬜ | | |
| Art. 2 | Entry into force | ⬜ | | |
| Annex | List of reference standards | ⬜ | | |

### 2025/1944 - Preservation/QERDS Standards

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards for QERDS | ⬜ | | |
| Art. 2 | Reference standards for QERDS interoperability | ⬜ | | |
| Art. 3 | Entry into force | ⬜ | | |

### 2025/1945 - Wallet Attributes (Signature Validation)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ⬜ | | |
| Art. 2 | Entry into force | ⬜ | | |

### 2025/1946 - Wallet Reference Issuer (Preservation)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ⬜ | | |
| Art. 2 | Entry into force | ⬜ | | |

---

## 6. Implementing Acts - Fourth Batch (October/November 2025)

### 2025/2160 - Supervisory Data (TSP Risk Management)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ⬜ | | |
| Art. 2 | Risk management policies | ⬜ | | |
| Art. 3 | Identification, documentation and evaluation of risks | ⬜ | | |
| Art. 4 | Risk treatment measures | ⬜ | | |

### 2025/2162 - CAB Accreditation

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Definitions | ⬜ | | |
| Art. 2 | Accreditation of conformity assessment bodies | ⬜ | | |
| Art. 3 | Accreditation certificate | ⬜ | | |

### 2025/2164 - Trusted Lists

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Subject matter | ⬜ | | |
| Art. 2 | Technical specifications | ⬜ | | |
| Annex | Technical specifications | ⬜ | | |

### 2025/2527 - Website Auth Certs (QWAC)

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards | ⬜ | | |
| Art. 2 | Entry into force | ⬜ | | |

### 2025/2530 - QTSP Requirements

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Notifications to supervisory body | ⬜ | | |
| Art. 2 | Risk management framework | ⬜ | | |
| Art. 3 | Termination plan | ⬜ | | |

### 2025/2531 - Electronic Ledgers

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Reference standards and specifications | ⬜ | | |
| Art. 2 | Entry into force | ⬜ | | |

### 2025/2532 - Archiving Services

| Article | Title | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Art. 1 | Electronic archiving with qualified signatures/seals | ⬜ | | |
| Art. 2 | Reference standards for qualified archiving | ⬜ | | |
| Art. 3 | Entry into force | ⬜ | | |

---

## 7. Recitals (Informative Requirements)

Recitals provide context and interpretive guidance. While not directly binding, they inform the application of articles.

### Recitals from Regulation (EU) 2024/1183 (Amending Regulation)

| Recital | Topic | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Recital 4 | Wallet objectives | ⬜ | | Policy context |
| Recital 5 | User control and privacy | ⬜ | | User-focused |
| Recital 6 | Voluntary use | ⬜ | | User choice |
| Recital 9 | High assurance level | ⬜ | | **Wallet provider focus** |
| Recital 11 | Wallet features | ⬜ | | **Wallet provider focus** |
| Recital 12 | Legal person wallets | ⬜ | | **Wallet provider focus** |
| Recital 13 | Free-of-charge provision | ⬜ | | **MS/WP duty** |
| Recital 14 | Electronic signatures | ⬜ | | **Wallet feature** |
| Recital 16 | Authentic sources | ⬜ | | EAA issuer focus |
| Recital 17 | DPIA requirements | ⬜ | | **Wallet provider DPIA** |
| Recital 18 | User dashboard | ⬜ | | **Wallet provider feature** |
| Recital 19 | Transaction logs | ⬜ | | **Wallet provider feature** |
| Recital 20 | Portability | ⬜ | | **Wallet provider duty** |
| Recital 21 | Suspension rights | ⬜ | | **Wallet provider feature** |
| Recital 22 | Reporting mechanism | ⬜ | | **Wallet provider feature** |
| Recital 23 | Certification | ⬜ | | **Wallet certification** |
| Recital 24 | Open source | ⬜ | | **Wallet provider duty** |
| Recital 25 | Interoperability | ⬜ | | **Wallet provider duty** |
| Recital 26 | Security breach | ⬜ | | **Wallet provider duty** |
| Recital 27 | Peer review | ⬜ | | Member State duty |
| Recital 28 | Non-discrimination | ⬜ | | |
| Recital 29 | Accessibility | ⬜ | | **Wallet provider duty** |
| Recital 30 | Online services | ⬜ | | Service scope context |
| Recital 31 | Offline authentication | ⬜ | | **Wallet provider feature** |
| Recital 32 | Age verification | ⬜ | | **Wallet privacy feature** |
| Recital 33 | Member State cooperation | ⬜ | | Governance |
| Recital 34 | Public sector acceptance | ⬜ | | |
| Recital 35 | Private sector acceptance | ⬜ | | |
| Recital 36 | Microenterprises exemption | ⬜ | | |
| Recital 37 | Very large platforms | ⬜ | | |
| Recital 38 | Codes of conduct | ⬜ | | |
| Recital 39 | Review clause | ⬜ | | |
| Recital 40 | Relying party registration | ⬜ | | |
| Recital 41 | Registration transparency | ⬜ | | |
| Recital 42 | Data protection compliance | ⬜ | | **Wallet provider GDPR** |
| Recital 43 | RP authentication | ⬜ | | |
| Recital 44 | Data request limitation | ⬜ | | |
| Recital 45 | Invalid data requests | ⬜ | | **Wallet protection feature** |
| Recital 46 | RP liability | ⬜ | | |
| Recital 47 | Unique identifier | ⬜ | | |
| Recital 48 | Liability framework | ⬜ | | |
| Recital 49 | Trust services scope | ⬜ | | |
| Recital 50 | Non-qualified TSPs | ⬜ | | |
| Recital 51 | TSP requirements | ⬜ | | |
| Recital 52 | Supervisory bodies | ⬜ | | |
| Recital 53 | NIS2 alignment | ⬜ | | |
| Recital 54 | Qualified TSPs | ⬜ | | |
| Recital 55 | Remote identity proofing | ⬜ | | |
| Recital 56 | Data minimization | ⬜ | | |
| Recital 57 | VLOPs acceptance | ⬜ | | |
| Recital 58 | No tracking/profiling | ⬜ | | **Wallet provider duty** |
| Recital 59 | Selective disclosure | ⬜ | | **Wallet provider feature** |
| Recital 60 | Pseudonyms | ⬜ | | **Wallet provider feature** |
| Recital 61 | Zero-knowledge proofs | ⬜ | | **Wallet technology** |
| Recital 62 | E-signature legal effect | ⬜ | | |
| Recital 63 | Advanced signatures | ⬜ | | |
| Recital 64 | Website authentication | ⬜ | | |
| Recital 65 | Browser obligations | ⬜ | | |
| Recital 66 | Electronic attestations | ⬜ | | |
| Recital 67 | Public sector EAA | ⬜ | | |
| Recital 68 | EAA interoperability | ⬜ | | |
| Recital 69 | Electronic archiving | ⬜ | | |
| Recital 70 | Electronic ledgers | ⬜ | | |
| Recital 71 | GDPR compliance | ⬜ | | **Wallet provider GDPR** |
| Recital 72 | NIS2 consistency | ⬜ | | |
| Recital 73 | Penalties | ⬜ | | |
| Recital 74 | EDPS consultation | ⬜ | | |
| Recital 75 | Regular review | ⬜ | | |

### Recitals from Consolidated 910/2014 (Original Recitals 1-76)

These are the original 2014 eIDAS recitals. They predate the EUDI Wallet framework.

| Recital | Topic | Status | WP Requirements | Notes |
|---------|-------|--------|-----------------|-------|
| Recital 1-76 | (Original eIDAS recitals) | ⬜ | | Pre-wallet framework - low priority |

---

## Summary Statistics

### Main Regulation (910/2014) Coverage
- **Total Articles:** 70+
- **Articles Reviewed:** 18 (Chapter I-II)
- **Articles with WP Requirements:** 2 (Art. 5a, 5c)
- **Annexes Reviewed:** 0/7

### Implementing Acts Coverage
- **Total Implementing Acts:** 29
- **Reviewed with WP Requirements:** 0
- **Pending Review:** 29

### Current Requirements
- **Total in wallet-provider.yaml:** 43

---

## Audit Completion Status

🔍 **AUDIT IN PROGRESS** (2026-01-19)

**Completed:**
- Chapter I (Art. 1-4): All reviewed, no WP requirements
- Chapter II (Art. 5-12b): 18 articles reviewed, 2 with WP requirements (Art. 5a, 5c)

**Pending:**
- Art. 5d, 5e, 6a, 12b (marked for review)
- Chapters III-V (Art. 13-52)
- All 7 Annexes
- All 29 Implementing Acts
- All Recitals

### Priority Focus Areas

Based on RP audit experience, these are the highest-priority sources for Wallet Provider:

1. **Article 5a** - Core wallet provider duties
2. **Article 6a** - Wallet provision requirements  
3. **Article 5c, 5d, 5e** - Certification and breach response
4. **2024/2979** - Integrity and Core Functionalities (most articles apply)
5. **2024/2981** - Certification implementing act
6. **2024/2982** - Protocols and Interfaces
7. **Recitals 9-26** - Wallet-specific policy context

### Estimated Scope

Based on RP audit patterns, expect:
- **60-100+ requirements** (more than RP due to broader scope)
- **Heavy concentration** in 2024/2979 and 2024/2981
- **Cross-references** to technical standards (ISO, W3C)
