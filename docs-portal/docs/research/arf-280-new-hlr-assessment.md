# ARF v2.8.0 New HLR Coverage Gap Assessment

**Date:** 2026-02-10
**Phase:** 3 of ARF v2.8.0 upgrade
**Scope:** Assess 43 new HLRs for VCQ coverage gaps

---

## Assessment Methodology

For each new HLR group, assess:
1. **Vendor relevance:** Does it apply to RP/Issuer vendors (our VCQ audience)?
2. **Existing coverage:** Is the concept already covered by an existing VCQ requirement?
3. **Gap verdict:** New requirement needed? Existing requirement update? No action?

---

## 1. Topic 56 — Wallet Provider Support & Maintenance (4 new HLRs)

| HLR | Old ID | Summary | Actor |
|-----|--------|---------|-------|
| AS-WP-56-001 | WPSM_01 | Monitor installed base for maintenance | Wallet Provider |
| AS-WP-56-002 | WPSM_02 | Write custom crash logs | Wallet Provider |
| AS-WP-56-003 | WPSM_03 | Monitor security posture of Wallet Instances | Wallet Provider |
| AS-WP-56-004 | WPSM_04 | Update Wallet Unit for security/functionality | Wallet Provider |

**Current VCQ coverage:** None (Topic 56 is new)

### Verdict: ⬜ NO ACTION — Out of VCQ scope

**Rationale:** All 4 HLRs target **Wallet Providers** exclusively. The VCQ questionnaire covers RP vendors and Issuer vendors — not Wallet Providers. WPSM_04 duplicates content previously in WIAM_12 (Topic 40, now emptied), which was also Wallet Provider scope.

> 💡 **Future consideration:** If the VCQ expands to cover Wallet Provider vendors, these would need a dedicated section.

---

## 2. Topic 10 — New ETSI Issuance Requirements (10 new HLRs)

| HLR | Old ID | Summary | Actor | VCQ Impact |
|-----|--------|---------|-------|------------|
| AS-AP-10-090 | ISSU_64 | Batch issuance support (mandatory) | PID/Attestation Provider + Wallet Unit | ⚠️ EXISTING |
| AS-AP-10-091 | ISSU_65 | Re-issuance to same Wallet Unit verification | PID/Attestation Provider | ⚠️ EXISTING |
| AS-AP-10-092 | ISSU_66 | Empty | — | ❌ SKIP |
| AS-AP-10-093 | ISSU_67 | PID Provider NCP+ policy compliance (ETSI EN 319 411-1) | PID Provider | 🔴 NEW |
| AS-AP-10-094 | ISSU_68 | PID Provider signing cert ETSI TS 119 412-6 Clause 4 | PID Provider | 🔴 NEW |
| AS-AP-10-095 | ISSU_69 | QEAA Provider policy compliance (QCP-l+) | QEAA Provider | 🔴 NEW |
| AS-AP-10-096 | ISSU_70 | QEAA Provider signing cert ETSI TS 119 412-6 Clause 7 | QEAA Provider | 🔴 NEW |
| AS-AP-10-097 | ISSU_71 | Non-qualified EAA signing cert ETSI TS 119 412-6 Clause 6 | EAA Provider | 🔴 NEW |
| AS-AP-10-098 | ISSU_72 | PuB-EAA Provider NCP+ policy compliance | PuB-EAA Provider | 🔴 NEW |
| AS-AP-10-099 | ISSU_73 | PuB-EAA Provider signing cert ETSI TS 119 412-6 Clause 8 | PuB-EAA Provider | 🔴 NEW |

**Current VCQ coverage:**
- `VEND-ISS-008` covers batch issuance → ISSU_64 is already addressed
- `VEND-ISS-012` covers re-issuance workflows → ISSU_65 concept is partially addressed

### Verdict: 🔴 NEW VCQ REQUIREMENTS NEEDED

**Gap 1: ETSI policy compliance for issuers**
ISSU_67–73 introduce **new, concrete ETSI certification requirements** for all issuer types:
- PID Providers → NCP+ policy (ETSI EN 319 411-1) + cert profile (ETSI TS 119 412-6 §4)
- QEAA Providers → QCP-l+ policy + cert profile (§7)
- PuB-EAA Providers → NCP+ policy + cert profile (§8)
- Non-qualified EAA Providers → cert profile (§6)

**Recommended VCQ action:**
1. Create **VEND-ISS-042**: "Comply with applicable ETSI issuance policy (NCP+ or QCP-l+)"
   - Covers ISSU_67, ISSU_69, ISSU_72
   - Topic 10, HLRs: AS-AP-10-093, AS-AP-10-095, AS-AP-10-098
2. Create **VEND-ISS-043**: "Ensure signing certificates comply with ETSI TS 119 412-6"
   - Covers ISSU_68, ISSU_70, ISSU_71, ISSU_73
   - Topic 10, HLRs: AS-AP-10-094, AS-AP-10-096, AS-AP-10-097, AS-AP-10-099

**Gap 2: Re-issuance identity verification**
- ISSU_65 adds a specific SHALL requirement for re-issuance to the *same* Wallet Unit
- `VEND-ISS-012` mentions re-issuance but doesn't explicitly state the "same Wallet Unit" check
- **Recommended:** Update VEND-ISS-012 explanation to reference ISSU_65/AS-AP-10-091

**Gap 3: Batch issuance**
- ISSU_64 converts batch issuance from optional to mandatory (SHALL support)
- `VEND-ISS-008` already covers this → may need obligation upgrade from SHOULD to MUST
- **Recommended:** Update VEND-ISS-008 to reference AS-AP-10-090

---

## 3. Topic 11 — Pseudonym Rate-Limiting (9 new HLRs)

| HLR | Old ID | Summary | Actor | VCQ Impact |
|-----|--------|---------|-------|------------|
| AS-WP-11-024 | PA_23 | Rate-limited pseudonym crypto algorithms | Wallet Provider | ⬜ WP scope |
| AS-WP-11-025 | PA_24 | User pseudonym generation + RP registration | Wallet Unit + RP | ⚠️ Partial RP |
| AS-WP-11-026 | PA_25 | RP rate verification | RP | ⚠️ RP relevant |
| AS-WP-11-027 | PA_26 | RP scope/rate selection | RP | ⚠️ RP relevant |
| AS-WP-11-028 | PA_27 | Cross-RP unlinkability guarantee | Protocol | ⬜ Protocol |
| AS-WP-11-029 | PA_28 | Same-scope unlinkability (rate > 1) | Protocol | ⬜ Protocol |
| AS-WP-11-030 | PA_29 | Impersonation resistance | Protocol | ⬜ Protocol |
| AS-WP-11-031 | PA_30 | WSCA/WSCD key storage for pseudonyms | Wallet Unit | ⬜ WU scope |
| AS-WP-11-032 | PA_31 | Pseudonym persistence across Wallet Units | User/Wallet | ⬜ WU scope |

**Current VCQ coverage:**
- `VEND-CORE-033` covers pseudonym handling for RPs (PA_11, PA_12, PA_14, PA_16, PA_18)

### Verdict: ⚠️ MINOR UPDATE — Existing requirement might need note

**Rationale:** PA_25 and PA_26 are RP-relevant: when requesting rate-limited pseudonyms, the RP needs to specify scope/rate and verify the rate isn't exceeded. However:
- These are **future-looking** — rate-limited pseudonyms are not yet deployed
- The protocol implementations are Wallet Provider scope
- `VEND-CORE-033` already covers pseudonym handling from the RP side

**Recommended:** Add a note to `VEND-CORE-033` explanation mentioning the new rate-limiting HLRs (PA_25, PA_26) as an upcoming capability RPs will need to support. No new requirement needed yet.

---

## 4. Topic 38 — Revocation Restructuring (8 new HLRs)

| HLR | Old ID | Summary | Actor | VCQ Impact |
|-----|--------|---------|-------|------------|
| AS-WP-38-018 | WURevocation_18 | PID Provider mandatory cascading revocation | PID Provider | ✅ COVERED |
| AS-WP-38-019 | WURevocation_19 | Attestation Provider cascading policy | Attestation Provider | ✅ COVERED |
| EW-DM-38-012 | WURevocation_11 | Wallet revocation on PID provider request (death) | Wallet Provider | ⬜ WP scope |
| EW-DM-38-013 | WURevocation_12 | Verify PID provider is in LoTE before revoking | Wallet Provider | ⬜ WP scope |
| EW-DM-38-014 | WURevocation_13 | PID Provider revocation harm assessment | PID Provider | ⚠️ Issuer |
| EW-DM-38-015 | WURevocation_14 | Wallet Provider informs user within 24h | Wallet Provider | ⬜ WP scope |
| EW-DM-38-016 | WURevocation_15 | Empty | — | ❌ SKIP |
| EW-DM-38-017 | WURevocation_16 | Independent communication channel for revocation | Wallet Provider | ⬜ WP scope |

**Current VCQ coverage:**
- `VEND-ISS-041` covers WURevocation_18/19 (cascading revocation) — **already mapped**

### Verdict: ⚠️ MINOR UPDATE — Consider WURevocation_13 for issuers

**Rationale:**
- WURevocation_18/19 are already covered by VEND-ISS-041 ✅
- WURevocation_11–14 are the "restructured" versions of old WURevocation_11–14 (same Harmonized IDs, different Old IDs due to renumbering)
- WURevocation_13 (EW-DM-38-014) requires PID Providers to assess harm before requesting revocation — this is **Issuer-relevant** but very specific to the PID Provider → Wallet Provider interaction
- The remaining HLRs are Wallet Provider scope

**Recommended:** Add WURevocation_13/EW-DM-38-014 as a reference note in VEND-ISS-041's explanation, noting the harm assessment obligation. No new standalone requirement warranted — it's a procedural/policy concern, not a technical implementation requirement.

---

## 5. Topic 20 — Strong User Authentication for Payments (2 new HLRs)

| HLR | Old ID | Summary | Actor | VCQ Impact |
|-----|--------|---------|-------|------------|
| AS-WP-20-007 | SUA_06 | Wallet Unit SHALL render UI per TS12 specs | Wallet Unit | ⬜ WU scope |
| AS-WP-20-008 | SUA_07 | Wallet Unit SHALL validate transactional data | Wallet Unit | ⬜ WU scope |

**Current VCQ coverage:** None (Topic 20 not mapped to VCQ)

### Verdict: ⬜ NO ACTION — Out of VCQ scope

**Rationale:** Both HLRs target the **Wallet Unit** — they define how the wallet renders SCA dialogs and validates transactional data. These are implementation requirements for the wallet app itself, not for RP or Issuer vendors. Our VCQ audience builds RP connectors and issuance platforms, not wallet apps.

---

## 6. Other New HLRs (not listed in Phase 3 plan but reviewed)

### Topic 7: VCR_18 + VCR_19 (2 new HLRs)

| HLR | Old ID | Summary | Actor | VCQ Impact |
|-----|--------|---------|-------|------------|
| AS-AP-07-025 | VCR_18 | Herd privacy for status lists | PID/Attestation/Wallet Provider | ⚠️ Issuer |
| AS-AP-07-026 | VCR_19 | Wallet Unit should check revocation regularly | Wallet Unit | ⬜ WU scope |

**Verdict:** VCR_18 (herd privacy) is Issuer-relevant but very narrow — it's about having "sufficiently large" status lists. Consider adding a note to `VEND-ISS-013` or `VEND-ISS-036`. No new requirement.

### Topic 9: WUA_20a–WUA_25 (6 new HLRs)

- WUA_20a already mapped to VEND-ISS-031 ✅
- WUA_21 is empty ❌
- WUA_22–25 are Wallet Provider scope ⬜
- WUA_23 (crypto algorithms) is Wallet Provider/Wallet Unit focus ⬜

**Verdict:** No action needed.

### Topic 19: DASH_12 (1 new HLR)
- Wallet Unit UI requirement for data deletion requests
**Verdict:** ⬜ WU scope, no action.

### Topic 27: Reg_33 (1 new HLR)
- Empty
**Verdict:** ❌ SKIP.

---

## Summary Action Table

| Area | New VCQ Reqs | Updates to Existing | No Action |
|------|-------------|---------------------|-----------|
| Topic 56 (WPSM) | 0 | 0 | ✅ All WP scope |
| Topic 10 (ISSU_64–73) | **2** | 2 | 1 empty |
| Topic 11 (PA_23–31) | 0 | 1 (note) | 8 WP/protocol scope |
| Topic 38 (revocation) | 0 | 1 (note) | 6 WP scope + 1 empty |
| Topic 20 (SUA_06–07) | 0 | 0 | ✅ All WU scope |
| Topic 7 (VCR_18–19) | 0 | 1 (note) | 1 WU scope |
| Topic 9 (WUA_20a–25) | 0 | 0 | ✅ Already mapped |
| Topic 19, 27 | 0 | 0 | ✅ WU scope / empty |
| **TOTAL** | **2** | **4** | **37** |

### Concrete actions

1. **NEW: VEND-ISS-042** — ETSI issuance policy compliance (ISSU_67/69/72)
2. **NEW: VEND-ISS-043** — ETSI signing certificate compliance (ISSU_68/70/71/73)
3. **UPDATE: VEND-ISS-012** — Add ISSU_65 re-issuance reference + HLR AS-AP-10-091
4. **UPDATE: VEND-ISS-008** — Add ISSU_64 batch issuance reference + HLR AS-AP-10-090
5. **UPDATE: VEND-CORE-033** — Add note about rate-limited pseudonyms (PA_25, PA_26)
6. **UPDATE: VEND-ISS-041** — Add note about WURevocation_13 harm assessment
