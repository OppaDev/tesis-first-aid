import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";

interface Props {
  etiqueta: string;
  opciones: readonly string[];
  valor: string;
  onChange: (valor: string) => void;
}

export function Selector({ etiqueta, opciones, valor, onChange }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <View style={styles.fila}>
        {opciones.map((op) => {
          const activo = op === valor;
          return (
            <Pressable
              key={op}
              onPress={() => onChange(op)}
              style={({ pressed }) => [
                styles.chip,
                activo ? styles.chipActivo : null,
                pressed ? styles.presionado : null,
              ]}
            >
              <Text style={[styles.chipTexto, activo ? styles.chipTextoActivo : null]}>
                {op}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciado.sm,
  },
  etiqueta: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    fontWeight: "600",
  },
  fila: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaciado.sm,
  },
  chip: {
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.lg,
    borderRadius: radio.full,
    borderWidth: 1,
    borderColor: colors.borde,
    backgroundColor: colors.superficie,
  },
  chipActivo: {
    backgroundColor: colors.primario,
    borderColor: colors.primario,
  },
  presionado: {
    opacity: 0.8,
  },
  chipTexto: {
    color: colors.texto,
    fontSize: tipografia.etiqueta,
    fontWeight: "600",
  },
  chipTextoActivo: {
    color: colors.sobrePrimario,
    fontWeight: "700",
  },
});
