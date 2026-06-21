import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";

export interface ColumnaTabla<T> {
  titulo: string;
  flex: number;
  render: (fila: T) => ReactNode;
  alinear?: "flex-start" | "flex-end" | "center";
}

interface Props<T> {
  columnas: ColumnaTabla<T>[];
  datos: T[];
  keyExtractor: (fila: T) => string;
  vacioTexto?: string;
}

export function Tabla<T>({
  columnas,
  datos,
  keyExtractor,
  vacioTexto = "Sin registros",
}: Props<T>) {
  return (
    <View style={styles.contenedor}>
      <View style={[styles.fila, styles.encabezado]}>
        {columnas.map((c, i) => (
          <View
            key={i}
            style={[styles.celda, { flex: c.flex, alignItems: c.alinear ?? "flex-start" }]}
          >
            <Text style={styles.encabezadoTexto}>{c.titulo}</Text>
          </View>
        ))}
      </View>

      <ScrollView>
        {datos.length === 0 ? (
          <Text style={styles.vacio}>{vacioTexto}</Text>
        ) : (
          datos.map((fila, idx) => (
            <View
              key={keyExtractor(fila)}
              style={[styles.fila, idx % 2 === 1 ? styles.filaAlterna : null]}
            >
              {columnas.map((c, i) => (
                <View
                  key={i}
                  style={[
                    styles.celda,
                    { flex: c.flex, alignItems: c.alinear ?? "flex-start" },
                  ]}
                >
                  {c.render(fila)}
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.tarjeta,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colors.borde,
    overflow: "hidden",
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
    gap: espaciado.md,
  },
  encabezado: {
    backgroundColor: colors.superficie,
  },
  filaAlterna: {
    backgroundColor: colors.superficie,
  },
  celda: {
    justifyContent: "center",
  },
  encabezadoTexto: {
    color: colors.textoTenue,
    fontSize: tipografia.pequeno,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  vacio: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    textAlign: "center",
    padding: espaciado.xl,
  },
});
