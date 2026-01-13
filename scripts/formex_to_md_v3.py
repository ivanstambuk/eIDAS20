#!/usr/bin/env python3
"""
Formex XML to Markdown Converter v3.0
=====================================
Enhanced converter for EUR-Lex Formex 4 XML format.

Key improvements over v2:
- v2 improvements: Proper recital extraction, nested list handling, footnotes
- v3 FIX: Properly extracts QUOT.S quoted content (replacement text in amendments)
- v3 FIX: Captures content following list items (amendment instructions)
- v3 FIX: Better sibling element traversal for ALINEA content
"""

import re
import sys
from pathlib import Path
import xml.etree.ElementTree as ET


def clean_text(text):
    """Clean and normalize extracted text."""
    if not text:
        return ""
    
    # Normalize whitespace
    text = ' '.join(text.split())
    
    # Clean up quote markers
    text = re.sub(r'\s+,\s*$', ',', text)
    text = re.sub(r'\s+;\s*$', ';', text)
    text = re.sub(r'\s+\.\s*$', '.', text)
    
    return text.strip()


def get_element_text(elem, include_tail=False):
    """
    Extract all text from an element recursively.
    Handles nested elements like NOTE, DATE, REF.DOC.OJ, etc.
    """
    if elem is None:
        return ""
    
    parts = []
    
    # Element's own text
    if elem.text:
        parts.append(elem.text)
    
    # Process children
    for child in elem:
        tag = child.tag
        
        # Skip processing instructions
        if isinstance(tag, str):
            # Handle footnotes/notes - convert to inline reference
            if tag == 'NOTE':
                note_id = child.get('NOTE.ID', '')
                note_text = get_element_text(child)
                # Format as inline footnote
                if note_text:
                    parts.append(f" [{note_text.strip()}]")
            # Handle date elements
            elif tag == 'DATE':
                parts.append(get_element_text(child))
            # Handle Official Journal references
            elif tag == 'REF.DOC.OJ':
                parts.append(get_element_text(child))
            # Handle highlighting/formatting
            elif tag == 'HT':
                ht_type = child.get('TYPE', '')
                inner = get_element_text(child)
                if ht_type == 'ITALIC':
                    parts.append(f"*{inner}*")
                elif ht_type == 'BOLD':
                    parts.append(f"**{inner}**")
                elif ht_type == 'UC':  # Uppercase
                    parts.append(inner)
                else:
                    parts.append(inner)
            # Handle quote markers
            elif tag in ('QUOT.START', 'QUOT.END', 'QUOT.S', 'QUOT.E'):
                code = child.get('CODE', '')
                if code == '201C':
                    parts.append('"')
                elif code == '201D':
                    parts.append('"')
                elif code in ('2018', '2019'):
                    parts.append("'")
            # Handle formatted numbers
            elif tag == 'FT':
                parts.append(get_element_text(child))
            # Recursively process other elements
            else:
                parts.append(get_element_text(child))
        
        # Include tail text
        if child.tail:
            parts.append(child.tail)
    
    return ''.join(parts)


def format_quoted_article(article_elem, indent=""):
    """
    Format an ARTICLE element inside a blockquote with proper structure.
    
    Preserves:
    - Article title (e.g., "Article 1")
    - Article subtitle (e.g., "Subject matter")  
    - Paragraph text
    - Sub-points (a), (b), (c) etc.
    
    Uses blank blockquote lines (>) between sections for proper Markdown
    paragraph separation.
    
    Returns list of blockquoted lines.
    """
    lines = []
    
    # Article title (TI.ART)
    ti_art = article_elem.find('TI.ART')
    if ti_art is not None:
        title = clean_text(get_element_text(ti_art))
        if title:
            lines.append(f"{indent}> *{title}*")
            lines.append(f"{indent}>")  # Blank line for separation
    
    # Article subtitle (STI.ART)
    sti_art = article_elem.find('STI.ART')
    if sti_art is not None:
        subtitle_p = sti_art.find('P')
        if subtitle_p is not None:
            subtitle = clean_text(get_element_text(subtitle_p))
        else:
            subtitle = clean_text(get_element_text(sti_art))
        if subtitle:
            lines.append(f"{indent}> **{subtitle}**")
            lines.append(f"{indent}>")  # Blank line for separation
    
    # Process ALINEA content (main body) - can be directly under ARTICLE or under PARAG
    for alinea in article_elem.findall('.//ALINEA'):
        # First, check if ALINEA has direct text content (not just child elements)
        alinea_text = clean_text(get_element_text(alinea))
        if alinea_text:
            # Check if it's a simple ALINEA with just text (no P or LIST children)
            has_p = alinea.find('P') is not None
            has_list = alinea.find('LIST') is not None
            if not has_p and not has_list:
                lines.append(f"{indent}> {alinea_text}")
                lines.append(f"{indent}>")  # Blank line after paragraph
                continue
        
        # Get paragraph text (P element before LIST)
        for p_elem in alinea.findall('P'):
            # Skip P elements that only contain LIST
            if p_elem.find('LIST') is not None and not p_elem.text:
                continue
            p_text = clean_text(get_element_text(p_elem))
            if p_text:
                lines.append(f"{indent}> {p_text}")
                lines.append(f"{indent}>")  # Blank line after paragraph
        
        # Get LIST items (a), (b), (c) etc. - format as blockquoted list
        list_elem = alinea.find('LIST')
        if list_elem is not None:
            for item in list_elem.findall('ITEM'):
                np = item.find('NP')
                if np is not None:
                    no_p = np.find('NO.P')
                    number = clean_text(get_element_text(no_p)) if no_p is not None else ""
                    
                    # Get item text
                    txt = np.find('TXT')
                    if txt is not None:
                        item_text = clean_text(get_element_text(txt))
                    else:
                        # Get text after NO.P
                        item_text = ""
                        if no_p is not None and no_p.tail:
                            item_text = clean_text(no_p.tail)
                    
                    if number or item_text:
                        # Format as blockquoted list item
                        lines.append(f"{indent}> - {number} {item_text}")
    
    # Remove trailing blank blockquote line if present
    if lines and lines[-1].strip() == ">":
        lines.pop()
    
    # Note: No closing quote needed - the QUOT.S/QUOT.E elements handle quoting
    
    return lines


def get_following_quoted_content(parent_elem, after_elem):
    """
    Get quoted content (QUOT.S...P...QUOT.E) that follows a specific element.
    This is critical for extracting replacement text in amending regulations.
    
    Returns list of (is_quoted, text) tuples.
    """
    quoted_content = []
    found_after = False
    in_quote = False
    current_quote_parts = []
    
    for child in parent_elem:
        if child == after_elem:
            found_after = True
            continue
        
        if not found_after:
            continue
            
        # Stop if we hit another LIST (next amendment instruction)
        if child.tag == 'LIST':
            break
            
        if child.tag in ('QUOT.S', 'QUOT.START'):
            in_quote = True
            code = child.get('CODE', '')
            if code in ('2018', '2019'):
                current_quote_parts.append("'")
            elif code in ('201C', '201D'):
                current_quote_parts.append('"')
            if child.tail:
                current_quote_parts.append(child.tail)
        elif child.tag in ('QUOT.E', 'QUOT.END'):
            code = child.get('CODE', '')
            if code in ('2018', '2019'):
                current_quote_parts.append("'")
            elif code in ('201C', '201D'):
                current_quote_parts.append('"')
            if current_quote_parts:
                quoted_content.append((True, clean_text(''.join(current_quote_parts))))
                current_quote_parts = []
            in_quote = False
            if child.tail:
                tail_text = clean_text(child.tail)
                if tail_text:
                    quoted_content.append((False, tail_text))
        elif child.tag == 'P':
            text = clean_text(get_element_text(child))
            if text:
                if in_quote:
                    current_quote_parts.append(text)
                else:
                    quoted_content.append((True, text))  # Treat P after list as quoted
        elif child.tag == 'ALINEA':
            # Process ALINEA content
            for p in child.findall('.//P'):
                text = clean_text(get_element_text(p))
                if text:
                    quoted_content.append((True, text))
    
    return quoted_content


def process_list_with_quotes(list_elem, parent_elem, indent_level=0):
    """
    Process a LIST element and capture replacement content from P elements.
    
    In amending regulations, the structure is:
    <ITEM>
      <NP>
        <NO.P>(1)</NO.P>
        <TXT>Article 1 is replaced by the following:</TXT>
        <P>...the actual replacement text...</P>  <!-- This is the content to blockquote! -->
      </NP>
    </ITEM>
    
    OR for nested amendments:
    <ITEM>
      <NP>
        <NO.P>(2)</NO.P>
        <TXT>Article 2 is amended as follows:</TXT>
        <P>               <!-- This P contains nested LIST - DON'T blockquote! -->
          <LIST>...</LIST>
        </P>
      </NP>
    </ITEM>
    
    Returns Markdown formatted lines with instructions + blockquoted replacement content.
    """
    lines = []
    indent = "    " * indent_level
    
    for item in list_elem.findall('ITEM'):
        np_elem = item.find('NP')
        if np_elem is None:
            np_elem = item.find('.//NP')
        
        if np_elem is not None:
            no_p = np_elem.find('NO.P')
            number = get_element_text(no_p).strip() if no_p is not None else "-"
            
            # Get the instruction text from TXT element only
            txt_elem = np_elem.find('TXT')
            if txt_elem is not None:
                instruction_text = clean_text(get_element_text(txt_elem))
            else:
                # Fallback: get text from NO.P tail only (not child elements)
                instruction_text = ""
                if no_p is not None and no_p.tail:
                    instruction_text = clean_text(no_p.tail)
            
            # Output the instruction line
            if instruction_text:
                lines.append(f"{indent}{number} {instruction_text}")
            elif number:
                lines.append(f"{indent}{number}")
            
            # Now process P elements inside NP - handling different cases:
            for p_elem in np_elem.findall('P'):
                # Case 1: P contains a nested LIST - process the LIST, don't blockquote P
                nested_lists = p_elem.findall('LIST')
                if nested_lists:
                    for nested_list in nested_lists:
                        nested_lines = process_list_with_quotes(nested_list, p_elem, indent_level + 1)
                        lines.extend(nested_lines)
                    continue  # Skip blockquoting this P
                
                # Case 2: P contains QUOT.S (quoted content) - extract and blockquote
                quot_s = p_elem.find('QUOT.S')
                if quot_s is not None:
                    # Extract all content from within QUOT.S block
                    # Track if we just added a blockquote line to add separators
                    had_blockquote_content = False
                    for quot_child in quot_s:
                        if quot_child.tag == 'PARAG':
                            # Get ALINEA text from PARAG
                            for alinea in quot_child.findall('ALINEA'):
                                alinea_text = clean_text(get_element_text(alinea))
                                if alinea_text:
                                    # Add blank > line between consecutive paragraphs
                                    if had_blockquote_content:
                                        lines.append(f"{indent}>")
                                    lines.append(f"{indent}> {alinea_text}")
                                    had_blockquote_content = True
                        elif quot_child.tag == 'ARTICLE':
                            # Handle nested articles with proper formatting
                            if had_blockquote_content:
                                lines.append(f"{indent}>")
                            article_lines = format_quoted_article(quot_child, indent)
                            lines.extend(article_lines)
                            had_blockquote_content = True
                        else:
                            # Generic text extraction
                            child_text = clean_text(get_element_text(quot_child))
                            if child_text:
                                if had_blockquote_content:
                                    lines.append(f"{indent}>")
                                lines.append(f"{indent}> {child_text}")
                                had_blockquote_content = True
                    
                    # Add blank line after blockquote to separate from next item
                    lines.append("")
                    continue
                
                # Case 3: Plain P without nested structures - blockquote its content
                p_text = clean_text(get_element_text(p_elem))
                if p_text:
                    lines.append(f"{indent}> {p_text}")
                    lines.append("")  # Add blank line after blockquote
            
            # Process nested lists that are direct children of NP (outside P)
            for nested_list in np_elem.findall('LIST'):
                nested_lines = process_list_with_quotes(nested_list, np_elem, indent_level + 1)
                lines.extend(nested_lines)
    
    # After processing the list, check for quoted content following it as siblings
    if parent_elem is not None:
        quoted = get_following_quoted_content(parent_elem, list_elem)
        for is_quoted, content in quoted:
            if content:
                if is_quoted:
                    lines.append(f"{indent}> {content}")
                else:
                    lines.append(f"{indent}{content}")
    
    return lines


def process_list_simple(list_elem, indent_level=0):
    """
    Simple list processing - extracts items directly.
    Used for lists that don't need quoted content extraction.
    """
    lines = []
    indent = "    " * indent_level
    
    for item in list_elem.findall('ITEM'):
        np_elem = item.find('NP')
        if np_elem is not None:
            no_p = np_elem.find('NO.P')
            number = get_element_text(no_p).strip() if no_p is not None else "-"
            
            txt_elem = np_elem.find('TXT')
            if txt_elem is not None:
                text = clean_text(get_element_text(txt_elem))
            else:
                # Get text after NO.P
                text_parts = []
                found_no_p = False
                for child in np_elem:
                    if child.tag == 'NO.P':
                        found_no_p = True
                        if child.tail:
                            text_parts.append(child.tail)
                    elif found_no_p or child.tag != 'NO.P':
                        text_parts.append(get_element_text(child))
                        if child.tail:
                            text_parts.append(child.tail)
                text = clean_text(''.join(text_parts))
            
            if text:
                lines.append(f"{indent}{number} {text}")
            
            # Process nested lists
            for nested_list in np_elem.findall('P/LIST'):
                nested_lines = process_list_simple(nested_list, indent_level + 1)
                lines.extend(nested_lines)
            for nested_list in np_elem.findall('LIST'):
                nested_lines = process_list_simple(nested_list, indent_level + 1)
                lines.extend(nested_lines)
    
    return lines


def extract_recitals(root):
    """Extract recitals (Whereas clauses) from GR.CONSID."""
    lines = []
    
    gr_consid = root.find('.//GR.CONSID')
    if gr_consid is None:
        return lines
    
    # Add section header
    lines.append("## Recitals")
    lines.append("")
    
    for consid in gr_consid.findall('CONSID'):
        np_elem = consid.find('NP')
        if np_elem is not None:
            no_p = np_elem.find('NO.P')
            number = get_element_text(no_p).strip() if no_p is not None else ""
            
            txt_elem = np_elem.find('TXT')
            if txt_elem is not None:
                text = clean_text(get_element_text(txt_elem))
            else:
                # Get all text from NP except the number
                text = clean_text(get_element_text(np_elem))
                if number and text.startswith(number):
                    text = text[len(number):].strip()
            
            if text:
                lines.append(f"{number} {text}")
                lines.append("")
    
    return lines


def process_alinea(alinea_elem):
    """
    Process an ALINEA element, handling both lists and quoted content.
    Returns list of Markdown lines.
    """
    lines = []
    
    # Track all children in order to capture content properly
    children = list(alinea_elem)
    i = 0
    
    while i < len(children):
        child = children[i]
        
        if child.tag == 'P':
            text = clean_text(get_element_text(child))
            if text:
                lines.append(text)
                lines.append("")
            
            # Check for lists inside P
            for list_elem in child.findall('LIST'):
                list_lines = process_list_with_quotes(list_elem, child, 0)
                lines.extend(list_lines)
                if list_lines:
                    lines.append("")
        
        elif child.tag == 'LIST':
            # Process list and capture following quoted content
            list_lines = process_list_with_quotes(child, alinea_elem, 0)
            lines.extend(list_lines)
            if list_lines:
                lines.append("")
        
        elif child.tag in ('QUOT.S', 'QUOT.START'):
            # Start of quoted block - collect until QUOT.E
            quote_parts = []
            code = child.get('CODE', '')
            if code in ('2018', '2019'):
                quote_parts.append("'")
            if child.tail:
                quote_parts.append(child.tail)
            
            i += 1
            while i < len(children):
                inner = children[i]
                if inner.tag in ('QUOT.E', 'QUOT.END'):
                    code = inner.get('CODE', '')
                    if code in ('2018', '2019'):
                        quote_parts.append("'")
                    break
                elif inner.tag == 'P':
                    quote_parts.append(clean_text(get_element_text(inner)))
                i += 1
            
            if quote_parts:
                quoted_text = ' '.join(quote_parts)
                lines.append(f"> {quoted_text}")
                lines.append("")
        
        i += 1
    
    # Also check for direct text content
    if alinea_elem.text:
        text = clean_text(alinea_elem.text)
        if text and text not in '\n'.join(lines):
            lines.insert(0, text)
            lines.insert(1, "")
    
    return lines


def extract_articles(root):
    """Extract and format articles with proper quote handling.
    
    IMPORTANT: Skip any ARTICLE elements that are nested inside QUOT.S blocks,
    as these are replacement content for amending regulations and should only
    be rendered as blockquoted text within the amendment instruction context.
    """
    lines = []
    
    # First, find all ARTICLE elements that are INSIDE a QUOT.S block
    # These should NOT be extracted as standalone articles
    articles_in_quot = set()
    for quot_s in root.findall('.//QUOT.S'):
        for nested_article in quot_s.findall('.//ARTICLE'):
            articles_in_quot.add(nested_article)
    
    for article in root.findall('.//ARTICLE'):
        # Skip articles that are inside QUOT.S blocks (replacement content)
        if article in articles_in_quot:
            continue
            

        # Article number
        ti_art = article.find('TI.ART')
        art_number = clean_text(get_element_text(ti_art)) if ti_art is not None else "Article"
        
        # Article title/subject
        sti_art = article.find('STI.ART')
        if sti_art is not None:
            p_elem = sti_art.find('P')
            art_title = clean_text(get_element_text(p_elem)) if p_elem is not None else clean_text(get_element_text(sti_art))
        else:
            art_title = ""
        
        lines.append(f"### {art_number}")
        if art_title:
            lines.append(f"**{art_title}**")
        lines.append("")
        
        # Process paragraphs
        for parag in article.findall('PARAG'):
            no_parag = parag.find('NO.PARAG')
            para_num = get_element_text(no_parag).strip() if no_parag is not None else ""
            
            # Get all ALINEA content
            for alinea in parag.findall('ALINEA'):
                alinea_lines = process_alinea(alinea)
                
                # Prepend paragraph number to first line if present
                if para_num and alinea_lines:
                    first_line = alinea_lines[0]
                    if not first_line.startswith(para_num):
                        alinea_lines[0] = f"{para_num} {first_line}"
                    para_num = ""  # Only add once
                
                lines.extend(alinea_lines)
        
        # Direct ALINEA (without PARAG wrapper)
        for alinea in article.findall('ALINEA'):
            alinea_lines = process_alinea(alinea)
            lines.extend(alinea_lines)
    
    return lines


def convert_formex_to_md(xml_path, output_path=None):
    """Main conversion function."""
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    md_lines = []
    
    # Title
    title_elem = root.find('.//TITLE')
    if title_elem is not None:
        ti = title_elem.find('TI')
        if ti is not None:
            title_parts = []
            for p in ti.findall('P'):
                text = clean_text(get_element_text(p))
                if text:
                    title_parts.append(text)
            if title_parts:
                md_lines.append(f"# {' '.join(title_parts)}")
                md_lines.append("")
    
    # Preamble init
    preamble = root.find('.//PREAMBLE')
    if preamble is not None:
        preamble_init = preamble.find('PREAMBLE.INIT')
        if preamble_init is not None:
            text = clean_text(get_element_text(preamble_init))
            if text:
                md_lines.append("## Preamble")
                md_lines.append("")
                md_lines.append(text)
                md_lines.append("")
    
    # GR.VISA (Having regard to...)
    gr_visa = root.find('.//GR.VISA')
    if gr_visa is not None:
        for visa in gr_visa.findall('VISA'):
            text = clean_text(get_element_text(visa))
            if text:
                md_lines.append(f"*{text}*")
                md_lines.append("")
    
    # Recitals
    recital_lines = extract_recitals(root)
    md_lines.extend(recital_lines)
    
    # Preamble final
    if preamble is not None:
        preamble_final = preamble.find('PREAMBLE.FINAL')
        if preamble_final is not None:
            text = clean_text(get_element_text(preamble_final))
            if text:
                md_lines.append(f"**{text}**")
                md_lines.append("")
    
    # Enacting Terms header
    enacting = root.find('.//ENACTING.TERMS')
    if enacting is not None:
        md_lines.append("## Enacting Terms")
        md_lines.append("")
    
    # Articles
    article_lines = extract_articles(root)
    md_lines.extend(article_lines)
    
    # Annexes
    for annex in root.findall('.//ANNEX'):
        ti_annex = annex.find('.//TI.ANNEX')
        if ti_annex is None:
            ti_annex = annex.find('.//TITLE/TI')
        
        annex_title = clean_text(get_element_text(ti_annex)) if ti_annex is not None else "ANNEX"
        md_lines.append(f"## {annex_title}")
        md_lines.append("")
        
        # Process annex content more thoroughly
        for elem in annex.iter():
            if elem.tag == 'P':
                text = clean_text(get_element_text(elem))
                if text:
                    md_lines.append(text)
                    md_lines.append("")
            elif elem.tag == 'LIST':
                list_lines = process_list_simple(elem, 0)
                md_lines.extend(list_lines)
                if list_lines:
                    md_lines.append("")
    
    # Final provisions
    final = root.find('.//FINAL')
    if final is not None:
        md_lines.append("---")
        md_lines.append("")
        for p in final.findall('.//P'):
            text = clean_text(get_element_text(p))
            if text:
                md_lines.append(text)
                md_lines.append("")
    
    # Combine and clean
    content = '\n'.join(md_lines)
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    # Collapse consecutive horizontal rules (---) into one
    # Matches: ---\n\n---  or  ---\n---  etc.
    # Apply repeatedly in case there are 3+ consecutive rules
    prev_content = None
    while prev_content != content:
        prev_content = content
        content = re.sub(r'(---+\n)(\s*\n)*---+', r'---', content)
    
    if output_path:
        Path(output_path).write_text(content, encoding='utf-8')
        print(f"Converted: {xml_path} -> {output_path}")
        print(f"  Size: {len(content):,} bytes")
    
    return content


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python formex_to_md_v3.py <input.xml> [output.md]")
        print("\nFormex XML to Markdown Converter v3.0")
        print("Enhanced converter with proper quoted content extraction for amendments.")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else input_file.replace('.xml', '.md')
    
    convert_formex_to_md(input_file, output_file)
