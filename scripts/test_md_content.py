import re

with open('01_regulation/2024_1183_eIDAS2_Amending/32024R1183.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Look for '21 May' pattern with different spaces
print('Contains 21 May 2026 (regular space):', '21 May 2026' in content)
print('Contains 21\xa0May 2026 (nbsp):', '21\xa0May 2026' in content)

# Check for truncated 'shall, by'
matches = list(re.finditer(r'shall, by[^\n]*', content))
print(f'Found {len(matches)} "shall, by" patterns')
for m in matches[:5]:
    line = m.group()
    print(f'  {repr(line[:100])}...')
