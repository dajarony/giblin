import * as THREE from 'three';
import type { WeatherPreset } from '../../types/game';

export interface WeatherSceneBindings {
  scene: THREE.Scene;
  fog: THREE.FogExp2;
  hemisphereLight: THREE.HemisphereLight;
  sunLight: THREE.DirectionalLight;
  rimLight: THREE.DirectionalLight;
  oceanMaterial: THREE.MeshStandardMaterial;
  stars: THREE.Points;
}

interface WeatherPalette {
  background: number;
  fog: number;
  fogDensity: number;
  skyLight: number;
  groundLight: number;
  sun: number;
  sunIntensity: number;
  rim: number;
  ocean: number;
  starsVisible: boolean;
}

const WEATHER_PALETTES: Record<WeatherPreset, WeatherPalette> = {
  golden_morning: { background: 0x3a2c42, fog: 0x4a3a4f, fogDensity: 0.0026, skyLight: 0xffe6c2, groundLight: 0x3b334a, sun: 0xffcaa2, sunIntensity: 1.35, rim: 0xffaa88, ocean: 0x23425b, starsVisible: false },
  day: { background: 0x2c4a6b, fog: 0x3d5d82, fogDensity: 0.0022, skyLight: 0xfff6e6, groundLight: 0x3a4b63, sun: 0xfff3db, sunIntensity: 1.5, rim: 0xffddaa, ocean: 0x1a4e75, starsVisible: false },
  sunset: { background: 0x351d34, fog: 0x4a243b, fogDensity: 0.0028, skyLight: 0xffaa77, groundLight: 0x2b1c36, sun: 0xff7744, sunIntensity: 1.25, rim: 0xffaa33, ocean: 0x2d2442, starsVisible: true },
  night: { background: 0x131326, fog: 0x181730, fogDensity: 0.0032, skyLight: 0x6b7fa8, groundLight: 0x141221, sun: 0x5671a8, sunIntensity: 0.65, rim: 0x89c4e0, ocean: 0x0e1c2e, starsVisible: true },
  fog: { background: 0x403d52, fog: 0x4a4760, fogDensity: 0.0065, skyLight: 0xd5cfdd, groundLight: 0x2b2838, sun: 0xffebcf, sunIntensity: 0.9, rim: 0xffaa88, ocean: 0x283848, starsVisible: false },
};

export function applyWeatherPreset(bindings: WeatherSceneBindings, preset: WeatherPreset) {
  const palette = WEATHER_PALETTES[preset];
  bindings.scene.background = new THREE.Color(palette.background);
  bindings.fog.color.setHex(palette.fog);
  bindings.fog.density = palette.fogDensity;
  bindings.hemisphereLight.color.setHex(palette.skyLight);
  bindings.hemisphereLight.groundColor.setHex(palette.groundLight);
  bindings.sunLight.color.setHex(palette.sun);
  bindings.sunLight.intensity = palette.sunIntensity;
  bindings.rimLight.color.setHex(palette.rim);
  bindings.oceanMaterial.color.setHex(palette.ocean);
  bindings.stars.visible = palette.starsVisible;
}
