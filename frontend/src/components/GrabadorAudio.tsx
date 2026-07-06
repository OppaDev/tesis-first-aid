import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useGrabadorAudio } from "@/src/hooks/useGrabadorAudio";
import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";

interface Props {
  onAudioListo: (uri: string) => void;
  deshabilitado?: boolean;
}

function formatoDuracion(ms: number): string {
  const totalSeg = Math.floor(ms / 1000);
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${min}:${seg.toString().padStart(2, "0")}`;
}

export function GrabadorAudio({ onAudioListo, deshabilitado = false }: Props) {
  const { grabando, duracionMs, iniciar, detener } = useGrabadorAudio();

  const alternar = async () => {
    if (grabando) {
      const uri = await detener();
      if (uri) {
        onAudioListo(uri);
      }
      return;
    }
    await iniciar();
  };

  return (
    <View style={styles.contenedor}>
      <Pressable
        onPress={alternar}
        disabled={deshabilitado}
        style={({ pressed }) => [
          styles.boton,
          grabando ? styles.botonGrabando : null,
          deshabilitado ? styles.inactivo : null,
          pressed ? styles.presionado : null,
        ]}
      >
        <MaterialCommunityIcons
          name={grabando ? "stop" : "microphone"}
          size={32}
          color={grabando ? colors.texto : colors.sobrePrimario}
        />
      </Pressable>
      <Text style={styles.ayuda}>
        {grabando
          ? `Grabando ${formatoDuracion(duracionMs)} — toca para enviar`
          : "Presiona una vez para grabar tu emergencia y presiona nuevamente para enviar"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    gap: espaciado.sm,
  },
  boton: {
    width: 72,
    height: 72,
    borderRadius: radio.full,
    backgroundColor: colors.primario,
    alignItems: "center",
    justifyContent: "center",
  },
  botonGrabando: {
    backgroundColor: colors.critica,
  },
  inactivo: {
    opacity: 0.5,
  },
  presionado: {
    opacity: 0.85,
  },
  ayuda: {
    color: colors.textoTenue,
    fontSize: tipografia.pequeno,
    textAlign: "center",
  },
});
