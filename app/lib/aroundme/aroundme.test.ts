/* eslint-disable jest/no-conditional-expect */
import { Client } from "@googlemaps/google-maps-services-js";
import { Either } from "effect";

import { CachedClient, DiskCache } from "./cached-client";

import { AroundMeLocationsClient, LandMark } from ".";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  path: require("path").resolve(__dirname, "./../../../.env"),
});

const GOOGLE_MAPS_API_KEY = process.env.MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error("GOOGLE_MAPS_API_KEY is not set");
}

const googleMapsClient = new Client({});
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rootPath = require("path").resolve(__dirname, "./../../../");
const cache = DiskCache({ location: rootPath + "/.geo_test_cache" });

const client = CachedClient(googleMapsClient, cache);

const aroundMeClient = AroundMeLocationsClient(
  client,
  GOOGLE_MAPS_API_KEY as string,
);

describe("geocode", () => {
  it("returns the error when invalid address", async () => {
    const result = await aroundMeClient.geoCode("invalid, ");
    expect(result._tag).toEqual("Left");
    expect(result.left.message).toEqual("No results found");
  });

  it("returns the location and the address", async () => {
    const eitherResult = await aroundMeClient.geoCode(
      "Stańczyka 5, Krakow, Poland",
    );
    expect(eitherResult._tag).toEqual("Right");
    if (Either.isRight(eitherResult)) {
      const result = eitherResult.right;

      expect(result.inputAddress).toEqual("Stańczyka 5, Krakow, Poland");
      expect(result.formattedAddress).toEqual(
        "Stańczyka 5, 30-126 Kraków, Poland",
      );
      expect(result.latLng).toEqual([50.0782512, 19.8941993]);
      expect(result.city).toEqual("Kraków");
      expect(result.country).toEqual("Poland");
      expect(result.addressComponents).toEqual([
        { long_name: "5", short_name: "5", types: ["street_number"] },
        {
          long_name: "Stańczyka",
          short_name: "Stańczyka",
          types: ["route"],
        },
        {
          long_name: "Bronowice",
          short_name: "Bronowice",
          types: ["political", "sublocality", "sublocality_level_1"],
        },
        {
          long_name: "Kraków",
          short_name: "Kraków",
          types: ["locality", "political"],
        },
        {
          long_name: "Kraków",
          short_name: "Kraków",
          types: ["administrative_area_level_2", "political"],
        },
        {
          long_name: "Małopolskie",
          short_name: "Małopolskie",
          types: ["administrative_area_level_1", "political"],
        },
        {
          long_name: "Poland",
          short_name: "PL",
          types: ["country", "political"],
        },
        {
          long_name: "30-126",
          short_name: "30-126",
          types: ["postal_code"],
        },
      ]);
    }
  });
});

describe("find the nearest", () => {
  it("finds the POIs close to the address with distance in meteres and seconds", async () => {
    const location = {
      address: "Stańczyka 5",
      city: "Krakow",
      country: "Poland",
    };

    const result = await aroundMeClient.findNearbyPoi(
      location,
      "restaurant",
      1500,
    );
    const sortedResult = result.sort(
      (a, b) => (a.walkingDistance || 10000) - (b.walkingDistance || 10000),
    );

    expect(sortedResult.length).toEqual(20);
  });

  it("returns a list of nearby POIs based on the POI type", async () => {
    const sortedPOIs = await aroundMeClient.findAllNearbyPois(
      {
        address: "Stańczyka 5",
        city: "Krakow",
        country: "Poland",
      },
      [
        "restaurant",
        "bus stop",
        "tram stop",
        "ośrodek zdrowia",
        "przedszkole",
        "discount",
        "szkoła podstawowa",
        "food",
        "pizza",
      ],
      1000,
    );

    expect(sortedPOIs["restaurant"].length).toEqual(20);
    expect(sortedPOIs["discount"].length).toEqual(5);
    expect(sortedPOIs["przedszkole"].length).toEqual(20);
    expect(sortedPOIs["przedszkole"][0].name).toEqual(
      "Przedszkole Kolorowe Kredki Stańczyka 8a",
    );
  });

  it("returns a list of distances from landmarks", async () => {
    const rynek: LandMark = {
      name: "Rynek Główny",
      address: "Rynek Główny 1",
    };

    const result = await aroundMeClient.distanceFromLandmarks(
      {
        address: "Stańczyka 5",
        city: "Krakow",
        country: "Poland",
      },
      [rynek],
    );

    expect(result.length).toEqual(1);

    const expected = [
      {
        distance: 3549.6576434457784,
        landMark: { address: "Rynek Główny 1", name: "Rynek Główny" },
        publicDurationInMinutes: 22,
        publicTransportDistance: 4007,
        publicTransportDuration: 1346,
        walkingDistance: 4024,
        walkingDuration: 3313,
        walkingDurationInMinutes: 55,
      },
    ];
    expect(result).toEqual(expected);
  });

  // it('grades the location based on the POI types and the distance', async () => {
  //   const sortedPOIs = await findAllNearbyPOIs(
  //     {
  //       address: "Stańczyka 5",
  //       city: "Krakow",
  //       country: "Poland",
  //     },
  //     [
  //       "restaurant",
  //       "bus stop",
  //       "tram stop",
  //       "ośrodek zdrowia",
  //       "przedszkole",
  //       "discount",
  //       "szkoła podstawowa",
  //       "food",
  //       'gym',
  //       'cinema'
  //     ],
  //     1000
  //   );

  //   const score = calculateScore(sortedPOIs)
  //   expect(score.score).toEqual(41.5)
  //   // expect(score.scoredPlaces).toEqual({})

  //   const sortedPOIs2 = await findAllNearbyPOIs(
  //     {
  //       address: "os. Kombatantów 6",
  //       city: "Krakow",
  //       country: "Poland",
  //     },
  //     [
  //       "restaurant",
  //       "bus stop",
  //       "tram stop",
  //       "ośrodek zdrowia",
  //       "przedszkole",
  //       "discount",
  //       "szkoła podstawowa",
  //       "food",
  //       "gym",
  //       "cinema",
  //     ],
  //     1000
  //   );

  //   const score2 = calculateScore(sortedPOIs2)
  //   expect(score2.score).toEqual(43.5)
  // })
});
