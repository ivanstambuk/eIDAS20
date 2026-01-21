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
        32008R0765 → ('2008', '765')          # Regulation
        32014R0910 → ('2014', '910')          # Regulation
        32015R1501 → ('2015', '1501')          # Implementing Regulation
        02019R0881-20250204 → ('2019', '881')  # Consolidated Regulation
        32002L0058 → ('2002', '58')            # Directive
        02002L0058-20091219 → ('2002', '58')   # Consolidated Directive
    
    Returns (year, number) tuple.
    """
    # Standard CELEX format: 3YYYY[R|L]NNNN (3=sector, YYYY=year, R=regulation/L=directive, NNNN=number)
    match = re.match(r'3(\d{4})[RL](\d+)', celex)
    if match:
        year, num = match.groups()
        return (year, str(int(num)))  # int() removes leading zeros
    
    # Consolidated CELEX format: 0YYYY[R|L]NNNN-YYYYMMDD (0=consolidated)
    match = re.match(r'0(\d{4})[RL](\d+)-\d{8}', celex)
    if match:
        year, num = match.groups()
        return (year, str(int(num)))
    
    raise ValueError(f"Invalid CELEX format: {celex}")


def detect_document_type(soup: BeautifulSoup) -> str:
    """
    Detect the document type from the HTML content.
    
    Returns:
        'dir' for Directives
        'reg_impl' for Implementing Regulations
        'reg_del' for Delegated Regulations
        'reg' for regular Regulations (default)
    """
    content = soup.find(id='document1') or soup.find(id='docHtml') or soup
    
    # Check standard EUR-Lex format (oj-doc-ti class)
    for p in content.find_all('p', class_='oj-doc-ti'):
        text = p.get_text().strip().upper()
        if 'DIRECTIVE' in text:
            return 'dir'
        if 'IMPLEMENTING REGULATION' in text:
            return 'reg_impl'
        if 'DELEGATED REGULATION' in text:
            return 'reg_del'
    
    # Check consolidated HTML format (title-doc-first class)
    for p in content.find_all('p', class_='title-doc-first'):
        text = p.get_text().strip().upper()
        if 'DIRECTIVE' in text:
            return 'dir'
        if 'IMPLEMENTING REGULATION' in text:
            return 'reg_impl'
        if 'DELEGATED REGULATION' in text:
            return 'reg_del'
    
    return 'reg'


def is_consolidated_format(soup: BeautifulSoup) -> bool:
    """Check if this is consolidated HTML format (vs standard EUR-Lex format)."""
    # Consolidated format uses 'eli-main-title' div and 'title-doc-first' class
    return soup.find('div', class_='eli-main-title') is not None


def download_html(celex: str, max_retries: int = 10) -> str:
    """
    Download regulation/directive HTML from EUR-Lex CELEX endpoint.
    
    Args:
        celex: CELEX number (e.g., '32015R1501', '02002L0058-20091219')
        max_retries: Maximum retry attempts for 202 responses
        
    Note: We use the CELEX-based URL which works for all document types.
    EUR-Lex returns HTTP 202 (Accepted) for consolidated documents while 
    generating them on-demand. We MUST use a Session to persist cookies,
    otherwise each retry starts a new generation job.
    """
    import time
    
    url = f"https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:{celex}"
    
    print(f"  Downloading from {url}...")
    
    # Use a Session to persist cookies across retries (CRITICAL for 202 handling)
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })
    
    for attempt in range(max_retries):
        response = session.get(url, timeout=60)
        
        # Check for successful response with content
        if response.status_code == 200 and len(response.text) > 100:
            return response.text
        
        # 202 means "Accepted but processing" - EUR-Lex is generating the document
        if response.status_code == 202 or len(response.text) < 100:
            if attempt < max_retries - 1:
                # Check for Retry-After header, otherwise use progressive backoff
                wait_time = int(response.headers.get("Retry-After", 3 + (attempt * 2)))
                print(f"    EUR-Lex returned {response.status_code} (generating document), retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
                continue
        
        response.raise_for_status()
    
    raise RuntimeError(f"Failed to download {celex} after {max_retries} retries (EUR-Lex may be unavailable)")


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


def extract_metadata(soup: BeautifulSoup, celex: str, doc_type: str = 'reg') -> dict:
    """
    Extract document metadata.
    
    Args:
        soup: Parsed HTML
        celex: CELEX number
        doc_type: Document type ('dir', 'reg', 'reg_impl', 'reg_del')
    """
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
    main_title = title_parts[0] if title_parts else f"Document {celex}"
    
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
        if len(text) > 80 and not text.upper().startswith('REGULATION') and not text.upper().startswith('IMPLEMENTING') and not text.upper().startswith('COMMISSION') and not text.upper().startswith('DIRECTIVE'):
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
    
    # Build ELI URL based on document type
    eli_path = doc_type  # 'dir', 'reg', 'reg_impl', or 'reg_del'
    
    # Determine document type label
    doc_type_labels = {
        'dir': 'Directive (EC)',
        'reg': 'Regulation (EC)',
        'reg_impl': 'Implementing Regulation (EU)',
        'reg_del': 'Delegated Regulation (EU)'
    }
    doc_type_label = doc_type_labels.get(doc_type, 'Regulation')
    
    return {
        'celex': celex,
        'title': main_title,
        'date': date_str,
        'subject': subject,
        'eea_note': eea_note,
        'oj_reference': oj_ref,
        'eli': f"http://data.europa.eu/eli/{eli_path}/{year}/{num}/oj",
        'year': year,
        'number': num,
        'doc_type': doc_type,
        'doc_type_label': doc_type_label,
        'eurlex_url': f"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:{celex}"
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
    
    Output structure (matching 765/2008 pattern):
        ## Preamble
        THE EUROPEAN COMMISSION,
        *Having regard to...*
        Whereas:
        ## Recitals
        - (1) First recital...
    
    Returns list of Markdown lines.
    """
    content = soup.find(id='document1') or soup
    
    # Find all oj-normal paragraphs as a list (need index access for lookahead)
    normal_paras = list(content.find_all('p', class_='oj-normal'))
    
    institutional_body = []  # THE EUROPEAN PARLIAMENT/COMMISSION
    having_regard_clauses = []  # "Having regard to..."
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
        
        # Before recitals: categorize preamble content
        if not found_first_recital and not past_recitals:
            text_upper = text.upper()
            if 'THE EUROPEAN PARLIAMENT' in text_upper or 'THE EUROPEAN COMMISSION' in text_upper or 'THE COUNCIL' in text_upper:
                # Institutional body (not italicized)
                institutional_body.append(text)
            elif any(kw in text_upper for kw in ['HAVING REGARD', 'ACTING IN ACCORDANCE', 'AFTER CONSULTING']):
                # "Having regard to..." clauses (italicized in output)
                having_regard_clauses.append(text)
        
        i += 1
    
    # Build output (matching 765/2008 structure)
    result = []
    
    # 1. Preamble heading FIRST (not after institutional formula)
    result.append("## Preamble")
    result.append("")
    
    # 3. "Having regard to..." clauses (italicized)
    # Re-check institutional_body for misclassified "Having regard" clauses
    # (This can happen when Having regard appears before institutional header in HTML)
    filtered_institutional = []
    for line in institutional_body:
        if any(kw in line.upper() for kw in ['HAVING REGARD', 'ACTING IN ACCORDANCE', 'AFTER CONSULTING']):
            having_regard_clauses.append(line)
        else:
            filtered_institutional.append(line)
    
    # Output the filtered institutional body
    for line in filtered_institutional:
        result.append(line)
        result.append("")
    
    # Then output all Having regard clauses (italicized)
    for line in having_regard_clauses:
        result.append(f"*{line}*")
        result.append("")
    
    # 4. "Whereas:" transition
    result.append("Whereas:")
    result.append("")
    
    # 5. Recitals section
    result.append("## Recitals")
    result.append("")
    
    # 6. Individual recitals (as list items for gutter icon functionality per DEC-XXX)
    for num, text in recitals:
        result.append(f"- ({num}) {text}")
        result.append("")
    
    # 7. Enacting formula
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
            # Format: heading is just "Article N", title is bold text below (matches Formex)
            if i + 1 < len(all_p):
                next_p = all_p[i + 1]
                next_classes = next_p.get('class', [])
                if 'oj-sti-art' in next_classes:
                    title = clean_text(next_p.get_text())
                    lines.append(f"### {text}")
                    lines.append("")
                    lines.append(f"**{title}**")
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
    
    EUR-Lex HTML structure for annexes (more complex than originally documented):
        <div id="anx_1">
            <p class="oj-doc-ti">ANNEX</p>
            <p class="oj-ti-grseq-1"><span class="oj-bold">Title of Annex</span></p>
            <p class="oj-ti-grseq-1">1.   <span class="oj-bold">Section heading</span></p>
            <p class="oj-normal">Intro text...</p>
            <table>  <!-- Points (a), (b), etc. are in tables -->
                <tr><td>(a)</td><td>content</td></tr>
            </table>
        </div>
    
    Returns list of Markdown lines.
    """
    lines = []
    content = soup.find(id='document1') or soup
    
    # Find annex containers by id pattern
    for annex_div in content.find_all('div', id=re.compile(r'^anx_', re.I)):
        annex_id = annex_div.get('id', '')
        
        # Extract annex number from id (anx_I -> I, anx_II -> II, anx_1 -> 1)
        annex_num_match = re.search(r'anx_([IVX]+|\d+)', annex_id, re.I)
        if not annex_num_match:
            continue
        
        annex_num = annex_num_match.group(1).upper()
        # Convert numeric to Roman if single digit for consistency
        if annex_num.isdigit():
            roman_map = {1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X'}
            annex_num = roman_map.get(int(annex_num), annex_num)
        
        lines.append("")
        lines.append("---")
        lines.append("")
        lines.append(f"## ANNEX {annex_num}")
        lines.append("")
        
        # Process all elements in document order
        for child in annex_div.descendants:
            if not hasattr(child, 'name') or child.name is None:
                continue
            
            classes = child.get('class', [])
            
            # Skip the ANNEX header itself (oj-doc-ti)
            if child.name == 'p' and 'oj-doc-ti' in classes:
                text = clean_text(child.get_text())
                if text.upper().startswith('ANNEX'):
                    continue
            
            # oj-ti-grseq-1: Annex title or numbered section heading
            if child.name == 'p' and 'oj-ti-grseq-1' in classes:
                text = clean_text(child.get_text())
                if not text:
                    continue
                
                # Check for numbered section: "1.   Section title"
                num_section_match = re.match(r'^(\d+)\.\s+(.+)$', text)
                if num_section_match:
                    num, section_title = num_section_match.groups()
                    lines.append(f"**{num}. {section_title}**")
                    lines.append("")
                else:
                    # It's the annex title (italic for distinction)
                    lines.append(f"*{text}*")
                    lines.append("")
                continue
            
            # Tables contain points (a), (b), etc. - output as list items for gutter icons
            if child.name == 'table':
                for row in child.find_all('tr'):
                    cells = row.find_all('td')
                    if len(cells) >= 2:
                        point = clean_text(cells[0].get_text())
                        content_text = clean_text(cells[1].get_text())
                        if point and content_text:
                            # Use list format so rehype assigns IDs for gutter icons
                            lines.append(f"- {point} {content_text}")
                continue
            
            # Regular paragraphs (oj-normal) - intro text etc.
            if child.name == 'p' and 'oj-normal' in classes:
                # Skip if this p is inside a table (already handled)
                if child.find_parent('table'):
                    continue
                text = clean_text(child.get_text())
                if text:
                    lines.append(text)
                    lines.append("")
                continue
    
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
    doc_type_label = metadata.get('doc_type_label', 'Regulation (EC)')
    
    lines.append(f"> **CELEX:** {metadata['celex']} | **Document:** {doc_type_label} No {num}/{year}")
    lines.append("> ")
    lines.append(f"> **Source:** [EUR-Lex]({metadata['eurlex_url']})")
    if metadata.get('oj_reference'):
        # Try to format OJ reference properly
        oj_ref = metadata['oj_reference']
        lines.append(f"> **Official Journal:** OJ {oj_ref}")
    lines.append(f"> **ELI:** {metadata['eli']}")
    lines.append(f"> **In force:** Current consolidated version: {datetime.now().strftime('%d/%m/%Y')}")
    # EEA relevance goes in metadata blockquote (consistent with 765/2008 pattern)
    if metadata.get('eea_note'):
        lines.append(f"> **EEA Relevance:** Yes")
    lines.append("")
    
    # 2. Document title (full legal title including date and subject)
    # The date ("of DATE") and subject ("on SUBJECT") are part of the formal legal title
    # but are NOT repeated in the body - they're already displayed in the header component.
    # This matches how 765/2008 and other regulations are structured.
    lines.append(f"# {metadata['title']}")
    lines.append("")
    
    # NOTE: Date, subject, and EEA note are NOT output here anymore.
    # - Date: Extracted and used in header (via build-content.js extractDate)
    # - Subject: Part of the legal title (already shown in header subtitle)
    # - EEA note: Now in metadata blockquote above
    # This prevents redundant "of 8 September 2015" / "on the interoperability..." 
    # appearing at the start of body content.
    
    # 3. Preamble (institutional formula + recitals)
    lines.extend(preamble)
    
    # 4. Enacting Terms marker
    lines.append("## Enacting Terms")
    lines.append("")
    
    # 5. Chapters and Articles
    lines.extend(chapters)
    
    # 6. Signatories
    lines.extend(signatories)
    
    # 7. Annexes
    if annexes:
        lines.extend(annexes)
    
    # NOTE: No "Source Reference" footer — metadata is in header blockquote only (DECISIONS.md)
    
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
    
    # Detect document type (directive, regular regulation, implementing, delegated)
    doc_type_str = detect_document_type(soup)
    print(f"  Detected document type: {doc_type_str}")
    
    # Check if this is consolidated HTML format
    is_consolidated = is_consolidated_format(soup)
    if is_consolidated:
        print("  Detected consolidated HTML format — using specialized parser")
        return convert_consolidated_html(soup, celex, doc_type_str)
    
    # Standard EUR-Lex format extraction
    print("  Extracting metadata...")
    metadata = extract_metadata(soup, celex, doc_type_str)
    
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


def convert_consolidated_html(soup: BeautifulSoup, celex: str, doc_type_str: str) -> str:
    """
    Convert consolidated EUR-Lex HTML format to Markdown.
    
    Consolidated documents have a different structure:
    - eli-main-title div with title-doc-first/title-doc-last classes
    - eli-subdivision divs for articles (id="art_1", "art_2", etc.)
    - title-article-norm for article numbers
    - stitle-article-norm for article titles  
    - div.norm or p.norm for paragraph content
    - modref class for amendment markers (►B, ►M1, ►M2)
    """
    lines = []
    
    content = soup.find(id='docHtml') or soup
    
    # Extract metadata
    year, num = celex_to_eli(celex)
    
    # Get title from title-doc-first elements
    title_parts = []
    main_title = content.find('div', class_='eli-main-title')
    if main_title:
        for p in main_title.find_all('p', class_=['title-doc-first', 'title-doc-last']):
            text = clean_text(p.get_text())
            if text:
                title_parts.append(text)
    
    doc_title = title_parts[0] if title_parts else f"Document {celex}"
    
    # Document type label
    doc_type_labels = {
        'dir': 'Directive (EC)',
        'reg': 'Regulation (EC)',
        'reg_impl': 'Implementing Regulation (EU)',
        'reg_del': 'Delegated Regulation (EU)'
    }
    doc_type_label = doc_type_labels.get(doc_type_str, 'Regulation')
    
    # Get OJ reference
    oj_ref = ""
    oj_elem = content.find('p', class_='title-doc-oj-reference')
    if oj_elem:
        oj_ref = clean_text(oj_elem.get_text())
    
    # Build ELI URL
    eli_path = doc_type_str
    eli_url = f"http://data.europa.eu/eli/{eli_path}/{year}/{num}/oj"
    eurlex_url = f"https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:{celex}"
    
    # Metadata header
    lines.append(f"> **CELEX:** {celex} | **Document:** {doc_type_label} No {num}/{year}")
    lines.append("> ")
    lines.append(f"> **Source:** [EUR-Lex]({eurlex_url})")
    if oj_ref:
        lines.append(f"> **Official Journal:** {oj_ref}")
    lines.append(f"> **ELI:** {eli_url}")
    lines.append(f"> **Consolidated:** This is a consolidated text incorporating all amendments")
    lines.append("")
    
    # Document title
    lines.append(f"# {doc_title}")
    lines.append("")
    
    # Add subtitle if available
    if len(title_parts) > 1:
        for part in title_parts[1:]:
            if not part.startswith('(OJ'):  # Skip OJ reference
                lines.append(f"*{part}*")
                lines.append("")
    
    # Extract articles from eli-subdivision elements
    lines.append("## Enacting Terms")
    lines.append("")
    
    for article_div in content.find_all('div', class_='eli-subdivision', id=re.compile(r'^art_')):
        article_id = article_div.get('id', '')
        
        # Get article number
        article_num_elem = article_div.find('p', class_='title-article-norm')
        if article_num_elem:
            article_num = clean_text(article_num_elem.get_text())
            lines.append(f"### {article_num}")
            lines.append("")
        
        # Get article title
        article_title_elem = article_div.find('p', class_='stitle-article-norm')
        if article_title_elem:
            article_title = clean_text(article_title_elem.get_text())
            lines.append(f"**{article_title}**")
            lines.append("")
        
        # Process article content
        for elem in article_div.find_all(['p', 'div'], class_='norm', recursive=False):
            # Skip amendment markers (modref class)
            if 'modref' in elem.get('class', []):
                continue
            
            # Check for paragraph numbers (no-parag class)
            para_num = elem.find('span', class_='no-parag')
            if para_num:
                num_text = clean_text(para_num.get_text())
                # Get the content (inline-element div or remaining text)
                content_elem = elem.find('div', class_='inline-element')
                if content_elem:
                    content_text = clean_text(content_elem.get_text())
                else:
                    content_text = clean_text(elem.get_text())
                    # Remove the number prefix
                    content_text = content_text.replace(num_text, '', 1).strip()
                
                lines.append(f"{num_text}{content_text}")
                lines.append("")
            else:
                text = clean_text(elem.get_text())
                if text and '►' not in text and '▼' not in text:  # Skip amendment markers
                    lines.append(text)
                    lines.append("")
        
        # Process definition lists (grid-container grid-list)
        for grid in article_div.find_all('div', class_='grid-container'):
            if 'grid-list' in grid.get('class', []):
                # Get the letter/number (point indicator)
                point_elem = grid.find('div', class_='list')
                point_text = clean_text(point_elem.get_text()) if point_elem else ""
                
                # Get the content
                content_elem = grid.find('div', class_='grid-list-column-2')
                if content_elem:
                    content_text = clean_text(content_elem.get_text())
                    if content_text:
                        lines.append(f"- {point_text} {content_text}")
        
        lines.append("")  # Blank line between articles
    
    # Note: Consolidated documents typically don't have preamble in the consolidated view
    # They reference the original document for recitals
    
    return '\n'.join(lines)


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
    
    # Validate CELEX format (standard or consolidated, regulation or directive)
    # Standard: 3YYYY[R|L]NNNN (e.g., 32008R0765 for regulation, 32002L0058 for directive)
    # Consolidated: 0YYYY[R|L]NNNN-YYYYMMDD (e.g., 02019R0881-20250204, 02002L0058-20091219)
    if not re.match(r'^(3\d{4}[RL]\d+|0\d{4}[RL]\d+-\d{8})$', celex):
        print(f"Error: Invalid CELEX format: {celex}")
        print("Expected format: 3YYYY[R|L]NNNN (e.g., 32008R0765 or 32002L0058)")
        print("            or: 0YYYY[R|L]NNNN-YYYYMMDD (e.g., 02019R0881-20250204)")
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
