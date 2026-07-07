import { API_URL, getJson, postJson, putJson } from "@/src/services/api";
import {
  ActualizarCuentaRequest,
  LoginRequest,
  MiCuentaResponse,
  RegistroRequest,
  TokenResponse,
  UsuarioResponse,
} from "@/src/types/api";

export function login(datos: LoginRequest): Promise<TokenResponse> {
  return postJson<TokenResponse>("/auth/login", datos);
}

export function registro(datos: RegistroRequest): Promise<UsuarioResponse> {
  return postJson<UsuarioResponse>("/auth/registro", datos);
}

/** Datos de cuenta del usuario autenticado. */
export function obtenerCuenta(): Promise<MiCuentaResponse> {
  return getJson<MiCuentaResponse>("/auth/me");
}

/** Actualiza nombres, apellidos y correo del propio usuario. */
export function actualizarCuenta(
  datos: ActualizarCuentaRequest,
): Promise<MiCuentaResponse> {
  return putJson<MiCuentaResponse>("/auth/me", datos);
}

export function cambiarPassword(
  passwordActual: string,
  passwordNueva: string,
): Promise<TokenResponse> {
  return postJson<TokenResponse>("/auth/cambiar-password", {
    password_actual: passwordActual,
    password_nueva: passwordNueva,
  });
}

/**
 * Cierra la sesión en el servidor (revoca los JWT vigentes del usuario).
 * Es "best-effort": usa el token explícito y silencia cualquier error de red
 * para que el cierre local de sesión nunca se bloquee ni falle.
 */
export async function logout(token: string): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // sin conexión: la sesión local se cierra igual
  }
}
