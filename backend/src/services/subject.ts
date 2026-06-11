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

export const subjectService = {
  create: async (data: SubjectServiceInput) => {
    const difficulty = DIFFICULTY_MAP[data.difficulty];
    if (!difficulty) throw new Error(`Difficulté invalide: ${data.difficulty}`);

    const tags = data.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    let files: string[] = [];
    if (data.file) {
      const fileName = data.file.name.replace(/[\\/]/g, "_");
      if (!fileName.toLowerCase().endsWith(".pdf"))
        throw new Error("Only PDF files are allowed");
      const buffer = Buffer.from(await data.file.arrayBuffer());
      await writeFile(join(UPLOADS_DIR, fileName), buffer);
      files = [fileName];
    }

    return subjectModel.create({
      name: data.name,
      description: data.description,
      difficulty,
      tags,
      files,
      url: data.url,
    });
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

    const tags = (data.tags ?? "")
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    let files: string[] = [];
    if (data.file) {
      const fileName = data.file.name.replace(/[\\/]/g, "_");
      if (!fileName.toLowerCase().endsWith(".pdf"))
        throw new Error("Only PDF files are allowed");
      const buffer = Buffer.from(await data.file.arrayBuffer());
      await writeFile(join(UPLOADS_DIR, fileName), buffer);
      files = [fileName];
    }

    return subjectModel.create({
      name: data.name,
      description: data.description ?? "",
      difficulty,
      tags,
      files,
      url: data.url,
      proposed: true,
    });
  },

  getProposed: async () => {
    const rows = await subjectModel.findProposed();
    return rows.map(s => ({ ...s, difficulty: DIFFICULTY_LABEL[s.difficulty] }));
  },

  approveProposal: (id: number) => subjectModel.approve(id),

  rejectProposal: (id: number, reason: string) => subjectModel.reject(id, reason),

  cancelProposal: (id: number) => subjectModel.deleteById(id),

  getRejectedProposals: async () => {
    const rows = await subjectModel.findRejected();
    return rows.map(s => ({ ...s, difficulty: DIFFICULTY_LABEL[s.difficulty] }));
  },

  update: async (id: number, data: SubjectServiceInput & { existingFiles?: string[] }) => {
    const difficulty = DIFFICULTY_MAP[data.difficulty];
    if (!difficulty) throw new Error(`Difficulté invalide: ${data.difficulty}`);

    const tags = data.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    let files = data.existingFiles ?? [];
    if (data.file) {
      const fileName = data.file.name.replace(/[\\/]/g, "_");
      if (!fileName.toLowerCase().endsWith(".pdf"))
        throw new Error("Only PDF files are allowed");
      const buffer = Buffer.from(await data.file.arrayBuffer());
      await writeFile(join(UPLOADS_DIR, fileName), buffer);
      files = [fileName];
    }

    return subjectModel.update(id, {
      name: data.name,
      description: data.description,
      difficulty,
      tags,
      files,
      url: data.url ?? null,
    });
  },

  setVisible: (id: number, visible: boolean) =>
    subjectModel.setVisible(id, visible),
};
