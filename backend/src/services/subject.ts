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

const UPLOADS_DIR = join(import.meta.dir, "../../uploads");

export const subjectService = {
  create: async (data: SubjectServiceInput) => {
    const difficulty = DIFFICULTY_MAP[data.difficulty];
    if (!difficulty) throw new Error(`Difficulté invalide: ${data.difficulty}`);

    const tags = data.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    const fileName = data.file.name.replace(/[\\/]/g, "_");
    if ((data.file.type && data.file.type !== "application/pdf") || !fileName.toLowerCase().endsWith(".pdf"))
      throw new Error("Only PDF files are allowed");

    const buffer = Buffer.from(await data.file.arrayBuffer());
    await writeFile(join(UPLOADS_DIR, fileName), buffer);
    return subjectModel.create({
      name: data.name,
      description: data.description,
      difficulty,
      tags,
      files: [fileName],
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
    });
  },

  setVisible: (id: number, visible: boolean) =>
    subjectModel.setVisible(id, visible),
};
