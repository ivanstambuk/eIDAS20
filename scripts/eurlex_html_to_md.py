#!/usr/bin/env python3
"""
EUR-Lex HTML to Markdown Converter
===================================
For regulations without Formex XML (typically pre-2010).
Produces identical structure to formex_to_md_v3.py output.

Usage:
    python eurlex_html_to_md.py <CELEX_NUMBER> <OUTPUT_DIR>
    
Example:
    python eurlex_html_to_md.py 32008R0765 ./01_regulation/765_2008_Market_Surveillance

HTML Source Pattern:
    https://eur-lex.europa.eu/eli/reg/{year}/{number}/oj/eng

CSS Class Reference (EUR-Lex HTML):
    - oj-ti-section-1: Chapter/Section numbers (CHAPTER I, SECTION 1)
    - oj-ti-section-2: Chapter/Section titles (GENERAL PROVISIONS)
    - oj-ti-art: Article numbers (Article 1)
    - oj-sti-art: Article titles (Subject matter and scope)
    - oj-normal: Paragraph text, recitals, definitions
    - oj-doc-ti: Document title, annex titles
    - oj-hd-oj: OJ reference (L 218/30)
    - oj-note: Footnotes
    - oj-signatory: Signatories section
"""

import re
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

import requests
from bs4 import BeautifulSoup, Tag


def celex_to_eli(celex: str) -> tuple[str, str]:
    """
    Convert CELEX to ELI path segment.
    
    Examples:
        32008R0765 → ('2008', '765')
        32014R0910 → ('2014', '910')
    
    Returns (year, number) tuple.
    """
    # CELEX format: 3YYYYRNNNN (3=sector, YYYY=year, R=regulation, NNNN=number)
    match = re.match(r'3(\d{4})R(\d+)', celex)
    if match:
        year, num = match.groups()
        return (year, str(int(num)))  # int() removes leading zeros
    raise ValueError(f"Invalid CELEX format: {celex}")


def download_html(celex: str) -> str:
    """Download regulation HTML from EUR-Lex ELI endpoint."""
    year, num = celex_to_eli(celex)
    url = f"https://eur-lex.europa.eu/eli/reg/{year}/{num}/oj/eng"
    
    print(f"  Downloading from {url}...")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.text


def clean_text(text: str) -> str:
    """Clean and normalize extracted text."""
    if not text:
        return ""
    
    # Normalize whitespace (collapse multiple spaces/newlines)
    text = ' '.join(text.split())
    
    # Clean up quote markers
    text = re.sub(r'\s+,\s*$', ',', text)
    text = re.sub(r'\s+;\s*$', ';', text)
    text = re.sub(r'\s+\.\s*$', '.', text)
    
    return text.strip()


def extract_metadata(soup: BeautifulSoup, celex: str) -> dict:
    """Extract document metadata."""
    content = soup.find(id='document1') or soup
    
    # Document title (multiple oj-doc-ti elements form the full title)
    title_parts = []
    for p in content.find_all('p', class_='oj-doc-ti'):
        text = clean_text(p.get_text())
        # Skip annex titles which also use oj-doc-ti
        if text.upper().startswith('ANNEX'):
            break
        title_parts.append(text)
    
    # Main title is typically the first oj-doc-ti
    main_title = title_parts[0] if title_parts else f"Regulation {celex}"
    
    # Document date (e.g., "of 9 July 2008")
    date_str = ""
    for p in content.find_all('p', class_='oj-doc-ti'):
        text = clean_text(p.get_text())
        if text.startswith('of ') and any(m in text.lower() for m in ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']):
            date_str = text
            break
    
    # Subject matter (longer descriptive title)
    subject = ""
    for p in content.find_all('p', class_='oj-doc-ti'):
        text = clean_text(p.get_text())
        # Subject is the long descriptive part (contains words like "setting", "laying", etc.)
        if len(text) > 80 and not text.upper().startswith('REGULATION'):
            subject = text
            break
    
    # EEA relevance note
    eea_note = ""
    for p in content.find_all('p', class_='oj-doc-ti'):
        text = clean_text(p.get_text())
        if 'EEA relevance' in text:
            eea_note = text
            break
    
    # OJ reference
    oj_ref = ""
    for p in content.find_all('p', class_='oj-hd-oj'):
        oj_ref = clean_text(p.get_text())
        break
    
    year, num = celex_to_eli(celex)
    
    return {
        'celex': celex,
        'title': main_title,
        'date': date_str,
        'subject': subject,
        'eea_note': eea_note,
        'oj_reference': oj_ref,
        'eli': f"http://data.europa.eu/eli/reg/{year}/{num}/oj",
        'year': year,
        'number': num,
        'eurlex_url': f"https://eur-lex.europa.eu/eli/reg/{year}/{num}/oj/eng"
    }


def extract_preamble(soup: BeautifulSoup) -> list[str]:
    """
    Extract the preamble (institutional formula, recitals).
    
    EUR-Lex HTML structure for recitals:
        <p class="oj-normal">(1)</p>
        <p class="oj-normal">It is necessary to ensure that products...</p>
        <p class="oj-normal">(2)</p>
        <p class="oj-normal">It is necessary to establish...</p>
    
    The recital number and content are in SEPARATE adjacent <p> elements.
    
    Returns list of Markdown lines.
    """
    content = soup.find(id='document1') or soup
    
    # Find all oj-normal paragraphs as a list (need index access for lookahead)
    normal_paras = list(content.find_all('p', class_='oj-normal'))
    
    institutional_lines = []
    recitals = []
    pending_recital_num = None
    found_first_recital = False
    past_recitals = False
    enacting_formula = None
    
    i = 0
    while i < len(normal_paras):
        p = normal_paras[i]
        text = clean_text(p.get_text())
        
        if not text:
            i += 1
            continue
        
        # Check if this is a standalone recital number: exactly "(N)" pattern
        standalone_num_match = re.match(r'^\((\d+)\)$', text)
        
        # Check if this is a combined recital: "(N) content..."
        combined_recital_match = re.match(r'^\((\d+)\)\s+(.+)$', text)
        
        if standalone_num_match:
            # This is just the number "(1)" - content is in next element
            found_first_recital = True
            pending_recital_num = standalone_num_match.group(1)
            i += 1
            continue
        
        if combined_recital_match:
            # This has both number and content as "(1) content..."
            found_first_recital = True
            num, content_text = combined_recital_match.groups()
            recitals.append((num, content_text))
            pending_recital_num = None
            i += 1
            continue
        
        if pending_recital_num:
            # This is the content for the pending recital number
            recitals.append((pending_recital_num, text))
            pending_recital_num = None
            i += 1
            continue
        
        # Check for end of recitals (enacting formula)
        if found_first_recital and 'HAVE ADOPTED' in text.upper():
            enacting_formula = text
            past_recitals = True
            i += 1
            continue
        
        # Before recitals: collect institutional preamble
        if not found_first_recital and not past_recitals:
            if any(kw in text.upper() for kw in ['THE EUROPEAN PARLIAMENT', 'HAVING REGARD', 'ACTING IN ACCORDANCE']):
                institutional_lines.append(text)
        
        i += 1
    
    # Build output
    result = []
    
    # Institutional formula (before "Preamble")
    for line in institutional_lines:
        result.append(line)
        result.append("")
    
    # Preamble header
    result.append("## Preamble")
    result.append("")
    result.append("Whereas:")
    result.append("")
    
    # Recitals
    for num, text in recitals:
        result.append(f"({num}) {text}")
        result.append("")
    
    # Enacting formula
    if enacting_formula:
        result.append(enacting_formula)
        result.append("")
    
    return result


def extract_chapters_and_articles(soup: BeautifulSoup) -> list[str]:
    """
    Extract chapters and articles in document order.
    
    EUR-Lex HTML structure for article content:
        <p class="oj-normal">1.</p>
        <p class="oj-normal">This Regulation lays down rules...</p>
        <p class="oj-normal">(a)</p>
        <p class="oj-normal">the conditions under which...</p>
    
    The paragraph number and content are often in SEPARATE adjacent <p> elements.
    
    Returns list of Markdown lines.
    """
    lines = []
    content = soup.find(id='document1') or soup
    
    # Get all p elements as list for index access
    all_p = list(content.find_all('p'))
    
    current_chapter = None
    current_section = None
    article_content = []
    
    # Track state
    past_enacting_formula = False
    pending_para_num = None  # e.g., "1."
    pending_point = None  # e.g., "(a)"
    
    i = 0
    while i < len(all_p):
        p = all_p[i]
        classes = p.get('class', [])
        
        if not classes:
            i += 1
            continue
        
        text = clean_text(p.get_text())
        
        # Check for ANNEX start
        if 'oj-doc-ti' in classes and text.upper().startswith('ANNEX'):
            # Flush any pending content
            if article_content:
                lines.extend(article_content)
            break
        
        # Chapter/Section number
        if 'oj-ti-section-1' in classes:
            # Flush current article content
            if article_content:
                lines.extend(article_content)
                article_content = []
            
            if text.upper().startswith('CHAPTER'):
                current_chapter = text
                current_section = None
            elif text.upper().startswith('SECTION'):
                current_section = text
            past_enacting_formula = True
            i += 1
            continue
        
        # Chapter/Section title
        if 'oj-ti-section-2' in classes and past_enacting_formula:
            if current_chapter:
                lines.append(f"## {current_chapter} — {text}")
                lines.append("")
                current_chapter = None
            elif current_section:
                lines.append(f"### {current_section} — {text}")
                lines.append("")
                current_section = None
            i += 1
            continue
        
        # Article number
        if 'oj-ti-art' in classes:
            # Flush previous article content
            if article_content:
                lines.extend(article_content)
                article_content = []
            
            past_enacting_formula = True
            
            # Look ahead for article title
            if i + 1 < len(all_p):
                next_p = all_p[i + 1]
                next_classes = next_p.get('class', [])
                if 'oj-sti-art' in next_classes:
                    title = clean_text(next_p.get_text())
                    lines.append(f"### {text} — {title}")
                    lines.append("")
                    i += 2  # Skip both article number and title
                    continue
            
            # No title found
            lines.append(f"### {text}")
            lines.append("")
            i += 1
            continue
        
        # Skip article title if processed above
        if 'oj-sti-art' in classes:
            i += 1
            continue
        
        # Normal paragraph content
        if 'oj-normal' in classes and past_enacting_formula:
            if not text:
                i += 1
                continue
            
            # Skip recitals (already extracted in preamble)
            if re.match(r'^\(\d+\)$', text):
                i += 1
                continue
            
            # Check for standalone paragraph number: "1." or "2."
            standalone_para_match = re.match(r'^(\d+)\.$', text)
            if standalone_para_match:
                pending_para_num = standalone_para_match.group(1)
                i += 1
                continue
            
            # Check for standalone point: "(a)" or "(b)"
            standalone_point_match = re.match(r'^(\([a-z]\))$', text)
            if standalone_point_match:
                pending_point = standalone_point_match.group(1)
                i += 1
                continue
            
            # Check for combined paragraph: "1. content..."
            combined_para_match = re.match(r'^(\d+)\.\s+(.+)$', text)
            if combined_para_match:
                num, para_text = combined_para_match.groups()
                article_content.append(f"{num}. {para_text}")
                article_content.append("")
                pending_para_num = None
                i += 1
                continue
            
            # Check for combined point: "(a) content..."
            combined_point_match = re.match(r'^(\([a-z]\))\s+(.+)$', text)
            if combined_point_match:
                point, point_text = combined_point_match.groups()
                article_content.append(f"- {point} {point_text}")
                pending_point = None
                i += 1
                continue
            
            # Content for pending paragraph number
            if pending_para_num:
                article_content.append(f"{pending_para_num}. {text}")
                article_content.append("")
                pending_para_num = None
                i += 1
                continue
            
            # Content for pending point
            if pending_point:
                article_content.append(f"- {pending_point} {text}")
                pending_point = None
                i += 1
                continue
            
            # Regular text (intro paragraph, etc.)
            article_content.append(text)
            article_content.append("")
            i += 1
            continue
        
        # Signatory - end of main content
        if 'oj-signatory' in classes:
            if article_content:
                lines.extend(article_content)
            break
        
        i += 1
    
    # Flush remaining content
    if article_content:
        lines.extend(article_content)
    
    return lines


def extract_definitions(soup: BeautifulSoup) -> dict[str, list[tuple[int, str, str]]]:
    """
    Extract definitions from Article 2 (or similar definitions article).
    
    Returns dict mapping article ID to list of (number, term, definition) tuples.
    """
    definitions = {}
    content = soup.find(id='document1') or soup
    
    # Find Article 2 (Definitions) or similar
    in_definitions_article = False
    article_id = None
    
    for p in content.find_all('p'):
        classes = p.get('class', [])
        text = clean_text(p.get_text())
        
        if 'oj-ti-art' in classes:
            in_definitions_article = False  # Reset
            if 'Article 2' in text:
                article_id = 'article-2'
                in_definitions_article = True
        
        elif 'oj-sti-art' in classes:
            if in_definitions_article and 'Definition' in text:
                definitions[article_id] = []
        
        elif 'oj-normal' in classes and in_definitions_article and article_id in definitions:
            # Look for definition pattern: N. 'term' means...
            # Pattern: 1. 'making available on the market' means...
            def_match = re.match(r"^(\d+)\.\s+'([^']+)'\s+means\s+(.*)$", text)
            if def_match:
                num, term, definition = def_match.groups()
                definitions[article_id].append((int(num), term, definition))
                continue
            
            # Alternative pattern without quotes
            def_match2 = re.match(r"^(\d+)\.\s+(.+?)\s+means\s+(.*)$", text)
            if def_match2:
                num, term, definition = def_match2.groups()
                # Clean up term (remove quotes if present)
                term = term.strip("'\"")
                definitions[article_id].append((int(num), term, definition))
    
    return definitions


def extract_annexes(soup: BeautifulSoup) -> list[str]:
    """
    Extract annexes from the document.
    
    EUR-Lex HTML structure for annexes:
        <div id="anx_I">
            <p class="oj-doc-ti">ANNEX I</p>
            <p class="oj-doc-ti">Title of Annex</p>
            <div class="oj-enumeration-spacing">
                <p style="display: inline;">1.   </p>
                <p style="display: inline;"><span>Content...</span></p>
            </div>
        </div>
    
    Returns list of Markdown lines.
    """
    lines = []
    content = soup.find(id='document1') or soup
    
    # Find annex containers by id pattern
    for annex_div in content.find_all('div', id=re.compile(r'^anx_', re.I)):
        annex_id = annex_div.get('id', '')
        
        # Extract annex number from id (anx_I -> I, anx_II -> II)
        annex_num_match = re.search(r'anx_([IVX]+|\d+)', annex_id, re.I)
        if not annex_num_match:
            continue
        
        annex_num = annex_num_match.group(1).upper()
        
        lines.append("")
        lines.append("---")
        lines.append("")
        lines.append(f"## ANNEX {annex_num}")
        lines.append("")
        
        # Find title (second oj-doc-ti in annex div)
        doc_ti_elements = annex_div.find_all('p', class_='oj-doc-ti')
        for i, p in enumerate(doc_ti_elements):
            text = clean_text(p.get_text())
            if i == 0 and text.upper().startswith('ANNEX'):
                continue  # Skip the ANNEX number header
            if text:
                lines.append(f"### {text}")
                lines.append("")
                break
        
        # Find enumerated content
        for enum_div in annex_div.find_all('div', class_='oj-enumeration-spacing'):
            # Get all text from the div - the number and content are in separate inline <p> elements
            full_text = clean_text(enum_div.get_text())
            if full_text:
                # Check if it starts with a number
                num_match = re.match(r'^(\d+)\.\s+(.*)$', full_text)
                if num_match:
                    num, item_text = num_match.groups()
                    lines.append(f"{num}. {item_text}")
                    lines.append("")
                else:
                    lines.append(full_text)
                    lines.append("")
        
        # Also check for oj-normal paragraphs in annex
        for p in annex_div.find_all('p', class_='oj-normal'):
            text = clean_text(p.get_text())
            if text:
                num_match = re.match(r'^(\d+)\.\s+(.*)$', text)
                if num_match:
                    num, item_text = num_match.groups()
                    lines.append(f"{num}. {item_text}")
                    lines.append("")
                else:
                    lines.append(text)
                    lines.append("")
    
    return lines


def extract_signatories(soup: BeautifulSoup) -> list[str]:
    """Extract signature block."""
    lines = []
    content = soup.find(id='document1') or soup
    
    lines.append("")
    lines.append("---")
    lines.append("")
    
    in_signatory = False
    location_date = None
    
    for p in content.find_all('p'):
        classes = p.get('class', [])
        text = clean_text(p.get_text())
        
        if 'oj-signatory' in classes:
            in_signatory = True
            if text:
                # Check for "Done at X, N Month Year" pattern
                if text.startswith('Done at'):
                    location_date = text
                    lines.append(location_date)
                    lines.append("")
                elif 'Parliament' in text or 'Council' in text:
                    # Institution header
                    lines.append(f"*{text}*")
                elif text.startswith('The President') or text.startswith('The Secretary'):
                    lines.append(text)
                else:
                    # Name (bold)
                    lines.append(f"**{text}**")
                    lines.append("")
    
    return lines


def format_markdown(metadata: dict, preamble: list[str], chapters: list[str], 
                   annexes: list[str], signatories: list[str]) -> str:
    """Assemble all parts into final Markdown."""
    lines = []
    
    # 1. Metadata header (blockquote format - matches Formex output)
    year, num = metadata['year'], metadata['number']
    
    lines.append(f"> **CELEX:** {metadata['celex']} | **Document:** Regulation (EC) No {num}/{year}")
    lines.append("> ")
    lines.append(f"> **Source:** [EUR-Lex]({metadata['eurlex_url']})")
    if metadata.get('oj_reference'):
        # Try to format OJ reference properly
        oj_ref = metadata['oj_reference']
        lines.append(f"> **Official Journal:** OJ {oj_ref}")
    lines.append(f"> **ELI:** {metadata['eli']}")
    lines.append(f"> **In force:** Current consolidated version: {datetime.now().strftime('%d/%m/%Y')}")
    lines.append("")
    
    # 2. Document title
    lines.append(f"# {metadata['title']}")
    lines.append("")
    
    # 3. Date and subject
    if metadata.get('date'):
        lines.append(f"**{metadata['date']}**")
        lines.append("")
    
    if metadata.get('subject'):
        lines.append(f"**{metadata['subject']}**")
        lines.append("")
    
    if metadata.get('eea_note'):
        lines.append(f"*{metadata['eea_note']}*")
        lines.append("")
    
    lines.append("---")
    lines.append("")
    
    # 4. Preamble (institutional formula + recitals)
    lines.extend(preamble)
    
    # 5. Enacting Terms marker
    lines.append("## Enacting Terms")
    lines.append("")
    
    # 6. Chapters and Articles
    lines.extend(chapters)
    
    # 7. Signatories
    lines.extend(signatories)
    
    # 8. Annexes
    if annexes:
        lines.extend(annexes)
    
    # 9. Source Reference footer
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Source Reference")
    lines.append("")
    lines.append(f"- **CELEX Number:** {metadata['celex']}")
    lines.append("- **Source:** EUR-Lex (HTML)")
    lines.append(f"- **URL:** {metadata['eurlex_url']}")
    lines.append(f"- **Conversion Date:** {datetime.now().strftime('%Y-%m-%d')}")
    lines.append("- **Format:** HTML → Markdown (eurlex_html_to_md.py)")
    lines.append("")
    
    return '\n'.join(lines)


def convert_html_to_markdown(celex: str, html_content: Optional[str] = None) -> str:
    """
    Main conversion function.
    
    Args:
        celex: CELEX number (e.g., '32008R0765')
        html_content: Optional pre-fetched HTML content
        
    Returns:
        Markdown string
    """
    # Download HTML if not provided
    if html_content is None:
        html_content = download_html(celex)
    
    # Parse HTML
    print("  Parsing HTML...")
    soup = BeautifulSoup(html_content, 'lxml')
    
    # Extract components
    print("  Extracting metadata...")
    metadata = extract_metadata(soup, celex)
    
    print("  Extracting preamble and recitals...")
    preamble = extract_preamble(soup)
    
    print("  Extracting chapters and articles...")
    chapters = extract_chapters_and_articles(soup)
    
    print("  Extracting annexes...")
    annexes = extract_annexes(soup)
    
    print("  Extracting signatories...")
    signatories = extract_signatories(soup)
    
    # Format output
    print("  Formatting Markdown...")
    markdown = format_markdown(metadata, preamble, chapters, annexes, signatories)
    
    return markdown


def main():
    """CLI entry point."""
    if len(sys.argv) < 3:
        print("Usage: python eurlex_html_to_md.py <CELEX_NUMBER> <OUTPUT_DIR>")
        print("")
        print("Example:")
        print("  python eurlex_html_to_md.py 32008R0765 ./01_regulation/765_2008_Market_Surveillance")
        sys.exit(1)
    
    celex = sys.argv[1]
    output_dir = Path(sys.argv[2])
    
    # Validate CELEX format
    if not re.match(r'^3\d{4}R\d+$', celex):
        print(f"Error: Invalid CELEX format: {celex}")
        print("Expected format: 3YYYYRNNNN (e.g., 32008R0765)")
        sys.exit(1)
    
    print(f"Converting {celex} to Markdown...")
    
    # Convert
    try:
        markdown = convert_html_to_markdown(celex)
    except Exception as e:
        print(f"Error during conversion: {e}")
        sys.exit(1)
    
    # Write output
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"{celex}.md"
    
    print(f"  Writing to {output_file}...")
    output_file.write_text(markdown, encoding='utf-8')
    
    # Summary
    word_count = len(markdown.split())
    line_count = len(markdown.splitlines())
    print(f"\n✅ Conversion complete!")
    print(f"   Output: {output_file}")
    print(f"   Lines: {line_count}")
    print(f"   Words: {word_count}")


if __name__ == '__main__':
    main()
