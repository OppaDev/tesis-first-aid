import { ApiError } from "@/src/types/api";

/**
 * URL base del backend. Se configura en `.env` con EXPO_PUBLIC_API_URL
 * (debe ser la IP LAN de la PC para que el celular la alcance, no localhost).
 */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

// Token en memoria; lo setea el store de auth tras login/hidratación.
let tokenActual: string | null = null;

export function setAuthToken(token: string | null): void {
  tokenActual = token;
}

// Callback que se invoca cuando el backend rechaza un token vigente (401):
// lo registra la capa de navegación para cerrar sesión y volver al login.
let alExpirarSesion: (() => void) | null = null;

export function setManejadorSesionExpirada(cb: (() => void) | null): void {
  alExpirarSesion = cb;
}

function encabezados(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (tokenActual) {
    headers.Authorization = `Bearer ${tokenActual}`;
  }
  return headers;
}

async function manejarError(res: Response): Promise<never> {
  // Si el backend rechaza un token que teníamos por vigente (expirado/invalidado),
  // disparamos el cierre de sesión. El guard `tokenActual` evita que un login
  // fallido (que también responde 401, sin token aún) cierre nada.
  if (res.status === 401 && tokenActual) {
    alExpirarSesion?.();
  }
  let detalle = `Error ${res.status}`;
  try {
    const data = await res.json();
    if (data?.detail) {
      detalle = typeof data.detail === "string" ? data.detail : detalle;
    }
  } catch {
    // respuesta sin JSON; se usa el mensaje por defecto
  }
  throw new ApiError(res.status, detalle);
}

/** GET con respuesta JSON. */
export async function getJson<T>(ruta: string): Promise<T> {
  const res = await fetch(`${API_URL}${ruta}`, {
    method: "GET",
    headers: encabezados(),
  });
  if (!res.ok) {
    return manejarError(res);
  }
  return res.json() as Promise<T>;
}

/** POST con cuerpo JSON. */
export async function postJson<T>(ruta: string, cuerpo: unknown): Promise<T> {
  return enviarJson<T>("POST", ruta, cuerpo);
}

/** PUT con cuerpo JSON. */
export async function putJson<T>(ruta: string, cuerpo: unknown): Promise<T> {
  return enviarJson<T>("PUT", ruta, cuerpo);
}

/** PATCH con cuerpo JSON. */
export async function patchJson<T>(ruta: string, cuerpo: unknown): Promise<T> {
  return enviarJson<T>("PATCH", ruta, cuerpo);
}

async function enviarJson<T>(
  metodo: "POST" | "PUT" | "PATCH",
  ruta: string,
  cuerpo: unknown,
): Promise<T> {
  const res = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: encabezados({ "Content-Type": "application/json" }),
    body: JSON.stringify(cuerpo),
  });
  if (!res.ok) {
    return manejarError(res);
  }
  return res.json() as Promise<T>;
}

/** DELETE (sin cuerpo de respuesta). */
export async function del(ruta: string): Promise<void> {
  const res = await fetch(`${API_URL}${ruta}`, {
    method: "DELETE",
    headers: encabezados(),
  });
  if (!res.ok) {
    await manejarError(res);
  }
}

/** POST multipart (subida de archivo). */
export async function postForm<T>(ruta: string, form: FormData): Promise<T> {
  const res = await fetch(`${API_URL}${ruta}`, {
    method: "POST",
    headers: encabezados(), // no fijar Content-Type: fetch pone el boundary
    body: form,
  });
  if (!res.ok) {
    return manejarError(res);
  }
  return res.json() as Promise<T>;
}
