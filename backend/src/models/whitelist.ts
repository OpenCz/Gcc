import { prisma } from "../utils/prisma";
import type { Role } from "@prisma/client";

export const whitelistModel = {
  findAll: () =>
    prisma.whitelist.findMany({ orderBy: { email: "asc" } }),

  findByEmail: (email: string) =>
    prisma.whitelist.findUnique({ where: { email } }),

  upsert: (email: string, role: Role) =>
    prisma.whitelist.upsert({
      where: { email },
      create: { email, role },
      update: { role },
    }),

  delete: (id: number) =>
    prisma.whitelist.delete({ where: { id } }),
};
