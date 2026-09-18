import { useEffect, useRef } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { soundEngine } from '../../audio/SoundEngine';
import { STATIONS } from '../../game/constants';
import { evaluatePassengerRequestAtArrival } from '../../game/runtime/passengerRequest';
import {
  MAX_STATION_STOP_SPEED_KMH,
  STATION_APPROACH_RADIUS_U,
  didCrossTrackPoint,
  forwardTrackDistance,
  isApproachingStation,
  isInsideStationStopZone,
  nextStationIndex,
} from '../../game/runtime/route';
import {
  adjustCrosswindForAltitude,
  calculateArrivalTips,
  calculateComfortFrame,
  calculateMotionFrame,
  calculateTurnDirection,
  calculateTurnSeverity,
  isSmoothDrivingFrame,
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

const SMOOTH_STREAK_STEP_SECONDS = 10;
const MISSED_STOP_COMFORT_PENALTY = 12;

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
  const targetStationIdRef = useRef<string | null>(null);
  const approachWarnedRef = useRef(false);
  const brakeWarnedRef = useRef(false);
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

      const currentTangent = world.trackCurve.getTangentAt(state.trackPos).normalize();
      const aheadTrackPos = (state.trackPos + 0.014) % 1;
      const aheadTangent = world.trackCurve.getTangentAt(aheadTrackPos).normalize();
      const slopeIncline = currentTangent.y;
      const turnSeverity = calculateTurnSeverity(currentTangent.dot(aheadTangent));
      const turnDirection = calculateTurnDirection(
        currentTangent.x,
        currentTangent.z,
        aheadTangent.x,
        aheadTangent.z,
      );

      const motion = calculateMotionFrame({
        state,
        dt,
        slopeIncline,
        turnSeverity,
        turnDirection,
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
        dt,
        motion.speedKmh,
        motion.acceleration,
        motion.lateralForce,
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
          'Streak broken. Find your balance to rebuild your tips.',
          'Conductor Tip',
          '⚠️',
          3200,
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

      let nextSpeed = motion.speedKmh;
      let nextTrackPosition = motion.trackPos;
      let nextComfort = comfort.comfort;
      let nextStreak = comfort.streak;
      let nextStreakBroken = comfort.streakBroken;
      let nextSmoothDrivingSeconds = state.smoothDrivingSeconds;
      let nextPassengers = state.passengers;
      let nextTrips = state.totalTripsCompleted;
      let nextStation = state.currentStationIndex;
      let nextMissedStops = state.missedStops;
      let inStation = state.inStation;
      let activePassengerStory = state.activePassengerStory;
      let tripMinimumComfort = Math.min(state.tripMinimumComfort, comfort.comfort);
      let tripPeakSpeed = Math.max(state.tripPeakSpeed, motion.speedKmh);

      const smoothFrame = isSmoothDrivingFrame(
        motion.speedKmh,
        motion.acceleration,
        motion.lateralForce,
        windForce,
        comfort.comfort,
      );

      if (state.inStation || comfort.roughDriving || comfort.streakJustBroken) {
        nextSmoothDrivingSeconds = 0;
      } else if (smoothFrame) {
        nextSmoothDrivingSeconds += dt;
        if (nextSmoothDrivingSeconds >= SMOOTH_STREAK_STEP_SECONDS) {
          nextStreak = Math.min(4, Number((nextStreak + 0.1).toFixed(1)));
          nextSmoothDrivingSeconds = 0;
        }
      } else {
        nextSmoothDrivingSeconds = Math.max(0, nextSmoothDrivingSeconds - dt * 0.5);
      }

      const targetStation = STATIONS[state.currentStationIndex];

      if (targetStationIdRef.current !== targetStation.id) {
        targetStationIdRef.current = targetStation.id;
        approachWarnedRef.current = false;
        brakeWarnedRef.current = false;
      }

      if (!state.inStation && isApproachingStation(motion.trackPos, targetStation)) {
        if (!approachWarnedRef.current) {
          approachWarnedRef.current = true;
          callbacksRef.current.showToast(
            `Approaching ${targetStation.name}. Prepare to stop below ${MAX_STATION_STOP_SPEED_KMH} km/h.`,
            'Route Conductor',
            '🚉',
            3500,
          );
        }

        const distanceAhead = forwardTrackDistance(motion.trackPos, targetStation.u);
        if (
          !brakeWarnedRef.current &&
          distanceAhead < STATION_APPROACH_RADIUS_U * 0.45 &&
          motion.speedKmh > 18
        ) {
          brakeWarnedRef.current = true;
          callbacksRef.current.showToast(
            'Brake now for a smooth platform stop.',
            targetStation.name,
            '🛑',
            2500,
          );
        }
      }

      const canDock =
        !state.inStation &&
        isInsideStationStopZone(motion.trackPos, targetStation) &&
        motion.speedKmh <= MAX_STATION_STOP_SPEED_KMH;

      if (canDock) {
        inStation = true;
        nextSpeed = 0;
        nextTrackPosition = targetStation.u;

        soundEngine.playArrivalChime(state.audioEnabled);

        const earnedTips = calculateArrivalTips(nextComfort, nextStreak);
        bonusGold += earnedTips;
        nextPassengers = randomPassengerCount(state.maxPassengers);
        nextTrips += 1;

        const originStation =
          STATIONS[(state.currentStationIndex - 1 + STATIONS.length) % STATIONS.length];
        const requestResult = evaluatePassengerRequestAtArrival(
          activePassengerStory,
          originStation,
          targetStation,
          tripPeakSpeed,
          tripMinimumComfort,
        );

        if (requestResult.completed && activePassengerStory?.activeRequest) {
          bonusGold += requestResult.reward;
          activePassengerStory = {
            ...activePassengerStory,
            activeRequest: {
              ...activePassengerStory.activeRequest,
              completed: true,
            },
          };
          soundEngine.playCoinSound(state.audioEnabled);
          callbacksRef.current.showToast(
            `Passenger request complete! +${requestResult.reward} 🪙`,
            activePassengerStory.name,
            activePassengerStory.avatar,
            4000,
          );
        } else if (requestResult.applicable && requestResult.failureReason) {
          callbacksRef.current.showToast(
            requestResult.failureReason,
            activePassengerStory?.name ?? 'Passenger Request',
            activePassengerStory?.avatar ?? '🎫',
            4000,
          );
        }

        if (tripMinimumComfort > 70) {
          nextStreak = Math.min(4, Number((nextStreak + 0.3).toFixed(1)));
        }

        callbacksRef.current.onStationArrival(earnedTips);
        callbacksRef.current.unlockAchievement('first_ride');

        if (nextStreak >= 2.5 && nextComfort >= 95) {
          callbacksRef.current.unlockAchievement('gentle_hands');
        }

        if (targetStation.id === 'saltlight' && nextTrips >= 12) {
          callbacksRef.current.unlockAchievement('grand_tour');
        }
      } else if (
        !state.inStation &&
        didCrossTrackPoint(state.trackPos, motion.trackPos, targetStation.u)
      ) {
        nextStation = nextStationIndex(state.currentStationIndex, STATIONS.length);
        nextComfort = Math.max(0, nextComfort - MISSED_STOP_COMFORT_PENALTY);
        nextStreak = 1;
        nextStreakBroken = true;
        nextSmoothDrivingSeconds = 0;
        nextMissedStops += 1;
        tripMinimumComfort = nextComfort;
        tripPeakSpeed = 0;

        const followingStation = STATIONS[nextStation];
        callbacksRef.current.showToast(
          `Missed ${targetStation.name}. Next scheduled stop: ${followingStation.name}.`,
          'Route Conductor',
          '⚠️',
          4200,
        );
      }

      const nextState: GameState = {
        ...state,
        speed: nextSpeed,
        throttle: inStation ? 0 : motion.throttle,
        trackPos: nextTrackPosition,
        comfort: nextComfort,
        streak: nextStreak,
        streakBroken: nextStreakBroken,
        smoothDrivingSeconds: nextSmoothDrivingSeconds,
        tripMinimumComfort,
        tripPeakSpeed,
        missedStops: nextMissedStops,
        crosswindForce: windForce,
        gold: state.gold + bonusGold,
        parcelsCollected,
        passengers: nextPassengers,
        totalTripsCompleted: nextTrips,
        currentStationIndex: nextStation,
        inStation,
        activePassengerStory,
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
