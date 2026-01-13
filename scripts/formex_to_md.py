#!/usr/bin/env python3
"""
Convert EUR-Lex Formex (FMX4) XML to Markdown.
Preserves document structure: title, preamble, recitals, articles, annexes.
"""

import xml.etree.ElementTree as ET
import re
import sys
from pathlib import Path


def clean_text(text):
    """Clean and normalize text content."""
    if text is None:
        return ""
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def get_all_text(element):
    """Recursively get all text content from an element."""
    texts = []
    if element.text:
        texts.append(element.text)
    for child in element:
        texts.append(get_all_text(child))
        if child.tail:
            texts.append(child.tail)
    return clean_text(' '.join(texts))


def process_note(note):
    """Process footnote references."""
    note_id = note.get('ID', '')
    text = get_all_text(note)
    return f"[^{note_id}]: {text}"


def process_item(item, prefix=""):
    """Process a list item (numbered paragraph)."""
    lines = []
    no_p = item.find('.//NO.P')
    number = get_all_text(no_p) if no_p is not None else ""
    
    txt = item.find('.//TXT')
    text = get_all_text(txt) if txt is not None else ""
    
    if number:
        lines.append(f"{prefix}{number} {text}")
    else:
        lines.append(f"{prefix}- {text}")
    
    # Handle nested items
    for sub_item in item.findall('.//ITEM'):
        if sub_item != item:  # Avoid self-reference
            lines.extend(process_item(sub_item, prefix + "   "))
    
    return lines


def convert_formex_to_md(xml_path, output_path=None):
    """Convert Formex XML to Markdown."""
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    md_lines = []
    footnotes = []
    
    # Title
    title = root.find('.//TI.CJO') or root.find('.//TITLE')
    if title is not None:
        ti_text = get_all_text(title.find('.//TXT') or title)
        md_lines.append(f"# {ti_text}")
        md_lines.append("")
    
    # Preamble / Enacting terms
    preamble = root.find('.//PREAMBLE')
    if preamble is not None:
        md_lines.append("## Preamble")
        md_lines.append("")
        for p in preamble.findall('.//P'):
            text = get_all_text(p)
            if text:
                md_lines.append(text)
                md_lines.append("")
    
    # GR.VISA (Having regard to...)
    for visa in root.findall('.//GR.VISA'):
        for p in visa.findall('.//P'):
            text = get_all_text(p)
            if text:
                md_lines.append(f"*{text}*")
                md_lines.append("")
    
    # Recitals (Whereas)
    gr_cons = root.find('.//GR.CONS')
    if gr_cons is not None:
        md_lines.append("## Recitals")
        md_lines.append("")
        for cons in gr_cons.findall('.//CONS'):
            no = cons.find('.//NO.P')
            number = get_all_text(no) if no is not None else ""
            txt = cons.find('.//TXT')
            text = get_all_text(txt) if txt is not None else get_all_text(cons)
            if text:
                md_lines.append(f"{number} {text}")
                md_lines.append("")
    
    # Enacting terms
    enacting = root.find('.//ENACTING.TERMS')
    if enacting is not None:
        md_lines.append("## Enacting Terms")
        md_lines.append("")
    
    # Articles
    for article in root.findall('.//ARTICLE'):
        art_no = article.find('.//TI.ART')
        art_title = get_all_text(art_no) if art_no is not None else ""
        
        sti_art = article.find('.//STI.ART')
        art_subtitle = get_all_text(sti_art) if sti_art is not None else ""
        
        md_lines.append(f"### {art_title}")
        if art_subtitle:
            md_lines.append(f"**{art_subtitle}**")
        md_lines.append("")
        
        # Article content - paragraphs
        for para in article.findall('.//PARAG'):
            no_p = para.find('.//NO.P')
            para_num = get_all_text(no_p) if no_p is not None else ""
            
            # Get all text in paragraph
            alinea = para.find('.//ALINEA')
            if alinea is not None:
                para_text = get_all_text(alinea)
            else:
                para_text = get_all_text(para)
                # Remove the paragraph number from text if present
                if para_num and para_text.startswith(para_num):
                    para_text = para_text[len(para_num):].strip()
            
            if para_text:
                md_lines.append(f"{para_num} {para_text}" if para_num else para_text)
                md_lines.append("")
            
            # Handle lists within paragraphs
            for item in para.findall('.//ITEM'):
                item_lines = process_item(item)
                md_lines.extend(item_lines)
            md_lines.append("")
        
        # Direct paragraph text (not in PARAG)
        for p in article.findall('./P'):
            text = get_all_text(p)
            if text:
                md_lines.append(text)
                md_lines.append("")
    
    # Annexes
    for annex in root.findall('.//ANNEX'):
        annex_title = annex.find('.//TI.ANNEX') or annex.find('.//TITLE')
        title_text = get_all_text(annex_title) if annex_title is not None else "ANNEX"
        md_lines.append(f"## {title_text}")
        md_lines.append("")
        
        for p in annex.findall('.//P'):
            text = get_all_text(p)
            if text:
                md_lines.append(text)
                md_lines.append("")
    
    # Final provisions / Signature
    final = root.find('.//FINAL')
    if final is not None:
        md_lines.append("---")
        md_lines.append("")
        for p in final.findall('.//P'):
            text = get_all_text(p)
            if text:
                md_lines.append(text)
                md_lines.append("")
    
    # Combine all lines
    content = '\n'.join(md_lines)
    
    # Clean up excessive newlines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    if output_path:
        Path(output_path).write_text(content, encoding='utf-8')
        print(f"Converted: {xml_path} -> {output_path}")
    
    return content


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python formex_to_md.py <input.fmx.xml> [output.md]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else input_file.replace('.fmx.xml', '.md')
    
    convert_formex_to_md(input_file, output_file)
