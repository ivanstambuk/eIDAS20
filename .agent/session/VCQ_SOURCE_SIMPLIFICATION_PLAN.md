# VCQ Source Selection Simplification Plan

> **Decision**: DEC-255 (pending)
> **Created**: 2026-01-26
> **Goal**: Simplify 4-tile × 6 checkbox UI into 3-tile interactive filter model

---

## Rationale

The current VCQ source selection UI has these issues:

| Issue | Problem |
|-------|---------|
| **Primary + Implementing Acts separation** | Legally, implementing acts ARE the regulation. No valid reason to select eIDAS without them. |
| **9 individual checkboxes** | Overwhelming UX, false optionality |
| **Misleading mental model** | Implies users can "opt out" of legal requirements |

### The New Mental Model

These are **filters for viewing requirements by source**, not opt-in/opt-out of legal compliance.

| Tile | Contents | Interactive? |
|------|----------|-------------|
| **📜 Primary** | eIDAS 2.0 + ALL implementing acts (bundled) | YES — single checkbox |
| **🔗 Related** | GDPR, DORA | YES — individual checkboxes |
| **🏗️ Architecture** | ARF | YES — single checkbox |

---

## Current State

```
┌─────────────────┐ ┌────────────────────┐ ┌────────────────────┐ ┌───────────────┐
│ Primary         │ │ Implementing Acts  │ │ Related Regulations│ │ Architecture  │
│ ☐ eIDAS 2.0     │ │ ☐ Integrity Reg    │ │ ☐ GDPR             │ │ ☐ ARF         │
│ ☐ eIDAS Amend   │ │ ☐ Protocols Reg    │ │ ☐ DORA             │ │               │
│                 │ │ ☐ Suspension Reg   │ │                    │ │               │
│                 │ │ ☐ Registration Reg │ │                    │ │               │
└─────────────────┘ └────────────────────┘ └────────────────────┘ └───────────────┘
```

**Problem**: 4 tiles, 9 checkboxes, false granularity

---

## Target State

```
┌─────────────────────────────────┐ ┌─────────────────────────────────┐ ┌─────────────────────────────────┐
│ 📜 Primary (eIDAS Framework)   │ │ 🔗 Related Regulations          │ │ 🏗️ Architecture                │
│                                 │ │                                 │ │                                 │
│ ☑ Include                       │ │ ☐ GDPR                          │ │ ☐ ARF                           │
│                                 │ │ ☐ DORA (+12 ICT requirements)   │ │                                 │
│ Includes: eIDAS Regulation,    │ │                                 │ │                                 │
│ Amendment, and all             │ │                                 │ │                                 │
│ Implementing Acts              │ │                                 │ │                                 │
└─────────────────────────────────┘ └─────────────────────────────────┘ └─────────────────────────────────┘
```

**Solution**: 3 tiles, 4 checkboxes, accurate mental model

---

## Implementation Phases

### Phase 1: Config Changes ✅
- [ ] Restructure `vcq-config.yaml` legalSources
  - Rename `primary` + `implementing` → merge into `eidas` (single bundle)
  - Keep `related` (GDPR, DORA)
  - Keep `architecture` (ARF)
- [ ] 🔒 COMMIT: "refactor(vcq): bundle primary + implementing acts in config"

### Phase 2: Build Script Update ✅
- [ ] Update `build-vcq.js` to output the new source grouping
- [ ] Tag requirements with `sourceGroup: 'eidas' | 'gdpr' | 'dora' | 'arf'`
- [ ] Preserve backward compatibility (requirements still have legalBasis details)
- [ ] 🔒 COMMIT: "feat(vcq): update build script for 3-tile source model"

### Phase 3: UI Component Refactor ✅
- [ ] Refactor `SourceSelector` component
  - 3 tiles instead of 4
  - Primary tile: single checkbox, expanded info about what's included
  - Related tile: 2 checkboxes (GDPR, DORA)  
  - Architecture tile: 1 checkbox (ARF)
- [ ] Update CSS for new tile layout
- [ ] 🔒 COMMIT: "feat(vcq): implement 3-tile source selection UI"

### Phase 4: Filter Logic Update ✅
- [ ] Update filtering logic to work with `sourceGroup`
- [ ] Primary checkbox → include/exclude all eIDAS + implementing requirements
- [ ] Empty state: allow 0 selections (returns 0 requirements — valid filter result)
- [ ] 🔒 COMMIT: "feat(vcq): update filter logic for new source model"

### Phase 5: Polish & Test ✅
- [ ] Browser test: verify all filter combinations work
- [ ] Verify requirement counts match across views
- [ ] Update hint text to reflect new mental model
- [ ] 🔒 COMMIT: "chore(vcq): polish source selection UX"

---

## Technical Details

### Config Structure Change

**Before** (`vcq-config.yaml`):
```yaml
legalSources:
  primary:
    - id: "2014/910"
    - id: "2024/1183"
  implementing:
    - id: "2024/2979"
    - id: "2024/2982"
    - id: "2025/847"
    - id: "2025/848"
  related:
    - id: "2016/679"
    - id: "2022/2554"
  architecture:
    - id: "ARF_1.5"
```

**After**:
```yaml
legalSources:
  eidas:
    label: "eIDAS Framework"
    description: "Core regulation and all implementing acts"
    items:
      - id: "2014/910"
        name: "eIDAS Regulation (Consolidated)"
      - id: "2024/1183"
        name: "Amending Regulation"
      - id: "2024/2979"
        name: "Integrity Regulation"
      - id: "2024/2982"
        name: "Protocols Regulation"
      - id: "2025/847"
        name: "Suspension Regulation"
      - id: "2025/848"
        name: "Registration Regulation"
  related:
    label: "Related Regulations"
    items:
      - id: "2016/679"
        name: "GDPR"
      - id: "2022/2554"
        name: "DORA"
  architecture:
    label: "Architecture"
    items:
      - id: "ARF_1.5"
        name: "ARF"
```

### UI State Change

**Before**: `selectedSources = ['2014/910', '2024/1183', '2024/2979', ...]`

**After**: `selectedSources = { eidas: true, gdpr: false, dora: false, arf: false }`

---

## Files to Modify

| File | Changes |
|------|---------|
| `config/vcq/vcq-config.yaml` | Restructure legalSources |
| `scripts/build-vcq.js` | Add sourceGroup tagging |
| `src/pages/VendorQuestionnaire.jsx` | Refactor SourceSelector, update filter logic |
| `src/pages/VendorQuestionnaire.css` | Adjust tile layout |

---

## Validation Checklist

- [ ] Selecting only Primary → shows eIDAS + implementing requirements
- [ ] Selecting only DORA → shows only DORA ICT requirements
- [ ] Selecting Primary + DORA → shows combined
- [ ] Selecting nothing → shows 0 requirements (valid filter state)
- [ ] Requirement counts match in Overview and Details views
- [ ] PDF/Markdown export includes correct source attribution
