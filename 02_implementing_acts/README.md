# eIDAS 2.0 Implementing Acts Catalog

This directory contains the Commission Implementing Regulations (CIRs) adopted under Regulation (EU) 2024/1183 (eIDAS 2.0).

## Overview

The European Commission is mandated to adopt implementing acts to establish reference standards, specifications, and procedures for the European Digital Identity Framework. These implementing acts are adopted in phases:

- **First Batch**: December 2024 (published December 4, 2024) - EUDI Wallet core
- **Second Batch - May 2025**: EUDI Wallet security and operations
- **Third Batch - July 2025**: Trust services and peer reviews
- **Fourth Batch - October 2025**: Conformity assessment and trusted lists

---

## ✅ First Batch (December 2024) - EUDI Wallet Implementation

All converted with Formex v2 pipeline.

| CELEX | Regulation | Title | Status |
|-------|------------|-------|--------|
| 32024R2977 | 2024/2977 | Person identification data and electronic attestations of attributes | ✅ Formex v2 |
| 32024R2978 | 2024/2978 | Trusted lists publication | ✅ Formex v2 |
| 32024R2979 | 2024/2979 | Integrity and core functionalities of EUDI Wallets | ✅ Formex v2 |
| 32024R2980 | 2024/2980 | Notifications to the Commission | ✅ Formex v2 |
| 32024R2981 | 2024/2981 | Certification of EUDI Wallets | ✅ Formex v2 |
| 32024R2982 | 2024/2982 | Protocols and interfaces | ✅ Formex v2 |

**Entry into force**: December 24, 2024

---

## ✅ Second Batch - May 2025 (EUDI Wallet Operations)

| CELEX | Regulation | Title | Status |
|-------|------------|-------|--------|
| 32025R0847 | 2025/847 | **Security breach responses** for EUDI Wallets | ✅ Downloaded |
| 32025R0848 | 2025/848 | **Relying party registration** for EUDI Wallets | ✅ Downloaded |
| 32025R0849 | 2025/849 | **Certified wallet list** - Commission info submission | ✅ Downloaded |

**Entry into force**: May 26, 2025

---

## ✅ Third Batch - July/September 2025 (Trust Services & Peer Reviews)

| CELEX | Regulation | Title | Status |
|-------|------------|-------|--------|
| 32025R1568 | 2025/1568 | **Peer reviews** of electronic identification schemes | ✅ Downloaded |
| 32025R1944 | 2025/1944 | **Electronic registered delivery services** | ✅ Downloaded |
| 32025R1945 | 2025/1945 | **Signature/seal validation** requirements | ✅ Downloaded |

**Entry into force**: August 19, 2025 (1568), October 19, 2025 (1944, 1945)

---

## ✅ Fourth Batch - October 2025 (Conformity & Trusted Lists)

| CELEX | Regulation | Title | Status |
|-------|------------|-------|--------|
| 32025R2160 | 2025/2160 | **Non-qualified trust services** risk policies | ✅ Downloaded |
| 32025R2162 | 2025/2162 | **CAB accreditation** - Conformity assessment bodies | ✅ Downloaded |
| 32025D2164 | 2025/2164 | **Trusted lists** templates (Decision) | ✅ Downloaded |

**Entry into force**: November 16, 2025

---

## Directory Structure

```
02_implementing_acts/
├── 2024_2977_PID_and_EAA/              # Person ID & Attestations
├── 2024_2978_TSP_List_Publication/     # Trust Service Provider Lists
├── 2024_2979_Integrity_Core_Functions/ # Wallet Integrity
├── 2024_2980_Notifications/            # Commission Notifications
├── 2024_2981_Certification/            # Wallet Certification
├── 2024_2982_Protocols_Interfaces/     # Technical Protocols
├── 2025_0847_Security_Breach_Response/ # Security Incidents
├── 2025_0848_Relying_Party_Registration/ # RP Registration
├── 2025_0849_Certified_Wallet_List/    # Certified Wallets
├── 2025_1568_Peer_Reviews_eID/         # eID Scheme Reviews
├── 2025_1944_Electronic_Delivery/      # ERDS Standards
├── 2025_1945_Signature_Validation/     # Signature Validation
├── 2025_2160_Non_Qualified_TS_Risks/   # Risk Management
├── 2025_2162_CAB_Accreditation/        # CAB Requirements
├── 2025_2164_Trusted_Lists/            # TL Templates
└── README.md
```

Each directory contains:
- `{CELEX}.md` - Full regulation text in Markdown
- `{CELEX}.fmx4.zip` - Original Formex XML archive
- `formex/` - Extracted Formex XML files

---

## Key Topics by Regulation

### EUDI Wallet Core
- **2024/2977**: PID lifecycle, EAA management, credential disclosure
- **2024/2979**: Core wallet functions, security requirements
- **2024/2981**: Certification framework, assurance levels
- **2024/2982**: Technical protocols, interoperability

### EUDI Wallet Operations
- **2025/0847**: Incident response, suspension/withdrawal procedures
- **2025/0848**: Relying party registration requirements
- **2025/0849**: Certified wallet publication to Commission

### Trust Services
- **2024/2978**: Trusted lists publication format
- **2025/1944**: Electronic registered delivery service standards
- **2025/1945**: Signature and seal validation procedures
- **2025/2160**: Risk management for non-qualified services
- **2025/2162**: Conformity assessment body accreditation
- **2025/2164**: Common trusted list templates

### Cross-Border Recognition
- **2025/1568**: Peer review procedures for eID schemes

---

## EUR-Lex Access

All implementing acts available via:
```
https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:{CELEX}
```

---

## Related Resources

- **Architecture Reference Framework**: `../03_arf/`
- **Technical Specifications**: `../04_technical_specs/`
- **Main Regulation (eIDAS 2.0)**: `../01_regulation/2024_1183_eIDAS2/`

---

*Last updated: 2026-01-13*
*Total: 15 implementing acts downloaded*
