# Session Context

## Current State

- **Focus**: Add model selector to AI chat welcome screen (before loading)
- **Next**: Implement Phase 3 — Welcome Screen Redesign
- **Status**: Phase 1 ✓, Phase 2 ✓
- **Phase**: Backlog enhancement

## Completed

### Phase 1: Cache Detection ✓
- Added `hasModelInCache` import from @mlc-ai/web-llm
- Added `cachedModels` state array tracking cached model IDs
- Added `checkCachedModels()` function to check all available models
- Committed: `c6cc4a4`

### Phase 2: Persistence ✓
- Added localStorage key `eidas-ai-model`
- Added `loadSavedModelPreference()` with validation
- Added `saveModelPreference()` helper
- Added `getDefaultModelId()` export
- Added `selectedModelId` state with persistence
- Added `setSelectedModelId()` wrapper that saves to localStorage
- Committed: `4a6a070`

## Key Files

- `docs-portal/src/components/AIChat/AIChat.jsx` — Main component with `WelcomeScreen`
- `docs-portal/src/components/AIChat/AIChat.css` — Styles for new model selector
- `docs-portal/src/hooks/useWebLLM.js` — ✓ Cache detection + persistence complete

## Remaining Implementation Plan

### Phase 3: Welcome Screen Redesign (~25 min) ← NEXT
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

## Hook API Summary (useWebLLM)

```javascript
// State
selectedModelId    // User's preferred model (persisted to localStorage)
cachedModels       // Array of model IDs that are cached in browser

// Actions  
setSelectedModelId(modelId)  // Change preference (persists to localStorage)
checkCachedModels()          // Refresh cached models list
loadModel(modelId)           // Load and initialize a model
```

## Quick Start

```bash
cd ~/dev/eIDAS20/docs-portal && npm run dev
# Open http://localhost:5173/eIDAS20/
# Click chat icon (bottom right) to see current welcome screen
```
