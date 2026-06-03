import type { Difficulty } from "@prisma/client";

export interface SubjectCreateData {
  name: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  files: string[];
}

export interface SubjectServiceInput {
  name: string;
  description: string;
  difficulty: string;
  tags: string;
  file: File;
}

export interface SubjectProposeInput {
  name: string;
  description?: string;
  difficulty: string;
  tags?: string;
  file?: File;
}
