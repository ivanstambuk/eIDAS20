# ARF CSV Analysis for VCQ Tool

**Date:** 2026-01-23
**Analyst:** Antigravity Agent

## 1. ARF CSV Structure

The official ARF high-level requirements CSV is located at:
`https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/hltr/high-level-requirements.csv`

### CSV Schema (10 columns):
| Column | Description |
|--------|-------------|
| `Harmonized_ID` | Unique ID (e.g., `AS-RP-51-001`) |
| `Part` | Category group (`Ecosystem-Wide Rules`, `Actor-Specific Requirements`) |
| `Category` | Sub-category (e.g., `Relying Parties`, `Wallet Providers`) |
| `Topic` | Full topic title |
| `Topic_Number` | Numeric topic (1-55) |
| `Topic_Title` | Human-readable title |
| `Subsection` | Optional subsection |
| `Index` | HLR ID (e.g., `RPI_07`, `OIA_12`) — **THIS IS WHAT WE REFERENCE** |
| `Requirement_specification` | The actual requirement text |
| `Notes` | Implementation notes |

### Statistics:
- **Total requirements:** 617 (plus header)
- **Topics covered:** 1-55

---

## 2. What We Have vs. What ARF Has

### Our VCQ HLR References (14 unique):
```
OIA_12, OIA_13, OIA_14         # Topic 1: Accessing Online Services
RPA_05, RPA_07, RPA_08         # Topic 6: Relying Party Authentication
RPI_02, RPI_07, RPI_11, RPI_13, RPI_14, RPI_15  # Topic 52: RP Intermediaries
Reg_23                         # Topic 27: Registration
VCR_13                         # Topic 14: Validity/Revocation
```

### Topic 52 (RP Intermediaries) - Official ARF Requirements:
| HLR ID | In VCQ? | Requirement Summary |
|--------|---------|---------------------|
| RPI_01 | ❌ | Intermediary SHALL register as RP |
| RPI_02 | ⚠️ Empty | (Empty in ARF) |
| RPI_03 | ❌ | Register each intermediated RP |
| RPI_04 | ❌ | Provide legal evidence of relationship |
| RPI_05 | ❌ | Specify RP details when requesting |
| RPI_06 | ❌ | Include access cert + registration cert |
| RPI_06a | ❌ | (Empty) |
| RPI_07 | ✅ | Display both intermediary and RP identity |
| RPI_07a | ❌ | Wallet verify contractual relationship |
| RPI_07b | ❌ | (Empty) |
| RPI_08 | ❌ | Forward attributes only to specified RP |
| RPI_09 | ❌ | Verify authenticity, revocation, binding |
| RPI_10 | ❌ | Delete PIDs/attestations after forwarding |

**Gap Analysis:** We reference 6 RPI requirements but ARF defines 13 (10 non-empty).

---

## 3. Data We're Missing

### A. We have HLRs that DON'T EXIST in ARF CSV:
- `RPI_11` - NOT FOUND (likely from older ARF version)
- `RPI_13` - NOT FOUND
- `RPI_14` - NOT FOUND
- `RPI_15` - NOT FOUND

**Issue:** Our VCQ references outdated/non-existent HLR IDs!

### B. Key RPI requirements we DON'T have:
1. **RPI_01** - Registration as intermediary
2. **RPI_03** - Register intermediated RPs
3. **RPI_04** - Legal evidence requirements
4. **RPI_05** - RP details specification
5. **RPI_08** - Forward only to specified RP
6. **RPI_09** - Verification obligations
7. **RPI_10** - Deletion requirements (critical!)

---

## 4. How This Could Help Us

### Immediate Improvements:

#### A. Fix Invalid HLR References
Our VCQ YAML files reference HLRs that don't exist in current ARF:
- `RPI_11`, `RPI_13`, `RPI_14`, `RPI_15` → need audit/removal

#### B. Generate Deep Links to Specific HLRs
The markdown files support anchor links. On `annex-2.02-high-level-requirements-by-topic.md`:
- Topic 52 has anchor: `#a2330-topic-52-relying-party-intermediaries`
- Individual HLRs have anchors by their ID

**Enhanced URL pattern:**
```
https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#rpi_07
```

#### C. Import Missing ARF Requirements
We could parse the CSV and auto-generate VCQ requirements for:
- All RPI_* requirements we're missing
- Link them with proper explanations

### Long-Term Value:

#### D. ARF Sync Script
Create a script that:
1. Downloads the CSV
2. Compares with our VCQ requirements
3. Flags stale/invalid HLR references
4. Suggests new requirements based on topic filters

#### E. Full HLR Database
Import all 617 requirements as searchable data:
- Topic filter in VCQ
- Cross-reference with legal basis
- Show official requirement text in popovers

---

## 5. Recommended Actions

### Priority 1: Fix Invalid References (Now)
- [ ] Audit all arfReference fields in VCQ YAML
- [ ] Replace/remove RPI_11, RPI_13, RPI_14, RPI_15
- [ ] Update to current ARF HLR IDs

### Priority 2: Improve Links (Quick Win)
- [ ] Add anchor fragments to ARF URLs (e.g., `#rpi_07`)
- [ ] Link to correct topic section

### Priority 3: Complete Coverage (Enhancement)
- [ ] Add missing RPI requirements (RPI_01, RPI_03, RPI_08, RPI_09, RPI_10)
- [ ] Consider OIA requirements for wallet interaction

### Priority 4: Long-term (Future)
- [ ] Build CSV import/validation script
- [ ] Create ARF search/browse feature in portal

---

## 6. CSV Raw Link for Scripts

```
https://raw.githubusercontent.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/refs/heads/main/hltr/high-level-requirements.csv
```

**Delimiter:** Semicolon (`;`)
**Encoding:** UTF-8 with BOM

