---
description: Systematic audit and quality uplift of VCQ requirement explanations and clarification questions
---

# VCQ Audit Workflow

Use this workflow when conducting systematic quality reviews of VCQ requirement YAML files.

---

## Prerequisites

1. Read the VCQ audit tracker: `.agent/session/vcq-audit-tracker.md`
2. Identify the next batch to process
3. Load the HLR quick-reference index: `.agent/session/hlr-index-by-track.md`

---

## Step 1: Load Source Files

For each batch, load:

```
docs-portal/config/vcq/requirements/{track}.yaml       # Explanations
docs-portal/config/vcq/clarification-questions/{track}.yaml  # Questions
```

Also load:
- The relevant HLR CSV data (via grep or the HLR index file)
- The relevant implementing act articles (if referenced in legalBasis)
- The tracker to see which requirements are pending

---

## Step 2: Enhance Requirements

For each requirement, apply the **Exemplar Standard**:

### Explanation Enhancement
1. **Multi-paragraph structure** — Break the explanation into logical sections with bold headers
2. **Article-specific detail** — Reference the exact article and paragraph numbers
3. **HLR integration** — Cross-reference ARF HLRs where `arfReference` exists
4. **Practical guidance** — Include implementation-relevant context
5. **Structural fixes** — Fix empty `paragraph: ""` fields, add missing `legalText`

### Clarification Question Enhancement
1. **9 questions per requirement** — The standard count
2. **Diverse dimensions** — Each question covers a different assessment dimension
3. **Article references** — Questions reference specific legal provisions
4. **Concrete parameters** — Include measurable/verifiable criteria
5. **Deeper dimensions** — Go beyond surface-level compliance

---

## Step 3: Write Enhanced Files

**Full-file overwrite is preferred** for files under ~500 lines where >50% of content changes. This is faster and less error-prone than surgical edits for bulk enhancements.

Process: 
1. Write the enhanced `requirements/{track}.yaml` (full overwrite)
2. Write the enhanced `clarification-questions/{track}.yaml` (full overwrite)

**Throughput note:** Processing entire batches (up to 19 requirements) in a single write is viable when the pattern is well-understood. Sub-batching is unnecessary for files under 1000 lines.

---

## Step 4: Update Tracker

Update `.agent/session/vcq-audit-tracker.md`:

1. Mark each requirement as `✅ ENHANCED` with detailed findings
2. Update the summary statistics (requirements audited count)
3. Use the row template from `.agent/snippets/vcq-tracker-row-template.md`

---

## Step 5: Commit

```bash
cd /home/ivan/dev/eIDAS20 && \
git add docs-portal/config/vcq/requirements/{track}.yaml \
        docs-portal/config/vcq/clarification-questions/{track}.yaml && \
git commit -m "vcq: quality uplift for VEND-{TRACK} requirements (Batch N)

Batch N — {track}.yaml ({count}/{count} requirements enhanced):
- {REQ-ID}: {brief description of enhancement}
...

Clarification questions: {N} total (9 per requirement, up from ~{M})
{Track} track: {count}/{count} complete (100%)" && \
git push
```

---

## Schema Notes

### Dual legalBasis Syntax
`legalBasis` can be a single object OR an array:

```yaml
# Single legal basis
legalBasis:
  regulation: 2022/2554
  article: Article 30
  paragraph: "2"

# Multiple legal bases (array)
legalBasis:
  - regulation: 2022/2554
    article: Article 30
    paragraph: "2(e)"
  - regulation: 2016/679
    article: Article 28
    paragraph: "3(h)"
```

### HLR CSV Delimiter
The HLR CSV uses `;` as delimiter. Grep for `;HLR_ID;` for exact matches.

---

*Created: 2026-02-10 | Source: VCQ Audit Retrospective*
