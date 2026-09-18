import type { StationData } from '../../types/game';

export const TRACK_LENGTH_METERS = 800;
export const STATION_APPROACH_RADIUS_U = 0.065;
export const STATION_STOP_RADIUS_U = 0.012;
export const MAX_STATION_STOP_SPEED_KMH = 7;

export function forwardTrackDistance(from: number, to: number): number {
  return ((to - from) % 1 + 1) % 1;
}

export function circularTrackDistance(a: number, b: number): number {
  const direct = Math.abs(a - b);
  return Math.min(direct, 1 - direct);
}

export function distanceToStationMeters(trackPos: number, station: StationData): number {
  return Math.round(forwardTrackDistance(trackPos, station.u) * TRACK_LENGTH_METERS);
}

export function isInsideStationStopZone(trackPos: number, station: StationData): boolean {
  return circularTrackDistance(trackPos, station.u) <= STATION_STOP_RADIUS_U;
}

export function isApproachingStation(trackPos: number, station: StationData): boolean {
  const distance = forwardTrackDistance(trackPos, station.u);
  return distance > STATION_STOP_RADIUS_U && distance <= STATION_APPROACH_RADIUS_U;
}

export function didCrossTrackPoint(previousTrackPos: number, nextTrackPos: number, target: number): boolean {
  if (previousTrackPos <= nextTrackPos) {
    return previousTrackPos < target && target <= nextTrackPos;
  }

  return target > previousTrackPos || target <= nextTrackPos;
}

export function nextStationIndex(currentIndex: number, stationCount: number): number {
  return (currentIndex + 1) % stationCount;
}
