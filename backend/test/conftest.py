"""Fixtures y dobles de prueba (fakes/stubs) compartidos por los unit tests.

Los repositorios se reemplazan por implementaciones en memoria de las mismas
interfaces del dominio, y los modelos de IA por stubs de sus puertos: los casos
de uso se prueban aislados, sin base de datos ni modelos cargados.
"""

import os

# Settings se instancia al importar la app; estos valores de prueba tienen
# prioridad sobre el .env real y evitan depender de él.
os.environ.setdefault("SECRET_KEY", "clave-secreta-solo-para-tests")
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test")

from datetime import date

from app.application.interfaces.clasificador_port import ClasificadorEmergenciaPort
from app.application.interfaces.respondedor_qa_port import RespondedorQAPort
from app.domain.entities.categoria import Categoria
from app.domain.entities.condicion import Condicion
from app.domain.entities.emergencia import Emergencia
from app.domain.entities.paso import Paso
from app.domain.entities.perfil_clinico import PerfilClinico
from app.domain.entities.protocolo import Protocolo
from app.domain.entities.regla_alerta import ReglaAlerta
from app.domain.entities.usuario import Usuario
from app.domain.repositories.alerta_regla_repository import AlertaReglaRepository
from app.domain.repositories.condicion_repository import CondicionRepository
from app.domain.repositories.emergencia_repository import EmergenciaRepository
from app.domain.repositories.perfil_clinico_repository import PerfilClinicoRepository
from app.domain.repositories.usuario_repository import UsuarioRepository
from app.infrastructure.security.password import hashear

# Cédulas ecuatorianas con dígito verificador correcto (algoritmo de cedula_service)
CEDULA_VALIDA = "1710034065"
CEDULA_VALIDA_2 = "0102030400"
CEDULA_VALIDA_3 = "0102030418"
CEDULA_INVALIDA = "1710034060"  # verificador incorrecto

PASSWORD_VALIDA = "Segura#2026"
# bcrypt es costoso: se hashea una sola vez y se reutiliza en todos los tests
HASH_PASSWORD_VALIDA = hashear(PASSWORD_VALIDA)

ID_ROL_ADMIN = 1
ID_ROL_USUARIO = 2


# ---------------------------------------------------------------------------
# Builders de entidades con datos válidos por defecto
# ---------------------------------------------------------------------------

def crear_usuario(
    cedula: str = CEDULA_VALIDA,
    email: str = "ana@mail.com",
    id_rol: int = ID_ROL_USUARIO,
    password: str = HASH_PASSWORD_VALIDA,
    token_version: int = 0,
) -> Usuario:
    return Usuario(
        cedula=cedula,
        nombres="Ana",
        apellidos="Pérez",
        fecha_nacimiento=date(1990, 5, 10),
        email=email,
        password=password,
        id_rol=id_rol,
        token_version=token_version,
    )


def crear_condicion(
    id_condicion: int = 1,
    nombre: str = "Diabetes",
    detalle: str | None = "Tipo 2",
) -> Condicion:
    return Condicion(
        nombre_condicion=nombre,
        descripcion_condicion=f"Descripción de {nombre}",
        id_condicion=id_condicion,
        id_categoria=1,
        detalle=detalle,
    )


def crear_perfil(
    cedula: str = CEDULA_VALIDA,
    condiciones: list[Condicion] | None = None,
) -> PerfilClinico:
    return PerfilClinico(
        genero="Femenino",
        tipo_sangre="O+",
        altura_cm=175,
        peso_kg=70,
        id_perfil=1,
        cedula=cedula,
        condiciones=condiciones if condiciones is not None else [],
    )


def crear_regla(
    id_regla: int = 1,
    id_condicion: int = 1,
    id_emergencia: str = "EM01",
    severidad: str = "alta",
    mensaje: str = "Controle su glucosa durante la atención",
) -> ReglaAlerta:
    return ReglaAlerta(
        id_condicion=id_condicion,
        id_emergencia=id_emergencia,
        mensaje=mensaje,
        severidad=severidad,
        id_regla=id_regla,
    )


def crear_emergencia(nombre: str = "quemadura") -> Emergencia:
    """Emergencia con protocolo de 5 pasos: incluye una decisión sí/no y un anexo."""
    protocolos = [
        Protocolo("P1", 1, "Aleje a la persona de la fuente de calor",
                  paso=Paso("P1", paso_siguiente="C1")),
        Protocolo("C1", 2, "¿La quemadura es mayor que la palma de la mano?",
                  paso=Paso("C1", paso_siguiente="P2", paso_siguiente_no="P3", anexo_si="A1")),
        Protocolo("P2", 3, "Llame a emergencias y cubra la zona",
                  paso=Paso("P2")),
        Protocolo("P3", 4, "Enfríe con agua limpia por 20 minutos",
                  paso=Paso("P3")),
        Protocolo("A1", 5, "Anexo: manejo de quemadura extensa",
                  paso=Paso("A1")),
    ]
    return Emergencia(
        id_emergencia="EM01",
        nombre_emergencia=nombre,
        descripcion_emergencia="Lesión por calor",
        grupo_edad="adulto",
        severidad="alta",
        etiqueta=nombre,
        evaluacion_inicial="Evalúe la escena",
        protocolos=protocolos,
    )


# ---------------------------------------------------------------------------
# Fakes de repositorios (en memoria)
# ---------------------------------------------------------------------------

class FakeUsuarioRepository(UsuarioRepository):
    def __init__(self, usuarios: list[Usuario] | None = None) -> None:
        self.usuarios: dict[str, Usuario] = {u.cedula: u for u in (usuarios or [])}
        self.orden_llamadas: list[str] | None = None  # para verificar orden entre repos

    async def obtener_por_email(self, email: str) -> Usuario | None:
        return next((u for u in self.usuarios.values() if u.email == email), None)

    async def obtener_por_cedula(self, cedula: str) -> Usuario | None:
        return self.usuarios.get(cedula)

    async def crear(self, usuario: Usuario) -> Usuario:
        self.usuarios[usuario.cedula] = usuario
        return usuario

    async def listar(self, limit: int, offset: int) -> list[Usuario]:
        return list(self.usuarios.values())[offset:offset + limit]

    async def contar(self) -> int:
        return len(self.usuarios)

    async def actualizar_rol(self, cedula: str, id_rol: int) -> Usuario | None:
        usuario = self.usuarios.get(cedula)
        if usuario is not None:
            usuario.id_rol = id_rol
        return usuario

    async def actualizar_datos(
        self, cedula: str, nombres: str, apellidos: str, email: str
    ) -> Usuario | None:
        usuario = self.usuarios.get(cedula)
        if usuario is not None:
            usuario.nombres, usuario.apellidos, usuario.email = nombres, apellidos, email
        return usuario

    async def actualizar_password(self, cedula: str, password_hash: str) -> None:
        self.usuarios[cedula].password = password_hash

    async def eliminar(self, cedula: str) -> None:
        if self.orden_llamadas is not None:
            self.orden_llamadas.append("usuario")
        self.usuarios.pop(cedula, None)

    async def incrementar_token_version(self, cedula: str) -> None:
        self.usuarios[cedula].token_version += 1

    async def contar_por_rol(self, id_rol: int) -> int:
        return sum(1 for u in self.usuarios.values() if u.id_rol == id_rol)


class FakePerfilClinicoRepository(PerfilClinicoRepository):
    def __init__(self, perfiles: list[PerfilClinico] | None = None) -> None:
        self.perfiles: dict[str, PerfilClinico] = {p.cedula: p for p in (perfiles or [])}
        self.orden_llamadas: list[str] | None = None

    async def obtener_por_cedula(self, cedula: str) -> PerfilClinico | None:
        return self.perfiles.get(cedula)

    async def crear(
        self, cedula: str, perfil: PerfilClinico, condiciones: list[tuple[int, str | None]]
    ) -> PerfilClinico:
        perfil.cedula = cedula
        self.perfiles[cedula] = perfil
        return perfil

    async def actualizar(
        self, perfil: PerfilClinico, condiciones: list[tuple[int, str | None]]
    ) -> PerfilClinico:
        self.perfiles[perfil.cedula] = perfil
        return perfil

    async def eliminar(self, cedula: str) -> None:
        if self.orden_llamadas is not None:
            self.orden_llamadas.append("perfil")
        self.perfiles.pop(cedula, None)


class FakeAlertaReglaRepository(AlertaReglaRepository):
    def __init__(self, reglas: list[ReglaAlerta] | None = None) -> None:
        self.reglas: dict[int, ReglaAlerta] = {}
        self._siguiente_id = 1
        for regla in reglas or []:
            if regla.id_regla is None:
                regla.id_regla = self._siguiente_id
            self.reglas[regla.id_regla] = regla
            self._siguiente_id = max(self._siguiente_id, regla.id_regla + 1)

    async def obtener_por_emergencia(self, id_emergencia: str) -> list[ReglaAlerta]:
        return [r for r in self.reglas.values() if r.id_emergencia == id_emergencia]

    async def listar(self, limit: int, offset: int) -> list[ReglaAlerta]:
        return list(self.reglas.values())[offset:offset + limit]

    async def contar(self) -> int:
        return len(self.reglas)

    async def obtener_por_id(self, id_regla: int) -> ReglaAlerta | None:
        return self.reglas.get(id_regla)

    async def crear(self, regla: ReglaAlerta) -> ReglaAlerta:
        regla.id_regla = self._siguiente_id
        self._siguiente_id += 1
        self.reglas[regla.id_regla] = regla
        return regla

    async def actualizar(self, regla: ReglaAlerta) -> ReglaAlerta:
        self.reglas[regla.id_regla] = regla
        return regla

    async def eliminar(self, id_regla: int) -> None:
        self.reglas.pop(id_regla, None)


class FakeEmergenciaRepository(EmergenciaRepository):
    def __init__(self, emergencias: list[Emergencia] | None = None) -> None:
        self.emergencias: dict[str, Emergencia] = {
            e.nombre_emergencia: e for e in (emergencias or [])
        }

    async def obtener_por_nombre(self, nombre_emergencia: str) -> Emergencia | None:
        return self.emergencias.get(nombre_emergencia)

    async def listar(self) -> list[Emergencia]:
        return list(self.emergencias.values())


class FakeCondicionRepository(CondicionRepository):
    def __init__(
        self,
        condiciones: list[Condicion] | None = None,
        categorias: list[Categoria] | None = None,
    ) -> None:
        self.condiciones: dict[int, Condicion] = {
            c.id_condicion: c for c in (condiciones or [])
        }
        self.categorias: dict[int, Categoria] = {
            c.id_categoria: c for c in (categorias or [])
        }
        self._siguiente_condicion = max(self.condiciones, default=0) + 1
        self._siguiente_categoria = max(self.categorias, default=0) + 1

    async def listar_catalogo(self) -> list[Categoria]:
        return list(self.categorias.values())

    async def obtener_condicion(self, id_condicion: int) -> Condicion | None:
        return self.condiciones.get(id_condicion)

    async def crear_condicion(self, condicion: Condicion) -> Condicion:
        condicion.id_condicion = self._siguiente_condicion
        self._siguiente_condicion += 1
        self.condiciones[condicion.id_condicion] = condicion
        return condicion

    async def actualizar_condicion(self, condicion: Condicion) -> Condicion:
        self.condiciones[condicion.id_condicion] = condicion
        return condicion

    async def eliminar_condicion(self, id_condicion: int) -> None:
        self.condiciones.pop(id_condicion, None)

    async def obtener_categoria(self, id_categoria: int) -> Categoria | None:
        return self.categorias.get(id_categoria)

    async def crear_categoria(self, categoria: Categoria) -> Categoria:
        categoria.id_categoria = self._siguiente_categoria
        self._siguiente_categoria += 1
        self.categorias[categoria.id_categoria] = categoria
        return categoria

    async def actualizar_categoria(self, categoria: Categoria) -> Categoria:
        self.categorias[categoria.id_categoria] = categoria
        return categoria

    async def eliminar_categoria(self, id_categoria: int) -> None:
        self.categorias.pop(id_categoria, None)


# ---------------------------------------------------------------------------
# Stubs de los puertos de IA
# ---------------------------------------------------------------------------

class StubClasificador(ClasificadorEmergenciaPort):
    """Devuelve siempre el nombre de emergencia configurado (reemplaza a BETO)."""

    def __init__(self, nombre_emergencia: str = "quemadura") -> None:
        self._nombre = nombre_emergencia

    async def clasificar(self, texto: str) -> str:
        return self._nombre


class StubQA(RespondedorQAPort):
    """Devuelve la respuesta configurada, o None si no hay respuesta segura
    (reemplaza al sistema QA MiniLM)."""

    def __init__(self, respuesta: str | None = None) -> None:
        self._respuesta = respuesta

    async def responder(self, pregunta: str) -> str | None:
        return self._respuesta
