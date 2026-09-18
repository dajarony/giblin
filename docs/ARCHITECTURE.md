# Architecture

## Goal

Keep the game easy to extend without turning the prototype into a monolithic React/Three.js script.

The design uses a small set of explicit layers:

```text
React UI
  │
  ▼
Game Controller / focused hooks
  ├── player actions
  ├── input lifecycle
  ├── frame loop
  ├── modal + toast state
  └── achievements
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

Three.js scene objects mirror that state. They must not silently become a competing state store.

Examples:

- Speed belongs in `GameState`; wheel rotation belongs in `TramModel`.
- Selected weather belongs in `GameState`; light/fog colours belong in the world layer.
- Parcel count belongs in `GameState`; parcel meshes and visibility belong in `SkyParcelSystem`.

## Main loop

`useGameLoop` owns the animation-frame lifecycle and coordinates one frame:

1. Read current game/input state.
2. Calculate motion through pure runtime functions.
3. Update tram/world presentation.
4. Calculate comfort and station events.
5. Trigger explicit side effects (sound/toasts/achievements).
6. Commit one coherent next `GameState`.

The animation loop is registered once. It does not get recreated every time speed or comfort changes.

## Input

`useGameInput` owns keyboard state and keyboard listeners. HUD buttons call the same power/brake primitives, so mouse/touch and keyboard cannot drift into separate control implementations.

## World facade

`WorldRenderer` remains the API used by game orchestration, but specialised responsibilities are delegated:

- `CameraController` — camera modes and pointer orbit controls.
- `applyWeatherPreset` — data-driven lighting/fog/ocean palettes.
- `SkyParcelSystem` — parcel mesh lifecycle, pickup detection and animation.

New world systems should follow the same pattern rather than adding more unrelated behaviour to `WorldRenderer`.

## Cleanup discipline

The world exposes `dispose()` and camera/input hooks remove their own listeners. React effects must always return cleanup functions for any external resource they create.

## Next refactor targets

The remaining large visual files are intentionally isolated and can be split safely later without touching gameplay state:

- `WorldRenderer`: extract scenery construction into station/island builders.
- `TramModel`: extract body construction, paint application and upgrade visuals if it grows further.
- `SoundEngine`: separate music sequencing from SFX synthesis if new audio systems are added.
