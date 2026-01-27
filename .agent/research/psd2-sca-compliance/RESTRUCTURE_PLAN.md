# PSD2 SCA Assessment Restructure Plan

> **Created**: 2026-01-27  
> **Purpose**: Add Issuance/Binding use case and clarify document scope  
> **Target**: `PSD2_SCA_COMPLIANCE_ASSESSMENT.md`

---

## Objective

Transform the assessment from a single-focus document (SCA usage) into a comprehensive two-phase compliance matrix covering:

1. **Issuance/Binding** — How SCA attestations are created and bound to users
2. **Usage/Authentication** — How SCA attestations are used during payments

---

## Phase Tracker

| Phase | Task | Status | Commit |
|-------|------|--------|--------|
| **1** | Add "Scope: Two SCA Use Cases" section | ⬜ Pending | — |
| **2** | Add use case summary table to Executive Summary | ⬜ Pending | — |
| **3** | Rename Part II → "Part II: SCA Authentication (Usage)" | ⬜ Pending | — |
| **4** | 🔒 COMMIT Phase 1-3 | ⬜ Pending | — |
| **5** | Add Part III header and introduction | ⬜ Pending | — |
| **6** | Add Article 22 (General PSC requirements) | ⬜ Pending | — |
| **7** | Add Article 23 (Credential creation) | ⬜ Pending | — |
| **8** | Add Article 24 (User association/binding) | ⬜ Pending | — |
| **9** | Add Article 25 (Delivery) | ⬜ Pending | — |
| **10** | Add Article 26 (Renewal) | ⬜ Pending | — |
| **11** | Add Article 27 (Revocation/Deactivation) | ⬜ Pending | — |
| **12** | 🔒 COMMIT Part III complete | ⬜ Pending | — |
| **13** | Update version history | ⬜ Pending | — |
| **14** | Update pending-task.md | ⬜ Pending | — |
| **15** | 🔒 FINAL COMMIT | ⬜ Pending | — |

---

## Phase 1-4: Document Structure (Scaffolding)

### Task 1: Add "Scope: Two SCA Use Cases" Section

**Location**: After "How to Use This Document" section, before "Executive Summary"

**Content to add**:
```markdown
## Scope: Two SCA Use Cases

This assessment covers **two distinct use cases** in the SCA attestation lifecycle:

| Use Case | Phase | Protocol | RTS Chapter | Wallet Role |
|----------|-------|----------|-------------|-------------|
| **Issuance/Binding** | PSP issues SCA attestation to wallet | OID4VCI | Chapter IV (Art. 22-27) | Key generation, secure storage, user authentication for binding |
| **Usage/Authentication** | User authenticates during payment | OID4VP | Chapter II (Art. 4-9) | SCA execution, factor validation, authentication code generation |

### Use Case 1: Issuance/Binding

The PSP (as **Issuer**) creates an SCA attestation and binds it to the user:

1. User requests SCA attestation from PSP
2. Wallet generates key pair in WSCA/WSCD (Secure Enclave)
3. User authenticates to prove identity (SCA required for remote binding)
4. PSP issues attestation bound to wallet's public key
5. Wallet stores attestation securely

**Relevant RTS Articles**: 22, 23, 24, 25, 26, 27
**ARF Topics**: PSP_* (attestation issuance), WIAM_* (wallet management)

### Use Case 2: Usage/Authentication

The PSP (as **Relying Party/Verifier**) requests SCA during a payment:

1. PSP sends authorization request with transaction data
2. Wallet displays transaction to user
3. User authenticates (PIN/biometric)
4. Wallet generates KB-JWT with transaction_data_hashes
5. Wallet returns VP Token (authentication code)
6. PSP verifies and processes payment

**Relevant RTS Articles**: 4, 5, 6, 7, 8, 9
**ARF Topics**: SUA_* (strong user authentication), RPA_* (relying party)
```

### Task 2: Update Executive Summary

**Add after existing summary table**:
```markdown
**Use Case Coverage**:

| Use Case | Coverage | Part |
|----------|----------|------|
| **Issuance/Binding** | Articles 22-27 | Part III |
| **Usage/Authentication** | Articles 4-9 | Part II |
```

### Task 3: Rename Part II Header

**Change**:
```markdown
# Part II: PSD2 RTS (2018/389)
```

**To**:
```markdown
# Part II: SCA Authentication (Usage)

> *This part covers RTS Articles 1-9: the security measures for SCA execution during payments.*
```

---

## Phase 5-12: Part III Content (Issuance/Binding)

### Part III Structure

```markdown
# Part III: SCA Attestation Lifecycle (Issuance/Binding)

> *This part covers RTS Articles 22-27: the security requirements for credential creation, association, delivery, and management.*

## Chapter IV — Confidentiality and Integrity of PSC

### [Article 22] — General requirements
### [Article 23] — Creation and transmission of credentials
### [Article 24] — Association with the payment service user
### [Article 25] — Delivery of credentials
### [Article 26] — Renewal of personalised security credentials
### [Article 27] — Destruction, deactivation and revocation
```

### Article Mapping Reference

| RTS Article | Wallet Responsibility | ARF HLR | Evidence |
|-------------|----------------------|---------|----------|
| **22(1)** | Confidentiality of PSC during auth | WIAM_14, WIAM_20 | WSCA/WSCD isolation |
| **22(2)(a)** | Masked credential input | Device PIN entry | iOS/Android secure keyboard |
| **22(2)(b)** | No plaintext storage | WIAM_20 | Keychain/KeyStore encryption |
| **22(2)(c)** | Protected crypto material | WUA_09 | Non-extractable keys |
| **22(3)** | Documented key management | — | PSP responsibility |
| **22(4)** | Secure processing environment | WSCD certification | CIR 2024/2981 |
| **23** | Secure credential creation | WUA_09, WIAM_20 | Key gen in Secure Enclave |
| **24(1)** | User-only association | WIAM_09 | Per-Wallet Unit isolation |
| **24(2)(a)** | Secure binding environment | WIA_*, PSP_* | OID4VCI over TLS |
| **24(2)(b)** | SCA for remote binding | WIAM_14 | User auth before issuance |
| **25** | Secure delivery | OID4VCI | TLS + attestation activation |
| **26** | Secure renewal | — | Re-issuance flow |
| **27(a-c)** | Revocation | WURevocation_* | Wallet Provider revocation |

---

## Source References

**RTS Full Text**: `.agent/research/psd2-sca-compliance/sources/32018R0389.md`

**Key Line Numbers** (for extraction):
- Article 22: Lines 348-361
- Article 23: Lines 363-369
- Article 24: Lines 371-380
- Article 25: Lines 381-397
- Article 26: Lines 398-402
- Article 27: Lines 404-412

---

## Validation Checklist

Before marking complete:

- [ ] All 6 articles (22-27) have dedicated sections
- [ ] Each article has: quote, fulfillment table, status, context
- [ ] ARF HLR references are linked (GitHub URLs)
- [ ] Reference implementation evidence where applicable
- [ ] No EUR-Lex lookups (use local sources only)
- [ ] Version history updated
- [ ] Pending task cleared

---

## Risk Notes

1. **Articles 22-27 are less wallet-specific** than Articles 4-9. Some requirements (e.g., Art. 22(3) documentation) are purely PSP obligations.

2. **OID4VCI issuance flow** is less detailed in TS12 v1.0 compared to OID4VP presentation flow. Evidence may be thinner.

3. **Reference implementation** may not have issuance-specific code — the reference apps are primarily presentation-focused.
