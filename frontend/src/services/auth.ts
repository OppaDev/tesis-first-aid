import { postJson } from "@/src/services/api";
import {
  LoginRequest,
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
