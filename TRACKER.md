# eIDAS 2.0 Knowledge Base - Work Tracker

> **This is a live document.** Update after each work session. Remove completed items once they are no longer dependencies.

---

## Current Session Status

| Field | Value |
|-------|-------|
| **Last Updated** | 2026-01-13 16:49 CET |
| **Session State** | Paused - awaiting user direction |
| **Next Action** | Download First Batch implementing acts (2024/2977-2982) |

---

## 🔴 Blocked / Waiting

*Nothing currently blocked.*

---

## 🟡 In Progress

*Nothing currently in progress.*

---

## 🔵 Ready to Start (Prioritized)

### Priority 1: Download First Batch Implementing Acts (Dec 2024)

These 5 regulations form the core EUDI Wallet technical framework. All were published December 4, 2024.

| # | CELEX | Regulation | Topic | EUR-Lex URL | Est. Time |
|---|-------|------------|-------|-------------|-----------|
| 1 | 32024R2977 | 2024/2977 | Person ID data & attestations | [Link](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R2977) | 15 min |
| 2 | 32024R2979 | 2024/2979 | Integrity & core functionalities | [Link](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R2979) | 15 min |
| 3 | 32024R2980 | 2024/2980 | Notifications to Commission | [Link](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R2980) | 10 min |
| 4 | 32024R2981 | 2024/2981 | Certification of EUDI Wallets | [Link](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R2981) | 20 min |
| 5 | 32024R2982 | 2024/2982 | Protocols & interfaces | [Link](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R2982) | 10 min |

**Output Location**: `02_implementing_acts/2024_first_batch/`

**Approach**:
1. Read all chunks from EUR-Lex HTML
2. Convert to clean Markdown with proper structure
3. Include preamble, articles, and annexes
4. Add source metadata at bottom

---

### Priority 2: Download Original eIDAS Regulation (910/2014)

The original regulation that eIDAS 2.0 amends. Needed as reference.

| Field | Value |
|-------|-------|
| **CELEX** | 32014R0910 |
| **Title** | Regulation (EU) No 910/2014 on electronic identification and trust services |
| **EUR-Lex URL** | [Link](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32014R0910) |
| **Output Location** | `01_regulation/2014_0910_eIDAS/regulation_910_2014.md` |
| **Est. Time** | 20 min |

---

### Priority 3: Download Second Batch Implementing Acts (Jul 2025)

Trust services and additional specifications. Research needed to confirm complete list.

| # | CELEX | Regulation | Topic | Status |
|---|-------|------------|-------|--------|
| 1 | 32025R1568 | 2025/1568 | Peer reviews of eID schemes | Ready to download |
| 2 | 32025R1944 | 2025/1944 | Registered delivery services | Ready to download |
| 3 | 32025R0847 | 2025/847 | TBD - needs research | Needs research |
| 4 | 32025R1945 | 2025/1945 | TBD - needs research | Needs research |
| ? | TBD | Additional | Trust services batch (7 regulations reported) | Needs research |

**Research Task**: Query EUR-Lex for all 2025 implementing regulations referencing Regulation 910/2014.

**Output Location**: `02_implementing_acts/2025_second_batch/`

---

### Priority 4: Update Git & Documentation

After downloading documents, commit with conventional commits:

```bash
git add .
git commit -m "feat: add first batch implementing acts (2024/2977-2982)"
```

Update:
- `02_implementing_acts/README.md` - Mark downloaded items as ✅
- `AGENTS.md` - Update completed tasks
- `TRACKER.md` - Remove completed items, update status

---

## 📋 Backlog (Lower Priority)

| Task | Description | Dependencies |
|------|-------------|--------------|
| Cross-reference documents | Link related articles across regulations | All regulations downloaded |
| Create summary documents | Executive summaries for each regulation | All regulations downloaded |
| Extract key definitions | Consolidate all definitions in one file | All regulations downloaded |
| Timeline visualization | Create Mermaid diagram of deadlines | First batch downloaded |
| Update upstream repos | Pull latest from ARF and Tech Specs | None - can do anytime |

---

## ✅ Completed (Remove when no longer needed)

| Date | Task | Output |
|------|------|--------|
| 2026-01-13 | Create directory structure | `01_regulation/`, `02_implementing_acts/`, `03_arf/`, `04_technical_specs/` |
| 2026-01-13 | Download eIDAS 2.0 (2024/1183) | `01_regulation/2024_1183_eIDAS2/regulation_2024_1183.md` |
| 2026-01-13 | Clone ARF repository | `03_arf/` (157 files) |
| 2026-01-13 | Clone Technical Specs repository | `04_technical_specs/` (58 files) |
| 2026-01-13 | Initialize Git repository | `.git/` with 3 commits |
| 2026-01-13 | Create implementing acts catalog | `02_implementing_acts/README.md` |
| 2026-01-13 | Create README.md | `README.md` |
| 2026-01-13 | Create AGENTS.md | `AGENTS.md` |

---

## Reference Information

### Project Structure
```
d:\aab\eIDAS20\
├── 01_regulation/           # EU Regulations (parent laws)
│   └── 2024_1183_eIDAS2/   # eIDAS 2.0 ✅
├── 02_implementing_acts/    # Commission Implementing Regulations
│   └── README.md           # Catalog ✅
├── 03_arf/                  # Architecture Reference Framework ✅
├── 04_technical_specs/      # Standards & Tech Specs ✅
├── AGENTS.md               # AI agent context ✅
├── README.md               # Project overview ✅
└── TRACKER.md              # This file ✅
```

### Git Workflow
```bash
# Refresh PATH for Git
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Git commands
cd "d:\aab\eIDAS20"
& 'C:\Program Files\Git\bin\git.exe' status
& 'C:\Program Files\Git\bin\git.exe' add .
& 'C:\Program Files\Git\bin\git.exe' commit -m "type: description"
```

### Conversion Guidelines (EUR-Lex to Markdown)
1. Preserve document structure (title, preamble, articles, annexes)
2. Use `#` for regulation title, `##` for chapters/sections, `###` for articles
3. Convert numbered lists appropriately
4. Add metadata block at end:
   ```
   ---
   **Source**: EUR-Lex
   **CELEX**: 3YYYYRNNNN
   **ELI**: http://data.europa.eu/eli/reg/YYYY/NNNN/oj
   ---
   ```

### Key Terminology
| Abbrev | Meaning |
|--------|---------|
| CIR | Commission Implementing Regulation |
| EUDI | European Digital Identity |
| ARF | Architecture and Reference Framework |
| QEAA | Qualified Electronic Attestation of Attributes |
| QTSP | Qualified Trust Service Provider |

---

## Session Handoff Notes

*Use this section to leave notes for the next session.*

**2026-01-13 16:49**: Initial tracker created. All foundational work complete. Ready to begin downloading implementing acts. User will provide go-ahead for next priority.

---

*End of Tracker*
