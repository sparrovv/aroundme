import { type Listing } from "@prisma/client";

import { prisma } from "~/db.server";
export type { Location } from "@prisma/client";

export async function getListingById(id: Listing["id"]) {
  return prisma.listing.findUnique({ where: { id } });
}

export async function getListings() {
  return prisma.listing.findMany();
}

export async function createListingFromAddressListing(
  name: Listing["name"],
  locationId: Listing["locationId"],
  pois: Listing["pois"],
  landmarks: Listing["landmarks"],
) {
  return prisma.listing.create({
    data: {
      name,
      locationId,
      pois,
      landmarks,
    },
  });
}

export async function deleteListingByName(name: Listing["name"]) {
  return prisma.listing.deleteMany({ where: { name } });
}

export async function deleteListing(id: Listing["id"]) {
  return prisma.listing.delete({ where: { id } });
}
