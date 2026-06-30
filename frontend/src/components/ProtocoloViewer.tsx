import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { VOZ_IDIOMA, VOZ_VELOCIDAD } from "@/src/config/voz";
import { IMAGENES_PROTOCOLOS } from "@/src/data/imagenesProtocolos";
import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";
import { Protocolo } from "@/src/types/api";

// Nombre legible del anexo según el prefijo de su id (los protocolos son fijos
// por la Regla de Oro). Sirve para distinguir anexos cuyo primer paso es igual
// (p. ej. RCP adulto vs bebé comparten "Llame al 911").
const NOMBRES_ANEXO: { prefijo: string; nombre: string }[] = [
  { prefijo: "RCPA", nombre: "RCP adulto" },
  { prefijo: "RCPB", nombre: "RCP bebé" },
  { prefijo: "TQ", nombre: "Torniquete" },
  { prefijo: "HA", nombre: "Atragantamiento (adulto)" },
];

function nombreAnexo(id: string): string {
  const m = NOMBRES_ANEXO.find((n) => id.startsWith(n.prefijo));
  return m ? m.nombre : "Guía complementaria";
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
  const [vozActiva, setVozActiva] = useState(true);
  // Paso del flujo principal desde el que se entró a un anexo (para volver).
  const [retorno, setRetorno] = useState<string | null>(null);

  // Al recibir un protocolo nuevo (otra consulta), reiniciar la navegación:
  // los ids del protocolo anterior ya no existen en el nuevo mapa.
  useEffect(() => {
    setActualId(inicial);
    setHistorial([]);
    setRetorno(null);
  }, [protocolos, inicial]);

  const paso = porId.get(actualId);

  // Texto a leer en voz alta: instrucción + observación (si la hay).
  const textoVoz = paso
    ? [paso.instruccion, paso.observacion].filter(Boolean).join(". ")
    : "";

  // Auto-lectura de cada paso al mostrarse (si la voz está activa).
  useEffect(() => {
    Speech.stop();
    if (vozActiva && textoVoz) {
      Speech.speak(textoVoz, { language: VOZ_IDIOMA, rate: VOZ_VELOCIDAD });
    }
  }, [actualId, vozActiva, textoVoz]);

  // Detener la lectura al perder el foco la pantalla (volver al chat, cambiar
  // de pestaña). La pantalla vive en un Tab y no se desmonta, por eso no basta
  // con el cleanup de montaje: hay que reaccionar al blur.
  useFocusEffect(
    useCallback(() => {
      return () => {
        Speech.stop();
      };
    }, []),
  );

  if (!paso) {
    return null;
  }

  const alternarVoz = () => {
    if (vozActiva) {
      Speech.stop();
      setVozActiva(false);
    } else {
      setVozActiva(true); // el efecto se encarga de leer
    }
  };

  const repetir = () => {
    Speech.stop();
    if (textoVoz) {
      Speech.speak(textoVoz, { language: VOZ_IDIOMA, rate: VOZ_VELOCIDAD });
    }
  };

  const existe = (id: string | null | undefined): id is string =>
    !!id && id !== "NULL" && porId.has(id);

  const ir = (destino: string | null | undefined) => {
    if (!existe(destino)) return;
    setHistorial((h) => [...h, actualId]);
    setActualId(destino);
  };

  // Entrar a un anexo: recuerda el paso actual del flujo principal para poder
  // regresar a él cuando el rescatista termine (o cancele) el anexo.
  const irAnexo = (destino: string) => {
    setRetorno(actualId);
    ir(destino);
  };

  const volverAlProtocolo = () => {
    if (!retorno) return;
    setActualId(retorno);
    setRetorno(null);
  };

  const atras = () => {
    setHistorial((h) => {
      if (h.length === 0) return h;
      const copia = [...h];
      const previo = copia.pop() as string;
      if (previo === retorno) setRetorno(null);
      setActualId(previo);
      return copia;
    });
  };

  const reiniciar = () => {
    setHistorial([]);
    setRetorno(null);
    setActualId(inicial);
  };

  const esDecision = paso.es_condicion;
  const sigSi = paso.paso?.paso_siguiente ?? null;
  const sigNo = paso.paso?.paso_siguiente_no ?? null;
  // Un paso puede tener uno o varios anexos (sub-protocolos). NO es una decisión
  // sí/no: las dos columnas guardan anexos distintos (p. ej. RCP adulto y bebé).
  const anexos = [paso.paso?.anexo_si, paso.paso?.anexo_no].filter(existe);
  const enAnexo = retorno !== null && actualId !== retorno;
  const esFin = !esDecision && !existe(sigSi);
  const fuenteImagen = paso.imagen ? IMAGENES_PROTOCOLOS[paso.imagen] : undefined;

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

          <View style={styles.controlesVoz}>
            {vozActiva ? (
              <Pressable onPress={repetir} hitSlop={10} style={styles.botonVoz}>
                <MaterialCommunityIcons
                  name="replay"
                  size={22}
                  color={colors.primario}
                />
              </Pressable>
            ) : null}
            <Pressable onPress={alternarVoz} hitSlop={10} style={styles.botonVoz}>
              <MaterialCommunityIcons
                name={vozActiva ? "volume-high" : "volume-off"}
                size={22}
                color={vozActiva ? colors.primario : colors.textoTenue}
              />
            </Pressable>
          </View>
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

        {fuenteImagen ? (
          <Image
            source={fuenteImagen}
            style={styles.imagen}
            contentFit="contain"
          />
        ) : null}

      </View>

      {/* Anexos: sub-protocolos opcionales. Botón destacado para que no se
          confunda con la información del paso. */}
      {anexos.map((idAnexo) => (
        <Pressable
          key={idAnexo}
          onPress={() => irAnexo(idAnexo)}
          style={({ pressed }) => [
            styles.anexoBoton,
            pressed ? styles.presionado : null,
          ]}
        >
          <View style={styles.anexoIcono}>
            <MaterialCommunityIcons
              name="medical-bag"
              size={22}
              color={colors.sobrePrimario}
            />
          </View>
          <View style={styles.anexoInfo}>
            <Text style={styles.anexoEtiqueta}>VER ANEXO</Text>
            <Text style={styles.anexoNombre}>{nombreAnexo(idAnexo)}</Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={colors.primario}
          />
        </Pressable>
      ))}

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

      {enAnexo ? (
        <Pressable
          onPress={volverAlProtocolo}
          style={({ pressed }) => [
            styles.volverProtocolo,
            pressed ? styles.presionado : null,
          ]}
        >
          <MaterialCommunityIcons name="arrow-u-left-top" size={18} color={colors.primario} />
          <Text style={styles.volverProtocoloTexto}>Volver al protocolo</Text>
        </Pressable>
      ) : null}

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
    justifyContent: "space-between",
    alignSelf: "stretch",
  },
  controlesVoz: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
  },
  botonVoz: {
    padding: espaciado.xs,
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
    color: colors.sobrePrimario,
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
    backgroundColor: colors.fondo,
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
  anexoBoton: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    backgroundColor: colors.superficie,
    borderWidth: 1.5,
    borderColor: colors.primario,
    borderRadius: radio.md,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.lg,
  },
  anexoIcono: {
    width: 40,
    height: 40,
    borderRadius: radio.full,
    backgroundColor: colors.primario,
    alignItems: "center",
    justifyContent: "center",
  },
  anexoInfo: {
    flex: 1,
    gap: 2,
  },
  anexoEtiqueta: {
    color: colors.primario,
    fontSize: tipografia.pequeno,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  anexoNombre: {
    color: colors.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: "800",
  },
  volverProtocolo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.xs,
    height: 48,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colors.primario,
  },
  volverProtocoloTexto: {
    color: colors.primario,
    fontSize: tipografia.cuerpo,
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
