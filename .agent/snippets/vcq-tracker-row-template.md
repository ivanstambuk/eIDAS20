# VCQ Tracker Row Template

> Template for writing audit tracker findings rows after enhancing VCQ requirements.

---

## Row Format

```markdown
| VEND-{TRACK}-{NNN} | ✅ ENHANCED | {Description of changes}. {Structural fixes if any}. {N} Qs (up from {M}): {dimensions added}. |
```

## Example Row

```markdown
| VEND-TSP-001 | ✅ ENHANCED | Multi-paragraph rewrite: Article 21 qualification process (5-step), trust service scope (6 service types), Trusted List/LOTL inclusion. **Structural fix**: paragraph `""` → `"2"`. 9 Qs (up from 5): added compliance_monitoring (Trusted List), regulatory_access (supervisory body), lifecycle (renewal). |
```

## Components

### 1. Description of Changes
Pattern: `Multi-paragraph rewrite: {Article X} {topic summary} ({N} {items}), {second topic}, {third topic}.`

### 2. Structural Fixes (if any)
Pattern: `**Structural fix**: {field} \`{old}\` → \`{new}\`.` or `**legalText added.**`

### 3. Question Enhancement
Pattern: `{N} Qs (up from {M}): added {dimension1} ({topic}), {dimension2} ({topic}).`

## Standard Dimensions Checklist

Ensure each requirement's 9 questions cover diverse dimensions:
- `compliance_completeness` — Full regulatory coverage
- `compliance_monitoring` — Ongoing verification
- `compliance_evidence` — Proof of compliance
- `operational` — Day-to-day operations
- `security` — Security measures
- `sla` — Service level agreements
- `documentation` — Documentation requirements
- `interoperability` — Cross-system compatibility
- `incident_response` — Incident handling
- `commercial` — Cost and commercial terms
- `flexibility` — Adaptability and customisation
- `lifecycle` — Ongoing maintenance and updates
- `supply_chain` — Subcontractor management
- `governance` — Internal governance structure
- `regulatory_access` — Supervisory authority access
- `experience` — Track record and references
- `roadmap` — Future compliance planning

*Created: 2026-02-10 | Source: VCQ Audit Retrospective*
