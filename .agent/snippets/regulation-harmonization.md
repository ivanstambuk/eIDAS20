# Regulation Harmonization Reference

**Purpose:** Agent reference for harmonizing non-Formex regulations to match eIDAS format.

**When to use:** When importing regulations from HTML sources that don't match the canonical eIDAS style.

---

## Quick Reference Commands

### 1. Add Recitals Header and Convert to Bullet List

```bash
# Add ## Recitals header after "Whereas:"
sed -i 's/^Whereas:$/Whereas:\n\n## Recitals/' DOCUMENT.md

# Convert recitals from (N) to - (N) bullet format
sed -i 's/^(\([0-9]\+\)) /- (\1) /' DOCUMENT.md
```

### 2. Split Article Headings

```bash
# Convert "### Article N — Title" to "### Article N\n\n**Title**"
sed -i 's/^### Article \([0-9]*\) — \(.*\)$/### Article \1\n\n**\2**/' DOCUMENT.md
```

### 3. Convert Chapter Headings to Roman Numeral Format

```bash
# Each chapter must be done individually (titles vary)
sed -i 's/^## CHAPTER I — GENERAL PROVISIONS$/## I. General Provisions/' DOCUMENT.md
sed -i 's/^## CHAPTER II — ACCREDITATION$/## II. Accreditation/' DOCUMENT.md
# ... etc for each chapter
```

### 4. Italicize Formal Introduction

```bash
# "Having regard to..." lines should be italicized
# Must be done manually or with careful regex matching context
```

---

## Checklist (from DEC-044)

Before considering a regulation harmonized, verify:

- [ ] Metadata blockquote at top (CELEX, Source, OJ, ELI)
- [ ] EEA relevance in metadata (not inline)
- [ ] `## Preamble` header before formal introduction
- [ ] "Having regard to..." lines are *italicized*
- [ ] "Whereas:" on its own line before recitals
- [ ] `## Recitals` header after "Whereas:"
- [ ] Recitals as bullet list: `- (1) ...`, `- (2) ...`
- [ ] `HAVE ADOPTED THIS REGULATION:` before enacting terms
- [ ] `## Enacting Terms` header before Article 1
- [ ] Chapter headings: `## I. Title` (Roman numeral, Title Case)
- [ ] Article headings: `### Article N` (number only, no title)
- [ ] Article titles: bold subtitle on separate line: `**Title**`
- [ ] No horizontal rules (`---`) in document body
- [ ] No "Source Reference" section (metadata in header only)

---

## CollapsibleTOC Chapter Structure

After harmonizing the markdown, add chapter structure to `CollapsibleTOC.jsx`:

```javascript
// In EIDAS_CHAPTERS object, add:
'XXX-YYYY': [
    {
        id: 'i-chapter-title',  // kebab-case of title
        title: 'I. Chapter Title',
        articles: ['article-1', 'article-2', ...]
    },
    // ... more chapters
]
```

**Important:** The chapter `id` must match the slugified heading from the markdown.

---

## documents.yaml Entry

For manually harmonized documents, set `source: "manual"`:

```yaml
- celex: 0YYYYRXXXX-YYYYMMDD
  title: "Full Regulation Title"
  shortTitle: "Short Name"
  type: regulation
  source: manual  # Prevents automated regeneration
  output_dir: 01_regulation/XXX_YYYY_Folder_Name
```

---

## Related Decisions

- **DEC-044:** Regulation Document Style Guide
- **DEC-045:** Consolidated Regulations Contain Only In-Force Content
