import { useCallback } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { soundEngine } from '../../audio/SoundEngine';
import { PASSENGER_STORIES, STATIONS } from '../../game/constants';
import { circularTrackDistance } from '../../game/runtime/route';
import { WorldRenderer } from '../../game/WorldRenderer';
import type { CameraMode, GameState, WeatherPreset } from '../../types/game';
import type { ModalName } from './useModals';
import type { ShowToast } from './useAchievements';

const CAMERA_MODES: CameraMode[] = ['chase', 'cab', 'passenger', 'scenic', 'birds_eye'];

interface UseGameActionsOptions {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  worldRef: MutableRefObject<WorldRenderer | null>;
  showToast: ShowToast;
  unlockAchievement: (achievementId: string) => void;
  openModal: (name: ModalName) => void;
  closeModal: (name: ModalName) => void;
  setModal: (name: ModalName, open: boolean) => void;
  setScreenshotData: Dispatch<SetStateAction<string | null>>;
}

export function useGameActions(options: UseGameActionsOptions) {
  const {
    gameState,
    setGameState,
    worldRef,
    showToast,
    unlockAchievement,
    openModal,
    closeModal,
    setModal,
    setScreenshotData,
  } = options;

  const ringBell = useCallback(() => {
    soundEngine.playBell(gameState.audioEnabled);

    if (gameState.installedUpgrades.whistle) {
      worldRef.current?.tram.triggerWhistleSteam();
    }

    showToast('Ding-ding! Bell chiming across the valley.', 'Tram Bell', '🔔', 2000);

    setGameState((current) => {
      const request = current.activePassengerStory?.activeRequest;
      if (!request?.requireBellAtStation || request.completed) return current;

      const currentStation = STATIONS[current.currentStationIndex];
      const nearRequestedStation =
        currentStation.name === request.requireBellAtStation &&
        circularTrackDistance(current.trackPos, currentStation.u) < 0.06;

      if (!nearRequestedStation) return current;

      const reward = request.reward;
      soundEngine.playCoinSound(current.audioEnabled);
      showToast(
        `Maia & Pip: 'Pigeon delivered safely! Here is your reward (+${reward} 🪙)'!`,
        'Maia & Pip',
        '🕊️',
        4000,
      );

      return {
        ...current,
        gold: current.gold + reward,
        activePassengerStory: current.activePassengerStory
          ? {
              ...current.activePassengerStory,
              activeRequest: { ...request, completed: true },
            }
          : null,
      };
    });
  }, [gameState.audioEnabled, gameState.installedUpgrades.whistle, setGameState, showToast, worldRef]);

  const toggleCamera = useCallback(() => {
    setGameState((current) => {
      const currentIndex = CAMERA_MODES.indexOf(current.cameraMode);
      const nextMode = CAMERA_MODES[(currentIndex + 1) % CAMERA_MODES.length];
      showToast(`Camera: ${nextMode.replace('_', ' ').toUpperCase()}`, 'View Angle', '🎥', 2000);
      return { ...current, cameraMode: nextMode };
    });
  }, [setGameState, showToast]);

  const toggleAudio = useCallback(() => {
    soundEngine.init();
    setGameState((current) => {
      const enabled = !current.audioEnabled;
      showToast(
        enabled ? 'Sound Effects ON' : 'Sound Effects Muted',
        'Audio',
        enabled ? '🔔' : '🔕',
        2000,
      );
      return { ...current, audioEnabled: enabled };
    });
  }, [setGameState, showToast]);

  const toggleMusic = useCallback(() => {
    soundEngine.init();
    setGameState((current) => {
      const enabled = !current.musicEnabled;
      if (enabled) {
        soundEngine.startLoFiMusic(true);
        showToast('Cozy Lo-Fi Synth Melodies Playing', 'Skywave Radio', '📻', 2800);
      } else {
        soundEngine.stopLoFiMusic();
        showToast('Lo-Fi Music Paused', 'Skywave Radio', '📻', 2000);
      }
      return { ...current, musicEnabled: enabled };
    });
  }, [setGameState, showToast]);

  const openWorkshop = useCallback(() => {
    setModal('station', false);
    openModal('workshop');
    setGameState((current) => ({ ...current, isWorkshopMode: true }));
  }, [openModal, setGameState, setModal]);

  const closeWorkshop = useCallback(() => {
    closeModal('workshop');
    setGameState((current) => ({ ...current, isWorkshopMode: false }));
    showToast("Departed Oliver's Cloudworks! Smooth travels.", 'Oliver', '🛠️', 3000);
  }, [closeModal, setGameState, showToast]);

  const openPhotoMode = useCallback(() => {
    const world = worldRef.current;
    if (!world) return;
    setScreenshotData(world.captureSnapshot());
    openModal('photo');
  }, [openModal, setScreenshotData, worldRef]);

  const buyUpgrade = useCallback((upgradeId: string, cost: number) => {
    setGameState((current) => {
      if (current.installedUpgrades[upgradeId] || current.gold < cost) return current;

      const installedUpgrades = { ...current.installedUpgrades, [upgradeId]: true };
      worldRef.current?.tram.applyUpgrades(installedUpgrades);
      soundEngine.playUpgradeDing(current.audioEnabled);

      if (Object.values(installedUpgrades).filter(Boolean).length >= 3) {
        unlockAchievement('olivers_patron');
      }

      return {
        ...current,
        gold: current.gold - cost,
        installedUpgrades,
        maxPassengers: upgradeId === 'luggage' ? 22 : current.maxPassengers,
      };
    });
  }, [setGameState, unlockAchievement, worldRef]);

  const selectPaint = useCallback((paintId: string, cost: number) => {
    setGameState((current) => {
      const alreadyUnlocked = Boolean(current.unlockedPaints[paintId]);
      if (!alreadyUnlocked && current.gold < cost) return current;

      soundEngine.playUpgradeDing(current.audioEnabled);
      worldRef.current?.tram.applyPaintScheme(paintId);

      return {
        ...current,
        gold: alreadyUnlocked ? current.gold : current.gold - cost,
        selectedPaint: paintId,
        unlockedPaints: { ...current.unlockedPaints, [paintId]: true },
      };
    });
  }, [setGameState, worldRef]);

  const selectWeather = useCallback((weather: WeatherPreset) => {
    setGameState((current) => ({ ...current, weather }));
    worldRef.current?.applyWeatherPreset(weather);
    showToast(`Atmosphere set to: ${weather.replace('_', ' ').toUpperCase()}`, 'Sky Forecast', '🌤️', 2500);
  }, [setGameState, showToast, worldRef]);

  const selectPassengerStory = useCallback((storyId: string) => {
    const story = PASSENGER_STORIES.find((candidate) => candidate.id === storyId);
    if (!story) return;

    const storyCopy = {
      ...story,
      activeRequest: story.activeRequest ? { ...story.activeRequest } : undefined,
    };
    setGameState((current) => ({ ...current, activePassengerStory: storyCopy }));
    showToast(`Active request: ${story.activeRequest?.text ?? story.quote}`, story.name, story.avatar, 4000);
    closeModal('passengerLog');
  }, [closeModal, setGameState, showToast]);

  const departStation = useCallback(() => {
    closeModal('station');
    setGameState((current) => {
      const nextIndex = (current.currentStationIndex + 1) % STATIONS.length;
      const nextStation = STATIONS[nextIndex];

      showToast(`🚪 Doors locked. Next stop: ${nextStation.name}!`, 'Conductor', '🌿', 3500);
      soundEngine.playBell(current.audioEnabled);

      if (nextIndex === 0) {
        worldRef.current?.respawnParcels();
      }

      const restedComfort = Math.min(100, current.comfort + 10);

      return {
        ...current,
        inStation: false,
        currentStationIndex: nextIndex,
        comfort: restedComfort,
        tripMinimumComfort: restedComfort,
        tripPeakSpeed: 0,
        smoothDrivingSeconds: 0,
        throttle: 0,
        stationWaitTimer: 0,
      };
    });
  }, [closeModal, setGameState, showToast, unlockAchievement, worldRef]);

  return {
    ringBell,
    toggleCamera,
    toggleAudio,
    toggleMusic,
    openWorkshop,
    closeWorkshop,
    openPhotoMode,
    buyUpgrade,
    selectPaint,
    selectWeather,
    selectPassengerStory,
    departStation,
  };
}
