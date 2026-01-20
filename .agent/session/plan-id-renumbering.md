# Plan: Requirement ID Renumbering (DEC-090)

> **Status:** Ready for execution
> **Created:** 2026-01-20T19:36

---

## Objective

Rename all 458 requirement IDs to match their new atomic categories from DEC-089.

**Current state:** `RP-TECH-015` with `category: verification` (mismatch)
**Target state:** `RP-VER-015` with `category: verification` (aligned)

---

## New ID Schema

**Format:** `{ROLE}-{CATEGORY_PREFIX}-{NNN}`

### Category → Prefix Mapping

| Category | Prefix | Mnemonic |
|----------|--------|----------|
| registration | REG | Standard |
| certification | CRT | Cert- |
| issuance | ISS | Issue |
| revocation | REV | Revoke |
| verification | VER | Verify |
| technical | TEC | Tech |
| interoperability | IOP | I/O Protocol |
| security | SEC | Secure |
| privacy | PRV | Private |
| transparency | TRN | Trans- |
| governance | GOV | Govern |
| liability | LIA | Liable |

### Role Prefixes

| Role | Prefix | Notes |
|------|--------|-------|
| Relying Party | RP | Unchanged |
| Wallet Provider | WP | Unchanged |
| EAA Issuer | EAA | Changed from ISS to avoid collision with issuance category |
| PID Provider | PID | Unchanged |
| Trust Service Provider | TSP | Unchanged |
| Conformity Assessment Body | CAB | Unchanged |
| Supervisory Body | SB | Unchanged |

**Decision:** EAA Issuer uses `EAA-` prefix (not `ISS-`) to avoid collision with issuance category prefix `ISS`.

---

## Execution Phases

### Phase 1: Create Transformation Script

**File:** `scripts/rename-requirement-ids.js`

**Inputs:**
- All 7 YAML requirement files from `docs-portal/config/rca/requirements/`
- Category prefix mapping (hardcoded in script)
- Role prefix mapping (hardcoded in script)

**Outputs:**
1. Transformed YAML files — requirements reordered by category, new IDs assigned
2. `id-migration-map.json` — mapping of old→new IDs for reference
3. Console summary — counts per role/category

**Algorithm:**
```
For each role file:
  1. Parse YAML
  2. Group requirements by category
  3. Sort categories alphabetically
  4. Within each category, preserve original order (stable sort)
  5. Assign new IDs: {ROLE}-{CAT_PREFIX}-{001, 002, ...}
  6. Write YAML with requirements in new category order
  7. Append to mapping file
```

### Phase 2: Dry Run

1. Run script with `--dry-run` flag
2. Output preview of changes without modifying files
3. Verify:
   - Total count matches (458 before = 458 after)
   - No duplicate IDs
   - All categories have valid prefixes

### Phase 3: Apply Transformation

1. Create git tag: `git tag pre-id-rename`
2. Run script to transform all files
3. Write `id-migration-map.json` to `.agent/session/`

### Phase 4: Update External References

**Files to check and update:**

| File | Check Command |
|------|---------------|
| `.agent/session/pending-task.md` | `grep -E "[A-Z]+-[A-Z]+-[0-9]+"` |
| `AUDIT_TRACKER_RP.md` | Same grep |
| `AUDIT_TRACKER_WP.md` | Same grep |
| `AUDIT_TRACKER_ISSUER.md` | Same grep |
| `AUDIT_TRACKER_PID.md` | Same grep |
| `AUDIT_TRACKER_TSP.md` | Same grep |
| `USE_CASE_MAPPING_WP.md` | Same grep |
| `TRACKER.md` | Same grep |
| `DECISIONS.md` | Same grep |

**Strategy:**
- Script reads mapping file and replaces old IDs with new IDs
- Manual review for prose that mentions IDs contextually

### Phase 5: Validation

**Automated:**
```bash
npm run validate:rca   # Schema validation
npm run build:rca      # Build RCA data
```

**Manual:**
- Browser test: Navigate to RCA page
- Select each role, verify requirements display
- Check category filter functionality

### Phase 6: Documentation

1. Add **DEC-090** to `DECISIONS.md`
2. Update `TRACKER.md` with session entry
3. Commit `id-migration-map.json` for historical reference

### Phase 7: Commit

```bash
git add -A
git commit -m "refactor(rca): align requirement IDs with atomic categories (DEC-090)

- Renamed 458 requirement IDs to match category taxonomy
- Format: {ROLE}-{CATEGORY_PREFIX}-{NNN}
- Prefixes: REG, CRT, ISS, REV, VER, TEC, IOP, SEC, PRV, TRN, GOV, LIA
- EAA Issuer uses EAA- prefix (avoids ISS- collision)
- Requirements reordered by category within files
- Created id-migration-map.json for historical reference
- Updated all external references in audit trackers"
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking external references | Search all `.md` files for old IDs, update via mapping |
| ID collisions | Script validates uniqueness before writing |
| Lost requirements | Script validates count before/after |
| Rollback needed | Git tag `pre-id-rename` allows easy revert |

---

## Time Estimate

| Phase | Estimate |
|-------|----------|
| Script development | 15-20 min |
| Dry run + review | 10 min |
| Apply + fix edge cases | 15 min |
| Reference updates | 10 min |
| Validation | 10 min |
| Documentation | 5 min |
| **Total** | **~60-70 min** |

---

## Questions to Resolve Before Execution

1. **EAA Issuer prefix:** Confirm `EAA-` is acceptable (vs keeping original issuer prefix pattern)
2. **Existing ISS- prefixes:** What prefix does issuer.yaml currently use? Need to check.

---

## Ready?

Run Phase 1 (create script) when approved.
