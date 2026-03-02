FROM oven/bun:latest

WORKDIR /app

# Copie les fichiers de dépendances
COPY package.json bun.lockb ./

# Installe les dépendances
RUN bun install

# Copie le reste du projet
COPY . .

# Génère le client Prisma
RUN bunx prisma generate

# Expose le port du serveur Elysia
EXPOSE 3000

# Lance le serveur
CMD ["bun", "run", "src/index.ts"]
