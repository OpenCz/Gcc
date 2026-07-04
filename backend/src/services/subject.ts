import type { Difficulty } from "@prisma/client";
import { subjectModel } from "../models/subject";
import type { SubjectServiceInput, SubjectProposeInput } from "../types/subject";
import { writeFile } from "fs/promises";
import { join } from "path";

const DIFFICULTY_MAP: Record<string, Difficulty> = {
  "Débutant": "BEGINNER",
  "Intermédiaire": "INTERMEDIATE",
  "Avancé": "ADVANCED",
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
};

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? join(import.meta.dir, "../../uploads");

const ALLOWED_EXTENSIONS = new Set([".pdf", ".png", ".jpg", ".jpeg", ".md"]);

async function saveFiles(files: File[]): Promise<string[]> {
  const saved: string[] = [];
  for (const f of files) {
    const fileName = f.name.replace(/[\\/]/g, "_");
    const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext))
      throw new Error(`Type de fichier non autorisé : ${ext}`);
    const buffer = Buffer.from(await f.arrayBuffer());
    await writeFile(join(UPLOADS_DIR, fileName), buffer);
    saved.push(fileName);
  }
  return saved;
}

export const subjectService = {
  create: async (data: SubjectServiceInput) => {
    const difficulty = DIFFICULTY_MAP[data.difficulty];
    if (!difficulty) throw new Error(`Difficulté invalide: ${data.difficulty}`);

    const tags = data.tags.split(",").map(t => t.trim()).filter(Boolean);
    const urls = (data.urls ?? "").split("\n").map(u => u.trim()).filter(Boolean);
    const files = await saveFiles(data.newFiles ?? []);

    return subjectModel.create({ name: data.name, description: data.description, difficulty, tags, files, urls, folderId: data.folderId ?? null });
  },

  getVisible: async () => {
    const rows = await subjectModel.findAllVisible();
    return rows.map(s => ({ ...s, difficulty: DIFFICULTY_LABEL[s.difficulty] }));
  },

  getAll: async () => {
    const rows = await subjectModel.findAll();
    return rows.map(s => ({ ...s, difficulty: DIFFICULTY_LABEL[s.difficulty] }));
  },

  propose: async (data: SubjectProposeInput) => {
    const difficulty = DIFFICULTY_MAP[data.difficulty];
    if (!difficulty) throw new Error(`Difficulté invalide: ${data.difficulty}`);

    const tags = (data.tags ?? "").split(",").map(t => t.trim()).filter(Boolean);
    const urls = (data.urls ?? "").split("\n").map(u => u.trim()).filter(Boolean);
    const files = await saveFiles(data.newFiles ?? []);

    return subjectModel.create({
      name: data.name,
      description: data.description ?? "",
      difficulty, tags, files, urls, proposed: true,
    });
  },

  getProposed: async () => {
    const rows = await subjectModel.findProposed();
    return rows.map(s => ({ ...s, difficulty: DIFFICULTY_LABEL[s.difficulty] }));
  },

  approveProposal: (id: number) => subjectModel.approve(id),

  rejectProposal: (id: number, reason: string) => subjectModel.reject(id, reason),

  cancelProposal: async (id: number) => {
    const s = await subjectModel.findById(id);
    if (!s || !s.proposed || s.rejected) throw new Error("Subject is not a pending proposal");
    return subjectModel.deleteById(id);
  },

  getRejectedProposals: async () => {
    const rows = await subjectModel.findRejected();
    return rows.map(s => ({ ...s, difficulty: DIFFICULTY_LABEL[s.difficulty] }));
  },

  update: async (id: number, data: SubjectServiceInput & { existingFiles?: string[] }) => {
    const difficulty = DIFFICULTY_MAP[data.difficulty];
    if (!difficulty) throw new Error(`Difficulté invalide: ${data.difficulty}`);

    const tags = data.tags.split(",").map(t => t.trim()).filter(Boolean);
    const urls = (data.urls ?? "").split("\n").map(u => u.trim()).filter(Boolean);
    const newFileNames = await saveFiles(data.newFiles ?? []);
    const files = [...(data.existingFiles ?? []), ...newFileNames];

    return subjectModel.update(id, { name: data.name, description: data.description, difficulty, tags, files, urls, folderId: data.folderId });
  },

  setVisible: (id: number, visible: boolean) =>
    subjectModel.setVisible(id, visible),

  setPinned: (id: number, pinned: boolean) =>
    subjectModel.setPinned(id, pinned),

  getPinned: async () => {
    const rows = await subjectModel.findPinned();
    return rows.map(s => ({ ...s, difficulty: DIFFICULTY_LABEL[s.difficulty] }));
  },
};
