#!/bin/bash
# Fetch EUDIW FAQ content from EC Confluence REST API — V2
# Fetches each page individually to avoid body/title mismatch

BASE_URL="https://ec.europa.eu/digital-building-blocks/sites/rest/api/content"
OUTPUT_DIR="/home/ivan/dev/eIDAS20/01_regulation/ec_eudiw_faq"
OUTPUT_FILE="${OUTPUT_DIR}/ec_eudiw_faq.md"

mkdir -p "$OUTPUT_DIR"

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

# Categories: category_page_id|category_title
CATEGORIES=(
    "713527972|General"
    "949256471|European Digital Identity Wallets"
    "949256492|Electronic Identification Schemes"
    "713528267|Wallet Usage"
    "713528150|Governance and Actors"
    "713528349|Legal and Regulation"
)

fetch_page_body() {
    local page_id="$1"
    curl -s "${BASE_URL}/${page_id}?expand=body.view,title" | python3 -c "
import sys, json, re, html

data = json.load(sys.stdin)
title = data.get('title', '').strip()
body_html = data.get('body', {}).get('view', {}).get('value', '')

# Convert HTML to markdown
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
# Remove Confluence JS artifacts
text = re.sub(r'#main-content > \* \{display: none;\}.*?//\]\]>', '', text, flags=re.DOTALL)
# Clean up whitespace
text = re.sub(r'\n{3,}', '\n\n', text)
text = text.strip()

# Remove leading tab indentation (Confluence artifact), preserve structure
lines = text.split('\n')
cleaned = []
for line in lines:
    cleaned.append(line.lstrip('\t'))
text = '\n'.join(cleaned)

print(f'### {title}')
print()
print(text)
print()
" 2>/dev/null
}

echo "Fetching FAQ content..."

for category in "${CATEGORIES[@]}"; do
    IFS='|' read -r cat_id cat_title <<< "$category"
    
    echo "--- Processing: $cat_title (page $cat_id)"
    echo "" >> "$OUTPUT_FILE"
    echo "---" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "## $cat_title" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    # Get list of child page IDs
    child_ids=$(curl -s "${BASE_URL}/${cat_id}/child/page?limit=50" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for page in data.get('results', []):
    print(page['id'])
" 2>/dev/null)
    
    count=$(echo "$child_ids" | wc -l)
    echo "   Found $count questions"
    
    # Fetch each page individually
    while IFS= read -r page_id; do
        if [ -n "$page_id" ]; then
            echo "   Fetching page $page_id..."
            fetch_page_body "$page_id" >> "$OUTPUT_FILE"
            echo "---" >> "$OUTPUT_FILE"
            echo "" >> "$OUTPUT_FILE"
            sleep 0.2  # Be polite to the API
        fi
    done <<< "$child_ids"
done

# Clean up trailing separator
sed -i '$ { /^$/d; }' "$OUTPUT_FILE"
sed -i '$ { /^---$/d; }' "$OUTPUT_FILE"

echo ""
echo "✅ FAQ assembled: $OUTPUT_FILE"
wc -l "$OUTPUT_FILE"
