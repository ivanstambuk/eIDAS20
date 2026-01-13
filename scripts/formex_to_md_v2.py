#!/usr/bin/env python3
"""
Formex XML to Markdown Converter v2.0
=====================================
Enhanced converter for EUR-Lex Formex 4 XML format.

Key improvements over v1:
- Proper recital extraction (Whereas clauses)
- Nested list handling with proper indentation  
- Clean footnote references
- Article paragraph numbering
- Better text cleaning
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
            elif tag in ('QUOT.START', 'QUOT.END'):
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


def process_list(list_elem, indent_level=0):
    """
    Process a LIST element and return Markdown formatted lines.
    Handles nested lists with proper indentation.
    """
    lines = []
    list_type = list_elem.get('TYPE', 'alpha')
    
    # Determine prefix style
    if list_type == 'alpha':
        prefix_style = 'alpha'
    elif list_type == 'ARAB':
        prefix_style = 'numeric'
    elif list_type == 'roman':
        prefix_style = 'roman'
    else:
        prefix_style = 'alpha'
    
    indent = "    " * indent_level
    
    for idx, item in enumerate(list_elem.findall('ITEM')):
        # Get the item number/letter from NO.P if present
        np_elem = item.find('.//NP')
        if np_elem is not None:
            no_p = np_elem.find('NO.P')
            number = get_element_text(no_p).strip() if no_p is not None else ""
            
            # Get the main text (from TXT element)
            txt_elem = np_elem.find('TXT')
            if txt_elem is not None:
                text = get_element_text(txt_elem)
            else:
                # Get text from NP directly, excluding NO.P
                text_parts = []
                if np_elem.text:
                    text_parts.append(np_elem.text)
                for child in np_elem:
                    if child.tag != 'NO.P':
                        text_parts.append(get_element_text(child))
                    if child.tail:
                        text_parts.append(child.tail)
                text = ''.join(text_parts)
            
            text = clean_text(text)
            
            if text:
                lines.append(f"{indent}{number} {text}")
            
            # Check for nested lists within this item
            for nested_list in np_elem.findall('.//LIST'):
                # Only process direct child lists
                parent = nested_list
                while parent is not None:
                    if parent.tag == 'LIST' and parent != nested_list:
                        break
                    if parent == np_elem:
                        nested_lines = process_list(nested_list, indent_level + 1)
                        lines.extend(nested_lines)
                        break
                    parent = parent.getparent() if hasattr(parent, 'getparent') else None
        else:
            # Fallback for items without NP structure
            text = clean_text(get_element_text(item))
            if text:
                lines.append(f"{indent}- {text}")
    
    return lines


def process_list_simple(list_elem, indent_level=0):
    """
    Simple list processing - extracts items directly.
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


def extract_articles(root):
    """Extract and format articles."""
    lines = []
    
    for article in root.findall('.//ARTICLE'):
        # Skip quoted articles (inside QUOT.S elements)
        # These are amendments being described, not the actual article structure
        
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
            
            # Get ALINEA content
            alinea = parag.find('ALINEA')
            if alinea is not None:
                # Check if ALINEA starts with a P element
                p_elem = alinea.find('P')
                if p_elem is not None:
                    para_text = clean_text(get_element_text(p_elem))
                else:
                    para_text = clean_text(get_element_text(alinea))
                
                if para_text:
                    if para_num:
                        lines.append(f"{para_num} {para_text}")
                    else:
                        lines.append(para_text)
                    lines.append("")
                
                # Process lists within ALINEA
                for list_elem in alinea.findall('LIST'):
                    list_lines = process_list_simple(list_elem, 0)
                    lines.extend(list_lines)
                    if list_lines:
                        lines.append("")
                
                # Process lists within P elements
                if p_elem is not None:
                    for list_elem in p_elem.findall('LIST'):
                        list_lines = process_list_simple(list_elem, 0)
                        lines.extend(list_lines)
                        if list_lines:
                            lines.append("")
            
            # Multiple ALINEAs
            for idx, alinea in enumerate(parag.findall('ALINEA')):
                if idx == 0:
                    continue  # Already processed first one
                
                p_elem = alinea.find('P')
                if p_elem is not None:
                    para_text = clean_text(get_element_text(p_elem))
                else:
                    para_text = clean_text(get_element_text(alinea))
                
                if para_text:
                    lines.append(para_text)
                    lines.append("")
                
                for list_elem in alinea.findall('LIST'):
                    list_lines = process_list_simple(list_elem, 0)
                    lines.extend(list_lines)
                    if list_lines:
                        lines.append("")
        
        # Direct ALINEA (without PARAG wrapper)
        for alinea in article.findall('ALINEA'):
            p_elem = alinea.find('P')
            if p_elem is not None:
                para_text = clean_text(get_element_text(p_elem))
            else:
                para_text = clean_text(get_element_text(alinea))
            
            if para_text:
                lines.append(para_text)
                lines.append("")
            
            for list_elem in alinea.findall('.//LIST'):
                list_lines = process_list_simple(list_elem, 0)
                lines.extend(list_lines)
                if list_lines:
                    lines.append("")
    
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
        md_lines.append("---")
        md_lines.append("")
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
        
        for p in annex.findall('.//P'):
            text = clean_text(get_element_text(p))
            if text:
                md_lines.append(text)
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
    
    if output_path:
        Path(output_path).write_text(content, encoding='utf-8')
        print(f"Converted: {xml_path} -> {output_path}")
        print(f"  Size: {len(content):,} bytes")
    
    return content


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python formex_to_md_v2.py <input.xml> [output.md]")
        print("\nFormex XML to Markdown Converter v2.0")
        print("Enhanced converter with proper recitals, nested lists, and article structure.")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else input_file.replace('.xml', '.md')
    
    convert_formex_to_md(input_file, output_file)
