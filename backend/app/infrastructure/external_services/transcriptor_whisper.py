import asyncio
from io import BytesIO

from faster_whisper import WhisperModel

from app.application.interfaces.transcriptor_port import TranscriptorAudioPort
from app.infrastructure.config import settings


class TranscriptorWhisperAdapter(TranscriptorAudioPort):
    """ASR con faster-whisper. Carga perezosa del modelo y ejecución fuera del event loop.

    Robustez al ruido: vad_filter recorta silencios/ruido de fondo antes de transcribir.
    El audio se decodifica vía PyAV (no requiere ffmpeg del sistema)."""

    def __init__(self) -> None:
        self._model: WhisperModel | None = None

    def _cargar(self) -> None:
        if self._model is not None:
            return
        self._model = WhisperModel(
            settings.asr_model,
            device=settings.asr_device,
            compute_type=settings.asr_compute_type,
        )

    def _transcribir_sync(self, audio: bytes) -> str:
        self._cargar()
        segmentos, _ = self._model.transcribe(
            BytesIO(audio),
            language=settings.asr_idioma,
            vad_filter=True,
        )
        return " ".join(segmento.text.strip() for segmento in segmentos).strip()

    async def transcribir(self, audio: bytes) -> str:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._transcribir_sync, audio)
