# PSD2 SCA Compliance Assessment — Restructure Execution Plan

**Created**: 2026-01-27
**Status**: In Progress
**Version**: 2.0

---

## 1. Objective

Consolidate `PSD2_SCA_COMPLIANCE_ASSESSMENT.md` from **regulation-first** to **topic-first** structure.

---

## 2. Approved Design Decisions

| Decision | Choice |
|----------|--------|
| **Numbering** | Numeric only (1, 2, 3...) |
| **Gap analysis** | Both inline + consolidated |
| **Appendices** | Keep as appendices |
| **Dual references** | Blockquote format |
| **Dynamic linking** | Keep sub-article structure |

---

## 3. Source Document Analysis

**File**: `PSD2_SCA_COMPLIANCE_ASSESSMENT.md`
**Total Lines**: 2714
**Total Bytes**: 177,126

### 3.1 Current Section Line Ranges

| Section | Start Line | End Line | Lines | New Location |
|---------|------------|----------|-------|--------------|
| **Header + How to Use** | 1 | 61 | 61 | Keep, update version |
| **Scope: Two SCA Use Cases** | 63 | 98 | 36 | §3 Scope |
| **Executive Summary** | 101 | 130 | 30 | §1 Executive Summary |
| **Terminology** | 132 | 200 | 69 | §2 Terminology |
| **Part I: PSD2 Directive** | 203 | 441 | 239 | Distribute |
| └─ Art. 97(1) SCA Triggers | 209 | 407 | 199 | §5.1 |
| └─ Art. 97(2) Dynamic Linking | 410 | 432 | 23 | §7 intro |
| └─ Art. 97(3) Delegated Act | 435 | 441 | 7 | DELETE |
| **Part II: RTS Chapter II** | 443 | 2016 | 1574 | Part B |
| └─ Art. 1 Subject matter | 449 | 454 | 6 | MERGE with §5.1 |
| └─ Art. 2 General auth req | 457 | 491 | 35 | §8.1 |
| └─ Art. 3 Review of security | 494 | 530 | 37 | §8.2 |
| └─ Art. 4 Authentication code | 533 | 876 | 344 | §6.1 |
| └─ Art. 5 Dynamic linking | 879 | 1786 | 908 | §7 |
| └─ Art. 6 Knowledge | 1789 | 1821 | 33 | §6.2 |
| └─ Art. 7 Possession | 1824 | 1867 | 44 | §6.3 |
| └─ Art. 8 Inherence | 1870 | 1908 | 39 | §6.4 |
| └─ Art. 9 Independence | 1911 | 2016 | 106 | §6.5 |
| **Part III: Issuance/Binding** | 2018 | 2409 | 392 | Part A (§4) |
| └─ Art. 22 General req | 2026 | 2226 | 201 | §4.1 |
| └─ Art. 23 Creation/transmission | 2229 | 2251 | 23 | §4.2 |
| └─ Art. 24 Association | 2254 | 2305 | 52 | §4.3 |
| └─ Art. 25 Delivery | 2308 | 2323 | 16 | §4.4 |
| └─ Art. 26 Renewal | 2326 | 2346 | 21 | §4.5 |
| └─ Art. 27 Revocation | 2349 | 2407 | 59 | §4.6 |
| **Part IV: Appendices** | 2411 | 2675 | 265 | Part D |
| └─ Appendix A: mDOC | 2415 | 2435 | 21 | Keep |
| └─ Appendix B: TPP | 2438 | 2481 | 44 | Keep |
| └─ Appendix C: Accessibility | 2484 | 2497 | 14 | Keep |
| └─ Appendix D: GitHub | 2500 | 2609 | 110 | Keep |
| └─ Appendix E: Rulebook | 2612 | 2675 | 64 | Keep |
| **Document History** | 2677 | 2714 | 38 | Keep, update |

---

## 4. Target Structure

```
1. Executive Summary                    [from: 101-130]
2. Terminology & Definitions            [from: 132-200]
3. Scope: Two SCA Lifecycle Phases      [from: 63-98, enhanced]

═══════════════════════════════════════════════════════════════════
PART A: SCA CREDENTIAL ISSUANCE (Binding Phase)
═══════════════════════════════════════════════════════════════════

4. PSC Creation & Protection
   4.1 General Requirements             [from: 2026-2226, Art. 22]
   4.2 Creation & Transmission          [from: 2229-2251, Art. 23]
   4.3 Association with User            [from: 2254-2305, Art. 24]
   4.4 Secure Delivery                  [from: 2308-2323, Art. 25]
   4.5 Renewal                          [from: 2326-2346, Art. 26]
   4.6 Revocation                       [from: 2349-2407, Art. 27]

═══════════════════════════════════════════════════════════════════
PART B: TRANSACTION AUTHENTICATION (Usage Phase)
═══════════════════════════════════════════════════════════════════

5. SCA Triggers & Exemptions
   5.1 When SCA is Required             [from: 209-407, Art. 97(1) + Art. 1]
   5.2 SCA Exemptions Overview          [EXTRACT from 5.1 deep-dive]
   5.3 Responsibility Matrix            [EXTRACT from 5.1 deep-dive]

6. SCA Elements & Independence
   6.1 Authentication Code              [from: 533-876, Art. 4]
   6.2 Knowledge Element                [from: 1789-1821, Art. 6]
   6.3 Possession Element               [from: 1824-1867, Art. 7]
   6.4 Inherence Element                [from: 1870-1908, Art. 8]
   6.5 Independence of Elements         [from: 1911-2016, Art. 9]

7. Dynamic Linking
   7.0 Overview                         [from: 410-432, Art. 97(2) - intro]
   7.1 Payer Awareness                  [from: Art. 5(1)(a) in 879-1786]
   7.2 Cryptographic Binding            [from: Art. 5(1)(b) in 879-1786]
   7.3 PSP Verification                 [from: Art. 5(1)(c) in 879-1786]
   7.4 Change Notification              [from: Art. 5(1)(d) in 879-1786]
   7.5 Display Integrity                [from: Art. 5(2) in 879-1786]
   7.6 Batch Payments                   [from: Art. 5(3) in 879-1786]

8. General Security Requirements
   8.1 Security Measures                [from: 457-491, Art. 2]
   8.2 Periodic Review                  [from: 494-530, Art. 3]

═══════════════════════════════════════════════════════════════════
PART C: GAP ANALYSIS & RECOMMENDATIONS
═══════════════════════════════════════════════════════════════════

9. Consolidated Gap Analysis
   9.1 Critical Gaps                    [EXTRACT from inline ⚠️ notes]
   9.2 Moderate Gaps
   9.3 Low-Risk Gaps

10. Recommendations for Rulebook

═══════════════════════════════════════════════════════════════════
PART D: APPENDICES
═══════════════════════════════════════════════════════════════════

Appendix A: mDOC Format                 [from: 2415-2435]
Appendix B: TPP Scenarios               [from: 2438-2481]
Appendix C: Accessibility               [from: 2484-2497]
Appendix D: GitHub Discussion           [from: 2500-2609]
Appendix E: Rulebook Status             [from: 2612-2675]

═══════════════════════════════════════════════════════════════════

Document History                        [from: 2677-2714, update to v5.0]
```

---

## 5. Execution Phases & Tracker

### Phase 1: Backup & Prepare
| Step | Task | Status |
|------|------|--------|
| 1.1 | Git commit current state | ⬜ TODO |
| 1.2 | Create backup copy | ⬜ TODO |
| 1.3 | Note current line count (2714) | ⬜ TODO |

### Phase 2: Restructure Front Matter (§1-3)
| Step | Task | Lines | Status |
|------|------|-------|--------|
| 2.1 | Reorder: Executive Summary → §1 | 101-130 | ⬜ TODO |
| 2.2 | Reorder: Terminology → §2 | 132-200 | ⬜ TODO |
| 2.3 | Rename: Scope → §3 Lifecycle Phases | 63-98 | ⬜ TODO |
| 2.4 | Git commit "Phase 2: Front matter" | — | ⬜ TODO |

### Phase 3: Create Part A (Issuance)
| Step | Task | Source Lines | Status |
|------|------|--------------|--------|
| 3.1 | Add Part A header | NEW | ⬜ TODO |
| 3.2 | Move Art. 22 → §4.1 | 2026-2226 | ⬜ TODO |
| 3.3 | Move Art. 23 → §4.2 | 2229-2251 | ⬜ TODO |
| 3.4 | Move Art. 24 → §4.3 | 2254-2305 | ⬜ TODO |
| 3.5 | Move Art. 25 → §4.4 | 2308-2323 | ⬜ TODO |
| 3.6 | Move Art. 26 → §4.5 | 2326-2346 | ⬜ TODO |
| 3.7 | Move Art. 27 → §4.6 | 2349-2407 | ⬜ TODO |
| 3.8 | Add regulatory basis headers | — | ⬜ TODO |
| 3.9 | Delete old Part III header | 2018-2025 | ⬜ TODO |
| 3.10 | Git commit "Phase 3: Part A" | — | ⬜ TODO |

### Phase 4: Create Part B - SCA Triggers (§5)
| Step | Task | Source Lines | Status |
|------|------|--------------|--------|
| 4.1 | Add Part B header | NEW | ⬜ TODO |
| 4.2 | Add §5 header | NEW | ⬜ TODO |
| 4.3 | Move Art. 97(1) → §5.1 | 209-407 | ⬜ TODO |
| 4.4 | Merge Art. 1 into §5.1 | 449-454 | ⬜ TODO |
| 4.5 | Add dual reference (PSD2 + RTS) | — | ⬜ TODO |
| 4.6 | Extract exemptions → §5.2 | FROM 5.1 | ⬜ TODO |
| 4.7 | Extract responsibility matrix → §5.3 | FROM 5.1 | ⬜ TODO |
| 4.8 | Git commit "Phase 4: SCA Triggers" | — | ⬜ TODO |

### Phase 5: Create Part B - SCA Elements (§6)
| Step | Task | Source Lines | Status |
|------|------|--------------|--------|
| 5.1 | Add §6 header | NEW | ⬜ TODO |
| 5.2 | Move Art. 4 → §6.1 | 533-876 | ⬜ TODO |
| 5.3 | Move Art. 6 → §6.2 | 1789-1821 | ⬜ TODO |
| 5.4 | Move Art. 7 → §6.3 | 1824-1867 | ⬜ TODO |
| 5.5 | Move Art. 8 → §6.4 | 1870-1908 | ⬜ TODO |
| 5.6 | Move Art. 9 → §6.5 | 1911-2016 | ⬜ TODO |
| 5.7 | Add regulatory basis headers | — | ⬜ TODO |
| 5.8 | Git commit "Phase 5: SCA Elements" | — | ⬜ TODO |

### Phase 6: Create Part B - Dynamic Linking (§7)
| Step | Task | Source Lines | Status |
|------|------|--------------|--------|
| 6.1 | Add §7 header with Art. 97(2) | 410-432 | ⬜ TODO |
| 6.2 | Move Art. 5 content → §7.1-7.6 | 879-1786 | ⬜ TODO |
| 6.3 | Add dual references (PSD2 + RTS) | — | ⬜ TODO |
| 6.4 | Git commit "Phase 6: Dynamic Linking" | — | ⬜ TODO |

### Phase 7: Create Part B - General Security (§8)
| Step | Task | Source Lines | Status |
|------|------|--------------|--------|
| 7.1 | Add §8 header | NEW | ⬜ TODO |
| 7.2 | Move Art. 2 → §8.1 | 457-491 | ⬜ TODO |
| 7.3 | Move Art. 3 → §8.2 | 494-530 | ⬜ TODO |
| 7.4 | Git commit "Phase 7: General Security" | — | ⬜ TODO |

### Phase 8: Create Part C (Gap Analysis)
| Step | Task | Status |
|------|------|--------|
| 8.1 | Add Part C header | ⬜ TODO |
| 8.2 | Search all "⚠️ Gap" notes | ⬜ TODO |
| 8.3 | Create §9.1 Critical Gaps | ⬜ TODO |
| 8.4 | Create §9.2 Moderate Gaps | ⬜ TODO |
| 8.5 | Create §9.3 Low-Risk Gaps | ⬜ TODO |
| 8.6 | Create §10 Recommendations | ⬜ TODO |
| 8.7 | Git commit "Phase 8: Gap Analysis" | — | ⬜ TODO |

### Phase 9: Cleanup & Finalize
| Step | Task | Status |
|------|------|--------|
| 9.1 | Delete old Part I header (203-207) | ⬜ TODO |
| 9.2 | Delete Art. 97(3) (435-441) | ⬜ TODO |
| 9.3 | Delete old Part II header (443-447) | ⬜ TODO |
| 9.4 | Rename Part IV → Part D | ⬜ TODO |
| 9.5 | Update Document History → v5.0 | ⬜ TODO |
| 9.6 | Update version in header (line 3) | ⬜ TODO |
| 9.7 | Verify line count ≥ 2714 | ⬜ TODO |
| 9.8 | Git commit "Phase 9: Complete v5.0" | ⬜ TODO |

### Phase 10: Verification
| Step | Task | Status |
|------|------|--------|
| 10.1 | Test all EUR-Lex links | ⬜ TODO |
| 10.2 | Test all GitHub links | ⬜ TODO |
| 10.3 | Verify all content migrated | ⬜ TODO |
| 10.4 | Final review | ⬜ TODO |

---

## 6. Known Gaps to Extract for Part C

From inline analysis, these gaps exist:

| Gap ID | Article | Description | Severity |
|--------|---------|-------------|----------|
| GAP-01 | Art. 4(3)(b) | PIN lockout NOT implemented | 🔴 Critical |
| GAP-02 | Art. 5(2) | Overlay attack protection limited | 🟡 Moderate |
| GAP-03 | Art. 5(1)(b) | mDOC format lacks transaction_data_hashes | 🟡 Moderate |
| GAP-04 | Art. 5(1)(c) | TPP verification not specified | 🟡 Moderate |
| GAP-05 | Art. 5(1)(a) | Display duration not mandated | 🟢 Low |
| GAP-06 | Art. 97(1) | urn:eudi:sca:consents:1 missing | 🟡 Moderate |

---

## 7. Rollback Commands

```bash
# Rollback to last phase checkpoint
git checkout HEAD~1 -- PSD2_SCA_COMPLIANCE_ASSESSMENT.md

# Rollback to before restructure
git checkout 74ef25a -- PSD2_SCA_COMPLIANCE_ASSESSMENT.md

# View all checkpoints
git log --oneline -20
```

---

## 8. Execution Log

| Timestamp | Phase | Action | Result |
|-----------|-------|--------|--------|
| 2026-01-27 22:15 | Prep | Created RESTRUCTURE_PLAN.md v1 | ✅ |
| 2026-01-27 22:18 | Prep | Updated to detailed execution plan v2 | ✅ |
| | | | |

---

## Next Step

**Execute Phase 1: Backup & Prepare**
