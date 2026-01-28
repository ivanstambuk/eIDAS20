# VCQ Requirements Audit Plan (DEC-278)

**Created:** 2026-01-29  
**Status:** 🔄 In Progress  
**Total Requirements:** 144

---

## Audit Dimensions

For each requirement, validate:

| # | Dimension | Question | Fix Action |
|---|-----------|----------|------------|
| 1 | **ARF HLR Validity** | Does the linked HLR describe a **vendor** obligation, not a wallet obligation? | Remove link or find correct vendor-side HLR |
| 2 | **Category Assignment** | Is it in the correct category (registration/issuance/usage/revocation/security/contracts)? | Reassign category |
| 3 | **Role Assignment** | Is it correctly scoped to `relying_party`, `issuer`, or universal (`[]`)? | Fix role array |
| 4 | **Product Category** | Is it correctly scoped to `connector`, `issuance_platform`, `trust_services`, or universal? | Fix productCategories array |
| 5 | **Semantic Validity** | Does this requirement make sense for a **vendor** (not for end-users or Member States)? | Remove or reframe |
| 6 | **Uniqueness** | Is this requirement a duplicate of another? | Merge or remove |
| 7 | **Legal Basis** | Is the cited regulation/article correct and traceable? | Fix citation |

---

## Audit Chunks

| Chunk | File | ID Range | Count | Status |
|-------|------|----------|-------|--------|
| A | core.yaml | VEND-CORE-001 → 015 | 15 | ⏳ Pending |
| B | core.yaml | VEND-CORE-016 → 030 | 15 | ⏳ Pending |
| C | core.yaml | VEND-CORE-031 → 041 | 11 | ⏳ Pending |
| D | ict.yaml | VEND-ICT-001 → 012 | 12 | ⏳ Pending |
| E | intermediary.yaml | VEND-INT-001 → 017 | 17 | ⏳ Pending |
| F | intermediary.yaml | VEND-INT-018 → 034 | 17 | ⏳ Pending |
| G | issuer.yaml | VEND-ISS-001 → 019 | 19 | ⏳ Pending |
| H | issuer.yaml | VEND-ISS-020 → 038 | 19 | ⏳ Pending |
| I | trust_services.yaml | VEND-TSP-001 → 019 | 19 | ⏳ Pending |

**Total: 9 chunks, ~15-19 requirements each**

---

## Audit Process (Per Chunk)

### Step 1: Generate Audit Report
For each requirement in the chunk, extract:
- ID, requirement text, category
- ARF HLR reference (if any)
- Role and product category assignments

### Step 2: Validate ARF Links
For requirements with ARF links:
1. Lookup the HLR specification text
2. Check if the subject is "Wallet Unit/Instance" → **INVALID** (wallet req)
3. Check if the subject is "RP/Issuer/Provider/Intermediary" → **VALID** (vendor req)
4. Flag invalid links for review

### Step 3: Validate Categories
Check if requirement placement matches semantic definitions:
- **Registration**: Authorization to operate, certificates, trusted lists
- **Issuance**: Creating credentials, format compliance
- **Usage**: Verifying presentations, processing attributes
- **Revocation**: Suspend, invalidate, status lists
- **Security**: Keys, crypto, breach notification
- **Contracts**: DPAs, audit rights, DORA, liability

### Step 4: Review Flagged Issues
Present findings to user:
- Issues found
- Recommended fixes
- Execute fixes after approval

### Step 5: Commit Chunk
After chunk approval, commit changes with detailed message.

---

## Execution Schedule

```
Session 1: Chunks A, B (core.yaml part 1)     ~30 requirements
Session 2: Chunks C, D (core.yaml + ict.yaml) ~23 requirements
Session 3: Chunks E, F (intermediary.yaml)    ~34 requirements
Session 4: Chunks G, H (issuer.yaml)          ~38 requirements
Session 5: Chunk I (trust_services.yaml)      ~19 requirements
```

Alternatively: Execute all in current session with user approval at each chunk.

---

## Progress Log

### 2026-01-29 00:47

- [x] Created audit plan
- [ ] Execute Chunk A
- [ ] Execute Chunk B
- [ ] ...

---

## Issues Found

*Will be populated during audit execution*

| Req ID | Issue | Severity | Resolution |
|--------|-------|----------|------------|
| VEND-CORE-011 | ARF link to wallet req (RPI_07) | 🔴 | Fixed → RPI_06 |
| ... | ... | ... | ... |
