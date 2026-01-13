# eIDAS 2.0 Knowledge Base

This repository contains the primary sources for the **European Digital Identity Framework** (eIDAS 2.0), compiled for internal knowledge base purposes.

## Overview

The **eIDAS 2.0 Regulation** (EU 2024/1183) establishes a comprehensive framework for:
- **European Digital Identity Wallets (EUDI Wallets)** - Secure, user-controlled digital identity for all EU citizens
- **Electronic Identification (eID)** - Cross-border recognition of electronic identification means
- **Trust Services** - Electronic signatures, seals, timestamps, registered delivery, and more
- **Electronic Attestation of Attributes** - Verified credentials for education, professional qualifications, etc.
- **Electronic Archiving & Ledgers** - Long-term preservation and blockchain/DLT applications

## Directory Structure

```
eIDAS20/
├── README.md                           # This file
├── AGENTS.md                           # Context for AI agents working on this project
├── 01_regulation/                      # Core EU regulations
│   └── 2024_1183_eIDAS2/              # eIDAS 2.0 (amending 910/2014)
│       └── regulation_2024_1183.md
├── 02_implementing_acts/               # Commission Implementing Regulations (CIRs)
│   └── (to be added)
├── 03_arf/                             # Architecture and Reference Framework
│   └── (Git clone of EUDI ARF repository)
└── 04_technical_specs/                 # Standards and Technical Specifications
    └── (Git clone of EUDI STS repository)
```

## Primary Sources

### 1. Regulations

| Document | CELEX | Status | Description |
|----------|-------|--------|-------------|
| Regulation (EU) 2024/1183 | 32024R1183 | ✅ Downloaded | eIDAS 2.0 - European Digital Identity Framework |
| Regulation (EU) 910/2014 | 32014R0910 | 📋 Pending | Original eIDAS Regulation (amended) |

### 2. Implementing Acts (CIRs)

The Commission has adopted 22+ implementing acts covering:
- EUDI Wallet specifications and certification
- Trust services requirements
- Trusted lists formats  
- Conformity assessment body accreditation
- Electronic attestation of attributes
- Qualified signatures/seals formats
- And more...

> **Status**: To be researched and downloaded

### 3. Architecture and Reference Framework (ARF)

- **Repository**: [eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework)
- **Status**: ✅ Cloned to `03_arf/`
- **Description**: Defines the common architecture of the EU Digital Identity Wallet ecosystem, including standards, protocols, and formats for information exchanges.

### 4. Standards and Technical Specifications (STS)

- **Repository**: [eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications)
- **Status**: ✅ Cloned to `04_technical_specs/`
- **Description**: Tracks, evaluates, and aligns necessary standards with the relevant implementing acts.

## Key Dates & Deadlines

| Date | Milestone |
|------|-----------|
| 30 Apr 2024 | Regulation 2024/1183 published in Official Journal |
| 20 May 2024 | Regulation entered into force |
| 21 Nov 2024 | First batch of implementing acts deadline |
| 21 May 2025 | Second batch of implementing acts deadline |
| Nov 2026 | Member States must provide EUDI Wallets |

## Related Regulations

- **GDPR** (Regulation 2016/679) - Data protection requirements
- **NIS2 Directive** (Directive 2022/2555) - Cybersecurity requirements
- **Digital Markets Act** (Regulation 2022/1925) - Platform interoperability
- **Digital Services Act** (Regulation 2022/2065) - Online platform obligations
- **Cybersecurity Act** (Regulation 2019/881) - Certification schemes

## Usage

This knowledge base is intended for:
1. Understanding the regulatory landscape of EU digital identity
2. Creating secondary documentation (summaries, guides, implementation notes)
3. Reference during implementation projects
4. Training and education purposes

## Contributing

This is an internal knowledge base. To update:
1. Pull latest changes from upstream Git repositories
2. Download new implementing acts from EUR-Lex
3. Convert HTML to Markdown for consistency
4. Update this README with new entries

---

*Last updated: 2026-01-13*
