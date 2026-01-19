# RCA Configuration

This directory contains the configuration for the **Regulatory Compliance Analyzer (RCA)** feature.

## Directory Structure

```
config/rca/
├── README.md                    # This file
├── AUDIT_TRACKER_RP.md          # Audit tracker for Relying Party role
├── AUDIT_TRACKER_WP.md          # Audit tracker for Wallet Provider role (future)
├── AUDIT_TRACKER_TSP.md         # Audit tracker for TSP role (future)
└── requirements/
    ├── relying-party.yaml       # RP requirements (active)
    ├── wallet-provider.yaml     # WP requirements (future)
    └── trust-service-provider.yaml  # TSP requirements (future)
```

## File Naming Conventions

### Audit Trackers

**Pattern**: `AUDIT_TRACKER_{ROLE}.md`

| Role | Filename |
|------|----------|
| Relying Party | `AUDIT_TRACKER_RP.md` |
| Wallet Provider | `AUDIT_TRACKER_WP.md` |
| Trust Service Provider | `AUDIT_TRACKER_TSP.md` |
| PID Provider | `AUDIT_TRACKER_PID.md` |
| EAA Issuer | `AUDIT_TRACKER_EAA.md` |
| Conformity Assessment Body | `AUDIT_TRACKER_CAB.md` |

### Requirements Files

**Pattern**: `{role-name}.yaml` (lowercase with hyphens)

| Role | Filename |
|------|----------|
| Relying Party | `relying-party.yaml` |
| Wallet Provider | `wallet-provider.yaml` |
| Trust Service Provider | `trust-service-provider.yaml` |
| PID Provider | `pid-provider.yaml` |

## Adding a New Role

1. **Create requirements file**: `requirements/{role-name}.yaml`
2. **Create audit tracker**: `AUDIT_TRACKER_{ROLE}.md`
3. **Run audit workflow**: `/rca-audit` and specify the role
4. **Update build script** if needed (auto-discovers YAML files)
5. **Test**: `npm run build:rca`

## Requirement ID Conventions

| Role | Prefix | Examples |
|------|--------|----------|
| Relying Party | `RP-` | RP-REG-001, RP-AUTH-003 |
| Wallet Provider | `WP-` | WP-CERT-001, WP-SEC-005 |
| Trust Service Provider | `TSP-` | TSP-QUAL-001, TSP-AUD-002 |
| PID Provider | `PID-` | PID-ISSUE-001 |
| EAA Issuer | `EAA-` | EAA-ATTR-001 |
| Conformity Assessment Body | `CAB-` | CAB-AUDIT-001 |

## Categories

Shared across all roles:
- `registration` — Registration & Authorization
- `technical` — Technical Requirements
- `authentication` — Authentication & Verification
- `esignature` — eSignature & Trust Services
- `data-protection` — Data Protection & Privacy
- `security` — Security
- `operational` — Operational Requirements

## Build Command

```bash
cd docs-portal
npm run build:rca
```

This loads all `.yaml` files from `requirements/` and generates `public/data/rca-data.json`.
