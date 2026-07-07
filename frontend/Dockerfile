# Frontend web (panel de administración) — SanFra
# Etapa 1: exporta la app Expo a estático; Etapa 2: la sirve con nginx.

FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Las variables EXPO_PUBLIC_* se hornean en el bundle en tiempo de build
# (no son secretos). expo export las lee del .env copiado con el contexto:
# para cambiar la URL del backend, editar frontend/.env y reconstruir.
# No definir ENV aquí: una variable ya presente en el entorno le ganaría
# al .env y volveríamos al bug de la URL horneada incorrecta.
RUN npx expo export --platform web


FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
