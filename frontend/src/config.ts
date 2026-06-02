export interface Subject {
  name: string
  description: string
  files: string[]
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé'
  tags: string[]
  isNew?: boolean
}

export interface Session {
  title: string
  date: string
  location: string
  description: string
}

export const session: Session = {
  title: 'Coding Club',
  date: 'Samedi 8 Mars 2026',
  location: 'Epitech — Le Hub',
  description: 'Bienvenue au Coding Club ! Retrouvez ici les ressources et sujets de la session.',
}

export const subjects: Subject[] = [
  {
    name: 'Workshop C',
    description: "Workshop d'introduction au langage C. Découvrez les bases de la programmation en C : variables, conditions, boucles, fonctions et pointeurs.",
    files: ['WorkshopC.pdf'],
    difficulty: 'Débutant',
    tags: ['C'],
  },
  {
    name: 'Workshop C++',
    description: "Workshop d'introduction au langage C++. Explorez la programmation orientée objet avec C++ : classes, objets, héritage et polymorphisme.",
    files: ['WorkshopCPP.pdf'],
    difficulty: 'Intermédiaire',
    tags: ['C++'],
  },
]
