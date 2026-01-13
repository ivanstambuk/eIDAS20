# AGENTS.md - eIDAS 2.0 Knowledge Base Project

## Project Context

This project is an **eIDAS 2.0 Knowledge Base** containing primary source documents for the European Digital Identity Framework. The goal is to collect, organize, and convert official EU regulatory documents for internal knowledge management purposes.

## Current Status

### Completed Tasks (2026-01-13)

1. **Initial Setup**
   - Created directory structure (`01_regulation`, `02_implementing_acts`, `03_arf`, `04_technical_specs`)
   - Created README.md with project overview
   - Created this AGENTS.md file
   - Initialized Git repository with conventional commits

2. **Regulations Downloaded**
   - ✅ Regulation (EU) 2024/1183 (eIDAS 2.0) - Converted to Markdown (`01_regulation/2024_1183_eIDAS2/`)
   
3. **Git Repositories Cloned**
   - ✅ ARF: `eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework` → `03_arf/`
   - ✅ Technical Specs: `eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications` → `04_technical_specs/`

4. **Implementing Acts Research**
   - ✅ Created implementing acts catalog (`02_implementing_acts/README.md`)
   - ✅ Identified First Batch (Dec 2024): 5 regulations (2024/2977, 2024/2979, 2024/2980, 2024/2981, 2024/2982)
   - ✅ Identified Second Batch (Jul 2025): 4+ regulations (2025/847, 2025/1568, 2025/1944, 2025/1945)

### Pending Tasks

1. **Regulations**
   - [ ] Download and convert Regulation (EU) 910/2014 (original eIDAS)

2. **Implementing Acts - First Batch (Dec 2024)**
   - [ ] Download 2024/2977 - Person identification data and attestations
   - [ ] Download 2024/2979 - Integrity and core functionalities
   - [ ] Download 2024/2980 - Notifications to the Commission
   - [ ] Download 2024/2981 - Certification of EUDI Wallets
   - [ ] Download 2024/2982 - Protocols and interfaces

3. **Implementing Acts - Second Batch (Jul 2025)**
   - [ ] Download 2025/1568 - Peer reviews
   - [ ] Download 2025/1944 - Registered delivery services
   - [ ] Research and download remaining regulations

4. **Organization**
   - [x] Create index/catalog of all implementing acts
   - [ ] Cross-reference documents

## Document Sources

| Source | URL Pattern | Format | Notes |
|--------|-------------|--------|-------|
| EUR-Lex Regulations | `https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:3{YEAR}R{NUMBER}` | HTML | Official EU law |
| EUR-Lex Decisions | `https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:3{YEAR}D{NUMBER}` | HTML | Commission decisions |
| GitHub ARF | `github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework` | Markdown | Already in MD |
| GitHub STS | `github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications` | Markdown | Already in MD |

## Conversion Guidelines

When converting EUR-Lex HTML to Markdown:
1. Preserve document structure (titles, articles, paragraphs)
2. Use proper heading hierarchy (`#`, `##`, `###`)
3. Convert numbered lists appropriately
4. Add source/citation block at the end
5. Include metadata (CELEX number, date, ELI)

## Key Terminology

| Term | Meaning |
|------|---------|
| **eIDAS** | electronic IDentification, Authentication and trust Services |
| **EUDI Wallet** | European Digital Identity Wallet |
| **CIR** | Commission Implementing Regulation |
| **ARF** | Architecture and Reference Framework |
| **STS** | Standards and Technical Specifications |
| **QES** | Qualified Electronic Signature |
| **QEAA** | Qualified Electronic Attestation of Attributes |
| **TSP** | Trust Service Provider |
| **QTSP** | Qualified Trust Service Provider |

## Git Workflow

This repository uses **conventional commits**:
- `feat:` - New document/feature added
- `docs:` - Documentation updates
- `chore:` - Maintenance tasks
- `fix:` - Corrections to existing content

Example:
```
feat: add regulation 2024/1183 eIDAS 2.0
docs: update README with implementation timeline
chore: update git repos to latest version
```

## Next Steps for Agents

When continuing this project:
1. Check EUR-Lex for newly adopted implementing acts
2. Update Git submodules/clones for ARF and STS
3. Download and convert new documents
4. Update this AGENTS.md with progress
5. Commit changes with conventional commit messages

---

*Last updated: 2026-01-13 - Initial setup completed*
