from pydantic import BaseModel, Field, field_validator

from app.application.dtos.texto_sanitizer import limpiar_texto


class ConsultaRequestDTO(BaseModel):
    texto: str = Field(
        ...,
        min_length=3,
        max_length=400,
        description="Texto de la consulta o narrativa de emergencia",
    )

    @field_validator("texto")
    @classmethod
    def _limpiar(cls, v: str) -> str:
        return limpiar_texto(v)


class PasoDTO(BaseModel):
    paso_siguiente: str | None = None
    paso_siguiente_no: str | None = None
    anexo_si: str | None = None
    anexo_no: str | None = None


class ProtocoloDTO(BaseModel):
    id_protocolo: str
    numero: int
    instruccion: str
    observacion: str | None = None
    imagen: str | None = None
    es_condicion: bool = False
    paso: PasoDTO | None = None


class AlertaDTO(BaseModel):
    nombre_condicion: str
    mensaje: str
    severidad: str
    detalle: str | None = None


class ConsultaResponseDTO(BaseModel):
    tipo: str
    transcripcion: str | None = None  # texto reconocido del audio (solo en /consulta/audio)
    emergencia_detectada: str | None = None
    protocolo_encontrado: bool = False
    protocolos: list[ProtocoloDTO] = []
    alertas: list[AlertaDTO] = []
    respuesta: str | None = None
    mensaje: str | None = None
