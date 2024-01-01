export type Location = {
  latitude: number;
  longitude: number;
};
export type Address = {
  address: string;
  city: string;
  country: string;
};

export const pointOfInterest = [
  "hospital",
  "school",
  "primary school",
  "kindergarten",
  "bus stop",
  "restaurant",
  "supermarket",
  "pharmacy",
  "park",
  "gym",
  "cinema",
  "museum",
  "tram stop",
  "ośrodek zdrowia",
  "przedszkole",
  "discount",
  "szkoła podstawowa",
  "food",
  "pizza",
  "theatre",
  "park",
] as const;

export type PointOfInterest = (typeof pointOfInterest)[number];

export type DistanceFromLocation = {
  pointOfInterest: PointOfInterest;
  name: string;
  address?: string;
  distance?: number | undefined;
  walkingDistance?: number | undefined;
  walkingDuration?: number | undefined;
  walkingDurationInMinutes?: number | undefined;
  status?: string | undefined;
  rating?: number | undefined;
};

export type ScoreConfig = {
  placeType: PointOfInterest;
  weight: number;
  distanceType: "walking" | "driving" | "public";
  thresholdInMinutes: number;
};
