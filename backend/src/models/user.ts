import { prisma } from "../utils/prisma"

export const userModel = {
    findByEmail: (email: string) => prisma.user.findUnique({ where: {email} }),

    findAll: () => prisma.user.findMany(),
};
