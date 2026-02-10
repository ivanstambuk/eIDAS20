# VCQ Requirement Template — Exemplar Standard

> Template for writing VCQ requirements to the established quality standard.

---

## Requirement YAML Structure

```yaml
  - id: VEND-{TRACK}-{NNN}
    category: {one of 13 valid categories}
    requirement: {One-line summary of the obligation}
    explanation: |
      {Opening sentence — what this requirement demands
      from the vendor, with the legal context.}

      **{Article X(Y) — Section Header}:**
      {Quote or close paraphrase of the legal provision.
      Break down numbered/lettered sub-requirements:}
      (a) {first element}
      (b) {second element}
      (c) {third element}

      **{Second topic or practical implementation}:**
      {Implementation guidance — what this means in
      practice for the vendor. Reference specific
      standards (ISO 27001, SOC 2, ETSI EN 319 XXX)
      or technical specifications (OID4VP, SD-JWT VC).}

      **{Third topic — cross-references or scope}:**
      {Cross-references to other requirements in the
      same track (see VEND-{TRACK}-{NNN}), to ARF HLRs,
      or to parallel regulatory frameworks (GDPR, DORA).}
    legalBasis:
      regulation: YYYY/NNNN
      article: Article NN
      paragraph: "N"
    legalText: |
      {Direct quote from the legal source, formatted for
      readability. Include enough context for the reader
      to understand the obligation without looking up
      the source.}
    roles:
      - relying_party
      - issuer
    productCategories: []
    scope: extended
    deadline: "YYYY-MM-DD"
    obligation: MUST  # MUST | MUST NOT | SHOULD | MAY
```

## Quality Checklist

- [ ] Multi-paragraph explanation with bold section headers
- [ ] Specific article + paragraph referenced (not just article)
- [ ] legalText field populated with direct quote
- [ ] paragraph field is never empty string `""`
- [ ] Cross-references to related requirements in same track
- [ ] Practical implementation guidance (not just legal text restatement)
- [ ] Obligation derived from modal verb (shall→MUST, should→SHOULD, may→MAY)

## Common Structural Fixes During Audit

| Fix | Before | After |
|-----|--------|-------|
| Empty paragraph | `paragraph: ""` | `paragraph: "2"` |
| Missing legalText | (field absent) | `legalText: \|` with direct quote |
| Wrong obligation | `obligation: SHOULD` (when article says "shall") | `obligation: MUST` |
| Missing roles | `roles: []` | `roles: [relying_party, issuer]` |

*Created: 2026-02-10 | Source: VCQ Audit Retrospective*
