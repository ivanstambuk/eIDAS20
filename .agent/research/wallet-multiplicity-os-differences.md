# Wallet Multiplicity & OS Differences

**Research Date:** 2026-02-17  
**Sources:** ARF v1.11.0, Regulation (EU) 2024/1183 (incl. Article 5a(14)–(16)), Consolidated Regulation (EU) No 910/2014, Implementing Regulation 2024/2979, Discussion Paper Topic F (Digital Credentials API), W3C Digital Credentials API Specification, Annex 5.02 Design Guide, EUDIW Reference Implementations, Web Research

---

## 1. Introduction & Scope

This document analyses how the EUDI Wallet ecosystem handles the scenario where **multiple wallet applications coexist on a single user device**. It traces the full chain from the legal framework, through ARF requirements, to platform-specific technical mechanisms on Android and iOS, and derives practical guidance for wallet providers, relying parties, intermediaries, and OS/browser vendors.

The central questions addressed are:

1. **Is wallet multiplicity allowed?** — What does the regulation say about multiple wallets per device?
2. **How are wallets selected?** — When an RP requests a credential, how does the system choose which wallet to invoke?
3. **What can third parties detect?** — Can an RP app or other party determine what wallets are installed, or what credentials they hold?
4. **Can wallet flows be auto-triggered?** — Can an RP invoke a wallet presentation without explicit user action?

The document proceeds top-down: **legal foundation → ARF requirements → technical architecture → privacy constraints → practical guidance**.

---

## 2. Legal Framework

### 2.1 Regulatory Basis — Article 5a(1)

> "Each Member State shall provide **at least one** European Digital Identity Wallet within 24 months..."

The "at least one" wording is per Member State, not per user. There is **no regulatory cap** on the number of wallets a user may install. The regulation is designed to ensure availability, not to limit user choice.

#### Market Competition Principle

The regulation explicitly envisions a multi-provider market. Multiple Member States and private-sector Wallet Providers can offer competing Wallet Solutions. A user in the Netherlands could conceivably install:
- The Dutch government wallet
- A German government wallet (if they have cross-border needs)
- A private-sector wallet (e.g., issued by a commercial provider)

All would coexist on the same device, each with its own PID, attestations, and cryptographic keys.

### 2.2 Privacy Foundation — Article 5a(16)

Article 5a(16) of Regulation (EU) 2024/1183 is the **single most important provision** governing how wallets, platforms, and third parties may interact with credential data. It shapes the entire technical architecture.

#### The Provision

Article 5a(16) of Regulation (EU) 2024/1183 (amending Regulation (EU) No 910/2014) states:

> **16.** The technical framework of the European Digital Identity Wallet shall:
>
> - (a) not allow providers of electronic attestations of attributes **or any other party**, after the issuance of the attestation of attributes, to obtain data that allows transactions or user behaviour to be **tracked, linked or correlated**, or knowledge of transactions or user behaviour to be **otherwise obtained**, unless explicitly authorised by the user;
>
> - (b) enable privacy preserving techniques which ensure **unlinkability**, where the attestation of attributes does not require the identification of the user.

This is a **hard legal obligation** on the technical framework itself — not merely a recommendation or design guideline. The regulation imposes this requirement on the Wallet's *architecture*, not just on individual actors.

#### Clause-by-Clause Analysis

##### "Not allow"

This is a prohibition on the **technical framework** — the system must be designed such that the forbidden outcomes are architecturally prevented, not merely contractually discouraged. A wallet implementation that *technically enables* tracking but *contractually prohibits* it would be non-compliant.

##### "Providers of electronic attestations of attributes"

The primary target: attestation issuers. Once they issue an attestation to the wallet, they must not be able to track how it is used. This is the anti-surveillance principle: the issuer should not learn when, where, or how often the attestation is presented.

##### "Or any other party"

**This is the critical extension.** The phrase "any other party" significantly broadens the scope beyond issuers. It covers:

| Party | Example scenario | Covered? |
|-------|-----------------|----------|
| Attestation provider (QTSP) | Monitors when an attestation is presented | ✅ Primary target |
| Relying Party (RP) native app | Probes for installed wallets via package names | ✅ "Any other party" |
| Browser vendor (Chrome, Safari) | Logs DC API requests to build usage profiles | ✅ "Any other party" |
| OS vendor (Google, Apple) | Uses matcher/registration data for ad targeting | ✅ "Any other party" |
| Intermediary (SaaS identity provider) | Correlates presentations across its RP customers | ✅ "Any other party" |
| Analytics SDK (e.g., Firebase) | Detects wallet presence as a fingerprinting signal | ✅ "Any other party" |
| Tunnel operator (CTAP hybrid) | Reads credential data flowing through the tunnel | ✅ "Any other party" |
| Another wallet on the same device | Cross-reads attestation data from a competing wallet | ✅ "Any other party" + WIAM_09 |

##### "After the issuance of the attestation of attributes"

The prohibition applies **from issuance onward** — covering the entire post-issuance lifecycle:
- **Storage** — No party should detect what attestations are stored
- **Discovery** — No party should enumerate available credential types (beyond what the OS minimally needs for matching)
- **Presentation** — No party should track when/where attestations are presented
- **Revocation/Deletion** — No party should monitor changes to the user's attestation inventory

##### "To obtain data that allows transactions or user behaviour to be tracked, linked or correlated"

Three specific prohibited outcomes:

1. **Tracked** — Following a user's credential usage over time (temporal tracking)
2. **Linked** — Connecting two separate transactions to the same user (cross-transaction linking)
3. **Correlated** — Building a profile by combining signals from multiple sources (pattern analysis)

Each of these is independently prohibited. A system that prevents tracking but enables correlation would still be non-compliant.

##### "Or knowledge of transactions or user behaviour to be otherwise obtained"

This is a **catch-all clause** — even if the data obtained doesn't neatly fit into "tracked, linked, or correlated," if it reveals *knowledge* about transactions or behaviour, it is still prohibited. This covers:

- Detecting which wallets are installed (reveals user choices = behaviour)
- Knowing which credential types a user holds (reveals post-issuance state)
- Observing presentation frequency (reveals usage patterns)
- Inferring sensitive attributes from attestation type names (e.g., `DisabilityCertificate`)

##### "Unless explicitly authorised by the user"

The only escape valve. Key observations:

- Authorisation must be **explicit** — not implied, not buried in terms of service
- Must come from **the user** — not from the wallet provider, not from the RP, not from the OS
- **Passive detection** (e.g., probing package names, checking URL scheme registration) inherently lacks user authorisation
- The OS-mediated credential selector **is** the authorisation mechanism — the user explicitly selects a credential and consents to sharing

##### Paragraph (b): Unlinkability

> "enable privacy preserving techniques which ensure unlinkability, where the attestation of attributes does not require the identification of the user."

This mandates **unlinkability** as a first-class architectural property. Where attestation presentation doesn't require full identification (e.g., age-over-18 checks), the technical framework must ensure that:
- Two presentations of the same attestation cannot be linked to each other
- The RP cannot correlate this presentation with a previous one from the same user
- No party in the chain (browser, OS, tunnel) can build a correlation graph

### 2.3 GDPR Reinforcement — Article 5a(14)

Article 5a(14) reinforces the privacy model with GDPR alignment:

> "Users shall have **full control** of the use of and of the data in their European Digital Identity Wallet. The provider of the European Digital Identity Wallet shall neither collect information about the use of the European Digital Identity Wallet which is not necessary for the provision of European Digital Identity Wallet services, nor combine person identification data or any other personal data stored or relating to the use of the European Digital Identity Wallet with personal data from any other services offered by that provider or from third-party services which are not necessary for the provision of European Digital Identity Wallet services, unless the user has expressly requested otherwise."

This establishes **purpose limitation** — even the wallet *provider* cannot collect unnecessary usage data, let alone a third-party RP app.

### 2.4 Voluntary Use — Article 5a(15) & Article 5f

Article 5a(15) establishes the foundational principle of voluntary wallet use:

> "The use of European Digital Identity Wallets **shall be voluntary**. Access to public and private services, access to the labour market and freedom to conduct business **shall not in any way be restricted or made disadvantageous** to natural or legal persons that do not use European Digital Identity Wallets. It shall remain possible to access public and private services by other existing identification and authentication means."

Article 5f reinforces this with operational specificity for Relying Parties:

> **Art. 5f(2):** "[Private RPs] shall [...] **only upon the voluntary request of the user**, also accept European Digital Identity Wallets [...]"
>
> **Art. 5f(3):** "[VLOPs] shall also accept [...] European Digital Identity Wallets [...] **only upon the voluntary request of the user** and in respect of the minimum data necessary [...]"

Recital (57) elaborates the intent:

> "Users should be **under no obligation** to use a European Digital Identity Wallet to access private services and **should not be restricted or hindered** in their access to services on the grounds that they do not use a European Digital Identity Wallet."

**Legal interpretation:** "Upon the voluntary request of the user" means the user must **affirmatively choose** to use the wallet. An auto-triggered flow — initiated by the app without the user clicking/tapping a "Verify with EUDI Wallet" button — would not constitute a "voluntary request." The user must be presented with a choice and must actively opt in.

### 2.5 Intermediary Prohibition — Article 5b(10)

> "Intermediaries acting on behalf of relying parties shall be deemed to be relying parties and shall not store data about the content of the transaction."

**The combination of 5a(16) + 5b(10)** creates a double prohibition: intermediaries can neither store transaction content nor use metadata for tracking/correlation.

---

## 3. ARF Requirements

The Architecture and Reference Framework translates the legal obligations from §2 into specific High-Level Requirements.

### 3.1 OIA_08b — Minimum Disclosure to DC API Framework

> "If a Wallet Unit supports the W3C Digital Credentials API, it SHALL, by default (see OIA_08d), disclose the presence of all stored attestations (meaning their **attestation type**) to the Digital Credentials API framework, but it SHALL NOT disclose the **presence of attributes** in these attestations, **nor their values**."

**Tension with Article 5a(16):** Even disclosing attestation *types* to the OS could violate Article 5a(16)(a) if those types reveal sensitive information (e.g., `DisabilityCertificate`, `ProfessionalLicense:Doctor`). Topic F §3.6 explicitly acknowledges this concern:

> "Member States have raised concerns that browsers and operating systems, when handling DC-API discovery/requests, could infer personal information by observing or registering attestation types and attribute names."

The ARF's resolution is pragmatic: the OS needs *some* data for matching to function, but this data must be minimised and protected. OIA_08c further restricts what the OS can *do* with this data.

### 3.2 OIA_08c — Purpose Limitation on OS/Browser Processing

> "The request SHALL NOT be processed by the browser and/or the Operating System for **market analysis purposes** (including as a secondary purpose) or for **the browser's and/or the Operating System's own purposes**."

This directly implements the "any other party" clause for OS vendors and browser vendors. Google and Apple may see attestation types during the matching process, but they are **legally prohibited** from using this data for commercial purposes.

### 3.3 OIA_08d — User Opt-Out

> "The Wallet Unit SHALL provide a global user setting to disable the disclosure of stored attestations via the Digital Credentials API framework."

This implements the "unless explicitly authorised by the user" clause *in reverse* — by giving users the right to withdraw disclosure entirely. A user who disables DC API disclosure becomes completely invisible to the OS-level matching system.

### 3.4 WIAM_09 — Cryptographic Isolation

> "If a WSCA/WSCD contains cryptographic assets related to multiple Wallet Units, the Wallet Provider SHALL ensure that a Wallet Unit can only access keys that are related to that Wallet Unit."

This prevents cross-wallet correlation at the cryptographic level — one wallet cannot detect or access another wallet's keys, even if they share the same secure element.

### 3.5 User Approval Requirements (RPA Family)

The ARF mandates explicit user approval at the wallet level before any attribute presentation:

> **RPA_07:** "A Wallet Unit **SHALL ensure the User approved** the presentation of any attribute(s) in the Wallet Unit to a Relying Party or Verifier Wallet Unit, **prior to presenting these attributes**. A Wallet Unit SHALL **always allow the User to refuse** presenting an attribute requested by the Relying Party."

This is supplemented by:

| HLR | Requirement |
|-----|-------------|
| **RPA_06** | Wallet SHALL display the RP's name and requested attributes to the User when asking for approval |
| **RPA_07a** | If using DC API, the wallet **SHALL retain full authority** over user approval — browser/OS SHALL NOT handle it |
| **RPA_08** | Wallet SHALL authenticate the User before allowing approval |
| **RPA_10** | Wallet SHALL show the RP's intended use and privacy policy when asking for approval |
| **RPA_10a** | User SHOULD approve either all requested attributes or none (no partial approval) |
| **RPA_11** | If user denies, wallet SHALL behave as if the attestation did not exist |

**Key observation:** Even if an RP auto-triggers a DC API request that reaches the wallet, the wallet *itself* must still ask for user approval (RPA_07). But this doesn't make auto-triggering acceptable — the RP should not invoke the flow without user intent, because the user must be the one to *initiate* the wallet interaction (Art. 5f "voluntary request"), not merely the one who *approves* it at the wallet level.

### 3.6 EU Digital Identity Wallet Trust Mark (Article 3(50), DASH_09)

The **EU Digital Identity Wallet Trust Mark** is the visible, recognisable indicator that a wallet is genuine and certified:

> **Article 3(50):** "'EU Digital Identity Wallet Trust Mark' means a **verifiable, simple and recognisable** indication which is communicated in a clear manner that a European Digital Identity Wallet has been provided in accordance with this Regulation."

> **Article 5a(5)(a)(iv):** European Digital Identity Wallets shall support common protocols and interfaces "[...] for the user to allow interaction with the European Digital Identity Wallet and display an EU Digital Identity Wallet Trust Mark."

The Trust Mark is required to be:
- **Displayed in the wallet's own UI** — via HLR DASH_09 (in the wallet dashboard, with certification status links)
- **Positioned consistently** — following European Commission design guidelines (DASH_09a)
- **Verifiable by the user on demand** — users can tap/click to see certification information hosted by the Commission

**Note:** The Trust Mark is a *wallet-side* indicator (displayed *inside* the wallet app), not an RP-side button. However, for the RP side, the practical implication is:

1. **The RP must present a visible, recognisable option** (e.g., a "Verify with EUDI Wallet" button) that the user can voluntarily choose to tap — this is how the "voluntary request" requirement is satisfied in practice.
2. **This button must not auto-trigger** — it must wait for user action.
3. **The wallet, when invoked, displays the Trust Mark** and certification information to reassure the user they are interacting with a genuine, certified wallet.

---

## 4. Wallet Multiplicity

### 4.1 Can a Single Device Host Multiple Wallets?

**Yes — explicitly allowed and architecturally supported.**

The ARF is unambiguous on this point:

> "A User device can host more than one Wallet Instance, either provided by **multiple Wallet Providers** or by **the same one**, if supported by that Wallet Provider. If a User device hosts multiple Wallet Instances, it is part of multiple Wallet Units. In such a case, all requirements in this ARF for a single Wallet Unit and its components apply to each one independently."
>
> — ARF §4.3.1, lines 1385–1389

#### Key Terminology Distinction

| Term | Definition | Relationship |
|------|-----------|--------------| 
| **Wallet Solution** | The complete system (software + hardware + services + configs) provided by a Wallet Provider | 1 Provider → 1 Solution |
| **Wallet Unit** | A unique configuration of a Wallet Solution for an individual user, including the wallet instance + WSCA/WSCD | 1 User → potentially N Units |
| **Wallet Instance** | The application installed on a user's device; the app they interact with | 1 Instance per Solution per Device |

**Important:** A device with 3 different wallet apps from 3 providers has 3 Wallet Instances and 3 Wallet Units. Each Wallet Unit is completely independent—its own cryptographic keys, its own attestations, its own Wallet Unit Attestation (WUA).

#### Cryptographic Isolation (WIAM_09)

When multiple Wallet Units share the same WSCA/WSCD (e.g., a shared SE or remote HSM):

> "If a WSCA/WSCD contains cryptographic assets related to multiple Wallet Units, the Wallet Provider **SHALL** ensure that a Wallet Unit can only access keys that are related to that Wallet Unit."
>
> — HLR WIAM_09 (Annex 2, Topic 40)

This is a hard security requirement—no cross-contamination of cryptographic material between Wallet Units.

### 4.2 How Does Wallet Selection Work?

#### The Problem

When a Relying Party requests a credential presentation (remote flow), how does the system know which wallet to invoke? The ARF identifies this as one of 5 key challenges for remote flows:

> "**Wallet Unit Selection**: In remote flows, where interactions do not originate from the Wallet Unit, Users may encounter difficulties in selecting the appropriate Wallet Unit to fulfil a specific presentation request, particularly when **multiple Wallet Units are present on the device**. A unified interface provided by the web browser and the device operating system can streamline this process."
>
> — ARF §4.4.3.1, challenge #2

#### The Solution: W3C Digital Credentials API

The ARF's preferred answer is the **W3C Digital Credentials API** (DC API), which acts as a browser/OS-mediated layer between the Relying Party and the wallet(s). This replaces ad-hoc mechanisms like custom URI schemes (`openid4vp://`, `mdoc://`) and universal/app links.

**How it works (same-device flow):**

```
Relying Party Website
       ↓ navigator.identity.get() via DC API
Browser (Chrome/Safari/Edge)
       ↓ Wallet Instance-platform API
Device OS (Android/iOS)
       ↓ Scans installed wallets for matching attestations
Wallet Selector UI (OS-level)
       ↓ User picks a wallet/credential
Selected Wallet Instance
       ↓ Processes request, asks user consent
Encrypted response → Browser → Relying Party
```

**Key property:** The Wallet Instance sees no difference between same-device and cross-device flows. In both cases, it receives an OpenID4VP-compliant request over the Wallet Instance-platform API (ARF §4.4.3.3, line 1832).

#### Current DC API Status (as of Oct 2025)

| Feature | Chrome | Safari | Edge | Firefox |
|---------|--------|--------|------|---------|
| **Presentation (Android)** | ✅ Supported | — | WIP | — |
| **Presentation (iOS)** | ✅ Supported | ✅ Supported | ✅ Supported | ✅ Supported |
| **Presentation (Windows)** | ✅ Supported | — | — | — |
| **Presentation (macOS)** | ✅ Supported | — | ✅ Supported | — |
| **Issuance** | WIP (all platforms) | — | WIP | — |

*(Source: Discussion Paper Topic F, §6, Table I)*

#### The DC API is Currently *Optional*

> "The use of this API by Wallet Units and Relying Parties is **optional**, and custom URL schemes may be used as well. If a Wallet Unit implements a custom URL scheme, it will need to implement mitigations for the challenges described in this section."
>
> — ARF §4.4.3.1, lines 1683–1687

However, the direction of travel is clear—the ARF intends to make DC API support mandatory once the W3C spec reaches Recommendation status and meets the EUDI Wallet's principles (functionality, neutrality, privacy, governance).

**Updated HLR OIA_08** (from Topic F):
> Wallet Units and Relying Party Instances **SHALL** support the DC API [...] provided that: a) this API is a W3C recommendation, b) this API complies with the expectations outlined in Chapter 3 of the Topic F discussion paper, and c) this API is broadly supported by relevant browsers and operating systems.

### 4.3 What Happens When Multiple Wallets Register the Same Attestation Type?

This is not just possible — it's the **expected default scenario**. Every PID-issuing wallet will register the same attestation type (e.g., `eu.europa.ec.eudi.pid.1`). If a user has two wallets from two different Member States, both will register PID support. The question is: how does the OS differentiate?

#### The Selector Shows *Credentials*, Not *Wallets*

The key insight from Topic F §2.2 is:

> "If more than one matching attestation is found, the browser prompts the User to select one."
>
> — Topic F §2.2, line 197–198

The selector is **attestation-centric** (credential-centric), not wallet-centric. Each matching credential appears as a separate entry, even if they come from different wallets.

#### Android: Matcher-Generated Display Metadata

On Android, each wallet provides a **matcher** binary that runs in a sandboxed environment. When a request arrives:

1. Android runs the matcher from **every** installed wallet
2. Each matcher inspects the request and its own credential store
3. Each matcher outputs **display metadata** entries for each matching credential
4. Android aggregates all entries into a **unified bottom-sheet selector**

The display metadata typically includes:
- Credential name/label (e.g., "Dutch National ID", "German Personalausweis")
- Wallet app name and icon
- Provider information

So if two wallets both hold a PID, the user sees **two entries** — each labelled with its wallet's branding and the credential's display name. The user picks one, and Android routes to that specific wallet.

**Critical:** The matcher generates this display metadata — it is **wallet-controlled**, not OS-controlled. The OS just renders it. This means the wallet provider decides how their credential appears in the selector.

#### iOS: Document Type Registration

On iOS, wallets register supported document types (e.g., `org.iso.18013.5.1.mDL`) via `IdentityDocumentProviderRegistrationStore`. When a request comes in:

1. iOS scans all registered document providers for matching types
2. If multiple providers support the same type, the system presents all matches
3. User picks one → iOS routes to that provider

The registration includes enough metadata for the system to display the provider name and document type.

#### What the ARF Says About This

The ARF explicitly confirms this multi-wallet scenario:

> "If the device hosts multiple Wallet Units, the browser and OS will determine which Wallet Unit is to be used."
>
> — ARF §4.4.3.2, line 1773

And in the cross-device flow:

> "If there are multiple Wallet Instances present on the User device, the device OS will determine to which of these the request will be forwarded, **possibly after consulting the User.**"
>
> — ARF §4.4.3.3, line 1827

The "consulting the User" is the selector UI. The OS always asks the user when there's ambiguity.

#### What the Selector Does NOT Show

Per HLR **OIA_08b** (see §3.1), the OS selector:
- ✅ Shows attestation **types** (e.g., "PID", "mDL")
- ✅ Shows wallet **name/icon** (from matcher display metadata or provider registration)
- ❌ Does NOT show attribute **names** (e.g., "given_name", "birth_date")
- ❌ Does NOT show attribute **values** (e.g., "Jan", "1990-01-15")

> "If a Wallet Unit supports the [W3C Digital Credentials API], it SHALL, by default (see OIA_08d), disclose the presence of all stored attestations (meaning their **attestation type**) to the Digital Credentials API framework, but it SHALL NOT disclose the **presence of attributes** in these attestations, **nor their values**. Note: The latter restriction applies **even if such disclosure would enhance the services provided by the operating system** to the Wallet Unit, for example, attestation selection in the context of the Digital Credentials API."
>
> — HLR OIA_08b (Topic F §5.2)

This last sentence is striking — it means the OS **cannot** show a richer selector (like "PID from Dutch government, issued Jan 2025, expires Jan 2030") even if that would be a better UX. The privacy constraint wins over usability.

#### Summary: The Duplicate-Type Scenario

| Scenario | What happens |
|----------|-------------|
| 1 wallet, 1 matching credential | OS routes directly to that wallet (may skip selector) |
| 1 wallet, 2 matching credentials (e.g., 2 mDLs) | Selector shows 2 entries, both from same wallet |
| 2 wallets, each with 1 matching credential | Selector shows 2 entries, each with wallet branding |
| 2 wallets, 3 matching credentials total | Selector shows 3 entries with wallet + credential metadata |
| 0 wallets or 0 matching credentials | `NoCredentialException` (Android) or no selector shown (iOS) |

---

## 5. Technical Architecture: Platform Mechanisms

### 5.1 Android — CredentialManager + Matcher Architecture

**Registration:**
- Wallet apps register their credential metadata with Android's `CredentialManager` Jetpack API
- Each wallet provides a **"matcher"** — a sandboxed binary that processes the wallet's internal data and generates display metadata in response to a DC API request
- Android provides a sample matcher for OpenID4VP; custom matchers can also be used
- More developer-friendly default matchers and helper classes expected via Jetpack by late 2025

**Selection Flow:**
1. Relying Party sends OpenID4VP request via `navigator.identity.get()`
2. Chrome forwards to Android OS
3. Android runs matchers from all installed wallet apps in sandboxed environment
4. Results aggregated into a **unified credential selector UI** (OS-level)
5. User picks credential → Android redirects to the corresponding wallet app
6. Wallet processes request, returns encrypted response

**Privacy constraint:** The matcher mechanism is designed so the OS only sees attestation *types*, not attribute *values*. This aligns with HLR OIA_08b (see §3.1):
> A Wallet Unit SHALL, by default, disclose the presence of all stored attestations (meaning their **attestation type**) to the DC API framework, but it SHALL NOT disclose the **presence of attributes** in these attestations, **nor their values**.

**Platform-level privacy enforcement:**
- `CredentialManager` API mediates all credential interactions — third-party apps never directly communicate with wallets
- Matchers run in sandboxed environments — the OS receives only display metadata, not raw credential data
- `prepareGetCredential()` provides binary yes/no only — no enumeration of wallets or types
- Android 11+ `<queries>` restrictions prevent package enumeration

### 5.2 iOS — IdentityDocumentServices Framework

**Registration:**
- Wallet apps use Apple's `IdentityDocumentServices` framework (introduced with iOS 26 / WWDC 2025)
- Apps register as identity document providers via `IdentityDocumentProviderRegistrationStore`
- Registration specifies `mobileDocumentType` (e.g., `"org.iso.18013.5.1.mDL"`)
- Both Apple Wallet and third-party apps can serve as document providers

**Selection Flow:**
1. Relying Party sends request via `navigator.identity.get()`
2. Safari (or other browser) forwards to iOS
3. iOS scans registered document providers for matching credential types
4. System presents credential selector to user
5. User picks credential → iOS routes to the specific wallet app
6. Wallet processes request, returns encrypted response

**Key difference:** Apple's DC API implementation currently supports only the `org-iso-mdoc` protocol (ISO/IEC 18013-7 Annex C), while Chrome/Android is protocol-agnostic (supports OpenID4VP and others). The ARF's HLR OIA_08 requires protocol support as mandated by the Implementing Acts, which means Apple will need to expand support.

**Platform-level privacy enforcement:**
- `IdentityDocumentServices` acts as the single mediation layer
- No pre-check API exists for third-party apps
- `canOpenURL()` is limited to 50 declared schemes and is architecturally discouraged for credential discovery
- Wallet registrations via `IdentityDocumentProviderRegistrationStore` are only visible to the system

### 5.3 Comparison Summary

| Aspect | Android | iOS |
|--------|---------|-----|
| **API** | CredentialManager (Jetpack) | IdentityDocumentServices |
| **Matcher** | Wallet-provided custom matcher binary (sandboxed) | OS-managed via registered document types |
| **Protocol support** | Protocol-agnostic (OpenID4VP, mdoc, etc.) | Currently mdoc only (ISO 18013-7 Annex C) |
| **Third-party wallets** | Fully supported via CredentialManager | Supported via IdentityDocumentProviderRegistrationStore |
| **Attestation type disclosure** | Matcher exposes types, not values | Registration exposes document types, not values |
| **Cross-device** | CTAP 2.2 hybrid (via BLE + tunnel) | CTAP-based (similar mechanism) |
| **Tunnel endpoints** | `cable.ua5v.com` (Google), `cable.auth.com` (Apple) | `cable.auth.com` (Apple) |

### 5.4 W3C DC API — Browser-Layer Privacy

The W3C Digital Credentials API specification itself enforces additional browser-layer privacy (complementing the platform mechanisms in §5.1–§5.2):

> "User agents MUST NOT allow a website to determine whether a digital credential is available before the user consents to share one."
>
> "User agents MUST NOT allow a website to determine which digital credential protocols are supported."

This prevents:
- Protocol-based fingerprinting (detecting whether a device supports mdoc vs. OpenID4VP)
- Credential-availability probing (testing whether any credential type is present)
- Timing attacks (using response latency to infer credential presence)

The DC API also enforces a **transient activation requirement** — see §7.3 for details on how this prevents auto-triggering.

### 5.5 Legacy Invocation (Custom URI Schemes & Deep Links)

#### How It Works Today

Before DC API, the standard approach was:

1. **Custom URI schemes** (e.g., `openid4vp://authorize?...`, `mdoc://...`)
   - RP redirects to custom scheme → OS opens registered app
   - Problem: any app can register the same scheme → hijacking risk
   - Problem: no standardized way to handle multiple wallets

2. **Universal Links (iOS) / App Links (Android)**
   - Domain-bound: `https://wallet.example.com/authorize?...`
   - Requires domain ownership verification (`.well-known/apple-app-site-association` or `.well-known/assetlinks.json`)
   - More secure, but each wallet needs its own domain → RP must know which wallet to target

3. **Deep links in same-device flows** (from Annex 5.02 Design Guide):
   > "When sharing data on the same device as the wallet app, users can simply click on a deep link provided by the third-party service, such as 'Log in via EUDI Wallet.' This action will instantly launch the EUDI Wallet app and present the authorization screen."

#### Why DC API Is Better

The ARF explicitly calls out the problems with custom schemes:

> "Relying on custom URI schemes or universal links introduces **variability in User experiences across different browsers and operating systems**, resulting in operational inefficiencies and **potential security risks**. An interface provided by the web browser and the device OS does not need custom URL schemes or universal links for invoking a Wallet Unit."
>
> — ARF §4.4.3.1, challenge #3

Specific advantages of DC API over custom schemes:
- **No scheme hijacking** — browser mediates, not open URL dispatch
- **Origin verification** — wallet receives authenticated website origin from user agent
- **Session binding** — prevents session hijacking across context switches
- **Unified selection UI** — OS presents all matching wallets, not just the one registered for the scheme
- **Cross-device proximity check** — CTAP hybrid flow prevents remote phishing

#### If You Must Use Custom Schemes (Fallback)

The ARF and Topic F FAQ provide clear guidance (FAQ entry T):
> "Use Universal Links (iOS) / App Links (Android) with domain verification, keep secrets out of URLs, and follow OAuth for Native Apps (RFC 8252): prefer the system browser (external user agent) and apply Security Considerations included in OpenID4VP or OID4VCI (e.g., FAPI2) depending on the scenario."

### 5.6 Cross-Device Flow (Phone-to-Desktop)

#### How It Works

1. User visits RP website on desktop browser
2. Browser invokes DC API → displays QR code
3. QR code contains tunnel endpoint info + crypto keys
4. User scans QR with phone camera
5. Phone emits BLE advertisement (proximity check!)
6. Secure tunnel established via CTAP 2.2 hybrid flow
7. Presentation request sent through tunnel to phone OS
8. Phone OS presents wallet/credential selector
9. User picks credential, consents in wallet app
10. Encrypted response flows back through tunnel → browser → RP

**Critical security property:** The BLE advertisement acts as a **proximity check** — the desktop and phone must be physically close. This prevents remote phishing attacks where an attacker tries to relay the QR code to a victim's phone.

**Tunnel privacy:** The CTAP hybrid tunnel is end-to-end encrypted (Noise-based handshake with P-256, SHA-256, AES-GCM). The tunnel operator cannot read CTAP contents. The credential response is *additionally* encrypted end-to-end for the RP (JWE/HPKE), so neither the tunnel nor the browser can read the attributes.

#### EU Sovereignty Concern

The ARF raises a concern about tunnel endpoints being controlled by US tech companies:

> "The CTAP Hybrid flow specification **should** be extended to support tunnel endpoints that are **regulated under EU legislation** and supervised by EU authorities. Such endpoints SHALL be supported by corresponding browsers and operating systems."
>
> — ARF §4.4.3.1, CTAP requirements

Currently, only Google and Apple operate tunnel endpoints (`cable.ua5v.com` and `cable.auth.com`). The EU wants the ability to run sovereign endpoints.

---

## 6. Privacy & Detection Constraints

This section synthesises the legal framework (§2) and technical architecture (§5) into concrete detection constraints for third-party applications.

### 6.1 The Detection Matrix

The three-layer privacy protection model (Regulatory → ARF HLRs → Platform Architecture, see §2.2, §3.1–§3.4, §5.1–§5.4) produces the following detection capabilities for third-party RP apps:

| What can a third-party RP app detect? | Android | iOS | Regulatory basis |
|---|---|---|---|
| "Is *any* wallet installed?" | ⚠️ Binary yes/no via `prepareGetCredential()` | ❌ Not possible | ⚠️ Arguable — doesn't reveal attestation data directly (see §6.4.2) |
| "How many wallets are installed?" | ❌ Not exposed | ❌ Not exposed | ❌ Art. 5a(16)(a) — reveals user behaviour |
| "Which wallet apps (names/packages)?" | ❌ Not exposed | ❌ Not exposed | ❌ Art. 5a(16)(a) — enables tracking/correlation |
| "What attestation types are stored?" | ❌ Only OS sees this | ❌ Only OS sees this | ❌ Art. 5a(16)(a) — reveals post-issuance state |
| "What attributes exist in those attestations?" | ❌ Even OS cannot see | ❌ Even OS cannot see | ❌ Art. 5a(16)(a) + OIA_08b (see §3.1) |
| "What are the attribute values?" | ❌ Never disclosed to any party | ❌ Never disclosed to any party | ❌ Art. 5a(16)(a) + OIA_08b |
| "Has this user used a credential at another RP?" | ❌ Unlinkable by design | ❌ Unlinkable by design | ❌ Art. 5a(16)(a) + Art. 5a(16)(b) |
| "Is credential X from the same user as credential Y?" | ❌ Unlinkable | ❌ Unlinkable | ❌ Art. 5a(16)(b) — unlinkability requirement |

### 6.2 Can a Third-Party Native App Detect Wallet Availability?

#### The Use Case

An RP native app wants to do KYC of a natural person. It wants to know:
1. Is there *any* EUDI wallet installed on this device?
2. How many wallets are installed?
3. Which credential types do they support (e.g., does the wallet hold a PID)?

The goal is **conditional rendering** — e.g., showing a "Verify with EUDI Wallet" button only if a wallet exists, or showing specific credential-type options.

#### ❌ The Short Answer: No Direct Enumeration

**A third-party native app cannot enumerate installed wallets, count them, or query their supported credential types.** The architecture is deliberately designed to prevent this for privacy reasons.

The entire flow is **OS-mediated**. The ARF explicitly describes the inter-app flow for native apps:

> "An application on the User's device, such as a **banking** or shopping app, interacts with the Wallet Unit over the **Wallet Instance-platform API**. [...] this is the **same API** used in remote same-device presentation flow involving a browser."
>
> — ARF §4.4.3.2, lines 1778–1793

This means an RP native app uses the **exact same OS-mediated API** as a browser would — it calls the platform credential API, and the **OS** handles wallet discovery, matching, and selection. The app never directly sees the wallets.

#### Why This Is Intentionally Restricted

**Privacy concern (from Topic F, §3.6):**

> "Member States have raised concerns that browsers and operating systems, when handling DC-API discovery/requests, could infer personal information by observing or registering attestation types and attribute names (e.g., a 'DisabilityCertificate', 'ProfessionalLicense:Doctor', or 'AgeOver18'). Even without disclosing values, these signals can enable **profiling**, or **cross-service tracking** by the platform."

If a third-party app could enumerate installed wallets and their credential types, it could:
- Fingerprint users based on which wallets they have
- Infer sensitive information from credential types (e.g., if someone has a DisabilityCertificate)
- Build profiles across app sessions

#### What a Third-Party App *Can* Do

##### Android: `CredentialManager.prepareGetCredential()`

Android's `CredentialManager` offers a **limited pre-check** mechanism:

1. Call `prepareGetCredential()` — this does **not** show any UI
2. Set `preferImmediatelyAvailableCredentials = true`
3. If credentials matching your request exist → returns a `PrepareGetCredentialResponse`
4. If no matching credentials exist → throws `NoCredentialException`

**What this tells you:**
- ✅ Whether *any* credential matching your request type exists (binary yes/no)
- ❌ Does NOT tell you how many wallets are installed
- ❌ Does NOT tell you which wallets they are (no package names, no branding)
- ❌ Does NOT tell you which specific credential types are available beyond your request

**Practical implication:** An RP native app can call `prepareGetCredential()` with an OpenID4VP request for PID attributes. If no exception is thrown, it knows *some* wallet *somewhere* can potentially fulfill the request, and can conditionally render a "Verify with EUDI Wallet" button.

##### iOS: No Pre-Check API (as of iOS 26)

Apple's `IdentityDocumentServices` framework does **not** expose an equivalent pre-check mechanism to third-party apps. The framework is designed for:
- **Wallet providers** to register their document types (via `IdentityDocumentProviderRegistrationStore`)
- **Relying parties** to trigger the OS-mediated request flow

An iOS RP native app can only:
1. Trigger the DC API request (via the platform API)
2. See what happens — either the OS shows a credential selector, or it doesn't

**No way to conditionally render** based on wallet availability without actually triggering the OS flow.

##### Legacy Approach: Package/URL Scheme Detection

On both platforms, there are legacy mechanisms that could theoretically detect specific wallet apps:

| Mechanism | Android | iOS |
|-----------|---------|-----|
| **Package query** | `PackageManager` with `<queries>` in manifest | Not possible (no package enumeration) |
| **URL scheme check** | `resolveActivity()` for `openid4vp://` | `canOpenURL()` for declared schemes |
| **Universal/App Link** | `queryIntentActivities()` for wallet domain | Not queryable client-side |

**Problems with this approach:**
- Requires knowing the specific wallet app package name or URL scheme a priori
- Android 11+ restricts package visibility — must declare each package in `<queries>`
- No way to discover *unknown* wallets
- iOS `canOpenURL()` requires declaring schemes in `LSApplicationQueriesSchemes` (limited to 50)
- Custom URI scheme detection is exactly the kind of fingerprinting the DC API is designed to prevent

### 6.3 The Architectural Principle

The EUDI Wallet ecosystem follows a clear separation:

```
┌─────────────────────────────────────────────────┐
│  Third-Party Native App (RP Instance)            │
│                                                 │
│  Can: "I need a PID with these attributes"      │
│  Cannot: "Tell me what wallets and credentials  │
│           exist on this device"                  │
├─────────────────────────────────────────────────┤
│  OS Platform API (CredentialManager / DC API)    │
│                                                 │
│  Knows: Which wallets are installed              │
│  Knows: Which credential types they registered   │
│  Does: Matching, selection UI, routing            │
│  Does NOT: Expose this info to the RP app        │
├─────────────────────────────────────────────────┤
│  Wallet App(s)                                   │
│                                                 │
│  Registers: Credential types with OS              │
│  Does: Authentication, consent, crypto, response  │
└─────────────────────────────────────────────────┘
```

**The RP native app operates on a "fire and hope" model:**
1. It fires a credential request into the platform API
2. Platform handles everything (discovery, selection, routing)
3. RP app gets back either a credential response or an error/cancellation

The only pre-check available is Android's `prepareGetCredential()` with `preferImmediatelyAvailableCredentials`, which gives a binary "something exists" / "nothing exists" answer.

### 6.4 Open Questions and Tensions

#### 6.4.1 Attestation Types as Sensitive Data

The current architecture requires wallets to disclose attestation *types* to the OS for matching. However, some types are inherently sensitive:

- `disability.certificate.eu` — reveals a disability
- `professional.license.doctor.eu` — reveals a profession
- `residence.permit.eu` — reveals immigration status

The ARF acknowledges this tension (Topic F §3.6) but does not fully resolve it. Possible mitigations include:
- Generic type categories (e.g., `generic.attestation` instead of specific types)
- Encrypted matching protocols (where the OS can check compatibility without seeing the type)
- User-controlled type disclosure (choose which types to register with the OS)

OIA_08d's opt-out setting (§3.3) partially addresses this — a user can disable all type disclosure — but this also disables the OS-mediated discovery that makes the DC API work.

#### 6.4.2 Binary Detection on Android

Android's `prepareGetCredential()` reveals a binary "something exists" signal. Whether this violates Article 5a(16)(a) is arguable:
- **Argument for compliance:** The binary signal doesn't reveal which attestation types exist, how many wallets are installed, or any attribute data
- **Argument against compliance:** The signal reveals that the user has *some* wallet with *some* matching credential — this is "knowledge of user behaviour" that is "otherwise obtained"

The current consensus appears to be that this minimal signal is acceptable under the principle of proportionality, especially since the alternative (no pre-check) creates worse UX.

#### 6.4.3 Metadata Leakage Through Timing

Even without direct enumeration, timing analysis could theoretically reveal information:
- The delay between `getCredential()` call and selector appearance could indicate how many matchers are running
- Response latency after user selection could fingerprint specific wallet implementations

Neither the ARF nor the DC API specification explicitly address timing-based side channels, though the general prohibition in Article 5a(16)(a) would cover them under "otherwise obtained."

---

## 7. The Auto-Triggering Prohibition

A distinct but related question from detection: **can an RP native app (or website) auto-trigger a wallet credential flow** without explicit user action? For example, can a banking app detect that a wallet is available and automatically launch the presentation request on page load?

**The answer is a clear no,** enforced at four independent levels:

### 7.1 Level 1: Regulatory — "Upon the voluntary request of the user"

The legal basis is established in §2.4. Article 5a(15) mandates voluntary use, and Article 5f(2)–(3) requires "only upon the voluntary request of the user" for private RPs and VLOPs. An auto-triggered flow — initiated by the app without the user clicking/tapping a "Verify with EUDI Wallet" button — would not constitute a "voluntary request."

### 7.2 Level 2: ARF — User Approval Requirements

The ARF HLRs are detailed in §3.5. RPA_07 mandates that the wallet SHALL ensure user approval prior to presenting any attributes, and RPA_07a ensures the wallet (not the browser/OS) retains authority over this approval. However, user approval at the wallet level does not make auto-triggering acceptable — the user must *initiate* the flow, not merely *approve* it.

### 7.3 Level 3: W3C DC API — Transient Activation Requirement

The W3C Digital Credentials API specification technically prevents auto-triggering at the browser level:

> **Step 4** of `[[DiscoverFromExternalSource]]`: "If |window| does not have **[transient activation]**, throw `NotAllowedError` `DOMException`."
>
> **Step 5**: "**[Consume user activation]** of |window|."

**What this means:**
- `navigator.identity.get()` (the DC API call) **requires transient activation** — i.e., it must be called in response to a user gesture (click, tap, keyboard event)
- A call on page load, in a timer, or from a background script will **throw `NotAllowedError`**
- The activation is **consumed** — one user gesture allows one DC API call; the RP cannot batch multiple requests from a single click

This is the same pattern used by browser APIs for popups, fullscreen, and payment requests. It is a **browser-enforced technical control** that prevents auto-triggering regardless of whether the RP intends it or not.

**For native apps:** The equivalent constraint is enforced architecturally — `CredentialManager.getCredential()` on Android and the `IdentityDocumentServices` flow on iOS both show system UI that requires user interaction. An app can *call* the API programmatically, but the system will display a selector/consent dialog that the user must interact with. However, the voluntary-use principle means the RP should not even invoke this without the user explicitly choosing the EUDI Wallet option.

### 7.4 Level 4: EU Digital Identity Wallet Trust Mark

The Trust Mark (detailed in §3.6) creates a UX expectation: the RP must present a visible, recognisable option that the user can voluntarily choose to tap. This button must not auto-trigger — it must wait for user action.

### 7.5 Summary: Four-Level Anti-Auto-Trigger Protection

| Level | Source | What it prevents |
|-------|--------|-----------------|
| **Regulatory** | Art. 5a(15), Art. 5f(2)–(3) | RP cannot invoke wallet without "voluntary request of the user" |
| **ARF HLRs** | RPA_07, RPA_07a, RPA_08 | Wallet MUST obtain User approval before presenting any attributes |
| **W3C DC API** | `transient activation` requirement | Browser blocks `navigator.identity.get()` without user gesture |
| **Platform UX** | CredentialManager / IdentityDocumentServices | System UI requires interactive user selection |

---

## 8. Practical Guidance

This section consolidates actionable guidance for all actors, derived from the legal framework (§2), ARF requirements (§3), and technical constraints (§5–§7).

### 8.1 For Wallet Providers

1. **DC API integration** (when it becomes mandatory):
   - Android: Implement a CredentialManager matcher
   - iOS: Register document types via IdentityDocumentProviderRegistrationStore

2. **Attestation type disclosure** (HLR OIA_08b, §3.1):
   - Expose stored attestation types to the OS
   - Do NOT expose attribute names or values

3. **User setting to disable DC API** (HLR OIA_08d, §3.3):
   - Provide a global toggle to opt out of DC API discovery
   - When disabled, wallet must not respond to DC API requests

4. **Cleanup on deletion** (HLR PAD_05):
   - When a user deletes a PID/attestation, inform the DC API framework
   
5. **Cleanup on uninstall** (HLR WIAM_13a):
   - When uninstalled, disclose to DC API that all previously disclosed PIDs/attestations are gone

6. **Cryptographic isolation** (HLR WIAM_09, §3.4):
   - If sharing WSCA/WSCD with other Wallet Units, enforce strict key separation

### 8.2 For RP Developers

#### Detection Rules

1. **Do not attempt client-side wallet detection.** It is legally prohibited (Art. 5a(16)(a), see §2.2), technically infeasible (OS-mediated APIs, see §5.1–§5.2), and architecturally discouraged (DC API privacy model).

2. **Always show the "Verify with EUDI Wallet" option.** Rely on the OS to handle the case where no wallet is installed (graceful failure). This is the privacy-preserving default.

3. **On Android, `prepareGetCredential()` is the only permitted pre-check.** Use it to suppress the button only when no credentials match your specific request type. Do not interpret the result as general wallet detection.

4. **On iOS, no pre-check exists.** Show the option unconditionally. Handle the "no wallet" case with a user-friendly error message or redirect to wallet acquisition.

5. **Never probe package names, URL schemes, or deep links** to infer wallet availability. This constitutes an attempt to obtain data about user behaviour (Art. 5a(16)(a)) and creates a fingerprinting vector that the DC API was specifically designed to eliminate.

#### Auto-Triggering Rules

6. **Always render a clearly labelled "Verify with EUDI Wallet" button** (or equivalent). Bind the DC API call / `CredentialManager.getCredential()` to that button's click/tap handler. Never call it on page load, on timer, or from a background process.

7. **The user must initiate the wallet flow** — Art. 5f requires "voluntary request of the user" (see §7).

### 8.3 For Intermediaries (SaaS Identity Providers)

1. **Cannot correlate presentations across RPs** — Article 5a(16)(a) explicitly prohibits this (see §2.2)
2. **Cannot store transaction content** — Article 5b(10) independently prohibits data storage (see §2.5)
3. **The combination of 5a(16) + 5b(10)** creates a double prohibition: intermediaries can neither store transaction content nor use metadata for tracking/correlation

### 8.4 For OS/Browser Vendors

1. **May process DC API data for matching, fraud prevention, and troubleshooting** — OIA_08c permits this (§3.2)
2. **MUST NOT use DC API data for market analysis or own commercial purposes** — OIA_08c prohibits this (§3.2)
3. **Must support sovereign CTAP tunnel endpoints** — Topic F §4 requires this for EU regulatory compliance (§5.6)

---

## 9. EU Reference Implementation Confirmation

Cross-checking the EU reference wallets ([`eudi-app-android-wallet-ui`](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui), [`eudi-app-ios-wallet-ui`](https://github.com/eu-digital-identity-wallet/eudi-app-ios-wallet-ui)) and their underlying libraries confirms the analysis above.

### Android (`eudi-lib-android-wallet-core`)

The wallet-core library supports **four invocation mechanisms**, in order of maturity:

| # | Mechanism | Intent Filter / Scheme | Status |
|---|-----------|----------------------|--------|
| 1 | BLE proximity (QR / NFC engagement) | ISO 18013-5 | ✅ Implemented |
| 2 | REST API via app link | `mdoc://` | ✅ Implemented |
| 3 | OpenID4VP via custom scheme | `mdoc-openid4vp://`, `openid4vp://`, `eudi-openid4vp://` | ✅ Implemented |
| 4 | **W3C Digital Credentials API** | `CredentialManager` + matcher | ⚠️ Implemented but **disabled by default** |

**DC API on Android:** The wallet-core library includes DC API support following `org-iso-mdoc` protocol (ISO/IEC TS 18013-7:2025 Annex C). To enable it, an app must:
1. Register an Intent for the `CredentialManager`
2. Configure `EudiWalletConfig` to enable DC API
3. Provide a **matcher** binary (a sample matcher is included, configurable with attestation types and attributes)

The matcher is the key component for the duplicate-type scenario — each wallet instance would provide its own matcher, and Android would aggregate all results from all wallet matchers into a single credential selector.

**What confirms multi-wallet handling:** The reference implementation uses custom URI schemes (`mdoc-openid4vp://`) with `launchMode="singleTask"`. Multiple wallets can register the same scheme — Android's intent resolution system would show an app chooser. With DC API enabled, the `CredentialManager` replaces this with the more structured matcher-based selector described in §4.3.

### iOS (`av-lib-ios-w3c-dc-api`)

The iOS DC API support is provided via a **separate library** (`av-lib-ios-w3c-dc-api`, titled `DcApi18013AnnexC`), which:

1. Requires adding an **"Identity Document Provider" extension target** to the wallet app
2. Uses `IdentityDocumentProviderRegistrationStore` to register supported document types
3. Implements `IdentityDocumentProvider` with a `ISO18013MobileDocumentRequestScene`
4. Handles request validation, user consent UI, and encrypted response generation

**What confirms multi-wallet handling:** Each wallet app registers as a separate Identity Document Provider. If two wallet apps both register the same document type (e.g., `org.iso.18013.5.1.mDL`), iOS will present both as options in the system credential selector. The `DcApiHandler.validateRequest()` method parses the incoming request and generates the display data for the wallet's own UI — each wallet handles its own consent screen independently.

**Key observation:** The iOS library currently supports **only** the `org-iso-mdoc` protocol (ISO 18013-7 Annex C). OpenID4VP over DC API is not yet supported on iOS in the reference implementation, unlike Android which is protocol-agnostic.

### Reference Implementation Gaps

| Feature | Android | iOS |
|---------|---------|-----|
| DC API integration | ✅ In wallet-core (disabled by default) | ✅ Separate library (`av-lib-ios-w3c-dc-api`) |
| Multiple protocol support | ✅ Protocol-agnostic | ❌ ISO 18013-7 Annex C only |
| Matcher / type registration | ✅ Sandboxed matcher binary | ✅ `IdentityDocumentProviderRegistrationStore` |
| Custom URI scheme fallback | ✅ `mdoc-openid4vp://` | ✅ Deep links via OpenID4VP lib |
| Multi-wallet selector | ✅ Via `CredentialManager` (when DC API enabled) | ✅ Via iOS system credential selector |
| Intermediary dual-party display (AS-RP-51-008) | ❌ Not implemented | ❌ Not implemented |

### Confirmation Summary

The reference implementations **confirm the architectural model** described in this document:

1. **Wallet invocation is OS-mediated** — both platforms use platform APIs (`CredentialManager` / `IdentityDocumentServices`) rather than direct app-to-app communication
2. **Multiple wallets with the same credential type** result in a system-level selector, not app-level enumeration
3. **Third-party RP apps** interact via the same platform API as browsers — they cannot enumerate or query installed wallets
4. **DC API is the forward path** but disabled by default in Android and requires a separate library on iOS — custom URI schemes remain the current primary mechanism
5. **The matcher** (Android) / **provider registration** (iOS) is the mechanism that enables type-based matching when multiple wallets coexist

---

## 10. Summary

| Question | Answer |
|----------|--------|
| Can one device host multiple wallets? | **Yes** — explicitly allowed by ARF §4.3.1 |
| Is there a regulatory limit? | **No** — regulation says "at least one" per Member State, not per user |
| How are wallets differentiated? | Via the **W3C Digital Credentials API** (OS-mediated), or legacy custom URI schemes |
| How does wallet selection work? | OS scans installed wallets for matching attestation types → presents unified selector to user |
| Android mechanism? | **CredentialManager** + sandboxed matcher per wallet |
| iOS mechanism? | **IdentityDocumentServices** + registered document types |
| Is DC API mandatory? | **Not yet** — currently optional; will become mandatory when W3C Recommendation + conditions met |
| Are custom URI schemes still valid? | **Yes** as fallback, but with known security risks; must use Universal/App Links + hardening |
| Cross-device security? | **CTAP 2.2 hybrid flow** with BLE proximity check + E2E encrypted tunnel |
| Can the OS see credential contents? | **No** — only attestation types, never attribute names or values (HLR OIA_08b) |
| Can a 3rd-party app detect installed wallets? | **No** — architecture is deliberately OS-mediated; app gets binary yes/no at best (Android only) |
| Can a 3rd-party app query credential types? | **No** — only the OS sees registered types; RP app fires a request and the OS handles matching |
| What is the legal basis for detection prevention? | **Article 5a(16)(a)** — prohibits "any other party" from obtaining data enabling tracking/linking/correlation |
| Does this extend beyond attestation providers? | **Yes** — "or any other party" covers RP apps, browsers, OS vendors, intermediaries, and all third parties |
| Can the OS use DC API data commercially? | **No** — HLR OIA_08c prohibits market analysis or the browser/OS's own purposes |
| Can a user opt out of DC API discovery entirely? | **Yes** — HLR OIA_08d mandates a global user setting to disable all DC API disclosure |
| How many layers of privacy protection? | **Three** — Regulatory (Art. 5a(16)), ARF HLRs (OIA_08 family), and Platform Architecture (OS-mediated APIs) — see §2.2, §3, §5 |
| Can an RP auto-trigger a wallet flow? | **No** — Art. 5f(2)–(3) requires "voluntary request of the user"; W3C DC API requires transient activation (user gesture) |
| Must the user explicitly initiate wallet use? | **Yes** — Art. 5a(15) mandates voluntary use; RPA_07 mandates user approval prior to any attribute presentation |
| What is the EU Digital Identity Wallet Trust Mark? | A **verifiable, recognisable** indicator (Art. 3(50)) displayed in the wallet UI confirming the wallet is certified (DASH_09) |
| Is the Trust Mark an RP-side button? | **No** — it is a wallet-side indicator; the RP renders its own "Verify with EUDI Wallet" button, which must await user action |
| Does the DC API technically block auto-triggering? | **Yes** — `navigator.identity.get()` throws `NotAllowedError` without transient activation (user click/tap) |
