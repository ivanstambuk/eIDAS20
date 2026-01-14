# eIDAS 2.0 Knowledge Base - Work Tracker

> **Live document.** Update after each session.

---

## Current Status

| Field | Value |
|-------|-------|
| **Last Updated** | 2026-01-14 18:25 CET |
| **Session State** | 🟡 Handover |
| **Portal Status** | ✅ All 6 phases complete + Phase 7 enhancements |
| **Next Action** | Continue UX polish or deploy to GitHub Pages |

---

## Portal Features (Complete)

- **32 documents** (2 regulations + 30 implementing acts)
- **Full-text + semantic search** (Orama + Transformers.js embeddings)
- **Terminology system** (96 terms, hover popovers, cross-refs)
- **AI Chat** (WebLLM, RAG-powered, Gemma 2B recommended)
- **Export** (PDF, Markdown, JSON)
- **Themes** (light/dark, system detection)
- **Accessibility** (WCAG 2.1 AA)
- **CI/CD** (GitHub Actions auto-deploy)
- **Collapsible TOC** (official chapter structure for eIDAS 910/2014)

---

## Backlog (Future Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| Definition anchors | Deep links to specific definitions within articles (`#def-trust-service`) | Medium |
| Terminology highlighting | Auto-highlight defined terms in content with hover popovers | Medium |
| GitHub Pages deploy | Push to master to trigger workflow | High |
| eIDAS 2.0 (2024/1183) chapters | Add chapter structure for the amending regulation | Low |

---

## Recent Sessions

| Date | Summary |
|------|---------|
| 2026-01-14 18:25 | Collapsible TOC: Official chapters, short Roman numerals (I., II.), text wrap |
| 2026-01-14 17:50 | CSS scroll fix: Removed scroll-behavior:smooth conflicting with 150ms JS animation |
| 2026-01-14 17:35 | AST-based Markdown Pipeline: unified/remark/rehype, TOC deep-linking works |
| 2026-01-14 17:25 | UI Refinement: Strip front matter, agent-done.sh, tab cleanup rule |
| 2026-01-14 11:24 | Phase 6 Complete: Browser testing verified all features |

---

*Full history available in git. See `git log --oneline` for commits.*

