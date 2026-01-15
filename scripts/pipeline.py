#!/usr/bin/env python3
"""
eIDAS Document Conversion Pipeline
===================================

Single entry point for converting all eIDAS documents from Formex XML to Markdown.

Usage:
    python pipeline.py                    # Convert all documents
    python pipeline.py --only 32024R1183  # Convert single document
    python pipeline.py --skip-download    # Use cached ZIP files
    python pipeline.py --force            # Force reconvert all
    python pipeline.py --validate-only    # Only run validation

The pipeline is fully deterministic - all configuration comes from documents.yaml.
If a cellar_id is missing, the pipeline will fail with instructions to run
the discovery utility.
"""

import argparse
import hashlib
import os
import shutil
import sys
import urllib.request
import zipfile
from datetime import datetime
from pathlib import Path

import yaml

# Add scripts directory to path
SCRIPT_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_DIR))

from formex_to_md_v3 import convert_formex_to_md

# Configuration
CONFIG_FILE = SCRIPT_DIR / "documents.yaml"
CACHE_DIR = SCRIPT_DIR / ".cache"
BASE_DIR = SCRIPT_DIR.parent


def load_config():
    """Load document configuration from YAML."""
    if not CONFIG_FILE.exists():
        print(f"❌ Configuration file not found: {CONFIG_FILE}")
        print("   Run: python scripts/init_documents_yaml.py")
        sys.exit(1)
    
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def download_formex(doc: dict, force: bool = False) -> Path:
    """
    Download Formex ZIP for a document.
    
    Returns path to the cached ZIP file.
    """
    celex = doc['celex']
    cellar_id = doc.get('cellar_id')
    
    if not cellar_id:
        print(f"   ❌ Missing cellar_id for {celex}")
        print(f"      Run: python scripts/discover_cellar_ids.py --celex {celex}")
        print(f"      Then update documents.yaml with the discovered ID")
        raise ValueError(f"Missing cellar_id for {celex}")
    
    # Cache path
    CACHE_DIR.mkdir(exist_ok=True)
    cache_path = CACHE_DIR / f"{celex}.fmx4.zip"
    
    # Skip if cached (unless force)
    if cache_path.exists() and not force:
        print(f"   📦 Using cached: {cache_path.name}")
        return cache_path
    
    # Download from cellar
    cellar_url = f"http://publications.europa.eu/resource/cellar/{cellar_id}"
    print(f"   ⬇️  Downloading from: {cellar_url}")
    
    req = urllib.request.Request(cellar_url, headers={
        'Accept': 'application/zip',
        'User-Agent': 'Mozilla/5.0 eIDAS-Pipeline/1.0'
    })
    
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            data = response.read()
            
            # Validate it's a ZIP
            if not data.startswith(b'PK'):
                raise ValueError(f"Expected ZIP, got: {data[:20]}")
            
            with open(cache_path, 'wb') as f:
                f.write(data)
            
            print(f"   ✅ Downloaded: {len(data):,} bytes")
            return cache_path
            
    except Exception as e:
        print(f"   ❌ Download failed: {e}")
        raise


def extract_formex(zip_path: Path, output_dir: Path) -> Path:
    """
    Extract Formex XML from ZIP.
    
    Returns path to the main XML file.
    """
    xml_dir = output_dir / "formex"
    
    # Clean existing
    if xml_dir.exists():
        shutil.rmtree(xml_dir)
    xml_dir.mkdir(parents=True, exist_ok=True)
    
    # Extract
    with zipfile.ZipFile(zip_path, 'r') as zf:
        zf.extractall(xml_dir)
        files = zf.namelist()
    
    print(f"   📂 Extracted: {len(files)} files")
    
    # Find main XML:
    # 1. Prefer .000101. pattern (standard Formex naming)
    # 2. Exclude .doc.xml (document metadata, not content)
    # 3. Otherwise, pick the largest XML file
    xml_files = [f for f in xml_dir.iterdir() if f.suffix == '.xml']
    
    # Filter and score XML files
    candidates = []
    for f in xml_files:
        score = 0
        if '.000101.' in f.name:
            score += 100  # Strong preference for .000101. pattern
        if '.doc.' not in f.name:
            score += 10   # Avoid .doc.xml files
        score += f.stat().st_size // 1000  # Larger files are better
        candidates.append((score, f))
    
    if not candidates:
        raise ValueError(f"No XML file found in: {zip_path}")
    
    # Sort by score descending, pick best
    candidates.sort(key=lambda x: x[0], reverse=True)
    main_xml = candidates[0][1]
    
    print(f"   📄 Main XML: {main_xml.name}")
    return main_xml


def convert_to_markdown(xml_path: Path, output_path: Path) -> int:
    """
    Convert Formex XML to Markdown using the v3 converter.
    
    Returns size of generated file in bytes.
    """
    md_content = convert_formex_to_md(str(xml_path), str(output_path))
    size = len(md_content) if md_content else output_path.stat().st_size
    print(f"   📝 Converted: {output_path.name} ({size:,} bytes)")
    return size


def add_metadata_header(md_path: Path, doc: dict):
    """Add standardized metadata header to the Markdown file."""
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if header already exists
    if content.startswith('> **CELEX:**'):
        return  # Already has header
    
    celex = doc['celex']
    title = doc.get('title', 'Unknown')
    doc_type = doc.get('type', 'regulation')
    
    header = f"""> **CELEX:** {celex} | **Type:** {doc_type.replace('_', ' ').title()}
> **Source:** [EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:{celex})
> **Converted:** {datetime.now().strftime('%Y-%m-%d')} via Pipeline v1.0

"""
    
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(header + content)
    
    print(f"   📋 Added metadata header")


def cleanup_temp_files(output_dir: Path):
    """Remove temporary extraction directory."""
    xml_dir = output_dir / "formex"
    if xml_dir.exists():
        shutil.rmtree(xml_dir)


def process_document(doc: dict, skip_download: bool = False, force: bool = False) -> bool:
    """
    Process a single document through the pipeline.
    
    Returns True if successful, False otherwise.
    """
    celex = doc['celex']
    title = doc.get('title', 'Unknown')
    output_dir = BASE_DIR / doc['output_dir']
    
    print(f"\n{'='*60}")
    print(f"📄 {title}")
    print(f"   CELEX: {celex}")
    print(f"   Output: {doc['output_dir']}")
    
    try:
        # Step 1: Download (or use cache)
        if skip_download:
            cache_path = CACHE_DIR / f"{celex}.fmx4.zip"
            if not cache_path.exists():
                print(f"   ❌ Cache miss: {cache_path}")
                return False
            print(f"   📦 Using cached: {cache_path.name}")
        else:
            cache_path = download_formex(doc, force=force)
        
        # Step 2: Extract
        output_dir.mkdir(parents=True, exist_ok=True)
        xml_path = extract_formex(cache_path, output_dir)
        
        # Step 3: Convert
        md_path = output_dir / f"{celex}.md"
        convert_to_markdown(xml_path, md_path)
        
        # Step 4: Enrich (add metadata)
        add_metadata_header(md_path, doc)
        
        # Cleanup
        cleanup_temp_files(output_dir)
        
        print(f"   ✅ SUCCESS")
        return True
        
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
        return False


def validate_documents():
    """Run validation on all Markdown files."""
    print("\n" + "="*60)
    print("🔍 Running validation (md_linter.py)")
    print("="*60)
    
    # Import md_linter if available
    try:
        from md_linter import lint_directory
        
        errors = 0
        for dir_name in ['01_regulation', '02_implementing_acts']:
            dir_path = BASE_DIR / dir_name
            if dir_path.exists():
                result = lint_directory(dir_path)
                errors += result.get('errors', 0)
        
        if errors == 0:
            print("✅ All documents passed validation")
        else:
            print(f"⚠️  Found {errors} validation errors")
            
    except ImportError:
        print("⚠️  md_linter.py not available, skipping validation")


def main():
    parser = argparse.ArgumentParser(
        description="eIDAS Document Conversion Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python pipeline.py                    # Convert all documents
  python pipeline.py --only 32024R1183  # Convert single document
  python pipeline.py --skip-download    # Use cached ZIP files
  python pipeline.py --force            # Force reconvert all
  python pipeline.py --validate-only    # Only run validation
"""
    )
    parser.add_argument('--only', help='Process only this CELEX number')
    parser.add_argument('--skip-download', action='store_true',
                        help='Use cached downloads only')
    parser.add_argument('--force', action='store_true',
                        help='Force re-download and reconvert')
    parser.add_argument('--validate-only', action='store_true',
                        help='Only run validation, no conversion')
    parser.add_argument('--no-validate', action='store_true',
                        help='Skip validation step')
    
    args = parser.parse_args()
    
    # Load configuration
    config = load_config()
    documents = config.get('documents', [])
    
    print("="*60)
    print("🔄 eIDAS Document Conversion Pipeline")
    print(f"   Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"   Documents: {len(documents)}")
    print(f"   Config: {CONFIG_FILE}")
    print("="*60)
    
    # Validate only mode
    if args.validate_only:
        validate_documents()
        return 0
    
    # Filter documents if --only specified
    if args.only:
        documents = [d for d in documents if d['celex'] == args.only]
        if not documents:
            print(f"❌ Document not found: {args.only}")
            return 1
    
    # Process documents
    success = 0
    failed = 0
    
    for doc in documents:
        if process_document(doc, 
                           skip_download=args.skip_download,
                           force=args.force):
            success += 1
        else:
            failed += 1
    
    # Summary
    print("\n" + "="*60)
    print("📊 Summary")
    print(f"   ✅ Success: {success}")
    print(f"   ❌ Failed: {failed}")
    print("="*60)
    
    # Run validation
    if not args.no_validate and failed == 0:
        validate_documents()
    
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
