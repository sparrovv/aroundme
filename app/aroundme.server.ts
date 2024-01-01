import { Client } from "@googlemaps/google-maps-services-js";

import { CachedClient, DiskCache } from "./lib/aroundme/cached-client";
import { AroundMeLocationsClient } from "./lib/aroundme/index";
import { singleton } from "./singleton.server";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rootPath = require("path").resolve(__dirname, "./../");
console.log("rootPath", rootPath);

const getAroundMeClient = () => {
  const GOOGLE_MAPS_API_KEY = process.env.MAPS_API_KEY;
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY is not set");
  }

  const googleMapsClient = new Client({});
  const cache = DiskCache({ location: rootPath + "/.cache" });

  const client = CachedClient(googleMapsClient, cache);

  const aroundMeClient = AroundMeLocationsClient(
    client,
    GOOGLE_MAPS_API_KEY as string,
  );

  return aroundMeClient;
};

const aroundme = singleton("aroundme", getAroundMeClient);

export { aroundme };
