# Corporate Group Structures and Relying Party Registration in eIDAS 2.0

> **Research Date:** 2026-02-16 (updated 2026-02-20)  
> **Status:** Complete — analysis of how corporate groups (holding companies, subsidiaries, trade names, branches, franchises, M&A events, passported institutions, SOEs/PPPs, natural persons, white-label platforms) map to eIDAS RP registration, including GDPR alignment, cost modelling, wallet UX, and post-presentation data flows  
> **Context:** Investigating whether a parent/holding company can register as a single Relying Party on behalf of its subsidiaries, or whether each legal entity within a corporate group must register independently. Extended to cover trade names, multi-brand entities, cross-border branch registration, franchise/licensing networks, M&A restructuring, sectoral passporting, GDPR data controller/processor alignment, intermediary architecture depth, dual-role registration, timeline/rollout strategy, cost analysis, public sector bodies, white-label platforms, wallet user experience, and intra-group data flows.

---

## 1. Introduction & Scope

This document analyses how corporate group structures — holding companies, subsidiaries, shared services entities, branches, and franchise networks — map to the eIDAS 2.0 Relying Party registration model. It addresses a practical question that frequently arises in enterprise contexts: *can a parent company register once as an RP on behalf of all its subsidiaries?*

The central questions addressed are:

1. **Must each subsidiary register separately?** — Does the regulation require per-entity RP registration, or does it permit group-level registration?
2. **What can be shared within a group?** — Which aspects of EUDI Wallet integration can be centralized (infrastructure, compliance), and which must remain per-entity (registration, certificates, data processing)?
3. **How do intermediaries help?** — The intermediary mechanism (Art. 5b(10)) enables shared technical infrastructure while maintaining per-entity registration. How does this work in practice?
4. **What changes in the VCQ?** — Do deployment architectures serving multiple RPs require additional compliance assessment?
5. **How do trade names and multi-brand entities register?** — When a single legal entity operates under multiple consumer-facing trade names (e.g., a parent company with several brand names that are not separate legal entities), how does RP registration handle user-facing identity?
6. **How do branches register?** — When a legal entity has branches (not subsidiaries) in other Member States, must the entity register separately in each host jurisdiction?
7. **How do franchise networks register?** — When a brand owner (franchisor) licenses its identity to independent operators (franchisees), how do the separate legal entities map to RP registration roles?

The document proceeds top-down: **legal basis (§2) → architecture (§3) → shared vs. separate concerns (§4) → deployment architectures (§5) → compliance implications (§6) → cross-border registration (§7) → architectural deep dives (§8) → compliance & data protection (§9) → entity classification (§10) → operational planning (§11) → open questions (§12)**.

**Key finding:** Each legal entity within a corporate group **must register as a separate Relying Party**. However, the regulation's **intermediary mechanism** (Art. 5b(10)) accommodates shared technical infrastructure through a well-defined architectural pattern where one entity (e.g., group IT services) handles wallet interactions on behalf of individually registered subsidiaries. A detailed analysis of three deployment architectures (§5) shows that the existing VCQ framework covers corporate group scenarios well, requiring only one additional cross-cutting assessment question for multi-RP support (§6.2).

**Supplementary finding (§2.6–2.8):** CIR 2025/848 Annex I distinguishes between the statutory name (Point 1) and a user-friendly trade name (Point 2), and the technical specifications (TS6) formalize these as separate data fields (`legalName` and `tradeName`). However, Annex I provides only a single trade name field per registration, which creates practical challenges for entities operating multiple consumer brands. Similarly, non-subsidiary branches in other Member States occupy an ambiguous position: they are registered in host-country business registers with their own EUID but are not separate legal persons, and the CIR's interaction with Directive 2017/1132 branch registration rules is not explicitly addressed. These dimensions yield six additional open questions (§12.5–12.10). In contrast, franchise networks (§2.8) map naturally to the intermediary pattern — the franchisor as intermediary, franchisees as End-RPs — providing a clear registration model where the wallet user sees both the franchise brand and the specific operator.

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

### 2.6 Trade Names and User-Facing Identity

CIR 2025/848 Annex I differentiates between two name fields for every registered relying party:

> **Annex I, Point 1:** *"Where applicable, the name of the wallet-relying party, as stated in an official record together with identification data of that official record."*  
>
> **Annex I, Point 2:** *"Where applicable, a user-friendly name of the wallet-relying party that can be either a trade name or service name that is recognisable to the user."*

The [TS6 specification (Common Set of RP Information)](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts6-common-set-of-rp-information-to-be-registered.md) formalizes these as two distinct mandatory data attributes:

| Data Identifier | Mapped Field | Description |
|----------------|--------------|-------------|
| **Name** | `WalletRelyingParty.legalName` (legal person) | Name as stated in an official record |
| **Trade Name** | `WalletRelyingParty.tradeName` | A user-friendly name (trade name or service name) recognisable to the user. **SHALL be used as name of the entity if Name is not applicable.** |

**What the wallet user sees:** The ARF Discussion Paper X introduces proposed requirement **Reg_33**, which mandates: *"All Relying Party Instance access certificates of a Relying Party SHALL include the **user-friendly (common) name** of Relying Party service and unique identifier identical to the ones defined in requirements RPRC_03a and RPRC_03b, respectively."* The related **RPRC_03a** (derived from Reg_31) requires: *"a Relying Party registration certificate contains a name for the Relying Party, in a **format suitable for presenting to a User**."* This confirms that the wallet user interface is designed to display the **trade name** (`tradeName`), not the statutory name (`legalName`).

**Implications for multi-brand entities:**

Annex I provides a **single** `tradeName` field per registration. For an entity that operates multiple consumer-facing services under distinct trade names — where those trade names are not separate legal entities but commercial names registered in the national business register — this creates a practical constraint:

1. **One registration, one trade name.** The entity's statutory name (`legalName`) is fixed by its official record, but it can only specify one `tradeName`.
2. **Multiple intended uses share the same trade name.** Each intended use (Points 9-10) gets its own RPRC, but all RPRCs for the same registration share the same Point 1 and Point 2 names (per RPRC_09: *"The EU-wide unique identifier SHALL be identical in all registration certificates issued for a given Relying Party"*).
3. **No per-intended-use trade name.** The CIR does not provide a mechanism for different intended uses to carry different user-friendly names. A user interacting with "Brand X" (a mobile payment service) and "Brand Y" (a personal finance app) — both operated by the same legal entity — would see the same trade name in both wallet interactions.

This may force multi-brand entities to choose between:
- **Option A:** Register under the parent brand name (accurate but potentially confusing for users who only know the sub-brand)
- **Option B:** Register under the most prominent consumer-facing brand (recognisable but potentially misleading for other-branded services)
- **Option C:** Explore whether separate registrations per intended use, each with a different trade name, are permitted (ambiguous — the CIR ties registration to a legal entity, not a brand)

**Cross-reference with Member State business registers:**

The concept of "trade name" varies significantly across EU Member States, which affects what is available as the `tradeName` in Point 2:

| Member State | Register | Trade Name Concept |
|-------------|----------|-------------------|
| **Netherlands** | KvK (*Kamer van Koophandel*) | The *handelsnaam* system allows multiple trade names per registration. All registered trade names are public record. A single entity can have 10+ trade names. |
| **Germany** | Handelsregister | The *Firma* (company name) is formally registered. Additional trade names (*Geschäftsbezeichnungen*) are not separately registered in the Handelsregister but may be protected under trade name law (§ 5 MarkenG). |
| **France** | RCS (*Registre du Commerce et des Sociétés*) | The *dénomination sociale* (statutory name) is registered. A *nom commercial* (trade name) and *enseigne* (business sign) can also be registered and are publicy searchable. |
| **Belgium** | KBO/BCE (*Kruispuntbank van Ondernemingen*) | A *handelsnaam/nom commercial* can be registered. The *ondernemingsnummer* is the primary identifier, and multiple commercial names can be associated. |
| **Ireland** | CRO (*Companies Registration Office*) | Business names (trading names) must be registered separately under the Registration of Business Names Act. |

The practical consequence is that what qualifies as a `tradeName` for Point 2 will depend on the Member State's business register and national registration policy (Art. 4 CIR 2025/848). In jurisdictions like the Netherlands where multiple trade names are formally registered, the question of *which* trade name to use becomes acute.

### 2.7 Branches and Cross-Border Establishment

A **branch** (*bijkantoor*, *Zweigniederlassung*, *succursale*) is legally distinct from a **subsidiary**. Under Directive 2017/1132 (Articles 29-37), a branch:

- Is **not a separate legal entity** — it is an extension of the parent company
- Must be **registered in the host Member State** business register, disclosing information about the parent company
- Receives its own **EUID** (European Unique Identifier) in the host country register under CIR 2021/1042 (BRIS)
- May operate under a **different name** than the parent — Directive 2017/1132 requires disclosure of the branch name if it differs from the company name

Article 5b(1) of the eIDAS Regulation states:

> *"Where a relying party intends to rely upon European Digital Identity Wallets for the provision of public or private services by means of digital interaction, the relying party shall register in the Member State **where it is established**."*

"Established" is not further defined for branches. For companies, establishment typically means the jurisdiction of incorporation (registered office). For branches, the question becomes whether a branch's physical presence in a host Member State constitutes "establishment" for RP registration purposes, or whether the entity must register only in its Member State of incorporation.

**Possible interpretations:**

| Interpretation | Consequence | Supporting argument |
|---------------|-------------|--------------------|
| **A: Strict legal entity** | The entity registers only in the MS of its registered office. Branches in other MSs do not trigger separate RP registration. | Art. 5b(1) says "the relying party" shall register — a branch is not a relying party, it's an operational extension of one. Art. 3(6) defines RP as a "legal person", and a branch is not a separate legal person. |
| **B: Effective establishment** | The entity must register in each MS where it has a branch providing wallet-based services. | The purpose of registration is transparency and local oversight. Art. 5b(2)(a)(i) requires indicating "the Member State in which the relying party is established". If a branch provides services to users in DE, those users should be able to verify the RP's registration in DE's national register. |
| **C: Deferred to national policy** | Article 4 of CIR 2025/848 delegates registration policy to Member States. Host MSs may require branch registration; home MSs may not. | Art. 4(1): *"Member States shall lay down and publish one or more national registration policies."* This is the explicit delegation mechanism. |

**Assessment:** Interpretation C is most likely in practice. The CIR explicitly delegates registration policy details to Member States (Art. 4), and the interaction between RP registration and branch registration under Directive 2017/1132 is exactly the sort of practical matter that national policies will need to address. However, interpretation A has the strongest literal textual support in the regulation itself.

**Practical implications for corporate groups with cross-border branches:**

- A group's shared IT services entity (acting as intermediary) can operate from one MS and serve branches across the EU
- Each branch's wallet interactions would present the intermediary's RPAC plus the parent entity's RPRC
- The wallet user in the host MS would see the parent entity's trade name, not a branch-specific name
- The branch's EUID (from the host MS register) is distinct from the parent's EUID (from the home MS register), but it is unclear whether the RP registration can or should reference the branch EUID

### 2.8 Franchise and Licensing Networks

A **franchise network** presents a structurally distinct corporate pattern from both subsidiaries and branches. In a franchise:

- The **franchisor** (brand owner) and the **franchisee** (operator) are **legally and financially separate and independent undertakings** — this is a foundational principle of EU franchise law, as recognized in the Vertical Block Exemption Regulation (EU) 2022/720 and the Court of Justice's ruling in *Pronuptia* (Case 161/84)
- The franchisee operates under the franchisor's **trade name, trademark, and business methods** under a license agreement
- The consumer interacts with and trusts the **franchise brand**, not the franchisee's own legal identity

This structure maps naturally to the eIDAS 2.0 **intermediary pattern** (Art. 5b(10)), and is in fact one of the strongest natural fits for the mechanism:

**Registration model for franchise networks:**

| Role | Entity | Registration | Certificate |
|------|--------|-------------|-------------|
| **Intermediary** | Franchisor (brand owner) | Registers as RP/intermediary in home MS (RPI_01). Receives RPAC with franchisor's `tradeName` (the franchise brand) and unique identifier. | RPAC only — no RPRC of its own unless it also has direct wallet-relying services |
| **End-RP** | Each franchisee | Registers as RP in its own MS. The franchisor-intermediary can register End-RPs on their behalf (Discussion Paper X §3.5.1). | RPRC per intended use, issued to the franchisor-intermediary (RPI_03) |

**What the wallet user sees (RPI_07):**

Per the ARF requirement chain:
1. The intermediary (franchisor) presents its **RPAC** containing the franchise brand name and identifier
2. The intermediary presents the End-RP's (franchisee's) **RPRC** containing the franchisee's name, unique identifier, and intended use
3. The wallet verifies both certificates and displays **both names** to the user (RPA_06a): the franchise brand (intermediary) and the franchisee (End-RP)

This dual-name display naturally accommodates the franchise model — the user recognizes the franchise brand name from the intermediary's RPAC, while the franchisee's legal identity in the RPRC provides transparency about which specific entity is processing their data.

**Why the franchise model fits the intermediary pattern better than multi-brand entities (§2.6):**

| Dimension | Multi-Brand (Single Entity) | Franchise Network |
|-----------|---------------------------|-------------------|
| Legal entities | One legal entity, multiple brands | Multiple legal entities, one brand |
| Intermediary mapping | Awkward — the intermediary and End-RP are the same entity | Natural — franchisor = intermediary, franchisee = End-RP |
| User sees | Forced to choose one `tradeName` | Brand visible via intermediary RPAC; franchisee visible via RPRC |
| End-RP registration | Ambiguous — can one entity have multiple registrations? | Clear — each franchisee registers independently |

**Practical considerations for franchise networks:**

1. **Scalability:** A large franchise network (hundreds of franchisees across multiple MSs) requires the franchisor-intermediary to manage hundreds of End-RP RPRCs. Discussion Paper X §3.5.2 acknowledges this: *"the intermediary will possess as many RPRCs as number of its intermediated End-RPs entities (multiplied by the number of services/intended uses for each entity possibly)."*

2. **Due diligence:** The franchisor-intermediary bears liability toward the registrar for the accuracy of End-RP registrations (Discussion Paper X §3.5.1): *"they must carry same identity proofing and data verification checks for their customers as the Registrar would do for the End-Relying Party in case of direct registration path."* This aligns with existing franchise governance where franchisors already perform due diligence on franchisees.

3. **No-storage mandate:** The franchisor-intermediary is subject to Art. 5b(10)'s no-storage mandate — it cannot retain wallet data after forwarding it to the franchisee End-RP. This is architecturally significant: the franchisor provides the wallet platform but cannot use the resulting data for its own purposes (e.g., central analytics across the franchise network).

4. **Franchisee autonomy vs. brand control:** EU franchise law (VBER 2022/720) balances the franchisor's right to protect brand standards against the franchisee's independence. The intermediary model reflects this balance: the franchisor controls the technical wallet integration (platform), but each franchisee retains its own RP identity and data processing responsibilities.

5. **Analogous structures:** Insurance agent networks, travel agency affiliates, and dealer/distributor networks follow a similar brand-owner/operator pattern and would map to the same intermediary model. Any organization where one entity holds the brand and separate entities provide services under that brand is a candidate for this registration pattern.

---

## 3. Architecture and Reference Framework (ARF) Analysis

### 3.1 RP Access Certificates (RPAC) — Per Entity

The ARF's Topic 27 (Registration) and Topic 44 (Registration Certificates) establish that:

- Each RP receives its own **RP Access Certificate** (RPAC) containing its unique identifier and user-friendly name
- The RPAC is used for mutual authentication in OID4VP — the wallet verifies *who* is requesting data
- A wallet user sees the **trade name** of the specific relying party requesting their data, not the corporate group or statutory name

The proposed ARF requirement **Reg_33** explicitly mandates that all RPAC instances include the "user-friendly (common) name" and the "unique identifier" of the RP, identical to those in the RPRC. This ensures consistency: regardless of which RP server instance the user connects to, the wallet always shows the same trade name and identifier.

The related **RPRC_03a** (proposed replacement for Reg_31) further clarifies that the name in the registration certificate must be *"in a format suitable for presenting to a User"* — confirming that the entire certificate architecture is designed around the user seeing a recognisable trade name, not a formal statutory name.

This is by design: the wallet user has the right to know exactly which entity they are sharing data with, identified in a way they can recognise. A group-level registration would obscure this information, undermining the data minimization and transparency principles of eIDAS.

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

## 5. Deployment Architecture Analysis

The practical impact of corporate group structures on the VCQ depends on the **deployment architecture** (cf. DEC-289). This section analyses three architectures and how each handles multi-RP deployments.

### 5.1 Architecture 1: Intermediary (`intermediary`)

> *Vendor acts as RP on behalf of the customer. Vendor holds its own RPAC and interacts with wallets directly.*

In this model, the vendor **is** the intermediary (Art. 5b(10)). For corporate groups:
- The vendor registers as an intermediary RP
- The vendor holds RPRCs for each End-RP (each subsidiary)
- RPI_01 through RPI_10 (including sub-items RPI_06a, RPI_07a, RPI_07b) all apply **to the vendor** operationally
- The VCQ already covers this — intermediary-specific requirements (prefix `VEND-INT`) are scoped to this architecture

**Multi-RP impact:** The vendor's product **must** natively support multiple End-RPs. This is inherent to the intermediary model — one intermediary, many End-RPs. No additional VCQ changes needed beyond what DEC-289 already established.

### 5.2 Architecture 2: Direct SaaS (`direct_saas`)

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

**VCQ implication:** The existing VCQ requirements apply per tenant instance, but a **cross-cutting multi-tenant support assessment** should be added (see §6.2).

### 5.3 Architecture 3: Direct Self-Hosted (`direct_onprem`)

> *Customer is the RP. Deploys vendor software on own infrastructure. Vendor delivers binaries/containers; customer manages all operations.*

In this model, the vendor delivers software that the customer deploys. For corporate groups:

**Option A — Separate instances:** Each subsidiary deploys its own instance. No multi-RP concern — each instance is single-tenant. The VCQ assesses the product as-is.

**Option B — Shared instance (proxy model):** The group deploys one instance to serve multiple subsidiaries. This is the "proxy" or shared services model where a group IT entity operates the platform. From an eIDAS perspective:

- If the group IT entity **handles wallet interactions on behalf of subsidiaries**, it is an intermediary under Art. 5b(10), regardless of whether it's an internal entity or a third party. The regulation does not distinguish.
- If the group IT entity merely provides infrastructure but **each subsidiary authenticates with its own RPAC directly**, it is a hosting provider, not an intermediary.

**VCQ implication:** Same as SaaS multi-tenancy. The product must support tenant isolation if deployed in shared mode. The deployment being on-prem doesn't change what the *product* needs to support — it just shifts *operational responsibility* to the customer.

### 5.4 Deployment × Concern Matrix

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

---

## 6. Compliance Assessment Implications

### 6.1 RCA Scope — Per Legal Entity, Unchanged

The RCA (Regulatory Compliance Assessment) covers obligations that fall on the **organisation itself** — registration with authorities, internal governance, personnel, financial obligations. These are inherently per legal entity:

- **Each subsidiary** must independently assess its own regulatory obligations
- A holding company **cannot** satisfy RCA obligations on behalf of a subsidiary
- The corporate group structure is invisible to the RCA — it assesses each entity as a standalone RP

**Key implication:** The RCA does not need new requirements for corporate groups. The existing per-entity model already covers this correctly. Each subsidiary's RCA will include its own registration obligation (Art. 5b(1)), its own data protection obligations (GDPR controller status), and its own sectoral compliance (PSD2, DORA, Solvency II, etc.).

### 6.2 Recommended VCQ Addition for Multi-RP Support

The VCQ should add a **cross-cutting requirement** for multi-RP platform deployments. This applies to any vendor product deployed in configurations where a single platform instance serves multiple distinct legal entities as separate Relying Parties — whether via the intermediary pattern (Art. 5b(10)) or direct SaaS multi-tenancy.

#### VEND-MULTI-01: Support multi-relying-party deployments with per-entity isolation

| Field | Value |
|-------|-------|
| **ID** | VEND-MULTI-01 |
| **Category** | Registration & Notification (cross-cutting) |
| **Obligation** | MUST |
| **Deployment architectures** | `intermediary`, `direct_saas` (conditionally `direct_onprem` when shared) |
| **Product categories** | Connector |
| **Deadline** | 2027-11-21 |
| **Legal basis** | Art. 5b(1) Reg. 2014/910; Art. 7(1) & Art. 8(1) CIR 2025/848 |
| **ARF reference** | Topic 52 — AS-RP-51-001, AS-RP-51-003, AS-RP-51-006, AS-RP-51-007 |
| **Complements** | VEND-INT-020 (cross-RP unlinkability), VEND-INT-021 (immediate data deletion) |

**Explanation:**

The product must support deployments where a single platform instance serves multiple distinct legal entities as separate Relying Parties. Each RP is an independently registered entity (Art. 5b(1)) with its own RPAC, one or more RPRCs, and its own GDPR controller obligations (Art. 4(7) GDPR). The platform must enforce strict separation between these entities at every layer:

- **Certificate management (per entity):** Each RP requires its own RPAC (Art. 7 CIR 2025/848) and one or more RPRCs (Art. 8) — one per registered intended use. The platform must manage these independently, with separate private key material per entity in isolated key containers. Certificate lifecycle events (issuance, renewal, revocation) for one entity must not affect another. During corporate restructuring events (mergers, acquisitions, entity conversions — see §10.3), the platform must support orderly certificate revocation and re-issuance within the 24-hour notification window (CIR Art. 9(5-6)).

- **Data isolation:** Transaction records, audit logs, received attributes (during the transient processing window before deletion per Art. 5b(10)), and compliance evidence must be logically or physically isolated per RP. No administrative action, database query, API call, or log search should inadvertently cross entity boundaries. This extends VEND-INT-020's user-level unlinkability to entity-level data isolation.

- **Per-entity configuration:** Intended use declarations, data request scopes, privacy policy URLs, and attribute request profiles must be independently configurable per RP. When serving an intermediary and its End-RPs, the correct RPRC must be bound to each wallet transaction based on which End-RP the request is for. The platform must enforce the flat two-layer delegation constraint (§8.1) — multi-level intermediary chains are architecturally prohibited.

- **Compliance evidence isolation:** Each RP must independently export its own compliance evidence and audit trails without visibility into other entities' data, supporting the per-entity RCA model (§6.1).

- **GDPR controller boundaries:** Because each RP is an independent data controller (§9.1), the platform's data processing boundaries must align precisely with the GDPR controller/processor structure. The no-storage mandate (Art. 5b(10)) applies per-entity in intermediary deployments, requiring pass-through architecture.

#### Clarification Questions

1. **Q1 (security):** How does the platform manage multiple RPACs and RPRCs simultaneously? Are private keys for each entity stored in isolated key containers (separate HSM partitions, separate key vaults), or do they share a key management infrastructure with logical separation only?

2. **Q2 (architecture):** What data isolation model is enforced between RP tenants — physical isolation (separate databases/instances per entity), logical isolation (shared database with row-level security), or namespace isolation (schema-per-tenant)? How is cross-tenant data leakage prevented in queries, log searches, and API responses?

3. **Q3 (operational):** Can intended use declarations, data request scopes, privacy policy URLs, and attribute request profiles be configured independently per RP entity? If the platform serves 50 entities each with 3 intended uses (150 configurations), how does the configuration model scale?

4. **Q4 (technical implementation):** How does the platform bind the correct RPRC to each wallet transaction based on the requesting entity? In an intermediary deployment where the intermediary holds RPRCs for multiple End-RPs, what mechanism ensures the right certificate is selected for each request — is this configured per API call, per session, or per endpoint?

5. **Q5 (auditability):** Can each RP entity independently export its own compliance evidence and audit trails without gaining visibility into other entities' data? What access controls ensure a subsidiary's compliance officer can only access that subsidiary's records?

6. **Q6 (lifecycle):** How does the platform handle certificate lifecycle events during corporate restructuring — mergers, acquisitions, and entity conversions? Can it process certificate revocation for an absorbed entity and re-issuance for the successor entity within the 24-hour revocation notification window (CIR Art. 9(5-6))?

7. **Q7 (privacy):** How does multi-RP support interact with the no-storage mandate (Art. 5b(10)) and immediate deletion requirement (VEND-INT-021)? In a multi-tenant deployment, does the deletion pipeline operate per-entity, and how is it verified that no attestation data leaks across tenant boundaries during the transient processing window?

8. **Q8 (operational):** What is the onboarding process for adding a new RP entity to the platform? How long does it take from registration completion at the national Registrar to the entity being operational on the platform? Is this process automated via the common registration API (ETSI TS 119 475)?

9. **Q9 (compliance completeness):** How does the platform enforce the flat two-layer intermediary model mandated by the ARF (§8.1)? If a corporate group has regional hubs between the central intermediary and local subsidiaries, does the platform prevent or detect attempts to configure multi-level delegation chains?

<details>
<summary><strong>YAML source (for VCQ integration)</strong></summary>

```yaml
# === Requirement (add to requirements/intermediary.yaml or requirements/multi.yaml) ===
- id: VEND-MULTI-01
  deploymentArchitectures:
    - intermediary
    - direct_saas
  category: registration
  requirement: Support multi-relying-party deployments with per-entity isolation
  explanation: |
    The product must support deployments where a single platform instance
    serves multiple distinct legal entities as separate Relying Parties.
    Each Relying Party is an independently registered entity (Art. 5b(1))
    with its own RPAC, one or more RPRCs, and its own GDPR controller
    obligations (Art. 4(7) GDPR). The platform must enforce strict
    separation between these entities at every layer.

    **Certificate management (per entity):**
    Each RP requires its own Wallet-Relying Party Access Certificate
    (RPAC, per Art. 7 CIR 2025/848) and one or more Registration
    Certificates (RPRC, per Art. 8) — one per registered intended use.
    The platform must manage these certificates independently, with
    separate private key material per entity stored in isolated key
    containers. Certificate lifecycle events (issuance, renewal,
    revocation) for one entity must not affect another entity's
    certificates. During corporate restructuring events (mergers,
    acquisitions, entity conversions — see §10.3), the platform must
    support orderly certificate revocation and re-issuance within
    the 24-hour revocation notification window (CIR Art. 9(5-6)).

    **Data isolation:**
    Transaction records, audit logs, received attributes (during the
    transient processing window before deletion per Art. 5b(10)), and
    compliance evidence must be logically or physically isolated per
    RP. No administrative action, database query, API call, or log
    search should be able to inadvertently cross entity boundaries. This
    complements the cross-RP unlinkability requirement (VEND-INT-020)
    at the platform level by extending it from user-level unlinkability
    to entity-level data isolation.

    **Per-entity configuration:**
    Intended use declarations, data request scopes, privacy policy URLs,
    and attribute request profiles must be independently configurable
    per RP. When a platform serves an intermediary and its End-RPs
    (the intermediary pattern, Art. 5b(10)), the correct RPRC must be
    bound to each wallet transaction based on which End-RP the request
    is for. The platform must enforce the flat two-layer delegation
    constraint (§8.1) — it cannot support multi-level intermediary
    chains.

    **Compliance evidence isolation:**
    Each RP must be able to independently export its own compliance
    evidence, audit trails, and registration records without gaining
    visibility into other entities' data. This supports the per-entity
    RCA model where each subsidiary undergoes independent compliance
    assessment (see §6.1).

    **GDPR controller boundaries:**
    Because each RP is an independent data controller (§9.1), the
    platform's data processing boundaries must align precisely with
    the GDPR controller/processor structure. The no-storage mandate
    (Art. 5b(10)) applies per-entity in intermediary deployments,
    requiring pass-through architecture where attestation data is
    not retained beyond the immediate verification-and-forward cycle.
  legalBasis:
    - regulation: 2014/910
      article: Article 5b
      paragraph: "1"
    - regulation: 2025/848
      article: Article 7
      paragraph: "1"
    - regulation: 2025/848
      article: Article 8
      paragraph: "1"
  legalText: |
    Each relying party relying on electronic identification means
    or electronic attestations of attributes presented through the
    European Digital Identity Wallet shall register in the Member
    State where it is established.
  arfReference:
    topic: Topic 52
    hlr:
      - AS-RP-51-001
      - AS-RP-51-003
      - AS-RP-51-006
      - AS-RP-51-007
  roles:
    - relying_party
  productCategories:
    - connector
  deadline: "2027-11-21"
  obligation: MUST
  notes: |
    This requirement is cross-cutting: it applies to any product deployed
    in multi-RP configurations, whether using the intermediary pattern
    (Art. 5b(10)) or direct SaaS multi-tenancy. It complements
    VEND-INT-020 (cross-RP unlinkability) and VEND-INT-021 (immediate
    data deletion) by adding entity-level isolation guarantees.

# === Clarification Questions (add to clarification-questions/intermediary.yaml or multi.yaml) ===
VEND-MULTI-01:
  questions:
    - id: Q1
      text: >
        How does the platform manage multiple RPACs and RPRCs simultaneously?
        Are private keys for each entity stored in isolated key containers
        (separate HSM partitions, separate key vaults), or do they share a
        key management infrastructure with logical separation only?
      dimension: security
    - id: Q2
      text: >
        What data isolation model is enforced between RP tenants — physical
        isolation (separate databases/instances per entity), logical isolation
        (shared database with row-level security), or namespace isolation
        (schema-per-tenant)? How is cross-tenant data leakage prevented in
        queries, log searches, and API responses?
      dimension: architecture
    - id: Q3
      text: >
        Can intended use declarations, data request scopes, privacy policy
        URLs, and attribute request profiles be configured independently per
        RP entity? If the platform serves 50 entities each with 3 intended
        uses (150 configurations), how does the configuration model scale?
      dimension: operational
    - id: Q4
      text: >
        How does the platform bind the correct RPRC to each wallet transaction
        based on the requesting entity? In an intermediary deployment where
        the intermediary holds RPRCs for multiple End-RPs, what mechanism
        ensures the right certificate is selected for each request — is this
        configured per API call, per session, or per endpoint?
      dimension: technical_implementation
    - id: Q5
      text: >
        Can each RP entity independently export its own compliance evidence
        and audit trails without gaining visibility into other entities' data?
        What access controls ensure a subsidiary's compliance officer can only
        access that subsidiary's records?
      dimension: auditability
    - id: Q6
      text: >
        How does the platform handle certificate lifecycle events during
        corporate restructuring — mergers, acquisitions, and entity
        conversions? Can it process certificate revocation for an absorbed
        entity and re-issuance for the successor entity within the 24-hour
        revocation notification window (CIR Art. 9(5-6))?
      dimension: lifecycle
    - id: Q7
      text: >
        How does multi-RP support interact with the no-storage mandate
        (Art. 5b(10)) and immediate deletion requirement (VEND-INT-021)?
        In a multi-tenant deployment, does the deletion pipeline operate
        per-entity, and how is it verified that no attestation data leaks
        across tenant boundaries during the transient processing window?
      dimension: privacy
    - id: Q8
      text: >
        What is the onboarding process for adding a new RP entity to the
        platform? How long does it take from registration completion at
        the national Registrar to the entity being operational on the
        platform? Is this process automated via the common registration
        API (ETSI TS 119 475)?
      dimension: operational
    - id: Q9
      text: >
        How does the platform enforce the flat two-layer intermediary
        model mandated by the ARF (§8.1)? If a corporate group has
        regional hubs between the central intermediary and local
        subsidiaries, does the platform prevent or detect attempts to
        configure multi-level delegation chains?
      dimension: compliance_completeness
```

</details>

### 6.3 Platform-Level vs. Entity-Level Assessment

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

### 6.4 What Does NOT Change

To be explicit about what is **not** affected by corporate group considerations:

- **RCA requirements** — remain per-entity, no new requirements needed
- **VCQ requirement content** — each existing VCQ requirement applies identically whether the product serves one RP or fifty; the requirements themselves don't change, only the deployment capability question is added
- **Regulatory obligations** — Art. 5b requirements are per-RP regardless of corporate structure
- **ARF HLRs** — Topic 27, 44, 52 requirements apply identically to corporate subsidiaries and standalone RPs

---

## 7. Cross-Border & Multi-MS Registration

This section addresses registration considerations specific to corporate groups operating across multiple Member States, including branch registration, non-EU subsidiaries, intermediary jurisdiction, divergent national registers, and sectoral passporting.

### 7.1 Multi-Jurisdiction Registration

Each subsidiary registers in **its own** Member State. A group with entities in NL, DE, and FR will have registrations in three separate national registries.

### 7.2 Branches vs. Subsidiaries

The cross-border dimension is complicated by the distinction between branches and subsidiaries:

| Structure | Legal Personality | Business Register | RP Registration |
|-----------|------------------|------------------|----------------|
| **Subsidiary** (separate entity) | Own legal personality in host MS | Own registration (own KvK/Handelsregister number) | Registers independently as RP in host MS |
| **Branch** (no separate entity) | Extension of parent entity | Registered in host MS register under Directive 2017/1132 with own EUID, but referencing parent | Ambiguous — see §2.7. Likely depends on national registration policy (Art. 4 CIR 2025/848) |

For regulated entities operating under a single license with branches across multiple jurisdictions, this distinction is critical. A branch in another Member State may be providing wallet-relying services to local users, but it shares the parent entity's legal identity. The wallet user in that host MS will see the parent entity's trade name and registration details, potentially from a different MS's national register.

### 7.3 Non-EU Subsidiaries

Per Article 5b(1), a relying party must register *"in the Member State where it is established."* For non-EU subsidiaries that wish to interact with EUDI Wallets:

- They would need to establish an EU-based entity or use an EU-established intermediary
- This has been explicitly discussed in the GitHub issue ["Will the European Digital Identity Wallets work outside of Europe?"](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/issues) on the ARF repository

### 7.4 Intermediary in a Different Member State

The intermediary need not be in the same Member State as the End-Relying Party. A group IT services company in the Netherlands can act as intermediary for a subsidiary registered in Germany, as long as:
- The intermediary itself is registered as an RP in its own Member State (NL)
- The End-RP is registered in its Member State (DE)
- The intermediary holds the End-RP's RPRC

### 7.5 Member State Business Register Divergence and RP Registration

The practical implementation of RP registration will vary across Member States due to differences in national business register systems:

- **Identifier availability:** CIR 2025/848 Annex I Point 3 lists eight identifier types (EORI, LEI, VAT, EUID, etc.). Not all identifier types are available in all MSs. TS6 mandates that *"at least one Identifier SHALL be of type 'EUID' whenever available in the national business registry"*, with a fallback to MS-specific identifiers.
- **Trade name registration:** As detailed in §2.6, the concept and registration of trade names differs fundamentally across MSs. The Netherlands formally registers multiple *handelsnamen*; Germany does not register trade names in the Handelsregister; France has both *nom commercial* and *enseigne*.
- **Registration policy delegation:** Article 4 of CIR 2025/848 explicitly delegates registration policy to Member States. This means the answers to questions about trade names, branches, and multi-brand registration will likely vary by MS until harmonization occurs.

### 7.6 Sectoral Passporting and RP Registration

Financial institutions — banks, payment institutions, insurance companies, investment firms — routinely operate across the EU under sectoral "passporting" regimes that allow a license in one Member State to authorize activity throughout the EEA. This creates a tension with the RP registration model that requires separate analysis.

**Relevant passporting regimes:**

| Regime | Instrument | What it Permits |
|--------|-----------|-----------------|
| **Banking** | CRD IV/V (Directive 2013/36/EU) | Credit institutions authorized in one MS may establish branches or provide services cross-border in all other MSs |
| **Payment services** | PSD2 (Directive 2015/2366/EU) | Payment institutions and e-money institutions may passport through branches, agents, or direct cross-border services |
| **Insurance** | Solvency II (Directive 2009/138/EC) | Insurance undertakings may establish branches or provide services in other MSs under freedom of establishment or freedom to provide services |
| **Investment services** | MiFID II (Directive 2014/65/EU) | Investment firms may provide services cross-border or through branches |

**Key question: Does passporting exempt from RP registration?**

**No.** Art. 5b(4) states: *"Paragraphs 1 and 2 shall be without prejudice to Union or national law that is applicable to the provision of specific services."* This "without prejudice" clause means the two obligations run **in parallel**, not in substitution:

- The sectoral passporting regime governs the entity's authorization to *provide financial services*
- The RP registration governs the entity's authorization to *request data from EUDI wallets*
- Neither replaces the other

**Where does a passported entity register as an RP?**

Art. 5b(1) — "in the Member State where it is established." For passported entities, "established" has a clear meaning under sectoral law:

| Passporting Mode | "Established" in... | RP Registration MS |
|-----------------|---------------------|-------------------|
| **Home MS authorization** | Home MS | Home MS only |
| **Branch in host MS** | Both home and host MS (see §2.7 on branches) | Likely home MS, possibly also host MS (see §12.7) |
| **Cross-border services** (no establishment in host MS) | Home MS only | Home MS only |
| **PSD2 agent in host MS** | Agent is established in host MS as its own legal entity | Agent registers independently in its own MS |

This leads to a significant practical outcome: **a passported bank operating in 15 Member States through cross-border services (without branches) needs only one RP registration — in its home MS.** The wallet's cross-border recognition mechanism ensures that this home-MS registration is accepted throughout the EU.

**Art. 5f(2) — Mandatory wallet acceptance for financial sector:**

Financial institutions are among the explicit mandatory acceptors under Art. 5f(2): *"including in the areas of transport, energy, **banking, financial services**, social security, health..."*. They must accept the wallet within 36 months of the implementing acts' entry into force (estimated December 2027). This creates urgency for financial groups to resolve their RP registration strategy.

**PSD2 agents and the intermediary pattern:**

PSD2 distinguishes between the payment institution (PI) and its **agents** — natural or legal persons that provide payment services on behalf of the PI. Under PSD2:
- The PI is responsible for the agent's actions
- The PI must register agents with its home MS regulator
- Agents may operate in host MSs under the PI's passport

This maps naturally to the eIDAS intermediary pattern:
- The **PI** = End-RP (or intermediary, depending on architecture)
- The **agent** = could be an End-RP using the PI as intermediary, or a separate RP

However, there is a structural difference: under PSD2, the agent is *not independently licensed* — it acts under the PI's authorization. Under eIDAS 2.0, the intermediary is itself a registered RP (RPI_01). This creates a question of whether a PSD2 agent needs its own RP registration or is covered by the PI's registration.

**Art. 4(2) — Leveraging existing sectoral registration:**

CIR 2025/848 Art. 4(2): *"Member States may include or reuse existing sectoral or national registration policies."* This is a critical enabling clause for regulatory efficiency. A Member State could:

- Allow banks to leverage their existing CRD/PSD2 authorization as part of the RP registration identity proofing (Art. 4(3)(a-b))
- Reuse the EBA register as an "authentic source" for verifying the RP's identity (Art. 4(3)(c))
- Map the bank's LEI or institution ID as the RP identifier (Annex I Point 3(c))
- Cross-reference the bank's passporting notification to determine the MS where RP registration should occur

**CIR Annex I Point 12 — Entitlement types:**

The CIR's entitlement system (Annex I Point 12) does **not include a sector-specific entitlement** for financial institutions. A bank registers as a `Service_Provider` (Point 12(a)), just like any other commercial entity. This means the RP registration does not carry information about the entity's sectoral regulatory status — a bank and a retail website are registered under the same entitlement category.

Annex III's verification process references trusted lists (for trust service providers) and Commission-published lists (for PID/EAA providers), but does not reference sectoral regulatory registers like the EBA register. This is a gap that national registration policies could fill under Art. 4(2).

**Assessment:** Sectoral passporting does not create an exemption from RP registration, but it does simplify it. A passported entity registers once in its home MS, and the wallet ecosystem's cross-border recognition ensures acceptance across the EU. The most important practical provision is Art. 4(2), which allows MSs to streamline the RP registration process for already-regulated entities by reusing existing sectoral registration infrastructure. This could significantly reduce the compliance burden for large banking groups that are already subject to extensive regulatory oversight.


---

## 8. Architectural Deep Dives

This section analyses architectural patterns that emerge when the intermediary and registration models are applied to complex organisational structures — multi-layer delegation, dual-role registration, and commercial platform models.

### 8.1 Intermediary Chains and Delegation Depth

Complex corporate structures often involve multiple layers of delegation: a group holding company → a regional shared services entity → a local subsidiary → a local technical partner. This raises the question of whether the intermediary pattern supports chaining — can an intermediary delegate to another intermediary?

**The ARF supports only a flat two-layer model.**

Analysis of the ARF requirements (Discussion Paper X, §3.5, §4.3 Topic 52) reveals that the intermediary architecture is designed for exactly **two parties** visible to the wallet:

| Layer | Entity | Certificate Presented | Visible to Wallet User |
|-------|--------|----------------------|----------------------|
| Layer 1 | **Intermediary** | RPAC (containing intermediary's own name and identifier) | Yes — displayed during RP authentication (RPI_07) |
| Layer 2 | **End-Relying Party** | RPRC (held by intermediary, containing End-RP's name and intended use) | Yes — displayed as the requesting RP |

**Evidence that chaining is not supported:**

1. **RPI_06** — *"an intermediary SHALL request the presentation of attributes...using the intermediary's access certificate...and the registration certificate...in relation to the intermediated End-Relying Party."* The protocol expects exactly one RPAC (the intermediary's) and one RPRC (the End-RP's). There is no provision for a chain of RPACs.

2. **RPI_07** — *"the Wallet Unit SHALL verify the name of the intermediary during Relying Party authentication and display this name to the User."* The display model shows **one** intermediary name. Displaying a chain (Intermediary A → Intermediary B → End-RP) would create user confusion and is not addressed.

3. **RPI_08** — *"the intermediary SHALL forward these attributes only to the Relying Party that requested the intermediary."* This assumes a direct forwarding relationship between the intermediary and the End-RP. In a chain, the first intermediary would forward to the second intermediary, which would forward to the End-RP — but the second intermediary is itself prohibited from storing the content (Art. 5b(10)), creating a relay-without-storage model that is architecturally possible but not addressed in the ARF.

4. **CIR Annex I Points 14-15** — An End-RP can indicate *"that the wallet-relying party relies upon an intermediary"* (Point 14) and provide *"an association to the intermediary"* (Point 15). These fields are singular — one intermediary per End-RP, not a chain.

**Why this matters for corporate groups:**

Consider a large financial group with the following structure:

```
Group Holding (NL)
  └─ Group IT Services (NL) — provides wallet integration platform
       ├─ Regional Hub DACH (DE) — manages DE/AT/CH market
       │    ├─ Bank DE (DE) — retail banking
       │    └─ Insurance AT (AT) — insurance products
       └─ Regional Hub Nordics (SE) — manages SE/NO/DK/FI market
            ├─ Bank SE (SE) — retail banking
            └─ Payments FI (FI) — payment services
```

The group might want: Group IT Services → Regional Hub → Local Entity (three layers). But the ARF only supports two layers. The group must choose one of these flat configurations:

| Option | Intermediary | End-RPs | Trade-off |
|--------|-------------|---------|-----------|
| **A** | Group IT Services | Bank DE, Insurance AT, Bank SE, Payments FI | Centralised but Group IT holds all RPRCs. Regional hubs are invisible to the wallet. |
| **B** | Regional Hub DACH / Regional Hub Nordics | Local entities in their region | Regional responsibility, but two separate intermediary registrations required. Group IT's role must be managed contractually, outside the wallet framework. |
| **C** | Each local entity registers directly (no intermediary) | — | Maximum autonomy but no shared infrastructure benefit. Each entity manages its own wallet integration. |

**Option A is the most common choice** for groups seeking centralisation, as it flattens the hierarchy to the supported two-layer model. The regional hubs' roles are managed through internal SLAs and GDPR DPAs (see §9.1), but they are invisible to the wallet ecosystem.

**Can an intermediary also be an End-RP?**

Yes. The ARF (§3.5.2) explicitly states: *"the Relying Party acting as an intermediary has other wallet-relying party services with intended uses that invoke the duty to register an RPRC."* This means:

- Group IT Services could be registered as both an intermediary (for group subsidiaries) and a direct RP (for its own IT services that require wallet data)
- It would hold its own RPAC, its own RPRCs (for direct use), and RPRCs for all End-RPs (for intermediary use)
- The wallet user would see "Group IT Services" as the intermediary in one interaction, and as the direct RP in another

**Comparison with analogous delegation models:**

The flat intermediary model mirrors other regulatory frameworks:

- **PSD2 agents:** Only one level — the PI is responsible for the agent, not for a chain of agents
- **GDPR sub-processing:** Allows chains (processor → sub-processor → sub-sub-processor), but each level requires Art. 28 DPAs. The eIDAS intermediary model is more restrictive — no sub-intermediaries at all
- **PKI certificate chains:** PKI supports multi-level certificate hierarchies (root CA → intermediate CA → end-entity certificate), but this is for trust anchoring, not for delegation of business relationships

**Assessment:** The flat two-layer intermediary model is an intentional architectural constraint that prioritises **user transparency** (the wallet user sees exactly two names) and **accountability** (the intermediary is directly responsible for the End-RP's data). For complex corporate groups, this requires flattening the organizational hierarchy to fit the two-layer model, typically by choosing a single group-level intermediary that directly holds all End-RP RPRCs. The internal organisational layers (regional hubs, shared services, etc.) must be managed through contractual arrangements outside the wallet framework.

### 8.2 Dual-Role Registration: RP + Attestation Provider

Some entities within corporate groups operate on **both sides** of the wallet ecosystem — they consume wallet data as Relying Parties (e.g., verifying customer identity for KYC) and issue data into wallets as Attestation Providers (e.g., issuing payment account attestations as QEAAs). Banks are the paradigmatic example.

**Unified registration mechanism:**

Discussion Paper X §3.4 confirms that the CIR unifies the registration of RPs, PID Providers, and Attestation Providers into a **single registration mechanism**. The differentiation is expressed through the entitlement field (CIR Annex I Point 12), not through separate registration paths:

| Entitlement Code | Role |
|-----------------|------|
| `Service_Provider` | Consuming wallet data (standard RP) |
| `QEAA_Provider` | Issuing qualified electronic attestations of attributes |
| `Non_Q_EAA_Provider` | Issuing non-qualified attestations |
| `PUB_EAA_Provider` | Issuing attestations on behalf of a public sector authentic source |
| `PID_Provider` | Issuing person identification data |
| `QCert_for_ESig_Provider` | Issuing qualified certificates for electronic signatures |
| `QCert_for_ESeal_Provider` | Issuing qualified certificates for seals |

A single legal entity **can hold multiple entitlements** — CIR Annex I Point 12 uses *"The entitlement or entitlements"* (plural). A bank can register as both `Service_Provider` (for KYC) and `QEAA_Provider` (for issuing payment account attestations).

**Certificate architecture for dual-role entities:**

The entitlement distinction is expressed in the **RPRC, not the RPAC**:

- The entity receives **one RPAC** (its access certificate, used for mutual authentication)
- It receives **separate RPRCs per intended use** — some with `Service_Provider` entitlement (for data consumption), some with `QEAA_Provider` entitlement (for attestation issuance)
- Discussion Paper X §3.4 notes: *"the entitlements indicating the registered role are only present in the Relying Party registration certificate"* — and proposes deleting the ARF's Reg_17 requirement that access certificates indicate the entity's provider role

This means the RPAC is **role-neutral** — it identifies the entity but does not indicate whether it is consuming or issuing data in a specific interaction. The RPRC, presented alongside the RPAC, conveys the role.

**Functional separation requirement (Art. 45h):**

For entities that are also QEAA providers, Art. 45h imposes strict data isolation:

- **Art. 45h(1):** Providers *"shall not combine personal data relating to the provision of those services with personal data from any other services"*
- **Art. 45h(2):** Personal data for EAA services *"shall be kept logically separate from other data"*
- **Art. 45h(3):** QEAA providers *"shall implement the provision of such qualified trust services in a manner that is functionally separate from other services"*

For a dual-role bank:
- KYC data obtained through the RP role (consuming wallet PID for customer identification) **cannot be combined** with attestation issuance data (the payment account attestations it issues into wallets)
- Even though both involve the same customer, the data streams must be logically and functionally separate
- This creates an operational architecture requirement: the bank's RP function and its QEAA function must be implemented as separate operational domains, even if they share the same legal entity and the same RP registration

**Corporate group dimension:**

In a corporate group, the dual-role pattern can be distributed across entities:

```
Group Holding
  ├─ Bank (DE) — RP (Service_Provider: KYC verification)
  │                + QEAA_Provider (issuing payment account attestations)
  ├─ Insurance (AT) — RP (Service_Provider: claims verification)
  │                     consuming attestations issued by Bank (DE)
  └─ Group QTSP (NL) — QEAA_Provider only
                         (issuing group-wide employee credential attestations)
```

Key observations:
1. **Bank (DE)** holds both entitlements — it consumes PID (as RP) and issues QEAAs (as provider), with functional separation per Art. 45h(3)
2. **Insurance (AT)** consumes attestations that Bank (DE) issues — but this is a standard RP interaction, not an intra-registration concern. Insurance (AT) requests wallet attestations; the wallet presents them; the fact that the attestation was issued by a group entity is irrelevant to the protocol
3. **Group QTSP (NL)** is a pure attestation provider — it registers only with `QEAA_Provider` entitlement, but it is still registered through the same RP registration mechanism
4. **Annex III verification** — The Group QTSP's entitlement is verified against the **national trusted lists** (Annex III Point 1), not against the RP register. This creates a dual verification path: the registration happens through the RP register, but the entitlement verification references a different infrastructure

**Does the intermediary pattern apply to attestation issuance?**

No. The intermediary pattern (Art. 5b(10)) is designed for RPs *consuming* wallet data on behalf of End-RPs. The CIR does not provide an analogous intermediary mechanism for attestation *issuance*. A QEAA provider cannot delegate issuance to an intermediary — the provider must be directly registered as a QTSP on the national trusted list.

However, a group QTSP could **issue attestations on behalf of multiple group entities** if the attestations are within its qualified scope. The "on behalf of" relationship here is governed by the trust services framework (Art. 20-24), not by the RP intermediary mechanism.

**Assessment:** The unified registration mechanism (CIR Annex I Point 12) accommodates dual-role entities well — a single registration with multiple entitlements and separate RPRCs per role. The main complication is Art. 45h's functional separation requirement, which forces QEAA providers to maintain operational data isolation even when the same legal entity also acts as an RP. For corporate groups, the dual-role pattern is most efficient when QEAA functions are consolidated in a dedicated group QTSP entity, reducing the functional separation burden on operational subsidiaries.

### 8.3 White-Label and Platform RP Models

Beyond corporate groups, a significant market segment involves commercial platforms that offer **"EUDI Wallet integration as a service"** — a platform operator handles all technical wallet interactions for multiple unrelated clients. This is the purest form of the intermediary model at commercial scale.

**How the intermediary model maps to platforms:**

| Platform Concept | eIDAS 2.0 Mapping |
|-----------------|-------------------|
| Platform operator | Intermediary (registered RP per RPI_01) |
| Platform client (merchant, service provider) | End-RP (registered RP with own RPRC) |
| Platform's API call to wallet | Intermediary's access certificate (RPAC) + End-RP's registration certificate (RPRC) |
| Client's brand shown to user | End-RP's common name in RPRC (RPRC_03a), but wallet also shows intermediary name (RPI_07) |

The mapping is technically clean — the intermediary pattern was designed for this scenario. But several commercial-scale challenges emerge:

**1. Scalability of RPI_04 (registrar verification):**

RPI_04 requires: *"the Registrar SHALL verify, in a manner to be decided by a Member State, that the Relying Party will indeed use the services of the intermediary."*

For a corporate group, this verification is straightforward (the group IT entity and the subsidiary have a documented relationship). For a commercial platform with 500 clients:
- Each new client requires the registrar to verify the platform-client relationship
- The verification method is at national discretion — some MSs may accept a signed contract, others may require notarised documentation
- As the platform grows, this creates a per-client onboarding burden on the registrar
- If clients are in different MSs, the platform must coordinate with multiple registrars

This is the **key scalability bottleneck** for the platform model.

**2. No-storage mandate (Art. 5b(10)):**

The intermediary *"shall not store data about the content of the transaction."* For a SaaS platform, this means:

- **No logging of wallet data** — the platform cannot record the PID attributes, attestation contents, or any personal data flowing through it
- **No analytics on transaction content** — platforms cannot offer clients analytics dashboards showing what data was exchanged
- **No caching for performance** — wallet data cannot be cached for repeated verification
- **Pass-through architecture required** — the platform must forward wallet data to the End-RP without retaining it

This conflicts with standard SaaS platform practices (logging, monitoring, debugging, analytics). The platform must implement a strict **pass-through architecture** with audit trails limited to metadata (transaction occurred, timestamp, parties involved) but no content.

**3. Wallet UX — branding asymmetry:**

Per RPI_07, the wallet displays the **intermediary's name** to the user. The End-RP's name is also available (in the RPRC per RPRC_03a), but the intermediary is the entity the user "sees" as the requesting party:

```
Wallet display:
  "VerifyPlatform Inc. (acting on behalf of LocalShop GmbH)
   requests your:
   - Full name
   - Date of birth
   - Address"
```

For white-label platforms, this creates a **branding problem**: the client (LocalShop) wants the user to see *their* brand, not the platform's brand. The regulation requires the intermediary name to be shown (RPI_07), so the platform cannot be invisible.

**Comparison: platform intermediary vs. corporate group intermediary:**

| Aspect | Corporate Group Intermediary | Commercial Platform Intermediary |
|--------|---------------------------|--------------------------------|
| Relationship | Intra-group (parent-subsidiary) | Contractual (vendor-client) |
| Scale | 10-50 End-RPs (group entities) | 100-1000+ End-RPs (clients) |
| Due diligence | Inherent (group governance) | Must be established per client |
| No-storage compliance | Simpler (data stays within group) | Complex (data flows between unrelated parties) |
| RPI_04 verification | Easy (corporate documents) | Harder (per-client commercial contracts) |
| GDPR role | Processor within group | Processor for each separate controller |
| Branding | Group brand is acceptable | White-label tension (client wants own brand) |
| Liability | Shared within group | Contractual allocation per client agreement |

**Platform as a QTSP + intermediary:**

Some platforms may seek to offer both intermediary services (for wallet data consumption) and QEAA issuance (for attestation provision). This combines the dual-role pattern (§8.2) with the platform model:

- The platform registers as both `Service_Provider` (intermediary) and `QEAA_Provider`
- It intermediates wallet interactions for its clients (consuming PID) and issues attestations on behalf of authentic sources
- Art. 45h's functional separation applies to the QEAA function

**Assessment:** The intermediary pattern technically supports commercial platforms, but **RPI_04 registrar verification** becomes the primary scalability constraint. Platforms will need to establish efficient onboarding processes with registrars across MSs, potentially advocating for automated RPI_04 verification. The no-storage mandate forces a pass-through architecture that diverges from standard SaaS patterns. The wallet UX's intermediary name display creates a branding asymmetry that platform operators must address through user education or future UX refinements.


---

## 9. Compliance & Data Protection

This section analyses the GDPR alignment of the RP registration model — data controller/processor mapping, purpose limitation, and the constraints on post-presentation intra-group data flows.

### 9.1 GDPR Data Controller Alignment

The RP registration model has a direct parallel in GDPR's data controller/processor framework. For corporate groups, this alignment creates specific obligations that cannot be managed at group level alone.

**Core alignment: RP = Data Controller**

Each registered RP is the GDPR data controller for the personal data it receives from wallet interactions. This follows from the definition of "controller" in GDPR Art. 4(7) — the entity that "determines the purposes and means of the processing." Key implications for corporate groups:

| eIDAS 2.0 Concept | GDPR Parallel | Corporate Group Implication |
|-------------------|--------------|---------------------------|
| Registered RP (per legal entity) | Data controller (Art. 4(7)) | Each subsidiary is an independent data controller for wallet-obtained data. No "group-level controllership" exists. |
| Intended use declaration (Annex I Points 9-10) | Purpose limitation (Art. 5(1)(b)) | The RP's declared intended uses in the national register mirror the GDPR requirement to specify purposes at the time of collection. Requesting data beyond the registered scope violates *both* eIDAS Art. 5b(3) *and* GDPR Art. 5(1)(b). |
| Privacy policy URL per intended use (CIR Art. 8(2)(g)) | Transparency obligation (Arts. 13-14) | Each RP must provide a URL to its privacy policy for each intended use, embedded in the RPRC. This is the direct GDPR-eIDAS bridge — the RP's privacy notice must cover the specific wallet data processing. |
| Art. 5b(3) — no data beyond registration | Data minimisation (Art. 5(1)(c)) | Dual enforcement: the wallet technically limits the request to registered attributes, and GDPR limits processing to what is necessary. |

**Intermediary = Data Processor**

The intermediary's role under Art. 5b(10) — acting "on behalf of" the End-RP and being prohibited from storing transaction content — maps directly to the GDPR data processor role under Art. 28:

- The intermediary processes personal data (wallet interaction data) **on behalf of** the End-RP
- The no-storage mandate (`"shall not store data about the content of the transaction"`) is a regulatory data processing restriction that must be reflected in the Art. 28 Data Processing Agreement (DPA)
- The intermediary must comply with the End-RP's documented instructions for data processing
- If the intermediary uses sub-processors (e.g., cloud infrastructure for the wallet interaction endpoint), Art. 28(2-4) sub-processor provisions apply

For **intra-group intermediaries** (a group IT services entity acting as intermediary for group subsidiaries), this creates a paradox: the intermediary is a group entity processing data on behalf of other group entities, but GDPR treats this identically to a third-party processor relationship. Each subsidiary must have a separate DPA with the intermediary entity, even if both are wholly-owned subsidiaries of the same parent.

**Joint controllership risk (GDPR Art. 26)**

Corporate groups face joint controllership risk in specific wallet scenarios:

1. **Centralised onboarding:** If the parent company operates a common customer onboarding flow that uses the wallet, but the data is subsequently shared with multiple subsidiaries, the parent and subsidiaries may be joint controllers under Art. 26. This requires a transparent arrangement defining each party's responsibilities.

2. **Shared customer databases:** If wallet-obtained data from Subsidiary A's RP registration is shared internally with Subsidiary B for cross-selling, the two subsidiaries are acting as joint controllers (or require a separate legal basis for the onward transfer — legitimate interest, consent, etc.).

3. **Group-level analytics:** If wallet interaction data (not content, but metadata) is aggregated at group level for business intelligence, the parent could become a controller or joint controller for this processing, despite not being a registered RP itself.

**The no "group privilege" principle:**

GDPR Recital 48 states: *"Controllers that are part of a group of undertakings...may have a legitimate interest in transmitting personal data within the group of undertakings for internal administrative purposes."* However, this does not create an automatic legal basis for sharing wallet-obtained personal data across the group. Each transfer requires:

- A legal basis (legitimate interest for internal administration, consent for marketing, etc.)
- Compliance with purpose limitation (the data was obtained for a registered intended use; onward processing must be compatible)
- A data sharing agreement or DPA between group entities

**Privacy policy URL — per entity, per intended use:**

CIR Art. 8(2)(g) requires each RP to provide *"a URL to the privacy policy regarding the intended use"*, embedded in the RPRC (Art. 8(3)). For a corporate group with 10 subsidiaries, each having 3 intended uses, this means **30 separate privacy policy URLs**. These can be:

- Separate pages on the group's website (e.g., `group.com/privacy/subsidiary-a/kyc`)
- Or sections within a master privacy notice, as long as each URL points to the specific intended-use privacy information

This per-entity, per-intended-use granularity means privacy policies cannot simply be "the group's generic privacy notice." They must address the specific data requested, the specific purpose, and the specific legal basis for each wallet interaction.

**DPIA implications:**

Under GDPR Art. 35, a Data Protection Impact Assessment (DPIA) is required for processing that is "likely to result in a high risk to the rights and freedoms of natural persons." Wallet interactions — which involve identity verification, potentially biometric data, and possibly health or financial attributes — are likely to trigger DPIA requirements. For corporate groups:

- Each subsidiary (as an independent controller) should conduct its own DPIA for wallet-related processing
- DPIAs can share methodology and risk frameworks at group level, but the assessment must be entity-specific
- The group DPO can coordinate, but the accountability remains with each entity

**Assessment:** The GDPR-eIDAS alignment reinforces the per-entity nature of RP registration. Each subsidiary is an independent data controller, must have its own privacy policy per intended use, and must maintain separate GDPR compliance infrastructure for wallet-obtained data. The intermediary pattern creates an Art. 28 processor relationship that requires formal DPAs even within the same corporate group. The most significant practical impact is the privacy policy URL requirement — CIR Art. 8(2)(g) means each RP must have specific, granular privacy documentation tied to each registered intended use, embedded in its RPRC and visible to the wallet user.

### 9.2 Cross-Border Intra-Group Data Flows After Wallet Presentation

The RP registration declares *what data is requested* and *for what purpose* (CIR Annex I Points 9-10). Art. 5b(3) enforces this at the point of presentation — the RP cannot request data beyond its registered scope. But what happens to the data **after** the wallet presents it to the RP?

This is the boundary between eIDAS 2.0 and GDPR. eIDAS constrains the *acquisition* of data; GDPR governs its *subsequent processing*.

**The "purpose ceiling" created by RP registration:**

The RP's registered intended use (CIR Annex I Points 9-10) creates a **declared purpose** that is:
- **Technically enforced** by the wallet at presentation (the wallet checks the RPRC)
- **Publicly visible** in the national register (Art. 3(4))
- **Recorded** in the user's wallet transaction log (Art. 5a(4)(d))
- **Embedded** in the RPRC (Art. 8(2)(b))

This declared purpose functions as a **GDPR purpose ceiling** — the data was obtained for *this specific purpose*, and any further processing must be compatible with it (GDPR Art. 5(1)(b)) or based on a separate legal ground.

**Three post-presentation data flow scenarios:**

**Scenario 1: Direct use by the receiving RP (the base case)**

```
User's Wallet → [PID: name, DOB, address] → Europa Bank N.V.
                                               ↓
                                        KYC verification ✓
```

- Data is used for the declared purpose (KYC verification)
- Fully compliant with both eIDAS and GDPR
- No intra-group sharing

**Scenario 2: Intra-group sharing for the same purpose**

```
User's Wallet → [PID: name, DOB, address] → Europa Bank N.V. (KYC)
                                               ↓
                                        Europa Insurance B.V. (KYC)
```

- Europa Bank received PID for "KYC verification"
- Europa Insurance also needs KYC for its services
- **Can Europa Bank share the wallet-obtained PID with Europa Insurance?**

Analysis:
- **GDPR Art. 5(1)(b)**: Further processing for a "compatible purpose" may be lawful. KYC at both entities is arguably the same purpose category, but the *specific* purpose (banking KYC vs. insurance KYC) differs
- **The RP registration problem**: Europa Bank's RPRC declares KYC for *banking services*. Sharing for *insurance KYC* is a different intended use — it was not declared in Europa Bank's registration
- **User expectation**: The user shared data with Europa Bank, saw Europa Bank's name in the wallet, and consented to Europa Bank's privacy policy. Sharing with a different legal entity (even in the same group) was not part of that interaction
- **Likely outcome**: This requires either (a) Europa Insurance separately requests the PID from the wallet (recommended), or (b) a GDPR-compliant data sharing agreement with a compatible purpose assessment, plus transparency to the user via the privacy policy

**Scenario 3: Intra-group sharing for a different purpose**

```
User's Wallet → [PID: name, DOB, address] → Europa Bank N.V. (KYC)
                                               ↓
                                        Europa Analytics B.V. (group risk modelling)
```

- The data was obtained for KYC but is being used for group-wide risk analytics
- This is a **different purpose** — GDPR Art. 5(1)(b) purpose limitation applies
- Requires a separate legal basis (consent, legitimate interest under Art. 6(1)(f), or legal obligation)
- Must be disclosed in Europa Bank's privacy policy (Art. 8(2)(g))
- Even with BCRs, the original purpose limitation constrains what can be shared

**The intermediary's no-storage mandate in context:**

If the group uses an intermediary (§8.1), Art. 5b(10) adds a constraint:

```
User's Wallet → [PID] → Europa Group IT (intermediary) → Europa Bank N.V. (controller)
                              ↓
                        Cannot store ← Art. 5b(10)
```

The intermediary is a **pure pass-through** — it cannot retain any transaction content. This means:
- The intermediary cannot aggregate data across subsidiaries
- The intermediary cannot provide group-level analytics on wallet data
- Any intra-group sharing must happen between the End-RPs (the controllers), not through the intermediary

**Binding Corporate Rules (BCRs) — necessary but not sufficient:**

BCRs can legitimise intra-group data transfers (especially cross-border within the group), but they cannot override the purpose limitation created by the RP registration:

- BCRs define the **data protection framework** for intra-group transfers
- But the **purpose** for which data was obtained (as declared in the RPRC) constrains what BCRs can authorise
- A BCR cannot say "we can share all wallet-obtained KYC data across the group for any group purpose" — the original purpose limitation still applies

BCRs are most useful for:
- Cross-border transfers within the EEA (streamlining GDPR Chapter V compliance)
- Documenting the group's data protection standards
- Establishing the governance framework for intra-group data sharing agreements

**Right to erasure — cascading across the group:**

If the user exercises the right to erasure (GDPR Art. 17, surfaced via Art. 5a(4)(d)(ii)):
- The erasure request targets **the RP that received the data**
- If that RP shared the data intra-group, it must cascade the erasure to all recipients (GDPR Art. 17(2))
- The wallet only knows the original RP — it doesn't know about downstream sharing
- This creates a compliance burden: the group must track all downstream data flows and ensure cascading erasure

**Assessment:** The RP registration's declared purpose creates a "purpose ceiling" that tightly constrains post-presentation intra-group data flows. The most compliant approach is for **each group entity to independently request data from the user's wallet** for its own declared purpose, rather than relying on intra-group sharing of wallet-obtained data. This is architecturally aligned with the per-entity registration model and reinforces the user's control over who receives their data. Where intra-group sharing is genuinely necessary, it requires GDPR-compliant mechanisms (compatible purpose assessment, BCRs, updated privacy policies) and must remain within the bounds of the original RP registration's declared purpose.


---

## 10. Entity Classification & Special Cases

This section analyses how specific entity types — natural persons, state-owned enterprises, public-private partnerships, and entities undergoing corporate restructuring — fit into the RP registration model.

### 10.1 Natural Persons as Relying Parties

While this document focuses on corporate groups, the RP definition in Art. 3(6) — *"a natural or legal person"* — explicitly includes natural persons. Sole proprietors, freelance professionals, and individual practitioners represent a significant real-world RP category that the data model must accommodate.

**Data model mapping for natural person RPs:**

| CIR Annex I Field | Legal Person | Natural Person | Notes |
|-------------------|-------------|----------------|-------|
| Point 1: Legal name | Company name (e.g., "Acme GmbH") | Given name + family name (e.g., "Dr. Maria Schmidt") | TS6 maps to `legalName` (legal persons) or `givenName` + `familyName` (natural persons) |
| Point 2: Trade name | Brand or service name | Professional practice name (e.g., "Schmidt Legal") or absent | "Where applicable" — many sole proprietors trade under their own name |
| Point 3: Identifiers | EUID, LEI, VAT, business register number | Limited: possibly VAT if VAT-registered, tax reference number, or "other national identifier" (Point 3(h)) | Most identifiers (EORI, LEI, EUID) are designed for legal entities |
| Point 4: Physical address | Registered office | Professional address or home address | Privacy concern for natural persons working from home |
| Point 5: URL | Corporate website | May not exist for small practitioners | "Where applicable" |
| Point 11: Public sector body | Yes/No | Unlikely, unless acting in an official capacity | — |

**Identifier gap for natural person RPs:**

CIR Annex I Point 3 lists identifiers that are predominantly designed for legal entities:
- **EORI, LEI, EUID, excise number**: Not applicable to most natural persons
- **VAT number**: Only if the natural person is VAT-registered (which many small professionals are not)
- **Business register number**: Only if the natural person's practice is registered (varies by MS; sole proprietors in Germany's Handelsregister, but not all freelancers)
- **National identifier (Point 3(h))**: This catch-all could be the most important field for natural person RPs — it could reference:
  - A **professional register number** (e.g., bar association ID for lawyers, medical council number for doctors, notary commission number)
  - A **national tax identifier** (e.g., fiscal code in Italy, BSN in the Netherlands)
  - A **social security number** (used in some MSs as a general identifier)

The challenge is that national registration policies (Art. 4) must define which identifier is acceptable for natural persons — this will vary significantly across MSs.

**Professional associations as intermediaries:**

Professional associations (bar associations, medical councils, chambers of notaries) could act as **intermediaries** for their member professionals:

- The professional association registers as the intermediary (RPI_01)
- Individual professionals register as End-RPs, with the association holding their RPRCs
- The wallet user sees both: "Dutch Bar Association" (intermediary) + "Mr. J. de Vries, Attorney" (End-RP)
- This model reduces the registration burden on individual professionals while maintaining accountability through the association's existing supervisory role

This mirrors the franchisor/franchisee pattern (§2.8) and the PSD2 agent pattern (§7.6): a supervisory entity that already bears responsibility for its members naturally fits the intermediary role.

**Micro/small enterprise exemption (Art. 5f(2)):**

Art. 5f(2) exempts **micro and small enterprises** (as defined in Commission Recommendation 2003/361/EC) from the mandatory wallet acceptance obligation. This is directly relevant to natural person RPs:

- A sole-proprietor notary with fewer than 10 employees and turnover below €2M is a micro-enterprise — **not obligated** to accept wallets
- A solo-practice doctor is similarly exempt
- The exemption applies to mandatory acceptance, not to voluntary adoption — a micro-enterprise professional **can** still register as an RP and accept wallets voluntarily

For professional practices that exceed the threshold (e.g., a large law firm LLP), the exemption does not apply, and mandatory acceptance deadlines (Dec 2027 for sectors requiring strong authentication) apply.

**Assessment:** The CIR's data model can accommodate natural person RPs through the "where applicable" qualifiers and the national identifier catch-all (Point 3(h)), but is clearly optimised for legal entities. National registration policies will need to define acceptable identifiers for natural persons, and professional registers are the most natural candidate. The professional association intermediary pattern offers a scalable solution for sectors with structured membership organisations, reducing per-professional registration complexity while leveraging existing supervisory relationships.

### 10.2 Public Sector Bodies Within Mixed Corporate Groups

Corporate groups that include state-owned enterprises (SOEs), public-private partnerships (PPPs), or entities providing mandated public services face a split-obligation landscape — different entities (or even different services within the same entity) are subject to different acceptance deadlines and registration urgency.

**Art. 3(7) PSB definition — activity-based, not entity-based:**

> *"'public sector body' means a state, regional or local authority, a body governed by public law or an association formed by one or several such authorities or one or several such bodies governed by public law, **or a private entity mandated by at least one of those authorities, bodies or associations to provide public services, when acting under such a mandate**"*

This definition is critical: a **private entity** can be a PSB *when acting under a mandate* to provide public services. The PSB classification is **per-activity**, not per-entity. The same legal entity can be a PSB for some services and a private RP for others.

**Acceptance obligation timeline:**

| Entity Type | Acceptance Obligation | Deadline | Source | Exemptions |
|------------|----------------------|----------|--------|------------|
| PSB (serving online with eID) | **Mandatory** | Dec 2026 | Art. 5f(1) | None |
| Private RP (strong auth required by law/contract) | **Mandatory** | Dec 2027 | Art. 5f(2) | Micro and small enterprises exempt |
| VLOP (Very Large Online Platforms) | **Mandatory** | Upon regulation application | Art. 5f(3) | None |
| Private RP (voluntary) | **Optional** | No deadline | Art. 5b(1) | N/A |

**SOE classification scenarios within a corporate group:**

| Entity | PSB? | Rationale | Deadline |
|--------|------|-----------|----------|
| State-owned railway operator | **Yes** — mandated public service | Operating under state mandate to provide transport | Dec 2026 |
| State-owned bank (commercial activities) | **No** — commercial banking is not a mandated public service (typically) | Unless specifically mandated by law | Dec 2027 (via Art. 5f(2) — banking requires SCA) |
| Municipal water utility (SOE) | **Yes** — mandated public service (drinking water) | Art. 5f(2) also lists drinking water as a sector | Dec 2026 |
| State-owned holding company (asset management) | **No** — pure holding companies don't provide public services | Holding activity is not mandated public service provision | Voluntary |
| PPP highway operator | **Yes, when providing the mandated service** | But the private partner's other activities (e.g., commercial rest-stop services) are not under mandate | Split: highway services Dec 2026; commercial services per Art. 5f(2) |

**Split-obligation entities:**

The per-activity definition creates a unique registration challenge. Consider a PPP hospital operator:

- **Mandated public healthcare services** → PSB under Art. 3(7) → must accept wallets by Dec 2026
- **Private complementary services** (e.g., executive health check-ups, non-insured cosmetic consultations) → private RP → Dec 2027 deadline (or voluntary)

For RP registration:
- The entity registers **once** — it cannot register separately for its PSB and private activities
- But it may need **different intended uses** for each: one for mandated healthcare (with the PSB entitlement) and one for commercial healthcare
- CIR Annex I Point 11: *"an indicator of whether or not the wallet-relying party is a public sector body"* — this is a **boolean field**, not per-intended-use. A split-obligation entity would need to indicate "yes" if any of its services are PSB services

**PSB indicator in CIR Annex I Point 11:**

Point 11 is a simple yes/no indicator. This creates ambiguity for:
- SOEs that provide some public services and some commercial services
- PPPs where the mandate covers only part of the entity's activities
- A corporate group where one subsidiary is a PSB (e.g., mandated energy provider) and another is not (e.g., commercial energy trading)

The safe approach is: if **any** intended use is under a public service mandate, the entity registers as a PSB (Point 11 = yes). This triggers Art. 5f(1) urgency for those services.

**Group-level implications:**

In a mixed public-private corporate group:

```
State Holding (100% government-owned)
  ├─ National Rail (SOE) — PSB, mandated public transport → Dec 2026
  ├─ Energy Co (SOE) — PSB for regulated supply; private for trading → Split
  ├─ Digital Services (SOE) — not mandated, IT services → Private RP
  └─ PPP Toll Road Co (51% state, 49% private) — PSB for toll infrastructure
```

- The group intermediary (if Digital Services acts as such) serves both PSB and private End-RPs
- The PSB End-RPs must be registered and operational by Dec 2026
- The private End-RPs have until Dec 2027 (if requiring SCA) or can adopt voluntarily
- The group's rollout must prioritise PSB subsidiaries in Phase 2 (see §11.1)

**Assessment:** The activity-based PSB definition (Art. 3(7)) creates registration complexity for mixed public-private groups, but the per-intended-use RPRC model accommodates it. The key practical challenge is the **different acceptance deadlines** — PSB services by Dec 2026, regulated private services by Dec 2027 — which forces groups to sequence their rollout by entity type. The PSB indicator (Annex I Point 11) as a boolean is a simplification that may need refinement for split-obligation entities.

### 10.3 Corporate Restructuring: Mergers, Acquisitions, and Conversions

Corporate group structures change over time through mergers, acquisitions, demergers, spin-offs, and cross-border conversions. Each type of event has different consequences for RP registration, depending on whether the legal entity **survives**, **ceases to exist**, or **changes identity**.

**Classification of corporate events and RP registration impact:**

| Event Type | Legal Effect | RP Registration Consequence |
|------------|-------------|---------------------------|
| **Absorption merger** (Entity B merges into Entity A) | Entity B ceases to exist. Entity A is the universal successor. | Entity B's registration must be **cancelled** (CIR Art. 6(7)). Entity B's RPACs and RPRCs must be **revoked** (Art. 9(6)). Entity A may need to **re-register** for the intended uses previously held by B, under its own identity. |
| **New-entity merger** (Entities A and B merge to form Entity C) | Both A and B cease to exist. Entity C is the universal successor. | A's and B's registrations are cancelled. C registers as a new RP with new certificates. All RPACs and RPRCs for A and B are revoked. |
| **Acquisition** (Entity A acquires Entity B, B continues as subsidiary) | Both A and B survive. B becomes a subsidiary of A. | **No registration change required** for B. B's registration, RPACs, and RPRCs remain valid. The ownership structure is irrelevant to RP registration — it is per legal entity, not per corporate group. |
| **Demerger / spin-off** (Entity A splits off business unit as new Entity D) | A continues. D is created as a new legal entity. | If D takes over intended uses previously registered by A: A must **update** its registration (Art. 5b(6)) to remove those intended uses and associated RPRCs. D must **register** as a new RP for those intended uses. |
| **Cross-border conversion** (Entity A converts from NL BV to DE GmbH under Directive 2019/2121) | A maintains legal personality but changes legal form, registered office, and MS. Receives new EUID in DE. | A's NL registration must be cancelled. A must re-register in DE (new MS of establishment per Art. 5b(1)). All NL-issued RPACs and RPRCs are revoked. New certificates issued by DE's certificate authority. |
| **Legal name change** (Entity A renames to Entity A') | Same legal entity, new name. | A must **update** its registration without undue delay (Art. 5b(6), CIR Art. 5(3)). Existing RPACs and RPRCs must be **reissued** with the updated name — certificates bind identity to a key, and a name change invalidates the certificate's subject field. |

**Regulatory obligations during restructuring:**

The regulation provides a general framework for handling changes, but does not prescribe M&A-specific procedures:

1. **Update obligation:** Art. 5b(6) — *"Relying parties...shall inform Member States without delay about any changes to the information provided in the registration."* CIR Art. 5(3) reinforces: *"Wallet-relying parties shall update any information previously registered...without undue delay."*

2. **Cancellation mechanism:** CIR Art. 6(7) — *"When a wallet-relying party no longer intends to rely upon wallet units...it shall notify the relevant registrar without undue delay and request the cancellation of that registration."* For an entity that ceases to exist through merger, the successor entity or the registrar should initiate cancellation.

3. **Registrar-initiated suspension/cancellation:** CIR Art. 9(2)(a) — registrars may suspend or cancel a registration where it *"contains information, which is inaccurate, out of date or misleading."* An entity that has been absorbed by another no longer exists as a legal person, making its registration information inherently inaccurate.

4. **Certificate revocation cascade:** CIR Art. 9(5-6) — when a registration is suspended or cancelled, the registrar must notify certificate providers within 24 hours, and the providers must revoke the RPACs and RPRCs "without undue delay."

5. **Record retention:** CIR Art. 10 — registrars keep all registration records including "any subsequent changes to this information" for **10 years**. This provides an audit trail for corporate events.

**Certificate lifecycle implications:**

A critical technical constraint is that **certificates cannot be transferred between entities**. X.509 certificates (the basis for RPACs and RPRCs per ETSI TS 119 475) bind a specific identity to a specific key pair. When the legal entity behind a certificate changes identity (through merger, conversion, or name change):

- The certificate's *subject* field no longer matches the entity's current identity
- PKI standard practice requires **revocation of the old certificate** and **issuance of a new certificate** to the successor entity
- There is no mechanism for "assignment" or "transfer" of certificates to a different legal entity

This means every M&A event that changes an entity's legal identity triggers a complete certificate lifecycle event: revocation → new key pair → new certificate request → new certificate issuance. For large corporate groups undergoing restructuring, this can affect dozens of RPACs and hundreds of RPRCs simultaneously.

**Practical implications for corporate groups:**

1. **Timing risk:** Between the old registration's cancellation and the new registration's completion, the affected intended uses cannot be served with wallet interactions. For regulated entities with mandatory wallet acceptance (Art. 5f), this gap must be minimized.

2. **Intermediary resilience:** The intermediary pattern provides some insulation from M&A-related disruption. If Entity B (an End-RP using a group intermediary) is absorbed by Entity A:
   - The intermediary's own registration and RPAC are **unaffected** (it is a separate legal entity)
   - Only Entity B's RPRCs (held by the intermediary) need to be revoked
   - Entity A's RPRCs (also held by the intermediary) can be updated or new ones issued for the absorbed intended uses
   - The wallet user sees a change in End-RP name (from B to A) but the intermediary's identity remains constant

3. **Wallet user impact:** Users who previously interacted with Entity B will see a different entity name in their wallet transaction history for new interactions after the merger. The wallet's common dashboard (Art. 5a(4)(d)) will show both the old entity (for historical transactions) and the new entity (for new transactions). There is no mechanism for the wallet to display a "succession notice" linking the old and new entity.

4. **Cross-border conversion risk:** Under Directive 2019/2121, a cross-border conversion maintains legal personality — the entity is the "same" legal person in a new legal form. However, because RP registration is per-MS (Art. 5b(1)), the entity must de-register in the departure MS and re-register in the destination MS. This is arguably the most disruptive scenario for wallet-relying activities, despite the entity's continuity as a legal person.

**Assessment:** The regulation provides sufficient mechanisms (update, cancellation, revocation) to handle M&A events, but does not provide transition-specific procedures. The 24-hour revocation cascade (Art. 9(5)) is designed for regulatory enforcement, not for orderly corporate transitions. National registration policies (Art. 4) should address transition procedures to enable corporate restructuring without service disruption — e.g., allowing a successor entity to pre-register before the predecessor's cancellation takes effect.


---

## 11. Operational Planning

This section covers the practical planning dimensions of multi-entity RP registration — regulatory timelines, cost modelling, and the wallet user experience across corporate group entities.

### 11.1 Registration Timeline, Sequencing, and Phased Rollout

For corporate groups, the RP registration process is not a single event but a **sequenced programme** spanning months or years. The regulatory timeline, combined with architectural dependencies (intermediary before End-RPs) and multi-MS coordination, requires careful planning.

**Regulatory timeline:**

| Milestone | Date | Source | Impact on Corporate Groups |
|-----------|------|--------|---------------------------|
| eIDAS 2.0 enters into force | 20 May 2024 | Regulation (EU) 2024/1183 | Legal framework established — planning can begin |
| CIR 2025/848 published | 6 May 2025 | OJ publication | Registration rules are now final — technical preparation begins |
| CIR application date | ~24 December 2026 | CIR Art. 11 (20 days after OJ + 18 months) | National registers must be operational; RPs *may* register |
| MS wallets available | 31 December 2026 | Art. 5a(5) | Wallets exist; registration is meaningful |
| Public sector acceptance | 31 December 2026 | Art. 5f(1) | PSBs within corporate groups must register by this date |
| Private sector mandatory acceptance | ~December 2027 | Art. 5f(2) (36 months from implementing acts) | Banks, financial services, telecoms, etc. must accept wallets |

**Architectural dependency: intermediary registers first.**

The intermediary pattern creates a strict sequencing requirement:

1. **Step 1:** The intermediary entity registers as an RP (RPI_01) → receives its RPAC
2. **Step 2:** Each End-RP registers → the registrar issues RPRCs for each End-RP
3. **Step 3:** The intermediary receives and holds the End-RPs' RPRCs (RPI_03)
4. **Step 4:** The intermediary can now interact with wallets on behalf of End-RPs

For a corporate group: the **group IT services entity** (if acting as intermediary) must register before any subsidiary can begin wallet interactions. This has practical implications:

- The intermediary's home MS must have its registry operational before the group can proceed
- If the intermediary is in MS-A but subsidiaries are in MS-B, MS-C, MS-D — the group's rollout depends on MS-A's readiness
- The intermediary registration must declare its role (but there is no formal "intermediary" entitlement — see §7.6 note on national discretion)

**Incremental registration is supported.**

CIR Art. 5(3): *"Wallet-relying parties shall update any information previously registered...without undue delay."* Combined with the per-intended-use RPRC model, this means:

- An RP can register initially with one intended use (e.g., KYC verification), receive its first RPRC, and begin wallet interactions for that use
- Later, the RP can add additional intended uses (e.g., credit scoring, insurance underwriting) by updating its registration — each additional use triggers a new RPRC
- The RP does not need to wait until all intended uses are defined before starting

For corporate groups, this enables a **"register early, expand later"** strategy.

**Phased rollout strategy for corporate groups:**

A group with 15 subsidiaries across 8 MSs can adopt a phased approach:

```
Phase 0: Preparation (H1 2026)
├─ Define group intermediary architecture (Option A/B/C per §8.1)
├─ Map subsidiaries to home MSs and determine registration MS for each
├─ Prepare privacy policies per intended use per entity (§9.1)
└─ Establish intra-group DPAs for intermediary relationships

Phase 1: Intermediary registration (Q3-Q4 2026)
├─ Register intermediary entity in its home MS as soon as registry is operational
├─ Obtain intermediary's RPAC
└─ Validate technical wallet integration with intermediary's certificate

Phase 2: Priority subsidiaries (Q4 2026 - Q1 2027)
├─ Register PSB subsidiaries (mandatory by Dec 2026 under Art. 5f(1))
├─ Register largest subsidiary first (pilot for registration process)
├─ Register with initial intended use only (KYC)
└─ Issue RPRCs; intermediary begins holding End-RP certificates

Phase 3: Regulated sector subsidiaries (Q1-Q3 2027)
├─ Register banking/financial subsidiaries (mandatory by Dec 2027)
├─ Register insurance/telecoms subsidiaries
├─ Add additional intended uses to Phase 2 entities
└─ Roll out to remaining MSs as registries become operational

Phase 4: Full deployment (Q4 2027+)
├─ Register remaining subsidiaries (voluntary adopters)
├─ Complete all intended use registrations
├─ Consolidate certificate lifecycle management
└─ Establish ongoing compliance monitoring
```

**MS implementation divergence:**

Not all MSs will have their registries operational simultaneously. The CIR requires operational readiness by December 2026, but practical readiness will vary:

- Some MSs may launch earlier (e.g., those participating in EU wallet pilot programmes)
- Some MSs may have limited registrar capacity, causing processing delays (Art. 6(2))
- Registration policies (Art. 4) are national — different MSs may have different documentation requirements, different identity proofing processes, and different processing timelines

For corporate groups, this means:
- **Subsidiaries in early-adopter MSs** can register first, gaining operational experience
- **Subsidiaries in slower MSs** may face delays beyond the group's control
- The group should maintain a **MS registry readiness tracker** as part of its rollout governance

**Enforcement before registration:**

Art. 5b(3): Relying parties *"shall not request users to provide any data other than that indicated during the registration process."* Combined with Art. 5b(1), this implies that an unregistered entity **cannot interact with wallets at all** — there is no "provisional access" or "grace period" for unregistered RPs. The wallet's certificate validation (checking the RPAC and RPRC against the registrar's API and trusted lists) would reject an unregistered RP's request.

For corporate groups, this creates a **hard dependency**: a subsidiary cannot offer wallet-based services until its registration is complete and its certificates are issued.

**Assessment:** The phased rollout strategy is not just a practical convenience — it is architecturally necessary. The intermediary-first dependency (Steps 1-3), the per-MS registry readiness variation, and the incremental registration support (Art. 5(3)) all point toward a multi-phase deployment spanning 12-18 months. Corporate groups should begin planning in 2026, register intermediaries as soon as registries open, and phase subsidiary registrations according to regulatory urgency (PSBs first, then mandatory sectors, then voluntary).

### 11.2 Cost and Operational Impact of Multi-Entity Registration

For large corporate groups, RP registration is not a one-time administrative step — it creates a recurring operational programme with significant cost implications. This section models the cost drivers and identifies scaling mechanisms.

**Cost categories per entity:**

| Category | Cost Driver | Recurring? | Notes |
|----------|------------|-----------|-------|
| **1. Registration** | Registrar fees per MS | One-time + updates | CIR Art. 5b(2) mandates "cost-effective and proportionate to risk"; fees are set nationally and are **not yet published** |
| **2. Certificates** | RPAC issuance by Access Certificate Authority (Art. 7) | Annual/biannual renewal | At least one ACA per MS (Art. 7(1)); fees market-driven |
| | RPRC issuance per intended use (Art. 8) | Per intended use, renewed on change | Issued by RPRC provider appointed per MS |
| **3. Compliance** | Privacy policy per intended use (Art. 8(2)(g)) | Ongoing maintenance | Legal drafting, translation, hosting, updates |
| | Change notification (Art. 5(3)) | Per change event | Any change to registered information must be updated "without undue delay" |
| | Record-keeping (Art. 10) | 10-year retention | The registrar keeps records, but the RP must maintain its own documentation |
| | DPIA per entity (GDPR Art. 35) | Periodic review | As identified in §9.1 |

**Cost model for a corporate group:**

Consider a group with 50 subsidiaries across 15 MSs, each with 3 intended uses, using a centralised intermediary:

| Component | Without Intermediary | With Intermediary (Option A, §8.1) |
|-----------|---------------------|-------------------------------------|
| RP registrations | 50 (one per entity) | 51 (50 End-RPs + 1 intermediary) |
| RPACs | 50 (one per entity) | 1 (intermediary only; End-RPs don't get RPACs) |
| RPRCs | 150 (50 × 3 uses) | 150 (still 50 × 3, but held by intermediary) |
| Privacy policies | 150 (50 × 3 uses) | 150 (still per-entity, per-use; see §9.1) |
| Registrar interactions | 50+ (across 15 MSs) | 50+ (End-RPs still register in their MSs) |
| MS portals managed | Up to 15 | Up to 15 (End-RPs are distributed) |

**Key observation:** The intermediary model **does not significantly reduce registration volume** — the 50 End-RPs still need to register. What it reduces is:
- **RPAC volume**: From 50 to 1 (the intermediary holds the sole RPAC used for wallet interactions)
- **Technical integration points**: From 50 to 1 (only the intermediary needs the wallet integration infrastructure)
- **Certificate lifecycle management**: From 50 RPACs + 150 RPRCs to 1 RPAC + 150 RPRCs (all RPRCs managed by a single entity)

The cost saving is primarily **technical** (one wallet integration) rather than **administrative** (registration count remains similar).

**Scalability through automation:**

CIR Art. 3(5) mandates a **common API** for each national register, with requirements in Annex II Sections 1-2. Art. 4(3)(e) requires registration policies to support **automated registration processes** where appropriate. Art. 6(1) requires registrars to establish *"electronic, and where possible, automated registration processes."*

For corporate groups, this means:
- A group can build a **single registration client** that interfaces with the common API across all 15 MSs
- Automated registration could enable batch submission of End-RP registrations
- Change notifications (Art. 5(3)) can be programmatic
- The common API enables automated monitoring of registration status and certificate validity

The ETSI TS 119 475 standard defines the data model for the national register, ensuring that the group's registration client can use a consistent interface across MSs (though national policies may add MS-specific requirements).

**Ongoing operational burden:**

Beyond initial registration, the group faces recurring operational costs:

1. **Certificate renewal**: RPACs and RPRCs have limited validity periods. For 150 RPRCs, even with staggered renewal, this creates a steady-state workload
2. **Privacy policy maintenance**: Each of the 150 privacy policies must be kept current. A GDPR change, a business model change, or a new data category triggers updates across multiple policies
3. **Registrar relationship management**: Different MSs have different procedures. A group with subsidiaries in 15 MSs must maintain relationships with up to 15 registrars (or their automated API endpoints)
4. **Suspension/cancellation response**: CIR Art. 9(5) requires the registrar to notify within **24 hours** of any suspension or cancellation. The group must have a monitoring and response capability that can react within this window across all MSs
5. **Art. 10 record-keeping**: 10-year retention of all registration information and changes. For 50 entities with ongoing updates, this is a non-trivial compliance archive

**Does the cost structure incentivise corporate restructuring?**

The per-entity registration model might incentivise groups to **consolidate legal entities** — merging small subsidiaries to reduce the number of RP registrations. However:
- Regulatory constraints in some sectors (e.g., banking separation, insurance ring-fencing) prevent entity consolidation
- Tax and liability structures may require distinct entities regardless of wallet registration costs
- The intermediary model provides an alternative to consolidation: keep entities separate but centralise the technical burden

**Assessment:** The total cost of multi-entity RP registration is driven more by **compliance effort** (privacy policies, DPIAs, change management) than by **registration fees** (which the CIR mandates to be cost-effective). The intermediary model does not reduce administrative volume but significantly reduces technical complexity by centralising wallet integration. The common API (Art. 3(5), Annex II) is the primary scalability mechanism — corporate groups should invest in automated registration and lifecycle management tooling early in the rollout.

### 11.3 Wallet User Experience Across Multiple Group Entities

When a consumer interacts with multiple entities from the same corporate group — e.g., a banking app, a payments app, and an insurance app, all under different trade names but owned by the same holding company — the wallet creates separate interaction records for each. This section analyses the UX implications.

**No group-level aggregation in the wallet:**

The wallet's common dashboard (Art. 5a(4)(d)) provides:
- **(i)** An up-to-date list of **relying parties** with which the user has established a connection
- **(ii)** Easy request for **erasure by a relying party** (GDPR Art. 17)
- **(iii)** Easy **reporting** of a relying party to the DPA

The dashboard is structured per **relying party**, not per corporate group. The wallet has no concept of group membership. What the user sees:

```
Transaction History:
  ├─ Europa Bank N.V. — KYC verification (14 Jan 2027)
  │   Data shared: Full name, DOB, Address, BSN
  ├─ Europa Insurance B.V. — Policy onboarding (22 Jan 2027)
  │   Data shared: Full name, DOB, Address
  ├─ Meridian Group N.V. — Investment account opening (3 Feb 2027)
  │   Data shared: Full name, DOB, Tax ID
  └─ Vesta Claims — Accident report (15 Feb 2027)
      Data shared: Full name, Address, Driver licence number
```

The user cannot see that Europa Bank and Europa Insurance are part of the same group. Each entity appears independently.

**RPRC_09 — unique identifier does NOT encode group membership:**

RPRC_09 requires: *"The EU-wide unique identifier SHALL be identical in all registration certificates issued for a given Relying Party."*

This ensures consistency across a single entity's multiple RPRCs (for different intended uses), but it does **not** encode group relationships. The identifiers for Europa Bank and Europa Insurance are different — they are different legal entities.

The CIR Annex I data model does not include any field for "parent entity", "group membership", or "corporate group identifier". This is a deliberate design choice — the wallet's trust model is entity-to-entity, not group-to-entity.

**Erasure requests — per entity, not per group:**

Art. 5a(4)(d)(ii) enables the user to *"easily request the erasure by a relying party of personal data."* This operates at the **RP level**:

- If the user wants to erase data shared with the entire Europa group, they must send **separate erasure requests** to Europa Bank, Europa Insurance, and any other Europa entity they interacted with
- The wallet cannot send a "group erasure" — it doesn't know these entities are related
- From the user's perspective, this is inconvenient: they shared data with "Europa" but the wallet forces them to track down each legal entity separately

**Complaint mechanism — per entity:**

Similarly, Art. 5a(4)(d)(iii) allows reporting a relying party to the DPA. If the user suspects data abuse by "the group", they must identify and report specific entities. The DPA may investigate at the group level (especially under GDPR's joint controllership provisions), but the wallet's mechanism is entity-level.

**Intermediary UX — a partial solution:**

If the group uses an intermediary model (Option A, §8.1), the wallet UX changes:

```
Transaction History:
  ├─ Europa Group IT (intermediary) on behalf of Europa Bank N.V.
  │   Data shared: Full name, DOB, Address, BSN
  ├─ Europa Group IT (intermediary) on behalf of Europa Insurance B.V.
  │   Data shared: Full name, DOB, Address
  └─ ...
```

The intermediary name ("Europa Group IT") now provides a **visual clue** that these entities are related. The user can see a common thread in their transaction history. However:
- This is an unintended UX benefit — the intermediary is shown for accountability, not for group transparency
- Erasure still goes to the intermediary (as a processor) who must forward it to the End-RP (the controller)
- The intermediary's no-storage mandate means the intermediary itself has no data to erase

**Trade name field — additional user confusion:**

CIR Annex I Point 2 allows a *"user-friendly name...that can be either a trade name or service name that is recognisable to the user."* This means:

- "Europa Bank N.V." might display as "Europa Banking"
- "Europa Insurance B.V." might display as "Europa Insurance"
- But there's no requirement that related entities use consistent naming conventions

A corporate group could choose to use a consistent prefix ("Europa Banking", "Europa Insurance", "Europa Payments") for user recognition, or each entity could use entirely different trade names ("Solaris Bank", "Euroguard", "Europa Direct"). The CIR does not constrain this choice.

**Assessment:** The wallet provides **no group-level transparency**. This is architecturally consistent with the per-entity registration model and the wallet's role as a user-controlled privacy tool — it is designed to show *who* requested data, not *who owns whom*. For corporate groups, this means the user experience fragments across entities. The intermediary model provides an incidental group indicator (common intermediary name), but this is not its primary purpose. A future enhancement — an optional "group membership" field in the CIR data model — could improve user transparency without changing the per-entity registration architecture.

---

## 12. Open Questions

### 12.1 Intra-Group Intermediary vs. Third-Party Intermediary

The regulation does not distinguish between intra-group and third-party intermediaries. An intra-group shared services entity follows the **same** intermediary rules as an external platform provider. This means:

- The same **no-storage** obligation applies (Art. 5b(10))
- The same **registration requirements** apply (ARF RPI_01)
- The same **certificate architecture** applies (ARF RPI_03, RPI_06)

**Open:** Will Member States provide any simplified registration path for intra-group intermediaries, recognizing the common ownership structure? The ARF currently leaves this to national discretion (see RPI_04: *"in a manner to be decided by a Member State"*).

### 12.2 Group-Level Compliance Reporting

For regulated entities (banks, insurers), supervisory bodies often require group-level risk reporting. **Open:** How will supervisory bodies (National Competent Authorities) approach compliance monitoring for EUDI Wallet integration at the group level?

### 12.3 Shared Services Entity as RP vs. Intermediary

If a group's shared services company both provides IT services to subsidiaries **and** uses wallets for its own purposes (e.g., employee onboarding), it would be both:
- An **End-RP** for its own intended uses
- An **intermediary** for its subsidiaries' intended uses

Both the ARF and Discussion Paper X support this dual role. The current ARF HLR RPI_01 (note c) states: *"An entity that registered as an intermediary may also register as a Relying Party in its own capacity. In such a case, it will receive one or more registration certificates for its intended use(s), and will use one of these certificates when interacting with a Wallet Unit."* The Discussion Paper X (§3.5) adds: *"this assumption remains valid unless the Relying Party acting as an intermediary has other wallet-relying party services with intended uses that invoke the duty to register an RPRC."*

### 12.4 Liability Chain Within the Group

> **Discussion Paper X, §3.5.1:** *"As the intermediaries are acting on behalf of the End-Relying Parties, and will remain liable towards the Registrar on accuracy of the information to be registered, they must carry same identity proofing and data verification checks for their customers as the Registrar would do for the End-Relying Party in case of direct registration path. The Registrar shall also not trust blindly the Intermediary but execute the identity verification of both the Intermediary and the End-Relying Parties to be registered."*

**Open:** In an intra-group scenario, how does the liability chain interact with corporate group liability frameworks? Does the intermediary subsidiary bear independent liability, or does the parent's corporate governance structure provide implicit guarantees?

### 12.5 Multi-Brand Registration for a Single Legal Entity

When a single legal entity operates multiple consumer-facing services under distinct trade names — where those trade names are registered in the national business register but are not separate legal entities — the current registration framework presents a practical challenge.

CIR 2025/848 Annex I provides a single `tradeName` field (Point 2) per registration (cf. §2.6). However, the CIR does not explicitly state whether a single legal entity may submit **multiple registrations**, each with a different trade name for a distinct intended use. The closest relevant provision is Article 6(3)(d), which requires the registrar to verify *"the absence of an existing registration in another national register"* — this is aimed at preventing dual MS registration, not preventing multiple registrations within the same MS for the same entity.

**Possible resolution paths:**

| Path | Mechanism | Feasibility |
|------|-----------|-------------|
| **Multiple registrations** | The entity registers multiple times in the same MS register, once per brand/intended use, each with a different `tradeName` | Plausible — the CIR does not prohibit it. But RPRC_09 requires the same unique identifier across all RPRCs for *a given Relying Party*, which suggests the registrar would need to link these as the same legal entity with different user-facing identities. |
| **Single registration, most prominent brand** | The entity chooses one `tradeName`. Other brands present the same name to wallet users. | Simplest, but may cause confusion for users who do not recognise the registered brand name. |
| **Intermediary per brand** | Each brand is set up as a separate wallet integration channel, with the parent entity as the End-RP and a per-brand intermediary (potentially the entity itself in different capacities). | Architecturally complex. The intermediary pattern was designed for technical delegation, not brand differentiation. However, ARF RPI_07 requires the wallet to display *both* the intermediary name and the End-RP name, which could surface the brand identity through the intermediary name. |

**Assessment:** This is one of the practical questions that Article 4 of CIR 2025/848 (national registration policies) is designed to resolve. Until Member States publish their registration policies, the answer remains jurisdictionally dependent. The most likely practice is that registrars will allow multiple intended use registrations under the same legal entity, but the per-brand `tradeName` question is not yet settled.

### 12.6 What the Wallet User Sees — Trade Name vs. Statutory Name

The wallet user experience for multi-brand entities depends on which name field the wallet displays. Based on the ARF analysis (§3.1):

- **RPAC** contains the user-friendly name (Reg_33, `tradeName`) and unique identifier
- **RPRC** contains a name "in a format suitable for presenting to a User" (RPRC_03a) — i.e., also the `tradeName`
- **Wallet display:** The wallet presents the `tradeName` from the RPAC/RPRC, not the `legalName`

**Open:** Does the wallet also display the statutory (`legalName`) name alongside the trade name? The ARF does not mandate this. In jurisdictions where the trade name is well-known but the statutory name is opaque (e.g., where the parent entity has a holding-company-style name unfamiliar to consumers), displaying only the trade name provides clarity. But in scenarios where the user should understand the underlying legal entity (e.g., for GDPR data controller identification), the absence of the statutory name could be problematic.

**Open:** If a legal entity has multiple RPRCs (for different intended uses), can each RPRC carry a different `tradeName`? The CIR is silent. RPRC_09 mandates identical unique identifiers but does not address whether the user-friendly name must also be identical across RPRCs.

### 12.7 Branch Registration and Member State Policies

As analysed in §2.7, branches (non-subsidiary extensions of a parent entity in other Member States) are registered in host MS business registers with their own EUID under Directive 2017/1132, but are not separate legal entities. The CIR's registration requirements interact with this branch framework in unresolved ways:

**Open:** Must a legal entity with branches in multiple Member States register as an RP in each host MS where a branch provides wallet-relying services? Or does a single registration in the home MS suffice, since the entity is only one legal person regardless of its branch presence?

**Open:** Can the RP registration in one MS reference a branch's EUID from another MS's register? CIR 2025/848 Annex I Point 3 allows *"one or more identifiers"*, and TS6 allows multiple identifiers. A branch EUID is a valid identifier in an official record. But the CIR's Article 6(3)(d) check for *"absence of an existing registration in another national register"* could complicate multi-MS branch registration.

### 12.8 Multiple Addresses and URLs

CIR 2025/848 Annex I uses the singular for both:
- **Point 4:** *"the physical address where the wallet-relying party is established"*
- **Point 5:** *"a uniform resource locator ('URL') belonging to the wallet-relying party"*

However, TS6 maps the URL to `WalletRelyingParty.infoURI` with the caveat *"at least one uniform resource identifier"* — suggesting the data model supports multiple URIs even though the CIR text uses the singular.

**Open:** For entities operating across multiple addresses (headquarters, branches, data centres) and domains (corporate site, consumer app, API endpoints), can the registration include multiple addresses and URLs? This is particularly relevant for the intermediary pattern, where the intermediary and End-RP may have different addresses.

### 12.9 Divergent Trade Name Concepts Across Member States

As documented in §2.6, the concept of a "trade name" in a national business register varies substantially across the EU:

- In some MSs (NL, BE), multiple trade names are formally registered and publicly searchable
- In others (DE), trade names are not registered in the primary commercial register but may be protected under trademark law
- In others still (FR, IE), trade names and business names follow separate registration regimes

**Open:** How will registrars in each MS validate the `tradeName` field (Annex I, Point 2)? In MSs where trade names are not formally registered, what documentary evidence will be required? Will Member State registration policies (Art. 4) harmonise the concept, or will each MS apply its own standard?

### 12.10 Intermediary Pattern as a Practical Workaround for Multi-Brand Identity

The intermediary mechanism (Art. 5b(10)) was designed for technical delegation — enabling a platform operator to handle wallet interactions on behalf of end-RPs. However, it could theoretically serve as a **practical workaround for the multi-brand problem**:

- The parent legal entity registers as the End-RP (under its statutory name)
- For each brand, a separate intermediary registration could present a brand-specific `tradeName`
- The wallet user would see the intermediary's trade name (the consumer brand) alongside the End-RP's statutory name (the parent entity)
- This leverages ARF RPI_07: *"the Wallet Unit SHALL display the names and identifiers of **both** the intermediary and the intermediated End-Relying Party"*

**Assessment:** This is architecturally feasible but represents a use of the intermediary mechanism beyond its original design intent. It introduces complexity (multiple intermediary registrations, each requiring its own RPAC) and may not align with every MS's interpretation of Art. 5b(10). It may be more practical to await MS-level registration policies that explicitly address multi-brand entities.

**Hypothesis:** The multi-brand problem is most likely to be resolved at the **national registration policy level** (Art. 4) rather than through architectural workarounds. MSs with sophisticated business register systems (NL, BE) that already support multiple trade names per entity are likely to develop registration policies that accommodate this directly. MSs with simpler trade name concepts may require entities to choose a single user-facing name.

### 12.11 Corporate Restructuring Transition Procedures

As analysed in §10.3, M&A events trigger certificate revocation and re-registration. However, the regulation does not prescribe transition-specific procedures:

**Open:** Can a successor entity **pre-register** in the national register before the predecessor's registration is cancelled, to avoid a service gap during corporate restructuring? The CIR's Art. 6(3)(d) check for *"absence of an existing registration in another national register"* is aimed at preventing dual-MS registration, not at preventing a successor from preparing its registration. But it is unclear whether registrars will interpret this literally.

**Open:** How should the **24-hour revocation cascade** (CIR Art. 9(5-6)) be coordinated with corporate event timelines? A merger that takes effect at midnight on a specific date requires the predecessor's certificates to be revoked and the successor's certificates to be operational immediately. The regulation does not address this synchronisation requirement.

**Open:** Does the wallet provide any mechanism for **entity succession transparency** — e.g., linking an old RP identity to its successor in the wallet user's transaction history? The wallet's common dashboard (Art. 5a(4)(d)) shows all interacted-with RPs, but historically absorbed entities would appear as separate, unrelated entries with no visible link to the successor.

### 12.12 Sectoral Passporting and RP Registration Alignment

As analysed in §7.6, regulated financial institutions operating under passporting regimes face specific RP registration questions:

**Open:** Do **PSD2 agents** (natural or legal persons providing payment services on behalf of a payment institution) need their own RP registration, or are they covered by the PI's registration? Under PSD2, agents act under the PI's authorization and are not independently licensed. Under eIDAS 2.0, the intermediary pattern requires independent RP registration (RPI_01). If a PI has 500 agents across 10 MSs acting as wallet-relying touchpoints, the registration burden is significant.

**Open:** Will national registration policies allow financial institutions to **reuse existing regulatory identifiers** (LEI, EBA institution ID, PSD2 authorization number) as the primary RP identifier, per CIR Art. 4(2)? Or will they require separate RP-specific identifiers? The efficiency gain from Art. 4(2) depends entirely on how MSs implement this provision.

**Open:** Should the CIR's entitlement system (Annex I Point 12) include **sector-specific entitlements** for regulated financial institutions? Currently, a bank registers as `Service_Provider`, indistinguishable from any non-regulated entity. A sector-specific entitlement could enable wallets to display trust indicators based on the entity's regulated status, but this would require amending the CIR.

### 12.13 GDPR Controller/Processor Alignment Within Corporate Groups

As analysed in §9.1, the RP=controller and intermediary=processor parallels create specific compliance requirements:

**Open:** When an intra-group intermediary (e.g., group IT services entity) processes wallet data on behalf of subsidiary End-RPs, must each subsidiary have a **separate DPA** with the intermediary under GDPR Art. 28? GDPR does not exempt intra-group processor relationships from the Art. 28 DPA requirement, but enforcement practice varies. For a group with 15 subsidiaries all using the same intermediary, this creates 15 identical DPAs — a proportionality question.

**Open:** Does the privacy policy URL in **CIR Art. 8(2)(g)** need to be a per-entity, per-intended-use GDPR privacy notice — or can it link to a section within a consolidated group privacy policy? The CIR says *"the privacy policy regarding the intended use"*, suggesting specificity. But GDPR Art. 13 does not mandate that privacy notices be organized per service or purpose.

**Open:** If multiple subsidiaries within a corporate group independently request the same wallet attributes from the same user (e.g., each subsidiary performs its own KYC), is this compliant with **GDPR data minimisation** (Art. 5(1)(c))? The user may view repeated identity requests from related entities as disproportionate, even though each entity has a separate registration and separate legal basis.

### 12.14 Intermediary Chains and Multi-Layer Delegation

As analysed in §8.1, the ARF only supports a flat two-layer intermediary model. This creates challenges for complex corporate structures:

**Open:** Can an **End-RP use multiple intermediaries** for different intended uses? CIR Annex I Points 14-15 use the singular ("an intermediary"), but architecturally there is no reason why an End-RP could not associate with multiple intermediaries — e.g., one intermediary for KYC interactions and a different intermediary for payment initiation.

**Open:** If a group chooses **Option A** (single centralised intermediary for all subsidiaries), the intermediary entity holds RPRCs for potentially dozens of End-RPs across multiple Member States. Is there a practical or regulatory **limit on the number of End-RPs per intermediary**? The CIR does not impose one, but registrar validation processes (RPI_04) may become burdensome at scale.

**Open:** Can the ARF's flat model be **extended in future revisions** to support a chain of intermediaries (e.g., for marketplace platforms where a marketplace operator delegates to individual merchants)? This would require changes to the certificate presentation protocol (RPI_06), the wallet display (RPI_07), and the no-storage mandate scope.

### 12.15 Dual-Role Registration and Functional Separation

As analysed in §8.2, entities acting as both RP and attestation provider face specific registration and operational questions:

**Open:** Does Article 45h(3)'s **functional separation requirement** apply at the legal entity level or at the operational system level? If a bank uses the same IT platform for both RP interactions (consuming wallet PID) and attestation issuance (issuing payment account QEAAs), must the platform have separate logical domains, or must the bank operate separate systems entirely?

**Open:** When a group QTSP issues attestations that are subsequently consumed by an RP within the same corporate group, is there a **conflict of interest** concern? The group is both the issuer and the verifier of the same attestation type. The regulation does not address this — the three-party model (issuer → user → verifier) assumes independent parties.

**Open:** Can the **intermediary pattern** be extended to attestation issuance in future revisions? Currently, a QTSP must be directly registered on the trusted list. If a group has a single QTSP entity that could act as an "attestation intermediary" for multiple group entities, this would enable centralised issuance without each entity becoming a separate QTSP.

### 12.16 Registration Timeline and Sequencing

As analysed in §11.1, the phased rollout creates specific timing and coordination questions:

**Open:** If the intermediary is established in MS-A but several End-RPs are in MS-B, does the **intermediary need to register in MS-B** as well, or does the cross-MS recognition mechanism ensure that an intermediary registered in MS-A can hold RPRCs issued by MS-B's registrar for End-RPs in MS-B? The CIR's single-MS registration model (Art. 5b(1)) suggests the intermediary registers once in MS-A, but the RPRC issuance for End-RPs in MS-B involves MS-B's registrar.

**Open:** Is there a **maximum processing time** for registrar responses? CIR Art. 6(2) says *"without undue delay"* and *"within the timeframe defined in the applicable registration policy"*. For a group submitting 15 registrations simultaneously, national registrar capacity could create bottlenecks. Will national policies define SLAs?

### 12.17 Natural Persons as RPs

As analysed in §10.1, the data model is optimised for legal entities but must accommodate natural persons:

**Open:** Will national registration policies require natural person RPs to publish their **home address** as the "physical address" (Point 4), or will they accept a professional/correspondence address? This is a significant **GDPR and personal safety concern** for individuals operating from private residences. Some MS business registers already face this tension (e.g., UK's registered office requirement for sole traders).

**Open:** Can a **professional register number** serve as the sole identifier for a natural person RP under Point 3(h)? If so, which professional registers are considered "official records" for the purposes of CIR Annex I Point 3? This determination is entirely within national discretion and will likely vary by MS and by profession.

### 12.18 Cost and Operational Impact

As analysed in §11.2, the cost of multi-entity registration is significant for large corporate groups:

**Open:** Will national registrars publish **fee schedules** before the registration window opens (December 2026), allowing corporate groups to budget? Art. 5b(2) says "cost-effective and proportionate to risk" but does not define a fee cap or free-of-charge requirement for RP registration (unlike wallet validation, which is free).

**Open:** Will the **common API** (Art. 3(5), Annex II) be sufficiently standardised across MSs to allow a single registration client, or will MS-specific extensions require per-MS adaptations? The ETSI TS 119 475 standard defines the data model, but national registration policies (Art. 4) may add divergent requirements.

### 12.19 Public Sector Bodies and Split Obligations

As analysed in §10.2, SOEs and PPPs face classification challenges under Art. 3(7):

**Open:** For a split-obligation entity (PSB for some services, private RP for others), should the CIR Annex I Point 11 **PSB indicator** be made per-intended-use instead of per-entity? The current boolean creates a false dilemma: marking "yes" applies the PSB label to commercial services too; marking "no" fails to capture the mandated public service role.

**Open:** Can a **mixed corporate group** use a single intermediary for both its PSB entities (Dec 2026 deadline) and its private entities (Dec 2027 deadline)? The intermediary itself is a private entity — does it need to be registered earlier because it serves PSB End-RPs?

### 12.20 White-Label and Platform Models

As analysed in §8.3, commercial platforms face specific scalability and architectural challenges:

**Open:** Can RPI_04 verification be **automated** for commercial platforms, e.g., through a standardised electronic contract format that the registrar can validate programmatically? Without automation, the per-client registrar verification becomes a bottleneck for platforms onboarding hundreds of End-RPs.

**Open:** Does the no-storage mandate (Art. 5b(10)) permit intermediary platforms to retain **aggregated, anonymised transaction metrics** (e.g., total verification count per client, success/failure rates) without storing "data about the content of the transaction"? The boundary between metadata and content is not defined in the regulation.

### 12.21 Wallet UX and Group Transparency

As analysed in §11.3, the wallet provides no group-level aggregation:

**Open:** Should a future revision of the CIR introduce an **optional "group identifier" field** (e.g., LEI of the parent entity) in Annex I, enabling wallets to visually group related RPs in the transaction dashboard? This would improve user transparency without changing the per-entity registration model.

**Open:** Can the user's **right to erasure** (Art. 5a(4)(d)(ii)) be exercised at group level — i.e., sending a single erasure request that propagates to all entities within a corporate group? This would require the wallet to know group membership, and would require GDPR Art. 17 to be interpreted at the controller group level (which is supported under Binding Corporate Rules but not standard practice).

### 12.22 Cross-Border Intra-Group Data Flows

As analysed in §9.2, the RP registration creates a "purpose ceiling" on post-presentation data sharing:

**Open:** Does the RP registration's declared purpose (CIR Annex I Points 9-10) create a **legally binding purpose limitation** that is stricter than GDPR Art. 5(1)(b) for wallet-obtained data? If so, intra-group sharing of wallet data would always require separate wallet presentations — the data cannot be "repurposed" even for compatible purposes within the group.

**Open:** If a group entity receives wallet data and shares it intra-group, must the **erasure cascade** (GDPR Art. 17(2)) be tracked and enforced across all group entities that received copies? Who bears the compliance burden — the original receiving RP, the group DPO, or the intermediary?

---

## 13. Terminology

| Term | Definition |
|------|-----------|
| **Corporate group** (*concern*, *groep*) | An economic entity consisting of a parent company and its subsidiaries, forming a single economic unit under common control |
| **Parent / holding company** (*houdstermaatschappij*) | The entity at the top of the group structure that holds controlling interests in subsidiaries; may or may not conduct operational activities itself |
| **Subsidiary** (*dochtermaatschappij*) | A legal entity controlled by the parent company, with its own separate legal personality, registration, and (in regulated sectors) regulatory licenses |
| **Intermediary** (Art. 5b(10)) | An entity that acts on behalf of relying parties in EUDI Wallet interactions; deemed to be a relying party itself; prohibited from storing transaction content |
| **End-Relying Party** (ARF Topic 52) | The ultimate RP on whose behalf an intermediary interacts with a wallet; the entity whose name and intended use are presented to the wallet user |
| **RPAC** (RP Access Certificate) | Certificate issued to a registered RP (or intermediary), used for mutual authentication in OID4VP |
| **RPRC** (RP Registration Certificate) | Certificate binding a registration (intended use + data attributes) to a specific RP; held by the RP or its intermediary |
| **Absorption merger** | A corporate event where one entity merges into another, with the absorbed entity ceasing to exist and the absorbing entity becoming the universal successor to its rights and obligations |
| **Cross-border conversion** (Directive 2019/2121) | A transaction whereby a company changes its legal form and transfers its registered office to another Member State without dissolution; legal personality is maintained |
| **Sectoral passporting** | The regime under which a financial institution authorized in one MS can provide services in other MSs without separate authorization, under Directives such as CRD IV, PSD2, Solvency II, or MiFID II |
| **Data controller** (GDPR Art. 4(7)) | The natural or legal person which determines the purposes and means of the processing of personal data; in the wallet context, the registered RP is the controller for data obtained from wallet interactions |
| **Data processor** (GDPR Art. 4(8)) | The natural or legal person which processes personal data on behalf of the controller; in the wallet context, an intermediary acting under Art. 5b(10) maps to the processor role |

---

## 14. Source References

### Primary Sources

| Source | Link |
|--------|------|
| Consolidated Regulation (EU) No 910/2014, Art. 3(6), Art. 5b | [Portal](https://ivanstambuk.github.io/eIDAS20/#/regulation/2014-910) · [EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02014R0910-20241018) |
| CIR 2025/848 — Wallet Relying Party Registration | [Portal](https://ivanstambuk.github.io/eIDAS20/#/implementing-acts/2025-0848) · [EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32025R0848) |
| Directive (EU) 2017/1132 — Codified Company Law Directive | [EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017L1132) |
| CIR 2021/1042 — BRIS Technical Specifications (EUID) | [EUR-Lex](https://eur-lex.europa.eu/eli/reg_impl/2021/1042/oj) |\n| Directive (EU) 2019/2121 — Cross-Border Conversions, Mergers, and Divisions | [EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019L2121) |
| Vertical Block Exemption Regulation (EU) 2022/720 | [EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R0720) |\n| CJEU Case 161/84 *Pronuptia* (franchise agreements) | [EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:61984CJ0161) |

### Architecture & Technical Specifications

| Source | Link |
|--------|------|
| ARF Discussion Paper: Topic X (RP Registration) | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/discussion-topics/x-relying-party-registration.md) |
| ARF Annex 2, Topic 27 (Registration) — §A.2.3.16 | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2316-topic-27---registration-of-pid-providers-providers-of-qeaas-pub-eaas-and-non-qualified-eaas-and-relying-parties) |
| ARF Annex 2, Topic 44 (RP Registration Certificates) — §A.2.3.26 | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2326-topic-44---registration-certificates-for-pid-providers-providers-of-qeaas-pub-eaas-and-non-qualified-eaas-and-relying-parties) |
| ARF Annex 2, Topic 52 (RP Intermediaries) — §A.2.3.30 | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md#a2330-topic-52-relying-party-intermediaries) |
| TS5 — Common Formats and API for RP Registration Information | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts5-common-formats-and-api-for-rp-registration-information.md) |
| TS6 — Common Set of RP Information to be Registered | [GitHub](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/blob/main/docs/technical-specifications/ts6-common-set-of-rp-information-to-be-registered.md) |
| ETSI TS 119 475 — RP attributes supporting EUDI Wallet user authorisation | [GitHub Issue (draft)](https://github.com/eu-digital-identity-wallet/eudi-doc-standards-and-technical-specifications/issues/287) |

### EU Business Register References

| Source | Description |
|--------|-------------|
| [BRIS — Business Registers Interconnection System](https://e-justice.europa.eu/489/EN/business_registers__search_for_a_company_in_the_eu) | EU-wide search portal interconnecting national business registers |
| [KvK (Netherlands)](https://www.kvk.nl/english/) | Kamer van Koophandel — Dutch business register, supports multiple *handelsnamen* per entity |
| [Handelsregister (Germany)](https://www.handelsregister.de/) | German commercial register, managed by local courts |
| [RCS / Infogreffe (France)](https://www.infogreffe.fr/) | Registre du Commerce et des Sociétés — French company register |
| [KBO/BCE (Belgium)](https://kbopub.economie.fgov.be/) | Kruispuntbank van Ondernemingen — Belgian crossroads bank for enterprises |

### External Sources (Web Research — 2026-02-16, 2026-02-20)

| Source | Description |
|--------|-------------|
| [ARF GitHub Discussions](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/discussions) | Community discussions on RP registration, including subsidiary/parent company scenarios |
| [lissi.id — Intermediaries in eIDAS 2.0](https://lissi.id) | Analysis of the intermediary role as "trust bridge" for RP integration |
| [european-digital-identity-regulation.com](https://european-digital-identity-regulation.com) | Annotated eIDAS 2.0 regulation text with Article 5b analysis |
