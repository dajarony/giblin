# Aethelgard Tramways

A warm low-poly Three.js tram-driving game built with React, TypeScript and Vite.

## Gameplay

- Continuous scenic 3D railway through floating islands.
- Power, braking, camera and bell controls.
- Passenger comfort and streak system.
- Dynamic crosswind and slope influence.
- Stations, tips, upgrades, paint schemes and passenger requests.
- Collectible sky-mail parcels, achievements and photo mode.
- Multiple weather presets and ambient audio.

## Engineering principles

This repository follows a strict single-responsibility approach. React UI, gameplay simulation, input, Three.js rendering and audio are separated so features can evolve without turning the game into one monolithic file.

Read [`AGENTS.md`](AGENTS.md) before making changes and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the system map.

## Development

```bash
npm install
npm run dev
```

Quality gate:

```bash
npm run check
```

`npm run check` runs strict TypeScript validation and a production build.
