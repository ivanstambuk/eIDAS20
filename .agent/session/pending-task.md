# Session Context

## Current State

- **Focus**: Add model selector to AI chat welcome screen (before loading)
- **Next**: Implement Phase 2 — persistence to localStorage
- **Status**: Phase 1 complete ✓
- **Phase**: Backlog enhancement

## Completed

### Phase 1: Cache Detection ✓
- Added `hasModelInCache` import from @mlc-ai/web-llm
- Added `cachedModels` state array tracking cached model IDs
- Added `checkCachedModels()` function to check all available models
- Cache checked on mount after WebGPU validation
- Cache list refreshed after successful model load
- Exposed `cachedModels` and `checkCachedModels` in hook return
- Committed: `c6cc4a4`

## Key Files

- `docs-portal/src/components/AIChat/AIChat.jsx` — Main component with `WelcomeScreen`
- `docs-portal/src/components/AIChat/AIChat.css` — Styles for new model selector
- `docs-portal/src/hooks/useWebLLM.js` — ✓ Cache detection added

## Remaining Implementation Plan

### Phase 2: Persistence (~5 min)
1. Save selected model to `localStorage` key `eidas-ai-model`
2. Load preference on mount, default to recommended if none saved

### Phase 3: Welcome Screen Redesign (~25 min)
1. Replace single button with model selection list
2. Model cards show: name, size, RECOMMENDED badge, CACHED indicator
3. Selected model highlighted with cyan border
4. Dynamic "Load [Model Name] (~Size)" button
5. Compact the 3 feature bullets to fit
6. Helper text: "Cached models load instantly"

### Phase 4: Polish (~5 min)
1. Selection animation
2. Scrollable if >4 models visible

## Design Reference

Mockup saved: `~/.gemini/antigravity/brain/3ee771b8-550d-4560-8c1b-20094a195640/model_selector_mockup_1768761460074.png`

## Context Notes

- 6 models available in `AVAILABLE_MODELS` array (useWebLLM.js lines 16-54)
- `ModelSelector` component already exists (lines 61-123) but only shown AFTER model loads
- WebLLM uses IndexedDB for caching — hasModelInCache API confirmed working
- User confirmed: explicit "Load" button required (no auto-start on selection)

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Open http://localhost:5173/eIDAS20/
# Click chat icon (bottom right) to see current welcome screen
```
