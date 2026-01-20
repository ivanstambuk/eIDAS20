---
description: Semantic mapping of requirements to specific use cases
---

# Use Case Mapping Audit

Use this workflow to analyze each requirement and determine if it applies to all use cases or only specific ones.

**Decision Record:** DEC-088 (Use Case Semantic Mapping Methodology)

---

## 🚨 CRITICAL RULES

### Rule 1: NO Keyword/Grep Matching

❌ **FORBIDDEN:**
```bash
# DO NOT DO THIS
grep "signature" requirements.yaml  # Wrong approach
```

✅ **REQUIRED:**
Read each requirement, its legal basis, and determine semantically whether it's use-case-specific.

### Rule 2: Escalate Ambiguity — Never Guess

If you are **not certain** whether a requirement maps to a specific use case:
1. Mark it as `escalate` in the tracker
2. Continue with other requirements
3. Present all escalations to user at the end of the phase

### Rule 3: Document Every Decision

Every requirement MUST have a documented decision with rationale, even if the decision is "keep `all`".

---

## Use Cases Reference (19 total — FINAL)

| ID | Name | Category |
|----|------|----------|
| `pid-online` | PID-based identification in online services | core |
| `pseudonym` | Use of a pseudonym in online services | core |
| `esignature` | eSignature | core |
| `payment-auth` | Online payment authorisation | banking |
| `open-bank-account` | Open bank account | banking |
| `mdl` | Mobile Driving Licence (mDL) | travel |
| `dtc` | Digital Travel Credential (DTC) | travel |
| `epc` | European Parking Card (EPC) | travel |
| `vrc` | Vehicle Registration Certificate (VRC) | travel |
| `disability-card` | European Disability Card | health |
| `eprescription` | e-Prescription | health |
| `ehic` | European Health Insurance Card (EHIC) | health |
| `public-warnings` | Public warnings | health |
| `age-verification` | Age verification | consumer |
| `ticket-pass` | Ticket or pass | consumer |
| `edu-credentials` | Educational credentials | education |
| `student-card` | European student card | education |
| `proximity-id` | Identification in proximity scenarios | identification |
| `representation` | Natural or legal person representation | legal |

---

## Step 0: Select Target Role

Choose ONE role to audit per session:

| Role | File | Req Count |
|------|------|-----------|
| `wallet_provider` | `wallet-provider.yaml` | ~132 |
| `relying_party` | `relying-party.yaml` | ~91 |
| `trust_service_provider` | `trust-service-provider.yaml` | ~85 |
| `eaa_issuer` | `issuer.yaml` | ~42 |
| `conformity_assessment_body` | `conformity-assessment-body.yaml` | ~36 |
| `pid_provider` | `pid-provider.yaml` | ~30 |
| `supervisory_body` | `supervisory-body.yaml` | ~42 |

---

## Step 1: Create Mapping Tracker

Create `docs-portal/config/rca/USE_CASE_MAPPING_{ROLE}.md`:

```markdown
# Use Case Mapping Tracker: {Role Name}

**Date started:** {YYYY-MM-DD}
**Decision record:** DEC-088

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Mapped — decision recorded |
| 🔄 | Escalated — awaiting user input |

## Mapping Progress

| Req ID | Current | Decision | Rationale |
|--------|---------|----------|-----------|
| WP-PROV-001 | all | all | Universal provision obligation |
| WP-FUNC-008 | all | esignature | Only needed for signing use case |
| WP-FUNC-003 | all | 🔄 ESCALATE | Pseudonym: also age-verification? |

## Escalation Queue

Requirements requiring user decision:

### 1. WP-FUNC-003: Pseudonym generation
**Current:** `all`
**Question:** Should this also map to `age-verification`?
**Context:** Pseudonym generation enables privacy-preserving identity, which is also core to age verification without revealing full identity.
**Options:**
- (a) `[pseudonym]` only
- (b) `[pseudonym, age-verification]`
- (c) Keep `all`

**User Decision:** ___________
```

---

## Step 2: Load Requirements

```bash
# Load the role's requirements file
cat docs-portal/config/rca/requirements/{role}.yaml
```

Create a list of all requirement IDs to process.

---

## Step 3: Semantic Analysis (Requirement by Requirement)

For EACH requirement, ask:

> **"Does this requirement ONLY make sense when implementing a specific use case, or is it a universal obligation regardless of what the wallet/RP/TSP is used for?"**

### Decision Flowchart

```
Is this requirement about:
│
├─► Security, data protection, GDPR, operational?
│   └─► Likely UNIVERSAL (all)
│
├─► Signature, seal, QES, QSCD?
│   └─► Likely esignature
│
├─► Pseudonym, unlinkability, anonymous?
│   └─► Likely pseudonym (maybe also age-verification?)
│
├─► Driving, vehicle, mDL?
│   └─► Likely mdl
│
├─► Health, prescription, medical?
│   └─► Likely eprescription, ehic, disability-card
│
├─► Payment, SCA, PSD2, bank?
│   └─► Likely payment-auth, open-bank-account
│
├─► Student, education, diploma?
│   └─► Likely edu-credentials, student-card
│
├─► Travel, border, passport, DTC?
│   └─► Likely dtc
│
├─► Representation, legal person, mandate?
│   └─► Likely representation
│
└─► Unclear / Could apply to multiple?
    └─► ESCALATE to user
```

### Recording Each Decision

For each requirement, add a row to the tracker:

```markdown
| WP-SEC-001 | all | all | Assurance level high applies to all wallet functions |
```

Or if changing:

```markdown
| WP-FUNC-008 | all | [esignature] | QES creation only for signing use case |
```

Or if escalating:

```markdown
| WP-DP-005 | all | 🔄 ESCALATE | Privacy-preserving techniques: pseudonym only or also age-verification? |
```

---

## Step 4: Present Escalations

After processing all requirements, present escalations to user:

```markdown
## Escalation Summary

I've analyzed {N} requirements for {Role}. Found {M} requiring your decision:

### Escalation 1: WP-FUNC-003
**Requirement:** "Support pseudonym generation and encrypted local storage"
**Current mapping:** `all`
**My analysis:** Clearly relevant to `pseudonym` use case. But age verification also uses privacy-preserving techniques to prove age without revealing identity.
**Options:**
- (a) `[pseudonym]` — strict interpretation
- (b) `[pseudonym, age-verification]` — include privacy-related use cases  
- (c) Keep `all` — universal requirement

Which option?

### Escalation 2: ...
```

Wait for user responses before proceeding.

---

## Step 5: Apply Mappings

After all decisions are made:

1. Update the YAML file:

```yaml
# Before
useCases: all

# After (if changed)
useCases:
  - esignature
```

2. Increment `schemaVersion` in the YAML file

3. Rebuild RCA:
```bash
cd docs-portal && npm run build:rca
```

---

## Step 6: Finalize Tracker

Update summary in the tracker:

```markdown
## Summary

| Metric | Value |
|--------|-------|
| Total requirements | 132 |
| Mapped as `all` | 118 |
| Mapped to specific use cases | 14 |
| Escalated | 0 (all resolved) |
| Schema version | V7 |

**Date completed:** 2026-01-20
```

---

## Phased Execution

You don't need to complete all roles in one session. Suggested order:

| Phase | Role | Est. Duration |
|-------|------|---------------|
| 1 | Wallet Provider (largest) | 1-2 sessions |
| 2 | Relying Party | 1 session |
| 3 | Trust Service Provider | 1 session |
| 4 | EAA Issuer | <1 session |
| 5 | CAB, PID, Supervisory | <1 session |

---

## Anti-Patterns to Avoid

❌ **Never use grep/keyword matching** — This is semantic analysis, not text search

❌ **Never guess on ambiguous cases** — Always escalate

❌ **Never skip requirements** — Every requirement needs a decision

❌ **Never batch multiple requirements without reading each** — One at a time

❌ **Never assign use cases without considering legal context** — Read the legalBasis field

---

## Completion Checklist

Before claiming a role's use case audit is complete:

- [ ] Every requirement has a row in the mapping tracker
- [ ] No 🔄 ESCALATE items remaining (all resolved by user)
- [ ] YAML file updated with new mappings
- [ ] Schema version incremented
- [ ] `npm run build:rca` successful
- [ ] Summary statistics updated in tracker
