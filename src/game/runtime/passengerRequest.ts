import type { PassengerStory, StationData } from '../../types/game';

export interface PassengerRequestEvaluation {
  applicable: boolean;
  completed: boolean;
  reward: number;
  failureReason?: string;
}

export function evaluatePassengerRequestAtArrival(
  story: PassengerStory | null,
  originStation: StationData,
  destinationStation: StationData,
  tripPeakSpeed: number,
  tripMinimumComfort: number,
): PassengerRequestEvaluation {
  const request = story?.activeRequest;

  if (!story || !request || request.completed) {
    return { applicable: false, completed: false, reward: 0 };
  }

  if (
    story.stationOrigin !== originStation.name ||
    story.stationDest !== destinationStation.name
  ) {
    return { applicable: false, completed: false, reward: 0 };
  }

  // Bell requests are resolved at the moment the player rings near the platform.
  if (request.requireBellAtStation) {
    return {
      applicable: true,
      completed: false,
      reward: 0,
      failureReason: 'The bell request was not completed before arrival.',
    };
  }

  if (
    request.targetSpeedMax !== undefined &&
    tripPeakSpeed > request.targetSpeedMax
  ) {
    return {
      applicable: true,
      completed: false,
      reward: 0,
      failureReason: `Peak speed was ${Math.round(tripPeakSpeed)} km/h; the request limit was ${request.targetSpeedMax} km/h.`,
    };
  }

  if (
    request.targetComfortMin !== undefined &&
    tripMinimumComfort < request.targetComfortMin
  ) {
    return {
      applicable: true,
      completed: false,
      reward: 0,
      failureReason: `Comfort dipped to ${Math.round(tripMinimumComfort)}%; the request required ${request.targetComfortMin}% or more.`,
    };
  }

  return {
    applicable: true,
    completed: true,
    reward: request.reward,
  };
}
