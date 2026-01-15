#!/usr/bin/env python3
"""
Cellar ID Discovery Utility
============================

One-time utility to discover cellar IDs for documents and update documents.yaml.

This is a MAINTENANCE utility, NOT part of the main pipeline.
Run this when:
- Adding new documents
- A cellar ID becomes invalid
- Initial setup

Usage:
    python discover_cellar_ids.py                    # Discover missing IDs
    python discover_cellar_ids.py --celex 32024R1183 # Discover specific document
    python discover_cellar_ids.py --all              # Rediscover all IDs
    python discover_cellar_ids.py --dry-run          # Show what would be discovered

After running, review and commit the updated documents.yaml.
"""

import argparse
import re
import sys
import urllib.request
from pathlib import Path

import yaml

SCRIPT_DIR = Path(__file__).parent
CONFIG_FILE = SCRIPT_DIR / "documents.yaml"


def discover_cellar_id(celex: str) -> str | None:
    """
    Discover the Formex cellar ID for a CELEX number.
    
    Returns the cellar ID (uuid.version.subversion format) or None if not found.
    """
    print(f"   🔍 Discovering cellar ID for {celex}...")
    
    # Step 1: Download XML notice
    notice_url = f"https://eur-lex.europa.eu/legal-content/EN/TXT/XML/?uri=CELEX:{celex}"
    
    try:
        req = urllib.request.Request(notice_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as response:
            content = response.read()
    except Exception as e:
        print(f"   ❌ Failed to download notice: {e}")
        return None
    
    # Step 2: Try to find OJ reference for fmx4 format
    oj_match = re.search(rb'resource/oj/([A-Z]_\d+)\.ENG\.fmx4', content)
    if oj_match:
        oj_ref = oj_match.group(1).decode()
        print(f"   📄 Found OJ reference: {oj_ref}")
        
        # Step 3: Download RDF to get cellar ID
        rdf_url = f"http://publications.europa.eu/resource/oj/{oj_ref}.ENG.fmx4"
        try:
            req = urllib.request.Request(rdf_url, headers={
                'Accept': 'application/rdf+xml, */*',
                'User-Agent': 'Mozilla/5.0'
            })
            with urllib.request.urlopen(req, timeout=30) as response:
                rdf_content = response.read().decode('utf-8', errors='ignore')
            
            # Extract cellar ID with version numbers
            cellar_match = re.search(r'resource/cellar/([a-f0-9-]+\.\d+\.\d+)', rdf_content)
            if cellar_match:
                cellar_id = cellar_match.group(1)
                print(f"   ✅ Found: {cellar_id}")
                return cellar_id
                
        except Exception as e:
            print(f"   ⚠️  RDF lookup failed: {e}")
    
    # Step 4: Fallback - try to find cellar ID directly in notice (for consolidated acts)
    # Look for versioned cellar IDs
    cellar_matches = re.findall(rb'resource/cellar/([a-f0-9-]+\.\d+\.\d+)', content)
    if cellar_matches:
        # Filter for English XML versions (typically .0006.01 or .0006.02)
        for match in cellar_matches:
            cellar_id = match.decode()
            if '.0006.' in cellar_id:  # English language code
                print(f"   ✅ Found (fallback): {cellar_id}")
                return cellar_id
        
        # If no .0006, return first match
        cellar_id = cellar_matches[0].decode()
        print(f"   ⚠️  Found (first match): {cellar_id}")
        return cellar_id
    
    print(f"   ❌ No cellar ID found")
    return None


def load_config() -> dict:
    """Load existing configuration."""
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f) or {'version': '1.0', 'documents': []}
    return {'version': '1.0', 'documents': []}


def save_config(config: dict):
    """Save configuration back to YAML."""
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        yaml.dump(config, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
    print(f"\n✅ Saved: {CONFIG_FILE}")


def main():
    parser = argparse.ArgumentParser(
        description="Discover cellar IDs for documents and update documents.yaml"
    )
    parser.add_argument('--celex', help='Discover only this CELEX number')
    parser.add_argument('--all', action='store_true',
                        help='Rediscover all cellar IDs (even existing ones)')
    parser.add_argument('--dry-run', action='store_true',
                        help='Show what would be discovered without updating')
    
    args = parser.parse_args()
    
    config = load_config()
    documents = config.get('documents', [])
    
    if not documents:
        print("❌ No documents in configuration")
        print("   Run: python init_documents_yaml.py first")
        return 1
    
    print("="*60)
    print("🔍 Cellar ID Discovery Utility")
    print(f"   Documents: {len(documents)}")
    print(f"   Mode: {'dry-run' if args.dry_run else 'update'}")
    print("="*60)
    
    updated = 0
    failed = 0
    
    for doc in documents:
        celex = doc['celex']
        
        # Filter if --celex specified
        if args.celex and celex != args.celex:
            continue
        
        # Skip if already has cellar_id (unless --all)
        if doc.get('cellar_id') and not args.all:
            print(f"\n⏭️  {celex}: Already has cellar_id")
            continue
        
        print(f"\n📄 {celex}: {doc.get('title', 'Unknown')}")
        
        cellar_id = discover_cellar_id(celex)
        
        if cellar_id:
            if not args.dry_run:
                doc['cellar_id'] = cellar_id
            updated += 1
        else:
            failed += 1
    
    # Summary
    print("\n" + "="*60)
    print("📊 Summary")
    print(f"   ✅ Discovered: {updated}")
    print(f"   ❌ Failed: {failed}")
    print("="*60)
    
    # Save if not dry-run
    if not args.dry_run and updated > 0:
        save_config(config)
        print("\n⚠️  Review the changes and commit documents.yaml")
    
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
