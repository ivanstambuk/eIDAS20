---
description: Systematic audit of legal documents for role-specific compliance requirements
---

# RCA Audit Workflow

Use this workflow when:
- Auditing a legal document for compliance requirements
- Adding requirements for a new role
- Expanding coverage of an existing role

---

## 🚨 CRITICAL RULE: ZERO TOLERANCE FOR ⬜ ITEMS

**An audit is NOT complete until EVERY article is marked ✅ or ➖.**

Before claiming an audit is complete:

```bash
# MANDATORY: Run this grep to find any remaining ⬜ items
# Excludes the legend row that explains what ⬜ means
grep "| ⬜ |" docs-portal/config/rca/AUDIT_TRACKER_{ROLE}.md | grep -v "Not yet reviewed" | wc -l

# If the output is anything other than 0, THE AUDIT IS NOT COMPLETE
# You MUST review each ⬜ item before finishing
```

**If ANY ⬜ remains = AUDIT FAILED. Do not proceed to other steps.**

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

## Step 1.5: Locate Local Source Files (MANDATORY)

**⚠️ ALWAYS use LOCAL Markdown files** — Do NOT fetch from EUR-Lex online.

All regulations are already imported into the repository:

```bash
# Main regulation (consolidated)
ls ~/dev/eIDAS20/01_regulation/

# Implementing acts
ls ~/dev/eIDAS20/02_implementing_acts/

# Find a specific regulation by number
find ~/dev/eIDAS20 -name "*2025*848*" -type f
```

**Source file structure:**
- `01_regulation/` — Consolidated eIDAS Regulation (910/2014)
- `02_implementing_acts/{YEAR}_{NUMBER}_{Title}/` — Implementing acts

**Example:**
```bash
# Read 2025/848 (RP Registration) from local files
cat ~/dev/eIDAS20/02_implementing_acts/2025_0848_Notified_Wallet_List/32025R0848.md
```

**Why local files:**
1. Already converted to consistent Markdown format
2. No web scraping/chunking noise
3. Faster and more reliable
4. Guaranteed to match portal content

---

## 🚨 CRITICAL: MANDATORY IMPLEMENTING ACTS AUDIT

**An audit of the main regulation alone is NEVER complete. You MUST also audit ALL relevant implementing acts.**

### Step 1.6: Identify ALL Implementing Acts for Role

Before proceeding, list ALL implementing acts in `02_implementing_acts/` and **explicitly determine** which are relevant to the role:

```bash
# List all implementing acts
ls ~/dev/eIDAS20/02_implementing_acts/
```

**For EACH implementing act, you MUST:**
1. Read its title and subject matter
2. Determine if it imposes obligations on the target role
3. Add it to the audit tracker with article-by-article breakdown
4. Mark each article as ✅ or ➖

**Role-to-Implementing-Act Mapping (non-exhaustive):**

| Role | Relevant Acts (MUST AUDIT) |
|------|---------------------------|
| `relying_party` | 2024/2977, 2024/2979, 2025/846, 2025/847, 2025/848 |
| `wallet_provider` | 2024/2979, 2024/2981, 2024/2982, 2025/848, 2025/849 |
| `trust_service_provider` | 2025/1566-1572, 2025/1929, 2025/1942-1944, 2025/2164, 2025/2527, 2025/2530-2532 |
| `pid_provider` | 2024/2977 |
| `eaa_issuer` | 2024/2977, 2025/1569, 2025/2530 |

**⚠️ NEVER assume an implementing act is "probably just specifications".**
Read the actual text. Extract obligations. Mark in tracker.

### Why This Rule Exists

This rule was added after the TSP audit (2026-01-20) skipped 16 implementing acts 
by assuming they contained "only technical specifications" without reading them.
This is unacceptable. Every legal document MUST be systematically reviewed.

## Step 2: Read Source Documents — EVERY ARTICLE

**🚨 READ EVERY SINGLE ARTICLE. NO EXCEPTIONS.**

### 🚨 CRITICAL: ONE ROW PER PROVISION

**NEVER use ranges like "Art. 1-22" or "Annexes I-IX". EACH provision gets its OWN row.**

❌ **WRONG:**
```markdown
| Art. 1-22 | All articles | ➖ | | Certification framework |
| Annexes I-IX | All annexes | ➖ | | Technical requirements |
| All | Full regulation | ➖ | | Member State duties |
| Recital 1-76 | Original recitals | ➖ | | Historical context |
| 2025/1946 | Wallet Reference Issuer | ➖ | | Preservation services |
```

✅ **CORRECT:**
```markdown
| Art. 1 | Subject matter | ➖ | | Scope definition |
| Art. 2 | Definitions | ➖ | | Wallet-relying party defined |
| Art. 3 | National registers | ➖ | | MS establishment duties |
| Art. 4 | Registration policies | ➖ | | MS policy requirements |
...
| Annex I | Risk register | ➖ | | Threat descriptions |
| Annex II | Certification schemes | ➖ | | CAB requirements |
...
```

**Why individual rows matter:**
1. Forces you to actually READ each article
2. Prevents accidentally skipping important provisions
3. Creates auditable evidence of review
4. Makes future re-reviews targeted and efficient

**This applies to ALL document types:**
- Articles
- Annexes
- Recitals
- Sections
- Chapters
- Any other structural unit

For EACH article in the regulation (not just some):

1. **Read the actual text** — Never guess from titles
2. **Identify obligations** — Look for "shall", "must", "is required to"
3. **Check if role is mentioned** — Does this apply to the target role?
4. **Cross-reference** — Is this already in the requirements YAML?
5. **Mark immediately** — Update the tracker with ✅ or ➖ RIGHT AWAY

### Key Markers for Role Relevance

| Role | Look for these terms |
|------|---------------------|
| relying_party | "relying party", "relying parties", "service provider relying on" |
| wallet_provider | "provider of European Digital Identity Wallet", "wallet provider", "issuing wallet" |
| trust_service_provider | "trust service provider", "TSP", "QTSP", "qualified trust service" |
| pid_provider | "PID provider", "person identification data provider" |
| eaa_issuer | "issuer of attestations", "EAA issuer", "attestation issuance" |

### Article Coverage Tracking

**As you read each article, immediately mark it in the tracker:**

```markdown
| Article | Status | Notes |
|---------|--------|-------|
| Art. 1  | ➖     | Scope - no role obligations |
| Art. 2  | ➖     | Definitions only |
| Art. 3  | ✅     | RP-XXX-001 added |
| Art. 4  | ➖     | MS duties only |
...
```

**Never leave an article unmarked. Mark it before moving to the next article.**

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

### ⚠️ Verify Requirement Count

**After creating the YAML file, verify the count matches your tracker:**

```bash
# Count requirements in YAML file
grep "^  - id:" docs-portal/config/rca/requirements/{role}.yaml | wc -l

# The output should match the count in your AUDIT_TRACKER_{ROLE}.md
```

**Why this matters:** Manual counting during YAML creation often produces mismatches. Always verify with grep before updating the tracker's summary statistics.

### Cross-Cutting Requirement Consolidation

**When the SAME requirement appears in multiple implementing acts, consolidate into a single entry.**

**Pattern recognition:** These requirements repeat across service-type implementing acts:
- Quarterly vulnerability scans (REQ-7.8-13)
- Annual penetration tests (REQ-7.8-17X)
- Firewall configuration (prevent unnecessary access)
- 12-month personnel training updates
- Termination plan compliance (per Art. 24(5))
- ENISA-approved cryptographic mechanisms

**Consolidation format:**
```yaml
- id: TSP-IA-SEC-001
  category: security
  requirement: "Perform quarterly vulnerability scans"
  profileFilter: [qualified]
  explanation: |
    QTSPs must perform vulnerability scans at least quarterly. This
    requirement appears in implementing acts for timestamps, validation,
    certificates, registered delivery, archiving, and remote QSCD.
  legalBasis:
    regulation: "2025/1929, 2025/1942, 2025/1943, 2025/1944, 2025/2532, 2025/1567"
    article: "Various Annexes"
    paragraph: "OVR/REQ network security clauses"
  legalText: |
    The vulnerability scan requested by REQ-7.8-13 of ETSI EN 319401
    shall be performed at least once per quarter.
  deadline: "2025-10-19"
  roles:
    - trust_service_provider
  useCases: all
```

**Key format notes:**
- `regulation`: Comma-separated list of ALL implementing acts containing this requirement
- `article`: Use "Various Annexes" when the requirement appears in ETSI adaptations across acts
- `paragraph`: Reference the common ETSI clause (e.g., "OVR/REQ network security clauses")

**Benefits of consolidation:**
1. Avoids 24+ duplicate requirements (4 consolidated vs 24 individual)
2. Single place to update if ETSI standard changes
3. Clear audit trail showing which acts require compliance

**When NOT to consolidate:**
- Requirements with different thresholds (e.g., 24h vs 48h notification)
- Requirements with different scopes (e.g., applies to different service types)
- Requirements with different legal effects (e.g., mandatory vs recommended)


### ID Conventions

| Role | Prefix | Example |
|------|--------|---------|
| relying_party | RP- | RP-REG-001, RP-AUTH-003 |
| wallet_provider | WP- | WP-CERT-001, WP-SEC-005 |
| issuer (EAA) | EAA- | EAA-QUAL-001, EAA-REQ-002 |
| pid_provider | PID- | PID-ISS-001, PID-REV-003 |
| trust_service_provider | TSP- | TSP-QUAL-001, TSP-AUD-002 |

### Category Options
- registration, technical, authentication, esignature, data-protection, security, operational

### Profile Filtering (Optional)

If a requirement only applies to specific profiles within a role, add `profileFilter`:

```yaml
- id: RP-PUB-001
  category: registration
  requirement: "Accept wallets from all Member States"
  profileFilter: [public_sector]  # Only for public sector RPs
  ...

- id: EAA-QUAL-001
  category: certification
  requirement: "Meet Annex V requirements"
  profileFilter: [qualified]  # Only for Qualified TSP issuers
  ...
```

**Profile IDs by Role:**

| Role | Profile IDs |
|------|------------|
| relying_party | `public_sector`, `private_sector` |
| issuer (EAA) | `qualified`, `non_qualified`, `public_authentic` |
| wallet_provider | `member_state`, `mandated`, `independent` |

**Rules:**
- Omit `profileFilter` if requirement applies to ALL profiles
- Use array format: `profileFilter: [profile_id]` or `profileFilter: [id1, id2]`
- When user selects a profile in UI, only matching requirements are shown

### Mutatis Mutandis Clause Detection

**⚠️ Search for "mutatis mutandis" clauses** — these cross-apply requirements from other articles.

Example from Article 5a(14):
> "If the European Digital Identity Wallet is provided by **private parties** [...], the provisions of **Article 45h(3)** shall apply *mutatis mutandis*."

This creates a **profile-specific requirement** (mandated/independent only) from a clause that isn't in the main wallet provider article!

**Audit procedure:**
```bash
# Search for mutatis mutandis in local regulation files
grep -i "mutatis mutandis" ~/dev/eIDAS20/01_regulation/**/*.md
```

For each match:
1. Identify which article's provisions are being applied
2. Read that referenced article
3. Determine if it creates new requirements for your target role
4. Check if it applies to all profiles or specific profiles only
5. Add requirements with appropriate `profileFilter` if needed

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

## Step 7: MANDATORY Completion Verification

**🚨 DO NOT SKIP THIS STEP. FAILURE TO RUN THIS = AUDIT IS INVALID.**

```bash
# Step 7a: Check for remaining ⬜ items (excludes legend row)
echo "=== Checking for unreviewed items ==="
UNREVIEWED=$(grep "| ⬜ |" docs-portal/config/rca/AUDIT_TRACKER_{ROLE}.md | grep -v "Not yet reviewed" | wc -l)
echo "Unreviewed items (⬜): $UNREVIEWED"

if [ "$UNREVIEWED" != "0" ]; then
  echo "❌ AUDIT INCOMPLETE: $UNREVIEWED items not reviewed!"
  grep "| ⬜ |" docs-portal/config/rca/AUDIT_TRACKER_{ROLE}.md | grep -v "Not yet reviewed"
  exit 1
fi

# Step 7b: Rebuild and verify
echo "=== Building RCA ==="
cd docs-portal && npm run build:rca

echo "✅ Audit verification complete"
```

**If the grep finds ANY ⬜ items:**
1. STOP
2. Go back and review those specific items
3. Mark them ✅ or ➖
4. Run verification again

---

## Anti-Patterns to Avoid

❌ **Never guess from titles** — Always read the actual article text

❌ **Never skip cross-reference** — Always check existing requirements first

❌ **Never forget recitals** — They provide informative context (bindingType: informative)

❌ **Never use generic names** — Files must include role: `AUDIT_TRACKER_RP.md` not `AUDIT_TRACKER.md`

❌ **Never leave ⬜ items** — Every article must be marked ✅ or ➖

❌ **Never claim completion without verification** — ALWAYS run the Step 7 grep check

❌ **Never skip articles "because they look similar"** — Read and verify each one individually

---

## Checklist Before Completion

**You MUST verify ALL of these before claiming an audit is complete:**

- [ ] `grep -c "⬜" AUDIT_TRACKER_{ROLE}.md` returns **0**
- [ ] Every regulation section has been individually reviewed
- [ ] Every article has been individually read (not just title)
- [ ] Every article is marked with ✅ or ➖ (NO ⬜ remaining)
- [ ] All recitals reviewed for context
- [ ] Gap analysis performed against existing YAML
- [ ] Schema version incremented
- [ ] `npm run build:rca` successful
- [ ] Final verification grep shows 0 unreviewed items

---

## Audit Completion Statement

When complete, the response MUST include:

```
AUDIT VERIFICATION:
- Unreviewed items (⬜): 0
- Total requirements: {N}
- Schema version: {V}
- Build status: ✅ Successful
```

**If you cannot provide this statement with "Unreviewed items: 0", the audit is NOT complete.**
