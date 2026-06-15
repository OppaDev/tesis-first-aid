from pydantic import BaseModel, Field


class ConsultaRequestDTO(BaseModel):
    texto: str = Field(..., min_length=3, description="Texto de la consulta o narrativa de emergencia")


class PasoDTO(BaseModel):
    numero: int
    instruccion: str
    observacion: str | None = None
    imagen: str | None = None
    paso_anterior: str | None = None
    paso_siguiente: str | None = None


class ConsultaResponseDTO(BaseModel):
    tipo: str
    emergencia_detectada: str | None = None
    protocolo_encontrado: bool = False
    pasos: list[PasoDTO] = []
    respuesta: str | None = None
    mensaje: str | None = None
