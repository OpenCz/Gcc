import Elysia, { t } from "elysia";
import { mantaAuth } from "../utils/mantaAuth";
import { subjectService } from "../services/subject";

export const mantaRoutes = new Elysia({ prefix: "/manta" })
  .use(mantaAuth)
  .get("/subjects", async () => {
    const subjects = await subjectService.getAll();
    return { subjects };
  })
  .patch("/subjects/:id", async ({ params, body, set }) => {
    const id = Number(params.id);
    if (isNaN(id)) { set.status = 400; return { message: "Invalid id" }; }
    const subject = await subjectService.setVisible(id, body.visible);
    return { subject };
  }, {
    body: t.Object({ visible: t.Boolean() }),
  });
