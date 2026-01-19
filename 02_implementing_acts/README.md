# eIDAS 2.0 Implementing Acts Catalog

This directory contains the Commission Implementing Regulations (CIRs) adopted under Regulation (EU) 2024/1183 (eIDAS 2.0).

## Overview

The European Commission is mandated to adopt implementing acts to establish reference standards, specifications, and procedures for the European Digital Identity Framework. These implementing acts are adopted in phases:

- **First Batch**: December 2024 (published December 4, 2024) - EUDI Wallet core
- **Second Batch**: May 2025 - EUDI Wallet security and operations
- **Third Batch**: July/September 2025 - Trust services and peer reviews
- **Fourth Batch**: October/November 2025 - Conformity assessment, trusted lists, and qualified services

## ✅ First Batch (December 2024) - EUDI Wallet Implementation

All converted with Formex v2 pipeline.

| CELEX | Regulation | Title | Status |
|-------|------------|-------|--------|
| 32024R2977 | 2024/2977 | Person identification data and electronic attestations of attributes | ✅ Formex v2 |
| 32024R2979 | 2024/2979 | Integrity and core functionalities of EUDI Wallets | ✅ Formex v2 |
| 32024R2980 | 2024/2980 | Notifications to the Commission | ✅ Formex v2 |
| 32024R2981 | 2024/2981 | Certification of EUDI Wallets | ✅ Formex v2 |
| 32024R2982 | 2024/2982 | Protocols and interfaces | ✅ Formex v2 |

**Entry into force**: December 24, 2024

## ✅ Second Batch (May 2025) - EUDI Wallet Operations

| CELEX | Regulation | Title | Status |
|-------|------------|-------|--------|
| 32025R0846 | 2025/846 | **Cross-border identity matching** | ✅ Formex v2 |
| 32025R0847 | 2025/847 | **Security breach responses** for EUDI Wallets | ✅ Formex v2 |
| 32025R0848 | 2025/848 | **Relying party registration** for EUDI Wallets | ✅ Formex v2 |
| 32025R0849 | 2025/849 | **Certified wallet list** - Commission info submission | ✅ Formex v2 |

**Entry into force**: May 26, 2025

## ✅ Third Batch (July/September 2025) - Trust Services & Electronic Attestations

| CELEX | Regulation | Title | Status |
|-------|------------|-------|--------|
| 32025R1566 | 2025/1566 | **Identity verification** for qualified certificates | ✅ Formex v2 |
| 32025R1567 | 2025/1567 | **Remote qualified creation devices** | ✅ Formex v2 |
| 32025R1568 | 2025/1568 | **Peer reviews** of electronic identification schemes | ✅ Formex v2 |
| 32025R1569 | 2025/1569 | **EAA verification** - Electronic attestation of attributes | ✅ Formex v2 |
| 32025R1570 | 2025/1570 | **Certified creation devices** notification | ✅ Formex v2 |
| 32025R1571 | 2025/1571 | **Annual reports** by supervisory bodies | ✅ Formex v2 |
| 32025R1572 | 2025/1572 | **Qualified trust service applications** | ✅ Formex v2 |
| 32025R1929 | 2025/1929 | **Qualified electronic time stamps** | ✅ Formex v2 |
| 32025R1942 | 2025/1942 | **Validation services** recognition | ✅ Formex v2 |
| 32025R1943 | 2025/1943 | **Signature standards** & validation procedures | ✅ Formex v2 |
| 32025R1944 | 2025/1944 | **Electronic registered delivery services** | ✅ Formex v2 |
| 32025R1945 | 2025/1945 | **Signature/seal validation** requirements | ✅ Formex v2 |
| 32025R1946 | 2025/1946 | **Qualified preservation services** | ✅ Formex v2 |

**Entry into force**: August 19 - October 19, 2025

## ✅ Fourth Batch (October/November 2025) - Conformity & Qualified Services

| CELEX | Regulation | Title | Status |
|-------|------------|-------|--------|
| 32025R2160 | 2025/2160 | **Non-qualified trust services** risk policies | ✅ Formex v2 |
| 32025R2162 | 2025/2162 | **CAB accreditation** - Conformity assessment bodies | ✅ Formex v2 |
| 32025D2164 | 2025/2164 | **Trusted lists** templates (Decision) | ✅ Formex v2 |
| 32025R2527 | 2025/2527 | **Website authentication** qualified certificates | ✅ Formex v2 |
| 32025R2530 | 2025/2530 | **Qualified trust service providers** requirements | ✅ Formex v2 |
| 32025R2531 | 2025/2531 | **Qualified electronic ledgers** | ✅ Formex v2 |
| 32025R2532 | 2025/2532 | **Qualified electronic archiving** services | ✅ Formex v2 |

**Entry into force**: November 16, 2025

## 📋 Draft Acts (Pending Adoption)

| Topic | Status | Link |
|-------|--------|------|
| Formats of advanced electronic signatures and seals | 📋 Public Consultation | [Have Your Say](https://ec.europa.eu/info/law/better-regulation/have-your-say/initiatives/14753) |
| Remote user onboarding | 📋 Public Consultation | [Have Your Say](https://ec.europa.eu/info/law/better-regulation/have-your-say/initiatives/15572) |

## Directory Structure

```
02_implementing_acts/
├── 2024_2977_PID_and_EAA/              # Person ID & Attestations
├── 2024_2979_Integrity_Core_Functions/ # Wallet Integrity
├── 2024_2980_Notifications/            # Commission Notifications
├── 2024_2981_Certification/            # Wallet Certification
├── 2024_2982_Protocols_Interfaces/     # Technical Protocols
├── 2025_0846_Cross_Border_Identity/    # Cross-border Matching
├── 2025_0847_Security_Breach_Response/ # Security Incidents
├── 2025_0848_Relying_Party_Registration/ # RP Registration
├── 2025_0849_Certified_Wallet_List/    # Certified Wallets
├── 2025_1566_QC_Identity_Verification/ # QC Identity
├── 2025_1567_Remote_Creation_Devices/  # Remote QSCDs
├── 2025_1568_Peer_Reviews_eID/         # eID Scheme Reviews
├── 2025_1569_EAA_Verification/         # EAA Verification
├── 2025_1570_Certified_Creation_Devices/ # QSCD Notification
├── 2025_1571_Annual_Reports/           # Supervisory Reports
├── 2025_1572_QTS_Applications/         # QTS Applications
├── 2025_1929_Electronic_Timestamps/    # Qualified Timestamps
├── 2025_1942_Validation_Services/      # Validation Services
├── 2025_1943_Signature_Standards/      # Signature Standards
├── 2025_1944_Electronic_Delivery/      # ERDS Standards
├── 2025_1945_Signature_Validation/     # Signature Validation
├── 2025_1946_Preservation_Services/    # Preservation Services
├── 2025_2160_Non_Qualified_TS_Risks/   # Risk Management
├── 2025_2162_CAB_Accreditation/        # CAB Requirements
├── 2025_2164_Trusted_Lists/            # TL Templates
├── 2025_2527_Website_Auth_Certs/       # Website Auth QCs
├── 2025_2530_QTSP_Requirements/        # QTSP Requirements
├── 2025_2531_Electronic_Ledgers/       # Qualified Ledgers
├── 2025_2532_Archiving_Services/       # Archiving Services
└── README.md
```

Each directory contains:
- `{CELEX}.md` - Full regulation text in Markdown
- `{CELEX}.fmx4.zip` - Original Formex XML archive
- `formex/` - Extracted Formex XML files

## Key Topics by Regulation

### EUDI Wallet Core
- **2024/2977**: PID lifecycle, EAA management, credential disclosure
- **2024/2979**: Core wallet functions, security requirements
- **2024/2981**: Certification framework, assurance levels
- **2024/2982**: Technical protocols, interoperability

### EUDI Wallet Operations
- **2025/0846**: Cross-border identity matching
- **2025/0847**: Incident response, suspension/withdrawal procedures
- **2025/0848**: Relying party registration requirements
- **2025/0849**: Certified wallet publication to Commission

### Electronic Attestations of Attributes
- **2025/1569**: EAA issuance, revocation, and verification
- **2025/1566**: Identity verification for qualified certificates

### Trust Services
- **2025/1567**: Remote qualified creation devices
- **2025/1570**: Certified creation devices notification
- **2025/1571**: Annual reports by supervisory bodies
- **2025/1572**: Qualified trust service applications
- **2025/1929**: Qualified electronic time stamps
- **2025/1942**: Validation services recognition
- **2025/1943**: Reference standards for signatures/seals
- **2025/1944**: Electronic registered delivery service standards
- **2025/1945**: Signature and seal validation procedures
- **2025/1946**: Qualified preservation services
- **2025/2160**: Risk management for non-qualified services
- **2025/2162**: Conformity assessment body accreditation
- **2025/2164**: Common trusted list templates
- **2025/2527**: Website authentication qualified certificates
- **2025/2530**: Qualified trust service provider requirements
- **2025/2531**: Qualified electronic ledgers
- **2025/2532**: Qualified electronic archiving services

### Cross-Border Recognition
- **2025/1568**: Peer review procedures for eID schemes

## EUR-Lex Access

All implementing acts available via:
```
https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:{CELEX}
```

## Related Resources

- **Architecture Reference Framework**: `../03_arf/`
- **Technical Specifications**: `../04_technical_specs/`
- **Main Regulation (eIDAS 2.0)**: `../01_regulation/2024_1183_eIDAS2/`

---

*Last updated: 2026-01-13*
*Total: 29 implementing acts (all adopted acts as of January 2026)*
