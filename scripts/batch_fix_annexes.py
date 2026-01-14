#!/usr/bin/env python3
"""
Batch fix annexes for implementing acts.

Downloads Formex XML from EUR-Lex and properly merges main document + annex files.
"""

import os
import sys
import re
import zipfile
import urllib.request
from pathlib import Path

# Add scripts dir to path for converter import
sys.path.insert(0, str(Path(__file__).parent))
from formex_to_md_v3 import convert_formex_to_md

# Map folder names to CELEX numbers
IMPLEMENTING_ACTS = {
    "2024_2977_PID_and_EAA": "32024R2977",
    "2024_2978_TSP_List_Publication": "32024R2978",
    "2024_2979_Integrity_Core_Functions": "32024R2979",
    "2024_2980_Notifications": "32024R2980",
    "2024_2981_Certification": "32024R2981",
    "2024_2982_Protocols_Interfaces": "32024R2982",
    "2025_0846_Cross_Border_Identity": "32025R0846",
    "2025_0847_Security_Breach_Response": "32025R0847",
    "2025_0848_Relying_Party_Registration": "32025R0848",
    "2025_0849_Certified_Wallet_List": "32025R0849",
    "2025_1566_QC_Identity_Verification": "32025R1566",
    "2025_1567_Remote_Creation_Devices": "32025R1567",
    "2025_1568_Peer_Reviews_eID": "32025R1568",
    "2025_1569_EAA_Verification": "32025R1569",
    "2025_1570_Certified_Creation_Devices": "32025R1570",
    "2025_1571_Annual_Reports": "32025R1571",
    "2025_1572_QTS_Applications": "32025R1572",
    "2025_1929_Electronic_Timestamps": "32025R1929",
    "2025_1942_Validation_Services": "32025R1942",
    "2025_1943_Signature_Standards": "32025R1943",
    "2025_1944_Electronic_Delivery": "32025R1944",
    "2025_1945_Signature_Validation": "32025R1945",
    "2025_1946_Preservation_Services": "32025R1946",
    "2025_2160_Non_Qualified_TS_Risks": "32025R2160",
    "2025_2162_CAB_Accreditation": "32025R2162",
    "2025_2164_Trusted_Lists": "32025R2164",
    "2025_2527_Website_Auth_Certs": "32025R2527",
    "2025_2530_QTSP_Requirements": "32025R2530",
    "2025_2531_Electronic_Ledgers": "32025R2531",
    "2025_2532_Archiving_Services": "32025R2532",
}


def get_formex_url(celex):
    """Get the Formex ZIP URL for a CELEX number."""
    # Download XML notice
    notice_url = f"https://eur-lex.europa.eu/legal-content/EN/TXT/XML/?uri=CELEX:{celex}"
    
    try:
        with urllib.request.urlopen(notice_url, timeout=30) as response:
            content = response.read().decode('utf-8')
    except Exception as e:
        print(f"    ERROR fetching notice: {e}")
        return None
    
    # Look for Official Journal reference pattern
    oj_match = re.search(r'resource/oj/([A-Z]_\d+)\.ENG\.fmx4', content)
    if not oj_match:
        print(f"    No Formex reference found")
        return None
    
    oj_ref = oj_match.group(1)
    rdf_url = f"http://publications.europa.eu/resource/oj/{oj_ref}.ENG.fmx4"
    
    try:
        with urllib.request.urlopen(rdf_url, timeout=30) as response:
            rdf_content = response.read().decode('utf-8')
    except Exception as e:
        print(f"    ERROR fetching RDF: {e}")
        return None
    
    # Extract cellar URL
    cellar_match = re.search(r'resource/cellar/([a-f0-9-]+\.\d+\.\d+)', rdf_content)
    if cellar_match:
        cellar_id = cellar_match.group(1)
        return f"http://publications.europa.eu/resource/cellar/{cellar_id}"
    
    return None


def download_and_extract(celex, temp_dir):
    """Download Formex ZIP and extract to temp directory."""
    cellar_url = get_formex_url(celex)
    if not cellar_url:
        return None
    
    zip_path = temp_dir / f"{celex}.zip"
    
    try:
        req = urllib.request.Request(cellar_url, headers={'Accept': 'application/zip'})
        with urllib.request.urlopen(req, timeout=60) as response:
            with open(zip_path, 'wb') as f:
                f.write(response.read())
    except Exception as e:
        print(f"    ERROR downloading ZIP: {e}")
        return None
    
    # Extract
    formex_dir = temp_dir / "formex"
    formex_dir.mkdir(exist_ok=True)
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(formex_dir)
    except Exception as e:
        print(f"    ERROR extracting ZIP: {e}")
        return None
    
    return formex_dir


def find_content_files(formex_dir):
    """Find main document and annex files."""
    main_file = None
    annex_files = []
    
    for f in sorted(formex_dir.iterdir()):
        if f.suffix != '.xml':
            continue
        
        stem = f.stem
        
        # Main document: .000101 or .0001xx pattern
        if '.0001' in stem or '.000101' in stem:
            main_file = f
        # Annex files: .0009xx pattern (annexes are usually in 9xx range)
        elif '.0009' in stem:
            annex_files.append(f)
        # Also check for other high numbered sequences
        elif '.0002' in stem or '.0003' in stem or '.0004' in stem:
            annex_files.append(f)
    
    return main_file, annex_files


def convert_with_annexes(main_file, annex_files, output_path):
    """Convert main document and append annex content."""
    # Convert main document
    main_content = convert_formex_to_md(str(main_file), None)
    
    # Convert each annex and append
    for annex_file in annex_files:
        annex_content = convert_formex_to_md(str(annex_file), None)
        if annex_content and len(annex_content.strip()) > 20:
            main_content += "\n\n" + annex_content
    
    # Write combined output
    Path(output_path).write_text(main_content, encoding='utf-8')
    return len(main_content)


def process_one(folder_name, celex, base_dir, temp_dir):
    """Process a single implementing act."""
    folder_path = base_dir / folder_name
    md_file = folder_path / f"{celex}.md"
    
    print(f"\n📄 {folder_name}")
    print(f"   CELEX: {celex}")
    
    # Check current file for ## ANNEX
    current_has_annex = False
    if md_file.exists():
        content = md_file.read_text(encoding='utf-8')
        if '## ANNEX' in content or '## Annex' in content:
            current_has_annex = True
            print(f"   ✓ Already has ANNEX section")
            return "skip"
    
    # Download fresh Formex
    print(f"   Downloading Formex...")
    formex_dir = download_and_extract(celex, temp_dir)
    if not formex_dir:
        print(f"   ✗ Download failed")
        return "error"
    
    # Find content files
    main_file, annex_files = find_content_files(formex_dir)
    
    if not main_file:
        print(f"   ✗ No main document found")
        return "error"
    
    print(f"   Found: {main_file.name}")
    if annex_files:
        print(f"   Annexes: {[f.name for f in annex_files]}")
    else:
        print(f"   No separate annex files")
    
    # Convert with annexes
    print(f"   Converting...")
    try:
        size = convert_with_annexes(main_file, annex_files, md_file)
        print(f"   ✓ Written: {size:,} bytes")
        
        # Check if annex was added
        content = md_file.read_text(encoding='utf-8')
        if '## ANNEX' in content:
            return "fixed_with_annex"
        else:
            return "converted_no_annex"
    except Exception as e:
        print(f"   ✗ Conversion error: {e}")
        return "error"


def main():
    import tempfile
    import shutil
    
    base_dir = Path(__file__).parent.parent / "02_implementing_acts"
    
    # Skip 2025_0847 as we already fixed it manually
    skip_list = ["2025_0847_Security_Breach_Response"]
    
    results = {"skip": 0, "fixed_with_annex": 0, "converted_no_annex": 0, "error": 0}
    
    print("=" * 60)
    print("Batch Annex Fix for Implementing Acts")
    print("=" * 60)
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        for folder_name, celex in IMPLEMENTING_ACTS.items():
            if folder_name in skip_list:
                print(f"\n⏭️  {folder_name} (already fixed)")
                continue
            
            # Clean temp dir for each document
            formex_dir = temp_path / "formex"
            if formex_dir.exists():
                shutil.rmtree(formex_dir)
            
            result = process_one(folder_name, celex, base_dir, temp_path)
            results[result] += 1
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"  Skipped (already had ANNEX): {results['skip']}")
    print(f"  Fixed with ANNEX:            {results['fixed_with_annex']}")
    print(f"  Converted (no annex needed): {results['converted_no_annex']}")
    print(f"  Errors:                      {results['error']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
