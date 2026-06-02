import Elysia, { t } from "elysia";
import { adminAuth } from "../utils/adminAuth";
import { subjectService } from "../services/subject";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(adminAuth)
  .post(
    "/subjects",
    async ({ body }) => {
      const subject = await subjectService.create(body);
      return { success: true, subject };
    },
    {
      body: t.Object({
        name:        t.String({ minLength: 1 }),
        description: t.String(),
        difficulty:  t.Union([
          t.Literal("Débutant"),
          t.Literal("Intermédiaire"),
          t.Literal("Avancé"),
        ]),
        tags: t.String(),
        file: t.File({ type: "application/pdf" }),
      }),
    }
  )
  .get("/subjects", async () => {
    const subjects = await subjectService.getAll();
    return { subjects };
  });
