import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/theme/theme";

export default function Index() {
  const hidratado = useAuthStore((s) => s.hidratado);
  const token = useAuthStore((s) => s.token);

  if (!hidratado) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={colors.primario} size="large" />
      </View>
    );
  }

  return <Redirect href={token ? "/consulta" : "/login"} />;
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.fondo,
  },
});
