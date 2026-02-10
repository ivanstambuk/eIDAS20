# RP Deployment Architectures for EUDI Wallet Integration

> **Created:** 2026-02-10  
> **Last updated:** 2026-02-10  
> **Authors:** Stakeholder analysis session

---

## 1. Introduction

When a Relying Party (RP) — for example, an organisation verifying a customer's identity —
wants to accept EUDI Wallet credentials, it does not typically build the entire
wallet-interaction stack from scratch. Instead, it procures a vendor product
(a "wallet connector") that handles the OID4VP protocol, certificate management,
and credential verification.

The vendor's product can be deployed in fundamentally different ways, each with
distinct implications for **user experience** (what the wallet shows to the citizen),
**data protection** (who sees personal data), **legal obligations** (who is the
GDPR controller vs. processor), and **operational responsibility** (who patches,
scales, and monitors the system).

This document defines these deployment architectures, explains the ARF's legal
framework that distinguishes them, and provides the rationale for introducing
deployment architecture as a filtering dimension in the VCQ.

---

## 2. The Two Orthogonal Axes

The deployment architecture is determined by two independent decisions:

### Axis 1: Legal Role — Who holds the access certificate?

The ARF (Architecture and Reference Framework) defines two legal models:

- **Intermediary**: The vendor registers as its own Relying Party (per RPI_01),
  obtains its own access certificate with its own name and identifier, and acts
  on behalf of other RPs ("intermediated RPs"). This is a formal legal role with
  specific ARF obligations (RPI_01 through RPI_10).

- **Direct RP Instance**: The RP uses its own access certificate and RP identity.
  The vendor provides technology (software, infrastructure) but does NOT appear
  as a separate party to the wallet. The vendor is a technology provider, not an
  ARF-defined intermediary.

### Axis 2: Hosting Model — Where does the infrastructure run?

- **SaaS (vendor-hosted)**: The vendor operates the wallet-connector infrastructure
  in its own cloud. The RP's data transits the vendor's infrastructure.

- **Self-hosted (RP-hosted)**: The RP deploys and operates the vendor's software
  on its own infrastructure (on-premise data centre, private cloud, Kubernetes
  cluster). No data transits third-party infrastructure.

### The 2×2 Matrix

```
                    ┌────────────────────────┬────────────────────────┐
                    │   Vendor-hosted (SaaS) │  RP-hosted (Self-host) │
┌───────────────────┼────────────────────────┼────────────────────────┤
│                   │                        │                        │
│   Intermediary    │   ✅ Common           │   ⚠️ Theoretically     │
│   (vendor's cert) │   e.g. Hopae Connect   │   possible but rare    │
│                   │                        │   (vendor's cert on    │
│                   │                        │    RP's infra — why?)  │
│                   │                        │                        │
├───────────────────┼────────────────────────┼────────────────────────┤
│                   │                        │                        │
│   Direct RP       │   ✅ Common           │   ✅ Common            │
│   Instance        │   e.g. Sproof Ident    │   e.g. Lissi EUDI      │
│   (RP's cert)     │                        │   Wallet Connector     │
│                   │                        │                        │
└───────────────────┴────────────────────────┴────────────────────────┘
```

### Why three values, not four?

The "Intermediary + Self-hosted" cell is theoretically possible (the vendor could
provide Docker containers that use the vendor's own access certificate, deployed
on the RP's infrastructure). However:

1. It contradicts the intermediary value proposition ("we handle everything").
2. If the RP is running the infrastructure, there's little reason not to use the
   RP's own certificate and avoid the dual wallet display.
3. No vendor products in the current market offer this combination.

Therefore, we model **three practical deployment architectures**:

| Value | Label | Legal role | Hosting |
|-------|-------|-----------|---------|
| `intermediary` | Intermediary | Intermediary (vendor's cert) | Vendor's concern |
| `direct_saas` | Direct SaaS | Direct RP Instance (RP's cert) | Vendor-hosted |
| `direct_onprem` | Direct Self-Hosted | Direct RP Instance (RP's cert) | RP-hosted |

The "intermediary" label does not specify hosting because the RP does not control
or need to know about the intermediary's infrastructure.

---

## 3. Architecture A — Intermediary

### 3.1 Overview

The vendor operates as a **separate, registered Relying Party** under the ARF.
It has its own RP identity, its own access certificate, and its own relationship
with EUDI Wallet Units.

### 3.2 Data Flow

```
┌─────────────┐    OID4VP Request     ┌──────────────────┐
│             │◄──────────────────────│                  │
│   EUDI      │    (vendor's access   │   Intermediary   │
│   Wallet    │     certificate)      │   Vendor         │
│   Unit      │                       │   (own RP ID)    │
│             │──────────────────────►│                  │
│             │    VP Token response  │   Registered at  │
│             │    (personal data)    │   Registrar with │
└─────────────┘                       │   own access     │
       │                              │   certificate    │
       │                              │                  │
       │  Wallet displays:            └──────┬───────────┘
       │  ┌──────────────────────┐           │
       │  │ Requesting party:    │           │ Forward attributes
       │  │  🔀 Vendor Corp      │           │ (after RPI_09
       │  │ On behalf of:        │           │  verification)
       │  │  Acme Services       │           │
       │  │                      │           │ Immediately delete
       │  │ [Approve] [Decline]  │           │ all personal data
       │  └──────────────────────┘           │ (RPI_10)
       │                                     │
       │                                     ▼
       │                              ┌──────────────────┐
       │                              │                  │
       │                              │   Intermediated  │
       │                              │   Relying Party  │
       │                              │  (Acme Services) │
       │                              │                  │
       │                              │   Receives only  │
       │                              │   the requested  │
       │                              │   attributes     │
       │                              │                  │
       │                              └──────────────────┘
       │
       │  Key: The wallet connects to the INTERMEDIARY's
       │       domain, not the RP's domain.
       │       The access certificate is the VENDOR's.
       │       The wallet MUST show both identities (RPI_07).
```

### 3.3 ARF Requirements (Topic 53)

| Requirement | Obligation | Summary |
|-------------|-----------|---------|
| **RPI_01** | SHALL | Intermediary must register as RP, indicating intermediary role. Obtains own access certificate. |
| **RPI_02** | SHALL | Intermediary must be registered as intermediary. |
| **RPI_03** | SHALL | Intermediary must also register each intermediated RP at the RP's Registrar, if the RP isn't already registered. |
| **RPI_04** | SHALL | When registering an intermediated RP, intermediary must provide legal evidence of the relationship. |
| **RPI_05** | SHALL | Intermediary must include intermediated RP's name and identifier in each request. |
| **RPI_06** | SHALL | Intermediary must include its own access certificate AND the RP's registration certificate (if available) in presentation requests. Must include RPRC_19a information. |
| **RPI_07** | SHALL | Wallet must display names and identifiers of BOTH the intermediary AND the intermediated RP when asking for user approval. **This is the mandatory dual-party display.** |
| **RPI_08** | SHALL | After successful verification (RPI_09), intermediary forwards ONLY the requested attributes to the RP. |
| **RPI_09** | SHALL | Intermediary must verify: attestation signature, issuer trust status, attestation validity, revocation status, holder binding — before forwarding. |
| **RPI_10** | SHALL | Intermediary must **immediately delete** all PIDs, attestations, and user attributes after forwarding (or after verification failure). |

### 3.4 Key Implications

| Concern | Intermediary model |
|---------|-------------------|
| **Wallet display** | Dual-party: wallet shows vendor's name AND RP's name. The RP cannot suppress this — it's a wallet-side obligation. |
| **Private keys** | Vendor holds its own private keys. RP does not need to manage keys for wallet interactions. |
| **GDPR role** | The intermediary acts under its own legal basis (Article 45b). It is NOT a data processor under GDPR Article 28 in the traditional sense — it has its own RP obligations. However, the vendor-RP relationship still requires a clear agreement about data handling. |
| **Data retention** | Zero: immediate deletion after forwarding (RPI_10). |
| **Operational burden** | Low for RP: the intermediary handles wallet interaction, protocol compliance, certificate management. |
| **Registration** | Complex: the intermediary registers itself AND each intermediated RP (RPI_03, RPI_04). |
| **Trust** | The citizen must trust BOTH the intermediary AND the RP. Dual display is designed to make this transparent. |

### 3.5 Reference Implementation Status

As of February 2026, the EU reference wallets (eudi-app-android-wallet-ui,
eudi-app-ios-wallet-ui) do **not** implement the dual-party display (RPI_07).
The `RelyingPartyDataUi` (Android) and `RequestViewState` (iOS) data structures
have no fields for intermediary information. However, RPI_07 is a SHALL
requirement, and compliant wallets in production will enforce it.

---

## 4. Architecture B — Direct SaaS

### 4.1 Overview

The vendor hosts managed wallet-connector infrastructure in its own cloud, but
the RP's own access certificate and RP identity are used. The wallet sees only
the RP — there is no intermediary in the ARF sense, and no dual-party display.

### 4.2 Data Flow

```
┌─────────────┐    OID4VP Request     ┌──────────────────┐
│             │◄──────────────────────│                  │
│   EUDI      │    (RP's access       │   Vendor Cloud   │
│   Wallet    │     certificate)      │   Infrastructure │
│   Unit      │                       │                  │
│             │──────────────────────►│   Runs the       │
│             │    VP Token response  │   connector      │
│             │    (personal data     │   software       │
│             │     transits vendor   │                  │
│             │     infrastructure)   │   Uses RP's      │
└─────────────┘                       │   certificate    │
       │                              │                  │
       │                              └──────┬───────────┘
       │  Wallet displays:                   │
       │  ┌──────────────────────┐           │ Forward verified
       │  │ Requesting party:    │           │ attributes to RP
       │  │  Acme Services      │           │ (data transits
       │  │                      │           │  vendor cloud)
       │  │ (single party only   │           │
       │  │  — no dual display)  │           │
       │  │                      │           ▼
       │  │ [Approve] [Decline]  │    ┌──────────────────┐
       │  └──────────────────────┘    │                  │
       │                              │   Relying Party  │
       │                              │  (Acme Services) │
       │                              │                  │
       │                              │   Receives       │
       │                              │   attributes via │
       │                              │   API callback   │
       │                              │                  │
       │                              └──────────────────┘
       │
       │  Key: The wallet connects to the VENDOR's domain
       │       (unless reverse proxy is configured).
       │       The access certificate is the RP's.
       │       VP Tokens containing personal data TRANSIT
       │       the vendor's infrastructure.
```

### 4.3 Critical Questions for Direct SaaS

#### 4.3.1 response_uri: Whose domain does the wallet connect to?

The OID4VP `response_uri` is the endpoint the wallet sends the VP Token to
after the user approves. In a SaaS model, this typically points to the
**vendor's domain** (e.g., `https://verify.vendorcorp.com/callback`).

This means:
- The wallet's TLS connection terminates at the vendor's infrastructure.
- VP Tokens containing personal data are received by the vendor's servers first.

**Can the RP reverse-proxy this?** Some vendors may support the RP fronting
the service with its own DNS record, domain, and TLS certificate:

```
┌─────────────┐                ┌──────────────┐                ┌──────────────┐
│   EUDI      │   TLS to RP's  │  RP's        │   TLS to       │   Vendor     │
│   Wallet    │───────────────►│  Reverse     │───────────────►│   Cloud      │
│   Unit      │   domain       │  Proxy       │   vendor       │   Backend    │
│             │◄───────────────│  (RP's cert) │◄───────────────│              │
└─────────────┘                └──────────────┘                └──────────────┘
                                                                      
  response_uri: https://verify.acme-services.com/callback  (RP's domain)
  Wallet sees: Acme Services' domain and TLS certificate
  Data: VP Token still reaches vendor cloud (via RP's proxy)
```

Even with reverse proxying, the personal data still reaches the vendor's
backend. The reverse proxy only changes the wallet-facing domain — it does
NOT change the data residency or GDPR implications.

#### 4.3.2 Private Key Custody

The RP's access certificate private key must be available to sign OID4VP
request objects. In a SaaS model, three custody options exist:

```
Option 1: Vendor holds keys            Option 2: RP-controlled HSM
┌────────────────┐                     ┌──────────────┐
│  Vendor        │                     │  Vendor      │
│  Cloud         │                     │  Cloud       │
│  ┌──────────┐  │                     │              │
│  │  RP's    │  │                     │  Signs via   │──────┐
│  │  private │  │                     │  remote API  │      │
│  │  key     │  │                     │              │      ▼
│  └──────────┘  │                     └──────────────┘  ┌────────┐
│  (vendor has   │                                       │  HSM   │
│   custody)     │                     Option 3:         │  (RP-  │
└────────────────┘                     Split signing     │  owned)│
                                       ┌──────────────┐  └────────┘
                                       │  Vendor      │
                                       │  prepares    │──────┐
                                       │  unsigned    │      │
                                       │  request     │      ▼
                                       └──────────────┘  ┌────────┐
                                                         │  RP    │
                                                         │  signs │
                                                         │  (own  │
                                                         │  key)  │
                                                         └────────┘
```

Each option has different trust and compliance implications:
- **Option 1**: Simplest. Vendor has full access to RP's private key. Highest trust requirement.
- **Option 2**: RP retains custody in its own HSM. Vendor calls a signing API. More complex, higher security.
- **Option 3**: Vendor prepares the request object; RP signs it locally. Most complex but strongest key isolation.

#### 4.3.3 GDPR Data Processing Role

In the Direct SaaS model, the vendor **processes personal data** (VP Tokens
transit its infrastructure). The vendor is therefore a **GDPR data processor**
under Article 28, requiring:

- A Data Processing Agreement (DPA) between vendor and RP.
- The vendor must process data only on documented instructions.
- Sub-processor disclosure and authorization.
- Data breach notification obligations.
- Deletion or return of data at end of contract.

This is a fundamentally different legal relationship from the intermediary
model, where the vendor acts under its own legal basis.

---

## 5. Architecture C — Direct Self-Hosted

### 5.1 Overview

The vendor provides deployable software that the RP operates on its own
infrastructure. The RP's access certificate private keys never leave the
RP's perimeter. The wallet connects directly to the RP's endpoint.

### 5.2 Data Flow

```
┌─────────────┐    OID4VP Request     ┌──────────────────┐
│             │◄──────────────────────│                  │
│   EUDI      │    (RP's access       │   RP's Own       │
│   Wallet    │     certificate)      │   Infrastructure │
│   Unit      │                       │                  │
│             │──────────────────────►│   Runs vendor's  │
│             │    VP Token response  │   software       │
│             │    (personal data     │   (Docker, Helm, │
│             │     stays on RP's     │    etc.)         │
│             │     infrastructure)   │                  │
└─────────────┘                       │   RP's private   │
       │                              │   keys stay here │
       │                              │                  │
       │  Wallet displays:            │   No personal    │
       │  ┌──────────────────────┐    │   data leaves    │
       │  │ Requesting party:    │    │   RP's perimeter │
       │  │  Acme Services      │    │                  │
       │  │                      │    └──────────────────┘
       │  │ (single party only   │              │
       │  │  — no dual display)  │              │  May phone home?
       │  │                      │              ▼
       │  │ [Approve] [Decline]  │    ┌──────────────────┐
       │  └──────────────────────┘    │  Vendor Cloud    │
       │                              │  (optional)      │
       │  Key: The wallet connects    │                  │
       │  to the RP's own domain.     │  Telemetry?      │
       │  VP Tokens NEVER transit     │  License check?  │
       │  third-party infrastructure. │  Trust-list feed?│
       │  RP has full data residency  │  Update server?  │
       │  control.                    └──────────────────┘
```

### 5.3 Critical Considerations

| Concern | Self-hosted model |
|---------|-------------------|
| **Wallet display** | Single party: RP's name only. |
| **Private keys** | RP retains full custody on its own infrastructure. |
| **GDPR role** | Vendor is a **software provider**, not a data processor. No DPA needed for wallet data (data never transits vendor infra). |
| **Data residency** | Full RP control. Data stays in RP's jurisdiction. |
| **Operational burden** | High: RP must manage uptime, scaling, patching, certificate rotation, wallet compatibility updates. |
| **Runtime dependencies** | Critical question: does the software phone home to the vendor's cloud? (licence validation, telemetry, trust-list feeds, feature flags). If yes, what data is transmitted? Can it run air-gapped? |
| **Update delivery** | Vendor pushes new Docker images, Helm charts, or packages. RP must apply them. Lead time for critical patches is a key concern. |

---

## 6. Comparison Matrix

| Aspect | Intermediary | Direct SaaS | Direct Self-Hosted |
|---|---|---|---|
| **Access certificate identity** | Vendor's own | RP's own | RP's own |
| **Wallet display** | Dual-party (RPI_07) | Single party (RP only) | Single party (RP only) |
| **Wallet connects to** | Vendor's domain | Vendor's domain (unless proxied) | RP's domain |
| **VP Token data path** | Vendor receives → verifies → forwards → deletes | Vendor receives → forwards to RP | RP receives directly |
| **Private key custody** | Vendor (own key) | Vendor, HSM, or split-signing | RP (own infra) |
| **GDPR role of vendor** | Own legal basis (Art. 45b) | Data processor (Art. 28 DPA) | Software vendor (no DPA needed) |
| **Data retention** | Zero (immediate deletion RPI_10) | Per DPA terms | RP's policy |
| **RP registration** | Vendor registers for RP (RPI_03) | RP registers itself | RP registers itself |
| **Operational burden on RP** | Low (vendor) | Medium (shared) | High (RP) |
| **Data residency control** | Vendor's juris. | Vendor's juris. (unless proxied) | RP's juris. |
| **Vendor examples (Feb 2026)** | Hopae Connect | Sproof Ident | Lissi EUDI Wallet Connector |

> **Note:** The Direct SaaS model can optionally be reverse-proxied through the RP's own domain and TLS certificate, changing the wallet-facing endpoint but not the underlying data flow or GDPR implications. See [section 4.3.1](#431-response_uri-whose-domain-does-the-wallet-connect-to) for details.

---

## 7. Why This Matters for the VCQ

### 7.1 Architecture determines which requirements apply

Many VCQ requirements are implicitly architecture-specific:

- **Intermediary-only requirements** (VEND-CORE-001, 004, 011, 016, 017, 018):
  These reference ARF RPI_01–RPI_10 obligations that only apply when the vendor
  operates as an intermediary. Showing these to a Direct SaaS vendor is confusing.

- **SaaS-specific requirements** (DPA, key custody, data transit): These apply
  when the vendor processes personal data on behalf of the RP. Not relevant for
  a self-hosted product where no data leaves the RP's perimeter.

- **Self-hosted-specific requirements** (deployment format, runtime dependencies,
  patch delivery): These only matter when the RP operates the software.

- **Architecture-agnostic requirements** (access certificate validity, standard
  compliance, pseudonym support): These apply regardless of deployment model.

### 7.2 Without filtering, the questionnaire is bloated

A vendor offering only a self-hosted connector product would see intermediary
registration requirements, DPA requirements, and other irrelevant items. This
wastes the vendor's time and reduces the signal-to-noise ratio of the questionnaire.

### 7.3 Without annotation, the vendor cannot self-assess

Even with filtering, some requirements may apply to multiple architectures with
different nuances. Visual badges (`🔀 Intermediary`, `☁️ Direct SaaS`,
`🏗️ Direct Self-Hosted`) make it immediately clear which architecture a
requirement addresses, both in the web UI and in exported documents.

---

## 8. Taxonomy Decisions

### 8.1 Why "Direct" prefix for SaaS and Self-Hosted?

Without the "Direct" prefix, the three labels (`Intermediary`, `SaaS`,
`Self-Hosted`) conflate two independent dimensions:

- `Intermediary` is a **legal role** (who holds the certificate).
- `SaaS` and `Self-Hosted` are **hosting models** (where the infra runs).

Adding "Direct" makes it explicit that SaaS and Self-Hosted refer to the
**Direct RP Instance** legal model — the RP uses its own certificate, the
vendor is a technology provider, not an ARF intermediary.

### 8.2 Why not four values (2×2)?

The `Intermediary + Self-Hosted` cell is theoretically valid but practically
empty. No current vendor offers an intermediary product that runs on the RP's
infrastructure. Including it would add complexity without value:

- An additional filter checkbox that nobody selects.
- Requirements that nobody evaluates.
- Confusion about what "intermediary on RP infra" even means in practice.

If this combination emerges in the market, it can be added later as
`intermediary_onprem`.

### 8.3 Why not model as two separate filters?

We considered two independent filter axes:
- Axis 1: Legal model (Intermediary / Direct)
- Axis 2: Hosting (SaaS / Self-Hosted)

This was rejected because:
1. Axis 2 is irrelevant when Axis 1 = Intermediary (the RP doesn't care about
   the intermediary's hosting).
2. It creates a conditional UI (Axis 2 only shows for Direct), which is more
   complex than three flat checkboxes.
3. The three-value model covers all practical scenarios today.

---

## 9. EU Reference Implementation Analysis

Investigation of the EU reference wallets (February 2026) confirmed:

### Android (`eudi-app-android-wallet-ui`)

- `RelyingPartyDataUi` data class has fields: `logo`, `isVerified`, `name`, `description`
- **No fields for intermediary identity** — no second party name, no intermediary flag
- `PresentationRequestViewModel.getRelyingPartyData()` populates only `verifierName`
  and `verifierIsTrusted` from `readerAuth`
- `WalletCorePresentationController.onRequestReceived()` extracts only
  `readerCommonName` and `isVerified` from reader authentication

### iOS (`eudi-app-ios-wallet-ui`)

- `BaseRequestViewModel` and `BaseRequestView` display RP info via
  `getTrustedRelyingParty()` — single party only
- No handling for RPRC_19a extension data (intermediated RP information)
- No dual-party display logic

### Implication

**RPI_07 is a SHALL requirement that is NOT implemented in either reference wallet.**
This means:
- Current pilot wallets will NOT show the dual-party display
- Production-compliant wallets (post-2027) WILL show it
- Vendors operating as intermediaries should be aware that the dual display is
  coming, even if current test wallets don't show it

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| **Access Certificate** | X.509 certificate issued to a Relying Party (or intermediary) that authenticates it to EUDI Wallet Units during OID4VP sessions. Contains the RP's name and unique identifier. |
| **Intermediary** | An entity that registers as a Relying Party under the ARF (RPI_01) and requests credential presentations from wallets on behalf of other RPs ("intermediated RPs"). Has its own access certificate. |
| **Intermediated RP** | A Relying Party on whose behalf an intermediary requests credential presentations. The intermediated RP's identity is included in the request (RPRC_19a) and displayed by the wallet (RPI_07). |
| **Direct RP Instance** | The RP Instance (hardware/software) uses the RP's own access certificate. The vendor provides the technology but does not appear as a separate party to the wallet. |
| **VP Token** | Verifiable Presentation Token — the credential data that the wallet sends to the verifier (RP or intermediary) after user approval. Contains personal data (PID attributes, attestation claims). |
| **response_uri** | The OID4VP endpoint where the wallet sends the VP Token. In SaaS deployments, this typically points to the vendor's domain. |
| **RPI_01–RPI_10** | ARF High-Level Requirements under Topic 53 (Relying Party Instances and Intermediaries), defining the intermediary's obligations: registration, dual display, verification, forwarding, deletion. |
| **Dual-party display** | The wallet UI showing both the intermediary's identity and the intermediated RP's identity to the user when requesting approval (RPI_07). |
| **DPA** | Data Processing Agreement under GDPR Article 28, required when the vendor processes personal data on behalf of the RP (Direct SaaS model). |
