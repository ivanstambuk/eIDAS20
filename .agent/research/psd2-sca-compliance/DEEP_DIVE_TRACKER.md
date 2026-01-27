# Deep-Dive Tracker: PSD2 SCA Compliance Assessment

**Created**: 2026-01-27
**Status**: Planning
**Purpose**: Track which sections have deep-dive analysis vs cursory treatment

---

## Legend

| Indicator | Meaning | Line Threshold |
|-----------|---------|----------------|
| ✅ **Deep-dive** | Comprehensive analysis with diagrams, tables, code examples, threat models | >150 lines |
| 🟡 **Moderate** | Basic analysis with tables and implementation evidence | 50-150 lines |
| 🔴 **Cursory** | Minimal treatment, needs deep-dive | <50 lines |

---

## Section Analysis

### PART A: SCA CREDENTIAL ISSUANCE (Binding Phase)

| Section | Article(s) | Lines | Status | Notes |
|---------|------------|-------|--------|-------|
| **§4.1 General Requirements** | RTS Art. 22 | 207 | ✅ Deep-dive | Has 🔍 PIN Storage & Key Non-Extractability deep-dives |
| **§4.2 Creation & Transmission** | RTS Art. 23 | 29 | 🔴 Cursory | Needs deep-dive: OID4VCI flow, threat model |
| **§4.3 Association with User** | RTS Art. 24 | 58 | 🟡 Moderate | Could add: KYC integration, bootstrap SCA flow |
| **§4.4 Secure Delivery** | RTS Art. 25 | 22 | 🔴 Cursory | Needs deep-dive: TLS requirements, attestation activation |
| **§4.5 Renewal** | RTS Art. 26 | 27 | 🔴 Cursory | Needs deep-dive: key rotation, attestation refresh |
| **§4.6 Destruction/Revocation** | RTS Art. 27 | 75 | 🟡 Moderate | Could add: revocation flows, status list |

---

### PART B: TRANSACTION AUTHENTICATION (Usage Phase)

| Section | Article(s) | Lines | Status | Notes |
|---------|------------|-------|--------|-------|
| **§5.1 When SCA is Required** | PSD2 Art. 97(1) + RTS Art. 1 | 205 | ✅ Deep-dive | Trigger tables, exemption overview, responsibility matrix |
| **§6.1 Authentication Code** | RTS Art. 4 | 350 | ✅ Deep-dive | Factor validation, lockout, session timeout |
| **§6.2 Knowledge Element** | RTS Art. 6 | 39 | 🔴 Cursory | Needs deep-dive: PIN complexity, entropy, recovery |
| **§6.3 Possession Element** | RTS Art. 7 | 50 | 🟡 Moderate | Could add: key lifecycle, migration, revocation |
| **§6.4 Inherence Element** | RTS Art. 8 | 45 | 🔴 Cursory | Needs deep-dive: biometric FAR/FRR, liveness detection |
| **§6.5 Independence** | RTS Art. 9 | 112 | ✅ Deep-dive | Multi-purpose device mitigations |
| **§7 Dynamic Linking** | PSD2 Art. 97(2) + RTS Art. 5 | 939 | ✅ Deep-dive | WYSIWYS, threat model, TPP flows, batch payments |
| **§8.1 Security Measures** | RTS Art. 2 | 41 | 🔴 Cursory | Needs deep-dive: transaction monitoring signals |
| **§8.2 Periodic Review** | RTS Art. 3 | 47 | 🔴 Cursory | Needs deep-dive: audit requirements, TRA exemption |

---

## Priority Queue for Deep-Dives

Based on regulatory importance and current coverage gaps:

| Priority | Section | Article | Rationale | Estimated Effort |
|----------|---------|---------|-----------|------------------|
| **P1** | §6.2 Knowledge Element | RTS Art. 6 | PIN is critical user-facing element | Medium |
| **P2** | §6.4 Inherence Element | RTS Art. 8 | Biometric security often under-specified | Medium |
| **P3** | §4.2 Creation & Transmission | RTS Art. 23 | OID4VCI flow needs documentation | Medium |
| **P4** | §4.4 Secure Delivery | RTS Art. 25 | Attestation activation often overlooked | Low |
| **P5** | §4.5 Renewal | RTS Art. 26 | Key rotation important for long-term security | Medium |
| **P6** | §8.1 Security Measures | RTS Art. 2 | Transaction monitoring is PSP concern but wallet signals matter | Medium |
| **P7** | §8.2 Periodic Review | RTS Art. 3 | Audit requirements for TRA exemption | Low |

---

## What a Deep-Dive Should Include

For each section needing enhancement, a full deep-dive should have:

1. **Regulatory Text Quote**: Full legal requirement text
2. **Implementation Table**: | Fulfillment | Reference | Implementation |
3. **Status Badge**: ✅ Supported / ⚠️ Partial / ❌ Gap
4. **Context Section**: Explanation of how EUDI Wallet meets requirement
5. **ASCII Diagram/Flowchart**: Visual representation of flow
6. **Threat Model Table**: Attack vectors and mitigations
7. **Reference Implementation Evidence**: Code snippets or file references
8. **Gap Analysis**: Any identified gaps with recommendations
9. **Recommendations**: Suggestions for SCA Attestation Rulebook

---

## Execution Log

| Date | Section | Action | Result |
|------|---------|--------|--------|
| 2026-01-27 | — | Created tracker | ✅ |
| | | | |

---

## How to Request a Deep-Dive

Say: "Deep-dive into §X.Y [Section Name]"

Example: "Deep-dive into §6.2 Knowledge Element"
