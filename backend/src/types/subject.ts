import type { Difficulty } from "@prisma/client";

export interface SubjectCreateData {
  name: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  files: string[];
  urls: string[];
  proposed?: boolean;
}

export interface SubjectServiceInput {
  name: string;
  description: string;
  difficulty: string;
  tags: string;
  urls?: string;
  newFiles?: File[];
}

export interface SubjectProposeInput {
  name: string;
  description?: string;
  difficulty: string;
  tags?: string;
  urls?: string;
  newFiles?: File[];
}
