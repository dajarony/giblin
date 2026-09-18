# Aethelgard Tramways

A warm low-poly Three.js tram-driving game built with React, TypeScript and Vite.

## What this repository contains

The project started as a generated prototype and is being hardened into a maintainable game codebase. The current refactor keeps gameplay behaviour while separating rendering, simulation, input, UI state and player actions.

## Core gameplay

- Continuous scenic 3D railway through floating islands.
- Power, braking, camera and bell controls.
- Passenger comfort and streak system.
- Dynamic crosswind and slope influence.
- Stations, tips, upgrades, paint schemes and passenger requests.
- Collectible sky-mail parcels, achievements and photo mode.
- Multiple weather presets and ambient audio.

## Tech stack

- React 19
- TypeScript
- Three.js
- Vite
- Tailwind CSS

## Local development

```bash
npm install
npm run dev
```

Quality gate:

```bash
npm run check
```

`npm run check` runs TypeScript validation and a production build.

## Architecture

Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) before changing game behaviour.

Agents and contributors should also read [`AGENTS.md`](AGENTS.md). It contains the non-negotiable coding rules for this repository.
