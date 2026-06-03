import type { Difficulty } from "@prisma/client";
import { subjectModel } from "../models/subject";
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
  create: async (data: {
    name: string;
    description: string;
    difficulty: string;
    tags: string;
    file: File;
  }) => {
    const difficulty = DIFFICULTY_MAP[data.difficulty];
    if (!difficulty) throw new Error(`Difficulté invalide: ${data.difficulty}`);

    const tags = data.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    const fileName = `${Date.now()}-${data.file.name}`;
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

  setVisible: (id: number, visible: boolean) =>
    subjectModel.setVisible(id, visible),
};
