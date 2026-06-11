import type { Difficulty } from "@prisma/client";

export interface SubjectCreateData {
  name: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  files: string[];
  url?: string;
  proposed?: boolean;
}

export interface SubjectServiceInput {
  name: string;
  description: string;
  difficulty: string;
  tags: string;
  url?: string;
  file?: File;
}

export interface SubjectProposeInput {
  name: string;
  description?: string;
  difficulty: string;
  tags?: string;
  url?: string;
  file?: File;
}
