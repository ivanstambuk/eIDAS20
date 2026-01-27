# PSD2 SCA Compliance Validation Plan

> **Version**: 1.0  
> **Created**: 2026-01-27  
> **Purpose**: Second-pass validation of all regulatory requirements after quote expansion  
> **Scope**: PSD2 Directive Article 97 + RTS 2018/389 Articles 1-24  

---

## Validation Methodology

For each article, verify:
1. **Quote Accuracy**: Does the quoted text exactly match EUR-Lex source?
2. **Article Title**: Does the title match the official RTS article heading?
3. **Compliance Assessment**: Is the ✅/⚠️/❌ status correctly assigned?
4. **Evidence Mapping**: Are the ARF/TS12 references valid and correctly interpreted?
5. **Context Accuracy**: Does the explanation correctly interpret the requirement?

---

## Priority Tiers

| Priority | Criteria | Count |
|----------|----------|-------|
| **P0 — Critical** | Articles restructured (6, 8, 9) — content was swapped | 3 |
| **P1 — High** | Articles with expanded quotes + compliance assessment | 14 |
| **P2 — Medium** | Articles with expanded quotes, scope/delegation only | 4 |
| **P3 — Low** | Articles unchanged in this session | ~8 |

---

## Validation Tracker

### P0 — Critical Priority (Restructured Articles)

These articles had **content swapped between them** — highest risk of compliance error.

| # | Article | Title | Quote Status | Assessment Status | Validated |
|---|---------|-------|--------------|-------------------|-----------|
| 1 | Art. 6(1) | Requirements... knowledge | ✅ VERIFIED | ✅ PASS | ☑ |
| 2 | Art. 6(2) | Requirements... knowledge | ✅ VERIFIED | ✅ PASS | ☑ |
| 3 | Art. 8(1) | Requirements... inherence | ✅ VERIFIED | ✅ PASS | ☑ |
| 4 | Art. 8(2) | Requirements... inherence | ✅ VERIFIED | ✅ PASS | ☑ |
| 5 | Art. 9(1) | Independence of elements | ✅ VERIFIED | ✅ PASS | ☑ |
| 6 | Art. 9(2) | Independence (multi-purpose) | ✅ VERIFIED | ⚠️ ADD 9(3) | ☑ |

**Validation Notes**:
- **Art. 6**: PIN storage verified in reference impl: Android uses CryptoController (AES), iOS uses Keychain
- **Art. 9(3)**: Requirement is mentioned in context but should have explicit quote

---

### P1 — High Priority (Expanded Quotes with Compliance Impact)

These articles had truncated quotes expanded — verification needed.

| # | Article | Title | Quote Status | Assessment Status | Validated |
|---|---------|-------|--------------|-------------------|-----------|
| 7 | Art. 1 | Subject matter | ✅ VERIFIED | ➖ Scope only | ☑ |
| 8 | Art. 2(1) | Transaction monitoring | ✅ VERIFIED | ✅ PASS | ☑ |
| 9 | Art. 2(2) | Risk-based factors | ✅ VERIFIED | ✅ PASS | ☑ |
| 10 | ~~Art. 2(3)~~ | ~~Risk-based factors~~ | ❌ REMOVED | ❌ PHANTOM | ☑ |
| 11 | Art. 3(1) | Review of security measures | ✅ VERIFIED | ✅ PASS | ☑ |
| 12 | Art. 3(2) | Audit period | ✅ VERIFIED | ✅ PASS | ☑ |
| 13 | Art. 3(3) | Audit report | ✅ VERIFIED | ✅ PASS | ☑ |
| 14 | Art. 4(1) cont. | One-time use | 🔄 RENUMBERED | ✅ PASS | ☑ |
| 15 | Art. 4(2)(a) | Factor derivation | 🔄 RENUMBERED + FIXED | ✅ PASS | ☑ |
| 16 | Art. 4(2)(b) | No code re-generation | 🔄 RENUMBERED + FIXED | ✅ PASS | ☑ |
| 17 | Art. 4(2)(c) | Forgery resistance | 🔄 RENUMBERED + FIXED | ✅ PASS | ☑ |
| 18 | Art. 4(3)(a) | Non-disclosure | 🔄 RENUMBERED | ❌ GAP CONFIRMED | ☑ |
| 19 | Art. 4(3)(b) | 5 attempts | 🔄 RENUMBERED | ✅ PASS | ☑ |
| 20 | Art. 4(3)(c) | Session protection | 🔄 RENUMBERED | ✅ PASS | ☑ |
| 21 | Art. 4(3)(d) | Session timeout | 🔄 RENUMBERED | ✅ PASS | ☑ |

**Validation Notes**:
- **Art. 2(3)**: Removed — phantom article that duplicated 2(2). RTS only has 2(1) and 2(2).
- **Art. 4(1)**: Fixed quote to match EUR-Lex exactly (removed "(2)" reference, added "which are")
- **Art. 4 numbering**: CRITICAL FIX — all sub-paragraphs were off by one:
  - Old 4(2) → Part of 4(1) (one-time use is second paragraph of 4(1))
  - Old 4(3) → Now 4(2)
  - Old 4(4) → Now 4(3)
- **Art. 4(2)(a-c)**: Fixed quotes to match EUR-Lex exactly ("can" not "may", "is not possible" not "shall not be")

---

### P2 — Medium Priority (Scope/Delegation Articles)

These are not compliance requirements themselves, but context articles.

| # | Article | Title | Quote Status | Assessment Status | Validated |
|---|---------|-------|--------------|-------------------|-----------|
| 21 | Art. 97(3) PSD2 | Delegated Act | 🔄 EXPANDED | ➖ Scope only | ☐ |
| 22 | Art. 97(4) PSD2 | EBA Guidelines | 🔄 EXPANDED | ➖ Scope only | ☐ |
| 23 | Art. 22 | PSC confidentiality | ✅ Unchanged | ⏳ NEEDS REVIEW | ☐ |
| 24 | Art. 24 | Secure execution | 🔄 EXPANDED | ⏳ NEEDS REVIEW | ☐ |
| 25 | Art. 18 | TRA exemption | 🔄 EXPANDED | ⏳ NEEDS REVIEW | ☐ |

---

### P3 — Low Priority (Unchanged Articles)

These articles were not modified in this session but should be verified for completeness.

| # | Article | Title | Quote Status | Assessment Status | Validated |
|---|---------|-------|--------------|-------------------|-----------|
| 26 | Art. 97(1) PSD2 | SCA Triggers | ✅ Unchanged | ✅ Previously validated | ☐ |
| 27 | Art. 97(2) PSD2 | Dynamic Linking | ✅ Unchanged | ✅ Previously validated | ☐ |
| 28 | Art. 4(1) | Two elements + auth code | ✅ Unchanged | ✅ Previously validated | ☐ |
| 29 | Art. 4(3)(a-c) | Factor derivation | ✅ Unchanged | ✅ Previously validated | ☐ |
| 30 | Art. 4(4)(a) | Non-disclosure | ✅ Unchanged | ❌ GAP CONFIRMED | ☐ |
| 31 | Art. 5(1)(a-d) | Dynamic linking | ✅ Unchanged | ✅ Previously validated | ☐ |
| 32 | Art. 5(3)(a-b) | Batch payments | ✅ Unchanged | ⏳ NEEDS REVIEW | ☐ |

---

## Validation Session Template

For each article validation, use this template:

```markdown
### Validation: Article X(Y) — [Title]

**Date**: YYYY-MM-DD  
**Validator**: [Agent/Human]

#### 1. Quote Accuracy
- [ ] Retrieved fresh from EUR-Lex
- [ ] Character-by-character match confirmed
- [ ] No truncation or paraphrasing

#### 2. Article Title
- [ ] Matches official RTS heading
- [ ] No semantic drift from original

#### 3. Compliance Assessment
- [ ] Status (✅/⚠️/❌) is justified
- [ ] Responsibility attribution (Wallet/PSP/Shared) is correct

#### 4. Evidence Mapping
- [ ] ARF references exist and are accessible
- [ ] TS12 references are accurate
- [ ] Reference implementation evidence is valid

#### 5. Context Accuracy
- [ ] Explanation correctly interprets requirement
- [ ] No overclaiming or underclaiming compliance

**Result**: ☐ PASS / ☐ FAIL / ☐ NEEDS CORRECTION
**Notes**: 
```

---

## Execution Plan

### Phase 1: P0 Critical (Est. 30 min)
1. Review Articles 6, 8, 9 content reorganization
2. Verify each section is now under correct article
3. Confirm compliance assessments match article semantics

### Phase 2: P1 High (Est. 45 min)
1. Batch 1: Articles 1-3 (scope, monitoring, audit)
2. Batch 2: Article 4 (authentication code)
3. Batch 3: Articles 5, 7 (dynamic linking, possession)

### Phase 3: P2 Medium (Est. 15 min)
1. Verify scope articles (97.3, 97.4)
2. Verify PSC articles (22, 24)
3. Verify exemption article (18)

### Phase 4: P3 Low (Est. 15 min)
1. Quick verification of unchanged articles
2. Spot-check reference validity

---

## Progress Summary

| Phase | Articles | Status | Completed |
|-------|----------|--------|-----------|
| P0 Critical | 6 | ⏳ Not Started | 0/6 |
| P1 High | 14 | ⏳ Not Started | 0/14 |
| P2 Medium | 5 | ⏳ Not Started | 0/5 |
| P3 Low | 7 | ⏳ Not Started | 0/7 |
| **Total** | **32** | | **0/32** |

---

## Validation Log

*Entries will be added as validation proceeds*

| Date | Article | Result | Notes |
|------|---------|--------|-------|
| — | — | — | — |
