# Legal Basis Article Preview Feature

**Created:** 2026-01-28  
**Status:** 🟡 In Progress

## Objective

Add truncated article text previews to Legal Basis popovers (matching ARF specification previews).

## Implementation Tracker

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Create article extraction script | ✅ | `scripts/extract-article-excerpts.js` |
| 2 | Generate `article-excerpts.json` | ✅ | 5,561 sections from 44 regulations |
| 3 | Create `useArticleExcerpts` hook | ✅ | `src/hooks/useArticleExcerpts.js` |
| 4 | Update `LegalBasisLink` component | ✅ | Added excerpt display in popover |
| 5 | Test & verify | ⬜ | Check VCQ and RCA popovers |

---

## Step 1: Create Article Extraction Script

**File:** `scripts/extract-article-excerpts.js`

**Logic:**
1. Read all `public/data/regulations/*.json` files
2. For each regulation, parse the `contentHtml` field
3. Extract text for each article/paragraph/annex section using DOM IDs
4. Truncate to ~300 chars with word boundary
5. Output to `public/data/article-excerpts.json`

**Output format:**
```json
{
  "2014-910": {
    "article-5b-para-5": {
      "title": "Article 5b(5)",
      "excerpt": "Member States shall provide at least one European Digital Identity Wallet..."
    }
  }
}
```

---

## Step 2: Generate `article-excerpts.json`

- Run the extraction script
- Verify output structure
- Add to npm scripts: `"extract-articles": "node scripts/extract-article-excerpts.js"`

---

## Step 3: Create `useArticleExcerpts` Hook

**File:** `src/hooks/useArticleExcerpts.js`

```javascript
// Fetch and cache article-excerpts.json
// Return: { getExcerpt(slug, sectionId) => { title, excerpt } | null }
```

---

## Step 4: Update `LegalBasisLink` Component

**File:** `src/components/LegalBasisLink/LegalBasisLink.jsx`

Changes:
1. Accept `articleExcerpts` prop (or use the hook)
2. In popover, after title/status, display:
   - Truncated article excerpt (if available)
   - "View full article →" link
3. Style to match ARF specification preview

---

## Step 5: Test & Verify

- [ ] VCQ: Legal Basis popovers show article excerpts
- [ ] RCA: Legal Basis popovers show article excerpts  
- [ ] Fallback: No excerpt → graceful degradation (just show link)
- [ ] Performance: No noticeable lag on hover

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `scripts/extract-article-excerpts.js` | Create |
| `public/data/article-excerpts.json` | Generate |
| `src/hooks/useArticleExcerpts.js` | Create |
| `src/components/LegalBasisLink/LegalBasisLink.jsx` | Modify |
| `src/pages/VendorQuestionnaire.jsx` | Modify (pass excerpts) |
| `src/pages/RegulatoryComplianceAssessment.jsx` | Modify (pass excerpts) |
| `package.json` | Add script |

---

## Design Reference

The ARF popover currently shows:
```
┌─────────────────────────────────────┐
│ OIA_01                              │
│ Topic: Presentation Protocols       │
├─────────────────────────────────────┤
│ A Wallet Unit SHALL support         │
│ [OpenID4VP] for remote...           │
│                                     │
│ → View full specification           │
└─────────────────────────────────────┘
```

Legal Basis popover should show:
```
┌─────────────────────────────────────┐
│ eIDAS 2.0 Article 5b(5)             │
│ Status: In Force ✓                  │
├─────────────────────────────────────┤
│ Member States shall provide at      │
│ least one European Digital...       │
│                                     │
│ → View full article                 │
└─────────────────────────────────────┘
```
