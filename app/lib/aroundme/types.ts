import { AddressComponent } from "@googlemaps/google-maps-services-js";

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Address {
  address: string;
  city: string;
  country: string;
}
export interface LocationAddress {
  inputAddress: string;
  formattedAddress: string;
  latLng: [number, number];
  addressComponents?: AddressComponent[];
  city: string;
  country: string;
}

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
  "landmark",
] as const;

export type PointOfInterest = (typeof pointOfInterest)[number];

export interface DistanceFromLocation {
  pointOfInterest: PointOfInterest;
  geoLocation: number[];
  theReferenceGeoLoc: number[];
  name: string;
  address?: string;
  distance?: number | undefined;
  walkingDistance?: number | undefined;
  walkingDuration?: number | undefined;
  walkingDurationInMinutes?: number | undefined;
  status?: string | undefined;
  rating?: number | undefined;
}

export interface ScoreConfig {
  placeType: PointOfInterest;
  weight: number;
  distanceType: "walking" | "driving" | "public";
  thresholdInMinutes: number;
}
