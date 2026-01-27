# Session Context
<!-- MAX 100 LINES -->

## Current State

- **Focus**: PSD2 SCA Compliance Assessment — Deep-dive evidence and terminology
- **Next**: Continue refinements (review remaining articles or integrate into docs-portal)
- **Status**: ✅ v4.5 complete (40/40 requirements)
- **Phase**: PSD2 SCA Compliance Assessment v4.5

## Key Files

- `.agent/research/psd2-sca-compliance/PSD2_SCA_COMPLIANCE_ASSESSMENT.md` — Main assessment (v4.5, 40/40)
- `.agent/research/psd2-sca-compliance/sources/32018R0389.md` — PSD2 RTS (local, use for lookups)
- `.agent/research/psd2-sca-compliance/reference-impl/` — iOS/Android wallet source for evidence

## What Was Done This Session

1. **v4.4 — Deep-dive evidence** (Art. 22(2)(b-c)):
   - PIN storage: Android AES-GCM code samples, iOS Keychain
   - Private key non-extractability: WIAM_20, WUA_09 HLR quotes
   - Platform comparison tables

2. **v4.5 — Terminology cross-reference**:
   - PSD2→EUDIW mapping table (PSC, Authentication Code, Dynamic Linking → KB-JWT)
   - VP Token = Authentication Code visual diagram

3. **EUR-Lex link audit**:
   - Fixed Art. 2(2) anchor: `#002.001` → `#002.002`
   - Deleted phantom Art. 97(4) (doesn't exist in PSD2)
   - Verified all 45 remaining links correct

## Document Structure (v4.5)

| Part | Content | RTS Articles |
|------|---------|--------------|
| Part I | PSD2 Directive | Article 97(1-3) |
| Part II | SCA Authentication (Usage) | 1-9 |
| Part III | SCA Attestation Lifecycle (Issuance/Binding) | 22-27 |
| Part IV | Appendices | — |

## Terminology Section

New cross-reference table (lines ~160-198) maps:
- **PSC** → SCA Attestation + Private Key
- **Authentication Code** → VP Token (KB-JWT)
- **Dynamic Linking** → `transaction_data_hashes` in KB-JWT

## Confirmed Gaps (Unchanged)

| Gap | Article | Details |
|-----|---------|---------|
| **PIN error disclosure** | Art. 4(3)(a) | Ref impl shows "Pins do not match" |
| **Multi-payee batch** | Art. 5(3)(b) | TS12 only supports single payee |

## Commits This Session

- `d5c2fda`: docs: add deep-dive evidence for credential storage (Art. 22(2)(b-c))
- `d8d81bd`: docs: add PSD2→EUDIW terminology cross-reference (v4.5)
- `abe8653`: fix: correct EUR-Lex anchor for Article 2(2)
- `a1c63bb`: fix: remove invalid EUR-Lex link for phantom Article 97(4)
- `8cc49ea`: fix: delete phantom Article 97(4) section entirely

## Potential Next Actions

1. **Remaining articles**: Review if any other article deep-dives needed
2. **Cross-link to docs-portal**: Integrate into documentation portal
3. **KI sync**: Update eudi_wallet_banking_compliance if needed

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Assessment at: .agent/research/psd2-sca-compliance/PSD2_SCA_COMPLIANCE_ASSESSMENT.md
```
