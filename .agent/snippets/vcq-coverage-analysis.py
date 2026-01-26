#!/usr/bin/env python3
"""
VCQ Source Coverage Analysis Script

Usage:
    python3 vcq-coverage-analysis.py

Analyzes VCQ requirements for:
- Legal basis coverage
- ARF reference coverage
- Source distribution by regulation
"""

import yaml
from pathlib import Path
from collections import defaultdict

def analyze_vcq_coverage(vcq_dir: Path):
    """Analyze VCQ requirements for source coverage."""
    
    results = {
        'both': [],
        'legal_only': [],
        'arf_only': [],
        'neither': []
    }
    
    legal_by_reg = defaultdict(list)
    
    for yaml_file in vcq_dir.glob("*.yaml"):
        with open(yaml_file) as f:
            data = yaml.safe_load(f)
        
        if not data or 'requirements' not in data:
            continue
            
        for req in data['requirements']:
            has_legal = 'legalBasis' in req
            has_arf = 'arfReference' in req
            
            entry = {
                'id': req.get('id'),
                'file': yaml_file.name,
                'legal': req.get('legalBasis', {}).get('regulation') if has_legal else None,
                'article': req.get('legalBasis', {}).get('article') if has_legal else None,
                'arf': req.get('arfReference', {}).get('hlr') if has_arf else None
            }
            
            if has_legal:
                key = f"{entry['legal']} {entry['article']}"
                legal_by_reg[key].append(entry['id'])
            
            if has_legal and has_arf:
                results['both'].append(entry)
            elif has_legal:
                results['legal_only'].append(entry)
            elif has_arf:
                results['arf_only'].append(entry)
            else:
                results['neither'].append(entry)
    
    return results, legal_by_reg

def print_report(results, legal_by_reg):
    """Print formatted coverage report."""
    
    print("=" * 70)
    print("VCQ SOURCE COVERAGE ANALYSIS")
    print("=" * 70)
    
    total = sum(len(v) for v in results.values())
    
    print(f"\n✅ BOTH legalBasis AND arfReference ({len(results['both'])} reqs)")
    print(f"✅ legalBasis ONLY ({len(results['legal_only'])} reqs)")
    
    if results['arf_only']:
        print(f"⚠️  arfReference ONLY ({len(results['arf_only'])} reqs) — GAPS:")
        for r in results['arf_only']:
            print(f"   {r['id']:20} | ARF: {r['arf']}")
    else:
        print(f"✅ arfReference ONLY: 0 (All ARF reqs have legal backing)")
    
    if results['neither']:
        print(f"❌ NEITHER source ({len(results['neither'])} reqs)")
        for r in results['neither']:
            print(f"   {r['id']}")
    
    print(f"\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    has_legal = len(results['both']) + len(results['legal_only'])
    has_arf = len(results['both']) + len(results['arf_only'])
    
    print(f"  Total requirements:     {total}")
    print(f"  Has legalBasis:         {has_legal} ({100*has_legal/total:.0f}%)")
    print(f"  Has arfReference:       {has_arf} ({100*has_arf/total:.0f}%)")
    print(f"  Has BOTH:               {len(results['both'])} ({100*len(results['both'])/total:.0f}%)")
    
    print(f"\n" + "=" * 70)
    print("BY REGULATION")
    print("=" * 70)
    
    by_reg = defaultdict(int)
    for key in legal_by_reg:
        reg = key.split()[0]
        by_reg[reg] += len(legal_by_reg[key])
    
    for reg, count in sorted(by_reg.items()):
        print(f"  {reg}: {count} requirements")

if __name__ == "__main__":
    # Default path - adjust as needed
    vcq_dir = Path(__file__).parent.parent.parent / "docs-portal/config/vcq/requirements"
    
    if not vcq_dir.exists():
        vcq_dir = Path("docs-portal/config/vcq/requirements")
    
    if not vcq_dir.exists():
        print("Error: VCQ requirements directory not found")
        print("Run from project root or adjust path in script")
        exit(1)
    
    results, legal_by_reg = analyze_vcq_coverage(vcq_dir)
    print_report(results, legal_by_reg)
