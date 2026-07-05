# Frontend web (panel de administración) — SanFra
# Etapa 1: exporta la app Expo a estático; Etapa 2: la sirve con nginx.

FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Las variables EXPO_PUBLIC_* se hornean en el bundle en tiempo de build
# (no son secretos). Los valores por defecto replican los del código
# (src/config/voz.ts); la URL debe ajustarse a la del backend público.
ARG EXPO_PUBLIC_API_URL=http://localhost:8000
ARG EXPO_PUBLIC_VOZ_VELOCIDAD=1.15
ARG EXPO_PUBLIC_VOZ_IDIOMA=es
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL} \
    EXPO_PUBLIC_VOZ_VELOCIDAD=${EXPO_PUBLIC_VOZ_VELOCIDAD} \
    EXPO_PUBLIC_VOZ_IDIOMA=${EXPO_PUBLIC_VOZ_IDIOMA}

RUN npx expo export --platform web


FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
