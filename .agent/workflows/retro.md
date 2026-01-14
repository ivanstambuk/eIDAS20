---
description: Conduct a structured retrospective to identify improvements
---

# Retrospective Workflow

**⚠️ ULTRATHINK MODE**: Before starting, engage deep thinking. Consider non-obvious patterns, second-order effects, and what would prevent future time waste.

Use this workflow when:
- The user says `/retro` or "retrospective"
- You've spent significant time (>15 min) on a task that could have been faster
- Multiple iterations were needed to fix something
- At the end of a long session

---

## Step 1: Identify Friction Points

Review the session and identify what caused delays:

```markdown
## Friction Points Identified

| Issue | Time Lost | Root Cause |
|-------|-----------|------------|
| [e.g., Line ending issues after WSL migration] | ~5 min | Missing .gitattributes |
| [e.g., Wrong port for browser agent] | ~3 min | Not checking TRACKER |
```

---

## Step 2: Generate Improvements

For each friction point, propose a solution:

```markdown
## Process Improvements

### 🔴 Priority 1: High Impact, Easy to Implement

#### 1. [Improvement Name]
**Problem**: [What went wrong]
**Solution**: [Specific fix]
**Files to Change**: [List of files]
**Effort**: [5 min / 15 min / 30 min]

### 🟡 Priority 2: Medium Impact

#### 2. [Improvement Name]
...
```

---

## Step 2.5: eIDAS Portal-Specific Improvements

Identify issues with:
- **Portal UI** (React components, styling, navigation)
- **Build scripts** (content processing, markdown→JSON)
- **Converter** (Formex XML → Markdown)
- **Linter** (validation rules)
- **Browser testing** (WSL → Windows, Chrome CDP)

```markdown
## Portal Improvements

| Component | Issue | Fix |
|-----------|-------|-----|
| `RegulationViewer.jsx` | No content loading | Create build-time processor |
| `index.css` | Missing utility class | Add to CSS file |
```

---

## Step 2.6: Snippet/Pattern Extraction

Identify patterns created during this session that should be saved for reuse.

**Criteria for extraction** (must meet at least one):
- Took >1 attempt to create correctly
- Used 2+ times in this session
- Complex enough that you'd have to think about it again
- Any convention or pattern worth documenting

```markdown
## Snippets to Extract

| Snippet | Category | Destination |
|---------|----------|-------------|
| [Markdown rendering pattern] | React | .agent/snippets/react-patterns.md |
| [Formex conversion rule] | Python | Update test_formex_converter.py |
```

---

## Step 2.7: Documentation Improvements

Identify improvements to project documentation:

**Where to document:**
- `AGENTS.md` — Project rules, conventions, gotchas
- `TRACKER.md` — Phase progress, next actions
- `.agent/workflows/` — Process improvements
- `.agent/snippets/` — Code patterns (create if needed)

```markdown
## Documentation Improvements

| Improvement | Where | Effort |
|-------------|-------|--------|
| Add converter rule | AGENTS.md | 5 min |
| Update port reference | TRACKER.md | 2 min |
```

---

## Step 2.8: Future Session Learnings

**Key question:** "If a future agent encounters a similar situation, what documentation would instantly clarify it?"

Categories to consider:
1. **Non-Obvious Behaviors** — Things that work differently than expected
2. **Debugging Patterns** — How issues were diagnosed
3. **Code Comments** — Add ⚠️ warnings in source files

```markdown
## Future Session Learnings

| Learning | Type | Where to Document |
|----------|------|-------------------|
| [e.g., WSL uses port 5173, not 5174] | Environment | AGENTS.md |
| [e.g., Formex dates need special handling] | Converter | tests + docs |

**Documentation actions:**
- [ ] Update AGENTS.md
- [ ] Add test case if applicable
- [ ] Add code comment with ⚠️
```

---

## Step 3: Quick Wins Summary

Create a table sorted by effort/impact ratio:

```markdown
## Quick Wins for Next Session

| Action | Type | Effort | Impact | Priority |
|--------|------|--------|--------|----------|
| [Add CSS utility] | Style | 2 min | Better DX | 🔴 Do Now |
| [Update docs] | Docs | 5 min | Clarity | 🔴 Do Now |
```

---

## Step 4: Propose Changes

**CRITICAL RULES:**
1. **Offer ALL identified items**
2. **Primary option is "implement ALL now"**
3. **NO BACKLOG for small items** — Either implement now or skip

```markdown
## Proposed Actions

I've identified [N] improvements:

**From Process Improvements:**
1. **[Item]** - [description] (~X min)

**From Portal-Specific:**
2. **[Item]** - [description] (~X min)

**From Documentation:**
3. **[Item]** - [description] (~X min)

**Total estimated time**: ~X minutes

Would you like me to:
- [ ] **Implement ALL now** (recommended)
- [ ] Skip all
- [ ] Specific items only: [list numbers]
```

---

## Step 5: Implement Everything

When implementing, actually write the code. Do NOT just add tasks to a tracker.

Update relevant files:
- `.agent/workflows/` — Process improvements
- `.agent/snippets/` — Add code patterns
- `AGENTS.md` — Add rules, conventions
- `TRACKER.md` — Update progress
- `docs-portal/src/**` — Portal fixes

---

## Step 6: Commit All Changes

**CRITICAL**: After implementing improvements, ALWAYS commit.

```bash
git add -A && git status
git commit -m "fix: [main fix description]

Retro improvements:
- [list improvements implemented]"
```

---

## Categories to Check (eIDAS-Specific)

### Portal UI
- [ ] Component rendering issues
- [ ] Styling problems
- [ ] Navigation/routing issues
- [ ] Responsive design

### Build/Content Processing
- [ ] Markdown processing errors
- [ ] JSON generation issues
- [ ] Missing content

### Formex Converter
- [ ] XML parsing issues
- [ ] Formatting problems
- [ ] Missing test coverage

### Browser Testing
- [ ] Chrome CDP connection issues
- [ ] Wrong port usage
- [ ] Tab accumulation

### Documentation
- [ ] TRACKER.md up to date?
- [ ] AGENTS.md complete?
- [ ] Phase tasks accurately tracked?
