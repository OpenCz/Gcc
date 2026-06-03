import { Elysia } from "elysia";
import { authService } from "../services/auth";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:6767";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .get("/login", ({ redirect }) => {
    return redirect(authService.getLoginUrl());
  })
  .get("/callback", async ({ query, redirect, set }) => {
    const code = query["code"];
    const error = query["error"];
    const errorDescription = query["error_description"];

    if (error) {
      set.status = 400;
      return { error, error_description: errorDescription };
    }

    if (!code) {
      set.status = 400;
      return { message: "Missing code", received_params: Object.keys(query) };
    }
    try {
      const { token } = await authService.handleCallback(code);
      return redirect(`${FRONTEND_URL}/manta?token=${token}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Auth error";
      return redirect(`${FRONTEND_URL}/?error=${encodeURIComponent(msg)}`);
    }
  })
  .get("/me", async ({ headers, set }) => {
    const raw = headers["authorization"]?.replace("Bearer ", "");
    if (!raw) {
        set.status = 401;
        return { message: "Unauthorized" };
    }
    try {
      const payload = await authService.verifyToken(raw);
      return { user: payload };
    } catch {
      set.status = 401;
      return { message: "Invalid token" };
    }
  });
