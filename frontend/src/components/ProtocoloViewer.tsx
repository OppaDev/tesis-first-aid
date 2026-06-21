import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { API_URL } from "@/src/services/api";
import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";
import { Protocolo } from "@/src/types/api";

function urlImagen(imagen: string): string {
  if (imagen.startsWith("http")) {
    return imagen;
  }
  return `${API_URL}${imagen.startsWith("/") ? "" : "/"}${imagen}`;
}

export function ProtocoloViewer({ protocolos }: { protocolos: Protocolo[] }) {
  const [indice, setIndice] = useState(0);
  const total = protocolos.length;
  const paso = protocolos[indice];

  const esPrimero = indice === 0;
  const esUltimo = indice === total - 1;

  return (
    <View style={styles.contenedor}>
      <View style={styles.progresoFila}>
        <Text style={styles.progresoTexto}>
          Paso {indice + 1} de {total}
        </Text>
      </View>

      <View style={styles.tarjetaPaso}>
        <View style={styles.numeroCirculo}>
          <Text style={styles.numeroTexto}>{paso.numero}</Text>
        </View>

        <Text style={styles.instruccion}>{paso.instruccion}</Text>

        {paso.observacion ? (
          <View style={styles.observacionCaja}>
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color={colors.primario}
            />
            <Text style={styles.observacionTexto}>{paso.observacion}</Text>
          </View>
        ) : null}

        {paso.imagen ? (
          <Image
            source={{ uri: urlImagen(paso.imagen) }}
            style={styles.imagen}
            contentFit="contain"
          />
        ) : null}
      </View>

      <View style={styles.navegacion}>
        <Pressable
          onPress={() => setIndice((i) => i - 1)}
          disabled={esPrimero}
          style={({ pressed }) => [
            styles.navBoton,
            esPrimero ? styles.navInactivo : null,
            pressed ? styles.navPresionado : null,
          ]}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={22}
            color={colors.texto}
          />
          <Text style={styles.navTexto}>Anterior</Text>
        </Pressable>

        <Pressable
          onPress={() => setIndice((i) => i + 1)}
          disabled={esUltimo}
          style={({ pressed }) => [
            styles.navBoton,
            styles.navBotonPrimario,
            esUltimo ? styles.navInactivo : null,
            pressed ? styles.navPresionado : null,
          ]}
        >
          <Text style={styles.navTextoPrimario}>Siguiente</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.sobrePrimario}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciado.md,
  },
  progresoFila: {
    flexDirection: "row",
    justifyContent: "center",
  },
  progresoTexto: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    fontWeight: "600",
  },
  tarjetaPaso: {
    backgroundColor: colors.tarjeta,
    borderRadius: radio.lg,
    padding: espaciado.xl,
    gap: espaciado.lg,
    alignItems: "flex-start",
  },
  numeroCirculo: {
    width: 40,
    height: 40,
    borderRadius: radio.full,
    backgroundColor: colors.primarioFuerte,
    alignItems: "center",
    justifyContent: "center",
  },
  numeroTexto: {
    color: colors.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: "800",
  },
  instruccion: {
    color: colors.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: "600",
    lineHeight: 28,
  },
  observacionCaja: {
    flexDirection: "row",
    gap: espaciado.sm,
    backgroundColor: colors.superficie,
    borderRadius: radio.md,
    padding: espaciado.md,
    alignItems: "flex-start",
  },
  observacionTexto: {
    flex: 1,
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    lineHeight: 20,
  },
  imagen: {
    width: "100%",
    height: 200,
    borderRadius: radio.md,
    backgroundColor: colors.superficie,
  },
  navegacion: {
    flexDirection: "row",
    gap: espaciado.md,
  },
  navBoton: {
    flex: 1,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.xs,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  navBotonPrimario: {
    backgroundColor: colors.primario,
    borderColor: colors.primario,
  },
  navInactivo: {
    opacity: 0.4,
  },
  navPresionado: {
    opacity: 0.8,
  },
  navTexto: {
    color: colors.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: "600",
  },
  navTextoPrimario: {
    color: colors.sobrePrimario,
    fontSize: tipografia.cuerpo,
    fontWeight: "700",
  },
});
