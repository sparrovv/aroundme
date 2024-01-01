import type { Location } from "@prisma/client";

import { prisma } from "~/db.server";
export type { Location } from "@prisma/client";

export async function getLocationById(id: Location["id"]) {
  return prisma.location.findUnique({ where: { id } });
}

export async function getLocationByName(name: Location["name"]) {
  return prisma.location.findFirst({ where: { name } });
}

export async function createLocation(name: Location["name"]) {
  return prisma.location.create({
    data: {
      name,
    },
  });
}

export async function deleteLocationByName(name: Location["name"]) {
  return prisma.location.deleteMany({ where: { name } });
}

export async function deleteLocation(id: Location["id"]) {
  return prisma.location.delete({ where: { id } });
}
