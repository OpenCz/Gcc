import Elysia, { t } from "elysia";
import { mantaAuth } from "../middlewares/mantaAuth";
import { subjectService } from "../services/subject";
import { eventService } from "../services/event";

const DIFF_LITERALS = t.Union([
  t.Literal("Débutant"),
  t.Literal("Intermédiaire"),
  t.Literal("Avancé"),
]);

export const mantaRoutes = new Elysia({ prefix: "/manta" })
  .use(mantaAuth)
  .get("/subjects", async () => {
    const subjects = await subjectService.getAll();
    return { subjects };
  })
  .get("/subjects/proposed", async () => {
    const subjects = await subjectService.getProposed();
    return { subjects };
  })
  .get("/subjects/rejected", async () => {
    const subjects = await subjectService.getRejectedProposals();
    return { subjects };
  })
  .delete("/subjects/proposed/:id", async ({ params, set }) => {
    const id = Number(params.id);
    if (isNaN(id)) { set.status = 400; return { message: "Invalid id" }; }
    await subjectService.cancelProposal(id);
    return { success: true };
  })
  .patch("/subjects/:id", async ({ params, body, set }) => {
    const id = Number(params.id);
    if (isNaN(id)) { set.status = 400; return { message: "Invalid id" }; }
    const subject = await subjectService.setVisible(id, body.visible);
    return { subject };
  }, {
    body: t.Object({ visible: t.Boolean() }),
  })
  .post("/subjects/propose", async ({ body }) => {
    const data = body as Record<string, unknown>;
    const file = data["file"];
    const subject = await subjectService.propose({
      name: String(data["name"] ?? ""),
      description: String(data["description"] ?? ""),
      difficulty: String(data["difficulty"] ?? ""),
      tags: String(data["tags"] ?? ""),
      file: file instanceof File ? file : undefined,
    });
    return { success: true, subject };
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      description: t.Optional(t.String()),
      difficulty: DIFF_LITERALS,
      tags: t.Optional(t.String()),
      file: t.Optional(t.Any()),
    }),
  })
  .get("/events", async ({ user }) => {
    const events = await eventService.getUpcoming(user.userId);
    return { events };
  })
  .post("/events/:id/register", async ({ params, user, set }) => {
    const eventId = Number(params.id);
    if (isNaN(eventId)) { set.status = 400; return { message: "Invalid id" }; }
    await eventService.register(user.userId, eventId);
    return { success: true };
  })
  .delete("/events/:id/register", async ({ params, user, set }) => {
    const eventId = Number(params.id);
    if (isNaN(eventId)) { set.status = 400; return { message: "Invalid id" }; }
    await eventService.unregister(user.userId, eventId);
    return { success: true };
  });
