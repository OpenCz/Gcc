import Elysia, { t } from "elysia";
import { subjectService } from "../services/subject";
import { eventService } from "../services/event";
import { whitelistModel } from "../models/whitelist";
import { folderModel } from "../models/folder";
import { verifyAdminToken } from "../lib/adminJwt";

// formData envoie folderId en str : "" = racine (null), absent = ne pas modif
function parseFolderId(raw: unknown): number | null | undefined {
  if (raw === undefined) return undefined;
  const s = String(raw);
  if (s === "") return null;
  const n = Number(s);
  return isNaN(n) ? undefined : n;
}

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .onBeforeHandle(async ({ headers }) => {
    const token = headers["authorization"]?.replace("Bearer ", "");
    if (!token || !(await verifyAdminToken(token)))
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
  })
  .post(
    "/subjects",
    async ({ body }) => {
      const data = body as Record<string, unknown>;
      const raw = data["file"];
      const newFiles = Array.isArray(raw) ? raw.filter((f): f is File => f instanceof File) : raw instanceof File ? [raw] : [];
      const subject = await subjectService.create({
        name: String(data["name"] ?? ""),
        description: String(data["description"] ?? ""),
        difficulty: String(data["difficulty"] ?? ""),
        tags: String(data["tags"] ?? ""),
        urls: data["urls"] ? String(data["urls"]) : undefined,
        newFiles,
        folderId: parseFolderId(data["folderId"]),
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
        urls: t.Optional(t.String()),
        folderId: t.Optional(t.String()),
        file: t.Optional(t.Any()),
      }),
    }
  )
  .get("/folders", async () => {
    const folders = await folderModel.findAll();
    return { folders };
  })
  .post("/folders", async ({ body }) => {
    const folder = await folderModel.create(body.name.trim());
    return { success: true, folder };
  }, {
    body: t.Object({ name: t.String({ minLength: 1 }) }),
  })
  .patch("/folders/:id", async ({ params, body, set }) => {
    const id = Number(params.id);
    if (isNaN(id)) { set.status = 400; return { message: "Invalid id" }; }
    const folder = await folderModel.rename(id, body.name.trim());
    return { success: true, folder };
  }, {
    body: t.Object({ name: t.String({ minLength: 1 }) }),
  })
  .delete("/folders/:id", async ({ params, set }) => {
    const id = Number(params.id);
    if (isNaN(id)) { set.status = 400; return { message: "Invalid id" }; }
    await folderModel.delete(id);
    return { success: true };
  })
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
    const raw = data["file"];
    const newFiles = Array.isArray(raw) ? raw.filter((f): f is File => f instanceof File) : raw instanceof File ? [raw] : [];
    const existingFiles = data["existingFiles"] ? String(data["existingFiles"]).split(",").filter(Boolean) : [];
    const subject = await subjectService.update(id, {
      name: String(data["name"] ?? ""),
      description: String(data["description"] ?? ""),
      difficulty: String(data["difficulty"] ?? ""),
      tags: String(data["tags"] ?? ""),
      urls: data["urls"] ? String(data["urls"]) : undefined,
      newFiles,
      existingFiles,
      folderId: parseFolderId(data["folderId"]),
    });
    return { success: true, subject };
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      description: t.Optional(t.String()),
      difficulty: t.Union([t.Literal("Débutant"), t.Literal("Intermédiaire"), t.Literal("Avancé")]),
      tags: t.Optional(t.String()),
      urls: t.Optional(t.String()),
      existingFiles: t.Optional(t.String()),
      folderId: t.Optional(t.String()),
      file: t.Optional(t.Any()),
    }),
  })
  .patch("/subjects/visible-all", async ({ body }) => {
    await subjectService.setAllVisible(body.visible);
    return { success: true };
  }, {
    body: t.Object({ visible: t.Boolean() }),
  })
  .patch("/subjects/:id/visible", async ({ params, body, set }) => {
    const id = Number(params.id);
    if (isNaN(id)) { set.status = 400; return { message: "Invalid id" }; }
    await subjectService.setVisible(id, body.visible);
    return { success: true };
  }, {
    body: t.Object({ visible: t.Boolean() }),
  })
  .patch("/subjects/:id/pinned", async ({ params, body, set }) => {
    const id = Number(params.id);
    if (isNaN(id)) { set.status = 400; return { message: "Invalid id" }; }
    await subjectService.setPinned(id, body.pinned);
    return { success: true };
  }, {
    body: t.Object({ pinned: t.Boolean() }),
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
