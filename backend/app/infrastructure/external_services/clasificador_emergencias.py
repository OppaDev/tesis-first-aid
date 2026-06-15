import asyncio
import json
from pathlib import Path

import torch
from transformers import BertForSequenceClassification, BertTokenizerFast

from app.application.interfaces.clasificador_port import ClasificadorEmergenciaPort

_BASE = Path(__file__).parent / "modelos" / "clasificador"


class ClasificadorEmergenciasAdapter(ClasificadorEmergenciaPort):

    def __init__(self) -> None:
        self._model: BertForSequenceClassification | None = None
        self._tokenizer: BertTokenizerFast | None = None
        self._mapeo: dict[str, str] | None = None

    def _cargar(self) -> None:
        if self._model is not None:
            return
        self._tokenizer = BertTokenizerFast.from_pretrained(str(_BASE))
        self._model = BertForSequenceClassification.from_pretrained(str(_BASE))
        self._model.eval()
        with open(_BASE / "mapeo_clases.json", encoding="utf-8") as f:
            self._mapeo = json.load(f)

    def _clasificar_sync(self, texto: str) -> str:
        self._cargar()
        inputs = self._tokenizer(
            texto,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True,
        )
        with torch.no_grad():
            logits = self._model(**inputs).logits
        idx = torch.argmax(logits, dim=1).item()
        return self._mapeo[str(idx)]

    async def clasificar(self, texto: str) -> str:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._clasificar_sync, texto)
