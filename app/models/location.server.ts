import { Prisma, type Location } from "@prisma/client";

import { prisma } from "~/db.server";
import { LocationAddress } from "~/lib/aroundme/types";
export type { Location } from "@prisma/client";

export async function getLocationById(id: Location["id"]) {
  return prisma.location.findUnique({ where: { id } });
}

export async function getLocationByName(name: Location["name"]) {
  return prisma.location.findFirst({ where: { name } });
}

export async function createLocationFromAddressLocation(
  addressLocation: LocationAddress,
) {
  const addressComponentsAsJsonArray = addressLocation.addressComponents
    ? (addressLocation.addressComponents as unknown as Prisma.JsonArray)
    : Prisma.JsonNull;

  return prisma.location.create({
    data: {
      name: addressLocation.inputAddress,
      formattedAddress: addressLocation.formattedAddress,
      latitude: addressLocation.latLng[0],
      longitude: addressLocation.latLng[1],
      addressComponents: addressComponentsAsJsonArray,
      city: addressLocation.city,
      country: addressLocation.country,
    },
  });
}

// export async function createLocation(name: Location["name"]) {
//   return prisma.location.create({
//     data: {
//       name,
//     },
//   });
// }

export async function deleteLocationByName(name: Location["name"]) {
  return prisma.location.deleteMany({ where: { name } });
}

export async function deleteLocation(id: Location["id"]) {
  return prisma.location.delete({ where: { id } });
}
