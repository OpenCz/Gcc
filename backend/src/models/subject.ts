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

  findAll: () =>
    prisma.subject.findMany({ orderBy: { createdAt: "desc" } }),

  findById: (id: number) =>
    prisma.subject.findUnique({ where: { id } }),
};
