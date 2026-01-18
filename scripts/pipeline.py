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


def extract_formex(zip_path: Path, output_dir: Path) -> tuple:
    """
    Extract Formex XML from ZIP.
    
    Returns tuple: (main_xml_path, list_of_annex_xml_paths)
    
    Formex archives contain multiple XML files:
    - .000101.fmx.xml — Main regulation/act document
    - .000XYZ.fmx.xml — Supplementary content (annexes, amendments)
    - .doc.fmx.xml — Document metadata (skip)
    - .toc.fmx.xml — Table of contents (skip)
    - .0001.xml — Alternative main pattern (consolidated docs)
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
    
    # Collect all XML files, categorized
    xml_files = [f for f in xml_dir.iterdir() if f.suffix == '.xml']
    
    main_xml = None
    annex_xmls = []
    
    for f in xml_files:
        name = f.name
        
        # Skip metadata and TOC files
        if '.doc.' in name or '.toc.' in name:
            continue
        
        # Main document patterns:
        # - L_XXXXXXX.000101.fmx.xml (standard Formex)
        # - CLXXXXXXX.0001.xml (consolidated docs)
        if '.000101.' in name or name.endswith('.0001.xml'):
            main_xml = f
        else:
            # All other content XML files are annexes/supplements
            # They have patterns like .000301., .000701., .001001., etc.
            annex_xmls.append(f)
    
    # Fallback: if no main found via pattern, pick the largest non-metadata file
    if main_xml is None:
        content_files = [f for f in xml_files 
                         if '.doc.' not in f.name and '.toc.' not in f.name]
        if content_files:
            content_files.sort(key=lambda f: f.stat().st_size, reverse=True)
            main_xml = content_files[0]
            # Remove from annexes if it was added there
            annex_xmls = [f for f in annex_xmls if f != main_xml]
    
    if main_xml is None:
        raise ValueError(f"No XML file found in: {zip_path}")
    
    # Sort annexes by filename to ensure consistent ordering
    # (e.g., .000301. before .000701. before .001001.)
    annex_xmls.sort(key=lambda f: f.name)
    
    print(f"   📄 Main XML: {main_xml.name}")
    if annex_xmls:
        print(f"   📎 Annexes: {len(annex_xmls)} supplementary file(s)")
        for a in annex_xmls:
            print(f"      - {a.name}")
    
    return (main_xml, annex_xmls)


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
    source = doc.get('source', 'formex')  # Default to formex for pipeline-processed docs
    
    # Format source for display
    source_display = {
        'formex': 'Formex XML',
        'html': 'HTML Parser',
        'manual': 'Manual'
    }.get(source, source.title())
    
    header = f"""> **CELEX:** {celex} | **Type:** {doc_type.replace('_', ' ').title()}
> **Source:** [EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:{celex})
> **Converted:** {datetime.now().strftime('%Y-%m-%d')} via {source_display} Pipeline v1.0

"""
    
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(header + content)
    
    print(f"   📋 Added metadata header (source: {source})")


def validate_annex_extraction(md_path: Path, annex_xmls: list) -> tuple:
    """
    Validate that annexes were properly extracted.
    
    If annex XML files were found in the archive, the output markdown
    should contain corresponding ## ANNEX headings.
    
    Returns: (is_valid: bool, error_message: str or None)
    """
    if not annex_xmls:
        return (True, None)  # No annexes to validate
    
    # Read the output markdown
    content = md_path.read_text(encoding='utf-8')
    
    # Count annex headings in output (## Annex, ## ANNEX, ## Annex I, etc.)
    import re
    annex_headings = re.findall(r'^## (?:Annex|ANNEX)', content, re.MULTILINE)
    annex_count_in_output = len(annex_headings)
    
    # We found N annex XML files, we should have at least 1 annex heading
    # (multiple XML files might produce one combined annex section, so we check >= 1)
    if annex_count_in_output == 0:
        return (False, 
            f"Found {len(annex_xmls)} annex XML file(s) but output has 0 '## Annex' headings. "
            f"Annex files: {[f.name for f in annex_xmls]}")
    
    return (True, None)


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
    
    # Check for skip_pipeline flag
    if doc.get('skip_pipeline'):
        print(f"   ⏭️  Skipping (skip_pipeline=true in config)")
        return True  # Not a failure, just skipped
    
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
        
        # Step 2: Extract (now returns main + annex paths)
        output_dir.mkdir(parents=True, exist_ok=True)
        main_xml, annex_xmls = extract_formex(cache_path, output_dir)
        
        # Step 3: Convert main document
        md_path = output_dir / f"{celex}.md"
        convert_to_markdown(main_xml, md_path)
        
        # Step 3b: Convert and append annexes (if any)
        if annex_xmls:
            annex_count = 0
            for annex_xml in annex_xmls:
                # Convert annex to temporary content (not file)
                annex_content = convert_formex_to_md(str(annex_xml), None)
                if annex_content and annex_content.strip():
                    # Append to main markdown file
                    with open(md_path, 'a', encoding='utf-8') as f:
                        f.write('\n\n')  # Separator
                        f.write(annex_content)
                    annex_count += 1
            
            if annex_count > 0:
                print(f"   📎 Appended {annex_count} annex(es) to output")
        
        # Step 3c: Validate annex extraction (prevent regression)
        is_valid, error_msg = validate_annex_extraction(md_path, annex_xmls)
        if not is_valid:
            raise ValueError(f"Annex validation failed: {error_msg}")
        
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
