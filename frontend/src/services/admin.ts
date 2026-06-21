import {
  del,
  getJson,
  patchJson,
  postJson,
  putJson,
} from "@/src/services/api";
import {
  ActualizarUsuarioRequest,
  CategoriaAdminRequest,
  CategoriaAdminResponse,
  CondicionAdminRequest,
  CondicionAdminResponse,
  CrearUsuarioRequest,
  Pagina,
  ReglaAlertaRequest,
  ReglaAlertaResponse,
  UsuarioAdmin,
} from "@/src/types/api";

// --- Reglas del motor de alertas ---
export function listarReglas(
  limit: number,
  offset: number,
): Promise<Pagina<ReglaAlertaResponse>> {
  return getJson<Pagina<ReglaAlertaResponse>>(
    `/admin/reglas?limit=${limit}&offset=${offset}`,
  );
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

// --- Catálogo: categorías ---
export function crearCategoria(
  datos: CategoriaAdminRequest,
): Promise<CategoriaAdminResponse> {
  return postJson<CategoriaAdminResponse>("/admin/categorias", datos);
}

export function actualizarCategoria(
  idCategoria: number,
  datos: CategoriaAdminRequest,
): Promise<CategoriaAdminResponse> {
  return putJson<CategoriaAdminResponse>(`/admin/categorias/${idCategoria}`, datos);
}

export function eliminarCategoria(idCategoria: number): Promise<void> {
  return del(`/admin/categorias/${idCategoria}`);
}

// --- Usuarios ---
export function listarUsuarios(
  limit: number,
  offset: number,
): Promise<Pagina<UsuarioAdmin>> {
  return getJson<Pagina<UsuarioAdmin>>(
    `/admin/usuarios?limit=${limit}&offset=${offset}`,
  );
}

export function cambiarRol(
  cedula: string,
  idRol: number,
): Promise<UsuarioAdmin> {
  return patchJson<UsuarioAdmin>(`/admin/usuarios/${cedula}/rol`, {
    id_rol: idRol,
  });
}

export function crearUsuario(datos: CrearUsuarioRequest): Promise<UsuarioAdmin> {
  return postJson<UsuarioAdmin>("/admin/usuarios", datos);
}

export function actualizarUsuario(
  cedula: string,
  datos: ActualizarUsuarioRequest,
): Promise<UsuarioAdmin> {
  return putJson<UsuarioAdmin>(`/admin/usuarios/${cedula}`, datos);
}

export function eliminarUsuario(cedula: string): Promise<void> {
  return del(`/admin/usuarios/${cedula}`);
}
