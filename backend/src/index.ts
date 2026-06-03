import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";
import { mantaRoutes } from "./routes/manta";
import { subjectService } from "./services/subject";
import { join } from "path";
import { readFile } from "fs/promises";

const UPLOADS_DIR = join(import.meta.dir, "../uploads");

const app = new Elysia()
  .use(cors())
  .get("/", () => ({ status: "ok" }))
  .get("/subjects", async () => {
    const subjects = await subjectService.getVisible();
    return { subjects };
  })
  .get("/uploads/:filename", async ({ params, set }) => {
    try {
      const buf = await readFile(join(UPLOADS_DIR, params.filename));
      return new Response(buf, {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${params.filename}"` },
      });
    } catch {
      set.status = 404;
      return { message: "File not found" };
    }
  })
  .use(adminRoutes)
  .use(authRoutes)
  .use(mantaRoutes)
  .listen(8080);

console.log(`Backend running on http://localhost:${app.server?.port}`);
