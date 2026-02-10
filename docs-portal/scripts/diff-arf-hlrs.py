#!/usr/bin/env python3
"""
ARF High-Level Requirements Diff Tool

Compares two ARF HLR CSV files (e.g., v2.7.3 vs v2.8.0) and generates a
structured markdown impact report showing added, removed, emptied, and
text-changed HLRs grouped by topic.

Usage:
    python3 diff-arf-hlrs.py <old_csv> <new_csv> [--output <file.md>]

Example:
    python3 diff-arf-hlrs.py \
        /home/ivan/dev/eIDAS20/03_arf/hltr/high-level-requirements.csv \
        /tmp/arf_v280/hltr/high-level-requirements.csv \
        --output /tmp/arf-diff-report.md

CSV Format Notes:
    - Encoding: UTF-8 with BOM (use encoding='utf-8-sig')
    - Delimiter: semicolon (;)
    - Columns: Harmonized_ID, Part, Category, Topic, Topic_Number,
               Topic_Title, Subsection, Index, Requirement_specification, Notes
"""

import csv
import sys
import argparse


def load_hlrs(path):
    """Load HLRs from an ARF CSV file into a dict keyed by Harmonized_ID."""
    hlrs = {}
    with open(path, newline='', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            hlr_id = row.get('Harmonized_ID', '')
            hlrs[hlr_id] = {
                'index': row.get('Index', ''),
                'text': row.get('Requirement_specification', ''),
                'topic_num': row.get('Topic_Number', ''),
                'category': row.get('Category', ''),
                'topic_title': row.get('Topic_Title', ''),
                'notes': row.get('Notes', ''),
            }
    return hlrs


def generate_report(old_path, new_path):
    """Generate a markdown diff report comparing two HLR CSV files."""
    old = load_hlrs(old_path)
    new = load_hlrs(new_path)

    added = sorted(set(new.keys()) - set(old.keys()))
    removed = sorted(set(old.keys()) - set(new.keys()))

    changed_text = []
    changed_notes = []
    for hlr_id in sorted(set(old.keys()) & set(new.keys())):
        if old[hlr_id]['text'] != new[hlr_id]['text']:
            changed_text.append(hlr_id)
        if old[hlr_id]['notes'] != new[hlr_id]['notes']:
            changed_notes.append(hlr_id)

    lines = []
    lines.append(f"# ARF HLR Diff Report")
    lines.append(f"")
    lines.append(f"**Old:** `{old_path}`")
    lines.append(f"**New:** `{new_path}`")
    lines.append(f"")
    lines.append(f"| Metric | Count |")
    lines.append(f"|--------|-------|")
    lines.append(f"| HLRs in old | {len(old)} |")
    lines.append(f"| HLRs in new | {len(new)} |")
    lines.append(f"| **Added** | **{len(added)}** |")
    lines.append(f"| **Removed** | **{len(removed)}** |")
    lines.append(f"| **Text changed** | **{len(changed_text)}** |")
    lines.append(f"| Notes changed | {len(changed_notes)} |")

    # --- Added ---
    lines.append(f"\n## Added HLRs ({len(added)})\n")
    topics_added = {}
    for hlr_id in added:
        h = new[hlr_id]
        t = h['topic_num']
        if t not in topics_added:
            topics_added[t] = []
        topics_added[t].append((hlr_id, h))
    for t_num in sorted(topics_added.keys(), key=lambda x: int(x) if x.isdigit() else 999):
        items = topics_added[t_num]
        title = items[0][1]['topic_title']
        lines.append(f"### Topic {t_num}: {title} (+{len(items)} HLRs)\n")
        for hlr_id, h in items:
            lines.append(f"- **{hlr_id}** (`{h['index']}`): {h['text'][:250]}")
            if h['notes']:
                lines.append(f"  - *Note:* {h['notes'][:200]}")
        lines.append("")

    # --- Removed ---
    if removed:
        lines.append(f"\n## Removed HLRs ({len(removed)})\n")
        for hlr_id in removed:
            h = old[hlr_id]
            lines.append(f"- **{hlr_id}** (`{h['index']}`) [Topic {h['topic_num']}]: {h['text'][:250]}")
        lines.append("")

    # --- Changed ---
    lines.append(f"\n## Changed HLR Texts ({len(changed_text)})\n")
    topics_changed = {}
    for hlr_id in changed_text:
        t = old[hlr_id]['topic_num']
        if t not in topics_changed:
            topics_changed[t] = []
        topics_changed[t].append(hlr_id)
    for t_num in sorted(topics_changed.keys(), key=lambda x: int(x) if x.isdigit() else 999):
        items = topics_changed[t_num]
        lines.append(f"### Topic {t_num} ({len(items)} changes)\n")
        for hlr_id in items:
            idx = old[hlr_id]['index']
            ot = old[hlr_id]['text']
            nt = new[hlr_id]['text']
            if ot.strip() == 'Empty' and nt.strip() != 'Empty':
                lines.append(f"- **{hlr_id}** (`{idx}`): ⚡ **Was empty, now has content:** {nt[:250]}")
            elif nt.strip() == 'Empty' and ot.strip() != 'Empty':
                lines.append(f"- **{hlr_id}** (`{idx}`): ⚠️ **Emptied** (was: {ot[:200]})")
            else:
                lines.append(f"- **{hlr_id}** (`{idx}`): text modified")
        lines.append("")

    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(
        description='Compare two ARF HLR CSV files and generate a diff report'
    )
    parser.add_argument('old_csv', help='Path to the old (current) HLR CSV file')
    parser.add_argument('new_csv', help='Path to the new (target) HLR CSV file')
    parser.add_argument('--output', '-o', help='Output file path (default: stdout)')
    args = parser.parse_args()

    report = generate_report(args.old_csv, args.new_csv)

    if args.output:
        with open(args.output, 'w') as f:
            f.write(report)
        print(f"Report written to {args.output}")
    else:
        print(report)


if __name__ == '__main__':
    main()
