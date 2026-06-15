# ==== [DEV] Server dev Bun ====
FROM oven/bun:latest AS dev

WORKDIR /app

# Copie les fichiers de dépendances
COPY package.json bun.lock* ./

# Installe les dépendances
RUN bun install

# Copie le reste du projet
COPY . .

# Expose le port du frontend
EXPOSE 6767

# Lance le serveur de dev avec hot reload (src/index.ts écoute sur PORT ?? 6767)
CMD ["bun", "--hot", "src/index.ts"]




# ==== [BUILD] Build production ====
FROM oven/bun:latest AS build

WORKDIR /app

ARG API_URL=http://localhost:8080
ENV API_URL=${API_URL}

COPY package.json bun.lock* ./
RUN bun install

COPY . .
RUN bun run build




# ==== [PROD] server nginx ====
FROM nginx:alpine AS prod

# Copie le build dans nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Config nginx pour le SPA (redirige tout vers index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
