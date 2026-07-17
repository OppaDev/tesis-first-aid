"""CU-005 — Consulta por voz: validaciones del audio (CU005-CPI001 a CPI004).

Casos que el README de cp-backend dejó explícitamente para integración porque
requieren el servidor procesando la petición real: tamaño máximo, tipo de
archivo, archivo vacío y audio sin voz (este último ejercita faster-whisper de
verdad: el modelo se carga y transcribe).

Resultados esperados según la especificación de CU-005:
 - paso 3, excepción 1: «si el audio supera el tamaño permitido, el sistema lo
   rechaza indicando el límite»;
 - paso 3, excepción 2: «si el archivo no es un audio admitido o está vacío, el
   sistema rechaza la solicitud»;
 - paso 3, excepción 3: «si no se detecta voz en el audio, el sistema pide
   intentar de nuevo en un lugar más silencioso».
"""

import io
import wave

import pytest

pytestmark = pytest.mark.asyncio(loop_scope="session")


def _wav_silencio(segundos: float = 2.0) -> bytes:
    """WAV real (16 kHz, mono, 16 bits) que contiene únicamente silencio."""
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(16000)
        wav.writeframes(b"\x00" * int(16000 * 2 * segundos))
    return buffer.getvalue()


async def test_cu005_cpi001_audio_supera_limite_rechazado(client):
    """CU005-CPI001: un audio mayor al límite configurado (10 MB) se rechaza
    con un mensaje que indica el límite."""
    audio_11_mb = b"\x00" * (11 * 1024 * 1024)
    respuesta = await client.post(
        "/consulta/audio",
        files={"archivo": ("consulta.wav", audio_11_mb, "audio/wav")},
    )
    assert 400 <= respuesta.status_code < 500, (
        f"Se esperaba rechazo controlado (4xx) y se obtuvo "
        f"{respuesta.status_code}: {respuesta.text}"
    )
    detalle = str(respuesta.json().get("detail", ""))
    assert "MB" in detalle, f"El mensaje no indica el límite: {detalle!r}"


async def test_cu005_cpi002_archivo_no_audio_rechazado(client):
    """CU005-CPI002: un archivo que no es audio (texto plano) se rechaza."""
    respuesta = await client.post(
        "/consulta/audio",
        files={"archivo": ("documento.txt", b"esto no es un audio", "text/plain")},
    )
    assert 400 <= respuesta.status_code < 500, (
        f"Se esperaba rechazo controlado (4xx) y se obtuvo "
        f"{respuesta.status_code}: {respuesta.text}"
    )
    assert respuesta.json().get("detail"), "El rechazo no incluye mensaje"


async def test_cu005_cpi003_archivo_vacio_rechazado(client):
    """CU005-CPI003: un archivo de audio vacío se rechaza."""
    respuesta = await client.post(
        "/consulta/audio",
        files={"archivo": ("consulta.wav", b"", "audio/wav")},
    )
    assert 400 <= respuesta.status_code < 500, (
        f"Se esperaba rechazo controlado (4xx) y se obtuvo "
        f"{respuesta.status_code}: {respuesta.text}"
    )
    assert respuesta.json().get("detail"), "El rechazo no incluye mensaje"


async def test_cu005_cpi004_audio_sin_voz_pide_reintentar(client):
    """CU005-CPI004: un audio real que solo contiene silencio se transcribe con
    faster-whisper y, al no detectarse voz, el sistema pide intentar de nuevo."""
    respuesta = await client.post(
        "/consulta/audio",
        files={"archivo": ("silencio.wav", _wav_silencio(), "audio/wav")},
    )
    assert 400 <= respuesta.status_code < 500, (
        f"Se esperaba rechazo controlado (4xx) y se obtuvo "
        f"{respuesta.status_code}: {respuesta.text}"
    )
    detalle = str(respuesta.json().get("detail", ""))
    assert "voz" in detalle.lower(), (
        f"El mensaje no comunica la ausencia de voz: {detalle!r}"
    )
