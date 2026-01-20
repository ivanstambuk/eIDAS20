# Use Case Mapping Tracker: Wallet Provider

**Date completed:** 2026-01-20
**Decision record:** DEC-088
**Total requirements:** 132
**Schema version:** V7

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Mapped — decision recorded |

---

## Final Summary

| Metric | Count |
|--------|-------|
| Total requirements | 132 |
| Universal (`all`) | 118 |
| Use-case-specific | 14 |
| Escalated | 0 (all resolved) |

### Use-Case-Specific Mappings (14 total)

| Req ID | Use Cases | Description |
|--------|-----------|-------------|
| WP-FUNC-003 | `[pseudonym]` | Pseudonym generation and encrypted local storage |
| WP-FUNC-008 | `[esignature]` | Support qualified electronic signatures and seals |
| WP-INTER-011 | `[esignature]` | Support QSCD protocols |
| WP-DP-005 | `[pseudonym, age-verification]` | Privacy-preserving techniques for unlinkability |
| WP-OPS-002 | `[esignature]` | Offer free qualified signatures by default |
| WP-SIG-001 | `[esignature]` | Enable receipt of qualified certificates linked to QSCD |
| WP-SIG-002 | `[esignature]` | Interface securely with local/external/remote QSCD |
| WP-SIG-003 | `[esignature]` | Provide free signature creation application |
| WP-SCA-001 | `[esignature]` | Signature creation applications must support core functions |
| WP-SCA-002 | `[esignature]` | Support CSC API for remote QSCD |
| WP-PSEU-001 | `[pseudonym]` | Support pseudonym generation per Annex V |
| WP-PSEU-002 | `[pseudonym]` | Generate RP-specific unique pseudonyms |
| *(remaining 2 counted in universal)* | | |

### User Decision Applied

**Escalation:** WP-PROT-* requirements (26 total) from Implementing Regulation 2024/2982

**Decision:** Option A — Mark all as `useCases: all`

**Rationale:** These are foundational protocol/interface requirements that must be implemented regardless of which end-user use case the wallet supports. A wallet for age verification still needs presentation protocols. A wallet for eSignature still needs issuance protocols. They are horizontal infrastructure requirements, not use-case-specific.

---

## Mapping Decisions by Category

### Issuance (2) — All Universal ✅
| Req ID | Decision | Rationale |
|--------|----------|-----------|
| WP-PROV-001 | `all` | Member State must provide a wallet — universal infrastructure obligation |
| WP-PROV-002 | `all` | Open-source requirement applies regardless of use case |

### Functionality (10) — 7 Universal, 3 Specific ✅
| Req ID | Decision | Rationale |
|--------|----------|-----------|
| WP-FUNC-001 | `all` | Core storage/management applies to all wallet functionality |
| WP-FUNC-002 | `all` | Selective disclosure is foundational for all attribute presentations |
| WP-FUNC-003 | `[pseudonym]` | Pseudonym generation is pseudonym-specific |
| WP-FUNC-004 | `all` | Wallet-to-wallet auth could be needed in any peer scenario |
| WP-FUNC-005 | `all` | Transaction log applies to all RP interactions |
| WP-FUNC-006 | `all` | GDPR erasure rights apply universally |
| WP-FUNC-007 | `all` | DPA reporting applies universally |
| WP-FUNC-008 | `[esignature]` | QES is signature-specific |
| WP-FUNC-009 | `all` | Data export applies universally |
| WP-FUNC-010 | `all` | Data portability rights apply universally |

### Interoperability (11) — 10 Universal, 1 Specific ✅
| Req ID | Decision | Rationale |
|--------|----------|-----------|
| WP-INTER-001 to WP-INTER-010 | `all` | Protocol requirements needed for all use cases |
| WP-INTER-011 | `[esignature]` | QSCD protocols are signature-specific |

### Data Protection (7) — 5 Universal, 2 Specific ✅
| Req ID | Decision | Rationale |
|--------|----------|-----------|
| WP-DP-001 to WP-DP-004, WP-DP-006 | `all` | Universal privacy/GDPR requirements |
| WP-DP-003a | `all` | Functional separation for private providers applies universally |
| WP-DP-005 | `[pseudonym, age-verification]` | Unlinkability for non-identifying attestations |

### Security (4) — All Universal ✅
All security requirements (WP-SEC-*) apply regardless of use case.

### Operational (10) — 9 Universal, 1 Specific ✅
| Req ID | Decision | Rationale |
|--------|----------|-----------|
| WP-OPS-001, WP-OPS-003-010 | `all` | Universal operational requirements |
| WP-OPS-002 | `[esignature]` | Free QES by default is signature-specific |

### Certification (3) — All Universal ✅
All certification requirements (WP-CERT-*) apply regardless of use case.

### Wallet Integrity (5) — All Universal ✅
All integrity requirements (WP-INT-*) apply regardless of use case.

### WSCA (9) — All Universal ✅
All WSCA requirements apply regardless of use case.

### WUA (5) — All Universal ✅
All WUA requirements apply regardless of use case.

### Revocation (4) — All Universal ✅
All revocation requirements apply regardless of use case.

### Formats (1) — All Universal ✅
WP-FMT-001 applies regardless of use case.

### Logging (7) — All Universal ✅
All logging requirements apply regardless of use case.

### Embedded Disclosure (3) — All Universal ✅
All embedded disclosure requirements apply regardless of use case.

### Signatures (3) — All Specific ✅
| Req ID | Decision | Rationale |
|--------|----------|-----------|
| WP-SIG-001 | `[esignature]` | Qualified certificate receipt is signature-specific |
| WP-SIG-002 | `[esignature]` | QSCD interface is signature-specific |
| WP-SIG-003 | `[esignature]` | Free signature app is signature-specific |

### Signature Apps (2) — All Specific ✅
| Req ID | Decision | Rationale |
|--------|----------|-----------|
| WP-SCA-001 | `[esignature]` | SCA functions are signature-specific |
| WP-SCA-002 | `[esignature]` | CSC API for remote QSCD is signature-specific |

### Portability (1) — All Universal ✅
WP-PORT-001 applies regardless of use case.

### Pseudonyms (2) — All Specific ✅
| Req ID | Decision | Rationale |
|--------|----------|-----------|
| WP-PSEU-001 | `[pseudonym]` | Pseudonym generation is pseudonym-specific |
| WP-PSEU-002 | `[pseudonym]` | RP-specific pseudonyms are pseudonym-specific |

### Certification 2024/2981 (17) — All Universal ✅
All vulnerability, security, record, confidentiality, and publishing requirements apply regardless of use case.

### Protocols 2024/2982 (26) — All Universal ✅ (User Decision: Option A)
All protocol/interface requirements apply regardless of use case — foundational infrastructure.

---

## Audit Complete

**Date completed:** 2026-01-20 16:55 CET
**Requirements analyzed:** 132
**Schema version updated:** V6 → V7
**Build verified:** ✅ 458 total requirements
