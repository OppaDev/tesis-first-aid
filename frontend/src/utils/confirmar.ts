import { Alert, Platform } from "react-native";

/** Confirmación multiplataforma: window.confirm en web, Alert en móvil. */
export function confirmar(titulo: string, mensaje: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensaje}`));
  }
  return new Promise((resolve) => {
    Alert.alert(titulo, mensaje, [
      { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
      { text: "Confirmar", style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}
