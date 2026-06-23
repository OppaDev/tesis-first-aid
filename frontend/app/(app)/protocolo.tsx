import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AlertaCard } from "@/src/components/AlertaCard";
import { ProtocoloViewer } from "@/src/components/ProtocoloViewer";
import { useResultadoStore } from "@/src/store/resultadoStore";
import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";

export default function Protocolo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const datos = useResultadoStore((s) => s.resultado);

  // Sin resultado en memoria (p. ej. recarga directa) → volver al chat.
  if (!datos) {
    return <Redirect href="/consulta" />;
  }

  return (
    <View style={styles.flex}>
      <View style={[styles.cabecera, { paddingTop: insets.top + espaciado.md }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.volver,
            pressed ? styles.presionado : null,
          ]}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={26}
            color={colors.texto}
          />
          <Text style={styles.volverTexto}>Nueva consulta</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.contenido,
          { paddingBottom: insets.bottom + espaciado.xxl },
        ]}
      >
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

        {/* Las alertas del perfil van ARRIBA: son la información más crítica. */}
        {datos.alertas.length > 0 ? (
          <View style={styles.alertas}>
            <Text style={styles.alertasTitulo}>Alertas para tu perfil</Text>
            {datos.alertas.map((a, i) => (
              <AlertaCard key={`${a.nombre_condicion}-${i}`} alerta={a} />
            ))}
          </View>
        ) : null}

        {datos.emergencia_detectada ? (
          <View style={styles.emergencia}>
            <MaterialCommunityIcons
              name="medical-bag"
              size={20}
              color={colors.primario}
            />
            <Text style={styles.emergenciaTexto}>
              {datos.emergencia_detectada}
            </Text>
          </View>
        ) : null}

        <ProtocoloViewer protocolos={datos.protocolos} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  cabecera: {
    paddingHorizontal: espaciado.xl,
    paddingBottom: espaciado.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
  },
  volver: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
    alignSelf: "flex-start",
  },
  volverTexto: {
    color: colors.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: "700",
  },
  presionado: {
    opacity: 0.8,
  },
  contenido: {
    padding: espaciado.xl,
    gap: espaciado.lg,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
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
  alertas: {
    gap: espaciado.md,
  },
  alertasTitulo: {
    color: colors.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: "700",
  },
  emergencia: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
  },
  emergenciaTexto: {
    color: colors.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: "700",
  },
});
