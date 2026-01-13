#!/usr/bin/env python3
"""
Fix FORMAT001: Merge empty list markers with their following content.
Handles patterns like:
  (a)
  
  Content here
  
Transforms to:
  (a) Content here
"""
import re
import sys
from pathlib import Path


def fix_list_markers(content: str) -> tuple[str, int]:
    """Fix empty list markers by merging with following content.
    
    Returns tuple of (fixed_content, fix_count)
    """
    fixes = 0
    
    # Pattern 1: Letter markers (a), (b), (ca), (i), (ii), etc.
    # Match: marker on own line, blank line(s), then content starting with letter or quote
    pattern1 = re.compile(
        r'^(\s*)\(([a-z]+)\)\s*\r?\n'  # marker like (a) or (ca) on its own line
        r'(?:\s*\r?\n)+'               # one or more blank lines
        r"(\s*)([A-Za-z'])",           # content starting with a letter or quote
        re.MULTILINE
    )
    
    def replace1(m):
        nonlocal fixes
        fixes += 1
        indent = m.group(1)
        marker = m.group(2)
        first_char = m.group(4)
        return f'{indent}({marker}) {first_char}'
    
    content = pattern1.sub(replace1, content)
    
    # Pattern 2: Roman numeral markers (i), (ii), (iii), etc. with indent
    # These are sub-items and should maintain proper indentation
    pattern2 = re.compile(
        r'^(\s*)\(([ivx]+)\)\s*\r?\n'  # roman numeral marker
        r'(?:\s*\r?\n)+'               # blank lines
        r'(\s*)([A-Za-z])',            # content
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
    
    # Pattern 3: Numbered markers in Annexes: 1., 2., etc.
    # But NOT Article numbers or section headers (those have ## or ### before)
    pattern3 = re.compile(
        r'^(\s*)(\d+)\.\s*\r?\n'       # number with period on its own line
        r'(?:\s*\r?\n)+'               # blank lines  
        r'(\s*)([A-Z])',               # content starting with capital letter
        re.MULTILINE
    )
    
    def replace3(m):
        nonlocal fixes
        fixes += 1
        indent = m.group(1)
        number = m.group(2)
        first_char = m.group(4)
        return f'{indent}{number}. {first_char}'
    
    content = pattern3.sub(replace3, content)
    
    return content, fixes


def process_file(file_path: Path, dry_run: bool = False) -> int:
    """Process a single file. Returns number of fixes made."""
    content = file_path.read_text(encoding='utf-8')
    fixed_content, fixes = fix_list_markers(content)
    
    if fixes > 0 and not dry_run:
        file_path.write_text(fixed_content, encoding='utf-8')
        print(f"[FIXED] {file_path}: {fixes} list markers merged")
    elif fixes > 0:
        print(f"[DRY-RUN] {file_path}: would fix {fixes} markers")
    else:
        print(f"[OK] {file_path}: no issues")
    
    return fixes


def main():
    dry_run = '--dry-run' in sys.argv
    
    if dry_run:
        print("=== DRY RUN MODE (no files will be modified) ===\n")
    
    # Files to process
    files = [
        Path("01_regulation/2024_1183_eIDAS2_Amending/32024R1183.md"),
        Path("02_implementing_acts/2024_2979_Integrity_Core_Functions/32024R2979.md"),
        Path("02_implementing_acts/2025_0848_Relying_Party_Registration/32025R0848.md"),
        Path("02_implementing_acts/2025_1568_Peer_Reviews_eID/32025R1568.md"),
        Path("02_implementing_acts/2025_1944_Electronic_Delivery/32025R1944.md"),
        Path("02_implementing_acts/2025_1945_Signature_Validation/32025R1945.md"),
        Path("02_implementing_acts/2025_2162_CAB_Accreditation/32025R2162.md"),
    ]
    
    total_fixes = 0
    for f in files:
        if f.exists():
            total_fixes += process_file(f, dry_run)
        else:
            print(f"[ERR] File not found: {f}")
    
    print(f"\n{'='*60}")
    print(f"Total: {len(files)} files processed, {total_fixes} markers fixed")
    
    if dry_run:
        print("\nRun without --dry-run to apply fixes.")


if __name__ == '__main__':
    main()
