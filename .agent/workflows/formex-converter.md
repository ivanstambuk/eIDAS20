---
description: How to modify the Formex XML to Markdown converter (TDD workflow)
---

# Formex Converter Modification Workflow

When making changes to `scripts/formex_to_md_v3.py`, **ALWAYS** follow this test-driven workflow:

## 1. Understand the Issue
- Identify the XML pattern that's being converted incorrectly
- View examples in source XML files (e.g., `temp_formex/formex/*.fmx.xml`)
- Check the current Markdown output to understand what's wrong

## 2. Write the Test FIRST
// turbo
```bash
# Add a new test class/method to scripts/test_formex_converter.py
# The test should:
# - Create minimal XML that reproduces the issue
# - Call the relevant converter function
# - Assert the expected Markdown output
```

**Test naming convention:** `Test<FeatureName>` class with `test_<specific_behavior>` methods

## 3. Run the Test (Expect Failure)
// turbo
```bash
python -m unittest scripts.test_formex_converter.Test<NewTestClass> -v
```

## 4. Implement the Fix
- Modify the converter function in `formex_to_md_v3.py`
- Keep changes minimal and focused

## 5. Run Tests Again (Expect Pass)
// turbo
```bash
python -m unittest scripts.test_formex_converter -v
```

All 37+ tests must pass.

## 6. Re-convert the Document
// turbo
```bash
python scripts/formex_to_md_v3.py temp_formex/formex/L_202401183EN.000101.fmx.xml 01_regulation/2024_1183_eIDAS2_Amending/32024R1183.md
```

## 7. Add Metadata Header Back
The converter overwrites the file, so re-add the CELEX header:
```markdown
> **CELEX:** 32024R1183 | **Date:** 30.04.2024
>
> **Source:** https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1183
```

## 8. Commit with Both Files
// turbo
```bash
git add scripts/formex_to_md_v3.py scripts/test_formex_converter.py 01_regulation/2024_1183_eIDAS2_Amending/32024R1183.md
git commit -m "fix: <description>

- <what was wrong>
- <what the fix does>
- Added test: Test<ClassName>.test_<method>"
```

## Key Testing Patterns

### Testing list processing:
```python
xml = '''<LIST><ITEM><NP>...</NP></ITEM></LIST>'''
elem = ET.fromstring(xml)
lines = process_list_with_quotes(elem, parent, indent_level=0)
self.assertIn("expected text", '\n'.join(lines))
```

### Testing element text extraction:
```python
xml = '''<ELEMENT>text content</ELEMENT>'''
elem = ET.fromstring(xml)
result = get_element_text(elem)
self.assertEqual(result, "expected text")
```

## ⚠️ CRITICAL REMINDER
**Never commit converter changes without corresponding unit tests!**
