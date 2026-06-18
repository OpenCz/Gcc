import type { Subject } from "../../config";

export type Tab = "subjects" | "propose" | "events";
export type Difficulty = "Débutant" | "Intermédiaire" | "Avancé";

export const DIFF_COLORS: Record<Difficulty, string> = {
  "Débutant": "var(--epi-beginner)",
  "Intermédiaire": "var(--epi-intermediate)",
  "Avancé": "var(--epi-advanced)",
};

export interface SubjectWithVisible extends Subject {
  id: number;
  visible: boolean;
}

export interface EventData {
  id: number;
  name: string;
  description: string | null;
  lieu: string;
  date: string;
  capacity: number;
  registeredCount: number;
  isRegistered: boolean;
}
