import { del, getJson, postJson, putJson } from "@/src/services/api";
import { PerfilRequest, PerfilResponse } from "@/src/types/api";

export function obtenerPerfil(): Promise<PerfilResponse> {
  return getJson<PerfilResponse>("/perfil");
}

export function crearPerfil(datos: PerfilRequest): Promise<PerfilResponse> {
  return postJson<PerfilResponse>("/perfil", datos);
}

export function actualizarPerfil(datos: PerfilRequest): Promise<PerfilResponse> {
  return putJson<PerfilResponse>("/perfil", datos);
}

export function eliminarPerfil(): Promise<void> {
  return del("/perfil");
}
