import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(cors())
  .get("/", () => ({ status: "ok" }))
  .listen(8080);

console.log(`Backend running on http://localhost:${app.server?.port}`);
