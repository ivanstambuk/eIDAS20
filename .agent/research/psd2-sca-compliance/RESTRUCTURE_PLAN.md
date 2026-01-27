# PSD2 SCA Compliance Assessment — Restructure Plan

**Created**: 2026-01-27
**Status**: Approved
**Version**: 1.0

---

## Objective

Consolidate the `PSD2_SCA_COMPLIANCE_ASSESSMENT.md` document from a **regulation-first** structure (PSD2 Directive → RTS Chapter II → RTS Chapter IV) to a **topic-first** structure organized by compliance topic and SCA lifecycle phase.

---

## Approved Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Numbering style** | Numeric only (1, 2, 3...) | Clean, simple, topic-focused |
| **Gap analysis** | Both inline + consolidated | Context-preserving + audit-friendly |
| **Appendices** | Keep as appendices | Reference material stays separate |
| **Dual reference format** | Blockquote style | Clear, consistent, allows quoted text |
| **Dynamic linking granularity** | Keep sub-article structure | Preserves regulatory traceability |

---

## Approved New Structure

```
1. Executive Summary
2. Terminology & Definitions
3. Scope: Two SCA Lifecycle Phases
   3.1 Phase 1: Credential Issuance (OID4VCI)
   3.2 Phase 2: Transaction Authentication (OID4VP)

═══════════════════════════════════════════════════════════════════
PART A: SCA CREDENTIAL ISSUANCE (Binding Phase)
═══════════════════════════════════════════════════════════════════

4. PSC Creation & Protection
   4.1 Credential Creation [RTS Art. 22]
   4.2 Association with User [RTS Art. 23]
   4.3 Secure Delivery [RTS Art. 24]
   4.4 Renewal [RTS Art. 26]
   4.5 Revocation [RTS Art. 27]

═══════════════════════════════════════════════════════════════════
PART B: TRANSACTION AUTHENTICATION (Usage Phase)
═══════════════════════════════════════════════════════════════════

5. SCA Triggers & Exemptions
   5.1 When SCA is Required [PSD2 Art. 97(1) + RTS Art. 1]
   5.2 SCA Exemptions [PSD2 Art. 98 + RTS Arts. 10-18]
   5.3 Responsibility Matrix (PSP vs Wallet)

6. SCA Elements & Independence
   6.1 Authentication Code Requirements [RTS Art. 4]
   6.2 Knowledge Element [RTS Art. 6]
   6.3 Possession Element [RTS Art. 7]
   6.4 Inherence Element [RTS Art. 8]
   6.5 Independence of Elements [RTS Art. 9]

7. Dynamic Linking
   7.1 Payer Awareness [PSD2 Art. 97(2) + RTS Art. 5(1)(a)]
   7.2 Cryptographic Binding [PSD2 Art. 97(2) + RTS Art. 5(1)(b)]
   7.3 PSP Verification [RTS Art. 5(1)(c)]
   7.4 Change Notification (Replay Protection) [RTS Art. 5(1)(d)]
   7.5 Display Integrity (WYSIWYS) [RTS Art. 5(2)]
   7.6 Batch Payments [RTS Art. 5(3)]

8. General Security Requirements
   8.1 Security Measures [RTS Art. 2]
   8.2 Periodic Review [RTS Art. 3]

═══════════════════════════════════════════════════════════════════
PART C: GAP ANALYSIS & RECOMMENDATIONS
═══════════════════════════════════════════════════════════════════

9. Consolidated Gap Analysis
   9.1 Critical Gaps (Action Required)
   9.2 Moderate Gaps (Monitor)
   9.3 Low-Risk Gaps (Acceptable)

10. Recommendations for SCA Attestation Rulebook

═══════════════════════════════════════════════════════════════════
PART D: APPENDICES
═══════════════════════════════════════════════════════════════════

Appendix A: mDOC Format Considerations
Appendix B: Wallet Recovery Scenarios
Appendix C: Dutch PA Gap Analysis
Appendix D: Stakeholder Feedback (GitHub #439)
Appendix E: SCA Attestation Rulebook Status

═══════════════════════════════════════════════════════════════════

Version History
```

---

## Content Migration Map

### From Part I (PSD2 Directive)

| Current | New Location | Action |
|---------|--------------|--------|
| Art. 97(1) — SCA Triggers (200+ lines deep-dive) | §5.1 | Move, split exemptions to §5.2 |
| Art. 97(2) — Dynamic Linking (22 lines) | §7 intro | Merge into Dynamic Linking header |
| Art. 97(3) — Delegated Act | Delete | Brief note only (delegation to RTS) |

### From Part II (RTS Chapter II)

| Current | New Location | Action |
|---------|--------------|--------|
| Art. 1 — Subject matter | §5.1 | Merge with Art. 97(1) content |
| Art. 2 — General auth requirements | §8.1 | Move |
| Art. 3 — Review of security measures | §8.2 | Move |
| Art. 4 — Authentication code | §6.1 | Move |
| Art. 5(1)(a) — Payer awareness (210 lines) | §7.1 | Move (keep deep-dive) |
| Art. 5(1)(b) — Code linked (190 lines) | §7.2 | Move (keep deep-dive) |
| Art. 5(1)(c) — PSP verification | §7.3 | Move (keep deep-dive) |
| Art. 5(1)(d) — Change notification | §7.4 | Move (keep deep-dive) |
| Art. 5(2) — Display integrity | §7.5 | Move (keep deep-dive) |
| Art. 5(3) — Batch payments | §7.6 | Move |
| Art. 6 — Knowledge | §6.2 | Move |
| Art. 7 — Possession | §6.3 | Move |
| Art. 8 — Inherence | §6.4 | Move |
| Art. 9 — Independence | §6.5 | Move |

### From Part III (RTS Chapter IV)

| Current | New Location | Action |
|---------|--------------|--------|
| Art. 22 — Credential creation | §4.1 | Move |
| Art. 23 — Association | §4.2 | Move |
| Art. 24 — Delivery | §4.3 | Move |
| Art. 26 — Renewal | §4.4 | Move |
| Art. 27 — Revocation | §4.5 | Move |

### From Part IV (Appendices)

| Current | New Location | Action |
|---------|--------------|--------|
| Appendix A-E | Part D | Keep, renumber as needed |

---

## Dual Reference Format

For sections with PSD2 + RTS overlap:

```markdown
## 7.1 Payer Awareness

> **Regulatory Basis**:
> - [PSD2 Directive Art. 97(2)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32015L2366#097.002): "...dynamically link the transaction to a specific amount and a specific payee"
> - [RTS Art. 5(1)(a)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#005.001): "the payer is made aware of the amount of the payment transaction and of the payee"

[Deep-dive content follows]
```

For sections with RTS-only:

```markdown
## 6.2 Knowledge Element

> **Regulatory Basis**:
> - [RTS Art. 6](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32018R0389#art_6)

[Content follows]
```

---

## Execution Phases

### Phase 1: Preparation ✅
- [x] Create detailed implementation plan
- [x] User review and approval
- [x] Document decisions in RESTRUCTURE_PLAN.md

### Phase 2: Skeleton Creation
1. Create new section headers in document
2. Add placeholder "[TO BE MIGRATED]" notes
3. Keep old content below skeleton temporarily
4. **Checkpoint**: Commit "Restructure: Create topic-first skeleton"

### Phase 3: Part A Migration (Issuance)
1. Move RTS Arts. 22-27 content to §4
2. Add regulatory basis blockquotes
3. **Checkpoint**: Commit "Restructure: Migrate Part A (Issuance)"

### Phase 4: Part B Migration (Authentication)
1. Move SCA Triggers (Art. 97(1) + Art. 1) to §5
2. Move SCA Elements (Arts. 4, 6-9) to §6
3. Move Dynamic Linking (Art. 97(2) + Art. 5) to §7
4. Move General Security (Arts. 2-3) to §8
5. Add dual references to each header
6. **Checkpoint**: Commit "Restructure: Migrate Part B (Authentication)"

### Phase 5: Part C Creation (Gap Analysis)
1. Extract all `⚠️ Gap Identified` notes
2. Categorize by severity
3. Create consolidated summary
4. **Checkpoint**: Commit "Restructure: Create Part C (Gap Analysis)"

### Phase 6: Cleanup
1. Remove old Part I, II, III section headers
2. Verify all content migrated
3. Update version history (→ v5.0)
4. **Checkpoint**: Commit "Restructure: Complete v5.0"

### Phase 7: Verification
1. Verify all EUR-Lex links work
2. Verify all TS12/ARF links work
3. Word count comparison (ensure no content loss)
4. Final review

---

## Success Criteria

- [ ] All deep-dive content preserved
- [ ] All regulatory references (EUR-Lex) working
- [ ] All TS12/ARF links working
- [ ] Dual references present where overlap exists
- [ ] Gap analysis consolidated in Part C
- [ ] Version history updated to 5.0
- [ ] No content loss (line count ≥ current)

---

## Rollback Plan

If issues encountered:
```bash
git checkout HEAD~1 -- PSD2_SCA_COMPLIANCE_ASSESSMENT.md
```

Each phase has a checkpoint commit for granular rollback.
