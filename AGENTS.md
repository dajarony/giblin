# Agent / Contributor Contract

This file is the first-stop context for any agent or developer working in this repository.

## Non-negotiable engineering rules

1. **Single responsibility**: one module owns one reason to change.
2. **No spaghetti code**: do not put input, physics, rendering, audio and UI mutation in the same function.
3. **Thin React components**: components render and delegate. Game orchestration belongs in hooks/controllers.
4. **Pure simulation first**: calculations that do not need Three.js or React belong in `src/game/runtime` and should be deterministic where possible.
5. **Rendering is not game state**: Three.js objects are views of the game state, not the source of truth.
6. **Side effects are explicit**: audio, achievements, toasts and modal changes happen at orchestration boundaries.
7. **No hidden global state** beyond intentionally singleton infrastructure such as the existing sound engine.
8. **Cleanup every listener/resource**: pointer/keyboard listeners, animation frames and WebGL resources must be disposed.
9. **Prefer named domain functions** over inline magic calculations.
10. **Do not rewrite working systems casually**. Preserve behaviour unless the task explicitly changes design/gameplay.

## Folder responsibilities

- `src/app/` — composition and React orchestration.
- `src/app/hooks/` — focused controllers for input, loop, actions, modal/toast state and world lifecycle.
- `src/game/runtime/` — pure gameplay calculations and frame simulation helpers.
- `src/game/state/` — initial/default game state.
- `src/game/world/` — focused Three.js world subsystems such as camera, weather and collectibles.
- `src/game/WorldRenderer.ts` — top-level Three.js facade; delegate specialised work instead of growing this file.
- `src/game/TramModel.ts` — tram visual model and tram-specific animation/customisation.
- `src/audio/` — sound/music infrastructure.
- `src/components/` — presentation only.
- `src/types/` — shared domain types.

## Before committing

Run:

```bash
npm run check
```

A change is not finished if it introduces TypeScript errors, a broken production build, leaked event listeners, duplicated game-state ownership or new cross-layer coupling.
