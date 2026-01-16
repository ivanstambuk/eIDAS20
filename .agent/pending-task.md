# Pending Tasks

> Last updated: 2026-01-17

## Citation System Enhancements

### 1. Cross-Link to Portal Documents (High Priority)
**Status:** Planned

Currently, all detected citations link to EUR-Lex. For documents **in our portal** (765/2008, 910/2014, 2024/1183, implementing acts), we should:
- Link to the portal instead of EUR-Lex
- Deep-link to specific articles if mentioned (e.g., "Article 3 of Regulation 910/2014" → `/regulation/910-2014?section=article-3`)

**Files to modify:**
- `docs-portal/scripts/build-citations.js` — Check if cited document exists in portal
- `docs-portal/scripts/build-content.js` — Generate portal links instead of EUR-Lex for internal docs

---

### 2. Recital Cross-References (Medium Priority)
**Status:** Planned

Detect references to recitals within articles:
- "as described in recital (42)"
- "see recital 15"
- "recitals (1) to (5)"

Create clickable links that scroll to that recital in the same document.

**Files to modify:**
- `docs-portal/scripts/build-citations.js` — Add recital pattern detection
- `docs-portal/scripts/build-content.js` — Transform to anchor links

---

### 3. Additional EU Legislative Patterns (Low Priority)
**Status:** Planned

Detect more EU legislative reference patterns:
- GDPR references: "Regulation (EU) 2016/679" or "the GDPR"
- Treaty articles: "Article 114 TFEU", "Article 16 TEU"
- Commission Decisions: "Commission Decision (EU) 2015/xxx"
- Framework Decisions (pre-Lisbon)

**Files to modify:**
- `docs-portal/scripts/build-citations.js` — Add new regex patterns
