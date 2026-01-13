# eIDAS 2.0 Knowledge Base - Work Tracker

> **This is a live document.** Update after each work session. Remove completed items once they are no longer dependencies.

---

## Current Session Status

| Field | Value |
|-------|-------|
| **Last Updated** | 2026-01-13 17:32 CET |
| **Session State** | ✅ Consolidated eIDAS (910/2014) + 15 implementing acts downloaded |
| **Next Action** | Commit to git |

---

## ⚠️ CONVERSION REQUIREMENTS

**All downloaded documents must be VERBATIM conversions.**

### Preferred Method: Formex XML Pipeline (v2)
- Use `scripts/eurlex_formex.py` for highest quality conversion
- Formex XML provides structured legal content
- Converter v2 (`formex_to_md_v2.py`) handles:
  - Recitals with proper `(1)`, `(2)` numbering
  - Nested lists with `(a)`, `(i)`, `(ii)` indentation
  - Article structure with numbered paragraphs
  - Footnotes and references inline

### Fallback: HTML via pandoc
- Download HTML directly via curl
- Convert using pandoc (HTML → Markdown)
- Only add source metadata at the end of the document

**These are reference documents - accuracy is critical**

---

## 🔴 Blocked / Waiting

*Nothing currently blocked.*

---

## 🟡 In Progress

*Nothing currently in progress.*

---

## 🔵 Ready to Start (Prioritized)

### Priority 1: Re-convert First Batch with Formex v2

The first batch (2024) was converted using pandoc from HTML. For better quality and consistency, consider re-downloading using the Formex XML pipeline.

| CELEX | Regulation | Current Format |
|-------|------------|----------------|
| 32024R2977 | 2024/2977 | HTML → pandoc |
| 32024R2978 | 2024/2978 | HTML → pandoc |
| 32024R2979 | 2024/2979 | HTML → pandoc |
| 32024R2980 | 2024/2980 | HTML → pandoc |
| 32024R2981 | 2024/2981 | HTML → pandoc |
| 32024R2982 | 2024/2982 | HTML → pandoc |

**Command**: `python scripts/eurlex_formex.py 32024R2977 02_implementing_acts/2024_2977_PID_and_EAA`

---

### Priority 2: Update Git & Documentation

Commit changes with conventional commits:
- `02_implementing_acts/README.md` - Updated catalog ✅
- `TRACKER.md` - Updated status ✅

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
| 2026-01-13 | Clone ARF repository | `03_arf/` (157 files) |
| 2026-01-13 | Clone Technical Specs repository | `04_technical_specs/` (58 files) |
| 2026-01-13 | Initialize Git repository | `.git/` with commits |
| 2026-01-13 | Create implementing acts catalog | `02_implementing_acts/README.md` |
| 2026-01-13 | Create README.md | `README.md` |
| 2026-01-13 | Create AGENTS.md | `AGENTS.md` |
| 2026-01-13 | **Download eIDAS 2.0 (2024/1183)** | `01_regulation/2024_1183_eIDAS2/regulation_2024_1183.md` (2MB, verbatim) |
| 2026-01-13 | **Download Original eIDAS (910/2014)** | `01_regulation/2014_0910_eIDAS_Original/32014R0910.md` |
| 2026-01-13 | **Download First Batch (6 regulations)** | `02_implementing_acts/2024_*/` |
| 2026-01-13 | **Formex Converter v2** | `scripts/formex_to_md_v2.py` - improved recitals, nested lists, article structure |
| 2026-01-13 | **Download 2nd Batch - May 2025 (3 regs)** | Security breach, RP registration, certified wallets |
| 2026-01-13 | **Download 3rd Batch - Jul/Sep 2025 (3 regs)** | Peer reviews, electronic delivery, signature validation |
| 2026-01-13 | **Download 4th Batch - Oct 2025 (3 regs)** | Non-qualified TS risks, CAB accreditation, trusted lists |
| 2026-01-13 | **Re-convert 1st Batch with Formex v2** | All 6 Dec 2024 regulations now consistent format |

### All Batches Downloaded & Converted (Formex v2)

**First Batch (Dec 2024)** - Re-converted with Formex v2:
- 32024R2977 (PID & Attestations), 32024R2978 (TSP Lists), 32024R2979 (Integrity)
- 32024R2980 (Notifications), 32024R2981 (Certification), 32024R2982 (Protocols)

**Second Batch (May 2025)** - Formex v2:
- 32025R0847, 32025R0848, 32025R0849

**Third Batch (Jul/Sep 2025)** - Formex v2:
- 32025R1568, 32025R1944, 32025R1945

**Fourth Batch (Oct 2025)** - Formex v2:
- 32025R2160, 32025R2162, 32025D2164

**Total: 15 implementing acts - all Formex v2**

---

## Reference Information

### Project Structure
```
d:\aab\eIDAS20\
├── 01_regulation/                  # EU Regulations (parent laws)
│   ├── 2024_1183_eIDAS2/          # eIDAS 2.0 ✅
│   └── 2014_0910_eIDAS_Original/  # Original eIDAS ✅
├── 02_implementing_acts/           # Commission Implementing Regulations
│   ├── README.md                  # Catalog ✅
│   ├── 2024_2977_PID_and_EAA/     # ✅
│   ├── 2024_2978_TSP_List_Publication/ # ✅
│   ├── 2024_2979_Integrity_Core_Functions/ # ✅
│   ├── 2024_2980_Notifications/   # ✅
│   ├── 2024_2981_Certification/   # ✅
│   └── 2024_2982_Protocols_Interfaces/ # ✅
├── 03_arf/                         # Architecture Reference Framework ✅
├── 04_technical_specs/             # Standards & Tech Specs ✅
├── AGENTS.md                      # AI agent context ✅
├── README.md                      # Project overview ✅
└── TRACKER.md                     # This file ✅
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

### Conversion Workflow (EUR-Lex to Markdown)
```powershell
# 1. Download HTML
curl -s -o "file.html" "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:3YYYYRNNNN"

# 2. Convert with pandoc
pandoc -f html -t markdown --wrap=none -o "file.md" "file.html"

# 3. Append source reference
Add-Content -Path "file.md" -Value $sourceRef -Encoding UTF8
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

**2026-01-13 17:00**: First batch complete. Downloaded all 6 implementing acts from Dec 2024 batch plus original eIDAS (910/2014). All converted via pandoc with source metadata appended. eIDAS 2.0 re-downloaded as complete verbatim copy (2MB). Next: commit to git, then research/download second batch (2025).

---

*End of Tracker*
