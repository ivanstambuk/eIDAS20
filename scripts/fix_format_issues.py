#!/usr/bin/env python3
"""Fix FORMAT005, FORMAT006, and FORMAT007 issues in markdown files."""
from pathlib import Path
import re

# Process both directories
for search_dir in ['01_regulation', '02_implementing_acts']:
    for md_file in Path(search_dir).rglob('*.md'):
        content = md_file.read_text(encoding='utf-8')
        original = content
        
        # Fix FORMAT005: Add '- ' before letter markers like (i), (ii), (iii) etc that are indented
        content = re.sub(r'^(    )(\([ivx]+\))', r'\1- \2', content, flags=re.MULTILINE)
        content = re.sub(r'^(    )(\([a-z]\))', r'\1- \2', content, flags=re.MULTILINE)
        
        # Fix FORMAT006: Remove leading single quotes from article headers
        content = re.sub(r"^(### )'(Article)", r'\1\2', content, flags=re.MULTILINE)
        
        # Fix FORMAT006: Remove leading single quotes from lines starting with > '
        content = re.sub(r"^(> )'", r'\1', content, flags=re.MULTILINE)
        
        # Fix FORMAT006: Remove leading single quotes from lines starting with '(letter)
        content = re.sub(r"^'(\([a-z]+\))", r'\1', content, flags=re.MULTILINE)
        
        # Fix FORMAT007: Collapse consecutive horizontal rules (--- with only blank lines between)
        # Apply repeatedly in case there are 3+ consecutive rules
        prev = None
        while prev != content:
            prev = content
            content = re.sub(r'(---+\n)(\s*\n)*---+', r'---', content)
        
        if content != original:
            md_file.write_text(content, encoding='utf-8')
            print(f'Fixed: {md_file.name}')
        else:
            print(f'No changes: {md_file.name}')
