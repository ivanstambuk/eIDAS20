#!/usr/bin/env python3
"""
Add metadata headers to EUR-Lex converted markdown files.
Extracts CELEX ID from filename and adds standard header block.
"""
import re
import sys
from pathlib import Path

# Map of CELEX patterns to document info
CELEX_INFO = {
    '32024R2977': ('Commission Implementing Regulation', '2024/2977', 'OJ L, 28.11.2024'),
    '32024R2978': ('Commission Implementing Regulation', '2024/2978', 'OJ L, 28.11.2024'),
    '32024R2979': ('Commission Implementing Regulation', '2024/2979', 'OJ L, 28.11.2024'),
    '32024R2980': ('Commission Implementing Regulation', '2024/2980', 'OJ L, 28.11.2024'),
    '32024R2981': ('Commission Implementing Regulation', '2024/2981', 'OJ L, 28.11.2024'),
    '32024R2982': ('Commission Implementing Regulation', '2024/2982', 'OJ L, 28.11.2024'),
    '32025R0847': ('Commission Implementing Regulation', '2025/847', 'OJ L, 2025'),
    '32025R0848': ('Commission Implementing Regulation', '2025/848', 'OJ L, 2025'),
    '32025D0849': ('Commission Implementing Decision', '2025/849', 'OJ L, 2025'),
    '32025R1568': ('Commission Implementing Regulation', '2025/1568', 'OJ L, 2025'),
    '32025R1944': ('Commission Implementing Regulation', '2025/1944', 'OJ L, 2025'),
    '32025R1945': ('Commission Implementing Regulation', '2025/1945', 'OJ L, 2025'),
    '32025R2160': ('Commission Implementing Regulation', '2025/2160', 'OJ L, 2025'),
    '32025R2162': ('Commission Implementing Regulation', '2025/2162', 'OJ L, 2025'),
    '32025D2164': ('Commission Implementing Decision', '2025/2164', 'OJ L, 2025'),
}


def add_metadata_header(file_path: Path) -> bool:
    """Add metadata header to a markdown file if not already present."""
    content = file_path.read_text(encoding='utf-8')
    
    # Skip if already has metadata header
    if content.startswith('>'):
        print(f"  ⏭️  {file_path.name}: Already has metadata header")
        return False
    
    # Extract CELEX from filename
    celex_match = re.search(r'3\d{4}[RD]\d+', file_path.stem)
    if not celex_match:
        print(f"  ⚠️  {file_path.name}: Could not extract CELEX ID")
        return False
    
    celex = celex_match.group()
    
    # Get document info
    doc_type, doc_num, oj_ref = CELEX_INFO.get(celex, ('Implementing Act', celex, 'OJ L'))
    
    # Build header
    header = f"""> **CELEX:** {celex} | **Document:** {doc_type} (EU) {doc_num}
>
> ⚠️ *This text is meant purely as a documentation tool and has no legal effect. The authentic versions are those published in the Official Journal of the European Union.*
>
> **Source:** https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:{celex}

---

"""
    
    # Prepend header
    new_content = header + content
    file_path.write_text(new_content, encoding='utf-8')
    print(f"  ✅ {file_path.name}: Added metadata header")
    return True


def main():
    if len(sys.argv) < 2:
        print("Usage: python add_headers.py <directory>")
        print("       python add_headers.py <file.md>")
        sys.exit(1)
    
    target = Path(sys.argv[1])
    
    if target.is_file():
        files = [target]
    else:
        files = list(target.rglob('*.md'))
        # Filter out README files
        files = [f for f in files if f.name != 'README.md']
    
    print(f"Processing {len(files)} markdown files...\n")
    
    added = 0
    for f in files:
        if add_metadata_header(f):
            added += 1
    
    print(f"\nDone! Added headers to {added}/{len(files)} files.")


if __name__ == '__main__':
    main()
