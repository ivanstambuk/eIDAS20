#!/bin/bash
# Fetch EUDIW FAQ content from EC Confluence REST API
# Assembles all child pages into a single markdown file

BASE_URL="https://ec.europa.eu/digital-building-blocks/sites/rest/api/content"
OUTPUT_DIR="/home/ivan/dev/eIDAS20/01_regulation/ec_eudiw_faq"
OUTPUT_FILE="${OUTPUT_DIR}/ec_eudiw_faq.md"

mkdir -p "$OUTPUT_DIR"

# Categories with their page IDs (order matches the Confluence page)
declare -A CATEGORIES
CATEGORIES[1_general]="713527972"
CATEGORIES[2_wallets]="949256471"
CATEGORIES[3_eID]="949256492"
CATEGORIES[4_usage]="713528267"
CATEGORIES[5_governance]="713528150"
CATEGORIES[6_legal]="713528349"

declare -A CATEGORY_TITLES
CATEGORY_TITLES[1_general]="General"
CATEGORY_TITLES[2_wallets]="European Digital Identity Wallets"
CATEGORY_TITLES[3_eID]="Electronic Identification Schemes"
CATEGORY_TITLES[4_usage]="Wallet Usage"
CATEGORY_TITLES[5_governance]="Governance and Actors"
CATEGORY_TITLES[6_legal]="Legal and Regulation"

# Write header
cat > "$OUTPUT_FILE" << 'HEADER'
> **Source:** [EC Digital Building Blocks — EUDIW FAQ](https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/713526976/FAQ)
>
> **Last Updated:** 2026-02 (import date; source last updated 2026-02-16)
>
> **Category:** Guidance
>
> **Note:** This is a one-time import of the official EU Digital Identity Wallet FAQ from the EC Digital Building Blocks Confluence space. Content is preserved verbatim per DEC-092.

# EU Digital Identity Wallet FAQ

Frequently Asked Questions about the European Digital Identity Framework. These questions are intended for a professional and technical audience from both the private and public sector who are involved with the EU Digital Identity Wallet Ecosystem.

They should provide clarity on the legal and technical requirements required for the successful implementation of the European Digital Identity Wallets and electronic identification means.

> These questions and answers serve for informational purposes only and do not constitute legal advice. The definitive interpretation of EU law remains the prerogative of the Court of Justice of the European Union.

HEADER

echo "Fetching FAQ content..."

# Process each category in order
for key in $(echo "${!CATEGORIES[@]}" | tr ' ' '\n' | sort); do
    page_id="${CATEGORIES[$key]}"
    title="${CATEGORY_TITLES[$key]}"
    
    echo "--- Processing: $title (page $page_id)"
    echo "" >> "$OUTPUT_FILE"
    echo "---" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "## $title" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    # Fetch child pages with body content
    response=$(curl -s "${BASE_URL}/${page_id}/child/page?limit=50&expand=body.view,title")
    
    # Extract page count
    count=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['size'])" 2>/dev/null)
    echo "   Found $count questions"
    
    # Process each child page
    echo "$response" | python3 -c "
import sys, json, re, html

data = json.load(sys.stdin)
for page in data.get('results', []):
    title = page['title'].strip()
    # Get body HTML, strip tags to plain text
    body_html = page.get('body', {}).get('view', {}).get('value', '')
    
    # Remove HTML tags but preserve structure
    # Replace <br> and </p> with newlines
    text = body_html
    text = re.sub(r'<br\s*/?>', '\n', text)
    text = re.sub(r'</p>', '\n\n', text)
    text = re.sub(r'</li>', '\n', text)
    text = re.sub(r'<li[^>]*>', '- ', text)
    text = re.sub(r'<h[1-6][^>]*>', '\n#### ', text)
    text = re.sub(r'</h[1-6]>', '\n', text)
    text = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', text)
    text = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', text)
    text = re.sub(r'<a[^>]*href=\"([^\"]+)\"[^>]*>(.*?)</a>', r'[\2](\1)', text)
    # Remove remaining tags
    text = re.sub(r'<[^>]+>', '', text)
    # Decode HTML entities
    text = html.unescape(text)
    # Clean up whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()
    
    print(f'### {title}')
    print()
    print(text)
    print()
    print('---')
    print()
" >> "$OUTPUT_FILE"

done

# Clean up trailing separators
sed -i '$ { /^---$/d; }' "$OUTPUT_FILE"

echo ""
echo "✅ FAQ assembled: $OUTPUT_FILE"
wc -l "$OUTPUT_FILE"
