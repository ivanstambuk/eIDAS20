#!/usr/bin/env python3
"""
Restore metadata headers that were lost during batch_fix_annexes.py.

The batch fix script overwrote markdown files without preserving the metadata
headers (CELEX, Source, Subject, Converted).

This script:
1. Extracts metadata from git history (commit before c1a7572)
2. Injects metadata back into current files
"""

import subprocess
import re
from pathlib import Path

# Files affected by the batch fix
AFFECTED_FILES = [
    "02_implementing_acts/2024_2977_PID_and_EAA/32024R2977.md",
    "02_implementing_acts/2024_2978_TSP_List_Publication/32024R2978.md",
    "02_implementing_acts/2024_2979_Integrity_Core_Functions/32024R2979.md",
    "02_implementing_acts/2024_2980_Notifications/32024R2980.md",
    "02_implementing_acts/2024_2981_Certification/32024R2981.md",
    "02_implementing_acts/2024_2982_Protocols_Interfaces/32024R2982.md",
    "02_implementing_acts/2025_0846_Cross_Border_Identity/32025R0846.md",
    "02_implementing_acts/2025_0847_Security_Breach_Response/32025R0847.md",
    "02_implementing_acts/2025_0848_Relying_Party_Registration/32025R0848.md",
    "02_implementing_acts/2025_0849_Certified_Wallet_List/32025R0849.md",
    "02_implementing_acts/2025_1566_QC_Identity_Verification/32025R1566.md",
    "02_implementing_acts/2025_1567_Remote_Creation_Devices/32025R1567.md",
    "02_implementing_acts/2025_1568_Peer_Reviews_eID/32025R1568.md",
    "02_implementing_acts/2025_1569_EAA_Verification/32025R1569.md",
    "02_implementing_acts/2025_1570_Certified_Creation_Devices/32025R1570.md",
    "02_implementing_acts/2025_1571_Annual_Reports/32025R1571.md",
    "02_implementing_acts/2025_1572_QTS_Applications/32025R1572.md",
    "02_implementing_acts/2025_1929_Electronic_Timestamps/32025R1929.md",
    "02_implementing_acts/2025_1942_Validation_Services/32025R1942.md",
    "02_implementing_acts/2025_1943_Signature_Standards/32025R1943.md",
    "02_implementing_acts/2025_1944_Electronic_Delivery/32025R1944.md",
    "02_implementing_acts/2025_1945_Signature_Validation/32025R1945.md",
    "02_implementing_acts/2025_1946_Preservation_Services/32025R1946.md",
    "02_implementing_acts/2025_2160_Non_Qualified_TS_Risks/32025R2160.md",
    "02_implementing_acts/2025_2162_CAB_Accreditation/32025R2162.md",
    "02_implementing_acts/2025_2527_Website_Auth_Certs/32025R2527.md",
    "02_implementing_acts/2025_2530_QTSP_Requirements/32025R2530.md",
    "02_implementing_acts/2025_2531_Electronic_Ledgers/32025R2531.md",
    "02_implementing_acts/2025_2532_Archiving_Services/32025R2532.md",
]

# Commit before the batch fix
BEFORE_COMMIT = "c1a7572^"


def get_old_content(file_path: str) -> str:
    """Get file content from before the batch fix."""
    result = subprocess.run(
        ["git", "show", f"{BEFORE_COMMIT}:{file_path}"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"  ERROR: Could not get old content for {file_path}")
        return ""
    return result.stdout


def extract_metadata(content: str) -> str:
    """Extract metadata block (lines starting with '> **') from content."""
    lines = content.split('\n')
    metadata_lines = []
    
    for line in lines:
        if line.startswith('> **'):
            metadata_lines.append(line)
        elif line.startswith('#'):
            # Hit the title, stop
            break
        elif line.strip() == '' and metadata_lines:
            # Empty line after metadata, continue
            continue
        elif metadata_lines:
            # Non-metadata, non-empty line after metadata started = done
            break
    
    return '\n'.join(metadata_lines) if metadata_lines else ""


def fix_file(file_path: str) -> bool:
    """Restore metadata to a file."""
    print(f"Processing: {file_path}")
    
    # Get old content from git
    old_content = get_old_content(file_path)
    if not old_content:
        return False
    
    # Extract metadata
    metadata = extract_metadata(old_content)
    if not metadata:
        print(f"  SKIP: No metadata found in old version")
        return False
    
    # Read current content
    current_path = Path(file_path)
    current_content = current_path.read_text()
    
    # Check if metadata already exists
    if current_content.startswith('> **'):
        print(f"  SKIP: Metadata already present")
        return False
    
    # Inject metadata at the beginning
    new_content = metadata + '\n\n' + current_content
    current_path.write_text(new_content)
    
    print(f"  ✅ Restored metadata ({len(metadata.split(chr(10)))} lines)")
    return True


def main():
    print("=" * 60)
    print("Restoring metadata headers lost during batch annex fix")
    print("=" * 60)
    
    fixed = 0
    skipped = 0
    errors = 0
    
    for file_path in AFFECTED_FILES:
        try:
            if fix_file(file_path):
                fixed += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"  ERROR: {e}")
            errors += 1
    
    print()
    print("=" * 60)
    print(f"Results: {fixed} fixed, {skipped} skipped, {errors} errors")
    print("=" * 60)
    
    if fixed > 0:
        print()
        print("Next steps:")
        print("  1. cd ~/dev/eIDAS20/docs-portal && npm run build:content")
        print("  2. Verify in browser that CELEX and EUR-Lex links are back")
        print("  3. git add -A && git commit -m 'fix: restore metadata headers lost in batch annex fix'")


if __name__ == "__main__":
    main()
