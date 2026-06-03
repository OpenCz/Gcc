import Elysia from "elysia";
import { authService } from "../services/auth";

export const mantaAuth = new Elysia({ name: "mantaAuth" })
  .derive({ as: "scoped" }, async ({ cookie, set }) => {
    const raw = cookie["gcc_token"]?.value as string | undefined;
    if (!raw) {
      set.status = 401;
      throw new Error("Unauthorized");
    }
    let payload: { userId: number; role: string; email: string };
    try {
      payload = await authService.verifyToken(raw);
    } catch {
      set.status = 401;
      throw new Error("Invalid token");
    }
    if (payload.role !== "MANTA" && payload.role !== "PEDA") {
      set.status = 403;
      throw new Error("Forbidden");
    }
    return { user: payload };
  });
