"""CU-006 Realizar consulta por texto (enrutamiento pregunta/narrativa,
compartido con CU-005) — casos CU006-CP001 … CU006-CP005."""

from app.domain.services.enrutador_service import EnrutadorService, TipoConsulta

enrutador = EnrutadorService()


def test_cu006_cp001_pregunta_con_signo_inicial():
    """CU006-CP001: texto con signo/palabra interrogativa inicial → PREGUNTA."""
    assert enrutador.enrutar("¿Cómo hago RCP?") == TipoConsulta.PREGUNTA


def test_cu006_cp002_pregunta_sin_tilde_ni_signos():
    """CU006-CP002: palabra interrogativa sin tilde ni signos → PREGUNTA."""
    assert enrutador.enrutar("que hago si alguien se desmaya") == TipoConsulta.PREGUNTA


def test_cu006_cp003_narrativa_de_emergencia():
    """CU006-CP003: descripción de una situación → NARRATIVA."""
    assert enrutador.enrutar("mi hijo se cortó con un cuchillo") == TipoConsulta.NARRATIVA


def test_cu006_cp004_termina_en_interrogacion():
    """CU006-CP004: texto terminado en «?» → PREGUNTA aunque no inicie con interrogativa."""
    assert enrutador.enrutar("la persona no respira?") == TipoConsulta.PREGUNTA


def test_cu006_cp005_mayusculas_y_espacios():
    """CU006-CP005: mayúsculas y espacios alrededor no afectan el enrutamiento."""
    assert enrutador.enrutar("  DÓNDE consigo un torniquete  ") == TipoConsulta.PREGUNTA
