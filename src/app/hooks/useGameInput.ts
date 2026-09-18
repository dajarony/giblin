import { useCallback, useEffect, useRef, useState } from 'react';
import { soundEngine } from '../../audio/SoundEngine';

export interface GameInputState {
  w: boolean;
  s: boolean;
  a: boolean;
  d: boolean;
}

interface GameInputCallbacks {
  onBell: () => void;
  onToggleCamera: () => void;
  onOpenPhotoMode: () => void;
  onOpenWorkshop: () => void;
}

export function useGameInput(callbacks: GameInputCallbacks) {
  const inputRef = useRef<GameInputState>({ w: false, s: false, a: false, d: false });
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const [isPowerActive, setPowerActive] = useState(false);
  const [isBrakeActive, setBrakeActive] = useState(false);

  const setPower = useCallback((active: boolean) => {
    soundEngine.init();
    inputRef.current.w = active;
    setPowerActive(active);
  }, []);

  const setBrake = useCallback((active: boolean) => {
    soundEngine.init();
    inputRef.current.s = active;
    setBrakeActive(active);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      soundEngine.init();
      const key = event.key.toLowerCase();

      if (key === 'w' || event.key === 'ArrowUp') setPower(true);
      if (key === 's' || event.key === 'ArrowDown') setBrake(true);
      if (key === 'a' || event.key === 'ArrowLeft') inputRef.current.a = true;
      if (key === 'd' || event.key === 'ArrowRight') inputRef.current.d = true;

      if (key === ' ') callbacksRef.current.onBell();
      if (key === 'c') callbacksRef.current.onToggleCamera();
      if (key === 'p') callbacksRef.current.onOpenPhotoMode();
      if (key === 'm') callbacksRef.current.onOpenWorkshop();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'w' || event.key === 'ArrowUp') setPower(false);
      if (key === 's' || event.key === 'ArrowDown') setBrake(false);
      if (key === 'a' || event.key === 'ArrowLeft') inputRef.current.a = false;
      if (key === 'd' || event.key === 'ArrowRight') inputRef.current.d = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setBrake, setPower]);

  return {
    inputRef,
    isPowerActive,
    isBrakeActive,
    setPower,
    setBrake,
  };
}
