import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";

interface Props extends TextInputProps {
  etiqueta: string;
}

export function Campo({ etiqueta, style, ...rest }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        placeholderTextColor={colors.textoTenue}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciado.xs,
  },
  etiqueta: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    fontWeight: "600",
  },
  input: {
    height: 52,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.md,
    paddingHorizontal: espaciado.lg,
    color: colors.texto,
    fontSize: tipografia.cuerpo,
  },
});
