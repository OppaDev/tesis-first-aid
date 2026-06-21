import {
  del,
  getJson,
  patchJson,
  postJson,
  putJson,
} from "@/src/services/api";
import {
  CondicionAdminRequest,
  CondicionAdminResponse,
  ReglaAlertaRequest,
  ReglaAlertaResponse,
  UsuarioAdmin,
} from "@/src/types/api";

// --- Reglas del motor de alertas ---
export function listarReglas(): Promise<ReglaAlertaResponse[]> {
  return getJson<ReglaAlertaResponse[]>("/admin/reglas");
}

export function crearRegla(
  datos: ReglaAlertaRequest,
): Promise<ReglaAlertaResponse> {
  return postJson<ReglaAlertaResponse>("/admin/reglas", datos);
}

export function actualizarRegla(
  idRegla: number,
  datos: ReglaAlertaRequest,
): Promise<ReglaAlertaResponse> {
  return putJson<ReglaAlertaResponse>(`/admin/reglas/${idRegla}`, datos);
}

export function eliminarRegla(idRegla: number): Promise<void> {
  return del(`/admin/reglas/${idRegla}`);
}

// --- Catálogo: condiciones ---
export function crearCondicion(
  datos: CondicionAdminRequest,
): Promise<CondicionAdminResponse> {
  return postJson<CondicionAdminResponse>("/admin/condiciones", datos);
}

export function actualizarCondicion(
  idCondicion: number,
  datos: CondicionAdminRequest,
): Promise<CondicionAdminResponse> {
  return putJson<CondicionAdminResponse>(`/admin/condiciones/${idCondicion}`, datos);
}

export function eliminarCondicion(idCondicion: number): Promise<void> {
  return del(`/admin/condiciones/${idCondicion}`);
}

// --- Usuarios ---
export function listarUsuarios(): Promise<UsuarioAdmin[]> {
  return getJson<UsuarioAdmin[]>("/admin/usuarios");
}

export function cambiarRol(
  cedula: string,
  idRol: number,
): Promise<UsuarioAdmin> {
  return patchJson<UsuarioAdmin>(`/admin/usuarios/${cedula}/rol`, {
    id_rol: idRol,
  });
}
