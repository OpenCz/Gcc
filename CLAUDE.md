# Coding Club Epitech — CLAUDE.md

## Présentation du projet

Plateforme web centralisée pour les événements Coding Club Epitech Nice.
Trois rôles distincts : Prospects, Mantas (élèves organisateurs), Équipe pédagogique.

## Stack technique

- **Runtime** : Bun
- **Frontend** : React + Tailwind CSS + HeroUI
- **Backend** : Elysia + Eden (client typé frontend/backend)
- **Base de données** : PostgreSQL + Prisma
- **Déploiement** : Docker
- **Langage** : TypeScript partout, du frontend au backend

## Structure du projet

```
/
├── backend/
│   ├── prisma/           # Schéma Prisma et migrations
│   └── src/
│       ├── index.ts      # Point d'entrée Elysia (port 8080)
│       ├── routes/       # Endpoints HTTP (url + méthode)
│       ├── services/     # Logique métier
│       ├── models/       # Accès BDD via Prisma (CRUD pur)
│       └── utils/        # Fonctions utilitaires
├── frontend/
│   └── src/              # React + Tailwind + HeroUI
├── docker-compose.yml
└── CLAUDE.md
```

## Rôles utilisateurs

| Rôle | Accès | Auth |
|---|---|---|
| Prospect | Ressources téléchargeables de l'événement en cours | Login générique (`epitech` / `epitech`) |
| Manta | Planning des événements, inscription, pointage présence | Login my.epitech.eu |
| Équipe pédagogique | Backoffice complet (événements, ressources, Mantas) | Login my.epitech.eu |

## Authentification

- **Prospect** : identifiants génériques en dur (`epitech` / `epitech`), pas de compte individuel
- **Manta / Équipe pédagogique** : OAuth via l'API my.epitech.eu. L'email retourné est vérifié contre la table `Whitelist` pour déterminer le rôle (`MANTA` ou `PEDA`)

## Ordre de développement

Le développement suit cet ordre :
1. **Frontoffice** — partie Prospect et Manta (authentification, événements, ressources, présence)
2. **Backoffice** — partie Équipe pédagogique (gestion des événements, ressources, Mantas) — fait en dernier

### Route admin temporaire

En attendant le backoffice, une route `POST /admin/*` permet d'alimenter la base de données.
Elle est protégée par un header `Authorization: Bearer <ADMIN_SECRET>` (valeur dans `.env`).
Cette route sera supprimée ou restreinte une fois le backoffice en place.

## Architecture backend

```
Requête HTTP → routes/ → services/ → models/ → PostgreSQL
```

- **routes/** : définit l'endpoint (URL + méthode HTTP), valide le body avec TypeBox, appelle le service
- **services/** : contient toute la logique métier (règles de gestion, JWT, vérifications)
- **models/** : seul endroit qui parle à Prisma — chaque méthode = une requête, aucune logique
- **utils/** : fonctions utilitaires partagées (ex: client Prisma singleton)

## Schéma BDD

- `User` : id, role, email, name, password
- `Event` : id, name, nb_prospect, description, lieu
- `Resources` : id, name, url, type — liée à un Event
- `Manta` : table de jonction User ↔ Event, avec champ `present` (pointage)
- `Whitelist` : emails autorisés avec leur rôle (MANTA ou PEDA)
- Enum `Role` : `PROSPECT`, `MANTA`, `PEDA`

## Conventions de code

- Tout le code est en **TypeScript strict** — pas de `any`
- Les noms de fichiers de composants React sont en **PascalCase** (`EventCard.tsx`)
- Les noms de fichiers utilitaires et routes sont en **camelCase** (`authRoutes.ts`)
- Les variables et fonctions sont en **camelCase**
- Les types et interfaces sont en **PascalCase**
- Toujours valider les données entrantes côté backend avec **TypeBox** (intégré à Elysia)
- Utiliser **Eden** pour tous les appels frontend → backend, jamais de `fetch` brut

## Conventions Git

- Branches : `feat/nom-feature`, `fix/nom-bug`, `chore/nom-tache`
- Commits : format conventionnel `type(scope): description` en anglais
  - Exemples : `feat(auth): add my.epitech.eu login`, `fix(events): correct date format`
- Toujours ouvrir une Pull Request, jamais de push direct sur `main`

## Commandes utiles

```bash
# Lancer le backend
cd backend && bun dev

# Lancer le frontend
cd frontend && bun dev

# Lancer les migrations Prisma
cd backend && bunx prisma migrate dev

# Lancer Prisma Studio (interface visuelle BDD)
cd backend && bunx prisma studio

# Lancer tout via Docker
docker compose up
```

## Variables d'environnement

Ne jamais committer de fichier `.env`. Utiliser `.env.example` comme référence.

```env
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/codingclub
JWT_SECRET=
ADMIN_SECRET=
MY_EPITECH_CLIENT_ID=
MY_EPITECH_CLIENT_SECRET=

# Frontend
VITE_API_URL=http://localhost:8080
```

## Docker

- Un `Dockerfile` par app (`backend/Dockerfile`, `frontend/Dockerfile`)
- `docker-compose.yml` à la racine : frontend + backend + PostgreSQL
- Réseaux séparés : `back-tier` (db ↔ backend), `front-tier` (backend ↔ frontend)

## Ce qu'il ne faut pas faire

- Ne jamais écrire de requêtes SQL brutes — toujours passer par Prisma
- Ne jamais appeler l'API depuis le frontend avec `fetch` brut — toujours utiliser Eden
- Ne jamais mettre de logique métier dans les composants React — la garder dans des services ou hooks
- Ne jamais committer de secrets ou de fichiers `.env`
- Ne jamais pusher directement sur `main`
