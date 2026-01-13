#!/usr/bin/env python3
"""
Batch download new eIDAS 2.0 implementing acts discovered on 2026-01-13.

This script downloads and converts all 15 newly discovered implementing acts
from the EC Digital Identity Wallet page that were missing from our catalog.

Uses the established Formex v2 pipeline for highest fidelity conversion.
"""

import os
import sys
import re
import zipfile
import urllib.request
from pathlib import Path
from datetime import datetime

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent))

from formex_to_md_v2 import convert_formex_to_md as convert_formex_v2

# New implementing acts to download (discovered 2026-01-13)
NEW_ACTS = [
    # May 2025 batch - additional
    ("32025R0846", "2025_0846_Cross_Border_Identity", "Cross-border identity matching"),
    
    # July 2025 batch - additional trust services
    ("32025R1566", "2025_1566_QC_Identity_Verification", "Identity and recipients of qualified certificates"),
    ("32025R1567", "2025_1567_Remote_Creation_Devices", "Remote qualified creation devices"),
    ("32025R1569", "2025_1569_EAA_Verification", "Verification of electronic attestation of attributes"),
    ("32025R1570", "2025_1570_Certified_Creation_Devices", "Certified creation devices"),
    ("32025R1571", "2025_1571_Annual_Reports", "Annual reports by supervisory bodies"),
    ("32025R1572", "2025_1572_QTS_Applications", "Qualified trust service applications"),
    
    # September 2025 batch - signatures and timestamps
    ("32025R1929", "2025_1929_Electronic_Timestamps", "Qualified electronic time stamps"),
    ("32025R1942", "2025_1942_Validation_Services", "Recognition of qualified validation services"),
    ("32025R1943", "2025_1943_Signature_Standards", "Reference standards & Validation procedures"),
    ("32025R1946", "2025_1946_Preservation_Services", "Qualified preservation services"),
    
    # October 2025 batch - qualified services
    ("32025R2527", "2025_2527_Website_Auth_Certs", "Qualified certificates for website authentication"),
    ("32025R2530", "2025_2530_QTSP_Requirements", "Qualified trust service providers"),
    ("32025R2531", "2025_2531_Electronic_Ledgers", "Qualified electronic ledgers"),
    ("32025R2532", "2025_2532_Archiving_Services", "Qualified electronic archiving services"),
]


def download_file(url, filepath):
    """Download a file from URL with proper headers."""
    print(f"    GET: {url}")
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            content = response.read()
            with open(filepath, 'wb') as f:
                f.write(content)
        print(f"    Saved: {filepath} ({os.path.getsize(filepath)} bytes)")
        return True
    except Exception as e:
        print(f"    ERROR: {e}")
        return False


def get_formex_url(celex):
    """Get the Formex ZIP URL for a CELEX number via Notice -> RDF -> Cellar chain."""
    # Step 1: Download XML notice
    notice_url = f"https://eur-lex.europa.eu/legal-content/EN/TXT/XML/?uri=CELEX:{celex}"
    notice_path = Path(f"temp_{celex}_notice.xml")
    
    if not download_file(notice_url, notice_path):
        return None
    
    with open(notice_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Step 2: Find OJ reference for fmx4
    oj_match = re.search(r'resource/oj/([A-Z]_\d+)\.ENG\.fmx4', content)
    if not oj_match:
        print(f"    No Formex reference found in notice")
        os.remove(notice_path)
        return None
    
    oj_ref = oj_match.group(1)
    rdf_url = f"http://publications.europa.eu/resource/oj/{oj_ref}.ENG.fmx4"
    
    # Step 3: Download RDF to get cellar URL
    rdf_path = Path(f"temp_{celex}_rdf.xml")
    if not download_file(rdf_url, rdf_path):
        os.remove(notice_path)
        return None
    
    with open(rdf_path, 'r', encoding='utf-8') as f:
        rdf_content = f.read()
    
    # Step 4: Extract cellar URL
    cellar_match = re.search(r'resource/cellar/([a-f0-9-]+\.\d+\.\d+)', rdf_content)
    
    # Clean up temp files
    os.remove(notice_path)
    os.remove(rdf_path)
    
    if cellar_match:
        cellar_id = cellar_match.group(1)
        return f"http://publications.europa.eu/resource/cellar/{cellar_id}"
    
    print(f"    No Cellar URL found in RDF")
    return None


def add_metadata_header(md_path, celex, title):
    """Add standardized metadata header to the markdown file."""
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Create header block
    header = f"""> **CELEX:** {celex} | **Document:** Commission Implementing Regulation
> **Source:** [EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:{celex})
> **Subject:** {title}
> **Converted:** {datetime.now().strftime('%Y-%m-%d')} via Formex v2 pipeline

---

"""
    
    # Prepend header
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(header + content)


def process_act(celex, dir_name, title, base_dir):
    """Download and convert a single implementing act."""
    output_dir = base_dir / dir_name
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n{'='*60}")
    print(f"Processing: {celex} - {title}")
    print(f"{'='*60}")
    
    # Step 1: Get Formex URL
    print("\n  [1/4] Finding Formex manifestation...")
    cellar_url = get_formex_url(celex)
    
    if not cellar_url:
        print(f"  ❌ FAILED: Could not locate Formex for {celex}")
        return False
    
    print(f"    Found: {cellar_url}")
    
    # Step 2: Download ZIP
    print("\n  [2/4] Downloading Formex ZIP...")
    zip_path = output_dir / f"{celex}.fmx4.zip"
    
    req = urllib.request.Request(cellar_url, headers={'Accept': 'application/zip'})
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            content = response.read()
            # Validate ZIP signature
            if not content.startswith(b'PK'):
                print(f"    ❌ Invalid ZIP (got RDF/HTML instead)")
                return False
            with open(zip_path, 'wb') as f:
                f.write(content)
        print(f"    Saved: {zip_path} ({os.path.getsize(zip_path)} bytes)")
    except Exception as e:
        print(f"    ❌ Download failed: {e}")
        return False
    
    # Step 3: Extract ZIP
    print("\n  [3/4] Extracting Formex XML...")
    xml_dir = output_dir / "formex"
    xml_dir.mkdir(exist_ok=True)
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(xml_dir)
            print(f"    Extracted {len(zf.namelist())} files")
    except Exception as e:
        print(f"    ❌ Extraction failed: {e}")
        return False
    
    # Step 4: Convert to Markdown
    print("\n  [4/4] Converting to Markdown (v2 pipeline)...")
    
    # Find main XML file
    main_xml = None
    for f in xml_dir.iterdir():
        if f.suffix == '.xml':
            # Prefer files with .000 pattern (main document)
            if '.000' in f.stem or main_xml is None:
                main_xml = f
    
    if not main_xml:
        print(f"    ❌ No XML file found in ZIP")
        return False
    
    md_path = output_dir / f"{celex}.md"
    try:
        md_content = convert_formex_v2(str(main_xml), str(md_path))
        print(f"    Created: {md_path}")
        
        # Add metadata header
        add_metadata_header(md_path, celex, title)
        print(f"    Added metadata header")
        
        # Count sections
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()
        article_count = len(re.findall(r'^### Article', content, re.MULTILINE))
        annex_count = len(re.findall(r'^## ANNEX', content, re.MULTILINE))
        print(f"    Structure: {article_count} Articles, {annex_count} Annexes")
        
    except Exception as e:
        print(f"    ❌ Conversion failed: {e}")
        return False
    
    print(f"\n  ✅ SUCCESS: {celex}")
    return True


def main():
    base_dir = Path(__file__).parent.parent / "02_implementing_acts"
    
    print("\n" + "="*70)
    print(" eIDAS 2.0 Implementing Acts - Batch Download (Jan 2026 Discovery)")
    print("="*70)
    print(f"\nTarget directory: {base_dir}")
    print(f"Acts to download: {len(NEW_ACTS)}")
    
    results = {"success": [], "failed": []}
    
    for celex, dir_name, title in NEW_ACTS:
        if process_act(celex, dir_name, title, base_dir):
            results["success"].append((celex, title))
        else:
            results["failed"].append((celex, title))
    
    # Summary
    print("\n" + "="*70)
    print(" SUMMARY")
    print("="*70)
    print(f"\n✅ Successful: {len(results['success'])}")
    for celex, title in results["success"]:
        print(f"   - {celex}: {title}")
    
    if results["failed"]:
        print(f"\n❌ Failed: {len(results['failed'])}")
        for celex, title in results["failed"]:
            print(f"   - {celex}: {title}")
    
    print(f"\nTotal: {len(results['success'])}/{len(NEW_ACTS)} completed")
    
    return 0 if not results["failed"] else 1


if __name__ == "__main__":
    sys.exit(main())
