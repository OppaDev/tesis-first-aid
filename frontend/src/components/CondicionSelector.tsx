import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";
import { CategoriaConCondiciones } from "@/src/types/api";

interface Props {
  catalogo: CategoriaConCondiciones[];
  // mapa id_condicion -> detalle (su presencia indica que está seleccionada)
  seleccion: Record<number, string>;
  onToggle: (idCondicion: number) => void;
  onDetalle: (idCondicion: number, detalle: string) => void;
}

export function CondicionSelector({
  catalogo,
  seleccion,
  onToggle,
  onDetalle,
}: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Condiciones médicas</Text>
      <Text style={styles.ayuda}>
        Marca las que apliquen. Puedes añadir un detalle personal a cada una.
      </Text>

      {catalogo.map((categoria) => (
        <View key={categoria.id_categoria} style={styles.categoria}>
          <Text style={styles.categoriaNombre}>{categoria.nombre_categoria}</Text>

          {categoria.condiciones.map((condicion) => {
            const seleccionada = condicion.id_condicion in seleccion;
            return (
              <View key={condicion.id_condicion} style={styles.condicionBloque}>
                <Pressable
                  onPress={() => onToggle(condicion.id_condicion)}
                  style={({ pressed }) => [
                    styles.fila,
                    pressed ? styles.presionado : null,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      seleccionada
                        ? "checkbox-marked"
                        : "checkbox-blank-outline"
                    }
                    size={24}
                    color={seleccionada ? colors.primario : colors.textoTenue}
                  />
                  <Text style={styles.condicionNombre}>
                    {condicion.nombre_condicion}
                  </Text>
                </Pressable>

                {seleccionada ? (
                  <TextInput
                    value={seleccion[condicion.id_condicion]}
                    onChangeText={(t) => onDetalle(condicion.id_condicion, t)}
                    placeholder="Detalle (opcional): ej. tipo, medicación, desde cuándo"
                    placeholderTextColor={colors.textoTenue}
                    style={styles.detalle}
                    multiline
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciado.sm,
  },
  titulo: {
    color: colors.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: "700",
  },
  ayuda: {
    color: colors.textoTenue,
    fontSize: tipografia.pequeno,
    marginBottom: espaciado.sm,
  },
  categoria: {
    gap: espaciado.xs,
    marginTop: espaciado.md,
  },
  categoriaNombre: {
    color: colors.primario,
    fontSize: tipografia.etiqueta,
    fontWeight: "700",
    marginBottom: espaciado.xs,
  },
  condicionBloque: {
    gap: espaciado.sm,
    paddingVertical: espaciado.xs,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
  },
  presionado: {
    opacity: 0.7,
  },
  condicionNombre: {
    flex: 1,
    color: colors.texto,
    fontSize: tipografia.cuerpo,
  },
  detalle: {
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.md,
    paddingHorizontal: espaciado.md,
    paddingTop: espaciado.sm,
    paddingBottom: espaciado.sm,
    minHeight: 44,
    marginLeft: espaciado.xl,
    color: colors.texto,
    fontSize: tipografia.etiqueta,
  },
});
