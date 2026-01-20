# Multi-Role RCA Design - Implementation Plan

## Approved Design: Design A (Rich Cards with Inline Expansion)

**Date:** 2026-01-20
**Status:** Approved by user

## UX Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  Regulatory Compliance Assessment                                   │
│  Generate a compliance checklist based on your roles and use cases. │
└─────────────────────────────────────────────────────────────────────┘

┌─ Section 1: Select Your Role(s) ────────────────────────────────────┐
│                                                                      │
│  ☑ 🏛️ Relying Party                    ☐ 📱 Wallet Provider        │
│  Entity accepting credentials           Entity providing wallet app  │
│  ├── ☑ Public Sector                                                │
│  └── ☑ Private Sector                                               │
│                                                                      │
│  ☑ 📜 EAA Issuer                       ☐ 🔐 TSP                     │
│  Issues electronic attestations         Trust service provider       │
│  └── ☑ QTSP  ☐ Public  ☐ Non-QTSP                                   │
│                                                                      │
│  ☐ 🏦 PID Provider                     ☐ 🔍 CAB                     │
│  ☐ ⚖️ Supervisory Body                                              │
└─────────────────────────────────────────────────────────────────────┘

┌─ Section 2: Select Use Case ────────────────────────────────────────┐
│                                                                      │
│  (All)  Banking  Healthcare  Travel  Education  Consumer  Legal     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─ Summary ───────────────────────────────────────────────────────────┐
│  2 roles · 3 profiles selected                    133 requirements  │
│                                                                      │
│                               [ View Requirements → ]                │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Model Changes

### Before (Single Role)
```typescript
// State
selectedRole: string;                    // Single role ID
selectedProfiles: string[];              // Profiles for that role
selectedUseCases: string[];              // Global use cases

// Example
selectedRole: 'relying_party'
selectedProfiles: ['public_sector', 'private_sector']
```

### After (Multi-Role)
```typescript
// State
roleConfigurations: Map<string, string[]>;  // roleId -> profileIds[]
selectedUseCases: string[];                 // Global use cases (unchanged)

// Example
roleConfigurations: {
  'relying_party': ['public_sector', 'private_sector'],
  'issuer': ['qtsp']
}
```

## Component Changes

### 1. RoleSelector → MultiRoleSelector

**Before:** Radio buttons, single selection
**After:** Checkboxes, multi-selection with inline profile expansion

```jsx
function MultiRoleSelector({ roles, roleConfigurations, onToggleRole, onToggleProfile }) {
  return (
    <div className="rca-role-selector">
      <h3>Select Your Role(s)</h3>
      <div className="rca-role-grid">
        {roles.map(role => {
          const isSelected = roleConfigurations.has(role.id);
          const profiles = roleConfigurations.get(role.id) || [];
          
          return (
            <div 
              key={role.id} 
              className={`rca-role-card ${isSelected ? 'selected' : ''}`}
            >
              <label className="rca-role-header">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleRole(role.id)}
                />
                <span className="rca-role-icon">{role.icon}</span>
                <span className="rca-role-label">{role.label}</span>
              </label>
              <p className="rca-role-desc">{role.description}</p>
              
              {isSelected && role.profiles?.length > 0 && (
                <div className="rca-role-profiles">
                  {role.profiles.map(profile => (
                    <label key={profile.id} className="rca-profile-checkbox">
                      <input
                        type="checkbox"
                        checked={profiles.includes(profile.id)}
                        onChange={() => onToggleProfile(role.id, profile.id)}
                      />
                      <span>{profile.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 2. ProfileSelector → REMOVED (integrated into role cards)

### 3. UseCaseSelector → UseCasePills (simplified)

**Before:** Collapsible category cards with detailed selection
**After:** Simple pill chips for domain filtering

```jsx
function UseCasePills({ useCases, selectedUseCases, onToggle }) {
  // Get unique categories/domains
  const domains = [...new Set(useCases.map(uc => uc.category))];
  
  return (
    <div className="rca-usecase-pills">
      <h3>Select Use Case</h3>
      <div className="rca-pill-row">
        <button
          className={`rca-pill ${selectedUseCases.length === 0 ? 'active' : ''}`}
          onClick={() => onToggle('all')}
        >
          All
        </button>
        {domains.map(domain => (
          <button
            key={domain}
            className={`rca-pill ${selectedUseCases.includes(domain) ? 'active' : ''}`}
            onClick={() => onToggle(domain)}
          >
            {domain}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 4. Requirement Aggregation (applicableRequirements)

```typescript
const applicableRequirements = useMemo(() => {
  if (!data || roleConfigurations.size === 0) return [];
  
  const reqMap = new Map(); // reqId -> { ...req, sourceRoles: [] }
  
  // For each selected role + profiles
  for (const [roleId, profiles] of roleConfigurations) {
    const index = data.requirementIndex[roleId];
    if (!index) continue;
    
    // Get all requirements for this role's use cases
    const reqIds = new Set();
    for (const ucId of selectedUseCases.length > 0 ? selectedUseCases : Object.keys(data.useCases)) {
      const reqs = index[ucId];
      if (reqs) reqs.forEach(id => reqIds.add(id));
    }
    
    // Add requirements with profile filtering
    for (const req of data.requirements) {
      if (!reqIds.has(req.id)) continue;
      
      // Profile filter check
      if (profiles.length > 0 && req.profileFilter) {
        if (!req.profileFilter.some(pf => profiles.includes(pf))) continue;
      }
      
      // Add or update in map
      if (reqMap.has(req.id)) {
        reqMap.get(req.id).sourceRoles.push(roleId);
      } else {
        reqMap.set(req.id, { ...req, sourceRoles: [roleId] });
      }
    }
  }
  
  return Array.from(reqMap.values());
}, [data, roleConfigurations, selectedUseCases]);
```

## CSS Changes

### New/Modified Classes

```css
/* Role card grid */
.rca-role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

/* Role card with checkbox */
.rca-role-card {
  position: relative;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.rca-role-card.selected {
  border-color: #22d3ee;
  background: rgba(34, 211, 238, 0.08);
}

/* Profile checkboxes inside card */
.rca-role-profiles {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Use case pills */
.rca-pill {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.rca-pill.active {
  background: rgba(34, 211, 238, 0.2);
  border-color: #22d3ee;
  color: #22d3ee;
}
```

## Migration Checklist

- [ ] Create new `roleConfigurations` state (Map<string, string[]>)
- [ ] Replace `RoleSelector` with `MultiRoleSelector`
- [ ] Remove standalone `ProfileSelector`
- [ ] Update `applicableRequirements` memo for multi-role aggregation
- [ ] Add `sourceRoles` to requirement display (optional badges)
- [ ] Simplify use case selection to pill chips
- [ ] Update summary bar to show "X roles · Y profiles · Z requirements"
- [ ] Update localStorage save/load for new state shape
- [ ] Update export functions for multi-role context
- [ ] Add CSS for new card layout and animations
