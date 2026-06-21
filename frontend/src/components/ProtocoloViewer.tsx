import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { API_URL } from "@/src/services/api";
import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";
import { Protocolo } from "@/src/types/api";

function urlImagen(imagen: string): string {
  if (imagen.startsWith("http")) {
    return imagen;
  }
  return `${API_URL}${imagen.startsWith("/") ? "" : "/"}${imagen}`;
}

export function ProtocoloViewer({ protocolos }: { protocolos: Protocolo[] }) {
  const porId = useMemo(() => {
    const mapa = new Map<string, Protocolo>();
    for (const p of protocolos) {
      mapa.set(p.id_protocolo, p);
    }
    return mapa;
  }, [protocolos]);

  const inicial = protocolos[0]?.id_protocolo ?? "";
  const [actualId, setActualId] = useState(inicial);
  const [historial, setHistorial] = useState<string[]>([]);

  const paso = porId.get(actualId);
  if (!paso) {
    return null;
  }

  const existe = (id: string | null | undefined): id is string =>
    !!id && id !== "NULL" && porId.has(id);

  const ir = (destino: string | null | undefined) => {
    if (!existe(destino)) return;
    setHistorial((h) => [...h, actualId]);
    setActualId(destino);
  };

  const atras = () => {
    setHistorial((h) => {
      if (h.length === 0) return h;
      const copia = [...h];
      const previo = copia.pop() as string;
      setActualId(previo);
      return copia;
    });
  };

  const reiniciar = () => {
    setHistorial([]);
    setActualId(inicial);
  };

  const esDecision = paso.es_condicion;
  const sigSi = paso.paso?.paso_siguiente ?? null;
  const sigNo = paso.paso?.paso_siguiente_no ?? null;
  const anexo = paso.paso?.anexo_si ?? null;
  const esFin = !esDecision && !existe(sigSi);

  return (
    <View style={styles.contenedor}>
      <View
        style={[styles.tarjetaPaso, esDecision ? styles.tarjetaDecision : null]}
      >
        <View style={styles.encabezado}>
          {esDecision ? (
            <View style={styles.etiquetaDecision}>
              <MaterialCommunityIcons
                name="help-circle"
                size={16}
                color={colors.sobrePrimario}
              />
              <Text style={styles.etiquetaDecisionTexto}>DECISIÓN</Text>
            </View>
          ) : (
            <View style={styles.numeroCirculo}>
              <Text style={styles.numeroTexto}>{paso.numero}</Text>
            </View>
          )}
        </View>

        <Text style={styles.instruccion}>{paso.instruccion}</Text>

        {paso.observacion ? (
          <View style={styles.observacionCaja}>
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color={colors.primario}
            />
            <Text style={styles.observacionTexto}>{paso.observacion}</Text>
          </View>
        ) : null}

        {paso.imagen ? (
          <Image
            source={{ uri: urlImagen(paso.imagen) }}
            style={styles.imagen}
            contentFit="contain"
          />
        ) : null}

        {existe(anexo) ? (
          <Pressable onPress={() => ir(anexo)} style={styles.anexo}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={16}
              color={colors.primario}
            />
            <Text style={styles.anexoTexto}>Ver anexo</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Navegación según el tipo de nodo */}
      {esDecision ? (
        <View style={styles.decision}>
          <Pressable
            onPress={() => ir(sigSi)}
            style={({ pressed }) => [
              styles.botonSi,
              pressed ? styles.presionado : null,
            ]}
          >
            <MaterialCommunityIcons name="check" size={22} color={colors.sobrePrimario} />
            <Text style={styles.botonSiTexto}>Sí</Text>
          </Pressable>
          <Pressable
            onPress={() => ir(sigNo)}
            style={({ pressed }) => [
              styles.botonNo,
              pressed ? styles.presionado : null,
            ]}
          >
            <MaterialCommunityIcons name="close" size={22} color={colors.texto} />
            <Text style={styles.botonNoTexto}>No</Text>
          </Pressable>
        </View>
      ) : esFin ? (
        <View style={styles.fin}>
          <MaterialCommunityIcons name="flag-checkered" size={20} color={colors.exito} />
          <Text style={styles.finTexto}>Fin del protocolo</Text>
        </View>
      ) : (
        <Pressable
          onPress={() => ir(sigSi)}
          style={({ pressed }) => [
            styles.botonSiguiente,
            pressed ? styles.presionado : null,
          ]}
        >
          <Text style={styles.botonSiguienteTexto}>Siguiente</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.sobrePrimario} />
        </Pressable>
      )}

      <View style={styles.secundarios}>
        {historial.length > 0 ? (
          <Pressable onPress={atras} style={styles.secundario} hitSlop={8}>
            <MaterialCommunityIcons name="chevron-left" size={18} color={colors.textoTenue} />
            <Text style={styles.secundarioTexto}>Atrás</Text>
          </Pressable>
        ) : (
          <View />
        )}
        {actualId !== inicial ? (
          <Pressable onPress={reiniciar} style={styles.secundario} hitSlop={8}>
            <MaterialCommunityIcons name="restart" size={18} color={colors.textoTenue} />
            <Text style={styles.secundarioTexto}>Reiniciar</Text>
          </Pressable>
        ) : (
          <View />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciado.md,
  },
  tarjetaPaso: {
    backgroundColor: colors.tarjeta,
    borderRadius: radio.lg,
    padding: espaciado.xl,
    gap: espaciado.lg,
    alignItems: "flex-start",
  },
  tarjetaDecision: {
    borderWidth: 1,
    borderColor: colors.primario,
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
  },
  numeroCirculo: {
    width: 40,
    height: 40,
    borderRadius: radio.full,
    backgroundColor: colors.primarioFuerte,
    alignItems: "center",
    justifyContent: "center",
  },
  numeroTexto: {
    color: colors.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: "800",
  },
  etiquetaDecision: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
    backgroundColor: colors.primario,
    borderRadius: radio.full,
    paddingVertical: espaciado.xs,
    paddingHorizontal: espaciado.md,
  },
  etiquetaDecisionTexto: {
    color: colors.sobrePrimario,
    fontSize: tipografia.pequeno,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  instruccion: {
    color: colors.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: "600",
    lineHeight: 28,
  },
  observacionCaja: {
    flexDirection: "row",
    gap: espaciado.sm,
    backgroundColor: colors.superficie,
    borderRadius: radio.md,
    padding: espaciado.md,
    alignItems: "flex-start",
  },
  observacionTexto: {
    flex: 1,
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    lineHeight: 20,
  },
  imagen: {
    width: "100%",
    height: 200,
    borderRadius: radio.md,
    backgroundColor: colors.superficie,
  },
  anexo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
  },
  anexoTexto: {
    color: colors.primario,
    fontSize: tipografia.etiqueta,
    fontWeight: "700",
  },
  decision: {
    flexDirection: "row",
    gap: espaciado.md,
  },
  botonSi: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.xs,
    borderRadius: radio.md,
    backgroundColor: colors.primario,
  },
  botonSiTexto: {
    color: colors.sobrePrimario,
    fontSize: tipografia.cuerpo,
    fontWeight: "800",
  },
  botonNo: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.xs,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  botonNoTexto: {
    color: colors.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: "700",
  },
  botonSiguiente: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.xs,
    borderRadius: radio.md,
    backgroundColor: colors.primario,
  },
  botonSiguienteTexto: {
    color: colors.sobrePrimario,
    fontSize: tipografia.cuerpo,
    fontWeight: "700",
  },
  presionado: {
    opacity: 0.85,
  },
  fin: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.sm,
    paddingVertical: espaciado.md,
  },
  finTexto: {
    color: colors.exito,
    fontSize: tipografia.cuerpo,
    fontWeight: "700",
  },
  secundarios: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secundario: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
    paddingVertical: espaciado.xs,
  },
  secundarioTexto: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    fontWeight: "600",
  },
});
