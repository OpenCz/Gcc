export interface Subject {
  name: string;
  description: string;
  files: string[];
  difficulty: "Débutant" | "Intermédiaire" | "Avancé";
  tags: string[];
  url?: string;
  isNew?: boolean;
}

export interface Session {
  title: string;
  date: string;
  location: string;
  description: string;
}

export const session: Session = {
  title: "Coding Club",
  date: "Samedi 8 Mars 2026",
  location: "Epitech — Le Hub",
  description: "Bienvenue au Coding Club ! Retrouvez ici les ressources et sujets de la session.",
};
