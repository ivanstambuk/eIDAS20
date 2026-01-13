#!/usr/bin/env python3
"""
Migrate all documents from Formex to Markdown using the v3 converter.
Preserves original CELEX headers from existing files.
"""
import subprocess
import sys
from pathlib import Path
import re

# Map directories to their Formex XML paths
IMPLEMENTING_ACTS = {
    "2024_2977_PID_and_EAA": "formex/L_202402977EN.000101.fmx.xml",
    "2024_2978_TSP_List_Publication": "formex/L_202402978EN.000101.fmx.xml",
    "2024_2979_Integrity_Core_Functions": "formex/L_202402979EN.000101.fmx.xml",
    "2024_2980_Notifications": "formex/L_202402980EN.000101.fmx.xml",
    "2024_2981_Certification": "formex/L_202402981EN.000101.fmx.xml",
    "2024_2982_Protocols_Interfaces": "formex/L_202402982EN.000101.fmx.xml",
    "2025_0846_Cross_Border_Identity": "formex/L_202500846EN.000101.fmx.xml",
    "2025_0847_Security_Breach_Response": "formex/L_202500847EN.000101.fmx.xml",
    "2025_0848_Relying_Party_Registration": "formex/L_202500848EN.000101.fmx.xml",
    "2025_0849_Certified_Wallet_List": "formex/L_202500849EN.000101.fmx.xml",
    "2025_1566_QC_Identity_Verification": "formex/L_202501566EN.000101.fmx.xml",
    "2025_1567_Remote_Creation_Devices": "formex/L_202501567EN.000101.fmx.xml",
    "2025_1568_Peer_Reviews_eID": "formex/L_202501568EN.000101.fmx.xml",
    "2025_1569_EAA_Verification": "formex/L_202501569EN.000101.fmx.xml",
    "2025_1570_Certified_Creation_Devices": "formex/L_202501570EN.000101.fmx.xml",
    "2025_1571_Annual_Reports": "formex/L_202501571EN.000101.fmx.xml",
    "2025_1572_QTS_Applications": "formex/L_202501572EN.000101.fmx.xml",
    "2025_1929_Electronic_Timestamps": "formex/L_202501929EN.000101.fmx.xml",
    "2025_1942_Validation_Services": "formex/L_202501942EN.000101.fmx.xml",
    "2025_1943_Signature_Standards": "formex/L_202501943EN.000101.fmx.xml",
    "2025_1944_Electronic_Delivery": "formex/L_202501944EN.000101.fmx.xml",
    "2025_1945_Signature_Validation": "formex/L_202501945EN.000101.fmx.xml",
    "2025_1946_Preservation_Services": "formex/L_202501946EN.000101.fmx.xml",
    "2025_2160_Non_Qualified_TS_Risks": "formex/L_202502160EN.000101.fmx.xml",
    "2025_2162_CAB_Accreditation": "formex/L_202502162EN.000101.fmx.xml",
    "2025_2164_Trusted_Lists": "formex/L_202502164EN.000101.fmx.xml",
    "2025_2527_Website_Auth_Certs": "formex/L_202502527EN.000101.fmx.xml",
    "2025_2530_Archiving_Services": "formex/L_202502530EN.000101.fmx.xml",
    "2025_2531_eIDAS_Supervision": "formex/L_202502531EN.000101.fmx.xml",
    "2025_2532_Electronic_Ledgers": "formex/L_202502532EN.000101.fmx.xml",
}

def extract_header(md_path: Path) -> str:
    """Extract the CELEX header block from existing markdown file."""
    if not md_path.exists():
        return ""
    
    content = md_path.read_text(encoding='utf-8')
    
    # Header starts with > and ends before ---
    lines = content.split('\n')
    header_lines = []
    in_header = False
    
    for line in lines:
        if line.startswith('>'):
            in_header = True
            header_lines.append(line)
        elif in_header and line.strip() == '---':
            header_lines.append(line)
            header_lines.append('')
            break
        elif in_header and line.strip() == '':
            header_lines.append(line)
        elif in_header:
            break
    
    if header_lines:
        return '\n'.join(header_lines)
    return ""


def convert_document(xml_path: Path, md_path: Path, preserve_header: bool = True) -> bool:
    """Convert Formex XML to Markdown using v3 script."""
    
    # Extract existing header if present
    existing_header = ""
    if preserve_header and md_path.exists():
        existing_header = extract_header(md_path)
    
    # Run v3 converter
    scripts_dir = Path(__file__).parent
    v3_script = scripts_dir / "formex_to_md_v3.py"
    
    result = subprocess.run(
        [sys.executable, str(v3_script), str(xml_path), str(md_path)],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print(f"  ❌ Error converting: {result.stderr}")
        return False
    
    # Prepend header if we had one
    if existing_header:
        content = md_path.read_text(encoding='utf-8')
        new_content = existing_header + '\n' + content
        md_path.write_text(new_content, encoding='utf-8')
        print(f"  ✅ Converted with preserved header")
    else:
        print(f"  ✅ Converted (no header to preserve)")
    
    return True


def main():
    base_dir = Path(__file__).parent.parent
    ia_dir = base_dir / "02_implementing_acts"
    
    print("=" * 60)
    print("Formex V3 Migration Script")
    print("=" * 60)
    print()
    
    # Count successes/failures
    success = 0
    failed = 0
    skipped = 0
    
    for dir_name, xml_rel_path in IMPLEMENTING_ACTS.items():
        doc_dir = ia_dir / dir_name
        xml_path = doc_dir / xml_rel_path
        
        # Find existing markdown file
        md_files = list(doc_dir.glob("3*.md"))
        if md_files:
            md_path = md_files[0]
        else:
            # Construct from CELEX pattern
            celex_match = re.search(r'L_(\d{4})(\d{5})EN', xml_rel_path)
            if celex_match:
                year = celex_match.group(1)
                num = celex_match.group(2).lstrip('0')
                md_path = doc_dir / f"3{year}R{num.zfill(4)}.md"
            else:
                print(f"⚠️  {dir_name}: Could not determine output filename")
                skipped += 1
                continue
        
        print(f"\n📄 {dir_name}")
        print(f"   XML: {xml_path.name}")
        print(f"   MD:  {md_path.name}")
        
        if not xml_path.exists():
            print(f"  ⏭️  Skipped: XML not found")
            skipped += 1
            continue
        
        if convert_document(xml_path, md_path):
            success += 1
        else:
            failed += 1
    
    print()
    print("=" * 60)
    print(f"Migration Complete: {success} succeeded, {failed} failed, {skipped} skipped")
    print("=" * 60)


if __name__ == "__main__":
    main()
