#!/usr/bin/env python3
"""
RCA-VCQ Gap Analysis Script

Usage:
    python3 rca-vcq-gap.py

Finds RCA requirements that aren't covered by VCQ requirements,
identifying potential gaps in intermediary vendor coverage.
"""

import yaml
from pathlib import Path
from collections import defaultdict

def load_rca_requirements(rca_file: Path):
    """Load RCA relying party requirements."""
    with open(rca_file) as f:
        data = yaml.safe_load(f)
    return data.get('requirements', [])

def load_vcq_articles(vcq_dir: Path):
    """Load VCQ article coverage."""
    vcq_articles = set()
    vcq_linked_rca = set()
    
    for yaml_file in vcq_dir.glob("*.yaml"):
        with open(yaml_file) as f:
            data = yaml.safe_load(f)
        
        if not data or 'requirements' not in data:
            continue
            
        for req in data['requirements']:
            # Track legal basis coverage
            if 'legalBasis' in req:
                lb = req['legalBasis']
                key = f"{lb.get('regulation', '')} {lb.get('article', '')}"
                vcq_articles.add(key.strip())
            
            # Track linkedRCA
            for rca_id in req.get('linkedRCA', []):
                vcq_linked_rca.add(rca_id)
    
    return vcq_articles, vcq_linked_rca

def find_gaps(rca_reqs, vcq_articles, vcq_linked_rca):
    """Find RCA requirements not covered by VCQ."""
    gaps = []
    covered = []
    
    for req in rca_reqs:
        rca_id = req.get('id')
        lb = req.get('legalBasis', {})
        article_key = f"{lb.get('regulation', '')} {lb.get('article', '')}".strip()
        
        # Check if covered by linkedRCA or same article
        is_linked = rca_id in vcq_linked_rca
        has_article = any(article_key in va for va in vcq_articles)
        
        if is_linked or has_article:
            covered.append({
                'id': rca_id,
                'article': article_key,
                'coverage': 'linked' if is_linked else 'article'
            })
        else:
            gaps.append({
                'id': rca_id,
                'requirement': req.get('requirement', '')[:60],
                'article': article_key,
                'category': req.get('category', ''),
                'profileFilter': req.get('profileFilter', [])
            })
    
    return gaps, covered

def print_report(gaps, covered, rca_count):
    """Print gap analysis report."""
    
    print("=" * 70)
    print("RCA-VCQ GAP ANALYSIS")
    print("=" * 70)
    
    print(f"\nRCA requirements: {rca_count}")
    print(f"Covered by VCQ:   {len(covered)}")
    print(f"Gaps:             {len(gaps)}")
    
    print(f"\n" + "=" * 70)
    print("GAPS BY CATEGORY")
    print("=" * 70)
    
    by_cat = defaultdict(list)
    for gap in gaps:
        by_cat[gap['category']].append(gap)
    
    for cat, items in sorted(by_cat.items()):
        print(f"\n📁 {cat.upper()} ({len(items)} gaps)")
        for item in items[:5]:  # First 5
            print(f"   {item['id']}: {item['requirement']}")
        if len(items) > 5:
            print(f"   ... and {len(items) - 5} more")
    
    print(f"\n" + "=" * 70)
    print("POTENTIAL ADDITIONS")
    print("=" * 70)
    
    # Filter for intermediary-relevant gaps
    relevant = [g for g in gaps if not g['profileFilter'] or 'acts_as_intermediary' in g['profileFilter']]
    print(f"\nIntermediary-relevant gaps: {len(relevant)}")
    for gap in relevant[:10]:
        print(f"   {gap['id']}: {gap['article']}")

if __name__ == "__main__":
    # Default paths - adjust as needed
    project_root = Path(__file__).parent.parent.parent
    rca_file = project_root / "docs-portal/config/rca/requirements/relying-party.yaml"
    vcq_dir = project_root / "docs-portal/config/vcq/requirements"
    
    if not rca_file.exists():
        rca_file = Path("docs-portal/config/rca/requirements/relying-party.yaml")
        vcq_dir = Path("docs-portal/config/vcq/requirements")
    
    if not rca_file.exists():
        print("Error: RCA file not found")
        exit(1)
    
    rca_reqs = load_rca_requirements(rca_file)
    vcq_articles, vcq_linked_rca = load_vcq_articles(vcq_dir)
    gaps, covered = find_gaps(rca_reqs, vcq_articles, vcq_linked_rca)
    print_report(gaps, covered, len(rca_reqs))
