import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Boton } from "@/src/components/Boton";
import { Campo } from "@/src/components/Campo";
import { useAuthStore } from "@/src/store/authStore";
import { colors, espaciado, tipografia } from "@/src/theme/theme";
import { ApiError } from "@/src/types/api";

export default function Login() {
  const router = useRouter();
  const iniciarSesion = useAuthStore((s) => s.iniciarSesion);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    setError(null);
    setCargando(true);
    try {
      await iniciarSesion({ email: email.trim(), password });
      router.replace("/"); // index redirige según el rol (admin → panel, usuario → consulta)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.contenido,
          { paddingTop: insets.top + espaciado.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.marca}>
          <Text style={styles.logo}>SanFra</Text>
          <Text style={styles.subtitulo}>Primeros Auxilios</Text>
        </View>

        <View style={styles.formulario}>
          <Campo
            etiqueta="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="usuario@correo.com"
          />
          <Campo
            etiqueta="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Tu contraseña"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Boton titulo="Iniciar sesión" onPress={enviar} cargando={cargando} />

          <View style={styles.piePagina}>
            <Text style={styles.pieTexto}>¿No tienes cuenta? </Text>
            <Link href="/registro" style={styles.enlace}>
              Regístrate
            </Link>
          </View>

          <Pressable onPress={() => router.replace("/consulta")} hitSlop={8}>
            <Text style={styles.continuar}>Continuar sin iniciar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  contenido: {
    flexGrow: 1,
    paddingHorizontal: espaciado.xl,
    paddingBottom: espaciado.xxl,
    gap: espaciado.xxl,
  },
  marca: {
    alignItems: "center",
    gap: espaciado.xs,
    marginTop: espaciado.xxl,
  },
  logo: {
    color: colors.texto,
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  subtitulo: {
    color: colors.primario,
    fontSize: tipografia.cuerpo,
    fontWeight: "600",
  },
  formulario: {
    gap: espaciado.lg,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  error: {
    color: colors.error,
    fontSize: tipografia.etiqueta,
  },
  piePagina: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: espaciado.sm,
  },
  pieTexto: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
  },
  enlace: {
    color: colors.primario,
    fontSize: tipografia.etiqueta,
    fontWeight: "700",
  },
  continuar: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    fontWeight: "600",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});

