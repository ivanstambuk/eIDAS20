# Build & Script Reference

> Extracted from AGENTS.md — reference for build commands, scripting patterns, and utility lookups.

---

## Terminology Display Casing Convention

The build pipeline **preserves original source casing by default**. Terms extracted from legal definitions appear lowercase (e.g., "biometric data", "risk", "authentication") because that's how they appear in the regulation text.

**Overrides** are managed in `scripts/canonical-casing.yaml`, which maps `term-id: "Display Name"` for terms that need different casing:

| Category | Count | Casing | Examples |
|----------|-------|--------|----------|
| **Proper concepts** | ~158 | Title Case | Wallet Unit Attestation, Relying Party, Trusted List |
| **Generic terms** | ~174 | lowercase (default) | biometric data, risk, authentication, group |
| **Acronyms** | ~12 | Preserve as-is | AdES, CAdES, PAdES, XAdES |
| **Legal phrases** | ~15 | lowercase | without prejudice to, mutatis mutandis |
| **Acronym-prefixed** | ~15 | Mixed | ICT risk, ICT-related incident |

**When adding new terms:**
- If it's a named eIDAS concept/role → Add to `canonical-casing.yaml` with Title Case
- If it's a generic legal term → No action needed (default preserves lowercase)
- If it contains an acronym → Add to `canonical-casing.yaml` to preserve the acronym

**Anti-patterns:**
- ❌ Re-introducing a `toTitleCase()` function (was removed deliberately)
- ❌ Adding generic terms like "data", "risk", "consent" with Title Case

---

## Build Workflow (After Content/Terminology Changes for AI Chat)

**The AI Chat RAG system uses pre-computed embeddings.** After modifying:
- Terminology (`terminology.json`)
- Regulation content (markdown files)
- Implementing act content

Run:

```bash
npm run build:embeddings
```

**What it does:**
1. Computes vector embeddings for all regulation articles and terminology
2. Stores them in `public/data/embeddings.json` (~8MB)
3. Uses hash-based invalidation (skips if sources unchanged)

| Command | What It Does |
|---------|--------------|
| `npm run build:embeddings` | Generates embeddings → `embeddings.json` |
| `npm run build` | Full build (includes embeddings automatically) |

**When embeddings are stale:**
- AI Chat returns irrelevant or no context for user queries
- Terms you added won't appear in RAG retrieval
- Console shows no warning (embeddings are loaded successfully, just outdated)

**Debugging tip:** If AI Chat gives wrong answers about recent content, check:
1. Is `embeddings.json` older than `terminology.json`? → Run `build:embeddings`
2. Is the terminology correctly extracted? → Run `build:all-content` first

---

## Dataset Fingerprint Lookup (Agent Quick Reference)

**When the user asks "what git commit is fingerprint X?" or similar:**

```bash
grep <fingerprint> docs-portal/.fingerprint-manifest
```

**Example:** User says "I have an Excel with fingerprint 6fc215e8, what commit is that?"

```bash
grep 6fc215e8 docs-portal/.fingerprint-manifest
# Output: 6fc215e8    ababff54    2026-02-19    rca
# → Git commit: ababff54, built on 2026-02-19, from the RCA pipeline
```

**How it works:**
- Both `build-rca.js` and `build-vcq.js` append to `docs-portal/.fingerprint-manifest` after each build
- Format: `<contentHash>\t<gitCommit>\t<buildDate>\t<source>`
- The `contentHash` (8-char SHA-256 prefix) is the "Dataset fingerprint" shown in the UI and exports
- It only changes when the actual data content changes (not on code-only commits)
- The manifest is version-controlled, so it accumulates a full audit trail over time

**If fingerprint is not found:** It may predate the manifest (introduced 2026-02-19). Check `git log` for builds around the `buildDate` shown in the export.

---

## Node.js Script Execution (ESM Project — Use .cjs Files)

The `docs-portal/` has `"type": "module"` in `package.json`, which means all `.js` files are treated as ES Modules. This has two consequences:

**1. Inline `node -e` with multiline code WILL FAIL:**

Multiline JavaScript passed via `node -e "..."` gets mangled by bash — quotes, parentheses, and special characters are interpreted as shell syntax. Symptoms: `bash: syntax error near unexpected token '('` and zombie processes.

**2. Ad-hoc `.js` scripts using `require()` WILL FAIL:**

`require()` is CommonJS and is not available in ESM mode.

**Correct patterns:**

| Need | Approach |
|------|----------|
| **Quick one-liner** | `node -p "require('fs').readFileSync('file.json','utf-8').length"` — BUT keep it genuinely one-line |
| **Multi-line analysis** | Write a `.cjs` file (e.g., `scripts/my-analysis.cjs`) with `require()` syntax, run `node scripts/my-analysis.cjs` |
| **Permanent script** | Write a proper `.js` file with `import` syntax (ESM) |

**Anti-patterns:**
- ❌ `node -e "const fs = require('fs');\nconst data = ..."` — multiline, will break
- ❌ Creating `scripts/analysis.js` with `require()` — will fail because ESM
- ❌ Retrying the same failing `node -e` multiple times

**Correct pattern:**
- ✅ Write `scripts/analysis.cjs` → run `node scripts/analysis.cjs` → delete when done

**⚠️ Large JSON files (>1MB) will hang interactive terminals:**
- ❌ `node -e "const d = require('./public/data/arf-hlr-data.json')"` — 4.7MB file, blocks forever
- ❌ `python3 -c "import json; json.load(open('large.json'))"` — same issue on large files
- ✅ Use dedicated lookup scripts: `node scripts/lookup-hlr.cjs <topic>` for ARF HLR queries
- ✅ Use `grep` or `jq` for quick JSON searches on large files

**⚠️ Filenames with parentheses require quoting:**
- ❌ `grep pattern ~/path/ts10-data-portability-and-download-(export).md` — shell interprets `(` as subshell
- ✅ `grep pattern "$HOME/path/ts10-data-portability-and-download-(export).md"` — double-quote the path
- Affected files: `04_technical_specs/docs/technical-specifications/ts10-data-portability-and-download-(export).md`
