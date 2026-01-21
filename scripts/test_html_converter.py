#!/usr/bin/env python3
"""
Unit tests for eurlex_html_to_md.py HTML converter.
"""

import unittest
from bs4 import BeautifulSoup
from eurlex_html_to_md import is_consolidated_format


class TestIsConsolidatedFormat(unittest.TestCase):
    """Test the is_consolidated_format detection logic."""
    
    def test_consolidated_format_detected(self):
        """Consolidated HTML with title-article-norm should return True."""
        html = '''
        <div class="eli-main-title">Title</div>
        <p class="title-article-norm">Article 1</p>
        '''
        soup = BeautifulSoup(html, 'lxml')
        self.assertTrue(is_consolidated_format(soup))
    
    def test_oj_format_not_detected_as_consolidated(self):
        """OJ format with eli-main-title but oj-ti-art should return False.
        
        This tests the fix for the Standardisation Regulation issue where
        OJ-format documents with eli-main-title were incorrectly detected
        as consolidated format.
        """
        html = '''
        <div class="eli-main-title">Title</div>
        <p class="oj-ti-art">Article 1</p>
        <p class="oj-sti-art">Subject matter</p>
        '''
        soup = BeautifulSoup(html, 'lxml')
        self.assertFalse(is_consolidated_format(soup))
    
    def test_no_eli_main_title_returns_false(self):
        """Documents without eli-main-title should return False."""
        html = '''
        <div class="other-class">Title</div>
        <p class="title-article-norm">Article 1</p>
        '''
        soup = BeautifulSoup(html, 'lxml')
        self.assertFalse(is_consolidated_format(soup))


if __name__ == '__main__':
    unittest.main()
