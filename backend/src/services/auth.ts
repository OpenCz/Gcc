import { SignJWT, jwtVerify } from "jose";
import { prisma } from "../utils/prisma";

const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!;
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET!;
const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI!;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const AUTHORITY = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`;

export const authService = {
  getLoginUrl: () => {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri:  REDIRECT_URI,
      scope: "openid profile email User.Read",
      response_mode: "query",
    });
    return `${AUTHORITY}/oauth2/v2.0/authorize?${params}`;
  },

  handleCallback: async (code: string) => {
    const tokenRes = await fetch(`${AUTHORITY}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) throw new Error("Token exchange failed");
    const tokens = await tokenRes.json() as { access_token: string };

    //getter de user profile du microsoft graph
    const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileRes.ok) throw new Error("Failed to fetch user profile");
    const profile = await profileRes.json() as {
      mail?: string;
      userPrincipalName?: string;
      displayName?: string;
    };
    const email = (profile.mail ?? profile.userPrincipalName ?? "").toLowerCase();
    if (!email) throw new Error("No email in Microsoft profile");
    //debug
    console.log("Microsoft auth success:", true, "| email:", email, "| name:", profile.displayName);

    // Check whitelist user relation prisma
    const whitelisted = await prisma.whitelist.findFirst({ where: { user: { email } }, include: { user: true } });
    if (!whitelisted) throw new Error("Unauthorized: email not in whitelist");

    //update name
    const user = await prisma.user.update({
      where: { email },
      data: { name: profile.displayName ?? whitelisted.user.name ?? email },
    });

    // issue JWT
    const token = await new SignJWT({ userId: user.id, role: user.role, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  },

  verifyToken: async (token: string) => {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: number; role: string; email: string };
  },
};
