#!/usr/bin/env bash
# ============================================================================
# lint-vcq-hlr-refs.sh — Enforce new-style ARF HLR references in VCQ YAML
# ============================================================================
# The ARF v2.8.0 introduced a new structured HLR naming convention:
#   Old: RPI_01, RPA_06, VCR_08, ACC_01, etc.
#   New: AS-RP-51-001, AS-AP-07-003, AS-DM-44-018, etc.
#
# This linter enforces that all HLR references in VCQ requirement YAML files
# use the new AS-XX-YY-ZZZ format. Old-style references are flagged as errors.
#
# Usage:
#   ./scripts/lint-vcq-hlr-refs.sh              # Lint all VCQ YAML files
#   ./scripts/lint-vcq-hlr-refs.sh <file> ...   # Lint specific files
# ============================================================================

set -euo pipefail

# Old-style HLR pattern: 2-5 uppercase letters, underscore, digits, optional
# lowercase suffix (e.g., RPI_01, RPA_06a, RPRC_03b, VCR_08)
# Matches only in hlr: array context (after "- " inside arfReference blocks)
OLD_PATTERN='^\s+- [A-Z]{2,5}_[0-9]+[a-z]?$'

# New-style HLR pattern: AS-XX-YY-ZZZ (e.g., AS-RP-51-001)
NEW_PATTERN='AS-[A-Z]+-[0-9]+-[0-9]+'

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No color

# Determine files to lint
if [ $# -gt 0 ]; then
    FILES=("$@")
else
    FILES=(
        config/vcq/requirements/*.yaml
    )
fi

errors=0
checked=0

for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        continue
    fi
    checked=$((checked + 1))

    # Find old-style HLR references in hlr: sections
    # We look for lines that are array items under hlr: containing old-style IDs
    in_hlr=false
    line_num=0

    while IFS= read -r line; do
        line_num=$((line_num + 1))

        # Detect when we enter an hlr: block
        if echo "$line" | grep -qP '^\s+hlr:'; then
            in_hlr=true
            continue
        fi

        # If we're in an hlr block and see an array item
        if $in_hlr; then
            if echo "$line" | grep -qP '^\s+- '; then
                # Check if it's old-style
                if echo "$line" | grep -qP "$OLD_PATTERN"; then
                    old_ref=$(echo "$line" | grep -oP '[A-Z]{2,5}_[0-9]+[a-z]?')
                    echo -e "${RED}✗${NC} ${file}:${line_num}: Old-style HLR reference '${YELLOW}${old_ref}${NC}' — use new AS-XX-YY-ZZZ format"
                    errors=$((errors + 1))
                fi
            else
                # No longer in array items → exited hlr block
                in_hlr=false
            fi
        fi

        # Also check single-value hlr: lines (e.g., "hlr: RPI_01")
        if echo "$line" | grep -qP '^\s+hlr:\s+[A-Z]{2,5}_[0-9]+[a-z]?\s*$'; then
            old_ref=$(echo "$line" | grep -oP '[A-Z]{2,5}_[0-9]+[a-z]?')
            echo -e "${RED}✗${NC} ${file}:${line_num}: Old-style HLR reference '${YELLOW}${old_ref}${NC}' — use new AS-XX-YY-ZZZ format"
            errors=$((errors + 1))
        fi

    done < "$file"
done

echo ""
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ All $checked file(s) use new-style HLR references${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $errors old-style HLR reference(s) in $checked file(s)${NC}"
    echo -e "   ${YELLOW}Tip:${NC} Use the ARF Annex 2 Category file to find the new-style ID:"
    echo -e "   ${YELLOW}     ${NC}03_arf/docs/annexes/annex-2/annex-2.03-high-level-requirements-by-category.md"
    echo -e "   ${YELLOW}     ${NC}Format: AS-{category}-{topic}-{sequence} (e.g., RPI_01 → AS-RP-51-001)"
    exit 1
fi
