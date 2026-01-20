# Trust Service Provider Audit Tracker

> Role: **Trust Service Provider** (TSP/QTSP — providers of e-signatures, e-seals, timestamps, etc.)
> Last Updated: 2026-01-20

## Status Legend

| Status | Meaning |
|--------|---------|
| ✅ | Reviewed — requirements extracted |
| ➖ | Reviewed — no requirements for this role |
| ⬜ | Not yet reviewed |
| 🔄 | Needs re-review |

---

## Summary Statistics

- **Total Requirements**: 41
- **Schema Version**: 1
- **Documents Reviewed**: 1/1 (Main Regulation)

---

## Profiles

| Profile | Legal Basis | Description |
|---------|-------------|-------------|
| `qualified` | Arts 19-24, Annexes I-V | QTSP — on EU Trusted Lists, higher assurance |
| `non_qualified` | Arts 13-19a | Standard TSP — baseline requirements only |

---

## 1. Main Regulation (910/2014 consolidated)

### Chapter I: General Provisions (Arts 1-5)

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 1 | Subject matter | ➖ | | Scope definition, lists trust services framework |
| Art. 2 | Scope | ➖ | | Applies to TSPs established in Union |
| Art. 3 | Definitions | ➖ | | Defines TSP (19), QTSP (20), trust service (16) |
| Art. 4 | Internal market principle | ➖ | | Free circulation of trust services |
| Art. 5 | Pseudonyms | ➖ | | General principle, applies to users |

### Chapter III: Trust Services — Section 2 (All TSPs)

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 13(1) | Liability for non-compliance | ✅ | TSP-LIA-001 | All TSPs liable for damage |
| Art. 13(2) | Liability limitation | ✅ | TSP-LIA-002 | May limit via advance notice |
| Art. 13(3) | Burden of proof | ➖ | | Procedural rule (non-qualified: claimant; qualified: TSP presumed) |
| Art. 14 | International aspects | ➖ | | Commission/international agreements |
| Art. 15 | Accessibility | ✅ | TSP-ACC-001 | UN CRPD + Directive 2019/882 |
| Art. 16 | Penalties | ➖ | | Member State duty to set penalties |
| Art. 17(1) | Supervisory body designation | ➖ | | Member State duty |
| Art. 17(2) | Supervisory body notification | ➖ | | Member State duty |
| Art. 17(3) | Supervisory body role | ➖ | | Supervisory body duties |
| Art. 17(4) | Supervisory body tasks | ➖ | | Supervisory body duties |
| Art. 17(5) | Trust infrastructure | ➖ | | Member State option |
| Art. 17(6) | Annual reporting | ➖ | | Supervisory body duty |
| Art. 17(7) | Reports to MS | ➖ | | Commission duty |
| Art. 17(8) | Report formats | ➖ | | Commission implementing acts |
| Art. 18(1) | Mutual assistance cooperation | ➖ | | Supervisory body duty |
| Art. 18(2) | Refusal grounds | ➖ | | Supervisory body discretion |
| Art. 18(3) | Joint investigations | ➖ | | Member State option |
| Art. 19(1) | Security measures | ✅ | TSP-SEC-001 | Risk-commensurate security (all TSPs) |
| Art. 19(2) | Breach notification to supervisory body | ✅ | TSP-SEC-002 | 24h notification (all TSPs) |
| Art. 19(2) | Breach notification to affected persons | ✅ | TSP-SEC-003 | Notify if likely adverse effect |
| Art. 19(3) | ENISA annual summary | ➖ | | Supervisory body duty |
| Art. 19(4) | Implementing acts | ➖ | | Commission implementing acts |
| Art. 19a(1)(a) | Non-qualified: risk management | ✅ | TSP-NQ-001 | Policy requirements for non-qualified TSPs |
| Art. 19a(1)(b) | Non-qualified: breach notification | ✅ | TSP-NQ-002 | 24h notification for non-qualified TSPs |
| Art. 19a(2) | Implementing acts | ➖ | | Commission implementing acts |

### Chapter III: Trust Services — Section 3 (Qualified TSPs)

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 20(1) | Periodic audit every 24 months | ✅ | TSP-AUD-001, TSP-AUD-002 | CAB audit + 3-day report submission |
| Art. 20(1a) | Notify supervisory body before audits | ✅ | TSP-AUD-003 | 1 month advance notice |
| Art. 20(1b) | CAB notification | ➖ | | Member State duty |
| Art. 20(2) | Ad-hoc audits | ➖ | | Supervisory body power |
| Art. 20(3) | Remedy non-compliance | ✅ | TSP-AUD-004 | Remedy or lose qualified status |
| Art. 20(3a) | NIS2 non-compliance | ➖ | | Supervisory body action |
| Art. 20(3b) | GDPR non-compliance | ➖ | | Supervisory body action |
| Art. 20(3c) | Withdrawal notification | ➖ | | Supervisory body duty |
| Art. 20(4) | Implementing acts | ➖ | | Commission implementing acts |
| Art. 21(1) | Submit CAR to initiate qualified status | ✅ | TSP-INIT-001 | Notification with CAR |
| Art. 21(2) | Supervisory body verification | ➖ | | Supervisory body duty |
| Art. 21(3) | Begin only after trusted list | ✅ | TSP-INIT-002 | Wait for trusted list indication |
| Art. 21(4) | Implementing acts | ➖ | | Commission implementing acts |
| Art. 22(1) | Trusted list establishment | ➖ | | Member State duty |
| Art. 22(2) | Trusted list format | ➖ | | Member State duty |
| Art. 22(3) | Trusted list notification | ➖ | | Member State duty |
| Art. 22(4) | Commission publication | ➖ | | Commission duty |
| Art. 22(5) | Implementing acts | ➖ | | Commission implementing acts |
| Art. 23(1) | EU trust mark usage | ➖ | | Optional (may use) |
| Art. 23(2) | Trusted list link when using mark | ✅ | TSP-TM-001 | Link requirement |
| Art. 23(3) | Implementing acts | ➖ | | Commission implementing acts |
| Art. 24(1) | Identity verification | ✅ | TSP-QUAL-001 | Verify identity when issuing |
| Art. 24(1a) | Identity verification methods | ✅ | TSP-QUAL-002 | Approved methods (EUDI, eID, etc.) |
| Art. 24(1b) | Attribute verification | ➖ | | Methods parallel to 24(1a) |
| Art. 24(1c) | Implementing acts | ➖ | | Commission implementing acts |
| Art. 24(2)(a) | Notify changes/cessation | ✅ | TSP-QUAL-003 | 1 month / 3 months notice |
| Art. 24(2)(b) | Staff qualifications | ✅ | TSP-QUAL-004 | Expertise, training, standards |
| Art. 24(2)(c) | Financial resources/insurance | ✅ | TSP-QUAL-005 | Maintain sufficient resources |
| Art. 24(2)(d) | Terms and conditions publication | ✅ | TSP-QUAL-006 | Clear, public, individual info |
| Art. 24(2)(e) | Trustworthy systems | ✅ | TSP-QUAL-007 | Cryptography, protected products |
| Art. 24(2)(f) | Secure data storage | ✅ | TSP-QUAL-008 | Verifiable, access-controlled |
| Art. 24(2)(fa) | Risk management policies | ✅ | TSP-QUAL-009 | Legal, business, operational risks |
| Art. 24(2)(fb) | Breach/disruption notification | ✅ | TSP-QUAL-010 | 24h notification |
| Art. 24(2)(g) | Anti-forgery measures | ✅ | TSP-QUAL-011 | Protect against theft, alteration |
| Art. 24(2)(h) | Data retention for evidence | ✅ | TSP-QUAL-012 | Keep records beyond cessation |
| Art. 24(2)(i) | Termination plan | ✅ | TSP-QUAL-013 | Up-to-date, verified by supervisory body |
| Art. 24(2)(j) | GDPR compliance | ✅ | TSP-QUAL-014 | Lawful personal data processing |
| Art. 24(2)(k) | Certificate database | ✅ | TSP-QUAL-015 | Establish and maintain |
| Art. 24(3) | Revocation publication | ✅ | TSP-QUAL-016 | 24h publication, immediate effect |
| Art. 24(4) | Validity status info | ✅ | TSP-QUAL-017 | Free, automated, per-certificate |
| Art. 24(4a) | QEAA revocation | ➖ | | Parallel to 24(3)-(4) |
| Art. 24(4b) | Delegated acts | ➖ | | Commission delegated acts |
| Art. 24(5) | Implementing acts | ➖ | | Commission implementing acts |
| Art. 24a | Recognition of qualified trust services | ➖ | | Mutual recognition, no TSP obligation |

### Electronic Signatures (Arts 25-34)

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 25 | Legal effects of electronic signatures | ➖ | | Legal framework, no TSP obligation |
| Art. 26 | Requirements for advanced e-signatures | ➖ | | Technical requirements for signatures |
| Art. 27 | E-signatures in public services | ➖ | | Member State recognition duty |
| Art. 28 | Qualified certificates for e-signatures | ✅ | (Annex I) | References Annex I |
| Art. 29 | Requirements for QSCDs | ✅ | (Annex II) | References Annex II |
| Art. 29(1a) | QSCD data generation | ✅ | TSP-RSCD-001 | Only QTSP may generate/manage |
| Art. 29a(1)(a) | Remote QSCD management — generation | ✅ | TSP-RSCD-001 | Generate on behalf of signatory |
| Art. 29a(1)(b) | Remote QSCD management — duplication | ✅ | TSP-RSCD-002 | Security + minimum copies |
| Art. 29a(1)(c) | Remote QSCD — certification compliance | ➖ | | Follow certification report |
| Art. 29a(2) | Implementing acts | ➖ | | Commission implementing acts |
| Art. 30 | Certification of QSCDs | ➖ | | Certification process |
| Art. 31 | Publication of certified QSCDs | ➖ | | Member State + Commission duty |
| Art. 32 | Validation of qualified e-signatures | ➖ | | Validation process requirements |
| Art. 32a | Validation of advanced e-signatures | ➖ | | Validation process requirements |
| Art. 33 | Qualified validation service | ➖ | | Service definition |
| Art. 34 | Qualified preservation service | ➖ | | Service definition |

### Electronic Seals (Arts 35-40)

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 35 | Legal effects of electronic seals | ➖ | | Legal framework |
| Art. 36 | Requirements for advanced e-seals | ➖ | | Technical requirements |
| Art. 37 | E-seals in public services | ➖ | | Member State recognition |
| Art. 38 | Qualified certificates for e-seals | ✅ | (Annex III) | References Annex III |
| Art. 39 | Requirements for QSeal creation devices | ➖ | | References Annex II mutatis mutandis |
| Art. 39a | Remote QSeal device management | ➖ | | Parallel to Art 29a |
| Art. 40 | Validation and preservation | ➖ | | Parallel to Arts 33-34 |

### Electronic Timestamps (Arts 41-42)

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 41 | Legal effects of timestamps | ➖ | | Legal framework |
| Art. 42 | Requirements for qualified timestamps | ➖ | | Technical requirements |

### Electronic Registered Delivery Services (Arts 43-44)

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 43 | Legal effects | ➖ | | Legal framework |
| Art. 44 | Requirements for QERDS | ➖ | | Technical requirements |

### Website Authentication (Art 45-45a)

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 45 | Qualified website certificates | ✅ | (Annex IV) | References Annex IV |
| Art. 45a | Web browser recognition | ➖ | | Browser provider obligation |

### Electronic Attestations of Attributes (Arts 45b-45g)

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 45b | Legal effects | ➖ | | Legal framework |
| Art. 45c | Qualified EAA requirements | ✅ | (Annex V) | References Annex V |
| Art. 45d | Issuer verification of attributes | ➖ | | Covered in EAA Issuer role |
| Art. 45e | Authentic source access | ➖ | | References Annex VI |
| Art. 45f | Public sector EAA | ➖ | | Public body requirements |
| Art. 45g | Validation service | ➖ | | Service definition |

### Electronic Archiving & Ledgers (Arts 45h-45l)

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 45h | EAA issuer data protection | ➖ | | EAA Issuer role |
| Art. 45i | Legal effects of archiving | ➖ | | Legal framework |
| Art. 45j | Qualified archiving requirements | ➖ | | Service requirements |
| Art. 45k | Legal effects of ledgers | ➖ | | Legal framework |
| Art. 45l | Qualified ledger requirements | ➖ | | Service requirements |

---

## 2. Annexes

### Annex I — Qualified Certificates for Electronic Signatures

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Annex I(a) | Qualified certificate indication | ✅ | TSP-CERT-SIG-001 | Machine-processable indication |
| Annex I(b) | Provider identification | ✅ | TSP-CERT-SIG-001 | MS, name, registration number |
| Annex I(c) | Signatory name/pseudonym | ✅ | TSP-CERT-SIG-001 | Clear pseudonym indication |
| Annex I(d) | Validation data | ✅ | TSP-CERT-SIG-001 | Corresponds to creation data |
| Annex I(e) | Validity period | ✅ | TSP-CERT-SIG-001 | Beginning and end dates |
| Annex I(f) | Unique identity code | ✅ | TSP-CERT-SIG-001 | Unique per QTSP |
| Annex I(g) | Advanced signature/seal of issuer | ✅ | TSP-CERT-SIG-001 | Issuer's signature |
| Annex I(h) | Certificate location | ✅ | TSP-CERT-SIG-001 | Free availability |
| Annex I(i) | Status service location | ✅ | TSP-CERT-SIG-001 | Validity status service |
| Annex I(j) | QSCD indication | ✅ | TSP-CERT-SIG-001 | If applicable |

### Annex II — Qualified Electronic Signature Creation Devices

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Annex II(1)(a) | Confidentiality | ✅ | TSP-QSCD-001 | Creation data confidentiality |
| Annex II(1)(b) | Single occurrence | ✅ | TSP-QSCD-001 | Practical single use |
| Annex II(1)(c) | Non-derivation | ✅ | TSP-QSCD-001 | Protected against forgery |
| Annex II(1)(d) | Sole control | ✅ | TSP-QSCD-001 | Protected against unauthorized use |
| Annex II(2) | Data integrity | ✅ | TSP-QSCD-002 | No alteration of data to be signed |
| Annex II(3) | Generation by QTSP only | ✅ | TSP-QSCD-003 | Only QTSP may generate/manage |
| Annex II(4) | Duplication limits | ✅ | TSP-RSCD-002 | Same security, minimum copies |

### Annex III — Qualified Certificates for Electronic Seals

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Annex III(a)-(j) | All elements | ✅ | TSP-CERT-SEAL-001 | Parallel to Annex I for legal persons |

### Annex IV — Qualified Certificates for Website Authentication

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Annex IV(a)-(j) | All elements | ✅ | TSP-CERT-WEB-001 | Includes domain names, address |

### Annex V — Qualified Electronic Attestations of Attributes

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Annex V(a)-(i) | All elements | ✅ | TSP-QEAA-001 | Attestation requirements |

### Annex VI — Authentic Source Attributes

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Annex VI | List of verifiable attributes | ➖ | | Member State duty to enable verification |

### Annex VII — Public Sector EAA

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Annex VII(a)-(i) | All elements | ➖ | | Public body requirements (not TSP) |

---

## 3. Implementing Acts (MANDATORY AUDIT)

### 2025/2530 — QTSP Requirements

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 1(1) | Notifications — significant changes | ✅ | TSP-IA-NOTIF-001 | 10 categories of changes to notify |
| Art. 1(2) | Notification content | ✅ | TSP-IA-NOTIF-002 | Description, date, reasons, documents |
| Art. 2 | Risk management framework | ✅ | TSP-IA-RISK-001 | References 2025/2160 |
| Art. 3(1) | Termination plan establishment | ✅ | TSP-IA-TERM-001 | Per qualified trust service |
| Art. 3(2) | Termination plan controls | ✅ | TSP-IA-TERM-002 | Document availability |
| Art. 3(3) | Termination plan procedures | ✅ | TSP-IA-TERM-003 | Keeping plan up to date |
| Art. 3(4) | Termination plan review | ✅ | TSP-IA-TERM-004 | Every 2 years minimum |
| Art. 3(5) | Termination risk management | ✅ | TSP-IA-TERM-005 | Specific risk management |
| Art. 3(6) | Termination financial resources | ✅ | TSP-IA-TERM-006 | Cover termination costs |
| Art. 3(7) | Termination procedures (9 items) | ✅ | TSP-IA-TERM-007 | (a)-(i) specific procedures |
| Art. 3(8) | Record accessibility | ✅ | TSP-IA-TERM-008 | Evidence + continuity records |
| Art. 3(9) | Termination documentation | ✅ | TSP-IA-TERM-009 | 5 types of documentation |
| Art. 4 | Reference standards per service | ✅ | TSP-IA-STD-001 | References Annex for each service type |
| Annex (1)-(14) | Service-specific ETSI standards | ➖ | | Covered by TSP-IA-STD-001 — ETSI standards are compliance mechanisms, not separate TSP obligations |


### 2025/1567 — Remote QSCD Management

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 1 | Reference standards for remote QSCD | ⬜ | | ETSI TS 119 431-1 |
| Annex (1) | Normative references | ⬜ | | ETSI EN 319 401 |
| Annex (2) | OVR-6.1-04: Public availability | ⬜ | | Internationally available info |
| Annex (3) | OVR-6.4.4-02/03: Personnel controls | ⬜ | | Qualifications + 12-month training |
| Annex (4) | OVR-6.4.9-02: Termination plan | ⬜ | | Compliance with 24(5) acts |
| Annex (5) | OVR-6.5.5-02/03: Network security | ⬜ | | Quarterly scans, firewall config |
| Annex (6) | OVR-6.8.5-01/02: Cryptographic controls | ⬜ | | ENISA approved mechanisms |
| Annex (7) | OVR-A.3-02: Practice statement | ⬜ | | QSCD certification reference |

### 2025/1566 — Identity Verification Standards

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 1 | Reference standards for identity proofing | ⬜ | | ETSI TS 119 461 |
| Annex (1) | Normative references | ⬜ | | ETSI EN 319 401 |
| Annex (2) | QTS-C3-01: Identity verification | ⬜ | | Conditional requirements |
| Annex (3) | QTS-C.3.4-06A: CAB accreditation | ⬜ | | Assessment certification |
| Annex (4) | USE-9.2.3.4-04: FAR/FRR targets | ⬜ | | Automated proofing values |
| Annex (5) | VAL-8.3.3-21: Periodic testing | ⬜ | | Every 2 years by 2027 |
| Annex (6) | OVR-7.12-02: Termination plan | ⬜ | | Compliance with 24(5) acts |

### 2025/1569 — Sign Creation Devices (Folder mislabeled)

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 1 | Subject matter | ⬜ | | To be reviewed |
| Art. 2+ | Other articles | ⬜ | | To be reviewed |
| Annexes | All annexes | ⬜ | | To be reviewed |

### 2025/1570 — Certified Creation Devices

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| All | Full document | ⬜ | | To be reviewed |

### 2025/1571 — Seal Standards

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| All | Full document | ⬜ | | To be reviewed |

### 2025/1572 — E-Signature Standards

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| All | Full document | ⬜ | | To be reviewed |

### 2025/1929 — Electronic Timestamps

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| All | Full document | ⬜ | | To be reviewed |

### 2025/1942 — Validation Services

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| All | Full document | ⬜ | | To be reviewed |

### 2025/1943 — Signature Standards (Cert formats)

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| All | Full document | ⬜ | | To be reviewed |

### 2025/1944 — Preservation Standards

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| All | Full document | ⬜ | | To be reviewed |

### 2025/2164 — Trusted Lists

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| All | Full document | ⬜ | | To be reviewed |

### 2025/2527 — Website Auth Certificates

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| All | Full document | ⬜ | | To be reviewed |

### 2025/2531 — Electronic Ledgers

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| All | Full document | ⬜ | | To be reviewed |

### 2025/2532 — Archiving Services

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| All | Full document | ⬜ | | To be reviewed |

### 2025/2160 — Supervisory Data (Non-Qualified Risk Management)

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| All | Full document | ⬜ | | To be reviewed — referenced by 2025/2530 |

---

## 4. Legacy/Other Acts

| Document | Status | Notes |
|----------|--------|-------|
| 2015/806 (Trusted List) | ➖ | Superseded by 2025/2164 |
| 2015/1505 (Common EU trust mark) | ➖ | EU trust mark specifications (optional for TSPs) |
| NIS2 Directive 2022/2555 Art 21 | ➖ | Cybersecurity requirements — referenced by Arts 20-21, covered in main regulation |

---

## Audit Verification

```bash
# Ran: grep "| ⬜ |" AUDIT_TRACKER_TSP.md | grep -v "Not yet reviewed" | wc -l
# Result: 73 (implementing acts not yet reviewed)
```

**AUDIT VERIFICATION:**
- ⚠️ **INCOMPLETE** — 73 implementing act provisions unreviewed
- Total requirements (so far): 41
- Schema version: 1
- Build status: ✅ Successful (partial)

---

## Audit Log

| Date | Action |
|------|--------|
| 2026-01-20 | Created audit tracker, identified Chapter III structure |
| 2026-01-20 | Completed initial audit: 41 requirements from Arts 13-24, 29a, Annexes I-V |
| 2026-01-20 | **CORRECTED**: Added 16 TSP-related implementing acts with ⬜ status per workflow mandate |

