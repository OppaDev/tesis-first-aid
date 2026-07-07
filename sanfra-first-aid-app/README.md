# SanFra — despliegue con Docker

Carpeta autocontenida para desplegar el sistema en un servidor.
No requiere el código fuente: usa las imágenes publicadas en Docker Hub
(`oppadev/first-aid` y `oppadev/web-first-aid`).

## Requisitos del servidor

- Docker Engine + Docker Compose v2
- ~6 GB de disco libres (la imagen del backend pesa ~4.2 GB e incluye los modelos de IA)

## Despliegue

1. Copiar esta carpeta al servidor:

   ```bash
   scp -r sanfra-first-aid-app usuario@servidor:~/
   ```

2. En el servidor, completar las variables (una sola vez):

   ```bash
   cd ~/sanfra-first-aid-app
   cp .env.example .env
   nano .env   # POSTGRES_PASSWORD y SECRET_KEY reales
   ```

3. Descargar imágenes y levantar:

   ```bash
   docker compose pull
   docker compose up -d
   ```

4. Cargar los datos iniciales (solo la primera vez):

   ```bash
   docker compose exec backend python scripts/seed.py
   ```

## Servicios

| Servicio | Puerto | URL |
|---|---|---|
| Panel web | 8080 | http://SERVIDOR:8080 |
| API (docs) | 8000 | http://SERVIDOR:8000/docs |
| PostgreSQL | interno | solo accesible entre contenedores |

## Operación

```bash
docker compose logs -f backend   # ver logs
docker compose ps                # estado
docker compose down              # detener (los datos persisten en volúmenes)
docker compose pull && docker compose up -d   # actualizar a nuevas imágenes
```

## Nota sobre la URL del API en el panel web

La imagen `oppadev/web-first-aid` lleva la URL del backend horneada en el
bundle en tiempo de build (variable `EXPO_PUBLIC_API_URL`). El build la toma
automáticamente de `frontend/.env`: para cambiar de dominio/IP, editar ese
archivo, reconstruir y volver a publicar (desde `frontend/`):

```bash
# 1. Ajustar EXPO_PUBLIC_API_URL en frontend/.env
# 2. Reconstruir y publicar
docker build --pull --no-cache -t oppadev/web-first-aid:latest .
docker push oppadev/web-first-aid:latest

# Verificar que la URL quedó horneada en el bundle:
docker run --rm oppadev/web-first-aid:latest \
  sh -c "grep -rlo 'www.oppadev.com' /usr/share/nginx/html | head -3"
```
