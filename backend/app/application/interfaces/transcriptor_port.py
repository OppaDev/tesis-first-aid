from abc import ABC, abstractmethod


class TranscriptorAudioPort(ABC):
    @abstractmethod
    async def transcribir(self, audio: bytes) -> str:
        """Transcribe el audio (bytes de un archivo) a texto en español."""
