# SanFra · Primeros Auxilios — App móvil

App móvil (Expo + TypeScript) que consume el backend de asistencia en primeros auxilios.
Flujo: **voz/texto → guía paso a paso con alertas personalizadas**.

## Stack

- **Expo SDK 54** + **Expo Router** (navegación por archivos) + **TypeScript**
- **Zustand** (estado de autenticación) + **expo-secure-store** (token JWT)
- **expo-audio** (grabación de voz para ASR)
- Estilos: `StyleSheet` nativo. Iconos: `@expo/vector-icons` (sin emojis).

## Estructura

```
app/                 # rutas (Expo Router)
  (auth)/            # login, registro
  (app)/             # pantallas protegidas (consulta)
src/
  services/          # cliente HTTP y llamadas a la API
  store/             # zustand (auth)
  types/             # tipos espejo de los DTOs del backend
  hooks/             # useGrabadorAudio
  components/        # Boton, Campo, AlertaCard, ProtocoloViewer, GrabadorAudio
  theme/             # colores de marca, espaciados, tipografía
```

## Configuración

1. El backend debe ser **accesible en la red local**, no solo en localhost:
   ```bash
   # en backend/
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   (permitir el puerto 8000 en el firewall de Windows si lo pide).

2. Apuntar la app a la **IP LAN de la PC** en `.env`:
   ```
   EXPO_PUBLIC_API_URL=http://<IP-LAN>:8000
   ```
   Obtén tu IP con `ipconfig` (IPv4 de la Wi-Fi, p. ej. `192.168.x.x`).
   Si cambias de red, actualiza esta IP.

## Correr

```bash
npm install        # solo la primera vez
npx expo start
```

Escanea el QR con la app **Expo Go** en tu celular (debe estar en la **misma Wi-Fi** que la PC).
Verifica primero que el backend responde abriendo `http://<IP-LAN>:8000/health` en el navegador del celular.

## Hito actual (1 — Núcleo de emergencia)

- Registro / login con sesión persistente (token en secure-store).
- Consulta por **texto** y por **voz** (grabación 16 kHz mono → `/consulta/audio`).
- Render de la guía paso a paso + alertas clínicas por severidad.

Las alertas personalizadas aparecen si el usuario tiene un perfil clínico con condiciones
(la gestión del perfil desde la app es el Hito 2; por ahora se crea vía el backend).
