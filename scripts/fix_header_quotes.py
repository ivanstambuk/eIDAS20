#!/usr/bin/env python3
"""Fix leading single quotes in markdown headers."""

from pathlib import Path
import re

def fix_headers(base_dirs):
    """Remove leading single quotes from headers."""
    fixed_files = 0
    
    for base_dir in base_dirs:
        for md_file in Path(base_dir).rglob('*.md'):
            if md_file.name == 'README.md':
                continue
            
            content = md_file.read_text(encoding='utf-8')
            original = content
            
            # Remove leading single quotes from headers
            # Pattern: ### 'Article -> ### Article
            content = re.sub(r"^(#{1,6})\s*'(.+)$", r'\1 \2', content, flags=re.MULTILINE)
            
            # Remove leading single quotes from regular text lines
            # Pattern: '(a) text -> (a) text
            content = re.sub(r"^'(.+)$", r'\1', content, flags=re.MULTILINE)
            
            if content != original:
                md_file.write_text(content, encoding='utf-8')
                print(f'Fixed: {md_file.name}')
                fixed_files += 1
    
    return fixed_files

if __name__ == '__main__':
    dirs = ['01_regulation', '02_implementing_acts']
    count = fix_headers(dirs)
    print(f'\nTotal files fixed: {count}')
