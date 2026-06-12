import Elysia, { t } from "elysia";
import { adminAuth } from "../middlewares/adminAuth";
import { subjectService } from "../services/subject";
import { eventService } from "../services/event";
import { whitelistModel } from "../models/whitelist";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(adminAuth)
  .post(
    "/subjects",
    async ({ body }) => {
      const data = body as Record<string, unknown>;
      const file = data["file"];
      const subject = await subjectService.create({
        name: String(data["name"] ?? ""),
        description: String(data["description"] ?? ""),
        difficulty: String(data["difficulty"] ?? ""),
        tags: String(data["tags"] ?? ""),
        url: data["url"] ? String(data["url"]) : undefined,
        file: file instanceof File ? file : undefined,
      });
      return { success: true, subject };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        difficulty: t.Union([
          t.Literal("Débutant"),
          t.Literal("Intermédiaire"),
          t.Literal("Avancé"),
        ]),
        tags: t.Optional(t.String()),
        url: t.Optional(t.String()),
        file: t.Optional(t.Any()),
      }),
    }
  )
  .get("/subjects", async () => {
    const subjects = await subjectService.getAll();
    return { subjects };
  })
  .get("/subjects/proposed", async () => {
    const subjects = await subjectService.getProposed();
    return { subjects };
  })
  .patch("/subjects/:id", async ({ body, params, set }) => {
    const id = Number(params.id);
    if (isNaN(id)) { set.status = 400; return { message: "Invalid id" }; }
    const data = body as Record<string, unknown>;
    const file = data["file"];
    const existingFiles = data["existingFiles"] ? String(data["existingFiles"]).split(",").filter(Boolean) : [];
    const subject = await subjectService.update(id, {
      name: String(data["name"] ?? ""),
      description: String(data["description"] ?? ""),
      difficulty: String(data["difficulty"] ?? ""),
      tags: String(data["tags"] ?? ""),
      url: data["url"] ? String(data["url"]) : undefined,
      file: file instanceof File ? file : undefined,
      existingFiles,
    });
    return { success: true, subject };
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      description: t.Optional(t.String()),
      difficulty: t.Union([t.Literal("Débutant"), t.Literal("Intermédiaire"), t.Literal("Avancé")]),
      tags: t.Optional(t.String()),
      url: t.Optional(t.String()),
      existingFiles: t.Optional(t.String()),
      file: t.Optional(t.Any()),
    }),
  })
  .patch("/subjects/:id/visible", async ({ params, body, set }) => {
    const id = Number(params.id);
    if (isNaN(id)) { set.status = 400; return { message: "Invalid id" }; }
    await subjectService.setVisible(id, body.visible);
    return { success: true };
  }, {
    body: t.Object({ visible: t.Boolean() }),
  })
  .post("/subjects/:id/approve", async ({ params, set }) => {
    const id = Number(params.id);
    if (isNaN(id)) { set.status = 400; return { message: "Invalid id" }; }
    await subjectService.approveProposal(id);
    return { success: true };
  })
  .post("/subjects/:id/reject", async ({ params, body, set }) => {
    const id = Number(params.id);
    if (isNaN(id)) { set.status = 400; return { message: "Invalid id" }; }
    await subjectService.rejectProposal(id, body.reason);
    return { success: true };
  }, {
    body: t.Object({ reason: t.String({ minLength: 1 }) }),
  })
  .get("/whitelist", async () => {
    const whitelist = await whitelistModel.findAll();
    return { whitelist };
  })
  .post("/whitelist", async ({ body }) => {
    const entry = await whitelistModel.upsert(body.email, body.role);
    return { entry };
  }, {
    body: t.Object({
      email: t.String({ minLength: 1 }),
      role: t.Union([t.Literal("MANTA"), t.Literal("PEDA")]),
    }),
  })
  .delete("/whitelist/:id", async ({ params, set }) => {
    const id = Number(params.id);
    if (isNaN(id)) { set.status = 400; return { message: "Invalid id" }; }
    await whitelistModel.delete(id);
    return { success: true };
  })
  .post("/events", async ({ body }) => {
    const event = await eventService.create({
      name: body.name,
      description: body.description,
      lieu: body.lieu,
      date: new Date(body.date),
      capacity: body.capacity,
    });
    return { success: true, event };
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      description: t.Optional(t.String()),
      lieu: t.String({ minLength: 1 }),
      date: t.String(),
      capacity: t.Number({ minimum: 1 }),
    }),
  });
