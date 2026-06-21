import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Almacenamiento de credenciales multiplataforma.
 * En móvil usa expo-secure-store (cifrado); en web usa localStorage
 * (secure-store no existe en web).
 */

export async function guardarItem(clave: string, valor: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(clave, valor);
    return;
  }
  await SecureStore.setItemAsync(clave, valor);
}

export async function leerItem(clave: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(clave);
  }
  return SecureStore.getItemAsync(clave);
}

export async function borrarItem(clave: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(clave);
    return;
  }
  await SecureStore.deleteItemAsync(clave);
}
