from pydantic import BaseModel, Field


class ConsultaRequestDTO(BaseModel):
    texto: str = Field(..., min_length=3, description="Texto de la consulta o narrativa de emergencia")


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


class ConsultaResponseDTO(BaseModel):
    tipo: str
    emergencia_detectada: str | None = None
    protocolo_encontrado: bool = False
    protocolos: list[ProtocoloDTO] = []
    respuesta: str | None = None
    mensaje: str | None = None
