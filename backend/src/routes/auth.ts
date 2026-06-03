import { Elysia } from "elysia";
import { authService } from "../services/auth";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:6767";
const IS_PROD = process.env.NODE_ENV === "production";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .get("/login", ({ redirect }) => {
    return redirect(authService.getLoginUrl());
  })
  .get("/callback", async ({ query, redirect, set, cookie }) => {
    const code = query["code"];
    const error = query["error"];
    const errorDescription = query["error_description"];

    if (error) {
      set.status = 400;
      return { error, error_description: errorDescription };
    }
    if (!code) {
      set.status = 400;
      return { message: "Missing code" };
    }
    try {
      const { token } = await authService.handleCallback(code);
      cookie["gcc_token"].set({
        value: token,
        httpOnly: true,
        secure: IS_PROD,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return redirect(`${FRONTEND_URL}/manta`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Auth error";
      return redirect(`${FRONTEND_URL}/?error=${encodeURIComponent(msg)}`);
    }
  })
  .get("/me", async ({ cookie, set }) => {
    const raw = cookie["gcc_token"]?.value as string | undefined;
    if (!raw) { set.status = 401; return { message: "Unauthorized" }; }
    try {
      const payload = await authService.verifyToken(raw);
      return { user: payload };
    } catch {
      set.status = 401;
      return { message: "Invalid token" };
    }
  })
  .get("/logout", ({ cookie, redirect }) => {
    cookie["gcc_token"].remove();
    return redirect(`${FRONTEND_URL}/`);
  });
