# EC Use Case Analysis — Gap Analysis & Implementation Plan

> **Created:** 2026-02-19  
> **Last updated:** 2026-02-20T10:18:00+01:00  
> **Source:** https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/896827987/Use+case+manuals  
> **Purpose:** Living document — research findings + implementation tracker for synchronising our RCA/VCQ data with EC's official use case portal.  
> **Manual archive:** `.agent/research/use-case-manuals/` (11 PDFs + text extractions)

---

## Progress Summary

| Phase | Description | Steps | Status |
|-------|-------------|-------|--------|
| **Phase 1** | YAML Data Fix (names, descriptions, statuses) | 5 | ✅ Complete |
| **Phase 2** | Populate Manual URLs (`ecManualUrl`) | 2 | ✅ Complete |
| **Phase 3** | Add PDF Manual URLs (new field `pdfManualUrl`) | 3 | ✅ Complete |
| **Phase 4** | Rebuild & Verify | 3 | ✅ Complete |
| **Phase 5** | VCQ Technical Standard Enrichment | 7 | ✅ Complete |
| **Phase 6** | Manual Content Analysis & Data Quality Uplift | 6 | 🔶 In progress (2/6 done) |

**Total steps:** 26 | **Completed:** 22/26

---

# PART A — Research Findings

## A1. EC Official Use Case Inventory (19 use cases)

| # | EC Name | Category | EC Status | Has Manual? | PDF? |
|---|---------|----------|-----------|-------------|------|
| 1 | PID-based identification in online services | Core functionality | Published | ✅ | ✅ |
| 2 | Use of a pseudonym in online services | Core functionality | Coming soon | ❌ | ❌ |
| 3 | eSignature | Core functionality | Published | ✅ | ✅ |
| 4 | Mobile Driving Licence (mDL) | Travel | Published | ✅ | ✅ |
| 5 | Identification in proximity scenarios | Identification | Published | ✅ | ✅ |
| 6 | Payment authentication | Banking & payment | Published | ✅ | ✅ |
| 7 | Age verification | Consumer | Published | ✅ | ✅ |
| 8 | Digital Travel Credential (DTC) | Travel | Published | ✅ | ✅ |
| 9 | European Parking Card (EPC) | Travel | Published | ✅ | ✅ |
| 10 | European Disability Card | Health & social security | Published | ✅ | ✅ |
| 11 | Educational credentials | Education | Coming soon | ❌ | ❌ |
| 12 | e-Prescription | Health & social security | Published | ✅ | ✅ |
| 13 | European Health Insurance Card (EHIC) | Health & social security | Published | ✅ | ✅ |
| 14 | Natural or legal person representation | Legal representation | Coming soon | ❌ | ❌ |
| 15 | Ticket or pass | Consumer | Coming soon | ❌ | ❌ |
| 16 | Vehicle Registration Certificate (VRC) | Travel | Coming soon | ❌ | ❌ |
| 17 | Public warnings | Health & social security | Coming soon | ❌ | ❌ |
| 18 | European student card | Education | Coming soon | ❌ | ❌ |
| 19 | Open bank account | Banking & payment | Coming soon | ❌ | ❌ |

**11 published manuals** | **8 coming soon** | **11/11 PDF downloads confirmed** ✅

---

## A2. Identified Discrepancies

### A2.1 Naming Discrepancies

| Our YAML Key | Our Current Name | EC Official Name | Severity |
|-------------|-----------------|------------------|----------|
| `payment-auth` | "Online payment authorisation" | **"Payment authentication"** | 🔴 CRITICAL — complete rename on EC side |
| `esignature` | Desc: "Create **advanced** electronic signatures..." | Desc: "Create **qualified** electronic signatures..." | 🟡 MAJOR — legal distinction (QES > AdES) |

### A2.2 Status Drift (10 use cases need updating)

| YAML Key | Our Status | EC Status | Needs Update? |
|----------|-----------|-----------|---------------|
| `pid-online` | `coming_soon` | Published (full manual) | ✅ Yes |
| `esignature` | `coming_soon` | Published (full manual) | ✅ Yes |
| `payment-auth` | `coming_soon` | Published (full manual) | ✅ Yes |
| `age-verification` | `coming_soon` | Published (full manual) | ✅ Yes |
| `dtc` | `coming_soon` | Published (full manual) | ✅ Yes |
| `epc` | `coming_soon` | Published (full manual) | ✅ Yes |
| `disability-card` | `coming_soon` | Published (full manual) | ✅ Yes |
| `eprescription` | `coming_soon` | Published (full manual) | ✅ Yes |
| `ehic` | `coming_soon` | Published (full manual) | ✅ Yes |
| `proximity-id` | `coming_soon` | Published (full manual) | ✅ Yes |
| `mdl` | `published` | Published | ❌ Already correct |

### A2.3 Missing EC Manual URLs

All 10 newly-published use cases have `ecManualUrl: null`. See Phase 2 for exact URLs.

### A2.4 Missing PDF Manual URLs

No `pdfManualUrl` field exists in the schema. See Phase 3 for URLs.

---

## A3. Technical Standards Inventory (from Manuals)

| Use Case | Data Format | Issuance Protocol | Verification Protocol | Trust Framework |
|----------|-------------|-------------------|----------------------|-----------------|
| **PID** | W3C VC + ISO 18013-5/7 mdoc (dual mode) | OpenID4VCI | OpenID4VP | Federated trust lists |
| **eSignature** | AdES/QES (PAdES, XAdES, CAdES, ASiC) | Wallet-driven or QTSP-driven | ETSI validation profiles | EU Trusted Lists + QSCD |
| **mDL** | ISO 18013-5 mdoc | OpenID4VCI (ARF Annex 4) | ISO 18013-5 (proximity) + ISO 18013-7 (remote) | MS notification lists |
| **Proximity ID** | PID attributes (mdoc) | OpenID4VCI | ISO 18013-5 (NFC/BLE) + OpenID4VP | ARF-defined verifier auth |
| **Payment Auth** | SD-JWT VC (other formats may follow) | OpenID4VCI (SCA Attestations) | OpenID4VP (+ ISO 18013-5 future) | Federated trust lists |
| **Age Verification** | ISO mdoc (18013-5 + 23220-2) | OpenID4VCI (optional) | W3C Digital Credentials API + OpenID4VP; **ZKP upcoming** | Commission-maintained trusted list |
| **DTC** | ICAO 9303 + ISO/IEC TS 23220-2:2024 | Via public authorities or EU Digital Travel App | PKI-based signature validation | Passport/ID card PKI trusted lists |
| **EPC** | TBD (implementing act pending) | TBD | TBD | Directive 2024/2841 framework |
| **Disability Card** | TBD (implementing act pending) | TBD | TBD | Directive 2024/2841 framework |
| **ePrescription** | ISO 18013-5 mdoc (Health ID attestation) | OpenID4VCI | ISO 18013-5 (proximity) + ISO 18013-7 (remote) | PuB-EAA trusted list + MyHealth@EU |
| **EHIC** | SD-JWT-VC (IETF) + W3C VC Data Model 2.0 | OID4VCI with ES256 | Visual/OCR (current); digital TBD | DC4EU pilot framework |

---

## A4. PDF Manual Download URLs

All 11 PDFs confirmed and downloaded to `.agent/research/use-case-manuals/pdf/`.

| # | Use Case | Local File | PDF URL |
|---|----------|------------|---------|
| 01 | Mobile Driving Licence | `01-mdl.pdf` | `https://ec.europa.eu/digital-building-blocks/sites/download/attachments/929202846/01_Use%20Case_Manual_Mobile%20Driving%20Licence%201.pdf` |
| 02 | Age Verification | `02-age-verification.pdf` | `https://ec.europa.eu/digital-building-blocks/sites/download/attachments/930450954/Use%20Case_Manual_Age%20verification.pdf` |
| 03 | European Parking Card | `03-epc.pdf` | `https://ec.europa.eu/digital-building-blocks/sites/download/attachments/930452118/03_Use%20Case_Manual_European%20Parking%20Card.pdf` |
| 04 | PID-based identification | `04-pid-online.pdf` | `https://ec.europa.eu/digital-building-blocks/sites/download/attachments/930451131/04_Use%20Case_Manual_PID-based%20identification%201.pdf` |
| 05 | Identification in proximity | `05-proximity-id.pdf` | `https://ec.europa.eu/digital-building-blocks/sites/download/attachments/930451396/05_Use%20Case_Manual_The%20identification%20in%20proximity%20scenarios.pdf` |
| 06 | Digital Travel Credential | `06-dtc.pdf` | `https://ec.europa.eu/digital-building-blocks/sites/download/attachments/930451772/06_Use%20Case_Manual_Digital%20Travel%20Credential.pdf` |
| 07 | eSignature | `07-esignature.pdf` | `https://ec.europa.eu/digital-building-blocks/sites/download/attachments/930452287/07_Use%20Case_Manual_eSignature.pdf` |
| 08 | Disability Card | `08-disability-card.pdf` | `https://ec.europa.eu/digital-building-blocks/sites/download/attachments/930452528/08_Use%20Case_Manual_Disability%20Card.pdf` |
| 09 | ePrescription | `09-eprescription.pdf` | `https://ec.europa.eu/digital-building-blocks/sites/download/attachments/930452930/09_Use%20Case_Manual_ePrescription.pdf` |
| 10 | EHIC | `10-ehic.pdf` | `https://ec.europa.eu/digital-building-blocks/sites/download/attachments/930453001/10_Use%20Case_Manual_European%20Health%20Insurance%20Card%20%28EHIC%29.pdf` |
| 11 | Payment Authentication | `11-payment-auth.pdf` | `https://ec.europa.eu/digital-building-blocks/sites/download/attachments/935397429/11_Use%20Case_Manual_Payment%20Authentication.pdf` |

---

## A5. Use Case Synergy Matrix (from EC Manuals)

| Use Case | Synergies With |
|----------|---------------|
| PID | Pseudonym, eSignature, Age Verification |
| eSignature | Payment Auth, Edu Credentials, ePrescription, Representation, Open Bank Account |
| Proximity ID | Pseudonym, mDL, Age Verification, Ticket/Pass |
| Payment Auth | eSignature, PID, Age Verification |
| ePrescription | Proximity ID, Payment Auth |
| EPC | Disability Card, EHIC, Payment Auth |
| DTC | PID, mDL, Proximity ID |

---

# PART B — Implementation Plan

## Phase 1: YAML Data Fix (names, descriptions, statuses)

> **Target file:** `docs-portal/config/rca/use-cases.yaml`  
> **Estimated effort:** ~10 minutes  
> **Risk:** Low — pure data correction, no schema changes

### Step 1.1 — Rename `payment-auth`

- [x] **Change:** `name: "Online payment authorisation"` → `name: "Payment authentication"`
- **Line:** 56
- **Before:** `name: "Online payment authorisation"`
- **After:** `name: "Payment authentication"`
- **Rationale:** EC has renamed this use case. All page titles, headers, and cross-references on the EC site use "Payment authentication".

### Step 1.2 — Fix `esignature` description

- [x] **Change:** `description:` "Create **advanced** electronic signatures..." → "Create **qualified** electronic signatures..."
- **Line:** 49
- **Before:** `description: "Create advanced electronic signatures with the same legal validity as a handwritten signature."`
- **After:** `description: "Create qualified electronic signatures with the same legal validity as a handwritten signature."`
- **Rationale:** EC now consistently says "qualified" (QES). This is a significant legal distinction — QES provides higher legal assurance than AdES.

### Step 1.3 — Update `payment-auth` description

- [x] **Change:** Keep the EC listing page description as-is but update verb only
- **Line:** 57
- **Before:** `description: "Enables online payments to be authorised via an EUDI Wallet."`
- **After:** `description: "Enables online payments to be authenticated via an EUDI Wallet."`
- **Rationale:** ⚠️ AUDIT CORRECTION: The EC listing page actually uses the exact description "Enables online payments to be authorised via an EUDI Wallet." — identical to our current value! However, the title is "Payment authentication" (not "authorisation"), so we only need the verb alignment: "authorised" → "authenticated". The manual content does cover both online AND in-store, but the EC listing page itself does NOT mention in-store, so we should match the official listing description to stay in sync.

### Step 1.4 — Update statuses for 10 use cases

- [x] **Change:** `status: coming_soon` → `status: published` for these YAML keys:
  - `pid-online` (line 37)
  - `esignature` (line 51)
  - `payment-auth` (line 59)
  - `age-verification` (line 135)
  - `dtc` (line 84)
  - `epc` (line 91)
  - `disability-card` (line 106)
  - `eprescription` (line 113)
  - `ehic` (line 120)
  - `proximity-id` (line 165)

### Step 1.5 — Update `pid-online` description

- [ ] **Change:** Align description with EC listing page
- **Line:** 35
- **Before:** `description: "Secure identification to an online service using the PID stored in an EUDI Wallet."`
- **After:** ~~`description: "Identification based on Person Identification Data (PID) for online services, where a service provider verifies a user's PID to grant access."`~~ NO — keep EC listing page verbatim: `description: "Secure identification to an online service using the PID stored in an EUDI Wallet."`
- **⚠️ AUDIT CORRECTION:** The EC listing page uses the EXACT SAME description as our YAML! So this step is now unnecessary — **SKIP**.
- **Decision:** Only change the status and ecManualUrl, not the description.

---

## Phase 2: Populate EC Manual URLs

> **Target file:** `docs-portal/config/rca/use-cases.yaml`  
> **Estimated effort:** ~5 minutes  
> **Risk:** Low — populating existing null fields

### Step 2.1 — Set `ecManualUrl` for 10 newly-published use cases

- [x] **Change:** Replace `ecManualUrl: null` with actual URLs for:

| YAML Key | Line | URL |
|----------|------|-----|
| `pid-online` | 38 | `https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/930451131/PID+Identification+Manual` |
| `esignature` | 52 | `https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/930452287/eSignature` |
| `payment-auth` | 60 | `https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/935397429/Payment+Authentication` |
| `age-verification` | 136 | `https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/930450954/The+Age+Verification+Manual` |
| `dtc` | 85 | `https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/930451772/Travel+Credentials` |
| `epc` | 92 | `https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/930452118/European+Parking+Card` |
| `disability-card` | 107 | `https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/930452528/Disability+Card` |
| `eprescription` | 114 | `https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/930452930/ePrescription` |
| `ehic` | 121 | `https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/930453001/EHIC` |
| `proximity-id` | 166 | `https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/930451396/Identification+in+proximity+scenarios` |

### Step 2.2 — Verify mDL URL is still correct

- [x] **Check:** mDL `ecManualUrl` currently points to `https://ec.europa.eu/digital-building-blocks/sites/display/EUDIGITALIDENTITYWALLET/The+mobile+Driving+License+manual` — confirmed still resolves. ✅ Uses legacy `/display/` format (different from `/spaces/` used by others), but both work.
- **Action:** No change expected, just verify.

---

## Phase 3: Add PDF Manual URLs (new schema field)

> **Target files:** `docs-portal/config/rca/use-cases.yaml` only (see audit notes below)  
> **Estimated effort:** ~15 minutes  
> **Risk:** Low — adds a new optional field; build pipeline confirmed to handle it

### Step 3.1 — Add `pdfManualUrl` field to each use case entry in YAML

- [x] **Change:** Add `pdfManualUrl:` field after `ecManualUrl:` for all 19 use cases.
  - Set to the PDF URL where available (all 11 published use cases — see A4 above)
  - Set to `null` for the 8 coming-soon use cases

**Example (pid-online):**
```yaml
  pid-online:
    name: "PID-based identification in online services"
    description: "Secure identification to an online service using the PID stored in an EUDI Wallet."
    category: core
    status: published
    ecManualUrl: "https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/930451131/PID+Identification+Manual"
    pdfManualUrl: "https://ec.europa.eu/digital-building-blocks/sites/download/attachments/930451131/04_Use%20Case_Manual_PID-based%20identification%201.pdf"
```

### Step 3.2 — ~~Verify `build-rca.js` passes through new field~~ ✅ CONFIRMED

- [x] **AUDIT RESULT:** `build-rca.js` line 96-101 uses `...useCase` spread operator — ALL fields from the YAML are passed through to the JSON output. **No code changes needed.**

### Step 3.3 — ~~Verify `validate-rca.js` doesn't reject the new field~~ ✅ CONFIRMED

- [x] **AUDIT RESULT:** `validate-rca.js` only validates `useCases`, `category`, and `roles` fields in requirements files. It does NOT validate the schema of `use-cases.yaml` entries beyond extracting IDs. **No code changes needed.**

---

## Phase 4: Rebuild & Verify

> **Target:** Full build cycle + visual verification  
> **Estimated effort:** ~10 minutes

### Step 4.1 — Run RCA data build

- [x] **Command:** `node scripts/build-rca.js`
- **Result:** Build completed successfully. 487 requirements, 19 use cases, 8 categories. Output: `public/data/rca-data.json`.

### Step 4.2 — Run validation

- [x] **Command:** `npm run validate:rca`
- **Result:** ✅ 19 valid use case IDs, 7 valid role IDs, 12 valid category IDs. All 7 requirement files validated. All references consistent.

### Step 4.3 — Visual verification in browser

- [x] Open the RCA page in the portal
- [x] Verify that:
  - "Payment authentication" appears (not "Online payment authorisation") ✅
  - The eSignature description says "qualified" (not "advanced") ✅
  - 11 use cases show as "published" (not "coming soon") ✅
  - Manual links are populated where applicable ✅
  - PID-based identification shows "Published" badge ✅
  - "Use of a pseudonym" has no Published badge (correct — coming_soon) ✅
- [x] **Commit:** `7c07b306` — feat(rca): sync use cases with EC portal — Phases 1-4 complete

---

## Phase 5: VCQ Technical Standard Enrichment

> **Target:** VCQ clarification question YAML files  
> **Estimated effort:** ~1-2 hours  
> **Risk:** Medium — requires careful semantic analysis of technical standards vs our existing questions  
> **Prerequisites:** Phases 1-4 complete

### Step 5.1 — Age Verification VCQ enrichment

- [x] **Added questions about:** (VEND-CORE-027: Q10, Q11, Q12)
  - ZKP (Zero-Knowledge Proof) support — EC manual says "upcoming"
  - W3C Digital Credentials API compliance
  - Commission-maintained trusted list integration for age attestation providers
  - ISO mdoc (18013-5 + 23220-2) format support

### Step 5.2 — Payment Authentication VCQ enrichment

- [x] **Added questions about:** (VEND-CORE-019: Q10, Q11, Q12, Q13)
  - SCA Attestation Rulebook compliance
  - SD-JWT VC format support
  - Both online AND in-store authentication user journeys
  - PSD2/PSD3/PSR SCA integration via wallet

### Step 5.3 — ePrescription VCQ enrichment

- [x] **Added questions about:** (VEND-CORE-020: Q10, Q11; VEND-CORE-022: Q10)
  - Health ID attestation support (ISO mdoc format)
  - MyHealth@EU cross-border infrastructure integration
  - Pharmacy system update requirements for EUDI Wallet acceptance

### Step 5.4 — EHIC VCQ enrichment

- [x] **Added questions about:** (VEND-CORE-018: Q9, Q10; VEND-CORE-020: Q12)
  - SD-JWT-VC (IETF specification) format support
  - W3C VC Data Model 2.0 compliance
  - DC4EU pilot compatibility
  - Real-time revocation capability

### Step 5.5 — DTC VCQ enrichment

- [x] **Added questions about:** (VEND-CORE-018: Q7, Q8; VEND-CORE-022: Q11)
  - ICAO 9303 compliance for DTC data structures
  - ISO/IEC TS 23220-2:2024 support
  - Traveller Router integration requirements
  - PKI trust chain validation for border authorities

### Step 5.6 — eSignature VCQ enrichment

- [x] **Added questions about:** (VEND-CORE-026: Q10, Q11, Q12, Q13, Q14)
  - Wallet-driven vs QTSP-driven QES creation paths
  - QSCD certification status (local vs remote)
  - rQSCD management per IR (EU) 2025/1567
  - ETSI signature profiles (PAdES, XAdES, CAdES, ASiC) support

### Step 5.7 — Proximity ID VCQ enrichment

- [x] **Added questions about:** (VEND-CORE-040: Q10, Q11, Q12)
  - Supervised vs unsupervised verification flow support (ARF-defined)
  - NFC/BLE transport support for ISO 18013-5
  - Offline verification capability (no internet required)
  - Verifier authentication (service provider certificate validation)

---

# PART E — Comprehensive Second Pass Audit

> **Audit date:** 2026-02-19T19:10+01:00  
> **Method:** Cross-checked implementation plan against:  
> 1. `use-cases.yaml` (line-by-line vs EC listing page)  
> 2. `build-rca.js` (field handling logic)  
> 3. `validate-rca.js` (schema validation scope)  
> 4. `ComplianceAssessment.jsx` (frontend rendering)  
> 5. `vcq-config.yaml` (VCQ structure and existing references)  
> 6. `legal-sources.yaml` (technical specs and legislation refs)  
> 7. EC main listing page content (re-scraped for verbatim comparison)  
> 8. EC manual subpages (re-checked key claims)

## E1. Corrections Made to the Plan

### 🔴 CORRECTION 1: `pid-online` description does NOT need updating (Step 1.5 → SKIP)

**What we claimed:** Our description is "vague" and should be rewritten.
**What the EC listing page actually says:** `"Secure identification to an online service using the PID stored in an EUDI Wallet."`
**What our YAML says (line 35):** `"Secure identification to an online service using the PID stored in an EUDI Wallet."`
**Verdict:** They are **IDENTICAL**. No description change needed. Step 1.5 should be skipped.

### 🟡 CORRECTION 2: `payment-auth` description change should be minimal (Step 1.3 revised)

**What we claimed:** Change to "Enables online and in-store payments to be authenticated via an EUDI Wallet."
**What the EC listing page actually says:** `"Enables online payments to be authorised via an EUDI Wallet."`
**What our YAML says (line 57):** `"Enables online payments to be authorised via an EUDI Wallet."`
**Verdict:** The descriptions are **IDENTICAL** — the EC listing page uses "authorised", same as us! Only the title changed. However, the title is now "Payment authentication", so the verb "authorised" creates an inconsistency with the title "authentication". Minimal fix: change "authorised" → "authenticated" only.

### 🟢 CORRECTION 3: Build pipeline audit — Steps 3.2 and 3.3 pre-resolved

**What we planned:** Check if build-rca.js and validate-rca.js need modification.
**Audit result:**
- `build-rca.js` (line 96): Uses `...useCase` spread — **all fields pass through automatically**
- `validate-rca.js`: Only validates `useCases`, `category`, `roles` ref integrity — **doesn't touch use case schema**
- Frontend (line 249): Only checks `uc.status === 'published'` — will work immediately with status changes
**Verdict:** No code changes needed for build/validation. Steps 3.2 and 3.3 are pre-resolved.

## E2. New Gaps Discovered

### 🔴 GAP 1: mDL `ecManualUrl` uses DIFFERENT URL format than other published use cases

**Current mDL URL (line 78):** Uses `/sites/display/` path format:
`https://ec.europa.eu/digital-building-blocks/sites/display/EUDIGITALIDENTITYWALLET/The+mobile+Driving+License+manual`

**All other published use cases:** Use `/sites/spaces/` path format:
`https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/...`

**EC listing page link for mDL:** Also uses the `/sites/display/` format.

**Risk:** The mDL URL works (confirmed on the listing page), but it's a legacy Confluence format. It may eventually redirect to a `/spaces/` URL. Not a blocker, but worth noting.

**Action:** Add to Step 2.2 verification — confirm both URL formats resolve correctly.

### 🟡 GAP 2: `technicalSpecs` field exists on `payment-auth` but NOT on other published use cases

Our YAML has `technicalSpecs: [TS12]` on `payment-auth` (line 62-63). But from the manual analysis, we now know:
- **PID** relies on OpenID4VCI, OpenID4VP (which maps to TS references in vcq-config)
- **eSignature** relies on TS8 (Remote QES Protocol), ETSI profiles
- **Age Verification** relies on TS4 (ZKP), W3C DC API
- **DTC** relies on ICAO 9303, ISO 23220-2

However, populating `technicalSpecs` for all use cases is a **separate enhancement** — it should be tracked but NOT block Phases 1-4. The VCQ config already has its own TS mappings.

**Recommendation:** Add a Phase 6 (future) item for aligning `technicalSpecs` arrays across all published use cases.

### 🟡 GAP 3: Frontend does NOT render `ecManualUrl` or `pdfManualUrl` yet

`ComplianceAssessment.jsx` renders use cases in the `UseCaseSelector` component (lines 235-253) but only shows:
- `uc.name` (line 246)
- `uc.description` (line 247)
- `uc.status === 'published'` badge (line 249-251)

The `ecManualUrl` and `pdfManualUrl` fields are **NOT rendered anywhere** in the UI. They are only available in the JSON data.

**Impact:** Data will be correct in the JSON, but users can't click through to EC manuals from our portal yet.

**Recommendation:** Consider adding a "📖 Manual" link button next to the "Published" badge in a future frontend sprint. NOT a blocker for this phase.

### 🟢 GAP 4: Descriptions that perfectly match EC listing page (NO changes needed)

Verified the following descriptions are **verbatim matches** with EC listing page — confirming our data was originally well-sourced:

| Use Case | Our Description | EC Description | ✅ Match? |
|----------|----------------|----------------|----------|
| `pseudonym` | "Interact with digital platforms without revealing your full identity..." | Same | ✅ |
| `mdl` | "Proof of an individual's right to drive a certain kind of vehicle." | Same (but EC uses "mDl") | ✅ |
| `proximity-id` | "Secure in-person identification for services where the transaction requires strong assurance of identity." | Same | ✅ |
| `age-verification` | "Prove you are above a specific age threshold (e.g., over 16, 18, or 21)..." | Same | ✅ |
| `dtc` | "A digital representation of the user's identity document..." | Same (EC omits trailing period) | ✅ |
| `epc` | "Issued to persons with disabilities, recognising the right to certain reserved parking conditions and facilities." | Same | ✅ |
| `disability-card` | "Serves as proof of recognised disability status/entitlement to disability services." | Same | ✅ |
| `eprescription` | "Identify yourself in order to access e-prescriptions stored and presented via an EUDI Wallet." | Same | ✅ |
| `ehic` | "Grants access to necessary healthcare when in another Member State." | Same | ✅ |
| `open-bank-account` | "Enables individuals to open a bank account online using their EUDI Wallet." | Same | ✅ |
| `edu-credentials` | "Store, manage, and present digitally verifiable..." (uppercase S) | EC: lowercase "store" | ⚠️ Minor |
| `public-warnings` | "Enables trusted public authorities..." | Same | ✅ |
| `ticket-pass` | "Store, manage, and present digital tickets..." (uppercase S) | Same | ✅ |
| `student-card` | "Enables students to store and present their student status." | Same | ✅ |
| `vrc` | "Proves the registration and legal compliance..." | Same | ✅ |
| `representation` | "Enables users to act on behalf of another individual..." | Same | ✅ |

**Net description changes needed:** Only 2 (esignature: advanced→qualified; payment-auth: authorised→authenticated).

## E3. Suspicious Items Investigated

### ⚠️ INVESTIGATED: mDL naming — EC says "mDl" (lowercase L), we say "mDL" (uppercase L)

The EC listing page displays "Mobile Driving Licence (mDl)" with lowercase 'l'. Our YAML says "Mobile Driving Licence (mDL)" with uppercase 'L'. ISO 18013-5 uses "mDL". The EC manual page title says "Mobile Driving License" (American spelling).

**Decision:** Keep "mDL" — this is the ISO standard abbreviation. The EC listing page's lowercase 'l' appears to be a rendering artifact.

### ⚠️ INVESTIGATED: `edu-credentials` description casing

EC listing page: "**s**tore, manage, and present digitally verifiable education-related credentials..." (lowercase 's')
Our YAML: "**S**tore, manage, and present digitally verifiable education-related credentials..." (uppercase 'S')

**Decision:** Keep uppercase 'S' — it's the start of our description string. The EC page lowercase is because it follows a heading in their layout.

### ✅ CONFIRMED: Category assignments all match EC

Every use case in our YAML is assigned to the correct EC category. Verified all 19:
- PID, Pseudonym, eSignature → Core functionality ✅
- Payment Auth, Open Bank Account → Banking & payment ✅
- mDL, DTC, EPC, VRC → Travel ✅
- Disability Card, ePrescription, EHIC, Public Warnings → Health & social security ✅
- Age Verification, Ticket/Pass → Consumer ✅
- Edu Credentials, Student Card → Education ✅
- Proximity ID → Identification ✅
- Representation → Legal representation ✅

### ✅ CONFIRMED: Use case ordering matches EC listing page

The EC listing page shows use cases in this order:
1. PID → 2. Pseudonym → 3. eSignature → 4. mDL → 5. Proximity ID → 6. Payment Auth → 7. Age Verification → 8. DTC → 9. EPC → 10. Disability Card → 11. Edu Credentials → 12. ePrescription → 13. EHIC → 14. Representation → 15. Ticket/Pass → 16. VRC → 17. Public Warnings → 18. Student Card → 19. Open Bank Account

Our YAML groups by category (different ordering), which is fine — we sort by `categoryOrder` in the build.

## E4. Revised Step Count

**Original:** 20 steps
**After audit:** 22 total steps (Step 1.5 eliminated, Steps 3.2/3.3 pre-resolved, Phase 6 added with 2 steps)

## E5. Potential Future Improvements (Out of Scope for this plan)

1. ~~**Frontend: Add "📖 Manual" link** — Render `ecManualUrl` as a clickable link~~ ✅ Done (Design B — `718268b1`)
2. ~~**Frontend: Add "📄 PDF" download link** — Render `pdfManualUrl` as a download button~~ ✅ Done (Design B — `718268b1`)
3. ~~**Data: Populate `technicalSpecs` arrays**~~ ✅ Done (Step 6.3 — hybrid TS-number + external standard identifiers)
4. ~~**VCQ: Cross-reference use cases** — Link VCQ clarification questions to specific use case IDs~~ ✅ Done (`useCaseRef` field — `40be9a02`)

---

## Phase 6: Manual Content Analysis & Data Quality Uplift

> **Target:** Cross-validate EC use case manual content against our existing RCA/VCQ data; enrich and sharpen where gaps exist  
> **Estimated effort:** ~8-10 hours total (across multiple sessions)  
> **Risk:** Medium — involves modifying existing VCQ questions and RCA data  
> **Prerequisites:** Phases 1-5 complete  
> **Scope:** All 11 published use cases with manuals

### Source Materials Inventory

**Primary sources (for cross-validation):**

| # | Use Case | TXT File (from PDF) | EC Manual Page (live fetch via `read_url_content`) |
|---|----------|--------------------|----------------------------------------------------||
| 01 | Mobile Driving Licence | `txt/01-mdl.txt` | `ecManualUrl` in `use-cases.yaml` |
| 02 | Age Verification | `txt/02-age-verification.txt` | `ecManualUrl` in `use-cases.yaml` |
| 03 | European Parking Card | `txt/03-epc.txt` | `ecManualUrl` in `use-cases.yaml` |
| 04 | PID-based Identification | `txt/04-pid-online.txt` | `ecManualUrl` in `use-cases.yaml` |
| 05 | Proximity Identification | `txt/05-proximity-id.txt` | `ecManualUrl` in `use-cases.yaml` |
| 06 | Digital Travel Credential | `txt/06-dtc.txt` | `ecManualUrl` in `use-cases.yaml` |
| 07 | eSignature | `txt/07-esignature.txt` | `ecManualUrl` in `use-cases.yaml` |
| 08 | European Disability Card | `txt/08-disability-card.txt` | `ecManualUrl` in `use-cases.yaml` |
| 09 | ePrescription | `txt/09-eprescription.txt` | `ecManualUrl` in `use-cases.yaml` |
| 10 | European Health Insurance Card | `txt/10-ehic.txt` | `ecManualUrl` in `use-cases.yaml` |
| 11 | Payment Authentication | `txt/11-payment-auth.txt` | `ecManualUrl` in `use-cases.yaml` |

**Usage notes:**
- TXT files are in `.agent/research/use-case-manuals/txt/` — use these as the primary content source
- EC manual HTML pages should be fetched at runtime via `read_url_content` for each sub-step, to capture any updates since the PDFs were downloaded
- Full EC manual URLs are stored in `docs-portal/config/rca/use-cases.yaml` (field: `ecManualUrl`)
- PDFs (`.agent/research/use-case-manuals/pdf/`) are the canonical record but not directly machine-readable — use TXT instead

**Data assets to cross-validate against:**

| Asset | Path | Item Count |
|-------|------|------------|
| RCA Requirements | `docs-portal/config/rca/requirements/*.yaml` (7 role files) | 487 requirements |
| VCQ Clarification Questions | `docs-portal/config/vcq/clarification-questions/*.yaml` (5 category files) | 1,352 questions |
| Technical Specifications | `docs-portal/config/rca/use-cases.yaml` (`technicalSpecs` field) | Currently only `payment-auth` has TS refs |
| Custom Dictionary | `docs-portal/scripts/custom-dictionary.yaml` | 137 terms |
| Legal Sources | `docs-portal/config/legal-sources.yaml` | — |

**Current data profile:**
- 423 of 487 requirements have `useCases: all` — none are mapped to specific use case IDs
- 24 of 1,352 VCQ questions have `useCaseRef` — all from Phase 5 (core.yaml only)
- 0 of 1,352 VCQ questions in ict/intermediary/issuer/trust_services have any use case cross-reference

---

### Step 6.1 — Read and extract content from all manuals ✅ DONE

- [x] Read all 11 TXT-extracted manuals in full
- [x] Identified technical standards, protocols, legislation references, and terminology
- [ ] ~~Systematic cross-validation against RCA/VCQ data~~ → Moved to Steps 6.3–6.6

**Honest status:** The reading was done thoroughly. The cross-validation analysis claimed in the
original checklist was NOT performed — it is now properly scoped in Steps 6.3–6.6 below.

### Step 6.2 — Import extracted terminology into `custom-dictionary.yaml` ✅ DONE

- [x] **Added 19 new terms** to `docs-portal/scripts/custom-dictionary.yaml`:
  - **5 published use cases:** Age Verification, PID-based Identification, Identification in Proximity Scenarios, eSignature (use case), Payment Authentication
  - **7 coming-soon use cases:** Pseudonym, Educational Credentials, Representation, Ticket/Pass, Public Warnings, Student Card, Open Bank Account
  - **7 domain/protocol terms:** OID4VP, OID4VCI, SD-JWT VC, mdoc, ESSPASS, Digital Credentials API, EMV 3-D Secure
- [x] **Rebuilt** terminology index (399 terms) and search index
- [x] All 19 use cases defined by the EC are now represented in the dictionary
- [x] All aliases (OID4VP, OID4VCI, ESSPASS) confirmed present in JSON output
- [x] Committed `6a561968`

### Step 6.3 — Technical Specifications Alignment ✅ DONE

> **Effort:** ~30 minutes  
> **Risk:** Low — data entry into existing YAML field  
> **Target file:** `docs-portal/config/rca/use-cases.yaml`

- [x] Populated `technicalSpecs` arrays for all 11 published use cases from the A3 inventory
- [x] Cross-referenced against `legal-sources.yaml` — TS-numbered refs (TS4, TS6, TS8, TS12) are tracked; external standards (ISO, ICAO, ETSI, W3C) are correctly outside RCA's curated subset
- [x] No standards missing from `legal-sources.yaml` that should be there — external standards are informational, not RCA legal sources
- [x] Rebuilt RCA data (`build-rca.js`) and validated (`validate-rca.js`) — both pass

**Design decision (resolved):** Use **hybrid identifiers** — ARF TS-number IDs (`TS4`, `TS6`, `TS8`, `TS12`) where the standard maps to an ARF technical specification, and external standard identifiers (`ISO 18013-5`, `ICAO 9303`, `ETSI TS 119 102-2`, etc.) for standards outside the ARF TS catalogue. This preserves consistency with the existing `TS12` on `payment-auth` while correctly representing external dependencies.

**Final `technicalSpecs` values per use case:**

| Use Case | technicalSpecs |
|----------|---------------------------|
| `pid-online` | TS6, OpenID4VP, ISO 18013-5, ISO 18013-7 |
| `esignature` | TS8, ETSI TS 119 102-2, IR 2025/1567 |
| `mdl` | TS6, ISO 18013-5, ISO 18013-7 |
| `proximity-id` | OpenID4VP, ISO 18013-5 |
| `payment-auth` | TS12 *(unchanged)* |
| `age-verification` | TS4, OpenID4VP, ISO 18013-5, ISO 23220-2, W3C DC API |
| `dtc` | ICAO 9303, ISO 23220-2 |
| `epc` | [] *(implementing acts pending — Directive 2024/2841)* |
| `disability-card` | [] *(implementing acts pending — Directive 2024/2841)* |
| `eprescription` | TS6, ISO 18013-5, ISO 18013-7, MyHealth@EU |
| `ehic` | TS6, SD-JWT-VC, W3C VC Data Model 2.0 |

**15 unique specs** referenced across all use cases: 4 ARF TS + 11 external standards.

### Step 6.4 — VCQ Clarification Question Audit & Use Case Tagging 🟡 PARTIALLY COMPLETE

> **Effort:** ~3-4 hours (largest sub-step; split across sub-steps per file)  
> **Risk:** Medium — modifying question wording and adding `useCaseRef` fields  
> **Target files:** `docs-portal/config/vcq/clarification-questions/*.yaml` (5 files)

**Two primary objectives:**

1. **Quality audit** — Sharpen questions using context from the EC use case manuals
2. **Use case scoping** — Systematically tag every question with `useCaseRef` where it applies to specific use cases (not just "all")

**Why use case tagging matters:** Future intent is to introduce use case filtering in the VCQ UI,
mirroring the pattern already used in RCA. When a vendor selects a target use case (e.g. "Payment
Authentication"), the VCQ should be able to surface only the questions relevant to that use case.
This requires systematic `useCaseRef` tagging now, even though the UI filter is not yet built.

**Current state (updated 2026-02-20):**
- ✅ **Use case tagging COMPLETE** — 51 questions tagged across 7 use cases (all in core.yaml)
- ❌ **Quality audit NOT DONE** — No questions were reworded, no redundancies identified, no enrichment from EC manual context
- See tracker: `.agent/session/vcq-quality-audit-tracker.md`

**Problem (quality):** The 1,352 existing VCQ clarification questions were authored before the EC
use case manuals were analyzed. They may be:
- **Vague** where the manual provides specific protocol/format details
- **Incomplete** where the manual reveals scenarios not covered
- **Redundant** where different requirements' questions ask overlapping things
- **Using outdated terminology** (e.g. "advanced signatures" vs. "qualified signatures")

**Scope:** Audit ALL questions across all 5 VCQ files, evaluating both quality and use case scope.

> ⛔ **MANDATORY METHODOLOGY: MANUAL AI-DRIVEN ANALYSIS**  
>
> This step MUST be performed manually by the AI agent reading and semantically  
> understanding each requirement and its questions. **The following approaches  
> are EXPLICITLY FORBIDDEN:**  
>
> - ❌ Python/Node scripts that do keyword-matching or pattern-based tagging  
> - ❌ Automated grep/regex-based use case detection  
> - ❌ Any script that applies `useCaseRef` tags based on string matching  
>
> **The correct approach is:**  
> - ✅ Read each requirement title + description to understand its semantic scope  
> - ✅ Read each question under that requirement to understand what it probes  
> - ✅ Apply domain knowledge (eIDAS regulation, ARF, EC manuals) to determine  
>   whether the question is inherently about a specific use case or generic  
> - ✅ Make tagging decisions based on understanding, not keyword presence  
> - ✅ Sharpen question wording where manual context reveals opportunities  
>
> A question mentioning "mDL" as an example doesn't make it mDL-specific.  
> A question about QSCD sole control IS esignature-specific even if it  
> doesn't mention the word "eSignature". Semantic judgement is required.

**Method — for each VCQ file (sub-step):**
1. Read ALL requirements and questions in the file sequentially
2. For each requirement:
   a. **Understand** its scope from the requirement title and VEND ID
   b. **Evaluate** whether it is inherently use-case-specific or generic
   c. For each question under it:
      - Determine if it applies to all use cases or specific ones
      - Assess quality: can it be sharpened with EC manual context?
      - Add `useCaseRef` tag if use-case-specific
      - Improve wording if warranted
3. After processing all requirements in the file, rebuild and validate
4. Commit the file

**Execution order (by VCQ file, each is a separate sub-step):**

| Sub-step | VCQ File | Reqs | Qs | Priority | Tagging | Quality Audit |
|----------|----------|------|----|----------|---------|---------------|
| 6.4.1 | `core.yaml` | 48 | 421 | 🔴 High | ✅ Done (51 tagged) | ⬜ Not started |
| 6.4.2 | `issuer.yaml` | 40 | 360 | 🟡 Medium | ✅ Done (0 needed) | ⬜ Not started |
| 6.4.3 | `intermediary.yaml` | 32 | 292 | 🟡 Medium | ✅ Done (0 needed) | ⬜ Not started |
| 6.4.4 | `trust_services.yaml` | 19 | 171 | 🟡 Medium | ✅ Done (0 needed) | ⬜ Not started |
| 6.4.5 | `ict.yaml` | 12 | 108 | 🟢 Lower | ✅ Done (0 needed) | ⬜ Not started |

**Constraints:**
- Do NOT rewrite questions from scratch — sharpen existing wording with specific details
- Do NOT remove questions — only merge if truly duplicative
- All changes must be backward-compatible (no ID changes)
- Preserve the existing `dimension` classification
- Every question must be evaluated for use case scope, even if the conclusion is "applies to all"
- ⛔ NO automated keyword/pattern-matching scripts — manual semantic analysis ONLY

### Step 6.5 — RCA Requirement Description Enrichment & Use Case Scoping ⬜ NOT STARTED

> **Effort:** ~2-3 hours  
> **Risk:** Medium — modifying requirement `explanation` fields and `useCases` values  
> **Target files:** `docs-portal/config/rca/requirements/*.yaml` (7 role files)

**Two primary objectives:**

1. **Description enrichment** — Enhance `explanation` fields with practical context from the manuals
2. **Use case scoping** — Re-evaluate the `useCases` field on every requirement: should it stay `all`, or be scoped to specific use case IDs?

**Why use case scoping matters:** Currently 423 of 487 requirements have `useCases: all` and 64
have no value. The RCA UI already supports use case filtering — but with everything tagged `all`,
the filter is meaningless. The EC manuals make it clear that many requirements are particularly
relevant to (or only meaningful for) specific use cases. Proper scoping would make the existing
RCA filter actually useful.

**Problem (descriptions):** Our 487 RCA requirement `explanation` fields are regulation-derived
and often terse. The EC manuals provide rich practical context — user journeys, implementation
patterns, stakeholder responsibilities — that could make explanations more useful to vendors.

**Plan:**
1. [ ] **Use case scoping pass** — For each requirement, evaluate against the 11 published manuals:
   - Does this requirement apply equally to all 19 use cases? → Keep `useCases: all`
   - Does this requirement only matter for specific use cases? → Set `useCases: [esignature, payment-auth, ...]`
   - Is this requirement foundational infrastructure? → Keep `useCases: all`
   - Categories likely to need specific scoping:
     - Signature-related requirements → `esignature`
     - Payment/SCA-related → `payment-auth`
     - Proximity-specific → `proximity-id`, `mdl`
     - Health-sector-specific → `eprescription`, `ehic`
     - Travel-specific → `dtc`, `mdl`
2. [ ] **Description enrichment** — For requirements where manual content adds significant value:
   - Enrich the `explanation` field — NOT by replacing regulation text, but by appending practical context
   - What does this requirement mean in practice?
   - Which use cases does it most affect?
   - Which technical standards implement this requirement?
3. [ ] **Rebuild** RCA JSON and verify filtering still works

**Key design decision needed:** Should manual-enriched context go into:
- `explanation` (the main visible field) — risk: dilutes regulatory precision
- `note` (the secondary field) — safer but less visible
- A new field like `practicalContext` or `useCaseContext` — cleanest semantics but requires schema/build changes

**Interaction with Step 6.4:** The use case scoping of requirements (this step) and questions
(Step 6.4) should be aligned. If a requirement is scoped to `[esignature]`, then its clarification
questions should also carry `useCaseRef: [esignature]`. Consider doing 6.5 before 6.4, or at least
coordinating the scoping decisions.

### Step 6.6 — Cross-Validation Gap Report ⬜ NOT STARTED

> **Effort:** ~1-2 hours  
> **Risk:** Low — read-only analysis, produces a report  
> **Output:** `.agent/research/MANUAL_CROSS_VALIDATION_REPORT.md`

**Purpose:** Produce a structured report documenting what the manuals cover vs. what our RCA/VCQ
data covers, with prioritised recommendations.

**Plan:**
1. [ ] **Per-manual coverage matrix:**
   - Topics in manual → matching RCA requirement(s) → matching VCQ question(s)
   - Flag gaps where manual mentions something we don't cover
2. [ ] **Actionable recommendations** grouped by type:
   - VCQ questions to add (with draft text)
   - RCA requirement explanations to enrich
   - Technical specifications to track
   - Legislation cross-references to consider
3. [ ] **Priority ranking:** high / medium / low impact for each recommendation
4. [ ] Present to user for review before any implementation

---

### Phase 6 Progress Summary

| Sub-step | Description | Effort | Status |
|----------|-------------|--------|--------|
| **6.1** | Read & extract content from all 11 manuals | Done | ✅ Complete |
| **6.2** | Import terminology into `custom-dictionary.yaml` | Done | ✅ Complete |
| **6.3** | Populate `technicalSpecs` arrays on all use cases | ~30 min | ✅ Complete |
| **6.4** | VCQ clarification question audit & use case tagging (11 use cases × 5 files) | ~3-4 hrs | ⬜ Not started |
| **6.5** | RCA requirement description enrichment & use case scoping | ~2-3 hrs | ⬜ Not started |
| **6.6** | Cross-validation gap report | ~1-2 hrs | ⬜ Not started |

---

# PART F — Applied Changes (commit `7c07b306`)

> **Applied:** 2026-02-19T20:15+01:00  
> **File:** `docs-portal/config/rca/use-cases.yaml`  
> **Build output:** `docs-portal/public/data/rca-data.json` (regenerated)

### ⚠️ SCOPE: No RCA requirements were changed

**Only use case metadata was modified** (names, descriptions, statuses, URLs).
The 487 RCA requirements across all 7 role files are **completely untouched**:
- `wallet-provider.yaml` (132 req) — ❌ not changed
- `trust-service-provider.yaml` (103 req) — ❌ not changed
- `relying-party.yaml` (102 req) — ❌ not changed
- `supervisory-body.yaml` (42 req) — ❌ not changed
- `issuer.yaml` (42 req) — ❌ not changed
- `conformity-assessment-body.yaml` (36 req) — ❌ not changed
- `pid-provider.yaml` (30 req) — ❌ not changed

Future changes to compliance content will target **VCQ clarification questions only** (Phase 5).

## F1. Data Corrections (3 changes)

| # | Use Case | Field | Before | After | Rationale |
|---|----------|-------|--------|-------|-----------|
| 1 | `payment-auth` | `name` | `"Online payment authorisation"` | `"Payment authentication"` | EC renamed this use case entirely |
| 2 | `esignature` | `description` | `"Create advanced electronic signatures..."` | `"Create qualified electronic signatures..."` | Legal distinction: QES > AdES. EC now says "qualified" |
| 3 | `payment-auth` | `description` | `"...to be authorised via..."` | `"...to be authenticated via..."` | Verb alignment with renamed title "Payment authentication" |

## F2. Status Updates (10 changes)

All changed from `coming_soon` → `published`:

| # | Use Case | Category |
|---|----------|----------|
| 1 | `pid-online` | Core functionality |
| 2 | `esignature` | Core functionality |
| 3 | `payment-auth` | Banking & payment |
| 4 | `dtc` | Travel |
| 5 | `epc` | Travel |
| 6 | `disability-card` | Health & social security |
| 7 | `eprescription` | Health & social security |
| 8 | `ehic` | Health & social security |
| 9 | `age-verification` | Consumer |
| 10 | `proximity-id` | Identification |

**Result:** 11 published (was 1) · 8 coming soon (was 18)

## F3. EC Manual URLs Added (10 changes)

All changed from `ecManualUrl: null` → populated URL:

| Use Case | URL Set To |
|----------|-----------|
| `pid-online` | `.../pages/930451131/PID+Identification+Manual` |
| `esignature` | `.../pages/930452287/eSignature` |
| `payment-auth` | `.../pages/935397429/Payment+Authentication` |
| `dtc` | `.../pages/930451772/Travel+Credentials` |
| `epc` | `.../pages/930452118/European+Parking+Card` |
| `disability-card` | `.../pages/930452528/Disability+Card` |
| `eprescription` | `.../pages/930452930/ePrescription` |
| `ehic` | `.../pages/930453001/EHIC` |
| `age-verification` | `.../pages/930450954/The+Age+Verification+Manual` |
| `proximity-id` | `.../pages/930451396/Identification+in+proximity+scenarios` |

(All URLs prefixed with `https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET`)

**`mdl`** already had a URL — unchanged: `.../display/EUDIGITALIDENTITYWALLET/The+mobile+Driving+License+manual`

## F4. New Field: `pdfManualUrl` (19 additions)

Brand new field added to **every** use case entry. This field did not exist before.

### Published use cases — with PDF URLs (11):

| Use Case | `pdfManualUrl` |
|----------|---------------|
| `mdl` | `.../929202846/01_Use%20Case_Manual_Mobile%20Driving%20Licence%201.pdf` |
| `pid-online` | `.../930451131/04_Use%20Case_Manual_PID-based%20identification%201.pdf` |
| `esignature` | `.../930452287/07_Use%20Case_Manual_eSignature.pdf` |
| `payment-auth` | `.../935397429/11_Use%20Case_Manual_Payment%20Authentication.pdf` |
| `dtc` | `.../930451772/06_Use%20Case_Manual_Digital%20Travel%20Credential.pdf` |
| `epc` | `.../930452118/03_Use%20Case_Manual_European%20Parking%20Card.pdf` |
| `disability-card` | `.../930452528/08_Use%20Case_Manual_Disability%20Card.pdf` |
| `eprescription` | `.../930452930/09_Use%20Case_Manual_ePrescription.pdf` |
| `ehic` | `.../930453001/10_Use%20Case_Manual_European%20Health%20Insurance%20Card%20(EHIC).pdf` |
| `age-verification` | `.../930450954/Use%20Case_Manual_Age%20verification.pdf` |
| `proximity-id` | `.../930451396/05_Use%20Case_Manual_The%20identification%20in%20proximity%20scenarios.pdf` |

(All URLs prefixed with `https://ec.europa.eu/digital-building-blocks/sites/download/attachments`)

### Coming soon use cases — set to null (8):

`pseudonym` · `open-bank-account` · `vrc` · `public-warnings` · `ticket-pass` · `edu-credentials` · `student-card` · `representation`

## F5. Unchanged (verified correct)

The following fields were **audited and confirmed to already match** EC data — no changes needed:

| Field | Use Cases | Notes |
|-------|-----------|-------|
| All `description` values | 16 of 19 | Verbatim match with EC listing page (see Audit E2/GAP 4) |
| All `category` values | All 19 | All match EC categories (see Audit E3) |
| `mdl` name | 1 | We use "mDL" (ISO standard); EC uses "mDl" — kept ours |
| `mdl` `ecManualUrl` | 1 | Legacy `/display/` format, but works correctly |
| `payment-auth` `technicalSpecs: [TS12]` | 1 | Retained — other use cases don't have this yet (future improvement) |

## F6. Summary Statistics

| Metric | Count |
|--------|-------|
| Fields modified | 23 |
| Fields added (new) | 19 |
| **Total changes** | **42** |
| Use cases touched | **19 of 19** |
| Use cases with data corrections | 2 (`payment-auth`, `esignature`) |
| Use cases with status change | 10 |
| Use cases with only `pdfManualUrl: null` added | 8 |

---

# PART G — VCQ Enrichment Changes (commit `40be9a02`)

> **Applied:** 2026-02-19T21:30+01:00  
> **Files modified:**  
> - `docs-portal/config/vcq/clarification-questions/core.yaml` (source)  
> - `docs-portal/scripts/build-vcq-clarifications.js` (build pipeline)  
> - `docs-portal/public/data/vcq-clarification-questions.json` (rebuilt output)  
>
> **No existing questions were modified or removed.** All changes are strictly additive.  
> **No RCA requirements were changed.** This is VCQ-only enrichment.

## G1. Overview

24 new clarification questions added across 8 existing VCQ requirements. Each question is derived from EC Use Case Manual technical standard analysis and tagged with a `useCaseRef` field linking it to the relevant use case.

| Metric | Value |
|--------|-------|
| Questions added | 24 |
| Requirements enriched | 8 |
| Use cases covered | 7 |
| New `useCaseRef` field introduced | Yes (additive — no existing data affected) |
| Build script change | `useCaseRef` passthrough added |
| Total clarification questions (after) | 1,352 (was 1,328) |

## G2. Questions by Use Case

| Use Case | Questions | Target Requirement(s) |
|----------|-----------|----------------------|
| eSignature | 5 | VEND-CORE-026 |
| Payment Auth | 4 | VEND-CORE-019 |
| Age Verification | 3 | VEND-CORE-027 |
| Proximity ID | 3 | VEND-CORE-040 |
| ePrescription | 3 | VEND-CORE-020, VEND-CORE-022 |
| EHIC | 3 | VEND-CORE-018, VEND-CORE-020 |
| DTC | 3 | VEND-CORE-018, VEND-CORE-022 |

## G3. Complete Question Manifest

### VEND-CORE-018 — Attestation Verification (4 questions added)

| ID | useCaseRef | Dimension | Summary |
|----|-----------|-----------|---------|
| Q7 | `dtc` | interoperability | ICAO Doc 9303 compliance within ISO mDoc; PKI trust chain against ICAO PKD |
| Q8 | `dtc` | interoperability | Traveller Router integration; cross-state DTC validation |
| Q9 | `ehic` | interoperability | SD-JWT-VC format per IETF spec + W3C VC Data Model 2.0; real-time revocation for health coverage |
| Q10 | `ehic` | interoperability | DC4EU pilot compatibility; MyHealth@EU trust framework integration |

**EC manual sources:** DTC manual (ICAO 9303, Traveller Router), EHIC manual (SD-JWT-VC, DC4EU)

### VEND-CORE-019 — PSD2/SCA for Payments (4 questions added)

| ID | useCaseRef | Dimension | Summary |
|----|-----------|-----------|---------|
| Q10 | `payment-auth` | technical_implementation | SD-JWT VC format for SCA Attestations; KB-JWT for payment proof-of-possession |
| Q11 | `payment-auth` | lifecycle | PSD3/PSR regulatory transition; migration path from PSD2 to PSR SCA |
| Q12 | `payment-auth` | compliance_completeness | SCA Attestation Rulebook compliance; sector-specific schema validation |
| Q13 | `payment-auth` | interoperability | Proximity payment + age verification synergy at POS; ISO 18013-5 + POS integration |

**EC manual source:** Payment Authentication manual (TS12, SD-JWT-VC, PSD3/PSR bridge, SCA Rulebook)

### VEND-CORE-020 — OpenID4VCI Issuance (3 questions added)

| ID | useCaseRef | Dimension | Summary |
|----|-----------|-----------|---------|
| Q10 | `eprescription` | interoperability | Health ID attestation in ISO mDoc format via OpenID4VCI; health-specific namespace |
| Q11 | `eprescription` | interoperability | MyHealth@EU infrastructure integration for cross-border Health ID issuance |
| Q12 | `ehic` | interoperability | EHIC in SD-JWT-VC with W3C VC Data Model 2.0; coverage validity lifecycle |

**EC manual sources:** ePrescription manual (Health ID mDoc, MyHealth@EU), EHIC manual (SD-JWT-VC issuance)

### VEND-CORE-022 — Schema Registration TS11 (2 questions added)

| ID | useCaseRef | Dimension | Summary |
|----|-----------|-----------|---------|
| Q10 | `eprescription` | interoperability | Health sector attestation rulebooks; MyHealth@EU format interoperability |
| Q11 | `dtc` | interoperability | Dual-compliance (ICAO Doc 9303 + EUDI catalogue) for DTC schemas |

**EC manual sources:** ePrescription manual (health rulebooks), DTC manual (ICAO dual-compliance)

### VEND-CORE-026 — Remote Signing TS8 (5 questions added)

| ID | useCaseRef | Dimension | Summary |
|----|-----------|-----------|---------|
| Q10 | `esignature` | capability | Wallet-driven vs QTSP-driven QES creation paths; RP flow configuration |
| Q11 | `esignature` | compliance_evidence | IR 2025/1567 rQSCD compliance; rQSCD certification under this regulation |
| Q12 | `esignature` | interoperability | ASiC container format; long-term validation (PAdES B-LTA, CAdES B-LTA) |
| Q13 | `esignature` | architecture | Local QSCD (wallet) vs remote rQSCD (QTSP); certification status communication |
| Q14 | `esignature` | interoperability | EU Trusted Lists for QES validation; ETSI TS 119 102-2 validation protocols |

**EC manual source:** eSignature manual (wallet-driven/QTSP-driven paths, IR 2025/1567, ETSI profiles, ASiC/LTV)

### VEND-CORE-027 — Pseudonyms / ZKP (3 questions added)

| ID | useCaseRef | Dimension | Summary |
|----|-----------|-----------|---------|
| Q10 | `age-verification` | capability | ZKP-based age-over predicates (age_over_18 = true without DoB); EC flags as "upcoming" |
| Q11 | `age-verification` | technical_implementation | ISO mDoc format with boolean age_over claims; PID derivation vs dedicated attestation |
| Q12 | `age-verification` | interoperability | Commission-maintained trusted list for age attestation providers; auto-discovery |

**EC manual source:** Age Verification manual (ZKP upcoming, ISO mdoc boolean claims, trusted list)

### VEND-CORE-040 — Proximity Flows (3 questions added)

| ID | useCaseRef | Dimension | Summary |
|----|-----------|-----------|---------|
| Q10 | `proximity-id` | capability | Supervised (border, police) vs unsupervised (kiosk, turnstile) verification modes |
| Q11 | `proximity-id` | security | Mutual authentication: reader certificate presented to wallet before data release |
| Q12 | `proximity-id` | operational | Offline trust anchor freshness; max offline duration; degradation strategy |

**EC manual source:** Proximity ID manual (supervised/unsupervised, verifier authentication, offline durability)

## G4. Build Pipeline Changes

**Schema v1 (2026-02-19):** Added `useCaseRef` passthrough — string values passed as-is:

```javascript
...(q.useCaseRef && { useCaseRef: q.useCaseRef })
```

**Schema v2 (2026-02-20):** Normalised `useCaseRef` to always output as an array, accepting
both string and array input from YAML. Added use case tagging stats to output JSON.

```javascript
// Normalise useCaseRef to array (accepts string or array input)
// Absent useCaseRef = applies to all use cases (implicit)
if (q.useCaseRef) {
    question.useCaseRef = Array.isArray(q.useCaseRef)
        ? q.useCaseRef
        : [q.useCaseRef];
}
```

### Use Case Scoping Convention (aligned across RCA and VCQ)

| Aspect | RCA Requirements (`useCases`) | VCQ Questions (`useCaseRef`) | Aligned? |
|--------|-------------------------------|------------------------------|----------|
| "Applies to all" | `useCases: all` (explicit) | Field absent (implicit) | ✅ Intentionally different — most questions are generic |
| "Specific use cases" | `useCases: [esignature, ...]` (array) | `useCaseRef: [esignature, ...]` (array) | ✅ Both arrays |
| "Single use case" | `useCases: [esignature]` (array) | `useCaseRef: esignature` (string, normalised to array) | ✅ Both work |
| "Multiple use cases" | Array supported | Array supported | ✅ Both arrays |

**Key rules:**
1. In YAML source: both string (`useCaseRef: esignature`) and array (`useCaseRef: [esignature, payment-auth]`) are accepted
2. In JSON output: always normalised to array (`"useCaseRef": ["esignature"]`)
3. Absent field = applies to all use cases (no need to tag generic questions with "all")
4. Use case IDs must match the keys in `docs-portal/config/rca/use-cases.yaml`

This convention is backward-compatible. Existing YAML with string `useCaseRef` values continues to work unchanged.

## G5. Technical Standards Referenced

| Standard | Use Cases | Requirements |
|----------|-----------|-------------|
| **SD-JWT VC** (IETF) | payment-auth, ehic | VEND-CORE-019, VEND-CORE-018, VEND-CORE-020 |
| **ISO mDoc** (18013-5 + 23220-2) | age-verification, eprescription | VEND-CORE-027, VEND-CORE-020 |
| **ICAO Doc 9303** | dtc | VEND-CORE-018, VEND-CORE-022 |
| **IR 2025/1567** (rQSCD) | esignature | VEND-CORE-026 |
| **ETSI TS 119 102-2** (sig validation) | esignature | VEND-CORE-026 |
| **PSD3/PSR** (upcoming) | payment-auth | VEND-CORE-019 |
| **MyHealth@EU** | eprescription, ehic | VEND-CORE-018, VEND-CORE-020, VEND-CORE-022 |
| **DC4EU** | ehic | VEND-CORE-018 |
| **SCA Attestation Rulebook** | payment-auth | VEND-CORE-019 |
| **ASiC** (signature container) | esignature | VEND-CORE-026 |
| **W3C VC Data Model 2.0** | ehic | VEND-CORE-018, VEND-CORE-020 |

---

# PART C — Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-19 | **Exclude non-EUDI legislation from import** | User decision: Legislation like EHDS (2025/327), Disability Card Directive (2024/2841), Social Security Coordination (883/2004), Instant Payments (2024/886), etc. are sector-specific and not directly about digital identity wallets. PSD2 RTS is tangentially related and already covered in a separate research document. Not importing any of these. |
| 2026-02-19 | **Download all manuals, defer analysis** | All 11 published manual PDFs downloaded and text-extracted to `.agent/research/use-case-manuals/`. Content analysis and recommendations deferred to Phase 6 (after data corrections are applied). |
| 2026-02-19 | **All 11 PDF URLs confirmed** | Payment Auth (#11) and EHIC (#10) PDFs found via browser inspection — they were behind "Download detailed Use Case Manual" banners not visible in HTML scrape. |
| 2026-02-19 | **Skip Step 1.5 (pid-online desc)** | Audit revealed description is already an exact match with EC listing page. No change needed. |
| 2026-02-19 | **Minimize Step 1.3 (payment-auth desc)** | Audit revealed EC listing description matches ours verbatim. Only verb alignment needed (authorised→authenticated) to match renamed title. |
| 2026-02-19 | **Additive-only VCQ enrichment** | No existing questions modified or removed. All 24 new questions strictly appended to existing requirement blocks. New `useCaseRef` field is optional and backward-compatible. |
| 2026-02-20 | **Use case scoping convention alignment** | `useCaseRef` on VCQ questions normalised to array format in output JSON (Schema v2), aligning with the array-based `useCases` field on RCA requirements. Absent `useCaseRef` = applies to all use cases (implicit). YAML source accepts both string and array input for convenience. Future: VCQ UI will support use case filtering mirroring the existing RCA filter. |

---

# PART D — Changelog

| Date | Change |
|------|--------|
| 2026-02-19 | Initial research completed — scraped all 11 published manual subpages |
| 2026-02-19 | Implementation plan created with 5 phases, 20 steps |
| 2026-02-19 | **Comprehensive second pass audit** — cross-checked against 8 golden sources. Found 3 corrections, 4 gaps. Pre-resolved build pipeline questions (Steps 3.2, 3.3). |
| 2026-02-19 | **Renamed:** USE_CASE_MANUALS_ANALYSIS → USE_CASE_ANALYSIS (manuals are part of the analysis, not the whole thing) |
| 2026-02-19 | **Downloaded all 11 manual PDFs** + text extraction. Added Phase 6 (manual content analysis & recommendations). Found missing Payment Auth (#11) and EHIC (#10) PDFs via browser. Total: 22 steps. |
| 2026-02-19 | **Phase 5 VCQ enrichment complete** — 24 use-case-specific clarification questions added across 8 requirements, covering 7 use cases. Build script updated for `useCaseRef` passthrough. Commit `40be9a02`. |
| 2026-02-20 | **Phase 6 terminology import complete** — 19 new terms added to `custom-dictionary.yaml`: 5 published use cases, 7 coming-soon use cases, 7 domain/protocol terms (OID4VP, OID4VCI, SD-JWT VC, mdoc, ESSPASS, Digital Credentials API, EMV 3-D Secure). Total dictionary terms: 137. Total terminology index: 399 terms. |
| 2026-02-20 | **Use case scoping convention aligned** — `useCaseRef` normalised to array in VCQ build output (Schema v2). Build script updated with use case tagging stats. Convention documented in G4. Decision logged in Part C. |
