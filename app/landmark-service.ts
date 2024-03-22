import { LandMark } from '@prisma/client';
import { Either } from 'effect';

import { createLandMark, getLandMarksByCityAndCountry } from "~/models/landMark.server";

import { aroundme } from './aroundme.server';
import { findPopularPlaces } from './lib/oai';


export const findOrCreateLandmarks = async (city: string, country: string, useAi = false): Promise<LandMark[]> => {
    const landmarks = await getLandMarksByCityAndCountry(city, country)

    if (landmarks.length > 0 && !useAi) {
        return landmarks
    }

    const landmarksFromApi = await findPopularPlaces(city, country)

    const x = landmarksFromApi.map(async (landmark) => {
        const geoResults = await aroundme.geoCode(landmark.location);
        if (Either.isRight(geoResults)) {
            const geo = geoResults.right

            const landmarkModel = await createLandMark(
                {
                    name: landmark.name,
                    city: geo.city,
                    address: geo.formattedAddress,
                    country: geo.country,
                    latitude: geo.latLng[0],
                    longitude: geo.latLng[1]
                }
            )

            return landmarkModel
        }
    })

    const landmarksFromApiWithGeo = await Promise.all(x)

    return landmarksFromApiWithGeo.filter((x) => x !== undefined) as LandMark[]
}