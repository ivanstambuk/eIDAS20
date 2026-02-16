# Corporate Group Structures and Relying Party Registration in eIDAS 2.0

> **Research Date:** 2026-02-16  
> **Status:** Complete — analysis of how corporate groups (holding companies, subsidiaries) map to eIDAS RP registration  
> **Context:** Investigating whether a parent/holding company can register as a single Relying Party on behalf of its subsidiaries, or whether each legal entity within a corporate group must register independently.

---

## 1. Executive Summary

Under eIDAS 2.0, **each legal entity that relies on EUDI Wallets must register as a separate Relying Party**. A parent or holding company cannot register once on behalf of all subsidiaries. This follows directly from:

1. The Article 3(6) definition of "relying party" as *"a natural or legal person"* — each subsidiary is a distinct legal person.
2. Article 5b(1), which requires registration *"in the Member State where [the relying party] is established"* — pointing to individual legal entity establishment.
3. The RP Access Certificate architecture (ARF Topic 27, 44, 52), which binds certificates to specific legal entities with unique identifiers.

However, the regulation **does** accommodate shared infrastructure through the **intermediary** mechanism (Article 5b(10), ARF Topic 52), which allows a technical service provider — including an intra-group shared services entity — to handle wallet interactions on behalf of individually registered RPs.

---

## 2. Regulatory Basis

### 2.1 Definition of "Relying Party"

> **Article 3(6):** *"'relying party' means a natural or legal person that relies upon electronic identification, European Digital Identity Wallets or other electronic identification means, or upon a trust service"*

The definition is anchored to **a** legal person — not "a group of legal persons" or "an undertaking". Each entity with separate legal personality under national company law constitutes a distinct potential RP.

### 2.2 Registration Requirement

> **Article 5b(1):** *"Where a relying party intends to rely upon European Digital Identity Wallets for the provision of public or private services by means of digital interaction, the relying party shall register in the Member State where it is established."*

Key implications for corporate groups:

| Scenario | Consequence |
|----------|-------------|
| Holding company incorporated in NL, subsidiary in DE | Each registers in its own Member State |
| Two subsidiaries incorporated in the same Member State | Each registers separately (different legal persons, different registration numbers) |
| Holding company does not itself interact with wallets | Holding company does not need to register as RP |
| Subsidiary uses wallets for customer onboarding | Subsidiary must register with its own identity |

### 2.3 Registration Data Requirements

> **Article 5b(2):** The relying party shall provide at least:
> - *(a)(ii)* the name of the relying party and, where applicable, **its registration number as stated in an official record** together with identification data of that official record;
> - *(b)* the contact details of the relying party;
> - *(c)* the intended use of European Digital Identity Wallets, including an indication of the data to be requested.

The registration number requirement ties RP registration to a **specific legal entity** (e.g., a specific KvK number, Handelsregister number, or Company House number). A holding company's registration number is not its subsidiary's — they are distinct entries in the same or different national registers.

### 2.4 Intermediary Provision

> **Article 5b(10):** *"Intermediaries acting on behalf of relying parties shall be deemed to be relying parties and shall not store data about the content of the transaction."*

This provision is the regulation's mechanism for accommodating shared technical infrastructure. An intermediary:
- Is itself treated as an RP and must register independently
- Can handle wallet interactions on behalf of multiple End-Relying Parties
- Is prohibited from storing transaction content data
- Must present both its own identity and the End-RP's identity to the wallet user

### 2.5 Risk Register Evidence — TR40

The ARF Risk Register ([CIR 2024/2981 Annex I](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202402981#anx_I)) contains **threat TR40**, which explicitly addresses multi-entity RPs:

> **TR40:** *"A relying party that consists of multiple units/entities that each have a different scope of what they are allowed to request/process, can request and process data for which they do not have lawful grounds for."*
> — Related risks: Data disclosure (R6) / Unauthorised transaction (R9)

This is the only threat in the entire register that addresses an RP with multiple units or entities. It demonstrates that the per-entity registration model — with separate RPRCs per intended use — is a **deliberate security design choice** to mitigate the risk of one part of a corporate group accessing data beyond its scope. The corporate group scenario is precisely the situation TR40 was designed to prevent.

---

## 3. Architecture and Reference Framework (ARF) Analysis

### 3.1 RP Access Certificates (RPAC) — Per Entity

The ARF's Topic 27 (Registration) and Topic 44 (Registration Certificates) establish that:

- Each RP receives its own **RP Access Certificate** (RPAC) containing its unique identifier and common name
- The RPAC is used for mutual authentication in OID4VP — the wallet verifies *who* is requesting data
- A wallet user sees the **name of the specific legal entity** requesting their data, not the corporate group

This is by design: the wallet user has the right to know exactly which legal entity they are sharing data with. A group-level registration would obscure this information, undermining the data minimization and transparency principles of eIDAS.

### 3.2 Intermediary Architecture — ARF Topic 52

The intermediary requirements come from two sources: the **ARF Annex 2** ([Topic 52 HLRs](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2330-topic-52-relying-party-intermediaries)) and the **[Discussion Paper: Topic X (Relying Party Registration)](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/discussion-topics/x-relying-party-registration.md)** (Section 3.5, with proposed HLR changes).

**From ARF Annex 2 (current HLRs):**

> **RPI_01:** *"An intermediary SHALL register as a Relying Party, in accordance with all requirements in Topic 27, while indicating it intends to act as an intermediary."*
> — Note: *"This implies that an intermediary obtains an access certificate containing its own name and unique Relying Party identifier."*

> **RPI_03:** *"An intermediary SHALL register each intermediated Relying Party it is acting on behalf of at a Registrar in the Member State where the intermediated Relying Party is established, according [to] all requirements in Topic 44. If a Provider of registration certificates associated with the Registrar issues registration certificates, the intermediary SHALL receive a registration certificate for each of the registered intended uses of the intermediated Relying Party."*

> **RPI_06:** *"When requested by an intermediated Relying Party, an intermediary SHALL request a presentation of attributes from a specific Wallet Unit. In the request, the intermediary SHALL include the intermediary's access certificate meant in requirement RPI_01 and the registration certificate of the Relying Party, as meant in RPI_03, if available."*

> **RPI_07:** *"In case a Wallet Unit receives a presentation request from an intermediary on behalf of an intermediated Relying Party, it SHALL display the names and identifiers of both the intermediary and the intermediated Relying Party to the User when asking for User approval."*

**From Discussion Paper X (§3.5, proposed changes):**

> **RPI_03 (proposed):** *"For each of the End-Relying Parties that uses its services, an intermediary SHALL possess a registration certificate for each registered intended use of the said End-Relying Party [...] This registration certificate SHALL contain that End-Relying Party's name and unique identifier, as well as the list of attributes registered for that Relying Party's intended use."*

This means:
1. The intermediary authenticates with **its own** RPAC
2. It presents the **End-RP's** Registration Certificate (RPRC) for the specific intended use
3. The wallet shows **both names** to the user (e.g., "Group IT Services acting on behalf of Subsidiary Bank")
4. The intermediary must hold separate RPRCs for **each** End-RP and **each** intended use

### 3.3 Certificate Architecture Summary

```
Corporate Group "Alpha Group N.V." (Holding — not an RP)
│
├── Alpha IT Services B.V. (Intermediary RP)
│   ├── RPAC: own certificate as intermediary
│   ├── RPRC for Alpha Bank N.V., intended use: customer onboarding
│   ├── RPRC for Alpha Insurance N.V., intended use: claims verification
│   └── RPRC for Alpha Leasing B.V., intended use: contract signing
│
├── Alpha Bank N.V. (End-Relying Party)
│   └── Registered in MS registry with own KvK number
│
├── Alpha Insurance N.V. (End-Relying Party)
│   └── Registered in MS registry with own KvK number
│
└── Alpha Leasing B.V. (End-Relying Party)
    └── Registered in MS registry with own KvK number
```

What the wallet user sees:
- **Intermediary name:** "Alpha IT Services B.V."
- **End-Relying Party name:** "Alpha Bank N.V."
- **Intended use:** "Customer identity verification for account opening"

---

## 4. What Can and Cannot Be Shared Within a Corporate Group

### 4.1 Can Be Shared

| Aspect | Details |
|--------|---------|
| **Technical Infrastructure** | A single wallet integration platform can serve all group entities. The intermediary pattern (Art. 5b(10)) explicitly supports this. |
| **Development & Maintenance** | One engineering team can build and maintain the OID4VP implementation. |
| **Core VCQ Compliance** | Technical compliance assessment for the shared platform can be conducted once and applied across the group, reducing duplication. |
| **Operational Monitoring** | Centralized monitoring, logging, and incident response for the shared platform. |

### 4.2 Cannot Be Shared

| Aspect | Details |
|--------|---------|
| **RP Registration** | Each entity registers separately in its Member State (Art. 5b(1)). |
| **RP Access Certificates** | Each entity (or the intermediary on its behalf) needs its own RPAC/RPRC (ARF Topic 27, 44, 52). |
| **Data Processing Purposes** | Each entity must declare its own intended use and data attributes (Art. 5b(2)(c)). Different subsidiaries may need different data. |
| **Privacy Policies** | Each entity defines its own data retention and processing policies per GDPR. |
| **Regulatory Obligations** | Each licensed entity (bank, insurer, etc.) has its own compliance obligations under sectoral regulation (PSD2, Solvency II, etc.). |
| **User-Facing Identity** | The wallet user must see which specific legal entity is requesting their data (ARF RPI_07, RPA_06a). |

---

## 5. Implications for RCA and VCQ

### 5.1 RCA Scope — Per Legal Entity, Unchanged

The RCA (Regulatory Compliance Assessment) covers obligations that fall on the **organisation itself** — registration with authorities, internal governance, personnel, financial obligations. These are inherently per legal entity:

- **Each subsidiary** must independently assess its own regulatory obligations
- A holding company **cannot** satisfy RCA obligations on behalf of a subsidiary
- The corporate group structure is invisible to the RCA — it assesses each entity as a standalone RP

**Key implication:** The RCA does not need new requirements for corporate groups. The existing per-entity model already covers this correctly. Each subsidiary's RCA will include its own registration obligation (Art. 5b(1)), its own data protection obligations (GDPR controller status), and its own sectoral compliance (PSD2, DORA, Solvency II, etc.).

### 5.2 VCQ Scope — Deployment Architecture Matters

The VCQ (Vendor Compliance Questionnaire) assesses the **product**, not the organisation. The question is: *does the product need to support multi-RP deployments, and if so, do the VCQ requirements change?*

The answer depends on the **deployment architecture** (cf. DEC-289):

#### Architecture 1: Intermediary (`intermediary`)

> *Vendor acts as RP on behalf of the customer. Vendor holds its own RPAC and interacts with wallets directly.*

In this model, the vendor **is** the intermediary (Art. 5b(10)). For corporate groups:
- The vendor registers as an intermediary RP
- The vendor holds RPRCs for each End-RP (each subsidiary)
- RPI_01 through RPI_10 (including sub-items RPI_06a, RPI_07a, RPI_07b) all apply **to the vendor** operationally
- The VCQ already covers this — intermediary-specific requirements (prefix `VEND-INT`) are scoped to this architecture

**Multi-RP impact:** The vendor's product **must** natively support multiple End-RPs. This is inherent to the intermediary model — one intermediary, many End-RPs. No additional VCQ changes needed beyond what DEC-289 already established.

#### Architecture 2: Direct SaaS (`direct_saas`)

> *Customer is the RP. Vendor provides hosted connector service. Customer maintains own RP registration.*

In this model, the vendor provides infrastructure but the **customer (or its subsidiary) is the RP**. For corporate groups:
- Each subsidiary is a direct RP with its own RPAC/RPRC
- The vendor's platform hosts multiple RP tenants
- The vendor is **not** an intermediary — it's a technology provider

**Multi-RP impact:** The product must support **multi-tenancy** with proper isolation:

| Concern | Requirement |
|---------|-------------|
| Certificate management | Each tenant has its own RPAC/RPRC key material; the platform must not share keys across tenants |
| Data isolation | Transaction records, audit logs, and received attributes must be strictly isolated per tenant |
| Intended use configuration | Each tenant configures its own data request scopes independently |
| User-facing identity | The wallet user sees the specific subsidiary's name (from that tenant's RPAC), not the platform or group name |
| Compliance reporting | Each tenant can independently export its own compliance evidence |

**VCQ implication:** The existing VCQ requirements apply per tenant instance, but we should add a **cross-cutting multi-tenant support assessment** (see §5.4 below).

#### Architecture 3: Direct Self-Hosted (`direct_onprem`)

> *Customer is the RP. Deploys vendor software on own infrastructure. Vendor delivers binaries/containers; customer manages all operations.*

In this model, the vendor delivers software that the customer deploys. For corporate groups:

**Option A — Separate instances:** Each subsidiary deploys its own instance. No multi-RP concern — each instance is single-tenant. The VCQ assesses the product as-is.

**Option B — Shared instance (proxy model):** The group deploys one instance to serve multiple subsidiaries. This is the "proxy" or shared services model where a group IT entity operates the platform. From an eIDAS perspective:

- If the group IT entity **handles wallet interactions on behalf of subsidiaries**, it is an intermediary under Art. 5b(10), regardless of whether it's an internal entity or a third party. The regulation does not distinguish.
- If the group IT entity merely provides infrastructure but **each subsidiary authenticates with its own RPAC directly**, it is a hosting provider, not an intermediary.

**VCQ implication:** Same as SaaS multi-tenancy. The product must support tenant isolation if deployed in shared mode. The deployment being on-prem doesn't change what the *product* needs to support — it just shifts *operational responsibility* to the customer.

### 5.3 Deployment × Concern Matrix

| Concern | Intermediary | Direct SaaS | Direct Self-Hosted (shared) | Direct Self-Hosted (separate) |
|---------|:-----------:|:-----------:|:---------------------------:|:----------------------------:|
| Multi-RP certificate management | ✅ Vendor | ✅ Vendor platform | ✅ Customer platform | ❌ N/A |
| Data isolation between entities | ✅ Vendor | ✅ Vendor platform | ✅ Customer responsibility | ❌ N/A |
| Intermediary HLRs (RPI_01–10 incl. sub-items) | ✅ Apply to vendor | ❌ Not applicable | ⚠️ Apply if shared entity routes wallet requests | ❌ N/A |
| No-storage obligation (Art. 5b(10)) | ✅ Vendor | ❌ N/A | ⚠️ Applies if intermediary | ❌ N/A |
| Per-entity RPAC/RPRC binding | ✅ Product feature | ✅ Product feature | ✅ Product feature | ✅ Trivial (1:1) |
| TR40 risk mitigation | ✅ Product must enforce scope separation | ✅ Product must enforce | ✅ Product must enforce | ✅ Inherent isolation |
| Who registers as RP? | Vendor + each End-RP | Each subsidiary | Group IT entity (as intermediary) + each subsidiary | Each subsidiary |
| VCQ assesses | Product + vendor operations | Product | Product | Product |

### 5.4 Recommended VCQ Addition for Multi-RP Support

The VCQ should add a **cross-cutting assessment question** applicable to both `intermediary` and `direct_saas` deployment architectures (and conditionally to `direct_onprem` when deployed in shared mode):

> **VEND-MULTI-01: Multi-Relying-Party Support**
>
> *Does the vendor's product support deployments where a single platform instance serves multiple distinct legal entities as separate Relying Parties?*
>
> Assessment criteria:
> - (a) Can the platform manage multiple RPACs and RPRCs simultaneously, with independent key material per entity?
> - (b) Is data isolation enforced between entities (transaction records, audit logs, received attributes)?
> - (c) Can intended use declarations and data request scopes be configured independently per entity?
> - (d) Does the platform correctly bind the right RPRC to each wallet transaction based on the requesting entity?
> - (e) Can each entity independently export its own compliance evidence and audit trails?
> - (f) Does the platform enforce scope boundaries to prevent one entity from accessing another entity's data? *(TR40 mitigation; complements VEND-INT-020 for intermediary deployments)*

**Category:** Registration & Notification (or cross-cutting)
**Deployment architectures:** `intermediary`, `direct_saas` (conditionally `direct_onprem`)

### 5.5 Platform-Level vs. Entity-Level Assessment

For a vendor providing an EUDI Wallet integration platform to a corporate group, the VCQ assessment has a dual structure:

**Platform-Level Assessment (once):**
- Protocol compliance (OID4VP, mDoc/SD-JWT VC)
- Cryptographic requirements
- Security architecture
- Integration with Trust Framework (Trusted Lists, revocation checking)
- Technical interoperability
- **Multi-RP support capabilities (VEND-MULTI-01)**

**Entity-Level Assessment (per subsidiary):**
- Verification that its RP registration is complete and valid
- Validation that its intended use declarations match actual data requests
- Confirmation that its data processing policies are GDPR-compliant
- Alignment with sectoral regulatory requirements (for regulated entities)
- Correct RPRC binding to the intermediary's RPAC (if using intermediary pattern)

### 5.6 What Does NOT Change

To be explicit about what is **not** affected by corporate group considerations:

- **RCA requirements** — remain per-entity, no new requirements needed
- **VCQ requirement content** — each existing VCQ requirement applies identically whether the product serves one RP or fifty; the requirements themselves don't change, only the deployment capability question is added
- **Regulatory obligations** — Art. 5b requirements are per-RP regardless of corporate structure
- **ARF HLRs** — Topic 27, 44, 52 requirements apply identically to corporate subsidiaries and standalone RPs

---

## 6. Cross-Border Considerations

Corporate groups frequently operate across multiple Member States. Key considerations:

### 6.1 Multi-Jurisdiction Registration

Each subsidiary registers in **its own** Member State. A group with entities in NL, DE, and FR will have registrations in three separate national registries.

### 6.2 Non-EU Subsidiaries

Per Article 5b(1), a relying party must register *"in the Member State where it is established."* For non-EU subsidiaries that wish to interact with EUDI Wallets:

- They would need to establish an EU-based entity or use an EU-established intermediary
- This has been explicitly discussed in the GitHub issue ["Will the European Digital Identity Wallets work outside of Europe?"](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/issues) on the ARF repository

### 6.3 Intermediary in a Different Member State

The intermediary need not be in the same Member State as the End-Relying Party. A group IT services company in the Netherlands can act as intermediary for a subsidiary registered in Germany, as long as:
- The intermediary itself is registered as an RP in its own Member State (NL)
- The End-RP is registered in its Member State (DE)
- The intermediary holds the End-RP's RPRC

---

## 7. Open Questions

### 7.1 Intra-Group Intermediary vs. Third-Party Intermediary

The regulation does not distinguish between intra-group and third-party intermediaries. An intra-group shared services entity follows the **same** intermediary rules as an external platform provider. This means:

- The same **no-storage** obligation applies (Art. 5b(10))
- The same **registration requirements** apply (ARF RPI_01)
- The same **certificate architecture** applies (ARF RPI_03, RPI_06)

**Open:** Will Member States provide any simplified registration path for intra-group intermediaries, recognizing the common ownership structure? The ARF currently leaves this to national discretion (see RPI_04: *"in a manner to be decided by a Member State"*).

### 7.2 Group-Level Compliance Reporting

For regulated entities (banks, insurers), supervisory bodies often require group-level risk reporting. **Open:** How will supervisory bodies (National Competent Authorities) approach compliance monitoring for EUDI Wallet integration at the group level?

### 7.3 Shared Services Entity as RP vs. Intermediary

If a group's shared services company both provides IT services to subsidiaries **and** uses wallets for its own purposes (e.g., employee onboarding), it would be both:
- An **End-RP** for its own intended uses
- An **intermediary** for its subsidiaries' intended uses

Both the ARF and Discussion Paper X support this dual role. The current ARF HLR RPI_01 (note c) states: *"An entity that registered as an intermediary may also register as a Relying Party in its own capacity. In such a case, it will receive one or more registration certificates for its intended use(s), and will use one of these certificates when interacting with a Wallet Unit."* The Discussion Paper X (§3.5) adds: *"this assumption remains valid unless the Relying Party acting as an intermediary has other wallet-relying party services with intended uses that invoke the duty to register an RPRC."*

### 7.4 Liability Chain Within the Group

> **Discussion Paper X, §3.5.1:** *"As the intermediaries are acting on behalf of the End-Relying Parties, and will remain liable towards the Registrar on accuracy of the information to be registered, they must carry same identity proofing and data verification checks for their customers as the Registrar would do for the End-Relying Party in case of direct registration path. The Registrar shall also not trust blindly the Intermediary but execute the identity verification of both the Intermediary and the End-Relying Parties to be registered."*

**Open:** In an intra-group scenario, how does the liability chain interact with corporate group liability frameworks? Does the intermediary subsidiary bear independent liability, or does the parent's corporate governance structure provide implicit guarantees?

---

## 8. Terminology

| Term | Definition |
|------|-----------|
| **Corporate group** (*concern*, *groep*) | An economic entity consisting of a parent company and its subsidiaries, forming a single economic unit under common control |
| **Parent / holding company** (*houdstermaatschappij*) | The entity at the top of the group structure that holds controlling interests in subsidiaries; may or may not conduct operational activities itself |
| **Subsidiary** (*dochtermaatschappij*) | A legal entity controlled by the parent company, with its own separate legal personality, registration, and (in regulated sectors) regulatory licenses |
| **Intermediary** (Art. 5b(10)) | An entity that acts on behalf of relying parties in EUDI Wallet interactions; deemed to be a relying party itself; prohibited from storing transaction content |
| **End-Relying Party** (ARF Topic 52) | The ultimate RP on whose behalf an intermediary interacts with a wallet; the entity whose name and intended use are presented to the wallet user |
| **RPAC** (RP Access Certificate) | Certificate issued to a registered RP (or intermediary), used for mutual authentication in OID4VP |
| **RPRC** (RP Registration Certificate) | Certificate binding a registration (intended use + data attributes) to a specific RP; held by the RP or its intermediary |

---

## 9. Source References

### Primary Sources

| Source | Link |
|--------|------|
| Consolidated Regulation (EU) No 910/2014, Art. 3(6), Art. 5b | [Portal](https://ivanstambuk.github.io/eIDAS20/#/regulation/2014-910) · [EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02014R0910-20241018) |
| CIR 2025/848 — Wallet Relying Party Registration | [Portal](https://ivanstambuk.github.io/eIDAS20/#/implementing-acts/2025-0848) · [EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32025R0848) |

### Architecture & Technical Specifications

| Source | Link |
|--------|------|
| ARF Discussion Paper: Topic X (RP Registration) | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/discussion-topics/x-relying-party-registration.md) |
| ARF Annex 2, Topic 27 (Registration) — §A.2.3.16 | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2316-topic-27---registration-of-pid-providers-providers-of-qeaas-pub-eaas-and-non-qualified-eaas-and-relying-parties) |
| ARF Annex 2, Topic 44 (RP Registration Certificates) — §A.2.3.26 | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2326-topic-44---registration-certificates-for-pid-providers-providers-of-qeaas-pub-eaas-and-non-qualified-eaas-and-relying-parties) |
| ARF Annex 2, Topic 52 (RP Intermediaries) — §A.2.3.30 | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2330-topic-52-relying-party-intermediaries) |
| TS5 (RP Registration Formats) | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts5-common-formats-and-api-for-rp-registration-information.md) |
| TS6 (RP Registration Info) | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts6-common-set-of-rp-information-to-be-registered.md) |

### External Sources (Web Research — 2026-02-16)

| Source | Description |
|--------|-------------|
| [ARF GitHub Discussions](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/discussions) | Community discussions on RP registration, including subsidiary/parent company scenarios |
| [lissi.id — Intermediaries in eIDAS 2.0](https://lissi.id) | Analysis of the intermediary role as "trust bridge" for RP integration |
| [european-digital-identity-regulation.com](https://european-digital-identity-regulation.com) | Annotated eIDAS 2.0 regulation text with Article 5b analysis |
