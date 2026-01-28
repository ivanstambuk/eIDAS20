# Reference Implementation Evidence Audit Plan

**Created**: 2026-01-28 03:33 CET
**Document**: `PSD2_SCA_COMPLIANCE_ASSESSMENT.md`
**Goal**: Replace pseudo-code/platform API references with actual EUDI Wallet source code links

---

## Overview

The document contains **15 sections** labeled "Reference Implementation Evidence" that currently show:
- Generic platform API names (iOS Keychain, Android Keystore)
- No actual links to EUDI Wallet source code

This plan audits each section and either:
1. ✅ **LINK** — Replace with actual linked EUDI Wallet code
2. ⚠️ **RELABEL** — Rename to "Platform Security Foundation" (if no EUDI code exists but section is valuable)
3. ❌ **REMOVE** — Delete section (if no evidence and section adds no value)

---

## Reference Implementation Inventory

| Repository | Source Files | Commit Hash |
|------------|-------------|-------------|
| **iOS** `eudi-app-ios-wallet-ui` | 325 Swift files | `055bdda8b2a74d9df4892e7cf702479ac75f6ca6` |
| **Android** `eudi-app-android-wallet-ui` | 339 Kotlin files | `48311b4de1a0d2be57874824ea68a5e0914765e4` |

### Key Security Files Identified

| Platform | File | Purpose | Lines |
|----------|------|---------|-------|
| **iOS** | `KeyChainController.swift` | Keychain storage, biometry validation | L75-80 (accessibility policy) |
| **iOS** | `KeychainPinStorageProvider.swift` | PIN storage | Already linked (L30-31) |
| **iOS** | `SystemBiometryController.swift` | Biometric authentication | Already linked (L97-126) |
| **iOS** | `PinTextFieldView.swift` | PIN input UI | Already linked (L172-175) |
| **Android** | `KeystoreController.kt` | Key generation, user auth | L90-118 (generateSecretKey) |
| **Android** | `PrefsPinStorageProvider.kt` | PIN encryption | Already linked (L57-72) |
| **Android** | `BiometricsAvailability.kt` | Biometric check | Already linked (L36-58) |
| **Android** | `PinScreen.kt` | PIN input UI | Already linked (L282-292) |

---

## Audit Plan: 15 Sections

### Section 1: PSC Confidentiality (Line 336)
**Context**: Article 22(2)(b) — Confidentiality of personalized security credentials
**Current Content**: Platform APIs (kSecAttr, AndroidKeyStore)
**Real Evidence Exists?**: ✅ YES
- iOS: `KeyChainController.swift` L75-80 (`.accessibility(.whenPasscodeSetThisDeviceOnly)`)
- Android: `KeystoreController.kt` L90-118 (`setUserAuthenticationRequired(true)`)
**Action**: ✅ LINK — Replace with actual GitHub URLs

---

### Section 2: Key Management Documentation (Line 764)
**Context**: Article 22(3) — Key management documentation
**Current Content**: Documentation artifacts table (no code)
**Real Evidence Exists?**: ❌ NO — This is about documentation, not code
**Action**: ⚠️ RELABEL — Rename to "Documentation Requirements" (no code to link)

---

### Section 3: Factor Derivation Protection (Line 2411)
**Context**: Article 4(2)(a) — No factor info from auth code disclosure
**Current Content**: Platform APIs (SecKeyCreateSignature, SE isolation)
**Real Evidence Exists?**: ⚠️ PARTIAL — Key management is in `KeystoreController.kt`
**Action**: ✅ LINK — Link to key generation code, or ⚠️ RELABEL if insufficient

---

### Section 4: Code Re-generation Prevention (Line 2602)
**Context**: Article 4(2)(b) — Cannot forge new auth code from previous
**Current Content**: Platform APIs (hardware RNG)
**Real Evidence Exists?**: ⚠️ PARTIAL — Crypto operations in `CryptoController.kt`
**Action**: Need to check `CryptoController.kt` for signature generation

---

### Section 5: Signature APIs (Line 2801)
**Context**: Article 4(2)(c) — Cannot forge signature
**Current Content**: Platform APIs (SecKeyVerifySignature, Signature.verify())
**Real Evidence Exists?**: ⚠️ PARTIAL — Check for signature verification code
**Action**: Need to check for signature handling in presentation flow

---

### Section 6: Session Protection (Line 3170)
**Context**: Article 4(3) — Communication session security
**Current Content**: Session protection mechanisms
**Real Evidence Exists?**: Need to check for TLS/session handling
**Action**: Need to search for session/TLS code

---

### Section 7: Session Timeout (Line 3352)
**Context**: Article 4(4)(d) — Session timeout requirements
**Current Content**: Unknown
**Real Evidence Exists?**: Need to check
**Action**: Need to search for timeout handling

---

### Section 8: Knowledge Element (Line 3484)
**Context**: Article 8 — PIN/password requirements
**Current Content**: PIN handling
**Real Evidence Exists?**: ✅ YES — PIN files already identified
**Action**: ✅ LINK — Use existing PIN file links

---

### Section 9: Knowledge Disclosure Protection (Line 3679)
**Context**: Article 8(2) — Protect knowledge element from disclosure
**Current Content**: BiometricPrompt fallback
**Real Evidence Exists?**: ✅ YES — `BiometricsAvailability.kt`, `SystemBiometryController.swift`
**Action**: ✅ LINK — Link to biometric controllers

---

### Section 10: Anti-Cloning/Replication (Line 4054)
**Context**: Article 8(3)(a) — PSC not replicable
**Current Content**: Platform APIs (SE, StrongBox, key attestation)
**Real Evidence Exists?**: ✅ YES — `KeystoreController.kt`
**Action**: ✅ LINK — Link to key generation with hardware binding

---

### Section 11: Inherence Element (Line 4236)
**Context**: Article 8 — Biometric requirements
**Current Content**: Platform APIs (LAContext, BiometricPrompt)
**Real Evidence Exists?**: ✅ YES — Biometric controllers
**Action**: ✅ LINK — Link to `SystemBiometryController.swift`, `BiometricsAvailability.kt`

---

### Section 12: Template Protection (Line 4425)
**Context**: Article 8(3)(b) — Biometric template protection
**Current Content**: Platform APIs (LocalAuthentication, SE path)
**Real Evidence Exists?**: ⚠️ PARTIAL — Biometric controllers exist but template storage is OS-level
**Action**: ⚠️ RELABEL — Rename to "OS-Level Biometric Protection" (template storage is not in app code)

---

### Section 13: Independence of Elements (Line 4588)
**Context**: Article 9 — SCA factors must be independent
**Current Content**: Separation mechanisms
**Real Evidence Exists?**: ✅ YES — PIN and biometric are separate controllers
**Action**: ✅ LINK — Link to separate PIN and biometric files

---

### Section 14: Multi-Purpose Device (Line 4752)
**Context**: Article 9(2) — Multi-purpose device security
**Current Content**: Unknown
**Real Evidence Exists?**: Need to check
**Action**: Need to search for device context/isolation code

---

### Section 15: Risk Factors (Line 6596)
**Context**: Article 2(1)(d) — Risk-based authentication
**Current Content**: Unknown
**Real Evidence Exists?**: Need to check
**Action**: Need to search for risk assessment code

---

## Execution Plan

### Phase 1: Quick Wins (5-10 min each)
Sections where evidence clearly exists:
1. **Section 1** (PSC Confidentiality) — Link to KeyChainController, KeystoreController
2. **Section 8** (Knowledge Element) — Link to PIN files
3. **Section 9** (Knowledge Disclosure) — Link to biometric controllers
4. **Section 10** (Anti-Cloning) — Link to KeystoreController hardware binding
5. **Section 11** (Inherence Element) — Link to biometric controllers
6. **Section 13** (Independence) — Link to separate controllers

### Phase 2: Investigation Required (10-15 min each)
Sections needing source code search:
7. **Section 3** (Factor Derivation) — Check CryptoController
8. **Section 4** (Code Re-generation) — Check signature flow
9. **Section 5** (Signature APIs) — Check presentation verification
10. **Section 6** (Session Protection) — Check TLS/session code
11. **Section 7** (Session Timeout) — Check timeout handling
12. **Section 14** (Multi-Purpose Device) — Check device isolation
13. **Section 15** (Risk Factors) — Check risk assessment

### Phase 3: Relabel or Remove
Sections with no applicable code:
14. **Section 2** (Key Management Documentation) — RELABEL
15. **Section 12** (Template Protection) — RELABEL

---

## Next Steps

Start with **Phase 1, Section 1** (PSC Confidentiality at line 336).
