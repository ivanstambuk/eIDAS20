# VCQ Clarification Question Template — 9-Question Standard

> Template for writing VCQ clarification questions to the established standard.

---

## Question YAML Structure

```yaml
  VEND-{TRACK}-{NNN}:
    questions:
      - id: Q1
        text: "{Primary compliance question — does the vendor meet the core requirement?}"
        dimension: compliance_completeness
      - id: Q2
        text: "{SLA/timeline question — what are the measurable commitments?}"
        dimension: sla
      - id: Q3
        text: "{Operational question — how is this implemented day-to-day?}"
        dimension: operational
      - id: Q4
        text: "{Evidence question — how can compliance be demonstrated?}"
        dimension: compliance_evidence
      - id: Q5
        text: "{Documentation question — what documentation supports this?}"
        dimension: documentation
      - id: Q6
        text: "{Interoperability question — how does this work across systems?}"
        dimension: interoperability
      - id: Q7
        text: "{Security question — what security measures protect this?}"
        dimension: security
      - id: Q8
        text: "{Lifecycle question — how is this maintained over time?}"
        dimension: lifecycle
      - id: Q9
        text: "{Commercial/experience question — cost model or track record?}"
        dimension: commercial
```

## Dimension Coverage

Each requirement should have 9 questions covering diverse dimensions. Not all questions need unique dimensions, but aim for at least 7 distinct dimensions per requirement.

### Core Dimensions (use for every requirement)

| Dimension | Focus | Example Question Stem |
|-----------|-------|----------------------|
| `compliance_completeness` | Full regulatory coverage | "Does your implementation cover all elements of Article X(Y)?" |
| `operational` | Day-to-day implementation | "How do you operationally handle...?" |
| `compliance_evidence` | Proof of compliance | "What certifications/reports can you provide?" |

### Security/Technical Dimensions

| Dimension | Focus | Example Question Stem |
|-----------|-------|----------------------|
| `security` | Security measures | "What security controls protect...?" |
| `interoperability` | Cross-system compat | "What standards/formats do you support?" |
| `architecture` | System design | "How is your infrastructure designed for...?" |
| `resilience` | Fault tolerance | "What happens when... fails?" |

### Business/Process Dimensions

| Dimension | Focus | Example Question Stem |
|-----------|-------|----------------------|
| `sla` | Service levels | "What SLA commitments do you offer?" |
| `commercial` | Cost model | "What is the pricing model for...?" |
| `experience` | Track record | "Have you implemented this for similar clients?" |
| `documentation` | Written artefacts | "What documentation do you provide?" |

### Governance/Compliance Dimensions

| Dimension | Focus | Example Question Stem |
|-----------|-------|----------------------|
| `compliance_monitoring` | Ongoing checks | "How frequently do you verify...?" |
| `governance` | Internal governance | "What governance structure oversees...?" |
| `regulatory_access` | Authority access | "Can supervisory authorities access...?" |
| `incident_response` | Incident handling | "What is your process when... occurs?" |

### Lifecycle/Supply Chain Dimensions

| Dimension | Focus | Example Question Stem |
|-----------|-------|----------------------|
| `lifecycle` | Ongoing maintenance | "How do you handle updates/changes?" |
| `supply_chain` | Subcontractors | "Do you use subcontractors for...?" |
| `flexibility` | Adaptability | "Can this be customised for...?" |
| `roadmap` | Future plans | "How are you preparing for...?" |

## Quality Checklist

- [ ] Exactly 9 questions per requirement
- [ ] Each question references a specific article, standard, or HLR
- [ ] At least 7 distinct dimensions across the 9 questions
- [ ] Questions include concrete parameters (timelines, counts, formats)
- [ ] No generic yes/no questions — all require substantive answers
- [ ] Questions probe deeper than the requirement explanation itself

*Created: 2026-02-10 | Source: VCQ Audit Retrospective*
