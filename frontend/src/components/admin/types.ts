import type { Subject } from "../../config";

export type AdminTab = "subjects" | "add-subject" | "suggestions" | "whitelist";
export type Difficulty = "Débutant" | "Intermédiaire" | "Avancé";

export const DIFF_COLORS: Record<Difficulty, string> = {
  "Débutant": "var(--epi-beginner)",
  "Intermédiaire": "var(--epi-intermediate)",
  "Avancé": "var(--epi-advanced)",
};

export interface AdminSubject extends Subject {
  id: number;
  visible: boolean;
  pinned: boolean;
  folderId: number | null;
}

export interface Folder {
  id: number;
  name: string;
  _count: { subjects: number };
}

export interface ProposedSubject extends Subject {
  id: number;
  visible: boolean;
  proposed: boolean;
}

export type WhitelistEntry = { id: number; email: string; role: "MANTA" | "PEDA" };
