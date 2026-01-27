# Deep-Dive Tracker: PSD2 SCA Compliance Assessment

**Created**: 2026-01-27  
**Purpose**: Track paragraph-level deep-dive completion

---

## What Qualifies as a Deep-Dive?

A real deep-dive must include **at least 3** of:
- [ ] Detailed context explanation (>50 lines)
- [ ] ASCII diagram or flowchart
- [ ] Threat model table
- [ ] Reference implementation code evidence
- [ ] Gap analysis with recommendations
- [ ] Collapsible `<details>` section

---

## PART A: SCA CREDENTIAL ISSUANCE (RTS Art. 22-27)

### Article 22 — Confidentiality and Integrity

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 22(1) | PSC confidentiality during all phases | ✅ Yes |
| Art. 22(2)(a) | Masked credential input | ❌ No |
| Art. 22(2)(b) | No plaintext storage | ✅ Yes |
| Art. 22(2)(c) | Protected cryptographic material | ✅ Yes |
| Art. 22(3) | Documented key management | ❌ No |
| Art. 22(4) | Secure processing environment | ❌ No |

### Article 23 — Creation and Transmission

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 23 | Secure creation, mitigate loss/theft/copying risks | ❌ No |

### Article 24 — Association with User

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 24(1) | Secure association | ❌ No |
| Art. 24(2)(a) | Secure binding environment | ❌ No |
| Art. 24(2)(b) | SCA for remote binding | ✅ Yes |

### Article 25 — Delivery

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 25 | Secure delivery | ❌ No |

### Article 26 — Renewal

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 26 | Renewal follows Art. 23-25 procedures | ❌ No |

### Article 27 — Destruction/Revocation

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 27(a) | Secure destruction/deactivation/revocation | ❌ No |
| Art. 27(b) | Secure re-use | ❌ No |
| Art. 27(c) | Deactivation in systems | ❌ No |

---

## PART B: TRANSACTION AUTHENTICATION (RTS Art. 1-9, PSD2 Art. 97)

### PSD2 Article 97 — Authentication

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 97(1) | SCA triggers (account access, payments, high-risk) | ✅ Yes |
| Art. 97(2) | Dynamic linking requirement | ✅ Yes |

### Article 2 — General Authentication Requirements

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 2(1) | Transaction monitoring mechanisms | ✅ Yes |
| Art. 2(2) | Risk-based factors for monitoring | ✅ Yes |

### Article 3 — Review of Security Measures

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 3(1) | Documented, tested, audited measures | ❌ No |
| Art. 3(2) | Audit frequency, TRA exemption audit | ❌ No |
| Art. 3(3) | Audit report availability | ❌ No |

### Article 4 — Authentication Code

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 4(1) | Two+ elements generating auth code, one-time use | ✅ Yes |
| Art. 4(2)(a) | No info derivable from auth code | ✅ Yes |
| Art. 4(2)(b) | No code re-generation from prior code | ✅ Yes |
| Art. 4(2)(c) | Forgery resistance | ✅ Yes |
| Art. 4(3)(a) | Non-disclosure of which element was incorrect | ✅ Yes |
| Art. 4(3)(b) | Maximum attempts and lockout | ✅ Yes |
| Art. 4(3)(c) | Session protection | ✅ Yes |
| Art. 4(3)(d) | Session timeout (5 min) | ✅ Yes |

### Article 5 — Dynamic Linking

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 5(1) | General requirement (intro) | ❌ No |
| Art. 5(1)(a) | Payer awareness of amount + payee | ✅ Yes |
| Art. 5(1)(b) | Auth code linked to amount + payee | ✅ Yes |
| Art. 5(1)(c) | PSP verification before acceptance | ✅ Yes |
| Art. 5(1)(d) | Auth code invalidation on change | ✅ Yes |
| Art. 5(2) | Security measures (confidentiality, integrity, authenticity) | ✅ Yes |
| Art. 5(3)(a) | Batch file payment exception intro | ❌ No |
| Art. 5(3)(b) | Batch authentication code | ❌ No |

### Article 6 — Knowledge Elements

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 6(1) | Mitigate uncovering/disclosure | ✅ Yes |
| Art. 6(2) | Mitigation measures | ✅ Yes |

### Article 7 — Possession Elements

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 7(1) | Mitigate unauthorized use | ✅ Yes |
| Art. 7(2) | Prevent replication | ❌ No |

### Article 8 — Inherence Elements

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 8(1) | Low probability of unauthorized auth | ✅ Yes |
| Art. 8(2) | Resistance against unauthorized use | ❌ No |

### Article 9 — Independence of Elements

| Paragraph | Description | Done? |
|-----------|-------------|-------|
| Art. 9(1) | Breach of one doesn't compromise others | ✅ Yes |
| Art. 9(2) | Multi-purpose device risk mitigation | ✅ Yes |
| Art. 9(3) | Mitigating measures (TEE, attestation, revocation) | ✅ Yes |

---

## Summary

| Status | Count |
|--------|-------|
| ✅ Done | 29 |
| ❌ Not Done | 18 |
| **Total** | 47 |

---

## Execution Log

| Date | Paragraph | Notes |
|------|-----------|-------|
| 2026-01-27 | — | Created paragraph-level tracker |
| 2026-01-27 | Art. 6(1) | Deep-dive: EBA guidance, threat model, NIST comparison, ASCII flow, gaps K-1 to K-4 |
| 2026-01-27 | Art. 8(1) | Deep-dive: FAR thresholds, ISO 30107-3 PAD, FIDO cert, biometric classes, gaps I-1 to I-5 |
| 2026-01-27 | Art. 7(1) | Deep-dive: WSCD/WSCA architecture, hardware security, key attestation, gaps P-1 to P-5 |
| 2026-01-27 | Art. 22(1) | Deep-dive: PSC lifecycle phases, NIST/ENISA alignment, threat model, gaps PSC-1 to PSC-4 |
| 2026-01-27 | Art. 9(1) | Deep-dive: Breach isolation, attack scenarios, multi-purpose device risks, gaps IND-1 to IND-4 |
| 2026-01-27 | Art. 2(1) | Deep-dive: Fraud detection architecture, TRA link, wallet signals, gaps TM-1 to TM-4 |
| 2026-01-27 | Art. 4(2)(a) | Deep-dive: Disclosed vs. protected, SD-JWT selective disclosure, amr analysis, gaps FD-1 to FD-3 |
| 2026-01-27 | Art. 4(2)(b) | Deep-dive: ECDSA random nonce, jti uniqueness, replay prevention, gaps CR-1 to CR-3 |
| 2026-01-27 | Art. 4(2)(c) | Deep-dive: Trust chain, ECDLP hardness, verification flow, hardware security, gaps FR-1 to FR-3 |
| 2026-01-27 | Art. 4(3)(c) | Deep-dive: OID4VP session binding, TLS layers, hijacking prevention, gaps SP-1 to SP-4 |
| 2026-01-27 | Art. 4(3)(d) | Deep-dive: EBA exemptions, OWASP alignment, wallet vs PSP responsibility, gaps ST-1 to ST-4 |
| 2026-01-27 | Art. 2(2) | Deep-dive: Mandated risk factors (a-e), wallet data contributions, ML enhancement, gaps RF-1 to RF-4 |
| 2026-01-27 | Art. 9(2) | Deep-dive: Smartphone security architecture, isolation layers, FIDO alignment, gaps MPD-1 to MPD-4 |
| 2026-01-28 | Art. 6(2) | Deep-dive: Disclosure prevention arch, secure keyboard, NIST 800-63B, phishing, gaps DP-1 to DP-4 |

---

## How to Request a Deep-Dive

Say: **"Deep-dive Art. X(Y)(z)"**

Examples:
- "Deep-dive Art. 6(1)"
- "Deep-dive Art. 22(3)"
- "Deep-dive Art. 4(2)(a)"
