import { prisma } from "../utils/prisma";

export const folderModel = {
  findAll: () =>
    prisma.folder.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { subjects: true } } },
    }),

  create: (name: string) =>
    prisma.folder.create({ data: { name } }),

  rename: (id: number, name: string) =>
    prisma.folder.update({ where: { id }, data: { name } }),

  delete: (id: number) =>
    prisma.folder.delete({ where: { id } }),
};
