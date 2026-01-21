#!/usr/bin/env python3
"""
Download EUR-Lex documents in Formex (FMX4) XML format and convert to Markdown.

This script:
1. Downloads the XML notice from EUR-Lex
2. Extracts the Formex ZIP URL from the notice
3. Downloads and extracts the Formex XML files
4. Converts to clean Markdown

Usage:
    python eurlex_formex.py <CELEX_NUMBER> <OUTPUT_DIR>
    
Example:
    python eurlex_formex.py 32024R1183 d:/aab/eIDAS20/01_regulation/2024_1183_eIDAS2
"""

import os
import re
import sys
import zipfile
import urllib.request
from pathlib import Path
from datetime import datetime

import yaml

# Import the improved v3 converter (better annex handling)
from formex_to_md_v3 import convert_formex_to_md as convert_formex_v3

# HTML fallback converter (for documents without Formex XML)
from eurlex_html_to_md import convert_html_to_markdown


def get_document_config(celex: str) -> dict | None:
    """
    Check documents.yaml for document configuration.
    
    Returns the document config dict if found, None otherwise.
    """
    documents_yaml = Path(__file__).parent / 'documents.yaml'
    
    if not documents_yaml.exists():
        return None
    
    with open(documents_yaml, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)
    
    for doc in config.get('documents', []):
        if doc.get('celex') == celex:
            return doc
    
    return None


def uses_html_source(celex: str) -> bool:
    """
    Check if a document is configured to use HTML source.
    
    Returns True if documents.yaml has source: html for this CELEX.
    """
    config = get_document_config(celex)
    return config is not None and config.get('source') == 'html'


def download_file(url, filepath):
    """Download a file from URL."""
    print(f"  Downloading: {url}")
    urllib.request.urlretrieve(url, filepath)
    print(f"  Saved: {filepath} ({os.path.getsize(filepath)} bytes)")


def get_formex_url(celex):
    """Get the Formex ZIP URL for a CELEX number."""
    # Download XML notice
    notice_url = f"https://eur-lex.europa.eu/legal-content/EN/TXT/XML/?uri=CELEX:{celex}"
    notice_path = Path(f"temp_{celex}_notice.xml")
    
    download_file(notice_url, notice_path)
    
    # Parse notice and find ENG.fmx4 reference
    with open(notice_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Look for Official Journal reference pattern (e.g., L_202401183)
    oj_match = re.search(r'resource/oj/([A-Z]_\d+)\.ENG\.fmx4', content)
    if oj_match:
        oj_ref = oj_match.group(1)
        rdf_url = f"http://publications.europa.eu/resource/oj/{oj_ref}.ENG.fmx4"
        
        # Download RDF to get cellar URL
        rdf_path = Path(f"temp_{celex}_rdf.xml")
        download_file(rdf_url, rdf_path)
        
        with open(rdf_path, 'r', encoding='utf-8') as f:
            rdf_content = f.read()
        
        # Extract cellar URL
        cellar_match = re.search(r'resource/cellar/([a-f0-9-]+\.\d+\.\d+)', rdf_content)
        if cellar_match:
            cellar_id = cellar_match.group(1)
            os.remove(notice_path)
            os.remove(rdf_path)
            return f"http://publications.europa.eu/resource/cellar/{cellar_id}"
    
    # Clean up
    if notice_path.exists():
        os.remove(notice_path)
    
    return None


def clean_text(text):
    """Clean and normalize text content."""
    if text is None:
        return ""
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


def convert_formex_to_md(xml_path, celex):
    """Convert Formex XML to Markdown."""
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    md_lines = []
    
    # Title
    title_elem = root.find('.//TI.CJO') or root.find('.//TITLE') or root.find('.//TI')
    if title_elem is not None:
        title_text = get_all_text(title_elem)
        md_lines.append(f"# {title_text}")
        md_lines.append("")
    
    # Preamble institutions
    for gr_visa in root.findall('.//GR.VISA'):
        md_lines.append("## Preamble")
        md_lines.append("")
        for visa in gr_visa.findall('.//VISA'):
            text = get_all_text(visa)
            if text:
                md_lines.append(f"*{text}*")
                md_lines.append("")
        break
    
    # Recitals (GR.CONS)
    gr_cons = root.find('.//GR.CONS')
    if gr_cons is not None:
        md_lines.append("## Recitals")
        md_lines.append("")
        for cons in gr_cons.findall('.//CONS'):
            no = cons.find('.//NO.P')
            number = get_all_text(no) if no is not None else ""
            txt = cons.find('.//TXT')
            text = get_all_text(txt) if txt is not None else get_all_text(cons)
            if text and not text.startswith(number):
                md_lines.append(f"{number} {text}")
            elif text:
                md_lines.append(text)
            md_lines.append("")
    
    # Enacting clause
    enacting = root.find('.//ENACTING.TERMS')
    if enacting is not None:
        formula = enacting.find('.//GR.ENACTING.FORMULA')
        if formula is not None:
            text = get_all_text(formula)
            if text:
                md_lines.append(f"**{text}**")
                md_lines.append("")
    
    # Articles
    for article in root.findall('.//ARTICLE'):
        art_no = article.find('.//TI.ART')
        art_title = get_all_text(art_no) if art_no is not None else ""
        
        sti_art = article.find('.//STI.ART')
        art_subtitle = get_all_text(sti_art) if sti_art is not None else ""
        
        if art_title:
            md_lines.append(f"### {art_title}")
        if art_subtitle:
            md_lines.append(f"**{art_subtitle}**")
        md_lines.append("")
        
        # Process paragraphs
        for para in article.findall('.//PARAG'):
            process_paragraph(para, md_lines)
        
        # Direct content in article
        for alinea in article.findall('./ALINEA'):
            text = get_all_text(alinea)
            if text:
                md_lines.append(text)
                md_lines.append("")
    
    # Annexes
    for annex in root.findall('.//ANNEX'):
        title = annex.find('.//TI.ANNEX') or annex.find('.//TITLE')
        title_text = get_all_text(title) if title is not None else "ANNEX"
        md_lines.append(f"## {title_text}")
        md_lines.append("")
        
        for elem in annex.iter():
            if elem.tag == 'P':
                text = get_all_text(elem)
                if text:
                    md_lines.append(text)
                    md_lines.append("")
    
    # Final / Signature
    final = root.find('.//FINAL')
    if final is not None:
        md_lines.append("---")
        md_lines.append("")
        for p in final.findall('.//P'):
            text = get_all_text(p)
            if text:
                md_lines.append(text)
                md_lines.append("")
    
    # Add source reference
    md_lines.extend([
        "",
        "---",
        "",
        "## Source Reference",
        "",
        f"- **CELEX Number:** {celex}",
        "- **Source:** EUR-Lex (Formex XML)",
        f"- **URL:** https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:{celex}",
        f"- **Downloaded:** {datetime.now().strftime('%Y-%m-%d')}",
        "- **Format:** Formex (FMX4) XML → Markdown",
    ])
    
    content = '\n'.join(md_lines)
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    return content


def process_paragraph(para, md_lines, indent=""):
    """Process a paragraph element."""
    no_p = para.find('.//NO.P')
    para_num = get_all_text(no_p) if no_p is not None else ""
    
    # Get main paragraph text
    alinea = para.find('./ALINEA')
    if alinea is not None:
        text = get_all_text(alinea)
        if para_num and text:
            md_lines.append(f"{indent}{para_num} {text}")
        elif text:
            md_lines.append(f"{indent}{text}")
        md_lines.append("")
    
    # Process list items
    for subpara in para.findall('./SUBPARA'):
        process_subpara(subpara, md_lines, indent + "   ")


def process_subpara(subpara, md_lines, indent=""):
    """Process a sub-paragraph (list item)."""
    no_p = subpara.find('./NO.P')
    item_num = get_all_text(no_p) if no_p is not None else "-"
    
    alinea = subpara.find('./ALINEA')
    text = get_all_text(alinea) if alinea is not None else ""
    
    if text:
        md_lines.append(f"{indent}{item_num} {text}")
    
    # Nested items
    for nested in subpara.findall('./SUBPARA'):
        process_subpara(nested, md_lines, indent + "   ")


def main():
    if len(sys.argv) < 3:
        print("Usage: python eurlex_formex.py <CELEX_NUMBER> <OUTPUT_DIR>")
        print("Example: python eurlex_formex.py 32024R1183 d:/aab/eIDAS20/01_regulation/2024_1183")
        sys.exit(1)
    
    celex = sys.argv[1]
    output_dir = Path(sys.argv[2])
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # =========================================================
    # Check if this document is configured to use HTML source
    # =========================================================
    if uses_html_source(celex):
        print(f"\n=== EUR-Lex HTML Download: {celex} ===\n")
        print(f"  ⚠️ Formex XML not available for {celex}")
        print(f"  Using HTML fallback converter...\n")
        
        try:
            markdown = convert_html_to_markdown(celex)
            
            md_path = output_dir / f"{celex}.md"
            md_path.write_text(markdown, encoding='utf-8')
            
            word_count = len(markdown.split())
            print(f"\n✅ HTML conversion complete!")
            print(f"   Output: {md_path}")
            print(f"   Words: {word_count}")
        except Exception as e:
            print(f"ERROR during HTML conversion: {e}")
            sys.exit(1)
        
        print("\n=== Done ===\n")
        return
    
    # =========================================================
    # Standard Formex processing
    # =========================================================
    print(f"\n=== EUR-Lex Formex Download: {celex} ===\n")
    
    # Step 1: Get Formex URL (prefer cellar_id from config, fallback to discovery)
    print("Step 1: Finding Formex URL...")
    doc_config = get_document_config(celex)
    cellar_url = None
    
    # Check if documents.yaml has a pre-configured cellar_id
    if doc_config and doc_config.get('cellar_id'):
        cellar_id = doc_config['cellar_id']
        cellar_url = f"http://publications.europa.eu/resource/cellar/{cellar_id}"
        print(f"  Using cellar_id from documents.yaml: {cellar_id}")
    else:
        # Fall back to auto-discovery
        cellar_url = get_formex_url(celex)
    
    if not cellar_url:
        print("ERROR: Could not find Formex URL.")
        print("  TIP: Add 'cellar_id' or 'source: html' in documents.yaml for this CELEX.")
        sys.exit(1)
    
    print(f"  Found: {cellar_url}")
    
    # Step 2: Download Formex ZIP
    print("\nStep 2: Downloading Formex ZIP...")
    zip_path = output_dir / f"{celex}.fmx4.zip"
    
    req = urllib.request.Request(cellar_url, headers={'Accept': 'application/zip'})
    with urllib.request.urlopen(req) as response:
        with open(zip_path, 'wb') as f:
            f.write(response.read())
    print(f"  Saved: {zip_path} ({os.path.getsize(zip_path)} bytes)")
    
    # Step 3: Extract ZIP
    print("\nStep 3: Extracting Formex files...")
    xml_dir = output_dir / "formex"
    xml_dir.mkdir(exist_ok=True)
    
    with zipfile.ZipFile(zip_path, 'r') as zf:
        zf.extractall(xml_dir)
        print(f"  Extracted {len(zf.namelist())} files to {xml_dir}")
    
    # Step 4: Find main XML file and all annex XML files, then convert
    # Formex file naming conventions:
    #   OLD PATTERN (Implementing Acts):
    #     - .000101.fmx.xml = Main document
    #     - .000201., .000301., etc. = Annexes
    #   NEW PATTERN (NIS2, newer Directives):
    #     - L_YYYYNNN.PPPPPPPP.xml where PPPPPPPP is a page number
    #     - Lowest page number = main document
    #     - Higher page numbers = annexes
    #   SKIP: .doc.xml = Document metadata, .toc.xml = Table of contents
    print("\nStep 4: Converting to Markdown...")
    main_xml = None
    annex_xmls = []
    
    # Collect all content XML files (exclude .doc. and .toc.)
    content_xmls = []
    for f in sorted(xml_dir.iterdir()):
        if f.suffix == '.xml':
            # Skip metadata files
            if '.doc.' in f.stem or '.toc.' in f.stem:
                continue
            content_xmls.append(f)
    
    # Detect file naming convention and extract main/annexes
    if content_xmls:
        # Check if OLD pattern (.000NNN.)
        old_pattern_main = [f for f in content_xmls if '.000101.' in f.name]
        if old_pattern_main:
            main_xml = old_pattern_main[0]
            annex_xmls = [f for f in content_xmls if re.search(r'\.000[2-9]\d{2}\.', f.name)]
        else:
            # NEW pattern: sort by page number and use first as main
            # E.g., L_2022333EN.01008001.xml → page 01008001
            def extract_page_num(f):
                match = re.search(r'\.(\d{8})\.xml$', f.name)
                return int(match.group(1)) if match else 999999999
            
            content_xmls.sort(key=extract_page_num)
            main_xml = content_xmls[0]
            annex_xmls = content_xmls[1:]
    
    if main_xml:
        md_path = output_dir / f"{celex}.md"
        
        # Generate metadata header for proper CELEX badge display
        doc_config = get_document_config(celex)
        # Determine document type label from legalType
        legal_type = doc_config.get('legalType', 'regulation') if doc_config else 'regulation'
        doc_type_labels = {
            'regulation': 'Regulation',
            'implementing_regulation': 'Implementing Regulation',
            'directive': 'Directive',
            'decision': 'Decision',
            'recommendation': 'Recommendation'
        }
        doc_type = doc_type_labels.get(legal_type, 'Regulation')
        if doc_config and doc_config.get('category') == 'implementing_act' and legal_type == 'regulation':
            doc_type = "Implementing Act"
        
        md_header = f"""> **CELEX:** {celex} | **Type:** {doc_type}
> **Source:** [EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:{celex})
> **Converted:** {datetime.now().strftime('%Y-%m-%d')} via Formex XML Pipeline v3.2

"""
        
        # Convert main document
        md_content = convert_formex_v3(str(main_xml), None)  # Don't write yet
        print(f"  Converted main document: {main_xml.name} ({len(md_content):,} bytes)")
        
        # Convert and append annex files (they are standalone ANNEX elements)
        for annex_xml in sorted(annex_xmls):
            try:
                annex_content = convert_formex_v3(str(annex_xml), None)
                if annex_content and annex_content.strip():
                    md_content += "\n\n" + annex_content
                    print(f"  Merged annex: {annex_xml.name} ({len(annex_content):,} bytes)")
            except Exception as e:
                print(f"  Warning: Failed to convert {annex_xml.name}: {e}")
        
        # Prepend header to content
        md_content = md_header + md_content
        
        # Write combined content
        md_path.write_text(md_content, encoding='utf-8')
        print(f"  Created: {md_path} ({len(md_content):,} bytes)")
    else:
        print("ERROR: No XML file found in ZIP")
        sys.exit(1)
    
    print("\n=== Done ===\n")


if __name__ == "__main__":
    main()
