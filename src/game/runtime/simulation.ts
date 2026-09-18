import type { GameState, StationData } from '../../types/game';

const MAX_SPEED_KMH = 65;
const TRACK_LENGTH_UNITS = 800;

export interface MotionFrameInput {
  state: GameState;
  dt: number;
  slopeIncline: number;
  isPowerPressed: boolean;
  isBrakePressed: boolean;
  crosswindPhase: number;
}

export interface MotionFrameResult {
  acceleration: number;
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
}

export function calculateMotionFrame(input: MotionFrameInput): MotionFrameResult {
  const {
    state,
    dt,
    slopeIncline,
    isPowerPressed,
    isBrakePressed,
  } = input;

  let acceleration = 0;
  if (isPowerPressed && !state.inStation) acceleration += 15;
  if (isBrakePressed) acceleration -= 28;

  if (!isPowerPressed && !isBrakePressed) {
    acceleration -= Math.sign(state.speed) * 4.2;
  }

  acceleration -= slopeIncline * 18;

  const speedKmh = clamp(state.speed + acceleration * dt, 0, MAX_SPEED_KMH);
  const speedMetersPerSecond = (speedKmh * 1000) / 3600;
  const deltaTrack = (speedMetersPerSecond / TRACK_LENGTH_UNITS) * dt;
  const trackPos = wrap01(state.trackPos + deltaTrack);
  const lateralForce = (Math.pow(speedMetersPerSecond, 2) / 60) * 0.08;

  const crosswindPhase = input.crosswindPhase + dt * 0.75;
  const crosswindForce = Math.sin(crosswindPhase) * Math.cos(crosswindPhase * 0.35);

  return {
    acceleration,
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
  let comfortDrain = 0;

  if (Math.abs(acceleration) > 24) {
    comfortDrain += Math.abs(acceleration) * 0.2;
  }

  const cornerTolerance = state.installedUpgrades.suspension ? 1.5 : 0.95;
  if (lateralForce > cornerTolerance) {
    comfortDrain += (lateralForce - cornerTolerance) * 18;
  }

  if (Math.abs(crosswindForce) > 0.7) {
    comfortDrain += Math.abs(crosswindForce) * 2.8;
  }

  const recoveryRate = state.installedUpgrades.vines ? 8.5 : 5.5;
  const comfort = comfortDrain > 0
    ? clamp(state.comfort - comfortDrain * dt * 3.5, 0, 100)
    : clamp(state.comfort + recoveryRate * dt, 0, 100);

  let streak = state.streak;
  let streakBroken = state.streakBroken;
  const streakJustBroken = comfort < 35 && !streakBroken;

  if (streakJustBroken) {
    streakBroken = true;
    streak = 1;
  } else if (comfort > 75 && streakBroken) {
    streakBroken = false;
  }

  return { comfort, streak, streakBroken, streakJustBroken };
}

export function isStationArrival(trackPos: number, station: StationData): boolean {
  const distance = Math.abs(trackPos - station.u);
  return distance < 0.015 || (station.u > 0.96 && trackPos < 0.015);
}

export function calculateArrivalTips(comfort: number, streak: number): number {
  const comfortBonus = Math.floor(comfort * 0.75);
  return Math.floor((45 + comfortBonus) * streak);
}

export function randomPassengerCount(maxPassengers: number, random = Math.random): number {
  const availableRange = Math.max(1, maxPassengers - 7);
  return 8 + Math.floor(random() * availableRange);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function wrap01(value: number): number {
  return ((value % 1) + 1) % 1;
}
