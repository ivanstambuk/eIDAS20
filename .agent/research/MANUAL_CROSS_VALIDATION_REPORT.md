# Cross-Validation Gap Report — EC Use Case Manuals vs RCA/VCQ Data

> **Created:** 2026-02-20T12:10+01:00  
> **Step:** 6.6 of Phase 6 (Manual Content Analysis & Data Quality Uplift)  
> **Methodology:** Systematic comparison of 11 published EC use case manuals against 487 RCA requirements and 1,350 VCQ clarification questions  
> **Source manuals:** `.agent/research/use-case-manuals/txt/` (11 files, ~270K chars total)

---

## Executive Summary

Our RCA/VCQ data set provides **strong coverage of the regulatory framework** (eIDAS Regulation, implementing acts, ETSI standards). However, the EC use case manuals reveal several **implementation-level topics** that our data doesn't explicitly address — not because the regulation ignores them, but because the manuals provide practical guidance that goes beyond what the legal text prescribes.

**Key finding:** The gap is not "missing requirements" — it's "missing practical context." Our 487 requirements faithfully reflect what the law mandates. The manuals add *how* those mandates work in specific scenarios. This is exactly the territory that **Step 6.5's deferred description enrichment** was designed to address.

---

## 1. Coverage Matrix — Manual Topics vs RCA Requirements

### 1.1 Well-Covered Topics (✅ No Action Needed)

| Topic | Manual mentions | RCA Requirements | Coverage |
|-------|----------------|------------------|----------|
| **Signature creation** | 7/11 manuals (51 mentions in eSignature) | 23 requirements | ✅ Excellent |
| **SCA/PSD2** | 11/11 manuals (incl. payment-auth: 5 mentions) | 16 requirements | ✅ Good |
| **Cross-border interop** | 11/11 manuals (eprescription: 21 mentions!) | 15 requirements | ✅ Good |
| **Delegation/representation** | 3/11 manuals | 21 requirements | ✅ Good |
| **Presentation protocols** | All manuals | WP-IOP-023/024, RP-TEC-002 etc. | ✅ Good |
| **Selective disclosure** | 5/11 manuals | 8 requirements | ✅ Adequate |
| **Offline mode** | 4/11 manuals (proximity-id: 8 mentions) | 3 requirements | ✅ Adequate |
| **Revocation** | 6/11 manuals | EAA-REV-001 to 010, TSP revocation reqs | ✅ Excellent |
| **Trust framework/lists** | 9/11 manuals | Multiple TSP, RP, WP requirements | ✅ Excellent |

### 1.2 Gap Topics — Mentioned in Manuals but Underrepresented in RCA (⚠️ Review)

| Topic | Manual evidence | RCA coverage | Gap severity | Notes |
|-------|----------------|-------------|--------------|-------|
| **ZKP / zero-knowledge proofs** | age-verification manual explicitly mentions ZKP as "upcoming" technique | **0 requirements** | 🟡 MEDIUM | Regulation doesn't mandate ZKP; it's a future technical option. No gap in legal coverage, but a gap in forward-looking readiness. |
| **Biometric matching** | 4/11 manuals mention biometrics (eSignature: 5, payment-auth: 4, PID: 2, proximity-id: 1) | **1 requirement** (TSP-CRT-004, only re: QTSP conformity) | 🟡 MEDIUM | Manuals discuss biometric user verification scenarios. Our RCA treats biometrics as an authentication detail, not a standalone requirement category. |
| **Batch/deferred issuance** | Not explicitly in manuals but implied by multi-format issuance (WP-IOP-021: "request in all formats") | **0 requirements** | 🟢 LOW | Operational pattern, not a regulatory requirement. |
| **Re-issuance/renewal** | disability-card manual mentions renewal | **0 requirements** | 🟢 LOW | Renewal is an operational process, not separately mandated. Covered implicitly by issuance requirements. |
| **ICAO/DTC-specific** | DTC manual references ICAO 9303, MRTD | **0 requirements** mentioning ICAO | 🟡 MEDIUM | DTC use case has specific ICAO dependencies not reflected in RCA. However, ICAO compliance is a national/authority concern, not a vendor requirement. |
| **Health sector specifics** | ePrescription (23K chars), EHIC (23K chars) manuals detail NCPeH, MyHealth@EU | **0 requirements** mentioning health | 🟡 MEDIUM | Health infrastructure (NCPeH, MyHealth@EU) is a separate regulatory domain. Our RCA correctly focuses on eIDAS, not sectoral legislation. |
| **Backup/recovery** | Implied by wallet migration (WP-TEC-021) | **1 requirement** (TSP-SEC-006: signature data backup) | 🟢 LOW | Wallet backup is covered by data portability (WP-TEC-009/010). |

### 1.3 Excess Coverage — RCA Topics NOT in Manuals (expected)

These topics exist in our RCA but are NOT mentioned in the EC manuals. This is **expected** — manuals focus on user journeys, not regulatory infrastructure:

| Topic | RCA Requirements | Why not in manuals |
|-------|------------------|--------------------|
| Conformity assessment body procedures | 36 CAB requirements | CABs are auditor entities, not use case participants |
| Supervisory body powers | 42 SB requirements | Meta-level oversight, not use case implementation |
| Electronic ledger (DLT) | 15 TSP-LEDGER requirements | New trust service type, no published use case manual yet |
| QWAC issuance | 3 TSP-QWAC requirements | Website authentication, operates outside wallet use cases |
| Archiving service | 4 TSP requirements (TEC-014 to 017) | Archiving is infrastructure, not a user-facing use case |

---

## 2. VCQ Question Coverage Assessment

### 2.1 Current State

- **1,350 total questions** across 5 files (core, ict, intermediary, issuer, trust_services)
- **51 questions** (3.8%) tagged with `useCaseRef`
- **All 51 tagged questions** are in `core.yaml`

### 2.2 VCQ Topic Gaps

VCQ questions are intentionally generic — they assess vendor compliance capabilities, not use-case-specific implementations. The 0 hits on use-case-specific keywords (biometric, cross-border, health sector, etc.) is **by design**: VCQ asks "How do you handle X?" not "How do you handle X for payment authentication?"

**No VCQ gaps identified.** The current question structure is appropriate for its purpose.

---

## 3. Per-Manual Gap Analysis

### 3.1 PID-based Online Identification (37K chars — largest manual)
- **Well mapped:** Authentication, issuance, verification, cross-border, data minimisation
- **Notable:** Mentions pseudonym capability, selective disclosure, both W3C VC and mdoc formats
- **Gap:** Manual describes detailed "journey steps" with specific UI expectations (e.g., "wallet displays RP identity") — these are UX requirements not in RCA

### 3.2 eSignature (27K chars)
- **Well mapped:** QES creation, QSCD, remote signing, trust lists, certificate requirements
- **Notable:** Describes two scenarios (simplified and detailed signing flow)
- **Gap:** Manual mentions specific biometric authentication at signing step — our RCA treats this as a WSCA responsibility (WP-SEC-010/011), not a signing-specific requirement

### 3.3 Payment Authentication (35K chars — second largest)
- **Well mapped:** SCA, PSD2 references, authentication mechanisms
- **Notable:** Describes SCA attestation flow in detail, references PSR (Payment Services Regulation replacement for PSD2)
- **Gap:** PSD2/PSR interplay with eIDAS is complex. Manual mentions Article 97 SCA. Our RCA captures the wallet side but not the payment-specific regulatory interplay.

### 3.4 Age Verification (16K chars — smallest published manual)
- **Well mapped:** Proof of age presentation, selective disclosure
- **Notable:** Explicitly mentions ZKP as upcoming technique. References ISO 23220-2.
- **Gap:** ZKP and age attestation format are forward-looking topics not yet mandated by implementing acts.

### 3.5 Proximity Identification (23K chars)
- **Well mapped:** NFC/BLE protocols, offline verification, ISO 18013-5
- **Notable:** Distinction between supervised (hotel check-in) and unsupervised (vending machine) scenarios
- **Gap:** Supervised vs. unsupervised verification levels are a policy distinction, not an RCA requirement.

### 3.6 Mobile Driving Licence (21K chars)
- **Well mapped:** ISO 18013-5, issuance, verification
- **Notable:** Lists specific RP types (traffic police, car rental companies)
- **Gap:** mdl-specific implementation (AAMVA interop, licence categories) is outside eIDAS scope.

### 3.7 Digital Travel Credential (21K chars)
- **Well mapped:** Issuance, verification
- **Notable:** References ICAO 9303, Reg 2024/670/671
- **Gap:** ICAO-specific requirements (MRTD chip reading, DTC Type 1 vs Type 2) are not in our RCA because they're aviation authority requirements, not eIDAS mandates.

### 3.8 European Parking Card (19K chars)
- **Well mapped:** Cross-border recognition, NFC/BLE presentation
- **Notable:** References Directive 2024/2841/2842
- **Gap:** EPC-specific accessibility standards are in the Disability/Accessibility directive, not eIDAS.

### 3.9 European Disability Card (24K chars)
- **Well mapped:** Cross-border, selective disclosure, presentation
- **Notable:** Mentions renewal/re-issuance
- **Gap:** Disability-specific entitlements (reduced fares, museum access) are sectoral, not eIDAS.

### 3.10 ePrescription (24K chars)
- **Well mapped:** Cross-border (21 mentions!), trust framework
- **Notable:** Heavy emphasis on MyHealth@EU / NCPeH infrastructure
- **Gap:** Health interoperability (NCPeH, HL7/FHIR) is a completely separate domain from eIDAS.

### 3.11 European Health Insurance Card (23K chars)
- **Well mapped:** Verification, revocation, cross-border
- **Notable:** References SD-JWT format, mentions specific revocation triggers
- **Gap:** EHIC-specific social security coordination (Reg 883/2004) is outside eIDAS scope.

---

## 4. Actionable Recommendations

### 4.1 HIGH Priority

| # | Recommendation | Type | Effort | Rationale |
|---|----------------|------|--------|-----------|
| 1 | **Enrich RCA explanations with manual context** (deferred Step 6.5 objective) | Description enrichment | ~3 hrs | The largest gap is not missing requirements but terse explanations. Manual content could make 50+ explanations significantly more useful to vendors. |
| 2 | **Add ZKP/privacy-tech forward note to age-verification scoped requirements** | Explanation enrichment | ~15 min | The age-verification manual explicitly flags ZKP as upcoming. A note on relevant requirements (RP-TEC-036 to 045) would signal this to vendors. |

### 4.2 MEDIUM Priority

| # | Recommendation | Type | Effort | Rationale |
|---|----------------|------|--------|-----------|
| 3 | **Consider a "use case context" note for health sector requirements** | New note field | ~30 min | ePrescription and EHIC manuals describe complex health infrastructure (NCPeH, MyHealth@EU) that vendors may not know about. A brief note could point them to the sectoral framework. |
| 4 | **Add ICAO 9303 reference to DTC-scoped requirements** | Explanation enrichment | ~15 min | The DTC manual references ICAO standards that vendors implementing DTC would need to know about. |
| 5 | **Document the SCA/PSD2-PSR regulatory interplay** | Research/documentation | ~1 hr | Payment authentication sits at the intersection of eIDAS and PSD2/PSR. A brief reference note would help vendors understand the dual regulatory framework. |

### 4.3 LOW Priority (Defer)

| # | Recommendation | Type | Effort | Rationale |
|---|----------------|------|--------|-----------|
| 6 | Add biometric verification context to relevant WP requirements | Enrichment | ~15 min | Manuals mention biometric auth; our requirements address it via WSCA but could be more explicit. |
| 7 | Add batch/deferred issuance context to WP-IOP-021 | Enrichment | ~10 min | Operational detail, not regulatory. |
| 8 | Monitor "coming soon" use cases for new requirements | Future work | Ongoing | 8 use cases still unpublished. Once manuals appear, repeat this analysis. |

---

## 5. Structural Observations

### 5.1 Why Our RCA Coverage Is Fundamentally Sound

The EC use case manuals are **user journey documents**, not regulatory texts. They describe:
- How a wallet user experiences a use case (scenario-level)
- Which stakeholders are involved
- Which technical standards apply
- What economic value the use case brings

Our RCA requirements, by contrast, are extracted from **legal obligations** in:
- eIDAS Regulation (2014/910 as amended by 2024/1183)
- 12+ implementing regulations (2024/2977, 2024/2979, 2024/2981, 2024/2982, 2025/1567, 2025/1569, 2025/1572, 2025/1929, 2025/1942, 2025/1943, 2025/1944, 2025/2160, 2025/2527, 2025/2530, 2025/2531, 2025/2532)

These are **complementary views**, not overlapping ones. The "gap" between them is the gap between "what the law requires" and "how to implement it in practice" — which is exactly what vendor guidance materials (not compliance checklists) should address.

### 5.2 RCA/VCQ Structural Integrity

- **487 RCA requirements** × **7 role files** — comprehensive legal coverage
- **1,350 VCQ questions** × **5 topic files** — thorough compliance probing
- **74 requirements scoped** to specific use cases — meaningful filtering
- **51 VCQ questions tagged** with use case refs — consistent with RCA scoping

No structural changes to the data model are recommended. The current architecture (role-based requirements + generic compliance questions + use-case filtering) is well-suited to the regulatory landscape.

---

## 6. Conclusion

**Phase 6 cross-validation confirms our data is complete and structurally sound.** The actionable gaps are all in the "enrichment" category (making existing data more useful) rather than the "missing data" category (requirements we failed to capture). The two highest-priority items (#1 and #2) both feed into the deferred Step 6.5 description enrichment work, which can be scheduled as a future session.

**Status: Step 6.6 COMPLETE** ✅
