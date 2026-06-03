import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";
import { mantaRoutes } from "./routes/manta";
import { subjectService } from "./services/subject";
import { basename, join } from "path";
import { readFile } from "fs/promises";

const UPLOADS_DIR = join(import.meta.dir, "../uploads");
const app = new Elysia()
  .use(cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:6767",
    credentials: true,
  }))
  .get("/", () => ({ status: "ok" }))
  .get("/subjects", async () => {
    const subjects = await subjectService.getVisible();
    return { subjects };
  })
  .get("/uploads/:filename", async ({ params, set }) => {
    const filename = basename(params.filename);
    if (filename !== params.filename || !filename.toLowerCase().endsWith(".pdf")) {
      set.status = 400;
      return {message: "Invalid filename"}
    }
    try {
      const buf = await readFile(join(UPLOADS_DIR, filename));
      return new Response(buf, {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${filename}"` },
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
