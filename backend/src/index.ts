import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { adminRoutes } from "./routes/admin";

const app = new Elysia()
  .use(cors())
  .get("/", () => ({ status: "ok" }))
  .use(adminRoutes)
  .listen(8080);

console.log(`Backend running on http://localhost:${app.server?.port}`);
