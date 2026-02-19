#!/usr/bin/env bash
# =============================================================================
# lint-md-blockquotes.sh — Markdown blockquote line-break linter
#
# Detects blockquote lines that are followed by another blockquote line
# but are missing trailing two spaces (required for Markdown line breaks).
#
# Usage:
#   ./scripts/lint-md-blockquotes.sh [--fix] <file1.md> [file2.md ...]
#
# Modes:
#   (default)   Check mode — reports violations, exits non-zero if any found
#   --fix       Auto-fix mode — adds trailing two spaces in-place
#
# Rules:
#   ✅ Flags:   "> **Bold:** text"  followed by another ">" line
#   ✅ Skips:   Last line of a blockquote block (no trailing ">" line)
#   ✅ Skips:   Empty blockquote lines (just ">" or "> ")
#   ✅ Skips:   Lines already ending with two spaces
#   ✅ Skips:   Lines inside fenced code blocks (``` ... ```)
#
# Created: 2026-02-19
# =============================================================================

set -euo pipefail

FIX_MODE=false
FILES=()

# Parse arguments
for arg in "$@"; do
    if [[ "$arg" == "--fix" ]]; then
        FIX_MODE=true
    else
        FILES+=("$arg")
    fi
done

if [[ ${#FILES[@]} -eq 0 ]]; then
    echo "Usage: $0 [--fix] <file1.md> [file2.md ...]"
    exit 0
fi

VIOLATIONS=0
FIXED=0

for file in "${FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "⚠️  File not found: $file"
        continue
    fi

    # Read file into array
    mapfile -t lines < "$file"
    total=${#lines[@]}
    file_violations=0
    in_code_block=false

    for ((i = 0; i < total; i++)); do
        line="${lines[$i]}"

        # Track fenced code blocks (``` or ~~~)
        fence_pattern='^[[:space:]]*(```|~~~)'
        if [[ "$line" =~ $fence_pattern ]]; then
            if $in_code_block; then
                in_code_block=false
            else
                in_code_block=true
            fi
            continue
        fi

        # Skip lines inside code blocks
        if $in_code_block; then
            continue
        fi

        # Only process blockquote lines (starting with >)
        if [[ ! "$line" =~ ^[[:space:]]*\> ]]; then
            continue
        fi

        # Skip empty blockquote lines (just ">" or "> " with optional whitespace)
        stripped="${line#*>}"
        if [[ -z "${stripped// /}" ]]; then
            continue
        fi

        # Check if the NEXT line is also a blockquote line
        next_i=$((i + 1))
        if [[ $next_i -ge $total ]]; then
            continue  # Last line of file — no trailing line needed
        fi

        next_line="${lines[$next_i]}"
        if [[ ! "$next_line" =~ ^[[:space:]]*\> ]]; then
            continue  # Next line is not a blockquote — no trailing spaces needed
        fi

        # Check if current line already ends with two spaces
        if [[ "$line" =~ [[:space:]][[:space:]]$ ]]; then
            continue  # Already has trailing spaces
        fi

        # === VIOLATION FOUND ===
        line_num=$((i + 1))

        if $FIX_MODE; then
            # Add two trailing spaces
            lines[$i]="${line}  "
            ((FIXED++)) || true
        else
            if [[ $file_violations -eq 0 ]]; then
                echo ""
                echo "📄 $file"
            fi
            # Truncate long lines for display
            display_line="$line"
            if [[ ${#display_line} -gt 100 ]]; then
                display_line="${display_line:0:97}..."
            fi
            echo "   L${line_num}: ${display_line}"
            ((file_violations++)) || true
            ((VIOLATIONS++)) || true
        fi
    done

    # Write fixed file back
    if $FIX_MODE && [[ $FIXED -gt 0 ]]; then
        printf '%s\n' "${lines[@]}" > "$file"
    fi
done

if $FIX_MODE; then
    if [[ $FIXED -gt 0 ]]; then
        echo "✅ Fixed $FIXED blockquote line(s) — added trailing spaces"
    else
        echo "✅ No blockquote issues found"
    fi
    exit 0
else
    if [[ $VIOLATIONS -gt 0 ]]; then
        echo ""
        echo "❌ Found $VIOLATIONS blockquote line(s) missing trailing two spaces for line breaks."
        echo "   Run with --fix to auto-repair:  ./scripts/lint-md-blockquotes.sh --fix <files>"
        echo ""
        exit 1
    fi
    exit 0
fi
