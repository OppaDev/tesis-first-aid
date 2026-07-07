import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Boton } from "@/src/components/Boton";
import { Campo } from "@/src/components/Campo";
import { SelectorFecha } from "@/src/components/SelectorFecha";
import { useAuthStore } from "@/src/store/authStore";
import { colors, espaciado, tipografia } from "@/src/theme/theme";
import { ApiError } from "@/src/types/api";
import { passwordValida, requisitosPassword } from "@/src/utils/password";
import {
  LIMITE_EMAIL,
  LIMITE_PASSWORD,
  LIMITE_TEXTO_CORTO,
  limpiarTexto,
} from "@/src/utils/texto";

function aISO(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export default function Registro() {
  const router = useRouter();
  const registrar = useAuthStore((s) => s.registrar);

  const [cedula, setCedula] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const insets = useSafeAreaInsets();

  // Validación de contraseña en tiempo real
  const requisitos = requisitosPassword(password);
  const passwordOk = passwordValida(password);
  const passwordsCoinciden = password.length > 0 && password === confirmar;
  const mostrarNoCoinciden = confirmar.length > 0 && password !== confirmar;

  const enviar = async () => {
    if (!fechaNacimiento) {
      setError("Selecciona tu fecha de nacimiento.");
      return;
    }
    if (fechaNacimiento >= new Date()) {
      setError("La fecha de nacimiento debe ser anterior a hoy.");
      return;
    }
    if (!passwordOk) {
      setError("La contraseña no cumple los requisitos.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setError(null);
    setCargando(true);
    try {
      await registrar({
        cedula: cedula.trim(),
        nombres: limpiarTexto(nombres),
        apellidos: limpiarTexto(apellidos),
        fecha_nacimiento: aISO(fechaNacimiento),
        email: email.trim(),
        password,
      });
      router.replace("/");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo crear la cuenta");
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.contenido,
          { paddingTop: insets.top + espaciado.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.marca}>
          <Text style={styles.logo}>Crear cuenta</Text>
          <Text style={styles.subtitulo}>SanFra · Primeros Auxilios</Text>
        </View>

        <View style={styles.formulario}>
          <Campo
            etiqueta="Cédula"
            value={cedula}
            onChangeText={setCedula}
            keyboardType="number-pad"
            placeholder="0123456789"
            maxLength={10}
          />
          <Campo
            etiqueta="Nombres"
            value={nombres}
            onChangeText={setNombres}
            placeholder="Tus nombres"
            maxLength={LIMITE_TEXTO_CORTO}
          />
          <Campo
            etiqueta="Apellidos"
            value={apellidos}
            onChangeText={setApellidos}
            placeholder="Tus apellidos"
            maxLength={LIMITE_TEXTO_CORTO}
          />
          <SelectorFecha
            etiqueta="Fecha de nacimiento"
            valor={fechaNacimiento}
            onChange={setFechaNacimiento}
            maxima={new Date()}
          />
          <Campo
            etiqueta="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="usuario@correo.com"
            maxLength={LIMITE_EMAIL}
          />
          <View>
            <Campo
              etiqueta="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Mínimo 8 caracteres"
              maxLength={LIMITE_PASSWORD}
            />
            {password.length > 0 ? (
              <View style={styles.requisitos}>
                {requisitos.map((r) => (
                  <View key={r.etiqueta} style={styles.requisito}>
                    <MaterialCommunityIcons
                      name={r.cumple ? "check-circle" : "close-circle"}
                      size={14}
                      color={r.cumple ? colors.exito : colors.error}
                    />
                    <Text
                      style={[
                        styles.requisitoTexto,
                        { color: r.cumple ? colors.exito : colors.textoTenue },
                      ]}
                    >
                      {r.etiqueta}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
          <View>
            <Campo
              etiqueta="Confirmar contraseña"
              value={confirmar}
              onChangeText={setConfirmar}
              secureTextEntry
              placeholder="Repite la contraseña"
              maxLength={LIMITE_PASSWORD}
              returnKeyType="go"
              onSubmitEditing={enviar}
            />
            {mostrarNoCoinciden ? (
              <Text style={styles.pista}>Las contraseñas no coinciden</Text>
            ) : passwordsCoinciden ? (
              <Text style={styles.pistaOk}>Las contraseñas coinciden</Text>
            ) : null}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Boton
            titulo="Registrarme"
            onPress={enviar}
            cargando={cargando}
            deshabilitado={!passwordOk || !passwordsCoinciden}
          />

          <View style={styles.piePagina}>
            <Text style={styles.pieTexto}>¿Ya tienes cuenta? </Text>
            <Link href="/login" style={styles.enlace}>
              Inicia sesión
            </Link>
          </View>
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
    paddingBottom: espaciado.xxl * 2,
    gap: espaciado.xl,
  },
  marca: {
    alignItems: "center",
    gap: espaciado.xs,
  },
  logo: {
    color: colors.texto,
    fontSize: tipografia.titulo,
    fontWeight: "800",
  },
  subtitulo: {
    color: colors.secundario,
    fontSize: tipografia.etiqueta,
    fontWeight: "600",
  },
  formulario: {
    gap: espaciado.lg,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  requisitos: {
    marginTop: espaciado.sm,
    gap: espaciado.xs,
  },
  requisito: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
  },
  requisitoTexto: {
    fontSize: tipografia.pequeno,
  },
  pista: {
    color: colors.error,
    fontSize: tipografia.pequeno,
    marginTop: espaciado.xs,
  },
  pistaOk: {
    color: colors.exito,
    fontSize: tipografia.pequeno,
    marginTop: espaciado.xs,
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
});
