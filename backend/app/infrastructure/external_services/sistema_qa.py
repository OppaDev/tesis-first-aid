import asyncio
import pickle
from pathlib import Path

import torch
from sentence_transformers import SentenceTransformer, util

from app.application.interfaces.respondedor_qa_port import RespondedorQAPort

_BASE = Path(__file__).parent / "modelos" / "qa"
UMBRAL = 0.60


class SistemaQAAdapter(RespondedorQAPort):

    def __init__(self) -> None:
        self._modelo: SentenceTransformer | None = None
        self._textos: list[str] | None = None
        self._vectores: torch.Tensor | None = None

    def _cargar(self) -> None:
        if self._modelo is not None:
            return
        self._modelo = SentenceTransformer(str(_BASE))
        with open(_BASE / "base_conocimiento_vectores.pkl", "rb") as f:
            datos = pickle.load(f)
        self._textos = datos["textos"]
        self._vectores = datos["vectores"]

    def _responder_sync(self, pregunta: str) -> str | None:
        self._cargar()
        vector = self._modelo.encode(pregunta, convert_to_tensor=True)
        similitudes = util.cos_sim(vector, self._vectores)
        idx = torch.argmax(similitudes).item()
        confianza = similitudes[0][idx].item()
        if confianza < UMBRAL:
            return None
        return self._textos[idx]

    async def responder(self, pregunta: str) -> str | None:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._responder_sync, pregunta)
