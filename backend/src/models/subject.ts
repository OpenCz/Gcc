import { prisma } from "../utils/prisma";
import type { SubjectCreateData } from "../types/subject";

export const subjectModel = {
  create: (data: SubjectCreateData) =>
    prisma.subject.create({ data }),

  findAllVisible: () =>
    prisma.subject.findMany({ where: { visible: true, proposed: false, rejected: false }, orderBy: { createdAt: "desc" } }),

  findAll: () =>
    prisma.subject.findMany({ where: { proposed: false, rejected: false }, orderBy: { createdAt: "desc" } }),

  findProposed: () =>
    prisma.subject.findMany({ where: { proposed: true, rejected: false }, orderBy: { createdAt: "desc" } }),

  findRejected: () =>
    prisma.subject.findMany({ where: { rejected: true }, orderBy: { updatedAt: "desc" } }),

  findById: (id: number) =>
    prisma.subject.findUnique({ where: { id } }),

  setVisible: (id: number, visible: boolean) =>
    prisma.subject.update({ where: { id }, data: { visible } }),

  approve: (id: number) =>
    prisma.subject.update({ where: { id }, data: { proposed: false } }),

  reject: (id: number, reason: string) =>
    prisma.subject.update({ where: { id }, data: { proposed: false, rejected: true, rejectionReason: reason } }),

  deleteById: (id: number) =>
    prisma.subject.delete({ where: { id } }),
};
