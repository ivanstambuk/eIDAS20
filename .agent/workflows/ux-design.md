---
description: UX design clarification checklist before generating mockups
---

# UX Design Clarification Checklist

Use this workflow when designing new UI components or generating mockups.

## Before Generating Mockups

Ask/verify these questions for EACH interactive element:

### 1. Selection Patterns

| Question | Options |
|----------|---------|
| How many items can be selected? | Single (radio/toggle) vs Multi (checkboxes) |
| Is there an "All" option? | Explicit checkbox vs Empty = all |
| What's the default state? | None selected / First selected / All selected |

### 2. Hierarchical Relationships

| Question | Impact |
|----------|--------|
| Is this a global filter or per-item configuration? | Global = parent container, Per-item = inline in card |
| Does selection in A affect options in B? | Need to handle cascading state |
| Can items be configured independently? | Affects data model (Map vs Array) |

### 3. Element Ordering

| Principle | Example |
|-----------|---------|
| Labels/headings come BEFORE interactive elements | "Select Role" heading → then role cards |
| Instructions come BEFORE the input they describe | Hint text → then chips/buttons |
| Summary comes AFTER selections | Checkboxes → then "X selected" |

### 4. Visual Patterns

| Pattern | When to Use |
|---------|-------------|
| Cards with checkboxes | Multi-select with rich descriptions |
| Radio cards | Single-select with descriptions |
| Pill chips | Tag-style filtering, toggleable |
| Inline expansion | Per-item configuration after parent selection |
| Separate panel | Bulk configuration for multiple items |

## Common Mistakes to Avoid

❌ Using toggles for multi-select (toggles imply single choice)
❌ Putting headings inside child components when siblings render first
❌ Using `auto-fill` grid when exact column count matters
❌ Showing per-item config UI before item is selected

## Mockup Iteration

After first mockup, verify:
1. Does selection behavior match expected pattern?
2. Are elements in correct reading order?
3. Does the layout handle edge cases (0 selected, all selected)?
