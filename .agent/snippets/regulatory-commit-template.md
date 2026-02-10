# Regulatory Content Commit Message Template

> Template for detailed commit messages when modifying regulatory compliance content (RCA, VCQ).

---

## Format

```
{type}: {summary}

{Body — batch/track details}:

{Sub-batch or individual items}:
- {REQ-ID}: {Article reference}, {brief change description}
- {REQ-ID}: {Article reference}, {brief change description}

Structural fixes:
- {field changes, schema fixes}

{Metrics section}:
{Track}: {count}/{total} complete ({percentage}%)
{Cumulative}: {overall count}/{overall total} ({percentage}%)
```

## Example

```
vcq: quality uplift for all 12 VEND-ICT requirements (Batch 5 complete)

Batch 5 — ict.yaml (12/12 requirements enhanced):
- ICT-001: DORA Article 30(2)(a)-(j) mandatory contract elements,
  eIDAS+DORA dual regime, three lines of defence
- ICT-002: Article 30(2)(e) audit rights, GDPR Art 28(3)(h) parallel,
  pooled auditing, supervisory authority access
...

Structural fixes:
- ICT-004/005/006/008/012: legalText added
- ICT-012: paragraph '' → '1'

Clarification questions: 108 total (9 per requirement, up from ~5-7)
ICT track: 12/12 complete (100%)
```

## Commit Type Prefixes

| Prefix | When to Use |
|--------|-------------|
| `vcq:` | VCQ requirement/question changes |
| `rca:` | RCA requirement changes |
| `feat:` | New portal features |
| `fix:` | Bug fixes |
| `docs:` | Documentation updates |
| `chore:` | Maintenance tasks |

## Key Principles

1. **List every requirement touched** — not just "bulk update"
2. **Reference specific Articles** — makes commit searchable
3. **Note structural fixes** — schema changes, field corrections
4. **Include metrics** — track completion percentages
5. **Separate logical changes** — one commit per batch/track

*Created: 2026-02-10 | Source: VCQ Audit Retrospective*
