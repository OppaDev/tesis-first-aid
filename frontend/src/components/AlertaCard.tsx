import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colorSeveridad, colors, espaciado, radio, tipografia } from "@/src/theme/theme";
import { Alerta } from "@/src/types/api";

type NombreIcono = keyof typeof MaterialCommunityIcons.glyphMap;

const ICONO: Record<string, NombreIcono> = {
  critica: "alert-octagon",
  alta: "alert",
  media: "alert-circle",
  baja: "information",
};

export function AlertaCard({ alerta }: { alerta: Alerta }) {
  const color = colorSeveridad(alerta.severidad);
  const icono = ICONO[alerta.severidad] ?? "information";

  return (
    <View style={[styles.tarjeta, { borderLeftColor: color }]}>
      <View style={styles.encabezado}>
        <MaterialCommunityIcons name={icono} size={20} color={color} />
        <Text style={[styles.condicion]} numberOfLines={1}>
          {alerta.nombre_condicion}
        </Text>
        <Text style={[styles.badge, { color }]}>
          {String(alerta.severidad).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.mensaje}>{alerta.mensaje}</Text>
      {alerta.detalle ? (
        <Text style={styles.detalle}>Detalle: {alerta.detalle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.tarjeta,
    borderRadius: radio.md,
    borderLeftWidth: 4,
    padding: espaciado.lg,
    gap: espaciado.sm,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
  },
  condicion: {
    flex: 1,
    color: colors.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: "700",
  },
  badge: {
    fontSize: tipografia.pequeno,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  mensaje: {
    color: colors.texto,
    fontSize: tipografia.etiqueta,
    lineHeight: 20,
  },
  detalle: {
    color: colors.textoTenue,
    fontSize: tipografia.pequeno,
    fontStyle: "italic",
  },
});
