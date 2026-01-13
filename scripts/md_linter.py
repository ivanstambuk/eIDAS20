#!/usr/bin/env python3
"""
Markdown Linter for EUR-Lex converted documents.
Checks for common pandoc conversion artifacts and formatting issues.
"""
import re
import sys
from pathlib import Path
from dataclasses import dataclass
from typing import List


@dataclass
class LintIssue:
    line_num: int
    rule: str
    message: str
    severity: str  # 'error', 'warning', 'info'
    content: str


def lint_markdown(file_path: str) -> List[LintIssue]:
    """Lint a markdown file for common issues."""
    issues = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines, 1):
        stripped = line.rstrip()
        
        # Rule 1: Standalone backslash (pandoc line break artifact)
        if re.match(r'^\s*\\\s*$', stripped):
            issues.append(LintIssue(
                line_num=i,
                rule='PANDOC001',
                message='Standalone backslash (pandoc line break artifact)',
                severity='warning',
                content=stripped[:50]
            ))
        
        # Rule 2: Excessively long horizontal rule
        if re.match(r'^-{20,}$', stripped):
            issues.append(LintIssue(
                line_num=i,
                rule='PANDOC002',
                message='Excessively long horizontal rule (should be ---)',
                severity='warning',
                content=f'{stripped[:20]}... ({len(stripped)} chars)'
            ))
        
        # Rule 3: Pandoc div markers (:::)
        if re.match(r'^:{3,}', stripped):
            issues.append(LintIssue(
                line_num=i,
                rule='PANDOC003',
                message='Pandoc div marker (unconverted HTML structure)',
                severity='error',
                content=stripped[:60]
            ))
        
        # Rule 4: Pandoc attribute syntax {.class} or {#id}
        if re.search(r'\{[.#][^}]+\}', stripped):
            issues.append(LintIssue(
                line_num=i,
                rule='PANDOC004',
                message='Pandoc attribute syntax (unconverted class/id)',
                severity='warning',
                content=stripped[:60]
            ))
        
        # Rule 5: Broken markdown links with onclick
        if 'onclick=' in stripped.lower():
            issues.append(LintIssue(
                line_num=i,
                rule='HTML001',
                message='HTML onclick attribute in markdown',
                severity='error',
                content=stripped[:60]
            ))
        
        # Rule 6: EUR-Lex modification markers (▼M1, ▼B, etc.)
        if re.search(r'▼[A-Z]\d*', stripped):
            issues.append(LintIssue(
                line_num=i,
                rule='EURLEX001',
                message='EUR-Lex modification marker (should be removed)',
                severity='info',
                content=stripped[:60]
            ))
        
        # Rule 7: Empty list items like "(a) " with nothing after
        if re.match(r'^\s*\([a-z]+\)\s*$', stripped):
            issues.append(LintIssue(
                line_num=i,
                rule='FORMAT001',
                message='Empty list item marker (content on wrong line)',
                severity='warning',
                content=stripped
            ))
        
        # Rule 8: Standalone em-dash markers (Formex list artifact)
        # Em-dash (—) on its own line indicates content is on wrong line
        if re.match(r'^\s*—\s*$', stripped):
            issues.append(LintIssue(
                line_num=i,
                rule='FORMAT002',
                message='Standalone em-dash marker (content on wrong line)',
                severity='warning',
                content=stripped
            ))
        
        # Rule 9: Standalone parenthesized numbered markers like "(1)" or "(2)" on their own
        if re.match(r'^\s*\(\d+\)\s*$', stripped):
            issues.append(LintIssue(
                line_num=i,
                rule='FORMAT003',
                message='Empty parenthesized number marker (content on wrong line)',
                severity='warning',
                content=stripped
            ))
        
        # Rule 10: Standalone line-numbered markers like "1." or "2." on their own
        if re.match(r'^\s*\d+\.\s*$', stripped):
            issues.append(LintIssue(
                line_num=i,
                rule='FORMAT004',
                message='Empty numbered line marker (content on wrong line)',
                severity='warning',
                content=stripped
            ))
        
        # Rule 11: Letter markers not formatted as list items
        # Detects "(a) text" that should be "- (a) text" for proper nesting
        # Only warns if there's leading whitespace (suggesting it should be nested)
        if re.match(r'^\s+\([a-z]+\)\s+\S', line) and not re.match(r'^\s+-\s+\([a-z]+\)', line):
            issues.append(LintIssue(
                line_num=i,
                rule='FORMAT005',
                message='Letter marker should be list item for proper indentation (add "- " prefix)',
                severity='warning',
                content=stripped[:60] + '...' if len(stripped) > 60 else stripped
            ))
        
        # Rule 12: Lines starting with single quotes (Formex conversion artifact)
        # Detects both headers and regular text lines starting with orphan quotes
        if re.match(r"^'[^']+", line) or re.match(r"^#{1,6}\s+'", line):
            issues.append(LintIssue(
                line_num=i,
                rule='FORMAT006',
                message='Line starts with single quote (Formex artifact - remove quote)',
                severity='warning',
                content=stripped[:60] + '...' if len(stripped) > 60 else stripped
            ))
        
        # Rule 13: Consecutive horizontal rules (redundant separators)
        # Check if this line is a horizontal rule and so was a recent previous line
        if re.match(r'^---+$', stripped):
            # Look back to find if there's another --- with only blank lines between
            for j in range(i - 2, max(0, i - 6), -1):  # Check up to 5 lines back
                prev_stripped = lines[j].rstrip()
                if re.match(r'^---+$', prev_stripped):
                    issues.append(LintIssue(
                        line_num=i,
                        rule='FORMAT007',
                        message='Consecutive horizontal rule (redundant - merge with previous)',
                        severity='warning',
                        content=stripped
                    ))
                    break
                elif prev_stripped:  # Non-empty line that isn't ---
                    break  # Not consecutive, stop checking
        
        # Rule 14: Horizontal rule immediately before a header (redundant)
        # Headers already have built-in visual separation in renderers
        if re.match(r'^---+$', stripped):
            # Look ahead to find if next non-blank line is a header
            for j in range(i, min(len(lines), i + 4)):  # Check next 3 lines
                next_stripped = lines[j].rstrip()
                if next_stripped and not re.match(r'^---+$', next_stripped):
                    if re.match(r'^#{1,6}\s+', next_stripped):
                        issues.append(LintIssue(
                            line_num=i,
                            rule='FORMAT008',
                            message='Horizontal rule before header (redundant - headers have built-in styling)',
                            severity='warning',
                            content=stripped
                        ))
                    break
    
    return issues


def print_report(file_path: str, issues: List[LintIssue], use_ascii: bool = False) -> int:
    """Print lint report and return exit code."""
    # Define icons with ASCII fallbacks for Windows terminals
    if use_ascii:
        ok_icon, file_icon, err_icon, warn_icon, info_icon = "[OK]", "[FILE]", "[ERR]", "[WARN]", "[INFO]"
    else:
        ok_icon, file_icon, err_icon, warn_icon, info_icon = "OK", "FILE", "ERR", "WARN", "INFO"
    
    if not issues:
        print(f"{ok_icon} {file_path}: No issues found")
        return 0
    
    # Group by severity
    errors = [i for i in issues if i.severity == 'error']
    warnings = [i for i in issues if i.severity == 'warning']
    infos = [i for i in issues if i.severity == 'info']
    
    print(f"\n{'='*60}")
    print(f"{file_icon} {file_path}")
    print(f"   {len(errors)} errors, {len(warnings)} warnings, {len(infos)} info")
    print(f"{'='*60}")
    
    icon_map = {'error': err_icon, 'warning': warn_icon, 'info': info_icon}
    for issue in issues:
        icon = icon_map[issue.severity]
        print(f"  {icon} Line {issue.line_num}: [{issue.rule}] {issue.message}")
        print(f"     -> {issue.content}")
    
    return 1 if errors else 0


def main():
    if len(sys.argv) < 2:
        print("Usage: python md_linter.py <file.md> [file2.md ...]")
        print("       python md_linter.py --dir <directory>")
        sys.exit(1)
    
    files = []
    
    if sys.argv[1] == '--dir':
        directory = Path(sys.argv[2]) if len(sys.argv) > 2 else Path('.')
        files = list(directory.rglob('*.md'))
    else:
        files = [Path(f) for f in sys.argv[1:]]
    
    exit_code = 0
    total_issues = 0
    
    for file_path in files:
        if not file_path.exists():
            print(f"[ERR] File not found: {file_path}")
            continue
        
        issues = lint_markdown(str(file_path))
        total_issues += len(issues)
        
        if print_report(str(file_path), issues, use_ascii=True) != 0:
            exit_code = 1
    
    print(f"\n{'='*60}")
    print(f"Total: {len(files)} files checked, {total_issues} issues found")
    
    sys.exit(exit_code)


if __name__ == '__main__':
    main()
