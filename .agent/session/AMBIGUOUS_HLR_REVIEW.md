# Ambiguous HLR Review — VCQ-ARF Harmonization

> **Date:** 2026-01-28
> **Status:** Manual Review Required
> **Total HLRs:** 32

These HLRs were flagged as "multi_role_review" during the VCQ-ARF harmonization because they:
- Span multiple actors (Wallet Provider + RP/Issuer)
- Have vendor-relevant implications despite primary actor being non-vendor
- Require human judgment about VCQ inclusion

---

## Summary by Category

| Category | Count | Recommendation |
|----------|-------|----------------|
| Attestation & PID Providers | 6 | Mostly EXCLUDE (Issuer internal) |
| Data Models & Attestation Rules | 15 | Mostly EXCLUDE (Scheme Provider role) |
| Member States & Registrars | 3 | EXCLUDE (Government obligation) |
| Relying Parties | 4 | 2 INCLUDE, 2 EXCLUDE |
| Wallet Providers | 4 | 2 INCLUDE, 2 EXCLUDE |

---

## Detailed Analysis

### 🟢 INCLUDE in VCQ (6 HLRs)

These have clear vendor implementation implications:

#### 1. AS-AP-07-010 [Topic 7] — Revocation Checking
**Spec:** A Relying Party verifying an attestation SHOULD check whether that attestation has been revoked by the attestation Provider.

**Rationale:** Direct RP obligation. Vendors building RP integrations must implement revocation checking.
→ **Add to:** `rp.yaml` (new requirement: VEND-RP-xxx)

---

#### 2. AS-AP-07-011 [Topic 7] — Revocation Status Freshness
**Spec:** A Relying Party verifying an attestation SHOULD check that the revocation status is sufficiently fresh.

**Rationale:** Direct RP obligation for revocation freshness. Vendors must implement timestamp/freshness validation.
→ **Add to:** `rp.yaml` (new requirement: VEND-RP-xxx)

---

#### 3. AS-AP-07-021 [Topic 7] — Private Access Token Verification
**Spec:** A Relying Party using the Private Revocation Status Check mechanism SHALL collect Private Access Tokens and SHALL use them for verification.

**Rationale:** Implementation requirement for RP vendors using private revocation checks.
→ **Add to:** `rp.yaml` (new requirement: VEND-RP-xxx)

---

#### 4. AS-WP-11-013 [Topic 11] — Pseudonym + PID Binding Verification
**Spec:** If Wallet Unit is used to register a Pseudonym at a Relying Party in combination with a PID, attestation or WUA being presented to the same Relying Party, then this Relying Party SHALL be able to verify that the same User performed both actions.

**Rationale:** RP verification obligation. Vendors must implement cryptographic binding verification.
→ **Add to:** `rp.yaml` (new requirement: VEND-RP-xxx)

---

#### 5. EW-DM-12-030 [Topic 12] — PID Binding Requirement in Attestation Flows
**Spec:** The Scheme Provider for an Attestation Rulebook describing a type of attestation that is a QEAA, PuB-EAA, or non-qualified EAA SHOULD specify in the Rulebook whether a Relying Party receiving the attestation must request and verify a PID and verify the cryptographic binding between the PID and the attestation.

**Rationale:** While targeted at Scheme Providers, this creates an **indirect obligation for RPs** to implement PID binding verification when the Rulebook requires it. Vendors need awareness.
→ **Add to:** `rp.yaml` as awareness requirement (VEND-RP-xxx: "Support PID binding verification when required by attestation rulebook")

---

#### 6. AS-AP-42-008 [Topic 42] — OOTS Compatibility
**Spec:** The standards and procedures mentioned in AS-AP-42-007 SHOULD, whenever possible, be aligned and compatible with those used for the platforms implementing the Once Only Technical System (OOTS).

**Rationale:** TSP vendors accessing authentic sources should align with OOTS protocols. Implementation guidance for interoperability.
→ **Add to:** `tsp.yaml` (new requirement: VEND-TSP-xxx)

---

### 🔴 EXCLUDE from VCQ (26 HLRs)

These are appropriately excluded — primary obligation is on non-vendor entities:

#### Attestation Rulebook Requirements (11 HLRs)
All ARB_* requirements (EW-DM-12-010, EW-DM-12-011, EW-DM-12-018, EW-DM-12-020, EW-DM-12-022, EW-DM-12-024, EW-DM-12-029, EW-DM-12-032, EW-DM-12-034, EW-DM-12-035) are **Scheme Provider** obligations, not vendor implementation requirements.

**Exclusion Reason:** `rulebook_author` — These define what a Rulebook should contain, not what vendors must implement. Move from `multi_role_review` to `rulebook_author` category.

---

#### Issuance HLRs (6 HLRs)

| HLR | Spec Summary | Exclusion Reason |
|-----|--------------|------------------|
| AS-AP-10-004 | Attestation Provider revocation upon issuing new instance | Wallet Provider internal process |
| AS-AP-10-010 | PID Provider revocation upon data change/death | PID Provider internal process |
| AS-AP-10-016 | PID Provider revocation upon User request | PID Provider internal process |
| AS-AP-10-080 | Binding creation between PID and QC | Wallet Provider + QTSP internal |
| AS-AP-10-088 | Certificate activation keys binding | Wallet Provider + QTSP internal |
| AS-AP-10-092 | Certificate binding to PID holder | Wallet Provider + QTSP internal |

**Exclusion Reason:** Move to `wallet_provider` — All are Wallet/PID Provider internal operations, not vendor-facing requirements.

---

#### Trust List Publication (3 HLRs)

| HLR | Spec Summary | Exclusion Reason |
|-----|--------------|------------------|
| EW-DM-31-002 | Publish over secure channel | **Consumer** of trust lists, not publisher |
| EW-DM-31-003 | No auth required for retrieval | Infrastructure requirement |
| EW-DM-31-004 | Signed/sealed format | Publisher obligation |

**Exclusion Reason:** Move to `member_state` — Trust list publication is a Member State/Commission obligation.

---

#### Registration & Certificate Policy (3 HLRs)

| HLR | Spec Summary | Exclusion Reason |
|-----|--------------|------------------|
| AS-MS-27-019 | Certificate Policy profile spec | Policy author obligation |
| AS-MS-27-021 | Change history requirements | Policy author obligation |
| EW-DM-44-009 | EU-wide unique identifier consistency | Registrar obligation |

**Exclusion Reason:** Already in `member_state` — Correctly categorized.

---

#### Wallet-Only Obligations (4 HLRs)

| HLR | Spec Summary | Exclusion Reason |
|-----|--------------|------------------|
| AS-WP-06-016 | MAY indicate device-bound attestation | Wallet Unit UI (MAY = optional) |
| AS-WP-16-018 | External SCA returns outcome to Wallet | Wallet Provider internal flow |
| AS-WP-16-026 | External SCA supports ETSI TS 119 101 | **RP providing SCA** — edge case |
| AS-MS-31-018 | Trusted List format requirements | Member State publication |

**Notes:**
- AS-WP-06-016: MAY = no vendor obligation
- AS-WP-16-018: Wallet internal workflow
- AS-WP-16-026: Edge case for RPs providing Signature Creation Applications — could be included if we cover TSP/RP hybrids
- AS-MS-31-018: Already excluded as member_state

---

## Recommended Actions

### 1. Add 6 New VCQ Requirements

Create new requirements in the appropriate YAML files:

```yaml
# config/vcq/requirements/rp.yaml - Add 4 new requirements

- id: VEND-RP-045
  text: "Implement attestation revocation status checking"
  category: security
  criticality: should
  arfReference:
    hlr: AS-AP-07-010
    topic: 7

- id: VEND-RP-046
  text: "Validate revocation status freshness (age check)"
  category: security
  criticality: should
  arfReference:
    hlr: AS-AP-07-011
    topic: 7

- id: VEND-RP-047
  text: "Support Private Access Token collection and verification for private revocation status checks"
  category: implementation
  criticality: shall
  arfReference:
    hlr: AS-AP-07-021
    topic: 7

- id: VEND-RP-048
  text: "Verify cryptographic binding between Pseudonym registration and PID/attestation presentation by same User"
  category: security
  criticality: shall
  arfReference:
    hlr: AS-WP-11-013
    topic: 11

- id: VEND-RP-049
  text: "Support PID binding verification when attestation rulebook requires cryptographic binding check"
  category: implementation
  criticality: should
  arfReference:
    hlr: EW-DM-12-030
    topic: 12
```

```yaml
# config/vcq/requirements/tsp.yaml - Add 1 new requirement

- id: VEND-TSP-XXX
  text: "Align authentic source access protocols with Once Only Technical System (OOTS) standards where applicable"
  category: interoperability
  criticality: should
  arfReference:
    hlr: AS-AP-42-008
    topic: 42
```

### 2. Update Exclusion Registry

Move HLRs to correct exclusion categories:

```yaml
# Move from multi_role_review to rulebook_author:
- EW-DM-12-010, EW-DM-12-011, EW-DM-12-018, EW-DM-12-020, EW-DM-12-022, EW-DM-12-024, EW-DM-12-029, EW-DM-12-032, EW-DM-12-034, EW-DM-12-035

# Move from multi_role_review to wallet_provider:
- AS-AP-10-004, AS-AP-10-010, AS-AP-10-016, AS-AP-10-080, AS-AP-10-088, AS-AP-10-092
- AS-WP-06-016, AS-WP-16-018

# Move from multi_role_review to member_state:
- EW-DM-31-002, EW-DM-31-003, EW-DM-31-004, AS-MS-31-018

# Keep in multi_role_review for manual review:
- AS-WP-16-026 (RP providing SCA — niche case)
```

### 3. Final Resolution

| Disposition | Count |
|-------------|-------|
| ✅ Added to VCQ | 6 |
| → rulebook_author | 10 |
| → wallet_provider | 8 |
| → member_state | 7 |
| ⚠️ Remaining ambiguous | 1 (AS-WP-16-026) |

**Coverage Impact:**
- VCQ Requirements: 144 → **150** (+6)
- Unique HLRs covered: 134 → **140** (+6)
- Resolution Rate: 92.4% → **94.9%** (+2.5%)
- Remaining ambiguous: 32 → **1**

---

## Next Steps

1. [ ] Review this analysis with user
2. [ ] Add 5 new requirements to rp.yaml
3. [ ] Add 1 new requirement to tsp.yaml
4. [ ] Update hlr-exclusions.yaml categories
5. [ ] Run validate:vcq-arf to confirm counts
6. [ ] Commit with message: "feat(vcq): resolve 31/32 ambiguous HLRs (DEC-260)"
