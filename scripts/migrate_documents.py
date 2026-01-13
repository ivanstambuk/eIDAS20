#!/usr/bin/env python3
"""
Document Migration Script v1.0
==============================
Backs up current Markdown files, re-converts from Formex XML using v3 converter,
and creates a comparison report to identify content differences.

Steps:
1. Backup current .md files to .md.bak
2. Download fresh Formex XML for each document
3. Convert using formex_to_md_v3.py
4. Compare old vs new content
5. Generate report of differences
"""

import os
import sys
import shutil
import difflib
from pathlib import Path
from datetime import datetime

# Add scripts dir to path
sys.path.insert(0, str(Path(__file__).parent))

from formex_to_md_v3 import convert_formex_to_md
from eurlex_formex import download_formex_xml


# Document catalog with CELEX IDs
DOCUMENTS = {
    "01_regulation": [
        ("32024R1183", "2024_1183_eIDAS2_Amending", "Amending Regulation (EU) 2024/1183"),
        # Consolidated version requires different handling
    ],
    "02_implementing_acts": [
        ("32024R2977", "2024_2977_PID_and_EAA", "PID and EAA"),
        ("32024R2978", "2024_2978_TSP_List_Publication", "TSP List Publication"),
        ("32024R2979", "2024_2979_Integrity_Core_Functions", "Integrity Core Functions"),
        ("32024R2980", "2024_2980_Notifications", "Notifications"),
        ("32024R2981", "2024_2981_Certification", "Certification"),
        ("32024R2982", "2024_2982_Protocols_Interfaces", "Protocols Interfaces"),
        ("32025R0847", "2025_0847_Security_Breach_Response", "Security Breach Response"),
        ("32025R0848", "2025_0848_Relying_Party_Registration", "Relying Party Registration"),
        ("32025R0849", "2025_0849_Certified_Wallet_List", "Certified Wallet List"),
        ("32025R1568", "2025_1568_Peer_Reviews_eID", "Peer Reviews eID"),
        ("32025R1944", "2025_1944_Electronic_Delivery", "Electronic Delivery"),
        ("32025R1945", "2025_1945_Signature_Validation", "Signature Validation"),
        ("32025R2160", "2025_2160_Non_Qualified_TS_Risks", "Non-Qualified TS Risks"),
        ("32025R2162", "2025_2162_CAB_Accreditation", "CAB Accreditation"),
        ("32025D2164", "2025_2164_Trusted_Lists", "Trusted Lists"),
    ]
}


def find_md_file(dir_path):
    """Find the main .md file in a directory."""
    dir_path = Path(dir_path)
    for f in dir_path.glob("*.md"):
        if f.name.startswith("32") and not f.name.endswith(".bak"):
            return f
    # Fallback to any .md file (except README)
    for f in dir_path.glob("*.md"):
        if f.name.lower() != "readme.md" and not f.name.endswith(".bak"):
            return f
    return None


def backup_file(md_path):
    """Create a backup of the markdown file."""
    bak_path = Path(str(md_path) + ".bak")
    if md_path.exists():
        shutil.copy2(md_path, bak_path)
        print(f"  Backed up: {md_path.name} -> {bak_path.name}")
        return bak_path
    return None


def compare_content(old_content, new_content):
    """Compare old and new content, return analysis."""
    old_lines = old_content.splitlines()
    new_lines = new_content.splitlines()
    
    # Calculate basic metrics
    old_len = len(old_content)
    new_len = len(new_content)
    len_diff = new_len - old_len
    len_pct = (len_diff / old_len * 100) if old_len > 0 else 0
    
    # Find unique content in each
    old_set = set(line.strip() for line in old_lines if line.strip())
    new_set = set(line.strip() for line in new_lines if line.strip())
    
    only_in_old = old_set - new_set
    only_in_new = new_set - old_set
    
    # Count significant additions (lines with actual content)
    sig_additions = [l for l in only_in_new if len(l) > 20]
    sig_removals = [l for l in only_in_old if len(l) > 20]
    
    return {
        "old_bytes": old_len,
        "new_bytes": new_len,
        "diff_bytes": len_diff,
        "diff_pct": len_pct,
        "only_in_old": len(only_in_old),
        "only_in_new": len(only_in_new),
        "sig_additions": len(sig_additions),
        "sig_removals": len(sig_removals),
        "sample_additions": list(sig_additions)[:5],
        "sample_removals": list(sig_removals)[:5],
    }


def generate_diff_file(old_path, new_content, output_dir):
    """Generate a unified diff file for review."""
    if not old_path.exists():
        return None
    
    old_content = old_path.read_text(encoding='utf-8')
    old_lines = old_content.splitlines(keepends=True)
    new_lines = new_content.splitlines(keepends=True)
    
    diff = list(difflib.unified_diff(
        old_lines, new_lines,
        fromfile=f"OLD: {old_path.name}",
        tofile=f"NEW: {old_path.name}",
        lineterm=''
    ))
    
    if diff:
        diff_path = output_dir / f"{old_path.stem}.diff"
        diff_path.write_text('\n'.join(diff), encoding='utf-8')
        return diff_path
    return None


def run_migration(base_dir, dry_run=True):
    """Run the full migration process."""
    base_path = Path(base_dir)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Create migration report directory
    report_dir = base_path / f"_migration_{timestamp}"
    report_dir.mkdir(exist_ok=True)
    
    report_lines = [
        f"# Migration Report - {timestamp}",
        "",
        f"Mode: {'DRY RUN (no changes)' if dry_run else 'LIVE MIGRATION'}",
        "",
        "## Document Analysis",
        "",
    ]
    
    results = []
    
    for category, docs in DOCUMENTS.items():
        report_lines.append(f"### {category}")
        report_lines.append("")
        
        for celex, dir_name, title in docs:
            doc_dir = base_path / category / dir_name
            
            if not doc_dir.exists():
                report_lines.append(f"- **{title}**: Directory not found")
                continue
            
            md_file = find_md_file(doc_dir)
            if md_file is None:
                report_lines.append(f"- **{title}**: No .md file found")
                continue
            
            print(f"\nProcessing: {title}")
            print(f"  File: {md_file}")
            
            # Read current content
            old_content = md_file.read_text(encoding='utf-8')
            
            # Find XML file
            xml_files = list(doc_dir.glob("*.xml"))
            
            if not xml_files:
                # Need to download
                print(f"  No XML found - would need to download")
                report_lines.append(f"- **{title}**: No XML source, download required")
                continue
            
            xml_file = xml_files[0]
            print(f"  XML: {xml_file.name}")
            
            # Convert with v3
            try:
                new_content = convert_formex_to_md(xml_file, None)
            except Exception as e:
                report_lines.append(f"- **{title}**: Conversion error: {e}")
                continue
            
            # Compare
            comparison = compare_content(old_content, new_content)
            
            report_lines.append(f"- **{title}** ({celex})")
            report_lines.append(f"  - Size change: {comparison['old_bytes']:,} → {comparison['new_bytes']:,} ({comparison['diff_bytes']:+,} bytes, {comparison['diff_pct']:+.1f}%)")
            report_lines.append(f"  - Lines only in OLD: {comparison['only_in_old']}")
            report_lines.append(f"  - Lines only in NEW: {comparison['only_in_new']}")
            
            if comparison['sample_additions']:
                report_lines.append(f"  - Sample new content:")
                for sample in comparison['sample_additions'][:3]:
                    report_lines.append(f"    > {sample[:80]}...")
            
            if comparison['sample_removals']:
                report_lines.append(f"  - ⚠️ Content in OLD but not NEW:")
                for sample in comparison['sample_removals'][:3]:
                    report_lines.append(f"    > {sample[:80]}...")
            
            report_lines.append("")
            
            # Generate diff file
            diff_path = generate_diff_file(md_file, new_content, report_dir)
            if diff_path:
                print(f"  Diff saved: {diff_path.name}")
            
            if not dry_run:
                # Backup and replace
                backup_file(md_file)
                md_file.write_text(new_content, encoding='utf-8')
                print(f"  Updated: {md_file.name}")
            
            results.append({
                "title": title,
                "celex": celex,
                "comparison": comparison
            })
    
    # Summary
    report_lines.append("---")
    report_lines.append("")
    report_lines.append("## Summary")
    report_lines.append("")
    
    total_old = sum(r['comparison']['old_bytes'] for r in results)
    total_new = sum(r['comparison']['new_bytes'] for r in results)
    report_lines.append(f"- Total documents processed: {len(results)}")
    report_lines.append(f"- Total size change: {total_old:,} → {total_new:,} bytes ({total_new - total_old:+,})")
    
    # Documents with potential content loss
    potential_loss = [r for r in results if r['comparison']['sig_removals'] > 5]
    if potential_loss:
        report_lines.append("")
        report_lines.append("### ⚠️ Documents requiring manual review (potential content loss)")
        for r in potential_loss:
            report_lines.append(f"- {r['title']}: {r['comparison']['sig_removals']} significant lines only in OLD")
    
    # Write report
    report_path = report_dir / "MIGRATION_REPORT.md"
    report_path.write_text('\n'.join(report_lines), encoding='utf-8')
    print(f"\n✅ Report saved: {report_path}")
    
    return report_path, results


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Migrate documents using v3 converter")
    parser.add_argument("--dir", default=".", help="Base directory")
    parser.add_argument("--live", action="store_true", help="Actually perform migration (default: dry run)")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("Document Migration Script v1.0")
    print("=" * 60)
    
    run_migration(args.dir, dry_run=not args.live)
