import sys
sys.path.insert(0, 'scripts')
from formex_to_md_v3 import get_element_text
import xml.etree.ElementTree as ET

# Test with non-breaking space (actual character from EUR-Lex)
xml = '<ALINEA>By <DATE ISO="20260521">21\xa0May 2026</DATE>, the Commission shall</ALINEA>'
elem = ET.fromstring(xml)
result = get_element_text(elem)
print('Input has non-breaking space (\\xa0)')
print('Result:', repr(result))
print('Contains May 2026:', 'May 2026' in result)
print('Contains 21:', '21' in result)
