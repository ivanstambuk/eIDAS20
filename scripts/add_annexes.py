#!/usr/bin/env python3
"""
Extract and append annexes from EUR-Lex HTML to Formex-converted Markdown.
Handles the case where Formex XML doesn't include annexes.
"""
import re
import sys
import subprocess
from pathlib import Path
import urllib.request


def download_html(celex: str, output_path: Path) -> bool:
    """Download HTML from EUR-Lex."""
    url = f"https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:{celex}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            content = response.read().decode('utf-8')
            output_path.write_text(content, encoding='utf-8')
        return True
    except Exception as e:
        print(f"  Error downloading: {e}")
        return False


def extract_annexes_from_html(html_content: str) -> str:
    """Extract and clean annex content from HTML."""
    # Find where annexes start
    annex_match = re.search(r'<[^>]*class="[^"]*title-annex[^"]*"[^>]*>.*?ANNEX\s+I\b', 
                            html_content, re.IGNORECASE | re.DOTALL)
    
    if not annex_match:
        # Try alternative pattern
        annex_match = re.search(r'>ANNEX\s+I\s*<', html_content, re.IGNORECASE)
    
    if not annex_match:
        return ""
    
    # Get content from first ANNEX onwards
    annex_start = html_content.rfind('<', 0, annex_match.start())
    annex_html = html_content[annex_start:]
    
    # Remove trailing footer/metadata
    for pattern in [r'<div[^>]*class="[^"]*footer[^"]*".*', 
                    r'ELI:\s*http://data\.europa\.eu.*',
                    r'ISSN\s+\d+-\d+.*']:
        annex_html = re.sub(pattern, '', annex_html, flags=re.IGNORECASE | re.DOTALL)
    
    # Strip HTML tags
    text = re.sub(r'<[^>]+>', ' ', annex_html)
    text = re.sub(r'&nbsp;', ' ', text)
    text = re.sub(r'&lt;', '<', text)
    text = re.sub(r'&gt;', '>', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'&quot;', '"', text)
    
    # Clean up whitespace
    lines = []
    prev_empty = False
    for line in text.split('\n'):
        stripped = line.strip()
        if not stripped:
            if not prev_empty:
                lines.append('')
                prev_empty = True
            continue
        prev_empty = False
        lines.append(stripped)
    
    # Format the content
    result = []
    for line in lines:
        # ANNEX headers
        if re.match(r'^ANNEX\s+[IVX]+\s*$', line):
            result.append('')
            result.append('---')
            result.append('')
            result.append(f'## {line}')
        # Section headers (numbered sections)
        elif re.match(r'^\d+\.\s+[A-Z]', line):
            result.append('')
            result.append(f'### {line}')
        # List items
        elif re.match(r'^\([a-z]\)\s', line) or re.match(r'^\(\d+\)\s', line):
            result.append('')
            result.append(line)
        else:
            result.append(line)
    
    # Clean up multiple blank lines
    text = '\n'.join(result)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()


def has_annex_sections(md_content: str) -> int:
    """Count actual annex section headers in markdown."""
    return len(re.findall(r'(?m)^#{1,3}\s*(?:ANNEX|Annex)\s+[IVX]+', md_content))


def count_annex_mentions(md_content: str) -> int:
    """Count annex mentions (references) in markdown."""
    return len(re.findall(r'(?i)annex\s+[ivx]+', md_content))


def process_document(dir_path: Path, celex: str, force: bool = False) -> bool:
    """Process a single document - extract annexes if missing."""
    md_file = dir_path / f"{celex}.md"
    
    if not md_file.exists():
        print(f"  ⚠️ Markdown file not found: {md_file}")
        return False
    
    md_content = md_file.read_text(encoding='utf-8')
    sections = has_annex_sections(md_content)
    mentions = count_annex_mentions(md_content)
    
    print(f"  Current: {sections} annex sections, {mentions} mentions")
    
    # Skip if already has annexes (unless force)
    if sections > 0 and not force:
        print(f"  ✅ Already has annexes")
        return False
    
    # Skip if no annex mentions
    if mentions == 0:
        print(f"  ⏭️ No annex references found")
        return False
    
    # Download HTML
    html_path = dir_path / "temp_html.html"
    print(f"  Downloading HTML...")
    if not download_html(celex, html_path):
        return False
    
    html_content = html_path.read_text(encoding='utf-8')
    
    # Check if HTML has annexes
    html_annexes = re.findall(r'ANNEX\s+[IVX]+', html_content, re.IGNORECASE)
    html_unique = sorted(set(html_annexes))
    print(f"  HTML annexes: {', '.join(html_unique) if html_unique else 'None'}")
    
    if not html_unique:
        html_path.unlink()
        print(f"  ⏭️ No annexes in HTML")
        return False
    
    # Extract annexes
    print(f"  Extracting annexes...")
    annexes_text = extract_annexes_from_html(html_content)
    
    if not annexes_text:
        html_path.unlink()
        print(f"  ⚠️ Failed to extract annexes")
        return False
    
    # Verify extraction
    extracted_sections = len(re.findall(r'^## ANNEX\s+[IVX]+', annexes_text, re.MULTILINE))
    print(f"  Extracted {extracted_sections} annex sections")
    
    if extracted_sections == 0:
        html_path.unlink()
        print(f"  ⚠️ No sections extracted")
        return False
    
    # Append to markdown
    new_content = md_content.rstrip() + '\n\n' + annexes_text
    md_file.write_text(new_content, encoding='utf-8')
    
    # Cleanup
    html_path.unlink()
    
    new_lines = len(new_content.split('\n'))
    print(f"  ✅ Added annexes ({new_lines} total lines)")
    return True


def main():
    if len(sys.argv) < 2:
        print("Usage: python add_annexes.py <implementing_acts_dir>")
        print("       python add_annexes.py <single_dir> <celex>")
        sys.exit(1)
    
    # CELEX mapping - comprehensive list of all implementing acts
    celex_map = {
        # First batch - Dec 2024
        '2024_2977_PID_and_EAA': '32024R2977',
        '2024_2978_TSP_List_Publication': '32024R2978',
        '2024_2979_Integrity_Core_Functions': '32024R2979',
        '2024_2980_Notifications': '32024R2980',
        '2024_2981_Certification': '32024R2981',
        '2024_2982_Protocols_Interfaces': '32024R2982',
        # Second batch - May 2025
        '2025_0846_Cross_Border_Identity': '32025R0846',
        '2025_0847_Security_Breach_Response': '32025R0847',
        '2025_0848_Relying_Party_Registration': '32025R0848',
        '2025_0849_Certified_Wallet_List': '32025R0849',
        # Third batch - Jul/Sep 2025
        '2025_1566_QC_Identity_Verification': '32025R1566',
        '2025_1567_Remote_Creation_Devices': '32025R1567',
        '2025_1568_Peer_Reviews_eID': '32025R1568',
        '2025_1569_EAA_Verification': '32025R1569',
        '2025_1570_Certified_Creation_Devices': '32025R1570',
        '2025_1571_Annual_Reports': '32025R1571',
        '2025_1572_QTS_Applications': '32025R1572',
        '2025_1929_Electronic_Timestamps': '32025R1929',
        '2025_1942_Validation_Services': '32025R1942',
        '2025_1943_Signature_Standards': '32025R1943',
        '2025_1944_Electronic_Delivery': '32025R1944',
        '2025_1945_Signature_Validation': '32025R1945',
        '2025_1946_Preservation_Services': '32025R1946',
        # Fourth batch - Oct 2025
        '2025_2160_Non_Qualified_TS_Risks': '32025R2160',
        '2025_2162_CAB_Accreditation': '32025R2162',
        '2025_2164_Trusted_Lists': '32025D2164',
        '2025_2527_Website_Auth_Certs': '32025R2527',
        '2025_2530_QTSP_Requirements': '32025R2530',
        '2025_2531_Electronic_Ledgers': '32025R2531',
        '2025_2532_Archiving_Services': '32025R2532',
    }
    
    base_dir = Path(sys.argv[1])
    
    if len(sys.argv) == 3:
        # Single document mode
        celex = sys.argv[2]
        print(f"\n📄 Processing: {base_dir.name} ({celex})")
        process_document(base_dir, celex)
    else:
        # Batch mode
        updated = 0
        for dir_name, celex in celex_map.items():
            dir_path = base_dir / dir_name
            if dir_path.exists():
                print(f"\n📄 {dir_name} ({celex})")
                if process_document(dir_path, celex):
                    updated += 1
        
        print(f"\n{'='*50}")
        print(f"Done! Updated {updated} documents with annexes.")


if __name__ == '__main__':
    main()
