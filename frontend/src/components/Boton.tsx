import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";

interface Props {
  titulo: string;
  onPress: () => void;
  cargando?: boolean;
  variante?: "primario" | "secundario";
  deshabilitado?: boolean;
}

export function Boton({
  titulo,
  onPress,
  cargando = false,
  variante = "primario",
  deshabilitado = false,
}: Props) {
  const esPrimario = variante === "primario";
  const inactivo = deshabilitado || cargando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        styles.base,
        esPrimario ? styles.primario : styles.secundario,
        pressed ? styles.presionado : null,
        inactivo ? styles.inactivo : null,
      ]}
    >
      {cargando ? (
        <ActivityIndicator
          color={esPrimario ? colors.sobrePrimario : colors.texto}
        />
      ) : (
        <Text
          style={[
            styles.texto,
            esPrimario ? styles.textoPrimario : styles.textoSecundario,
          ]}
        >
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radio.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: espaciado.lg,
  },
  primario: {
    backgroundColor: colors.primario,
  },
  secundario: {
    backgroundColor: colors.transparente,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  presionado: {
    opacity: 0.85,
  },
  inactivo: {
    opacity: 0.5,
  },
  texto: {
    fontSize: tipografia.cuerpo,
    fontWeight: "700",
  },
  textoPrimario: {
    color: colors.sobrePrimario,
  },
  textoSecundario: {
    color: colors.texto,
  },
});
