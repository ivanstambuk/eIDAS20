# VCQ Patterns and Reusable Components

> Patterns extracted from the Vendor Compliance Questionnaire implementation.

---

## SummaryView (Dashboard) Pattern

A dashboard card layout for displaying categorized statistics with criticality breakdown.

```jsx
function SummaryView({ requirements, categories, answers }) {
    // Calculate stats per category
    const categoryStats = useMemo(() => {
        const stats = {};
        categories.forEach(cat => {
            stats[cat.id] = {
                ...cat,
                total: 0,
                critical: 0,
                high: 0,
                answered: 0,
                compliant: 0,
                nonCompliant: 0
            };
        });

        requirements.forEach(req => {
            const cat = stats[req.category];
            if (!cat) return;
            cat.total++;
            if (req.criticality === 'critical') cat.critical++;
            if (req.criticality === 'high') cat.high++;
            
            const answer = answers[req.id]?.value;
            if (answer && answer !== 'pending') {
                cat.answered++;
                if (answer === 'yes') cat.compliant++;
                if (answer === 'no') cat.nonCompliant++;
            }
        });

        return Object.values(stats).filter(s => s.total > 0);
    }, [requirements, categories, answers]);

    // Render criticality cards + category cards with progress
    // ...
}
```

**CSS Classes:**
- `.vcq-criticality-summary` - Grid container for criticality cards
- `.vcq-crit-card.critical/high/medium/low` - Color-coded cards
- `.vcq-category-cards` - Grid for category cards
- `.vcq-category-card` - Individual category card with header/body
- `.vcq-progress-bar/.vcq-progress-fill` - Progress indicator

---

## SourceSelector (Grouped Checkboxes) Pattern

Multi-group checkbox selector for filtering by source/category.

```jsx
function SourceSelector({ legalSources, selectedSources, onToggle }) {
    // Group sources by their definition (primary/implementing/related/architecture)
    const groups = useMemo(() => {
        const grouped = {};
        legalSources.forEach(source => {
            const key = source.group || 'other';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(source);
        });
        return grouped;
    }, [legalSources]);

    return (
        <div className="vcq-sources-grid">
            {Object.entries(groups).map(([groupName, sources]) => (
                <div key={groupName} className="vcq-source-group">
                    <h4>{GroupLabels[groupName]}</h4>
                    {sources.map(source => (
                        <label key={source.id}>
                            <input 
                                type="checkbox"
                                checked={selectedSources.includes(source.id)}
                                onChange={() => onToggle(source.id)}
                            />
                            {source.label} ({source.id})
                        </label>
                    ))}
                </div>
            ))}
        </div>
    );
}
```

---

## View Toggle Pattern

Simple toggle between summary and detail views.

```jsx
const [activeView, setActiveView] = useState('summary'); // 'summary' or 'table'

// In render:
<div className="vcq-view-toggle">
    <button
        className={`vcq-view-btn ${activeView === 'summary' ? 'active' : ''}`}
        onClick={() => setActiveView('summary')}
    >
        📊 Overview
    </button>
    <button
        className={`vcq-view-btn ${activeView === 'table' ? 'active' : ''}`}
        onClick={() => setActiveView('table')}
    >
        📋 Details
    </button>
</div>

{activeView === 'summary' ? <SummaryView /> : <DetailsTable />}
```

**CSS:**
```css
.vcq-view-toggle {
    display: flex;
    gap: var(--space-2);
    padding: var(--space-1);
    background: var(--bg-tertiary);
    border-radius: var(--radius-lg);
    width: fit-content;
}

.vcq-view-btn.active {
    background: var(--bg-secondary);
    color: var(--accent-primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

---

## DORA Auto-Include Pattern

When a source selection implies additional requirements, auto-include them.

```jsx
const applicableRequirements = useMemo(() => {
    let filtered = [...coreRequirements];
    
    // If DORA is selected, auto-include ICT third-party requirements
    if (selectedSources.includes('2022/2554')) {
        const doraIctReqs = requirementsByType.dora_ict || [];
        doraIctReqs.forEach(reqId => {
            const req = allRequirements.find(r => r.id === reqId);
            if (req && !filtered.find(f => f.id === req.id)) {
                filtered.push(req);
            }
        });
    }
    
    return filtered;
}, [selectedSources, coreRequirements, allRequirements]);
```

---

## localStorage Persistence Pattern

Persist user answers/state across sessions.

```jsx
const [answers, setAnswers] = useState({});

// Load on mount
useEffect(() => {
    const saved = localStorage.getItem('vcq-answers');
    if (saved) {
        try {
            setAnswers(JSON.parse(saved));
        } catch (e) { /* ignore invalid JSON */ }
    }
}, []);

// Save on change
const handleAnswerChange = useCallback((reqId, value, notes) => {
    const newAnswers = {
        ...answers,
        [reqId]: { value, notes, timestamp: new Date().toISOString() }
    };
    setAnswers(newAnswers);
    localStorage.setItem('vcq-answers', JSON.stringify(newAnswers));
}, [answers]);
```

---

## YAML Array Shell Gotcha

When appending to YAML files via shell `cat >>`, you create **strings**, NOT arrays:

```bash
# ❌ WRONG — creates: hlr: "VCR_01, VCR_02" (a single string with comma)
cat >> file.yaml << EOF
  hlr: VCR_01, VCR_02
EOF

# ❌ ALSO WRONG — creates: hlr: "[VCR_01, VCR_02]" (string literal)
cat >> file.yaml << EOF
  hlr: [VCR_01, VCR_02]
EOF

# ✅ CORRECT — creates proper YAML array
cat >> file.yaml << EOF
  hlr:
    - VCR_01
    - VCR_02
EOF
```

**Why this matters:** Validators and build scripts expecting arrays will fail or produce incorrect data when given strings that look like arrays.

**Detection:** Run `npm run validate:vcq` to check for HLR format issues.

---

*Last updated: 2026-01-28*
