#!/usr/bin/env python3
"""Clean up HTML-converted annexes to match Formex v2 style."""
import re
import sys

def clean_annexes(input_path: str, output_path: str):
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove pandoc div markers and fence patterns
    content = re.sub(r'::+\s*\{[^}]*\}\s*', '', content)
    content = re.sub(r'::+\s*grid-list-column-\d+', '', content)
    content = re.sub(r'::+\s*list', '', content)
    content = re.sub(r'::+$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^::+\s*$', '', content, flags=re.MULTILINE)
    
    # Remove inline style markers
    content = re.sub(r'\[([^\]]+)\]\{\.boldface\}', r'**\1**', content)
    content = re.sub(r'\[([^\]]+)\]\{[^}]*\}', r'\1', content)
    content = re.sub(r'\{[^}]*style="[^"]*"[^}]*\}', '', content)
    
    # Remove modification markers (▼M2, ▼B links)
    content = re.sub(r'\[▼[^\]]+\]\([^)]+\)\{[^}]+\}[\s-]*', '', content)
    content = re.sub(r'\[▼[^\]]+\]\([^)]+\)', '', content)
    
    # Convert ANNEX headers to markdown headers
    content = re.sub(r'^ANNEX ([IVX]+)\s*$', r'\n---\n\n## ANNEX \1', content, flags=re.MULTILINE)
    
    # Format list items: (a), (b), (i), (ii), 1., 2., etc.
    # Multi-line cleanup for list items
    lines = content.split('\n')
    result = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty lines at start
        if not result and not line:
            i += 1
            continue
            
        # Handle list markers followed by content on next line
        match = re.match(r'^\(([a-z]+|[ivx]+|\d+[a-z]*)\)\s*$', line) or re.match(r'^(\d+)\.\s*$', line) or re.match(r'^---\s*$', line)
        if match:
            # Look ahead for content
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines):
                next_content = lines[j].strip()
                if next_content and not re.match(r'^\([a-z]+\)|^\d+\.|^---|^ANNEX|^##', next_content):
                    if line.strip() == '---':
                        result.append(f"  - {next_content}")
                    elif re.match(r'^\d+\.\s*$', line):
                        result.append(f"{line.strip()} {next_content}")
                    else:
                        result.append(f"{line.strip()} {next_content}")
                    i = j + 1
                    continue
        
        # For (i), (ii) nested items, add indentation
        if re.match(r'^\([ivx]+\)', line):
            result.append(f"    {line}")
        elif re.match(r'^\s*-\s', line):
            result.append(f"    {line.strip()}")
        else:
            result.append(line)
        i += 1
    
    content = '\n'.join(result)
    
    # Clean up excessive blank lines
    content = re.sub(r'\n{4,}', '\n\n\n', content)
    content = re.sub(r'^\s+', '', content)  # Remove leading whitespace
    
    # Add separator and header
    header = "\n---\n\n# ANNEXES\n\n"
    content = header + content.strip() + "\n"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Cleaned annexes: {input_path} -> {output_path}")
    return content

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        clean_annexes(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python clean_annexes.py input.md output.md")
