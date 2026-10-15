# Image du front : une première étape compile Angular, la seconde ne garde que
# les fichiers statiques servis par nginx (image finale légère, sans Node).

# --- Étape 1 : compilation ---
FROM node:24-alpine AS build
WORKDIR /app

# Même version de npm qu'en local (champ packageManager de package.json).
RUN npm install -g npm@12.1.0

# Les dépendances d'abord : cette couche n'est refaite que si package-lock.json change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Étape 2 : service des fichiers ---
# Variante sans droits root : nginx écoute sur le port 8080.
FROM nginxinc/nginx-unprivileged:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/tradia/browser /usr/share/nginx/html

EXPOSE 8080
