import { prisma } from "../utils/prisma";
import type { EventCreateData } from "../types/event";

export const eventModel = {
  findUpcoming: () =>
    prisma.event.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      include: { _count: { select: { manta: true } } },
    }),

  findUserRegistrations: (userId: number, eventIds: number[]) =>
    prisma.manta.findMany({
      where: { userId, eventId: { in: eventIds } },
      select: { eventId: true },
    }),

  findRegistration: (userId: number, eventId: number) =>
    prisma.manta.findFirst({ where: { userId, eventId } }),

  register: (userId: number, eventId: number) =>
    prisma.manta.create({ data: { userId, eventId } }),

  unregister: (userId: number, eventId: number) =>
    prisma.manta.deleteMany({ where: { userId, eventId } }),

  create: (data: EventCreateData) =>
    prisma.event.create({ data }),
};
