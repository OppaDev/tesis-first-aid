import { jwtDecode } from "jwt-decode";
import { create } from "zustand";

import { setAuthToken } from "@/src/services/api";
import { login as apiLogin, registro as apiRegistro } from "@/src/services/auth";
import { borrarItem, guardarItem, leerItem } from "@/src/services/storage";
import { LoginRequest, RegistroRequest } from "@/src/types/api";

const TOKEN_KEY = "sanfra_token";
export const ID_ROL_ADMIN = 1;

interface Claims {
  sub?: string;
  rol?: number | null;
  exp?: number;
}

function leerClaims(token: string): Claims | null {
  try {
    return jwtDecode<Claims>(token);
  } catch {
    return null;
  }
}

function expirado(c: Claims): boolean {
  return !!c.exp && c.exp * 1000 < Date.now();
}

interface AuthState {
  token: string | null;
  rol: number | null;
  hidratado: boolean;
  hidratar: () => Promise<void>;
  iniciarSesion: (datos: LoginRequest) => Promise<void>;
  registrar: (datos: RegistroRequest) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

async function persistir(token: string): Promise<number | null> {
  await guardarItem(TOKEN_KEY, token);
  setAuthToken(token);
  return leerClaims(token)?.rol ?? null;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  rol: null,
  hidratado: false,

  hidratar: async () => {
    const token = await leerItem(TOKEN_KEY);
    const claims = token ? leerClaims(token) : null;
    if (!token || !claims || expirado(claims)) {
      if (token) {
        await borrarItem(TOKEN_KEY);
      }
      setAuthToken(null);
      set({ token: null, rol: null, hidratado: true });
      return;
    }
    setAuthToken(token);
    set({ token, rol: claims.rol ?? null, hidratado: true });
  },

  iniciarSesion: async (datos) => {
    const { access_token } = await apiLogin(datos);
    const rol = await persistir(access_token);
    set({ token: access_token, rol });
  },

  registrar: async (datos) => {
    await apiRegistro(datos);
    const { access_token } = await apiLogin({
      email: datos.email,
      password: datos.password,
    });
    const rol = await persistir(access_token);
    set({ token: access_token, rol });
  },

  cerrarSesion: async () => {
    await borrarItem(TOKEN_KEY);
    setAuthToken(null);
    set({ token: null, rol: null });
  },
}));
