import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { WorldRenderer } from '../../game/WorldRenderer';
import type { WeatherPreset } from '../../types/game';

export function useWorld(containerRef: RefObject<HTMLDivElement | null>, initialWeather: WeatherPreset) {
  const worldRef = useRef<WorldRenderer | null>(null);
  const initialWeatherRef = useRef(initialWeather);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const world = new WorldRenderer(container);
    worldRef.current = world;
    world.applyWeatherPreset(initialWeatherRef.current);

    const handleResize = () => world.handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      world.dispose();
      worldRef.current = null;
    };
  }, [containerRef]);

  return worldRef;
}
