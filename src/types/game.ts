export type CameraMode = 'chase' | 'cab' | 'passenger' | 'scenic' | 'birds_eye';

export type WeatherPreset = 'day' | 'sunset' | 'night' | 'fog' | 'golden_morning';

export interface StationData {
  id: string;
  name: string;
  u: number;
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
  comfort: number;
  streak: number;
  streakBroken: boolean;
  speed: number;
  throttle: number;
  trackPos: number;
  currentStationIndex: number;
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
