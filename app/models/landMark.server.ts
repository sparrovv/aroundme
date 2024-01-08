import { type LandMark } from "@prisma/client";
import { as } from "effect/Exit";

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
