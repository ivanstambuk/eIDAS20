#!/usr/bin/env bash
# fetch-eurlex.sh — Download EU legal texts via the Cellar REST API
#
# EUR-Lex (eur-lex.europa.eu) now uses AWS WAF Bot Control with a
# JavaScript challenge, making direct curl/wget access impossible.
#
# This script bypasses the WAF by using the Cellar API on
# publications.europa.eu, which serves the same content without WAF.
#
# Usage:
#   ./scripts/fetch-eurlex.sh <CELEX> [format]
#
# Arguments:
#   CELEX   — e.g. 32022D2481, 32022R2554, 02016R0679-20160504
#   format  — xhtml (default), fmx4, pdf
#
# Examples:
#   ./scripts/fetch-eurlex.sh 32022D2481           # XHTML
#   ./scripts/fetch-eurlex.sh 32022R2554 fmx4      # Formex XML
#   ./scripts/fetch-eurlex.sh 32014R0910 pdf        # PDF
#
# Output: /tmp/eurlex_<CELEX>.<format>
#
# How it works:
#   1. Resolves CELEX → Cellar work via content negotiation
#   2. Finds English expression from RDF metadata
#   3. Discovers available manifestations (xhtml, fmx4, pdf)
#   4. Downloads the requested format
#
# Note: This accesses the ORIGINAL (OJ) text, not the consolidated
# version. For consolidated texts (CELEX starting with 0), the
# Cellar API may not have an XHTML manifestation — try fmx4.

set -euo pipefail

CELEX="${1:?Usage: $0 <CELEX> [format]}"
FORMAT="${2:-xhtml}"

# Map format to file extension and Accept header  
case "$FORMAT" in
  xhtml)  EXT="xhtml"; ACCEPT="application/xhtml+xml, text/html" ;;
  fmx4)   EXT="xml";   ACCEPT="application/xml;mtype=fmx4, application/xml" ;;
  pdf)    EXT="pdf";    ACCEPT="application/pdf" ;;
  *)      echo "❌ Unknown format: $FORMAT (use xhtml, fmx4, or pdf)"; exit 1 ;;
esac

OUTPUT="/tmp/eurlex_${CELEX}.${EXT}"
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

echo "📥 Fetching CELEX $CELEX ($FORMAT format)..."

# Step 1: Resolve CELEX to work-level RDF to find English expression
echo "   → Resolving CELEX via Cellar API..."
HTTP_CODE=$(curl -s -o "$TMPDIR/work.xml" -w "%{http_code}" --max-time 30 \
  -H "Accept: application/rdf+xml" \
  -L \
  "http://publications.europa.eu/resource/celex/$CELEX")

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Failed to resolve CELEX $CELEX (HTTP $HTTP_CODE)"
  cat "$TMPDIR/work.xml" 2>/dev/null
  exit 1
fi

# Step 2: Find English expression URI
ENG_EXPR=$(grep -oP 'rdf:resource="[^"]*\.ENG"' "$TMPDIR/work.xml" | head -1 | grep -oP '"[^"]*"' | tr -d '"')

if [ -z "$ENG_EXPR" ]; then
  echo "❌ No English expression found for $CELEX"
  echo "   Available expressions:"
  grep "expression" "$TMPDIR/work.xml" | head -5
  exit 1
fi

echo "   → Found English expression: $(basename "$ENG_EXPR")"

# Step 3: Get expression metadata to find available manifestations
curl -s -o "$TMPDIR/expr.xml" --max-time 15 \
  -H "Accept: application/rdf+xml" \
  -L \
  "$ENG_EXPR"

# Step 4: Find the manifestation URL for the requested format
MANIFEST_URL=$(grep -oP "rdf:resource=\"[^\"]*\\.ENG\\.$FORMAT\"" "$TMPDIR/expr.xml" | head -1 | grep -oP '"[^"]*"' | tr -d '"')

if [ -z "$MANIFEST_URL" ]; then
  echo "⚠️  No $FORMAT manifestation found. Available formats:"
  grep "manifestation" "$TMPDIR/expr.xml" | grep -oP 'ENG\.[^"]*' | sort -u
  
  # Fall back: try the direct CELEX.ENG.format pattern
  MANIFEST_URL="http://publications.europa.eu/resource/celex/${CELEX}.ENG.${FORMAT}"
  echo "   → Trying direct URL: $MANIFEST_URL"
fi

# Step 5: Download the content
echo "   → Downloading content..."
HTTP_CODE=$(curl -s -o "$OUTPUT" -w "%{http_code}" --max-time 60 \
  -H "Accept: $ACCEPT" \
  -L \
  "$MANIFEST_URL")

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Download failed (HTTP $HTTP_CODE)"
  head -5 "$OUTPUT" 2>/dev/null
  exit 1
fi

SIZE=$(wc -c < "$OUTPUT")
echo "✅ Downloaded: $OUTPUT ($SIZE bytes)"
echo ""
echo "   CELEX: $CELEX"
echo "   Format: $FORMAT"
echo "   Size: $SIZE bytes"
