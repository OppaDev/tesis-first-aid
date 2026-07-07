import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";

import { Boton } from "@/src/components/Boton";
import { Campo } from "@/src/components/Campo";
import { LIMITE_PASSWORD } from "@/src/utils/texto";
import { useAuthStore } from "@/src/store/authStore";
import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";
import { ApiError } from "@/src/types/api";
import { passwordValida, requisitosPassword } from "@/src/utils/password";

interface Props {
  visible: boolean;
  onClose: () => void;
  onExito?: () => void;
}

export function CambiarPasswordModal({ visible, onClose, onExito }: Props) {
  const cambiarPassword = useAuthStore((s) => s.cambiarPassword);

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const requisitos = requisitosPassword(nueva);
  const nuevaOk = passwordValida(nueva);
  const coinciden = nueva.length > 0 && nueva === confirmar;
  const mostrarNoCoinciden = confirmar.length > 0 && nueva !== confirmar;
  const puedeGuardar = actual.length > 0 && nuevaOk && coinciden;

  const limpiar = () => {
    setActual("");
    setNueva("");
    setConfirmar("");
    setError(null);
  };

  const cerrar = () => {
    limpiar();
    onClose();
  };

  const guardar = async () => {
    if (!puedeGuardar) return;
    setError(null);
    setGuardando(true);
    try {
      await cambiarPassword(actual, nueva);
      limpiar();
      onExito?.();
      onClose();
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "No se pudo cambiar la contraseña",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cerrar}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.titulo}>Cambiar contraseña</Text>

          <ScrollView contentContainerStyle={styles.form}>
            <Campo
              etiqueta="Contraseña actual"
              value={actual}
              onChangeText={setActual}
              secureTextEntry
              placeholder="Tu contraseña actual"
              maxLength={LIMITE_PASSWORD}
              returnKeyType="next"
            />

            <View>
              <Campo
                etiqueta="Nueva contraseña"
                value={nueva}
                onChangeText={setNueva}
                secureTextEntry
                placeholder="Mínimo 8 caracteres"
                maxLength={LIMITE_PASSWORD}
                returnKeyType="next"
              />
              {nueva.length > 0 ? (
                <View style={styles.requisitos}>
                  {requisitos.map((r) => (
                    <View key={r.etiqueta} style={styles.requisito}>
                      <MaterialCommunityIcons
                        name={r.cumple ? "check-circle" : "close-circle"}
                        size={14}
                        color={r.cumple ? colors.exito : colors.error}
                      />
                      <Text
                        style={[
                          styles.requisitoTexto,
                          { color: r.cumple ? colors.exito : colors.textoTenue },
                        ]}
                      >
                        {r.etiqueta}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            <View>
              <Campo
                etiqueta="Confirmar nueva contraseña"
                value={confirmar}
                onChangeText={setConfirmar}
                secureTextEntry
                placeholder="Repite la nueva contraseña"
                maxLength={LIMITE_PASSWORD}
                returnKeyType="go"
                onSubmitEditing={() => {
                  if (puedeGuardar) {
                    guardar();
                  }
                }}
              />
              {mostrarNoCoinciden ? (
                <Text style={styles.pista}>Las contraseñas no coinciden</Text>
              ) : coinciden ? (
                <Text style={styles.pistaOk}>Las contraseñas coinciden</Text>
              ) : null}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.acciones}>
            <Boton titulo="Cancelar" variante="secundario" onPress={cerrar} />
            <Boton
              titulo="Guardar"
              onPress={guardar}
              cargando={guardando}
              deshabilitado={!puedeGuardar}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: espaciado.xl,
  },
  card: {
    backgroundColor: colors.superficie,
    borderRadius: radio.lg,
    padding: espaciado.lg,
    gap: espaciado.md,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    maxHeight: "90%",
  },
  titulo: { color: colors.texto, fontSize: tipografia.subtitulo, fontWeight: "800" },
  form: { gap: espaciado.md, paddingVertical: espaciado.xs },
  requisitos: { marginTop: espaciado.sm, gap: espaciado.xs },
  requisito: { flexDirection: "row", alignItems: "center", gap: espaciado.xs },
  requisitoTexto: { fontSize: tipografia.pequeno },
  pista: { color: colors.error, fontSize: tipografia.pequeno, marginTop: espaciado.xs },
  pistaOk: { color: colors.exito, fontSize: tipografia.pequeno, marginTop: espaciado.xs },
  error: { color: colors.error, fontSize: tipografia.etiqueta },
  acciones: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: espaciado.sm,
  },
});
