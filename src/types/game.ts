export type CameraMode = 'chase' | 'cab' | 'passenger' | 'scenic' | 'birds_eye';

export type WeatherPreset = 'day' | 'sunset' | 'night' | 'fog' | 'golden_morning';

export interface StationData {
  id: string;
  name: string;
  u: number; // 0.0 to 1.0 along the track spline
  desc: string;
  region: string;
  tagline: string;
  color: string;
  unlockedStory: string;
}

export interface UpgradeItem {
  id: string;
  title: string;
  icon: string;
  cost: number;
  description: string;
  benefit: string;
  category: 'chassis' | 'comfort' | 'capacity' | 'visual';
}

export interface PaintScheme {
  id: string;
  name: string;
  primaryColor: number;
  secondaryColor: number;
  roofColor: number;
  trimColor: number;
  cost: number;
  desc: string;
}

export interface PassengerStory {
  id: string;
  name: string;
  avatar: string;
  title: string;
  quote: string;
  stationOrigin: string;
  stationDest: string;
  activeRequest?: {
    text: string;
    targetSpeedMax?: number;
    requireBellAtStation?: string;
    completed: boolean;
    reward: number;
  };
}

export interface SkyParcel {
  id: number;
  u: number;
  collected: boolean;
  value: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface GameState {
  gold: number;
  passengers: number;
  maxPassengers: number;
  comfort: number; // 0 to 100
  streak: number; // 1.0 to 4.0
  streakBroken: boolean;
  smoothDrivingSeconds: number;
  tripMinimumComfort: number;
  tripPeakSpeed: number;
  missedStops: number;
  speed: number; // km/h
  throttle: number; // -1 to 1
  trackPos: number; // 0.0 to 1.0
  currentStationIndex: number; // next station while driving, current platform while stopped
  inStation: boolean;
  stationWaitTimer: number;
  crosswindForce: number;
  cameraMode: CameraMode;
  weather: WeatherPreset;
  isWorkshopMode: boolean;
  isPhotoMode: boolean;
  audioEnabled: boolean;
  musicEnabled: boolean;
  selectedPaint: string;
  installedUpgrades: Record<string, boolean>;
  unlockedPaints: Record<string, boolean>;
  parcelsCollected: number;
  totalDistanceTraveled: number;
  totalTripsCompleted: number;
  activePassengerStory: PassengerStory | null;
}
