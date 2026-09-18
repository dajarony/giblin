# Architecture

## Goal

Keep the game easy to extend without turning the prototype into a monolithic React/Three.js script.

```text
React UI
  │
  ▼
useGameController
  ├── useGameInput
  ├── useGameActions
  ├── useGameLoop
  ├── useModals / useToast / useAchievements
  └── useWorld
  │
  ├──────────────► SoundEngine
  │
  ▼
Pure runtime simulation
  │
  ▼
GameState (source of truth)
  │
  ▼
WorldRenderer facade
  ├── CameraController
  ├── Weather preset application
  ├── SkyParcelSystem
  └── TramModel / scenery
```

## State ownership

`GameState` is the gameplay source of truth. React owns it through `useGameController`.
Three.js scene objects mirror state; they do not own gameplay state.

Examples:

- Speed belongs in `GameState`; wheel rotation belongs in `TramModel`.
- Weather selection belongs in `GameState`; fog/light colours belong in the world layer.
- Parcel count belongs in `GameState`; parcel meshes belong in `SkyParcelSystem`.

## Main loop

`useGameLoop` owns the animation-frame lifecycle. It reads the latest state through a ref, computes one coherent frame and commits one next state. The loop is not recreated on every speed or comfort change.

Frame responsibilities:

1. Read input and game state.
2. Calculate motion using pure functions.
3. Update world/tram presentation.
4. Calculate comfort and station events.
5. Trigger explicit side effects.
6. Commit one coherent `GameState`.

## Input

`useGameInput` owns keyboard listeners and button state. HUD buttons call the same power/brake primitives used by keyboard input.

## World facade

`WorldRenderer` is the facade used by orchestration. Specialised responsibilities are delegated:

- `CameraController` — camera modes and pointer orbit lifecycle.
- `applyWeatherPreset` — data-driven lighting/fog/ocean palettes.
- `SkyParcelSystem` — parcel mesh lifecycle, pickup detection and animation.

## Cleanup discipline

`WorldRenderer.dispose()` removes camera listeners, disposes Three.js resources and releases the WebGL renderer. Every React effect that creates an external resource returns a cleanup function.

## Safe next refactors

The remaining large visual construction files are isolated and can be split later without touching gameplay state:

- Extract station/island/scenery builders from `WorldRenderer`.
- Extract body construction, paint and upgrade visuals from `TramModel` only if they grow further.
- Separate music sequencing from SFX synthesis in `SoundEngine` when audio content expands.
