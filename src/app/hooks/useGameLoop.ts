import { useEffect, useRef } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { soundEngine } from '../../audio/SoundEngine';
import { STATIONS } from '../../game/constants';
import {
  adjustCrosswindForAltitude,
  calculateArrivalTips,
  calculateComfortFrame,
  calculateMotionFrame,
  isStationArrival,
  randomPassengerCount,
} from '../../game/runtime/simulation';
import { WorldRenderer } from '../../game/WorldRenderer';
import type { GameState } from '../../types/game';
import type { GameInputState } from './useGameInput';
import type { ShowToast } from './useAchievements';

interface UseGameLoopOptions {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  worldRef: MutableRefObject<WorldRenderer | null>;
  inputRef: MutableRefObject<GameInputState>;
  showToast: ShowToast;
  unlockAchievement: (achievementId: string) => void;
  onStationArrival: (earnedTips: number) => void;
}

export function useGameLoop(options: UseGameLoopOptions) {
  const {
    gameState,
    setGameState,
    worldRef,
    inputRef,
    showToast,
    unlockAchievement,
    onStationArrival,
  } = options;

  const stateRef = useRef(gameState);
  const crosswindPhaseRef = useRef(0);
  const callbacksRef = useRef({ showToast, unlockAchievement, onStationArrival });

  stateRef.current = gameState;
  callbacksRef.current = { showToast, unlockAchievement, onStationArrival };

  useEffect(() => {
    let animationFrameId = 0;
    let previousTime = performance.now();

    const frame = (time: number) => {
      animationFrameId = requestAnimationFrame(frame);
      const world = worldRef.current;
      if (!world) return;

      const dt = Math.min((time - previousTime) / 1000, 0.1);
      previousTime = time;
      const state = stateRef.current;

      const slopeIncline = world.trackCurve.getTangentAt(state.trackPos).y;
      const motion = calculateMotionFrame({
        state,
        dt,
        slopeIncline,
        isPowerPressed: inputRef.current.w,
        isBrakePressed: inputRef.current.s,
        crosswindPhase: crosswindPhaseRef.current,
      });
      crosswindPhaseRef.current = motion.crosswindPhase;

      const tramPosition = world.trackCurve.getPointAt(motion.trackPos);
      const tramTangent = world.trackCurve.getTangentAt(motion.trackPos).normalize();
      const windForce = adjustCrosswindForAltitude(motion.crosswindForce, tramPosition.y);

      world.tram.group.position.copy(tramPosition);
      world.tram.group.lookAt(tramPosition.clone().add(tramTangent));
      world.tram.update(dt, motion.speedKmh, motion.acceleration, motion.lateralForce);
      world.updateCamera(
        state.cameraMode,
        state.isWorkshopMode,
        tramPosition,
        tramTangent,
        world.tram.group.quaternion,
        time,
      );
      world.update(dt, time);
      soundEngine.update(motion.speedKmh, tramPosition.y * 5, windForce, state.audioEnabled);

      const comfort = calculateComfortFrame(
        state,
        dt,
        motion.acceleration,
        motion.lateralForce,
        windForce,
      );

      if (comfort.streakJustBroken) {
        callbacksRef.current.showToast(
          'Streak broken! Ease the throttle to rebuild passenger trust.',
          'Conductor Tip',
          '⚠️',
          3000,
        );
      }

      let bonusGold = 0;
      if (state.installedUpgrades.teacart && comfort.comfort > 85 && motion.speedKmh > 10) {
        if (Math.random() < 0.005) bonusGold += 2;
      }

      let parcelsCollected = state.parcelsCollected;
      const parcelValue = world.checkParcelPickups(motion.trackPos);
      if (parcelValue > 0) {
        bonusGold += parcelValue;
        parcelsCollected += 1;
        soundEngine.playCoinSound(state.audioEnabled);
        callbacksRef.current.showToast(
          `📦 Sky Mail Parcel Collected! (+${parcelValue} 🪙)`,
          'Sky Courier',
          '✨',
          3000,
        );
        if (parcelsCollected >= 5) callbacksRef.current.unlockAchievement('sky_courier');
      }

      let nextSpeed = state.inStation ? Math.max(0, motion.speedKmh - 12 * dt) : motion.speedKmh;
      let nextTrackPosition = state.inStation ? state.trackPos : motion.trackPos;
      let nextStreak = comfort.streak;
      let nextPassengers = state.passengers;
      let nextTrips = state.totalTripsCompleted;
      let inStation = state.inStation;

      const targetStation = STATIONS[state.currentStationIndex];
      if (!state.inStation && isStationArrival(motion.trackPos, targetStation) && motion.speedKmh < 6) {
        inStation = true;
        nextSpeed = 0;
        nextTrackPosition = motion.trackPos;
        soundEngine.playArrivalChime(state.audioEnabled);

        const earnedTips = calculateArrivalTips(comfort.comfort, nextStreak);
        bonusGold += earnedTips;
        nextPassengers = randomPassengerCount(state.maxPassengers);
        nextTrips += 1;

        if (comfort.comfort > 70) {
          nextStreak = Math.min(4, Number((nextStreak + 0.3).toFixed(1)));
        }

        callbacksRef.current.onStationArrival(earnedTips);
        callbacksRef.current.unlockAchievement('first_ride');
        if (nextStreak >= 2.5 && comfort.comfort >= 95) {
          callbacksRef.current.unlockAchievement('gentle_hands');
        }
      }

      const nextState: GameState = {
        ...state,
        speed: nextSpeed,
        trackPos: nextTrackPosition,
        comfort: comfort.comfort,
        streak: nextStreak,
        streakBroken: comfort.streakBroken,
        crosswindForce: windForce,
        gold: state.gold + bonusGold,
        parcelsCollected,
        passengers: nextPassengers,
        totalTripsCompleted: nextTrips,
        inStation,
        totalDistanceTraveled:
          state.totalDistanceTraveled + (motion.speedMetersPerSecond * dt) / 1000,
      };

      stateRef.current = nextState;
      setGameState(nextState);
    };

    animationFrameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [inputRef, setGameState, worldRef]);
}
