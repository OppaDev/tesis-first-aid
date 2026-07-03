# Frontend web (panel de administración) — SanFra
# Etapa 1: exporta la app Expo a estático; Etapa 2: la sirve con nginx.

FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Las variables EXPO_PUBLIC_* se hornean en el bundle en tiempo de build
# (no son secretos). Ajustar a la URL pública del backend.
ARG EXPO_PUBLIC_API_URL=http://localhost:8000
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}

RUN npx expo export --platform web


FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
