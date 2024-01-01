import {
  Address,
  DistanceFromLocation,
  Location,
  PointOfInterest,
} from "./types";
import {
  Client,
  DirectionsRequest,
  Language,
  RouteLeg,
  TravelMode,
  UnitSystem,
} from "@googlemaps/google-maps-services-js";
import { CachedClient, DiskCache } from "./cached-client";

export type LandMark = {
  name: string;
  address: string;
  location?: Location;
};

export type DistanceFromLandMark = {
  landMark: LandMark;
  distance: number;
  walkingDistance: number;
  walkingDuration: number;
  walkingDurationInMinutes: number;
  publicTransportDistance: number;
  publicTransportDuration: number;
  publicDurationInMinutes: number;
};
export type GroupedPOIs = {
  [key in PointOfInterest]: DistanceFromLocation[];
};

type AroundMeLocations = {
  findNearbyPoi: (
    address: Address,
    pointOfInterest: PointOfInterest,
    radius: number,
    limitOfResults?: number
  ) => Promise<DistanceFromLocation[]>;
  findAllNearbyPois: (
    address: Address,
    pointOfInterests: PointOfInterest[],
    radius: number,
    limitOfResults?: number
  ) => Promise<GroupedPOIs>;
  distanceFromLandmarks: (
    address: Address,
    landMarks: LandMark[]
  ) => Promise<DistanceFromLandMark[]>;
};

export const AroundMeLocationsClient = (
  client: CachedClient,
  apiKey: string
): AroundMeLocations => {
  const addressToGoogleMapsAddress = (address: Address): string => {
    return `${address.address}, ${address.city}, ${address.country}`;
  };

  const findLocation = async (address: Address): Promise<Location> => {
    const result = await client.geocode({
      params: {
        address: addressToGoogleMapsAddress(address),
        key: apiKey,
      },
      timeout: 2000,
    });

    const location = result.data.results[0].geometry.location;

    return {
      latitude: location.lat,
      longitude: location.lng,
    };
  };

  const toRadians = (degrees: number): number => {
    return (degrees * Math.PI) / 180;
  };

  const distanceInMeters = (loc1: Location, loc2: Location): number => {
    const earthRadiusInMeters = 6371e3; // Earth's radius in meters
    const lat1 = toRadians(loc1.latitude);
    const lat2 = toRadians(loc2.latitude);
    const deltaLat = toRadians(loc2.latitude - loc1.latitude);
    const deltaLng = toRadians(loc2.longitude - loc1.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusInMeters * c;
  };

  const getDirections = async (
    from: Location,
    to: Location,
    travelMode: TravelMode = TravelMode.walking
  ): Promise<RouteLeg> => {
    const params: DirectionsRequest = {
      params: {
        origin: { lat: from.latitude, lng: from.longitude },
        destination: { lat: to.latitude, lng: to.longitude },
        key: apiKey,
        mode: travelMode,
        alternatives: false,
        units: UnitSystem.metric,
        language: Language.pl,
      },
      timeout: 1000, // milliseconds
    };

    const result = await client.directions(params);

    return result.data.routes[0].legs[0];
  };

  const checkValidAddress = (address: string | undefined) => {
    // there are cases where there's only a name of the city without the address
    // valid address looks like this: "ul. Stańczyka 12, Kraków"
    return (address || "").split(",").length > 1;
  };

  const checkRatingOver = (
    rating: number | undefined,
    ratingOver: number = 0
  ) => {
    // there are cases where there's only a name of the city without the address
    // valid address looks like this: "ul. Stańczyka 12, Kraków"
    return (rating || 0) > ratingOver;
  };

  const findNearbyPoi = async (
    address: Address,
    pointOfInterest: PointOfInterest,
    radius: number,
    limitOfResults?: number
  ): Promise<DistanceFromLocation[]> => {
    const loc: Location = await findLocation(address);

    const nearbyPointOfIntrests = await client.placesNearby({
      params: {
        location: { lat: loc.latitude, lng: loc.longitude },
        radius: radius,
        keyword: pointOfInterest,
        key: apiKey,
      },
      timeout: 1000, // milliseconds
    });

    const nearbyResults =
      limitOfResults === undefined
        ? nearbyPointOfIntrests.data.results.slice(0, limitOfResults)
        : nearbyPointOfIntrests.data.results;

    const filteredResults = nearbyResults
      .filter((e) => checkValidAddress(e.vicinity))
      .filter((e) => checkRatingOver(e.rating, 0));

    const nearbyPoisWithDistance = Promise.all(
      nearbyResults.map(async (r) => {
        const geo = r.geometry;
        let distance;
        let directions: RouteLeg | undefined = undefined;
        if (geo) {
          distance = distanceInMeters(loc, {
            latitude: geo.location.lat,
            longitude: geo.location.lng,
          });

          directions = await getDirections(loc, {
            latitude: geo.location.lat,
            longitude: geo.location.lng,
          });
        }

        return {
          name: r.name!,
          address: r.vicinity!,
          distance,
          pointOfInterest,
          walkingDistance: directions?.distance.value,
          walkingDuration: directions?.duration.value,
          walkingDurationInMinutes: toMinutes(directions?.duration.value),
          status: r.business_status,
          rating: r.rating,
        };
      })
    );

    return await nearbyPoisWithDistance;
  };

  const findAllNearbyPOIs = async (
    address: Address,
    pointOfInterests: PointOfInterest[],
    radius: number,
    limitOfResults?: number
  ): Promise<GroupedPOIs> => {
    const nearbyPOIs = await Promise.all(
      pointOfInterests.map((poi) =>
        findNearbyPoi(address, poi, radius, limitOfResults)
      )
    );

    const flatten = nearbyPOIs.flat();

    const groupedPOIs = flatten.reduce((acc, current) => {
      const key = current.pointOfInterest;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(current);
      return acc;
    }, {} as { [key: string]: typeof flatten });

    // @todo: this looks bad, refactor, what if there's no walkingDuration?
    const oneHour = 60 * 60;

    const sortedPOIs = Object.keys(groupedPOIs).reduce(
      (acc, current) => ({
        ...acc,
        [current]: groupedPOIs[current].sort(
          (a, b) =>
            (a.walkingDuration || oneHour) - (b.walkingDuration || oneHour)
        ),
      }),
      {} as { [key in PointOfInterest]: typeof flatten }
    );

    return sortedPOIs;
  };

  function toMinutes(value: number | undefined): any {
    return value ? Math.round(value / 60) : undefined;
  }

  const distanceFromLandmarks = async (
    address: Address,
    landMarks: LandMark[]
  ): Promise<DistanceFromLandMark[]> => {
    const loc: Location = await findLocation(address);

    const distanceFromLandmarks = Promise.all(
      landMarks.map(async (landMark) => {
        const landMarkLocation = await findLocation({
          address: landMark.address,
          city: address.city,
          country: address.country,
        });
        const directions = await getDirections(
          loc,
          landMarkLocation,
          TravelMode.walking
        );
        const publicDirections = await getDirections(
          loc,
          landMarkLocation,
          TravelMode.transit
        );
        const distance = distanceInMeters(loc, landMarkLocation);

        return {
          landMark,
          distance,
          walkingDistance: directions.distance.value,
          walkingDuration: directions.duration.value,
          walkingDurationInMinutes: toMinutes(directions.duration.value),
          publicTransportDistance: publicDirections.distance.value,
          publicTransportDuration: publicDirections.duration.value,
          publicDurationInMinutes: toMinutes(publicDirections.duration.value),
        };
      })
    );

    return await distanceFromLandmarks;
  };

  return {
    findNearbyPoi: findNearbyPoi,
    findAllNearbyPois: findAllNearbyPOIs,
    distanceFromLandmarks: distanceFromLandmarks,
  };
};
