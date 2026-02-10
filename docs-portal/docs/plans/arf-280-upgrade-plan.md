# ARF v2.8.0 Upgrade Plan

**Date:** 2026-02-10
**Current version:** ARF v2.8.0 (in `03_arf/`)
**Target version:** ARF v2.8.0 (released 2026-02-02)
**Release URL:** https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/releases/tag/v2.8.0
**Status:** ✅ Complete

---

## 📊 Progress Tracker

> **Last updated:** 2026-02-10 21:30 CET
> **Branch:** `feat/arf-280-upgrade` | **Tag:** `pre-arf-280`

### Overview

| Phase | Description | Status | Commit |
|-------|-------------|--------|--------|
| **0** | Create rollback safety net | ✅ Done | `6b7ff77d` |
| **1** | Import v2.8.0 files | ✅ Done | `6b7ff77d` |
| **2** | Update VCQ references + Harmonized ID migration | ✅ Done | `c0d6463a` |
| **3** | Review new HLRs for coverage gaps | ✅ Done | `d3c00a45` |
| **3.5** | Validate deep links + pin URLs | ✅ Done | `adf5b904` |
| **4** | Rebuild and validate | ✅ Done | `e56c0aa4` |
| **5** | Document decisions + merge | 🔄 In progress | — |

### Phase 0: Create rollback safety net ✅

- [x] Create feature branch `feat/arf-280-upgrade`
- [x] Tag current state `pre-arf-280`
- [x] Verify current build is green (`validate:ci` + `npm run build`)

### Phase 1: Import v2.8.0 files ✅

- [x] Verify golden source at `/tmp/arf_v280/` (confirmed v2.8.0 tag)
- [x] Diff local modifications vs v2.8.0 (link format changes only, no local annotations)
- [x] Copy safe-to-overwrite files (CSV, annexes, main doc, index, media, root files)
- [x] Merge discussion-topics (5 files) and technical-specifications (README + TS2)
- [x] Handle Annex 5 media type change (files → directories)
- [x] Fix `arf-config.yaml`: add Topics 38, 53, 56 to `relevantTopics`
- [x] Fix `arf-config.yaml`: update Topic 9 anchor (added "and Wallet Instance Attestation")
- [x] Fix `arf-config.yaml`: add `topicAnchors` for Topics 38, 53, 56
- [x] Run `import-arf-hlr.js` (572 requirements)
- [x] Run `import-arf.js` / `npm run build:arf` (510 HLRs, 20 topics)
- [x] 🔒 COMMIT: `6b7ff77d`

### Phase 2: Update VCQ references + Harmonized ID migration ✅

- [x] Generate Old ID → Harmonized ID mapping table from v2.8.0 CSV
- [x] Handle 8 newly emptied `hlr:` references (Tier 1a):
  - [x] `core.yaml`: remove `RPA_02a` from VEND-CORE-005 + VEND-CORE-032
  - [x] `core.yaml`: remove `Reg_15` from VEND-CORE-031
  - [x] `issuer.yaml`: remove `ISSU_22a`, `ISSU_22b`, `ISSU_32a` from VEND-ISS-037
  - [x] `issuer.yaml`: remove `Reg_14` from VEND-ISS-029
  - [x] `trust_services.yaml`: remove `Reg_12`, `Reg_13` from VEND-TSP-017
- [x] Handle 1 pre-existing empty `hlr:` reference (Tier 3):
  - [x] `core.yaml`: remove `RPA_09` from VEND-CORE-047
- [x] Fix Topic 53 → 52 mismatch in VEND-CORE-048, VEND-CORE-049
- [x] Update 5 explanation-text mentions (Tier 2):
  - [x] `WUA_11` / `WUA_11b` → `WUA_11a`/`AS-WP-09-015` in VEND-ISS-019
  - [x] `RPA_02a` cross-ref annotated as emptied in VEND-CORE-005, VEND-CORE-031, VEND-CORE-032
  - [x] `WURevocation_18` / `WURevocation_19` → added Harmonized IDs in VEND-ISS-041
- [x] Migrate ALL `hlr:` values from Old IDs → Harmonized IDs (191 references across 4 YAML files)
- [x] Update `import-arf.js`: add `byHarmonizedId` index with content-wins guard
- [x] Update `validate-vcq-arf.js`: lookup by Harmonized ID
- [x] Update `validate-vcq.js`: lookup by Harmonized ID
- [x] Update `exportExcel.js`: use `byHarmonizedId` fallback
- [x] Update `build-search-index.js`: show both IDs
- [x] Run validation: `validate-vcq-arf.js` (0 errors) + `validate:vcq` (0 errors, 191 refs valid)
- [x] 🔒 COMMIT: `c0d6463a`

### Phase 3: Review new HLRs for coverage gaps ✅

- [x] Assess Topic 56 (WPSM) — ⬜ No action (all Wallet Provider scope)
- [x] Assess Topic 10 (ISSU_64–73) — 🔴 NEW: VEND-ISS-042, VEND-ISS-043 + updated ISS-008, ISS-012
- [x] Assess Topic 11 (PA_23–31) — ⚠️ Note added to VEND-CORE-033 (rate-limited pseudonyms)
- [x] Assess Topic 38 — ⚠️ Note + HLR refs added to VEND-ISS-041 (WURevocation_13 harm assessment)
- [x] Assess Topic 20 (SUA_06, SUA_07) — ⬜ No action (all Wallet Unit scope)
- [x] Full impact assessment: `docs/research/arf-280-new-hlr-assessment.md`
- [x] Run validation: 0 errors, 203 valid ARF refs, 153 total reqs, 30.7% coverage
- [x] 🔒 COMMIT: `d3c00a45`

### Phase 3.5: Validate deep links + pin URLs ✅

- [x] Verify all `topicAnchors` against v2.8.0 golden source — all 20 match ✅
- [x] Pin `csvUrl` to `refs/tags/v2.8.0` (was `refs/heads/main`)
- [x] Pin `baseUrl` to `blob/v2.8.0` (was `blob/main`)
- [x] Fix subsection anchor generation in `import-arf.js`:
  - Removed incorrect trailing hyphen (398 links affected)
  - Stopped collapsing consecutive hyphens (`B - HLRs` → `b---hlrs`, 65 links affected)
- [x] Rebuild ARF data: 510 HLRs, same data as before (pinned tag = same CSV)
- [x] Link validation: 510/510 deep links resolve to valid anchors ✅
- [x] Verify in browser: ARF badges render correctly, deepLink URLs use v2.8.0
- [x] 🔒 COMMIT: `adf5b904`

### Phase 4: Rebuild and validate ✅

- [x] Rebuild: `npm run build:arf` — 510 HLRs, 20 topics ✅
- [x] Rebuild: `node scripts/build-terminology.js` — 363 terms, all invariants satisfied ✅
- [x] Rebuild: `node scripts/build-vcq.js` — 153 requirements ✅
- [x] Rebuild: `node scripts/build-rca.js` — 487 requirements ✅
- [x] Rebuild: `node scripts/build-search-index.js` — 1437 sections indexed ✅
- [x] Run: `npm run validate:ci` — all 6 validators pass (0 errors) ✅
- [x] Run: `node scripts/validate-vcq-arf.js` — 30.7% coverage, 138 unique HLRs, 12 warnings (pre-existing) ✅
- [x] Spot-check: Home, Terminology, VCQ, RCA all render correctly ✅
- [x] Verify ARF popover: badges link to v2.8.0, deep links have anchors ✅
- [x] Excel export: button renders and triggers download ✅
- [x] 🔒 COMMIT (merged with Phase 3.5 commit: `e56c0aa4`)

### Phase 5: Document decisions + merge ✅

- [x] Add DECISIONS.md entry for upgrade: **DEC-290** ✅
- [x] Add DECISIONS.md entry for Harmonized ID migration: **DEC-291** ✅
- [x] Update ARF version references: `vcq-config.yaml` ARF_2.7.3 → ARF_2.8.0 ✅
- [x] Update plan header: current version → v2.8.0, status → Complete ✅
- [ ] Merge feature branch to master
- [ ] Push + clean up tags

---

## 1. Executive Summary

ARF v2.8.0 is a **substantial release** that modifies 40% of all HLRs. It integrates 4 Discussion Papers (Topics T, AA, E, R), processes 44 Member State comments, and introduces a new Topic 56. The upgrade impacts **8 newly emptied `hlr:` references** (plus 1 pre-existing empty, 3 relocated, 5 doc-only, 2+ structural) in our VCQ configuration and requires careful handling of renumbered, emptied, and newly added requirements.

### Scale of Changes

| Metric | Count |
|--------|-------|
| HLRs in v2.7.3 | 616 unique Harmonized IDs (617 rows, 1 duplicate) |
| HLRs in v2.8.0 | 648 unique Harmonized IDs (656 rows, 8 duplicates†) |
| **Added** | **+43** Harmonized IDs |
| **Removed** | **-11** Harmonized IDs |
| **Text changed** | **247** |
| Notes changed | 122 |

> † 8 Harmonized IDs in v2.8.0 are shared by 2 Old IDs each (e.g., `EW-DM-38-007` maps to both `WURevocation_09` and `WURevocation_17`). The second entry in each pair is Empty — this is an ARF upstream CSV data quality issue. Since `import-arf.js` indexes by Old ID (`byHlrId`), this does not cause collisions. However, the planned `byHarmonizedId` index (Phase 2 step 5) will need a last-write-wins or array strategy for these 8 cases.

### Key Drivers (from CHANGELOG)

- 44 Member State comments on ARF 2.7.3 (mainly Annex 2)
- Certification workstream comments on Annex 2 HLRs
- Progress on Technical Specifications and Standards
- **Topic T** (final): Support and maintenance by the Wallet Provider → new Topic 56
- **Topic AA** (final): Support of Electronic Payments SCA with Wallet → Topic 20 updates
- **Topic E** (final): Pseudonyms, including User authentication mechanism → Topic 11 updates
- **Topic R** (final): Authentication of the User to the device → Topics 40, others
- Several Confluence and GitHub issues resolved
- Four updated figures + one new figure in main text

---

## 2. Files Changed (v2.7.3 vs v2.8.0)

### Content files (substantive changes)

| File | Change type |
|------|-------------|
| `hltr/high-level-requirements.csv` | **Primary HLR data** — 43 added, 11 removed, 247 text changes |
| `docs/annexes/annex-2/annex-2.01-high-level-requirements.md` | Intro text reformatted; `SUBCATEGORY` → `TOPIC` in ID format |
| `docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md` | Regenerated from CSV |
| `docs/annexes/annex-2/annex-2.03-high-level-requirements-by-category.md` | Regenerated from CSV |
| `docs/architecture-and-reference-framework-main.md` | Main document text changes (Topics T, AA, E, R integration) |
| `docs/technical-specifications/README.md` | Updated TS listing |
| `docs/technical-specifications/ts2-notification-publication-provider-information.md` | TS2 updated |
| `docs/index.md` | Version bump |

### Discussion papers (modified)

| File | Change |
|------|--------|
| `docs/discussion-topics/README.md` | Updated integration status table |
| `docs/discussion-topics/l+m-data-deletion-and-reporting-of-wrp-to-dpa.md` | Modified |
| `docs/discussion-topics/n-export-and-data-portability.md` | Modified |
| `docs/discussion-topics/s-certificate-transparancy.md` | Modified |
| `docs/discussion-topics/x-relying-party-registration.md` | Modified |

### Media / figures

- Figures 6–13 **renumbered** (new Figure 6: Statechart_Wallet_Provider inserted, shifting all subsequent figures)
- Figures 1, 2, 4 updated
- Annex 5 design guide media changed from files to directories

### Template changes

| File | Change |
|------|--------|
| `hltr/scripts/annex-2.02-high-level-requirements-by-topic.jinja2` | Template for regeneration updated |

---

## 3. New HLRs (43 added)

### Topic 56: Wallet Provider Support and Maintenance (NEW TOPIC — 4 HLRs)

This is a brand new topic created from Discussion Paper T.

| Harmonized ID | Old ID | Requirement |
|---------------|--------|-------------|
| AS-WP-56-001 | WPSM_01 | Wallet Provider SHALL monitor installed base for maintenance; document data needs transparently |
| AS-WP-56-002 | WPSM_02 | Wallet Providers SHALL write custom crash logs for analysis |
| AS-WP-56-003 | WPSM_03 | Wallet Provider SHALL monitor security posture of operational Wallet Instances |
| AS-WP-56-004 | WPSM_04 | During lifetime, Wallet Provider SHALL update Wallet Unit for security and functionality |

**VCQ impact:** These are Wallet Provider requirements. Check if any existing VCQ requirements cover support/maintenance; if not, consider adding coverage.

### Topic 10: Issuing a PID or attestation (+10 HLRs)

| Harmonized ID | Old ID | Summary |
|---------------|--------|---------|
| AS-AP-10-090 | ISSU_64 | Batch issuance support (OpenID4VCI) |
| AS-AP-10-091 | ISSU_65 | Re-issued attestation must go to same Wallet Unit |
| AS-AP-10-092 | ISSU_66 | Empty |
| AS-AP-10-093 | ISSU_67 | PID Provider SHALL have issuance policy (NCP+ per ETSI EN 319 411-1) |
| AS-AP-10-094 | ISSU_68 | PID Provider signing certs SHALL comply with ETSI TS 119 412-6 Clause 4 |
| AS-AP-10-095 | ISSU_69 | QEAA Provider SHALL have issuance policy |
| AS-AP-10-096 | ISSU_70 | QEAA Provider signing certs SHALL comply with ETSI TS 119 412-6 Clause 7 |
| AS-AP-10-097 | ISSU_71 | Non-qualified EAA Provider signing certs SHALL comply with ETSI TS 119 412-6 Clause 6 |
| AS-AP-10-098 | ISSU_72 | PuB-EAA Provider SHALL have issuance policy (NCP+) |
| AS-AP-10-099 | ISSU_73 | PuB-EAA Provider signing certs SHALL comply with ETSI TS 119 412-6 Clause 8 |

**VCQ impact:** ISSU_67–73 introduce new ETSI compliance obligations for issuers. Review `vcq/requirements/issuer.yaml` for coverage gaps.

### Topic 11: Pseudonyms (+9 HLRs)

| Harmonized ID | Old ID | Summary |
|---------------|--------|---------|
| AS-WP-11-024 | PA_23 | Scope rate-limited pseudonym protocol — ECCG crypto algorithms |
| AS-WP-11-025 | PA_24 | Protocol for generating/registering scope rate-limited pseudonyms |
| AS-WP-11-026 | PA_25 | RP can verify rate not exceeded |
| AS-WP-11-027 | PA_26 | RP chooses scope and rate |
| AS-WP-11-028 | PA_27 | Unlinkability across different RPs |
| AS-WP-11-029 | PA_28 | Unlinkability within same scope (rate > 1) |
| AS-WP-11-030 | PA_29 | No entity can authenticate as another User's pseudonym |
| AS-WP-11-031 | PA_30 | Crypto material for pseudonyms stored in WSCA/WSCD or keystore |
| AS-WP-11-032 | PA_31 | Pseudonyms persistent across Wallet Unit changes |

**VCQ impact:** These are Wallet Provider requirements related to pseudonym support. May impact RP requirements if RPs request pseudonyms. Review if existing VCQ pseudonym requirements (if any) need updating.

### Topic 38: Wallet Unit Revocation (+8 HLRs)

| Harmonized ID | Old ID | Summary |
|---------------|--------|---------|
| AS-WP-38-018 | WURevocation_18 | PID Provider SHALL verify Wallet Unit revocation status regularly |
| AS-WP-38-019 | WURevocation_19 | Attestation Provider MAY revoke attestation if Wallet Unit revoked |
| EW-DM-38-012 | WURevocation_11 | Wallet Provider SHALL revoke upon PID Provider request (death) |
| EW-DM-38-013 | WURevocation_12 | Verify requesting party is valid PID Provider |
| EW-DM-38-014 | WURevocation_13 | PID Provider SHALL ensure revocation doesn't harm stakeholders |
| EW-DM-38-015 | WURevocation_14 | Inform User within 24h of revocation |
| EW-DM-38-016 | WURevocation_15 | Empty |
| EW-DM-38-017 | WURevocation_16 | Use independent communication channel to inform User |

**VCQ impact:** WURevocation_18 and WURevocation_19 are already referenced in `vcq/requirements/issuer.yaml`. The Harmonized IDs changed from `AS-WP-38-012`/`013` to `AS-WP-38-018`/`019` (same old IDs). The old Harmonized IDs are now removed. **Update VCQ references to point to new Harmonized IDs.**

### Topic 9: Wallet Unit Attestation (+6 HLRs)

| Harmonized ID | Old ID | Summary |
|---------------|--------|---------|
| AS-WP-09-026 | WUA_20a | PID/Attestation Provider SHALL comply with TS3 (moved from old ID) |
| AS-WP-09-027 | WUA_21 | Empty |
| AS-WP-09-028 | WUA_22 | Wallet Provider SHALL ensure valid, non-revoked WIA during issuance |
| AS-WP-09-029 | WUA_23 | ECCG crypto algorithms for WIA |
| AS-WP-09-030 | WUA_24 | WIA presented only to PID/Attestation Provider, not RPs |
| AS-WP-09-031 | WUA_25 | PID/Attestation Provider SHALL verify WIA per OpenID4VCI Appendix E |

**VCQ impact:** WUA_20a is referenced in issuer.yaml. The old Harmonized ID (AS-WP-09-024) was emptied; content moved to AS-WP-09-026. **Update reference.**

### Topic 20: Strong User Authentication (+2 HLRs)

| Harmonized ID | Old ID | Summary |
|---------------|--------|---------|
| AS-WP-20-007 | SUA_06 | Wallet Unit SHALL render dialogue messages per TS12 requirements |
| AS-WP-20-008 | SUA_07 | Wallet Unit SHALL validate transactional data conforms to TS/Rulebook |

**VCQ impact:** These are Wallet Provider requirements. Relevant to our SCA/SUA terminology work. No direct VCQ impact unless we have SUA-related vendor requirements.

### Other additions

| Topic | HLR | Summary |
|-------|-----|---------|
| Topic 7 | VCR_18, VCR_19 | Herd privacy for status lists; regular revocation check by Wallet Unit |
| Topic 19 | DASH_12 | User can request RP to delete attributes or report to DPA |
| Topic 27 | Reg_33 | Empty |

---

## 4. Removed HLRs (11 total)

All 11 removed HLRs are from **Topic 38** and were **renumbered** — their content now appears under new Harmonized IDs with `EW-DM-38-xxx` or `AS-WP-38-01x` prefixes.

| Old Harmonized ID | Old ID | New Harmonized ID |
|-------------------|--------|-------------------|
| AS-WP-38-003 | WURevocation_07 | → content in EW-DM-38-005 (WURevocation_08) |
| AS-WP-38-004 | WURevocation_09 | → content absorbed elsewhere |
| AS-WP-38-005 | WURevocation_9b | → content absorbed elsewhere |
| AS-WP-38-006 | WURevocation_10 | → content absorbed elsewhere |
| AS-WP-38-007 | WURevocation_11 | → EW-DM-38-012 |
| AS-WP-38-008 | WURevocation_12 | → EW-DM-38-013 |
| AS-WP-38-009 | WURevocation_13 | → EW-DM-38-014 |
| AS-WP-38-010 | WURevocation_14 | → EW-DM-38-015 |
| AS-WP-38-011 | WURevocation_16 | → EW-DM-38-017 |
| AS-WP-38-012 | WURevocation_18 | → AS-WP-38-018 |
| AS-WP-38-013 | WURevocation_19 | → AS-WP-38-019 |

**Key insight:** The Topic 38 restructuring moved requirements from `AS-WP` (Actor-Specific, Wallet Providers) to `EW-DM` (Ecosystem-Wide, Data Models) category. This is a **category reclassification**, not a content removal.

---

## 5. Emptied HLRs

> **Verified count (pass 3):** 29 HLRs newly emptied in v2.8.0 (had content in v2.7.3). An additional 55 were already empty in v2.7.3. The table below lists the subset most relevant to our VCQ/RCA configuration.

These HLRs had their text replaced with "Empty" — the requirement was withdrawn, consolidated, or deferred.

### By topic

| Topic | Count | Emptied HLR Old IDs | Assessment |
|-------|-------|---------------------|------------|
| Topic 27 (Registration) | 10 | Reg_12, Reg_13, Reg_14, Reg_15, Reg_16, Reg_18, Reg_19, Reg_24, Reg_29, Reg_31 | Certificate policy requirements restructured; some content moved to new Reg_30, Reg_32, Reg_33. `Reg_12` newly emptied (was cert policy spec). **Note:** `Reg_31` got a new Harmonized ID (`AS-MS-27-038`) with content — Old ID still resolves (see §6 Tier 1b). |
| Topic 9 (WUA) | 5 | WUA_11b, WUA_16, WUA_17, WUA_20, WUA_20a | Content moved to new HLR IDs (WUA_21–25). **Note:** `WUA_20a` got a new Harmonized ID (`AS-WP-09-026`) with same content (see §6 Tier 1b). |
| Topic 10 (Issuance) | 7 | ISSU_22a, ISSU_22b, ISSU_32, ISSU_32a, ISSU_33, ISSU_58, ISSU_60 | Metadata/access cert requirements dropped or consolidated. **Note:** `ISSU_32` got a new Harmonized ID (`AS-AP-10-048`) with changed text (see §6 Tier 1b). `ISSU_32a` genuinely emptied. |
| Topic 28 (Legal Person PID) | 3 | LP_01, LP_02, LP_03 | **Entire topic content deferred** |
| Topic 12 (Attestation Rulebooks) | 2 | ARB_27, ARB_32 | QEAA/PuB-EAA rulebook and JSON Schema requirements dropped |
| Topic 38 (Revocation) | 1 | WURevocation_02 | WUA possession requirement dropped |
| Topic 40 (Installation/Activation) | 1 | WIAM_11 | Content moved to WPSM_04 (Topic 56) |
| Others | 6 | RPA_02a, ACP_06, DASH_12 (old ID, moved to new), RPRC_02, W2W_18, PAD_06 | Various |

---

## 6. Direct Impact on VCQ/RCA Configuration

> **Ground-truth verification (2026-02-10, pass 2):** Every entry below was verified against the **v2.8.0 golden source CSV** at `/tmp/arf_v280/hltr/high-level-requirements.csv`. The original impact assessment confused *Harmonized ID emptying* with *Old ID emptying* — when ARF restructures an HLR, the old Harmonized ID is emptied but the same Old ID gets a **new** Harmonized ID with content. Since `import-arf.js` indexes by Old ID (`byHlrId`), three HLRs that were flagged as "emptied" actually **still resolve to content** via their Old IDs.
>
> **Corrected impact (pass 4, 2026-02-10):**
> - **8 `hlr:` field references** newly emptied in v2.8.0 (will break validation)
> - **1 `hlr:` field reference** already empty in v2.7.3 (pre-existing bug: `RPA_09`)
> - **3 `hlr:` field references** with content relocated to new Harmonized IDs (no breakage via `byHlrId`)
> - **5 documentation-only** mentions (explanation text, won't break validation) — includes `WUA_11`, `WUA_11b`, `RPA_02a` cross-refs
> - **2+ structural issues** (pre-existing bugs: Topic 53↔52 mismatch, `RPA_09` empty reference, 19 topic-label mismatches)

### Tier 1a: Newly emptied `hlr:` references (8) — will break validation after v2.8.0 import

These Old IDs had content in v2.7.3 but map to `isEmpty: true` in v2.8.0. After import, VCQ popovers will show "Empty" and `validate-vcq.js` will emit warnings.

#### `vcq/requirements/core.yaml` (2 newly emptied)

| HLR | VCQ Requirement | Location | v2.8.0 Harmonized ID | Action |
|-----|----------------|----------|---------------------|--------|
| `RPA_02a` | VEND-CORE-005 (line 259), VEND-CORE-032 (line 1701) | `hlr:` array | `AS-RP-06-001` → Empty | Was: "RP SHALL include access certs by value, not reference." Requirement withdrawn. **Remove from `hlr:` arrays and update explanation text.** |
| `Reg_15` | VEND-CORE-031 (line 1641) | `hlr:` array | `AS-MS-27-018` → Empty | Was: ACA revocation method via cert policy. Content may be in ETSI standards now. **Remove from `hlr:` array, review if Reg_32 covers.** |

#### `vcq/requirements/issuer.yaml` (4 truly emptied)

| HLR | VCQ Requirement | Location | v2.8.0 Harmonized ID | Action |
|-----|----------------|----------|---------------------|--------|
| `ISSU_22a` | VEND-ISS-037 (line 2021) | `hlr:` array | `AS-AP-10-030` → Empty | Was: PID Provider metadata signing requirement. **Remove from `hlr:` array.** |
| `ISSU_22b` | VEND-ISS-037 (line 2022) | `hlr:` array | `AS-AP-10-031` → Empty | Was: Access cert in metadata requirement. **Remove from `hlr:` array.** |
| `ISSU_32a` | VEND-ISS-037 (line 2028) | `hlr:` array | `AS-AP-10-049` → Empty | Was: Deferred issuance requirement (adjacent to `ISSU_32`). **Remove from `hlr:` array.** Note: `ISSU_32` (without `a`) has content → Tier 1b. |
| `Reg_14` | VEND-ISS-029 (line 1534) | `hlr:` array | `AS-MS-27-017` → Empty | Was: CT logging via cert policy. **Remove from `hlr:` array.** |

#### `vcq/requirements/trust_services.yaml` (2 truly emptied)

| HLR | VCQ Requirement | Location | v2.8.0 Harmonized ID | Action |
|-----|----------------|----------|---------------------|--------|
| `Reg_12` | VEND-TSP-017 (line 922) | `hlr:` array | `AS-MS-27-015` → Empty | Was: Certificate Policy specification requirement. **Remove from `hlr:` array; update explanation text (line 878).** |
| `Reg_13` | VEND-TSP-017 (line 923) | `hlr:` array | `AS-MS-27-016` → Empty | Was: CT logging requirement via cert policy. **Remove from `hlr:` array.** |

### Tier 1b: Content relocated to new Harmonized IDs (3) — no breakage via `byHlrId`

These HLRs had their **old Harmonized IDs emptied**, but the same Old IDs were reassigned to **new Harmonized IDs with content**. Since `import-arf.js` indexes by Old ID (`byHlrId[hlrId]`), the VCQ lookups will resolve correctly to the new content after v2.8.0 import. **No immediate action required**, but review the changed text.

| HLR | VCQ Requirement | Old Harmonized ID (emptied) | New Harmonized ID (has content) | Text change |
|-----|----------------|----------------------------|-------------------------------|-------------|
| `Reg_31` | VEND-CORE-031 (line 1642) | `AS-MS-27-037` → Empty | `AS-MS-27-038` | Reworded: was "cert policy SHALL require..." → now "access cert SHALL contain a name..." (similar intent, different framing) |
| `ISSU_32` | VEND-ISS-037 (line 2027) | `AS-AP-10-047` → Empty | `AS-AP-10-048` | Changed: was "include access cert in metadata" → now "sign Credential Issuer metadata per OpenID4VCI §12.2.3" (substantive change) |
| `WUA_20a` | VEND-ISS-031 (line 1658) | `AS-WP-09-024` → Empty | `AS-WP-09-026` | Moved: same text "comply with TS3", new Harmonized ID (no content change) |

> **⚠️ Review needed for `ISSU_32`:** The text changed substantively — from "include access cert in metadata" to "sign metadata per OpenID4VCI". The VCQ requirement VEND-ISS-037 may need its explanation text updated to reflect the new ARF requirement text, even though the `hlr:` lookup won't break.

### Tier 2: Documentation-only impacts (5) — won't break validation

These HLRs appear only in `explanation:` text (not in `arfReference.hlr:` fields). They won't trigger validation errors but should be updated for accuracy.

| HLR | VCQ Requirement | Location | Status | Action |
|-----|----------------|----------|--------|--------|
| `WUA_11` | VEND-ISS-019 (line 971), VEND-ISS-031 | `explanation:` text only | **Newly emptied** | Mentioned as "per WUA_11–WUA_11b" in VEND-ISS-019 explanation and in VEND-ISS-031 explanation. Not in any `hlr:` field. **Update explanation text.** |
| `WUA_11b` | VEND-ISS-019 (line 971) | `explanation:` text only | **Newly emptied** | Same location as `WUA_11` above. **Update explanation text to reflect new HLR IDs.** |
| `RPA_02a` | VEND-CORE-031 (lines 1623, 1660) | `explanation:` text only | **Newly emptied** | Already in Tier 1a `hlr:` arrays for VEND-CORE-005 and VEND-CORE-032, but ALSO mentioned in VEND-CORE-031 explanation text (not `hlr:` array). **Update explanation when removing from other `hlr:` arrays.** |
| `WURevocation_18` | VEND-ISS-041 (lines 2257–2263) | `explanation:` text only | **Renumbered** | Discussed in explanation; VEND-ISS-041's `arfReference` has `topic: Topic 38` but deliberately omits `hlr:`. **Update explanation text; consider adding `hlr:` field after Topic 38 is added to `relevantTopics`.** |
| `WURevocation_19` | VEND-ISS-041 (lines 2269–2276) | `explanation:` text only | **Renumbered** | Same as above — discussed in explanation only. **Update explanation text.** |

### Tier 3: Structural issues (2+) — pre-existing bugs

| Issue | VCQ Requirement | Location | Description |
|-------|----------------|----------|-------------|
| **Topic 53 ↔ 52 mismatch** | VEND-CORE-048, VEND-CORE-049 | `arfReference.topic` | These requirements reference `topic: Topic 53` with `hlr: RPI_01`, but `RPI_01` is actually assigned to **Topic 52** (Relying Party Intermediaries) in the ARF CSV. Topic 53 exists in ARF as "Zero-Knowledge Proofs" (`ZKP_01`–`ZKP_09`) — an unrelated topic. **Fix: change `topic: Topic 53` → `topic: Topic 52`.** |
| **`RPA_09` already empty** | VEND-CORE-047 (line 2477) | `hlr:` array | `RPA_09` was **already Empty in v2.7.3** — pre-existing VCQ data quality issue. **Remove from `hlr:` array; update explanation text (line 2498).** |
| **19 topic label mismatches** | Various (see below) | `arfReference.topic` | Comprehensive cross-check of all 201 `hlr:` references against the ARF CSV found **19 cases** where the VCQ `topic:` field doesn't match the HLR's actual ARF topic. All 19 are **pre-existing** (same in both v2.7.3 and v2.8.0). Of these, 4 are "grouped" (other HLRs in the same `arfReference` DO match the topic) — this is intentional design. **8 distinct requirements have ALL HLRs mismatching the topic** — these are data quality bugs. |

**Topic mismatch detail (8 all-mismatch requirements):**

| VCQ Requirement | VCQ Topic | HLR(s) | Actual ARF Topic | Severity |
|-----------------|-----------|--------|-----------------|----------|
| VEND-CORE-043 | Topic 6 | `OIA_03a` | Topic 1 | Low (cosmetic label) |
| VEND-CORE-044 | Topic 9 | `ISSU_01` | Topic 10 | Low (cosmetic label) |
| VEND-CORE-045 | Topic 27 | `RPA_01` | Topic 6 | Low (cosmetic label) |
| VEND-CORE-047 | Topic 44 | `RPA_09`, `RPA_12` | Topic 6 | Low (cosmetic label) |
| VEND-CORE-048 | Topic 53 | `RPI_01` | Topic 52 | Medium (wrong topic entirely) |
| VEND-CORE-049 | Topic 53 | `RPI_01,03,06,07,09,10` | Topic 52 | Medium (wrong topic entirely) |
| VEND-CORE-052 | Topic 16 | `ProxId_01a` | Topic 24 | Low (cosmetic label) |
| VEND-INT-029 | Topic 6 | `RPI_07` | Topic 52 | Low (grouped context) |

> **Note on VCQ topic semantics:** VCQ `arfReference.topic` is a **semantic label** indicating which ARF topic area the requirement relates to, not necessarily matching every HLR's CSV topic. Deep links use the HLR's actual CSV topic (via `topicAnchors`), so mismatched topic labels affect badge display text but NOT link destinations. The Topic 53↔52 case is the only one with functional impact (wrong `relevantTopics` inclusion).

### ~~`WUA_20` — false positive~~

The original assessment listed `WUA_20` (without `a`) as an issuer.yaml impact. **Verified: `WUA_20` does not appear in any `hlr:` field or explanation text in any VCQ YAML file.** This was a false positive in the initial assessment. Only `WUA_20a` is referenced (in VEND-ISS-031).


---

## 7. Recommended Upgrade Steps

### Phase 0: Create rollback safety net

> **Rationale:** This upgrade touches 4 YAML files, 3+ build scripts, a React component, config files, and validation scripts. A clean rollback point is essential.

1. **Create a feature branch:**
   ```bash
   git checkout -b feat/arf-280-upgrade
   ```
2. **Tag the current state** (for easy diffing later):
   ```bash
   git tag pre-arf-280
   ```
3. **Verify current build is green:**
   ```bash
   npm run validate:ci && npm run build
   ```

### Phase 1: Import the v2.8.0 files

> ⚠️ **Do NOT blindly overwrite** — our `03_arf/docs/` contains local annotations in discussion-topics and technical-specifications markdown files that we've modified.

1. The v2.8.0 clone is already at `/tmp/arf_v280/` (shallow clone, may need re-cloning if expired)
2. **Re-clone if needed:**
   ```bash
   cd /tmp && rm -rf arf_v280
   git clone --depth=1 --branch v2.8.0 \
     https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework.git arf_v280
   ```
3. **Diff our local modifications first:**
   ```bash
   diff -rq /home/ivan/dev/eIDAS20/03_arf/docs /tmp/arf_v280/docs --exclude='.git'
   ```
4. **Safe to overwrite directly:**
   - `hltr/high-level-requirements.csv` (canonical HLR data)
   - `docs/annexes/` (generated from CSV)
   - `docs/architecture-and-reference-framework-main.md` (we don't modify this)
   - `docs/index.md`
   - `docs/media/` (figures)
   - `CHANGELOG.md`, `README.md`, `Makefile`, `mkdocs.yml`
5. **Merge carefully** (we may have local edits):
   - `docs/discussion-topics/*.md` — we have local annotations
   - `docs/technical-specifications/*.md` — we have local copies (e.g., TS12)
6. **Update CHANGELOG.md** in our repo root or TRACKER.md
7. **Fix missing topics in `arf-config.yaml`:**
   > ⚠️ **Pre-existing bug:** VCQ YAML files reference Topics 38 and 53, but these are **not listed** in `relevantTopics`, so `import-arf.js` silently drops all their HLRs. The `byHlrId` index never contains them, causing broken popover lookups and validation errors.

   Add to `relevantTopics`:
   - `38` — Wallet Unit Revocation (referenced by `issuer.yaml`, restructured in v2.8.0)
   - `52` — already in `relevantTopics` ✅ (after fixing Topic 53 → 52 mismatch in §6 Tier 3, no change needed)
   - `53` — Zero-Knowledge Proofs (no VCQ `hlr:` references to ZKP_* yet, but referenced by `core.yaml` `topic:` field — after fixing the mismatch, this becomes optional; add for future coverage if ZKP requirements are planned)
   - `56` — Wallet Provider Support and Maintenance (new in v2.8.0)

   Add corresponding entries to `topicAnchors` for all three topics.

8. **Re-run the local ARF import script** (separate from the GitHub-fetching `import-arf.js`):
   ```bash
   node scripts/import-arf-hlr.js
   ```
   > ⚠️ **Two parallel ARF scripts exist:**
   > - `import-arf.js` → fetches from **GitHub CSV** → writes `public/data/arf-hlr-data.json` (VCQ UI)
   > - `import-arf-hlr.js` → reads **local** `03_arf/hltr/high-level-requirements.csv` → writes `config/requirements/arf-hlr.json` (Requirements Browser)
   >
   > Both must be updated after the CSV changes. Only `import-arf.js` is in the `npm run build` pipeline.

9. **🔒 COMMIT:** `chore: import ARF v2.8.0 source files and fix arf-config.yaml`

### Phase 2: Update VCQ references and migrate to Harmonized IDs

> **Rationale:** This phase combines two related tasks: (a) handling the 8 newly emptied `hlr:` references + 1 pre-existing empty reference (+ 3 explanation-text mentions) from v2.8.0, and (b) migrating all VCQ `arfReference.hlr` values from Old IDs to Harmonized IDs. Doing these together **in one pass** avoids touching the same YAML lines twice. Note: 3 additional `hlr:` references (`Reg_31`, `ISSU_32`, `WUA_20a`) had their Harmonized IDs changed but their Old IDs still resolve to content — these require no removal action, only text review (see §6 Tier 1b).
>
> **Why Harmonized IDs?** VCQ YAML files currently use Old IDs (e.g., `ISSU_29`, `RPI_01`, `WUA_20a`) in `arfReference.hlr` fields. Old IDs are not stable across ARF versions — when HLRs are renumbered (like Topic 38's `AS-WP` → `EW-DM` restructuring), the Old ID stays but the Harmonized ID changes. Using Harmonized IDs makes references **version-pinned and unambiguous**.

**Data flow affected:**
```
VCQ YAML (arfReference.hlr) → build-vcq.js → vcq-data.json → src/pages/VendorQuestionnaire.jsx (ARFReferenceLink)
                                                                     ↕
                                              arf-hlr-data.json (byHlrId index) → popover + deep link
                                                                     ↕
                                               src/utils/vcq/exportExcel.js¹ (byHlrId lookup) → Excel export columns
```

**Steps:**

1. **Generate a mapping table** of Old ID → Harmonized ID from the v2.8.0 CSV:
   ```bash
   python3 -c "
   import csv
   with open('03_arf/hltr/high-level-requirements.csv', 'r', encoding='utf-8-sig') as f:
       reader = csv.DictReader(f, delimiter=';')
       for row in reader:
           print(f\"{row['Index']} → {row['Harmonized_ID']}\")
   "
   ```
2. **Handle the 9 empty references** (8 newly emptied + 1 pre-existing; see §6 Tier 1a + Tier 3) — for each:
   - **Emptied and withdrawn** (e.g., `RPA_02a`, `RPA_09`, `Reg_15`, `Reg_12`, `Reg_13`, `Reg_14`): remove the `hlr:` line, update `explanation:` to note the withdrawal
   - **Emptied but covered by sibling** (e.g., `ISSU_22a/22b`, `ISSU_32a`): remove from `hlr:` array, verify remaining HLRs in the array still cover the VCQ requirement
   - Note: `Reg_31`, `ISSU_32`, `WUA_20a` (§6 Tier 1b) need **no `hlr:` removal** — their Old IDs resolve to new content. Review explanation text for `ISSU_32` (text changed substantively).
3. **Update the 3 explanation-text mentions** (see §6 Tier 2) — update references to `WUA_11b`, `WURevocation_18`, `WURevocation_19` in explanation text
4. **Migrate ALL remaining `hlr:` values** from Old IDs to Harmonized IDs:
   - `config/vcq/requirements/core.yaml` (28 arfReferences)
   - `config/vcq/requirements/issuer.yaml` (37 arfReferences, incl. 1 topic-only)
   - `config/vcq/requirements/trust_services.yaml` (4 arfReferences)
   - `config/vcq/requirements/intermediary.yaml` (23 arfReferences)
5. **Update `import-arf.js`** — add a `byHarmonizedId` index alongside `byHlrId`:
   ```js
   // Line 247: add parallel index
   byHlrId[hlrId] = requirement;
   // ⚠️ Content-wins guard: 8 Harmonized IDs are duplicated in v2.8.0 CSV.
   // 5 are "empty tombstones" (Topic 38) where the Empty row comes AFTER the
   // content row. Naïve last-write-wins would lose the content.
   if (!byHarmonizedId[harmonizedId] || !requirement.isEmpty) {
       byHarmonizedId[harmonizedId] = requirement;
   }
   ```
   This ensures both Old IDs (for search, backward compat) and Harmonized IDs (for VCQ lookups) resolve. The content-wins guard handles the 8 duplicate Harmonized IDs (5 empty tombstones + 3 genuinely different requirements sharing an ID).
6. **Update `validate-vcq-arf.js`** — change validation lookup to use Harmonized IDs:
   ```js
   // Before:
   const validHlrIds = new Set(arf.requirements.map(r => r.hlrId));
   // After:
   const validHlrIds = new Set(arf.requirements.map(r => r.harmonizedId));
   ```
7. **Update `validate-vcq.js`** (lines 340-384) — this script **also** validates ARF references against `byHlrId`. Update the lookup to use `byHarmonizedId`:
   ```js
   // Line 340:
   const validHlrIds = new Set(Object.keys(arfData.byHarmonizedId || arfData.byHlrId || {}));
   ```
8. **Update `src/utils/vcq/exportExcel.js`** (lines 174-196) — the Excel export uses `arfData.byHlrId[id]` to look up specs/notes. After migration, VCQ will pass Harmonized IDs. Update to check both indices:
   ```js
   const hlrData = arfData.byHarmonizedId?.[id] || arfData.byHlrId?.[id];
   ```
9. **Update search index display** — `build-search-index.js` (line 261-268) uses `req.hlrId` for the search `term` and `sectionTitle`. Show both IDs for discoverability:
   ```js
   term: `${req.hlrId} (${req.harmonizedId})`,
   ```
10. **Run validation:** `node scripts/validate-vcq-arf.js && npm run validate:vcq` — all references should resolve
11. **🔒 COMMIT:** `feat: migrate VCQ ARF references to Harmonized IDs and handle v2.8.0 emptied HLRs`

**Scope:** 92 `arfReference` entries across 4 YAML files (28 + 37 + 4 + 23). Only entries with a non-empty `hlr:` field need Harmonized ID migration.

### Phase 3: Review new HLRs for coverage gaps

Assess whether any of the 43 new HLRs create requirements that should be reflected in VCQ/RCA:

1. **Topic 56 (WPSM):** New Wallet Provider maintenance requirements — potentially relevant for vendor questionnaire if vendor is a Wallet Provider
2. **Topic 10 (ISSU_64–73):** New ETSI policy/certification requirements for issuers — **likely needs new VCQ requirements**
3. **Topic 11 (PA_23–31):** Pseudonym rate-limiting — primarily Wallet Provider scope, may need RP requirements if RPs request pseudonyms
4. **Topic 38 (revocation restructuring):** Verify all references still point to correct HLRs
5. **Topic 20 (SUA_06, SUA_07):** Wallet UI rendering for SCA — relevant to our SCA/SUA work

### Phase 3.5: Validate deep links

> **Rationale:** Every HLR in `arf-hlr-data.json` has a `deepLink` field — a clickable URL that appears in the VCQ popover (`ARFReferenceLink` component in `VendorQuestionnaire.jsx`). These links use anchor fragments from `arf-config.yaml` → `topicAnchors`. The v2.8.0 release changed the Annex 2 heading format (`SUBCATEGORY` → `TOPIC`), which likely **changes the anchor slugs** on GitHub. Additionally, the `csvUrl` currently points to `refs/heads/main` — if `main` advances to v2.9.0 between our Phase 1 and this phase, we'd import **mismatched data** (local files = v2.8.0, HLR JSON = v2.9.0).

**Current link format:**
```
https://github.com/.../blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a231-topic-1---accessing-online-services-with-a-wallet-unit
```

**Affected components:**
- `config/arf/arf-config.yaml` → `topicAnchors` (defines anchor slugs for 15+ topics)
- `config/arf/arf-config.yaml` → `csvUrl` (source of HLR data for `import-arf.js`)
- `scripts/import-arf.js` → `processRequirements()` (builds `deepLink` from base URL + anchor)
- `public/data/arf-hlr-data.json` → ~1400 deep links in output JSON
- `src/pages/VendorQuestionnaire.jsx` → `ARFReferenceLink` renders these as `<a href>` tags

**Note:** Deep links only appear in VCQ — confirmed RCA has no `arfReference` fields.

**Steps:**

1. **Fetch the v2.8.0 Annex 2 by-topic document** and extract all heading anchors:
   ```bash
   curl -sL "https://raw.githubusercontent.com/.../v2.8.0/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md" \
     | grep '^#' | head -60
   ```
2. **Compare with current `topicAnchors`** in `arf-config.yaml` — identify any that changed

   > **Pre-computed comparison (v2.8.0 golden source, 2026-02-10):** Of the 17 existing `topicAnchors`, **only Topic 9 changed**. All others are identical.
   >
   > | Topic | Status | Detail |
   > |-------|--------|--------|
   > | 1, 3, 6, 7, 10, 11, 12, 16, 24, 27, 31, 42, 43, 44, 48, 52 | ✅ Same | Anchors unchanged in v2.8.0 |
   > | **9** | ❌ **Changed** | Title extended: "Wallet Unit Attestation" → "Wallet Unit Attestation **and Wallet Instance Attestation**" |
   > | | | Old: `a236-topic-9---wallet-unit-attestation` |
   > | | | New: `a236-topic-9---wallet-unit-attestation-and-wallet-instance-attestation` |
   >
   > **Impact of Topic 9 change:** All WUA_* HLR deep links (20+ links) will 404 if the anchor is not updated.

3. **Add new entries** (verified anchors from v2.8.0 golden source):
   - Topic 38: `a2322-topic-38---wallet-unit-revocation`
   - Topic 53: `a2331-topic-53-zero-knowledge-proofs`
   - Topic 56: `a2334-topic-56---wallet-provider-support-and-maintenance`
4. **Update `arf-config.yaml`** with corrected anchor slugs
5. **Pin both `csvUrl` AND `baseUrl` to `v2.8.0` tag** instead of `main`:
   ```yaml
   source:
     # Before:
     csvUrl: ".../refs/heads/main/hltr/high-level-requirements.csv"
     baseUrl: ".../blob/main/docs/annexes/annex-2"
     # After:
     csvUrl: ".../refs/tags/v2.8.0/hltr/high-level-requirements.csv"
     baseUrl: ".../blob/v2.8.0/docs/annexes/annex-2"
   ```
   This eliminates the race condition where `main` could advance to v2.9.0 between builds.
6. **Rebuild ARF data:** `npm run build:arf`
7. **Create/run a link validation script** (one-time check, can be manual):
   ```bash
   # Download the target .md, extract all anchors, cross-check against arf-hlr-data.json deepLinks
   python3 -c "
   import json, re, urllib.request
   # Fetch the actual document
   url = 'https://raw.githubusercontent.com/.../v2.8.0/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md'
   doc = urllib.request.urlopen(url).read().decode()
   # Extract all heading anchors (GitHub slug format)
   headings = re.findall(r'^#+\s+(.+)$', doc, re.MULTILINE)
   anchors = set()
   for h in headings:
       slug = re.sub(r'[^\w\s-]', '', h.lower()).replace(' ', '-')
       anchors.add(slug)
   # Check deep links
   with open('public/data/arf-hlr-data.json') as f:
       data = json.load(f)
   broken = []
   for r in data['requirements']:
       if '#' in r.get('deepLink', ''):
           anchor = r['deepLink'].split('#', 1)[1]
           if anchor not in anchors:
               broken.append(f\"{r['hlrId']}: #{anchor}\")
   print(f'Checked {len(data[\"requirements\"])} links, {len(broken)} broken')
   for b in broken[:20]:
       print(f'  ❌ {b}')
   "
   ```
8. **Verify in browser:** Open VCQ, hover over an ARF badge, click "View in ARF →" — should scroll to correct section.
9. **🔒 COMMIT:** `fix: update ARF deep link anchors and pin URLs to v2.8.0 tag`

### Phase 4: Rebuild and validate

1. Rebuild ARF (from pinned tag): `npm run build:arf`
2. Rebuild local ARF requirements: `node scripts/import-arf-hlr.js`
3. Rebuild terminology: `node scripts/build-terminology.js`
4. Rebuild VCQ: `node scripts/build-vcq.js`
5. Rebuild RCA: `node scripts/build-rca.js`
6. **Rebuild search index:** `node scripts/build-search-index.js` (ingests `arf-hlr-data.json`)
7. Run all validators: `npm run validate:ci`
8. Run ARF-specific validator: `node scripts/validate-vcq-arf.js`
9. Run portal locally: `npm run dev`
10. Spot-check terminology, VCQ, and RCA pages
11. Verify ARF popover deep links in browser (click "View in ARF →" and check scroll position)
12. **Test Excel export** — verify ARF spec/notes columns populate correctly with Harmonized IDs
13. Commit and push

### Phase 5: Document decisions

1. Add a DECISIONS.md entry for the upgrade (e.g., DEC-29x)
2. Add a DECISIONS.md entry for Harmonized ID migration (e.g., DEC-29y)
3. Update TRACKER.md with the upgrade log entry
4. Update any references to ARF version in docs (search for "2.7.3")
5. Update `arf-config.yaml` version comment to reflect v2.8.0
6. **Merge feature branch** and clean up:
   ```bash
   git checkout master && git merge feat/arf-280-upgrade
   git tag -d pre-arf-280  # optional cleanup
   ```

---

## 8. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Local annotations in discussion-topics lost during overwrite | Medium | Diff before overwrite; merge manually |
| VCQ `hlr:` fields referencing emptied HLRs break validation | High | Phase 2 addresses 8 newly emptied + 1 pre-existing empty `hlr:` references (§6 Tier 1a + Tier 3); 3 more have content under new Harmonized IDs (§6 Tier 1b, no breakage) |
| New ETSI requirements (ISSU_67–73) not covered by VCQ | Medium | Phase 3 gap analysis |
| Topic 56 creates vendor obligations not in VCQ | Low | Only relevant if vendor is Wallet Provider (most are not in VCQ scope) |
| Legal Person PID (Topic 28) entirely deferred | Low | If we have LP-related requirements, flag as deferred |
| **Topic 9 anchor changed** — 20+ WUA_* deep links will 404 | **High** | Phase 3.5 step 2: update anchor from `a236-topic-9---wallet-unit-attestation` → `...and-wallet-instance-attestation` |
| Deep links 404 after v2.8.0 heading format change | High | Phase 3.5: pre-computed comparison shows only Topic 9 anchor changed among existing topics |
| Old IDs silently point to wrong content after renumbering | Medium | Phase 2: migrate all `arfReference.hlr` to Harmonized IDs |
| `blob/main` links break when `main` moves to v2.9.0 | Medium | Phase 3.5: pin both `baseUrl` and `csvUrl` to `v2.8.0` tag |
| Topics 38 + 53 excluded from `relevantTopics` — HLRs silently dropped | High | Phase 1 step 7: add missing topics to `arf-config.yaml` |
| `import-arf-hlr.js` not run — Requirements Browser shows stale data | Medium | Phase 1 step 8 + Phase 4 step 2: run both ARF import scripts |
| `csvUrl` race condition — `main` advances mid-upgrade | High | Phase 3.5 step 5: pin `csvUrl` to tag, not `refs/heads/main` |
| `validate-vcq.js` also validates ARF (not just `validate-vcq-arf.js`) | Medium | Phase 2 step 7: update both validation scripts |
| `validate:vcq-arf` not in `validate:ci` — CI gives false green | Medium | Consider adding `validate:vcq-arf` to `validate:ci` pipeline |
| Excel export `byHlrId` lookup fails after Harmonized ID migration | Medium | Phase 2 step 8: update `src/utils/vcq/exportExcel.js` to use `byHarmonizedId` fallback |
| **Pre-existing: Topic 53 ↔ 52 mismatch** in VEND-CORE-048/049 | Medium | Phase 2: fix `topic: Topic 53` → `topic: Topic 52` (RPI_01 belongs to Topic 52; Topic 53 is ZKP, unrelated) |
| Impact assessment overcounted HLR impacts due to Harmonized ID confusion | Low | Corrected in §6 (2026-02-10, pass 2). Root cause: impact assessment compared Harmonized IDs which were emptied, but same Old IDs got new Harmonized IDs with content. |
| **Pre-existing: 19 `arfReference.topic` label mismatches** | Low | §6 Tier 3: 8 requirements have VCQ topic labels that don't match any of their HLRs' actual ARF topics. Cosmetic only — deep links use CSV topic (correct), badge labels use VCQ topic (wrong). Consider batch-fixing during Phase 2 Harmonized ID migration. |
| **5 explanation-text cross-references** to emptied HLRs | Low | §6 Tier 2: `WUA_11`, `WUA_11b`, `RPA_02a` (cross-ref in VEND-CORE-031), `WURevocation_18/19`. Don't break validation but show stale content. |

---

## 9. Reference: Discussion Papers Integrated

| Paper | Topic | Title | Date |
|-------|-------|-------|------|
| Topic T | 56 (new) | Support and maintenance by the Wallet Provider | 2025-10-16 |
| Topic AA | 20 | Support of Electronic Payments SCA with Wallet | 2025-10-06 |
| Topic E | 11 | Pseudonyms, including User authentication mechanism | 2025-10-24 |
| Topic R | 40 | Authentication of the User to the device | 2025-10-14 |

---

## 10. Reference: Full list of text-changed HLRs by Topic

For the complete list of all 247 text-changed HLRs (with change type indicators), see the companion file:
`docs-portal/docs/research/arf-280-impact-assessment.md`

That file was auto-generated and contains the full diff report with per-HLR change classification (added/removed/emptied/modified).
