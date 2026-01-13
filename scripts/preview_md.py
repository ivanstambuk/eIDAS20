#!/usr/bin/env python3
"""Render Markdown to HTML for visual validation."""
import sys
from pathlib import Path

try:
    import markdown
except ImportError:
    print("Installing markdown...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "markdown"], check=True)
    import markdown

def render_md_to_html(md_path: str, html_path: str = None):
    """Render a Markdown file to HTML."""
    md_file = Path(md_path)
    md_content = md_file.read_text(encoding='utf-8')
    
    html_body = markdown.markdown(md_content, extensions=['extra'])
    
    full_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{md_file.stem}</title>
    <style>
        body {{ 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            max-width: 900px; 
            margin: 40px auto; 
            padding: 20px; 
            line-height: 1.6;
            background: #1e1e1e;
            color: #d4d4d4;
        }}
        blockquote {{ 
            border-left: 4px solid #0066cc; 
            padding-left: 16px; 
            margin: 16px 0; 
            background: #2d2d30;
            padding: 12px 16px;
        }}
        h1, h2, h3 {{ color: #569cd6; }}
        ul, ol {{ margin: 8px 0; padding-left: 24px; }}
        li {{ margin: 4px 0; }}
        code {{ background: #2d2d30; padding: 2px 6px; border-radius: 3px; }}
        pre {{ background: #2d2d30; padding: 16px; overflow-x: auto; }}
    </style>
</head>
<body>
{html_body}
</body>
</html>"""
    
    if html_path is None:
        html_path = md_file.with_suffix('.html')
    else:
        html_path = Path(html_path)
    
    html_path.write_text(full_html, encoding='utf-8')
    print(f"Generated: {html_path}")
    return html_path

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python preview_md.py <markdown_file> [output_html]")
        sys.exit(1)
    
    md_file = sys.argv[1]
    html_file = sys.argv[2] if len(sys.argv) > 2 else None
    render_md_to_html(md_file, html_file)
