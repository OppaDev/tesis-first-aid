import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

import { setAuthToken } from "@/src/services/api";
import { login as apiLogin, registro as apiRegistro } from "@/src/services/auth";
import { LoginRequest, RegistroRequest } from "@/src/types/api";

const TOKEN_KEY = "sanfra_token";

interface AuthState {
  token: string | null;
  hidratado: boolean; // true cuando ya se leyó el token persistido al iniciar
  hidratar: () => Promise<void>;
  iniciarSesion: (datos: LoginRequest) => Promise<void>;
  registrar: (datos: RegistroRequest) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

async function guardarToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  setAuthToken(token);
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  hidratado: false,

  hidratar: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    setAuthToken(token);
    set({ token, hidratado: true });
  },

  iniciarSesion: async (datos) => {
    const { access_token } = await apiLogin(datos);
    await guardarToken(access_token);
    set({ token: access_token });
  },

  registrar: async (datos) => {
    await apiRegistro(datos);
    // Auto-login tras un registro exitoso.
    const { access_token } = await apiLogin({
      email: datos.email,
      password: datos.password,
    });
    await guardarToken(access_token);
    set({ token: access_token });
  },

  cerrarSesion: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthToken(null);
    set({ token: null });
  },
}));
