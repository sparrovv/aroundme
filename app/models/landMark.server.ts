import { type LandMark } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getLandMarkById(id: LandMark["id"]) {
  return prisma.landMark.findUnique({ where: { id } });
}

export async function getLandMarksByCityAndCountry(
  city: LandMark["city"],
  country: LandMark["country"],
) {
  return prisma.landMark.findMany({ where: { city, country } });
}

export async function getLandMarks() {
  return prisma.landMark.findMany();
}

export async function getLandMarksByIds(ids: LandMark["id"][]) {
  return prisma.landMark.findMany({ where: { id: { in: ids } } });
}


export async function createLandMark(landMark: {
  name: LandMark["name"];
  city: LandMark["city"];
  address: LandMark["address"];
  country: LandMark["country"];
  latitude: LandMark["latitude"];
  longitude: LandMark["longitude"];
}): Promise<LandMark> {
  return prisma.landMark.create({ data: landMark });
}
