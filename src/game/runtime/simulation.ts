import type { GameState } from '../../types/game';
import { TRACK_LENGTH_METERS } from './route';

export const MAX_SPEED_KMH = 65;

export interface MotionFrameInput {
  state: GameState;
  dt: number;
  slopeIncline: number;
  turnSeverity: number;
  isPowerPressed: boolean;
  isBrakePressed: boolean;
  crosswindPhase: number;
}

export interface MotionFrameResult {
  acceleration: number;
  throttle: number;
  speedKmh: number;
  speedMetersPerSecond: number;
  trackPos: number;
  lateralForce: number;
  crosswindForce: number;
  crosswindPhase: number;
}

export interface ComfortFrameResult {
  comfort: number;
  streak: number;
  streakBroken: boolean;
  streakJustBroken: boolean;
  roughDriving: boolean;
}

export function calculateMotionFrame(input: MotionFrameInput): MotionFrameResult {
  const {
    state,
    dt,
    slopeIncline,
    turnSeverity,
    isPowerPressed,
    isBrakePressed,
  } = input;

  const crosswindPhase = input.crosswindPhase + dt * 0.75;
  const crosswindForce = Math.sin(crosswindPhase) * Math.cos(crosswindPhase * 0.35);

  if (state.inStation) {
    return {
      acceleration: 0,
      throttle: 0,
      speedKmh: 0,
      speedMetersPerSecond: 0,
      trackPos: state.trackPos,
      lateralForce: 0,
      crosswindForce,
      crosswindPhase,
    };
  }

  const throttle = isBrakePressed ? -1 : isPowerPressed ? 1 : 0;

  let acceleration = 0;
  if (isPowerPressed) acceleration += 14;
  if (isBrakePressed) acceleration -= 30;

  if (!isPowerPressed && !isBrakePressed) {
    acceleration -= Math.sign(state.speed) * 3.8;
  }

  // Positive tangent Y means uphill and naturally steals acceleration.
  acceleration -= slopeIncline * 16;

  const speedKmh = clamp(state.speed + acceleration * dt, 0, MAX_SPEED_KMH);
  const speedMetersPerSecond = (speedKmh * 1000) / 3600;
  const trackPos = wrap01(
    state.trackPos + (speedMetersPerSecond / TRACK_LENGTH_METERS) * dt,
  );

  // Curves now matter: a straight segment is forgiving while fast bends create sway.
  const curveMultiplier = 0.2 + clamp(turnSeverity, 0, 1) * 2;
  const lateralForce =
    (Math.pow(speedMetersPerSecond, 2) / 50) * 0.11 * curveMultiplier;

  return {
    acceleration,
    throttle,
    speedKmh,
    speedMetersPerSecond,
    trackPos,
    lateralForce,
    crosswindForce,
    crosswindPhase,
  };
}

export function adjustCrosswindForAltitude(crosswindForce: number, altitude: number): number {
  return altitude > 38 ? crosswindForce * 1.8 : crosswindForce;
}

export function calculateComfortFrame(
  state: GameState,
  dt: number,
  acceleration: number,
  lateralForce: number,
  crosswindForce: number,
): ComfortFrameResult {
  if (state.inStation) {
    return {
      comfort: state.comfort,
      streak: state.streak,
      streakBroken: state.streakBroken,
      streakJustBroken: false,
      roughDriving: false,
    };
  }

  let comfortDrain = 0;

  // Full power is acceptable, but abrupt launches and hard braking are noticeable.
  if (acceleration > 12) {
    comfortDrain += (acceleration - 12) * 0.35;
  }

  if (acceleration < -16) {
    comfortDrain += (Math.abs(acceleration) - 16) * 0.75;
  }

  const cornerTolerance = state.installedUpgrades.suspension ? 1.45 : 0.95;
  if (lateralForce > cornerTolerance) {
    comfortDrain += (lateralForce - cornerTolerance) * 12;
  }

  if (Math.abs(crosswindForce) > 0.72) {
    comfortDrain += (Math.abs(crosswindForce) - 0.72) * 7;
  }

  const recoveryRate = state.installedUpgrades.vines ? 5.5 : 3.5;
  const roughDriving = comfortDrain > 0.4;
  const comfort = roughDriving
    ? clamp(state.comfort - comfortDrain * dt * 3.2, 0, 100)
    : clamp(state.comfort + recoveryRate * dt, 0, 100);

  let streak = state.streak;
  let streakBroken = state.streakBroken;
  const streakJustBroken = comfort < 35 && !streakBroken;

  if (streakJustBroken) {
    streak = 1;
    streakBroken = true;
  } else if (comfort > 75 && streakBroken) {
    streakBroken = false;
  }

  return {
    comfort,
    streak,
    streakBroken,
    streakJustBroken,
    roughDriving,
  };
}

export function calculateArrivalTips(comfort: number, streak: number): number {
  return Math.floor((45 + Math.floor(comfort * 0.75)) * streak);
}

export function randomPassengerCount(maxPassengers: number, random = Math.random): number {
  return 8 + Math.floor(random() * Math.max(1, maxPassengers - 7));
}

export function calculateTurnSeverity(currentTangentDotAhead: number): number {
  // 1 = same direction, lower values mean a sharper bend.
  const clampedDot = clamp(currentTangentDotAhead, -1, 1);
  const angle = Math.acos(clampedDot);
  return clamp(angle / 0.12, 0, 1);
}

export function isSmoothDrivingFrame(
  speedKmh: number,
  acceleration: number,
  lateralForce: number,
  crosswindForce: number,
  comfort: number,
): boolean {
  return (
    speedKmh > 8 &&
    comfort >= 88 &&
    Math.abs(acceleration) < 13 &&
    lateralForce < 0.9 &&
    Math.abs(crosswindForce) < 0.72
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function wrap01(value: number): number {
  return ((value % 1) + 1) % 1;
}
