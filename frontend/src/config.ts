export interface Subject {
  name: string;
  description: string;
  files: string[];
  difficulty: "Débutant" | "Intermédiaire" | "Avancé";
  tags: string[];
  urls: string[];
  isNew?: boolean;
}

export interface Session {
  title: string;
  date: string;
  location: string;
  description: string;
}

const today = new Date();
const dateStr = today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const dateFormatted = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

export const session: Session = {
  title: "Coding Club",
  date: dateFormatted,
  location: "Epitech",
  description: "Bienvenue au Coding Club ! Retrouvez ici les ressources et sujets de la session.",
};
