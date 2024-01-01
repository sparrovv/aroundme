import {
  ApiKeyParams,
  DirectionsRequest,
  DirectionsResponse,
  GeocodeRequest,
  GeocodeResponse,
  PlacesNearbyRequest,
  PlacesNearbyResponse,
} from "@googlemaps/google-maps-services-js";
import { Client } from "@googlemaps/google-maps-services-js/dist/client";
import { get } from "http";
import * as fs from "fs";

export interface CachedClient {
  geocode: (request: GeocodeRequest) => Promise<GeocodeResponse>;
  directions: (request: DirectionsRequest) => Promise<DirectionsResponse>;
  placesNearby: (request: PlacesNearbyRequest) => Promise<PlacesNearbyResponse>;
}

interface CacheI {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
}
type CacheOpts = {
  location: string;
};

export const DiskCache = (opts: CacheOpts): CacheI => {
  const location = opts.location;

  const get = async (key: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      fs.readFile(`${location}/${key}`, (err, data) => {
        if (err) {
          resolve(null);
        } else {
          resolve(data.toString() as string);
        }
      });
    });
  };

  const set = async (key: string, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      fs.writeFile(`${location}/${key}`, value, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  return {
    get,
    set,
  };
};

type ReqA = {
  params: {
    key?: string;
    [k: string]: any;
  };
  [k: string]: any;
};

export const CachedClient = (client: Client, cache: CacheI): CachedClient => {
  const stripApiKeyFromParams = <Req extends ReqA>(request: Req): Req => {
    const x = {
      ...request,
      params: {
        ...request.params,
      },
    };

    delete x.params.key;

    return x;
  };

  const geocode = async (request: GeocodeRequest) => {
    const x = (request: GeocodeRequest) => client.geocode(request);

    return await getCachedResponse(request, x);
  };

  const directions = async (request: DirectionsRequest) => {
    const x = (request: DirectionsRequest) => client.directions(request);
    return await getCachedResponse(request, x);
  };

  const placesNearby = async (request: PlacesNearbyRequest) => {
    const x = (request: PlacesNearbyRequest) => client.placesNearby(request);

    return await getCachedResponse(request, x);
  };

  const normaliseCacheKey = (key: string) => {
    return key.replace(/[^a-zA-Z0-9]/g, "_");
  };

  const getCachedResponse = async <Req, Res>(
    x: Req,
    fetchFunc: (x: Req) => Res
  ) => {
    const cacheKey = normaliseCacheKey(
      JSON.stringify(stripApiKeyFromParams(x as ReqA))
    );
    const cachedResponse = await cache.get(cacheKey);

    if (cachedResponse) {
      return JSON.parse(cachedResponse) as Res;
    } else {
      const response = await fetchFunc(x);

      //@ts-expect-error
      if (response.request) {
        //getting rid of circular reference, so we can cache the response
        //@ts-expect-error
        delete response.request;
      }
      //@ts-expect-error
      if (response.config) {
        //@ts-expect-error
        delete response.config;
      }
      try {
        await cache.set(cacheKey, JSON.stringify(response));
      } catch (e) {
        console.log(e);
      }
      return response;
    }
  };

  return {
    geocode,
    directions,
    placesNearby,
  };
};
