#!/usr/bin/env python3
"""
Comprehensive unit tests for formex_to_md_v3.py converter.

Tests cover:
1. Basic text extraction from elements
2. Nested element handling (DATE, NOTE, HT, etc.)
3. Quote handling (QUOT.S, QUOT.START, QUOT.END)
4. List processing with various structures
5. Article and paragraph extraction
6. Amendment structure with replacement content
7. Edge cases and known problem patterns
"""

import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
import sys

# Import the converter module
sys.path.insert(0, str(Path(__file__).parent))
from formex_to_md_v3 import (
    get_element_text,
    clean_text,
    process_list_with_quotes,
    process_list_simple,
    get_following_quoted_content
)


class TestGetElementText(unittest.TestCase):
    """Test the get_element_text function."""
    
    def test_simple_text(self):
        """Basic text content extraction."""
        xml = '<P>Simple text content</P>'
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        self.assertEqual(result, 'Simple text content')
    
    def test_date_element(self):
        """DATE elements should have their text extracted."""
        xml = '<ALINEA>By <DATE ISO="20260521">21 May 2026</DATE>, the Commission shall</ALINEA>'
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        self.assertIn('21 May 2026', result)
        self.assertEqual(result, 'By 21 May 2026, the Commission shall')
    
    def test_nested_date_in_paragraph(self):
        """DATE nested in deeper structure."""
        xml = '''<PARAG>
            <ALINEA>The report by <DATE ISO="20260521">21 May 2026</DATE> shall include</ALINEA>
        </PARAG>'''
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        self.assertIn('21 May 2026', result)
    
    def test_ht_italic(self):
        """HT ITALIC should produce *text*."""
        xml = '<P>Text with <HT TYPE="ITALIC">italic content</HT> here</P>'
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        self.assertIn('*italic content*', result)
    
    def test_ht_bold(self):
        """HT BOLD should produce **text**."""
        xml = '<P>Text with <HT TYPE="BOLD">bold content</HT> here</P>'
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        self.assertIn('**bold content**', result)
    
    def test_note_inline(self):
        """NOTE elements should be converted to inline references with escaped brackets."""
        xml = '<P>Text with footnote<NOTE NOTE.ID="1">Footnote text here</NOTE> continues</P>'
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        # Brackets are escaped to prevent Markdown link interpretation
        self.assertIn('\\[Footnote text here\\]', result)

    
    def test_quote_markers(self):
        """QUOT.START and QUOT.END should produce quote characters."""
        xml = '<P><QUOT.START CODE="2018"/>quoted text<QUOT.END CODE="2019"/></P>'
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        self.assertIn("'", result)
    
    def test_tail_text_preserved(self):
        """Text after nested elements (tail) should be preserved."""
        xml = '<P>Before <DATE ISO="20260521">21 May 2026</DATE> after the date</P>'
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        self.assertIn('after the date', result)
    
    def test_multiple_nested_elements(self):
        """Multiple nested elements in sequence."""
        xml = '''<ALINEA>
            By <DATE ISO="20260521">21 May 2026</DATE> and every 
            <HT TYPE="BOLD">four years</HT> thereafter
        </ALINEA>'''
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        self.assertIn('21 May 2026', result)
        self.assertIn('**four years**', result)
        self.assertIn('thereafter', result)


class TestCleanText(unittest.TestCase):
    """Test the clean_text function."""
    
    def test_remove_extra_whitespace(self):
        """Multiple spaces should become single space."""
        result = clean_text("Text   with   multiple   spaces")
        self.assertEqual(result, "Text with multiple spaces")
    
    def test_preserve_single_space(self):
        """Single spaces should be preserved."""
        result = clean_text("Normal text here")
        self.assertEqual(result, "Normal text here")
    
    def test_strip_leading_trailing(self):
        """Leading and trailing whitespace should be stripped."""
        result = clean_text("   Text with padding   ")
        self.assertEqual(result, "Text with padding")
    
    def test_newlines_to_space(self):
        """Newlines should become spaces."""
        result = clean_text("Line one\nLine two")
        self.assertIn("Line one", result)
        self.assertIn("Line two", result)


class TestArticle49Pattern(unittest.TestCase):
    """Test specific patterns from the problematic Article 49."""
    
    def test_article_49_paragraph_1(self):
        """Article 49 paragraph 1 with date - the known failing case."""
        xml = '''<PARAG ID="PAR_01">
            <NO.PARAG>1.</NO.PARAG>
            <ALINEA>The Commission shall review the application of this Regulation and shall, by <DATE ISO="20260521">21 May 2026</DATE>, submit a report to the European Parliament and to the Council.</ALINEA>
        </PARAG>'''
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        
        # These are the critical assertions
        self.assertIn('21 May 2026', result, 
            "CRITICAL: Date '21 May 2026' missing from Article 49 paragraph 1")
        self.assertIn('submit a report', result)
    
    def test_article_49_paragraph_3(self):
        """Article 49 paragraph 3 with 2030 date."""
        xml = '''<PARAG ID="PAR_03">
            <NO.PARAG>3.</NO.PARAG>
            <ALINEA>By <DATE ISO="20300521">21 May 2030</DATE> and every four years thereafter, the Commission shall submit a report.</ALINEA>
        </PARAG>'''
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        
        self.assertIn('21 May 2030', result,
            "CRITICAL: Date '21 May 2030' missing from Article 49 paragraph 3")
        self.assertIn('every four years', result)


class TestArticle51Pattern(unittest.TestCase):
    """Test patterns from Article 51 (Transitional measures)."""
    
    def test_transitional_measure_with_date(self):
        """Transitional measures should include end dates."""
        xml = '''<PARAG ID="PAR_01">
            <NO.PARAG>1.</NO.PARAG>
            <ALINEA>Secure signature creation devices shall continue to be considered qualified until <DATE ISO="20270521">21 May 2027</DATE>.</ALINEA>
        </PARAG>'''
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        
        self.assertIn('21 May 2027', result)
        self.assertIn('continue to be considered', result)


class TestQuotedContentExtraction(unittest.TestCase):
    """Test QUOT.S (quoted section) extraction for amending regulations."""
    
    def test_quot_s_with_article(self):
        """QUOT.S containing full article replacement."""
        xml = '''<QUOT.S>
            <ARTICLE>
                <TI.ART>Article 49</TI.ART>
                <STI.ART>Review</STI.ART>
                <PARAG>
                    <NO.PARAG>1.</NO.PARAG>
                    <ALINEA>The Commission shall review by <DATE ISO="20260521">21 May 2026</DATE>.</ALINEA>
                </PARAG>
            </ARTICLE>
        </QUOT.S>'''
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        
        self.assertIn('Article 49', result)
        self.assertIn('Review', result)
        self.assertIn('21 May 2026', result)


class TestAmendmentListProcessing(unittest.TestCase):
    """Test processing of amendment lists with instructions + quoted content."""
    
    def test_amendment_with_replacement_text(self):
        """Amendment list item with instruction and replacement content."""
        xml = '''<LIST>
            <ITEM>
                <NP>
                    <NO.P>(50)</NO.P>
                    <TXT>Article 49 is replaced by the following:</TXT>
                    <P>
                        <QUOT.S>
                            <ARTICLE>
                                <PARAG>
                                    <ALINEA>By <DATE ISO="20260521">21 May 2026</DATE>, submit report.</ALINEA>
                                </PARAG>
                            </ARTICLE>
                        </QUOT.S>
                    </P>
                </NP>
            </ITEM>
        </LIST>'''
        
        # This is the key test - does the amendment processing work?
        elem = ET.fromstring(xml)
        # Note: We need a parent element for the function
        parent = ET.Element('DIV')
        parent.append(elem)
        
        result = process_list_with_quotes(elem, parent, indent_level=0)
        result_text = '\n'.join(result)
        
        self.assertIn('(50)', result_text, "Point number should be present")
        self.assertIn('Article 49 is replaced', result_text, "Instruction should be present")
        self.assertIn('21 May 2026', result_text, 
            "CRITICAL: Date in replacement content must be extracted")


class TestRealWorldXML(unittest.TestCase):
    """Test against actual Formex XML snippets from EUR-Lex."""
    
    def test_real_dates_extracted_from_alinea(self):
        """Test that DATE elements in ALINEA are correctly extracted."""
        xml_path = Path(__file__).parent.parent / '01_regulation' / '2024_1183_eIDAS2_Amending' / 'formex' / 'L_202401183EN.000101.fmx.xml'
        
        if not xml_path.exists():
            self.skipTest(f"Formex XML not found at {xml_path}")
        
        tree = ET.parse(xml_path)
        root = tree.getroot()
        
        # Check that the XML contains date elements with 2026
        date_elems = root.findall('.//DATE[@ISO="20260521"]')
        self.assertGreater(len(date_elems), 0, 
            "XML should contain DATE elements with ISO='20260521'")
        
        # For each DATE element, verify its text can be extracted
        for date_elem in date_elems:
            date_text = get_element_text(date_elem)
            # Normalize non-breaking spaces
            date_text_normalized = date_text.replace('\xa0', ' ')
            self.assertIn('May 2026', date_text_normalized,
                f"DATE element text not extracted correctly: {date_text}")

    def test_deeply_nested_dates_in_quot_s(self):
        """
        Edge case: Dates inside QUOT.S > ARTICLE > PARAG > ALINEA structures.
        The parent ALINEA (containing the LIST) shouldn't need to extract
        these - they're handled by the QUOT.S processing separately.
        """
        xml = '''<ALINEA>
            <LIST>
                <ITEM>
                    <NP>
                        <NO.P>(50)</NO.P>
                        <TXT>Article 49 is replaced by the following:</TXT>
                        <P>
                            <QUOT.S>
                                <ARTICLE>
                                    <PARAG>
                                        <ALINEA>By <DATE ISO="20260521">21 May 2026</DATE>.</ALINEA>
                                    </PARAG>
                                </ARTICLE>
                            </QUOT.S>
                        </P>
                    </NP>
                </ITEM>
            </LIST>
        </ALINEA>'''
        
        elem = ET.fromstring(xml)
        
        # The nested ALINEA (inside QUOT.S) should extract the date
        nested_alinea = elem.find('.//QUOT.S//ALINEA')
        nested_text = get_element_text(nested_alinea).replace('\xa0', ' ')
        self.assertIn('21 May 2026', nested_text,
            "Deeply nested ALINEA should extract date correctly")


class TestDuplicateArticleExtraction(unittest.TestCase):
    """Test that ARTICLE elements inside QUOT.S are NOT extracted twice."""
    
    def test_quot_s_articles_not_separately_extracted(self):
        """
        BUG: ARTICLE elements nested in QUOT.S (replacement text) are being 
        extracted twice - once correctly as blockquoted content, and again 
        incorrectly as standalone article headers.
        
        The extract_articles() function should SKIP any ARTICLE elements that
        have a QUOT.S ancestor.
        """
        # Import extract_articles for this test
        from formex_to_md_v3 import extract_articles
        
        # Minimal Formex structure simulating an amending regulation
        xml = '''<ACT>
            <ARTICLE>
                <TI.ART>Article 1</TI.ART>
                <STI.ART>Amendments</STI.ART>
                <PARAG>
                    <ALINEA>
                        <LIST>
                            <ITEM>
                                <NP>
                                    <NO.P>(1)</NO.P>
                                    <TXT>Article 49 is replaced by the following:</TXT>
                                    <P>
                                        <QUOT.S>
                                            <ARTICLE>
                                                <TI.ART>Article 49</TI.ART>
                                                <STI.ART>Review</STI.ART>
                                                <PARAG>
                                                    <ALINEA>By <DATE ISO="20260521">21 May 2026</DATE>.</ALINEA>
                                                </PARAG>
                                            </ARTICLE>
                                        </QUOT.S>
                                    </P>
                                </NP>
                            </ITEM>
                        </LIST>
                    </ALINEA>
                </PARAG>
            </ARTICLE>
        </ACT>'''
        
        root = ET.fromstring(xml)
        lines = extract_articles(root)
        output = '\n'.join(lines)
        
        # Count how many times "Article 49" appears as a heading (### Article 49)
        article_49_headings = output.count('### Article 49')
        
        # It should appear AT MOST 0 times as a heading (since it's inside QUOT.S)
        # The parent "Article 1" can appear as a heading
        self.assertEqual(article_49_headings, 0,
            f"Article 49 (inside QUOT.S) should NOT be extracted as a separate heading. "
            f"Found {article_49_headings} occurrences. Output:\n{output[:500]}")


class TestPostProcessing(unittest.TestCase):
    """Test post-processing of Markdown output."""
    
    def test_consecutive_horizontal_rules_collapsed(self):
        """
        Consecutive horizontal rules (---) with only whitespace between should 
        be collapsed into a single rule. This is FORMAT007.
        """
        import re
        
        # Simulate the post-processing regex
        input_md = "Some content\n\n---\n\n---\n\nMore content"
        
        # Apply the same regex used in convert_formex_to_md
        output_md = re.sub(r'(---+\n)(\s*\n)*---+', r'---', input_md)
        
        # Count horizontal rules
        hr_count = output_md.count('---')
        self.assertEqual(hr_count, 1, 
            f"Consecutive --- should be collapsed to one. Got: {output_md}")
    
    def test_multiple_consecutive_hrs_collapsed(self):
        """Three or more consecutive --- should also collapse to one."""
        import re
        
        input_md = "Content\n---\n\n---\n\n---\nMore content"
        output_md = input_md
        
        # Apply repeatedly until no more changes (as done in the converter)
        prev = None
        while prev != output_md:
            prev = output_md
            output_md = re.sub(r'(---+\n)(\s*\n)*---+', r'---', output_md)
        
        # Should collapse to single ---
        self.assertEqual(output_md.count('---'), 1)
    
    def test_separated_hrs_preserved(self):
        """Non-consecutive --- (with content between) should be preserved."""
        import re
        
        input_md = "Content\n---\nSection 1\n---\nSection 2"
        output_md = re.sub(r'(---+\n)(\s*\n)*---+', r'---', input_md)
        
        # Both --- should remain (they have content between them)
        self.assertEqual(output_md.count('---'), 2)
    
    def test_hr_before_header_removed(self):
        """
        FORMAT008: Horizontal rule immediately before a header should be removed.
        Headers have built-in visual styling, so preceding HRs are redundant.
        """
        import re
        
        # Test H1 header
        input_md = "Some content\n\n---\n\n# ANNEXES\n\nMore content"
        # Apply the fix regex from fix_format_issues.py
        output_md = re.sub(r'^---+\n(\s*\n)*(#{1,6}\s+)', r'\2', input_md, flags=re.MULTILINE)
        
        self.assertNotIn('---', output_md, 
            "HR before H1 header should be removed")
        self.assertIn('# ANNEXES', output_md,
            "Header should be preserved")
    
    def test_hr_before_h2_header_removed(self):
        """FORMAT008: HR before H2 header should also be removed."""
        import re
        
        input_md = "Article content\n\n---\n\n## Enacting Terms\n\nTerms here"
        output_md = re.sub(r'^---+\n(\s*\n)*(#{1,6}\s+)', r'\2', input_md, flags=re.MULTILINE)
        
        self.assertNotIn('---', output_md)
        self.assertIn('## Enacting Terms', output_md)
    
    def test_hr_before_non_header_preserved(self):
        """HR before regular text (not a header) should be preserved."""
        import re
        
        input_md = "Article 52\n\n---\n\nThis Regulation shall be binding"
        output_md = re.sub(r'^---+\n(\s*\n)*(#{1,6}\s+)', r'\2', input_md, flags=re.MULTILINE)
        
        # HR should remain since next line is not a header
        self.assertIn('---', output_md)
        self.assertIn('This Regulation shall be binding', output_md)
    
    def test_converter_no_hr_before_enacting_terms(self):
        """
        The converter should NOT output --- before the Enacting Terms header.
        Headers provide their own visual separation.
        """
        from formex_to_md_v3 import convert_formex_to_md
        import tempfile
        import os
        
        # Minimal valid Formex XML with ENACTING.TERMS
        xml_content = '''<?xml version="1.0" encoding="UTF-8"?>
        <ACT>
            <TITLE><TI><P>Test Regulation</P></TI></TITLE>
            <ENACTING.TERMS>
                <ARTICLE>
                    <TI.ART>Article 1</TI.ART>
                    <PARAG><ALINEA>Test content.</ALINEA></PARAG>
                </ARTICLE>
            </ENACTING.TERMS>
        </ACT>'''
        
        # Write to temp file and convert
        with tempfile.NamedTemporaryFile(mode='w', suffix='.xml', delete=False, encoding='utf-8') as f:
            f.write(xml_content)
            temp_path = f.name
        
        try:
            result = convert_formex_to_md(temp_path, None)
            
            # Check that there's no "---" immediately before "## Enacting Terms"
            self.assertIn('## Enacting Terms', result,
                "Enacting Terms header should be present")
            self.assertNotIn('---\n\n## Enacting Terms', result,
                "There should be no HR immediately before Enacting Terms header")
        finally:
            os.unlink(temp_path)


class TestQuotedArticleFormatting(unittest.TestCase):
    """Tests for format_quoted_article function and QUOT.S handling."""
    
    def test_format_quoted_article_structure(self):
        """
        ARTICLE inside QUOT.S should be formatted with proper structure:
        - Article title on its own line
        - Subtitle bolded on its own line  
        - Paragraph text on its own line
        - List items (a), (b), (c) on separate lines
        """
        from formex_to_md_v3 import format_quoted_article
        import xml.etree.ElementTree as ET
        
        # Create an ARTICLE element similar to what we'd find in QUOT.S
        article_xml = '''
        <ARTICLE IDENTIFIER="001">
            <TI.ART>Article 1</TI.ART>
            <STI.ART><P>Subject matter</P></STI.ART>
            <ALINEA>
                <P>This Regulation applies to all services.</P>
                <LIST>
                    <ITEM><NP><NO.P>(a)</NO.P><TXT>first point;</TXT></NP></ITEM>
                    <ITEM><NP><NO.P>(b)</NO.P><TXT>second point;</TXT></NP></ITEM>
                </LIST>
            </ALINEA>
        </ARTICLE>
        '''
        article_elem = ET.fromstring(article_xml)
        
        lines = format_quoted_article(article_elem, indent="")
        
        # Check that we have separate lines for each part
        # Note: No leading quote on title - QUOT.S/QUOT.E elements handle quoting
        self.assertTrue(any("*Article 1*" in line for line in lines),
            "Article title should be present and italicized")
        self.assertTrue(any("**Subject matter**" in line for line in lines),
            "Subtitle should be bolded")
        self.assertTrue(any("This Regulation applies" in line for line in lines),
            "Paragraph text should be present")
        self.assertTrue(any("(a)" in line for line in lines),
            "List item (a) should be present")
        self.assertTrue(any("(b)" in line for line in lines),
            "List item (b) should be present")
        
        # All lines should be blockquoted
        for line in lines:
            self.assertTrue(line.startswith(">"), 
                f"Line should start with blockquote: {line}")
    
    def test_blank_line_after_blockquote(self):
        """
        After blockquote content, there should be a blank line to prevent
        Markdown from merging it with the next item.
        """
        from formex_to_md_v3 import convert_formex_to_md
        import tempfile
        import os
        
        # Minimal XML with QUOT.S containing simple content
        xml_content = '''<?xml version="1.0" encoding="UTF-8"?>
        <ACT>
            <TITLE><TI><P>Test</P></TI></TITLE>
            <ENACTING.TERMS>
                <ARTICLE IDENTIFIER="001">
                    <TI.ART>Article 1</TI.ART>
                    <PARAG>
                        <ALINEA>
                            <LIST>
                                <ITEM>
                                    <NP>
                                        <NO.P>(1)</NO.P>
                                        <TXT>First is replaced:</TXT>
                                        <P><QUOT.S LEVEL="1"><P>Replacement text.</P></QUOT.S></P>
                                    </NP>
                                </ITEM>
                                <ITEM>
                                    <NP>
                                        <NO.P>(2)</NO.P>
                                        <TXT>Second is amended.</TXT>
                                    </NP>
                                </ITEM>
                            </LIST>
                        </ALINEA>
                    </PARAG>
                </ARTICLE>
            </ENACTING.TERMS>
        </ACT>'''
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.xml', delete=False, encoding='utf-8') as f:
            f.write(xml_content)
            temp_path = f.name
        
        try:
            result = convert_formex_to_md(temp_path, None)
            
            # After blockquote ">", there should be blank line before "(2)"
            # The pattern should NOT be "> text\n(2)" but "> text\n\n(2)"
            self.assertNotIn('>\n(2)', result.replace('\r\n', '\n'),
                "There should be a blank line between blockquote and next item")
        finally:
            os.unlink(temp_path)

    def test_multi_paragraph_blockquote_separation(self):
        """
        Multiple paragraphs within a blockquote should be separated by blank > lines.
        This test verifies the fix by checking the existing fixed file.
        """
        from pathlib import Path
        
        # Check the fixed file directly
        md_file = Path('01_regulation/2024_1183_eIDAS2_Amending/32024R1183.md')
        if md_file.exists():
            content = md_file.read_text(encoding='utf-8')
            # The file should have blank > lines between consecutive blockquote paragraphs
            # Pattern: ">\n>" where the first > is blank separator (no indent now)
            self.assertIn('>\n>', content,
                "Multi-paragraph blockquotes should have blank > separator lines")
        else:
            self.skipTest("32024R1183.md not available")

    def test_html_structure_validation(self):
        """
        Programmatic validation that the Markdown renders to proper HTML structure.
        This catches issues where content renders as code blocks instead of lists.
        """
        try:
            import markdown
        except ImportError:
            self.skipTest("markdown module not installed")
        
        from pathlib import Path
        
        md_file = Path('01_regulation/2024_1183_eIDAS2_Amending/32024R1183.md')
        if not md_file.exists():
            self.skipTest("32024R1183.md not available")
        
        md_content = md_file.read_text(encoding='utf-8')
        html = markdown.markdown(md_content, extensions=['extra'])
        
        # Validate proper HTML structure
        self.assertIn('<blockquote>', html, "Blockquotes should render as <blockquote> tags")
        self.assertIn('<ul>', html, "Lists should render as <ul> tags")
        self.assertIn('<li>', html, "List items should render as <li> tags")
        
        # Lists should NOT be rendered as code blocks
        self.assertNotIn('<code>- (a)', html, 
            "List items should not be in code blocks")
        self.assertNotIn('<pre>- (a)', html,
            "List items should not be in pre blocks")



class TestFootnoteEscaping(unittest.TestCase):
    """Test that footnote square brackets are escaped to prevent Markdown link interpretation."""
    
    def test_footnote_brackets_escaped(self):
        """
        BUG FIX: Footnote text in square brackets [like this] was being
        interpreted as Markdown links when followed by certain text patterns.
        
        The fix escapes the brackets: \\[like this\\]
        """
        xml = '''<P>Text with footnote<NOTE NOTE.ID="E0001"><P>Regulation (EU) 2016/679 (OJ L 119, 4.5.2016, p. 1).</P></NOTE> continues</P>'''
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        
        # The brackets should be escaped
        self.assertIn('\\[', result, "Opening bracket should be escaped")
        self.assertIn('\\]', result, "Closing bracket should be escaped")
        # The note text should still be present
        self.assertIn('Regulation (EU) 2016/679', result)
    
    def test_nested_brackets_in_footnote_escaped(self):
        """
        Footnotes containing nested brackets (e.g., OJ references) should 
        have ALL brackets escaped.
        """
        xml = '''<P>Reference<NOTE NOTE.ID="E0001"><P>See [OJ L 119] for details.</P></NOTE>.</P>'''
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        
        # All brackets should be escaped
        # The outer NOTE brackets + the inner [OJ L 119] brackets
        self.assertEqual(result.count('\\['), 2, "All opening brackets should be escaped")
        self.assertEqual(result.count('\\]'), 2, "All closing brackets should be escaped")
    
    def test_footnote_not_rendered_as_link(self):
        """
        When the Markdown is rendered, escaped brackets should appear as
        literal text, not as links.
        """
        try:
            import markdown
        except ImportError:
            self.skipTest("markdown module not installed")
        
        # Simulate what the converter produces
        test_md = "This Regulation \\[Regulation (EU) 2016/679\\]."
        html = markdown.markdown(test_md)
        
        # Should NOT contain <a> tag (link)
        self.assertNotIn('<a ', html, "Escaped brackets should not create links")
        # The bracketed text should be visible
        self.assertIn('[Regulation (EU) 2016/679]', html, 
            "Bracketed text should be visible (without escapes in rendered HTML)")


class TestBlockquoteParagraphNumbers(unittest.TestCase):
    """Test that paragraph numbers are included in blockquoted content."""
    
    def test_paragraph_number_in_blockquote(self):
        """
        Paragraph numbers (from NO.PARAG) should be included in blockquoted
        replacement text from QUOT.S blocks.
        """
        xml = '''<NP>
            <NO.P>(a)</NO.P>
            <TXT>paragraph 1 is replaced by the following:</TXT>
            <P>
                <QUOT.S LEVEL="1">
                    <PARAG IDENTIFIER="001.001">
                        <NO.PARAG>'1.</NO.PARAG>
                        <ALINEA>This Regulation applies to all services.</ALINEA>
                    </PARAG>
                </QUOT.S>
            </P>
        </NP>'''
        
        # Create a wrapper LIST/ITEM for the function
        list_xml = f'<LIST><ITEM>{xml}</ITEM></LIST>'
        elem = ET.fromstring(list_xml)
        parent = ET.Element('ALINEA')
        parent.append(elem)
        
        lines = process_list_with_quotes(elem, parent, 0)
        output = '\n'.join(lines)
        
        # The blockquote should include the paragraph number WITHOUT quote marks
        # (QUOT.START produces quote chars which should be stripped in blockquote context)
        self.assertIn("1.", output, "Paragraph number should be present in blockquote")
        self.assertNotIn("'1.", output, "Leading quote should be stripped from paragraph number")
        self.assertIn("This Regulation applies", output, "Paragraph text should be present")


class TestNestedListInBlockquote(unittest.TestCase):
    """Test that LIST elements inside QUOT.S are properly formatted."""
    
    def test_list_items_on_separate_lines(self):
        """
        When QUOT.S contains a LIST, each ITEM should be on its own line,
        not concatenated together on a single line.
        """
        xml = '''<NP>
            <NO.P>(a)</NO.P>
            <TXT>points (1) to (3) are replaced by the following:</TXT>
            <P>
                <QUOT.S LEVEL="1">
                    <LIST TYPE="ARAB">
                        <ITEM><NP><NO.P>'(1)</NO.P><TXT>first definition;</TXT></NP></ITEM>
                        <ITEM><NP><NO.P>(2)</NO.P><TXT>second definition;</TXT></NP></ITEM>
                        <ITEM><NP><NO.P>(3)</NO.P><TXT>third definition;</TXT></NP></ITEM>
                    </LIST>
                </QUOT.S>
            </P>
        </NP>'''
        
        list_xml = f'<LIST><ITEM>{xml}</ITEM></LIST>'
        elem = ET.fromstring(list_xml)
        parent = ET.Element('ALINEA')
        parent.append(elem)
        
        lines = process_list_with_quotes(elem, parent, 0)
        output = '\n'.join(lines)
        
        # Each item should be on a separate line (count blockquote lines)
        blockquote_lines = [l for l in lines if l.strip().startswith('>')]
        self.assertGreaterEqual(len(blockquote_lines), 3, 
            f"Should have at least 3 blockquote lines (one per item), got {len(blockquote_lines)}")
        
        # Leading quotes should be stripped from item numbers
        self.assertNotIn("'(1)", output, "Leading quote should be stripped from first item")
        self.assertIn("(1)", output, "First item number should be present")
        self.assertIn("(2)", output, "Second item number should be present")
        self.assertIn("(3)", output, "Third item number should be present")


class TestBulletPointNesting(unittest.TestCase):
    """Test that list items use bullet points for proper Markdown nesting."""
    
    def test_instruction_items_have_bullet_prefix(self):
        """
        Instruction items like '(a) paragraph 1 is replaced...' should have
        bullet point prefix '- ' for proper Markdown list nesting.
        """
        xml = '''<NP>
            <NO.P>(a)</NO.P>
            <TXT>paragraph 1 is replaced by the following:</TXT>
            <P>
                <QUOT.S LEVEL="1">
                    <PARAG IDENTIFIER="001.001">
                        <NO.PARAG>1.</NO.PARAG>
                        <ALINEA>This is the replacement text.</ALINEA>
                    </PARAG>
                </QUOT.S>
            </P>
        </NP>'''
        
        list_xml = f'<LIST><ITEM>{xml}</ITEM></LIST>'
        elem = ET.fromstring(list_xml)
        parent = ET.Element('ALINEA')
        parent.append(elem)
        
        lines = process_list_with_quotes(elem, parent, 0)
        output = '\n'.join(lines)
        
        # Item should have bullet point prefix
        self.assertIn("- (a)", output, "Instruction item should have bullet point prefix")
        
    def test_blockquotes_indented_under_bullets(self):
        """
        Blockquoted content should be indented under its parent bullet point.
        The blockquote should have 2 extra spaces of indentation.
        """
        xml = '''<NP>
            <NO.P>(a)</NO.P>
            <TXT>paragraph 1 is replaced by the following:</TXT>
            <P>
                <QUOT.S LEVEL="1">
                    <PARAG IDENTIFIER="001.001">
                        <NO.PARAG>1.</NO.PARAG>
                        <ALINEA>Replacement text here.</ALINEA>
                    </PARAG>
                </QUOT.S>
            </P>
        </NP>'''
        
        list_xml = f'<LIST><ITEM>{xml}</ITEM></LIST>'
        elem = ET.fromstring(list_xml)
        parent = ET.Element('ALINEA')
        parent.append(elem)
        
        lines = process_list_with_quotes(elem, parent, 0)
        
        # Find the bullet line and blockquote line
        bullet_line = None
        blockquote_line = None
        for line in lines:
            if '- (a)' in line:
                bullet_line = line
            elif '>' in line and 'Replacement' in line:
                blockquote_line = line
        
        self.assertIsNotNone(bullet_line, "Should have a bullet point line")
        self.assertIsNotNone(blockquote_line, "Should have a blockquote line")
        
        # Blockquote should have more indentation than the bullet
        bullet_indent = len(bullet_line) - len(bullet_line.lstrip())
        blockquote_indent = len(blockquote_line) - len(blockquote_line.lstrip())
        self.assertGreater(blockquote_indent, bullet_indent, 
            f"Blockquote indent ({blockquote_indent}) should be greater than bullet indent ({bullet_indent})")


class TestDivisionInBlockquote(unittest.TestCase):
    """Test that DIVISION elements inside QUOT.S are properly structured."""
    
    def test_division_with_articles_properly_separated(self):
        """
        DIVISION containing section title and multiple articles should be
        formatted with proper separation, not flattened into one line.
        """
        xml = '''<NP>
            <NO.P>(5)</NO.P>
            <TXT>the following section is inserted:</TXT>
            <P>
                <QUOT.S LEVEL="1">
                    <DIVISION>
                        <TITLE>SECTION 1 EUROPEAN DIGITAL IDENTITY WALLET</TITLE>
                        <ARTICLE IDENTIFIER="005A">
                            <TI.ART>Article 5a</TI.ART>
                            <STI.ART>European Digital Identity Wallets</STI.ART>
                            <PARAG IDENTIFIER="005A.001">
                                <NO.PARAG>1.</NO.PARAG>
                                <ALINEA>First paragraph of Article 5a.</ALINEA>
                            </PARAG>
                        </ARTICLE>
                        <ARTICLE IDENTIFIER="005B">
                            <TI.ART>Article 5b</TI.ART>
                            <STI.ART>Relying Parties</STI.ART>
                            <PARAG IDENTIFIER="005B.001">
                                <NO.PARAG>1.</NO.PARAG>
                                <ALINEA>First paragraph of Article 5b.</ALINEA>
                            </PARAG>
                        </ARTICLE>
                    </DIVISION>
                </QUOT.S>
            </P>
        </NP>'''
        
        list_xml = f'<LIST><ITEM>{xml}</ITEM></LIST>'
        elem = ET.fromstring(list_xml)
        parent = ET.Element('ALINEA')
        parent.append(elem)
        
        lines = process_list_with_quotes(elem, parent, 0)
        output = '\n'.join(lines)
        
        # Section title should be present
        self.assertIn("SECTION 1", output, "Section title should be present")
        
        # Both articles should be present
        self.assertIn("Article 5a", output, "Article 5a should be present")
        self.assertIn("Article 5b", output, "Article 5b should be present")
        
        # Articles should be on separate lines (not all concatenated)
        # Count lines containing article references
        article_lines = [l for l in lines if 'Article 5a' in l or 'Article 5b' in l]
        self.assertGreaterEqual(len(article_lines), 2, 
            f"Articles should be on separate lines, but found {len(article_lines)} article lines")


class TestListBulletPrefixes(unittest.TestCase):
    """Test that list items in process_list_simple have bullet prefixes."""
    
    def test_all_list_items_have_bullet_prefix(self):
        """
        BUG FIX: process_list_simple was outputting list items without the
        '- ' bullet prefix, causing items (b), (c), etc. to be rendered
        as continuation of item (a) rather than separate list items.
        
        All list items should have '- ' prefix for proper Markdown rendering.
        """
        # Simulate a LIST element with multiple items (a), (b), (c)
        xml = '''<LIST>
            <ITEM>
                <NP>
                    <NO.P>(a)</NO.P>
                    <TXT>first point about identification;</TXT>
                </NP>
            </ITEM>
            <ITEM>
                <NP>
                    <NO.P>(b)</NO.P>
                    <TXT>second point about trust services;</TXT>
                </NP>
            </ITEM>
            <ITEM>
                <NP>
                    <NO.P>(c)</NO.P>
                    <TXT>third point about electronic ledgers.</TXT>
                </NP>
            </ITEM>
        </LIST>'''
        
        elem = ET.fromstring(xml)
        lines = process_list_simple(elem, indent_level=0)
        
        # All items should have bullet prefix
        self.assertIn('- (a)', '\n'.join(lines), "Item (a) should have bullet prefix")
        self.assertIn('- (b)', '\n'.join(lines), "Item (b) should have bullet prefix")
        self.assertIn('- (c)', '\n'.join(lines), "Item (c) should have bullet prefix")
        
        # Each line should start with '- '
        for line in lines:
            if line.strip():  # Skip empty lines
                self.assertTrue(line.lstrip().startswith('- '),
                    f"Line should start with bullet prefix: {line}")
    
    def test_nested_list_items_indented_with_bullets(self):
        """
        Nested list items should be properly indented AND have bullet prefixes.
        """
        xml = '''<LIST>
            <ITEM>
                <NP>
                    <NO.P>(a)</NO.P>
                    <TXT>main point:</TXT>
                    <P>
                        <LIST>
                            <ITEM>
                                <NP>
                                    <NO.P>(i)</NO.P>
                                    <TXT>sub-point one;</TXT>
                                </NP>
                            </ITEM>
                            <ITEM>
                                <NP>
                                    <NO.P>(ii)</NO.P>
                                    <TXT>sub-point two;</TXT>
                                </NP>
                            </ITEM>
                        </LIST>
                    </P>
                </NP>
            </ITEM>
        </LIST>'''
        
        elem = ET.fromstring(xml)
        lines = process_list_simple(elem, indent_level=0)
        output = '\n'.join(lines)
        
        # Main item should have bullet
        self.assertIn('- (a)', output, "Main item should have bullet prefix")
        
        # Nested items should have bullets too
        self.assertIn('- (i)', output, "Nested item (i) should have bullet prefix")
        self.assertIn('- (ii)', output, "Nested item (ii) should have bullet prefix")
        
        # Nested items should be indented (have leading spaces)
        for line in lines:
            if '(i)' in line or '(ii)' in line:
                self.assertTrue(line.startswith('  '),
                    f"Nested item should be indented: {line}")


class TestRecitalsIndentation(unittest.TestCase):
    """Test that recitals are output as list items for proper indentation."""
    
    def test_recitals_have_bullet_prefix(self):
        """Recitals should be output as list items with bullet prefix."""
        from formex_to_md_v3 import extract_recitals
        
        xml = '''<ACT>
            <PREAMBLE>
                <GR.CONSID>
                    <CONSID>
                        <NP>
                            <NO.P>(1)</NO.P>
                            <TXT>The European Digital Identity Framework is crucial.</TXT>
                        </NP>
                    </CONSID>
                    <CONSID>
                        <NP>
                            <NO.P>(2)</NO.P>
                            <TXT>Regulations apply to all Member States.</TXT>
                        </NP>
                    </CONSID>
                </GR.CONSID>
            </PREAMBLE>
        </ACT>'''
        
        root = ET.fromstring(xml)
        lines = extract_recitals(root)
        output = '\n'.join(lines)
        
        # Recitals should have bullet prefix for indentation
        self.assertIn('- (1)', output, "Recital (1) should have bullet prefix")
        self.assertIn('- (2)', output, "Recital (2) should have bullet prefix")
        self.assertIn('European Digital Identity', output)
        self.assertIn('Regulations apply', output)


class TestDefinitionsIndentation(unittest.TestCase):
    """Test that definition patterns are converted to list items."""
    
    def test_definition_patterns_converted_to_list(self):
        """Lines starting with (N) 'term' should be converted to list items."""
        from formex_to_md_v3 import convert_formex_to_md
        import tempfile
        import os
        
        # Minimal Formex with definition-style article
        xml_content = '''<?xml version="1.0" encoding="UTF-8"?>
        <ACT>
            <TITLE><TI><P>Test Regulation</P></TI></TITLE>
            <ENACTING.TERMS>
                <ARTICLE>
                    <TI.ART>Article 3</TI.ART>
                    <STI.ART>Definitions</STI.ART>
                    <ALINEA>
                        <P>For the purposes of this Regulation:</P>
                    </ALINEA>
                    <ALINEA>
                        <P>(1) 'electronic identification' means the process of using data;</P>
                    </ALINEA>
                    <ALINEA>
                        <P>(2) 'trust service' means an electronic service;</P>
                    </ALINEA>
                    <ALINEA>
                        <P>(23a) 'qualified service' means a certified service;</P>
                    </ALINEA>
                </ARTICLE>
            </ENACTING.TERMS>
        </ACT>'''
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.xml', delete=False, encoding='utf-8') as f:
            f.write(xml_content)
            temp_path = f.name
        
        try:
            result = convert_formex_to_md(temp_path, None)
            
            # Definition patterns should be converted to list items
            self.assertIn("- (1) 'electronic identification'", result,
                "Definition (1) should have bullet prefix")
            self.assertIn("- (2) 'trust service'", result,
                "Definition (2) should have bullet prefix")
            self.assertIn("- (23a) 'qualified service'", result,
                "Definition (23a) should have bullet prefix")
            
            # The intro line should NOT have a bullet (doesn't match pattern)
            self.assertIn("For the purposes of this Regulation:", result)
            self.assertNotIn("- For the purposes", result,
                "Intro line should not get a bullet prefix")
        finally:
            os.unlink(temp_path)
    
    def test_nested_definitions_not_double_bulleted(self):
        """Definitions that are already list items should not get double bullets."""
        from formex_to_md_v3 import convert_formex_to_md
        import tempfile
        import os
        
        # Formex with LIST structure (already outputs as list items)
        xml_content = '''<?xml version="1.0" encoding="UTF-8"?>
        <ACT>
            <TITLE><TI><P>Test</P></TI></TITLE>
            <ENACTING.TERMS>
                <ARTICLE>
                    <TI.ART>Article 1</TI.ART>
                    <ALINEA>
                        <P>This regulation:</P>
                        <LIST>
                            <ITEM><NP><NO.P>(a)</NO.P><TXT>first point;</TXT></NP></ITEM>
                            <ITEM><NP><NO.P>(b)</NO.P><TXT>second point.</TXT></NP></ITEM>
                        </LIST>
                    </ALINEA>
                </ARTICLE>
            </ENACTING.TERMS>
        </ACT>'''
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.xml', delete=False, encoding='utf-8') as f:
            f.write(xml_content)
            temp_path = f.name
        
        try:
            result = convert_formex_to_md(temp_path, None)
            
            # List items (a), (b) should have single bullet, not double
            self.assertNotIn('- - (a)', result,
                "Should not have double bullet prefix")
            self.assertIn('- (a)', result,
                "List item (a) should have bullet prefix")
        finally:
            os.unlink(temp_path)


if __name__ == '__main__':
    # Run with verbose output
    unittest.main(verbosity=2)

