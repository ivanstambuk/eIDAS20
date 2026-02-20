---
description: Import a new regulation from EUR-Lex into the documentation portal
---

# Regulation Import Workflow

Use this workflow when importing a new regulation or directive into the portal.

---

## Phase 1: Source Analysis

### Step 1.1: Check Consolidated Version
```bash
# Open EUR-Lex and search for the consolidated CELEX
# Format: 0YYYYRNNNN-YYYYMMDD (e.g., 02019R0881-20250204)
```

- If consolidated Formex available → Use it directly
- If consolidated HTML only → Check if HTML converter handles structure
- If neither → Plan to use base CELEX with manual amendments

### Step 1.2: Check for Amendments
Search for amending regulations:
- Go to EUR-Lex document page
- Check "Document information" → "Relation between documents"
- Note any M1, M2, etc. amendments and their effective dates

### Step 1.3: Check for Corrigenda
Search for corrigenda (corrections):
- Format: R(01), R(02), etc.
- Check if English language versions exist
- Note specific article/paragraph changes

---

## Phase 2: Document Configuration

### Step 2.1: Add to documents.yaml

**For EUR-Lex regulation imports:**
```yaml
- celex: <consolidated_celex>          # For EUR-Lex link display
  title: <full_title>
  shortTitle: <short_name> (Consolidated)
  sidebarTitle: <short_name>
  sidebarOrder: <N>                    # Optional: override sidebar position (lower = higher)
  legalType: regulation | directive
  category: referenced | primary | implementing_act
  source: formex                        # Will change to manual after import
  cellar_id: <cellar_uuid>             # From base CELEX ZIP URL
  output_dir: 01_regulation/<year>_<number>_<name>
```

**For Confluence/FAQ imports (source: manual):**
```yaml
- id: <slug-id>
  title: <full_title>
  shortTitle: <short_name>
  sidebarTitle: <sidebar_name>
  sidebarOrder: <N>
  legalType: faq
  category: supplementary
  source: manual
  external_url: <confluence_page_url>
  history_url: <confluence_history_url>  # viewpreviousversions.action?pageId=<ID>
  snapshot_date: "<YYYY-MM-DD>"          # Date content was captured
  source_version: "<N>"                  # ⚠️ MUST be verified — see Step 2.3
  output_dir: 01_regulation/<id_with_underscores>
```

### Step 2.2: Get Cellar ID (EUR-Lex only)
```bash
# The cellar_id is in the Formex ZIP download URL:
# http://publications.europa.eu/resource/cellar/<CELLAR_ID>
# Extract from EUR-Lex Formex download link
```

### Step 2.3: Verify source_version (Confluence imports only)

**⚠️ CRITICAL:** Do NOT guess the version number. Navigate to the page history URL in a browser:
```
https://ec.europa.eu/digital-building-blocks/sites/pages/viewpreviousversions.action?pageId=<PAGE_ID>
```

The table shows `CURRENT (v. N)` at the top. Record this exact number as `source_version`. If the snapshot was taken on a previous date, find the version row whose `Published` date is **at or before** the snapshot date.


---

## Phase 3: Import Execution

### Step 3.1: Run Formex Import
```bash
cd ~/dev/eIDAS20/scripts
python eurlex_formex.py <base_celex>
```

### Step 3.2: Rename Output
```bash
# If output filename doesn't match expected pattern:
mv 01_regulation/<dir>/<celex>.md 01_regulation/<dir>/regulation.md
```

### Step 3.3: Apply Corrigenda (if any)
Manually edit markdown for each corrigendum:
- Search for affected article/paragraph
- Apply exact text change
- Document in `.agent/docs/pitfalls/amendment-gaps.md`

### Step 3.4: Merge Preamble (if consolidated lacks it)

**EUR-Lex consolidated versions often omit preamble and recitals.** If so:

1. **Check if Preamble/Recitals exist** in consolidated output
2. If missing, **import base version** separately:
   ```bash
   python scripts/eurlex_html_to_md.py <base_celex> /tmp/base_version
   ```
3. **Extract preamble + recitals** from base version (lines from `## Preamble` to `## Enacting Terms`)
4. **Merge** into consolidated markdown before `## Enacting Terms`
5. **Add metadata note:**
   ```markdown
   > **Note:** Enacting terms from consolidated version (0xxxxx). Preamble merged from base version (3xxxxx).
   ```

### Step 3.5: Merge Annexes (if consolidated lacks them)

**EUR-Lex consolidated versions often omit annexes.** This is the same pattern as the preamble gap.

1. **Check if annexes exist** — search the consolidated markdown for `Annex` references in the enacting terms:
   ```bash
   grep -i "annex" 01_regulation/<dir>/regulation.md
   ```
2. If articles reference annexes but no `## ANNEX` headings exist → annexes are missing
3. **Source the original annexes** from (in priority order):
   - **Cellar REST API** (preferred — bypasses EUR-Lex AWS WAF):
     ```bash
     ./scripts/fetch-eurlex.sh <base_celex>          # Downloads XHTML
     ./scripts/fetch-eurlex.sh <base_celex> fmx4      # Or Formex XML
     # Extract annex content from /tmp/eurlex_<celex>.xhtml
     ```
   - **legislation.gov.uk** (fallback — reliable, no WAF):
     ```
     https://www.legislation.gov.uk/eur/YYYY/NNNN/annex/I
     https://www.legislation.gov.uk/eur/YYYY/NNNN/annex/II
     ```
   - **EUR-Lex original** (CELEX `3YYYYRNNNN`) via browser if above fail
4. **Append each annex** after the last article as `## ANNEX I`, `## ANNEX II`, etc.
5. **Update metadata note:** Add `Annexes I–N merged from original (3xxxxx).`

---

## Phase 4: Finalize Configuration

### Step 4.1: Update documents.yaml
```yaml
source: manual  # Changed from formex
# Add comment: Formex import from base CELEX + [corrigenda applied] — DO NOT REGENERATE
```

### Step 4.2: Update Markdown Metadata
Add note to markdown header:
```markdown
> **Note:** Base version. Consolidated text includes [M1/amendment] from [Regulation].
```

### Step 4.3: Build and Verify
```bash
cd ~/dev/eIDAS20/docs-portal
npm run build:documents
npm run build:all-content
# Restart dev server to pick up new static files
./scripts/restart-dev-server.sh
```

### Step 4.4: Browser Verify
- Check document loads in portal
- Verify "View on EUR-Lex" link points to consolidated version
- Check terminology definitions extracted
- Verify ToC structure

### Step 4.5: Check Annex for ETSI Requirements
**⚠️ REQUIRED for implementing acts!**

Check if the annex contains ETSI-style requirement patterns:
```bash
grep -E "REQ-|USE-|VAL-|OVR-" 02_implementing_acts/<dir>/*.md
```

If patterns found:
1. Create a new TSP profile in `roles.yaml` (e.g., `electronic_ledger`, `qwac_issuer`)
2. Extract each REQ-* as an RCA requirement in `trust-service-provider.yaml`
3. Use `profileFilter: [new_profile]` to scope requirements
4. Run `npm run validate:rca && npm run build:rca`

See AGENTS.md → "ETSI Requirement Extraction Policy" for full details.

### Step 4.6: Update document-config.json (for terminology sources)
**⚠️ REQUIRED if the document contains Article 2/3 definitions!**

Add entry to `docs-portal/scripts/document-config.json`:
```json
"<slug>": {
    "label": "<ShortName>",
    "ragEnabled": true,
    "terminologySource": true,
    "category": "referenced",  // primary | referenced | implementing-act
    "comment": "<Description of document purpose>"
}
```

**Why this matters:** Without explicit `category`, terminology build falls back to `'primary'` and technical titles like "Regulation 2019/881" appear in popovers instead of human-friendly names.

Then rebuild terminology:
```bash
cd ~/dev/eIDAS20/docs-portal
npm run build:terminology
```

---

## Phase 5: Documentation

### Step 5.1: Update TRACKER.md
- Add session entry with import stats
- Update document count in portal status
- Mark import queue item complete

### Step 5.2: Update Import Plan
If import plan exists in `.agent/plans/`:
- Change status to COMPLETE
- Add final stats and notes

### Step 5.3: Document Amendment Gaps
If amendments not applied:
- Update `.agent/docs/pitfalls/amendment-gaps.md`
- Note which amendments are missing and why

---

## Checklist

- [ ] Checked consolidated Formex availability
- [ ] Identified amendments and corrigenda
- [ ] Added to documents.yaml with correct metadata
- [ ] Imported via Formex pipeline
- [ ] Applied any corrigenda manually
- [ ] **Verified annexes present** (merged from original if missing)
- [ ] Set source to `manual`
- [ ] Updated markdown metadata with note
- [ ] Built and verified in browser
- [ ] **Updated document-config.json** (if terminology source)
- [ ] Rebuilt terminology (`npm run build:terminology`)
- [ ] Updated TRACKER.md
- [ ] Documented any amendment gaps
