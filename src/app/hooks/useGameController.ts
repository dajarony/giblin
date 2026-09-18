import { useCallback, useRef, useState } from 'react';
import { soundEngine } from '../../audio/SoundEngine';
import { createInitialGameState } from '../../game/state/createInitialGameState';
import type { GameState } from '../../types/game';
import { useAchievements } from './useAchievements';
import { useGameActions } from './useGameActions';
import { useGameInput } from './useGameInput';
import { useGameLoop } from './useGameLoop';
import { useModals } from './useModals';
import { useToast } from './useToast';
import { useWorld } from './useWorld';

export function useGameController() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [earnedTipsForArrival, setEarnedTipsForArrival] = useState(0);

  const { toast, showToast } = useToast();
  const { modals, openModal, closeModal, setModal } = useModals();
  const { achievements, unlockAchievement } = useAchievements(showToast);
  const worldRef = useWorld(containerRef, gameState.weather);

  const onStationArrival = useCallback((earnedTips: number) => {
    setEarnedTipsForArrival(earnedTips);
    openModal('station');
  }, [openModal]);

  const actions = useGameActions({
    gameState,
    setGameState,
    worldRef,
    showToast,
    unlockAchievement,
    openModal,
    closeModal,
    setModal,
    setScreenshotData,
  });

  const input = useGameInput({
    onBell: actions.ringBell,
    onToggleCamera: actions.toggleCamera,
    onOpenPhotoMode: actions.openPhotoMode,
    onOpenWorkshop: actions.openWorkshop,
  });

  useGameLoop({
    gameState,
    setGameState,
    worldRef,
    inputRef: input.inputRef,
    showToast,
    unlockAchievement,
    onStationArrival,
  });

  const ringWhistle = useCallback(() => {
    soundEngine.playWhistle(gameState.audioEnabled);
    worldRef.current?.tram.triggerWhistleSteam();
    showToast('Toot-toot! Steam whistle echoing through clouds.', 'Steam Whistle', '💨', 2200);
  }, [gameState.audioEnabled, showToast, worldRef]);

  const savePostcard = useCallback(() => {
    unlockAchievement('master_photographer');
    showToast('Postcard saved to your collection! 📸', 'Travel Journal', '✨', 3500);
  }, [showToast, unlockAchievement]);

  return {
    containerRef,
    gameState,
    achievements,
    modals,
    toast,
    screenshotData,
    earnedTipsForArrival,
    input,
    actions,
    ringWhistle,
    savePostcard,
    openModal,
    closeModal,
  };
}
