import { PASSENGER_STORIES, STATIONS } from '../constants';
import type { GameState } from '../../types/game';

export function createInitialGameState(): GameState {
  return {
    gold: 180,
    passengers: 14,
    maxPassengers: 16,
    comfort: 100,
    streak: 1.2,
    streakBroken: false,
    smoothDrivingSeconds: 0,
    tripMinimumComfort: 100,
    tripPeakSpeed: 0,
    missedStops: 0,
    speed: 0,
    throttle: 0,
    trackPos: STATIONS[0].u,
    currentStationIndex: 1,
    inStation: false,
    stationWaitTimer: 0,
    crosswindForce: 0,
    cameraMode: 'chase',
    weather: 'sunset',
    isWorkshopMode: false,
    isPhotoMode: false,
    audioEnabled: true,
    musicEnabled: false,
    selectedPaint: 'classic_forest',
    installedUpgrades: {},
    unlockedPaints: { classic_forest: true },
    parcelsCollected: 0,
    totalDistanceTraveled: 0,
    totalTripsCompleted: 0,
    activePassengerStory: PASSENGER_STORIES[0] ?? null,
  };
}
