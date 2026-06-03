import { prisma } from "../utils/prisma";
import type { Difficulty } from "@prisma/client";

export const subjectModel = {
  create: (data: {
    name: string;
    description: string;
    difficulty: Difficulty;
    tags: string[];
    files: string[];
  }) =>
    prisma.subject.create({ data }),

  findAllVisible: () =>
    prisma.subject.findMany({ where: { visible: true }, orderBy: { createdAt: "desc" } }),

  findAll: () =>
    prisma.subject.findMany({ orderBy: { createdAt: "desc" } }),

  findById: (id: number) =>
    prisma.subject.findUnique({ where: { id } }),

  setVisible: (id: number, visible: boolean) =>
    prisma.subject.update({ where: { id }, data: { visible } }),
};
