# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: PSD2 SCA Compliance Assessment — Two Use Case Model complete
- **Next**: Sync to KI OR address remaining refinements
- **Status**: ✅ Complete (v4.3 — 40/40 requirements)
- **Phase**: PSD2 SCA Compliance Assessment v4.3

## Key Files

- `.agent/research/psd2-sca-compliance/PSD2_SCA_COMPLIANCE_ASSESSMENT.md` — Main assessment (v4.3, 40/40 validated)
- `.agent/research/psd2-sca-compliance/RESTRUCTURE_PLAN.md` — Tracker for v4.3 restructure
- `.agent/research/psd2-sca-compliance/sources/32015L2366.md` — PSD2 Directive (local)
- `.agent/research/psd2-sca-compliance/sources/32018R0389.md` — PSD2 RTS (local)
- `.agent/research/psd2-sca-compliance/reference-impl/` — iOS/Android wallet source

## What Was Done This Session

1. **COMPLETE — Two Use Case Model**: Added "Scope: Two SCA Use Cases" section
   - **Issuance/Binding** (OID4VCI): Articles 22-27
   - **Usage/Authentication** (OID4VP): Articles 1-9
2. **COMPLETE — Part III**: SCA Attestation Lifecycle (Issuance/Binding)
   - Article 22: General PSC requirements (22(1), 22(2)(a-c), 22(3), 22(4))
   - Article 23: Credential creation
   - Article 24: User association/binding
   - Article 25: Delivery
   - Article 26: Renewal
   - Article 27: Revocation/Deactivation
3. **COMPLETE — Appendices renumbered**: Part III → Part IV
4. **COMPLETE — Executive Summary updated**: 26 wallet compliant, 40/40 requirements
5. **COMPLETE — PIN disclosure remediation**: Art. 4(3)(a) detailed guidance added

## Document Structure

| Part | Content | RTS Articles |
|------|---------|--------------|
| Part I | PSD2 Directive | Article 97 |
| Part II | SCA Authentication (Usage) | 1-9 |
| Part III | SCA Attestation Lifecycle (Issuance/Binding) | 22-27 |
| Part IV | Appendices | — |

## Confirmed Compliance Gaps (Unchanged)

| Gap | Article | Details |
|-----|---------|---------|
| **PIN error disclosure** | Art. 4(3)(a) | Ref impl shows "Pins do not match" — REMEDIATION GUIDANCE ADDED |
| **Multi-payee batch** | Art. 5(3)(b) | TS12 only supports single payee |

## Commits Made

- `4969e86`: docs: add two SCA use cases scope (Issuance/Binding + Usage/Authentication)
- `1f47249`: docs: add Part III — SCA Attestation Lifecycle (Articles 22-27)

## Local Source Paths (DO NOT LOOK UP EUR-LEX)

- PSD2 Directive: `.agent/research/psd2-sca-compliance/sources/32015L2366.md`
- PSD2 RTS: `.agent/research/psd2-sca-compliance/sources/32018R0389.md`

## Potential Next Actions

1. **Update KI** — Sync finalized v4.3 to `eudi_wallet_banking_compliance` KI
2. **Cross-link to docs-portal** — Integrate assessment into documentation portal (if in scope)
3. **Review Articles 10-17** — SCA exemptions (PSP-side, likely out of scope for wallet)

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Assessment is at .agent/research/psd2-sca-compliance/PSD2_SCA_COMPLIANCE_ASSESSMENT.md
```
