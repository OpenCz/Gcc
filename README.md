# GCC : Gestion Coding Club Epitech Nice

Plateforme interne du Coding Club : gestion des sujets, inscriptions aux events, et espace membre.

## Stack

| Couche | Technologie |
|---|---|
| Backend | [Bun](https://bun.sh) + [Elysia](https://elysiajs.com) |
| Base de données | PostgreSQL + [Prisma](https://prisma.io) |
| Frontend | React + TypeScript + [Mantine](https://mantine.dev), buildé avec Bun |
| Reverse proxy | [Caddy](https://caddyserver.com) (HTTPS automatique via Let's Encrypt) |
| Conteneurs | Docker + Docker Compose |
| Auth | Microsoft OAuth (Azure AD / `@azure/msal-browser`) |

## Fonctionnalités

- **Prospects** - catalogue de sujets filtrables avec ressources (PDFs, liens)
- **Mantas** - proposition de sujets, inscription aux events
- **Admins** - gestion des sujets, validation des propositions, whitelist, events
- Authentification via compte Epitech (Microsoft OAuth)
- Upload de PDFs, liens multiples par sujet
- Migrations Prisma automatiques au démarrage en prod

---

## Développement local

### Prérequis

- [Bun](https://bun.sh) ≥ 1.x
- [Docker](https://www.docker.com) + Docker Compose

### Démarrage

```bash
# Lancer la DB, le backend et le frontend en hot-reload
docker compose -f docker-compose.dev.yml up -d

# Appliquer les migrations et générer le client Prisma
cd backend && bunx prisma migrate dev
```

Le frontend est accessible sur **http://localhost:6767**, le backend sur **http://localhost:8080**.

Aucun `.env` n'est requis en dev - les variables sont codées en dur dans `docker-compose.dev.yml`.

> Pour Prisma Studio : `cd backend && bunx prisma studio`

---

## Déploiement en production (VPS)

### 1. Cloner et configurer

```bash
git clone git@github.com:OpenCz/Gcc.git && cd Gcc
cp .env.example .env.prod
```

Remplir `.env.prod` (voir section [Variables d'environnement](#variables-denvironnement)).

Générer les secrets :

```bash
openssl rand -hex 32  # → JWT_SECRET
openssl rand -hex 32  # → ADMIN_SECRET
```

### 2. Lancer

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Caddy obtient automatiquement un certificat TLS pour `$DOMAIN`. Les migrations Prisma s'appliquent au démarrage du backend.

### 3. Mettre à jour

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

---

## Variables d'environnement

Copier `.env.example` → `.env.prod` et compléter :

```env
# Domaine (sans https://)
DOMAIN=mondomaine.com
ACME_EMAIL=contact@mondomaine.com

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<mot de passe fort>
POSTGRES_DB=gcc_db

# Backend
DATABASE_URL=postgresql://postgres:<mot de passe fort>@db:5432/gcc_db
JWT_SECRET=<openssl rand -hex 32>
ADMIN_SECRET=<openssl rand -hex 32>
FRONTEND_URL=https://mondomaine.com
MICROSOFT_REDIRECT_URI=https://mondomaine.com/auth/callback
API_URL=https://mondomaine.com

# Microsoft OAuth (Azure AD)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=
```

> `ADMIN_SECRET` est le mot de passe de la zone admin (`/admin`).

---

## Structure du projet

```
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── index.ts          # Point d'entrée Elysia
│   │   ├── routes/           # admin, manta, prospect, auth
│   │   ├── services/         # logique métier
│   │   ├── models/           # accès Prisma
│   │   └── middlewares/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/            # AdminPage, MantaPage, ResourcesPage…
│   │   └── components/
│   ├── build.ts              # Build Bun avec injection API_URL
│   ├── nginx.conf
│   └── Dockerfile
├── caddy/
│   └── Caddyfile             # Routing path-based, HTTPS auto
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── .env.example
```

---

## Prisma (migrations manuelles)

En production le terminal n'est pas interactif, utiliser `migrate deploy` :

```bash
# Créer une migration (en dev)
cd backend && bunx prisma migrate dev --name nom_de_la_migration

# Appliquer en prod (automatique au démarrage, ou manuellement)
docker compose -f docker-compose.prod.yml exec backend bunx prisma migrate deploy
```

Pour Prisma Studio depuis le serveur (via tunnel SSH) :

```bash
# Sur le serveur
docker run --rm -it \
  --network gcc-back-prod \
  -p 5555:5555 \
  -e DATABASE_URL=postgresql://... \
  gcc-backend bunx prisma studio --port 5555 --browser none

# Sur votre machine
ssh -L 5555:localhost:5555 user@vps
# Ouvrir http://localhost:5555
```

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) vérifie à chaque push sur `main` et `dev` :

- Type-check TypeScript (backend + frontend)
- Validation du schéma Prisma
