import { Href, Redirect } from "expo-router";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

import { ID_ROL_ADMIN, useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/theme/theme";

export default function Index() {
  const hidratado = useAuthStore((s) => s.hidratado);
  const token = useAuthStore((s) => s.token);
  const rol = useAuthStore((s) => s.rol);

  if (!hidratado) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={colors.primario} size="large" />
      </View>
    );
  }

  // El admin va al panel en cualquier plataforma.
  if (token && rol === ID_ROL_ADMIN) {
    return <Redirect href={"/reglas" as Href} />;
  }

  // La web es solo de gestión: arranca en el login y el usuario común va a su
  // perfil (la consulta de emergencia vive en la app móvil).
  if (Platform.OS === "web") {
    return token ? <Redirect href="/perfil" /> : <Redirect href="/login" />;
  }

  // Móvil: todos (incluido el anónimo) entran directo a la consulta —
  // en una emergencia no se exige iniciar sesión.
  return <Redirect href="/consulta" />;
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.fondo,
  },
});
