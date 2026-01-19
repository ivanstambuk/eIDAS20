# EAA Issuer Audit Tracker

> **Role**: EAA Issuer (issuer)
> **Started**: 2026-01-19
> **Status**: IN PROGRESS

## Profiles

| Profile | Description |
|---------|-------------|
| `qualified` | Qualified TSP issuing QEAAs (Annex V compliance) |
| `non_qualified` | Non-qualified provider issuing EAAs |
| `public_authentic` | Public sector body issuing from authentic sources (Art 45f, Annex VII) |

## Legend

| Status | Meaning |
|--------|---------|
| ✅ | Reviewed — requirements extracted |
| ➖ | Reviewed — no requirements for this role |
| ⬜ | Not yet reviewed |
| 🔄 | Needs re-review |

---

## Main Regulation (910/2014 as amended by 2024/1183)

### EAA-Specific Articles

| Provision | Title | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 45b | Legal effects of EAA | ➖ | | Declarative, no issuer obligations |
| Art. 45c | EAA in public services | ➖ | | Addresses MS/user rules, not issuer |
| Art. 45d | Requirements for qualified EAA | ✅ | EAA-QEAA-001, EAA-QEAA-002 | QEAA only |
| Art. 45e | Verification of attributes | ➖ | | MS obligation, not issuer |
| Art. 45f | Requirements for public sector EAA | ✅ | EAA-PSB-001 to EAA-PSB-006 | Public authentic only |
| Art. 45g | Issuing EAA to wallets | ✅ | EAA-WALLET-001, EAA-WALLET-002 | |
| Art. 45h | Additional rules for EAA services | ✅ | EAA-DP-001 to EAA-DP-003 | |
| Annex V | QEAA content requirements | ✅ | (covered by EAA-QEAA-001) | QEAA only |
| Annex VI | Verifiable attributes list | ➖ | | Informative list for MS, not issuer |
| Annex VII | Public sector EAA content | ✅ | (covered by EAA-PSB-001) | Public authentic only |

### TSP-Related Articles (apply to qualified issuers)

| Provision | Title | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 24 | QTSP requirements | ⬜ | | QEAA only - to be extracted from QTSP audit |
| Art. 24(1) | Identity verification | ⬜ | | QEAA only |
| Art. 24(1a) | Identity verification methods | ⬜ | | QEAA only |
| Art. 24(1b) | Attribute verification methods | ⬜ | | QEAA only |
| Art. 24(2) | Operational requirements | ⬜ | | QEAA only |
| Art. 24(3) | Certificate revocation | ⬜ | | QEAA only |
| Art. 24(4) | Revocation info availability | ⬜ | | QEAA only |
| Art. 24(4a) | QEAA revocation | ⬜ | | QEAA only |
| Art. 24a(9) | Cross-border QEAA recognition | ⬜ | | QEAA only |

---

## Implementing Act: 2024/2977 (PID and EAA)

| Provision | Title | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 1 | Subject matter and scope | ➖ | | Scope definition only |
| Art. 2 | Definitions | ➖ | | Definitions only |
| Art. 3 | Issuance of PID | ➖ | | PID providers only |
| Art. 4 | Issuance of EAA | ✅ | EAA-TECH-001, EAA-TECH-002, EAA-TECH-003 | |
| Art. 5 | Revocation of PID | ➖ | | PID providers only |
| Annex 1 | Natural person PID set | ➖ | | PID providers only |
| Annex 2 | Legal person PID set | ➖ | | PID providers only |
| Annex 3 | PID metadata | ➖ | | PID providers only |
| Annex 4 | PID encoding | ➖ | | PID providers only |
| Annex 5 | Trust infrastructure | ➖ | | PID providers only |

---

## Implementing Act: 2025/1569 (QEAA and Public Sector EAA)

| Provision | Title | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 1 | Subject matter and scope | ➖ | | Scope definition only |
| Art. 2 | Definitions | ➖ | | Definitions only |
| Art. 3 | Issuance of QEAA/PSB EAA | ✅ | EAA-STD-001 to EAA-STD-008 | |
| Art. 4 | Revocation of QEAA/PSB EAA | ✅ | EAA-REV-001 to EAA-REV-006 | |
| Art. 5 | Notification of public sector bodies | ➖ | | MS duty, not issuer |
| Art. 6 | Publication of PSB list | ➖ | | Commission duty |
| Art. 7 | Catalogue of attributes | ➖ | | Commission/MS duty |
| Art. 8 | Catalogue of schemes | ➖ | | Commission/MS duty |
| Art. 9 | Verification against authentic sources | ➖ | | MS duty, not issuer |
| Art. 10 | Interoperability and reuse | ➖ | | Commission duty |
| Annex I | Reference standards | ✅ | (covered by EAA-STD-001) | Referenced in Art 3 |
| Annex II | Technical specifications | ✅ | (covered by EAA-STD-002 to EAA-STD-007) | Referenced in Art 3 |
| Annex III | PSB notification info | ➖ | | MS notification procedure |

---

## Implementing Act: 2025/2530 (QTSP Requirements)

| Provision | Title | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 1 | Notifications to supervisory body | ✅ | EAA-QTSP-001 | QEAA only |
| Art. 2 | Risk management framework | ✅ | EAA-QTSP-002 | QEAA only |
| Art. 3 | Termination plan | ✅ | EAA-QTSP-003 | QEAA only |
| Art. 4 | Reference standards for QTS | ⬜ | | QEAA only |
| Annex | Reference standards per service type | ⬜ | | QEAA only |

---

## Summary

| Source | Total | Reviewed | Pending |
|--------|-------|----------|---------|
| Main Regulation | 18 | 10 | 8 |
| 2024/2977 | 10 | 10 | 0 |
| 2025/1569 | 13 | 13 | 0 |
| 2025/2530 | 5 | 3 | 2 |
| **TOTAL** | **46** | **36** | **10** |

---

## Requirements Added

| ID | Requirement | Source | Profile |
|----|-------------|--------|---------|
| EAA-QEAA-001 | Meet Annex V content requirements | Art. 45d(1) | qualified |
| EAA-QEAA-002 | Revoked QEAA loses validity immediately | Art. 45d(4) | qualified |
| EAA-PSB-001 | Meet Annex VII content requirements | Art. 45f(1)(a) | public_authentic |
| EAA-PSB-002 | Use qualified certificate with authentic source indication | Art. 45f(1)(b) | public_authentic |
| EAA-PSB-003 | Meet QTSP-equivalent reliability | Art. 45f(2) | public_authentic |
| EAA-PSB-004 | Be notified by MS with conformity assessment | Art. 45f(3) | public_authentic |
| EAA-PSB-005 | Revoked attestation loses validity immediately | Art. 45f(4) | public_authentic |
| EAA-PSB-006 | Provide interface with EUDI Wallets | Art. 45f(8) | public_authentic |
| EAA-WALLET-001 | Allow users to request/obtain/store/manage EAA from any MS wallet | Art. 45g(1) | all |
| EAA-WALLET-002 | Provide interface with EUDI Wallets | Art. 45g(2) | qualified |
| EAA-DP-001 | Not combine EAA personal data with other services | Art. 45h(1) | all |
| EAA-DP-002 | Keep EAA personal data logically separate | Art. 45h(2) | all |
| EAA-DP-003 | Implement QEAA services functionally separate | Art. 45h(3) | qualified |
| EAA-TECH-001 | Issue EAA in compliant format per Annex I of 2024/2979 | Art. 4(1) of 2024/2977 | all |
| EAA-TECH-002 | Identify to wallet using access certificate | Art. 4(2) of 2024/2977 | all |
| EAA-TECH-003 | Include authentication/validation info in EAA | Art. 4(3) of 2024/2977 | all |
| EAA-STD-001 | Comply with ETSI EN 319 401 standard | Art. 3 of 2025/1569 | qualified, public_authentic |
| EAA-STD-002 | Issue attestations in compliant format | Art. 3 of 2025/1569 | qualified, public_authentic |
| EAA-STD-003 | Verify requester has right to act on behalf | Art. 3 of 2025/1569 | qualified, public_authentic |
| EAA-STD-004 | Verify identity of authentic source | Art. 3 of 2025/1569 | qualified, public_authentic |
| EAA-STD-005 | Process only minimum necessary attributes | Art. 3 of 2025/1569 | qualified, public_authentic |
| EAA-STD-006 | Authenticate to wallet unit before issuance | Art. 3 of 2025/1569 | qualified, public_authentic |
| EAA-STD-007 | Verify wallet unit is not revoked/suspended | Art. 3 of 2025/1569 | qualified, public_authentic |
| EAA-STD-008 | Comply with attestation scheme requirements | Art. 3(2) of 2025/1569 | qualified, public_authentic |
| EAA-REV-001 | Maintain public revocation policies | Art. 4(1) of 2025/1569 | qualified, public_authentic |
| EAA-REV-002 | Only issuer can revoke its attestations | Art. 4(2) of 2025/1569 | qualified, public_authentic |
| EAA-REV-003 | Revoke on user request | Art. 4(3)(a) of 2025/1569 | qualified, public_authentic |
| EAA-REV-004 | Revoke on security/trustworthiness compromise | Art. 4(3)(b) of 2025/1569 | qualified, public_authentic |
| EAA-REV-005 | Use privacy-preserving revocation techniques | Art. 4(4) of 2025/1569 | qualified, public_authentic |
| EAA-REV-006 | Provide validity status info to relying parties | Art. 4(5) of 2025/1569 | qualified, public_authentic |
| EAA-QTSP-001 | Notify supervisory body of significant changes | Art. 1 of 2025/2530 | qualified |
| EAA-QTSP-002 | Implement risk management framework | Art. 2 of 2025/2530 | qualified |
| EAA-QTSP-003 | Establish and maintain termination plan | Art. 3 of 2025/2530 | qualified |
