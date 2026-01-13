#!/usr/bin/env python3
"""Fix the remaining quote-prefixed list markers in the RP Registration file."""
import re

path = r"D:\aab\eIDAS20\02_implementing_acts\2025_0848_Relying_Party_Registration\32025R0848.md"
content = open(path, 'r', encoding='utf-8').read()

# The typographic single quote is Unicode U+2018 (LEFT SINGLE QUOTATION MARK)
left_quote = '\u2018'  # '
# Match: (a) through (j) followed by blank line then typographic quote
pattern = r"\(([a-j])\)\n\n" + left_quote
replacement = r"(\1) " + left_quote

fixed, count = re.subn(pattern, replacement, content)
open(path, 'w', encoding='utf-8').write(fixed)
print(f"Fixed {count} list markers")

