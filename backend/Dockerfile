# Backend FastAPI — SanFra primeros auxilios
# Imagen final ~5 GB: incluye torch CPU y los modelos de IA locales
# (clasificador BETO y sistema QA, ~900 MB en app/infrastructure/external_services/modelos).

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # Caché de Hugging Face (faster-whisper descarga su modelo aquí en el primer uso)
    HF_HOME=/data/hf-cache

# libgomp la requiere ctranslate2 (faster-whisper)
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# torch CPU primero desde su índice propio: evita las ruedas CUDA (~3 GB extra)
COPY requirements.txt .
RUN pip install --no-cache-dir torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Aplica las migraciones y levanta la API
CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000"]
