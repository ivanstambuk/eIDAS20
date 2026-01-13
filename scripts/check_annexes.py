#!/usr/bin/env python3
"""Check for missing Annexes in converted documents."""
import re
from pathlib import Path

base = Path('02_implementing_acts')
issues = []

for md_file in base.rglob('*.md'):
    if md_file.name == 'README.md':
        continue
    content = md_file.read_text(encoding='utf-8')
    
    # Count annex mentions vs actual annex headers
    mentions = len(re.findall(r'Annex\s+[IVXLC]+', content, re.IGNORECASE))
    headers = len(re.findall(r'^## ANNEX', content, re.MULTILINE))
    
    if mentions > 0 and headers == 0:
        issues.append((md_file.name, mentions, headers))
    elif mentions > headers * 2:  # Significant mismatch
        issues.append((md_file.name, mentions, headers))

doc_count = len([f for f in base.rglob('*.md') if f.name != 'README.md'])
print(f'Annex Analysis ({doc_count} documents):')
print()
if issues:
    print(f'Documents with potential missing Annexes:')
    for name, mentions, headers in sorted(issues, key=lambda x: -x[1]):
        print(f'  {name}: {mentions} mentions, {headers} headers')
else:
    print('No issues detected - all documents have appropriate Annex coverage.')
