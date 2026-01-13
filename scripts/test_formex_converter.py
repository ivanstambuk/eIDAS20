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
        """NOTE elements should be converted to inline references."""
        xml = '<P>Text with footnote<NOTE NOTE.ID="1">Footnote text here</NOTE> continues</P>'
        elem = ET.fromstring(xml)
        result = get_element_text(elem)
        self.assertIn('[Footnote text here]', result)
    
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


if __name__ == '__main__':
    # Run with verbose output
    unittest.main(verbosity=2)


