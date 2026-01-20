# PID Provider Audit Tracker

> Role: **PID Provider** (Member State entity or designee issuing Person Identification Data)
> Last Updated: 2026-01-20

## Status Legend

| Status | Meaning |
|--------|---------|
| ✅ | Reviewed — requirements extracted |
| ➖ | Reviewed — no requirements for this role |
| ⬜ | Not yet reviewed |
| 🔄 | Needs re-review |

---

## Summary Statistics

- **Total Requirements**: 30
- **Schema Version**: 1
- **Documents Reviewed**: 2/2

---

## 1. Main Regulation (2024/1183 amending 910/2014)

### Article 5a — European Digital Identity Wallets

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 5a(1) | Wallet provision | ➖ | | Member State obligation to provide wallets (Wallet Provider role) |
| Art. 5a(2) | Wallet provision methods | ➖ | | How wallets are provided (Wallet Provider role) |
| Art. 5a(3) | Open source | ➖ | | Source code requirements (Wallet Provider role) |
| Art. 5a(4) | User functionalities | ➖ | | User-facing features (Wallet Provider role) |
| Art. 5a(5) | Technical requirements | ➖ | | General wallet requirements (Wallet Provider role) |
| Art. 5a(5)(f) | PID association | ✅ | PID-REG-001 | **PRIMARY PID PROVISION** — unique representation |
| Art. 5a(6) | Security breach notification | ➖ | | Wallet Provider obligation |
| Art. 5a(7) | Additional functionalities | ➖ | | Wallet Provider scope |
| Art. 5a(8) | Validation mechanisms | ➖ | | Wallet Provider provides validation |
| Art. 5a(9) | Revocation circumstances | ➖ | | Wallet revocation (Wallet Provider) |
| Art. 5a(10) | Technical support | ➖ | | Wallet Provider obligation |
| Art. 5a(11) | Assurance level high | ➖ | | Applies via 2024/2977 Art 3(7) |
| Art. 5a(12) | Security-by-design | ➖ | | Wallet Provider obligation |
| Art. 5a(13) | Free of charge | ➖ | | Wallet Provider obligation |
| Art. 5a(14) | User control, data separation | ➖ | | Wallet Provider obligation |
| Art. 5a(15) | Voluntary use | ➖ | | General principle, no obligation |
| Art. 5a(16) | Technical framework | ➖ | | General framework, no direct PID obligation |
| Art. 5a(17) | GDPR compliance | ✅ | PID-REG-004 | Applies to PID Providers processing personal data |
| Art. 5a(18)(a) | Notify RP list body | ➖ | | Not PID-specific |
| Art. 5a(18)(b) | Notify wallet provision body | ➖ | | Wallet Provider notification |
| Art. 5a(18)(c) | Notify PID association body | ✅ | PID-REG-002 | PID Provider notification |
| Art. 5a(18)(d) | Notify PID validation mechanism | ✅ | PID-REG-003 | PID Provider notification |
| Art. 5a(18)(e) | Notify wallet validation mechanism | ➖ | | Wallet validation (not PID) |
| Art. 5a(19) | Liability (Art 11 mutatis mutandis) | ✅ | PID-REG-005 | Liability applies to PID Providers |
| Art. 5a(20) | TSP obligations (Art 24 mutatis mutandis) | ➖ | | Applies to Wallet Providers only |
| Art. 5a(21) | Accessibility | ✅ | PID-REG-006 | Accessibility requirements |
| Art. 5a(22) | Exemptions | ➖ | | Exemptions from certain articles |
| Art. 5a(23) | Implementing acts | ➖ | | Commission delegated power |
| Art. 5a(24) | Onboarding specs | ➖ | | Onboarding, addressed in 2024/2977 Art 3(7) |

---

## 2. Implementing Regulation 2024/2977 (PID and EAA)

### Articles

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Art. 1 | Subject matter | ➖ | | Scope definition, no obligation |
| Art. 2 | Definitions | ➖ | | Definitions only |
| Art. 3(1) | PID issuance to wallet units | ✅ | PID-ISS-001 | Issue according to eID scheme |
| Art. 3(2) | Auth/validation info | ✅ | PID-ISS-002 | Include auth/validation data |
| Art. 3(3) | Annex compliance | ✅ | PID-ISS-003 | Comply with Annex specs |
| Art. 3(4) | Uniqueness | ✅ | PID-ISS-004 | PID must be unique per MS |
| Art. 3(5) | Cryptographic binding | ✅ | PID-ISS-005 | Bind to wallet unit |
| Art. 3(6) | Supported wallet list | ✅ | PID-ISS-006 | Publish supported wallets |
| Art. 3(7) | Enrollment at LoA high | ✅ | PID-ISS-007 | Identity verification at high |
| Art. 3(8) | Provider authentication | ✅ | PID-ISS-008 | Identify self during issuance |
| Art. 3(9) | Wallet unit validation | ✅ | PID-ISS-009 | Validate wallet before issuance |
| Art. 4(1) | EAA format standards | ➖ | | EAA Issuer role, not PID |
| Art. 4(2) | EAA provider authentication | ➖ | | EAA Issuer role, not PID |
| Art. 4(3) | EAA auth/validation info | ➖ | | EAA Issuer role, not PID |
| Art. 5(1) | Revocation policies | ✅ | PID-REV-001 | Public revocation policies |
| Art. 5(2) | Revocation authority | ✅ | PID-REV-002 | Only issuer can revoke |
| Art. 5(3) | User notification | ✅ | PID-REV-003 | Notify within 24h |
| Art. 5(4)(a) | Revoke on user request | ✅ | PID-REV-004 | Mandatory revocation trigger |
| Art. 5(4)(b) | Revoke on wallet revocation | ✅ | PID-REV-005 | Mandatory revocation trigger |
| Art. 5(4)(c) | Revoke per policy | ✅ | PID-REV-006 | Policy-based revocation |
| Art. 5(5) | Irreversibility | ✅ | PID-REV-007 | Revocations permanent |
| Art. 5(6) | Retention | ✅ | PID-REV-008 | Retain as required by law |
| Art. 5(7) | Status publication | ✅ | PID-REV-009 | Privacy-preserving status |
| Art. 5(8) | Privacy techniques | ✅ | PID-REV-010 | Unlinkability support |
| Art. 6 | Entry into force | ➖ | | Procedural, no obligation |

### Annex — PID Attributes

| Provision | Topic | Status | Req IDs | Notes |
|-----------|-------|--------|---------|-------|
| Annex 1.1 | Natural person mandatory | ✅ | PID-DATA-001 | 5 mandatory attributes |
| Annex 1.2 | Natural person optional | ➖ | | Optional, no direct obligation |
| Annex 1 preamble | Unknown values | ✅ | PID-DATA-005 | Handle missing data |
| Annex 2.1 | Legal person mandatory | ✅ | PID-DATA-004 | 2 mandatory attributes |
| Annex 2.2 | Legal person optional | ➖ | | Optional, no direct obligation |
| Annex 3 | PID metadata mandatory | ✅ | PID-DATA-002 | 3 mandatory metadata fields |
| Annex 3 | PID metadata optional | ➖ | | Optional, no direct obligation |
| Annex 4 | PID encoding formats | ✅ | PID-DATA-003 | ISO 18013-5 + W3C VC |
| Annex 5 | Trust infrastructure | ➖ | | Commission publishes list |

---

## 3. Other Potentially Relevant Acts

| Document | Status | Notes |
|----------|--------|-------|
| 2024/2980 (Notifications) | ➖ | Notification procedures for Commission; no PID-specific obligations beyond Art 5a(18) |
| 2024/2981 (Certification) | ➖ | Wallet certification; PID Providers not subject to wallet certification |
| 2015/1502 (LoA High) | ➖ | Referenced by 2024/2977 Art 3(7); identity verification requirements flow through |

---

## Audit Verification

```bash
# Ran: grep "| ⬜ |" AUDIT_TRACKER_PID.md | grep -v "Not yet reviewed" | wc -l
# Result: 0
```

**AUDIT VERIFICATION:**
- Unreviewed items (⬜): 0
- Total requirements: 30
- Schema version: 1
- Build status: Pending

---

## Audit Log

| Date | Action |
|------|--------|
| 2026-01-20 | Created audit tracker, identified primary sources |
| 2026-01-20 | Completed audit: 27 requirements from 2024/2977 + main regulation |
