# RCA Role Architecture: TSP vs EAA Issuer Separation

> **Status:** Accepted  
> **Date:** 2026-01-20  
> **Decision:** DEC-091

## Summary

This document explains the legal and architectural rationale for maintaining **Trust Service Provider (TSP)** and **EAA Issuer** as separate roles in the Regulatory Compliance Analyzer (RCA), despite the fact that QEAA issuers are legally QTSPs.

---

## The Legal Framework

### Article 3 Definition Chain

The eIDAS Regulation 910/2014 (as amended by 2024/1183) establishes a clear definitional hierarchy:

1. **Article 3(16)(f)**: "trust service" includes "the creation, verification and validation of electronic attestations of attributes"
2. **Article 3(19)**: "qualified trust service" means a trust service meeting applicable requirements
3. **Article 3(20)**: "qualified trust service provider" means a TSP who provides one or more qualified trust services and is granted qualified status

**Conclusion**: Issuing QEAA = providing a qualified trust service = being a QTSP

They are **legally identical**.

### Three Categories of Attribute Issuers

| Type | Is a TSP? | Is a QTSP? | Legal Basis |
|------|-----------|------------|-------------|
| **QEAA Issuer** | ✅ Yes | ✅ Yes | Article 45d — must be on Trusted Lists |
| **Non-qualified EAA Issuer** | ✅ Yes | ❌ No | Article 45e — TSP but not qualified |
| **Public Authentic Source (PAS)** | ❌ **No** | ❌ No | Article 45f — government bodies, separate regime |

### Public Authentic Source: Special Category

Article 45f(2) requires that public sector bodies issuing attestations:

> "meet a level of reliability and trustworthiness **equivalent to** qualified trust service providers in accordance with Article 24."

Key distinctions:
- They must meet **QTSP-equivalent standards**
- They are **NOT QTSPs** — separate notification mechanism (Article 45f(3))
- They appear on a **Commission-published list**, NOT on Trusted Lists
- They are NOT subject to TSP supervision under Articles 17-21

---

## The Design Question

Given that QEAA issuers are legally QTSPs, why maintain separate RCA roles?

### Option A: Merge EAA Issuer into TSP

**Rejected.** Would lose the distinction between:
- TSP providing signatures only → no QEAA requirements
- TSP providing QEAA → needs Articles 45d-45h
- PAS → not a TSP at all

### Option B: Keep Separate Roles (Chosen)

Maintain both roles with clear purposes:

| Role | What It Covers | Who Selects It |
|------|----------------|----------------|
| **Trust Service Provider** | Base TSP/QTSP obligations (Articles 13-24) | Any trust service provider |
| **EAA Issuer** | QEAA-specific + PAS obligations (Articles 45d-45h) | Entities issuing attributes to wallets |

---

## Rationale for Separation

### 1. QTSP Service Types Are Orthogonal

A QTSP can provide multiple service types:

| Service Type | Articles | QEAA-Specific? |
|--------------|----------|----------------|
| Qualified Signatures | 25-34, Annex I-II | No |
| Qualified Seals | 35-40, Annex III | No |
| Qualified Time Stamps | 41-42 | No |
| Qualified Registered Delivery | 43-44 | No |
| Qualified Website Auth | 45 | No |
| **Qualified EAA** | **45d-45h, Annex V** | **Yes** |
| Qualified Archiving | 45i-45j | No |
| Qualified Ledgers | 45k-45l | No |

A QTSP providing only signatures should NOT have QEAA requirements.
A QTSP providing only QEAA should NOT have signature-specific requirements.

The service type is an **orthogonal dimension** to TSP status.

### 2. Public Authentic Sources Are NOT TSPs

Article 45f creates a special category for government bodies:
- They issue attestations from authentic sources
- They are NOT listed on Trusted Lists
- They have their own notification mechanism to the Commission
- They must meet QTSP-equivalent reliability, but through different means

If we merged EAA Issuer into TSP, where would PAS go? They don't belong in TSP.

### 3. User Mental Model

Organizations self-identify differently:
- "I'm a government DMV issuing driver's licenses" → EAA Issuer (public_authentic)
- "I'm a certificate authority also issuing qualified attestations" → TSP + EAA Issuer
- "I'm a startup issuing non-qualified fitness credentials" → EAA Issuer (non_qualified)

The separation matches how stakeholders think about their compliance obligations.

### 4. Multi-Role Selection Handles Overlap

The RCA tool's multi-role selection allows organizations to select:
- TSP (qualified) + EAA Issuer (qualified) → QEAA provider
- TSP (qualified) alone → signature/seal/timestamp provider
- EAA Issuer (public_authentic) alone → government authentic source

The UI aggregates and deduplicates requirements automatically.

---

## Addressing the Duplication

### Current State

`issuer.yaml` contains some requirements that duplicate `trust-service-provider.yaml`:
- Article 24 obligations (staff, financial resources, records, termination)
- 2025/2530 requirements (risk management, termination plans)

### Why Duplication Exists

The duplication is **intentional for user convenience**:
- A new QEAA provider selecting only "EAA Issuer (qualified)" gets complete requirements
- They don't need to know they're "really" a QTSP
- The portal is self-documenting for that role

### Acceptable Trade-off

| Approach | Data Redundancy | User Experience |
|----------|-----------------|-----------------|
| **De-duplicate** (force TSP+EAA selection) | Clean | Complex (must select 2 roles) |
| **Keep duplicates** (current) | ~17 requirements shared | Simple (1 role is complete) |

We chose user simplicity over data purity.

---

## Selection Guidance

### Example Scenarios

| Organization | Roles to Select | Profiles |
|--------------|-----------------|----------|
| Government DMV | EAA Issuer | `public_authentic` |
| University issuing diplomas | EAA Issuer | `qualified` or `non_qualified` |
| Certificate Authority (e-signatures only) | TSP | `qualified` |
| Certificate Authority + QEAA | TSP + EAA Issuer | Both: `qualified` |
| Startup issuing gym memberships | EAA Issuer | `non_qualified` |

### Profile Breakdown

**Trust Service Provider:**
- `qualified` — Full QTSP obligations (Articles 20-24)
- `non_qualified` — Baseline TSP obligations (Articles 13, 15, 19, 19a)

**EAA Issuer:**
- `qualified` — QEAA obligations (Articles 45d-45h, Annex V)
- `non_qualified` — Non-qualified EAA obligations (Articles 45e, 45g, 45h)
- `public_authentic` — PAS obligations (Article 45f, Annex VII)

---

## Legal Sources

### Primary Sources

| Article | Content |
|---------|---------|
| Article 3(16)(f) | Trust service includes EAA creation/verification |
| Article 3(19) | Qualified trust service definition |
| Article 3(20) | Qualified trust service provider definition |
| Article 45d | QEAA requirements (Annex V) |
| Article 45e | EAA verification against authentic sources |
| Article 45f | Public sector body attestations (Annex VII) |
| Article 45g | EAA issuance to wallets |
| Article 45h | Additional EAA provider rules (data separation) |

### External Verification

Web search confirmed the interpretation:

> "Crucially, QEAAs can only be issued by a Qualified Trust Service Provider."
> — Multiple industry sources (Bundesdruckerei, Talao, LuxTrust, EC documentation)

> "Article 45f specifically addresses attestations originating from public sector bodies. Member States are required to ensure that these public sector bodies meet a level of reliability and trustworthiness equivalent to qualified trust service providers, even though they are not explicitly classified as TSPs under this specific article."
> — european-digital-identity-regulation.com

---

## Conclusion

The separation of TSP and EAA Issuer roles reflects:

1. **Legal reality** — QEAA issuers are QTSPs, but service types are orthogonal
2. **PAS exception** — Government authentic sources are legally distinct
3. **User convenience** — Single role selection provides complete requirements
4. **Multi-role aggregation** — Complex scenarios handled by role combination

The duplication (~17 requirements) is an acceptable trade-off for user experience.

---

## See Also

- [DEC-091](../../../DECISIONS.md#dec-091) — The decision record for this architecture
- [TERMINOLOGY.md](../../../TERMINOLOGY.md) — Definitions of QEAA, PAS, TSP, etc.
- [roles.yaml](../../../docs-portal/config/rca/roles.yaml) — Role configuration
