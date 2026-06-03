import { prisma } from "../utils/prisma";
import type { SubjectCreateData } from "../types/subject";

export const subjectModel = {
  create: (data: SubjectCreateData) =>
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
