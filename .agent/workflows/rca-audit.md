---
description: Systematic audit of legal documents for role-specific compliance requirements
---

# RCA Audit Workflow

Use this workflow when:
- Auditing a legal document for compliance requirements
- Adding requirements for a new role
- Expanding coverage of an existing role

---

## Step 0: Specify Target Role

**⚠️ REQUIRED** — Before starting, confirm the target role:

```
Which role are you auditing for?
- relying_party (RP)
- wallet_provider (WP)
- trust_service_provider (TSP)
- pid_provider
- eaa_issuer
- conformity_assessment_body (CAB)
- supervisory_body
- [other]
```

**Files affected:**
- Requirements: `docs-portal/config/rca/requirements/{role}.yaml`
- Audit tracker: `docs-portal/config/rca/AUDIT_TRACKER_{ROLE}.md`

---

## Step 1: Load Existing Requirements

**MANDATORY**: Before reading any legal text, load the existing requirements file for this role.

```bash
# View current requirements for the role
cat docs-portal/config/rca/requirements/{role}.yaml | grep "id:"
```

Create a mental index of:
- Which articles are already covered
- Which paragraphs have requirements
- What IDs exist (to avoid duplicates)

---

## Step 2: Read Source Documents

For each article/section:

1. **Read the actual text** — Never guess from titles
2. **Identify obligations** — Look for "shall", "must", "is required to"
3. **Check if role is mentioned** — Does this apply to the target role?
4. **Cross-reference** — Is this already in the requirements YAML?

### Key Markers for Role Relevance

| Role | Look for these terms |
|------|---------------------|
| relying_party | "relying party", "relying parties", "service provider relying on" |
| wallet_provider | "provider of European Digital Identity Wallet", "wallet provider", "issuing wallet" |
| trust_service_provider | "trust service provider", "TSP", "QTSP", "qualified trust service" |
| pid_provider | "PID provider", "person identification data provider" |
| eaa_issuer | "issuer of attestations", "EAA issuer", "attestation issuance" |

---

## Step 3: Gap Analysis AND Validation

**Two-way audit**: Not only find missing requirements, but also verify existing ones are valid.

### 3a. Check for Gaps (Missing Requirements)

For each article with potential requirements:

```markdown
| Article | Already Covered? | Gap Found? | Action |
|---------|-----------------|------------|--------|
| Art 5b(1) | ✅ RP-REG-001 | No | None |
| Art 5b(9) | ❌ | Yes | Add RP-AUTH-001 |
| Art 5b(10) | ❌ | Yes | Add RP-OPS-004 |
```

### 3b. Validate Existing Requirements

For each existing requirement in the YAML, verify:

1. **Source exists** — Does the cited article/paragraph actually exist?
2. **Text matches** — Does the `legalText` match the actual regulation?
3. **Role applies** — Does this really apply to the target role?
4. **Not duplicated** — Is this a unique requirement (not covered elsewhere)?

```markdown
| Requirement ID | Valid? | Issue | Action |
|---------------|--------|-------|--------|
| RP-REG-001 | ✅ | | Keep |
| RP-FAKE-001 | ❌ | Article doesn't exist | REMOVE |
| RP-DATA-005 | ❌ | Applies to wallet provider, not RP | REMOVE |
| RP-DUP-001 | ❌ | Duplicates RP-REG-003 | REMOVE |
```

**⚠️ If invalid requirements found:**
- Remove them from the YAML
- Document the removal in commit message
- Note in audit tracker: "Removed {ID}: {reason}"

## Step 4: Add New Requirements

For each gap, add to the YAML file:

```yaml
- id: {ROLE}-{CATEGORY}-{NUMBER}
  category: {category}
  requirement: "{short description}"
  explanation: |
    {detailed explanation}
  legalBasis:
    regulation: "{regulation number}"
    article: "Article {N}"
    paragraph: "{paragraph}"
  legalText: |
    {exact legal text}
  deadline: "{YYYY-MM-DD}"
  roles:
    - {role}
  useCases: all  # or specific list
```

### ID Conventions

| Role | Prefix | Example |
|------|--------|---------|
| relying_party | RP- | RP-REG-001, RP-AUTH-003 |
| wallet_provider | WP- | WP-CERT-001, WP-SEC-005 |
| trust_service_provider | TSP- | TSP-QUAL-001, TSP-AUD-002 |

### Category Options
- registration, technical, authentication, esignature, data-protection, security, operational

---

## Step 5: Update Audit Tracker

Mark each article with review status in `AUDIT_TRACKER_{ROLE}.md`:

| Status | Meaning |
|--------|---------|
| ✅ | Reviewed — requirements extracted |
| ➖ | Reviewed — no requirements for this role |
| ⬜ | Not yet reviewed |
| 🔄 | Needs re-review |

**Include notes** explaining why articles are/aren't applicable.

---

## Step 6: Update Schema Version

After adding requirements:

1. Increment `schemaVersion` in the YAML
2. Update audit note with date
3. Rebuild: `npm run build:rca`

---

## Step 7: Verify

```bash
# Rebuild and check count
cd docs-portal && npm run build:rca

# Should show new requirement count
# Example output: "📄 Loaded relying-party.yaml: 90 requirements"
```

---

## Anti-Patterns to Avoid

❌ **Never guess from titles** — Always read the actual article text

❌ **Never skip cross-reference** — Always check existing requirements first

❌ **Never forget recitals** — They provide informative context (bindingType: informative)

❌ **Never use generic names** — Files must include role: `AUDIT_TRACKER_RP.md` not `AUDIT_TRACKER.md`

---

## Checklist Before Completion

1. All articles marked with ✅ or ➖ (no ⬜ remaining)
2. All recitals reviewed
3. Gap analysis performed against existing YAML
4. Schema version incremented
5. `npm run build:rca` successful
6. Commit changes with descriptive message
