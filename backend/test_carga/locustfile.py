"""Pruebas de carga y estrés de la API con Locust.

Dos escenarios; la clase de usuario se elige en la línea de comandos:

1. `EscenarioProteccionTasa` — se corre con la API en CONFIGURACIÓN DE
   PRODUCCIÓN (límites de tasa activos). Verifica que el sistema se protege
   ante un cliente abusivo desde una sola IP respondiendo 429 al exceso
   (120/min global; 10/min en el inicio de sesión). En el reporte de Locust
   esos 429 aparecen como "fallos": aquí SON el comportamiento esperado y así
   se documenta.

2. `UsuarioAsistencia` — se corre con los límites elevados por variables de
   entorno (configuración legítima de despliegue, sin tocar código). Mide la
   capacidad real del núcleo del sistema — la consulta con clasificación BETO
   en CPU, el QA MiniLM y la lectura de protocolos desde PostgreSQL — a
   distintos niveles de usuarios concurrentes, para ubicar el punto de
   saturación.

Neutralidad: los resultados se reportan tal como se midan; el software de
producción no se modifica.

Los comandos exactos de cada corrida están en el README de esta carpeta.
"""

import random

from locust import HttpUser, between, constant, task

# Narrativas variadas que cubren emergencias distintas del catálogo, para que
# la clasificación trabaje de verdad en cada petición.
NARRATIVAS = [
    "Me corté la mano con un cuchillo y sangra mucho",
    "Mi papá se cayó por las escaleras y se golpeó la cabeza",
    "Un niño se está atragantando con un caramelo",
    "Mi hermano se quemó el brazo con aceite caliente",
    "Una persona se desmayó en la calle y no reacciona",
    "Le picó una abeja y se le está hinchando la cara",
    "Creo que mi abuelo está teniendo un infarto, le duele el pecho",
    "Se torció el tobillo jugando fútbol y no puede apoyar el pie",
]

PREGUNTAS = [
    "¿Qué debo hacer si alguien se está atragantando?",
    "¿Cómo se hace la reanimación cardiopulmonar?",
    "¿Qué hago si una quemadura tiene ampollas?",
    "¿Cuándo debo llamar a emergencias por un desmayo?",
]


class UsuarioAsistencia(HttpUser):
    """Escenario de capacidad: rescatistas consultando en paralelo.

    Mezcla realista con pausas de 1 a 3 segundos entre acciones. La consulta
    narrativa (la operación más costosa) domina el tráfico; la acompañan
    preguntas al QA y la lectura del catálogo como petición ligera de
    contraste.
    """

    wait_time = between(1, 3)

    @task(6)
    def consulta_narrativa(self):
        self.client.post(
            "/consulta",
            json={"texto": random.choice(NARRATIVAS)},
            name="POST /consulta (narrativa)",
        )

    @task(2)
    def consulta_pregunta(self):
        self.client.post(
            "/consulta",
            json={"texto": random.choice(PREGUNTAS)},
            name="POST /consulta (pregunta)",
        )

    @task(1)
    def catalogo_condiciones(self):
        self.client.get("/condiciones", name="GET /condiciones")


class EscenarioProteccionTasa(HttpUser):
    """Escenario de protección: cliente abusivo desde una sola IP, sin pausas.

    Con los límites de producción, el resultado esperado es que el exceso
    reciba 429 (en el reporte figuran como fallos: es la protección actuando).
    """

    wait_time = constant(0)

    @task(10)
    def catalogo_en_rafaga(self):
        self.client.get("/condiciones", name="GET /condiciones (ráfaga)")

    @task(1)
    def login_fallido_en_rafaga(self):
        self.client.post(
            "/auth/login",
            json={"email": "abusivo@mail.com", "password": "Incorrecta#1"},
            name="POST /auth/login (ráfaga)",
        )
