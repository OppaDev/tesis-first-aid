import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";

interface Props {
  etiqueta: string;
  valor: Date | null;
  onChange: (fecha: Date) => void;
  maxima?: Date;
}

function formatear(d: Date): string {
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${d.getFullYear()}`;
}

export function SelectorFecha({ etiqueta, valor, onChange, maxima }: Props) {
  const [mostrar, setMostrar] = useState(false);

  const manejar = (evento: DateTimePickerEvent, fecha?: Date) => {
    if (Platform.OS === "android") {
      setMostrar(false);
    }
    if (evento.type === "set" && fecha) {
      onChange(fecha);
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>

      <Pressable
        onPress={() => setMostrar(true)}
        style={({ pressed }) => [styles.input, pressed ? styles.presionado : null]}
      >
        <Text style={[styles.texto, valor ? null : styles.placeholder]}>
          {valor ? formatear(valor) : "Seleccionar fecha"}
        </Text>
        <MaterialCommunityIcons
          name="calendar"
          size={20}
          color={colors.textoTenue}
        />
      </Pressable>

      {mostrar ? (
        <View>
          <DateTimePicker
            value={valor ?? maxima ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={maxima}
            onChange={manejar}
          />
          {Platform.OS === "ios" ? (
            <Pressable onPress={() => setMostrar(false)} style={styles.listo}>
              <Text style={styles.listoTexto}>Listo</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.md,
    paddingHorizontal: espaciado.lg,
  },
  presionado: {
    opacity: 0.85,
  },
  texto: {
    color: colors.texto,
    fontSize: tipografia.cuerpo,
  },
  placeholder: {
    color: colors.textoTenue,
  },
  listo: {
    alignSelf: "flex-end",
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.lg,
  },
  listoTexto: {
    color: colors.primario,
    fontSize: tipografia.cuerpo,
    fontWeight: "700",
  },
});
