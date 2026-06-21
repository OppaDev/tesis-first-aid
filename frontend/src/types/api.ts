/** Tipos espejo de los DTOs del backend (FastAPI). */

// --- Auth ---
export interface RegistroRequest {
  cedula: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string; // YYYY-MM-DD
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UsuarioResponse {
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  id_rol: number | null;
}

// --- Consulta ---
export interface Paso {
  paso_siguiente: string | null;
  paso_siguiente_no: string | null;
  anexo_si: string | null;
  anexo_no: string | null;
}

export interface Protocolo {
  id_protocolo: string;
  numero: number;
  instruccion: string;
  observacion: string | null;
  imagen: string | null;
  es_condicion: boolean;
  paso: Paso | null;
}

export type Severidad = "critica" | "alta" | "media" | "baja";

export interface Alerta {
  nombre_condicion: string;
  mensaje: string;
  severidad: Severidad | string;
  detalle: string | null;
}

export type TipoConsulta = "pregunta" | "narrativa";

export interface ConsultaResponse {
  tipo: TipoConsulta | string;
  transcripcion?: string | null;
  emergencia_detectada?: string | null;
  protocolo_encontrado: boolean;
  protocolos: Protocolo[];
  alertas: Alerta[];
  respuesta?: string | null;
  mensaje?: string | null;
}

// --- Catálogo de condiciones ---
export interface CondicionCatalogo {
  id_condicion: number;
  nombre_condicion: string;
  descripcion_condicion: string;
}

export interface CategoriaConCondiciones {
  id_categoria: number;
  nombre_categoria: string;
  condiciones: CondicionCatalogo[];
}

// --- Perfil clínico ---
export interface CondicionInput {
  id_condicion: number;
  detalle: string | null;
}

export interface PerfilRequest {
  genero: string;
  tipo_sangre: string;
  altura_cm: number;
  peso_kg: number;
  condiciones: CondicionInput[];
}

export interface CondicionPerfil {
  id_condicion: number;
  nombre_condicion: string;
  descripcion_condicion: string;
  id_categoria: number | null;
  detalle: string | null;
}

export interface PerfilResponse {
  id_perfil: number;
  genero: string;
  tipo_sangre: string;
  altura_cm: number;
  peso_kg: number;
  imc: number | null;
  condiciones: CondicionPerfil[];
}

// --- Admin: emergencias (catálogo para crear reglas) ---
export interface EmergenciaItem {
  id_emergencia: string;
  nombre_emergencia: string;
  etiqueta: string;
  severidad: string;
}

// --- Admin: reglas del motor de alertas ---
export interface ReglaAlertaRequest {
  id_condicion: number;
  id_emergencia: string;
  mensaje: string;
  severidad: Severidad | string;
}

export interface ReglaAlertaResponse {
  id_regla: number;
  id_condicion: number;
  id_emergencia: string;
  mensaje: string;
  severidad: string;
}

// --- Admin: catálogo de condiciones ---
export interface CondicionAdminRequest {
  nombre_condicion: string;
  descripcion_condicion: string;
  id_categoria: number | null;
}

export interface CondicionAdminResponse {
  id_condicion: number;
  nombre_condicion: string;
  descripcion_condicion: string;
  id_categoria: number | null;
}

// --- Admin: usuarios ---
export interface UsuarioAdmin {
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  id_rol: number | null;
  nombre_rol: string | null;
}

/** Error normalizado de la API (campo `detail` de FastAPI). */
export class ApiError extends Error {
  status: number;
  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
  }
}
