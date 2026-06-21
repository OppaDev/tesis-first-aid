import { Href, Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

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

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <Redirect href={(rol === ID_ROL_ADMIN ? "/reglas" : "/consulta") as Href} />;
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.fondo,
  },
});
