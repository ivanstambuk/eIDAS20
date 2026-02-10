# ARF v2.8.0 Upgrade Plan

**Date:** 2026-02-10
**Current version:** ARF v2.7.3 (in `03_arf/`)
**Target version:** ARF v2.8.0 (released 2026-02-02)
**Release URL:** https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/releases/tag/v2.8.0
**Status:** Assessment complete, upgrade not yet started

---

## 1. Executive Summary

ARF v2.8.0 is a **substantial release** that modifies 40% of all HLRs. It integrates 4 Discussion Papers (Topics T, AA, E, R), processes 44 Member State comments, and introduces a new Topic 56. The upgrade impacts **13 HLR references** in our VCQ configuration and requires careful handling of renumbered, emptied, and newly added requirements.

### Scale of Changes

| Metric | Count |
|--------|-------|
| HLRs in v2.7.3 | 616 |
| HLRs in v2.8.0 | 648 |
| **Added** | **+43** |
| **Removed** | **-11** |
| **Text changed** | **247** |
| Notes changed | 122 |

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

## 5. Emptied HLRs (33 total)

These HLRs had their text replaced with "Empty" — the requirement was withdrawn, consolidated, or deferred.

### By topic

| Topic | Count | Emptied HLR Old IDs | Assessment |
|-------|-------|---------------------|------------|
| Topic 27 (Registration) | 7 | Reg_13, Reg_14, Reg_15, Reg_16, Reg_18, Reg_19, Reg_24, Reg_29, Reg_31 | Certificate policy requirements restructured; some content moved to new Reg_30, Reg_32, Reg_33 |
| Topic 9 (WUA) | 5 | WUA_11b, WUA_16, WUA_17, WUA_20, WUA_20a | Content moved to new HLR IDs (WUA_21–25) |
| Topic 10 (Issuance) | 4 | ISSU_22a, ISSU_22b, ISSU_32, ISSU_33, ISSU_58, ISSU_60 | Metadata/access cert requirements dropped or consolidated |
| Topic 28 (Legal Person PID) | 3 | LP_01, LP_02, LP_03 | **Entire topic content deferred** |
| Topic 12 (Attestation Rulebooks) | 2 | ARB_27, ARB_32 | QEAA/PuB-EAA rulebook and JSON Schema requirements dropped |
| Topic 38 (Revocation) | 1 | WURevocation_02 | WUA possession requirement dropped |
| Topic 40 (Installation/Activation) | 1 | WIAM_11 | Content moved to WPSM_04 (Topic 56) |
| Others | 5 | RPA_02a, ACP_06, DASH_12 (old ID, moved to new), RPRC_02, W2W_18, PAD_06 | Various |

---

## 6. Direct Impact on VCQ/RCA Configuration

**13 HLR references** in our VCQ configuration are affected:

### `vcq/requirements/core.yaml` (3 impacts)

| HLR | Status | Action |
|-----|--------|--------|
| `RPA_02a` | **Emptied** | Was: "RP SHALL include access certs by value, not reference." Requirement withdrawn. **Remove or annotate as deprecated.** |
| `Reg_15` | **Emptied** | Was: ACA revocation method via cert policy. Content may be in ETSI standards now. **Review and update.** |
| `Reg_31` | **Emptied** | Was: Access cert naming requirement. Content moved to Reg_32 (text modified). **Update reference to Reg_32.** |

### `vcq/requirements/issuer.yaml` (8 impacts)

| HLR | Status | Action |
|-----|--------|--------|
| `ISSU_22a` | **Emptied** | Was: PID Provider metadata signing requirement. **Remove reference.** |
| `ISSU_22b` | **Emptied** | Was: Access cert in metadata requirement. **Remove reference.** |
| `ISSU_32` | **Emptied** | Was: Attestation Provider access cert in metadata. **Remove reference.** |
| `Reg_14` | **Emptied** | Was: CT logging via cert policy. **Remove or update reference.** |
| `WUA_11b` | **Emptied** | Was: WIA verification during issuance. Content moved elsewhere. **Update reference.** |
| `WUA_20` | **Emptied** | Content moved to `WUA_21` (new AS-WP-09-025). **Update reference to WUA_21.** |
| `WUA_20a` | **Emptied** | Content moved to new AS-WP-09-026. **Update reference.** |
| `WURevocation_18` | **Removed** | Renumbered to new Harmonized ID AS-WP-38-018. Same Old ID. **Update Harmonized ID reference if used.** |
| `WURevocation_19` | **Removed** | Renumbered to new Harmonized ID AS-WP-38-019. Same Old ID. **Update Harmonized ID reference if used.** |

### `vcq/requirements/trust_services.yaml` (1 impact)

| HLR | Status | Action |
|-----|--------|--------|
| `Reg_13` | **Emptied** | Was: CT logging requirement via cert policy. **Review and update.** |

---

## 7. Recommended Upgrade Steps

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

### Phase 2: Update VCQ/RCA references

For each of the 13 affected references:

1. Open the relevant YAML file
2. Find the HLR reference
3. For **emptied** HLRs: determine if content moved to a new HLR (update reference) or was withdrawn (remove reference + update explanation)
4. For **removed** HLRs (WURevocation_18/19): update Harmonized ID to new format
5. Run `node scripts/build-vcq.js` to verify no broken references
6. Verify the portal renders correctly

### Phase 2.5: Migrate VCQ references from Old IDs to Harmonized IDs

> **Rationale:** VCQ YAML files currently use **Old IDs** (e.g., `ISSU_29`, `RPI_01`, `WUA_20a`) in `arfReference.hlr` fields. Old IDs are not stable across ARF versions — when HLRs are renumbered (like Topic 38's `AS-WP` → `EW-DM` restructuring), the Old ID stays but the Harmonized ID changes. Using Harmonized IDs makes references **version-pinned and unambiguous**.

**Data flow affected:**
```
VCQ YAML (arfReference.hlr) → build-vcq.js → vcq-data.json → VendorQuestionnaire.jsx (ARFReferenceLink)
                                                                     ↕
                                              arf-hlr-data.json (byHlrId index) → popover + deep link
```

**Steps:**

1. **Generate a mapping table** of Old ID → Harmonized ID from the v2.8.0 CSV:
   ```bash
   # Extract from the CSV: Index (Old ID) → Harmonized_ID
   python3 -c "
   import csv, io
   with open('03_arf/hltr/high-level-requirements.csv', 'r', encoding='utf-8-sig') as f:
       reader = csv.DictReader(f, delimiter=';')
       for row in reader:
           print(f\"{row['Index']} → {row['Harmonized_ID']}\")
   "
   ```
2. **Update all VCQ YAML files** — replace `hlr: <Old_ID>` with `hlr: <Harmonized_ID>`:
   - `config/vcq/requirements/core.yaml` (28 arfReferences)
   - `config/vcq/requirements/issuer.yaml` (36 arfReferences)
   - `config/vcq/requirements/trust_services.yaml` (4 arfReferences)
   - `config/vcq/requirements/intermediary.yaml` (20 arfReferences)
3. **Update `validate-vcq-arf.js`** — change validation lookup from `hlrId` (Old ID) to `harmonizedId`:
   ```js
   // Before:
   const validHlrIds = new Set(arf.requirements.map(r => r.hlrId));
   // After:
   const validHlrIds = new Set(arf.requirements.map(r => r.harmonizedId));
   ```
4. **Update `build-vcq.js`** — ensure the ARF data lookup uses `byHlrId` or add `byHarmonizedId` index
5. **Update `import-arf.js`** — ensure `byHlrId` index accommodates Harmonized IDs (or add a parallel `byHarmonizedId` index)
6. **Update the ARFReferenceLink component** in `VendorQuestionnaire.jsx` — ensure the `arfData.byHlrId[hlrId]` lookup works with Harmonized IDs
7. **Run validation:** `node scripts/validate-vcq-arf.js` — all references should resolve
8. **🔒 COMMIT:** `feat: migrate VCQ ARF references from Old IDs to Harmonized IDs`

**Scope:** 88 `arfReference` entries across 4 YAML files. Only entries with a non-empty `hlr:` field need updating (currently ~20 have populated `hlr:` values).

### Phase 3: Review new HLRs for coverage gaps

Assess whether any of the 43 new HLRs create requirements that should be reflected in VCQ/RCA:

1. **Topic 56 (WPSM):** New Wallet Provider maintenance requirements — potentially relevant for vendor questionnaire if vendor is a Wallet Provider
2. **Topic 10 (ISSU_64–73):** New ETSI policy/certification requirements for issuers — **likely needs new VCQ requirements**
3. **Topic 11 (PA_23–31):** Pseudonym rate-limiting — primarily Wallet Provider scope, may need RP requirements if RPs request pseudonyms
4. **Topic 38 (revocation restructuring):** Verify all references still point to correct HLRs
5. **Topic 20 (SUA_06, SUA_07):** Wallet UI rendering for SCA — relevant to our SCA/SUA work

### Phase 3.5: Validate deep links

> **Rationale:** Every HLR in `arf-hlr-data.json` has a `deepLink` field — a clickable URL that appears in the VCQ popover (`ARFReferenceLink` component, line 701 in `VendorQuestionnaire.jsx`). These links use anchor fragments from `arf-config.yaml` → `topicAnchors`. The v2.8.0 release changed the Annex 2 heading format (`SUBCATEGORY` → `TOPIC`), which likely **changes the anchor slugs** on GitHub.

**Current link format:**
```
https://github.com/.../blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a231-topic-1---accessing-online-services-with-a-wallet-unit
```

**Affected components:**
- `config/arf/arf-config.yaml` → `topicAnchors` (defines anchor slugs for 15 topics)
- `scripts/import-arf.js` → `processRequirements()` (builds `deepLink` from base URL + anchor)
- `public/data/arf-hlr-data.json` → ~1400 deep links in output JSON
- `VendorQuestionnaire.jsx` → `ARFReferenceLink` renders these as `<a href>` tags

**Note:** Deep links only appear in VCQ — confirmed RCA has no `arfReference` fields.

**Steps:**

1. **Fetch the v2.8.0 Annex 2 by-topic document** and extract all heading anchors:
   ```bash
   curl -sL "https://raw.githubusercontent.com/.../v2.8.0/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md" \
     | grep '^#' | head -60
   ```
2. **Compare with current `topicAnchors`** in `arf-config.yaml` — identify any that changed
3. **Add new entries:**
   - Topic 56 (Wallet Provider Support and Maintenance) — needs new anchor
   - Any other new topics from v2.8.0
4. **Update `arf-config.yaml`** with corrected anchor slugs
5. **Consider pinning `baseUrl` to `blob/v2.8.0`** instead of `blob/main`:
   ```yaml
   # Before:
   baseUrl: ".../blob/main/docs/annexes/annex-2"
   # After:
   baseUrl: ".../blob/v2.8.0/docs/annexes/annex-2"
   ```
   This ensures links remain valid even if `main` moves to v2.9.0 later.
6. **Rebuild ARF data:** `npm run build:arf`
7. **Create/run a link validation script** (one-time check, can be manual):
   ```bash
   # Extract unique deep links and check HTTP status
   python3 -c "
   import json, urllib.request
   with open('public/data/arf-hlr-data.json') as f:
       data = json.load(f)
   links = set(r['deepLink'] for r in data['requirements'] if r.get('deepLink'))
   # Check a sample (full check would be slow due to rate limiting)
   for link in sorted(links)[:5]:
       print(link)
   "
   ```
   For anchor validation: download the target `.md` file once, parse all anchors, and cross-check.
8. **Verify in browser:** Open VCQ, hover over an ARF badge, click "View in ARF →" — should scroll to correct section.
9. **🔒 COMMIT:** `fix: update ARF deep link anchors for v2.8.0 heading format`

### Phase 4: Rebuild and validate

1. Rebuild ARF: `npm run build:arf`
2. Rebuild terminology: `node scripts/build-terminology.js`
3. Rebuild VCQ: `node scripts/build-vcq.js`
4. Rebuild RCA: `node scripts/build-rca.js`
5. Run validator: `node scripts/validate-vcq-arf.js`
6. Run portal locally: `npm run dev`
7. Spot-check terminology, VCQ, and RCA pages
8. Verify ARF popover deep links in browser
9. Commit and push

### Phase 5: Document decisions

1. Add a DECISIONS.md entry for the upgrade (e.g., DEC-29x)
2. Add a DECISIONS.md entry for Harmonized ID migration (e.g., DEC-29y)
3. Update TRACKER.md with the upgrade log entry
4. Update any references to ARF version in docs (search for "2.7.3")
5. Update `arf-config.yaml` version comment to reflect v2.8.0

---

## 8. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Local annotations in discussion-topics lost during overwrite | Medium | Diff before overwrite; merge manually |
| VCQ requirements referencing emptied HLRs become orphaned | High | Phase 2 addresses this directly |
| New ETSI requirements (ISSU_67–73) not covered by VCQ | Medium | Phase 3 gap analysis |
| Topic 56 creates vendor obligations not in VCQ | Low | Only relevant if vendor is Wallet Provider (most are not in VCQ scope) |
| Legal Person PID (Topic 28) entirely deferred | Low | If we have LP-related requirements, flag as deferred |
| Deep links 404 after v2.8.0 heading format change | High | Phase 3.5: validate all `topicAnchors` against actual v2.8.0 headings |
| Old IDs silently point to wrong content after renumbering | Medium | Phase 2.5: migrate all `arfReference.hlr` to Harmonized IDs |
| `blob/main` links break when `main` moves to v2.9.0 | Medium | Phase 3.5: pin `baseUrl` to `blob/v2.8.0` tag |

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
