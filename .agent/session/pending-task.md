# Session Context

## Current State

- **Focus**: Add model selector to AI chat welcome screen (before loading)
- **Next**: Implement Phase 4 — Polish (selection animation, scrollable list)
- **Status**: Phase 1 ✓, Phase 2 ✓, Phase 3 ✓
- **Phase**: Backlog enhancement

## Completed

### Phase 1: Cache Detection ✓
- Added `hasModelInCache` import from @mlc-ai/web-llm
- Added `cachedModels` state array tracking cached model IDs
- Committed: `c6cc4a4`

### Phase 2: Persistence ✓
- Added localStorage key `eidas-ai-model`
- Added `selectedModelId` state with persistence
- Committed: `4a6a070`

### Phase 3: Welcome Screen Redesign ✓
- Model list with selectable cards
- RECOMMENDED badge (green) for default model
- CACHED indicator (green checkmark) for locally cached models
- Download icon for non-cached models
- Cyan border highlight for selected model
- Dynamic "Load [Model Name] (~Size)" button
- Context-aware helper text
- Committed: `48febe3`

## Key Files

- `docs-portal/src/components/AIChat/AIChat.jsx` — ✓ WelcomeScreen redesigned
- `docs-portal/src/components/AIChat/AIChat.css` — ✓ Model card styles added
- `docs-portal/src/hooks/useWebLLM.js` — ✓ Cache detection + persistence complete

## Remaining Implementation Plan

### Phase 4: Polish (~5 min) ← NEXT
1. Selection animation (opacity/scale transition when selecting)
2. Scrollable list if >4 models visible (already has max-height: 280px)
3. Optional: Hover effects on model cards

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
# Click chat icon (bottom right) to see new model selector
```
