import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GrabadorAudio } from "@/src/components/GrabadorAudio";
import { consultarAudio, consultarTexto } from "@/src/services/consulta";
import { useAuthStore } from "@/src/store/authStore";
import { useResultadoStore } from "@/src/store/resultadoStore";
import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";
import { ApiError, ConsultaResponse } from "@/src/types/api";

export default function Consulta() {
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);
  const token = useAuthStore((s) => s.token);
  const guardarResultado = useResultadoStore((s) => s.setResultado);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<ConsultaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const procesar = async (accion: () => Promise<ConsultaResponse>) => {
    setError(null);
    setResultado(null);
    setCargando(true);
    try {
      const resp = await accion();
      // Si se detectó un protocolo, los pasos se muestran en una pantalla
      // independiente. Las respuestas Q&A o "sin protocolo" se quedan en el chat.
      if (resp.tipo === "narrativa" && resp.protocolo_encontrado) {
        guardarResultado(resp);
        router.push("/protocolo" as Href);
      } else {
        setResultado(resp);
      }
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "No se pudo procesar la consulta",
      );
    } finally {
      setCargando(false);
    }
  };

  const enviarTexto = () => {
    if (texto.trim().length < 3) {
      return;
    }
    procesar(() => consultarTexto(texto.trim()));
  };

  const recibirAudio = (uri: string) => {
    procesar(() => consultarAudio(uri));
  };

  return (
    <View style={styles.flex}>
      <View style={[styles.cabecera, { paddingTop: insets.top + espaciado.md }]}>
        <View>
          <Text style={styles.logo}>SanFra</Text>
          <Text style={styles.cabeceraSub}>Primeros Auxilios</Text>
        </View>
        {token ? (
          <Pressable
            onPress={cerrarSesion}
            hitSlop={12}
            style={({ pressed }) => (pressed ? styles.presionado : null)}
          >
            <MaterialCommunityIcons name="logout" size={24} color={colors.textoTenue} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push("/login")}
            hitSlop={12}
            style={({ pressed }) => [styles.loginBtn, pressed ? styles.presionado : null]}
          >
            <MaterialCommunityIcons name="login" size={18} color={colors.sobrePrimario} />
            <Text style={styles.loginTexto}>Iniciar sesión</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.contenido,
          { paddingBottom: insets.bottom + espaciado.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.titulo}>¿Qué está pasando?</Text>
        <Text style={styles.ayuda}>
          Describe la emergencia o haz una pregunta. Puedes escribir o usar tu
          voz.
        </Text>

        {token ? null : (
          <Pressable onPress={() => router.push("/login")} style={styles.aviso}>
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color={colors.primario}
            />
            <Text style={styles.avisoTexto}>
              Inicia sesión para recibir alertas personalizadas según tu perfil
              clínico.
            </Text>
          </Pressable>
        )}

        <View style={styles.cajaTexto}>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Ej.: mi compañero se cortó la mano y está sangrando"
            placeholderTextColor={colors.textoTenue}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={enviarTexto}
            disabled={cargando}
            style={({ pressed }) => [
              styles.enviar,
              pressed ? styles.presionado : null,
            ]}
          >
            <MaterialCommunityIcons
              name="send"
              size={22}
              color={colors.sobrePrimario}
            />
          </Pressable>
        </View>

        <View style={styles.grabador}>
          <GrabadorAudio onAudioListo={recibirAudio} deshabilitado={cargando} />
        </View>

        {cargando ? (
          <View style={styles.estado}>
            <ActivityIndicator color={colors.primario} size="large" />
            <Text style={styles.estadoTexto}>Analizando la consulta…</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.estado}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={28}
              color={colors.error}
            />
            <Text style={styles.errorTexto}>{error}</Text>
          </View>
        ) : null}

        {resultado ? (
          <Resultado datos={resultado} />
        ) : null}
      </ScrollView>
    </View>
  );
}

function Resultado({ datos }: { datos: ConsultaResponse }) {
  // Esta vista solo cubre respuestas que se quedan en el chat (Q&A y
  // "sin protocolo"); los protocolos se muestran en la pantalla /protocolo.
  return (
    <View style={styles.resultado}>
      {datos.transcripcion ? (
        <View style={styles.transcripcion}>
          <MaterialCommunityIcons
            name="ear-hearing"
            size={16}
            color={colors.textoTenue}
          />
          <Text style={styles.transcripcionTexto}>
            Escuché: “{datos.transcripcion}”
          </Text>
        </View>
      ) : null}

      {datos.tipo === "pregunta" && datos.respuesta ? (
        <View style={styles.respuesta}>
          <Text style={styles.respuestaTexto}>{datos.respuesta}</Text>
        </View>
      ) : null}

      {datos.mensaje ? (
        <View style={styles.respuesta}>
          <Text style={styles.respuestaTexto}>{datos.mensaje}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  cabecera: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: espaciado.xl,
    paddingBottom: espaciado.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
  },
  logo: {
    color: colors.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: "800",
  },
  cabeceraSub: {
    color: colors.primario,
    fontSize: tipografia.pequeno,
    fontWeight: "600",
  },
  contenido: {
    padding: espaciado.xl,
    gap: espaciado.md,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  titulo: {
    color: colors.texto,
    fontSize: tipografia.titulo,
    fontWeight: "800",
  },
  ayuda: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    lineHeight: 20,
  },
  cajaTexto: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: espaciado.sm,
    marginTop: espaciado.sm,
  },
  input: {
    flex: 1,
    minHeight: 56,
    maxHeight: 140,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.md,
    paddingHorizontal: espaciado.lg,
    paddingTop: espaciado.md,
    color: colors.texto,
    fontSize: tipografia.cuerpo,
  },
  enviar: {
    width: 52,
    height: 52,
    borderRadius: radio.md,
    backgroundColor: colors.primario,
    alignItems: "center",
    justifyContent: "center",
  },
  presionado: {
    opacity: 0.8,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
    backgroundColor: colors.primario,
    borderRadius: radio.full,
    paddingVertical: espaciado.xs,
    paddingHorizontal: espaciado.md,
  },
  loginTexto: {
    color: colors.sobrePrimario,
    fontSize: tipografia.etiqueta,
    fontWeight: "700",
  },
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
    backgroundColor: colors.superficie,
    borderRadius: radio.md,
    padding: espaciado.md,
  },
  avisoTexto: {
    flex: 1,
    color: colors.textoTenue,
    fontSize: tipografia.pequeno,
    lineHeight: 16,
  },
  grabador: {
    alignItems: "center",
    marginVertical: espaciado.lg,
  },
  estado: {
    alignItems: "center",
    gap: espaciado.sm,
    paddingVertical: espaciado.xl,
  },
  estadoTexto: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
  },
  errorTexto: {
    color: colors.error,
    fontSize: tipografia.etiqueta,
    textAlign: "center",
  },
  resultado: {
    gap: espaciado.lg,
    marginTop: espaciado.sm,
  },
  transcripcion: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
    backgroundColor: colors.superficie,
    borderRadius: radio.md,
    padding: espaciado.md,
  },
  transcripcionTexto: {
    flex: 1,
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    fontStyle: "italic",
  },
  respuesta: {
    backgroundColor: colors.tarjeta,
    borderRadius: radio.md,
    padding: espaciado.lg,
  },
  respuestaTexto: {
    color: colors.texto,
    fontSize: tipografia.cuerpo,
    lineHeight: 24,
  },
});
