import { SignJWT, jwtVerify } from "jose";
import { prisma } from "../utils/prisma";
import { microsoftOAuth } from "../utils/microsoftOAuth";
import type { JwtPayload, AuthUser } from "../types/auth";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export const authService = {
  getLoginUrl: () => microsoftOAuth.getAuthorizeUrl(),

  handleCallback: async (code: string): Promise<{ token: string; user: AuthUser }> => {
    const { email, displayName } = await microsoftOAuth.exchangeCode(code);

    const whitelisted = await prisma.whitelist.findFirst({ where: { user: { email } }, include: { user: true } });
    if (!whitelisted) throw new Error("Unauthorized: email not in whitelist");

    const user = await prisma.user.update({
      where: { email },
      data: { name: displayName ?? whitelisted.user.name ?? email },
    });

    const token = await new SignJWT({ userId: user.id, role: user.role, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  },

  verifyToken: async (token: string): Promise<JwtPayload> => {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  },
};
