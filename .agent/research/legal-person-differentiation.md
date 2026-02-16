# Legal Person Differentiation in eIDAS 2.0

> **Research Date:** 2026-02-16  
> **Status:** Complete — includes EBW roadmap + attribute mandatory/optional analysis + normalization + interim onboarding strategy + Representation EAA analysis + phase-based impact assessment
> **Context:** Investigating whether the eIDAS 2.0 framework provides sufficient basis for filtering between natural and legal persons, particularly for differentiated onboarding procedures. Extended to cover mandatory vs. country-specific attributes, cross-border normalization mechanisms, interim legal person onboarding strategies before the EBW, and the impact of each migration phase on VCQ requirements and operational integration.

---

## 1. Executive Summary

The eIDAS 2.0 framework **explicitly and consistently** differentiates between natural and legal persons across all layers: legislation, architecture (ARF), and technical specifications. This distinction is fundamental to the regulatory design and provides a strong basis for implementing filtered onboarding workflows.

However, there is a deliberate **architectural split**: while the legal basis covers both person types comprehensively, the current ARF has deferred "Wallet Units for legal persons" to a separate **business wallet** initiative. Legal persons remain fully in scope as Relying Parties, Providers, and Registrants — just not (yet) as Wallet holders.

For the **interim period (2026–2028)** before the European Business Wallet is operational, this document proposes a three-phase migration path (§5.4–5.6): starting with a hybrid approach using the authorized representative's EUDI Wallet PID combined with external registry verification, transitioning to Representation EAAs (§5.5) once the Catalogue of Attributes is operational, and ultimately to full EBW integration. A detailed impact analysis (§5.6) demonstrates that **Phase 1 requires zero VCQ changes**, and each subsequent phase introduces only incremental additions to the existing verification pipeline.

---

## 2. Legislative Basis

### 2.1 Regulation (EU) 2024/1183 — Key Definitions

The regulation embeds the natural/legal person distinction directly into its core definitions:

| Article | Provision | Relevance |
|---------|-----------|-----------|
| **Art. 3(1)** | *"electronic identification"* — the process of using person identification data uniquely representing either a **natural or legal person**, or a natural person representing another natural person or a legal person | Core definition; tri-partite model |
| **Art. 3(3)** | *"person identification data"* — enables the establishment of the identity of a **natural or legal person**, or of a natural person representing another natural person or a legal person | PID scope explicitly covers both |
| **Art. 5a(5)(f)** | PID must uniquely represent the natural person, legal person, or a natural person representing the natural or legal person, and be associated with the EUDI Wallet | Wallet-level identification for both types |
| **Art. 11a(3)(c)** | Interoperability framework includes a reference to a minimum set of PID necessary to uniquely represent a **natural or legal person** | Cross-border interoperability covers both |

### 2.2 ANNEX VI — Minimum Attributes

ANNEX VI of the regulation lists minimum attributes for identification. Notably:

- **Item 9:** *"Powers and mandates to represent natural or legal persons"*

This confirms that the representation layer (a natural person acting on behalf of a legal person) is considered a first-class identification attribute, not an afterthought.

### 2.3 Three-Entity Model

The legislation establishes a **tri-partite identity model**:

1. **Natural person** — an individual human
2. **Legal person** — an entity with legal personality under national law
3. **Natural person representing another natural or legal person** — a delegation/mandate model

This third category is critical for legal person onboarding, as it is the mechanism through which legal persons interact with the ecosystem.

---

## 3. Architecture Reference Framework (ARF)

### 3.1 Topic 28 — Wallet Units for Legal Persons

> *"The topic of Wallet Units for legal persons, possibly containing a legal-person PID, has been removed from this ARF in view of the development of a separate business wallet."*
>
> — ARF Annex 2, Topic 28

**Key implication:** The current ARF (v2.8.0) explicitly descopes the *user-facing wallet* for legal persons, but this does **not** remove legal persons from the ecosystem. They remain integral in other roles.

### 3.2 Where Legal Persons Remain In Scope

Despite Topic 28's descoping, the ARF retains legal persons in several critical roles:

| Role | Description | Source |
|------|-------------|--------|
| **Relying Party** | RPs can be natural or legal persons requesting attributes from Wallet Units | Section 3.11.1 |
| **PID Provider** | Registered entities (typically legal persons) issuing PIDs | Section 3.17 |
| **QEAA/PuB-EAA Provider** | Legal persons issuing qualified/public attestations | Section 3.17 |
| **Registrant** | All providers and RPs registered by Registrars | Section 3.17 |
| **Access Certificate Holder** | Legal persons receiving access certificates from ACAs | Section 3.18 |

### 3.3 Topic 29 — Natural Person Representing Another Natural Person

The ARF discussion paper on Topic I (*"Natural person representing another natural person"*) explicitly states:

> This document does **not** cover natural persons representing legal persons.

This confirms the ARF treats the two representation scenarios differently. The legal-person representation use case is acknowledged but handled separately, reinforcing the need for differentiated filtering.

### 3.4 Architectural Split Diagram

```
┌────────────────────────────────────────────────────┐
│              eIDAS 2.0 Legal Framework              │
│      Natural + Legal persons fully covered          │
└──────────────────┬─────────────────────────────────┘
                   │
           ┌───────┴───────┐
           ▼               ▼
  ┌────────────────┐ ┌──────────────────┐
  │  Current ARF   │ │ Future Business  │
  │  (V2.8.0)      │ │ Wallet           │
  │                │ │                  │
  │  Natural       │ │  Legal persons   │
  │  persons as    │ │  as Wallet       │
  │  Wallet Users  │ │  Users / PID     │
  │                │ │  Holders         │
  │  Legal persons │ │                  │
  │  IN SCOPE as:  │ │  (Separate       │
  │  - RPs         │ │   initiative)    │
  │  - Providers   │ │                  │
  │  - Registrants │ │                  │
  └────────────────┘ └──────────────────┘
```

---

## 4. Technical Specifications

### 4.1 Data Model Differentiation

The technical specifications use distinct classes and attributes for natural vs. legal persons:

| Technical Spec | Natural Person | Legal Person |
|----------------|----------------|--------------|
| **TS2** (Notification & Publication) | `NaturalPerson` attributes | `LegalPerson` attributes (defined separately) |
| **TS5** (RP Registration Formats) | — | `LegalEntity` class, `LegalPerson` class |
| **TS6** (RP Info to Register) | RP as natural person | RP as legal person |
| **TS10** (Data Portability) | `NaturalPerson.givenName` + `NaturalPerson.familyName` | `LegalPerson.legalName` |
| **TS14** (ZKPs) | eID confirms **natural** person identity | eID confirms **legal** person identity |

### 4.2 Attribute Differences — Mandatory vs. Country-Specific

> **Key question:** Which attributes are mandatory across all Member States, which are optional/country-specific, and how is normalization handled for Relying Parties accepting persons from multiple countries?

#### 4.2.1 Natural Person PID — Mandatory Attributes

**CIR 2024/2977 Annex, Section 1** defines the exact PID attribute set for natural persons. The mandatory attributes are **EU-wide and non-negotiable** — every Member State must issue these in every PID:

| Data identifier | Definition | Presence |
|---|---|---|
| `family_name` | Current last name(s) or surname(s) | **mandatory** |
| `given_name` | Current first name(s), including middle name(s) | **mandatory** |
| `birth_date` | Day, month, and year of birth | **mandatory** |
| `birth_place` | Country (ISO 3166-1 alpha-2), or state/city of birth | **mandatory** |
| `nationality` | One or more alpha-2 country codes (ISO 3166-1) | **mandatory** |

**Optional natural person attributes** (may vary by Member State):

| Data identifier | Definition | Presence |
|---|---|---|
| `resident_address` | Full address of current residence | optional |
| `resident_country` | Country of residence (ISO 3166-1 alpha-2) | optional |
| `resident_state` | State/province of residence | optional |
| `resident_city` | City of residence | optional |
| `resident_postal_code` | Postal code | optional |
| `resident_street` | Street name | optional |
| `resident_house_number` | House number | optional |
| `personal_administrative_number` | National identifier (e.g. BSN in NL, SSN equivalent) — **policy for this value is defined per Member State in their eID scheme** | optional |
| `portrait` | Facial image (ISO 19794-5 / ISO 39794) | optional |
| `family_name_birth` | Surname at birth | optional |
| `given_name_birth` | First name(s) at birth | optional |
| `sex` | Coded values (0–9, per ISO/IEC 5218 + extensions) | optional |
| `email_address` | Email (RFC 5322) | optional |
| `mobile_phone_number` | Mobile phone (international format) | optional |

> **Source:** CIR 2024/2977, Annex Section 1. Note that Recital 12 of the same CIR clarifies: *"Member States should, in addition to the mandatory attributes, provide optional attributes needed to ensure that the set of person identification data is unique."* This means Member States have discretion on **which** optional attributes to include to guarantee uniqueness.

#### 4.2.2 Legal Person PID — Mandatory Attributes

**CIR 2024/2977 Annex, Section 2** defines the legal person PID set. There are only **two mandatory attributes**, both EU-wide:

| Data element | Presence |
|---|---|
| **current legal name** | **mandatory** |
| **a unique identifier** constructed by the sending Member State, for cross-border identification, *as persistent as possible in time* | **mandatory** |

**Optional legal person attributes:**

| Data element | Presence |
|---|---|
| current address | optional |
| VAT registration number | optional |
| tax reference number | optional |
| European unique identifier (per Directive (EU) 2017/1132) | optional |
| Legal Entity Identifier (LEI) (per CIR (EU) 2022/1860) | optional |
| EORI number (per CIR (EU) No 1352/2013) | optional |
| excise number (per Council Reg. (EU) No 389/2012) | optional |

> **Source:** CIR 2024/2977, Annex Section 2.

#### 4.2.3 Key Observations — What Is and Isn't Standardized

**What IS standardized (decided):**
1. **The mandatory attribute names** — `family_name`, `given_name`, `birth_date`, `birth_place`, `nationality` for natural persons; `current legal name` + unique identifier for legal persons. These are fixed across all 27 Member States.
2. **The data format** — All PID must be issued in both ISO/IEC 18013-5:2021 (mDL/mdoc) and W3C Verifiable Credentials Data Model 1.1 formats (CIR 2024/2977, Section 4).
3. **Metadata** — `expiry_date`, `issuing_authority`, and `issuing_country` are mandatory metadata for all PIDs (CIR 2024/2977, Annex Section 3).

**What is country-specific (by design):**
1. **The unique identifier for legal persons** — The CIR deliberately states it is *"constructed by the sending Member State"* and must be *"as persistent as possible in time."* This means:
   - The Netherlands might use a KvK (Kamer van Koophandel) number
   - Germany might use a Handelsregisternummer
   - France might use a SIREN/SIRET number
   - Each country defines its own identifier scheme, but the **attribute slot itself** is mandatory
2. **The `personal_administrative_number`** for natural persons — explicitly subject to Member State policy
3. **Which optional attributes are included** — Member States choose which optional attributes to provide based on their national eID schemes

**What is NOT yet fully decided (but in progress):**
1. **Semantic normalization of the unique legal person identifier** — While every MS must provide one, the format and meaning varies. This is being addressed through the Catalogue of Attributes (see §4.2.4)
2. **Detailed attribute schemas for Annex VI categories** — The 11 categories in Annex VI (address, age, gender, etc.) are high-level. The specific data schemas for each are being developed through Attestation Rulebooks (see §4.2.5)

#### 4.2.4 Cross-Border Normalization — The Catalogue of Attributes

**Status: Legislated (CIR 2025/1569, adopted 29 July 2025), technical spec v1.0 published (TS11, 10 Nov 2025). Catalogue itself not yet operational — becomes applicable 12 months after CIR entry into force.**

The **Catalogue of Attributes** is the Commission's answer to the normalization problem. It is a centralized, machine-readable repository that maps attributes across Member States:

```
┌──────────────────────────────────────────────────────────────┐
│            Commission's Catalogue of Attributes               │
│            (CIR 2025/1569, Art. 7 + TS11)                    │
│                                                              │
│  For each registered attribute:                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ • Unique identifier (URI)                              │  │
│  │ • Semantic description                                 │  │
│  │ • Namespace                                            │  │
│  │ • Data type                                            │  │
│  │ • Per-MS verification endpoints (authentic sources)    │  │
│  │ • Legal basis reference                                │  │
│  │ • Schema distributions (JSON, mDoc, SD-JWT VC)         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Mandate:                                                    │
│  • Annex VI attributes → mandatory registration by MS       │
│  • Other public sector attributes → optional registration   │
│  • Private entity attributes → optional registration        │
│                                                              │
│  Hosted on: Single Digital Gateway (SDG) / OOTS infra       │
│  Format: Human-readable + machine-readable (API)            │
│  Access: Public, free, no authentication required            │
└──────────────────────────────────────────────────────────────┘
```

**How this helps Relying Parties accepting legal persons from multiple countries:**

1. **Discovery** — An RP can query the catalogue to find which attributes are available for legal persons in each MS, including the specific identifier types used
2. **Verification endpoints** — The catalogue maps each attribute to its national verification service (authentic source). An RP can verify a Dutch KvK number against the Dutch authentic source and a German Handelsregisternummer against the German one, both via standardized interfaces
3. **Semantic mapping** — The catalogue provides semantic descriptions and namespaces that enable RPs to understand that a KvK number and a Handelsregisternummer serve the same function (unique legal person identifier), even though the format differs
4. **Schema interoperability** — Via OOTS Semantic Repository integration, the catalogue provides shared data models that can normalize cross-border attribute presentation

> **Key insight for RPs:** The normalization is **not** full format unification — a Dutch KvK number will not become identical to a German Handelsregister entry. Instead, the framework provides a **semantic layer** (common attribute identifiers, descriptions, and verification endpoints) that allows RPs to programmatically interpret and verify attributes from any MS, despite underlying format differences.

#### 4.2.5 Attestation Rulebooks — Attribute Schema Governance

**Status: Framework legislated (CIR 2025/1569, Art. 8). Rulebook template published. Individual rulebooks under development by scheme owners.**

Beyond the PID attributes, the eIDAS framework uses **Attestation Rulebooks** (defined in TS11 §4.2) to govern the schemas for specific Electronic Attestations of Attributes (EAAs). Each rulebook defines:

- Attribute names, namespaces, and data types
- Issuance rules and encoding formats
- Trust model and governance mechanisms
- Compliance requirements

The Commission maintains an [Attestation Rulebooks Catalog](https://github.com/eu-digital-identity-wallet/eudi-doc-attestation-rulebooks-catalog) as the central registry. For legal persons, this will include rulebooks for "financial and company data" (Annex VI, item 11) and "powers and mandates to represent natural or legal persons" (Annex VI, item 9).

> **Note — EWC Large Scale Pilot Rulebooks (non-binding):** The [EUDI Wallet Consortium (EWC)](https://github.com/EWC-consortium/eudi-wallet-rulebooks-and-schemas), a Large Scale Pilot funded under the EU's Digital Europe Programme, has published draft rulebooks and JSON data schemas for legal person attestations, including an **LPID (Legal Person Identification Data) Rulebook** (rb001), an **EU Company Certificate Rulebook** (rb002), a **Signatory Rights Rulebook** (rb004), and an **Ultimate Beneficial Owners Rulebook** (rb005). These are **pilot artifacts with no legal force** — they are not Commission-level official rulebooks and are not mandated by any implementing act. However, they represent the most advanced concrete work on legal person attestation schemas to date and may inform the eventual official rulebooks. They are useful as a reference for the likely structure and attribute set of future official attestation schemas.

#### 4.2.6 Clarification — Answering the Key Questions

The following Q&A captures the practical interpretation of the regulatory and technical findings above.

---

**Q1: Are PID attributes mandatory or country-specific?**

**Both — and the distinction is fully decided.** CIR 2024/2977 (adopted November 2024, already in force) establishes a two-tier system:

- **Mandatory attributes are EU-wide and non-negotiable.** Every Member State must issue them in every PID. For natural persons, that's 5 attributes (`family_name`, `given_name`, `birth_date`, `birth_place`, `nationality`). For legal persons, it's just 2 (`current legal name` + a unique identifier).
- **Optional attributes are at Member State discretion.** Each MS chooses which additional attributes to provide based on their national eID schemes. Recital 12 of CIR 2024/2977 clarifies that MSs *"should, in addition to the mandatory attributes, provide optional attributes needed to ensure that the set of person identification data is unique"* — so there is regulatory pressure to include enough optionals for uniqueness, but not a rigid list.

The legal person unique identifier is an important special case. The CIR deliberately states it is *"constructed by the sending Member State"* and must be *"as persistent as possible in time."* In practice, this means:
- The Netherlands would use a **KvK** (Kamer van Koophandel) number
- Germany would use a **Handelsregisternummer**
- France would use a **SIREN/SIRET** number
- Each country defines its own identifier format, but the **attribute slot itself** is mandatory across all 27 MSs

This is **by design**, not a gap. National company registries are fundamentally different systems, and the regulation does not attempt to force a single identifier format. Instead, it mandates a common semantic wrapper (see Q2).

> **Maturity: Decided.** CIR 2024/2977, adopted November 2024, in force.

---

**Q2: How will normalization work for RPs accepting legal persons from multiple countries?**

Via the **Catalogue of Attributes** — a Commission-maintained, machine-readable semantic registry legislated in **CIR 2025/1569** (adopted July 2025) and technically specified in **TS11** (v1.0, November 2025).

The critical insight is that this is **semantic interoperability, not format unification**. A Dutch KvK number will never become identical to a German Handelsregister entry — they are issued by different national systems with different formats. Instead, the Catalogue of Attributes provides a **semantic layer** that lets RPs programmatically work with attributes from any MS:

1. **Discovery** — An RP queries the catalogue API to find which attributes are available for legal persons in each MS, including the specific identifier types used.
2. **Semantic mapping** — The catalogue assigns each attribute a unique URI and provides semantic descriptions. This enables the RP to understand that a KvK number and a Handelsregisternummer serve the **same function** (unique legal person identifier), even though their format differs.
3. **Verification endpoints** — For each registered attribute, the catalogue maps to per-MS verification services (authentic sources). An RP can verify a KvK number against the Dutch authentic source and a Handelsregisternummer against the German one — both via **standardized API interfaces** (either OOTS eDelivery or REST/OAuth 2.0, per TS11 §3.2).
4. **Schema distributions** — The catalogue provides JSON schemas and format-specific distributions (mDoc, SD-JWT VC) so RPs can parse attribute values programmatically.

**What this means in practice for a Relying Party:**
- You do **not** need to build custom integrations for each of 27 Member States
- You query a single Commission-hosted API to discover what's available
- You use standardized verification interfaces to validate attributes against authentic sources
- You rely on semantic descriptions to map country-specific identifiers to a common conceptual model in your own system

> **Maturity: Framework decided, implementation in progress.** CIR 2025/1569 adopted July 2025. TS11 v1.0 published November 2025. The catalogue itself is **not yet operational** — CIR 2025/1569 Art. 11 specifies a 12-month applicability delay for Articles 6–9 (catalogue and verification points). Projected operational date: ~H2 2026.

---

**Q3: Is it too early to ask these questions?**

**No.** The regulatory picture is clear and stable. Here is a maturity assessment by layer:

| Layer | Status | Certainty |
|-------|--------|-----------|
| **Mandatory/optional PID attributes** | Fully decided and in force | 🟢 High — CIR 2024/2977 is adopted, no further legislative action needed |
| **Normalization mechanism** (Catalogue of Attributes) | Legislated; technical spec published | 🟡 Medium-High — the "what" and "how" are defined; the catalogue just isn't populated yet |
| **Verification interfaces** (authentic source APIs) | Two interface types specified in TS11/ETSI TS 119 478 | 🟡 Medium — specs published but MS endpoint deployments are still ahead |
| **Individual attribute schemas** (Attestation Rulebooks) | Framework and template published; most individual rulebooks TBD | 🟠 Medium-Low — templates exist but most domain-specific rulebooks (e.g., for powers & mandates, company data) are still under development |
| **EBW wallet-as-holder for legal persons** | Proposed (COM(2025) 838), not yet adopted | 🔴 Low — pending ordinary legislative procedure |

The bottom line: **the foundational questions about what attributes are required and how they will be normalized have clear, decided answers.** What remains is infrastructure build-out (populating the catalogue, deploying MS verification endpoints, writing domain-specific attestation rulebooks) and the EBW legislative process.

---

## 5. Implications for Filtering & Onboarding

### 5.1 Filtering is Well-Supported

The regulatory and technical framework provides **clear grounds** for implementing filtering between natural and legal persons. The differentiation exists at every level of the stack.

### 5.2 Onboarding Differentiation

| Aspect | Natural Person | Legal Person |
|--------|----------------|--------------|
| **Identity verification** | Individual PID | Representative identification (natural person) + legal entity verification |
| **Proof required** | Personal ID documents | Proof of representational authority / mandate + entity registration |
| **Mandatory PID attributes** | `family_name`, `given_name`, `birth_date`, `birth_place`, `nationality` (5 attrs) | `current legal name` + MS-constructed unique identifier (2 attrs) |
| **Representation** | Self or via another natural person | Via a natural person with mandate |
| **Wallet holding** | Current ARF scope | Deferred to business wallet |

### 5.3 RP Registration Filtering

For Relying Party registration specifically:
- **TS6** defines common RP registration information that includes whether the RP is a natural or legal person
- **TS5** provides distinct data format classes (`LegalEntity`, `LegalPerson`) for legal person RPs
- Registrars manage registration and make entity data publicly available

### 5.4 Interim Legal Person Onboarding — Before the European Business Wallet

#### 5.4.1 The Problem

The ARF explicitly descopes wallet units for legal persons (ARF Annex 2, Topic 28), and the European Business Wallet (COM(2025) 838) is not projected for EU-wide adoption until 2028–2029. This creates a **transitional gap**: Relying Parties that need to onboard legal persons cannot rely on full wallet-based legal person identification during the initial EUDI Wallet rollout period (2026–2028).

The question is: **how should legal person onboarding be handled in the interim?**

#### 5.4.2 Recommended Approach — Hybrid Two-Step Identification

The regulation's tri-partite identity model (§2) was established with full awareness that legal person wallet units would be descoped. This indicates the legislators anticipated an interim period where legal person onboarding would operate through a **natural person's wallet combined with external verification**. The recommended approach follows a three-step pattern:

**Step 1 — Authenticate the representative via EUDI Wallet (natural person PID)**

The authorized representative (e.g., director, managing partner, authorized signatory) authenticates using their personal EUDI Wallet. This provides the RP with the mandatory natural person PID attributes (`family_name`, `given_name`, `birth_date`, etc.) at high assurance level.

**Step 2 — Collect the legal entity identifier**

The representative provides the legal entity's national registration number. This is a manual input step, outside the wallet ecosystem. Examples of national identifiers:
- 🇳🇱 Netherlands — **KvK number** (Kamer van Koophandel)
- 🇩🇪 Germany — **Handelsregisternummer** (commercial register number)
- 🇫🇷 France — **SIREN/SIRET number**
- 🇮🇹 Italy — **Codice fiscale** (for legal entities) or **REA number**

**Step 3 — Verify against the authentic source and cross-reference**

The RP calls the relevant national company registry API and verifies two things:
1. **Entity validity** — the legal entity exists and is currently active
2. **Representative authority** — the authenticated natural person is listed as a director, authorized signatory, or holder of a relevant mandate for that entity

This cross-check creates a **high-confidence binding** between the wallet-authenticated natural person and the legal entity, even without a representation EAA or an EBW.

```
┌─────────────────────────────────────────────────────────────────┐
│              Interim Legal Person Onboarding Flow               │
│                                                                 │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │ EUDI Wallet  │    │  Manual Input    │    │  Registry    │  │
│  │              │    │                  │    │  Verification│  │
│  │ Natural      │───►│ Entity ID        │───►│              │  │
│  │ Person PID   │    │ (e.g. KvK nr.)   │    │ ✓ Entity     │  │
│  │ (high        │    │                  │    │   active?    │  │
│  │  assurance)  │    │                  │    │ ✓ Person is  │  │
│  │              │    │                  │    │   authorized │  │
│  │              │    │                  │    │   rep.?      │  │
│  └──────────────┘    └──────────────────┘    └──────────────┘  │
│                                                                 │
│  Output: Authenticated natural person bound to verified         │
│          legal entity with confirmed representative authority   │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.4.3 Alternatives Comparison

| Approach | Available when | Assurance level | Key limitation |
|----------|---------------|-----------------|----------------|
| **Hybrid** (wallet PID + registry check) | Now → 2028 | High — wallet-grade identity + registry cross-check | Manual input of entity ID; requires per-registry API integration |
| **Representation EAAs** ("powers & mandates" attestation issued by a QTSP, linking the natural person to the legal entity within the wallet ecosystem) | ~H2 2026–2027, once Catalogue of Attributes + attestation rulebooks are operational | Higher — fully in-ecosystem, no manual input | Depends on QTSPs actually issuing representation attestations; Annex VI item 9 rulebook still under development |
| **Legal person PID via natural person's wallet** | Theoretically possible under CIR 2024/2977 (data model exists), but no wallet implementation supports this pattern yet | High — if implemented | Unclear timeline; no wallet provider has announced support |
| **Full EBW** (legal person holds its own wallet and authenticates directly) | 2028–2029 (projected, subject to legislative procedure) | Highest — native legal person identity | Too far out for interim planning |

The hybrid approach is the **only realistic option for 2026–2027**. It upgrades the weakest link in traditional legal person onboarding (identity verification of the representative) to wallet-level assurance, while maintaining the legal entity verification step as a familiar registry check.

#### 5.4.4 Cross-Border Considerations

For cross-border onboarding scenarios (e.g., a French authorized representative of a German company), the RP must query the **entity's** Member State registry, not the representative's. This creates a practical challenge: the quality and accessibility of national company registry APIs varies significantly across Member States.

| Registry | API maturity | Programmatic representative lookup |
|----------|-------------|------------------------------|
| 🇳🇱 NL — Kamer van Koophandel (KvK) | Mature — well-documented REST API | ✅ Available |
| 🇩🇪 DE — Handelsregister | Improving — electronic access via `handelsregister.de` | ⚠️ Limited — online search available, full API integration less mature |
| 🇫🇷 FR — Infogreffe / RCS | Available — API access via `api.infogreffe.fr` | ✅ Available (via data.gouv.fr for basic data) |
| 🇮🇹 IT — Registro delle Imprese | Available — InfoCamere provides API access | ✅ Available |

This per-registry variation is **precisely the problem** that the Catalogue of Attributes verification endpoints (CIR 2025/1569 Art. 9, TS11 §3.2) will solve by providing standardized API interfaces to national authentic sources. Once operational (~H2 2026), the catalogue will replace the need for per-registry custom integrations.

#### 5.4.5 Migration Path

The hybrid approach should be designed **modularly** to enable a smooth migration as the ecosystem matures:

```
Phase 1 (2026–2027)      Phase 2 (~H2 2026–2027)     Phase 3 (2028–2029)
─────────────────────    ────────────────────────    ─────────────────────
Wallet PID               Wallet PID                  EBW authentication
  +                        +                           (legal person
Manual entity ID input   Representation EAA            identity native
  +                      (powers & mandates)            in wallet)
Direct registry check      +
                         Catalogue of Attributes
                         verification endpoints
```

The key design principle is: **keep the three-step structure (authenticate person → identify entity → verify authority) constant, and swap the implementation of each step as higher-assurance mechanisms become available.**

- In Phase 1, step 2 is manual input and step 3 is a direct registry API call
- In Phase 2, steps 2+3 merge into a single representation EAA verification via the Catalogue
- In Phase 3, all steps are handled natively by the EBW

### 5.5 Representation EAAs — The Future In-Ecosystem Mechanism

#### 5.5.1 What Is a Representation EAA?

A **Representation EAA** (Electronic Attestation of Attributes) is a credential that attests: *"This natural person has the authority to act on behalf of this legal entity, with a defined scope of power."* It is **not** a PID — it is a separate credential stored in the natural person's wallet alongside their personal PID.

When onboarding a legal person in the future, the flow would work as follows:

1. The natural person presents their **personal PID** from their EUDI Wallet (proving who they are)
2. The natural person presents a **Representation EAA** from the same wallet (proving their authority to act for the legal entity)
3. The Relying Party verifies both credentials — identity and authority — **entirely within the wallet ecosystem**, eliminating the need for manual entity ID input or out-of-band registry checks

This replaces the hybrid approach described in §5.4 with a fully in-ecosystem mechanism.

#### 5.5.2 Content of a Representation EAA

Based on the regulatory framework and the RPaM (Representation Powers and Mandates) Ontology referenced in TS11, a Representation EAA would contain at minimum:

| Element | Description | Example |
|---------|-------------|---------|
| **Subject** | The natural person holding the mandate (linked to PID) | Linked to wallet holder's PID |
| **Represented entity** | The legal person being represented | "Beispiel GmbH", Handelsregisternummer HRB 12345 |
| **Type of power** | The nature of the representational authority | Director, authorized signatory, proxy holder, specific mandate |
| **Scope** | Boundaries of the authority granted | Full representation, limited to contracts under €50,000, tax matters only, etc. |
| **Validity period** | Temporal boundaries of the mandate | Start date / end date or open-ended |
| **Issuer** | The entity that attested the representation | QTSP or public sector body (see §5.5.3) |
| **Authentic source** | The registry or authority from which the mandate information originates | National company registry |

#### 5.5.3 Who Issues Representation EAAs?

The eIDAS framework provides **two issuance paths**, each with distinct trust characteristics:

**Path 1: Public Sector Body EAA (PuB-EAA) — Direct From the Registry**

A national company registry or similar public sector body, as the **authentic source** for representational authority and mandate information, issues the attestation directly:

- The Dutch **KvK** (Kamer van Koophandel) could issue a PuB-EAA stating "Person X is an authorized representative of Company Y"
- The German **Handelsregister** could issue a PuB-EAA for German companies
- The French **Infogreffe** (Registre du Commerce et des Sociétés) could do the same for French entities
- The Italian **Registro delle Imprese** (via InfoCamere) could issue PuB-EAAs for Italian companies

Under CIR 2025/1569 Art. 5, these public sector bodies must be **notified to the Commission** by their Member State. The Commission then publishes a list of these bodies (Art. 6), enabling Relying Parties to verify the attestation's provenance. Each notified body must demonstrate, via a conformity assessment report (Art. 5(4)), a level of trustworthiness equivalent to a Qualified Trust Service Provider.

This path is the **most authoritative** — the attestation comes directly from the source of truth for legal entity registration.

**Path 2: Qualified EAA (QEAA) — Via a QTSP**

A **Qualified Trust Service Provider** (QTSP) verifies the representation against the authentic source (company registry) and issues a QEAA:

- The QTSP queries the company registry's verification endpoint to confirm that Person X is an authorized representative of Company Y
- The QTSP issues a QEAA attesting this verified fact
- The verification mechanism is governed by CIR 2025/1569 Art. 9 — Member States must establish electronic verification endpoints so QTSPs can verify attributes against authentic sources at the request of the user

This path is the **scalable** option — QTSPs can operate across multiple Member States, issuing representation attestations for entities in any MS where verification endpoints are available. A single QTSP could serve a pan-European Relying Party's needs, rather than requiring integrations with 27 separate national registries.

```
┌──────────────────────────────────────────────────────────────────┐
│           Representation EAA Issuance — Two Paths                │
│                                                                  │
│  Path 1: PuB-EAA (direct)          Path 2: QEAA (via QTSP)     │
│                                                                  │
│  ┌───────────────┐                 ┌───────────────┐            │
│  │ Company       │                 │ QTSP          │            │
│  │ Registry      │                 │               │            │
│  │ (e.g. KvK,    │                 │ Verifies      │            │
│  │  Handels-     │──┐         ┌───►│ against       │            │
│  │  register)    │  │         │    │ registry      │            │
│  └───────┬───────┘  │         │    └───────┬───────┘            │
│          │          │         │            │                     │
│   Issues │     Authentic     │     Issues  │                     │
│   PuB-EAA│     source   Verification      QEAA                  │
│          │     data      endpoint          │                     │
│          ▼          │         │            ▼                     │
│  ┌──────────────────┴─────────┴──────────────────┐              │
│  │              Natural Person's Wallet           │              │
│  │                                                │              │
│  │  ┌─────────────┐   ┌──────────────────────┐   │              │
│  │  │ Personal PID│   │ Representation EAA   │   │              │
│  │  │ (identity)  │   │ (authority to act)   │   │              │
│  │  └─────────────┘   └──────────────────────┘   │              │
│  └────────────────────────────────────────────────┘              │
└──────────────────────────────────────────────────────────────────┘
```

#### 5.5.4 Legal Basis

**Annex VI of the Regulation, item 9** explicitly lists:

> *"Powers and mandates to represent natural or legal persons"*

This places representation powers among the attributes that **must be verifiable against authentic sources** under Art. 45e(1), with staggered application deadlines defined by the regulation and its implementing acts. Member States are legally required to make this verification possible for QTSPs.

Additionally, the **RPaM (Representation Powers and Mandates) Ontology** — developed under the EU's DE4A (Digital Europe for All) and SEMPER projects — provides a standardized semantic vocabulary for expressing mandates. TS11 (§2, attribute inclusion sources) explicitly references RPaM alongside SEMIC Core Vocabularies and the IANA JWT Claims Registry as inputs to the Catalogue of Attributes data model.

#### 5.5.5 Current Maturity

| Aspect | Status |
|--------|--------|
| **Legal basis** (representation as a verifiable attribute) | 🟢 Decided — Annex VI item 9, Art. 45e |
| **Issuance framework** (QTSP and PuB-EAA paths) | 🟢 Decided — CIR 2025/1569 |
| **Verification endpoints** (MS authentic source APIs for QTSPs) | 🟡 Specified in TS11 / ETSI TS 119 478, but MS deployments pending |
| **Attestation Rulebook** for "powers & mandates" | 🟠 Not yet published — rulebook template exists, specific rulebook under development |
| **RPaM Ontology integration** into Catalogue of Attributes | 🟡 Referenced in TS11, not yet formalized as a registered attribute schema |
| **QTSPs or public bodies actually issuing** Representation EAAs | 🔴 Not yet — dependent on verification endpoints and attestation rulebook |

**Bottom line:** Representation EAAs are legally mandated and the issuance framework is fully legislated, but **no entity is currently issuing them**. The prerequisite infrastructure — Member State verification endpoints, the Catalogue of Attributes, and the specific attestation rulebook for powers and mandates — is still being built. This confirms that the hybrid approach (§5.4) remains the only viable mechanism for legal person onboarding during the 2026–2027 period, with Representation EAAs expected to become available as the Catalogue of Attributes goes operational and QTSPs/public bodies begin issuance.

### 5.6 Impact Analysis by Phase

The three-phase migration path (§5.4.5) has distinct implications for VCQ requirements, wallet integration, and operational IT effort. This section provides a breakdown of what changes — and what does not — at each transition.

#### 5.6.1 Phase 1: Hybrid Approach (2026–2027)

**VCQ requirements impact: None.**

In Phase 1, the authorized representative authenticates as a natural person using the standard EUDI Wallet PID flow. This is already fully covered by existing VCQ requirements — PID verification, wallet trust chain validation, signature verification, revocation checks. No additional VCQ requirements are needed for the natural person identification step.

The registry check (verifying the entity against KvK, Handelsregister, etc.) operates **entirely outside the wallet ecosystem**. It is a traditional business verification process — no different from what financial institutions and regulated entities already perform for corporate client onboarding. The VCQ does not need to address it.

**Wallet integration changes: None.**

The RP's wallet-facing integration handles a standard natural person PID presentation. No changes to presentation requests, verification logic, or credential handling.

**Operational / IT effort:**

| Item | Effort | Notes |
|------|--------|-------|
| Registry API integrations | Medium | Per-country integration with company registries (KvK, Handelsregister, Infogreffe, Registro delle Imprese, etc.). Each registry has its own API format and authentication model. |
| Entity ID collection UX | Low | Onboarding flow requires a form field for the company registration number with a country selector. |
| Cross-referencing logic | Medium | Business logic to match the wallet-authenticated natural person's identity against the registry's records of authorized representatives. This is standard KYC-type work. |
| Multi-MS coverage | Variable | Effort scales with the number of EU markets served. A Netherlands-only RP needs only the KvK API. A pan-EU RP needs up to 27 per-country integrations — until the Catalogue of Attributes goes live. |

None of this work is wallet-specific. It is the same type of corporate verification that regulated entities already perform, with the person identification step upgraded from traditional eID or in-person verification to wallet-level assurance.

#### 5.6.2 Phase 2: Representation EAAs (~H2 2026–2027)

**VCQ requirements impact: Low-to-Moderate — incremental additions using existing mechanisms.**

An EAA (Electronic Attestation of Attributes) is verified using the **same pipeline** as a PID. The following comparison demonstrates that no fundamentally new verification mechanisms are required:

| Verification step | PID | Representation EAA | Same mechanism? |
|---|---|---|---|
| Signature validation | ✅ | ✅ | Yes — same cryptographic verification |
| Issuer trust check | Against PID Provider on LoTE | Against QTSP or notified PuB on trusted list | Yes — same trusted list infrastructure |
| Revocation check | ✅ | ✅ | Yes — same revocation protocol |
| Schema/format validation | mDoc or SD-JWT VC | mDoc or SD-JWT VC | Yes — same credential formats |
| Presentation protocol | OID4VP | OID4VP | Yes — same protocol |

The incremental VCQ additions for Phase 2 are **configuration and business logic changes, not infrastructure changes**. The RP does not need a new verification stack, new cryptographic libraries, or new protocols. The following examples illustrate the before/after:

**1. Presentation request definition**

In Phase 1, the RP's OID4VP presentation request asks for a PID only:
> *"Present a PID with `family_name`, `given_name`, `birth_date`"*

In Phase 2, the same request is extended to include a second credential:
> *"Present a PID with `family_name`, `given_name`, `birth_date` **and** a Representation EAA with `legal_entity_name`, `mandate_type`, `mandate_scope`"*

This is an update to the presentation definition configuration — adding one more credential entry to the same JSON structure. The protocol (OID4VP) and the flow remain identical.

**2. Binding validation**

In Phase 1, there is only one credential (the PID), so no binding check is needed.

In Phase 2, after receiving both credentials, the RP performs a field comparison:
> *"Does the `subject_id` in the Representation EAA match the `subject_id` in the PID?"*

This ensures the person claiming to represent the legal entity is the same person who authenticated. It is a single field comparison within the existing verification pipeline, not a new protocol.

**3. Acceptance policy**

In Phase 1, the RP accepts PIDs from PID Providers listed on the LoTE (already a standard VCQ requirement).

In Phase 2, the acceptance policy is extended:
> *"Accept Representation EAAs from QTSPs listed on the EU Trusted List, or from notified public sector bodies published per CIR 2025/1569 Art. 6"*

This uses the same trusted list lookup mechanism — the RP checks a different category of issuer on the same list.

**4. Representation attribute interpretation**

This is the only genuinely new work: the RP must define business rules for how to interpret the mandate attributes from the EAA. For example, what does `mandate_scope = full_representation` versus `mandate_scope = tax_matters_only` mean for the RP's access control? This involves business decisions specific to the RP's domain, not technical infrastructure.

**What does NOT change between Phase 1 and Phase 2:**

| Mechanism | Phase 1 (PID) | Phase 2 (PID + EAA) | Changes? |
|-----------|---------------|----------------------|----------|
| Credential signature verification | ✅ | ✅ Same — EAA signatures verified identically to PID signatures | No |
| Issuer lookup on trusted list | ✅ | ✅ Same — different issuer category, same lookup mechanism | No |
| Revocation status check | ✅ | ✅ Same — same revocation protocol | No |
| Credential format parsing (mDoc / SD-JWT VC) | ✅ | ✅ Same — EAA uses the same formats | No |
| OID4VP presentation response handling | ✅ | ✅ Same — response contains two credentials instead of one | No |

**Wallet integration changes: Minor.**

The RP's OID4VP presentation request is updated to ask for both a PID **and** a Representation EAA. This is a configuration change to the presentation definition, not a new protocol implementation.

**Operational / IT impact: Simplification.**

| Item | Change from Phase 1 | Notes |
|------|---------------------|-------|
| Registry API integrations | **Can be retired** | Replaced by standardized Catalogue of Attributes verification endpoints — a single API for all 27 MSs |
| Entity ID collection UX | **Eliminated** | The entity information comes from the EAA — no manual input required |
| Cross-referencing logic | **Simplified** | The binding between person and entity is cryptographic (EAA subject = PID holder), replacing business-logic cross-referencing |
| Multi-MS coverage | **Solved** | Single Catalogue API replaces per-country registry integrations |

Phase 2 **reduces** overall operational complexity. The per-registry integrations built in Phase 1 become unnecessary, and the manual input step is eliminated entirely.

#### 5.6.3 Phase 3: Full EBW (2028–2029)

**VCQ requirements impact: Moderate — new credential type.**

This is where substantive VCQ changes are required:

1. **Legal person PID acceptance** — the RP must accept a legal person PID with a different attribute set from the natural person PID (`current legal name` + unique identifier, instead of name/birthdate/nationality). See §4.2.2 for the complete attribute table.
2. **EBW trust chain validation** — the RP must verify the EBW's Wallet Unit Attestation against the trusted list. This uses the same mechanism as EUDI Wallet WUA verification, but checks for EBW-specific entries on the trusted list.
3. **Dual-credential flows** — in some scenarios, the natural person authenticates with their EUDI Wallet while the legal entity authenticates via EBW. The RP must handle both presentations and validate the representation link between them.

However, the EBW shares the **same trust infrastructure** (LoTEs, ACAs, Registrars, Wallet Unit Attestation framework per CIR 2024/2980) as the EUDI Wallet. The verification pipeline processes a different credential type, but the underlying protocols and trust mechanisms are identical.

**Wallet integration changes: Minor — if Phase 2 is already implemented.**

| Item | Change from Phase 2 | Notes |
|------|---------------------|-------|
| Credential acceptance | Accept legal person PID from EBW | New credential type, but same protocol (OID4VP) and same formats (mDoc / SD-JWT VC) |
| Trust chain verification | Add EBW entries to trusted list checks | Same infrastructure, additional entries |
| Business process | Streamlined | Direct legal entity authentication; the two-step representation binding is no longer needed for simple cases |

**Operational / IT impact: Low incremental (building on Phase 2).**

If Phase 2 is already operational, Phase 3 adds only the ability to accept a new credential type through the same pipeline. The operational complexity is lower than Phase 1.

#### 5.6.4 Consolidated Impact Matrix

| Dimension | Phase 1 (Hybrid) | Phase 2 (EAAs) | Phase 3 (EBW) |
|-----------|------------------|----------------|---------------|
| **VCQ changes needed** | ❌ None | 🟡 Minor — EAA acceptance requirements (same verification mechanisms) | 🟠 Moderate — legal person PID + EBW trust chain requirements |
| **Wallet integration changes** | ❌ None | 🟡 Minor — OID4VP request includes EAA | 🟡 Minor — accept EBW presentations |
| **Non-wallet IT work** | 🟠 Per-country registry API integrations | ✅ Replaced by Catalogue API | ✅ Not needed |
| **Manual onboarding steps** | 🟠 Entity ID input by representative | ✅ Eliminated | ✅ Eliminated |
| **Multi-MS scalability** | 🔴 Effort scales with number of markets | ✅ Single Catalogue API | ✅ Native |
| **Overall RP effort** | Medium (familiar KYC-type work) | Low incremental (pipeline reuse) | Low incremental (same trust infrastructure) |

The heaviest IT lift occurs in **Phase 1** — the per-country registry integrations. That investment is progressively replaced by standardized ecosystem mechanisms in Phases 2 and 3. Each subsequent phase reduces operational complexity while requiring only minor, incremental wallet integration updates, because the EUDI Wallet trust infrastructure (LoTEs, OID4VP, mDoc/SD-JWT VC, revocation protocols) is reused across all credential types.

---

## 6. The European Business Wallet (EBW) Initiative

### 6.1 Origin & Legislative Reference

The "separate business wallet" referenced in ARF Topic 28 has now materialized as a **formal legislative proposal**:

> **COM(2025) 838** — Proposal for a Regulation of the European Parliament and of the Council on the establishment of European Business Wallets
>
> Published: **18–19 November 2025**
> Legal basis: **Article 114 TFEU** (internal market harmonization)
> Status: **Ordinary legislative procedure** (requires EP + Council approval)

This confirms the ARF's descoping was deliberate and planned — the Commission always intended to address legal persons through a dedicated regulation rather than squeezing them into the citizen-focused EUDI Wallet ARF.

### 6.2 Recital 12 — The Legislative Bridge

Recital 12 of Regulation (EU) 2024/1183 explicitly foreshadows the EBW:

> *"The European Digital Identity Wallet should provide natural and legal persons across the Union with a harmonised electronic identification means enabling authentication and the sharing of data linked to their identity."*

This Recital establishes the **legislative intent** that was later fulfilled by COM(2025) 838. In the RCA audit trackers, Recital 12 is tagged as:
- **Wallet Provider audit:** `➖` (Art. 5a scope covered)
- **Relying Party audit:** `➖` (Legal person user context)

### 6.3 EBW Scope & Target Users

The EBW is designed for **all economic operators**, not just large enterprises:

| Target Group | Included |
|-------------|----------|
| Large enterprises | ✅ |
| SMEs | ✅ |
| Sole traders | ✅ |
| Self-employed professionals | ✅ |
| Public sector bodies | ✅ (mandatory holders) |

**Interaction contexts covered:**
- **B2G** — Submitting documents, applying for licenses, regulatory reporting
- **B2B** — Secure authentication and data exchange between companies
- **B2C** — Interactions with consumers
- **G2G** — Exchanges between public sector bodies

### 6.4 EBW Roadmap & Timeline

```
2024 May         eIDAS 2.0 (Reg. 2024/1183) enters into force
     Nov         Implementing acts adopted
                 │
2025 Nov 18-19   COM(2025) 838 — EBW proposal published
                 │
2026             EBW-ready field tests commence (projected)
     Dec         EUDI Wallet mandatory for Member States
                 (at least one wallet per MS)
                 │
2027             Public authorities ready to support EBW
     Jul         Regulated industries must accept EUDI Wallet
     Dec         Very large online platforms must accept EUDI Wallet
                 │
2028-2029        EU-wide acceptance of European Business Wallet
                 (projected)
```

**Key obligations:**
- **Public authorities** must accept EBW core functions within **24 months** of entry into force (some transitional periods up to 36 months)
- **Public bodies** must also **hold their own EBW** for document/notification exchange
- **Use is optional** for businesses — no mandate to adopt, but strong incentives (est. **€150 billion** annual cost savings cited by Commission)

### 6.5 Relationship Between EUDI Wallet and EBW

The EBW is **not** a separate silo — it is designed to interoperate with the EUDI Wallet ecosystem:

```
┌──────────────────────────────────────────────────────────────┐
│                  eIDAS 2.0 Trust Framework                    │
│                                                              │
│  ┌─────────────┐         ┌──────────────────┐                │
│  │ EUDI Wallet │◄───────►│ European Business│                │
│  │ (Natural    │  Inter- │ Wallet (Legal    │                │
│  │  Persons)   │  opera- │  Persons)        │                │
│  └──────┬──────┘  bility └────────┬─────────┘                │
│         │                         │                          │
│         │    ┌────────────────┐   │                          │
│         └───►│ Representation │◄──┘                          │
│              │ Layer          │                               │
│              │ (Natural person│                               │
│              │  acting for    │                               │
│              │  legal person) │                               │
│              └────────────────┘                               │
│                                                              │
│  Shared infrastructure:                                      │
│  - Trust anchors & LoTEs                                     │
│  - Access Certificate Authorities                            │
│  - Registrar framework                                       │
│  - Single Digital Gateway (SDG)                              │
│  - Once-Only Technical System (OOTS)                         │
└──────────────────────────────────────────────────────────────┘
```

**Key interoperability design:**
- An individual authenticates with their **EUDI Wallet** while the organization's **EBW** provides the legal mandate for their actions
- Both wallets share the same trust infrastructure (LoTEs, ACAs, Registrars)
- The EBW integrates with existing EU systems: **Single Digital Gateway (SDG)** and **Once-Only Technical System (OOTS)**
- Wallet Unit Attestations follow the same trust list framework (Commission Implementing Regulation (EU) 2024/2980)

### 6.6 EBW Technical Requirements

The COM(2025) 838 proposal outlines these technical requirements for EBW:

| Requirement | Detail |
|-------------|--------|
| **Verified Business Identity** | Based on eIDAS framework; unique, persistent digital identity recognized across all 27 MS |
| **Secure Cryptographic Applications** | Providers must ensure wallets use secure cryptographic applications and devices |
| **Wallet Unit Attestations** | Each EBW unit must generate and sign a unit attestation, signed under a trusted list (per IR 2024/2980) |
| **Interoperability** | Must integrate with EUDI Wallet, SDG, and OOTS |
| **Standardized Credential Types** | Licenses, certificates, registrations, and declarations follow shared European standards |
| **Secure Data Exchange** | Encrypted data exchange between issuers, service providers, and companies |
| **Technological Neutrality** | Emphasis on technology-neutral, flexible, future-proof design |
| **International Alignment** | Support for global identifiers for European businesses operating internationally |

### 6.7 Standardization Efforts

CEN and CENELEC are actively developing:
- Standardized protocols for enterprise wallets
- Alignment with international standards
- Data schemas for legal person attestations

Large-scale pilot projects have been testing various B2G and B2B use cases and defining data schemas for legal person attestations to ensure interoperability.

---

## 7. Remaining Gaps & Open Questions

### 7.1 EBW Adoption Timeline Uncertainty

While the COM(2025) 838 proposal was published in November 2025, the ordinary legislative procedure means adoption is still ahead:
- As of February 2026, the proposal remains in the **preparatory phase** within the European Parliament
- EP committee assignments, rapporteur appointment, and Council working group discussions are pending
- Trilogues may modify requirements
- Entry into force date is not yet fixed — public authority readiness is projected ~2027–2028 at earliest, assuming the legislative process proceeds without major delays

### 7.2 Representation Attestations for Legal Persons

The regulatory framework for Representation EAAs is now largely defined (see §5.5 for a detailed analysis of the mechanism, content, issuance paths, and current maturity). Several questions from earlier research are now answered:
- **Attestation format:** mDoc or SD-JWT VC, same formats as PID (§5.6.2)
- **Revocability:** Yes — same revocation protocol as PID (§5.6.2)
- **Scope of authority:** Defined via mandate type and scope attributes in the EAA (§5.5.2)

**Remaining open questions:**
- How will the EUDI Wallet / EBW interplay work at the **protocol level** for representation? (i.e., when a natural person uses their EUDI Wallet to act on behalf of a legal entity that also holds an EBW — which wallet leads the presentation?)
- What specific mandate types and scope values will the official attestation rulebook for "powers & mandates" (Annex VI, item 9) define? The EWC LSP Signatory Rights Rulebook (rb004) provides an early draft, but the Commission-level rulebook has not yet been published.

### 7.3 Cross-Border Legal Person Identification

As of February 2026, the cross-border identification mechanism for legal persons is defined but not yet operational. CIR 2025/1569 + TS11 establish the Catalogue of Attributes with per-MS verification endpoints and semantic normalization (see §4.2.4 for details). **Remaining gap:** The catalogue itself is not yet operational (12-month applicability delay from CIR entry into force) and individual Member State verification endpoints have not yet been deployed.

### 7.4 Legal-Person PID Structure

As of February 2026, the legal person PID structure is fully defined. CIR 2024/2977 Annex, Section 2 specifies it as a set of mandatory + optional data elements with required metadata, following the same structural pattern as the natural person PID. The legal person PID is structurally simpler: only 2 mandatory attributes (`current legal name` + MS-constructed unique identifier) versus 5 for natural persons. See §4.2.2 for the complete attribute table.

---

## 8. Recommendations

1. **Implement natural/legal person filtering** — The regulatory basis is clear and strong. Different onboarding flows should be supported.

2. **Use the tri-partite model** — Design filtering around three entity types:
   - Natural person (self)
   - Legal person (via representative)
   - Natural person representing another natural person

3. **Track COM(2025) 838 progress** — Monitor the ordinary legislative procedure for the EBW regulation. Key milestones to watch:
   - EP committee assignments and rapporteur appointment
   - Council working group discussions
   - Trilogue outcome
   - Final text publication in Official Journal

4. **Design for extensibility** — Current VCQ/RCA requirements should accommodate legal person attributes even where the ARF descopes them, as the legislative mandate is clear and the EBW proposal is now public.

5. **Consider EBW integration points** — The EBW's emphasis on SDG and OOTS integration means that Wallet Providers and Relying Parties should prepare for cross-system interoperability beyond the current EUDI Wallet scope.

6. **Prepare for Catalogue of Attributes operationalization** — Once the catalogue becomes operational (~H2 2026, per CIR 2025/1569 Art. 11 applicability delay), RPs should integrate with its discovery API (TS11 §3.1) and prepare to use the standardized verification interfaces (TS11 §3.2) for attribute verification against MS authentic sources. Early integration planning is advisable given the 12-month runway.

---

## 9. Source References

| Source | Location |
|--------|----------|
| Regulation (EU) 2024/1183 | `01_legislation/docs/` |
| Consolidated Regulation (EU) No 910/2014 | `01_regulation/2014_910_eIDAS_Consolidated/02014R0910-20241018.md` |
| **CIR 2024/2977** (PID and EAA) | `02_implementing_acts/2024_2977_PID_and_EAA/32024R2977.md` |
| **CIR 2025/1569** (EAA, Catalogue of Attributes) | `02_implementing_acts/2025_1569_Sign_Creation_Devices/32025R1569.md` |
| ARF Main Document | `03_arf/docs/architecture-and-reference-framework-main.md` |
| ARF Annex 2 (HLRs by Topic) | `03_arf/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md` |
| Discussion Paper: Topic I | `03_arf/docs/discussion-topics/i-natural-person-representing-another-natural-person.md` |
| Discussion Paper: Topic O (Catalogues) | `03_arf/docs/discussion-topics/o-catalogues-for-attestations.md` |
| **TS11** (Catalogue Interfaces & Formats) | `04_technical_specs/docs/technical-specifications/ts11-interfaces-and-formats-for-catalogue-of-attributes-and-catalogue-of-schemes.md` |
| TS2 (Notification/Publication) | `03_arf/docs/technical-specifications/ts2-notification-publication-provider-information.md` |
| TS5 (RP Registration Formats) | `03_arf/docs/technical-specifications/ts5-common-formats-and-api-for-rp-registration-information.md` |
| TS6 (RP Registration Info) | `03_arf/docs/technical-specifications/ts6-common-set-of-rp-information-to-be-registered.md` |
| TS10 (Data Portability) | `03_arf/docs/technical-specifications/ts10-data-portability-and-download-(export).md` |
| TS14 (ZKPs) | `03_arf/docs/technical-specifications/ts14-zkps-mms.md` |

### External Sources (Web Research — 2026-02-16)

| Source | Description |
|--------|-------------|
| [COM(2025) 838](https://europa.eu) | European Commission proposal for European Business Wallets regulation |
| [businesswallet.eu](https://www.businesswallet.eu) | Independent knowledge platform for EU digital business identity |
| [spherity.com](https://spherity.com) | EBW roadmap analysis and timeline projections |
| [cheqd.io](https://cheqd.io) | Analysis of EBW adoption obligations and timeline |
| [digitaleurope.org](https://digitaleurope.org) | Industry perspective on EBW requirements and interoperability |
| [ipex.eu](https://ipex.eu) | Legislative tracking for COM(2025) 838 |
| [EWC Rulebooks & Schemas (GitHub)](https://github.com/EWC-consortium/eudi-wallet-rulebooks-and-schemas) | EWC Large Scale Pilot rulebooks and JSON data schemas — non-binding pilot artifacts including LPID, Signatory Rights, EU Company Certificate, and UBO rulebooks |
| [Commission Attestation Rulebooks Catalog (GitHub)](https://github.com/eu-digital-identity-wallet/eudi-doc-attestation-rulebooks-catalog) | Official Commission-maintained attestation rulebooks repository |
| [RPaM Ontology (ISA2)](https://joinup.ec.europa.eu/collection/rpam) | Representation Powers and Mandates Ontology — ISA2 Action 2016.12 |
| [DE4A Project](https://www.de4a.eu) | Digital Europe for All — cross-border digital public services, including Multilingual Ontology Repository and RPaM integration |
