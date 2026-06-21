import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";

interface Props {
  offset: number;
  limit: number;
  total: number;
  onCambiar: (nuevoOffset: number) => void;
}

export function Paginador({ offset, limit, total, onCambiar }: Props) {
  const desde = total === 0 ? 0 : offset + 1;
  const hasta = Math.min(offset + limit, total);
  const hayAnterior = offset > 0;
  const haySiguiente = offset + limit < total;

  return (
    <View style={styles.fila}>
      <Text style={styles.info}>
        {desde}–{hasta} de {total}
      </Text>
      <View style={styles.botones}>
        <Pressable
          disabled={!hayAnterior}
          onPress={() => onCambiar(Math.max(0, offset - limit))}
          style={[styles.boton, hayAnterior ? null : styles.inactivo]}
        >
          <MaterialCommunityIcons name="chevron-left" size={18} color={colors.texto} />
          <Text style={styles.botonTexto}>Anterior</Text>
        </Pressable>
        <Pressable
          disabled={!haySiguiente}
          onPress={() => onCambiar(offset + limit)}
          style={[styles.boton, haySiguiente ? null : styles.inactivo]}
        >
          <Text style={styles.botonTexto}>Siguiente</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.texto} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: espaciado.sm,
    paddingTop: espaciado.md,
  },
  info: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
  },
  botones: {
    flexDirection: "row",
    gap: espaciado.sm,
  },
  boton: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.md,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.md,
  },
  inactivo: {
    opacity: 0.4,
  },
  botonTexto: {
    color: colors.texto,
    fontSize: tipografia.etiqueta,
    fontWeight: "600",
  },
});
