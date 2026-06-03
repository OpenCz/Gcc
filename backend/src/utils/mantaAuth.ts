import Elysia from "elysia";
import { authService } from "../services/auth";

export const mantaAuth = new Elysia({ name: "mantaAuth" })
  .derive({ as: "scoped" }, async ({ headers, set }) => {
    const raw = headers["authorization"]?.replace("Bearer ", "");
    if (!raw) {
      set.status = 401;
      throw new Error("Unauthorized");
    }

    const payload = await authService.verifyToken(raw);
    if (payload.role !== "MANTA" && payload.role !== "PEDA") {
      set.status = 403;
      throw new Error("Forbidden");
    }
    return { user: payload };
  });
