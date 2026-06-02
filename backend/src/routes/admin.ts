import Elysia, { t } from "elysia";
import { adminAuth } from "../utils/adminAuth";
import { subjectService } from "../services/subject";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(adminAuth)
  .post(
    "/subjects",
    async ({ body, set }) => {
      const data = body as Record<string, unknown>;
      const file = data["file"];
      if (!file || !(file instanceof File)) {
        set.status = 400;
        return { message: "Un fichier PDF est requis." };
      }
      const subject = await subjectService.create({
        name:        String(data["name"] ?? ""),
        description: String(data["description"] ?? ""),
        difficulty:  String(data["difficulty"] ?? ""),
        tags:        String(data["tags"] ?? ""),
        file,
      });
      return { success: true, subject };
    },
    {
      body: t.Object({
        name:        t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        difficulty:  t.Union([
          t.Literal("Débutant"),
          t.Literal("Intermédiaire"),
          t.Literal("Avancé"),
        ]),
        tags:  t.Optional(t.String()),
        file:  t.Optional(t.Any()),
      }),
    }
  )
  .get("/subjects", async () => {
    const subjects = await subjectService.getAll();
    return { subjects };
  });
