# Use Case Mapping Audit — Complete Summary

> **Status:** ✅ Complete | All 7 phases finished 2026-01-20
> 
> **Methodology:** DEC-088 + DEC-088 Addendum (Infrastructure Universalism)

---

## Executive Summary

| Statistic | Value |
|-----------|-------|
| **Total Requirements** | 458 |
| **Use-Case-Specific** | 15 (3.3%) |
| **Roles Audited** | 7 |
| **Phases Completed** | 7/7 |

---

## Key Finding: Infrastructure Universalism

The audit discovered a fundamental distinction between two role types:

| Role Type | Roles | Use Case Specificity |
|-----------|-------|----------------------|
| **Service-Facing** | Wallet Provider, Relying Party | ~15% use-case-specific |
| **Infrastructure** | TSP, Issuer, PID, CAB, SB | 100% universal |

**Why Infrastructure Roles Are Universal:**
- Their obligations govern HOW to operate (certification, auditing, oversight)
- NOT what services are provided or what use cases are supported
- A TSP's security requirements apply whether they issue signatures, seals, or timestamps

---

## Phase-by-Phase Results

### Phase 1: Wallet Provider (Service-Facing)

| Requirement Count | Use-Case-Specific | Changes |
|-------------------|-------------------|---------|
| 132 | 14 (10.6%) | 14 remapped |

**Key Findings:**
- Trust services (eSignature): 6 requirements
- Pseudonym handling: 3 requirements  
- Travel credentials (mDL, DTC): 3 requirements
- Payment authentication: 1 requirement
- Representation: 1 requirement

**Tracker:** `USE_CASE_MAPPING_WP.md`

---

### Phase 2: Relying Party (Service-Facing)

| Requirement Count | Use-Case-Specific | Changes |
|-------------------|-------------------|---------|
| 91 | 1 (1.1%) | 1 remapped |

**Key Change:**
- `RP-PRV-009` (Accept pseudonymous access): `all` → `[pseudonym]`
- Based on Recital 60 which specifically addresses pseudonymous access scenarios

**Tracker:** `USE_CASE_MAPPING_RP.md`

---

### Phase 3: Trust Service Provider (Infrastructure)

| Requirement Count | Use-Case-Specific | Changes |
|-------------------|-------------------|---------|
| 85 | 0 | ✅ All correct |

**Rationale:** TSP requirements govern provider obligations (certification, governance, security, transparency). They apply universally regardless of trust service type.

**Tracker:** `USE_CASE_MAPPING_TSP.md`

---

### Phase 4: EAA Issuer (Infrastructure)

| Requirement Count | Use-Case-Specific | Changes |
|-------------------|-------------------|---------|
| 42 | 0 | ✅ All correct |

**Rationale:** EAA Issuers are credential providers. Their obligations (issuance formats, revocation, privacy) apply regardless of attestation type.

**Tracker:** `USE_CASE_MAPPING_ISSUER.md`

---

### Phase 5: PID Provider (Infrastructure)

| Requirement Count | Use-Case-Specific | Changes |
|-------------------|-------------------|---------|
| 30 | 0 | ✅ All correct |

**Rationale:** PID is the foundational identity layer — a prerequisite for virtually all wallet use cases. Therefore inherently universal.

**Tracker:** `USE_CASE_MAPPING_PID.md`

---

### Phase 6: Conformity Assessment Body (Infrastructure)

| Requirement Count | Use-Case-Specific | Changes |
|-------------------|-------------------|---------|
| 36 | 0 | ✅ All correct |

**Rationale:** CABs audit service providers, not end-user services. Requirements define HOW to conduct audits (accreditation, reporting, surveillance).

**Tracker:** `USE_CASE_MAPPING_CAB.md`

---

### Phase 7: Supervisory Body (Infrastructure)

| Requirement Count | Use-Case-Specific | Changes |
|-------------------|-------------------|---------|
| 42 | 0 | ✅ All correct |

**Rationale:** SBs are regulatory oversight bodies. Their requirements cover HOW to supervise (enforcement, cooperation, reporting) — service-agnostic.

**Tracker:** `USE_CASE_MAPPING_SB.md`

---

## Use Cases With Specific Requirements

Only 4 of 19 use cases have requirements specifically mapped to them:

| Use Case | Requirements |
|----------|--------------|
| `esignature` | 6 from WP |
| `pseudonym` | 3 from WP + 1 from RP |
| `mdl` + `dtc` | 3 from WP (travel credentials) |
| `payment-auth` | 1 from WP |
| `representation` | 1 from WP |

The remaining 14 use cases are covered by universal requirements only.

---

## Future Audit Guidance

Based on DEC-088 Addendum:

1. **Service-Facing Roles (WP, RP):** Require full semantic analysis for use case mapping
2. **Infrastructure Roles (TSP, Issuer, PID, CAB, SB):** Can assume universal unless legal text explicitly mentions specific use cases
3. **When in doubt:** Escalate to user rather than guessing

---

## Individual Tracker Files

| Role | File | Requirements |
|------|------|--------------|
| Wallet Provider | `USE_CASE_MAPPING_WP.md` | 132 |
| Relying Party | `USE_CASE_MAPPING_RP.md` | 91 |
| Trust Service Provider | `USE_CASE_MAPPING_TSP.md` | 85 |
| EAA Issuer | `USE_CASE_MAPPING_ISSUER.md` | 42 |
| PID Provider | `USE_CASE_MAPPING_PID.md` | 30 |
| CAB | `USE_CASE_MAPPING_CAB.md` | 36 |
| Supervisory Body | `USE_CASE_MAPPING_SB.md` | 42 |

---

*Generated: 2026-01-20*
