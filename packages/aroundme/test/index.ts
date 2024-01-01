import { AroundMeLocationsClient, LandMark } from "../src";
import { CachedClient, DiskCache } from "../src/cached-client";
import { Client } from "@googlemaps/google-maps-services-js";

require("dotenv").config({
  path: require("path").resolve(__dirname, "./../.env"),
});

const GOOGLE_MAPS_API_KEY = process.env.MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error("GOOGLE_MAPS_API_KEY is not set");
}

const googleMapsClient = new Client({});
const rootPath = require("path").resolve(__dirname, "./../");
const cache = DiskCache({ location: rootPath + "/.cache" });

const client = CachedClient(googleMapsClient, cache);

const aroundMeClient = AroundMeLocationsClient(
  client,
  GOOGLE_MAPS_API_KEY as string
);

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
      1500
    );
    const sortedResult = result.sort(
      (a, b) => (a.walkingDistance || 10000) - (b.walkingDistance || 10000)
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
      1000
    );

    expect(sortedPOIs["restaurant"].length).toEqual(20);
    expect(sortedPOIs["discount"].length).toEqual(5);
    expect(sortedPOIs["przedszkole"].length).toEqual(20);
    expect(sortedPOIs["przedszkole"][0].name).toEqual(
      "Przedszkole Kolorowe Kredki Stańczyka 8a"
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
      [rynek]
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
