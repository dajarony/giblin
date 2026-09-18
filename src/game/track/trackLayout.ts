export type TrackPoint = readonly [x: number, y: number, z: number];

export const TRACK_CONTROL_POINTS: readonly TrackPoint[] = [
  [-150, 24, -30], // Saltlight Terminus
  [-100, 38, -95], // Pine Ridge Ascent
  [-20, 58, -145], // High Cloud Arch Bridge
  [50, 48, -125], // High Pines Sky Bridge
  [120, 36, -75], // East Coast Descent
  [145, 22, 10], // Coastal Shallows Turn
  [140, 16, 65], // Mango Tide Pier
  [85, 12, 120], // Low Sea-Spray Viaduct
  [0, 16, 135], // Oliver's Cloudworks
  [-90, 20, 95], // Sunset Bay Turn
  [-145, 22, 35], // Return to Saltlight Valley
] as const;

/**
 * Arc-length positions produced by the Catmull-Rom track above.
 * Keep station gameplay and rendered platforms on the same physical rail points.
 */
export const STATION_ROUTE_POSITIONS = {
  saltlight: 0,
  highpines: 0.2829,
  mangotide: 0.5423,
  cloudworks: 0.7259,
} as const;

/**
 * The scenic spline is ~897.96 world units long. Treat one world unit as one
 * metre for motion timing and HUD distance.
 */
export const TRACK_LENGTH_METERS = 898;
