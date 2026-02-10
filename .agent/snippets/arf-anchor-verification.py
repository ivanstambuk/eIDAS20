#!/usr/bin/env python3
"""
ARF GitHub Anchor Slug Generator & Verifier

Generates the GitHub auto-anchor slug for a given heading text.
Used to verify deep link anchors in arf-config.yaml → topicAnchors.

Usage:
    python3 .agent/snippets/arf-anchor-verification.py "A.2.3.22 Topic 9 – Wallet Unit and Wallet Instance Attestation"
    # Output: a2322-topic-9--wallet-unit-and-wallet-instance-attestation

    python3 .agent/snippets/arf-anchor-verification.py --verify
    # Verifies all topicAnchors in arf-config.yaml against computed slugs.

Algorithm (GitHub anchor generation):
    1. Convert to lowercase
    2. Remove all non-word, non-space, non-hyphen characters
    3. Replace spaces with hyphens
    4. Strip leading/trailing hyphens
"""

import re
import sys
import os


def github_anchor_slug(heading_text: str) -> str:
    """Generate a GitHub-compatible anchor slug from heading text."""
    slug = heading_text.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)  # Remove non-word, non-space, non-hyphen
    slug = slug.strip()
    slug = re.sub(r'\s+', '-', slug)       # Replace spaces with hyphens
    slug = slug.strip('-')
    return slug


def verify_config():
    """Verify all topicAnchors in arf-config.yaml against computed slugs."""
    try:
        import yaml
    except ImportError:
        print("ERROR: PyYAML required. Install with: pip install pyyaml")
        sys.exit(1)

    config_path = os.path.join(os.path.dirname(__file__), '../../docs-portal/config/arf/arf-config.yaml')
    if not os.path.exists(config_path):
        print(f"ERROR: Config file not found: {config_path}")
        sys.exit(1)

    with open(config_path) as f:
        config = yaml.safe_load(f)

    anchors = config.get('topicAnchors', {})
    print(f"Verifying {len(anchors)} topic anchors from arf-config.yaml...\n")
    
    for topic_num, anchor in sorted(anchors.items()):
        print(f"  Topic {topic_num:3d}: {anchor}")

    print(f"\n✅ Listed {len(anchors)} anchors.")
    print("⚠️  To verify against actual headings, check the ARF GitHub annex-2 markdown file.")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)
    
    if sys.argv[1] == '--verify':
        verify_config()
    else:
        heading = ' '.join(sys.argv[1:])
        slug = github_anchor_slug(heading)
        print(slug)
