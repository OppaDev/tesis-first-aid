import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ComponentProps, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";

type NombreIcono = ComponentProps<typeof MaterialCommunityIcons>["name"];

interface Props {
  icono: NombreIcono;
  /** Nombre visible de la acción: caption bajo el icono o texto del tooltip. */
  etiqueta: string;
  onPress: () => void;
  color?: string;
  size?: number;
  /**
   * "texto": muestra la etiqueta bajo el icono (headers, barras con espacio).
   * "tooltip": burbuja con la etiqueta al pasar el cursor (web) o mantener
   * presionado (móvil); para filas compactas de tablas.
   */
  modo?: "texto" | "tooltip";
  deshabilitado?: boolean;
  /** Estilo extra del botón (p. ej. fondo circular). */
  estilo?: StyleProp<ViewStyle>;
}

/**
 * Botón de icono con nombre siempre accesible: como caption visible o como
 * tooltip. Además expone la etiqueta a lectores de pantalla.
 */
export function BotonIcono({
  icono,
  etiqueta,
  onPress,
  color = colors.textoTenue,
  size = 22,
  modo = "tooltip",
  deshabilitado = false,
  estilo,
}: Props) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  // En móvil el tooltip aparece con pulsación larga y se oculta solo.
  const mostrarTemporal = () => {
    if (temporizador.current) {
      clearTimeout(temporizador.current);
    }
    setTooltipVisible(true);
    temporizador.current = setTimeout(() => setTooltipVisible(false), 1800);
  };

  return (
    <View style={styles.envoltura}>
      {modo === "tooltip" && tooltipVisible ? (
        <View style={styles.tooltip} pointerEvents="none">
          <Text style={styles.tooltipTexto} numberOfLines={1}>
            {etiqueta}
          </Text>
        </View>
      ) : null}
      <Pressable
        onPress={onPress}
        disabled={deshabilitado}
        hitSlop={8}
        onHoverIn={
          Platform.OS === "web" && modo === "tooltip"
            ? () => setTooltipVisible(true)
            : undefined
        }
        onHoverOut={
          Platform.OS === "web" && modo === "tooltip"
            ? () => setTooltipVisible(false)
            : undefined
        }
        onLongPress={
          Platform.OS !== "web" && modo === "tooltip" ? mostrarTemporal : undefined
        }
        accessibilityRole="button"
        accessibilityLabel={etiqueta}
        style={({ pressed }) => [
          styles.boton,
          deshabilitado ? styles.inactivo : null,
          pressed ? styles.presionado : null,
          estilo,
        ]}
      >
        <MaterialCommunityIcons name={icono} size={size} color={color} />
        {modo === "texto" ? (
          <Text style={[styles.caption, { color }]} numberOfLines={1}>
            {etiqueta}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  envoltura: {
    position: "relative",
    alignItems: "center",
  },
  boton: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  caption: {
    fontSize: 11,
    fontWeight: "600",
  },
  tooltip: {
    position: "absolute",
    bottom: "100%",
    marginBottom: espaciado.xs,
    backgroundColor: colors.texto,
    borderRadius: radio.sm,
    paddingHorizontal: espaciado.sm,
    paddingVertical: 3,
    zIndex: 20,
    elevation: 4,
  },
  tooltipTexto: {
    color: colors.superficie,
    fontSize: tipografia.pequeno,
  },
  inactivo: {
    opacity: 0.5,
  },
  presionado: {
    opacity: 0.7,
  },
});
