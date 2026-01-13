#!/usr/bin/env python3
"""
Fix FORMAT002/003: Merge standalone em-dash and numbered markers with their following content.

Handles Formex conversion artifacts where list markers are on separate lines from their content:
  —
  
  Content here

Transforms to:
  — Content here
"""
import re
import sys
from pathlib import Path


def fix_markers(content: str) -> tuple[str, int]:
    """Fix standalone markers by merging with following content.
    
    Returns tuple of (fixed_content, fix_count)
    """
    fixes = 0
    
    # Pattern 1: Em-dash markers (—)
    pattern1 = re.compile(
        r'^(\s*)—\s*\r?\n'              # em-dash on its own line
        r'(?:\s*\r?\n)+'                # one or more blank lines
        r'(\s*)([A-Za-z\'\"])',         # content starting with letter or quote
        re.MULTILINE
    )
    
    def replace1(m):
        nonlocal fixes
        fixes += 1
        indent = m.group(1)
        first_char = m.group(3)
        return f'{indent}— {first_char}'
    
    content = pattern1.sub(replace1, content)
    
    # Pattern 2: Letter markers (a), (b), (ca), etc.
    pattern2 = re.compile(
        r'^(\s*)\(([a-z]+)\)\s*\r?\n'   # marker like (a) or (ca)
        r'(?:\s*\r?\n)+'                # blank lines
        r"(\s*)([A-Za-z'])",            # content
        re.MULTILINE
    )
    
    def replace2(m):
        nonlocal fixes
        fixes += 1
        indent = m.group(1)
        marker = m.group(2)
        first_char = m.group(4)
        return f'{indent}({marker}) {first_char}'
    
    content = pattern2.sub(replace2, content)
    
    # Pattern 3: Numbered markers (1), (2), etc.
    pattern3 = re.compile(
        r'^(\s*)\((\d+)\)\s*\r?\n'      # numbered marker
        r'(?:\s*\r?\n)+'                # blank lines
        r'(\s*)([A-Za-z])',             # content
        re.MULTILINE
    )
    
    def replace3(m):
        nonlocal fixes
        fixes += 1
        indent = m.group(1)
        number = m.group(2)
        first_char = m.group(4)
        return f'{indent}({number}) {first_char}'
    
    content = pattern3.sub(replace3, content)
    
    return content, fixes


def process_file(file_path: Path, dry_run: bool = False) -> int:
    """Process a single file. Returns number of fixes made."""
    content = file_path.read_text(encoding='utf-8')
    
    # Multiple passes to handle nested cases
    total_fixes = 0
    for _ in range(5):  # Up to 5 passes
        fixed_content, fixes = fix_markers(content)
        total_fixes += fixes
        if fixes == 0:
            break
        content = fixed_content
    
    if total_fixes > 0 and not dry_run:
        file_path.write_text(content, encoding='utf-8')
        print(f"[FIXED] {file_path}: {total_fixes} markers merged")
    elif total_fixes > 0:
        print(f"[DRY-RUN] {file_path}: would fix {total_fixes} markers")
    else:
        print(f"[OK] {file_path}: no issues")
    
    return total_fixes


def main():
    dry_run = '--dry-run' in sys.argv
    
    if dry_run:
        print("=== DRY RUN MODE (no files will be modified) ===\n")
    
    # Find all markdown files in implementing_acts
    base_dir = Path('02_implementing_acts')
    files = list(base_dir.rglob('*.md'))
    files = [f for f in files if f.name != 'README.md']
    
    print(f"Processing {len(files)} files...\n")
    
    total_fixes = 0
    fixed_files = 0
    for f in sorted(files):
        fixes = process_file(f, dry_run)
        total_fixes += fixes
        if fixes > 0:
            fixed_files += 1
    
    print(f"\n{'='*60}")
    print(f"Total: {len(files)} files processed, {fixed_files} files modified, {total_fixes} markers fixed")
    
    if dry_run:
        print("\nRun without --dry-run to apply fixes.")


if __name__ == '__main__':
    main()
