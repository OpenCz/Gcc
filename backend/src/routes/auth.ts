import { Elysia } from "elysia";
import { authService } from "../services/auth";

export const authRoutes = new Elysia({ prefix: "/auth" }).post("/login", async ({ body }) => {
    return authService.login(body.email, body.password);
});

