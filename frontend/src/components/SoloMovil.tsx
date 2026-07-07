import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Boton } from "@/src/components/Boton";
import { useAuthStore } from "@/src/store/authStore";
import { colors, espaciado, tipografia } from "@/src/theme/theme";

/**
 * Aviso mostrado en la web cuando se intenta acceder a la consulta de
 * emergencia: esa funcionalidad vive en la app móvil; el panel web es
 * únicamente de gestión y administración.
 */
export function SoloMovil() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  return (
    <View style={styles.centro}>
      <MaterialCommunityIcons
        name="cellphone-text"
        size={56}
        color={colors.primario}
      />
      <Text style={styles.titulo}>Disponible en la app móvil</Text>
      <Text style={styles.texto}>
        La consulta de emergencia por voz o texto se realiza desde la
        aplicación móvil SanFra. Este panel web es para la gestión de tu
        cuenta, tu perfil clínico y la administración del sistema.
      </Text>
      <Boton
        titulo={token ? "Ir a mi perfil" : "Iniciar sesión"}
        onPress={() => router.replace(token ? "/perfil" : "/login")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.lg,
    padding: espaciado.xxl,
    backgroundColor: colors.fondo,
  },
  titulo: {
    color: colors.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: "700",
    textAlign: "center",
  },
  texto: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 420,
  },
});
