# Pruebas de carga y estrés — Locust

Mide la capacidad real del núcleo del sistema (consulta con BETO/MiniLM en CPU +
PostgreSQL) y verifica la protección de tasa, contra la API **local** sobre la base
dedicada `firstaid_test`. Nunca contra producción.

- `locustfile.py` — los dos escenarios (`EscenarioProteccionTasa`, `UsuarioAsistencia`).
- `iniciar_api_carga.ps1` — lanza la API de pruebas (con/sin límites de tasa).
- `resultados/` — CSV y HTML de cada corrida (evidencia; no se versiona).

Documentación de los casos: `trabajo-integracion-curricular/documentacion/casos_de_prueba/cp-carga/`.

## Requisitos

- PostgreSQL local corriendo (el de desarrollo).
- Entorno conda `tesis` con `locust` instalado.
- **Dos terminales**: una para la API, otra para Locust.

## Secuencia completa (comandos en orden)

Todos los comandos se lanzan desde `backend/`.

### 0. Preparar la base de pruebas (una vez por sesión de pruebas)

```powershell
conda run -n tesis python -m pytest test_integracion -q
```

Recrea `firstaid_test` con migraciones y seeds (y revalida integración de paso;
recuerda: 17 passed, 1 failed es el estado esperado por el hallazgo documentado).

### 1. Escenario A — Protección de tasa (límites de producción)

**Terminal 1** (API con límites reales):

```powershell
.\test_carga\iniciar_api_carga.ps1
```

**Terminal 2** — calentamiento (carga los modelos antes de medir) y corrida:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8000/consulta -ContentType "application/json" -Body '{"texto":"Me corte la mano con un cuchillo y sangra mucho"}'
Invoke-RestMethod -Method Post -Uri http://localhost:8000/consulta -ContentType "application/json" -Body '{"texto":"Que hago si alguien se atraganta?"}'

conda run -n tesis --no-capture-output python -m locust -f test_carga/locustfile.py EscenarioProteccionTasa --headless -u 10 -r 5 -t 90s --host http://localhost:8000 --csv test_carga/resultados/protec_tasa --html test_carga/resultados/protec_tasa.html
```

**Qué esperar:** ~120 respuestas exitosas por minuto en el catálogo y ~10 en el
login; TODO el exceso con error 429. En el reporte, esos 429 figuran como
"fallos": son la protección funcionando (así se documenta en las fichas).

Al terminar, **detén la API** (Ctrl+C en la Terminal 1).

### 2. Escenario B — Capacidad y estrés (límites elevados por configuración)

**Terminal 1** (API sin límites de tasa):

```powershell
.\test_carga\iniciar_api_carga.ps1 -SinLimite
```

**Terminal 2** — calentamiento de nuevo (la API se reinició) y la escalera de
concurrencia (4 corridas de 2 minutos; lánzalas una tras otra, esperando a que
cada una termine):

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8000/consulta -ContentType "application/json" -Body '{"texto":"Me corte la mano con un cuchillo y sangra mucho"}'
Invoke-RestMethod -Method Post -Uri http://localhost:8000/consulta -ContentType "application/json" -Body '{"texto":"Que hago si alguien se atraganta?"}'

conda run -n tesis --no-capture-output python -m locust -f test_carga/locustfile.py UsuarioAsistencia --headless -u 5 -r 2 -t 120s --host http://localhost:8000 --csv test_carga/resultados/capacidad_05u --html test_carga/resultados/capacidad_05u.html

conda run -n tesis --no-capture-output python -m locust -f test_carga/locustfile.py UsuarioAsistencia --headless -u 10 -r 2 -t 120s --host http://localhost:8000 --csv test_carga/resultados/capacidad_10u --html test_carga/resultados/capacidad_10u.html

conda run -n tesis --no-capture-output python -m locust -f test_carga/locustfile.py UsuarioAsistencia --headless -u 20 -r 2 -t 120s --host http://localhost:8000 --csv test_carga/resultados/capacidad_20u --html test_carga/resultados/capacidad_20u.html

conda run -n tesis --no-capture-output python -m locust -f test_carga/locustfile.py UsuarioAsistencia --headless -u 40 -r 2 -t 120s --host http://localhost:8000 --csv test_carga/resultados/capacidad_40u --html test_carga/resultados/capacidad_40u.html
```

**Qué esperar:** sin errores 5xx; la latencia p95 de la consulta narrativa crece
con la concurrencia. El **punto de saturación** es la corrida en la que el RPS
deja de subir mientras la p95 se dispara (la CPU del clasificador queda al tope).

Al terminar, detén la API (Ctrl+C).

### 3. Evidencia

Cada corrida deja en `resultados/`:
- `*_stats.csv` — RPS, latencias (mediana/p95/máx), conteo de fallos por endpoint.
- `*.html` — reporte visual de Locust (gráficas de RPS y latencia en el tiempo):
  ideal para las capturas de la tesis.

## Notas metodológicas

- Los límites de tasa del Escenario B se elevan **solo por variables de entorno**
  (la configuración ya lo permite); el código de producción no se modifica.
- El endpoint de voz no se incluye: comparte el mismo cuello de botella (CPU) y
  solo añadiría el costo de subida del archivo; su carga realista es baja.
- Hardware de referencia: la laptop de desarrollo (Windows 11, CPU), coherente
  con el despliegue real, que también ejecuta los modelos en CPU dentro de Docker.
